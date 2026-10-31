---
type: API Reference
title: Natural-JS 2.0 UI contracts
description: Shared rule, validation, selection, and page types for the implemented HTML-bound UI.
tags: [ui, typescript, binding]
status: draft
symbols: [RuleContext, FormValueContext, FormatRule, ValidateRule, ParseInput, FieldRules, RuleSet, ValidationIssue, ValidationResult, PageRequest, PageInput, PageState, SelectValue, SelectChoice, SelectSelection, SelectHandle, PaginationHandle, FormHandle, SortIndicator, GridColumn, GridIdsChange, GridRowScope, GridCheckState, GridFilterChoice, ListHandle, GridHandle, GridBindResult]
sources:
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public UI types and runtime exports
    git_blob: 30196434ef6930be3b021b0879f87e5287b5d932
  - id: selection
    resource: ../../src/ui/grid-selection.ts
    title: Private Grid identity, membership, and check contracts
    git_blob: 1b74c39d3161345aec1c9d0c3dd9de49c947f23d
  - id: filters
    resource: ../../src/ui/grid-filters.ts
    title: Private Grid scalar filters and choice counts
    git_blob: a9a6604b72bf9077bf8cbf8f8db91bf0c774f7a8
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Logical-page and mounted-row Grid contracts
    git_blob: 567439878a74284e7a1f60c6898d636322c190e5
  - id: hooks
    resource: ../../src/ui/grid-hooks.ts
    title: Private row callback and resource ownership contract
    git_blob: 628b69014fd77f0f18e5e8c84d2953c1a9401bb9
  - id: lifecycle-browser
    resource: ../../tests/browser/grid-lifecycle.spec.ts
    title: Status, native defaults, callback and teardown regressions
    git_blob: 08db552a81aa4efa98268ec803e4d4116ba2ec0d
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Private measured viewport, anchoring and lifetime
    git_blob: d02fbfe5407b80786733034f2f5aaaea5d71ef55
  - id: viewport-browser
    resource: ../../tests/browser/grid-viewport.spec.ts
    title: Viewport scope, focus and lifecycle regressions
    git_blob: 94b18cca941e2a8e5003c91a0346d4c07fa9b0cd
  - id: form
    resource: ../../src/ui/form.ts
    title: Form field options and explicit display
    git_blob: 7b5d6f99b96cf413f277169eafbba722f7e350d1
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Private shared native field values and constraints
    git_blob: 0a94918ba94c3f153c8de51e1b7036c2ab868363
  - id: render
    resource: ../../src/ui/field-render.ts
    title: Private explicit render preflight and DOM ownership
    git_blob: 676d0e69a7cfc6eafab93b3abf5cd32c1a5a4a6c
generated: { by: codex/gpt-6, at: 2026-10-31T10:01:54Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T22:14:07Z }
  - { by: codex/gpt-6, at: 2026-10-31T10:01:54Z }
---

The `./ui` entry exports the HTML-bound Form, Grid, List, Select, Pagination, Popup, Tabs, Tree, DatePicker, Notify, and Documents functions and their types. The types below keep callbacks, values, and component handles explicit; no generic component registry is exported.[^ui]

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `RuleContext` | Field, values snapshot, row identity, optional field element | Rule context |
| `FormValueContext` | RuleContext with bind/val phase, nonnull RowId and primary HTMLElement | Rows-backed Form value callback context |
| `FormatRule` | Value, arguments, context | Display string |
| `ValidateRule` | Value, arguments, context | Boolean or message |
| `ParseInput` | Entered string and context | Raw candidate |
| `FieldRules` | Optional readonly format/validate tuple lists | One field's declarations |
| `RuleSet` | Formatter/validator catalogs, messages, locale and optional fields map | Per-component rules |
| `ValidationIssue` | Row, field, rule, message, optional element | One failure |
| `ValidationResult` | `valid` plus `issues` | Collected failures |
| `PageRequest` | One-based `page`, positive `size` | Requested slice |
| `PageInput` | `PageRequest` plus nonnegative `total` | Pagination input |
| `PageState` | `PageInput` plus computed `pages` | Normalized page state |
| `SelectValue` | `string | number | boolean | null` | Choice raw scalar |
| `SelectChoice<V>` | `label`, `value`, optional `disabled` | Generated option input |
| `SelectSelection<V>` | `V | string | null` | Raw choice or authored string |
| `SelectHandle<V>` | `setChoices`, `setValue`, `value`, `dispose` | Select handle |
| `PaginationHandle` | `set`, `state`, `dispose` | Pagination handle |
| `FormHandle<T>` | `bind`, `read`, `validate`, `dispose` | Form handle |
| `SortIndicator` | Header `column`, ascending/descending `direction` | Grid ARIA sort state |
| `ListHandle<T>` | Selection, sort, filter, page, validation, disposal | List handle |
| `GridColumn` | Readonly `key`, optional positive preferred `width`, optional boolean `hidden`/`pinned`; visible pins form a leading prefix | Column state |
| `GridIdsChange` | Readonly `ids: readonly RowId[]`, `previous: readonly RowId[]`, `event: Event \| null` | Membership transition |
| `GridRowScope` | `"visible" \| "filtered" \| "store"` | Explicit row-identity or check scope |
| `GridCheckState` | Readonly booleans `checked`, `indeterminate`; numbers `total`, `count` | Eligible scope aggregate |
| `GridFilterChoice` | Readonly `value: SelectValue`, `label: string`, `count: number` | One raw column choice and matching-row count |
| `GridHandle<T>` | Immutable row scopes, status/column state, native defaults, refresh, active identity, selected/checked membership, sort/filter/page, aligned reveal, validation, paste, disposal | Grid handle |

# Grid state methods

These methods extend the existing active-detail `select(id)` / `selected()` contract. `multiple` defaults to `false` and enables UI batch gestures only; the full-set methods are always available. Returned membership arrays, check states and filter choices are frozen. Pure state/view changes do not edit Rows.[^ui][^selection][^filters]

| Method | Result or effect |
|---|---|
| `statusFilter(): readonly RowStatus[]` | Frozen canonical status projection; RowStatus is the existing data-entry type. |
| `setStatusFilter(values: readonly RowStatus[]): void` | Canonicalize known statuses before other view filters; empty hides all rows and an equivalent proposal preserves bindings/focus. |
| `defaults(): Record<string, unknown>` | Detached authored native defaults with own parsers; the application factory supplies a complete business row. |
| `refresh(): void` | Retry/re-evaluate current bindings without replacing Rows or discarding drafts, selection and identity. |
| `selectedIds(): readonly RowId[]` | Selected membership in store order. |
| `setSelected(ids: readonly RowId[]): void` | Replace the selected set after complete ID/eligibility validation. |
| `checkedIds(): readonly RowId[]` | Checked membership in store order. |
| `setChecked(ids: readonly RowId[]): void` | Replace the independent checked set after complete validation; single check mode allows zero or one ID. |
| `checkAll(checked: boolean, scope: GridRowScope): void` | Add/remove eligible scope IDs under the configured check mode; single mode rejects a true proposal with more than one eligible scope ID. |
| `checkState(scope: GridRowScope): GridCheckState` | `total` eligible scope rows, `count` checked, full/mixed flags; an empty scope has both flags false. |
| `columnFilter(key: string): readonly SelectValue[] \| null` | Raw filter state: `null` all, `[]` none, `[null]` raw null only. |
| `setColumnFilter(key: string, values: readonly SelectValue[] \| null): void` | Replace one configured column filter; columns and the manual filter combine with AND. |
| `filterChoices(key: string, search?: string): readonly GridFilterChoice[]` | Choices/counts under status, manual and other-column filters, excluding this column's filter and paging; optional label search only narrows choices. |

`visible` means the complete current filtered page, including unmounted rows with viewport rendering; `filtered` means all matching rows before paging, and `store` means every nondeleted row. `canCheck` determines eligibility for these aggregates and operations; a disabled native checkbox only blocks its own UI gesture. Number `1` and string `"1"` remain different filter values. Binder options and native markers are listed in [Grid](grid.md), alongside keyboard and restoration rules.[^selection][^filters][^grid]

`GridIdsChange` reports selected or checked membership, while `onSelect` continues to report active detail identity. Before hooks return a strict boolean or `undefined`; `false` vetoes the whole proposal. Reentrant state, Rows or sort/filter/page changes invalidate an outer proposal even if the projected IDs stay identical. Post callbacks see committed state and DOM; their exceptions propagate without rolling it back. Forced pruning bypasses veto and notifies after the view commits or a failed view/setter rolls back. A subsequent callback append keeps its new page totals; active/selected eligibility never implicitly clears independent eligible checks.[^selection][^grid][^lifecycle-browser]

`checkMode?: "multiple" | "single"` is an inline Grid option, separate from `multiple` selection gestures. Multiple mode is the default. Single checking replaces the previous ID atomically through the same hooks; `setChecked` and `checkAll(true, scope)` never silently pick a first row. [Grid](grid.md) defines empty/one/many scope behavior and disabled header checks; no new public check-mode type or getter is added.[^grid][^selection]

# Form value callbacks

Rows-backed Form has separate beforeBindValue/onBindValue callbacks receiving unknown and FormValueContext. This context extends RuleContext with phase "bind" or "val", nonnull rowId and the primary bound HTMLElement. Undefined preserves the projected value; all other supported returns, including false, replace presentation without changing Rows. Local Forms reject these options. See [Form value callbacks](form.md#value-callbacks) for raw validation, caching, focus and error rules.[^ui][^form]

# Grid binding callbacks

Grid accepts `statusFilter?: readonly RowStatus[]`, defaulting to clean/insert/update. Shown deleted records retain their last committed values and remain noneditable/ineligible; authored row actions can offer Undo. Their delete save payload still uses the loaded original. Every physical record tr gets `data-row-status`, and table `data-changed` reports any pending Rows changes. Author labels and styles.[^grid][^lifecycle-browser]

`beforeRowBind` and `onRowBind` infer `{ row, elements, own }` from the binder signature. The immutable row snapshot and readonly physical-row array identify one binding; `own(() => void)` registers synchronous resources for reverse cleanup on rebind, release, failure and disposal. Before runs on rows attached to their table before values; after runs after field binding and synchronous-mode placement. Progressive rows are attached and fully bound before shared chunk geometry commits; onBind sees the completed chunk layout. Rows are document-connected only when their table root is connected; connect the root before initializing or measuring layout-dependent widgets. No lifecycle manager or row-context type is added to the public UI entry. [Grid](grid.md#row-binding-and-owned-resources) defines late registration, reentrancy, cleanup failures and deletion protection.[^hooks][^grid]

`onBind` receives the frozen eight-field `GridBindResult` defined below. It runs after initial, replace/append, explicit view and refresh binding, including empty results; progressive mode also reports completed chunks and explicit reveal growth. Ordinary mutations, viewport movement and exhausted continuations do not emit it. Use application code for counters and loading; `Rows.append` loads clean data while `Rows.add` creates an inserted business row.[^grid][^lifecycle-browser]

# Field options

Grid and Rows-backed Form write `data-field-changed="true"` or `"false"` on every bound field member by comparing its committed raw path with `Rows.original(id)`. Nested paths and grouped values remain independent of formatted display and invalid or deferred drafts. Inserted rows have no baseline and receive `"false"`; deleted Grid rows retain their last committed field flags. A focused field's flag updates even when its entered text is preserved. Local Form leaves this attribute application-owned; Rows-backed Form restores authored values or absence on disposal, while Grid restores untouched template nodes. [Form](form.md#loaded-value-changes) and [Grid](grid.md#field-change-markers) define the complete ownership and comparison rules.[^form][^grid]

Grid accepts inline `validateOn?: "change" | "blur" | "manual"` (default `"change"`) and `revealInvalid?: boolean` (default `false`). They control draft commit timing and optional current-page error reveal/focus; explicit `validate()` remains the save gate. Native groups compile as one field: boolean single checkbox, string-array repeated checkboxes, string/null radio, and an always-array multiple Select whose row-local options retain raw scalar types. [Grid](grid.md) defines native type fallback, Enter, protected groups and quoted JSON-array paste.[^grid][^native]

Form/Grid also accept autoValidate?: boolean, default true. False bypasses automatic constraints while preserving existing timing/integrity and complete explicit validation/paste. RuleSet.fields supplies typed declarations independently of the function catalogs. [Shared rules](rules.md) defines precedence, empty overrides and application-owned shared/local composition.[^form][^grid][^native]

Form and Grid accept `render?: Record<string, (value: unknown, context: RuleContext) => Node | string | null>`. A configured display callback is synchronous and returns literal text, `null`, or a fresh disconnected same-document Element/Text/DocumentFragment. `UI_RENDER` reports invalid targets/results, callback causes and recursive target updates. No public renderer type, registry, HTML parser or sanitizer is added. [Form](form.md#explicit-display) and [Grid](grid.md#display-rendering) define preflight and restoration. List shares native value/constraint operations but has no `render` option.[^form][^grid][^render][^native]

Rows-backed Form accepts the same explicit data-options/data-option-label/data-option-value markers as Grid/List. Option-node maps preserve raw types and consume one matching option per requested occurrence. Marked choices reject string parsers; unmarked/local Select contracts remain unchanged. [Form](form.md#row-local-typed-choices) defines target-row validation, raw drafts, source preparation and exact authored restoration. These operations add no public type, option or handle method.[^form]

# Grid paste

`GridHandle<T>.paste(text: string, start: { readonly id: RowId; readonly field: string }): ValidationResult` validates a whole-field TSV matrix and commits its writable cells through one `Rows.setMany`. It starts at a visible store-local ID and exact field path, follows current sorted/filtered page and visible bound-field order, and rejects overflow without creating rows. It reuses `ValidationResult`; there is no separate public clipboard or transaction type.[^ui]

The binder's optional `paste: true` enables native `text/plain` handling; the method is always available. `onPaste?: (result: ValidationResult) => void` receives accepted or rejected completed attempts and has no event argument. Native paste replaces whole fields rather than inserting at the caret. Complete candidate validation includes retained drafts, but only pasted fields are saved. Protected controls and shown deleted lines consume positions without writes; a deleted starting ID fails. Typed Select matches retain raw values, and invalid attempts preserve data/input while updating accessible issues. [Grid](grid.md) defines quoting, disabled/ambiguous choices, cancellation, stale preparation and observer-error rules. Catching a post-commit exception does not imply rollback.[^ui][^lifecycle-browser]

# Grid viewport

`bindGrid` accepts inline `viewport?: { root: HTMLElement; estimate: number; overscan?: number }`. The distinct same-document ancestor root supplies finite authored height and scrolling; estimate is a positive finite CSS-pixel starting row height, refined from measurements. Overscan is a nonnegative safe integer row count, default 3. There is no public viewport manager or geometry type.[^grid][^viewport]

`GridHandle<T>.rowIds(scope: GridRowScope): readonly RowId[]` returns frozen logical IDs: visible is the complete page including unmounted records, filtered is the sorted status/manual/column projection before paging, and store is live Rows order. Visible/filtered include explicitly shown tombstones; no selection/check eligibility predicate runs. Old snapshots remain unchanged. Applications derive detail neighbors by ID and skip tombstones before Form binding.[^grid]

`GridHandle<T>.reveal(id: RowId, options?: { block?: ScrollLogicalPosition }): void` aligns a current-page record with nearest (default), start, center or end without selecting or focusing it. Malformed options raise GRID_VIEWPORT_ALIGN; filtered-out/off-page/missing IDs raise GRID_VIEWPORT_ROW. Explicitly displayed tombstones may be revealed read-only. The viewport accounts for top-sticky headings and bottom-sticky footers; nonvirtual tables use native scrolling with authored scroll-padding/margins. One distant focused record may remain attached. Offscreen validation/paste reuse raw choice plans and cached HTML probes, while native ARIA positions describe the full logical page. See [Grid](grid.md) for the authored heightResize option, pointer/keyboard control, scopes and cleanup.[^grid][^viewport][^viewport-browser]

# Pitfalls

A `GridColumn.key` identifies an authored column; it is independent of a data field path or DOM ID. Read `grid.columns()` and replace the whole immutable state through `setColumns`. Widths are CSS-pixel preferences under native table constraints. Group members remain contiguous and one column stays visible; see [Grid](grid.md) for topology, callbacks and keyboard rules.[^ui]

A `PageRequest` does not carry `total`; read `list.page()` or `grid.page()` after a local slice and pass that `PageState` to Pagination. The page index is one-based; an empty result has `page: 1` and `pages: 0`.[^ui]

Use an authored native `<button type="button">` and a page/controller event handler for ordinary actions. M6 has no `bindButton` export or framework button theme.

A parser sees one snapshot of all currently entered, still unparsed drafts in `RuleContext.values`; parser order does not change that snapshot. Validator `RuleContext.values` uses typed candidates for successfully parsed fields; a field whose parser fails retains its entered draft there and reports a parse issue. Each `ValidateRule` receives its own field value as a string. Formatters see stored row values. A rule's `element` may still be detached when the component initializes; use `element.isConnected` if connection matters. Form, Grid, and List resolve JSON `data-format` and `data-validate` tuples through one private UI rule runner; the tuple shape is not a separate public type. A per-component `RuleSet` may override a retained built-in name. Unknown names and invalid built-in arguments fail at binding. Formatters and validators used by the UI remain; they are not a public utility package.[^ui]

## Grid interaction policy

Grid accepts toggleSelection?: boolean, default false. True toggles unmodified native select-button activations; removing any multiple member clears active identity while preserving other members and checks. Native Enter/Space reuse click. Modifier gestures and absolute select/setSelected/setChecked remain unchanged.[^selection][^grid]

Distinct filter choices retain zero-count values inside the manual/status domain. An optional authored data-apply-filter button applies matching raw values; input alone still previews choices. Blank Apply clears the filter, while data-clear-filter keeps its existing search-preserving behavior. See [Grid](grid.md#apply-a-choice-search) for keyboard, pure callbacks and failure boundaries.[^filters][^grid]

Column checkboxes/All/mixed/count/recovery and action-driven scrolling compose existing columns/setColumns/onColumnsChange and reveal handles. Business labels and policies stay application-owned; no new public chooser type, scroll controller or utility package is added. The [Grid demo](grid-demo.md) provides the authored contract.

## Progressive Grid result and operations

GridBindResult is a readonly frozen eight-field snapshot: total (all retained store records), filtered (status/manual/column projection), visible (full logical page), mounted (actual logical records in DOM), event (Rows event or null), available (admitted logical prefix), first and last. Every mode uses this shape; default synchronous/empty completion has available equal to visible and first/last true. With viewport, admitted records may have no widget until their window is needed; mounted must not be used as an admission or completion count.[^grid]

Optional progressive: { size, delay? } enables cooperative prefix binding. whenBound(): Promise<GridBindResult> observes current work; renderMore() shares its pending Promise or advances/resumes a chunk. cancelBinding(): GridBindResult returns the retained snapshot and aborts the old pending Promise. Async failures stay observable through whenBound; internal handling prevents an unhandled rejection without converting the public rejection into success. Explicit demand/reveal and lifecycle rules are in [Grid](grid.md#progressive-binding-and-operation-lifetime). No named generic task type or separate Rows store is added.[^grid]

# Related

[Form](form.md), [Grid](grid.md), [List](list.md), [Select](select.md), [Pagination](pagination.md), [Popup](popup.md), and [Tabs](tabs.md), [Tree](tree.md), and [DatePicker](datepicker.md), [Notify](notify.md), and [Documents](documents.md) document runtime behavior. [The M1 contract](../implementation/m1-contract.md) records the first-release boundary.

[^ui]: Public UI types and runtime exports
[^selection]: Private Grid identity, membership, and check contracts
[^filters]: Private Grid scalar filters and choice counts
[^grid]: Logical-page and mounted-row Grid contracts
[^viewport]: Private measured viewport, anchoring and lifetime
[^viewport-browser]: Viewport scope, focus and lifecycle regressions
[^form]: Form field options and explicit display
[^native]: Private shared native field values and constraints
[^render]: Private explicit render preflight and DOM ownership
[^hooks]: Private row callback and resource ownership contract
[^lifecycle-browser]: Status, native defaults, callback and teardown regressions
