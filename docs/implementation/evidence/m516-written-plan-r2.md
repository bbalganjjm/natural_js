---
type: Plan
title: Natural-JS 2.0 M5.16 entered creation and selection restoration
description: Read entered native fields without mutation, restore complete row checkpoints and retain accessible deleted details through existing Form and Rows owners.
tags: [meta, plan, form, data, lifecycle, migration]
status: draft
sources:
  - id: baseline
    resource: evidence/m515-verification.json
    title: Accepted M5.15 source values and projection checkpoint
  - id: contract
    resource: evidence/m516-reviewed-contract.md
    title: Reviewed exact prepare, restore and retained-preview contract
  - id: registry
    resource: evidence/remaining-work-plan.json
    title: Fixed M5.16 creation, update, removal and checkpoint outcomes
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Existing entered or captured creation, complete selection restore and loaded removal
  - id: form
    resource: ../../src/ui/form.ts
    title: Existing compiled fields, projections, captures, drafts and reset lifetime
  - id: defaults
    resource: ../../src/ui/native-defaults.ts
    title: Existing native creation paths and captured values
  - id: groups
    resource: ../../src/ui/choice-group.ts
    title: Existing typed choices, native restoration and live publication
  - id: rows
    resource: ../../src/data/index.ts
    title: Immutable current values, received originals, status and notifications
  - id: types
    resource: ../../src/ui/index.ts
    title: Existing Form handle and validation contracts
  - id: app
    resource: ../../examples/vite/m4/employees.ts
    title: Actual shared Employee bindings, factories, commands and Page cleanup
  - id: side
    resource: ../../examples/vite/m4/side.html
    title: Authored side layout and native detail controls
  - id: stack
    resource: ../../examples/vite/m4/stack.html
    title: Authored stacked layout with the same controller
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Existing rule owner with prepare-only callback checkpoints
  - id: native-number
    resource: evidence/m516-native-number-diagnostic.json
    title: Bare native partial-number and detached-probe observation without framework credit
  - id: omissions
    resource: omission-decision.md
    title: Only O01-O05 are approved exclusions
---

# Goal

Complete entered-versus-captured creation, complete selection checkpoint restoration and retained loaded-deletion detail. Reuse one Form renderer, one compiled native field graph, one Rows instance and the existing CVC signal. Add only Form.prepare and Rows.restore; keep business factories and selection policy in application code.[^registry][^contract][^legacy]

# Checkpoint

This plan is written before project source application from saved and pushed M5.15 commit 7ee46b7407e8a6c9b1e2ffdb8800fa5527d3b269. Its 221 inputs, 225 units, 957 latest full cases per engine and byte-identical 208-file archive remain immutable. The first Chromium import failure retains its recorded ERR_NO_BUFFER_SPACE and unknown deeper cause; later unchanged diagnostic and full passes do not establish a production fix.[^baseline]

The independently reviewed R2 contract is preserved byte-for-byte. Its two missing owners are concrete: current Form.read is committed-only, validate can reconcile old-row drafts and localFieldValue mutates retained state; current Rows patches merge keys and reject deleted targets. The v1 Form.revert removes all current keys before restoring its captured row. Replacing the whole store would lose identity; an independent renderer/store would duplicate existing ownership.[^contract][^legacy][^form][^rows]

Runtime, fixture and actual-app proposals are prepared only in ignored caches. No M5.16 compiler, project test, browser or benchmark has run. Exact candidate bytes and this written plan require connected independent review before application. Existing generated-choice removal assertions must become positive retained-preview/locking assertions; no old case is skipped or removed.[^contract]

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
7. Extend the existing reset owner/pending/timer path only while previewing. Allow a shared native form's default reset; after completion restore only affected current preview fields from their successful shown projection through existing native/choice restoration. Do not replay formatting/value/whole hooks or write Rows. Canceled/synthetic resets do not repaint; stale generations, rescan, catalog rollback, revival and disposal cannot restore an old preview. Keep fields locked after failure for explicit retry. Use accessible authored labels/live status and owned temporary root tabindex for a focused container; do not use inert or an arbitrary ancestor.[^contract][^form][^groups]
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
10. Apply only exact accepted source bytes, run strict development source/example/installed types, units and focused Chromium/Firefox/WebKit, then freeze and complete the sixteen canonical groups. Verify the actual archive in JS/TS and all five installed browsers and retain the original thirty performance budgets. Derive actual counts/declaration/archive deltas, preserve all failures and independently audit raw records. Update implemented API docs as draft with source, index/log/fingerprints, independently review final bodies and require changed/full docs checks at zero errors/warnings before a separate commit/push.[^baseline][^registry]

Same-field/RowId presentation reentry remains recoverable FORM_VALUE, including a loaded deletion started inside an active value callback. The data removal stays committed and the retained preview stays locked; explicit refresh retries projection after that callback ends. Keep the existing physical-insert removal result. Add no deferred rendering queue or automatic callback replay for this failure boundary.[^form][^contract]

# Next action

Finish disjoint cache implementation and source/fixture/installed reviews, bind the exact candidate manifest to this actual plan, and apply only after source GO. Continue the authorized separate-stage run through M5.20 without treating a partial preparation or display result as M5.16 completion.[^registry][^contract]

# Decisions

- Two methods on existing owners; no new public named type/entry/dependency, generic initialization, inverse formatter, reset scheduler, factory registry or parallel renderer.
- Native defaults, construction capture, entered values, committed Rows, received checkpoint and application selection checkpoint keep separate owners.
- Preparation reads current fields without changing old data; application factories and business validation supply complete Rows-compatible values.
- Complete restoration preserves framework identity/original/order, copies all supplied business content and retains authoritative received deletion.
- Deleted preview remains readable and noneditable; restore/reset/native/resource/focus cleanup use existing owners.
- Keep v1/master/LGPL, root Apache-2.0, immutable raw evidence and ignored legacy lock unchanged. No publication/tag/master/archive/v1 removal or whole-family/M13 closure follows.[^omissions][^registry]

# Verification log

The exact R2 contract and independent contract-only review pass before actual source application. Candidate cache work has no compile/browser/unit/performance credit. M5.15 runtime and its original failure/trace remain inherited at their frozen identities. Current M5.16 input, case, artifact and document facts await actual execution.[^baseline][^contract]

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
