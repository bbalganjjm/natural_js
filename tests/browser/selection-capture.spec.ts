// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { GridHandle, ListHandle } from "../../src/ui/index.js";
import type { Rows, RowSnapshot } from "../../src/data/index.js";
import type { bindGrid } from "../../src/ui/grid.js";
import type { bindList } from "../../src/ui/list.js";
import type { createRows } from "../../src/data/index.js";

type Item = { name: string; selectable: boolean; checkable: boolean };
type Call = { name: string; id?: number | null; ids?: readonly number[] };
type Owned = { root: HTMLElement; rows: Rows<Item>; grid?: GridHandle<Item>; list?: ListHandle<Item>; destroy(): void };
declare global { interface Window { selectionCapture: {
  api: { bindGrid: typeof bindGrid; bindList: typeof bindList; createRows: typeof createRows };
  open(kind: "Grid" | "List", options?: Record<string, unknown>): Owned;
  mode?: Owned; reads?: Record<string, number>;
} } }
const source = (path: string) => "/@fs/" + fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/");
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindGrid, bindList }, { createRows }] = await Promise.all([import(modules.ui), import(modules.data)]);
    window.selectionCapture = { api: { bindGrid, bindList, createRows }, open(kind, options = {}) {
      const root = document.createElement(kind === "Grid" ? "table" : "ul"); root.setAttribute("aria-label", "Captured " + kind);
      root.innerHTML = kind === "Grid" ? '<caption>Captured selection</caption><thead><tr><th scope="col">Name</th><th scope="col"><label>All rows <input type="checkbox" data-check-all="visible"></label></th></tr></thead><tbody><tr data-row-template><th scope="row"><button type="button" data-select-row><span data-field="name"></span></button></th><td><label>Check <input type="checkbox" data-check-row></label></td></tr></tbody>'
        : '<li data-row-template><button type="button" data-select-row><span data-field="name"></span></button></li>';
      document.body.append(root); const rows = createRows<Item>([{ name: "Ada", selectable: true, checkable: true }, { name: "Grace", selectable: true, checkable: true }, { name: "Blocked", selectable: false, checkable: false }]);
      const configuration = Object.create(options); Object.defineProperty(configuration, "rows", { value: rows });
      const grid = kind === "Grid" ? bindGrid(root as HTMLTableElement, configuration) : undefined;
      const list = kind === "List" ? bindList(root as HTMLUListElement, configuration) : undefined;
      return { root, rows, grid, list, destroy() { grid?.dispose(); list?.dispose(); rows.dispose(); root.remove(); } };
    } };
  }, modules);
});

test("Grid captures all eight inherited selection callbacks once and invokes the captured policy plainly through model and pruning tails", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.selectionCapture, names = ["canSelect", "canCheck", "beforeSelect", "onSelect", "beforeSelectionChange", "onSelectionChange", "beforeCheckChange", "onCheckChange"];
    const reads: Record<string, number> = {}, calls: Call[] = []; let plain = true, late = 0;
    const proto = Object.fromEntries(names.map(name => [name, undefined]));
    for (const name of names) Object.defineProperty(proto, name, { configurable: true, get() { reads[name] = (reads[name] ?? 0) + 1;
      return function(this: unknown, change: RowSnapshot<Item> & { id?: number | null; ids?: readonly number[] }) { "use strict";
        plain &&= this === undefined; calls.push({ name, ...(name.startsWith("can") ? { id: change.id } : "ids" in change ? { ids: change.ids } : { id: change.id }) });
        return name === "canSelect" ? change.value.selectable : name === "canCheck" ? change.value.checkable : name.startsWith("before") ? true : undefined;
      }; } });
    const owner = h.open("Grid", Object.create(proto)), grid = owner.grid!; await grid.whenBound();
    for (const name of names) Object.defineProperty(proto, name, { value: () => { late++; return false; } });
    Reflect.deleteProperty(proto, "beforeSelect"); Reflect.deleteProperty(proto, "beforeCheckChange");
    grid.select(1); grid.setSelected([2, 1]); grid.setChecked([2, 1]);
    const membership = { active: grid.selected(), selected: grid.selectedIds(), checked: grid.checkedIds() };
    owner.rows.remove(1); await grid.whenBound();
    const prune = { active: grid.selected(), selected: grid.selectedIds(), checked: grid.checkedIds(), callbacks: calls.filter(call => !call.name.startsWith("can")) };
    owner.destroy();
    const receiver = { prefix: "bound", calls: [] as string[], run(this: { prefix: string; calls: string[] }) { this.calls.push(this.prefix); } };
    const bound = h.open("Grid", { onSelect: receiver.run.bind(receiver) }); bound.grid!.select(1); bound.destroy();
    return { reads, plain, late, called: [...new Set(calls.map(call => call.name))].sort(), membership, prune, bound: receiver.calls };
  });
  expect(result.reads).toEqual(Object.fromEntries(["canSelect", "canCheck", "beforeSelect", "onSelect", "beforeSelectionChange", "onSelectionChange", "beforeCheckChange", "onCheckChange"].map(name => [name, 1])));
  expect(result.plain).toBe(true); expect(result.late).toBe(0); expect(result.called).toEqual(Object.keys(result.reads).sort());
  expect(result.membership).toEqual({ active: 1, selected: [1, 2], checked: [1, 2] }); expect(result.prune).toMatchObject({ active: null, selected: [2], checked: [2] });
  expect(result.prune.callbacks).toContainEqual({ name: "onSelect", id: null }); expect(result.prune.callbacks).toContainEqual({ name: "onSelectionChange", ids: [2] }); expect(result.prune.callbacks).toContainEqual({ name: "onCheckChange", ids: [2] }); expect(result.bound).toEqual(["bound"]);
});

test("Grid root native click keyboard checkbox and ARIA use the same captured multiple toggle and check modes", async ({ page }) => {
  await page.evaluate(() => {
    const h = window.selectionCapture, reads: Record<string, number> = {}, options = Object.create(null);
    for (const [key, value] of Object.entries({ multiple: true, toggleSelection: false, checkMode: "single" })) Object.defineProperty(options, key, { configurable: true, get() { reads[key] = (reads[key] ?? 0) + 1; return value; } });
    const owner = h.open("Grid", options); owner.root.dataset.nativeMode = "capture";
    for (const [key, value] of Object.entries({ multiple: false, toggleSelection: true, checkMode: "multiple" })) Object.defineProperty(options, key, { value });
    h.mode = owner; h.reads = reads;
  });
  const root = page.locator('[data-native-mode="capture"]');
  await root.getByRole("button", { name: "Ada", exact: true }).click();
  await root.getByRole("button", { name: "Grace", exact: true }).click({ modifiers: ["Control"] });
  const pair = await page.evaluate(() => window.selectionCapture.mode!.grid!.selectedIds()); expect(pair).toEqual([1, 2]);
  await root.getByRole("button", { name: "Grace", exact: true }).press("Control+a");
  expect(await page.evaluate(() => window.selectionCapture.mode!.grid!.selectedIds())).toEqual([1, 2, 3]);
  await root.getByRole("button", { name: "Grace", exact: true }).press("Escape");
  await root.getByRole("button", { name: "Ada", exact: true }).click(); await root.getByRole("button", { name: "Ada", exact: true }).click();
  await expect(root.getByRole("button", { name: "Ada", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(root.getByRole("button", { name: "Ada", exact: true })).toHaveAttribute("aria-current", "true");
  await root.locator("tbody input[data-check-row]").nth(0).check(); await root.locator("tbody input[data-check-row]").nth(1).check();
  await expect(root.locator("thead input[data-check-all]")).toBeDisabled();
  const output = await page.evaluate(() => { const h = window.selectionCapture, owner = h.mode!, grid = owner.grid!;
    const output = { reads: h.reads, active: grid.selected(), selected: grid.selectedIds(), checked: grid.checkedIds(), flags: [...owner.root.querySelectorAll<HTMLInputElement>("tbody [data-check-row]")].map(e => e.checked), changes: owner.rows.changes().length };
    owner.destroy(); return output; });
  expect(output).toEqual({ reads: { multiple: 1, toggleSelection: 1, checkMode: 1 }, active: 1, selected: [1], checked: [2], flags: [false, true, false], changes: 0 });
});

test("Grid captured absence cannot activate later callbacks and invalid captured options release all native claims", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.selectionCapture, names = ["canSelect", "canCheck", "beforeSelect", "onSelect", "beforeSelectionChange", "onSelectionChange", "beforeCheckChange", "onCheckChange"], reads: Record<string, number> = {}; let late = 0;
    const options = Object.create(null);
    for (const key of names) Object.defineProperty(options, key, { configurable: true, get() { reads[key] = (reads[key] ?? 0) + 1; return undefined; } });
    const owner = h.open("Grid", options); for (const key of names) Object.defineProperty(options, key, { value: () => { late++; return false; } });
    owner.grid!.select(1); owner.grid!.setSelected([1, 2]); owner.grid!.setChecked([1]); owner.rows.remove(1); await owner.grid!.whenBound();
    const absent = { late, reads, active: owner.grid!.selected(), selected: owner.grid!.selectedIds(), checked: owner.grid!.checkedIds() }; owner.destroy();
    const failures = [];
    for (const [key, value] of [...names.map(name => [name, false] as const), ["multiple", "yes"], ["toggleSelection", 1], ["checkMode", "other"]] as const) {
      const clean = h.open("Grid"); clean.grid!.dispose(); const markup = clean.root.innerHTML;
      let code = "none"; try { h.api.bindGrid(clean.root as HTMLTableElement, { rows: clean.rows, [key]: value }); } catch (error) { code = (error as { code: string }).code; }
      const unchanged = clean.root.innerHTML === markup, valid = h.api.bindGrid(clean.root as HTMLTableElement, { rows: clean.rows }); valid.dispose(); clean.rows.dispose(); clean.root.remove(); failures.push({ key, code, unchanged });
    }
    let veto = true, after = 0; const guarded = h.open("Grid", { beforeSelect: () => !veto, onSelect: () => after++ });
    guarded.grid!.select(1); const rejected = { selected: guarded.grid!.selected(), after }; veto = false; guarded.grid!.select(1); const accepted = { selected: guarded.grid!.selected(), after }; guarded.destroy();
    return { absent, failures, rejected, accepted };
  });
  expect(result.absent).toMatchObject({ late: 0, active: null, selected: [2], checked: [] }); expect(Object.values(result.absent.reads)).toEqual(Array(8).fill(1));
  for (const failure of result.failures) { expect(failure.code).toMatch(/^GRID_(SELECTION|CHECK|CHECK_MODE)$/); expect(failure.unchanged).toBe(true); }
  expect(result.rejected).toEqual({ selected: null, after: 0 }); expect(result.accepted).toEqual({ selected: 1, after: 1 });
});

test("List captures onSelect getter once for native model and pruning transitions with explicit forwarding and bound receivers", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.selectionCapture, seen: (number | null)[] = []; let reads = 0, late = 0, plain = true;
    const options = Object.defineProperty({}, "onSelect", { configurable: true, get() { reads++; return function(this: unknown, change: { id: number | null }) { "use strict"; plain &&= this === undefined; seen.push(change.id); }; } });
    const owner = h.open("List", options); Object.defineProperty(options, "onSelect", { value: () => late++ });
    owner.root.querySelector<HTMLButtonElement>("button")!.click(); Reflect.deleteProperty(options, "onSelect"); owner.list!.select(2); owner.rows.remove(2); owner.destroy();
    const absentOptions = Object.defineProperty({}, "onSelect", { configurable: true, value: undefined }); const absent = h.open("List", absentOptions);
    Object.defineProperty(absentOptions, "onSelect", { value: () => late++ }); absent.list!.select(1); absent.destroy();
    let policy = (_change: unknown) => "first", values: string[] = []; const live = h.open("List", { onSelect: (change: unknown) => values.push(policy(change)) });
    live.list!.select(1); policy = () => "second"; live.list!.select(2); live.destroy();
    const receiver = { word: "bound", seen: [] as string[], run(this: { word: string; seen: string[] }) { this.seen.push(this.word); } };
    const bound = h.open("List", { onSelect: receiver.run.bind(receiver) }); bound.list!.select(1); bound.destroy();
    const invalid = h.open("List"); invalid.list!.dispose(); const markup = invalid.root.innerHTML; let error = "none";
    const bad = { rows: invalid.rows }; Reflect.set(bad, "onSelect", false);
    try { h.api.bindList(invalid.root as HTMLUListElement, bad); } catch (cause) { error = (cause as { code: string }).code; }
    const unchanged = markup === invalid.root.innerHTML, reusable = h.api.bindList(invalid.root as HTMLUListElement, { rows: invalid.rows }); reusable.dispose(); invalid.rows.dispose(); invalid.root.remove();
    return { reads, late, plain, seen, values, bound: receiver.seen, invalid: { error, unchanged } };
  });
  expect(result).toEqual({ reads: 1, late: 0, plain: true, seen: [1, 2, null], values: ["first", "second"], bound: ["bound"], invalid: { error: "LIST_SELECT", unchanged: true } });
});
