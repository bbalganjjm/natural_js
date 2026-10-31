---
type: Plan
title: Natural-JS 2.0 active plan
description: Current checkpoint, remaining gates and next owner for the Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: shared-rules
    resource: m5-shared-rules-plan.md
    title: Shared field declarations and automatic validation
    git_blob: f03890172d0c21b0630c56706255eaf2cbfc1b40
  - id: baseline
    resource: m10-pinned-plan.md
    title: Previous selected implementation and frozen baseline
    git_blob: e2511cf1ea2b85556a64cfbc275f03f79d3420d9
  - id: evidence
    resource: evidence/m51-verification.json
    title: Latest frozen runtime and artifact receipt
    git_blob: b6598f48a95787ff8c8842554d8d4386efa5ce2a
  - id: parity
    resource: feature-parity-plan.md
    title: Required complete feature coverage and one omission review
    git_blob: db7e1e1b8b5bf9ae04e4abafea96e3dc71d324be
  - id: review
    resource: m13-review-plan.md
    title: Mandatory whole-code review and remediation
    git_blob: 17a1cf3686f5f2b96dcbca9f615abd19cfd34912
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF document and verification rules
    git_blob: 17cfe650daacff3935aa93a383868574afe95628
generated: { by: codex/gpt-6, at: 2026-10-31T04:19:48Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-31T04:19:48Z }
---

Use this file to resume. [The milestone index](index.md), [roadmap](roadmap.md), [completed log](../log.md) and individual stage plans retain completed work and historical verification. Do not recertify that history when refreshing source fingerprints.

# Goal

Complete all 1.x framework capabilities in TypeScript/ESM without jQuery, preserving CVC, authored HTML/CSS, nested raw binding, document-unique IDs and accessible interaction. Keep contracts, code and agent context small. Only explicitly approved omissions may reduce supported behavior.[^parity]

# Checkpoint

- Work and authorized pushes stay on 2.0.0-alpha.0. This slice started at pushed baseline a0f837a4f6dfa1cbc6a2b8205fe86f0df7b60528.[^baseline]
- M5.1 implements RuleSet.fields through the existing rule runner and adds Form/Grid autoValidate. List/Tree use effective rules within their existing boundaries. The current [API guide](../v2/rules.md) defines the contract.[^shared-rules]
- All sixteen latest runtime gates pass on the same 179 inputs: build/source/example types, 127 units, 574 full cases each in Chromium/Firefox/WebKit, exact JS/TS and five-browser consumers, and original nine binding/twenty-one viewport budgets. One 183-file tar has SHA-256 57c14d906608ef425a4a30915fd9ba43f529896408662840993db8f9cf926769.[^evidence]
- Runtime attempts stay in evidence/m51-gates.jsonl. Independent source/document/raw-log/archive/measurement review approves the selected slice. Changed/full OKF checks pass with 68 concepts, five reserved files and zero errors/warnings. Preserve development failures and historical evidence.[^evidence][^conventions]
- Earlier milestones are complete only within their dated selected scopes. Full legacy parity remains open: 60 families and 775 mapped entries still need their semantic/dynamic closure. Selected Grid acceptance does not close all twenty Grid families.[^parity]

# Next action

Plan incoming status/wire contracts at data/communication owners: compare preserved loading/save behavior with createRows/replace/changes/revert and retained deletion ordering, then specify representative JS/TS before changing the API. Preserve all other owner obligations and the final M13 review.[^shared-rules][^review]

# Decisions

- CVC owns one controller and cancellation/cleanup lifetime per page. Reuse its runtime in main content, Popup, Tabs and Documents.
- Data-field paths and store-local RowId values identify data. DOM IDs connect labels/ARIA only. Bind components to existing HTML; generate no visual design.
- Share actual rule/control/cleanup behavior at existing owners. Use direct functions, ordinary objects and explicit application callbacks; add no convenience utility package or generic registration engine.
- Retain framework-reachable formatter/validator/mask/date/byte behavior. Remove helpers only after direct, indirect, configuration and declaration reachability checks. No new omission is approved.
- M5.1 does not close Form raw choice/render mapping, List editing, Tree validation, bind-value/global callback/default lifecycles, legacy unvalidated paste, remaining UI/CVC parity or P0. Each retains its owning work.[^shared-rules][^parity]
- Root 2.0 is Apache-2.0. Preserve master and the LGPL v1 baseline b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6. Leave the original ignored js/natural_js/@types/package-lock.json unchanged.
- Test Chromium, Firefox and WebKit. Firefox uses node_modules/.cache/playwright-m6 when needed; installed Chrome/Edge use the identical tar. Actual macOS/iOS Safari is excluded.
- npm publication and release tags remain deferred until the user finishes personal testing and separately requests them.

# Verification log

The [M5.1 plan](m5-shared-rules-plan.md) owns twenty-six command records, twenty-four selected cases and sixty raw performance medians. Twelve semantic concepts receive independently reviewed verified metadata; twenty-eight historical concepts retain bodies and generated/verified dates with fingerprint-only updates. The [previous baseline](m10-pinned-plan.md) retains separate 177-input/550-case evidence. Older checks stay in the log and owning plans.[^evidence]

# Open questions

Manual assistive technology, personal acceptance, actual token telemetry and equivalent final agent-task comparison remain unverified. Finish complete feature/dynamic coverage and the one consolidated omission proposal, then the mandatory [M13 whole-code review/remediation](m13-review-plan.md).[^parity][^review]

[^shared-rules]: Shared field declarations and automatic validation
[^baseline]: Previous selected implementation and frozen baseline
[^evidence]: Latest frozen runtime and artifact receipt
[^parity]: Required complete feature coverage and one omission review
[^review]: Mandatory whole-code review and remediation
[^conventions]: OKF document and verification rules
