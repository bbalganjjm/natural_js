---
type: Plan
title: Natural-JS 2.0 M5.5 local Form raw display and reset
description: Apply local Form formatting without changing entered raw values and reconcile native reset through existing Form ownership.
tags: [meta, plan, form, binding, migration]
status: draft
sources:
  - id: previous
    resource: m5-form-values-plan.md
    title: Completed Rows-backed value callback scope
    git_blob: c5c677d852dd5e03e514692c5c1f39b8708515e1
  - id: baseline
    resource: evidence/m54-verification.json
    title: Frozen 7a621e7 runtime and package receipt
    git_blob: 7419e17370dc53ddd72ad3a4a630e27f6e0a2bfe
  - id: form
    resource: ../../src/ui/form.ts
    title: Existing local raw cache, candidates, rendering and ownership
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Shared native values, display and raw constraints
    git_blob: ba5da2de312e41492ce6ead4df8300d13004dd76
  - id: render
    resource: ../../src/ui/field-render.ts
    title: Explicit renderer ownership and recursion checks
    git_blob: 676d0e69a7cfc6eafab93b3abf5cd32c1a5a4a6c
  - id: ui
    resource: ../../src/ui/index.ts
    title: Existing public Form and rule contracts
    git_blob: 0d3a883198da64468b0a6f967fb49c5423ffbdc4
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Source-backed Form formatting, defaults and reset intent
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: search
    resource: ../../v1/docs/examples/retrieve-data-list.md
    title: Legacy search Form add and native input formatting
    git_blob: 1d25a275220dbac6084d5643c3eda65b2dda2c2d
  - id: data
    resource: ../../src/data/index.ts
    title: Existing received insert checkpoints and full raw row ownership
    git_blob: 38faf810b59fecebd9e0d0e7ee8a935b480bcecd
generated: { by: codex/gpt-6, at: 2026-11-07T04:45:12Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-07T04:45:12Z }
---

# Goal

Complete the existing DOM-local Form display contract by applying compiled formatters, retaining entered raw values and reconciling native reset. Reuse the current Form cache, compiled fields, rule/native/render owners and native form ownership. Add no public type, option, method, module, dependency, registry or second dataset.[^form][^native][^render][^ui]

# Checkpoint

Work starts at pushed 7a621e7eeb92001ff7df7e277d06df0f79dcac44 on 2.0.0-alpha.0 with a clean worktree. Independent read-only recovery matches 182 normalized inputs, 36 recorded gates, six immutable parents, all 183 actual package members and the historical three-engine 630-case receipt. Historical runtime is not rerun or recertified.[^baseline]

At the 7a621e7 baseline, local Form retained raw only for custom-rendered display fields; compiled formats were not applied locally, and focus/blur required Rows. Native reset had no framework listener. Legacy search Forms call add() and use the same source-backed formatter/focus owner as other Forms. Every v1 Form owns a dataset; these callers do not require a new DOM-only callback store.[^baseline][^legacy][^search]

# Steps

1. Expand the existing local display cache to fields with effective formatters or explicit renderers. Retain raw and the last Form-written display for formatted native text controls and image src values. Unformatted controls, groups, Select and file inputs remain DOM-owned; renderer/static raw remains separate from generated DOM. Detect changed native value properties on read even without an input event. An input event explicitly establishes entered raw, including a value equal to the previous projection.
2. Format local values initially, on relevant input, on blur and through the existing local bind(null) refresh. Preserve focused editable text/caret and invalid entered text; readonly text stays formatted. Use the existing pointer/focus policy. Local read() stays unparsed; parse results participate in validation only. RuleContext.rowId stays null. Keep Rows-backed callbacks and the nonnull FormValueContext unchanged.
3. Validate formatted text against a detached raw-filled native probe, including native custom validity and effective disabled state. Keep file/group/ordinary-control operations on their existing native path; never assign a file name to a clone. Continue using actual raw values in business and cross-field rules.
4. Register local reset listeners on distinct effective native form owners of currently valid fields (native control owner or static ancestor form), including an ancestor form outside the binding root and an authored form= owner. Preserve the existing radio owner/name validation; this slice does not relax it. Let native reset restore control defaults, choices and files. Check final defaultPrevented before framework changes. Reconcile after default action; flush completed pending reset events before public local read/validate and later input/focus work. An in-dispatch read still observes pre-reset raw. Coalesce completed events so another queued cleanup cannot adopt a projection as raw or erase later validation.
5. Refresh only affected formatted controls from reset DOM, retain renderer/static raw, clear only affected owned errors and refresh dependent display. Preserve other form owners' raw, focus and errors. Remove owner listeners and pending work on disposal. Native reset uses current native defaults; it does not reproduce every legacy live InitialData/unbind behavior. Rows forms use explicit application-owned Rows operations; do not add implicit row-wide data writes from native reset.
6. Reject local formatted static targets that are editable, are error regions or contain interactive/field/error content before claiming ownership. Reuse existing native ownership selectors; leave Rows behavior unchanged. Guard local generation/disposal and stale work around user formatters/renderers and before DOM writes. Bound recursive refresh must fail instead of looping. Reuse existing renderer ownership checks and rule failure reporting. Constructor failure restores already-written local control values, exact authored image src attributes and exact authored children and releases Select/root ownership. Local formatted controls and images unproject their latest raw value/src through the existing native writer before releasing the cache; other local display targets recover authored children. Preserve Rows disposal behavior.
7. Verify source-backed legacy recipes through existing Rows: received one-record bind, full raw record including unbound keys, explicit value changes and revert. Legacy add-plus-revert retains inserted defaults; use appendState/replaceState with status insert to establish that checkpoint. Ordinary Rows.add followed by revert removes the inserted row. Native defaults and legacy live captured defaults are different; document how applications establish each.
8. Add focused browser regressions, real CVC search usage and isolated installed consumers. Cover raw/display/parser/native constraints, programmatic writes, focus/caret/readonly, invalid input, groups/files/defaults, canceled/coalesced/ancestor/multiple-owner reset, synchronous read/validate precedence, constructor rollback, reentry and disposal/rebind. Independently review connected code and docs, then run strict source/build/example types, units, all Chromium/Firefox/WebKit cases, identical-package JS/TS and five Windows browsers, unchanged binding/viewport budgets and changed/full OKF checks.

# Next action

The selected local raw/display/reset outcomes are implemented and independently accepted. Next plan required Form whole-row callbacks, live default/unbind and selective/dynamic binding. Keep shared/global hooks, unbound-key observation, List editing, Tree validation, remaining data/UI/CVC/P0 and M13 obligations open.

# Decisions

- Prior continued-work authorization covers this stage; no full-family closure or omission follows from its selected outcomes.
- Received/business data stays in Rows. DOM-local formatting retains only the raw values needed by existing display behavior; it is not a second state manager.
- Effective native defaults govern reset. Capture application defaults explicitly for a legacy live-default checkpoint; do not claim the two are interchangeable.
- Preserve original fixtures, historical evidence and generated/verified dates when only fingerprints change. Add verified only after independent review.
- Root 2.0 stays Apache-2.0; preserve LGPL v1, master and the original ignored legacy lockfile. Authorized commits/pushes stay on 2.0.0-alpha.0.
- Chromium/Firefox/WebKit and installed Chrome/Edge remain required. Actual macOS/iOS Safari is excluded; npm publication and tags remain deferred.
- Fixed browser performance verification remains authorized. No response-generation/model evaluation or actual token-saving claim is added.

# Verification log

Read-only baseline and legacy/current owner audits pass. Fresh checks pass on 183 frozen inputs, 138 units and 658 full cases per engine: 28 new browser cases, 0 new non-DOM units, strict build/source/example types, one actual 183-file package in isolated JS/TS and all five Windows browsers, original 30 performance budgets and sixty recomputed medians. Sixteen canonical groups expand to 21 execution-stage commands and 7 Chromium collections. Chromium is the complete once-only 6-shard union; Firefox/WebKit are unsharded. [The receipt](evidence/m55-verification.json) retains every captured attempt, exact source/log/archive hashes, immutable parents and selected scope. Independent connected source/document/raw-evidence review passes; changed/full OKF checks have zero errors/warnings. Full families and M13 remain open. Historical runtime is not recertified; no omission, publication or tag is approved.

# Open questions

Native reset timing, canceled/coalesced events, native owners, callback reentry, controls/files/images and disposal pass the selected browser witnesses. Manual assistive technology, final agent-task/token measurements, personal acceptance and complete feature/M13 closure remain unverified.

[^previous]: Completed Rows-backed value callback scope
[^baseline]: Frozen 7a621e7 runtime and package receipt
[^form]: Existing local raw cache, candidates, rendering and ownership
[^native]: Shared native values, display and raw constraints
[^render]: Explicit renderer ownership and recursion checks
[^ui]: Existing public Form and rule contracts
[^legacy]: Source-backed Form formatting, defaults and reset intent
[^search]: Legacy search Form add and native input formatting
[^data]: Existing received insert checkpoints and full raw row ownership
