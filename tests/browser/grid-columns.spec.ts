import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { GridColumn, GridHandle } from "../../src/ui/index.js";
import type { Rows } from "../../src/data/index.js";

type Employee = {
  name: string;
  profile: { team: string };
  choice: number;
  options: { label: string; code: number }[];
  salary: number;
};

declare global {
  interface Window {
    columnFixture: {
      grid: GridHandle<Employee>;
      rows: Rows<Employee>;
      table: HTMLTableElement;
      original: string;
      events: { columns: readonly GridColumn[]; type: string | null }[];
      storeEvents: number;
      input: HTMLInputElement;
      nameHeader: HTMLTableCellElement;
      resize: HTMLButtonElement;
    };
  }
}

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts") };
const markup = `<caption>Assignments</caption>
  <colgroup span="1"></colgroup><colgroup span="2"></colgroup><colgroup><col style="width:160px"></colgroup>
  <thead><tr><th scope="col" data-column="name" rowspan="2">Name</th>
    <th scope="colgroup" data-columns="team choice" colspan="2">Assignment</th>
    <th scope="col" data-column="salary" rowspan="2">Salary</th></tr>
    <tr><th scope="col" data-column="team">Team
      <button type="button" data-resize-column="team" aria-label="Resize Team column">Resize</button></th>
      <th scope="col" data-column="choice">Choice</th></tr></thead>
  <tbody><tr data-row-template><th scope="row" data-column="name"><button type="button" data-select-row><span data-field="name"></span></button></th>
    <td data-column="team"><label>Team <input data-field="profile.team" required data-validate='[["required"]]'></label><output data-error-for="profile.team"></output></td>
    <td data-column="choice"><label>Choice <select data-field="choice" data-options="options" data-option-label="label" data-option-value="code"></select></label></td>
    <td data-column="salary"><label>Salary <input type="number" data-field="salary" min="100" required></label></td></tr></tbody>
  <tfoot><tr><th scope="row" data-column="name">Summary</th><td data-columns="team choice" colspan="2">Two assignments</td><td data-column="salary">Application total</td></tr></tfoot>`;

test.beforeEach(async ({ page }) => {
  // Source-import fixtures do not test Vite's dependency-discovery reloads.
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const table = document.createElement("table");
    table.style.cssText = "table-layout:fixed;width:600px;margin:1px";
    table.innerHTML = markup;
    document.body.append(table);
    const original = table.outerHTML;
    const rows = createRows([
      { name: "Ada", profile: { team: "Platform" }, choice: 1, options: [{ label: "One", code: 1 }], salary: 150 },
      { name: "Grace", profile: { team: "Support" }, choice: 2, options: [{ label: "Two", code: 2 }], salary: 200 }
    ]);
    const events: Window["columnFixture"]["events"] = [];
    const grid = bindGrid(table, {
      rows, columns: [{ key: "name", width: 160 }, { key: "team", width: 140 }, { key: "choice", width: 120 }, { key: "salary", width: 180 }],
      parse: { salary: (value: string) => Number(value) },
      onColumnsChange: ({ columns, event }: { columns: readonly GridColumn[]; event: Event | null }) =>
        events.push({ columns, type: event?.type ?? null })
    });
    window.columnFixture = {
      grid, rows, table, original, events, storeEvents: 0,
      input: table.querySelector<HTMLInputElement>('tbody [data-field="profile.team"]')!,
      nameHeader: table.querySelector<HTMLTableCellElement>('thead [data-column="name"]')!,
      resize: table.querySelector<HTMLButtonElement>("[data-resize-column]")!
    };
    rows.subscribe(() => { window.columnFixture.storeEvents++; });
  }, { modules, markup });
});

test("column changes keep field nodes, nested raw choices, selection and caret", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.columnFixture;
    const first = h.rows.entries()[0];
    const choice = h.table.querySelector<HTMLSelectElement>("tbody select")!;
    h.grid.select(first.id);
    h.input.focus();
    h.input.setSelectionRange(1, 4);
    h.grid.setColumns([...h.grid.columns()].reverse());
    const order = [...h.table.tBodies[0].rows[0].cells].map(cell => cell.dataset.column);
    const focused = document.activeElement === h.input;
    const caret = [h.input.selectionStart, h.input.selectionEnd];
    h.input.value = "Engineering";
    h.input.dispatchEvent(new Event("change", { bubbles: true }));
    return { order, focused, caret, selected: h.grid.selected() === first.id,
      sameInput: h.table.querySelector('tbody [data-field="profile.team"]') === h.input,
      sameChoice: h.table.querySelector("tbody select") === choice,
      choice: h.rows.get(first.id)!.value.choice, team: h.rows.get(first.id)!.value.profile.team,
      notifications: h.events.map(event => event.type), storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ order: ["salary", "choice", "team", "name"], focused: true, caret: [1, 4], selected: true,
    sameInput: true, sameChoice: true, choice: 1, team: "Engineering", notifications: [null], storeEvents: 1 });
});

test("hidden columns keep drafts across row release and preserve native visible groups", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.columnFixture;
    const id = h.rows.entries()[0].id;
    h.input.focus();
    h.input.value = "";
    h.input.dispatchEvent(new Event("input", { bubbles: true }));
    h.grid.setColumns(h.grid.columns().map(column => ({ ...column, hidden: column.key === "team" })));
    const hidden = !h.input.isConnected;
    const focusRecovered = document.activeElement instanceof HTMLElement && document.activeElement.isConnected && document.activeElement !== document.body;
    const span = h.table.querySelector<HTMLTableCellElement>('thead [data-columns]')!.colSpan;
    const connectedCols = h.table.querySelectorAll("col").length;
    h.grid.setPage({ page: 2, size: 1 });
    const offscreen = h.grid.validate(id).issues.find(issue => issue.field === "profile.team");
    h.grid.setPage(null);
    h.grid.setColumns(h.grid.columns().map(({ key, width }) => ({ key, width })));
    const returned = h.table.querySelector<HTMLInputElement>('tbody [data-field="profile.team"]')!;
    return { hidden, focusRecovered, span, connectedCols, offscreen: !!offscreen && !offscreen.element,
      draft: returned.value, invalid: returned.getAttribute("aria-invalid"),
      stored: h.rows.get(id)!.value.profile.team, storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ hidden: true, focusRecovered: true, span: 1, connectedCols: 3, offscreen: true,
    draft: "", invalid: "true", stored: "Platform", storeEvents: 0 });
});

test("invalid replacement is atomic and returned state is immutable", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.columnFixture;
    const original = h.table.outerHTML;
    const state = h.grid.columns();
    const attempts = [
      state.slice(1), [...state, state[0]], state.map(column => ({ ...column, hidden: true })),
      state.map(column => ({ ...column, width: -1 })), state.map(column => ({ ...column, width: Number.NaN })),
      [state[1], state[0], state[2], state[3]], state.map(column => ({ ...column, key: "unknown" }))
    ];
    const sparse = [...state];
    delete sparse[2];
    attempts.push(sparse);
    const failures = attempts.map(next => {
      try { h.grid.setColumns(next); return "none"; }
      catch (cause) { return (cause as { code: string }).code; }
    });
    return { failures, unchanged: h.table.outerHTML === original && JSON.stringify(h.grid.columns()) === JSON.stringify(state),
      immutable: Object.isFrozen(state) && state.every(Object.isFrozen), events: h.events.length };
  });
  expect(result.failures).toEqual(Array(8).fill("GRID_COLUMNS"));
  expect(result.unchanged).toBe(true);
  expect(result.immutable).toBe(true);
  expect(result.events).toBe(0);
});

test("width-only updates leave row topology, focus and data untouched", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.columnFixture;
    h.input.focus(); h.input.setSelectionRange(1, 4);
    const observer = new MutationObserver(() => {});
    observer.observe(h.table, { childList: true, attributes: true, subtree: true });
    h.grid.setColumns(h.grid.columns().map(column => column.key === "team" ? { ...column, width: 185 } : column));
    const mutations = observer.takeRecords(); observer.disconnect();
    return { childChanges: mutations.filter(mutation => mutation.type === "childList").length,
      rowAttributes: mutations.filter(mutation => mutation.target instanceof Element && !!mutation.target.closest("tbody")).length,
      focus: document.activeElement === h.input, caret: [h.input.selectionStart, h.input.selectionEnd],
      width: h.grid.columns().find(column => column.key === "team")!.width,
      tableWidth: h.table.style.width, events: h.events.length, storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ childChanges: 0, rowAttributes: 0, focus: true, caret: [1, 4],
    width: 185, tableWidth: "645px", events: 1, storeEvents: 0 });
});

test("sort indicators on hidden headers and exact dispose restoration work", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.columnFixture;
    h.grid.setColumns([...h.grid.columns()].reverse().map(column => ({ ...column, hidden: column.key === "name" })));
    h.grid.setSort((a, b) => b.name.localeCompare(a.name), { column: h.nameHeader, direction: "descending" });
    h.grid.setColumns(h.grid.columns().map(({ key, width }) => ({ key, width })));
    const sort = h.nameHeader.getAttribute("aria-sort");
    h.grid.dispose();
    h.grid.dispose();
    const exact = h.table.outerHTML === h.original;
    let code = "";
    try { h.grid.columns(); } catch (cause) { code = (cause as { code: string }).code; }
    return { sort, exact, code, storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ sort: "descending", exact: true, code: "GRID_DISPOSED", storeEvents: 0 });
});

test("keyboard resize reports one coherent change and resets preferred width", async ({ page }) => {
  const handle = page.getByRole("button", { name: "Resize Team column" });
  await handle.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Shift+ArrowLeft");
  expect(await page.evaluate(() => window.columnFixture.grid.columns().find(column => column.key === "team")!.width)).toBe(149);
  await page.keyboard.press("Home");
  const result = await page.evaluate(() => ({
    width: window.columnFixture.grid.columns().find(column => column.key === "team")!.width,
    focused: document.activeElement === window.columnFixture.resize,
    types: window.columnFixture.events.map(event => event.type), storeEvents: window.columnFixture.storeEvents
  }));
  expect(result).toEqual({ width: 140, focused: true, types: ["keydown", "keydown", "keydown"], storeEvents: 0 });
});

test("pointer resize commits once, cancellation restores state and teardown releases capture", async ({ page }) => {
  const handle = page.getByRole("button", { name: "Resize Team column" });
  const box = (await handle.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 40, y, { steps: 4 });
  expect(await page.evaluate(() => window.columnFixture.events.length)).toBe(0);
  await page.mouse.up();
  const committed = await page.evaluate(() => ({ width: window.columnFixture.grid.columns().find(column => column.key === "team")!.width!, events: window.columnFixture.events.map(event => event.type) }));
  expect(committed.width).toBeGreaterThan(140);
  expect(committed.events).toEqual(["pointerup"]);
  const next = (await handle.boundingBox())!;
  await page.mouse.move(next.x + next.width / 2, next.y + next.height / 2);
  await page.mouse.down();
  await page.mouse.move(next.x + next.width / 2 + 20, next.y + next.height / 2);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  const canceled = await page.evaluate(() => ({ width: window.columnFixture.grid.columns().find(column => column.key === "team")!.width, events: window.columnFixture.events.length }));
  expect(canceled).toEqual({ width: committed.width, events: 1 });
  await page.evaluate(() => window.columnFixture.grid.dispose());
  expect(await page.evaluate(() => window.columnFixture.table.outerHTML === window.columnFixture.original)).toBe(true);
});

test("malformed topology and bind failures leave original markup available for retry", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const cases = [
      '<thead><tr><th data-column="other">Wrong</th></tr></thead><tbody><tr data-row-template><td data-column="name" data-field="name"></td></tr></tbody>',
      '<tbody><tr data-row-template><td data-column="name"></td><td data-column="name"></td></tr></tbody>',
      '<tbody><tr data-row-template><td data-column="name" colspan="2"></td></tr></tbody>',
      '<thead><tr><th scope="colgroup" data-columns="name team" colspan="2">People</th></tr></thead><tbody><tr data-row-template><td data-column="name"></td><td data-column="team"></td></tr></tbody>',
      '<tbody><tr data-row-template><td data-column="name" data-field="name"></td></tr></tbody>'
    ];
    return cases.map((markup, index) => {
      const table = document.createElement("table");
      table.innerHTML = markup;
      document.body.append(table);
      const original = table.outerHTML;
      const rows = createRows([{ name: "Ada" }]);
      let code = "";
      try { bindGrid(table, { rows, ...(index === 4 ? { columns: null } : {}) }); } catch (cause) { code = (cause as { code: string }).code; }
      const untouched = table.outerHTML === original;
      rows.dispose();
      table.remove();
      return { code, untouched };
    });
  }, modules);
  expect(result).toEqual([...Array(4).fill({ code: "GRID_COLUMN_MARKUP", untouched: true }), { code: "GRID_COLUMNS", untouched: true }]);
});

test("returning the resize pointer to its start restores the preview without notifying", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.columnFixture;
    const style = h.table.outerHTML;
    h.resize.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 41, isPrimary: true, button: 0, clientX: 100 }));
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 41, clientX: 140 }));
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    const previewed = h.table.outerHTML !== style;
    document.dispatchEvent(new PointerEvent("pointerup", { pointerId: 41, clientX: 100 }));
    return { previewed, restored: h.table.outerHTML === style, events: h.events.length,
      width: h.grid.columns().find(column => column.key === "team")!.width };
  });
  expect(result).toEqual({ previewed: true, restored: true, events: 0, width: 140 });
});

test("callback failures keep the successful state and failed data binding can be retried", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const table = document.createElement("table");
    table.innerHTML = '<thead><tr><th scope="col" data-column="label">Name</th></tr></thead><tbody><tr data-row-template><td data-column="label" data-field="name" data-format=\'[ ["display"] ]\'></td></tr></tbody>';
    document.body.append(table);
    const original = table.outerHTML;
    const rows = createRows([{ name: "Ada" }]);
    let failed = false;
    try { bindGrid(table, { rows, columns: [{ key: "label", width: 100 }], rules: { format: { display: () => { throw new Error("format failure"); } } } }); }
    catch { failed = true; }
    const restored = table.outerHTML === original;
    const handle = bindGrid(table, { rows, rules: { format: { display: (value: unknown) => String(value) } },
      onColumnsChange: () => { throw new Error("consumer failure"); } });
    let message = "";
    try { handle.setColumns([{ key: "label", width: 200 }]); } catch (cause) { message = (cause as Error).message; }
    const committed = handle.columns()[0].width === 200 && table.querySelector("col")!.style.width === "200px";
    handle.dispose(); rows.dispose();
    return { failed, restored, message, committed, finalRestored: table.outerHTML === original };
  }, modules);
  expect(result).toEqual({ failed: true, restored: true, message: "consumer failure", committed: true, finalRestored: true });
});

test("no-column tables retain their behavior and state methods have clear bounds", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td data-field="name"></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows([{ name: "Ada" }]);
    const handle = bindGrid(table, { rows });
    const state = handle.columns();
    handle.setColumns([]);
    let code = "";
    try { handle.setColumns([{ key: "name" }]); } catch (cause) { code = (cause as { code: string }).code; }
    const text = table.textContent;
    handle.dispose();
    rows.dispose();
    table.remove();
    return { state, code, text };
  }, modules);
  expect(result).toEqual({ state: [], code: "GRID_COLUMNS", text: "Ada" });
});

test("column hiding and paging skip hidden, inert and CSS-hidden focus candidates", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.columnFixture;
    for (const button of h.table.querySelectorAll<HTMLButtonElement>("tbody button")) {
      const wrapper = document.createElement("span");
      wrapper.hidden = true;
      button.replaceWith(wrapper); wrapper.append(button);
    }
    h.input.focus();
    h.grid.setColumns(h.grid.columns().map(column => ({ ...column, hidden: column.key === "team" })));
    const hiddenRecovery = document.activeElement !== document.body && h.table.contains(document.activeElement) &&
      !document.activeElement!.closest("[hidden], [inert]");
    h.grid.setColumns(h.grid.columns().map(({ key, width }) => ({ key, width })));
    const style = document.createElement("style");
    style.textContent = "tbody button[data-select-row] {display:none}";
    document.head.append(style);
    h.input.focus();
    h.grid.setPage({ page: 2, size: 1 });
    const pagingRecovery = document.activeElement instanceof HTMLInputElement && h.table.contains(document.activeElement);
    for (const cell of h.table.tBodies[0].rows[0].cells) cell.inert = true;
    for (const button of h.table.querySelectorAll<HTMLButtonElement>("thead button")) button.hidden = true;
    const field = h.table.querySelector<HTMLInputElement>('tbody [data-field="profile.team"]')!;
    h.table.tBodies[0].rows[0].cells[1].inert = false;
    field.focus();
    h.grid.setColumns(h.grid.columns().map(column => ({ ...column, hidden: column.key === "team" })));
    const tableRecovery = document.activeElement === h.table;
    style.remove();
    return { hiddenRecovery, pagingRecovery, tableRecovery };
  });
  expect(result).toEqual({ hiddenRecovery: true, pagingRecovery: true, tableRecovery: true });
});

test("two CVC layouts expose working column tools and remain isolated and accessible", async ({ page }) => {
  await page.goto("/m10/columns.html");
  await expect(page.locator("tbody tr:not([data-row-template])")).toHaveCount(6);
  const ledger = page.locator('[data-column-layout="ledger"]');
  const notebook = page.locator('[data-column-layout="notebook"]');
  await ledger.locator("[data-column-choice]").selectOption("email");
  await ledger.locator("[data-column-hidden]").check();
  await ledger.locator('[data-column-action="apply"]').click();
  await expect(ledger.locator('tbody [data-column="email"]')).toHaveCount(0);
  await expect(notebook.locator('tbody [data-column="email"]')).toHaveCount(3);
  await ledger.locator('[data-column-action="swap"]').click();
  await expect(ledger.locator("thead tr").first().locator("th").nth(1)).toHaveText("Assignment");
  await ledger.locator('[data-column-action="invalid"]').click();
  await expect(ledger.locator("[data-column-status]")).toContainText("every column exactly once");
  await ledger.locator('[data-column-action="reset"]').click();
  await expect(ledger.locator('tbody [data-column="email"]')).toHaveCount(3);
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]).analyze();
  expect(axe.violations.map(violation => violation.id)).toEqual([]);
  await page.setViewportSize({ width: 320, height: 640 });
  await page.addStyleTag({ content: "* { line-height:1.5!important; letter-spacing:.12em!important; word-spacing:.16em!important; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("flat columns move freely and late rows use current topology without rebinding fields", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const table = document.createElement("table");
    table.innerHTML = '<thead><tr><th scope="col" data-column="label">Name</th><th scope="col" data-column="quantity">Salary</th></tr></thead><tbody><tr data-row-template><td data-column="label" data-field="profile.name"></td><td data-column="quantity" data-field="salary"></td></tr></tbody>';
    document.body.append(table);
    const original = table.outerHTML;
    const initial: { profile: { name: string }; salary: number }[] = [];
    const rows = createRows(initial);
    const handle = bindGrid(table, { rows });
    handle.setColumns([{ key: "quantity", width: 80 }, { key: "label", width: 100, hidden: true }]);
    rows.add({ profile: { name: "Ada" }, salary: 150 });
    const hidden = table.tBodies[0].rows[0].textContent;
    handle.setColumns([{ key: "quantity" }, { key: "label" }]);
    const order = [...table.tBodies[0].rows[0].cells].map(cell => cell.dataset.column);
    const text = [...table.tBodies[0].rows[0].cells].map(cell => cell.textContent);
    handle.dispose();
    rows.dispose();
    return { hidden, order, text, restored: table.outerHTML === original,
      difference: table.outerHTML === original ? null : { original, actual: table.outerHTML } };
  }, modules);
  expect(result).toEqual({ hidden: "150", order: ["quantity", "label"], text: ["150", "Ada"], restored: true, difference: null });
});

test("implicit columns do not add ordering restrictions around an authored middle group", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const table = document.createElement("table");
    table.innerHTML = '<colgroup span="2" data-columns="b c"></colgroup><tbody><tr data-row-template>' +
      ["a", "b", "c", "d", "e"].map(key => `<td data-column="${key}" data-field="${key}"></td>`).join("") + '</tr></tbody>';
    document.body.append(table);
    const original = table.outerHTML;
    const originalNode = table.cloneNode(true);
    const rows = createRows([{ a: "A", b: "B", c: "C", d: "D", e: "E" }]);
    const grid = bindGrid(table, { rows });
    grid.setColumns(["e", "a", "b", "c", "d"].map(key => ({ key })));
    const text = table.tBodies[0].rows[0].textContent;
    const cols = table.querySelectorAll("col").length;
    grid.dispose(); rows.dispose();
    return { text, cols, restored: table.isEqualNode(originalNode),
      difference: table.isEqualNode(originalNode) ? null : { original, actual: table.outerHTML } };
  }, modules);
  expect(result).toEqual({ text: "EABCD", cols: 5, restored: true, difference: null });
});
