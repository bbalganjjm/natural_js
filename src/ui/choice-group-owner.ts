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

export interface ChoiceGroupReplacement {
  readonly inputs: readonly HTMLInputElement[];
  readonly values: readonly string[];
  apply(): () => void;
  finish(): void;
}

interface Claim {
  replace?: (prepare: () => ChoiceGroupReplacement) => void;
}

const groups = new WeakMap<HTMLElement, { group: ChoiceGroupBinding; claim?: Claim; ready: boolean; version: number }>();

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
  if (current.claim) throw error("CHOICE_OWNED", "Release the Form before setting or disposing its choice group.");
}

export function registerChoiceGroup(group: ChoiceGroupBinding): () => void {
  if (groups.has(group.root)) throw error("CHOICE_OWNED", "This choice group is already bound.");
  const current = { group, ready: false, version: 0 };
  groups.set(group.root, current);
  return () => {
    if (groups.get(group.root) !== current) return;
    assertChoiceGroupWritable(group);
    groups.delete(group.root);
  };
}

export function claimChoiceGroup(group: ChoiceGroupBinding, replace?: (prepare: () => ChoiceGroupReplacement) => void): () => void {
  assertChoiceGroupWritable(group);
  const current = groups.get(group.root)!;
  if (!current.ready) throw error("CHOICE_OWNED", "This choice group is still being initialized.");
  const claim = { replace };
  current.claim = claim;
  current.version++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (groups.get(group.root) === current && current.claim === claim) {
      current.claim = undefined;
      current.version++;
    }
  };
}

export function replaceChoiceGroup(group: ChoiceGroupBinding,
  prepare: (current: () => void) => ChoiceGroupReplacement): void {
  const record = groups.get(group.root);
  if (record?.group !== group) throw error("CHOICE_DISPOSED", "This choice group has been disposed.");
  const claim = record.claim, version = record.version;
  if (claim && !claim.replace) throw error("CHOICE_OWNED", "This owner does not allow choice replacement.");
  const current = () => {
    if (groups.get(group.root) !== record || record.claim !== claim || record.version !== version) {
      throw error("CHOICE_STALE", "Choice ownership changed while preparing the catalog.");
    }
  };
  let replacement: ChoiceGroupReplacement | undefined, failed = false;
  const build = () => {
    current();
    replacement = prepare(current);
    current();
    return replacement;
  };
  try {
    if (claim) claim.replace!(build);
    else build().apply();
  } catch (cause) { failed = true; throw cause; }
  finally {
    if (groups.get(group.root) === record && record.claim === claim && record.version === version) {
      try { replacement?.finish(); }
      catch (cause) { if (!failed) throw cause; }
    }
  }
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
