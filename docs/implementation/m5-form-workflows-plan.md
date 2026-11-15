---
type: Plan
title: Natural-JS 2.0 M5.16 entered creation and selection restoration
description: Read entered native fields without mutation, restore complete row checkpoints and retain accessible deleted details through existing Form and Rows owners.
tags: [meta, plan, form, data, lifecycle, migration]
status: draft
sources:
  - id: acceptance
    resource: evidence/m516-runtime-receipt.json
    title: Immutable recorded M5.16 execution, exact archive and canonical groups
    git_blob: 0758b541d2e4d11b44c32a85bf79cc97abc640e2
  - id: baseline
    resource: evidence/m515-verification.json
    title: Accepted M5.15 source values and projection checkpoint
    git_blob: 43e58d011aab626e95108581cd4f0ef226c7c771
  - id: contract
    resource: evidence/m516-reviewed-contract.md
    title: Reviewed exact prepare, restore and retained-preview contract
    git_blob: 530b862dae24aea7dce3d30f7ef5fb3f7ce5bc50
  - id: registry
    resource: evidence/remaining-work-plan.json
    title: Fixed M5.16 creation, update, removal and checkpoint outcomes
    git_blob: a18ff58091c2eb8d8050ba8222d6b3285a078a11
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Existing entered or captured creation, complete selection restore and loaded removal
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: form
    resource: ../../src/ui/form.ts
    title: Existing compiled fields, projections, captures, drafts and reset lifetime
    git_blob: 727e0beafc9173628ff99286af22ad36cb825819
  - id: defaults
    resource: ../../src/ui/native-defaults.ts
    title: Existing native creation paths and captured values
    git_blob: 924e9be1fe771b1359ac5fff641af2536994ce3e
  - id: groups
    resource: ../../src/ui/choice-group.ts
    title: Existing typed choices, native restoration and live publication
    git_blob: 55f64a676def493b2b82221138fade4dc0755d2e
  - id: rows
    resource: ../../src/data/index.ts
    title: Immutable current values, received originals, status and notifications
    git_blob: f6ba2fec9512b94efda549ab8508f4e7c7c20e42
  - id: types
    resource: ../../src/ui/index.ts
    title: Existing Form handle and validation contracts
    git_blob: 39cfde5b63a33a576505d086c4211ce4d556f814
  - id: app
    resource: ../../examples/vite/m4/employees.ts
    title: Actual shared Employee bindings, factories, commands and Page cleanup
    git_blob: b01cbd3254a17c5c06b3af9699cbc46c78aca162
  - id: side
    resource: ../../examples/vite/m4/side.html
    title: Authored side layout and native detail controls
    git_blob: d7f443973ed642ddc01b31e3aa67e24847440048
  - id: stack
    resource: ../../examples/vite/m4/stack.html
    title: Authored stacked layout with the same controller
    git_blob: 1a1aefef394075cac0a3fdca58b2766c4794a4ed
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Existing rule owner with prepare-only callback checkpoints
    git_blob: 165d762d680f5aa6787516613f385a87b1334ecf
  - id: native-number
    resource: evidence/m516-native-number-diagnostic.json
    title: Bare native partial-number and detached-probe observation without framework credit
    git_blob: a7967f98e4b9eb16d1f07cf59fb6fca4ba60e1b4
  - id: omissions
    resource: omission-decision.md
    title: Only O01-O05 are approved exclusions
    git_blob: 2e795643d626d0c3161cf859524d8dd464e6b8dc
generated: { by: codex/gpt-6, at: 2026-11-15T03:00:21Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-15T03:00:21Z }
---

# Goal

Complete entered-versus-captured creation, complete selection checkpoint restoration and retained loaded-deletion detail. Reuse one Form renderer, one compiled native field graph, one Rows instance and the existing CVC signal. Add only Form.prepare and Rows.restore; keep business factories and selection policy in application code.[^registry][^contract][^legacy]

# Checkpoint

This plan was written before project source application from saved and pushed M5.15 commit 7ee46b7407e8a6c9b1e2ffdb8800fa5527d3b269. Its 221 inputs, 225 units, 957 latest full cases per engine and byte-identical 208-file archive remain immutable. The first Chromium import failure retains its recorded ERR_NO_BUFFER_SPACE and unknown deeper cause; later unchanged diagnostic and full passes do not establish a production fix.[^baseline]

The independently reviewed R2 contract is preserved byte-for-byte. At the original written-plan checkpoint, Form.read was committed-only, validate could reconcile old-row drafts and localFieldValue mutated retained state; Rows patches merged keys and rejected deleted targets. The v1 Form.revert removes all current keys before restoring its captured row. Replacing the whole store would lose identity; an independent renderer/store would duplicate existing ownership.[^contract][^legacy][^form][^rows]

At the original written-plan checkpoint, runtime, fixture and actual-app proposals were prepared only in ignored caches and no M5.16 compiler, project test, browser or benchmark had run. Exact candidate bytes and this written plan require connected independent review before application. Existing generated-choice removal assertions must become positive retained-preview/locking assertions; no old case is skipped or removed.[^contract]

At the R3 amendment checkpoint, the first full Chromium run recorded 1,005 passes/two failures in pre-existing retained-deletion expectations. The approved implementation preserved a loaded Form association and allowed binding received deletions; old Grid-change/state-import tests still expected clearing or rejection. That amendment changed only those two test owners, without changing production code or the approved public contract. Keep the initial written plan, source ledger, archive, failures and earlier checks immutable. At that amendment checkpoint, final-source acceptance still awaited fresh gates.

# Steps

1. Recover the saved M5.15 checkpoint and retain the fixed authorized queue. Bind this plan, the exact R2 contract, independent review and final disjoint source manifest before applying code. Preserve O01-O05 only, every original fixture/failure and all later callback/rule/generated-control owners.[^baseline][^omissions][^registry]
2. Add the following methods to existing owners, without a named result type, registry, generic factory or another store:

```ts
// Existing FormHandle<T>:
prepare(): ValidationResult & { readonly values: Record<string, unknown> | null };
// Existing Rows<T>:
restore(id: RowId, value: T | Snapshot<T>): void;
```

prepare returns a detached mutable native-field record only on success; invalid input returns values:null and collected issues. It does not return T, insert data, publish issues, write Rows/drafts, change captures or move focus. Include compiled native controls and static/generated groups, including disabled/readonly/hidden controls and zero-input groups; exclude button/image/display-only fields. File input contributes the existing filename representation. Preflight conflicting native paths before reads and reuse the existing safe path owner.[^contract][^form][^defaults][^types]

3. Reuse the compiled Field graph through a pure observation branch beside mutating localFieldValue. Track the actual last successful native projection for Rows fields: association, original parsed raw value and exact shown token. Unchanged successful raw skips re-parsing; actual edits parse once. Preserve the version still displayed when a focused source update is deferred. Observe typed option identities/occurrences and raw mapping, not select.value alone. A current draft, accepted edit/reset, retired field or changed membership invalidates reuse; unbind/rescan/group publication and rollback keep their existing ownership.[^contract][^form][^groups]
4. Use one coherent preparse native-only context and complete parsed context, with rowId:null. Reuse existing validation/native probes and current catalog availability without changing real controls. Check source/association/field/native/reset revisions around user reads/parsers/rules and before return. Reject stale/reentrant work with FORM_PREPARE, preserve FORM_DISPOSED/FORM_RESCAN precedence, drain unsupported parser thenables and report clone failure with cause. Preparation never flushes pending resets or calls display/whole/value callbacks. Use the existing private RuleRunner checkpoint only during preparation, after each actual rule/provider and before translating a caught error, so disposal or same-owner guard errors cannot start later callbacks or be hidden by RULE_FAILED. Ordinary validation and broader rule receiver/result policy remain M5.18. Bare native keyboard checks in Chromium/Firefox/WebKit show partial e/minus/dot numeric input has badInput despite an empty value, while a detached probe loses that state. Preserve that current native bit and report its existing HTML issue when willValidate is true, without dispatching invalid events on real controls. These nine native-only observations have zero framework-suite credit; the actual prepare regression remains required.[^contract][^form][^rules][^native-number]
5. Implement Rows.restore as one complete clone/check/commit. Replace own content, including absent optional keys, while preserving framework RowId, order, received original and checkpoint. Copy business fields exactly, including business id. Compare own-key presence and values, including missing versus own __proto__ empty objects. Recompute dirty keys against the received original; publish one existing set event only for effective value/status change. No-op restores retain public snapshots/caches; subscriber exceptions remain post-commit.[^contract][^rows]

| Received/current owner | Status after restoration |
|---|---|
| Ordinary or received-clean row | clean when equal to original including keys; otherwise update |
| Ordinary or received insert | insert; no received original is invented |
| Received update | update, even at its received values |
| Local deletion of a clean/update owner | Restore clean/update from the same original and clear local deletion |
| Received deletion | delete remains authoritative; retained display may change, original delete payload stays |
| Missing or physically removed insert | ROW_MISSING; do not recreate an identity |

6. Retain the current Form association for a loaded deletion and allow explicit binding of a retained deletion. Use the same formatter, renderer, typed selection and marked committed read. Lock only owned native fields, preserve prior disabled/root status attributes and parent-fieldset policy, clear only that deleted row's drafts/issues and prevent native commits. Default validation skips preview but keeps other live drafts; explicit deleted-row validation retains its existing unavailable-row error. prepare rejects a deleted preview; defaults remains captured creation access.[^contract][^form]
7. Extend the existing reset owner/pending/timer path only while previewing. Allow a shared native form's default reset; after completion restore only affected current preview fields from their successful shown projection through existing native/choice restoration. Do not replay formatting/value/whole hooks or write Rows. Canceled and synthetic notifications start no framework restoration; synthetic native default action can differ by browser. Stale generations, rescan, catalog rollback, revival and disposal cannot restore an old preview. Keep fields locked after failure for explicit retry. Use accessible authored labels/live status and owned temporary root tabindex for a focused container; do not use inert or an arbitrary ancestor.[^contract][^form][^groups]
8. Connect both existing Employee layouts. Preserve existing received/all-row Revert and captured New. Add distinct New from entered and Restore selection commands. One explicit Employee factory accepts captured defaults or prepared native values and supplies full business/nested fields without Record-to-T casts. Store one immutable live selection checkpoint and one retained-preview RowId. Loaded removal survives Grid onSelect(null); inserted removal restores capture. A selection restore must bind detail once whether Grid selection changes or stays unchanged. Preserve M3.6/M3.7 preparation, public advice/search paths, current request payloads, Page cleanup and sibling independence.[^app][^side][^stack][^contract]

```ts
const candidate = detail.prepare();
if (candidate.values === null) {
  reportCandidate(candidate.issues);
} else {
  const value = completeEmployee(candidate.values, currentBusinessContext());
  const id = rows.add(value, rows.entries({ includeDeleted: true })[0]?.id);
  showRow(id);
}
// A checkpoint is captured from a still-present live selection, not received-delete.
rows.restore(checkpoint.id, checkpoint.value);
detail.unbind();
const alreadySelected = grid.selected() === checkpoint.id;
showRow(checkpoint.id); // This app's changed-selection callback binds detail.
if (alreadySelected) detail.bind(checkpoint.id);
```

The named factory/report/show/context values belong to the application. The actual factory returns Employee. Received reversion and arbitrary application selection restoration remain distinct; a received deletion stays read-only and is not routed through this live-only selection recipe. A later UI/subscriber error does not roll back a committed add/restore.[^contract][^app]

9. Independently review framework, actual app, installed consumers and fixtures across disjoint authors. Cover the R2 P01-P06 native/raw/version/reset/error groups, R01 full-key/status/atomic restore, C01-C03 actual creation/reset/deletion workflows and I01 real installed JS/TS/browser paths. Reuse existing defaults/local/discovery/value/group tests; keep the existing whole-binding hook counts. Intentional old deletion assertions gain explicit retained-content, lock, new-member and cleanup checks.[^contract]
The full-suite follow-up includes tests/browser/grid-change-state.spec.ts and tests/browser/row-state.spec.ts. Preserve their case identities, null/stale clearing, native editor/membership/paste protection and all other rejection checks. Replace only obsolete deleted-Form expectations with positive retained committed read, disabled controls, original comparison flags and explicit validation/prepare protection. Do not merely lower a rejection count. Independently review these two fixture candidates against this actual amendment before application; retain the final 1,007-case collection and derive the expanded focused scope from all eleven selected files.

10. Apply only exact accepted source bytes, run strict development source/example/installed types, units and focused Chromium/Firefox/WebKit, then freeze and complete the sixteen canonical groups. Verify the actual archive in JS/TS and all five installed browsers and retain the original thirty performance budgets. Derive actual counts/declaration/archive deltas, preserve all failures and independently audit raw records. Update implemented API docs as draft with source, index/log/fingerprints, independently review final bodies and require changed/full docs checks at zero errors/warnings before a separate commit/push.[^baseline][^registry]

Same-field/RowId presentation reentry remains recoverable FORM_VALUE, including a loaded deletion started inside an active value callback. The data removal stays committed and the retained preview stays locked; explicit refresh retries projection after that callback ends. Keep the existing physical-insert removal result. Add no deferred rendering queue or automatic callback replay for this failure boundary.[^form][^contract]

# Next action

Save/push the separately verified M5.16 checkpoint and continue M5.17 from its bounded source-key/callback/capture contract. Keep the exact original written plan and every failed attempt immutable; all remaining rule/control/UI/shell owners remain required.[^registry][^contract]

# Decisions

- Two methods on existing owners; no new public named type/entry/dependency, generic initialization, inverse formatter, reset scheduler, factory registry or parallel renderer.
- Native defaults, construction capture, entered values, committed Rows, received checkpoint and application selection checkpoint keep separate owners.
- Preparation reads current fields without changing old data; application factories and business validation supply complete Rows-compatible values.
- Complete restoration preserves framework identity/original/order, copies all supplied business content and retains authoritative received deletion.
- Deleted preview remains readable and noneditable; restore/reset/native/resource/focus cleanup use existing owners.
- Keep v1/master/LGPL, root Apache-2.0, immutable raw evidence and ignored legacy lock unchanged. No publication/tag/master/archive/v1 removal or whole-family/M13 closure follows.[^omissions][^registry]

# Verification log

The R2 written plan and exact independent source GO precede application; the R3 test-only amendment precedes the two additional old-test updates. The final composite review binds 23 source-owned paths: 18 original M5.16 paths, README and two documentation tools changed during the user-authorized pause, and two old test paths. Three fixture correction batches preserve every registration and unaffected protection. The two obsolete deleted-Form clearing/rejection expectations are replaced with positive preview checks; the other batches settle prior native work and compare synthetic native reset behavior. Seven implemented concepts are reconciled in wiki/v2 and independently reviewed, including the choice-group reset clarification, without duplicating reusable knowledge in this plan.

The 44 recorded attempts preserve both original focused runs with 190 passes/two failures, the first full Chromium run with 1,005 passes/two failures and sixteen latest canonical groups. The final 225 inputs pass 242 units, 222 expanded focused cases and 1,007 full cases per engine; earlier primary focus passes 192 per engine. All 957 parent cases remain, with 17 new units/50 browser cases. The exact 208-file archive c42f11e568f1822a130e4edc1bb7b0d3a78fdd172035a9080b774e6a4883fc92 passes JS/TS and installed Chromium/Firefox/WebKit/Chrome/Edge. Forty-one declarations retain 37 identical files; 4 existing declarations change, with no new runtime filename, public named type, entry or dependency. The original 30 budgets retain 60 medians/300 raw durations.[^acceptance]

The original Chromium focused failure is an email native change before the command, corrected only by settling blur before arranging the direct candidate. The original Firefox failures assume synthetic reset has no native default action; independent bare controls show its native reset in Firefox and no reset in Chromium/WebKit. Same-engine parity retains every substantive trusted/canceled/projection assertion and adds source/callback/lock/purity checks. The first full Chromium failures are two old clearing/rejection expectations; positive retained-preview checks preserve all other state protections. These fixture corrections make no production change. A later benchmark startup waits 30 seconds for its ready function and times out before metrics; subsequent identical startup/performance checks pass, but the original cause remains unknown and no fix is claimed. Diagnostics and the separate passing Node documentation-tool regression receive no Vitest/browser/canonical credit. Independent recorded-byte and final semantic reviews precede actual zero-error/zero-warning document completion. The immutable source snapshot retains pending-at-capture fields; m516-verification.json owns later completion. No extra omission or family closure is inferred.[^acceptance]

# Open questions

No new omission is requested. All M5.16 creation, selection restoration and retained-deletion detail outcomes must be completed in this stage. Later exact source-key/receiver behavior, standalone rule/mask contracts, shared/generated row controls, editable List and joined native/List/Tree/date acceptance retain their numbered owners.[^registry][^contract]

[^baseline]: Immediate saved prerequisite; preserve its original evidence and limitations.
[^contract]: Reviewed exact two-method, versioned observation, complete restore and preview ownership.
[^registry]: Fixed authorized stage order and owner-specific acceptance.
[^legacy]: Actual original creation, complete-key Form.revert and loaded removal behavior.
[^form]: Existing compiled field, raw/display/draft and reset owner.
[^defaults]: Existing captured creation paths and native value policy.
[^groups]: Existing typed catalog, publication/rollback and native restoration.
[^rows]: Existing immutable current/original/checkpoint and event ownership.
[^types]: Existing Form handle and validation API contracts.
[^app]: Actual Employee factories, selection, requests and cleanup.
[^side]: Side layout preserves authored HTML and native controls.
[^stack]: Stacked layout uses the same controller and data contracts.
[^omissions]: Only the five explicitly approved exclusions apply.

[^rules]: Existing private validation owner; preparation alone adds lifetime checkpoints.
[^native-number]: Native-only evidence establishes lost badInput in a detached probe, without Natural-JS execution.

[^acceptance]: Immutable recorded M5.16 execution, exact archive and canonical groups
