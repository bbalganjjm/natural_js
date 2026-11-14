// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { bindChoiceGroup } from "../../src/ui/choice-group.js";
import type { claimChoiceGroup, getChoiceGroup } from "../../src/ui/choice-group-owner.js";

declare global {
  interface Window {
    choiceGroup: {
      bind: typeof bindChoiceGroup;
      claim: typeof claimChoiceGroup;
      get: typeof getChoiceGroup;
      root(kind?: "radio" | "checkbox", item?: string): HTMLFieldSetElement;
      inputs(root: ParentNode): HTMLInputElement[];
      code(action: () => unknown): string;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { group: source("../../src/ui/choice-group.ts"), owner: source("../../src/ui/choice-group-owner.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindChoiceGroup }, { claimChoiceGroup, getChoiceGroup }] = await Promise.all([import(modules.group), import(modules.owner)]);
    window.choiceGroup = {
      bind: bindChoiceGroup, claim: claimChoiceGroup, get: getChoiceGroup,
      root(kind = "radio", item) {
        const root = document.createElement("fieldset");
        root.innerHTML = `<legend>Choices</legend><p data-help>Choose from the list</p><template data-choice-template>${item ?? `<label class="authored-item"><input type="${kind}" class="authored-input"><span data-choice-label></span></label>`}</template><output data-note>Authored note</output>`;
        document.body.append(root); return root;
      },
      inputs: root => [...root.querySelectorAll<HTMLInputElement>("input")],
      code(action) { try { action(); return "none"; } catch (cause) { return (cause as { code: string }).code; } }
    };
  }, modules);
});

test("authored native groups use literal labels and document-isolated names without generated IDs or forms", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup, first = h.root(), options = Object.freeze({ choices: Object.freeze([{ label: '<img src=x onerror="bad()">', value: "a" }, { label: "Second", value: "b" }]), value: "b" });
    const firstHandle = h.bind(first, options), firstName = h.inputs(first)[0].name;
    const serial = Number(firstName.split("-").at(-1)), nameCollision = document.createElement("input"), idCollision = document.createElement("span");
    nameCollision.name = `njs-choice-${serial + 1}`; idCollision.id = `njs-choice-${serial + 2}`; document.body.append(nameCollision, idCollision);
    const second = h.root(), secondHandle = h.bind(second, options), secondName = h.inputs(second)[0].name;
    h.inputs(first)[0].click();
    const result = { labels: [...first.querySelectorAll("label")].map(label => label.textContent), literal: !first.querySelector("img"),
      authored: h.inputs(first).every(input => input.className === "authored-input" && input.closest("label")?.className === "authored-item"),
      first: firstHandle.value(), second: secondHandle.value(), isolated: firstName !== secondName && ![nameCollision.name, idCollision.id].includes(secondName),
      oneName: new Set(h.inputs(first).map(input => input.name)).size === 1, noIds: !first.querySelector("[id]"), noForms: !first.querySelector("form") };
    firstHandle.dispose(); secondHandle.dispose(); return result;
  });
  expect(result).toEqual({ labels: ['<img src=x onerror="bad()">', "Second"], literal: true, authored: true, first: "a", second: "b", isolated: true, oneName: true, noIds: true, noForms: true });
});

test("checkbox groups retain arrays at zero one and many choices and public setters normalize only valid strings", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup, root = h.root("checkbox"), handle = h.bind(root, { choices: [] }), states: unknown[] = [handle.value()];
    handle.setChoices([{ label: "A", value: "a" }]); handle.setValue(["a", "a", "unknown"]); states.push(handle.value());
    handle.setChoices([{ label: "B", value: "b" }, { label: "A", value: "a" }]); handle.setValue(["a", "b", "a"]); states.push(handle.value());
    const before = root.innerHTML;
    const invalid = [null, "a", [null], [1], Array(1)].map(value => h.code(() => handle.setValue(value as never)));
    const preserved = root.innerHTML === before && JSON.stringify(handle.value()) === '["b","a"]';
    handle.setChoices([]); states.push(handle.value()); handle.dispose(); return { states, invalid, preserved };
  });
  expect(result).toEqual({ states: [[], ["a"], ["b", "a"], []], invalid: Array(5).fill("CHOICE_VALUE"), preserved: true });
});

test("radio setters preserve null empty codes and disabled values while rejecting array and coerced values", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup, root = h.root(), handle = h.bind(root, { choices: [{ label: "Empty code", value: "" }, { label: "Disabled", value: "b", disabled: true }] });
    const states = [handle.value()]; handle.setValue(""); states.push(handle.value()); handle.setValue("b"); states.push(handle.value());
    h.inputs(root)[1].click(); states.push(handle.value()); handle.setValue("missing"); states.push(handle.value());
    const invalid = [["b"], false, 1, undefined].map(value => h.code(() => handle.setValue(value as never)));
    handle.dispose(); return { states, invalid };
  });
  expect(result).toEqual({ states: [null, "", "b", "b", null], invalid: Array(4).fill("CHOICE_VALUE") });
});

test("replacement preserves surviving current and native default selections as separate checkpoints", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup;
    return (["radio", "checkbox"] as const).map(kind => {
      const form = document.createElement("form"), root = h.root(kind); document.body.append(form); form.append(root);
      const selected = (value: string) => kind === "radio" ? value : [value];
      const handle = h.bind(root, { choices: [{ label: "A", value: "a" }, { label: "B", value: "b" }], value: selected("b") });
      handle.setValue(selected("a")); handle.setChoices([{ label: "B", value: "b" }, { label: "C", value: "c" }, { label: "A", value: "a" }]);
      const current = handle.value(), defaults = h.inputs(root).filter(input => input.defaultChecked).map(input => input.value);
      form.reset(); const reset = handle.value(); handle.setValue(kind === "radio" ? null : []);
      handle.setChoices([{ label: "A", value: "a" }, { label: "C", value: "c" }]); form.reset();
      const removed = handle.value(); handle.dispose(); return { kind, current, defaults, reset, removed };
    });
  });
  expect(result).toEqual([{ kind: "radio", current: "a", defaults: ["b"], reset: "b", removed: null }, { kind: "checkbox", current: ["a"], defaults: ["b"], reset: ["b"], removed: [] }]);
});

test("standalone replacement restores a surviving focused choice then an enabled neighbor or real empty fieldset", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup, root = h.root(), outside = document.createElement("button"); outside.textContent = "Outside"; document.body.append(outside);
    const handle = h.bind(root, { choices: [{ label: "A", value: "a" }, { label: "B", value: "b" }, { label: "C", value: "c" }], value: "b" });
    h.inputs(root)[1].focus(); handle.setChoices([{ label: "C", value: "c" }, { label: "B", value: "b" }, { label: "A", value: "a" }]);
    const surviving = (document.activeElement as HTMLInputElement).value;
    handle.setChoices([{ label: "C", value: "c", disabled: true }, { label: "A", value: "a" }]);
    const neighbor = (document.activeElement as HTMLInputElement).value;
    handle.setChoices([]); const empty = document.activeElement === root && root.tabIndex === -1;
    outside.focus(); handle.setChoices([{ label: "A", value: "a" }]); const untouched = document.activeElement === outside;
    handle.dispose(); return { surviving, neighbor, empty, untouched, restoredTabindex: !root.hasAttribute("tabindex") };
  });
  expect(result).toEqual({ surviving: "b", neighbor: "a", empty: true, untouched: true, restoredTabindex: true });
});

test("invalid templates choices and initial values fail without changing authored DOM or retaining ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup, item = '<label><input type="radio"><span data-choice-label></span></label>', choices = [{ label: "A", value: "a" }];
    const cases = [
      { item: '<label><input type="radio" id="fixed"><span data-choice-label></span></label>', code: "CHOICE_TEMPLATE" },
      { item: '<label for="fixed"><input type="radio"><span data-choice-label></span></label>', code: "CHOICE_TEMPLATE" },
      { item: '<label><input type="radio" checked><span data-choice-label></span></label>', code: "CHOICE_TEMPLATE" },
      { item: '<label data-field="wrong"><input type="radio"><span data-choice-label></span></label>', code: "CHOICE_TEMPLATE" },
      { item: '<label><span data-choice-label><input type="radio"></span></label>', code: "CHOICE_TEMPLATE" },
      { item: '<label><input type="radio"><button data-choice-label></button></label>', code: "CHOICE_TEMPLATE" },
      { choices: [{ label: "A", value: "a" }, { label: "Again", value: "a" }], code: "CHOICE_OPTIONS" },
      { choices: [{ label: "", value: "a" }], code: "CHOICE_OPTIONS" },
      { choices: [{ label: "A", value: 1 }], code: "CHOICE_OPTIONS" },
      { choices: Array(1), code: "CHOICE_OPTIONS" },
      { value: ["a"], code: "CHOICE_VALUE" }
    ];
    return cases.map(options => {
      const root = h.root("radio", options.item ?? item), before = root.innerHTML;
      const code = h.code(() => h.bind(root, { choices, ...options } as never));
      const unchanged = root.innerHTML === before && h.get(root) === undefined;
      root.querySelector<HTMLTemplateElement>("template")!.innerHTML = item;
      const retry = h.bind(root, { choices }); retry.dispose(); return { code, expected: options.code, unchanged };
    });
  });
  for (const item of result) expect(item).toEqual({ code: item.expected, expected: item.expected, unchanged: true });
});

test("setter getters cannot mutate a disposed adopted or successfully replaced choice group", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup;
    return ["choices", "value"].flatMap(operation => ["dispose", "claim", "nested"].map(effect => {
      const root = h.root("checkbox"), handle = h.bind(root, { choices: [{ value: "a", label: "A" }, { value: "b", label: "B" }], value: ["a"] });
      let release: (() => void) | undefined, after = "", reads = 0;
      const change = () => {
        reads++;
        if (effect === "dispose") handle.dispose();
        else if (effect === "claim") release = h.claim(h.get(root)!);
        else { handle.setChoices([{ value: "b", label: "Inner B" }]); handle.setValue(["b"]); }
        after = root.innerHTML;
      };
      const pending: string[] = [];
      Object.defineProperty(pending, 0, { get() { change(); return "b"; }, enumerable: true });
      const code = h.code(() => operation === "value" ? handle.setValue(pending) : handle.setChoices([{ get label() { change(); return "Outer A"; }, value: "a" }]));
      const preserved = root.innerHTML === after, value = effect === "dispose" ? null : handle.value();
      release?.(); handle.dispose();
      const retry = h.bind(root, { choices: [{ value: "a", label: "A" }] }); retry.dispose();
      return { operation, effect, code, preserved, value, reads };
    }));
  });
  expect(result).toEqual(["choices", "value"].flatMap(operation => ["dispose", "claim", "nested"].map(effect => ({ operation, effect,
    code: effect === "dispose" ? "CHOICE_DISPOSED" : effect === "claim" && operation === "value" ? "CHOICE_OWNED" : "CHOICE_STALE",
    preserved: true, value: effect === "dispose" ? null : effect === "nested" ? ["b"] : ["a"], reads: 1 }))));
});

test("constructor preparation stays unadoptable until native nodes defaults and listener setup finish", async ({ page }) => {
  const result = await page.evaluate(async formModule => {
    const { bindForm } = await import(formModule), h = window.choiceGroup, root = h.root("checkbox"), formRoot = document.createElement("form");
    document.body.append(formRoot); formRoot.append(root); root.dataset.field = "choice";
    const original = root.outerHTML, preparation: boolean[] = []; let blocked = "", duplicate = "", provisional = true;
    const add = root.addEventListener;
    Object.defineProperty(root, "addEventListener", { configurable: true, value(...args: Parameters<typeof root.addEventListener>) {
      provisional = h.get(root) !== undefined;
      blocked = h.code(() => bindForm(formRoot)); duplicate = h.code(() => h.bind(root, { choices: [] }));
      return add.apply(root, args);
    } });
    const handle = h.bind(root, {
      get choices() { preparation.push(h.get(root) !== undefined); return [{ get label() { preparation.push(h.get(root) !== undefined); return "A"; }, value: "a" }]; },
      value: ["a"]
    });
    delete (root as unknown as Record<string, unknown>).addEventListener;
    let duplicateReads = 0;
    const duplicateGetter = h.code(() => h.bind(root, { get choices() { duplicateReads++; handle.dispose(); return []; } }));
    const form = bindForm(formRoot), defaults = form.defaults(); form.dispose(); handle.dispose();
    const failure = new Error("Listener setup failed");
    Object.defineProperty(root, "addEventListener", { configurable: true, value() { throw failure; } });
    let sameFailure = false; try { h.bind(root, { choices: [{ value: "a", label: "A" }] }); } catch (cause) { sameFailure = cause === failure; }
    delete (root as unknown as Record<string, unknown>).addEventListener;
    const released = h.get(root) === undefined, restored = root.outerHTML === original;
    const retry = h.bind(root, { choices: [] }); retry.dispose();
    return { preparation, provisional, blocked, duplicate, duplicateGetter, duplicateReads, defaults, sameFailure, released, restored };
  }, source("../../src/ui/form.ts"));
  expect(result).toEqual({ preparation: [false, false], provisional: false, blocked: "FORM_CHOICE_GROUP", duplicate: "CHOICE_OWNED", duplicateGetter: "CHOICE_OWNED", duplicateReads: 0,
    defaults: { choice: ["a"] }, sameFailure: true, released: true, restored: true });
});

test("catalog preparation detects a temporary claim that returns to an unclaimed group", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup, root = h.root("checkbox"), handle = h.bind(root, { choices: [{ label: "A", value: "a" }], value: ["a"] });
    const original = root.innerHTML;
    const code = h.code(() => handle.setChoices([{ get label() {
      const release = h.claim(h.get(root)!); release(); return "B";
    }, value: "b" }]));
    const unchanged = root.innerHTML === original, selected = handle.value();
    handle.setChoices([{ label: "A again", value: "a" }]); const retry = handle.value(); handle.dispose();
    return { code, unchanged, selected, retry };
  });
  expect(result).toEqual({ code: "CHOICE_STALE", unchanged: true, selected: ["a"], retry: ["a"] });
});

test("sparse catalogs and failed insertion preserve a usable current group and its focused native input", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup, root = h.root(), handle = h.bind(root, { choices: [{ value: "a", label: "A" }, { value: "b", label: "B" }], value: "b" });
    const input = h.inputs(root)[1]; input.focus(); const before = root.innerHTML;
    const sparse = h.code(() => handle.setChoices(Array(1))), sparsePreserved = root.innerHTML === before && handle.value() === "b";
    const failure = new Error("Insert failed");
    Object.defineProperty(root, "insertBefore", { configurable: true, value() { throw failure; } });
    let sameFailure = false;
    try { handle.setChoices([{ value: "c", label: "C" }]); } catch (cause) { sameFailure = cause === failure; }
    delete (root as unknown as Record<string, unknown>).insertBefore;
    const restored = root.innerHTML === before, focused = document.activeElement === input, value = handle.value();
    handle.setChoices([{ value: "a", label: "A" }, { value: "b", label: "B" }]); const retry = handle.value(); handle.dispose();
    return { sparse, sparsePreserved, sameFailure, restored, focused, value, retry };
  });
  expect(result).toEqual({ sparse: "CHOICE_OPTIONS", sparsePreserved: true, sameFailure: true, restored: true, focused: true, value: "b", retry: "b" });
});

test("native callbacks are captured once and called plainly while disabled controls and instances remain independent", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup, calls: unknown[] = []; let reads = 0;
    const callback = function (this: unknown, value: unknown, event: Event) { "use strict"; calls.push([value, this === undefined, event.target instanceof HTMLInputElement, event.type]); };
    const options = Object.freeze({ choices: [{ label: "A", value: "a" }, { label: "B", value: "b", disabled: true }, { label: "C", value: "c" }], get onChange() { reads++; return callback; } });
    const first = h.root("checkbox"), second = h.root("checkbox"), one = h.bind(first, options), two = h.bind(second, options);
    h.inputs(first)[0].click(); h.inputs(first)[1].click(); h.inputs(second)[2].click();
    const values = [one.value(), two.value()]; one.dispose(); two.dispose(); return { reads, calls, values };
  });
  expect(result).toEqual({ reads: 2, calls: [[["a"], true, true, "change"], [["c"], true, true, "change"]], values: [["a"], ["c"]] });
});

test("adoption guards public writes and disposal until the exact claim is released", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup, root = h.root(), choices = [{ label: "A", value: "a" }], handle = h.bind(root, { choices, value: "a" });
    const binding = h.get(root)!, release = h.claim(binding), before = root.innerHTML;
    const locked = [() => handle.setChoices([]), () => handle.setValue(null), () => handle.dispose(), () => h.claim(binding), () => h.bind(root, { choices })].map(action => h.code(action));
    const preserved = root.innerHTML === before && handle.value() === "a";
    release(); handle.setValue(null); const released = handle.value(); handle.dispose(); handle.dispose();
    const disposed = h.code(() => handle.value()), stale = h.code(() => h.claim(binding));
    const next = h.bind(root, { choices }), nextRelease = h.claim(h.get(root)!); release();
    const nextStillLocked = h.code(() => next.setValue("a")); nextRelease(); next.dispose(); return { locked, preserved, released, disposed, stale, nextStillLocked };
  });
  expect(result).toEqual({ locked: Array(5).fill("CHOICE_OWNED"), preserved: true, released: null, disposed: "CHOICE_DISPOSED", stale: "CHOICE_DISPOSED", nextStillLocked: "CHOICE_OWNED" });
});

test("disposal restores exact authored nodes attributes and quiet late events including a disabled empty root", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.choiceGroup, root = h.root("checkbox"), authored = [...root.childNodes], html = root.outerHTML; let calls = 0;
    const handle = h.bind(root, { choices: [{ label: "A", value: "a" }], onChange() { calls++; } }), input = h.inputs(root)[0];
    handle.setChoices([]); handle.dispose(); input.dispatchEvent(new Event("change", { bubbles: true }));
    const disabled = h.root(); disabled.disabled = true;
    const disabledHtml = disabled.outerHTML, empty = h.bind(disabled, { choices: [] }); empty.dispose();
    return { restored: root.outerHTML === html, nodes: authored.every((node, index) => root.childNodes[index] === node), calls, noOwner: h.get(root) === undefined,
      disabledRestored: disabled.outerHTML === disabledHtml, disabledTabindex: disabled.hasAttribute("tabindex") };
  });
  expect(result).toEqual({ restored: true, nodes: true, calls: 0, noOwner: true, disabledRestored: true, disabledTabindex: false });
});

test("native keyboard interaction skips disabled radio choices and toggles checkbox arrays", async ({ page }) => {
  await page.evaluate(() => {
    const h = window.choiceGroup, radio = h.root(), checks = h.root("checkbox"); radio.dataset.keyboard = "radio"; checks.dataset.keyboard = "checks";
    h.bind(radio, { choices: [{ label: "Alpha", value: "a" }, { label: "Blocked", value: "b", disabled: true }, { label: "Charlie", value: "c" }], value: "a" });
    h.bind(checks, { choices: [{ label: "One", value: "one" }] });
  });
  const radios = page.locator('[data-keyboard="radio"] input'); await radios.nth(0).focus(); await page.keyboard.press("ArrowRight");
  await expect(radios.nth(2)).toBeChecked(); await expect(radios.nth(2)).toBeFocused();
  const checkbox = page.locator('[data-keyboard="checks"] input'); await checkbox.focus(); await page.keyboard.press("Space"); await expect(checkbox).toBeChecked();
  expect(await page.evaluate(() => window.choiceGroup.get(document.querySelector<HTMLFieldSetElement>('[data-keyboard="checks"]')!)!.read())).toEqual(["one"]);
});
