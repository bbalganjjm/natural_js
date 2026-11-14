// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { bindForm } from "../../src/ui/form.js";
import type { bindChoiceGroup } from "../../src/ui/choice-group.js";
import type { createRows } from "../../src/data/index.js";

declare global {
  interface Window {
    formChoices: {
      form: typeof bindForm;
      group: typeof bindChoiceGroup;
      rows: typeof createRows;
      root(kind?: "radio" | "checkbox", name?: string, attributes?: string): HTMLFormElement;
      code(run: () => unknown): string;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { form: source("../../src/ui/form.ts"), group: source("../../src/ui/choice-group.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm }, { bindChoiceGroup }, { createRows }] = await Promise.all([import(modules.form), import(modules.group), import(modules.data)]);
    window.formChoices = {
      form: bindForm, group: bindChoiceGroup, rows: createRows,
      root(kind = "checkbox", name = "choice", attributes = "") {
        const form = document.createElement("form");
        form.innerHTML = `<fieldset data-field="${name}"><legend>Choices</legend><template data-choice-template><label><input type="${kind}" ${attributes}><span data-choice-label></span></label></template></fieldset><output data-error-for="${name}"></output>`;
        document.body.append(form); return form;
      },
      code(run) { try { run(); return "none"; } catch (cause) { return (cause as { code?: string }).code ?? "unknown"; } }
    };
  }, modules);
});

test("generated groups retain zero one many values and adoption captures without changing static checkbox shape", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices;
    return (["radio", "checkbox"] as const).flatMap(kind => [0, 1, 2].map(count => {
      const root = h.root(kind), original = root.outerHTML;
      const choices = ["a", "b"].slice(0, count).map(value => ({ value, label: value }));
      const value = kind === "radio" ? choices[0]?.value ?? null : choices.map(choice => choice.value);
      const group = h.group(root.querySelector("fieldset")!, { choices, value });
      const staticInput = document.createElement("input"); staticInput.type = "checkbox"; staticInput.checked = true;
      staticInput.dataset.field = "flag"; root.append(staticInput);
      const form = h.form(root), read = form.read(), defaults = form.defaults();
      form.unbind(); const restoredValue = group.value();
      form.dispose(); group.dispose(); staticInput.remove();
      return { kind, count, read, defaults, restoredValue, restored: root.outerHTML === original };
    }));
  });
  expect(result).toEqual((["radio", "checkbox"] as const).flatMap(kind => [0, 1, 2].map(count => {
    const choice = kind === "radio" ? count ? "a" : null : ["a", "b"].slice(0, count);
    return { kind, count, read: { choice, flag: true }, defaults: { choice, flag: true }, restoredValue: choice, restored: true };
  })));
});

test("native required checks each enabled checkbox while root rules and empty logical groups stay distinct", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, root = h.root("checkbox", "choice", "required"), fieldset = root.querySelector("fieldset")!;
    const group = h.group(fieldset, { choices: [{ value: "a", label: "A" }, { value: "b", label: "B" }], value: ["a"] });
    const form = h.form(root), partial = form.validate().valid;
    fieldset.querySelectorAll("input")[1].disabled = true; const disabled = form.validate().valid;
    form.dispose(); group.dispose();
    const logical = h.root(), logicalRoot = logical.querySelector("fieldset")!;
    logicalRoot.dataset.validate = '[["required"]]';
    const logicalGroup = h.group(logicalRoot, { choices: [{ value: "", label: "Empty code" }, { value: "a", label: "A" }], value: [""] });
    const logicalForm = h.form(logical), emptyCode = logicalForm.validate().valid;
    logicalRoot.querySelectorAll("input")[1].checked = true; const nonempty = logicalForm.validate().valid;
    logicalForm.dispose(); logicalGroup.dispose();
    const empty = h.root("radio", "choice", "required"), emptyRoot = empty.querySelector("fieldset")!;
    const emptyGroup = h.group(emptyRoot, { choices: [] }), emptyForm = h.form(empty);
    const missing = emptyForm.validate(), anchor = missing.issues[0].element === emptyRoot;
    const error = empty.querySelector("output")!.textContent, invalid = emptyRoot.getAttribute("aria-invalid");
    empty.reset(); emptyForm.read(); const resetCleared = empty.querySelector("output")!.textContent === "";
    emptyRoot.disabled = true; const disabledEmpty = emptyForm.validate().valid;
    emptyForm.dispose(); emptyGroup.dispose();
    return { partial, disabled, emptyCode, nonempty, missing: !missing.valid, anchor, error: !!error, invalid, resetCleared, disabledEmpty, proxies: emptyRoot.querySelectorAll("input").length };
  });
  expect(result).toEqual({ partial: false, disabled: true, emptyCode: false, nonempty: true, missing: true, anchor: true,
    error: true, invalid: "true", resetCleared: true, disabledEmpty: true, proxies: 0 });
});

test("raw group validation rejects coercion duplicates and unavailable codes without rewriting Rows", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices;
    return ([{ kind: "radio", values: [1, "missing", "a", null] },
      { kind: "checkbox", values: [false, [null], ["a", "a"], ["missing"], ["b"], []] }] as const).flatMap(({ kind, values }) => values.map(value => {
      const root = h.root(kind), group = h.group(root.querySelector("fieldset")!, {
        choices: [{ value: "a", label: "A" }, { value: "b", label: "B", disabled: true }]
      });
      const rows = h.rows([{ choice: value }]), id = rows.entries()[0].id, form = h.form(root, { rows });
      form.bind(id); const valid = form.validate().valid, read = form.read(), shown = group.value(), original = rows.original(id);
      form.dispose(); group.dispose(); rows.dispose(); return { kind, value, valid, read, shown, original };
    }));
  });
  expect(result).toEqual([
    ...[[1, false, null], ["missing", false, null], ["a", true, "a"], [null, true, null]].map(([value, valid, shown]) =>
      ({ kind: "radio", value, valid, read: { choice: value }, shown, original: { choice: value } })),
    ...[[false, false, []], [[null], false, []], [["a", "a"], false, ["a"]], [["missing"], false, []], [["b"], true, ["b"]], [[], true, []]].map(([value, valid, shown]) =>
      ({ kind: "checkbox", value, valid, read: { choice: value }, shown, original: { choice: value } }))
  ]);
});

test("value projections accept radio null and stable arrays and reject invalid generated codes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices;
    return (["radio", "checkbox"] as const).flatMap(kind => [0, 1].flatMap(count => {
      const valid = kind === "radio" ? null : [];
      const invalid = kind === "radio" ? [1, "missing"] : [[null], ["a", "a"], ["missing"]];
      return [valid, ...invalid].map(projected => {
        const root = h.root(kind), fieldset = root.querySelector("fieldset")!;
        const group = h.group(fieldset, { choices: count ? [{ value: "a", label: "A" }] : [] });
        const raw = kind === "radio" ? count ? "a" : null : count ? ["a"] : [];
        const rows = h.rows([{ choice: raw }]); let realElement = true;
        const form = h.form(root, { rows, beforeBindValue(_value, context) {
          realElement &&= context.element === (fieldset.querySelector("input") ?? fieldset); return projected;
        } });
        const code = h.code(() => form.bind(rows.entries()[0].id));
        const shown = group.value(), source = rows.get(rows.entries()[0].id)!.value.choice;
        form.dispose(); group.dispose(); rows.dispose(); return { kind, count, code, shown, source, realElement };
      });
    }));
  });
  let index = 0;
  for (const kind of ["radio", "checkbox"] as const) for (const count of [0, 1]) {
    const raw = kind === "radio" ? count ? "a" : null : count ? ["a"] : [];
    const accepted = result[index++];
    expect(accepted).toEqual({ kind, count, code: "none", shown: kind === "radio" ? null : [], source: raw, realElement: true });
    for (let failure = 0; failure < (kind === "radio" ? 2 : 3); failure++) {
      const rejected = result[index++]; expect(rejected.code).toBe("FORM_VALUE"); expect(rejected.source).toEqual(raw); expect(rejected.realElement).toBe(true);
    }
  }
});

test("Form ownership mediates catalogs while blocking direct values and disposal through unbind", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, root = h.root(), fieldset = root.querySelector("fieldset")!;
    const group = h.group(fieldset, { choices: [{ value: "a", label: "A" }], value: ["a"] });
    const rows = h.rows([{ choice: ["a"] }]), form = h.form(root, { rows }); form.bind(rows.entries()[0].id);
    const before = fieldset.outerHTML;
    const locked = [() => group.setValue([]), () => group.dispose()].map(h.code);
    const unchanged = before === fieldset.outerHTML && JSON.stringify(group.value()) === '["a"]';
    group.setChoices([{ value: "a", label: "A again" }, { value: "b", label: "B" }]);
    const mediated = { value: group.value(), count: fieldset.querySelectorAll("input").length, raw: form.read() };
    form.unbind(); const retained = h.code(() => group.setChoices([]));
    form.dispose(); group.setChoices([]); const empty = group.value(); group.dispose(); rows.dispose();
    return { locked, unchanged, mediated, retained, empty };
  });
  expect(result).toEqual({ locked: ["CHOICE_OWNED", "CHOICE_OWNED"], unchanged: true,
    mediated: { value: ["a"], count: 2, raw: { choice: ["a"] } }, retained: "none", empty: [] });
});

test("two generated-group Forms share native commits and release their ownership independently", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, rows = h.rows([{ gender: "a", fruits: [] as string[] }]), id = rows.entries()[0].id;
    const owners = [0, 1].map(() => {
      const root = h.root("radio", "gender"), fruitHost = h.root("checkbox", "fruits");
      const fruitRoot = fruitHost.querySelector("fieldset")!; root.append(fruitRoot, fruitHost.querySelector("output")!);
      const gender = h.group(root.querySelector("fieldset")!, { choices: [{ value: "a", label: "A" }, { value: "b", label: "B" }] });
      const fruit = h.group(fruitRoot, { choices: [{ value: "apple", label: "Apple" }] });
      const form = h.form(root, { rows }); form.bind(id); return { root, gender, fruit, form };
    });
    const [first, second] = owners;
    const radio = first.root.querySelector<HTMLInputElement>('input[type="radio"][value="b"]')!;
    radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true }));
    const checkbox = first.root.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    checkbox.checked = true; checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    const committed = rows.get(id)!.value, shared = { gender: second.gender.value(), fruits: second.fruit.value() };
    const names = owners.map(owner => owner.root.querySelector<HTMLInputElement>('input[type="radio"]')!.name);
    first.form.dispose(); first.gender.setValue("b"); first.fruit.setValue(["apple"]);
    rows.set(id, "gender", "a"); rows.set(id, "fruits", []);
    radio.dispatchEvent(new Event("change", { bubbles: true }));
    const independent = { first: [first.gender.value(), first.fruit.value()], second: [second.gender.value(), second.fruit.value()], raw: rows.get(id)!.value };
    const original = rows.original(id); second.form.dispose();
    for (const owner of owners) { owner.fruit.dispose(); owner.gender.dispose(); }
    rows.dispose(); return { committed, shared, independent, original, names: new Set(names).size };
  });
  expect(result).toEqual({ committed: { gender: "b", fruits: ["apple"] }, shared: { gender: "b", fruits: ["apple"] },
    independent: { first: ["b", ["apple"]], second: ["a", []], raw: { gender: "a", fruits: [] } },
    original: { gender: "a", fruits: [] }, names: 2 });
});

test("rescan keeps rejected draft ownership and releases a successfully retired group", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, root = h.root(), fieldset = root.querySelector("fieldset")!;
    fieldset.dataset.validate = '[["required"]]';
    const group = h.group(fieldset, { choices: [{ value: "a", label: "A" }], value: ["a"] });
    const rows = h.rows([{ choice: ["a"] }]), form = h.form(root, { rows }); form.bind(rows.entries()[0].id);
    const input = fieldset.querySelector("input")!; input.checked = false; input.dispatchEvent(new Event("change", { bubbles: true }));
    fieldset.remove(); const rejected = h.code(() => form.rescan()), stillLocked = h.code(() => group.setValue([]));
    root.append(fieldset); form.unbind(); fieldset.remove(); form.rescan();
    group.setChoices([]); const released = group.value(), read = form.read(), stored = rows.get(rows.entries()[0].id)!.value.choice;
    form.dispose(); group.dispose(); rows.dispose(); return { rejected, stillLocked, released, read, stored };
  });
  expect(result).toEqual({ rejected: "FORM_RESCAN", stillLocked: "CHOICE_OWNED", released: [], read: {}, stored: ["a"] });
});

test("failed construction and rescan release provisional claims without unlocking another Form", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices;
    return ["construct", "rescan"].map(mode => {
      const root = document.createElement("form"); document.body.append(root);
      const firstHost = h.root("checkbox", "first"), secondHost = h.root("checkbox", "second");
      const firstRoot = firstHost.querySelector("fieldset")!, secondRoot = secondHost.querySelector("fieldset")!;
      const first = h.group(firstRoot, { choices: [] }), second = h.group(secondRoot, { choices: [] });
      const owner = h.form(secondHost), form = mode === "rescan" ? h.form(root) : undefined;
      root.append(firstRoot, secondRoot);
      const rejected = h.code(() => mode === "rescan" ? form!.rescan() : h.form(root));
      const firstReleased = h.code(() => first.setValue([])), otherLocked = h.code(() => second.setValue([]));
      secondHost.append(secondRoot);
      const retry = form ?? h.form(root); if (form) form.rescan();
      const adopted = h.code(() => first.setValue([]));
      retry.dispose(); owner.dispose(); first.dispose(); second.dispose(); return { mode, rejected, firstReleased, otherLocked, adopted };
    });
  });
  expect(result).toEqual(["construct", "rescan"].map(mode => ({ mode, rejected: "CHOICE_OWNED", firstReleased: "none", otherLocked: "CHOICE_OWNED", adopted: "CHOICE_OWNED" })));
});

test("late ARIA and subscription setup failures release group and root ownership for retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices;
    return ["aria", "subscribe"].map(mode => {
      const root = h.root(), group = h.group(root.querySelector("fieldset")!, { choices: [{ value: "a", label: "A" }] });
      const rows = h.rows([{ choice: [] as string[] }]), region = root.querySelector("output")!, failure = new Error("Late setup");
      const setAttribute = region.setAttribute, subscribe = rows.subscribe; let fail = true;
      if (mode === "aria") region.setAttribute = function (name, value) {
        if (fail && name === "aria-live") { fail = false; throw failure; } setAttribute.call(this, name, value);
      };
      else rows.subscribe = () => { throw failure; };
      let same = false; try { h.form(root, { rows }); } catch (cause) { same = cause === failure; }
      const released = h.code(() => group.setValue([])); region.setAttribute = setAttribute; rows.subscribe = subscribe;
      const form = h.form(root, { rows }); form.bind(rows.entries()[0].id);
      const input = root.querySelector("input")!; input.checked = true; input.dispatchEvent(new Event("change", { bubbles: true }));
      const stored = rows.get(rows.entries()[0].id)!.value.choice;
      form.dispose(); group.dispose(); rows.dispose(); return { mode, same, released, stored };
    });
  });
  expect(result).toEqual(["aria", "subscribe"].map(mode => ({ mode, same: true, released: "none", stored: ["a"] })));
});

test("local native reset and captured defaults remain separate through unbind", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, root = h.root(), group = h.group(root.querySelector("fieldset")!, {
      choices: [{ value: "a", label: "A" }, { value: "b", label: "B" }], value: ["a"]
    });
    const form = h.form(root), [first, second] = root.querySelectorAll("input");
    first.defaultChecked = false; second.defaultChecked = true;
    first.checked = true; second.checked = false; root.reset();
    const reset = form.read(), capture = form.defaults(); form.unbind(); const restored = group.value();
    form.dispose(); group.dispose(); return { reset, capture, restored };
  });
  expect(result).toEqual({ reset: { choice: ["b"] }, capture: { choice: ["a"] }, restored: ["a"] });
});

test("uninitialized disposed and configured display groups fail before adoption", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, root = h.root(), fieldset = root.querySelector("fieldset")!;
    const uninitialized = h.code(() => h.form(root));
    const group = h.group(fieldset, { choices: [] }); fieldset.dataset.format = '[["commas"]]';
    const format = h.code(() => h.form(root)); delete fieldset.dataset.format;
    const parse = h.code(() => h.form(root, { parse: { choice: Number } }));
    const render = h.code(() => h.form(root, { render: { choice: () => "display" } }));
    const writable = h.code(() => group.setValue([])); group.dispose();
    const disposed = h.code(() => h.form(root)); return { uninitialized, format, parse, render, writable, disposed };
  });
  expect(result).toEqual({ uninitialized: "FORM_CHOICE_GROUP", format: "FORM_FORMAT_CONTROL", parse: "FORM_CHOICE_GROUP",
    render: "FORM_CHOICE_GROUP", writable: "none", disposed: "FORM_CHOICE_GROUP" });
});
