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
