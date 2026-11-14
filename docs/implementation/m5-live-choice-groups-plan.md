---
type: Plan
title: Natural-JS 2.0 M5.14 live Form choice catalogs
description: Replace adopted native choice catalogs while retaining Form field identity, data, drafts, defaults and owned cleanup.
tags: [meta, plan, ui, form, binding]
status: draft
sources:
  - id: previous
    resource: m5-choice-groups-plan.md
    title: Accepted generation-before-Form contract
    git_blob: 85ad9f21b8f69dd40990297ef02c31b4efdb1b3c
  - id: baseline
    resource: evidence/m513-verification.json
    title: Frozen M5.13 source and package evidence
    git_blob: 31c6a2074fefeca1c1e85856f81c8ee59338fa93
  - id: registry
    resource: evidence/remaining-work-plan.json
    title: Fixed remaining scope and dependencies
    git_blob: a18ff58091c2eb8d8050ba8222d6b3285a078a11
  - id: group
    resource: ../../src/ui/choice-group.ts
    title: Native catalog preparation, publication, defaults and focus
    git_blob: 55f64a676def493b2b82221138fade4dc0755d2e
  - id: owner
    resource: ../../src/ui/choice-group-owner.ts
    title: Specific group registration and Form claim owner
    git_blob: c2fd4d145d27b23dacd67c980f719926083b5b2b
  - id: form
    resource: ../../src/ui/form.ts
    title: Compiled fields, drafts, captures, errors and reset ownership
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
  - id: values
    resource: ../../src/ui/value-binding.ts
    title: Cached explicit versus raw field projection
    git_blob: 9f59b5313d2eb0988f7f4dbdbaa37611ccc73184
generated: { by: codex/gpt-6, at: 2026-11-14T13:53:41Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T13:53:41Z }
---

# Goal

Allow the existing ChoiceGroupHandle.setChoices call while Form owns the group. Preserve the same compiled Field, every RowId-keyed draft and all committed Rows/originals. Reuse the group/Form owners; add no public method, option, type, dependency, generic transaction engine or second binding graph.[^group][^owner][^form]

# Checkpoint

M5.14 began at clean pushed daab0f2 on 2.0.0-alpha.0; independent recorded-byte M5.13 recovery and bounded pre-source reviews pass. The existing setChoices operation now coordinates the actual group/Form owners. Same compiled fields preserve raw Rows, drafts, captures, projection/rule/default ownership and native cleanup through live replacement. Both authored CVC layouts and exact installed consumers execute the selected contract; no public API, dependency or second store is added.[^baseline][^registry][^group][^owner][^form]

# Steps

1. Capture exact group registration and unique Form claim identity before reading catalog getters. The Form owner captures its generation, bound RowId and Rows snapshot. Reject replacement during bind/render/value/rule work, restoration, reconciliation, rescan/incomplete rescan or a pending local native reset. Preparation can observe ordinary source changes, but stale preparation cannot publish over them.
2. Validate/materialize catalog data and build disconnected native controls before mutation. Retain string/null radio and zero/one/many checkbox arrays, literal labels, isolated names and authored HTML. Keep public setValue/dispose locked while adopted; a private claim without a replacement owner remains locked.
3. Preflight an applicable cached applied explicit value projection against the proposed codes, without invoking hooks. A current draft overrides that display cache. Missing source codes are not rewritten or silently normalized. Pending/failed projections remain pending/failed until the existing explicit refresh path retries them.[^values]
4. Use one private prepared replacement carrying new inputs/values and binder-specific apply/undo/focus operations. Rebind the existing Field's primary/members/originals, native lookup, annotations, captured element/member references, defaults element, visible issue targets and native reset owners. Retain Field/path/rules/capture.value and draft keys. Restore retired members' authored ARIA/change attributes and release their references.
5. Catalog replacement invokes no Rows.set/reconcile, whole/value hook, validator or native change/onChange. Preserve existing issue messages and retarget their real element; native editing or explicit validation evaluates current availability. An active Rows field displays its retained draft, applicable cached projection or current raw source against the new catalog; pending/failed projections retain the prior native view. Local or paused Form retains surviving native selection. Native defaultChecked survives separately; introduce no hidden local raw store.
6. Restore captured group UI through group.write(capture.value) in unbind, including empty groups. Captured creation values remain available when their codes are reintroduced, while native defaults retain only surviving choices. Rows-backed reset writes no data; local reset uses actual native owner subscriptions.
7. Publish DOM and Form metadata under a specific busy guard; restore focus only after guards/maps settle. Ordinary failure restores old node identity, checkedness, field maps, issue targets, owned attributes/reset listeners and focus. Preserve the original error if cleanup also fails. Detect insertion-time Rows mutation through the actual snapshot, retain that external write and repaint its latest normal source state after rollback. Disposal, release/reclaim or newer work must never resurrect old DOM.
8. Add meaningful focused tests for Rows/local/paused Forms, 0/1/N, hidden/current drafts, explicit/raw/failed projections, native/captured reset, errors/markers/focus, stale getters/ABA, insertion/ARIA/reset-listener failure, external Rows mutation/disposal, independent MDI and quiet retired controls. Extend actual CVC and exact installed JS/TS/five-browser consumers.
9. Freeze this stage independently. Run strict build/source/example types, units, complete Chromium/Firefox/WebKit, one actual tar in isolated JS/TS and all five Windows browsers, original 9+21 budgets and source/raw/document independent reviews. Preserve all attempts/traces and original fixtures; update implemented draft API/example/migration docs, indexes/log/fingerprints and current checkpoint with zero-error/zero-warning changed/full docs before this stage's own commit/push.[^baseline]

Representative application code remains explicit:

```ts
const choices = bindChoiceGroup(groupRoot, { choices: initialCodes });
const form = bindForm(formRoot, { rows });
form.bind(id);
choices.setChoices(updatedCodes);
// Values still change through native edits or Rows. Dispose Form before choices.
```

# Next action

Execute M3.1 next: preserve the existing communicator, capture and plainly invoke its hooks, and verify one typed application request wrapper for ordered preparation, transformation, recovery and exactly-once terminal cleanup. Continue the remaining necessary queue and each M5 stage independently through the joined M5.20 acceptance. The consolidated five-item omission decision remains pending; no silence authorizes removal.[^registry]

# Decisions

- A prepared private handoff is required because destructive replacement followed by rescan would retire the Field and lose or reject retained drafts. It serves two actual owners only.
- Failed/pending projection and business validation do not replay because a catalog changed. Explicit cached replacements must remain representable; raw unavailable source and private drafts stay unchanged.
- Focus completion is publication-aware: skip uninstalled/stale work, and after a legitimate undo restore original focus only when old ownership and maps have settled.
- An active automatic local Form cancels a trusted native reset during DOM publication and makes catalog work stale; reset can be retried after rollback. Paused, Rows-backed and synthetic reset notifications retain their existing policy. Actual source events deferred during publication retain their ordinary ordered cleanup/repaint after guards settle.
- Separate original data, native defaults and captured UI; local native selection may drop removed codes, while Rows source and all retained drafts remain unchanged.
- No family closure, feature omission, global P0 completion, publication/tag or master/v1 change is approved by this slice.

# Verification log

Fresh verification passes on 202 frozen inputs, 138 units and 853 complete cases per engine, including 17 added browser cases and corrected 140-case focused suites in all three engines. All sixteen latest canonical groups pass: strict build/source/example types, units, complete Chromium/Firefox/WebKit, one actual 203-file tar in isolated JS/TS and five Windows browsers, plus the unchanged 9+21 performance budgets and sixty recomputed raw medians. Chromium uses twelve disjoint fresh sequential shards with no retries/skips; Firefox/WebKit are complete unsharded suites. [Raw evidence](evidence/m514-verification.json) preserves 23 captured records, all input maps and both original focused failure traces/contexts. Two new-test contract mistakes were corrected without framework changes: exact true means successful validation, and rollback checks structural attributes plus exact old node identity rather than attribute serialization order. Independent source/raw/final-semantic reviews and actual changed/full OKF checks pass with zero errors/warnings; historical bodies/dates and immutable evidence remain. Broader owner/family, P0.2 and M13 obligations stay required. No omission, publication or tag.

# Open questions

Broader Select mutation/default/index workflows remain M6.1. Generated row-control integration remains M5.19 and editable List remains M6.2. P0.2 genuine loss decisions remain one consolidated user gate; no absent decision authorizes removal.[^registry]

[^previous]: Accepted generation-before-Form contract
[^baseline]: Frozen M5.13 source and package evidence
[^registry]: Fixed remaining scope and dependencies
[^group]: Native catalog preparation, publication, defaults and focus
[^owner]: Specific group registration and Form claim owner
[^form]: Compiled fields, drafts, captures, errors and reset ownership
[^values]: Cached explicit versus raw field projection
