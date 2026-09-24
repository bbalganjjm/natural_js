// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";

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

type FrozenRow = Readonly<Record<string, unknown>>;

interface StoredRow<T> {
  id: RowId;
  current: FrozenRow;
  original?: FrozenRow;
  dirty: Set<string>;
  status: RowStatus;
  view: RowSnapshot<T>;
}

function rowError(api: string, code: string, message: string, detail?: Record<string, unknown>): FrameworkError {
  return new FrameworkError({ api, code, message, detail });
}

function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || Object.getPrototypeOf(prototype) === null;
}

function cloneFrozen(value: unknown, api: string, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "object" || (!Array.isArray(value) && !isPlainObject(value)) || seen.has(value)) {
    throw rowError(api, "ROW_VALUE", "Rows require acyclic JSON-compatible values.");
  }

  seen.add(value);
  try {
    if (Array.isArray(value)) {
      const copy = [];
      for (let index = 0; index < value.length; index++) {
        copy.push(cloneFrozen(value[index], api, seen));
      }
      return Object.freeze(copy);
    }
    if (Object.getOwnPropertySymbols(value).length) {
      throw rowError(api, "ROW_VALUE", "Rows do not accept symbol keys.");
    }
    const copy = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneFrozen(item, api, seen)])
    );
    return Object.freeze(copy);
  } finally {
    seen.delete(value);
  }
}

function cloneRow(value: unknown, api: string): FrozenRow {
  if (!value || typeof value !== "object" || Array.isArray(value) || !isPlainObject(value)) {
    throw rowError(api, "ROW_VALUE", "A row must be a JSON-compatible object.");
  }
  return cloneFrozen(value, api) as FrozenRow;
}

function sameJson(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
  if (Array.isArray(left)) {
    return Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => sameJson(item, right[index]));
  }
  if (Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length &&
    keys.every((key) => Object.hasOwn(right, key) &&
      sameJson((left as FrozenRow)[key], (right as FrozenRow)[key]));
}

export function createRows<T extends object>(initial: readonly T[] = []): Rows<T> {
  let nextId = 1;
  let disposed = false;
  let entryCache: readonly RowSnapshot<T>[] | undefined;
  let changeCache: readonly RowChange<T>[] | undefined;
  const rows = new Map<RowId, StoredRow<T>>();
  const listeners = new Set<() => void>();

  function active(api: string): void {
    if (disposed) throw rowError(api, "ROWS_DISPOSED", "This row store has been disposed.");
  }

  function view(id: RowId, value: FrozenRow, status: RowStatus): RowSnapshot<T> {
    return Object.freeze({ id, value: value as Snapshot<T>, status });
  }

  function changed(): void {
    entryCache = undefined;
    changeCache = undefined;
    for (const listener of [...listeners]) {
      if (disposed) break;
      if (listeners.has(listener)) listener();
    }
  }

  function requireRow(id: RowId, api: string): StoredRow<T> {
    const row = rows.get(id);
    if (!row) throw rowError(api, "ROW_MISSING", "The row ID is not in this store.", { id });
    return row;
  }

  function makeRow(id: RowId, current: FrozenRow, inserted: boolean): StoredRow<T> {
    const status = inserted ? "insert" : "clean";
    return {
      id,
      current,
      original: inserted ? undefined : current,
      dirty: new Set(),
      status,
      view: view(id, current, status)
    };
  }

  const store: Rows<T> = {
    replace(values) {
      active("Rows.replace");
      const nextRows = new Map<RowId, StoredRow<T>>();
      let id = nextId;
      for (const value of values) {
        nextRows.set(id, makeRow(id, cloneRow(value, "Rows.replace"), false));
        id++;
      }
      rows.clear();
      for (const [key, row] of nextRows) rows.set(key, row);
      nextId = id;
      changed();
    },
    entries() {
      active("Rows.entries");
      entryCache ??= Object.freeze([...rows.values()]
        .filter((row) => row.status !== "delete")
        .map((row) => row.view));
      return entryCache;
    },
    get(id) {
      active("Rows.get");
      return rows.get(id)?.view;
    },
    add(value) {
      active("Rows.add");
      const current = cloneRow(value, "Rows.add");
      const row = makeRow(nextId++, current, true);
      rows.set(row.id, row);
      changed();
      return row.id;
    },
    set(id, field, value) {
      active("Rows.set");
      const row = requireRow(id, "Rows.set");
      if (row.status === "delete") {
        throw rowError("Rows.set", "ROW_DELETED", "Revert a deleted row before editing it.", { id });
      }
      if (typeof field !== "string") {
        throw rowError("Rows.set", "ROW_FIELD", "A row field must be a string.", { field: String(field) });
      }
      const next = cloneFrozen(value, "Rows.set");
      if (sameJson(row.current[field], next)) return;
      row.current = Object.freeze({ ...row.current, [field]: next });
      if (row.original) {
        if (sameJson(row.original[field], next)) row.dirty.delete(field);
        else row.dirty.add(field);
        row.status = row.dirty.size ? "update" : "clean";
      }
      row.view = view(row.id, row.current, row.status);
      changed();
    },
    remove(id) {
      active("Rows.remove");
      const row = requireRow(id, "Rows.remove");
      if (row.status === "delete") return;
      if (row.status === "insert") rows.delete(id);
      else {
        row.current = row.original!;
        row.dirty.clear();
        row.status = "delete";
        row.view = view(row.id, row.current, row.status);
      }
      changed();
    },
    revert(id) {
      active("Rows.revert");
      const targets = id === undefined ? [...rows.values()] : [requireRow(id, "Rows.revert")];
      let modified = false;
      for (const row of targets) {
        if (row.status === "clean") continue;
        modified = true;
        if (row.status === "insert") rows.delete(row.id);
        else {
          row.current = row.original!;
          row.dirty.clear();
          row.status = "clean";
          row.view = view(row.id, row.current, row.status);
        }
      }
      if (modified) changed();
    },
    changes() {
      active("Rows.changes");
      changeCache ??= Object.freeze([...rows.values()]
        .filter((row) => row.status !== "clean")
        .map((row) => Object.freeze({
          id: row.id,
          status: row.status as "insert" | "update" | "delete",
          value: (row.status === "delete" ? row.original : row.current) as Snapshot<T>
        })));
      return changeCache;
    },
    subscribe(listener) {
      active("Rows.subscribe");
      if (typeof listener !== "function") throw new TypeError("Rows.subscribe requires a listener.");
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      listeners.clear();
      rows.clear();
      entryCache = undefined;
      changeCache = undefined;
    }
  };

  store.replace(initial);
  return store;
}
