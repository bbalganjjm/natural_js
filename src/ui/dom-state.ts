// SPDX-License-Identifier: Apache-2.0
let nextId = 0;

export function restoreAttributes(element: Element, names: readonly string[]): () => void {
  const original = names.map(name => [name, element.getAttribute(name)] as const);
  return () => {
    for (const [name, value] of original) {
      // Flush pending CSSOM serialization before restoring an absent style attribute.
      if (name === "style") element.getAttribute(name);
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    }
  };
}

export function uniqueId(document: Document, prefix: string): string {
  let id: string;
  do { id = `${prefix}-${++nextId}`; }
  while (document.getElementById(id));
  return id;
}

/** Shared by Grid row and column transitions; callers choose candidate order. */
export function focusVisible(element: HTMLElement): boolean {
  const document = element.ownerDocument;
  if (!element.isConnected || element.closest("[hidden], [inert]") ||
      element.matches(":disabled") || !element.getClientRects().length ||
      document.defaultView?.getComputedStyle(element).visibility !== "visible") return false;
  try { element.focus({ preventScroll: true }); } catch { return false; }
  return document.activeElement === element;
}

export function containWheel(root: HTMLElement, signal: AbortSignal, verticalOnly = false): void {
  const view = root.ownerDocument.defaultView;
  if (!view) return;
  root.addEventListener("wheel", event => {
    if (event.ctrlKey || event.defaultPrevented) return;
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (verticalOnly && horizontal) return;
    const delta = horizontal ? event.deltaX : event.deltaY;
    if (!delta) return;
    const canMove = (element: HTMLElement) => {
      const position = horizontal ? element.scrollLeft : element.scrollTop;
      const maximum = horizontal ? element.scrollWidth - element.clientWidth : element.scrollHeight - element.clientHeight;
      return delta < 0 ? position > 0 : position < maximum - 1;
    };
    if (canMove(root)) return;
    for (let element = event.target instanceof view.Element ? event.target : null;
      element && element !== root; element = element.parentElement) {
      if (!(element instanceof view.HTMLElement)) continue;
      const style = view.getComputedStyle(element);
      if (["auto", "scroll"].includes(horizontal ? style.overflowX : style.overflowY) && canMove(element)) return;
    }
    event.preventDefault();
  }, { passive: false, signal });
}

const scrollBoundaries = new WeakMap<HTMLElement, { users: number; restore: () => void }>();

function installScrollBoundary(root: HTMLElement): () => void {
  const Controller = root.ownerDocument.defaultView?.AbortController ?? AbortController;
  const lifetime = new Controller();
  const property = "overscroll-behavior-y";
  containWheel(root, lifetime.signal, true);
  if (!root.ownerDocument.defaultView?.CSS.supports(property, "contain")) return () => lifetime.abort();
  const original = root.getAttribute("style");
  const value = root.style.getPropertyValue(property), priority = root.style.getPropertyPriority(property);
  const restore = restoreAttributes(root, ["style"]);
  root.style.setProperty(property, "contain", priority);
  const installed = root.getAttribute("style");
  return () => {
    if (lifetime.signal.aborted) return;
    lifetime.abort();
    if (root.getAttribute("style") === installed) restore();
    else if (root.style.getPropertyValue(property) === "contain" && root.style.getPropertyPriority(property) === priority) {
      if (value) root.style.setProperty(property, value, priority);
      else root.style.removeProperty(property);
      if (original === null && !root.getAttribute("style")) root.removeAttribute("style");
    }
  };
}

export function bindScrollBoundary(root: HTMLElement): () => void {
  let boundary = scrollBoundaries.get(root);
  if (!boundary) {
    boundary = { users: 0, restore: installScrollBoundary(root) };
    scrollBoundaries.set(root, boundary);
  }
  boundary.users++;
  const acquired = boundary;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--acquired.users === 0) {
      scrollBoundaries.delete(root);
      acquired.restore();
    }
  };
}

export function scrollRowWithin(root: HTMLElement, row: HTMLElement, block: ScrollLogicalPosition = "nearest"): void {
  const view = root.ownerDocument.defaultView;
  if (!view || !root.isConnected || !root.contains(row) || !root.clientHeight || !row.getClientRects().length) return;
  const port = root.getBoundingClientRect(), bounds = row.getBoundingClientRect();
  const { clientHeight, scrollTop } = root;
  const portStyle = view.getComputedStyle(root), rowStyle = view.getComputedStyle(row);
  const padding = (value: string) => (Number.parseFloat(value) || 0) * (value.endsWith("%") ? clientHeight / 100 : 1);
  const paddingTop = padding(portStyle.scrollPaddingTop), paddingBottom = padding(portStyle.scrollPaddingBottom);
  const offset = scrollTop - port.top - root.clientTop;
  const start = bounds.top + offset - (Number.parseFloat(rowStyle.scrollMarginTop) || 0);
  const end = bounds.bottom + offset + (Number.parseFloat(rowStyle.scrollMarginBottom) || 0);
  const alignStart = start - paddingTop, alignEnd = end - clientHeight + paddingBottom;
  let next: number;
  if (block === "start") next = alignStart;
  else if (block === "end") next = alignEnd;
  else if (block === "center") next = (alignStart + alignEnd) / 2;
  else {
    const above = alignStart < scrollTop, below = alignEnd > scrollTop;
    if (above === below) return;
    const fits = end - start <= clientHeight - paddingTop - paddingBottom;
    next = above === fits ? alignStart : alignEnd;
  }
  const top = Math.max(0, Math.min(root.scrollHeight - clientHeight, next));
  if (top !== scrollTop) root.scrollTo({ top, behavior: "instant" });
}
