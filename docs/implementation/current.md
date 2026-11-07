---
type: Plan
title: Natural-JS 2.0 active plan
description: Current checkpoint, remaining gates and next owner for the Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: defaults
    resource: m5-form-defaults-plan.md
    title: Captured Form defaults and reusable unbinding continuation
    git_blob: 6fdb8c9151a8a5ccc4d7f176351280265ec1bc6c
  - id: evidence
    resource: evidence/m57-verification.json
    title: Latest frozen runtime and installed artifact receipt
    git_blob: 8e2ca5daf55a234b0e03b80eb28e447e9aeddc90
  - id: parity
    resource: feature-parity-plan.md
    title: Complete required feature coverage and one omission review
    git_blob: 23bd853dba1680a4fae0e3cafb1837a0b6a49d8c
  - id: review
    resource: m13-review-plan.md
    title: Mandatory whole-code review and remediation
    git_blob: f73336a31fb3bd6d4a975e9f753893d1212a69f1
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF document and verification rules
    git_blob: c39914313418de687419b88f43f8fce29333a053
generated: { by: codex/gpt-6, at: 2026-11-07T10:13:26Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-07T10:13:26Z }
---

Use this file to resume. The [milestone index](index.md), [roadmap](roadmap.md), [completed log](../log.md) and owning plans retain historical work; do not recertify it while refreshing fingerprints.

# Goal

Complete 1.x framework capabilities in TypeScript/ESM without jQuery, preserving CVC, authored HTML/CSS, nested raw binding, unique IDs and accessible interaction. Keep code, contracts and agent context small; remove supported outcomes only with explicit approval.[^parity]

# Checkpoint

- M5.7 starts at pushed c4aacd00cf5631524a3015397f0a9fe22ca9493d with a clean worktree. Work and authorized pushes stay on 2.0.0-alpha.0.[^evidence]
- M5.7 adds Form defaults() and unbind(): detached native creation values and exact captured UI restoration without Rows writes. Native file selection, current draft/error cleanup, inactive/resume and callback supersession use the existing owner. [Form](../v2/form.md) owns the contract.[^defaults]
- Form and Grid share only the native record/parser builder, preserving capture/parser eligibility and correcting both-order path conflicts and recursive getters. CVC search restoration uses Form operations. No new public type, option, entry or runtime dependency; one private module has two actual callers.[^defaults]
- Sixteen final gate groups pass on 186 frozen inputs, 138 units and 714 full cases per engine. Chromium's 12 disjoint shards cover every identity once; Firefox/WebKit are unsharded. Identical-package JS/TS plus all five Windows browsers and original nine binding/twenty-one viewport budgets pass. Tar SHA-256: 6e52d258629167e9b94376bb80023b374170f89859b39ef035e31a6b409da16a.[^evidence]
- Independent connected source/caller/document and raw-log/archive/metric reviews accept the selected slice. Changed/full OKF checks pass with zero errors/warnings; historical bodies and dates remain. Earlier milestones remain accepted only within their dated scope.[^evidence][^conventions]

# Next action

Plan M5.8 dynamic Form field rediscovery against legacy cache:false and real callers. Keep shared/global defaults/hooks, per-unbound-key value observation, List editing, Tree validation, unvalidated paste, general data/schema equivalence, other UI/CVC/P0 and M13 required. No omission or full-family closure is approved.[^defaults][^review]

# Decisions

- One CVC controller/cancellation lifetime per page; reuse it in content, Popup, Tabs and Documents.
- Safe data-field paths and RowId identify data; document-unique IDs associate labels/ARIA. Bind existing HTML/CSS.
- Reuse actual rule/control/cleanup owners. Prefer direct functions and ordinary objects; expose only necessary application contracts.
- Retain reachable formatter/validator/mask/date/byte behavior. Remove helpers only after direct, indirect, configuration and declaration reachability checks.[^parity]
- Creation defaults, captured UI restoration, native reset and received Rows reversion have separate owners. Applications supply complete business rows and uploads.[^defaults]
- Root 2.0 stays Apache-2.0. Preserve master/LGPL v1, immutable evidence, original fixtures and the ignored legacy lockfile.
- Chromium/Firefox/WebKit and installed Chrome/Edge remain required. Actual macOS/iOS Safari is excluded.
- npm publication and release tags wait for personal testing and a separate request.

# Verification log

The [M5.7 plan](m5-form-defaults-plan.md) and [receipt](evidence/m57-verification.json) own attempts, 31 new DOM witnesses, shard identities, installed payload proof and sixty recomputed performance medians. This file keeps resume context only. All 60 mapped families/775 entries retain complete obligations; selected acceptance does not recertify historical runtime.[^evidence][^parity]

# Open questions

Manual assistive technology, personal acceptance, actual token telemetry and final fixed-agent comparison remain unverified. Finish feature/dynamic coverage and the consolidated omission proposal, then [M13 whole-code review/remediation](m13-review-plan.md).[^parity][^review]

[^defaults]: Captured Form defaults and reusable unbinding continuation
[^evidence]: Latest frozen runtime and installed artifact receipt
[^parity]: Complete required feature coverage and one omission review
[^review]: Mandatory whole-code review and remediation
[^conventions]: OKF document and verification rules
