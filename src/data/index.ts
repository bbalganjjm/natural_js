// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { sameJson } from "../internal/same-json.js";

export type RowId = number;

export type Snapshot<T> = T extends readonly (infer Item)[]
  ? readonly Snapshot<Item>[]
  : T extends object ? { readonly [Key in keyof T]: Snapshot<T[Key]> } : T;

export type RowStatus = "clean" | "insert" | "update" | "delete";

export interface RowState<T> {
  readonly value: T;
  readonly status: RowStatus;
}

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

export type RowsEvent =
  | { readonly type: "replace"; readonly changed: true }
  | { readonly type: "add" | "move" | "set" | "remove"; readonly id: RowId; readonly changed: true }
  | { readonly type: "append"; readonly ids: readonly RowId[]; readonly changed: true }
  | { readonly type: "setMany"; readonly ids: readonly RowId[]; readonly changed: true }
  | { readonly type: "revert"; readonly id?: RowId; readonly changed: boolean };

export interface Rows<T extends object> {
  replace(values: readonly T[]): void;
  replaceState(states: readonly RowState<T>[]): void;
  entries(options?: { includeDeleted?: boolean }): readonly RowSnapshot<T>[];
  get(id: RowId): RowSnapshot<T> | undefined;
  original(id: RowId): Snapshot<T> | undefined;
  append(values: readonly T[]): readonly RowId[];
  appendState(states: readonly RowState<T>[]): readonly RowId[];
  add(value: T, before?: RowId): RowId;
  move(id: RowId, before?: RowId): void;
  copy(id: RowId, before?: RowId): RowId;
  set<Key extends keyof T>(id: RowId, field: Key, value: T[Key]): void;
  setMany(updates: readonly { readonly id: RowId; readonly values: Partial<T> }[]): void;
  remove(id: RowId): void;
  revert(id?: RowId): void;
  changes(): readonly RowChange<T>[];
  subscribe(listener: (event: RowsEvent) => void): () => void;
  dispose(): void;
}

type FrozenRow = Readonly<Record<string, unknown>>;

interface StoredRow<T> {
  id: RowId;
  current: FrozenRow;
  original?: FrozenRow;
  checkpoint?: RowStatus;
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

export function createRows<T extends object>(initial: readonly T[] = []): Rows<T> {
  let nextId = 1;
  let disposed = false;
  let revision = 0;
  let entryCache: readonly RowSnapshot<T>[] | undefined;
  let allEntryCache: readonly RowSnapshot<T>[] | undefined;
  let changeCache: readonly RowChange<T>[] | undefined;
  const rows = new Map<RowId, StoredRow<T>>();
  const listeners = new Set<(event: RowsEvent) => void>();

  function active(api: string): void {
    if (disposed) throw rowError(api, "ROWS_DISPOSED", "This row store has been disposed.");
  }

  function view(id: RowId, value: FrozenRow, status: RowStatus): RowSnapshot<T> {
    return Object.freeze({ id, value: value as Snapshot<T>, status });
  }

  function notify(event: RowsEvent): void {
    if (event.changed) {
      revision++;
      entryCache = undefined;
      allEntryCache = undefined;
      changeCache = undefined;
    }
    Object.freeze(event);
    let failed = false;
    let firstError: unknown;
    for (const listener of [...listeners]) {
      if (disposed) break;
      if (!listeners.has(listener)) continue;
      try { listener(event); }
      catch (cause) {
        if (!failed) {
          failed = true;
          firstError = cause;
        }
      }
    }
    if (failed) throw firstError;
  }

  function requireRow(id: RowId, api: string): StoredRow<T> {
    active(api);
    const row = rows.get(id);
    if (!row) throw rowError(api, "ROW_MISSING", "The row ID is not in this store.", { id });
    return row;
  }

  function unchanged(version: number, api: string): void {
    active(api);
    if (revision !== version) {
      throw rowError(api, "ROW_VALUE", "Rows changed while preparing values. Retry with the current rows.");
    }
  }

  function editableRow(id: RowId, api: string): StoredRow<T> {
    const row = requireRow(id, api);
    if (row.status === "delete") {
      throw rowError(api, "ROW_DELETED", "A deleted row cannot be edited.", { id });
    }
    return row;
  }

  function applyFields(row: StoredRow<T>, values: FrozenRow): boolean {
    const fields = Object.keys(values).filter(field => !sameJson(row.current[field], values[field]));
    if (!fields.length) return false;
    row.current = Object.freeze({ ...row.current, ...values });
    if (row.original) {
      for (const field of fields) {
        if (sameJson(row.original[field], values[field])) row.dirty.delete(field);
        else row.dirty.add(field);
      }
      row.status = row.checkpoint === "insert" ? "insert" : row.dirty.size ? "update" : row.checkpoint ?? "clean";
    }
    row.view = view(row.id, row.current, row.status);
    return true;
  }

  function makeRow(id: RowId, current: FrozenRow, inserted: boolean, checkpoint?: RowStatus): StoredRow<T> {
    const status = checkpoint ?? (inserted ? "insert" : "clean");
    return {
      id,
      current,
      original: inserted && checkpoint === undefined ? undefined : current,
      checkpoint,
      dirty: new Set(),
      status,
      view: view(id, current, status)
    };
  }

  function load(values: readonly unknown[], api: string, state: boolean, append: boolean): readonly RowId[] {
    active(api);
    const version = revision;
    if (!Array.isArray(values)) throw rowError(api, "ROW_VALUE", "Loaded rows require an array.");
    const prepared: { current: FrozenRow; checkpoint?: RowStatus }[] = [];
    for (let index = 0; index < values.length; index++) {
      if (!Object.hasOwn(values, index)) {
        throw rowError(api, "ROW_VALUE", "Loaded rows cannot contain missing entries.", { index });
      }
      const value = values[index];
      if (state) {
        if (!value || typeof value !== "object" || Array.isArray(value) || !isPlainObject(value) ||
            Reflect.ownKeys(value).some(key => key !== "value" && key !== "status") ||
            !Object.hasOwn(value, "value") || !Object.hasOwn(value, "status")) {
          throw rowError(api, "ROW_VALUE", "A row state needs only own value and status properties.", { index });
        }
        const record = value as RowState<unknown>;
        const status = record.status;
        if (!["clean", "insert", "update", "delete"].includes(status)) {
          throw rowError(api, "ROW_VALUE", "Use clean, insert, update or delete row status.", { index });
        }
        prepared.push({ current: cloneRow(record.value, api), checkpoint: status });
      } else prepared.push({ current: cloneRow(value, api) });
    }
    unchanged(version, api);
    if (!append) rows.clear();
    const ids: RowId[] = [];
    for (const { current, checkpoint } of prepared) {
      const id = nextId++;
      rows.set(id, makeRow(id, current, false, checkpoint));
      if (append) ids.push(id);
    }
    const appended = Object.freeze(ids);
    if (!append) notify({ type: "replace", changed: true });
    else if (appended.length) notify({ type: "append", ids: appended, changed: true });
    return appended;
  }

  function place(row: StoredRow<T>, before?: RowId): boolean {
    if (before === row.id) return false;
    if (before === undefined && !rows.has(row.id)) {
      rows.set(row.id, row);
      return true;
    }
    const ordered = [...rows.values()];
    const index = ordered.indexOf(row);
    if (index >= 0 && ordered[index + 1]?.id === before) return false;
    rows.clear();
    for (const current of ordered) {
      if (current.id === before) rows.set(row.id, row);
      if (current !== row) rows.set(current.id, current);
    }
    if (before === undefined) rows.set(row.id, row);
    return true;
  }

  const store: Rows<T> = {
    replace(values) {
      load(values, "Rows.replace", false, false);
    },
    replaceState(states) {
      load(states, "Rows.replaceState", true, false);
    },
    entries(options) {
      active("Rows.entries");
      if (options !== undefined && (!options || typeof options !== "object" || Array.isArray(options))) {
        throw rowError("Rows.entries", "ROW_VALUE", "Row entry options require an object.");
      }
      const includeDeleted = options?.includeDeleted;
      if (includeDeleted !== undefined && typeof includeDeleted !== "boolean") {
        throw rowError("Rows.entries", "ROW_VALUE", "includeDeleted must be a boolean.");
      }
      active("Rows.entries");
      if (includeDeleted) return allEntryCache ??= Object.freeze([...rows.values()].map(row => row.view));
      entryCache ??= Object.freeze([...rows.values()]
        .filter((row) => row.status !== "delete")
        .map((row) => row.view));
      return entryCache;
    },
    get(id) {
      active("Rows.get");
      return rows.get(id)?.view;
    },
    original(id) {
      active("Rows.original");
      const row = rows.get(id);
      return row?.status === "insert" ? undefined : row?.original as Snapshot<T> | undefined;
    },
    append(values) {
      return load(values, "Rows.append", false, true);
    },
    appendState(states) {
      return load(states, "Rows.appendState", true, true);
    },
    add(value, before) {
      active("Rows.add");
      const version = revision;
      if (before !== undefined) requireRow(before, "Rows.add");
      const current = cloneRow(value, "Rows.add");
      unchanged(version, "Rows.add");
      const row = makeRow(nextId++, current, true);
      place(row, before);
      notify({ type: "add", id: row.id, changed: true });
      return row.id;
    },
    move(id, before) {
      const row = editableRow(id, "Rows.move");
      if (before !== undefined) requireRow(before, "Rows.move");
      if (place(row, before)) notify({ type: "move", id, changed: true });
    },
    copy(id, before) {
      active("Rows.copy");
      const version = revision;
      const source = editableRow(id, "Rows.copy");
      if (before !== undefined) requireRow(before, "Rows.copy");
      const current = cloneRow(source.current, "Rows.copy");
      unchanged(version, "Rows.copy");
      const row = makeRow(nextId++, current, true);
      place(row, before);
      notify({ type: "add", id: row.id, changed: true });
      return row.id;
    },
    set(id, field, value) {
      active("Rows.set");
      const version = revision;
      const row = editableRow(id, "Rows.set");
      if (typeof field !== "string") {
        throw rowError("Rows.set", "ROW_FIELD", "A row field must be a string.", { field: String(field) });
      }
      const next = cloneFrozen(value, "Rows.set");
      unchanged(version, "Rows.set");
      if (!applyFields(row, { [field]: next })) return;
      notify({ type: "set", id, changed: true });
    },
    setMany(updates) {
      active("Rows.setMany");
      const version = revision;
      if (!Array.isArray(updates)) {
        throw rowError("Rows.setMany", "ROW_VALUE", "Row updates must be an array.");
      }
      const prepared = new Map<RowId, { row: StoredRow<T>; values: FrozenRow }>();
      for (const update of updates) {
        if (!update || typeof update !== "object" || Array.isArray(update) || !isPlainObject(update)) {
          throw rowError("Rows.setMany", "ROW_VALUE", "A row update needs an ID and a values object.");
        }
        const row = editableRow(update.id, "Rows.setMany");
        const values = cloneRow(update.values, "Rows.setMany");
        prepared.set(row.id, { row, values: { ...prepared.get(row.id)?.values, ...values } });
      }
      unchanged(version, "Rows.setMany");
      const ids: RowId[] = [];
      for (const [id, { row, values }] of prepared) {
        if (applyFields(row, values)) ids.push(id);
      }
      if (ids.length) notify({ type: "setMany", ids: Object.freeze(ids), changed: true });
    },
    remove(id) {
      active("Rows.remove");
      const row = requireRow(id, "Rows.remove");
      if (row.status === "delete") return;
      if (row.status === "insert") rows.delete(id);
      else {
        row.status = "delete";
        row.view = view(row.id, row.current, row.status);
      }
      notify({ type: "remove", id, changed: true });
    },
    revert(id) {
      active("Rows.revert");
      const targets = id === undefined ? [...rows.values()] : [requireRow(id, "Rows.revert")];
      let modified = false;
      for (const row of targets) {
        const status = row.checkpoint ?? "clean";
        if (row.status === status && !row.dirty.size) continue;
        modified = true;
        if (row.status === "insert" && row.checkpoint === undefined) rows.delete(row.id);
        else {
          row.current = row.original!;
          row.dirty.clear();
          row.status = status;
          row.view = view(row.id, row.current, row.status);
        }
      }
      notify(id === undefined
        ? { type: "revert", changed: modified }
        : { type: "revert", id, changed: modified });
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
      allEntryCache = undefined;
      changeCache = undefined;
    }
  };

  store.replace(initial);
  return store;
}
