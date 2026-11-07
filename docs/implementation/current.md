---
type: Plan
title: Natural-JS 2.0 active plan
description: Current checkpoint, remaining gates and next owner for the Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: local-form
    resource: m5-local-form-plan.md
    title: Local Form raw display and native reset continuation
    git_blob: d8ae494b5fd60178d119c28feacc965a3bf4721a
  - id: evidence
    resource: evidence/m55-verification.json
    title: Latest frozen runtime and installed artifact receipt
    git_blob: ca33e88a03dcf4a5794978b74c01e1d8248fc773
  - id: parity
    resource: feature-parity-plan.md
    title: Complete required feature coverage and one omission review
    git_blob: 4075c72f0255afe98a55e435a327eb30346c12fd
  - id: review
    resource: m13-review-plan.md
    title: Mandatory whole-code review and remediation
    git_blob: 6977094589c0f29b22e8ba16320fd7eb249a5eb9
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF document and verification rules
    git_blob: c39914313418de687419b88f43f8fce29333a053
generated: { by: codex/gpt-6, at: 2026-11-07T04:45:12Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-07T04:45:12Z }
---

Use this file to resume. The [milestone index](index.md), [roadmap](roadmap.md), [completed log](../log.md) and owning plans retain historical work; do not recertify it while refreshing fingerprints.

# Goal

Complete 1.x framework capabilities in TypeScript/ESM without jQuery, preserving CVC, authored HTML/CSS, nested raw binding, unique IDs and accessible interaction. Keep code, contracts and agent context small; remove supported outcomes only with explicit approval.[^parity]

# Checkpoint

- M5.5 starts at pushed 7a621e7eeb92001ff7df7e277d06df0f79dcac44 with a clean worktree. Work and authorized pushes stay on 2.0.0-alpha.0.[^evidence]
- M5.5 extends the existing Form raw/display cache for local formatting and native-owner reset. It preserves unparsed raw, direct native writes, validation/focus, authored children and image src, and cancels stale or disposed work. Ownership preflight prevents formatting a container from deleting controls. No new public API, module or dependency. [Form](../v2/form.md#local-raw-input-and-native-reset) owns the contract.[^local-form]
- Source-backed legacy records still use Rows. The plan verifies full unbound raw values, received insert checkpoints and explicit default/revert recipes; native defaults differ from live legacy InitialData. Whole-row/global callback and complete owner equivalence remain open.[^local-form]
- Sixteen final gate groups pass on 183 frozen inputs, 138 units and 658 full cases per engine. Chromium's 6 disjoint shards cover every identity once; Firefox/WebKit are unsharded. Identical-package JS/TS plus all five Windows browsers and original nine binding/twenty-one viewport budgets pass. Tar SHA-256: 94a942395623a3f4200874416113167a77d2f1269c24f5e65167b1348ab310ce.[^evidence]
- Independent connected source/caller/document and raw-log/archive/metric reviews accept the selected slice. Changed/full OKF checks pass with zero errors/warnings; historical bodies and dates are preserved. Earlier milestones remain accepted only within their dated scope.[^evidence][^conventions]

# Next action

Plan required Form whole-row callbacks, live default/unbind behavior and selective/dynamic field binding against legacy callers. Keep shared/global defaults/hooks, unbound-key observation, List editing, Tree validation, unvalidated paste, general data/schema equivalence, other UI/CVC/P0 and M13 required. No new omission or full-family closure is approved.[^local-form][^review]

# Decisions

- One CVC controller/cancellation lifetime per page; reuse it in content, Popup, Tabs and Documents.
- Safe data-field paths and RowId identify data; document-unique IDs associate labels/ARIA. Bind existing HTML/CSS.
- Reuse actual rule/control/cleanup owners. Prefer direct functions and ordinary objects; expose only necessary application contracts.
- Retain reachable formatter/validator/mask/date/byte behavior. Remove helpers only after direct, indirect, configuration and declaration reachability checks.[^parity]
- DOM-local Form retains only display-related raw; received/business data stays in Rows. M5.4 callbacks and their nonnull context remain Rows-backed.[^local-form]
- Root 2.0 stays Apache-2.0. Preserve master/LGPL v1, immutable evidence, original fixtures and the ignored legacy lockfile.
- Chromium/Firefox/WebKit and installed Chrome/Edge remain required. Actual macOS/iOS Safari is excluded.
- npm publication and release tags wait for personal testing and a separate request.

# Verification log

The [M5.5 plan](m5-local-form-plan.md) and [receipt](evidence/m55-verification.json) own command attempts, 28 new DOM witnesses, shard identities, installed payload proof and sixty recomputed performance medians. The active document keeps resume context only. All 60 mapped families/775 entries retain their complete obligations; selected acceptance does not recertify historical runtime.[^evidence][^parity]

# Open questions

Manual assistive technology, personal acceptance, actual token telemetry and final fixed-agent comparison remain unverified. Finish feature/dynamic coverage and the consolidated omission proposal, then [M13 whole-code review/remediation](m13-review-plan.md).[^parity][^review]

[^local-form]: Local Form raw display and native reset continuation
[^evidence]: Latest frozen runtime and installed artifact receipt
[^parity]: Complete required feature coverage and one omission review
[^review]: Mandatory whole-code review and remediation
[^conventions]: OKF document and verification rules
