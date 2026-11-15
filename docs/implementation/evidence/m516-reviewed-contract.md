# M5.16 revised contract: entered creation and complete checkpoint restoration

Status: cache-only contract for independent review before any cache implementation. No source, test, documentation or runtime change is approved by this file. The authorized batch order stays unchanged. Fixed M5.16 predecessors are M5.15 and M5.14; save the actual accepted predecessor before writing the implementation plan. Only O01-O05 are approved exclusions.

## 1. Actual missing outcomes and minimum owners

The actual v1 Form.add extracts current native inputs; an autoUnbind detail instead starts from construction capture. Form.revert deletes all current row keys and restores the selection/creation snapshot. Loaded-row remove preserves the visible detail; inserted-row remove physically drops it and restores captured UI. These are separate required outcomes, not aliases for received Rows.revert.

Current Rows Form.read returns committed marked paths. validate may write valid drafts into the old row. Current localFieldValue changes retained raw/shown/invalid state. None can be called unchanged to implement a pure entered creation probe. Current setMany merges fields and refuses deleted rows, so it cannot atomically remove later-added keys and restore a deleted row to an application checkpoint while retaining its identity/original/order.

The proposed public delta is therefore two methods on existing owners, with no new named public type, option registry, data store or generic factory:

```ts
// Existing FormHandle<T>:
prepare(): ValidationResult & { readonly values: Record<string, unknown> | null };

// Existing Rows<T>; Snapshot<T> is the existing readonly snapshot type:
restore(id: RowId, value: T | Snapshot<T>): void;
```

prepare only reads/parses/checks native fields. Rows.restore performs one complete row-value restoration with existing metadata ownership. App code supplies a complete Employee, chooses insertion/reset policy and owns one immutable selection checkpoint. Loaded-deletion display uses the current Form renderer and native owners, not a second Form/Rows instance, an application field renderer or a JSON panel.

## 2. Values keep distinct owners

| Value | Owner |
|---|---|
| Current native reset defaults | Native defaultValue/defaultChecked/defaultSelected and the actual uncanceled native reset |
| Creation/restoration capture | Existing defaults/unbind adoption capture, including preconstruction presets |
| Current entered candidate | Actual native state, or the original raw value of the version still displayed unchanged |
| Committed data | Existing immutable Rows snapshots and row-bound Form.read |
| Received value/status | Existing Rows.original/revert and state-load checkpoint |
| Selection/creation checkpoint | One application `{id, value: row.value}` reference to an immutable complete snapshot |

No preparation can undo an input event that already committed before the call. Its no-write guarantee covers its own work; explicit parser/rule/native-getter/application actions retain their side effects and are never rolled back.

## 3. Exact prepare result and native boundary

- valid is true exactly when values is non-null and issues is empty. Invalid parse/native/rule input returns valid:false, values:null and collected existing ValidationIssue records. No partial successful field record is returned.
- values is a detached, mutable field-only record assembled with existing safe nested paths. It is not T, a full business row, a source schema, an insertion or a recursive JSON validator. Application factories supply hidden business fields and Rows-compatible representations.
- Include compiled native input/select/textarea fields, root native controls, hidden/disabled/readonly controls and static/generated groups, including zero-input generated groups. Exclude button, image and display-only/render-only fields. A local file field contributes its existing filename representation, not File/FileList/FormData.
- Preflight duplicate/ancestor-conflicting native paths before calling getters/parsers. Reuse the existing native-default path rule; do not invent a public path utility.
- Check every included field, but do not publish errors, clear issues/drafts, commit Rows, change automatic/bound state, move focus/caret, flush resets or call formatter/renderer/value/whole binding callbacks. Issues can reference the actual field element so the caller can report/focus deliberately.
- Parsed results may contain cloneable values outside the Rows JSON domain. The application factory still validates/converts those values before insertion. No JSON.stringify/parse clone or generic serializer is added.

## 4. Pure observation, raw/display versions and parsing

Use the compiled Field graph. Add a read-only observation branch beside localFieldValue; leave its existing mutating callers intact. For a local retained field, compare actual native state to retained shown without assigning raw, shown or invalid. A direct differing value becomes entered input only in the temporary candidate.

Rows Forms need one small per-native-Field last-successful projection record: association ID, original raw value and native shown token. This record describes the value actually written, not the newest pending ValueProjection or newest Rows value. Reuse raw only when the association and native token still match, there is no current draft/accepted native edit/reset supersession, raw is not undefined and current owned native membership remains valid. Missing raw falls back to the actual native input representation.

An unchanged reused Rows raw value is already parsed: do not run its parser again. This prevents non-idempotent parsers from transforming committed values twice. Actual entered fields, local fields and unbound/restored native fields run their captured parser once in compiled order. Parser contexts have rowId:null and one coherent preparse native-only record; validators see the complete parsed native-only record. This deliberately does not promise unbound business properties in rule context. Context values retain the existing readonly callback contract; no new deep-freeze engine is introduced.

An accepted input/change invalidates reuse even when its text equals former shown text. Preserve existing ignored disabled/readonly/paused event behavior; those ignored events must not secretly change cache or commit state. Direct property differences are entered data. An unobserved same-value assignment is indistinguishable from unchanged native state and does not itself invalidate reuse.

Capture/replace the native record only after a current successful native write. Cover writeValue, focus-in raw exposure and direct blur formatting. A focused field whose source update was deferred retains the older raw that its current native value represents. Do not replace it with a newer raw that never reached the control. Unbind invalidates old-row records. Compatible rescan keeps the correct record; retirement removes it. Live group apply/rollback refreshes/restores this record within the existing M5.14 transaction, with newer work still winning. Do not create another publication engine.

Tokens are field-specific. Scalars use native value/checked state. Multiple controls/groups compare ordered member identities and selected states/values. Row-local Select compares owned selected option occurrences and mapped raw values; select.value alone cannot distinguish number1 from string"1", duplicate strings or -0 from0. Unknown selected options or changed owned selection metadata cannot qualify as an unchanged projection. An untouched stored disabled code can be read as its original raw; a newly selected disabled/unmapped code is ordinary candidate invalidity. Availability comes from the current owned raw catalog, not a business data-options property absent from the returned field record.

Validation uses detached native probes and current effective disabled/custom-validity/required policy without mutating real controls. An unchanged formatted raw fills the probe with raw rather than commas/uppercase display. Reuse existing native/group/rule owners; do not add an inverse formatter or replay display callbacks.

## 5. Completed resets, lifetime and error rules

Pure observation must not call localValues, read, validate or flushLocalResets. Inspect existing pending reset events without deleting records, clearing the timer, changing retained state or repainting. A completed uncanceled trusted local reset makes affected fields use their current native values, even if those equal old shown. A canceled or still-dispatching reset does not fabricate future default values. A later queued cleanup is a separate existing operation. Rows/unbound/paused/synthetic reset behavior stays under its current owner.

prepare is synchronous and adds no AbortSignal option. Page callers check their existing signal before business work; disposal/callback reentry can supersede this call. Enter with existing active/structural checks, then an owner-local preparation guard. Existing FORM_DISPOSED/FORM_RESCAN precedence stays. Recursive preparation or incompatible in-progress owner work uses FORM_PREPARE with phase reentry/busy. Normal method extraction uses closures; no this receiver is required.

Snapshot the association, Field graph, render/native/cache/reset observation and Rows committed-entry identities. Check after native reads and parser/rule callbacks, and recheck observed native values before return. Actual disposal uses FORM_DISPOSED; rebind/unbind/rescan/render/reset/source/native supersession uses FORM_PREPARE phase stale. Guard cleanup always releases preparation state. No stale success is allowed, and application inner work is not undone. Stable native getters are required; this is a synchronous observation, not an atomic transaction over arbitrary hostile DOM accessors.

Captured parser functions are invoked plainly, consistent with current candidates. Parser throw/undefined remains a parse issue, except this owner's lifetime/reentry/structural guards retain their coded error. Promise/thenable parser results are drained and rejected as FORM_PREPARE phase parse rather than returned/awaited. Uncloneable successful values use FORM_PREPARE phase clone with cause. Existing RULE_FAILED errors/receiver policy remain unchanged; M5.18 still owns its broader rule/call.run decisions. An inner guard caught by application code does not cancel an otherwise unchanged outer call; observable supersession still does.

## 6. Rows.restore: complete value, unchanged received ownership

restore validates an existing retained ID and clones the complete supplied value before its own mutation or notification. It accepts T or its existing immutable Snapshot<T>, allowing an application to keep the exact row.value reference without casts or another mutable store. It replaces own row content, including removing fields absent from the supplied checkpoint. It does not merge, change framework RowId/order, replace the received original, reset history from an arbitrary status string or infer business status fields. Business fields, including a property named id, are copied exactly from the supplied complete value; the framework neither invents nor remaps business identities.

When a received original exists, recompute dirty keys over the union of its own keys and the supplied value's own keys. Compare own-key presence as well as values, using own values only: a missing __proto__ property must not compare as inherited Object.prototype against a supplied own empty object. Apply the same presence rule to effective-change/no-op decisions. Ordinary inserts receive no invented original or dirty baseline. Preserve the received checkpoint and derive status as follows:

| Before/received owner | Result after complete supplied value |
|---|---|
| Ordinary clean/update; received clean | clean when equal to received original including keys; update when different |
| Ordinary insert | insert; original remains undefined |
| Received pending insert | insert; original() remains undefined; received reset checkpoint stays |
| Received pending update | update even when equal to the received value; no earlier clean original is invented |
| Locally deleted ordinary/received-clean row | clean/update from original comparison; local deletion clears |
| Locally deleted received-update row | update; local deletion clears |
| Received pending delete | delete; received deletion remains authoritative; original delete payload stays the received value |
| Physically removed ordinary/received insert or any missing ID | ROW_MISSING; do not resurrect a missing row |

For a received delete, restore can reset its retained display to an application checkpoint but does not turn it into live editable data. Existing revert still returns to the received delete value/status. A different authoritative server state belongs to explicit state loading, not an arbitrary restore-status parameter. Do not reuse RowState as though application selection resets establish new received originals.

Effective value/status change publishes exactly one existing set event after the complete commit. Equal value and unchanged status is silent and preserves snapshots/caches. A status-only revival is a change. Other rows, order, received originals and checkpoints stay unchanged. Invalid input/getter reentry/disposal obey the existing Rows clone/revision/atomic-before-commit policy, under Rows.restore with existing ROW_VALUE/ROW_MISSING/ROWS_DISPOSED codes. Subscriber failure is post-commit and does not justify retry/rollback.

Full-field-removal proof is mandatory: capture a complete value without an optional business field, add that field, mark the row deleted, restore the earlier value once, then verify the field is absent, the same RowId/order/original remain and one observer sees the final value/status only. setMany cannot provide that result; revert followed by setMany both exposes intermediate state and cannot remove arbitrary later keys.

## 7. Deleted detail: retain the existing Form owner

Extend existing Form binding semantics to a retained deleted row. A current loaded row becoming deleted keeps its association/display; explicit bind(retainedDeletedId) uses the same path. Missing rows still clear/reject as before. Render/read the last committed retained value, including the same formatters, renderers, groups and typed option labels. Do not substitute the received deletion payload for display.

Keep the same compiled fields and one renderer. Lock only the Form-owned native fields through disabled flags captured at preview entry; preserve parent-fieldset policy. Do not use inert: it would also remove this visible detail from the accessibility tree. Reuse data-row-status="delete" for the current preview marker and restore the root's prior attribute on exit. Native/input/focus/commit paths must not edit or reconcile deleted source; clear only that deleted row's drafts/issues. read remains a marked committed-value read. Default validate skips this read-only preview while retaining other live-row draft checks; explicit validate(deletedId) retains the existing unavailable-row error. prepare rejects the preview with FORM_PREPARE phase preview; defaults remains available for captured creation.

The private preview owner restores captured native disabled flags/root marker on active rebind, bind(null), unbind, disposal and row revival. While previewed it owns those direct disabled flags; application parent-fieldset policies remain external. Newly adopted/replaced members join the same lock; retired/rolled-back members restore correctly through existing rescan/group transactions. No independent native scan/observer/store is added. A failed bind/formatter must not leave unlocked deleted controls or leak locks into another owner.

Keep details readable and focus usable: application Restore/Save/Close controls stay outside locked fields and announce deletion in an authored live status. If a currently focused native field is locked by external removal, a named container Form root can receive focus through an owned temporary tabindex; restore that attribute on exit and do not steal unrelated focus. A native single-control root has no separate container target: its application command routes focus before deletion; do not mutate/focus an arbitrary ancestor. Reuse authored labels; no theme or fixed repeated IDs are required.

Rows preview reset ownership is narrowly scoped. Current resetOwners admission is local-only; while a Rows Form has an active deleted preview, acquire the native form owners of its compiled fields through that same owner set/listener and pendingResets/timer. Release those preview listeners/work when the preview exits; rescan/group replacement updates them through the existing ownership transaction. Do not turn ordinary active Rows binding into local-reset mode or call renderLocal/reconcile/Rows writers.

At reset dispatch, observe only the existing trusted, correctly targeted native reset event; do not repaint before its default action or prevent a whole shared form's reset merely to protect a subset of fields. Preserve the existing M5.14 publication-time cancellation first. An uncanceled default action may temporarily change disabled native values too. After completion, the existing queued reset pass restores only the current preview fields affected by those native owners, using their current last-successful shown projection and the existing native/choice restoration primitives. Keep locks and restore exact typed option occurrences; do not rerun formatters/value/whole callbacks, recapture construction defaults, reconcile drafts or write Rows just to repaint. This is an extension of the existing reset/restoration owner, not another reset queue/renderer.

A canceled trusted reset performs no preview repaint; a synthetic reset event has no native default and is ignored. During a still-dispatching event, read remains committed-source access and prepare still rejects a deleted preview, so transient native defaults cannot become creation data. Use the current preview association, Field graph and successful projection: never repaint an old preview over rebind/unbind/dispose/newer source or catalog work. A missing/failed current projection is not guessed from stale tokens; preserve the lock and report the existing Form render/bind error for explicit retry. A later successful restore publication or explicit rebind discards old preview tokens before projecting the current owner. The application reset's unbind/bind also invalidates them after a silent no-op restore. Reset cleanup does not alter received/selection checkpoints or native default properties.

Actual M4 coordination is small and required. Store one deleted-preview RowId before remove; Grid's resulting onSelect(null) must not erase that retained preview. Selecting another live row or explicit clear retires it. Restore uses the current application checkpoint and then selects/binds the revived ID; Save includes the existing received delete payload without live validation of the preview. Inserted removal has no retained ID: explicitly unbind to restore construction capture. Page disposal releases the same Form/Rows/UI owners. No deletion editing mode is added.

## 8. Representative authored HTML and application code

```html
<output data-role="selected" aria-live="polite"></output>
<form data-role="detail" aria-label="Employee details" novalidate>
  <label>Name <input data-field="name" required></label>
  <label>Salary <input data-field="salary" data-format='[["commas"]]'></label>
  <label>Choice <select data-field="chosen" data-options="a"
    data-option-label="aa" data-option-value="bb"></select></label>
</form>
<button type="button" data-action="revert">Restore selection</button>
<button type="button" data-action="save">Save changes</button>
<output data-role="status" aria-live="polite"></output>
```

```ts
// This application checkpoint is captured only from a live selection.
// A received-delete checkpoint stays read-only and is not revived/reselected here.
let checkpoint: { id: RowId; value: Snapshot<Employee> } | null = null;
let deletedPreview: RowId | null = null;
function remember(id: RowId) {
  const row = rows.get(id);
  if (row && row.status !== "delete") checkpoint = { id, value: row.value };
}
function addFromEntered() {
  context.signal.throwIfAborted();
  const prepared = detail.prepare();
  if (prepared.values === null) { reportCandidate(prepared.issues); return; }
  const value = completeEmployee(prepared.values, nextBusinessId(), currentChoices());
  const before = rows.entries({ includeDeleted: true })[0]?.id;
  const id = rows.add(value, before); // One insertion; no append-then-move.
  deletedPreview = null;
  showRow(id); remember(id);
}
function resetSelection() {
  if (!checkpoint) return;
  rows.restore(checkpoint.id, checkpoint.value);
  deletedPreview = null;
  detail.unbind(); // Clears only this current row's draft, including a no-op reset.
  const alreadySelected = grid.selected() === checkpoint.id;
  showRow(checkpoint.id); // Changed selection invokes this app's onSelect -> detail.bind once.
  if (alreadySelected) detail.bind(checkpoint.id); // Same selection is a Grid no-op after unbind.
}
```

The resetSelection recipe applies only to the still-present checkpoint captured by remember from a live row. Its received owner cannot become an authoritative received-delete under the same RowId; a received-delete API case remains a read-only preview without this showRow/selection route. showRow only calls Grid selection after view/reveal work: the changed-selection callback binds detail, and the already-selected branch above supplies the one otherwise-missing bind. Do not add a second unconditional bind or change unrelated showRow callers.

Default creation separately uses completeEmployee(detail.defaults(), ...); caller overlays and business validation are explicit. Actual application code resolves top/index/end to a stable full-store RowId, including deleted anchors. The factory returns Employee; no Record-to-T cast is allowed. A published add/restore subscriber or later bind failure remains committed; do not blindly retry or remove the row as rollback.

## 9. Bounded witness map before stage implementation

| Group | Required proof |
|---|---|
| P01 raw/native | Noninvertible formatted/value-callback display, original scalar types, reused raw skips parser, actual edits parse once, coherent preparse and parsed contexts |
| P02 typed occurrence | number1/string"1"/false/null, exact selected occurrences, unchanged stored disabled versus new disabled/unmapped selection |
| P03 actual version | Equal-projection accepted input, direct property edit, focused deferred source update, focus/blur writes, unbind, compatible/retired rescan and group apply/rollback |
| P04 no-write | Invalid plus valid sibling, success, existing errors/drafts/binding/automatic/focus/caret/cache/second Form preserved; root/hidden/disabled/readonly/groups/files native-only output |
| P05 resets | Trusted completed, canceled, dispatching, paused and synthetic native resets; no flush/timer/error/formatter work from prepare |
| P06 failure | Parser throw/undefined/thenable/clone failure, recursion, native getter, disposal/rebind/rescan/source/reset supersession and valid retry; existing rule error policy retained |
| R01 restore matrix | Every status row above, full optional-key removal, own-versus-missing __proto__ empty-object presence, exact supplied business id versus stable framework RowId, missing removed insert, original/order, single coherent event, no-op caches, atomic failure and post-commit subscriber error |
| C01 create | Captured defaults versus entered factory, overlay, complete business/nested/typed values, top/index/end/deleted anchor, one add event and old-row/draft preservation |
| C02 reset | Loaded selection point after prior edits, ordinary/received insert retained, no-op reset clears this draft, other-row drafts untouched, received revert distinct |
| C03 deletion | Actual retained detail/typed labels, no native edits/live validation, trusted/completed/canceled/synthetic preview reset with no source writes, lock/focus restoration, changed-versus-same selection binds once, Grid deselection coordination, inserted removal capture, authoritative received-delete remains read-only, valid revival/Page cleanup |
| I01 installed | Actual JS/TS/packed-browser prepare/factory/restore/preview flow; no fabricated Employee type, no workspace-only package credit |

Re-use named existing defaults/local/discovery/binding/value/Rows tests instead of copying their complete matrices. Counts are proposals and must be derived from the eventual frozen fixtures. Preserve original browser/performance/archive/docs gates, independent source/raw/body review and separate stage save. M5.17 callback/receiver/global ordering, M5.18 rule catalogs, M5.19 row controls and M5.20 whole acceptance remain open; none of the required M5.16 creation/reset/deleted-detail outcomes is deferred by this contract.
