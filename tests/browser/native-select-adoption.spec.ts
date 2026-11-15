// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { createRows } from "../../src/data/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindGrid } from "../../src/ui/grid.js";
import type { bindList } from "../../src/ui/list.js";
import type { bindSelect } from "../../src/ui/select.js";
import type { SelectValue } from "../../src/ui/index.js";

declare global {
  interface Window {
    adoptedSelects: {
      rows: typeof createRows; form: typeof bindForm; grid: typeof bindGrid; list: typeof bindList; select: typeof bindSelect;
      root(html?: string): HTMLFormElement;
      code(run: () => unknown): string;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { data: source("../../src/data/index.ts"), form: source("../../src/ui/form.ts"),
  grid: source("../../src/ui/grid.ts"), list: source("../../src/ui/list.ts"), select: source("../../src/ui/select.ts") };
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async urls => {
    const [data, form, grid, list, select] = await Promise.all([import(urls.data), import(urls.form), import(urls.grid), import(urls.list), import(urls.select)]);
    window.adoptedSelects = {
      rows: data.createRows, form: form.bindForm, grid: grid.bindGrid, list: list.bindList, select: select.bindSelect,
      root(html = '<label>Choice <select data-field="chosen"><option value="">Choose</option><option value="a" selected>A</option></select></label><output data-error-for="chosen"></output>') {
        const root = document.createElement("form"); root.innerHTML = html; document.body.append(root); return root;
      },
      code(run) { try { run(); return "none"; } catch (cause) { return (cause as { code?: string }).code ?? "unknown"; } }
    };
  }, modules);
});

test("Form adopts A C R typed occurrences and its original handle reads native callback values", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.adoptedSelects, root = h.root('<select multiple aria-label="Choices" data-field="chosen" data-options="nested.codes" data-option-label="label" data-option-value="code"><option value="">Choose</option><option value="a">A</option></select>');
    const element = root.querySelector("select")!, calls: unknown[] = [];
    const common = h.select<SelectValue>(element, { choices: [0, false, "", null, 0].map(value => ({ value, label: String(value) })), onChange(value) { calls.push(value); } });
    const rows = h.rows([{ chosen: [0, false, "", null, 0, false], nested: { codes: [{ label: "R false", code: false }, { label: "R", code: "r" }] } }]);
    const id = rows.entries()[0].id, form = h.form(root, { rows }); form.bind(id);
    const initial = common.value(), indexes = [...element.selectedOptions].map(option => option.index), labels = [...element.options].map(option => option.textContent);
    let events = 0; rows.subscribe(() => events++);
    for (const [index, option] of [...element.options].entries()) option.selected = [3, 5].includes(index);
    element.dispatchEvent(new Event("change", { bubbles: true }));
    const raw = rows.get(id)!.value.chosen, read = common.value();
    const locked = [h.code(() => common.setValue([0])), h.code(() => common.dispose())];
    form.rescan(); const retained = common.value(); form.dispose(); common.dispose(); rows.dispose();
    return { initial, indexes, labels, raw, read, calls, events, locked, retained };
  });
  expect(result).toEqual({ initial: [null, 0, false, "", 0, false], indexes: [0, 2, 3, 4, 6, 7],
    labels: ["Choose", "A", "0", "false", "", "null", "0", "R false", "R"], raw: [false, null], read: [null, false],
    calls: [[false, null]], events: 1, locked: ["SELECT_OWNED", "SELECT_OWNED"], retained: [null, false] });
});

test("Form D0 native defaults and standalone A0 unwind independently after common replacement", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.adoptedSelects, root = h.root(), element = root.querySelector("select")!;
    const nodes = [...element.childNodes], authored = [...element.options].map(option => ({ option, selected: option.selected, defaultSelected: option.defaultSelected }));
    const common = h.select<SelectValue>(element, { choices: [{ value: 0, label: "Zero" }], value: 0 }), form = h.form(root);
    const defaults = form.defaults(); common.setChoices([{ value: 0, label: "New zero" }, { value: false, label: "False" }]);
    form.unbind(); const captured = common.value(); root.reset(); const native = common.value();
    const unchanged = form.defaults(); form.dispose(); const released = common.value();
    common.setValue(false); const standalone = common.value(); common.dispose();
    return { defaults, captured, native, unchanged, released, standalone, restored: nodes.length === element.childNodes.length && nodes.every((node, index) => node === element.childNodes[index]),
      flags: authored.every(state => state.option.selected === state.selected && state.option.defaultSelected === state.defaultSelected) };
  });
  expect(result).toEqual({ defaults: { chosen: 0 }, captured: 0, native: "a", unchanged: { chosen: 0 }, released: 0, standalone: false, restored: true, flags: true });
});

test("mediated common catalogs preserve current hidden drafts and suffix without hook replay", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.adoptedSelects, root = h.root('<select aria-label="Choice" data-field="chosen" data-options="codes" data-option-label="label" data-option-value="code"></select><output data-error-for="chosen"></output>');
    const element = root.querySelector("select")!, common = h.select<SelectValue>(element, { choices: [{ value: 0, label: "Zero" }], value: 0 });
    const rows = h.rows([{ chosen: 0 as SelectValue, codes: [{ label: "R", code: "r" }] }, { chosen: 0 as SelectValue, codes: [{ label: "Other", code: "s" }] }]);
    const ids = rows.entries().map(row => row.id); let hooks = 0, events = 0, native = 0;
    const form = h.form(root, { rows, beforeBindValue() { hooks++; }, rules: { fields: { chosen: { validate: [["onlyZero"]] } }, validate: { onlyZero: value => value === "0" || "Keep zero" } } });
    rows.subscribe(() => events++); element.addEventListener("change", () => native++); form.bind(ids[0]);
    element.selectedIndex = 1; element.dispatchEvent(new Event("change", { bubbles: true }));
    const before = hooks, message = root.querySelector("output")!.textContent;
    common.setChoices([{ value: 0, label: "Zero again" }, { value: false, label: "False" }]);
    const quiet = hooks === before, draft = common.value(), sameMessage = root.querySelector("output")!.textContent === message;
    form.bind(ids[1]); common.setChoices([{ value: 0, label: "Final zero" }]); form.bind(ids[0]);
    const returned = common.value(), raw = rows.entries().map(row => row.value.chosen), defaults = form.defaults();
    form.dispose(); common.dispose(); rows.dispose(); return { quiet, draft, sameMessage, returned, raw, defaults, events, native, message };
  });
  expect(result).toEqual({ quiet: true, draft: "r", sameMessage: true, returned: "r", raw: [0, 0], defaults: { chosen: 0 }, events: 0, native: 1, message: "Keep zero" });
});

test("cached explicit projection rejects unavailable common replacement before native mutation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.adoptedSelects, root = h.root(), element = root.querySelector("select")!;
    const common = h.select<SelectValue>(element, { choices: [0, false].map(value => ({ value, label: String(value) })), value: 0 });
    const rows = h.rows([{ chosen: 0 }]), id = rows.entries()[0].id; let hooks = 0;
    const form = h.form(root, { rows, beforeBindValue() { hooks++; return false; } }); form.bind(id);
    const nodes = [...element.childNodes], snapshot = rows.get(id), before = hooks;
    const code = h.code(() => common.setChoices([{ value: 0, label: "Only zero" }]));
    const unchanged = nodes.length === element.childNodes.length && nodes.every((node, index) => node === element.childNodes[index]);
    const shown = common.value(), quiet = hooks === before, raw = rows.get(id) === snapshot;
    form.dispose(); common.dispose(); rows.dispose(); return { code, unchanged, shown, quiet, raw };
  });
  expect(result).toEqual({ code: "FORM_VALUE", unchanged: true, shown: false, quiet: true, raw: true });
});

test("failed common native publication restores exact options raw map focus and usable ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.adoptedSelects, root = h.root(), element = root.querySelector("select")!;
    const common = h.select(element, { choices: [{ value: 0, label: "Zero" }], value: 0 });
    const rows = h.rows([{ chosen: 0 }]), id = rows.entries()[0].id, form = h.form(root, { rows }); form.bind(id); element.focus();
    const options = [...element.options], native = element.replaceChildren; let armed = true;
    element.replaceChildren = function (...nodes) { native.apply(this, nodes); if (armed) { armed = false; throw new Error("native publication"); } };
    const failed = h.code(() => common.setChoices([{ value: 0, label: "Changed" }]));
    const restored = element.options.length === options.length && options.every((option, index) => element.options[index] === option);
    const value = common.value(), focused = document.activeElement === element; element.replaceChildren = native;
    common.setChoices([{ value: 0, label: "Retry" }]); const retry = common.value(), label = element.options[element.selectedIndex].textContent;
    form.dispose(); common.dispose(); rows.dispose(); return { failed, restored, value, focused, retry, label };
  });
  expect(result).toEqual({ failed: "unknown", restored: true, value: 0, focused: true, retry: 0, label: "Retry" });
});

test("common choice getter cannot overwrite a disposed Form and newer adoption", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.adoptedSelects, root = h.root(), element = root.querySelector("select")!;
    const common = h.select<SelectValue>(element, { choices: [{ value: 0, label: "Zero" }, { value: false, label: "False" }] });
    const rows = h.rows([{ chosen: 0 as SelectValue }, { chosen: false as SelectValue }]), ids = rows.entries().map(row => row.id);
    const old = h.form(root, { rows }); old.bind(ids[0]); let next: ReturnType<typeof bindForm> | undefined;
    const code = h.code(() => common.setChoices([{ value: 0, get label() { old.dispose(); next = h.form(root, { rows }); next.bind(ids[1]); return "Late"; } }]));
    const current = common.value(), raw = rows.get(ids[1])!.value.chosen, labels = [...element.options].map(option => option.textContent);
    next!.dispose(); common.dispose(); rows.dispose(); return { code, current, raw, labels };
  });
  expect(result).toEqual({ code: "SELECT_STALE", current: false, raw: false, labels: ["Choose", "A", "Zero", "False"] });
});

for (const kind of ["grid", "list"] as const) {
  test(`${kind} captures typed common templates and retains per-RowId suffixes through view reuse`, async ({ page }) => {
    const result = await page.evaluate(kind => {
      const h = window.adoptedSelects, root = document.createElement(kind === "grid" ? "table" : "ul");
      const choices = '<select aria-label="Choice" data-field="chosen" data-options="nested.codes" data-option-label="label" data-option-value="code"><option value="">Choose</option></select>';
      root.innerHTML = kind === "grid" ? `<caption>Choices</caption><tbody><tr data-row-template><td>${choices}</td></tr></tbody>` : `<li data-row-template>${choices}</li>`; document.body.append(root);
      const template = root.querySelector("select")!, common = h.select(template, { choices: [{ value: 0, label: "Common zero" }] });
      const rows = h.rows([{ chosen: false as SelectValue, nested: { codes: [{ label: "First false", code: false as SelectValue }] } },
        { chosen: "" as SelectValue, nested: { codes: [{ label: "Second empty", code: "" as SelectValue }] } }]);
      const ids = rows.entries().map(row => row.id), owner = kind === "grid" ? h.grid(root as HTMLTableElement, { rows }) : h.list(root as HTMLUListElement, { rows });
      const initial = [...root.querySelectorAll("select")].map(select => select.options[select.selectedIndex]?.textContent);
      const locked = [h.code(() => common.setChoices([])), h.code(() => common.setValue(0)), h.code(() => common.dispose())];
      owner.setPage({ page: 1, size: 1 }); owner.setPage({ page: 2, size: 1 });
      rows.set(ids[0], "nested", { codes: [{ label: "Updated false", code: false }] }); owner.setPage({ page: 1, size: 1 });
      const selected = root.querySelector("select")!, shown = selected.options[selected.selectedIndex]?.textContent;
      const disabled = selected.disabled; owner.dispose(); common.setChoices([{ value: 0, label: "Released zero" }]);
      const released = [...template.options].map(option => option.textContent); common.dispose(); rows.dispose();
      return { initial, locked, shown, disabled, released };
    }, kind);
    expect(result).toEqual({ initial: ["First false", "Second empty"], locked: ["SELECT_OWNED", "SELECT_OWNED", "SELECT_OWNED"],
      shown: "Updated false", disabled: kind === "list", released: ["Choose", "Released zero"] });
  });

  test(`${kind} rejects a common catalog changed between descriptor capture and template claim`, async ({ page }) => {
    const result = await page.evaluate(kind => {
      const h = window.adoptedSelects, root = document.createElement(kind === "grid" ? "table" : "ul");
      root.innerHTML = kind === "grid" ? '<tbody><tr data-row-template><td><select data-field="chosen"><option value="">Choose</option></select></td></tr></tbody>' : '<li data-row-template><select data-field="chosen"><option value="">Choose</option></select></li>'; document.body.append(root);
      const element = root.querySelector("select")!, common = h.select<SelectValue>(element, { choices: [{ value: 0, label: "Zero" }] });
      const native = element.getAttribute; let formats = 0;
      element.getAttribute = function (name) { if (name === "data-format" && ++formats === 2) common.setChoices([{ value: false, label: "New false" }]); return native.call(this, name); };
      const rows = h.rows([{ chosen: false }]);
      const create = () => kind === "grid" ? h.grid(root as HTMLTableElement, { rows }) : h.list(root as HTMLUListElement, { rows });
      const code = h.code(create); element.getAttribute = native;
      const next = create(), shown = root.querySelector("select")!.selectedIndex; next.dispose(); common.dispose(); rows.dispose();
      return { code, shown, reads: formats >= 2 };
    }, kind);
    expect(result).toEqual({ code: kind === "grid" ? "GRID_OPTIONS" : "LIST_OPTIONS", shown: 1, reads: true });
  });
}

test("provisional Select rejects Form adoption and duplicate binding before publishing readiness", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.adoptedSelects, root = h.root(), element = root.querySelector("select")!, codes: string[] = [];
    const common = h.select(element, { get choices() {
      codes.push(h.code(() => h.form(root))); codes.push(h.code(() => h.select(element, { choices: [] })));
      return [{ value: 0, label: "Zero" }];
    }, value: 0 });
    const form = h.form(root), ready = common.value(); form.dispose(); common.dispose(); return { codes, ready };
  });
  expect(result).toEqual({ codes: ["SELECT_OWNED", "SELECT_OWNED"], ready: 0 });
});

test("public value snapshot stops late writes after getter disposal and replacement", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.adoptedSelects, root = h.root('<select multiple aria-label="Choices"></select>'), element = root.querySelector("select")!;
    const old = h.select<SelectValue>(element, { choices: [{ value: 0, label: "Zero" }], value: [0] });
    let next: ReturnType<typeof bindSelect<SelectValue>> | undefined;
    const values: SelectValue[] = [];
    Object.defineProperty(values, 0, { get() { old.dispose(); next = h.select(element, { choices: [{ value: false, label: "False" }], value: [false] }); return 0; } });
    const code = h.code(() => old.setValue(values)), current = next!.value(), labels = [...element.options].map(option => option.textContent); next!.dispose();
    return { code, current, labels };
  });
  expect(result).toEqual({ code: "SELECT_DISPOSED", current: [false], labels: ["False"] });
});

test("native multi Select writes stop before touching a newer owner after disposal", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.adoptedSelects, root = h.root('<select multiple aria-label="Choices"></select>'), element = root.querySelector("select")!;
    const old = h.select<SelectValue>(element, { choices: [0, 1].map(value => ({ value, label: String(value) })) });
    const first = element.options[0], native = Object.getOwnPropertyDescriptor(HTMLOptionElement.prototype, "selected")!;
    let next: ReturnType<typeof bindSelect<SelectValue>> | undefined, armed = true;
    Object.defineProperty(first, "selected", { configurable: true, get() { return native.get!.call(this); }, set(value) {
      if (armed) { armed = false; old.dispose(); next = h.select<SelectValue>(element, { choices: [{ value: false, label: "New false" }, { value: 0, label: "New zero" }], value: [false] }); }
      native.set!.call(this, value);
    } });
    const code = h.code(() => old.setValue([0, 1])), current = next!.value(), selected = [...element.selectedOptions].map(option => option.textContent); next!.dispose();
    return { code, current, selected };
  });
  expect(result).toEqual({ code: "SELECT_DISPOSED", current: [false], selected: ["New false"] });
});

test("Form rejects a newly published common handle after plain descriptor capture", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.adoptedSelects, root = h.root(), element = root.querySelector("select")!;
    let common: ReturnType<typeof bindSelect<SelectValue>> | undefined;
    const code = h.code(() => h.form(root, { get render() {
      if (!common) common = h.select<SelectValue>(element, { choices: [{ value: false, label: "False" }], value: false });
      return {};
    } }));
    const raw = common!.value(), retry = h.form(root), defaults = retry.defaults();
    retry.dispose(); common!.dispose(); return { code, raw, defaults };
  });
  expect(result).toEqual({ code: "FORM_OPTIONS", raw: false, defaults: { chosen: false } });
});

for (const phase of ["prefix", "suffix"] as const) {
  test(`Form disposal during ${phase} native publication preserves committed common catalog for new adoption`, async ({ page }) => {
    const result = await page.evaluate(phase => {
      const h = window.adoptedSelects, root = h.root('<select aria-label="Choice" data-field="chosen" data-options="codes" data-option-label="label" data-option-value="code"><option value="">Choose</option></select>');
      const element = root.querySelector("select")!, authored = [...element.childNodes];
      const common = h.select<SelectValue>(element, { choices: [{ value: 0, label: "Zero" }, { value: false, label: "False" }], value: 0 });
      const rows = h.rows([{ chosen: false as SelectValue, codes: [{ label: "First row", code: "first" }] }, { chosen: 0 as SelectValue, codes: [{ label: "Second row", code: "second" }] }]);
      const old = h.form(root, { rows }); old.bind(1);
      const native = element.replaceChildren; let calls = 0, armed = true, next: ReturnType<typeof bindForm> | undefined;
      element.replaceChildren = function (...nodes) {
        native.apply(this, nodes); calls++;
        if (armed && calls === (phase === "prefix" ? 1 : 2)) {
          armed = false; old.dispose(); next = h.form(root, { rows }); next.bind(2);
        }
      };
      const failure = h.code(() => common.setChoices([{ value: 0, label: "Uncommitted zero" }, { value: false, label: "Uncommitted false" }]));
      const retained = { raw: common.value(), read: next!.read(), labels: [...element.options].map(option => option.textContent), unchanged: rows.changes().length === 0 };
      element.replaceChildren = native;
      common.setChoices([{ value: 0, label: "Committed zero" }, { value: false, label: "Committed false" }]);
      const retry = { raw: common.value(), labels: [...element.options].map(option => option.textContent) };
      next!.dispose(); common.dispose(); rows.dispose();
      return { failure, retained, retry, restored: element.childNodes.length === authored.length && authored.every((node, index) => node === element.childNodes[index]) };
    }, phase);
    expect(result).toEqual({ failure: phase === "prefix" ? "SELECT_STALE" : "FORM_OPTIONS",
      retained: { raw: 0, read: { chosen: 0 }, labels: ["Choose", "Zero", "False", "Second row"], unchanged: true },
      retry: { raw: 0, labels: ["Choose", "Committed zero", "Committed false", "Second row"] }, restored: true });
  });
}

for (const thrown of ["null", "undefined"] as const) {
  test(`Form releases both Select leases after a restoration throws ${thrown}`, async ({ page }) => {
    const result = await page.evaluate(thrown => {
      const h = window.adoptedSelects, root = h.root('<select aria-label="First" data-field="first" data-options="codes" data-option-label="label" data-option-value="code"><option value="">First</option></select><select aria-label="Second" data-field="second" data-options="codes" data-option-label="label" data-option-value="code"><option value="">Second</option></select>');
      const [first, second] = [...root.querySelectorAll("select")], originals = [first, second].map(element => [...element.childNodes]);
      const a = h.select<SelectValue>(first, { choices: [{ value: 0, label: "A zero" }], value: 0 });
      const b = h.select<SelectValue>(second, { choices: [{ value: 0, label: "B zero" }, { value: false, label: "B false" }], value: 0 });
      const rows = h.rows([{ first: "r", second: "r", codes: [{ label: "Row", code: "r" }] }]), snapshot = rows.entries();
      const form = h.form(root, { rows }); form.bind(1);
      const native = first.replaceChildren, failure = thrown === "null" ? null : undefined;
      first.replaceChildren = function () { throw failure; };
      let failed = false, same = false;
      try { form.dispose(); } catch (cause) { failed = true; same = Object.is(cause, failure); }
      first.replaceChildren = native;
      const sibling = { value: b.value(), labels: [...second.options].map(option => option.textContent) };
      const retry = [h.code(() => a.setChoices([{ value: 0, label: "Retry zero" }, { value: "r", label: "Retry row" }])), h.code(() => b.setValue(false))];
      const values = [a.value(), b.value()], unchanged = rows.entries() === snapshot;
      form.dispose(); a.dispose(); b.dispose(); rows.dispose();
      return { failed, same, sibling, retry, values, unchanged,
        restored: [first, second].every((element, index) => element.childNodes.length === originals[index].length && originals[index].every((node, at) => node === element.childNodes[at])) };
    }, thrown);
    expect(result).toEqual({ failed: true, same: true, sibling: { value: 0, labels: ["Second", "B zero", "B false"] },
      retry: ["none", "none"], values: ["r", false], unchanged: true, restored: true });
  });
}

test("standalone native publication rejects mixed-catalog Form adoption then admits the settled catalog", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.adoptedSelects, root = h.root(), element = root.querySelector("select")!, authored = [...element.childNodes];
    const common = h.select<SelectValue>(element, { choices: [{ value: 0, label: "Old zero" }], value: 0 });
    const native = element.replaceChildren; let armed = true, blocked = "none", workingRead = "none", mutations: string[] = [];
    element.replaceChildren = function (...nodes) {
      native.apply(this, nodes);
      if (armed) {
        armed = false;
        workingRead = h.code(() => common.value());
        blocked = h.code(() => h.form(root));
        mutations = [h.code(() => common.setValue(0)), h.code(() => common.setChoices([])), h.code(() => common.dispose())];
      }
    };
    common.setChoices([{ value: 0, label: "New zero" }, { value: false, label: "New false" }]);
    element.replaceChildren = native;
    const settled = { value: common.value(), labels: [...element.options].map(option => option.textContent) };
    const rows = h.rows([{ chosen: false }]), form = h.form(root, { rows }); form.bind(1);
    const adopted = { value: common.value(), read: form.read(), defaults: form.defaults(), label: element.options[element.selectedIndex].textContent };
    form.dispose(); common.dispose(); rows.dispose();
    return { blocked, workingRead, mutations, settled, adopted, restored: authored.length === element.childNodes.length && authored.every((node, index) => node === element.childNodes[index]) };
  });
  expect(result).toEqual({ blocked: "SELECT_OWNED", workingRead: "none", mutations: ["SELECT_OWNED", "SELECT_OWNED", "SELECT_OWNED"], settled: { value: 0, labels: ["Choose", "A", "New zero", "New false"] },
    adopted: { value: false, read: { chosen: false }, defaults: { chosen: 0 }, label: "New false" }, restored: true });
});
