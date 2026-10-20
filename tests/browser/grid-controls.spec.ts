// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Rows, RowsEvent } from "../../src/data/index.js";
import type { GridHandle, RuleContext, SelectValue, ValidationResult } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = {
  key: number; profile: { name: string; notes: string };
  assignment: { mode: string | null; tags: readonly string[]; selected: readonly SelectValue[];
    choices: readonly { label: string; code: SelectValue }[] };
  active: boolean; date: string; time: string; month: string; week: string; color: string;
  hidden: string; score: number; avatar: string | null; summary: string;
  protectedTags: readonly string[]; tail: string; locked: string;
};
type Options = Parameters<typeof bindGrid<Item>>[1];
declare global {
  interface Window {
    gridControls: {
      grid: GridHandle<Item>; rows: Rows<Item>; table: HTMLTableElement; root: HTMLElement; host: HTMLElement;
      original: string; layout: string; options: Options; events: RowsEvent[]; pastes: ValidationResult[];
      reset: (count?: number, extra?: Partial<Options>) => void;
      block: (id: number) => HTMLTableRowElement[];
      fields: <E extends HTMLElement = HTMLElement>(id: number, name: string) => E[];
      field: <E extends HTMLElement = HTMLElement>(id: number, name: string) => E | null;
      mounted: () => HTMLTableRowElement[]; settle: () => Promise<void>;
    };
  }
}
const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts"),
  form: source("../../src/ui/form.ts"), list: source("../../src/ui/list.ts"), select: source("../../src/ui/select.ts") };
const layout = `<caption>Native employee controls</caption>
  <thead><tr><th scope="col">Record</th><th scope="col">Assignment</th><th scope="col">Details</th></tr></thead>
  <tbody data-row-template><tr data-control-main>
    <th scope="row" rowspan="2"><button type="button" data-select-row>Open <span data-field="key"></span></button>
      <label>Check record <input type="checkbox" data-check-row></label></th>
    <td><fieldset><legend>Office mode</legend><label><input type="radio" name="authored-mode" data-field="assignment.mode" value="office" required>Office</label></fieldset>
      <label><input type="checkbox" data-field="assignment.tags" value="alpha">Alpha tag</label>
      <output data-error-for="assignment.mode"></output><output data-error-for="assignment.tags"></output></td>
    <td><label>Shifts <select multiple data-field="assignment.selected" data-options="assignment.choices"
      data-option-label="label" data-option-value="code"></select></label><output data-error-for="assignment.selected"></output>
      <label>Name <input data-field="profile.name" required minlength="3" maxlength="24"></label><output data-error-for="profile.name"></output>
      <img data-field="avatar" alt="Employee portrait"><span data-field="summary"></span></td></tr>
    <tr data-control-detail><td><fieldset><legend>Remote mode</legend><label><input type="radio" name="authored-mode" data-field="assignment.mode" value="remote" required>Remote</label></fieldset>
      <label><input type="checkbox" data-field="assignment.tags" value="beta">Beta tag</label>
      <label><input type="checkbox" data-field="active">Active employee</label>
      <label>Date <input type="date" data-field="date"></label><output data-error-for="date"></output>
      <label>Time <input type="time" data-field="time"></label><label>Month <input type="month" data-field="month"></label>
      <label>Week <input type="week" data-field="week"></label><label>Color <input type="color" data-field="color"></label>
      <input type="hidden" data-field="hidden"><label>Score <input type="range" data-field="score" min="0" max="10" step="1"></label></td>
    <td><label>Notes <textarea data-field="profile.notes" maxlength="40"></textarea></label><output data-error-for="profile.notes"></output>
      <label><input type="checkbox" data-field="protectedTags" value="left" disabled>Protected left</label>
      <label><input type="checkbox" data-field="protectedTags" value="right">Protected right</label>
      <label>Tail <input data-field="tail"></label><label>Disabled required value <input data-field="locked" required disabled></label></td></tr>
  </tbody>`;
const tsv = (values: readonly (readonly string[])[]) => values.map(row => row.map(value =>
  /[\t\r\n"]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value).join("\t")).join("\n");

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, layout }) => {
    const [{ bindGrid }, { createRows }] = await Promise.all([import(modules.grid), import(modules.data)]);
    const host = document.createElement("main");
    host.innerHTML = '<h1>Native controls contract</h1><div data-control-root role="region" aria-label="Employees" tabindex="0" style="height:400px;width:860px;overflow:auto"><table data-control-table></table></div>';
    const style = document.createElement("style");
    style.textContent = '[data-control-table]{width:840px;table-layout:fixed;border-collapse:collapse;font:14px/20px sans-serif}[data-control-table] th,[data-control-table] td{vertical-align:top;padding:3px}[data-control-table] label{display:block}[data-control-table] fieldset{margin:0;padding:2px}[data-control-table] output:empty{display:none}[data-control-table] input:not([type="checkbox"]):not([type="radio"]),[data-control-table] select,[data-control-table] textarea{max-width:180px}[data-control-table] img:not([src]){display:none}';
    host.append(style); document.body.append(host);
    const root = host.querySelector<HTMLElement>("[data-control-root]")!;
    const table = host.querySelector<HTMLTableElement>("table")!;
    const h: Window["gridControls"] = {
      grid: null as unknown as GridHandle<Item>, rows: null as unknown as Rows<Item>, table, root, host,
      original: "", layout, options: null as unknown as Options, events: [], pastes: [],
      mounted: () => [...table.tBodies[0].rows].filter(row => row.getAttribute("aria-hidden") !== "true"),
      block(id) {
        const first = [...table.querySelectorAll<HTMLTableRowElement>("[data-control-main]")]
          .find(row => row.querySelector('[data-field="key"]')?.textContent === String(id));
        return first ? [first, first.nextElementSibling as HTMLTableRowElement] : [];
      },
      fields<E extends HTMLElement = HTMLElement>(id: number, name: string): E[] {
        return h.block(id).flatMap(row => [...row.querySelectorAll<E>(`[data-field="${name}"]`)]);
      },
      field<E extends HTMLElement = HTMLElement>(id: number, name: string): E | null { return h.fields<E>(id, name)[0] ?? null; },
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))),
      reset(count = 4, extra: Partial<Options> = {}) {
        h.grid?.dispose(); h.rows?.dispose(); root.scrollTop = 0; table.innerHTML = layout; h.original = table.outerHTML;
        h.events = []; h.pastes = [];
        h.rows = createRows(Array.from({ length: count }, (_, index) => ({ key: index + 1,
          profile: { name: `Employee ${index + 1}`, notes: `Notes ${index + 1}` },
          assignment: { mode: "office", tags: ["alpha"], selected: [2],
            choices: [{ label: "Two", code: 2 }, { label: "False", code: false }, { label: "None", code: null }, { label: "Text two", code: "2" }] },
          active: true, date: "2026-10-20", time: "10:30", month: "2026-10", week: "2026-W43", color: "#123456",
          hidden: `hidden-${index + 1}`, score: 5, avatar: null, summary: `Summary ${index + 1}`,
          protectedTags: ["left"], tail: `Tail ${index + 1}`, locked: "" })));
        h.options = { rows: h.rows, paste: true, multiple: true, parse: { score: input => Number(input) },
          onPaste: result => h.pastes.push(result), ...extra };
        h.grid = bindGrid(table, h.options); h.rows.subscribe((event: RowsEvent) => h.events.push(event));
      }
    };
    window.gridControls = h; h.reset();
  }, { modules, layout });
});

test("radio groups with different native form owners fail before binding owns the authored table", async ({ page }) => {
  const result = await page.evaluate(async ({ grid: url }) => {
    const { bindGrid } = await import(url) as typeof import("../../src/ui/grid.js");
    const h = window.gridControls;
    h.grid.dispose();
    const forms = [document.createElement("form"), document.createElement("form")];
    forms[0].id = "controls-owner-one"; forms[1].id = "controls-owner-two";
    document.body.append(...forms);
    const radios = h.table.querySelectorAll<HTMLInputElement>('[data-field="assignment.mode"]');
    radios.forEach((radio, index) => radio.setAttribute("form", forms[index].id));
    const before = h.table.outerHTML;
    let code = "none";
    try { bindGrid(h.table, h.options); } catch (cause) { code = (cause as { code: string }).code; }
    const unchanged = h.table.outerHTML === before;
    radios.forEach(radio => radio.removeAttribute("form"));
    h.grid = bindGrid(h.table, h.options);
    h.fields<HTMLInputElement>(1, "assignment.mode")[1].click();
    return { code, unchanged, retry: h.rows.get(1)!.value.assignment.mode };
  }, modules);
  expect(result).toEqual({ code: "GRID_CONTROL", unchanged: true, retry: "remote" });
});

test("a partly hidden choice group consumes one protected paste position in mounted and offscreen rows", async ({ page }) => {
  const result = await page.evaluate(async ({ modules, text }) => {
    const [{ bindGrid }, { createRows }] = await Promise.all([import(modules.grid), import(modules.data)]);
    return [false, true].flatMap(viewport => [false, true].map(managed => {
      const root = document.createElement("div"); root.style.cssText = "height:100px;overflow:auto";
      root.innerHTML = `<table><thead><tr><th data-column="start">Start</th><th data-column="a">A</th><th data-column="b">B</th><th data-column="tail">Tail</th></tr></thead><tbody><tr data-row-template><td data-column="start"><input data-field="start"></td><td data-column="a"><input type="checkbox" data-field="flags" value="a" ${managed ? "" : "hidden"}></td><td data-column="b"><input type="checkbox" data-field="flags" value="b"></td><td data-column="tail"><input data-field="tail"></td></tr></tbody></table>`;
      document.body.append(root);
      const rows = createRows(Array.from({ length: 50 }, () => ({ start: "Before", flags: ["a"], tail: "After" })));
      const grid = bindGrid(root.querySelector("table")!, { rows, paste: true, ...(viewport ? { viewport: { root, estimate: 30, overscan: 1 } } : {}) });
      if (managed) grid.setColumns(grid.columns().map((column: import("../../src/ui/index.js").GridColumn) => ({ ...column, ...(column.key === "a" ? { hidden: true } : {}) })));
      const result = grid.paste(text, { id: viewport ? 50 : 1, field: "start" });
      const value = rows.get(viewport ? 50 : 1)!.value;
      grid.dispose(); rows.dispose(); root.remove();
      return { valid: result.valid, value };
    }));
  }, { modules, text: tsv([["Updated", JSON.stringify(["b"]), "Tail updated"]]) });
  expect(result).toEqual(Array.from({ length: 4 }, () => ({ valid: true, value: { start: "Updated", flags: ["a"], tail: "Tail updated" } })));
});

test("a hidden viewport or ancestor protects mounted and offscreen paste targets equally", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ bindGrid }, { createRows }] = await Promise.all([import(modules.grid), import(modules.data)]);
    return [false, true].flatMap(ancestor => {
      const host = document.createElement("div");
      host.innerHTML = '<div style="height:100px;overflow:auto"><table><tbody><tr data-row-template><td><input data-field="name"></td></tr></tbody></table></div>';
      document.body.append(host); const root = host.firstElementChild as HTMLElement;
      (ancestor ? host : root).hidden = true;
      const rows = createRows(Array.from({ length: 30 }, () => ({ name: "Original" })));
      const grid = bindGrid(root.querySelector("table")!, { rows, viewport: { root, estimate: 30, overscan: 1 } });
      const before = rows.entries();
      const outcomes = [1, 30].map(id => {
        let code = "none";
        try { grid.paste("Changed", { id, field: "name" }); } catch (cause) { code = (cause as { code: string }).code; }
        return { code, unchanged: rows.entries() === before, value: rows.get(id)!.value.name };
      });
      grid.dispose(); rows.dispose(); host.remove(); return outcomes;
    });
  }, modules);
  expect(result).toEqual(Array.from({ length: 4 }, () => ({ code: "GRID_PASTE_TARGET", unchanged: true, value: "Original" })));
});

test("required radio validation checks entered null before a parser can supply a raw default", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridControls;
    h.reset(4, { parse: { score: Number, "assignment.mode": input => input || "office" } });
    const before = h.rows.entries();
    const result = h.grid.paste("", { id: 1, field: "assignment.mode" });
    return { valid: result.valid, required: result.issues.some(issue => issue.field === "assignment.mode" && issue.rule === "html"),
      unchanged: h.rows.entries() === before, stored: h.rows.get(1)!.value.assignment.mode, events: h.events.length };
  });
  expect(result).toEqual({ valid: false, required: true, unchanged: true, stored: "office", events: 0 });
});

test("cross-tr native groups keep per-row values and stable identity without a native form", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridControls; const other = h.rows.get(2); const editor = h.field<HTMLInputElement>(1, "profile.name")!;
    editor.value = "Renamed employee"; editor.dispatchEvent(new Event("input", { bubbles: true }));
    const draftOnly = h.rows.get(1)!.value.profile.name === "Employee 1";
    editor.dispatchEvent(new Event("change", { bubbles: true }));
    h.fields<HTMLInputElement>(1, "assignment.mode")[1].click();
    h.fields<HTMLInputElement>(1, "assignment.tags")[1].click();
    h.field<HTMLInputElement>(1, "active")!.click();
    h.rows.move(1); h.grid.setSort((a, b) => b.key - a.key);
    return { draftOnly, row: h.rows.get(1)!.value, same: h.field(1, "profile.name") === editor,
      otherUnchanged: h.rows.get(2) === other, otherRadios: h.fields<HTMLInputElement>(2, "assignment.mode").map(input => input.checked),
      order: h.rows.entries().map(row => row.id) };
  });
  expect(result).toMatchObject({ draftOnly: true, same: true, otherUnchanged: true, otherRadios: [true, false], order: [2, 3, 4, 1],
    row: { profile: { name: "Renamed employee" }, assignment: { mode: "remote", tags: ["alpha", "beta"] }, active: false } });
});

test("multiple Select keeps empty and single arrays and distinguishes nested raw scalar types", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridControls; const select = h.field<HTMLSelectElement>(1, "assignment.selected")!;
    const choices = JSON.stringify(h.rows.get(1)!.value.assignment.choices);
    const states: unknown[] = [];
    for (const labels of [[], ["Two"], ["False", "None", "Text two"]]) {
      for (const option of select.options) option.selected = labels.includes(option.text);
      select.dispatchEvent(new Event("change", { bubbles: true })); states.push(h.rows.get(1)!.value.assignment.selected);
    }
    return { states, choicesUnchanged: JSON.stringify(h.rows.get(1)!.value.assignment.choices) === choices,
      other: h.rows.get(2)!.value.assignment.selected, valid: h.grid.validate(1).valid };
  });
  expect(result).toEqual({ states: [[], [2], [false, null, "2"]], choicesUnchanged: true, other: [2], valid: true });
});

test("radio names isolate two MDI Grids and every record inside one outer form", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.gridControls; h.grid.dispose();
    const form = document.createElement("form"); form.addEventListener("submit", event => event.preventDefault());
    h.host.append(form); form.append(h.root); h.reset(2);
    const second = document.createElement("table"); second.innerHTML = h.layout; form.append(second);
    const original = second.outerHTML; const other = bindGrid(second, { ...h.options });
    h.fields<HTMLInputElement>(1, "assignment.mode")[1].click();
    const otherRows = [...second.querySelectorAll<HTMLTableRowElement>("[data-control-main]")];
    (otherRows[1].nextElementSibling!.querySelector('input[type="radio"]') as HTMLInputElement).click();
    const groups = [...form.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    const names = groups.map(input => input.name);
    const values = h.rows.entries().map(row => row.value.assignment.mode);
    const checked = groups.filter(input => input.checked).length;
    const sameOwner = groups.every(input => input.form === form);
    other.dispose(); const secondRestored = second.outerHTML === original;
    h.grid.dispose(); return { values, checked, groupCount: new Set(names).size,
      namesNonempty: names.every(Boolean), sameOwner, secondRestored,
      firstRestored: h.table.outerHTML === h.original,
      sourceNames: [...h.table.querySelectorAll<HTMLInputElement>('input[type="radio"]')].map(input => input.name) };
  }, modules);
  expect(result).toEqual({ values: ["remote", "remote"], checked: 4, groupCount: 4, namesNonempty: true, sameOwner: true,
    secondRestored: true, firstRestored: true, sourceNames: ["authored-mode", "authored-mode"] });
});

test("date time month week color and hidden stay strings while range uses its parser", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridControls;
    const entered = { date: "2026-11-02", time: "08:45", month: "2026-11", week: "2026-W45", color: "#abcdef", hidden: "opaque", score: "7" };
    for (const [field, value] of Object.entries(entered)) {
      const control = h.field<HTMLInputElement>(1, field)!; control.value = value;
      control.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const row = h.rows.get(1)!.value;
    return { values: Object.fromEntries(Object.keys(entered).map(field => [field, row[field as keyof Item]])), valid: h.grid.validate(1).valid };
  });
  expect(result).toEqual({ values: { date: "2026-11-02", time: "08:45", month: "2026-11", week: "2026-W45", color: "#abcdef", hidden: "opaque", score: 7 }, valid: true });
});

test("native value sanitization reports stored invalid values without silently rewriting them", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridControls; h.reset(150, { viewport: { root: h.root, estimate: 400, overscan: 1 } }); await h.settle();
    for (const id of [1, 120]) { h.rows.set(id, "date", "not-a-date"); h.rows.set(id, "color", "not-a-color"); h.rows.set(id, "score", 99); }
    h.events.length = 0;
    // Windows WebKit uses text inputs for unsupported native date/color pickers.
    const nativeFields = ["date", "color", "score"].filter(field => {
      const probe = document.createElement("input"); const type = field === "score" ? "range" : field; probe.type = type;
      return probe.type === type;
    });
    return { nativeFields, rows: [1, 120].map(id => ({ id, issues: h.grid.validate(id).issues.map(issue => ({ field: issue.field, rule: issue.rule, element: !!issue.element })),
      value: { date: h.rows.get(id)!.value.date, color: h.rows.get(id)!.value.color, score: h.rows.get(id)!.value.score }, events: h.events.length })) };
  });
  expect(result.nativeFields).toContain("score");
  for (const row of result.rows) {
    expect(row.value).toEqual({ date: "not-a-date", color: "not-a-color", score: 99 }); expect(row.events).toBe(0);
    expect(row.issues.map(issue => issue.field).sort()).toEqual([...result.nativeFields].sort());
    for (const field of result.nativeFields) expect(row.issues).toContainEqual({ field, rule: "html", element: row.id === 1 });
  }
});

test("blur defers scalar commits and commits group and Select changes exactly once", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridControls; h.reset(2, { validateOn: "blur" });
    const input = h.field<HTMLInputElement>(1, "profile.name")!; input.focus(); input.value = "Deferred employee";
    input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true }));
    const beforeBlur = { name: h.rows.get(1)!.value.profile.name, count: h.events.length };
    h.field<HTMLInputElement>(1, "active")!.focus(); const afterBlur = { name: h.rows.get(1)!.value.profile.name, count: h.events.length };
    h.events.length = 0; const radio = h.fields<HTMLInputElement>(1, "assignment.mode")[1]; radio.focus(); radio.click();
    const select = h.field<HTMLSelectElement>(1, "assignment.selected")!; select.focus();
    for (const option of select.options) option.selected = option.text === "False";
    select.dispatchEvent(new Event("change", { bubbles: true })); h.root.focus();
    return { beforeBlur, afterBlur, mode: h.rows.get(1)!.value.assignment.mode,
      selected: h.rows.get(1)!.value.assignment.selected, changeEvents: h.events.map(event => event.type) };
  });
  expect(result).toEqual({ beforeBlur: { name: "Employee 1", count: 0 }, afterBlur: { name: "Deferred employee", count: 1 },
    mode: "remote", selected: [false], changeEvents: ["set", "set"] });
});

test("manual timing retains scalar radio checkbox and Select drafts until explicit validate", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridControls; h.reset(2, { validateOn: "manual" }); const before = h.rows.get(1);
    const name = h.field<HTMLInputElement>(1, "profile.name")!; name.value = "Manual employee";
    name.dispatchEvent(new Event("input", { bubbles: true })); name.dispatchEvent(new Event("change", { bubbles: true }));
    h.fields<HTMLInputElement>(1, "assignment.mode")[1].click(); h.fields<HTMLInputElement>(1, "assignment.tags")[1].click();
    const select = h.field<HTMLSelectElement>(1, "assignment.selected")!;
    for (const option of select.options) option.selected = option.text === "None";
    select.dispatchEvent(new Event("change", { bubbles: true })); h.root.focus();
    const draftOnly = h.rows.get(1) === before && h.events.length === 0;
    const valid = h.grid.validate(1).valid;
    return { draftOnly, valid, row: h.rows.get(1)!.value, draft: name.value };
  });
  expect(result).toMatchObject({ draftOnly: true, valid: true, draft: "Manual employee",
    row: { profile: { name: "Manual employee" }, assignment: { mode: "remote", tags: ["alpha", "beta"], selected: [null] } } });
});

test("Enter commits one scalar but composition modifiers and textarea Enter remain native", async ({ page }) => {
  await page.evaluate(() => {
    const h = window.gridControls; h.reset(2, { validateOn: "blur" }); const input = h.field<HTMLInputElement>(1, "profile.name")!;
    input.focus(); input.value = "Composed employee"; input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "ㄱ" }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, isComposing: true }));
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "ㄱ" }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, ctrlKey: true }));
  });
  expect(await page.evaluate(() => window.gridControls.events.length)).toBe(0);
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => ({ name: window.gridControls.rows.get(1)!.value.profile.name,
    count: window.gridControls.events.length }))).toEqual({ name: "Composed employee", count: 1 });
  const notes = page.locator('[data-control-main]').first().locator('xpath=following-sibling::tr[1]').locator('textarea');
  await notes.fill("Line one"); await notes.press("End"); await notes.press("Enter");
  expect(await notes.inputValue()).toBe("Line one\n");
  expect(await page.evaluate(() => ({ notes: window.gridControls.rows.get(1)!.value.profile.notes,
    count: window.gridControls.events.length }))).toEqual({ notes: "Notes 1", count: 1 });
});

test("quoted JSON array TSV applies two logical rows atomically and preserves unrelated drafts", async ({ page }) => {
  const text = tsv([["remote", JSON.stringify(["beta"]), JSON.stringify([2, false, null]), "Updated one"],
    ["office", JSON.stringify([]), JSON.stringify(["2"]), "Updated two"]]);
  const result = await page.evaluate(text => {
    const h = window.gridControls; const draft = h.field<HTMLInputElement>(3, "profile.name")!;
    draft.value = ""; draft.dispatchEvent(new Event("input", { bubbles: true })); h.events.length = 0;
    const result = h.grid.paste(text, { id: 1, field: "assignment.mode" });
    return { valid: result.valid, rows: h.rows.entries().slice(0, 2).map(row => ({ id: row.id, assignment: row.value.assignment, name: row.value.profile.name })),
      events: h.events, draft: draft.value, other: h.rows.get(3)!.value.profile.name, pastes: h.pastes.length };
  }, text);
  expect(result).toMatchObject({ valid: true, events: [{ type: "setMany", ids: [1, 2], changed: true }], draft: "", other: "Employee 3", pastes: 1,
    rows: [{ id: 1, assignment: { mode: "remote", tags: ["beta"], selected: [2, false, null] }, name: "Updated one" },
      { id: 2, assignment: { mode: "office", tags: [], selected: ["2"] }, name: "Updated two" }] });
});

test("typed array paste preserves Object.is identity for negative and positive zero", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridControls;
    h.rows.set(1, "assignment", { ...h.rows.get(1)!.value.assignment,
      selected: [], choices: [{ label: "Negative zero", code: -0 }, { label: "Positive zero", code: 0 }] });
    const accepted = h.grid.paste("[-0,0]", { id: 1, field: "assignment.selected" });
    const stored = h.rows.get(1)!.value.assignment.selected;
    const selected = h.field<HTMLSelectElement>(1, "assignment.selected")!.selectedOptions.length;
    const before = h.rows.entries(); h.events.length = 0;
    const rejected = h.grid.paste("[-0,-0]", { id: 1, field: "assignment.selected" });
    return { accepted: accepted.valid, negative: Object.is(stored[0], -0), positive: Object.is(stored[1], 0), selected,
      rejected: rejected.valid, unchanged: h.rows.entries() === before, events: h.events.length };
  });
  expect(result).toEqual({ accepted: true, negative: true, positive: true, selected: 2, rejected: false, unchanged: true, events: 0 });
});

test("invalid JSON arrays unavailable choices and radio values reject the entire paste", async ({ page }) => {
  const proposals = [tsv([["remote", JSON.stringify(["missing"]), JSON.stringify([2]), "Valid name"]]),
    tsv([["remote", JSON.stringify(["alpha"]), JSON.stringify([99]), "Valid name"]]),
    tsv([["remote", "[", JSON.stringify([2]), "Valid name"]]),
    tsv([["unknown", JSON.stringify(["alpha"]), JSON.stringify([2]), "Valid name"]]),
    tsv([["remote", JSON.stringify("alpha"), JSON.stringify([2]), "Valid name"]])];
  const result = await page.evaluate(proposals => {
    const h = window.gridControls; const before = h.rows.entries();
    return proposals.map(text => { const result = h.grid.paste(text, { id: 1, field: "assignment.mode" });
      return { valid: result.valid, issues: result.issues.map(issue => ({ id: issue.rowId, field: issue.field })),
        same: h.rows.entries() === before, events: h.events.length }; });
  }, proposals);
  for (const row of result) { expect(row.valid).toBe(false); expect(row.same).toBe(true); expect(row.events).toBe(0); expect(row.issues.length).toBeGreaterThan(0); }
  expect(result[0].issues).toContainEqual({ id: 1, field: "assignment.tags" });
  expect(result[1].issues).toContainEqual({ id: 1, field: "assignment.selected" });
  expect(result[3].issues).toContainEqual({ id: 1, field: "assignment.mode" });
});

test("offscreen array paste keeps the two-tr viewport bounded and a focused draft attached", async ({ page }) => {
  const text = tsv([["remote", JSON.stringify(["beta"]), JSON.stringify([false, null]), "Offscreen one"],
    ["office", JSON.stringify(["alpha", "beta"]), JSON.stringify([2]), "Offscreen two"]]);
  const result = await page.evaluate(async text => {
    const h = window.gridControls; h.reset(300, { viewport: { root: h.root, estimate: 400, overscan: 1 } }); await h.settle();
    const editor = h.field<HTMLInputElement>(1, "profile.name")!; editor.focus(); editor.value = "";
    editor.dispatchEvent(new Event("input", { bubbles: true })); editor.setSelectionRange(0, 0);
    const before = h.rows.get(1); const offscreen = h.block(250).length === 0;
    const result = h.grid.paste(text, { id: 250, field: "assignment.mode" }); await h.settle();
    return { offscreen, valid: result.valid, values: [250, 251].map(id => h.rows.get(id)!.value.assignment),
      events: h.events, same: h.rows.get(1) === before && h.field(1, "profile.name") === editor,
      focus: document.activeElement === editor, caret: [editor.selectionStart, editor.selectionEnd], draft: editor.value,
      stillOffscreen: h.block(250).length === 0, mounted: h.mounted().length, complete: h.mounted().length % 2 === 0 };
  }, text);
  expect(result).toMatchObject({ offscreen: true, valid: true, events: [{ type: "setMany", ids: [250, 251], changed: true }],
    same: true, focus: true, caret: [0, 0], draft: "", stillOffscreen: true, complete: true,
    values: [{ mode: "remote", tags: ["beta"], selected: [false, null] }, { mode: "office", tags: ["alpha", "beta"], selected: [2] }] });
  expect(result.mounted).toBeLessThan(80);
});

test("partially disabled readonly or inert groups consume one protected logical position", async ({ page }) => {
  const text = tsv([["remote", JSON.stringify(["beta"]), JSON.stringify([false]), "Writable name"]]);
  const tail = tsv([[JSON.stringify(["right"]), "Writable tail"]]);
  const result = await page.evaluate(({ text, tail }) => {
    const h = window.gridControls;
    h.fields(1, "assignment.mode")[0].parentElement!.setAttribute("inert", "");
    h.fields(1, "assignment.tags")[1].setAttribute("readonly", "");
    const first = h.grid.paste(text, { id: 1, field: "assignment.mode" });
    const second = h.grid.paste(tail, { id: 1, field: "protectedTags" });
    return { valid: [first.valid, second.valid], row: h.rows.get(1)!.value, events: h.events.map(event => event.type) };
  }, { text, tail });
  expect(result).toMatchObject({ valid: [true, true], events: ["setMany", "setMany"],
    row: { assignment: { mode: "office", tags: ["alpha"], selected: [false] }, profile: { name: "Writable name" }, protectedTags: ["left"], tail: "Writable tail" } });
});

test("Grid Form and List apply programmatic text lengths and authored disabled constraints consistently", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ bindForm }, { bindList }] = await Promise.all([import(modules.form), import(modules.list)]);
    const h = window.gridControls; h.reset(150, { viewport: { root: h.root, estimate: 400, overscan: 1 } }); await h.settle();
    for (const id of [1, 120]) h.rows.set(id, "profile", { name: "ab", notes: "x".repeat(41) });
    const root = document.createElement("section"); root.innerHTML = `<form><label>Name <input data-field="profile.name" minlength="3" maxlength="24"></label>
      <label>Notes <textarea data-field="profile.notes" maxlength="40"></textarea></label><label>Disabled <input data-field="locked" required disabled></label></form>
      <ol><li data-row-template><label>Name <input data-field="profile.name" minlength="3" maxlength="24"></label>
      <label>Notes <textarea data-field="profile.notes" maxlength="40"></textarea></label><label>Disabled <input data-field="locked" required disabled></label></li></ol>`;
    document.body.append(root); const form = bindForm(root.querySelector("form")!, { rows: h.rows }); form.bind(1);
    const list = bindList(root.querySelector("ol")!, { rows: h.rows }); list.setPage({ page: 1, size: 2 });
    const fields = (result: ValidationResult) => result.issues.filter(issue => issue.rule === "html").map(issue => issue.field).sort();
    const results = { visible: fields(h.grid.validate(1)), offscreen: fields(h.grid.validate(120)),
      form: fields(form.validate(1)), hiddenForm: fields(form.validate(120)), list: fields(list.validate(1)), hiddenList: fields(list.validate(120)) };
    form.dispose(); list.dispose(); root.remove(); return results;
  }, modules);
  for (const resultFields of Object.values(result)) expect(resultFields).toEqual(["profile.name", "profile.notes"]);
});

test("only own parser and renderer keys are invoked including a field named toString", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ bindGrid }, { bindForm }, { createRows }] = await Promise.all([import(modules.grid), import(modules.form), import(modules.data)]);
    const rows = createRows([{ toString: "Original", summary: "<em>Plain</em>" }]); let inheritedCalls = 0;
    const table = document.createElement("table"); table.innerHTML = '<tbody><tr data-row-template><td><label>Value <input data-field="toString"></label></td><td><span data-field="summary"></span></td></tr></tbody>';
    document.body.append(table);
    const inheritedParse = Object.create({ toString: () => { inheritedCalls++; return "Wrong"; } });
    const inheritedRender = Object.create({ summary: () => { inheritedCalls++; return "Wrong"; } });
    const grid = bindGrid(table, { rows, parse: inheritedParse, render: inheritedRender });
    const input = table.querySelector("input")!; input.value = "Literal"; input.dispatchEvent(new Event("change", { bubbles: true }));
    const plain = table.querySelector('[data-field="summary"]')!.textContent; grid.dispose();
    const own = bindGrid(table, { rows, parse: { toString: (value: string) => value.toUpperCase() } });
    table.querySelector("input")!.value = "owned"; table.querySelector("input")!.dispatchEvent(new Event("change", { bubbles: true }));
    const gridValue = rows.get(1)!.value.toString;
    const formRoot = document.createElement("form"); formRoot.innerHTML = '<label>Value <input data-field="toString"></label>';
    document.body.append(formRoot); const form = bindForm(formRoot, { rows, parse: { toString: (value: string) => value.toLowerCase() } }); form.bind(1);
    formRoot.querySelector("input")!.value = "FORM"; formRoot.querySelector("input")!.dispatchEvent(new Event("change", { bubbles: true }));
    const formValue = rows.get(1)!.value.toString; form.dispose(); own.dispose(); rows.dispose(); formRoot.remove(); table.remove();
    return { inheritedCalls, plain, gridValue, formValue };
  }, modules);
  expect(result).toEqual({ inheritedCalls: 0, plain: "<em>Plain</em>", gridValue: "OWNED", formValue: "form" });
});

test("images preserve alt and explicit Grid and Form renderers use fresh DOM or literal text", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindForm } = await import(modules.form); const h = window.gridControls; h.reset(2, { render: undefined });
    h.rows.set(1, "summary", '<img src="x" onerror="throw new Error(1)">'); h.rows.set(1, "avatar", "/portrait.png");
    const plain = h.field(1, "summary")!; const image = h.field<HTMLImageElement>(1, "avatar")!;
    const literal = plain.children.length === 0 && plain.textContent === h.rows.get(1)!.value.summary;
    const imageState = { src: image.getAttribute("src"), alt: image.alt };
    h.rows.set(1, "avatar", ""); const cleared = !image.hasAttribute("src");
    h.reset(2, { render: { summary(value, context) {
      const node = context.element!.ownerDocument.createElement("strong"); node.textContent = String(value ?? ""); return node;
    } } }); const firstNode = h.field(1, "summary")!.firstChild!;
    const formRoot = document.createElement("form"); formRoot.innerHTML = '<img data-field="avatar" alt="Detail portrait"><span data-field="summary"></span>';
    document.body.append(formRoot);
    const form = bindForm(formRoot, { rows: h.rows, render: { summary(value: unknown, context: RuleContext) {
      const node = context.element!.ownerDocument.createElement("em"); node.textContent = String(value ?? ""); return node;
    } } }); form.bind(1); h.rows.set(1, "summary", "Updated summary");
    const fresh = !firstNode.isConnected && h.field(1, "summary")!.firstChild !== firstNode;
    const rich = h.field(1, "summary")!.querySelector("strong")!.textContent;
    const formRich = formRoot.querySelector("em")!.textContent;
    form.dispose(); h.grid.dispose();
    const textGrid = (await import(modules.grid)).bindGrid(h.table, { ...h.options, render: { summary: () => "<b>Literal</b>" } });
    const stringIsText = h.table.querySelector('[data-field="summary"]')!.textContent === "<b>Literal</b>" && !h.table.querySelector("b");
    textGrid.dispose();
    const emptyGrid = (await import(modules.grid)).bindGrid(h.table, { ...h.options, render: { summary: () => null } });
    const nullClears = h.table.querySelector('[data-field="summary"]')!.childNodes.length === 0;
    emptyGrid.dispose(); formRoot.remove(); return { literal, imageState, cleared, fresh, rich, formRich, stringIsText, nullClears };
  }, modules);
  expect(result).toEqual({ literal: true, imageState: { src: "/portrait.png", alt: "Employee portrait" }, cleared: true,
    fresh: true, rich: "Updated summary", formRich: "Updated summary", stringIsText: true, nullClears: true });
});

test("merged render output stays display-only while ordinary display can render native interactive nodes", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ bindGrid }, { createRows }] = await Promise.all([import(modules.grid), import(modules.data)]);
    const rows = createRows([{ team: "Same" }, { team: "Same" }]);
    const attempts = ["button", "a", "iframe", "fragment"].map(tag => {
      const table = document.createElement("table");
      table.innerHTML = '<tbody><tr data-row-template><td data-merge="team"><span data-field="team">Original</span></td></tr></tbody>';
      document.body.append(table); const before = table.outerHTML;
      let code = "none";
      try { bindGrid(table, { rows, render: { team: () => {
        const control = document.createElement(tag === "fragment" ? "button" : tag);
        if (tag === "a") control.setAttribute("href", "#target");
        if (tag !== "fragment") return control;
        const fragment = document.createDocumentFragment(); fragment.append(control); return fragment;
      } } }); } catch (cause) { code = (cause as { code: string }).code; }
      const unchanged = table.outerHTML === before;
      const grid = bindGrid(table, { rows, render: { team: value => {
        const strong = document.createElement("strong"); strong.textContent = String(value); return strong;
      } } });
      const cells = [...table.querySelectorAll<HTMLTableCellElement>("td")];
      const merged = cells[0].rowSpan === 2 && cells[1].style.display === "none" && table.querySelectorAll("strong").length === 2;
      grid.dispose(); table.remove(); return { code, unchanged, merged };
    });
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td><span data-field="team"></span></td></tr></tbody>';
    document.body.append(table);
    const grid = bindGrid(table, { rows, render: { team: () => document.createElement("button") } });
    const interactive = table.querySelectorAll("button").length === 2;
    grid.dispose(); rows.dispose(); table.remove(); return { attempts, interactive };
  }, modules);
  expect(result).toEqual({ attempts: Array.from({ length: 4 }, () => ({ code: "UI_RENDER", unchanged: true, merged: true })), interactive: true });
});

test("invalid render targets fail before taking Grid Form or nested Select ownership", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ bindGrid }, { bindForm }, { bindSelect }, { createRows }] = await Promise.all([import(modules.grid), import(modules.form), import(modules.select), import(modules.data)]);
    const rows = createRows([{ summary: "Summary", choice: 1, choices: [{ label: "One", code: 1 }] }]);
    const nested = '<div data-field="summary"><label>Choice <select data-field="choice" data-options="choices" data-option-label="label" data-option-value="code"></select></label></div>';
    const results = ["grid", "form"].map(kind => {
      const root = document.createElement(kind === "grid" ? "table" : "form");
      root.innerHTML = kind === "grid" ? `<tbody><tr data-row-template><td>${nested}</td></tr></tbody>` : nested;
      document.body.append(root); const before = root.outerHTML; let code = "none"; let api = ""; let field = "";
      try {
        if (kind === "grid") bindGrid(root as HTMLTableElement, { rows, render: { summary: () => "Invalid replacement" } }).dispose();
        else bindForm(root, { rows, render: { summary: () => "Invalid replacement" } }).dispose();
      } catch (cause) { const error = cause as { code: string; api: string; detail?: { field?: string } }; code = error.code; api = error.api; field = error.detail?.field ?? ""; }
      const unchanged = root.outerHTML === before;
      const select = root.querySelector("select")!; let released = true;
      try { bindSelect(select, { choices: [{ label: "One", value: 1 }] }).dispose(); } catch { released = false; }
      root.remove(); return { kind, code, api, field, unchanged, released };
    }); rows.dispose(); return results;
  }, modules);
  for (const resultRow of result) expect(resultRow).toMatchObject({ code: "UI_RENDER", api: resultRow.kind === "grid" ? "bindGrid" : "bindForm", field: "summary", unchanged: true, released: true });
});

test("connected foreign reused and asynchronous render nodes reject with exact binding recovery", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ bindGrid }, { bindForm }, { createRows }] = await Promise.all([import(modules.grid), import(modules.form), import(modules.data)]);
    const rows = createRows([{ summary: "One" }, { summary: "Two" }]);
    const foreign = document.implementation.createHTMLDocument("Foreign").createElement("span");
    const results: { kind: string; mode: string; code: string; api: string; field: string; unchanged: boolean; reusable: boolean }[] = [];
    for (const kind of ["grid", "form"]) for (const mode of ["connected", "foreign", "reused", "async"]) {
      const root = document.createElement(kind === "grid" ? "table" : "form");
      root.innerHTML = kind === "grid" ? '<tbody><tr data-row-template><td><span data-field="summary"></span></td></tr></tbody>' : '<span data-field="summary"></span>';
      document.body.append(root); const before = root.outerHTML; const shared = document.createElement("span");
      const render = { summary: () => mode === "connected" ? document.body : mode === "foreign" ? foreign : mode === "async" ? Promise.resolve("Later") : shared };
      let code = "none"; let api = ""; let field = "";
      try {
        if (kind === "grid") bindGrid(root as HTMLTableElement, { rows, render: render as unknown as Options["render"] }).dispose();
        else {
          const form = bindForm(root, { rows, render: render as unknown as Options["render"] });
          try {
            if (mode === "reused") { form.bind(1); form.bind(2); }
            else form.bind(1);
          } finally { form.dispose(); }
        }
      } catch (cause) { const error = cause as { code: string; api: string; detail?: { field?: string } }; code = error.code; api = error.api; field = error.detail?.field ?? ""; }
      const unchanged = root.outerHTML === before; let reusable = true;
      try {
        if (kind === "grid") bindGrid(root as HTMLTableElement, { rows }).dispose(); else bindForm(root, { rows }).dispose();
      } catch { reusable = false; }
      root.remove(); results.push({ kind, mode, code, api, field, unchanged, reusable });
    }
    rows.dispose(); return results;
  }, modules);
  for (const resultRow of result) expect(resultRow, `${resultRow.kind}/${resultRow.mode}`).toMatchObject({ code: "UI_RENDER", api: resultRow.kind === "grid" ? "bindGrid" : "bindForm", field: "summary", unchanged: true, reusable: true });
});

test("revealing the first error removes stale element references from other released invalid rows", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridControls;
    h.reset(100, { viewport: { root: h.root, estimate: 400, overscan: 1 }, revealInvalid: true });
    h.rows.set(1, "profile", { name: "", notes: "First" });
    h.rows.set(100, "profile", { name: "", notes: "Last" });
    h.grid.reveal(100); await h.settle();
    const last = h.field(100, "profile.name")!;
    const result = h.grid.validate();
    return { ids: result.issues.map(issue => issue.rowId), fields: result.issues.map(issue => issue.field),
      connected: result.issues.map(issue => issue.element?.isConnected ?? false),
      lastReleased: !last.isConnected, lastReference: result.issues[1].element === undefined,
      focused: document.activeElement === result.issues[0].element };
  });
  expect(result).toEqual({ ids: [1, 100], fields: ["profile.name", "profile.name"], connected: [true, false],
    lastReleased: true, lastReference: true, focused: true });
});

test("validation and rejected paste reveal the current-page invalid row and return connected focused fields", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridControls; h.reset(200, { viewport: { root: h.root, estimate: 400, overscan: 1 }, revealInvalid: true }); await h.settle();
    h.grid.select(1); h.grid.setSelected([1, 2]); h.rows.set(120, "profile", { name: "", notes: "Notes" });
    const offscreen = h.block(120).length === 0; const validated = h.grid.validate(120); await h.settle();
    const first = validated.issues.find(issue => issue.field === "profile.name")!;
    const validation = { valid: validated.valid, connected: !!first.element?.isConnected,
      same: first.element === h.field(120, "profile.name"), focused: document.activeElement === first.element,
      described: !!first.element?.getAttribute("aria-describedby"), invalid: first.element?.getAttribute("aria-invalid") };
    const rejected = h.grid.paste("[99]", { id: 180, field: "assignment.selected" }); await h.settle();
    const issue = rejected.issues.find(item => item.field === "assignment.selected")!;
    return { offscreen, validation, paste: { valid: rejected.valid, connected: !!issue.element?.isConnected,
      same: issue.element === h.field(180, "assignment.selected"), focused: document.activeElement === issue.element },
      active: h.grid.selected(), selected: h.grid.selectedIds(), page: h.grid.page(), mounted: h.mounted().length };
  });
  expect(result).toMatchObject({ offscreen: true,
    validation: { valid: false, connected: true, same: true, focused: true, described: true, invalid: "true" },
    paste: { valid: false, connected: true, same: true, focused: true }, active: 1, selected: [1, 2], page: null });
  expect(result.mounted).toBeLessThan(80);
});

test("off-page and filtered validation keeps the application page filter and focus unchanged", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridControls; h.reset(100, { viewport: { root: h.root, estimate: 400, overscan: 1 }, revealInvalid: true });
    h.grid.setFilter(row => row.key % 2 === 0); h.grid.setPage({ page: 2, size: 10 }); await h.settle();
    for (const id of [1, 2]) h.rows.set(id, "profile", { name: "", notes: "Notes" });
    h.root.focus(); const before = JSON.stringify(h.grid.page()); const top = h.root.scrollTop;
    const shown = h.mounted().map(row => row.textContent);
    const results = [1, 2].map(id => h.grid.validate(id)); await h.settle();
    return { results: results.map(result => ({ valid: result.valid, connected: result.issues.some(issue => !!issue.element) })),
      samePage: JSON.stringify(h.grid.page()) === before, sameRows: JSON.stringify(h.mounted().map(row => row.textContent)) === JSON.stringify(shown),
      sameScroll: h.root.scrollTop === top, focus: document.activeElement === h.root };
  });
  expect(result).toEqual({ results: [{ valid: false, connected: false }, { valid: false, connected: false }], samePage: true, sameRows: true, sameScroll: true, focus: true });
});

test("single checks remain independent in two accessible MDI Grids and disposal restores authored DOM", async ({ page }) => {
  const state = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.gridControls; h.reset(2, { checkMode: "single" });
    h.grid.select(1); h.grid.setSelected([1, 2]); h.grid.setChecked([1]);
    h.block(2)[0].querySelector<HTMLInputElement>("[data-check-row]")!.click();
    const second = document.createElement("table"); second.dataset.secondControls = ""; second.innerHTML = h.layout; h.host.append(second);
    const original = second.outerHTML; const other = bindGrid(second, { ...h.options });
    h.rows.set(1, "profile", { name: "", notes: "Notes" }); h.grid.validate(1); other.validate(1);
    const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(node => node.id);
    const state = { checked: h.grid.checkedIds(), selected: h.grid.selectedIds(), active: h.grid.selected(),
      data: h.rows.entries().map(row => row.value.active), unique: new Set(ids).size === ids.length,
      native: !h.table.hasAttribute("role") && !second.hasAttribute("role") };
    (window as unknown as { releaseOtherControls: () => boolean }).releaseOtherControls = () => {
      other.dispose(); const restored = second.outerHTML === original; second.remove(); return restored;
    };
    return state;
  }, modules);
  expect(state).toEqual({ checked: [2], selected: [1, 2], active: 1, data: [true, true], unique: true, native: true });
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]).analyze();
  expect(axe.violations).toEqual([]);
  const teardown = await page.evaluate(() => {
    const h = window.gridControls;
    const otherRestored = (window as unknown as { releaseOtherControls: () => boolean }).releaseOtherControls();
    h.grid.dispose(); const restored = h.table.outerHTML === h.original;
    const before = h.rows.entries(); const input = h.table.querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
    input.value = "Ignored after disposal"; input.dispatchEvent(new Event("change", { bubbles: true }));
    return { otherRestored, restored, noWrite: h.rows.entries() === before,
      names: [...h.table.querySelectorAll<HTMLInputElement>('input[type="radio"]')].map(input => input.name) };
  });
  expect(teardown).toEqual({ otherRestored: true, restored: true, noWrite: true, names: ["authored-mode", "authored-mode"] });
});
