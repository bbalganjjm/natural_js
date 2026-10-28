// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows } from "../../src/data/index.js";
import type { GridHandle } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = { key: number; name: string; note: string; score: number; active: boolean; selectable: boolean };
type Options = Parameters<typeof bindGrid<Item>>[1];
type Hooks = Pick<Options, "beforeSelect" | "beforeSelectionChange" | "onSelect" | "onSelectionChange">;
type Observed = { kind: string; id?: number | null; ids?: readonly number[]; active: number | null;
  selected: readonly number[]; checked: readonly number[]; type: string | null; current: boolean; pressed: number };

declare global {
  interface Window {
    acceptanceFixture: {
      grid: GridHandle<Item>; rows: Rows<Item>; table: HTMLTableElement; root: HTMLElement; original: string;
      events: Observed[]; hooks: Hooks; actions: number; storeEvents: number;
      reset(extra?: Partial<Options>, count?: number): void;
      block(id: number): HTMLTableRowElement[];
      cell(id: number, physical?: number): HTMLElement;
      settle(): Promise<void>;
    };
  }
}

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts") };
const markup = `<caption>Row activation acceptance</caption><thead><tr>
  <th scope="col" data-column="key">Record</th><th scope="col" data-column="name">Name</th>
  <th scope="col" data-column="score">Score</th><th scope="col" data-column="actions">Actions</th></tr></thead>
  <tbody data-row-template><tr><th scope="row" data-column="key"><button type="button" data-select-row>Select <span data-field="key"></span></button></th>
    <td data-column="name" data-click-cell><span data-field="name"></span></td>
    <td data-column="score"><label>Score <input type="number" data-field="score" min="1" required></label><output data-error-for="score"></output></td>
    <td data-column="actions"><label><span data-check-label>Check record</span> <input type="checkbox" data-check-row></label>
      <button type="button" data-row-action="inspect"><span>Inspect</span></button></td></tr>
  <tr><td data-columns="key name score actions" colspan="4"><span data-click-cell>Authored detail</span>
    <label>Note <textarea data-field="note"></textarea></label><label>Active <input type="checkbox" data-field="active"></label>
    <div data-widget-host></div></td></tr></tbody>`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid), { createRows } = await import(modules.data);
    const host = document.createElement("section");
    host.innerHTML = '<h2>Row activation acceptance</h2><div data-acceptance-scroll role="region" aria-label="Records" tabindex="0" style="height:260px;width:900px;overflow:auto"><table data-acceptance-table></table></div>';
    const style = document.createElement("style");
    style.textContent = '[data-acceptance-table]{width:880px;table-layout:fixed;border-collapse:collapse;font:14px/20px sans-serif}[data-acceptance-table] th,[data-acceptance-table] td{padding:2px;vertical-align:top}[data-acceptance-table] tbody tr:not([aria-hidden=true]){height:36px}[data-acceptance-table] textarea{height:24px;width:140px}[data-acceptance-table] input[type=number]{width:80px}[data-acceptance-table] output:empty{display:none}';
    host.append(style); document.body.append(host);
    const root = host.querySelector<HTMLElement>("[data-acceptance-scroll]")!, table = host.querySelector<HTMLTableElement>("table")!;
    table.tabIndex = -1;
    const h: Window["acceptanceFixture"] = {
      grid: undefined as unknown as GridHandle<Item>, rows: undefined as unknown as Rows<Item>, table, root,
      original: "", events: [], hooks: {}, actions: 0, storeEvents: 0,
      block(id) { return [...table.querySelectorAll<HTMLTableRowElement>(`tr[data-accept-record="${id}"]`)]; },
      cell(id, physical = 0) { return h.block(id)[physical].querySelector<HTMLElement>("[data-click-cell]")!; },
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))),
      reset(extra = {}, count = 6) {
        h.grid?.dispose(); h.rows?.dispose(); root.scrollTop = 0;
        table.innerHTML = markup; h.original = table.outerHTML; h.events = []; h.hooks = {}; h.actions = 0; h.storeEvents = 0;
        h.rows = createRows(Array.from({ length: count }, (_, index) => ({ key: index + 1, name: `Record ${index + 1}`,
          note: `Note ${index + 1}`, score: index + 10, active: true, selectable: index !== 2 })));
        const record = (kind: string, change: { id?: number | null; row?: unknown; ids?: readonly number[]; event: Event | null }) => {
          h.events.push({ kind, ...(change.id !== undefined ? { id: change.id } : {}), ...(change.ids ? { ids: change.ids } : {}),
            active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(), type: change.event?.type ?? null,
            current: change.id == null || h.rows.get(change.id) === change.row,
            pressed: table.querySelectorAll('button[data-select-row][aria-pressed="true"]').length });
        };
        const options: Options = { rows: h.rows, parse: { score: Number }, canSelect: row => row.value.selectable,
          beforeRowBind({ elements, row }) { for (const element of elements) element.dataset.acceptRecord = String(row.id); },
          beforeSelect: change => h.hooks.beforeSelect?.(change),
          beforeSelectionChange: change => h.hooks.beforeSelectionChange?.(change),
          onSelect: change => { record("active", change); h.hooks.onSelect?.(change); },
          onSelectionChange: change => { record("selected", change); h.hooks.onSelectionChange?.(change); },
          onRowAction: () => h.actions++, ...extra };
        h.grid = bindGrid(table, options);
        h.rows.subscribe(() => h.storeEvents++);
      }
    };
    window.acceptanceFixture = h; h.reset();
  }, { modules, markup });
});

test("row-wide activation is opt-in and preserves native table and button defaults", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.acceptanceFixture;
    return [undefined, false].map(selectOnRowClick => {
      h.reset({ selectOnRowClick }); h.cell(1).click(); h.cell(2, 1).click();
      const ignored = h.grid.selected() === null && h.events.length === 0;
      h.block(2)[0].querySelector<HTMLButtonElement>("[data-select-row]")!.click();
      return { ignored, active: h.grid.selected(), selected: h.grid.selectedIds(), events: h.events.length,
        alteredRows: h.table.querySelectorAll("tbody tr[role], tbody tr[tabindex]").length, storeEvents: h.storeEvents };
    });
  });
  expect(result).toEqual(Array.from({ length: 2 }, () => ({ ignored: true, active: 2, selected: [], events: 1, alteredRows: 0, storeEvents: 0 })));
});

test("invalid row activation flags and missing keyboard alternatives reject before ownership", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.acceptanceFixture; h.grid.dispose();
    const flags: unknown[] = [null, 0, 1, "true", [], {}];
    const invalid = flags.map(value => {
      const before = h.table.outerHTML; let code = "";
      try { bindGrid(h.table, { rows: h.rows, parse: { score: Number }, onRowAction: () => {}, selectOnRowClick: value as boolean }); }
      catch (cause) { code = (cause as { code: string }).code; }
      return { code, restored: before === h.table.outerHTML };
    });
    const button = h.table.querySelector("[data-select-row]")!; button.removeAttribute("data-select-row");
    const before = h.table.outerHTML; let code = "";
    try { bindGrid(h.table, { rows: h.rows, parse: { score: Number }, onRowAction: () => {}, selectOnRowClick: true }); }
    catch (cause) { code = (cause as { code: string }).code; }
    const restored = before === h.table.outerHTML;
    button.setAttribute("data-select-row", "");
    const grid = bindGrid(h.table, { rows: h.rows, parse: { score: Number }, onRowAction: () => {}, selectOnRowClick: true });
    grid.dispose(); return { invalid, missing: { code, restored }, retry: h.table.outerHTML === h.original };
  }, modules);
  expect(result).toEqual({ invalid: Array.from({ length: 6 }, () => ({ code: "GRID_SELECT", restored: true })),
    missing: { code: "GRID_SELECT", restored: true }, retry: true });
});

test("single row clicks reuse toggles, current snapshots and committed callback order", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.acceptanceFixture; h.reset({ selectOnRowClick: true, toggleSelection: true });
    h.grid.setSelected([4]); h.grid.setChecked([5]); h.rows.set(2, "name", "Changed record"); h.events = [];
    const before: unknown[] = [];
    h.hooks.beforeSelect = change => { before.push({ previous: h.grid.selected(), next: change.id,
      current: change.row === (change.id === null ? null : h.rows.get(change.id)), type: change.event?.type,
      name: change.row?.value.name }); };
    h.cell(2, 1).click(); h.cell(2).click();
    return { before, events: h.events, active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      alteredRows: h.table.querySelectorAll("tbody tr[role], tbody tr[tabindex]").length, storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ before: [
    { previous: null, next: 2, current: true, type: "click", name: "Changed record" },
    { previous: 2, next: null, current: true, type: "click", name: undefined }],
    events: [
      { kind: "active", id: 2, active: 2, selected: [4], checked: [5], type: "click", current: true, pressed: 1 },
      { kind: "active", id: null, active: null, selected: [4], checked: [5], type: "click", current: true, pressed: 0 }],
    active: null, selected: [4], checked: [5], alteredRows: 0, storeEvents: 1 });
});

test("row-wide multiple gestures share eligible ranges and independent checks", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.acceptanceFixture; h.reset({ selectOnRowClick: true, multiple: true, toggleSelection: true }); h.grid.setChecked([6]);
    const click = (id: number, modifiers: MouseEventInit = {}) => h.cell(id, 1).dispatchEvent(new MouseEvent("click", { bubbles: true, ...modifiers }));
    click(1); click(4); const plain = h.grid.selectedIds();
    click(1, { ctrlKey: true }); const ctrl = h.grid.selectedIds();
    click(5, { shiftKey: true }); const shift = h.grid.selectedIds();
    click(2, { metaKey: true }); const meta = h.grid.selectedIds();
    return { plain, ctrl, shift, meta, active: h.grid.selected(), checked: h.grid.checkedIds(), storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ plain: [1, 4], ctrl: [4], shift: [1, 2, 4, 5], meta: [1, 4, 5], active: 2, checked: [6], storeEvents: 0 });
});

test("row-wide veto and unavailable records keep atomic selection and native pressed state", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.acceptanceFixture; h.reset({ selectOnRowClick: true, multiple: true, toggleSelection: true,
      statusFilter: ["clean", "insert", "update", "delete"] });
    h.cell(1).click(); h.grid.setChecked([5]); h.events = [];
    h.hooks.beforeSelect = () => false; h.cell(2, 1).click();
    const first = { active: h.grid.selected(), ids: h.grid.selectedIds(), events: h.events.length };
    h.hooks.beforeSelect = undefined; h.hooks.beforeSelectionChange = () => false; h.cell(4).click();
    const second = { active: h.grid.selected(), ids: h.grid.selectedIds(), events: h.events.length };
    h.hooks.beforeSelectionChange = undefined; h.cell(3).click(); h.rows.remove(2); h.events = []; h.cell(2, 1).click();
    return { first, second, active: h.grid.selected(), ids: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      pressed: [...h.table.querySelectorAll('[data-select-row][aria-pressed="true"]')].map(button => button.textContent), events: h.events.length };
  });
  expect(result).toEqual({ first: { active: 1, ids: [1], events: 0 }, second: { active: 1, ids: [1], events: 0 },
    active: 1, ids: [1], checked: [5], pressed: ["Select 1"], events: 0 });
});

test("interactive descendants and label text never become row activation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.acceptanceFixture; h.reset({ selectOnRowClick: true, multiple: true });
    const host = h.block(2)[1].querySelector<HTMLElement>("[data-widget-host]")!;
    host.innerHTML = '<select data-excluded aria-label="Extra choice"><option>One</option></select><button type="button"><span data-excluded>Ordinary button</span></button><a href="#kept"><span data-excluded>Link</span></a><span role="button"><span data-excluded>Authored button</span></span><span role="link"><span data-excluded>Authored link</span></span><span contenteditable="true"><span data-excluded>Editable text</span></span><span tabindex="0"><span data-excluded>Focusable text</span></span><table><tbody><tr><td data-excluded>Nested table</td></tr></tbody></table>';
    const selectors = ['[data-field="score"]', '[data-field="note"]', '[data-field="active"]', '[data-check-row]', '[data-check-label]', '[data-row-action] span'];
    const targets = [...selectors.map(selector => h.block(2).flatMap(row => [...row.querySelectorAll<HTMLElement>(selector)])[0]),
      ...host.querySelectorAll<HTMLElement>("[data-excluded]")];
    const ignored = targets.map(target => { target.click(); return h.grid.selected() === null && h.grid.selectedIds().length === 0; });
    return { ignored, count: targets.length, actions: h.actions, checked: h.grid.checkedIds(),
      activeEvents: h.events.filter(event => event.kind === "active" || event.kind === "selected").length };
  });
  expect(result).toEqual({ ignored: Array(14).fill(true), count: 14, actions: 1, checked: [], activeEvents: 0 });
});

test("prevented, hidden and inert record clicks leave selection unchanged", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.acceptanceFixture; h.reset({ selectOnRowClick: true }); const cell = h.cell(2);
    const click = () => cell.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    cell.addEventListener("click", event => event.preventDefault(), { once: true }); const prevented = click();
    const untouched = [h.grid.selected()];
    cell.hidden = true; click(); untouched.push(h.grid.selected()); cell.hidden = false;
    h.block(2)[0].inert = true; click(); untouched.push(h.grid.selected()); h.block(2)[0].inert = false;
    h.root.inert = true; click(); untouched.push(h.grid.selected()); h.root.inert = false;
    h.root.hidden = true; click(); untouched.push(h.grid.selected()); h.root.hidden = false;
    click(); return { prevented, untouched, active: h.grid.selected(), events: h.events.length };
  });
  expect(result).toEqual({ prevented: false, untouched: [null, null, null, null, null], active: 2, events: 1 });
});

test("row clicks require a currently usable keyboard selection alternative", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.acceptanceFixture; h.reset({ selectOnRowClick: true });
    const button = h.block(2)[0].querySelector<HTMLButtonElement>("[data-select-row]")!;
    const ignored: boolean[] = [];
    const click = () => { h.cell(2, 1).click(); ignored.push(h.grid.selected() === null); };
    button.disabled = true; click(); button.disabled = false;
    button.hidden = true; click(); button.hidden = false;
    button.style.visibility = "hidden"; click(); button.style.removeProperty("visibility");
    button.style.display = "none"; click(); button.style.removeProperty("display");
    button.inert = true; click(); button.inert = false;
    button.tabIndex = -1; click(); button.removeAttribute("tabindex");
    const columns = h.grid.columns(); h.grid.setColumns(columns.map(column => column.key === "key" ? { ...column, hidden: true } : column));
    click(); h.grid.setColumns(columns); h.cell(2, 1).click();
    return { ignored, active: h.grid.selected(), events: h.events.length, checked: h.grid.checkedIds() };
  });
  expect(result).toEqual({ ignored: Array(7).fill(true), active: 2, events: 1, checked: [] });
});

test("every physical row resolves current identity after sorting, paging and column movement", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.acceptanceFixture; h.reset({ selectOnRowClick: true, toggleSelection: true });
    h.grid.setSort((a, b) => b.key - a.key); h.grid.setPage({ page: 2, size: 2 }); h.grid.setColumns([...h.grid.columns()].reverse());
    h.cell(4, 1).click(); const first = h.grid.selected(); h.cell(4).click(); const cleared = h.grid.selected();
    h.grid.setFilter(row => row.key !== 6); h.grid.setPage({ page: 1, size: 2 }); h.rows.set(5, "name", "Current fifth"); h.cell(5, 1).click();
    return { first, cleared, active: h.grid.selected(), row: h.rows.get(5)!.value.name,
      last: h.events.at(-1), visible: h.grid.rowIds("visible"), columns: h.grid.columns().map(column => column.key) };
  });
  expect(result).toEqual({ first: 4, cleared: null, active: 5, row: "Current fifth",
    last: { kind: "active", id: 5, active: 5, selected: [], checked: [], type: "click", current: true, pressed: 1 },
    visible: [5, 4], columns: ["actions", "score", "name", "key"] });
});

test("native selection buttons activate once by pointer, Enter and Space with row clicks enabled", async ({ page }) => {
  const button = page.locator('[data-acceptance-table] [data-select-row]').first();
  for (const multiple of [false, true]) {
    await page.evaluate(multiple => window.acceptanceFixture.reset({ selectOnRowClick: true, toggleSelection: true, multiple }), multiple);
    await button.click();
    expect(await page.evaluate(() => window.acceptanceFixture.grid.selected())).toBe(1);
    await button.focus(); await page.keyboard.press("Space");
    expect(await page.evaluate(() => window.acceptanceFixture.grid.selected())).toBeNull();
    await page.keyboard.press("Enter");
    expect(await page.evaluate(() => ({ active: window.acceptanceFixture.grid.selected(), selected: window.acceptanceFixture.grid.selectedIds(),
      kinds: window.acceptanceFixture.events.map(event => event.kind) }))).toEqual({ active: 1, selected: multiple ? [1] : [],
      kinds: multiple ? ["active", "selected", "active", "selected", "active", "selected"] : ["active", "active", "active"] });
    await expect(button).toBeFocused();
  }
});

test("independent row activation and repeated disposal retain exact authored ownership", async ({ page }) => {
  const result = await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid); const h = window.acceptanceFixture; h.reset({ selectOnRowClick: true, toggleSelection: true });
    const otherTable = document.createElement("table"); otherTable.innerHTML = markup; h.root.after(otherTable);
    const otherOriginal = otherTable.outerHTML;
    const other = bindGrid(otherTable, { rows: h.rows, parse: { score: Number }, onRowAction: () => {}, selectOnRowClick: true });
    h.cell(1).click(); const independent = other.selected() === null;
    otherTable.querySelectorAll<HTMLElement>("[data-click-cell]")[6].click();
    const separate = { left: h.grid.selected(), right: other.selected() }; other.dispose(); const restoredOther = otherTable.outerHTML === otherOriginal;
    otherTable.remove(); const repeats = [];
    for (let index = 0; index < 3; index++) {
      h.reset({ selectOnRowClick: true, toggleSelection: true }); h.cell(1).click(); h.cell(1, 1).click();
      const events = h.events.length; h.grid.dispose(); const restored = h.table.outerHTML === h.original;
      h.table.querySelector<HTMLElement>("[data-click-cell]")!.click();
      repeats.push({ activeEvents: events, restored, quiet: h.events.length === events });
    }
    return { independent, separate, restoredOther, repeats };
  }, { modules, markup });
  expect(result).toEqual({ independent: true, separate: { left: 1, right: 4 }, restoredOther: true,
    repeats: Array.from({ length: 3 }, () => ({ activeEvents: 2, restored: true, quiet: true })) });
});

test("row activation follows progressive and recycled viewport records without growing mounted DOM", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.acceptanceFixture; h.reset({ selectOnRowClick: true, multiple: true, toggleSelection: true,
      progressive: { size: 10, delay: 1 }, viewport: { root: window.acceptanceFixture.root, estimate: 80, overscan: 2 } }, 100);
    await h.grid.whenBound(); h.cell(1, 1).click(); await h.grid.renderMore(); h.grid.reveal(20); await h.settle(); h.cell(20).click();
    h.grid.reveal(80); await h.settle(); h.cell(80, 1).click();
    const admitted = await h.grid.whenBound(); const mounted = h.table.querySelectorAll("tr[data-accept-record]").length;
    h.grid.reveal(1); await h.settle(); h.cell(1).click();
    return { active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(), admitted: admitted.available,
      total: admitted.visible, mounted, returned: h.block(1).length, logical: h.grid.rowIds("visible").length, storeEvents: h.storeEvents };
  });
  expect(result).toMatchObject({ active: null, selected: [20, 80], checked: [], admitted: 80, total: 100, returned: 2, logical: 100, storeEvents: 0 });
  expect(result.mounted).toBeLessThan(80);
});

test("10,000 loaded records reach the last progressive identity with bounded DOM and quiet disposal", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.acceptanceFixture;
    const binds: { available: number; first: boolean; last: boolean }[] = []; let rowCalls = 0;
    h.reset({ selectOnRowClick: true, multiple: true, progressive: { size: 100, delay: 1 },
      viewport: { root: h.root, estimate: 80, overscan: 2 }, onRowBind: () => { rowCalls++; },
      onBind: result => { binds.push({ available: result.available, first: result.first, last: result.last }); } }, 10000);
    const first = await h.grid.whenBound();
    const initialMounted = h.table.querySelectorAll("tr[data-accept-record]").length;
    h.grid.reveal(10000); await h.grid.whenBound(); await h.settle(); h.cell(10000, 1).click();
    const last = await h.grid.whenBound(); const count = binds.length; await h.grid.renderMore();
    const end = { available: last.available, visible: last.visible, last: last.last, active: h.grid.selected(),
      selected: h.grid.selectedIds(), current: h.events.at(-1)?.current,
      mounted: h.table.querySelectorAll("tr[data-accept-record]").length, rowBindings: rowCalls, exhaustedQuiet: binds.length === count };
    h.grid.refresh(); const pending = h.grid.whenBound().then(() => "resolved", (cause: { name: string }) => cause.name);
    h.grid.dispose(); const callbacks = [binds.length, rowCalls, h.events.length];
    h.rows.set(1, "name", "After disposal"); h.root.dispatchEvent(new Event("scroll"));
    await new Promise(resolve => window.setTimeout(resolve, 30));
    return { first: { available: first.available, visible: first.visible, first: first.first, last: first.last }, initialMounted,
      end, aborted: await pending, quiet: callbacks.every((count, index) => count === [binds.length, rowCalls, h.events.length][index]),
      restored: h.table.outerHTML === h.original };
  });
  expect(result).toMatchObject({ first: { available: 100, visible: 10000, first: true, last: false },
    end: { available: 10000, visible: 10000, last: true, active: 10000, selected: [10000], current: true, exhaustedQuiet: true },
    aborted: "AbortError", quiet: true, restored: true });
  expect(result.initialMounted).toBeLessThan(80);
  expect(result.end.mounted).toBeLessThan(80);
  expect(result.end.rowBindings).toBeLessThan(80);
});
