// SPDX-License-Identifier: Apache-2.0
import type { RowId } from "../data/index.js";
import { FrameworkError } from "../internal/framework-error.js";

interface ViewportOptions {
  readonly root: HTMLElement;
  readonly estimate: number;
  readonly overscan?: number;
}

function assertOptions(table: HTMLTableElement, options: ViewportOptions): void {
  const document = table.ownerDocument;
  const view = document.defaultView;
  const { root, estimate, overscan = 3 } = options ?? {};
  if (!view || !(root instanceof view.HTMLElement) || root === table ||
      root.ownerDocument !== document || !root.contains(table) ||
      !Number.isFinite(estimate) || estimate <= 0 || !Number.isSafeInteger(overscan) || overscan < 0) {
    throw new FrameworkError({ api: "bindGrid", code: "GRID_VIEWPORT", message: "Viewport needs an ancestor root, a positive estimate and a nonnegative integer overscan." });
  }
}

/** Called before Grid acquires columns or changes authored markup. */
export function validateGridViewport(table: HTMLTableElement, template: HTMLTableRowElement, options: ViewportOptions): void {
  assertOptions(table, options);
  if ([...template.cells].some(cell => cell.rowSpan !== 1)) {
    throw new FrameworkError({ api: "bindGrid", code: "GRID_VIEWPORT_MARKUP", message: "A viewport template cannot span multiple logical rows." });
  }
}

function at(offsets: readonly number[], position: number): number {
  let first = 0;
  let last = offsets.length - 1;
  while (first < last) {
    const middle = (first + last + 1) >>> 1;
    if (offsets[middle] <= position) first = middle;
    else last = middle - 1;
  }
  return Math.min(first, offsets.length - 2);
}

/** Private geometry shared by measured windows and scroll anchoring. */
export function viewportRange(offsets: readonly number[], top: number, height: number, overscan: number): readonly [number, number] {
  const count = offsets.length - 1;
  if (!count) return [0, 0];
  const start = at(offsets, Math.max(0, top));
  const bottom = Math.max(0, top + height);
  let end = at(offsets, bottom);
  if (offsets[end] < bottom || end === start) end++;
  return [Math.max(0, start - overscan), Math.min(count, Math.max(start + 1, end) + overscan)];
}

/** Owns only viewport geometry and placement; Grid owns row bindings and data. */
export function createGridViewport(
  table: HTMLTableElement,
  body: HTMLTableSectionElement,
  anchor: Comment,
  options: ViewportOptions,
  change: () => void
) {
  assertOptions(table, options);
  const { root, estimate, overscan = 3 } = options;
  const document = table.ownerDocument;
  const view = document.defaultView!;
  const originalAnchor = root.style.getPropertyValue("overflow-anchor");
  const originalPriority = root.style.getPropertyPriority("overflow-anchor");
  const hadStyle = root.hasAttribute("style");
  let ids: readonly RowId[] = [];
  let sourceIds: readonly RowId[] | undefined;
  let indices = new Map<RowId, number>();
  const heights = new Map<RowId, number>();
  let offsets = [0];
  let gap = 0;
  let mounted = new Map<RowId, HTMLTableRowElement>();
  let spacers: HTMLTableRowElement[] = [];
  let first: HTMLTableRowElement | undefined;
  let lastOrigin = 0;
  let pending: { id: RowId; within: number } | undefined;
  let revealing: RowId | undefined;
  let expectedScroll: number | undefined;
  let rootWidth = root.getBoundingClientRect().width;
  let tableWidth = table.getBoundingClientRect().width;
  let frame: number | undefined;
  let disposed = false;
  const rowIds = new WeakMap<Element, RowId>();

  function rebuild(): void {
    const style = view!.getComputedStyle(table);
    gap = style.borderCollapse === "separate" ? Number.parseFloat(style.borderSpacing.split(/\s+/u).at(-1)!) || 0 : 0;
    offsets = [0];
    for (const id of ids) offsets.push(offsets.at(-1)! + (heights.get(id) ?? estimate) + gap);
    if (pending) {
      const index = indices.get(pending.id);
      if (index !== undefined) pending = { ...pending, within: Math.min(pending.within, offsets[index + 1] - offsets[index] - 0.01) };
    }
  }

  function origin(): number {
    if (first?.isConnected) {
      lastOrigin = first.getBoundingClientRect().top - root.getBoundingClientRect().top - root.clientTop + root.scrollTop;
    }
    return lastOrigin;
  }

  function occlusion(): number {
    const header = table.tHead;
    if (!header || !root.clientHeight) return 0;
    const bounds = root.getBoundingClientRect();
    const top = bounds.top + root.clientTop;
    const left = bounds.left + root.clientLeft;
    const bands: { top: number; bottom: number; stuck: boolean }[] = [];
    for (const element of [header, ...header.querySelectorAll<HTMLElement>("tr, th, td")]) {
      const style = view.getComputedStyle(element);
      if (style.position !== "sticky" || style.top === "auto") continue;
      const rect = element.getBoundingClientRect();
      if (rect.height <= 0 || rect.right <= left || rect.left >= left + root.clientWidth ||
          rect.bottom <= top || rect.top >= top + root.clientHeight) continue;
      bands.push({ top: rect.top, bottom: rect.bottom, stuck: rect.top <= top + (Number.parseFloat(style.top) || 0) + 1 });
    }
    let edge = top;
    for (const band of bands.sort((left, right) => left.top - right.top)) {
      if (band.stuck || band.top <= edge + 1) edge = Math.max(edge, band.bottom);
    }
    return Math.min(root.clientHeight, edge - top);
  }

  function top(): number {
    if (pending) {
      const index = indices.get(pending.id);
      if (index !== undefined) return offsets[index] + pending.within;
    }
    return root.clientHeight ? root.scrollTop + occlusion() - origin() : 0;
  }

  function capture(): { id: RowId; within: number } | undefined {
    if (pending) return pending;
    if (!ids.length || !root.clientHeight) return;
    const position = top();
    const index = at(offsets, position);
    return { id: ids[index], within: position - offsets[index] };
  }

  function schedule(): void {
    if (disposed || frame !== undefined) return;
    frame = view!.requestAnimationFrame(() => {
      frame = undefined;
      if (!disposed) change();
    });
  }

  function onScroll(): void {
    if (expectedScroll === undefined || Math.abs(root.scrollTop - expectedScroll) > 1) {
      revealing = undefined;
      pending = undefined;
    }
    expectedScroll = undefined;
    schedule();
  }

  function scroll(position: number): void {
    root.scrollTop = position;
    expectedScroll = root.scrollTop;
  }

  function invalidate(): void {
    if (disposed) return;
    const saved = capture();
    heights.clear();
    for (const [id, element] of mounted) {
      const height = element.getBoundingClientRect().height;
      if (height > 0) heights.set(id, height);
    }
    pending = saved;
    rebuild();
    schedule();
  }

  function scrollToRow(id: RowId): void {
    const index = indices.get(id);
    if (disposed || index === undefined) return;
    const position = top();
    const inset = occlusion();
    const height = root.clientHeight ? root.clientHeight - inset : estimate;
    const start = offsets[index];
    const end = offsets[index + 1] - gap;
    let next = position;
    if (start < position && end <= position + height) next = start;
    else if (start >= position && end > position + height) next = end - start > height ? start : end - height;
    if (next === position) return;
    const topIndex = at(offsets, next);
    pending = { id: ids[topIndex], within: next - offsets[topIndex] };
    scroll(origin() + next - inset);
    schedule();
  }

  const observer = new view.ResizeObserver(entries => {
    if (disposed) return;
    const nextRootWidth = root.getBoundingClientRect().width;
    const nextTableWidth = table.getBoundingClientRect().width;
    if (Math.abs(nextRootWidth - rootWidth) > 0.25 || Math.abs(nextTableWidth - tableWidth) > 0.25) invalidate();
    rootWidth = nextRootWidth;
    tableWidth = nextTableWidth;
    const saved = capture();
    let changed = false;
    for (const entry of entries) {
      const id = rowIds.get(entry.target);
      if (id === undefined) continue;
      const height = entry.target.getBoundingClientRect().height;
      if (height > 0 && Math.abs((heights.get(id) ?? estimate) - height) > 0.25) {
        heights.set(id, height);
        changed = true;
      }
    }
    if (changed) {
      pending = saved;
      rebuild();
    }
    if (revealing !== undefined) scrollToRow(revealing);
    schedule();
  });

  function spacer(height: number, columns: number): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.setAttribute("aria-hidden", "true");
    row.setAttribute("data-grid-spacer", "");
    const cell = row.insertCell();
    cell.colSpan = Math.max(1, columns);
    cell.style.cssText = `height:${Math.max(0, height)}px;padding:0;border:0;line-height:0;font-size:0`;
    row.style.cssText = "height:0;overflow-anchor:none";
    return row;
  }

  root.style.setProperty("overflow-anchor", "none");
  root.addEventListener("scroll", onScroll, { passive: true });
  observer.observe(root);
  observer.observe(table);
  // A temporary empty row locates an otherwise empty tbody after captions/headers.
  first = spacer(0, 1);
  anchor.before(first);
  spacers.push(first);

  return {
    set(next: readonly RowId[], preserveAnchor = true): void {
      if (disposed) return;
      if (!preserveAnchor) {
        pending = undefined;
        revealing = undefined;
      }
      if (next === sourceIds) return;
      sourceIds = next;
      if (next.length === ids.length && next.every((id, index) => id === ids[index])) return;
      const saved = preserveAnchor ? capture() : undefined;
      ids = [...next];
      indices = new Map(ids.map((id, index) => [id, index]));
      pending = saved && indices.has(saved.id) ? saved : undefined;
      revealing = undefined;
      rebuild();
    },
    invalidate,
    window(pinned: RowId | null): readonly RowId[] {
      if (disposed) return [];
      const [start, end] = viewportRange(offsets, top(), root.clientHeight ? root.clientHeight - occlusion() : estimate, overscan);
      const result = ids.slice(start, end);
      const pin = pinned === null ? undefined : indices.get(pinned);
      if (pin !== undefined && (pin < start || pin >= end)) result.splice(pin < start ? 0 : result.length, 0, pinned!);
      return result;
    },
    place(records: ReadonlyMap<RowId, HTMLTableRowElement>): void {
      if (disposed) return;
      const savedOrigin = origin();
      const focused = document.activeElement?.closest("tr");
      const row = records.values().next().value;
      const columns = row ? [...row.cells].filter(cell => !cell.hidden).reduce((count, cell) => count + cell.colSpan, 0) : 1;
      const nodes: HTMLTableRowElement[] = [];
      const nextSpacers: HTMLTableRowElement[] = [];
      let previous = 0;
      for (const [id, element] of [...records].sort(([left], [right]) => (indices.get(left) ?? Infinity) - (indices.get(right) ?? Infinity))) {
        const index = indices.get(id);
        if (index === undefined) continue;
        if (index > previous) {
          const padding = spacer(offsets[index] - offsets[previous] - gap, columns);
          nodes.push(padding);
          nextSpacers.push(padding);
        }
        nodes.push(element);
        previous = index + 1;
        rowIds.set(element, id);
        if (mounted.get(id) !== element) observer.observe(element);
      }
      if (previous < ids.length) {
        const padding = spacer(offsets[ids.length] - offsets[previous] - gap, columns);
        nodes.push(padding);
        nextSpacers.push(padding);
      }
      for (const [id, element] of mounted) if (records.get(id) !== element) {
        observer.unobserve(element);
        element.remove();
      }
      for (const element of spacers) element.remove();
      let cursor: Node = anchor;
      for (let index = nodes.length - 1; index >= 0; index--) {
        const element = nodes[index];
        // Keep a focused editor attached throughout viewport changes, including IME composition.
        if (element !== focused && element.nextSibling !== cursor) body.insertBefore(element, cursor);
        cursor = element;
      }
      mounted = new Map(records);
      spacers = nextSpacers;
      first = nodes[0];
      if (pending) {
        const index = indices.get(pending.id);
        if (index !== undefined) scroll(savedOrigin + offsets[index] + pending.within - occlusion());
        pending = undefined;
      }
      if (revealing !== undefined && heights.has(revealing)) revealing = undefined;
      for (const id of heights.keys()) if (!indices.has(id)) heights.delete(id);
    },
    reveal(id: RowId): void {
      revealing = id;
      scrollToRow(id);
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      if (frame !== undefined) view!.cancelAnimationFrame(frame);
      root.removeEventListener("scroll", onScroll);
      observer.disconnect();
      for (const element of spacers) element.remove();
      spacers = [];
      mounted.clear();
      heights.clear();
      indices.clear();
      ids = [];
      sourceIds = undefined;
      offsets = [0];
      pending = undefined;
      revealing = undefined;
      first = undefined;
      if (originalAnchor) root.style.setProperty("overflow-anchor", originalAnchor, originalPriority);
      else root.style.removeProperty("overflow-anchor");
      if (!hadStyle && !root.getAttribute("style")) root.removeAttribute("style");
    }
  };
}
