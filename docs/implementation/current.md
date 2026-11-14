---
type: Plan
title: Natural-JS 2.0 active plan
description: Current checkpoint, remaining gates and next owner for the Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: html
    resource: m3-html-loading-plan.md
    title: Current M3.3 common HTML loader contract
    git_blob: 036b82d04688584a9c72573234dde9f0527f9918
  - id: protocol
    resource: m3-protocol-plan.md
    title: Current M3.2 native protocol and custom-sender contract
    git_blob: b94f7386725699eda8bd9f781ea5ef0b1ab86a5b
  - id: communication
    resource: m3-communication-plan.md
    title: Current M3.1 ordered application request and captured hook contract
    git_blob: d37725e500bafe3455d7f9d79a472b2f3447b24f
  - id: batch
    resource: m5-completion-run.md
    title: Authorized separate-stage M5 completion and prerequisite run
    git_blob: d1f88ae14d2b7b1a3ef402a00cfbc87e57ffac32
  - id: remaining
    resource: evidence/remaining-work-plan.json
    title: Fixed 56-stage continuation and exact known-record ownership
    git_blob: a18ff58091c2eb8d8050ba8222d6b3285a078a11
  - id: choices
    resource: m5-live-choice-groups-plan.md
    title: Safe live Form-owned choice replacement
    git_blob: 19d12621f52035dc25259ed2d34f17ae16f570ff
  - id: evidence
    resource: evidence/m33-verification.json
    title: Selected M3.3 runtime and independent acceptance
    git_blob: a6e18716de4a267e5ae3568fd6766ee8efcd3b4b
  - id: parity
    resource: feature-parity-plan.md
    title: Complete required feature coverage and one omission review
    git_blob: 4dc432ebdc8eea1846745520efede712523494cf
  - id: review
    resource: m13-review-plan.md
    title: Mandatory whole-code review and remediation
    git_blob: 1ea0adf1e024bbc544e27cbda7c6ed0a2af91e52
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF document and verification rules
    git_blob: 81500f1f325ac03d4a2772fca8f5f2a87e715191
generated: { by: codex/gpt-6, at: 2026-11-14T18:39:39Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T18:39:39Z }
---

Use this file to resume. The [milestone index](index.md), [roadmap](roadmap.md) and [completed log](../log.md) retain historical work; refresh fingerprints without recertifying old bodies.

# Goal

Complete 1.x framework capabilities in TypeScript/ESM without jQuery, preserving CVC, authored HTML/CSS, nested raw binding, unique IDs and accessible interaction. Keep code, contracts and agent context small. Only exact O01-O05 omissions are approved; all other required outcomes retain their numbered owners.[^parity][^protocol]

# Checkpoint

- M3.3 adds one optional captured/plain PageDefinition.loadHtml for URL views. The same parser checks nested template contents and live IDs; one page owner handles controllers, cancellation and cleanup across content, Popup, Tabs and Documents. No runtime module, named type, entry or dependency is added.[^html]
- Sixteen canonical groups pass on 206 frozen inputs, 155 units and 891 full cases per engine, retaining all 876 parent identities. Primary focus passes 47 per engine; fifteen new cases exercise loader/error/template/container/host behavior. The exact 203-file archive passes JS/TS, five installed browsers and the original thirty budgets/sixty medians. Only the page declaration changes among forty files.[^evidence]
- One initial focused fixture produced 46 passes and one failure because its serialized callback was not strict. Only that test function gained use strict; the framework already invoked it plainly. Preserve the first report/trace without a framework bug-fix claim.[^evidence]
- P0.1, M5.14, M3.1 and M3.2 are saved separately; M3.2 is pushed as 86be062. The user authorized every necessary predecessor through joined M5.20, with a separate plan, checks, documents and commit per stage.[^batch]

# Steps

Follow the durable ordered queue and separate-stage procedure in the [completion run](m5-completion-run.md); keep each stage's contract, checks, documents and commit independent.[^batch]

# Next action

Finish independent M3.3 raw/final-document acceptance and its separate commit/push, then write and implement M3.4 page metadata/lifetime from that saved baseline. Continue every required stage through joined M5.20 acceptance; twenty-eight unconditional stages remain after selected M3.3. Use the existing runner/owners and keep declaration objects separate from runtime handles.[^protocol][^batch][^review]

# Decisions

- One controller/cancellation lifetime per CVC page; reuse it in content, Popup, Tabs and Documents.
- Safe data-field paths and RowId identify data; document-unique IDs associate labels/ARIA. Bind authored HTML/CSS.
- Reuse actual rule/control/cleanup owners. Prefer direct functions and plain objects; expose only necessary application contracts.
- Retain reachable formatter/validator/mask/date/byte behavior. Remove helpers only after direct, indirect, configuration, declaration and external-reachability checks.[^parity]
- Creation defaults, captured UI restoration, native reset and received Rows reversion have distinct owners. Applications supply complete business rows and uploads.[^choices]
- Root 2.0 stays Apache-2.0. Preserve master/LGPL v1, immutable evidence, original fixtures and the ignored legacy lockfile.
- Chromium/Firefox/WebKit and installed Chrome/Edge remain required. Actual macOS/iOS Safari is excluded; npm publication and release tags wait for personal testing and a separate request.

# Verification log

The [M3.3 acceptance](evidence/m33-verification.json) references one immutable runtime receipt, connected source review, independent raw audit and final document checks. Twenty-four attempts retain eight development records and sixteen canonical groups. The first strictness fixture failure remains separate from corrected focus. The final archive SHA-256 is 2d443c48d62ae2a06bfe534b6c0bf3704f1974445a83483b872c78a1c8a0812e. Historical evidence and original budgets remain; no full-family, M5.20, M13 or release closure is inferred.[^evidence][^batch]

# Open questions

Only O01-O05 are explicitly excluded. Other source-value/callback, configuration/advice/declaration and component obligations remain required. The first Tree/date timeout has no proven cause; direct Windows WebKit cookie/header wire differences remain measured platform limits. Manual assistive-technology, actual token measurements and the earlier module-fetch cause retain their existing limits. M13 whole-code review, publication/tags/master/v1 cleanup remain outside this ancestor run.[^protocol][^batch][^review]

[^choices]: Safe live Form-owned choice replacement
[^evidence]: Selected M3.3 runtime and independent acceptance
[^parity]: Complete required feature coverage and one omission review
[^review]: Mandatory whole-code review and remediation
[^conventions]: OKF document and verification rules
[^remaining]: Fixed 56-stage continuation and exact known-record ownership
[^batch]: Authorized separate-stage M5 completion and prerequisite run
[^communication]: Current M3.1 ordered application request and captured hook contract
[^protocol]: Current M3.2 native protocol and custom-sender contract

[^html]: Current M3.3 common HTML loader contract
