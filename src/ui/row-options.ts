// SPDX-License-Identifier: Apache-2.0
import { readPath } from "./field-path.js";

export type RowOptionValue = string | number | boolean | null;

export interface RowOption {
  readonly label: string;
  readonly raw: RowOptionValue;
}

function scalar(value: unknown): value is RowOptionValue {
  return value === null || typeof value === "string" || typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value));
}

export function rowOptions(
  row: unknown,
  options: readonly string[],
  label: readonly string[],
  value: readonly string[],
  invalid: (field: string) => never
): readonly RowOption[] {
  const source = readPath(row, options);
  if (source == null) return [];
  if (!Array.isArray(source)) return invalid(options.join("."));
  const result: RowOption[] = [];
  for (const item of source) {
    const text = readPath(item, label);
    const raw = readPath(item, value);
    if (scalar(text) && text !== null && text !== "" && scalar(raw)) {
      result.push({ label: String(text), raw });
    }
  }
  return result;
}

export function renderRowOptions(
  element: HTMLSelectElement, authoredNodes: readonly Node[], authoredOptions: readonly HTMLOptionElement[],
  authored: readonly (string | null)[], choices: readonly RowOption[]
): Map<HTMLOptionElement, unknown> {
  const raw = new Map<HTMLOptionElement, unknown>();
  const children = [...authoredNodes];
  authoredOptions.forEach((option, index) => raw.set(option, authored[index]));
  for (const choice of choices) {
    const option = element.ownerDocument.createElement("option");
    option.value = String(choice.raw ?? "");
    option.textContent = choice.label;
    raw.set(option, choice.raw);
    children.push(option);
  }
  element.replaceChildren(...children);
  return raw;
}

export function selectRowOptions(element: HTMLSelectElement, raw: ReadonlyMap<HTMLOptionElement, unknown>, value: unknown): void {
  if (!element.multiple) {
    element.selectedIndex = [...element.options].findIndex(option => raw.has(option) && Object.is(raw.get(option), value));
    return;
  }
  const remaining = Array.isArray(value) ? [...value] : [];
  for (const option of element.options) {
    const index = raw.has(option) ? remaining.findIndex(item => Object.is(item, raw.get(option))) : -1;
    option.selected = index >= 0;
    if (index >= 0) remaining.splice(index, 1);
  }
}

export function rowOptionAvailable(available: readonly unknown[], value: unknown, multiple: boolean): boolean {
  if (!multiple) return available.some(option => Object.is(option, value));
  if (!Array.isArray(value)) return false;
  const remaining = [...available];
  for (const item of value) {
    const index = remaining.findIndex(option => Object.is(option, item));
    if (index < 0) return false;
    remaining.splice(index, 1);
  }
  return true;
}
