---
type: Plan
title: Natural-JS 2.0 M10.9 remaining Grid plan
description: Staged closure of legacy Grid behavior through ordered Rows, authored row groups, merging and existing UI owners.
tags: [plan, grid, data, migration]
status: draft
sources:
  - id: parity
    resource: feature-parity-plan.md
    title: Required feature scope and dependency order
    git_blob: f21dc30191205e687f1ab6d8e85a5fa050893a98
  - id: coverage
    resource: feature-parity.md
    title: Remaining Grid behavior families
    git_blob: 3685a8bafa18e201e2eb251508dd150e167c88d6
  - id: data
    resource: ../../src/data/index.ts
    title: Shared row identity, order and immutable changes
    git_blob: 8316515489ad2fda7b04bdd88bb5772abc1c6cd9
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid projection, drafts and mounted lifetime
    git_blob: 625fc54b599da36705208cb7ad4df45029e619c4
  - id: ordering-browser
    resource: ../../tests/browser/rows-ordering.spec.ts
    title: Shared order, draft, focus and viewport regressions
    git_blob: 3b299f6142e7409d5e2d2e5291d82edaf501a23d
  - id: units
    resource: ../../tests/rows.test.ts
    title: Ordered operations, copy independence and reentrant validation
    git_blob: 242dd382b9f75c4240823f2b7373a424a92e3dca
  - id: benchmark
    resource: ../../tools/benchmark-grid-viewport.mjs
    title: Settled viewport and identity-preserving move measurements
    git_blob: 7370923a46bd5960e8803319da24777f1128262c
  - id: evidence
    resource: evidence/m1091-verification.json
    title: Frozen M10.9.1 source, commands, artifact and results
    git_blob: f57fe98ea6c50911904075b940bc8af4edbc34d7
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Measured logical-row viewport
    git_blob: d02fbfe5407b80786733034f2f5aaaea5d71ef55
generated: { by: codex/gpt-6, at: 2026-10-24T13:51:10Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-24T13:51:10Z }
---

# Goal

Complete G01-G20 without replacing CVC, authored HTML/CSS or the small role modules. Preserve every required legacy workflow with optimized TypeScript; only the user's consolidated omission decision can retire behavior. Work stays on 2.0.0-alpha.0, with master/v1 untouched and npm publication deferred.[^parity][^coverage]

# Checkpoint

M10.8 is pushed at 96b4295. Its immutable record preserves 95 units, 242 full cases in each required engine, five installed-browser consumers of the same 153-file artifact, and passing binding/viewport budgets. The preceding checkpoint was rechecked without recertifying it: all sixteen log hashes and the exact tarball match; thirteen archived target-source raw hashes and HEAD-normalized content match. HEAD newline variants plus archived source reproduce twenty-one of twenty-eight historical source hashes; seven excluded mixed-newline fixture/helper originals are unavailable and are not counted as reproduced. New gates use explicit UTF-8 CRLF-to-LF source fingerprints, with byte-exact log/archive hashes, to make subsequent resumption portable. Historical records remain unchanged; fresh gates certify this slice.

M10.9.1 completed the shared ordered-row foundation. M10.9.2 implements an authored tr group as one indivisible RowId for binding/measurement, together with adjacent repeated-value merging, column topology, focus, spacers and native table indices. Equal-value runs may exceed the viewport; merging stays inside consecutive mounted/page boundaries. Its contract and gates are in [the row-block plan](m10-row-blocks-plan.md). M10.9.3 adds native/group values, typed array paste, explicit display, exclusive checks and validation timing/reveal; [its plan](m10-controls-plan.md) records the shared private responsibilities, independent corrections and frozen gates. Later slices remain required.[^grid][^viewport][^parity]

# Steps

| Slice | Work and owner | Completion boundary |
|---|---|---|
| M10.9.1 Ordered shared rows — verified | Data-owned insertion, move and independent copy. Grid/List/Form/Tree consume the same store order and stable identities. Preserve selection/check order, drafts, issues, focused nodes and caret/composition; extend the existing Grid demo. | Invalid calls change nothing; successful operations notify once; no-ops preserve caches; nested copies are independent; sort/filter/page/viewport and shared UI remain correct. This closes the ordered-operation foundation of G02/U07, not their entire feature families. |
| M10.9.2 Authored row blocks and merging | Plan one logical RowId across multiple authored tr elements and adjacent data-driven merging with explicit window/page continuation. Keep fields/columns/ARIA/focus/viewport consistent without mounting an unbounded equal-value run. | Two different authored layouts, grouped headers/footers, native row/column spans, split/merge after edits and sorting/filtering/paging, offscreen paste/validation, bounded viewport and teardown. No copied header or flattened business data. |
| M10.9.3 Controls, display and validation interaction | Complete Grid-native/group input coverage with the Form-owned semantics, consistent programmatic length constraints, explicit image/custom display, exclusive checks and validation reveal/keyboard behavior. | Stored/raw/display values, nested groups, failure drafts, document-unique IDs and accessible keyboard interactions match the owning contracts. Reuse real shared behavior without a generic renderer/rule registry. |
| M10.9.4 Status and row lifecycle | Changed/deleted visibility, authored defaults/creation, row/bind hooks, append/progressive-load integration and empty/result markup. | Stable identity and callback ordering through failure/reentrancy/disposal; deleted-row behavior and view scopes are explicit. Business row factories/loaders stay application-owned. |
| M10.9.5 Detail and geometry | Form/Popup previous/next, validation before navigation, height resize, reveal policies and remaining sticky/footer/column interactions. | Same CVC runner, correct focus and cancellation, authored resize controls, nested data and viewport integration. No second page/runtime implementation. |
| M10.9.6 Legacy semantic closure | Crosswalk remaining G01-G20 options, callbacks, defaults and dynamic paths; replay the complete demo and migrations. | Each obligation has equivalent behavior and acceptance evidence or the user's explicit omission decision. Other component/CVC parity remains tracked separately. |

Before each later slice, restore this checkpoint, inspect the relevant 1.x behavior, specify compact HTML/TS examples and exact public contracts, then implement and review within the already authorized scope. A new core responsibility or changed scope goes through the milestone contract review. Do not treat these subdivisions as completion or retirement of the remaining Grid work.[^parity]

## M10.9.1 public contract before code

```ts
const [first, second] = rows.entries();
const inserted = rows.add(applicationRow(), first.id); // Before a stable live ID.
rows.move(second.id, first.id);                       // Omit target to move to end.
const copied = rows.copy(second.id, inserted);        // New ID, independent stored JSON.
```

- Extend existing `add(value, before?: RowId): RowId`; omission preserves append. Add `move(id, before?: RowId): void` and `copy(id, before?: RowId): RowId`. A before target identifies a live row in the same store, never a display index or DOM ID. No new named public type or generic order/transaction library.
- Validate source/target and all JSON values before mutation or ID allocation. Missing IDs use ROW_MISSING; deleted sources/targets use ROW_DELETED. Clone failures and reentrant value evaluation follow the existing ROW_VALUE/revision/disposal guards. Caller side effects remain committed; a stale outer write is rejected.
- Copy the committed source snapshot, including current valid edits, into a deeply detached inserted row. Do not copy a UI draft, source ID, dirty flags, deletion state or server identity policy. Business-key regeneration remains application code.
- Store order is Map order, including retained deleted originals. Move changes that order only; existing row snapshots and value/status/dirty state remain unchanged. `changes()` still represents value insert/update/delete payloads. Applications persist business order through their own payload or fields, including an ordered array from `entries()`. `revert(id?)` restores values/status and removes inserts while retaining current order; it does not reset presentation order.
- Moving before itself, before its current immediate store successor, or the last store row to the end is a no-op: no event and unchanged cached arrays. A successful move publishes one frozen `{ type: "move", id, changed: true }`; add/copy publish the existing single add event. Subscribers see the committed complete order; their exceptions do not roll it back.
- Keep existing Map storage and the current clone/notification helpers. Rebuild order only for actual ordered operations; preserve O(1) append and existing value-update paths. No index overload, public utility, row factory, alias method or unnecessary framework metadata.
- Selected/checked ID arrays remain in store order; moving can emit their normal post-change callbacks with the previous/new ordered arrays after DOM commit. Membership, active identity, scope/range behavior and drafts stay keyed by RowId. Moving a row must not detach its focused editor or clear unrelated validation in Form/List/Grid.

## Change order and validation

1. Recheck the preceding checkpoint and legacy intended insert/move/copy behavior; separate the old shared-reference copy defect from its intended outcome.
2. Extend Rows using existing clone/dirty/revision/notification paths, with meaningful invalid-target, no-op, tombstone/revert, detached-copy and subscriber/reentrancy tests.
3. Reconcile store-order membership and UI subscriptions; keep focused row nodes attached during reorder in Grid/List and preserve drafts/errors in shared Form. Add browser tests for two layouts, sort/filter/page/viewport, nested choices, keyboard and cleanup.
4. Extend the existing demo and installed JS/TS/browser consumers. Update draft API concepts, coverage, indexes, log and active checkpoint in the same task.
5. Freeze sources; run strict build/types/example types, units, full Chromium/Firefox/WebKit, the same tarball's JS/TS and installed Chrome/Edge consumers, existing binding and viewport budgets, and changed/full OKF checks. Independently review source/docs/archive before verified metadata and commit/push only the authorized branch.

Performance acceptance before measurement: retain every M10.8 binding/viewport budget. Extend the existing 5,000-row flat/nested viewport fixture with a last-row move before a stable target near the mounted window, preserving its snapshot and one event plus the unrelated focused draft/caret. Use the same 400px root, two warm-ups, five measured runs and settled-frame observations. The new same-host Chromium median move budget is 100ms; DOM stays below the fixture's existing 80-row limit. No universal frame-rate or heap/token claim.

# Verification log

M10.9.1 is implemented within its ordered-foundation contract. Build, strict source/browser-controller types and 102 units pass. Full Chromium/Firefox/WebKit suites pass 250/250 each, including seven new shared-order cases and one new demo case. Targeted three-engine runs cover shared Form/List/Grid errors/drafts, physically attached focused nodes/caret/synthetic composition, selection/check order, veto/reentrant callbacks, deep copy, Tree business-key observer errors, viewport anchors and sorted/filtered pages.[^ordering-browser][^units][^evidence]

Installed JS/TS and all five Windows browser consumers pass the same unpublished 153-file artifact SHA-256 cdc1a545dcbf1dc9bbf149d3012acad01a3d4fdddb90f1a7f054a67cc064493e, 246,206 packed / 1,217,879 unpacked bytes. Every member matches the frozen workspace. The five package entries and zero runtime dependencies remain unchanged; no named public type or source module was added. Sixteen final commands preserve exits, 29 normalized source/fixture hashes and raw log hashes.[^evidence]

With two warm-ups and five measured runs, 5,000-row flat/nested initial/reveal/scroll/columns/paste/move medians are 8.8/63.0/82.8/49.0/34.0/61.9ms and 7.2/63.5/83.7/49.2/32.9/63.8ms. Mounted rows stay at most 14, including one focused editor. Both 100ms move budgets and all preceding viewport budgets pass. Original 1,000-row flat initial/rebind/edit/sort/filter medians are 14.5/16.0/1.0/2.9/1.4ms; nested-auto initial/rebind/sort/filter are 42.6/47.8/7.9/3.0ms, within their existing limits. Raw samples retain actual intersections, varied heights, twenty scroll cycles and zero late teardown mutations. The frozen fixture also asserts one move event and the unchanged snapshot/draft/focus/caret; DOM counters include native-focus release and are not JavaScript heap measurements.[^benchmark][^evidence]

Independent review checked legacy intent, validation/no-op/tombstone/copy/reentrancy behavior, UI subscribers, benchmark assertions, API bodies and exact archive/evidence identity before verified metadata. Integration fixes reorder forced selected/checked arrays after DOM commit, skip Form work for move, retain List issues and keep focused Grid/List rows attached. Provisional fixtures were corrected to use required-empty drafts, supported List button focus and the original demo row; one development import setup failure was separated from behavior assertions. Runtime guarantees and assertions were retained.[^evidence]

Work-cost observations: the public surface is one optional add target, two methods and one event variant; existing Map, clone/revision/notify and UI owners are reused. Append stays O(1), actual ordered placement is O(n), and no public utility/transaction manager was introduced. An equivalent fixed agent task and actual token telemetry were not rerun; no measured AI-speed or token-saving claim is made.

# Next action

M10.9.5's [detail and geometry contract](m10-detail-plan.md) implements logical row scopes, explicit reveal alignment, authored height controls and one validated CVC detail page reused in main content/Popup. Its frozen evidence and source corrections belong to that plan. [M10.9.6](m10-closure-plan.md) now has a complete baseline audit and four required slices. M10.9.6.1 implements original-value access, exact committed-field markers and retained edited deletion display. The reviewed [M10.9.6.2 interaction/view controls](m10-interactions-plan.md) contract implements native toggle policy, applied filter search/zero counts, authored chooser/recovery and explicit action-scroll recipes. The implemented [progressive contract](m10-progressive-plan.md) provides .3 prefix admission, yielding, completion and cancellation through existing owners. Continue semantic acceptance (.4); every remaining option/default/callback and dynamic obligation requires concrete acceptance before family closure. Other-component parity and P0 remain required. After required coverage, the [M13 whole-code review/remediation](m13-review-plan.md) remains mandatory before personal acceptance. No new omission, publication, release tag or actual token-saving claim is approved here.

# Open questions

Manual assistive-technology and real OS clipboard integration remain unverified; real macOS/iOS Safari remains excluded. Actual token telemetry and equivalent-task comparisons remain unavailable until the later fixed AI evaluation. Authored block/merge markup is now implemented; its final verification belongs to the separate stage plan rather than the historical M10.9.1 record above.

[^parity]: Required feature scope and dependency order
[^coverage]: Remaining Grid behavior families
[^data]: Shared row identity, order and immutable changes
[^grid]: Grid projection, drafts and mounted lifetime
[^viewport]: Measured logical-row viewport

[^ordering-browser]: Shared order, draft, focus and viewport regressions
[^units]: Ordered operations, copy independence and reentrant validation
[^benchmark]: Settled viewport and identity-preserving move measurements
[^evidence]: Frozen M10.9.1 source, commands, artifact and results
