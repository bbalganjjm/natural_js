// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RowId, Rows } from "../../src/data/index.js";
import type { FormHandle, SelectValue } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";

type Item = {
  name: string; note: string; salary: number; active: boolean; choice: SelectValue;
  tags: readonly SelectValue[]; options: readonly { label: string; value: SelectValue }[];
  profile: { label: string; other: number }; payload: { code: string };
};
type FormOptions = NonNullable<Parameters<typeof bindForm<Item>>[1]>;

declare global {
  interface Window {
    formValues: {
      api: { bindForm: typeof bindForm }; rows: Rows<Item>; ids: readonly RowId[];
      item(name?: string): Item;
      root(html: string): HTMLFormElement;
      make(html: string, options?: Partial<FormOptions>, id?: RowId): { root: HTMLFormElement; form: FormHandle<Item> };
      input(root: ParentNode, name?: string): HTMLInputElement;
      edit(input: HTMLInputElement, value: string): void;
      error(action: () => void): { code: string; api?: string; detail?: Readonly<Record<string, unknown>>; cause?: unknown } | null;
    };
  }
}

const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { data: source("../../src/data/index.ts"), form: source("../../src/ui/form.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ createRows }, api] = await Promise.all([import(modules.data), import(modules.form)]);
    const item = (name = "Ada"): Item => ({ name, note: "A", salary: 120, active: false, choice: 1, tags: [1],
      options: [{ label: "Number", value: 1 }, { label: "String", value: "1" }, { label: "Second", value: 2 }],
      profile: { label: "Primary", other: 1 }, payload: { code: "raw" } });
    const rows: Rows<Item> = createRows([item(), { ...item("Beatrice"), active: true }]);
    const h: Window["formValues"] = {
      api, rows, ids: rows.entries().map(row => row.id), item,
      root(html) { const root = document.createElement("form"); root.innerHTML = html; document.body.append(root); return root; },
      make(html, options = {}, id = h.ids[0]) {
        const root = h.root(html), form = h.api.bindForm(root, { rows, ...options }); form.bind(id); return { root, form };
      },
      input: (root, name = "name") => root.querySelector<HTMLInputElement>(`input[data-field="${name}"]`)!,
      edit(input, value) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); },
      error(action) {
        try { action(); return null; }
        catch (cause) { return cause as { code: string; api?: string; detail?: Readonly<Record<string, unknown>>; cause?: unknown }; }
      }
    }; window.formValues = h;
  }, modules);
});

test("Form value callbacks preserve real replacements and observe native DOM without changing Rows", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, id = h.ids[0], before = h.rows.get(id), original = h.rows.original(id);
    const calls: { callback: string; field: string; value: unknown; phase: string; row: boolean; element: boolean; text?: string }[] = [];
    const first: Record<string, unknown> = { name: false, salary: 0, active: null, choice: "" };
    const last: Record<string, unknown> = { name: 0, salary: null, active: false };
    const owner = h.make(["name", "salary", "active", "choice", "note"].map(field => `<span data-field="${field}"></span>`).join(""), {
      beforeBindValue(value, context) {
        calls.push({ callback: "before", field: context.field, value, phase: context.phase,
          row: context.rowId === id && context.values.name === "Ada", element: context.element.dataset.field === context.field });
        return first[context.field];
      },
      onBindValue(value, context) {
        calls.push({ callback: "after", field: context.field, value, phase: context.phase,
          row: context.rowId === id && context.values.name === "Ada", element: context.element.dataset.field === context.field,
          text: context.element.textContent ?? "" });
        return last[context.field];
      }
    });
    return { calls, text: [...owner.root.querySelectorAll("[data-field]")].map(element => element.textContent),
      unchanged: h.rows.get(id) === before && h.rows.original(id) === original && h.rows.changes().length === 0,
      raw: owner.form.read(), changed: [...owner.root.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field-changed")) };
  });
  expect(result.calls.map(call => [call.callback, call.field, call.value, call.text])).toEqual([
    ["before", "name", "Ada", undefined], ["after", "name", false, "false"],
    ["before", "salary", 120, undefined], ["after", "salary", 0, "0"],
    ["before", "active", false, undefined], ["after", "active", null, ""],
    ["before", "choice", 1, undefined], ["after", "choice", "", ""],
    ["before", "note", "A", undefined], ["after", "note", "A", "A"]
  ]);
  expect(result.calls.every(call => call.phase === "bind" && call.row && call.element)).toBe(true);
  expect(result.text).toEqual(["0", "", "false", "", "A"]);
  expect(result.unchanged).toBe(true);
  expect(result.raw).toEqual({ name: "Ada", salary: 120, active: false, choice: 1, note: "A" });
  expect(result.changed).toEqual(["false", "false", "false", "false", "false"]);
});

test("after projections run the existing formatter or renderer once more only when their raw input changes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, formats: string[] = [], renders: unknown[] = [], seen: unknown[] = [];
    let replace = true;
    const owner = h.make('<input data-field="salary" data-format=\'[["money"]]\'><span data-field="name"><i>Authored</i></span>', {
      rules: { format: { money: value => { formats.push(value); return `$${value}`; } } },
      render: { name: value => { renders.push(value); const node = document.createElement("strong"); node.textContent = String(value); return node; } },
      beforeBindValue(value, context) { return context.field === "salary" ? 121 : `<${value}>`; },
      onBindValue(value, context) {
        seen.push([context.field, value, context.element instanceof HTMLInputElement ? context.element.value : context.element.textContent]);
        return replace ? context.field === "salary" ? 122 : "<Final>" : value;
      }
    });
    const first = { salary: h.input(owner.root, "salary").value, name: owner.root.querySelector("strong")!.textContent,
      formats: [...formats], renders: [...renders], seen: [...seen] };
    formats.length = renders.length = seen.length = 0; replace = false; owner.form.bind(h.ids[0]);
    return { first, equal: { formats, renders, seen }, raw: owner.form.read(), clean: h.rows.changes().length === 0 };
  });
  expect(result).toEqual({ first: { salary: "$122", name: "<Final>", formats: ["121", "122"], renders: ["<Ada>", "<Final>"],
    seen: [["salary", 121, "$121"], ["name", "<Ada>", "<Ada>"]] },
  equal: { formats: ["121"], renders: ["<Ada>"], seen: [["salary", 121, "$121"], ["name", "<Ada>", "<Ada>"]] },
  raw: { salary: 120, name: "Ada" }, clean: true });
});

test("projection caching preserves whole-row formatter and renderer reactivity without replaying value callbacks", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, calls: string[] = [];
    const owner = h.make('<input data-field="salary" data-format=\'[["context"]]\'><span data-field="name"></span>', {
      rules: { format: { context: (value, _args, context) => `${value}/${context.values.note}` } },
      render: { name: (value, context) => `${value}/${context.values.note}` },
      beforeBindValue(value, context) { calls.push(`before:${context.field}:${context.phase}`); return context.field === "name" ? String(value).toUpperCase() : undefined; },
      onBindValue(_value, context) { calls.push(`after:${context.field}:${context.phase}`); }
    });
    const initial = [...calls]; h.rows.set(h.ids[0], "note", "Changed");
    const sibling = { calls: [...calls], salary: h.input(owner.root, "salary").value, name: owner.root.querySelector("span")!.textContent };
    h.rows.set(h.ids[0], "name", "Grace");
    return { initial, sibling, final: calls.slice(initial.length), name: owner.root.querySelector("span")!.textContent };
  });
  expect(result).toEqual({ initial: ["before:salary:bind", "after:salary:bind", "before:name:bind", "after:name:bind"],
    sibling: { calls: ["before:salary:bind", "after:salary:bind", "before:name:bind", "after:name:bind"], salary: "120/Changed", name: "ADA/Changed" },
    final: ["before:name:val", "after:name:val"], name: "GRACE/Changed" });
});

test("callback phases follow actual field changes while unrelated rows movement nested siblings and unchanged resets stay quiet", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, calls: string[] = [];
    const owner = h.make('<span data-field="profile.label"></span><span data-field="name"></span>', {
      beforeBindValue(value, context) { calls.push(`${context.field}:${context.phase}:${value}`); }
    });
    h.rows.set(h.ids[0], "profile", { label: "Primary", other: 2 });
    h.rows.set(h.ids[1], "name", "Other"); h.rows.append([h.item("Appended")]); h.rows.move(h.ids[0]);
    owner.form.read(); owner.form.validate(); h.rows.revert(h.ids[0]);
    const quiet = [...calls]; h.rows.set(h.ids[0], "name", "Changed"); h.rows.revert(h.ids[0]); h.rows.revert(h.ids[0]);
    const changed = calls.slice(quiet.length); owner.form.bind(h.ids[0]);
    return { quiet, changed, explicit: calls.slice(quiet.length + changed.length) };
  });
  expect(result).toEqual({ quiet: ["profile.label:bind:Primary", "name:bind:Ada"], changed: ["name:val:Changed", "name:bind:Ada"],
    explicit: ["profile.label:bind:Primary", "name:bind:Ada"] });
});

test("focused text defers explicit binding and preserves its pending reason through unchanged resets until blur", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, calls: string[] = [];
    const owner = h.make('<label>Name <input data-field="name"></label>', {
      beforeBindValue(value, context) { calls.push(`before:${context.phase}:${value}`); return `[${value}]`; },
      onBindValue(value, context) { calls.push(`after:${context.phase}:${value}`); }
    });
    const input = h.input(owner.root); input.focus(); const focused = input.value;
    owner.form.bind(h.ids[1]); const rebound = input.value; h.rows.revert(h.ids[1]); h.rows.set(h.ids[1], "note", "Unrelated");
    const pending = [...calls]; input.blur(); const bound = input.value;
    input.focus(); h.rows.set(h.ids[1], "name", "Latest"); h.rows.move(h.ids[1]);
    const updated = [...calls]; input.blur(); const final = input.value;
    input.focus(); input.blur(); owner.form.read(); owner.form.validate();
    return { focused, rebound, pending, bound, updated, final, calls, raw: owner.form.read() };
  });
  expect(result).toEqual({ focused: "Ada", rebound: "Beatrice", pending: ["before:bind:Ada", "after:bind:[Ada]"], bound: "[Beatrice]",
    updated: ["before:bind:Ada", "after:bind:[Ada]", "before:bind:Beatrice", "after:bind:[Beatrice]"], final: "[Latest]",
    calls: ["before:bind:Ada", "after:bind:[Ada]", "before:bind:Beatrice", "after:bind:[Beatrice]", "before:val:Latest", "after:val:[Latest]"],
    raw: { name: "Latest" } });
});

test("invalid drafts never become binding events and a focused successful commit projects its new raw once on blur", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, calls: string[] = [];
    const owner = h.make('<input data-field="salary"><output data-error-for="salary"></output>', {
      parse: { salary: text => { const value = Number(text); if (!Number.isFinite(value)) throw new Error("Number required"); return value; } },
      beforeBindValue(value, context) { calls.push(`${context.phase}:${value}`); return `${value} units`; }
    });
    const input = h.input(owner.root, "salary"); input.focus(); h.edit(input, "bad"); input.blur();
    const rejected = { raw: h.rows.get(h.ids[0])!.value.salary, text: input.value, rules: owner.form.validate().issues.map(issue => issue.rule), calls: [...calls] };
    input.focus(); h.edit(input, "250"); const committed = { raw: h.rows.get(h.ids[0])!.value.salary, text: input.value, calls: [...calls] };
    input.blur(); const final = { text: input.value, calls: [...calls], valid: owner.form.validate().valid, raw: owner.form.read() };
    return { rejected, committed, final };
  });
  expect(result).toEqual({ rejected: { raw: 120, text: "bad", rules: ["parse"], calls: ["bind:120"] },
    committed: { raw: 250, text: "250", calls: ["bind:120"] }, final: { text: "250 units", calls: ["bind:120", "val:250"], valid: true, raw: { salary: 250 } } });
});

test("raw constraints and hidden validation ignore display projections and another row native custom validity", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues; let count = 0;
    const owner = h.make('<input type="checkbox" required data-field="active"><input minlength="5" data-field="name"><output data-error-for="name"></output>', {
      beforeBindValue(_value, context) { count++; return context.field === "active" ? true : "Long display"; }
    });
    const initial = count, raw = owner.form.validate().issues.map(issue => [issue.field, issue.rule]);
    const name = h.input(owner.root); h.input(owner.root, "active").setCustomValidity("Current row only");
    const own = owner.form.validate().issues.some(issue => issue.message === "Current row only");
    const observer = new MutationObserver(() => {}); observer.observe(owner.root, { subtree: true, attributes: true, childList: true, characterData: true });
    const hidden = owner.form.validate(h.ids[1]); const mutations = observer.takeRecords().length; observer.disconnect();
    return { raw, own, hidden: hidden.valid, mutations, calls: count === initial,
      display: [h.input(owner.root, "active").checked, name.value], stored: owner.form.read() };
  });
  expect(result).toEqual({ raw: [["active", "html"], ["name", "html"]], own: true, hidden: true, mutations: 0, calls: true,
    display: [true, "Long display"], stored: { active: false, name: "Ada" } });
});

test("parsers and business validation receive committed candidate raw while projections leave originals and save changes intact", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, seen: unknown[] = [], calls: unknown[] = [];
    const owner = h.make('<span data-field="name"></span><input data-field="salary" data-validate=\'[["raw"]]\'>', {
      parse: { salary: (text, context) => { seen.push(["parse", text, context.values.name]); return Number(text); } },
      rules: { validate: { raw: (value, _args, context) => { seen.push(["validate", value, context.values.salary, context.values.name]); return true; } } },
      beforeBindValue(value, context) { calls.push([context.field, context.phase, value]); return context.field === "salary" ? Number(value) + 1 : String(value).toUpperCase(); }
    });
    h.edit(h.input(owner.root, "salary"), "230"); const checked = owner.form.validate();
    return { valid: checked.valid, parsedRaw: seen.some(entry => JSON.stringify(entry) === JSON.stringify(["parse", "230", "Ada"])),
      candidateRaw: seen.some(entry => JSON.stringify(entry) === JSON.stringify(["validate", "230", 230, "Ada"])),
      calls, display: h.input(owner.root, "salary").value, read: owner.form.read(),
      original: h.rows.original(h.ids[0])!.salary, changes: h.rows.changes().map(change => [change.status, change.value.salary]),
      flags: [...owner.root.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field-changed")) };
  });
  expect(result).toEqual({ valid: true, parsedRaw: true, candidateRaw: true,
    calls: [["name", "bind", "Ada"], ["salary", "bind", 120], ["salary", "val", 230]], display: "231", read: { name: "Ada", salary: 230 },
    original: 120, changes: [["update", 230]], flags: ["false", "true"] });
});

test("native groups typed duplicate choices and unmarked Selects preserve their distinct projection contracts", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, first = h.rows.get(h.ids[0])!.value;
    h.rows.set(h.ids[0], "options", [...first.options, { label: "Duplicate", value: 1 }]);
    const projected: SelectValue[] = [1, 1]; let frozen = false, tagCalls = 0;
    const owner = h.make('<select data-field="choice" data-options="options" data-option-label="label" data-option-value="value"></select>' +
      '<select multiple data-field="tags" data-options="options" data-option-label="label" data-option-value="value"></select>' +
      '<input type="radio" name="note-projection" value="A" data-field="note"><input type="radio" name="note-projection" value="B" data-field="note">' +
      '<input type="checkbox" data-field="active"><select data-field="salary"><option value="120">First</option><option value="240">Second</option></select>', {
      parse: { salary: Number }, beforeBindValue(_value, context) {
        if (context.field === "tags") tagCalls++;
        return ({ choice: "1", tags: projected, note: "B", active: true, salary: 240 } as Record<string, unknown>)[context.field];
      }, onBindValue(value, context) {
        if (context.field === "tags") frozen = Object.isFrozen(value);
      }
    });
    projected.push(2); h.rows.set(h.ids[0], "profile", { label: "Primary", other: 2 });
    const select = (field: string) => owner.root.querySelector<HTMLSelectElement>(`select[data-field="${field}"]`)!;
    return { choice: select("choice").selectedIndex, tags: [...select("tags").selectedOptions].map(option => option.index),
      radios: [...owner.root.querySelectorAll<HTMLInputElement>('[data-field="note"]')].map(input => input.checked),
      active: h.input(owner.root, "active").checked, salary: select("salary").value,
      raw: owner.form.read(), valid: owner.form.validate().valid, copied: frozen && tagCalls === 1 && h.rows.get(h.ids[0])!.value.tags === first.tags };
  });
  expect(result).toEqual({ choice: 1, tags: [0, 3], radios: [false, true], active: true, salary: "240",
    raw: { choice: 1, tags: [1], note: "A", active: false, salary: 120 }, valid: true, copied: true });
});

test("undefined callbacks preserve structured display and unavailable loaded choices without normalizing their source", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues; h.rows.set(h.ids[0], "choice", 9); const snapshot = h.rows.get(h.ids[0]);
    const calls: unknown[] = [];
    const owner = h.make('<span data-field="payload"></span><select data-field="choice" data-options="options" data-option-label="label" data-option-value="value"></select>', {
      beforeBindValue(value) { calls.push(value); }, onBindValue(value) { calls.push(value); }
    });
    return { text: owner.root.querySelector("span")!.textContent, selected: owner.root.querySelector("select")!.selectedIndex,
      rules: owner.form.validate().issues.map(issue => issue.rule), calls: calls.length,
      raw: owner.form.read(), unchanged: h.rows.get(h.ids[0]) === snapshot };
  });
  expect(result).toEqual({ text: "[object Object]", selected: -1, rules: ["select-option"], calls: 4,
    raw: { payload: { code: "raw" }, choice: 9 }, unchanged: true });
});

test("callback option errors reject before Form ownership or accessibility changes and leave local Forms unchanged", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, codes: (string | undefined)[] = [], retry: boolean[] = [];
    for (const name of ["beforeBindValue", "onBindValue"] as const) {
      for (const invalid of [null, false, {}, "callback"]) {
        const root = h.root('<input data-field="name" aria-describedby="authored"><output data-error-for="name">Original</output>');
        const original = root.innerHTML;
        const error = h.error(() => h.api.bindForm(root, { rows: h.rows, [name]: invalid } as unknown as FormOptions)); codes.push(error?.code);
        const untouched = root.innerHTML === original, form = h.api.bindForm(root, { rows: h.rows }); form.bind(h.ids[0]); form.dispose();
        retry.push(untouched && !root.querySelector("output")!.hasAttribute("id") && root.querySelector("input")!.getAttribute("aria-describedby") === "authored");
      }
      const root = h.root('<input data-field="name" value="Local"><output data-error-for="name">Original</output>');
      const original = root.innerHTML, error = h.error(() => h.api.bindForm(root, { [name]: () => undefined })); codes.push(error?.code);
      const form = h.api.bindForm(root); const read = form.read(); form.dispose(); retry.push(root.innerHTML === original && read.name === "Local");
    }
    return { codes, retry };
  });
  expect(result.codes).toEqual(Array(10).fill("FORM_VALUE_OPTIONS"));
  expect(result.retry).toEqual(Array(10).fill(true));
});

test("explicit invalid projections fail synchronously with automatic validation disabled and permit a fresh retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, invalid: unknown[] = [NaN, Infinity, -Infinity, 1n, Symbol("value"), () => 1,
      {}, { then() {} }, Promise.resolve(1), document.createElement("span"), [1]];
    const failures: { code: string | undefined; unchanged: boolean; retainedWrite: boolean; retried: boolean }[] = [];
    for (const callback of ["beforeBindValue", "onBindValue"] as const) {
      for (const value of invalid) {
        let current = value;
        const root = h.root('<input data-field="salary" value="Authored">'), input = h.input(root, "salary");
        const form = h.api.bindForm(root, { rows: h.rows, autoValidate: false, [callback]: () => current });
        const snapshot = h.rows.get(h.ids[0]), error = h.error(() => form.bind(h.ids[0]));
        const unchanged = h.rows.get(h.ids[0]) === snapshot, retainedWrite = input.value === (callback === "beforeBindValue" ? "Authored" : "120");
        current = undefined; form.bind(h.ids[0]); failures.push({ code: error?.code, unchanged, retainedWrite, retried: input.value === "120" }); form.dispose();
      }
    }
    const shapes: { html: string; value: unknown }[] = [
      { html: '<input type="checkbox" data-field="active">', value: "true" },
      { html: '<select multiple data-field="tags"><option value="1">One</option></select>', value: 1 },
      { html: '<select multiple data-field="tags"><option value="1">One</option></select>', value: [{}] },
      { html: '<input type="number" data-field="salary">', value: "not a number" },
      { html: '<input type="range" data-field="salary">', value: "1000" }
    ];
    const codes = shapes.map(({ html, value }) => {
      const root = h.root(html), form = h.api.bindForm(root, { rows: h.rows, autoValidate: false, beforeBindValue: () => value });
      const code = h.error(() => form.bind(h.ids[0]))?.code; form.dispose(); return code;
    });
    const root = h.root('<input type="color" data-field="salary">'), input = h.input(root, "salary");
    const form = h.api.bindForm(root, { rows: h.rows, autoValidate: false, beforeBindValue: () => "red" });
    const color = { type: input.type, code: h.error(() => form.bind(h.ids[0]))?.code,
      view: input.value, raw: h.rows.get(h.ids[0])!.value.salary }; form.dispose();
    return { failures, shapes: codes, color };
  });
  expect(result.failures).toEqual(Array(22).fill({ code: "FORM_VALUE", unchanged: true, retainedWrite: true, retried: true }));
  expect(result.shapes).toEqual(Array(5).fill("FORM_VALUE"));
  expect(["color", "text"]).toContain(result.color.type);
  expect(result.color.code).toBe(result.color.type === "color" ? "FORM_VALUE" : undefined);
  if (result.color.type === "text") expect(result.color.view).toBe("red");
  expect(result.color.raw).toBe(120);
});

test("typed projection guards consume duplicate occurrences and reject an unavailable final replacement before its write", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, results: unknown[] = [];
    for (const multiple of [false, true]) {
      const root = h.root(`<select ${multiple ? "multiple" : ""} data-field="${multiple ? "tags" : "choice"}" data-options="options" data-option-label="label" data-option-value="value"></select>`);
      let failed = true;
      const form = h.api.bindForm(root, { rows: h.rows, autoValidate: false,
        beforeBindValue: () => multiple ? [1] : 2,
        onBindValue: () => failed ? multiple ? [1, 1] : 9 : undefined
      });
      const error = h.error(() => form.bind(h.ids[0])), select = root.querySelector("select")!;
      results.push({ code: error?.code, selected: [...select.selectedOptions].map(option => option.index),
        raw: multiple ? h.rows.get(h.ids[0])!.value.tags : h.rows.get(h.ids[0])!.value.choice });
      failed = false; form.bind(h.ids[0]); form.dispose();
    }
    return results;
  });
  expect(result).toEqual([{ code: "FORM_VALUE", selected: [2], raw: 1 }, { code: "FORM_VALUE", selected: [0], raw: [1] }]);
});

test("cached explicit typed projections recheck changed options without replaying hooks or changing the received raw", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues; h.rows.set(h.ids[0], "choice", 2); let count = 0, project = true;
    const owner = h.make('<select data-field="choice" data-options="options" data-option-label="label" data-option-value="value"></select>', {
      beforeBindValue() { count++; return project ? 1 : undefined; }
    });
    const select = owner.root.querySelector("select")!, before = count;
    const error = h.error(() => h.rows.set(h.ids[0], "options", [{ label: "Remaining", value: 2 }]));
    const failed = { code: error?.code, quiet: count === before, raw: h.rows.get(h.ids[0])!.value.choice };
    project = false; owner.form.bind(h.ids[0]);
    return { failed, retry: { text: select.selectedOptions[0]?.textContent, count, raw: owner.form.read() } };
  });
  expect(result).toEqual({ failed: { code: "FORM_VALUE", quiet: true, raw: 2 },
    retry: { text: "Remaining", count: 2, raw: { choice: 2 } } });
});

test("callback failures identify their field row phase and cause without pretending DOM binding is transactional", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, output: unknown[] = [];
    for (const callback of ["beforeBindValue", "onBindValue"] as const) {
      let failed = true; const cause = new Error(`${callback} failure`), calls: string[] = [];
      const root = h.root('<span data-field="name">Authored</span><span data-field="note">Later</span>');
      const form = h.api.bindForm(root, { rows: h.rows,
        beforeBindValue(value, context) { calls.push(`before:${context.field}`); if (callback === "beforeBindValue" && failed) throw cause; return String(value).toUpperCase(); },
        onBindValue(_value, context) { calls.push(`after:${context.field}`); if (callback === "onBindValue" && failed) throw cause; }
      });
      const error = h.error(() => form.bind(h.ids[0]));
      output.push({ callback, code: error?.code, api: error?.api, field: error?.detail?.field, row: error?.detail?.rowId === h.ids[0],
        phase: error?.detail?.phase, callbackName: error?.detail?.callback, cause: error?.cause === cause,
        texts: [...root.querySelectorAll("span")].map(span => span.textContent), later: calls.some(call => call.endsWith(":note")), clean: h.rows.changes().length === 0 });
      failed = false; form.bind(h.ids[0]); output.push({ retry: root.textContent === "ADAA" }); form.dispose();
    }
    return output;
  });
  expect(result).toEqual([
    { callback: "beforeBindValue", code: "FORM_VALUE", api: "bindForm", field: "name", row: true, phase: "bind", callbackName: "beforeBindValue", cause: true,
      texts: ["Authored", "Later"], later: false, clean: true }, { retry: true },
    { callback: "onBindValue", code: "FORM_VALUE", api: "bindForm", field: "name", row: true, phase: "bind", callbackName: "onBindValue", cause: true,
      texts: ["ADA", "Later"], later: false, clean: true }, { retry: true }
  ]);
});

test("different-row callback reentry completes the newer binding and rejects same-pair cycles with a recoverable error", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, root = h.root('<span data-field="name"></span>'), calls: string[] = [];
    let mode: "other" | "same" | "cycle" | "none" = "other", form: FormHandle<Item>;
    form = h.api.bindForm(root, { rows: h.rows,
      beforeBindValue(value, context) {
        calls.push(`before:${value}`);
        if (mode === "other" && context.rowId === h.ids[0]) form.bind(h.ids[1]);
        if (mode === "same") form.bind(context.rowId);
        if (mode === "cycle") form.bind(context.rowId === h.ids[0] ? h.ids[1] : h.ids[0]);
        return String(value).toUpperCase();
      }, onBindValue(value) { calls.push(`after:${value}`); }
    });
    form.bind(h.ids[0]); const different = { calls: [...calls], text: root.textContent, read: form.read() };
    mode = "same"; const same = h.error(() => form.bind(h.ids[0]))?.code;
    mode = "cycle"; const cycle = h.error(() => form.bind(h.ids[0]))?.code;
    mode = "none"; form.bind(h.ids[0]);
    const focusedRoot = h.root('<input data-field="name">'), input = h.input(focusedRoot); let focusedForm: FormHandle<Item>, reenter = true;
    focusedForm = h.api.bindForm(focusedRoot, { rows: h.rows, beforeBindValue(value, context) {
      if (reenter) { input.focus(); focusedForm.bind(context.rowId); } return value;
    } });
    const focused = h.error(() => focusedForm.bind(h.ids[0]))?.code; reenter = false; input.blur(); focusedForm.bind(h.ids[0]);
    return { different, same, cycle, retry: root.textContent, raw: h.rows.get(h.ids[0])!.value.name, focused, focusedRetry: input.value };
  });
  expect(result).toEqual({ different: { calls: ["before:Ada", "before:Beatrice", "after:BEATRICE"], text: "BEATRICE", read: { name: "Beatrice" } },
    same: "FORM_VALUE", cycle: "FORM_VALUE", retry: "ADA", raw: "Ada", focused: "FORM_VALUE", focusedRetry: "Ada" });
});

test("formatter and renderer row reentry cannot commit an older returned view over the completed new binding", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, cases: unknown[] = [];
    for (const rendered of [false, true]) {
      const root = h.root(rendered ? '<span data-field="name"><i>Authored</i></span>' : '<input data-field="name" data-format=\'[["switch"]]\'>');
      let form: FormHandle<Item>, switchRow = true; const after: string[] = [];
      const write = (value: unknown) => { if (switchRow && value === "Ada") form.bind(h.ids[1]); return `View ${value}`; };
      form = h.api.bindForm(root, { rows: h.rows, ...(rendered ? { render: { name: write } } : { rules: { format: { switch: write } } }),
        beforeBindValue: value => value, onBindValue: value => { after.push(String(value)); } });
      form.bind(h.ids[0]);
      cases.push({ rendered, text: rendered ? root.textContent : h.input(root).value, after: [...after], read: form.read() });
      switchRow = false; form.bind(h.ids[0]); cases.push({ retry: rendered ? root.textContent : h.input(root).value }); form.dispose();
    }
    return cases;
  });
  expect(result).toEqual([
    { rendered: false, text: "View Beatrice", after: ["Beatrice"], read: { name: "Beatrice" } }, { retry: "View Ada" },
    { rendered: true, text: "View Beatrice", after: ["Beatrice"], read: { name: "Beatrice" } }, { retry: "View Ada" }
  ]);
});

test("source removal null binding and replacement clear callback state without stale after work or resurrection", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, cases: unknown[] = [];
    for (const action of ["remove-before", "replace-after", "null-after"] as const) {
      const root = h.root('<span data-field="name">Authored</span><span data-field="note">Later</span>');
      let form: FormHandle<Item>, acted = false; const calls: string[] = [];
      const target = h.rows.add(h.item(action));
      form = h.api.bindForm(root, { rows: h.rows,
        beforeBindValue(value, context) {
          calls.push(`before:${context.field}`);
          if (!acted && action === "remove-before") { acted = true; h.rows.remove(target); }
          return `Before ${value}`;
        },
        onBindValue(_value, context) {
          calls.push(`after:${context.field}`);
          if (!acted) { acted = true; if (action === "replace-after") h.rows.replace([h.item("Replacement")]); else form.bind(null); }
          return "Stale final";
        }
      });
      form.bind(target); cases.push({ action, text: root.textContent, calls, read: form.read() }); form.dispose();
    }
    return cases;
  });
  expect(result).toEqual([
    { action: "remove-before", text: "", calls: ["before:name"], read: { name: undefined, note: undefined } },
    { action: "replace-after", text: "", calls: ["before:name", "after:name"], read: { name: undefined, note: undefined } },
    { action: "null-after", text: "", calls: ["before:name", "after:name"], read: { name: undefined, note: undefined } }
  ]);
});

test("disposal from either callback restores authored render nodes and suppresses every later value write", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, cases: unknown[] = [];
    for (const disposeAt of ["before", "after"] as const) {
      const root = h.root('<span data-field="name"><i>Authored</i></span><input data-field="note" aria-describedby="existing"><output data-error-for="note">Original</output>');
      const original = root.innerHTML, node = root.querySelector("i"), calls: string[] = []; let form: FormHandle<Item>;
      form = h.api.bindForm(root, { rows: h.rows, render: { name: value => `Rendered ${value}` },
        beforeBindValue(value, context) { calls.push(`before:${context.field}`); if (disposeAt === "before") form.dispose(); return value; },
        onBindValue(_value, context) { calls.push(`after:${context.field}`); form.dispose(); return "Stale"; }
      });
      form.bind(h.ids[0]); const count = calls.length; h.rows.set(h.ids[0], "salary", h.rows.get(h.ids[0])!.value.salary + 1);
      h.input(root, "note").dispatchEvent(new Event("input", { bubbles: true }));
      cases.push({ disposeAt, calls, quiet: calls.length === count, restored: root.innerHTML === original && root.querySelector("i") === node });
      const retry = h.api.bindForm(root, { rows: h.rows }); retry.bind(h.ids[0]); retry.dispose();
    }
    return cases;
  });
  expect(result).toEqual([{ disposeAt: "before", calls: ["before:name"], quiet: true, restored: true },
    { disposeAt: "after", calls: ["before:name", "after:name"], quiet: true, restored: true }]);
});

test("a callback failure after a committed Rows update keeps the actual change and supports an explicit retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues; let failed = false; const calls: string[] = [];
    const owner = h.make('<span data-field="name"></span><span data-field="salary">Later</span>', {
      beforeBindValue(value, context) { calls.push(`${context.field}:${context.phase}:${value}`); if (failed && context.field === "name") throw new Error("Display failed"); return value; }
    });
    calls.length = 0; failed = true; const error = h.error(() => h.rows.set(h.ids[0], "name", "Committed"));
    const committed = { code: error?.code, calls: [...calls], status: h.rows.get(h.ids[0])!.status,
      raw: owner.form.read(), original: h.rows.original(h.ids[0])!.name, payload: h.rows.changes()[0].value.name };
    failed = false; owner.form.bind(h.ids[0]); return { committed, retry: owner.root.querySelector("span")!.textContent };
  });
  expect(result).toEqual({ committed: { code: "FORM_VALUE", calls: ["name:val:Committed"], status: "update",
    raw: { name: "Committed", salary: 120 }, original: "Ada", payload: "Committed" }, retry: "Committed" });
});

test("independent authored Forms share raw data with unique accessible errors and release callbacks without retained ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, calls = [0, 0];
    const first = h.make('<label>Name <input required data-field="name"></label><output data-error-for="name"></output>', {
      beforeBindValue(value) { calls[0]++; return `[${value}]`; }
    });
    const second = h.make('<fieldset><legend>Different HTML</legend><div><span data-field="name"><b>Original</b></span></div><output data-error-for="name"></output></fieldset>', {
      render: { name: value => String(value) }, beforeBindValue(value) { calls[1]++; return String(value).toUpperCase(); }
    });
    const regions = [first.root, second.root].map(root => root.querySelector("output")!);
    const distinct = regions[0].id !== regions[1].id && regions.every(region => document.querySelectorAll(`[id="${region.id}"]`).length === 1);
    const input = h.input(first.root); input.focus(); h.edit(input, "Grace"); input.blur();
    const bound = { first: input.value, second: second.root.querySelector("span")!.textContent, raw: first.form.read(), counts: [...calls] };
    first.form.dispose(); second.form.dispose(); const before = [...calls]; h.edit(input, "Ignored"); h.rows.set(h.ids[0], "name", "Later");
    return { distinct, bound, quiet: calls.every((count, index) => count === before[index]), raw: h.rows.get(h.ids[0])!.value.name,
      restored: regions.every(region => !region.hasAttribute("id") && !region.hasAttribute("aria-live")) && second.root.querySelector("b")!.textContent === "Original" };
  });
  expect(result).toEqual({ distinct: true, bound: { first: "[Grace]", second: "GRACE", raw: { name: "Grace" }, counts: [2, 2] },
    quiet: true, raw: "Later", restored: true });
});

test("array replacement accessors are materialized once before validation freezing and cached reuse", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, value: unknown[] = ["2"]; let reads = 0, calls = 0, observed: unknown, frozen = false;
    Object.defineProperty(value, 0, { get() { reads++; return reads === 1 ? "2" : { invalid: true }; } });
    const owner = h.make('<select multiple data-field="tags"><option value="1">First</option><option value="2">Second</option></select>', {
      beforeBindValue() { calls++; return value; }, onBindValue(value) { observed = value; frozen = Object.isFrozen(value); }
    });
    h.rows.set(h.ids[0], "note", "Unrelated");
    return { reads, calls, observed, frozen, selected: [...owner.root.querySelector("select")!.selectedOptions].map(option => option.value),
      raw: owner.form.read() };
  });
  expect(result).toEqual({ reads: 1, calls: 1, observed: ["2"], frozen: true, selected: ["2"], raw: { tags: [1] } });
});

test("same-target renderer recursion stays bounded without hooks during cached repaint and after null binding", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, cases: unknown[] = [];
    for (const mode of ["no-hooks", "cached", "unbound"] as const) {
      const root = h.root('<span data-field="name">Authored</span>'); let form: FormHandle<Item>, recurse = false, renders = 0;
      form = h.api.bindForm(root, { rows: h.rows, ...(mode === "no-hooks" ? {} : { beforeBindValue: (value: unknown) => value }),
        render: { name: value => {
          renders++; if (renders > 3) throw new Error("Renderer recursion was not bounded");
          if (recurse) form.bind(mode === "unbound" ? null : h.ids[0]); return `View ${value}`;
        } }
      });
      form.bind(h.ids[0]); recurse = true; renders = 0;
      const error = h.error(() => mode === "cached" ? h.rows.set(h.ids[0], "note", "Cache repaint") : form.bind(mode === "unbound" ? null : h.ids[0]));
      const bounded = renders; recurse = false; renders = 0; form.bind(h.ids[0]);
      cases.push({ mode, code: error?.code, renders: bounded, retry: root.textContent }); form.dispose();
    }
    return cases;
  });
  expect(result).toEqual(["no-hooks", "cached", "unbound"].map(mode => ({ mode, code: "UI_RENDER", renders: 1, retry: "View Ada" })));
});

test("failed value cycles remain quiet on sibling updates until explicit binding or a real raw change retries them", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, calls: string[] = []; let fail = false;
    const owner = h.make('<span data-field="name"></span>', {
      beforeBindValue(value, context) { calls.push(`${context.phase}:${value}`); if (fail) throw new Error("Projection failed"); return `[${value}]`; }
    });
    fail = true; const first = h.error(() => h.rows.set(h.ids[0], "name", "Committed"))?.code;
    const count = calls.length, sibling = h.error(() => h.rows.set(h.ids[0], "note", "Unrelated"));
    const quiet = count === calls.length && sibling === null && owner.form.read().name === "Committed";
    fail = false; owner.form.bind(h.ids[0]); const explicit = owner.root.textContent;
    fail = true; const second = h.error(() => h.rows.set(h.ids[0], "name", "Next"))?.code;
    fail = false; h.rows.set(h.ids[0], "name", "Recovered");
    return { first, quiet, explicit, second, final: owner.root.textContent, calls, raw: owner.form.read() };
  });
  expect(result).toEqual({ first: "FORM_VALUE", quiet: true, explicit: "[Committed]", second: "FORM_VALUE", final: "[Recovered]",
    calls: ["bind:Ada", "val:Committed", "bind:Committed", "val:Next", "val:Recovered"], raw: { name: "Recovered" } });
});

test("focused read-only text projects immediately while ordinary formatter-only focus behavior stays compatible", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formValues, calls: string[] = [];
    const html = '<input readonly data-field="name" data-format=\'[["suffix"]]\'>';
    const rules: FormOptions["rules"] = { format: { suffix: value => `${value}!` } };
    const owner = h.make(html, { rules,
      beforeBindValue(value, context) { calls.push(`${context.phase}:${value}`); return `<${value}>`; }
    });
    const input = h.input(owner.root), initial = input.value; input.focus(); const focused = input.value;
    owner.form.bind(h.ids[1]); const rebound = input.value; h.rows.set(h.ids[1], "name", "Latest"); const changed = input.value;
    input.blur(); const after = input.value; owner.form.dispose();
    const ordinary = h.make(html, { rules }), plain = h.input(ordinary.root), oldInitial = plain.value;
    plain.focus(); const oldFocused = plain.value; plain.blur();
    return { initial, focused, rebound, changed, after, calls, old: [oldInitial, oldFocused, plain.value] };
  });
  expect(result).toEqual({ initial: "<Ada>!", focused: "<Ada>!", rebound: "<Beatrice>!", changed: "<Latest>!", after: "<Latest>!",
    calls: ["bind:Ada", "bind:Beatrice", "val:Latest"], old: ["Ada!", "Ada", "Ada!"] });
});
