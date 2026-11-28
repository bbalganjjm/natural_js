// SPDX-License-Identifier: Apache-2.0
import type { RowId, RowSnapshot, Rows } from "../data/index.js";
import { FrameworkError } from "../internal/framework-error.js";
import type { GridCheckState, GridIdsChange, GridRowScope } from "./index.js";

interface ActiveChange<T> {
  id: RowId | null;
  row: RowSnapshot<T> | null;
  event: Event | null;
}

export interface RowSelectionOptions<T extends object> {
  multiple?: boolean;
  toggleSelection?: boolean;
  checkMode?: "multiple" | "single";
  canSelect?: (row: RowSnapshot<T>) => boolean;
  canCheck?: (row: RowSnapshot<T>) => boolean;
  beforeSelect?: (change: ActiveChange<T>) => boolean | void;
  onSelect?: (change: ActiveChange<T>) => void;
  beforeSelectionChange?: (change: GridIdsChange) => boolean | void;
  onSelectionChange?: (change: GridIdsChange) => void;
  beforeCheckChange?: (change: GridIdsChange) => boolean | void;
  onCheckChange?: (change: GridIdsChange) => void;
}

export function createRowSelection<T extends object>(api: "bindGrid" | "bindList", rows: Rows<T>,
  options: RowSelectionOptions<T>, view: {
  visible: () => readonly RowId[];
  filtered: () => readonly RowId[];
  revision: () => number;
  changed: () => void;
}) {
  const { multiple, toggleSelection, checkMode, canSelect, canCheck, beforeSelect, onSelect,
    beforeSelectionChange, onSelectionChange, beforeCheckChange, onCheckChange } = options;
  const component = api === "bindGrid" ? "Grid" : "List";
  const prefix = component.toUpperCase();
  type Kind = "selection" | "check";
  const empty: readonly RowId[] = Object.freeze([]);
  let selected: RowId | null = null;
  let selection = empty;
  let checks = empty;
  let anchor: RowId | null = null;
  let revision = 0;

  function fail(code: string, message: string, detail?: Record<string, unknown>): never {
    throw new FrameworkError({ api, code: `${prefix}_${code}`, message, detail });
  }

  if (multiple !== undefined && typeof multiple !== "boolean") {
    fail("SELECTION", `${component} multiple selection must be a boolean.`);
  }
  if (toggleSelection !== undefined && typeof toggleSelection !== "boolean") {
    fail("SELECTION", `${component} toggleSelection must be a boolean.`);
  }
  if (checkMode !== undefined && checkMode !== "multiple" && checkMode !== "single") {
    fail("CHECK_MODE", `${component} checkMode must be multiple or single.`);
  }
  for (const [name, run] of Object.entries({ canSelect, beforeSelect, onSelect, beforeSelectionChange, onSelectionChange })) {
    if (run !== undefined && typeof run !== "function") {
      fail("SELECTION", `A ${component} selection callback must be a function.`, { option: name });
    }
  }
  for (const [name, run] of Object.entries({ canCheck, beforeCheckChange, onCheckChange })) {
    if (run !== undefined && typeof run !== "function") {
      fail("CHECK", `A ${component} check callback must be a function.`, { option: name });
    }
  }

  function same(left: readonly RowId[], right: readonly RowId[]): boolean {
    return left.length === right.length && left.every((id, index) => id === right[index]);
  }

  function code(kind: Kind): string { return kind === "selection" ? "SELECTION" : "CHECK"; }

  function eligible(id: RowId, kind: Kind): boolean {
    const row = rows.get(id);
    if (!row || row.status === "delete") return false;
    const predicate = kind === "selection" ? canSelect : canCheck;
    if (!predicate) return true;
    const allowed = predicate(row);
    if (typeof allowed !== "boolean") {
      fail(code(kind), `A ${component} row eligibility callback must return a boolean.`, { id });
    }
    return allowed;
  }

  function checkpoint(kind: Kind): () => void {
    const expected = revision;
    const expectedView = view.revision();
    const entries = rows.entries();
    const visible = [...view.visible()];
    const filtered = [...view.filtered()];
    return () => {
      if (revision !== expected || view.revision() !== expectedView || rows.entries() !== entries ||
          !same(view.visible(), visible) || !same(view.filtered(), filtered)) {
        fail(code(kind), `${component} state changed while a row transition was being prepared.`);
      }
    };
  }

  function ordered(ids: ReadonlySet<RowId>): readonly RowId[] {
    if (!ids.size) return empty;
    return Object.freeze(rows.entries().filter(row => ids.has(row.id)).map(row => row.id));
  }

  function checkedIds(ids: readonly RowId[], kind: Kind): readonly RowId[] {
    if (!Array.isArray(ids)) fail(code(kind), `${component} row IDs must be an array.`);
    const next = new Set<RowId>();
    for (const id of ids) {
      if (next.has(id)) fail(code(kind), `${component} row IDs must not repeat.`, { id });
      const row = rows.get(id);
      if (!row || row.status === "delete") fail("ROW", `The row ID is not available in this ${component}.`, { id });
      if (!eligible(id, kind)) fail(code(kind), `The row is not eligible for this ${component} operation.`, { id });
      next.add(id);
    }
    return ordered(next);
  }

  function activeChange(id: RowId | null, event: Event | null): ActiveChange<T> {
    return Object.freeze({ id, row: id === null ? null : rows.get(id) ?? null, event });
  }

  function idsChange(ids: readonly RowId[], previous: readonly RowId[], event: Event | null): GridIdsChange {
    return Object.freeze({ ids, previous, event });
  }

  function allowed<TChange>(hook: ((change: TChange) => boolean | void) | undefined,
    change: TChange, unchanged: () => void, kind: Kind): boolean {
    const result = hook?.(change);
    unchanged();
    if (result !== undefined && typeof result !== "boolean") {
      fail(code(kind), `A ${component} before-change callback must return a boolean or undefined.`);
    }
    return result !== false;
  }

  function changeSelection(id: RowId | null, ids: readonly RowId[], event: Event | null,
    nextAnchor: RowId | null, unchanged: () => void): boolean {
    const activeChanged = id !== selected;
    const idsChanged = !same(ids, selection);
    const active = activeChange(id, event);
    const batch = idsChange(ids, selection, event);
    unchanged();
    if (activeChanged && !allowed(beforeSelect, active, unchanged, "selection")) return false;
    if (idsChanged && !allowed(beforeSelectionChange, batch, unchanged, "selection")) return false;
    if (!activeChanged && !idsChanged && nextAnchor === anchor) return true;
    selected = id;
    selection = ids;
    anchor = nextAnchor;
    revision++;
    if (!activeChanged && !idsChanged) return true;
    view.changed();
    if (activeChanged) onSelect?.(active);
    if (idsChanged) onSelectionChange?.(batch);
    return true;
  }

  function setSelected(ids: readonly RowId[], event: Event | null = null): void {
    const unchanged = checkpoint("selection");
    changeSelection(selected, checkedIds(ids, "selection"), event, anchor, unchanged);
  }

  function setChecked(ids: readonly RowId[], event: Event | null = null): void {
    const unchanged = checkpoint("check");
    const next = checkedIds(ids, "check");
    const change = idsChange(next, checks, event);
    unchanged();
    if (checkMode === "single" && next.length > 1) {
      fail("CHECK_MODE", "Single check mode accepts at most one checked row.");
    }
    if (same(next, checks)) return;
    if (!allowed(beforeCheckChange, change, unchanged, "check")) return;
    checks = next;
    revision++;
    view.changed();
    onCheckChange?.(change);
  }

  function scopeIds(scope: GridRowScope): readonly RowId[] {
    if (scope === "visible") return view.visible();
    if (scope === "filtered") return view.filtered();
    if (scope === "store") return rows.entries().map(row => row.id);
    return fail("CHECK", `A ${component} check scope must be visible, filtered, or store.`);
  }

  return {
    selected: (): RowId | null => selected,
    selectedIds: (): readonly RowId[] => selection,
    checkedIds: (): readonly RowId[] => checks,
    rowIds(scope: GridRowScope): readonly RowId[] {
      const ids = scopeIds(scope);
      return scope === "store" ? Object.freeze(ids) : ids;
    },
    eligible,
    setSelected,
    setChecked,
    select(id: RowId | null, event: Event | null = null): void {
      const unchanged = checkpoint("selection");
      if (id !== null) checkedIds([id], "selection");
      changeSelection(id, selection, event, anchor, unchanged);
    },
    choose(id: RowId, event: MouseEvent | KeyboardEvent | null, origin?: RowId): boolean {
      const unchanged = checkpoint("selection");
      if (!eligible(id, "selection")) { unchanged(); return false; }
      const toggle = toggleSelection && event && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
      if (!multiple) {
        return changeSelection(toggle && selected === id ? null : id, selection, event, anchor, unchanged);
      }
      let nextId: RowId | null = id;
      let nextAnchor = id;
      let ids: Set<RowId>;
      if (event?.shiftKey) {
        const visible = view.visible();
        const rangeAnchor = anchor !== null && visible.includes(anchor) && eligible(anchor, "selection") ? anchor : origin ?? null;
        const start = rangeAnchor === null || !eligible(rangeAnchor, "selection") ? -1 : visible.indexOf(rangeAnchor);
        const end = visible.indexOf(id);
        const range = start < 0 || end < 0 ? [id]
          : visible.slice(Math.min(start, end), Math.max(start, end) + 1);
        ids = new Set(event.ctrlKey || event.metaKey ? selection : []);
        for (const target of range) if (eligible(target, "selection")) ids.add(target);
        if (start >= 0 && rangeAnchor !== null) nextAnchor = rangeAnchor;
      } else if (event?.ctrlKey || event?.metaKey || toggle) {
        ids = new Set(selection);
        if (!ids.delete(id)) ids.add(id);
        else if (toggle) nextId = null;
      } else ids = new Set([id]);
      return changeSelection(nextId, ordered(ids), event, nextAnchor, unchanged);
    },
    checkAll(checked: boolean, scope: GridRowScope, event: Event | null = null): void {
      if (typeof checked !== "boolean") fail("CHECK", `${component} check-all requires a boolean.`);
      const unchanged = checkpoint("check");
      const ids = new Set(checks);
      let replace = checked && checkMode === "single";
      for (const id of scopeIds(scope)) {
        if (!eligible(id, "check")) continue;
        if (checked) {
          if (replace) { ids.clear(); replace = false; }
          ids.add(id);
        }
        else ids.delete(id);
      }
      unchanged();
      setChecked(ordered(ids), event);
    },
    checkState(scope: GridRowScope): GridCheckState {
      const unchanged = checkpoint("check");
      const targets = new Set(scopeIds(scope).filter(id => eligible(id, "check")));
      const count = checks.filter(id => targets.has(id)).length;
      const total = targets.size;
      unchanged();
      return Object.freeze({ checked: total > 0 && count === total,
        indeterminate: count > 0 && count < total, total, count });
    },
    prune(): (() => void) | undefined {
      if (selected === null && anchor === null && !selection.length && !checks.length) return;
      const unchanged = checkpoint("selection");
      const id = selected !== null && !eligible(selected, "selection") ? null : selected;
      const ids = ordered(new Set(selection.filter(target => eligible(target, "selection"))));
      const nextChecks = ordered(new Set(checks.filter(target => eligible(target, "check"))));
      const nextAnchor = anchor !== null && !eligible(anchor, "selection") ? null : anchor;
      unchanged();
      const activeChanged = id !== selected;
      const idsChanged = !same(ids, selection);
      const checksChanged = !same(nextChecks, checks);
      if (!activeChanged && !idsChanged && !checksChanged && anchor === nextAnchor) return;
      const active = activeChange(id, null);
      const batch = idsChange(ids, selection, null);
      const checkChange = idsChange(nextChecks, checks, null);
      selected = id;
      selection = ids;
      checks = nextChecks;
      anchor = nextAnchor;
      revision++;
      if (!activeChanged && !idsChanged && !checksChanged) return;
      return () => {
        if (activeChanged) onSelect?.(active);
        if (idsChanged) onSelectionChange?.(batch);
        if (checksChanged) onCheckChange?.(checkChange);
      };
    }
  };
}
