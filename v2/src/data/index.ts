// SPDX-License-Identifier: Apache-2.0
export type RowId = number;

export type Snapshot<T> = T extends readonly (infer Item)[]
  ? readonly Snapshot<Item>[]
  : T extends object ? { readonly [Key in keyof T]: Snapshot<T[Key]> } : T;

export type RowStatus = "clean" | "insert" | "update" | "delete";

export interface RowSnapshot<T> {
  readonly id: RowId;
  readonly value: Snapshot<T>;
  readonly status: RowStatus;
}

export interface RowChange<T> {
  readonly id: RowId;
  readonly status: "insert" | "update" | "delete";
  readonly value: Snapshot<T>;
}

export interface Rows<T extends object> {
  replace(values: readonly T[]): void;
  entries(): readonly RowSnapshot<T>[];
  get(id: RowId): RowSnapshot<T> | undefined;
  add(value: T): RowId;
  set<Key extends keyof T>(id: RowId, field: Key, value: T[Key]): void;
  remove(id: RowId): void;
  revert(id?: RowId): void;
  changes(): readonly RowChange<T>[];
  subscribe(listener: () => void): () => void;
  dispose(): void;
}
