---
type: Plan
title: Natural-JS 2.0 M5.7 Form captured defaults and unbind
description: Return captured native creation values and restore the authored Form view without changing shared Rows data.
tags: [meta, plan, form, binding, migration]
status: draft
sources:
  - id: previous
    resource: m5-form-binding-plan.md
    title: Completed whole-row observers and same-ID refresh scope
    git_blob: a5bc59fc0289ace63d7110c9a04f8bb2469dbe7c
  - id: baseline
    resource: evidence/m56-verification.json
    title: Frozen c4aacd0 runtime and installed package receipt
    git_blob: 2b70217e449fe80108e4eddc8a9c7f5caf4744a8
  - id: form
    resource: ../../src/ui/form.ts
    title: Existing compiled fields, local raw cache, drafts and lifecycle
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public Form and native creation contracts
    git_blob: 0d3a883198da64468b0a6f967fb49c5423ffbdc4
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Existing native creation snapshot and default parser owner
    git_blob: 09ffaa47fbc1245bf8dec049a251a84ea41cfa21
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Shared native field values and groups
    git_blob: ba5da2de312e41492ce6ead4df8300d13004dd76
  - id: choices
    resource: ../../src/ui/row-options.ts
    title: Existing authored and generated Select ownership
    git_blob: 4d7359d7fdafb0fda5fafb0ee81372b26722538a
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Live InitialData capture, unbind and fresh-entry intent
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: presets
    resource: ../../v1/docs/examples/template/search-grid-detail-vertical.md
    title: Live presets established before legacy Form construction
    git_blob: 93c5f056572eeb013add7d07a4959c4fb7f364ae
  - id: input-spec
    resource: https://html.spec.whatwg.org/multipage/input.html#dom-input-files-dev
    title: Native selected-file setter and filename restrictions
  - id: transfer-spec
    resource: https://html.spec.whatwg.org/multipage/dnd.html#the-datatransfer-interface
    title: Native DataTransfer file-list construction
generated: { by: codex/gpt-6, at: 2026-11-07T10:13:26Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-07T10:13:26Z }
---

# Goal

Complete captured live Form defaults and explicit unbinding at the existing compiled owner. Keep a UI restoration snapshot separate from the detached native creation record it can produce. Reuse native values, paths, choices, render generations and error ownership; add no business dataset, registry or runtime dependency.[^form][^native][^choices]

# Checkpoint

Start at pushed c4aacd00cf5631524a3015397f0a9fe22ca9493d on 2.0.0-alpha.0 with a clean worktree. Independent recovery matches 184 frozen inputs, 121 exact evidence files, 43 records/four maps, six immutable parents and all 183 actual package payloads. Preserve the dated 138-unit/683-case-per-engine acceptance, intermediate failures and scoped review hashes; do not rerun or recertify historical runtime.[^baseline]

Legacy InitialData reads live descendant values before binding; add reads only native inputs. Unbind restores the captured view, removes field handlers/errors and leaves the old dataset/index. Live presets, native default properties and received Rows originals are different checkpoints. Keep supported fresh-entry and reusable-detail outcomes while fixing stale association, group/array, image absence and flattened-child defects.[^legacy][^presets]

# Steps

1. Independently review the selected contract against actual legacy callers and existing Form/Grid/native owners before runtime edits. Public additions are only FormHandle.defaults(): Record<string, unknown> and FormHandle.unbind(): void; no option or public named type is added.
2. Capture live native values and UI restoration metadata once, after field/rule/ownership preflight and before any local formatter/renderer runs. Include compiled root fields, nested paths, readonly/disabled controls and stable radio/checkbox/Select shapes. Do not recapture after bind, refresh, native reset or Rows reversion. Leave native defaultValue/defaultChecked/defaultSelected and application disabled/readOnly state unchanged.
3. defaults() returns a detached native-only creation record from that capture. Exclude static/image fields, unbound business keys, row-local option-source lists and internal File objects. Marked Selects use captured authored raw mappings; native file capture contributes the first filename. Apply applicable own parsers to one complete unparsed native record with rowId null and the authored element. Reject undefined/async/uncloneable results, thrown parsers, duplicate/conflicting paths and recursive getter entry with FORM_DEFAULTS; drain rejected promises and release guards for retry. Do not write DOM/Rows, validate, change drafts/errors, resume automatic binding or flush queued native reset work. The application factory supplies complete T and received status.
4. Share only the actual native record/parser assembly loop with Grid.defaults if Form would duplicate it. Preserve Grid capture eligibility, parser order/eligibility, error codes, contexts and active checks. Explicitly correct its child-before-parent silent overwrite: both owners reject native parent/child path conflicts in either order before parsing, with FORM_DEFAULTS or GRID_DEFAULTS. Grid Select entries do not acquire text-field parsers through this extraction. Add a recoverable per-owner GRID_DEFAULTS recursion guard through the same narrow private owner. Do not merge Form and Grid lifecycle/capture ownership or expose the helper publicly.
5. unbind() first preflights native file reconstruction, then invalidates the existing render generation, cancels completed/pending reset cleanup and clears pointer/projection/visible-error state. Drop the current Rows association and its invalid draft; preserve other rows' drafts, every Rows snapshot/status/original/change and subscriptions. Rows-backed data-field-changed becomes false like bind(null); local markers remain application-owned. Keep root, Select and accessible error ownership until dispose. Do not clear active callback/renderer call-stack guards; their finally blocks must retain recursion protection. No whole/value hook, parser, formatter, renderer or Rows notification runs from restoration itself.
6. Restore native input values and captured checkedness. Restore Select selection by captured option identity/occurrence rather than a Set of values. For marked choices, reuse existing authored nodes/options/raw mappings and reset generated-source state. Unmarked option structure stays application-owned: clear current selection and restore captured selected options that still belong to the Select. Dynamic markup/configuration reconciliation remains separate required work.
7. Restore exact authored static/custom-rendered child nodes and exact image src attribute presence/value, including absent/empty/relative src; leave alt unchanged. Use this extra snapshot for unbind only. Preserve existing normal disposal behavior, including local latest-raw restoration and Rows custom-render child cleanup. Release restoration metadata and retained File references on dispose.
8. Preserve an initially selected local file by retaining its actual File references privately and constructing a native FileList through DataTransfer before restoration writes. Assign the files property, never a nonempty filename. Empty captured selections clear through the native control. Keep uploads in application File/FormData code; Rows-backed and multiple file restrictions remain unchanged. Wrap platform reconstruction failure as FORM_UNBIND with field/cause before any reset/association/DOM change. Verify this in all required engines.[^input-spec][^transfer-spec]
9. After local unbind, automatic input/change, focus formatting, pointer tracking and framework reset cleanup remain inactive. One private flag is enough; Rows also has its existing null boundId. Full local bind(null) or full refresh explicitly resumes automatic binding; selected refresh stays display-only and does not resume it. Explicit local read/validate remain usable; Rows read keeps its existing unbound semantics. A later bind(id) reuses the owner and retained unrelated drafts. bind(null) remains clear/refresh rather than captured restoration.
10. Allow unbind from user callbacks to supersede older work without running an obsolete after hook, formatter result or sibling candidate commit. Establish the private restoration guard and capture the entry generation before native file preflight; stop if preflight disposed or superseded this owner. After successful preflight, advance the generation and guard each restoration write and subsequent cleanup against disposal/newer binding. Native property writes or authored custom-node reactions can reenter application code: reject recursive same-owner unbind with FORM_UNBIND and release its private call-stack guard in finally. A newer full bind/refresh can supersede restoration outside a still-active same-owner local display frame. Preserve the existing FORM_RENDER bound for local renderer → unbind → nested local resume; add no recursive-render exception or new execution engine. Canceled local binding tails must not clear errors from newer work. If called inside an uncanceled native reset dispatch, the browser's subsequent default action still wins; do not claim a synthetic transaction over native dispatch or application side effects.
11. Add focused browser witnesses for live/native/received checkpoints, detached parsing and failures, groups/duplicate options, native files and preflight failure, exact nodes/images/ARIA/config preservation, current versus unrelated drafts, inactive/resumed handlers, reset timing/cancellation, callback supersession and disposal/reuse. Exercise existing Grid defaults compatibility and recursion. Add a real CVC search restore action and exact-package JS/TS/browser consumers.
12. Independently review connected production/caller/test/document code. Run strict source/build/example types, units, full Chromium/Firefox/WebKit, one exact tar in isolated JS/TS and five Windows browsers, unchanged binding/viewport budgets and changed/full OKF checks. Preserve every attempt and verify full Chromium disjoint identities, retries/skips and input/log/archive hashes.

# Next action

Selected captured-default/unbind outcomes are independently accepted. Plan M5.8 dynamic Form field rediscovery against legacy cache:false and real callers. Keep shared/global defaults/hooks, per-unbound-key value observation, List editing, Tree validation, unvalidated paste, general data/schema equivalence, other UI/CVC/P0 and M13 required. No omission or full-family closure is approved.

# Decisions

- Continued-work approval covers this bounded stage. Re-review public semantics before implementing a material change.
- Restoration ends automatic binding while retaining the reusable owner. Dropping the old Rows association prevents restored defaults from overwriting another record; access full source through the caller-held RowId and Rows.
- Native reset, captured restoration, creation defaults and received reversion remain explicit operations with separate owners.
- One private native record/parser builder may have two real callers; no generic reset/lifecycle engine or utility package is justified.
- Preserve v1/master, original fixtures, ignored legacy lock and historical evidence. Root 2.0 remains Apache-2.0; commits/pushes stay on 2.0.0-alpha.0.
- All available Windows browsers remain required; actual macOS/iOS Safari is excluded. Publication and tags wait for personal acceptance and a separate request.
- Keep original performance fixtures/budgets and serialize source browser/performance execution. Retain failed attempts without granting final coverage or inventing a cause.
- Use twelve disjoint fresh Chromium execution processes and verify their exact complete union. Shorter process runs are an orchestration choice after the prior unconfirmed module-load failure, not a claim to have fixed its cause; source tests/configuration, retry policy and acceptance remain unchanged.
- No model-response generation/evaluation or actual token-saving measurement is authorized or claimed.

# Verification log

Read-only baseline and legacy/current-owner audits pass. Fresh checks pass on 186 frozen inputs, 138 units and 714 full cases per engine: 31 new browser cases, 0 new non-DOM units, strict build/source/example types, one actual 188-file package in isolated JS/TS and all five Windows browsers, original 30 performance budgets and sixty recomputed medians. Sixteen canonical groups expand to 27 execution-stage commands and 13 Chromium collections. Chromium is the complete once-only 12-shard union; Firefox/WebKit are unsharded. [The receipt](evidence/m57-verification.json) retains every captured attempt, exact source/log/archive hashes, immutable parents and selected scope. Independent connected source/document/raw-evidence reviews pass; changed/full OKF checks have zero errors/warnings. Historical runtime is not recertified; full families/P0/M13 stay open. No omission, publication or tag.

# Open questions

Native file-list reconstruction, inactive/resume behavior and unbind during reset/callback dispatch pass selected browser witnesses. Dynamic discovery, shared/global composition, complete parity, manual assistive technology, personal acceptance and M13 remain unverified.

[^previous]: Completed whole-row observers and same-ID refresh scope
[^baseline]: Frozen c4aacd0 runtime and installed package receipt
[^form]: Existing compiled fields, local raw cache, drafts and lifecycle
[^ui]: Public Form and native creation contracts
[^grid]: Existing native creation snapshot and default parser owner
[^native]: Shared native field values and groups
[^choices]: Existing authored and generated Select ownership
[^legacy]: Live InitialData capture, unbind and fresh-entry intent
[^presets]: Live presets established before legacy Form construction
[^input-spec]: Native selected-file setter and filename restrictions
[^transfer-spec]: Native DataTransfer file-list construction
