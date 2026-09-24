import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const source = (path: string) =>
  `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;

const modules = {
  grid: source("../../src/ui/grid.ts"),
  data: source("../../src/data/index.ts")
};

test("nested row options keep raw values, row identity, and native table markup", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const host = document.createElement("section");
    host.innerHTML = `<table><thead><tr><th scope="col">Row</th><th scope="col">Choice</th></tr></thead>
      <tbody><tr data-row-template><th scope="row"><button type="button" data-select-row><span data-field="b"></span></button></th>
      <td><label>Choice <select data-field="chosen" data-options="a" data-option-label="aa" data-option-value="bb">
      <option value="">Choose</option></select></label></td></tr></tbody></table>`;
    document.body.append(host);
    const table = host.querySelector("table")!;
    const rows = createRows([
      { a: [{ aa: 11, bb: 22 }, {}], b: 2, chosen: 22 },
      { a: [{ aa: 33, bb: 44 }], b: 1, chosen: 44 }
    ]);
    const [first, second] = rows.entries();
    const selections: (number | null)[] = [];
    const handle = bindGrid(table, { rows, onSelect: ({ id }: { id: number | null }) => selections.push(id) });
    const initial = [...table.tBodies[0].rows].map(row => ({
      name: row.querySelector("button")?.textContent,
      choices: [...row.querySelector("select")!.options].map(option => option.textContent),
      selected: row.querySelector("select")!.selectedIndex
    }));
    const firstButton = table.querySelector("button")!;
    firstButton.click();
    const pressed = firstButton.getAttribute("aria-pressed");
    firstButton.focus();
    handle.setSort((a: { b: number }, b: { b: number }) => a.b - b.b);
    const sorted = [...table.tBodies[0].rows].map(row => row.querySelector("button")?.textContent);
    const focusAfterSort = document.activeElement === firstButton;
    handle.setFilter((row: { b: number }) => row.b === 1);
    const filtered = [...table.tBodies[0].rows].map(row => row.querySelector("button")?.textContent);
    const stillSelected = handle.selected() === first.id;
    handle.setFilter(null);
    const sameButton = [...table.querySelectorAll("button")].includes(firstButton);
    const firstSelect = firstButton.closest("tr")!.querySelector("select")!;
    firstSelect.focus();
    rows.set(first.id, "b", 3);
    const focusKept = document.activeElement === firstSelect;
    firstSelect.selectedIndex = 0;
    firstSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const emptyValue = rows.get(first.id)!.value.chosen;
    firstSelect.selectedIndex = 1;
    firstSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const rawValue = rows.get(first.id)!.value.chosen;
    rows.set(first.id, "a", [{ aa: 55, bb: 66 }]);
    const invalid = handle.validate(first.id);
    const missingSelection = firstSelect.selectedIndex;
    rows.revert(first.id);
    const restored = handle.validate(first.id);
    const noIds = [...table.querySelectorAll("[id]")].length === 0;
    handle.dispose();
    const templateRestored = !!table.querySelector("tr[data-row-template]") && table.tBodies[0].rows.length === 1;
    rows.set(second.id, "b", 5);
    const noLateRender = table.tBodies[0].rows.length === 1;
    rows.dispose();
    host.remove();
    return {
      initial, pressed, sorted, focusAfterSort, filtered, stillSelected, sameButton, focusKept,
      emptyValue, rawValue, invalid: invalid.issues.map((issue: { rule: string }) => issue.rule),
      missingSelection, restored: restored.valid, noIds, templateRestored, noLateRender, selections
    };
  }, modules);
  expect(result).toEqual({
    initial: [
      { name: "2", choices: ["Choose", "11"], selected: 1 },
      { name: "1", choices: ["Choose", "33"], selected: 1 }
    ],
    pressed: "true",
    sorted: ["1", "2"],
    focusAfterSort: true,
    filtered: ["1"],
    stillSelected: true,
    sameButton: true,
    focusKept: true,
    emptyValue: null,
    rawValue: 22,
    invalid: ["select-option"],
    missingSelection: -1,
    restored: true,
    noIds: true,
    templateRestored: true,
    noLateRender: true,
    selections: [1]
  });
});

test("a repeated fixed id is rejected before cloning", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<tbody><tr data-row-template><td><input id="repeat"></td></tr></tbody>`;
    document.body.append(table);
    const rows = createRows([{ value: 1 }]);
    let code = "";
    try { bindGrid(table, { rows }); } catch (cause) { code = (cause as { code: string }).code; }
    const untouched = table.tBodies[0].rows.length === 1 &&
      table.querySelector("tr[data-row-template] #repeat") !== null;
    rows.dispose();
    table.remove();
    return { code, untouched };
  }, modules);
  expect(result).toEqual({ code: "DUPLICATE_ID", untouched: true });
});

test("nested field paths preserve a number apart from the same DOM string", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<tbody><tr data-row-template><td data-field="profile.name"></td><td>
      <label>Choice <select data-field="profile.chosen" data-options="profile.a"
        data-option-label="label" data-option-value="value"><option value="">Choose</option>
      </select></label></td></tr></tbody>`;
    document.body.append(table);
    const rows = createRows([{ profile: {
      name: "Ada", a: [{ label: "Numeric", value: 1 }, { label: "Text", value: "1" }], chosen: "1"
    } }]);
    const id = rows.entries()[0].id;
    const handle = bindGrid(table, { rows });
    const cell = table.querySelector("td")!;
    const select = table.querySelector("select")!;
    const initial = { text: cell.textContent, selected: select.selectedIndex };
    select.selectedIndex = 1;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    const numeric = rows.get(id)!.value.profile.chosen;
    const changed = rows.get(id)!.status;
    rows.revert(id);
    const reverted = { value: rows.get(id)!.value.profile.chosen, selected: select.selectedIndex };
    rows.set(id, "profile", { name: "Ada", a: [], chosen: "1" });
    handle.setFilter(() => false);
    const hiddenIssue = handle.validate().issues.map((issue: { field: string; rule: string }) =>
      ({ field: issue.field, rule: issue.rule }));
    handle.dispose();
    rows.dispose();
    table.remove();
    return { initial, numeric, changed, reverted, hiddenIssue };
  }, modules);
  expect(result).toEqual({
    initial: { text: "Ada", selected: 2 },
    numeric: 1,
    changed: "update",
    reverted: { value: "1", selected: 2 },
    hiddenIssue: [{ field: "profile.chosen", rule: "select-option" }]
  });
});

test("unsupported pilot rules and missing validation IDs fail explicitly", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td data-field="name"></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows([{ name: "Ada" }]);
    let rulesCode = "";
    try {
      bindGrid(table, { rows, rules: { validate: { required: () => true } } });
    } catch (cause) { rulesCode = (cause as { code: string }).code; }
    const untouched = table.querySelector("tr[data-row-template]") !== null;
    const handle = bindGrid(table, { rows });
    let rowCode = "";
    try { handle.validate(999); } catch (cause) { rowCode = (cause as { code: string }).code; }
    handle.dispose();
    rows.dispose();
    table.remove();
    return { rulesCode, rowCode, untouched };
  }, modules);
  expect(result).toEqual({ rulesCode: "GRID_RULES", rowCode: "GRID_ROW", untouched: true });
});