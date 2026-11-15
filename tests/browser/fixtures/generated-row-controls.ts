// SPDX-License-Identifier: Apache-2.0
import { createRows } from "../../../src/data/index.js";
import { bindForm } from "../../../src/ui/form.js";
import { bindGrid } from "../../../src/ui/grid.js";
import { bindList } from "../../../src/ui/list.js";
import { bindChoiceGroup } from "../../../src/ui/choice-group.js";
import type { FormOptions, SelectChoice } from "../../../src/ui/index.js";

export type Owner = "Form" | "Grid" | "List";
export interface RecordValue { name: string; model: { pick: unknown }; codes: { items: unknown }; }
export type Callbacks = Pick<FormOptions<RecordValue>, "beforeSourceBind" | "onSourceBind" | "beforeBindValue" | "onBindValue">;
let probe: (() => void) | undefined;
class GroupProbe extends HTMLElement { connectedCallback() { probe?.(); } }
if (!customElements.get("njs-generated-group-probe")) customElements.define("njs-generated-group-probe", GroupProbe);
export function setProbe(callback?: () => void) { probe = callback; }
export function code(run: () => unknown): string { try { run(); return "none"; } catch (cause) { return (cause as { code?: string }).code ?? "unknown"; } }
export const option = (value: string) => ({ value, label: `Label ${value}` });
export function field(kind: "radio" | "checkbox", attributes = "", probing = false): string {
  return `<fieldset data-field="model.pick" data-options="codes.items" data-option-label="label" data-option-value="value"><legend>Contact choices</legend><template data-choice-template><label><input type="${kind}" ${attributes}><span data-choice-label></span>${probing ? "<njs-generated-group-probe></njs-generated-group-probe>" : ""}</label></template></fieldset><small data-error-for="model.pick"></small>`;
}
export function fixture(owner: Owner, kind: "radio" | "checkbox", initial: readonly RecordValue[], options: {
  common?: readonly SelectChoice<string>[]; initial?: string | null | readonly string[];
  attributes?: string; probing?: boolean; callbacks?: Callbacks;
} = {}) {
  const root = document.createElement(owner === "Form" ? "form" : owner === "Grid" ? "table" : "ul");
  const content = `<span data-field="name"></span>${field(kind, options.attributes, options.probing)}`;
  root.innerHTML = owner === "Form" ? content : owner === "Grid"
    ? `<thead><tr><th scope="col">Person</th></tr></thead><tbody><tr data-row-template><td>${content}</td></tr></tbody>`
    : `<li data-row-template>${content}</li>`;
  document.body.append(root);
  const authored = root.cloneNode(true) as HTMLElement;
  const common = options.common ? bindChoiceGroup(root.querySelector("fieldset")!, { choices: options.common,
    ...(options.initial === undefined ? {} : { value: options.initial }) }) : undefined;
  const rows = createRows<RecordValue>(initial), ids = rows.entries().map(row => row.id);
  const callbacks = options.callbacks ?? {};
  const form = owner === "Form" ? bindForm(root, { rows, ...callbacks }) : undefined;
  const grid = owner === "Grid" ? bindGrid(root as HTMLTableElement, { rows, paste: true, ...callbacks }) : undefined;
  const list = owner === "List" ? bindList(root as HTMLUListElement, { rows, ...callbacks }) : undefined;
  if (form) form.bind(ids[0]);
  const handle = form ?? grid ?? list!;
  return { root, rows, ids, form, grid, list, handle, common, authoredField: authored.querySelector("fieldset")!, 
    group: () => root.querySelector<HTMLFieldSetElement>("fieldset")!,
    controls: () => [...root.querySelectorAll<HTMLInputElement>("fieldset input")],
    async refresh() { await handle.refresh(); },
    dispose(unbind = true) { setProbe(); if (form && unbind) form.unbind(); handle.dispose(); common?.dispose(); rows.dispose(); const restored = root.isEqualNode(authored); root.remove(); return restored; }
  };
}
export { createRows, bindForm, bindChoiceGroup };
