---
type: UI Component
title: bindTree
description: Bind authored hierarchical lists to Rows with single selection, expansion, nested text fields, and keyboard navigation.
tags: [ui, tree, binding, accessibility]
status: draft
symbols: [bindTree, TreeHandle]
sources:
  - id: tree
    resource: ../../src/ui/tree.ts
    title: Tree hierarchy, field binding, keyboard, and disposal implementation
    git_blob: 730aec4bc38bd3f001cea36677825ee1b4d15cd0
  - id: rows
    resource: ../../src/data/index.ts
    title: Caller-owned Rows and stable row identity
    git_blob: 10c07414eacccc414b81afc8be5661dd21afe3c6
  - id: paths
    resource: ../../src/ui/field-path.ts
    title: Private safe nested field paths
    git_blob: dfac85c3d4cc2c0a61cb2e4ee210b01583ecc5b2
  - id: apg
    resource: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
    title: WAI-ARIA treeview pattern
generated: { by: codex/gpt-6, at: 2026-10-05T07:27:08Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T07:43:44Z }
---

`bindTree` turns an authored list template into a single-selection hierarchy over caller-owned `Rows`. Tree displays text and controls focus, expansion, and selection; edit the selected record through a Form.[^tree]

# Quick start

```html
<ul data-people aria-label="People">
  <li data-row-template>
    <button type="button" data-tree-toggle aria-label="Toggle children"></button>
    <span data-tree-label data-field="profile.name"></span>
    <ul data-tree-children></ul>
  </li>
  <li data-empty hidden>No people</li>
</ul>
```

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindTree } from "@bbalganjjm/natural_js/ui";

const rows = createRows([
  { key: "team", parent: null, profile: { name: "Platform" } },
  { key: "ada", parent: "team", profile: { name: "Ada" } }
]);
const tree = bindTree(document.querySelector<HTMLUListElement>("[data-people]")!, {
  rows,
  key: row => row.key,
  parent: row => row.parent,
  onSelect({ id, row }) { console.log(id, row?.value.profile.name); }
});
tree.select(rows.entries()[1].id);
tree.dispose();
rows.dispose();
```

Selection of a collapsed descendant expands its ancestors. `key` and `parent` describe application hierarchy; the callback and handle use `Rows` IDs, not those keys or DOM IDs.[^tree][^rows]

# Constructor

`bindTree<T extends object>(root: HTMLUListElement | HTMLOListElement, options): TreeHandle` requires a connected, named `<ul>` or `<ol>`. Name it with nonempty `aria-label` or valid `aria-labelledby` references. Tree supplies `role="tree"`; a different authored role is rejected. One direct `li[data-row-template]` and at most one direct `li[data-empty]` are allowed. A second live binding raises `TREE_IN_USE`.[^tree]

# Options

| Option | Type | Default | Behavior |
|---|---|---|---|
| `rows` | `Rows<T>` | — | Caller-owned store; Tree subscribes without disposing it. |
| `key` | `(row: Snapshot<T>) => string \| number` | — | Unique, nonempty string or finite numeric domain key. |
| `parent` | `(row: Snapshot<T>) => string \| number \| null` | — | Existing parent domain key; `null` means a root. |
| `rules` | `RuleSet` | None | Component-local display formatters, messages, and locale. |
| `onSelect` | `({ id, row, event }) => void` | None | Changed selection with `RowId \| null`, `RowSnapshot<T> \| null`, and `Event \| null`. |

Rows insertion order determines sibling order. String and numeric keys remain distinct. Missing parents, duplicate keys, and cycles raise `TREE_PARENT`, `TREE_KEY`, or `TREE_CYCLE`; Tree does not infer roots from missing parents.[^tree]

# Declarative options

| Marker | Element | Behavior |
|---|---|---|
| `data-row-template` | One direct `li` | Defines repeated authored node markup. |
| `data-tree-label` | One accessible descendant | Names the node; may contain text-only field elements. |
| `data-tree-children` | One direct empty `ul` or `ol` in the template | Receives child nodes; whitespace is allowed, elements or non-whitespace text are not. |
| `data-tree-toggle` | Optional named `button[type="button"]` | Pointer expansion control, excluded from the Tab sequence. |
| `data-field="path"` | Text-only descendant | Reads a safe object path and writes text. |
| `data-format='[["name",...args]]'` | Text field | Uses retained UI formatters or `rules.format` overrides. |
| `data-empty` | Optional direct `li` | Appears when Rows has no nodes. |

The repeated template cannot contain fixed IDs or interactive controls other than its optional toggle. A field cannot be the node root, child group, toggle, or an element containing children. Tree rejects `data-validate`; use Form validation for edits. Safe field paths reject prototype keys, numeric array indexes, and expressions.[^tree][^paths]

# Methods

| Method | Behavior |
|---|---|
| `select(id: RowId \| null)` | Selects an existing row and reveals its ancestors, or clears selection. Programmatic selection does not move browser focus. |
| `selected()` | Returns the selected `RowId` or `null`. |
| `setExpanded(id: RowId, expanded: boolean)` | Opens or closes a branch. A leaf has no expansion state. Collapsing a focused descendant moves focus to its ancestor. |
| `expanded()` | Returns a readonly snapshot of expanded branch IDs. |
| `dispose()` | Unsubscribes, removes generated nodes and listeners, restores the original template/root attributes/empty state, and releases ownership. Repeated calls are safe. |

Unavailable IDs raise `TREE_ROW`. Invalid expansion values raise `TREE_EXPANDED`; use after disposal raises `TREE_DISPOSED`.[^tree]

# Events

| Event | Handler | Behavior |
|---|---|---|
| Node pointer click, Enter, or Space | `onSelect({ id, row, event })` | Fires only when selection changes; `this` is not rebound. |
| Programmatic selection or selected-row removal | `onSelect({ id, row, event: null })` | Reports changed selection. Removing the selected row clears it. |

Focus and expansion do not select a node. Data edits to a selected row do not emit a new selection event; use a `Rows.subscribe` callback when the application also displays that changing data.[^tree]

# Behavior

Tree supports vertical navigation and single selection. Horizontal `aria-orientation` and true `aria-multiselectable` are rejected. Tree uses one roving Tab stop on visible `role="treeitem"` nodes. Up/Down move through visible nodes; Right opens a branch or enters its first child; Left closes it or moves to its parent. Home/End move to the first/last visible node. Typing a prefix searches visible labels, and Enter/Space selects. Parent nodes carry `aria-expanded`; all nodes carry selection, level, sibling position, and sibling count. Generated label IDs are document-unique. With no rows, the named root becomes a focusable `role="group"` and the optional empty item has `role="none"`; this avoids a tree without required treeitem children.[^tree][^apg]

Tree builds a hierarchy map from the Rows snapshot, parses field paths once, caches each record's authored field elements, and reuses existing clones. It updates changed display values without resolving field selectors for every update. Hierarchy changes preserve surviving RowIds; removal or replacement discards unavailable selection/expansion. A selected descendant can remain selected while its branch is closed. Moving the selected row to a new parent reveals its new ancestors; unrelated edits keep a manually collapsed branch closed. A focused, unselected node moved into a collapsed branch falls back to the first visible node. Adding the first row to a focused empty root focuses its new item.[^tree][^rows]

Binding failure restores authored DOM and releases ownership. A later invalid hierarchy or failing formatter leaves the previously rendered hierarchy intact. `Rows` mutation itself is already committed before subscriber rendering; repair that data or revert it, rather than assuming Tree rolled back the store. Application callback errors propagate.[^tree][^rows]

# Pitfalls

Tree uses flat Rows with explicit parent keys. Applications flatten nested domain trees when needed; no separate tree store or general hierarchy utility is exported. Parent callbacks read immutable row values. Removing a parent while leaving its children produces a missing-parent error; remove its children first or reparent them before removing their parent.[^tree][^rows]

Use `data-field` for values. Keep fixed IDs outside repeated templates and ensure authored ARIA references are unique across simultaneous pages. The formatter contract remains display-only; editing, validation, filtering, and business ordering belong to application Forms and callbacks.[^tree]

# Examples

[Tree and DatePicker in two CVC layouts](tree-date-example.md) connects Tree selection to an editable Form and shows independent MDI instances.

# Related

[Rows](data.md) owns snapshots and identity. [Form](form.md) edits selected records. [UI contracts](ui.md) defines formatter overrides. [The page runtime](page.md) owns component disposal.

[^tree]: Tree hierarchy, field binding, keyboard, and disposal implementation
[^rows]: Caller-owned Rows and stable row identity
[^paths]: Private safe nested field paths
[^apg]: WAI-ARIA treeview pattern
