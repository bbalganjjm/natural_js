---
type: UI Component
title: bindGrid
description: Bind authored table records with status views, raw field-change flags, owned row hooks, native defaults, bounded rendering, paste, and accessible validation.
tags: [ui, grid, binding, accessibility]
status: draft
symbols: [bindGrid, GridIdsChange, GridRowScope, GridCheckState, GridFilterChoice]
sources:
  - id: progressive-browser
    resource: ../../tests/browser/grid-progressive.spec.ts
    title: Cooperative completion, cancellation, callback and bounded-work regressions
    git_blob: 46ea6fc25e2abbccdddb7fbb0e8ad6f96748929f
  - id: filter-browser
    resource: ../../tests/browser/grid-filter-apply.spec.ts
    title: Applied search, zero counts and callback ownership regressions
    git_blob: 3b343f4fd1a39c9ca575972bf980f74b4d8bf6cf
  - id: toggle-browser
    resource: ../../tests/browser/grid-toggle.spec.ts
    title: Native selection toggle, veto and lifecycle regressions
    git_blob: 12977459c39dd2231fd215d7fa8fd47e651619c1
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public UI entry and Grid handle types
    git_blob: 319506aca6ac79028701b31fba51239ed8e3d9d0
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid binding and validation runtime
    git_blob: 625fc54b599da36705208cb7ad4df45029e619c4
  - id: columns
    resource: ../../src/ui/grid-columns.ts
    title: Private native column topology and resize ownership
    git_blob: 874fca4953ffe70a2ef3b8e7001968da66bf89c4
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Private measured viewport, anchoring, spacers and lifetime
    git_blob: d02fbfe5407b80786733034f2f5aaaea5d71ef55
  - id: height
    resource: ../../src/ui/grid-height.ts
    title: Private authored height control and property-scoped restoration
    git_blob: 83e7e08a3036ff2d96279b768095703f8d61e4ed
  - id: geometry-browser
    resource: ../../tests/browser/grid-geometry.spec.ts
    title: Pointer and keyboard height controls, sticky footer and reveal alignment
    git_blob: 45e93f4737d06db7fadceb2574efe4a6c88a9e90
  - id: detail-browser
    resource: ../../tests/browser/grid-detail.spec.ts
    title: Immutable logical row scopes and public reveal boundaries
    git_blob: 59fe30118252219ffd40fbc37f01689f93863457
  - id: blocks
    resource: ../../src/ui/grid-row-blocks.ts
    title: Private authored record structure and native adjacent merging
    git_blob: 71d2218d3cf773d875bb423f8a324d5db70077ab
  - id: hooks
    resource: ../../src/ui/grid-hooks.ts
    title: Private synchronous row binding and resource ownership
    git_blob: 628b69014fd77f0f18e5e8c84d2953c1a9401bb9
  - id: lifecycle-browser
    resource: ../../tests/browser/grid-lifecycle.spec.ts
    title: Status, defaults, callbacks, cleanup, empty state and failure regressions
    git_blob: 08db552a81aa4efa98268ec803e4d4116ba2ec0d
  - id: blocks-browser
    resource: ../../tests/browser/grid-row-blocks.spec.ts
    title: Multi-row identity, spans, merging, physical ARIA and bounded geometry
    git_blob: 29925f3b06132277a2628b258db900ed6669bc98
  - id: viewport-browser
    resource: ../../tests/browser/grid-viewport.spec.ts
    title: Logical scopes, bounded DOM, focus, measurements and lifecycle regressions
    git_blob: 94b18cca941e2a8e5003c91a0346d4c07fa9b0cd
  - id: selection
    resource: ../../src/ui/grid-selection.ts
    title: Private active identity, membership, eligibility, and transition ordering
    git_blob: 1b74c39d3161345aec1c9d0c3dd9de49c947f23d
  - id: filters
    resource: ../../src/ui/grid-filters.ts
    title: Private scalar column filters and choice counts
    git_blob: a9a6604b72bf9077bf8cbf8f8db91bf0c774f7a8
  - id: select
    resource: ../../src/ui/select.ts
    title: Native Select binding reused for header filters
    git_blob: 4160eb77722751aad730fb997a4f0b07a967bd1e
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Shared Form/Grid rule runner
    git_blob: 967142342d060056cd3f124db29f6893a2875d48
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Shared native field values, display and constraints
    git_blob: 24943c238ebb41954764f4ab45306d5e7808b572
  - id: render
    resource: ../../src/ui/field-render.ts
    title: Private explicit field rendering and DOM ownership
    git_blob: 6cee41e892540ca138affb9988ab708506f6cb20
  - id: controls-browser
    resource: ../../tests/browser/grid-controls.spec.ts
    title: Native groups, values, validation timing, display and MDI regressions
    git_blob: 6df9b6e36371f8547a3366ea60e1afc9f70e5d56
  - id: render-browser
    resource: ../../tests/browser/field-render.spec.ts
    title: Renderer preflight, returned nodes, errors and reentry regressions
    git_blob: 8320051e7aa3cb4af2ee5be9f4225e3a8a6fb0c7
  - id: checks-browser
    resource: ../../tests/browser/grid-selection.spec.ts
    title: Independent membership and exclusive check regressions
    git_blob: 118e0325d6bf6b6b8b7c723c8c31b2bc2bc0b897
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
generated: { by: codex/gpt-6, at: 2026-10-28T13:26:39Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-25T00:41:28Z }
  - { by: codex/gpt-6, at: 2026-10-28T13:26:39Z }
---

`bindGrid` adds behavior to a native table and a caller-owned `Rows` store. It repeats an authored single-row or multi-row record, keeps active detail identity, selected membership, checked membership and invalid cell drafts under store-local `RowId` values, and never uses DOM IDs as row or field keys. The three selection states are independent.[^grid][^blocks][^selection]

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

`bindGrid<T extends object>(root, options): GridHandle<T>` requires an `HTMLTableElement` with exactly one `<tr data-row-template>` inside a tbody, or one `<tbody data-row-template>` containing the physical rows of one logical record. Mixing forms or an empty template body fails before ownership changes. The options below require `rows: Rows<T>`. Repeated rows and their descendants must not have fixed DOM IDs. The runtime replaces the authored rows with comment anchors and repeats their clones within the same tbody; it never creates a tbody per record. It reuses mounted clones and releases departing row elements and Select ownership. Without `viewport` or `progressive`, the mounted set is the complete logical page; progressive alone mounts its admitted prefix. Disposal restores the exact original template nodes and leaves other authored rows in place. A second live binding raises `GRID_IN_USE`.[^grid][^blocks]

| Option | Behavior |
|---|---|
| `rows` | Required caller-owned store of immutable snapshots and row identities. |
| `statusFilter` | Optional readonly `RowStatus[]`; defaults to clean/insert/update. Includes retained deleted rows only when explicitly requested. |
| `progressive` | Optional `{ size: number; delay?: number }`: explicit cooperative logical-prefix binding; omission stays synchronous. See [progressive binding](#progressive-binding-and-operation-lifetime). |
| `initialPage` | Optional `{ page, size }` applied before the first render. Defaults to all rows; use it to bound initial local DOM work. |
| `viewport` | Optional `{ root: HTMLElement, estimate: number, overscan?: number }`; the distinct same-document ancestor scroll root supplies finite authored height/overflow. Estimate is the positive finite initial height of a complete logical record in CSS pixels; overscan counts logical records, default 3. |
| `heightResize` | Optional `{ root: HTMLElement, handle: HTMLButtonElement, min: number, max: number }`; connect an authored labelled height button to the ancestor scroll area. The root must equal the viewport root when both options are used. Bounds are positive finite border-box pixels, with min <= max. |
| `rules` | Optional component-local formatter/validator overrides, messages, and locale. The shared rule runner also resolves retained built-in names. |
| `parse` | Optional application parser per unique scalar text/display or radio field path, used to turn an entered string into a raw JSON value. Number and range inputs require one. Boolean checkbox and array-valued controls reject string parsers. |
| `render` | Optional `Record<string, (value: unknown, context: RuleContext) => Node \| string \| null>` for explicit display fields; see [display rendering](#display-rendering). |
| `validateOn` | `"change"` (default), `"blur"`, or `"manual"`; controls draft validation/commit timing. Explicit `validate()` remains the save gate. |
| `revealInvalid` | Optional boolean, default `false`; explicit validation and rejected paste reveal the first current-page invalid row and try to focus its visible enabled field. |
| `paste` | Optional boolean, default `false`; enables delegated native `text/plain` paste into bound row fields and safe focusability for plain display fields. The `paste` method is available independently. |
| `onPaste` | `(result: ValidationResult) => void` after an API or native paste returns a validation result, including rejection. It is not called when preparation or a committed observer throws. |
| `beforeRowBind`, `onRowBind` | Synchronous callbacks receiving `{ row, elements, own }` for a changed or remounted record; see [row binding](#row-binding-and-owned-resources). |
| `onBind` | Synchronous `(result: GridBindResult) => void` after completed binding, progressive chunks or explicit progressive reveal growth; see [completion](#bind-completion). |
| `columns` | Optional full column state; each key appears exactly once in display order. Template `data-column` also enables management with authored defaults. |
| `onColumnsChange` | Optional callback after committed layout changes; programmatic changes pass `event: null`. |
| `onSelect` | `({ id, row, event }) => void` after active detail identity changes; `id` and `row` may be `null`. It does not report selected or checked membership. |
| `multiple` | Optional boolean, default `false`. Enables batch mouse/keyboard gestures on row selection buttons; full-set methods work in both modes. |
| `toggleSelection` | Optional boolean, default `false`. Unmodified select-button activation toggles single active identity or clicked multiple membership; see [explicit toggles](#explicit-selection-toggles). |
| `selectOnRowClick` | Optional boolean, default `false`. Noninteractive record areas use the same selection transition. Requires an authored `button[data-select-row]`; at event time the record must have a visible enabled non-inert selection button with `tabIndex >= 0`. Labels, editors, checks, actions, links, editable/focusable content, prevented events and nested tables do not enter this added path. |
| `canSelect` | `(row: RowSnapshot<T>) => boolean`; eligibility for active detail and selected membership, default all nondeleted rows. |
| `canCheck` | `(row: RowSnapshot<T>) => boolean`; checked membership eligibility, default all nondeleted rows. |
| `checkMode` | `"multiple"` (default) or `"single"`; single mode permits zero or one checked ID and atomically replaces the previous ID when another row is checked. |
| `beforeSelect` | `({ id, row, event }) => boolean \| void` before active detail identity changes. |
| `beforeSelectionChange` | `(change: GridIdsChange) => boolean \| void` before selected membership changes. |
| `onSelectionChange` | `(change: GridIdsChange) => void` after selected membership commits. |
| `beforeCheckChange` | `(change: GridIdsChange) => boolean \| void` before checked membership changes. |
| `onCheckChange` | `(change: GridIdsChange) => void` after checked membership commits. |
| `sorts` | `Record<string, (a: Snapshot<T>, b: Snapshot<T>) => number>` for authored header sort buttons. |
| `filters` | `Record<string, { value: (row: Snapshot<T>) => SelectValue; label?: (value: SelectValue) => string }>` for scalar column filters. |
| `onRowAction` | `({ action, id, row, element, event }) => void` for named row buttons, including an authored Undo action on a shown deleted record; `row` is the current `RowSnapshot<T>`. |

Eligibility callbacks must return strict booleans. Keep eligibility, comparator, predicate, filter-value and filter-label callbacks pure: they may run during rendering, validation of a proposal, or choice queries. A native authored `disabled` control prevents that UI gesture; it does not exclude an otherwise eligible row from programmatic full-set or scoped operations. Use `canSelect` or `canCheck` for data eligibility.[^grid][^selection][^filters]

# Declarative options

| Marker | Element | Behavior |
|---|---|---|
| `data-column="key"` | Direct template cell and leaf header/footer/static cell | Stable column key, separate from field paths and DOM IDs; leaf colspan is 1. Managed body rows must cover the same keys, including carried rowspans. |
| `data-columns="team choice"` | Spanning template cell, group header/footer/static cell or colgroup | Explicit known group membership; members must stay consecutive in state order, even when hidden. |
| `data-resize-column="key"` | Header button | Authored `type="button"`, nonempty `aria-label`, inside matching leaf header. Pointer and keyboard resizing. |
| `data-row-template` | One tbody row or one tbody | Repeats one tr or the tbody's complete tr block under one RowId. |
| `data-empty` | One static tr or tbody outside the record template | Shows authored empty-page markup; the Grid owns its temporary `hidden` state. Managed cells use normal column membership markers. |
| `data-row-status` | Each physical tr in a rendered record | Runtime-owned clean/insert/update/delete state for authored presentation. Original template nodes remain untouched. |
| `data-changed` | Grid table | Runtime-owned `"true"`/`"false"` aggregate for any pending Rows changes, including filtered/off-page changes; original attribute is restored on disposal. |
| `data-merge="path"` | Display-only direct cell in the first template tr | Raw scalar merge key; the cell must span the entire logical record and contain only matching bound fields. Adjacent equal records share a native rowspan. |
| `data-field="path"` | Row descendant | Reads a top-level or dot-separated object path. Plain display uses text; native controls edit values, and images receive `src`. |
| `data-field-changed` | Every rendered field member | Runtime-owned `"true"`/`"false"` comparison of its committed raw path with the loaded original; inserted rows have no baseline and receive `"false"`. |
| `data-format='[["name", ...args]]'` | Text-like input, textarea, or text element | Applies display-only rules; non-text inputs and Selects reject it. Stored row data stays raw. |
| `data-validate='[["name", ...args]]'` | Field or Select | Validates raw values with built-in or supplied rules. Rules are parsed once from the template. |
| `data-error-for="path"` | Row descendant | Displays field issues as text and receives a generated unique ID for `aria-describedby`. |
| `data-select-row` | Row button | `type="button"`; activates detail identity, with batch gestures when `multiple: true`. `aria-pressed` reflects active identity in default mode and batch membership in multiple mode; multiple mode also marks the active button with `aria-current="true"`. |
| `data-check-row` | Row checkbox | Native `input type="checkbox"` for checked membership; must not carry `data-field`. |
| `data-check-all="visible\|filtered\|store"` | Header checkbox | Native checkbox with an explicit scope, separate from `data-field`; reflects scope state and is disabled for an empty scope or more than one eligible row in single mode. |
| `data-sort-column="key"` | Header button in a `th` | `type="button"`; requires a matching `sorts` entry and cycles ascending, descending, clear. |
| `data-filter-column="key"` | Header `select multiple` | Requires a matching `filters` entry; binds raw choices through the existing Select component. |
| `data-filter-search="key"` | Header text/search input | Narrows matching choice labels without changing row filtering. |
| `data-apply-filter="key"` | Header button | `type="button"`, configured filter key and exactly one matching search input; applies matching raw values through click/plain Enter. |
| `data-clear-filter="key"` | Header button | `type="button"`; resets this column filter to `null`. |
| `data-row-action="name"` | Row button | Named `type="button"` action requiring `onRowAction`; cannot also be `data-select-row` and does not implicitly select or check. |
| `data-options="path"` | Select | Finds the row-local array of option objects, separate from the selected `data-field`. |
| `data-option-label="path"`, `data-option-value="path"` | Select with `data-options` | Read each option's label and raw scalar value. |

Field and option paths reject array indices, expressions, prototype keys, and empty segments. The Grid compiles field descriptors once, keeps row element references only for mounted clones, and updates their fields when raw values change. A nested field edit copies the affected object path and calls `Rows.set` for its top-level field.[^grid][^path]

Radio and checkbox members sharing one field path form one logical field, including members in different physical rows of a record. One checkbox stores a boolean; repeated checkboxes store a string array; radio stores a string or `null`. Choices must have distinct values, matching control kinds and consistent rule declarations. Radio members must share one native form owner; all-null owners are allowed, while mixed owners fail before mutation. Every cloned radio group receives a document-unique native name, so records and simultaneous MDI Grids remain independent inside or outside a native form. The authored template names are unchanged and restored with the template. Use wrapping labels and a fieldset/legend for group meaning.[^grid][^controls-browser]

A row-field `<select multiple>` always stores an array, including zero or one selected item. Row-local `data-options` preserves raw strings, finite numbers, booleans and `null` through the option map. Native date, datetime-local, time, month, week, color and hidden inputs use strings; number/range use the required application parser. When an engine implements an authored type as a text fallback, the effective native control defines its constraints; no date polyfill or new date utility is installed.[^grid][^native][^controls-browser]

# Methods

## Progressive binding and operation lifetime

~~~ts
const grid = bindGrid(table, {
  rows, progressive: { size: 100, delay: 0 }, onBind: showCompletion
});
let bound = await grid.whenBound();
while (!bound.last) bound = await grid.renderMore();
~~~

Size is a positive safe integer of whole logical records, including multi-tr blocks. Delay defaults to zero and accepts finite values from zero through 2147483647; fractional values use native timer precision. Invalid options raise GRID_PROGRESSIVE before ownership. Omission preserves synchronous creation/refresh/view behavior. A new binding may prepare its first record synchronously; follow-up renderMore always yields a Window task, including size one. Positive delay spaces newly materialized chunk records. Zero uses a batch continuation without recursive per-row timers. Existing prepared records are reused; full growing-prefix layout is not repeated for each yielded row.[^grid]

The full logical page still determines rowIds("visible"), checks, ranges, paste and validation. Available counts the admitted prefix, while mounted counts actual DOM records. Viewport updates prefix geometry once per chunk and creates only its bounded current window; offscreen admission creates no widgets or row hooks. Ordinary viewport movement keeps its synchronous bounded materialization path.[^grid][^viewport]

| Operation | Contract |
|---|---|
| whenBound() | Returns the current operation Promise; observes initial/view/append work and owned late-window errors. |
| renderMore() | Returns the same Promise while work runs; otherwise resumes an unfinished target or advances one size. Empty/exhausted calls do not repeat onBind. |
| cancelBinding() | Clears queued work, rejects its old Promise with AbortError and returns a frozen retained-state snapshot. A later renderMore resumes the unfinished goal. |

Cancel snapshots describe interrupted work, not a completed chunk; last stays false while required work is unfinished. After disposal, newly called methods use GRID_DISPOSED and previously obtained pending Promises reject with AbortError. An internal rejection handler keeps ignored observers quiet while callers still receive the original rejection. Await or catch operations in application/controller code.[^grid]

Replace, sort/filter/status/page changes and refresh cancel the old operation and start a new first chunk. Ordinary set/setMany/add/remove/move/revert cancel queued work and synchronously update the retained prefix without onBind. Append preserves stable identities and an unfinished target; otherwise it advances the next chunk so a previously unrendered tail is never lost. Empty append stays a no-op. Column changes cancel queued binding while retaining their committed layout; continuation uses that state.[^grid]

Reveal stays synchronous for any ID in the full current page. If the target is not admitted, it supersedes queued work and binds at least through that ID (possibly finishing the current target), then uses the current alignment/focus path. Progressive admission growth emits one completion for the new bound extent; default/non-growth reveal emits none. A still-visible focused row keeps enough prefix to preserve its node/caret and row-keyed draft.[^grid][^viewport]

Row hooks remain synchronous and table-attached; they are document-connected when the table root is connected. Refresh, renderMore and cancelBinding inside a row hook raise GRID_BIND_REENTRANT; use the controller operation flow instead. Disposal remains allowed. Preparation failure releases the failing record's resources and leaves earlier ready records for retry; completion failure occurs after commit and does not undo DOM or redeliver that completion. Same-stack completion follows its view owner's commit, including sort headers. User callbacks that replace/dispose binding invalidate the older operation. In progressive mode a late viewport-window failure publishes a new rejected whenBound Promise; renderMore retries that window even after full logical admission, without another logical onBind.[^grid][^hooks][^progressive-browser]

Grid sets aria-busy="true" only while scheduled work is pending and restores the authored attribute on completion/cancel/failure/disposal. Waiting for Next is not busy. Full-page table ARIA counts/indices remain distinct from partial DOM. Put authored progress status outside the busy table and update it per chunk. Progress adds no visual theme, focus stealing or per-row live announcement; existing focus recovery when a control leaves the view still applies.[^grid]

Bottom-scroll and Yield all are controller compositions around awaited renderMore. A native Next button handles keyboard/no-overflow continuation. Scope native listeners to the controller signal and guard late results by handle/operation identity. Register Grid ownership before await; on a CVC abort dispose Grid immediately through a standard signal listener, then retain the idempotent owned disposer. Forced async controller cleanup checks its aborted signal before touching released UI. Normal retained deactivate cancels, and activate may resume; deactivate does not itself abort PageContext.signal.[^grid]

## `statusFilter()` and `setStatusFilter(values)`

The getter returns a frozen readonly `RowStatus[]`. The setter canonicalizes duplicates/order as clean, insert, update, delete; `[]` displays no records. Invalid arrays or unknown statuses raise `GRID_STATUS` without changing the current state/view. An equivalent proposal preserves the existing array, bindings and focus.[^grid][^lifecycle-browser]

Status filtering precedes manual/column filters, sorting and paging. `filterChoices` counts the same status projection before its ordinary own-column/paging exclusions. A live row hidden by a status filter can retain active/selected/checked state, just as under other filters; deletion still forces pruning. Check/store scopes retain their existing live-row eligibility.[^grid][^filters][^selection]

Shown deleted records retain their last committed raw values, including edits made since loading. `Rows.changes()` still supplies the original loaded value for a delete payload; `rows.original(id)` reads that immutable baseline separately. Bound native editors are disabled, and deleted IDs remain ineligible for selection, checks, validation and paste starts. Authored actions can still receive the tombstone's RowId to call `rows.revert(id)`, restoring its original values and clean status. Reversion does not restore pruned membership automatically. Focus held by an editor or selection control that becomes disabled moves to an enabled visible control or the table fallback. Merge runs split when row statuses differ.[^grid][^blocks][^lifecycle-browser]

## Field change markers

Grid sets `data-field-changed` on every rendered `data-field` element, including all members of a radio/checkbox group and fields in different physical rows. It compares that field's committed raw path with `rows.original(id)`. Nested sibling paths compare independently; arrays and objects compare structurally, while scalars use `Object.is`, including distinct `0` and `-0`. Text, image, rich-display and typed Select targets use the raw data rather than rendered DOM; a Select's option list is separate from its selected field.[^grid]

Invalid or deferred drafts do not change these flags. Returning a committed value to its loaded value clears its flag; inserted and copied rows receive `"false"` because no loaded baseline exists. Retained deleted rows keep the flags for their last committed edits. Flags update before the focused-value shortcut, so a control can keep its text/caret while reflecting an external committed change. Rebinding, refresh and viewport remount derive flags from Rows without a second baseline store. Error regions and unmarked parent cells are not field targets.[^grid]

Author CSS and human-readable change text in HTML or row callbacks. The marker supplies no visual design or automatic announcement. Original template nodes and their authored attributes remain untouched and return on disposal. See [Rows](data.md#originalid) and [Form](form.md#loaded-value-changes) for the shared baseline and ownership rules.

## `defaults()`

Returns detached `Record<string, unknown>` values from native inputs, groups and Selects captured in the authored source at binding time. It does not read a currently edited record. One checkbox is boolean, repeated checkboxes/multiple Selects are arrays, and radio is string/null. Static Select values use the compiled raw mapping. Display spans/images contribute no defaults; application code supplies row-local option lists and business properties.[^grid][^native][^lifecycle-browser]

Own parser functions receive each entered string and one complete unparsed candidate in `RuleContext.values`, with `rowId: null` and the authored field element. Parser order cannot change that input snapshot. An undefined/asynchronous/uncloneable result, thrown parser, repeated native field path or parent/child path conflict raises `GRID_DEFAULTS`. The method writes neither Rows nor bound fields; keep application parsers free of side effects.[^grid][^lifecycle-browser]

```ts
const native = grid.defaults();
rows.add(employeeFromDefaults(native)); // Application factory returns the complete Employee.
```

HTML cannot prove every property of `T`. There is no no-argument Grid.add or cast that claims native defaults are a complete business row.

## `refresh()`

Re-evaluates the current projection and mounted bindings without replacing Rows, changing RowIds, or discarding drafts and selection. Formatters/renderers and row hooks run again for mounted records. Use it to retry a corrected live binding failure or apply application-owned presentation changes. It emits one completed `onBind` notification with `event: null`; viewport scrolling alone does not.[^grid][^hooks][^lifecycle-browser]

## `columns()` and `setColumns(columns)`

`columns()` returns a frozen array of frozen `GridColumn` objects: `{ key, width?, hidden? }`. `setColumns` replaces the full ordered state; keys must be known, unique and complete. Width is a positive finite preferred CSS-pixel value; omitted width restores the authored preference, and omitted `hidden` means visible. At least one column must be visible. Flat tables allow arbitrary order; grouped cells and authored colgroups require contiguous members, allowing within-group order or whole-group movement. Invalid input fails before changing state or DOM. Without column markup/option, the state is `[]`; nonempty replacement raises `GRID_COLUMNS`.[^columns]

```ts
const next = grid.columns().map(column => column.key === "team"
  ? { ...column, width: 200, hidden: true } : column);
grid.setColumns(next);
grid.setColumns([...grid.columns()].reverse()); // Only valid if groups stay contiguous.
```

For width-only changes, the column owner updates native col/table widths without row/header/footer movement or focus/scroll work. Grid then recalculates active merges and invalidates viewport measurements for the new geometry. Other column state changes reuse existing cells/controls and do not change Rows, identity, selection or drafts. Application controls can call this method to move/show/hide/reset and persist serialized state. Hidden nodes stay privately owned for reappearance and restoration. No column chooser, drag-to-reorder UI or persistence registry is generated.[^columns]

## `select(id)` and `selected()`

`select(id)` activates an existing, nondeleted, `canSelect`-eligible row (visible or filtered out), or clears active detail identity with `null`. An unavailable ID raises `GRID_ROW`; ineligibility raises `GRID_SELECTION`. `selected()` returns that store-local ID or `null`. These methods and `onSelect` preserve the Grid/List/Form active-detail contract and never alter either membership set. Sorting, filtering and paging preserve the active ID; removal or lost eligibility clears it.[^grid][^selection]

## `selectedIds()` / `setSelected(ids)` and `checkedIds()` / `setChecked(ids)`

The getters return frozen arrays in store order. Each setter replaces its entire independent set, including IDs outside the visible page. It validates the complete array before changing state: duplicate, missing/deleted or ineligible IDs reject the whole proposal. Selected membership uses `canSelect`; checked membership uses `canCheck`. In `checkMode: "single"`, a checked proposal with more than one valid eligible ID then raises `GRID_CHECK_MODE` unchanged. Neither setter changes active detail identity or the other set, and none of these state changes edits Rows.[^selection][^checks-browser]

## `checkAll(checked, scope)` and `checkState(scope)`

Both require an explicit `GridRowScope`; there is no default scope.[^selection]

| Scope | Rows considered before `canCheck` |
|---|---|
| `"visible"` | Current sorted, filtered page; all filtered rows when local paging is off. |
| `"filtered"` | All rows passing the manual filter and every active column filter, before paging. |
| `"store"` | All nondeleted rows, regardless of filters or paging. |

In multiple mode, `checkAll(true, scope)` adds every eligible scope ID and preserves checks outside it. In single mode, more than one eligible scope ID raises `GRID_CHECK_MODE` unchanged; exactly one replaces the previous checked ID, including an outside-scope ID, and an empty scope leaves checks unchanged. No operation implicitly chooses the first row. In either mode, `checkAll(false, scope)` removes only checks in that scope. Native checking in single mode uses the same atomic replacement, veto and callback path.[^selection][^checks-browser]

`checkState` returns a frozen `GridCheckState`: `{ checked, indeterminate, total, count }`, where `total` is the actual eligible scope count even in single mode, and `count` counts its checked IDs. `checked` means a nonempty scope is fully checked; `indeterminate` means some but not all are checked. An empty scope has both flags false. A header checkbox is disabled for an empty eligible scope, for more than one eligible row in single mode, or when authored disabled. Boolean `data-field` editors remain independent.[^grid][^selection]

## `columnFilter(key)`, `setColumnFilter(key, values)` and `filterChoices(key, search?)`

Column keys must be configured in `filters`. `columnFilter` returns a frozen raw scalar array or `null`. `setColumnFilter` accepts a complete array of strings, finite numbers, booleans or `null`; duplicates are normalized. `null` means all values, `[]` means none, and `[null]` means only the raw null value. Numeric `1` and string `"1"` remain distinct. Column predicates combine with AND and with the separate predicate from `setFilter`.[^filters]

`filterChoices` returns a frozen array of frozen `GridFilterChoice` values, `{ value, label, count }`, in first store-occurrence order. The value universe comes from status-projected rows passing the manual predicate. Counts additionally apply every other column filter, exclude this column's own filter, and ignore paging. Values excluded by another column remain present with count zero and stay selectable. Zero counts never erase an explicit selection. Without a label function, labels use `String(value ?? "")`. Optional search is a case-insensitive label substring; it narrows choices only and leaves filter state unchanged.[^filters]

Authored filter selects display `label (count)` through `bindSelect`. Editing the displayed choices preserves selected raw values hidden by the current search or other filters. Resetting the column sets `null`; it does not clear the search input. Original Select nodes, selection and ownership are restored on disposal or failed binding; do not bind the same control separately while Grid owns it.[^grid][^select]

## `setSort(compare, indicator?)` and `setFilter(predicate)`

`compare(a, b)` receives immutable row values; a predicate receives one immutable row value. Pass `null` to clear either operation. A sort indicator may specify a `<th>` in this table's `<thead>` and `direction: "ascending" | "descending"`; the Grid sets its `aria-sort` and restores the prior attribute when the indicator changes or disposal occurs. The application supplies the comparator and keeps the indicator consistent with it. Authored `data-sort-column` buttons reuse this sorting path and configured comparators. Sorting and filtering preserve active identity, both membership sets, and row-keyed drafts.[^grid]

## `setPage(request)` and `page()`

`initialPage: { page, size }` applies the same local slice before the first render. `setPage({ page, size })` changes it later; `null` shows all rows. Page and size must be positive safe integers (`GRID_PAGE`) for either entry point. An invalid `initialPage` fails before the authored template changes. If a later page exposes a formatter or row-option error, `setPage` keeps the previous page state and visible rows, releases the failed row clones, and can be retried after the data or rule is fixed. `page()` returns a frozen `{ page, size, total, pages }` or `null` when local paging is off. If the current page exceeds the new result count, it clamps to the last page; an empty result has page 1 and 0 pages. Selection and drafts remain keyed to Rows IDs even when off-page.[^grid]

## `validate(id?)`

Returns `{ valid, issues }` for an explicit nondeleted ID or all nondeleted rows, including filtered-out or off-page rows. It checks supported input HTML constraints (including programmatically bound text length limits), parsers and validators, Select availability, Select `required`, and Select validators. A missing or deleted explicit ID raises `GRID_ROW`. An issue has `rowId`, `field`, `rule`, and `message`; `element` exists only for a connected row control. Validation evaluates all cell drafts for one row against the same candidate values, even while the row is filtered out. A draft that passes is committed to `Rows`; a failed draft stays outside the store. Call `validate()` before saving to reconcile drafts after external row changes.[^grid][^rules]

With `revealInvalid: true`, this method and rejected paste find the first issue whose RowId belongs to the current logical page, reveal that row through the existing viewport, and try to focus its first visible enabled field member. Returned issues for that row receive their now-connected field references. Hidden columns can still have issues without a focusable target. Off-page/filtered-out errors stay recorded; this option never changes page or filter to reach them.[^grid][^controls-browser]

## `rowIds(scope)`

Returns frozen `readonly RowId[]` snapshots without scanning the DOM or applying selection/check eligibility. `visible` is the complete logical page, including unmounted records; `filtered` is the current status/manual/column/sort projection before paging; `store` is live Rows order. Explicitly shown tombstones remain in visible/filtered scopes; skip them before binding a Form. Old results remain unchanged after later updates. Unknown scopes raise `GRID_SCOPE` and disposed handles raise `GRID_DISPOSED`.[^grid][^detail-browser]

## `reveal(id, options?)`

Scrolls a row in the current logical page without changing active identity, membership or focus. `options.block` accepts native `nearest` (default), `start`, `center` or `end`; malformed options raise `GRID_VIEWPORT_ALIGN` before scrolling. A filtered-out, off-page or missing ID raises `GRID_VIEWPORT_ROW`; explicitly shown deleted rows may be revealed read-only. The caller changes filtering/paging explicitly. With viewport, estimates and measured corrections align the entire logical record between top-sticky header and bottom-sticky footer bands. Left/right-only stickiness does not reduce usable height. Oversized records use their start for nearest alignment. Without viewport, native `scrollIntoView` receives the same block; authors use scroll-padding/scroll-margin for sticky content.[^grid][^viewport][^geometry-browser]

Application selection/check/add handlers may call centered reveal when desired. Authored `overscroll-behavior: contain` keeps scroll-boundary gestures inside the area without wheel interception. These explicit operations do not silently change action-scroll defaults or close remaining legacy flag/option equivalence.[^grid][^viewport]

## `paste(text, { id, field })`

Returns `ValidationResult` for a synchronous, whole-field paste starting at a logical-page `RowId` and exact `data-field` path. The method works without enabling native paste. Each clipboard line addresses one logical record; fields advance by physical template row, then current visible column order, then authored order within a cell. A spanning cell uses its first visible column member. Managed hidden columns and authored `[hidden]` fields are excluded; temporary merge suppression does not remove a logical field. Display fields participate, while check/action columns without `data-field` consume no position. A radio/checkbox group consumes one field position at its first visible member; other repeated visible field paths are ambiguous and rejected. With `viewport`, the start and target records need not be mounted. A start outside this logical field/record set raises `GRID_PASTE_TARGET`.[^grid][^blocks-browser][^controls-browser]

```ts
const result = grid.paste("ada@example.com\tPlatform\ngrace@example.com\tSupport", {
  id: firstVisibleId, field: "email"
});
if (!result.valid) console.log(result.issues);
```

The example requires Email and Team to be consecutive bound fields in the current layout. There is no implicit field-name header, business-key lookup, row creation, automatic page advance or silent truncation. Rectangular and ragged tab-separated rows are accepted; shorter rows leave unsupplied fields unchanged. Double quotes enclose a whole cell, `""` escapes a quote inside it, and quoted tabs/newlines stay inside that cell. CRLF and CR normalize to newlines; a final line terminator does not add an extra row. Empty text represents one empty cell. Malformed quoting and any row/field overflow return a `paste` issue with no stored changes. Clipboard HTML is never evaluated.[^grid]

Disabled native controls, readonly inputs/textareas and fields under `inert` or `aria-readonly="true"` consume a clipboard position but are not written. Any protected member protects its entire radio/checkbox group. Shown deleted records inside the rectangle consume protected lines without writes, including offscreen records; they do not shift later lines. A deleted starting ID raises `GRID_PASTE_TARGET`. A single checkbox accepts exactly `true` or `false`; radio accepts an available choice string or empty text for `null`. A scalar Select matches text to `String(rawValue ?? "")` among enabled options, preserving its raw type. Unknown or disabled values fail; two different raw values with the same serialization, such as number `1` and string `"1"`, are ambiguous and fail. Raw identity uses `Object.is`, including the distinction between `0` and `-0`. Display labels are not converters.[^grid][^controls-browser][^lifecycle-browser]

Repeated checkboxes and multiple Selects accept a JSON array in one TSV cell, including `[]`. Apply ordinary TSV quoting around JSON quotes: the cell for `["mail","sms"]` is `"[""mail"",""sms""]"`. Checkbox members require available strings; typed Select arrays match available raw scalar values, so `[1,"1",null]` can retain three distinct choices. Duplicate, unavailable or disabled choices reject the complete paste. Row-local nested option arrays use the normal Select mapping; no array-index path syntax or clipboard rule engine is added.[^grid][^controls-browser]

Pasted fields overlay existing drafts for each affected row. Existing parsers see one combined unparsed candidate; native constraints check entered values while business rules receive the complete parsed row, including unrelated drafts and bound fields outside the pasted range. Only supplied writable fields are committed, with copied nested paths preserving other stored values. An unrelated valid draft is considered during validation but is not saved by paste. Validation failure leaves stored values, drafts, entered input and selection intact. Focus stays unchanged by default; `revealInvalid: true` may reveal and focus the first current-page error. Returned issues identify `rowId`, `field`, `rule`, `message` and a currently connected `element` when present; released rows retain no stale reference. Accessible messages merge with existing field errors instead of erasing them.[^grid]

A successful paste uses one `Rows.setMany` change, preserving row IDs and dirty tracking; a net no-op emits no Rows event. Other Forms, Grids, Lists and Trees receive the coherent batch. The originating Grid clears only its captured pasted drafts, preserves newer subscriber-created drafts/errors, and then renders the committed view, which may move or hide rows if a sort/filter depends on a changed value. Keep parser and rule callbacks pure. A callback changing Rows, view, columns or drafts invalidates preparation with `GRID_PASTE_STALE`; reentrant paste raises `GRID_PASTE_BUSY`, and disposal raises `GRID_DISPOSED`. Application callback side effects are not rolled back. A subscriber/render/`onPaste` error after commit propagates with the stored batch retained; inspect current state before retrying.[^grid]

Parsers must return JSON-compatible raw values. Returning `undefined` reports a parse issue; other invalid JSON values such as `Date`, `NaN`, functions or cycles fail with `ROW_VALUE` at `Rows.setMany` before commit. This exception preserves input/drafts and skips `onPaste`; it is not a returned validation result.[^grid]

With `paste: true`, an uncanceled native event carrying `text/plain` in a bound row field is intercepted and runs this same operation. It replaces complete field values rather than inserting at a text caret. A plain display field without authored `tabindex` gains `tabindex="0"` on its clone unless it is inside an interactive ancestor; existing interactive controls keep their own focus behavior. No extra tab stop is added inside a row button. A row control containing exactly one bound display field can also be the paste target. An earlier `preventDefault()` is respected. Without the option, native editing and caret paste remain browser behavior; the method is still available.[^grid]

## `dispose()`

Releases row-owned resources, removes delegated listeners and mounted clones, unsubscribes from `Rows`, clears drafts, cached issue text, detached validation probes and Select ownership, and restores the untouched template rows, authored empty hidden state, table data-changed, sort state, header checkbox checked/mixed/disabled state, filter Select nodes and selected options, column/cell/group order, spans/styles, and resize button attributes. Merge rowspans, follower display suppression and measured row-height floors are released. Viewport disposal removes owned spacers, disconnects measurement observers, cancels pending frames and restores authored row-count/index attributes and overflow anchoring. It also cancels resize previews and releases document listeners and pointer capture. Cleanup continues after an application disposer fails, then reports its failure. Failed initialization restores authored controls for retry. It does not dispose the caller-owned store. Repeated disposal is safe; other methods then raise `GRID_DISPOSED`.[^grid][^hooks][^blocks][^select][^viewport]

# Events

## Row binding and owned resources

`beforeRowBind` and `onRowBind` receive a frozen context containing the immutable `row` snapshot, a readonly `elements` array for the complete physical tr block, and `own(dispose)`. Before runs on physical rows attached to their table before their field values; after runs after field binding and, in synchronous mode, final placement. During cooperative work the record is attached and fully bound, but shared placement/merge geometry commits at the chunk boundary before onBind. Read final chunk layout from completion rather than onRowBind. The rows are document-connected only when the table root is connected. Standalone detached tables are supported; connect the root before initializing or measuring layout-dependent widgets. Hooks run for changed mounted snapshots, remounted records and explicit refresh, not unchanged rows or movement alone. The table is already claimed before the first hook. Return values do not veto binding; asynchronous callbacks or cleanup are rejected and their promises consumed.[^hooks][^grid][^lifecycle-browser]

Keep compiled field nodes, record structure and column topology intact. These callbacks connect application behavior; they do not recompile arbitrary per-row binding markup. Use the explicit display renderer for its owned target and register widget cleanup with `own`.

Use `own` for widget listeners and disposers. Resources are released in reverse registration order on rebind, virtual departure, failure and disposal. A context can register a resource after its callback returns while that binding remains active. Once released, a late `own` immediately disposes the new resource and raises `GRID_BIND`; it cannot leak into a newer binding. Grid re-enforces deletion disabling on its bound native controls after `onRowBind`, so a widget callback cannot reactivate a deleted editor. Live-row application choices remain intact.[^hooks][^grid][^lifecycle-browser]

`GRID_BIND` identifies callback/cleanup phase, RowId when applicable, and cause. Reentrant row binding/refresh raises `GRID_BIND_REENTRANT`; Rows/view/column changes detected after a row callback raise `GRID_BIND_STALE`. Application writes already committed to Rows are not rolled back. Failed live hooks release their resources and allow explicit refresh retry. Disposal from a hook restores the source and prevents older rollback or queued frames from rewriting it.[^hooks][^grid][^lifecycle-browser]

## Bind completion

onBind(result: GridBindResult) receives a frozen eight-field snapshot. total counts all retained store rows; filtered counts the status/manual/column projection; visible counts the full logical page; mounted counts actual DOM records. available counts logical prefix admission. first identifies an extent beginning at zero; last means its full-page admission and required current bindings completed. Event is the replace/append Rows event or null. Default synchronous and empty completions have available=visible and first/last true, including a locally paged view.[^grid][^lifecycle-browser]

It runs after initial/replace/append/view/refresh binding, each completed progressive chunk and explicit progressive reveal growth. Ordinary set/setMany/add/remove/revert/move and normal scroll/resize do not emit it. Empty/exhausted continuation and window-only retry do not duplicate it. This remains completion, not a subscription to every mutation; the demo's output labels the last completed result.[^grid]

Completion follows row completion and forced-prune notifications. A post-bind error retains completed data/DOM and is reported through the operation Promise; synchronous default calls still throw as before. A failed view rolls back before delivering forced-prune callbacks, so a callback append or view change is not overwritten by the older rollback. Initialization failure restores source/ownership, and no stale operation may complete a replacement.[^grid][^selection][^lifecycle-browser]

## Selection, actions and columns

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

Deleting/replacing Rows or changing eligibility prunes unavailable state without consulting veto hooks. Prune notifications run after the view commits or its failed binding rolls back, so a callback can make a later Rows/view change without resurrecting deleted rows or losing a newly appended count. Active/selected eligibility remains independent of checking eligibility. A post callback error propagates with state and cleanup committed; later callbacks in that notification sequence may not run. Pure view or membership changes do not emit Rows notifications.[^selection][^grid][^lifecycle-browser]

# Behavior

## Explicit selection toggles

Set toggleSelection: true to enable plain activation toggles while preserving the existing default. In single mode, activating the active row clears it. In multiple mode, activating an unselected row adds and activates it; activating any selected member removes only that member and sets active identity to null, preserving other members and checks. This uses the existing atomic before hooks and callback order. A veto leaves state and DOM unchanged; post-callback errors retain the committed state.[^selection]

Ctrl/Meta/Shift/Alt gestures keep their existing behavior. Native Enter/Space on the authored selection button produces one ordinary click and follows the same policy. Programmatic select(id) stays idempotent and active-only; setSelected and setChecked remain absolute independent set operations. toggleSelection alone does not enable row-area activation; use selectOnRowClick for that. No extra keyboard activation handler is added.[^selection][^grid][^toggle-browser]

## Apply a choice search

~~~html
<label>Team search <input type="search" data-filter-search="team"></label>
<button type="button" data-apply-filter="team">Apply matches</button>
<label>Teams <select multiple data-filter-column="team"></select></label>
~~~

The Apply marker requires a configured filter key and exactly one matching authored search/text input in this table header. Input alone still previews choices. Apply replaces that column's complete filter with the matching raw values; no matches uses [], and blank/whitespace clears to null then clears the input if the completion callback has not replaced its query. A callback that disposes Grid releases ownership before any subsequent Apply UI writes. Plain Enter applies only when a matching enabled Apply button exists. Composing input, modifier keys and disabled controls do not apply; handled Enter prevents native form submission. Existing data-clear-filter resets membership and keeps the search input.[^grid][^filters]

Filter value/label callbacks must be synchronous and pure. Choice calculation rejects a stale result if Rows, the manual predicate or column-filter state changes before publication. This is a local cache safeguard, not a general callback transaction. A rendering-preparation failure restores the previous filter/view; a completion callback failure after commit keeps the new state. Apply reuses those existing boundaries.[^filters][^grid][^filter-browser]

## Authored column recovery

Compose labeled checkboxes with columns(), setColumns() and onColumnsChange. Derive checked, mixed and shown/total output from current columns; keep no second selection store. Map the full current state and change only hidden so widths, order and topology survive. The demo keeps an authored actions/recovery column out of business-column choices and forces it visible for chooser writes. All business columns may hide, while that physical column and the external chooser still allow recovery. Arbitrary all-physical-hidden API writes still raise GRID_COLUMNS.[^columns]

Synchronize from committed state before outward application callbacks, or in the handler's finally refresh. Invalid layout/preparation fails before a layout commit; an onColumnsChange error occurs afterward. Native checkbox focus remains in the chooser; hiding an editor uses the existing visible same-record/header/table fallback. These are application compositions using the current layout owner, not a new public chooser component.[^columns][^grid]

## Height controls

The `heightResize` handle must be a same-document `button type="button"` outside the target table, named by authored aria-label or aria-labelledby. The runtime gives it a focusable horizontal separator role, a unique root `aria-controls` connection and measured value/bounds. Primary pointer movement adjusts height; ArrowUp/Down change ten pixels, Shift changes one, and Home/End select configured bounds. Escape, pointer cancellation, lost capture or mouse movement after the primary button was released restores pre-drag height properties. Disabled, hidden or inert controls do nothing. Pointer previews coalesce per animation frame; existing viewport observation owns row recalculation.[^height][^geometry-browser]

Height is measured as a border box, including content-box padding/borders. CSS layout remains authored. An external size outside configured bounds widens the announced range to include the actual size; owned actions still clamp to configured bounds. Unmeasurable roots omit their current value and make the handle inert until measurable, preserving authored inert state. Cleanup restores the original height/min-height/max-height values and priorities, handle attributes/style and generated root ID while preserving other owners' styles. No wrapper, copied heading/footer, theme, public height setter or change callback is generated.[^height]

## Empty pages

Mark one authored static `tr[data-empty]` or `tbody[data-empty]` outside the repeated record. Grid toggles its hidden state from the logical page count, not the number of temporarily mounted viewport records. Repeated markers, a marker inside the template, or another element kind raise `GRID_EMPTY` before ownership. Managed cells declare ordinary column membership, allowing the existing column owner to adjust their span. The marker's nodes and original hidden state survive disposal unchanged.[^grid][^blocks][^lifecycle-browser]

When loaded rows hide an empty state that held focus, Grid moves focus to an enabled visible row control or its table fallback. Author empty message text, actions and result counters; no themed empty HTML or result-template engine is generated.

## Authored row blocks and adjacent merging

```html
<tbody data-row-template>
  <tr>
    <td rowspan="2" data-merge="profile.team" data-field="profile.team"></td>
    <th scope="row"><button type="button" data-select-row><span data-field="name"></span></button></th>
    <td><label>Choice <select data-field="chosen" data-options="choices"
      data-option-label="label" data-option-value="value"></select></label></td>
  </tr>
  <tr><td colspan="2"><label>Notes <textarea data-field="profile.notes"></textarea></label>
    <output data-error-for="name"></output></td></tr>
</tbody>
```

All physical rows in a block share one RowId, draft/error set and selection/check identity. Controls and error regions may live in any physical row. Descriptors compile once over the complete authored block; nested options use that record's raw data. Placement, focus pinning, reveal, page changes and release operate on the complete block. An authored rowspan must end within its block. Source `rowspan="0"` means the remaining physical rows of that block and is normalized to a finite span on each clone; disposal restores the unchanged source.[^grid][^blocks][^blocks-browser]

`data-merge="path"` belongs to a first-row cell spanning the complete block, including span 1 for a single-row template. Bound display elements, including the cell itself, must use that exact path. Authored controls, focus targets, row actions and error regions are rejected in merge cells. Keys are raw scalar or missing values; arrays/objects reject with `GRID_MERGE`. Merge columns follow authored cell order, comparing each key and all preceding merge keys with `Object.is`. Formatted text does not define equality, so numeric `1` and string `"1"`, and signed zero values, remain distinct.[^blocks]

Only consecutive records of the current sorted/filtered page that are mounted together merge. Native rowspan belongs to the first cell; followers stay attached with temporary display suppression. Runs stop at page/window boundaries, viewport gaps, the native span limit and both sides of a focused merge cell. A display field made focusable by `paste: true` therefore stays visible while focused. A long equal-value run never expands the viewport window. Before merging, the runtime batch-measures natural physical row heights and temporarily preserves them so an entirely merged column cannot collapse table geometry. Normal data/view/column/scroll/geometry updates recalculate these floors; disposal restores authored styles.[^blocks][^blocks-browser]

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

Offscreen paste and validation use compiled field paths, raw row-local option plans and cached detached native HTML-validation controls, rather than creating a row/Select for every target. Those plans do not mutate option sources or add state to Rows. Issues omit `element` when the corresponding control is not connected; callbacks must not require a DOM node for every logical row. Only explicit `reveal` or the opt-in `revealInvalid` behavior mounts a row for visibility.[^grid][^viewport-browser]

The table keeps native semantics. In viewport mode `aria-rowcount` counts physical rows: logical-page records times block size, plus authored header, static body and footer rows. Every mounted physical tr and static row receives its own one-based `aria-rowindex`; merging does not change that count. Owned native spacer rows are `aria-hidden="true"` and noninteractive. Hidden first/last authored rows remain inside their complete block but do not inflate its measured height. Other authored rows remain in place.[^grid][^viewport][^blocks-browser]

## Columns, drafts and interaction

Managed columns compile native topology once across the complete block. They move original header/footer cells, maintain visible group colspan and reorder expanded native cols. Hidden cells, cols and empty groups leave the connected table model. A scope="colgroup" cell must match an authored native colgroup membership. Every physical template/header/footer row must cover all template keys, including carried rowspans; a body spanning cell declares `data-columns`. Original authored spans are restored on disposal, including source span 0. Data field indices are captured before applying column order to a clone.[^columns][^grid][^blocks]

Widths follow native CSS table/minimum-content constraints. When all visible columns have explicit widths the runtime prefers their sum as table width; otherwise it restores the original table-width preference. Authors choose table layout, responsive scroll containment, sticky positioning and visual resize affordances in CSS. Resize controls receive owned `touch-action: none`, `user-select: none` and `aria-keyshortcuts` if absent; disposal restores originals. ArrowLeft/ArrowRight adjust 10 pixels, Shift adjusts 1, and Home restores the initial preferred width. Pointer previews publish one change at release; Escape/cancel restores the prior state. Move preserves focus/caret; hiding focused content tries available visible controls then the table. Detached hidden controls are still validated through row-keyed drafts, but issues omit a disconnected element.[^columns][^grid]

Text formatting is one-way: rules transform displayed text while the row snapshot and save payload retain the raw value. Validation invokes the shared UI rule runner on raw values. A Select option's DOM `value` is a string, but its row-local mapping preserves a raw string, finite number, boolean, or `null`. Authored empty options map to `null`; nonempty authored options remain strings. A missing selected raw value shows no selected option and yields `select-option`. A multiple Select keeps an array for every selection count.[^grid][^rules]

`validateOn: "change"` retains and validates text drafts on input, then commits valid candidates on native change. `"blur"` defers scalar draft commits until focus leaves that logical field; native group/Select changes still commit once. `"manual"` retains every draft until explicit `validate()`. In change/blur mode, unmodified Enter commits a scalar text-like or number input; textarea newlines, composition and modified shortcuts remain native. This does not add a second blur commit after a successful change or Enter.[^grid][^controls-browser]

A parser receives the entered string and one snapshot of all unparsed row drafts, independent of parser order; declared validators receive each parsed field value as a string, with the combined typed candidate in `RuleContext.values`. Only own parser/render configuration keys are used, including a field named `toString`. A throw or `undefined` from a parser creates a `parse` issue and preserves the draft. The Grid checks all fields against the row value plus every draft for that row. A choice that fails stays visible as a draft under that row ID and field path, while `Rows` remains unchanged. A later field change can make cross-field drafts valid and commit them. Programmatic `Rows` updates refresh the display and clear stale error text without invoking user validators; call `validate()` before saving. Validation message text is kept by `RowId` without DOM references, so a failing off-page row shows its issue again when it returns. An external replacement of a drafted field, `replace`, `remove`, `revert`, or `dispose` clears the affected drafts. Filtering, sorting, and paging keep them. `validate(id)` checks drafts even without a rendered row.[^grid][^controls-browser]

Form, Grid and List share private native value/constraint operations. Programmatic values obey text min/max lengths as well as native validity; disabled controls retain their effective native validation state, including disabled fieldsets and their first-legend exception. A native input that sanitizes an invalid stored candidate reports an issue instead of silently changing Rows. Visible and detached probes use the same candidate rules. These helpers are not package exports.[^native][^controls-browser]

## Display rendering

`<img data-field="avatar" alt="Employee portrait">` writes the raw field to its native `src` attribute. `null` or empty text removes `src`; authored `alt` stays unchanged. Ordinary display fields insert text.[^native]

Form and Grid accept `render: { summary(value, context) { /* return fresh DOM, text or null */ } }`. The callback receives the raw field and `RuleContext`; it must return synchronously. A string stays literal text and `null` clears the target. A Node must be a fresh, disconnected, parentless Element, Text or DocumentFragment from the target's document. Returning a connected/reused/foreign node, the target, its ancestor, an async result or another value raises `UI_RENDER`. Callback failures preserve their cause; errors identify the binder API and field. Recursive updates to the same target also fail with `UI_RENDER`.[^render][^render-browser]

Configuration is checked before binding ownership: each own entry must name exactly one display target and a function. A target cannot be a native value control, image, editable region, error region, or have `data-format`; it cannot contain another bound field, error region, framework interaction marker or native interactive/focusable content, including links, controlled media, frames and `tabindex`. The application creates and sanitizes any trusted rich DOM and keeps factories free of store-changing side effects. No string-to-HTML switch, sanitizer or renderer registry is provided. Grid disposal restores the untouched authored template; [Form](form.md) restores the original children of its custom render targets.[^render][^grid][^controls-browser]

Inside a `data-merge` cell, returned DOM must also stay display-only: native interactive/focusable content, field/error declarations and framework interaction markers raise `UI_RENDER` before replacement. Text and ordinary display nodes such as `strong` remain allowed. This prevents record-specific controls from disappearing into an adjacent merge; ordinary nonmerged Grid and Form display can still return application-owned interactive DOM.[^render][^controls-browser]

Each cloned `data-error-for` region receives a document-unique ID and `aria-live="polite"` if not authored. The matching field control includes that ID in `aria-describedby`; failed validation sets `aria-invalid="true"` and writes issue text. A pass restores the control's authored `aria-invalid` state. The table retains native semantics and does not acquire `role="grid"`. When the focused row leaves the visible slice, focus moves to another available control, header button, or the table root. Authors still provide labels and table headings.[^grid]

With the default `toggleSelection: false`, single row buttons keep their existing active-detail behavior and a multiple plain activation replaces selected membership. With `multiple: true`, Ctrl/Meta toggles one ID, Shift replaces it with the eligible range in current visible page order, and Ctrl/Meta+Shift adds that range. Range selection excludes `canSelect`-ineligible rows; an anchor outside the page cannot extend across pages. ArrowUp/ArrowDown/Home/End move focus among eligible logical-page selection buttons, revealing offscreen targets in viewport mode; adding Shift also selects the range, starting from the focused row when no visible anchor exists. Ctrl/Meta+A replaces membership with eligible visible IDs, and Escape clears membership while retaining active detail identity. Enter/Space use native button activation; checkboxes and header controls keep native keyboard behavior. These Grid shortcuts apply only while a row selection button has focus, preserving editor shortcuts.[^grid][^selection]

# Pitfalls

| Code | Cause |
|---|---|
| `GRID_ROOT`, `GRID_TEMPLATE`, `GRID_IN_USE` | Wrong table root, missing/duplicate row template, or a second live binding. |
| `GRID_STATUS`, `GRID_EMPTY` | Invalid status projection or repeated/nonstatic/unsupported empty marker. |
| `GRID_DEFAULTS` | Ambiguous/conflicting native defaults, failed parser, asynchronous or uncloneable result. |
| `GRID_PROGRESSIVE` | Invalid prefix size/delay or cooperative binding configuration. |
| `GRID_BIND` | Row hook, completion callback, resource registration or cleanup failure; includes phase and applicable RowId/cause. |
| `GRID_BIND_REENTRANT`, `GRID_BIND_STALE` | Reentrant row binding, or Rows/view/column mutation during a row callback. |
| `DUPLICATE_ID` | A fixed ID appears inside the repeated template. |
| `GRID_SELECT`, `GRID_OPTIONS`, `GRID_FORMAT` | Invalid selection control, option markers/source, or formatter on a Select or non-text input. |
| `GRID_ERROR_REGION` | Repeated or unmatched `data-error-for` path in the template. |
| `GRID_MERGE` | A malformed/non-display merge cell, a cell not spanning its complete block, or a nonscalar merge key. |
| `GRID_FILE_ROWS`, `GRID_CONTROL` | Bound file input, unsupported native type, or malformed/mixed/repeated choice group. |
| `GRID_PARSE_FIELD` | A number/range input lacks a parser, or a parser is not a function or names a missing/ambiguous field or boolean/array control. |
| `GRID_VALIDATE` | Invalid validation timing or nonboolean invalid-row reveal option. |
| `GRID_CHECK_MODE` | Unknown check mode or a single-check proposal with more than one eligible ID. |
| `UI_RENDER` | Invalid explicit render configuration, callback failure, recursive rendering, or an invalid/owned/async returned value. |
| `GRID_COLUMNS`, `GRID_COLUMN_MARKUP` | Invalid full state/callback, broken column keys/group membership/spans, or malformed resize control. |
| `GRID_SORT`, `GRID_PAGE` | Invalid sort indicator/comparator or local page request. |
| `GRID_VIEWPORT`, `GRID_VIEWPORT_MARKUP`, `GRID_VIEWPORT_ROW` | Invalid viewport root/estimate/overscan, a span escaping the logical record, or reveal outside the current logical page. |
| `GRID_VIEWPORT_ALIGN`, `GRID_SCOPE` | Malformed reveal options/alignment or an unknown rowIds scope. |
| `GRID_HEIGHT` | Invalid root/handle/bounds/name, duplicate root ID or a height root/handle already owned by another binding. |
| `GRID_SELECTION`, `GRID_CHECK` | Invalid mode/callback/eligibility result, ID batch, before-hook result, check scope/flag, or stale reentrant transition. |
| `GRID_FILTER` | Unknown column key, invalid scalar filter/value/label/search, predicate or authored filter control, or stale choice calculation after a Rows/manual/column mutation. |
| `GRID_ACTION` | Invalid action callback or named row action button. |
| `GRID_PASTE` | Invalid native-paste option or result callback. |
| `GRID_PASTE_TEXT`, `GRID_PASTE_TARGET` | Non-string API input, malformed quoted TSV, or missing/nonvisible/ambiguous start. Malformed TSV becomes a returned `paste` issue; invalid API input or target throws. |
| `GRID_PASTE_BUSY`, `GRID_PASTE_STALE` | Reentrant preparation or a callback changing the captured store, view, layout or drafts. |
| `GRID_ROW`, `GRID_DISPOSED` | Missing/deleted row or use after disposal. |
| `SELECT_OWNED` | Trying to bind a Grid-owned Select again. |
| `RULE_DECLARATION`, `RULE_UNKNOWN`, `RULE_ARGUMENT`, `RULE_FAILED` | Invalid, unavailable, malformed, or failed rule. |
| `FIELD_PATH` | Unsafe path or nested write through a non-object. |

`RowId` is neither a DOM ID nor a display index. Grid edits authored native value controls; file inputs remain outside JSON Rows, and unsupported/button inputs are rejected. Header filter Selects keep their separate column-filter contract. A plain `data-field` display has no generated editor but can receive whole-field clipboard/API paste. `data-format` is only for text-like inputs, textareas and text elements. An error region and field must use the same exact path. A Select's `data-options` names its row-local option array; `data-field` names its selected scalar or array. A Select owned by Grid cannot also be bound with `bindSelect`. Without `initialPage`, `viewport` or `progressive`, binding creates all row clones. Local paging limits the logical page; viewport limits mounted DOM; progressive limits admitted records. `setPage(null)` removes local paging while retaining optional viewport/progressive policies. Offscreen formatter/renderer errors surface when a row mounts; invalid row-local options also surface on validation/paste. Fix the source/rule before retrying a failed mount, scroll or reveal. Loaded-prefix binding belongs to Grid; native scroll/auto-loop policy and transport cancellation stay in the application/page layer. Virtualization does not reduce the Rows store itself.[^grid][^owner][^viewport]

Row insertion/movement/copy use caller-owned Rows: `add(value, before?)`, `move(id, before?)`, `copy(id, before?)`. Targets are live store IDs. Current sort/filter/page still determines displayed order; viewport anchoring follows RowId. Movement preserves drafts/errors and the focused row node, including nonviewport rendering. Selected/checked arrays are reconciled to store order and normal post-change callbacks observe committed DOM, bypassing vetoes for this forced reconciliation. Active identity and membership stay unchanged unless eligibility changes. See [Rows](data.md) for no-ops, value reversion and business-key responsibility.[^grid][^selection]

# Known issues

A CSS-only font/line-height reduction that leaves table and scroll-root dimensions unchanged can be masked by the active merge height floors and produce no resize notification. The smaller natural heights take effect on the next normal data/view/column/scroll/geometry update.[^blocks][^viewport]

# Related

[Grid compositions](grid-compositions.md) gives tested current-value projections, native post-edit observation and authored template/topology inspection. Keep those application choices outside the public API.

[Rows](data.md) owns identity and changes. [UI contracts](ui.md) defines `RuleSet`, handles, and results. [Form](form.md) shares the private rule runner. [Pagination](pagination.md) can use `grid.page()`. [The M6 plan](../implementation/m6-plan.md) records this milestone's migration scope. [The interactive Grid demo](grid-demo.md) exercises every implemented option, method, and declarative marker. [The two-layout example](advanced-grid-example.md) shows grouped headings and sticky positioning with authored HTML/CSS and no new API.

[^columns]: Private native column topology and resize ownership
[^blocks]: Private authored record structure and native adjacent merging
[^blocks-browser]: Multi-row identity, spans, merging, physical ARIA and bounded geometry
[^viewport]: Private measured viewport, anchoring, spacers and lifetime
[^height]: Private authored height control and property-scoped restoration
[^geometry-browser]: Pointer and keyboard height controls, sticky footer and reveal alignment
[^detail-browser]: Immutable logical row scopes and public reveal boundaries
[^viewport-browser]: Logical scopes, bounded DOM, focus, measurements and lifecycle regressions
[^selection]: Private active identity, membership, eligibility, and transition ordering
[^filters]: Private scalar column filters and choice counts
[^select]: Native Select binding reused for header filters
[^grid]: Grid binding and validation runtime
[^rules]: Shared Form/Grid rule runner
[^native]: Shared native field values, display and constraints
[^render]: Private explicit field rendering and DOM ownership
[^controls-browser]: Native groups, values, validation timing, display and MDI regressions
[^render-browser]: Renderer preflight, returned nodes, errors and reentry regressions
[^checks-browser]: Independent membership and exclusive check regressions
[^path]: Safe nested field paths
[^options]: Shared private row-local options
[^owner]: Shared Select ownership
[^hooks]: Private synchronous row binding and resource ownership
[^lifecycle-browser]: Status, defaults, callbacks, cleanup, empty state and failure regressions

[^toggle-browser]: Native selection toggle, veto and lifecycle regressions

[^filter-browser]: Applied search, zero counts and callback ownership regressions
[^progressive-browser]: Cooperative completion, cancellation, callback and bounded-work regressions
