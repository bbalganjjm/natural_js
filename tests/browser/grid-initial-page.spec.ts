import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const source = (path: string) =>
  "/@fs/" + fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/");

const modules = {
  grid: source("../../src/ui/grid.ts"),
  select: source("../../src/ui/select.ts"),
  data: source("../../src/data/index.ts")
};

test("initialPage renders only its slice, copies input, clamps, and preserves the no-option default", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td data-field="name"></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows(Array.from({ length: 5 }, (_, index) => ({ name: "Row " + (index + 1) })));
    const request = { page: 2, size: 2 };
    const handle = bindGrid(table, { rows, initialPage: request });
    request.page = 1;
    request.size = 5;
    const initial = {
      page: handle.page(),
      names: [...table.tBodies[0].rows].map(row => row.textContent)
    };
    handle.setPage({ page: 99, size: 2 });
    const clamped = {
      page: handle.page(),
      names: [...table.tBodies[0].rows].map(row => row.textContent)
    };
    rows.remove(rows.entries()[4].id);
    const afterRemove = {
      page: handle.page(),
      names: [...table.tBodies[0].rows].map(row => row.textContent)
    };
    rows.replace([]);
    const empty = { page: handle.page(), count: table.tBodies[0].rows.length };
    rows.add({ name: "New" });
    handle.setPage(null);
    const noPaging = { page: handle.page(), name: table.tBodies[0].rows[0].textContent };
    handle.dispose();
    const defaultHandle = bindGrid(table, { rows });
    const defaultState = { page: defaultHandle.page(), count: table.tBodies[0].rows.length };
    defaultHandle.dispose();
    rows.dispose();
    table.remove();

    const emptyTable = document.createElement("table");
    emptyTable.innerHTML = '<tbody><tr data-row-template><td data-field="name"></td></tr></tbody>';
    document.body.append(emptyTable);
    const emptyRows = createRows([] as { name: string }[]);
    const emptyHandle = bindGrid(emptyTable, { rows: emptyRows, initialPage: { page: 9, size: 3 } });
    const initialEmpty = {
      page: emptyHandle.page(),
      count: emptyTable.tBodies[0].rows.length
    };
    emptyHandle.dispose();
    emptyRows.dispose();
    emptyTable.remove();
    return { initial, clamped, afterRemove, empty, noPaging, defaultState, initialEmpty };
  }, modules);
  expect(result).toEqual({
    initial: { page: { page: 2, size: 2, total: 5, pages: 3 }, names: ["Row 3", "Row 4"] },
    clamped: { page: { page: 3, size: 2, total: 5, pages: 3 }, names: ["Row 5"] },
    afterRemove: { page: { page: 2, size: 2, total: 4, pages: 2 }, names: ["Row 3", "Row 4"] },
    empty: { page: { page: 1, size: 2, total: 0, pages: 0 }, count: 0 },
    noPaging: { page: null, name: "New" },
    defaultState: { page: null, count: 1 },
    initialEmpty: { page: { page: 1, size: 3, total: 0, pages: 0 }, count: 0 }
  });
});

test("invalid initialPage leaves authored template and Select ownership untouched; setPage failure is atomic", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, select, data }) => {
    const { bindGrid } = await import(grid);
    const { bindSelect } = await import(select);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td><label>Choice ' +
      '<select data-field="choice" data-options="choices" data-option-label="label" ' +
      'data-option-value="value"><option value="">Choose</option></select></label></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows([{ choice: 1, choices: [{ label: "One", value: 1 }] }]);
    const invalid = [
      { page: 0, size: 1 }, { page: 1.5, size: 1 }, { page: Infinity, size: 1 },
      { page: Number.MAX_SAFE_INTEGER + 1, size: 1 }, { page: 1, size: 0 },
      { page: 1, size: NaN }, { page: 1, size: -1 }
    ];
    const failures: string[] = [];
    const original = table.querySelector("tr")!;
    const authoredSelect = table.querySelector("select")!;
    for (const request of invalid) {
      try { bindGrid(table, { rows, initialPage: request }); }
      catch (cause) { failures.push((cause as { code: string }).code); }
    }
    const untouched = table.querySelector("tr") === original &&
      table.querySelector("select") === authoredSelect &&
      table.querySelector("[data-row-template]") === original;
    const selectHandle = bindSelect(authoredSelect, { choices: [] });
    selectHandle.dispose();
    const handle = bindGrid(table, { rows, initialPage: { page: 1, size: 1 } });
    const before = { page: handle.page(), row: table.tBodies[0].rows[0] };
    const setFailures: string[] = [];
    for (const request of invalid) {
      try { handle.setPage(request); }
      catch (cause) { setFailures.push((cause as { code: string }).code); }
    }
    const atomic = handle.page()?.page === before.page?.page &&
      handle.page()?.size === before.page?.size &&
      table.tBodies[0].rows[0] === before.row;
    handle.dispose();
    const restored = table.querySelector("[data-row-template]") === original;
    rows.dispose();
    table.remove();
    return { failures, untouched, setFailures, atomic, restored };
  }, modules);
  expect(result).toEqual({
    failures: Array(7).fill("GRID_PAGE"), untouched: true,
    setFailures: Array(7).fill("GRID_PAGE"), atomic: true, restored: true
  });
});

test("initialPage keeps off-page identity and validation while deferring invalid row options", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = '<thead><tr><th scope="col">Name</th><th scope="col">Choice</th></tr></thead>' +
      '<tbody><tr data-row-template><th scope="row"><button type="button" data-select-row>' +
      '<span data-field="name"></span></button></th><td><label>Choice ' +
      '<select data-field="chosen" data-options="profile.choices" data-option-label="label" ' +
      'data-option-value="value" required><option value="">Choose</option></select></label>' +
      '<output data-error-for="chosen"></output></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows([
      { name: "First", chosen: 1, profile: { choices: [{ label: "One", value: 1 }] } },
      { name: "Second", chosen: null as number | null, profile: { choices: [{ label: "Two", value: 2 }] } },
      { name: "Third", chosen: 3, profile: { choices: "bad" as unknown as { label: string; value: number }[] } }
    ]);
    const [, second, third] = rows.entries();
    const handle = bindGrid(table, { rows, initialPage: { page: 1, size: 1 } });
    const firstOnly = table.tBodies[0].rows.length === 1 &&
      table.tBodies[0].rows[0].textContent?.includes("First");
    handle.select(second.id);
    const offscreen = handle.validate(second.id).issues.map((issue: { rule: string; element?: HTMLElement }) =>
      ({ rule: issue.rule, element: !!issue.element }));
    const selected = handle.selected() === second.id;
    handle.setPage({ page: 2, size: 1 });
    const returned = {
      selected: table.querySelector("button")?.getAttribute("aria-pressed"),
      invalid: table.querySelector("select")?.getAttribute("aria-invalid"),
      error: table.querySelector("output")?.textContent,
      options: [...table.querySelector("select")!.options].map(option => option.textContent)
    };
    let lateCode = "";
    try { handle.validate(third.id); }
    catch (cause) { lateCode = (cause as { code: string }).code; }
    handle.dispose();
    rows.dispose();
    table.remove();
    return { firstOnly, offscreen, selected, returned, lateCode };
  }, modules);
  expect(result).toEqual({
    firstOnly: true,
    offscreen: [{ rule: "html", element: false }],
    selected: true,
    returned: {
      selected: "true", invalid: "true", error: "Choose an option.",
      options: ["Choose", "Two"]
    },
    lateCode: "GRID_OPTIONS"
  });
});

test("two initial-page Grids keep nested choices and generated error IDs isolated, then rebind cleanly", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const host = document.createElement("section");
    host.innerHTML = '<table><tbody><tr data-row-template><td><label>Choice ' +
      '<select data-field="chosen" data-options="a" data-option-label="aa" data-option-value="bb">' +
      '<option value="">Choose</option></select></label><output data-error-for="chosen"></output></td></tr></tbody></table>' +
      '<table><tbody><tr data-row-template><td><label>Choice ' +
      '<select data-field="chosen" data-options="a" data-option-label="aa" data-option-value="bb">' +
      '<option value="">Choose</option></select></label><output data-error-for="chosen"></output></td></tr></tbody></table>';
    document.body.append(host);
    const [leftTable, rightTable] = [...host.querySelectorAll("table")];
    const values = [
      { a: [{ aa: "One", bb: 1 }, { aa: "Two", bb: 2 }], chosen: 1 },
      { a: [{ aa: "Three", bb: 3 }], chosen: 3 }
    ];
    const leftRows = createRows(values);
    const rightRows = createRows(values);
    const left = bindGrid(leftTable, { rows: leftRows, initialPage: { page: 1, size: 1 } });
    const right = bindGrid(rightTable, { rows: rightRows, initialPage: { page: 2, size: 1 } });
    const leftSelect = leftTable.querySelector("select")!;
    const rightSelect = rightTable.querySelector("select")!;
    const initial = {
      leftPage: left.page()?.page, rightPage: right.page()?.page,
      leftOptions: [...leftSelect.options].map(option => option.textContent),
      rightOptions: [...rightSelect.options].map(option => option.textContent),
      uniqueIds: (() => {
        const ids = [...host.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
        return ids.length === new Set(ids).size;
      })(),
      linked: [leftSelect, rightSelect].every(select =>
        select.getAttribute("aria-describedby") === select.closest("td")!.querySelector("output")!.id)
    };
    leftSelect.selectedIndex = 2;
    leftSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const isolated = leftRows.entries()[0].value.chosen === 2 &&
      rightRows.entries()[0].value.chosen === 1;
    left.dispose();
    right.dispose();
    const restored = [...host.querySelectorAll("table")].every(table =>
      table.tBodies[0].rows.length === 1 && !!table.querySelector("[data-row-template]"));
    const rebound = bindGrid(leftTable, { rows: leftRows, initialPage: { page: 2, size: 1 } });
    const reboundPage = rebound.page()?.page;
    rebound.dispose();
    leftRows.dispose();
    rightRows.dispose();
    host.remove();
    return { initial, isolated, restored, reboundPage };
  }, modules);
  expect(result).toEqual({
    initial: {
      leftPage: 1, rightPage: 2,
      leftOptions: ["Choose", "One", "Two"],
      rightOptions: ["Choose", "Three"],
      uniqueIds: true, linked: true
    },
    isolated: true, restored: true, reboundPage: 2
  });
});

test("off-page formatter failure rolls back page and releases its new Select before retry", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, select, data }) => {
    const { bindGrid } = await import(grid);
    const { bindSelect } = await import(select);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td data-field="name" ' +
      'data-format=\'[["explode"]]\'></td><td><label>Choice ' +
      '<select data-field="chosen" data-options="choices" data-option-label="label" ' +
      'data-option-value="value"><option value="">Choose</option></select></label></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows([
      { name: "Good", chosen: 1, choices: [{ label: "One", value: 1 }] },
      { name: "Bad", chosen: 2, choices: [{ label: "Two", value: 2 }] }
    ]);
    let failedSelect: HTMLSelectElement | null = null;
    const handle = bindGrid(table, {
      rows,
      initialPage: { page: 1, size: 1 },
      rules: {
        format: {
          explode: (value: string, _args: readonly unknown[], context: { element?: HTMLElement }) => {
            if (value === "Bad") {
              failedSelect = context.element!.closest("tr")!.querySelector("select");
              throw new Error("Later row failed");
            }
            return value;
          }
        }
      }
    });
    const firstRow = table.tBodies[0].rows[0];
    let code = "";
    try { handle.setPage({ page: 2, size: 1 }); }
    catch (cause) { code = (cause as { code: string }).code; }
    const rolledBack = handle.page()?.page === 1 &&
      table.tBodies[0].rows[0] === firstRow && firstRow.textContent?.includes("Good");
    const released = bindSelect(failedSelect!, { choices: [] });
    released.dispose();
    handle.setPage({ page: 1, size: 1 });
    rows.set(rows.entries()[1].id, "name", "Fixed");
    handle.setPage({ page: 2, size: 1 });
    const retried = handle.page()?.page === 2 &&
      table.tBodies[0].rows[0].textContent?.includes("Fixed") &&
      !firstRow.isConnected;
    handle.dispose();
    const restored = table.tBodies[0].rows.length === 1 &&
      table.querySelector("[data-row-template]") !== null;
    rows.dispose();
    table.remove();
    return { code, rolledBack, retried, restored };
  }, modules);
  expect(result).toEqual({ code: "RULE_FAILED", rolledBack: true, retried: true, restored: true });
});

test("off-page Select option failure rolls back and releases its new clone before retry", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, select, data }) => {
    const { bindGrid } = await import(grid);
    const { bindSelect } = await import(select);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td data-field="name" ' +
      'data-format=\'[["remember"]]\'></td><td><label>Choice ' +
      '<select data-field="chosen" data-options="choices" data-option-label="label" ' +
      'data-option-value="value"><option value="">Choose</option></select></label></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows([
      { name: "Good", chosen: 1, choices: [{ label: "One", value: 1 }] },
      { name: "Bad", chosen: 2, choices: "bad" as unknown as { label: string; value: number }[] }
    ]);
    let failedSelect: HTMLSelectElement | null = null;
    const handle = bindGrid(table, {
      rows,
      initialPage: { page: 1, size: 1 },
      rules: {
        format: {
          remember: (value: string, _args: readonly unknown[], context: { element?: HTMLElement }) => {
            if (value === "Bad") failedSelect = context.element!.closest("tr")!.querySelector("select");
            return value;
          }
        }
      }
    });
    const firstRow = table.tBodies[0].rows[0];
    let code = "";
    try { handle.setPage({ page: 2, size: 1 }); }
    catch (cause) { code = (cause as { code: string }).code; }
    const rolledBack = handle.page()?.page === 1 &&
      table.tBodies[0].rows[0] === firstRow && firstRow.textContent?.includes("Good");
    const released = bindSelect(failedSelect!, { choices: [] });
    released.dispose();
    handle.setPage({ page: 1, size: 1 });
    rows.set(rows.entries()[1].id, "choices", [{ label: "Recovered", value: 2 }]);
    handle.setPage({ page: 2, size: 1 });
    const retried = handle.page()?.page === 2 &&
      table.tBodies[0].rows[0].textContent?.includes("Bad") &&
      table.querySelector("select")?.selectedOptions[0]?.textContent === "Recovered";
    handle.dispose();
    rows.dispose();
    table.remove();
    return { code, rolledBack, retried };
  }, modules);
  expect(result).toEqual({ code: "GRID_OPTIONS", rolledBack: true, retried: true });
});

test("initial-page draft and focus survive a page-away and return without duplicate IDs", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td><button type="button" data-select-row>' +
      '<span data-field="name"></span></button></td><td><label>Score <input data-field="score">' +
      '</label><output data-error-for="score"></output></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows([
      { name: "First", score: 1 },
      { name: "Second", score: 2 }
    ]);
    const firstId = rows.entries()[0].id;
    const handle = bindGrid(table, {
      rows, initialPage: { page: 1, size: 1 },
      parse: {
        score: (input: string) => {
          const value = Number(input);
          if (!Number.isFinite(value)) throw new Error("Score must be numeric.");
          return value;
        }
      }
    });
    const firstRow = table.tBodies[0].rows[0];
    const firstInput = firstRow.querySelector("input")!;
    firstInput.value = "bad";
    firstInput.dispatchEvent(new Event("input", { bubbles: true }));
    firstInput.focus();
    handle.setPage({ page: 2, size: 1 });
    const moved = !firstRow.isConnected &&
      document.activeElement === table.querySelector("tbody button") &&
      rows.get(firstId)?.value.score === 1;
    handle.setPage({ page: 1, size: 1 });
    const returned = table.tBodies[0].rows[0];
    const ids = [...table.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
    const restored = returned !== firstRow &&
      returned.querySelector("input")?.value === "bad" &&
      returned.querySelector("input")?.getAttribute("aria-invalid") === "true" &&
      returned.querySelector("output")?.textContent === "Score must be numeric." &&
      ids.length === new Set(ids).size;
    const issue = handle.validate(firstId).issues[0];
    const validated = issue?.rule === "parse" && !!issue.element;
    handle.dispose();
    rows.dispose();
    table.remove();
    return { moved, restored, validated };
  }, modules);
  expect(result).toEqual({ moved: true, restored: true, validated: true });
});
