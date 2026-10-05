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
    git_blob: b05dbae8a88e257c554a7f21bde1562c5332f2ee
  - id: controller
    resource: ../../examples/vite/m10/demo.ts
    title: Grid options, calls, and Rows state
    git_blob: 2796c9728f798d505d6d62cd46ec761c499f961e
  - id: style
    resource: ../../examples/vite/m10/demo.css
    title: Responsive demo styling
    git_blob: 5f3564a6a86f68f6421903c19c5ef8c89674ead0
  - id: browser
    resource: ../../tests/browser/m10-demo.spec.ts
    title: Interactive Grid behavior and accessibility checks
    git_blob: 3944c468ea8efe449f30769e59bd35b8475af65f
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
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current Grid contract and rendering lifetime
    git_blob: d606737eaa4d51860407c50b4d3ba2f378739ed3
generated: { by: codex/gpt-6, at: 2026-10-05T11:42:46Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-25T00:41:28Z }
  - { by: codex/gpt-6, at: 2026-10-05T11:43:54Z }
---

The interactive demo is the M10 reference screen for the *implemented* `bindGrid` API. It keeps the table's structure and style in authored HTML/CSS, and exposes the raw store and callback results beside it so a coding agent can see what each action changes.[^view][^controller]

The expanded `2.0.0` scope requires column resize/reorder/hide/show, multiple row selection, atomic bulk paste, real scroll virtualization, and the remaining 1.x Grid user features before release. Column resize/reorder/show/hide is implemented here; multiple selection, paste, virtualization and remaining legacy behavior are still required gaps. The [feature parity ledger](../implementation/feature-parity.md) records the gaps, and the [parity implementation plan](../implementation/feature-parity-plan.md) defines the contract-review and release gates. Extend this same demo as each required feature is implemented and tested; the current demo's coverage is not a claim of complete 1.x parity.

# Scenario

Run `npm run example` from the repository root and open `/m10/demo.html`. Six employee rows include a nested `assignment.shifts` array and nested `profile.team` field. The table stays a native table, with grouped headings and a keyboard-focusable scroll region. It is a contract explorer, not the 5,000-row performance fixture.[^view][^controller][^style]

# Components used

| Owner | Responsibility |
|---|---|
| Authored HTML/CSS | Table headings, labels, field controls, error regions, scroll behavior, and layout. |
| `bindGrid` | Bind visible rows, editing, selection, sort/filter/page view, validation, and cleanup. |
| `Rows` | Own immutable row snapshots, store-local IDs, change status, and subscription events. |
| Application code | Provide sample rows, comparator, filter predicate, salary parser, custom format/validation rules, and action buttons. |

The demo exercises the seven constructor options: `columns`, `onColumnsChange`, required `rows`, optional `initialPage`, local `rules` with `format`, `validate`, `messages`, and `locale`, per-field `parse`, and `onSelect`. Its initial-page selector can bind directly to page 1 or 2 with two rows per page; leaving it blank preserves the all-rows default. The custom salary rule and name display formatter are example business behavior, not new framework exports.[^controller][^grid]

# View

One authored `<tr data-row-template>` contains `data-field` paths for plain text, email, nested team, checkbox, textarea, number, and Select fields. `data-format` formats the display name; `data-validate` invokes both built-in `required` and the custom salary rule. The same row includes `data-error-for` regions, a `data-select-row` button, and a row-local Select with `data-options="assignment.shifts"`, `data-option-label="meta.label"`, and `data-option-value="code"`. It contains no fixed DOM ID. Native email/required constraints work alongside the declared rules.[^view]

# Controller

The column controls call `columns` and `setColumns` to adjust preferred width, show/hide, move within a group, swap groups, reset, and deliberately reject invalid state. Resize buttons support pointer drag, ArrowLeft/ArrowRight, Shift for 1-pixel steps, Home and Escape cancellation. State and callback panels distinguish committed layout changes from Rows changes. Other controls call every remaining `GridHandle` method: `select` and `selected`; `setSort` with an authored heading and `aria-sort`; `setFilter`; `setPage` and `page`; `validate(id)` and `validate()`; and `dispose`. Changing the initial-page selector disposes and rebinds the Grid to show the first-render option; paging controls later use `setPage`. Rebinding after disposal shows template restoration. The Rows controls call `add`, `set`, `remove`, `revert(id)`, `revert()`, `replace`, and `changes()`. The observation panels show selected `RowId`, raw snapshot, change status, validation issues, `onSelect` arguments, and the latest Rows event.[^controller]

```ts
const grid = bindGrid(table, {
  rows,
  initialPage: { page: 1, size: 2 },
  columns: defaultColumns,
  onColumnsChange({ columns, event }) { /* show immutable layout state */ },
  rules: {
    format: { displayName: value => value.toUpperCase() },
    validate: { payAtLeast: (value, args) => Number(value) >= Number(args[0]) },
    messages: { payAtLeast: "Salary must be at least {0}." },
    locale: locale.value
  },
  parse: { salary: input => input.trim() ? Number(input) : undefined },
  onSelect({ id, row, event }) { /* show selection and event source */ }
});
```

The excerpt shows the option shape; use the complete [demo controller](../../examples/vite/m10/demo.ts) for runnable binding, state display, and cleanup.[^controller]

# How it works

Choose an initial page before editing to see a bounded first render and `page()` state. Switching this choice rebinds the Grid, clears selection and uncommitted input, and leaves valid Rows changes intact. A size change clears the initial-page choice and uses `setPage`; choosing no page shows all rows. Change a salary to an invalid value, run validation, and inspect the issue panel: the invalid draft stays outside `Rows.changes()` until corrected. Clear a required email or choice to see HTML validation; set an unavailable shift to see `select-option`. Change the nested team or shift, edit Notes, or toggle Active to see the raw object and status. Switch the built-in-rule locale between English and Korean to inspect its message; the demo rebinds Grid, which clears selection and uncommitted input. Sorting, filtering, and paging keep the selected `RowId`; they do not turn a display position into identity. Programmatic `Rows.set` updates the display and clears stale messages; run validation again to evaluate user rules.[^controller][^grid]

The six focused browser cases per engine cover initial-page binding and off-page selection, nested choices and raw/display separation, keyboard selection and callbacks, sort/filter/page identity, parsing and built-in/custom validation with locale, textarea and checkbox edits, Rows changes and revert, unavailable choices, disposal/rebinding, document-unique IDs, an axe-tagged A/AA scan, and 320 CSS-pixel text-spacing reflow. Chromium, Firefox, and WebKit passed. These automated checks do not establish manual screen-reader conformance.[^browser]

The fifteen column regressions additionally cover native group boundaries, immutable full state/invalid replacement, nested control identity, hidden drafts/offscreen rows, resize/cancel/no-op, callback and failed-bind recovery, hidden/inert/CSS focus, width-only no-row mutations, exact attribute restoration and implicit columns. They pass in each required engine as part of the 182-test suite. Same-artifact installed browser checks exercise column state and callbacks; see [the M10.5 plan](../implementation/m10-columns-plan.md) for measurements and raw evidence.[^columns-browser]

# Variations

Open `/m10/columns.html` for Ledger and Notebook: independent CVC instances with opposite group order, footer groups and span/child-authored colgroups. Controls expose state, invalid-state recovery, sort/filter/page/validation/dispose/rebind. Each starts with three visible rows. Native column markers separate keys from nested field paths; generated IDs remain unique across screens.[^columns-view][^columns-controller]

The earlier [two-layout Grid example](advanced-grid-example.md) tests MDI isolation and sticky/grouped table structure with the same public Grid API. Application HTML/CSS can change independently of this demo's controller choices.[^grid]

# Pitfalls

Bulk paste, multiple row selection and real virtualization remain required and unavailable. Column state is implemented with working controls and the same small Grid API; group topology constrains legal moves. Earlier later-candidate descriptions do not govern the current required scope. The [M10 plan](../implementation/m10-plan.md) schedules column state in M10.5, selection/check/filter in M10.6, atomic bulk paste in M10.7, virtualization in M10.8, and remaining Grid parity in M10.9.

Without `initialPage`, the current Grid creates all initial row clones before the first local page request. Choosing an initial page bounds the first render; local paging and releasing offscreen records do not provide real scroll virtualization. This small six-row fixture is not evidence of large-data performance; the separate [M10 measurement](../implementation/m10-plan.md) uses 5,000 rows. Changing the locale uses dispose/rebind and discards selection and uncommitted drafts; commit or review them first. Do not send `RowId` as a business key or put a fixed `id` in a repeated row.[^grid][^controller]

# Related

[Grid](grid.md) defines exact current public behavior. [Rows](data.md) defines identity and changes. [M10 plan](../implementation/m10-plan.md) preserves earlier measurements and defines the required follow-up stages. The [feature parity ledger](../implementation/feature-parity.md) and [parity implementation plan](../implementation/feature-parity-plan.md) track the full release requirement.
