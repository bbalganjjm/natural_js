// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows, RowsEvent } from "../../src/data/index.js";
import type { GridHandle, RuleContext, ValidationResult } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = {
  name: string;
  profile: { low: number; high: number; code: string };
  active: boolean;
  choice: string | number | boolean | null;
  options: { label: string; value: string | number | boolean | null }[];
  locked: string;
  blocked: string;
  summary: string;
  notes: string;
};
type Options = Parameters<typeof bindGrid<Item>>[1];

declare global {
  interface Window {
    pasteFixture: {
      grid: GridHandle<Item>;
      rows: Rows<Item>;
      table: HTMLTableElement;
      original: string;
      events: RowsEvent[];
      results: ValidationResult[];
      hooks: {
        beforeParse?: (field: string, context: RuleContext) => void;
        onPaste?: (result: ValidationResult) => void;
      };
      field: <E extends HTMLElement = HTMLElement>(index: number, field: string) => E;
      pasteEvent: (data: DataTransfer) => Event;
      rebind: (extra?: Partial<Options>) => void;
    };
  }
}

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts"),
  form: source("../../src/ui/form.ts"), list: source("../../src/ui/list.ts"), tree: source("../../src/ui/tree.ts") };
const markup = `<caption>Paste assignments</caption><thead><tr>
  <th scope="col" data-column="name">Name</th><th scope="col" data-column="range">Range</th>
  <th scope="col" data-column="active">Active</th><th scope="col" data-column="choice">Choice</th>
  <th scope="col" data-column="protected">Protected</th><th scope="col" data-column="notes">Notes</th>
  <th scope="col" data-column="actions">Actions</th></tr></thead><tbody><tr data-row-template>
  <th scope="row" data-column="name"><span data-field="name"></span></th>
  <td data-column="range"><label>Lower <input type="number" data-field="profile.low" min="0" required data-validate='[["range"]]'></label>
    <output data-error-for="profile.low"></output><label>Upper <input type="number" data-field="profile.high" min="0" required></label>
    <output data-error-for="profile.high"></output></td>
  <td data-column="active"><label>Active <input type="checkbox" data-field="active"></label></td>
  <td data-column="choice"><label>Choice <select data-field="choice" data-options="options" data-option-label="label" data-option-value="value">
    <option value="">None</option><option value="legacy" disabled>Unavailable</option>
    <optgroup label="Disabled group" disabled><option value="group">Grouped</option></optgroup></select></label>
    <output data-error-for="choice"></output></td>
  <td data-column="protected"><label>Read only <input data-field="locked" readonly></label>
    <label>Disabled <input data-field="blocked" disabled></label><span data-field="summary" aria-readonly="true"></span></td>
  <td data-column="notes"><label>Notes <textarea data-field="notes" maxlength="40"></textarea></label><output data-error-for="notes"></output></td>
  <td data-column="actions"><label>Check row <input type="checkbox" data-check-row></label>
    <button type="button" data-select-row>Select row</button></td></tr></tbody>`;

test.beforeEach(async ({ page }) => {
  // Source-import fixtures do not test Vite's dependency-discovery reloads.
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, markup }) => {
    const { bindGrid } = await import(modules.grid);
    const { createRows } = await import(modules.data);
    const table = document.createElement("table");
    table.dataset.pasteFixture = "";
    table.innerHTML = markup;
    document.body.append(table);
    const rows = createRows([
      { name: "Ada", profile: { low: 1, high: 10, code: "A" }, active: false, choice: 1,
        options: [{ label: "One", value: 1 }, { label: "Two", value: 2 }], locked: "fixed-a", blocked: "blocked-a", summary: "summary-a", notes: "First" },
      { name: "Grace", profile: { low: 2, high: 20, code: "G" }, active: false, choice: "2",
        options: [{ label: "Two", value: "2" }, { label: "Three", value: "3" }], locked: "fixed-g", blocked: "blocked-g", summary: "summary-g", notes: "Second" },
      { name: "Linus", profile: { low: 3, high: 30, code: "L" }, active: true, choice: false,
        options: [{ label: "Off", value: false }, { label: "On", value: true }], locked: "fixed-l", blocked: "blocked-l", summary: "summary-l", notes: "Third" }
    ]);
    const hooks: Window["pasteFixture"]["hooks"] = {};
    const events: RowsEvent[] = [];
    const results: ValidationResult[] = [];
    const numeric = (field: string) => (input: string, context: RuleContext) => {
      hooks.beforeParse?.(field, context);
      if (!input.trim() || !Number.isFinite(Number(input))) throw new Error("Use a finite number.");
      return Number(input);
    };
    const options: Options = {
      rows, paste: true, multiple: true,
      parse: { "profile.low": numeric("profile.low"), "profile.high": numeric("profile.high") },
      rules: { validate: { range: (_value, _args, context) => {
        const profile = context.values.profile as { low: number; high: number };
        return profile.low <= profile.high || "Lower must not exceed upper.";
      } } },
      onPaste: result => { results.push(result); hooks.onPaste?.(result); }
    };
    const fixture: Window["pasteFixture"] = {
      grid: null as unknown as GridHandle<Item>, rows, table, original: table.outerHTML, hooks, events, results,
      field<E extends HTMLElement = HTMLElement>(index: number, field: string): E {
        return table.tBodies[0].rows[index].querySelector<E>(`[data-field="${field}"]`)!;
      },
      pasteEvent(data: DataTransfer): Event {
        const event = new Event("paste", { bubbles: true, cancelable: true });
        // Firefox discards the DataTransfer passed to a synthetic ClipboardEvent constructor.
        Object.defineProperty(event, "clipboardData", { value: data });
        return event;
      },
      rebind(extra: Partial<Options> = {}) { fixture.grid.dispose(); fixture.grid = bindGrid(table, { ...options, ...extra }); }
    };
    window.pasteFixture = fixture;
    fixture.grid = bindGrid(table, options);
    rows.subscribe((event: RowsEvent) => events.push(event));
  }, { modules, markup });
});

test("a matrix preserves IDs and untouched snapshots and publishes one complete batch", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    const third = h.rows.get(3);
    h.grid.select(2); h.grid.setSelected([1, 3]); h.grid.setChecked([2]);
    const focused = h.field<HTMLInputElement>(0, "profile.low"); focused.focus();
    const result = h.grid.paste("5\t15\ttrue\t2\n6\t26\ttrue\t3", { id: 1, field: "profile.low" });
    return { valid: result.valid, issues: result.issues.length,
      values: h.rows.entries().map(row => [row.id, row.value.profile.low, row.value.profile.high, row.value.profile.code,
        row.value.active, row.value.choice, typeof row.value.choice, row.status]),
      events: h.events, unchanged: h.rows.get(3) === third, focus: document.activeElement === focused,
      active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(), reports: h.results.length };
  });
  expect(result).toEqual({ valid: true, issues: 0,
    values: [[1, 5, 15, "A", true, 2, "number", "update"], [2, 6, 26, "G", true, "3", "string", "update"],
      [3, 3, 30, "L", true, false, "boolean", "clean"]],
    events: [{ type: "setMany", ids: [1, 2], changed: true }], unchanged: true, focus: true,
    active: 2, selected: [1, 3], checked: [2], reports: 1 });
});

test("an invalid last cell rejects every write and preserves current input and draft state", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    const input = h.field<HTMLInputElement>(0, "profile.low");
    input.value = "4"; input.dispatchEvent(new Event("input", { bubbles: true })); input.focus();
    const entries = h.rows.entries();
    const result = h.grid.paste("7\t17\n8\tbad", { id: 1, field: "profile.low" });
    const rejected = { valid: result.valid, targets: result.issues.map(issue => [issue.rowId, issue.field, issue.rule]),
      same: h.rows.entries() === entries, events: h.events.length, draft: input.value, focus: document.activeElement === input,
      invalid: h.field(1, "profile.high").getAttribute("aria-invalid") };
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return { rejected, laterDraft: h.rows.get(1)!.value.profile.low };
  });
  expect(result).toEqual({ rejected: { valid: false, targets: [[2, "profile.low", "range"], [2, "profile.high", "parse"]],
    same: true, events: 0, draft: "4", focus: true, invalid: "true" }, laterDraft: 4 });
});

test("all parsers see entered values and all validators see the complete parsed candidate", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    const seen: unknown[] = [];
    h.hooks.beforeParse = (field, context) => {
      const profile = context.values.profile as { low: unknown; high: unknown };
      seen.push([field, profile.low, profile.high]);
    };
    const accepted = h.grid.paste("25\t40", { id: 1, field: "profile.low" });
    const entries = h.rows.entries();
    const rejected = h.grid.paste("50\t45", { id: 1, field: "profile.low" });
    return { accepted: accepted.valid, rejected: rejected.valid, fields: rejected.issues.map(issue => issue.field),
      seen, same: h.rows.entries() === entries, stored: h.rows.get(1)!.value.profile, events: h.events.length };
  });
  expect(result).toEqual({ accepted: true, rejected: false, fields: ["profile.low"],
    seen: [["profile.low", "25", "40"], ["profile.high", "25", "40"],
      ["profile.low", "50", "45"], ["profile.high", "50", "45"]],
    same: true, stored: { low: 25, high: 40, code: "A" }, events: 1 });
});

test("unrelated nested drafts participate in validation without being committed", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    const upper = h.field<HTMLInputElement>(0, "profile.high");
    upper.value = "50"; upper.dispatchEvent(new Event("input", { bubbles: true }));
    const result = h.grid.paste("20", { id: 1, field: "profile.low" });
    const after = { valid: result.valid, stored: h.rows.get(1)!.value.profile, draft: upper.value };
    upper.dispatchEvent(new Event("change", { bubbles: true }));
    return { after, committed: h.rows.get(1)!.value.profile };
  });
  expect(result).toEqual({ after: { valid: true, stored: { low: 20, high: 10, code: "A" }, draft: "50" },
    committed: { low: 20, high: 50, code: "A" } });
});

test("quoted TSV handles tabs, escaped quotes, multiline values, CRLF and one final terminator", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    h.grid.setColumns([{ key: "notes" }, { key: "name" }, ...h.grid.columns()
      .filter(column => !["notes", "name"].includes(column.key)).map(column => ({ ...column, hidden: true }))]);
    const result = h.grid.paste('"line one\nline two"\t"Quoted\t""Ada"""\r\nFinal\tGrace\r\n', { id: 1, field: "notes" });
    return { valid: result.valid, rows: h.rows.entries().map(row => [row.value.name, row.value.notes]),
      html: h.table.querySelectorAll("script,img").length, events: h.events.length };
  });
  expect(result).toEqual({ valid: true, rows: [['Quoted\t"Ada"', "line one\nline two"], ["Grace", "Final"], ["Linus", "Third"]],
    html: 0, events: 1 });
});

test("malformed, overflowing and HTML-invalid matrices never truncate or partially write", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    const entries = h.rows.entries();
    const attempts = ['"unfinished', '"closed"tail', "one\ntwo\nthree\nfour", "too\twide", "x".repeat(41)];
    const results = attempts.map(text => h.grid.paste(text, { id: 1, field: "notes" }));
    return { results: results.map(result => ({ valid: result.valid, rules: result.issues.map(issue => issue.rule) })),
      same: h.rows.entries() === entries, events: h.events.length, reports: h.results.length,
      input: h.field<HTMLTextAreaElement>(0, "notes").value };
  });
  expect(result).toEqual({ results: [{ valid: false, rules: ["paste"] }, { valid: false, rules: ["paste"] },
    { valid: false, rules: ["paste"] }, { valid: false, rules: ["paste"] }, { valid: false, rules: ["html"] }],
    same: true, events: 0, reports: 5, input: "First" });
});

test("current column order, hidden fields, filtered order and page bounds determine mapping", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    h.grid.setColumns([{ key: "notes" }, { key: "name" }, ...h.grid.columns()
      .filter(column => !["notes", "name"].includes(column.key)).map(column => ({ ...column, hidden: true }))]);
    h.grid.setSort((left, right) => right.name.localeCompare(left.name));
    h.grid.setFilter(row => row.name !== "Ada");
    h.grid.setPage({ page: 1, size: 2 });
    const accepted = h.grid.paste("N3\tThird renamed\nN2", { id: 3, field: "notes" });
    h.grid.setPage({ page: 2, size: 1 });
    const rejected = h.grid.paste("A\nB", { id: 2, field: "notes" });
    let hidden = "";
    try { h.grid.paste("4", { id: 2, field: "profile.low" }); }
    catch (cause) { hidden = (cause as { code: string }).code; }
    return { accepted: accepted.valid, rejected: rejected.valid, hidden,
      rows: h.rows.entries().map(row => [row.id, row.value.name, row.value.notes]), events: h.events.length };
  });
  expect(result).toEqual({ accepted: true, rejected: false, hidden: "GRID_PASTE_TARGET",
    rows: [[1, "Ada", "First"], [2, "Grace", "N2"], [3, "Third renamed", "N3"]], events: 1 });
});

test("protected positions consume clipboard cells while typed nested choices retain their raw type", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    const accepted = h.grid.paste("2\tignored\tignored\tignored\tChanged", { id: 1, field: "choice" });
    const bool = h.grid.paste("false\ttrue", { id: 3, field: "active" });
    const empty = h.grid.paste("", { id: 2, field: "choice" });
    h.field(0, "notes").setAttribute("inert", "");
    const inert = h.grid.paste("Ignored", { id: 1, field: "notes" });
    return { valid: [accepted.valid, bool.valid, empty.valid, inert.valid],
      first: h.rows.get(1)!.value, third: [h.rows.get(3)!.value.active, h.rows.get(3)!.value.choice],
      empty: h.rows.get(2)!.value.choice, events: h.events.length };
  });
  expect(result.valid).toEqual([true, true, true, true]);
  expect(result.first).toMatchObject({ choice: 2, locked: "fixed-a", blocked: "blocked-a", summary: "summary-a", notes: "Changed" });
  expect(result.third).toEqual([false, true]);
  expect(result.empty).toBeNull();
  expect(result.events).toBe(3);
});

test("unknown, disabled, ambiguous choices and non-boolean checkbox text fail without coercion", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    const textResults = ["Two", "legacy", "group", "missing"].map(text => h.grid.paste(text, { id: 1, field: "choice" }).valid);
    const checkbox = ["1", "TRUE", ""].map(text => h.grid.paste(text, { id: 1, field: "active" }).valid);
    h.rows.set(1, "options", [{ label: "Numeric", value: 1 }, { label: "String", value: "1" }]);
    h.events.length = 0;
    const entries = h.rows.entries();
    const ambiguous = h.grid.paste("1", { id: 1, field: "choice" });
    return { textResults, checkbox, ambiguous: ambiguous.valid, field: ambiguous.issues[0]?.field,
      same: h.rows.entries() === entries, events: h.events.length, stored: h.rows.get(1)!.value.choice };
  });
  expect(result).toEqual({ textResults: [false, false, false, false], checkbox: [false, false, false],
    ambiguous: false, field: "choice", same: true, events: 0, stored: 1 });
});

test("serialized negative zero preserves raw identity and rejects an ambiguous positive-zero choice", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    h.rows.set(1, "options", [{ label: "Negative zero", value: -0 }]);
    h.rows.set(1, "choice", -0);
    h.events.length = 0;
    const single = h.grid.paste("0", { id: 1, field: "choice" });
    const retained = Object.is(h.rows.get(1)!.value.choice, -0);
    const noOp = h.events.length === 0;
    h.rows.set(1, "options", [{ label: "Negative zero", value: -0 }, { label: "Positive zero", value: 0 }]);
    h.events.length = 0;
    const entries = h.rows.entries();
    const ambiguous = h.grid.paste("0", { id: 1, field: "choice" });
    return { single: single.valid, retained, noOp, ambiguous: ambiguous.valid,
      same: h.rows.entries() === entries, negative: Object.is(h.rows.get(1)!.value.choice, -0), events: h.events.length };
  });
  expect(result).toEqual({ single: true, retained: true, noOp: true, ambiguous: false, same: true, negative: true, events: 0 });
});

test("opt-in native paste replaces whole fields, reports results and honors earlier cancellation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    const input = h.field<HTMLTextAreaElement>(0, "notes");
    input.focus(); input.setSelectionRange(1, 2);
    function paste(text: string, target: HTMLElement = input) {
      const data = new DataTransfer(); data.setData("text/plain", text); data.setData("text/html", "<img src=x onerror=alert(1)>");
      const event = h.pasteEvent(data);
      target.dispatchEvent(event); return event.defaultPrevented;
    }
    const accepted = paste("Whole field");
    const before = h.rows.entries();
    h.table.addEventListener("paste", event => event.preventDefault(), { capture: true, once: true });
    const cancelled = paste("Cancelled");
    const preserved = before === h.rows.entries();
    const display = h.field(1, "name"); display.focus();
    const displayFocus = document.activeElement === display;
    const displayAccepted = paste("<b>Safe name</b>", display);
    return { accepted, cancelled, preserved, displayAccepted, displayFocus,
      stored: h.rows.get(1)!.value.notes, name: h.rows.get(2)!.value.name,
      injected: h.table.querySelectorAll("img,b").length, reports: h.results.length };
  });
  expect(result).toEqual({ accepted: true, cancelled: true, preserved: true, displayAccepted: true, displayFocus: true,
    stored: "Whole field", name: "<b>Safe name</b>", injected: 0, reports: 2 });
});

test("disabled native ownership stays untouched and disposal restores authored markup and listeners", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    h.rebind({ paste: false });
    const input = h.field<HTMLTextAreaElement>(0, "notes");
    const data = new DataTransfer(); data.setData("text/plain", "Ignored");
    const event = h.pasteEvent(data);
    input.dispatchEvent(event);
    const native = { prevented: event.defaultPrevented, events: h.events.length,
      displayFocusable: h.field(0, "name").hasAttribute("tabindex") };
    h.rebind(); h.grid.dispose(); h.grid.dispose();
    const restored = h.table.outerHTML === h.original;
    const originalInput = h.table.querySelector<HTMLElement>('[data-field="notes"]')!;
    const after = h.pasteEvent(data);
    originalInput.dispatchEvent(after);
    let code = "";
    try { h.grid.paste("Later", { id: 1, field: "name" }); } catch (cause) { code = (cause as { code: string }).code; }
    return { native, restored, after: after.defaultPrevented, reports: h.results.length, code };
  });
  expect(result).toEqual({ native: { prevented: false, events: 0, displayFocusable: false }, restored: true,
    after: false, reports: 0, code: "GRID_DISPOSED" });
});

test("parser side effects invalidate stale preparation and nested paste cannot interleave", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    const codes: string[] = [];
    const attempt = () => {
      try { h.grid.paste("4", { id: 1, field: "profile.low" }); }
      catch (cause) { return (cause as { code: string }).code; }
      return "accepted";
    };
    const actions = [
      () => h.rows.set(2, "notes", "Application change"),
      () => h.grid.setPage({ page: 1, size: 2 }),
      () => h.grid.setColumns([...h.grid.columns()].reverse()),
      () => { const input = h.field<HTMLInputElement>(0, "profile.high"); input.value = "50"; input.dispatchEvent(new Event("input", { bubbles: true })); }
    ];
    for (const action of actions) {
      h.hooks.beforeParse = () => { h.hooks.beforeParse = undefined; action(); };
      codes.push(attempt());
      h.rebind();
    }
    let nested = "";
    h.hooks.beforeParse = () => {
      try { h.grid.paste("Nested", { id: 1, field: "name" }); }
      catch (cause) { nested = (cause as { code: string }).code; }
    };
    const outer = attempt();
    h.hooks.beforeParse = () => { h.grid.dispose(); };
    const disposed = attempt();
    return { codes, nested, outer, disposed, value: h.rows.get(1)!.value.profile.low,
      name: h.rows.get(1)!.value.name, sideEffect: h.rows.get(2)!.value.notes };
  });
  expect(result.codes).toEqual(["GRID_PASTE_STALE", "GRID_PASTE_STALE", "GRID_PASTE_STALE", "GRID_PASTE_STALE"]);
  expect(result).toMatchObject({ nested: "GRID_PASTE_BUSY", outer: "accepted", value: 4, name: "Ada", sideEffect: "Application change" });
  expect(["GRID_DISPOSED", "GRID_PASTE_STALE"]).toContain(result.disposed);
});

test("observer errors are postcommit and do not resurrect successful pasted drafts", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    const input = h.field<HTMLInputElement>(0, "profile.low");
    input.value = "3"; input.dispatchEvent(new Event("input", { bubbles: true }));
    const unsubscribe = h.rows.subscribe(() => { throw new Error("Observer failed."); });
    let message = "";
    try { h.grid.paste("5\t15", { id: 1, field: "profile.low" }); } catch (cause) { message = (cause as Error).message; }
    unsubscribe();
    h.grid.setPage({ page: 1, size: 1 });
    const committed = { profile: h.rows.get(1)!.value.profile, input: h.field<HTMLInputElement>(0, "profile.low").value };
    h.hooks.onPaste = () => { throw new Error("Result observer failed."); };
    let resultError = "";
    try { h.grid.paste("6", { id: 1, field: "profile.low" }); } catch (cause) { resultError = (cause as Error).message; }
    return { message, committed, resultError, later: h.rows.get(1)!.value.profile.low, events: h.events.length };
  });
  expect(result).toEqual({ message: "Observer failed.", committed: { profile: { low: 5, high: 15, code: "A" }, input: "5" },
    resultError: "Result observer failed.", later: 6, events: 2 });
});

test("a postcommit subscriber's newer draft survives cleanup of the pasted draft", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    h.grid.dispose();
    h.table.querySelector('[data-field="name"]')!.outerHTML = '<input data-field="name" aria-label="Name">';
    h.rebind();
    const input = h.field<HTMLInputElement>(0, "name");
    const unsubscribe = h.rows.subscribe(event => {
      if (event.type !== "setMany") return;
      unsubscribe();
      input.value = "newer draft";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const pasted = h.grid.paste("pasted", { id: 1, field: "name" });
    const after = { valid: pasted.valid, stored: h.rows.get(1)!.value.name, input: input.value };
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return { after, committed: h.rows.get(1)!.value.name, events: h.events.length };
  });
  expect(result).toEqual({ after: { valid: true, stored: "pasted", input: "newer draft" },
    committed: "newer draft", events: 2 });
});

test("error recovery does not resurrect a row removed by the active-selection callback", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    h.rows.remove(3);
    h.rows.set(1, "active", true);
    let removed = false;
    h.rebind({ canSelect: row => row.value.active, onSelect: ({ id }) => {
      if (id !== null || removed) return;
      removed = true;
      h.rows.remove(2);
    } });
    h.grid.select(1);
    const unsubscribe = h.rows.subscribe(event => {
      if (event.type !== "setMany") return;
      unsubscribe();
      throw new Error("Observer failed.");
    });
    let message = "";
    try { h.grid.paste("false", { id: 1, field: "active" }); }
    catch (cause) { message = (cause as Error).message; }
    return { message, removed, active: h.grid.selected(), store: h.rows.entries().map(row => row.id),
      shown: [...h.table.querySelectorAll('tbody [data-field="name"]')].map(element => element.textContent),
      committed: h.rows.get(1)!.value.active };
  });
  expect(result).toEqual({ message: "Observer failed.", removed: true, active: null, store: [1], shown: ["Ada"], committed: false });
});

test("a parser returning a non-JSON value fails before changing the store or current draft", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    h.grid.dispose();
    h.table.querySelector('[data-field="name"]')!.outerHTML = '<input data-field="name" aria-label="Name">';
    h.rebind({ parse: { name: value => value === "not-json" ? new Date("2026-10-18T00:00:00Z") : value,
      "profile.low": Number, "profile.high": Number } });
    const input = h.field<HTMLInputElement>(0, "name");
    input.value = "Current draft";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const entries = h.rows.entries();
    let code = "";
    try { h.grid.paste("not-json", { id: 1, field: "name" }); }
    catch (cause) { code = (cause as { code: string }).code; }
    const after = { code, same: h.rows.entries() === entries, input: input.value, events: h.events.length };
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return { after, committed: h.rows.get(1)!.value.name };
  });
  expect(result).toEqual({ after: { code: "ROW_VALUE", same: true, input: "Current draft", events: 0 },
    committed: "Current draft" });
});

test("one batch updates shared Form, List and Tree while preserving unrelated drafts and keyed nodes", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindForm } = await import(modules.form);
    const { bindList } = await import(modules.list);
    const { bindTree } = await import(modules.tree);
    const h = window.pasteFixture;
    const formRoot = document.createElement("form");
    formRoot.innerHTML = '<label>Name <input data-field="name"></label><label>Notes <input data-field="notes" data-validate=\'[["short"]]\'></label>';
    const listRoot = document.createElement("ul"); listRoot.innerHTML = '<li data-row-template><span data-field="name"></span></li>';
    const treeRoot = document.createElement("ul"); treeRoot.setAttribute("aria-label", "Shared names");
    treeRoot.innerHTML = '<li data-row-template><span data-tree-label data-field="name"></span><ul data-tree-children></ul></li>';
    document.body.append(formRoot, listRoot, treeRoot);
    const form = bindForm(formRoot, { rows: h.rows, rules: {
      validate: { short: (value: string) => value.length <= 5 || "Use five characters or fewer." }
    } }); form.bind(1);
    const list = bindList(listRoot, { rows: h.rows });
    const tree = bindTree(treeRoot, { rows: h.rows, key: (row: Item) => row.profile.code, parent: () => null });
    const formDraft = formRoot.querySelector<HTMLInputElement>('[data-field="notes"]')!;
    formDraft.value = "Form draft"; formDraft.dispatchEvent(new Event("input", { bubbles: true }));
    const firstList = listRoot.querySelector("li"); const firstTree = treeRoot.querySelector("li");
    const pasted = h.grid.paste("New Ada\nNew Grace", { id: 1, field: "name" });
    const result = { valid: pasted.valid, name: formRoot.querySelector<HTMLInputElement>('[data-field="name"]')!.value,
      draft: formDraft.value, stored: h.rows.get(1)!.value.notes,
      list: [...listRoot.querySelectorAll('[data-field="name"]')].map(element => element.textContent),
      tree: [...treeRoot.querySelectorAll('[data-field="name"]')].map(element => element.textContent),
      reused: firstList === listRoot.querySelector("li") && firstTree === treeRoot.querySelector("li"), events: h.events.length };
    form.dispose(); list.dispose(); tree.dispose(); formRoot.remove(); listRoot.remove(); treeRoot.remove();
    return result;
  }, modules);
  expect(result).toEqual({ valid: true, name: "New Ada", draft: "Form draft", stored: "First",
    list: ["New Ada", "New Grace", "Linus"], tree: ["New Ada", "New Grace", "Linus"], reused: true, events: 1 });
});

test("a thousand-row paste is coherent, retains focus and generates document-unique error IDs", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.pasteFixture;
    const original = h.rows.get(1)!.value;
    h.rows.replace(Array.from({ length: 1000 }, (_, index) => ({ ...original, name: `Item ${index}`,
      profile: { ...original.profile, code: String(index) }, options: original.options.map(option => ({ ...option })) })));
    h.events.length = 0;
    const entries = h.rows.entries(); const ids = entries.map(row => row.id);
    const input = h.field<HTMLInputElement>(0, "profile.low"); input.focus();
    const started = performance.now();
    const result = h.grid.paste(Array.from({ length: 1000 }, (_, index) => `${index}\t${index + 1000}`).join("\n"),
      { id: ids[0], field: "profile.low" });
    const duration = performance.now() - started;
    const domIds = [...document.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
    const references = [...h.table.querySelectorAll<HTMLElement>("[aria-describedby]")]
      .flatMap(element => element.getAttribute("aria-describedby")!.split(/\s+/));
    return { valid: result.valid, count: h.rows.changes().length, events: h.events.length,
      ids: h.rows.entries().every((row, index) => row.id === ids[index]),
      last: h.rows.entries().at(-1)!.value.profile, focused: document.activeElement === input,
      unique: new Set(domIds).size === domIds.length, references: references.every(id => !!document.getElementById(id)), duration };
  });
  expect(result).toMatchObject({ valid: true, count: 1000, events: 1, ids: true,
    last: { low: 999, high: 1999, code: "999" }, focused: true, unique: true, references: true });
  expect(result.duration).toBeLessThan(15_000);
});
