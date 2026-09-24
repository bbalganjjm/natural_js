// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const source = (path: string) =>
  `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;

const modules = {
  list: source("../../src/ui/list.ts"),
  data: source("../../src/data/index.ts")
};

test("authored list keeps nested raw choices and RowId selection through sort, filter, and page", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ list, data }) => {
    const { bindList } = await import(list);
    const { createRows } = await import(data);
    const host = document.createElement("section");
    host.innerHTML = `<ul><li data-row-template>
      <button type="button" data-select-row><span data-field="profile.name"></span></button>
      <label>Choice <select data-field="profile.chosen" data-options="profile.choices"
        data-option-label="label" data-option-value="value"><option value="">Choose</option>
      </select></label></li><li data-empty hidden>No matches</li></ul>`;
    document.body.append(host);
    const root = host.querySelector("ul")!;
    const rows = createRows([
      { profile: { name: "Ada", chosen: 22, choices: [{ label: "First", value: 22 }, {}] } },
      { profile: { name: "Grace", chosen: "22", choices: [{ label: "Second", value: "22" }] } },
      { profile: { name: "Lin", chosen: true, choices: [{ label: "Third", value: true }] } }
    ]);
    const [ada, grace, lin] = rows.entries().map((row: { id: number }) => row.id);
    const events: (number | null)[] = [];
    const handle = bindList(root, { rows, onSelect: ({ id }: { id: number | null }) => events.push(id) });
    const controls = [...root.querySelectorAll("select")];
    const initial = {
      count: root.querySelectorAll("li:not([data-empty])").length,
      selected: controls.map(control => control.selectedIndex),
      disabled: controls.every(control => control.disabled),
      labels: controls.map(control => control.selectedOptions[0]?.textContent),
      duplicateIds: (() => {
        const ids = [...document.querySelectorAll("[id]")].map(element => element.id);
        return ids.length - new Set(ids).size;
      })()
    };
    const button = root.querySelector("button")!;
    button.focus();
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    handle.setSort((a: { profile: { name: string } }, b: { profile: { name: string } }) =>
      b.profile.name.localeCompare(a.profile.name));
    const focusedAfterSort = document.activeElement === button;
    handle.setPage({ page: 2, size: 1 });
    const pageTwo = {
      selected: handle.selected(), page: handle.page(),
      text: root.querySelector("li:not([data-empty])")?.textContent?.replace(/\s+/g, " ").trim(),
      focusedAfterSort,
      pressed: root.querySelector("button")?.getAttribute("aria-pressed"),
      focused: document.activeElement === button
    };
    handle.setFilter((row: { profile: { name: string } }) => row.profile.name !== "Ada");
    const filtered = { selected: handle.selected(), page: handle.page() };
    handle.setFilter(() => false);
    const empty = { visible: !root.querySelector<HTMLLIElement>("[data-empty]")!.hidden,
      count: root.querySelectorAll("li:not([data-empty])").length, page: handle.page() };
    handle.setFilter(null);
    const restoredPage = handle.page();
    handle.setPage(null);
    rows.remove(ada);
    const afterRemove = { selected: handle.selected(), events: [...events], count: root.querySelectorAll("button").length };
    handle.select(lin);
    rows.replace([{ profile: { name: "New", chosen: null, choices: [] } }]);
    const replaced = { selected: handle.selected(), newId: rows.entries()[0].id !== grace,
      events: [...events] };
    handle.dispose();
    handle.dispose();
    const restored = { template: root.querySelectorAll("[data-row-template]").length,
      emptyHidden: root.querySelector<HTMLLIElement>("[data-empty]")!.hidden,
      clones: root.querySelectorAll("button").length };
    rows.dispose();
    host.remove();
    return { initial, pageTwo, filtered, empty, restoredPage, afterRemove, replaced, restored };
  }, modules);
  expect(result.initial).toEqual({
    count: 3, selected: [1, 1, 1], disabled: true,
    labels: ["First", "Second", "Third"], duplicateIds: 0
  });
  expect(result.pageTwo).toEqual({
    selected: 1, page: { page: 2, size: 1, total: 3, pages: 3 },
    text: "Grace Choice Choose Second", pressed: "false", focused: false,
    focusedAfterSort: true
  });
  expect(result.filtered).toEqual({ selected: 1, page: { page: 2, size: 1, total: 2, pages: 2 } });
  expect(result.empty).toEqual({
    visible: true, count: 0, page: { page: 1, size: 1, total: 0, pages: 0 }
  });
  expect(result.restoredPage).toEqual({ page: 1, size: 1, total: 3, pages: 3 });
  expect(result.afterRemove).toEqual({ selected: null, events: [1, null], count: 2 });
  expect(result.replaced).toEqual({ selected: null, newId: true, events: [1, null, 3, null] });
  expect(result.restored).toEqual({ template: 1, emptyHidden: true, clones: 1 });
});

test("List validates hidden rows and links errors without changing raw data", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ list, data }) => {
    const { bindList } = await import(list);
    const { createRows } = await import(data);
    const host = document.createElement("section");
    host.innerHTML = `<ol><li data-row-template>
      <span data-field="amount" data-format='[["commas"]]' data-validate='[["integer"]]'></span>
      <output data-error-for="amount"></output>
      <label>Name <input data-field="name" required minlength="3"></label>
      <output data-error-for="name"></output>
      <label>Choice <select data-field="chosen" data-options="choices"
        data-option-label="label" data-option-value="value" required>
        <option value="">Choose</option></select></label>
      <output data-error-for="chosen"></output></li></ol>`;
    document.body.append(host);
    const root = host.querySelector("ol")!;
    const rows = createRows([
      { amount: 12345, name: "Ada", chosen: 1, choices: [{ label: "One", value: 1 }] },
      { amount: "bad", name: "Al", chosen: 9, choices: [{ label: "Two", value: 2 }] }
    ]);
    const badId = rows.entries()[1].id;
    const handle = bindList(root, { rows });
    const formatted = root.querySelector("li span")?.textContent;
    const issues = handle.validate().issues.map((issue: { rowId: number; field: string; rule: string }) =>
      ({ rowId: issue.rowId, field: issue.field, rule: issue.rule }));
    const second = root.querySelectorAll("li")[1];
    const name = second.querySelector<HTMLInputElement>("input")!;
    const region = second.querySelector<HTMLElement>('[data-error-for="name"]')!;
    const accessible = { invalid: name.getAttribute("aria-invalid"),
      linked: name.getAttribute("aria-describedby")?.split(/\s+/).includes(region.id),
      live: region.getAttribute("aria-live"),
      unique: (() => { const ids = [...root.querySelectorAll("[id]")].map(element => element.id);
        return new Set(ids).size === ids.length; })() };
    handle.setFilter(row => row.name === "Ada");
    const hidden = handle.validate(badId);
    const hiddenIssues = hidden.issues.map((issue: { field: string; element?: HTMLElement }) =>
      ({ field: issue.field, connected: !!issue.element }));
    rows.set(badId, "name", "Alice");
    handle.setFilter(null);
    const cleared = root.querySelectorAll("li")[1].querySelector('[data-error-for="name"]')?.textContent;
    const raw = rows.get(rows.entries()[0].id)!.value.amount;
    handle.dispose();
    rows.dispose();
    host.remove();
    return { formatted, issues, accessible, hiddenIssues, cleared, raw };
  }, modules);
  expect(result).toEqual({
    formatted: "12,345",
    issues: [
      { rowId: 2, field: "amount", rule: "integer" },
      { rowId: 2, field: "name", rule: "html" },
      { rowId: 2, field: "chosen", rule: "select-option" }
    ],
    accessible: { invalid: "true", linked: true, live: "polite", unique: true },
    hiddenIssues: [
      { field: "amount", connected: false }, { field: "name", connected: false },
      { field: "chosen", connected: false }
    ],
    cleared: "", raw: 12345
  });
});

test("List rejects duplicate template IDs before mutation", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ list, data }) => {
    const { bindList } = await import(list);
    const { createRows } = await import(data);
    const root = document.createElement("ul");
    root.innerHTML = '<li data-row-template id="repeated"><span data-field="name"></span></li>';
    document.body.append(root);
    const rows = createRows([{ name: "Ada" }]);
    let code = "";
    try { bindList(root, { rows }); } catch (cause) { code = (cause as { code: string }).code; }
    const untouched = root.querySelector("[data-row-template]")?.id;
    rows.dispose();
    root.remove();
    return { code, untouched };
  }, modules);
  expect(result).toEqual({ code: "DUPLICATE_ID", untouched: "repeated" });
});


test("List multiple Select validation requires a raw array", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ list, data }) => {
    const { bindList } = await import(list);
    const { createRows } = await import(data);
    const root = document.createElement("ul");
    root.innerHTML = `<li data-row-template><label>Tags
      <select multiple data-field="tags" data-options="choices"
        data-option-label="label" data-option-value="value"></select></label>
      <output data-error-for="tags"></output></li>`;
    document.body.append(root);
    const rows = createRows([{ tags: 1, choices: [{ label: "One", value: 1 }] }]);
    const id = rows.entries()[0].id;
    const handle = bindList(root, { rows });
    const invalid = handle.validate(id).issues.map((issue: { rule: string }) => issue.rule);
    rows.set(id, "tags", [1]);
    const valid = handle.validate(id).valid;
    handle.dispose();
    rows.dispose();
    root.remove();
    return { invalid, valid };
  }, modules);
  expect(result).toEqual({ invalid: ["select-option"], valid: true });
});
