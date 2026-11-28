// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { createRows, RowId, Rows } from "../../src/data/index.js";
import type { bindList, ListHandle } from "../../src/ui/index.js";

type Item = { name: string; score: number; selectable: boolean; checkable: boolean };
type Options = Omit<Parameters<typeof bindList<Item>>[1], "rows">;

declare global {
  interface Window {
    mountListSelection(options?: Options, authoredDisabled?: boolean, masterInside?: boolean): {
      list: ListHandle<Item>; rows: Rows<Item>; root: HTMLUListElement; ids: RowId[];
      masters: HTMLInputElement[]; rebind(): ListHandle<Item>;
    };
    listSelection: ReturnType<Window["mountListSelection"]>;
    vetoListSelection: boolean;
  }
}

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };
const fixture = "[data-list-selection-fixture]";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ ui, data }) => {
    const { bindList: bind }: { bindList: typeof bindList } = await import(ui);
    const { createRows: create }: { createRows: typeof createRows } = await import(data);
    window.mountListSelection = (options = {}, authoredDisabled = false, masterInside = false) => {
      const host = document.createElement("section");
      host.dataset.listSelectionFixture = "";
      host.innerHTML = `<label>Check page <input type="checkbox" data-check-all="visible" checked></label>
        <label>Check filtered <input type="checkbox" data-check-all="filtered"></label>
        <label>Check store <input type="checkbox" data-check-all="store"${authoredDisabled ? " disabled" : ""}></label>
        <ul><li data-row-template>
          <span data-field="name"></span><button type="button" data-select-row>Activate</button>
          <label><span>Check row</span> <input type="checkbox" data-check-row${authoredDisabled ? " disabled" : ""}></label>
          <label>Score <input type="number" data-field="score"></label>
          <button type="button">Details</button>
        </li><li data-empty hidden>No matches</li></ul>`;
      document.body.append(host);
      const root = host.querySelector("ul")!;
      const masters = [...host.querySelectorAll<HTMLInputElement>("[data-check-all]")];
      masters[0].indeterminate = true;
      if (masterInside) {
        const item = document.createElement("li");
        item.append(masters[0].parentElement!);
        root.prepend(item);
      }
      const rows = create<Item>(["Ada", "Bjarne", "Grace", "Linus", "Margaret"].map((name, index) => ({
        name, score: index + 1, selectable: name !== "Grace", checkable: name !== "Linus"
      })));
      const ids = rows.entries().map(row => row.id);
      const bindRoot = () => bind(root, { rows, checkAllControls: masters, editable: true,
        parse: options.editable === false ? undefined : { score: value => Number(value) }, canSelect: row => row.value.selectable,
        canCheck: row => row.value.checkable, ...options });
      let list = bindRoot();
      return { list, rows, root, ids, masters, rebind() { list.dispose(); list = bindRoot(); return list; } };
    };
  }, modules);
});

test("List preserves absolute single selection and makes repeated click deselection explicit", async ({ page }) => {
  const result = await page.evaluate(() => {
    const observed: Array<[RowId | null, string | null]> = [];
    const { list, ids: [ada, bjarne], root } = window.mountListSelection({
      editable: false,
      onSelect: ({ id, event }) => observed.push([id, event?.type ?? null])
    });
    const buttons = root.querySelectorAll<HTMLButtonElement>("[data-select-row]");
    buttons[0].click(); buttons[0].click();
    list.select(bjarne); list.select(bjarne);
    const current = [list.selected(), list.selectedIds(), buttons[1].getAttribute("aria-pressed")];
    list.select(null);
    const toggled = window.mountListSelection({ toggleSelection: true });
    const button = toggled.root.querySelector<HTMLButtonElement>("[data-select-row]")!;
    button.click(); button.click();
    return { ada, bjarne, current, observed, toggled: toggled.list.selected() };
  });
  expect(result.current).toEqual([result.bjarne, [], "true"]);
  expect(result.observed).toEqual([[result.ada, "click"], [result.bjarne, null], [null, null]]);
  expect(result.toggled).toBeNull();
});

test("List plain row clicks toggle membership while native editing and child actions stay separate", async ({ page }) => {
  const ids = await page.evaluate(() => {
    window.listSelection = window.mountListSelection({ multiple: true, selectOnRowClick: true, hover: true });
    return window.listSelection.ids;
  });
  const root = page.locator(`${fixture} ul`);
  const name = root.locator("[data-field=name]");
  const read = () => page.evaluate(() => {
    const { list } = window.listSelection;
    return [list.selectedIds(), list.checkedIds(), list.selected()];
  });
  await expect(root).toHaveAttribute("data-list-hover", /.*/);
  await name.nth(0).click();
  await name.nth(1).click();
  await name.nth(0).click();
  await name.nth(2).click();
  expect((await read())[0]).toEqual([ids[1]]);
  await root.getByRole("button", { name: "Details" }).first().click();
  await root.getByText("Check row", { exact: true }).first().click();
  const score = root.getByRole("spinbutton", { name: "Score" }).first();
  await score.fill("42");
  expect((await read()).slice(0, 2)).toEqual([[ids[1]], [ids[0]]]);
  await root.locator("[data-select-row]").first().focus();
  await page.keyboard.press("Enter");
  expect(await read()).toEqual([[ids[0], ids[1]], [ids[0]], ids[0]]);
  expect(await page.evaluate(id => window.listSelection.list.value(id), ids[0]))
    .toEqual({ name: "Ada", score: 42, selectable: true, checkable: true });
});

test("List modifiers and keyboard ranges skip ineligible rows in projected order", async ({ page }) => {
  const ids = await page.evaluate(() => {
    window.vetoListSelection = false;
    window.listSelection = window.mountListSelection({ multiple: true, beforeSelectionChange: () => !window.vetoListSelection });
    return window.listSelection.ids;
  });
  const buttons = page.locator(`${fixture} [data-select-row]`);
  const membership = () => page.evaluate(() => window.listSelection.list.selectedIds());
  await expect(buttons.nth(2)).toBeDisabled();
  await buttons.first().click();
  await buttons.last().click({ modifiers: ["Control"] });
  await buttons.nth(1).click({ modifiers: ["Shift"] });
  expect(await membership()).toEqual([ids[1], ids[3], ids[4]]);
  await buttons.first().click({ modifiers: ["Meta", "Shift"] });
  expect(await membership()).toEqual([ids[0], ids[1], ids[3], ids[4]]);
  await buttons.first().focus();
  await page.keyboard.press("Escape");
  expect(await membership()).toEqual([]);
  await buttons.nth(1).focus();
  await page.evaluate(() => { window.vetoListSelection = true; });
  await page.keyboard.press("Shift+ArrowDown");
  await expect(buttons.nth(1)).toBeFocused();
  expect(await membership()).toEqual([]);
  await page.evaluate(() => { window.vetoListSelection = false; });
  await page.keyboard.press("Shift+ArrowDown");
  await expect(buttons.nth(3)).toBeFocused();
  expect(await membership()).toContain(ids[3]);
  expect(await membership()).not.toContain(ids[2]);
  await page.keyboard.press("End");
  await expect(buttons.last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(buttons.first()).toBeFocused();
  await page.keyboard.press("Control+a");
  expect(await membership()).toEqual([ids[0], ids[1], ids[3], ids[4]]);
  const editor = page.locator(`${fixture} [data-field=score]`).first();
  await editor.focus();
  await page.keyboard.press("Escape");
  await expect(editor).toBeFocused();
  expect(await membership()).toEqual([ids[0], ids[1], ids[3], ids[4]]);
});

test("List veto leaves the whole transition untouched and restores native checkbox state", async ({ page }) => {
  const actual = await page.evaluate(() => {
    let veto = true;
    const events: Array<[string, string | null]> = [];
    const { list, ids: [ada, bjarne], root, masters } = window.mountListSelection({ multiple: true,
      beforeSelect: ({ id }) => id !== bjarne,
      beforeSelectionChange: () => !veto,
      beforeCheckChange: () => !veto,
      onSelect: ({ event }) => events.push(["active", event?.type ?? null]),
      onSelectionChange: ({ event }) => events.push(["selected", event?.type ?? null]),
      onCheckChange: ({ event }) => events.push(["checked", event?.type ?? null])
    });
    const button = root.querySelectorAll<HTMLButtonElement>("[data-select-row]");
    const check = root.querySelector<HTMLInputElement>("[data-check-row]")!;
    button[0].click(); check.click(); masters[0].click();
    const rejected = [list.selected(), list.selectedIds(), list.checkedIds(), check.checked,
      masters[0].checked, masters[0].indeterminate, events.length];
    veto = false;
    button[0].click(); check.click();
    button[1].click(); list.select(bjarne);
    return { ada, rejected, accepted: [list.selected(), list.selectedIds(), list.checkedIds(), check.checked,
      masters[0].checked, masters[0].indeterminate], events };
  });
  expect(actual.rejected).toEqual([null, [], [], false, false, false, 0]);
  expect(actual.accepted).toEqual([actual.ada, [actual.ada], [actual.ada], true, false, true]);
  expect(actual.events).toEqual([["active", "click"], ["selected", "click"], ["checked", "change"]]);
});

test("List veto on an in-root All checkbox preserves its mixed state through bubbling", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const attempts: Array<readonly RowId[]> = [];
    const { list, root, masters: [master], ids: [ada, bjarne, grace, , margaret] } = window.mountListSelection({
      beforeCheckChange: ({ ids }) => { attempts.push(ids); return ids.length <= 1; }
    }, false, true);
    let bubbled = 0;
    root.addEventListener("change", () => { bubbled++; });
    list.setChecked([ada]);
    attempts.length = 0;
    master.click();
    return { ada, eligible: [ada, bjarne, grace, margaret], attempts, bubbled,
      checked: list.checkedIds(), state: [master.checked, master.indeterminate] };
  });
  expect(actual.attempts).toEqual([actual.eligible]);
  expect(actual.bubbled).toBe(1);
  expect(actual.checked).toEqual([actual.ada]);
  expect(actual.state).toEqual([false, true]);
});

test("List moves focus when a focused row selection or check loses eligibility without changing the view", async ({ page }) => {
  await page.evaluate(() => {
    const fixture = window.mountListSelection({ multiple: true });
    window.listSelection = fixture;
    const [ada] = fixture.ids;
    fixture.list.select(ada);
    fixture.list.setSelected([ada]);
    fixture.list.setChecked([ada]);
  });
  const buttons = page.locator(`${fixture} [data-select-row]`);
  const check = page.locator(`${fixture} [data-check-row]`).first();
  await buttons.first().focus();
  await page.evaluate(() => window.listSelection.rows.set(window.listSelection.ids[0], "selectable", false));
  await expect(buttons.first()).toBeDisabled();
  await expect(buttons.nth(1)).toBeFocused();
  await check.focus();
  await page.evaluate(() => window.listSelection.rows.set(window.listSelection.ids[0], "checkable", false));
  await expect(check).toBeDisabled();
  await expect(buttons.nth(1)).toBeFocused();
  const actual = await page.evaluate(() => {
    const { list, ids } = window.listSelection;
    return { ids, visible: list.rowIds("visible"), state: [list.selected(), list.selectedIds(), list.checkedIds()] };
  });
  expect(actual.visible).toEqual(actual.ids);
  expect(actual.state).toEqual([null, [], []]);
});

test("List selection superseded by a callback keeps the newer view and existing state", async ({ page }) => {
  const actual = await page.evaluate(() => {
    let supersede = false;
    const changes: Array<RowId | null> = [];
    const { list, ids: [ada, bjarne, ...other] } = window.mountListSelection({ multiple: true,
      beforeSelect: () => { if (supersede) list.setFilter(row => row.name !== "Ada"); },
      onSelect: ({ id }) => changes.push(id)
    });
    list.select(bjarne);
    list.setSelected([bjarne]);
    list.setChecked([bjarne]);
    supersede = true;
    let code: string | undefined;
    try { list.select(ada); } catch (cause) { code = (cause as { code: string }).code; }
    return { bjarne, other, code, changes, visible: list.rowIds("visible"),
      state: [list.selected(), list.selectedIds(), list.checkedIds()] };
  });
  expect(actual.code).toBe("LIST_SELECTION");
  expect(actual.visible).toEqual([actual.bjarne, ...actual.other]);
  expect(actual.changes).toEqual([actual.bjarne]);
  expect(actual.state).toEqual([actual.bjarne, [actual.bjarne], [actual.bjarne]]);
});

test("List prunes deleted IDs even when rendering the changed Rows fails", async ({ page }) => {
  const actual = await page.evaluate(() => {
    let fail = false;
    const observed: Array<RowId | null> = [];
    const { list, rows, ids: [ada, ...remaining] } = window.mountListSelection({ multiple: true,
      onSelect: ({ id }) => observed.push(id) });
    list.setFilter(() => { if (fail) throw new Error("Filter failed"); return true; });
    list.select(ada); list.setSelected([ada]); list.setChecked([ada]);
    fail = true;
    let error = "";
    try { rows.remove(ada); } catch (cause) { error = (cause as Error).message; }
    return { error, ada, remaining, visible: list.rowIds("visible"), filtered: list.rowIds("filtered"), observed,
      state: [list.selected(), list.selectedIds(), list.checkedIds()] };
  });
  expect(actual.error).toContain("Filter failed");
  expect(actual.state).toEqual([null, [], []]);
  expect(actual.visible).toEqual(actual.remaining);
  expect(actual.filtered).toEqual(actual.remaining);
  expect(actual.observed).toEqual([actual.ada, null]);
});

test("List scoped checks, projections and frozen IDs survive paging, filtering and Rows changes", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const { list, rows, ids: [ada, bjarne, grace, linus, margaret], masters } = window.mountListSelection({ multiple: true });
    list.select(margaret);
    list.setSelected([margaret, ada]);
    list.setChecked([margaret]);
    const selection = list.selectedIds();
    const frozen = Object.isFrozen(selection) && Object.isFrozen(list.checkedIds());
    list.setSort((a, b) => b.score - a.score);
    list.setFilter(row => row.name !== "Margaret");
    list.setPage({ page: 2, size: 2 });
    const projections = [list.rowIds("visible"), list.rowIds("filtered"), list.rowIds("store")];
    masters[0].click();
    const visible = [list.checkedIds(), list.checkState("visible"), list.checkState("filtered"), list.checkState("store")];
    masters[1].click();
    const filtered = [list.checkedIds(), masters.map(control => [control.checked, control.indeterminate])];
    list.checkAll(false, "visible");
    const cleared = list.checkedIds();
    rows.move(margaret, ada);
    const moved = [list.selectedIds(), list.checkedIds()];
    rows.remove(ada); rows.remove(margaret);
    list.refresh();
    const pruned = [list.selected(), list.selectedIds(), list.checkedIds()];
    rows.replace([{ name: "New", score: 17, selectable: true, checkable: true }]);
    return { ids: [ada, bjarne, grace, linus, margaret], frozen, selection, projections, visible, filtered, cleared, moved,
      pruned, replacement: [list.selectedIds(), list.checkedIds()] };
  });
  const [ada, bjarne, grace, linus, margaret] = actual.ids;
  expect(actual.frozen).toBe(true);
  expect(actual.selection).toEqual([ada, margaret]);
  expect(actual.projections).toEqual([[bjarne, ada], [linus, grace, bjarne, ada], [ada, bjarne, grace, linus, margaret]]);
  expect(actual.visible).toEqual([[ada, bjarne, margaret],
    { checked: true, indeterminate: false, count: 2, total: 2 },
    { checked: false, indeterminate: true, count: 2, total: 3 },
    { checked: false, indeterminate: true, count: 3, total: 4 }]);
  expect(actual.filtered).toEqual([[ada, bjarne, grace, margaret], [[true, false], [true, false], [true, false]]]);
  expect(actual.cleared).toEqual([grace, margaret]);
  expect(actual.moved).toEqual([[margaret, ada], [margaret, grace]]);
  expect(actual.pruned).toEqual([null, [], [grace]]);
  expect(actual.replacement).toEqual([[], []]);
});

test("List exclusive checks replace the prior row and disable an All control with multiple eligible rows", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const { list, ids: [ada, bjarne], masters, root } = window.mountListSelection({ checkMode: "single", editable: false });
    const check = root.querySelectorAll<HTMLInputElement>("[data-check-row]");
    check[0].click(); check[1].click();
    const exclusive = [list.checkedIds(), check[0].checked, check[1].checked, masters.map(control => control.disabled)];
    list.setPage({ page: 1, size: 1 });
    masters[0].click();
    const one = [list.checkedIds(), masters.map(control => control.disabled)];
    let failure = false;
    try { list.setChecked([ada, bjarne]); } catch { failure = true; }
    return { ada, bjarne, exclusive, one, failure, retained: list.checkedIds() };
  });
  expect(actual.exclusive).toEqual([[actual.bjarne], false, true, [true, true, true]]);
  expect(actual.one).toEqual([[actual.ada], [false, true, true]]);
  expect(actual.failure).toBe(true);
  expect(actual.retained).toEqual([actual.ada]);
});

test("List restores authored controls, detaches listeners and can bind the same markup again", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const { list, root, masters, rebind } = window.mountListSelection({ multiple: true, hover: true }, true);
    const disabled = [...root.querySelectorAll<HTMLInputElement>("[data-check-row]")].every(control => control.disabled);
    const authoredMaster = masters[2].disabled;
    const stale = root.querySelector<HTMLButtonElement>("[data-select-row]")!;
    const again = rebind();
    stale.click();
    const priorClickIgnored = again.selected() === null;
    const current = root.querySelector<HTMLButtonElement>("[data-select-row]")!;
    current.click();
    const freshClickAccepted = again.selectedIds().length === 1;
    list.dispose(); again.dispose();
    masters[0].dispatchEvent(new Event("change", { bubbles: true }));
    return { disabled, authoredMaster, priorClickIgnored, freshClickAccepted, restored: [
      root.querySelectorAll("[data-row-template]").length, root.hasAttribute("data-list-hover"),
      masters[0].checked, masters[0].indeterminate, masters[2].disabled
    ] };
  });
  expect(actual).toEqual({ disabled: true, authoredMaster: true, priorClickIgnored: true, freshClickAccepted: true,
    restored: [1, false, true, true, true] });
});
