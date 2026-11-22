// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { SelectChoice, SelectHandle, SelectSelection, SelectValue } from "./index.js";
import { assertSelectWritable, publishSelect, registerSelect, replaceSelect } from "./select-owner.js";
import type { SelectBinding, SelectCatalog, SelectReplacement } from "./select-owner.js";
import { choiceIndexes, selectRowOptions } from "./row-options.js";

function selectError(code: string, message: string): FrameworkError {
  return new FrameworkError({ api: "bindSelect", code, message });
}

function isValue(value: unknown): value is SelectValue {
  return value === null || typeof value === "string" ||
    typeof value === "number" && Number.isFinite(value) || typeof value === "boolean";
}

export function bindSelect<V extends SelectValue>(root: HTMLSelectElement, options: {
  choices: readonly SelectChoice<V>[];
  retainAuthored?: boolean;
  value?: SelectSelection<V> | readonly SelectSelection<V>[];
  onChange?: (this: void, value: SelectSelection<V> | readonly SelectSelection<V>[], event: Event) => void;
}): SelectHandle<V> {
  if (!(root instanceof HTMLSelectElement)) throw selectError("SELECT_ROOT", "The Select root must be a select element.");
  if (!options || typeof options !== "object") throw selectError("SELECT_CHOICES", "Select needs an array of choices.");
  const authoredNodes = [...root.childNodes], authoredOptions = [...root.options];
  const authoredNodeSet = new Set<Node>(authoredNodes), authoredOptionSet = new Set(authoredOptions);
  const authoredChildren = new Map([...new Set(authoredOptions.map(option => option.parentNode))]
    .flatMap(parent => parent && parent !== root ? [[parent, [...parent.childNodes]] as const] : []));
  const authored = authoredOptions.map(option => ({ option, selected: option.selected, defaultSelected: option.defaultSelected }));
  const authoredValues = authoredOptions.map(option => option.value === "" ? null : option.value);
  let catalog: SelectCatalog = { nodes: authoredNodes, options: authoredOptions, values: authoredValues };
  let pendingNested: ReadonlyMap<ParentNode, readonly ChildNode[]> | undefined;
  const binding: SelectBinding = { root, get catalog() { return catalog; },
    raw: new Map(authoredOptions.map((option, index) => [option, authoredValues[index]])),
    restoreNested() {
      const saved = pendingNested; pendingNested = undefined;
      if (saved) for (const [parent, children] of saved) parent.replaceChildren(...children);
    } };
  const release = registerSelect(binding);
  let disposed = false, generation = 0;
  let retainAuthored = true, onChange: typeof options.onChange;

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
  function indexes(): readonly number[] {
    active();
    return [...root.options].flatMap((option, index) => option.selected ? [index] : []);
  }
  function writeSelection(positions: ReadonlySet<number>, check: () => void): void {
    if (!root.multiple) {
      check();
      root.selectedIndex = positions.values().next().value ?? -1;
      check();
      return;
    }
    for (const [index, option] of [...root.options].entries()) {
      check(); option.selected = positions.has(index); check();
    }
  }
  function restoreAuthored(): void {
    for (const [parent, children] of authoredChildren) parent.replaceChildren(...children);
    root.replaceChildren(...authoredNodes);
    for (const state of authored) state.option.defaultSelected = state.defaultSelected;
    writeSelection(new Set(authored.flatMap((state, index) => state.selected ? [index] : [])), () => {});
  }
  function setIndexes(indexes: readonly number[]): void {
    active(); assertSelectWritable(binding);
    const expected = generation, positions = choiceIndexes(indexes, root.options.length, root.multiple);
    current(expected);
    if (!positions) throw selectError("SELECT_INDEX", "Use distinct indexes in the current option range.");
    const version = ++generation;
    writeSelection(positions, () => current(version));
  }
  function reset(mode: "default" | "first" | "clear" = "default"): void {
    active(); assertSelectWritable(binding);
    if (mode === "clear") { setIndexes([]); return; }
    const expected = generation, opts = [...root.options];
    if (mode === "first") { current(expected); setIndexes(opts.length ? [0] : []); return; }
    if (mode !== "default") throw selectError("SELECT_VALUE", "Use default, first or clear to reset the Select.");
    const defaults = opts.flatMap((option, index) => option.defaultSelected ? [index] : []);
    const fallback = root.size <= 1 ? opts.findIndex(option => !option.matches(":disabled")) : -1;
    const positions = root.multiple ? defaults : defaults.length ? defaults.slice(-1) : fallback < 0 ? [] : [fallback];
    current(expected); setIndexes(positions);
  }
  function createCatalog(choices: readonly SelectChoice<V>[], append: boolean, checkpoint: () => void): SelectCatalog {
    if (!Array.isArray(choices)) throw selectError("SELECT_CHOICES", "Select needs an array of choices.");
    const generated: HTMLOptionElement[] = [], generatedValues: SelectValue[] = [];
    for (const choice of choices) {
      checkpoint();
      if (!choice || typeof choice !== "object") throw selectError("SELECT_CHOICES", "Choices need a string label, scalar value, and optional disabled flag.");
      const { label, value, disabled } = choice;
      checkpoint();
      if (typeof label !== "string" || !isValue(value) || disabled !== undefined && typeof disabled !== "boolean") {
        throw selectError("SELECT_CHOICES", "Choices need a string label, scalar value, and optional disabled flag.");
      }
      const option = root.ownerDocument.createElement("option");
      option.value = String(value ?? ""); option.textContent = label; option.disabled = disabled ?? false;
      generated.push(option); generatedValues.push(value);
    }
    const nodes = append ? catalog.nodes : retainAuthored ? catalog.nodes.filter(node => authoredNodeSet.has(node)) : [];
    const options = append ? catalog.options : retainAuthored ? catalog.options.filter(option => authoredOptionSet.has(option)) : [];
    const values = append ? catalog.values : retainAuthored ? catalog.values.filter((_, index) => authoredOptionSet.has(catalog.options[index])) : [];
    return { nodes: [...nodes, ...generated], options: [...options, ...generated], values: [...values, ...generatedValues] };
  }
  function updateCatalog(build: (current: () => void) => SelectCatalog, keepOccurrences = false): void {
    active();
    const expected = generation;
    replaceSelect(binding, ownerCurrent => {
      const checkpoint = () => { active(); ownerCurrent(); if (generation !== expected) throw selectError("SELECT_STALE", "A newer Select operation superseded this change."); };
      checkpoint();
      const value = read();
      const selection = new Set(keepOccurrences ? root.selectedOptions : []);
      const next = build(checkpoint);
      checkpoint();
      const raw = new Map(next.options.map((option, index) => [option, next.values[index]]));
      const removed = catalog.options.filter(option => authoredOptionSet.has(option) && !raw.has(option) &&
        option.parentNode !== null && next.nodes.some(node => node.contains(option.parentNode)));
      const nested = new Map([...new Set(removed.map(option => option.parentNode!))]
        .map(parent => [parent, [...parent.childNodes]]));
      const previous = { nodes: [...root.childNodes], raw: binding.raw,
        options: [...root.options].map(option => ({ option, selected: option.selected, defaultSelected: option.defaultSelected })) };
      let version = expected, state: "prepared" | "applied" | "undone" | "committed" = "prepared";
      const restore = () => {
        if (state !== "applied") return;
        active(); ownerCurrent();
        if (generation !== version) return;
        state = "undone"; version = ++generation;
        binding.raw = previous.raw;
        binding.restoreNested(); active(); ownerCurrent(); if (generation !== version) return;
        root.replaceChildren(...previous.nodes);
        active(); ownerCurrent();
        if (generation !== version) return;
        for (const state of previous.options) {
          state.option.defaultSelected = state.defaultSelected;
          active(); ownerCurrent(); if (generation !== version) return;
        }
        writeSelection(new Set(previous.options.flatMap((state, index) => state.selected ? [index] : [])), () => {
          active(); ownerCurrent();
          if (generation !== version) throw selectError("SELECT_STALE", "A newer Select operation superseded this change.");
        });
      };
      const replacement: SelectReplacement = { ...next, raw,
        apply() {
          checkpoint(); version = ++generation; state = "applied";
          binding.raw = raw;
          try {
            const applied = () => {
              active(); ownerCurrent();
              if (generation !== version) throw selectError("SELECT_STALE", "A newer Select operation superseded this change.");
            };
            root.replaceChildren(...next.nodes);
            applied();
            if (nested.size) pendingNested = nested;
            for (const option of removed) { option.remove(); applied(); }
            if (keepOccurrences) {
              writeSelection(new Set(next.options.flatMap((option, index) => selection.has(option) ? [index] : [])), applied);
            } else selectRowOptions(root, binding.raw, value, () => { applied(); return true; });
            applied();
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
          if (state === "applied") { catalog = next; pendingNested = undefined; state = "committed"; }
          return catalog;
        }
      };
      return replacement;
    });
  }
  function setChoices(choices: readonly SelectChoice<V>[]): void {
    updateCatalog(checkpoint => createCatalog(choices, false, checkpoint));
  }
  function appendChoices(choices: readonly SelectChoice<V>[]): void {
    updateCatalog(checkpoint => createCatalog(choices, true, checkpoint), true);
  }
  function removeChoices(value: SelectSelection<V>): void {
    active();
    if (!isValue(value)) throw selectError("SELECT_VALUE", "Remove choices by one scalar value.");
    if (!catalog.values.some(item => Object.is(item, value))) return;
    updateCatalog(() => {
      const removed = new Set<Node>(catalog.options.filter((_, index) => Object.is(catalog.values[index], value)));
      return { nodes: catalog.nodes.filter(node => !removed.has(node)),
        options: catalog.options.filter(option => !removed.has(option)), values: catalog.values.filter(item => !Object.is(item, value)) };
    }, true);
  }
  function change(event: Event): void { if (event.target === root) onChange?.(read(), event); }

  try {
    const keep = options.retainAuthored;
    if (keep !== undefined && typeof keep !== "boolean") throw selectError("SELECT_CHOICES", "retainAuthored must be a boolean.");
    retainAuthored = keep ?? true;
    onChange = options.onChange;
    if (onChange !== undefined && typeof onChange !== "function") throw selectError("SELECT_CALLBACK", "onChange must be a function.");
    setChoices(options.choices);
    if (Object.hasOwn(options, "value")) write(options.value!);
    else if (!retainAuthored) reset();
    root.addEventListener("change", change);
    publishSelect(binding);
  } catch (cause) {
    try {
      assertSelectWritable(binding);
      restoreAuthored();
    } finally { release(); }
    throw cause;
  }
  return {
    value: read, setChoices, appendChoices, removeChoices, setValue: write, indexes, setIndexes, reset,
    dispose() {
      if (disposed) return;
      assertSelectWritable(binding);
      root.removeEventListener("change", change);
      restoreAuthored();
      disposed = true; generation++;
      binding.raw = new Map(); release();
    }
  };
}
