---
type: UI Component
title: bindGrid
description: Bind an authored native table to Rows with independent selection and checks, authored sort/filter controls, cell editing, and accessible validation.
tags: [ui, grid, binding, accessibility]
status: draft
symbols: [bindGrid, GridIdsChange, GridRowScope, GridCheckState, GridFilterChoice]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public UI entry and Grid handle types
    git_blob: c98a8f30607b9c026fbd60574ef65b6129b796e1
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid binding and validation runtime
    git_blob: a2b3ec849f3595369370a2201aac3b99c9da0d2f
  - id: columns
    resource: ../../src/ui/grid-columns.ts
    title: Private native column topology and resize ownership
    git_blob: 320875af9ad09ea42e98898a1f745b3cec69d652
  - id: selection
    resource: ../../src/ui/grid-selection.ts
    title: Private active identity, membership, eligibility, and transition ordering
    git_blob: ad63db1a070132c0ab9eca715bbe994ed010663c
  - id: filters
    resource: ../../src/ui/grid-filters.ts
    title: Private scalar column filters and choice counts
    git_blob: fd1b4b22060a716b1351e8c3029f76c0b0ca3964
  - id: select
    resource: ../../src/ui/select.ts
    title: Native Select binding reused for header filters
    git_blob: 4160eb77722751aad730fb997a4f0b07a967bd1e
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
generated: { by: codex/gpt-6, at: 2026-10-18T09:59:03Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-25T00:41:28Z }
  - { by: codex/gpt-6, at: 2026-10-18T09:59:03Z }
---

`bindGrid` adds behavior to a native table and a caller-owned `Rows` store. It clones one authored row template, keeps active detail identity, selected membership, checked membership and invalid cell drafts under store-local `RowId` values, and never uses DOM IDs as row or field keys. The three selection states are independent.[^grid][^selection]

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

`bindGrid<T extends object>(root, options): GridHandle<T>` requires an `HTMLTableElement` with exactly one `<tbody><tr data-row-template>` across all bodies. The options below require `rows: Rows<T>`. The template and its descendants must not have fixed DOM IDs. The runtime temporarily replaces that row with a comment anchor, reuses clones for rows that remain visible, releases offscreen row elements and Select ownership after each view change, and recreates them when those rows return. It restores the original template on disposal. It leaves other authored table rows in place. A second live binding of the table raises `GRID_IN_USE`.[^grid]

| Option | Behavior |
|---|---|
| `rows` | Required caller-owned store of immutable snapshots and row identities. |
| `initialPage` | Optional `{ page, size }` applied before the first render. Defaults to all rows; use it to bound initial local DOM work. |
| `rules` | Optional component-local formatter/validator overrides, messages, and locale. The shared rule runner also resolves retained built-in names. |
| `parse` | Optional application parser per editable field path, used to turn an entered string into a raw JSON value. A number input requires one. |
| `columns` | Optional full column state; each key appears exactly once in display order. Template `data-column` also enables management with authored defaults. |
| `onColumnsChange` | Optional callback after committed layout changes; programmatic changes pass `event: null`. |
| `onSelect` | `({ id, row, event }) => void` after active detail identity changes; `id` and `row` may be `null`. It does not report selected or checked membership. |
| `multiple` | Optional boolean, default `false`. Enables batch mouse/keyboard gestures on row selection buttons; full-set methods work in both modes. |
| `canSelect` | `(row: RowSnapshot<T>) => boolean`; eligibility for active detail and selected membership, default all nondeleted rows. |
| `canCheck` | `(row: RowSnapshot<T>) => boolean`; checked membership eligibility, default all nondeleted rows. |
| `beforeSelect` | `({ id, row, event }) => boolean \| void` before active detail identity changes. |
| `beforeSelectionChange` | `(change: GridIdsChange) => boolean \| void` before selected membership changes. |
| `onSelectionChange` | `(change: GridIdsChange) => void` after selected membership commits. |
| `beforeCheckChange` | `(change: GridIdsChange) => boolean \| void` before checked membership changes. |
| `onCheckChange` | `(change: GridIdsChange) => void` after checked membership commits. |
| `sorts` | `Record<string, (a: Snapshot<T>, b: Snapshot<T>) => number>` for authored header sort buttons. |
| `filters` | `Record<string, { value: (row: Snapshot<T>) => SelectValue; label?: (value: SelectValue) => string }>` for scalar column filters. |
| `onRowAction` | `({ action, id, row, element, event }) => void` for named row buttons; `row` is the current `RowSnapshot<T>` and `element` is the activated `HTMLButtonElement`. |

Eligibility callbacks must return strict booleans. Keep eligibility, comparator, predicate, filter-value and filter-label callbacks pure: they may run during rendering, validation of a proposal, or choice queries. A native authored `disabled` control prevents that UI gesture; it does not exclude an otherwise eligible row from programmatic full-set or scoped operations. Use `canSelect` or `canCheck` for data eligibility.[^grid][^selection][^filters]

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
| `data-select-row` | Row button | `type="button"`; activates detail identity, with batch gestures when `multiple: true`. `aria-pressed` reflects active identity in default mode and batch membership in multiple mode; multiple mode also marks the active button with `aria-current="true"`. |
| `data-check-row` | Row checkbox | Native `input type="checkbox"` for checked membership; must not carry `data-field`. |
| `data-check-all="visible\|filtered\|store"` | Header checkbox | Native checkbox with an explicit scope, separate from `data-field`; reflects full, mixed and empty scope state. |
| `data-sort-column="key"` | Header button in a `th` | `type="button"`; requires a matching `sorts` entry and cycles ascending, descending, clear. |
| `data-filter-column="key"` | Header `select multiple` | Requires a matching `filters` entry; binds raw choices through the existing Select component. |
| `data-filter-search="key"` | Header text/search input | Narrows matching choice labels without changing row filtering. |
| `data-clear-filter="key"` | Header button | `type="button"`; resets this column filter to `null`. |
| `data-row-action="name"` | Row button | Named `type="button"` action requiring `onRowAction`; cannot also be `data-select-row` and does not implicitly select or check. |
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

`select(id)` activates an existing, nondeleted, `canSelect`-eligible row (visible or filtered out), or clears active detail identity with `null`. An unavailable ID raises `GRID_ROW`; ineligibility raises `GRID_SELECTION`. `selected()` returns that store-local ID or `null`. These methods and `onSelect` preserve the Grid/List/Form active-detail contract and never alter either membership set. Sorting, filtering and paging preserve the active ID; removal or lost eligibility clears it.[^grid][^selection]

## `selectedIds()` / `setSelected(ids)` and `checkedIds()` / `setChecked(ids)`

The getters return frozen arrays in store order. Each setter replaces its entire independent set in every mode, including IDs outside the visible page. It validates the complete array before changing state: duplicate, missing/deleted or ineligible IDs reject the whole proposal. Selected membership uses `canSelect`; checked membership uses `canCheck`. Neither setter changes active detail identity or the other set, and none of these state changes edits Rows.[^selection]

## `checkAll(checked, scope)` and `checkState(scope)`

Both require an explicit `GridRowScope`; there is no default scope.[^selection]

| Scope | Rows considered before `canCheck` |
|---|---|
| `"visible"` | Current sorted, filtered page; all filtered rows when local paging is off. |
| `"filtered"` | All rows passing the manual filter and every active column filter, before paging. |
| `"store"` | All nondeleted rows, regardless of filters or paging. |

`checkAll(true, scope)` adds every eligible ID in that scope; `false` removes only those IDs. Checks outside the scope remain. `checkState` returns a frozen `GridCheckState`: `{ checked, indeterminate, total, count }`, where `total` counts eligible scope rows and `count` counts their checked IDs. `checked` means a nonempty scope is fully checked; `indeterminate` means some but not all are checked. An empty scope has both flags false. A header checkbox is disabled for an empty eligible scope and otherwise preserves authored disabling. Boolean `data-field` editors remain independent.[^grid][^selection]

## `columnFilter(key)`, `setColumnFilter(key, values)` and `filterChoices(key, search?)`

Column keys must be configured in `filters`. `columnFilter` returns a frozen raw scalar array or `null`. `setColumnFilter` accepts a complete array of strings, finite numbers, booleans or `null`; duplicates are normalized. `null` means all values, `[]` means none, and `[null]` means only the raw null value. Numeric `1` and string `"1"` remain distinct. Column predicates combine with AND and with the separate predicate from `setFilter`.[^filters]

`filterChoices` returns a frozen array of frozen `GridFilterChoice` values, `{ value, label, count }`, in first store-occurrence order. Counts apply the manual predicate and every other column filter, exclude this column's own filter, and ignore paging. Without a label function, labels use `String(value ?? "")`. Optional search is a case-insensitive label substring; it narrows choices only and leaves filter state unchanged.[^filters]

Authored filter selects display `label (count)` through `bindSelect`. Editing the displayed choices preserves selected raw values hidden by the current search or other filters. Resetting the column sets `null`; it does not clear the search input. Original Select nodes, selection and ownership are restored on disposal or failed binding; do not bind the same control separately while Grid owns it.[^grid][^select]

## `setSort(compare, indicator?)` and `setFilter(predicate)`

`compare(a, b)` receives immutable row values; a predicate receives one immutable row value. Pass `null` to clear either operation. A sort indicator may specify a `<th>` in this table's `<thead>` and `direction: "ascending" | "descending"`; the Grid sets its `aria-sort` and restores the prior attribute when the indicator changes or disposal occurs. The application supplies the comparator and keeps the indicator consistent with it. Authored `data-sort-column` buttons reuse this sorting path and configured comparators. Sorting and filtering preserve active identity, both membership sets, and row-keyed drafts.[^grid]

## `setPage(request)` and `page()`

`initialPage: { page, size }` applies the same local slice before the first render. `setPage({ page, size })` changes it later; `null` shows all rows. Page and size must be positive safe integers (`GRID_PAGE`) for either entry point. An invalid `initialPage` fails before the authored template changes. If a later page exposes a formatter or row-option error, `setPage` keeps the previous page state and visible rows, releases the failed row clones, and can be retried after the data or rule is fixed. `page()` returns a frozen `{ page, size, total, pages }` or `null` when local paging is off. If the current page exceeds the new result count, it clamps to the last page; an empty result has page 1 and 0 pages. Selection and drafts remain keyed to Rows IDs even when off-page.[^grid]

## `validate(id?)`

Returns `{ valid, issues }` for an explicit nondeleted ID or all nondeleted rows, including filtered-out or off-page rows. It checks supported input HTML constraints (including programmatically bound text length limits), parsers and validators, Select availability, Select `required`, and Select validators. A missing or deleted explicit ID raises `GRID_ROW`. An issue has `rowId`, `field`, `rule`, and `message`; `element` exists only for a connected row control. Validation evaluates all cell drafts for one row against the same candidate values, even while the row is filtered out. A draft that passes is committed to `Rows`; a failed draft stays outside the store. Call `validate()` before saving to reconcile drafts after external row changes.[^grid][^rules]

## `dispose()`

Removes delegated listeners and visible cloned rows, unsubscribes from `Rows`, clears drafts, cached issue text, and Select ownership, and restores the untouched row template, authored sort state, header checkbox checked/mixed/disabled state, filter Select nodes and selected options, column/cell/group order, spans/styles, and resize button attributes. It cancels previews and releases document listeners, pointer capture and animation frames. Failed binding also releases acquired ownership and restores authored controls for retry. It does not dispose the caller-owned store. Repeated disposal is safe; other methods then raise `GRID_DISPOSED`.[^grid][^select]

# Events

| Handler | Signature and timing | `this` |
|---|---|---|
| `beforeSelect` | `({ id, row, event }) => boolean \| void`, before active identity changes | Not a controller binding |
| `beforeSelectionChange`, `beforeCheckChange` | `(change: GridIdsChange) => boolean \| void`, before the corresponding membership changes | Not a controller binding |
| `onSelect` | `({ id, row, event }) => void`, after active identity commits | Not a controller binding |
| `onSelectionChange`, `onCheckChange` | `(change: GridIdsChange) => void`, after state and checkbox/button DOM commit | Not a controller binding |
| `onRowAction` | `({ action, id, row, element, event }) => void`, resolving the current row snapshot at activation | Not a controller binding |
| `onColumnsChange` | `({ columns, event }) => void`, after one effective committed change; immutable state and native keydown/pointerup, or `null` for `setColumns` | Not a controller binding |

Initial binding, equal state, canceled preview and disposal do not emit column changes. Callback errors propagate after the new state is committed; do not retry assuming rollback.[^columns]

`GridIdsChange` contains frozen `ids` and `previous` arrays plus `event`. Programmatic transitions and forced pruning pass `null`; user gestures retain their native event. Before hooks accept only `false`, `true` or `undefined`: `false` vetoes the complete proposal, preserving active identity, membership, DOM and range anchor. Other return values raise `GRID_SELECTION` or `GRID_CHECK`. A vetoed Shift keyboard move also preserves focus. Before hooks see prior state; post callbacks see committed state. If a before hook changes selection/check state, Rows, or the sort/filter/page view, the stale outer proposal throws even if its projected IDs are identical; the successful inner change remains.[^selection][^grid]

Deleting/replacing Rows or changing eligibility prunes unavailable state without consulting veto hooks. Prune notifications run after row DOM and visible/filtered scopes finish committing, so a callback can make a later Rows/view change without resurrecting deleted rows. A post callback error propagates with state and cleanup committed; later callbacks in that notification sequence may not run. Pure view or membership changes do not emit Rows notifications.[^selection][^grid]

# Behavior

Managed columns compile native topology once. They move original header/footer cells, maintain visible group colspan and reorder expanded native cols. Hidden cells, cols and empty groups leave the connected table model. A scope="colgroup" cell must match an authored native colgroup membership. Header/footer rows must cover all template keys, including carried rowspans; authored `rowspan` remains unchanged. The original repeated template is never moved or altered. Data field indices are captured before applying column order to a clone.[^columns][^grid]

Widths follow native CSS table/minimum-content constraints. When all visible columns have explicit widths the runtime prefers their sum as table width; otherwise it restores the original table-width preference. Authors choose table layout, responsive scroll containment, sticky positioning and visual resize affordances in CSS. Resize controls receive owned `touch-action: none`, `user-select: none` and `aria-keyshortcuts` if absent; disposal restores originals. ArrowLeft/ArrowRight adjust 10 pixels, Shift adjusts 1, and Home restores the initial preferred width. Pointer previews publish one change at release; Escape/cancel restores the prior state. Move preserves focus/caret; hiding focused content tries available visible controls then the table. Detached hidden controls are still validated through row-keyed drafts, but issues omit a disconnected element.[^columns][^grid]

Text formatting is one-way: rules transform displayed text while the row snapshot and save payload retain the raw value. Validation invokes the shared UI rule runner on raw values. A Select option's DOM `value` is a string, but its row-local mapping preserves a raw string, finite number, boolean, or `null`. Authored empty options map to `null`; nonempty authored options remain strings. A missing selected raw value shows no selected option and yields `select-option`.[^grid][^rules]

When a user types in a supported input, the Grid retains the entered draft and validates it; a native `change` commits valid text, checkbox, number, or Select candidates. A parser receives the entered string and one snapshot of all unparsed row drafts, independent of parser order; declared validators receive each parsed field value as a string, with the combined typed candidate in `RuleContext.values`. A throw or `undefined` creates a `parse` issue and preserves the draft. The Grid checks all fields against the row value plus every draft for that row. A choice that fails stays visible as a draft under that row ID and field path, while `Rows` remains unchanged. A later field change can make cross-field drafts valid and commit them. Changing another row field does not clear the draft. Programmatic `Rows` updates refresh the display and clear stale error text without invoking user validators; call `validate()` before saving. Validation message text is kept by `RowId` without DOM references, so a failing off-page row shows its issue again when it returns. An external replacement of a drafted field, `replace`, `remove`, `revert`, or `dispose` clears the affected drafts. Filtering, sorting, and paging keep them. `validate(id)` checks drafts even without a rendered row.[^grid]

Each cloned `data-error-for` region receives a document-unique ID and `aria-live="polite"` if not authored. The matching field control includes that ID in `aria-describedby`; failed validation sets `aria-invalid="true"` and writes issue text. A pass restores the control's authored `aria-invalid` state. The table retains native semantics and does not acquire `role="grid"`. When the focused row leaves the visible slice, focus moves to another available control, header button, or the table root. Authors still provide labels and table headings.[^grid]

With `multiple: false`, row buttons keep their existing active-detail behavior. With `multiple: true`, a plain activation replaces selected membership, Ctrl/Meta toggles one ID, Shift replaces it with the eligible range in current visible page order, and Ctrl/Meta+Shift adds that range. Range selection excludes `canSelect`-ineligible rows; an anchor outside the page cannot extend across pages. ArrowUp/ArrowDown/Home/End move focus among eligible visible selection buttons; adding Shift also selects the range, starting from the focused row when no visible anchor exists. Ctrl/Meta+A replaces membership with eligible visible IDs, and Escape clears membership while retaining active detail identity. Enter/Space use native button activation; checkboxes and header controls keep native keyboard behavior. These Grid shortcuts apply only while a row selection button has focus, preserving editor shortcuts.[^grid][^selection]

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
| `GRID_SELECTION`, `GRID_CHECK` | Invalid mode/callback/eligibility result, ID batch, before-hook result, check scope/flag, or stale reentrant transition. |
| `GRID_FILTER` | Unknown column key, invalid scalar filter/value/label/search, predicate, or authored filter control. |
| `GRID_ACTION` | Invalid action callback or named row action button. |
| `GRID_ROW`, `GRID_DISPOSED` | Missing/deleted row or use after disposal. |
| `SELECT_OWNED` | Trying to bind a Grid-owned Select again. |
| `RULE_DECLARATION`, `RULE_UNKNOWN`, `RULE_ARGUMENT`, `RULE_FAILED` | Invalid, unavailable, malformed, or failed rule. |
| `FIELD_PATH` | Unsafe path or nested write through a non-object. |

`RowId` is neither a DOM ID nor a display index. Grid edits text-like inputs, textareas, checkboxes, and number inputs with an application parser. It rejects radio, file, unsupported input types, and row-field multiple Selects; use Form for those. Header filter Selects are authored `multiple` controls with their own column-filter contract. A plain `data-field` text element displays data without editing it. `data-format` is only for text-like inputs, textareas, and text elements. An error region and field must use the same exact path. A Select's `data-options` names its row-local option array; `data-field` names its selected scalar. A Select owned by Grid cannot also be bound with `bindSelect`. Without `initialPage`, `bindGrid` creates all row clones before the caller can set a local page. Pass `initialPage` for a large local store to create only its first visible slice. Off-page formatter errors surface when that row first renders; invalid row-local options surface on display or `validate(id)`. Calling `setPage(null)` deliberately renders all rows; measure that cost or use application-owned server pages.[^grid][^owner]

# Related

[Rows](data.md) owns identity and changes. [UI contracts](ui.md) defines `RuleSet`, handles, and results. [Form](form.md) shares the private rule runner. [Pagination](pagination.md) can use `grid.page()`. [The M6 plan](../implementation/m6-plan.md) records this milestone's migration scope. [The interactive Grid demo](grid-demo.md) exercises every implemented option, method, and declarative marker. [The two-layout example](advanced-grid-example.md) shows grouped headings and sticky positioning with authored HTML/CSS and no new API.

[^columns]: Private native column topology and resize ownership
[^selection]: Private active identity, membership, eligibility, and transition ordering
[^filters]: Private scalar column filters and choice counts
[^select]: Native Select binding reused for header filters
[^grid]: Grid binding and validation runtime
[^rules]: Shared Form/Grid rule runner
[^path]: Safe nested field paths
[^options]: Shared private row-local options
[^owner]: Shared Select ownership
