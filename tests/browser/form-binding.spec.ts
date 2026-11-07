// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RowId, Rows, RowsEvent } from "../../src/data/index.js";
import type { FormBindContext, FormHandle } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindSelect } from "../../src/ui/select.js";

type Item = { name: string; note: string; count: number; flag: boolean; tags: string[]; choice: number | null;
  choices: { label: string; value: number }[]; profile: { label: string }; hidden: { token: string } };
type Options = NonNullable<Parameters<typeof bindForm<Item>>[1]>;
type Owner = { root: HTMLFormElement; form: FormHandle<Item> };
type Failure = { code: string; api?: string; detail?: Readonly<Record<string, unknown>>; cause?: unknown };

declare global {
  interface Window {
    formBinding: {
      api: { bindForm: typeof bindForm; bindSelect: typeof bindSelect }; rows: Rows<Item>; ids: readonly RowId[];
      root(html: string): HTMLFormElement;
      make(html: string, options?: Partial<Options>, id?: RowId | null): Owner;
      input(root: ParentNode, field?: string): HTMLInputElement;
      edit(input: HTMLInputElement, value: string): void;
      error(action: () => void): Failure | null;
    };
  }
}

const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm, bindSelect }, { createRows }] = await Promise.all([import(modules.ui), import(modules.data)]);
    const first: Item = { name: "Ada", note: "One", count: 1200, flag: false, tags: ["a"], choice: 1,
      choices: [{ label: "First", value: 1 }, { label: "Second", value: 2 }], profile: { label: "Primary" }, hidden: { token: "unbound" } };
    const rows: Rows<Item> = createRows([first, { ...first, name: "Beatrice", note: "Two", count: 2400, flag: true }]);
    const h: Window["formBinding"] = {
      api: { bindForm, bindSelect }, rows, ids: rows.entries().map(row => row.id),
      root(html) { const root = document.createElement("form"); root.innerHTML = html; document.body.append(root); return root; },
      make(html, options = {}, id = h.ids[0]) { const root = h.root(html), form = bindForm(root, { rows, ...options }); form.bind(id); return { root, form }; },
      input: (root, field = "name") => root.querySelector<HTMLInputElement>(`input[data-field="${field}"]`)!,
      edit(input, value) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); },
      error(action) { try { action(); return null; } catch (cause) { return cause as Failure; } }
    }; window.formBinding = h;
  }, modules);
});

test("whole Form hooks surround field projection and expose immutable full raw context without treating false as a veto", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, root = h.root('<span data-field="note">Authored note</span><input data-field="name" value="Authored name">');
    const calls: string[] = [], contexts: unknown[] = [], source = h.rows.get(h.ids[0]);
    const inspect = (context: FormBindContext<Item>) => ({ root: context.root === root, id: context.row.id, event: context.event,
      raw: context.row.value.name, unbound: context.row.value.hidden.token, status: context.row.status,
      frozen: Object.isFrozen(context) && Object.isFrozen(context.row) && Object.isFrozen(context.row.value) && Object.isFrozen(context.row.value.hidden),
      mutationRejected: !Reflect.set(context.row.value.hidden, "token", "changed") });
    const form = h.api.bindForm(root, { rows: h.rows,
      beforeBind(context) { calls.push("before"); contexts.push([inspect(context), h.input(root).value]); return false; },
      beforeBindValue(value, context) { calls.push("beforeValue:" + context.field); if (context.field === "name") return `${value}!`; },
      onBindValue(_value, context) { calls.push("afterValue:" + context.field); },
      onBind(context) { calls.push("after"); contexts.push([inspect(context), h.input(root).value]); return false; }
    });
    const construction = [...calls]; form.bind(h.ids[0]);
    return { construction, calls, contexts, raw: form.read(), unchanged: h.rows.get(h.ids[0]) === source && h.rows.changes().length === 0 };
  });
  expect(result.construction).toEqual([]);
  expect(result.calls).toEqual(["before", "beforeValue:note", "afterValue:note", "beforeValue:name", "afterValue:name", "after"]);
  expect(result.contexts).toEqual([
    [{ root: true, id: 1, event: null, raw: "Ada", unbound: "unbound", status: "clean", frozen: true, mutationRejected: true }, "Authored name"],
    [{ root: true, id: 1, event: null, raw: "Ada", unbound: "unbound", status: "clean", frozen: true, mutationRejected: true }, "Ada!"]
  ]);
  expect(result.raw).toEqual({ note: "One", name: "Ada" });
  expect(result.unchanged).toBe(true);
});

test("full Form refresh forces explicit value cycles while selecting every field suppresses whole hooks", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, calls: string[] = [];
    const owner = h.make('<span data-field="name"></span><span data-field="note"></span>', {
      beforeBind: () => { calls.push("before"); }, onBind: () => { calls.push("after"); },
      beforeBindValue(_value, context) { calls.push(context.field + ":" + context.phase); }
    });
    calls.length = 0; owner.form.bind(h.ids[0]); const bound = [...calls];
    calls.length = 0; owner.form.refresh(); const full = [...calls];
    calls.length = 0; owner.form.refresh(["note", "name", "name"]); const selected = [...calls];
    calls.length = 0; owner.form.refresh([]);
    return { bound, full, selected, empty: calls, raw: owner.form.read() };
  });
  expect(result).toEqual({ bound: ["before", "name:bind", "note:bind", "after"], full: ["before", "name:bind", "note:bind", "after"],
    selected: ["name:bind", "note:bind"], empty: [], raw: { name: "Ada", note: "One" } });
});

test("whole hook option errors reject before root Select or accessibility ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding;
    return [{ beforeBind: false, rows: h.rows }, { onBind: null, rows: h.rows }, { beforeBind: 1, rows: h.rows },
      { onBind: () => {}, rows: undefined }, { beforeBind: () => {}, rows: undefined }].map(options => {
      const root = h.root('<input data-field="name" aria-invalid="false"><output data-error-for="name">Authored</output>' +
        '<select data-field="choice"><option value="a">A</option></select>');
      const before = root.innerHTML, node = root.firstChild;
      const error = h.error(() => h.api.bindForm(root, options as unknown as Options));
      const unchanged = root.innerHTML === before && root.firstChild === node;
      const select = h.api.bindSelect(root.querySelector("select")!, { choices: [{ value: "a", label: "A" }] }); select.dispose();
      const retry = h.api.bindForm(root); retry.dispose();
      return { code: error?.code, unchanged };
    });
  });
  expect(result).toEqual(Array.from({ length: 5 }, () => ({ code: "FORM_BIND", unchanged: true })));
});

test("a failing before hook preserves the previous row view draft and visible errors before a later retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding; let fail = false;
    const owner = h.make('<input data-field="name" required><output data-error-for="name"></output>', {
      beforeBind() { if (fail) throw new Error("Before failed"); }
    });
    h.edit(h.input(owner.root), "");
    const before = { value: h.input(owner.root).value, error: owner.root.querySelector("output")!.textContent, raw: owner.form.read() };
    fail = true; const error = h.error(() => owner.form.bind(h.ids[1]));
    const after = { value: h.input(owner.root).value, error: owner.root.querySelector("output")!.textContent, raw: owner.form.read() };
    fail = false; owner.form.bind(h.ids[1]);
    let parsedOwner: Owner | undefined, nested = false, beforeFailures = 0;
    parsedOwner = h.make('<input data-field="name" required><output data-error-for="name"></output><input data-field="note">', {
      beforeBind(context) { if (nested && context.row.id === h.ids[1]) { beforeFailures++; throw new Error("Parser nested bind failed"); } },
      parse: { name: value => { if (nested) parsedOwner!.form.bind(h.ids[1]); return value; } }
    });
    h.edit(h.input(parsedOwner.root), ""); const previousError = parsedOwner.root.querySelector("output")!.textContent;
    nested = true; h.edit(h.input(parsedOwner.root, "note"), "Candidate note");
    const parsed = { beforeFailures, raw: parsedOwner.form.read(), source: h.rows.get(h.ids[0])!.value.note,
      note: h.input(parsedOwner.root, "note").value, errorPreserved: parsedOwner.root.querySelector("output")!.textContent === previousError,
      previousErrorPresent: previousError !== "" };
    return { before, after, code: error?.code, api: error?.api, callback: error?.detail?.callback, rowId: error?.detail?.rowId,
      cause: error?.cause instanceof Error ? error.cause.message : null, retry: owner.form.read(), parsed };
  });
  expect(result.before.value).toBe(""); expect(result.before.error).not.toBe(""); expect(result.before.raw).toEqual({ name: "Ada" });
  expect(result.after).toEqual(result.before);
  expect({ code: result.code, api: result.api, callback: result.callback, rowId: result.rowId, cause: result.cause, retry: result.retry })
    .toEqual({ code: "FORM_BIND", api: "bindForm", callback: "beforeBind", rowId: 2, cause: "Before failed", retry: { name: "Beatrice" } });
  expect(result.parsed).toEqual({ beforeFailures: 1, raw: { name: "Ada", note: "One" }, source: "One", note: "Candidate note",
    errorPreserved: true, previousErrorPresent: true });
});

test("a failing after hook retains completed association and display and releases its guard for retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding; let fail = false;
    const owner = h.make('<input data-field="name"><span data-field="note"></span>', { onBind() { if (fail) throw new Error("After failed"); } });
    fail = true; const error = h.error(() => owner.form.bind(h.ids[1]));
    const completed = { raw: owner.form.read(), value: h.input(owner.root).value, note: owner.root.querySelector("span")!.textContent };
    fail = false; owner.form.refresh();
    return { code: error?.code, callback: error?.detail?.callback, rowId: error?.detail?.rowId,
      cause: error?.cause instanceof Error ? error.cause.message : null, completed, retry: owner.form.read(), unchanged: h.rows.changes().length === 0 };
  });
  expect(result).toEqual({ code: "FORM_BIND", callback: "onBind", rowId: 2, cause: "After failed",
    completed: { raw: { name: "Beatrice", note: "Two" }, value: "Beatrice", note: "Two" }, retry: { name: "Beatrice", note: "Two" }, unchanged: true });
});

test("whole hooks reject and drain asynchronous results and permit a synchronous recovery", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formBinding, unhandled: string[] = [];
    const listener = (event: PromiseRejectionEvent) => { unhandled.push(String(event.reason)); event.preventDefault(); };
    window.addEventListener("unhandledrejection", listener);
    const cases = ["beforeBind", "onBind"].map(callback => {
      let asynchronous = false;
      const owner = h.make('<input data-field="name">', { [callback]: () => asynchronous ? Promise.reject(new Error("Async failure")) : false });
      asynchronous = true; const error = h.error(() => owner.form.refresh());
      asynchronous = false; owner.form.refresh();
      return { callback, code: error?.code, detail: error?.detail?.callback, raw: owner.form.read() };
    });
    await new Promise<void>(resolve => setTimeout(resolve, 0)); window.removeEventListener("unhandledrejection", listener);
    return { cases, unhandled };
  });
  expect(result).toEqual({ cases: ["beforeBind", "onBind"].map(callback => ({ callback, code: "FORM_BIND", detail: callback, raw: { name: "Ada" } })), unhandled: [] });
});

test("a superseded hook still drains its rejected asynchronous result without overwriting the nested binding", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formBinding, unhandled: string[] = [];
    const listener = (event: PromiseRejectionEvent) => { unhandled.push(String(event.reason)); event.preventDefault(); };
    window.addEventListener("unhandledrejection", listener);
    let form: FormHandle<Item> | undefined, nested = false;
    const root = h.root('<input data-field="name">');
    form = h.api.bindForm(root, { rows: h.rows, beforeBind(context) {
      if (nested && context.row.id === h.ids[0]) { form!.bind(h.ids[1]); return Promise.reject(new Error("Old async result")); }
    } });
    form.bind(h.ids[0]); nested = true; const error = h.error(() => form!.refresh());
    await new Promise<void>(resolve => setTimeout(resolve, 0)); window.removeEventListener("unhandledrejection", listener);
    return { code: error?.code, raw: form.read(), value: h.input(root).value, unhandled };
  });
  expect(result).toEqual({ code: "FORM_BIND", raw: { name: "Beatrice" }, value: "Beatrice", unhandled: [] });
});

test("unchanged current-row revert observes the exact immutable event without replaying unchanged value hooks", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, whole: unknown[] = [], values: string[] = []; let event: RowsEvent | undefined;
    h.rows.subscribe(next => { event = next; });
    const observe = (hook: string, context: FormBindContext<Item>) => whole.push([hook, context.row.id, context.event?.type,
      context.event?.changed, context.event === event, Object.isFrozen(context.event)]);
    const owner = h.make('<span data-field="name"></span>', { beforeBind: context => { observe("before", context); },
      onBind: context => { observe("after", context); }, beforeBindValue: (_value, context) => { values.push(context.phase); } });
    whole.length = values.length = 0; h.rows.revert(h.ids[0]); h.rows.revert();
    return { whole, values, raw: owner.form.read() };
  });
  expect(result).toEqual({ whole: [["before", 1, "revert", false, true, true], ["after", 1, "revert", false, true, true],
    ["before", 1, "revert", false, true, true], ["after", 1, "revert", false, true, true]], values: [], raw: { name: "Ada" } });
});

test("revert commits source and drops its draft even when the before hook fails before visible changes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding; let fail = false, after = 0;
    const owner = h.make('<input data-field="name" required><output data-error-for="name"></output>', {
      beforeBind(context) { if (fail && context.event?.type === "revert") throw new Error("Revert failed"); }, onBind: () => { after++; }
    });
    h.rows.set(h.ids[0], "name", "Edited"); h.edit(h.input(owner.root), "");
    const errorText = owner.root.querySelector("output")!.textContent; after = 0; fail = true;
    const error = h.error(() => h.rows.revert(h.ids[0]));
    const failed = { source: h.rows.get(h.ids[0])!.value.name, raw: owner.form.read(), value: h.input(owner.root).value,
      error: owner.root.querySelector("output")!.textContent, after };
    fail = false; owner.form.bind(h.ids[0]);
    return { code: error?.code, errorText, failed, retry: { value: h.input(owner.root).value, valid: owner.form.validate().valid, after } };
  });
  expect(result.code).toBe("FORM_BIND"); expect(result.errorText).not.toBe("");
  expect(result.failed).toEqual({ source: "Ada", raw: { name: "Ada" }, value: "", error: result.errorText, after: 0 });
  expect(result.retry).toEqual({ value: "Ada", valid: true, after: 1 });
});

test("keyed edits validation focus unrelated rows movement and vanishing bindings do not emit whole hooks", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, calls: string[] = [];
    const owner = h.make('<input data-field="name"><input data-field="count" data-format=\'[["commas"]]\'>', {
      parse: { count: Number }, beforeBind: () => { calls.push("before"); }, onBind: () => { calls.push("after"); }
    });
    calls.length = 0; h.rows.set(h.ids[0], "name", "Changed"); h.edit(h.input(owner.root, "count"), "1500"); owner.form.validate();
    h.input(owner.root, "count").focus(); h.input(owner.root, "count").blur();
    owner.form.refresh(["name"]); h.rows.set(h.ids[1], "name", "Other"); h.rows.revert(h.ids[1]);
    const [added] = h.rows.append([h.rows.get(h.ids[0])!.value as Item]); h.rows.move(added, h.ids[0]);
    h.rows.remove(h.ids[1]); h.rows.remove(h.ids[0]); h.rows.replace([{ ...h.rows.get(added)!.value, name: "Replacement" } as Item]);
    owner.form.refresh(); owner.form.bind(null);
    return { calls, value: h.input(owner.root).value };
  });
  expect(result).toEqual({ calls: [], value: "" });
});

test("a source mutation during before binding supersedes that pass and suppresses its stale after hook", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, calls: string[] = []; let change = false;
    const owner = h.make('<input data-field="name"><span data-field="note"></span>', {
      beforeBind(context) { calls.push("before:" + context.row.value.name); if (change) { change = false; h.rows.set(context.row.id, "name", "New source"); } },
      onBind: context => { calls.push("after:" + context.row.value.name); }
    });
    calls.length = 0; change = true; owner.form.refresh();
    const superseded = { calls: [...calls], value: h.input(owner.root).value, raw: owner.form.read() };
    calls.length = 0; owner.form.refresh();
    return { superseded, retry: calls };
  });
  expect(result).toEqual({ superseded: { calls: ["before:Ada"], value: "New source", raw: { name: "New source", note: "One" } },
    retry: ["before:New source", "after:New source"] });
});

test("a completed different-row nested bind replaces its outer pass without a stale after hook", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, calls: string[] = []; let form: FormHandle<Item> | undefined, nested = false;
    const root = h.root('<input data-field="name">');
    form = h.api.bindForm(root, { rows: h.rows, beforeBind(context) {
      calls.push("before:" + context.row.id); if (nested && context.row.id === h.ids[0]) form!.bind(h.ids[1]);
    }, onBind: context => { calls.push("after:" + context.row.id); } });
    form.bind(h.ids[0]); calls.length = 0; nested = true; form.bind(h.ids[0]);
    return { calls, value: h.input(root).value, raw: form.read() };
  });
  expect(result).toEqual({ calls: ["before:1", "before:2", "after:2"], value: "Beatrice", raw: { name: "Beatrice" } });
});

test("same-row and cyclic whole-hook entry fail without poisoning the next explicit binding", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding;
    return ["same", "cycle"].map(kind => {
      let form: FormHandle<Item> | undefined, recur = false;
      const root = h.root('<input data-field="name">');
      form = h.api.bindForm(root, { rows: h.rows, beforeBind(context) {
        if (recur) form!.bind(kind === "same" || context.row.id === h.ids[1] ? h.ids[0] : h.ids[1]);
      } });
      form.bind(h.ids[0]); recur = true; const error = h.error(() => form!.refresh());
      recur = false; form.bind(h.ids[1]);
      return { kind, code: error?.code, value: h.input(root).value, raw: form.read() };
    });
  });
  expect(result).toEqual(["same", "cycle"].map(kind => ({ kind, code: "FORM_BIND", value: "Beatrice", raw: { name: "Beatrice" } })));
});

test("disposal during a before hook suppresses field work and after hooks and releases ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding; let dispose = false, form: FormHandle<Item> | undefined, after = 0, values = 0;
    const root = h.root('<input data-field="name">');
    form = h.api.bindForm(root, { rows: h.rows, beforeBind() { if (dispose) form!.dispose(); },
      onBind: () => { after++; }, beforeBindValue: () => { values++; } });
    form.bind(h.ids[0]); after = values = 0; dispose = true;
    const error = h.error(() => form!.bind(h.ids[1]));
    const kept = h.input(root).value, disposed = h.error(() => form!.refresh([]))?.code;
    const retry = h.api.bindForm(root, { rows: h.rows }); retry.bind(h.ids[1]);
    return { error: error?.code ?? null, after, values, kept, disposed, rebound: h.input(root).value };
  });
  expect(result).toEqual({ error: null, after: 0, values: 0, kept: "Ada", disposed: "FORM_DISPOSED", rebound: "Beatrice" });
});

test("formatter and renderer row replacement during full binding cannot publish an older view or after hook", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding;
    return ["formatter", "renderer"].map(kind => {
      const root = h.root(kind === "formatter" ? '<input data-field="name" data-format=\'[["switch"]]\'>' : '<span data-field="name"></span>');
      let form: FormHandle<Item> | undefined, nested = false; const after: number[] = [];
      const write = (value: unknown) => { if (nested && value === "Ada") form!.bind(h.ids[1]); return String(value); };
      form = h.api.bindForm(root, { rows: h.rows, ...(kind === "formatter" ? { rules: { format: { switch: write } } } : { render: { name: write } }),
        onBind: context => { after.push(context.row.id); } });
      form.bind(h.ids[0]); after.length = 0; nested = true; form.bind(h.ids[0]);
      return { kind, after, raw: form.read(), value: kind === "formatter" ? h.input(root).value : root.textContent };
    });
  });
  expect(result).toEqual(["formatter", "renderer"].map(kind => ({ kind, after: [2], raw: { name: "Beatrice" }, value: "Beatrice" })));
});

test("a renderer catching a nested before failure cannot publish its stale result or complete the older whole pass", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, root = h.root('<span data-field="note"></span><span data-field="name"><i>Authored</i></span>');
    let form: FormHandle<Item> | undefined, attempt = false, caught: string | undefined, stale: HTMLElement | undefined;
    const after: number[] = [];
    form = h.api.bindForm(root, { rows: h.rows,
      beforeBind(context) { if (attempt && context.row.id === h.ids[1]) throw new Error("Nested before failed"); },
      render: { name: value => {
        if (attempt) {
          caught = h.error(() => form!.bind(h.ids[1]))?.code;
          stale = document.createElement("em"); stale.textContent = "Stale result after failed nested binding"; return stale;
        }
        const node = document.createElement("em"); node.textContent = `Current ${value}`; return node;
      } }, onBind: context => { after.push(context.row.id); }
    });
    form.bind(h.ids[0]);
    const name = root.querySelector('[data-field="name"]')!, previous = name.firstChild;
    after.length = 0; attempt = true; form.bind(h.ids[0]);
    return { caught, sameNode: name.firstChild === previous, text: name.textContent, staleDisconnected: !stale!.isConnected && stale!.parentNode === null,
      after, raw: form.read() };
  });
  expect(result).toEqual({ caught: "FORM_BIND", sameNode: true, text: "Current Ada", staleDisconnected: true,
    after: [], raw: { note: "One", name: "Ada" } });
});

test("whole Form rendering bounds same-field and cross-field refresh cycles while permitting nonrecursive hook refresh and retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding;
    const recursive = ["same", "cycle"].map(mode => {
      const root = h.root('<span data-field="name"></span><span data-field="note"></span>');
      let form: FormHandle<Item> | undefined, start = false, reenter = false, sentinel = false;
      let calls = { name: 0, note: 0 };
      const write = (field: "name" | "note", value: unknown) => {
        calls[field]++;
        if (reenter) {
          if (calls.name + calls.note > 4) { sentinel = true; throw new Error("Test recursion limit exceeded"); }
          form!.refresh([field === "name" && mode === "cycle" ? "note" : "name"]);
        }
        return String(value);
      };
      form = h.api.bindForm(root, { rows: h.rows, render: { name: value => write("name", value), note: value => write("note", value) },
        onBind() { if (start) { calls = { name: 0, note: 0 }; reenter = true; form!.refresh(["name"]); } }
      });
      form.bind(h.ids[0]); start = true;
      const error = h.error(() => form!.refresh()), bounded = { ...calls };
      start = reenter = false; calls = { name: 0, note: 0 };
      const retry = h.error(() => form!.refresh(["name", "note"]));
      return { mode, code: error?.code, callback: error?.detail?.callback, bounded, sentinel,
        retry: retry?.code ?? null, retryCalls: calls, text: root.textContent, raw: form.read() };
    });
    const allowed = ["beforeBind", "onBind"].map(callback => {
      const root = h.root('<span data-field="name"></span>');
      let form: FormHandle<Item> | undefined, refresh = false, calls = 0;
      form = h.api.bindForm(root, { rows: h.rows, render: { name: value => { calls++; return String(value); } },
        [callback]: () => { if (refresh) form!.refresh(["name"]); } });
      form.bind(h.ids[0]); calls = 0; refresh = true;
      const error = h.error(() => form!.refresh());
      return { callback, code: error?.code ?? null, calls, text: root.textContent, raw: form.read() };
    });
    return { recursive, allowed };
  });
  expect(result.recursive).toEqual(["same", "cycle"].map(mode => ({ mode, code: "FORM_BIND", callback: "onBind",
    bounded: { name: 1, note: mode === "same" ? 0 : 1 }, sentinel: false, retry: null, retryCalls: { name: 1, note: 1 },
    text: "AdaOne", raw: { name: "Ada", note: "One" } })));
  expect(result.allowed).toEqual(["beforeBind", "onBind"].map(callback => ({ callback, code: null,
    calls: callback === "beforeBind" ? 1 : 2, text: "Ada", raw: { name: "Ada" } })));
});

test("whole after hooks finish synchronously while full and selected refresh defer focused text projection", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, after: string[] = [], values: string[] = [];
    const owner = h.make('<input data-field="name">', { beforeBindValue: (value, context) => { values.push(context.phase); return String(value).toUpperCase(); },
      onBind: context => { after.push(h.input(context.root).value); } });
    const input = h.input(owner.root); input.focus(); input.setSelectionRange(1, 2); values.length = after.length = 0;
    owner.form.refresh(); owner.form.refresh(["name"]);
    const focused = { value: input.value, selection: [input.selectionStart, input.selectionEnd], values: [...values], after: [...after] };
    input.blur();
    return { focused, blurred: input.value, values, raw: owner.form.read() };
  });
  expect(result).toEqual({ focused: { value: "Ada", selection: [1, 2], values: [], after: ["Ada"] }, blurred: "ADA", values: ["bind"], raw: { name: "Ada" } });
});

test("selected refresh validates the entire field list before work and visits deduplicated compiled paths in DOM order", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, calls: string[] = [];
    const owner = h.make('<span data-field="profile.label"></span><span data-field="name"></span><span data-field="note"></span>', {
      beforeBindValue: (_value, context) => { calls.push(context.field); }
    });
    calls.length = 0; owner.form.refresh(["note", "name", "profile.label", "name"]); const ordered = [...calls];
    const late = document.createElement("input"); late.dataset.field = "late"; late.value = "Authored late"; owner.root.append(late);
    calls.length = 0; const before = owner.root.innerHTML;
    const errors = ["name", null, {}, ["name", "missing"], ["name", 1], ["late"], [" profile.label"], ["profile"]]
      .map(fields => h.error(() => owner.form.refresh(fields as readonly string[]))?.code);
    const unchanged = owner.root.innerHTML === before && !calls.length;
    owner.form.refresh([]); const empty = [...calls]; owner.form.dispose();
    return { ordered, errors, unchanged, empty, disposed: h.error(() => owner.form.refresh([]))?.code };
  });
  expect(result).toEqual({ ordered: ["profile.label", "name", "note"], errors: Array(8).fill("FORM_BIND"), unchanged: true, empty: [], disposed: "FORM_DISPOSED" });
});

test("selected refresh treats native groups atomically and keeps focused readonly projection immediate", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, calls: unknown[] = [];
    const owner = h.make('<input type="checkbox" data-field="flag">' +
      '<input type="checkbox" data-field="tags" value="a"><input type="checkbox" data-field="tags" value="b">' +
      '<input type="radio" name="binding-choice" data-field="choice" value="1"><input type="radio" name="binding-choice" data-field="choice" value="2">' +
      '<input readonly data-field="name">', { beforeBindValue(value, context) {
      calls.push([context.field, context.element === context.element.closest("form")?.querySelector(`[data-field="${context.field}"]`)]);
      if (context.field === "name") return String(value).toUpperCase();
    } });
    calls.length = 0; h.input(owner.root, "flag").checked = true;
    for (const element of owner.root.querySelectorAll<HTMLInputElement>('[data-field="tags"], [data-field="choice"]')) element.checked = element.value === "b" || element.value === "2";
    h.input(owner.root).focus(); owner.form.refresh(["name", "choice", "tags", "flag", "tags"]);
    return { calls, flag: h.input(owner.root, "flag").checked,
      tags: [...owner.root.querySelectorAll<HTMLInputElement>('[data-field="tags"]')].map(input => input.checked),
      radio: [...owner.root.querySelectorAll<HTMLInputElement>('[data-field="choice"]')].map(input => input.checked),
      name: h.input(owner.root).value, raw: owner.form.read() };
  });
  expect(result).toEqual({ calls: [["flag", true], ["tags", true], ["choice", true], ["name", true]], flag: false,
    tags: [true, false], radio: [true, false], name: "ADA", raw: { flag: false, tags: ["a"], choice: 1, name: "Ada" } });
});

test("selected typed choices prepare only selected sources and reject a later malformed selected source before any writer", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, calls: string[] = []; let suffix = "!";
    const owner = h.make('<span data-field="name"></span><select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"></select>' +
      '<span data-field="note"></span>', { beforeBindValue(value, context) { calls.push(context.field); if (context.field === "name") return `${value}${suffix}`; } });
    const select = owner.root.querySelector("select")!, nodes = [...select.childNodes];
    const committed = h.error(() => h.rows.set(h.ids[0], "choices", "malformed" as unknown as Item["choices"]));
    calls.length = 0; owner.form.refresh(["note"]); const independent = [...calls];
    calls.length = 0; suffix = "?"; const before = owner.root.innerHTML;
    const selected = h.error(() => owner.form.refresh(["name", "choice"]));
    return { committed: committed?.code, independent, selected: selected?.code, noWriters: !calls.length,
      unchanged: owner.root.innerHTML === before, sameChoices: nodes.every((node, index) => select.childNodes[index] === node), raw: owner.form.read().choice };
  });
  expect(result).toEqual({ committed: "FORM_OPTIONS", independent: ["note"], selected: "FORM_OPTIONS", noWriters: true,
    unchanged: true, sameChoices: true, raw: 1 });
});

test("selected refresh preserves invalid drafts and issues without parsing validating or committing inputs", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding; let parsed = 0, validated = 0;
    const owner = h.make('<input data-field="name" required data-validate=\'[["business"]]\'><output data-error-for="name"></output>' +
      '<span data-field="note"></span>', { parse: { name: value => { parsed++; return value; } },
      rules: { validate: { business: () => { validated++; return true; } } } });
    h.edit(h.input(owner.root), ""); const error = owner.root.querySelector("output")!.textContent;
    parsed = validated = 0; owner.form.refresh(["note"]); owner.form.refresh(["name"]);
    const refreshed = { parsed, validated, value: h.input(owner.root).value, error: owner.root.querySelector("output")!.textContent,
      invalid: h.input(owner.root).getAttribute("aria-invalid"), raw: owner.form.read(), changes: h.rows.changes().length };
    owner.form.bind(h.ids[1]); owner.form.bind(h.ids[0]);
    return { error, refreshed, returnedDraft: h.input(owner.root).value };
  });
  expect(result.error).not.toBe("");
  expect(result.refreshed).toEqual({ parsed: 0, validated: 0, value: "", error: result.error, invalid: "true", raw: { name: "Ada", note: "One" }, changes: 0 });
  expect(result.returnedDraft).toBe("");
});

test("local selected refresh uses raw context while leaving unselected native display and validation errors alone", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, renders: string[] = [], root = h.root('<input data-field="count" value="1200" data-format=\'[["commas"]]\'>' +
      '<input data-field="name" value="Ada" required><output data-error-for="name"></output><span data-field="note">raw</span>');
    const form = h.api.bindForm(root, { render: { note: (value, context) => { renders.push(String(context.values.count)); return `${value}:${context.values.count}`; } } });
    h.edit(h.input(root), ""); const error = root.querySelector("output")!.textContent;
    h.input(root, "count").value = "2400"; renders.length = 0; form.refresh(["note"]);
    const selected = { count: h.input(root, "count").value, note: root.querySelector("span")!.textContent, renders: [...renders], error: root.querySelector("output")!.textContent };
    form.refresh(["count"]); form.refresh([]);
    return { error, selected, count: h.input(root, "count").value, raw: form.read(), retainedError: root.querySelector("output")!.textContent };
  });
  expect(result.error).not.toBe("");
  expect(result.selected).toEqual({ count: "2400", note: "raw:2400", renders: ["2400"], error: result.error });
  expect(result.count).toBe("2,400"); expect(result.raw).toEqual({ count: "2400", name: "", note: "raw" }); expect(result.retainedError).toBe(result.error);
});

test("an empty local selection can finish native reset without adding selected writes or validation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, root = h.root('<input data-field="count" value="1200" required data-format=\'[["commas"]]\'>' +
      '<output data-error-for="count"></output><span data-field="note">raw</span>');
    let rendered = 0, validated = 0;
    const form = h.api.bindForm(root, { rules: { fields: { count: { validate: [["business"]] } }, validate: { business: () => { validated++; return true; } } },
      render: { note: (value, context) => { rendered++; return `${value}:${context.values.count}`; } } });
    h.edit(h.input(root, "count"), ""); rendered = validated = 0; root.reset(); form.refresh([]);
    return { value: h.input(root, "count").value, note: root.querySelector("span")!.textContent, error: root.querySelector("output")!.textContent,
      raw: form.read(), rendered, validated };
  });
  expect(result).toEqual({ value: "1,200", note: "raw:1200", error: "", raw: { count: "1200", note: "raw" }, rendered: 1, validated: 0 });
});

test("unbound selected refresh only clears selected compiled fields and never emits whole hooks", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formBinding, calls: string[] = [];
    const owner = h.make('<input data-field="name"><input data-field="note">', { beforeBind: () => { calls.push("before"); }, onBind: () => { calls.push("after"); } }, null);
    h.input(owner.root).value = "Unbound name"; h.input(owner.root, "note").value = "Keep note";
    owner.form.refresh(["name"]); const selected = [h.input(owner.root).value, h.input(owner.root, "note").value];
    owner.form.refresh();
    return { calls, selected, full: [h.input(owner.root).value, h.input(owner.root, "note").value] };
  });
  expect(result).toEqual({ calls: [], selected: ["", "Keep note"], full: ["", ""] });
});
