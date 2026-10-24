// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Rows } from "../../src/data/index.js";
import type { GridBindResult, GridHandle } from "../../src/ui/index.js";
import type { GridRowBinding } from "../../src/ui/grid-hooks.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = { key: number; group: string; profile: { name: string; note: string }; mode: string;
  channels: string[]; chosen: number; choices: { label: string; value: number }[]; summary: string };
type Options = Parameters<typeof bindGrid<Item>>[1];
type Observed = Omit<GridBindResult, "event"> & { event: string | null };
type Fault = { phase: "before" | "after" | "field" | "bind"; id?: number; once?: boolean };
declare global {
  interface Window {
    progressiveFixture: {
      grid: GridHandle<Item>; rows: Rows<Item>; table: HTMLTableElement; root: HTMLElement; host: HTMLElement;
      markup: string; original: string; options: Options; before: number[]; after: number[];
      connected: boolean[]; cleaned: { id: number; phase: string }[]; binds: Observed[]; frozen: boolean[];
      unhandled: string[]; clones: number; clicks: number; fault?: Fault;
      actions: { before?: (context: GridRowBinding<Item>) => unknown;
        after?: (context: GridRowBinding<Item>) => unknown; bind?: (result: GridBindResult) => unknown };
      reset(count?: number, extra?: Partial<Options>): void;
      item(index: number): Item; ids(): number[]; block(id: number): HTMLTableRowElement[];
      field<E extends HTMLElement = HTMLElement>(id: number, name: string): E | null;
      task(delay?: number): Promise<void>; settle(): Promise<void>;
      secondary?: { grid: GridHandle<Item>; rows: Rows<Item>; table: HTMLTableElement; original: string; host: HTMLElement };
      other(count?: number): void;
    };
  }
}

const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts") };
const markup = `<caption>Progressive employee records</caption><colgroup span="4"></colgroup>
  <thead><tr><th scope="col" data-column="key">Identity</th><th scope="col" data-column="name">Name</th>
    <th scope="col" data-column="choice">Settings</th><th scope="col" data-column="summary">Summary</th></tr></thead>
  <tbody data-row-template><tr data-progress-main><th scope="row" data-column="key" rowspan="2">
    <span data-field="key"></span><button type="button" data-select-row>Select record</button>
    <label><input type="checkbox" data-check-row>Check record</label></th>
    <td data-column="name"><label>Name <input data-field="profile.name" required minlength="3"></label>
      <output data-error-for="profile.name"></output></td>
    <td data-column="choice"><label>Choice <select data-field="chosen" data-options="choices"
      data-option-label="label" data-option-value="value"></select></label></td>
    <td data-column="summary" rowspan="2"><span data-field="summary"><em>Authored summary</em></span></td></tr>
    <tr data-progress-detail><td data-column="name"><label>Note <textarea data-field="profile.note"></textarea></label></td>
      <td data-column="choice"><label><input type="radio" name="progress-mode" data-field="mode" value="office">Office</label>
        <label><input type="radio" name="progress-mode" data-field="mode" value="remote">Remote</label>
        <label><input type="checkbox" data-field="channels" value="email">Email</label>
        <label><input type="checkbox" data-field="channels" value="sms">SMS</label></td></tr></tbody>`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, markup }) => {
    const [{ bindGrid }, { createRows }] = await Promise.all([import(modules.grid), import(modules.data)]);
    const host = document.createElement("section"); host.dataset.progressFixture = "";
    host.innerHTML = '<h2>Cooperative record binding</h2><div role="region" aria-label="Progressive records" tabindex="0" data-progress-scroll style="height:240px;width:900px;overflow:auto"><table aria-busy="false"></table></div>';
    const style = document.createElement("style");
    style.textContent = '[data-progress-fixture]{font:14px/20px sans-serif}[data-progress-fixture] table{width:880px;table-layout:fixed;border-collapse:collapse}[data-progress-fixture] th,[data-progress-fixture] td{padding:2px;vertical-align:top}[data-progress-fixture] label{display:block}[data-progress-fixture] input:not([type=radio]):not([type=checkbox]),[data-progress-fixture] select,[data-progress-fixture] textarea{max-width:145px}[data-progress-fixture] output:empty{display:none}';
    host.append(style); document.body.append(host);
    const root = host.querySelector<HTMLElement>("[data-progress-scroll]")!, table = host.querySelector<HTMLTableElement>("table")!;
    const h: Window["progressiveFixture"] = {
      grid: undefined as unknown as GridHandle<Item>, rows: undefined as unknown as Rows<Item>,
      host, root, table, markup, original: "", options: undefined as unknown as Options,
      before: [], after: [], connected: [], cleaned: [], binds: [], frozen: [], unhandled: [], clones: 0, clicks: 0, actions: {},
      item(index) { return { key: index, group: index % 2 ? "Odd" : "Even", profile: { name: `Record ${index}`, note: `Note ${index}` },
        mode: "office", channels: ["email"], chosen: 1, choices: [{ label: "One", value: 1 }, { label: "Two", value: 2 }], summary: `Summary ${index}` }; },
      ids() { return [...table.querySelectorAll<HTMLTableRowElement>("tbody tr[data-progress-main][data-progress-row]")]
        .map(row => Number(row.dataset.progressRow)); },
      block(id) { return [...table.querySelectorAll<HTMLTableRowElement>(`tr[data-progress-row="${id}"]`)]; },
      field<E extends HTMLElement = HTMLElement>(id: number, name: string): E | null {
        const field = h.block(id).flatMap(row => [...row.querySelectorAll<HTMLElement>("[data-field]")])
          .find(element => element.getAttribute("data-field") === name);
        return field ? field as E : null;
      },
      task: (delay = 0) => new Promise(resolve => window.setTimeout(resolve, delay)),
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))),
      reset(count = 7, extra = {}) {
        h.grid?.dispose(); h.rows?.dispose();
        h.secondary?.grid.dispose(); h.secondary?.rows.dispose(); h.secondary?.host.remove(); delete h.secondary;
        table.innerHTML = markup; table.setAttribute("aria-busy", "false"); root.scrollTop = 0;
        h.original = table.outerHTML; h.before = []; h.after = []; h.connected = []; h.cleaned = []; h.binds = [];
        h.frozen = []; h.unhandled = []; h.clones = 0; h.clicks = 0; h.actions = {}; delete h.fault;
        h.rows = createRows(Array.from({ length: count }, (_, index) => h.item(index + 1)));
        const fault = (phase: Fault["phase"], id?: number) => {
          if (h.fault?.phase !== phase || h.fault.id !== undefined && h.fault.id !== id) return;
          if (h.fault.once) delete h.fault;
          throw new Error(`Injected ${phase} failure ${id ?? ""}`);
        };
        h.options = { ...extra, rows: h.rows, multiple: true, paste: true,
          render: { summary(value, context) { fault("field", context.rowId ?? undefined); return String(value ?? ""); } },
          beforeRowBind(context) {
            h.before.push(context.row.id); h.connected.push(context.elements.every(element => element.isConnected));
            for (const element of context.elements) element.dataset.progressRow = String(context.row.id);
            context.own(() => { h.cleaned.push({ id: context.row.id, phase: "before" });
              for (const element of context.elements) delete element.dataset.progressRow; });
            fault("before", context.row.id); return h.actions.before?.(context);
          },
          onRowBind(context) {
            const button = context.elements[0].querySelector("button")!;
            const click = () => h.clicks++; button.addEventListener("click", click);
            context.own(() => { button.removeEventListener("click", click); h.cleaned.push({ id: context.row.id, phase: "after" }); });
            fault("after", context.row.id); h.after.push(context.row.id); return h.actions.after?.(context);
          },
          onBind(result) { h.binds.push({ ...result, event: result.event?.type ?? null }); h.frozen.push(Object.isFrozen(result));
            fault("bind"); return h.actions.bind?.(result); }
        };
        h.grid = bindGrid(table, h.options);
      },
      other(count = 3) {
        const otherHost = document.createElement("section"); otherHost.innerHTML = '<h3>Independent progressive records</h3><table></table>';
        host.append(otherHost); const otherTable = otherHost.querySelector("table")!; otherTable.innerHTML = markup;
        const original = otherTable.outerHTML, rows = createRows(Array.from({ length: count }, (_, index) => h.item(index + 1)));
        const grid = bindGrid(otherTable, { rows, progressive: { size: 2, delay: 10 } });
        h.secondary = { host: otherHost, table: otherTable, rows, grid, original };
      }
    };
    const clone = HTMLTableRowElement.prototype.cloneNode;
    HTMLTableRowElement.prototype.cloneNode = function (deep) {
      if (this.hasAttribute("data-progress-main") || this.hasAttribute("data-progress-detail")) h.clones++;
      return clone.call(this, deep);
    };
    window.addEventListener("unhandledrejection", event => h.unhandled.push(String(event.reason)));
    window.progressiveFixture = h; h.reset(0);
  }, { modules, markup });
});

test("default binding has one frozen eight-field completion and exhausted calls do not repeat it", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(4);
    const pending = h.grid.whenBound(), same = pending === h.grid.whenBound();
    const bound = await pending; const more = await h.grid.renderMore();
    return { same, bound, more, keys: Object.keys(bound).sort(), ids: h.ids(), binds: h.binds.length,
      frozen: Object.isFrozen(bound) && Object.isFrozen(more) && h.frozen.every(Boolean), busy: h.table.getAttribute("aria-busy") };
  });
  expect(result.keys).toEqual(["available", "event", "filtered", "first", "last", "mounted", "total", "visible"]);
  expect(result.bound).toEqual({ total: 4, filtered: 4, visible: 4, mounted: 4, available: 4, first: true, last: true, event: null });
  expect(result.more).toEqual(result.bound); expect(result.same && result.frozen).toBe(true);
  expect(result.ids).toEqual([1, 2, 3, 4]); expect(result.binds).toBe(1); expect(result.busy).toBe("false");
});

test("empty single exact and remainder boundaries count logical chunks and first last flags", async ({ page }) => {
  const results = await page.evaluate(async () => {
    const h = window.progressiveFixture, results = [];
    for (const [count, size] of [[0, 3], [1, 3], [3, 3], [4, 3], [250, 100]]) {
      h.reset(count, { progressive: { size } });
      let bound = await h.grid.whenBound();
      while (!bound.last) bound = await h.grid.renderMore();
      const before = h.binds.length; await h.grid.renderMore();
      results.push({ count, boundaries: h.binds.map(result => [result.available, result.first, result.last]),
        all: h.ids().length, unique: new Set(h.ids()).size, quiet: before === h.binds.length });
    }
    return results;
  });
  expect(results.map(result => result.boundaries)).toEqual([
    [[0, true, true]], [[1, true, true]], [[3, true, true]], [[3, true, false], [4, false, true]],
    [[100, true, false], [200, false, false], [250, false, true]]
  ]);
  for (const result of results) { expect(result.all).toBe(result.count); expect(result.unique).toBe(result.count); expect(result.quiet).toBe(true); }
});

test("two physical rows stay one scheduled record with full logical page ARIA positions", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(4, { progressive: { size: 2, delay: 20 } });
    const immediate = { ids: h.ids(), physical: h.block(1).length, busy: h.table.getAttribute("aria-busy") };
    await h.grid.whenBound();
    return { immediate, bound: h.binds[0], ids: h.ids(), connected: h.connected,
      rows: h.table.getAttribute("aria-rowcount"), indices: h.ids().flatMap(id => h.block(id).map(row => row.getAttribute("aria-rowindex"))) };
  });
  expect(result.immediate).toEqual({ ids: [1], physical: 2, busy: "true" });
  expect(result.bound).toMatchObject({ total: 4, visible: 4, available: 2, mounted: 2, first: true, last: false });
  expect(result.ids).toEqual([1, 2]); expect(result.connected.every(Boolean)).toBe(true);
  expect(result.rows).toBe("9"); expect(result.indices).toEqual(["2", "3", "4", "5"]);
});

test("positive delay yields to another Window task while prepared rows remain usable", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(5, { progressive: { size: 3, delay: 20 } });
    const first = h.after.slice(); let ping = false;
    const host = h.task().then(() => { ping = true; h.block(1)[0].querySelector<HTMLButtonElement>("button")!.click(); });
    await host; const during = { ping, after: h.after.slice(), clicks: h.clicks };
    const result = await h.grid.whenBound();
    return { first, during, result, busy: h.table.getAttribute("aria-busy"), after: h.after };
  });
  expect(result.first).toEqual([1]); expect(result.during).toEqual({ ping: true, after: [1], clicks: 1 });
  expect(result.result).toMatchObject({ available: 3, last: false }); expect(result.after).toEqual([1, 2, 3]);
  expect(result.busy).toBe("false");
});

test("renderMore shares its pending Promise and advances only one target", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(8, { progressive: { size: 3, delay: 10 } });
    const initial = h.grid.whenBound(), initialSame = h.grid.renderMore() === initial;
    await initial; const first = h.grid.renderMore(), second = h.grid.renderMore();
    const same = first === second && first === h.grid.whenBound();
    const result = await first;
    return { initialSame, same, result, ids: h.ids(), after: h.after, callbacks: h.binds.map(result => result.available) };
  });
  expect(result.initialSame && result.same).toBe(true); expect(result.result.available).toBe(6);
  expect(result.ids).toEqual([1, 2, 3, 4, 5, 6]); expect(result.after).toEqual(result.ids); expect(result.callbacks).toEqual([3, 6]);
});

test("size one continuation still gives a queued Window task a turn", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(3, { progressive: { size: 1 } }); await h.grid.whenBound();
    const order: string[] = []; void h.task().then(() => order.push("host"));
    const next = h.grid.renderMore(); const immediate = h.ids(); await next; order.push("bound");
    return { order, immediate, ids: h.ids(), callbacks: h.binds.map(result => [result.available, result.first, result.last]) };
  });
  expect(result.immediate).toEqual([1]); expect(result.order).toEqual(["host", "bound"]); expect(result.ids).toEqual([1, 2]);
  expect(result.callbacks).toEqual([[1, true, false], [2, false, false]]);
});

test("canceling the initial operation rejects it and resumes its unfinished target", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(7, { progressive: { size: 3, delay: 20 } });
    const old = h.grid.whenBound().then(() => "resolved", error => error.name);
    const canceled = h.grid.cancelBinding(); const ready = h.ids(); await h.task(30);
    const quiet = h.ids(); const resumed = await h.grid.renderMore();
    return { error: await old, canceled, ready, quiet, resumed, after: h.after, callbacks: h.binds.map(result => result.available),
      frozen: Object.isFrozen(canceled), busy: h.table.getAttribute("aria-busy"), unhandled: h.unhandled };
  });
  expect(result.error).toBe("AbortError"); expect(result.canceled.last).toBe(false); expect(result.frozen).toBe(true);
  expect(result.ready).toEqual([1]); expect(result.quiet).toEqual(result.ready); expect(result.resumed.available).toBe(3);
  expect(result.after).toEqual([1, 2, 3]); expect(result.callbacks).toEqual([3]); expect(result.busy).toBe("false"); expect(result.unhandled).toEqual([]);
});

test("canceling a continuation retains completed work and does not skip its remaining target", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(8, { progressive: { size: 3, delay: 10 } }); await h.grid.whenBound();
    const old = h.grid.renderMore().then(() => "resolved", error => error.name); await h.task();
    const canceled = h.grid.cancelBinding(), ids = h.ids();
    const resumed = await h.grid.renderMore();
    return { error: await old, canceled, ids, resumed, after: h.after, callbacks: h.binds.map(result => result.available) };
  });
  expect(result.error).toBe("AbortError"); expect(result.canceled.last).toBe(false);
  expect(result.ids.slice(0, 3)).toEqual([1, 2, 3]); expect(result.resumed.available).toBe(6);
  expect(result.after).toEqual([1, 2, 3, 4, 5, 6]); expect(result.callbacks).toEqual([3, 6]);
});

test("unobserved cancellation is handled internally and repeated cancel stays quiet", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(5, { progressive: { size: 3, delay: 10 } });
    const first = h.grid.cancelBinding(), second = h.grid.cancelBinding(); await h.task(25);
    return { first, second, ids: h.ids(), callbacks: h.binds, unhandled: h.unhandled, busy: h.table.getAttribute("aria-busy") };
  });
  expect(result.first).toEqual(result.second); expect(result.ids).toEqual([1]); expect(result.callbacks).toEqual([]);
  expect(result.unhandled).toEqual([]); expect(result.busy).toBe("false");
});

test("refresh supersedes pending work and starts a fresh first chunk", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(7, { progressive: { size: 3, delay: 10 } });
    const old = h.grid.whenBound().then(() => "resolved", error => error.name);
    h.grid.refresh(); const current = await h.grid.whenBound(); await h.task(20);
    return { error: await old, current, ids: h.ids(), callbacks: h.binds.map(result => [result.available, result.first, result.last]) };
  });
  expect(result.error).toBe("AbortError"); expect(result.current).toMatchObject({ available: 3, first: true, last: false });
  expect(result.ids).toEqual([1, 2, 3]); expect(result.callbacks).toEqual([[3, true, false]]);
});

test("Rows replacement cannot leave old IDs or late completion in the new prefix", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(7, { progressive: { size: 3, delay: 10 } });
    const old = h.grid.whenBound().then(() => "resolved", error => error.name);
    h.rows.replace([h.item(11), h.item(12), h.item(13), h.item(14)]);
    const current = await h.grid.whenBound(); await h.task(20);
    return { error: await old, current: { ...current, event: current.event?.type }, ids: h.ids(),
      keys: h.ids().map(id => h.rows.get(id)!.value.key), callbacks: h.binds.map(result => result.event), after: h.after };
  });
  expect(result.error).toBe("AbortError"); expect(result.current).toMatchObject({ total: 4, available: 3, first: true, last: false, event: "replace" });
  expect(result.ids.every(id => id > 7)).toBe(true); expect(result.keys).toEqual([11, 12, 13]); expect(result.callbacks).toEqual(["replace"]);
});

test("explicit sort filter page and status requests reset first completion against the new scope", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(6, { progressive: { size: 2 } }); await h.grid.whenBound();
    h.grid.setSort((a, b) => b.key - a.key); const sorted = await h.grid.whenBound(), sortedIds = h.ids();
    h.grid.setFilter(row => row.key < 5); const filtered = await h.grid.whenBound(), filteredIds = h.ids();
    h.grid.setPage({ page: 2, size: 2 }); const paged = await h.grid.whenBound(), pageIds = h.ids();
    h.grid.setStatusFilter([]); const empty = await h.grid.whenBound();
    return { sorted, sortedIds, filtered, filteredIds, paged, pageIds, empty, ids: h.ids() };
  });
  expect(result.sorted).toMatchObject({ available: 2, visible: 6, first: true, last: false }); expect(result.sortedIds).toEqual([6, 5]);
  expect(result.filtered).toMatchObject({ available: 2, visible: 4, first: true }); expect(result.filteredIds).toEqual([4, 3]);
  expect(result.paged).toMatchObject({ available: 2, visible: 2, first: true, last: true }); expect(result.pageIds).toEqual([2, 1]);
  expect(result.empty).toMatchObject({ available: 0, visible: 0, mounted: 0, first: true, last: true }); expect(result.ids).toEqual([]);
});

test("ordinary data mutations cancel queued work without emitting full bind completion", async ({ page }) => {
  const results = await page.evaluate(async () => {
    const h = window.progressiveFixture, results = [];
    for (const kind of ["set", "setMany", "add", "remove", "move", "revert"] as const) {
      h.reset(6, { progressive: { size: 3 } }); await h.grid.whenBound();
      if (kind === "revert") h.rows.set(1, "profile", { name: "Before revert", note: "Note 1" });
      const count = h.binds.length, old = h.grid.renderMore().then(() => "resolved", error => error.name);
      if (kind === "set") h.rows.set(1, "profile", { name: "Changed", note: "Note 1" });
      else if (kind === "setMany") h.rows.setMany([{ id: 1, values: { summary: "Batch changed" } }]);
      else if (kind === "add") h.rows.add(h.item(7), 1);
      else if (kind === "remove") h.rows.remove(1);
      else if (kind === "move") h.rows.move(6, 1);
      else h.rows.revert(1);
      const suppressed = h.binds.length === count;
      let final = await h.grid.renderMore(); while (!final.last) final = await h.grid.renderMore();
      results.push({ kind, error: await old, suppressed, ids: h.ids(), expected: h.rows.entries().map(row => row.id), unique: new Set(h.ids()).size });
    }
    return results;
  });
  for (const result of results) { expect(result.error, result.kind).toBe("AbortError"); expect(result.suppressed, result.kind).toBe(true);
    expect(result.ids, result.kind).toEqual(result.expected); expect(result.unique, result.kind).toBe(result.ids.length); }
});

test("append during an unfinished prefix preserves old tail records without duplicate binding", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(7, { progressive: { size: 3, delay: 5 } });
    const first = h.rows.get(1), original = h.rows.original(1), old = h.grid.whenBound().then(() => "resolved", error => error.name);
    const added = h.rows.append([h.item(8), h.item(9)]); let final = await h.grid.whenBound();
    const firstResult = { ...final, event: final.event?.type };
    while (!final.last) final = await h.grid.renderMore();
    return { error: await old, added, firstResult, ids: h.ids(), after: h.after, original: h.rows.original(1) === original,
      snapshot: h.rows.get(1) === first, changes: h.rows.changes(), final, callbacks: h.binds.map(result => result.available) };
  });
  expect(result.error).toBe("AbortError"); expect(result.firstResult).toMatchObject({ available: 3, first: true, last: false, event: "append" });
  expect(result.ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]); expect(result.after).toEqual(result.ids);
  expect(result.snapshot && result.original).toBe(true); expect(result.changes).toEqual([]); expect(result.callbacks).toEqual([3, 6, 9]);
});

test("append advances one chunk from a complete target and preserves fully admitted rows", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(5, { progressive: { size: 2 } }); await h.grid.whenBound();
    h.rows.append([h.item(6), h.item(7)]); const partial = await h.grid.whenBound(), partialIds = h.ids();
    let last = partial; while (!last.last) last = await h.grid.renderMore();
    const ready = h.ids(); h.rows.append([h.item(8), h.item(9), h.item(10)]);
    const tail = await h.grid.whenBound();
    return { partial, partialIds, ready, tail, ids: h.ids(), after: h.after };
  });
  expect(result.partial).toMatchObject({ available: 4, first: false, last: false }); expect(result.partialIds).toEqual([1, 2, 3, 4]);
  expect(result.ready).toEqual([1, 2, 3, 4, 5, 6, 7]); expect(result.tail).toMatchObject({ available: 9, first: false, last: false });
  expect(result.ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]); expect(result.after).toEqual(result.ids);
});

test("empty append and exhausted requests retain cached completion without another callback", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(2, { progressive: { size: 3 } }); await h.grid.whenBound();
    const before = h.binds.length, pending = h.grid.whenBound(); h.rows.append([]);
    const same = pending === h.grid.whenBound(); await h.grid.renderMore(); await h.grid.renderMore();
    return { same, before, after: h.binds.length, ids: h.ids(), last: await h.grid.whenBound() };
  });
  expect(result.same).toBe(true); expect(result.after).toBe(result.before); expect(result.ids).toEqual([1, 2]); expect(result.last.last).toBe(true);
});

test("explicit reveal synchronously admits its full-page target and supersedes delayed work", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(8, { progressive: { size: 3, delay: 20 } });
    const old = h.grid.whenBound().then(() => "resolved", error => error.name);
    const input = h.field<HTMLInputElement>(1, "profile.name")!; input.focus(); input.setSelectionRange(2, 4);
    h.grid.reveal(6, { block: "center" }); const immediate = h.ids(), current = await h.grid.whenBound();
    const focus = document.activeElement === input, caret = [input.selectionStart, input.selectionEnd];
    const notifications = h.binds.map(result => [result.available, result.first, result.last]);
    await h.task(30); const stable = h.ids();
    const next = await h.grid.renderMore();
    return { error: await old, immediate, current, focus, caret, notifications, stable, next };
  });
  expect(result.error).toBe("AbortError"); expect(result.immediate).toEqual([1, 2, 3, 4, 5, 6]); expect(result.stable).toEqual(result.immediate);
  expect(result.current).toMatchObject({ available: 6, first: true, last: false }); expect(result.notifications).toEqual([[6, true, false]]);
  expect(result.focus).toBe(true); expect(result.caret).toEqual([2, 4]); expect(result.next).toMatchObject({ available: 8, first: false, last: true });
});

test("full logical-page selection checks paste and validation still include unadmitted IDs", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(8, { progressive: { size: 2 } }); await h.grid.whenBound();
    h.grid.setSelected([7]); h.grid.setChecked([8]);
    const pasted = h.grid.paste("Later valid value", { id: 7, field: "profile.name" });
    h.rows.set(8, "profile", { name: "", note: "Note 8" }); const validation = h.grid.validate(8);
    return { selected: h.grid.selectedIds(), checked: h.grid.checkedIds(), all: h.grid.rowIds("visible"),
      value: h.rows.get(7)!.value.profile.name, pasted: pasted.valid,
      issues: validation.issues.map(issue => ({ id: issue.rowId, field: issue.field, connected: !!issue.element?.isConnected })) };
  });
  expect(result.selected).toEqual([7]); expect(result.checked).toEqual([8]); expect(result.all).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(result.value).toBe("Later valid value"); expect(result.pasted).toBe(true);
  expect(result.issues).toContainEqual({ id: 8, field: "profile.name", connected: false });
});

test("first-invalid reveal uses the same synchronous admission bridge", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(8, { progressive: { size: 2 }, revealInvalid: true }); await h.grid.whenBound();
    h.rows.set(7, "profile", { name: "", note: "Note 7" });
    const invalid = h.grid.validate(7), field = h.field<HTMLInputElement>(7, "profile.name");
    return { valid: invalid.valid, present: !!field?.isConnected, focus: document.activeElement === field,
      available: (await h.grid.whenBound()).available, issueConnected: invalid.issues.some(issue => issue.element === field) };
  });
  expect(result).toEqual({ valid: false, present: true, focus: true, available: 7, issueConnected: true });
});

test("validation reveal disposal retains issues without returning released element references", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(3, { progressive: { size: 1 }, revealInvalid: true });
    h.rows.setMany([1, 3].map(id => ({ id, values: { profile: { name: "", note: `Note ${id}` } } })));
    h.grid.setSort((left, right) => right.key - left.key);
    const prefix = h.ids(), message = h.field<HTMLInputElement>(3, "profile.name")!.validationMessage;
    h.root.focus(); const focused = document.activeElement;
    const changes: MutationRecord[] = [], observer = new MutationObserver(records => changes.push(...records));
    let completion: Promise<string> = Promise.resolve("missing"), callbackRestored = false;
    h.actions.bind = () => {
      completion = h.grid.whenBound().then(() => "resolved", error => error.name);
      h.grid.dispose(); callbackRestored = h.table.outerHTML === h.original;
      observer.observe(h.table, { subtree: true, childList: true, attributes: true, characterData: true });
    };
    const invalid = h.grid.validate(), immediate = h.table.outerHTML === h.original, callbacks = h.binds.length;
    const issues = invalid.issues.map(issue => ({ id: issue.rowId, field: issue.field, rule: issue.rule, message: issue.message }));
    const references = invalid.issues.filter(issue => issue.element !== undefined).length;
    h.rows.set(2, "summary", "Late validation-disposal value"); await h.task(25); observer.disconnect();
    return { prefix, valid: invalid.valid, issues, message, references, error: await completion,
      callbackRestored, immediate, quiet: h.table.outerHTML === h.original && h.binds.length === callbacks,
      focus: document.activeElement === focused && focused === h.root, mutations: changes.length, unhandled: h.unhandled };
  });
  expect(result.prefix).toEqual([3]); expect(result.valid).toBe(false); expect(result.message).toMatch(/\S/);
  expect(result.issues).toEqual([1, 3].map(id => ({ id, field: "profile.name", rule: "html", message: result.message })));
  expect(result.references).toBe(0); expect(result.error).toBe("AbortError");
  expect(result.callbackRestored && result.immediate && result.quiet && result.focus).toBe(true);
  expect(result.mutations).toBe(0); expect(result.unhandled).toEqual([]);
});

test("a focused invalid draft and typed choices survive a sorted prefix reset", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(6, { progressive: { size: 2 } }); await h.grid.whenBound();
    const choice = h.field<HTMLSelectElement>(1, "chosen")!; choice.value = "2";
    choice.dispatchEvent(new Event("change", { bubbles: true }));
    h.block(1)[1].querySelector<HTMLInputElement>('[data-field="mode"][value="remote"]')!.click();
    h.block(1)[1].querySelector<HTMLInputElement>('[data-field="channels"][value="sms"]')!.click();
    const name = h.field<HTMLInputElement>(2, "profile.name")!; name.focus(); name.value = "x";
    name.dispatchEvent(new Event("input", { bubbles: true })); name.setSelectionRange(1, 1);
    h.grid.setSort((a, b) => b.key - a.key); const current = await h.grid.whenBound();
    const preserved = { current, same: h.field(2, "profile.name") === name, focus: document.activeElement === name,
      entered: name.value, caret: [name.selectionStart, name.selectionEnd], raw: h.rows.get(2)!.value.profile.name,
      choice: h.field<HTMLSelectElement>(2, "chosen")!.value, ids: h.ids() };
    await h.grid.renderMore();
    return { ...preserved, edited: { chosen: h.rows.get(1)!.value.chosen, mode: h.rows.get(1)!.value.mode,
      channels: h.rows.get(1)!.value.channels, displayed: h.field<HTMLSelectElement>(1, "chosen")!.value,
      checked: [...h.block(1)[1].querySelectorAll<HTMLInputElement>('input:checked')].map(input => input.value) } };
  });
  expect(result.same && result.focus).toBe(true); expect(result.entered).toBe("x"); expect(result.caret).toEqual([1, 1]);
  expect(result.raw).toBe("Record 2"); expect(result.choice).toBe("1"); expect(result.current.available).toBeGreaterThanOrEqual(5);
  expect(result.ids).toContain(2);
  expect(result.edited).toEqual({ chosen: 2, mode: "remote", channels: ["email", "sms"], displayed: "2", checked: ["remote", "email", "sms"] });
});

test("a committed column layout cancels pending work and continuation uses the retained state", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(7, { progressive: { size: 3, delay: 10 } });
    const old = h.grid.whenBound().then(() => "resolved", error => error.name);
    const next = h.grid.columns().map(column => ({ ...column, width: 160, hidden: column.key === "name" }));
    h.grid.setColumns(next); const committed = h.grid.columns();
    const resumed = await h.grid.renderMore();
    return { error: await old, committed, retained: h.grid.columns() === committed, resumed,
      hidden: h.block(1).flatMap(row => [...row.cells]).filter(cell => cell.dataset.column === "name")
        .every(cell => cell.hidden || getComputedStyle(cell).display === "none") };
  });
  expect(result.error).toBe("AbortError"); expect(result.retained && result.hidden).toBe(true);
  expect(result.committed.find(column => column.key === "name")).toMatchObject({ hidden: true, width: 160 });
  expect(result.resumed.available).toBe(3);
});

test("before-hook failure keeps earlier ready records and releases the failing row for retry", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(7, { progressive: { size: 4, delay: 10 } });
    h.fault = { phase: "before", id: 3, once: true };
    const error = await h.grid.whenBound().then(() => null, error => ({ code: error.code, id: error.detail?.id }));
    const beforeRetry = { ids: h.ids(), after: h.after.slice(), callbacks: h.binds.length,
      cleaned: h.cleaned.filter(entry => entry.id === 3), busy: h.table.getAttribute("aria-busy") };
    const retried = await h.grid.renderMore();
    return { error, beforeRetry, retried, ids: h.ids(), after: h.after, unhandled: h.unhandled };
  });
  expect(result.error).toMatchObject({ code: "GRID_BIND", id: 3 });
  expect(result.beforeRetry).toEqual({ ids: [1, 2], after: [1, 2], callbacks: 0,
    cleaned: [{ id: 3, phase: "before" }], busy: "false" });
  expect(result.retried).toMatchObject({ available: 4, first: true, last: false });
  expect(result.ids).toEqual([1, 2, 3, 4]); expect(result.after).toEqual(result.ids); expect(result.unhandled).toEqual([]);
});

test("field failure is observable without losing earlier bindings or leaking Select ownership", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(5, { progressive: { size: 3, delay: 10 } });
    h.fault = { phase: "field", id: 2, once: true };
    const error = await h.grid.whenBound().then(() => null, error => ({ code: error.code, api: error.api }));
    const ready = h.ids(); const clean = h.cleaned.filter(entry => entry.id === 2).map(entry => entry.phase);
    const retried = await h.grid.renderMore();
    return { error, ready, clean, retried, ids: h.ids(), after: h.after,
      choices: h.ids().map(id => h.field<HTMLSelectElement>(id, "chosen")!.value), unhandled: h.unhandled };
  });
  expect(result.error?.api).toBe("bindGrid"); expect(result.error?.code).toBeTruthy();
  expect(result.ready).toEqual([1]); expect(result.clean).toEqual(["before"]);
  expect(result.retried.available).toBe(3); expect(result.ids).toEqual([1, 2, 3]); expect(result.after).toEqual(result.ids);
  expect(result.choices).toEqual(["1", "1", "1"]); expect(result.unhandled).toEqual([]);
});

test("after-hook failure releases resources in reverse order and retries one uncommitted record", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(5, { progressive: { size: 3, delay: 10 } });
    h.fault = { phase: "after", id: 2, once: true };
    const error = await h.grid.whenBound().then(() => null, error => error.code);
    const ready = h.ids(), cleaned = h.cleaned.filter(entry => entry.id === 2).map(entry => entry.phase);
    await h.grid.renderMore();
    const beforeClick = h.clicks; h.block(2)[0].querySelector<HTMLButtonElement>("button")!.click();
    return { error, ready, cleaned, after: h.after, once: h.clicks === beforeClick + 1, unhandled: h.unhandled };
  });
  expect(result.error).toBe("GRID_BIND"); expect(result.ready).toEqual([1]); expect(result.cleaned).toEqual(["after", "before"]);
  expect(result.after).toEqual([1, 2, 3]); expect(result.once).toBe(true); expect(result.unhandled).toEqual([]);
});

test("onBind failure keeps committed DOM and the next request does not redeliver that completion", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(5, { progressive: { size: 2, delay: 10 } });
    h.fault = { phase: "bind", once: true };
    const error = await h.grid.whenBound().then(() => null, error => ({ code: error.code, phase: error.detail?.phase }));
    const ready = h.ids(); const next = await h.grid.renderMore();
    return { error, ready, next, ids: h.ids(), after: h.after, callbacks: h.binds.map(result => result.available), unhandled: h.unhandled };
  });
  expect(result.error).toEqual({ code: "GRID_BIND", phase: "onBind" }); expect(result.ready).toEqual([1, 2]);
  expect(result.next).toMatchObject({ available: 4, first: false, last: false }); expect(result.ids).toEqual([1, 2, 3, 4]);
  expect(result.after).toEqual(result.ids); expect(result.callbacks).toEqual([2, 4]); expect(result.unhandled).toEqual([]);
});

test("a completion callback starting another view aborts the old observer without stale completion", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(6, { progressive: { size: 2, delay: 10 } });
    let once = true;
    h.actions.bind = () => { if (once) { once = false; h.grid.setFilter(row => row.key % 2 === 0); } };
    const old = h.grid.whenBound().then(() => "resolved", error => error.name);
    await old; const current = await h.grid.whenBound(); await h.task(20);
    return { old: await old, current, ids: h.ids(), calls: h.binds.map(result => ({ visible: result.visible,
      available: result.available, first: result.first, last: result.last })), unhandled: h.unhandled };
  });
  expect(result.old).toBe("AbortError"); expect(result.current).toMatchObject({ visible: 3, available: 2, first: true, last: false });
  expect(result.ids).toEqual([2, 4]); expect(result.calls).toEqual([
    { visible: 6, available: 2, first: true, last: false }, { visible: 3, available: 2, first: true, last: false }
  ]); expect(result.unhandled).toEqual([]);
});

test("disposal during completion settles the observer and restores authored ownership exactly", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(5, { progressive: { size: 2, delay: 10 } });
    h.actions.bind = () => h.grid.dispose();
    const error = await h.grid.whenBound().then(() => "resolved", error => error.name);
    const original = h.table.outerHTML === h.original, callbacks = h.binds.length;
    const changes: MutationRecord[] = [], observer = new MutationObserver(records => changes.push(...records));
    observer.observe(h.table, { subtree: true, childList: true, attributes: true, characterData: true });
    h.rows.set(1, "summary", "Late value"); h.table.dispatchEvent(new Event("scroll")); await h.task(25);
    observer.disconnect();
    return { error, original, quiet: h.table.outerHTML === h.original, mutations: changes.length,
      callbacks, afterCallbacks: h.binds.length, busy: h.table.getAttribute("aria-busy"), unhandled: h.unhandled };
  });
  expect(result.error).toBe("AbortError"); expect(result.original && result.quiet).toBe(true);
  expect(result.mutations).toBe(0); expect(result.callbacks).toBe(1); expect(result.afterCallbacks).toBe(1);
  expect(result.busy).toBe("false"); expect(result.unhandled).toEqual([]);
});

test("synchronous size-one completion cannot write after its callback disposes the Grid", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(3, { progressive: { size: 1 } });
    const authored = { busy: h.table.getAttribute("aria-busy"), rows: null, changed: null };
    let completion: Promise<string> = Promise.resolve("missing"), callbackRestored = false;
    let lateClick = () => {};
    const changes: MutationRecord[] = [], observer = new MutationObserver(records => changes.push(...records));
    h.actions.bind = () => {
      completion = h.grid.whenBound().then(() => "resolved", error => error.name);
      const button = h.block(1)[0].querySelector<HTMLButtonElement>("button"); lateClick = () => button?.click();
      h.grid.dispose(); callbackRestored = h.table.outerHTML === h.original;
      observer.observe(h.table, { subtree: true, childList: true, attributes: true, characterData: true });
    };
    h.grid.refresh();
    const immediate = h.table.outerHTML === h.original, callbacks = h.binds.length, clicks = h.clicks;
    const attrs = { busy: h.table.getAttribute("aria-busy"), rows: h.table.getAttribute("aria-rowcount"),
      changed: h.table.getAttribute("data-changed") };
    h.rows.set(1, "summary", "Late synchronous-disposal value");
    lateClick(); h.root.dispatchEvent(new Event("scroll")); await h.task(25);
    observer.disconnect();
    return { error: await completion, callbackRestored, immediate, attrs, authored,
      quiet: h.table.outerHTML === h.original && h.clicks === clicks && h.binds.length === callbacks,
      mutations: changes.length, callbacks, bindings: h.after.length,
      releasedBefore: h.cleaned.filter(entry => entry.phase === "before").length,
      releasedAfter: h.cleaned.filter(entry => entry.phase === "after").length, unhandled: h.unhandled };
  });
  expect(result.error).toBe("AbortError"); expect(result.callbackRestored && result.immediate && result.quiet).toBe(true);
  expect(result.attrs).toEqual(result.authored); expect(result.mutations).toBe(0); expect(result.callbacks).toBe(2);
  expect(result.bindings).toBe(2); expect(result.releasedBefore).toBe(2); expect(result.releasedAfter).toBe(2);
  expect(result.unhandled).toEqual([]);
});

test("synchronous sort completion cannot restore a sort attribute after its callback disposes the Grid", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(3, { progressive: { size: 1 } });
    const header = h.table.querySelector<HTMLTableCellElement>('thead th[data-column="key"]')!;
    let completion: Promise<string> = Promise.resolve("missing"), callbackRestored = false;
    const changes: MutationRecord[] = [], observer = new MutationObserver(records => changes.push(...records));
    h.actions.bind = () => {
      completion = h.grid.whenBound().then(() => "resolved", error => error.name);
      h.grid.dispose(); callbackRestored = h.table.outerHTML === h.original;
      observer.observe(h.table, { subtree: true, childList: true, attributes: true, characterData: true });
    };
    h.grid.setSort((left, right) => right.key - left.key, { column: header, direction: "descending" });
    const immediate = h.table.outerHTML === h.original, callbacks = h.binds.length;
    h.rows.set(1, "summary", "Late sorted-disposal value"); await h.task(25); observer.disconnect();
    return { error: await completion, callbackRestored, immediate, quiet: h.table.outerHTML === h.original,
      sort: header.getAttribute("aria-sort"), rowcount: h.table.getAttribute("aria-rowcount"),
      busy: h.table.getAttribute("aria-busy"), changed: h.table.getAttribute("data-changed"),
      mutations: changes.length, callbacks, afterCallbacks: h.binds.length,
      releasedBefore: h.cleaned.filter(entry => entry.phase === "before").length,
      releasedAfter: h.cleaned.filter(entry => entry.phase === "after").length, unhandled: h.unhandled };
  });
  expect(result.error).toBe("AbortError"); expect(result.callbackRestored && result.immediate && result.quiet).toBe(true);
  expect(result.sort).toBeNull(); expect(result.rowcount).toBeNull(); expect(result.changed).toBeNull(); expect(result.busy).toBe("false");
  expect(result.mutations).toBe(0); expect(result.callbacks).toBe(2); expect(result.afterCallbacks).toBe(2);
  expect(result.releasedBefore).toBe(2); expect(result.releasedAfter).toBe(2); expect(result.unhandled).toEqual([]);
});

test("synchronous sort completion failure keeps its committed projection and advances the next chunk once", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(3, { progressive: { size: 1 } });
    const entries = h.rows.entries(), header = h.table.querySelector<HTMLTableCellElement>('thead th[data-column="key"]')!;
    h.fault = { phase: "bind", once: true };
    let error: { code: string; phase: string } | null = null;
    try { h.grid.setSort((left, right) => right.key - left.key, { column: header, direction: "descending" }); }
    catch (cause) { const failed = cause as { code: string; detail?: { phase: string } };
      error = { code: failed.code, phase: failed.detail?.phase ?? "" }; }
    const rejected = await h.grid.whenBound().then(() => null, cause => ({ code: cause.code, phase: cause.detail?.phase }));
    const committed = { ids: h.ids(), logical: h.grid.rowIds("visible"),
      value: h.field(3, "key")?.textContent, sort: header.getAttribute("aria-sort"), callbacks: h.binds.length };
    const next = await h.grid.renderMore();
    return { error, rejected, committed, next, ids: h.ids(), callbacks: h.binds.map(result => [result.available, result.first]),
      unchanged: h.rows.entries() === entries && h.rows.changes().length === 0, unhandled: h.unhandled };
  });
  expect(result.error).toEqual({ code: "GRID_BIND", phase: "onBind" }); expect(result.rejected).toEqual(result.error);
  expect(result.committed).toEqual({ ids: [3], logical: [3, 2, 1], value: "3", sort: "descending", callbacks: 2 });
  expect(result.next).toMatchObject({ available: 2, first: false, last: false }); expect(result.ids).toEqual([3, 2]);
  expect(result.callbacks).toEqual([[1, true], [1, true], [2, false]]); expect(result.unchanged).toBe(true);
  expect(result.unhandled).toEqual([]);
});

test("invalid progressive options fail before DOM ownership and allow corrected binding", async ({ page }) => {
  const results = await page.evaluate(async () => {
    const h = window.progressiveFixture, results = [];
    for (const value of [null, [], {}, { size: 0 }, { size: -1 }, { size: 1.5 }, { size: NaN }, { size: Infinity },
      { size: Number.MAX_SAFE_INTEGER + 1 }, { size: "3" }, { size: 2, delay: -1 }, { size: 2, delay: NaN },
      { size: 2, delay: Infinity }, { size: 2, delay: 2147483648 }, { size: 2, delay: "1" }]) {
      let code = "";
      try { h.reset(3, { progressive: value as Options["progressive"] }); }
      catch (error) { code = (error as { code: string }).code; }
      const original = h.table.outerHTML === h.original, callbacks = h.before.length;
      h.reset(1, { progressive: { size: 1, delay: .5 } }); const corrected = await h.grid.whenBound();
      results.push({ code, original, callbacks, corrected: corrected.last });
    }
    h.reset(0, { progressive: { size: Number.MAX_SAFE_INTEGER, delay: 2147483647 } });
    results.push({ code: "valid maximum", original: true, callbacks: 0, corrected: (await h.grid.whenBound()).last });
    return results;
  });
  for (const result of results.slice(0, -1)) expect(result).toEqual({ code: "GRID_PROGRESSIVE", original: true, callbacks: 0, corrected: true });
  expect(results.at(-1)).toEqual({ code: "valid maximum", original: true, callbacks: 0, corrected: true });
});

test("independent instances cancel separately and remain accessible without duplicate IDs", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(5, { progressive: { size: 3, delay: 10 } }); h.other(4);
    const main = h.grid.whenBound().then(() => "resolved", error => error.name);
    const other = h.secondary!; h.grid.cancelBinding(); const second = await other.grid.whenBound();
    const ids = [...h.host.querySelectorAll("[id]")].map(element => element.id), unique = new Set(ids).size === ids.length;
    const mainBefore = h.ids(); await other.grid.renderMore();
    return { main: await main, second, unique, mainBefore, mainAfter: h.ids(), mainBusy: h.table.getAttribute("aria-busy"),
      otherBusy: other.table.getAttribute("aria-busy"), mainCalls: h.binds.length };
  });
  expect(result.main).toBe("AbortError"); expect(result.second).toMatchObject({ available: 2, last: false });
  expect(result.unique).toBe(true); expect(result.mainAfter).toEqual(result.mainBefore); expect(result.mainCalls).toBe(0);
  expect(result.mainBusy).toBe("false"); expect(result.otherBusy).not.toBe("true");
  const axe = await new AxeBuilder({ page }).include("[data-progress-fixture]").analyze();
  expect(axe.violations).toEqual([]);
  const restored = await page.evaluate(() => {
    const h = window.progressiveFixture, other = h.secondary!; other.grid.dispose();
    return other.table.outerHTML === other.original;
  });
  expect(restored).toBe(true);
});

test("5,000-row viewport admission never constructs offscreen records or rebinds its growing prefix", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(5000, { progressive: { size: 1000 }, viewport: { root: h.root, estimate: 100, overscan: 2 } });
    const first = await h.grid.whenBound(); await h.settle();
    const initial = { after: h.after.length, clones: h.clones, ids: h.ids() };
    const second = await h.grid.renderMore(); await h.settle();
    const middle = { after: h.after.length, clones: h.clones, ids: h.ids() };
    let last = second; while (!last.last) last = await h.grid.renderMore(); await h.settle();
    return { first, second, last, initial, middle, mounted: h.ids().length, physical: h.table.querySelectorAll("tr[data-progress-row]").length,
      after: h.after.length, unique: new Set(h.after).size, clones: h.clones, callbacks: h.binds.map(result => result.available),
      totalRows: h.table.getAttribute("aria-rowcount"), unhandled: h.unhandled };
  });
  expect(result.first).toMatchObject({ available: 1000, visible: 5000, last: false });
  expect(result.second.available).toBe(2000); expect(result.last).toMatchObject({ available: 5000, last: true });
  expect(result.initial.after).toBeLessThan(40); expect(result.initial.after).toBe(result.unique);
  expect(result.middle.after).toBe(result.initial.after); expect(result.middle.clones).toBe(result.initial.clones);
  expect(result.after).toBe(result.unique); expect(result.clones).toBeLessThanOrEqual(result.after * 2 + 4);
  expect(result.mounted).toBeLessThan(40); expect(result.physical).toBeLessThan(80); expect(result.totalRows).toBe("10001");
  expect(result.callbacks).toEqual([1000, 2000, 3000, 4000, 5000]); expect(result.unhandled).toEqual([]);
});

test("positive viewport delay schedules materialized records rather than thousands of offscreen IDs", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture, originalTimer = window.setTimeout; let calls = 0;
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
      if (timeout === 1) calls++;
      return originalTimer.call(window, handler, timeout, ...args);
    }) as typeof window.setTimeout;
    try {
      h.reset(5000, { progressive: { size: 5000, delay: 1 }, viewport: { root: h.root, estimate: 100, overscan: 2 } });
      const result = await h.grid.whenBound();
      return { result, calls, after: h.after.length, clones: h.clones };
    } finally { window.setTimeout = originalTimer; }
  });
  expect(result.result).toMatchObject({ available: 5000, first: true, last: true });
  expect(result.after).toBeGreaterThan(0); expect(result.after).toBeLessThan(40);
  expect(result.calls).toBeLessThanOrEqual(result.after + 2); expect(result.clones).toBeLessThanOrEqual(result.after * 2 + 4);
});

test("cooperative nonviewport admission avoids per-record rescans of a growing thousand-row prefix", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture; h.reset(0, { progressive: { size: 50 } });
    const get = h.rows.get.bind(h.rows); let reads = 0;
    h.rows.get = id => { reads++; return get(id); };
    h.rows.replace(Array.from({ length: 1000 }, (_, index) => h.item(index + 1)));
    const ids = h.rows.entries().map(row => row.id); h.grid.setSelected(ids); h.grid.setChecked(ids);
    const selected = h.grid.selectedIds(), checked = h.grid.checkedIds(), NativeSet = window.Set;
    let copiedMembers = 0;
    window.Set = new Proxy(NativeSet, { construct(target, args, newTarget) {
      if (args[0] === selected || args[0] === checked) copiedMembers += args[0].length;
      return Reflect.construct(target, args, newTarget);
    } });
    try {
      let result = await h.grid.whenBound(); while (!result.last) result = await h.grid.renderMore();
      return { reads, copiedMembers, after: h.after.length, unique: new Set(h.after).size, clones: h.clones,
        selected: h.grid.selectedIds().length, checked: h.grid.checkedIds().length,
        sameSets: selected === h.grid.selectedIds() && checked === h.grid.checkedIds(),
        pressed: h.table.querySelectorAll('button[data-select-row][aria-pressed="true"]').length,
        checkControls: h.table.querySelectorAll('input[data-check-row]').length,
        checks: [...h.table.querySelectorAll<HTMLInputElement>('input[data-check-row]')].every(input => input.checked),
        mounted: h.ids().length, result, boundaries: h.binds.filter(bind => bind.visible > 0).length };
    } finally { window.Set = NativeSet; }
  });
  expect(result.result).toMatchObject({ visible: 1000, available: 1000, last: true });
  expect(result.mounted).toBe(1000); expect(result.after).toBe(1000); expect(result.unique).toBe(1000);
  expect(result.boundaries).toBe(20); expect(result.clones).toBeLessThanOrEqual(2004);
  expect(result.reads).toBeLessThan(100000);
  expect(result.copiedMembers).toBeLessThan(100000); expect(result.sameSets && result.checks).toBe(true);
  expect(result.selected).toBe(1000); expect(result.checked).toBe(1000); expect(result.pressed).toBe(1000); expect(result.checkControls).toBe(1000);
});

test("a late viewport field failure publishes an owned error and retries its window without another completion", async ({ page }) => {
  const pageErrors: string[] = []; page.on("pageerror", error => pageErrors.push(error.message));
  const result = await page.evaluate(async () => {
    const h = window.progressiveFixture;
    h.reset(1000, { progressive: { size: 1000 }, viewport: { root: h.root, estimate: 100, overscan: 2 } });
    const original = h.grid.whenBound(); await original; await h.settle();
    const callbacks = h.binds.length;
    h.fault = { phase: "field", id: 1000 };
    h.root.scrollTop = h.root.scrollHeight; h.root.dispatchEvent(new Event("scroll")); await h.settle();
    const failed = h.grid.whenBound(), different = failed !== original;
    const error = await failed.then(() => null, error => ({ api: error.api, code: error.code }));
    const failedBusy = h.table.getAttribute("aria-busy"); delete h.fault;
    const retried = await h.grid.renderMore(); await h.settle();
    const visible = !!h.field(1000, "profile.name")?.isConnected, afterCallbacks = h.binds.length;
    const stale = h.field<HTMLInputElement>(1000, "profile.name")!;
    h.grid.dispose(); const restored = h.table.outerHTML === h.original;
    const changes: MutationRecord[] = [], observer = new MutationObserver(records => changes.push(...records));
    observer.observe(h.table, { subtree: true, childList: true, attributes: true, characterData: true });
    stale.value = "Late detached input"; stale.dispatchEvent(new Event("input", { bubbles: true }));
    h.rows.set(1, "summary", "Late data"); await h.task(20); await h.settle(); observer.disconnect();
    return { different, error, failedBusy, retried, visible, callbacks, afterCallbacks,
      restored, quiet: h.table.outerHTML === h.original, mutations: changes.length, unhandled: h.unhandled };
  });
  expect(result.different).toBe(true); expect(result.error?.api).toBe("bindGrid"); expect(result.error?.code).toBeTruthy();
  expect(result.failedBusy).toBe("false"); expect(result.retried).toMatchObject({ available: 1000, visible: 1000, last: true });
  expect(result.visible).toBe(true); expect(result.callbacks).toBe(1); expect(result.afterCallbacks).toBe(result.callbacks);
  expect(result.restored && result.quiet).toBe(true); expect(result.mutations).toBe(0); expect(result.unhandled).toEqual([]);
  expect(pageErrors).toEqual([]);
});
