// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";

export interface ChoiceGroupBinding {
  readonly root: HTMLFieldSetElement;
  readonly kind: "radio" | "checkbox";
  readonly inputs: readonly HTMLInputElement[];
  readonly values: readonly string[];
  readonly required: boolean;
  readonly templateDisabled: boolean;
  read(): string | null | readonly string[];
  write(value: unknown): void;
}

const groups = new WeakMap<HTMLElement, { group: ChoiceGroupBinding; claimed: boolean; ready: boolean }>();

function error(code: string, message: string): FrameworkError {
  return new FrameworkError({ api: "bindChoiceGroup", code, message });
}

export function getChoiceGroup(root: HTMLElement): ChoiceGroupBinding | undefined {
  const current = groups.get(root);
  return current?.ready ? current.group : undefined;
}

export function publishChoiceGroup(group: ChoiceGroupBinding): void {
  const current = groups.get(group.root);
  if (current?.group !== group) throw error("CHOICE_DISPOSED", "This choice group has been disposed.");
  current.ready = true;
}

export function assertChoiceGroupWritable(group: ChoiceGroupBinding): void {
  const current = groups.get(group.root);
  if (current?.group !== group) throw error("CHOICE_DISPOSED", "This choice group has been disposed.");
  if (current.claimed) throw error("CHOICE_OWNED", "Release the Form before changing or disposing its choice group.");
}

export function registerChoiceGroup(group: ChoiceGroupBinding): () => void {
  if (groups.has(group.root)) throw error("CHOICE_OWNED", "This choice group is already bound.");
  const current = { group, claimed: false, ready: false };
  groups.set(group.root, current);
  return () => {
    if (groups.get(group.root) !== current) return;
    assertChoiceGroupWritable(group);
    groups.delete(group.root);
  };
}

export function claimChoiceGroup(group: ChoiceGroupBinding): () => void {
  assertChoiceGroupWritable(group);
  const current = groups.get(group.root)!;
  if (!current.ready) throw error("CHOICE_OWNED", "This choice group is still being initialized.");
  current.claimed = true;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (groups.get(group.root) === current) current.claimed = false;
  };
}

export function checkGroupValue(group: ChoiceGroupBinding, value: unknown): string | null {
  const available = new Set(group.values);
  if (group.kind === "radio") {
    if (value === null) return null;
    if (typeof value !== "string") return "A radio group needs a string or null.";
    return available.has(value) ? null : "Choose an available option.";
  }
  if (!Array.isArray(value) || Array.from(value).some(item => typeof item !== "string")) return "A checkbox group needs an array of strings.";
  if (new Set(value).size !== value.length) return "Choose each option only once.";
  return value.every(item => available.has(item)) ? null : "Choose available options.";
}
