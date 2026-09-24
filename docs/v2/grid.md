---
type: UI Component
title: bindGrid
description: Bind an authored native table to Rows with M5 display rules, validation, row-local Select drafts, and accessible errors.
tags: [ui, grid, binding, accessibility]
status: draft
symbols: [bindGrid]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public UI entry and Grid handle types
    git_blob: 024d2a174b00a1ac80f626942dcb07fa1142bf20
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid binding and validation runtime
    git_blob: cc5de08d7431e0e9d201b164f80caa6545718167
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Shared Form/Grid rule runner
    git_blob: 967142342d060056cd3f124db29f6893a2875d48
  - id: path
    resource: ../../src/ui/field-path.ts
    title: Safe nested field paths
    git_blob: dfac85c3d4cc2c0a61cb2e4ee210b01583ecc5b2
generated: { by: codex/gpt-6-sol, at: 2026-09-24T11:20:59Z }
---

`bindGrid` adds behavior to a native table and a caller-owned `Rows` store. It clones one authored row template, keeps selection and invalid Select drafts under store-local `RowId` values, and never uses DOM IDs as row or field keys.[^grid]

# Quick start

```html
<table>
  <thead><tr><th scope="col">Employee</th><th scope="col">Choice</th></tr></thead>
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
  </tr></tbody>
</table>
```

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindGrid } from "@bbalganjjm/natural_js/ui";

const rows = createRows([{ name: "Ada", a: [{ aa: 11, bb: 22 }], chosen: 22 }]);
const table = document.querySelector("table")!;
const grid = bindGrid(table, { rows, onSelect: ({ id }) => console.log(id) });
if (grid.validate().valid) console.log(rows.changes());
// The owning page eventually calls grid.dispose() and rows.dispose().
```

# Constructor

`bindGrid<T extends object>(root: HTMLTableElement, options: { rows: Rows<T>; rules?: RuleSet; onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void }): GridHandle<T>` requires a `<table>` with exactly one `<tbody><tr data-row-template>` across all bodies. The template and its descendants must not have fixed DOM IDs. The runtime temporarily replaces that row with a comment anchor, reuses cloned row elements across sorting/filtering, and restores the original template on disposal. It leaves other authored table rows in place.[^grid]

| Option | Behavior |
|---|---|
| `rows` | Required caller-owned store of immutable snapshots and row identities. |
| `rules` | Optional component-local formatter/validator overrides, messages, and locale. The shared rule runner also resolves retained built-in names. |
| `onSelect` | Called when the selected ID changes; programmatic changes pass `event: null`. |

# Declarative options

| Marker | Element | Behavior |
|---|---|---|
| `data-row-template` | One tbody row | Defines the repeated authored structure. |
| `data-field="path"` | Row descendant | Reads a top-level or dot-separated object path. Text cells use `textContent`; inputs/textareas use `value`. |
| `data-format='[["name", ...args]]'` | Non-Select field | Applies built-in or supplied rules to display text only. Stored row data stays raw. |
| `data-validate='[["name", ...args]]'` | Field or Select | Validates raw values with built-in or supplied rules. Rules are parsed once from the template. |
| `data-error-for="path"` | Row descendant | Displays field issues as text and receives a generated unique ID for `aria-describedby`. |
| `data-select-row` | Button | Selects the row and reflects state through `aria-pressed`. |
| `data-options="path"` | Select | Finds the row-local array of option objects, separate from the selected `data-field`. |
| `data-option-label="path"`, `data-option-value="path"` | Select with `data-options` | Read each option's label and raw scalar value. |

Field and option paths reject array indices, expressions, prototype keys, and empty segments. The Grid compiles field descriptors once, caches clone element references, and updates only fields whose raw values change. A nested Select edit copies the affected object path and calls `Rows.set` for its top-level field.[^grid][^path]

# Methods

## `select(id)` and `selected()`

`select(id)` selects an existing, nondeleted row (visible or filtered out), or clears selection with `null`. An unavailable ID raises `GRID_ROW`. `selected()` returns the current store-local ID or `null`. Sorting and filtering do not change it; deleting a selected row clears it.[^grid]

## `setSort(compare)` and `setFilter(predicate)`

`compare(a, b)` receives immutable row values; a predicate receives one immutable row value. Pass `null` to clear either operation. These functions change only rendered order or visibility, preserving row IDs, selection, and invalid Select drafts. Business comparisons and filter conditions remain application functions.[^grid]

## `validate(id?)`

Returns `{ valid, issues }` for an explicit nondeleted ID or all nondeleted rows, including filtered-out rows. It checks text field HTML constraints (including programmatically bound text length limits) and validators, Select availability, Select `required`, and Select validators. A missing or deleted explicit ID raises `GRID_ROW`. An issue has `rowId`, `field`, `rule`, and `message`; `element` exists only for a connected row control. Validation evaluates all Select drafts for one row against the same candidate values, even while the row is filtered out. A draft that passes is committed to `Rows`; a failed draft stays outside the store. Call `validate()` before saving to reconcile drafts after external row changes.[^grid][^rules]

## `dispose()`

Removes delegated listeners and cloned rows, unsubscribes from `Rows`, clears drafts, and restores the untouched row template. It does not dispose the caller-owned store. Repeated disposal is safe; other methods then raise `GRID_DISPOSED`.[^grid]

# Behavior

Text formatting is one-way: rules transform displayed text while the row snapshot and save payload retain the raw value. Validation invokes the shared UI rule runner on raw values. A Select option's DOM `value` is a string, but its row-local mapping preserves a raw string, finite number, boolean, or `null`. Authored empty options map to `null`; nonempty authored options remain strings. A missing selected raw value shows no selected option and yields `select-option`.[^grid][^rules]

When a user changes a Select, the Grid checks all fields against the row value plus every Select draft for that row. A choice that fails stays visible as a draft under that row ID and field path, while `Rows` remains unchanged. A later choice can make two cross-field drafts valid and commit both. Changing another row field does not clear the draft. Programmatic `Rows` updates refresh the display and clear stale error text without invoking user validators; call `validate()` before saving. A replacement of that selected field, `replace`, `remove`, `revert`, or `dispose` clears the affected drafts. Filtering and sorting keep them. `validate(id)` checks drafts even without a rendered row.[^grid]

Each cloned `data-error-for` region receives a document-unique ID and `aria-live="polite"` if not authored. The matching field control includes that ID in `aria-describedby`; failed validation sets `aria-invalid="true"` and writes issue text. A pass restores the control's authored `aria-invalid` state. The table retains native semantics and does not acquire `role="grid"`. Authors still provide labels and table headings.[^grid]

# Errors and pitfalls

| Code | Cause |
|---|---|
| `GRID_ROOT`, `GRID_TEMPLATE` | Wrong table root or missing/duplicate row template. |
| `DUPLICATE_ID` | A fixed ID appears inside the repeated template. |
| `GRID_SELECT`, `GRID_OPTIONS`, `GRID_FORMAT` | Invalid selection control, option markers/source, or a formatter on a Select or non-text input. |
| `GRID_ERROR_REGION` | Repeated or unmatched `data-error-for` path in the template. |
| `GRID_FILE_ROWS` | A bound file input cannot be stored in JSON `Rows`. |
| `GRID_CONTROL` | A bound radio input has no selected-value binding in M5. |
| `GRID_ROW`, `GRID_DISPOSED` | Missing/deleted row or use after disposal. |
| `RULE_DECLARATION`, `RULE_UNKNOWN`, `RULE_ARGUMENT`, `RULE_FAILED` | Invalid, unavailable, malformed, or failed rule. |
| `FIELD_PATH` | Unsafe path or nested write through a non-object. |

`RowId` is neither a DOM ID nor a display index. The M5 Grid validates text fields and displays a bound checkbox from a raw boolean, but does not write input or checkbox edits. Authors should mark display-only checkboxes `disabled` until M6 adds editing. A bound file input or radio input is rejected before cloning; upload handling and radio groups stay outside the M5 Grid. `data-format` is accepted only on text-like inputs, textareas, and text elements, so it cannot silently change a number, date, checkbox, or hidden control. Full Grid text editing and authored controls belong to M6. An error region and a field must use the same exact path. A Select's `data-options` names its option array; `data-field` names its selected scalar.[^grid]

# Related

[Rows](data.md) owns identity and changes. [UI contracts](ui.md) defines `RuleSet`, handles, and results. [Form](form.md) shares the private rule runner. [The M5 plan](../implementation/m5-plan.md) records this milestone's migration scope.

[^grid]: Grid binding and validation runtime
[^rules]: Shared Form/Grid rule runner
[^path]: Safe nested field paths