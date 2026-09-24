import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const source = (path: string) =>
  "/@fs/" + fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/");

const modules = {
  grid: source("../../src/ui/grid.ts"),
  form: source("../../src/ui/form.ts"),
  list: source("../../src/ui/list.ts"),
  data: source("../../src/data/index.ts")
};

test("Grid text and checkbox edits keep typed nested raw values", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<tbody><tr data-row-template>
      <td><label>Salary <input data-field="profile.salary" data-validate='[["number"]]'></label>
        <output data-error-for="profile.salary"></output></td>
      <td><label>Active <input type="checkbox" data-field="active"></label></td>
      </tr></tbody>`;
    document.body.append(table);
    const rows = createRows([{ profile: { salary: 10 }, active: false }]);
    const id = rows.entries()[0].id;
    const handle = bindGrid(table, { rows, parse: {
      "profile.salary": (input: string) => {
        const value = Number(input);
        if (!Number.isFinite(value)) throw new Error("Enter a number.");
        return value;
      }
    } });
    const salary = table.querySelector<HTMLInputElement>('[data-field="profile.salary"]')!;
    const active = table.querySelector<HTMLInputElement>('[data-field="active"]')!;
    salary.value = "28";
    salary.dispatchEvent(new Event("input", { bubbles: true }));
    const beforeChange = { stored: rows.get(id)!.value.profile.salary, draft: salary.value };
    salary.dispatchEvent(new Event("change", { bubbles: true }));
    active.checked = true;
    active.dispatchEvent(new Event("change", { bubbles: true }));
    const afterChange = {
      salary: rows.get(id)!.value.profile.salary,
      salaryType: typeof rows.get(id)!.value.profile.salary,
      active: rows.get(id)!.value.active,
      status: rows.get(id)!.status,
      valid: handle.validate(id).valid
    };
    handle.dispose();
    rows.dispose();
    table.remove();
    return { beforeChange, afterChange };
  }, modules);
  expect(result).toEqual({
    beforeChange: { stored: 10, draft: "28" },
    afterChange: { salary: 28, salaryType: "number", active: true, status: "update", valid: true }
  });
});

test("Grid parse failure stays with RowId through paging and clears on revert", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<tbody><tr data-row-template><td>
      <button type="button" data-select-row><span data-field="name"></span></button>
      <label>Score <input data-field="score"></label>
      <output data-error-for="score"></output>
      </td></tr></tbody>`;
    document.body.append(table);
    const rows = createRows([{ name: "Ada", score: 1 }, { name: "Grace", score: 2 }]);
    const id = rows.entries()[0].id;
    const handle = bindGrid(table, { rows, parse: {
      score: (input: string) => {
        const value = Number(input);
        if (!Number.isFinite(value)) throw new Error("Score must be numeric.");
        return value;
      }
    } });
    const input = table.querySelector<HTMLInputElement>("input")!;
    input.value = "bad";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    const blocked = {
      value: rows.get(id)!.value.score,
      text: input.value,
      rule: handle.validate(id).issues[0]?.rule,
      message: table.querySelector("output")?.textContent
    };
    handle.setPage({ page: 2, size: 1 });
    const hidden = handle.validate(id);
    handle.setPage({ page: 1, size: 1 });
    const restoredDraft = table.querySelector<HTMLInputElement>("input")?.value;
    rows.revert(id);
    const afterRevert = {
      value: table.querySelector<HTMLInputElement>("input")?.value,
      valid: handle.validate(id).valid
    };
    handle.dispose();
    rows.dispose();
    table.remove();
    return {
      blocked, hidden: hidden.issues.map((issue: { rule: string; element?: Element }) =>
        ({ rule: issue.rule, hasElement: !!issue.element })),
      restoredDraft, afterRevert
    };
  }, modules);
  expect(result).toEqual({
    blocked: { value: 1, text: "bad", rule: "parse", message: "Score must be numeric." },
    hidden: [{ rule: "parse", hasElement: false }],
    restoredDraft: "bad",
    afterRevert: { value: "1", valid: true }
  });
});

test("Grid sort and page state use authored headings and restore focus", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<thead><tr><th scope="col" aria-sort="none"><button type="button">Name</button></th></tr></thead>
      <tbody><tr data-row-template><td><button type="button" data-select-row>
      <span data-field="name"></span></button></td></tr></tbody>`;
    document.body.append(table);
    const rows = createRows([{ name: "Ada" }, { name: "Grace" }]);
    const heading = table.querySelector("th")!;
    const handle = bindGrid(table, { rows });
    let duplicate = "";
    try { bindGrid(table, { rows }); } catch (cause) { duplicate = (cause as { code: string }).code; }
    handle.setSort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name),
      { column: heading, direction: "ascending" });
    const sort = heading.getAttribute("aria-sort");
    const first = table.querySelector<HTMLButtonElement>("tbody button")!;
    first.focus();
    handle.setPage({ page: 2, size: 1 });
    const paged = { ...handle.page()!, name: table.querySelector("tbody button")?.textContent?.trim(),
      focused: document.activeElement === table.querySelector("tbody button") };
    handle.setFilter((row: { name: string }) => row.name === "Ada");
    const clamped = handle.page();
    handle.setFilter(null);
    const stable = handle.page()?.page;
    handle.setSort(null);
    const clearedSort = heading.getAttribute("aria-sort");
    handle.dispose();
    const restored = { sort: heading.getAttribute("aria-sort"),
      template: table.querySelector("[data-row-template]") !== null };
    rows.dispose();
    table.remove();
    return { duplicate, sort, paged, clamped, stable, clearedSort, restored };
  }, modules);
  expect(result).toEqual({
    duplicate: "GRID_IN_USE", sort: "ascending",
    paged: { page: 2, size: 1, total: 2, pages: 2, name: "Grace", focused: true },
    clamped: { page: 1, size: 1, total: 1, pages: 1 },
    stable: 1, clearedSort: "none", restored: { sort: "none", template: true }
  });
});


test("Grid rejects ambiguous controls before changing authored markup", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const rows = createRows([{ quantity: 1, choices: [1] }]);
    function bind(markup: string, parse?: Record<string, (input: string) => number>) {
      const table = document.createElement("table");
      table.innerHTML = `<tbody><tr data-row-template><td>${markup}</td></tr></tbody>`;
      document.body.append(table);
      let code = "";
      try { bindGrid(table, { rows, parse })?.dispose(); }
      catch (cause) { code = (cause as { code: string }).code; }
      const original = table.querySelector("[data-row-template]") !== null;
      table.remove();
      return { code, original };
    }
    const number = bind('<input type="number" data-field="quantity">');
    const multiple = bind('<select multiple data-field="choices"><option value="1">One</option></select>');
    const parsed = bind('<input type="number" data-field="quantity">',
      { quantity: (input: string) => Number(input) });
    rows.dispose();
    return { number, multiple, parsed };
  }, modules);
  expect(result).toEqual({
    number: { code: "GRID_PARSE_FIELD", original: true },
    multiple: { code: "GRID_CONTROL", original: true },
    parsed: { code: "", original: true }
  });
});


test("Form and Grid parsers see one unparsed input snapshot", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ form, grid, data }) => {
    const { bindForm } = await import(form);
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const formRoot = document.createElement("form");
    formRoot.innerHTML = '<input data-field="a"><input data-field="b">';
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td><input data-field="a"></td><td><input data-field="b"></td></tr></tbody>';
    document.body.append(formRoot, table);
    const rows = createRows([{ a: 1, b: 2 }]);
    const seenForm: unknown[] = [];
    const seenGrid: unknown[] = [];
    const parsers = (seen: unknown[]) => ({
      a: (input: string, context: { values: { a: unknown; b: unknown } }) => {
        seen.push(["a", context.values.a, context.values.b]);
        return Number(input);
      },
      b: (input: string, context: { values: { a: unknown; b: unknown } }) => {
        seen.push(["b", context.values.a, context.values.b]);
        return Number(input);
      }
    });
    const formHandle = bindForm(formRoot, { parse: parsers(seenForm) });
    const gridHandle = bindGrid(table, { rows, parse: parsers(seenGrid) });
    for (const root of [formRoot, table]) {
      const inputs = root.querySelectorAll<HTMLInputElement>("input");
      inputs[0].value = "3"; inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[1].value = "4"; inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
    }
    seenForm.length = 0; seenGrid.length = 0;
    const valid = [formHandle.validate().valid, gridHandle.validate().valid];
    formHandle.dispose(); gridHandle.dispose(); rows.dispose();
    formRoot.remove(); table.remove();
    return { seenForm, seenGrid, valid };
  }, modules);
  expect(result).toEqual({
    seenForm: [["a", "3", "4"], ["b", "3", "4"]],
    seenGrid: [["a", "3", "4"], ["b", "3", "4"]],
    valid: [true, true]
  });
});


test("Grid and List keep keyboard focus when a disabled row leaves the page", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, list, data }) => {
    const { bindGrid } = await import(grid);
    const { bindList } = await import(list);
    const { createRows } = await import(data);
    const rows = createRows([{ name: "Ada" }, { name: "Grace" }]);
    const table = document.createElement("table");
    table.innerHTML = `<thead><tr><th scope="col">Name</th></tr></thead><tbody>
      <tr data-row-template><td><button type="button" disabled data-select-row>Select</button>
      <input data-field="name"></td></tr></tbody>`;
    const ul = document.createElement("ul");
    ul.innerHTML = `<li data-row-template><button type="button" disabled data-select-row>Select</button>
      <button type="button" class="extra">Details</button><span data-field="name"></span></li>`;
    document.body.append(table, ul);
    const gridHandle = bindGrid(table, { rows });
    const listHandle = bindList(ul, { rows });
    table.querySelector<HTMLInputElement>("input")!.focus();
    gridHandle.setPage({ page: 2, size: 1 });
    const gridFocused = document.activeElement === table.querySelector("input");
    ul.querySelector<HTMLButtonElement>(".extra")!.focus();
    listHandle.setPage({ page: 2, size: 1 });
    const listFocused = document.activeElement === ul;
    let badSort = "";
    try { gridHandle.setSort(() => 0, { column: table.querySelector("th")!,
      direction: "sideways" as "ascending" }); }
    catch (cause) { badSort = (cause as { code: string }).code; }
    gridHandle.dispose(); listHandle.dispose();
    const listTabIndex = ul.hasAttribute("tabindex");
    table.tabIndex = 0;
    const another = bindGrid(table, { rows });
    another.dispose();
    const authoredTabIndex = table.tabIndex;
    rows.dispose(); table.remove(); ul.remove();
    return { gridFocused, listFocused, listTabIndex, authoredTabIndex, badSort };
  }, modules);
  expect(result).toEqual({ gridFocused: true, listFocused: true, listTabIndex: false,
    authoredTabIndex: 0, badSort: "GRID_SORT" });
});
