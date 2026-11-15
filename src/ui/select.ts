// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { SelectChoice, SelectHandle, SelectSelection, SelectValue } from "./index.js";
import { assertSelectWritable, publishSelect, registerSelect, replaceSelect } from "./select-owner.js";
import type { SelectBinding, SelectCatalog, SelectReplacement } from "./select-owner.js";
import { selectRowOptions } from "./row-options.js";

function selectError(code: string, message: string): FrameworkError {
  return new FrameworkError({ api: "bindSelect", code, message });
}

function isValue(value: unknown): value is SelectValue {
  return value === null || typeof value === "string" ||
    typeof value === "number" && Number.isFinite(value) || typeof value === "boolean";
}

export function bindSelect<V extends SelectValue>(root: HTMLSelectElement, options: {
  choices: readonly SelectChoice<V>[];
  value?: SelectSelection<V> | readonly SelectSelection<V>[];
  onChange?: (value: SelectSelection<V> | readonly SelectSelection<V>[], event: Event) => void;
}): SelectHandle<V> {
  if (!(root instanceof HTMLSelectElement)) throw selectError("SELECT_ROOT", "The Select root must be a select element.");
  if (!options || typeof options !== "object") throw selectError("SELECT_CHOICES", "Select needs an array of choices.");
  const authoredNodes = [...root.childNodes], authoredOptions = [...root.options];
  const authored = authoredOptions.map(option => ({ option, selected: option.selected, defaultSelected: option.defaultSelected }));
  const authoredValues = authoredOptions.map(option => option.value === "" ? null : option.value);
  let catalog: SelectCatalog = { nodes: authoredNodes, options: authoredOptions, values: authoredValues };
  const binding: SelectBinding = { root, get catalog() { return catalog; },
    raw: new Map(authoredOptions.map((option, index) => [option, authoredValues[index]])) };
  const release = registerSelect(binding);
  let disposed = false, generation = 0;

  function active(): void {
    if (disposed) throw selectError("SELECT_DISPOSED", "This Select has been disposed.");
  }
  function current(expected: number): void {
    active(); assertSelectWritable(binding);
    if (generation !== expected) throw selectError("SELECT_STALE", "A newer Select operation superseded this change.");
  }
  function read(): SelectSelection<V> | readonly SelectSelection<V>[] {
    active();
    const selected = [...root.selectedOptions].map(option => {
      const value = binding.raw.get(option);
      if (!binding.raw.has(option) || !isValue(value)) throw selectError("SELECT_OPTION", "A selected option is not bound. Call setChoices to change options.");
      return value;
    });
    return root.multiple ? selected : selected[0] ?? null;
  }
  function selected(value: unknown): SelectValue | readonly SelectValue[] {
    if (Array.isArray(value)) {
      const snapshot: unknown[] = Array.from(value);
      if (!root.multiple || !snapshot.every(isValue)) throw selectError("SELECT_VALUE", "A multiple Select needs an array of scalar values.");
      return snapshot;
    }
    if (root.multiple || !isValue(value)) throw selectError("SELECT_VALUE", "A single Select needs one scalar value or null.");
    return value;
  }
  function write(value: SelectSelection<V> | readonly SelectSelection<V>[]): void {
    active(); assertSelectWritable(binding);
    const expected = generation, snapshot = selected(value);
    current(expected);
    const version = ++generation;
    selectRowOptions(root, binding.raw, snapshot, () => { current(version); return true; });
    current(version);
  }
  function setChoices(choices: readonly SelectChoice<V>[]): void {
    active();
    const expected = generation;
    replaceSelect(binding, ownerCurrent => {
      const checkpoint = () => { active(); ownerCurrent(); if (generation !== expected) throw selectError("SELECT_STALE", "A newer Select operation superseded this change."); };
      checkpoint();
      const value = read();
      if (!Array.isArray(choices)) throw selectError("SELECT_CHOICES", "Select needs an array of choices.");
      const prepared = Array.from(choices, choice => {
        if (!choice || typeof choice !== "object") throw selectError("SELECT_CHOICES", "Choices need a string label, scalar value, and optional disabled flag.");
        const { label, value, disabled } = choice;
        checkpoint();
        if (typeof label !== "string" || !isValue(value) || disabled !== undefined && typeof disabled !== "boolean") {
          throw selectError("SELECT_CHOICES", "Choices need a string label, scalar value, and optional disabled flag.");
        }
        return { label, value, disabled: disabled ?? false };
      });
      checkpoint();
      const generated = prepared.map(choice => {
        const option = root.ownerDocument.createElement("option");
        option.value = String(choice.value ?? ""); option.textContent = choice.label; option.disabled = choice.disabled;
        return option;
      });
      checkpoint();
      const next: SelectCatalog = {
        nodes: [...authoredNodes, ...generated], options: [...authoredOptions, ...generated],
        values: [...authoredValues, ...prepared.map(choice => choice.value)]
      };
      const raw = new Map(next.options.map((option, index) => [option, next.values[index]]));
      const previous = { nodes: [...root.childNodes], raw: binding.raw,
        options: [...root.options].map(option => ({ option, selected: option.selected, defaultSelected: option.defaultSelected })) };
      let version = expected, state: "prepared" | "applied" | "undone" | "committed" = "prepared";
      const restore = () => {
        if (state !== "applied") return;
        active(); ownerCurrent();
        if (generation !== version) return;
        state = "undone"; version = ++generation;
        binding.raw = previous.raw;
        root.replaceChildren(...previous.nodes);
        active(); ownerCurrent();
        if (generation !== version) return;
        for (const state of previous.options) {
          state.option.defaultSelected = state.defaultSelected; state.option.selected = state.selected;
          active(); ownerCurrent(); if (generation !== version) return;
        }
      };
      const replacement: SelectReplacement = { ...next, raw,
        apply() {
          checkpoint(); version = ++generation; state = "applied";
          binding.raw = raw;
          try {
            root.replaceChildren(...next.nodes);
            active(); ownerCurrent();
            if (generation !== version) throw selectError("SELECT_STALE", "A newer Select operation superseded this change.");
            selectRowOptions(root, binding.raw, value, () => {
              active(); ownerCurrent();
              if (generation !== version) throw selectError("SELECT_STALE", "A newer Select operation superseded this change.");
              return true;
            });
            active(); ownerCurrent();
            if (generation !== version) throw selectError("SELECT_STALE", "A newer Select operation superseded this change.");
          } catch (cause) {
            try { restore(); } catch { /* Preserve the original publication failure. */ }
            throw cause;
          }
          return restore;
        },
        finish() {
          active(); ownerCurrent();
          if (generation !== version || state !== "applied" && state !== "committed") {
            throw selectError("SELECT_STALE", "This Select replacement is no longer current.");
          }
          if (state === "applied") { catalog = next; state = "committed"; }
          return catalog;
        }
      };
      return replacement;
    });
  }
  function onChange(event: Event): void { options.onChange?.(read(), event); }

  try {
    if (options.onChange !== undefined && typeof options.onChange !== "function") throw selectError("SELECT_CALLBACK", "onChange must be a function.");
    setChoices(options.choices);
    if (Object.hasOwn(options, "value")) write(options.value!);
    root.addEventListener("change", onChange);
    publishSelect(binding);
  } catch (cause) {
    try {
      assertSelectWritable(binding);
      root.replaceChildren(...authoredNodes);
      for (const state of authored) { state.option.defaultSelected = state.defaultSelected; state.option.selected = state.selected; }
    } finally { release(); }
    throw cause;
  }
  return {
    value: read, setChoices, setValue: write,
    dispose() {
      if (disposed) return;
      assertSelectWritable(binding);
      root.removeEventListener("change", onChange);
      root.replaceChildren(...authoredNodes);
      for (const state of authored) { state.option.defaultSelected = state.defaultSelected; state.option.selected = state.selected; }
      disposed = true; generation++;
      binding.raw = new Map(); release();
    }
  };
}
