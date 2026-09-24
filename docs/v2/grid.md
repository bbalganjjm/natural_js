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
    git_blob: 6a2ee60393df8898e518a884fc1b8f3c6d6b9cf5
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid binding and validation runtime
    git_blob: dedeca30ef8f10a78172748d8cb9911a68b7da03
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
generated: { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
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

`bindGrid<T extends object>(root: HTMLTableElement, options: { rows: Rows<T>; rules?: RuleSet; parse?: Record<string, ParseInput>; onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void }): GridHandle<T>` requires a `<table>` with exactly one `<tbody><tr data-row-template>` across all bodies. The template and its descendants must not have fixed DOM IDs. The runtime temporarily replaces that row with a comment anchor, reuses cloned row elements across sorting/filtering, and restores the original template on disposal. It leaves other authored table rows in place. A second live binding of the table raises `GRID_IN_USE`.[^grid]

| Option | Behavior |
|---|---|
| `rows` | Required caller-owned store of immutable snapshots and row identities. |
| `rules` | Optional component-local formatter/validator overrides, messages, and locale. The shared rule runner also resolves retained built-in names. |
| `parse` | Optional application parser per editable field path, used to turn an entered string into a raw JSON value. A number input requires one. |
| `onSelect` | Called when the selected ID changes; programmatic changes pass `event: null`. |

# Declarative options

| Marker | Element | Behavior |
|---|---|---|
| `data-row-template` | One tbody row | Defines the repeated authored structure. |
| `data-field="path"` | Row descendant | Reads a top-level or dot-separated object path. Text cells use `textContent`; supported inputs and textareas can edit it. |
| `data-format='[["name", ...args]]'` | Text-like input, textarea, or text element | Applies display-only rules; non-text inputs and Selects reject it. Stored row data stays raw. |
| `data-validate='[["name", ...args]]'` | Field or Select | Validates raw values with built-in or supplied rules. Rules are parsed once from the template. |
| `data-error-for="path"` | Row descendant | Displays field issues as text and receives a generated unique ID for `aria-describedby`. |
| `data-select-row` | Button | Selects the row and reflects state through `aria-pressed`. |
| `data-options="path"` | Select | Finds the row-local array of option objects, separate from the selected `data-field`. |
| `data-option-label="path"`, `data-option-value="path"` | Select with `data-options` | Read each option's label and raw scalar value. |

Field and option paths reject array indices, expressions, prototype keys, and empty segments. The Grid compiles field descriptors once, caches clone element references, and updates only fields whose raw values change. A nested field edit copies the affected object path and calls `Rows.set` for its top-level field.[^grid][^path]

# Methods

## `select(id)` and `selected()`

`select(id)` selects an existing, nondeleted row (visible or filtered out), or clears selection with `null`. An unavailable ID raises `GRID_ROW`. `selected()` returns the current store-local ID or `null`. Sorting and filtering do not change it; deleting a selected row clears it.[^grid]

## `setSort(compare, indicator?)` and `setFilter(predicate)`

`compare(a, b)` receives immutable row values; a predicate receives one immutable row value. Pass `null` to clear either operation. A sort indicator may specify a `<th>` in this table's `<thead>` and `direction: "ascending" | "descending"`; the Grid sets its `aria-sort` and restores the prior attribute when the indicator changes or disposal occurs. The application supplies the comparator and keeps the indicator consistent with it. Sorting and filtering preserve row IDs, selection, and row-keyed drafts.[^grid]

## `setPage(request)` and `page()`

`setPage({ page, size })` slices rows after filtering and sorting; `null` shows all rows. Page and size must be positive safe integers (`GRID_PAGE`). `page()` returns a frozen `{ page, size, total, pages }` or `null` when local paging is off. If the current page exceeds the new result count, it clamps to the last page; an empty result has page 1 and 0 pages. Selection and drafts remain keyed to Rows IDs even when off-page.[^grid]

## `validate(id?)`

Returns `{ valid, issues }` for an explicit nondeleted ID or all nondeleted rows, including filtered-out or off-page rows. It checks supported input HTML constraints (including programmatically bound text length limits), parsers and validators, Select availability, Select `required`, and Select validators. A missing or deleted explicit ID raises `GRID_ROW`. An issue has `rowId`, `field`, `rule`, and `message`; `element` exists only for a connected row control. Validation evaluates all cell drafts for one row against the same candidate values, even while the row is filtered out. A draft that passes is committed to `Rows`; a failed draft stays outside the store. Call `validate()` before saving to reconcile drafts after external row changes.[^grid][^rules]

## `dispose()`

Removes delegated listeners and cloned rows, unsubscribes from `Rows`, clears drafts and Select ownership, and restores the untouched row template and authored sort state. It does not dispose the caller-owned store. Repeated disposal is safe; other methods then raise `GRID_DISPOSED`.[^grid]

# Behavior

Text formatting is one-way: rules transform displayed text while the row snapshot and save payload retain the raw value. Validation invokes the shared UI rule runner on raw values. A Select option's DOM `value` is a string, but its row-local mapping preserves a raw string, finite number, boolean, or `null`. Authored empty options map to `null`; nonempty authored options remain strings. A missing selected raw value shows no selected option and yields `select-option`.[^grid][^rules]

When a user types in a supported input, the Grid retains the entered draft and validates it; a native `change` commits valid text, checkbox, number, or Select candidates. A parser receives the entered string and one snapshot of all unparsed row drafts, independent of parser order; declared validators receive each parsed field value as a string, with the combined typed candidate in `RuleContext.values`. A throw or `undefined` creates a `parse` issue and preserves the draft. The Grid checks all fields against the row value plus every draft for that row. A choice that fails stays visible as a draft under that row ID and field path, while `Rows` remains unchanged. A later field change can make cross-field drafts valid and commit them. Changing another row field does not clear the draft. Programmatic `Rows` updates refresh the display and clear stale error text without invoking user validators; call `validate()` before saving. An external replacement of a drafted field, `replace`, `remove`, `revert`, or `dispose` clears the affected drafts. Filtering, sorting, and paging keep them. `validate(id)` checks drafts even without a rendered row.[^grid]

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
| `GRID_SORT`, `GRID_PAGE` | Invalid sort indicator/comparator or local page request. |
| `GRID_ROW`, `GRID_DISPOSED` | Missing/deleted row or use after disposal. |
| `SELECT_OWNED` | Trying to bind a Grid-owned Select again. |
| `RULE_DECLARATION`, `RULE_UNKNOWN`, `RULE_ARGUMENT`, `RULE_FAILED` | Invalid, unavailable, malformed, or failed rule. |
| `FIELD_PATH` | Unsafe path or nested write through a non-object. |

`RowId` is neither a DOM ID nor a display index. Grid edits text-like inputs, textareas, checkboxes, and number inputs with an application parser. It rejects radio, file, unsupported input types, and multiple Selects; use Form for those. A plain `data-field` text element displays data without editing it. `data-format` is only for text-like inputs, textareas, and text elements. An error region and field must use the same exact path. A Select's `data-options` names its row-local option array; `data-field` names its selected scalar. A Select owned by Grid cannot also be bound with `bindSelect`.[^grid][^owner]

# Related

[Rows](data.md) owns identity and changes. [UI contracts](ui.md) defines `RuleSet`, handles, and results. [Form](form.md) shares the private rule runner. [Pagination](pagination.md) can use `grid.page()`. [The M6 plan](../implementation/m6-plan.md) records this milestone's migration scope.

[^grid]: Grid binding and validation runtime
[^rules]: Shared Form/Grid rule runner
[^path]: Safe nested field paths
[^options]: Shared private row-local options
[^owner]: Shared Select ownership
