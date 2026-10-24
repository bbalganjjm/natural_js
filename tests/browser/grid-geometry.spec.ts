// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Rows } from "../../src/data/index.js";
import type { GridHandle } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = { name: string; profile: { score: number; choice: number; options: { label: string; value: number }[]; note: string } };
type Options = Parameters<typeof bindGrid<Item>>[1];
declare global {
  interface Window {
    geometry: {
      grid: GridHandle<Item>; rows: Rows<Item>; root: HTMLElement; table: HTMLTableElement; handle: HTMLButtonElement;
      host: HTMLElement; options: Options; originalRoot: string; originalHandle: string; originalTable: string;
      rebind(extra?: Partial<Options>): void; settle(): Promise<void>; mounted(): HTMLTableRowElement[];
      field(id: number): HTMLInputElement | undefined;
      cleanupSecond?: () => void;
    };
  }
}
const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts") };
const markup = `<caption>Geometry employees</caption><colgroup span="3"></colgroup><thead>
  <tr><th colspan="3" scope="colgroup" data-columns="person score choice">Employee information</th></tr>
  <tr><th scope="col" data-column="person">Name</th><th scope="col" data-column="score">Score</th><th scope="col" data-column="choice">Choice</th></tr>
  </thead><tbody><tr data-row-template>
  <th scope="row" data-column="person"><button type="button" data-select-row>Select</button><label>Name <input data-field="name" required></label></th>
  <td data-column="score"><label>Score <input type="number" data-field="profile.score"></label></td>
  <td data-column="choice"><label>Choice <select data-field="profile.choice" data-options="profile.options" data-option-label="label" data-option-value="value"></select></label></td>
  </tr></tbody><tfoot><tr><td colspan="3" data-columns="person score choice">Authored totals</td></tr>
  <tr><td data-column="person">Employee count</td><td data-column="score">500</td><td data-column="choice">Application footer</td></tr></tfoot>`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const host = document.createElement("section"); host.dataset.geometryFixture = ""; host.setAttribute("aria-label", "Grid geometry controls");
    host.innerHTML = `<h1>Grid geometry</h1><div data-geometry-root role="region" aria-label="Employee grid" tabindex="0"
      style="box-sizing:border-box;height:400px;width:680px;overflow:auto;border:2px solid black"><table data-geometry-table>${markup}</table></div>
      <button type="button" data-height-handle aria-label="Resize employee grid height" style="color:navy">Resize height</button>`;
    const style = document.createElement("style");
    style.textContent = `[data-geometry-table]{border-collapse:separate;border-spacing:0;table-layout:fixed;width:660px;font:14px/20px sans-serif}
      [data-geometry-table] th,[data-geometry-table] td{padding:2px;vertical-align:top}
      [data-geometry-table] thead th,[data-geometry-table] tfoot td{position:sticky;background:white;height:32px;box-sizing:border-box;z-index:2}
      [data-geometry-table] thead tr:first-child th{top:0}[data-geometry-table] thead tr:last-child th{top:32px}
      [data-geometry-table] tfoot tr:first-child td{bottom:32px}[data-geometry-table] tfoot tr:last-child td{bottom:0}
      [data-geometry-table] tbody tr:not([aria-hidden="true"]){height:48px}
      [data-geometry-table] input{width:90px}[data-geometry-table] label{display:block}`;
    host.append(style); document.body.append(host);
    const root = host.querySelector<HTMLElement>("[data-geometry-root]")!;
    const table = host.querySelector<HTMLTableElement>("table")!;
    const handle = host.querySelector<HTMLButtonElement>("[data-height-handle]")!;
    root.style.cssText = root.style.cssText;
    const rows = createRows(Array.from({ length: 500 }, (_, index) => ({ name: `Employee ${index + 1}`,
      profile: { score: index, choice: 1, options: [{ label: "One", value: 1 }, { label: "Two", value: 2 }], note: `Notes ${index + 1}` } })));
    const options: Options = { rows, viewport: { root, estimate: 48, overscan: 2 }, heightResize: { root, handle, min: 160, max: 800 },
      parse: { "profile.score": input => Number(input) } };
    const h: Window["geometry"] = { grid: null as unknown as GridHandle<Item>, rows, root, table, handle, host, options,
      originalRoot: root.outerHTML, originalHandle: handle.outerHTML, originalTable: table.outerHTML,
      rebind(extra = {}) { h.grid?.dispose(); h.grid = bindGrid(table, { ...options, ...extra }); },
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))),
      mounted: () => [...table.tBodies[0].rows].filter(row => !row.hasAttribute("data-row-template") && row.getAttribute("aria-hidden") !== "true"),
      field: id => h.mounted().find(row => row.getAttribute("aria-rowindex") === String(id + 2))?.querySelector<HTMLInputElement>('[data-field="name"]') ?? undefined };
    window.geometry = h; h.rebind();
  }, { modules, markup });
});

test("authored height handle exposes actual geometry and bounded native keyboard controls", async ({ page }) => {
  const handle = page.locator("[data-height-handle]");
  await expect(handle).toHaveAttribute("role", "separator");
  await expect(handle).toHaveAttribute("aria-orientation", "horizontal");
  await expect(handle).toHaveAttribute("aria-valuenow", "400");
  await handle.focus(); await handle.press("ArrowDown");
  await expect(handle).toHaveAttribute("aria-valuenow", "410");
  await handle.press("Shift+ArrowUp"); await expect(handle).toHaveAttribute("aria-valuenow", "409");
  await handle.press("Home"); await expect(handle).toHaveAttribute("aria-valuenow", "160");
  await handle.press("ArrowUp"); await expect(handle).toHaveAttribute("aria-valuenow", "160");
  await handle.press("End"); await expect(handle).toHaveAttribute("aria-valuenow", "800");
  await handle.press("ArrowDown"); await expect(handle).toHaveAttribute("aria-valuenow", "800");
  const result = await page.evaluate(() => { const h = window.geometry; return { controls: h.handle.getAttribute("aria-controls") === h.root.id,
    focused: document.activeElement === h.handle, mounted: h.mounted().length, changes: h.rows.changes().length }; });
  expect(result).toMatchObject({ controls: true, focused: true, changes: 0 }); expect(result.mounted).toBeLessThan(80);
});

test("height controls preserve modified shortcuts and blocked authored interactions", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.geometry;
    for (const modifier of ["ctrlKey", "altKey", "metaKey"]) h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", [modifier]: true, bubbles: true, cancelable: true }));
    const modified = h.root.getBoundingClientRect().height;
    h.handle.disabled = true; h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    h.handle.disabled = false; h.host.inert = true; h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    h.host.inert = false; h.handle.hidden = true; h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })); h.handle.hidden = false;
    return { modified, blocked: h.root.getBoundingClientRect().height };
  });
  expect(result).toEqual({ modified: 400, blocked: 400 });
});

test("pointer previews coalesce and commit with content-box conversion and exact priority restoration", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.geometry; h.grid.dispose();
    h.root.style.cssText = "box-sizing:content-box;height:300px!important;min-height:200px!important;max-height:700px!important;width:680px;overflow:auto;padding:10px;border:4px solid black";
    const original = h.root.getAttribute("style"); h.rebind();
    const before = h.root.getBoundingClientRect().height;
    h.handle.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 41, isPrimary: true, button: 0, clientY: 100, bubbles: true, cancelable: true }));
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 41, clientY: 120, bubbles: true, cancelable: true }));
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 41, clientY: 150, bubbles: true, cancelable: true }));
    const synchronous = h.root.getBoundingClientRect().height; await h.settle();
    const preview = h.root.getBoundingClientRect().height;
    document.dispatchEvent(new PointerEvent("pointerup", { pointerId: 41, clientY: 160, bubbles: true }));
    const committed = h.root.getBoundingClientRect().height;
    h.grid.dispose(); await h.settle();
    return { before, synchronous, preview, committed, restored: h.root.getAttribute("style") === original, handle: h.handle.outerHTML === h.originalHandle };
  });
  expect(result).toEqual({ before: 328, synchronous: 328, preview: 378, committed: 388, restored: true, handle: true });
});

test("Escape, pointer cancellation, lost capture and a second pointer leave the original drag intact", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.geometry, heights: number[] = [];
    for (const ending of ["escape", "pointercancel", "lostpointercapture"]) {
      const before = h.root.getAttribute("style");
      h.handle.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 21, isPrimary: true, button: 0, clientY: 100, bubbles: true }));
      document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 21, clientY: 180, bubbles: true })); await h.settle();
      h.handle.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 22, isPrimary: true, button: 0, clientY: 600, bubbles: true }));
      document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 22, clientY: 700, bubbles: true })); await h.settle();
      heights.push(h.root.getBoundingClientRect().height);
      if (ending === "escape") document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      else (ending === "lostpointercapture" ? h.handle : document).dispatchEvent(new PointerEvent(ending, { pointerId: 21, bubbles: true }));
      if (h.root.getAttribute("style") !== before) throw new Error("Cancelled drag changed authored height properties.");
      heights.push(h.root.getBoundingClientRect().height);
    }
    return heights;
  });
  expect(result).toEqual([480, 400, 480, 400, 480, 400]);
});

test("native captured pointer dragging commits measured height and releases capture", async ({ page }) => {
  await page.evaluate(() => { window.geometry.host.style.paddingBottom = "300px"; });
  const handle = page.locator("[data-height-handle]");
  await handle.evaluate(element => element.scrollIntoView({ block: "center" }));
  await handle.scrollIntoViewIfNeeded(); const bounds = await handle.boundingBox();
  if (!bounds) throw new Error("The native resize handle must be visible.");
  const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("The native gesture needs a measured browser viewport.");
  expect(x).toBeGreaterThan(0); expect(x).toBeLessThan(viewport.width);
  expect(y).toBeGreaterThan(0); expect(y + 110).toBeLessThan(viewport.height);
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x, y + 70, { steps: 4 }); await page.mouse.up();
  await expect(handle).toHaveAttribute("aria-valuenow", "470");
  await page.mouse.move(x, y + 110);
  await expect(handle).toHaveAttribute("aria-valuenow", "470");
});

test("a mouse movement without the primary button cancels a stranded drag and ignores its late release", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.geometry, original = h.root.getAttribute("style");
    h.handle.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 73, pointerType: "mouse", isPrimary: true, button: 0,
      buttons: 1, clientY: 100, bubbles: true }));
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 73, pointerType: "mouse", buttons: 1, clientY: 150, bubbles: true }));
    await h.settle(); const preview = h.root.getBoundingClientRect().height;
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 73, pointerType: "mouse", buttons: 0, clientY: 900, bubbles: true }));
    await h.settle(); const cancelled = h.root.getAttribute("style") === original;
    document.dispatchEvent(new PointerEvent("pointerup", { pointerId: 73, pointerType: "mouse", buttons: 0, clientY: 900, bubbles: true }));
    await h.settle();
    return { preview, cancelled, height: h.root.getBoundingClientRect().height, current: h.handle.getAttribute("aria-valuenow") };
  });
  expect(result).toEqual({ preview: 450, cancelled: true, height: 400, current: "400" });
});

test("disposal during a queued drag restores source and rejects all late pointer or keyboard writes", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.geometry;
    h.handle.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 55, isPrimary: true, button: 0, clientY: 100, bubbles: true }));
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 55, clientY: 170, bubbles: true }));
    h.grid.dispose(); const root = h.root.outerHTML, handle = h.handle.outerHTML;
    document.dispatchEvent(new PointerEvent("pointerup", { pointerId: 55, clientY: 220, bubbles: true }));
    h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true })); await h.settle(); h.grid.dispose();
    const restored = h.root.outerHTML === h.originalRoot && handle === h.originalHandle;
    const quiet = root === h.root.outerHTML && handle === h.handle.outerHTML;
    h.rebind(); return { restored, quiet, retry: h.handle.getAttribute("role") };
  });
  expect(result).toEqual({ restored: true, quiet: true, retry: "separator" });
});

test("invalid height configurations fail before markup ownership", async ({ page }) => {
  const result = await page.evaluate(async ({ grid }) => {
    const { bindGrid } = await import(grid); const h = window.geometry; h.grid.dispose();
    const original = h.host.innerHTML;
    const invalid = [ { min: 0 }, { max: Infinity }, { min: 900 }, { root: h.table }, { root: document.createElement("div") },
      { handle: Object.assign(document.createElement("button"), { type: "submit" }) },
      { handle: document.createElement("button") }, { root: h.host } ];
    const codes = invalid.map(change => { try { bindGrid(h.table, { ...h.options, heightResize: { ...h.options.heightResize!, ...change } }); return null; }
      catch (error) { return (error as { code: string }).code; } });
    return { codes, unchanged: original === h.host.innerHTML };
  }, modules);
  expect(result).toEqual({ codes: Array(8).fill("GRID_HEIGHT"), unchanged: true });
});

test("root and handle ownership cannot be shared and failure cleanup permits a retry", async ({ page }) => {
  const result = await page.evaluate(async ({ grid }) => {
    const { bindGrid } = await import(grid); const h = window.geometry;
    const second = document.createElement("table"); second.innerHTML = h.originalTable.replace(/^<table[^>]*>|<\/table>$/g, ""); h.root.append(second);
    let conflict: string | null = null;
    try { bindGrid(second, { ...h.options, viewport: undefined }); } catch (error) { conflict = (error as { code: string }).code; }
    second.remove(); h.grid.dispose(); const before = h.host.innerHTML;
    let failed: string | null = null;
    try { bindGrid(h.table, { ...h.options, onRowBind() { throw new Error("Application row failed"); } }); }
    catch (error) { failed = (error as { code: string }).code; }
    const restored = h.host.innerHTML === before; h.rebind();
    return { conflict, failed, restored, retry: h.handle.getAttribute("role") };
  }, modules);
  expect(result).toEqual({ conflict: "GRID_HEIGHT", failed: "GRID_BIND", restored: true, retry: "separator" });
});

test("hidden preparation measures when shown and external dimensions announce honest current values", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.geometry; h.grid.dispose(); h.host.hidden = true; h.rebind();
    const hidden = h.handle.hasAttribute("aria-valuenow");
    h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    const untouched = h.root.style.height === "400px";
    h.host.hidden = false; await h.settle(); const shown = h.handle.getAttribute("aria-valuenow");
    h.root.style.height = "900px"; await h.settle();
    return { hidden, untouched, shown, actual: h.handle.getAttribute("aria-valuenow"), maximum: h.handle.getAttribute("aria-valuemax") };
  });
  expect(result).toEqual({ hidden: false, untouched: true, shown: "400", actual: "900", maximum: "900" });
});

test("an unmeasurable root leaves no incomplete focusable separator and preserves authored inert state", async ({ page }) => {
  await page.evaluate(async () => { const h = window.geometry; h.root.hidden = true; await h.settle(); });
  const results = await new AxeBuilder({ page }).include("[data-geometry-fixture]").analyze();
  expect(results.violations).toEqual([]);
  const result = await page.evaluate(async () => {
    const h = window.geometry; const unavailable = h.handle.inert && !h.handle.hasAttribute("aria-valuenow");
    h.root.hidden = false; await h.settle();
    const available = !h.handle.inert && h.handle.getAttribute("aria-valuenow") === "400";
    h.grid.dispose(); h.handle.setAttribute("inert", "authored"); h.rebind();
    h.root.hidden = true; await h.settle(); h.root.hidden = false; await h.settle();
    const authored = h.handle.getAttribute("inert"); h.grid.dispose();
    return { unavailable, available, authored, restored: h.handle.getAttribute("inert") };
  });
  expect(result).toEqual({ unavailable: true, available: true, authored: "authored", restored: "authored" });
});

test("height changes retain nested drafts, focused editors and a bounded logical viewport", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.geometry; h.grid.reveal(250, { block: "center" }); await h.settle();
    const field = h.field(250)!; field.focus(); field.value = "Draft employee"; field.setSelectionRange(3, 8);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true })); await h.settle();
    h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true })); await h.settle();
    return { same: h.field(250) === field, focused: document.activeElement === field, value: field.value,
      caret: [field.selectionStart, field.selectionEnd], mounted: h.mounted().length,
      raw: h.rows.get(250)!.value.name, choice: h.rows.get(250)!.value.profile.choice };
  });
  expect(result).toMatchObject({ same: true, focused: true, value: "Draft employee", caret: [3, 8], raw: "Employee 250", choice: 1 });
  expect(result.mounted).toBeLessThan(80);
});

test("reveal start center end and nearest use sticky multi-row header and footer space", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.geometry, values: { block: string; actual: number; expected: number }[] = [];
    for (const block of ["start", "center", "end"] as const) {
      h.grid.reveal(250, { block }); await h.settle();
      const row = h.field(250)!.closest("tr")!.getBoundingClientRect();
      const top = h.table.tHead!.rows[1].cells[0].getBoundingClientRect().bottom;
      const bottom = h.table.tFoot!.rows[0].cells[0].getBoundingClientRect().top;
      values.push({ block, actual: block === "start" ? row.top : block === "end" ? row.bottom : (row.top + row.bottom) / 2,
        expected: block === "start" ? top : block === "end" ? bottom : (top + bottom) / 2 });
    }
    const scroll = h.root.scrollTop; h.grid.reveal(250); await h.settle();
    return { values, nearest: Math.abs(h.root.scrollTop - scroll), mounted: h.mounted().length };
  });
  for (const value of result.values) expect(Math.abs(value.actual - value.expected), value.block).toBeLessThan(2);
  expect(result.nearest).toBeLessThan(2); expect(result.mounted).toBeLessThan(80);
});

test("last-row reveal stays above a sticky footer after height and managed column changes", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.geometry; h.grid.reveal(500, { block: "end" }); await h.settle();
    h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    h.grid.setColumns(h.grid.columns().map(column => ({ ...column, hidden: column.key === "score" }))); await h.settle();
    h.grid.reveal(500, { block: "end" }); await h.settle();
    const row = h.field(500)!.closest("tr")!.getBoundingClientRect();
    const bottom = h.table.tFoot!.rows[0].cells[0].getBoundingClientRect().top;
    return { delta: Math.abs(row.bottom - bottom), mounted: h.mounted().length, count: h.table.getAttribute("aria-rowcount"),
      footer: h.table.tFoot!.rows[0].cells[0].colSpan };
  });
  expect(result).toMatchObject({ count: "504", footer: 2 }); expect(result.delta).toBeLessThan(2); expect(result.mounted).toBeLessThan(80);
});

test("explicit alignment survives remeasurement of a cached row after virtual remount", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.geometry; h.grid.reveal(250, { block: "center" }); await h.settle();
    const style = document.createElement("style"); h.host.append(style);
    const positions: { block: string; delta: number }[] = [];
    for (const [block, height] of [["center", 200], ["end", 240]] as const) {
      h.grid.reveal(1); await h.settle();
      if (h.field(250)) throw new Error("The measured row must depart before its authored height changes.");
      style.textContent = `[data-geometry-table] tbody tr[aria-rowindex="252"]{height:${height}px!important}`;
      h.grid.reveal(250, { block }); await h.settle();
      const row = h.field(250)!.closest("tr")!.getBoundingClientRect();
      const top = h.table.tHead!.rows[1].cells[0].getBoundingClientRect().bottom;
      const bottom = h.table.tFoot!.rows[0].cells[0].getBoundingClientRect().top;
      positions.push({ block, delta: Math.abs(block === "center" ? (row.top + row.bottom - top - bottom) / 2 : row.bottom - bottom) });
    }
    style.textContent = '[data-geometry-table] tbody tr[aria-rowindex="252"]{height:200px!important}';
    h.grid.reveal(250, { block: "end" }); await h.settle();
    positions.push({ block: "mounted end", delta: Math.abs(h.field(250)!.closest("tr")!.getBoundingClientRect().bottom -
      h.table.tFoot!.rows[0].cells[0].getBoundingClientRect().top) });
    return positions;
  });
  for (const position of result) expect(position.delta, position.block).toBeLessThan(2);
});

test("multi-tr oversized records use one identity and nearest alignment keeps their start visible", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.geometry; h.grid.dispose();
    h.table.tBodies[0].setAttribute("data-row-template", ""); h.table.tBodies[0].rows[0].removeAttribute("data-row-template");
    h.table.tBodies[0].insertAdjacentHTML("beforeend", '<tr><td colspan="3" data-columns="person score choice" style="height:240px"><span data-field="profile.note"></span></td></tr>');
    h.rebind({ viewport: { root: h.root, estimate: 288, overscan: 1 } });
    h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    h.grid.reveal(250); await h.settle();
    const row = h.mounted().find(row => row.getAttribute("aria-rowindex") === "501")!;
    return { delta: Math.abs(row.getBoundingClientRect().top - h.table.tHead!.rows[1].cells[0].getBoundingClientRect().bottom),
      note: h.rows.get(250)!.value.profile.note, count: h.table.getAttribute("aria-rowcount"), mounted: h.mounted().length };
  });
  expect(result).toMatchObject({ note: "Notes 250", count: "1004" }); expect(result.delta).toBeLessThan(2); expect(result.mounted).toBeLessThan(20);
});

test("nonvirtual height resizing and all reveal alignments preserve logical rows and selection", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.geometry; h.rebind({ viewport: undefined }); h.grid.select(1); h.root.focus({ preventScroll: true });
    h.root.style.scrollPaddingTop = "64px"; h.root.style.scrollPaddingBottom = "64px";
    const positions: { actual: number; expected: number }[] = [];
    for (const block of ["start", "center", "end"] as const) {
      h.grid.reveal(250, { block }); await h.settle();
      const row = h.mounted()[249].getBoundingClientRect(), top = h.table.tHead!.rows[1].cells[0].getBoundingClientRect().bottom,
        bottom = h.table.tFoot!.rows[0].cells[0].getBoundingClientRect().top;
      positions.push({ actual: block === "start" ? row.top : block === "end" ? row.bottom : (row.top + row.bottom) / 2,
        expected: block === "start" ? top : block === "end" ? bottom : (top + bottom) / 2 });
    }
    const prior = h.root.scrollTop; h.grid.reveal(250); await h.settle();
    const nearest = Math.abs(h.root.scrollTop - prior);
    h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true })); await h.settle();
    return { mounted: h.mounted().length, height: h.root.getBoundingClientRect().height, selected: h.grid.selected(),
      focused: document.activeElement === h.root, aria: h.table.getAttribute("aria-rowcount"), positions, nearest };
  });
  expect(result).toMatchObject({ mounted: 500, height: 160, selected: 1, focused: true, aria: null });
  for (const position of result.positions) expect(Math.abs(position.actual - position.expected)).toBeLessThan(2);
  expect(result.nearest).toBeLessThan(2);
});

test("independent MDI height handles keep unique ARIA references and accessible controls", async ({ page }) => {
  await page.evaluate(async ({ grid }) => {
    const { bindGrid } = await import(grid); const h = window.geometry;
    const root = h.root.cloneNode(false) as HTMLElement; root.removeAttribute("id"); root.setAttribute("aria-label", "Second employee grid");
    const table = document.createElement("table"); table.innerHTML = h.originalTable.replace(/^<table[^>]*>|<\/table>$/g, ""); root.append(table);
    const handle = document.createElement("button"); handle.type = "button"; handle.setAttribute("aria-label", "Resize second employee grid height"); handle.textContent = "Resize second height";
    h.host.append(root, handle);
    const second = bindGrid(table, { ...h.options, viewport: { root, estimate: 48 }, heightResize: { root, handle, min: 160, max: 800 } });
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    if (root.id === h.root.id || handle.getAttribute("aria-controls") !== root.id || h.root.getBoundingClientRect().height !== 400) throw new Error("Height ownership crossed MDI instances.");
    h.cleanupSecond = () => { second.dispose(); root.remove(); handle.remove(); };
    const ids = [...h.host.querySelectorAll("[id]")].map(element => element.id);
    if (new Set(ids).size !== ids.length) throw new Error("MDI geometry must not repeat DOM ids.");
  }, modules);
  const results = await new AxeBuilder({ page }).include("[data-geometry-fixture]").analyze();
  expect(results.violations).toEqual([]);
  await page.evaluate(() => window.geometry.cleanupSecond?.());
});
