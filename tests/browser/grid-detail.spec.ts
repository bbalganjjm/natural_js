// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows } from "../../src/data/index.js";
import type { GridHandle, GridRowScope } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = { key: number; name: string; group: string; active: boolean; profile: { notes: string } };
type Options = Parameters<typeof bindGrid<Item>>[1];
declare global {
  interface Window {
    gridDetailFixture: {
      grid: GridHandle<Item>; rows: Rows<Item>; table: HTMLTableElement; root: HTMLElement;
      handle: HTMLButtonElement; original: string; rootStyle: string | null; handleSource: string;
      eligibility: number; callbacks: number;
      rebind(extra?: Partial<Options>): void;
      settle(): Promise<void>;
      error(action: () => unknown): { code: string; api: string } | null;
    };
  }
}
const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindGrid }, { createRows }] = await Promise.all([import(modules.grid), import(modules.data)]);
    const host = document.createElement("main");
    host.innerHTML = `<h1>Detail identity contracts</h1><div data-detail-root tabindex="0" role="region"
      aria-label="Detail rows" style="height:160px;width:520px;overflow:auto;overflow-anchor:none">
      <table data-detail-grid><caption>Detail identities</caption><thead><tr>
        <th scope="col" data-column="record">Record</th><th scope="col" data-column="group">Group</th>
      </tr></thead><tbody><tr data-row-template>
        <td data-column="record"><span data-field="key"></span><label>Name <input data-field="name" required></label>
          <output data-error-for="name"></output><button type="button" data-select-row>Select</button>
          <label>Check <input type="checkbox" data-check-row></label></td>
        <td data-column="group"><span data-field="group"></span></td>
      </tr></tbody></table></div><button type="button" data-detail-height aria-label="Resize detail grid">Resize</button>`;
    const style = document.createElement("style");
    style.textContent = '[data-detail-grid]{border-collapse:collapse;width:500px;font:14px/20px sans-serif}[data-detail-grid] tbody tr{height:52px}[data-detail-grid] th,[data-detail-grid] td{padding:2px}[data-detail-grid] output:empty{display:none}';
    host.append(style); document.body.append(host);
    const root = host.querySelector<HTMLElement>("[data-detail-root]")!;
    const table = host.querySelector<HTMLTableElement>("table")!;
    const handle = host.querySelector<HTMLButtonElement>("[data-detail-height]")!;
    const rows = createRows(Array.from({ length: 12 }, (_, index) => ({ key: index + 1, name: `Record ${index + 1}`,
      group: index % 2 ? "even" : "odd", active: index % 2 === 1, profile: { notes: `Notes ${index + 1}` } })));
    const h: Window["gridDetailFixture"] = {
      grid: null as unknown as GridHandle<Item>, rows, root, table, handle, original: table.outerHTML,
      rootStyle: root.getAttribute("style"), handleSource: handle.outerHTML, eligibility: 0, callbacks: 0,
      rebind(extra: Partial<Options> = {}) {
        h.grid?.dispose(); root.scrollTop = 0;
        const options: Options = { rows, multiple: true,
          filters: { group: { value: row => row.group } },
          canSelect: row => { h.eligibility++; return row.value.active; },
          canCheck: row => { h.eligibility++; return row.value.active; },
          onSelect: () => { h.callbacks++; }, onSelectionChange: () => { h.callbacks++; },
          onCheckChange: () => { h.callbacks++; }, ...extra };
        h.grid = bindGrid(table, options);
      },
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
      error(action) {
        try { action(); return null; }
        catch (cause) { const error = cause as { code: string; api: string }; return { code: error.code, api: error.api }; }
      }
    };
    window.gridDetailFixture = h; h.rebind();
  }, modules);
});

test("row scopes expose sorted projection, logical page and live store independently of eligibility", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridDetailFixture;
    h.grid.setStatusFilter(["clean", "update", "insert", "delete"]);
    h.rows.remove(2); h.rows.set(3, "name", "Changed record");
    h.rows.add({ key: 13, name: "Added", group: "odd", active: false, profile: { notes: "Added" } });
    h.grid.setFilter(row => row.key <= 9); h.grid.setColumnFilter("group", ["odd"]);
    h.grid.setSort((a, b) => b.key - a.key); h.grid.setPage({ page: 2, size: 2 });
    const before = { eligibility: h.eligibility, callbacks: h.callbacks };
    return { visible: h.grid.rowIds("visible"), filtered: h.grid.rowIds("filtered"), store: h.grid.rowIds("store"),
      active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      unchangedObservers: h.eligibility === before.eligibility && h.callbacks === before.callbacks };
  });
  expect(result).toEqual({ visible: [5, 3], filtered: [9, 7, 5, 3, 1],
    store: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], active: null, selected: [], checked: [], unchangedObservers: true });
});

test("projected scopes include explicitly shown tombstones while store remains live", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridDetailFixture;
    h.rows.remove(2); h.rows.remove(4); h.grid.setStatusFilter(["clean", "delete"]);
    h.grid.setPage({ page: 1, size: 3 });
    const mixed = { visible: h.grid.rowIds("visible"), filtered: h.grid.rowIds("filtered"), store: h.grid.rowIds("store") };
    h.grid.setStatusFilter(["delete"]);
    return { mixed, deleted: h.grid.rowIds("visible"), filtered: h.grid.rowIds("filtered"),
      protected: [...h.table.querySelectorAll<HTMLInputElement>('tbody input[data-field="name"]')].every(input => input.disabled),
      checked: h.grid.checkedIds(), selected: h.grid.selectedIds() };
  });
  expect(result).toEqual({ mixed: { visible: [1, 2, 3], filtered: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    store: [1, 3, 5, 6, 7, 8, 9, 10, 11, 12] }, deleted: [2, 4], filtered: [2, 4], protected: true, checked: [], selected: [] });
});

test("row identity snapshots are frozen and old results survive ordering and data changes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridDetailFixture, scopes: GridRowScope[] = ["visible", "filtered", "store"];
    const old = scopes.map(scope => h.grid.rowIds(scope));
    const mutationRejected = old.every(ids => { try { (ids as number[]).push(99); return false; } catch { return true; } });
    h.rows.move(12, 1); h.rows.remove(2); h.rows.add({ key: 13, name: "Added", group: "odd", active: false, profile: { notes: "Added" } });
    h.grid.setPage({ page: 2, size: 3 });
    return { old, frozen: old.every(Object.isFrozen), mutationRejected,
      current: scopes.map(scope => h.grid.rowIds(scope)), currentFrozen: scopes.every(scope => Object.isFrozen(h.grid.rowIds(scope))) };
  });
  expect(result.old).toEqual(Array.from({ length: 3 }, () => Array.from({ length: 12 }, (_, index) => index + 1)));
  expect(result.frozen && result.mutationRejected && result.currentFrozen).toBe(true);
  expect(result.current).toEqual([[4, 5, 6], [12, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13], [12, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13]]);
});

test("identity lookup includes unmounted page rows without DOM queries, rendering or focus changes", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridDetailFixture;
    h.rebind({ viewport: { root: h.root, estimate: 52, overscan: 1 }, initialPage: { page: 1, size: 250 } });
    h.rows.append(Array.from({ length: 288 }, (_, index) => ({ key: index + 13, name: `Loaded ${index + 13}`,
      group: "loaded", active: true, profile: { notes: "Loaded" } })));
    await h.settle();
    const input = h.table.querySelector<HTMLInputElement>('tbody input[data-field="name"]')!;
    input.focus(); input.value = "Uncommitted draft"; input.dispatchEvent(new Event("input", { bubbles: true }));
    const children = [...h.table.querySelectorAll("tbody tr")], scroll = h.root.scrollTop;
    const before = { eligibility: h.eligibility, callbacks: h.callbacks };
    const observer = new MutationObserver(() => {}); observer.observe(h.table, { subtree: true, childList: true, attributes: true });
    const query = h.table.querySelector, queryAll = h.table.querySelectorAll; let queries = 0;
    h.table.querySelector = function (this: HTMLTableElement, selector: string) { queries++; return query.call(this, selector); } as typeof query;
    h.table.querySelectorAll = function (this: HTMLTableElement, selector: string) { queries++; return queryAll.call(this, selector); } as typeof queryAll;
    let counts: number[];
    try { counts = [h.grid.rowIds("visible").length, h.grid.rowIds("filtered").length, h.grid.rowIds("store").length]; }
    finally { delete (h.table as unknown as Record<string, unknown>).querySelector; delete (h.table as unknown as Record<string, unknown>).querySelectorAll; }
    const mutations = observer.takeRecords().length; observer.disconnect();
    return { counts, queries, mutations, bounded: children.length < 30,
      sameNodes: children.every((row, index) => row === h.table.querySelectorAll("tbody tr")[index]),
      sameFocus: document.activeElement === input, draft: input.value, scroll: h.root.scrollTop === scroll,
      unchangedObservers: h.eligibility === before.eligibility && h.callbacks === before.callbacks };
  });
  expect(result).toEqual({ counts: [250, 300, 300], queries: 0, mutations: 0, bounded: true,
    sameNodes: true, sameFocus: true, draft: "Uncommitted draft", scroll: true, unchangedObservers: true });
});

test("identity snapshots follow pre-bind rollback and post-bind commit while rejecting invalid scopes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridDetailFixture; let fail: "before" | "after" | null = null;
    h.rebind({ initialPage: { page: 1, size: 3 },
      beforeRowBind() { if (fail === "before") throw new Error("Before binding failed"); },
      onRowBind() { if (fail === "after") throw new Error("After binding failed"); } });
    const before = [h.grid.rowIds("visible"), h.grid.rowIds("filtered"), h.grid.rowIds("store")];
    const html = h.table.outerHTML;
    const errors = [undefined, null, "page", "", 0, {}, []].map(scope => h.error(() => h.grid.rowIds(scope as GridRowScope)));
    const invalidUnchanged = h.table.outerHTML === html;
    fail = "before"; const bindingError = h.error(() => h.grid.setPage({ page: 2, size: 3 }));
    const after = [h.grid.rowIds("visible"), h.grid.rowIds("filtered"), h.grid.rowIds("store")];
    fail = null; h.grid.refresh(); const page = h.grid.page(), retried = h.grid.rowIds("visible");
    fail = "after"; const afterError = h.error(() => h.grid.setPage({ page: 2, size: 3 }));
    const committed = h.grid.rowIds("visible"), committedPage = h.grid.page();
    fail = null; h.grid.refresh();
    return { before, after, invalidUnchanged, errors, bindingError, page, retried, afterError,
      committed, committedPage, retriedCommitted: h.grid.rowIds("visible") };
  });
  expect(result.errors).toEqual(Array.from({ length: 7 }, () => ({ code: "GRID_SCOPE", api: "bindGrid" })));
  expect(result.invalidUnchanged).toBe(true);
  expect(result.bindingError).toEqual({ code: "GRID_BIND", api: "bindGrid" });
  expect(result.after).toEqual(result.before);
  expect(result.page).toEqual({ page: 1, size: 3, total: 12, pages: 4 });
  expect(result.retried).toEqual([1, 2, 3]);
  expect(result.afterError).toEqual({ code: "GRID_BIND", api: "bindGrid" });
  expect(result.committedPage).toEqual({ page: 2, size: 3, total: 12, pages: 4 });
  expect(result.committed).toEqual([4, 5, 6]); expect(result.retriedCommitted).toEqual(result.committed);
});

test("reveal accepts all logical alignments without selecting, checking or committing drafts", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridDetailFixture; h.grid.select(2); h.grid.setChecked([4]);
    const input = h.table.querySelector<HTMLInputElement>('tbody input[data-field="name"]')!;
    input.focus(); input.value = "Pending text"; input.dispatchEvent(new Event("input", { bubbles: true }));
    const before = h.rows.get(1), identities = h.grid.rowIds("visible");
    const failures = [undefined, {}, { block: "nearest" }, { block: "start" }, { block: "center" }, { block: "end" }]
      .map(options => h.error(() => h.grid.reveal(12, options as { block?: ScrollLogicalPosition })));
    await h.settle();
    return { failures, active: h.grid.selected(), checked: h.grid.checkedIds(), sameFocus: document.activeElement === input,
      sameStored: h.rows.get(1) === before, draft: input.value, identities: h.grid.rowIds("visible"), previous: identities };
  });
  expect(result.failures).toEqual(Array(6).fill(null));
  expect(result.active).toBe(2); expect(result.checked).toEqual([4]);
  expect(result.sameFocus && result.sameStored).toBe(true); expect(result.draft).toBe("Pending text");
  expect(result.identities).toEqual(result.previous);
});

test("malformed reveal options fail before row lookup, scrolling or view changes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridDetailFixture; h.rebind({ viewport: { root: h.root, estimate: 52 } });
    h.root.scrollTop = 20;
    const html = h.table.outerHTML, ids = h.grid.rowIds("visible"), scroll = h.root.scrollTop;
    const errors = [null, [], "center", 1, false, { block: "middle" }, { block: null }, { block: 1 }]
      .map(options => h.error(() => h.grid.reveal(9999, options as { block?: ScrollLogicalPosition })));
    return { errors, unchanged: h.table.outerHTML === html && h.root.scrollTop === scroll,
      ids: h.grid.rowIds("visible"), before: ids };
  });
  expect(result.errors).toEqual(Array.from({ length: 8 }, () => ({ code: "GRID_VIEWPORT_ALIGN", api: "bindGrid" })));
  expect(result.unchanged).toBe(true); expect(result.ids).toEqual(result.before);
});

test("reveal stays inside the current page and permits only explicitly projected tombstones", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridDetailFixture; h.grid.setPage({ page: 1, size: 3 });
    const offPage = h.error(() => h.grid.reveal(4));
    h.grid.setFilter(row => row.key >= 4);
    const hidden = h.error(() => h.grid.reveal(1));
    h.rows.remove(4); const deleted = h.error(() => h.grid.reveal(4));
    h.grid.setStatusFilter(["delete"]); const shown = h.error(() => h.grid.reveal(4, { block: "center" }));
    return { offPage, hidden, deleted, shown, ids: h.grid.rowIds("visible"), page: h.grid.page(), active: h.grid.selected() };
  });
  const missing = { code: "GRID_VIEWPORT_ROW", api: "bindGrid" };
  expect(result).toEqual({ offPage: missing, hidden: missing, deleted: missing, shown: null,
    ids: [4], page: { page: 1, size: 3, total: 1, pages: 1 }, active: null });
});

test("alignment getters run once and their failures or disposal cannot trigger stale scrolling", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridDetailFixture; h.rebind({ viewport: { root: h.root, estimate: 52 } });
    let reads = 0; const failure = new Error("Alignment getter failed");
    const before = h.table.outerHTML, scroll = h.root.scrollTop; let sameError = false;
    try { h.grid.reveal(12, { get block(): ScrollLogicalPosition { reads++; throw failure; } }); }
    catch (cause) { sameError = cause === failure; }
    const unchanged = before === h.table.outerHTML && scroll === h.root.scrollTop;
    const disposed = h.error(() => h.grid.reveal(12, { get block(): ScrollLogicalPosition { reads++; h.grid.dispose(); return "center"; } }));
    return { reads, sameError, unchanged, disposed, restored: h.table.outerHTML === h.original,
      scopes: ["visible", "filtered", "store"].map(scope => h.error(() => h.grid.rowIds(scope as GridRowScope))),
      revealAfter: h.error(() => h.grid.reveal(1)) };
  });
  const disposed = { code: "GRID_DISPOSED", api: "bindGrid" };
  expect(result).toEqual({ reads: 2, sameError: true, unchanged: true, disposed, restored: true,
    scopes: [disposed, disposed, disposed], revealAfter: disposed });
});

test("row-hook disposal during virtual reveal restores height and authored table ownership", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridDetailFixture; let stop = false, registered = 0, released = 0;
    h.rebind({ viewport: { root: h.root, estimate: 52, overscan: 0 },
      heightResize: { root: h.root, handle: h.handle, min: 80, max: 320 },
      onRowBind(context) { registered++; context.own(() => { released++; }); if (stop && context.row.value.key >= 10) h.grid.dispose(); } });
    stop = true; const error = h.error(() => h.grid.reveal(12, { block: "end" }));
    await h.settle();
    const restored = h.table.outerHTML === h.original && h.root.getAttribute("style") === h.rootStyle && h.handle.outerHTML === h.handleSource;
    const balanced = registered === released;
    h.rebind({ viewport: { root: h.root, estimate: 52 }, heightResize: { root: h.root, handle: h.handle, min: 80, max: 320 } });
    const retry = h.grid.rowIds("visible").length; h.grid.dispose();
    return { error, restored, balanced, retry, final: h.table.outerHTML === h.original && h.handle.outerHTML === h.handleSource };
  });
  expect(result).toEqual({ error: { code: "GRID_DISPOSED", api: "bindGrid" }, restored: true, balanced: true, retry: 12, final: true });
});

test("combined viewport and height cleanup restores a stylesheet-sized root without adding inline style", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridDetailFixture; h.grid.dispose();
    const style = document.createElement("style");
    style.textContent = '[data-detail-root]{height:160px;width:520px;overflow:auto;overflow-anchor:auto}';
    document.head.append(style); h.root.removeAttribute("style");
    const before = h.root.outerHTML;
    h.rebind({ viewport: { root: h.root, estimate: 52 }, heightResize: { root: h.root, handle: h.handle, min: 80, max: 320 } });
    h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    await h.settle(); const resized = h.root.getBoundingClientRect().height;
    h.grid.dispose();
    return { resized, style: h.root.getAttribute("style"), restored: h.root.outerHTML === before,
      handle: h.handle.outerHTML === h.handleSource };
  });
  expect(result).toEqual({ resized: 320, style: null, restored: true, handle: true });
});
