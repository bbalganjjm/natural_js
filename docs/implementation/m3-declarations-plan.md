---
type: Plan
title: Natural-JS 2.0 M3.7 typed declarations and row actions
description: Assemble asynchronous page requests, components, events and actions through existing CVC ownership and add one List row-resource callback.
tags: [meta, plan, cvc, lifecycle, list, migration]
status: draft
sources:
  - id: baseline
    resource: evidence/m36-verification.json
    title: Accepted M3.6 automatic advice and page lifetime checkpoint
    git_blob: f2467bb6dd0c261bac11c19ae44eea8c0b0bcbaf
  - id: registry
    resource: evidence/remaining-work-plan.json
    title: Required asynchronous declaration and stable row-action outcomes
    git_blob: a18ff58091c2eb8d8050ba8222d6b3285a078a11
  - id: legacy
    resource: ../../v1/src/natural.template.js
    title: Existing code requests, component declarations, events and ordered actions
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
  - id: hooks
    resource: ../../src/ui/grid-hooks.ts
    title: Existing synchronous row resources and reverse cleanup
    git_blob: b3817f2602ecdbc7e4356069ef9266757768dee9
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Existing Grid ownership, checkpoints and attached row callback
    git_blob: 49ad06146be28548099caf2e276adfc7698265b1
  - id: list
    resource: ../../src/ui/list.ts
    title: Current authored List, snapshot cache, visible membership and selection
    git_blob: e97c85d1a9618672a5e84c23b1a38633b5e3d79c
  - id: page
    resource: ../../src/page/index.ts
    title: Existing common page startup, abort and complete cleanup
    git_blob: 4aedbe450f442b7d8c96955c837c5c88f379276a
  - id: example
    resource: ../../examples/vite/m4/employees.ts
    title: Actual awaited preparation, stable public actions and owned UI bindings
    git_blob: 15f90ca60a62b3398ce3eaab045bfb880c0d683f
  - id: omissions
    resource: omission-decision.md
    title: Only O01-O05 are approved exclusions
    git_blob: 2f05bc3f50c48797e9329aba828a3bcbd6534652
generated: { by: codex/gpt-6, at: 2026-11-14T22:40:53Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T22:40:53Z }
---

# Goal

Retain asynchronous component, request, event and action declarations with ordinary typed objects and functions. Keep declarations separate from returned handles. Preserve startup order, false/zero/empty/null defaults, cancellation and stable row identity. Add only List.onRowBind where arbitrary repeated row events currently lack a resource owner.[^registry][^legacy][^list]

# Checkpoint

This plan was written before project source application from saved and pushed M3.6 commit 96d5e66ccfa2a90eec53e3307302ae3d140e1644. Its 215 inputs, 217 units, 933 full cases per engine, 208-file archive and immutable evidence remain preserved. Its original serialized-class fixture failure and inherited limitations retain their exact scope. At that written-plan checkpoint, M3.7 code existed only in independently reviewed caches and no M3.7 compiler, project test, browser or benchmark had run.[^baseline]

At the written-plan checkpoint, Grid already exposed row/elements/own and List exposed selection-change notification only. Its cached LI elements can leave and re-enter the displayed page without changing their row snapshot; that requires a resource lifetime separate from value-cache equality.[^grid][^list]

# Steps

1. Recover the saved M3.6 checkpoint. Read actual code requests, typed declarations, native/custom/group targets and startup callers. Preserve all required outcomes outside exact O01-O05. Do not infer that an external declarative caller is unused.[^omissions][^legacy]
2. Keep the existing grid-hooks.ts source path. Rename its private symbols directly to createRowHooks and RowBinding; parameterize the real element type and bindGrid/bindList error identity. Update Grid and its exact private test/type callers without an adapter or a parallel cleanup implementation. Preserve all Grid callback timing and behavior.[^hooks][^grid]
3. Add only onRowBind to bindList options. Infer readonly row, a readonly one-element HTMLLIElement array and own(dispose). Capture and validate the callback once at creation; invoke it plainly and synchronously after values and final physical placement. Reject and drain asynchronous results. No new named /ui type or callback registry is added.[^list][^hooks]
4. Release a prior List binding before changed/forced value writes, source pruning, displayed-view exit and disposal. Re-entry receives a fresh binding even when its cached row snapshot is identical. Pure sorting of retained rows preserves resources. Invoke newly prepared rows in displayed order. Check source/version/lifetime whenever row hooks or value callbacks are enabled, reject reentrant binding before mutating view options and close all prepared resources on callback or stale failure.[^list][^hooks]
5. Queue row-cleanup failures while finishing row, Select, template, listener and root restoration; then report the first LIST_BIND error. Preserve the earlier callback/checkpoint failure during failed setup. Late own calls dispose their resource immediately and reject against the released binding. Existing List selection and read-only control policies stay unchanged.[^list][^hooks]
6. Add one opt-in mode, ?declarations=async, to the existing M4 page; ordinary mode and its 3/7 page-size overrides remain unchanged. Await the existing setup plus one requested-group common-code batch and one separate initial-data request with Promise.all and the Page signal. Decode unknown replies in the application, filter relevant/permitted choices and require the selected positive page size to exist. Assets contain page sizes 2/5/10 plus an unrelated group, and initial empty query/E-102/maxPageSize5. E-102 resolves to Grace through current RowId. No shared code-cache service, new controls or theme is added.[^example][^page][^legacy]
7. Keep component/request/event/action declarations as typed ordinary objects/functions and store returned handles separately. Set received native query/default before local Form capture. Construct components, await the first public actions.search, connect declared submit/row events, then await explicit business-ID selection and ready-status actions in order. Reject unknown initial IDs before later actions/activation. Empty query and null selection remain explicit. Existing owned capture guard prevents submit navigation before events exist; Close aborts all preparation. Later search/save read current payloads and retain the public M3.6 advice path.
8. Use one application WeakMap of physical row elements to {id,root}; row own cleanup removes only its registration. Root-delegated authored button/native change/custom employee-inspect events read fresh Rows.get(id), including repeated selected-row actions, while detached/replaced/disposed rows cannot act. Grid Select change observes its accepted commit. List Selects remain disabled/read-only; List proves button/custom/programmatic fresh-value behavior. Two pages keep independent scopes and counters. Generated controls and editable List stay with M5.19/M6.2.
9. Add a real installed Select declaration/default witness for raw 0/false/empty/null, keeping the frozen options objects reusable and distinct from handles. Those raw defaults are not valid page-size examples. Preserve all existing strict installed and Grid witnesses.
10. Add focused List resources, failure/re-entry/isolation and actual asynchronous page witnesses. Preserve existing Grid cases. Add installed JS/browser and TS inference witnesses to the existing consumers. Derive exact counts after source freeze; run the unchanged full source/types/unit/three-engine/archive/install/performance/docs gates and independent source/raw/body review.[^baseline][^registry]

# Next action

Save/push the separately verified M3.7 checkpoint, then write the M5.15 data/value/projection plan against that saved baseline. Keep every later Form, generated-control, editable List and shell outcome in its own numbered owner.[^registry][^baseline]

# Decisions

- One shared private row owner supports the existing Grid and the new List callback. Its historic filename remains to preserve source links; architecture prose must identify both actual owners.
- No framework p/c/e scanner, string action interpreter, event bus, code-cache service, dependency registry, public DOM/path utility or new initialization scheduler is added. Typed application functions retain those required workflows.
- Grouped/editable List controls remain assigned to M5.19/M6.2. This stage proves scoped row events through current controls without claiming those future families complete.
- Public surface adds List.onRowBind only. Existing synchronous Grid behavior, List selection, native constraints, authored HTML/CSS and RowId ownership remain explicit.

# Verification log

The exact pre-source plan is preserved as m37-written-plan.md. Composite independent review covers runtime/private callers/installed consumers, actual application and the original List fixtures without author self-approval. The applied sixteen source paths retain their accepted hashes. Independent API review corrects two prose attributions without changing implementation.

All twenty-three attempts pass: seven development attempts and sixteen latest canonical groups. The 219 inputs pass strict source/example/installed types, 217 units, 101 focused cases and 955 full cases per engine. Twenty-two browser cases are new and all 933 parent cases remain; existing unit registrations are unchanged. The pre-execution SelectChoice generic correction is a static cache finding, not an actual compiler/test failure.

The exact 208-file archive 4194aba11bdb1c2d583c3440685efa42b7e87068cc0dacb00a506eae74cea61c passes JS/TS and installed Chromium/Firefox/WebKit/Chrome/Edge. Original thirty budgets retain sixty medians and 300 durations. Forty-one declarations retain thirty-eight identical files; only Grid/List/private row-hook signatures change and the public UI entry is identical. The employee mode demonstrates explicit asynchronous preparation, current-payload requests and owned row actions; a separate installed Select recipe executes raw0/false/empty/null declarations and TypeScript checks those types. Independent raw/final semantic review and actual changed/full document checks accompany selected acceptance. The immutable source snapshot retains pending-at-capture fields; m37-verification.json owns later completion.

# Open questions

- The frozen proposal owns sixteen source paths: three existing runtime modules, four private test/type callers, two new browser files, two existing application modules, two new JSON assets and three existing installed-consumer paths. Static source registration proposed twenty-two browser additions and zero unit additions; actual collection confirms those counts. A missing SelectChoice type argument was found and corrected independently in cache before project execution; it receives no test/compiler credit.
- Whole List/Grid parity and remaining component-specific editing/group behavior retain their numbered owners; this stage grants no family, P0, M13 or release closure.

[^baseline]: Immediate accepted prerequisite evidence; preserve its original runtime credit.
[^registry]: Fixed remaining stages and required owner-specific acceptance.
[^legacy]: Actual static/common/data code declarations, events and action order.
[^hooks]: Existing row-bound resource lifetime and synchronous cleanup.
[^grid]: Existing row callback context and rendered-view checkpoints.
[^list]: Current authored LI template, value cache and visible membership.
[^page]: Common CVC startup, cancellation, containers and cleanup.
[^example]: Real M4 preparation before component construction.
[^omissions]: Exact approved losses; all other useful outcomes remain required.
