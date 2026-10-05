// SPDX-License-Identifier: Apache-2.0
import type { RowId, RowSnapshot, Rows, Snapshot } from "../data/index.js";
import { FrameworkError } from "../internal/framework-error.js";
import { restoreAttributes, uniqueId } from "./dom-state.js";
import { parsePath, readPath } from "./field-path.js";
import { createRuleRunner } from "./rules.js";
import type { RuleCall } from "./rules.js";
import type { FormatRule, RuleSet } from "./index.js";

export interface TreeHandle {
  select(id: RowId | null): void;
  selected(): RowId | null;
  setExpanded(id: RowId, expanded: boolean): void;
  expanded(): readonly RowId[];
  dispose(): void;
}

interface Field {
  readonly index: number;
  readonly name: string;
  readonly path: readonly string[];
  readonly format: readonly RuleCall<FormatRule>[];
}

interface Node<T> {
  readonly row: RowSnapshot<T>;
  parent: RowId | null;
  readonly children: RowId[];
  level: number;
  position: number;
  siblings: number;
}

interface RecordNode<T> {
  readonly element: HTMLLIElement;
  readonly label: HTMLElement;
  readonly group: HTMLUListElement | HTMLOListElement;
  readonly toggle?: HTMLButtonElement;
  readonly fields: HTMLElement[];
  values: unknown[];
  childIds: RowId[];
  snapshot?: RowSnapshot<T>;
}

const boundRoots = new WeakSet<HTMLUListElement | HTMLOListElement>();

function treeError(code: string, message: string, detail?: Record<string, unknown>): FrameworkError {
  return new FrameworkError({ api: "bindTree", code, message, detail });
}

function sameIds(left: readonly RowId[], right: readonly RowId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function isKey(value: unknown): value is string | number {
  return (typeof value === "string" && value.length > 0) ||
    (typeof value === "number" && Number.isFinite(value));
}

export function bindTree<T extends object>(root: HTMLUListElement | HTMLOListElement, options: {
  rows: Rows<T>;
  key: (row: Snapshot<T>) => string | number;
  parent: (row: Snapshot<T>) => string | number | null;
  rules?: RuleSet;
  onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void;
}): TreeHandle {
  if (!(root instanceof HTMLUListElement || root instanceof HTMLOListElement) || !root.isConnected) {
    throw treeError("TREE_ROOT", "The Tree needs a connected ul or ol element.");
  }
  if (boundRoots.has(root)) throw treeError("TREE_IN_USE", "This Tree root is already bound.");
  if (!options || typeof options.rows?.entries !== "function" || typeof options.rows?.subscribe !== "function" ||
      typeof options.key !== "function" || typeof options.parent !== "function" ||
      (options.onSelect !== undefined && typeof options.onSelect !== "function")) {
    throw treeError("TREE_OPTIONS", "The Tree needs Rows and key and parent functions.");
  }
  if (root.hasAttribute("role") && root.getAttribute("role") !== "tree") {
    throw treeError("TREE_ROOT", "The Tree root cannot have a different role.");
  }
  if ((root.hasAttribute("aria-multiselectable") && root.getAttribute("aria-multiselectable") !== "false") ||
      (root.hasAttribute("aria-orientation") && root.getAttribute("aria-orientation") !== "vertical")) {
    throw treeError("TREE_ROOT", "The Tree supports vertical navigation and single selection.");
  }
  const document = root.ownerDocument;
  const labelIds = root.getAttribute("aria-label")?.trim() ? [] :
    (root.getAttribute("aria-labelledby") ?? "").trim().split(/\s+/).filter(Boolean);
  if (!root.getAttribute("aria-label")?.trim() && !labelIds.length) {
    throw treeError("TREE_NAME", "The Tree needs aria-label or aria-labelledby.");
  }
  const labels = new Map(labelIds.map(id => [id, 0]));
  const authoredIds = new Set<string>();
  for (const element of [root, ...root.querySelectorAll<HTMLElement>("[id]")]) {
    if (!element.id) continue;
    if (authoredIds.has(element.id)) throw treeError("DUPLICATE_ID", "The Tree repeats a DOM id.", { id: element.id });
    authoredIds.add(element.id);
  }
  for (const element of document.querySelectorAll<HTMLElement>("[id]")) {
    if (!root.contains(element) && authoredIds.has(element.id)) {
      throw treeError("DUPLICATE_ID", "A Tree DOM id already exists in the document.", { id: element.id });
    }
    if (labels.has(element.id)) labels.set(element.id, labels.get(element.id)! + 1);
  }
  if (new Set(labelIds).size !== labelIds.length || labelIds.some(id => labels.get(id) !== 1)) {
    throw treeError("TREE_NAME", "Tree aria-labelledby needs distinct existing DOM ids.");
  }
  const templates = [...root.querySelectorAll<HTMLLIElement>("li[data-row-template]")];
  if (templates.length !== 1 || templates[0].parentElement !== root) {
    throw treeError("TREE_TEMPLATE", "The Tree needs one direct li marked data-row-template.");
  }
  const template = templates[0];
  const fixedId = template.hasAttribute("id") ? template : template.querySelector<HTMLElement>("[id]");
  if (fixedId) {
    throw treeError("DUPLICATE_ID", "A repeated Tree template cannot contain a fixed DOM id.", { id: fixedId.id });
  }
  const authored = [template, ...template.querySelectorAll<HTMLElement>("*")];
  const labelElements = [...template.querySelectorAll<HTMLElement>("[data-tree-label]")];
  const groups = [...template.querySelectorAll<HTMLElement>("[data-tree-children]")];
  const toggles = [...template.querySelectorAll<HTMLElement>("[data-tree-toggle]")];
  if (labelElements.length !== 1 || groups.length !== 1 || groups[0].parentElement !== template ||
      !["UL", "OL"].includes(groups[0].tagName) || groups[0].children.length || groups[0].textContent?.trim() ||
      groups[0].contains(labelElements[0]) || labelElements[0].contains(groups[0]) || toggles.length > 1 ||
      (toggles[0] && (!(toggles[0] instanceof HTMLButtonElement) || toggles[0].type !== "button" ||
        !toggles[0].getAttribute("aria-label")?.trim() || groups[0].contains(toggles[0])))) {
    throw treeError("TREE_TEMPLATE", "Each Tree node needs one label and one direct empty ul or ol data-tree-children; an optional toggle must be a named type=button button.");
  }
  if (labelElements[0].hidden || labelElements[0].closest('[aria-hidden="true"]')) {
    throw treeError("TREE_TEMPLATE", "The Tree label must be available to assistive technology.");
  }
  const interactive = template.querySelectorAll<HTMLElement>(
    'a[href], area[href], button, input, select, textarea, summary, iframe, audio[controls], video[controls], [tabindex], [contenteditable]:not([contenteditable="false"])'
  );
  if ([...interactive].some(element => element !== toggles[0])) {
    throw treeError("TREE_CONTROL", "Tree nodes accept only their optional toggle as an interactive control.");
  }
  const empties = [...root.children].filter(element => element.matches("li[data-empty]")) as HTMLLIElement[];
  if (empties.length > 1 || [...root.children].some(element => element !== template && element !== empties[0])) {
    throw treeError("TREE_TEMPLATE", "The Tree accepts its node template and at most one li data-empty.");
  }
  const empty = empties[0];
  const emptyHidden = empty?.hidden;
  const restoreEmpty = empty ? restoreAttributes(empty, ["role"]) : () => {};
  const runner = createRuleRunner("bindTree", options.rules);
  const fields: Field[] = [];
  for (const [index, element] of authored.entries()) {
    const name = element.getAttribute("data-field");
    if (name === null) continue;
    if (element === template || element === groups[0] || element === toggles[0] || element.children.length) {
      throw treeError("TREE_FIELD", "A Tree data-field must be a text-only descendant.", { field: name });
    }
    if (element.hasAttribute("data-validate")) {
      throw treeError("TREE_FIELD", "Tree is read-only; validate edited values with Form.", { field: name });
    }
    fields.push({ index, name, path: parsePath(name), format: runner.formats(element, name) });
  }
  const labelIndex = authored.indexOf(labelElements[0]);
  const groupIndex = authored.indexOf(groups[0]);
  const toggleIndex = toggles[0] ? authored.indexOf(toggles[0]) : -1;
  const records = new Map<RowId, RecordNode<T>>();
  const ids = new WeakMap<HTMLLIElement, RowId>();
  const expanded = new Set<RowId>();
  let nodes = new Map<RowId, Node<T>>();
  let rootIds: RowId[] = [];
  let visible: RowId[] = [];
  let selected: RowId | null = null;
  let focused: RowId | null = null;
  let disposed = false;
  let prefix = "";
  let lastTyped = 0;
  const anchor = document.createComment("tree nodes");
  const restoreRoot = restoreAttributes(root, ["role", "tabindex", "aria-multiselectable", "aria-orientation"]);
  const rootModes = new Map(["aria-multiselectable", "aria-orientation"]
    .map(name => [name, root.getAttribute(name)] as const));
  const eventRoot: HTMLElement = root;

  function active(): void {
    if (disposed) throw treeError("TREE_DISPOSED", "This Tree has been disposed.");
  }

  function requireNode(id: RowId): Node<T> {
    const node = nodes.get(id);
    if (!node) throw treeError("TREE_ROW", "The row ID is not available in this Tree.", { id });
    return node;
  }

  function hierarchy(): { nodes: Map<RowId, Node<T>>; roots: RowId[] } {
    const next = new Map<RowId, Node<T>>();
    const keys = new Map<string | number, RowId>();
    const parents = new Map<RowId, string | number | null>();
    for (const row of options.rows.entries()) {
      const key = options.key(row.value);
      const parent = options.parent(row.value);
      if (!isKey(key) || (parent !== null && !isKey(parent))) {
        throw treeError("TREE_KEY", "Tree keys must be nonempty strings or finite numbers; a root parent must be null.", { rowId: row.id });
      }
      if (keys.has(key)) throw treeError("TREE_KEY", "Tree node keys must be unique.", { rowId: row.id, key });
      keys.set(key, row.id);
      parents.set(row.id, parent);
      next.set(row.id, { row, parent: null, children: [], level: 0, position: 1, siblings: 1 });
    }
    const roots: RowId[] = [];
    for (const [id, node] of next) {
      const key = parents.get(id)!;
      if (key === null) roots.push(id);
      else {
        const parent = keys.get(key);
        if (parent === undefined) throw treeError("TREE_PARENT", "A Tree parent key is missing.", { rowId: id, key });
        node.parent = parent;
        next.get(parent)!.children.push(id);
      }
    }
    let visited = 0;
    const pending = [{ siblings: roots, level: 1 }];
    while (pending.length) {
      const group = pending.pop()!;
      for (const [index, id] of group.siblings.entries()) {
        const node = next.get(id)!;
        visited++;
        node.level = group.level;
        node.position = index + 1;
        node.siblings = group.siblings.length;
        if (node.children.length) pending.push({ siblings: node.children, level: group.level + 1 });
      }
    }
    // With one resolved parent per node, any unreachable node belongs to a rootless cycle.
    if (visited !== next.size) {
      const unreachable = [...next.values()].find(node => node.level === 0)!;
      throw treeError("TREE_CYCLE", "Tree parent keys cannot form a cycle.", { rowId: unreachable.row.id });
    }
    return { nodes: next, roots };
  }

  function createRecord(id: RowId): RecordNode<T> {
    const element = template.cloneNode(true) as HTMLLIElement;
    element.removeAttribute("data-row-template");
    element.setAttribute("role", "treeitem");
    const elements = [element, ...element.querySelectorAll<HTMLElement>("*")];
    const label = elements[labelIndex];
    label.id = uniqueId(document, "njs-tree-label");
    element.setAttribute("aria-labelledby", label.id);
    const group = elements[groupIndex] as HTMLUListElement | HTMLOListElement;
    group.setAttribute("role", "group");
    const toggle = toggleIndex < 0 ? undefined : elements[toggleIndex] as HTMLButtonElement;
    if (toggle) toggle.tabIndex = -1;
    ids.set(element, id);
    return { element, label, group, toggle, fields: fields.map(field => elements[field.index]),
      values: [], childIds: [] };
  }

  function updateVisibility(): void {
    const next: RowId[] = [];
    const pending = [...rootIds].reverse();
    while (pending.length) {
      const id = pending.pop()!;
      next.push(id);
      if (expanded.has(id)) {
        const children = nodes.get(id)!.children;
        for (let index = children.length - 1; index >= 0; index--) pending.push(children[index]);
      }
    }
    visible = next;
    if (focused === null || !visible.includes(focused)) focused = visible[0] ?? null;
    root.setAttribute("role", visible.length ? "tree" : "group");
    for (const [name, value] of rootModes) {
      if (!visible.length || value === null) root.removeAttribute(name);
      else root.setAttribute(name, value);
    }
    root.tabIndex = visible.length ? -1 : 0;
    for (const [id, node] of nodes) {
      const record = records.get(id)!;
      const branch = node.children.length > 0;
      const open = branch && expanded.has(id);
      if (branch) record.element.setAttribute("aria-expanded", String(open));
      else record.element.removeAttribute("aria-expanded");
      record.element.setAttribute("aria-selected", String(id === selected));
      record.element.tabIndex = id === focused ? 0 : -1;
      record.group.hidden = !open;
      if (record.toggle) {
        record.toggle.hidden = !branch;
        if (branch) record.toggle.setAttribute("aria-expanded", String(open));
        else record.toggle.removeAttribute("aria-expanded");
      }
    }
    if (empty) empty.hidden = visible.length > 0;
  }

  function moveFocus(id: RowId, focus = true): void {
    if (focused !== null) records.get(focused)?.element.setAttribute("tabindex", "-1");
    focused = id;
    const element = records.get(id)!.element;
    element.tabIndex = 0;
    if (focus) element.focus({ preventScroll: true });
  }

  function render(): void {
    if (disposed) return;
    const next = hierarchy();
    const prepared: Array<{ id: RowId; record: RecordNode<T>; values: unknown[]; texts: Map<number, string> }> = [];
    // Evaluate every changed formatter before altering the live tree.
    for (const [id, node] of next.nodes) {
      const record = records.get(id) ?? createRecord(id);
      if (record.snapshot === node.row) continue;
      const values: unknown[] = [];
      const texts = new Map<number, string>();
      for (const [index, field] of fields.entries()) {
        const value = readPath(node.row.value, field.path);
        values.push(value);
        if (!record.snapshot || !Object.is(record.values[index], value)) {
          const text = field.format.length ? runner.format(field.format, value, {
            field: field.name, values: node.row.value as Snapshot<Record<string, unknown>>,
            rowId: id, element: record.fields[index]
          }) : String(value ?? "");
          texts.set(index, text);
        }
      }
      prepared.push({ id, record, values, texts });
    }
    const activeElement = document.activeElement;
    const hadFocus = activeElement instanceof HTMLElement && root.contains(activeElement);
    let fallback = focused;
    while (fallback !== null && !next.nodes.has(fallback)) fallback = nodes.get(fallback)?.parent ?? null;
    let revealSelected = false;
    let ancestor = selected;
    while (ancestor !== null && next.nodes.has(ancestor)) {
      const parent = next.nodes.get(ancestor)!.parent;
      if (parent !== nodes.get(ancestor)?.parent) revealSelected = true;
      ancestor = parent;
    }
    // Detach moved nodes first: valid reparenting may reverse old DOM ancestry.
    for (const [id, record] of records) {
      if (next.nodes.has(id) && nodes.get(id)?.parent !== next.nodes.get(id)!.parent) record.element.remove();
    }
    for (const [id, record] of records) {
      if (next.nodes.has(id)) continue;
      record.element.remove();
      records.delete(id);
      expanded.delete(id);
    }
    for (const { id, record, values, texts } of prepared) {
      records.set(id, record);
      for (const [index, text] of texts) record.fields[index].textContent = text;
      record.values = values;
      record.snapshot = next.nodes.get(id)!.row;
    }
    nodes = next.nodes;
    const cleared = selected !== null && !nodes.has(selected);
    if (cleared) selected = null;
    if (revealSelected && selected !== null) {
      let parent = nodes.get(selected)!.parent;
      while (parent !== null) {
        expanded.add(parent);
        parent = nodes.get(parent)!.parent;
      }
    }
    focused = fallback;
    for (const [id, node] of nodes) {
      const record = records.get(id)!;
      record.element.setAttribute("aria-level", String(node.level));
      record.element.setAttribute("aria-posinset", String(node.position));
      record.element.setAttribute("aria-setsize", String(node.siblings));
      if (!sameIds(record.childIds, node.children)) {
        record.group.replaceChildren(...node.children.map(child => records.get(child)!.element));
        record.childIds = node.children;
      }
      if (!node.children.length) expanded.delete(id);
    }
    if (!sameIds(rootIds, next.roots)) {
      const fragment = document.createDocumentFragment();
      for (const id of next.roots) fragment.append(records.get(id)!.element);
      anchor.before(fragment);
      rootIds = next.roots;
    }
    updateVisibility();
    if (hadFocus && (document.activeElement !== activeElement ||
        (activeElement === root && focused !== null) ||
        (activeElement instanceof HTMLElement && activeElement.closest("[hidden]")))) {
      if (focused !== null) moveFocus(focused);
      else root.focus({ preventScroll: true });
    }
    if (cleared) options.onSelect?.({ id: null, row: null, event: null });
  }

  function select(id: RowId | null, event: Event | null): void {
    if (id !== null) {
      let parent = requireNode(id).parent;
      while (parent !== null) {
        expanded.add(parent);
        parent = nodes.get(parent)!.parent;
      }
    }
    const changed = id !== selected;
    selected = id;
    if (!root.contains(document.activeElement) && id !== null) focused = id;
    updateVisibility();
    if (changed) options.onSelect?.({ id, row: id === null ? null : nodes.get(id)!.row, event });
  }

  function setExpanded(id: RowId, open: boolean): void {
    const node = requireNode(id);
    if (!node.children.length) return;
    if (open) expanded.add(id);
    else {
      expanded.delete(id);
      let ancestor = focused;
      while (ancestor !== null && ancestor !== id) ancestor = nodes.get(ancestor)?.parent ?? null;
      if (ancestor === id && focused !== id) moveFocus(id, root.contains(document.activeElement));
    }
    updateVisibility();
  }

  function eventNode(event: Event): RowId | undefined {
    const target = event.target;
    if (!(target instanceof Element)) return undefined;
    const element = target.closest<HTMLLIElement>('li[role="treeitem"]');
    return element && root.contains(element) ? ids.get(element) : undefined;
  }

  function onClick(event: MouseEvent): void {
    const id = eventNode(event);
    if (id === undefined) return;
    moveFocus(id);
    if (event.target instanceof Element && event.target.closest("[data-tree-toggle]") === records.get(id)!.toggle) {
      setExpanded(id, !expanded.has(id));
    } else select(id, event);
  }

  function onKeydown(event: KeyboardEvent): void {
    const id = eventNode(event);
    if (id === undefined || event.altKey || event.ctrlKey || event.metaKey) return;
    const node = nodes.get(id)!;
    const index = visible.indexOf(id);
    let next: RowId | undefined;
    if (event.key === "ArrowDown") next = visible[Math.min(index + 1, visible.length - 1)];
    else if (event.key === "ArrowUp") next = visible[Math.max(0, index - 1)];
    else if (event.key === "Home") next = visible[0];
    else if (event.key === "End") next = visible.at(-1);
    else if (event.key === "ArrowRight") {
      if (node.children.length && !expanded.has(id)) setExpanded(id, true);
      else next = node.children[0];
    } else if (event.key === "ArrowLeft") {
      if (expanded.has(id)) setExpanded(id, false);
      else next = node.parent ?? undefined;
    } else if (event.key === "Enter" || event.key === " ") select(id, event);
    else if (event.key.length === 1) {
      const now = performance.now();
      const character = event.key.toLocaleLowerCase();
      prefix = now - lastTyped > 700 || (prefix.length === 1 && prefix === character) ? character : prefix + character;
      lastTyped = now;
      for (let step = 1; step <= visible.length; step++) {
        const candidate = visible[(index + step) % visible.length];
        if ((records.get(candidate)!.label.textContent ?? "").trim().toLocaleLowerCase().startsWith(prefix)) {
          next = candidate;
          break;
        }
      }
    } else return;
    event.preventDefault();
    if (next !== undefined) moveFocus(next);
  }

  function onFocus(event: FocusEvent): void {
    const id = eventNode(event);
    if (id !== undefined) moveFocus(id, false);
  }

  template.replaceWith(anchor);
  root.setAttribute("role", "tree");
  if (empty) empty.setAttribute("role", "none");
  boundRoots.add(root);
  eventRoot.addEventListener("click", onClick);
  eventRoot.addEventListener("keydown", onKeydown);
  eventRoot.addEventListener("focusin", onFocus);
  let unsubscribe = () => {};
  function dispose(): void {
    if (disposed) return;
    disposed = true;
    unsubscribe();
    eventRoot.removeEventListener("click", onClick);
    eventRoot.removeEventListener("keydown", onKeydown);
    eventRoot.removeEventListener("focusin", onFocus);
    for (const record of records.values()) record.element.remove();
    records.clear();
    nodes.clear();
    expanded.clear();
    rootIds = [];
    visible = [];
    anchor.replaceWith(template);
    if (empty) empty.hidden = emptyHidden!;
    restoreEmpty();
    restoreRoot();
    boundRoots.delete(root);
  }
  try {
    unsubscribe = options.rows.subscribe(render);
    render();
  } catch (cause) {
    dispose();
    throw cause;
  }
  return {
    select(id) { active(); select(id, null); },
    selected() { active(); return selected; },
    setExpanded(id, open) {
      active();
      if (typeof open !== "boolean") throw treeError("TREE_EXPANDED", "Tree expansion needs a boolean.");
      setExpanded(id, open);
    },
    expanded() { active(); return Object.freeze([...expanded]); },
    dispose
  };
}
