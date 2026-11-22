// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { bindChoiceGroup, bindForm, bindSelect, SelectValue } from "../../src/ui/index.js";

const entry = `/@fs/${fileURLToPath(new URL("../../src/ui/index.ts", import.meta.url)).replaceAll("\\", "/")}`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
});

test("native Select mutations preserve raw occurrences, optgroups and captured change receiver", async ({ page }) => {
  const result = await page.evaluate(async entry => {
    const { bindSelect: bind }: { bindSelect: typeof bindSelect } = await import(entry);
    const form = document.createElement("form");
    form.innerHTML = `<label>Size <select multiple><option value="">Any</option>
      <optgroup label="Authored"><option value="1" selected>String one</option><option value="B">B</option></optgroup></select></label>`;
    document.body.append(form);
    const root = form.querySelector("select")!, original = [...root.options];
    const events: unknown[] = [];
    const options: Parameters<typeof bind<SelectValue>>[1] = {
      choices: [{ value: 1, label: "One" }, { value: 1, label: "Another one", disabled: true }, { value: false, label: "False" }],
      onChange: function (value, event) { "use strict"; events.push([this === undefined, event.target === root, value]); }
    };
    const handle = bind(root, options);
    options.onChange = () => events.push("late replacement");
    handle.setIndexes([4, 5]);
    const selected = root.options[4];
    handle.appendChoices([{ value: "", label: "Empty string" }]);
    const appended = [handle.indexes(), handle.value(), root.options[4] === selected];
    handle.removeChoices("1");
    const afterAuthored = [handle.indexes(), handle.value(), root.options[3] === selected, root.options[1] === original[2]];
    const before = [...root.options];
    handle.removeChoices("missing");
    const noMutation = before.every((option, index) => option === root.options[index]);
    const invalid = [[1, 1], [100], [1.5], Array<number>(1)].map(indexes => {
      try { handle.setIndexes(indexes); return "passed"; } catch (error) { return (error as { code: string }).code; }
    });
    const preserved = handle.indexes();
    handle.removeChoices(1);
    const afterNumeric = [handle.indexes(), handle.value()];
    handle.reset(); const defaults = handle.indexes();
    handle.reset("first"); const first = [handle.indexes(), handle.value()];
    handle.reset("clear"); const clear = handle.indexes();
    handle.setIndexes([2, 3]); root.dispatchEvent(new Event("change", { bubbles: true }));
    handle.dispose();
    const restored = original.every((option, index) => option === root.options[index]) && original[1].defaultSelected && original[1].selected;
    const exclusive = bind(root, { retainAuthored: false, choices: [{ value: 0, label: "Only generated" }] });
    const retained = [...root.options].map(option => option.text);
    exclusive.dispose();
    return { appended, afterAuthored, noMutation, invalid, preserved, afterNumeric, defaults, first, clear, events, restored, retained };
  }, entry);
  expect(result).toEqual({ appended: [[4, 5], [1, false], true], afterAuthored: [[3, 4], [1, false], true, true], noMutation: true,
    invalid: Array(4).fill("SELECT_INDEX"), preserved: [3, 4], afterNumeric: [[2], [false]], defaults: [], first: [[0], [null]],
    clear: [], events: [[true, true, [false, ""]]], restored: true, retained: ["Only generated"] });
});

test("native removal failure restores the exact nested option and leaves later mutations usable", async ({ page }) => {
  const result = await page.evaluate(async entry => {
    const { bindSelect: bind, bindForm: form }: { bindSelect: typeof bindSelect; bindForm: typeof bindForm } = await import(entry);
    const scope = document.createElement("form");
    scope.innerHTML = `<label>Option <select data-field="choice"><optgroup label="Defaults"><option value="a" selected>A</option><option value="b">B</option></optgroup></select></label>`;
    document.body.append(scope); const root = scope.querySelector("select")!;
    const handle = bind<string>(root, { choices: [{ value: "b", label: "Other B" }] }), original = [...root.options];
    handle.reset("clear");
    const remove = original[0].remove.bind(original[0]);
    let armed = true, failure = "";
    original[0].remove = () => { remove(); if (armed) { armed = false; throw new Error("remove failed"); } };
    try { handle.removeChoices("a"); } catch (error) { failure = (error as Error).message; }
    const restored = original.every((option, index) => option === root.options[index]) && root.selectedIndex === -1 && original[0].defaultSelected;
    handle.removeChoices("a"); handle.reset(); const after = [handle.indexes(), handle.value()];
    handle.setIndexes([1]); handle.appendChoices([{ value: "c", label: "C" }]);
    const exact = handle.indexes(); const owner = form(scope);
    handle.appendChoices([{ value: "d", label: "D" }]);
    const adopted = handle.indexes(); owner.dispose();
    handle.dispose(); return { failure, restored, after, exact, adopted };
  }, entry);
  expect(result).toEqual({ failure: "remove failed", restored: true, after: [[0], "b"], exact: [1], adopted: [1] });
});

test("Form disposal during nested option removal restores the committed tree for the next owner", async ({ page }) => {
  const actual = await page.evaluate(async entry => {
    const { bindSelect: bind, bindForm: form }: { bindSelect: typeof bindSelect; bindForm: typeof bindForm } = await import(entry);
    const scope = document.createElement("form");
    scope.innerHTML = `<label>Size <select data-field="choice"><optgroup label="Sizes"><option selected>A</option><option>B</option></optgroup></select></label>`;
    document.body.append(scope);
    const root = scope.querySelector("select")!, old = root.options[0], handle = bind(root, { choices: [] }), owner = form(scope);
    const remove = old.remove.bind(old);
    let next: ReturnType<typeof form> | undefined;
    old.remove = () => { remove(); owner.dispose(); next = form(scope); };
    let error = "";
    try { handle.removeChoices("A"); } catch (cause) { error = (cause as { code: string }).code; }
    const outcome = [error, root.options[0] === old, handle.indexes(), handle.value(), next?.read()];
    next?.dispose(); handle.dispose(); return outcome;
  }, entry);
  expect(actual).toEqual(["SELECT_STALE", true, [0], "A", { choice: "A" }]);
});

test("generated group mutations retain native defaults and emit only native changes", async ({ page }) => {
  const result = await page.evaluate(async entry => {
    const { bindChoiceGroup: bind }: { bindChoiceGroup: typeof bindChoiceGroup } = await import(entry);
    const root = document.createElement("fieldset");
    root.innerHTML = `<legend>Channels</legend><template data-choice-template><label><input type="checkbox"><span data-choice-label></span></label></template>`;
    document.body.append(root);
    const events: unknown[] = [];
    const handle = bind(root, { choices: [{ value: "a", label: "A" }, { value: "b", label: "B" }], value: ["b"],
      onChange: function (value, event) { "use strict"; events.push([this === undefined, (event.target as HTMLInputElement).value, value]); } });
    handle.appendChoices([{ value: "c", label: "C" }]);
    handle.setIndexes([2, 0]);
    const byIndex = [handle.indexes(), handle.value()];
    handle.removeChoices("a");
    const removed = [handle.indexes(), handle.value()];
    const old = root.querySelector<HTMLInputElement>("input")!;
    handle.removeChoices("missing");
    const unchanged = old === root.querySelector("input");
    let rejected = "";
    try { handle.appendChoices([{ value: "b", label: "Duplicate" }]); } catch (error) { rejected = (error as { code: string }).code; }
    const rolledBack = old === root.querySelector("input");
    handle.reset(); const defaults = handle.value();
    handle.reset("clear"); const clear = handle.value();
    handle.reset("first"); const first = handle.value();
    root.querySelectorAll("input")[1].click();
    handle.removeChoices("b"); handle.removeChoices("c"); handle.reset("first");
    const empty = [handle.indexes(), handle.value()];
    handle.dispose(); return { byIndex, removed, unchanged, rejected, rolledBack, defaults, clear, first, events, empty };
  }, entry);
  expect(result).toEqual({ byIndex: [[0, 2], ["a", "c"]], removed: [[1], ["c"]], unchanged: true, rejected: "CHOICE_OPTIONS",
    rolledBack: true, defaults: ["b"], clear: [], first: ["b"], events: [[true, "c", ["b", "c"]]], empty: [[], []] });
});
