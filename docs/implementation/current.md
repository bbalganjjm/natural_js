---
type: Plan
title: Natural-JS 2.0 active plan
description: Current checkpoint, remaining gates and next owner for the Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: binding
    resource: m5-form-binding-plan.md
    title: Whole-row lifecycle and same-row field refresh continuation
    git_blob: c73ce0f3866b01ddeaa2e9b5b6cdd7fd2e0ca0b4
  - id: evidence
    resource: evidence/m56-verification.json
    title: Latest frozen runtime and installed artifact receipt
    git_blob: 2b70217e449fe80108e4eddc8a9c7f5caf4744a8
  - id: parity
    resource: feature-parity-plan.md
    title: Complete required feature coverage and one omission review
    git_blob: ed3427c2322fb85ccdc370f0abfeb23901c74abe
  - id: review
    resource: m13-review-plan.md
    title: Mandatory whole-code review and remediation
    git_blob: 0e6b2f6b7003a5131dfff5ea83cae240cc8bfb12
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF document and verification rules
    git_blob: c39914313418de687419b88f43f8fce29333a053
generated: { by: codex/gpt-6, at: 2026-11-07T05:59:35Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-07T05:59:35Z }
---

Use this file to resume. The [milestone index](index.md), [roadmap](roadmap.md), [completed log](../log.md) and owning plans retain historical work; do not recertify it while refreshing fingerprints.

# Goal

Complete 1.x framework capabilities in TypeScript/ESM without jQuery, preserving CVC, authored HTML/CSS, nested raw binding, unique IDs and accessible interaction. Keep code, contracts and agent context small; remove supported outcomes only with explicit approval.[^parity]

# Checkpoint

- M5.6 starts at pushed bbc767b7e6e5a94ae555c640182c69041fb4cbcf with a clean worktree. Work and authorized pushes stay on 2.0.0-alpha.0.[^evidence]
- M5.6 adds synchronous whole-row beforeBind/onBind and same-identity refresh(fields) through the existing Form owner. One FormBindContext<T> carries root, immutable full raw row and original revert event. Selected refresh preserves unselected input, drafts, errors and choices, preflights all selected sources and defers focused editable projection. No new module or dependency. [Form](../v2/form.md#whole-row-binding-and-refresh) owns the contract.[^binding]
- The shared CVC detail establishes its current-row/navigation state through onBind. Callback reentry, stale source/generation, disposal and async failures use the existing lifetime rules. Live captured defaults/unbind, dynamic discovery and shared/global composition remain required.[^binding]
- Sixteen final gate groups pass on 184 frozen inputs, 138 units and 683 full cases per engine. Chromium's 6 disjoint shards cover every identity once; Firefox/WebKit are unsharded. Identical-package JS/TS plus all five Windows browsers and original nine binding/twenty-one viewport budgets pass. Tar SHA-256: 7a871478a1b9acfe254969533482706819d5f55953086b13e22db1e243b27d8b.[^evidence]
- Independent connected source/caller/document and raw-log/archive/metric reviews accept the selected slice. Changed/full OKF checks pass with zero errors/warnings; historical bodies and dates are preserved. Earlier milestones remain accepted only within their dated scope.[^evidence][^conventions]

# Next action

Plan M5.7 Form live captured defaults/unbind against legacy callers, with explicit source/native-file ownership. Keep dynamic field rediscovery, shared/global defaults/hooks, List editing, Tree validation, unvalidated paste, general data/schema equivalence, other UI/CVC/P0 and M13 required. No new omission or full-family closure is approved.[^binding][^review]

# Decisions

- One CVC controller/cancellation lifetime per page; reuse it in content, Popup, Tabs and Documents.
- Safe data-field paths and RowId identify data; document-unique IDs associate labels/ARIA. Bind existing HTML/CSS.
- Reuse actual rule/control/cleanup owners. Prefer direct functions and ordinary objects; expose only necessary application contracts.
- Retain reachable formatter/validator/mask/date/byte behavior. Remove helpers only after direct, indirect, configuration and declaration reachability checks.[^parity]
- DOM-local Form retains only display-related raw; received/business data stays in Rows. Whole-row and value callbacks remain Rows-backed. Selective refresh never changes RowId or discovers new markup.[^binding]
- Root 2.0 stays Apache-2.0. Preserve master/LGPL v1, immutable evidence, original fixtures and the ignored legacy lockfile.
- Chromium/Firefox/WebKit and installed Chrome/Edge remain required. Actual macOS/iOS Safari is excluded.
- npm publication and release tags wait for personal testing and a separate request.

# Verification log

The [M5.6 plan](m5-form-binding-plan.md) and [receipt](evidence/m56-verification.json) own command attempts, 25 new DOM witnesses, shard identities, installed payload proof and sixty recomputed performance medians. The active document keeps resume context only. All 60 mapped families/775 entries retain their complete obligations; selected acceptance does not recertify historical runtime.[^evidence][^parity]

# Open questions

Manual assistive technology, personal acceptance, actual token telemetry and final fixed-agent comparison remain unverified. Finish feature/dynamic coverage and the consolidated omission proposal, then [M13 whole-code review/remediation](m13-review-plan.md).[^parity][^review]

[^binding]: Whole-row lifecycle and same-row field refresh continuation
[^evidence]: Latest frozen runtime and installed artifact receipt
[^parity]: Complete required feature coverage and one omission review
[^review]: Mandatory whole-code review and remediation
[^conventions]: OKF document and verification rules
