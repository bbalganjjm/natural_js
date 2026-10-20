---
type: Example
title: Interactive Grid contract demo
description: Exercise every implemented Grid option, method, and declarative marker on one authored native table while inspecting raw Rows state.
tags: [ui, grid, example, accessibility]
status: draft
sources:
  - id: view
    resource: ../../examples/vite/m10/demo.html
    title: Authored table, controls, and observation panels
    git_blob: 29663915ff4d8e261cfaefdabf1412d2fc1a458e
  - id: controller
    resource: ../../examples/vite/m10/demo.ts
    title: Grid options, calls, and Rows state
    git_blob: 41cdcaff87292e68200d4d098fbece83933e4161
  - id: style
    resource: ../../examples/vite/m10/demo.css
    title: Responsive demo styling
    git_blob: 801f48cfce47aae55f04a30dc48b0b2ce7ef8116
  - id: browser
    resource: ../../tests/browser/m10-demo.spec.ts
    title: Interactive Grid behavior and accessibility checks
    git_blob: cd5c2b1a5e41b02a8356afa64114e57eec4f5a9d
  - id: columns-view
    resource: ../../examples/vite/m10/columns.html
    title: Two authored column layouts
    git_blob: 18ab9065fed63f3ef29b99dc03396636e6361efb
  - id: columns-controller
    resource: ../../examples/vite/m10/columns.ts
    title: Independent CVC column controllers
    git_blob: 258c4e7a7ec55304a826ea7fe2059e5d82d43ea4
  - id: columns-browser
    resource: ../../tests/browser/grid-columns.spec.ts
    title: Native column state, lifetime and accessibility regressions
    git_blob: d36cd2d5df6ed96b280f7fa8eb560ad3ef94fc72
  - id: selection-browser
    resource: ../../tests/browser/grid-selection.spec.ts
    title: Independent selection, checks, authored filters and row actions
    git_blob: 7c318e628e0f32dbc4d8c1bd54e2ba6be38167d5
  - id: selection-evidence
    resource: ../implementation/evidence/m106-verification.json
    title: Final M10.6 source, package, browser and performance record
    git_blob: 64b1fb4d57cc1d5720475bd8be4157b77d58f8aa
  - id: paste-browser
    resource: ../../tests/browser/grid-paste.spec.ts
    title: Atomic paste, typed controls, drafts and lifecycle regressions
    git_blob: 7eec047c1dc16e875190bb257809c7530dc4440c
  - id: paste-evidence
    resource: ../implementation/evidence/m107-verification.json
    title: Final M10.7 source, package, browser and performance record
    git_blob: b8cd7bb9b7687ebfd895a57548f124936f54b91c
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current Grid contract and rendering lifetime
    git_blob: a74a48cfcd0f7e506b471338bfc0ec26813eb910
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Private measured viewport, spacer and scroll ownership
    git_blob: 4a6d52ef382fb5da76a8fe47d4bfafbd3b6a1b1f
  - id: viewport-browser
    resource: ../../tests/browser/grid-viewport.spec.ts
    title: Bounded rendering, logical scopes, offscreen paste and focus regressions
    git_blob: 94b18cca941e2a8e5003c91a0346d4c07fa9b0cd
  - id: selection
    resource: ../../src/ui/grid-selection.ts
    title: Independent active row, selection and check state
    git_blob: d13fed2fbb25d7d936a9629266fef0c0a117867c
  - id: filters
    resource: ../../src/ui/grid-filters.ts
    title: Raw column filters and distinct choice counts
    git_blob: fd1b4b22060a716b1351e8c3029f76c0b0ca3964
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public Grid state and handle types
    git_blob: 6610eb68f3b484b5eccd323c116ceef61d21b8db
generated: { by: codex/gpt-6, at: 2026-10-20T11:46:44Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-25T00:41:28Z }
  - { by: codex/gpt-6, at: 2026-10-20T11:46:44Z }
---

The interactive demo is the M10 reference screen for the *implemented* `bindGrid` API. It keeps the table's structure and style in authored HTML/CSS, and exposes the raw store and callback results beside it so a coding agent can see what each action changes.[^view][^controller]

The expanded `2.0.0` scope requires column resize/reorder/hide/show, multiple row selection, atomic bulk paste, real scroll virtualization, and the remaining 1.x Grid user features before release. Column state, multiple selection, independent row checks, authored header sorting/filtering, stable row actions, atomic bulk paste and measured viewport rendering are implemented here. Remaining legacy behavior, including grouped/merged row blocks, stays required. The [feature parity ledger](../implementation/feature-parity.md) records the gaps, and the [parity implementation plan](../implementation/feature-parity-plan.md) defines the contract-review and release gates. Extend this same demo as each required feature is implemented and tested; its coverage is not a claim of complete 1.x parity.[^grid][^viewport]

# Scenario

Run `npm run example` from the repository root and open `/m10/demo.html`. The initial six employee rows include a nested `assignment.shifts` array and nested `profile.team` field; the Dataset selector also supplies 5,000 employees. The table stays native, with grouped sticky headings and a keyboard-focusable scroll region. This is an interactive contract explorer; controlled performance evidence is recorded separately.[^view][^controller][^style]

# Components used

| Owner | Responsibility |
|---|---|
| Authored HTML/CSS | Table headings, labels, field controls, error regions, scroll behavior, and layout. |
| `bindGrid` | Bind mounted rows, measured viewport, editing, active row, independent selection/check sets, sort/filter/page view, validation, atomic paste, and cleanup. |
| `Rows` | Own immutable row snapshots, store-local IDs, change status, and subscription events. |
| Application code | Provide sample rows, comparator, filter predicate, salary parser, custom format/validation rules, and action buttons. |

The demo supplies required `rows`, optional `initialPage`, `viewport`, `columns`, `onColumnsChange`, local `rules` with `format`, `validate`, `messages`, and `locale`, per-field `parse`, and `onSelect`. Selection controls supply `multiple`, `canSelect`, `canCheck`, `beforeSelect`, `beforeSelectionChange`, `onSelectionChange`, `beforeCheckChange`, and `onCheckChange`; authored headers and row actions use `sorts`, `filters`, and `onRowAction`. `paste: true` enables direct native plaintext paste, and `onPaste` displays accepted/rejected results. Its initial-page selector can bind directly to page 1 or 2 with two rows per page; leaving it blank preserves the complete logical-page default. The custom salary rule, name display formatter, comparators and Team value function are application behavior.[^controller][^grid]

# View

One authored `<tr data-row-template>` contains `data-field` paths for plain text, email, nested team, checkbox, textarea, number, and Select fields. `data-format` formats the display name; `data-validate` invokes both built-in `required` and the custom salary rule. The same row includes `data-error-for` regions, a `data-select-row` button, and a row-local Select with `data-options="assignment.shifts"`, `data-option-label="meta.label"`, and `data-option-value="code"`. The independent check uses `<input type="checkbox" data-check-row>` without `data-field`; the Active editor remains a separate Boolean data field. `<button type="button" data-row-action="inspect">` exposes the current row to the application. The repeated row contains no fixed DOM ID. Native email/required constraints work alongside the declared rules.[^view]

The authored header contains `data-sort-column="name"` and `data-sort-column="salary"` buttons, a visible-page `data-check-all="visible"` checkbox, and the Team controls: a multiple `data-filter-column="team"` Select, `data-filter-search="team"` input, and `data-clear-filter="team"` button. Grid binds the filter choices through the existing native Select behavior; the application keeps control of labels and layout.[^view][^grid]

# Controller

The column controls call `columns` and `setColumns` to adjust preferred width, show/hide, move within a group, swap groups, reset, and deliberately reject invalid state. Resize buttons support pointer drag, ArrowLeft/ArrowRight, Shift for 1-pixel steps, Home and Escape cancellation. State and callback panels distinguish committed layout changes from Rows changes.[^controller]

`select` and `selected` address only the active row used by the snapshot and store actions. `selectedIds`/`setSelected` address an independent selection set; `checkedIds`/`setChecked` address an independent check set. The set methods replace the complete set and the getters return frozen IDs in store order. Clearing the active row does not clear either set. The demo's first-two and clear-set controls change membership without changing the active row. `checkAll` and `checkState` expose explicit scopes; `columnFilter`, `setColumnFilter`, and `filterChoices` expose the Team filter and its raw values/counts.[^controller][^selection][^filters][^ui]

Other controls call `setSort` with an authored heading and `aria-sort`, `setFilter`, `setPage` and `page`, `reveal(id)`, `validate(id)` and `validate()`, `paste(text, { id, field })`, and `dispose`. Changing the initial-page selector disposes and rebinds the Grid to show the first-render option; paging controls later use `setPage`. Rebinding after disposal shows template restoration. The Rows controls call `add`, `move`, `copy`, `set`, `remove`, `revert(id)`, `revert()`, `replace`, and `changes()`; accepted paste uses `setMany`. Observation panels show active `RowId`, raw snapshot, both ID sets, scoped check state, filter values/counts, validation issues, before/change callbacks, row actions and the latest Rows event.[^controller]

```ts
const grid = bindGrid(table, {
  rows,
  initialPage: { page: 1, size: 2 },
  viewport: viewportChoice.checked ? { root: scrollRoot, estimate: 150, overscan: 3 } : undefined,
  paste: true,
  onPaste(result) { /* show acceptance or collected cell issues */ },
  columns: defaultColumns,
  multiple: selectionMode.value === "multiple",
  canSelect: disableInactive.checked ? row => row.value.active : undefined,
  canCheck: disableInactive.checked ? row => row.value.active : undefined,
  sorts: { name: (a, b) => a.name.localeCompare(b.name), salary: (a, b) => a.salary - b.salary },
  filters: { team: { value: row => row.profile.team } },
  onColumnsChange({ columns, event }) { /* show immutable layout state */ },
  rules: {
    format: { displayName: value => value.toUpperCase() },
    validate: { payAtLeast: (value, args) => Number(value) >= Number(args[0]) },
    messages: { payAtLeast: "Salary must be at least {0}." },
    locale: locale.value
  },
  parse: { salary: input => input.trim() ? Number(input) : undefined },
  beforeSelect() { return !vetoActive.checked; },
  beforeSelectionChange() { return !vetoSelection.checked; },
  beforeCheckChange() { return !vetoChecks.checked; },
  onSelect({ id, row, event }) { /* show active row and event source */ },
  onSelectionChange({ ids, previous, event }) { /* show selected ID sets */ },
  onCheckChange({ ids, previous, event }) { /* show checked ID sets */ },
  onRowAction({ action, id, row, element, event }) { /* inspect this current row */ }
});
```

The excerpt shows the option shape; use the complete [demo controller](../../examples/vite/m10/demo.ts) for runnable binding, state display, and cleanup.[^controller]

# How it works

In Scroll viewport, enable **Render only rows near the viewport**, then choose **5,000 employees** from Dataset. The authored region becomes 400 CSS pixels high; Grid measures the actual multi-control row heights from an initial 150px estimate. The live output distinguishes store rows, mounted rows and viewport on/off state. Scroll in either direction to see bounded mounting; native sticky headings remain authored CSS. Leave local paging off to explore the full logical dataset.[^view][^controller][^style][^viewport]

Enter a one-based **Row number in store order** and activate **Reveal row without selecting**. The application resolves that position to its RowId, and `grid.reveal(id)` scrolls it into view without selecting it or moving focus. If the row is filtered out or off-page, the status reports `GRID_VIEWPORT_ROW`; reveal does not silently change the current view. Check scope and Shift ranges still include the whole logical page even while most rows are unmounted. API paste can also start at an unmounted logical-page row; it validates raw choice plans without creating every target row.[^view][^controller][^grid][^viewport-browser]

Changing the viewport toggle rebinds Grid; changing Dataset also replaces Rows with new IDs. Both clear active identity, selected/checked sets and uncommitted drafts and reset scrolling. Review edits before changing these controls. Disabling viewport rendering on the 5,000-row dataset deliberately mounts the complete logical page unless local paging is enabled; its cost is visible in the same screen.[^controller]

Choose an initial page before editing to see a bounded first render and `page()` state. Switching this choice rebinds the Grid, clears active selection, both ID sets and uncommitted input, and leaves valid Rows changes intact. A size change clears the initial-page choice and uses `setPage`; choosing no page shows all rows. Change a salary to an invalid value, run validation, and inspect the issue panel: the invalid draft stays outside `Rows.changes()` until corrected. Clear a required email or choice to see HTML validation; set an unavailable shift to see `select-option`. Change the nested team or shift, edit Notes, or toggle Active to see the raw object and status. Switch the built-in-rule locale between English and Korean to inspect its message; the demo rebinds Grid, which clears active selection, checks, selection membership and uncommitted input. Sorting, filtering, and paging retain these states by `RowId`; they do not turn a display position into identity. Programmatic `Rows.set` updates the display and clears stale messages; run validation again to evaluate user rules.[^controller][^grid]

Single mode is the default: row buttons keep the existing active-row behavior. In multiple mode a plain click replaces membership, Ctrl/Meta-click toggles it, and Shift-click selects a range on the current sorted/filtered page. Up/Down and Home/End move focus between eligible row buttons; Shift extends a range, Ctrl/Meta+A selects eligible visible rows, and Escape clears the selection set. Native Enter/Space activates the focused button. These shortcuts stay on row-selection buttons so editable fields keep their native editing behavior.[^controller][^grid][^selection]

Enable the inactive-row policy to supply `canSelect` and `canCheck` from `row.value.active`; it disables the corresponding controls without disabling unrelated editors. Changing that policy or mode rebinds the demo. Before hooks return `false` to veto a proposed change: `beforeSelect` receives `{ id, row, event }`; `beforeSelectionChange` and `beforeCheckChange` receive `{ ids, previous, event }`. A canceled multiple-mode gesture preserves both its active row and membership. State commits before the change callbacks; programmatic events are `null`. Removing/replacing data or making a row ineligible prunes invalid state without allowing a veto to retain missing rows.[^controller][^selection]

Check a row without selecting it, then compare the scope controls. `checkAll(true, scope)` adds eligible IDs in that scope and `checkAll(false, scope)` removes them; checks outside the scope remain intact. `checkState(scope)` returns frozen `{ checked, indeterminate, total, count }`, where `total` counts eligible targets and `count` counts checked targets. A partial scope is mixed. An empty scope reports both flags `false` and both counts `0`; its header checkbox is disabled.[^selection][^ui]

| Scope | Eligible targets |
|---|---|
| `visible` | Rows on the current sorted/filtered page. |
| `filtered` | All rows matching the manual and column filters, before paging. |
| `store` | All live Rows entries, regardless of filtering or paging. |

Header sort buttons cycle ascending, descending, then cleared and update `aria-sort`. The Team column filter combines with the manual Team predicate and other column filters using AND. `setColumnFilter("team", null)` means all values; `setColumnFilter("team", [])` means none. The empty-value button demonstrates the latter; All teams in the header clears only the column filter. `filterChoices("team", search)` returns frozen raw `{ value, label, count }` choices after the manual/other column filters, excluding the Team column's own filter and before paging. Search matches choice labels without changing row filtering or clearing selected values hidden by the search.[^controller][^grid][^filters]

Activate Inspect after sorting, filtering or paging to see `onRowAction` receive `{ action, id, row, element, event }` for the current row snapshot and stable ID. It does not change the active row or either ID set.[^controller][^grid]

The Atomic bulk paste panel provides a Start field selector, TSV textarea, Paste at active row button and live status output. First activate a visible row with at least one following visible row, keep the default column order, and leave Start field at Email. The supplied two-row sample maps Email, protected Phone, nested Team, raw numeric Shift code, Boolean Active, Notes and Salary. The first Notes cell contains a quoted newline. Phone consumes its source cell without changing its stored value. The accepted sample saves both rows in one `setMany` event; the observation panels show the changed snapshots and collected result. Shift matches raw codes `2` and `4`, rather than their labels, and Active requires `true` or `false`.[^view][^controller][^grid]

Change the sample to an invalid email, unknown shift, invalid salary or excess row/field to see the whole paste rejected with row/field issues; prior data and entered drafts remain. Pasting at the last visible row rejects the supplied two-row sample instead of creating a row or advancing the page. Moving or hiding columns changes paste positions, so adapt the matrix before retrying. You can also paste plaintext directly into a bound table field; this uses whole-field replacement rather than caret insertion. The readonly Phone input remains protected. An earlier canceled native paste is left alone.[^view][^controller][^grid]

Browser regressions cover initial-page/off-page identity, nested choices and raw/display separation, selection/check interactions and callbacks, sort/filter/page behavior, parsing and validation, Rows changes, disposal, document-unique IDs, automated accessibility scans and 320 CSS-pixel text-spacing reflow. Column regressions retain grouped topology, invalid replacement, hidden drafts, focus, resize and restoration checks. The [M10.5 plan](../implementation/m10-columns-plan.md) preserves its preceding results. Final M10.6 suites pass 199/199 in each required engine; installed JS/TS and five-browser consumers pass the same 143-file artifact. Its exact hashes and limits are in the [verification record](../implementation/evidence/m106-verification.json). No equivalent AI task or actual token telemetry was rerun. Automated checks do not establish manual screen-reader conformance.[^browser][^columns-browser][^selection-browser][^selection-evidence]

Historical M10.7 final suites pass 219/219 in Chromium, Firefox and WebKit, including 19 focused paste regressions and the added demo case. Installed JS/TS and all five Windows browser consumers pass the same 148-file package, SHA-256 c01c3c2ea819aee418154b69534f5eb053f315fca1471b4b7857299b11bb3e0d. Existing binding budgets pass. Source/log hashes, retained initial failures, the synthetic-event fixture correction and unverified manual/OS-clipboard limits are recorded with that stage; these results do not certify the later viewport implementation or recertify the historical M10.6 artifact.[^paste-browser][^paste-evidence]

The viewport regressions cover logical scopes, variable heights and anchoring, focused editor/caret/composition, offscreen drafts/typed paste, Select release, hidden roots, resize and teardown. Current-stage release gates and independent verification are tracked in the [M10.8 plan](../implementation/m10-viewport-plan.md); this document adds no unmeasured performance or token-saving claim.[^viewport-browser]

The Rows controls demonstrate Add, Insert before selected, Copy before selected, Copy to end, Move earlier/later and Move to first/end. Insertion/copy activates the new stable ID. Copies use the stored valid values, not an uncommitted editor draft; editing a copy leaves its source unchanged. Movement keeps active identity and selected/checked membership while their returned ID arrays follow store order. Sorting/filtering/paging still controls the displayed projection. Revert all removes inserted copies and restores values while retaining the current order. Business key allocation stays application-owned.[^controller]

# Variations

Open `/m10/columns.html` for Ledger and Notebook: independent CVC instances with opposite group order, footer groups and span/child-authored colgroups. Controls expose state, invalid-state recovery, sort/filter/page/validation/dispose/rebind. Each starts with three visible rows. Native column markers separate keys from nested field paths; generated IDs remain unique across screens.[^columns-view][^columns-controller]

The earlier [two-layout Grid example](advanced-grid-example.md) tests MDI isolation and sticky/grouped table structure with the same public Grid API. Application HTML/CSS can change independently of this demo's controller choices.[^grid]

# Pitfalls

Remaining Grid parity stays required follow-up work. Column state, selection/check/filter, atomic bulk paste and measured virtualization have working controls; group topology constrains legal column moves. Viewport templates currently use one tr per RowId and reject multi-row spans; M10.9 grouped/merged row blocks remain required. Earlier later-candidate descriptions do not govern the current scope. The [M10 plan](../implementation/m10-plan.md) preserves the stage order, and the [M10.8 plan](../implementation/m10-viewport-plan.md) defines current viewport contracts and verification gates.[^grid][^viewport]

Without `initialPage` or `viewport`, Grid creates all initial row clones. Local paging bounds the logical page; viewport bounds connected DOM and keeps page-wide check/range/paste semantics. The scroll root needs finite authored height and stable table/column widths; its estimate does not force fixed-height rows. Interactive use is not a controlled performance measurement. Rebinding for locale, initial page, mode or eligibility policy also discards active identity, selected/checked sets and uncommitted drafts. Use `setSelected([])` or `setChecked([])` to clear a complete set; `select(null)` clears only the active row. Keep the check checkbox separate from `data-field`, do not send `RowId` as a business key, and do not put a fixed `id` in a repeated row.[^grid][^controller][^selection][^viewport]

# Related

[^selection-evidence]: Final M10.6 source, package, browser and performance record
[^paste-browser]: Atomic paste, typed controls, drafts and lifecycle regressions
[^paste-evidence]: Final M10.7 source, package, browser and performance record
[^viewport]: Private measured viewport, spacer and scroll ownership
[^viewport-browser]: Bounded rendering, logical scopes, offscreen paste and focus regressions

[Grid](grid.md) defines exact current public behavior. [Rows](data.md) defines identity and changes. [M10 plan](../implementation/m10-plan.md) preserves earlier measurements and defines the required follow-up stages. The [feature parity ledger](../implementation/feature-parity.md) and [parity implementation plan](../implementation/feature-parity-plan.md) track the full release requirement.
