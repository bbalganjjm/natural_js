import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Rows } from "../../src/data/index.js";
import type { GridHandle } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Employee = {
  name: string;
  team: number | string | null;
  group: string;
  active: boolean;
  score: number;
  selectable: boolean;
  checkable: boolean;
};
type Options = Parameters<typeof bindGrid<Employee>>[1];
type Hooks = Pick<Options, "beforeSelect" | "beforeSelectionChange" | "beforeCheckChange" | "onSelect" |
  "onSelectionChange" | "onCheckChange" | "onRowAction">;

declare global {
  interface Window {
    selectionFixture: {
      grid: GridHandle<Employee>;
      rows: Rows<Employee>;
      table: HTMLTableElement;
      original: string;
      hooks: Hooks;
      events: { kind: string; id?: number | null; ids?: readonly number[]; previous?: readonly number[];
        type: string | null; active: number | null; selected: readonly number[]; checked: readonly number[] }[];
      storeEvents: number;
      rebind: (extra?: Partial<Options>) => void;
    };
  }
}

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts"),
  form: source("../../src/ui/form.ts"), list: source("../../src/ui/list.ts"), select: source("../../src/ui/select.ts") };
const markup = `<caption>Selection assignments</caption><thead><tr>
  <th scope="col" data-column="name" aria-sort="none"><button type="button" data-sort-column="name">Employee</button></th>
  <th scope="col" data-column="check"><label>Check visible <input type="checkbox" data-check-all="visible"></label></th>
  <th scope="col" data-column="team"><label>Team filter <select multiple data-filter-column="team"><option value="authored">Original</option></select></label>
    <label>Find team <input type="search" data-filter-search="team"></label><button type="button" data-clear-filter="team">Reset team</button></th>
  <th scope="col" data-column="group"><label>Group filter <select multiple data-filter-column="group"></select></label></th>
  <th scope="col" data-column="active">Active</th><th scope="col" data-column="score">Score</th><th scope="col" data-column="actions">Actions</th>
  </tr></thead><tbody><tr data-row-template>
  <th scope="row" data-column="name"><button type="button" data-select-row><span data-field="name"></span></button></th>
  <td data-column="check"><label>Check employee <input type="checkbox" data-check-row></label></td>
  <td data-column="team" data-field="team"></td><td data-column="group" data-field="group"></td>
  <td data-column="active"><label>Active <input type="checkbox" data-field="active"></label></td>
  <td data-column="score"><label>Score <input type="number" data-field="score" required min="1"></label><output data-error-for="score"></output></td>
  <td data-column="actions"><button type="button" data-row-action="inspect">Inspect employee</button></td></tr></tbody>`;

test.beforeEach(async ({ page }) => {
  // Source-import fixtures do not test Vite's dependency-discovery reloads.
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const table = document.createElement("table");
    table.dataset.selectionFixture = "";
    table.innerHTML = markup;
    document.body.append(table);
    const rows = createRows([
      { name: "Ada", team: 1, group: "red", active: true, score: 10, selectable: true, checkable: true },
      { name: "Bjarne", team: "1", group: "blue", active: true, score: 20, selectable: true, checkable: true },
      { name: "Grace", team: 1, group: "blue", active: true, score: 30, selectable: false, checkable: true },
      { name: "Linus", team: "1", group: "red", active: true, score: 40, selectable: true, checkable: false },
      { name: "Margaret", team: 2, group: "red", active: true, score: 50, selectable: true, checkable: true },
      { name: "Yukihiro", team: null, group: "blue", active: true, score: 60, selectable: true, checkable: true }
    ]);
    const original = table.outerHTML;
    const hooks: Hooks = {};
    const events: Window["selectionFixture"]["events"] = [];
    const record = (kind: string, change: { id?: number | null; ids?: readonly number[]; previous?: readonly number[]; event: Event | null }) => {
      const grid = window.selectionFixture.grid;
      events.push({ kind, ...(change.id !== undefined ? { id: change.id } : {}),
        ...(change.ids ? { ids: change.ids, previous: change.previous } : {}), type: change.event?.type ?? null,
        active: grid.selected(), selected: grid.selectedIds(), checked: grid.checkedIds() });
    };
    const options: Options = {
      rows, multiple: true,
      canSelect: row => row.value.selectable, canCheck: row => row.value.checkable,
      sorts: { name: (left, right) => left.name.localeCompare(right.name) },
      filters: { team: { value: row => row.team, label: value => value === null ? "Unassigned" : `${typeof value}: ${value}` },
        group: { value: row => row.group } },
      parse: { score: value => { if (!value) throw new Error("Score is required."); return Number(value); } },
      beforeSelect: change => hooks.beforeSelect?.(change),
      beforeSelectionChange: change => hooks.beforeSelectionChange?.(change),
      beforeCheckChange: change => hooks.beforeCheckChange?.(change),
      onSelect: change => { record("active", change); hooks.onSelect?.(change); },
      onSelectionChange: change => { record("selected", change); hooks.onSelectionChange?.(change); },
      onCheckChange: change => { record("checked", change); hooks.onCheckChange?.(change); },
      onRowAction: change => hooks.onRowAction?.(change)
    };
    const fixture = { grid: null as unknown as GridHandle<Employee>, rows, table, original, hooks, events, storeEvents: 0,
      rebind(extra: Partial<Options> = {}) { fixture.grid.dispose(); fixture.grid = bindGrid(table, { ...options, ...extra }); } };
    window.selectionFixture = fixture;
    fixture.grid = bindGrid(table, options);
    rows.subscribe(() => fixture.storeEvents++);
  }, { modules, markup });
});

test("active detail stays independent from immutable store-ordered membership and checks", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.selectionFixture;
    h.grid.select(2);
    h.grid.setSelected([5, 1]);
    h.grid.setChecked([6, 2]);
    const selected = h.grid.selectedIds();
    const checked = h.grid.checkedIds();
    h.grid.setSort((left, right) => right.name.localeCompare(left.name));
    h.grid.setFilter(row => row.group === "red");
    h.grid.setPage({ page: 1, size: 1 });
    const retained = { active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds() };
    h.grid.setSelected([]);
    h.grid.setChecked([]);
    return { retained, oldSnapshots: [selected, checked], frozen: Object.isFrozen(selected) && Object.isFrozen(checked),
      active: h.grid.selected(), events: h.events.map(({ kind, type }) => [kind, type]), storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ retained: { active: 2, selected: [1, 5], checked: [2, 6] }, oldSnapshots: [[1, 5], [2, 6]],
    frozen: true, active: 2, events: [["active", null], ["selected", null], ["checked", null], ["selected", null], ["checked", null]], storeEvents: 0 });
});

test("default row activation still synchronizes List and Form without creating batch membership", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindForm } = await import(modules.form);
    const { bindList } = await import(modules.list);
    const h = window.selectionFixture;
    const listRoot = document.createElement("ul");
    listRoot.innerHTML = '<li data-row-template><button type="button" data-select-row><span data-field="name"></span></button></li>';
    const formRoot = document.createElement("form");
    formRoot.innerHTML = '<label>Selected name <input data-field="name"></label>';
    document.body.append(listRoot, formRoot);
    const list = bindList(listRoot, { rows: h.rows });
    const form = bindForm(formRoot, { rows: h.rows });
    h.hooks.onSelect = ({ id }) => { list.select(id); form.bind(id); };
    h.rebind({ multiple: false });
    const button = h.table.querySelectorAll<HTMLButtonElement>("tbody [data-select-row]")[1];
    button.click();
    const result = { active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      list: list.selected(), detail: formRoot.querySelector("input")!.value, pressed: button.getAttribute("aria-pressed") };
    form.dispose(); list.dispose(); listRoot.remove(); formRoot.remove();
    return result;
  }, modules);
  expect(result).toEqual({ active: 2, selected: [], checked: [], list: 2, detail: "Bjarne", pressed: "true" });
});

test("plain, Ctrl, Shift and Ctrl+Shift gestures use the eligible visible order", async ({ page }) => {
  const buttons = page.locator('[data-selection-fixture] tbody [data-select-row]');
  await buttons.nth(0).click();
  await buttons.nth(4).click({ modifiers: ["Control"] });
  expect(await page.evaluate(() => window.selectionFixture.grid.selectedIds())).toEqual([1, 5]);
  await buttons.nth(1).click({ modifiers: ["Shift"] });
  expect(await page.evaluate(() => window.selectionFixture.grid.selectedIds())).toEqual([2, 4, 5]);
  await buttons.nth(0).click({ modifiers: ["Control", "Shift"] });
  expect(await page.evaluate(() => window.selectionFixture.grid.selectedIds())).toEqual([1, 2, 4, 5]);
  await buttons.nth(1).click({ modifiers: ["Control"] });
  expect(await page.evaluate(() => window.selectionFixture.grid.selectedIds())).toEqual([1, 4, 5]);
  await page.evaluate(() => window.selectionFixture.grid.setPage({ page: 2, size: 2 }));
  await page.locator('[data-selection-fixture] tbody [data-select-row]').nth(1).click({ modifiers: ["Shift"] });
  const result = await page.evaluate(() => ({ active: window.selectionFixture.grid.selected(), selected: window.selectionFixture.grid.selectedIds(),
    checks: window.selectionFixture.grid.checkedIds(), storeEvents: window.selectionFixture.storeEvents }));
  expect(result).toEqual({ active: 4, selected: [4], checks: [], storeEvents: 0 });
});

test("native keyboard navigation skips ineligible rows and leaves editing shortcuts intact", async ({ page }) => {
  const buttons = page.locator('[data-selection-fixture] tbody [data-select-row]');
  await buttons.first().focus();
  await page.keyboard.press("Shift+ArrowDown");
  expect(await page.evaluate(() => window.selectionFixture.grid.selectedIds())).toEqual([1, 2]);
  await buttons.first().click();
  await buttons.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(buttons.nth(1)).toBeFocused();
  await page.keyboard.press("Shift+ArrowDown");
  await expect(buttons.nth(3)).toBeFocused();
  expect(await page.evaluate(() => window.selectionFixture.grid.selectedIds())).toEqual([1, 2, 4]);
  await page.keyboard.press("End");
  await expect(buttons.nth(5)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(buttons.first()).toBeFocused();
  await page.keyboard.press("Control+a");
  expect(await page.evaluate(() => window.selectionFixture.grid.selectedIds())).toEqual([1, 2, 4, 5, 6]);
  const active = await page.evaluate(() => window.selectionFixture.grid.selected());
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => ({ selected: window.selectionFixture.grid.selectedIds(), active: window.selectionFixture.grid.selected() })))
    .toEqual({ selected: [], active });
  const editor = page.locator('[data-selection-fixture] tbody [data-field="score"]').first();
  await editor.focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Escape");
  await expect(editor).toBeFocused();
  expect(await page.evaluate(() => window.selectionFixture.grid.selectedIds())).toEqual([]);
  await buttons.nth(1).focus();
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.selectionFixture.grid.selectedIds())).toEqual([2]);
});

test("veto preserves active row, membership, focus and the range anchor", async ({ page }) => {
  const buttons = page.locator('[data-selection-fixture] tbody [data-select-row]');
  await buttons.first().click();
  await buttons.first().focus();
  await page.evaluate(() => { window.selectionFixture.hooks.beforeSelectionChange = () => false; });
  await page.keyboard.press("Shift+ArrowDown");
  await expect(buttons.first()).toBeFocused();
  expect(await page.evaluate(() => ({ active: window.selectionFixture.grid.selected(), selected: window.selectionFixture.grid.selectedIds() })))
    .toEqual({ active: 1, selected: [1] });
  await page.evaluate(() => { window.selectionFixture.hooks.beforeSelectionChange = undefined; });
  await buttons.nth(3).click({ modifiers: ["Shift"] });
  expect(await page.evaluate(() => window.selectionFixture.grid.selectedIds())).toEqual([1, 2, 4]);
  const result = await page.evaluate(() => {
    const h = window.selectionFixture;
    h.hooks.beforeSelect = () => false;
    h.grid.select(5);
    h.hooks.beforeCheckChange = () => false;
    h.grid.setChecked([1, 2]);
    return { active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      pressed: [...h.table.querySelectorAll("tbody [aria-pressed='true']")].map(button => button.textContent) };
  });
  expect(result).toEqual({ active: 4, selected: [1, 2, 4], checked: [], pressed: ["Ada", "Bjarne", "Linus"] });
});

test("invalid ID batches fail atomically and unavailable rows disable only their own operations", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.selectionFixture;
    h.grid.setSelected([1]); h.grid.setChecked([2]);
    const before = h.table.outerHTML;
    const eventCount = h.events.length;
    const sparse = [1, 2]; delete sparse[0];
    const attempts = [() => h.grid.setSelected([2, 999]), () => h.grid.setSelected([2, 2]),
      () => h.grid.setSelected([1, 3]), () => h.grid.setSelected(sparse), () => h.grid.setChecked([1, 4]),
      () => h.grid.setChecked([2, 999]), () => h.grid.select(3)];
    const codes = attempts.map(run => { try { run(); return "none"; } catch (cause) { return (cause as { code: string }).code; } });
    const rows = [...h.table.tBodies[0].rows];
    return { codes, unchanged: h.table.outerHTML === before && h.events.length === eventCount,
      selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      selectDisabled: rows[2].querySelector<HTMLButtonElement>("[data-select-row]")!.disabled,
      checkDisabled: rows[3].querySelector<HTMLInputElement>("[data-check-row]")!.disabled,
      unrelatedEditorsEnabled: rows[2].querySelector<HTMLInputElement>('[data-field="score"]')!.disabled === false &&
        rows[3].querySelector<HTMLInputElement>('[data-field="active"]')!.disabled === false };
  });
  expect(result.codes.every(code => code !== "none")).toBe(true);
  expect(result).toMatchObject({ unchanged: true, selected: [1], checked: [2], selectDisabled: true, checkDisabled: true, unrelatedEditorsEnabled: true });
});

test("scoped check-all preserves outside checks and native mixed states apart from Boolean fields", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.selectionFixture;
    h.grid.setChecked([6]);
    h.grid.setFilter(row => row.group === "red");
    h.grid.setPage({ page: 1, size: 2 });
    h.grid.checkAll(true, "visible");
    const visible = h.grid.checkState("visible");
    const filtered = h.grid.checkState("filtered");
    h.grid.checkAll(true, "filtered");
    const allFiltered = h.grid.checkedIds();
    h.grid.checkAll(false, "visible");
    const clearedVisible = h.grid.checkedIds();
    const header = h.table.querySelector<HTMLInputElement>("[data-check-all]")!;
    h.grid.setPage(null);
    const mixed = { checked: header.checked, indeterminate: header.indeterminate, disabled: header.disabled };
    h.grid.checkAll(true, "store");
    const all = h.grid.checkState("store");
    h.grid.setFilter(() => false);
    return { visible, filtered, allFiltered, clearedVisible, mixed, all, checked: h.grid.checkedIds(),
      empty: h.grid.checkState("visible"), emptyDisabled: header.disabled,
      frozen: Object.isFrozen(visible) && Object.isFrozen(all), activeValues: h.rows.entries().map(row => row.value.active), storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ visible: { checked: true, indeterminate: false, total: 1, count: 1 },
    filtered: { checked: false, indeterminate: true, total: 2, count: 1 }, allFiltered: [1, 5, 6], clearedVisible: [5, 6],
    mixed: { checked: false, indeterminate: true, disabled: false }, all: { checked: true, indeterminate: false, total: 5, count: 5 },
    checked: [1, 2, 3, 5, 6], empty: { checked: false, indeterminate: false, total: 0, count: 0 }, emptyDisabled: true,
    frozen: true, activeValues: [true, true, true, true, true, true], storeEvents: 0 });
  await page.evaluate(() => window.selectionFixture.grid.setFilter(null));
  const first = page.locator('[data-selection-fixture] tbody tr').first();
  await first.locator("[data-check-row]").uncheck();
  expect(await page.evaluate(() => window.selectionFixture.grid.checkedIds())).toEqual([2, 3, 5, 6]);
  await first.locator('[data-field="active"]').uncheck();
  expect(await page.evaluate(() => ({ checked: window.selectionFixture.grid.checkedIds(), active: window.selectionFixture.rows.get(1)!.value.active,
    notifications: window.selectionFixture.storeEvents }))).toEqual({ checked: [2, 3, 5, 6], active: false, notifications: 1 });
});

test("header checks use native Space activation and veto restores their DOM state", async ({ page }) => {
  const header = page.locator('[data-selection-fixture] [data-check-all]');
  await page.evaluate(() => {
    const h = window.selectionFixture;
    h.grid.setPage({ page: 1, size: 2 });
    h.grid.setChecked([1]);
    h.hooks.beforeCheckChange = () => false;
  });
  await header.focus();
  await page.keyboard.press("Space");
  expect(await header.evaluate((element: HTMLInputElement) => ({ checked: element.checked, mixed: element.indeterminate })))
    .toEqual({ checked: false, mixed: true });
  await page.evaluate(() => { window.selectionFixture.hooks.beforeCheckChange = undefined; });
  await page.keyboard.press("Space");
  await expect(header).toBeChecked();
  expect(await page.evaluate(() => ({ checked: window.selectionFixture.grid.checkedIds(), type: window.selectionFixture.events.at(-1)!.type })))
    .toEqual({ checked: [1, 2], type: "change" });
});

test("data removal and eligibility changes force pruning despite vetoes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.selectionFixture;
    h.grid.select(2); h.grid.setSelected([1, 2]); h.grid.setChecked([1, 2, 3]);
    let vetoCalls = 0;
    h.hooks.beforeSelect = h.hooks.beforeSelectionChange = h.hooks.beforeCheckChange = () => { vetoCalls++; return false; };
    h.rows.remove(2);
    const removed = { active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds() };
    h.rows.set(1, "selectable", false); h.rows.set(3, "checkable", false);
    const changedEligibility = { selected: h.grid.selectedIds(), checked: h.grid.checkedIds() };
    h.rows.replace([{ name: "New", team: null, group: "red", active: true, score: 1, selectable: true, checkable: true }]);
    return { removed, changedEligibility, replaced: { selected: h.grid.selectedIds(), checked: h.grid.checkedIds() }, vetoCalls,
      pruneEvents: h.events.slice(3).map(event => [event.kind, event.type]) };
  });
  expect(result).toEqual({ removed: { active: null, selected: [1], checked: [1, 3] },
    changedEligibility: { selected: [], checked: [1] }, replaced: { selected: [], checked: [] }, vetoCalls: 0,
    pruneEvents: [["active", null], ["selected", null], ["checked", null], ["selected", null], ["checked", null], ["checked", null]] });
});

test("prune callbacks may change Rows or the view and throwing callbacks leave cleanup committed", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.selectionFixture;
    function reset() {
      h.hooks.onSelect = undefined; h.hooks.onSelectionChange = undefined; h.hooks.onCheckChange = undefined;
      h.rows.revert(); h.rebind();
      h.grid.select(1); h.grid.setSelected([1]); h.grid.setChecked([1, 2, 3]);
    }
    function state() {
      const header = h.table.querySelector<HTMLInputElement>("[data-check-all]")!;
      return { names: [...h.table.querySelectorAll("tbody [data-select-row]")].map(button => button.textContent),
        active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
        scope: h.grid.checkState("visible"), header: { checked: header.checked, mixed: header.indeterminate } };
    }
    reset();
    h.hooks.onSelect = ({ id }) => { if (id === null) h.rows.remove(2); };
    h.rows.remove(1);
    const activeCallback = state();
    reset();
    h.hooks.onSelectionChange = ({ ids }) => {
      if (ids.length) return;
      h.rows.remove(2); h.grid.setFilter(row => row.group === "blue");
    };
    h.rows.remove(1);
    const selectionCallback = state();
    reset();
    h.hooks.onCheckChange = ({ ids }) => {
      if (!ids.includes(2)) return;
      h.rows.remove(2); h.grid.setPage({ page: 1, size: 1 });
    };
    h.rows.remove(1);
    const checkCallback = state();
    const throws = ["active", "selected", "checked"].map(kind => {
      reset();
      let sawCommitted = false;
      const fail = () => {
        const committed = state();
        sawCommitted = committed.names.length === 5 && !committed.names.includes("Ada") &&
          committed.selected.length === 0 && committed.checked.join() === "2,3" && committed.scope.total === 4;
        throw new Error("prune callback failed");
      };
      if (kind === "active") h.hooks.onSelect = fail;
      if (kind === "selected") h.hooks.onSelectionChange = fail;
      if (kind === "checked") h.hooks.onCheckChange = fail;
      let message = "";
      try { h.rows.remove(1); } catch (cause) { message = (cause as Error).message; }
      return { kind, sawCommitted, message, state: state(), deleted: h.rows.get(1)!.status === "delete" };
    });
    return { activeCallback, selectionCallback, checkCallback, throws };
  });
  const common = { active: null, selected: [], checked: [3] };
  expect(result.activeCallback).toEqual({ ...common, names: ["Grace", "Linus", "Margaret", "Yukihiro"],
    scope: { checked: false, indeterminate: true, total: 3, count: 1 }, header: { checked: false, mixed: true } });
  expect(result.selectionCallback).toEqual({ ...common, names: ["Grace", "Yukihiro"],
    scope: { checked: false, indeterminate: true, total: 2, count: 1 }, header: { checked: false, mixed: true } });
  expect(result.checkCallback).toEqual({ ...common, names: ["Grace"],
    scope: { checked: true, indeterminate: false, total: 1, count: 1 }, header: { checked: true, mixed: false } });
  expect(result.throws).toEqual(["active", "selected", "checked"].map(kind => ({ kind, sawCommitted: true,
    message: "prune callback failed", deleted: true, state: { active: null, selected: [], checked: [2, 3],
      names: ["Bjarne", "Grace", "Linus", "Margaret", "Yukihiro"],
      scope: { checked: false, indeterminate: true, total: 4, count: 2 }, header: { checked: false, mixed: true } } })));
});

test("before hooks reject view changes even when every projected row ID stays the same", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.selectionFixture;
    const operations = [() => h.grid.setPage({ page: 1, size: 10 }), () => h.grid.setSort(() => 0), () => h.grid.setFilter(() => true)];
    const transitions = operations.map(changeView => {
      h.hooks.beforeSelectionChange = changeView;
      let code = "";
      try { h.grid.setSelected([1]); } catch (cause) { code = (cause as { code: string }).code; }
      return { code, selected: h.grid.selectedIds(), page: h.grid.page(),
        names: [...h.table.querySelectorAll("tbody [data-select-row]")].map(button => button.textContent) };
    });
    return { transitions, storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ transitions: Array.from({ length: 3 }, () => ({ code: "GRID_SELECTION", selected: [],
    page: { page: 1, size: 10, total: 6, pages: 1 }, names: ["Ada", "Bjarne", "Grace", "Linus", "Margaret", "Yukihiro"] })), storeEvents: 0 });
});

test("post callbacks see committed DOM and before-hook reentrancy rejects stale proposals", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.selectionFixture;
    let beforeSnapshot = false;
    h.hooks.beforeSelectionChange = change => {
      beforeSnapshot = change.event === null && change.previous.length === 0 && h.grid.selectedIds().length === 0 &&
        h.table.querySelector("tbody [data-select-row]")!.getAttribute("aria-pressed") === "false";
    };
    let observed = false;
    h.hooks.onSelectionChange = change => {
      observed = Object.isFrozen(change) && Object.isFrozen(change.ids) && Object.isFrozen(change.previous) &&
        h.grid.selectedIds().join() === change.ids.join() &&
        h.table.querySelector("tbody [data-select-row]")!.getAttribute("aria-pressed") === "true";
      throw new Error("consumer failed");
    };
    let post = "";
    try { h.grid.setSelected([1]); } catch (cause) { post = (cause as Error).message; }
    const committed = h.grid.selectedIds();
    h.hooks.onSelectionChange = undefined;
    h.hooks.beforeSelectionChange = () => { h.grid.setChecked([2]); };
    let stale = "";
    try { h.grid.setSelected([5]); } catch (cause) { stale = (cause as { code: string }).code; }
    const afterStateChange = { selected: h.grid.selectedIds(), checked: h.grid.checkedIds() };
    h.hooks.beforeSelectionChange = () => { h.grid.setFilter(row => row.group === "red"); };
    let staleView = "";
    try { h.grid.setSelected([5]); } catch (cause) { staleView = (cause as { code: string }).code; }
    h.hooks.beforeSelectionChange = () => { h.rows.set(2, "score", 21); };
    let staleData = "";
    try { h.grid.setSelected([5]); } catch (cause) { staleData = (cause as { code: string }).code; }
    h.hooks.beforeSelectionChange = () => { throw new Error("before failed"); };
    let before = "";
    try { h.grid.setSelected([5]); } catch (cause) { before = (cause as Error).message; }
    return { beforeSnapshot, observed, post, committed, stale, afterStateChange, staleView, staleData, before, final: h.grid.selectedIds(), storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ beforeSnapshot: true, observed: true, post: "consumer failed", committed: [1], stale: "GRID_SELECTION",
    afterStateChange: { selected: [1], checked: [2] }, staleView: "GRID_SELECTION", staleData: "GRID_SELECTION", before: "before failed", final: [1], storeEvents: 1 });
});

test("authored sorts cycle ascending, descending and clear while preserving focus and state", async ({ page }) => {
  const sort = page.locator('[data-selection-fixture] [data-sort-column]');
  await page.evaluate(() => { const h = window.selectionFixture; h.grid.select(1); h.grid.setSelected([1, 5]); h.grid.setChecked([2]); });
  await sort.focus();
  await page.keyboard.press("Enter");
  await expect(sort.locator("..")).toHaveAttribute("aria-sort", "ascending");
  await page.keyboard.press("Space");
  await expect(sort.locator("..")).toHaveAttribute("aria-sort", "descending");
  await expect(page.locator('[data-selection-fixture] tbody [data-select-row]').first()).toHaveText("Yukihiro");
  await page.keyboard.press("Enter");
  await expect(sort.locator("..")).toHaveAttribute("aria-sort", "none");
  await expect(page.locator('[data-selection-fixture] tbody [data-select-row]').first()).toHaveText("Ada");
  await expect(sort).toBeFocused();
  expect(await page.evaluate(() => ({ active: window.selectionFixture.grid.selected(), selected: window.selectionFixture.grid.selectedIds(),
    checked: window.selectionFixture.grid.checkedIds(), storeEvents: window.selectionFixture.storeEvents })))
    .toEqual({ active: 1, selected: [1, 5], checked: [2], storeEvents: 0 });
});

test("column choices keep raw scalar identity and count other filters before pagination", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.selectionFixture;
    const all = h.grid.filterChoices("team");
    h.grid.setPage({ page: 1, size: 1 });
    h.grid.setColumnFilter("team", [1]);
    const selfExcluded = h.grid.filterChoices("team");
    h.grid.setColumnFilter("group", ["blue"]);
    const otherFilter = h.grid.filterChoices("team");
    const groupChoices = h.grid.filterChoices("group");
    h.grid.setFilter(row => row.score >= 20);
    const manualAndOther = h.grid.filterChoices("team");
    const search = h.grid.filterChoices("team", "number");
    const selected = h.grid.columnFilter("team");
    h.grid.setColumnFilter("team", ["1"]);
    const rawText = [...h.table.querySelectorAll("tbody [data-select-row]")].map(button => button.textContent);
    h.grid.setColumnFilter("team", []);
    const none = h.table.tBodies[0].rows.length;
    h.grid.setColumnFilter("team", null);
    return { all, selfExcluded, otherFilter, groupChoices, manualAndOther, search, selected, rawText, none,
      reset: h.grid.columnFilter("team"), frozen: Object.isFrozen(all) && all.every(Object.isFrozen) && Object.isFrozen(selected), storeEvents: h.storeEvents };
  });
  const all = [{ value: 1, label: "number: 1", count: 2 }, { value: "1", label: "string: 1", count: 2 },
    { value: 2, label: "number: 2", count: 1 }, { value: null, label: "Unassigned", count: 1 }];
  const blue = [{ value: "1", label: "string: 1", count: 1 }, { value: 1, label: "number: 1", count: 1 }, { value: null, label: "Unassigned", count: 1 }];
  expect(result).toEqual({ all, selfExcluded: all, otherFilter: blue, groupChoices: [{ value: "red", label: "red", count: 1 }, { value: "blue", label: "blue", count: 1 }],
    manualAndOther: blue, search: [{ value: 1, label: "number: 1", count: 1 }], selected: [1], rawText: ["Bjarne"], none: 0, reset: null, frozen: true, storeEvents: 0 });
});

test("authored filter selects retain raw values and search narrows only the choices", async ({ page }) => {
  const filter = page.locator('[data-selection-fixture] [data-filter-column="team"]');
  const search = page.locator('[data-selection-fixture] [data-filter-search]');
  await filter.selectOption((await filter.locator("option").filter({ hasText: "number: 1" }).elementHandle())!);
  expect(await page.evaluate(() => window.selectionFixture.grid.columnFilter("team"))).toEqual([1]);
  await expect(page.locator('[data-selection-fixture] tbody tr')).toHaveCount(2);
  await search.fill("string");
  await expect(filter.locator("option").filter({ hasText: "string: 1" })).toHaveCount(1);
  await expect(filter.locator("option").filter({ hasText: "number:" })).toHaveCount(0);
  await expect(page.locator('[data-selection-fixture] tbody tr')).toHaveCount(2);
  expect(await page.evaluate(() => window.selectionFixture.grid.columnFilter("team"))).toEqual([1]);
  await filter.selectOption((await filter.locator("option").filter({ hasText: "string: 1" }).elementHandle())!);
  expect(await page.evaluate(() => window.selectionFixture.grid.columnFilter("team"))).toEqual([1, "1"]);
  await expect(page.locator('[data-selection-fixture] tbody tr')).toHaveCount(4);
  await search.fill("");
  await filter.selectOption((await filter.locator("option").filter({ hasText: "string: 1" }).elementHandle())!);
  expect(await page.evaluate(() => window.selectionFixture.grid.columnFilter("team"))).toEqual(["1"]);
  await expect(page.locator('[data-selection-fixture] tbody [data-select-row]').first()).toHaveText("Bjarne");
  await page.locator('[data-selection-fixture] [data-clear-filter]').click();
  expect(await page.evaluate(() => window.selectionFixture.grid.columnFilter("team"))).toBeNull();
  await expect(page.locator('[data-selection-fixture] tbody tr')).toHaveCount(6);
});

test("row actions resolve the current identity and retained drafts survive filtering, paging and layout", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.selectionFixture;
    const input = h.table.querySelector<HTMLInputElement>('tbody [data-field="score"]')!;
    input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true }));
    h.grid.select(1); h.grid.setSelected([1, 5]); h.grid.setChecked([2]);
    const actions: unknown[] = [];
    h.hooks.onRowAction = ({ action, id, row, element, event }) => actions.push({ action, id, name: row.value.name,
      current: h.rows.get(id) === row, connected: element.isConnected, type: event.type });
    h.grid.setSort((a, b) => b.name.localeCompare(a.name));
    h.table.querySelector<HTMLButtonElement>("tbody [data-row-action]")!.click();
    h.grid.setColumns([...h.grid.columns()].reverse());
    const sameInput = [...h.table.querySelectorAll('tbody [data-field="score"]')].includes(input);
    h.grid.setColumnFilter("group", ["blue"]);
    const hidden = h.grid.validate(1).issues.every(issue => !issue.element);
    h.grid.setPage({ page: 2, size: 1 });
    h.grid.setColumnFilter("group", null); h.grid.setPage(null);
    const returned = [...h.table.tBodies[0].rows].find(row => row.querySelector("[data-select-row]")!.textContent === "Ada")!;
    const restored = returned.querySelector<HTMLInputElement>('[data-field="score"]')!;
    return { actions, sameInput, hidden, recreated: restored !== input, draft: restored.value, invalid: restored.getAttribute("aria-invalid"),
      state: { active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds() }, stored: h.rows.get(1)!.value.score, storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ actions: [{ action: "inspect", id: 6, name: "Yukihiro", current: true, connected: true, type: "click" }],
    sameInput: true, hidden: true, recreated: true, draft: "", invalid: "true", state: { active: 1, selected: [1, 5], checked: [2] }, stored: 10, storeEvents: 0 });
});

test("two instances remain accessible and exact disposal releases authored filter ownership for retry", async ({ page }) => {
  const result = await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid);
    const { bindSelect } = await import(modules.select);
    const h = window.selectionFixture;
    const second = document.createElement("table"); second.innerHTML = markup; document.body.append(second);
    const secondOriginal = second.outerHTML;
    const other = bindGrid(second, { rows: h.rows, multiple: true, onRowAction: () => {}, parse: { score: Number },
      sorts: { name: (a: Employee, b: Employee) => a.name.localeCompare(b.name) },
      filters: { team: { value: (row: Employee) => row.team }, group: { value: (row: Employee) => row.group } } });
    h.grid.setSelected([1]); h.grid.setChecked([2]);
    const independent = other.selectedIds().length === 0 && other.checkedIds().length === 0;
    const input = h.table.querySelector<HTMLInputElement>('tbody [data-field="score"]')!;
    input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true }));
    const otherInput = second.querySelector<HTMLInputElement>('tbody [data-field="score"]')!;
    otherInput.value = ""; otherInput.dispatchEvent(new Event("input", { bubbles: true }));
    const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
    other.dispose();
    const secondRestored = second.outerHTML === secondOriginal;
    second.remove();
    const select = h.table.querySelector<HTMLSelectElement>('[data-filter-column="team"]')!;
    h.grid.dispose();
    const exact = h.table.outerHTML === h.original;
    const released = bindSelect(select, { choices: [{ label: "Ready", value: 1 }] }); released.dispose();
    let failed = false;
    try { bindGrid(h.table, { rows: h.rows, onRowAction: () => {}, parse: { score: Number },
      sorts: { name: (a: Employee, b: Employee) => a.name.localeCompare(b.name) },
      filters: { team: { value: () => { throw new Error("choice failure"); } }, group: { value: (row: Employee) => row.group } } }); }
    catch { failed = true; }
    const rollback = h.table.outerHTML === h.original;
    h.rebind();
    return { independent, uniqueIds: ids.length === new Set(ids).size, secondRestored, exact, failed, rollback,
      rebound: h.table.tBodies[0].rows.length, role: h.table.getAttribute("role") };
  }, { modules, markup });
  expect(result).toEqual({ independent: true, uniqueIds: true, secondRestored: true, exact: true, failed: true, rollback: true, rebound: 6, role: null });
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]).analyze();
  expect(axe.violations.map(violation => violation.id)).toEqual([]);
});
