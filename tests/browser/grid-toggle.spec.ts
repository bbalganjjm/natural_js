import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Rows } from "../../src/data/index.js";
import type { GridHandle } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Employee = { name: string; score: number; active: boolean; selectable: boolean };
type Options = Parameters<typeof bindGrid<Employee>>[1];
type Hooks = Pick<Options, "beforeSelect" | "beforeSelectionChange" | "onSelect" | "onSelectionChange">;
type Recorded = { kind: string; id?: number | null; ids?: readonly number[]; previous?: readonly number[];
  type: string | null; active: number | null; selected: readonly number[]; checked: readonly number[]; pressed: readonly string[] };

declare global {
  interface Window {
    toggleFixture: {
      grid: GridHandle<Employee>;
      rows: Rows<Employee>;
      table: HTMLTableElement;
      original: string;
      hooks: Hooks;
      events: Recorded[];
      storeEvents: number;
      actions: number;
      rebind: (extra?: Partial<Options>) => void;
    };
  }
}

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts"),
  form: source("../../src/ui/form.ts"), list: source("../../src/ui/list.ts") };
const markup = `<caption>Toggle assignments</caption><thead><tr>
  <th scope="col" data-column="name">Employee</th><th scope="col" data-column="check">Check</th>
  <th scope="col" data-column="active">Active</th><th scope="col" data-column="score">Score</th>
  <th scope="col" data-column="actions">Actions</th></tr></thead><tbody><tr data-row-template>
  <th scope="row" data-column="name"><button type="button" data-select-row><span data-field="name"></span></button></th>
  <td data-column="check"><label>Check employee <input type="checkbox" data-check-row></label></td>
  <td data-column="active"><label>Active <input type="checkbox" data-field="active"></label></td>
  <td data-column="score"><label>Score <input type="number" data-field="score" required min="1"></label><output data-error-for="score"></output></td>
  <td data-column="actions"><button type="button" data-row-action="inspect">Inspect employee</button></td>
</tr></tbody>`;

test.beforeEach(async ({ page }) => {
  // These source imports do not exercise Vite dependency-discovery reloads.
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const table = document.createElement("table");
    table.dataset.toggleFixture = "";
    table.innerHTML = markup;
    document.body.append(table);
    const rows = createRows([
      { name: "Ada", score: 10, active: true, selectable: true },
      { name: "Bjarne", score: 20, active: true, selectable: true },
      { name: "Grace", score: 30, active: true, selectable: false },
      { name: "Linus", score: 40, active: true, selectable: true }
    ]);
    const original = table.outerHTML;
    const hooks: Hooks = {};
    const events: Recorded[] = [];
    const record = (kind: string, change: { id?: number | null; ids?: readonly number[]; previous?: readonly number[]; event: Event | null }) => {
      const grid = window.toggleFixture.grid;
      events.push({ kind, ...(change.id !== undefined ? { id: change.id } : {}),
        ...(change.ids ? { ids: change.ids, previous: change.previous } : {}), type: change.event?.type ?? null,
        active: grid.selected(), selected: grid.selectedIds(), checked: grid.checkedIds(),
        pressed: [...table.querySelectorAll("tbody [aria-pressed='true']")].map(button => button.textContent!) });
    };
    const options: Options = {
      rows, multiple: true, canSelect: row => row.value.selectable, parse: { score: Number },
      beforeSelect: change => hooks.beforeSelect?.(change),
      beforeSelectionChange: change => hooks.beforeSelectionChange?.(change),
      onSelect: change => { record("active", change); hooks.onSelect?.(change); },
      onSelectionChange: change => { record("selected", change); hooks.onSelectionChange?.(change); },
      onRowAction: () => window.toggleFixture.actions++
    };
    const fixture = { grid: null as unknown as GridHandle<Employee>, rows, table, original, hooks, events, storeEvents: 0, actions: 0,
      rebind(extra: Partial<Options> = {}) { fixture.grid.dispose(); fixture.grid = bindGrid(table, { ...options, ...extra }); } };
    window.toggleFixture = fixture;
    fixture.grid = bindGrid(table, options);
    rows.subscribe(() => fixture.storeEvents++);
  }, { modules, markup });
});

test("default and explicit false keep repeated single activation and independent absolute sets", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.toggleFixture;
    return [undefined, false].map(toggleSelection => {
      h.rebind({ multiple: false, toggleSelection }); h.events.length = 0;
      h.grid.setSelected([2]); h.grid.setChecked([4]);
      const button = h.table.querySelector<HTMLButtonElement>("tbody [data-select-row]")!;
      button.click(); const afterFirst = h.events.length; button.click();
      return { active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
        silentRepeat: h.events.length === afterFirst, pressed: button.getAttribute("aria-pressed"), storeEvents: h.storeEvents };
    });
  });
  expect(result).toEqual(Array.from({ length: 2 }, () => ({ active: 1, selected: [2], checked: [4],
    silentRepeat: true, pressed: "true", storeEvents: 0 })));
});

test("default and explicit false retain replacement rather than plain membership toggling", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.toggleFixture;
    return [undefined, false].map(toggleSelection => {
      h.rebind({ toggleSelection }); h.events.length = 0;
      const buttons = h.table.querySelectorAll<HTMLButtonElement>("tbody [data-select-row]");
      buttons[0].click(); buttons[3].click(); const count = h.events.length; buttons[3].click();
      return { active: h.grid.selected(), selected: h.grid.selectedIds(), silentRepeat: h.events.length === count,
        checked: h.grid.checkedIds(), storeEvents: h.storeEvents };
    });
  });
  expect(result).toEqual(Array.from({ length: 2 }, () => ({ active: 4, selected: [4], silentRepeat: true, checked: [], storeEvents: 0 })));
});

test("single toggle clears detail through existing Form and List callbacks without changing sets", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindForm } = await import(modules.form), { bindList } = await import(modules.list);
    const h = window.toggleFixture;
    h.rebind({ multiple: false, toggleSelection: true });
    const listRoot = document.createElement("ul"), formRoot = document.createElement("form");
    listRoot.innerHTML = '<li data-row-template><button type="button" data-select-row><span data-field="name"></span></button></li>';
    formRoot.innerHTML = '<label>Detail name <input data-field="name"></label>';
    document.body.append(listRoot, formRoot);
    const list = bindList(listRoot, { rows: h.rows }), form = bindForm(formRoot, { rows: h.rows });
    let clearedRow = false;
    h.hooks.onSelect = ({ id, row, event }) => { list.select(id); form.bind(id); if (id === null) clearedRow = row === null && event?.type === "click"; };
    h.grid.setSelected([2, 4]); h.grid.setChecked([2]); h.events.length = 0;
    const button = h.table.querySelector<HTMLButtonElement>("tbody [data-select-row]")!;
    button.click(); const opened = formRoot.querySelector("input")!.value; button.click();
    const result = { opened, cleared: formRoot.querySelector("input")!.value, list: list.selected(), clearedRow,
      active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      events: h.events.map(({ kind, id, type, pressed }) => ({ kind, id, type, pressed })), storeEvents: h.storeEvents };
    form.dispose(); list.dispose(); listRoot.remove(); formRoot.remove();
    return result;
  }, modules);
  expect(result).toEqual({ opened: "Ada", cleared: "", list: null, clearedRow: true, active: null, selected: [2, 4], checked: [2],
    events: [{ kind: "active", id: 1, type: "click", pressed: ["Ada"] }, { kind: "active", id: null, type: "click", pressed: [] }], storeEvents: 0 });
});

test("multiple plain toggles retain other members and clear active when any member is removed", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.toggleFixture; h.rebind({ toggleSelection: true }); h.grid.setChecked([2]);
    const buttons = h.table.querySelectorAll<HTMLButtonElement>("tbody [data-select-row]");
    buttons[0].click(); const first = h.grid.selectedIds(); buttons[3].click(); const both = h.grid.selectedIds();
    h.events.length = 0; buttons[0].click();
    return { active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      snapshots: [first, both], frozen: Object.isFrozen(first) && Object.isFrozen(both),
      events: h.events.map(({ kind, id, ids, previous, active, selected, checked, pressed, type }) =>
        ({ kind, id, ids, previous, active, selected, checked, pressed, type })), storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ active: null, selected: [4], checked: [2], snapshots: [[1], [1, 4]], frozen: true,
    events: [
      { kind: "active", id: null, ids: undefined, previous: undefined, active: null, selected: [4], checked: [2], pressed: ["Linus"], type: "click" },
      { kind: "selected", id: undefined, ids: [4], previous: [1, 4], active: null, selected: [4], checked: [2], pressed: ["Linus"], type: "click" }
    ], storeEvents: 0 });
});

test("native Enter and Space activate exactly one toggle without replacing focus", async ({ page }) => {
  const button = page.locator('[data-toggle-fixture] tbody [data-select-row]').first();
  for (const multiple of [false, true]) {
    await page.evaluate(multiple => { window.toggleFixture.rebind({ multiple, toggleSelection: true }); window.toggleFixture.events.length = 0; }, multiple);
    await button.focus(); await page.keyboard.press("Enter");
    expect(await page.evaluate(() => window.toggleFixture.grid.selected())).toBe(1);
    await page.keyboard.press("Space");
    expect(await page.evaluate(() => ({ active: window.toggleFixture.grid.selected(), ids: window.toggleFixture.grid.selectedIds(),
      events: window.toggleFixture.events.map(event => event.kind) }))).toEqual({ active: null, ids: [],
      events: multiple ? ["active", "selected", "active", "selected"] : ["active", "active"] });
    await expect(button).toBeFocused();
  }
});

test("Ctrl, Meta, Shift and Alt retain existing gestures when plain toggling is enabled", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.toggleFixture; h.rebind({ toggleSelection: true });
    const buttons = h.table.querySelectorAll<HTMLButtonElement>("tbody [data-select-row]");
    const activate = (index: number, modifiers: MouseEventInit = {}) => buttons[index].dispatchEvent(new MouseEvent("click", { bubbles: true, ...modifiers }));
    buttons[0].click(); activate(3, { ctrlKey: true }); activate(0, { ctrlKey: true });
    const ctrl = { active: h.grid.selected(), ids: h.grid.selectedIds() };
    activate(3, { metaKey: true }); const meta = { active: h.grid.selected(), ids: h.grid.selectedIds() };
    buttons[0].click(); activate(3, { shiftKey: true });
    const shift = { active: h.grid.selected(), ids: h.grid.selectedIds() };
    activate(1, { altKey: true }); const alt = { active: h.grid.selected(), ids: h.grid.selectedIds() };
    activate(1, { altKey: true }); const altRepeat = { active: h.grid.selected(), ids: h.grid.selectedIds() };
    h.rebind({ multiple: false, toggleSelection: true });
    const single = h.table.querySelector<HTMLButtonElement>("tbody [data-select-row]")!;
    single.click(); single.dispatchEvent(new MouseEvent("click", { bubbles: true, altKey: true }));
    return { ctrl, meta, shift, alt, altRepeat, single: h.grid.selected(), storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ ctrl: { active: 1, ids: [4] }, meta: { active: 4, ids: [] }, shift: { active: 4, ids: [1, 2, 4] },
    alt: { active: 2, ids: [2] }, altRepeat: { active: 2, ids: [2] }, single: 1, storeEvents: 0 });
});

test("programmatic activation and full-set writes stay absolute and idempotent with toggling", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.toggleFixture; h.rebind({ toggleSelection: true });
    h.grid.setSelected([4, 1]); h.grid.setChecked([2]); h.grid.select(1);
    const selected = h.grid.selectedIds(), checked = h.grid.checkedIds(), count = h.events.length;
    h.grid.select(1); h.grid.setSelected([1, 4]); h.grid.setChecked([2]);
    const silent = h.events.length === count && selected === h.grid.selectedIds() && checked === h.grid.checkedIds();
    h.grid.select(null); const afterClear = { active: h.grid.selected(), ids: h.grid.selectedIds(), checked: h.grid.checkedIds() };
    h.grid.setSelected([]); h.grid.select(4);
    return { silent, afterClear, final: { active: h.grid.selected(), ids: h.grid.selectedIds(), checked: h.grid.checkedIds() },
      allProgrammatic: h.events.every(event => event.type === null), storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ silent: true, afterClear: { active: null, ids: [1, 4], checked: [2] },
    final: { active: 4, ids: [], checked: [2] }, allProgrammatic: true, storeEvents: 0 });
});

test("single deselection veto leaves committed detail, membership and DOM unchanged", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.toggleFixture; h.rebind({ multiple: false, toggleSelection: true });
    h.grid.setSelected([4]); h.grid.setChecked([2]);
    const button = h.table.querySelector<HTMLButtonElement>("tbody [data-select-row]")!;
    button.click(); h.events.length = 0;
    let proposal = false;
    h.hooks.beforeSelect = change => { proposal = change.id === null && change.row === null && change.event?.type === "click"; return false; };
    button.click();
    return { proposal, active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      events: h.events, pressed: button.getAttribute("aria-pressed"), storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ proposal: true, active: 1, selected: [4], checked: [2], events: [], pressed: "true", storeEvents: 0 });
});

test("both multiple vetoes preserve state and the range anchor before any post callback", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.toggleFixture;
    return ["active", "selected"].map(kind => {
      h.hooks.beforeSelect = undefined; h.hooks.beforeSelectionChange = undefined;
      h.rebind({ toggleSelection: true });
      const buttons = h.table.querySelectorAll<HTMLButtonElement>("tbody [data-select-row]");
      buttons[0].click(); buttons[3].click(); h.grid.setChecked([2]); h.events.length = 0;
      const before: string[] = [];
      h.hooks.beforeSelect = () => { before.push("active"); return kind !== "active"; };
      h.hooks.beforeSelectionChange = () => { before.push("selected"); return false; };
      buttons[0].click();
      const rejected = { active: h.grid.selected(), ids: h.grid.selectedIds(), checked: h.grid.checkedIds(), events: h.events.length, before: [...before] };
      h.hooks.beforeSelect = undefined; h.hooks.beforeSelectionChange = undefined;
      buttons[1].dispatchEvent(new MouseEvent("click", { bubbles: true, shiftKey: true }));
      return { rejected, range: h.grid.selectedIds() };
    });
  });
  expect(result).toEqual([
    { rejected: { active: 4, ids: [1, 4], checked: [2], events: 0, before: ["active"] }, range: [2, 4] },
    { rejected: { active: 4, ids: [1, 4], checked: [2], events: 0, before: ["active", "selected"] }, range: [2, 4] }
  ]);
});

test("toggle before-hook reentrancy preserves inner commits and rejects the stale outer proposal", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.toggleFixture;
    const errors: string[] = [];
    const capture = (event: ErrorEvent) => { errors.push(event.error?.code ?? event.message); event.preventDefault(); };
    window.addEventListener("error", capture);
    try {
      return ["check", "view", "row"].map(kind => {
        h.hooks.beforeSelect = undefined; h.hooks.beforeSelectionChange = undefined;
        h.rebind({ toggleSelection: true }); h.grid.setSelected([1, 4]); h.grid.select(4); h.events.length = 0;
        const target = h.table.querySelector<HTMLButtonElement>("tbody [data-select-row]")!;
        h.hooks.beforeSelect = () => {
          h.hooks.beforeSelect = undefined;
          if (kind === "check") h.grid.setChecked([2]);
          if (kind === "view") h.grid.setSort((a, b) => b.name.localeCompare(a.name));
          if (kind === "row") h.rows.set(2, "score", 21);
        };
        target.click();
        return { kind, code: errors.at(-1), active: h.grid.selected(), ids: h.grid.selectedIds(), checked: h.grid.checkedIds(),
          score: h.rows.get(2)!.value.score, postEvents: h.events.length };
      });
    } finally { window.removeEventListener("error", capture); }
  });
  expect(result).toEqual([
    { kind: "check", code: "GRID_SELECTION", active: 4, ids: [1, 4], checked: [2], score: 20, postEvents: 0 },
    { kind: "view", code: "GRID_SELECTION", active: 4, ids: [1, 4], checked: [], score: 20, postEvents: 0 },
    { kind: "row", code: "GRID_SELECTION", active: 4, ids: [1, 4], checked: [], score: 21, postEvents: 0 }
  ]);
});

test("invalid and throwing before hooks reject toggles while post failure keeps the committed DOM", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.toggleFixture;
    const errors: { code?: string; message: string }[] = [];
    const capture = (event: ErrorEvent) => { errors.push({ code: event.error?.code, message: event.error?.message ?? event.message }); event.preventDefault(); };
    window.addEventListener("error", capture);
    try {
      h.rebind({ toggleSelection: true }); h.grid.setSelected([1, 4]); h.grid.select(4); h.events.length = 0;
      const button = h.table.querySelector<HTMLButtonElement>("tbody [data-select-row]")!;
      h.hooks.beforeSelect = () => "invalid" as unknown as boolean; button.click();
      const invalid = { code: errors.at(-1)?.code, active: h.grid.selected(), ids: h.grid.selectedIds() };
      h.hooks.beforeSelect = () => { throw new Error("before toggle failed"); }; button.click();
      const rejected = { message: errors.at(-1)?.message, active: h.grid.selected(), ids: h.grid.selectedIds(), postEvents: h.events.length };
      h.hooks.beforeSelect = undefined;
      h.hooks.onSelect = () => { throw new Error("after toggle failed"); }; button.click();
      return { invalid, rejected, committed: { message: errors.at(-1)?.message, active: h.grid.selected(), ids: h.grid.selectedIds(),
        pressed: [...h.table.querySelectorAll("tbody [aria-pressed='true']")].map(button => button.textContent), kinds: h.events.map(event => event.kind) }, storeEvents: h.storeEvents };
    } finally { window.removeEventListener("error", capture); }
  });
  expect(result).toEqual({ invalid: { code: "GRID_SELECTION", active: 4, ids: [1, 4] },
    rejected: { message: "before toggle failed", active: 4, ids: [1, 4], postEvents: 0 },
    committed: { message: "after toggle failed", active: null, ids: [4], pressed: ["Linus"], kinds: ["active"] }, storeEvents: 0 });
});

test("ineligible, deleted, checked and editable targets never manufacture row activation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.toggleFixture; h.rebind({ toggleSelection: true, statusFilter: ["clean", "insert", "update", "delete"] });
    const buttons = h.table.querySelectorAll<HTMLButtonElement>("tbody [data-select-row]");
    buttons[2].click();
    const unavailable = h.grid.selected();
    h.grid.select(1); h.grid.setSelected([1, 4]); h.grid.setChecked([1, 2]);
    h.rows.remove(1); h.events.length = 0;
    const deleted = h.table.querySelector<HTMLButtonElement>("tbody [data-select-row]")!; deleted.click();
    const check = h.table.querySelectorAll<HTMLInputElement>("tbody [data-check-row]")[1]; check.click();
    const active = h.table.querySelectorAll<HTMLInputElement>('tbody [data-field="active"]')[1]; active.click();
    h.table.querySelectorAll<HTMLButtonElement>("tbody [data-row-action]")[1].click();
    h.table.querySelectorAll("tbody td")[5].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return { unavailable, disabled: deleted.disabled, active: h.grid.selected(), selected: h.grid.selectedIds(),
      checked: h.grid.checkedIds(), stored: h.rows.get(2)!.value.active, actions: h.actions, events: h.events.length, storeEvents: h.storeEvents };
  });
  expect(result).toEqual({ unavailable: null, disabled: true, active: null, selected: [4], checked: [], stored: false, actions: 1, events: 0, storeEvents: 2 });
});

test("sort, filter, page and range keys keep stable identity and existing clear shortcuts", async ({ page }) => {
  await page.evaluate(() => {
    const h = window.toggleFixture; h.rebind({ toggleSelection: true });
    h.grid.setChecked([2]); h.grid.setSort((a, b) => b.name.localeCompare(a.name));
    h.grid.setFilter(row => row.name !== "Grace"); h.grid.setPage({ page: 1, size: 2 });
  });
  const buttons = page.locator('[data-toggle-fixture] tbody [data-select-row]');
  await expect(buttons.first()).toHaveText("Linus");
  await buttons.first().click(); await buttons.first().click();
  expect(await page.evaluate(() => window.toggleFixture.grid.selected())).toBeNull();
  await buttons.first().focus(); await page.keyboard.press("Shift+ArrowDown");
  expect(await page.evaluate(() => window.toggleFixture.grid.selectedIds())).toEqual([2, 4]);
  await page.keyboard.press("Control+a");
  expect(await page.evaluate(() => window.toggleFixture.grid.selectedIds())).toEqual([2, 4]);
  const active = await page.evaluate(() => window.toggleFixture.grid.selected());
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => ({ active: window.toggleFixture.grid.selected(), ids: window.toggleFixture.grid.selectedIds(),
    checked: window.toggleFixture.grid.checkedIds(), storeEvents: window.toggleFixture.storeEvents })))
    .toEqual({ active, ids: [], checked: [2], storeEvents: 0 });
});

test("invalid toggle flags fail before DOM ownership and permit corrected binding", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.toggleFixture; h.grid.dispose();
    const flags = JSON.parse('[null,0,1,"true",[],{}]');
    const attempts = flags.map((toggleSelection: boolean) => {
      let code = ""; try { h.rebind({ toggleSelection }); } catch (cause) { code = (cause as { code: string }).code; }
      return { code, exact: h.table.outerHTML === h.original };
    });
    h.rebind({ toggleSelection: true });
    h.table.querySelector<HTMLButtonElement>("tbody [data-select-row]")!.click();
    return { attempts, current: h.grid.selected(), rows: h.table.tBodies[0].rows.length };
  });
  expect(result).toEqual({ attempts: Array.from({ length: 6 }, () => ({ code: "GRID_SELECTION", exact: true })), current: 1, rows: 4 });
});

test("independent instances preserve focus, unique IDs and exact quiet teardown", async ({ page }) => {
  const result = await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid);
    const h = window.toggleFixture; h.rebind({ toggleSelection: true });
    const second = document.createElement("table"); second.innerHTML = markup; document.body.append(second);
    const original = second.outerHTML;
    const other = bindGrid(second, { rows: h.rows, multiple: true, toggleSelection: true,
      canSelect: (row: { value: Employee }) => row.value.selectable, parse: { score: Number }, onRowAction: () => {} });
    const firstButton = h.table.querySelector<HTMLButtonElement>("tbody [data-select-row]")!;
    firstButton.focus(); firstButton.click(); firstButton.click();
    const focused = document.activeElement === firstButton;
    other.select(4); other.setSelected([2]); other.setChecked([1]);
    const independent = { active: h.grid.selected(), ids: h.grid.selectedIds(), checks: h.grid.checkedIds(),
      other: { active: other.selected(), ids: other.selectedIds(), checks: other.checkedIds() } };
    h.grid.validate(); other.validate();
    const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
    other.dispose(); second.remove();
    const secondExact = second.outerHTML === original;
    const count = h.events.length; h.grid.dispose();
    h.table.querySelector<HTMLButtonElement>("tbody [data-select-row]")!.click();
    h.rows.set(2, "name", "Changed after disposal");
    const exact = h.table.outerHTML === h.original, quiet = h.events.length === count;
    h.rebind({ toggleSelection: true });
    return { focused, independent, unique: ids.length === new Set(ids).size, secondExact, exact, quiet, rebound: h.table.tBodies[0].rows.length };
  }, { modules, markup });
  expect(result).toEqual({ focused: true, independent: { active: null, ids: [], checks: [], other: { active: 4, ids: [2], checks: [1] } },
    unique: true, secondExact: true, exact: true, quiet: true, rebound: 4 });
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]).analyze();
  expect(axe.violations.map(violation => violation.id)).toEqual([]);
});
