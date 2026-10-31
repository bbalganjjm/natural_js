---
type: Plan
title: Natural-JS 2.0 M5.2 incoming row state
description: Receive explicit row state and preserve checkpoint reversion, retained ordering and application-owned wire projection.
tags: [meta, plan, data, migration]
status: draft
sources:
  - id: previous
    resource: m5-shared-rules-plan.md
    title: Completed shared-rule continuation
    git_blob: 1a5ddb875ac697b668f395a6f9692d4d831a9f8c
  - id: baseline
    resource: evidence/m51-verification.json
    title: Preserved 73f5a88 source and runtime evidence
    git_blob: b6598f48a95787ff8c8842554d8d4386efa5ce2a
  - id: data
    resource: ../../src/data/index.ts
    title: Existing identity, immutable values, changes and batch ownership
    git_blob: 38faf810b59fecebd9e0d0e7ee8a935b480bcecd
  - id: comm
    resource: ../../src/comm/index.ts
    title: Explicit request method, JSON body, decoding and cancellation
    git_blob: f3650ddbfeb5d87c3e58dc84904df9704e994368
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Incoming rowStatus, received-value reversion and raw ordering
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: legacy-comm
    resource: ../../v1/src/natural.architecture.js
    title: Legacy first-row or array JSON transmission
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
  - id: acceptance
    resource: evidence/m10964-grid-acceptance.json
    title: Retained incoming-state, wire and tombstone-anchor obligations
    git_blob: bdaa8758faef962ea527f5cf505a5148a265a684
  - id: current-acceptance
    resource: evidence/m52-row-state.json
    title: Selected state, checkpoint, ordering and wire witnesses
    git_blob: cb4ed4bc50757a3c001632bfdca14f71b1a7f791
  - id: runtime
    resource: evidence/m52-verification.json
    title: Frozen M5.2 source, raw gates, artifact and measurements
    git_blob: bb7428451aed61b309e05b26dd962d2a084cb07e
generated: { by: codex/gpt-6, at: 2026-10-31T05:07:04Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-31T05:07:04Z }
---

# Goal

Receive valid pending rows without putting framework metadata into business JSON. Preserve the received checkpoint, store-local identity, shared UI notifications and native authored HTML. Keep wire selection and business payload projection in the application. Reuse the data and communication owners; add no generic serializer, status registry or compatibility engine.[^data][^comm][^legacy]

# Checkpoint

Start at pushed 73f5a8809356a1a3d26bff12732669a18cbdfb20 on 2.0.0-alpha.0 with a clean tree. Independent recovery matches 179 inputs, twenty-six raw logs, three manifests, sixteen latest final gates and every actual 183-file package member. Historical runtime is not rerun or recertified.[^baseline]

# Steps

1. Add one public RowState<T> interface containing readonly value: T and status: RowStatus. Add Rows.replaceState(states): void and Rows.appendState(states): readonly RowId[]. These explicitly receive metadata records; ordinary createRows/replace/append remain clean-value loaders and never infer a business property named rowStatus, status or value.
2. Validate the entire array, plain own value/status descriptor and four canonical statuses before committing. Descriptor keys are exactly value/status; reject imported IDs, extra protocol keys and malformed/sparse records with a short row-indexed error. Clone/deep-freeze business values using the existing JSON rules. Allocate no committed IDs, change no caches/order and emit no event until preparation succeeds. Reentrant store mutation or disposal invalidates the outer preparation while preserving the inner effect.
3. Capture received value AND status as a private checkpoint for explicit state loads. Ordinary clean loaders/add/copy retain existing semantics. Imported pending updates stay pending when local edits return to the received value. Imported delete remains uneditable; reverting it returns the received delete state. Imported insert stays insert during edits and reverts to its received value while present; removing it still physically drops it. Ordinary add/copy inserts still disappear on revert. Copying an imported live row creates an ordinary inserted copy.
4. Public original() remains undefined for every inserted row, including checkpointed inserts. Other loaded states expose their received immutable value. Never infer a pre-receive original or field-change history; imported update alone marks no field changed from the received value. Existing changes() continues original-valued deletion payloads, while get(id).value retains the last committed deletion display. Revert of an unchanged checkpoint notifies changed:false without replacing snapshots/caches.
5. Reuse replace and append events so Form/Grid/List/Tree and CVC listeners follow their existing reset/preserve rules. Full state replacement assigns fresh monotonic IDs and emits one replace even for an empty input. State append preserves existing IDs/changes, returns frozen new IDs, emits one append for a nonempty batch and is silent for an empty batch. Subscriber failures remain post-commit and preserve delivery to later live subscribers.
6. Permit retained deleted rows as before targets in add/move/copy by checking existence. Keep move/copy source rows editable. Reuse full Map ordering and no-op successor detection; do not add an ordering engine. Update authored first-position recipes to use the first retained entry so leading/all-deleted states preserve exact order after revert.
7. Share the actual preparation/commit logic of clean and state loaders within createRows where behavior matches. Preserve original method APIs, errors and cancellation/reentry guarantees; explicitly require arrays under the existing documented contract. Add no public utility or parallel metadata arrays.
8. Supply an application-owned example that removes legacy rowStatus, chooses canonical metadata and projects business keys for requests. Default modern delete projection uses change.value; explicit legacy current-value deletion uses rows.get(change.id).value. Never spread RowSnapshot into a payload or send RowId accidentally. Keep scalar-versus-array selection, HTTP method, GET query encoding and response decoding explicit through existing APIs/URLSearchParams.
9. Extend the current Grid demo and installed JS/TS consumers. Test all statuses, checkpoint versus ordinary insert behavior, invalid late records, getters/reentry, original/cache/event ownership, leading/all-deleted ordering, shared UI replacement/append and loaded tombstone protections. Test the application wire request/cancellation with the existing communicator; do not add transport policy to Rows.
10. Independently review connected code/tests/examples/docs. Run strict source/example types, meaningful units, full Chromium/Firefox/WebKit, the same actual tar in isolated JS/TS and five Windows browsers, unchanged binding/viewport budgets and changed/full OKF checks. Update draft API/index/log/fingerprints together and retain development failures.

# Contract

~~~ts
const rows = createRows<Employee>();
rows.replaceState([
  { value: { employeeNo: "A", name: "Ada" }, status: "clean" },
  { value: { employeeNo: "B", name: "Received revision" }, status: "update" },
  { value: { employeeNo: "C", name: "Received removal" }, status: "delete" }
]);
const [id] = rows.appendState([{ value: { employeeNo: "D", name: "Pending" }, status: "insert" }]);
rows.set(id, "name", "Local edit");
rows.revert(id); // Received Pending value and insert status remain.
const before = rows.entries({ includeDeleted: true })[0]?.id;
rows.add({ employeeNo: "E", name: "New local row" }, before);

const payload = rows.changes().map(change => ({
  employeeNo: change.value.employeeNo,
  name: change.value.name,
  rowStatus: change.status
}));
await communicator.request({ url: "employees", method: "POST", json: payload, signal });
~~~

Clean status is explicit in RowState. Legacy missing flags can become clean in application mapping; malformed flags require an explicit application decision. No rowStatus is read, removed or normalized by the data core. A received pending row's checkpoint is the received state, not an invented earlier server state.

# Next action

Selected implementation and verification are complete. Plan Form row-local typed Select binding through existing row-option/Select/native field owners. Current Form stringifies choices while Grid/List preserve raw option maps, and the detail example manually renders nested shift choices before Form; use those concrete callers to bound the next plan. General data-value/schema equivalence, other UI/CVC parity, global defaults/hooks, unvalidated paste, P0 and M13 remain required. No full-family closure or omission is inferred.

# Decisions

- The continued-work request authorizes this bounded stage. Both full replacement and progressive append already receive flagged rows in v1, so both explicit entry points have actual callers.
- No optional prior-original field is added: v1 did not provide it, and a status flag cannot reconstruct a pre-receive value.
- Checkpoint status preservation follows v1's received-object reversion. Ordinary add/copy cancellation remains the previously approved modern contract; callers needing a resettable pending insert can explicitly appendState an insert.
- No automatic wire converter, first-row truncation, implicit request method or custom query escaping is introduced. Application projection uses plain objects and standard request/query APIs.
- No new user-facing omission, full Grid/Core/UI family closure or parent completion is inferred. General schema/value equivalence and remaining owners stay open.
- Root Apache-2.0 and v1 LGPL remain separate. Preserve master, original fixtures and ignored legacy lockfile. Work/pushes stay on 2.0.0-alpha.0; npm publication and tags remain deferred.

# Verification log

Independent baseline recovery, pre-implementation design review and connected Ponytail source/test/example/consumer/document reviews pass. A sparse array with an inherited index was initially accepted; an own-slot check and both state/plain loader regressions now reject it.[^runtime][^current-acceptance]

All sixteen final gates share 180 frozen inputs: build/strict source/example types, 136 units, 586 full cases per required engine and identical-package JS/TS/five-browser consumers. The 183-file tar is 305404/1518453 packed/unpacked bytes, SHA-256 489521f17da4f0837dd44e3fd83b2cac5461764d019ec751920c50b0cc576728. All actual archive members and sizes match the workspace.

Unchanged nine binding/twenty-one viewport budgets pass. Independent review recomputes sixty medians from three hundred durations, 105 live geometry checkpoints, 300 scroll windows, fifteen append/quiet-disposal samples and physical maxima 14/14/24. No universal speed or actual-token saving is claimed.

[The receipt](evidence/m52-verification.json) retains 28 command records, development attempts, exact source manifests and 12 new browser/nine unit witnesses. Extra captured Rows logs retain raw bytes separately; initial unit failure/rerun outputs were chat-only and are explicitly disclosed without reconstruction. The first Chromium demo witness used incorrect authored controls; its failed raw log remains and the corrected unchanged suites pass. Standalone test-file typing retains two pre-existing intentionally invalid negative inputs; final strict source/example gates pass.

Seven reviewed semantic concepts receive verified metadata. 24 historical concepts retain bodies and generated/verified dates with fingerprint-only updates. Changed/full OKF checks pass with 69 concepts, five reserved files and zero errors/warnings. Six inherited evidence/coverage parents, original fixtures, v1, the legacy lockfile and master remain unchanged. No publication, release tag or omission.

# Open questions

Manual assistive technology, final fixed-agent/token comparison and whole-code M13 review remain unverified. Actual macOS/iOS Safari is excluded; available WebKit is mandatory. Arbitrary legacy status strings/non-JSON values are not silently accepted by the typed state boundary.

[^previous]: Completed shared-rule continuation
[^baseline]: Preserved 73f5a88 source and runtime evidence
[^data]: Existing identity, immutable values, changes and batch ownership
[^comm]: Explicit request method, JSON body, decoding and cancellation
[^legacy]: Incoming rowStatus, received-value reversion and raw ordering
[^legacy-comm]: Legacy first-row or array JSON transmission
[^acceptance]: Retained incoming-state, wire and tombstone-anchor obligations

[^current-acceptance]: Selected state, checkpoint, ordering and wire witnesses
[^runtime]: Frozen M5.2 source, raw gates, artifact and measurements
