# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: grid-progressive.spec.ts >> refresh supersedes pending work and starts a fresh first chunk
- Location: tests\browser\grid-progressive.spec.ts:253:1

# Error details

```
Error: page.goto: Could not connect to server
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
  1   | // SPDX-License-Identifier: Apache-2.0
  2   | import { fileURLToPath } from "node:url";
  3   | import { expect, test } from "@playwright/test";
  4   | import AxeBuilder from "@axe-core/playwright";
  5   | import type { Rows } from "../../src/data/index.js";
  6   | import type { GridBindResult, GridHandle } from "../../src/ui/index.js";
  7   | import type { GridRowBinding } from "../../src/ui/grid-hooks.js";
  8   | import type { bindGrid } from "../../src/ui/grid.js";
  9   | 
  10  | type Item = { key: number; group: string; profile: { name: string; note: string }; mode: string;
  11  |   channels: string[]; chosen: number; choices: { label: string; value: number }[]; summary: string };
  12  | type Options = Parameters<typeof bindGrid<Item>>[1];
  13  | type Observed = Omit<GridBindResult, "event"> & { event: string | null };
  14  | type Fault = { phase: "before" | "after" | "field" | "bind"; id?: number; once?: boolean };
  15  | declare global {
  16  |   interface Window {
  17  |     progressiveFixture: {
  18  |       grid: GridHandle<Item>; rows: Rows<Item>; table: HTMLTableElement; root: HTMLElement; host: HTMLElement;
  19  |       markup: string; original: string; options: Options; before: number[]; after: number[];
  20  |       connected: boolean[]; cleaned: { id: number; phase: string }[]; binds: Observed[]; frozen: boolean[];
  21  |       unhandled: string[]; clones: number; clicks: number; fault?: Fault;
  22  |       actions: { before?: (context: GridRowBinding<Item>) => unknown;
  23  |         after?: (context: GridRowBinding<Item>) => unknown; bind?: (result: GridBindResult) => unknown };
  24  |       reset(count?: number, extra?: Partial<Options>): void;
  25  |       item(index: number): Item; ids(): number[]; block(id: number): HTMLTableRowElement[];
  26  |       field<E extends HTMLElement = HTMLElement>(id: number, name: string): E | null;
  27  |       task(delay?: number): Promise<void>; settle(): Promise<void>;
  28  |       secondary?: { grid: GridHandle<Item>; rows: Rows<Item>; table: HTMLTableElement; original: string; host: HTMLElement };
  29  |       other(count?: number): void;
  30  |     };
  31  |   }
  32  | }
  33  | 
  34  | const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
  35  | const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts") };
  36  | const markup = `<caption>Progressive employee records</caption><colgroup span="4"></colgroup>
  37  |   <thead><tr><th scope="col" data-column="key">Identity</th><th scope="col" data-column="name">Name</th>
  38  |     <th scope="col" data-column="choice">Settings</th><th scope="col" data-column="summary">Summary</th></tr></thead>
  39  |   <tbody data-row-template><tr data-progress-main><th scope="row" data-column="key" rowspan="2">
  40  |     <span data-field="key"></span><button type="button" data-select-row>Select record</button>
  41  |     <label><input type="checkbox" data-check-row>Check record</label></th>
  42  |     <td data-column="name"><label>Name <input data-field="profile.name" required minlength="3"></label>
  43  |       <output data-error-for="profile.name"></output></td>
  44  |     <td data-column="choice"><label>Choice <select data-field="chosen" data-options="choices"
  45  |       data-option-label="label" data-option-value="value"></select></label></td>
  46  |     <td data-column="summary" rowspan="2"><span data-field="summary"><em>Authored summary</em></span></td></tr>
  47  |     <tr data-progress-detail><td data-column="name"><label>Note <textarea data-field="profile.note"></textarea></label></td>
  48  |       <td data-column="choice"><label><input type="radio" name="progress-mode" data-field="mode" value="office">Office</label>
  49  |         <label><input type="radio" name="progress-mode" data-field="mode" value="remote">Remote</label>
  50  |         <label><input type="checkbox" data-field="channels" value="email">Email</label>
  51  |         <label><input type="checkbox" data-field="channels" value="sms">SMS</label></td></tr></tbody>`;
  52  | 
  53  | test.beforeEach(async ({ page }) => {
  54  |   await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
> 55  |   await page.goto("/");
      |              ^ Error: page.goto: Could not connect to server
  56  |   await page.evaluate(async ({ modules, markup }) => {
  57  |     const [{ bindGrid }, { createRows }] = await Promise.all([import(modules.grid), import(modules.data)]);
  58  |     const host = document.createElement("section"); host.dataset.progressFixture = "";
  59  |     host.innerHTML = '<h2>Cooperative record binding</h2><div role="region" aria-label="Progressive records" tabindex="0" data-progress-scroll style="height:240px;width:900px;overflow:auto"><table aria-busy="false"></table></div>';
  60  |     const style = document.createElement("style");
  61  |     style.textContent = '[data-progress-fixture]{font:14px/20px sans-serif}[data-progress-fixture] table{width:880px;table-layout:fixed;border-collapse:collapse}[data-progress-fixture] th,[data-progress-fixture] td{padding:2px;vertical-align:top}[data-progress-fixture] label{display:block}[data-progress-fixture] input:not([type=radio]):not([type=checkbox]),[data-progress-fixture] select,[data-progress-fixture] textarea{max-width:145px}[data-progress-fixture] output:empty{display:none}';
  62  |     host.append(style); document.body.append(host);
  63  |     const root = host.querySelector<HTMLElement>("[data-progress-scroll]")!, table = host.querySelector<HTMLTableElement>("table")!;
  64  |     const h: Window["progressiveFixture"] = {
  65  |       grid: undefined as unknown as GridHandle<Item>, rows: undefined as unknown as Rows<Item>,
  66  |       host, root, table, markup, original: "", options: undefined as unknown as Options,
  67  |       before: [], after: [], connected: [], cleaned: [], binds: [], frozen: [], unhandled: [], clones: 0, clicks: 0, actions: {},
  68  |       item(index) { return { key: index, group: index % 2 ? "Odd" : "Even", profile: { name: `Record ${index}`, note: `Note ${index}` },
  69  |         mode: "office", channels: ["email"], chosen: 1, choices: [{ label: "One", value: 1 }, { label: "Two", value: 2 }], summary: `Summary ${index}` }; },
  70  |       ids() { return [...table.querySelectorAll<HTMLTableRowElement>("tbody tr[data-progress-main][data-progress-row]")]
  71  |         .map(row => Number(row.dataset.progressRow)); },
  72  |       block(id) { return [...table.querySelectorAll<HTMLTableRowElement>(`tr[data-progress-row="${id}"]`)]; },
  73  |       field<E extends HTMLElement = HTMLElement>(id: number, name: string): E | null {
  74  |         const field = h.block(id).flatMap(row => [...row.querySelectorAll<HTMLElement>("[data-field]")])
  75  |           .find(element => element.getAttribute("data-field") === name);
  76  |         return field ? field as E : null;
  77  |       },
  78  |       task: (delay = 0) => new Promise(resolve => window.setTimeout(resolve, delay)),
  79  |       settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))),
  80  |       reset(count = 7, extra = {}) {
  81  |         h.grid?.dispose(); h.rows?.dispose();
  82  |         h.secondary?.grid.dispose(); h.secondary?.rows.dispose(); h.secondary?.host.remove(); delete h.secondary;
  83  |         table.innerHTML = markup; table.setAttribute("aria-busy", "false"); root.scrollTop = 0;
  84  |         h.original = table.outerHTML; h.before = []; h.after = []; h.connected = []; h.cleaned = []; h.binds = [];
  85  |         h.frozen = []; h.unhandled = []; h.clones = 0; h.clicks = 0; h.actions = {}; delete h.fault;
  86  |         h.rows = createRows(Array.from({ length: count }, (_, index) => h.item(index + 1)));
  87  |         const fault = (phase: Fault["phase"], id?: number) => {
  88  |           if (h.fault?.phase !== phase || h.fault.id !== undefined && h.fault.id !== id) return;
  89  |           if (h.fault.once) delete h.fault;
  90  |           throw new Error(`Injected ${phase} failure ${id ?? ""}`);
  91  |         };
  92  |         h.options = { ...extra, rows: h.rows, multiple: true, paste: true,
  93  |           render: { summary(value, context) { fault("field", context.rowId ?? undefined); return String(value ?? ""); } },
  94  |           beforeRowBind(context) {
  95  |             h.before.push(context.row.id); h.connected.push(context.elements.every(element => element.isConnected));
  96  |             for (const element of context.elements) element.dataset.progressRow = String(context.row.id);
  97  |             context.own(() => { h.cleaned.push({ id: context.row.id, phase: "before" });
  98  |               for (const element of context.elements) delete element.dataset.progressRow; });
  99  |             fault("before", context.row.id); return h.actions.before?.(context);
  100 |           },
  101 |           onRowBind(context) {
  102 |             const button = context.elements[0].querySelector("button")!;
  103 |             const click = () => h.clicks++; button.addEventListener("click", click);
  104 |             context.own(() => { button.removeEventListener("click", click); h.cleaned.push({ id: context.row.id, phase: "after" }); });
  105 |             fault("after", context.row.id); h.after.push(context.row.id); return h.actions.after?.(context);
  106 |           },
  107 |           onBind(result) { h.binds.push({ ...result, event: result.event?.type ?? null }); h.frozen.push(Object.isFrozen(result));
  108 |             fault("bind"); return h.actions.bind?.(result); }
  109 |         };
  110 |         h.grid = bindGrid(table, h.options);
  111 |       },
  112 |       other(count = 3) {
  113 |         const otherHost = document.createElement("section"); otherHost.innerHTML = '<h3>Independent progressive records</h3><table></table>';
  114 |         host.append(otherHost); const otherTable = otherHost.querySelector("table")!; otherTable.innerHTML = markup;
  115 |         const original = otherTable.outerHTML, rows = createRows(Array.from({ length: count }, (_, index) => h.item(index + 1)));
  116 |         const grid = bindGrid(otherTable, { rows, progressive: { size: 2, delay: 10 } });
  117 |         h.secondary = { host: otherHost, table: otherTable, rows, grid, original };
  118 |       }
  119 |     };
  120 |     const clone = HTMLTableRowElement.prototype.cloneNode;
  121 |     HTMLTableRowElement.prototype.cloneNode = function (deep) {
  122 |       if (this.hasAttribute("data-progress-main") || this.hasAttribute("data-progress-detail")) h.clones++;
  123 |       return clone.call(this, deep);
  124 |     };
  125 |     window.addEventListener("unhandledrejection", event => h.unhandled.push(String(event.reason)));
  126 |     window.progressiveFixture = h; h.reset(0);
  127 |   }, { modules, markup });
  128 | });
  129 | 
  130 | test("default binding has one frozen eight-field completion and exhausted calls do not repeat it", async ({ page }) => {
  131 |   const result = await page.evaluate(async () => {
  132 |     const h = window.progressiveFixture; h.reset(4);
  133 |     const pending = h.grid.whenBound(), same = pending === h.grid.whenBound();
  134 |     const bound = await pending; const more = await h.grid.renderMore();
  135 |     return { same, bound, more, keys: Object.keys(bound).sort(), ids: h.ids(), binds: h.binds.length,
  136 |       frozen: Object.isFrozen(bound) && Object.isFrozen(more) && h.frozen.every(Boolean), busy: h.table.getAttribute("aria-busy") };
  137 |   });
  138 |   expect(result.keys).toEqual(["available", "event", "filtered", "first", "last", "mounted", "total", "visible"]);
  139 |   expect(result.bound).toEqual({ total: 4, filtered: 4, visible: 4, mounted: 4, available: 4, first: true, last: true, event: null });
  140 |   expect(result.more).toEqual(result.bound); expect(result.same && result.frozen).toBe(true);
  141 |   expect(result.ids).toEqual([1, 2, 3, 4]); expect(result.binds).toBe(1); expect(result.busy).toBe("false");
  142 | });
  143 | 
  144 | test("empty single exact and remainder boundaries count logical chunks and first last flags", async ({ page }) => {
  145 |   const results = await page.evaluate(async () => {
  146 |     const h = window.progressiveFixture, results = [];
  147 |     for (const [count, size] of [[0, 3], [1, 3], [3, 3], [4, 3], [250, 100]]) {
  148 |       h.reset(count, { progressive: { size } });
  149 |       let bound = await h.grid.whenBound();
  150 |       while (!bound.last) bound = await h.grid.renderMore();
  151 |       const before = h.binds.length; await h.grid.renderMore();
  152 |       results.push({ count, boundaries: h.binds.map(result => [result.available, result.first, result.last]),
  153 |         all: h.ids().length, unique: new Set(h.ids()).size, quiet: before === h.binds.length });
  154 |     }
  155 |     return results;
```