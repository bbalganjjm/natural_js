// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { SelectChoice } from "./index.js";

export interface ChoiceGroupDefinition {
  readonly kind: "radio" | "checkbox";
  readonly item: HTMLLabelElement;
  readonly required: boolean;
  readonly templateDisabled: boolean;
  readonly source?: { readonly options: readonly string[]; readonly label: readonly string[]; readonly value: readonly string[] };
}

export interface ChoiceGroupCatalog {
  readonly choices: readonly SelectChoice<string>[];
  readonly defaults: readonly string[];
}

export interface ChoiceGroupBinding {
  readonly root: HTMLFieldSetElement;
  readonly definition: ChoiceGroupDefinition;
  readonly catalog: ChoiceGroupCatalog;
  readonly kind: "radio" | "checkbox";
  readonly inputs: readonly HTMLInputElement[];
  readonly values: readonly string[];
  readonly required: boolean;
  readonly templateDisabled: boolean;
  read(): string | null | readonly string[];
  write(value: unknown, current?: () => boolean): void;
  prepare(suffix: readonly SelectChoice<string>[], current: () => void, restoreCommon?: boolean): ChoiceGroupReplacement;
}

export interface ChoiceGroupReplacement {
  readonly inputs: readonly HTMLInputElement[];
  readonly values: readonly string[];
  apply(): () => void;
  finish(focus?: boolean): void;
}

export type ChoiceGroupPrepare = (suffix?: readonly SelectChoice<string>[]) => ChoiceGroupReplacement;
interface Claim { replace?: (prepare: ChoiceGroupPrepare) => void; }
const groups = new WeakMap<HTMLElement, { group: ChoiceGroupBinding; claim?: Claim; ready: boolean; publication?: { readonly claim: Claim | undefined }; version: number }>();

function error(code: string, message: string): FrameworkError {
  return new FrameworkError({ api: "bindChoiceGroup", code, message });
}

export function getChoiceGroup(root: HTMLElement): ChoiceGroupBinding | undefined {
  const current = groups.get(root);
  if (current?.publication && current.publication.claim === undefined && current.claim === undefined) throw error("CHOICE_OWNED", "This choice group is publishing its native catalog.");
  return current?.ready ? current.group : undefined;
}

export function publishChoiceGroup(group: ChoiceGroupBinding): void {
  const current = groups.get(group.root);
  if (current?.group !== group) throw error("CHOICE_DISPOSED", "This choice group has been disposed.");
  current.ready = true;
}

export function retireChoiceGroup(group: ChoiceGroupBinding): void {
  const current = groups.get(group.root);
  if (current?.group !== group) throw error("CHOICE_DISPOSED", "This choice group has been disposed.");
  if (current.claim) throw error("CHOICE_OWNED", "Release the field owner before disposing its choice group.");
  current.ready = false; current.version++;
}

export function beginChoiceGroupPublication(group: ChoiceGroupBinding): () => void {
  const current = groups.get(group.root);
  if (current?.group !== group) throw error("CHOICE_DISPOSED", "This choice group has been disposed.");
  if (current.publication && current.publication.claim === undefined && current.claim === undefined) throw error("CHOICE_OWNED", "This choice group is publishing its native catalog.");
  const previous = current.publication, publication = { claim: current.claim };
  current.publication = publication;
  let released = false;
  return () => {
    if (released) return; released = true;
    if (groups.get(group.root) === current && current.publication === publication) current.publication = previous?.claim === current.claim ? previous : undefined;
  };
}

export function assertChoiceGroupWritable(group: ChoiceGroupBinding): void {
  const current = groups.get(group.root);
  if (current?.group !== group) throw error("CHOICE_DISPOSED", "This choice group has been disposed.");
  if (current.publication && current.publication.claim === undefined && current.claim === undefined) throw error("CHOICE_OWNED", "This choice group is publishing its native catalog.");
  if (current.claim) throw error("CHOICE_OWNED", "Release the field owner before setting or disposing its choice group.");
}

export function registerChoiceGroup(group: ChoiceGroupBinding): () => void {
  if (groups.has(group.root)) throw error("CHOICE_OWNED", "This choice group is already bound.");
  const current = { group, ready: false, version: 0 };
  groups.set(group.root, current);
  return () => {
    const registered = groups.get(group.root);
    if (registered !== current) return;
    if (registered.claim) throw error("CHOICE_OWNED", "Release the field owner before disposing its choice group.");
    groups.delete(group.root);
  };
}

export function claimChoiceGroup(group: ChoiceGroupBinding, replace?: (prepare: ChoiceGroupPrepare) => void): () => void {
  assertChoiceGroupWritable(group);
  const current = groups.get(group.root)!;
  if (!current.ready) throw error("CHOICE_OWNED", "This choice group is still being initialized.");
  const claim = { replace }; current.claim = claim; current.version++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (groups.get(group.root) === current && current.claim === claim) { current.claim = undefined; current.version++; }
  };
}

export function choiceGroupCheckpoint(group: ChoiceGroupBinding): () => void {
  const record = groups.get(group.root);
  if (record?.group !== group) throw error("CHOICE_DISPOSED", "This choice group has been disposed.");
  if (record.publication && record.publication.claim === undefined && record.claim === undefined) throw error("CHOICE_OWNED", "This choice group is publishing its native catalog.");
  const claim = record.claim, version = record.version;
  return () => {
    if (groups.get(group.root) !== record || record.claim !== claim || record.version !== version) {
      throw error("CHOICE_STALE", "Choice ownership changed while preparing the catalog.");
    }
  };
}

export function replaceChoiceGroup(group: ChoiceGroupBinding,
  prepare: (current: () => void, suffix: readonly SelectChoice<string>[]) => ChoiceGroupReplacement): void {
  const record = groups.get(group.root);
  if (record?.group !== group) throw error("CHOICE_DISPOSED", "This choice group has been disposed.");
  const claim = record.claim, version = record.version;
  if (claim && !claim.replace) throw error("CHOICE_OWNED", "This owner does not allow choice replacement.");
  const current = choiceGroupCheckpoint(group);
  let replacement: ChoiceGroupReplacement | undefined, failed = false;
  const build: ChoiceGroupPrepare = (suffix = []) => {
    current(); replacement = prepare(current, suffix); current(); return replacement;
  };
  try { if (claim) claim.replace!(build); else build().apply(); }
  catch (cause) { failed = true; throw cause; }
  finally {
    if (groups.get(group.root) === record && record.claim === claim && record.version === version) {
      try { replacement?.finish(); } catch (cause) { if (!failed) throw cause; }
    }
  }
}

export function checkGroupValue(group: Pick<ChoiceGroupBinding, "kind" | "values">, value: unknown): string | null {
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
