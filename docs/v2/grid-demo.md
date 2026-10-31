---
type: Example
title: Interactive Grid contract demo
description: Inspect committed field changes, loaded originals and edited deletions alongside authored CVC details and two Grid layouts.
tags: [ui, grid, example, accessibility]
status: draft
sources:
  - id: scroll
    resource: ../../examples/vite/m10/scroll-boundary.ts
    title: Page-owned native wheel boundary composition
    git_blob: 9020af886692a4c39440b62055749b8670f2ec18
  - id: pinned-browser
    resource: ../../tests/browser/m10-pinned.spec.ts
    title: Pin controls, reduced details and trusted native wheel regressions
    git_blob: e0949941c47303eee082207c84258ab3a9caead2
  - id: progressive-view
    resource: ../../examples/vite/m10/progressive.html
    title: Two authored progressive CVC layouts
    git_blob: eb777d5cec4bd384a13ed2ea9893a87a7e2825e7
  - id: progressive-controller
    resource: ../../examples/vite/m10/progressive.ts
    title: Independent prefix operations and immediate abort ownership
    git_blob: e605520c3d8a77767a73db56aef62b054f97a04b
  - id: progressive-browser
    resource: ../../tests/browser/m10-progressive.spec.ts
    title: Interactive prefix, keyboard, failure and CVC regressions
    git_blob: bdb664d34333c3770873c0fb45df7c45c4da9845
  - id: interactions-browser
    resource: ../../tests/browser/m10-interactions.spec.ts
    title: Authored recovery and action-scroll regressions
    git_blob: 50f57efa2deec6db6ee90b18890c6242fd69a5f3
  - id: view
    resource: ../../examples/vite/m10/demo.html
    title: Authored table, controls, and observation panels
    git_blob: 172d29e7f90a91362cc7d2e77605445ba1cb57ae
  - id: controller
    resource: ../../examples/vite/m10/demo.ts
    title: Grid options, calls, and Rows state
    git_blob: c026da7f07812031e363e604265f74b7afbf6640
  - id: detail-controller
    resource: ../../examples/vite/m10/detail.ts
    title: One authored employee detail page in main content and Popup
    git_blob: e319f47ac49efaa9538ee355d415c9f914af54eb
  - id: style
    resource: ../../examples/vite/m10/demo.css
    title: Responsive demo styling
    git_blob: b2c1cacb6c27f07c1b53a864c1d5f81de073c375
  - id: browser
    resource: ../../tests/browser/m10-demo.spec.ts
    title: Interactive Grid behavior and accessibility checks
    git_blob: b369b9d24d57b6d8ae929cf18746d8e1aaf5730b
  - id: columns-view
    resource: ../../examples/vite/m10/columns.html
    title: Two authored column layouts
    git_blob: aaccb0b3bbb5de4d59a25746c30a11784c33a5bd
  - id: columns-controller
    resource: ../../examples/vite/m10/columns.ts
    title: Independent CVC column controllers
    git_blob: ebb417c6e833f9ecdfbbc2004dc6f09f203da329
  - id: columns-browser
    resource: ../../tests/browser/grid-columns.spec.ts
    title: Native column state, lifetime and accessibility regressions
    git_blob: 32ae71084783b69f9b4116c80a98a6ab21a2f582
  - id: selection-browser
    resource: ../../tests/browser/grid-selection.spec.ts
    title: Independent selection, checks, authored filters and row actions
    git_blob: 118e0325d6bf6b6b8b7c723c8c31b2bc2bc0b897
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
    git_blob: 567439878a74284e7a1f60c6898d636322c190e5
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Private measured viewport, spacer and scroll ownership
    git_blob: d02fbfe5407b80786733034f2f5aaaea5d71ef55
  - id: viewport-browser
    resource: ../../tests/browser/grid-viewport.spec.ts
    title: Bounded rendering, logical scopes, offscreen paste and focus regressions
    git_blob: 94b18cca941e2a8e5003c91a0346d4c07fa9b0cd
  - id: blocks
    resource: ../../src/ui/grid-row-blocks.ts
    title: Private authored record structure and adjacent native merging
    git_blob: 71d2218d3cf773d875bb423f8a324d5db70077ab
  - id: blocks-browser
    resource: ../../tests/browser/grid-row-blocks.spec.ts
    title: Multi-row identity, logical paste, focus, physical ARIA and bounded geometry
    git_blob: 29925f3b06132277a2628b258db900ed6669bc98
  - id: selection
    resource: ../../src/ui/grid-selection.ts
    title: Independent active row, selection and check state
    git_blob: 1b74c39d3161345aec1c9d0c3dd9de49c947f23d
  - id: controls-browser
    resource: ../../tests/browser/grid-controls.spec.ts
    title: Native groups, typed values, validation and display regressions
    git_blob: 6df9b6e36371f8547a3366ea60e1afc9f70e5d56
  - id: lifecycle-browser
    resource: ../../tests/browser/grid-lifecycle.spec.ts
    title: Status, defaults, callback ownership, focus and failure regressions
    git_blob: 08db552a81aa4efa98268ec803e4d4116ba2ec0d
  - id: filters
    resource: ../../src/ui/grid-filters.ts
    title: Raw column filters and distinct choice counts
    git_blob: a9a6604b72bf9077bf8cbf8f8db91bf0c774f7a8
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public Grid state and handle types
    git_blob: 6dae7f254a9f274e495941fb84da08963f8f2db3
generated: { by: codex/gpt-6, at: 2026-10-31T08:28:09Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-25T00:41:28Z }
  - { by: codex/gpt-6, at: 2026-10-31T08:28:09Z }
---

The interactive demo is the M10 reference screen for the *implemented* `bindGrid` API. It keeps the table's structure and style in authored HTML/CSS, and exposes the raw store and callback results beside it so a coding agent can see what each action changes.[^view][^controller]

The expanded `2.0.0` scope requires the remaining 1.x Grid user features before release. Column state, multiple selection, independent row checks, authored header sorting/filtering, stable row actions, atomic bulk paste, measured viewport rendering, authored multi-tr records, native merging, choice groups, explicit display, exclusive checks, validation timing/reveal and raw field-change markers are implemented. The [feature parity ledger](../implementation/feature-parity.md) records remaining gaps, and the [parity implementation plan](../implementation/feature-parity-plan.md) defines their review and release gates. Extend this same demo as required features arrive; its coverage does not claim complete 1.x parity.[^grid][^viewport][^blocks]

# Scenario

Run `npm run example` from the repository root and open `/m10/demo.html`. The initial six employee rows include a nested `assignment.shifts` array and nested `profile.team` field; the Dataset selector also supplies 5,000 employees. The table stays native, with grouped sticky headings and a keyboard-focusable scroll region. This is an interactive contract explorer; controlled performance evidence is recorded separately.[^view][^controller][^style]

# Components used

| Owner | Responsibility |
|---|---|
| Authored HTML/CSS | Table headings, labels, field controls, error regions, scroll behavior, and layout. |
| `bindGrid` | Bind mounted rows, status projection, owned row callbacks, native defaults, viewport, editing, selection/checks, filters/page, validation and paste. |
| `Rows` | Own immutable snapshots, stable IDs, clean batch append, pending changes, retained deletions and subscription events. |
| Application code | Provide sample rows, comparator, filter predicate, salary parser, custom format/validation rules, and action buttons. |

The demo supplies required `rows`, optional `initialPage`, `viewport`, `columns`, `onColumnsChange`, local `rules` with `format`, `validate`, `messages`, and `locale`, per-field `parse`, and `onSelect`. Selection controls supply `multiple`, `toggleSelection`, `canSelect`, `canCheck`, `checkMode`, `beforeSelect`, `beforeSelectionChange`, `onSelectionChange`, `beforeCheckChange`, and `onCheckChange`; authored headers and row actions use `sorts`, `filters`, and `onRowAction`. Validation controls set `validateOn` and `revealInvalid`. `paste: true` enables direct native plaintext paste, and `onPaste` displays accepted/rejected results. The lower row-block Grids add a `render` factory and range parser. Its initial-page selector can bind directly to page 1 or 2 with two rows per page; leaving it blank preserves the complete logical-page default. The custom salary rule, name display formatter, comparators and Team value function are application behavior.[^controller][^grid]

Row status selects live, modified, deleted, all retained or no statuses through `statusFilter`/`setStatusFilter`. The controller connects `beforeRowBind`, `onRowBind` and `onBind`; resource tracking is optional, while row status labels remain application text. Controls call `defaults()`, create a complete employee through the application's factory, append two loaded employees through `Rows.append`, and retry current bindings through `refresh()`.[^view][^controller][^lifecycle-browser]

# View

The row's Inline detail and Popup detail actions share one authored template and employeeDetail PageDefinition. Their editors include fields hidden from the current Grid column state. The nested Shift Select is native application markup populated before Form's subscriber, with an application parser retaining numeric codes. No competing Select binder or new Form option-map contract is used.[^view][^controller][^detail-controller]

The labelled height button connects heightResize to the existing scroll region. ArrowUp/Down, Shift, Home/End and pointer dragging adjust the area; the reveal control accepts nearest/start/center/end. Authored CSS and the existing page-owned wheel guard provide scroll containment. These controls work with or without the optional measured viewport.[^view][^controller][^style]

The main explorer's `<tr data-row-template>` contains `data-field` paths for plain text, email, nested team, checkbox, textarea, number, and Select fields. `data-format` formats the display name; the application-owned employeeRuleDefaults supplies Team/Salary validators through RuleSet.fields to both Grid and full/reduced CVC details. The same row includes `data-error-for` regions, a `data-select-row` button, and a row-local Select with `data-options="assignment.shifts"`, `data-option-label="meta.label"`, and `data-option-value="code"`. The independent check uses `<input type="checkbox" data-check-row>` without `data-field`; the Active editor remains a separate Boolean data field. `<button type="button" data-row-action="inspect">` exposes the current row to the application. The repeated row contains no fixed DOM ID. Native email/required constraints work alongside the declared rules.[^view][^controller]

Automatically validate Grid edits controls autoValidate independently of existing change/blur/manual timing. Unchecking permits parsed edits that fail business/native constraints; explicit Validate and paste still check completely. Changing this option uses the existing disposal/rebind path and preserves committed Rows changes. Detail Forms retain their own default automatic policy. See [shared rules](rules.md) for precedence and composition.[^controller][^detail-controller]

The lower **Authored row blocks and adjacent merges** section keeps four separate shared records in two tables: `[data-block-grid="two"]` places Name/Shift above Notes, while `[data-block-grid="three"]` places Notes first, Name/Shift second, and Inspect/check controls last. Each `<tbody data-row-template>` repeats the full record. Both include Work mode radio groups, Contact channels checkbox groups, nested Available shifts multiple Selects, Start date, Daily hours range and avatar images. Department and Team are display-only full-block `data-merge` cells; the two-row layout also demonstrates source `rowspan="0"`. Team uses an application-created `<strong>` renderer, and nested Shift choices retain raw numeric codes. Exact markup and merge boundaries are defined once in [Grid](grid.md).[^view][^controller][^blocks]

The authored header contains `data-sort-column="name"` and `data-sort-column="salary"` buttons, a visible-page `data-check-all="visible"` checkbox, and the Team controls: a multiple `data-filter-column="team"` Select, `data-filter-search="team"` input, and `data-clear-filter="team"` button. Grid binds the filter choices through the existing native Select behavior; the application keeps control of labels and layout.[^view][^grid]

An authored `tfoot tr[data-empty]` contains the empty-result message and declares membership of all nine managed columns, including the authored Actions recovery column. Each repeated record contains an Undo action and a status label populated by `onRowBind`. Observation panels distinguish captured defaults, the last completed chunk counts, tracked row resources and current Rows state; no message or widget theme is generated by the framework.[^view][^controller]

# Controller

Details use rowIds with visible, filtered or store scope. Previous/next validates the current Form, re-reads ordered IDs and skips tombstones; filtered navigation computes pages from the raw filtered projection. Opening detail does not require Grid selection or pass through its veto/eligibility rules. Native cancel, authored close and replacement of an inline page validate first; forced disposal always releases resources. Removal/replacement of the current record exposes an authored no-row state. Repeated open/close and switching pages preserve shared Rows and restore focus to an available opener or the connected employee-region fallback.[^detail-controller][^controller][^browser]

The column controls call `columns` and `setColumns` to adjust preferred width, show/hide, move within a group, swap groups, reset, and deliberately reject invalid state. Resize buttons support pointer drag, ArrowLeft/ArrowRight, Shift for 1-pixel steps, Home and Escape cancellation. State and callback panels distinguish committed layout changes from Rows changes.[^controller]

`select` and `selected` address only the active row used by the snapshot and store actions. `selectedIds`/`setSelected` address an independent selection set; `checkedIds`/`setChecked` address an independent check set. The set methods replace the complete set and the getters return frozen IDs in store order. Clearing the active row does not clear either set. The demo's first-two and clear-set controls change membership without changing the active row. `checkAll` and `checkState` expose explicit scopes; `columnFilter`, `setColumnFilter`, and `filterChoices` expose the Team filter and its raw values/counts.[^controller][^selection][^filters][^ui]

Other controls call `setSort` with an authored heading and `aria-sort`, `setFilter`, `setPage` and `page`, `reveal(id)`, `validate(id)` and `validate()`, `paste(text, { id, field })`, and `dispose`. Changing the initial-page selector disposes and rebinds the Grid to show the first-render option; paging controls later use `setPage`. Rebinding after disposal shows template restoration. The Rows controls call `add`, `move`, `copy`, `set`, `remove`, `revert(id)`, `revert()`, `replace`, `original`, and `changes()`; accepted paste uses `setMany`. Observation panels show active `RowId`, the selected or inspected raw snapshot and loaded original, both ID sets, scoped check state, filter values/counts, validation issues, before/change callbacks, row actions and the latest Rows event.[^controller]

```ts
const grid = bindGrid(table, {
  rows,
  statusFilter: statusViews[statusFilter.value],
  beforeRowBind: rowResources.checked ? context => { /* register owned before-binding work */ } : undefined,
  onRowBind(context) { /* update authored status text; context.own releases optional widget listeners */ },
  onBind({ total, filtered, visible, available, mounted, first, last, event }) { /* show the completed chunk */ },
  initialPage: { page: 1, size: 2 },
  viewport: viewportChoice.checked ? { root: scrollRoot, estimate: 150, overscan: 3 } : undefined,
  paste: true,
  onPaste(result) { /* show acceptance or collected cell issues */ },
  columns: defaultColumns,
  multiple: selectionMode.value === "multiple",
  checkMode: checkMode.value as "multiple" | "single",
  validateOn: validateOn.value as "change" | "blur" | "manual",
  autoValidate: autoValidate.checked,
  revealInvalid: revealInvalid.checked,
  canSelect: disableInactive.checked ? row => row.value.active : undefined,
  canCheck: disableInactive.checked ? row => row.value.active : undefined,
  sorts: { name: (a, b) => a.name.localeCompare(b.name), salary: (a, b) => a.salary - b.salary },
  filters: { team: { value: row => row.profile.team } },
  onColumnsChange({ columns, event }) { /* show immutable layout state */ },
  rules: {
    format: { displayName: value => value.toUpperCase() },
    validate: { payAtLeast: (value, args) => Number(value) >= Number(args[0]) },
    messages: { payAtLeast: "Salary must be at least {0}." },
    fields: { salary: { validate: [["payAtLeast", 100]] }, "profile.team": { validate: [["required"]] } },
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

Single mode is the default: row buttons keep the existing active-row behavior. With plain toggling off, multiple-mode plain click replaces membership; Ctrl/Meta-click toggles it, and Shift-click selects a range on the current sorted/filtered page. Up/Down and Home/End move focus between eligible row buttons; Shift extends a range, Ctrl/Meta+A selects eligible visible rows, and Escape clears the selection set. Native Enter/Space activates the focused button. These shortcuts stay on row-selection buttons so editable fields keep their native editing behavior.[^controller][^grid][^selection]

Enable the inactive-row policy to supply `canSelect` and `canCheck` from `row.value.active`; it disables the corresponding controls without disabling unrelated editors. Changing that policy or mode rebinds the demo. Before hooks return `false` to veto a proposed change: `beforeSelect` receives `{ id, row, event }`; `beforeSelectionChange` and `beforeCheckChange` receive `{ ids, previous, event }`. A canceled multiple-mode gesture preserves both its active row and membership. State commits before the change callbacks; programmatic events are `null`. Removing/replacing data or making a row ineligible prunes invalid state without allowing a veto to retain missing rows.[^controller][^selection]

Check a row without selecting it, then compare the scope controls. Default multiple check mode adds/removes eligible scope IDs while preserving outside checks. Switch **Check mode** to Single to check a new row and atomically replace the previous ID. A true scope proposal containing multiple eligible rows rejects with `GRID_CHECK_MODE`; the corresponding check-all control is disabled instead of selecting a first row. Exactly one eligible scope ID replaces the prior check, an empty true scope is a no-op, and false removes only scope IDs in either mode. `checkState(scope)` returns frozen `{ checked, indeterminate, total, count }`, with the real eligible `total` in both modes. A partial scope is mixed; an empty scope has both flags false and a disabled header checkbox.[^controller][^selection][^ui]

In **Validation**, select On blur to defer scalar commits until leaving the field, or On validation request to retain all drafts until **Validate selected** or **Validate all**. Default On change validates input drafts and commits valid native changes. Unmodified scalar Enter commits in change/blur mode; textarea, composition and modified keys keep native behavior. Enable **Reveal and focus the first invalid field** and validate a current-page invalid row to use the existing reveal/focus path. Off-page errors do not change page/filter. Changing these policies or Check mode rebinds only the main Grid and clears its selection/checks/drafts; the shared row-block section is separate.[^view][^controller][^grid]

| Scope | Eligible targets |
|---|---|
| `visible` | Rows on the current sorted/filtered page. |
| `filtered` | All rows matching the manual and column filters, before paging. |
| `store` | All live Rows entries, regardless of filtering or paging. |

Header sort buttons cycle ascending, descending, then cleared and update `aria-sort`. The Team column filter combines with the manual Team predicate and other column filters using AND. `setColumnFilter("team", null)` means all values; `setColumnFilter("team", [])` means none. The empty-value button demonstrates the latter; All teams in the header clears only the column filter. `filterChoices("team", search)` returns frozen raw `{ value, label, count }` choices after the manual/other column filters, excluding the Team column's own filter and before paging. Search matches choice labels without changing row filtering or clearing selected values hidden by the search.[^controller][^grid][^filters]

Activate Inspect after sorting, filtering or paging to see `onRowAction` receive `{ action, id, row, element, event }` for the current row snapshot and stable ID. It does not change the active row or either ID set. The **Selected or inspected raw snapshot** and **Rows.original(id)** panels follow the inspected ID on later refreshes, including edits and view changes. A row-selection callback or explicit row-selection click clears inspection; a missing inspected ID falls back to the active row, and Dataset reset clears it. An inserted or copied row shows `null` in the original panel because `Rows.original(id)` returns `undefined`.[^controller][^grid]

Edit a loaded field and compare its raw value with the original panel. The authored highlight reads `data-field-changed="true"`; each row also lists **Changed fields:** with distinct bound paths, so color is not the only indication. An unchanged loaded row or an inserted row reports **No changed loaded fields.** Nested paths such as `profile.team` compare separately from their siblings. Formatting and invalid or deferred drafts do not create flags; returning a committed value to its original clears the flag. Refresh and viewport remount read the same baseline from Rows rather than accepting a new original.[^view][^controller][^style][^grid]

The Atomic bulk paste panel provides a Start field selector, TSV textarea, Paste at active row button and live status output. First activate a visible row with at least one following visible row, keep the default column order, and leave Start field at Email. The supplied two-row sample maps Email, protected Phone, nested Team, raw numeric Shift code, Boolean Active, Notes and Salary. The first Notes cell contains a quoted newline. Phone consumes its source cell without changing its stored value. The accepted sample saves both rows in one `setMany` event; the observation panels show the changed snapshots and collected result. Shift matches raw codes `2` and `4`, rather than their labels, and Active requires `true` or `false`.[^view][^controller][^grid]

Change the sample to an invalid email, unknown shift, invalid salary or excess row/field to see the whole paste rejected with row/field issues; prior data and entered drafts remain. Pasting at the last visible row rejects the supplied two-row sample instead of creating a row or advancing the page. Moving or hiding columns changes paste positions, so adapt the matrix before retrying. You can also paste plaintext directly into a bound table field; this uses whole-field replacement rather than caret insertion. The readonly Phone input remains protected. An earlier canceled native paste is left alone.[^view][^controller][^grid]

Browser regressions cover initial-page/off-page identity, nested choices and raw/display separation, selection/check interactions and callbacks, sort/filter/page behavior, parsing and validation, Rows changes, disposal, document-unique IDs, automated accessibility scans and 320 CSS-pixel text-spacing reflow. Column regressions retain grouped topology, invalid replacement, hidden drafts, focus, resize and restoration checks. The [M10.5 plan](../implementation/m10-columns-plan.md) preserves its preceding results. Final M10.6 suites pass 199/199 in each required engine; installed JS/TS and five-browser consumers pass the same 143-file artifact. Its exact hashes and limits are in the [verification record](../implementation/evidence/m106-verification.json). No equivalent AI task or actual token telemetry was rerun. Automated checks do not establish manual screen-reader conformance.[^browser][^columns-browser][^selection-browser][^selection-evidence]

Historical M10.7 final suites pass 219/219 in Chromium, Firefox and WebKit, including 19 focused paste regressions and the added demo case. Installed JS/TS and all five Windows browser consumers pass the same 148-file package, SHA-256 c01c3c2ea819aee418154b69534f5eb053f315fca1471b4b7857299b11bb3e0d. Existing binding budgets pass. Source/log hashes, retained initial failures, the synthetic-event fixture correction and unverified manual/OS-clipboard limits are recorded with that stage; these results do not certify the later viewport implementation or recertify the historical M10.6 artifact.[^paste-browser][^paste-evidence]

The viewport regressions cover logical scopes, variable heights and anchoring, focused editor/caret/composition, offscreen drafts/typed paste, Select release, hidden roots, resize and teardown. Row-block regressions add multi-tr identity, cross-row validation references, native spans and raw hierarchical merging, physical ARIA indexes, merged-follower paste, focus pinning, fully merged single-column geometry and hidden boundary rows. Native-control regressions cover group isolation, stable array/raw values, JSON-array paste, disabled constraints, rendering ownership, validation timing and first-error reveal. Lifecycle regressions add status boundaries, captured defaults, callback cleanup/errors, readonly tombstones, focus recovery, append and exact restoration. Current-stage gates belong to the [progressive plan](../implementation/m10-progressive-plan.md); the [interaction plan](../implementation/m10-interactions-plan.md) preserves its preceding slice; the [detail/geometry plan](../implementation/m10-detail-plan.md) preserves its preceding contract; the [lifecycle plan](../implementation/m10-lifecycle-plan.md) preserves its preceding slice; interactive use adds no unmeasured performance or token-saving claim.[^viewport-browser][^blocks-browser][^controls-browser][^lifecycle-browser]

The Rows controls demonstrate Add, Insert before selected, Copy before selected, Copy to end, Move earlier/later and Move to first/end. Insertion/copy activates the new stable ID. Copies use the stored valid values, not an uncommitted editor draft; editing a copy leaves its source unchanged. Movement keeps active identity and selected/checked membership while their returned ID arrays follow store order. Sorting/filtering/paging still controls the displayed projection. Revert all removes inserted copies and restores values while retaining the current order. Business key allocation stays application-owned.[^controller]

Edit a loaded employee, choose **All retained rows**, then remove it and activate Inspect on its retained row. The current snapshot keeps the last committed edit and its field markers; **Rows.original(id)** stays unchanged, and the Changes panel carries that original in the delete payload. Editors and selection/check controls are disabled, but **Undo row changes** restores the loaded value and clears its field markers. Modified and deleted status views use the same logical filtering/paging path. Status text and CSS remain authored; differing statuses split otherwise equal merge runs. The table's data-changed attribute reflects pending changes even when a status filter hides them.[^controller][^grid]

**Read authored defaults** shows captured input/group/Select values rather than a currently edited employee. **Create employee from defaults** supplies names and shift choices through the typed application factory, then calls Rows.add; the result is inserted. **Append 2 loaded employees** uses Rows.append and keeps loaded records clean. A page/controller still owns requests and cancellation; this button does not introduce a framework loader.[^controller]

Enable **Track row resources** to register a before-binding marker and one native click listener per record. Counters show binding calls, active resources, cleanup and clicks. Rebinding, refresh, virtual departure and disposal release each binding's owned work. Changing tracking rebinds Grid and clears selection/checks/drafts; **Refresh bindings** preserves those states while rerunning current bindings. The **Last onBind result** panel updates for completed binding events, including append, progressive chunks and explicit reveal growth; ordinary edits or viewport movement do not update it.[^view][^controller][^lifecycle-browser]

## Cooperative loaded binding

In **Binding mode**, Immediate keeps the synchronous default. **Loaded prefix** admits one configured chunk and waits for Next or a bottom-scroll event; **Yield all** awaits successive chunks while Ping and Cancel remain usable. Size counts logical records, including multi-tr blocks. Delay applies between newly materialized records; zero still yields before each continuation. These controls rebind the Grid and discard selection/check sets and uncommitted drafts, so choose the policy before editing.[^view][^controller][^progressive-browser]

The current result and completion history show total loaded rows, filtered rows, the complete logical page (`visible`), admitted prefix (`available`) and actual mounted records (`mounted`). `first` is true for a chunk beginning at zero; `last` means admission and required current bindings finished. Viewport admission does not instantiate every offscreen widget. Existing page-wide checks, ranges, validation and paste keep their logical scope. Progress output sits outside the busy table; existing field-validation regions remain intact. Pending Next/Resume actions use `aria-disabled` without removing keyboard focus.[^view][^controller][^grid]

**Cancel** retains ready rows and drafts; **Resume** retries the unfinished target. **Fail one newly bound record once, then allow Resume** demonstrates an observable hook failure and retry; completed rows remain usable. Sorting, filtering, paging or refresh supersedes old work; ordinary Rows edits do not create a new completion event. Explicit reveal can synchronously admit enough records to reach its target. A late viewport failure rejects the current `whenBound()`; Resume retries its mounted window without repeating an already-completed `onBind`.[^controller][^progressive-browser][^grid]

Open `/m10/progressive.html` for independent Ledger and Notebook CVC instances. Each owns forty loaded records, a five-record chunk, a 20 ms delay and its own Next/Yield remaining/Cancel/Resume/Ping controls. The page-level controls exercise deactivate/activate, reload, dispose and fresh mounting. Retained deactivation cancels binding and waits 60 ms for example cleanup; activation resumes. Reload/dispose aborts the page signal and immediately disposes Grid before that asynchronous cleanup finishes. This uses native signal wiring plus the existing owned disposer. `PageHandle.ready` confirms controller activation; `grid.whenBound()` separately confirms the first chunk.[^progressive-view][^progressive-controller][^progressive-browser]

## Explicit interaction policies

The focused interaction suite exercises these authored policies.[^interactions-browser]

Enable **Plain activation toggles selection** to rebind with toggleSelection. In single mode a second native activation clears active detail; in multiple mode it removes only that member and clears active identity. Other memberships and checks survive the gesture. Ctrl/Meta/Shift/Alt and absolute programmatic methods retain their contracts. Changing the policy rebinds, so choose it before creating drafts.[^controller][^grid]

The Columns chooser has eight business checkboxes, native **All data columns**, mixed state and a shown/total output derived from grid.columns(). Width/order values survive. Uncheck All to show 0/8 business columns: the separate Actions column remains. Its **Choose columns** button opens/focuses the authored chooser. Inspect, shared CVC details and Undo remain available in recovery-only rows; check a business column to restore it. Actions is omitted from chooser choices, and the application's manual hide control is disabled for it. The public API still rejects every physical column hidden; it does not impose an arbitrary required-column policy on callers.[^view][^controller][^grid]

In the Team header, input previews choices; **Apply** or plain Enter replaces the filter with matching raw values. **All** clears search and membership; **None** uses an empty set; **Reset** preserves the query. **Selected choices** reads actual state. The authored Active filter can exclude all rows for a Team while that Team choice remains visible, enabled and counted zero; selected raw values stay retained. Clearing Active restores those rows. Completion updates observation output through the existing onBind callback, including programmatic or Enter changes.[^view][^controller][^filters]

Enable **Reveal successful application selection, check, add and append actions** to run the explicit scroll recipes. Selection/checks center the last requested eligible identity only after the complete active/selected/checked result matches. This target can differ from the final ID in store-ordered getters. Veto, failure, opt-out and offpage/filtered targets do not scroll or change page/filter. Front/index/end adds use start/center/end; nonempty append uses end only when the store was already nonempty. **Empty store** exercises the no-jump first batch. These are application actions and do not change native Grid gesture defaults.[^view][^controller][^grid]

Choose **Reveal the last invalid row in visual page order, preserving focus** before editing. It disables core first-invalid reveal, collects validation issue IDs and scans the current visual page in reverse before centered reveal. Issue order alone is insufficient after sorting. Hidden/offpage errors remain recorded; a valid result or a result without a visible issue does not scroll. The normal core first-invalid option remains separately available.[^view][^controller][^grid]

The full detail template delegates assignment.shifts and assignment.chosen to Form through the existing row-local choice markers. Native changes preserve numeric codes, option refresh precedes raw draft/selection display, and hidden validation uses the target employee's own shifts. The shared CVC controller has no option generation, code parser or subscription-order adapter; the reduced template simply omits that field.

# Variations

**Pin first visible columns** uses the same full column state and reports the actual visible pin count. The main explorer starts with one pin, retaining its previous fixed Record/Employee appearance. Ledger and Notebook start with zero; set two or more to inspect native grouped header/body/footer behavior through resize preview, cancellation, hide and group reorder. Application actions derive count from current state rather than keeping a second pin store. Hidden-key flags remain intact; current visible prefix policy is reapplied for user hide/reorder actions. Mixed pinned/unpinned spanning cells scroll normally. Backgrounds and stacking remain authored CSS; examples do not measure geometry.[^controller][^columns-controller][^grid]

Enable **New details show only Name and Salary** before opening Inline or Popup details to select another authored template through the same `employeeDetail(view)` controller. Only present fields are edited and validated. Omitted fields retain their existing raw values. Scope/navigation, validation guards, unique IDs, focus restoration and page lifetime use the same CVC/Form/Popup paths. Existing full details remain the default.[^controller][^detail-controller]

The scroll regions retain authored CSS containment and use one page-owned wheel boundary listener. It follows the dominant delta axis, permits interior/nested native scrolling and Ctrl zoom, and aborts with its existing page/Grid event lifetime. This covers the available Windows Firefox/WebKit engines where CSS-only containment did not stop parent scrolling. Trusted wheel tests retain an unbound native-auto positive control. The recipe does not intercept keyboard/touch or implement a general overscroll polyfill.[^scroll][^pinned-browser]

Enable **Select from noninteractive row areas** to use the same selection policy from a record's plain cells. Labels and interactive controls remain independent; the existing selection button remains the keyboard alternative. Hiding its column disables the added click path. **Native event after Grid handling** shows the latest committed Rows snapshot after input/change handling; invalid and manual drafts can retain entered text while Rows stays unchanged. Rebinding replaces the native listener rather than accumulating earlier registrations. See [Grid compositions](grid-compositions.md).[^controller][^grid]

In the row-block section, edit Name, Notes or Shift in either layout to update the shared record in both. Select a record in either table, then use **Apply merge keys**, **Move to first**, **Move to end** or **Copy to end**. Department merges first; Team merges only within the same Department and row status. Editing one record can split a formerly equal run until reversion. The status and shared snapshots show the committed RowId/value changes. **Reset shared records** replaces this separate store and clears its selected identity; the main explorer's Dataset/viewport controls do not control these two small layouts.[^view][^controller]

Change Work mode or Contact channels and compare the same record in the other layout; repeated native radio names remain independent per record and table. Available shifts always stores a raw numeric array, including one choice. Start date stays an ISO string, while Daily hours uses the application number parser. Images retain their authored alternative text and the Team label's `<strong>` is fresh application DOM. The shared snapshot panel shows these values without converting them to display strings.[^view][^controller][^browser]

Open `/m10/columns.html` for Ledger and Notebook: independent CVC instances with opposite group order, footer groups and span/child-authored colgroups. Controls expose state, invalid-state recovery, sort/filter/page/validation/dispose/rebind. Each starts with three visible rows. Native column markers separate keys from nested field paths; generated IDs remain unique across screens.[^columns-view][^columns-controller]

The earlier [two-layout Grid example](advanced-grid-example.md) tests MDI isolation and sticky/grouped table structure with the same public Grid API. Application HTML/CSS can change independently of this demo's controller choices.[^grid]

# Pitfalls

Remaining Grid parity stays required follow-up work. Status/default/lifecycle, column state, selection/check/filter, atomic bulk paste, measured virtualization, authored row blocks, native control/validation policies and raw field-change presentation have working controls; group topology constrains legal column moves. Merge cells are display-only and must span their complete record. Completing change markers and edited-deletion display does not close remaining interaction, scheduling, callback or option semantics. Current [Grid](grid.md) markup and cleanup rules apply; the [M10.9 plan](../implementation/m10-parity-plan.md) tracks the remaining required slices.[^grid][^viewport][^blocks]

Without `initialPage`, `viewport` or `progressive`, Grid creates all initial row clones. Local paging bounds the logical page; viewport bounds connected DOM and keeps page-wide check/range/paste semantics. The scroll root needs finite authored height and stable table/column widths; its estimate does not force fixed-height rows. Interactive use is not a controlled performance measurement. Rebinding for locale, initial page, mode or eligibility policy also discards active identity, selected/checked sets and uncommitted drafts. Use `setSelected([])` or `setChecked([])` to clear a complete set; `select(null)` clears only the active row. Keep the check checkbox separate from `data-field`, do not send `RowId` as a business key, and do not put a fixed `id` in a repeated row.[^grid][^controller][^selection][^viewport]

# Related

[^selection-evidence]: Final M10.6 source, package, browser and performance record
[^paste-browser]: Atomic paste, typed controls, drafts and lifecycle regressions
[^paste-evidence]: Final M10.7 source, package, browser and performance record
[^viewport]: Private measured viewport, spacer and scroll ownership
[^viewport-browser]: Bounded rendering, logical scopes, offscreen paste and focus regressions
[^blocks]: Private authored record structure and adjacent native merging
[^blocks-browser]: Multi-row identity, logical paste, focus, physical ARIA and bounded geometry
[^controls-browser]: Native groups, typed values, validation and display regressions
[^lifecycle-browser]: Status, defaults, callback ownership, focus and failure regressions
[^detail-controller]: One authored employee detail page in main content and Popup

The Rows controls include Load received row states and Append received changes. Full loading starts with a deletion followed by clean/update/insert records; choose All retained rows to inspect it. Revert restores received values AND statuses. Ordinary added/copied inserts are discarded. Add/move to first uses the first retained row, including a deletion. Application payload samples explicitly select Name/Salary and compare received-original with current-value deletion projection; they make no request and expose no store IDs.

[Grid](grid.md) defines exact current public behavior. [Rows](data.md) defines identity and changes. [M10 plan](../implementation/m10-plan.md) preserves earlier measurements and defines the required follow-up stages. The [feature parity ledger](../implementation/feature-parity.md) and [parity implementation plan](../implementation/feature-parity-plan.md) track the full release requirement.

[^interactions-browser]: Authored recovery and action-scroll regressions
[^progressive-view]: Two authored progressive CVC layouts
[^progressive-controller]: Independent prefix operations and immediate abort ownership
[^progressive-browser]: Interactive prefix, keyboard, failure and CVC regressions

[^scroll]: Page-owned native wheel boundary composition
[^pinned-browser]: Pin controls, reduced details and trusted native wheel regressions
