import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const source = (path: string) =>
  "/@fs/" + fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/");

const modules = {
  grid: source("../../src/ui/grid.ts"),
  select: source("../../src/ui/select.ts"),
  data: source("../../src/data/index.ts")
};

test("Grid releases visited pages while restoring the selected row, draft, and error", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, select, data }) => {
    const { bindGrid } = await import(grid);
    const { bindSelect } = await import(select);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = '<thead><tr><th scope="col">Employee</th><th scope="col">Score</th><th scope="col">Choice</th></tr></thead>' +
      '<tbody><tr data-row-template><th scope="row"><button type="button" data-select-row><span data-field="name"></span></button></th>' +
      '<td><label>Score <input data-field="score"></label><output data-error-for="score"></output></td>' +
      '<td><label>Choice <select data-field="chosen" data-options="choices" data-option-label="label" data-option-value="value">' +
      '<option value="">Choose</option></select></label></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows(Array.from({ length: 120 }, (_, index) => ({
      name: "Employee " + String(index).padStart(3, "0"),
      score: index,
      choices: [{ label: "Shift " + index, value: index }],
      chosen: index
    })));
    const firstId = rows.entries()[0].id;
    const handle = bindGrid(table, { rows, parse: {
      score: (input: string) => {
        const value = Number(input);
        if (!Number.isFinite(value)) throw new Error("Score must be numeric.");
        return value;
      }
    } });
    handle.setPage({ page: 1, size: 20 });
    const firstRow = table.tBodies[0].rows[0];
    const firstButton = firstRow.querySelector<HTMLButtonElement>("button")!;
    const firstInput = firstRow.querySelector<HTMLInputElement>("input")!;
    const oldSelect = firstRow.querySelector<HTMLSelectElement>("select")!;
    firstButton.click();
    firstInput.value = "bad";
    firstInput.dispatchEvent(new Event("input", { bubbles: true }));
    const before = {
      stored: rows.get(firstId)!.value.score,
      error: firstRow.querySelector("output")!.textContent,
      invalid: firstInput.getAttribute("aria-invalid")
    };
    firstInput.focus();
    handle.setSort((left: { name: string }, right: { name: string }) => left.name.localeCompare(right.name));
    const visibleIdentity = table.tBodies[0].rows[0] === firstRow &&
      document.activeElement === firstInput;
    handle.setPage({ page: 2, size: 20 });
    const afterPage = {
      count: table.tBodies[0].rows.length,
      detached: !firstRow.isConnected,
      movedFocus: document.activeElement === table.querySelector("tbody button"),
      selected: handle.selected()
    };
    const releasedSelect = bindSelect(oldSelect, { choices: [] });
    releasedSelect.dispose();
    for (let pageNumber = 3; pageNumber <= 6; pageNumber++) {
      handle.setPage({ page: pageNumber, size: 20 });
    }
    const traversedCount = table.tBodies[0].rows.length;
    const hidden = handle.validate(firstId).issues.map((issue: { rule: string; element?: HTMLElement }) =>
      ({ rule: issue.rule, hasElement: !!issue.element }));
    handle.setPage({ page: 1, size: 20 });
    const returned = table.tBodies[0].rows[0];
    const ids = [...table.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
    const restored = {
      newRow: returned !== firstRow,
      newSelect: returned.querySelector("select") !== oldSelect,
      draft: returned.querySelector<HTMLInputElement>("input")!.value,
      error: returned.querySelector("output")!.textContent,
      invalid: returned.querySelector("input")!.getAttribute("aria-invalid"),
      selected: returned.querySelector("button")!.getAttribute("aria-pressed"),
      uniqueIds: ids.length === new Set(ids).size
    };
    handle.dispose();
    const restoredTemplate = table.tBodies[0].rows.length === 1 &&
      table.querySelector("[data-row-template]") !== null;
    rows.dispose();
    table.remove();
    return { before, visibleIdentity, afterPage, traversedCount, hidden, restored, restoredTemplate };
  }, modules);
  expect(result).toEqual({
    before: { stored: 0, error: "Score must be numeric.", invalid: "true" },
    visibleIdentity: true,
    afterPage: { count: 20, detached: true, movedFocus: true, selected: 1 },
    traversedCount: 20,
    hidden: [{ rule: "parse", hasElement: false }],
    restored: {
      newRow: true, newSelect: true, draft: "bad", error: "Score must be numeric.",
      invalid: "true", selected: "true", uniqueIds: true
    },
    restoredTemplate: true
  });
});

test("offscreen validation text clears on external set, revert, remove, and replace", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td><button type="button" data-select-row>' +
      '<span data-field="score"></span></button><label>Name <input data-field="name" required></label>' +
      '<output data-error-for="name"></output></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows([{ name: "", score: 1 }, { name: "Okay", score: 2 }]);
    const id = rows.entries()[0].id;
    const handle = bindGrid(table, { rows });
    handle.select(id);
    handle.setPage({ page: 2, size: 1 });
    const hiddenIssue = handle.validate(id).issues[0];
    handle.setPage({ page: 1, size: 1 });
    const validated = {
      invalid: table.querySelector("input")!.getAttribute("aria-invalid"),
      text: !!table.querySelector("output")!.textContent
    };
    handle.setPage({ page: 2, size: 1 });
    rows.set(id, "score", 5);
    handle.setPage({ page: 1, size: 1 });
    const afterSet = {
      text: table.querySelector("output")!.textContent,
      invalid: table.querySelector("input")!.getAttribute("aria-invalid"),
      score: rows.get(id)!.value.score
    };
    handle.validate(id);
    handle.setPage({ page: 2, size: 1 });
    rows.revert(id);
    handle.setPage({ page: 1, size: 1 });
    const afterRevert = {
      text: table.querySelector("output")!.textContent,
      invalid: table.querySelector("input")!.getAttribute("aria-invalid"),
      score: rows.get(id)!.value.score
    };
    handle.setPage({ page: 2, size: 1 });
    rows.remove(id);
    const afterRemove = { selected: handle.selected(), available: rows.entries().length };
    rows.replace([{ name: "New", score: 3 }]);
    handle.setPage({ page: 1, size: 1 });
    const afterReplace = table.querySelector("input")!.value;
    handle.dispose();
    const rebound = bindGrid(table, { rows });
    const reboundValue = table.querySelector("input")!.value;
    rebound.dispose();
    rows.dispose();
    table.remove();
    return {
      hidden: { rule: hiddenIssue?.rule, hasElement: !!hiddenIssue?.element },
      validated, afterSet, afterRevert, afterRemove, afterReplace, reboundValue
    };
  }, modules);
  expect(result).toEqual({
    hidden: { rule: "html", hasElement: false },
    validated: { invalid: "true", text: true },
    afterSet: { text: "", invalid: null, score: 5 },
    afterRevert: { text: "", invalid: null, score: 1 },
    afterRemove: { selected: null, available: 1 },
    afterReplace: "New",
    reboundValue: "New"
  });
});
