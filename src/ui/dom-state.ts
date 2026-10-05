// SPDX-License-Identifier: Apache-2.0
let nextId = 0;

export function restoreAttributes(element: Element, names: readonly string[]): () => void {
  const original = names.map(name => [name, element.getAttribute(name)] as const);
  return () => {
    for (const [name, value] of original) {
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
