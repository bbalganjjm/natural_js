---
type: UI Component
title: bindGrid
description: Bind a native authored table to Rows with row-local Select options and store-local selection.
tags: [ui, grid, binding, accessibility]
status: draft
symbols: [bindGrid]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public UI entry
    git_blob: f4004388ef1cb23c8e1e5fec340886f9c0416ef5
  - id: grid
    resource: ../../src/ui/grid.ts
    title: M4 Grid implementation
    git_blob: 387645f6294f0dc01a077a5c695163c388b32784
  - id: path
    resource: ../../src/ui/field-path.ts
    title: Safe field path implementation
    git_blob: dfac85c3d4cc2c0a61cb2e4ee210b01583ecc5b2
generated: { by: codex/gpt-6-sol, at: 2026-09-24T10:12:21Z }
verified:
  - { by: codex/gpt-6-sol-independent, at: 2026-09-24T10:12:53Z }
---

`bindGrid` attaches the M4 Grid pilot to an existing native table and a caller-owned `Rows` store. It clones the author's repeat row, binds fields within each clone, and keeps selection tied to `RowId` rather than DOM IDs or display position.[^grid]

# Quick start

```html
<table>
  <thead><tr><th scope="col">Employee</th><th scope="col">Choice</th></tr></thead>
  <tbody><tr data-row-template>
    <th scope="row"><button type="button" data-select-row><span data-field="name"></span></button></th>
    <td><label>Choice
      <select data-field="chosen" data-options="a" data-option-label="aa" data-option-value="bb">
        <option value="">Choose</option>
      </select>
    </label></td>
  </tr></tbody>
</table>
```

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindGrid } from "@bbalganjjm/natural_js/ui";

const rows = createRows([{ name: "Ada", a: [{ aa: 11, bb: 22 }], chosen: 22 }]);
const table = document.querySelector("table")!;
const grid = bindGrid(table, { rows, onSelect: ({ id }) => console.log(id) });
// The page that owns these handles eventually calls grid.dispose() and rows.dispose().
```

# Constructor

## `bindGrid(root, options)`

```ts
function bindGrid<T extends object>(root: HTMLTableElement, options: {
  rows: Rows<T>;
  rules?: RuleSet;
  onSelect?: (selection: {
    id: RowId | null;
    row: RowSnapshot<T> | null;
    event: Event | null;
  }) => void;
}): GridHandle<T>;
```

The root must be a `<table>` with exactly one `<tbody><tr data-row-template>` row across its bodies. `bindGrid` removes that template while mounted, clones it for visible rows, and restores it on disposal. Other authored table rows remain in place. The `Rows` store belongs to the caller.[^grid]

# Options

| Option | Type | Default | Behavior |
|---|---|---|---|
| `rows` | `Rows<T>` | — | Source of immutable row snapshots, identity, changes, and subscriptions. |
| `onSelect` | `(selection) => void` | — | Receives the selected store ID, current row snapshot, and originating click event; programmatic changes use `event: null`. |
| `rules` | `RuleSet` | — | Reserved by the M1 type contract; passing a value throws `GRID_RULES` in M4. Grid rule execution belongs to M5. |

# Declarative options

| Marker | Element | Meaning |
|---|---|---|
| `data-row-template` | One `<tr>` inside a `<tbody>` | Repeated row; no element inside it, including the row, may have a fixed `id`. |
| `data-field="path"` | Row descendant | Reads a top-level or dot-separated object path. Text-like elements receive `textContent`; input and textarea elements receive `value`. Missing or null values display as empty text. |
| `data-select-row` | `<button type="button">` in a row | Selects that row; the button gets `aria-pressed="true"` only while selected. |
| `data-options="path"` | `<select>` | Row-relative option-array path, separate from the selected `data-field`. Missing or null arrays produce no generated options. |
| `data-option-label="path"` | Select with `data-options` | Path within each option object for visible text. |
| `data-option-value="path"` | Select with `data-options` | Path within each option object for its raw scalar value. |

Paths are parsed once from the template. Each path uses safe dot-separated object keys; array indices, expressions, and prototype keys are rejected with `FIELD_PATH`. A nested Select change copies the affected object path and replaces its top-level `Rows` field instead of mutating a snapshot.[^path][^grid]

# Methods

## `select(id)`

Selects a visible or filtered-out existing row by store-local `RowId`, or clears selection with `null`. An unavailable or deleted ID throws `GRID_ROW`. It updates rendered selection buttons and calls `onSelect` only when the selected ID changes.[^grid]

## `selected()`

Returns the selected `RowId` or `null`. Filtering and sorting do not replace it; deleting the selected row or replacing the store clears it and calls `onSelect` with `event: null`.[^grid]

## `setSort(compare)`

Accepts `(a: Snapshot<T>, b: Snapshot<T>) => number` or `null`. It reorders rendered rows only; store order, row IDs, edits, and selection stay with their snapshots.[^grid]

## `setFilter(predicate)`

Accepts `(row: Snapshot<T>) => boolean` or `null`. It changes which rows are rendered, without deleting filtered-out rows or clearing a filtered-out selection.[^grid]

## `validate(id?)`

Returns `{ valid, issues }` for one existing nondeleted row or all nondeleted rows, including rows hidden by filtering. A missing or deleted explicit ID throws `GRID_ROW`. In M4 it checks only Select values against authored and row-local options. A value with no matching option produces a `ValidationIssue` with `rule: "select-option"`; the issue has an `element` only when that Select is connected to the document.[^grid]

## `dispose()`

Unsubscribes from `Rows`, removes table listeners and cloned rows, and restores the authored template. Calling it again is safe. It does not dispose the caller-owned row store; other handle methods then throw `GRID_DISPOSED`.[^grid]

# Events

| Event | Handler | `this` | Behavior |
|---|---|---|---|
| Row selection | `onSelect({ id, row, event })` | The passed options object | A row button click supplies the native event; `select(id)` and automatic clearing supply `null`. Do not use `this` as component state. |

# Behavior

The component reads one descriptor set from the authored template, caches each clone's element references, and listens for clicks and Select changes on the table. Store notifications update changed visible row snapshots; unchanged fields and option arrays keep their existing DOM controls. Reordering reuses row elements and restores focus to a moved control when its row remains visible. The table keeps native table semantics; `bindGrid` does not assign `role="grid"`.[^grid]

A generated option keeps a row-local association with its raw `string`, finite `number`, `boolean`, or `null` value. Its DOM `value` is a string, but changing the Select writes the associated raw value to `Rows`. Missing label/value paths, null or empty labels, and non-scalar values are skipped. Duplicate raw values select the first match. An authored option with `value=""` maps to raw `null`; other authored option values remain strings. If the selected raw value is unavailable, the Select shows no selected option (`selectedIndex === -1`) while the row value stays unchanged, and `validate()` reports `select-option`.[^grid]

| Error code | When |
|---|---|
| `GRID_RULES` | `rules` was supplied before M5 rule execution exists. |
| `GRID_ROOT` | Root is not a table. |
| `GRID_TEMPLATE` | The table has zero or multiple repeat rows. |
| `DUPLICATE_ID` | The repeat row or one of its descendants has a fixed `id`. |
| `GRID_SELECT` | `data-select-row` is not on a button. |
| `GRID_OPTIONS` | A row-local Select lacks label/value markers, or its non-null option source is not an array. |
| `GRID_ROW` | `select(id)` or `validate(id)` receives a missing or deleted row ID. |
| `GRID_DISPOSED` | A method other than `dispose()` is used after disposal. |
| `FIELD_PATH` | A binding path is empty or unsafe, or a nested write encounters a non-object parent. |

Errors use `FrameworkError` with the failing API; path failures originate in the private field-path module.[^grid][^path]

# Pitfalls

- `RowId` is neither an array index nor a DOM `id`. The selected row may be filtered out and still returned by `selected()`.[^grid]
- `data-options` provides option data; `data-field` provides the selected scalar. Giving the array path as `data-field` does not bind the selected value.[^grid]
- This M4 pilot does not run formatter/validator rules, edit text inputs, supply sorting/filtering controls, or implement the full M6 Grid. Passing `rules` fails explicitly. Use application validation for other pilot fields; M5 adds the shared Form/Grid rule runner.[^grid]
- A fixed `id` inside a repeated row cannot be made unique by selecting within the table. Use wrapping labels or other ID-free authored markup. Page-level ID collisions are checked by the CVC page runner.[^grid]

# Related

[Rows](data.md) owns row identity and changes. [UI types](ui.md) defines `GridHandle`, `RuleSet`, and validation results. [The M1 contract](../implementation/m1-contract.md) specifies the first-release direction; [the M4 plan](../implementation/m4-plan.md) marks this implementation as a prototype.

[^entry]: Public UI entry
[^grid]: M4 Grid implementation
[^path]: Safe field path implementation