// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows } from "../../src/data/index.js";
import type { GridColumn, GridHandle } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = { key: number; name: string; team: string; note: string; amount: number };
type Options = Parameters<typeof bindGrid<Item>>[1];
type EventRecord = { columns: readonly GridColumn[]; type: string | null };
declare global {
  interface Window {
    pinnedFixture: {
      grid: GridHandle<Item>; rows: Rows<Item>; root: HTMLElement; table: HTMLTableElement; host: HTMLElement;
      original: string; defaults: readonly GridColumn[]; events: EventRecord[]; storeEvents: number; binds: number;
      observations: { targets: Set<Element>; callback: ResizeObserverCallback; observer: ResizeObserver }[];
      reset(extra?: Partial<Options>, count?: number): void;
      block(id: number): HTMLTableRowElement[];
      cell(id: number, key: string, physical?: number): HTMLTableCellElement;
      leaf(key: string): HTMLTableCellElement;
      settle(): Promise<void>;
    };
  }
}

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts") };
const markup = `<caption>Measured pinned records</caption><colgroup span="2"></colgroup><colgroup span="2"></colgroup><colgroup span="1"></colgroup>
  <thead><tr><th scope="colgroup" data-columns="key name" colspan="2">Identity group</th>
    <th scope="colgroup" data-columns="team note" colspan="2">Assignment group</th><th scope="col" data-column="amount" rowspan="2">Amount</th></tr>
    <tr><th scope="col" data-column="key">Record <button type="button" data-resize-column="key" aria-label="Resize Record column">Resize</button></th>
      <th scope="col" data-column="name">Name</th><th scope="col" data-column="team">Team</th><th scope="col" data-column="note">Note</th></tr></thead>
  <tbody data-row-template><tr><th scope="row" data-column="key" rowspan="2"><button type="button" data-select-row>Select <span data-field="key"></span></button></th>
    <td data-column="name"><label>Name <input data-field="name" required></label><output data-error-for="name"></output></td>
    <td data-columns="team note" colspan="2"><span data-field="team"></span></td>
    <td data-column="amount" rowspan="2"><label>Amount <input type="number" data-field="amount" required min="1"></label></td></tr>
    <tr><td data-column="name"><span data-field="name"></span></td><td data-column="team"><span data-field="team"></span></td>
      <td data-column="note"><label>Note <textarea data-field="note"></textarea></label></td></tr></tbody>
  <tfoot><tr><td data-columns="key name team note amount" colspan="5">Full native summary</td></tr>
    <tr><th scope="row" data-columns="key name" colspan="2">Identity summary</th><td data-columns="team note" colspan="2">Assignment summary</td>
      <td data-column="amount">Application amount</td></tr></tfoot>`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid), { createRows } = await import(modules.data);
    const host = document.createElement("section"); host.dataset.pinnedFixture = "";
    host.innerHTML = '<h2>Pinned native records</h2><div data-pinned-root role="region" aria-label="Pinned records" tabindex="0" style="position:relative;box-sizing:border-box;width:520px;height:280px;overflow:auto;border:3px solid black;padding:4px"><table data-pinned-table tabindex="-1"></table></div>';
    const style = document.createElement("style");
    style.textContent = '[data-pinned-table]{table-layout:fixed;width:920px;border-collapse:separate;border-spacing:3px 1px;font:14px/20px sans-serif}[data-pinned-table] th,[data-pinned-table] td{padding:3px;border:1px solid #aaa;vertical-align:top;box-sizing:border-box}[data-pinned-table] thead th,[data-pinned-table] tfoot td,[data-pinned-table] tfoot th{background:#eef;z-index:2}[data-pinned-table] [data-pinned-column="true"]{background:white;z-index:1}[data-pinned-table] thead [data-pinned-column="true"],[data-pinned-table] tfoot [data-pinned-column="true"]{z-index:3}[data-pinned-table] tbody tr:not([aria-hidden="true"]){height:38px}[data-pinned-table] label{display:block}[data-pinned-table] input,[data-pinned-table] textarea{max-width:100%;width:100px}[data-pinned-table] textarea{height:24px}[data-pinned-table] output:empty{display:none}';
    host.append(style); document.body.append(host);
    const root = host.querySelector<HTMLElement>("[data-pinned-root]")!, table = host.querySelector<HTMLTableElement>("table")!;
    const observations: Window["pinnedFixture"]["observations"] = [];
    const NativeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends NativeObserver {
      constructor(callback: ResizeObserverCallback) { super(callback); observations.push({ targets: new Set(), callback, observer: this }); }
      observe(target: Element, options?: ResizeObserverOptions) {
        observations.find(record => record.observer === this)!.targets.add(target); super.observe(target, options);
      }
      unobserve(target: Element) { observations.find(record => record.observer === this)!.targets.delete(target); super.unobserve(target); }
      disconnect() { observations.find(record => record.observer === this)!.targets.clear(); super.disconnect(); }
    };
    const h: Window["pinnedFixture"] = {
      grid: undefined as unknown as GridHandle<Item>, rows: undefined as unknown as Rows<Item>, root, table, host,
      original: "", defaults: [{ key: "key", width: 111.25, pinned: true }, { key: "name", width: 172.5, pinned: true },
        { key: "team", width: 132.25 }, { key: "note", width: 157.75 }, { key: "amount", width: 182.5 }],
      events: [], storeEvents: 0, binds: 0, observations,
      block(id) { return [...table.querySelectorAll<HTMLTableRowElement>(`tr[data-pin-record="${id}"]`)]; },
      cell(id, key, physical = 0) { return h.block(id)[physical].querySelector<HTMLTableCellElement>(`[data-column="${key}"]`)!; },
      leaf(key) { return table.querySelector<HTMLTableCellElement>(`thead [data-column="${key}"]`)!; },
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))),
      reset(extra = {}, count = 12) {
        h.grid?.dispose(); h.rows?.dispose(); root.scrollLeft = 0; root.scrollTop = 0;
        table.innerHTML = markup; table.style.cssText = ""; h.original = table.outerHTML; h.events = []; h.storeEvents = 0; h.binds = 0;
        h.rows = createRows(Array.from({ length: count }, (_, index) => ({ key: index + 1, name: `Record ${index + 1}`,
          team: `Team ${index % 3}`, note: `Note ${index + 1}`, amount: index + 10 })));
        const options: Options = { rows: h.rows, columns: h.defaults, parse: { amount: Number },
          beforeRowBind({ row, elements }) { for (const element of elements) element.dataset.pinRecord = String(row.id); },
          onColumnsChange: change => { h.events.push({ columns: change.columns, type: change.event?.type ?? null }); },
          onBind: () => { h.binds++; }, ...extra };
        h.grid = bindGrid(table, options); h.rows.subscribe(() => { h.storeEvents++; });
      }
    };
    window.pinnedFixture = h; h.reset();
  }, { modules, markup });
});

test("pinned leaf and grouped native cells use actual cumulative widths including horizontal spacing", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.pinnedFixture; await h.settle(); h.root.scrollLeft = 160; await h.settle();
    const gap = Number.parseFloat(getComputedStyle(h.table).borderSpacing);
    const key = h.leaf("key"), name = h.leaf("name");
    const first = key.getBoundingClientRect(), second = name.getBoundingClientRect();
    const body = h.cell(1, "name").getBoundingClientRect(), detail = h.cell(1, "name", 1).getBoundingClientRect();
    const group = h.table.tHead!.rows[0].cells[0], footer = h.table.tFoot!.rows[1].cells[0];
    const firstPosition = first.left; h.root.scrollLeft = 220; await h.settle();
    return { gap, width: first.width, inset: Number.parseFloat(getComputedStyle(name).left) - Number.parseFloat(getComputedStyle(key).left),
      relative: second.left - first.right, body: body.left - second.left, detail: detail.left - second.left,
      stable: key.getBoundingClientRect().left - firstPosition, group: group.getAttribute("data-pinned-column"),
      footer: footer.getAttribute("data-pinned-column"), groupInset: Number.parseFloat(getComputedStyle(group).left) - Number.parseFloat(getComputedStyle(key).left),
      span: [group.colSpan, footer.colSpan, h.cell(1, "key").rowSpan],
      observers: h.observations.filter(record => record.targets.size).length, storeEvents: h.storeEvents };
  });
  expect(result).toMatchObject({ gap: 3, group: "true", footer: "true", groupInset: 0, span: [2, 2, 2], observers: 1, storeEvents: 0 });
  expect(Math.abs(result.inset - result.width - result.gap)).toBeLessThan(1);
  for (const delta of [result.relative - result.gap, result.body, result.detail, result.stable]) expect(Math.abs(delta)).toBeLessThan(1);
});

test("mixed native spans remain in normal flow while wholly pinned spans retain native structure", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.pinnedFixture;
    h.grid.setColumns(h.grid.columns().map(column => ({ ...column, pinned: column.key !== "note" && column.key !== "amount" })));
    await h.settle(); h.root.scrollLeft = 180; await h.settle();
    const assignment = h.table.tHead!.rows[0].querySelector<HTMLTableCellElement>('[data-columns="team note"]')!;
    const body = h.block(1)[0].querySelector<HTMLTableCellElement>('[data-columns="team note"]')!;
    const footer = h.table.tFoot!.rows[0].cells[0];
    const mixed = [assignment, body, footer].map(cell => ({ marker: cell.getAttribute("data-pinned-column"), position: getComputedStyle(cell).position, span: cell.colSpan }));
    const same = [assignment, body, footer];
    h.grid.setColumns(h.grid.columns().map(column => ({ ...column, pinned: column.key !== "amount" }))); await h.settle();
    const all = [assignment, body].map(cell => ({ marker: cell.getAttribute("data-pinned-column"), span: cell.colSpan }));
    return { mixed, all, same: same.every(cell => cell.isConnected), fullFooter: footer.getAttribute("data-pinned-column"),
      identity: h.table.tHead!.rows[0].cells[0].colSpan, records: h.table.querySelectorAll('tbody tr[data-pin-record="1"]').length };
  });
  expect(result).toEqual({ mixed: [{ marker: null, position: "static", span: 2 }, { marker: null, position: "static", span: 2 },
    { marker: null, position: "static", span: 5 }], all: [{ marker: "true", span: 2 }, { marker: "true", span: 2 }],
    same: true, fullFooter: null, identity: 2, records: 2 });
});

test("unpinned grids allocate no pin observer frame or owned cell presentation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pinnedFixture, before = h.observations.length;
    const frame = window.requestAnimationFrame; let frames = 0;
    window.requestAnimationFrame = callback => { frames++; return frame(callback); };
    try { h.reset({ columns: h.defaults.map(({ pinned, ...column }) => column) }); }
    finally { window.requestAnimationFrame = frame; }
    return { created: h.observations.length - before, active: h.observations.filter(record => record.targets.size).length, frames,
      markers: h.table.querySelectorAll('[data-pinned-column="true"]').length,
      owned: [...h.table.querySelectorAll<HTMLElement>("th,td")].some(cell => cell.style.position || cell.style.left),
      defaultFalse: h.grid.columns().every(column => !column.pinned), frozen: Object.isFrozen(h.grid.columns()) };
  });
  expect(result).toEqual({ created: 0, active: 0, frames: 0, markers: 0, owned: false, defaultFalse: true, frozen: true });
});

test("invalid pin flags and nonleading visible pin proposals are atomic and allow corrected retry", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.pinnedFixture; await h.settle();
    const state = h.grid.columns(), before = h.table.outerHTML;
    const proposals = [null, "true", 0, 1, {}].map(pinned => state.map((column, index) => index ? column : { ...column, pinned: pinned as boolean }));
    proposals.push(state.map(column => ({ ...column, pinned: column.key === "name" })));
    const codes = proposals.map(columns => { try { h.grid.setColumns(columns); return "accepted"; } catch (cause) { return (cause as { code: string }).code; } });
    const unchanged = h.grid.columns() === state && h.table.outerHTML === before && h.events.length === 0;
    h.grid.dispose(); const original = h.table.outerHTML; let initial = "";
    try { bindGrid(h.table, { rows: h.rows, parse: { amount: Number }, columns: proposals.at(-1)! }); }
    catch (cause) { initial = (cause as { code: string }).code; }
    const restored = h.table.outerHTML === original;
    const retry = bindGrid(h.table, { rows: h.rows, parse: { amount: Number }, columns: h.defaults }); retry.dispose();
    return { codes, unchanged, initial, restored, retried: h.table.outerHTML === original,
      expectedHTML: original, actualHTML: h.table.outerHTML };
  }, modules);
  const { expectedHTML, actualHTML, ...state } = result;
  expect(actualHTML).toBe(expectedHTML);
  expect(state).toEqual({ codes: Array(6).fill("GRID_COLUMNS"), unchanged: true, initial: "GRID_COLUMNS", restored: true, retried: true });
});

test("hidden pinned keys retain flags without consuming prefix slots and valid reorder preserves editable nodes", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.pinnedFixture, input = h.cell(1, "name").querySelector<HTMLInputElement>("input")!;
    input.value = "Retained draft"; input.dispatchEvent(new Event("input", { bubbles: true })); input.focus(); input.setSelectionRange(2, 7);
    h.grid.setColumns(h.grid.columns().map(column => column.key === "key" ? { ...column, hidden: true } : column)); await h.settle();
    const gap = Number.parseFloat(getComputedStyle(h.table).borderSpacing);
    const hidden = { flag: h.grid.columns()[0].pinned, inset: Number.parseFloat(getComputedStyle(h.leaf("name")).left) - gap, keyConnected: !!h.block(1)[0].querySelector('[data-column="key"]') };
    const state = h.grid.columns();
    h.grid.setColumns([state[1], { ...state[0], hidden: false }, ...state.slice(2)]); await h.settle();
    return { hidden, keys: h.grid.columns().map(column => column.key), same: h.cell(1, "name").querySelector("input") === input,
      focused: document.activeElement === input, caret: [input.selectionStart, input.selectionEnd], entered: input.value,
      raw: h.rows.get(1)!.value.name, inset: Number.parseFloat(getComputedStyle(h.leaf("name")).left) - gap, storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ hidden: { flag: true, inset: 0, keyConnected: false }, keys: ["name", "key", "team", "note", "amount"],
    same: true, focused: true, caret: [2, 7], entered: "Retained draft", raw: "Record 1", inset: 0, storeEvents: 0 });
});

test("pointer width previews and every cancellation update measured pin offsets before callbacks", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.pinnedFixture; await h.settle(); const button = h.leaf("key").querySelector<HTMLButtonElement>("button")!;
    const original = Number.parseFloat(getComputedStyle(h.leaf("name")).left), widths: number[] = [], cancellations: number[] = [];
    for (const cancellation of ["Escape", "pointercancel", "lostpointercapture", "return"]) {
      button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 41, isPrimary: true, button: 0, clientX: 100 }));
      document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 41, clientX: 140 })); await h.settle();
      widths.push(Number.parseFloat(getComputedStyle(h.leaf("name")).left));
      if (cancellation === "Escape") document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      else if (cancellation === "lostpointercapture") button.dispatchEvent(new PointerEvent(cancellation, { pointerId: 41 }));
      else document.dispatchEvent(new PointerEvent(cancellation === "return" ? "pointerup" : cancellation, { pointerId: 41, clientX: 100 }));
      await h.settle(); cancellations.push(Number.parseFloat(getComputedStyle(h.leaf("name")).left));
    }
    return { original, widths, cancellations, events: h.events.length, preferred: h.grid.columns()[0].width, storeEvents: h.storeEvents };
  });
  expect(result).toMatchObject({ events: 0, preferred: 111.25, storeEvents: 0 });
  for (const width of result.widths) expect(width).toBeGreaterThan(result.original + 20);
  for (const restored of result.cancellations) expect(Math.abs(restored - result.original)).toBeLessThan(1);
});

test("invalid state does not cancel an active resize and pointer commit keeps pin flags", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.pinnedFixture; await h.settle(); const button = h.leaf("key").querySelector<HTMLButtonElement>("button")!;
    button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 41, isPrimary: true, button: 0, clientX: 100 }));
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 41, clientX: 140 })); await h.settle();
    const preview = Number.parseFloat(getComputedStyle(h.leaf("name")).left); let code = "";
    try { h.grid.setColumns(h.grid.columns().map(column => ({ ...column, pinned: column.key === "name" }))); }
    catch (cause) { code = (cause as { code: string }).code; }
    const retained = Number.parseFloat(getComputedStyle(h.leaf("name")).left);
    document.dispatchEvent(new PointerEvent("pointerup", { pointerId: 41, clientX: 140 })); await h.settle();
    return { code, retained: Math.abs(retained - preview) < 1, width: h.grid.columns()[0].width, pinned: h.grid.columns()[0].pinned,
      callbacks: h.events.map(event => event.type), inset: Number.parseFloat(getComputedStyle(h.leaf("name")).left) - Number.parseFloat(getComputedStyle(h.leaf("key")).left), actual: h.leaf("key").getBoundingClientRect().width };
  });
  expect(result).toMatchObject({ code: "GRID_COLUMNS", retained: true, width: 151.25, pinned: true, callbacks: ["pointerup"] });
  expect(Math.abs(result.inset - result.actual - 3)).toBeLessThan(1);
});

test("keyboard resizing preserves pin state and native focus while width-only changes avoid row geometry scans", async ({ page }) => {
  const handle = page.getByRole("button", { name: "Resize Record column" });
  await handle.focus(); await handle.press("ArrowRight"); await handle.press("Shift+ArrowLeft"); await handle.press("Home");
  const result = await page.evaluate(async () => {
    const h = window.pinnedFixture; await h.settle(); const types = h.events.map(event => event.type);
    const original = Element.prototype.getBoundingClientRect; let reads = 0;
    Element.prototype.getBoundingClientRect = function () { if (h.table.tBodies[0].contains(this)) reads++; return original.call(this); };
    try { h.grid.setColumns(h.grid.columns().map(column => column.key === "key" ? { ...column, width: 190.5 } : column)); await h.settle(); }
    finally { Element.prototype.getBoundingClientRect = original; }
    return { types, focused: document.activeElement === h.leaf("key").querySelector("button"), pinned: h.grid.columns()[0].pinned,
      width: h.grid.columns()[0].width, reads, mounted: h.table.querySelectorAll("tr[data-pin-record]").length, storeEvents: h.storeEvents };
  });
  expect(result).toMatchObject({ types: ["keydown", "keydown", "keydown"], focused: true, pinned: true, width: 190.5, storeEvents: 0 });
  expect(result.reads).toBeLessThan(10); expect(result.mounted).toBe(24);
});

test("responsive and hidden-to-visible positioned roots use native widths rather than preferred values", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.pinnedFixture;
    h.root.hidden = true; h.reset({ columns: h.defaults.map(({ width, ...column }) => column) });
    h.table.style.width = "180%"; h.root.style.marginLeft = "31px"; h.root.hidden = false; await h.settle();
    const before = Number.parseFloat(getComputedStyle(h.leaf("name")).left) - Number.parseFloat(getComputedStyle(h.leaf("key")).left), width = h.leaf("key").getBoundingClientRect().width;
    h.root.style.width = "680px"; await h.settle();
    const after = Number.parseFloat(getComputedStyle(h.leaf("name")).left) - Number.parseFloat(getComputedStyle(h.leaf("key")).left), actual = h.leaf("key").getBoundingClientRect().width;
    h.root.scrollLeft = 180; await h.settle();
    const relative = h.leaf("name").getBoundingClientRect().left - h.leaf("key").getBoundingClientRect().right;
    return { before, width, after, actual, relative, noPreferred: h.grid.columns().every(column => column.width === undefined), callbacks: h.events.length };
  });
  expect(result).toMatchObject({ noPreferred: true, callbacks: 0 });
  expect(Math.abs(result.before - result.width - 3)).toBeLessThan(1);
  expect(Math.abs(result.after - result.actual - 3)).toBeLessThan(1);
  expect(result.after).toBeGreaterThan(result.before + 20); expect(Math.abs(result.relative - 3)).toBeLessThan(1);
});

test("spanning-only headers and empty data acquire exact body pin geometry before bind completion", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.pinnedFixture; h.reset({}, 0); h.grid.dispose();
    h.table.tHead!.innerHTML = '<tr><th scope="colgroup" data-columns="key name" colspan="2">Identity</th><th scope="colgroup" data-columns="team note" colspan="2">Assignment</th><th scope="col" data-column="amount">Amount</th></tr>';
    const original = h.table.outerHTML, completions: { count: number; delta?: number }[] = [];
    const grid: GridHandle<Item> = bindGrid(h.table, { rows: h.rows, columns: h.defaults, parse: { amount: Number }, onBind() {
      const row = h.table.tBodies[0].rows[0];
      const key = row?.querySelector<HTMLTableCellElement>('[data-column="key"]'), name = row?.querySelector<HTMLTableCellElement>('[data-column="name"]');
      completions.push({ count: h.rows.entries().length,
        ...(key && name ? { delta: Number.parseFloat(getComputedStyle(name).left) - Number.parseFloat(getComputedStyle(key).left) - key.getBoundingClientRect().width - 3 } : {}) });
    } });
    await h.settle(); h.rows.append([{ key: 1, name: "Appended record", team: "A", note: "Note", amount: 10 }]);
    const columns = grid.columns().map(column => ({ key: column.key, pinned: Boolean(column.pinned) }));
    grid.dispose(); await h.settle(); return { completions, columns, restored: h.table.outerHTML === original,
      expectedHTML: original, actualHTML: h.table.outerHTML };
  }, modules);
  expect(result.completions).toHaveLength(2); expect(result.completions[0]).toEqual({ count: 0 }); expect(result.completions[1].count).toBe(1);
  expect(Math.abs(result.completions[1].delta!)).toBeLessThan(1);
  expect(result.columns).toEqual([{ key: "key", pinned: true }, { key: "name", pinned: true }, { key: "team", pinned: false }, { key: "note", pinned: false }, { key: "amount", pinned: false }]);
  expect(result.actualHTML).toBe(result.expectedHTML);
  expect(result.restored).toBe(true);
});

test("viewport and progressive row blocks inherit current offsets after release and far reveal", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.pinnedFixture; h.reset({ viewport: { root: h.root, estimate: 90, overscan: 2 }, progressive: { size: 100 } }, 5000);
    await h.grid.whenBound(); await h.settle(); const old = h.block(1);
    h.grid.setColumns(h.grid.columns().map(column => column.key === "key" ? { ...column, width: 190.5 } : column));
    h.grid.reveal(5000); await h.grid.whenBound(); await h.settle(); h.root.scrollLeft = 180; await h.settle();
    const key = h.cell(5000, "key"), name = h.cell(5000, "name"), detail = h.cell(5000, "name", 1);
    const relative = name.getBoundingClientRect().left - key.getBoundingClientRect().right;
    const delta = detail.getBoundingClientRect().left - name.getBoundingClientRect().left;
    const count = h.table.querySelectorAll("tr[data-pin-record]").length;
    return { relative, delta, count, released: old.every(row => !row.isConnected), block: h.block(5000).length,
      marked: [key, name, detail].every(cell => cell.getAttribute("data-pinned-column") === "true"),
      activeObservers: h.observations.filter(record => record.targets.size).length,
      observedTargets: h.observations.filter(record => record.targets.size).map(record => record.targets.size),
      last: (await h.grid.whenBound()).last, storeEvents: h.storeEvents };
  });
  expect(result).toMatchObject({ released: true, block: 2, marked: true, activeObservers: 2, last: true, storeEvents: 0 });
  expect(Math.abs(result.relative - 3)).toBeLessThan(1); expect(Math.abs(result.delta)).toBeLessThan(1);
  expect(result.count).toBeLessThan(80); expect(Math.min(...result.observedTargets)).toBeLessThan(20);
});

test("independent pin owners restore authored styles and remain quiet after queued measurement and active resize disposal", async ({ page }) => {
  const result = await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid); const h = window.pinnedFixture; await h.settle();
    const secondRoot = h.root.cloneNode(false) as HTMLElement, second = document.createElement("table"); second.dataset.pinnedTable = "";
    second.innerHTML = markup; secondRoot.style.width = "460px"; secondRoot.append(second); h.host.append(secondRoot);
    const original = second.outerHTML, secondGrid = bindGrid(second, { rows: h.rows, parse: { amount: Number }, columns: h.defaults.map(column => column.key === "key" ? { ...column, width: 220 } : column) });
    await h.settle(); const otherInset = Number.parseFloat(getComputedStyle(second.querySelector<HTMLElement>('thead [data-column="name"]')!).left);
    h.grid.setColumns(h.grid.columns().map(column => column.key === "key" ? { ...column, width: 150 } : column)); await h.settle();
    const independent = Math.abs(Number.parseFloat(getComputedStyle(second.querySelector<HTMLElement>('thead [data-column="name"]')!).left) - otherInset) < 1;
    secondGrid.dispose(); const actualOtherHTML = second.outerHTML, restoredOther = actualOtherHTML === original; secondRoot.remove();
    h.grid.dispose();
    const authored = h.table.querySelector<HTMLTableCellElement>('tbody [data-column="key"]')!;
    authored.style.setProperty("position", "relative", "important"); authored.style.setProperty("left", "7px", "important");
    authored.style.setProperty("background-color", "rgb(1, 2, 3)"); authored.setAttribute("data-pinned-column", "authored");
    const expected = h.table.outerHTML; let changes = 0;
    const grid: GridHandle<Item> = bindGrid(h.table, { rows: h.rows, columns: h.defaults, parse: { amount: Number }, onColumnsChange() { changes++; } });
    const cell = h.table.querySelector<HTMLTableCellElement>('tbody [data-column="key"]')!;
    cell.style.setProperty("background-color", "rgb(4, 5, 6)");
    grid.setColumns(grid.columns().map(column => ({ ...column, pinned: false })));
    const unpinRestored = cell.style.position === "relative" && cell.style.left === "7px" &&
      cell.style.getPropertyPriority("position") === "important" && cell.style.getPropertyPriority("left") === "important" &&
      cell.style.backgroundColor === "rgb(4, 5, 6)" && cell.getAttribute("data-pinned-column") === "authored";
    grid.setColumns(h.defaults); changes = 0;
    const button = h.table.querySelector<HTMLButtonElement>('[data-resize-column="key"]')!;
    button.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 41, isPrimary: true, button: 0, clientX: 100, bubbles: true }));
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 41, clientX: 140 }));
    const observed = h.observations.filter(record => record.targets.size); grid.dispose();
    for (const record of observed) record.callback([], record.observer);
    document.dispatchEvent(new PointerEvent("pointerup", { pointerId: 41, clientX: 160 })); await h.settle();
    const actualOwnHTML = h.table.outerHTML, restored = actualOwnHTML === expected;
    const retry = bindGrid(h.table, { rows: h.rows, columns: h.defaults, parse: { amount: Number } }); retry.dispose(); await h.settle();
    return { independent, restoredOther, unpinRestored, restored, retry: h.table.outerHTML === expected, changes,
      expectedOtherHTML: original, actualOtherHTML, expectedOwnHTML: expected, actualOwnHTML, retryHTML: h.table.outerHTML,
      observers: h.observations.filter(record => record.targets.size).length };
  }, { modules, markup });
  const { expectedOtherHTML, actualOtherHTML, expectedOwnHTML, actualOwnHTML, retryHTML, ...state } = result;
  expect(actualOtherHTML).toBe(expectedOtherHTML);
  expect(actualOwnHTML).toBe(expectedOwnHTML);
  expect(retryHTML).toBe(expectedOwnHTML);
  expect(state).toEqual({ independent: true, restoredOther: true, unpinRestored: true, restored: true, retry: true, changes: 0, observers: 0 });
});

test("leaf probes detect native width redistribution hidden by unchanged table and spanning-cell widths", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid), { createRows } = await import(modules.data);
    const h = window.pinnedFixture; h.grid.dispose();
    const root = document.createElement("div"); root.style.cssText = "position:relative;width:420px;height:200px;overflow:auto";
    const table = document.createElement("table"); table.style.cssText = "table-layout:fixed;width:700px;border-collapse:separate;border-spacing:0";
    table.innerHTML = '<caption>Redistributed native columns</caption><colgroup span="2"></colgroup><colgroup span="2"></colgroup><thead><tr><th scope="colgroup" data-columns="a b" colspan="2">AB</th><th scope="colgroup" data-columns="c d" colspan="2">CD</th></tr></thead><tbody><tr data-row-template><td data-column="a"><span data-field="key"></span></td><td data-columns="b c" colspan="2"><span data-field="name"></span></td><td data-column="d"><span data-field="team"></span></td></tr></tbody>';
    root.append(table); h.host.append(root);
    const rows = createRows([{ key: 1, name: "Spanning record", team: "A" }]); let columnsChanged = 0, dataChanged = 0;
    const start = h.observations.length;
    const grid = bindGrid(table, { rows, columns: [{ key: "a", width: 100, pinned: true }, { key: "b", width: 100, pinned: true },
      { key: "c", width: 100, pinned: true }, { key: "d", width: 400 }], onColumnsChange() { columnsChanged++; } });
    rows.subscribe(() => { dataChanged++; }); await h.settle();
    const a = table.querySelector<HTMLTableCellElement>('tbody [data-column="a"]')!;
    const bc = table.querySelector<HTMLTableCellElement>('tbody [data-columns="b c"]')!;
    const ab = table.tHead!.rows[0].cells[0];
    const geometry = () => ({ table: table.getBoundingClientRect().width, a: a.getBoundingClientRect().width,
      ab: ab.getBoundingClientRect().width, bc: bc.getBoundingClientRect().width,
      offset: Number.parseFloat(getComputedStyle(bc).left) - Number.parseFloat(getComputedStyle(a).left) });
    const before = geometry();
    for (const [index, col] of [...table.querySelectorAll("col")].entries()) col.style.setProperty("width", [120, 80, 120, 380][index] + "px", "important");
    await h.settle(); root.scrollLeft = 180; await h.settle(); const after = geometry();
    const observers = h.observations.slice(start).filter(record => record.targets.size);
    const observedTargets = observers.map(record => record.targets.size);
    const nativeGap = bc.getBoundingClientRect().left - a.getBoundingClientRect().right;
    grid.dispose(); rows.dispose(); root.remove();
    return { before, after, columnsChanged, dataChanged, observers: observers.length, observedTargets, nativeGap };
  }, modules);
  for (const [actual, expected] of [[result.before.table, 700], [result.before.a, 100], [result.before.ab, 200], [result.before.bc, 200],
    [result.before.offset, 100], [result.after.table, 700], [result.after.a, 120], [result.after.ab, 200], [result.after.bc, 200], [result.after.offset, 120]]) {
    expect(actual).toBeCloseTo(expected, 1);
  }
  expect(result.after.offset - result.before.offset).toBe(20);
  for (const delta of [result.after.table - result.before.table, result.after.ab - result.before.ab, result.after.bc - result.before.bc]) {
    expect(delta).toBeCloseTo(0, 1);
  }
  expect(result).toMatchObject({ columnsChanged: 0, dataChanged: 0, observers: 1 });
  expect(result.observedTargets[0]).toBeLessThanOrEqual(4);
  expect(Math.abs(result.nativeGap)).toBeLessThan(1);
});

test("probe preference uses visible membership after hidden keys reduce an authored header span", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid), { createRows } = await import(modules.data);
    const h = window.pinnedFixture; h.grid.dispose();
    const root = document.createElement("div"); root.style.cssText = "position:relative;width:420px;height:200px;overflow:auto";
    const table = document.createElement("table"); table.style.cssText = "table-layout:fixed;width:700px;border-collapse:separate;border-spacing:0";
    table.innerHTML = '<caption>Visible probe membership</caption><colgroup span="3"></colgroup><colgroup span="3"></colgroup><thead><tr><th scope="colgroup" data-columns="a b c" colspan="3">ABC</th><th scope="colgroup" data-columns="d e f" colspan="3">DEF</th></tr></thead><tbody data-row-template><tr><td data-columns="a b" colspan="2">Hidden</td><td data-columns="c d" colspan="2"><span data-field="name"></span></td><td data-columns="e f" colspan="2"><span data-field="team"></span></td></tr><tr><td data-columns="a b c" colspan="3"><span data-field="key"></span></td><td data-columns="d e" colspan="2">DE</td><td data-column="f">Final cell</td></tr></tbody>';
    root.append(table); h.host.append(root);
    const rows = createRows([{ key: 1, name: "Visible record", team: "A" }]); let columnsChanged = 0, dataChanged = 0;
    const start = h.observations.length;
    const grid = bindGrid(table, { rows, columns: [{ key: "a", width: 50, hidden: true }, { key: "b", width: 50, hidden: true },
      { key: "c", width: 100, pinned: true }, { key: "d", width: 100, pinned: true }, { key: "e", width: 100, pinned: true },
      { key: "f", width: 400 }], onColumnsChange() { columnsChanged++; } });
    rows.subscribe(() => { dataChanged++; }); await h.settle();
    const c = table.tHead!.rows[0].cells[0];
    const cd = table.querySelector<HTMLTableCellElement>('tbody [data-columns="c d"]')!;
    const de = table.querySelector<HTMLTableCellElement>('tbody [data-columns="d e"]')!;
    const geometry = () => ({ table: table.getBoundingClientRect().width, c: c.getBoundingClientRect().width,
      cd: cd.getBoundingClientRect().width, de: de.getBoundingClientRect().width,
      offset: Number.parseFloat(getComputedStyle(de).left) - Number.parseFloat(getComputedStyle(c).left) });
    const before = geometry();
    for (const [index, col] of [...table.querySelectorAll("col")].entries()) col.style.setProperty("width", [120, 80, 120, 380][index] + "px", "important");
    await h.settle(); root.scrollLeft = 180; await h.settle(); const after = geometry();
    const observers = h.observations.slice(start).filter(record => record.targets.size);
    const observedTargets = observers.map(record => record.targets.size);
    grid.dispose(); rows.dispose(); root.remove();
    return { before, after, columnsChanged, dataChanged, observers: observers.length, observedTargets };
  }, modules);
  for (const [actual, expected] of [[result.before.table, 700], [result.before.c, 100], [result.before.cd, 200], [result.before.de, 200],
    [result.before.offset, 100], [result.after.table, 700], [result.after.c, 120], [result.after.cd, 200], [result.after.de, 200], [result.after.offset, 120]]) {
    expect(actual).toBeCloseTo(expected, 1);
  }
  expect(result.after.offset - result.before.offset).toBe(20);
  for (const delta of [result.after.table - result.before.table, result.after.cd - result.before.cd, result.after.de - result.before.de]) {
    expect(delta).toBeCloseTo(0, 1);
  }
  expect(result).toMatchObject({ columnsChanged: 0, dataChanged: 0, observers: 1 });
  expect(result.observedTargets[0]).toBeLessThanOrEqual(4);
});

test("bind completion sees native pin offsets after row hooks widen an automatic-layout column", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid), { createRows } = await import(modules.data);
    const h = window.pinnedFixture; h.grid.dispose();
    const results = [];
    for (const progressive of [undefined, { size: 1 }]) {
      const table = document.createElement("table"); table.style.cssText = "table-layout:auto;width:600px;border-collapse:separate;border-spacing:0";
      table.innerHTML = '<caption>Row hook geometry</caption><thead><tr><th data-column="a">First</th><th data-column="b">Second</th><th data-column="c">Third</th></tr></thead><tbody><tr data-row-template><td data-column="a"><span data-field="name"></span></td><td data-column="b"><span data-field="key"></span></td><td data-column="c"><span data-field="team"></span></td></tr></tbody>';
      h.host.append(table);
      const rows: Rows<Item> = createRows([{ key: 1, name: "Short", team: "A", note: "Note", amount: 10 }]);
      const completions: { width: number; offset: number }[] = [];
      const options: Options = { rows, progressive, columns: [{ key: "a", width: 100, pinned: true }, { key: "b", width: 100, pinned: true }, { key: "c", width: 400 }],
        onRowBind({ elements }) { elements[0].querySelector<HTMLElement>('[data-column="a"]')!.style.minWidth = "280px"; },
        onBind() {
          const a = table.querySelector<HTMLTableCellElement>('tbody [data-column="a"]')!, b = table.querySelector<HTMLTableCellElement>('tbody [data-column="b"]')!;
          completions.push({ width: a.getBoundingClientRect().width,
            offset: Number.parseFloat(getComputedStyle(b).left) - Number.parseFloat(getComputedStyle(a).left) });
        } };
      const grid: GridHandle<Item> = bindGrid(table, options); const synchronous = completions.slice();
      await grid.whenBound(); await h.settle(); const count = completions.length; grid.dispose(); rows.dispose(); table.remove();
      results.push({ synchronous, count });
    }
    return results;
  }, modules);
  expect(result).toHaveLength(2);
  for (const mode of result) {
    expect(mode.synchronous).toHaveLength(1);
    expect(mode.synchronous[0].width).toBeGreaterThanOrEqual(280);
    expect(Math.abs(mode.synchronous[0].offset - mode.synchronous[0].width)).toBeLessThan(1);
    expect(mode.count).toBe(1);
  }
});

test("bind completion sees content-driven native pin widths without row hooks", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid), { createRows } = await import(modules.data);
    const h = window.pinnedFixture; h.grid.dispose(); const results = [];
    for (const progressive of [undefined, { size: 1 }]) {
      const table = document.createElement("table"); table.style.cssText = "table-layout:auto;width:600px;border-collapse:separate;border-spacing:0";
      table.innerHTML = '<caption>Content driven pin geometry</caption><thead><tr><th data-column="a">First</th><th data-column="b">Second</th><th data-column="c">Third</th></tr></thead><tbody><tr data-row-template><td data-column="a"><span data-field="name"></span></td><td data-column="b"><span data-field="key"></span></td><td data-column="c"><span data-field="team"></span></td></tr></tbody>';
      h.host.append(table);
      const rows: Rows<Item> = createRows([{ key: 1, name: "W".repeat(48), team: "A", note: "Note", amount: 10 }]);
      const completions: { width: number; offset: number }[] = [];
      const options: Options = { rows, progressive, columns: [{ key: "a", width: 100, pinned: true }, { key: "b", width: 100, pinned: true }, { key: "c", width: 400 }],
        onBind() {
          const a = table.querySelector<HTMLTableCellElement>('tbody [data-column="a"]')!, b = table.querySelector<HTMLTableCellElement>('tbody [data-column="b"]')!;
          completions.push({ width: a.getBoundingClientRect().width,
            offset: Number.parseFloat(getComputedStyle(b).left) - Number.parseFloat(getComputedStyle(a).left) });
        } };
      const grid: GridHandle<Item> = bindGrid(table, options); const synchronous = completions.slice();
      await grid.whenBound(); await h.settle(); const count = completions.length; grid.dispose(); rows.dispose(); table.remove();
      results.push({ synchronous, count });
    }
    return results;
  }, modules);
  expect(result).toHaveLength(2);
  for (const mode of result) {
    expect(mode.synchronous).toHaveLength(1);
    expect(mode.synchronous[0].width).toBeGreaterThanOrEqual(280);
    expect(Math.abs(mode.synchronous[0].offset - mode.synchronous[0].width)).toBeLessThan(1);
    expect(mode.count).toBe(1);
  }
});

test("literal authored pin styles survive unpin disposal and retry while foreign changes remain owned by the application", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid), { createRows } = await import(modules.data);
    const h = window.pinnedFixture; h.grid.dispose();
    const styles = ["position:relative;left:7px;color:red", "color:red", "inset:1px 2px 3px 4px;color:red",
      "position:relative!important;left:7px!important;color:red"];
    const keys = ["a", "b", "c", "d"], fields = ["key", "name", "team", "note"];
    const table = document.createElement("table"); table.setAttribute("style", "table-layout:fixed;width:400px;border-spacing:0");
    table.innerHTML = `<caption>Literal pin styles</caption><thead><tr>${keys.map((key, index) =>
      `<th scope="col" data-column="${key}" data-pinned-column="authored" style="${styles[index]}">${key}</th>`).join("")}</tr></thead><tbody><tr data-row-template>${keys.map((key, index) =>
      `<td data-column="${key}" data-field="${fields[index]}"></td>`).join("")}</tr></tbody>`;
    h.host.append(table); const expectedHTML = table.outerHTML, headers = [...table.tHead!.rows[0].cells];
    const rows: Rows<Item> = createRows([{ key: 1, name: "Record", team: "A", note: "Note", amount: 10 }]);
    const columns: readonly GridColumn[] = keys.map(key => ({ key, width: 100, pinned: true }));
    let changes = 0;
    const options: Options = { rows, columns, onColumnsChange() { changes++; } };
    const grid: GridHandle<Item> = bindGrid(table, options);
    grid.setColumns(columns.map(column => ({ ...column, pinned: false })));
    const unpinnedRaw = headers.map(header => header.getAttribute("style"));
    const unpinnedMarkers = headers.map(header => header.getAttribute("data-pinned-column"));
    grid.setColumns(columns); grid.dispose(); const disposedHTML = table.outerHTML;
    const retry: GridHandle<Item> = bindGrid(table, options); retry.dispose(); const retryHTML = table.outerHTML;
    const foreignExpected = table.cloneNode(true) as HTMLTableElement;
    foreignExpected.tHead!.rows[0].cells[1].style.color = "blue";
    const expectedForeignHTML = foreignExpected.outerHTML;
    const foreign: GridHandle<Item> = bindGrid(table, options);
    headers[1].style.color = "blue";
    foreign.setColumns(columns.map(column => ({ ...column, pinned: false })));
    const foreignRaw = headers.map(header => header.getAttribute("style"));
    const properties = headers.map(header => ({ position: header.style.position, left: header.style.left, color: header.style.color,
      positionPriority: header.style.getPropertyPriority("position"), leftPriority: header.style.getPropertyPriority("left") }));
    foreign.dispose(); const foreignHTML = table.outerHTML;
    const activeObservers = h.observations.filter(record => record.targets.size).length;
    rows.dispose(); table.remove();
    return { styles, unpinnedRaw, unpinnedMarkers, expectedHTML, disposedHTML, retryHTML, foreignRaw, properties,
      expectedForeignHTML, foreignHTML, activeObservers, changes };
  }, modules);
  expect(result.unpinnedRaw).toEqual(result.styles);
  expect(result.unpinnedMarkers).toEqual(Array(4).fill("authored"));
  expect(result.disposedHTML).toBe(result.expectedHTML);
  expect(result.retryHTML).toBe(result.expectedHTML);
  expect(result.foreignRaw.filter((_, index) => index !== 1)).toEqual(result.styles.filter((_, index) => index !== 1));
  expect(result.properties).toEqual([
    { position: "relative", left: "7px", color: "red", positionPriority: "", leftPriority: "" },
    { position: "", left: "", color: "blue", positionPriority: "", leftPriority: "" },
    { position: "", left: "4px", color: "red", positionPriority: "", leftPriority: "" },
    { position: "relative", left: "7px", color: "red", positionPriority: "important", leftPriority: "important" }
  ]);
  expect(result.foreignHTML).toBe(result.expectedForeignHTML);
  expect(result).toMatchObject({ activeObservers: 0, changes: 3 });
});
