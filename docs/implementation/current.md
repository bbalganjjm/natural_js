---
type: Plan
title: Natural-JS 2.0 active plan
description: Current checkpoint, remaining gates and next owner for the Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: form-options
    resource: m5-form-options-plan.md
    title: Form row-local typed choice continuation
    git_blob: bc5f0428cb494eebff04e864632b330563a75c2f
  - id: evidence
    resource: evidence/m53-verification.json
    title: Latest frozen runtime and artifact receipt
    git_blob: d83d915c354e867c1e7135db46939be98eca2353
  - id: parity
    resource: feature-parity-plan.md
    title: Required complete feature coverage and one omission review
    git_blob: 7be0f7523a04d1541846b5ae36363541d71e51eb
  - id: review
    resource: m13-review-plan.md
    title: Mandatory whole-code review and remediation
    git_blob: 303b02e164829bde37e1ed2d9a125d65afae2f2d
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF document and verification rules
    git_blob: 17cfe650daacff3935aa93a383868574afe95628
generated: { by: codex/gpt-6, at: 2026-10-31T08:28:09Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-31T08:28:09Z }
---

Use this file to resume. [The milestone index](index.md), [roadmap](roadmap.md), [completed log](../log.md) and individual stage plans retain completed work and historical verification. Do not recertify that history when refreshing source fingerprints.

# Goal

Complete all 1.x framework capabilities in TypeScript/ESM without jQuery, preserving CVC, authored HTML/CSS, nested raw binding, document-unique IDs and accessible interaction. Keep contracts, code and agent context small. Only explicitly approved omissions may reduce supported behavior.[^parity]

# Checkpoint

- Work and authorized pushes stay on 2.0.0-alpha.0. M5.3 started at pushed 4660cd6d2590f9df2e2dfa55ef4a7542c181d9e8.[^form-options]
- M5.3 binds Rows-backed Form choices through existing nested option markers, raw option-node maps and shared Form/Grid/List occurrence helpers. It removes manual detail-screen option generation/conversion and adds no public API or dependency. The [Form API](../v2/form.md#row-local-typed-choices) owns the contract.[^form-options]
- All sixteen canonical check groups pass on 181 frozen inputs: build/source/example types, 138 units, 605 full cases each in Chromium/Firefox/WebKit, identical-package JS/TS and five-browser consumers, and original nine binding/twenty-one viewport budgets. Chromium uses three sequential built-in shards; their collection/execution identities prove complete once-only coverage, while Firefox/WebKit are unsharded. Eighteen final execution commands implement these sixteen groups. The 183-file tar SHA-256 is acebbba6bb10a70ab1a9195fc285d37d4a1ccc35b08213c37b267ae083f18335.[^evidence]
- Runtime attempts stay in evidence/m53-gates.jsonl; separate observations disclose two compiler attempts whose raw output was not captured. Independent connected source/document/raw-log/archive/measurement review approves the selected slice. Changed/full OKF checks pass with 70 concepts, five reserved files and zero errors/warnings. Preserve historical evidence.[^evidence][^conventions]
- Earlier milestones are complete only within their dated selected scopes. Full legacy parity remains open: 60 families and 775 mapped entries still need semantic/dynamic closure. Selected acceptance does not close all twenty Grid families.[^parity]

# Next action

Plan Form bind-value callbacks against existing candidate/render lifecycles. Compare legacy onBeforeBindValue/onBindValue return values in bind/val phases, preserving false as a replacement and undefined as no replacement; independently review the bounded contract before implementation. Keep Form raw rendering, List editing, Tree validation, remaining shared defaults/hooks, unvalidated paste, general data-value/schema equivalence, other UI/CVC/P0 and mandatory M13 required.[^form-options][^review]

# Decisions

- CVC owns one controller and cancellation/cleanup lifetime per page. Reuse its runtime in main content, Popup, Tabs and Documents.
- Data-field paths and store-local RowId values identify data. DOM IDs connect labels/ARIA only. Bind components to existing HTML; generate no visual design.
- Share actual rule/control/cleanup behavior at existing owners. Use direct functions, ordinary objects and explicit application callbacks; add no convenience utility package or generic registration engine.
- Retain framework-reachable formatter/validator/mask/date/byte behavior. Remove helpers only after direct, indirect, configuration and declaration reachability checks. No new omission is approved.
- M5.3 does not close wider Form bind-value callbacks/raw rendering, List editing, Tree validation, global callback/default lifecycles, legacy unvalidated paste, general data-value/schema equivalence, remaining UI/CVC parity or P0. Each retains its owning work.[^parity]
- Root 2.0 is Apache-2.0. Preserve master and the LGPL v1 baseline b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6. Leave the original ignored js/natural_js/@types/package-lock.json unchanged.
- Test Chromium, Firefox and WebKit. Firefox uses node_modules/.cache/playwright-m6 when needed; installed Chrome/Edge use the identical tar. Actual macOS/iOS Safari is excluded.
- npm publication and release tags remain deferred until the user finishes personal testing and separately requests them.

# Verification log

The [M5.3 plan](m5-form-options-plan.md) owns 32 top-level command records plus Chromium child reports, two new units/19 browser cases, three installed source witnesses and sixty raw performance medians. Ten semantic concepts receive independently reviewed verified metadata; 24 historical concepts retain bodies and generated/verified dates with fingerprint-only updates. Completed history stays in the log and owning plans.[^evidence]

# Open questions

Manual assistive technology, personal acceptance, actual token telemetry and equivalent final agent-task comparison remain unverified. Finish complete feature/dynamic coverage and the one consolidated omission proposal, then the mandatory [M13 whole-code review/remediation](m13-review-plan.md).[^parity][^review]

[^form-options]: Form row-local typed choice continuation
[^evidence]: Latest frozen runtime and artifact receipt
[^parity]: Required complete feature coverage and one omission review
[^review]: Mandatory whole-code review and remediation
[^conventions]: OKF document and verification rules
