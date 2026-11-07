// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows } from "../../src/data/index.js";
import type { FormHandle, GridHandle, ParseInput, RuleContext } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindGrid } from "../../src/ui/grid.js";
import type { bindSelect } from "../../src/ui/select.js";

type Values = Record<string, unknown>;
type FormOptions = NonNullable<Parameters<typeof bindForm<Values>>[1]>;
type Failure = { code: string; api?: string; detail?: Readonly<Record<string, unknown>>; cause?: unknown };
declare global {
  interface Window {
    formDefaults: {
      api: { bindForm: typeof bindForm; bindGrid: typeof bindGrid; bindSelect: typeof bindSelect };
      rows: Rows<Values>; ids: readonly number[];
      root(html: string): HTMLFormElement;
      table(html: string): HTMLTableElement;
      make(html: string, options?: FormOptions): { root: HTMLFormElement; form: FormHandle<Values> };
      field<E extends HTMLElement = HTMLInputElement>(root: ParentNode, name?: string): E;
      edit(input: HTMLInputElement, value: string): void;
      files(input: HTMLInputElement, files: readonly File[]): void;
      error(action: () => unknown): Failure | null;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm, bindGrid, bindSelect }, { createRows }] = await Promise.all([import(modules.ui), import(modules.data)]);
    const rows: Rows<Values> = createRows([
      { name: "Ada", note: "One", count: 1200, choice: 1, choices: [{ label: "First", value: 1 }, { label: "Second", value: 2 }], hidden: { token: "business" } },
      { name: "Beatrice", note: "Two", count: 2400, choice: 2, choices: [{ label: "First", value: 1 }, { label: "Second", value: 2 }], hidden: { token: "other" } }
    ]);
    const h: Window["formDefaults"] = {
      api: { bindForm, bindGrid, bindSelect }, rows, ids: rows.entries().map(row => row.id),
      root(html) { const root = document.createElement("form"); root.innerHTML = html; document.body.append(root); return root; },
      table(html) { const table = document.createElement("table"); table.innerHTML = `<caption>Captured defaults</caption><thead><tr><th scope="col">Record</th></tr></thead><tbody><tr data-row-template><td>${html}</td></tr></tbody>`; document.body.append(table); return table; },
      make(html, options = {}) { const root = h.root(html); return { root, form: bindForm(root, options) }; },
      field: (root, name = "name") => root.querySelector(`[data-field="${name}"]`)! as never,
      edit(input, value) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); },
      files(input, files) { const transfer = new DataTransfer(); for (const file of files) transfer.items.add(file); input.files = transfer.files; },
      error(action) { try { action(); return null; } catch (cause) { return cause as Failure; } }
    }; window.formDefaults = h;
  }, modules);
});

test("Form defaults capture live native values including root readonly disabled and hidden fields but exclude display and business data", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, root = h.root('<input data-field="profile.name" value="HTML"><input readonly data-field="readonly" value="Read">' +
      '<input disabled data-field="disabled" value="Disabled"><input type="hidden" data-field="token" value="Hidden">' +
      '<span data-field="note">Static</span><img data-field="picture" alt="Picture">');
    h.field<HTMLInputElement>(root, "profile.name").value = "Live";
    const form = h.api.bindForm(root, { rows: h.rows }); form.bind(h.ids[0]); const defaults = form.defaults();
    const input = document.createElement("input"); input.dataset.field = "root"; input.value = "Root live"; document.body.append(input);
    const single = h.api.bindForm(input); const rootDefaults = single.defaults(); single.dispose();
    return { defaults, rootDefaults, source: h.rows.get(h.ids[0])!.value.hidden, changes: h.rows.changes().length };
  });
  expect(result).toEqual({ defaults: { profile: { name: "Live" }, readonly: "Read", disabled: "Disabled", token: "Hidden" },
    rootDefaults: { root: "Root live" }, source: { token: "business" }, changes: 0 });
});

test("captured defaults native reset and received Rows originals remain three independent checkpoints", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, root = h.root('<input data-field="name" value="Native default">');
    h.field<HTMLInputElement>(root).value = "Live capture";
    const form = h.api.bindForm(root, { rows: h.rows }); form.bind(h.ids[0]);
    h.rows.set(h.ids[0], "name", "Edited source"); root.reset();
    const native = h.field<HTMLInputElement>(root).value; form.unbind(); const restored = h.field<HTMLInputElement>(root).value;
    h.rows.revert(h.ids[0]); const stillUnbound = h.field<HTMLInputElement>(root).value; form.bind(h.ids[0]);
    return { native, restored, stillUnbound, received: h.field<HTMLInputElement>(root).value, original: h.rows.original(h.ids[0])!.name,
      defaults: form.defaults(), nativeDefault: h.field<HTMLInputElement>(root).defaultValue };
  });
  expect(result).toEqual({ native: "Native default", restored: "Live capture", stillUnbound: "Live capture", received: "Ada", original: "Ada",
    defaults: { name: "Live capture" }, nativeDefault: "Native default" });
});

test("defaults return detached nested records and arrays without recapturing edits binding refresh or reset", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, owner = h.make('<input data-field="profile.name" value="Capture"><input type="checkbox" data-field="tags" value="a" checked>' +
      '<input type="checkbox" data-field="tags" value="b"><select multiple data-field="selected"><option value="a" selected>A</option><option value="b">B</option></select>');
    const first = owner.form.defaults(); (first.profile as Values).name = "Mutated"; (first.tags as string[]).push("other"); (first.selected as string[]).length = 0;
    h.edit(h.field(owner.root, "profile.name"), "Later"); owner.form.refresh(); owner.root.reset(); owner.form.unbind();
    const second = owner.form.defaults();
    return { second, detached: first.profile !== second.profile && first.tags !== second.tags && first.selected !== second.selected };
  });
  expect(result).toEqual({ second: { profile: { name: "Capture" }, tags: ["a"], selected: ["a"] }, detached: true });
});

test("Form default parsers use own native fields in compiled order and one unparsed captured context", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, contexts: unknown[] = [], receivers: boolean[] = []; let inherited = 0;
    const parse = Object.create(Object.defineProperty({}, "ignored", { get() { inherited++; throw new Error("Inherited parser"); } })) as Record<string, ParseInput>;
    parse.toString = (value, context) => { contexts.push([context.field, context.values.choice, context.values.count, context.rowId, context.element?.dataset.field]); return value.toUpperCase(); };
    parse.count = function(this: unknown, value: string, context: RuleContext) { "use strict";
      receivers.push(this === undefined); contexts.push([context.field, context.values.choice, context.values.count, context.rowId, context.element?.dataset.field]); return Number(value); };
    parse.choice = (value, context) => { contexts.push([context.field, context.values.choice, context.values.count, context.rowId, context.element?.dataset.field]); return Number(value); };
    const owner = h.make('<select data-field="choice"><option value="2" selected>Two</option></select><input readonly disabled data-field="count" value="007">' +
      '<input data-field="toString" value="own"><input data-field="ignored" value="safe"><span data-field="note">Display</span>', { parse });
    const before = owner.root.innerHTML, defaults = owner.form.defaults();
    return { defaults, contexts, receivers, inherited, unchanged: before === owner.root.innerHTML };
  });
  expect(result).toEqual({ defaults: { choice: 2, count: 7, toString: "OWN", ignored: "safe" }, receivers: [true], inherited: 0, unchanged: true,
    contexts: [["choice", "2", "007", null, "choice"], ["count", "2", "007", null, "count"], ["toString", "2", "007", null, "toString"]] });
});

test("default parser errors undefined async and uncloneable results fail without changing DOM and release guards", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formDefaults; let unhandled = 0;
    const listener = (event: PromiseRejectionEvent) => { unhandled++; event.preventDefault(); }; window.addEventListener("unhandledrejection", listener);
    const cases = ["throw", "undefined", "async", "uncloneable"].map(mode => {
      let fail = true;
      const owner = h.make('<input data-field="name" value="Capture">', { parse: { name: value => {
        if (!fail) return value;
        if (mode === "throw") throw new Error("Parser failed");
        if (mode === "async") return Promise.reject(new Error("Async failed"));
        if (mode === "uncloneable") return () => value;
        return undefined;
      } } });
      const before = owner.root.innerHTML, error = h.error(() => owner.form.defaults()); fail = false;
      return { mode, code: error?.code, unchanged: owner.root.innerHTML === before, retry: owner.form.defaults() };
    });
    await new Promise<void>(resolve => setTimeout(resolve, 0)); window.removeEventListener("unhandledrejection", listener);
    return { cases, unhandled };
  });
  expect(result).toEqual({ cases: ["throw", "undefined", "async", "uncloneable"].map(mode => ({ mode, code: "FORM_DEFAULTS", unchanged: true, retry: { name: "Capture" } })), unhandled: 0 });
});

test("Form and Grid default getter recursion is bounded per owner recoverable and permits another owner", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults;
    const cases = ["form", "grid"].map(kind => {
      let handle: FormHandle<Values> | GridHandle<Values> | undefined, recursive = false, calls = 0, sentinel = false;
      const parse = { name: (value: string): unknown => { calls++; if (calls > 4) { sentinel = true; throw new Error("Test recursion cap"); } return recursive ? handle!.defaults() : value; } };
      handle = kind === "form" ? h.api.bindForm(h.root('<input data-field="name" value="Capture">'), { parse })
        : h.api.bindGrid(h.table('<input data-field="name" value="Capture">'), { rows: h.rows, parse });
      recursive = true; const error = h.error(() => handle!.defaults()), bounded = calls;
      recursive = false; calls = 0; const retry = handle.defaults(); handle.dispose();
      return { kind, code: error?.code, bounded, sentinel, retry };
    });
    const other = h.make('<input data-field="name" value="Other owner">');
    const first = h.make('<input data-field="name" value="First owner">', { parse: { name: () => other.form.defaults().name } });
    return { cases, crossOwner: first.form.defaults() };
  });
  expect(result).toEqual({ cases: ["form", "grid"].map(kind => ({ kind, code: kind === "form" ? "FORM_DEFAULTS" : "GRID_DEFAULTS", bounded: 1, sentinel: false, retry: { name: "Capture" } })), crossOwner: { name: "Other owner" } });
});

test("native default paths reject parent-child conflicts in both DOM orders for Form and Grid", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, cases: unknown[] = [];
    for (const kind of ["form", "grid"]) for (const reverse of [false, true]) {
      const fields = ['<input data-field="profile" value="Parent">', '<input data-field="profile.name" value="Child">']; if (reverse) fields.reverse();
      const root = kind === "form" ? h.root(fields.join("")) : h.table(fields.join(""));
      const handle = kind === "form" ? h.api.bindForm(root) : h.api.bindGrid(root as HTMLTableElement, { rows: h.rows });
      const before = root.innerHTML, snapshot = h.rows.entries(), error = h.error(() => handle.defaults());
      cases.push({ kind, reverse, code: error?.code, unchanged: before === root.innerHTML && snapshot === h.rows.entries() }); handle.dispose();
    }
    return cases;
  });
  expect(result).toEqual(["form", "grid"].flatMap(kind => [false, true].map(reverse => ({ kind, reverse, code: kind === "form" ? "FORM_DEFAULTS" : "GRID_DEFAULTS", unchanged: true }))));
});

test("shared default assembly preserves Grid readonly disabled groups parser order and Select parser exclusion", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, calls: string[] = [], receivers: boolean[] = [];
    const table = h.table('<input readonly data-field="first" value="01"><input disabled data-field="second" value="02">' +
      '<input type="checkbox" data-field="flag" checked><select data-field="choice"><option value="b" selected>B</option></select><span data-field="note">Display</span>');
    const rejected = h.error(() => h.api.bindGrid(table, { rows: h.rows, parse: { choice: () => { throw new Error("Grid Select parser must not run"); } } }))?.code;
    const grid = h.api.bindGrid(table, { rows: h.rows, parse: { second: value => { calls.push("second"); return Number(value); },
      first: function(this: unknown, value: string) { "use strict"; receivers.push(this === undefined); calls.push("first"); return Number(value); } } });
    return { rejected, defaults: grid.defaults(), calls, receivers };
  });
  expect(result).toEqual({ rejected: "GRID_PARSE_FIELD", defaults: { first: 1, second: 2, flag: true, choice: "b" }, calls: ["first", "second"], receivers: [true] });
});

test("disposing from a default parser prevents a late result without affecting another live owner", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults;
    return ["form", "grid"].map(kind => {
      let handle: FormHandle<Values> | GridHandle<Values> | undefined, dispose = false;
      const root = kind === "form" ? h.root('<input data-field="name" value="Capture">') : h.table('<input data-field="name" value="Capture">');
      const parse = { name: (value: string) => { if (dispose) handle!.dispose(); return value; } };
      handle = kind === "form" ? h.api.bindForm(root, { parse }) : h.api.bindGrid(root as HTMLTableElement, { rows: h.rows, parse });
      dispose = true; const error = h.error(() => handle!.defaults());
      const retry = kind === "form" ? h.api.bindForm(root) : h.api.bindGrid(root as HTMLTableElement, { rows: h.rows });
      return { kind, code: error?.code, next: retry.defaults() };
    });
  });
  expect(result).toEqual(["form", "grid"].map(kind => ({ kind, code: kind === "form" ? "FORM_DISPOSED" : "GRID_DISPOSED", next: { name: "Capture" } })));
});

test("Rows unbind restores captured UI without callbacks notifications or business changes and retains ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, calls: string[] = [], root = h.root('<input data-field="name" value="Capture" data-field-changed="authored">' +
      '<select data-field="choice"><option value="1" selected>One</option><option value="2">Two</option></select><output data-error-for="name"></output>');
    const form = h.api.bindForm(root, { rows: h.rows, parse: { name: value => { calls.push("parse"); return value; } },
      beforeBind: () => { calls.push("before"); }, onBind: () => { calls.push("after"); }, beforeBindValue: () => { calls.push("value"); } });
    form.bind(h.ids[0]); h.rows.set(h.ids[0], "name", "Changed");
    const snapshots = h.rows.entries(), changes = h.rows.changes(), original = h.rows.original(h.ids[0]); let events = 0; h.rows.subscribe(() => { events++; }); calls.length = 0;
    const describedBy = h.field(root).getAttribute("aria-describedby"); form.unbind();
    return { calls, events, value: h.field(root).value, changed: h.field(root).getAttribute("data-field-changed"),
      sameSource: h.rows.entries() === snapshots && h.rows.changes() === changes && h.rows.original(h.ids[0]) === original,
      describedBy: h.field(root).getAttribute("aria-describedby") === describedBy, rootCode: h.error(() => h.api.bindForm(root))?.code,
      selectCode: h.error(() => h.api.bindSelect(h.field<HTMLSelectElement>(root, "choice"), { choices: [] }))?.code };
  });
  expect(result).toEqual({ calls: [], events: 0, value: "Capture", changed: "false", sameSource: true, describedBy: true, rootCode: "FORM_IN_USE", selectCode: "SELECT_OWNED" });
});

test("unbind discards only the current row draft detaches updates and retains other row drafts for reuse", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, owner = h.make('<input data-field="name" value="Capture" required><output data-error-for="name"></output><input data-field="note" value="Note capture">', { rows: h.rows });
    owner.form.bind(h.ids[0]); h.edit(h.field(owner.root), ""); owner.form.bind(h.ids[1]); h.edit(h.field(owner.root), "");
    owner.form.unbind(); const detached = Object.values(owner.form.read()).every(value => value === undefined);
    h.rows.set(h.ids[1], "note", "External update"); const quiet = [h.field(owner.root).value, h.field<HTMLInputElement>(owner.root, "note").value];
    owner.form.bind(h.ids[0]); const otherDraft = h.field(owner.root).value;
    owner.form.bind(h.ids[1]);
    return { detached, quiet, otherDraft, current: h.field(owner.root).value, valid: owner.form.validate(h.ids[1]).valid,
      source: [h.rows.get(h.ids[0])!.value.name, h.rows.get(h.ids[1])!.value.name] };
  });
  expect(result).toEqual({ detached: true, quiet: ["Capture", "Note capture"], otherDraft: "", current: "Beatrice", valid: true, source: ["Ada", "Beatrice"] });
});

test("unbind restores exact static nodes and image src attributes while preserving current native configuration and alt", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, root = h.root('<input data-field="name" value="Capture" data-format=\'[["upper"]]\' aria-label="Name">' +
      '<span data-field="note"><b>Captured</b><em> nodes</em></span><img data-field="absent" alt="Absent">' +
      '<img data-field="empty" src="" alt="Empty"><img data-field="relative" src="./captured.png" alt="Relative">');
    const note = h.field(root, "note"), nodes = [...note.childNodes]; let renders = 0;
    const form = h.api.bindForm(root, { rows: h.rows, render: { note: value => { renders++; return `Rendered ${value}`; } } }); form.bind(h.ids[0]);
    const input = h.field<HTMLInputElement>(root); input.defaultValue = "Later native default"; input.disabled = true; input.readOnly = true;
    const relative = h.field<HTMLImageElement>(root, "relative"); relative.alt = "Application alt"; renders = 0; form.unbind();
    return { value: input.value, defaultValue: input.defaultValue, disabled: input.disabled, readonly: input.readOnly, label: input.getAttribute("aria-label"),
      format: input.getAttribute("data-format"), exact: nodes.every((node, index) => note.childNodes[index] === node), text: note.textContent, renders,
      src: ["absent", "empty", "relative"].map(name => h.field(root, name).getAttribute("src")), alt: relative.alt };
  });
  expect(result).toEqual({ value: "Capture", defaultValue: "Later native default", disabled: true, readonly: true, label: "Name", format: '[["upper"]]',
    exact: true, text: "Captured nodes", renders: 0, src: [null, "", "./captured.png"], alt: "Application alt" });
});

test("captured group checkedness restores stable shapes without mutating checkbox values or native defaults", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, root = h.root('<input type="checkbox" data-field="flag" value="native-token">' +
      '<input type="checkbox" data-field="tags" value="a"><input type="checkbox" data-field="tags" value="b" checked>' +
      '<input type="radio" name="defaults-mode" data-field="mode" value="office" checked><input type="radio" name="defaults-mode" data-field="mode" value="remote">');
    const flag = h.field<HTMLInputElement>(root, "flag"); flag.checked = true;
    const radios = root.querySelectorAll<HTMLInputElement>('[data-field="mode"]'); radios[1].checked = true;
    const form = h.api.bindForm(root), defaults = form.defaults(); flag.defaultChecked = false; flag.checked = false;
    for (const input of root.querySelectorAll<HTMLInputElement>('[data-field="tags"], [data-field="mode"]')) input.checked = !input.checked;
    form.unbind();
    return { defaults, read: form.read(), checkboxValue: flag.value, nativeDefault: flag.defaultChecked };
  });
  expect(result).toEqual({ defaults: { flag: true, tags: ["b"], mode: "remote" }, read: { flag: true, tags: ["b"], mode: "remote" }, checkboxValue: "native-token", nativeDefault: false });
});

test("unmarked Select restore follows captured option identities while preserving reordered added and removed application options", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, root = h.root('<select multiple data-field="choice"><option value="same">First</option><option value="same" selected>Second</option><option value="b" selected>B</option></select>');
    const select = h.field<HTMLSelectElement>(root, "choice"), [first, second, b] = [...select.options];
    const form = h.api.bindForm(root); const extra = new Option("New same", "same"); select.prepend(b); select.add(extra);
    first.selected = extra.selected = true; second.selected = b.selected = false; const order = [...select.options]; form.unbind();
    const firstRestore = { selected: [...select.selectedOptions].map(option => option.textContent), sameOrder: order.every((option, index) => select.options[index] === option) };
    second.remove(); extra.selected = true; b.selected = false; const remaining = [...select.options]; form.unbind();
    return { firstRestore, secondRestore: [...select.selectedOptions].map(option => option.textContent),
      sameRemaining: remaining.every((option, index) => select.options[index] === option), defaults: form.defaults() };
  });
  expect(result).toEqual({ firstRestore: { selected: ["B", "Second"], sameOrder: true }, secondRestore: ["B"], sameRemaining: true, defaults: { choice: ["same", "b"] } });
});

test("marked Select unbind restores owned authored nodes selection and raw mapping before another row binds", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, root = h.root('<select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value">' +
      '<option value="">Choose</option><optgroup label="Authored"><option value="manual" selected>Manual</option></optgroup></select>');
    const select = h.field<HTMLSelectElement>(root, "choice"), nodes = [...select.childNodes], selected = select.selectedOptions[0];
    const form = h.api.bindForm(root, { rows: h.rows }); form.bind(h.ids[0]); const generated = select.options.length;
    form.unbind(); const restored = { exact: nodes.every((node, index) => select.childNodes[index] === node), selection: select.selectedOptions[0] === selected,
      length: select.options.length, defaults: form.defaults() };
    form.bind(h.ids[1]);
    return { generated, restored, next: { raw: form.read().choice, label: select.selectedOptions[0]?.textContent, length: select.options.length } };
  });
  expect(result).toEqual({ generated: 4, restored: { exact: true, selection: true, length: 2, defaults: { choice: "manual" } }, next: { raw: 2, label: "Second", length: 4 } });
});

test("local unbind suspends automatic work while read validate and selected refresh remain usable without resuming it", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults; let formats = 0, renders = 0, validations = 0;
    const owner = h.make('<input data-field="count" value="12" data-format=\'[["money"]]\' data-validate=\'[["check"]]\'><span data-field="note"><b>raw</b></span>', {
      rules: { format: { money: value => { formats++; return `$${value}`; } }, validate: { check: () => { validations++; return true; } } },
      render: { note: (value, context) => { renders++; return `${value}:${context.values.count}`; } }
    });
    owner.form.unbind(); formats = renders = validations = 0;
    const input = h.field<HTMLInputElement>(owner.root, "count"); h.edit(input, "34"); input.dispatchEvent(new Event("change", { bubbles: true })); input.focus(); input.blur(); owner.root.reset();
    const inactive = { value: input.value, formats, renders, validations, note: owner.root.querySelector("span")!.textContent };
    const valid = owner.form.validate().valid; owner.form.refresh(["count"]); h.edit(input, "56");
    const manual = { value: input.value, raw: owner.form.read().count, formats, renders, validations };
    owner.form.bind(null); h.edit(input, "78");
    const resumed = { value: input.value, note: owner.root.querySelector("span")!.textContent, raw: owner.form.read().count }; owner.form.dispose();
    return { inactive, valid, manual, resumed, disposedRaw: input.value };
  });
  expect(result).toEqual({ inactive: { value: "12", formats: 0, renders: 0, validations: 0, note: "raw" }, valid: true,
    manual: { value: "56", raw: "56", formats: 1, renders: 0, validations: 1 }, resumed: { value: "$78", note: "raw:78", raw: "78" }, disposedRaw: "78" });
});

test("defaults neither flush pending native reset display nor resume an inactive local Form", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, root = h.root('<input data-field="name" value="Native" data-format=\'[["label"]]\'>');
    h.field<HTMLInputElement>(root).value = "Capture"; let calls = 0;
    const form = h.api.bindForm(root, { rules: { format: { label: value => { calls++; return `[${value}]`; } } } });
    h.edit(h.field(root), "Edited"); h.field<HTMLInputElement>(root).defaultValue = "Later native"; root.reset(); calls = 0;
    const defaults = form.defaults(), pending = { value: h.field(root).value, calls }; const raw = form.read();
    form.unbind(); calls = 0; form.defaults(); h.edit(h.field(root), "Quiet");
    return { defaults, pending, raw, inactive: { value: h.field(root).value, calls } };
  });
  expect(result).toEqual({ defaults: { name: "Capture" }, pending: { value: "Later native", calls: 0 }, raw: { name: "Later native" }, inactive: { value: "Quiet", calls: 0 } });
});

test("unbind cancels older completed native reset cleanup before it can repaint the restored view", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formDefaults, root = h.root('<input data-field="name" value="Native" data-format=\'[["upper"]]\'><span data-field="note"><b>Authored</b></span>');
    h.field<HTMLInputElement>(root).value = "Capture"; const form = h.api.bindForm(root, { render: { note: value => `${value}!` } });
    h.edit(h.field(root), "Edited"); root.reset(); form.unbind(); await new Promise<void>(resolve => setTimeout(resolve, 0));
    const flushed = ["bind", "selected", "input", "focus", "validate"].map(mode => {
      const nextRoot = h.root('<input data-field="name" value="Native" required data-format=\'[["label"]]\' data-validate=\'[["required"],["check"]]\'>' +
        '<output data-error-for="name"></output><span data-field="note"><b>Captured note</b></span>');
      const input = h.field<HTMLInputElement>(nextRoot); input.value = mode === "validate" ? "" : "Capture";
      let next: FormHandle<Values> | undefined, armed = false, sentinel = false;
      let calls = { format: 0, render: 0, validate: 0 };
      const cap = () => { if (calls.format + calls.render > 4) { sentinel = true; throw new Error("Test reset flush cap"); } };
      next = h.api.bindForm(nextRoot, { rules: { format: { label: value => { calls.format++; cap(); return `${value}!`; } },
        validate: { check: () => { calls.validate++; return true; } } }, render: { note: value => {
        calls.render++; cap(); if (armed) { armed = false; next!.unbind(); return "Stale flushed result"; } return `${value}!`;
      } } });
      h.edit(input, ""); nextRoot.reset(); calls = { format: 0, render: 0, validate: 0 }; armed = true;
      let valid: boolean | undefined;
      if (mode === "bind") next.bind(null);
      else if (mode === "selected") next.refresh(["name"]);
      else if (mode === "input") h.edit(input, "Edited after reset");
      else if (mode === "validate") valid = next.validate().valid;
      else input.focus();
      const captured = { value: input.value, note: nextRoot.querySelector("span")!.innerHTML, error: nextRoot.querySelector("output")!.textContent, calls: { ...calls } };
      h.edit(input, "Quiet");
      return { mode, valid, captured, inactive: input.value === "Quiet" && JSON.stringify(calls) === JSON.stringify(captured.calls), sentinel };
    });
    return { value: h.field(root).value, note: root.querySelector("span")!.innerHTML, raw: form.read(), flushed };
  });
  expect({ value: result.value, note: result.note, raw: result.raw }).toEqual({ value: "Capture", note: "<b>Authored</b>", raw: { name: "Capture", note: "Authored" } });
  for (const branch of result.flushed) {
    expect(branch.captured).toMatchObject({ value: branch.mode === "validate" ? "" : "Capture", note: "<b>Captured note</b>", error: "", calls: { render: 1, validate: branch.mode === "validate" ? 1 : 0 } });
    if (branch.mode === "validate") expect(branch.valid).toBe(false);
    expect(branch.captured.calls.format).toBeLessThanOrEqual(1); expect(branch.inactive).toBe(true); expect(branch.sentinel).toBe(false);
  }
});

test("native reset default action after in-dispatch unbind wins unless the reset is canceled", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formDefaults, cases = [];
    for (const cancel of [false, true]) {
      const root = h.root('<input data-field="name" value="Native" data-format=\'[["upper"]]\'>'); h.field<HTMLInputElement>(root).value = "Capture";
      const form = h.api.bindForm(root); h.edit(h.field(root), "Edited"); let inside = "";
      root.addEventListener("reset", event => { form.unbind(); inside = h.field(root).value; if (cancel) event.preventDefault(); });
      root.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0));
      cases.push({ cancel, inside, value: h.field(root).value, raw: form.read(), defaults: form.defaults() });
    }
    return cases;
  });
  expect(result).toEqual([false, true].map(cancel => ({ cancel, inside: "Capture", value: cancel ? "Capture" : "Native", raw: { name: cancel ? "Capture" : "Native" }, defaults: { name: "Capture" } })));
});

test("unbind from whole value formatter renderer and parser callbacks suppresses older writes and sibling commits", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults;
    return ["whole", "value", "formatter", "renderer", "parser"].map(mode => {
      const root = h.root((mode === "renderer" ? '<span data-field="name"><b>Capture</b></span>' : '<input data-field="name" value="Capture">') + '<input data-field="note" value="Note capture">');
      if (mode === "formatter") h.field(root).setAttribute("data-format", '[["stop"]]');
      let form: FormHandle<Values> | undefined, armed = false, after = 0;
      const stop = () => { if (armed) form!.unbind(); };
      form = h.api.bindForm(root, { rows: h.rows, onBind: () => { after++; },
        ...(mode === "whole" ? { beforeBind: stop } : {}), ...(mode === "value" ? { beforeBindValue: (_value, context) => { if (context.field === "name") stop(); return undefined; } } : {}),
        ...(mode === "formatter" ? { rules: { format: { stop: (value: string) => { stop(); return value + " stale"; } } } } : {}),
        ...(mode === "renderer" ? { render: { name: (value: unknown) => { stop(); return String(value) + " stale"; } } } : {}),
        ...(mode === "parser" ? { parse: { name: (value: string) => { stop(); return value; } } } : {}) });
      form.bind(h.ids[0]); after = 0; armed = true;
      if (mode === "parser") h.edit(h.field(root), "Candidate"); else form.bind(h.ids[1]);
      return { mode, value: mode === "renderer" ? h.field(root).textContent : h.field<HTMLInputElement>(root).value,
        note: h.field<HTMLInputElement>(root, "note").value, after, unbound: Object.values(form.read()).every(value => value === undefined), source: h.rows.get(h.ids[0])!.value.name };
    });
  });
  expect(result).toEqual(["whole", "value", "formatter", "renderer", "parser"].map(mode => ({ mode, value: "Capture", note: "Note capture", after: 0, unbound: true, source: "Ada" })));
});

test("native setter reentry rejects same-owner unbind once and releases the restoration guard for retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, owner = h.make('<input data-field="name" value="Capture"><input data-field="note" value="Note capture">');
    h.edit(h.field(owner.root), "Changed"); const input = h.field<HTMLInputElement>(owner.root), native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!;
    let armed = true, calls = 0, sentinel = false, nested: string | undefined;
    Object.defineProperty(input, "value", { configurable: true, get() { return native.get!.call(this); }, set(value) {
      native.set!.call(this, value); calls++; if (calls > 4) { sentinel = true; throw new Error("Test setter recursion cap"); }
      if (armed) { armed = false; nested = h.error(() => owner.form.unbind())?.code; }
    } });
    owner.form.unbind(); const bounded = calls; delete (input as unknown as { value?: string }).value;
    input.value = "Later"; const retry = h.error(() => owner.form.unbind());
    return { nested, bounded, sentinel, retry: retry?.code ?? null, value: input.value, note: h.field<HTMLInputElement>(owner.root, "note").value };
  });
  expect(result).toEqual({ nested: "FORM_UNBIND", bounded: 1, sentinel: false, retry: null, value: "Capture", note: "Note capture" });
});

test("newer binding local full refresh and disposal during a native setter stop stale sibling restoration", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults;
    return ["bind", "refresh", "dispose", "getter"].map(mode => {
      const root = h.root('<input data-field="name" value="' + (mode === "getter" ? "1200" : "Capture") + '"><input data-field="note" value="Note capture">');
      const local = mode === "refresh" || mode === "getter";
      if (local) for (const input of root.querySelectorAll("input")) input.setAttribute("data-format", '[["upper"]]');
      if (mode === "getter") h.field(root).setAttribute("data-format", '[["comma"]]');
      const form = h.api.bindForm(root, local ? { rules: { format: { comma: value => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } } } : { rows: h.rows });
      if (!local) form.bind(h.ids[0]);
      const input = h.field<HTMLInputElement>(root), note = h.field<HTMLInputElement>(root, "note"), native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!;
      let armed = true, calls = 0, sentinel = false, written = false, triggers = 0;
      Object.defineProperty(input, "value", { configurable: true, get() {
        const before = native.get!.call(this);
        if (mode === "getter" && armed && written) {
          armed = false; triggers++; native.set!.call(this, "3300"); note.value = "Newer note"; form.refresh();
        }
        return before;
      }, set(value) {
        native.set!.call(this, value); calls++; if (calls > 4) { sentinel = true; throw new Error("Test setter call cap"); }
        written = true;
        if (armed && mode !== "getter") {
          armed = false;
          if (mode === "bind") form.bind(h.ids[1]);
          else if (mode === "dispose") form.dispose();
          else { native.set!.call(this, "Newer name"); note.value = "Newer note"; form.refresh(); }
        }
      } });
      let error: Failure | null;
      try { error = h.error(() => form.unbind()); } finally { delete (input as unknown as { value?: string }).value; }
      return { mode, code: error?.code ?? null, value: input.value, note: note.value, sentinel,
        raw: mode === "dispose" ? h.error(() => form.defaults())?.code : form.read(), ...(mode === "getter" ? { triggers } : {}) };
    });
  });
  expect(result).toEqual([
    { mode: "bind", code: null, value: "Beatrice", note: "Two", sentinel: false, raw: { name: "Beatrice", note: "Two" } },
    { mode: "refresh", code: null, value: "NEWER NAME", note: "NEWER NOTE", sentinel: false, raw: { name: "Newer name", note: "Newer note" } },
    { mode: "dispose", code: null, value: "Capture", note: "One", sentinel: false, raw: "FORM_DISPOSED" },
    { mode: "getter", code: null, value: "3,300", note: "NEWER NOTE", sentinel: false, raw: { name: "3300", note: "Newer note" }, triggers: 1 }
  ]);
});

test("file restoration privately preserves every captured File while defaults expose only the first filename", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formDefaults, root = h.root('<input type="file" data-field="file"><input data-field="name" value="Capture">');
    const input = h.field<HTMLInputElement>(root, "file");
    h.files(input, [new File(["first bytes"], "first.txt", { type: "text/plain", lastModified: 1234 }), new File(["second bytes"], "second.txt", { type: "text/plain", lastModified: 5678 })]);
    const form = h.api.bindForm(root), defaults = form.defaults(), native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!; let filenameWrites = 0;
    Object.defineProperty(input, "value", { configurable: true, get() { return native.get!.call(this); }, set(value) {
      if (value !== "") { filenameWrites++; throw new Error("Do not assign a filename"); } native.set!.call(this, value);
    } });
    h.files(input, [new File(["new"], "new.txt")]); h.edit(h.field(root), "Changed"); form.unbind();
    const files = await Promise.all([...input.files!].map(async file => ({ name: file.name, type: file.type, modified: file.lastModified, content: await file.text() })));
    delete (input as unknown as { value?: string }).value;
    return { defaults, filenameWrites, files, raw: form.read(), noFileObjects: !Object.values(defaults).some(value => value instanceof File) };
  });
  expect(result).toEqual({ defaults: { file: "first.txt", name: "Capture" }, filenameWrites: 0,
    files: [{ name: "first.txt", type: "text/plain", modified: 1234, content: "first bytes" }, { name: "second.txt", type: "text/plain", modified: 5678, content: "second bytes" }],
    raw: { file: "first.txt", name: "Capture" }, noFileObjects: true });
});

test("empty file capture clears later selection while disposal keeps current files and existing restrictions", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, owner = h.make('<input type="file" data-field="file">'), input = h.field<HTMLInputElement>(owner.root, "file");
    h.files(input, [new File(["later"], "later.txt")]); owner.form.unbind(); const cleared = input.files!.length;
    h.files(input, [new File(["current"], "current.txt")]); owner.form.dispose(); const retained = input.files![0].name;
    const next = h.api.bindForm(owner.root), defaults = next.defaults(); next.unbind();
    const rowsRoot = h.root('<input type="file" data-field="file">'), multipleRoot = h.root('<input type="file" multiple data-field="file">');
    return { cleared, retained, defaults, next: input.files![0].name, disposed: h.error(() => owner.form.unbind())?.code,
      rows: h.error(() => h.api.bindForm(rowsRoot, { rows: h.rows }))?.code, multiple: h.error(() => h.api.bindForm(multipleRoot))?.code };
  });
  expect(result).toEqual({ cleared: 0, retained: "current.txt", defaults: { file: "current.txt" }, next: "current.txt", disposed: "FORM_DISPOSED", rows: "FORM_FILE_ROWS", multiple: "FORM_FILE_MULTIPLE" });
});

test("file reconstruction failure precedes DOM error or inactive changes and preflight recursion stays bounded", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, root = h.root('<input data-field="name" value="Capture" required data-format=\'[["upper"]]\'><output data-error-for="name"></output><input type="file" data-field="file">');
    const file = h.field<HTMLInputElement>(root, "file"); h.files(file, [new File(["capture"], "capture.txt")]);
    const form = h.api.bindForm(root); h.files(file, [new File(["new"], "new.txt")]); h.edit(h.field(root), "");
    const before = { html: root.innerHTML, value: h.field(root).value, error: root.querySelector("output")!.textContent, file: file.files![0].name };
    const descriptor = Object.getOwnPropertyDescriptor(window, "DataTransfer")!, Native = DataTransfer;
    let error: Failure | null = null;
    try { Object.defineProperty(window, "DataTransfer", { configurable: true, value: class { constructor() { throw new Error("Native file reconstruction unavailable"); } } }); error = h.error(() => form.unbind()); }
    finally { Object.defineProperty(window, "DataTransfer", descriptor); }
    const unchanged = before.html === root.innerHTML && before.value === h.field<HTMLInputElement>(root).value && before.error === root.querySelector("output")!.textContent && before.file === file.files![0].name;
    h.edit(h.field(root), "Still active"); const active = h.field<HTMLInputElement>(root).value;
    let entries = 0, nested: string | undefined, sentinel = false;
    try { Object.defineProperty(window, "DataTransfer", { configurable: true, value: class extends Native { constructor() {
      super(); entries++; if (entries > 4) { sentinel = true; throw new Error("Test preflight recursion cap"); }
      nested = h.error(() => form.unbind())?.code;
    } } }); form.unbind(); }
    finally { Object.defineProperty(window, "DataTransfer", descriptor); }
    return { code: error?.code, field: error?.detail?.field, cause: error?.cause instanceof Error ? error.cause.message : null, unchanged, active,
      nested, entries, sentinel, restored: [h.field<HTMLInputElement>(root).value, file.files![0].name] };
  });
  expect(result).toEqual({ code: "FORM_UNBIND", field: "file", cause: "Native file reconstruction unavailable", unchanged: true, active: "STILL ACTIVE",
    nested: "FORM_UNBIND", entries: 1, sentinel: false, restored: ["Capture", "capture.txt"] });
});

test("newer full refresh or disposal during file preflight prevents all older restoration writes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, Native = DataTransfer, descriptor = Object.getOwnPropertyDescriptor(window, "DataTransfer")!;
    return ["refresh", "dispose"].map(mode => {
      const root = h.root('<input data-field="name" value="Capture" data-format=\'[["upper"]]\'><input type="file" data-field="file">');
      const file = h.field<HTMLInputElement>(root, "file"); h.files(file, [new File(["capture"], "capture.txt")]);
      const form = h.api.bindForm(root); h.files(file, [new File(["new"], "new.txt")]); h.edit(h.field(root), "Changed"); let armed = true;
      let error: Failure | null = null;
      try { Object.defineProperty(window, "DataTransfer", { configurable: true, value: class extends Native { constructor() {
        super(); if (armed) { armed = false; if (mode === "refresh") form.refresh(); else form.dispose(); }
      } } }); error = h.error(() => form.unbind()); }
      finally { Object.defineProperty(window, "DataTransfer", descriptor); }
      return { mode, code: error?.code ?? null, value: h.field<HTMLInputElement>(root).value, file: file.files![0].name,
        state: mode === "dispose" ? h.error(() => form.defaults())?.code : form.read().name };
    });
  });
  expect(result).toEqual([{ mode: "refresh", code: null, value: "CHANGED", file: "new.txt", state: "Changed" },
    { mode: "dispose", code: null, value: "Changed", file: "new.txt", state: "FORM_DISPOSED" }]);
});

test("Form creation defaults feed an explicit complete Rows factory and a received insert checkpoint", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, root = h.root('<input data-field="name" value="Preset"><input data-field="count" value="005"><span data-field="note">Display</span>');
    const form = h.api.bindForm(root, { rows: h.rows, parse: { count: Number } }); form.bind(h.ids[0]);
    const defaults = form.defaults(), value = { name: String(defaults.name), count: Number(defaults.count), note: "Factory note", hidden: { token: "application" } };
    const [id] = h.rows.appendState([{ value, status: "insert" }]); form.bind(id); h.rows.set(id, "name", "Edited"); h.rows.revert(id);
    const reverted = { status: h.rows.get(id)!.status, value: h.rows.get(id)!.value, display: h.field<HTMLInputElement>(root).value };
    h.rows.set(id, "name", "Latest"); form.dispose(); const ordinaryDisposal = h.field<HTMLInputElement>(root).value;
    return { defaults, reverted, ordinaryDisposal, closed: h.error(() => form.defaults())?.code };
  });
  expect(result).toEqual({ defaults: { name: "Preset", count: 5 }, reverted: { status: "insert", value: { name: "Preset", count: 5, note: "Factory note", hidden: { token: "application" } }, display: "Preset" }, ordinaryDisposal: "Latest", closed: "FORM_DISPOSED" });
});

test("native validation publication stops after unbind during an ARIA write and leaves automatic work inactive", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults;
    return ["local", "rows"].map(mode => {
      const root = h.root('<input type="radio" name="choice" data-field="choice" value="a" required>' +
        '<input type="radio" name="choice" data-field="choice" value="b"><output data-error-for="choice"></output>' +
        '<input data-field="name" value="Capture" required data-format=\'[["upper"]]\'><output data-error-for="name"></output>');
      const members = [...root.querySelectorAll<HTMLInputElement>('[data-field="choice"]')], input = h.field<HTMLInputElement>(root);
      let formats = 0;
      if (mode === "rows") { h.rows.set(h.ids[0], "choice", null); h.rows.set(h.ids[0], "name", ""); }
      const form = h.api.bindForm(root, { ...(mode === "rows" ? { rows: h.rows } : {}),
        rules: { format: { upper: value => { formats++; return String(value).toUpperCase(); } } } });
      if (mode === "rows") form.bind(h.ids[0]); else input.value = "";
      const source = h.rows.entries(), native = Element.prototype.setAttribute;
      let armed = true, reactions = 0, sentinel = false, valid = true, error: Failure | null = null;
      formats = 0;
      Object.defineProperty(members[0], "setAttribute", { configurable: true, value: function(this: Element, name: string, value: string) {
        native.call(this, name, value);
        if (name === "aria-invalid" && value === "true") {
          reactions++; if (reactions > 4) { sentinel = true; throw new Error("Test ARIA reaction cap"); }
          if (armed) { armed = false; form.unbind(); }
        }
      } });
      try { error = h.error(() => { valid = form.validate().valid; }); }
      finally { delete (members[0] as unknown as { setAttribute?: Element["setAttribute"] }).setAttribute; }
      const restored = { value: input.value, invalid: [...members, input].map(element => element.getAttribute("aria-invalid")),
        errors: [...root.querySelectorAll("output")].map(element => element.textContent) };
      h.edit(input, "Quiet"); input.focus(); input.blur();
      return { mode, code: error?.code ?? null, valid, reactions, sentinel, restored,
        inactive: input.value === "Quiet" && formats === 0, unchanged: source === h.rows.entries(),
        detached: mode === "local" || Object.values(form.read()).every(value => value === undefined) };
    });
  });
  expect(result).toEqual(["local", "rows"].map(mode => ({ mode, code: null, valid: false, reactions: 1, sentinel: false,
    restored: { value: "Capture", invalid: [null, null, null], errors: ["", ""] }, inactive: true, unchanged: true, detached: true })));
});

test("a canceled local render cannot erase newer validation or resume handlers through a rejected nested bind", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDefaults, root = h.root('<input data-field="name" value="Capture" required><output data-error-for="name"></output><span data-field="note"><b>Authored</b></span>');
    const note = h.field(root, "note"), original = note.firstChild; let form: FormHandle<Values> | undefined, armed = false, calls = 0, sentinel = false, nested: string | undefined;
    form = h.api.bindForm(root, { render: { note: (value, context) => {
      calls++; if (calls > 4) { sentinel = true; throw new Error("Test local render cap"); }
      if (armed) { armed = false; form!.unbind(); h.field<HTMLInputElement>(root).value = ""; form!.validate(); nested = h.error(() => form!.bind(null))?.code; return "Stale result"; }
      return `${value}:${context.values.name}`;
    } } });
    calls = 0; armed = true; const error = h.error(() => form!.bind(null));
    const preserved = { value: h.field<HTMLInputElement>(root).value, invalid: h.field(root).getAttribute("aria-invalid"), error: root.querySelector("output")!.textContent,
      exact: note.firstChild === original, calls };
    h.edit(h.field(root), "Quiet"); const quiet = { calls, note: note.textContent, error: root.querySelector("output")!.textContent };
    calls = 0; form.refresh();
    return { code: error?.code ?? null, nested, sentinel, preserved, quiet, resumed: note.textContent };
  });
  expect(result.code).toBeNull(); expect(result.nested).toBe("FORM_RENDER"); expect(result.sentinel).toBe(false);
  expect(result.preserved).toMatchObject({ value: "", invalid: "true", exact: true, calls: 1 }); expect(result.preserved.error).not.toBe("");
  expect(result.quiet).toEqual({ calls: 1, note: "Authored", error: result.preserved.error }); expect(result.resumed).toBe("Authored:Quiet");
});

for (const layout of ["side", "stack"] as const) {
  test(layout + " CVC restores captured search fields without a request or changes to another page then resumes formatting", async ({ page }) => {
    const requests: unknown[] = [], errors: Error[] = [];
    page.on("pageerror", error => errors.push(error));
    page.on("request", request => { if (request.url().includes("/api/employees/search")) requests.push(request.postDataJSON()); });
    await page.goto("/m4/" + layout + ".html"); await page.locator('[data-action="open"]').click();
    const screens = page.locator('[data-page="employees"]'); await expect(screens).toHaveCount(2);
    await expect(screens.nth(0).locator("tbody tr")).toHaveCount(3); await expect(screens.nth(1).locator("tbody tr")).toHaveCount(3);
    const first = screens.nth(0), second = screens.nth(1), query = first.locator('[data-role="search"] [data-field="query"]'), other = second.locator('[data-role="search"] [data-field="query"]');
    await query.fill("ada"); await query.blur(); await other.fill("grace"); await other.blur();
    await expect(query).toHaveValue("ADA"); await expect(other).toHaveValue("GRACE"); const before = requests.length;
    await first.locator('[data-action="restore-search"]').click(); await expect(query).toHaveValue("");
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
    expect(requests).toHaveLength(before); await expect(other).toHaveValue("GRACE");
    await expect(first.locator("tbody tr")).toHaveCount(3); await expect(second.locator("tbody tr")).toHaveCount(3);
    await query.fill("ada"); await query.blur(); await expect(query).toHaveValue("ADA");
    const request = page.waitForRequest(request => request.url().includes("/api/employees/search"));
    await first.locator('[data-role="search"] button[type="submit"]').click(); expect((await request).postDataJSON()).toEqual({ query: "ada" });
    await expect(first.locator("tbody tr")).toHaveCount(1); await expect(second.locator("tbody tr")).toHaveCount(3); expect(errors).toEqual([]);
  });
}
