---
type: Plan
title: Natural-JS 2.0 active plan
description: Current checkpoint, remaining gates and next owner for the Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: values
    resource: m5-collection-values-plan.md
    title: Shared mounted field value callbacks and local ownership
    git_blob: 99e225a490c70fe9f94e26784b143751ed674d73
  - id: evidence
    resource: evidence/m510-verification.json
    title: Latest frozen runtime and installed artifact receipt
    git_blob: 772104504a5052c804e7f38ef8534f547c946ab0
  - id: parity
    resource: feature-parity-plan.md
    title: Complete required feature coverage and one omission review
    git_blob: b4e1f12791271f8a10702a533ab8c96871ea303a
  - id: review
    resource: m13-review-plan.md
    title: Mandatory whole-code review and remediation
    git_blob: da7a62d35f16b038d6eeeea0090754041102e1a9
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF document and verification rules
    git_blob: c39914313418de687419b88f43f8fce29333a053
generated: { by: codex/gpt-6, at: 2026-11-08T08:49:36Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-08T08:49:36Z }
---

Use this file to resume. The [milestone index](index.md), [roadmap](roadmap.md), [completed log](../log.md) and owning plans retain historical work; do not recertify it while refreshing fingerprints.

# Goal

Complete 1.x framework capabilities in TypeScript/ESM without jQuery, preserving CVC, authored HTML/CSS, nested raw binding, unique IDs and accessible interaction. Keep code, contracts and agent context small; remove supported outcomes only with explicit approval.[^parity]

# Checkpoint

- M5.10 starts at pushed 5ecda443abbe2f9c41a7a23b672507e4a82ed59b with a clean worktree. Work and authorized pushes stay on 2.0.0-alpha.0.[^evidence]
- Form, Grid and List share checked beforeBindValue/onBindValue execution through one private owner. ValueBindContext replaces the Form-only name without an alias; Grid/List gain the callback pair and List gains explicit visible refresh. [Shared value callbacks](../v2/value-callbacks.md) owns the contract.[^values]
- Binders retain raw validation, input drafts, native/typed choices, projection caches, focus and source/lifetime checkpoints. The authored Grid demo shares employee Rows and an explicit live policy across all three owners; no global registry, dataset, dependency or callback-layer engine.[^values]
- Sixteen final groups pass on 191 frozen inputs, 138 units and 793 full cases per engine. Chromium's 12 disjoint shards cover every identity once; Firefox/WebKit are unsharded. One actual 193-file tar passes JS/TS and all five Windows browsers plus original nine binding/twenty-one viewport budgets. Tar SHA-256: e6a84cd2db67da09cbc42ac789e239e175364c23be3b1c58197af7dcb4ffa6d2.[^evidence]
- Independent connected source/caller/document and raw-log/archive/metric reviews accept selected outcomes. Changed/full OKF checks have zero errors/warnings; historical bodies and dates remain. Earlier milestones retain their dated scope.[^evidence][^conventions]

# Next action

Plan M5.11 against the remaining Form source/default/declaration outcomes, including local-source callbacks, per-unbound-key observation and existing row/completion callback capture and receiver contracts. Keep broader configuration equivalence, direct hot declarations and wider dynamic owners, List editing, Tree validation, unvalidated paste, general data/schema equivalence, other UI/CVC/P0 and M13 required. No omission or full-family closure is approved.[^values][^review]

# Decisions

- One CVC controller/cancellation lifetime per page; reuse it in content, Popup, Tabs and Documents.
- Safe data-field paths and RowId identify data; document-unique IDs associate labels/ARIA. Bind existing HTML/CSS.
- Reuse actual rule/control/cleanup owners. Prefer direct functions and ordinary objects; expose only necessary application contracts.
- Retain reachable formatter/validator/mask/date/byte behavior. Remove helpers only after direct, indirect, configuration and declaration reachability checks.[^parity]
- Creation defaults, captured UI restoration, native reset and received Rows reversion have separate owners. Applications supply complete business rows and uploads.[^values]
- Root 2.0 stays Apache-2.0. Preserve master/LGPL v1, immutable evidence, original fixtures and the ignored legacy lockfile.
- Chromium/Firefox/WebKit and installed Chrome/Edge remain required. Actual macOS/iOS Safari is excluded.
- npm publication and release tags wait for personal testing and a separate request.

# Verification log

The [M5.10 plan](m5-collection-values-plan.md) and [receipt](evidence/m510-verification.json) own all attempts, 27 new DOM witnesses, exact source/archive hashes, complete Chromium identities and sixty recomputed medians. This file keeps resume context only. All 60 mapped families/775 entries retain complete obligations; selected acceptance does not recertify historical runtime.[^evidence][^parity]

# Open questions

Manual assistive technology, personal acceptance, actual token telemetry and final fixed-agent comparison remain unverified. Finish feature/dynamic coverage and the consolidated omission proposal, then [M13 whole-code review/remediation](m13-review-plan.md).[^parity][^review]

[^values]: Shared mounted field value callbacks and local ownership
[^evidence]: Latest frozen runtime and installed artifact receipt
[^parity]: Complete required feature coverage and one omission review
[^review]: Mandatory whole-code review and remediation
[^conventions]: OKF document and verification rules
