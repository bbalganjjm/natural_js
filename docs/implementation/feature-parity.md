---
type: Plan
title: Natural-JS 2.0 framework feature coverage
description: Source-backed legacy behavior gaps, required additions, and pending consolidated retirement review.
tags: [meta, plan, migration, parity]
status: draft
sources:
  - id: grid-acceptance
    resource: evidence/m10964-grid-acceptance.json
    title: Current Grid contract witnesses and retained obligations
    git_blob: bdaa8758faef962ea527f5cf505a5148a265a684
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
    git_blob: 6dae7f254a9f274e495941fb84da08963f8f2db3
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current Grid implementation
    git_blob: 567439878a74284e7a1f60c6898d636322c190e5
  - id: list
    resource: ../../src/ui/list.ts
    title: Current List implementation
    git_blob: be00786b8aa50a9ef64af11d5402298cdbc065b3
  - id: form
    resource: ../../src/ui/form.ts
    title: Current Form implementation
    git_blob: 199f3b8772468bf5477797c7b8e4fe9d745b8907
  - id: page
    resource: ../../src/page/index.ts
    title: Current CVC runtime and HTML transport
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: data
    resource: ../../src/data/index.ts
    title: Current shared Rows contract
    git_blob: 38faf810b59fecebd9e0d0e7ee8a935b480bcecd
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
generated: { by: codex/gpt-6, at: 2026-10-31T08:28:09Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-31T08:28:09Z }
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

The detailed JSON records preserve the 2026-10-05 audit snapshot. Use the family table below and the current milestone plans for later implementation status, including M10.6; an older counterpart gap in that snapshot does not override current tested behavior.

# Steps

## Grid coverage

Legacy symbols are in natural.ui.js; current equivalents are bindGrid, GridHandle and caller-owned Rows.[^legacy-ui][^grid][^ui][^data]

| ID | Legacy behavior / evidence | Current status and required work |
|---|---|---|
| G01 | data, bind, add, remove, revert, val, update | M10.9.4 adds atomic clean loaded append, explicit Grid refresh and captured native defaults combined with application-owned typed factories. M10.9.6.1 adds immutable loaded original access without changing RowSnapshot or the save payload. Existing shared CRUD/change tracking remains. Legacy projections, callback/options and dynamic semantic closure remain required; see [the lifecycle contract](m10-lifecycle-plan.md). |
| G02 | addTop, indexed add, move, copy | M10.9.1 adds insertion before a live RowId, identity-preserving movement and deeply independent committed-value copy in shared Rows. M10.9.4 exposes input-only defaults while retaining typed business factories and Rows.add ownership. Native order, tombstones, no-ops and one notification remain explicit. UI/options/dynamic closure remains required; this does not close the entire family. |
| G03 | tbody template, contextBodyTemplate | M10.9.2 implements authored tbody multi-tr records alongside the existing single tr form. One RowId owns the complete block, nested fields, actions, drafts, columns and measured viewport lifetime; see [the row-block contract](m10-row-blocks-plan.md). Remaining dynamic template-option equivalence still needs P0 semantic closure. |
| G04 | Row Form radio/checkbox groups, multiple Select and input types | M10.9.3 adds cross-tr radio/repeated-checkbox groups, document-unique native radio names, raw typed multiple Select arrays and native string/date/range/hidden inputs through shared private field semantics. Mixed native radio form owners fail before binding. File remains local Form only; legacy option/dynamic closure remains required. See [the control contract](m10-controls-plan.md). |
| G05 | Row Form img.src and html rendering | M10.9.3 binds native image src and explicit synchronous Form/Grid render functions returning fresh same-document nodes, text or null. Plain strings remain text; authored control/error ownership and exact Form child-node restoration are enforced. No string-to-HTML option or renderer registry is added. Legacy option/dynamic closure remains required. |
| G06 | validate, declarative rules, focusout/Enter and validate-scroll | M10.9.3 shares programmatic/native disabled/length/sanitization constraints and adds change/blur/manual timing, native-aware Enter and current-page first-error reveal/focus. Released invalid rows lose stale element references after reveal. Existing rule/draft and off-page contracts remain; full legacy option/dynamic closure remains required. |
| G07 | row_data_changed__, row_data_deleted__, data_changed__ | M10.9.4 adds canonical status projection, every physical tr's data-row-status and the table's pending data-changed flag. Explicit deleted views use inclusive enumeration, protect native editing/selection/checks/validation/paste, split status merge boundaries and allow authored Undo actions. M10.9.6.1 retains the last committed edited value for display and exposes its immutable loaded original separately; deletion payloads still use the original. Rows-backed Form/Grid mark exact committed raw field paths, including nested siblings/groups/Selects, and clear state on revert. The [change-state contract](m10-change-state-plan.md) records acceptance. Remaining G07 options and dynamic semantics stay required; this foundation does not close the family. |
| G08 | select, unselect, onBeforeSelect, row-click toggle | M10.9.6.4 adds selectOnRowClick through the existing atomic selection owner, with native exclusions, original events, every physical record row and an available keyboard alternative. toggleSelection retains its explicit policy; programmatic select stays absolute. Full default/global-callback equivalence remains cross-owner work; this does not close the family. |
| G09 | multiselect, selected projection, array select | Independent selected IDs, absolute replacement, Ctrl/Meta toggle, Shift range and scoped keyboard remain. M10.9.6.4 tests current raw active/batch/checked projections, own-key field picks, scope intersection and append versus replacement through existing APIs. Remaining shared default/callback semantics stay open. |
| G10 | check, checkAll/checkAllTarget/checkSingleTarget | M10.9.3 adds zero-or-one exclusive checks through the existing atomic veto/callback paths; scoped check-all preserves/replaces/rejects for zero/one/multiple eligible IDs. Active, selected and data-checkbox state stay independent. Existing scope/eligibility/mixed controls remain; legacy option/callback/dynamic closure is still required. |
| G11 | sortable, sortableItem, grid.sort | Core: application comparator, aria-sort and authored ascending/descending/clear header activation are implemented; legacy option/edge closure remains open. |
| G12 | filter, data-filter, grid.dataFilter | M10.9.6.2 retains zero-count choices within the manual/status domain and adds authored Apply/Enter matching-value replacement while preserving preview-only input and the old Clear contract. Raw scalar/count/cache/failure boundaries remain explicit. Legacy indicators/options and full semantic acceptance stay required. |
| G13 | height, fixedcol, fixHeader/fixColumn, fixed footer | M10.9.5 measures top and bottom sticky bands through the existing viewport, including multi-row footers, managed columns, resized roots and multi-tr records. Native nonvirtual scrolling uses authored scroll-padding/margins. M10.9.6.4 retains specific acceptance for two or more horizontally pinned columns: cumulative offsets after resize/hide/reorder in grouped and responsive positioned-root layouts. Native table structure stays intact; full legacy option/dynamic closure remains required. |
| G14 | resizable/resize, show/hide, more column chooser | M10.5 retains native topology, resize/reorder/show/hide. M10.9.6.2 composes authored business-column checkboxes/All/mixed/count with a separate retained actions/recovery column. All business columns can hide; all physical columns cannot. Chooser state derives from columns(), with no new public component. Full legacy options/callback closure remains open. |
| G15 | vResizable/vResize, scroll lock and action-driven scroll | M10.9.5 retains authored height controls and aligned reveal. M10.9.6.2 adds tested application recipes for accepted select/check/indexed/front/end add, nonempty append and last-invalid visual-page reveal, with opt-out/veto/offpage guards. Exact remaining default/flag, CSS dimension and dynamic semantics remain required; no automatic retirement. |
| G16 | more detail Form/Popup, previous/next validation | M10.9.5 composes one authored CVC detail page in main content and Popup, sharing Form/Rows and current Grid rowIds scopes. Previous/next and authored close/native cancel validate; navigation skips tombstones, re-reads projection and handles paging, stale IDs and focus restoration independently of Grid selection. General Popup guard/dragging and full more/options/dynamic equivalence remain with their owning parity work. |
| G17 | data-rowspan, rowSpanIds, grid.rowSpan | M10.9.2 implements display-only raw-key hierarchical native merging, recomputed on the current projection and split at mounted/page/focus boundaries. M10.9.4 also splits differing row statuses without changing raw hierarchical keys. Natural physical-row heights are preserved without expanding equal-value runs. The [row-block contract](m10-row-blocks-plan.md) retains later legacy option/dynamic semantic closure. |
| G18 | pastiable, grid.paste, readonly/disabled handling | M10.7 implements quoted plaintext paste through existing raw parsing/rules, typed nested choices, protected field positions and one atomic Rows batch. Explicit overflow, stale preparation and validation failures preserve stored values and drafts; see [the detailed plan](m10-paste-plan.md). Full option/dynamic parity remains subject to P0 closure. |
| G19 | createRowDelay, scrollPaging, append binding | M10.9.6.3 adds opt-in already-loaded logical chunks, task yielding, uniform first/last/available completion, owned Promise cancellation/retry and append without prefix holes. Mounted viewport widgets stay bounded. Next/bottom-scroll and immediate CVC abort disposal are explicit application compositions; no fetch loader or generic scheduler is introduced. Full legacy option/callback/dynamic equivalence stays open for .4/P0; this does not close the family. |
| G20 | rowHandlerBeforeBind/rowHandler/onBind, empty display, hover | M10.9.4 adds synchronous callbacks on table-attached rows with CVC-style owned cleanup, explicit full-bind completion, authored empty markup, application counters and resource-safe refresh/retry. Document connection depends on the table root. Callback failure/disposal/reentry preserves committed data and notifications; failed rollback cannot overwrite newer work. Hover styling remains authored. Full legacy option/callback/dynamic equivalence stays open. |

## Other data UI and containers

Legacy symbols are NU.* in natural.ui.js and NUS.* in natural.ui.shell.js. Current native/browser compositions may cover a feature only after its behavior and failure paths are demonstrated.[^legacy-ui][^legacy-shell][^form][^list]

| ID | Legacy behavior / evidence | Current status and required work |
|---|---|---|
| U01 | form.bind/val; grouped inputs and image/rich display | M10.9.3 adds native image src and explicit Form/Grid DOM display, with local Form raw-value caching and authored child-node restoration; common native read/write/constraint behavior is shared privately. Nested raw/display/drafts and Form groups remain. Full control/option/callback/dynamic parity stays open with G04/G05. |
| U02 | form.unbind/add/remove/revert/update, initial defaults | Partial shared CRUD; authored-default reset, insertion and creation from entered fields need explicit workflows. |
| U03 | onBeforeBindValue/onBindValue/onBeforeBind/onBind | Partial parser/rule hooks; rendering observation/veto and initialization ordering require coverage. |
| U04 | list.bind/select/data/validate, unselect | Core single selection/display; row-click and deselection policy remain open. |
| U05 | Editable List row Form, list.val/update | Missing inline editing: current List disables bound controls and rejects radio fields. Share Form/Grid semantics. |
| U06 | List multiselect/check/checkAll/checkSingle/onBeforeSelect | Missing; use stable IDs and explicit selection/check scope. |
| U07 | List indexed add/move/copy/append/addSelect | M10.9.1 supplies shared ordered insertion/movement/independent copy and List order/focus/error integration. List-specific addSelect/default/append/dynamic workflows remain required. |
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
| C08 | Arbitrary delegated actions inside Grid/List rows | Grid onRowAction supplies typed button context. M10.9.6.4 composes arbitrary native post-edit observation from onRowBind-owned physical-row identity and a root listener installed after Grid delegation; invalid/manual drafts do not imply commits. Generic declaration assembly and List event/edit behavior remain required. No extra Grid event engine is needed for the tested outcome. |
| C09 | DataSync shared editing/subscription lifetime | Core caller-owned Rows supplies the behavior; verify remaining use cases without a DOM/global registry. |
| C10 | rowStatus/revert/save projection and data values | Core changes/revert exists; old payload conversion and JSON-compatible value boundaries need explicit equivalence/review. |
| C11 | Dynamic formatter/validator catalogs/local extensions | M5.1 adds RuleSet.fields declarations through existing Form/Grid/List/Tree rule callers, effective HTML overrides and explicit shared/local composition. Retained catalogs remain private; global registration/configuration and full dynamic closure still require their crosswalk. |
| C12 | Date formatter attaches date/month picker | Partial explicit calendar exists; automatic/declarative attachment remains open and depends on U20/U21. |
| C13 | Global locale/defaults/context/instance discovery | M5.1 supplies explicit application-owned shared/local RuleSet composition and scoped locale/messages. Arbitrary global callbacks/default lifecycles, context and instance discovery remain required for review. |
| C14 | N.code runtime inspection/custom findings/sourceURL | Review optional shipped inspector; evaluate build-time checks and ESM maps with explicit lost custom/runtime behavior. |
| C15 | Handler enumeration/priority, expression filters, helper families | Review public introspection/evaluation workflows; preserve owning UI event/filter behavior with standards and private code. Unrelated convenience helpers use the separate removal rule below. |

# Next action

Continue P0 options/dynamic closure and prepare one complete retirement proposal before requesting that decision. M10.5 column state and the M10.6 selected/check/filter contract are implemented; their detailed plans preserve gates and boundaries. M10.7 adds atomic paste and M10.8 adds measured viewport rendering within their detailed contracts. [M10.9.1](m10-parity-plan.md) ordered Rows, [M10.9.2](m10-row-blocks-plan.md) authored row blocks/merging, [M10.9.3](m10-controls-plan.md) controls/display/validation and [M10.9.4](m10-lifecycle-plan.md) status/row lifecycle retain their own completion evidence. [M10.9.5](m10-detail-plan.md) adds authored CVC details, height controls and aligned reveal. The [M10.9.6 continuation](m10-closure-plan.md) preserves a complete 89-entry/17-group planning audit at 7a36a39. Its .1 slice implements committed-field changes and edited deletion display; .2 adds interaction/view controls and .3 adds cooperative logical binding/completion. .4 semantic acceptance remains required. All twenty audit families remain open pending their full obligations. New public contracts receive representative HTML/TS and tests before code. Use [the execution plan](feature-parity-plan.md) for order and acceptance; full family closure and M13 remain required.

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

The [current Grid acceptance ledger](evidence/m10964-grid-acceptance.json) resolves every frozen surface/dynamic record through thirty current contracts with exact test witnesses. The [pinned-column continuation](m10-pinned-plan.md) adds selected pin, wheel-boundary and reduced-detail witnesses without changing that historical ledger. Tested local compositions do not settle shared configuration, programmatic field rules, incoming status/wire formats or arbitrary runtime discovery. Keep their owning obligations explicit rather than repeating already implemented Grid work.[^grid-acceptance]

The [M5.2 continuation](m5-state-plan.md) adds selected incoming-state/checkpoint, retained-anchor and application wire witnesses at the existing Data/communication owners. It preserves all inherited surface/dynamic records and full-family obligations. General value/schema equivalence, remaining hooks/default lifecycles, other UI/CVC parity and unvalidated-paste policy remain open.

P0 must close behavior equivalence for mapped literal/merged options, dynamic dispatch and callback edge cases, then finish the consolidated retirement proposal. Manual assistive-technology review and actual token telemetry remain open. Structural mapping is complete for the eight-file checklist; exhaustive behavioral closure and current 2.0 parity are incomplete.

The [M5.3 continuation](m5-form-options-plan.md) adds selected Rows-backed nested Form choices and shared Form/Grid/List occurrence handling. It removes manual detail-screen option conversion while preserving unmarked/local Forms. Wider bind-value callbacks, Form raw rendering, List editing, Tree validation and remaining owner/P0/M13 obligations stay required; no full-family closure or omission is inferred.

[^surface]: Eight-file AST surface checklist and extraction limits

[^grid-acceptance]: Current Grid contract witnesses and retained obligations
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
