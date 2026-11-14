// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { SelectChoice } from "./index.js";
import { focusVisible, restoreAttributes, uniqueId } from "./dom-state.js";
import { interactiveContent } from "./native-control.js";
import { assertChoiceGroupWritable, publishChoiceGroup, registerChoiceGroup, type ChoiceGroupBinding } from "./choice-group-owner.js";

export interface ChoiceGroupHandle {
  setChoices(choices: readonly SelectChoice<string>[]): void;
  setValue(value: string | null | readonly string[]): void;
  value(): string | null | readonly string[];
  dispose(): void;
}

function error(code: string, message: string): FrameworkError {
  return new FrameworkError({ api: "bindChoiceGroup", code, message });
}

export function bindChoiceGroup(root: HTMLFieldSetElement, options: {
  choices: readonly SelectChoice<string>[];
  value?: string | null | readonly string[];
  onChange?: (value: string | null | readonly string[], event: Event) => void;
}): ChoiceGroupHandle {
  if (!(root instanceof HTMLFieldSetElement)) throw error("CHOICE_ROOT", "A choice group needs a fieldset.");
  const document = root.ownerDocument;
  const legend = [...root.children].find(element => element.localName === "legend");
  const named = root.getAttribute("aria-label")?.trim() || root.getAttribute("aria-labelledby")?.trim().split(/\s+/)
    .some(id => document.getElementById(id)?.textContent?.trim()) || legend?.textContent?.trim();
  if (!named) throw error("CHOICE_ROOT", "Name the fieldset with a legend or ARIA label.");
  const templates = [...root.children].filter(element => element.matches("template[data-choice-template]"));
  const template = templates[0] as HTMLTemplateElement | undefined;
  const item = template?.content.firstElementChild;
  const sourceInput = item?.querySelector<HTMLInputElement>("input");
  const labelTarget = item?.querySelector<HTMLElement>("[data-choice-label]");
  if (templates.length !== 1 || template!.content.children.length !== 1 || item?.localName !== "label" ||
      item.querySelectorAll("input").length !== 1 || !sourceInput || !["radio", "checkbox"].includes(sourceInput.type) ||
      item.querySelectorAll("[data-choice-label]").length !== 1 || !labelTarget || labelTarget.contains(sourceInput) ||
      labelTarget.matches(interactiveContent) || labelTarget.querySelector(interactiveContent) ||
      item.hasAttribute("id") || item.hasAttribute("data-field") || item.hasAttribute("data-choice-label") ||
      item.querySelector("[id], label, [data-field]") || item.hasAttribute("for") ||
      item.querySelectorAll(interactiveContent).length !== 1 || sourceInput.checked || sourceInput.defaultChecked || sourceInput.hasAttribute("checked")) {
    throw error("CHOICE_TEMPLATE", "Use one wrapping label, one radio or checkbox, and one noninteractive data-choice-label target without IDs or checked defaults.");
  }
  if (!options || typeof options !== "object") throw error("CHOICE_OPTIONS", "Choice group options are required.");
  const { onChange } = options;
  if (onChange !== undefined && typeof onChange !== "function") throw error("CHOICE_OPTIONS", "onChange must be a function.");
  const kind = sourceInput.type as "radio" | "checkbox";
  const required = sourceInput.required, templateDisabled = sourceInput.disabled;
  const authored = [...root.childNodes], restoreRoot = restoreAttributes(root, ["tabindex"]);
  let name: string;
  do { name = uniqueId(document, "njs-choice"); } while (document.getElementsByName(name).length);
  let inputs: HTMLInputElement[] = [], labels: HTMLLabelElement[] = [], values: string[] = [], disposed = false, generation = 0;

  function active(): void {
    if (disposed) throw error("CHOICE_DISPOSED", "This choice group has been disposed.");
  }
  function selection(value: unknown): string | null | readonly string[] {
    const selected = Array.isArray(value) ? Array.from(value) : value;
    if (kind === "radio" ? selected !== null && typeof selected !== "string" :
        !Array.isArray(selected) || selected.some(item => typeof item !== "string")) {
      throw error("CHOICE_VALUE", kind === "radio" ? "A radio group needs a string or null." : "A checkbox group needs an array of strings.");
    }
    return selected as string | null | readonly string[];
  }
  function current(expected: number): void {
    active(); assertChoiceGroupWritable(group);
    if (generation !== expected) throw error("CHOICE_STALE", "A newer choice-group operation superseded this change.");
  }
  const group: ChoiceGroupBinding = {
    root, kind, required, templateDisabled,
    get inputs() { return inputs; }, get values() { return values; },
    read() { return kind === "radio" ? inputs.find(input => input.checked)?.value ?? null : inputs.filter(input => input.checked).map(input => input.value); },
    write(value) {
      const selected = new Set(kind === "radio" ? typeof value === "string" ? [value] : [] :
        Array.isArray(value) ? value.filter(item => typeof item === "string") : []);
      for (const input of inputs) input.checked = selected.has(input.value);
    }
  };
  function rootFocus(): void {
    if (root.matches(":disabled")) return;
    if (!root.hasAttribute("tabindex")) root.tabIndex = -1;
    focusVisible(root);
  }
  function prepare(choices: readonly SelectChoice<string>[], value: string | null | readonly string[], defaults: readonly string[]) {
    if (!Array.isArray(choices)) throw error("CHOICE_OPTIONS", "Choices must be an array.");
    const seen = new Set<string>();
    const prepared = Array.from(choices, choice => {
      if (!choice || typeof choice !== "object") throw error("CHOICE_OPTIONS", "A choice needs a string label and value.");
      const { label, value, disabled } = choice;
      if (typeof label !== "string" || !label.trim() || typeof value !== "string" || seen.has(value) ||
          disabled !== undefined && typeof disabled !== "boolean") throw error("CHOICE_OPTIONS", "Choices need nonempty labels, distinct string values and optional disabled flags.");
      seen.add(value); return { label, value, disabled: templateDisabled || disabled === true };
    });
    const selected = new Set(typeof value === "string" ? [value] : value ?? []), defaultValues = new Set(defaults);
    const nextLabels = prepared.map(choice => {
      const label = item!.cloneNode(true) as HTMLLabelElement, input = label.querySelector("input")!;
      label.querySelector<HTMLElement>("[data-choice-label]")!.textContent = choice.label;
      input.name = name; input.value = choice.value; input.disabled = choice.disabled;
      input.defaultChecked = defaultValues.has(choice.value);
      input.checked = selected.has(choice.value);
      return label;
    });
    return { labels: nextLabels, inputs: nextLabels.map(label => label.querySelector("input")!), values: prepared.map(choice => choice.value) };
  }
  function publish(next: ReturnType<typeof prepare>, expected: number): void {
    current(expected);
    const version = ++generation, focused = document.activeElement as HTMLInputElement | null, focusedIndex = inputs.indexOf(focused!);
    const previous = [...root.childNodes], previousChecked = inputs.map(input => input.checked);
    const old = { inputs, labels, values };
    inputs = next.inputs; labels = next.labels; values = next.values;
    try {
      for (const label of old.labels) label.remove();
      const fragment = document.createDocumentFragment(); fragment.append(...labels);
      root.insertBefore(fragment, template!.nextSibling);
    } catch (cause) {
      if (!disposed && generation === version) {
        inputs = old.inputs; labels = old.labels; values = old.values;
        root.replaceChildren(...previous);
        for (const [index, input] of inputs.entries()) input.checked = previousChecked[index];
        if (focusedIndex >= 0) focusVisible(focused!);
      }
      throw cause;
    }
    if (disposed || generation !== version) return;
    if (!inputs.length && !root.matches(":disabled") && !root.hasAttribute("tabindex")) root.tabIndex = -1;
    if (focusedIndex >= 0 && !root.matches(":disabled")) {
      const target = inputs.find(input => input.value === focused!.value && !input.matches(":disabled")) ??
        inputs.slice(focusedIndex).find(input => !input.matches(":disabled")) ?? inputs.slice(0, focusedIndex).reverse().find(input => !input.matches(":disabled"));
      if (!target || !focusVisible(target)) { current(version); rootFocus(); }
    }
  }
  function setChoices(choices: readonly SelectChoice<string>[]): void {
    active(); assertChoiceGroupWritable(group);
    const version = generation;
    const next = prepare(choices, group.read(), inputs.filter(input => input.defaultChecked).map(input => input.value));
    publish(next, version);
  }
  function setValue(value: string | null | readonly string[]): void {
    active(); assertChoiceGroupWritable(group);
    const version = generation, selected = selection(value);
    current(version); generation++; group.write(selected);
  }
  function change(event: Event): void {
    if (!disposed && inputs.includes(event.target as HTMLInputElement)) onChange?.(group.read(), event);
  }
  const unregister = registerChoiceGroup(group);
  try {
    const initial = selection(Object.hasOwn(options, "value") ? options.value : kind === "radio" ? null : []);
    const first = prepare(options.choices, initial, typeof initial === "string" ? [initial] : initial ?? []);
    publish(first, generation);
    root.addEventListener("change", change);
    publishChoiceGroup(group);
  } catch (cause) {
    root.replaceChildren(...authored); restoreRoot(); unregister(); throw cause;
  }
  return {
    setChoices, setValue,
    value() { active(); return group.read(); },
    dispose() {
      if (disposed) return;
      assertChoiceGroupWritable(group);
      generation++;
      root.removeEventListener("change", change); root.replaceChildren(...authored); restoreRoot();
      unregister(); disposed = true; inputs = []; labels = []; values = [];
    }
  };
}
