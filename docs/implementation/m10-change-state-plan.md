---
type: Plan
title: Natural-JS 2.0 M10.9.6.1 change presentation
description: Expose immutable loaded originals and bind exact committed-field changes while retaining edited deletion views and original deletion payloads.
tags: [meta, plan, grid, data, binding]
status: draft
sources:
  - id: evidence
    resource: evidence/m10961-verification.json
    title: Frozen M10.9.6.1 execution inputs, exact artifact and measured gates
    git_blob: 2fdc942c4e58c21d4f94cd705e0d93586932f97d
  - id: browser
    resource: ../../tests/browser/grid-change-state.spec.ts
    title: Independent committed-field, deletion, focus and cleanup regressions
    git_blob: be9a9ea45faeafd04a14747918668d7318d932e8
  - id: equality
    resource: ../../src/internal/same-json.ts
    title: Existing private JSON equality shared by three actual callers
    git_blob: 9468eca7481524f744722eca0c3f4a4dd69111b8
  - id: parent
    resource: m10-closure-plan.md
    title: Grid semantic closure and required continuation
    git_blob: beda7b9caadbe1204d5ad129f090f2d75dcac8dd
  - id: data
    resource: ../../src/data/index.ts
    title: Current values, immutable originals, deletion payloads and restoration
    git_blob: 8316515489ad2fda7b04bdd88bb5772abc1c6cd9
  - id: form
    resource: ../../src/ui/form.ts
    title: Rows-backed fields, drafts, formatting and restoration
    git_blob: dfc469e9c118292c41e804b80ebcc563a1c6d26c
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Compiled fields, retained tombstones and mounted ownership
    git_blob: 5f4cc1b5a2b4df9f07bc1d43d3521cb653dcb8e1
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Legacy field flags, deletion display and revert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
generated: { by: codex/gpt-6, at: 2026-10-24T10:10:43Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-24T10:10:43Z }
---

# Goal

Implement the G07 change-presentation foundation and its G01/G06/G20 interactions. Keep the RowSnapshot shape, shared data, existing original-valued deletion payload, native controls, CVC and authored design. Exact field state describes committed raw values, not formatted text or an invalid draft. Leave the rest of M10.9.6 required.[^parent][^legacy]

# Checkpoint

The parent records the independently recovered 7a36a39 baseline. At that baseline Rows.remove overwrote the current value with its original; the old Grid preserves last edits when marking a deletion. Its private dirty keys cover only top-level properties and cannot accurately mark nested siblings. An immutable original getter and the existing JSON comparison solve both without duplicating baselines in UI.

# Steps

## Public contract before code

```ts
const rows = createRows([{ profile: { name: "Ada", team: "Platform" } }]);
const id = rows.entries()[0].id;
const original = rows.original(id); // Immutable loaded value; O(1), no notification.
rows.set(id, "profile", { name: "Grace", team: "Platform" });
rows.remove(id);
rows.get(id)?.value.profile.name;       // "Grace": retained deletion display.
rows.changes()[0].value.profile.name;   // "Ada": original deletion payload.
rows.revert(id);                       // Original value and clean status.
```

- Add only Rows.original(id): Snapshot<T> | undefined. Return the same immutable loaded value through edit/move/delete/revert. Missing and inserted IDs return undefined; disposed access raises ROWS_DISPOSED with API Rows.original. Append creates loaded originals; add/copy create inserts without one. No RowSnapshot property, mutable baseline setter, public diff utility or path-query API is added.
- Rows.remove on a loaded row retains current and its private dirty set, changes status to delete and emits the existing single event. Repeated deletion is silent; inserts still disappear physically. changes().delete.value stays original; revert restores original and clears changes. Existing deleted edit/move/copy restrictions remain. This deliberately updates the unpublished 2.0 deletion display contract and needs matching API/migration/tests.
- Rows-backed Form and Grid set data-field-changed="true" or "false" on each bound logical field element. Compare the committed raw path to the loaded original. Nested siblings are independent; radio/checkbox group members share their field's state. Arrays, nested objects, selected raw values, display and images use the same JSON equality as Rows. Insert fields are false because no baseline exists; row status represents insertion. Invalid/partial drafts and formatting do not manufacture stored changes.
- Update markers even when focused-value rendering is skipped. Sorting/filtering/paging/viewport remount, column changes and a binder created after an edit must read the same data-owned baseline. Clean append and restoration clear markers. Deleted Grid fields retain last committed display/markers while editing, selection/checks/validation/paste protection and authored Undo remain intact.
- Form without Rows does not own or change this marker. For Rows-backed Form, null/stale binding clears field state; dispose restores each exact authored attribute. Grid already restores original template nodes. Keep group/input values, focus, caret, issues and resource cleanup unchanged.
- Move the existing private sameJson implementation to internal/same-json.ts, with actual Data/Form/Grid callers. Preserve Object.is, JSON array/object behavior and existing data validation. Do not import UI path parsing into Data or add a generic change registry.

## Change order and acceptance

1. Independently review the contract and complete the current 89-entry/17-group audit without changing the historical mapping.
2. Add failing data tests, implement original access and deletion retention, and extract the existing private equality operation without changing its behavior.
3. Bind raw changed-field markers in the existing Form/Grid render loops and restore owned Form attributes. Add independent browser regressions for pre-edited stores, raw formatting/invalid drafts, nested siblings/groups/Selects/images/display, shared views, tombstones, viewport and teardown.
4. Extend the all-options demo and real JS/TS/browser package consumers. Update draft API/data/Form/Grid/migration/architecture/demo concepts, indexes, log, coverage and current plan.
5. Freeze inputs and run build/strict source/example types, units, complete Chromium/Firefox/WebKit, the same inspected tarball in JS/TS and five Windows browsers, unchanged binding/viewport budgets and changed/full docs. Independently review source/API/evidence before verified stamps and authorized commit/push.

No benchmark fixture, sample count or budget is weakened. Keep ordinary clean binding direct and avoid per-row original copies or scans. Measure before adding comparison caches. No universal performance, heap retention or actual agent-token claim.

# Next action

The implementation, sixteen frozen runtime gates and independent source/API/evidence review are complete. Specify M10.9.6.2 interaction/view controls from the audit. Do not close G01-G20, the parent milestone or cross-owner behavior merely because this data contract is implemented. Keep all later work and M13 mandatory.

# Decisions

The display snapshot may retain edits after deletion while the save payload identifies the loaded original. This separates an existing user workflow from transmission policy without a second store. Raw loaded-field comparison repairs the old coarse rebind flag; native author CSS chooses its presentation.

# Verification log

The data regressions failed before implementation, then all 30 Rows tests passed. The independent 18-case change-state suite and existing lifecycle/demo tests pass together at 72/72 in Chromium, Firefox and WebKit. These development checks precede the final frozen gates; they do not certify the final artifact. The preceding baseline remains immutable historical evidence.[^browser]

The first Firefox attempt failed before page execution because its dedicated cache lacked winldd-1007/PrintDeps.exe. Restore copied the identical installed helper from the default Windows Playwright cache into node_modules/.cache/playwright-m6/winldd-1007; SHA-256 020bac54c953c65a0940b314c8afadd2854de2d83125e7b1393054fafd21f330. The failed launch record is retained, including source movement during that development attempt. Fresh focused tests pass without a host-check bypass. No package, browser revision or global cache configuration changed.

## Frozen runtime and package gates

Build, strict source/example types and all 124 unit tests pass. Full Chromium, Firefox and WebKit suites pass 402/402 each, including eighteen new change-state cases and two new demo cases. Installed JavaScript, TypeScript and Chromium/Firefox/WebKit/Chrome/Edge pass the same unpublished 183-member tarball, SHA-256 27bcaca82b1d55b8be2b4f792f76c611eea0139254df2a19f16d57a36948da3a; packed/unpacked sizes are 287463/1418798 bytes. Every actual archive member matches the frozen workspace; only the five existing entry points remain and runtime dependencies stay at zero.[^evidence]

All sixteen final gates certify the same 164 normalized source/configuration inputs. The 22 command records also retain six development attempts, including the missing-helper Firefox launch failure and its source-change observation. Two independent raw development logs preserve a Select-fixture correction and subsequent 18/18 pass without claiming recoverable source fingerprints. Earlier unsaved unit-red output is not retained as evidence. The immutable audit still has 89 surface entries, 17 dynamic groups, twenty open families and no approved omission; it describes the preceding planning baseline rather than silently closing current contracts.[^evidence]

Original benchmark fixtures, operations, five samples after two warmups and budgets are unchanged. All sixty raw medians are recomputed. Flat 1,000-row initial/rebind medians are 21.6/22.3ms against 30/35ms budgets; nested-auto initial/rebind medians are 48.3/55.5ms against 90/100ms. Flat/nested/two-tr viewport append medians are 21.3/19.6/35.5ms, with at most 14/14/24 mounted physical rows. The original 5,000-record workload, final 250-row clean append, anchors, focus, data and cleanup assertions cover 5,250 records. These are same-host measurements, not universal speed or heap-retention claims.[^evidence]

## Independent review and work cost

Independent source reviews approve Data/original/deletion/equality, Form/Grid ownership/focus/restoration, the authored demo and installed-consumer assertions. A separate review checked thirteen semantic concepts (312,600 file bytes at that review) and README (6,558 bytes) against connected source/tests; one stale phrase in data.md now says retained deleted rows. These file-byte counts are a review-input proxy, not model context or actual tokens. A separate numeric audit reproduced all 164 inputs, 22 command-log hashes, sixteen final gates, eight development-log hashes and the receipt, every actual archive member and all sixty medians. All thirty unchanged timing budgets pass; fifteen append/cleanup samples and 300 scroll cycles support the stated data/focus/anchor/DOM limits. The exact 89-entry/17-group audit and twelve baseline hashes also match. No old runtime result was rerun or recertified; changed/full OKF checks pass with 61 concepts, five reserved files, zero errors and zero warnings.[^evidence]

One public Rows method is added; RowSnapshot and the five entry points stay unchanged. The existing JSON equality moves to one private module with three actual callers. No dependency, generic diff registry, extension engine, utility package or independent UI baseline store is introduced. The existing render loops, Rows subscription, authored row actions and CVC demo are reused. Fixed equivalent-agent tasks and actual token telemetry were not rerun; no measured token-saving claim is made.

## Documentation closure

Independent source/API/plan/evidence review approves this slice. Thirteen changed semantic concepts receive verified metadata; fifteen historical concepts retain exact bodies and generated/verified dates, with source fingerprints refreshed only. Indexes and the log match the implemented contract. The separate document-history receipt and changed/full checker logs preserve this boundary. M10.9.6 remains open through .2-.4; no full-family completion, omitted feature, publication or release tag is recorded.

# Open questions

Selection toggles, filter/chooser workflows, progressive/completion semantics, status/wire import and arbitrary post-edit delegated events remain required under their own contracts. Local non-Rows Form change tracking is outside this baseline-backed contract and remains an owning Form-parity review item. No omission is approved. Actual Safari/manual assistive technology/token telemetry remain unverified; available WebKit is required.

[^parent]: Grid semantic closure and required continuation
[^data]: Current values, immutable originals, deletion payloads and restoration
[^form]: Rows-backed fields, drafts, formatting and restoration
[^grid]: Compiled fields, retained tombstones and mounted ownership
[^legacy]: Legacy field flags, deletion display and revert

[^evidence]: Frozen M10.9.6.1 execution inputs, exact artifact and measured gates
[^browser]: Independent committed-field, deletion, focus and cleanup regressions
[^equality]: Existing private JSON equality shared by three actual callers
