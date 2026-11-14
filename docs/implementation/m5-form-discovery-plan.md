---
type: Plan
title: Natural-JS 2.0 M5.8 Form field rediscovery
description: Explicitly reconcile authored Form fields while preserving retained input, data and resource ownership.
tags: [meta, plan, form, binding, migration]
status: draft
sources:
  - id: previous
    resource: m5-form-defaults-plan.md
    title: Completed captured defaults and reusable unbinding scope
    git_blob: c7eb53dfb1548d15b931c11b45644bb8e7219049
  - id: baseline
    resource: evidence/m57-verification.json
    title: Frozen ebf700c source, runtime and installed package baseline
    git_blob: 8e2ca5daf55a234b0e03b80eb28e447e9aeddc90
  - id: form
    resource: ../../src/ui/form.ts
    title: Compiled fields, captures, drafts, errors and Form lifetime
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public Form handle and rule contracts
    git_blob: 0d3a883198da64468b0a6f967fb49c5423ffbdc4
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Native values, groups and constraints
    git_blob: ba5da2de312e41492ce6ead4df8300d13004dd76
  - id: choices
    resource: ../../src/ui/select-owner.ts
    title: Exclusive Select ownership and release
    git_blob: 6902e2789df6e44123b2ea599e4d05fa1c098fa4
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Captured rule catalogs and compiled field declarations
    git_blob: a143951476286c0b66584ae57ea47932280d2ba2
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Legacy cache-controlled lookup, creation capture and current-node unbinding
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: parity
    resource: feature-parity-plan.md
    title: Complete retained feature obligations and consolidated omission review
    git_blob: 4dc432ebdc8eea1846745520efede712523494cf
generated: { by: codex/gpt-6, at: 2026-11-07T11:49:17Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-07T11:49:17Z }
---

# Goal

Add one explicit structural reconciliation operation to the existing Form owner. Preserve fast compiled binding, authored HTML/CSS, nested paths, document-unique generated error IDs and caller-owned Rows. Preserve valid retained input and reject structural changes that would silently discard invalid drafts. Add no observer, registry, general execution engine or runtime dependency.[^form][^native][^choices]

# Checkpoint

- M5.8 starts at pushed ebf700c98c3351f052adb4316a996cc5571143f4 with a clean worktree; independent read-only M5.7 recovery and the bounded pre-source contract review pass.[^baseline]
- Explicit rescan is implemented through the same local compiler as construction. Compatible fields/captures remain, affected drafts/known local issues block retirement, and new bindings adopt one current native capture. No new public type, option, module, entry or dependency. The [Form concept](../v2/form.md#field-rediscovery) owns the implemented API.[^form][^ui]
- Connected source/caller/test review, fresh canonical gates and independent raw/document reviews accept only these selected outcomes. Direct hot declarations, wider dynamic owners and complete parity remain required.[^parity]

# Steps

1. Independently review this bounded contract against legacy behavior and connected current owners before source edits. Add only FormHandle.rescan(): void. Keep existing bind/refresh/read/defaults/validate behavior on compiled fields; do not add automatic discovery to hot paths.
2. Rescan compiles the current authored graph and reconciles ownership only. It invokes no whole/value callback, formatter, parser, renderer or validator; it does not repaint data values, validate/commit input, select another RowId, write Rows or resume automatic binding. Application Rows mutations may still detach a removed/replaced current row through existing bookkeeping. Call existing refresh(fields?) or full refresh explicitly after discovery when value projection is wanted.
3. Preflight the complete candidate graph, including safe paths, group/native rules, effective HTML declarations, display ownership, error regions and Select conflicts, before changing existing ownership, UI or retained state. Ordinary structural/configuration failure leaves the previous compiled owner usable. Application DOM mutations that preceded the call are not rolled back.
4. Reuse the exact Field and capture for compatible bindings: same path, native/control shape, ordered member elements and compiled binding declarations. Preserve their current and other-row drafts, issues, local raw/projection, focus and creation values. Reordering independent fields follows authored order without resetting them. Moving an unchanged control between valid native form owners updates reset listeners without recapturing formatted display. Replacing an error region updates its association without retiring the control or its draft.
5. Reject retirement, replacement or group reshaping when an affected field has any retained row draft, including a valid candidate not yet committed after supersession, or existing local issues/invalid raw cache. Protect local static/formatted/rendered fields as well as controls. Do not run validation to classify a retained draft or evaluate new local rules. Report FORM_RESCAN with the field and available row identity. Never transfer input by a coincidentally equal path or silently discard it. The application must explicitly resolve or discard that input first.
6. Capture each newly adopted binding's live native/UI restoration state once, before any Form write. Retained bindings keep their old capture. A clean reshaped group is one new logical binding: capture the complete current native group's checkedness, not a mixture of old creation checks and new members. Successful retirement removes that binding from read/defaults and releases its private raw/projection/capture/File resources. Defaults/unbind describe the active adopted bindings; the new explicit structural boundary does not change capture behavior for callers that never rescan.
7. Retire removed/replaced bindings through existing owners: release Select claims and restore their authored options, restore owned error/ARIA/changed metadata and display content, remove obsolete reset listeners, and prune field-keyed maps. Preserve caller-owned Rows values/status/originals/changes and subscriptions. When group members or error nodes survive, use their original pre-framework attributes rather than capturing generated ARIA as authored input. Error-region reassociation publishes already-known issues and accessible state to the new region without running validation or repainting data values.
8. Keep function catalogs and constructor options fixed. Reject changes to binding annotations or native shape on a still-owned node with FORM_RESCAN; never capture Form-generated text/options/nodes as fresh authored defaults. Prefer detach the element/subtree, rescan to release, edit while detached, reattach and rescan to adopt. Marker-only release must remove the complete binding annotation set, including row-choice markers when present; leaving data-options without data-field retains the existing FORM_OPTIONS rejection. Newly adopted HTML rules use the existing captured catalogs. Preserve constructor rejection of unknown renderer targets; a known renderer may remain configured while its target is temporarily absent. Mutable catalogs and direct hot-declaration equivalence remain required separately; no omission is approved.
9. Bound structural reentry during active callbacks, validation, projection, defaults, restoration and reconciliation with one private work-depth guard around the existing callback-executing cores. Ordinary nested binds keep their current rules. During rescan, block other public work and suppress synthetic input and subscription projection/hooks; retain structural Rows bookkeeping, draft pruning and missing-current-row detachment. Disposal remains available. Reject rescan while Form-observed native reset dispatch/cleanup is pending; do not flush it or invoke formatters from rescan. Let existing cleanup complete, or explicitly flush through the existing read/refresh operation before mutating the Form graph. Keep one defaults getter and its recursion guard with a stable active-descriptor array. Register newly acquired release functions with disposal before retirement writes; check disposal/generation around native writes and release temporary resources on interruption. Do not add exceptions to existing local FORM_RENDER/renderer guards. No-op rediscovery must not repaint or clear retained input/errors. Structural/claim preflight failure preserves the old owner. Keep specific existing preflight error codes; use FORM_RESCAN for the new policy/busy failures and wrap unexpected commit native/custom-element errors with cause. Commit is not a whole-DOM transaction: keep retained drafts and an owner that can retry or dispose, without automatically disposing it or claiming rollback of application side effects.
10. Add a real authored-HTML use case and exact-package JS/TS/browser callers. Cover insertion/removal/replacement/reordering, nested fields, groups, capture/unbind, native files, error/reset ownership, pending drafts across rows, inactive/resume, failed preflight, Select conflict cleanup, repeated use and disposal. Document unsupported direct declaration mutation beside the supported release/re-adoption workflow.
11. Independently review connected source/callers/tests/documents. Freeze execution inputs before final gates. Run strict build/source/example types, units, full Chromium/Firefox/WebKit, the same actual tar in isolated JS/TS and all five Windows browsers, unchanged nine binding/twenty-one viewport budgets and changed/full OKF checks. Preserve every attempt, exact source/log/archive hashes, complete test identities and original protected fixtures.

# Next action

Selected rescan outcomes are accepted. Plan M5.9 Form local/shared/global default and callback composition against retained callers. Keep direct hot-declaration and wider List/Grid rediscovery, per-unbound-key observation, List editing, Tree validation, unvalidated paste, general data/schema equivalence, other UI/CVC/P0 and M13 required. No omission or full-family closure is approved.

# Decisions

- Continued-work approval covers this selected legacy rediscovery outcome. Re-review material public-contract changes before implementation.
- One existing Form owns the reconciled graph. Prefer direct functions, existing rule/control/choice/error owners and private field-local metadata.
- No DOM observer, cache option, automatic per-bind query, new public named type, entry point or runtime dependency.
- Preserve v1/master, immutable earlier evidence, original performance fixtures/budgets and the ignored legacy lock. Root 2.0 remains Apache-2.0; commits/pushes stay on 2.0.0-alpha.0.
- Serialize source browser/performance runs. All available Windows engines remain required; actual macOS/iOS Safari is excluded. No publication or release tag.
- Do not run model-response evaluations or claim actual token savings. Label any measured source/context size as a proxy.

# Verification log

Independent baseline/contract/source/caller/raw/document reviews pass. Fresh checks pass on 187 frozen inputs, 138 units and 750 full cases per engine, with 36 new browser cases and 0 new non-DOM units: strict build/source/example types, one actual 188-file tar in JS/TS and five Windows browsers, original 30 performance budgets and sixty recomputed medians. Sixteen canonical groups expand to 27 execution-stage commands and 13 Chromium collections. The complete 12-shard Chromium union has no retries/skips; Firefox/WebKit are unsharded. [The receipt](evidence/m58-verification.json) preserves every attempt, initial WebKit CVC focus-fixture failures, captured RED/GREEN safety regressions, exact raw hashes and immutable parents. Changed/full OKF checks have zero errors/warnings; historical bodies/dates remain. No full-family/P0/M13 closure, omission, publication or tag.

# Open questions

Direct hot-declaration equivalence, shared/global composition and full owner families remain required. Manual assistive technology, personal acceptance, final fixed-agent/token comparison and M13 remain unverified.
