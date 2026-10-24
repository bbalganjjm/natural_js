---
type: Plan
title: Natural-JS 2.0 M10.6 selection and filter plan
description: Required independent row selection and checks, authored sort/filter controls, and stable row actions.
tags: [meta, plan, grid]
status: draft
sources:
  - id: parity
    resource: feature-parity-plan.md
    title: Required Grid continuation and full feature obligations
    git_blob: 4257da35d31c0303b536cc02c1e9131d0dd8edfa
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid row ownership and existing active-detail contract
    git_blob: 92991d04bfd634f503ab3f56ff30ca718091dd10
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public UI contracts
    git_blob: 8d5b7bffa6c796a933d088ddac43ff482685e2ad
  - id: legacy
    resource: evidence/v1-grid-parity.json
    title: Legacy Grid behavior and remaining semantic obligations
    git_blob: 6a61d2fb9c4cf6acc401c54caeb7db038ead33d3
  - id: selection
    resource: ../../src/ui/grid-selection.ts
    title: Private identity sets, transitions and ranges
    git_blob: 1b74c39d3161345aec1c9d0c3dd9de49c947f23d
  - id: filters
    resource: ../../src/ui/grid-filters.ts
    title: Private scalar filter state and counts
    git_blob: a9a6604b72bf9077bf8cbf8f8db91bf0c774f7a8
  - id: browser
    resource: ../../tests/browser/grid-selection.spec.ts
    title: Selection, filter and reentrancy regressions
    git_blob: 118e0325d6bf6b6b8b7c723c8c31b2bc2bc0b897
  - id: example
    resource: ../../examples/vite/m10/demo.ts
    title: Full Grid contract explorer
    git_blob: 19da65f5709e547bd1f523b83f1ebee66ac3eeb7
  - id: evidence
    resource: evidence/m106-verification.json
    title: Final source, commands, package, browser and performance identity
    git_blob: 64b1fb4d57cc1d5720475bd8be4157b77d58f8aa
generated: { by: codex/gpt-6, at: 2026-10-18T09:59:03Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-18T09:59:03Z }
---

# Goal

Implement the approved M10.6 continuation with caller-owned Rows, authored native HTML, stable IDs, keyboard operation and small typed state contracts. Preserve CVC and the existing active-detail select/selected/onSelect contract used by Grid/List/Form synchronization. No new dependency, public utility or generated menu framework.

# Checkpoint

The starting commit is ecbacb3 on 2.0.0-alpha.0. M10.5 source, artifact hashes and historical results remain in its plan. The normalized starting diff is empty; restored index metadata still reports false changes. The existing untracked js lockfile stays outside this work. The user authorized the next stage on 2026-10-18.

# Steps

1. Keep active detail identity separate from selectedIds/setSelected and checkedIds/setChecked. Full replacement is sufficient; returned arrays are frozen and follow store order. The multiple option enables replacement, Ctrl/Meta toggle and Shift range gestures on existing row buttons. Without it their old behavior remains. Range order is the current sorted/filtered page, excluding ineligible rows.
2. Add canSelect/canCheck, active-selection and membership before hooks, and change callbacks. Validate complete ID batches first. A veto preserves state, DOM and range anchor; successful state commits before post callbacks. Cleanup after data removal/replacement bypasses veto. Reject stale proposals when a before hook changes state/data/view. Programmatic events are null.
3. Add checkAll/checkState with explicit visible, filtered and store scopes; preserve checks outside the scope. Native row/header checkboxes reflect checked, mixed and empty/disabled states independently of editable Boolean data fields. Eligibility does not disable unrelated editors.
4. Reuse setSort and aria-sort for authored data-sort-column buttons and configured application comparators. Cycle ascending/descending/clear. Keep column filters separate from setFilter and combine them with AND. Filter values are typed JSON scalars; null means all and an empty array means none. Choices/counts apply other filters before paging and exclude their own column filter. Search narrows choices only. Reuse bindSelect for authored multiple filter selects, preserving original nodes and ownership.
5. Add explicit row action buttons resolving current RowId/snapshot at activation, never a captured display index. Keep keyboard navigation on row selection controls and preserve input editing shortcuts. Restore header controls, attributes, listeners and Select ownership on failure/disposal.
6. Update the existing Grid demo, consumers, focused regressions and actual API documentation together. Run build/types, unit tests, full Chromium/Firefox/WebKit suites, identical-tarball JS/TS and five-browser consumers, binding budgets and OKF checks. Independently review changed contracts/source/evidence before verified stamps; commit/push only this development branch.

Public additions are GridIdsChange, GridRowScope, GridCheckState and GridFilterChoice; the six row-state/query methods above plus columnFilter/setColumnFilter/filterChoices. Creation options are multiple, canSelect/canCheck, beforeSelect, beforeSelectionChange/beforeCheckChange, onSelectionChange/onCheckChange, sorts, filters and onRowAction. Existing options remain. Row actions carry action/id/current row/element/event. Sort and filter business functions stay in the application.

Private grid-selection.ts owns identity sets, eligibility, veto/commit ordering and ranges. Private grid-filters.ts owns scalar column filter state and distinct/count calculations. Existing Grid retains field/draft/DOM ownership, delegated events, sort/page projection and focus. Existing bindSelect owns filter option creation/raw identity/restoration. Share no generic extension or transaction engine.

# Next action

M10.6 is implemented within this contract. Prepare M10.7 atomic paste and its smallest coherent Rows batch mutation, parse/validation/draft integration and rollback before code. M10.8 real viewport rendering remains required. Remaining Grid/other-component parity and the single consolidated omission proposal stay open.

# Decisions

- Native table semantics remain; use button aria-pressed/aria-current and native checkboxes instead of adding role=grid without its entire keyboard contract.
- Dataset mutations prune state. Pure layout changes, sorting, filtering and paging preserve stable membership and drafts.
- Existing formatters/validators and framework-used helpers remain. No behavior retirement, v1/master mutation, npm publication or release tag.
- All three available engines and installed Chrome/Edge remain required; actual macOS/iOS Safari is excluded.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-10-18 | Before implementation | Existing active selection callers and lifetime/error boundaries inspected. Detailed source-backed review confirmed independent membership and raw-scalar filter identity requirements. |
| 2026-10-18 | Corrected findings | Keyboard ranges include an initially focused origin. Forced-prune notifications run after committed DOM/view; their reentrancy cannot resurrect removed rows, and post errors do not roll back committed views. View revision rejects before-hook changes with identical projected IDs. Independent source re-review approved these paths. |
| 2026-10-18 | Source gates | Build, strict package/browser-controller types and 81 units pass. Seventeen focused cases are included in the final 199/199 full suite for each of Chromium, Firefox and WebKit. |
| 2026-10-18 | Installed artifact | The same unpublished 143-file tarball is 221,071 bytes (1,087,744 unpacked), SHA-256 d5dbc96d5916a44b517e32af04693cf1d6f0efd1f99cdece9b8a4b0fe8fbefa9. JS/TS plus Chromium/Firefox/WebKit/Chrome/Edge installed consumers pass. Five entries, zero runtime dependencies, only package/source/build/readme/license files. |
| 2026-10-18 | Binding budgets | Same-host 1,000-row flat initial/rebind/edit/sort/filter medians 12.8/15.8/0.8/2.8/1.9ms; nested-auto initial/rebind/sort/filter 39.8/46.8/8.6/5.8ms. All existing M6 budgets pass. This is completed DOM work on one host, not a universal speed or virtual rendering guarantee. |
| 2026-10-18 | Demo/accessibility | Full browser gates include demo lifetime, off-page draft/error, keyboard, native table semantics and two-instance/unique-ID checks. Column regressions cover pointer resizing; demo regressions include 320px text spacing and axe A/AA without violations. Automation does not certify manual assistive-technology use. |
| 2026-10-18 | Evidence and cost limits | Fifteen final command records preserve arguments, exit codes, raw log and 17 source/fixture hashes. No equivalent agent implementation task or actual token telemetry was rerun; source/doc reviews are not a token-saving benchmark.[^evidence] |

# Open questions

No blocking product question. Manual assistive-technology review and actual token telemetry remain unavailable. Structural legacy mapping is not runtime parity; unsupported legacy sub-options remain tracked obligations rather than silently omitted features.

[^parity]: Required Grid continuation and full feature obligations
[^grid]: Grid row ownership and existing active-detail contract
[^ui]: Public UI contracts
[^legacy]: Legacy Grid behavior and remaining semantic obligations
[^selection]: Private identity sets, transitions and ranges
[^filters]: Private scalar filter state and counts
[^browser]: Selection, filter and reentrancy regressions
[^example]: Full Grid contract explorer
[^evidence]: Final source, commands, package, browser and performance identity
