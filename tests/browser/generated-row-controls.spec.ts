// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type * as Harness from "./fixtures/generated-row-controls.js";
declare global { interface Window { generatedControls: typeof Harness; } }
const harness = `/@fs/${fileURLToPath(new URL("./fixtures/generated-row-controls.ts", import.meta.url)).replaceAll("\\", "/")}`;
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async path => { window.generatedControls = await import(path); }, harness);
});

for (const owner of ["Form", "Grid", "List"] as const) {
  test(`${owner} compiles generated radio and checkbox definitions at zero one many with native labels and unique row names`, async ({ page }) => {
    const result = await page.evaluate(async owner => {
      const h = window.generatedControls;
      const results = [];
      for (const kind of ["radio", "checkbox"] as const) {
        const f = h.fixture(owner, kind, [0, 1].map(index => ({ name: `Person ${index}`, model: { pick: kind === "radio" ? null : [] }, codes: { items: [] } })));
        const stages = [];
        for (const count of [0, 1, 3, 0]) {
          f.rows.setMany([{ id: f.ids[0], values: { model: { pick: kind === "radio" ? count ? "a" : null : ["a", "b", "c"].slice(0, count) }, codes: { items: ["a", "b", "c"].slice(0, count).map(h.option) } } }]);
          await f.refresh();
          const controls = f.controls();
          stages.push({ count: controls.length, type: controls.map(input => input.type), labels: controls.every(input => input.labels?.length === 1 && input.labels[0].textContent === `Label ${input.value}`),
            values: controls.filter(input => input.checked).map(input => input.value), disabled: controls.every(input => input.disabled === (owner === "List")), valid: f.handle.validate().valid });
        }
        const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
        results.push({ kind, stages, unique: new Set(ids).size === ids.length, restored: f.dispose() });
      }
      return results;
    }, owner);
    for (const { kind, stages, unique, restored } of result) {
      expect(stages).toEqual([0, 1, 3, 0].map(count => ({ count, type: Array(count).fill(kind), labels: true,
        values: kind === "radio" ? count ? ["a"] : [] : ["a", "b", "c"].slice(0, count), disabled: true, valid: true })));
      expect(unique).toBe(true); expect(restored).toBe(true);
    }
  });

  test(`${owner} publishes catalog membership before frozen source pairs and reuses accepted value projections`, async ({ page }) => {
    const result = await page.evaluate(async owner => {
      const h = window.generatedControls, events: string[] = [];
      let root: HTMLElement | undefined, calls = 0;
      const callbacks: Harness.Callbacks = {
        beforeSourceBind(_value, context) { if (context.key === "codes" || context.key === "model") { events.push(`${context.key}:${context.elements.length}:${Object.isFrozen(context.elements)}`); if (root && context.elements.some(element => !root!.contains(element))) throw Error("detached source target"); } },
        beforeBindValue(value, context) { "use strict"; if (context.field === "model.pick") { calls++; events.push(`value:${context.element.localName}`); } return value; }
      };
      const f = h.fixture(owner, "checkbox", [{ name: "Ada", model: { pick: [] }, codes: { items: [] } }], { callbacks }); root = f.root;
      const initial = calls; events.length = 0;
      f.rows.setMany([{ id: f.ids[0], values: { codes: { items: [h.option("a")] }, model: { pick: ["a"] } } }]);
      const first = events.splice(0), firstCalls = calls - initial;
      f.rows.set(f.ids[0], "codes", { items: [h.option("a"), h.option("b")] });
      const second = events.splice(0), secondCalls = calls - initial - firstCalls;
      const checked = f.controls().filter(input => input.checked).map(input => input.value);
      f.rows.setMany([{ id: f.ids[0], values: { model: { pick: ["b"] }, codes: { items: [h.option("b")] } } }]);
      const third = events.splice(0), current = f.controls().map(input => input.value), raw = f.rows.get(f.ids[0])!.value.model.pick;
      const restored = f.dispose(), order: string[] = [];
      const other = h.fixture(owner, "checkbox", [{ name: "Ada", codes: { items: [] }, model: { pick: [] } }], { callbacks: {
        beforeSourceBind(_value, context) { if (context.key === "codes" || context.key === "model") order.push(`${context.key}:${context.elements.length}`); }
      } });
      order.length = 0;
      other.rows.setMany([{ id: other.ids[0], values: { codes: { items: [h.option("a")] }, model: { pick: ["a"] } } }]);
      const catalogFirst = order.slice();
      return { first, firstCalls, second, secondCalls, checked, third, current, raw, restored, catalogFirst, otherRestored: other.dispose() };
    }, owner);
    expect(result.first).toEqual(["model:1:true", "value:input", "codes:0:true"]);
    expect(result.firstCalls).toBe(1);
    expect(result.second).toEqual(["codes:2:true"]); expect(result.secondCalls).toBe(0);
    expect(result.checked).toEqual(["a"]); expect(result.third).toEqual(["model:1:true", "value:input", "codes:0:true"]);
    expect(result.current).toEqual(["b"]); expect(result.raw).toEqual(["b"]); expect(result.restored).toBe(true);
    expect(result.catalogFirst).toEqual(["codes:0", "model:1"]); expect(result.otherRestored).toBe(true);
  });

  test(`${owner} keeps raw unavailable strings and rejects malformed row catalogs before native publication`, async ({ page }) => {
    const result = await page.evaluate(async owner => {
      const h = window.generatedControls, f = h.fixture(owner, "checkbox", [{ name: "Ada", model: { pick: ["a"] }, codes: { items: [h.option("a")] } }]);
      const old = f.controls()[0], missing = h.code(() => f.rows.set(f.ids[0], "codes", { items: null }));
      const empty = f.controls().length, unavailable = f.handle.validate();
      const malformed = h.code(() => f.rows.set(f.ids[0], "codes", { items: {} }));
      const nonstring = h.code(() => f.rows.set(f.ids[0], "codes", { items: [{ value: 1, label: "Number" }] }));
      f.rows.set(f.ids[0], "codes", { items: [h.option("a")] }); await f.refresh();
      const raw = f.rows.get(f.ids[0])!.value.model.pick, recovered = f.handle.validate().valid;
      const retired = !old.isConnected, checked = f.controls()[0].checked;
      return { missing, empty, unavailable: unavailable.issues.map(issue => issue.rule), malformed, nonstring, raw, recovered, retired, checked, restored: f.dispose() };
    }, owner);
    expect(result).toEqual({ missing: "none", empty: 0, unavailable: ["choice-option"], malformed: `${owner.toUpperCase()}_OPTIONS`, nonstring: `${owner.toUpperCase()}_OPTIONS`, raw: ["a"], recovered: true, retired: true, checked: true, restored: true });
  });

  test(`${owner} rejects a cached explicit projection before dropping its available generated code`, async ({ page }) => {
    const result = await page.evaluate(owner => {
      const h = window.generatedControls; let calls = 0;
      const f = h.fixture(owner, "checkbox", [{ name: "Ada", model: { pick: [] }, codes: { items: [h.option("a")] } }], { callbacks: {
        beforeBindValue(value, context) { if (context.field === "model.pick") { calls++; return ["a"]; } return value; }
      } });
      const old = f.controls()[0], failure = h.code(() => f.rows.set(f.ids[0], "codes", { items: [h.option("b")] }));
      const same = f.controls()[0] === old, raw = f.rows.get(f.ids[0])!.value.model.pick, shown = old.checked;
      return { failure, same, raw, shown, calls, restored: f.dispose() };
    }, owner);
    expect(result).toEqual({ failure: `${owner.toUpperCase()}_VALUE`, same: true, raw: [], shown: true, calls: 1, restored: true });
  });

  test(`${owner} keeps required empty groups logical and reports the real fieldset without a proxy`, async ({ page }) => {
    const result = await page.evaluate(owner => {
      const h = window.generatedControls, f = h.fixture(owner, "checkbox", [{ name: "Ada", model: { pick: [] }, codes: { items: [] } }], { attributes: "required" });
      const missing = f.handle.validate(), actual = missing.issues[0]?.element === f.group(), proxies = f.controls().length;
      f.group().disabled = true; const disabled = f.handle.validate().valid; f.group().disabled = false;
      return { valid: missing.valid, rules: missing.issues.map(issue => issue.rule), actual, proxies, disabled, restored: f.dispose() };
    }, owner);
    expect(result).toEqual({ valid: false, rules: ["html"], actual: true, proxies: 0, disabled: true, restored: true });
  });

  test(`${owner} keeps published members after a source failure and retries the current pair once`, async ({ page }) => {
    const result = await page.evaluate(async owner => {
      const h = window.generatedControls, events: string[] = []; let fail = false, writes = 0;
      const f = h.fixture(owner, "checkbox", [{ name: "Ada", model: { pick: [] }, codes: { items: [] } }], { callbacks: {
        beforeSourceBind(_value, context) { if (context.key !== "model" && context.key !== "codes") return; events.push(`before:${context.key}:${context.elements.length}`); if (fail) { fail = false; throw Error("source-once"); } },
        onSourceBind(_value, context) { if (context.key === "model" || context.key === "codes") events.push(`after:${context.key}:${context.elements.length}`); },
        beforeBindValue(value, context) { if (context.field === "model.pick") writes++; return value; }
      } });
      events.length = 0; writes = 0; fail = true;
      const error = h.code(() => f.rows.set(f.ids[0], "codes", { items: [h.option("a")] }));
      const failed = { events: events.splice(0), writes, members: f.controls().map(input => input.value) };
      await f.refresh(); const retried = { events, writes, raw: f.rows.get(f.ids[0])!.value.model.pick };
      return { error, failed, retried, restored: f.dispose() };
    }, owner);
    expect(result.error).toBe(`${owner.toUpperCase()}_SOURCE`);
    expect(result.failed).toEqual({ events: ["before:codes:1"], writes: 0, members: ["a"] });
    expect(result.retried).toEqual({ events: ["before:model:1", "after:model:1", "before:codes:0", "after:codes:0"], writes: 1, raw: [] });
    expect(result.restored).toBe(true);
  });

  test(`${owner} rolls back an actual native publication failure and retries without a data repair write`, async ({ page }) => {
    const result = await page.evaluate(async owner => {
      const h = window.generatedControls, f = h.fixture(owner, "checkbox", [{ name: "Ada", model: { pick: ["a"] }, codes: { items: [h.option("a")] } }]);
      const root = f.group(), input = f.controls()[0], snapshot = root.cloneNode(true), insert = root.insertBefore, failure = Error("publish-once");
      let armed = true, writes = 0, sameFailure = false; const off = f.rows.subscribe(() => writes++);
      root.insertBefore = function<T extends Node>(node: T, child: Node | null): T { if (armed) { armed = false; throw failure; } return insert.call(this, node, child) as T; };
      try { f.rows.set(f.ids[0], "codes", { items: [h.option("b")] }); } catch (cause) { sameFailure = cause === failure; }
      root.insertBefore = insert;
      const rolledBack = root.isEqualNode(snapshot) && f.controls()[0] === input && input.checked;
      await f.refresh(); const raw = f.rows.get(f.ids[0])!.value.model.pick, members = f.controls().map(input => input.value), invalid = !f.handle.validate().valid;
      off(); return { sameFailure, rolledBack, raw, members, invalid, writes, restored: f.dispose() };
    }, owner);
    expect(result).toEqual({ sameFailure: true, rolledBack: true, raw: ["a"], members: ["b"], invalid: true, writes: 1, restored: true });
  });
}

for (const owner of ["Grid", "List"] as const) {
  test(`${owner} validates hidden generated groups without mounting and retains template leases across page changes`, async ({ page }) => {
    const result = await page.evaluate(async owner => {
      const h = window.generatedControls, f = h.fixture(owner, "checkbox", [
        { name: "Ada", model: { pick: ["a"] }, codes: { items: [h.option("a")] } },
        { name: "Grace", model: { pick: ["missing"] }, codes: { items: [] } }
      ], { common: [h.option("shared")] });
      const handle = f.grid ?? f.list!; await handle.setPage({ page: 1, size: 1 });
      const before = f.root.innerHTML, issues = handle.validate(f.ids[1]);
      const noMount = f.root.innerHTML === before, noElement = issues.issues.every(issue => issue.element === undefined);
      const duplicate = f.rows.add({ name: "Duplicate", model: { pick: ["shared"] }, codes: { items: [h.option("shared")] } });
      const hiddenDuplicate = h.code(() => handle.validate(duplicate));
      const old = f.group(), locked = h.code(() => f.common!.setChoices([]));
      await handle.setPage({ page: 2, size: 1 }); await handle.setPage({ page: 1, size: 1 });
      const returned = f.group(), same = returned === old;
      return { invalid: !issues.valid, noMount, noElement, hiddenDuplicate, locked, same, restored: f.dispose() };
    }, owner);
    expect(result).toEqual({ invalid: true, noMount: true, noElement: true, hiddenDuplicate: "CHOICE_OPTIONS", locked: "CHOICE_OWNED", same: owner === "List", restored: true });
  });
}

test("standalone catalog publication rejects new Form adoption during native insertion and permits it afterward", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.generatedControls, root = document.createElement("form"); root.innerHTML = h.field("checkbox", "", true); document.body.append(root);
    for (const attribute of ["data-options", "data-option-label", "data-option-value"]) root.querySelector("fieldset")!.removeAttribute(attribute);
    const group = h.bindChoiceGroup(root.querySelector("fieldset")!, { choices: [] });
    const errors: string[] = []; h.setProbe(() => errors.push(h.code(() => h.bindForm(root))));
    group.setChoices([h.option("a")]); h.setProbe();
    const form = h.bindForm(root), shown = group.value(); form.dispose();
    let adopted: ReturnType<typeof h.bindForm> | undefined;
    const getter = h.code(() => group.setChoices([{ value: "b", get label() { adopted = h.bindForm(root); return "B"; } }]));
    const stable = [...root.querySelectorAll("fieldset input")].map(input => (input as HTMLInputElement).value), captured = adopted!.read();
    adopted!.dispose(); group.dispose(); root.remove();
    return { errors, shown, getter, stable, captured };
  });
  expect(result).toEqual({ errors: ["CHOICE_OWNED"], shown: [], getter: "CHOICE_STALE", stable: ["a"], captured: { model: { pick: [] } } });
});

test("Form generated defaults native edits prepare preview and unbind keep raw data and initial capture distinct", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.generatedControls, f = h.fixture("Form", "checkbox", [{ name: "Ada", model: { pick: ["b"] }, codes: { items: [h.option("b")] } }], { common: [h.option("a")], initial: ["a"] });
    let changes = 0; const off = f.rows.subscribe(() => changes++);
    const defaults = f.form!.defaults(), prepared = f.form!.prepare();
    f.controls()[0].checked = true; const entered = f.form!.prepare(), stillRaw = f.rows.get(f.ids[0])!.value.model.pick;
    f.controls()[0].dispatchEvent(new Event("change", { bubbles: true }));
    const accepted = f.rows.get(f.ids[0])!.value.model.pick, acceptedChanges = changes;
    f.rows.remove(f.ids[0]); const locked = f.controls().every(input => input.disabled), preview = h.code(() => f.form!.prepare());
    (f.root as HTMLFormElement).reset(); await new Promise(resolve => setTimeout(resolve, 0));
    const previewShown = f.controls().filter(input => input.checked).map(input => input.value);
    f.form!.unbind(); const unbound = f.controls().filter(input => input.checked).map(input => input.value), codes = f.controls().map(input => input.value);
    off(); return { defaults, prepared: prepared.values, entered: entered.values, stillRaw, accepted, acceptedChanges, locked, preview, previewShown, unbound, codes, restored: f.dispose() };
  });
  expect(result).toEqual({ defaults: { model: { pick: ["a"] } }, prepared: { model: { pick: ["b"] } }, entered: { model: { pick: ["a", "b"] } }, stillRaw: ["b"], accepted: ["a", "b"], acceptedChanges: 1,
    locked: true, preview: "FORM_PREPARE", previewShown: ["a", "b"], unbound: ["a"], codes: ["a"], restored: true });
});

test("Grid generated single checkbox edits and atomic paste preserve arrays and raw RowId ownership", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.generatedControls, f = h.fixture("Grid", "checkbox", [{ name: "Ada", model: { pick: [] }, codes: { items: [h.option("a")] } }]);
    let changes = 0; const off = f.rows.subscribe(() => changes++);
    const input = f.controls()[0]; input.checked = true; input.dispatchEvent(new Event("change", { bubbles: true }));
    const edited = f.rows.get(f.ids[0])!.value.model.pick, editChanges = changes;
    const rejected = f.grid!.paste('["missing"]', { id: f.ids[0], field: "model.pick" });
    const afterRejected = f.rows.get(f.ids[0])!.value.model.pick, rejectChanges = changes;
    const accepted = f.grid!.paste('[]', { id: f.ids[0], field: "model.pick" });
    off(); const raw = f.rows.get(f.ids[0])!.value.model.pick;
    return { edited, editChanges, rejected: rejected.valid, afterRejected, rejectChanges, accepted: accepted.valid, raw, id: f.rows.entries()[0].id === f.ids[0], restored: f.dispose() };
  });
  expect(result).toEqual({ edited: ["a"], editChanges: 1, rejected: false, afterRejected: ["a"], rejectChanges: 1, accepted: true, raw: [], id: true, restored: true });
});


test("Form validates another RowId against its own generated catalog without mounting or changing the current member", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.generatedControls, f = h.fixture("Form", "checkbox", [
      { name: "Ada", model: { pick: ["a"] }, codes: { items: [h.option("a")] } },
      { name: "Grace", model: { pick: ["b"] }, codes: { items: [h.option("b")] } }
    ], { common: [h.option("shared")] });
    const before = f.root.innerHTML, members = f.controls(), hidden = f.form!.validate(f.ids[1]);
    const duplicate = f.rows.add({ name: "Duplicate", model: { pick: ["shared"] }, codes: { items: [h.option("shared")] } });
    const hiddenDuplicate = h.code(() => f.form!.validate(duplicate));
    return { valid: hidden.valid, noMount: f.root.innerHTML === before, noElement: hidden.issues.every(issue => issue.element === undefined), same: members.every((input, index) => input === f.controls()[index]), hiddenDuplicate, restored: f.dispose() };
  });
  expect(result).toEqual({ valid: true, noMount: true, noElement: true, same: true, hiddenDuplicate: "CHOICE_OPTIONS", restored: true });
});


test("Form release removes the row suffix and leaves latest common choices defaults and matching creation selection readable", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.generatedControls, f = h.fixture("Form", "checkbox", [{ name: "Ada", model: { pick: ["r"] }, codes: { items: [h.option("r")] } }], { common: [h.option("a")], initial: ["a"] });
    const initial = f.form!.defaults();
    f.common!.setChoices([h.option("a"), h.option("b")]);
    const whileAdopted = f.controls().map(input => input.value);
    f.form!.dispose();
    const released = f.common!.value(), members = f.controls().map(input => input.value), defaults = f.controls().filter(input => input.defaultChecked).map(input => input.value);
    f.common!.setValue(["b"]); const writable = f.common!.value();
    f.common!.dispose();
    const ownedRestored = f.group().isEqualNode(f.authoredField), displayRetained = f.root.querySelector('[data-field="name"]')!.textContent === "Ada";
    return { initial, whileAdopted, released, members, defaults, writable, ownedRestored, displayRetained, fullRestored: f.dispose(false) };
  });
  expect(result).toEqual({ initial: { model: { pick: ["a"] } }, whileAdopted: ["a", "b", "r"], released: ["a"], members: ["a", "b"], defaults: ["a"], writable: ["b"], ownedRestored: true, displayRetained: true, fullRestored: false });
});


for (const owner of ["Form", "Grid", "List"] as const) test(`${owner} stops an older checked traversal after a newer same-row native write`, async ({ page }) => {
  const result = await page.evaluate(async owner => {
    const h = window.generatedControls, f = h.fixture(owner, "checkbox", [{ name: "Ada", model: { pick: [] }, codes: { items: [h.option("a"), h.option("b")] } }]);
    const inputs = f.controls(), checked = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked")!;
    let armed = true, writes = 0; const off = f.rows.subscribe(() => writes++);
    Object.defineProperty(inputs[0], "checked", { configurable: true, get() { return checked.get!.call(this); }, set(value: boolean) {
      checked.set!.call(this, value);
      if (armed) { armed = false; f.rows.set(f.ids[0], "model", { pick: ["b"] }); }
    } });
    const code = h.code(() => f.rows.set(f.ids[0], "model", { pick: ["a"] }));
    const shown = f.controls().filter(input => input.checked).map(input => input.value), same = inputs.every((input, index) => input === f.controls()[index]);
    delete (inputs[0] as unknown as Record<string, unknown>).checked;
    await f.refresh();
    const refreshed = f.controls().filter(input => input.checked).map(input => input.value), raw = f.rows.get(f.ids[0])!.value.model.pick;
    off(); return { code, shown, refreshed, raw, same, writes, restored: f.dispose() };
  }, owner);
  expect(result).toEqual({ code: owner === "Form" ? "none" : owner.toUpperCase() + "_BIND_STALE", shown: ["b"], refreshed: ["b"], raw: ["b"], same: true, writes: 2, restored: true });
});

for (const owner of ["Grid", "List"] as const) test(`${owner} attempts every record and template lease after a primitive native teardown failure`, async ({ page }) => {
  const result = await page.evaluate(owner => {
    const h = window.generatedControls;
    return [null, undefined].map(failure => {
      const f = h.fixture(owner, "checkbox", ["Ada", "Grace"].map(name => ({ name, model: { pick: ["r"] }, codes: { items: [h.option("r")] } })), { common: [h.option("c")] });
      const groups = [...f.root.querySelectorAll<HTMLFieldSetElement>("fieldset")], replace = groups[0].replaceChildren;
      let threw = false, same = false; groups[0].replaceChildren = () => { throw failure; };
      try { f.handle.dispose(); } catch (cause) { threw = true; same = cause === failure; }
      groups[0].replaceChildren = replace;
      const writable = h.code(() => f.common!.setChoices([]));
      const released = groups.map(root => h.code(() => { const retry = h.bindChoiceGroup(root, { choices: [] }); retry.dispose(); }));
      return { threw, same, writable, released, restored: f.dispose() };
    });
  }, owner);
  expect(result).toEqual([null, undefined].map(() => ({ threw: true, same: true, writable: "none", released: ["none", "none"], restored: true })));
});


test("Form teardown attempts every group lease and removes the bound root and subscription after a primitive native failure", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.generatedControls;
    return [null, undefined].map(failure => {
      const root = document.createElement("form"); root.innerHTML = h.field("checkbox") + h.field("checkbox").replaceAll("model.pick", "model.other").replaceAll("codes.items", "codes.other"); document.body.append(root);
      const authored = root.cloneNode(true), fields = [...root.querySelectorAll<HTMLFieldSetElement>("fieldset")];
      const common = fields.map((field, index) => h.bindChoiceGroup(field, { choices: [h.option("c" + index)], value: ["c" + index] }));
      const rows = h.createRows([{ model: { pick: ["r0"], other: ["r1"] }, codes: { items: [h.option("r0")], other: [h.option("r1")] } }]), id = rows.entries()[0].id;
      const subscribe = rows.subscribe.bind(rows); let subscriptions = 0, changes = 0;
      rows.subscribe = listener => { subscriptions++; const release = subscribe(listener); let active = true; return () => { if (active) { active = false; subscriptions--; release(); } }; };
      const off = subscribe(() => changes++), form = h.bindForm(root, { rows }); form.bind(id);
      const replace = fields[0].replaceChildren; fields[0].replaceChildren = () => { throw failure; };
      let threw = false, same = false; try { form.dispose(); } catch (cause) { threw = true; same = cause === failure; } fields[0].replaceChildren = replace;
      const stopped = subscriptions === 0, sibling = common[1].value(), writable = common.map((handle, index) => h.code(() => handle.setChoices([h.option("c" + index)])));
      const retry = h.bindForm(root, { rows }), rebound = h.code(() => retry.bind(id)); retry.unbind(); retry.dispose();
      const finalStopped = subscriptions === 0; off(); common.forEach(handle => handle.dispose()); rows.dispose();
      const restored = root.isEqualNode(authored); root.remove();
      return { threw, same, stopped, sibling, writable, rebound, finalStopped, changes, restored };
    });
  });
  expect(result).toEqual([null, undefined].map(() => ({ threw: true, same: true, stopped: true, sibling: ["c1"], writable: ["none", "none"], rebound: "none", finalStopped: true, changes: 0, restored: true })));
});


test("Form draft repaint stops before a later checked member after a newer row bind on the same generated controls", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.generatedControls, root = document.createElement("form"); root.innerHTML = h.field("checkbox", "required");
    const fieldset = root.querySelector("fieldset")!;
    for (const attribute of ["data-options", "data-option-label", "data-option-value"]) fieldset.removeAttribute(attribute);
    document.body.append(root); const authored = root.cloneNode(true);
    const common = h.bindChoiceGroup(fieldset, { choices: [h.option("a"), h.option("b")], value: ["a", "b"] });
    const rows = h.createRows([{ model: { pick: ["a", "b"] } }, { model: { pick: ["b"] } }]), ids = rows.entries().map(row => row.id);
    const form = h.bindForm(root, { rows }); form.bind(ids[0]);
    const inputs = [...fieldset.querySelectorAll<HTMLInputElement>("input")]; inputs[1].checked = false; inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
    const draftInvalid = !form.prepare().valid, committed = rows.get(ids[0])!.value.model.pick;
    const checked = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked")!; let armed = true;
    Object.defineProperty(inputs[0], "checked", { configurable: true, get() { return checked.get!.call(this); }, set(value: boolean) {
      checked.set!.call(this, value); if (armed) { armed = false; form.bind(ids[1]); }
    } });
    const code = h.code(() => form.refresh(["model.pick"])), shown = common.value(), same = inputs.every((input, index) => input === fieldset.querySelectorAll("input")[index]);
    delete (inputs[0] as unknown as Record<string, unknown>).checked;
    form.bind(ids[0]); const retainedDraft = common.value(), unchanged = rows.get(ids[0])!.value.model.pick;
    form.unbind(); form.dispose(); common.dispose(); rows.dispose(); const restored = root.isEqualNode(authored); root.remove();
    return { draftInvalid, committed, code, shown, same, retainedDraft, unchanged, restored };
  });
  expect(result).toEqual({ draftInvalid: true, committed: ["a", "b"], code: "none", shown: ["b"], same: true, retainedDraft: ["a"], unchanged: ["a", "b"], restored: true });
});


test("Form unbind restores captured values after quiet row catalog retirement and stops after newer focus binding", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.generatedControls;
    return [false, true].map(reenter => {
      let sourceCalls = 0, valueCalls = 0;
      const f = h.fixture("Form", "radio", [
        { name: "Ada", model: { pick: "r" }, codes: { items: [h.option("r")] } },
        { name: "Grace", model: { pick: "a" }, codes: { items: [] } }
      ], { common: [h.option("a")], initial: "a", callbacks: { beforeSourceBind() { sourceCalls++; }, beforeBindValue() { valueCalls++; } } });
      sourceCalls = 0; valueCalls = 0; let writes = 0, armed = reenter; const off = f.rows.subscribe(() => writes++);
      const focus = () => { if (armed) { armed = false; f.form!.bind(f.ids[1]); } };
      if (reenter) { f.controls().find(input => input.value === "r")!.focus(); f.root.addEventListener("focusin", focus); }
      f.form!.unbind(); f.root.removeEventListener("focusin", focus);
      const observed = { name: f.root.querySelector('[data-field="name"]')!.textContent, shown: f.common!.value(), codes: f.controls().map(input => input.value),
        sourceCalls, valueCalls, writes, raw: f.rows.get(f.ids[0])!.value.model.pick };
      off(); return { reenter, observed, restored: f.dispose() };
    });
  });
  expect(result[0]).toEqual({ reenter: false, observed: { name: "", shown: "a", codes: ["a"], sourceCalls: 0, valueCalls: 0, writes: 0, raw: "r" }, restored: true });
  expect(result[1].reenter).toBe(true); expect(result[1].observed.name).toBe("Grace"); expect(result[1].observed.shown).toBe("a");
  expect(result[1].observed.codes).toEqual(["a"]); expect(result[1].observed.writes).toBe(0); expect(result[1].observed.raw).toBe("r"); expect(result[1].restored).toBe(true);
});
