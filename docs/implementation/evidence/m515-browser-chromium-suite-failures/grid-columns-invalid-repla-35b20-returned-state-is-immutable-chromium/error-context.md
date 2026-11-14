# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: grid-columns.spec.ts >> invalid replacement is atomic and returned state is immutable
- Location: tests\browser\grid-columns.spec.ts:129:1

# Error details

```
Error: page.evaluate: TypeError: Failed to fetch dynamically imported module: http://127.0.0.1:4173/@fs/D:/workspace/natural_js/src/ui/grid.ts
```

# Page snapshot

```yaml
- main [ref=e2]:
  - heading "Natural-JS 2.0 import smoke" [level=1] [ref=e3]
  - paragraph [ref=e4]:
    - link "Grid contract demo" [ref=e5] [cursor=pointer]:
      - /url: /m10/demo.html
    - text: ·
    - link "Choice-group CVC demo" [ref=e6] [cursor=pointer]:
      - /url: /m5/choices.html
    - text: ·
    - link "Tree and DatePicker CVC demo" [ref=e7] [cursor=pointer]:
      - /url: /m11/side.html
    - text: ·
    - link "Application shell demo" [ref=e8] [cursor=pointer]:
      - /url: /m12/side.html
  - generic [ref=e9]:
    - heading "First authored view" [level=2] [ref=e10]
    - button "Check import" [ref=e11]
    - status [ref=e12]: ESM ready
  - generic [ref=e13]:
    - heading "Second authored view" [level=2] [ref=e14]
    - button "Check import" [ref=e15]
    - status [ref=e16]: ESM ready
```

# Test source

```ts
  1   | import { fileURLToPath } from "node:url";
  2   | import { expect, test } from "@playwright/test";
  3   | import AxeBuilder from "@axe-core/playwright";
  4   | import type { GridColumn, GridHandle } from "../../src/ui/index.js";
  5   | import type { Rows } from "../../src/data/index.js";
  6   | 
  7   | type Employee = {
  8   |   name: string;
  9   |   profile: { team: string };
  10  |   choice: number;
  11  |   options: { label: string; code: number }[];
  12  |   salary: number;
  13  | };
  14  | 
  15  | declare global {
  16  |   interface Window {
  17  |     columnFixture: {
  18  |       grid: GridHandle<Employee>;
  19  |       rows: Rows<Employee>;
  20  |       table: HTMLTableElement;
  21  |       original: string;
  22  |       events: { columns: readonly GridColumn[]; type: string | null }[];
  23  |       storeEvents: number;
  24  |       input: HTMLInputElement;
  25  |       nameHeader: HTMLTableCellElement;
  26  |       resize: HTMLButtonElement;
  27  |     };
  28  |   }
  29  | }
  30  | 
  31  | const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
  32  | const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts"), columns: source("../../src/ui/grid-columns.ts") };
  33  | const markup = `<caption>Assignments</caption>
  34  |   <colgroup span="1"></colgroup><colgroup span="2"></colgroup><colgroup><col style="width:160px"></colgroup>
  35  |   <thead><tr><th scope="col" data-column="name" rowspan="2">Name</th>
  36  |     <th scope="colgroup" data-columns="team choice" colspan="2">Assignment</th>
  37  |     <th scope="col" data-column="salary" rowspan="2">Salary</th></tr>
  38  |     <tr><th scope="col" data-column="team">Team
  39  |       <button type="button" data-resize-column="team" aria-label="Resize Team column">Resize</button></th>
  40  |       <th scope="col" data-column="choice">Choice</th></tr></thead>
  41  |   <tbody><tr data-row-template><th scope="row" data-column="name"><button type="button" data-select-row><span data-field="name"></span></button></th>
  42  |     <td data-column="team"><label>Team <input data-field="profile.team" required data-validate='[["required"]]'></label><output data-error-for="profile.team"></output></td>
  43  |     <td data-column="choice"><label>Choice <select data-field="choice" data-options="options" data-option-label="label" data-option-value="code"></select></label></td>
  44  |     <td data-column="salary"><label>Salary <input type="number" data-field="salary" min="100" required></label></td></tr></tbody>
  45  |   <tfoot><tr><th scope="row" data-column="name">Summary</th><td data-columns="team choice" colspan="2">Two assignments</td><td data-column="salary">Application total</td></tr></tfoot>`;
  46  | 
  47  | test.beforeEach(async ({ page }) => {
  48  |   // Source-import fixtures do not test Vite's dependency-discovery reloads.
  49  |   await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  50  |   await page.goto("/");
> 51  |   await page.evaluate(async ({ modules, markup }) => {
      |              ^ Error: page.evaluate: TypeError: Failed to fetch dynamically imported module: http://127.0.0.1:4173/@fs/D:/workspace/natural_js/src/ui/grid.ts
  52  |     const { bindGrid } = await import(modules.grid);
  53  |     const { createRows } = await import(modules.data);
  54  |     const table = document.createElement("table");
  55  |     table.style.cssText = "table-layout:fixed;width:600px;margin:1px";
  56  |     table.innerHTML = markup;
  57  |     document.body.append(table);
  58  |     const original = table.outerHTML;
  59  |     const rows = createRows([
  60  |       { name: "Ada", profile: { team: "Platform" }, choice: 1, options: [{ label: "One", code: 1 }], salary: 150 },
  61  |       { name: "Grace", profile: { team: "Support" }, choice: 2, options: [{ label: "Two", code: 2 }], salary: 200 }
  62  |     ]);
  63  |     const events: Window["columnFixture"]["events"] = [];
  64  |     const grid = bindGrid(table, {
  65  |       rows, columns: [{ key: "name", width: 160 }, { key: "team", width: 140 }, { key: "choice", width: 120 }, { key: "salary", width: 180 }],
  66  |       parse: { salary: (value: string) => Number(value) },
  67  |       onColumnsChange: ({ columns, event }: { columns: readonly GridColumn[]; event: Event | null }) =>
  68  |         events.push({ columns, type: event?.type ?? null })
  69  |     });
  70  |     window.columnFixture = {
  71  |       grid, rows, table, original, events, storeEvents: 0,
  72  |       input: table.querySelector<HTMLInputElement>('tbody [data-field="profile.team"]')!,
  73  |       nameHeader: table.querySelector<HTMLTableCellElement>('thead [data-column="name"]')!,
  74  |       resize: table.querySelector<HTMLButtonElement>("[data-resize-column]")!
  75  |     };
  76  |     rows.subscribe(() => { window.columnFixture.storeEvents++; });
  77  |   }, { modules, markup });
  78  | });
  79  | 
  80  | test("column changes keep field nodes, nested raw choices, selection and caret", async ({ page }) => {
  81  |   const result = await page.evaluate(() => {
  82  |     const h = window.columnFixture;
  83  |     const first = h.rows.entries()[0];
  84  |     const choice = h.table.querySelector<HTMLSelectElement>("tbody select")!;
  85  |     h.grid.select(first.id);
  86  |     h.input.focus();
  87  |     h.input.setSelectionRange(1, 4);
  88  |     h.grid.setColumns([...h.grid.columns()].reverse());
  89  |     const order = [...h.table.tBodies[0].rows[0].cells].map(cell => cell.dataset.column);
  90  |     const focused = document.activeElement === h.input;
  91  |     const caret = [h.input.selectionStart, h.input.selectionEnd];
  92  |     h.input.value = "Engineering";
  93  |     h.input.dispatchEvent(new Event("change", { bubbles: true }));
  94  |     return { order, focused, caret, selected: h.grid.selected() === first.id,
  95  |       sameInput: h.table.querySelector('tbody [data-field="profile.team"]') === h.input,
  96  |       sameChoice: h.table.querySelector("tbody select") === choice,
  97  |       choice: h.rows.get(first.id)!.value.choice, team: h.rows.get(first.id)!.value.profile.team,
  98  |       notifications: h.events.map(event => event.type), storeEvents: h.storeEvents };
  99  |   });
  100 |   expect(result).toEqual({ order: ["salary", "choice", "team", "name"], focused: true, caret: [1, 4], selected: true,
  101 |     sameInput: true, sameChoice: true, choice: 1, team: "Engineering", notifications: [null], storeEvents: 1 });
  102 | });
  103 | 
  104 | test("hidden columns keep drafts across row release and preserve native visible groups", async ({ page }) => {
  105 |   const result = await page.evaluate(() => {
  106 |     const h = window.columnFixture;
  107 |     const id = h.rows.entries()[0].id;
  108 |     h.input.focus();
  109 |     h.input.value = "";
  110 |     h.input.dispatchEvent(new Event("input", { bubbles: true }));
  111 |     h.grid.setColumns(h.grid.columns().map(column => ({ ...column, hidden: column.key === "team" })));
  112 |     const hidden = !h.input.isConnected;
  113 |     const focusRecovered = document.activeElement instanceof HTMLElement && document.activeElement.isConnected && document.activeElement !== document.body;
  114 |     const span = h.table.querySelector<HTMLTableCellElement>('thead [data-columns]')!.colSpan;
  115 |     const connectedCols = h.table.querySelectorAll("col").length;
  116 |     h.grid.setPage({ page: 2, size: 1 });
  117 |     const offscreen = h.grid.validate(id).issues.find(issue => issue.field === "profile.team");
  118 |     h.grid.setPage(null);
  119 |     h.grid.setColumns(h.grid.columns().map(({ key, width }) => ({ key, width })));
  120 |     const returned = h.table.querySelector<HTMLInputElement>('tbody [data-field="profile.team"]')!;
  121 |     return { hidden, focusRecovered, span, connectedCols, offscreen: !!offscreen && !offscreen.element,
  122 |       draft: returned.value, invalid: returned.getAttribute("aria-invalid"),
  123 |       stored: h.rows.get(id)!.value.profile.team, storeEvents: h.storeEvents };
  124 |   });
  125 |   expect(result).toEqual({ hidden: true, focusRecovered: true, span: 1, connectedCols: 3, offscreen: true,
  126 |     draft: "", invalid: "true", stored: "Platform", storeEvents: 0 });
  127 | });
  128 | 
  129 | test("invalid replacement is atomic and returned state is immutable", async ({ page }) => {
  130 |   const result = await page.evaluate(() => {
  131 |     const h = window.columnFixture;
  132 |     const original = h.table.outerHTML;
  133 |     const state = h.grid.columns();
  134 |     const attempts = [
  135 |       state.slice(1), [...state, state[0]], state.map(column => ({ ...column, hidden: true })),
  136 |       state.map(column => ({ ...column, width: -1 })), state.map(column => ({ ...column, width: Number.NaN })),
  137 |       [state[1], state[0], state[2], state[3]], state.map(column => ({ ...column, key: "unknown" }))
  138 |     ];
  139 |     const sparse = [...state];
  140 |     delete sparse[2];
  141 |     attempts.push(sparse);
  142 |     const failures = attempts.map(next => {
  143 |       try { h.grid.setColumns(next); return "none"; }
  144 |       catch (cause) { return (cause as { code: string }).code; }
  145 |     });
  146 |     return { failures, unchanged: h.table.outerHTML === original && JSON.stringify(h.grid.columns()) === JSON.stringify(state),
  147 |       immutable: Object.isFrozen(state) && state.every(Object.isFrozen), events: h.events.length };
  148 |   });
  149 |   expect(result.failures).toEqual(Array(8).fill("GRID_COLUMNS"));
  150 |   expect(result.unchanged).toBe(true);
  151 |   expect(result.immutable).toBe(true);
```