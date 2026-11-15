# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: form-deleted-preview.spec.ts >> trusted preview reset restores exact current projection and typed occurrences without hooks Rows writes or default recapture
- Location: tests\browser\form-deleted-preview.spec.ts:75:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

@@ -32,11 +32,11 @@
      "sameOption": true,
      "tags": Array [
        "b",
      ],
    },
-   "synthetic": "Temporary",
+   "synthetic": "Native",
    "transient": Object {
      "amount": "100",
      "name": "Native",
      "selected": "Choose",
      "tags": Array [
```

# Page snapshot

```yaml
- main [ref=e2]:
  - heading "Natural-JS 2.0 import smoke" [level=1] [ref=e3]
  - paragraph [ref=e4]:
    - link "Grid contract demo" [ref=e5] [cursor=pointer]:
      - /url: /m10/demo.html
    - text: ·
    - link "Choice-group CVC demo" [ref=e6] [cursor=pointer]:
      - /url: /m5/choices.html
    - text: ·
    - link "Tree and DatePicker CVC demo" [ref=e7] [cursor=pointer]:
      - /url: /m11/side.html
    - text: ·
    - link "Application shell demo" [ref=e8] [cursor=pointer]:
      - /url: /m12/side.html
  - generic [ref=e9]:
    - heading "First authored view" [level=2] [ref=e10]
    - button "Check import" [ref=e11]
    - status [ref=e12]: ESM ready
  - generic [ref=e13]:
    - heading "Second authored view" [level=2] [ref=e14]
    - button "Check import" [ref=e15]
    - status [ref=e16]: ESM ready
```

# Test source

```ts
  1   | // SPDX-License-Identifier: Apache-2.0
  2   | import { fileURLToPath } from "node:url";
  3   | import { expect, test } from "@playwright/test";
  4   | import type { bindForm } from "../../src/ui/form.js";
  5   | import type { bindChoiceGroup } from "../../src/ui/choice-group.js";
  6   | import type { createRows } from "../../src/data/index.js";
  7   | 
  8   | declare global {
  9   |   interface Window {
  10  |     deletedForm: {
  11  |       api: { bindForm: typeof bindForm; bindChoiceGroup: typeof bindChoiceGroup; createRows: typeof createRows };
  12  |       root(html: string): HTMLFormElement;
  13  |       field<E extends HTMLElement = HTMLInputElement>(root: ParentNode, name: string): E;
  14  |       failure(run: () => unknown): { code: string; phase: string | null } | null;
  15  |     };
  16  |   }
  17  | }
  18  | const source = (file: string) => "/@fs/" + fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/");
  19  | const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };
  20  | test.beforeEach(async ({ page }) => {
  21  |   await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  22  |   await page.evaluate(async modules => {
  23  |     const [{ bindForm, bindChoiceGroup }, { createRows }] = await Promise.all([import(modules.ui), import(modules.data)]);
  24  |     window.deletedForm = {
  25  |       api: { bindForm, bindChoiceGroup, createRows },
  26  |       root(html) { const root = document.createElement("form"); root.setAttribute("aria-label", "Record details"); root.innerHTML = html; document.body.append(root); return root; },
  27  |       field(root, name) { return root.querySelector('[data-field="' + name + '"]')! as never; },
  28  |       failure(run) { try { run(); return null; } catch (cause) { const error = cause as { code?: string; detail?: { phase?: string } };
  29  |         return { code: error.code ?? "unknown", phase: error.detail?.phase ?? null }; } }
  30  |     };
  31  |   }, modules);
  32  | });
  33  | 
  34  | test("loaded deletion retains current rendered detail with accessible native locks and restores authored state on disposal", async ({ page }) => {
  35  |   const result = await page.evaluate(() => {
  36  |     const h = window.deletedForm, root = h.root('<label>Name <input data-field="name" value="Captured" required></label><output data-error-for="name"></output><label>Amount <input data-field="amount" value="100"></label>' +
  37  |       '<label>Choice <select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"><option value="">Choose</option></select></label><input disabled data-field="locked" value="Locked"><section data-field="rich"><b>Authored</b></section>');
  38  |     root.dataset.rowStatus = "authored"; const authoredChild = root.querySelector("b");
  39  |     const rows = h.api.createRows([{ name: "Ada", amount: 1200, choice: 22, choices: [{ label: "Twenty-two", value: 22 }], locked: "L", rich: "Current" }]), id = rows.entries()[0].id;
  40  |     let renders = 0, bindings = 0; const form = h.api.bindForm(root, { rows, beforeBindValue(value) { bindings++; return value; }, rules: { fields: { amount: { format: [["commas"]] } } }, render: {
  41  |       rich(value) { renders++; const node = document.createElement("em"); node.textContent = String(value); return node; }
  42  |     } }); form.bind(id); rows.set(id, "name", "Edith"); rows.set(id, "amount", 2400); h.field(root, "name").focus(); rows.remove(id);
  43  |     const afterDelete = { status: root.getAttribute("data-row-status"), raw: form.read(), name: h.field(root, "name").value, amount: h.field(root, "amount").value,
  44  |       label: h.field<HTMLSelectElement>(root, "choice").selectedOptions[0].textContent, rich: root.querySelector("em")!.textContent,
  45  |       disabled: [...root.querySelectorAll("input,select")].every(input => (input as HTMLInputElement).disabled), inert: root.hasAttribute("inert"), focused: document.activeElement === root,
  46  |       tabIndex: root.getAttribute("tabindex"), prepare: h.failure(() => form.prepare()), valid: form.validate().valid };
  47  |     const snapshot = rows.get(id), before = { renders, bindings }; let events = 0; const stop = rows.subscribe(() => events++);
  48  |     const input = h.field(root, "name"); input.value = "Attempt"; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); input.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  49  |     const noEdit = snapshot === rows.get(id) && rows.get(id)!.value.name === "Edith" && events === 0 && renders === before.renders && bindings === before.bindings;
  50  |     const deletionPayload = rows.changes()[0].value.name, ids = [...document.querySelectorAll("[id]")].map(element => element.id);
  51  |     stop(); form.dispose(); const restored = { marker: root.getAttribute("data-row-status"), tabIndex: root.getAttribute("tabindex"), disabled: [...root.querySelectorAll("input,select")].map(input => (input as HTMLInputElement).disabled), authoredChild: root.querySelector("b") === authoredChild };
  52  |     rows.dispose(); root.remove(); return { afterDelete, noEdit, deletionPayload, uniqueIds: new Set(ids).size === ids.length, restored };
  53  |   });
  54  |   expect(result).toEqual({ afterDelete: { status: "delete", raw: { name: "Edith", amount: 2400, choice: 22, locked: "L", rich: "Current" }, name: "Edith", amount: "2,400", label: "Twenty-two", rich: "Current",
  55  |     disabled: true, inert: false, focused: true, tabIndex: "-1", prepare: { code: "FORM_PREPARE", phase: "preview" }, valid: true }, noEdit: true, deletionPayload: "Ada", uniqueIds: true,
  56  |     restored: { marker: "authored", tabIndex: null, disabled: [false, false, false, true], authoredChild: true } });
  57  | });
  58  | 
  59  | test("explicit received-delete binding stays read-only through complete restore and received revert", async ({ page }) => {
  60  |   const result = await page.evaluate(() => {
  61  |     const h = window.deletedForm, root = h.root('<input data-field="name" value="Captured" required>'), rows = h.api.createRows<{ name: string }>();
  62  |     rows.replaceState([{ value: { name: "Received deletion" }, status: "delete" }]); const id = rows.entries({ includeDeleted: true })[0].id, original = rows.original(id);
  63  |     const form = h.api.bindForm(root, { rows }); form.bind(id); const first = { name: h.field(root, "name").value, disabled: h.field(root, "name").disabled, defaults: form.defaults() };
  64  |     const explicit = h.failure(() => form.validate(id)); rows.restore(id, { name: "Retained display" });
  65  |     const changed = { read: form.read(), status: rows.get(id)!.status, disabled: h.field(root, "name").disabled, original: rows.original(id) === original, payload: rows.changes()[0].value.name };
  66  |     rows.revert(id); const reverted = { value: h.field(root, "name").value, status: rows.get(id)!.status, valid: form.validate().valid };
  67  |     form.bind(null); const retired = { disabled: h.field(root, "name").disabled, marker: root.getAttribute("data-row-status") };
  68  |     form.dispose(); rows.dispose(); root.remove(); return { first, explicit, changed, reverted, retired };
  69  |   });
  70  |   expect(result).toEqual({ first: { name: "Received deletion", disabled: true, defaults: { name: "Captured" } }, explicit: { code: "ROW_MISSING", phase: null },
  71  |     changed: { read: { name: "Retained display" }, status: "delete", disabled: true, original: true, payload: "Received deletion" },
  72  |     reverted: { value: "Received deletion", status: "delete", valid: true }, retired: { disabled: false, marker: null } });
  73  | });
  74  | 
  75  | test("trusted preview reset restores exact current projection and typed occurrences without hooks Rows writes or default recapture", async ({ page }) => {
  76  |   const result = await page.evaluate(async () => {
  77  |     const h = window.deletedForm, root = h.root('<input data-field="name" value="Native"><input data-field="amount" value="100"><select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"><option value="" selected>Choose</option></select>' +
  78  |       '<fieldset data-field="tags"><legend>Tags</legend><template data-choice-template><label><input type="checkbox"><span data-choice-label></span></label></template></fieldset>');
  79  |     const group = h.api.bindChoiceGroup(root.querySelector("fieldset")!, { choices: ["a", "b"].map(value => ({ label: value, value })), value: ["a"] });
  80  |     const rows = h.api.createRows([{ name: "Edith", amount: 1200, choice: 1, choices: [{ label: "Number", value: 1 }, { label: "String", value: "1" }], tags: ["b"] }]), id = rows.entries()[0].id;
  81  |     let formats = 0, values = 0, whole = 0; const form = h.api.bindForm(root, { rows, beforeBind() { whole++; }, onBind() { whole++; }, beforeBindValue(value) { values++; return value; },
  82  |       rules: { fields: { name: { format: [["prefix"]] }, amount: { format: [["commas"]] } }, format: { prefix: value => { formats++; return "Label:" + value; } } } });
  83  |     form.bind(id); rows.remove(id); const input = h.field(root, "name"), select = h.field<HTMLSelectElement>(root, "choice"), selected = select.selectedOptions[0], before = { formats, values, whole }, snapshot = rows.get(id);
  84  |     let events = 0, inside: unknown; const stop = rows.subscribe(() => events++);
  85  |     root.addEventListener("reset", () => { inside = { read: form.read(), prepare: h.failure(() => form.prepare()) }; }, { once: true }); root.reset();
  86  |     const transient = { name: input.value, amount: h.field(root, "amount").value, selected: select.selectedOptions[0].textContent, tags: group.value() };
  87  |     await new Promise<void>(resolve => setTimeout(resolve, 0));
  88  |     const restored = { name: input.value, amount: h.field(root, "amount").value, sameOption: select.selectedOptions[0] === selected, tags: group.value(), locks: [...root.querySelectorAll("input,select")].every(element => (element as HTMLInputElement).disabled) };
  89  |     const noWork = snapshot === rows.get(id) && events === 0 && formats === before.formats && values === before.values && whole === before.whole;
  90  |     input.value = "Temporary"; const cancel = (event: Event) => event.preventDefault(); root.addEventListener("reset", cancel); root.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0)); const canceled = input.value;
  91  |     root.removeEventListener("reset", cancel); root.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true })); await new Promise<void>(resolve => setTimeout(resolve, 0)); const synthetic = input.value;
  92  |     const defaults = { name: input.defaultValue, amount: h.field(root, "amount").defaultValue, selected: [...select.options].filter(option => option.defaultSelected).map(option => option.textContent), tags: [...root.querySelectorAll<HTMLInputElement>('fieldset input')].filter(input => input.defaultChecked).map(input => input.value) };
  93  |     stop(); form.dispose(); group.dispose(); rows.dispose(); root.remove(); return { inside, transient, restored, noWork, canceled, synthetic, defaults };
  94  |   });
> 95  |   expect(result).toEqual({ inside: { read: { name: "Edith", amount: 1200, choice: 1, tags: ["b"] }, prepare: { code: "FORM_PREPARE", phase: "preview" } },
      |                  ^ Error: expect(received).toEqual(expected) // deep equality
  96  |     transient: { name: "Native", amount: "100", selected: "Choose", tags: ["a"] },
  97  |     restored: { name: "Label:Edith", amount: "1,200", sameOption: true, tags: ["b"], locks: true }, noWork: true, canceled: "Temporary", synthetic: "Temporary",
  98  |     defaults: { name: "Native", amount: "100", selected: ["Choose"], tags: ["a"] } });
  99  | });
  100 | 
  101 | test("queued preview reset never repaints a newer binding unbind disposal or revived source", async ({ page }) => {
  102 |   const result = await page.evaluate(async () => {
  103 |     const h = window.deletedForm, results: unknown[] = [];
  104 |     for (const mode of ["bind", "unbind", "dispose", "revive"]) {
  105 |       const root = h.root('<input data-field="name" value="Captured">'), rows = h.api.createRows([{ name: "Old" }, { name: "New" }]), ids = rows.entries().map(row => row.id), form = h.api.bindForm(root, { rows });
  106 |       form.bind(ids[0]); rows.remove(ids[0]); root.reset();
  107 |       if (mode === "bind") form.bind(ids[1]); if (mode === "unbind") form.unbind(); if (mode === "dispose") form.dispose(); if (mode === "revive") rows.restore(ids[0], { name: "Revived" });
  108 |       const input = h.field(root, "name"), before = { value: input.value, disabled: input.disabled, marker: root.getAttribute("data-row-status") };
  109 |       await new Promise<void>(resolve => setTimeout(resolve, 0)); results.push({ mode, before, after: { value: input.value, disabled: input.disabled, marker: root.getAttribute("data-row-status") } });
  110 |       form.dispose(); rows.dispose(); root.remove();
  111 |     }
  112 |     return results;
  113 |   });
  114 |   const states = { bind: "New", unbind: "Captured", dispose: "Captured", revive: "Revived" };
  115 |   expect(result).toEqual(Object.entries(states).map(([mode, value]) => ({ mode, before: { value, disabled: false, marker: null }, after: { value, disabled: false, marker: null } })));
  116 | });
  117 | 
  118 | test("preview catalogs and rediscovery share native locks restoration captures and rollback without a second field owner", async ({ page }) => {
  119 |   const result = await page.evaluate(async () => {
  120 |     const h = window.deletedForm, root = h.root('<input data-field="name" value="Capture"><fieldset data-field="tags"><legend>Tags</legend><template data-choice-template><label><input type="checkbox"><span data-choice-label></span></label></template></fieldset>');
  121 |     const fieldset = root.querySelector("fieldset")!, choices = ["a", "b"].map(value => ({ label: value, value })), group = h.api.bindChoiceGroup(fieldset, { choices });
  122 |     const rows = h.api.createRows([{ name: "Old", tags: ["b"], late: "Source late" }]), id = rows.entries()[0].id, form = h.api.bindForm(root, { rows }); form.bind(id); rows.remove(id);
  123 |     root.reset(); const pending = h.failure(() => group.setChoices(choices)); await new Promise<void>(resolve => setTimeout(resolve, 0));
  124 |     const old = [...fieldset.querySelectorAll("input")]; group.setChoices([...choices, { label: "C", value: "c" }]); const current = [...fieldset.querySelectorAll("input")];
  125 |     const insert = fieldset.insertBefore, failure = new Error("Preview insertion"); fieldset.insertBefore = () => { throw failure; }; let originalFailure = false;
  126 |     try { group.setChoices([{ label: "D", value: "d" }]); } catch (cause) { originalFailure = cause === failure; } fieldset.insertBefore = insert;
  127 |     const rollback = current.every((input, index) => fieldset.querySelectorAll("input")[index] === input && input.disabled);
  128 |     const late = document.createElement("input"); late.dataset.field = "late"; late.value = "Captured late"; root.append(late); form.rescan(); const lockedOnAdopt = late.disabled; form.refresh(["late"]); const shown = late.value;
  129 |     const captured = form.defaults(); late.remove(); form.rescan(); const releasedLate = !late.disabled;
  130 |     root.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0)); const afterReset = group.value();
  131 |     rows.restore(id, rows.original(id)!); const revived = current.every(input => !input.disabled) && !h.field(root, "name").disabled && !root.hasAttribute("data-row-status");
  132 |     const result = { pending: pending?.code, retiredReleased: old.every(input => !input.disabled), originalFailure, rollback, lockedOnAdopt, shown, capturedLate: captured.late, releasedLate, afterReset, revived };
  133 |     form.dispose(); group.dispose(); rows.dispose(); root.remove(); return result;
  134 |   });
  135 |   expect(result).toEqual({ pending: "FORM_CHOICE_GROUP", retiredReleased: true, originalFailure: true, rollback: true, lockedOnAdopt: true, shown: "Source late", capturedLate: "Captured late", releasedLate: true, afterReset: ["b"], revived: true });
  136 | });
  137 | 
  138 | test("failed preview formatting retains locks and recovery never steals unrelated focus", async ({ page }) => {
  139 |   const result = await page.evaluate(() => {
  140 |     const h = window.deletedForm, root = h.root('<input data-field="name" value="Captured">'), rows = h.api.createRows([{ name: "Ada" }]), id = rows.entries()[0].id;
  141 |     let fail = false; const form = h.api.bindForm(root, { rows, rules: { fields: { name: { format: [["label"]] } }, format: { label(value) { if (fail) throw new Error("Format failed"); return "Label:" + value; } } } }); form.bind(id);
  142 |     const outside = document.createElement("button"); outside.type = "button"; outside.textContent = "Other action"; document.body.append(outside); outside.focus(); rows.remove(id); fail = true;
  143 |     const error = h.failure(() => form.bind(id)), lockedAfterFailure = h.field(root, "name").disabled, deleted = rows.get(id)!.status;
  144 |     fail = false; form.refresh(); const recovered = { value: h.field(root, "name").value, locked: h.field(root, "name").disabled, focused: document.activeElement === outside, prepare: h.failure(() => form.prepare()) };
  145 |     form.dispose(); const released = !h.field(root, "name").disabled && !root.hasAttribute("data-row-status"); rows.dispose(); root.remove(); outside.remove(); return { error: error?.code, lockedAfterFailure, deleted, recovered, released };
  146 |   });
  147 |   expect(result).toEqual({ error: "RULE_FAILED", lockedAfterFailure: true, deleted: "delete", recovered: { value: "Label:Ada", locked: true, focused: true, prepare: { code: "FORM_PREPARE", phase: "preview" } }, released: true });
  148 | });
  149 | 
  150 | test("default preview validation retains other live-row drafts without validating them as disabled preview fields", async ({ page }) => {
  151 |   const result = await page.evaluate(() => {
  152 |     const h = window.deletedForm, root = h.root('<input data-field="name" required><output data-error-for="name"></output>'), rows = h.api.createRows([{ name: "Ada" }, { name: "Bea" }]), ids = rows.entries().map(row => row.id), form = h.api.bindForm(root, { rows });
  153 |     form.bind(ids[1]); const input = h.field(root, "name"); input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true })); form.bind(ids[0]); rows.remove(ids[0]);
  154 |     const before = rows.entries({ includeDeleted: true }), checked = form.validate(); const preview = { value: input.value, locked: input.disabled, marker: root.getAttribute("data-row-status") };
  155 |     form.bind(ids[1]); const restoredDraft = { value: input.value, locked: input.disabled, invalid: input.getAttribute("aria-invalid"), error: root.querySelector("output")!.textContent !== "" };
  156 |     const result = { valid: checked.valid, issues: checked.issues.map(issue => ({ id: issue.rowId, field: issue.field })), expectedId: ids[1], preview, restoredDraft, unchanged: before === rows.entries({ includeDeleted: true }), raw: rows.get(ids[1])!.value.name };
  157 |     form.dispose(); rows.dispose(); root.remove(); return result;
  158 |   });
  159 |   expect(result).toEqual({ valid: false, issues: [{ id: result.expectedId, field: "name" }], expectedId: result.expectedId, preview: { value: "Ada", locked: true, marker: "delete" },
  160 |     restoredDraft: { value: "", locked: false, invalid: "true", error: true }, unchanged: true, raw: "Bea" });
  161 | });
  162 | 
  163 | test("physical inserted-row removal remains distinct from loaded preview and explicit unbind restores capture", async ({ page }) => {
  164 |   const result = await page.evaluate(() => {
  165 |     const h = window.deletedForm, root = h.root('<input data-field="name" value="Captured">'), rows = h.api.createRows<{ name: string }>(), id = rows.add({ name: "Inserted" }), form = h.api.bindForm(root, { rows }); form.bind(id); rows.remove(id);
  166 |     const missing = rows.get(id) === undefined, noPreview = !h.field(root, "name").disabled && !root.hasAttribute("data-row-status"), unavailable = h.failure(() => form.bind(id)); form.unbind();
  167 |     const result = { missing, noPreview, unavailable: unavailable?.code, restored: h.field(root, "name").value, defaults: form.defaults() }; form.dispose(); rows.dispose(); root.remove(); return result;
  168 |   });
  169 |   expect(result).toEqual({ missing: true, noPreview: true, unavailable: "ROW_MISSING", restored: "Captured", defaults: { name: "Captured" } });
  170 | });
  171 | 
  172 | test("disposal from adopted preview focus cannot resurrect native reset listeners after rediscovery", async ({ page }) => {
  173 |   const result = await page.evaluate(async () => {
  174 |     const h = window.deletedForm, root = h.root('<input data-field="name" value="Captured">'), rows = h.api.createRows([{ name: "Ada", late: "Source" }]), id = rows.entries()[0].id;
  175 |     const resetListeners = new Set<EventListenerOrEventListenerObject>(), add = root.addEventListener.bind(root), remove = root.removeEventListener.bind(root);
  176 |     root.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
  177 |       if (type === "reset") resetListeners.add(listener); add(type, listener, options);
  178 |     }) as typeof root.addEventListener;
  179 |     root.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
  180 |       if (type === "reset") resetListeners.delete(listener); remove(type, listener, options);
  181 |     }) as typeof root.removeEventListener;
  182 |     const form = h.api.bindForm(root, { rows }); form.bind(id); rows.remove(id); const before = resetListeners.size, snapshot = rows.get(id);
  183 |     const late = document.createElement("input"); late.dataset.field = "late"; late.value = "Late"; root.append(late); late.focus(); let disposedOnFocus = 0;
  184 |     root.addEventListener("focus", () => { disposedOnFocus++; form.dispose(); }, { once: true });
  185 |     const rescan = h.failure(() => form.rescan()), after = resetListeners.size, disposed = h.failure(() => form.prepare());
  186 |     root.reset(); const native = late.value; await new Promise<void>(resolve => setTimeout(resolve, 0));
  187 |     const result = { before, after, disposedOnFocus, rescan, disposed, locked: [...root.querySelectorAll("input")].some(input => input.disabled),
  188 |       marker: root.getAttribute("data-row-status"), native, settled: late.value, sourceUnchanged: snapshot === rows.get(id), afterReset: resetListeners.size };
  189 |     form.dispose(); rows.dispose(); root.remove(); return result;
  190 |   });
  191 |   expect(result).toEqual({ before: 1, after: 0, disposedOnFocus: 1, rescan: null, disposed: { code: "FORM_DISPOSED", phase: null }, locked: false,
  192 |     marker: null, native: "", settled: "", sourceUnchanged: true, afterReset: 0 });
  193 | });
  194 | 
  195 | test("loaded deletion inside an active value callback keeps committed deletion and native locks before an explicit refresh retry", async ({ page }) => {
```