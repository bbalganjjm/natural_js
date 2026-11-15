// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RuleSet } from "../../src/ui/index.js";

type Api = Pick<typeof import("../../src/ui/index.js"), "bindForm" | "bindChoiceGroup"> & Pick<typeof import("../../src/data/index.js"), "createRows">;
declare global { interface Window { rulesForm: { api: Api;
  root(html: string): HTMLFormElement; edit(input: HTMLInputElement, value: string): void;
  error(run: () => unknown): { code?: string; cause?: unknown } | null;
}; } }
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm, bindChoiceGroup }, { createRows }] = await Promise.all([import(modules.ui), import(modules.data)]);
    window.rulesForm = { api: { bindForm, bindChoiceGroup, createRows },
      root(html) { const root = document.createElement("form"); root.innerHTML = html; document.body.append(root); return root; },
      edit(input, value) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); },
      error(run) { try { run(); return null; } catch (cause) { return cause as { code?: string; cause?: unknown }; } }
    };
  }, modules);
});

test("HTML rule-only rescan retains two row drafts focus caret errors defaults and source acceptance without user work", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<input data-field="name" value="Capture" data-validate=\'[["old"]]\'><output data-error-for="name"></output>');
    const rows = h.api.createRows([{ name: "Ada" }, { name: "Bea" }]), ids = rows.entries().map(row => row.id);
    let calls = 0, parses = 0, bound = 0, sources = 0;
    const form = h.api.bindForm(root, { rows, parse: { name: value => { parses++; return value; } }, beforeBind: () => { bound++; },
      beforeSourceBind: () => { sources++; }, rules: { validate: { old: () => { calls++; return "Old issue"; }, next: () => { calls++; return "New issue"; } } } });
    const input = root.querySelector("input")!; form.bind(ids[0]); h.edit(input, "Draft A"); form.bind(ids[1]); h.edit(input, "Draft B");
    input.focus(); input.setSelectionRange(2, 4);
    input.setAttribute("data-validate", '[["next"],["next"]]');
    const before = root.innerHTML, snapshot = rows.entries(), oldCounts = [calls, parses, bound, sources];
    form.rescan();
    const retained = { same: root.innerHTML === before && snapshot === rows.entries(), counts: [calls, parses, bound, sources], focused: document.activeElement === input,
      caret: [input.selectionStart, input.selectionEnd], shown: input.value, error: root.querySelector("output")!.textContent, defaults: form.defaults() };
    const checked = form.validate(); form.bind(ids[0]); const other = input.value;
    return { retained, oldCounts, checked: checked.issues.map(issue => [issue.rowId, issue.field, issue.rule, issue.message]), other,
      raw: rows.entries().map(row => row.value.name), changes: rows.changes().length };
  });
  expect(result.retained).toEqual({ same: true, counts: result.oldCounts, focused: true, caret: [2, 4], shown: "Draft B", error: "Old issue", defaults: { name: "Capture" } });
  expect(result.checked).toEqual([[2, "name", "next", "New issue"], [2, "name", "next", "New issue"], [1, "name", "next", "New issue"], [1, "name", "next", "New issue"]]);
  expect(result.other).toBe("Draft A"); expect(result.raw).toEqual(["Ada", "Bea"]); expect(result.changes).toBe(0);
});

test("first local formatter addition and removal retain current raw and original static children without a rescan write", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<input data-field="amount" value="1200"><span data-field="note"><b>alpha</b></span>');
    const input = root.querySelector("input")!, span = root.querySelector("span")!, child = span.firstChild;
    let calls = 0; const form = h.api.bindForm(root, { rules: { format: { mark: value => { calls++; return "$" + value; } } } });
    h.edit(input, "2400"); input.setAttribute("data-format", '[["mark"]]'); span.setAttribute("data-format", '[["upper"]]'); form.rescan();
    const added = { value: input.value, sameChild: child === span.firstChild, raw: form.read(), calls, defaults: form.defaults() };
    form.refresh(["amount", "note"]); const projected = [input.value, span.textContent];
    input.removeAttribute("data-format"); span.removeAttribute("data-format"); form.rescan();
    const removed = { shown: [input.value, span.textContent], raw: form.read(), calls };
    form.refresh(["amount", "note"]); const raw = [input.value, span.textContent]; form.dispose();
    return { added, projected, removed, raw, restored: child === span.firstChild, input: input.value };
  });
  expect(result).toEqual({ added: { value: "2400", sameChild: true, raw: { amount: "2400", note: "alpha" }, calls: 0, defaults: { amount: "1200" } },
    projected: ["$2400", "ALPHA"], removed: { shown: ["$2400", "ALPHA"], raw: { amount: "2400", note: "alpha" }, calls: 1 },
    raw: ["2400", "alpha"], restored: true, input: "2400" });
});

test("typed kind precedence adopts empty undefined and HTML fallback while outer maps and custom functions stay captured", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<input data-field="name" value="Ada" data-format=\'[["upper"]]\' data-validate="not-json">');
    const fields: NonNullable<RuleSet["fields"]> = { name: { format: [], validate: [] } }, formats = { label: (value: string) => "old:" + value };
    const rules: RuleSet = { fields, format: formats }, form = h.api.bindForm(root, { rules }); const input = root.querySelector("input")!;
    fields.name = { format: [["label"]], validate: [] }; formats.label = value => "new:" + value;
    rules.fields = { name: { format: [["lower"]], validate: [["required"]] } }; form.rescan(); form.refresh(["name"]); const captured = input.value;
    fields.name = { format: undefined, validate: [] }; form.rescan(); const before = input.value; form.refresh(["name"]); const html = input.value;
    fields.name = { validate: undefined }; const malformed = h.error(() => form.rescan())?.code; const old = form.validate().valid;
    input.setAttribute("data-validate", '[["required"]]'); form.rescan(); h.edit(input, ""); const adopted = form.validate();
    return { captured, before, html, malformed, old, valid: adopted.valid, rules: adopted.issues.map(issue => issue.rule) };
  });
  expect(result).toEqual({ captured: "old:Ada", before: "old:Ada", html: "ADA", malformed: "RULE_DECLARATION", old: true, valid: false, rules: ["required"] });
});

test("a malformed unused typed field rejects the complete candidate and leaves the prior policy retryable", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<input data-field="name" value="Ada">');
    const fields: NonNullable<RuleSet["fields"]> = { name: { validate: [["old"]] } };
    const form = h.api.bindForm(root, { rules: { fields, validate: { old: () => "Old", next: () => "Next" } } });
    fields.name = { validate: [["next"]] }; fields.unmounted = { validate: [["unknown"]] };
    const error = h.error(() => form.rescan())?.code, retained = form.validate().issues[0].message;
    delete fields.unmounted; form.rescan(); return { error, retained, next: form.validate().issues[0].message };
  });
  expect(result).toEqual({ error: "RULE_UNKNOWN", retained: "Old", next: "Next" });
});

test("inconsistent radio HTML rules fail atomically and a corrected group keeps its current selection", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<input type="radio" name="pick" data-field="choice" value="a" checked><input type="radio" name="pick" data-field="choice" value="b">');
    const form = h.api.bindForm(root), inputs = [...root.querySelectorAll("input")]; inputs[0].setAttribute("data-validate", '[["required"]]');
    inputs[1].setAttribute("data-validate", '[["email"]]'); const failed = h.error(() => form.rescan())?.code, old = form.validate().valid;
    inputs[1].setAttribute("data-validate", '[["required"]]'); form.rescan();
    return { failed, old, selection: inputs.map(input => input.checked), valid: form.validate().valid, defaults: form.defaults() };
  });
  expect(result).toEqual({ failed: "FORM_GROUP_RULES", old: true, selection: [true, false], valid: true, defaults: { choice: "a" } });
});

test("formatter and display renderer conflicts leave the old validation and static DOM untouched", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<span data-field="note"><b>Ada</b></span>'); const fields: NonNullable<RuleSet["fields"]> = {};
    let renders = 0; const form = h.api.bindForm(root, { rules: { fields }, render: { note: value => { renders++; return "shown:" + value; } } });
    const before = root.innerHTML, count = renders; fields.note = { format: [["upper"]], validate: [["email"]] };
    const failed = h.error(() => form.rescan())?.code, atomic = before === root.innerHTML, retained = form.validate().valid;
    fields.note = { validate: [["email"]] }; form.rescan(); const next = form.validate().valid;
    return { failed, atomic, retained, next, unchanged: before === root.innerHTML, renders, count };
  });
  expect(result.failed).toBe("UI_RENDER"); expect(result.atomic).toBe(true); expect(result.retained).toBe(true); expect(result.next).toBe(false);
  expect(result.unchanged).toBe(false); expect(result.renders).toBe(result.count);
});

test("a declaration getter changing Rows cannot publish or read later declaration getters", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<input data-field="name" value="Capture">'), rows = h.api.createRows([{ name: "Ada" }]), id = rows.entries()[0].id;
    const fields: NonNullable<RuleSet["fields"]> = { name: { validate: [["old"]] } };
    const form = h.api.bindForm(root, { rows, rules: { fields, validate: { old: () => "Old", next: () => "Next" } } }); form.bind(id);
    let later = 0; Object.defineProperty(fields, "name", { configurable: true, enumerable: true, get() { rows.set(id, "name", "Newer"); return { validate: [["next"]] }; } });
    Object.defineProperty(fields, "later", { configurable: true, enumerable: true, get() { later++; return {}; } });
    const error = h.error(() => form.rescan())?.code;
    Object.defineProperty(fields, "name", { configurable: true, enumerable: true, value: { validate: [["next"]] } }); delete fields.later;
    const old = form.validate().issues[0].message; form.rescan();
    return { error, later, old, next: form.validate().issues[0].message, raw: rows.get(id)!.value.name };
  });
  expect(result).toEqual({ error: "FORM_RESCAN", later: 0, old: "Old", next: "Next", raw: "Newer" });
});

test("disposal inside a declaration getter stops later reads without restoring ownership or rewriting the view", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<input data-field="name" value="Ada">'), fields: NonNullable<RuleSet["fields"]> = {};
    const form = h.api.bindForm(root, { rules: { fields } }); let later = 0;
    Object.defineProperty(fields, "name", { enumerable: true, get() { form.dispose(); return { format: [["upper"]] }; } });
    Object.defineProperty(fields, "later", { enumerable: true, get() { later++; return {}; } });
    const error = h.error(() => form.rescan()), closed = h.error(() => form.read())?.code;
    const replacement = h.api.bindForm(root); const raw = replacement.read(); replacement.dispose();
    return { error, closed, later, raw, shown: root.querySelector("input")!.value };
  });
  expect(result).toEqual({ error: null, closed: "FORM_DISPOSED", later: 0, raw: { name: "Ada" }, shown: "Ada" });
});

test("unchanged HTML nested arguments keep the accepted object identity across unrelated rescan", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<input data-field="name" value="Ada" data-validate=\'[["check",{"minimum":2}]]\'>');
    const seen: unknown[] = []; const form = h.api.bindForm(root, { rules: { validate: { check: (_value, args) => { seen.push(args[0]); return true; } } } });
    form.validate(); form.rescan(); form.validate(); root.querySelector("input")!.setAttribute("data-validate", '[["check",{"minimum":3}]]');
    form.rescan(); form.validate(); return { same: seen[0] === seen[1], changed: seen[1] !== seen[2], values: seen };
  });
  expect(result).toEqual({ same: true, changed: true, values: [{ minimum: 2 }, { minimum: 2 }, { minimum: 3 }] });
});

test("rule-only adoption keeps a restored local Form paused until explicit full refresh", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<input data-field="name" value="Ada">'), form = h.api.bindForm(root); const input = root.querySelector("input")!;
    form.unbind(); input.setAttribute("data-format", '[["upper"]]'); input.setAttribute("data-validate", '[["email"]]'); form.rescan();
    h.edit(input, "quiet"); input.blur(); const paused = { value: input.value, invalid: input.getAttribute("aria-invalid") };
    form.refresh(["name"]); const selected = input.value; h.edit(input, "still quiet"); const still = input.value;
    form.refresh(); h.edit(input, "bad"); return { paused, selected, still, invalid: input.getAttribute("aria-invalid"), value: input.value };
  });
  expect(result).toEqual({ paused: { value: "quiet", invalid: null }, selected: "QUIET", still: "still quiet", invalid: "true", value: "bad" });
});

test("generated choice groups adopt validators while retaining inputs selection focus known issues and authored captures", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<fieldset data-field="role"><legend>Role</legend><template data-choice-template><label><input type="radio"><span data-choice-label></span></label></template></fieldset><output data-error-for="role"></output>');
    const groupRoot = root.querySelector("fieldset")!, group = h.api.bindChoiceGroup(groupRoot, { choices: [{ value: "a", label: "First" }, { value: "b", label: "Second" }], value: "a" });
    const fields: NonNullable<RuleSet["fields"]> = { role: { validate: [["old"]] } }; let calls = 0;
    const form = h.api.bindForm(root, { rules: { fields, validate: { old: () => { calls++; return "Old group"; }, next: () => { calls++; return "Next group"; } } } });
    form.validate(); const inputs = [...root.querySelectorAll("input")], first = inputs[0]; first.focus();
    const id = root.querySelector("output")!.id, count = calls, before = root.innerHTML, defaults = form.defaults();
    fields.role = { validate: [["next"]] }; form.rescan();
    const retained = { unchanged: before === root.innerHTML, calls: calls === count, sameInputs: inputs.every((input, index) => input === root.querySelectorAll("input")[index]),
      focused: document.activeElement === first, selection: group.value(), id: root.querySelector("output")!.id === id, defaults: form.defaults(), message: root.querySelector("output")!.textContent };
    const next = form.validate().issues[0].message; form.dispose(); group.dispose();
    return { retained, defaults, next };
  });
  expect(result).toEqual({ retained: { unchanged: true, calls: true, sameInputs: true, focused: true, selection: "a", id: true, defaults: result.defaults, message: "Old group" }, defaults: { role: "a" }, next: "Next group" });
});

test("a choice catalog cannot cross an unadopted HTML rule change and rescan explicitly admits it without losing selection", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rulesForm, root = h.root('<fieldset data-field="role" data-validate=\'[["old"]]\'><legend>Role</legend><template data-choice-template><label><input type="radio"><span data-choice-label></span></label></template></fieldset><output data-error-for="role"></output>');
    const fieldset = root.querySelector("fieldset")!, group = h.api.bindChoiceGroup(fieldset, { choices: [{ value: "a", label: "First" }], value: "a" });
    const form = h.api.bindForm(root, { rules: { validate: { old: () => "Old group", next: () => "Next group" } } });
    form.validate(); const first = fieldset.querySelector("input"), old = root.querySelector("output")!.textContent;
    fieldset.setAttribute("data-validate", '[["next"]]');
    const failed = h.error(() => group.setChoices([{ value: "a", label: "First updated" }, { value: "b", label: "Second" }]))?.code;
    const preserved = fieldset.querySelector("input") === first && root.querySelector("output")!.textContent === old;
    form.rescan(); const adopted = { value: group.value(), message: root.querySelector("output")!.textContent };
    group.setChoices([{ value: "a", label: "First updated" }, { value: "b", label: "Second" }]);
    const next = form.validate().issues[0].message, selected = group.value(); form.dispose(); group.dispose();
    return { failed, preserved, adopted, next, selected };
  });
  expect(result).toEqual({ failed: "FORM_CHOICE_GROUP", preserved: true, adopted: { value: "a", message: "Old group" }, next: "Next group", selected: "a" });
});
