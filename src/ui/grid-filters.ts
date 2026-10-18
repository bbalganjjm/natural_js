// SPDX-License-Identifier: Apache-2.0
import type { Rows, Snapshot } from "../data/index.js";
import type { GridFilterChoice, SelectValue } from "./index.js";
import { FrameworkError } from "../internal/framework-error.js";

function fail(key: string, message: string): never {
  throw new FrameworkError({ api: "bindGrid", code: "GRID_FILTER", message, detail: { key } });
}

function scalar(value: unknown): value is SelectValue {
  return value === null || typeof value === "string" || typeof value === "boolean" ||
    typeof value === "number" && Number.isFinite(value);
}

/** Column predicates stay separate from the caller's whole-row filter. */
export function createGridFilters<T extends object>(options: {
  rows: Rows<T>;
  filters?: Record<string, { value: (row: Snapshot<T>) => SelectValue; label?: (value: SelectValue) => string }>;
}, manual: () => ((row: Snapshot<T>) => boolean) | null, changed: () => (() => void) | undefined) {
  if (options.filters !== undefined && (!options.filters || typeof options.filters !== "object" || Array.isArray(options.filters))) {
    fail("", "filters must be an object of scalar value functions.");
  }
  const definitions = new Map(Object.entries(options.filters ?? {}));
  for (const [key, definition] of definitions) {
    if (!key.trim() || !definition || typeof definition.value !== "function" ||
        definition.label !== undefined && typeof definition.label !== "function") {
      fail(key, "A filter needs a value function and an optional label function.");
    }
  }
  const state = new Map<string, readonly SelectValue[]>();
  const memberships = new Map<string, ReadonlySet<SelectValue>>();
  let cacheRows: ReturnType<Rows<T>["entries"]> | undefined;
  let cacheManual: ReturnType<typeof manual> | undefined;
  const choices = new Map<string, readonly GridFilterChoice[]>();

  function definition(key: string) {
    const result = definitions.get(key);
    if (!result) fail(key, "The column filter is not configured.");
    return result;
  }
  function value(key: string, row: Snapshot<T>): SelectValue {
    const result = definition(key).value(row);
    if (!scalar(result)) fail(key, "A filter value must be a string, finite number, boolean or null.");
    return result;
  }
  function matches(row: Snapshot<T>, except?: string): boolean {
    for (const [key, values] of memberships) {
      if (key !== except && !values.has(value(key, row))) return false;
    }
    return true;
  }
  function filterChoices(key: string, search = ""): readonly GridFilterChoice[] {
    const config = definition(key);
    if (typeof search !== "string") fail(key, "Filter search must be a string.");
    const entries = options.rows.entries();
    const predicate = manual();
    if (entries !== cacheRows || predicate !== cacheManual) {
      cacheRows = entries;
      cacheManual = predicate;
      choices.clear();
    }
    let result = choices.get(key);
    if (!result) {
      const counts = new Map<SelectValue, number>();
      for (const row of entries) {
        if (predicate && !predicate(row.value) || !matches(row.value, key)) continue;
        const raw = value(key, row.value);
        counts.set(raw, (counts.get(raw) ?? 0) + 1);
      }
      result = Object.freeze([...counts].map(([raw, count]) => {
        const label = config.label ? config.label(raw) : String(raw ?? "");
        if (typeof label !== "string") fail(key, "A filter label must be a string.");
        return Object.freeze({ value: raw, label, count });
      }));
      choices.set(key, result);
    }
    const query = search.toLowerCase();
    return query ? Object.freeze(result.filter(choice => choice.label.toLowerCase().includes(query))) : result;
  }
  return {
    keys: () => [...definitions.keys()],
    matches,
    filterChoices,
    columnFilter(key: string) {
      definition(key);
      return state.get(key) ?? null;
    },
    setColumnFilter(key: string, values: readonly SelectValue[] | null) {
      definition(key);
      if (values !== null && (!Array.isArray(values) || Array.from(values).some(value => !scalar(value)))) {
        fail(key, "Column filter values must be an array of JSON scalars or null.");
      }
      const next = values === null ? null : Object.freeze([...new Set(values)]);
      const previous = state.get(key) ?? null;
      if (next === previous || next !== null && previous !== null && next.length === previous.length &&
          next.every(value => previous.includes(value))) return;
      function write(values: readonly SelectValue[] | null) {
        if (values === null) { state.delete(key); memberships.delete(key); }
        else { state.set(key, values); memberships.set(key, new Set(values)); }
        choices.clear();
      }
      write(next);
      let notify: (() => void) | undefined;
      try { notify = changed(); }
      catch (cause) { write(previous); throw cause; }
      notify?.();
    }
  };
}
