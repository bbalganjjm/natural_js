// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Rows } from "../../src/data/index.js";
import type { FormHandle, GridHandle } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = { key: number; profile: { name: string; note: string }; mode: string | null;
  active: boolean; channels: string[]; tags: string[]; chosen: number | null;
  choices: { label: string; value: number }[]; avatar: string | null; summary: string; constant: number };
type Options = Parameters<typeof bindGrid<Item>>[1];
declare global {
  interface Window {
    changeState: {
      rows: Rows<Item>; grid: GridHandle<Item>; form: FormHandle<Item>; host: HTMLElement;
      table: HTMLTableElement; formRoot: HTMLFormElement; scroll: HTMLElement;
      tableSource: string; formMarkers: (string | null)[];
      reset(count?: number, extra?: Partial<Options>, preedit?: boolean): void;
      item(index: number): Item;
      block(id: number): HTMLTableRowElement[];
      fields<E extends HTMLElement = HTMLElement>(id: number, name: string): E[];
      formFields<E extends HTMLElement = HTMLElement>(name: string): E[];
      markers(id: number, name: string): (string | null)[];
      settle(): Promise<void>;
    };
  }
}
const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { data: source("../../src/data/index.ts"), grid: source("../../src/ui/grid.ts"), form: source("../../src/ui/form.ts") };
const controls = (prefix: string, options = false) => `<label>Mode <input type="radio" name="${prefix}-mode" data-field="mode" value="office">Office</label>
  <label><input type="radio" name="${prefix}-mode" data-field="mode" value="remote">Remote</label>
  <label>Channels <input type="checkbox" data-field="channels" value="email">Email</label>
  <label><input type="checkbox" data-field="channels" value="sms">SMS</label>
  <label>Tags <select multiple data-field="tags"><option value="a">Alpha</option><option value="b">Beta</option><option value="c">Gamma</option></select></label>
  <label>Choice <select data-field="chosen" ${options ? 'data-options="choices" data-option-label="label" data-option-value="value"' : ""}>
    ${options ? "" : '<option value="11">Eleven</option><option value="22">Twenty two</option>'}</select></label>
  <label><input type="checkbox" data-field="active">Active</label>`;
const tableMarkup = `<caption>Committed employee fields</caption><colgroup span="3"></colgroup>
  <thead><tr><th scope="col" data-column="key">Identity</th><th scope="col" data-column="profile">Profile</th><th scope="col" data-column="settings">Settings</th></tr></thead>
  <tbody data-row-template><tr><th scope="row" data-column="key" rowspan="2"><span data-field="key"></span>
    <button type="button" data-select-row>Select record</button><label><input type="checkbox" data-check-row>Check record</label>
    <button type="button" data-row-action="undo">Undo changes</button></th>
    <td data-column="profile" data-profile-cell data-field-changed="cell-authored"><label>Name <input data-field="profile.name" required minlength="2" data-field-changed="grid-authored"></label>
      <output data-error-for="profile.name" data-field-changed="error-authored"></output></td>
    <td data-column="settings">${controls("grid", true)}</td></tr>
    <tr><td data-column="profile"><label>Note <textarea data-field="profile.note"></textarea></label>
      <span data-field="constant" data-format='[["fixed"]]'></span></td>
    <td data-column="settings"><img data-field="avatar" alt="Employee portrait"><span data-field="summary"><em>Authored summary</em></span></td></tr></tbody>`;
const formMarkup = `<fieldset><legend>Shared employee editor</legend>
  <label>Name <input data-field="profile.name" required minlength="2" data-field-changed="form-authored"></label>
  <output data-error-for="profile.name" data-field-changed="form-error-authored"></output>
  <label>Note <textarea data-field="profile.note"></textarea></label>${controls("form")}
  <span data-field="constant" data-format='[["fixed"]]'></span>
  <img data-field="avatar" alt="Form employee portrait"><span data-field="summary"><em>Original form summary</em></span>
  </fieldset>`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, tableMarkup, formMarkup }) => {
    const [{ createRows }, { bindGrid }, { bindForm }] = await Promise.all([import(modules.data), import(modules.grid), import(modules.form)]);
    const host = document.createElement("section"); host.setAttribute("data-change-state", "");
    host.innerHTML = '<h2>Committed field state</h2><form data-shared-form></form><div data-change-scroll role="region" aria-label="Committed employee rows" tabindex="0" style="height:260px;width:1000px;overflow:auto"><table></table></div>';
    const style = document.createElement("style");
    style.textContent = '[data-change-state]{font:14px/20px sans-serif}[data-change-state] table{width:980px;table-layout:fixed;border-collapse:collapse}[data-change-state] th,[data-change-state] td{padding:3px;vertical-align:top}[data-change-state] label{display:block}[data-change-state] input:not([type=radio]):not([type=checkbox]),[data-change-state] textarea,[data-change-state] select{max-width:150px}[data-change-state] output:empty{display:none}[data-change-state] img{width:1px;height:1px}';
    host.append(style); document.body.append(host);
    const formRoot = host.querySelector<HTMLFormElement>("form")!, table = host.querySelector<HTMLTableElement>("table")!;
    const scroll = host.querySelector<HTMLElement>("[data-change-scroll]")!;
    const h: Window["changeState"] = {
      host, table, formRoot, scroll, rows: null as unknown as Rows<Item>, grid: null as unknown as GridHandle<Item>,
      form: null as unknown as FormHandle<Item>, tableSource: "", formMarkers: [],
      item(index) { return { key: index, profile: { name: `Person ${index}`, note: `Note ${index}` }, mode: "office", active: true,
        channels: ["email"], tags: ["a", "b"], chosen: 11, choices: [{ label: "Eleven", value: 11 }, { label: "Twenty two", value: 22 }],
        avatar: null, summary: `Summary ${index}`, constant: 1 }; },
      reset(count = 3, extra: Partial<Options> = {}, preedit = false) {
        h.form?.dispose(); h.grid?.dispose(); h.rows?.dispose();
        formRoot.innerHTML = formMarkup; table.innerHTML = tableMarkup; scroll.scrollTop = 0;
        h.tableSource = table.outerHTML;
        h.formMarkers = [...formRoot.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field-changed"));
        h.rows = createRows(Array.from({ length: count }, (_, index) => h.item(index + 1)));
        if (preedit) h.rows.set(1, "profile", { name: "Already edited", note: "Note 1" });
        const render = { summary(value: unknown, context: { element?: HTMLElement }) {
          const strong = context.element!.ownerDocument.createElement("strong"); strong.textContent = String(value ?? ""); return strong;
        } };
        const rules = { format: { fixed: () => "Same display" } };
        h.grid = bindGrid(table, { rows: h.rows, rules, render, paste: true, multiple: true,
          onRowBind(context: { row: { id: number }; elements: readonly HTMLTableRowElement[]; own(dispose: () => void): void }) {
            for (const element of context.elements) element.dataset.changeRow = String(context.row.id);
            context.own(() => { for (const element of context.elements) delete element.dataset.changeRow; });
          },
          onRowAction({ action, id }: { action: string; id: number }) { if (action === "undo") h.rows.revert(id); }, ...extra });
        h.form = bindForm(formRoot, { rows: h.rows, rules, render, parse: { chosen: (value: string) => value === "" ? null : Number(value) } });
        h.form.bind(h.rows.entries()[0]?.id ?? null);
      },
      block: id => [...table.querySelectorAll<HTMLTableRowElement>(`[data-change-row="${id}"]`)],
      fields<E extends HTMLElement = HTMLElement>(id: number, name: string): E[] {
        return h.block(id).flatMap(row => [...row.querySelectorAll<E>(`[data-field="${name}"]`)]);
      },
      formFields<E extends HTMLElement = HTMLElement>(name: string): E[] {
        return [...formRoot.querySelectorAll<E>(`[data-field="${name}"]`)];
      },
      markers: (id, name) => h.fields(id, name).map(element => element.getAttribute("data-field-changed")),
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    };
    window.changeState = h; h.reset();
  }, { modules, tableMarkup, formMarkup });
});

test("loaded clean fields are explicit false while errors and unbound cells keep authored markers", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.changeState;
    return { grid: h.block(1).flatMap(row => [...row.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field-changed"))),
      form: [...h.formRoot.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field-changed")),
      cell: h.block(1)[0].querySelector("[data-profile-cell]")!.getAttribute("data-field-changed"),
      error: h.block(1)[0].querySelector("output")!.getAttribute("data-field-changed") };
  });
  expect(result.grid.length).toBeGreaterThan(10); expect(new Set(result.grid)).toEqual(new Set(["false"]));
  expect(new Set(result.form)).toEqual(new Set(["false"])); expect(result.cell).toBe("cell-authored"); expect(result.error).toBe("error-authored");
});

test("binders created after an edit use the loaded baseline rather than their initial display", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState; h.reset(3, {}, true);
    return { grid: h.markers(1, "profile.name"), form: h.formFields("profile.name")[0].getAttribute("data-field-changed"),
      sibling: h.markers(1, "profile.note"), original: h.rows.original(1)?.profile.name, value: h.rows.get(1)?.value.profile.name }; });
  expect(result).toEqual({ grid: ["true"], form: "true", sibling: ["false"], original: "Person 1", value: "Already edited" });
});

test("nested sibling paths change and restore independently in shared Form and Grid", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState;
    h.rows.set(1, "profile", { name: "Changed name", note: "Note 1" });
    const name = [h.markers(1, "profile.name"), h.markers(1, "profile.note"), h.formFields("profile.note")[0].getAttribute("data-field-changed")];
    h.rows.set(1, "profile", { name: "Person 1", note: "Changed note" });
    const note = [h.markers(1, "profile.name"), h.markers(1, "profile.note"), h.formFields("profile.name")[0].getAttribute("data-field-changed")];
    h.rows.revert(1); return { name, note, clean: h.markers(1, "profile.note"), status: h.rows.get(1)?.status }; });
  expect(result).toEqual({ name: [["true"], ["false"], "false"], note: [["false"], ["true"], "false"], clean: ["false"], status: "clean" });
});

test("raw array order matters while equivalent JSON and object key order do not", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState;
    h.rows.set(1, "tags", ["b", "a"]);
    const changed = { marker: h.markers(1, "tags"), visible: [...h.fields<HTMLSelectElement>(1, "tags")[0].selectedOptions].map(option => option.value) };
    h.rows.set(1, "tags", ["a", "b"]); h.rows.set(1, "profile", { note: "Note 1", name: "Person 1" });
    return { changed, restored: h.markers(1, "tags"), sibling: h.markers(1, "profile.name"), status: h.rows.get(1)?.status }; });
  expect(result).toEqual({ changed: { marker: ["true"], visible: ["a", "b"] }, restored: ["false"], sibling: ["false"], status: "clean" });
});

test("all radio and checkbox group members share their committed field state", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState;
    h.rows.setMany([{ id: 1, values: { mode: "remote", channels: ["sms"], active: false } }]);
    const changed = { radio: h.markers(1, "mode"), checks: h.markers(1, "channels"), active: h.markers(1, "active"),
      formRadio: h.formFields("mode").map(element => element.getAttribute("data-field-changed")) };
    h.rows.revert(1); return { changed, radio: h.markers(1, "mode"), checks: h.markers(1, "channels") }; });
  expect(result).toEqual({ changed: { radio: ["true", "true"], checks: ["true", "true"], active: ["true"], formRadio: ["true", "true"] },
    radio: ["false", "false"], checks: ["false", "false"] });
});

test("Select markers compare selected raw values instead of option labels or option-list changes", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState;
    h.rows.set(1, "choices", [{ label: "Renamed eleven", value: 11 }, { label: "Twenty two", value: 22 }, { label: "Thirty three", value: 33 }]);
    const choicesOnly = { marker: h.markers(1, "chosen"), value: h.rows.get(1)?.value.chosen, count: h.fields<HTMLSelectElement>(1, "chosen")[0].options.length };
    h.rows.set(1, "chosen", 22); const changed = [h.markers(1, "chosen"), h.formFields("chosen")[0].getAttribute("data-field-changed")];
    h.rows.set(1, "chosen", 11); return { choicesOnly, changed, restored: h.markers(1, "chosen"), status: h.rows.get(1)?.status }; });
  expect(result).toEqual({ choicesOnly: { marker: ["false"], value: 11, count: 3 }, changed: [["true"], "true"], restored: ["false"], status: "update" });
});

test("unchanged formatted text does not hide raw changes on displays, rendered fields and images", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState;
    h.rows.setMany([{ id: 1, values: { constant: 2, summary: "New summary", avatar: "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=" } }]);
    const changed = { constant: h.markers(1, "constant"), text: h.fields(1, "constant")[0].textContent,
      summary: h.markers(1, "summary"), rich: h.fields(1, "summary")[0].querySelector("strong")?.textContent,
      image: h.markers(1, "avatar"), formImage: h.formFields("avatar")[0].getAttribute("data-field-changed") };
    h.rows.revert(1); return { changed, restored: [h.markers(1, "constant"), h.markers(1, "summary"), h.markers(1, "avatar")] }; });
  expect(result).toEqual({ changed: { constant: ["true"], text: "Same display", summary: ["true"], rich: "New summary", image: ["true"], formImage: "true" },
    restored: [["false"], ["false"], ["false"]] });
});

test("Form commits update markers without replacing the focused input or its caret", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState, input = h.formFields<HTMLInputElement>("profile.name")[0];
    input.focus(); input.value = "Focused Form"; input.setSelectionRange(2, 5); input.dispatchEvent(new Event("input", { bubbles: true }));
    return { current: h.rows.get(1)?.value.profile.name, marker: input.getAttribute("data-field-changed"), grid: h.markers(1, "profile.name"),
      same: h.formFields("profile.name")[0] === input, focused: document.activeElement === input, caret: [input.selectionStart, input.selectionEnd] }; });
  expect(result).toEqual({ current: "Focused Form", marker: "true", grid: ["true"], same: true, focused: true, caret: [2, 5] });
});

test("Grid commits update markers without replacing the focused input or its caret", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState, input = h.fields<HTMLInputElement>(1, "profile.name")[0];
    input.focus(); input.value = "Focused Grid"; input.setSelectionRange(1, 4); input.dispatchEvent(new Event("change", { bubbles: true }));
    return { current: h.rows.get(1)?.value.profile.name, marker: input.getAttribute("data-field-changed"), form: h.formFields("profile.name")[0].getAttribute("data-field-changed"),
      same: h.fields(1, "profile.name")[0] === input, focused: document.activeElement === input, caret: [input.selectionStart, input.selectionEnd] }; });
  expect(result).toEqual({ current: "Focused Grid", marker: "true", form: "true", same: true, focused: true, caret: [1, 4] });
});

test("invalid drafts neither create committed changes nor erase an existing committed field change", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState, input = h.fields<HTMLInputElement>(1, "profile.name")[0];
    input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true }));
    const clean = { marker: h.markers(1, "profile.name"), stored: h.rows.get(1)?.value.profile.name, valid: h.grid.validate(1).valid };
    h.rows.set(1, "profile", { name: "Committed", note: "Note 1" });
    const formInput = h.formFields<HTMLInputElement>("profile.name")[0]; formInput.value = ""; formInput.dispatchEvent(new Event("input", { bubbles: true }));
    const dirty = { form: formInput.getAttribute("data-field-changed"), grid: h.markers(1, "profile.name"), stored: h.rows.get(1)?.value.profile.name,
      valid: h.form.validate(1).valid, error: h.formRoot.querySelector("output")!.getAttribute("data-field-changed") };
    h.rows.revert(1); return { clean, dirty, reverted: [h.markers(1, "profile.name"), h.formFields("profile.name")[0].getAttribute("data-field-changed")] }; });
  expect(result).toEqual({ clean: { marker: ["false"], stored: "Person 1", valid: false },
    dirty: { form: "true", grid: ["true"], stored: "Committed", valid: false, error: "form-error-authored" }, reverted: [["false"], "false"] });
});

test("inserted and copied records have no original baseline while clean append gains one", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState;
    const inserted = h.rows.add(h.item(90)), copied = h.rows.copy(1), [loaded] = h.rows.append([h.item(91)]);
    h.rows.set(inserted, "summary", "Edited insert"); h.rows.set(copied, "profile", { name: "Copied edit", note: "Note 1" });
    const markers = [inserted, copied, loaded].map(id => h.block(id).flatMap(row => [...row.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field-changed"))));
    h.form.bind(inserted); const form = h.formFields("summary")[0].getAttribute("data-field-changed");
    return { markers, form, insertOriginal: h.rows.original(inserted), copyOriginal: h.rows.original(copied), loadedOriginal: h.rows.original(loaded)?.summary,
      statuses: [inserted, copied, loaded].map(id => h.rows.get(id)?.status) }; });
  for (const markers of result.markers) expect(new Set(markers)).toEqual(new Set(["false"]));
  expect(result.form).toBe("false"); expect(result.insertOriginal).toBeUndefined(); expect(result.copyOriginal).toBeUndefined();
  expect(result.loadedOriginal).toBe("Summary 91"); expect(result.statuses).toEqual(["insert", "insert", "clean"]);
});

test("retained deletion keeps edited fields and dirty markers but transmits loaded originals and Undo restores them", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState; h.reset(3, { statusFilter: ["clean", "insert", "update", "delete"] });
    h.grid.select(1); h.grid.setSelected([1]); h.grid.setChecked([1]);
    h.rows.setMany([{ id: 1, values: { profile: { name: "Edited before delete", note: "Note 1" }, chosen: 22, channels: ["sms"] } }]);
    h.rows.remove(1);
    const input = h.fields<HTMLInputElement>(1, "profile.name")[0];
    const deleted = { value: input.value, marker: h.markers(1, "profile.name"), sibling: h.markers(1, "profile.note"), selected: h.markers(1, "chosen"),
      group: h.markers(1, "channels"), disabled: input.disabled, original: h.rows.original(1)?.profile.name,
      payload: h.rows.changes().find(row => row.id === 1)?.value.profile.name, selectedIds: h.grid.selectedIds(), checks: h.grid.checkedIds(), active: h.grid.selected() };
    h.block(1)[0].querySelector<HTMLButtonElement>('[data-row-action="undo"]')!.click();
    return { deleted, restored: { value: h.fields<HTMLInputElement>(1, "profile.name")[0].value, marker: h.markers(1, "profile.name"),
      disabled: h.fields<HTMLInputElement>(1, "profile.name")[0].disabled, status: h.rows.get(1)?.status, changes: h.rows.changes() } }; });
  expect(result).toEqual({ deleted: { value: "Edited before delete", marker: ["true"], sibling: ["false"], selected: ["true"], group: ["true", "true"],
    disabled: true, original: "Person 1", payload: "Person 1", selectedIds: [], checks: [], active: null },
    restored: { value: "Person 1", marker: ["false"], disabled: false, status: "clean", changes: [] } });
});

test("null and stale Form binding clear field flags without changing retained Grid deletion state", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState; h.reset(3, { statusFilter: ["clean", "update", "delete"] });
    h.rows.set(1, "profile", { name: "Edited", note: "Note 1" }); h.form.bind(null);
    const nullBinding = [...h.formRoot.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field-changed"));
    h.form.bind(1); h.rows.remove(1);
    const deleted = { form: h.formFields("profile.name")[0].getAttribute("data-field-changed"), grid: h.markers(1, "profile.name") };
    h.rows.replace([h.item(9)]); return { nullBinding, deleted, stale: h.formFields("profile.name")[0].getAttribute("data-field-changed"), grid: h.grid.rowIds("visible").length }; });
  expect(new Set(result.nullBinding)).toEqual(new Set(["false"])); expect(result.deleted).toEqual({ form: "false", grid: ["true"] });
  expect(result.stale).toBe("false"); expect(result.grid).toBe(1);
});

test("owned Form attributes and exact Grid template restore while local Forms never take marker ownership", async ({ page }) => {
  const result = await page.evaluate(async ({ form }) => { const { bindForm } = await import(form); const h = window.changeState;
    const local = document.createElement("form"); local.innerHTML = '<label>Local <input data-field="name" data-field-changed="application" value="Local"></label>';
    h.host.append(local); const localForm = bindForm(local), input = local.querySelector<HTMLInputElement>("input")!;
    input.value = "Changed local"; input.dispatchEvent(new Event("input", { bubbles: true })); localForm.validate();
    const untouched = input.getAttribute("data-field-changed"); localForm.dispose();
    h.rows.set(1, "summary", "Stored edit"); h.form.dispose(); h.grid.dispose();
    const restored = [...h.formRoot.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field-changed"));
    const before = h.table.outerHTML; input.dispatchEvent(new Event("input", { bubbles: true })); h.rows.set(1, "summary", "Late edit");
    return { untouched, local: input.getAttribute("data-field-changed"), restored, expected: h.formMarkers, table: before === h.tableSource, quiet: h.table.outerHTML === before }; }, modules);
  expect(result).toEqual({ untouched: "application", local: "application", restored: result.expected, expected: result.expected, table: true, quiet: true });
});

test("sort filter page and column changes preserve leaf identity rather than display indexes", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState;
    h.rows.set(3, "profile", { name: "Changed third", note: "Note 3" });
    h.grid.setSort((a, b) => b.key - a.key); h.grid.setPage({ page: 1, size: 1 });
    const sorted = { ids: h.grid.rowIds("visible"), changed: h.markers(3, "profile.name"), sibling: h.markers(3, "profile.note") };
    h.grid.setColumns(h.grid.columns().map(column => ({ ...column, hidden: column.key === "profile" })));
    h.grid.setColumns(h.grid.columns().map(column => ({ ...column, hidden: false }))); h.grid.setFilter(row => row.key !== 3);
    const hidden = h.block(3).length; h.grid.setFilter(null); h.grid.refresh();
    return { sorted, hidden, restored: h.markers(3, "profile.name"), node: h.fields<HTMLInputElement>(3, "profile.name")[0].value }; });
  expect(result).toEqual({ sorted: { ids: [3], changed: ["true"], sibling: ["false"] }, hidden: 0, restored: ["true"], node: "Changed third" });
});

test("offscreen edits and deletion remount with their data-owned baseline and bounded physical rows", async ({ page }) => {
  const result = await page.evaluate(async () => { const h = window.changeState;
    h.reset(500, { viewport: { root: h.scroll, estimate: 240, overscan: 1 }, statusFilter: ["clean", "update", "delete"] });
    h.rows.set(450, "profile", { name: "Far edited", note: "Note 450" }); h.grid.reveal(450, { block: "center" }); await h.settle();
    const edited = { marker: h.markers(450, "profile.name"), sibling: h.markers(450, "profile.note"), value: h.fields<HTMLInputElement>(450, "profile.name")[0].value };
    h.grid.reveal(1); await h.settle(); const unmounted = h.block(450).length === 0;
    h.rows.remove(450); h.grid.reveal(450); await h.settle();
    const deleted = { marker: h.markers(450, "profile.name"), value: h.fields<HTMLInputElement>(450, "profile.name")[0].value,
      disabled: h.fields<HTMLInputElement>(450, "profile.name")[0].disabled, original: h.rows.changes().find(row => row.id === 450)?.value.profile.name,
      mounted: h.table.querySelectorAll("[data-change-row]").length };
    h.rows.revert(450); return { edited, unmounted, deleted, restored: h.markers(450, "profile.name") }; });
  expect(result.edited).toEqual({ marker: ["true"], sibling: ["false"], value: "Far edited" }); expect(result.unmounted).toBe(true);
  expect(result.deleted.marker).toEqual(["true"]); expect(result.deleted.value).toBe("Far edited"); expect(result.deleted.disabled).toBe(true);
  expect(result.deleted.original).toBe("Person 450"); expect(result.deleted.mounted).toBeLessThan(30); expect(result.restored).toEqual(["false"]);
});

test("shared and independent MDI bindings retain their own baselines and unique accessible IDs", async ({ page }) => {
  await page.evaluate(async ({ data, form }) => { const [{ createRows }, { bindForm }] = await Promise.all([import(data), import(form)]); const h = window.changeState;
    const second = document.createElement("form"); second.innerHTML = '<fieldset><legend>Second employee editor</legend><label>Name <input data-field="profile.name" required></label><output data-error-for="profile.name"></output></fieldset>';
    const independent = second.cloneNode(true) as HTMLFormElement;
    h.host.append(second); const handle = bindForm(second, { rows: h.rows }); handle.bind(1);
    h.rows.set(1, "profile", { name: "Shared edit", note: "Note 1" });
    if (second.querySelector("input")!.getAttribute("data-field-changed") !== "true") throw new Error("The second Form lost its shared baseline.");
    handle.bind(2);
    if (second.querySelector("input")!.getAttribute("data-field-changed") !== "false") throw new Error("A row change leaked another row's baseline.");
    h.host.append(independent);
    const independentRows = createRows([{ ...h.item(1), profile: { name: "Independent original", note: "Note 1" } }]);
    const independentForm = bindForm(independent, { rows: independentRows }); independentForm.bind(1);
    independentRows.set(1, "profile", { name: "Shared edit", note: "Note 1" });
    if (independent.querySelector("input")!.getAttribute("data-field-changed") !== "true" || independentRows.original(1)?.profile.name !== "Independent original") {
      throw new Error("Independent MDI rows lost their own loaded original.");
    }
    independentRows.revert(1);
    if (independent.querySelector("input")!.getAttribute("data-field-changed") !== "false" || h.markers(1, "profile.name")[0] !== "true") {
      throw new Error("Reverting an independent MDI row affected a different store.");
    }
    const ids = [...h.host.querySelectorAll("[id]")].map(element => element.id);
    if (new Set(ids).size !== ids.length) throw new Error("MDI binding repeated an accessibility ID.");
    independentForm.dispose(); independentRows.dispose(); independent.remove(); handle.dispose(); second.remove();
  }, modules);
  const result = await new AxeBuilder({ page }).include("[data-change-state]").analyze();
  expect(result.violations).toEqual([]);
});

test("signed zero raw identity is visible as changed even when its formatted display is identical", async ({ page }) => {
  const result = await page.evaluate(() => { const h = window.changeState;
    h.rows.replace([{ ...h.item(1), constant: 0 }]); const id = h.rows.entries()[0].id; h.form.bind(id);
    h.rows.set(id, "constant", -0);
    const changed = { marker: h.markers(id, "constant"), text: h.fields(id, "constant")[0].textContent,
      form: h.formFields("constant")[0].getAttribute("data-field-changed"), raw: Object.is(h.rows.get(id)?.value.constant, -0), original: Object.is(h.rows.original(id)?.constant, 0) };
    h.rows.revert(id); return { changed, restored: h.markers(id, "constant") }; });
  expect(result).toEqual({ changed: { marker: ["true"], text: "Same display", form: "true", raw: true, original: true }, restored: ["false"] });
});
