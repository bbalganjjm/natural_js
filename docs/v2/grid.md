---
type: UI Component
title: bindGrid
description: Bind an authored native table to Rows with cell editing, nested choices, local paging, and accessible validation.
tags: [ui, grid, binding, accessibility]
status: draft
symbols: [bindGrid]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public UI entry and Grid handle types
    git_blob: 98601f6d9ce1b487dd52c81dad860b465b71e8c0
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid binding and validation runtime
    git_blob: d606737eaa4d51860407c50b4d3ba2f378739ed3
  - id: columns
    resource: ../../src/ui/grid-columns.ts
    title: Private native column topology and resize ownership
    git_blob: 320875af9ad09ea42e98898a1f745b3cec69d652
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Shared Form/Grid rule runner
    git_blob: 967142342d060056cd3f124db29f6893a2875d48
  - id: path
    resource: ../../src/ui/field-path.ts
    title: Safe nested field paths
    git_blob: dfac85c3d4cc2c0a61cb2e4ee210b01583ecc5b2
  - id: options
    resource: ../../src/ui/row-options.ts
    title: Shared private row-local options
    git_blob: 72facd6bc5b30845938731897f1f5aadd257a7fa
  - id: owner
    resource: ../../src/ui/select-owner.ts
    title: Shared Select ownership
    git_blob: 6902e2789df6e44123b2ea599e4d05fa1c098fa4
generated: { by: codex/gpt-6, at: 2026-10-05T11:42:46Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-25T00:41:28Z }
  - { by: codex/gpt-6, at: 2026-10-05T11:43:54Z }
---

`bindGrid` adds behavior to a native table and a caller-owned `Rows` store. It clones one authored row template, keeps selection and invalid cell drafts under store-local `RowId` values, and never uses DOM IDs as row or field keys.[^grid]

# Quick start

```html
<table>
  <thead><tr><th scope="col">Employee</th><th scope="col">Choice</th><th scope="col">Salary</th></tr></thead>
  <tbody><tr data-row-template>
    <th scope="row">
      <button type="button" data-select-row>Open <span data-field="name" data-format='[["upper"]]'></span></button>
      <output data-error-for="name"></output>
    </th>
    <td><label>Choice
      <select data-field="chosen" data-options="a" data-option-label="aa"
        data-option-value="bb" data-validate='[["required"]]' required>
        <option value="">Choose</option>
      </select>
    </label><output data-error-for="chosen"></output></td>
    <td><label>Salary <input type="number" data-field="salary"></label>
      <output data-error-for="salary"></output></td>
  </tr></tbody>
</table>
```

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindGrid } from "@bbalganjjm/natural_js/ui";

const rows = createRows([{ name: "Ada", a: [{ aa: 11, bb: 22 }], chosen: 22, salary: 1200 }]);
const table = document.querySelector("table")!;
const grid = bindGrid(table, {
  rows, parse: { salary: input => Number(input) },
  onSelect: ({ id }) => console.log(id)
});
if (grid.validate().valid) console.log(rows.changes());
// The owning page eventually calls grid.dispose() and rows.dispose().
```

# Constructor

`bindGrid<T extends object>(root: HTMLTableElement, options: { rows: Rows<T>; initialPage?: PageRequest; columns?: readonly GridColumn[]; onColumnsChange?: (change: { columns: readonly GridColumn[]; event: Event | null }) => void; rules?: RuleSet; parse?: Record<string, ParseInput>; onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void }): GridHandle<T>` requires a `<table>` with exactly one `<tbody><tr data-row-template>` across all bodies. The template and its descendants must not have fixed DOM IDs. The runtime temporarily replaces that row with a comment anchor, reuses clones for rows that remain visible, releases offscreen row elements and Select ownership after each view change, and recreates them when those rows return. It restores the original template on disposal. It leaves other authored table rows in place. A second live binding of the table raises `GRID_IN_USE`.[^grid]

| Option | Behavior |
|---|---|
| `rows` | Required caller-owned store of immutable snapshots and row identities. |
| `initialPage` | Optional `{ page, size }` applied before the first render. Defaults to all rows; use it to bound initial local DOM work. |
| `rules` | Optional component-local formatter/validator overrides, messages, and locale. The shared rule runner also resolves retained built-in names. |
| `parse` | Optional application parser per editable field path, used to turn an entered string into a raw JSON value. A number input requires one. |
| `columns` | Optional full column state; each key appears exactly once in display order. Template `data-column` also enables management with authored defaults. |
| `onColumnsChange` | Optional callback after committed layout changes; programmatic changes pass `event: null`. |
| `onSelect` | Called when the selected ID changes; programmatic changes pass `event: null`. |

# Declarative options

| Marker | Element | Behavior |
|---|---|---|
| `data-column="key"` | Direct template cell and leaf header/footer/static cell | Stable unique column key, separate from field paths and DOM IDs; leaf colspan is 1. Every direct template cell needs a key when enabled. |
| `data-columns="team choice"` | Group header/footer/static cell or colgroup | Explicit known group membership; members must stay consecutive in state order, even when hidden. |
| `data-resize-column="key"` | Header button | Authored `type="button"`, nonempty `aria-label`, inside matching leaf header. Pointer and keyboard resizing. |
| `data-row-template` | One tbody row | Defines the repeated authored structure. |
| `data-field="path"` | Row descendant | Reads a top-level or dot-separated object path. Text cells use `textContent`; supported inputs and textareas can edit it. |
| `data-format='[["name", ...args]]'` | Text-like input, textarea, or text element | Applies display-only rules; non-text inputs and Selects reject it. Stored row data stays raw. |
| `data-validate='[["name", ...args]]'` | Field or Select | Validates raw values with built-in or supplied rules. Rules are parsed once from the template. |
| `data-error-for="path"` | Row descendant | Displays field issues as text and receives a generated unique ID for `aria-describedby`. |
| `data-select-row` | Button | Selects the row and reflects state through `aria-pressed`. |
| `data-options="path"` | Select | Finds the row-local array of option objects, separate from the selected `data-field`. |
| `data-option-label="path"`, `data-option-value="path"` | Select with `data-options` | Read each option's label and raw scalar value. |

Field and option paths reject array indices, expressions, prototype keys, and empty segments. The Grid compiles field descriptors once, keeps element references only for currently displayed clones, and updates their fields when raw values change. A nested field edit copies the affected object path and calls `Rows.set` for its top-level field.[^grid][^path]

# Methods

## `columns()` and `setColumns(columns)`

`columns()` returns a frozen array of frozen `GridColumn` objects: `{ key, width?, hidden? }`. `setColumns` replaces the full ordered state; keys must be known, unique and complete. Width is a positive finite preferred CSS-pixel value; omitted width restores the authored preference, and omitted `hidden` means visible. At least one column must be visible. Flat tables allow arbitrary order; grouped cells and authored colgroups require contiguous members, allowing within-group order or whole-group movement. Invalid input fails before changing state or DOM. Without column markup/option, the state is `[]`; nonempty replacement raises `GRID_COLUMNS`.[^columns]

```ts
const next = grid.columns().map(column => column.key === "team"
  ? { ...column, width: 200, hidden: true } : column);
grid.setColumns(next);
grid.setColumns([...grid.columns()].reverse()); // Only valid if groups stay contiguous.
```

Width-only changes skip row/header/footer movement and focus/scroll work, updating changed native col widths and table width only. Other column state changes reuse existing cells/controls and do not change Rows, identity, selection or drafts. Application controls can call this method to move/show/hide/reset and persist serialized state. Hidden nodes stay privately owned for reappearance and restoration. No column chooser, drag-to-reorder UI or persistence registry is generated.[^columns]

## `select(id)` and `selected()`

`select(id)` selects an existing, nondeleted row (visible or filtered out), or clears selection with `null`. An unavailable ID raises `GRID_ROW`. `selected()` returns the current store-local ID or `null`. Sorting and filtering do not change it; deleting a selected row clears it.[^grid]

## `setSort(compare, indicator?)` and `setFilter(predicate)`

`compare(a, b)` receives immutable row values; a predicate receives one immutable row value. Pass `null` to clear either operation. A sort indicator may specify a `<th>` in this table's `<thead>` and `direction: "ascending" | "descending"`; the Grid sets its `aria-sort` and restores the prior attribute when the indicator changes or disposal occurs. The application supplies the comparator and keeps the indicator consistent with it. Sorting and filtering preserve row IDs, selection, and row-keyed drafts.[^grid]

## `setPage(request)` and `page()`

`initialPage: { page, size }` applies the same local slice before the first render. `setPage({ page, size })` changes it later; `null` shows all rows. Page and size must be positive safe integers (`GRID_PAGE`) for either entry point. An invalid `initialPage` fails before the authored template changes. If a later page exposes a formatter or row-option error, `setPage` keeps the previous page state and visible rows, releases the failed row clones, and can be retried after the data or rule is fixed. `page()` returns a frozen `{ page, size, total, pages }` or `null` when local paging is off. If the current page exceeds the new result count, it clamps to the last page; an empty result has page 1 and 0 pages. Selection and drafts remain keyed to Rows IDs even when off-page.[^grid]

## `validate(id?)`

Returns `{ valid, issues }` for an explicit nondeleted ID or all nondeleted rows, including filtered-out or off-page rows. It checks supported input HTML constraints (including programmatically bound text length limits), parsers and validators, Select availability, Select `required`, and Select validators. A missing or deleted explicit ID raises `GRID_ROW`. An issue has `rowId`, `field`, `rule`, and `message`; `element` exists only for a connected row control. Validation evaluates all cell drafts for one row against the same candidate values, even while the row is filtered out. A draft that passes is committed to `Rows`; a failed draft stays outside the store. Call `validate()` before saving to reconcile drafts after external row changes.[^grid][^rules]

## `dispose()`

Removes delegated listeners and visible cloned rows, unsubscribes from `Rows`, clears drafts, cached issue text, and Select ownership, and restores the untouched row template, authored sort state, column/cell/group order, spans/styles, and resize button attributes. It cancels previews and releases document listeners, pointer capture and animation frames. It does not dispose the caller-owned store. Repeated disposal is safe; other methods then raise `GRID_DISPOSED`.[^grid]

# Events

| Handler | Signature and timing | `this` |
|---|---|---|
| `onSelect` | `({ id, row, event }) => void`, when the selected ID changes | Not a controller binding |
| `onColumnsChange` | `({ columns, event }) => void`, after one effective committed change; immutable state and native keydown/pointerup, or `null` for `setColumns` | Not a controller binding |

Initial binding, equal state, canceled preview and disposal do not emit column changes. Callback errors propagate after the new state is committed; do not retry assuming rollback.[^columns]

# Behavior

Managed columns compile native topology once. They move original header/footer cells, maintain visible group colspan and reorder expanded native cols. Hidden cells, cols and empty groups leave the connected table model. A scope="colgroup" cell must match an authored native colgroup membership. Header/footer rows must cover all template keys, including carried rowspans; authored `rowspan` remains unchanged. The original repeated template is never moved or altered. Data field indices are captured before applying column order to a clone.[^columns][^grid]

Widths follow native CSS table/minimum-content constraints. When all visible columns have explicit widths the runtime prefers their sum as table width; otherwise it restores the original table-width preference. Authors choose table layout, responsive scroll containment, sticky positioning and visual resize affordances in CSS. Resize controls receive owned `touch-action: none`, `user-select: none` and `aria-keyshortcuts` if absent; disposal restores originals. ArrowLeft/ArrowRight adjust 10 pixels, Shift adjusts 1, and Home restores the initial preferred width. Pointer previews publish one change at release; Escape/cancel restores the prior state. Move preserves focus/caret; hiding focused content tries available visible controls then the table. Detached hidden controls are still validated through row-keyed drafts, but issues omit a disconnected element.[^columns][^grid]

Text formatting is one-way: rules transform displayed text while the row snapshot and save payload retain the raw value. Validation invokes the shared UI rule runner on raw values. A Select option's DOM `value` is a string, but its row-local mapping preserves a raw string, finite number, boolean, or `null`. Authored empty options map to `null`; nonempty authored options remain strings. A missing selected raw value shows no selected option and yields `select-option`.[^grid][^rules]

When a user types in a supported input, the Grid retains the entered draft and validates it; a native `change` commits valid text, checkbox, number, or Select candidates. A parser receives the entered string and one snapshot of all unparsed row drafts, independent of parser order; declared validators receive each parsed field value as a string, with the combined typed candidate in `RuleContext.values`. A throw or `undefined` creates a `parse` issue and preserves the draft. The Grid checks all fields against the row value plus every draft for that row. A choice that fails stays visible as a draft under that row ID and field path, while `Rows` remains unchanged. A later field change can make cross-field drafts valid and commit them. Changing another row field does not clear the draft. Programmatic `Rows` updates refresh the display and clear stale error text without invoking user validators; call `validate()` before saving. Validation message text is kept by `RowId` without DOM references, so a failing off-page row shows its issue again when it returns. An external replacement of a drafted field, `replace`, `remove`, `revert`, or `dispose` clears the affected drafts. Filtering, sorting, and paging keep them. `validate(id)` checks drafts even without a rendered row.[^grid]

Each cloned `data-error-for` region receives a document-unique ID and `aria-live="polite"` if not authored. The matching field control includes that ID in `aria-describedby`; failed validation sets `aria-invalid="true"` and writes issue text. A pass restores the control's authored `aria-invalid` state. The table retains native semantics and does not acquire `role="grid"`. When the focused row leaves the visible slice, focus moves to another available control, header button, or the table root. Authors still provide labels and table headings.[^grid]

# Pitfalls

| Code | Cause |
|---|---|
| `GRID_ROOT`, `GRID_TEMPLATE`, `GRID_IN_USE` | Wrong table root, missing/duplicate row template, or a second live binding. |
| `DUPLICATE_ID` | A fixed ID appears inside the repeated template. |
| `GRID_SELECT`, `GRID_OPTIONS`, `GRID_FORMAT` | Invalid selection control, option markers/source, or formatter on a Select or non-text input. |
| `GRID_ERROR_REGION` | Repeated or unmatched `data-error-for` path in the template. |
| `GRID_FILE_ROWS`, `GRID_CONTROL` | Bound file/radio input, multiple Select, or unsupported input control. |
| `GRID_PARSE_FIELD` | A number input lacks a parser, or a parser is attached to an ambiguous/noneditable field. |
| `GRID_COLUMNS`, `GRID_COLUMN_MARKUP` | Invalid full state/callback, broken column keys/group membership/spans, or malformed resize control. |
| `GRID_SORT`, `GRID_PAGE` | Invalid sort indicator/comparator or local page request. |
| `GRID_ROW`, `GRID_DISPOSED` | Missing/deleted row or use after disposal. |
| `SELECT_OWNED` | Trying to bind a Grid-owned Select again. |
| `RULE_DECLARATION`, `RULE_UNKNOWN`, `RULE_ARGUMENT`, `RULE_FAILED` | Invalid, unavailable, malformed, or failed rule. |
| `FIELD_PATH` | Unsafe path or nested write through a non-object. |

`RowId` is neither a DOM ID nor a display index. Grid edits text-like inputs, textareas, checkboxes, and number inputs with an application parser. It rejects radio, file, unsupported input types, and multiple Selects; use Form for those. A plain `data-field` text element displays data without editing it. `data-format` is only for text-like inputs, textareas, and text elements. An error region and field must use the same exact path. A Select's `data-options` names its row-local option array; `data-field` names its selected scalar. A Select owned by Grid cannot also be bound with `bindSelect`. Without `initialPage`, `bindGrid` creates all row clones before the caller can set a local page. Pass `initialPage` for a large local store to create only its first visible slice. Off-page formatter errors surface when that row first renders; invalid row-local options surface on display or `validate(id)`. Calling `setPage(null)` deliberately renders all rows; measure that cost or use application-owned server pages.[^grid][^owner]

# Related

[Rows](data.md) owns identity and changes. [UI contracts](ui.md) defines `RuleSet`, handles, and results. [Form](form.md) shares the private rule runner. [Pagination](pagination.md) can use `grid.page()`. [The M6 plan](../implementation/m6-plan.md) records this milestone's migration scope. [The interactive Grid demo](grid-demo.md) exercises every implemented option, method, and declarative marker. [The two-layout example](advanced-grid-example.md) shows grouped headings and sticky positioning with authored HTML/CSS and no new API.

[^columns]: Private native column topology and resize ownership
[^grid]: Grid binding and validation runtime
[^rules]: Shared Form/Grid rule runner
[^path]: Safe nested field paths
[^options]: Shared private row-local options
[^owner]: Shared Select ownership
