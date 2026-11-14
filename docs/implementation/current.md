---
type: Plan
title: Natural-JS 2.0 active plan
description: Current checkpoint, remaining gates and next owner for the Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: callbacks
    resource: m5-grid-callbacks-plan.md
    title: Captured Grid binding callbacks and remaining source contracts
    git_blob: 2e6446ca41a0b43426caa3ee773bfadd0282451c
  - id: evidence
    resource: evidence/m511-verification.json
    title: Latest frozen runtime and installed artifact receipt
    git_blob: 3e48d10b551bde9c9ab99b673557a428302fa3d2
  - id: parity
    resource: feature-parity-plan.md
    title: Complete required feature coverage and one omission review
    git_blob: 58251b7b726ac4a654a592b07447f02b76f86fe9
  - id: review
    resource: m13-review-plan.md
    title: Mandatory whole-code review and remediation
    git_blob: bb2184e6d3bd15c2ce34af5796a5b502df649192
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF document and verification rules
    git_blob: c39914313418de687419b88f43f8fce29333a053
generated: { by: codex/gpt-6, at: 2026-11-14T04:21:00Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T04:21:00Z }
---

Use this file to resume. The [milestone index](index.md), [roadmap](roadmap.md), [completed log](../log.md) and owning plans retain historical work; do not recertify it while refreshing fingerprints.

# Goal

Complete 1.x framework capabilities in TypeScript/ESM without jQuery, preserving CVC, authored HTML/CSS, nested raw binding, unique IDs and accessible interaction. Keep code, contracts and agent context small; remove supported outcomes only with explicit approval.[^parity]

# Checkpoint

- M5.11 starts at pushed db760efc6367fc592b5a6d6e1e0cdc240eb1b68b with a clean worktree. Independent M5.10 recovery and bounded pre-source contract reviews pass. Work and authorized pushes stay on 2.0.0-alpha.0.[^callbacks]
- Grid captures beforeRowBind/onRowBind/onBind once and invokes them plainly; before-hook attachment uses the same captured reference. No public API, module or dependency is added. Stable application forwarding functions retain deliberately live policy; other constructor options keep their own contracts.[^callbacks]
- Sixteen latest groups pass on 192 frozen inputs, 138 units and 801 full cases per engine. Chromium's 12 disjoint shards cover every identity once; Firefox/WebKit are unsharded. One actual 193-file tar passes JS/TS and all five Windows browsers plus the original nine binding/twenty-one viewport budgets. Tar SHA-256: 3b78039d0256759142366a690f7d51f507a2964689163f5f1feef32cf8ab0ae2.[^evidence]
- Independent connected source/caller, raw-log/archive/metric and final semantic reviews accept only selected outcomes. Changed/full OKF checks have zero errors/warnings; historical bodies and dates remain. Earlier milestones keep their dated scope.[^evidence][^conventions]

# Next action

Plan M5.12 for the remaining source-only and per-unbound-key Form outcomes: establish the exact bind/val observation boundary before choosing a minimal owner or application recipe. Keep legacy instance/initial-selection, broader configuration/declaration equivalence, wider dynamic owners, List editing, Tree validation, unvalidated paste, data/schema equivalence, other UI/CVC/P0 and M13 required. No omission or full-family closure is approved.[^callbacks][^review]

# Decisions

- One CVC controller/cancellation lifetime per page; reuse it in content, Popup, Tabs and Documents.
- Safe data-field paths and RowId identify data; document-unique IDs associate labels/ARIA. Bind existing HTML/CSS.
- Reuse actual rule/control/cleanup owners. Prefer direct functions and ordinary objects; expose only necessary application contracts.
- Retain reachable formatter/validator/mask/date/byte behavior. Remove helpers only after direct, indirect, configuration and declaration reachability checks.[^parity]
- Creation defaults, captured UI restoration, native reset and received Rows reversion have separate owners. Applications supply complete business rows and uploads.[^callbacks]
- Root 2.0 stays Apache-2.0. Preserve master/LGPL v1, immutable evidence, original fixtures and the ignored legacy lockfile.
- Chromium/Firefox/WebKit and installed Chrome/Edge remain required. Actual macOS/iOS Safari is excluded.
- npm publication and release tags wait for personal testing and a separate request.

# Verification log

The [M5.11 plan](m5-grid-callbacks-plan.md) and [receipt](evidence/m511-verification.json) own all attempts, eight new DOM witnesses, exact source/archive hashes, complete Chromium identities and sixty recomputed medians. The initial focused launch failures and an incomplete Chromium module-import attempt grant no full-suite credit. A later passing trace records HTTP 200 without establishing the original cause. All 60 mapped families/775 entries retain complete obligations; this file keeps resume context only.[^evidence][^parity]

# Open questions

The pre-body module-fetch failure's cause remains unverified and requires test-infrastructure follow-up. Manual assistive technology, personal acceptance, actual token telemetry and final fixed-agent comparison remain unverified. Finish feature/dynamic coverage and the consolidated omission proposal, then [M13 whole-code review/remediation](m13-review-plan.md).[^evidence][^parity][^review]

[^callbacks]: Captured Grid binding callbacks and remaining source contracts
[^evidence]: Latest frozen runtime and installed artifact receipt
[^parity]: Complete required feature coverage and one omission review
[^review]: Mandatory whole-code review and remediation
[^conventions]: OKF document and verification rules
