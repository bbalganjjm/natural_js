// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Rows, RowsEvent } from "../../src/data/index.js";
import type { GridHandle } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = {
  key: number; department: string | number | boolean | null; team: string;
  profile: { name: string; choice: number; notes: string; options: { label: string; value: number }[] };
};
type Options = Parameters<typeof bindGrid<Item>>[1];
declare global {
  interface Window {
    rowBlocks: {
      grid: GridHandle<Item>; rows: Rows<Item>; table: HTMLTableElement; root: HTMLElement;
      original: string; events: RowsEvent[]; actions: number[]; size: number;
      reset: (count?: number, extra?: Partial<Options>, size?: number) => void;
      main: (id: number) => HTMLTableRowElement | null;
      block: (id: number) => HTMLTableRowElement[];
      field: <E extends HTMLElement = HTMLElement>(id: number, name: string) => E | null;
      mounted: () => HTMLTableRowElement[];
      settle: () => Promise<void>;
    };
  }
}
const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts"),
  form: source("../../src/ui/form.ts"), list: source("../../src/ui/list.ts") };
const markup = (size = 2) => `<caption>Row block assignments</caption>
  <colgroup span="3"></colgroup><colgroup span="2"></colgroup>
  <thead><tr><th scope="col" data-column="actions" rowspan="2">Record</th>
    <th scope="col" data-column="department" rowspan="2">Department</th><th scope="col" data-column="team" rowspan="2">Team</th>
    <th scope="colgroup" data-columns="person choice" colspan="2">Assignment</th></tr>
    <tr><th scope="col" data-column="person">Name and notes</th><th scope="col" data-column="choice">Choice</th></tr></thead>
  <tbody data-row-template><tr data-block-main>
    <th scope="row" data-column="actions" rowspan="${size === 3 ? 0 : size}"><button type="button" data-select-row>Select <span data-field="key"></span></button></th>
    <td data-column="department" data-merge="department" rowspan="${size}"><span data-field="department"></span></td>
    <td data-column="team" data-merge="team" rowspan="${size}"><span data-field="team"></span></td>
    <td data-column="person"><label>Name <input data-field="profile.name" required></label></td>
    <td data-column="choice"><label>Choice <select data-field="profile.choice" data-options="profile.options"
      data-option-label="label" data-option-value="value"></select></label></td></tr>
    <tr data-block-detail><td data-columns="person choice" colspan="2"><label>Notes <textarea data-field="profile.notes"></textarea></label>
      <output data-error-for="profile.name"></output><button type="button" data-row-action="inspect">Inspect record</button>
      <button type="button" data-select-row>Select full record</button><label>Check record <input type="checkbox" data-check-row></label></td></tr>
    ${size === 3 ? '<tr data-block-extra><td data-columns="person choice" colspan="2"><small>Authored supplemental content</small></td></tr>' : ""}</tbody>
  <tfoot><tr><td data-columns="actions department team person choice" colspan="5">Application summary</td></tr></tfoot>`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, layouts }) => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const section = document.createElement("section");
    section.innerHTML = `<h1>Authored row blocks</h1><div data-block-root role="region" aria-label="Assignments" tabindex="0"
      style="height:400px;width:900px;overflow:auto;overflow-anchor:none"><table data-block-table></table></div>`;
    const style = document.createElement("style");
    style.textContent = `[data-block-table]{border-collapse:collapse;table-layout:fixed;width:880px;font:14px/20px sans-serif}
      [data-block-table] th,[data-block-table] td{padding:2px;vertical-align:top}
      [data-block-table] tbody tr:not([aria-hidden="true"]){height:44px}
      [data-block-table] input:not([type="checkbox"]),[data-block-table] textarea{width:100px}
      [data-block-table] textarea{height:25px} [data-block-table] output:empty{display:none}`;
    section.append(style); document.body.append(section);
    const root = section.querySelector<HTMLElement>("[data-block-root]")!;
    const table = section.querySelector<HTMLTableElement>("table")!;
    const fixture: Window["rowBlocks"] = {
      grid: null as unknown as GridHandle<Item>, rows: null as unknown as Rows<Item>, table, root,
      original: "", events: [], actions: [], size: 2,
      mounted: () => [...table.tBodies[0].rows].filter(row => row.getAttribute("aria-hidden") !== "true"),
      main: id => [...table.querySelectorAll<HTMLTableRowElement>("[data-block-main]")]
        .find(row => row.querySelector('[data-field="key"]')?.textContent === String(id)) ?? null,
      block(id) {
        const result: HTMLTableRowElement[] = []; let row = fixture.main(id);
        for (let index = 0; row && index < fixture.size; index++) { result.push(row); row = row.nextElementSibling as HTMLTableRowElement | null; }
        return result;
      },
      field<E extends HTMLElement = HTMLElement>(id: number, name: string): E | null {
        return fixture.block(id).map(row => row.querySelector<E>(`[data-field="${name}"]`)).find(Boolean) ?? null;
      },
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))),
      reset(count = 4, extra: Partial<Options> = {}, size = 2) {
        fixture.grid?.dispose(); fixture.rows?.dispose(); root.scrollTop = 0;
        table.innerHTML = layouts[size === 3 ? 1 : 0]; fixture.size = size; fixture.original = table.outerHTML;
        fixture.events = []; fixture.actions = [];
        fixture.rows = createRows(Array.from({ length: count }, (_, index) => ({ key: index + 1,
          department: count > 4 ? "Engineering" : index < 2 ? "A" : "B", team: count > 4 || index < 3 ? "Blue" : "Green",
          profile: { name: `Employee ${index + 1}`, choice: 1, notes: `Notes ${index + 1}`,
            options: [{ label: "One", value: 1 }, { label: "Two", value: 2 }] } })));
        fixture.grid = bindGrid(table, { rows: fixture.rows, paste: true, multiple: true,
          columns: ["actions", "department", "team", "person", "choice"].map(key => ({ key })),
          onRowAction: ({ id }: { id: number }) => fixture.actions.push(id), ...extra });
        fixture.rows.subscribe((event: RowsEvent) => fixture.events.push(event));
      }
    };
    window.rowBlocks = fixture; fixture.reset();
  }, { modules, layouts: [markup(), markup(3)] });
});

test("two authored block layouts keep native spans, nested options and exact teardown", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowBlocks;
    const first = { bodies: h.table.tBodies.length, records: h.table.querySelectorAll("[data-block-main]").length,
      rows: h.table.tBodies[0].rows.length, notes: h.field<HTMLTextAreaElement>(2, "profile.notes")!.value,
      choice: h.field<HTMLSelectElement>(2, "profile.choice")!.options[1].text, ids: [...h.table.querySelectorAll("[id]")].map(node => node.id) };
    h.grid.dispose(); const restored = h.table.outerHTML === h.original;
    h.reset(4, {}, 3); const supplemental = h.table.querySelectorAll("[data-block-extra] small").length;
    const spans = [...h.table.querySelectorAll<HTMLTableCellElement>('tbody [data-column="actions"]')].map(cell => cell.rowSpan);
    const original = h.original; h.grid.dispose();
    return { first, restored, supplemental, spans, secondRestored: h.table.outerHTML === original };
  });
  expect(result.first).toMatchObject({ bodies: 1, records: 4, rows: 8, notes: "Notes 2", choice: "Two" });
  expect(new Set(result.first.ids).size).toBe(result.first.ids.length);
  expect(result).toMatchObject({ restored: true, supplemental: 4, spans: [3, 3, 3, 3], secondRestored: true });
});

test("independent instances keep unique cross-row validation references and accessible native markup", async ({ page }) => {
  const result = await page.evaluate(async ({ modules, layout }) => {
    const { bindGrid } = await import(modules.grid); const h = window.rowBlocks;
    const second = document.createElement("table"); second.dataset.blockTable = "";
    second.innerHTML = layout; h.root.after(second); const grid = bindGrid(second, { rows: h.rows, onRowAction: () => {} });
    const name = h.field<HTMLInputElement>(1, "profile.name")!;
    name.value = ""; name.dispatchEvent(new Event("input", { bubbles: true })); h.grid.validate(1);
    const ids = [...document.querySelectorAll("[id]")].map(node => node.id);
    const references = (name.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    const connected = references.length > 0 && references.every(id => !!document.getElementById(id));
    const sameRow = references.every(id => h.block(1).some(row => row.contains(document.getElementById(id))));
    grid.dispose(); second.remove(); return { unique: ids.length === new Set(ids).size, connected, sameRow };
  }, { modules, layout: markup() });
  expect(result).toEqual({ unique: true, connected: true, sameRow: true });
  const accessibility = await new AxeBuilder({ page }).include("[data-block-table]").analyze();
  expect(accessibility.violations).toEqual([]);
});

test("secondary row actions and edits share one identity and preserve focused drafts on moves", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowBlocks; const block = h.block(2);
    block[1].querySelector<HTMLButtonElement>("[data-row-action]")!.click();
    block[1].querySelector<HTMLButtonElement>("[data-select-row]")!.click();
    block[1].querySelector<HTMLInputElement>("[data-check-row]")!.click();
    const name = h.field<HTMLInputElement>(2, "profile.name")!;
    name.value = ""; name.dispatchEvent(new Event("input", { bubbles: true })); h.grid.validate(2);
    const notes = h.field<HTMLTextAreaElement>(2, "profile.notes")!;
    notes.value = "Draft notes"; notes.dispatchEvent(new Event("input", { bubbles: true }));
    notes.focus(); notes.setSelectionRange(1, 5);
    const errors = block[1].querySelector("output")!.textContent; let blurs = 0;
    notes.addEventListener("blur", () => blurs++);
    const observer = new MutationObserver(() => {}); observer.observe(h.table.tBodies[0], { childList: true });
    h.rows.move(2, 1);
    const detached = observer.takeRecords().some(record => [...record.removedNodes].includes(block[1])); observer.disconnect();
    return { actions: h.actions, selected: h.grid.selected(), checked: h.grid.checkedIds(),
      same: h.field(2, "profile.notes") === notes, focused: document.activeElement === notes,
      caret: [notes.selectionStart, notes.selectionEnd], detached, blurs, draft: name.value,
      errors: !!errors && block[1].querySelector("output")!.textContent === errors,
      stored: h.rows.get(2)!.value.profile.name, order: [...h.table.querySelectorAll('[data-field="key"]')].map(node => node.textContent) };
  });
  expect(result).toEqual({ actions: [2], selected: 2, checked: [2], same: true, focused: true, caret: [1, 5],
    detached: false, blurs: 0, draft: "", errors: true, stored: "Employee 2", order: ["2", "1", "3", "4"] });
});

test("column changes update every physical row without replacing nested fields", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowBlocks; const notes = h.field<HTMLTextAreaElement>(2, "profile.notes")!;
    notes.focus(); notes.setSelectionRange(1, 4);
    const columns = h.grid.columns();
    h.grid.setColumns([columns[0], columns[1], columns[2], columns[4], columns[3]]);
    const order = [...h.main(2)!.cells].filter(cell => cell.getAttribute("data-column") === "choice" || cell.getAttribute("data-column") === "person")
      .map(cell => cell.getAttribute("data-column"));
    h.grid.setColumns(h.grid.columns().map(column => ({ ...column, hidden: column.key === "choice" })));
    const span = h.block(2)[1].cells[0].colSpan;
    h.grid.setColumns(h.grid.columns().map(({ key, width }) => ({ key, width })));
    const before = h.table.outerHTML; let rejected = false;
    const next = h.grid.columns();
    try { h.grid.setColumns([next[0], next[3], next[1], next[2], next[4]]); } catch { rejected = true; }
    return { order, span, restoredSpan: h.block(2)[1].cells[0].colSpan, same: h.field(2, "profile.notes") === notes,
      focus: document.activeElement === notes, caret: [notes.selectionStart, notes.selectionEnd], rejected, unchanged: h.table.outerHTML === before };
  });
  expect(result).toEqual({ order: ["choice", "person"], span: 1, restoredSpan: 2, same: true, focus: true,
    caret: [1, 4], rejected: true, unchanged: true });
});

test("native merges follow raw hierarchical values and projected page boundaries", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowBlocks;
    const cells = () => [...h.table.querySelectorAll<HTMLTableRowElement>("[data-block-main]")].map(row => ({
      key: row.querySelector('[data-field="key"]')!.textContent,
      cells: ["department", "team"].map(key => {
        const cell = row.querySelector<HTMLTableCellElement>(`[data-column="${key}"]`)!;
        return { span: cell.rowSpan, visible: getComputedStyle(cell).display !== "none" };
      }) }));
    const initial = cells(); h.rows.set(2, "department", "B"); const edited = cells();
    h.grid.setSort((a, b) => b.key - a.key); h.grid.setFilter(row => row.key >= 2);
    h.grid.setPage({ page: 1, size: 2 }); const firstPage = cells(); h.grid.setPage({ page: 2, size: 2 }); const secondPage = cells();
    return { initial, edited, firstPage, secondPage };
  });
  expect(result.initial.map(row => row.cells)).toEqual([
    [{ span: 4, visible: true }, { span: 4, visible: true }],
    [{ span: 2, visible: false }, { span: 2, visible: false }],
    [{ span: 4, visible: true }, { span: 2, visible: true }],
    [{ span: 2, visible: false }, { span: 2, visible: true }]
  ]);
  expect(result.edited[1].cells).toEqual([{ span: 2, visible: true }, { span: 2, visible: true }]);
  expect(result.edited[2].cells).toEqual([{ span: 4, visible: true }, { span: 2, visible: true }]);
  expect(result.firstPage.map(row => row.key)).toEqual(["4", "3"]);
  expect(result.firstPage[0].cells).toEqual([{ span: 4, visible: true }, { span: 2, visible: true }]);
  expect(result.secondPage).toEqual([{ key: "2", cells: [{ span: 2, visible: true }, { span: 2, visible: true }] }]);
});

test("equal display strings cannot merge distinct raw values", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowBlocks;
    h.rows.set(1, "department", 1); h.rows.set(2, "department", "1");
    h.rows.set(3, "department", null); h.rows.set(4, "department", "");
    return [...h.table.querySelectorAll<HTMLTableCellElement>('tbody [data-merge]')].map(cell => ({
      span: cell.rowSpan, visible: getComputedStyle(cell).display !== "none" }));
  });
  expect(result).toEqual(Array.from({ length: 8 }, () => ({ span: 2, visible: true })));
});

test("merging never hides the currently focused display field", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowBlocks; h.rows.set(2, "department", "Other");
    const field = h.field(2, "department")!; field.focus(); let blurs = 0;
    field.addEventListener("blur", () => blurs++); h.rows.set(2, "department", "A");
    const cell = field.closest<HTMLTableCellElement>("td")!;
    return { focused: document.activeElement === field, same: h.field(2, "department") === field,
      visible: getComputedStyle(cell).display !== "none", span: cell.rowSpan,
      previousSpan: h.main(1)!.querySelector<HTMLTableCellElement>('[data-column="department"]')!.rowSpan, blurs };
  });
  expect(result).toEqual({ focused: true, same: true, visible: true, span: 2, previousSpan: 2, blurs: 0 });
});

test("paste retains logical fields hidden only by merging and uses row-major nested order", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowBlocks;
    const followerHidden = getComputedStyle(h.field(2, "department")!.closest("td")!).display === "none";
    const pasted = h.grid.paste("New\tBlue\tEdited\t2\tReplacement notes", { id: 2, field: "department" });
    const row = h.rows.get(2)!.value; const events = h.events.map(event => event.type);
    const before = JSON.stringify(h.rows.entries()); h.events.length = 0;
    const rejected = h.grid.paste("\t1\tInvalid notes", { id: 2, field: "profile.name" });
    return { followerHidden, valid: pasted.valid, row, events, rejected: rejected.valid,
      unchanged: JSON.stringify(h.rows.entries()) === before, failureEvents: h.events.length,
      select: h.field<HTMLSelectElement>(2, "profile.choice")!.value };
  });
  expect(result).toMatchObject({ followerHidden: true, valid: true, row: { department: "New", team: "Blue",
    profile: { name: "Edited", choice: 2, notes: "Replacement notes" } }, events: ["setMany"],
    rejected: false, unchanged: true, failureEvents: 0, select: "2" });
});

test("virtual blocks stay bounded with physical native row positions and far reveal", async ({ page }) => {
  await page.evaluate(async () => { const h = window.rowBlocks; h.reset(5000, { viewport: { root: h.root, estimate: 88, overscan: 3 } }); await h.settle(); });
  await expect(page.locator("[data-block-table]")).toHaveAttribute("aria-rowcount", "10003");
  await expect(page.locator("[data-block-main]").first()).toHaveAttribute("aria-rowindex", "3");
  await expect(page.locator("[data-block-detail]").first()).toHaveAttribute("aria-rowindex", "4");
  for (const fraction of [1, .2, .8, 0]) {
    const state = await page.evaluate(async fraction => {
      const h = window.rowBlocks; h.root.scrollTop = h.root.scrollHeight * fraction;
      h.root.dispatchEvent(new Event("scroll")); await h.settle();
      const rows = h.mounted(); return { count: rows.length, blocks: rows.length / h.size,
        complete: rows.every((row, index) => row.hasAttribute(index % h.size ? "data-block-detail" : "data-block-main")),
        largestSpan: Math.max(...[...h.table.querySelectorAll<HTMLTableCellElement>("tbody [data-merge]")].map(cell => cell.rowSpan)) };
    }, fraction);
    expect(state.count).toBeLessThan(160); expect(state.complete).toBe(true); expect(state.largestSpan).toBeLessThanOrEqual(state.blocks * 2);
  }
  await page.evaluate(() => window.rowBlocks.grid.reveal(5000));
  await expect.poll(() => page.evaluate(() => window.rowBlocks.main(5000)?.getAttribute("aria-rowindex"))).toBe("10001");
  expect(await page.evaluate(() => window.rowBlocks.block(5000)[1].getAttribute("aria-rowindex"))).toBe("10002");
  await expect(page.locator("[data-block-table] tfoot tr")).toHaveAttribute("aria-rowindex", "10003");
});

test("a focused secondary row pins its complete block while offscreen paste stays logical", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.rowBlocks; h.reset(5000, { viewport: { root: h.root, estimate: 88, overscan: 3 } }); await h.settle();
    const block = h.block(1); const notes = h.field<HTMLTextAreaElement>(1, "profile.notes")!;
    notes.value = "Retained draft"; notes.dispatchEvent(new Event("input", { bubbles: true }));
    notes.focus(); notes.setSelectionRange(2, 7); let blurs = 0; notes.addEventListener("blur", () => blurs++);
    h.root.scrollTop = 250000; h.root.dispatchEvent(new Event("scroll")); await h.settle();
    const offscreen = h.main(2500) === null;
    const pasted = h.grid.paste("Updated\t2\tOffscreen notes", { id: 2500, field: "profile.name" });
    return { offscreen, valid: pasted.valid, stored: h.rows.get(2500)!.value.profile,
      complete: block.every(row => row.isConnected), same: h.field(1, "profile.notes") === notes,
      draft: notes.value, focused: document.activeElement === notes, caret: [notes.selectionStart, notes.selectionEnd],
      blurs, count: h.mounted().length, events: h.events.map(event => event.type),
      mergeWithinBlock: block[0].querySelector<HTMLTableCellElement>('[data-column="department"]')!.rowSpan === 2 };
  });
  expect(result).toMatchObject({ offscreen: true, valid: true, stored: { name: "Updated", choice: 2, notes: "Offscreen notes" },
    complete: true, same: true, draft: "Retained draft", focused: true, caret: [2, 7], blurs: 0,
    events: ["setMany"], mergeWithinBlock: true });
  expect(result.count).toBeLessThan(164);
});

test("invalid block and merge declarations fail before changing authored HTML or ownership", async ({ page }) => {
  const result = await page.evaluate(async ({ modules, layout }) => {
    const { bindGrid } = await import(modules.grid); const { createRows } = await import(modules.data);
    const attempts = [
      layout.replace("<tr data-block-main>", "<tr data-block-main data-row-template>"),
      layout.replace(/<tbody data-row-template>[\s\S]*?<\/tbody>/, "<tbody data-row-template></tbody>"),
      layout.replace('scope="row" data-column="actions" rowspan="2"', 'scope="row" data-column="actions" rowspan="3"'),
      layout.replace("<textarea data-field", '<textarea id="repeated-notes" data-field'),
      layout.replace('<span data-field="department"></span>', '<input aria-label="Invalid merge input" data-field="department">'),
      layout.replace('data-merge="department" rowspan="2"', 'data-merge="department" rowspan="1"'),
      layout.replace('<span data-field="department"></span>', '<audio controls aria-label="Record audio"></audio>'),
      layout.replace('<span data-field="department"></span>', '<iframe title="Record frame" src="about:blank"></iframe>'),
      layout.replace('<span data-field="department"></span>', '<video controls aria-label="Record video"></video>')
    ];
    return attempts.map(markup => {
      const table = document.createElement("table"); table.innerHTML = markup; document.body.append(table);
      const rows = createRows([{ key: 1, department: "A", team: "Blue", profile: { name: "Ada", choice: 1, notes: "", options: [{ label: "One", value: 1 }] } }]);
      const before = table.outerHTML; let code = "none";
      try { bindGrid(table, { rows, onRowAction: () => {} }).dispose(); } catch (cause) { code = (cause as { code: string }).code; }
      const unchanged = table.outerHTML === before; table.innerHTML = layout;
      let reusable = true; try { bindGrid(table, { rows, onRowAction: () => {} }).dispose(); } catch { reusable = false; }
      rows.dispose(); table.remove(); return { code, unchanged, reusable };
    });
  }, { modules, layout: markup() });
  for (const item of result) {
    expect(item.code).toMatch(/^(GRID_|DUPLICATE_ID$)/);
    expect(item).toMatchObject({ unchanged: true, reusable: true });
  }
  expect(result[3].code).toBe("DUPLICATE_ID");
});

test("a fully merged bare viewport preserves measurable rows and exact authored styles", async ({ page }) => {
  const result = await page.evaluate(async ({ modules }) => {
    const { bindGrid } = await import(modules.grid); const { createRows } = await import(modules.data);
    const root = document.createElement("div"); root.style.cssText = "height:300px;width:400px;overflow:auto";
    root.innerHTML = `<table style="border-collapse:collapse;width:380px"><caption>Bare merge rows</caption>
      <thead><tr><th scope="col">Group</th></tr></thead><tbody><tr data-row-template style="height:23px">
      <td data-merge="name"><span data-field="name"></span></td></tr></tbody></table>`;
    document.body.append(root); const table = root.querySelector("table")!; const original = table.outerHTML;
    const rows = createRows(Array.from({ length: 5000 }, () => ({ name: "Same value" })));
    const grid = bindGrid(table, { rows, viewport: { root, estimate: 23, overscan: 3 } });
    const settle = window.rowBlocks.settle; await settle();
    const mounted = () => [...table.tBodies[0].rows].filter(row => row.getAttribute("aria-hidden") !== "true");
    const first = mounted(); const coverage = first.reduce((total, row) => total + row.getBoundingClientRect().height, 0);
    const measurable = first.every(row => row.getBoundingClientRect().height >= 22);
    grid.reveal(5000); await settle(); const last = mounted();
    const revealed = last.some(row => row.getAttribute("aria-rowindex") === "5001");
    grid.setPage({ page: 2, size: 100 }); await settle(); const pageLeader = mounted()[0];
    const pageSpan = pageLeader.cells[0].rowSpan; const pageVisible = getComputedStyle(pageLeader.cells[0]).display !== "none";
    grid.dispose(); const restored = table.outerHTML === original; rows.dispose(); root.remove();
    return { measurable, coverage, firstCount: first.length, lastCount: last.length, revealed, pageSpan, pageVisible, restored };
  }, { modules });
  expect(result.measurable).toBe(true); expect(result.coverage).toBeGreaterThanOrEqual(250);
  expect(result.firstCount).toBeLessThan(80); expect(result.lastCount).toBeLessThan(80);
  expect(result).toMatchObject({ revealed: true, pageVisible: true, restored: true });
  expect(result.pageSpan).toBeLessThan(80);
});

test("record blocks share nested values and stable identities with Form and List", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ bindForm }, { bindList }] = await Promise.all([import(modules.form), import(modules.list)]);
    const h = window.rowBlocks;
    const section = document.createElement("section");
    section.innerHTML = `<form><label>Detail notes <textarea data-field="profile.notes"></textarea></label></form>
      <ol><li data-row-template><span data-field="key"></span>: <span data-field="profile.notes"></span></li></ol>`;
    document.body.append(section);
    const form = bindForm(section.querySelector("form")!, { rows: h.rows }); form.bind(2);
    const list = bindList(section.querySelector("ol")!, { rows: h.rows });
    const editor = h.field<HTMLTextAreaElement>(2, "profile.notes")!;
    editor.value = "Grid notes"; editor.dispatchEvent(new Event("change", { bubbles: true }));
    const detail = section.querySelector<HTMLTextAreaElement>("textarea")!;
    const shared = detail.value === "Grid notes" && section.querySelectorAll("li")[1].textContent === "2: Grid notes";
    h.rows.move(2, 1);
    detail.value = "Detail notes"; detail.dispatchEvent(new Event("change", { bubbles: true }));
    const stable = h.field(2, "profile.notes") === editor && editor.value === "Detail notes" &&
      section.querySelector("li")!.textContent === "2: Detail notes";
    form.dispose(); list.dispose(); section.remove();
    return { shared, stable, stored: h.rows.get(2)!.value.profile.notes };
  }, modules);
  expect(result).toEqual({ shared: true, stable: true, stored: "Detail notes" });
});

test("scalar merge validation is atomic and direct cell fields retain column ownership", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ bindGrid }, { createRows }] = await Promise.all([import(modules.grid), import(modules.data)]);
    const table = document.createElement("table");
    table.innerHTML = `<thead><tr><th scope="col" data-column="group">Group</th><th scope="col" data-column="name">Name</th></tr></thead>
      <tbody><tr data-row-template><td data-column="group" data-merge="group" data-field="group"></td><td data-column="name" data-field="name"></td></tr></tbody>`;
    document.body.append(table); const original = table.outerHTML;
    const rows = createRows([{ group: { invalid: true }, name: "One" }, { group: "A", name: "Two" }]);
    let code = "none";
    try { bindGrid(table, { rows }); } catch (cause) { code = (cause as { code: string }).code; }
    const unchanged = table.outerHTML === original;
    rows.replace([{ group: "A", name: "One" }, { group: "A", name: "Two" }]);
    const grid = bindGrid(table, { rows, columns: [{ key: "group" }, { key: "name" }], paste: true });
    const first = table.tBodies[0].rows[0].cells[0]; const second = table.tBodies[0].rows[1].cells[0];
    const initial = first.rowSpan === 2 && second.style.display === "none";
    grid.setColumns(grid.columns().map(column => ({ ...column, hidden: column.key === "group" })));
    const hidden = first.hidden && second.hidden && first.rowSpan === 1;
    grid.setColumns(grid.columns().map(column => ({ ...column, hidden: false })));
    const restoredMerge = first.rowSpan === 2 && !first.hidden && second.style.display === "none";
    grid.dispose(); const restored = table.outerHTML === original; rows.dispose(); table.remove();
    return { code, unchanged, initial, hidden, restoredMerge, restored };
  }, modules);
  expect(result).toEqual({ code: "GRID_MERGE", unchanged: true, initial: true, hidden: true, restoredMerge: true, restored: true });
});

test("hidden boundary rows remain in indivisible blocks without inflating measured height", async ({ page }) => {
  const result = await page.evaluate(async ({ modules }) => {
    const { bindGrid } = await import(modules.grid); const { createRows } = await import(modules.data);
    const root = document.createElement("div"); root.style.cssText = "height:300px;width:400px;overflow:auto";
    root.innerHTML = `<table style="border-collapse:collapse;width:380px"><caption>Hidden boundary rows</caption>
      <thead><tr><th scope="col">Employee</th></tr></thead><tbody data-row-template>
      <tr style="display:none"><td>Authored hidden prefix</td></tr>
      <tr style="height:24px"><td><span data-field="name"></span></td></tr>
      <tr hidden><td>Authored hidden suffix</td></tr></tbody></table>`;
    document.body.append(root); const table = root.querySelector("table")!; const original = table.outerHTML;
    const rows = createRows(Array.from({ length: 5000 }, (_, index) => ({ name: `Employee ${index + 1}` })));
    const grid = bindGrid(table, { rows, viewport: { root, estimate: 24, overscan: 3 } }); await window.rowBlocks.settle();
    const mounted = () => [...table.tBodies[0].rows].filter(row => row.getAttribute("aria-hidden") !== "true");
    const first = mounted(); const coverage = first.reduce((total, row) => total + row.getBoundingClientRect().height, 0);
    const hidden = first.filter((_, index) => index % 3 !== 1).every(row => row.getBoundingClientRect().height === 0);
    grid.reveal(5000); await window.rowBlocks.settle();
    const last = mounted(); const target = last.find(row => row.textContent === "Employee 5000");
    const count = table.getAttribute("aria-rowcount"); const index = target?.getAttribute("aria-rowindex");
    grid.dispose(); const restored = table.outerHTML === original; rows.dispose(); root.remove();
    return { firstCount: first.length, lastCount: last.length, complete: first.length % 3 === 0 && last.length % 3 === 0,
      coverage, hidden, count, index, restored };
  }, { modules });
  expect(result).toMatchObject({ complete: true, hidden: true, count: "15001", index: "15000", restored: true });
  expect(result.coverage).toBeGreaterThanOrEqual(250);
  expect(result.firstCount).toBeLessThan(240); expect(result.lastCount).toBeLessThan(240);
});
