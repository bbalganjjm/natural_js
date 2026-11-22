// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type * as Data from "../../src/data/index.js";
import type * as Ui from "../../src/ui/index.js";
import type * as Harness from "./fixtures/generated-row-controls.js";

const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { data: source("../../src/data/index.ts"), ui: source("../../src/ui/index.ts"),
  harness: source("./fixtures/generated-row-controls.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
});

test("Form mediates Select and group catalog mutations without writing or losing row drafts", async ({ page }) => {
  const result = await page.evaluate(async urls => {
    const { createRows }: typeof Data = await import(urls.data);
    const { bindForm, bindSelect, bindChoiceGroup }: typeof Ui = await import(urls.ui);
    const h: typeof Harness = await import(urls.harness);
    const root = document.createElement("form");
    root.innerHTML = `<label>Choice <select data-field="chosen" data-options="choices" data-option-label="label" data-option-value="value"><option value="">Choose</option></select></label>${h.field("checkbox")}`;
    document.body.append(root);
    const element = root.querySelector("select")!, fieldset = root.querySelector("fieldset")!;
    const input = (code: string) => [...fieldset.querySelectorAll("input")].find(input => input.value === code)!;
    const calls: unknown[] = [];
    const select = bindSelect<Ui.SelectValue>(element, { choices: [{ label: "Zero", value: 0 }], value: 0,
      onChange(value) { calls.push(value); } });
    const group = bindChoiceGroup(fieldset, { choices: [h.option("home")], value: ["home"],
      onChange(value) { calls.push(value); } });
    const rows = createRows(["draft", "other"].map(code => ({ chosen: 0,
      choices: [{ label: "Row false", value: false }], model: { pick: ["home"] }, codes: { items: [h.option(code)] } })));
    const [id, other] = rows.entries().map(row => row.id); let writes = 0, hooks = 0;
    const form = bindForm(root, { rows, beforeBindValue() { hooks++; }, rules: {
      fields: { chosen: { validate: [["keepZero"]] }, "model.pick": { validate: [["keepHome"]] } },
      validate: { keepZero: value => value === "0" || "Keep zero", keepHome: value => value === "home" || "Keep home" }
    } });
    form.bind(id); const off = rows.subscribe(() => writes++), beforeDrafts = rows.get(id);
    element.selectedIndex = 2; element.dispatchEvent(new Event("change", { bubbles: true }));
    input("draft").click(); input("draft").focus();
    const beforeHooks = hooks;
    const locked = [h.code(() => select.setIndexes([0])), h.code(() => select.reset("first")),
      h.code(() => group.setIndexes([0])), h.code(() => group.reset("clear"))];
    const priorInput = input("draft");
    const duplicate = h.code(() => group.appendChoices([h.option("draft")]));
    const noMutation = input("draft") === priorInput && document.activeElement === priorInput;
    select.appendChoices([{ label: "Common one", value: 1 }]); select.removeChoices(0);
    group.appendChoices([h.option("common")]); group.removeChoices("home");
    const after = { select: select.value(), selectIndexes: select.indexes(), group: group.value(), groupIndexes: group.indexes(),
      focus: document.activeElement === input("draft"), label: input("draft").labels?.[0].textContent,
      quiet: hooks === beforeHooks, sameSource: rows.get(id) === beforeDrafts };
    form.bind(other);
    select.appendChoices([{ label: "Zero restored", value: 0 }]); group.appendChoices([h.option("home")]);
    form.bind(id);
    const returned = { select: select.value(), group: group.value(), defaults: form.defaults(), changes: rows.changes() };
    form.dispose(); select.reset("first"); group.reset("clear");
    const released = [select.indexes(), group.indexes()];
    group.dispose(); select.dispose(); off(); rows.dispose(); root.remove();
    return { locked, duplicate, noMutation, after, returned, released, writes, calls };
  }, modules);
  expect(result).toEqual({ locked: ["SELECT_OWNED", "SELECT_OWNED", "CHOICE_OWNED", "CHOICE_OWNED"],
    duplicate: "CHOICE_OPTIONS", noMutation: true,
    after: { select: false, selectIndexes: [2], group: ["draft"], groupIndexes: [1], focus: true,
      label: "Label draft", quiet: true, sameSource: true },
    returned: { select: false, group: ["home", "draft"], defaults: { chosen: 0, model: { pick: ["home"] } }, changes: [] },
    released: [[0], []], writes: 0, calls: [false, ["home", "draft"]] });
});

test("queued Rows changes roll back a provisional native catalog before rendering the new raw value", async ({ page }) => {
  const actual = await page.evaluate(async urls => {
    const { createRows }: typeof Data = await import(urls.data);
    const { bindForm, bindSelect }: typeof Ui = await import(urls.ui);
    const root = document.createElement("form");
    root.innerHTML = `<label>Size <select data-field="chosen"><optgroup label="Sizes"><option>A</option><option>B</option></optgroup></select></label>`;
    document.body.append(root);
    const element = root.querySelector("select")!, original = element.options[0];
    const select = bindSelect(element, { choices: [] }), rows = createRows([{ chosen: "A" }]), id = rows.entries()[0].id;
    const form = bindForm(root, { rows }); form.bind(id);
    const remove = original.remove.bind(original);
    original.remove = () => { remove(); rows.set(id, "chosen", "B"); };
    let error = "";
    try { select.removeChoices("A"); } catch (cause) { error = (cause as { code: string }).code; }
    const result = { error, restored: element.options[0] === original, value: select.value(), indexes: select.indexes(), source: form.read() };
    form.dispose(); select.dispose(); rows.dispose(); return result;
  }, modules);
  expect(actual).toEqual({ error: "FORM_OPTIONS", restored: true, value: "B", indexes: [1], source: { chosen: "B" } });
});

for (const kind of ["grid", "list"] as const) {
  test(`${kind} locks the captured choice handles and recaptures their catalogs after disposal`, async ({ page }) => {
    const result = await page.evaluate(async ({ urls, kind }) => {
      const { createRows }: typeof Data = await import(urls.data);
      const { bindGrid, bindList, bindSelect, bindChoiceGroup }: typeof Ui = await import(urls.ui);
      const h: typeof Harness = await import(urls.harness);
      const root = document.createElement(kind === "grid" ? "table" : "ul");
      const content = `<label>Choice <select data-field="chosen" data-options="choices" data-option-label="label" data-option-value="value"><option value="">Choose</option></select></label>${h.field("radio")}`;
      root.innerHTML = kind === "grid" ? `<caption>Choices</caption><tbody><tr data-row-template><td>${content}</td></tr></tbody>` : `<li data-row-template>${content}</li>`;
      document.body.append(root);
      const select = bindSelect<Ui.SelectValue>(root.querySelector("select")!, { choices: [{ label: "Common zero", value: 0 }] });
      const group = bindChoiceGroup(root.querySelector("fieldset")!, { choices: [h.option("common")] });
      const rows = createRows(["first", "second"].map(code => ({ chosen: false,
        choices: [{ label: `${code} false`, value: false }], model: { pick: code }, codes: { items: [h.option(code)] } })));
      const [id] = rows.entries().map(row => row.id);
      const bind = () => kind === "grid" ? bindGrid(root as HTMLTableElement, { rows }) : bindList(root as HTMLUListElement, { rows });
      const controls = () => [...root.querySelectorAll<HTMLInputElement>("fieldset input")];
      const snapshot = () => {
        const select = root.querySelector("select")!, checked = controls().find(input => input.checked)!;
        return { options: [...select.options].map(option => option.textContent), selected: select.options[select.selectedIndex]?.textContent,
          group: controls().slice(0, 2).map(input => input.value), checked: checked.labels?.[0].textContent,
          readOnly: select.disabled && checked.disabled };
      };
      const owner = bind();
      const radioNames = new Set(controls().map(input => input.name)).size;
      const locked = [h.code(() => select.appendChoices([{ label: "Blocked", value: true }])), h.code(() => select.removeChoices(0)),
        h.code(() => select.setIndexes([0])), h.code(() => select.reset("clear")),
        h.code(() => group.appendChoices([h.option("blocked")])), h.code(() => group.removeChoices("common")),
        h.code(() => group.setIndexes([0])), h.code(() => group.reset("first"))];
      owner.setPage({ page: 2, size: 1 });
      rows.setMany([{ id, values: { choices: [{ label: "Updated false", value: false }],
        codes: { items: [h.option("updated")] }, model: { pick: "updated" } } }]);
      owner.setPage({ page: 1, size: 1 }); const updated = snapshot(); owner.dispose();
      select.appendChoices([{ label: "Common true", value: true }]); select.removeChoices(0);
      group.appendChoices([h.option("fresh")]); group.removeChoices("common");
      const next = bind(), recaptured = snapshot(); next.dispose();
      group.dispose(); select.dispose(); rows.dispose(); root.remove();
      return { locked, radioNames, updated, recaptured };
    }, { urls: modules, kind });
    const readOnly = kind === "list";
    expect(result).toEqual({ locked: [...Array(4).fill("SELECT_OWNED"), ...Array(4).fill("CHOICE_OWNED")], radioNames: 2,
      updated: { options: ["Choose", "Common zero", "Updated false"], selected: "Updated false", group: ["common", "updated"], checked: "Label updated", readOnly },
      recaptured: { options: ["Choose", "Common true", "Updated false"], selected: "Updated false", group: ["fresh", "updated"], checked: "Label updated", readOnly } });
  });
}
