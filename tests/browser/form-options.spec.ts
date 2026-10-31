// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows, RowId } from "../../src/data/index.js";
import type { FormHandle, SelectValue } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindGrid } from "../../src/ui/grid.js";
import type { bindList } from "../../src/ui/list.js";
import type { bindSelect } from "../../src/ui/select.js";

type Item = { name: string; allow: boolean;
  assignment: { chosen: SelectValue; selected: readonly SelectValue[]; shifts: unknown };
  alternate: { chosen: SelectValue; shifts: unknown } };
type FormOptions = NonNullable<Parameters<typeof bindForm<Item>>[1]>;
type Api = { bindForm: typeof bindForm; bindGrid: typeof bindGrid; bindList: typeof bindList; bindSelect: typeof bindSelect };
declare global {
  interface Window {
    formChoices: {
      api: Api; rows: Rows<Item>; ids: readonly RowId[]; single: string; multiple: string;
      owners: { dispose(): void }[];
      options(values: readonly SelectValue[]): { meta: { label: string }; code: SelectValue }[];
      root(html: string): HTMLFormElement;
      make(html?: string, extra?: Partial<FormOptions>): { root: HTMLFormElement; form: FormHandle<Item>; original: string };
      select(root: ParentNode, path?: string): HTMLSelectElement;
      choose(select: HTMLSelectElement, indexes: readonly number[]): void;
      ownerRows(): { grid: ReturnType<typeof bindGrid<Item>>; list: ReturnType<typeof bindList<Item>>; table: HTMLTableElement; listRoot: HTMLUListElement };
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { data: source("../../src/data/index.ts"), form: source("../../src/ui/form.ts"),
  grid: source("../../src/ui/grid.ts"), list: source("../../src/ui/list.ts"), select: source("../../src/ui/select.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ createRows }, form, grid, list, select] = await Promise.all([
      import(modules.data), import(modules.form), import(modules.grid), import(modules.list), import(modules.select)
    ]);
    const choices = (values: readonly SelectValue[]) => values.map((code, index) => ({ meta: { label: `Choice ${index}` }, code }));
    const rows: Rows<Item> = createRows([
      { name: "First", allow: false, assignment: { chosen: 1, selected: [1], shifts: choices([1, 2]) }, alternate: { chosen: false, shifts: choices([false]) } },
      { name: "Second", allow: false, assignment: { chosen: false, selected: [false], shifts: choices([false, "2"]) }, alternate: { chosen: 9, shifts: choices([9]) } }
    ]);
    const single = '<label>Choice <select data-field="assignment.chosen" data-options="assignment.shifts" data-option-label="meta.label" data-option-value="code"><option value="">Choose</option><optgroup label="Authored"><option value="manual" selected>Manual</option><option value="blocked" disabled>Blocked</option></optgroup></select></label><output data-error-for="assignment.chosen"></output>';
    const multiple = '<label>Choices <select multiple data-field="assignment.selected" data-options="assignment.shifts" data-option-label="meta.label" data-option-value="code"><option value="">None</option></select></label><output data-error-for="assignment.selected"></output>';
    const h: Window["formChoices"] = {
      api: { ...form, ...grid, ...list, ...select }, rows, ids: rows.entries().map(row => row.id), single, multiple, owners: [], options: choices,
      root(html) { const root = document.createElement("form"); root.innerHTML = html; document.body.append(root); return root; },
      make(html = single + multiple, extra = {}) {
        const root = h.root(html), original = root.innerHTML;
        const handle = h.api.bindForm(root, { rows, ...extra }); h.owners.push(handle); handle.bind(h.ids[0]);
        return { root, form: handle, original };
      },
      select: (root, path = "assignment.chosen") => root.querySelector<HTMLSelectElement>(`select[data-field="${path}"]`)!,
      choose(element, indexes) {
        if (!element.multiple) element.selectedIndex = indexes[0] ?? -1;
        else for (const [index, option] of [...element.options].entries()) option.selected = indexes.includes(index);
        element.dispatchEvent(new Event("change", { bubbles: true }));
      },
      ownerRows() {
        const table = document.createElement("table"); table.innerHTML = `<caption>Shared choices</caption><thead><tr><th scope="col">Choice</th><th scope="col">Choices</th></tr></thead><tbody><tr data-row-template><td>${single}</td><td>${multiple}</td></tr></tbody>`;
        const listRoot = document.createElement("ul"); listRoot.innerHTML = `<li data-row-template>${single}${multiple}</li>`;
        document.body.append(table, listRoot);
        const grid = h.api.bindGrid(table, { rows }), list = h.api.bindList(listRoot, { rows }); h.owners.push(grid, list);
        return { grid, list, table, listRoot };
      }
    }; window.formChoices = h;
  }, modules);
});

test("Form binds nested typed choices with safe text and retained authored option nodes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, row = h.rows.get(h.ids[0])!;
    h.rows.set(row.id, "assignment", { ...row.value.assignment, shifts: [
      { meta: { label: "<b>Numeric</b>" }, code: 1 }, {}, { meta: { label: "" }, code: 2 },
      { meta: { label: 0 }, code: false }, { meta: { label: false }, code: null }
    ] });
    const root = h.root(h.single), select = h.select(root), children = [...select.childNodes], authored = [...select.options];
    const form = h.api.bindForm(root, { rows: h.rows }); form.bind(row.id);
    const generated = [...select.options].slice(authored.length);
    const bound = { text: generated.map(option => option.textContent), safe: select.querySelector("b") === null,
      selected: select.selectedIndex, raw: (form.read().assignment as { chosen: unknown }).chosen, same: children.every((node, index) => select.childNodes[index] === node) };
    form.dispose();
    return { bound, restored: children.every((node, index) => select.childNodes[index] === node) &&
      select.options.length === authored.length && authored[1].selected };
  });
  expect(result).toEqual({ bound: { text: ["<b>Numeric</b>", "0", "false"], safe: true, selected: 3, raw: 1, same: true }, restored: true });
});

test("single Form changes preserve zero signs number-string booleans null and generated empty-string identities", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, row = h.rows.get(h.ids[0])!, values: SelectValue[] = [0, -0, "0", false, null, ""];
    h.rows.set(row.id, "assignment", { ...row.value.assignment, chosen: 0, shifts: h.options(values) });
    const owner = h.make(h.single), select = h.select(owner.root), matches: boolean[] = [];
    for (const [index, expected] of values.entries()) {
      h.choose(select, [index + 3]); matches.push(Object.is(h.rows.get(row.id)!.value.assignment.chosen, expected));
    }
    const generatedEmpty = h.rows.get(row.id)!.value.assignment.chosen === "";
    h.choose(select, [0]);
    return { matches, generatedEmpty, authoredBlank: h.rows.get(row.id)!.value.assignment.chosen === null,
      valid: owner.form.validate().valid, count: select.options.length };
  });
  expect(result).toEqual({ matches: [true, true, true, true, true, true], generatedEmpty: true, authoredBlank: true, valid: true, count: 9 });
});

test("Form Grid and List consume duplicate raw occurrences without normalizing unrepresentable arrays", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, first = h.rows.get(h.ids[0])!;
    h.rows.set(first.id, "assignment", { ...first.value.assignment, selected: [1, 1], shifts: h.options([1, 1, "1"]) });
    const owner = h.make(), peers = h.ownerRows();
    const controls = () => [h.select(owner.root, "assignment.selected"), h.select(peers.table, "assignment.selected"), h.select(peers.listRoot, "assignment.selected")];
    const initial = controls().map(select => [...select.selectedOptions].map(option => option.index));
    const valid = [owner.form, peers.grid, peers.list].every(handle => handle.validate(first.id).valid);
    const current = h.rows.get(first.id)!.value.assignment;
    h.rows.set(first.id, "assignment", { ...current, shifts: h.options([1, "1"]) });
    const after = controls().map(select => [...select.selectedOptions].map(option => option.index));
    const invalid = [owner.form, peers.grid, peers.list].map(handle => handle.validate(first.id).issues.filter(issue => issue.field === "assignment.selected").map(issue => issue.rule));
    return { initial, valid, after, invalid, raw: h.rows.get(first.id)!.value.assignment.selected };
  });
  expect(result).toEqual({ initial: [[1, 2], [1, 2], [1, 2]], valid: true, after: [[1], [1], [1]],
    invalid: [["select-option"], ["select-option"], ["select-option"]], raw: [1, 1] });
});

test("Grid array paste enforces available duplicate counts atomically across shared Form and List", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, row = h.rows.get(h.ids[0])!;
    h.rows.set(row.id, "assignment", { ...row.value.assignment, shifts: h.options([1, 1, 2]) });
    const owner = h.make(), peers = h.ownerRows();
    const accepted = peers.grid.paste('"[1,1]"', { id: row.id, field: "assignment.selected" });
    const selected = [owner.root, peers.table, peers.listRoot].map(root => h.select(root, "assignment.selected").selectedOptions.length);
    const current = h.rows.get(row.id)!.value.assignment; h.rows.set(row.id, "assignment", { ...current, shifts: h.options([1, 2]) });
    const before = h.rows.entries(), rejected = peers.grid.paste('"[1,1]"', { id: row.id, field: "assignment.selected" });
    return { accepted: accepted.valid, selected, rejected: !rejected.valid && rejected.issues.some(issue => issue.rule === "paste" && issue.field === "assignment.selected"),
      atomic: h.rows.entries() === before, raw: h.rows.get(row.id)!.value.assignment.selected };
  });
  expect(result).toEqual({ accepted: true, selected: [2, 2, 2], rejected: true, atomic: true, raw: [1, 1] });
});

test("typed Form selection updates shared owners and unrelated writes retain option identity and focus", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, owner = h.make(), peers = h.ownerRows(), select = h.select(owner.root);
    h.choose(select, [4]); const options = [...select.options]; select.focus();
    h.rows.set(h.ids[0], "name", "Unrelated");
    return { raw: h.rows.get(h.ids[0])!.value.assignment.chosen, read: (owner.form.read().assignment as { chosen: unknown }).chosen,
      peers: [h.select(peers.table), h.select(peers.listRoot)].map(control => control.selectedOptions[0]?.textContent),
      same: options.every((option, index) => select.options[index] === option), focus: document.activeElement === select,
      changed: select.getAttribute("data-field-changed"), valid: owner.form.validate().valid };
  });
  expect(result).toEqual({ raw: 2, read: 2, peers: ["Choice 1", "Choice 1"], same: true, focus: true, changed: "true", valid: true });
});

test("removed and reintroduced choices retain a raw invalid draft until explicit validation can commit it", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, owner = h.make(h.single, { rules: { fields: { "assignment.chosen": { validate: [["allowed"]] } },
      validate: { allowed: (_value, _args, context) => context.values.allow === true || "Not allowed yet" } } });
    const select = h.select(owner.root); h.choose(select, [4]);
    const initial = h.rows.get(h.ids[0])!.value.assignment.chosen;
    const current = h.rows.get(h.ids[0])!.value.assignment; h.rows.set(h.ids[0], "assignment", { ...current, shifts: h.options([1]) });
    const absent = select.selectedIndex === -1 && h.rows.get(h.ids[0])!.value.assignment.chosen === 1;
    const rejected = owner.form.validate().issues.map(issue => issue.rule);
    h.rows.set(h.ids[0], "assignment", { ...h.rows.get(h.ids[0])!.value.assignment, shifts: h.options([1, 2]) });
    h.rows.set(h.ids[0], "allow", true);
    const before = h.rows.get(h.ids[0])!.value.assignment.chosen, accepted = owner.form.validate();
    return { initial, absent, rejected, before, valid: accepted.valid, after: h.rows.get(h.ids[0])!.value.assignment.chosen,
      label: select.selectedOptions[0]?.textContent };
  });
  expect(result).toEqual({ initial: 1, absent: true, rejected: ["select-option", "allowed"], before: 1, valid: true, after: 2, label: "Choice 1" });
});

test("hidden Form validation uses the target row choices without changing visible native options focus or errors", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, owner = h.make(h.single, { rules: { fields: { "assignment.chosen": { validate: [["allowed"]] } },
      validate: { allowed: (_value, _args, context) => context.values.allow === true || "Wait" } } });
    h.choose(h.select(owner.root), [4]); owner.form.bind(h.ids[1]);
    const select = h.select(owner.root), nodes = [...select.childNodes], selected = select.selectedIndex,
      text = owner.root.querySelector("output")!.textContent; select.focus();
    const observer = new MutationObserver(() => {}); observer.observe(owner.root, { subtree: true, attributes: true, childList: true, characterData: true });
    h.rows.set(h.ids[0], "allow", true); const result = owner.form.validate(h.ids[0]);
    const mutations = observer.takeRecords().length; observer.disconnect();
    return { valid: result.valid, stored: h.rows.get(h.ids[0])!.value.assignment.chosen,
      visible: h.rows.get(h.ids[1])!.value.assignment.chosen, same: nodes.every((node, index) => select.childNodes[index] === node),
      selected: select.selectedIndex === selected, errors: owner.root.querySelector("output")!.textContent === text,
      focus: document.activeElement === select, mutations };
  });
  expect(result).toEqual({ valid: true, stored: 2, visible: false, same: true, selected: true, errors: true, focus: true, mutations: 0 });
});

test("required raw blanks and empty arrays remain full checks while automatic bypass preserves typed integrity", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, row = h.rows.get(h.ids[0])!;
    h.rows.set(row.id, "assignment", { ...row.value.assignment, shifts: h.options([1, null, ""]) });
    const owner = h.make(h.single.replace("<select ", "<select required ") + h.multiple.replace("<select ", "<select required "), { autoValidate: false });
    const single = h.select(owner.root), multiple = h.select(owner.root, "assignment.selected");
    h.choose(single, [5]); h.choose(multiple, []);
    const committed = h.rows.get(row.id)!.value.assignment.chosen === "" && h.rows.get(row.id)!.value.assignment.selected.length === 0;
    const required = owner.form.validate().issues.map(issue => [issue.field, issue.rule]);
    h.choose(multiple, [0]); h.choose(single, [3]); const valid = owner.form.validate().valid;
    return { committed, required, valid, selected: h.rows.get(row.id)!.value.assignment.selected };
  });
  expect(result).toEqual({ committed: true, required: [["assignment.chosen", "html"], ["assignment.selected", "html"]], valid: true, selected: [null] });
});

test("foreign and disabled option gestures stay drafts while native custom validity remains an explicit constraint", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, owner = h.make(h.single, { autoValidate: false }), select = h.select(owner.root), id = h.ids[0];
    select.add(new Option("Foreign same string", "manual")); h.choose(select, [select.options.length - 1]);
    const foreign = select.getAttribute("aria-invalid") === "true" && h.rows.get(id)!.value.assignment.chosen === 1;
    h.choose(select, [2]); const blocked = select.getAttribute("aria-invalid") === "true" && h.rows.get(id)!.value.assignment.chosen === 1;
    h.choose(select, [4]); select.setCustomValidity("Application native error");
    const custom = owner.form.validate().issues.map(issue => issue.message);
    select.disabled = true; const disabled = owner.form.validate().valid; select.disabled = false; select.setCustomValidity("");
    return { foreign, blocked, custom, disabled, raw: h.rows.get(id)!.value.assignment.chosen };
  });
  expect(result).toEqual({ foreign: true, blocked: true, custom: ["Application native error"], disabled: true, raw: 2 });
});

test("hidden typed Select validation does not inherit the visible control custom error or mutate its DOM", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, owner = h.make(h.single), select = h.select(owner.root);
    select.setCustomValidity("Current only");
    const current = owner.form.validate(h.ids[0]); select.focus(); const before = owner.root.innerHTML, nodes = [...select.options];
    const observer = new MutationObserver(() => {}); observer.observe(owner.root, { subtree: true, childList: true, attributes: true, characterData: true });
    const hidden = owner.form.validate(h.ids[1]), mutations = observer.takeRecords().length; observer.disconnect();
    return { current: current.issues.map(issue => issue.message), hidden: hidden.valid, mutations,
      same: owner.root.innerHTML === before && nodes.every((option, index) => select.options[index] === option),
      focus: document.activeElement === select, error: select.validationMessage, raw: h.rows.get(h.ids[1])!.value.assignment.chosen };
  });
  expect(result).toEqual({ current: ["Current only"], hidden: true, mutations: 0, same: true, focus: true, error: "Current only", raw: false });
});

test("Form and Grid reject foreign equal-string and mapped disabled option gestures even with automatic checks disabled", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, form = h.make(h.single, { autoValidate: false }), peers = h.ownerRows();
    peers.grid.dispose(); const grid = h.api.bindGrid(peers.table, { rows: h.rows, autoValidate: false }); h.owners.push(grid);
    return [{ root: form.root, handle: form.form }, { root: peers.table, handle: grid }].map(owner => {
      const select = h.select(owner.root), id = h.ids[0]; select.add(new Option("Foreign manual", "manual")); h.choose(select, [select.options.length - 1]);
      const foreign = h.rows.get(id)!.value.assignment.chosen === 1 && select.getAttribute("aria-invalid") === "true" &&
        owner.handle.validate(id).issues.some(issue => issue.rule === "select-option");
      h.choose(select, [2]);
      return { foreign, disabled: h.rows.get(id)!.value.assignment.chosen === 1 && select.getAttribute("aria-invalid") === "true" &&
        owner.handle.validate(id).issues.some(issue => issue.rule === "select-option"), raw: h.rows.get(id)!.value.assignment.chosen };
    });
  });
  expect(result).toEqual([{ foreign: true, disabled: true, raw: 1 }, { foreign: true, disabled: true, raw: 1 }]);
});

test("typed marker and parser failures release ownership while unmarked authored Select conversion stays unchanged", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, rejected: boolean[] = [];
    const cases = [h.single.replace('data-option-label="meta.label"', ""), h.single.replace('data-field="assignment.chosen"', ""),
      '<input data-field="assignment.chosen" data-options="assignment.shifts" data-option-label="meta.label" data-option-value="code">',
      h.single.replace('data-options="assignment.shifts"', 'data-options="assignment.__proto__"')];
    for (const html of cases) {
      const root = h.root(html), before = root.innerHTML; let failed = false;
      try { h.api.bindForm(root, { rows: h.rows }); } catch { failed = true; }
      rejected.push(failed && root.innerHTML === before);
    }
    for (const extra of [{}, { rows: h.rows, parse: { "assignment.chosen": Number } },
      { rows: h.rows, rules: { fields: { "assignment.chosen": { format: [["upper"]] } } } }]) {
      const root = h.root(h.single), before = root.innerHTML; let failed = false;
      try { h.api.bindForm(root, extra as FormOptions); } catch { failed = true; }
      const select = h.select(root); const standalone = h.api.bindSelect(select, { choices: [] }); standalone.dispose();
      rejected.push(failed && root.innerHTML === before);
    }
    const root = h.root('<label>Legacy choice <select data-field="assignment.chosen"><option value="1">One</option><option value="2">Two</option></select></label>');
    const plain = h.api.bindForm(root, { rows: h.rows, parse: { "assignment.chosen": Number } }); plain.bind(h.ids[0]); h.choose(h.select(root), [1]);
    const raw = h.rows.get(h.ids[0])!.value.assignment.chosen; plain.dispose();
    return { rejected, raw };
  });
  expect(result).toEqual({ rejected: Array(7).fill(true), raw: 2 });
});

test("a malformed second option source leaves the previous binding drafts and authored nodes intact", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, html = h.single + h.single.replaceAll("assignment", "alternate"), owner = h.make(html);
    const first = h.select(owner.root), second = h.select(owner.root, "alternate.chosen"); first.focus();
    const nodes = [...first.childNodes, ...second.childNodes], before = owner.root.innerHTML, read = owner.form.read();
    h.rows.set(h.ids[1], "alternate", { chosen: 9, shifts: "not an array" });
    let code = ""; try { owner.form.bind(h.ids[1]); } catch (cause) { code = (cause as { code: string }).code; }
    const preserved = owner.root.innerHTML === before && nodes.every((node, index) => [...first.childNodes, ...second.childNodes][index] === node);
    const unchangedRead = JSON.stringify(owner.form.read()) === JSON.stringify(read), focused = document.activeElement === first;
    h.rows.set(h.ids[1], "alternate", { chosen: 9, shifts: h.options([9]) }); owner.form.bind(h.ids[1]);
    return { code, preserved, unchangedRead, focused, after: [first.selectedOptions[0]?.textContent, second.selectedOptions[0]?.textContent],
      raw: (owner.form.read().assignment as { chosen: unknown }).chosen };
  });
  expect(result).toEqual({ code: "FORM_OPTIONS", preserved: true, unchangedRead: true, focused: true,
    after: ["Choice 0", "Choice 0"], raw: false });
});

test("null binding and Rows lifetime operations clear generated choices without rewriting raw data", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, owner = h.make(h.single), select = h.select(owner.root), id = h.ids[0], before = h.rows.entries();
    owner.form.bind(null); const cleared = select.options.length === 3 && h.rows.entries() === before;
    owner.form.bind(id); h.choose(select, [4]); h.rows.revert(id);
    const reverted = select.selectedOptions[0]?.textContent === "Choice 0" && h.rows.get(id)!.value.assignment.chosen === 1;
    h.rows.move(id); h.rows.appendState([{ value: { ...h.rows.get(id)!.value, name: "Appended" } as Item, status: "update" }]);
    const sameSelection = select.selectedOptions[0]?.textContent === "Choice 0";
    h.rows.remove(id); const removed = select.options.length === 3;
    h.rows.replace([]); return { cleared, reverted, sameSelection, removed, empty: select.options.length === 3, count: h.rows.entries().length };
  });
  expect(result).toEqual({ cleared: true, reverted: true, sameSelection: true, removed: true, empty: true, count: 0 });
});

test("a formatter that changes Rows cannot install stale later-field choices", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices; let mutate = false;
    const owner = h.make('<span data-field="name" data-format=\'[["watch"]]\'></span>' + h.single, { rules: { format: { watch: value => {
      if (mutate) { mutate = false; h.rows.set(h.ids[0], "assignment", { ...h.rows.get(h.ids[0])!.value.assignment, chosen: 9,
        shifts: [{ meta: { label: "Latest" }, code: 9 }] }); } return value;
    } } } });
    mutate = true; owner.form.bind(h.ids[0]); const select = h.select(owner.root);
    return { labels: [...select.options].slice(3).map(option => option.textContent), selected: select.selectedOptions[0]?.textContent,
      raw: h.rows.get(h.ids[0])!.value.assignment.chosen, read: (owner.form.read().assignment as { chosen: unknown }).chosen };
  });
  expect(result).toEqual({ labels: ["Latest"], selected: "Latest", raw: 9, read: 9 });
});

test("formatter disposal stops stale choice work and releases exact authored Select ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices; let dispose = false, form: FormHandle<Item> | undefined;
    const root = h.root('<span data-field="name" data-format=\'[["watch"]]\'></span>' + h.single), select = h.select(root), nodes = [...select.childNodes], selected = [...select.options].map(option => option.selected);
    form = h.api.bindForm(root, { rows: h.rows, rules: { format: { watch: value => { if (dispose) form!.dispose(); return value; } } } });
    form.bind(h.ids[0]); dispose = true; form.bind(h.ids[0]);
    const restored = nodes.every((node, index) => select.childNodes[index] === node) && select.options.length === 3 &&
      [...select.options].every((option, index) => option.selected === selected[index]);
    const standalone = h.api.bindSelect(select, { choices: [] }); standalone.dispose();
    return { restored, raw: h.rows.get(h.ids[0])!.value.assignment.chosen, owned: !select.hasAttribute("aria-describedby") };
  });
  expect(result).toEqual({ restored: true, raw: 1, owned: true });
});

test("ready Form writes recheck changed choice sources and stop after a subscriber rebinds the Form", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formChoices, id = h.ids[0], html = '<label>Note <input data-field="name"></label><output data-error-for="name"></output>' + h.single;
    const rules: FormOptions["rules"] = { fields: { name: { validate: [["noteReady"]] } }, validate: {
      noteReady: (_value, _args, context) => (context.values.assignment as { chosen: unknown }).chosen === 1 || "Choose one first"
    } };
    h.rows.set(id, "assignment", { ...h.rows.get(id)!.value.assignment, chosen: 2 });
    const first = h.make(html, { rules }), note = first.root.querySelector<HTMLInputElement>('input[data-field="name"]')!;
    note.value = "Pending note"; note.dispatchEvent(new Event("input", { bubbles: true }));
    let remove = true;
    const unsubscribe = h.rows.subscribe(event => {
      if (remove && event.type === "set" && event.id === id && h.rows.get(id)!.value.name === "Pending note") {
        remove = false; h.rows.set(id, "assignment", { ...h.rows.get(id)!.value.assignment, shifts: h.options([2]) });
      }
    });
    h.choose(h.select(first.root), [3]); unsubscribe();
    const sourceChanged = { note: h.rows.get(id)!.value.name, raw: h.rows.get(id)!.value.assignment.chosen,
      missing: h.select(first.root).selectedIndex === -1, invalid: first.form.validate(id).issues.some(issue => issue.rule === "select-option") };
    first.form.dispose();
    h.rows.set(id, "name", "Original note"); h.rows.set(id, "assignment", { ...h.rows.get(id)!.value.assignment, chosen: 2, shifts: h.options([1, 2]) });
    const second = h.make(html, { rules }), nextNote = second.root.querySelector<HTMLInputElement>('input[data-field="name"]')!;
    nextNote.value = "Rebound note"; nextNote.dispatchEvent(new Event("input", { bubbles: true }));
    let rebind = true;
    const stop = h.rows.subscribe(event => {
      if (rebind && event.type === "set" && event.id === id && h.rows.get(id)!.value.name === "Rebound note") {
        rebind = false; second.form.bind(h.ids[1]);
      }
    });
    h.choose(h.select(second.root), [3]); stop();
    return { sourceChanged, rebound: { note: h.rows.get(id)!.value.name, oldChoice: h.rows.get(id)!.value.assignment.chosen,
      visibleNote: nextNote.value, visibleChoice: (second.form.read().assignment as { chosen: unknown }).chosen,
      label: h.select(second.root).selectedOptions[0]?.textContent } };
  });
  expect(result).toEqual({ sourceChanged: { note: "Pending note", raw: 2, missing: true, invalid: true },
    rebound: { note: "Rebound note", oldChoice: 2, visibleNote: "Second", visibleChoice: false, label: "Choice 0" } });
});

test("independent Forms expose unique accessible errors and dispose quietly with original option selection", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formChoices, first = h.make(h.single.replace("<select ", "<select required ")), second = h.make(h.single.replace("<select ", "<select required "));
    const selects = [h.select(first.root), h.select(second.root)], errors = [first.root, second.root].map(root => root.querySelector("output")!);
    selects.forEach(select => h.choose(select, [0]));
    const accessible = errors[0].id !== errors[1].id && selects.every((select, index) => select.getAttribute("aria-describedby") === errors[index].id && select.getAttribute("aria-invalid") === "true");
    first.form.dispose(); first.form.dispose(); second.form.dispose();
    let mutations = 0; const observer = new MutationObserver(records => mutations += records.length);
    observer.observe(first.root, { subtree: true, childList: true, attributes: true });
    h.rows.set(h.ids[0], "assignment", { ...h.rows.get(h.ids[0])!.value.assignment, shifts: h.options([9]) });
    selects[0].dispatchEvent(new Event("change", { bubbles: true })); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); observer.disconnect();
    return { accessible, mutations, original: first.root.innerHTML === first.original && second.root.innerHTML === second.original,
      selected: selects.map(select => select.selectedOptions[0]?.value), claims: selects.map(select => { const standalone = h.api.bindSelect(select, { choices: [] }); standalone.dispose(); return true; }) };
  });
  expect(result).toEqual({ accessible: true, mutations: 0, original: true, selected: ["manual", "manual"], claims: [true, true] });
});

test("full inline and popup CVC details share typed shift choices with the main Grid", async ({ page }) => {
  await page.goto("/m10/demo.html"); const row = page.locator('[data-grid] tbody tr[data-row-status]').first();
  await row.locator('[data-row-action="detail-inline"]').click();
  const inline = page.locator('[data-detail-inline-host] [data-detail-row]'), choice = inline.locator('[data-field="assignment.chosen"]');
  await expect(choice).toHaveAttribute("data-options", "assignment.shifts"); await choice.selectOption("2");
  await expect(row.locator('[data-field="assignment.chosen"]')).toHaveValue("2"); await expect(page.locator('[data-changes]')).toContainText('"chosen": 2');
  await row.locator('[data-row-action="detail-popup"]').click(); const dialog = page.locator('[data-detail-dialog]');
  await expect(dialog.locator('[data-field="assignment.chosen"]')).toHaveValue("2"); await dialog.locator('[data-field="assignment.chosen"]').selectOption("1");
  await expect(choice).toHaveValue("1"); await expect(row.locator('[data-field="assignment.chosen"]')).toHaveValue("1");
  await dialog.locator('[data-detail-close]').click(); await inline.locator('[data-detail-close]').click();
  await expect(page.locator('[data-detail-inline-host]')).toBeEmpty();
});
