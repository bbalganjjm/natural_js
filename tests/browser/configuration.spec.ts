// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RuleSet } from "../../src/ui/index.js";
import type { PageContext } from "../../src/page/index.js";

const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { data: source("../../src/data/index.ts"), ui: source("../../src/ui/index.ts"), comm: source("../../src/comm/index.ts"), page: source("../../src/page/index.ts") };

for (const kind of ["grid", "list", "tree"] as const) {
  test(`${kind} keeps one subscribed Rows identity after options replacement, including colliding IDs and disposal`, async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(async ({ modules, kind }) => {
      const { createRows } = await import(modules.data), { bindGrid, bindList, bindTree } = await import(modules.ui);
      const one = createRows([{ label: "A", key: "node", parent: null }]), two = createRows([{ label: "B", key: "node", parent: null }]);
      const id = one.entries()[0].id, otherId = two.entries()[0].id, selected: string[] = []; let reads = 0;
      function root() {
        const element = document.createElement(kind === "grid" ? "table" : "ul");
        element.innerHTML = kind === "grid" ? '<caption>Rows scope</caption><thead><tr><th scope="col">Label</th></tr></thead><tbody><tr data-row-template><td><input data-field="label"><button type="button" data-select-row>Select</button></td></tr></tbody>' :
          kind === "list" ? '<li data-row-template><span data-field="label"></span><button type="button" data-select-row>Select</button></li>' :
            '<li data-row-template><span data-tree-label data-field="label"></span><ul data-tree-children></ul></li>';
        if (kind === "tree") element.setAttribute("aria-label", "Scoped rows"); document.body.append(element); return element;
      }
      const options = { get rows() { reads++; return one; }, key: (row: { key: string }) => row.key,
        parent: (row: { parent: null }) => row.parent, onSelect: ({ row }: { row: { value: { label: string } } | null }) => { if (row) selected.push(row.value.label); } };
      const bind = kind === "grid" ? bindGrid : kind === "list" ? bindList : bindTree;
      const a = root(), b = root(), first = bind(a, options), second = bind(b, Object.freeze({ rows: two, key: options.key, parent: options.parent }));
      const constructorReads = reads;
      Object.defineProperty(options, "rows", { value: two });
      one.set(id, "label", "A changed"); two.set(otherId, "label", "B changed");
      const text = (element: HTMLElement) => { const field = element.querySelector<HTMLElement>('[data-field="label"]')!; return field instanceof HTMLInputElement ? field.value : field.textContent; };
      const displays = [text(a), text(b)]; first.select(id);
      let edits: string[] | null = null;
      if (kind === "grid") {
        const input = a.querySelector<HTMLInputElement>('input[data-field="label"]')!; input.value = "A edited"; input.dispatchEvent(new Event("change", { bubbles: true }));
        first.setChecked([id]); edits = [one.get(id).value.label, two.get(otherId).value.label];
      }
      first.dispose(); const disposedMarkup = a.innerHTML;
      one.set(id, "label", "A closed"); two.set(otherId, "label", "B live");
      const isolated = a.innerHTML === disposedMarkup && text(b) === "B live"; second.dispose(); a.remove(); b.remove();
      return { colliding: id === otherId, constructorReads, displays, selected, edits, isolated };
    }, { modules, kind });
    expect(result).toEqual({ colliding: true, constructorReads: 1, displays: ["A changed", "B changed"], selected: ["A changed"],
      edits: kind === "grid" ? ["A edited", "B changed"] : null, isolated: true });
  });
}

test("two ordinary scopes distinguish literal and live Forms, forwarding services and identity-owned native Maps", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async modules => {
    const { createRows } = await import(modules.data), { bindForm } = await import(modules.ui), { createCommunicator } = await import(modules.comm), { mountPage } = await import(modules.page);
    const scopes = ["one", "two"].map(key => ({ key, locale: "en_US", messages: {} as Record<string, string>,
      formatter: { prefix: key + ":", run(value: string) { return this.prefix + value; } }, rows: createRows([{ name: "", value: "start" }]),
      handles: new Map<string, { dispose(): void } | undefined>(),
      service: createCommunicator({ baseURL: new URL("https://" + key + ".test/"), send: async (request: Request) => new Response(JSON.stringify(request.url)) }) }));
    const callbacks: unknown[] = [];
    function form(scope: typeof scopes[number], live: boolean, root: HTMLFormElement, page: PageContext) {
      const rules: RuleSet = { locale: live ? function(this: unknown) { "use strict"; callbacks.push(this); return scope.locale; } : scope.locale,
        messages: live ? function(this: unknown) { "use strict"; callbacks.push(this); return scope.messages; } : scope.messages,
        format: { mark: value => scope.formatter.run(value) } };
      const handle = bindForm(root, { rows: scope.rows, rules }); handle.bind(scope.rows.entries()[0].id);
      const close = () => { if (scope.handles.get("detail") === handle) scope.handles.delete("detail"); handle.dispose(); };
      page.own(close); return { root, handle, close };
    }
    const hosts = scopes.map(() => document.createElement("div")); document.body.append(...hosts);
    const forms: { live: ReturnType<typeof form>; fixed: ReturnType<typeof form> }[] = [];
    const pages = scopes.map((scope, index) => mountPage(hosts[index], {
      view: () => { const root = document.createElement("section");
        const fields = '<label>Name<input data-field="name" data-validate=\'[["required"]]\'></label><output data-error-for="name"></output><span data-field="value" data-format=\'[["mark"]]\'></span>';
        root.innerHTML = '<form data-live>' + fields + '</form><form data-fixed>' + fields + '</form>'; return root; },
      controller(page: PageContext) { return { init() {
        page.own(() => scope.rows.dispose());
        const pair = { live: form(scope, true, page.root.querySelector<HTMLFormElement>("[data-live]")!, page),
          fixed: form(scope, false, page.root.querySelector<HTMLFormElement>("[data-fixed]")!, page) };
        forms[index] = pair; scope.handles.set("detail", pair.live.handle); scope.handles.set("optional", undefined);
      } }; }
    }));
    await Promise.all(pages.map(page => page.ready));
    const messages = () => forms.flatMap(pair => [pair.live.handle.validate().issues[0].message, pair.fixed.handle.validate().issues[0].message]);
    const initial = messages(); scopes[0].locale = "ko_KR"; const changed = messages();
    scopes[0].messages.required = "<em>Scoped override</em>"; const override = forms[0].live.handle.validate().issues[0].message;
    const inert = forms[0].live.root.querySelector("em") === null && forms[0].live.root.querySelector("output")!.textContent === override;
    scopes[0].formatter = { prefix: "new:", run(value) { return this.prefix + value; } };
    scopes[0].rows.set(scopes[0].rows.entries()[0].id, "value", "next");
    const displays = forms.flatMap(pair => [pair.live.root.querySelector("span")!.textContent, pair.fixed.root.querySelector("span")!.textContent]);
    const forwards = scopes.map(scope => () => scope.service.request({ url: "row" })), urlsBefore = await Promise.all(forwards.map(run => run()));
    scopes[0].service = createCommunicator({ baseURL: new URL("https://updated.test/"), send: async (request: Request) => new Response(JSON.stringify(request.url)) });
    const urlsAfter = await Promise.all(forwards.map(run => run()));
    scopes[0].handles.set("detail", forms[0].fixed.handle); forms[0].live.close();
    const mapOwnership = scopes[0].handles.get("detail") === forms[0].fixed.handle && scopes[1].handles.get("detail") === forms[1].live.handle &&
      scopes[0].handles.has("optional") && scopes[0].handles.get("optional") === undefined && !scopes[0].handles.has("missing");
    const keys = scopes.map(scope => [...scope.handles.keys()]);
    await pages[0].dispose();
    const firstClosed = pages[0].root === null && !scopes[0].handles.has("detail");
    scopes[1].rows.set(scopes[1].rows.entries()[0].id, "value", "survives");
    const siblingAlive = pages[1].root?.isConnected === true && forms[1].live.root.querySelector("span")!.textContent === "two:survives" &&
      scopes[1].handles.get("detail") === forms[1].live.handle;
    await pages[1].dispose(); const finalClosed = pages[1].root === null && scopes.every(scope => !scope.handles.has("detail"));
    hosts.forEach(host => host.remove());
    return { initial, changed, override, inert, displays, urlsBefore, urlsAfter, mapOwnership, keys,
      pageCleanup: { firstClosed, siblingAlive, finalClosed }, plain: callbacks.every(value => value === undefined) };
  }, modules);
  expect(result).toEqual({ initial: Array(4).fill("This field is required."),
    changed: ["필수 입력 항목이야.", "This field is required.", "This field is required.", "This field is required."],
    override: "<em>Scoped override</em>", inert: true, displays: ["new:next", "new:next", "two:start", "two:start"],
    urlsBefore: ["https://one.test/row", "https://two.test/row"], urlsAfter: ["https://updated.test/row", "https://two.test/row"],
    mapOwnership: true, keys: [["detail", "optional"], ["detail", "optional"]], pageCleanup: { firstClosed: true, siblingAlive: true, finalClosed: true }, plain: true });
});

test("invalid live Form policy throws locally and leaves the same owner disposable", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message)); await page.goto("/");
  const result = await page.evaluate(async modules => {
    const { bindForm } = await import(modules.ui), root = document.createElement("form");
    root.innerHTML = '<input data-field="name" data-validate=\'[["required"]]\'>'; document.body.append(root);
    let invalid = false;
    const rules = { locale: () => "en_US", messages: () => invalid ? Promise.reject(new Error("Async policy")) : {} } as unknown as RuleSet;
    const form = bindForm(root, { rules }); const before = form.validate().issues[0].message; invalid = true;
    let code = "none"; try { form.validate(); } catch (cause) { code = (cause as { code: string }).code; }
    invalid = false; const recovered = form.validate().issues[0].message === before; form.dispose(); root.remove(); await Promise.resolve();
    return { code, recovered, disconnected: !root.isConnected };
  }, modules);
  expect(result).toEqual({ code: "RULE_FAILED", recovered: true, disconnected: true }); expect(errors).toEqual([]);
});
