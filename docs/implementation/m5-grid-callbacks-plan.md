---
type: Plan
title: Natural-JS 2.0 M5.11 captured Grid binding callbacks
description: Capture validated row and completion callbacks once and invoke them without an implicit receiver.
tags: [meta, plan, binding, migration]
status: draft
sources:
  - id: previous
    resource: m5-collection-values-plan.md
    title: Shared field value callbacks and remaining configuration outcomes
    git_blob: bdf49c598a1652fc99914b10fb9c5212bef36926
  - id: baseline
    resource: evidence/m510-verification.json
    title: Frozen M5.10 source, runtime and installed artifact baseline
    git_blob: 772104504a5052c804e7f38ef8534f547c946ab0
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid construction, physical row attachment and completion
    git_blob: 09ffaa47fbc1245bf8dec049a251a84ea41cfa21
  - id: hooks
    resource: ../../src/ui/grid-hooks.ts
    title: Synchronous row callback and cleanup ownership
    git_blob: ef9ddf47da4ab02a035f20794286685dbf52f3b1
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Source-backed Form callbacks and legacy wrapper behavior
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: parity
    resource: feature-parity-plan.md
    title: Complete feature obligations and consolidated omission decisions
    git_blob: 58251b7b726ac4a654a592b07447f02b76f86fe9
generated: { by: codex/gpt-6, at: 2026-11-14T04:21:00Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T04:21:00Z }
---

# Goal

Make beforeRowBind, onRowBind and Grid onBind follow the captured plain-function rule already used by Form and shared field callbacks. Read each constructor property once, validate that reference, and use the same reference for invocation and before-hook physical attachment. Keep explicit application forwarding functions for live policy; add no public API, registry, callback engine or dependency.[^grid][^hooks][^previous]

# Checkpoint

- M5.11 starts at pushed db760efc6367fc592b5a6d6e1e0cdc240eb1b68b with a clean worktree; independent recorded-byte M5.10 recovery and bounded pre-source contract reviews pass.[^baseline]
- Existing Grid callbacks are captured once, validated and invoked plainly; physical attachment uses the captured before hook. Actual demo callers already use explicit closures. New focused and installed witnesses cover getter reads, mutation, strict receivers, independent resources and progressive policy without a public API addition.[^grid][^hooks]
- Fresh canonical gates and independent connected source/raw/document reviews accept only this bounded contract. Per-unbound-key timing, legacy instance/initial-selection and broader parity remain required.[^parity]

# Steps

1. Independently review this bounded contract before source edits. Inventory actual demo, lifecycle/progressive tests and installed JS/TS/browser consumers. Preserve their callback order, synchronous checks, error codes/causes, cleanup, rollback, progressive completion and source/disposal checkpoints.
2. Capture the three function references at bindGrid construction. Validate and invoke those captured references. Reuse captured beforeRowBind when deciding whether a new physical row must be attached before its hook. The private row owner calls the selected function plainly; no options object or Grid instance is an implicit receiver. Capture getters once and permit frozen reusable options.
3. Mutating, deleting or adding callback properties after construction cannot replace, disable or enable these three callbacks. Separate Grid instances capture their own construction values. A stable application closure may read current application policy on each call; explicitly refresh for changed policy to affect unchanged rows. This is not a blanket capture or reconfiguration guarantee for other constructor options.
4. Add focused browser witnesses for all three references/receivers, property getters, construction-time absence, in-hook and later option mutation, physical attachment, independent instances and explicit live forwarding. Reuse existing throwing/thenable, resource, reentry, disposal, progressive and viewport regressions rather than build another lifecycle engine. Extend actual installed consumers with the same bounded contract.
5. Update current Grid/UI/migration/example guidance and the parity record with the exact capture rule and legacy receiver migration. True DOM-only Form callbacks have no demonstrated v1 source-row contract: legacy bind requires a data row and add creates one. Preserve that evidence without introducing nullable row/element contexts. Legacy per-unbound-key callback timing is real and remains unresolved; full raw Rows observation is not claimed to reproduce it.[^legacy][^parity]
6. Freeze runtime inputs; run strict build/source/example types, units, complete Chromium/Firefox/WebKit, one exact tar in isolated JS/TS and five available Windows browsers, original nine binding/twenty-one viewport budgets and changed/full OKF checks. Serialize all browser/performance gates and retain every attempt, source/archive/log hash and complete case identity.
7. Independently review connected source/callers/tests, raw evidence and final semantic documents. Keep implemented contracts draft; mark verified only after separate review. Preserve historical document bodies/dates during fingerprint refresh. Commit and normally push the selected work to 2.0.0-alpha.0.

# Next action

Plan M5.12 for the remaining source-only and per-unbound-key Form outcomes: establish the exact bind/val observation boundary before choosing a minimal owner or application recipe. Keep legacy instance/initial-selection, broader configuration/declaration equivalence, wider dynamic owners, List editing, Tree validation, unvalidated paste, data/schema equivalence, other UI/CVC/P0 and M13 required. No omission or full-family closure is approved.

# Decisions

- Continued-work approval covers this stage. No public type, function, option, entry, runtime module or dependency is added. Existing callback signatures and contexts remain.
- Keep CVC lifetimes, authored HTML/CSS, unique IDs, accessibility, compiled binding paths and raw data ownership. Framework lifecycle checkpoints still surround each complete application callback, not its internal subcalls.
- No omission or full-family closure. Per-unbound-key observations, broader source/default/declaration equivalence, legacy instance/initial-selection outcomes, wider dynamic owners, List editing, Tree validation, unvalidated paste, data/schema equivalence, other UI/CVC/P0 and M13 remain required.[^parity]
- Preserve master/LGPL v1, immutable earlier evidence, protected performance fixtures and the ignored legacy lock. Root 2.0 remains Apache-2.0.
- Chromium, Firefox, WebKit and installed Chrome/Edge remain required. Actual macOS/iOS Safari is excluded; npm publication and release tags remain deferred.
- No model-response evaluation, actual token measurement or token-saving claim. Any context byte/line figure is a labeled proxy.

# Verification log

Fresh checks pass on 192 frozen inputs, 138 units and 801 full cases per engine, with eight new browser cases and no new units. Sixteen latest groups cover strict build/source/example types, one actual 193-file tar in isolated JS/TS and all five Windows browsers, full Chromium/Firefox/WebKit, and the original thirty performance budgets/sixty recomputed medians. Chromium's twelve fresh-process shards cover each identity exactly once without retries/skips; Firefox/WebKit are unsharded. [The receipt](evidence/m511-verification.json) retains every attempt, input map and raw log. The initial focused attempt failed all 126 cases at browser launch because the required default Chromium executable was absent; no test body ran. Restoring the required Playwright browsers enabled fresh passes. Separately, pre-execution static review corrected the new fixture's expected all-before/all-after order and expanded absent-callback variants; these fixture edits did not diagnose the launch failure or change framework source. An earlier full Chromium attempt stopped on a Grid-module fetch failure in an existing beforeEach, before its test body. A later targeted diagnostic passed and recorded HTTP 200; that trace is not the original failure and does not establish its cause. The incomplete attempt grants no full-suite credit, and later complete suites use unchanged runtime inputs. Independent connected source/caller, raw/archive/metric and final document reviews pass; changed/full OKF checks have zero errors/warnings and historical bodies/dates remain. No full-family/P0/M13 closure, omission, publication or tag.

# Open questions

The pre-body module-fetch failure's cause remains unverified and requires test-infrastructure follow-up. Complete remaining parity before the mandatory whole-code Ponytail review/remediation. Manual assistive technology, personal acceptance and final fixed-agent/token comparison remain unverified.[^parity]

[^previous]: Shared field value callbacks and remaining configuration outcomes
[^baseline]: Frozen M5.10 source, runtime and installed artifact baseline
[^grid]: Grid construction, physical row attachment and completion
[^hooks]: Synchronous row callback and cleanup ownership
[^legacy]: Source-backed Form callbacks and legacy wrapper behavior
[^parity]: Complete feature obligations and consolidated omission decisions
