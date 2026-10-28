---
type: Plan
title: Natural-JS 2.0 M10.9.6.4 Grid semantic acceptance
description: Verify mapped Grid outcomes with native row activation and tested application compositions while retaining cross-owner obligations.
tags: [meta, plan, grid, migration]
status: draft
sources:
  - id: closure
    resource: m10-closure-plan.md
    title: Required Grid semantic continuation
    git_blob: 9297be6a74038feb050264600576c87da31ff697
  - id: audit
    resource: evidence/m1096-grid-audit.json
    title: Immutable 7a36a39 Grid audit
    git_blob: 97f72ec88280d4cbcb49d737909f7d78d709825f
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid binding and delegated native events
    git_blob: 625fc54b599da36705208cb7ad4df45029e619c4
  - id: selection
    resource: ../../src/ui/grid-selection.ts
    title: Existing active, selected and checked transitions
    git_blob: 1b74c39d3161345aec1c9d0c3dd9de49c947f23d
  - id: baseline
    resource: evidence/m10963-verification.json
    title: Completed progressive slice receipt
    git_blob: c554eed395405aa38ec667497a95760f542ef1cb
  - id: acceptance
    resource: evidence/m10964-grid-acceptance.json
    title: Current contract witnesses and specific retained obligations
    git_blob: bdaa8758faef962ea527f5cf505a5148a265a684
  - id: evidence
    resource: evidence/m10964-verification.json
    title: Frozen runtime, archive and performance gates
    git_blob: 66c29b19e5ad2fd138cca86c860c7a0d46f61aff
generated: { by: codex/gpt-6, at: 2026-10-28T13:26:39Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-28T13:26:39Z }
---

# Goal

Accept concrete Grid behavior against the immutable 89-entry, seventeen-dynamic-group audit. Reuse existing owners; add only missing outcomes. Keep authored HTML/CSS, native table semantics, stable RowIds, independent selection/checks, bounded binding and per-page cleanup. Cross-owner data import, rule declarations and CVC/configuration obligations stay required until their owning stages finish.[^closure][^audit]

# Checkpoint

Start at pushed f978889 on 2.0.0-alpha.0 with a clean tree. Independent read-only recovery matches all 171 normalized inputs, 95 raw logs, sixteen latest final gates and the actual 183-file package from M10.9.6.3. This recovers the historical record; it does not rerun or recertify its runtime gates.[^baseline]

# Steps

1. Resolve all thirty audit contracts to current source and exact acceptance witnesses in a new ledger. Preserve the old audit and v1 source unchanged. Distinguish accepted local outcomes from remaining cross-owner or untested obligations.
2. Add `selectOnRowClick?: boolean`, default `false`. When true, noninteractive rendered-record clicks call the existing selection transition. Require an authored `button[data-select-row]` so keyboard access and pressed state remain available. Invalid values or a missing selection button fail with `GRID_SELECT` before DOM ownership. Do not add roles, tabindex, a second selection store or an event engine.
3. Exclude labels, native interactive content, authored button/link roles, hidden/inert content, prevented events and nested tables from the added click path. Require a visible enabled non-inert selection button with `tabIndex >= 0` in that record at event time; an unavailable keyboard alternative must not leave a pointer-only action. Existing selection buttons execute once. Resolve every physical record row through the existing RowId map, including recycled/progressive records. Keep eligibility, veto, modifiers, current snapshots and errors under the existing selection owner.
4. Test application compositions for active/batch/checked projections, own-property field picks, scope intersection, membership append/replacement, authored defaults, native header/template inspection and controlled dispose/edit/rebind. Add no public projection or topology utility.
5. Test post-edit observation with a native root listener registered after `bindGrid`, a row-hook-owned WeakMap of physical rows to RowIds, and explicit listener cleanup. Fetch the current Rows snapshot at event time. Cover input drafts, valid/invalid/manual changes, custom events, row recycling and rebind. This proves a Grid composition; generic CVC event declaration work remains separate.
6. Add the option and observable native-event composition to the all-options demo. Add authored row hover/focus-within styling and verify the two authored layouts without making framework-owned visual design.
7. Independently review connected source, tests, examples, package consumers, API documentation and ledger. Fix reproducible findings and preserve failed attempts. Run strict build/source/example types, units, full Chromium/Firefox/WebKit, the identical tar in isolated JS/TS and five Windows browser consumers, unchanged binding/viewport budgets and changed/full OKF checks.

The test and package changes reach `grid.ts`, its existing public inferred options, the Grid demo, focused browser tests and installed consumers. `GridHandle` needs no new method or public type. No dependency, network loader, general event/configuration engine or utility package is part of this slice.[^grid][^selection]

# Next action

Continue Grid-local acceptance with two or more horizontally pinned columns: cumulative offsets must follow actual widths, hide/reorder, grouped header/body/footer, responsive dimensions and a positioned authored root. Prefer ancestor CSS variables, existing column callbacks and one header/root ResizeObserver for preview/responsive geometry; do not observe each row. Specify the presentation of a native spanning cell crossed by the pinned boundary before implementation. Add focused boundary-scroll containment and reduced-field detail compositions through current owners. Then resolve shared declarations/rules/default composition and incoming status/wire contracts at their owners. Keep every incomplete family open; this selected acceptance does not complete parent M10.9.6 or whole-framework parity.[^acceptance]

# Decisions

- The user authorized continued implementation. Preserve existing default button activation; row-wide pointer activation is opt-in. An authored selection button remains the accessible alternative.
- Native root listeners registered after Grid delegation observe Grid's synchronous draft/commit handling. Row hook listeners run earlier and are not an equivalent post-edit contract.
- Row projection uses current immutable Rows snapshots, never DOM indexes. DOM IDs remain label/ARIA references only.
- Incoming legacy `rowStatus`, shared programmatic field-rule declarations and global/local hook composition remain explicit required cross-owner work. No user-facing omission is approved.
- Available Chromium, Firefox, WebKit, Chrome and Edge checks are required. Only actual macOS/iOS Safari is excluded. Publication and release tags remain deferred.

# Verification log

The selected implementation passes all sixteen final gates on 174 frozen execution inputs. Six development records retain the initial failed demo text assertion and observed source changes; later final gates all use the identical map. The first focused run also exposed a demo disposal callback referencing its disposed handle; clearing the application reference before disposal fixes the lifecycle boundary, and the demo tests now reject unexpected page errors. The original audit and historical runtime records remain unchanged.[^evidence][^baseline]

| Check | Result |
|---|---|
| Source and examples | Build, strict source/example types and 124 unit tests pass. No new runtime module, dependency, public type or GridHandle method. |
| Required engines | Chromium 522, Firefox 522, WebKit 522; no skips. Twenty-three new cases: thirteen activation, seven compositions and three authored-demo cases. |
| Exact installed artifact | 183 files; 297815 packed / 1478042 unpacked bytes; SHA-256 acb0a3edfe6c53415df4de91d9c8c3b7f20e489bb735f456dddc55d241513cbd. The same tar passes isolated JS/TS and Chromium, Firefox, WebKit, installed Chrome and Edge. Every actual member matches workspace bytes and manifest size/name. |
| Unchanged binding budgets | 1,000 flat initial/rebind/edit/sort/filter medians: 23.4/21.8/1.0/2.7/1.5 ms. Nested-auto initial/rebind/sort/filter: 49.6/57.0/6.3/3.0 ms. Original nine budgets pass. |
| Unchanged viewport budgets | All twenty-one original budgets pass on 5,000-record flat/nested/multi-tr fixtures. Maximum physical rows: 14/14/24; append adds 250 clean records, preserves identity/drafts/anchor and one event; exact late-event cleanup passes. Sixty raw medians are recomputed. |
| Scale correctness | The new 10,000-record case proves prefix100, final identity, full logical extent, bounded mounted rows/bind hooks, exhaustion, cancellation and quiet disposal. It is not a 10,000-record timing benchmark. |
| Coverage | Thirty contracts resolve all 89 surface entries and seventeen dynamic groups. Eleven local outcomes have no remaining local obligation; nineteen contracts retain specific local or cross-owner acceptance. All twenty complete families remain open; no omission is approved. |

Independent connected source/API/archive/evidence/document review approves the selected behavior. The review checks all twenty-two raw logs and four input manifests, the exact archive and all sixty medians from 300 recorded durations. It also confirms 105 live-state checks, 300 scroll windows, fifteen append samples and exact quiet cleanup. Final changed/full OKF output and fingerprint-only history are preserved alongside the runtime receipt; they do not recertify historical runtime.[^evidence][^acceptance]

# Open questions

Manual assistive-technology testing, actual token telemetry and the final fixed-agent evaluation remain open. The final M13 whole-code Ponytail review/remediation is mandatory after parity completion.

[^closure]: Required Grid semantic continuation
[^audit]: Immutable 7a36a39 Grid audit
[^grid]: Grid binding and delegated native events
[^selection]: Existing active, selected and checked transitions
[^baseline]: Completed progressive slice receipt
[^acceptance]: Current contract witnesses and specific retained obligations
[^evidence]: Frozen runtime, archive and performance gates
