---
type: UI Component
title: bindGrid
description: Bind an authored native table to Rows with measured viewport rendering, independent selection and checks, atomic paste, and accessible validation.
tags: [ui, grid, binding, accessibility]
status: draft
symbols: [bindGrid, GridIdsChange, GridRowScope, GridCheckState, GridFilterChoice]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public UI entry and Grid handle types
    git_blob: 6610eb68f3b484b5eccd323c116ceef61d21b8db
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid binding and validation runtime
    git_blob: 5d19633080503208065e451156cb9bc50c56fb07
  - id: columns
    resource: ../../src/ui/grid-columns.ts
    title: Private native column topology and resize ownership
    git_blob: 320875af9ad09ea42e98898a1f745b3cec69d652
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Private measured viewport, anchoring, spacers and lifetime
    git_blob: 4a6d52ef382fb5da76a8fe47d4bfafbd3b6a1b1f
  - id: viewport-browser
    resource: ../../tests/browser/grid-viewport.spec.ts
    title: Logical scopes, bounded DOM, focus, measurements and lifecycle regressions
    git_blob: 94b18cca941e2a8e5003c91a0346d4c07fa9b0cd
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
generated: { by: codex/gpt-6, at: 2026-10-18T11:23:05Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-25T00:41:28Z }
  - { by: codex/gpt-6, at: 2026-10-18T11:23:05Z }
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

`bindGrid<T extends object>(root, options): GridHandle<T>` requires an `HTMLTableElement` with exactly one `<tbody><tr data-row-template>` across all bodies. The options below require `rows: Rows<T>`. The template and its descendants must not have fixed DOM IDs. The runtime temporarily replaces that row with a comment anchor, reuses clones that remain mounted, releases departing row elements and Select ownership, and recreates them when needed. Without `viewport`, the mounted set is the complete logical page. It restores the original template on disposal and leaves other authored table rows in place. A second live binding raises `GRID_IN_USE`.[^grid]

| Option | Behavior |
|---|---|
| `rows` | Required caller-owned store of immutable snapshots and row identities. |
| `initialPage` | Optional `{ page, size }` applied before the first render. Defaults to all rows; use it to bound initial local DOM work. |
| `viewport` | Optional `{ root: HTMLElement, estimate: number, overscan?: number }`; the distinct same-document ancestor scroll root supplies finite authored height/overflow. Estimate is a positive finite initial row height in CSS pixels; overscan is a nonnegative safe integer count, default 3. |
| `rules` | Optional component-local formatter/validator overrides, messages, and locale. The shared rule runner also resolves retained built-in names. |
| `parse` | Optional application parser per unique non-checkbox text/display field path, used to turn an entered string into a raw JSON value. A number input requires one. |
| `paste` | Optional boolean, default `false`; enables delegated native `text/plain` paste into bound row fields and safe focusability for plain display fields. The `paste` method is available independently. |
| `onPaste` | `(result: ValidationResult) => void` after an API or native paste returns a validation result, including rejection. It is not called when preparation or a committed observer throws. |
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

Field and option paths reject array indices, expressions, prototype keys, and empty segments. The Grid compiles field descriptors once, keeps row element references only for mounted clones, and updates their fields when raw values change. A nested field edit copies the affected object path and calls `Rows.set` for its top-level field.[^grid][^path]

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

## `reveal(id)`

Scrolls a nondeleted row in the current sorted, filtered logical page into view without changing active identity, either membership set, or focus. A filtered-out, off-page, missing or deleted ID raises `GRID_VIEWPORT_ROW`; the caller changes filtering/paging explicitly. With `viewport`, the row is mounted using estimates and corrected measurements, scrolling to the nearest edge when needed. Authored top-sticky headers are included in the usable viewport; left-only sticky positioning does not reduce its height. Without `viewport`, the existing row uses native nearest scrolling.[^grid][^viewport]

## `paste(text, { id, field })`

Returns `ValidationResult` for a synchronous, whole-field paste starting at a logical-page `RowId` and exact `data-field` path. The method works without enabling native paste. Rows advance through the current sorted, filtered page; fields advance in current visible column order, then authored order within each cell. Managed hidden columns and `[hidden]` fields are excluded. Display-only text fields participate, while check/action columns without `data-field` do not consume clipboard positions. Visible field paths must be unique. With `viewport`, the start and target rows need not be mounted. A start outside this logical field/row set raises `GRID_PASTE_TARGET`.[^grid]

```ts
const result = grid.paste("ada@example.com\tPlatform\ngrace@example.com\tSupport", {
  id: firstVisibleId, field: "email"
});
if (!result.valid) console.log(result.issues);
```

The example requires Email and Team to be consecutive bound fields in the current layout. There is no implicit field-name header, business-key lookup, row creation, automatic page advance or silent truncation. Rectangular and ragged tab-separated rows are accepted; shorter rows leave unsupplied fields unchanged. Double quotes enclose a whole cell, `""` escapes a quote inside it, and quoted tabs/newlines stay inside that cell. CRLF and CR normalize to newlines; a final line terminator does not add an extra row. Empty text represents one empty cell. Malformed quoting and any row/field overflow return a `paste` issue with no stored changes. Clipboard HTML is never evaluated.[^grid]

Disabled native controls, readonly inputs/textareas and fields under `inert` or `aria-readonly="true"` consume a clipboard position but are not written. This preserves column alignment. Checkbox text must be exactly `true` or `false`. A Select cell matches text to `String(rawValue ?? "")` among its currently enabled options, preserving its raw string, finite number, boolean or null type. Unknown or disabled values fail; two different raw values with the same serialization, such as number `1` and string `"1"`, are ambiguous and fail. Raw identity uses `Object.is`, including the distinction between `0` and `-0`. Display labels are not converters. Row-local nested option arrays use the same binding as normal Select editing.[^grid]

Pasted fields overlay existing drafts for each affected row. Existing parsers see one combined unparsed candidate; HTML constraints and rules check the complete parsed row, including unrelated drafts and bound fields outside the pasted range. Only supplied writable fields are committed, with copied nested paths preserving other stored values. An unrelated valid draft is considered during validation but is not saved by paste. Any validation failure leaves stored values, drafts, entered input, selection and focus intact; returned issues identify `rowId`, `field`, `rule`, `message` and a connected `element` when present. Accessible messages merge with existing field errors instead of erasing them.[^grid]

A successful paste uses one `Rows.setMany` change, preserving row IDs and dirty tracking; a net no-op emits no Rows event. Other Forms, Grids, Lists and Trees receive the coherent batch. The originating Grid clears only its captured pasted drafts, preserves newer subscriber-created drafts/errors, and then renders the committed view, which may move or hide rows if a sort/filter depends on a changed value. Keep parser and rule callbacks pure. A callback changing Rows, view, columns or drafts invalidates preparation with `GRID_PASTE_STALE`; reentrant paste raises `GRID_PASTE_BUSY`, and disposal raises `GRID_DISPOSED`. Application callback side effects are not rolled back. A subscriber/render/`onPaste` error after commit propagates with the stored batch retained; inspect current state before retrying.[^grid]

Parsers must return JSON-compatible raw values. Returning `undefined` reports a parse issue; other invalid JSON values such as `Date`, `NaN`, functions or cycles fail with `ROW_VALUE` at `Rows.setMany` before commit. This exception preserves input/drafts and skips `onPaste`; it is not a returned validation result.[^grid]

With `paste: true`, an uncanceled native event carrying `text/plain` in a bound row field is intercepted and runs this same operation. It replaces complete field values rather than inserting at a text caret. A plain display field without authored `tabindex` gains `tabindex="0"` on its clone unless it is inside an interactive ancestor; existing interactive controls keep their own focus behavior. No extra tab stop is added inside a row button. A row control containing exactly one bound display field can also be the paste target. An earlier `preventDefault()` is respected. Without the option, native editing and caret paste remain browser behavior; the method is still available.[^grid]

## `dispose()`

Removes delegated listeners and mounted clones, unsubscribes from `Rows`, clears drafts, cached issue text, detached validation probes and Select ownership, and restores the untouched row template, authored sort state, header checkbox checked/mixed/disabled state, filter Select nodes and selected options, column/cell/group order, spans/styles, and resize button attributes. Viewport disposal removes owned spacers, disconnects measurement observers, cancels pending frames and restores authored row-count/index attributes and overflow anchoring. It also cancels resize previews and releases document listeners and pointer capture. Failed binding releases acquired ownership and restores authored controls for retry. It does not dispose the caller-owned store. Repeated disposal is safe; other methods then raise `GRID_DISPOSED`.[^grid][^select][^viewport]

# Events

| Handler | Signature and timing | `this` |
|---|---|---|
| `beforeSelect` | `({ id, row, event }) => boolean \| void`, before active identity changes | Not a controller binding |
| `beforeSelectionChange`, `beforeCheckChange` | `(change: GridIdsChange) => boolean \| void`, before the corresponding membership changes | Not a controller binding |
| `onSelect` | `({ id, row, event }) => void`, after active identity commits | Not a controller binding |
| `onSelectionChange`, `onCheckChange` | `(change: GridIdsChange) => void`, after state and checkbox/button DOM commit | Not a controller binding |
| `onRowAction` | `({ action, id, row, element, event }) => void`, resolving the current row snapshot at activation | Not a controller binding |
| `onColumnsChange` | `({ columns, event }) => void`, after one effective committed change; immutable state and native keydown/pointerup, or `null` for `setColumns` | Not a controller binding |
| `onPaste` | `(result: ValidationResult) => void`, after a completed API/native paste attempt; invalid results contain all collected issues | Not a controller binding |

Initial binding, equal state, canceled preview and disposal do not emit column changes. Callback errors propagate after the new state is committed; do not retry assuming rollback.[^columns]

`GridIdsChange` contains frozen `ids` and `previous` arrays plus `event`. Programmatic transitions and forced pruning pass `null`; user gestures retain their native event. Before hooks accept only `false`, `true` or `undefined`: `false` vetoes the complete proposal, preserving active identity, membership, DOM and range anchor. Other return values raise `GRID_SELECTION` or `GRID_CHECK`. A vetoed Shift keyboard move also preserves focus. Before hooks see prior state; post callbacks see committed state. If a before hook changes selection/check state, Rows, or the sort/filter/page view, the stale outer proposal throws even if its projected IDs are identical; the successful inner change remains.[^selection][^grid]

Deleting/replacing Rows or changing eligibility prunes unavailable state without consulting veto hooks. Prune notifications run after row DOM and visible/filtered scopes finish committing, so a callback can make a later Rows/view change without resurrecting deleted rows. A post callback error propagates with state and cleanup committed; later callbacks in that notification sequence may not run. Pure view or membership changes do not emit Rows notifications.[^selection][^grid]

# Behavior

## Measured viewport

```html
<div class="employee-scroll" role="region" aria-label="Employees" tabindex="0">
  <table class="employees"><!-- authored headings and one row template --></table>
</div>
```

```css
.employee-scroll { height: 400px; overflow: auto; }
.employees { width: 800px; table-layout: fixed; }
```

```ts
const grid = bindGrid(table, {
  rows, viewport: { root: scrollRegion, estimate: 48, overscan: 3 }
});
grid.reveal(rows.entries()[2500].id);
```

The scroll region, dimensions, column widths and visual design remain authored. A stable table width/`table-layout: fixed` or authored col widths avoid horizontal changes as different row content mounts; native minimum-content constraints still apply. `estimate` is a starting height, not clipping or a fixed-height requirement. ResizeObserver measures wrapping, controls and row height changes; width/column changes invalidate stale offscreen measurements. Scroll, resize and measurements coalesce in one animation frame, retaining the top row identity and intra-row position. Appending through Rows preserves existing IDs and anchoring. Hidden CVC roots start with a bounded estimated window and measure when shown.[^viewport][^viewport-browser]

The mounted set contains the intersecting logical rows, overscan on either side and at most one focused row. A distant focused editor stays attached with its input state and composition; disjoint spacer segments represent intervening rows without keeping their controls alive. Departing unfocused rows release element references and Select ownership. Drafts and issue text remain keyed by RowId. Scrolling changes this mounted set without rerunning application sort/filter callbacks. `"visible"` check scope, range selection, keyboard navigation and paste continue to use the complete logical page, rather than only connected rows. Keyboard row navigation reveals the target before focus; Tab/Shift+Tab can cross the mounted boundary while editor shortcuts remain native.[^grid][^viewport][^viewport-browser]

Offscreen paste and validation use compiled field paths, raw row-local option plans and cached detached native HTML-validation controls, rather than creating a row/Select for every target. Those plans do not mutate option sources or add state to Rows. Issues omit `element` when the corresponding control is not connected; callbacks must not require a DOM node for every logical row. Passing validation does not automatically reveal it.[^grid][^viewport-browser]

The table keeps native semantics. In viewport mode `aria-rowcount` includes the complete logical page and authored header, static body and footer rows; mounted data rows and static rows receive their corresponding one-based `aria-rowindex`. Owned native spacer rows are `aria-hidden="true"` and noninteractive. Other authored table rows remain in place. One template tr represents one RowId; template cells with `rowspan` other than 1 reject with `GRID_VIEWPORT_MARKUP` before ownership changes. Nonvirtual markup remains supported; grouped/merged logical row blocks remain required M10.9 work, not a retired feature.[^grid][^viewport][^viewport-browser]

## Columns, drafts and interaction

Managed columns compile native topology once. They move original header/footer cells, maintain visible group colspan and reorder expanded native cols. Hidden cells, cols and empty groups leave the connected table model. A scope="colgroup" cell must match an authored native colgroup membership. Header/footer rows must cover all template keys, including carried rowspans; authored `rowspan` remains unchanged. The original repeated template is never moved or altered. Data field indices are captured before applying column order to a clone.[^columns][^grid]

Widths follow native CSS table/minimum-content constraints. When all visible columns have explicit widths the runtime prefers their sum as table width; otherwise it restores the original table-width preference. Authors choose table layout, responsive scroll containment, sticky positioning and visual resize affordances in CSS. Resize controls receive owned `touch-action: none`, `user-select: none` and `aria-keyshortcuts` if absent; disposal restores originals. ArrowLeft/ArrowRight adjust 10 pixels, Shift adjusts 1, and Home restores the initial preferred width. Pointer previews publish one change at release; Escape/cancel restores the prior state. Move preserves focus/caret; hiding focused content tries available visible controls then the table. Detached hidden controls are still validated through row-keyed drafts, but issues omit a disconnected element.[^columns][^grid]

Text formatting is one-way: rules transform displayed text while the row snapshot and save payload retain the raw value. Validation invokes the shared UI rule runner on raw values. A Select option's DOM `value` is a string, but its row-local mapping preserves a raw string, finite number, boolean, or `null`. Authored empty options map to `null`; nonempty authored options remain strings. A missing selected raw value shows no selected option and yields `select-option`.[^grid][^rules]

When a user types in a supported input, the Grid retains the entered draft and validates it; a native `change` commits valid text, checkbox, number, or Select candidates. A parser receives the entered string and one snapshot of all unparsed row drafts, independent of parser order; declared validators receive each parsed field value as a string, with the combined typed candidate in `RuleContext.values`. A throw or `undefined` creates a `parse` issue and preserves the draft. The Grid checks all fields against the row value plus every draft for that row. A choice that fails stays visible as a draft under that row ID and field path, while `Rows` remains unchanged. A later field change can make cross-field drafts valid and commit them. Changing another row field does not clear the draft. Programmatic `Rows` updates refresh the display and clear stale error text without invoking user validators; call `validate()` before saving. Validation message text is kept by `RowId` without DOM references, so a failing off-page row shows its issue again when it returns. An external replacement of a drafted field, `replace`, `remove`, `revert`, or `dispose` clears the affected drafts. Filtering, sorting, and paging keep them. `validate(id)` checks drafts even without a rendered row.[^grid]

Each cloned `data-error-for` region receives a document-unique ID and `aria-live="polite"` if not authored. The matching field control includes that ID in `aria-describedby`; failed validation sets `aria-invalid="true"` and writes issue text. A pass restores the control's authored `aria-invalid` state. The table retains native semantics and does not acquire `role="grid"`. When the focused row leaves the visible slice, focus moves to another available control, header button, or the table root. Authors still provide labels and table headings.[^grid]

With `multiple: false`, row buttons keep their existing active-detail behavior. With `multiple: true`, a plain activation replaces selected membership, Ctrl/Meta toggles one ID, Shift replaces it with the eligible range in current visible page order, and Ctrl/Meta+Shift adds that range. Range selection excludes `canSelect`-ineligible rows; an anchor outside the page cannot extend across pages. ArrowUp/ArrowDown/Home/End move focus among eligible logical-page selection buttons, revealing offscreen targets in viewport mode; adding Shift also selects the range, starting from the focused row when no visible anchor exists. Ctrl/Meta+A replaces membership with eligible visible IDs, and Escape clears membership while retaining active detail identity. Enter/Space use native button activation; checkboxes and header controls keep native keyboard behavior. These Grid shortcuts apply only while a row selection button has focus, preserving editor shortcuts.[^grid][^selection]

# Pitfalls

| Code | Cause |
|---|---|
| `GRID_ROOT`, `GRID_TEMPLATE`, `GRID_IN_USE` | Wrong table root, missing/duplicate row template, or a second live binding. |
| `DUPLICATE_ID` | A fixed ID appears inside the repeated template. |
| `GRID_SELECT`, `GRID_OPTIONS`, `GRID_FORMAT` | Invalid selection control, option markers/source, or formatter on a Select or non-text input. |
| `GRID_ERROR_REGION` | Repeated or unmatched `data-error-for` path in the template. |
| `GRID_FILE_ROWS`, `GRID_CONTROL` | Bound file/radio input, multiple Select, or unsupported input control. |
| `GRID_PARSE_FIELD` | A number input lacks a parser, or a parser is not a function or names a missing/repeated text field or checkbox. |
| `GRID_COLUMNS`, `GRID_COLUMN_MARKUP` | Invalid full state/callback, broken column keys/group membership/spans, or malformed resize control. |
| `GRID_SORT`, `GRID_PAGE` | Invalid sort indicator/comparator or local page request. |
| `GRID_VIEWPORT`, `GRID_VIEWPORT_MARKUP`, `GRID_VIEWPORT_ROW` | Invalid viewport root/estimate/overscan, a multi-row template span in viewport mode, or reveal outside the current logical page. |
| `GRID_SELECTION`, `GRID_CHECK` | Invalid mode/callback/eligibility result, ID batch, before-hook result, check scope/flag, or stale reentrant transition. |
| `GRID_FILTER` | Unknown column key, invalid scalar filter/value/label/search, predicate, or authored filter control. |
| `GRID_ACTION` | Invalid action callback or named row action button. |
| `GRID_PASTE` | Invalid native-paste option or result callback. |
| `GRID_PASTE_TEXT`, `GRID_PASTE_TARGET` | Non-string API input, malformed quoted TSV, or missing/nonvisible/ambiguous start. Malformed TSV becomes a returned `paste` issue; invalid API input or target throws. |
| `GRID_PASTE_BUSY`, `GRID_PASTE_STALE` | Reentrant preparation or a callback changing the captured store, view, layout or drafts. |
| `GRID_ROW`, `GRID_DISPOSED` | Missing/deleted row or use after disposal. |
| `SELECT_OWNED` | Trying to bind a Grid-owned Select again. |
| `RULE_DECLARATION`, `RULE_UNKNOWN`, `RULE_ARGUMENT`, `RULE_FAILED` | Invalid, unavailable, malformed, or failed rule. |
| `FIELD_PATH` | Unsafe path or nested write through a non-object. |

`RowId` is neither a DOM ID nor a display index. Grid edits text-like inputs, textareas, checkboxes, and number inputs with an application parser. It rejects radio, file, unsupported input types, and row-field multiple Selects; use Form for those. Header filter Selects are authored `multiple` controls with their own column-filter contract. A plain `data-field` text element has no generated editor; it can still receive whole-field clipboard/API paste. `data-format` is only for text-like inputs, textareas, and text elements. An error region and field must use the same exact path. A Select's `data-options` names its row-local option array; `data-field` names its selected scalar. A Select owned by Grid cannot also be bound with `bindSelect`. Without either `initialPage` or `viewport`, binding creates all row clones. Local paging limits the logical page; viewport limits its mounted DOM. `setPage(null)` keeps viewport rendering bounded when enabled, otherwise deliberately renders all rows. Offscreen formatter errors surface when a row mounts; invalid row-local options also surface on validation/paste. Rendering can fail while scrolling or revealing a previously unmounted bad row: fix the source/rule before retrying. Progressive loading and transport cancellation stay in the application/page layer; virtualization does not reduce the Rows store itself.[^grid][^owner][^viewport]

# Related

[Rows](data.md) owns identity and changes. [UI contracts](ui.md) defines `RuleSet`, handles, and results. [Form](form.md) shares the private rule runner. [Pagination](pagination.md) can use `grid.page()`. [The M6 plan](../implementation/m6-plan.md) records this milestone's migration scope. [The interactive Grid demo](grid-demo.md) exercises every implemented option, method, and declarative marker. [The two-layout example](advanced-grid-example.md) shows grouped headings and sticky positioning with authored HTML/CSS and no new API.

[^columns]: Private native column topology and resize ownership
[^viewport]: Private measured viewport, anchoring, spacers and lifetime
[^viewport-browser]: Logical scopes, bounded DOM, focus, measurements and lifecycle regressions
[^selection]: Private active identity, membership, eligibility, and transition ordering
[^filters]: Private scalar column filters and choice counts
[^select]: Native Select binding reused for header filters
[^grid]: Grid binding and validation runtime
[^rules]: Shared Form/Grid rule runner
[^path]: Safe nested field paths
[^options]: Shared private row-local options
[^owner]: Shared Select ownership
