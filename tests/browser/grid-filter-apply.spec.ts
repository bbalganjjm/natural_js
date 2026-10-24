import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Rows, Snapshot } from "../../src/data/index.js";
import type { GridHandle, SelectValue } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Employee = { name: string; team: SelectValue; group: string; score: number };
type Options = Parameters<typeof bindGrid<Employee>>[1];
declare global {
  interface Window {
    filterApplyFixture: {
      rows: Rows<Employee>; grid: GridHandle<Employee>; table: HTMLTableElement; form: HTMLFormElement;
      original: string; options: Options; events: number; submits: number;
      hooks: { value?: (row: Snapshot<Employee>) => SelectValue; label?: (value: SelectValue) => string; bind?: () => void };
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts"),
  filters: source("../../src/ui/grid-filters.ts") };
const input = '[data-filter-apply-fixture] [data-filter-search="team"]';
const apply = '[data-filter-apply-fixture] [data-apply-filter="team"]';
const select = '[data-filter-apply-fixture] [data-filter-column="team"]';
const markup = `<caption>Applied team filters</caption><thead><tr>
  <th scope="col" data-column="name">Employee</th>
  <th scope="col" data-column="team"><label>Find teams <input type="search" data-filter-search="team"></label>
    <button type="button" data-apply-filter="team">Apply matches</button>
    <button type="button" data-clear-filter="team">All teams</button>
    <label>Team values <select multiple data-filter-column="team"></select></label></th>
  <th scope="col" data-column="group"><label>Groups <select multiple data-filter-column="group"></select></label></th>
  <th scope="col" data-column="score">Score</th></tr></thead><tbody><tr data-row-template>
  <th scope="row" data-column="name"><button type="button" data-select-row><span data-field="name"></span></button></th>
  <td data-column="team" data-field="team"></td><td data-column="group" data-field="group"></td>
  <td data-column="score"><label>Score <input type="number" data-field="score" required min="1"></label>
    <output data-error-for="score"></output></td></tr></tbody>`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid), { createRows } = await import(modules.data);
    const form = document.createElement("form"); form.dataset.filterApplyFixture = "";
    const table = document.createElement("table"); table.innerHTML = markup; form.append(table); document.body.append(form);
    const rows = createRows([
      { name: "Ada", team: 1, group: "red", score: 10 }, { name: "Bjarne", team: "1", group: "blue", score: 20 },
      { name: "Grace", team: 1, group: "blue", score: 30 }, { name: "Linus", team: "1", group: "red", score: 40 },
      { name: "Margaret", team: 2, group: "red", score: 50 }, { name: "Yukihiro", team: null, group: "blue", score: 60 }
    ]);
    const hooks: Window["filterApplyFixture"]["hooks"] = {};
    const options: Options = { rows, parse: { score: Number },
      filters: { team: { value: row => hooks.value ? hooks.value(row) : row.team,
        label: value => hooks.label ? hooks.label(value) : value === null ? "Unassigned" : `${typeof value}: ${value}` },
        group: { value: row => row.group } }, onBind: () => hooks.bind?.() };
    const original = table.outerHTML, grid = bindGrid(table, options);
    const h = window.filterApplyFixture = { rows, grid, table, form, original, options, hooks, events: 0, submits: 0 };
    rows.subscribe(() => h.events++);
    form.addEventListener("submit", event => { event.preventDefault(); h.submits++; });
  }, { modules, markup });
});

test("choices keep occurrence order and zero counts inside manual and status domains", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.filterApplyFixture; h.grid.setPage({ page: 2, size: 1 }); h.grid.setColumnFilter("group", ["blue"]);
    const blue = h.grid.filterChoices("team"); h.grid.setColumnFilter("team", [2]);
    const chosenZero = { choices: h.grid.filterChoices("team"), filter: h.grid.columnFilter("team"), count: h.grid.rowIds("filtered").length };
    h.grid.setFilter(row => row.group === "red"); const manual = h.grid.filterChoices("team");
    h.grid.setFilter(null); h.grid.setColumnFilter("team", null); h.grid.setColumnFilter("group", null);
    h.rows.remove(5); const live = h.grid.filterChoices("team").map(choice => choice.value);
    h.grid.setStatusFilter(["delete"]); const deleted = h.grid.filterChoices("team");
    return { blue, chosenZero, manual, live, deleted, frozen: Object.isFrozen(blue) && blue.every(Object.isFrozen) };
  });
  const blue = [{ value: 1, label: "number: 1", count: 1 }, { value: "1", label: "string: 1", count: 1 },
    { value: 2, label: "number: 2", count: 0 }, { value: null, label: "Unassigned", count: 1 }];
  expect(result).toEqual({ blue, chosenZero: { choices: blue, filter: [2], count: 0 },
    manual: [{ value: 1, label: "number: 1", count: 0 }, { value: "1", label: "string: 1", count: 0 },
      { value: 2, label: "number: 2", count: 0 }], live: [1, "1", null], deleted: [{ value: 2, label: "number: 2", count: 1 }], frozen: true });
});

test("preview stays separate and Apply replaces the complete raw filter", async ({ page }) => {
  await page.evaluate(() => window.filterApplyFixture.grid.setColumnFilter("team", [1, null]));
  await page.locator(input).fill("string"); await expect(page.locator(select).locator("option")).toHaveCount(1);
  expect(await page.evaluate(() => window.filterApplyFixture.grid.columnFilter("team"))).toEqual([1, null]);
  await page.locator(apply).click();
  expect(await page.evaluate(() => ({ filter: window.filterApplyFixture.grid.columnFilter("team"),
    ids: window.filterApplyFixture.grid.rowIds("filtered"), events: window.filterApplyFixture.events })))
    .toEqual({ filter: ["1"], ids: [2, 4], events: 0 });
});

test("no matches means none and whitespace Apply clears the column and preview", async ({ page }) => {
  await page.locator(input).fill("no matches"); await page.locator(apply).click();
  expect(await page.evaluate(() => ({ filter: window.filterApplyFixture.grid.columnFilter("team"),
    ids: window.filterApplyFixture.grid.rowIds("filtered") }))).toEqual({ filter: [], ids: [] });
  await page.locator(input).fill("   "); await page.locator(apply).click();
  await expect(page.locator(input)).toHaveValue(""); await expect(page.locator(select).locator("option")).toHaveCount(4);
  expect(await page.evaluate(() => window.filterApplyFixture.grid.columnFilter("team"))).toBeNull();
  await expect(page.locator('[data-filter-apply-fixture] tbody tr')).toHaveCount(6);
});

test("boolean and null choices keep raw identities while applying labels", async ({ page }) => {
  await page.evaluate(() => window.filterApplyFixture.rows.append([{ name: "Boolean", team: false, group: "red", score: 70 }]));
  await page.locator(input).fill("boolean: false"); await page.locator(apply).click();
  expect(await page.evaluate(() => window.filterApplyFixture.grid.columnFilter("team"))).toEqual([false]);
  await expect(page.locator('[data-filter-apply-fixture] tbody [data-select-row]')).toHaveText("Boolean");
  await page.locator(input).fill("unassigned"); await page.locator(apply).click();
  expect(await page.evaluate(() => window.filterApplyFixture.grid.columnFilter("team"))).toEqual([null]);
  await expect(page.locator('[data-filter-apply-fixture] tbody [data-select-row]')).toHaveText("Yukihiro");
});

test("plain Enter applies without implicit form submission", async ({ page }) => {
  await page.locator(input).fill("number"); await page.locator(input).press("Enter");
  expect(await page.evaluate(() => ({ filter: window.filterApplyFixture.grid.columnFilter("team"),
    submits: window.filterApplyFixture.submits }))).toEqual({ filter: [1, 2], submits: 0 });
});

test("composing modifier and disabled gestures do not apply or prevent defaults", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.filterApplyFixture, search = h.table.querySelector<HTMLInputElement>("[data-filter-search]")!;
    const button = h.table.querySelector<HTMLButtonElement>("[data-apply-filter]")!; search.value = "number";
    const skipped = [{ isComposing: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true }, { shiftKey: true }]
      .map(extra => { const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, ...extra });
        search.dispatchEvent(event); return event.defaultPrevented; });
    button.disabled = true; const disabledButton = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    search.dispatchEvent(disabledButton); button.disabled = false; search.disabled = true;
    const disabledInput = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }); search.dispatchEvent(disabledInput);
    button.click(); search.disabled = false;
    return { skipped, disabledButton: disabledButton.defaultPrevented, disabledInput: disabledInput.defaultPrevented,
      filter: h.grid.columnFilter("team"), ids: h.grid.rowIds("filtered") };
  });
  expect(result).toEqual({ skipped: [false, false, false, false, false], disabledButton: false,
    disabledInput: false, filter: null, ids: [1, 2, 3, 4, 5, 6] });
});

test("a search without an authored Apply keeps Enter preview-only", async ({ page }) => {
  await page.evaluate(async ({ modules }) => {
    const { bindGrid } = await import(modules.grid), h = window.filterApplyFixture;
    h.grid.dispose(); h.table.querySelector("[data-apply-filter]")!.remove(); h.grid = bindGrid(h.table, h.options);
  }, { modules });
  await page.locator(input).fill("number");
  const result = await page.evaluate(() => {
    const h = window.filterApplyFixture, search = h.table.querySelector<HTMLInputElement>("[data-filter-search]")!;
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }); search.dispatchEvent(event);
    return { filter: h.grid.columnFilter("team"), prevented: event.defaultPrevented, ids: h.grid.rowIds("filtered") };
  });
  expect(result).toEqual({ filter: null, prevented: false, ids: [1, 2, 3, 4, 5, 6] });
});

test("blank no-op refreshes choices and Clear preserves its search contract", async ({ page }) => {
  await page.locator(input).fill("string"); await expect(page.locator(select).locator("option")).toHaveCount(1);
  await page.evaluate(() => { window.filterApplyFixture.table.querySelector<HTMLInputElement>("[data-filter-search]")!.value = "   "; });
  await page.locator(apply).click();
  await expect(page.locator(input)).toHaveValue(""); await expect(page.locator(select).locator("option")).toHaveCount(4);
  await page.locator(input).fill("string"); await page.locator(apply).click();
  await page.locator('[data-filter-apply-fixture] [data-clear-filter]').click();
  await expect(page.locator(input)).toHaveValue("string"); await expect(page.locator(select).locator("option")).toHaveCount(1);
  expect(await page.evaluate(() => window.filterApplyFixture.grid.columnFilter("team"))).toBeNull();
});

test("Apply preserves other filters paging identities checks and hidden drafts", async ({ page }) => {
  const before = await page.evaluate(() => {
    const h = window.filterApplyFixture; h.grid.select(1); h.grid.setChecked([3]);
    const score = h.table.querySelector<HTMLInputElement>('[data-field="score"]')!;
    score.value = ""; score.dispatchEvent(new Event("input", { bubbles: true }));
    h.grid.setColumnFilter("group", ["blue"]); h.grid.setPage({ page: 3, size: 1 });
    return h.rows.entries().map(row => row.value.score);
  });
  await page.locator(input).fill("string"); await page.locator(apply).click();
  expect(await page.evaluate(() => {
    const h = window.filterApplyFixture;
    return { group: h.grid.columnFilter("group"), team: h.grid.columnFilter("team"), page: h.grid.page(),
      active: h.grid.selected(), checks: h.grid.checkedIds(), scores: h.rows.entries().map(row => row.value.score), events: h.events };
  })).toEqual({ group: ["blue"], team: ["1"], page: { page: 1, size: 1, total: 1, pages: 1 },
    active: 1, checks: [3], scores: before, events: 0 });
  const draft = await page.evaluate(() => {
    const h = window.filterApplyFixture; h.grid.setColumnFilter("group", null); h.grid.setColumnFilter("team", null); h.grid.setPage(null);
    return { entered: h.table.querySelector<HTMLInputElement>('[data-field="score"]')!.value, valid: h.grid.validate(1).valid };
  });
  expect(draft).toEqual({ entered: "", valid: false });
});

test("invalid Apply declarations fail before DOM ownership", async ({ page }) => {
  const result = await page.evaluate(async ({ modules }) => {
    const { bindGrid } = await import(modules.grid), h = window.filterApplyFixture;
    const changes = [
      (table: HTMLTableElement) => table.querySelector("[data-filter-search]")!.remove(),
      (table: HTMLTableElement) => table.querySelector("[data-filter-search]")!.after(table.querySelector("[data-filter-search]")!.cloneNode()),
      (table: HTMLTableElement) => table.querySelector("[data-apply-filter]")!.setAttribute("data-apply-filter", "missing"),
      (table: HTMLTableElement) => table.querySelector("[data-apply-filter]")!.setAttribute("type", "submit"),
      (table: HTMLTableElement) => { table.querySelector("[data-apply-filter]")!.outerHTML = '<span data-apply-filter="team">Apply</span>'; }
    ];
    return changes.map(change => {
      const holder = document.createElement("div"); holder.innerHTML = h.original; const table = holder.firstElementChild as HTMLTableElement;
      change(table); document.body.append(table); const original = table.outerHTML; let code = "";
      try { bindGrid(table, h.options); } catch (error) { code = (error as { code: string }).code; }
      const exact = table.outerHTML === original; table.remove(); return { code, exact };
    });
  }, { modules });
  expect(result).toEqual(Array.from({ length: 5 }, () => ({ code: "GRID_FILTER", exact: true })));
});

test("preparation failures retain the previous filter view page and data", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.evaluate(() => {
    const h = window.filterApplyFixture; h.grid.setColumnFilter("team", [1]); h.grid.setPage({ page: 2, size: 1 });
    h.hooks.label = () => { throw new Error("label preparation failed"); };
    h.table.querySelector<HTMLInputElement>("[data-filter-search]")!.value = "string";
  });
  await page.locator(apply).click(); expect(errors).toContain("label preparation failed");
  expect(await page.evaluate(() => {
    const h = window.filterApplyFixture; h.hooks.label = undefined;
    return { filter: h.grid.columnFilter("team"), page: h.grid.page(), ids: h.grid.rowIds("visible"), events: h.events,
      stored: h.rows.entries().map(row => row.value.score) };
  })).toEqual({ filter: [1], page: { page: 2, size: 1, total: 2, pages: 2 }, ids: [3], events: 0, stored: [10, 20, 30, 40, 50, 60] });
  await page.locator(apply).click(); expect(await page.evaluate(() => window.filterApplyFixture.grid.columnFilter("team"))).toEqual(["1"]);
});

test("post-commit bind failure retains the committed state and query", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.evaluate(() => {
    const h = window.filterApplyFixture; h.grid.setColumnFilter("team", [1]); h.hooks.bind = () => { throw new Error("notification failed"); };
    h.table.querySelector<HTMLInputElement>("[data-filter-search]")!.value = "   ";
  });
  await page.locator(apply).click(); expect(errors).toContain("The bind completion callback failed.");
  expect(await page.evaluate(() => ({ filter: window.filterApplyFixture.grid.columnFilter("team"),
    ids: window.filterApplyFixture.grid.rowIds("filtered"), query: window.filterApplyFixture.table.querySelector<HTMLInputElement>("[data-filter-search]")!.value })))
    .toEqual({ filter: null, ids: [1, 2, 3, 4, 5, 6], query: "   " });
});

test("one-shot Rows manual and column mutations cannot publish stale choices", async ({ page }) => {
  const result = await page.evaluate(async ({ modules }) => {
    const { createRows } = await import(modules.data), { createGridFilters } = await import(modules.filters);
    return ["rows", "manual", "column"].map(kind => {
      const rows = createRows([{ team: "A", group: "x" }, { team: "B", group: "y" }]);
      let manual: ((row: { team: string; group: string }) => boolean) | null = null, once = true;
      let filters: ReturnType<typeof createGridFilters>;
      filters = createGridFilters({ rows, filters: { team: { value: (row: { team: string }) => row.team, label(value: SelectValue) {
        if (once) { once = false;
          if (kind === "rows") rows.append([{ team: "C", group: "x" }]);
          else if (kind === "manual") manual = row => row.team === "B";
          else filters.setColumnFilter("group", ["x"]);
        }
        return String(value);
      } }, group: { value: (row: { group: string }) => row.group } } }, () => manual, () => undefined, () => rows.entries());
      let code = ""; try { filters.filterChoices("team"); } catch (error) { code = (error as { code: string }).code; }
      const choices = filters.filterChoices("team"); rows.dispose(); return { kind, code, choices };
    });
  }, { modules });
  expect(result).toEqual([
    { kind: "rows", code: "GRID_FILTER", choices: [{ value: "A", label: "A", count: 1 }, { value: "B", label: "B", count: 1 }, { value: "C", label: "C", count: 1 }] },
    { kind: "manual", code: "GRID_FILTER", choices: [{ value: "B", label: "B", count: 1 }] },
    { kind: "column", code: "GRID_FILTER", choices: [{ value: "A", label: "A", count: 1 }, { value: "B", label: "B", count: 0 }] }
  ]);
});

test("independent native headers stay accessible and exact disposal leaves late controls quiet", async ({ page }) => {
  const result = await page.evaluate(async ({ modules }) => {
    const { bindGrid } = await import(modules.grid), h = window.filterApplyFixture;
    const holder = document.createElement("div"); holder.innerHTML = h.original; const table = holder.firstElementChild as HTMLTableElement;
    document.body.append(table); const original = table.outerHTML;
    const other = bindGrid(table, { rows: h.rows, parse: { score: Number }, filters: { team: { value: (row: Employee) => row.team }, group: { value: (row: Employee) => row.group } } });
    h.grid.setColumnFilter("team", [1]); const independent = other.columnFilter("team") === null && other.rowIds("filtered").length === 6;
    const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
    other.dispose(); const exactOther = table.outerHTML === original; table.remove();
    const button = h.table.querySelector<HTMLButtonElement>("[data-apply-filter]")!;
    h.grid.dispose(); const exact = h.table.outerHTML === h.original; button.click(); h.grid = bindGrid(h.table, h.options);
    return { independent, uniqueIds: ids.length === new Set(ids).size, exactOther, exact, events: h.events };
  }, { modules });
  expect(result).toEqual({ independent: true, uniqueIds: true, exactOther: true, exact: true, events: 0 });
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]).analyze();
  expect(axe.violations.map(violation => violation.id)).toEqual([]);
});

test("Enter uses an enabled matching Apply when another matching button is disabled", async ({ page }) => {
  await page.evaluate(async ({ modules }) => {
    const { bindGrid } = await import(modules.grid), h = window.filterApplyFixture;
    h.grid.dispose(); const first = h.table.querySelector<HTMLButtonElement>("[data-apply-filter]")!;
    const second = first.cloneNode(true) as HTMLButtonElement; second.textContent = "Apply elsewhere"; first.after(second); first.disabled = true;
    h.grid = bindGrid(h.table, h.options);
  }, { modules });
  await page.locator(input).fill("number"); await page.locator(input).press("Enter");
  expect(await page.evaluate(() => ({ filter: window.filterApplyFixture.grid.columnFilter("team"),
    submits: window.filterApplyFixture.submits }))).toEqual({ filter: [1, 2], submits: 0 });
});

test("zero-count raw values and labels retain synchronous scalar validation", async ({ page }) => {
  const result = await page.evaluate(async ({ modules }) => {
    const { createRows } = await import(modules.data), { createGridFilters } = await import(modules.filters);
    const invalid = [undefined, NaN, {}, Promise.resolve(1)];
    const raw = invalid.map(bad => {
      const rows = createRows([{ team: "A", group: "x" }, { team: "B", group: "y" }]);
      const filters = createGridFilters({ rows, filters: {
        team: { value: (row: { team: string }) => row.team === "A" ? "A" : bad }, group: { value: (row: { group: string }) => row.group }
      } }, () => null, () => undefined, () => rows.entries());
      filters.setColumnFilter("group", ["x"]); let code = "";
      try { filters.filterChoices("team"); } catch (error) { code = (error as { code: string }).code; }
      rows.dispose(); return code;
    });
    const rows = createRows([{ team: "A" }]);
    const filters = createGridFilters({ rows, filters: { team: { value: (row: { team: string }) => row.team, label: () => Promise.resolve("bad") } } },
      () => null, () => undefined, () => rows.entries());
    let label = ""; try { filters.filterChoices("team"); } catch (error) { label = (error as { code: string }).code; }
    rows.dispose(); return { raw, label };
  }, { modules });
  expect(result).toEqual({ raw: ["GRID_FILTER", "GRID_FILTER", "GRID_FILTER", "GRID_FILTER"], label: "GRID_FILTER" });
});

test("completion disposal leaves restored application input state untouched", async ({ page }) => {
  await page.evaluate(() => {
    const h = window.filterApplyFixture, search = h.table.querySelector<HTMLInputElement>("[data-filter-search]")!;
    h.grid.setColumnFilter("team", [1]); search.value = "   ";
    h.hooks.bind = () => { h.grid.dispose(); search.value = "Retained by app"; };
  });
  await page.locator(apply).click();
  expect(await page.evaluate(() => {
    const h = window.filterApplyFixture;
    return { query: h.table.querySelector<HTMLInputElement>("[data-filter-search]")!.value,
      exact: h.table.outerHTML === h.original, events: h.events, rows: h.rows.entries().length };
  })).toEqual({ query: "Retained by app", exact: true, events: 0, rows: 6 });
});

test("completion callbacks retain a newer live query and a replacement Grid owner", async ({ page }) => {
  await page.evaluate(() => {
    const h = window.filterApplyFixture, search = h.table.querySelector<HTMLInputElement>("[data-filter-search]")!;
    h.grid.setColumnFilter("team", [1]); search.value = "   "; h.hooks.bind = () => { search.value = "string"; };
  });
  await page.locator(apply).click();
  await expect(page.locator(input)).toHaveValue("string"); await expect(page.locator(select).locator("option")).toHaveCount(1);
  expect(await page.evaluate(() => window.filterApplyFixture.grid.columnFilter("team"))).toBeNull();
  await page.evaluate(async ({ modules }) => {
    const { bindGrid } = await import(modules.grid), h = window.filterApplyFixture;
    h.grid.setColumnFilter("team", [1]); const search = h.table.querySelector<HTMLInputElement>("[data-filter-search]")!; search.value = "   ";
    h.hooks.bind = () => {
      h.grid.dispose(); h.hooks.bind = undefined; search.value = "unassigned"; h.grid = bindGrid(h.table, h.options);
    };
  }, { modules });
  await page.locator(apply).click();
  await expect(page.locator(input)).toHaveValue("unassigned"); await expect(page.locator(select).locator("option")).toHaveCount(1);
  expect(await page.evaluate(() => ({ filter: window.filterApplyFixture.grid.columnFilter("team"),
    count: window.filterApplyFixture.grid.rowIds("filtered").length, events: window.filterApplyFixture.events })))
    .toEqual({ filter: null, count: 6, events: 0 });
});
