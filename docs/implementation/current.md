---
type: Plan
title: Natural-JS 2.0 active plan
description: Current checkpoint, remaining gates and next owner for the Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: row-state
    resource: m5-state-plan.md
    title: Incoming row state and wire continuation
    git_blob: 8f7c23394e3e1aaaf80d54bf6bd2909115a5a23b
  - id: shared-rules
    resource: m5-shared-rules-plan.md
    title: Shared field declarations and automatic validation
    git_blob: d4f4478ff075fb46589ef272da8072530b12839b
  - id: evidence
    resource: evidence/m52-verification.json
    title: Latest frozen runtime and artifact receipt
    git_blob: bb7428451aed61b309e05b26dd962d2a084cb07e
  - id: parity
    resource: feature-parity-plan.md
    title: Required complete feature coverage and one omission review
    git_blob: e27c90edaec8f4ae0986444bd46c5163990d43c3
  - id: review
    resource: m13-review-plan.md
    title: Mandatory whole-code review and remediation
    git_blob: ad25e5adb1ecbbbfad99bfd3e8dd6f53a363c883
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF document and verification rules
    git_blob: 17cfe650daacff3935aa93a383868574afe95628
generated: { by: codex/gpt-6, at: 2026-10-31T05:07:04Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-31T05:07:04Z }
---

Use this file to resume. [The milestone index](index.md), [roadmap](roadmap.md), [completed log](../log.md) and individual stage plans retain completed work and historical verification. Do not recertify that history when refreshing source fingerprints.

# Goal

Complete all 1.x framework capabilities in TypeScript/ESM without jQuery, preserving CVC, authored HTML/CSS, nested raw binding, document-unique IDs and accessible interaction. Keep contracts, code and agent context small. Only explicitly approved omissions may reduce supported behavior.[^parity]

# Checkpoint

- Work and authorized pushes stay on 2.0.0-alpha.0. M5.2 started at pushed 73f5a8809356a1a3d26bff12732669a18cbdfb20.[^row-state]
- M5.2 adds explicit RowState/replaceState/appendState, received value/status checkpoints and retained deletion anchors through the existing data owner. The [Rows API](../v2/data.md), [migration recipes](../v2/migration.md) and Grid explorer cover application-owned metadata and wire projection. M5.1 shared rules remain in their owning plan.[^row-state][^shared-rules]
- All sixteen latest runtime gates pass on the same 180 inputs: build/source/example types, 136 units, 586 full cases each in Chromium/Firefox/WebKit, exact JS/TS and five-browser consumers, and original nine binding/twenty-one viewport budgets. One 183-file tar has SHA-256 489521f17da4f0837dd44e3fd83b2cac5461764d019ec751920c50b0cc576728.[^evidence]
- Runtime attempts stay in evidence/m52-gates.jsonl; separate development observations retain raw files and disclose uncaptured chat-only outputs. Independent source/document/raw-log/archive/measurement review approves the selected slice. Changed/full OKF checks pass with 69 concepts, five reserved files and zero errors/warnings. Preserve historical evidence.[^evidence][^conventions]
- Earlier milestones are complete only within their dated selected scopes. Full legacy parity remains open: 60 families and 775 mapped entries still need their semantic/dynamic closure. Selected Grid acceptance does not close all twenty Grid families.[^parity]

# Next action

Plan Form row-local typed Select binding through the existing native field, row-option and Select owners. Preserve numeric/string/boolean/null choice identity and nested option lists, replacing the detail example's manual shift-option rendering only after reviewing the bounded contract. Form raw rendering and wider bind-value callbacks retain their own follow-up scope. Keep general data-value/schema equivalence, List editing, Tree validation, remaining defaults/hooks/UI/CVC/P0 and final M13 required.[^row-state][^review]

# Decisions

- CVC owns one controller and cancellation/cleanup lifetime per page. Reuse its runtime in main content, Popup, Tabs and Documents.
- Data-field paths and store-local RowId values identify data. DOM IDs connect labels/ARIA only. Bind components to existing HTML; generate no visual design.
- Share actual rule/control/cleanup behavior at existing owners. Use direct functions, ordinary objects and explicit application callbacks; add no convenience utility package or generic registration engine.
- Retain framework-reachable formatter/validator/mask/date/byte behavior. Remove helpers only after direct, indirect, configuration and declaration reachability checks. No new omission is approved.
- M5.2 does not close Form raw choice/render mapping, List editing, Tree validation, bind-value/global callback/default lifecycles, legacy unvalidated paste, general data-value/schema equivalence, remaining UI/CVC parity or P0. Each retains its owning work.[^shared-rules][^parity]
- Root 2.0 is Apache-2.0. Preserve master and the LGPL v1 baseline b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6. Leave the original ignored js/natural_js/@types/package-lock.json unchanged.
- Test Chromium, Firefox and WebKit. Firefox uses node_modules/.cache/playwright-m6 when needed; installed Chrome/Edge use the identical tar. Actual macOS/iOS Safari is excluded.
- npm publication and release tags remain deferred until the user finishes personal testing and separately requests them.

# Verification log

The [M5.2 plan](m5-state-plan.md) owns 28 command records, nine new unit/twelve browser cases, selected installed witnesses and sixty raw performance medians. Seven semantic concepts receive independently reviewed verified metadata; 24 historical concepts retain bodies and generated/verified dates with fingerprint-only updates. M5.1 retains its separate 179-input/574-case receipt; older checks stay in the log and owning plans.[^evidence]

# Open questions

Manual assistive technology, personal acceptance, actual token telemetry and equivalent final agent-task comparison remain unverified. Finish complete feature/dynamic coverage and the one consolidated omission proposal, then the mandatory [M13 whole-code review/remediation](m13-review-plan.md).[^parity][^review]

[^shared-rules]: Shared field declarations and automatic validation
[^row-state]: Incoming row state and wire continuation
[^evidence]: Latest frozen runtime and artifact receipt
[^parity]: Required complete feature coverage and one omission review
[^review]: Mandatory whole-code review and remediation
[^conventions]: OKF document and verification rules
