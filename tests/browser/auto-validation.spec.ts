// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows } from "../../src/data/index.js";
import type { FormHandle, GridHandle, RuleSet } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = { name: string; count: number; note: string; choice: string | null; enabled: boolean };
type FormOptions = NonNullable<Parameters<typeof bindForm<Item>>[1]>;
type GridOptions = Parameters<typeof bindGrid<Item>>[1];
type Owner<H> = { root: HTMLElement; handle: H; field<E extends HTMLElement = HTMLInputElement>(name: string): E };
declare global {
  interface Window {
    autoValidation: {
      api: { bindForm: typeof bindForm; bindGrid: typeof bindGrid }; rows: Rows<Item>; ids: readonly number[];
      rules: RuleSet; markup: string; handles: { dispose(): void }[];
      form(extra?: Partial<FormOptions>, html?: string): Owner<FormHandle<Item>>;
      grid(extra?: Partial<GridOptions>, html?: string): Owner<GridHandle<Item>>;
      edit(input: HTMLInputElement | HTMLTextAreaElement, value: string): void;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { form: source("../../src/ui/form.ts"), grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm }, { bindGrid }, { createRows }] = await Promise.all([import(modules.form), import(modules.grid), import(modules.data)]);
    const rows: Rows<Item> = createRows([
      { name: "Ada", count: 10, note: "One", choice: "a", enabled: true },
      { name: "Bea", count: 20, note: "Two", choice: "b", enabled: false }
    ]);
    const markup = '<label>Name <input data-field="name" required minlength="3"></label><output data-error-for="name"></output>' +
      '<label>Count <input data-field="count" required pattern="[0-9]+"></label><output data-error-for="count"></output>' +
      '<label>Note <input data-field="note"></label><output data-error-for="note"></output>' +
      '<label>Choice <select data-field="choice" required><option value="">Choose</option><option value="a">A</option><option value="b">B</option></select></label><output data-error-for="choice"></output>' +
      '<label>Enabled <input type="checkbox" data-field="enabled"></label>';
    const parse = { count(value: string) {
      const number = Number(value); if (!Number.isFinite(number)) throw new Error("Enter a finite count."); return number;
    } };
    const h: Window["autoValidation"] = {
      api: { bindForm, bindGrid }, rows, ids: rows.entries().map(row => row.id), markup, handles: [],
      rules: { fields: { name: { validate: [["required"]] }, count: { validate: [["countLimit"]] } },
        validate: { countLimit: value => Number(value) >= 0 && Number(value) <= 100 || "Use a count from 0 to 100." } },
      form(extra = {}, html = markup) {
        const root = document.createElement("form"); root.innerHTML = html; document.body.append(root);
        const handle = h.api.bindForm(root, { rows, rules: h.rules, parse, ...extra });
        h.handles.push(handle); handle.bind(h.ids[0]);
        return { root, handle, field: name => root.querySelector(`[data-field="${name}"]`)! as never };
      },
      grid(extra = {}, html = markup) {
        const root = document.createElement("table");
        root.innerHTML = `<caption>Automatic validation</caption><thead><tr><th scope="col">Record</th></tr></thead><tbody><tr data-row-template><td>${html}</td></tr></tbody>`;
        document.body.append(root);
        const handle = h.api.bindGrid(root, { rows, rules: h.rules, parse, ...extra }); h.handles.push(handle);
        return { root, handle, field: name => root.querySelector(`[data-field="${name}"]`)! as never };
      },
      edit(input, value) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); }
    };
    window.autoValidation = h;
  }, modules);
});

test("automatic validation remains enabled by default for native and declared constraints in Form and Grid", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, owners = [h.form(), h.grid()];
    return owners.map(owner => {
      h.edit(owner.field("name"), ""); h.edit(owner.field("count"), "200");
      return { raw: h.rows.get(h.ids[0])!.value, invalid: ["name", "count"].map(name => owner.field(name).getAttribute("aria-invalid")),
        rules: [...new Set(owner.handle.validate(h.ids[0]).issues.map(issue => issue.rule))].sort() };
    });
  });
  expect(result).toEqual(Array.from({ length: 2 }, () => ({
    raw: { name: "Ada", count: 10, note: "One", choice: "a", enabled: true },
    invalid: ["true", "true"], rules: ["countLimit", "html", "required"]
  })));
});

test("disabling automatic validation commits typed native and business failures while explicit validation still reports them", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, owners = [h.form({ autoValidate: false }), h.grid({ autoValidate: false })];
    return owners.map(owner => {
      h.edit(owner.field("name"), "x"); h.edit(owner.field("count"), "-5");
      const automatic = ["name", "count"].every(name => owner.field(name).getAttribute("aria-invalid") !== "true");
      const checked = owner.handle.validate(h.ids[0]);
      return { automatic, raw: h.rows.get(h.ids[0])!.value.count, type: typeof h.rows.get(h.ids[0])!.value.count,
        rules: [...new Set(checked.issues.map(issue => issue.rule))].sort(),
        accessible: checked.issues.every(issue => issue.element?.isConnected && issue.element.getAttribute("aria-invalid") === "true") };
    });
  });
  expect(result).toEqual(Array.from({ length: 2 }, () => ({ automatic: true, raw: -5, type: "number",
    rules: ["countLimit", "html"], accessible: true })));
});

test("local Form skips automatic callbacks but retains native errors and custom rules at explicit validation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, root = document.createElement("form");
    root.innerHTML = '<label>Name <input data-field="name" required></label><output data-error-for="name"></output>';
    document.body.append(root); let calls = 0;
    const handle = h.api.bindForm(root, { autoValidate: false, rules: { fields: { name: { validate: [["check"]] } },
      validate: { check: () => { calls++; return "Application check"; } } } });
    const input = root.querySelector("input")!; h.edit(input, "x");
    const automatic = { calls, invalid: input.hasAttribute("aria-invalid"), read: handle.read() };
    input.value = "";
    const native = handle.validate();
    input.value = "x"; const business = handle.validate();
    handle.dispose();
    return { automatic, native: native.issues.map(issue => issue.rule), business: business.issues.map(issue => issue.message), calls };
  });
  expect(result).toEqual({ automatic: { calls: 0, invalid: false, read: { name: "x" } }, native: ["html"],
    business: ["Application check"], calls: 1 });
});

test("automatic bypass still rejects parser failures and non-JSON values without committing either draft", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, results: { parse: boolean; raw: string; count: number; codes: string[] }[] = [];
    for (const kind of ["form", "grid"] as const) {
      const codes: string[] = [], listener = (event: ErrorEvent) => { codes.push(event.error?.code ?? "unknown"); event.preventDefault(); };
      window.addEventListener("error", listener);
      const owner = h[kind]({ autoValidate: false, parse: { count(value: string) {
        const number = Number(value); if (!Number.isFinite(number)) throw new Error("Invalid count"); return number;
      }, name: value => value === "not-json" ? new Date("2026-10-31T00:00:00Z") : value } });
      h.edit(owner.field("count"), "bad");
      const parse = owner.field("count").getAttribute("aria-invalid") === "true" &&
        owner.root.querySelector('[data-error-for="count"]')!.textContent === "Invalid count";
      h.edit(owner.field("name"), "not-json");
      results.push({ parse, raw: h.rows.get(h.ids[0])!.value.name, count: h.rows.get(h.ids[0])!.value.count, codes });
      owner.handle.dispose(); window.removeEventListener("error", listener);
    }
    return results;
  });
  expect(result.every(item => item.parse && item.raw === "Ada" && item.count === 10 && item.codes.includes("ROW_VALUE"))).toBe(true);
});

test("automatic bypass permits an available empty choice but rejects injected unknown Grid choices", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, owner = h.grid({ autoValidate: false }), select = owner.field<HTMLSelectElement>("choice");
    select.add(new Option("Unknown", "unknown")); select.value = "unknown";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    const rejected = h.rows.get(h.ids[0])!.value.choice === "a" && select.getAttribute("aria-invalid") === "true" &&
      owner.root.querySelector('[data-error-for="choice"]')!.textContent?.includes("available option");
    select.value = ""; select.dispatchEvent(new Event("change", { bubbles: true }));
    const automatic = { raw: h.rows.get(h.ids[0])!.value.choice, invalid: select.getAttribute("aria-invalid") === "true" };
    const checked = owner.handle.validate(h.ids[0]);
    return { rejected: Boolean(rejected), automatic, rules: checked.issues.map(issue => issue.rule) };
  });
  expect(result).toEqual({ rejected: true, automatic: { raw: null, invalid: false }, rules: ["html"] });
});

test("automatic bypass respects readonly disabled controls and native first-legend exceptions", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, results: boolean[] = [];
    for (const kind of ["form", "grid"] as const) {
      const owner = h[kind]({ autoValidate: false });
      const name = owner.field("name"), count = owner.field("count"), choice = owner.field<HTMLSelectElement>("choice");
      name.disabled = true; count.readOnly = true; choice.disabled = true;
      h.edit(name, "Blocked"); h.edit(count, "60"); choice.value = "b"; choice.dispatchEvent(new Event("change", { bubbles: true }));
      const raw = h.rows.get(h.ids[0])!.value;
      const blocked = raw.name === "Ada" && raw.count === 10 && raw.choice === "a";
      owner.handle.dispose();
      const html = '<fieldset disabled><legend><label>Name <input data-field="name"></label></legend><label>Count <input data-field="count"></label></fieldset>';
      const legend = h[kind]({ autoValidate: false }, html);
      h.edit(legend.field("name"), "Legend"); h.edit(legend.field("count"), "70");
      results.push(blocked && h.rows.get(h.ids[0])!.value.name === "Legend" && h.rows.get(h.ids[0])!.value.count === 10);
      legend.handle.dispose(); h.rows.set(h.ids[0], "name", "Ada");
    }
    return results;
  });
  expect(result).toEqual([true, true]);
});

test("automatic bypass still reports native value sanitization in an unrelated edited row", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, results: {
      dateType: string; dateInvalid: boolean; rangeInvalid: boolean; rawPreserved: boolean; noteCommitted: boolean
    }[] = [];
    for (const kind of ["form", "grid"] as const) {
      const owner = h[kind]({ autoValidate: false }, '<label>Name <input data-field="name" type="date"></label><output data-error-for="name"></output>' +
        '<label>Count <input data-field="count" type="range" min="0" max="100"></label><output data-error-for="count"></output><label>Note <input data-field="note"></label>');
      h.rows.set(h.ids[0], "name", "not-a-date"); h.rows.set(h.ids[0], "count", 200);
      h.edit(owner.field("note"), "Another note");
      results.push({ dateType: owner.field("name").type,
        dateInvalid: owner.field("name").getAttribute("aria-invalid") === "true",
        rangeInvalid: owner.field("count").getAttribute("aria-invalid") === "true",
        rawPreserved: h.rows.get(h.ids[0])!.value.name === "not-a-date" && h.rows.get(h.ids[0])!.value.count === 200,
        noteCommitted: h.rows.get(h.ids[0])!.value.note === "Another note" });
      owner.handle.dispose(); h.rows.set(h.ids[0], "name", "Ada"); h.rows.set(h.ids[0], "count", 10);
    }
    return results;
  });
  expect(result).toHaveLength(2);
  for (const item of result) {
    expect(["date", "text"]).toContain(item.dateType);
    expect(item.dateInvalid).toBe(item.dateType === "date");
    expect(item).toMatchObject({ rangeInvalid: true, rawPreserved: true, noteCommitted: true });
  }
});

test("manual Grid timing keeps bypassed drafts deferred and explicit validation commits only valid candidates", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, owner = h.grid({ autoValidate: false, validateOn: "manual" }), original = h.rows.get(h.ids[0]);
    h.edit(owner.field("name"), "x"); h.edit(owner.field("count"), "200");
    const deferred = h.rows.get(h.ids[0]) === original && owner.field("name").getAttribute("aria-invalid") !== "true";
    const invalid = owner.handle.validate(h.ids[0]);
    const rejected = !invalid.valid && h.rows.get(h.ids[0]) === original;
    h.edit(owner.field("name"), "Changed"); h.edit(owner.field("count"), "50");
    const stillDeferred = h.rows.get(h.ids[0]) === original, accepted = owner.handle.validate(h.ids[0]);
    return { deferred, rejected, stillDeferred, valid: accepted.valid, value: h.rows.get(h.ids[0])!.value };
  });
  expect(result).toEqual({ deferred: true, rejected: true, stillDeferred: true, valid: true,
    value: { name: "Changed", count: 50, note: "One", choice: "a", enabled: true } });
});

test("blur and Enter remain Grid commit points when automatic validation is disabled", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, owner = h.grid({ autoValidate: false, validateOn: "blur" });
    const name = owner.field("name"), count = owner.field("count"); name.focus(); h.edit(name, "x");
    const deferred = h.rows.get(h.ids[0])!.value.name === "Ada";
    count.focus(); const blurred = h.rows.get(h.ids[0])!.value.name;
    h.edit(count, "200"); const beforeEnter = h.rows.get(h.ids[0])!.value.count;
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }); count.dispatchEvent(event);
    return { deferred, blurred, beforeEnter, count: h.rows.get(h.ids[0])!.value.count,
      prevented: event.defaultPrevented, invalid: owner.field("count").getAttribute("aria-invalid") === "true",
      explicit: owner.handle.validate(h.ids[0]).valid };
  });
  expect(result).toEqual({ deferred: true, blurred: "x", beforeEnter: 10, count: 200, prevented: true, invalid: false, explicit: false });
});

test("a bypassed edit clears prior row constraint errors while retaining current parser integrity errors", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, results: { hadErrors: boolean; cleared: boolean; parseOnly: boolean; count: number }[] = [];
    for (const kind of ["form", "grid"] as const) {
      const owner = h[kind]({ autoValidate: false });
      h.rows.set(h.ids[0], "name", "x"); h.rows.set(h.ids[0], "count", -5);
      const hadErrors = owner.handle.validate(h.ids[0]).issues.length >= 2;
      h.edit(owner.field("note"), "Changed note");
      const cleared = ["name", "count"].every(name => owner.field(name).getAttribute("aria-invalid") !== "true");
      h.edit(owner.field("count"), "bad"); h.edit(owner.field("note"), "Another note");
      const parseOnly = owner.field("count").getAttribute("aria-invalid") === "true" && owner.field("name").getAttribute("aria-invalid") !== "true" &&
        owner.root.querySelector('[data-error-for="count"]')!.textContent === "Enter a finite count.";
      results.push({ hadErrors, cleared, parseOnly, count: h.rows.get(h.ids[0])!.value.count });
      owner.handle.dispose(); h.rows.set(h.ids[0], "name", "Ada"); h.rows.set(h.ids[0], "count", 10);
    }
    return results;
  });
  expect(result).toEqual(Array.from({ length: 2 }, () => ({ hadErrors: true, cleared: true, parseOnly: true, count: -5 })));
});

test("disabled automatic checks do not weaken full atomic paste or hidden explicit Grid validation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, owner = h.grid({ autoValidate: false, initialPage: { page: 1, size: 1 } });
    const original = h.rows.entries(), rejected = owner.handle.paste("200", { id: h.ids[0], field: "count" });
    const atomic = !rejected.valid && h.rows.entries() === original;
    h.rows.set(h.ids[1], "count", 200);
    const hidden = owner.handle.validate().issues.filter(issue => issue.rowId === h.ids[1]);
    const accepted = owner.handle.paste("50", { id: h.ids[0], field: "count" });
    return { atomic, hidden: hidden.map(issue => ({ rule: issue.rule, field: issue.field, element: issue.element === undefined })),
      validPaste: accepted.valid, raw: h.rows.get(h.ids[0])!.value.count, page: owner.handle.page()!.page };
  });
  expect(result).toEqual({ atomic: true, hidden: [{ rule: "countLimit", field: "count", element: true }], validPaste: true, raw: 50, page: 1 });
});

test("invalid policy values fail before ownership and independent instance disposal restores authored accessibility", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.autoValidation, outcomes: boolean[] = [];
    for (const kind of ["form", "grid"] as const) {
      const root = document.createElement(kind === "form" ? "form" : "table");
      root.innerHTML = kind === "form" ? h.markup : `<tbody><tr data-row-template><td>${h.markup}</td></tr></tbody>`;
      document.body.append(root); const original = root.outerHTML;
      let failed = false;
      try {
        if (kind === "form") h.api.bindForm(root, { rows: h.rows, autoValidate: "false" } as unknown as FormOptions);
        else h.api.bindGrid(root as HTMLTableElement, { rows: h.rows, autoValidate: "false" } as unknown as GridOptions);
      } catch { failed = true; }
      const clean = root.outerHTML === original;
      const first = h[kind]({ autoValidate: false }), second = h[kind]({ autoValidate: false });
      h.edit(first.field("name"), "x"); first.handle.validate(h.ids[0]); second.handle.validate(h.ids[0]);
      const errors = [first, second].map(owner => owner.root.querySelector('[data-error-for="name"]')!);
      const unique = errors[0].id !== errors[1].id && errors.every(error => document.querySelectorAll(`[id="${error.id}"]`).length === 1);
      const input = first.field("name"), firstRoot = first.root;
      first.handle.dispose(); first.handle.dispose(); second.handle.dispose();
      input.value = "Disposed"; input.dispatchEvent(new Event("change", { bubbles: true }));
      const restored = kind === "form" ? !input.hasAttribute("aria-invalid") && !input.hasAttribute("aria-describedby") && !firstRoot.querySelector('output[id]') :
        firstRoot.querySelector('[data-row-template]') !== null && firstRoot.querySelector('[aria-invalid], output[id]') === null;
      outcomes.push(failed && clean && unique && h.rows.get(h.ids[0])!.value.name === "x" && restored);
      h.rows.set(h.ids[0], "name", "Ada");
    }
    return outcomes;
  });
  expect(result).toEqual([true, true]);
});
