---
type: Plan
title: Natural-JS 2.0 active plan
description: Current checkpoint, remaining gates and next owner for the Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: form-values
    resource: m5-form-values-plan.md
    title: Rows-backed Form presentation callbacks and raw ownership
    git_blob: 2ea0ee4b30e4ce836dd6be0bea0bba4e72e4e8e1
  - id: evidence
    resource: evidence/m54-verification.json
    title: Latest frozen runtime and artifact receipt
    git_blob: 7419e17370dc53ddd72ad3a4a630e27f6e0a2bfe
  - id: parity
    resource: feature-parity-plan.md
    title: Required complete feature coverage and one omission review
    git_blob: 6d58dbcb019a01df38547f94313713703aeed768
  - id: review
    resource: m13-review-plan.md
    title: Mandatory whole-code review and remediation
    git_blob: bda236810e8ed4cf3bb9c3fa573bfdd088bcea37
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF document and verification rules
    git_blob: c39914313418de687419b88f43f8fce29333a053
generated: { by: codex/gpt-6, at: 2026-10-31T10:01:54Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-31T10:01:54Z }
---

Use this file to resume. The [milestone index](index.md), [roadmap](roadmap.md), [completed log](../log.md) and owning plans retain historical work; do not recertify it while refreshing fingerprints.

# Goal

Complete all 1.x framework capabilities in TypeScript/ESM without jQuery, preserving CVC, authored HTML/CSS, nested raw binding, unique IDs and accessible interaction. Keep contracts, code and agent context small. Only explicitly approved omissions reduce supported behavior.[^parity]

# Checkpoint

- Work and authorized pushes stay on 2.0.0-alpha.0. M5.4 starts at pushed d923434ea9776e3978596e53a8da21c3daf6a642; ten preexisting document changes have separate snapshot provenance and are preserved.[^form-values][^evidence]
- M5.4 adds two synchronous value callbacks and FormValueContext at the existing Rows-backed Form owner. Display replacements preserve source/originals/tracking/raw validation; field-local caching, focus deferral and reentry/source guards avoid repeated or stale work. No new module, dependency, registry or inverse mapper. [Form](../v2/form.md#value-callbacks) owns the API.[^form-values]
- Sixteen canonical gates pass on 182 frozen inputs, 138 units, 630 full cases per engine. Chromium's three disjoint built-in shards prove complete once-only coverage; Firefox/WebKit are unsharded. Identical-package JS/TS plus five Windows browsers and unchanged nine binding/twenty-one viewport budgets pass. Tar SHA-256: 14fe023753933d17cb35c6de7b9b41ea80a5fc3674aeeec4f0809c7f5e56a9fd.[^evidence]
- Independent connected source/caller/document and raw-log/archive/measurement reviews accept this selected slice. Changed/full OKF checks pass with zero errors/warnings; historical bodies/dates remain unchanged except the separately preserved initial edits. This does not close all legacy families.[^evidence][^conventions]

# Next action

Plan the remaining Form local-source/raw binding and lifecycle contract against legacy callers before implementing it. Keep shared/global callback/default lifecycles, List editing, Tree validation, unvalidated paste, general data-value/schema equivalence, other UI/CVC/P0 and mandatory M13 required. No new omission is approved.[^form-values][^review]

# Decisions

- One CVC controller/cancellation lifetime per page; reuse its runtime in content, Popup, Tabs and Documents.
- Safe data-field paths and store-local RowId identify data; document-unique IDs associate labels/ARIA. Bind existing HTML/CSS without imposing a design.
- Share proven rule/control/cleanup behavior at existing owners. Use direct functions and ordinary objects; expose only application-use contracts.
- Retain reachable formatter/validator/mask/date/byte behavior. Remove helpers only after direct, indirect, configuration and declaration reachability checks.[^parity]
- Value callbacks project supported bound fields only. Local callbacks, unbound-key/global wrapper equivalence and wider Form raw rendering remain separate obligations; normalization uses explicit application data operations.[^form-values]
- Root 2.0 remains Apache-2.0. Preserve master/LGPL v1 and the original ignored legacy lockfile.
- Chromium/Firefox/WebKit are mandatory; installed Chrome/Edge use the same tar. Actual macOS/iOS Safari is excluded.
- No npm publication or release tags until personal testing and a separate request.

# Verification log

The [M5.4 plan](m5-form-values-plan.md) and [receipt](evidence/m54-verification.json) own command attempts, exact witnesses, shard identities and sixty recomputed raw performance medians. The active document keeps only resume context. Mapping counts remain 60 families/775 entries; selected acceptance does not close full families or recertify historical runtime.[^evidence][^parity]

# Open questions

Manual assistive technology, personal acceptance, actual token telemetry and equivalent final agent-task comparison remain unverified. Finish complete feature/dynamic coverage and one consolidated omission proposal, then [M13 whole-code review/remediation](m13-review-plan.md).[^parity][^review]

[^form-values]: Rows-backed Form presentation callbacks and raw ownership
[^evidence]: Latest frozen runtime and artifact receipt
[^parity]: Required complete feature coverage and one omission review
[^review]: Mandatory whole-code review and remediation
[^conventions]: OKF document and verification rules
