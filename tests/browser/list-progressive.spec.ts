// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { createRows, RowId, Rows } from "../../src/data/index.js";
import type { bindList, GridBindResult, ListHandle } from "../../src/ui/index.js";

type Item = { key: number; profile: { name: string } };
type Options = Omit<Parameters<typeof bindList<Item>>[1], "rows">;
type Fixture = {
  outer: HTMLElement;
  scroll: HTMLElement;
  root: HTMLUListElement | HTMLOListElement;
  template: HTMLLIElement;
  handle: HTMLButtonElement;
  rows: Rows<Item>;
  ids: RowId[];
  item(key: number, name?: string): Item;
  bind(options?: Options): ListHandle<Item>;
  keys(): number[];
  row(key: number): HTMLLIElement;
};

declare global {
  interface Window {
    listProgressive: (count?: number, alternate?: boolean) => Fixture;
    progressiveNative?: { views: ListHandle<Item>[]; fixtures: Fixture[] };
  }
}

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ ui, data }) => {
    const { bindList: bind }: { bindList: typeof bindList } = await import(ui);
    const { createRows: create }: { createRows: typeof createRows } = await import(data);
    window.listProgressive = (count = 8, alternate = false) => {
      const host = document.createElement("section");
      host.dataset.listProgressive = alternate ? "alternate" : "primary";
      const tag = alternate ? "ol" : "ul";
      const field = '<label>Name <input data-field="profile.name" required><output data-error-for="profile.name"></output></label>';
      const actions = '<button type="button" data-select-row>Select record</button><label><input type="checkbox" data-check-row>Check record</label>';
      host.innerHTML = `<div data-outer style="height:180px;overflow:auto">
        <div style="height:55px"></div>
        <div data-scroll tabindex="0" aria-label="Records" role="region" style="height:100px;overflow:auto">
          <${tag} style="padding:0;margin:0"><li data-row-template style="box-sizing:border-box;min-height:${alternate ? 60 : 50}px;display:block">
            <span data-field="key"></span>${alternate ? `<div>${field}</div>${actions}` : `${actions}${field}`}
          </li><li data-empty hidden>No records</li></${tag}>
        </div><div style="height:180px"></div>
      </div><button type="button" aria-label="Resize records" data-resize>Resize</button>`;
      document.body.append(host);
      const outer = host.querySelector<HTMLElement>("[data-outer]")!;
      const scroll = host.querySelector<HTMLElement>("[data-scroll]")!;
      const root = scroll.querySelector<HTMLUListElement | HTMLOListElement>(tag)!;
      const template = root.querySelector<HTMLLIElement>("li[data-row-template]")!;
      const handle = host.querySelector<HTMLButtonElement>("[data-resize]")!;
      const item = (key: number, name = `Record ${key}`): Item => ({ key, profile: { name } });
      const rows = create(Array.from({ length: count }, (_, index) => item(index + 1)));
      const ids = rows.entries().map(row => row.id);
      const rowFields = () => [...root.querySelectorAll<HTMLElement>('[data-field="key"]')];
      return { outer, scroll, root, handle, template, rows, ids, item, bind: (options = {}) => bind(root, { rows, ...options }),
        keys: () => rowFields().map(field => Number(field.textContent)),
        row: key => rowFields().find(field => Number(field.textContent) === key)!.closest("li")! };
    };
  }, modules);
});

test("List keeps synchronous default binding and separates logical scope from admitted rows", async ({ page }) => {
  const actual = await page.evaluate(async () => {
    const complete = window.listProgressive(3);
    const completeBinds: GridBindResult[] = [];
    const standard = complete.bind({ onBind: result => completeBinds.push(result) });
    const standardImmediate = complete.keys();
    const standardResult = await standard.whenBound();
    await standard.renderMore();
    const s = window.listProgressive(7, true);
    const binds: GridBindResult[] = [];
    const list = s.bind({ progressive: { size: 3 }, onBind: result => binds.push(result) });
    const immediate = s.keys();
    const first = await list.whenBound();
    list.checkAll(true, "visible");
    const logical = [list.rowIds("visible").length, list.checkState("visible").total, list.checkedIds().length, s.keys().length];
    const more = list.renderMore(), deferred = s.keys(), pending = more === list.whenBound() && more === list.renderMore();
    await more;
    const retainedChecks = [...s.root.querySelectorAll<HTMLInputElement>("[data-check-row]")].every(input => input.checked);
    await list.renderMore(); await list.renderMore();
    return { standardImmediate, standardResult, standardCount: completeBinds.length, immediate, first, logical,
      deferred, pending, retainedChecks, flags: binds.map(result => [result.available, result.mounted, result.first, result.last]),
      frozen: binds.every(Object.isFrozen), final: s.keys() };
  });
  expect(actual.standardImmediate).toEqual([1, 2, 3]);
  expect(actual.standardResult).toEqual({ total: 3, filtered: 3, visible: 3, available: 3, mounted: 3, first: true, last: true, event: null });
  expect(actual.standardCount).toBe(1);
  expect(actual.immediate).toEqual([1, 2, 3]);
  expect(actual.first).toMatchObject({ total: 7, filtered: 7, visible: 7, available: 3, mounted: 3 });
  expect(actual.logical).toEqual([7, 7, 7, 3]);
  expect(actual.deferred).toEqual([1, 2, 3]);
  expect(actual.pending).toBe(true);
  expect(actual.retainedChecks).toBe(true);
  expect(actual.flags).toEqual([[3, 3, true, false], [6, 6, false, false], [7, 7, false, true]]);
  expect(actual.frozen).toBe(true);
  expect(actual.final).toEqual([1, 2, 3, 4, 5, 6, 7]);
});

test("List yields delayed rows and cancels pending work without releasing committed rows", async ({ page }) => {
  const actual = await page.evaluate(async () => {
    const task = () => new Promise<void>(resolve => setTimeout(resolve, 0));
    const s = window.listProgressive(5);
    const touched: number[] = [], cleaned: number[] = [], binds: number[] = [];
    const list = s.bind({ progressive: { size: 3, delay: 100 },
      onRowBind({ row, own }) { touched.push(row.value.key); own(() => cleaned.push(row.value.key)); },
      onBind(result) { binds.push(result.available); }
    });
    const start = s.keys();
    const original = list.whenBound();
    const firstNode = s.row(1);
    await task();
    const during = s.keys();
    const cancelled = list.cancelBinding();
    const aborted = await original.then(() => "resolved", (error: Error) => error.name);
    const after = s.keys(), countAfter = touched.length;
    const retry = await list.renderMore();
    const retained = s.row(1) === firstNode;
    const pending = list.renderMore();
    list.dispose();
    const disposed = await pending.then(() => "resolved", (error: Error) => error.name);
    return { start, during, aborted, after, countAfter, retained, disposed, retry, cancelled,
      cleaned, touched, binds, restored: s.root.firstElementChild === s.template };
  });
  expect(actual.start).toEqual([1]);
  expect(actual.during).toEqual([1]);
  expect(actual.cancelled).toMatchObject({ available: 1, mounted: 1, visible: 5, last: false });
  expect(actual.aborted).toBe("AbortError");
  expect(actual.after).toEqual([1]);
  expect(actual.countAfter).toBe(1);
  expect(actual.retry).toMatchObject({ available: 3, mounted: 3, visible: 5, first: true, last: false });
  expect(actual.retained).toBe(true);
  expect(actual.disposed).toBe("AbortError");
  expect(actual.touched).toEqual([1, 2, 3]);
  expect(actual.cleaned.slice().sort()).toEqual([1, 2, 3]);
  expect(actual.binds).toEqual([3]);
  expect(actual.restored).toBe(true);
});

test("List retries from its committed prefix after a row hook failure and supersedes a pending view", async ({ page }) => {
  const actual = await page.evaluate(async () => {
    const s = window.listProgressive(6);
    let fail = true;
    const prepared: number[] = [], cleaned: number[] = [], binds: Array<[number, string | null]> = [];
    const list = s.bind({ progressive: { size: 4, delay: 15 },
      beforeRowBind({ row, own }) {
        prepared.push(row.value.key);
        own(() => cleaned.push(row.value.key));
        if (row.value.key === 3 && fail) throw new Error("Stop at row three");
      },
      onBind(result) { binds.push([result.available, result.event?.type ?? null]); }
    });
    const failure = await list.whenBound().then(() => null, (error: { code: string }) => error.code);
    const remaining = s.keys(), released = cleaned.slice();
    const firstNode = s.row(1);
    fail = false;
    const retried = await list.renderMore();
    const retained = s.row(1) === firstNode;
    const pending = list.renderMore();
    s.rows.replace([s.item(10), s.item(20)]);
    const old = await pending.then(() => "resolved", (error: Error) => error.name);
    const replacement = await list.whenBound();
    return { failure, remaining, released, prepared, retried, retained, old, replacement, binds, final: s.keys() };
  });
  expect(actual.failure).toBe("LIST_BIND");
  expect(actual.remaining).toEqual([1, 2]);
  expect(actual.released).toEqual([3]);
  expect(actual.prepared).toEqual([1, 2, 3, 3, 4, 10, 20]);
  expect(actual.retried).toMatchObject({ visible: 6, available: 4, first: true, last: false });
  expect(actual.retained).toBe(true);
  expect(actual.old).toBe("AbortError");
  expect(actual.replacement).toMatchObject({ visible: 2, available: 2, first: true, last: true, event: { type: "replace" } });
  expect(actual.binds).toEqual([[4, null], [2, "replace"]]);
  expect(actual.final).toEqual([10, 20]);
});

test("List aborts pending readiness when an asynchronous completion replaces or disposes its view", async ({ page }) => {
  const actual = await page.evaluate(async () => {
    const a = window.listProgressive(), b = window.listProgressive(8, true);
    const first = a.bind({ progressive: { size: 2 }, onBind(result) {
      if (!result.first) first.setPage({ page: 2, size: 3 });
    } });
    const second = b.bind({ progressive: { size: 2 }, onBind(result) {
      if (!result.first) second.dispose();
    } });
    const outcome = (result: Promise<GridBindResult>) => result.then(() => "resolved", (error: Error) => error.name);
    const aborted = await Promise.all([outcome(first.renderMore()), outcome(second.renderMore())]);
    const replacement = await first.whenBound();
    return { aborted, replacement, page: first.page()?.page, keys: a.keys(), restored: b.root.firstElementChild === b.template,
      busy: [a.root.getAttribute("aria-busy"), b.root.getAttribute("aria-busy")] };
  });
  expect(actual).toMatchObject({ aborted: ["AbortError", "AbortError"], page: 2, keys: [4, 5], restored: true, busy: [null, null],
    replacement: { visible: 3, available: 2, first: true, last: false } });
});

test("List bottom scrolling admits its own next chunk and keeps a manual path for another layout", async ({ page }) => {
  await page.evaluate(() => {
    const first = window.listProgressive(8), second = window.listProgressive(8, true);
    window.progressiveNative = { fixtures: [first, second], views: [
      first.bind({ progressive: { size: 3 }, scroll: { root: first.scroll } }),
      second.bind({ progressive: { size: 3 }, scroll: { root: second.scroll, auto: false, contain: false } })
    ] };
    for (const s of [first, second]) s.scroll.scrollTop = s.scroll.scrollHeight;
  });
  const fields = '[data-field="key"]';
  await expect(page.locator(`[data-list-progressive="primary"] ${fields}`)).toHaveCount(6);
  await expect(page.locator(`[data-list-progressive="alternate"] ${fields}`)).toHaveCount(3);
  const actual = await page.evaluate(async () => {
    const { views: [first, second], fixtures: [a, b] } = window.progressiveNative!;
    const property = "overscroll-behavior-y";
    const cssSupported = CSS.supports(property, "contain");
    const statuses = cssSupported ? [a, b].map(s => getComputedStyle(s.scroll).getPropertyValue(property)) : null;
    const wheelAtTop = (s: Fixture) => {
      s.scroll.scrollTop = 0;
      const event = new WheelEvent("wheel", { deltaY: -70, bubbles: true, cancelable: true });
      s.scroll.dispatchEvent(event);
      return event.defaultPrevented;
    };
    const contained = [wheelAtTop(a), wheelAtTop(b)];
    const horizontal = new WheelEvent("wheel", { deltaX: -70, bubbles: true, cancelable: true });
    a.scroll.dispatchEvent(horizontal);
    await second.renderMore();
    const c = window.listProgressive(2, true);
    a.scroll.append(c.root);
    const shared = c.bind({ scroll: { root: a.scroll, auto: false } });
    first.dispose();
    const sharedAfterDispose = wheelAtTop(a);
    const sharedContainment = cssSupported ? getComputedStyle(a.scroll).getPropertyValue(property) : null;
    shared.dispose();
    return { cssSupported, statuses, contained, horizontal: horizontal.defaultPrevented, sharedAfterDispose, sharedContainment,
      afterDispose: wheelAtTop(a), first: a.root.firstElementChild === a.template,
      second: b.keys(), restoredContainment: cssSupported ? a.scroll.style.getPropertyValue(property) : null };
  });
  expect(actual.statuses).toEqual(actual.cssSupported ? ["contain", "auto"] : null);
  expect(actual.restoredContainment).toBe(actual.cssSupported ? "" : null);
  expect(actual.contained).toEqual([true, false]);
  expect(actual.horizontal).toBe(false);
  expect(actual.sharedAfterDispose).toBe(true);
  expect(actual.sharedContainment).toBe(actual.cssSupported ? "contain" : null);
  expect(actual.afterDispose).toBe(false);
  expect(actual.first).toBe(true);
  expect(actual.second).toEqual([1, 2, 3, 4, 5, 6]);
});

test("List keyboard skips unavailable progressive controls and retains a focused draft on sort", async ({ page }) => {
  await page.evaluate(() => {
    const s = window.listProgressive();
    const list = s.bind({ multiple: true, editable: true, progressive: { size: 2 }, scroll: { root: s.scroll, auto: false },
      canSelect: row => row.value.key !== 8,
      onRowBind({ row, elements }) {
        if (row.value.key === 5 || row.value.key === 7) elements[0].querySelector<HTMLButtonElement>("[data-select-row]")!.hidden = true;
      },
      parse: { "profile.name": value => {
        if (value === "invalid") throw new Error("Invalid name");
        return value;
      } } });
    window.progressiveNative = { fixtures: [s], views: [list] };
  });
  const button = page.locator('[data-list-progressive="primary"] [data-select-row]');
  await expect(button).toHaveCount(2);
  await button.first().focus();
  await page.keyboard.press("Shift+End");
  await expect(button.nth(5)).toBeFocused();
  expect(await page.evaluate(() => {
    const { fixtures: [s], views: [list] } = window.progressiveNative!;
    return list.selected() === s.ids[5] && list.selectedIds().includes(s.ids[0]);
  })).toBe(true);
  await page.keyboard.press("ArrowUp");
  await expect(button.nth(3)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(button.nth(5)).toBeFocused();
  const actual = await page.evaluate(() => {
    const { fixtures: [s], views: [list] } = window.progressiveNative!;
    const input = s.row(6).querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
    input.focus({ preventScroll: true });
    input.value = "invalid";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.setSelectionRange(2, 5);
    list.setSort((a, b) => b.key - a.key);
    return { keys: s.keys(), retained: s.row(6).contains(input) && document.activeElement === input,
      value: input.value, raw: list.value(s.ids[5]).profile.name, caret: [input.selectionStart, input.selectionEnd] };
  });
  expect(actual).toEqual({ keys: [8, 7, 6], retained: true, value: "invalid", raw: "Record 6", caret: [2, 5] });
});

test("List explicit reveal crosses pages, scrolls only its owner and retains a mounted draft", async ({ page }) => {
  const actual = await page.evaluate(async () => {
    const s = window.listProgressive(10);
    const binds: GridBindResult[] = [];
    const list = s.bind({ editable: true, progressive: { size: 2 }, scroll: { root: s.scroll, auto: false },
      onBind: result => binds.push(result) });
    list.setPage({ page: 1, size: 5 });
    const input = s.row(1).querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
    input.focus({ preventScroll: true });
    input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true }));
    s.outer.scrollTop = 10;
    const outerBefore = s.outer.scrollTop, viewportBefore = window.scrollY, bindCount = binds.length;
    const revealed = list.reveal(s.ids[4], { block: "end" });
    const rowBottom = s.row(5).getBoundingClientRect().bottom - s.scroll.getBoundingClientRect().top;
    const stable = input === s.row(1).querySelector('[data-field="profile.name"]') && document.activeElement === input && input.value === "";
    const sameOwner = s.outer.scrollTop === outerBefore && window.scrollY === viewportBefore;
    const quiet = binds.length === bindCount;
    const otherPage = list.reveal(s.ids[7], { block: "nearest" });
    const pageAtReveal = list.page()?.page, pagePrefix = s.keys();
    list.setFilter(item => item.key !== 7);
    const filtered = list.reveal(s.ids[6]);
    return { revealed, stable, sameOwner, quiet, otherPage, pageAtReveal, pagePrefix, filtered,
      rowBottom, viewport: s.scroll.clientHeight, raw: list.value(s.ids[0]).profile.name, errors: list.validate(s.ids[0]).issues.length };
  });
  expect(actual.revealed && actual.stable && actual.sameOwner && actual.quiet).toBe(true);
  expect(Math.abs(actual.rowBottom - actual.viewport)).toBeLessThanOrEqual(2);
  expect(actual.otherPage).toBe(true);
  expect(actual.pageAtReveal).toBe(2);
  expect(actual.pagePrefix.slice(0, 3)).toEqual([6, 7, 8]);
  expect(actual.filtered).toBe(false);
  expect(actual.raw).toBe("Record 1");
  expect(actual.errors).toBeGreaterThan(0);
});

test("List append tail and inserted-row scroll admit preceding rows without identity gaps", async ({ page }) => {
  const actual = await page.evaluate(async () => {
    const s = window.listProgressive(6);
    const binds: GridBindResult[] = [];
    const list = s.bind({ progressive: { size: 2 }, scroll: { root: s.scroll, auto: false }, appendScroll: true,
      onBind: result => binds.push(result) });
    const first = await list.whenBound(), firstNode = s.row(1);
    s.rows.append([s.item(7), s.item(8)]);
    const appended = await list.whenBound();
    const retained = s.row(1) === firstNode;
    const tail = s.scroll.scrollHeight - s.scroll.clientHeight - s.scroll.scrollTop;
    const a = window.listProgressive(8, true);
    const adding = a.bind({ progressive: { size: 2 }, scroll: { root: a.scroll, auto: false }, addScroll: true, addSelect: true });
    const id = adding.add(a.item(99), a.ids[4]);
    const rect = a.row(99).getBoundingClientRect(), box = a.scroll.getBoundingClientRect();
    return { first, appended, tail, retained, appendedKeys: s.keys(), appendEvents: binds.map(result => result.event?.type ?? null),
      inserted: a.keys(), shown: rect.bottom > box.top && rect.top < box.bottom, selected: adding.selected() === id };
  });
  expect(actual.first).toMatchObject({ available: 2, visible: 6 });
  expect(actual.appended).toMatchObject({ available: 8, visible: 8, first: false, last: true, event: { type: "append" } });
  expect(actual.appendEvents).toEqual([null, "append"]);
  expect(actual.appendedKeys).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(actual.retained).toBe(true);
  expect(actual.tail).toBeLessThanOrEqual(2);
  expect(actual.inserted.slice(0, 5)).toEqual([1, 2, 3, 4, 99]);
  expect(actual.shown && actual.selected).toBe(true);
});

test("List select and check scroll to the accepted last requested ID on the current page", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const s = window.listProgressive(12);
    let allow = true, supersedeSelection = false, supersedeCheck = false;
    const list = s.bind({ multiple: true, progressive: { size: 8 }, scroll: { root: s.scroll, auto: false }, selectScroll: true, checkScroll: true,
      beforeSelect: () => allow, beforeCheckChange: () => allow,
      onSelectionChange() {
        if (supersedeSelection) { supersedeSelection = false; list.setSelected([s.ids[5], s.ids[1]]); }
      },
      onCheckChange() {
        if (supersedeCheck) { supersedeCheck = false; list.setChecked([s.ids[7], s.ids[4]]); }
      } });
    const centered = (key: number) => {
      const box = s.scroll.getBoundingClientRect(), row = s.row(key).getBoundingClientRect();
      return Math.abs((row.top + row.bottom - box.top - box.bottom) / 2) <= 2;
    };
    list.select(s.ids[5]); const centeredSelection = centered(6);
    list.setChecked([s.ids[9], s.ids[3]]); const centeredCheck = centered(4), afterCheck = s.scroll.scrollTop;
    const checks = list.checkedIds(), previous = list.selected();
    allow = false;
    list.select(s.ids[6]); list.setChecked([s.ids[6]]);
    const veto = list.selected() === previous && list.checkedIds() === checks && s.scroll.scrollTop === afterCheck;
    allow = true;
    supersedeSelection = true;
    list.setSelected([s.ids[2], s.ids[5]]);
    const nestedSelection = centered(2) && list.selectedIds().includes(s.ids[5]);
    supersedeCheck = true;
    list.setChecked([s.ids[3], s.ids[7]]);
    const nestedCheck = centered(5) && list.checkedIds().includes(s.ids[7]);
    list.setPage({ page: 1, size: 5 });
    const beforeAnotherPage = s.scroll.scrollTop;
    list.select(s.ids[9]);
    return { centeredSelection, centeredCheck, veto, nestedSelection, nestedCheck, checked: checks.length, otherPage: list.page()?.page,
      offPageAccepted: list.selected() === s.ids[9], offPageQuiet: beforeAnotherPage === s.scroll.scrollTop };
  });
  expect(actual).toEqual({ centeredSelection: true, centeredCheck: true, veto: true, nestedSelection: true, nestedCheck: true, checked: 2, otherPage: 1,
    offPageAccepted: true, offPageQuiet: true });
});

test("List validation scrolls to the last reachable visual error and preserves the first-error focus option", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const s = window.listProgressive(9);
    for (const index of [1, 4, 7]) s.rows.set(s.ids[index], "profile", { name: "" });
    const list = s.bind({ editable: true, progressive: { size: 2 }, scroll: { root: s.scroll, auto: false }, validateScroll: true });
    list.setFilter(row => row.key !== 2);
    list.setSort((a, b) => b.key - a.key);
    s.scroll.focus({ preventScroll: true });
    const result = list.validate();
    const target = s.row(5).getBoundingClientRect(), box = s.scroll.getBoundingClientRect();
    const focused = document.activeElement === s.scroll;
    const a = window.listProgressive(9, true);
    for (const index of [2, 6]) a.rows.set(a.ids[index], "profile", { name: "" });
    const first = a.bind({ editable: true, progressive: { size: 2 }, scroll: { root: a.scroll, auto: false },
      validateScroll: true, revealInvalid: true });
    const invalid = first.validate();
    return { valid: result.valid, invalidRows: result.issues.length, focused, keys: s.keys(), targetVisible: target.top < box.bottom && target.bottom > box.top,
      invalid: invalid.valid, firstFocused: document.activeElement === a.row(3).querySelector('[data-field="profile.name"]'), firstPrefix: a.keys() };
  });
  expect(actual.valid).toBe(false);
  expect(actual.invalidRows).toBe(3);
  expect(actual.focused && actual.targetVisible).toBe(true);
  expect(actual.keys.slice(0, 5)).toEqual([9, 8, 7, 6, 5]);
  expect(actual.invalid).toBe(false);
  expect(actual.firstFocused).toBe(true);
  expect(actual.firstPrefix.slice(0, 3)).toEqual([1, 2, 3]);
});

test("List authored resize supports keyboard, pointer and independent ownership restoration", async ({ page }) => {
  await page.evaluate(() => {
    const a = window.listProgressive(6), b = window.listProgressive(6, true);
    if (CSS.supports("overscroll-behavior-y", "contain")) a.scroll.style.setProperty("overscroll-behavior-y", "none", "important");
    a.handle.setAttribute("aria-valuetext", "Original");
    const fixtures = [a, b];
    window.progressiveNative = { fixtures, views: fixtures.map(s => s.bind({ scroll: { root: s.scroll, auto: false },
      heightResize: { root: s.scroll, handle: s.handle, min: 80, max: 180 } })) };
  });
  const handle = page.locator('[data-list-progressive="primary"] [data-resize]');
  await expect(handle).toHaveAttribute("role", "separator");
  await handle.focus(); await handle.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", "180");
  await handle.press("Home");
  await expect(handle).toHaveAttribute("aria-valuenow", "80");
  const coordinate = (await handle.boundingBox())!;
  await page.mouse.move(coordinate.x + coordinate.width / 2, coordinate.y + coordinate.height / 2);
  await page.mouse.down();
  await page.mouse.move(coordinate.x + coordinate.width / 2, coordinate.y + coordinate.height / 2 + 35);
  await page.mouse.up();
  await expect(handle).toHaveAttribute("aria-valuenow", "115");
  const actual = await page.evaluate(() => {
    const { fixtures: [a, b], views: [first, second] } = window.progressiveNative!;
    const controlled = [a.handle.getAttribute("aria-controls"), b.handle.getAttribute("aria-controls")];
    const unique = controlled[0] === a.scroll.id && controlled[1] === b.scroll.id && controlled[0] !== controlled[1];
    const untouched = b.scroll.getBoundingClientRect().height;
    first.dispose(); second.dispose();
    const property = "overscroll-behavior-y";
    const cssSupported = CSS.supports(property, "contain");
    const restored = cssSupported ? [a.scroll.style.getPropertyValue(property), a.scroll.style.getPropertyPriority(property)] : null;
    return { unique, untouched, height: a.scroll.style.height, ids: [a.scroll.id, b.scroll.id], role: a.handle.getAttribute("role"),
      controls: a.handle.getAttribute("aria-controls"), text: a.handle.getAttribute("aria-valuetext"), cssSupported, restored };
  });
  expect(actual).toMatchObject({ unique: true, untouched: 100, height: "100px", ids: ["", ""], role: null, controls: null, text: "Original" });
  expect(actual.restored).toEqual(actual.cssSupported ? ["none", "important"] : null);
});
