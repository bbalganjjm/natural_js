---
type: API Reference
title: Natural-JS 2.0 UI contracts
description: Shared rule, validation, selection, and page types for the implemented HTML-bound UI.
tags: [ui, typescript, binding]
status: draft
symbols: [RuleContext, FormatRule, ValidateRule, ParseInput, RuleSet, ValidationIssue, ValidationResult, PageRequest, PageInput, PageState, SelectValue, SelectChoice, SelectSelection, SelectHandle, PaginationHandle, FormHandle, SortIndicator, GridColumn, GridIdsChange, GridRowScope, GridCheckState, GridFilterChoice, ListHandle, GridHandle]
sources:
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public UI types and runtime exports
    git_blob: 6610eb68f3b484b5eccd323c116ceef61d21b8db
  - id: selection
    resource: ../../src/ui/grid-selection.ts
    title: Private Grid identity, membership, and check contracts
    git_blob: d13fed2fbb25d7d936a9629266fef0c0a117867c
  - id: filters
    resource: ../../src/ui/grid-filters.ts
    title: Private Grid scalar filters and choice counts
    git_blob: fd1b4b22060a716b1351e8c3029f76c0b0ca3964
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Logical-page and mounted-row Grid contracts
    git_blob: a74a48cfcd0f7e506b471338bfc0ec26813eb910
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Private measured viewport, anchoring and lifetime
    git_blob: 4a6d52ef382fb5da76a8fe47d4bfafbd3b6a1b1f
  - id: viewport-browser
    resource: ../../tests/browser/grid-viewport.spec.ts
    title: Viewport scope, focus and lifecycle regressions
    git_blob: 94b18cca941e2a8e5003c91a0346d4c07fa9b0cd
generated: { by: codex/gpt-6, at: 2026-10-18T11:23:05Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T22:14:07Z }
  - { by: codex/gpt-6, at: 2026-10-18T11:23:05Z }
---

The `./ui` entry exports the HTML-bound Form, Grid, List, Select, Pagination, Popup, Tabs, Tree, DatePicker, Notify, and Documents functions and their types. The types below keep callbacks, values, and component handles explicit; no generic component registry is exported.[^ui]

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `RuleContext` | Field, values snapshot, row identity, optional field element | Rule context |
| `FormatRule` | Value, arguments, context | Display string |
| `ValidateRule` | Value, arguments, context | Boolean or message |
| `ParseInput` | Entered string and context | Raw candidate |
| `RuleSet` | Formatter, validator, message, locale maps | Per-component rules |
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
| `GridColumn` | Readonly `key`, optional positive preferred `width`, optional `hidden` | Column state |
| `GridIdsChange` | Readonly `ids: readonly RowId[]`, `previous: readonly RowId[]`, `event: Event \| null` | Membership transition |
| `GridRowScope` | `"visible" \| "filtered" \| "store"` | Explicit check scope |
| `GridCheckState` | Readonly booleans `checked`, `indeterminate`; numbers `total`, `count` | Eligible scope aggregate |
| `GridFilterChoice` | Readonly `value: SelectValue`, `label: string`, `count: number` | One raw column choice and matching-row count |
| `GridHandle<T>` | Column state, active identity, independent selected/checked membership, sort, column/manual filters, page, reveal, validation, atomic paste, disposal | Grid handle |

# Grid state methods

These methods extend the existing active-detail `select(id)` / `selected()` contract. `multiple` defaults to `false` and enables UI batch gestures only; the full-set methods are always available. Returned membership arrays, check states and filter choices are frozen. Pure state/view changes do not edit Rows.[^ui][^selection][^filters]

| Method | Result or effect |
|---|---|
| `selectedIds(): readonly RowId[]` | Selected membership in store order. |
| `setSelected(ids: readonly RowId[]): void` | Replace the selected set after complete ID/eligibility validation. |
| `checkedIds(): readonly RowId[]` | Checked membership in store order. |
| `setChecked(ids: readonly RowId[]): void` | Replace the independent checked set after complete validation. |
| `checkAll(checked: boolean, scope: GridRowScope): void` | Add/remove eligible scope IDs, preserving checks outside the scope. |
| `checkState(scope: GridRowScope): GridCheckState` | `total` eligible scope rows, `count` checked, full/mixed flags; an empty scope has both flags false. |
| `columnFilter(key: string): readonly SelectValue[] \| null` | Raw filter state: `null` all, `[]` none, `[null]` raw null only. |
| `setColumnFilter(key: string, values: readonly SelectValue[] \| null): void` | Replace one configured column filter; columns and the manual filter combine with AND. |
| `filterChoices(key: string, search?: string): readonly GridFilterChoice[]` | Choices/counts under manual and other-column filters, excluding this column's filter and paging; optional label search only narrows choices. |

`visible` means the complete current filtered page, including unmounted rows with viewport rendering; `filtered` means all matching rows before paging, and `store` means every nondeleted row. `canCheck` determines eligibility for these aggregates and operations; a disabled native checkbox only blocks its own UI gesture. Number `1` and string `"1"` remain different filter values. Binder options and native markers are listed in [Grid](grid.md), alongside keyboard and restoration rules.[^selection][^filters][^grid]

`GridIdsChange` reports selected or checked membership, while `onSelect` continues to report active detail identity. Before hooks return a strict boolean or `undefined`; `false` vetoes the whole proposal. Reentrant state, Rows or sort/filter/page changes invalidate an outer proposal even if the projected IDs stay identical. Post callbacks see committed state and DOM; their exceptions propagate without rolling it back. Forced pruning bypasses veto and notifies after visible rows and scopes commit.[^selection]

# Grid paste

`GridHandle<T>.paste(text: string, start: { readonly id: RowId; readonly field: string }): ValidationResult` validates a whole-field TSV matrix and commits its writable cells through one `Rows.setMany`. It starts at a visible store-local ID and exact field path, follows current sorted/filtered page and visible bound-field order, and rejects overflow without creating rows. It reuses `ValidationResult`; there is no separate public clipboard or transaction type.[^ui]

The binder's optional `paste: true` enables native `text/plain` handling; the method is always available. `onPaste?: (result: ValidationResult) => void` receives accepted or rejected completed attempts and has no event argument. Native paste replaces whole fields rather than inserting at the caret. Complete candidate validation includes retained drafts, but only pasted fields are saved. Protected controls consume positions without writes, typed Select matches retain raw values, and invalid attempts preserve data/input while updating accessible issues. [Grid](grid.md) defines quoting, disabled/ambiguous choices, cancellation, stale preparation and observer-error rules. Catching a post-commit exception does not imply rollback.[^ui]

# Grid viewport

`bindGrid` accepts inline `viewport?: { root: HTMLElement; estimate: number; overscan?: number }`. The distinct same-document ancestor root supplies finite authored height and scrolling; estimate is a positive finite CSS-pixel starting row height, refined from measurements. Overscan is a nonnegative safe integer row count, default 3. There is no public viewport manager or geometry type.[^grid][^viewport]

`GridHandle<T>.reveal(id: RowId): void` scrolls a row in the current logical page to the nearest visible edge without changing selection or focus. Filtered-out, off-page and missing/deleted IDs raise `GRID_VIEWPORT_ROW`. It also works without viewport mode through native scrolling. The mounted window stays separate from logical check/range/paste scope; one distant focused row may remain attached. Offscreen validation/paste reuse raw choice plans and private cached HTML-validation controls rather than mounting every target. Native ARIA row positions include authored static rows and the complete logical page; owned spacers are hidden from accessibility. See [Grid](grid.md) for authored CSS, keyboard, row-span and cleanup rules.[^grid][^viewport][^viewport-browser]

# Pitfalls

A `GridColumn.key` identifies an authored column; it is independent of a data field path or DOM ID. Read `grid.columns()` and replace the whole immutable state through `setColumns`. Widths are CSS-pixel preferences under native table constraints. Group members remain contiguous and one column stays visible; see [Grid](grid.md) for topology, callbacks and keyboard rules.[^ui]

A `PageRequest` does not carry `total`; read `list.page()` or `grid.page()` after a local slice and pass that `PageState` to Pagination. The page index is one-based; an empty result has `page: 1` and `pages: 0`.[^ui]

Use an authored native `<button type="button">` and a page/controller event handler for ordinary actions. M6 has no `bindButton` export or framework button theme.

A parser sees one snapshot of all currently entered, still unparsed drafts in `RuleContext.values`; parser order does not change that snapshot. Validator `RuleContext.values` uses typed candidates for successfully parsed fields; a field whose parser fails retains its entered draft there and reports a parse issue. Each `ValidateRule` receives its own field value as a string. Formatters see stored row values. A rule's `element` may still be detached when the component initializes; use `element.isConnected` if connection matters. Form, Grid, and List resolve JSON `data-format` and `data-validate` tuples through one private UI rule runner; the tuple shape is not a separate public type. A per-component `RuleSet` may override a retained built-in name. Unknown names and invalid built-in arguments fail at binding. Formatters and validators used by the UI remain; they are not a public utility package.[^ui]

# Related

[Form](form.md), [Grid](grid.md), [List](list.md), [Select](select.md), [Pagination](pagination.md), [Popup](popup.md), and [Tabs](tabs.md), [Tree](tree.md), and [DatePicker](datepicker.md), [Notify](notify.md), and [Documents](documents.md) document runtime behavior. [The M1 contract](../implementation/m1-contract.md) records the first-release boundary.

[^ui]: Public UI types and runtime exports
[^selection]: Private Grid identity, membership, and check contracts
[^filters]: Private Grid scalar filters and choice counts
[^grid]: Logical-page and mounted-row Grid contracts
[^viewport]: Private measured viewport, anchoring and lifetime
[^viewport-browser]: Viewport scope, focus and lifecycle regressions
