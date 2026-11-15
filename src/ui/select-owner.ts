// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { RowOptionValue } from "./row-options.js";

export interface SelectCatalog {
  readonly nodes: readonly Node[];
  readonly options: readonly HTMLOptionElement[];
  readonly values: readonly RowOptionValue[];
}

export interface SelectBinding {
  readonly root: HTMLSelectElement;
  readonly catalog: SelectCatalog;
  raw: ReadonlyMap<HTMLOptionElement, unknown>;
}

export interface SelectReplacement extends SelectCatalog {
  readonly raw: ReadonlyMap<HTMLOptionElement, unknown>;
  apply(): () => void;
  finish(): SelectCatalog;
}

interface Claim {
  owner: string;
  replace?: (prepare: () => SelectReplacement) => void;
}
interface Owner {
  owner: string;
  binding?: SelectBinding;
  ready: boolean;
  version: number;
  publishing: boolean;
  claim?: Claim;
}
const owners = new WeakMap<HTMLSelectElement, Owner>();

function error(api: string, owner?: string): FrameworkError {
  return new FrameworkError({ api, code: "SELECT_OWNED", message: "This Select is already bound or still initializing.",
    ...(owner === undefined ? {} : { detail: { owner } }) });
}

export function getSelect(element: HTMLSelectElement): SelectBinding | undefined {
  const current = owners.get(element);
  if (current?.publishing) throw error("bindSelect", current.claim?.owner ?? current.owner);
  return current?.ready ? current.binding : undefined;
}

export function assertSelectWritable(binding: SelectBinding): void {
  const current = owners.get(binding.root);
  if (current?.binding !== binding) throw new FrameworkError({ api: "bindSelect", code: "SELECT_DISPOSED", message: "This Select has been disposed." });
  if (current.publishing || current.claim) throw error("bindSelect", current.claim?.owner ?? current.owner);
}

export function registerSelect(binding: SelectBinding): () => void {
  if (owners.has(binding.root)) throw error("bindSelect", owners.get(binding.root)!.owner);
  const current: Owner = { owner: "bindSelect", binding, ready: false, version: 0, publishing: false };
  owners.set(binding.root, current);
  return () => {
    if (owners.get(binding.root) !== current) return;
    assertSelectWritable(binding);
    owners.delete(binding.root);
  };
}

export function publishSelect(binding: SelectBinding): void {
  const current = owners.get(binding.root);
  if (current?.binding !== binding) throw new FrameworkError({ api: "bindSelect", code: "SELECT_DISPOSED", message: "This Select has been disposed." });
  current.ready = true;
}

export function claimSelect(element: HTMLSelectElement, owner: string,
  replace?: (prepare: () => SelectReplacement) => void): () => void {
  const existing = owners.get(element);
  if (existing) {
    if (!existing.binding || !existing.ready || existing.publishing || existing.claim || owner === "bindSelect") throw error(owner, existing.claim?.owner ?? existing.owner);
    const claim = { owner, replace };
    existing.claim = claim;
    existing.version++;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      if (owners.get(element) === existing && existing.claim === claim) { existing.claim = undefined; existing.version++; }
    };
  }
  const current: Owner = { owner, ready: true, version: 0, publishing: false };
  owners.set(element, current);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (owners.get(element) === current) owners.delete(element);
  };
}

export function replaceSelect(binding: SelectBinding,
  prepare: (current: () => void) => SelectReplacement): void {
  const record = owners.get(binding.root);
  if (record?.binding !== binding) throw new FrameworkError({ api: "bindSelect", code: "SELECT_DISPOSED", message: "This Select has been disposed." });
  if (record.publishing) throw error("bindSelect", record.owner);
  const claim = record.claim, version = record.version;
  if (claim && !claim.replace) throw error("bindSelect", claim.owner);
  const current = () => {
    if (owners.get(binding.root) !== record || record.claim !== claim || record.version !== version) {
      throw new FrameworkError({ api: "bindSelect", code: "SELECT_STALE", message: "Select ownership changed while preparing choices." });
    }
  };
  const build = () => { current(); const next = prepare(current); current(); return next; };
  let publishing = false;
  try {
    if (claim) claim.replace!(build);
    else {
      const next = build();
      record.publishing = true; publishing = true;
      next.apply(); next.finish();
    }
  } finally {
    if (publishing && owners.get(binding.root) === record) record.publishing = false;
  }
}
