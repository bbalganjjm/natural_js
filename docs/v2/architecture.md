---
type: Architecture Pattern
title: Natural-JS 2.0 module boundaries
description: Small role modules, one-way imports, and evidence-based sharing keep 2.0 easy to navigate.
tags: [architecture, modules, maintainability]
status: draft
sources:
  - id: package
    resource: ../../package.json
    title: Public package boundaries
    git_blob: 393602a69677d5fdaf7968fd49b19efd1b7d5cae
  - id: root
    resource: ../../src/index.ts
    title: Root entry
    git_blob: d99a783055cf6bea9b6e15ca591c370ff514cec9
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public UI contracts and component exports
    git_blob: 74ddf1877ebfa9a45c20d4f69baa0efe5d429d8b
  - id: form
    resource: ../../src/ui/form.ts
    title: Form binding
    git_blob: cf97e4f21033e353f9a5aaafddec1b9623d05267
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid binding
    git_blob: e9e6c3bdcaa81e4f99d98c7b7100f7f13263ef26
  - id: grid-columns
    resource: ../../src/ui/grid-columns.ts
    title: Private Grid column topology and resize ownership
    git_blob: 874fca4953ffe70a2ef3b8e7001968da66bf89c4
  - id: grid-selection
    resource: ../../src/ui/grid-selection.ts
    title: Private Grid active identity, sets, eligibility, and transitions
    git_blob: eb9ae76806af63029078cb64d5f68acccc62053c
  - id: grid-filters
    resource: ../../src/ui/grid-filters.ts
    title: Private Grid scalar filter state and choice counts
    git_blob: 9503e0aa8b72fc577f50b4ef992b9ab60bd84c1c
  - id: grid-viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Private measured Grid window and scroll lifetime
    git_blob: 671b4e3bd886cbe159e851ebcd3625f1fd9ea2ae
  - id: grid-blocks
    resource: ../../src/ui/grid-row-blocks.ts
    title: Private authored record structure and native merge ownership
    git_blob: 71d2218d3cf773d875bb423f8a324d5db70077ab
  - id: grid-hooks
    resource: ../../src/ui/grid-hooks.ts
    title: Private Grid row callbacks and reverse resource cleanup
    git_blob: 628b69014fd77f0f18e5e8c84d2953c1a9401bb9
  - id: list
    resource: ../../src/ui/list.ts
    title: List binding
    git_blob: 578c0619b9262c497a11d078d07832d0f1fdf4b6
  - id: select
    resource: ../../src/ui/select.ts
    title: Standalone Select binding
    git_blob: 4160eb77722751aad730fb997a4f0b07a967bd1e
  - id: pagination
    resource: ../../src/ui/pagination.ts
    title: Pagination binding
    git_blob: 0239548e7638456548beb441b55956381272d454
  - id: popup
    resource: ../../src/ui/popup.ts
    title: Authored dialog and CVC Popup lifetime
    git_blob: 49ec03d610615aff95952804541c94892799535f
  - id: tabs
    resource: ../../src/ui/tabs.ts
    title: Authored Tabs and CVC page lifetime
    git_blob: 8e2fe057168717b6b8ad2182c66935a492a89292
  - id: tree
    resource: ../../src/ui/tree.ts
    title: Tree hierarchy and authored-list binding
    git_blob: 730aec4bc38bd3f001cea36677825ee1b4d15cd0
  - id: datepicker
    resource: ../../src/ui/datepicker.ts
    title: Controlled authored-calendar binding
    git_blob: ab5880c48e2ddf06ee1e6bce981684b15c316eb9
  - id: dom-state
    resource: ../../src/ui/dom-state.ts
    title: Private shared DOM state ownership
    git_blob: 885c8d0cf0c6914d73bbbb71a0fb6aab3b35f6d3
  - id: row-options
    resource: ../../src/ui/row-options.ts
    title: Private row-local choice extraction
    git_blob: 72facd6bc5b30845938731897f1f5aadd257a7fa
  - id: select-owner
    resource: ../../src/ui/select-owner.ts
    title: Private Select ownership
    git_blob: 6902e2789df6e44123b2ea599e4d05fa1c098fa4
  - id: path
    resource: ../../src/ui/field-path.ts
    title: Private UI field path semantics
    git_blob: dfac85c3d4cc2c0a61cb2e4ee210b01583ecc5b2
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Private shared native values, display and constraints
    git_blob: 24943c238ebb41954764f4ab45306d5e7808b572
  - id: render
    resource: ../../src/ui/field-render.ts
    title: Private explicit render configuration and DOM ownership
    git_blob: 6cee41e892540ca138affb9988ab708506f6cb20
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Private Form/Grid rule runner
    git_blob: 967142342d060056cd3f124db29f6893a2875d48
  - id: formats
    resource: ../../src/ui/format-rules.ts
    title: Private retained formatter rules
    git_blob: ba7dbc318be4622e90ec0004846566fd3b5b5362
  - id: validators
    resource: ../../src/ui/validate-rules.ts
    title: Private retained validator rules
    git_blob: 4f1439b6e09b066bea1afd26d16b34471d9f4d18
  - id: page
    resource: ../../src/page/index.ts
    title: CVC page runner
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: data
    resource: ../../src/data/index.ts
    title: Row store
    git_blob: ec509c2fe5274334a07f69b4c098a217262a1c6b
  - id: comm
    resource: ../../src/comm/index.ts
    title: Communicator
    git_blob: f3650ddbfeb5d87c3e58dc84904df9704e994368
  - id: error
    resource: ../../src/internal/framework-error.ts
    title: Shared framework error
    git_blob: 6930da1fbcfd71733a45dab22a51aec784cafe7f
  - id: documents
    resource: ../../src/ui/documents.ts
    title: Dynamic authored document containers
    git_blob: 9d1da99633d4c2525eb6440b7aed98bb8753cb61
  - id: notify
    resource: ../../src/ui/notify.ts
    title: Persistent authored notifications
    git_blob: 78af2890f980c0091246e81abd2a041b084bc30f
  - id: tab-pages
    resource: ../../src/ui/tab-pages.ts
    title: Private shared page-tab transitions and keyboard helpers
    git_blob: 4e0f2ee8ee62e95f0b3e47d7a305ecffbe53bd31
generated: { by: codex/gpt-6, at: 2026-10-24T05:58:18Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T22:14:07Z }
  - { by: codex/gpt-6, at: 2026-10-24T05:58:18Z }
---

The root 2.0 package uses one directory per public role and a narrow private internal area. An agent can start at the package export map, then read one entry and its direct dependencies.

# Intent

Keep one definition of each framework behavior without collecting unrelated helpers in a public utility library. Place types and code beside the feature that owns them, and extract only when the same stable behavior is needed across roles.

# Participants

| Path | Responsibility through M12 |
|---|---|
| `src/index.ts` | Root public entry; currently re-exports the real `FrameworkError`. |
| `src/page/` | `mountPage`, CVC lifecycle, authored HTML roots, and per-instance cancellation. |
| `src/data/` | `createRows`, immutable JSON snapshots, row identity, clean batch append, inclusive tombstone enumeration and change tracking. |
| `src/ui/` | `bindForm`, `bindGrid`, `bindList`, `bindSelect`, `bindPagination`, `openPopup`, `bindTabs`, `bindTree`, `bindDatePicker`, `bindNotify`, `bindDocuments`, their types, and UI-owned field-path, rule, row-option, Select-ownership and private Grid state helpers. |
| `src/comm/` | `createCommunicator`, Request/Response hooks, JSON decoding, and cancellation. |
| `src/internal/` | Private cross-role implementation; currently the common error class only. |

# Lifecycle

Build `src/` once with `tsc` to `build/`. The package export map resolves public paths to generated JavaScript and declarations. Consumers cannot use an internal package subpath through `exports`. The preserved `v1/` code is outside this build and tarball. Form, Grid, List, and Tree bind within authored roots, subscribe to a caller-owned row store when supplied, and release their own listeners and subscriptions on disposal. Standalone Select, Pagination, and DatePicker bind authored controls, own no row store, and restore authored markup on disposal. Popup, Tabs and Documents own private `PageHandle` instances from the same `mountPage` runtime; Popup owns one opening, keeps modal focus visible within authored scrollable CSS, and restores the opener, while Tabs retain successfully visited pages until final disposal and evict failed or canceled pages. Documents also create/remove keyed entries and call an application close predicate. Notifications own cloned message items and stable announcement changes; they own no store or page runtime.[^package][^form][^grid][^list][^select][^pagination][^popup][^tabs]

# Rules

- Import downward and directly: UI may depend on data and the page runtime/types; data and communication do not import UI. Runtime modules may use private internal code. No internal module imports the package root or another role's public package specifier.
- Start a helper inside its owning feature. Move it to `internal/` only after at least two roles need the same semantics, lifetime, error behavior, and tests. Small operations with different meaning stay local.
- Form, Grid, and List use one UI-owned declaration parser and dispatcher, native field value/display/constraint operations, and Select ownership with standalone Select. Built-in formatter and validator implementations remain private. Grid and List share row-local options; Form and Grid share explicit field rendering. Do not turn these concrete contracts into a generic formatting, validation or utility package.
- Keep DOM references and row identity local to their mounted root and row store. Standard browser operations remain direct calls; no selector, event, date, or collection wrapper is added for convenience.
- A shared error code has one implementation. `FrameworkError` is the first cross-role contract, implemented privately and re-exported only at the root.[^root][^error]

# Pitfalls

`grid-columns.ts` owns native cell/colgroup topology and resize lifetime only for Grid. Field references are captured before column attachment, and cloned rows release this owner with Select ownership. Layout changes never mutate Rows or rebind data. The public contract is one state type, two handle methods and two binder options; application HTML provides show/move controls. The module reuses `dom-state.ts` attribute restoration and available-control focus for row/column transitions, including synchronization of pending CSSOM serialization before absent-style restoration. No generic drag, layout or persistence package was introduced.[^grid-columns][^grid][^dom-state]

`grid-selection.ts` owns active detail identity, independent selected/checked ID sets, eligibility, full-set validation, scoped checks, range anchors, vetoes and commit ordering. `grid.ts` owns authored native controls, delegated events, row/draft/Select lifetime, projection and focus. A private view revision detects a sort/filter/page change during a before hook even when the resulting IDs match. Forced pruning commits state first and returns its notifications to Grid; Grid finishes row DOM and scope updates before calling them. A callback exception leaves that committed cleanup in place. These contracts expose `GridIdsChange`, `GridRowScope` and `GridCheckState`, not a shared transaction engine.[^grid-selection][^grid][^ui]

`grid-filters.ts` owns raw JSON-scalar column filter state and distinct choice counts under the manual and other-column filters before paging. Its public result is `GridFilterChoice`. Grid connects authored header multiple selects to the existing `bindSelect`, preserving raw number/string identity, search-hidden selections and original control ownership; it adds no second Select implementation. Grid also routes authored sort buttons through its existing sorting path and resolves row actions against current Rows identity. Application eligibility, sort and filter functions stay pure; domain comparators and filter values remain caller-owned.[^grid-filters][^grid][^select][^ui]

`grid-viewport.ts` owns measured logical-record heights, prefix offsets, native spacer placement, authored scroll-root anchoring and observer/frame cleanup. It observes the complete physical tr block for each RowId. `grid-row-blocks.ts` owns template extraction/restoration, finite authored spans and temporary adjacent native merges with measured height floors; it does not own field state. Grid owns projection, mounted bindings, offscreen validation/paste and the single focused-record pin. These are private owners used by one Grid flow; no shared virtual-list/merge engine, loader registry or public type is added. See [Grid](grid.md) for the authored markup and boundary rules.[^grid-viewport][^grid-blocks][^grid][^ui]

`native-control.ts` has concrete Form/Grid/List callers for scalar/group values, image/text display, text-length checks and native value sanitization. Its interactive-content selector is shared by Grid merge and explicit-render preflight. Each binder still owns compilation, probes, drafts, rules and error presentation; List validates against authored-template probes, not its disabled display clones. Grid compiles one logical group across physical rows, allocates isolated native radio names, and retains its scalar fast path without creating a Form controller per record. `field-render.ts` is shared only by Form/Grid: it validates explicit display targets and fresh same-document results before replacement. No renderer, native-field or check-mode type is added to the public entry. Form alone snapshots original custom-render children for disposal; Grid already owns unchanged template restoration.[^native][^render][^form][^grid][^list]

`grid-hooks.ts` owns synchronous before/after callbacks and reverse resource cleanup for each mounted record binding. Grid keeps status projection, captured native defaults, empty-page visibility, placement, reentrancy checkpoints and completion notification with its existing view owner. It restores failed view/setter state before delivering forced pruning callbacks, so a callback's later append is not overwritten. Status presentation does not create a parallel row store; snapshots and clean append remain data-owned, while business factories/loaders/counters remain application-owned. No generic lifecycle, result-template or network-loader registry is added.[^grid-hooks][^grid][^data]

Appended loaded rows share the existing Rows notification path and stay clean. Form ignores append for its already-bound row, preserving drafts, rules and focus; default List/Tree enumeration still hides tombstones. A Grid opts into retained originals through its status projection, protects deleted editors and splits merges at differing statuses. Native defaults are an untyped record for an application factory, not a cast to the complete domain T.[^data][^form][^grid][^grid-blocks]

A repeated snippet is not automatically a shared abstraction; first check whether it has identical inputs, outputs, cancellation, and ownership. A private helper must not become public merely because applications might find it useful. The private `field-path.ts` exists because Form, Grid, and List need the same safe object-path reading; Form and Grid also need copy-on-write. It is not a package export. The rule runner exists because Form, Grid, and List need the same declarative lookup, overrides, messages, and errors; individual rule operations remain beside their catalog. The row-option and Select-ownership helpers each have two or more concrete UI callers. Tree reuses safe field paths and the formatter runner. Tree, DatePicker, and Tabs share only attribute restoration and unique-ID allocation in private `dom-state.ts`; hierarchy and calendar calculations stay in their owners. Notify and Documents reuse that DOM-state helper. Static Tabs and dynamic Documents share a private concrete page-tab coordinator, cached page cleanup and manual focus-navigation helpers; mountPage still owns controller execution and cancellation.[^documents][^notify][^tab-pages][^tree][^datepicker][^dom-state][^row-options][^select-owner]

# Related

[The M1 contract](../implementation/m1-contract.md) gives behavioral invariants. [Package](package.md) lists what is actually installable. [The employee example](employee-example.md) exercises data UI across two authored layouts. [Popup](popup.md) and [Tabs](tabs.md) document the M7 container contracts; [the page-container example](page-containers-example.md) traces one definition across main content, Popup, and Tabs. [Tree](tree.md) and [DatePicker](datepicker.md) keep source and handle types together; [the authored M11 example](tree-date-example.md) connects them through the same CVC runtime. [Documents](documents.md), [Notify](notify.md) and [the application shell example](shell-example.md) complete the selected shell composition without a public shell engine. [The roadmap](../implementation/roadmap.md) sets later implementation gates.

[^package]: Public package boundaries
[^root]: Root entry
[^error]: Shared framework error

[^form]: Form binding
[^grid-columns]: Private Grid column topology and resize ownership
[^grid-selection]: Private Grid active identity, sets, eligibility, and transitions
[^grid-filters]: Private Grid scalar filter state and choice counts
[^grid-viewport]: Private measured Grid window and scroll lifetime
[^grid-blocks]: Private authored record structure and native merge ownership
[^grid-hooks]: Private Grid row callbacks and reverse resource cleanup
[^grid]: Grid binding
[^list]: List binding
[^select]: Standalone Select binding
[^pagination]: Pagination binding
[^popup]: Authored dialog and CVC Popup lifetime
[^tabs]: Authored Tabs and CVC page lifetime
[^row-options]: Private row-local choice extraction
[^select-owner]: Private Select ownership
[^native]: Private shared native values, display and constraints
[^render]: Private explicit render configuration and DOM ownership

[^tree]: Tree hierarchy and authored-list binding
[^datepicker]: Controlled authored-calendar binding
[^dom-state]: Private shared DOM state ownership

[^documents]: Dynamic authored document containers
[^notify]: Persistent authored notifications
[^tab-pages]: Private shared page-tab transitions and keyboard helpers
