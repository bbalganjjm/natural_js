---
type: Plan
title: Natural-JS 2.0 framework feature coverage
description: Source-backed legacy behavior gaps, required additions, and pending consolidated retirement review.
tags: [meta, plan, migration, parity]
status: draft
sources:
  - id: surface
    resource: evidence/v1-surface-inventory.json
    title: Eight-file AST surface checklist and extraction limits
    git_blob: 58990c13c519d56214f96fd57b9a8ddccdbf23d2
  - id: extractor
    resource: ../../tools/audit-v1-surface.mjs
    title: Reproducible private development audit
    git_blob: 2ae11b775ae906b11c919964d8764795794d8840
  - id: legacy-ui
    resource: ../../v1/src/natural.ui.js
    title: Preserved data and page component behavior
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: legacy-shell
    resource: ../../v1/src/natural.ui.shell.js
    title: Preserved notification and document behavior
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
  - id: legacy-architecture
    resource: ../../v1/src/natural.architecture.js
    title: Preserved controller and communication behavior
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
  - id: legacy-data
    resource: ../../v1/src/natural.data.js
    title: Preserved synchronization and dynamic rules
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
  - id: legacy-core
    resource: ../../v1/src/natural.core.js
    title: Helper reachability and core behavior
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
  - id: legacy-template
    resource: ../../v1/src/natural.template.js
    title: Preserved declaration and row-event behavior
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
  - id: legacy-code
    resource: ../../v1/src/natural.code.js
    title: Optional runtime code inspection
    git_blob: cace23c7b3b7bc5cd23c75a516220586472d7b3c
  - id: ui
    resource: ../../src/ui/index.ts
    title: Current public UI contracts
    git_blob: 98601f6d9ce1b487dd52c81dad860b465b71e8c0
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current Grid implementation
    git_blob: d606737eaa4d51860407c50b4d3ba2f378739ed3
  - id: list
    resource: ../../src/ui/list.ts
    title: Current List implementation
    git_blob: 8d3ef3e1ff3e7b7fb7faed27fc592846dd5fe090
  - id: form
    resource: ../../src/ui/form.ts
    title: Current Form implementation
    git_blob: e603f619679c24be778b04f45ea3c467b50bf2c2
  - id: page
    resource: ../../src/page/index.ts
    title: Current CVC runtime and HTML transport
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: data
    resource: ../../src/data/index.ts
    title: Current shared Rows contract
    git_blob: 10c07414eacccc414b81afc8be5661dd21afe3c6
  - id: comm
    resource: ../../src/comm/index.ts
    title: Current communication hooks
    git_blob: f3650ddbfeb5d87c3e58dc84904df9704e994368
  - id: grid-mapping
    resource: evidence/v1-grid-parity.json
    title: Detailed Grid surface, configuration and dynamic mapping
    git_blob: 6a61d2fb9c4cf6acc401c54caeb7db038ead33d3
  - id: ui-mapping
    resource: evidence/v1-ui-parity.json
    title: Detailed other UI and shell surface and dynamic mapping
    git_blob: 24050c621e8d57cf4090c1a295674ce0b404d0d7
  - id: core-mapping
    resource: evidence/v1-core-parity.json
    title: Detailed core surface and dynamic reachability mapping
    git_blob: 8d7594b97048b06779166c451443bfafcee11c12
generated: { by: codex/gpt-6, at: 2026-10-05T11:52:37Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T11:53:19Z }
---

On 2026-10-05 the user required all 1.x framework capabilities in 2.0 and explicitly required column resize/reorder/hide, multiple selection, bulk paste and real scroll virtualization. Existing selected slices are verified implementations, not a certificate of full 1.x coverage; earlier exclusion/defer decisions must be reconciled with this instruction. This ledger records current gaps; it does not claim their implementation.

# Goal

Preserve user-visible behavior through concise modern TypeScript, CVC, authored HTML/CSS, accessible document-unique IDs, nested binding and measured performance. Keep only code needed by framework behavior. A new API or native implementation may replace old code while retaining its intended outcomes.

# Checkpoint

The first audit covers eight preserved JavaScript sources. Its reproducible AST checklist contains 43 classes, 394 class members and 338 literal constructor option keys.[^surface] Those are structural entries, not 394 promised features or proof of completion. Dynamic declarations, aliases, configuration, callbacks and external option merges still require the P0 closure review in [the execution plan](feature-parity-plan.md). Three independent source audits supplied the Grid, other UI/shell and core comparisons below. They did not rerun historical tests.

Run `node tools/audit-v1-surface.mjs --check` to compare the checklist with the preserved files. The private development tool uses installed Vite parsing and is outside the npm package; `--write` explicitly regenerates structural evidence. Constructor keys cover literal assignments to this.options only: the 338 entries include 307 top-level keys and 31 nested dotted paths, not 338 independent public options. Reference expressions cover uncomputed member paths. Neither extraction closes dynamic reachability.[^extractor]

Status: **core** means the central behavior exists but the family still needs full option/callback verification; **partial** means a concrete gap exists; **missing** means no equivalent current contract; **review** means a proposed workflow retirement is pending. Every gap and review item remains a support obligation until implemented or explicitly approved for exclusion.

The detailed mappings assign all 775 structural entries to owners, current counterparts, gaps, acceptance conditions and reachability observations: core 260 (27 classes / 207 members / 26 literal paths), Grid 89 (1 / 31 / 57), and other UI/shell 426 (15 / 156 / 255). The root NU.grid receiver/static aliases remain in the other-UI member set; only the nested Grid class belongs to the Grid file. Exact sets, AST anchors, kinds, defaults and preserved source hashes were checked independently.[^core-mapping][^grid-mapping][^ui-mapping]

There are 53 identified dynamic/configuration/declaration path groups (15 core, 17 Grid, 21 UI/shell), plus separately indexed nested helpers, external configuration and old declarations. These are review inputs, not exhaustive behavior counts or completed parity. Semantic/dynamic closure and the consolidated omission proposal remain open. No absence of static references proves a helper unused, and candidate labels are not approvals. Evidence source hashes describe the audit snapshot; some modern source/document files changed during implementation and indexing. Those snapshots do not recertify current runtime or historical gates.[^core-mapping][^grid-mapping][^ui-mapping]

# Steps

## Grid coverage

Legacy symbols are in natural.ui.js; current equivalents are bindGrid, GridHandle and caller-owned Rows.[^legacy-ui][^grid][^ui][^data]

| ID | Legacy behavior / evidence | Current status and required work |
|---|---|---|
| G01 | data, bind, add, remove, revert, val, update | Partial: shared CRUD/change tracking exists; selected/checked projections, append completion and template-default creation need coverage. |
| G02 | addTop, indexed add, move, copy | Missing ordered insertion/movement. Independent row copying must preserve intended behavior without shared mutable aliases. |
| G03 | tbody template, contextBodyTemplate | Partial: current Grid accepts one tr per record. Multi-line row groups and template customization need identity/lifetime contracts. |
| G04 | Row Form radio/checkbox groups, multiple Select and input types | Partial: text/number/checkbox/textarea/single Select exist; complete the native control matrix and grouped raw values. |
| G05 | Row Form img.src and html rendering | Missing: display currently uses value/textContent. Add explicit image and authored rich-content/renderer binding while keeping text the default. |
| G06 | validate, declarative rules, focusout/Enter and validate-scroll | Core rules/drafts/off-page validation exist; interaction and reveal-error equivalence remains open. |
| G07 | row_data_changed__, row_data_deleted__, data_changed__ | Missing visible status/deletion policies. Rows tracks changes, but entries excludes removed rows; marked deleted-row views require an explicit contract. |
| G08 | select, unselect, onBeforeSelect, row-click toggle | Partial single-ID selection; define deselection, veto and row-click behavior. |
| G09 | multiselect, selected projection, array select | Missing; multiple selection, range gestures and selected-ID results are required. |
| G10 | check, checkAll/checkAllTarget/checkSingleTarget | Missing separate check state, exclusive checking and scoped check-all synchronization. |
| G11 | sortable, sortableItem, grid.sort | Partial comparator/aria-sort exists; header activation and direction toggling need framework-owned behavior. |
| G12 | filter, data-filter, grid.dataFilter | Partial predicate exists; distinct-value selection, search/counts and filter indicators are missing. |
| G13 | height, fixedcol, fixHeader/fixColumn, fixed footer | Authored sticky/grouped examples exist. Footer and integration with column/viewport state need complete proof. Never copy headers. |
| G14 | resizable/resize, show/hide, more column chooser | Partial: M10.5 implements state, preferred width, pointer/keyboard resize, reorder and show/hide with authored controls. Legacy chooser/options/callback edge closure remains open; no omission approved. Reorder is an explicit added requirement. |
| G15 | vResizable/vResize, scroll lock and action-driven scroll | Missing height-resize interaction and reveal policies; authored CSS may supply dimensions/containment. |
| G16 | more detail Form/Popup, previous/next validation | Missing integrated row detail behavior. Existing Popup/Form are its foundations. |
| G17 | data-rowspan, rowSpanIds, grid.rowSpan | Missing data-driven repeated-value merging; authored header spans are a different behavior. |
| G18 | pastiable, grid.paste, readonly/disabled handling | Missing bulk paste through existing raw parsing and validation with explicit failure semantics. |
| G19 | createRowDelay, scrollPaging, append binding | Partial local paging exists; progressive loading/scheduling remains open. Real scroll virtualization is additionally required; initialPage and cache release do not supply it. |
| G20 | rowHandlerBeforeBind/rowHandler/onBind, empty display, hover | Partial lifetime/CSS behavior exists; row hooks and empty/result/status markup need contracts. |

## Other data UI and containers

Legacy symbols are NU.* in natural.ui.js and NUS.* in natural.ui.shell.js. Current native/browser compositions may cover a feature only after its behavior and failure paths are demonstrated.[^legacy-ui][^legacy-shell][^form][^list]

| ID | Legacy behavior / evidence | Current status and required work |
|---|---|---|
| U01 | form.bind/val; grouped inputs and image/rich display | Partial: nested raw/display/drafts exist; image/rich binding and complete control parity remain. Coordinate with G04/G05. |
| U02 | form.unbind/add/remove/revert/update, initial defaults | Partial shared CRUD; authored-default reset, insertion and creation from entered fields need explicit workflows. |
| U03 | onBeforeBindValue/onBindValue/onBeforeBind/onBind | Partial parser/rule hooks; rendering observation/veto and initialization ordering require coverage. |
| U04 | list.bind/select/data/validate, unselect | Core single selection/display; row-click and deselection policy remain open. |
| U05 | Editable List row Form, list.val/update | Missing inline editing: current List disables bound controls and rejects radio fields. Share Form/Grid semantics. |
| U06 | List multiselect/check/checkAll/checkSingle/onBeforeSelect | Missing; use stable IDs and explicit selection/check scope. |
| U07 | List indexed add/move/copy/append/addSelect | Partial shared CRUD; insertion, order, copy and append behavior remain. |
| U08 | List height/scrollPaging/createRowDelay/reveal/vResize | Partial CSS/local paging; progressive scrolling, height resize and reveal remain. |
| U09 | select.bind/val/index/remove/reset/append | Core native single/multiple choices; document and test removal, index and authored-default reset equivalence. |
| U10 | Select-generated radio/checkbox choice groups | Missing authored item templates, label IDs and instance-scoped names. Static Form groups are insufficient. |
| U11 | countPerPageSet, previous/next set, currPageNavInfo | Partial controlled Pagination; configurable number windows and set-jump navigation are missing. |
| U12 | Button enable/disable, anchor blocking, creation hooks/style | Native button/CSS replacement; verify anchor activation blocking and hook workflow. No mandatory visual theme. |
| U13 | Alert/confirm results, veto, modal/Escape/backdrop/lifetime | Partial native dialog/Popup composition; reusable authored message/confirm interactions need full examples/contracts. |
| U14 | Element overlays, input tooltips, message arrays/timeout | Missing arbitrary contextual messages and scoped blocking beyond Form validation. |
| U15 | Nonmodal dialog, hide/reopen retention, title dragging | Missing capabilities. Native top layer/CSS replaces layering machinery while retaining supported interactions. |
| U16 | Popup preload, retained reopening, loading/input/output | Partial current per-opening lifecycle; preload and retained controller/state need an explicit policy. |
| U17 | Tabs preload/stateless, activation input, enable/disable/overflow | Partial lazy retained tabs. Native disabled is recognized; live focus reconciliation, preload, recreation and activation input remain. |
| U18 | Tree folderSelectable, label toggle, expand/collapse | Partial hierarchy/keyboard exists; leaf-only/folder policies remain. Expand/collapse-all composition needs proof. |
| U19 | Tree checkbox cascade, mixed parent state, leaf/all queries | Missing cascading check state and onCheck contract. |
| U20 | DatePicker input attachment/show/hide veto/value sync | Partial explicit controlled calendar/Form composition; declarative attachment and cancelable interactions remain. |
| U21 | monthonly, year/month selection, holidays, swipe/wheel | Missing month mode, direct period navigation, named holiday markers and pointer gestures. |
| U22 | Notify HTML/actions/URL callback/expiry/dismissal | Partial persistent plain text. Rich authored content/actions and optional accessible expiry remain required. |
| U23 | Documents MDI/SDI, duplicate identity, activation/reload/context | Partial dynamic MDI; SDI replacement and typed cross-page metadata/input remain. |
| U24 | maxTabs/maxStateful/removeState, insertion, close-all/menu/overflow | Missing capacity, page-state eviction with retained entries, bulk-close, menu and reveal policies. |
| U25 | docsFilter__ request aggregation/exclusion/progress/errors/blocking | Missing scoped request aggregation and overall state; replace global filters with explicit ownership. |

## CVC, communication and declaration coverage

The existing explicit runtime and shared store are retained. These rows distinguish changes to mechanisms from uncovered application behavior.[^legacy-architecture][^legacy-data][^legacy-template][^page][^comm][^data]

| ID | Legacy behavior / evidence | Current status and required work |
|---|---|---|
| C01 | Controller mounting/init/reload and view scope | Core explicit factories, root/input and cancellation exist; crosswalk remaining hooks/options before full closure. |
| C02 | Remote HTML loading through communication filters | Partial: mountPage fetches views directly; add a typed loader/transport connection shared by all page containers. |
| C03 | Executable block HTML and automatic controller discovery | Review: current runtime rejects executable HTML. Batch proposal must name the lost workflow and explicit ESM/inert-HTML replacement. |
| C04 | Ordered request filters, error and completion phases | Partial prepare/after/decode; preserve error/finalization and ordered composition with scoped typed hooks. |
| C05 | Default POST, GET q=JSON, dataIsArray, old server payloads | Partial explicit methods/body exist; supply tested transport/payload migration recipes. Existing server workflows must work without a generic utility package. |
| C06 | Controller before/after/around/error AOP and pointcuts | Review: arbitrary global interception is absent. Compare typed lifecycle/wrapper alternatives before any exclusion. |
| C07 | TEMPLATE p/c/e assembly, code loading, deferred init/search wiring | Review of runtime parser; preserve useful typed declarations, async ordering and code-data loading. Do not call this framework-reachable module unused. |
| C08 | Arbitrary delegated actions inside Grid/List rows | Missing stable RowId context for events beyond onSelect; add a typed row-action/event hook. Native listeners alone cannot recover private identity maps. |
| C09 | DataSync shared editing/subscription lifetime | Core caller-owned Rows supplies the behavior; verify remaining use cases without a DOM/global registry. |
| C10 | rowStatus/revert/save projection and data values | Core changes/revert exists; old payload conversion and JSON-compatible value boundaries need explicit equivalence/review. |
| C11 | Dynamic formatter/validator catalogs/local extensions | Core retained rules exist; protect indirect HTML/configuration/row-form reachability. Global registration/configuration gets a crosswalk. |
| C12 | Date formatter attaches date/month picker | Partial explicit calendar exists; automatic/declarative attachment remains open and depends on U20/U21. |
| C13 | Global locale/defaults/context/instance discovery | Review global registry mechanism; preserve consistent app configuration/localized results and typed handle/service workflows. |
| C14 | N.code runtime inspection/custom findings/sourceURL | Review optional shipped inspector; evaluate build-time checks and ESM maps with explicit lost custom/runtime behavior. |
| C15 | Handler enumeration/priority, expression filters, helper families | Review public introspection/evaluation workflows; preserve owning UI event/filter behavior with standards and private code. Unrelated convenience helpers use the separate removal rule below. |

# Next action

Continue P0 Grid/UI/options/dynamic closure and prepare one complete retirement proposal before requesting that decision. M10.5 column state is implemented; use [its detailed plan](m10-columns-plan.md) for evidence and boundaries, then plan selection/check/filter as M10.6. New public contracts receive representative HTML/TS and tests before implementation. Use [the execution plan](feature-parity-plan.md) for order and acceptance.

# Decisions

- All 60 rows above are open for full parity review, including rows marked core. Close a row only with equivalent behavior and representative validation, or the user's explicit exclusion decision. A current binder name alone never proves coverage.
- Required additions G09/G14/G18/G19 are accepted scope. They are no longer optional post-release candidates. Reorder and virtualization are explicit new requirements, not invented historical features.
- Existing TS/ESM, jQuery removal, authored HTML/CSS, unique-ID binding, Apache-2.0 root and preserved LGPL v1 remain approved. The new review does not ask to approve them again.
- An obsolete implementation detail can be rewritten using standards when its supported outcomes remain. A lost user capability goes into the consolidated review. No candidate is considered approved by silence or elapsed time.
- A utility/library is removable only after direct, transitive, declaration, configuration and rule reachability establish that the framework needs none of its behavior. Replaceable used helpers are rewritten near their owner; they are not labeled unused. Do not preserve unrelated utilities in another package.
- Known legacy defects such as aliased row copying, ignored object-rule options or broken tab-limit branches are repaired around intended behavior; they do not justify silently dropping that capability.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-10-05 | Scope instruction | Full 1.x framework coverage and six explicit Grid capabilities are required before release preparation. No new omission approved. |
| 2026-10-05 | Initial source audit | Independent Grid, other UI/shell and core reviews identified these gaps against 80e1fb3. Eight-file parser checklist generated; per-option mapping and dynamic/configuration closure remain open. Runtime source and historical tests are unchanged. |
| 2026-10-05 | Detailed structural mapping | All 775 entries have profile-owned obligations. Independent Core/Grid audit and the root's separate UI AST/default/reference checks confirm structural coverage. The 53 identified dynamic groups remain semantically open; no runtime parity, unused-helper proof or omission approval is claimed. |

# Open questions

P0 must close behavior equivalence for mapped literal/merged options, dynamic dispatch and callback edge cases, then finish the consolidated retirement proposal. Manual assistive-technology review and actual token telemetry remain open. Structural mapping is complete for the eight-file checklist; exhaustive behavioral closure and current 2.0 parity are incomplete.

[^surface]: Eight-file AST surface checklist and extraction limits
[^extractor]: Reproducible private development audit
[^legacy-ui]: Preserved data and page component behavior
[^legacy-shell]: Preserved notification and document behavior
[^legacy-architecture]: Preserved controller and communication behavior
[^legacy-data]: Preserved synchronization and dynamic rules
[^legacy-core]: Helper reachability and core behavior
[^legacy-template]: Preserved declaration and row-event behavior
[^legacy-code]: Optional runtime code inspection
[^ui]: Current public UI contracts
[^grid]: Current Grid implementation
[^list]: Current List implementation
[^form]: Current Form implementation
[^page]: Current CVC runtime and HTML transport
[^data]: Current shared Rows contract
[^core-mapping]: Detailed core surface and dynamic reachability mapping
[^grid-mapping]: Detailed Grid surface, configuration and dynamic mapping
[^ui-mapping]: Detailed other UI and shell surface and dynamic mapping
[^comm]: Current communication hooks
