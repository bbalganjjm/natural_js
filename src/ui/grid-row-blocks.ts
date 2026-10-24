// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { parsePath, readPath } from "./field-path.js";
import { interactiveContent } from "./native-control.js";

function invalid(message: string, code = "GRID_TEMPLATE"): never {
  throw new FrameworkError({ api: "bindGrid", code, message });
}

function property(element: HTMLElement, name: string): () => void {
  const value = element.style.getPropertyValue(name);
  const priority = element.style.getPropertyPriority(name);
  const hadStyle = element.hasAttribute("style");
  return () => {
    if (value) element.style.setProperty(name, value, priority);
    else element.style.removeProperty(name);
    if (!hadStyle && !element.style.length) element.removeAttribute("style");
  };
}

/** Owns authored record structure and temporary native merges, never field state. */
export function compileGridBody(table: HTMLTableElement) {
  const bodies = [...table.tBodies].filter(body => body.hasAttribute("data-row-template"));
  const rows = [...table.tBodies].flatMap(body => [...body.rows].filter(row => row.hasAttribute("data-row-template")));
  if (bodies.length > 1 || bodies.length && rows.length || !bodies.length && rows.length !== 1) {
    invalid("Use one tr[data-row-template] or one tbody[data-row-template].");
  }
  const templates = bodies.length ? [...bodies[0].rows] : rows;
  if (!templates.length) invalid("A template tbody needs at least one tr.");
  const authored = templates.flatMap(row => [row, ...row.querySelectorAll<HTMLElement>("*")]);
  const fixedId = authored.find(element => element.hasAttribute("id"));
  if (fixedId) throw new FrameworkError({ api: "bindGrid", code: "DUPLICATE_ID",
    message: "A repeated row template cannot contain a fixed DOM id.", detail: { id: fixedId.id } });
  const declarations = authored.filter(element => element.hasAttribute("data-merge")).map(element => {
    if (!(element instanceof HTMLTableCellElement) || element.parentElement !== templates[0] ||
        (element.rowSpan || templates.length) !== templates.length ||
        element.matches("[tabindex], [contenteditable], [data-error-for]") ||
        element.querySelector(`${interactiveContent}, [data-error-for], [data-row-action], [data-select-row], [data-check-row]`)) {
      invalid("A merge needs a display-only first-row cell spanning its complete record.", "GRID_MERGE");
    }
    const name = element.getAttribute("data-merge")!;
    const path = parsePath(name);
    if ([element, ...element.querySelectorAll("[data-field]")].some(field => field.hasAttribute("data-field") && field.getAttribute("data-field") !== name)) {
      invalid("A merge cell can display only its merge field.", "GRID_MERGE");
    }
    return { index: authored.indexOf(element), path, name };
  });
  const anchors = templates.map(() => table.ownerDocument.createComment("grid rows"));
  let restorations: (() => void)[] = [];

  function resetMerges(): void {
    for (const restore of restorations) restore();
    restorations = [];
  }

  return {
    templates,
    authored,
    merged: declarations.length > 0,
    validate(): void {
      for (const [index, row] of templates.entries()) {
        if ([...row.cells].some(cell => index + (cell.rowSpan || templates.length - index) > templates.length)) {
          invalid("An authored rowspan cannot escape its logical record.");
        }
      }
    },
    columnCount: [...templates[0].cells].reduce((total, cell) => total + cell.colSpan, 0),
    keys(value: unknown): readonly unknown[] {
      return declarations.map(({ path, name }) => {
        const key = readPath(value, path);
        if (key !== null && (typeof key === "object" || typeof key === "function" || typeof key === "symbol")) {
          invalid(`Merge field ${name} needs a raw scalar or missing value.`, "GRID_MERGE");
        }
        return key;
      });
    },
    clone() {
      const elements = templates.map(template => {
        const row = template.cloneNode(true) as HTMLTableRowElement;
        row.removeAttribute("data-row-template");
        return row;
      });
      const nodes = elements.flatMap(row => [row, ...row.querySelectorAll<HTMLElement>("*")]);
      for (const [index, row] of elements.entries()) {
        for (const cell of row.cells) if (cell.rowSpan === 0) cell.rowSpan = elements.length - index;
      }
      return { elements, nodes, mergeCells: declarations.map(({ index }) => nodes[index] as HTMLTableCellElement) };
    },
    mount(): Comment {
      for (const [index, template] of templates.entries()) template.replaceWith(anchors[index]);
      return anchors.at(-1)!;
    },
    resetMerges,
    merge(groups: readonly { elements: readonly HTMLTableRowElement[]; mergeCells: readonly HTMLTableCellElement[];
      keys: readonly unknown[]; index: number; status?: string }[], focused: Element | null): void {
      resetMerges();
      if (!declarations.length || groups.length < 2) return;
      const runs: { cell: HTMLTableCellElement; followers: HTMLTableCellElement[]; first: number; end: number }[] = [];
      const covered = new Set<HTMLTableRowElement>();
      for (let column = 0; column < declarations.length; column++) {
        let first = 0;
        for (let end = 1; end <= groups.length; end++) {
          const previous = groups[end - 1];
          const next = groups[end];
          const cell = groups[first].mergeCells[column];
          let same = Boolean(next && next.status === previous.status && next.index === previous.index + 1 && !cell.hidden &&
            !previous.mergeCells[column].contains(focused) && !next.mergeCells[column].contains(focused) &&
            (end - first + 1) * templates.length <= 65534);
          for (let key = 0; same && key <= column; key++) same = Object.is(previous.keys[key], next.keys[key]);
          if (same) continue;
          if (end - first > 1) {
            runs.push({ cell, followers: groups.slice(first + 1, end).map(group => group.mergeCells[column]), first, end });
            for (let index = first; index < end; index++) for (const row of groups[index].elements) covered.add(row);
          }
          first = end;
        }
      }
      // Native rowspans otherwise collapse a table whose only column is merged.
      // shortcut: CSS-only font shrink waits for the next Grid update; add a trigger if immediate style-only remeasurement is required.
      const heights = [...covered].map(row => ({ row, height: row.getBoundingClientRect().height }));
      for (const { row, height } of heights) {
        restorations.push(property(row, "height"));
        row.style.setProperty("height", `${height}px`, "important");
      }
      for (const { cell, followers, first, end } of runs) {
        const original = cell.getAttribute("rowspan");
        restorations.push(() => original === null ? cell.removeAttribute("rowspan") : cell.setAttribute("rowspan", original));
        cell.rowSpan = (end - first) * templates.length;
        for (const follower of followers) {
          restorations.push(property(follower, "display"));
          follower.style.setProperty("display", "none", "important");
        }
      }
    },
    restore(): void {
      resetMerges();
      for (const [index, template] of templates.entries()) anchors[index].replaceWith(template);
    }
  };
}
