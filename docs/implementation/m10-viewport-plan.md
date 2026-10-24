---
type: Plan
title: Natural-JS 2.0 M10.8 viewport plan
description: Measured variable-height Grid rendering with bounded DOM and preserved logical-page contracts.
tags: [plan, grid, performance, accessibility]
status: draft
sources:
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid field, view, draft and selection integration
    git_blob: 87c70d9ca2a4d566dbdd25dd80c734d2dce16314
  - id: paste
    resource: m10-paste-plan.md
    title: Completed atomic paste contract
    git_blob: 2f01b016807fc6dabcddbec409097c5d720ec7e8
  - id: parity
    resource: feature-parity-plan.md
    title: Required viewport and remaining parity
    git_blob: 762a68615866daac0fb14dfa7dd53b437928287d
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Private measured window and scroll ownership
    git_blob: d02fbfe5407b80786733034f2f5aaaea5d71ef55
  - id: browser
    resource: ../../tests/browser/grid-viewport.spec.ts
    title: Logical scopes, geometry, drafts, accessibility and lifecycle regressions
    git_blob: 94b18cca941e2a8e5003c91a0346d4c07fa9b0cd
  - id: unit
    resource: ../../tests/grid-viewport.test.ts
    title: Window boundary and overscan calculations
    git_blob: a007af3f632dabfcfbd43e3baf955806c959151b
  - id: benchmark
    resource: ../../tools/benchmark-grid-viewport.mjs
    title: Completed operation timing, live geometry and post-GC DOM counters
    git_blob: 7370923a46bd5960e8803319da24777f1128262c
  - id: evidence
    resource: evidence/m108-verification.json
    title: Frozen M10.8 source, commands, artifact and results
    git_blob: b0abb7984f9149415809190031ad1485df246ad4
generated: { by: codex/gpt-6, at: 2026-10-18T11:23:05Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-18T11:23:05Z }
---

# Goal and preceding checkpoint

The user authorized M10.8 after pushed M10.7 d2576c2. Recheck that checkpoint and preserve its atomic paste, protected/raw choice semantics, 92-unit and three-engine/installed-package evidence as historical results. Work stays on 2.0.0-alpha.0; the prior unrelated js lockfile, v1, master and publication remain outside this stage.[^paste]

Render a bounded window of authored Grid rows while retaining CVC, native table semantics, immutable Rows identity, nested binding and concise agent-facing contracts. Paging or releasing off-page records alone is not virtualization.[^parity]

# Contract before code

- Add optional `viewport: { root: HTMLElement; estimate: number; overscan?: number }` to bindGrid. The authored ancestor scroll container supplies its own finite CSS height and overflow; estimate is a positive initial CSS-pixel logical-row height, refined from actual measurements. Overscan is a nonnegative integer row count, default 3. Disabled viewport mode preserves existing rendering and API behavior. No generated visual theme or fixed-height requirement.
- Add `grid.reveal(id)` to scroll an existing nondeleted row in the current logical page into the window without changing selection or focus. A filtered-out/off-page ID rejects explicitly; applications still own filters and page changes. Nonvirtual Grids reveal an already rendered row.
- Existing visible scope remains the complete sorted/filtered logical page. Checks, selection ranges and paste must not shrink to mounted DOM. Private mounted IDs are separate; offscreen paste and validation use compiled field/choice plans and data without creating all target rows.
- Keep RowId-keyed measured heights and prefix offsets private. Coalesce scroll/resize/measurement changes in one animation frame, retain the top visible ID and intra-row offset, and handle authored wrapping, nested controls, fonts and column resizing. Hidden/prepared CVC roots may start with a minimal estimated window and update when shown.
- Mount intersecting rows plus declared overscan and at most one focused logical unit. Preserve that exact node, input selection and composition while scrolling; represent a distant focused unit with disjoint spacer segments instead of retaining all intervening rows. Filtering/deletion/explicit paging that removes it follows existing visible-focus recovery. Release off-window Select ownership and element references.
- Current templates have one authored tr per RowId. Private offsets operate on logical units, allowing later grouped/merged row blocks to remain indivisible; body grouping/merging itself belongs to M10.9 and is not claimed here.
- Use aria-rowcount and header-inclusive aria-rowindex on native table/rows; owned spacer rows are aria-hidden and noninteractive. Keyboard row navigation reveals logical neighbors before focus, keeps editor shortcuts native, and never uses DOM IDs as data identity. Restore authored attributes, styles, template, observers, listeners and scheduled work on disposal or failure.
- Progressive loading remains application-owned Rows.add/setMany/replace and communication cancellation. Appending must preserve the viewport anchor and existing IDs; no loader/transport registry is added.

Representative use (the scroll container and native table remain authored HTML/CSS):

```ts
const grid = bindGrid(table, {
  rows, viewport: { root: scrollRegion, estimate: 48, overscan: 3 },
  paste: true, parse: applicationParsers
});
grid.reveal(rows.entries()[2500].id);
```

# Ownership and change order

1. Private viewport owner: measurements, offset/window calculations, native spacer segments, scroll/ResizeObserver/animation-frame lifetime and anchoring. No Rows, business rules or public utility dependency.
2. Grid: split logical projection from mounted reconciliation; preserve selection/drafts/errors/field references and existing callback ordering. Reuse columns, raw choice descriptors, parser/validator candidates and the atomic Rows operation.
3. Extend keyboard/reveal, offscreen paste and native table ARIA; add the existing demo's viewport controls and large dataset. Extend installed JS/TS/browser consumers and focused failure/ownership regressions.
4. Document actual API as draft, update indexes/coverage/log/fingerprints, independently review source/body/evidence, then stamp verified. Run all supported browser and package gates; commit/push only the requested branch.

# Verification and budgets declared before measurement

Use 5,000-row flat and nested fixtures, a 400-CSS-pixel viewport, authored wrapped rows, two warm-ups and five measured runs on the same host. Mounted records must not exceed intersecting rows plus overscan on both sides plus one focused unit; assert connected and retained record/Select ownership separately. A representative 48px estimate with short rows should stay below 80 mounted logical rows; unusually tall rows are measured, not clipped.

Host-relative Chromium median budgets: initial binding 120ms flat / 180ms nested, settled scroll/reveal 100ms, resize/reorder 150ms, and 1,000-row offscreen two-field paste 2,000ms. Record raw samples, logical/mounted/node counts and cleanup; retain existing 1,000-row binding budgets. These budgets are regression gates, not universal device/frame-rate promises.

Verify rapid bidirectional scroll, estimated-to-measured correction, above-anchor height changes, oversized rows, focus/caret/composition, nested Select ownership, offscreen drafts/errors/paste, complete logical-scope checks/ranges, sort/filter/page/reload/delete/revert/append, hidden/reordered columns, two MDI instances, hidden-to-visible roots, failure rollback and teardown. Run full Chromium/Firefox/WebKit and identical-artifact JS/TS plus installed Chrome/Edge. Actual Safari, manual assistive technology and actual OS clipboard integration remain unverified/excluded as recorded previously.

# Implementation and independent corrections

The private viewport owner handles measured heights, prefix offsets, binary window lookup, disjoint spacers, RowId anchors and scroll/observer/frame lifetime. Grid keeps logical projection and mounted bindings separate, reuses existing field/choice/rule owners, caches offscreen HTML-validation probes and exposes only one inline option plus `reveal(id)`. No new public named type, runtime dependency, transport registry or generic virtualization package is added.[^grid][^viewport]

Independent source review found and verified corrections for top-sticky header occlusion, failed formatter projection restoring root/static/data ARIA and scroll, preservation of pending anchors/measurements on rollback, detached controls inheriting disabled fieldsets with first-legend exemption, and keyboard post callbacks that filter/dispose before reveal. Five added regressions cover those boundaries. WebKit focus fixtures settle native focus before a separate far scroll, retaining exact node, caret, composition and distant-window assertions instead of racing the browser's queued focus scroll.[^browser]

The benchmark checks actual mounted-row intersection, different measured heights, target visibility and forward movement, one invalid focused draft/caret, twenty alternating scroll cycles, 1,000-row/two-field offscreen paste with one event, full-page checks, exact authored restoration and zero late DOM mutations. Chromium CDP counters record before/after cycle and disposal ownership. Provisional diagnostics found native focus/selection references retaining 46 flat / 52 nested nodes after fixture removal; focusing the existing external main and clearing document ranges returns to the nine-node, zero-listener baseline. The raw final measurement records both states. This explicit native-focus cleanup is outside timed operations; it does not establish JavaScript heap retention or a direct cancelAnimationFrame call.[^benchmark]

# Verification

Build, strict source and browser-controller types and 95 unit tests pass. Final full Chromium/Firefox/WebKit suites pass 242/242 each, including 22 focused viewport regressions and the added demo case. Independent reviews approve the runtime/API bodies, benchmark assertions and final source/artifact record.[^evidence][^browser][^unit]

Installed JS/TS and all five Windows browser consumers pass the same unpublished 153-file artifact: SHA-256 487285dc347b4d763391bd2101a6dab8faee6ee313fc5162b138dbe44ecdae69, 244,971 packed bytes and 1,211,094 unpacked bytes. Every member matches the frozen workspace. Five package entry points, no runtime dependencies and the private viewport boundary are verified; package consumers cover bounded 5,000-row rendering, logical checks, offscreen raw-value paste, reveal and table restoration. Variable-height/pinned-caret/root-style checks belong to the source suites and benchmark. Sixteen final command records preserve arguments, exit codes, 28 source/fixture hashes and all raw logs; separate provisional cleanup diagnostics are retained.[^evidence]

For 5,000 rows, same-host Chromium initial/reveal/scroll/resize-reorder/paste medians are 18.4/65.6/83.6/49.5/33.4ms flat and 7.4/66.0/82.8/49.6/33.4ms nested, with two warm-ups and five measured runs. Both fixtures mount at most 14 data rows, including the distant focused editor; all declared budgets pass. Every sample records actual viewport intersections, different row heights, twenty alternating cycles and zero late teardown mutations. Post-GC node/listener counts are stable across those cycles and return to the pre-fixture baseline after the recorded native-focus release.[^evidence][^benchmark]

Existing 1,000-row flat initial/rebind/edit/sort/filter medians are 12.1/16.0/0.9/2.9/1.9ms; nested-auto initial/rebind/sort/filter are 36.3/43.8/8.6/5.8ms. Existing budgets pass. These measurements are host-relative completed operations, not universal frame-rate, bulk-processing, heap-retention or coding-agent/token savings. No equivalent fixed AI task or actual token telemetry was rerun.[^evidence]

# Completion and next action

Prepare M10.9 remaining Grid behavior and other component/P0 parity. Design indivisible multi-tr/merge blocks with viewport measurement, spacer and keyboard integration before adding their public contract. Reconcile G01-G20 options/callbacks and extend the same demo with functioning controls. This stage approves no retirement, npm publication or release tag. Personal acceptance, manual assistive technology and actual OS clipboard integration remain open; actual macOS/iOS Safari remains excluded.

[^grid]: Grid field, view, draft and selection integration
[^paste]: Completed atomic paste contract
[^parity]: Required viewport and remaining parity
[^viewport]: Private measured window and scroll ownership
[^browser]: Logical scopes, geometry, drafts, accessibility and lifecycle regressions
[^unit]: Window boundary and overscan calculations
[^benchmark]: Completed operation timing, live geometry and post-GC DOM counters
[^evidence]: Frozen M10.8 source, commands, artifact and results
