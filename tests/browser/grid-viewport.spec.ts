// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Rows, RowsEvent } from "../../src/data/index.js";
import type { GridHandle } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = { name: string; profile: { score: number; choice: number; options: { label: string; value: number }[] } };
type Options = Parameters<typeof bindGrid<Item>>[1];
declare global {
  interface Window {
    viewportFixture: {
      grid: GridHandle<Item>; rows: Rows<Item>; table: HTMLTableElement; root: HTMLElement;
      original: string; events: RowsEvent[]; clones: number;
      rebind: (extra?: Partial<Options>) => void;
      mounted: () => HTMLTableRowElement[];
      field: <E extends HTMLElement = HTMLElement>(id: number, name: string) => E | null;
      settle: () => Promise<void>;
      retained?: HTMLInputElement;
    };
  }
}
const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts"), select: source("../../src/ui/select.ts") };
const markup = `<caption>Viewport employees</caption><thead><tr>
  <th scope="col" data-column="person">Employee</th><th scope="col" data-column="score">Score</th><th scope="col" data-column="choice">Choice</th>
  </tr></thead><tbody><tr data-row-template>
  <th scope="row" data-column="person"><button type="button" data-select-row>Select employee</button>
    <label>Name <input data-field="name" required></label><output data-error-for="name"></output></th>
  <td data-column="score"><label>Score <input type="number" data-field="profile.score" min="0" required></label><output data-error-for="profile.score"></output></td>
  <td data-column="choice"><label>Choice <select data-field="profile.choice" data-options="profile.options"
    data-option-label="label" data-option-value="value"></select></label><output data-error-for="profile.choice"></output></td></tr></tbody>`;
const mounted = '[data-viewport-table] tbody tr:not([data-row-template]):not([aria-hidden="true"])';

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const section = document.createElement("main");
    section.dataset.viewportFixture = "";
    section.innerHTML = `<h1>Grid viewport test</h1><div data-viewport-root role="region" aria-label="Employee rows" tabindex="0"
      style="height:400px;width:650px;overflow:auto;overflow-anchor:none"><table data-viewport-table>${markup}</table></div>`;
    const style = document.createElement("style");
    style.textContent = `[data-viewport-table] {border-collapse:collapse;width:640px;table-layout:fixed;font:14px/20px sans-serif}
      [data-viewport-table] th,[data-viewport-table] td {padding:2px;vertical-align:top}
      [data-viewport-table] tbody tr:not([aria-hidden="true"]) {height:48px}
      [data-viewport-table] label {display:block}
      [data-viewport-table] input,[data-viewport-table] select,[data-viewport-table] button {min-height:28px}
      [data-viewport-table] input {width:90px}
      [data-viewport-table] output {display:block;color:#a00000}
      [data-viewport-table] output:empty {display:none}`;
    section.append(style); document.body.append(section);
    const root = section.querySelector<HTMLElement>("[data-viewport-root]")!;
    const table = section.querySelector<HTMLTableElement>("table")!;
    const rows = createRows(Array.from({ length: 5000 }, (_, index) => ({ name: `Employee ${index + 1}`,
      profile: { score: index, choice: 1, options: [{ label: "One", value: 1 }, { label: "Two", value: 2 }] } })));
    const options: Options = { rows, paste: true, multiple: true,
      viewport: { root, estimate: 48, overscan: 3 },
      parse: { "profile.score": input => input.trim() && Number.isFinite(Number(input)) ? Number(input) : undefined } };
    const fixture: Window["viewportFixture"] = {
      grid: null as unknown as GridHandle<Item>, rows, root, table, original: table.outerHTML, events: [], clones: 0,
      mounted: () => [...table.tBodies[0].rows].filter(row => !row.hasAttribute("data-row-template") && row.getAttribute("aria-hidden") !== "true"),
      field<E extends HTMLElement = HTMLElement>(id: number, name: string): E | null {
        return fixture.mounted().find(row => row.getAttribute("aria-rowindex") === String(id + 1))?.querySelector<E>(`[data-field="${name}"]`) ?? null;
      },
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))),
      rebind(extra: Partial<Options> = {}) { fixture.grid.dispose(); root.scrollTop = 0; fixture.grid = bindGrid(table, { ...options, ...extra }); }
    };
    window.viewportFixture = fixture;
    fixture.grid = bindGrid(table, options);
    rows.subscribe((event: RowsEvent) => fixture.events.push(event));
  }, { modules, markup });
});

test("5,000 nested rows have bounded mounted DOM and complete native table positions", async ({ page }) => {
  await expect.poll(() => page.locator(mounted).count()).toBeGreaterThan(0);
  expect(await page.locator(mounted).count()).toBeLessThan(80);
  await expect(page.locator("[data-viewport-table]")).toHaveAttribute("aria-rowcount", "5001");
  await expect(page.locator(mounted).first()).toHaveAttribute("aria-rowindex", "2");
  await expect(page.locator(mounted).first().locator('select')).toHaveValue("1");
  expect(await page.locator('[data-viewport-table] tr[aria-hidden="true"]').evaluateAll(rows => rows.every(row =>
    !row.querySelector('input,select,button,textarea,a[href],[tabindex]')))).toBe(true);
  expect(await page.evaluate(() => window.viewportFixture.rows.entries().length)).toBe(5000);
});

test("rapid bidirectional scrolling settles at the correct logical rows without accumulating DOM", async ({ page }) => {
  for (const fraction of [1, .15, .8, 0]) {
    await page.evaluate(async value => {
      const h = window.viewportFixture; h.root.scrollTop = h.root.scrollHeight * value;
      h.root.dispatchEvent(new Event("scroll")); await h.settle();
    }, fraction);
    expect(await page.locator(mounted).count()).toBeLessThan(80);
  }
  await expect(page.locator(mounted).first().locator('[data-field="name"]')).toHaveValue("Employee 1");
  await page.evaluate(() => window.viewportFixture.grid.reveal(5000));
  await expect.poll(() => page.evaluate(() => !!window.viewportFixture.field(5000, "name"))).toBe(true);
  expect(await page.locator(mounted).count()).toBeLessThan(80);
});

test("reveal uses sorted filtered page identity and never changes focus or selection", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.viewportFixture; h.root.focus(); h.grid.select(1); h.grid.setChecked([2]);
    h.grid.setSort((a, b) => b.profile.score - a.profile.score);
    h.grid.setFilter(row => row.profile.score >= 4000);
    h.grid.setPage({ page: 1, size: 100 }); h.grid.reveal(4901); await h.settle();
    const codes = [1, 4900].map(id => { try { h.grid.reveal(id); return null; } catch (error) { return (error as { code: string }).code; } });
    return { names: h.mounted().map(row => row.querySelector<HTMLInputElement>('[data-field="name"]')!.value),
      codes, active: h.grid.selected(), checked: h.grid.checkedIds(), focus: document.activeElement === h.root, events: h.events.length };
  });
  expect(result.names).toContain("Employee 4901"); expect(result.codes).toEqual(["GRID_VIEWPORT_ROW", "GRID_VIEWPORT_ROW"]);
  expect(result).toMatchObject({ active: 1, checked: [2], focus: true, events: 0 });
});

test("visible checks and selection ranges span the whole logical page", async ({ page }) => {
  await page.evaluate(() => window.viewportFixture.grid.checkAll(true, "visible"));
  expect(await page.evaluate(() => window.viewportFixture.grid.checkState("visible"))).toEqual({ checked: true, indeterminate: false, total: 5000, count: 5000 });
  await page.locator(mounted).first().locator("[data-select-row]").click();
  await page.locator(mounted).first().locator("[data-select-row]").press("Shift+End");
  await expect.poll(() => page.evaluate(() => window.viewportFixture.grid.selectedIds().length)).toBe(5000);
  expect(await page.locator(mounted).count()).toBeLessThan(80);
  await expect(page.locator(mounted).last().locator("[data-select-row]")).toBeFocused();
});

test("Home End and adjacent keyboard navigation reveal logical neighbors", async ({ page }) => {
  const first = page.locator(mounted).first().locator("[data-select-row]");
  await first.focus(); await first.press("End");
  await expect.poll(() => page.evaluate(() => document.activeElement?.closest("tr")?.getAttribute("aria-rowindex"))).toBe("5001");
  await page.keyboard.press("ArrowUp");
  await expect.poll(() => page.evaluate(() => document.activeElement?.closest("tr")?.getAttribute("aria-rowindex"))).toBe("5000");
  await page.keyboard.press("Home");
  await expect.poll(() => page.evaluate(() => document.activeElement?.closest("tr")?.getAttribute("aria-rowindex"))).toBe("2");
  expect(await page.locator(mounted).count()).toBeLessThan(80);
});

test("Tab and Shift Tab cross a mounted boundary without skipping logical rows", async ({ page }) => {
  await page.locator(mounted).first().locator("select").focus();
  await page.evaluate(async () => {
    const h = window.viewportFixture; await h.settle();
    h.root.scrollTop = 150000; h.root.dispatchEvent(new Event("scroll")); await h.settle();
  });
  expect(await page.evaluate(() => window.viewportFixture.field(2, "name") === null)).toBe(true);
  await page.keyboard.press("Tab");
  await expect.poll(() => page.evaluate(() => document.activeElement?.closest("tr")?.getAttribute("aria-rowindex"))).toBe("3");
  await page.keyboard.press("Shift+Tab");
  await expect.poll(() => page.evaluate(() => document.activeElement?.closest("tr")?.getAttribute("aria-rowindex"))).toBe("2");
  await expect(page.locator('select:focus')).toHaveCount(1);
});

test("a distant focused editor retains its exact node caret and composition without retaining the gap", async ({ page }) => {
  await page.evaluate(async () => {
    const h = window.viewportFixture; const input = h.field<HTMLInputElement>(1, "name")!;
    input.focus(); input.setSelectionRange(2, 6); input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    h.retained = input; await h.settle();
    h.root.scrollTop = 150000; h.root.dispatchEvent(new Event("scroll"));
  });
  await page.evaluate(() => window.viewportFixture.settle());
  const pinned = await page.evaluate(() => {
    const h = window.viewportFixture; const input = h.retained!;
    return { same: h.field(1, "name") === input, focus: document.activeElement === input, range: [input.selectionStart, input.selectionEnd],
      mounted: h.mounted().length, indices: h.mounted().map(row => Number(row.getAttribute("aria-rowindex"))) };
  });
  expect(pinned).toMatchObject({ same: true, focus: true, range: [2, 6] });
  expect(pinned.mounted).toBeLessThan(80); expect(pinned.indices.at(-1)!).toBeGreaterThan(1000);
  await page.evaluate(() => window.viewportFixture.retained!.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "한" })));
});

test("offscreen drafts and validation issues survive release and remount", async ({ page }) => {
  await page.evaluate(async () => {
    const h = window.viewportFixture; const input = h.field<HTMLInputElement>(1, "name")!;
    input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true }));
    h.grid.validate(1); h.root.focus(); h.grid.reveal(4000); await h.settle();
  });
  expect(await page.evaluate(() => window.viewportFixture.field(1, "name") === null)).toBe(true);
  await page.evaluate(() => window.viewportFixture.grid.reveal(1));
  await expect(page.locator(mounted).first().locator('[data-field="name"]')).toHaveValue("");
  await expect(page.locator(mounted).first().locator('[data-field="name"]')).toHaveAttribute("aria-invalid", "true");
  expect(await page.evaluate(() => window.viewportFixture.rows.get(1)!.value.name)).toBe("Employee 1");
});

test("1,000 offscreen nested rows paste atomically without cloning every target", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.viewportFixture; const ids = h.rows.entries().map(row => row.id);
    let clones = 0; const original = Node.prototype.cloneNode;
    Node.prototype.cloneNode = function(deep?: boolean) { clones++; return original.call(this, deep); };
    try {
      const accepted = h.grid.paste(Array.from({ length: 1000 }, (_, index) => `${index + 100}\t2`).join("\n"), { id: 1001, field: "profile.score" });
      const before = h.rows.entries();
      const rejected = h.grid.paste("800\t2\n900\t999", { id: 2001, field: "profile.score" });
      return { valid: accepted.valid, rejected: rejected.valid, issues: rejected.issues.map(issue => [issue.rowId, issue.field]),
        same: before === h.rows.entries(), stable: h.rows.entries().every((row, index) => row.id === ids[index]), clones,
        events: h.events.map(event => ({ type: event.type, count: "ids" in event ? event.ids.length : 0 })),
        last: h.rows.get(2000)!.value.profile, mounted: h.mounted().length };
    } finally { Node.prototype.cloneNode = original; }
  });
  expect(result).toMatchObject({ valid: true, rejected: false, same: true, stable: true,
    events: [{ type: "setMany", count: 1000 }], last: { score: 1099, choice: 2 } });
  expect(result.issues).toContainEqual([2002, "profile.choice"]);
  expect(result.clones).toBeLessThan(80); expect(result.mounted).toBeLessThan(80);
});

test("released nested Selects relinquish ownership while current controls stay typed", async ({ page }) => {
  const result = await page.evaluate(async module => {
    const h = window.viewportFixture; const old = h.field<HTMLSelectElement>(1, "profile.choice")!;
    h.grid.reveal(4500); await h.settle();
    const { bindSelect } = await import(module);
    const released = bindSelect(old, { choices: [{ label: "Released", value: 9 }], value: 9 });
    const value = released.value(); released.dispose();
    const current = h.field<HTMLSelectElement>(4500, "profile.choice")!;
    current.value = "2"; current.dispatchEvent(new Event("change", { bubbles: true }));
    return { detached: !old.isConnected, value, current: h.rows.get(4500)!.value.profile.choice, mounted: h.mounted().length };
  }, modules.select);
  expect(result).toMatchObject({ detached: true, value: 9, current: 2 }); expect(result.mounted).toBeLessThan(80);
});

test("measured wrapping and column resize retain the visible row anchor", async ({ page }) => {
  await page.evaluate(async () => { const h = window.viewportFixture; h.grid.reveal(1500); await h.settle(); h.root.scrollTop += 20; await h.settle(); });
  const result = await page.evaluate(async () => {
    const h = window.viewportFixture; const top = h.root.getBoundingClientRect().top;
    const anchor = h.mounted().find(row => row.getBoundingClientRect().bottom > top + 1)!;
    const index = anchor.getAttribute("aria-rowindex"); const offset = anchor.getBoundingClientRect().top - top;
    const above = h.mounted().find(row => row.getBoundingClientRect().bottom <= top);
    if (!above) throw new Error("The overscan fixture needs a mounted row above the anchor.");
    above.style.height = "640px"; await h.settle();
    h.grid.setColumns(h.grid.columns().map(column => ({ ...column, width: column.key === "person" ? 140 : 230 })));
    await h.settle();
    const after = h.mounted().find(row => row.getAttribute("aria-rowindex") === index)!;
    return { retained: !!after, delta: Math.abs(after.getBoundingClientRect().top - top - offset), mounted: h.mounted().length };
  });
  expect(result.retained).toBe(true); expect(result.delta).toBeLessThan(5); expect(result.mounted).toBeLessThan(80);
});

test("hidden preparation wakes on display and column hide reorder keeps the current window", async ({ page }) => {
  await page.evaluate(() => { const h = window.viewportFixture; h.grid.dispose(); h.root.hidden = true; h.rebind(); });
  await page.evaluate(() => { window.viewportFixture.root.hidden = false; window.viewportFixture.grid.reveal(2500); });
  await expect.poll(() => page.evaluate(() => !!window.viewportFixture.field(2500, "name"))).toBe(true);
  await page.evaluate(() => {
    const h = window.viewportFixture;
    h.grid.setColumns([...h.grid.columns()].reverse().map(column => ({ ...column, hidden: column.key === "score" })));
  });
  await expect(page.locator('[data-viewport-table] [data-column="score"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.viewportFixture.field<HTMLSelectElement>(2500, "profile.choice")?.value)).toBe("1");
  expect(await page.locator(mounted).count()).toBeLessThan(80);
});

test("append remove revert replace and filtering retain identity and recover a valid viewport", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.viewportFixture; h.grid.reveal(3000); await h.settle();
    const before = h.field(3000, "name")!; const top = before.closest("tr")!.getBoundingClientRect().top;
    const id = h.rows.add({ name: "Appended", profile: { score: 6000, choice: 1, options: [{ label: "One", value: 1 }] } });
    await h.settle(); const preserved = h.field(3000, "name") === before && Math.abs(before.closest("tr")!.getBoundingClientRect().top - top) < 5;
    h.rows.remove(3000); h.rows.revert(3000); h.grid.reveal(3000); await h.settle();
    const restored = h.field<HTMLInputElement>(3000, "name")!.value;
    h.grid.setFilter(row => row.profile.score > 4990); await h.settle(); const count = h.grid.checkState("visible").total;
    h.grid.setFilter(null); h.rows.replace([{ name: "Replacement", profile: { score: 1, choice: 1, options: [{ label: "One", value: 1 }] } }]); await h.settle();
    return { id, preserved, restored, count, rows: h.mounted().length, value: h.mounted()[0].querySelector<HTMLInputElement>("input")!.value,
      aria: h.table.getAttribute("aria-rowcount") };
  });
  expect(result).toEqual({ id: 5001, preserved: true, restored: "Employee 3000", count: 10, rows: 1, value: "Replacement", aria: "2" });
});

test("invalid viewport options and rowspans fail before taking ownership; pending frames dispose cleanly", async ({ page }) => {
  const result = await page.evaluate(async module => {
    const h = window.viewportFixture; const { bindGrid } = await import(module); h.grid.dispose();
    const baseline = h.table.outerHTML;
    const invalid = [
      { root: h.root, estimate: 0 }, { root: h.root, estimate: 48, overscan: -1 },
      { root: document.createElement("div"), estimate: 48 }
    ].map(viewport => {
      try { bindGrid(h.table, { rows: h.rows, viewport }); return false; }
      catch { return h.table.outerHTML === baseline; }
    });
    h.table.querySelector("tbody td")!.setAttribute("rowspan", "2");
    const rowspan = h.table.outerHTML;
    let code = "";
    try { bindGrid(h.table, { rows: h.rows, viewport: { root: h.root, estimate: 48 } }); }
    catch (error) { code = (error as { code: string }).code; }
    const unchanged = h.table.outerHTML === rowspan;
    h.table.querySelector("tbody td")!.removeAttribute("rowspan");
    h.rebind(); h.root.scrollTop = 200000; h.root.dispatchEvent(new Event("scroll")); h.grid.dispose();
    await h.settle(); const disposed = h.table.outerHTML === baseline;
    h.rebind(); await h.settle();
    return { invalid, code, unchanged, disposed, rebound: h.mounted().length > 0 && h.mounted().length < 80 };
  }, modules.grid);
  expect(result).toEqual({ invalid: [true, true, true], code: "GRID_VIEWPORT_MARKUP", unchanged: true, disposed: true, rebound: true });
});

test("authored static body and footer rows keep their positions in the logical ARIA count", async ({ page }) => {
  await page.evaluate(() => {
    const h = window.viewportFixture; h.grid.dispose();
    h.table.tBodies[0].insertAdjacentHTML("afterbegin", '<tr data-static="before"><td colspan="3" data-columns="person score choice">Before employees</td></tr>');
    h.table.tBodies[0].insertAdjacentHTML("beforeend", '<tr data-static="after"><td colspan="3" data-columns="person score choice">After employees</td></tr>');
    h.table.createTFoot().innerHTML = '<tr><td colspan="3" data-columns="person score choice">Employee footer</td></tr>';
    h.rebind();
  });
  await expect(page.locator("[data-viewport-table]")).toHaveAttribute("aria-rowcount", "5004");
  await expect(page.locator('[data-static="before"]')).toHaveText("Before employees");
  await expect(page.locator('[data-static="after"]')).toHaveText("After employees");
  await expect(page.locator(mounted).filter({ has: page.locator('[data-field="name"]') }).first()).toHaveAttribute("aria-rowindex", "3");
  await page.evaluate(() => window.viewportFixture.grid.reveal(5000));
  await expect.poll(() => page.locator('[data-viewport-table] tbody tr[aria-rowindex="5002"]').count()).toBe(1);
});

test("nonvirtual reveal scrolls an authored row and preserves selection and focus", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.viewportFixture; h.grid.dispose();
    h.rows.replace(Array.from({ length: 100 }, (_, index) => ({ name: `Plain ${index + 1}`,
      profile: { score: index, choice: 1, options: [{ label: "One", value: 1 }] } })));
    h.rebind({ viewport: undefined }); h.root.focus({ preventScroll: true });
    const ids = h.rows.entries().map(row => row.id); h.grid.select(ids[0]); h.grid.reveal(ids[99]);
    await h.settle();
    return { count: h.mounted().length, scrolled: h.root.scrollTop > 0, active: h.grid.selected(),
      first: ids[0], focus: document.activeElement === h.root, aria: h.table.getAttribute("aria-rowcount") };
  });
  expect(result.count).toBe(100); expect(result.scrolled).toBe(true); expect(result.active).toBe(result.first);
  expect(result.focus).toBe(true); expect(result.aria).toBeNull();
});

test("two authored MDI instances keep unique IDs native ARIA and keyboard accessibility", async ({ page }) => {
  await page.evaluate(async ({ gridModule }) => {
    const h = window.viewportFixture; const { bindGrid } = await import(gridModule);
    const root = h.root.cloneNode(false) as HTMLElement; root.dataset.secondViewport = "";
    root.setAttribute("aria-label", "Second employee rows"); const table = document.createElement("table"); table.dataset.viewportTable = "";
    table.innerHTML = h.original.replace(/^<table[^>]*>|<\/table>$/g, ""); root.append(table); h.root.after(root);
    const grid = bindGrid(table, { rows: h.rows, viewport: { root, estimate: 48 },
      parse: { "profile.score": (input: string) => input.trim() ? Number(input) : undefined } });
    grid.reveal(4000); h.grid.reveal(1);
  }, { gridModule: modules.grid });
  await expect.poll(() => page.locator('[data-second-viewport] tbody [data-field="name"]').count()).toBeGreaterThan(0);
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id)); expect(new Set(ids).size).toBe(ids.length);
  const axe = await new AxeBuilder({ page }).include("[data-viewport-fixture]")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]).analyze();
  expect(axe.violations.map(item => item.id)).toEqual([]);
});

test("reveal keeps the first row below an authored sticky header", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.viewportFixture;
    for (const cell of h.table.tHead!.querySelectorAll<HTMLElement>("th")) {
      cell.style.cssText = "position:sticky;top:0;height:60px;background:white";
    }
    h.grid.reveal(50); await h.settle(); h.grid.reveal(1); await h.settle();
    const row = h.field(1, "name")!.closest("tr")!;
    const headerBottom = Math.max(...[...h.table.tHead!.querySelectorAll("th")]
      .map(cell => cell.getBoundingClientRect().bottom));
    return { rowTop: row.getBoundingClientRect().top, headerBottom,
      rowBottom: row.getBoundingClientRect().bottom, viewportBottom: h.root.getBoundingClientRect().bottom,
      mounted: h.mounted().length };
  });
  expect(result.rowTop).toBeGreaterThanOrEqual(result.headerBottom - 1);
  expect(result.rowBottom).toBeLessThanOrEqual(result.viewportBottom + 1);
  expect(result.mounted).toBeLessThan(80);
});

test("formatter failures restore logical state DOM ARIA and scroll after queued viewport work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const results = await page.evaluate(async () => {
    const h = window.viewportFixture; h.grid.dispose();
    h.table.querySelector('[data-field="name"]')!.setAttribute("data-format", '[["viewportFailure"]]');
    h.table.tBodies[0].insertAdjacentHTML("afterbegin", '<tr data-static="before" aria-rowindex="18"><td colspan="3" data-columns="person score choice">Before employees</td></tr>');
    h.table.tBodies[0].insertAdjacentHTML("beforeend", '<tr data-static="after" aria-rowindex="19"><td colspan="3" data-columns="person score choice">After employees</td></tr>');
    h.table.createTFoot().innerHTML = '<tr aria-rowindex="20"><td colspan="3" data-columns="person score choice">Footer</td></tr>';
    h.table.setAttribute("aria-rowcount", "21");
    let fail = false;
    h.rebind({ rules: { format: { viewportFailure: (value, _args, context) => {
      if (fail && context.rowId! >= 1000) throw new Error("Viewport formatter rejected the target.");
      return value;
    } } } });
    const outcomes = [];
    for (const operation of ["filter", "page", "reveal"] as const) {
      h.grid.reveal(50); await h.settle();
      const before = { html: h.table.outerHTML, scroll: h.root.scrollTop, entries: h.rows.entries(),
        page: h.grid.page(), count: h.table.getAttribute("aria-rowcount"),
        positions: [...h.table.rows].map(row => row.getAttribute("aria-rowindex")) };
      fail = true;
      let message = "";
      try {
        if (operation === "filter") h.grid.setFilter(row => row.profile.score >= 3999);
        else if (operation === "page") h.grid.setPage({ page: 40, size: 100 });
        else h.grid.reveal(4000);
      } catch (error) { message = (error as Error).message; }
      await h.settle();
      outcomes.push({ operation, message, html: h.table.outerHTML === before.html,
        scroll: h.root.scrollTop === before.scroll, entries: h.rows.entries() === before.entries,
        page: h.grid.page(), previousPage: before.page, count: h.table.getAttribute("aria-rowcount"),
        previousCount: before.count, positions: [...h.table.rows].map(row => row.getAttribute("aria-rowindex")),
        previousPositions: before.positions, logical: h.grid.checkState("visible").total });
      fail = false;
    }
    return outcomes;
  });
  expect(results.map(result => result.operation)).toEqual(["filter", "page", "reveal"]);
  for (const result of results) {
    expect(result.message).toContain("Formatter viewportFailure failed");
    expect(result).toMatchObject({ html: true, scroll: true, entries: true, logical: 5000 });
    expect(result.page).toEqual(result.previousPage);
    expect(result.count).toBe(result.previousCount);
    expect(result.positions).toEqual(result.previousPositions);
  }
  expect(errors).toEqual([]);
});

test("inherited disabled fields and first legend exemption agree for mounted and offscreen rows", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.viewportFixture;
    const fieldset = document.createElement("fieldset"); fieldset.disabled = true;
    const legend = document.createElement("legend"); legend.textContent = "Protected employees";
    h.root.before(fieldset); fieldset.append(legend, h.root);
    h.rows.setMany([{ id: 1, values: { name: "" } }, { id: 4000, values: { name: "" } }]);
    await h.settle(); h.events.length = 0;
    const before = h.rows.entries();
    const disabled = { mounted: h.grid.validate(1), offscreen: h.grid.validate(4000),
      native: h.field<HTMLInputElement>(1, "name")!.matches(":disabled"),
      mountedPaste: h.grid.paste("Blocked mounted", { id: 1, field: "name" }).valid,
      offscreenPaste: h.grid.paste("Blocked offscreen", { id: 4000, field: "name" }).valid };
    const protectedState = { same: h.rows.entries() === before, events: h.events.length,
      values: [h.rows.get(1)!.value.name, h.rows.get(4000)!.value.name] };
    legend.append(h.root);
    const enabled = { mounted: h.grid.validate(1), offscreen: h.grid.validate(4000),
      native: h.field<HTMLInputElement>(1, "name")!.matches(":disabled"),
      mountedPaste: h.grid.paste("Enabled mounted", { id: 1, field: "name" }).valid,
      offscreenPaste: h.grid.paste("Enabled offscreen", { id: 4000, field: "name" }).valid };
    return { disabled: { mounted: disabled.mounted.valid, offscreen: disabled.offscreen.valid, native: disabled.native,
      mountedPaste: disabled.mountedPaste, offscreenPaste: disabled.offscreenPaste }, protectedState,
      enabled: { mounted: enabled.mounted.valid, offscreen: enabled.offscreen.valid, native: enabled.native,
        mountedIssues: enabled.mounted.issues.map(issue => [issue.field, issue.rule]),
        offscreenIssues: enabled.offscreen.issues.map(issue => [issue.field, issue.rule]),
        mountedPaste: enabled.mountedPaste, offscreenPaste: enabled.offscreenPaste },
      values: [h.rows.get(1)!.value.name, h.rows.get(4000)!.value.name], events: h.events.map(event => event.type) };
  });
  expect(result.disabled).toEqual({ mounted: true, offscreen: true, native: true, mountedPaste: true, offscreenPaste: true });
  expect(result.protectedState).toEqual({ same: true, events: 0, values: ["", ""] });
  expect(result.enabled).toEqual({ mounted: false, offscreen: false, native: false,
    mountedIssues: [["name", "html"]], offscreenIssues: [["name", "html"]], mountedPaste: true, offscreenPaste: true });
  expect(result.values).toEqual(["Enabled mounted", "Enabled offscreen"]);
  expect(result.events).toEqual(["setMany", "setMany"]);
});

for (const action of ["filter", "dispose"] as const) {
  test(`Shift End abandons stale navigation after a ${action} post callback`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.evaluate(action => {
      const h = window.viewportFixture;
      h.rebind({ onSelectionChange(change) {
        if (change.event?.type !== "keydown") return;
        if (action === "filter") h.grid.setFilter(() => false);
        else h.grid.dispose();
      } });
    }, action);
    await page.locator(mounted).first().locator("[data-select-row]").press("Shift+End");
    await page.evaluate(() => window.viewportFixture.settle());
    if (action === "filter") {
      expect(await page.evaluate(() => window.viewportFixture.grid.checkState("visible").total)).toBe(0);
      await expect(page.locator("[data-viewport-table]")).toBeFocused();
    } else {
      expect(await page.evaluate(() => window.viewportFixture.table.outerHTML === window.viewportFixture.original)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}
