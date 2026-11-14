// SPDX-License-Identifier: Apache-2.0
import { createRows } from "@bbalganjjm/natural_js/data";
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageDefinition, PageHandle } from "@bbalganjjm/natural_js/page";
import { bindChoiceGroup, bindForm } from "@bbalganjjm/natural_js/ui";
import type { SelectChoice } from "@bbalganjjm/natural_js/ui";

const genders: readonly SelectChoice<string>[] = [
  { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "unspecified", label: "Prefer not to say" }
];
const fruits: readonly SelectChoice<string>[] = [
  { value: "apple", label: "Apple" }, { value: "banana", label: "Banana" }, { value: "pear", label: "Pear", disabled: true }
];
type Person = { name: string; gender: string | null; favoriteFruit: readonly string[] };
type Layout = "stack" | "chips";

function find<E extends Element>(root: ParentNode, selector: string): E {
  const element = root.querySelector<E>(selector);
  if (!element) throw new Error(`The choice-group example needs ${selector}.`);
  return element;
}

const template = find<HTMLTemplateElement>(document, "[data-workspace]");
const pages = new Map<Layout, PageHandle>();
const definition: PageDefinition<{ layout: Layout; close(): void }> = {
  view: () => template.content.firstElementChild!.cloneNode(true) as HTMLElement,
  controller({ root, input, signal, own }) {
    root.dataset.layout = input.layout;
    root.setAttribute("aria-label", input.layout === "stack" ? "Stacked choice screen" : "Chip choice screen");
    find(root, "[data-title]").textContent = input.layout === "stack" ? "Stacked editor" : "Chip editor";
    const rows = createRows<Person>([{ name: input.layout === "stack" ? "Ada" : "Bea", gender: "female", favoriteFruit: ["banana"] }]);
    own(() => rows.dispose());
    const gender = bindChoiceGroup(find(root, '[data-field="gender"]'), { choices: genders, value: "male" });
    own(() => gender.dispose());
    const fruit = bindChoiceGroup(find(root, '[data-field="favoriteFruit"]'), { choices: fruits, value: ["apple"] });
    own(() => fruit.dispose());
    const formRoot = find<HTMLFormElement>(root, "form");
    const form = bindForm<Person>(formRoot, { rows });
    own(() => form.dispose());
    const id = rows.entries()[0].id;
    const status = find<HTMLOutputElement>(root, "[data-status]");
    const source = find(root, "[data-source]");
    const show = () => { source.textContent = JSON.stringify(rows.get(id), null, 2); };
    own(rows.subscribe(show));
    find(root, "[data-defaults]").textContent = JSON.stringify(form.defaults(), null, 2);
    function validate(): void {
      const result = form.validate();
      status.textContent = result.valid ? "Record is valid." : result.issues[0].message;
      if (!result.valid) result.issues.find(issue => issue.element)?.element?.focus();
    }
    formRoot.addEventListener("submit", event => { event.preventDefault(); validate(); }, { signal });
    find<HTMLSelectElement>(root, "[data-live-catalog]").addEventListener("change", event => {
      const catalog = event.currentTarget as HTMLSelectElement;
      fruit.setChoices(catalog.value === "empty" ? [] : catalog.value === "one" ? fruits.slice(0, 1)
        : catalog.value === "disabled" ? fruits.map(choice => ({ ...choice, disabled: true })) : fruits);
      status.textContent = "Choice catalog replaced. Stored values and captured defaults are unchanged.";
    }, { signal });
    root.addEventListener("click", event => {
      const button = (event.target as Element).closest<HTMLButtonElement>("button");
      if (!button) return;
      if (button.hasAttribute("data-close")) { input.close(); return; }
      if (button.hasAttribute("data-validate")) {
        validate();
      } else if (button.hasAttribute("data-revert")) {
        rows.revert(id);
        status.textContent = "Received values restored. Bind record if editing was paused.";
      } else if (button.hasAttribute("data-restore")) {
        form.unbind();
        status.textContent = "Captured fields restored. Editing is paused.";
      } else if (button.hasAttribute("data-bind")) {
        form.bind(id);
        status.textContent = "Current source is bound.";
      }
    }, { signal });
    return { init() { form.bind(id); show(); } };
  }
};

async function open(layout: Layout): Promise<void> {
  const button = find<HTMLButtonElement>(document, `[data-open="${layout}"]`);
  button.disabled = true;
  try {
    await pages.get(layout)?.dispose();
    const page = mountPage(find(document, `[data-host="${layout}"]`), definition, {
      layout, close() { void page.dispose(); }
    });
    pages.set(layout, page);
    await page.ready;
    find(document, "[data-page-status]").textContent = "Choice screens are ready.";
  } catch (cause) {
    find(document, "[data-page-status]").textContent = cause instanceof Error ? cause.message : String(cause);
  } finally { button.disabled = false; }
}
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-open]")) {
  button.addEventListener("click", () => { void open(button.dataset.open as Layout); });
}

const playground = find<HTMLElement>(document, "[data-playground]");
find<HTMLFormElement>(playground, "form").addEventListener("submit", event => event.preventDefault());
const standalone = bindChoiceGroup(find(playground, "[data-standalone]"), { choices: fruits, value: ["apple"], onChange: showSelection });
const catalog = find<HTMLSelectElement>(playground, "[data-catalog]");
function showSelection(): void {
  find(playground, "[data-playground-value]").textContent = JSON.stringify(standalone.value());
}
playground.addEventListener("click", event => {
  const button = (event.target as Element).closest("button");
  if (button?.hasAttribute("data-choose")) standalone.setValue(["apple"]);
  else if (button?.hasAttribute("data-clear")) standalone.setValue([]);
  else if (!button?.hasAttribute("data-read")) return;
  showSelection();
});
catalog.addEventListener("change", () => {
  standalone.setChoices(catalog.value === "empty" ? [] : catalog.value === "one" ? fruits.slice(0, 1)
    : catalog.value === "disabled" ? fruits.map(choice => ({ ...choice, disabled: true })) : fruits);
  find(playground, "[data-playground-state]").textContent = "Choice list replaced. Native defaults preserve surviving choices.";
  showSelection();
});
showSelection();
void Promise.all([open("stack"), open("chips")]);
window.addEventListener("pagehide", () => { standalone.dispose(); for (const page of pages.values()) void page.dispose(); }, { once: true });
