// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { bindForm } from "../../src/ui/form.js";
import type { bindChoiceGroup } from "../../src/ui/choice-group.js";
import type { createRows } from "../../src/data/index.js";
import type { getChoiceGroup } from "../../src/ui/choice-group-owner.js";

declare global {
  interface Window {
    liveFormChoices: {
      form: typeof bindForm;
      group: typeof bindChoiceGroup;
      rows: typeof createRows;
      get: typeof getChoiceGroup;
      root(kind?: "radio" | "checkbox", attributes?: string): HTMLFormElement;
      code(run: () => unknown): string;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { form: source("../../src/ui/form.ts"), group: source("../../src/ui/choice-group.ts"),
  data: source("../../src/data/index.ts"), owner: source("../../src/ui/choice-group-owner.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm }, { bindChoiceGroup }, { createRows }, { getChoiceGroup }] = await Promise.all([
      import(modules.form), import(modules.group), import(modules.data), import(modules.owner)
    ]);
    window.liveFormChoices = {
      form: bindForm, group: bindChoiceGroup, rows: createRows, get: getChoiceGroup,
      root(kind = "checkbox", attributes = "") {
        const form = document.createElement("form");
        form.innerHTML = `<fieldset data-field="choice"><legend>Choices</legend><template data-choice-template><label><input type="${kind}" ${attributes}><span data-choice-label></span></label></template></fieldset><output data-error-for="choice"></output>`;
        document.body.append(form); return form;
      },
      code(run) { try { run(); return "none"; } catch (cause) { return (cause as { code?: string }).code ?? "unknown"; } }
    };
  }, modules);
});

test("adopted catalogs preserve Rows values and captures across zero one many choices", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices;
    return (["radio", "checkbox"] as const).map(kind => {
      const root = h.root(kind), authored = root.innerHTML, fieldset = root.querySelector("fieldset")!;
      const value = (code: string) => kind === "radio" ? code : [code];
      const group = h.group(fieldset, { choices: [{ value: "a", label: "A" }], value: value("a") });
      const rows = h.rows([{ choice: value("b") }]), id = rows.entries()[0].id, snapshot = rows.get(id);
      let events = 0, native = 0; rows.subscribe(() => events++); fieldset.addEventListener("change", () => native++);
      const form = h.form(root, { rows }); form.bind(id);
      const shown = [group.value()];
      for (const codes of [["b"], [], ["a", "b"]]) {
        group.setChoices(codes.map(value => ({ value, label: value }))); shown.push(group.value()); form.rescan();
      }
      const read = form.read(), defaults = form.defaults(), unchanged = rows.get(id) === snapshot;
      form.unbind(); const captured = group.value(), nativeDefaults = [...fieldset.querySelectorAll("input")].filter(input => input.defaultChecked).length;
      form.dispose(); group.dispose(); const restored = root.innerHTML === authored; rows.dispose();
      return { kind, shown, read, defaults, captured, nativeDefaults, unchanged, events, native, restored };
    });
  });
  expect(result).toEqual((["radio", "checkbox"] as const).map(kind => {
    const value = (code: string) => kind === "radio" ? code : [code], empty = kind === "radio" ? null : [];
    return { kind, shown: [empty, value("b"), empty, value("b")], read: { choice: value("b") }, defaults: { choice: value("a") },
      captured: value("a"), nativeDefaults: 0, unchanged: true, events: 0, native: 0, restored: true };
  }));
});

test("current and hidden row drafts survive catalog removal without committing or replaying hooks", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices, root = h.root(), fieldset = root.querySelector("fieldset")!;
    fieldset.dataset.validate = '[["onlyA"]]';
    const choices = ["a", "b"].map(value => ({ value, label: value })), group = h.group(fieldset, { choices });
    const rows = h.rows([{ choice: ["a"] }, { choice: ["a"] }]), ids = rows.entries().map(row => row.id);
    let hooks = 0, events = 0; rows.subscribe(() => events++);
    const form = h.form(root, { rows, rules: { validate: { onlyA: value => value.includes("b") ? "Keep the A selection" : true } },
      beforeBindValue() { hooks++; } });
    for (const id of ids) { form.bind(id); fieldset.querySelectorAll("input")[1].click(); }
    const before = hooks, messages = root.querySelector("output")!.textContent;
    group.setChoices([choices[0]]); const removed = group.value();
    group.setChoices(choices); const current = group.value(), quiet = hooks === before;
    form.bind(ids[0]); const hidden = group.value(), read = form.read();
    const raw = rows.entries().map(row => row.value.choice), sameMessage = root.querySelector("output")!.textContent === messages;
    form.dispose(); group.dispose(); rows.dispose();
    return { removed, current, hidden, read, raw, quiet, events, sameMessage };
  });
  expect(result).toEqual({ removed: ["a"], current: ["a", "b"], hidden: ["a", "b"], read: { choice: ["a"] },
    raw: [["a"], ["a"]], quiet: true, events: 0, sameMessage: true });
});

test("applied explicit projections preflight new codes while raw and failed projections keep their owners", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices;
    return ["explicit", "raw", "failed"].map(mode => {
      const root = h.root("radio"), fieldset = root.querySelector("fieldset")!;
      const group = h.group(fieldset, { choices: ["a", "b"].map(value => ({ value, label: value })), value: "a" });
      const raw = mode === "raw" ? "missing" : "a", rows = h.rows([{ choice: raw }]), id = rows.entries()[0].id;
      let hooks = 0, projected = mode === "failed" ? "missing" : "b", primary = true;
      const form = h.form(root, { rows, beforeBindValue(_value, context) {
        hooks++; primary &&= context.element === fieldset.querySelector("input");
        return mode === "raw" ? undefined : projected;
      } });
      const bind = h.code(() => form.bind(id)), before = hooks;
      const beforeHTML = fieldset.innerHTML, rejected = mode === "explicit" ? h.code(() => group.setChoices([{ value: "c", label: "C" }])) : "none";
      const untouched = mode !== "explicit" || fieldset.innerHTML === beforeHTML;
      group.setChoices((mode === "explicit" ? ["b", "c"] : ["c"]).map(value => ({ value, label: value })));
      const shown = group.value(), quiet = hooks === before;
      projected = "c"; form.refresh(["choice"]); const refreshed = group.value(), source = rows.get(id)!.value.choice;
      form.dispose(); group.dispose(); rows.dispose();
      return { mode, bind, rejected, untouched, shown, quiet, hooks, refreshed, source, primary };
    });
  });
  expect(result).toEqual([
    { mode: "explicit", bind: "none", rejected: "FORM_VALUE", untouched: true, shown: "b", quiet: true, hooks: 2, refreshed: "c", source: "a", primary: true },
    { mode: "raw", bind: "none", rejected: "none", untouched: true, shown: null, quiet: true, hooks: 2, refreshed: null, source: "missing", primary: true },
    { mode: "failed", bind: "FORM_VALUE", rejected: "none", untouched: true, shown: null, quiet: true, hooks: 2, refreshed: "c", source: "a", primary: true }
  ]);
});

test("a retained draft overrides an older explicit projection during adopted replacement", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices, root = h.root("radio"), fieldset = root.querySelector("fieldset")!;
    fieldset.dataset.validate = '[["reject"]]';
    const group = h.group(fieldset, { choices: ["a", "b", "c"].map(value => ({ value, label: value })) });
    const rows = h.rows([{ choice: "a" }]), id = rows.entries()[0].id; let hooks = 0;
    const form = h.form(root, { rows, rules: { validate: { reject: () => "Keep this draft" } }, beforeBindValue() { hooks++; return "b"; } });
    form.bind(id); fieldset.querySelectorAll("input")[2].click(); const before = hooks;
    group.setChoices([{ value: "c", label: "C" }]);
    const shown = group.value(), raw = form.read(), quiet = hooks === before, error = root.querySelector("output")!.textContent;
    form.dispose(); group.dispose(); rows.dispose(); return { shown, raw, quiet, error };
  });
  expect(result).toEqual({ shown: "c", raw: { choice: "a" }, quiet: true, error: "Keep this draft" });
});

test("local native selection reset and captured unbind remain separate after live replacement", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices;
    return (["radio", "checkbox"] as const).map(kind => {
      const root = h.root(kind), fieldset = root.querySelector("fieldset")!, value = (code: string) => kind === "radio" ? code : [code];
      const choices = ["a", "b"].map(value => ({ value, label: value }));
      const group = h.group(fieldset, { choices, value: value("b") }), form = h.form(root);
      fieldset.querySelectorAll("input")[1].checked = false; fieldset.querySelector("input")!.click();
      group.setChoices([...choices].reverse()); const current = form.read();
      root.reset(); const reset = form.read();
      group.setChoices([choices[0]]); group.setChoices(choices); form.unbind();
      const captured = group.value(), defaults = form.defaults();
      root.reset(); const paused = group.value(); group.setChoices([...choices].reverse()); const kept = group.value();
      form.unbind(); const again = group.value(); form.dispose(); group.dispose();
      return { kind, current, reset, captured, defaults, paused, kept, again };
    });
  });
  expect(result).toEqual((["radio", "checkbox"] as const).map(kind => {
    const value = (code: string) => kind === "radio" ? code : [code], empty = kind === "radio" ? null : [];
    return { kind, current: { choice: value("a") }, reset: { choice: value("b") }, captured: value("b"),
      defaults: { choice: value("b") }, paused: empty, kept: empty, again: value("b") };
  }));
});

test("new members retain errors and change markers and retired controls cannot commit", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices, root = h.root("radio", 'aria-describedby="hint"'), fieldset = root.querySelector("fieldset")!;
    const hint = document.createElement("span"); hint.id = "hint"; hint.textContent = "Hint"; root.append(hint);
    fieldset.dataset.validate = '[["policy"]]';
    const group = h.group(fieldset, { choices: ["a", "b"].map(value => ({ value, label: value })) });
    const rows = h.rows([{ choice: "a" }]), id = rows.entries()[0].id; let reject = true;
    const form = h.form(root, { rows, rules: { validate: { policy: () => reject ? "Rejected" : true } } });
    form.bind(id); rows.set(id, "choice", "b"); form.validate();
    const old = [...fieldset.querySelectorAll("input")], error = root.querySelector("output")!, message = error.textContent;
    group.setChoices(["b", "c"].map(value => ({ value, label: value })));
    const members = [...fieldset.querySelectorAll("input")], marked = [fieldset, ...members].every(input => input.dataset.fieldChanged === "true");
    const described = members.every(input => input.getAttribute("aria-describedby") === `hint ${error.id}` && input.getAttribute("aria-invalid") === "true");
    const restoredOld = old.every(input => input.getAttribute("aria-describedby") === "hint" && !input.hasAttribute("aria-invalid") && !input.hasAttribute("data-field-changed"));
    const retainedMessage = error.textContent === message; reject = false;
    members[1].checked = true; old[0].name = "retired"; root.append(old[0]); old[0].dispatchEvent(new Event("change", { bubbles: true }));
    const quiet = rows.get(id)!.value.choice === "b";
    members[1].dispatchEvent(new Event("change", { bubbles: true }));
    const committed = rows.get(id)!.value.choice, cleared = error.textContent === "";
    old[0].remove(); form.dispose(); group.dispose(); rows.dispose();
    return { marked, described, restoredOld, retainedMessage, quiet, committed, cleared };
  });
  expect(result).toEqual({ marked: true, described: true, restoredOld: true, retainedMessage: true, quiet: true, committed: "c", cleared: true });
});

test("catalog getters cannot publish over newer source binding restoration or Form ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices;
    return ["set", "bind", "unbind", "dispose", "reclaim", "nested"].map(effect => {
      const root = h.root("radio"), fieldset = root.querySelector("fieldset")!;
      const group = h.group(fieldset, { choices: ["a", "b"].map(value => ({ value, label: value })), value: "a" });
      const rows = h.rows([{ choice: "a" }, { choice: "b" }]), ids = rows.entries().map(row => row.id);
      let form = h.form(root, { rows }); form.bind(ids[0]); let after = "", reads = 0;
      const code = h.code(() => group.setChoices([{ value: "c", get label() {
        reads++;
        if (effect === "set") rows.set(ids[0], "choice", "b");
        else if (effect === "bind") form.bind(ids[1]);
        else if (effect === "unbind") form.unbind();
        else if (effect === "dispose") form.dispose();
        else if (effect === "reclaim") { form.dispose(); form = h.form(root, { rows }); form.bind(ids[1]); }
        else group.setChoices([]);
        after = fieldset.innerHTML; return "C";
      } }]));
      const preserved = after === "" || fieldset.innerHTML === after, value = group.value();
      form.dispose(); group.setChoices([{ value: "a", label: "A" }]); const usable = group.value() === "a" || group.value() === null;
      group.dispose(); rows.dispose(); return { effect, code, preserved, value, reads, usable };
    });
  });
  expect(result).toEqual(["set", "bind", "unbind", "dispose", "reclaim", "nested"].map(effect => ({ effect,
    code: effect === "dispose" || effect === "reclaim" ? "CHOICE_STALE" : "FORM_CHOICE_GROUP", preserved: true,
    value: effect === "set" || effect === "bind" || effect === "reclaim" ? "b" : "a", reads: 1, usable: true })));
});

test("active value work and incomplete construction reject live replacement without reading its catalog", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices, root = h.root("radio"), fieldset = root.querySelector("fieldset")!;
    const group = h.group(fieldset, { choices: [{ value: "a", label: "A" }] });
    const rows = h.rows([{ choice: "a" }]), id = rows.entries()[0].id;
    let reads = 0, duringConstruction = "", duringValue = "";
    const choices = [{ value: "a", get label() { reads++; return "A"; } }];
    const region = root.querySelector("output")!, setAttribute = region.setAttribute;
    region.setAttribute = function(name, value) {
      if (name === "aria-live") duringConstruction = h.code(() => group.setChoices(choices));
      setAttribute.call(this, name, value);
    };
    const form = h.form(root, { rows, beforeBindValue() { duringValue = h.code(() => group.setChoices(choices)); } });
    region.setAttribute = setAttribute; form.bind(id);
    const value = group.value(); form.dispose(); group.dispose(); rows.dispose();
    return { duringConstruction, duringValue, reads, value };
  });
  expect(result).toEqual({ duringConstruction: "FORM_CHOICE_GROUP", duringValue: "FORM_CHOICE_GROUP", reads: 0, value: "a" });
});

test("pending local reset blocks replacement and insertion reset is canceled before catalog publication", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices, root = h.root("radio"), fieldset = root.querySelector("fieldset")!;
    const choices = ["a", "b"].map(value => ({ value, label: value }));
    const group = h.group(fieldset, { choices, value: "a" }), form = h.form(root);
    fieldset.querySelectorAll("input")[1].click(); root.reset();
    const pending = h.code(() => group.setChoices([])), reset = form.read();
    const old = [...fieldset.querySelectorAll("input")], before = fieldset.innerHTML, insert = fieldset.insertBefore;
    let resetEvent: Event | undefined; root.addEventListener("reset", event => { resetEvent = event; });
    fieldset.insertBefore = function<T extends Node>(node: T, child: Node | null): T { root.reset(); return insert.call(this, node, child) as T; };
    const during = h.code(() => group.setChoices([])); fieldset.insertBefore = insert;
    const canceled = resetEvent?.isTrusted === true && resetEvent.defaultPrevented, restored = fieldset.innerHTML === before && old.every(input => input.isConnected);
    const synthetic = new Event("reset", { cancelable: true }); root.dispatchEvent(synthetic);
    group.setChoices(choices); const retry = form.read();
    form.dispose(); group.dispose(); return { pending, reset, during, canceled, restored, syntheticCanceled: synthetic.defaultPrevented, retry };
  });
  expect(result).toEqual({ pending: "FORM_CHOICE_GROUP", reset: { choice: "a" }, during: "FORM_CHOICE_GROUP", canceled: true,
    restored: true, syntheticCanceled: false, retry: { choice: "a" } });
});

test("empty groups preflight explicit native reset owners and roll back listener setup failure", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices, source = h.root("checkbox", 'form="outside-choice-form"'), wrapper = document.createElement("div");
    const fieldset = source.querySelector("fieldset")!, output = source.querySelector("output")!;
    const outside = document.createElement("form"); outside.id = "outside-choice-form"; document.body.append(outside, wrapper);
    wrapper.append(fieldset, output); source.remove();
    const group = h.group(fieldset, { choices: [] }), form = h.form(wrapper), before = fieldset.innerHTML;
    const add = outside.addEventListener, failure = new Error("Reset listener failed"); let same = false;
    outside.addEventListener = function(type, listener, options) { if (type === "reset") throw failure; return add.call(this, type, listener, options); };
    try { group.setChoices([{ value: "a", label: "A" }]); } catch (cause) { same = cause === failure; }
    outside.addEventListener = add; const restored = fieldset.innerHTML === before && group.value() instanceof Array && !fieldset.querySelector("input");
    const insert = fieldset.insertBefore; let resetEvent: Event | undefined; outside.addEventListener("reset", event => { resetEvent = event; });
    fieldset.insertBefore = function<T extends Node>(node: T, child: Node | null): T { outside.reset(); return insert.call(this, node, child) as T; };
    const during = h.code(() => group.setChoices([{ value: "a", label: "A" }])); fieldset.insertBefore = insert;
    const canceled = resetEvent?.defaultPrevented === true && resetEvent.isTrusted;
    group.setChoices([{ value: "a", label: "A" }]); fieldset.querySelector("input")!.click(); outside.reset();
    const reset = form.read(), owner = fieldset.querySelector("input")!.form === outside;
    form.dispose(); group.dispose();
    fieldset.setAttribute("form", outside.id);
    fieldset.querySelector<HTMLTemplateElement>("template")!.content.querySelector("input")!.required = true;
    const emptyGroup = h.group(fieldset, { choices: [] }), emptyForm = h.form(wrapper);
    const missing = !emptyForm.validate().valid; outside.reset(); emptyForm.read();
    const emptyOwner = fieldset.form === outside && output.textContent === "";
    emptyForm.dispose(); emptyGroup.dispose();
    return { same, restored: !!restored, during, canceled, reset, owner, missing, emptyOwner };
  });
  expect(result).toEqual({ same: true, restored: true, during: "FORM_CHOICE_GROUP", canceled: true, reset: { choice: [] }, owner: true, missing: true, emptyOwner: true });
});

test("native insertion and late ARIA failures restore old members maps issues and focus for retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices;
    return ["insert", "aria"].map(stage => {
      const root = h.root("radio"), fieldset = root.querySelector("fieldset")!; fieldset.dataset.validate = '[["reject"]]';
      const choices = ["a", "b"].map(value => ({ value, label: value })), group = h.group(fieldset, { choices, value: "a" });
      const rows = h.rows([{ choice: "b" }]), id = rows.entries()[0].id;
      const form = h.form(root, { rows, rules: { validate: { reject: () => "Rejected" } } }); form.bind(id); form.validate();
      const old = [...fieldset.querySelectorAll("input")], nodes = [...fieldset.childNodes], before = fieldset.cloneNode(true), output = root.querySelector("output")!.textContent;
      old[1].focus(); const failure = new Error(stage), insert = fieldset.insertBefore, setAttribute = Element.prototype.setAttribute;
      let once = true, same = false;
      if (stage === "insert") fieldset.insertBefore = () => { throw failure; };
      else Element.prototype.setAttribute = function(name, value) {
        if (once && this instanceof HTMLInputElement && !old.includes(this) && name === "aria-describedby") { once = false; throw failure; }
        return setAttribute.call(this, name, value);
      };
      try { group.setChoices([...choices].reverse()); } catch (cause) { same = cause === failure; }
      fieldset.insertBefore = insert; Element.prototype.setAttribute = setAttribute;
      const restored = fieldset.isEqualNode(before) && fieldset.childNodes.length === nodes.length &&
        nodes.every((node, index) => fieldset.childNodes[index] === node) && old.every(input => input.isConnected) && group.value() === "b";
      const focused = document.activeElement === old[1];
      const read = form.read(), message = root.querySelector("output")!.textContent === output, defaults = form.defaults();
      group.setChoices([...choices].reverse()); form.rescan(); const retry = group.value(), target = form.validate().issues[0].element === fieldset.querySelector("input");
      form.dispose(); group.dispose(); rows.dispose(); return { stage, same, restored, focused, read, message, defaults, retry, target };
    });
  });
  expect(result).toEqual(["insert", "aria"].map(stage => ({ stage, same: true, restored: true, focused: true, read: { choice: "b" },
    message: true, defaults: { choice: "a" }, retry: "b", target: true })));
});

test("insertion-time Rows events roll back the catalog and replay external writes and draft clearing", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices;
    return ["set", "revert-set"].map(effect => {
      const root = h.root("radio"), fieldset = root.querySelector("fieldset")!; fieldset.dataset.validate = '[["notB"]]';
      const choices = ["a", "b", "c"].map(value => ({ value, label: value })), group = h.group(fieldset, { choices });
      const rows = h.rows([{ choice: "a" }]), id = rows.entries()[0].id;
      if (effect === "revert-set") rows.set(id, "choice", "c");
      const form = h.form(root, { rows, rules: { validate: { notB: value => value === "b" ? "Keep the draft" : true } } }); form.bind(id);
      if (effect === "revert-set") fieldset.querySelectorAll("input")[1].click();
      const old = [...fieldset.querySelectorAll("input")], insert = fieldset.insertBefore;
      fieldset.insertBefore = function<T extends Node>(node: T, child: Node | null): T {
        const result = insert.call(this, node, child) as T;
        if (effect === "set") rows.set(id, "choice", "b");
        else { rows.revert(id); rows.set(id, "choice", "c"); }
        return result;
      };
      const code = h.code(() => group.setChoices([{ value: "c", label: "C" }])); fieldset.insertBefore = insert;
      const oldNodes = old.every(input => input.isConnected), shown = group.value(), source = form.read(), original = rows.original(id);
      form.dispose(); group.dispose(); rows.dispose(); return { effect, code, oldNodes, shown, source, original };
    });
  });
  expect(result).toEqual([
    { effect: "set", code: "FORM_CHOICE_GROUP", oldNodes: true, shown: "b", source: { choice: "b" }, original: { choice: "a" } },
    { effect: "revert-set", code: "FORM_CHOICE_GROUP", oldNodes: true, shown: "c", source: { choice: "c" }, original: { choice: "a" } }
  ]);
});

test("insertion-time disposal and replacement ownership cannot resurrect the retired catalog", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices;
    return ["form", "group", "reclaim"].map(effect => {
      const root = h.root("radio"), fieldset = root.querySelector("fieldset")!, authored = fieldset.innerHTML;
      const choices = ["a", "b"].map(value => ({ value, label: value })), group = h.group(fieldset, { choices });
      const rows = h.rows([{ choice: "b" }]), id = rows.entries()[0].id; let form = h.form(root, { rows }); form.bind(id);
      const old = [...fieldset.querySelectorAll("input")], insert = fieldset.insertBefore;
      fieldset.insertBefore = function<T extends Node>(node: T, child: Node | null): T {
        const result = insert.call(this, node, child) as T; form.dispose();
        if (effect === "group") group.dispose();
        else if (effect === "reclaim") { form = h.form(root, { rows }); form.bind(id); }
        return result;
      };
      const code = h.code(() => group.setChoices([{ value: "c", label: "C" }])); fieldset.insertBefore = insert;
      const retired = old.every(input => !input.isConnected), binding = h.get(fieldset);
      const coherent = binding ? binding.inputs.length === fieldset.querySelectorAll("input").length && binding.inputs.every(input => fieldset.contains(input)) : fieldset.innerHTML === authored;
      form.dispose(); if (effect !== "group") group.dispose();
      const retry = h.group(fieldset, { choices, value: "a" }); const usable = retry.value() === "a"; retry.dispose(); rows.dispose();
      return { effect, code, retired, coherent, usable };
    });
  });
  expect(result).toEqual(["form", "group", "reclaim"].map(effect => ({ effect, code: "FORM_CHOICE_GROUP", retired: true, coherent: true, usable: true })));
});

test("live focus and membership stay independent in simultaneous Forms sharing Rows", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.liveFormChoices, rows = h.rows([{ choice: "b" }]), id = rows.entries()[0].id;
    const choices = ["a", "b", "c"].map(value => ({ value, label: value }));
    const screens = [0, 1].map(() => {
      const root = h.root("radio"), fieldset = root.querySelector("fieldset")!, group = h.group(fieldset, { choices });
      const form = h.form(root, { rows }); form.bind(id); return { root, fieldset, group, form };
    });
    const [first, second] = screens, secondNodes = [...second.fieldset.querySelectorAll("input")];
    first.fieldset.querySelectorAll("input")[1].focus(); first.group.setChoices([choices[2], choices[1], choices[0]]);
    const focus = (document.activeElement as HTMLInputElement).value, untouched = secondNodes.every(input => input.isConnected);
    first.group.setChoices([]); const emptyFocus = document.activeElement === first.fieldset;
    first.group.setChoices(choices); first.fieldset.querySelectorAll("input")[2].click();
    const shared = screens.map(screen => screen.group.value()), names = screens.map(screen => screen.fieldset.querySelector("input")!.name);
    first.form.dispose(); first.group.dispose(); second.group.setChoices([choices[2]]); const retained = second.group.value();
    second.form.dispose(); second.group.dispose(); rows.dispose();
    return { focus, untouched, emptyFocus, shared, isolatedNames: names[0] !== names[1], retained };
  });
  expect(result).toEqual({ focus: "b", untouched: true, emptyFocus: true, shared: ["c", "c"], isolatedNames: true, retained: "c" });
});
