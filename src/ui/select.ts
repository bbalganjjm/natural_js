// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { SelectChoice, SelectHandle, SelectSelection, SelectValue } from "./index.js";
import { claimSelect } from "./select-owner.js";

function selectError(code: string, message: string): FrameworkError {
  return new FrameworkError({ api: "bindSelect", code, message });
}

function isValue(value: unknown): value is SelectValue {
  return value === null || typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value)) || typeof value === "boolean";
}

export function bindSelect<V extends SelectValue>(root: HTMLSelectElement, options: {
  choices: readonly SelectChoice<V>[];
  value?: SelectSelection<V> | readonly SelectSelection<V>[];
  onChange?: (value: SelectSelection<V> | readonly SelectSelection<V>[], event: Event) => void;
}): SelectHandle<V> {
  if (!(root instanceof HTMLSelectElement)) {
    throw selectError("SELECT_ROOT", "The Select root must be a select element.");
  }
  if (!options || !Array.isArray(options.choices)) {
    throw selectError("SELECT_CHOICES", "Select needs an array of choices.");
  }
  if (options.onChange !== undefined && typeof options.onChange !== "function") {
    throw selectError("SELECT_CALLBACK", "onChange must be a function.");
  }
  const release = claimSelect(root, "bindSelect");
  const authoredNodes = [...root.childNodes];
  const authoredOptions = [...root.options];
  const authoredSelection = authoredOptions.map(option => option.selected);
  let rawByOption = new Map<HTMLOptionElement, SelectSelection<V>>();
  for (const option of authoredOptions) {
    rawByOption.set(option, option.value === "" ? null : option.value);
  }
  let disposed = false;

  function active(): void {
    if (disposed) throw selectError("SELECT_DISPOSED", "This Select has been disposed.");
  }

  function read(): SelectSelection<V> | readonly SelectSelection<V>[] {
    active();
    if (root.multiple) {
      return [...root.selectedOptions].map(option => {
        if (!rawByOption.has(option)) throw selectError("SELECT_OPTION", "A selected option is not bound. Call setChoices to change options.");
        return rawByOption.get(option)!;
      });
    }
    const option = root.selectedOptions[0];
    if (!option) return null;
    if (!rawByOption.has(option)) throw selectError("SELECT_OPTION", "A selected option is not bound. Call setChoices to change options.");
    return rawByOption.get(option)!;
  }

  function write(value: SelectSelection<V> | readonly SelectSelection<V>[]): void {
    active();
    if (root.multiple) {
      if (!Array.isArray(value) || value.some(item => !isValue(item))) {
        throw selectError("SELECT_VALUE", "A multiple Select needs an array of scalar values.");
      }
      const remaining = [...value];
      for (const option of root.options) {
        const raw = rawByOption.get(option);
        const index = remaining.findIndex(item => Object.is(item, raw));
        option.selected = index >= 0;
        if (index >= 0) remaining.splice(index, 1);
      }
      return;
    }
    if (Array.isArray(value) || !isValue(value)) {
      throw selectError("SELECT_VALUE", "A single Select needs one scalar value or null.");
    }
    root.selectedIndex = [...root.options].findIndex(option => Object.is(rawByOption.get(option), value));
  }

  function setChoices(choices: readonly SelectChoice<V>[]): void {
    active();
    if (!Array.isArray(choices) || choices.some(choice =>
      choice === null || typeof choice !== "object" ||
      typeof choice.label !== "string" || !isValue(choice.value) ||
      (choice.disabled !== undefined && typeof choice.disabled !== "boolean"))) {
      throw selectError("SELECT_CHOICES", "Choices need a string label, scalar value, and optional disabled flag.");
    }
    const selected = read();
    const next = new Map<HTMLOptionElement, SelectSelection<V>>();
    for (const option of authoredOptions) next.set(option, option.value === "" ? null : option.value);
    const generated = choices.map(choice => {
      const option = root.ownerDocument.createElement("option");
      option.value = String(choice.value ?? "");
      option.textContent = choice.label;
      option.disabled = choice.disabled ?? false;
      next.set(option, choice.value);
      return option;
    });
    root.replaceChildren(...authoredNodes, ...generated);
    rawByOption = next;
    write(selected);
  }

  function onChange(event: Event): void {
    options.onChange?.(read(), event);
  }

  try {
    setChoices(options.choices);
    if (Object.hasOwn(options, "value")) write(options.value!);
    root.addEventListener("change", onChange);
  } catch (cause) {
    root.replaceChildren(...authoredNodes);
    for (const [index, option] of authoredOptions.entries()) option.selected = authoredSelection[index];
    release();
    throw cause;
  }

  return {
    value: read,
    setChoices,
    setValue: write,
    dispose() {
      if (disposed) return;
      root.removeEventListener("change", onChange);
      root.replaceChildren(...authoredNodes);
      for (const [index, option] of authoredOptions.entries()) option.selected = authoredSelection[index];
      disposed = true;
      rawByOption.clear();
      release();
    }
  };
}
