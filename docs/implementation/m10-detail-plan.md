---
type: Plan
title: Natural-JS 2.0 M10.9.5 detail navigation and geometry
description: Compose validated row details through CVC and add authored height controls and occlusion-aware reveal to the existing Grid.
tags: [meta, plan, grid, accessibility]
status: draft
sources:
  - id: parent
    resource: m10-parity-plan.md
    title: Required Grid continuation
    git_blob: 8f0d17d80872883272cff4ca058e28945c7c46b2
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Legacy more, vertical resize and action-driven scrolling
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Logical projection, stable identity and reveal
    git_blob: 0a3fe6f4fa2fce0d9799059a8de06fd6e5ba6b6f
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Measured row windows and sticky occlusion
    git_blob: d02fbfe5407b80786733034f2f5aaaea5d71ef55
  - id: form
    resource: ../../src/ui/form.ts
    title: Shared row drafts, native constraints and validation
    git_blob: 21df9a8451977f5d180d4a1170fd004da0c6dad9
  - id: popup
    resource: ../../src/ui/popup.ts
    title: Existing CVC Popup lifecycle and focus restoration
    git_blob: 49ec03d610615aff95952804541c94892799535f
  - id: height
    resource: ../../src/ui/grid-height.ts
    title: Authored height control, ARIA and reverse cleanup
    git_blob: 83e7e08a3036ff2d96279b768095703f8d61e4ed
  - id: geometry-browser
    resource: ../../tests/browser/grid-geometry.spec.ts
    title: Height, sticky bands, fresh measurements and hidden-root accessibility
    git_blob: 45e93f4737d06db7fadceb2574efe4a6c88a9e90
  - id: detail-browser
    resource: ../../tests/browser/grid-detail.spec.ts
    title: Row scopes, rollback boundaries and disposal acceptance
    git_blob: 59fe30118252219ffd40fbc37f01689f93863457
  - id: detail-controller
    resource: ../../examples/vite/m10/detail.ts
    title: Shared authored CVC details and validated identity navigation
    git_blob: 18d920e324e6e0487392defd211f1f5c1380775c
  - id: demo-browser
    resource: ../../tests/browser/m10-demo.spec.ts
    title: Old Grid demo and six detail/height acceptance additions
    git_blob: e8435d93c659aa574972af902bc0c53996eeb307
  - id: evidence
    resource: evidence/m1095-verification.json
    title: Frozen source, exact artifact, commands and unchanged benchmark evidence
    git_blob: 838722124960826f5cfbf9e72373229de36b87e7
generated: { by: codex/gpt-6, at: 2026-10-24T07:32:02Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-24T07:32:02Z }
---

# Goal

Implement the M10.9.5 parts of G13/G15/G16 with the existing Grid, Form, Popup and CVC owners. Preserve authored HTML, nested values, stable RowIds, independent selection, bounded rendering and exact teardown. Do not create a navigation engine, clone headings or controls into generated details, or add a generic resize library. All remaining legacy option/dynamic obligations and M13 remain required.[^parent][^legacy]

# Checkpoint

This slice's implementation and independent source/API/runtime/package/performance review are complete. Final documentation checks and metadata closure are recorded below. M10.9.6, other-component/CVC parity, P0 and the mandatory M13 review/remediation remain required.

Before code, a separate read-only audit matched the preceding b9d2956 checkpoint: 158 source/configuration files, two preserved metadata files, 33 raw logs, sixteen final gates and all 173 actual artifact members. The exact tarball SHA-256 is db2e2769332fbdab6c12ef5a3a655f58d704c3fa7a7dd5b625de7c9a985f80ea. This checks preserved evidence without rerunning or recertifying historical runtime results. Work stays on 2.0.0-alpha.0; master/v1, npm publication and release tags remain unchanged.

# Steps

## Public contract before code

```ts
const grid = bindGrid(table, {
  rows,
  viewport: { root: scrollArea, estimate: 48 },
  heightResize: { root: scrollArea, handle: resizeButton, min: 160, max: 800 }
});
const ids = grid.rowIds("filtered");
grid.reveal(ids[0], { block: "center" });
```

- Add rowIds(scope: GridRowScope): readonly RowId[]. visible is the complete logical page, including unmounted rows; filtered is the sorted status/manual/column projection before paging; store is live Rows order. visible/filtered include explicitly displayed tombstones. Never apply selection/check eligibility to this accessor. Freeze returned snapshots; old results remain unchanged. Invalid scope and disposed calls fail without mutation. Use existing arrays, no DOM scanning or second projection.
- Extend reveal(id, options?: { block?: ScrollLogicalPosition }); nearest remains the default. Accept nearest/start/center/end, reject invalid options before changes with GRID_VIEWPORT_ALIGN. Keep the existing current-logical-page boundary and no implicit selection, filter clearing or page changes. Virtual and nonvirtual tables use the same native block meanings. The measured viewport accounts for both sticky header and footer bands; nonvirtual native scrolling uses authored scroll-padding/scroll-margin for sticky content. Preserve current focus/drafts and bounded windows; do not add a second ancestor-scanning scroller.[^grid][^viewport]

## Authored detail composition

Use one authored CVC PageDefinition with shared Rows, bindForm and openPopup. A row action opens by RowId independently of active selection, canSelect and selection vetoes. The same page can mount in ordinary content. Authors choose fields, layout, messages and business rules; hidden Grid columns may still appear in details. Do not add a Grid detail binder or another Popup runtime.[^form][^popup]

- Demonstrate visible/filtered/store navigation scopes. Derive neighbors from rowIds, skip tombstones, stop at boundaries and do not wrap. Validate the current Form before navigation, authored close and native dialog cancel; focus the first current invalid element. Re-read liveness and projection after validation because valid edits may change sort/filter/page membership.
- For filtered cross-page navigation, calculate page from the raw filtered array, including shown tombstones. For store-scope rows outside a filter, edit details without clearing that filter. Reveal only targets on the current logical page. Keep detail identity separate from Grid selection.
- Removal/replacement of the current ID unbinds the stale Form and exposes an authored no-row state. Clean up subscriptions/listeners through CVC ownership. Forced Popup/page disposal remains unvetoable; general Popup guard/dragging policies stay with their owning parity work.
- Preserve committed data on failure. Form.bind is not atomic around application renderer failures; do not promise rollback of application side effects. Publish current detail identity after successful binding and handle missing records explicitly. Keep the original error visible and allow controlled retry.
- Restore focus to the opener when available; use a connected authored fallback after cross-page navigation unmounts it. Do not move focus out of another open modal. Repeat opening, navigation and disposal without accumulating resources.

## Authored height controls

Add only heightResize?: { root: HTMLElement; handle: HTMLButtonElement; min: number; max: number }. No new height methods, callbacks or public named types. The root is a same-document proper ancestor of the table; if viewport is configured both roots must match. The labelled type=button handle is outside the table and repeated records. Validate positive finite border-box pixel bounds with min <= max and reject shared ownership before changing markup.

- Reuse private restoreAttributes/uniqueId and existing pointer/focus conventions. Expose a focusable horizontal separator with controls, orientation and value bounds/current height; preserve authored labels. Generate a document-unique root ID only when needed. Authors supply layout and styles.
- Primary pointer drag adjusts measured border-box height using clientY deltas. Convert CSS content-box sizing correctly. Coalesce previews in one animation frame; commit final movement on pointerup. ArrowUp/Down change 10 pixels, Shift changes one, Home/End select min/max. Escape, pointercancel and lost capture cancel and restore exact pre-drag styles.
- Disabled, hidden or inert handles do not resize. Disposal/construction failure releases listeners/capture/frames/ownership and restores bind-time height/min-height/max-height properties and priorities, handle attributes/styles and generated ID without overwriting another owner's styles. Observe actual root size for value updates. An unmeasurable root omits its current value and makes the handle inert until measurable, preserving authored inert state. If authored CSS or external resizing puts the actual height outside configured bounds, widen the announced range to contain that actual value; owned adjustments still use the configured bounds.
- Keep the native table and footer in the authored scroll area; do not recreate the old copied-header/footer machinery or subtract a separate footer from pointer deltas. Existing viewport observation handles root height changes; fix its missing bottom sticky occlusion rather than introduce another scrolling owner.[^viewport][^legacy]

## Legacy scrolling boundary

Use authored overscroll-behavior: contain for the old windowScrollLock outcome, without wheel interception. Explicit reveal alignment lets application selection/check/add handlers request centered scrolling. Append/reveal/validation remain explicit actions; do not silently change defaults or claim all legacy flag equivalence. Old progressive scheduling, last-invalid policy, chooser/dragging and remaining options/dynamic paths stay required in M10.9.6/P0 or their owning milestone until resolved or explicitly omitted.[^legacy][^parent]

## Change order and verification

1. Independently review this contract against actual legacy callers and existing owners.
2. Add the minimal identity accessor and reveal alignment. Implement private height ownership and sticky-footer geometry with focused tests, preserving all existing contracts.
3. Extend the all-options demo with the authored CVC detail page and working height controls. Test nested edits, invalid navigation/close, tombstones, sorted/filtered/paged/virtual paths, layout changes, cancellation and cleanup.
4. Update installed JS/TS/browser consumers and draft API/migration/demo concepts, indexes, coverage and log in the same task.
5. Freeze inputs and run strict build/source/example types, units, complete Chromium/Firefox/WebKit, one inspected artifact in JS/TS and all five Windows browsers, original binding/viewport budgets, and changed/full docs. No performance budget, fixture size or assertion is weakened. Independent source/API/evidence review precedes verified metadata and commit/push.

Root owns Grid/index integration and this plan/evidence; one agent owns private height/viewport geometry and tests, another owns the authored demo/details and its acceptance cases. All use the existing package entries; no dependency is added. A separate reviewer checks connected failure/cleanup paths and frozen evidence. Avoid simultaneous browser/performance jobs.

# Next action

Specify M10.9.6 legacy semantic closure from the recorded remaining G01-G20 options/defaults/callbacks and dynamic paths. Retain per-field dirty, edited-deletion display and progressive/scheduler obligations; implement or resolve each before closing families. Other component/CVC parity remains required. M13 whole-code review/remediation stays after all required features and before personal acceptance or separately requested release work.

# Decisions

Legacy detail behavior is shared data plus guarded navigation, not its generated table or jQuery implementation. Native IDs connect ARIA only; RowId and compiled fields identify data. Keep business navigation/factories/formatting in the authored CVC example and only necessary view identity/geometry in Grid.

# Verification log

Fresh build, strict source/example types and all 120 unit cases pass on 162 normalized source/configuration inputs. Complete Chromium/Firefox/WebKit suites pass 382/382 each without skipped cases. The 35 new browser cases comprise eleven identity/lifetime cases, eighteen geometry cases and six demo cases; all earlier acceptance assertions remain. The baseline audit above is evidence recovery, not new runtime certification.[^evidence]

Installed JS/TS and Chromium/Firefox/WebKit/installed Chrome/Edge pass the same unpublished 178-file artifact, SHA-256 8543ba57452aa6720fbb49765220f075ff713cd65a347dffe75159ec584fda8d, 286,193 packed / 1,412,830 unpacked bytes. Actual tar listing and every member match frozen build/source/README/license/package files. Five public entries and zero runtime dependencies remain; all four tested private height-module paths are blocked. Sixteen final gates share identical 162-file fingerprints, excluding nested installed/cache directories. All 23 raw command records remain, including seven provisional records; three separately hashed development logs preserve actual reproductions and pointer diagnostics. No provisional input certifies final code.[^evidence]

Two warm-ups and five measured samples preserve the four original benchmark source files, every fixture size/operation and all existing budgets. For 1,000 flat rows, initial/rebind/edit/sort/filter medians are 22.5/22.0/1.1/3.9/2.2ms against unchanged 30/35/5/10/8ms budgets. Nested-auto initial/rebind/sort/filter medians are 49.6/62.2/8.9/3.9ms against 90/100/25/18ms budgets. Sixty raw medians are independently reproducible from retained samples; these are same-host Chromium observations, not a universal speed or before/after improvement claim.[^evidence]

All table timings below are milliseconds.

| 5,000-row fixture | Initial | Reveal | Scroll | Columns | Paste | Move | Append | Dispose | Maximum physical rows |
|---|---|---|---|---|---|---|---|---|---|
| Flat | 16.4 | 65.4 | 83.7 | 49.8 | 33.2 | 62.6 | 23.1 | 24.8 | 14 |
| Nested | 10.2 | 59.2 | 83.3 | 50.1 | 33.1 | 62.8 | 17.0 | 23.8 | 14 |
| Two-tr/merged | 13.8 | 66.0 | 49.7 | 49.6 | 33.2 | 61.7 | 32.8 | 20.2 | 24 |

All original timing/DOM/ownership budgets pass. The existing final 250-row append remains under its 100ms budget and retains old snapshots, save changes, checks, focused node/draft/caret and scroll anchor; cleanup covers all 5,250 rows. Twenty-cycle observations retain bounded mounted DOM and quiet late events. No measured JavaScript heap retention, manual accessibility acceptance or actual agent-token saving is claimed.[^evidence]

Independent review reproduced an absent inline-style attribute becoming style="" when combined height/viewport cleanup ran in acquisition order. The retained red case confirms it. Release height before viewport in both construction failure and disposal, so property-scoped restoration cannot retain the viewport's temporary style attribute. A later before-row failure rolls the projection back; after-row failure preserves committed page/IDs and permits refresh. Acceptance now checks both existing boundaries rather than changing them.[^grid][^detail-browser]

Geometry regressions reproduced a stale cached height leaving end alignment forty pixels away from the sticky footer after an offscreen row changed height. Explicit reveal measures an already mounted target; remounted targets keep requested alignment until fresh measurement. A separate hidden-root-only Axe case reproduced aria-required-attr when a visible separator lacked an unknowable current height. Make that handle inert until measurable, restoring only framework-owned inert state and retaining authored inert state. These are actual reproduced defects, not relaxed budgets or invented height values.[^viewport][^height][^geometry-browser]

Development fixture corrections preserve their intended assertions: authored managed columns need matching colgroups; a grouped record marks the tbody once; sticky cells supply actual band bounds; native dragging first brings its handle into view. The fieldset case checks its disabled attribute and real disabled descendants because Playwright's disabled matcher does not represent that fieldset state. Disposed errors retain the existing GRID_DISPOSED code. Final gates rerun the complete frozen suite; development tool output is not reconstructed as byte-exact raw evidence.[^geometry-browser][^detail-browser][^demo-browser]

The first provisional full Chromium suite passed 381/381; Firefox passed 380 and failed its native mouse-drag fixture. Its recorded start was clientY about 701 in a 720px viewport, while the requested endpoint was about 771. The retained diagnostic trace shows out-of-content captured movement at clientY -85 with buttons=0. Center the handle with enough authored test scroll space and assert the whole gesture, including its late 110px move, remains inside the viewport; retain the exact 70px drag and 470px result. This corrects a browser-input precondition, not a weakened assertion or timeout.[^geometry-browser]

A separate red regression reproduced a stranded mouse gesture continuing after the primary button was released: a 450px preview and late movement incorrectly committed 800px instead of restoring the original 400px. One mouse-only primary-button guard now calls the existing cancellation/cleanup path; normal pointerup still commits. Retain the [red](evidence/m1095-lost-primary-red.log), [native diagnostic](evidence/m1095-firefox-pointer-diagnostic.log) and [development receipt](evidence/m1095-development.json) separately. The provisional 3048069947c046d5dcc8ffa893f66ff37cc7d917479b3f77432365fdc8eca774 artifact predates this guard. Rebuild and rerun every final gate on the corrected frozen inputs; no provisional result certifies the later code.[^height][^geometry-browser]

Work-cost observations: one row-identity accessor, one optional existing reveal argument and one height option use existing projection/viewport/DOM owners. A private Grid-specific height module owns only the actual handle resources; no axis engine, public utility, runtime dependency, navigation manager, per-row Form or second CVC runtime is added. The example keeps its shared business model, rules, parsers and native detail choices near its controller. Equivalent fixed agent tasks and actual token telemetry are not measured here.

Changed and full OKF checks pass with 59 concepts, five reserved files, zero errors and zero warnings. Ten independently reviewed changed concepts receive verified metadata. Twenty historical concepts retain exact bodies and generated/verified dates with fingerprint-only updates; the [history receipt](evidence/m1095-doc-history.json) records their identities. Final raw [changed](evidence/m1095-docs-changed-final-2.log) and [full](evidence/m1095-docs-full-final-2.log) outputs preserve the documentation result. This document closure does not rerun or recertify historical runtime gates.

# Open questions

Full legacy option/default/dynamic closure, actual token telemetry, fixed final agent tasks and manual assistive technology remain open. Actual macOS/iOS Safari is excluded; available WebKit is required. No npm publication or release tag.

[^parent]: Required Grid continuation
[^legacy]: Legacy more, vertical resize and action-driven scrolling
[^grid]: Logical projection, stable identity and reveal
[^viewport]: Measured row windows and sticky occlusion
[^form]: Shared row drafts, native constraints and validation
[^popup]: Existing CVC Popup lifecycle and focus restoration
[^height]: Authored height control, ARIA and reverse cleanup
[^geometry-browser]: Height, sticky bands, fresh measurements and hidden-root accessibility
[^detail-browser]: Row scopes, rollback boundaries and disposal acceptance
[^detail-controller]: Shared authored CVC details and validated identity navigation
[^demo-browser]: Old Grid demo and six detail/height acceptance additions
[^evidence]: Frozen source, exact artifact, commands and unchanged benchmark evidence
