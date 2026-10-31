---
type: Plan
title: Natural-JS 2.0 M10.9.4 status and row lifecycle
description: Preserve row identity through explicit status views, authored defaults, row cleanup, clean batch append and empty markup.
tags: [plan, grid, data, lifecycle, accessibility]
status: draft
sources:
  - id: parent
    resource: m10-parity-plan.md
    title: Required Grid continuation
    git_blob: 4fb60ba17d16e5f2f52bc91797e619df1642114f
  - id: data
    resource: ../../src/data/index.ts
    title: Shared snapshots, tombstones and atomic notification
    git_blob: 38faf810b59fecebd9e0d0e7ee8a935b480bcecd
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Compiled record binding and view ownership
    git_blob: 567439878a74284e7a1f60c6898d636322c190e5
  - id: body
    resource: ../../src/ui/grid-row-blocks.ts
    title: Authored record blocks and native merging
    git_blob: 71d2218d3cf773d875bb423f8a324d5db70077ab
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Legacy row handlers, defaults, append and empty binding
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: hooks
    resource: ../../src/ui/grid-hooks.ts
    title: Private synchronous row resources and cleanup
    git_blob: 628b69014fd77f0f18e5e8c84d2953c1a9401bb9
  - id: browser
    resource: ../../tests/browser/grid-lifecycle.spec.ts
    title: Status, defaults, binding failure, append, focus and empty-state acceptance
    git_blob: 08db552a81aa4efa98268ec803e4d4116ba2ec0d
  - id: units
    resource: ../../tests/grid-hooks.test.ts
    title: Owned resource ordering, sync-only boundaries and failure release
    git_blob: e0ded96c9b2e34e4d841d607ca52c9a8fc287a0e
  - id: benchmark
    resource: ../../tools/benchmark-grid-viewport.mjs
    title: Original viewport fixtures with final clean-append measurements
    git_blob: 7370923a46bd5960e8803319da24777f1128262c
  - id: demo
    resource: ../../examples/vite/m10/demo.ts
    title: Working Grid controls, statuses, callbacks and native-default factory
    git_blob: c026da7f07812031e363e604265f74b7afbf6640
  - id: evidence
    resource: evidence/m1094-verification.json
    title: Frozen commands, source identities, exact artifact and measurements
    git_blob: ef79ce7025d396d253b470c005d00ae72b19f434
generated: { by: codex/gpt-6, at: 2026-10-24T05:58:18Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-24T05:58:18Z }
---

# Goal and baseline

Complete this slice's G01/G07/G19/G20 responsibilities without replacing CVC, caller-owned Rows, compiled HTML fields, row blocks or bounded viewport rendering. Preserve remaining option/dynamic obligations; no feature omission is approved. Business factories, loaders, counters and visual design remain application-owned.[^parent][^legacy]

Before implementation, a separate read-only audit matched M10.9.3's 155 normalized sources, 42 byte-exact raw logs, sixteen final gates and exact cached 168-member artifact. It did not rerun or recertify those historical results. Work stays on 2.0.0-alpha.0; master/v1, npm publication and release tags remain outside this task.

# Public contracts before code

```ts
const rows = createRows<Employee>(initialEmployees);
const grid = bindGrid(table, {
  rows, statusFilter: ["clean", "insert", "update", "delete"],
  beforeRowBind(context) {
    // All physical rows are attached to their table, before owned field values.
    context.elements[0].dataset.applicationKey = String(context.row.id);
  },
  onRowBind(context) {
    const stop = connectApplicationWidget(context.elements, context.row);
    context.own(stop); // Same explicit ownership convention as CVC, synchronous here.
  },
  onBind(result) { updateAuthoredCounter(result.filtered, result.visible); }
});
rows.append(fetchedEmployees); // Loaded clean rows; one atomic notification.
grid.setStatusFilter(["insert", "update", "delete"]);
const defaults = grid.defaults();
rows.add(applicationEmployeeFactory(defaults)); // The factory returns a complete Employee.
grid.refresh(); // Explicit binding retry/re-evaluation; preserve Rows and local drafts.
```

## Shared loaded rows

- Extend entries(options?: { includeDeleted?: boolean }); omission preserves the live-only frozen array and cache behavior. Explicit inclusion returns all retained snapshots in Map order through a separate cache. Snapshot objects are shared; no copied row state or generic query API is introduced.
- append(values: readonly T[]): readonly RowId[] creates clean loaded rows, like replace rather than add. Clone and validate the complete batch and revision before allocating IDs or changing state. Empty append is silent and preserves caches. Return frozen IDs and emit one frozen append event with those IDs; existing snapshots, dirty rows, tombstones and order remain unchanged. Subscriber failures propagate after commit and after later subscribers receive the batch.
- Preserve the existing 2.0 removal contract: original-row deletion exposes its original snapshot; deletion payloads use original values, and revert restores clean originals. Inserted-row removal is physical. The 1.x edited-deletion display difference remains an explicit P0 semantic obligation, not an approved omission or a silent change to the data contract.
- Form ignores append notifications for its already-bound row, as it ignores move. List/Tree and default store consumers continue excluding tombstones. Tree business-key/hierarchy validity remains application-owned.[^data]

## Status projection and protection

- Add statusFilter?: readonly RowStatus[], statusFilter() and setStatusFilter(values). Default is clean/insert/update. Validate finite known statuses, canonicalize duplicates/order without changing row order, freeze returned state and preserve it on invalid input. Empty means no rows. A no-op setter preserves view/focus/caches.
- Apply status projection before the current manual/column filters, sort and page. Column choice counts use the same status projection; selection/check/store scopes keep their existing live-row eligibility. Include deleted rows only when explicitly requested.
- Every physical tr receives data-row-status; the table receives data-changed="true" or "false" for pending Rows changes. CSS and human-readable status text remain authored. Restore the table's original attribute on disposal. Per-field dirty presentation remains a separately tracked legacy semantic obligation.
- Deleted rows display the store's retained original snapshot, disable native field editing, stay ineligible for selection/checks/validation, and expose their stable ID to authored row actions such as Undo. Revert does not silently restore selection/check membership. Split adjacent merges at differing row statuses.
- Deleted rows inside a pasted rectangle consume protected logical row positions without writes; do not shift later lines. A deleted start target fails. Apply identical protection to mounted and offscreen rows.[^grid][^body]

## Native defaults and creation boundary

- defaults(): Record<string, unknown> reads the native input/group/Select values captured from the source at binding time and applies the existing own parser functions against one unparsed candidate. Return detached values. Number/range parsers and nested paths retain their current contract; raw static Select choices use their compiled mappings.
- Like 1.x Grid.add's actual input-only caller, display spans/images do not supply defaults. No Form instance is created for each row and no general DOM-to-object utility is exported.
- HTML cannot prove every required business property of T. Do not hide that fact behind a no-argument Grid.add and as T. The application combines these defaults with its typed factory, supplies business keys/option lists, and calls existing Rows.add. Parsing failures use GRID_DEFAULTS and leave the store/source unchanged.[^legacy][^grid]

## Binding callbacks and owned resources

- Optional beforeRowBind and onRowBind receive { row, elements, own }. row is the immutable RowSnapshot, elements is the complete readonly physical tr block, and own accepts a synchronous disposer. Before runs on rows attached to their table before native values; after runs after binding and final placement. Rows are document-connected only when the table is connected; attach a detached table before layout-dependent widget work. They run for changed mounted snapshots and remounted records, not unchanged rows. Return values do not veto binding.
- Keep ownership, invocation, cleanup and error normalization in one private Grid-specific module. Release owned resources in reverse order on rebind, virtual departure, construction failure and disposal. Continue framework cleanup after application cleanup errors. Late own calls immediately release their resource and fail instead of leaking it.
- Claim the table before the first user hook. Reject reentrant row binding and check Rows/view/column generation after callbacks; an application mutation already committed to Rows is not rolled back. Failed initialization restores authored markup and releases ownership. Failed live hooks release their resources, leave the committed store intact and allow explicit refresh retry. Errors identify GRID_BIND, GRID_BIND_REENTRANT or GRID_BIND_STALE, phase, RowId and cause.
- refresh() re-evaluates the current view and mounted field bindings while preserving RowIds, drafts and selection. It supplies the explicit retry path without another page runtime or data replacement.
- onBind receives { total, filtered, visible, mounted, event }. total counts all retained store rows, filtered counts the status/manual/column projection, visible counts the logical page and mounted counts logical mounted records. event is the replace/append event or null for initial/explicit view/refresh binding. Notify once after the completed projection, including empty results; ordinary set/add/remove/revert/move and scroll/resize do not impersonate a full bind. It is the final outward notification, so post-bind application changes cannot be overwritten by older work.
- Callbacks are synchronous; consume and reject asynchronous results. Load through existing CVC cancellation/communication, then call Rows.append only while the page is active. The old scrollPaging was progressive rendering of already loaded data, not a network loader. Keep its scheduling-option equivalence open for P0 instead of adding a second fetch/timer engine.[^legacy][^grid]

## Empty and result markup

- Toggle one authored static tr[data-empty] or tbody[data-empty] for an empty logical page. Reject repeated/nested-template markers before ownership. Preserve nodes and original hidden state on disposal. Managed cells declare their ordinary data-column/data-columns memberships so the column owner keeps their span correct.
- Keep native row counts/indexes consistent with the existing static-row contract. When hiding an empty state that owns focus, move focus to an enabled visible row control or the existing table fallback.
- Application onBind code updates authored counters/outputs. No result-template registry, translated message engine or generated themed empty HTML is needed.[^body]

# Change order and verification

1. Recheck the preceding checkpoint and actual legacy callers; write this contract before implementation.
2. Implement shared loaded append/enumeration and affected Form notification behavior; verify atomicity, no-op identity, reentrancy and subscriber failure.
3. Integrate status projection/protection, native defaults, binding cleanup and empty state through existing Grid owners. Add independent acceptance cases for shared data, multi-tr merging, paging/filtering, viewport, callback failure/disposal and exact teardown.
4. Extend the existing all-options demo and installed JS/TS/browser consumers, then update API/migration/architecture/index/log and coverage without closing P0 obligations.
5. Independently review source/contracts, freeze inputs, and run build/strict source/example types, units, complete Chromium/Firefox/WebKit, one inspected artifact installed into JS/TS and all five required Windows browsers, original binding/viewport budgets and changed/full docs. Only independently reviewed concepts receive verified metadata; historical bodies and dates remain unchanged.

Keep all current fixtures, two warmups, five samples and budgets unchanged. Before measuring, add one final 250-row clean append operation to each existing 5,000-row flat/nested/two-tr viewport scenario, after its original timed operations. The append median budget is 100ms on this host; retain unchanged old snapshots/focused draft, stable scroll anchor and the existing mounted-row limits. Do not change earlier workload sizes or assertions to fit the new operation. New hook/resource cases remain opt-in and require bounded repeated release tests. No universal speed, heap-retention or actual AI-token claim.

# Checkpoint

This slice and its independent source/API/plan/evidence/document closure are complete. Detail navigation/height, remaining component/CVC parity, P0 closure and the mandatory final M13 whole-code review/remediation remain future work. Actual Safari is excluded; available WebKit remains required. Manual assistive technology, actual OS IME/clipboard and personal acceptance remain unverified.

# Independent review and corrections

Connected source review reproduced and closed disposal during refresh restoring source ARIA and then being overwritten by rollback; forced selection/check notifications lost after row-hook failure; and a failed-view notification appending newer data that an older setter rollback then removed. Stop rollback on disposed bindings. Queue committed failure notices until projection and option rollback finish; notify once and preserve the original hook error. Successful post-bind callbacks remain final outward notifications, so their legitimate newer work is retained.[^grid][^browser]

Read merge status from current Rows rather than the field-binding snapshot cache, which explicit refresh invalidates. Capture keyboard focus before selection pruning; when a retained row disables its control, focus its visible enabled Undo/other control or the existing table fallback. Capture and restore framework deletion state before the before-row hook, preserve live native customization, and enforce deleted protection after both hook phases. Independent cases settle native focus rather than inspecting only its stale synchronous value.[^grid][^body][^browser]

Capture native default entries individually. Ambiguous/repeated paths and parent/child default conflicts fail only when defaults() is requested, so existing valid binding layouts do not fail at construction. Default parsers share one unparsed candidate; rejected asynchronous results are consumed before GRID_DEFAULTS. Registered row resources release in reverse order and on failed checkpoints; no per-row Form instance, generic plugin registry, new public alias type or runtime dependency is added.[^grid][^hooks][^units][^browser]

Development regressions also identified legitimate fixture changes: changed rows now split status-dependent merge runs while remaining clean rows still merge; a direct-cell merge retry fixture replaces invalid input with clean records rather than creating a differently marked updated row. The demo's authored empty footer adds one physical static row to its ARIA count, and its narrow result output uses the existing wrapping container. Original scenario assertions remain; these are recorded fixture preconditions, not weakened budgets or an approved feature omission.[^body][^demo][^browser]

Native control membership is classified once from compiled source nodes; cloned records reuse those positions. Independent review confirms identical node order and types. All final gates were rerun after this last source change. Earlier successful gates and their provisional artifact remain separate; no before/after speed improvement is inferred from these samples.[^grid][^evidence]

# Frozen verification

Build, strict source/example types and 120 unit tests pass, including six new Rows cases and nine private row-resource cases. The browser additions comprise thirty lifecycle cases, one shared-append case and three demo cases. Independent source review covers connected failure/disposal/reentry flows; a separate acceptance author checks actual observable behavior rather than private implementation details.[^units][^browser][^demo][^evidence]

Complete Chromium/Firefox/WebKit suites pass 347/347 each without skipped cases. Installed JS/TS and Chromium/Firefox/WebKit/installed Chrome/Edge pass the same unpublished 173-file artifact, SHA-256 db2e2769332fbdab6c12ef5a3a655f58d704c3fa7a7dd5b625de7c9a985f80ea, 278,860 packed / 1,372,956 unpacked bytes. Actual tar listing and every member match the frozen workspace. Five public entries and zero runtime dependencies remain; private helper imports are blocked.[^evidence]

Sixteen final gates share 158 normalized source/configuration fingerprints. Their original raw maps also include two ignored Vite metadata files created by an earlier source-consumer probe, giving 160 entries. The separate [cache receipt](evidence/m1094-cache-inputs.json) preserves exact bytes, hashes and contents; its optimized/chunks maps are empty, with no executable cached module. These are classified auxiliary inputs, not source files or rewritten raw records. All thirty-three command records and logs remain byte-exact, including the earlier sixteen passing provisional gates. Their provisional artifact predates the final compiled-control-index change and does not certify final source.[^evidence]

One final-candidate Chromium run passed 346 cases and failed before framework initialization when beforeEach page.goto returned net::ERR_NO_BUFFER_SPACE. The exact failed log is retained. Read-only TCP inspection did not establish the operating-system cause. With source, tests, timeouts and budgets unchanged, the complete suites were rerun sequentially and all three engines passed. This failure is recorded separately from assertion failures and final certification.[^evidence]

The unchanged binding fixtures use two warm-ups and five measured samples. For 1,000 flat rows, initial/rebind/edit/sort/filter medians are 27.2/29.5/2.0/5.2/2.8ms against unchanged 30/35/5/10/8ms budgets. Nested-auto initial/rebind/sort/filter medians are 64.8/77.8/12.8/7.5ms against 90/100/25/18ms budgets. No timing is interpreted as a universal guarantee or measured improvement over the provisional candidate.[^evidence]

The existing 5,000-row viewport fixtures keep their operations, two warm-ups, five samples and budgets. The final 250-row clean append asserts one event, unchanged prior snapshots/save changes/checks, the same focused node/draft/caret, a stable visible scroll anchor and teardown of all 5,250 rows. Medians are milliseconds; mounted bounds include cycling and append samples.[^benchmark][^evidence]

| Fixture | Initial | Reveal | Scroll | Columns | Paste | Move | Append | Dispose | Maximum physical rows |
|---|---|---|---|---|---|---|---|---|---|
| Flat | 10.4 | 65.9 | 83.0 | 49.0 | 34.2 | 62.0 | 18.6 | 22.8 | 14 |
| Nested | 13.3 | 55.9 | 83.1 | 50.0 | 34.2 | 62.1 | 12.0 | 20.2 | 14 |
| Two-tr/merged | 11.7 | 63.6 | 49.9 | 49.9 | 32.5 | 61.5 | 25.5 | 17.7 | 24 |

All original timing/DOM/ownership budgets and the new 100ms append budgets pass. These are completed DOM operations on this Windows host in Chromium, not measured JavaScript heap retention, manual accessibility acceptance or actual coding-agent token savings.[^evidence]

Work-cost observations: one private Grid-specific hook owner centralizes synchronous lifecycle/cleanup at its real caller; existing Rows cloning/revision/notification, control parsers, column/filter/selection/viewport and CVC owners are reused. No new public entry, named public type, runtime dependency, per-row Form, generic utility or registration engine is introduced. Source fields and native control positions compile once; the direct no-hook path remains. Fixed equivalent agent tasks and actual token telemetry were not run in this slice.

Independent final review reproduces all 158 source/configuration fingerprints, the exact auxiliary cache contents, all 33 raw log hashes and sixteen final passing gates, every actual archive member and sixty recomputed raw medians. Changed/full OKF checks pass with 58 concepts, five reserved files, zero errors and zero warnings. Twelve independently reviewed changed concepts receive verified metadata. Twenty-one historical concepts retain exact bodies and generated/verified dates, with fingerprint-only updates; the [history receipt](evidence/m1094-doc-history.json) records their identities. Raw [changed](evidence/m1094-docs-changed-final.log) and [full](evidence/m1094-docs-full-final.log) results preserve the final documentation check.

# Next action

Specify M10.9.5 detail/geometry from actual legacy Form/Popup navigation and height-resize callers. Define validation, cancellation, stable RowIds, focus, authored resize controls and viewport behavior before code. Reuse the same CVC runner and existing Grid/control owners. M10.9.6, other-component parity, P0 semantic/dynamic closure and the final M13 whole-code review/remediation remain required; no new omission, npm publication or release tag.

[^parent]: Required Grid continuation
[^data]: Shared snapshots, tombstones and atomic notification
[^grid]: Compiled record binding and view ownership
[^body]: Authored record blocks and native merging
[^legacy]: Legacy row handlers, defaults, append and empty binding
[^hooks]: Private synchronous row resources and cleanup
[^browser]: Status, defaults, binding failure, append, focus and empty-state acceptance
[^units]: Owned resource ordering, sync-only boundaries and failure release
[^benchmark]: Original viewport fixtures with final clean-append measurements
[^demo]: Working Grid controls, statuses, callbacks and native-default factory
[^evidence]: Frozen commands, source identities, exact artifact and measurements
