// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows } from "../../src/data/index.js";
import type { GridHandle } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";
import type { GridRowBinding } from "../../src/ui/grid-hooks.js";

type Item = { name: string; count: number; active: boolean; choice: string | null; profile: { note: string }; team: string };
type Options = Parameters<typeof bindGrid<Item>>[1];
type Observation = { type: string; id: number; field: string; entered: string; name: string; count: number; invalid: boolean; connected: boolean };
declare global {
  interface Window {
    gridRecipes: {
      grid: GridHandle<Item>; rows: Rows<Item>; table: HTMLTableElement; root: HTMLElement;
      original: string; identities: WeakMap<HTMLTableRowElement, number>; observed: Observation[];
      record(id: number): HTMLTableRowElement[];
      field<E extends HTMLElement = HTMLInputElement>(id: number, name: string): E;
      rebind(extra?: Partial<Options>): void; stopObserving(): void; settle(): Promise<void>;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts") };
const markup = `<caption>Application composition recipes</caption>
  <colgroup data-column="person"><col></colgroup><colgroup data-columns="settings note"><col span="2"></colgroup>
  <thead><tr><th scope="col" data-column="person" rowspan="2">Person</th>
    <th scope="colgroup" data-columns="settings note" colspan="2">Details</th></tr>
    <tr><th scope="col" data-column="settings">Settings</th><th scope="col" data-column="note">Notes</th></tr></thead>
  <tbody data-row-template><tr><th scope="row" data-column="person" rowspan="2">
    <button type="button" data-select-row>Select</button><label>Check <input type="checkbox" data-check-row></label>
    <label>Name <input data-field="name" value="Authored person" required></label><output data-error-for="name"></output></th>
    <td data-column="settings"><label>Count <input data-field="count" value="7" required></label><output data-error-for="count"></output></td>
    <td data-column="note"><label>Note <textarea data-field="profile.note">Authored note</textarea></label></td></tr>
    <tr><td data-column="settings"><label>Active <input type="checkbox" data-field="active" checked></label>
      <label>Choice <select data-field="choice"><option value="">Choose</option><option value="a" selected>A</option><option value="b">B</option></select></label></td>
      <td data-column="note"><span data-field="team"></span></td></tr></tbody>`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, markup }) => {
    const [{ bindGrid }, { createRows }] = await Promise.all([import(modules.grid), import(modules.data)]);
    const host = document.createElement("main");
    host.innerHTML = '<h1>Grid application recipes</h1><div data-recipes-root role="region" aria-label="Recipe records" tabindex="0" style="height:180px;width:720px;overflow:auto;overflow-anchor:none"><table data-recipes-table></table></div>';
    const style = document.createElement("style");
    style.textContent = '[data-recipes-table]{width:700px;table-layout:fixed;border-collapse:collapse;font:14px/20px sans-serif}[data-recipes-table] tr{height:48px}[data-recipes-table] th,[data-recipes-table] td{padding:2px}[data-recipes-table] label{display:block}[data-recipes-table] input:not([type=checkbox]),[data-recipes-table] textarea{width:120px}[data-recipes-table] output:empty{display:none}';
    host.append(style); document.body.append(host);
    const table = host.querySelector<HTMLTableElement>("table")!, root = host.querySelector<HTMLElement>("[data-recipes-root]")!;
    table.innerHTML = markup;
    const values = Array.from({ length: 80 }, (_, index) => ({ name: `Record ${index + 1}`, count: index + 1,
      active: true, choice: "a", profile: { note: `Note ${index + 1}` }, team: index % 2 ? "Even" : "Odd" }));
    Object.defineProperty(values[0], "toString", { value: "Own property", enumerable: true });
    const rows: Rows<Item> = createRows(values);
    let lifetime = new AbortController();
    const h: Window["gridRecipes"] = {
      grid: undefined as unknown as GridHandle<Item>, rows, root, table, original: table.outerHTML,
      identities: new WeakMap(), observed: [],
      record(id) { return [...table.querySelectorAll<HTMLTableRowElement>("tbody tr")].filter(row => h.identities.get(row) === id); },
      field<E extends HTMLElement = HTMLInputElement>(id: number, name: string): E {
        return h.record(id).flatMap(row => [...row.querySelectorAll<HTMLElement>("[data-field]")])
          .find(element => element.getAttribute("data-field") === name) as E;
      },
      stopObserving: () => lifetime.abort(),
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))),
      rebind(extra = {}) {
        lifetime.abort(); h.grid?.dispose(); root.scrollTop = 0; lifetime = new AbortController();
        h.grid = bindGrid(table, { rows, multiple: true, parse: { count(input: string) {
          const value = Number(input); if (!Number.isFinite(value)) throw new Error("Enter a finite count."); return value;
        } }, ...extra, onRowBind(context: GridRowBinding<Item>) {
          for (const element of context.elements) h.identities.set(element, context.row.id);
          context.own(() => { for (const element of context.elements) h.identities.delete(element); });
        } });
        const observe = (event: Event) => {
          const target = event.target;
          if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) || target.closest("table") !== table) return;
          const physical = target.closest("tr"), id = physical && h.identities.get(physical);
          const row = id === null || id === undefined ? undefined : rows.get(id);
          if (!row || row.status === "delete") return;
          h.observed.push({ type: event.type, id: row.id, field: target.getAttribute("data-field")!, entered: target.value,
            name: row.value.name, count: row.value.count, invalid: target.getAttribute("aria-invalid") === "true", connected: target.isConnected });
        };
        for (const type of ["input", "change", "recipe:inspect"]) table.addEventListener(type, observe, { signal: lifetime.signal });
      }
    };
    window.gridRecipes = h; h.rebind();
  }, { modules, markup });
});

test("application projections read current raw values with own keys and independent active batch checked scopes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridRecipes;
    const project = (ids: readonly number[], scope?: readonly number[]) => {
      const included = scope && new Set(scope);
      return ids.flatMap(id => {
        const row = h.rows.get(id);
        return row && row.status !== "delete" && (!included || included.has(id))
          ? [Object.fromEntries(["name", "count", "toString", "constructor"].filter(key => Object.hasOwn(row.value, key))
            .map(key => [key, row.value[key as keyof Item]]))] : [];
      });
    };
    h.grid.select(3); h.grid.setSelected([4, 1]); h.grid.setChecked([2, 4]);
    const before = project(h.grid.selectedIds());
    h.rows.set(4, "name", "Current record 4");
    h.grid.setFilter(row => row.count <= 4); h.grid.setSort((a, b) => b.count - a.count); h.grid.setPage({ page: 1, size: 2 });
    const values = { active: project([h.grid.selected()!]), batch: project(h.grid.selectedIds()), checked: project(h.grid.checkedIds()),
      visibleBatch: project(h.grid.selectedIds(), h.grid.rowIds("visible")), filteredChecked: project(h.grid.checkedIds(), h.grid.rowIds("filtered")),
      page: h.grid.rowIds("visible"), before };
    h.rows.remove(4);
    return { ...values, afterDeletion: { batch: project(h.grid.selectedIds()), checked: project(h.grid.checkedIds()) } };
  });
  expect(result).toEqual({ active: [{ name: "Record 3", count: 3 }],
    batch: [{ name: "Record 1", count: 1, toString: "Own property" }, { name: "Current record 4", count: 4 }],
    checked: [{ name: "Record 2", count: 2 }, { name: "Current record 4", count: 4 }],
    visibleBatch: [{ name: "Current record 4", count: 4 }], filteredChecked: [{ name: "Record 2", count: 2 }, { name: "Current record 4", count: 4 }],
    page: [4, 3], before: [{ name: "Record 1", count: 1, toString: "Own property" }, { name: "Record 4", count: 4 }],
    afterDeletion: { batch: [{ name: "Record 1", count: 1, toString: "Own property" }], checked: [{ name: "Record 2", count: 2 }] } });
});

test("application membership append and replacement preserve independent sets and discard replaced row identities", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridRecipes;
    h.grid.select(3); h.grid.setSelected([1, 4]); h.grid.setChecked([2]);
    const old = h.rows.get(1)!;
    const [id] = h.rows.append([{ name: "Appended", count: 81, active: false, choice: null, profile: { note: "New note" }, team: "New" }]);
    h.grid.setSelected([...h.grid.selectedIds(), id]); h.grid.setChecked([...h.grid.checkedIds(), id]);
    const appended = { active: h.grid.selected(), batch: h.grid.selectedIds(), checked: h.grid.checkedIds(), clean: h.rows.get(id)!.status };
    h.grid.setSelected([id]); h.grid.setChecked([4]);
    const replacedSets = { active: h.grid.selected(), batch: h.grid.selectedIds(), checked: h.grid.checkedIds() };
    h.rows.replace([{ name: "Replacement", count: 1, active: true, choice: "b", profile: { note: "Replacement note" }, team: "New" }]);
    return { appended, replacedSets, afterReplace: { active: h.grid.selected(), batch: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      oldMissing: h.rows.get(old.id) === undefined, newIdentity: h.rows.entries()[0].id > id, oldSnapshot: old.value.name } };
  });
  expect(result).toEqual({ appended: { active: 3, batch: [1, 4, 81], checked: [2, 81], clean: "clean" },
    replacedSets: { active: 3, batch: [81], checked: [4] },
    afterReplace: { active: null, batch: [], checked: [], oldMissing: true, newIdentity: true, oldSnapshot: "Record 1" } });
});

test("native listeners registered after Grid observe drafts commits validation failures and latest custom-event snapshots", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridRecipes, original = h.rows.get(1)!;
    const name = h.field(1, "name");
    name.value = "Draft name"; name.dispatchEvent(new Event("input", { bubbles: true }));
    name.dispatchEvent(new Event("change", { bubbles: true }));
    name.value = ""; name.dispatchEvent(new Event("change", { bubbles: true }));
    name.dispatchEvent(new CustomEvent("recipe:inspect", { bubbles: true }));
    name.value = "Recovered"; name.dispatchEvent(new Event("change", { bubbles: true }));
    h.rows.set(1, "name", "External latest");
    h.field(1, "name").dispatchEvent(new CustomEvent("recipe:inspect", { bubbles: true }));
    const count = h.field(1, "count"); count.value = "bad"; count.dispatchEvent(new Event("change", { bubbles: true }));
    count.value = "42"; count.dispatchEvent(new Event("change", { bubbles: true }));
    return { observations: h.observed, current: h.rows.get(1)!.value, original: original.value.name,
      errorCleared: h.table.querySelector('[data-error-for="count"]')!.textContent === "" };
  });
  const observation = (type: string, entered: string, name: string, invalid = false, field = "name", count = 1): Observation =>
    ({ type, id: 1, field, entered, name, count, invalid, connected: true });
  expect(result.observations).toEqual([
    observation("input", "Draft name", "Record 1"), observation("change", "Draft name", "Draft name"),
    observation("change", "", "Draft name", true), observation("recipe:inspect", "", "Draft name", true),
    observation("change", "Recovered", "Recovered"), observation("recipe:inspect", "External latest", "External latest"),
    observation("change", "bad", "External latest", true, "count"), observation("change", "42", "External latest", false, "count", 42)
  ]);
  expect(result.current).toMatchObject({ name: "External latest", count: 42 });
  expect(result.original).toBe("Record 1"); expect(result.errorCleared).toBe(true);
});

test("manual validation keeps native observations uncommitted until explicit validation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridRecipes; h.rebind({ validateOn: "manual" });
    const input = h.field(1, "name"); input.value = "Manual edit";
    for (const type of ["input", "change", "recipe:inspect"]) input.dispatchEvent(new Event(type, { bubbles: true }));
    const before = h.observed.map(event => [event.type, event.name, event.entered]);
    const valid = h.grid.validate(1).valid;
    h.field(1, "name").dispatchEvent(new CustomEvent("recipe:inspect", { bubbles: true }));
    return { before, valid, after: h.observed.at(-1), changes: h.rows.changes().map(row => row.id) };
  });
  expect(result).toEqual({ before: [["input", "Record 1", "Manual edit"], ["change", "Record 1", "Manual edit"], ["recipe:inspect", "Record 1", "Manual edit"]],
    valid: true, after: { type: "recipe:inspect", id: 1, field: "name", entered: "Manual edit", name: "Manual edit", count: 1, invalid: false, connected: true }, changes: [1] });
});

test("row-hook identities and abort-owned observations survive refresh recycling and rebind without stale callbacks", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridRecipes;
    h.rebind({ viewport: { root: h.root, estimate: 96, overscan: 1 } }); await h.settle();
    const first = h.record(1), old = h.field(1, "name");
    h.grid.reveal(80); await h.settle();
    const released = first.every(row => !row.isConnected && h.identities.get(row) === undefined);
    h.grid.reveal(1); await h.settle();
    const rebound = h.record(1).length === 2 && h.field(1, "name") !== old;
    h.rows.set(1, "name", "Latest after recycle"); h.grid.refresh();
    h.field(1, "name").dispatchEvent(new CustomEvent("recipe:inspect", { bubbles: true }));
    h.rebind();
    const input = h.field(1, "name"); input.value = "After rebind"; input.dispatchEvent(new Event("change", { bubbles: true }));
    const observed = h.observed.map(event => [event.type, event.id, event.name]);
    h.stopObserving(); input.value = "Quiet listener"; input.dispatchEvent(new Event("change", { bubbles: true }));
    const quiet = h.observed.length === observed.length && h.rows.get(1)!.value.name === "Quiet listener";
    const finalRows = h.record(1); h.grid.dispose();
    return { released, rebound, observed, quiet, identitiesReleased: finalRows.every(row => h.identities.get(row) === undefined),
      restored: h.table.outerHTML === h.original };
  });
  expect(result).toEqual({ released: true, rebound: true,
    observed: [["recipe:inspect", 1, "Latest after recycle"], ["change", 1, "After rebind"]], quiet: true, identitiesReleased: true, restored: true });
});

test("authored templates headers and native column topology support controlled dispose edit rebind", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid), h = window.gridRecipes;
    h.grid.dispose();
    const template = h.table.querySelector<HTMLTableSectionElement>("tbody[data-row-template]")!;
    const authoredRows = [...template.rows];
    const authored = { records: template.rows.length, fields: [...template.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field")),
      header: [...h.table.tHead!.rows].map(row => [...row.cells].map(cell => [cell.textContent!.trim(), cell.rowSpan, cell.colSpan])) };
    h.rebind();
    const initial = h.grid.columns();
    h.grid.setColumns([initial[0], initial[2], { ...initial[1], hidden: true }]);
    const header = [...h.table.tHead!.rows].map(row => [...row.cells].map(cell => ({ key: cell.getAttribute("data-column") ?? cell.getAttribute("data-columns"), hidden: cell.hidden, span: cell.colSpan })));
    const record = h.record(1).map(row => [...row.cells].map(cell => cell.getAttribute("data-column")));
    const detachedTemplate = authoredRows.every(row => !row.isConnected) && authoredRows.length === 2;
    h.stopObserving(); h.grid.dispose();
    const restored = h.table.outerHTML === h.original && h.table.querySelector("tbody[data-row-template]") === template;
    const badge = document.createElement("strong"); badge.dataset.field = "team";
    template.rows[1].cells[1].append(badge);
    const edited = h.table.outerHTML;
    const grid = bindGrid(h.table, { rows: h.rows, parse: { count: Number } });
    const displayed = h.table.querySelector("tbody strong")!.textContent;
    grid.dispose();
    return { authored, keys: initial.map(column => column.key), header, record, detachedTemplate, restored, displayed, editedRestored: h.table.outerHTML === edited };
  }, modules);
  expect(result).toEqual({ authored: { records: 2, fields: ["name", "count", "profile.note", "active", "choice", "team"],
    header: [[["Person", 2, 1], ["Details", 1, 2]], [["Settings", 1, 1], ["Notes", 1, 1]]] },
    keys: ["person", "settings", "note"],
    header: [[{ key: "person", hidden: false, span: 1 }, { key: "settings note", hidden: false, span: 1 }],
      [{ key: "note", hidden: false, span: 1 }]],
    record: [["person", "note"], ["note"]], detachedTemplate: true,
    restored: true, displayed: "Odd", editedRestored: true });
});

test("authored native defaults compose row creation without inheriting current edits or mutable output", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridRecipes;
    h.rows.set(1, "name", "Existing edit");
    const defaults = h.grid.defaults();
    const item: Item = { name: String(defaults.name), count: Number(defaults.count), active: defaults.active === true,
      choice: defaults.choice === null ? null : String(defaults.choice), profile: { note: String((defaults.profile as { note: string }).note) }, team: "Application team" };
    const id = h.rows.add(item, h.grid.selected() ?? 1);
    (defaults.profile as { note: string }).note = "Mutated defaults";
    h.grid.select(id);
    return { value: h.rows.get(id)!.value, status: h.rows.get(id)!.status, first: h.rows.entries()[0].id === id,
      selected: h.grid.selected() === id, old: h.rows.get(1)!.value.name, rendered: h.field(id, "name").value,
      nextDefaults: h.grid.defaults() };
  });
  expect(result).toEqual({ value: { name: "Authored person", count: 7, active: true, choice: "a", profile: { note: "Authored note" }, team: "Application team" },
    status: "insert", first: true, selected: true, old: "Existing edit", rendered: "Authored person",
    nextDefaults: { name: "Authored person", count: 7, active: true, choice: "a", profile: { note: "Authored note" } } });
});
