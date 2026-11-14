---
type: Plan
title: Natural-JS 2.0 M5.6 Form binding lifecycle and selective refresh
description: Add synchronous whole-row Form hooks and refresh compiled fields without changing row identity or unselected input.
tags: [meta, plan, form, binding, migration]
status: draft
sources:
  - id: previous
    resource: m5-local-form-plan.md
    title: Completed local Form raw display and native reset scope
    git_blob: 05bb58c9a4d4503931f03a8f645b43f11a736213
  - id: baseline
    resource: evidence/m55-verification.json
    title: Frozen bbc767b runtime and package receipt
    git_blob: ca33e88a03dcf4a5794978b74c01e1d8248fc773
  - id: form
    resource: ../../src/ui/form.ts
    title: Existing Form render, draft, subscription and ownership paths
    git_blob: 47b163dad56b382ea494ac6ddbb258a587423dd1
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public Form and immutable row contracts
    git_blob: 0d3a883198da64468b0a6f967fb49c5423ffbdc4
  - id: data
    resource: ../../src/data/index.ts
    title: Immutable Rows snapshots, events and committed reversion
    git_blob: 38faf810b59fecebd9e0d0e7ee8a935b480bcecd
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Legacy whole-row callbacks, selective bind and live defaults
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: example
    resource: ../../examples/vite/m10/detail.ts
    title: Existing CVC detail Form caller
    git_blob: 913acc81719d1f39fbcdf128707dc59337c88cfa
generated: { by: codex/gpt-6, at: 2026-11-07T05:59:35Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-07T05:59:35Z }
---

# Goal

Add whole-row Form observation and explicit same-row field refresh at the existing Form owner. Keep data in Rows, compile authored fields once, reuse value projections and typed choices, and avoid a second binding engine. Do not change CVC, Grid, DOM IDs, native input ownership or rule responsibilities.[^form][^ui]

# Checkpoint

Start at pushed bbc767b7e6e5a94ae555c640182c69041fb4cbcf on 2.0.0-alpha.0 with a clean worktree. Independent recovery matches all 183 frozen inputs, 74 exact evidence files, six immutable parents and the actual 183-file package. Retain the historical 138-unit/658-case-per-engine result without rerunning or recertifying its dated scope.[^baseline][^previous]

Legacy whole-row before/after hooks surround full binding and ignore returns; field updates and selective binding suppress them. Legacy selective binding changes row identity before filtering columns, so untouched controls can write an old display into a new row. Preserve the capability through explicit same-row refresh rather than this data-loss defect. Constructor-captured live defaults, native defaults and Rows original values are distinct.[^legacy][^data]

# Steps

1. Independently review this contract against legacy callers and current render, draft, reset and choice owners before editing runtime code.
2. Add FormBindContext<T> with readonly root, immutable row: RowSnapshot<T> and event: RowsEvent | null. Add beforeBind?: (context: FormBindContext<T>) => unknown and onBind?: (context: FormBindContext<T>) => unknown to bindForm options. Add refresh(fields?: readonly string[]): void to FormHandle. Keep beforeBindValue/onBindValue and their nonnull context unchanged. No other public type, module, dependency or registry is needed.
3. Reject nonfunction whole-row options or their use without Rows before claiming root/Select ownership. Whole hooks are synchronous observers, never vetoes. Ignore ordinary return values including false; reject/drain thenables and report short FORM_BIND errors with API, hook, row and cause. A failing before hook must precede association, Form DOM and visible-issue changes. A failing after hook retains completed writes. Application side effects are not transactional.
4. Invoke beforeBind, existing full value rendering/draft restoration/error display, then onBind for an explicit nonnull bind(id), full refresh with a current row, and revert of that current live row. Explicit calls supply event null; revert supplies its original immutable event, even when changed:false. Revert has already committed source and draft invalidation; a callback failure cannot roll them back. An unchanged revert must not force unchanged value callbacks. Explicit bind/full refresh retain forced value cycles.
5. Exclude construction, local/unbound rendering, selected refresh, keyed Rows edits, input commits, validation, focus, append/move/unrelated rows and removal/replace of a vanished current row from whole hooks. Full unbound refresh reuses bind(null); selected unbound refresh repaints only selected compiled fields from the existing empty/local view without changing identity. The after hook means the synchronous pass finished; focused editable text may defer its value projection until blur.
6. Guard source identity, existing render generation and disposal around user callbacks and writes. A newer bind supersedes the older pass; its after hook must not run. Permit a completed different-row nested bind, reject active same-row/cyclic hook entry, and release guards after errors. A private field/RowId renderer marker must also reject same-pair selected recursion with UI_RENDER while permitting nonrecursive selected refresh from whole hooks. Drain async returns even when a nested callback superseded the attempt. Reuse renderVersion rather than introduce a general lifecycle engine.
7. Preflight the complete selected-field argument as an array of exact compiled field paths. Reject unknown/nonstring names before any selected work, deduplicate names and visit fields in DOM compilation order. Groups are atomic. An empty selection is a no-op after the disposal check; a completed pending local native reset may still finish through its existing owner. A selection never changes bound RowId, parses or commits inputs, validates, or clears retained drafts/issues. Selecting every field still suppresses whole hooks.
8. Repaint/force value projections only for selected fields, preserving focused editable text/caret through the existing deferral policy. Preserve readonly/group/Select behavior, custom renderers and raw row context. Prepare every selected typed option source before the first selected writer, so a later invalid source cannot partially refresh earlier selected fields. An invalid unselected source must not block another field or rebuild its choices. Reuse existing Rows/local loops with a field mask rather than duplicate their writers.
9. Exercise a real CVC detail caller, source/public types and identical-package consumers. Add bounded browser witnesses for order/context/returns/errors, preflight, revert, focus, stale/nested/disposed callbacks, fields/groups/typed choices, local/native reset and unselected drafts/errors. Run source/build/example types, units, full Chromium/Firefox/WebKit, the exact same tar in JS/TS and all five Windows browsers, unchanged binding/viewport budgets, independent connected-code/evidence/docs review and changed/full OKF checks.

# Next action

The selected whole-row/refresh outcomes are independently accepted. Next plan M5.7 live captured defaults/unbind with native-file and source ownership explicitly. Keep dynamic field rediscovery, shared/global hooks/defaults, unbound-key observation, List editing, Tree validation, remaining data/UI/CVC/P0 and M13 required. No omission or full-family closure follows from this slice.

# Decisions

- Continued-work approval covers this bounded stage; changes to public semantics require review before implementation.
- Only existing compiled field paths participate in refresh. Dynamic add/remove reconciliation is a separate required contract, not dispose/recreate equivalence.
- A before hook observes a detached immutable raw row including unbound keys. Normalize application source explicitly through Rows before binding; callback source changes invalidate or reenter the active pass under the same guards.
- Reuse compiled fields, render generation, projections, row-option preparation and native reset ownership. No new common abstraction has two actual callers here.
- Preserve v1/master, original fixtures, ignored legacy lock and all historical evidence. Root 2.0 remains Apache-2.0; authorized commits/pushes stay on 2.0.0-alpha.0.
- All possible Windows browsers remain required; actual macOS/iOS Safari is excluded. npm publication and tags remain deferred for personal testing and a separate request.
- Retain failed diagnostic attempts without granting coverage. Use six disjoint fresh Chromium processes from the start; verify their once-only complete union. Other engines run their full suites.
- No response-generation/model evaluation or actual token telemetry is authorized or claimed. Record source/context size only as a separate proxy if available.

# Verification log

Read-only baseline and legacy/current owner audits pass. Fresh checks pass on 184 frozen inputs, 138 units and 683 full cases per engine: 25 new browser cases, 0 new non-DOM units, strict build/source/example types, one actual 183-file package in isolated JS/TS and all five Windows browsers, original 30 performance budgets and sixty recomputed medians. Sixteen canonical groups expand to 21 execution-stage commands and 7 Chromium collections. Chromium is the complete once-only 6-shard union; Firefox/WebKit are unsharded. [The receipt](evidence/m56-verification.json) retains every captured attempt, exact source/log/archive hashes, immutable parents and selected scope. Independent connected source/document/raw-evidence review passes; changed/full OKF checks have zero errors/warnings. Full families and M13 remain open. Historical runtime is not recertified; no omission, publication or tag is approved.

# Open questions

Live defaults/unbind, dynamic discovery and shared/global composition remain required later work. Manual assistive technology, personal acceptance, actual token measurements, complete parity and M13 remain unverified.

[^previous]: Completed local Form raw display and native reset scope
[^baseline]: Frozen bbc767b runtime and package receipt
[^form]: Existing Form render, draft, subscription and ownership paths
[^ui]: Public Form and immutable row contracts
[^data]: Immutable Rows snapshots, events and committed reversion
[^legacy]: Legacy whole-row callbacks, selective bind and live defaults
[^example]: Existing CVC detail Form caller
