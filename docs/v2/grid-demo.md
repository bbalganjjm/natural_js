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
    git_blob: 7dbcdf4bf9679da5445e410e7357e6920a03768b
  - id: controller
    resource: ../../examples/vite/m10/demo.ts
    title: Grid options, calls, and Rows state
    git_blob: b478b9ab207cb9bbb8612976f057d41d5c13382f
  - id: style
    resource: ../../examples/vite/m10/demo.css
    title: Responsive demo styling
    git_blob: 7f6984b5b2358e75002b9b29df1f2fb2ab0a3b39
  - id: browser
    resource: ../../tests/browser/m10-demo.spec.ts
    title: Interactive Grid behavior and accessibility checks
    git_blob: 8fce530c985ed269c60c7b4569cdaaa474ac518e
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
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current Grid contract and rendering lifetime
    git_blob: a2b3ec849f3595369370a2201aac3b99c9da0d2f
  - id: selection
    resource: ../../src/ui/grid-selection.ts
    title: Independent active row, selection and check state
    git_blob: ad63db1a070132c0ab9eca715bbe994ed010663c
  - id: filters
    resource: ../../src/ui/grid-filters.ts
    title: Raw column filters and distinct choice counts
    git_blob: fd1b4b22060a716b1351e8c3029f76c0b0ca3964
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public Grid state and handle types
    git_blob: c98a8f30607b9c026fbd60574ef65b6129b796e1
generated: { by: codex/gpt-6, at: 2026-10-18T09:59:03Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-25T00:41:28Z }
  - { by: codex/gpt-6, at: 2026-10-18T09:59:03Z }
---

The interactive demo is the M10 reference screen for the *implemented* `bindGrid` API. It keeps the table's structure and style in authored HTML/CSS, and exposes the raw store and callback results beside it so a coding agent can see what each action changes.[^view][^controller]

The expanded `2.0.0` scope requires column resize/reorder/hide/show, multiple row selection, atomic bulk paste, real scroll virtualization, and the remaining 1.x Grid user features before release. Column state, multiple selection, independent row checks, authored header sorting/filtering and stable row actions are implemented here. Paste, virtualization and remaining legacy behavior are still required gaps. The [feature parity ledger](../implementation/feature-parity.md) records the gaps, and the [parity implementation plan](../implementation/feature-parity-plan.md) defines the contract-review and release gates. Extend this same demo as each required feature is implemented and tested; the current demo's coverage is not a claim of complete 1.x parity.

# Scenario

Run `npm run example` from the repository root and open `/m10/demo.html`. Six employee rows include a nested `assignment.shifts` array and nested `profile.team` field. The table stays a native table, with grouped headings and a keyboard-focusable scroll region. It is a contract explorer, not the 5,000-row performance fixture.[^view][^controller][^style]

# Components used

| Owner | Responsibility |
|---|---|
| Authored HTML/CSS | Table headings, labels, field controls, error regions, scroll behavior, and layout. |
| `bindGrid` | Bind visible rows, editing, active row, independent selection/check sets, sort/filter/page view, validation, and cleanup. |
| `Rows` | Own immutable row snapshots, store-local IDs, change status, and subscription events. |
| Application code | Provide sample rows, comparator, filter predicate, salary parser, custom format/validation rules, and action buttons. |

The demo supplies required `rows`, optional `initialPage`, `columns`, `onColumnsChange`, local `rules` with `format`, `validate`, `messages`, and `locale`, per-field `parse`, and `onSelect`. Selection controls supply `multiple`, `canSelect`, `canCheck`, `beforeSelect`, `beforeSelectionChange`, `onSelectionChange`, `beforeCheckChange`, and `onCheckChange`; authored headers and row actions use `sorts`, `filters`, and `onRowAction`. Its initial-page selector can bind directly to page 1 or 2 with two rows per page; leaving it blank preserves the all-rows default. The custom salary rule, name display formatter, comparators and Team value function are application behavior.[^controller][^grid]

# View

One authored `<tr data-row-template>` contains `data-field` paths for plain text, email, nested team, checkbox, textarea, number, and Select fields. `data-format` formats the display name; `data-validate` invokes both built-in `required` and the custom salary rule. The same row includes `data-error-for` regions, a `data-select-row` button, and a row-local Select with `data-options="assignment.shifts"`, `data-option-label="meta.label"`, and `data-option-value="code"`. The independent check uses `<input type="checkbox" data-check-row>` without `data-field`; the Active editor remains a separate Boolean data field. `<button type="button" data-row-action="inspect">` exposes the current row to the application. The repeated row contains no fixed DOM ID. Native email/required constraints work alongside the declared rules.[^view]

The authored header contains `data-sort-column="name"` and `data-sort-column="salary"` buttons, a visible-page `data-check-all="visible"` checkbox, and the Team controls: a multiple `data-filter-column="team"` Select, `data-filter-search="team"` input, and `data-clear-filter="team"` button. Grid binds the filter choices through the existing native Select behavior; the application keeps control of labels and layout.[^view][^grid]

# Controller

The column controls call `columns` and `setColumns` to adjust preferred width, show/hide, move within a group, swap groups, reset, and deliberately reject invalid state. Resize buttons support pointer drag, ArrowLeft/ArrowRight, Shift for 1-pixel steps, Home and Escape cancellation. State and callback panels distinguish committed layout changes from Rows changes.[^controller]

`select` and `selected` address only the active row used by the snapshot and store actions. `selectedIds`/`setSelected` address an independent selection set; `checkedIds`/`setChecked` address an independent check set. The set methods replace the complete set and the getters return frozen IDs in store order. Clearing the active row does not clear either set. The demo's first-two and clear-set controls change membership without changing the active row. `checkAll` and `checkState` expose explicit scopes; `columnFilter`, `setColumnFilter`, and `filterChoices` expose the Team filter and its raw values/counts.[^controller][^selection][^filters][^ui]

Other controls call `setSort` with an authored heading and `aria-sort`, `setFilter`, `setPage` and `page`, `validate(id)` and `validate()`, and `dispose`. Changing the initial-page selector disposes and rebinds the Grid to show the first-render option; paging controls later use `setPage`. Rebinding after disposal shows template restoration. The Rows controls call `add`, `set`, `remove`, `revert(id)`, `revert()`, `replace`, and `changes()`. Observation panels show active `RowId`, raw snapshot, both ID sets, scoped check state, filter values/counts, validation issues, before/change callbacks, row actions and the latest Rows event.[^controller]

```ts
const grid = bindGrid(table, {
  rows,
  initialPage: { page: 1, size: 2 },
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

Browser regressions cover initial-page/off-page identity, nested choices and raw/display separation, selection/check interactions and callbacks, sort/filter/page behavior, parsing and validation, Rows changes, disposal, document-unique IDs, automated accessibility scans and 320 CSS-pixel text-spacing reflow. Column regressions retain grouped topology, invalid replacement, hidden drafts, focus, resize and restoration checks. The [M10.5 plan](../implementation/m10-columns-plan.md) preserves its preceding results. Final M10.6 suites pass 199/199 in each required engine; installed JS/TS and five-browser consumers pass the same 143-file artifact. Its exact hashes and limits are in the [verification record](../implementation/evidence/m106-verification.json). No equivalent AI task or actual token telemetry was rerun. Automated checks do not establish manual screen-reader conformance.[^browser][^columns-browser][^selection-browser][^selection-evidence]

# Variations

Open `/m10/columns.html` for Ledger and Notebook: independent CVC instances with opposite group order, footer groups and span/child-authored colgroups. Controls expose state, invalid-state recovery, sort/filter/page/validation/dispose/rebind. Each starts with three visible rows. Native column markers separate keys from nested field paths; generated IDs remain unique across screens.[^columns-view][^columns-controller]

The earlier [two-layout Grid example](advanced-grid-example.md) tests MDI isolation and sticky/grouped table structure with the same public Grid API. Application HTML/CSS can change independently of this demo's controller choices.[^grid]

# Pitfalls

Bulk paste and real virtualization remain required and unavailable. Column state and selection/check/filter are implemented with working controls; group topology constrains legal column moves. Earlier later-candidate descriptions do not govern the current required scope. The [M10 plan](../implementation/m10-plan.md) schedules column state in M10.5, selection/check/filter in M10.6, atomic bulk paste in M10.7, virtualization in M10.8, and remaining Grid parity in M10.9.

Without `initialPage`, the current Grid creates all initial row clones before the first local page request. Choosing an initial page bounds the first render; local paging and releasing offscreen records do not provide real scroll virtualization. This small six-row fixture is not evidence of large-data performance; the separate [M10 measurement](../implementation/m10-plan.md) uses 5,000 rows. Rebinding for locale, initial page, mode or eligibility policy discards the active row, selection/check sets and uncommitted drafts; commit or review them first. Use `setSelected([])` or `setChecked([])` to clear a complete set; `select(null)` clears only the active row. Keep the check checkbox separate from `data-field`, do not send `RowId` as a business key, and do not put a fixed `id` in a repeated row.[^grid][^controller][^selection]

# Related

[^selection-evidence]: Final M10.6 source, package, browser and performance record

[Grid](grid.md) defines exact current public behavior. [Rows](data.md) defines identity and changes. [M10 plan](../implementation/m10-plan.md) preserves earlier measurements and defines the required follow-up stages. The [feature parity ledger](../implementation/feature-parity.md) and [parity implementation plan](../implementation/feature-parity-plan.md) track the full release requirement.
