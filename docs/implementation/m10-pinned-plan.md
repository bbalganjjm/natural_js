---
type: Plan
title: Natural-JS 2.0 M10.9.6.4 pinned columns
description: Extend the existing column owner with measured leading-column pinning and verify native scroll and reduced-detail compositions.
tags: [meta, plan, grid, migration]
status: draft
sources:
  - id: acceptance
    resource: m10-acceptance-plan.md
    title: Current semantic acceptance and retained obligations
    git_blob: a21ba718824d7a1a58a386b23fea38dde9f3d858
  - id: columns
    resource: ../../src/ui/grid-columns.ts
    title: Existing native topology, resizing and restoration owner
    git_blob: 002de08f3bc3f822bd39bb2d1f52bfee6f516d6e
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid column and row-hook integration
    git_blob: 567439878a74284e7a1f60c6898d636322c190e5
  - id: types
    resource: ../../src/ui/index.ts
    title: Existing GridColumn and GridHandle contracts
    git_blob: 6dae7f254a9f274e495941fb84da08963f8f2db3
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Preserved physical-left fixedcol behavior
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: baseline
    resource: evidence/m10964-verification.json
    title: Previous selected acceptance receipt
    git_blob: 66c29b19e5ad2fd138cca86c860c7a0d46f61aff
  - id: scroll
    resource: ../../examples/vite/m10/scroll-boundary.ts
    title: Page-owned wheel boundary composition
    git_blob: 9020af886692a4c39440b62055749b8670f2ec18
  - id: browser
    resource: ../../tests/browser/grid-pinned.spec.ts
    title: Native pin geometry and lifetime regressions
    git_blob: 0e562653c9d219e1da1ff0a7ec3e0fa80053c7a2
  - id: demo-browser
    resource: ../../tests/browser/m10-pinned.spec.ts
    title: Authored layout, detail and trusted wheel regressions
    git_blob: e0949941c47303eee082207c84258ab3a9caead2
  - id: acceptance-delta
    resource: evidence/m10964p-grid-acceptance.json
    title: Selected pin, wheel and reduced-detail witnesses
    git_blob: 78772dc8d1b6335ba7302aad470094ad18194a5c
  - id: evidence
    resource: evidence/m10964p-verification.json
    title: Frozen source, package, browser and performance receipt
    git_blob: 8ef410d0a0f85316d1702db410da034a6a040b7e
generated: { by: codex/gpt-6, at: 2026-10-31T03:10:58Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-31T03:10:58Z }
---

# Goal

Preserve multiple physical-left fixed columns through the existing native column owner. Keep authored HTML, native spans, CVC instances, stable row identities, editable nodes, bounded viewport work and exact cleanup. Also prove native boundary-scroll containment and a reduced-field detail page without adding another UI engine.[^acceptance][^legacy]

# Checkpoint

Start at pushed e0f3b96217d08a5fff67eda62e4ceaa32f0e8631 on 2.0.0-alpha.0 with a clean tree. Independent read-only recovery matches 174 inputs, twenty-two logs, sixteen final gates and every actual member of the previous 183-file archive. Historical runtime is not rerun or recertified.[^baseline]

# Steps

1. Add `pinned?: boolean` to `GridColumn`, default false. `columns()`, `setColumns()` and `onColumnsChange` use the same immutable full state. No additional handle method, type, dependency or public module is needed. Invalid flags or nonleading visible pins raise `GRID_COLUMNS` before DOM changes or cancelling a valid active drag.
2. Visible pinned keys must form a leading contiguous prefix. Hidden keys keep their flag but do not occupy that prefix or a geometry slot. A reorder must supply a valid complete state, including any intended pin changes. Existing group-continuity constraints remain.
3. A native cell sticks only when all of its visible member keys are pinned. A cell crossing the pinned boundary stays in normal native flow; never clone, split or reject an ordinary spanning empty/detail/group cell for that reason. Preserve native colspan/rowspan and accessibility associations.
4. Reuse compiled `CellPlan.keys`, `RowPlan`, column elements, `apply()` and `attach()`. The owner writes only physical-left pin geometry and a `data-pinned-column="true"` state marker. Authored CSS supplies backgrounds and stacking. Restore only owned cell properties/marker; preserve other owners' styles. Full disposal restores authored structure/style exactly.
5. Derive offsets from actual native cell starts, including native spacing and borders. WebKit reports zero COL geometry, so use at most one real representative per required pinned start, preferring narrower current visible membership and retaining the current candidate on ties. Initial static cells are visited first; mounted records support missing/grouped headers. Briefly restore representatives to static flow as one batch, read cell-left minus table-left, then restore owned positions before paint. Use table-level CSS variables, at most one ResizeObserver and one queued frame while pinning is active. Width-only changes read cached representatives and never scan or rebind all records; no per-row observer is allocated. Changed data and row hooks invalidate geometry without measuring each yielded row; final DOM placement flushes it before synchronous/progressive completion. Default unpinned grids allocate no pin observer/frame or marker/style. Preferred widths are not measured widths.
6. Extend both authored column layouts and the all-options demo with pin controls, state output and authored background/stacking styles. Verify two or more pins, a wholly pinned group and a crossing-span group. Recycled/progressive multi-tr records inherit current offsets through the existing attach path.
7. Reuse `employeeDetail(view)` with a second authored reduced template; keep the same controller, Rows, navigation, validation and Popup lifetime. Do not add a generic detail renderer. Test omitted business fields remain unchanged.
8. Test wheel containment using real input and an unbound `overscroll:auto` positive control. Native experiments show the available Windows Firefox/WebKit engines do not enforce CSS-only containment. Reuse one private application boundary listener in the two demos, governed by the existing abort signal. It follows the dominant wheel axis, allows interior/nested scrolling and Ctrl zoom, and prevents native scroll chaining at root boundaries. It does not stop DOM event propagation. Keep native keyboard/touch behavior and CSS containment; add no public scroll utility, manual scrolling, delta conversion, generic input engine or package dependency. Verify both boundaries/axes, focus, independent MDI and quiet teardown.
9. Update source, demos, installed consumers, API/migration/coverage documents and evidence together. Independently review connected code and remediate concrete findings. Run strict build/source/example types, units, full Chromium/Firefox/WebKit, one exact tar in JS/TS and all five Windows browsers, unchanged binding/viewport budgets and changed/full OKF checks.

# Next action

The selected implementation and its sixteen frozen runtime gates are complete. Next, plan shared typed declarations, rule/default composition and validation policy at their existing owners. Compare preserved declaration/default reachability with Form/Grid/List, specify representative HTML/TS before changing contracts, and test shared rules without a new registry or utility engine. Incoming statuses/wire formats follow at the data/communication owners. Keep other component parity, P0 and M13 required. This slice does not close every Grid family.

# Decisions

- The user's continued-work request authorizes this detailed continuation. Existing column ownership is smaller than duplicating topology, preview, row lifetime and restoration in application code.
- Pinning is physical-left/LTR behavior corresponding to the legacy contract. No existing RTL capability was found in preserved source/docs; a general RTL Grid contract is not inferred here.
- Mixed spanning cells scroll normally. Authors who need independently pinned subcells must author separate native cells.
- Width-only pin geometry updates must not rebind rows, change raw data, lose drafts or move focus. Column-state callbacks retain existing commit/error rules.
- Root Apache-2.0 and v1 LGPL material stay separate. Work stays on 2.0.0-alpha.0; master/v1 are unchanged. No publication or release tag.

# Verification log

Baseline recovery, native experiments and independent source audits are complete. Development runs exposed three concrete issues: grouped representatives can miss native width redistribution, row hooks can widen an automatic-layout column after an early measurement, and owned CSSOM writes can change authored style serialization or leave empty attributes in WebKit. The existing owner now prefers narrower visible representatives, invalidates after changed content/hooks and flushes before completion, and restores the authored raw style only when nonowned declarations remain unchanged. An originally absent empty style is reset before removal for WebKit. Cleanup tests retain both absent attributes and literal shorthand/priority styles, while preserving another owner's changes.[^acceptance-delta]

All sixteen latest gates pass on the same 177 normalized inputs. Fifty command records retain twenty-seven development attempts, seven superseded final attempts and the sixteen accepted gates. An unfrozen Firefox attempt recorded two dynamic rules.ts import failures and a changed input map; it is not certified. The later frozen full suite passes without those failures. Twenty-seven available raw geometry, CSSOM and wheel experiment files retain negative controls; overwritten interim observations are not reconstructed.[^evidence]

| Check | Result |
|---|---|
| Source | Build, strict source/example types and 124 units pass. |
| Required engines | 550 full cases pass in each of Chromium, Firefox and WebKit, without skips. The delta adds seventeen owner cases and eleven application cases. |
| Exact artifact | 183 actual files; 302534 packed and 1503179 unpacked bytes; SHA-256 3f05b59df8bad480454c36b2dfa652569c7f039e3feade87e297c2fba673f893. Every payload and individual size matches the workspace/manifest. |
| Installed consumers | Isolated JS/TS and Chromium/Firefox/WebKit/installed Chrome/Edge pass on that same tar. Pin flags, native spacing, width/reorder, focus/caret/drafts, atomic prefix rejection and quiet exact disposal are checked. |
| Original performance | All nine binding and twenty-one viewport budgets pass with unchanged fixtures. Sixty medians are recomputed from 300 durations. The 1,000-row flat initial/rebind medians are 22.0/21.6 ms against 30/35 ms; nested-auto initial/rebind are 44.7/50.7 ms against 90/100 ms. |
| Viewport ownership | The 5,000-row flat/nested scenarios mount at most fourteen physical rows; authored blocks mount at most twenty-four. Append medians are 22.1/20.1/9.9 ms against 100 ms. Existing identity/draft/anchor and exact quiet-cleanup assertions pass. |
| Documents | Changed/full OKF checks pass: 66 concepts, five reserved files, zero errors/warnings. Ten independently reviewed semantic concepts receive verified metadata; twenty-seven historical concepts retain bodies and generated/verified dates with fingerprint-only updates. |

Independent connected Ponytail review checks source, callers, contracts, examples and consumers. The separate receipt preserves archive/log/measurement review and scope limits. The change adds one optional public flag and no framework module, named public type, handle method, entry point or dependency. Actual agent-token and equivalent 1.x task costs remain unavailable; no token or universal-speed claim is made. Historical runtime and full-family status remain unchanged.[^evidence]

# Open questions

Native experiments confirm cell-start offsets in Chromium, Firefox and WebKit, including spacing, positioned/padded roots, scrolling and header-free body representatives. Pinning assumes ordinary untransformed native table geometry; do not add horizontal sticky ownership to ancestor row groups. Manual assistive technology, final fixed-agent/token evaluation and M13 whole-code review remain open. Actual macOS/iOS Safari is excluded; available WebKit is required.

[^acceptance]: Current semantic acceptance and retained obligations
[^columns]: Existing native topology, resizing and restoration owner
[^grid]: Grid column and row-hook integration
[^types]: Existing GridColumn and GridHandle contracts
[^legacy]: Preserved physical-left fixedcol behavior
[^baseline]: Previous selected acceptance receipt
[^scroll]: Page-owned wheel boundary composition
[^browser]: Native pin geometry and lifetime regressions
[^demo-browser]: Authored layout, detail and trusted wheel regressions
[^acceptance-delta]: Selected pin, wheel and reduced-detail witnesses
[^evidence]: Frozen source, package, browser and performance receipt
