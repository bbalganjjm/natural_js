// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { bindForm } from "../../src/ui/form.js";
import type { bindChoiceGroup } from "../../src/ui/choice-group.js";
import type { createRows } from "../../src/data/index.js";

declare global {
  interface Window {
    deletedForm: {
      api: { bindForm: typeof bindForm; bindChoiceGroup: typeof bindChoiceGroup; createRows: typeof createRows };
      root(html: string): HTMLFormElement;
      field<E extends HTMLElement = HTMLInputElement>(root: ParentNode, name: string): E;
      failure(run: () => unknown): { code: string; phase: string | null } | null;
    };
  }
}
const source = (file: string) => "/@fs/" + fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/");
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm, bindChoiceGroup }, { createRows }] = await Promise.all([import(modules.ui), import(modules.data)]);
    window.deletedForm = {
      api: { bindForm, bindChoiceGroup, createRows },
      root(html) { const root = document.createElement("form"); root.setAttribute("aria-label", "Record details"); root.innerHTML = html; document.body.append(root); return root; },
      field(root, name) { return root.querySelector('[data-field="' + name + '"]')! as never; },
      failure(run) { try { run(); return null; } catch (cause) { const error = cause as { code?: string; detail?: { phase?: string } };
        return { code: error.code ?? "unknown", phase: error.detail?.phase ?? null }; } }
    };
  }, modules);
});

test("loaded deletion retains current rendered detail with accessible native locks and restores authored state on disposal", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.deletedForm, root = h.root('<label>Name <input data-field="name" value="Captured" required></label><output data-error-for="name"></output><label>Amount <input data-field="amount" value="100"></label>' +
      '<label>Choice <select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"><option value="">Choose</option></select></label><input disabled data-field="locked" value="Locked"><section data-field="rich"><b>Authored</b></section>');
    root.dataset.rowStatus = "authored"; const authoredChild = root.querySelector("b");
    const rows = h.api.createRows([{ name: "Ada", amount: 1200, choice: 22, choices: [{ label: "Twenty-two", value: 22 }], locked: "L", rich: "Current" }]), id = rows.entries()[0].id;
    let renders = 0, bindings = 0; const form = h.api.bindForm(root, { rows, beforeBindValue(value) { bindings++; return value; }, rules: { fields: { amount: { format: [["commas"]] } } }, render: {
      rich(value) { renders++; const node = document.createElement("em"); node.textContent = String(value); return node; }
    } }); form.bind(id); rows.set(id, "name", "Edith"); rows.set(id, "amount", 2400); h.field(root, "name").focus(); rows.remove(id);
    const afterDelete = { status: root.getAttribute("data-row-status"), raw: form.read(), name: h.field(root, "name").value, amount: h.field(root, "amount").value,
      label: h.field<HTMLSelectElement>(root, "choice").selectedOptions[0].textContent, rich: root.querySelector("em")!.textContent,
      disabled: [...root.querySelectorAll("input,select")].every(input => (input as HTMLInputElement).disabled), inert: root.hasAttribute("inert"), focused: document.activeElement === root,
      tabIndex: root.getAttribute("tabindex"), prepare: h.failure(() => form.prepare()), valid: form.validate().valid };
    const snapshot = rows.get(id), before = { renders, bindings }; let events = 0; const stop = rows.subscribe(() => events++);
    const input = h.field(root, "name"); input.value = "Attempt"; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); input.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    const noEdit = snapshot === rows.get(id) && rows.get(id)!.value.name === "Edith" && events === 0 && renders === before.renders && bindings === before.bindings;
    const deletionPayload = rows.changes()[0].value.name, ids = [...document.querySelectorAll("[id]")].map(element => element.id);
    stop(); form.dispose(); const restored = { marker: root.getAttribute("data-row-status"), tabIndex: root.getAttribute("tabindex"), disabled: [...root.querySelectorAll("input,select")].map(input => (input as HTMLInputElement).disabled), authoredChild: root.querySelector("b") === authoredChild };
    rows.dispose(); root.remove(); return { afterDelete, noEdit, deletionPayload, uniqueIds: new Set(ids).size === ids.length, restored };
  });
  expect(result).toEqual({ afterDelete: { status: "delete", raw: { name: "Edith", amount: 2400, choice: 22, locked: "L", rich: "Current" }, name: "Edith", amount: "2,400", label: "Twenty-two", rich: "Current",
    disabled: true, inert: false, focused: true, tabIndex: "-1", prepare: { code: "FORM_PREPARE", phase: "preview" }, valid: true }, noEdit: true, deletionPayload: "Ada", uniqueIds: true,
    restored: { marker: "authored", tabIndex: null, disabled: [false, false, false, true], authoredChild: true } });
});

test("explicit received-delete binding stays read-only through complete restore and received revert", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.deletedForm, root = h.root('<input data-field="name" value="Captured" required>'), rows = h.api.createRows<{ name: string }>();
    rows.replaceState([{ value: { name: "Received deletion" }, status: "delete" }]); const id = rows.entries({ includeDeleted: true })[0].id, original = rows.original(id);
    const form = h.api.bindForm(root, { rows }); form.bind(id); const first = { name: h.field(root, "name").value, disabled: h.field(root, "name").disabled, defaults: form.defaults() };
    const explicit = h.failure(() => form.validate(id)); rows.restore(id, { name: "Retained display" });
    const changed = { read: form.read(), status: rows.get(id)!.status, disabled: h.field(root, "name").disabled, original: rows.original(id) === original, payload: rows.changes()[0].value.name };
    rows.revert(id); const reverted = { value: h.field(root, "name").value, status: rows.get(id)!.status, valid: form.validate().valid };
    form.bind(null); const retired = { disabled: h.field(root, "name").disabled, marker: root.getAttribute("data-row-status") };
    form.dispose(); rows.dispose(); root.remove(); return { first, explicit, changed, reverted, retired };
  });
  expect(result).toEqual({ first: { name: "Received deletion", disabled: true, defaults: { name: "Captured" } }, explicit: { code: "ROW_MISSING", phase: null },
    changed: { read: { name: "Retained display" }, status: "delete", disabled: true, original: true, payload: "Received deletion" },
    reverted: { value: "Received deletion", status: "delete", valid: true }, retired: { disabled: false, marker: null } });
});

test("trusted preview reset restores exact current projection and typed occurrences without hooks Rows writes or default recapture", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.deletedForm, root = h.root('<input data-field="name" value="Native"><input data-field="amount" value="100"><select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"><option value="" selected>Choose</option></select>' +
      '<fieldset data-field="tags"><legend>Tags</legend><template data-choice-template><label><input type="checkbox"><span data-choice-label></span></label></template></fieldset>');
    const group = h.api.bindChoiceGroup(root.querySelector("fieldset")!, { choices: ["a", "b"].map(value => ({ label: value, value })), value: ["a"] });
    const rows = h.api.createRows([{ name: "Edith", amount: 1200, choice: 1, choices: [{ label: "Number", value: 1 }, { label: "String", value: "1" }], tags: ["b"] }]), id = rows.entries()[0].id;
    let formats = 0, values = 0, whole = 0; const form = h.api.bindForm(root, { rows, beforeBind() { whole++; }, onBind() { whole++; }, beforeBindValue(value) { values++; return value; },
      rules: { fields: { name: { format: [["prefix"]] }, amount: { format: [["commas"]] } }, format: { prefix: value => { formats++; return "Label:" + value; } } } });
    form.bind(id); rows.remove(id); const input = h.field(root, "name"), select = h.field<HTMLSelectElement>(root, "choice"), selected = select.selectedOptions[0], before = { formats, values, whole }, snapshot = rows.get(id);
    let events = 0, inside: unknown; const stop = rows.subscribe(() => events++);
    root.addEventListener("reset", () => { inside = { read: form.read(), prepare: h.failure(() => form.prepare()) }; }, { once: true }); root.reset();
    const transient = { name: input.value, amount: h.field(root, "amount").value, selected: select.selectedOptions[0].textContent, tags: group.value() };
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    const restored = { name: input.value, amount: h.field(root, "amount").value, sameOption: select.selectedOptions[0] === selected, tags: group.value(), locks: [...root.querySelectorAll("input,select")].every(element => (element as HTMLInputElement).disabled) };
    const noWork = snapshot === rows.get(id) && events === 0 && formats === before.formats && values === before.values && whole === before.whole;
    input.value = "Temporary"; const cancel = (event: Event) => event.preventDefault(); root.addEventListener("reset", cancel); root.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0)); const canceled = input.value;
    root.removeEventListener("reset", cancel); const native = h.root('<input value="Native" disabled>'), nativeInput = native.querySelector("input")!; nativeInput.value = "Temporary";
    native.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true })); root.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true })); await new Promise<void>(resolve => setTimeout(resolve, 0));
    const synthetic = { value: input.value, native: nativeInput.value, raw: form.read(), quiet: snapshot === rows.get(id) && events === 0 && formats === before.formats && values === before.values && whole === before.whole && [...root.querySelectorAll("input,select")].every(element => (element as HTMLInputElement).disabled) };
    const defaults = { name: input.defaultValue, amount: h.field(root, "amount").defaultValue, selected: [...select.options].filter(option => option.defaultSelected).map(option => option.textContent), tags: [...root.querySelectorAll<HTMLInputElement>('fieldset input')].filter(input => input.defaultChecked).map(input => input.value) };
    stop(); form.dispose(); group.dispose(); rows.dispose(); root.remove(); native.remove(); return { inside, transient, restored, noWork, canceled, synthetic, defaults };
  });
  expect(result).toEqual({ inside: { read: { name: "Edith", amount: 1200, choice: 1, tags: ["b"] }, prepare: { code: "FORM_PREPARE", phase: "preview" } },
    transient: { name: "Native", amount: "100", selected: "Choose", tags: ["a"] },
    restored: { name: "Label:Edith", amount: "1,200", sameOption: true, tags: ["b"], locks: true }, noWork: true, canceled: "Temporary",
    synthetic: { value: result.synthetic.native, native: result.synthetic.native, raw: { name: "Edith", amount: 1200, choice: 1, tags: ["b"] }, quiet: true },
    defaults: { name: "Native", amount: "100", selected: ["Choose"], tags: ["a"] } });
  expect(result.synthetic.native).toMatch(/^(Native|Temporary)$/);
});

test("queued preview reset never repaints a newer binding unbind disposal or revived source", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.deletedForm, results: unknown[] = [];
    for (const mode of ["bind", "unbind", "dispose", "revive"]) {
      const root = h.root('<input data-field="name" value="Captured">'), rows = h.api.createRows([{ name: "Old" }, { name: "New" }]), ids = rows.entries().map(row => row.id), form = h.api.bindForm(root, { rows });
      form.bind(ids[0]); rows.remove(ids[0]); root.reset();
      if (mode === "bind") form.bind(ids[1]); if (mode === "unbind") form.unbind(); if (mode === "dispose") form.dispose(); if (mode === "revive") rows.restore(ids[0], { name: "Revived" });
      const input = h.field(root, "name"), before = { value: input.value, disabled: input.disabled, marker: root.getAttribute("data-row-status") };
      await new Promise<void>(resolve => setTimeout(resolve, 0)); results.push({ mode, before, after: { value: input.value, disabled: input.disabled, marker: root.getAttribute("data-row-status") } });
      form.dispose(); rows.dispose(); root.remove();
    }
    return results;
  });
  const states = { bind: "New", unbind: "Captured", dispose: "Captured", revive: "Revived" };
  expect(result).toEqual(Object.entries(states).map(([mode, value]) => ({ mode, before: { value, disabled: false, marker: null }, after: { value, disabled: false, marker: null } })));
});

test("preview catalogs and rediscovery share native locks restoration captures and rollback without a second field owner", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.deletedForm, root = h.root('<input data-field="name" value="Capture"><fieldset data-field="tags"><legend>Tags</legend><template data-choice-template><label><input type="checkbox"><span data-choice-label></span></label></template></fieldset>');
    const fieldset = root.querySelector("fieldset")!, choices = ["a", "b"].map(value => ({ label: value, value })), group = h.api.bindChoiceGroup(fieldset, { choices });
    const rows = h.api.createRows([{ name: "Old", tags: ["b"], late: "Source late" }]), id = rows.entries()[0].id, form = h.api.bindForm(root, { rows }); form.bind(id); rows.remove(id);
    root.reset(); const pending = h.failure(() => group.setChoices(choices)); await new Promise<void>(resolve => setTimeout(resolve, 0));
    const old = [...fieldset.querySelectorAll("input")]; group.setChoices([...choices, { label: "C", value: "c" }]); const current = [...fieldset.querySelectorAll("input")];
    const insert = fieldset.insertBefore, failure = new Error("Preview insertion"); fieldset.insertBefore = () => { throw failure; }; let originalFailure = false;
    try { group.setChoices([{ label: "D", value: "d" }]); } catch (cause) { originalFailure = cause === failure; } fieldset.insertBefore = insert;
    const rollback = current.every((input, index) => fieldset.querySelectorAll("input")[index] === input && input.disabled);
    const late = document.createElement("input"); late.dataset.field = "late"; late.value = "Captured late"; root.append(late); form.rescan(); const lockedOnAdopt = late.disabled; form.refresh(["late"]); const shown = late.value;
    const captured = form.defaults(); late.remove(); form.rescan(); const releasedLate = !late.disabled;
    root.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0)); const afterReset = group.value();
    rows.restore(id, rows.original(id)!); const revived = current.every(input => !input.disabled) && !h.field(root, "name").disabled && !root.hasAttribute("data-row-status");
    const result = { pending: pending?.code, retiredReleased: old.every(input => !input.disabled), originalFailure, rollback, lockedOnAdopt, shown, capturedLate: captured.late, releasedLate, afterReset, revived };
    form.dispose(); group.dispose(); rows.dispose(); root.remove(); return result;
  });
  expect(result).toEqual({ pending: "FORM_CHOICE_GROUP", retiredReleased: true, originalFailure: true, rollback: true, lockedOnAdopt: true, shown: "Source late", capturedLate: "Captured late", releasedLate: true, afterReset: ["b"], revived: true });
});

test("failed preview formatting retains locks and recovery never steals unrelated focus", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.deletedForm, root = h.root('<input data-field="name" value="Captured">'), rows = h.api.createRows([{ name: "Ada" }]), id = rows.entries()[0].id;
    let fail = false; const form = h.api.bindForm(root, { rows, rules: { fields: { name: { format: [["label"]] } }, format: { label(value) { if (fail) throw new Error("Format failed"); return "Label:" + value; } } } }); form.bind(id);
    const outside = document.createElement("button"); outside.type = "button"; outside.textContent = "Other action"; document.body.append(outside); outside.focus(); rows.remove(id); fail = true;
    const error = h.failure(() => form.bind(id)), lockedAfterFailure = h.field(root, "name").disabled, deleted = rows.get(id)!.status;
    fail = false; form.refresh(); const recovered = { value: h.field(root, "name").value, locked: h.field(root, "name").disabled, focused: document.activeElement === outside, prepare: h.failure(() => form.prepare()) };
    form.dispose(); const released = !h.field(root, "name").disabled && !root.hasAttribute("data-row-status"); rows.dispose(); root.remove(); outside.remove(); return { error: error?.code, lockedAfterFailure, deleted, recovered, released };
  });
  expect(result).toEqual({ error: "RULE_FAILED", lockedAfterFailure: true, deleted: "delete", recovered: { value: "Label:Ada", locked: true, focused: true, prepare: { code: "FORM_PREPARE", phase: "preview" } }, released: true });
});

test("default preview validation retains other live-row drafts without validating them as disabled preview fields", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.deletedForm, root = h.root('<input data-field="name" required><output data-error-for="name"></output>'), rows = h.api.createRows([{ name: "Ada" }, { name: "Bea" }]), ids = rows.entries().map(row => row.id), form = h.api.bindForm(root, { rows });
    form.bind(ids[1]); const input = h.field(root, "name"); input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true })); form.bind(ids[0]); rows.remove(ids[0]);
    const before = rows.entries({ includeDeleted: true }), checked = form.validate(); const preview = { value: input.value, locked: input.disabled, marker: root.getAttribute("data-row-status") };
    form.bind(ids[1]); const restoredDraft = { value: input.value, locked: input.disabled, invalid: input.getAttribute("aria-invalid"), error: root.querySelector("output")!.textContent !== "" };
    const result = { valid: checked.valid, issues: checked.issues.map(issue => ({ id: issue.rowId, field: issue.field })), expectedId: ids[1], preview, restoredDraft, unchanged: before === rows.entries({ includeDeleted: true }), raw: rows.get(ids[1])!.value.name };
    form.dispose(); rows.dispose(); root.remove(); return result;
  });
  expect(result).toEqual({ valid: false, issues: [{ id: result.expectedId, field: "name" }], expectedId: result.expectedId, preview: { value: "Ada", locked: true, marker: "delete" },
    restoredDraft: { value: "", locked: false, invalid: "true", error: true }, unchanged: true, raw: "Bea" });
});

test("physical inserted-row removal remains distinct from loaded preview and explicit unbind restores capture", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.deletedForm, root = h.root('<input data-field="name" value="Captured">'), rows = h.api.createRows<{ name: string }>(), id = rows.add({ name: "Inserted" }), form = h.api.bindForm(root, { rows }); form.bind(id); rows.remove(id);
    const missing = rows.get(id) === undefined, noPreview = !h.field(root, "name").disabled && !root.hasAttribute("data-row-status"), unavailable = h.failure(() => form.bind(id)); form.unbind();
    const result = { missing, noPreview, unavailable: unavailable?.code, restored: h.field(root, "name").value, defaults: form.defaults() }; form.dispose(); rows.dispose(); root.remove(); return result;
  });
  expect(result).toEqual({ missing: true, noPreview: true, unavailable: "ROW_MISSING", restored: "Captured", defaults: { name: "Captured" } });
});

test("disposal from adopted preview focus cannot resurrect native reset listeners after rediscovery", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.deletedForm, root = h.root('<input data-field="name" value="Captured">'), rows = h.api.createRows([{ name: "Ada", late: "Source" }]), id = rows.entries()[0].id;
    const resetListeners = new Set<EventListenerOrEventListenerObject>(), add = root.addEventListener.bind(root), remove = root.removeEventListener.bind(root);
    root.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      if (type === "reset") resetListeners.add(listener); add(type, listener, options);
    }) as typeof root.addEventListener;
    root.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
      if (type === "reset") resetListeners.delete(listener); remove(type, listener, options);
    }) as typeof root.removeEventListener;
    const form = h.api.bindForm(root, { rows }); form.bind(id); rows.remove(id); const before = resetListeners.size, snapshot = rows.get(id);
    const late = document.createElement("input"); late.dataset.field = "late"; late.value = "Late"; root.append(late); late.focus(); let disposedOnFocus = 0;
    root.addEventListener("focus", () => { disposedOnFocus++; form.dispose(); }, { once: true });
    const rescan = h.failure(() => form.rescan()), after = resetListeners.size, disposed = h.failure(() => form.prepare());
    root.reset(); const native = late.value; await new Promise<void>(resolve => setTimeout(resolve, 0));
    const result = { before, after, disposedOnFocus, rescan, disposed, locked: [...root.querySelectorAll("input")].some(input => input.disabled),
      marker: root.getAttribute("data-row-status"), native, settled: late.value, sourceUnchanged: snapshot === rows.get(id), afterReset: resetListeners.size };
    form.dispose(); rows.dispose(); root.remove(); return result;
  });
  expect(result).toEqual({ before: 1, after: 0, disposedOnFocus: 1, rescan: null, disposed: { code: "FORM_DISPOSED", phase: null }, locked: false,
    marker: null, native: "", settled: "", sourceUnchanged: true, afterReset: 0 });
});

test("loaded deletion inside an active value callback keeps committed deletion and native locks before an explicit refresh retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.deletedForm, root = h.root('<input data-field="name" value="Captured"><input data-field="peer" value="Captured peer">');
    const rows = h.api.createRows([{ name: "Ada", peer: "Original peer" }]), id = rows.entries()[0].id, original = rows.original(id);
    let remove = false, attempts = 0;
    const form = h.api.bindForm(root, { rows, beforeBindValue(value, context) {
      if (remove && context.field === "name") { attempts++; rows.remove(id); }
      return value;
    } }); form.bind(id); rows.set(id, "name", "Edith");
    let events = 0; const stop = rows.subscribe(() => events++); remove = true;
    const failure = h.failure(() => form.refresh()), retained = rows.get(id)!;
    const afterFailure = { code: failure?.code, status: retained.status, value: retained.value.name, sameOriginal: rows.original(id) === original,
      original: rows.original(id)!.name, shown: h.field(root, "name").value, peer: h.field(root, "peer").value,
      locked: [...root.querySelectorAll("input")].every(input => input.disabled), marker: root.getAttribute("data-row-status"), attempts, events };
    const retry = h.failure(() => form.refresh());
    const afterRetry = { failure: retry, sameSnapshot: rows.get(id) === retained, read: form.read(), shown: h.field(root, "name").value,
      peer: h.field(root, "peer").value, locked: [...root.querySelectorAll("input")].every(input => input.disabled), attempts, events,
      payload: rows.changes().map(change => ({ status: change.status, name: change.value.name })), prepare: h.failure(() => form.prepare()) };
    stop(); form.dispose(); const released = [...root.querySelectorAll("input")].every(input => !input.disabled) && !root.hasAttribute("data-row-status");
    rows.dispose(); root.remove(); return { afterFailure, afterRetry, released };
  });
  expect(result).toEqual({ afterFailure: { code: "FORM_VALUE", status: "delete", value: "Edith", sameOriginal: true, original: "Ada", shown: "Edith",
    peer: "Original peer", locked: true, marker: "delete", attempts: 1, events: 1 },
    afterRetry: { failure: null, sameSnapshot: true, read: { name: "Edith", peer: "Original peer" }, shown: "Edith", peer: "Original peer", locked: true,
      attempts: 2, events: 1, payload: [{ status: "delete", name: "Ada" }], prepare: { code: "FORM_PREPARE", phase: "preview" } }, released: true });
});
