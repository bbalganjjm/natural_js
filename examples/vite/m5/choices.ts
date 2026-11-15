// SPDX-License-Identifier: Apache-2.0
import { createRows } from "@bbalganjjm/natural_js/data";
import type { RowId } from "@bbalganjjm/natural_js/data";
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageDefinition, PageHandle } from "@bbalganjjm/natural_js/page";
import { bindChoiceGroup, bindForm, bindGrid, bindList, bindSelect } from "@bbalganjjm/natural_js/ui";
import type { GridHandle, ListHandle, SelectChoice, SelectValue } from "@bbalganjjm/natural_js/ui";

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

type SharedPerson = {
  name: string;
  chosen: SelectValue;
  tags: readonly string[];
  active: string;
  photo: string | null;
  summary: { text: string };
  codes: { options: readonly { label: string; value: SelectValue }[]; tags: readonly SelectChoice<string>[] };
};
const permissions: readonly SelectChoice<string>[] = [{ value: "read", label: "Read" }, { value: "write", label: "Write" }];

function sharedControls(root: HTMLElement, layout: Layout, signal: AbortSignal, own: (dispose: () => void) => void) {
  root.setAttribute("aria-label", layout === "stack" ? "Stacked shared controls" : "Chip shared controls");
  const photo = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="steelblue"/%3E%3C/svg%3E';
  const rows = createRows<SharedPerson>([
    { name: layout === "stack" ? "Ada shared" : "Bea shared", chosen: false, tags: ["read"], active: "Y", photo,
      summary: { text: "First shared record" }, codes: { options: [{ label: "Row false", value: false }, { label: "Row zero", value: 0 }], tags: permissions } },
    { name: "Second shared", chosen: 0, tags: [], active: "N", photo: null,
      summary: { text: "Second shared record" }, codes: { options: [{ label: "Row false", value: false }, { label: "Row zero", value: 0 }], tags: [] } }
  ]);
  own(() => rows.dispose());
  const formRoot = find<HTMLElement>(root, "[data-shared-form]"), table = find<HTMLTableElement>(root, "[data-shared-grid]"), listRoot = find<HTMLUListElement>(root, "[data-shared-list]");
  // Each binder adopts or captures the real common Select before it builds its own fields.
  for (const element of [formRoot, table, listRoot].map(owner => find<HTMLSelectElement>(owner, 'select[data-field="chosen"]'))) {
    const common = bindSelect<number>(element, { choices: [{ label: "Common one", value: 1 }, { label: "Common two", value: 2 }], value: 1 });
    own(() => common.dispose());
  }
  const render = { summary(value: unknown) {
    const strong = root.ownerDocument.createElement("strong");
    strong.textContent = value && typeof value === "object" && "text" in value ? String(value.text) : "";
    return strong;
  } };
  const form = bindForm<SharedPerson>(formRoot, { rows, render }); own(() => form.dispose());
  let selected: RowId | null = null, grid: GridHandle<SharedPerson> | undefined, list: ListHandle<SharedPerson> | undefined;
  const source = find(root, "[data-shared-source]"), status = find(root, "[data-shared-status]");
  function show(): void { source.textContent = JSON.stringify({ selected, rows: rows.entries(), changes: rows.changes() }, null, 2); }
  function select(id: RowId | null): void {
    if (selected === id) return;
    selected = id; form.bind(id); grid?.select(id); list?.select(id); show();
  }
  grid = bindGrid<SharedPerson>(table, { rows, render, onSelect(selection) { select(selection.id); } }); own(() => grid!.dispose());
  list = bindList<SharedPerson>(listRoot, { rows, render, onSelect(selection) { select(selection.id); } }); own(() => list!.dispose());
  own(rows.subscribe(show));
  find(root, "[data-shared-defaults]").textContent = JSON.stringify({ form: form.defaults(), grid: grid.defaults() }, null, 2);
  find<HTMLSelectElement>(root, "[data-shared-catalog]").addEventListener("change", event => {
    const catalog = event.currentTarget as HTMLSelectElement, row = selected === null ? undefined : rows.get(selected);
    if (!row) return;
    rows.set(row.id, "codes", { options: row.value.codes.options,
      tags: catalog.value === "empty" ? [] : catalog.value === "one" ? permissions.slice(0, 1) : permissions });
    status.textContent = "The selected record's permission choices changed. Stored codes and captured defaults are unchanged.";
  }, { signal });
  root.addEventListener("click", event => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button");
    if (button?.hasAttribute("data-shared-validate")) {
      const result = form.validate(); status.textContent = result.valid ? "Shared record is valid." : result.issues[0].message;
    } else if (button?.hasAttribute("data-shared-revert") && selected !== null) {
      rows.revert(selected); status.textContent = "The selected record's received values are restored.";
    }
  }, { signal });
  return { init() { select(rows.entries()[0].id); show(); } };
}

const template = find<HTMLTemplateElement>(document, "[data-workspace]");
const pages = new Map<Layout, PageHandle>();
const definition: PageDefinition<{ layout: Layout; close(): void }> = {
  view: () => template.content.firstElementChild!.cloneNode(true) as HTMLElement,
  controller({ root, input, signal, own }) {
    root.dataset.layout = input.layout;
    find<HTMLElement>(root, "[data-screen]").dataset.layout = input.layout;
    find<HTMLElement>(root, "[data-screen]").setAttribute("aria-label", input.layout === "stack" ? "Stacked choice screen" : "Chip choice screen");
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
    const shared = sharedControls(find(root, "[data-shared-controls]"), input.layout, signal, own);
    return { init() { form.bind(id); show(); shared.init(); } };
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
