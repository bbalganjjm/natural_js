// SPDX-License-Identifier: Apache-2.0
import type { GridColumn } from "./index.js";
import { FrameworkError } from "../internal/framework-error.js";
import { focusVisible, restoreAttributes } from "./dom-state.js";

interface CellPlan {
  element: HTMLTableCellElement;
  keys: readonly string[];
  grouped: boolean;
  restore: () => void;
}
interface RowPlan {
  row: HTMLTableRowElement;
  children: readonly Node[];
  cells: readonly CellPlan[];
  connected: readonly HTMLTableCellElement[];
}
interface ColPlan {
  element: HTMLTableColElement;
  key: string;
  authoredStyle: string | null;
  restore: () => void;
}
interface GroupPlan {
  element: HTMLTableColElement;
  keys: readonly string[];
  children: readonly Node[];
  cols: readonly ColPlan[];
  restore: () => void;
  authored: boolean;
}

const ownedRows = new WeakSet<HTMLTableRowElement>();
const ownedRoots = new WeakSet<HTMLTableElement>();
const noop = () => {};
const controls = 'button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

function fail(code: "GRID_COLUMNS" | "GRID_COLUMN_MARKUP", message: string, keys: readonly string[] = []): never {
  throw new FrameworkError({ api: "bindGrid", code, message, detail: { keys } });
}
function sameNodes(left: readonly Node[], right: readonly Node[]): boolean {
  return left.length === right.length && left.every((node, index) => node === right[index]);
}

/** Private column owner; field descriptors must be mapped before attach moves cells. */
export function bindGridColumns(
  root: HTMLTableElement,
  template: HTMLTableRowElement,
  initial: readonly GridColumn[] | undefined,
  onChange?: (change: { columns: readonly GridColumn[]; event: Event | null }) => void
) {
  if (onChange !== undefined && typeof onChange !== "function") fail("GRID_COLUMNS", "onColumnsChange must be a function.");
  const managed = initial !== undefined || [...template.cells].some(cell => cell.hasAttribute("data-column"));
  const empty = Object.freeze([]) as readonly GridColumn[];
  if (!managed) {
    return {
      columns: () => empty,
      setColumns(columns: readonly GridColumn[]) {
        if (!Array.isArray(columns) || columns.length) fail("GRID_COLUMNS", "This Grid has no managed columns.");
      },
      attach: (_row: HTMLTableRowElement) => noop,
      dispose: noop
    };
  }
  if (ownedRoots.has(root)) fail("GRID_COLUMNS", "The table already has a column owner.");
  const keys = [...template.cells].map(cell => {
    const key = cell.getAttribute("data-column");
    if (!key || /\s/u.test(key) || cell.hasAttribute("data-columns") || cell.colSpan !== 1) {
      fail("GRID_COLUMN_MARKUP", "Every template cell needs one data-column key and colspan=1.", key ? [key] : []);
    }
    return key;
  });
  if (!keys.length || new Set(keys).size !== keys.length) {
    fail("GRID_COLUMN_MARKUP", "Template column keys must be nonempty and unique.", keys);
  }
  const keySet = new Set(keys);
  function membership(element: Element): string[] {
    const leaf = element.getAttribute("data-column");
    const group = element.getAttribute("data-columns");
    if ((leaf === null) === (group === null)) {
      fail("GRID_COLUMN_MARKUP", "Use either data-column or data-columns on a managed cell.");
    }
    const members = leaf === null ? group!.trim().split(/\s+/u) : [leaf];
    if (members.some(key => !keySet.has(key)) || new Set(members).size !== members.length) {
      fail("GRID_COLUMN_MARKUP", "Column membership needs unique known keys.", members);
    }
    return members;
  }
  function compileRow(row: HTMLTableRowElement): RowPlan {
    const seen = new Set<string>();
    const cells = [...row.cells].map(element => {
      const members = membership(element);
      if (element.hasAttribute("data-column") && element.colSpan !== 1) {
        fail("GRID_COLUMN_MARKUP", "A leaf cell needs colspan=1.", members);
      }
      for (const key of members) {
        if (seen.has(key)) fail("GRID_COLUMN_MARKUP", "A row repeats a column key.", [key]);
        seen.add(key);
      }
      return { element, keys: members, grouped: element.hasAttribute("data-columns"), restore: restoreAttributes(element, ["hidden", "colspan"]) };
    });
    return { row, children: [...row.childNodes], cells, connected: cells.map(cell => cell.element) };
  }
  const rows = new Set<RowPlan>([...root.rows].filter(row => row !== template).map(compileRow));
  const cellGroups = [...rows].flatMap(plan => plan.cells).filter(cell => cell.keys.length > 1);
  function checkSection(section: HTMLTableSectionElement | null): void {
    if (!section) return;
    const sectionRows = [...section.rows];
    const carried = new Map<string, number>();
    for (const [index, row] of sectionRows.entries()) {
      const covered = new Set(carried.keys());
      const next = new Map<string, number>();
      for (const [key, remaining] of carried) if (remaining > 1) next.set(key, remaining - 1);
      for (const cell of row.cells) {
        const members = membership(cell);
        const span = cell.rowSpan === 0 ? sectionRows.length - index : cell.rowSpan;
        if (span > sectionRows.length - index) fail("GRID_COLUMN_MARKUP", "A rowspan extends beyond its authored row group.", members);
        for (const key of members) {
          if (covered.has(key)) fail("GRID_COLUMN_MARKUP", "Header or footer spans overlap a column.", [key]);
          covered.add(key);
          if (span > 1) next.set(key, span - 1);
        }
      }
      if (covered.size !== keys.length) fail("GRID_COLUMN_MARKUP", "Each header and footer row must cover every column, including carried rowspans.", keys.filter(key => !covered.has(key)));
      carried.clear();
      for (const [key, remaining] of next) carried.set(key, remaining);
    }
  }
  checkSection(root.tHead);
  checkSection(root.tFoot);
  for (const plan of rows) {
    if (ownedRows.has(plan.row)) fail("GRID_COLUMNS", "A row already has a column owner.");
  }
  const document = root.ownerDocument;
  const rootChildren = [...root.childNodes];
  const groups: GroupPlan[] = [];
  const assigned = new Set<string>();
  let position = 0;
  const authoredGroups = [...root.children].filter(element => element.tagName === "COLGROUP") as HTMLTableColElement[];
  function take(count: number): string[] {
    const members = keys.slice(position, position + count);
    position += count;
    if (members.length !== count) fail("GRID_COLUMN_MARKUP", "Colgroups exceed the template column count.", members);
    return members;
  }
  function recordCol(element: HTMLTableColElement, key: string): ColPlan {
    if (!keySet.has(key) || assigned.has(key)) fail("GRID_COLUMN_MARKUP", "Colgroups repeat or reference an unknown column.", [key]);
    assigned.add(key);
    return { element, key, authoredStyle: element.getAttribute("style"), restore: restoreAttributes(element, ["span", "hidden", "style"]) };
  }
  for (const element of authoredGroups) {
    const authoredCols = [...element.children].filter(child => child.tagName === "COL") as HTMLTableColElement[];
    const count = authoredCols.length ? authoredCols.reduce((total, col) => total + col.span, 0) : element.span;
    const declared = element.hasAttribute("data-columns") || element.hasAttribute("data-column") ? membership(element) : undefined;
    const members = declared ?? take(count);
    if (members.length !== count) fail("GRID_COLUMN_MARKUP", "Colgroup membership must match its authored span.", members);
    if (declared) position += count;
    let offset = 0;
    const cols: ColPlan[] = [];
    if (!authoredCols.length) {
      for (const key of members) cols.push(recordCol(document.createElement("col"), key));
    } else {
      for (const col of authoredCols) {
        const colMembers = col.hasAttribute("data-column") || col.hasAttribute("data-columns") ? membership(col) : members.slice(offset, offset + col.span);
        if (colMembers.length !== col.span || colMembers.some(key => !members.includes(key))) {
          fail("GRID_COLUMN_MARKUP", "A col membership must match its span and colgroup.", colMembers);
        }
        offset += col.span;
        colMembers.forEach((key, index) => {
          const leaf = index === 0 ? col : document.createElement("col");
          if (index !== 0 && col.hasAttribute("style")) leaf.setAttribute("style", col.getAttribute("style")!);
          cols.push(recordCol(leaf, key));
        });
      }
    }
    groups.push({ element, keys: cols.map(col => col.key), children: [...element.childNodes], cols,
      restore: restoreAttributes(element, ["span", "hidden", "style"]), authored: true });
  }
  for (const key of keys.filter(key => !assigned.has(key))) {
    const element = document.createElement("colgroup");
    groups.push({ element, keys: [key], children: [], cols: [recordCol(document.createElement("col"), key)],
      restore: restoreAttributes(element, ["span", "hidden", "style"]), authored: false });
  }
  for (const plan of rows) {
    for (const cell of plan.cells) {
      if (cell.element.scope !== "colgroup") continue;
      if (!groups.some(group => group.authored && group.keys.length === cell.keys.length &&
          group.keys.every(key => cell.keys.includes(key)))) {
        fail("GRID_COLUMN_MARKUP", "A scope=colgroup cell needs an authored colgroup with exactly the same column membership.", cell.keys);
      }
    }
  }
  const resizeKeys = new Map<HTMLButtonElement, string>();
  const resizeRestorers: (() => void)[] = [];
  for (const element of root.tHead?.querySelectorAll<HTMLElement>("[data-resize-column]") ?? []) {
    const key = element.getAttribute("data-resize-column")!;
    if (!(element instanceof HTMLButtonElement) || element.type !== "button" || !element.getAttribute("aria-label")?.trim() ||
        !keySet.has(key) || element.closest("th")?.getAttribute("data-column") !== key) {
      fail("GRID_COLUMN_MARKUP", "A resize control needs type=button, an aria-label and a known column key.", [key]);
    }
    resizeKeys.set(element, key);
    resizeRestorers.push(restoreAttributes(element, ["style", "aria-keyshortcuts"]));
  }
  function checkContinuity(members: readonly string[], order: Map<string, number>): void {
    const indexes = members.map(key => order.get(key)!).sort((a, b) => a - b);
    if (indexes.some((index, offset) => index !== indexes[0] + offset)) {
      fail("GRID_COLUMNS", "Grouped columns must remain consecutive.", members);
    }
  }
  function checked(input: readonly GridColumn[]): readonly GridColumn[] {
    if (!Array.isArray(input) || input.length !== keys.length) fail("GRID_COLUMNS", "Provide every column exactly once.", keys);
    const seen = new Set<string>();
    const next = Array.from(input, column => {
      if (!column || !keySet.has(column.key) || seen.has(column.key) ||
          column.width !== undefined && (typeof column.width !== "number" || !Number.isFinite(column.width) || column.width <= 0) ||
          column.hidden !== undefined && typeof column.hidden !== "boolean") {
        fail("GRID_COLUMNS", "Column state needs unique known keys, positive finite widths and boolean hidden values.", column?.key ? [column.key] : []);
      }
      seen.add(column.key);
      return Object.freeze({ key: column.key, ...(column.width === undefined ? {} : { width: column.width }),
        ...(column.hidden === undefined ? {} : { hidden: column.hidden }) });
    });
    if (next.every(column => column.hidden === true)) fail("GRID_COLUMNS", "At least one column must remain visible.", keys);
    const order = new Map(next.map((column, index) => [column.key, index]));
    for (const cell of cellGroups) checkContinuity(cell.keys, order);
    for (const group of groups) checkContinuity(group.keys, order);
    return Object.freeze(next);
  }
  let state = checked(initial === undefined ? keys.map(key => ({ key })) : initial);
  const originalState = state;
  const restoreRootStyle = restoreAttributes(root, ["style"]);
  const originalWidth = root.style.width;
  const originalTabindex = root.getAttribute("tabindex");
  let fallbackTabindex = false;
  const anchor = document.createComment("grid columns");
  let disposed = false;
  let applied: readonly GridColumn[] | undefined;
  const columnPlans = new Map(groups.flatMap(group => group.cols.map(col => [col.key, col] as const)));
  let drag: { button: HTMLButtonElement; key: string; pointer: number; start: number; width: number;
    prior: readonly GridColumn[]; pending: number; frame?: number } | undefined;

  function focus(element: HTMLElement): boolean {
    try { element.focus({ preventScroll: true }); } catch { return false; }
    return document.activeElement === element;
  }
  function focusAvailable(elements: Iterable<HTMLElement>): boolean {
    for (const element of elements) if (focusVisible(element)) return true;
    return false;
  }
  function applyRow(plan: RowPlan, order: Map<string, number>, values: Map<string, GridColumn>): void {
    const cells = [...plan.cells].sort((left, right) => Math.min(...left.keys.map(key => order.get(key)!)) - Math.min(...right.keys.map(key => order.get(key)!)));
    const visible: HTMLTableCellElement[] = [];
    for (const cell of cells) {
      const count = cell.keys.filter(key => !values.get(key)!.hidden).length;
      cell.element.hidden = count === 0;
      if (cell.grouped) cell.element.colSpan = Math.max(1, count);
      if (count) visible.push(cell.element);
      else cell.element.remove();
    }
    if (!sameNodes(plan.connected, visible)) {
      const fragment = document.createDocumentFragment();
      for (const cell of visible) fragment.append(cell);
      plan.row.append(fragment);
      plan.connected = visible;
    }
  }
  function applyWidths(next: readonly GridColumn[], previous: readonly GridColumn[] | undefined): void {
    const prior = previous && new Map(previous.map(column => [column.key, column.width]));
    for (const column of next) {
      if (prior && prior.get(column.key) === column.width) continue;
      const col = columnPlans.get(column.key)!;
      if (col.authoredStyle === null) col.element.removeAttribute("style");
      else col.element.setAttribute("style", col.authoredStyle);
      if (column.width !== undefined) col.element.style.width = column.width + "px";
    }
    const visible = next.filter(column => !column.hidden);
    const width = visible.every(column => column.width !== undefined)
      ? visible.reduce((sum, column) => sum + column.width!, 0) + "px" : originalWidth;
    if (root.style.width !== width) root.style.width = width;
  }
  function apply(next: readonly GridColumn[]): void {
    const previous = applied;
    const topologyMatches = previous?.every((column, index) => column.key === next[index].key &&
      Boolean(column.hidden) === Boolean(next[index].hidden));
    // A failed mutation must rebuild topology during rollback rather than trust a partial DOM.
    applied = undefined;
    if (topologyMatches) {
      applyWidths(next, previous);
      applied = next;
      return;
    }
    const order = new Map(next.map((column, index) => [column.key, index]));
    const values = new Map(next.map(column => [column.key, column]));
    const focused = document.activeElement instanceof HTMLElement && root.contains(document.activeElement) ? document.activeElement : null;
    const activePlan = focused ? [...rows].find(plan => plan.cells.some(cell => cell.element.contains(focused))) : undefined;
    const activeCell = activePlan?.cells.find(cell => cell.element.contains(focused));
    const caret = focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement
      ? [focused.selectionStart, focused.selectionEnd, focused.selectionDirection] as const : null;
    const scroll = [root.scrollLeft, root.scrollTop];
    for (const plan of rows) applyRow(plan, order, values);
    const visibleGroups = [...groups].sort((a, b) => Math.min(...a.keys.map(key => order.get(key)!)) - Math.min(...b.keys.map(key => order.get(key)!)));
    const fragment = document.createDocumentFragment();
    for (const group of visibleGroups) {
      group.element.removeAttribute("span");
      const cols = [...group.cols].sort((a, b) => order.get(a.key)! - order.get(b.key)!);
      const visible = cols.filter(col => !values.get(col.key)!.hidden);
      for (const col of cols) {
        const column = values.get(col.key)!;
        col.element.removeAttribute("span");
        col.element.hidden = column.hidden === true;
        if (column.hidden) col.element.remove();
      }
      group.element.hidden = visible.length === 0;
      if (visible.length) {
        const colFragment = document.createDocumentFragment();
        for (const col of visible) colFragment.append(col.element);
        group.element.append(colFragment);
        fragment.append(group.element);
      } else group.element.remove();
    }
    anchor.before(fragment);
    applyWidths(next, previous);
    if (focused && activeCell && !activeCell.keys.some(key => !values.get(key)!.hidden)) {
      const targetIndex = Math.min(...activeCell.keys.map(key => order.get(key)!));
      const candidates = [...activePlan!.cells].filter(cell => cell.element.isConnected && !cell.element.hidden)
        .sort((a, b) => Math.abs(Math.min(...a.keys.map(key => order.get(key)!)) - targetIndex) - Math.abs(Math.min(...b.keys.map(key => order.get(key)!)) - targetIndex));
      const rowControls = candidates.flatMap(cell => [...cell.element.querySelectorAll<HTMLElement>(controls)]);
      if (!focusAvailable(rowControls) && !focusAvailable(root.tHead?.querySelectorAll<HTMLElement>(controls) ?? [])) {
        if (!root.hasAttribute("tabindex")) { root.tabIndex = -1; fallbackTabindex = true; }
        focus(root);
      }
    } else if (focused?.isConnected && document.activeElement !== focused) {
      focus(focused);
      if (caret && caret[0] !== null && caret[1] !== null && (focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement)) {
        try { focused.setSelectionRange(caret[0], caret[1], caret[2] ?? undefined); } catch { /* Some native inputs have no text selection. */ }
      }
    }
    root.scrollLeft = scroll[0]; root.scrollTop = scroll[1];
    applied = next;
  }
  function active(): void { if (disposed) fail("GRID_COLUMNS", "The column owner has been disposed."); }
  function commit(next: readonly GridColumn[], event: Event | null): void {
    const prior = state;
    if (prior.every((column, index) => column.key === next[index].key && column.width === next[index].width &&
        Boolean(column.hidden) === Boolean(next[index].hidden))) { state = next; return; }
    try { apply(next); } catch (cause) { apply(prior); throw cause; }
    state = next;
    onChange?.({ columns: state, event });
  }
  function withWidth(prior: readonly GridColumn[], key: string, width: number | undefined): readonly GridColumn[] {
    return checked(prior.map(column => column.key !== key ? column : {
      key: column.key, ...(column.hidden === undefined ? {} : { hidden: column.hidden }), ...(width === undefined ? {} : { width })
    }));
  }
  function measured(key: string): number {
    const column = state.find(column => column.key === key)!;
    if (column.width !== undefined) return column.width;
    const cell = [...rows].flatMap(plan => plan.cells).find(cell => cell.keys.length === 1 && cell.keys[0] === key && cell.element.isConnected);
    return Math.max(1, cell?.element.getBoundingClientRect().width ?? 1);
  }
  function releaseDrag(): typeof drag {
    const current = drag;
    drag = undefined;
    if (current?.frame !== undefined) document.defaultView?.cancelAnimationFrame(current.frame);
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerCancel);
    document.removeEventListener("keydown", onEscape);
    current?.button.removeEventListener("lostpointercapture", onPointerCancel);
    if (current) {
      try { if (current.button.hasPointerCapture(current.pointer)) current.button.releasePointerCapture(current.pointer); } catch { /* Capture can already be released. */ }
    }
    return current;
  }
  function cancelDrag(): void {
    const current = releaseDrag();
    if (current && !disposed) apply(current.prior);
  }
  function onPointerCancel(event: PointerEvent): void {
    if (drag && event.pointerId === drag.pointer) cancelDrag();
  }
  function onEscape(event: KeyboardEvent): void {
    if (event.key === "Escape" && drag) { event.preventDefault(); cancelDrag(); }
  }
  function onPointerMove(event: PointerEvent): void {
    const current = drag;
    if (!current || event.pointerId !== current.pointer) return;
    current.pending = Math.max(1, current.width + event.clientX - current.start);
    if (current.frame === undefined) {
      current.frame = document.defaultView!.requestAnimationFrame(() => {
        if (drag !== current) return;
        current.frame = undefined;
        apply(withWidth(current.prior, current.key, current.pending));
      });
    }
    event.preventDefault();
  }
  function onPointerUp(event: PointerEvent): void {
    if (!drag || event.pointerId !== drag.pointer) return;
    const current = releaseDrag()!;
    const width = Math.max(1, current.width + event.clientX - current.start);
    if (width === current.width) { apply(current.prior); return; }
    commit(withWidth(current.prior, current.key, width), event);
  }
  function onPointerDown(event: PointerEvent): void {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-resize-column]") : null;
    const key = button && resizeKeys.get(button);
    if (!button || !key || button.disabled || event.button !== 0 || !event.isPrimary) return;
    cancelDrag();
    drag = { button, key, pointer: event.pointerId, start: event.clientX, width: measured(key), prior: state, pending: measured(key) };
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
    document.addEventListener("keydown", onEscape);
    button.addEventListener("lostpointercapture", onPointerCancel);
    try { button.setPointerCapture(event.pointerId); } catch { /* Delegated document listeners also support uncaptured synthetic events. */ }
    focus(button);
    event.preventDefault();
  }
  function onKeyDown(event: KeyboardEvent): void {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-resize-column]") : null;
    const key = button && resizeKeys.get(button);
    if (!button || !key || button.disabled || !["ArrowLeft", "ArrowRight", "Home"].includes(event.key)) return;
    event.preventDefault();
    cancelDrag();
    const width = event.key === "Home" ? originalState.find(column => column.key === key)!.width
      : Math.max(1, measured(key) + (event.key === "ArrowLeft" ? -1 : 1) * (event.shiftKey ? 1 : 10));
    commit(withWidth(state, key, width), event);
  }
  function restoreRow(plan: RowPlan): void {
    for (const cell of plan.cells) cell.restore();
    plan.row.replaceChildren(...plan.children);
    ownedRows.delete(plan.row);
  }
  function restoreAll(): void {
    for (const plan of rows) restoreRow(plan);
    for (const group of groups) {
      for (const col of group.cols) col.restore();
      group.element.replaceChildren(...group.children);
      group.restore();
      group.element.remove();
    }
    for (let index = rootChildren.length - 1; index >= 0; index--) {
      const node = rootChildren[index];
      if (!groups.some(group => group.authored && group.element === node)) continue;
      const next = rootChildren.slice(index + 1).find(sibling => sibling.parentNode === root) ?? null;
      root.insertBefore(node, next);
    }
    anchor.remove();
    restoreRootStyle();
    for (const restoreControl of resizeRestorers) restoreControl();
    if (fallbackTabindex) {
      if (originalTabindex === null) root.removeAttribute("tabindex");
      else root.setAttribute("tabindex", originalTabindex);
    }
    ownedRoots.delete(root);
  }
  root.insertBefore(anchor, authoredGroups[0] ?? root.tHead ?? root.tBodies[0] ?? root.tFoot);
  try {
    apply(state);
    for (const button of resizeKeys.keys()) {
      button.style.touchAction = "none";
      button.style.userSelect = "none";
      if (!button.hasAttribute("aria-keyshortcuts")) button.setAttribute("aria-keyshortcuts", "ArrowLeft ArrowRight Home Shift+ArrowLeft Shift+ArrowRight");
    }
    ownedRoots.add(root);
    for (const plan of rows) ownedRows.add(plan.row);
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("keydown", onKeyDown);
  } catch (cause) { restoreAll(); throw cause; }
  return {
    columns(): readonly GridColumn[] { active(); return state; },
    setColumns(input: readonly GridColumn[]): void {
      active();
      const next = checked(input);
      cancelDrag();
      commit(next, null);
    },
    attach(row: HTMLTableRowElement): () => void {
      active();
      if (row === template || ownedRows.has(row)) fail("GRID_COLUMNS", "A row already has a column owner or is the authored template.");
      const plan = compileRow(row);
      if (plan.cells.length !== keys.length || plan.cells.some(cell => cell.keys.length !== 1) || plan.cells.some((cell, index) => cell.keys[0] !== keys[index])) {
        fail("GRID_COLUMN_MARKUP", "A repeated row must retain the original template column order.", plan.cells.flatMap(cell => cell.keys));
      }
      rows.add(plan);
      ownedRows.add(row);
      try {
        applyRow(plan, new Map(state.map((column, index) => [column.key, index])), new Map(state.map(column => [column.key, column])));
      } catch (cause) { rows.delete(plan); restoreRow(plan); throw cause; }
      let released = false;
      return () => {
        if (released) return;
        released = true;
        rows.delete(plan);
        restoreRow(plan);
      };
    },
    dispose(): void {
      if (disposed) return;
      cancelDrag();
      disposed = true;
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("keydown", onKeyDown);
      restoreAll();
      rows.clear();
    }
  };
}
