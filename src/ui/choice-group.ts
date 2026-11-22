// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { SelectChoice } from "./index.js";
import { focusVisible, restoreAttributes, uniqueId } from "./dom-state.js";
import { parsePath } from "./field-path.js";
import { interactiveContent } from "./native-control.js";
import { choiceIndexes, rowOptions } from "./row-options.js";
import { assertChoiceGroupWritable, beginChoiceGroupPublication, choiceGroupCheckpoint, claimChoiceGroup, getChoiceGroup,
  publishChoiceGroup, registerChoiceGroup, replaceChoiceGroup, retireChoiceGroup } from "./choice-group-owner.js";
import type { ChoiceGroupBinding, ChoiceGroupCatalog, ChoiceGroupDefinition, ChoiceGroupReplacement } from "./choice-group-owner.js";

export interface ChoiceGroupHandle {
  setChoices(choices: readonly SelectChoice<string>[]): void;
  appendChoices(choices: readonly SelectChoice<string>[]): void;
  removeChoices(value: string): void;
  setValue(value: string | null | readonly string[]): void;
  value(): string | null | readonly string[];
  indexes(): readonly number[];
  setIndexes(indexes: readonly number[]): void;
  reset(mode?: "default" | "first" | "clear"): void;
  dispose(): void;
}

function error(code: string, message: string): FrameworkError {
  return new FrameworkError({ api: "bindChoiceGroup", code, message });
}

function observed<T>(current: () => void, read: () => T): T {
  try { const value = read(); current(); return value; }
  catch (cause) { current(); throw cause; }
}

export function compileChoiceGroup(root: HTMLFieldSetElement): ChoiceGroupDefinition {
  if (!(root instanceof HTMLFieldSetElement)) throw error("CHOICE_ROOT", "A choice group needs a fieldset.");
  const document = root.ownerDocument, legend = [...root.children].find(element => element.localName === "legend");
  const named = root.getAttribute("aria-label")?.trim() || root.getAttribute("aria-labelledby")?.trim().split(/\s+/)
    .some(id => document.getElementById(id)?.textContent?.trim()) || legend?.textContent?.trim();
  if (!named) throw error("CHOICE_ROOT", "Name the fieldset with a legend or ARIA label.");
  const templates = [...root.children].filter(element => element.matches("template[data-choice-template]"));
  const template = templates[0] as HTMLTemplateElement | undefined, item = template?.content.firstElementChild;
  const sourceInput = item?.querySelector<HTMLInputElement>("input"), labelTarget = item?.querySelector<HTMLElement>("[data-choice-label]");
  const reserved = "[id], [data-field], [data-options], [data-option-label], [data-option-value], [data-error-for], [data-select-row], [data-check-row], [data-row-action], [data-unchecked-value]";
  const unsafe = (element: Element): boolean => element.matches(reserved) || [...element.children].some(unsafe) ||
    element instanceof HTMLTemplateElement && [...element.content.children].some(unsafe);
  if (templates.length !== 1 || template!.content.children.length !== 1 || item?.localName !== "label" ||
      item.querySelectorAll("input").length !== 1 || !sourceInput || !["radio", "checkbox"].includes(sourceInput.type) ||
      item.querySelectorAll("[data-choice-label]").length !== 1 || !labelTarget || labelTarget.contains(sourceInput) ||
      labelTarget.matches(interactiveContent) || labelTarget.querySelector(interactiveContent) || unsafe(item) ||
      item.hasAttribute("data-choice-label") || item.querySelector("label") || item.hasAttribute("for") ||
      item.querySelectorAll(interactiveContent).length !== 1 || sourceInput.checked || sourceInput.defaultChecked || sourceInput.hasAttribute("checked") ||
      root.hasAttribute("data-unchecked-value") || template!.hasAttribute("data-unchecked-value")) {
    throw error("CHOICE_TEMPLATE", "Use one wrapping label, one radio or checkbox, and one noninteractive data-choice-label target without IDs, field markers, coded-checkbox markers or checked defaults.");
  }
  const options = root.getAttribute("data-options"), label = root.getAttribute("data-option-label"), value = root.getAttribute("data-option-value");
  if (options === null ? label !== null || value !== null : label === null || value === null) {
    throw error("CHOICE_OPTIONS", "Row choices need data-options, data-option-label and data-option-value together.");
  }
  return Object.freeze({ kind: sourceInput.type as "radio" | "checkbox", item: item.cloneNode(true) as HTMLLabelElement,
    required: sourceInput.required,
    templateDisabled: sourceInput.disabled, ...(options === null ? {} : { source: Object.freeze({ options: parsePath(options), label: parsePath(label!), value: parsePath(value!) }) }) });
}

export function choiceGroupOptions(definition: ChoiceGroupDefinition, value: unknown,
  invalid: (field: string) => never): readonly SelectChoice<string>[] {
  const source = definition.source;
  if (!source) return [];
  return rowOptions(value, source.options, source.label, source.value, invalid).map(choice => {
    if (typeof choice.raw !== "string") return invalid(source.options.join("."));
    return { label: choice.label, value: choice.raw };
  });
}

export function choiceGroupRequired(definition: ChoiceGroupDefinition, catalog: readonly SelectChoice<string>[], value: unknown): boolean {
  if (!definition.required || definition.templateDisabled) return false;
  if (!catalog.length) return true;
  const enabled = catalog.filter(choice => !choice.disabled);
  if (!enabled.length) return false;
  return definition.kind === "radio" ? !catalog.some(choice => choice.value === value) :
    !Array.isArray(value) || enabled.some(choice => !value.includes(choice.value));
}

function combinedChoices(prefix: readonly SelectChoice<string>[], suffix: readonly SelectChoice<string>[]): readonly SelectChoice<string>[] {
  const all = [...prefix, ...suffix], seen = new Set<string>();
  for (const choice of all) { if (seen.has(choice.value)) throw error("CHOICE_OPTIONS", "Common and row choices need distinct string codes."); seen.add(choice.value); }
  return all;
}

export function choiceGroupChoices(definition: ChoiceGroupDefinition, catalog: ChoiceGroupCatalog, row: unknown,
  invalid: (field: string) => never): readonly SelectChoice<string>[] {
  return combinedChoices(catalog.choices, choiceGroupOptions(definition, row, invalid));
}

function selections(kind: ChoiceGroupDefinition["kind"], value: unknown): string | null | readonly string[] {
  const selected = Array.isArray(value) ? Array.from(value) : value;
  if (kind === "radio" ? selected !== null && typeof selected !== "string" :
      !Array.isArray(selected) || selected.some(item => typeof item !== "string")) {
    throw error("CHOICE_VALUE", kind === "radio" ? "A radio group needs a string or null." : "A checkbox group needs an array of strings.");
  }
  return selected as string | null | readonly string[];
}

function choices(source: readonly SelectChoice<string>[], current: () => void): readonly SelectChoice<string>[] {
  if (!Array.isArray(source)) throw error("CHOICE_OPTIONS", "Choices must be an array.");
  const result: SelectChoice<string>[] = [], seen = new Set<string>();
  for (const choice of source) {
    current(); if (!choice || typeof choice !== "object") throw error("CHOICE_OPTIONS", "A choice needs a string label and value.");
    const label = observed(current, () => choice.label), value = observed(current, () => choice.value), disabled = observed(current, () => choice.disabled);
    if (typeof label !== "string" || !label.trim() || typeof value !== "string" || seen.has(value) ||
        disabled !== undefined && typeof disabled !== "boolean") throw error("CHOICE_OPTIONS", "Choices need nonempty labels, distinct string values and optional disabled flags.");
    seen.add(value); result.push(Object.freeze({ label, value, ...(disabled === undefined ? {} : { disabled }) }));
  }
  current(); return Object.freeze(result);
}

function createChoiceGroup(root: HTMLFieldSetElement, definition: ChoiceGroupDefinition, options: {
  choices: readonly SelectChoice<string>[]; value?: string | null | readonly string[];
  onChange?: (this: void, value: string | null | readonly string[], event: Event) => void;
}, mounted: { defaults?: readonly string[]; labels?: readonly number[]; current?: () => void; suffix?: readonly SelectChoice<string>[] } = {}) {
  const document = root.ownerDocument, authored = [...root.childNodes], restoreRoot = restoreAttributes(root, ["tabindex"]);
  const initialCurrent = mounted.current ?? (() => {});
  let name: string; do { name = uniqueId(document, "njs-choice"); } while (document.getElementsByName(name).length);
  let inputs: HTMLInputElement[] = [], labels: HTMLLabelElement[] = [], values: string[] = [], common: readonly SelectChoice<string>[] = [];
  let committed: ChoiceGroupCatalog = { choices: [], defaults: [] }, catalogGeneration = 0;
  let disposed = false, generation = 0, onChange: typeof options.onChange, template: HTMLTemplateElement;
  function active() { if (disposed) throw error("CHOICE_DISPOSED", "This choice group has been disposed."); }
  const group: ChoiceGroupBinding = {
    root, definition, kind: definition.kind, required: definition.required, templateDisabled: definition.templateDisabled,
    get inputs() { return inputs; }, get values() { return values; },
    get catalog() {
      if (generation !== catalogGeneration) return committed;
      const defaults = new Set(inputs.filter(input => input.defaultChecked).map(input => input.value));
      return { choices: committed.choices, defaults: committed.choices.filter(choice => defaults.has(choice.value)).map(choice => choice.value) };
    },
    read() { return definition.kind === "radio" ? inputs.find(input => input.checked)?.value ?? null : inputs.filter(input => input.checked).map(input => input.value); },
    write(value, current) {
      const selected = new Set(definition.kind === "radio" ? typeof value === "string" ? [value] : [] :
        Array.isArray(value) ? value.filter(item => typeof item === "string") : []);
      for (const input of inputs) {
        if (current && !current()) return;
        input.checked = selected.has(input.value);
        if (current && !current()) return;
      }
    },
    prepare(suffix, current, restoreCommon = false) {
      active(); const owner = choiceGroupCheckpoint(group), expected = generation;
      const checkpoint = () => { current(); active(); owner(); };
      const shown = observed(checkpoint, () => group.read());
      const defaults = observed(checkpoint, () => generation === catalogGeneration ? inputs.filter(input => input.defaultChecked).map(input => input.value) : committed.defaults);
      const next = prepare(committed.choices, suffix, shown, defaults, checkpoint);
      checkpoint(); return replacement(next, expected, owner, checkpoint, restoreCommon);
    }
  };
  function prepare(prefix: readonly SelectChoice<string>[], suffix: readonly SelectChoice<string>[], value: string | null | readonly string[], defaults: readonly string[], current: () => void) {
    const shared = choices(prefix, current), local = choices(suffix, current), all = combinedChoices(shared, local);
    const selected = new Set(typeof value === "string" ? [value] : value ?? []), defaultValues = new Set(defaults);
    const nextLabels = all.map(choice => {
      const label = document.importNode(definition.item, true), input = label.querySelector("input")!;
      current(); label.querySelector<HTMLElement>("[data-choice-label]")!.textContent = choice.label; current();
      input.name = name; input.value = choice.value; input.disabled = definition.templateDisabled || choice.disabled === true;
      input.defaultChecked = defaultValues.has(choice.value); input.checked = selected.has(choice.value); current(); return label;
    });
    return { labels: nextLabels, inputs: nextLabels.map(label => label.querySelector("input")!), values: all.map(choice => choice.value), common: shared };
  }
  function rootFocus() { if (!root.matches(":disabled")) { if (!root.hasAttribute("tabindex")) root.tabIndex = -1; focusVisible(root); } }
  function replacement(next: ReturnType<typeof prepare>, expected: number, owner: () => void, current: () => void, restoreCommon = false): ChoiceGroupReplacement {
    active(); owner(); current(); if (generation !== expected) throw error("CHOICE_STALE", "A newer choice-group operation superseded this change.");
    let applied = false, rolledBack = false, finished = false, version = expected, focused: HTMLInputElement | null = null, focusedIndex = -1;
    function latest() { if (disposed || generation !== version) return false; try { owner(); return true; } catch { return false; } }
    return {
      inputs: next.inputs, values: next.values,
      apply() {
        active(); owner(); current(); if (generation !== expected) throw error("CHOICE_STALE", "A newer choice-group operation superseded this change.");
        const releasePublication = beginChoiceGroupPublication(group);
        try {
        committed = observed(current, () => group.catalog);
        const previousCatalog = committed;
        applied = true; version = ++generation; focused = document.activeElement as HTMLInputElement | null; focusedIndex = inputs.indexOf(focused!);
        const previous = [...root.childNodes], previousChecked = inputs.map(input => input.checked), tabindex = root.getAttribute("tabindex"), old = { inputs, labels, values, common };
        let undone = false, changedTabindex = false;
        const undo = (publishing = false) => {
          if (undone || !latest()) return; undone = true; rolledBack = true;
          const release = publishing ? () => {} : beginChoiceGroupPublication(group);
          try {
          inputs = old.inputs; labels = old.labels; values = old.values; common = old.common; root.replaceChildren(...previous);
          if (!latest()) return;
          for (const [index, input] of inputs.entries()) input.checked = previousChecked[index];
          if (changedTabindex) { if (tabindex === null) root.removeAttribute("tabindex"); else root.setAttribute("tabindex", tabindex); }
          version = ++generation; committed = previousCatalog; catalogGeneration = generation;
          } finally { release(); }
        };
        inputs = next.inputs; labels = next.labels; values = next.values; common = next.common;
        try {
          if (restoreCommon) {
            // An interrupted publication can still have native labels from its prior catalog.
            const nodes = previous.filter(node => !(node instanceof HTMLLabelElement && node.querySelector("input")?.name === name));
            const index = nodes.indexOf(template); current();
            if (index < 0) throw error("CHOICE_TEMPLATE", "The captured choice template was removed.");
            nodes.splice(index + 1, 0, ...labels); root.replaceChildren(...nodes); current();
          } else {
            for (const label of old.labels) { label.remove(); current(); }
            const fragment = document.createDocumentFragment(); fragment.append(...labels); current(); root.insertBefore(fragment, template.nextSibling); current();
          }
          if (latest() && !inputs.length && !root.matches(":disabled") && !root.hasAttribute("tabindex")) { changedTabindex = true; root.tabIndex = -1; current(); }
        } catch (cause) { try { undo(true); } catch { /* Preserve the original publication failure. */ } throw cause; }
        return () => undo();
        } finally { releasePublication(); }
      },
      finish(focus = true) {
        if (!applied || finished || !latest()) return; finished = true;
        if (!rolledBack) {
          const defaults = new Set(inputs.filter(input => input.defaultChecked).map(input => input.value));
          committed = { choices: common, defaults: common.filter(choice => defaults.has(choice.value)).map(choice => choice.value) };
          catalogGeneration = generation;
        }
        if (!focus || focusedIndex < 0 || root.matches(":disabled")) return;
        const target = inputs.find(input => input.value === focused!.value && !input.matches(":disabled")) ??
          inputs.slice(focusedIndex).find(input => !input.matches(":disabled")) ?? inputs.slice(0, focusedIndex).reverse().find(input => !input.matches(":disabled"));
        if ((!target || !focusVisible(target)) && latest()) rootFocus();
      }
    };
  }
  function change(event: Event) { if (!disposed && inputs.includes(event.target as HTMLInputElement)) onChange?.(group.read(), event); }
  function mutateChoices(update: (common: readonly SelectChoice<string>[]) => readonly SelectChoice<string>[]): void {
    active(); const expected = generation;
    replaceChoiceGroup(group, (current, suffix) => {
      const owned = () => { active(); current(); };
      const checkpoint = () => {
        owned();
        if (generation !== expected) throw error("CHOICE_STALE", "A newer choice-group operation superseded this change.");
      };
      const next = observed(checkpoint, () => update(committed.choices));
      const shown = observed(checkpoint, () => group.read());
      const defaults = observed(checkpoint, () => inputs.filter(input => input.defaultChecked).map(input => input.value));
      return replacement(prepare(next, suffix, shown, defaults, checkpoint), expected, current, owned);
    });
  }
  function changeSelection(prepare: () => string | null | readonly string[]): void {
    const current = (version: number) => {
      active(); assertChoiceGroupWritable(group);
      if (generation !== version) throw error("CHOICE_STALE", "A newer choice-group operation superseded this change.");
    };
    const expected = generation;
    current(expected);
    const selected = observed(() => current(expected), prepare);
    const written = ++generation; catalogGeneration = generation;
    group.write(selected, () => { current(written); return true; });
  }
  function indexedValue(include: (input: HTMLInputElement, index: number) => boolean): string | null | readonly string[] {
    const selected = values.filter((_, index) => include(inputs[index], index));
    return definition.kind === "radio" ? selected.at(-1) ?? null : selected;
  }
  const unregister = registerChoiceGroup(group);
  function dispose() {
    if (disposed) return; retireChoiceGroup(group); disposed = true; generation++;
    try { root.removeEventListener("change", change); root.replaceChildren(...authored); restoreRoot(); }
    finally { unregister(); inputs = []; labels = []; values = []; common = []; }
  }
  try {
    initialCurrent();
    for (const index of mounted.labels ?? []) {
      const node = authored[index];
      if (!(node instanceof HTMLLabelElement) || node.parentNode !== root) throw error("CHOICE_TEMPLATE", "The captured common label topology changed.");
      node.remove(); initialCurrent();
    }
    template = [...root.children].find(element => element.matches("template[data-choice-template]")) as HTMLTemplateElement;
    onChange = observed(initialCurrent, () => options.onChange);
    if (onChange !== undefined && typeof onChange !== "function") throw error("CHOICE_OPTIONS", "onChange must be a function.");
    replaceChoiceGroup(group, (current, suffix) => {
      const checkpoint = () => { current(); initialCurrent(); };
      const initial = observed(checkpoint, () => selections(definition.kind, Object.hasOwn(options, "value") ? options.value : definition.kind === "radio" ? null : []));
      const catalog = observed(checkpoint, () => options.choices);
      return replacement(prepare(catalog, mounted.suffix ?? suffix, initial, mounted.defaults ?? (typeof initial === "string" ? [initial] : initial ?? []), checkpoint), generation, current, checkpoint);
    });
    root.addEventListener("change", change); initialCurrent(); publishChoiceGroup(group);
  } catch (cause) {
    disposed = true;
    try { root.removeEventListener("change", change); } catch { /* Preserve the original preparation failure. */ }
    try { root.replaceChildren(...authored); restoreRoot(); } catch { /* Preserve the original preparation failure. */ }
    finally { unregister(); }
    throw cause;
  }
  return { binding: group, dispose, handle: {
    setChoices(next: readonly SelectChoice<string>[]) { mutateChoices(() => next); },
    appendChoices(next: readonly SelectChoice<string>[]) {
      mutateChoices(common => {
        if (!Array.isArray(next)) throw error("CHOICE_OPTIONS", "Choices must be an array.");
        return [...common, ...next];
      });
    },
    removeChoices(value: string) {
      active();
      if (typeof value !== "string") throw error("CHOICE_VALUE", "A choice code must be a string.");
      if (committed.choices.some(choice => choice.value === value)) {
        mutateChoices(common => common.filter(choice => choice.value !== value));
      }
    },
    setValue(value: string | null | readonly string[]) { changeSelection(() => selections(definition.kind, value)); },
    value() { active(); return group.read(); },
    indexes() { active(); return inputs.flatMap((input, index) => input.checked ? [index] : []); },
    setIndexes(indexes: readonly number[]) {
      changeSelection(() => {
        const selected = choiceIndexes(indexes, inputs.length, definition.kind === "checkbox");
        if (!selected) throw error("CHOICE_INDEX", "Use distinct positions from the current choices and at most one for a radio group.");
        return indexedValue((_, index) => selected.has(index));
      });
    },
    reset(mode: "default" | "first" | "clear" = "default") {
      changeSelection(() => {
        if (mode === "clear") return definition.kind === "radio" ? null : [];
        if (mode === "first") return indexedValue((_, index) => index === 0);
        if (mode === "default") return indexedValue(input => input.defaultChecked);
        throw error("CHOICE_VALUE", "Choice reset mode must be default, first or clear.");
      });
    },
    dispose() { if (disposed) return; assertChoiceGroupWritable(group); dispose(); }
  } satisfies ChoiceGroupHandle };
}

export function mountChoiceGroup(root: HTMLFieldSetElement, definition: ChoiceGroupDefinition, catalog: ChoiceGroupCatalog,
  options: { value?: string | null | readonly string[]; suffix?: readonly SelectChoice<string>[]; current?: () => void; capturedLabels?: readonly number[] } = {}) {
  const value = Object.hasOwn(options, "value") ? options.value! : definition.kind === "radio" ? null : [];
  return createChoiceGroup(root, definition, { choices: catalog.choices, value }, {
    defaults: catalog.defaults, labels: options.capturedLabels, current: options.current, suffix: options.suffix
  });
}

export function captureChoiceGroup(root: HTMLFieldSetElement) {
  const existing = getChoiceGroup(root), created = existing ? undefined : mountChoiceGroup(root, compileChoiceGroup(root), { choices: [], defaults: [] });
  const group = existing ?? created!.binding, release = claimChoiceGroup(group), current = choiceGroupCheckpoint(group);
  try {
    const catalog = group.catalog; current(); const value = group.read(); current();
    const children = [...root.childNodes], labels = [...new Set(group.inputs.map(input => input.closest("label")))];
    if (labels.some(label => !label || label.parentNode !== root)) throw error("CHOICE_TEMPLATE", "Common choice labels need their captured fieldset parent.");
    const capturedLabels = Object.freeze(labels.map(label => children.indexOf(label!))); current();
    const snapshot = Object.freeze({ choices: Object.freeze([...catalog.choices]), defaults: Object.freeze([...catalog.defaults]) });
    let released = false;
    return { definition: group.definition, catalog: snapshot, value: Array.isArray(value) ? Object.freeze([...value]) : value, capturedLabels,
      release() { if (released) return; released = true; release(); created?.dispose(); } };
  } catch (cause) { release(); created?.dispose(); throw cause; }
}

export function bindChoiceGroup(root: HTMLFieldSetElement, options: {
  choices: readonly SelectChoice<string>[];
  value?: string | null | readonly string[];
  onChange?: (this: void, value: string | null | readonly string[], event: Event) => void;
}): ChoiceGroupHandle {
  if (!options || typeof options !== "object") throw error("CHOICE_OPTIONS", "Choice group options are required.");
  return createChoiceGroup(root, compileChoiceGroup(root), options).handle;
}
