---
type: Plan
title: Natural-JS 2.0 M10.9.6.3 progressive binding
description: Bind already-loaded logical prefixes cooperatively with owned completion, cancellation and the existing viewport and CVC contracts.
tags: [meta, plan, grid, lifecycle]
status: draft
sources:
  - id: parent
    resource: m10-closure-plan.md
    title: Required Grid semantic continuation
    git_blob: 9297be6a74038feb050264600576c87da31ff697
  - id: audit
    resource: evidence/m1096-grid-audit.json
    title: Immutable legacy behavior and unresolved cross-owner obligations
    git_blob: 97f72ec88280d4cbcb49d737909f7d78d709825f
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Logical-record yielding, scroll prefix and completion behavior
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Existing row binding, projection, callbacks and resource lifetime
    git_blob: 625fc54b599da36705208cb7ad4df45029e619c4
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Bounded mounted windows and scroll geometry
    git_blob: d02fbfe5407b80786733034f2f5aaaea5d71ef55
  - id: hooks
    resource: ../../src/ui/grid-hooks.ts
    title: Synchronous row hooks and reverse resource release
    git_blob: 628b69014fd77f0f18e5e8c84d2953c1a9401bb9
  - id: page
    resource: ../../src/page/index.ts
    title: Per-instance abort and asynchronous controller cleanup
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: browser
    resource: ../../tests/browser/grid-progressive.spec.ts
    title: Logical chunks, owned failures, cancellation and bounded work regressions
    git_blob: 46ea6fc25e2abbccdddb7fbb0e8ad6f96748929f
  - id: demo-browser
    resource: ../../tests/browser/m10-progressive.spec.ts
    title: Authored controls and independent CVC lifetime regressions
    git_blob: bdb664d34333c3770873c0fb45df7c45c4da9845
  - id: cvc
    resource: ../../examples/vite/m10/progressive.ts
    title: Explicit native abort, retained deactivation and continuation composition
    git_blob: e605520c3d8a77767a73db56aef62b054f97a04b
  - id: evidence
    resource: evidence/m10963-verification.json
    title: Frozen source, execution, actual package and unchanged performance evidence
    git_blob: c554eed395405aa38ec667497a95760f542ef1cb
generated: { by: codex/gpt-6, at: 2026-10-24T13:51:10Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-24T13:51:10Z }
---

# Goal

Support the G19/D progressive outcome: admit already-loaded logical records in chunks, yield during work, report first/last completion, and stop superseded or disposed work. Reuse Grid's row preparation, layout, hooks, Rows, viewport and CVC. Add no network loader, second store, generated design, global scheduler or compatibility queue. Other option/callback and cross-owner closure stays required.[^parent][^audit]

# Checkpoint

M10.9.6.2 is pushed at 9af7ed5. Independent recovery matches 167 normalized inputs, 28 raw logs, twelve development records versus sixteen final passing gates and all 183 actual archive members. Artifact SHA-256 is 9beeca3a827f1efde3c5d01911b125a2d1d4d142b186689a01df06de5377df6b; packed/unpacked bytes 288930/1426995. This restores historical evidence without rerunning or recertifying it. Keep 2.0.0-alpha.0, root Apache-2.0, master/v1 preservation and publication deferral.

# Steps

## Public contract before code

- Add optional progressive: { size: number; delay?: number }. Size is a positive safe integer counting whole logical records, including multi-tr blocks; delay is a finite browser timer delay from zero through 2147483647, default zero; fractional values use native timer precision. Invalid options raise GRID_PROGRESSIVE before ownership. Omission preserves the existing synchronous constructor/refresh/view contracts. Positive delay yields between newly prepared logical records; zero uses cooperative chunk continuation without recursive per-row timers. The first record of a new binding may be synchronous; every follow-up renderMore continuation yields at least one Window task, including size one. Use the table's Window and cancel its one outstanding timer.
- Add one readonly GridBindResult shared by onBind and the async handle methods: existing total/filtered/visible/mounted/event plus available/first/last. Available is the admitted logical prefix of the current page, never the widget count. With viewport, update the prefix geometry once per chunk and delay only newly materialized records; do not construct offscreen widgets or create timers for each offscreen ID. First identifies a chunk beginning at zero; last means the full page admission and its required current bindings have completed. A cancel snapshot describes incomplete work and keeps last false while that target is unfinished, even if all logical IDs were admitted. Default synchronous and empty completions have first/last true and available equal to visible. This is an explicit additive unpublished-beta result contract: update exact old shape assertions and installed consumers rather than keeping mode-dependent result shapes.
- Add whenBound(): Promise<GridBindResult>, renderMore(): Promise<GridBindResult>, and cancelBinding(): GridBindResult. whenBound observes the current binding operation. renderMore returns the same pending Promise while work is running; otherwise it resumes an unfinished target or advances one size. Exhausted/empty calls do not repeat onBind. Cancel clears the timer, rejects the old pending Promise with AbortError and returns a frozen snapshot of the retained admitted prefix and actual mounted work; later renderMore resumes. A new view request/dispose also settles the superseded Promise. An internal rejection handler prevents unhandled rejection while the exposed Promise retains its rejection for callers.
- Keep visible IDs as the full logical page for checks/ranges/paste/validation and native ARIA totals. Only prefix goal/completion cursors are additional persistent projection state; Rows and its stable IDs remain authoritative. With viewport, pass the admitted prefix to the existing geometry owner and retain bounded mounted widgets. Offscreen logical admission must not construct widgets or claim their row hooks ran. Keep row ownership mount-only and actual mounted counts distinct. Delay applies to cooperative chunk work; ordinary bounded viewport movement keeps the existing synchronous materialization path. In progressive mode a late window failure replaces whenBound with an owned rejection, and renderMore retries the current window even if logical admission is exhausted, without a duplicate onBind.
- Preserve synchronous reveal(id): a valid full-page ID outside the prefix remains revealable. Cancel queued work and synchronously admit at least through the requested identity before using the current reveal/layout path. When this grows progressive admission, emit one completion for that bound extent; default/non-growth reveal still emits no completion. It may finish the retained current goal to avoid a partial-goal split, and the next chunk must not repeat first after an extent beginning at zero was published. Keep focused nodes/caret and row-keyed drafts; projection reset retains enough prefix to contain a still-visible focused row. Validation/keyboard use the same reveal bridge. This explicit demand may finish work synchronously; ordinary background advancement remains cooperative.
- Replace/sort/filter/status/page/refresh cancel old work and start a fresh first chunk. Ordinary set/setMany/add/remove/move/revert cancel queued work, retain/rebase the prepared prefix and synchronously reflect already-ready data without onBind; explicit continuation resumes remaining work. Append preserves old identities and unfinished work without holes: resume an unfinished target, or advance one chunk when the old target was complete. A fully admitted old view appends the new tail up to the chunk limit. Empty append stays the established no-op. A layout change cancels pending work without discarding the committed column state; explicit continuation retries under that layout.
- Existing beforeRowBind/onRowBind remain synchronous and table-attached; they are document-connected when the table root is connected. They cannot refresh, advance or cancel binding from inside a row hook (GRID_BIND_REENTRANT); disposal remains allowed. Prepare each required new logical record once through the existing owner; do not rerun full growing-prefix placement/merging for every yielded record. Progressive onRowBind sees its attached, fully bound record before shared final placement; completion sees the finished chunk geometry. Commit shared layout/merges/selection at a chunk boundary, keep prepared controls usable, and preserve resource ownership on partial success. On a preparation error, release the failing/uncommitted row resources; earlier ready rows stay available for retry. Hook/field/late-window errors are observable by the owned Promise; no new uncaught timer exception. onBind errors occur after commit and reject without rolling back completed DOM or redelivering the same completion.
- Completion order remains row completion, forced prune notifications, then onBind. No stale generation may complete after its callback starts a newer view or disposes Grid. Ordinary update completion suppression remains. Cancellation and errors restore busy ownership and leave an explicit retry path.

~~~ts
const grid = bindGrid(table, { rows, progressive: { size: 100, delay: 0 }, onBind: showProgress });
context.own(() => grid.dispose());
context.signal.addEventListener("abort", () => grid.dispose(), { once: true });
await grid.whenBound();
// Native Next button or a scoped bottom-scroll handler awaits grid.renderMore().
~~~

## Scroll, CVC and accessibility composition

Bottom-scroll continuation is a short application/controller composition around the same renderMore Promise. It checks finite measurable root geometry, current operation ownership and end proximity, then handles success/error. The authored Next button provides keyboard and no-overflow continuation. There is no second scroll loader or network request. An application can loop awaited renderMore for Yield all; each continuation must still allow another task to run. Automatic operations and their late results are guarded by the current Grid/operation identity.

CVC reload/dispose aborts signal before awaiting controller cleanup. Couple that standard signal directly to immediate idempotent Grid.dispose and retain the normal owned disposer. An asynchronous deactivate/dispose must not keep progressive timers alive until late owned cleanup; controller forced-cleanup logic checks its aborted signal before touching released UI. Ordinary retained deactivate does not abort the signal: it calls cancelBinding, and activate may resume. Test these distinct lifetimes instead of claiming implicit global cancellation.[^page]

Grid owns aria-busy=true only while scheduled work is pending; settled/canceled/failed work restores the authored attribute. Waiting for Next with last=false is not busy. Prefix-mode table ARIA counts/indices describe the full logical page and restore exact authored values on disposal. Authored status output stays outside the busy table, updates per chunk, and distinguishes loaded/page/available/mounted counts. Progress causes no focus stealing or per-row live announcement; existing view/control focus recovery remains.

## Implementation and acceptance order

1. Independently review this contract and exact legacy defects before code. Old nonpaged first=false, addTop override anomalies, append holes, recursive zero-delay stack growth, stalled FIFO and unowned timers are defects, not supported outcomes to copy.
2. Implement one private Grid-specific scheduling owner only if it makes the existing module smaller; no generic task framework. Share actual row preparation and keep the default fast path direct. Validate options before DOM ownership; use strict types and short API/error/cause details.
3. Independently author regressions for boundaries (0/1/S/S+1/250 at S100), logical multi-row blocks, same Promise, task responsiveness, cancel/resume, view/data/layout supersession, append after partial prefix, first/last flags and ordinary notification suppression. Cover hooks/cleanup/error/retry and post-commit completion failure, focus/drafts/groups/nested Select and exact quiet teardown.
4. Extend the existing all-options demo with Immediate/Yield all/Loaded prefix, size/delay, Next/Cancel/Resume/Ping and current completion output. Add two-instance CVC proof including early reload/dispose, asynchronous deactivation and independent continuation. Keep all old interaction controls and tests.
5. Extend exact installed JS/TS/browser consumers and draft API/architecture/migration/demo documents, indexes, log and coverage. Freeze inputs and run build/source/example types, units, complete Chromium/Firefox/WebKit, the same actual tarball in JS/TS and all five Windows browsers, unchanged binding/viewport budgets and focused progressive scale/clone-count evidence. Independently check source/API/archive/logs/medians/documents before verified stamps and authorized commit/push.

# Next action

Perform M10.9.6.4 semantic acceptance against the preserved complete mapping and current implemented counterparts. Write its detailed plan before further public changes, link each outcome to code and acceptance, and retain cross-owner CVC/declaration/wire obligations until their owners finish. Other component parity, P0, the consolidated omission decision and final M13 whole-code ponytail-review/remediation remain required.

# Decisions

Count logical records; keep creation, field binding, events, row resources and geometry at current owners. Use ordinary objects, typed callbacks, one Promise per operation and native Window scheduling. Prefix progress and mounted widget work are separate. No dependency, generalized extension/queue library, duplicate projection or new default delay.

# Verification log

The selected slice is implemented and independently reviewed. Build, strict source/example types and 124 units pass. Full Chromium/Firefox/WebKit suites each pass 499/499 with no skipped cases, including 37 new core and fourteen demo/CVC cases. The final sixteen passing gates share 171 normalized execution inputs; superseded attempts retain their own maps and byte-exact raw logs rather than certifying changed inputs.[^browser][^demo-browser][^evidence]

Earlier attempts also retain setup/module-request failures, a Windows ERR_NO_BUFFER_SPACE navigation failure and a shared-server shutdown during overlapping development runs. Final browser suites run sequentially with fixed inputs. These earlier attempts do not count as final passing gates.[^evidence]

Installed JS/TS and all five Windows browser consumers use the same unpublished artifact: 183 files, 297240/1474748 packed/unpacked bytes, SHA-256 0d48e48535c97cc1e91ab81eaa92c9275face6b89febf1059bab7c107a714ff6. Every actual archive payload matches the frozen workspace. Five public entry points and zero runtime dependencies remain. The smoke covers the uniform frozen result, same pending Promise, cancellation, replacement, continuation, append, synchronous default and exact quiet disposal.[^evidence]

Original binding and viewport fixture sources, sizes, warm-ups, five samples and budgets are unchanged from 9af7ed5. All sixty raw medians are recomputed. At 1,000 records the binding medians in initial/rebind/edit/sort/filter order (nested-auto omits edit), rounded to 0.1 ms, are flat 20.9/21.6/1.1/2.7/1.4; nested-auto 45.9/53.2/6.1/2.8 ms. The 5,000-record viewport fixtures pass their full budgets, including 250-row append and exact quiet cleanup; flat maximum 14 physical rows; nested maximum 14 physical rows; blocks maximum 24 physical rows. These are same-host Chromium measurements, not universal speed or JavaScript heap claims.[^evidence]

Independent review reproduces the prior baseline, checks connected source/API/callers, separately authors the acceptance cases, reviews the authored CVC/demo, and matches archive/log/source evidence. Regressions reproduce and fix rollback/prune order, prefix-external paste, late-window duplicate completion, focus loss while pending, same-stack completion disposal/post-commit sort failure, and released validation element references. The final same-stack path reuses the existing returned notifier, so view/header state commits before completion and no wrapper-specific scheduler is added. Existing validation live regions and strong focus/restoration assertions remain.[^evidence]

Work-cost boundaries: one optional policy, one readonly result and three methods reuse existing Grid/Rows/viewport/CVC. One owned Window timer and native Promise carry cancellation/errors; a private immutable-membership cache prevents per-row set copies. The 5,000-row admission test counts actual widget clones/timers; the 1,000-row bulk-selection test bounds Rows reads and selection/check copies. No fixed final agent-task or actual token evaluation is claimed. All twenty audit families remain open; semantic acceptance, other parity, P0 and M13 stay required.[^browser][^evidence]

Independent final evidence and document review approves this slice. Changed/full OKF checks pass with 63 concepts, five reserved files, zero errors and zero warnings. Eleven reviewed semantic concepts receive verified metadata; twenty-three historical concepts preserve exact bodies and generated/verified dates while only source fingerprints change. The [history check](evidence/m10963-doc-history.json) records that separation; the [changed](evidence/m10963-docs-changed-final.log) and [full](evidence/m10963-docs-full-final.log) logs retain the final documentation checks.

# Open questions

Any unresolved legacy option/configuration/completion edge stays required under .4/P0. No full family closure or feature omission is approved here. Actual macOS/iOS Safari is excluded; manual assistive technology, OS IME/clipboard and final agent/task/token evaluation remain unverified. No npm publication, release tag or master/v1 change.

[^parent]: Required Grid semantic continuation
[^audit]: Immutable legacy behavior and unresolved cross-owner obligations
[^legacy]: Logical-record yielding, scroll prefix and completion behavior
[^grid]: Existing row binding, projection, callbacks and resource lifetime
[^viewport]: Bounded mounted windows and scroll geometry
[^hooks]: Synchronous row hooks and reverse resource release
[^page]: Per-instance abort and asynchronous controller cleanup
[^browser]: Logical chunks, owned failures, cancellation and bounded work regressions
[^demo-browser]: Authored controls and independent CVC lifetime regressions
[^cvc]: Explicit native abort, retained deactivation and continuation composition
[^evidence]: Frozen source, execution, actual package and unchanged performance evidence
