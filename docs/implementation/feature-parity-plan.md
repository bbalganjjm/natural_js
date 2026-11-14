---
type: Plan
title: Natural-JS 2.0 full feature implementation plan
description: Staged completion of required legacy behavior and advanced Grid features before release preparation.
tags: [meta, plan, migration, parity]
status: draft
sources:
  - id: inventory
    resource: evidence/p01-inventory-verification.json
    title: Accepted known source-case assignment and retained runtime boundaries
    git_blob: 752884fca41d6e4e911fd2194dac7e104fdcbad7
  - id: omission
    resource: omission-decision.md
    title: Exact five approved omissions and retained obligations
    git_blob: 3480707796d751619a98ae094b61a294d63e74af
  - id: remaining
    resource: evidence/remaining-work-plan.json
    title: Fixed 56-stage continuation and exact known-record ownership
    git_blob: a18ff58091c2eb8d8050ba8222d6b3285a078a11
  - id: coverage
    resource: feature-parity.md
    title: Initial source-backed coverage ledger
    git_blob: 9cd81c778f355813b4a73e7f3d3fa9eeb26751f0
  - id: roadmap
    resource: roadmap.md
    title: Milestone governance and current scope
    git_blob: 492b2e46db6a3c0635ebcf0bde7a8eef1adbc41d
  - id: grid-history
    resource: m10-plan.md
    title: Selected Grid implementation and historical measurements
    git_blob: 37301b3aa0d7962fee1e0a4042ab72ee9d2eb4f0
  - id: architecture
    resource: ../v2/architecture.md
    title: Implemented module ownership and private sharing
    git_blob: fe4c5390a9868290635d1edd28286acf1be52c79
  - id: data
    resource: ../../src/data/index.ts
    title: Current RowId and shared Rows implementation
    git_blob: 38faf810b59fecebd9e0d0e7ee8a935b480bcecd
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current authored table implementation
    git_blob: 09718101d01218f9b891e37efce4ab5dd5dfada3
  - id: form
    resource: ../../src/ui/form.ts
    title: Current input, draft and validation ownership
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
generated: { by: codex/gpt-6, at: 2026-11-14T18:01:25Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T18:01:25Z }
---

This plan applies the user's 2026-10-05 scope correction: all 1.x framework capabilities remain required unless the user approves a specific omission in one consolidated review. Column resize, reorder and hide, multiple selection, bulk paste and true scroll virtualization are mandatory. Existing implementations and immutable evidence remain useful; their selected completion does not establish full parity.[^coverage][^roadmap]

# Goal

The [fixed continuation](remaining-work-plan.md) assigns every remaining outcome to 56 numbered steps and terminal IDs. It is the single detailed execution sequence; the family tables here retain scope and historical selected contracts. All structural/dynamic/supplemental records resolve through the registry without treating old snapshot gaps as current missing code.[^remaining]


[M5.12](m5-form-source-plan.md) executes application receive normalization, full own-source observation and committed Rows notifications with existing Form/data owners and the actual CVC demo. No new observer, nullable field context or dataset is justified by the examined caller. Exact legacy per-key timing, no-op callbacks and silent post-notification mutation remain defect-sensitive unresolved obligations; selected recipe acceptance does not close a family or approve an omission.[^form][^data]

[M5.11](m5-grid-callbacks-plan.md) addresses only construction-time capture and plain invocation of Grid row/completion callbacks, including physical attachment. Existing Form/value callback contracts provide the consistent model. Legacy source-backed local Form recipes do not establish a true DOM-only callback contract; per-unbound-key bind/val timing and legacy instance/initial-selection workflows remain explicit unresolved obligations. No family is closed or capability omitted by this slice.[^grid][^form]

Complete framework behavior through consistent, readable TypeScript while preserving CVC, authored HTML/CSS, document-unique IDs, nested binding, accessible interaction and measured binding performance. Keep application business rules outside the framework. Minimize agent context, API surface, duplicated processing, hidden conventions and test/debug effort.

# Checkpoint

- The original 2026-10-05 scope-correction baseline is 80e1fb3 on 2.0.0-alpha.0; current.md identifies the current accepted implementation. M0-M12 selected work is recorded in the existing plans; the M12 artifact remains unpublished. Runtime source and past evidence are unchanged by this scope correction.
- The initial coverage ledger has 60 behavior families. Its eight-file AST checklist records 43 classes, 394 members and 338 literal constructor option keys. Neither count proves exhaustive behavior coverage; merged defaults, dynamic declarations, aliases and callback ordering need P0 closure.[^coverage]
- Only the exact O01-O05 omissions are explicitly approved. All unlisted outcomes remain required; previous deferred/excluded behavior retains its current owner.[^omission] Already approved TS/ESM, new API naming, jQuery removal, unique IDs, root Apache-2.0 and preserved LGPL v1 do not need approval again.
- Release-candidate preparation is blocked by required feature gaps. npm publication and release tags additionally require personal testing and a later explicit request. Only real macOS/iOS Safari is outside browser scope; available Windows engines remain required.

M10.5 implements authored column state and controls; [its detailed plan](m10-columns-plan.md) preserves its gates. M10.6 implements independent selection/check sets, scoped checks, native header sort/filters and stable actions; [its plan](m10-selection-plan.md) records the contract and current gates. P0.1 known source-case assignment is independently accepted and pushed as cf2210f, including all 775 structural records, 53 dynamic groups, 750 supplemental UI records and original findings/contracts/acceptance. Runtime/full-family and final P0 semantic closure remain open. The user approved only the exact five O01-O05 omissions through the original question. Preserve the immutable pending-at-capture proposal and separate approval; do not restart the inventory or request the same decision again. Historical measurements retain their original source/artifact identities.[^coverage][^inventory][^omission]

# Steps

## Fixed remaining ownership

| Owner | Fixed remaining IDs | Count |
|---|---|---|
| P0 inventory/decision | P0.1-P0.2 | 2 |
| Common CVC/communication | M3.1-M3.8 | 8 |
| Data/Form | M5.14-M5.20 | 7 |
| Data UI | M6.1-M6.7 | 7 |
| Dialog/Popup/Tabs | M7.1-M7.5 | 5 |
| Grid completion | M10.9.7-M10.9.9 | 3 |
| Tree/date | M11.1-M11.4 | 4 |
| Notify/Documents/shell | M12.1-M12.4 | 4 |
| Whole-framework acceptance | M8.1-M8.6 | 6 |
| Whole-code review/remediation | M13.1-M13.4 | 4 |
| Personal acceptance/release/repository | M9.1-M9.6 | 6 |
| Total | 50 development/quality +6 conditional personal/delivery steps | 56 |

Read the numbered plan for each stage's exact scope, predecessors and exit tests. Existing declarations/rules/defaults and advanced Grid capabilities are reused; remaining implementation and semantic acceptance are separate tasks. P0.1 has assigned the known inherited/callback/configuration cases; P0.2 records approval of exactly five omissions; every other required outcome stays in the same owning stage.[^remaining][^inventory][^omission]

## P0. Inventory and one omission decision

Map each preserved member, option, event, declaration and reachable rule to a behavior-family ID, current equivalent, gap, owning module and acceptance check. Inspect defaults merged outside constructors and dynamic HTML/configuration dispatch. Separate legacy implementation defects from intended behavior. Use old types, examples and docs to resolve ambiguous public usage, then confirm it against source. Do not count a matching binder name or an absent static call as proof.

For each removal candidate record its direct/transitive/configuration/declaration/rule references, framework owner and replacement. Unused or unrelated convenience code can be removed within the user's existing authorization. Used helpers may be replaced by standards or private local code when behavior remains. Preserve Form-used formatter, validator, mask, date/time and byte processing. Do not create a separate convenience package.

The accepted source inventory and subsequent review narrowed genuine proposed losses to five: UI-blocking synchronous requests, JSONP, automatic response-script execution/controller discovery, executable string filter conditions and arbitrary external jQuery handler introspection/reordering. The [presented proposal](omission-decision.md) records exact boundaries, alternatives and migration costs. Every other R/GR behavior, including advice, typed declarations, configuration, custom inspection, standalone rules and useful callback outcomes, remains required. Rich notifications, expiry, Tree checks and month/holiday selection are implementation work.[^inventory][^omission]

The user answered the consolidated question and approved only O01-O05. Apply their exact boundaries and continue every other required implementation; do not infer broader approval. A native/ESM rewrite that preserves an already approved behavior does not require another approval. P0.1 inventory acceptance does not close runtime/full-family or final P0 semantic checks; each remains assigned to its fixed owner.[^inventory][^omission]

## Shared foundations and dependency order

Existing one-way module boundaries remain. Data owns RowId, row order, changes and subscriptions; DOM owns scoped template/event connection and necessary cleanup; UI owns control behavior, drafts and accessibility; page/comm own lifecycle/transport; applications own business formats, validators, row factories and server adapters.[^architecture][^data][^form]

Before dependent UI work, design the minimum ordered insert/move/independent-copy and atomic batch-update contracts required by Grid/List operations. Preserve stable IDs and one coherent notification for a successful paste instead of one rerender per cell. Validation failures must not mutate Rows. Avoid a generic transaction or data-processing platform.

Compile field/control plans once and reuse only identical control read/write, parsing, rule invocation and draft behavior across Form/Grid/editable List. Group controls and nested row-local Selects must share raw-value semantics. Arbitrary row actions need typed stable identity. Centralize document-unique ID/label/ARIA restoration and resource ownership where existing binders already share them. Keep column topology, resize/drag geometry, selection ranges, paste parsing and viewport calculations private to their UI owner unless another implemented feature genuinely needs identical behavior.

M10.9.2 extends M10.8's RowId-keyed viewport to indivisible authored tr groups and adjacent raw-key merges split at mounted/page boundaries. M10.9.3 reuses one private native-field owner across Form/Grid/List and one explicit display owner across Form/Grid; it keeps plain text/scalar fast paths and compiles group membership once. Later row/status/detail/geometry and semantic obligations remain required. Type declarations stay near their owner. Share a private file only for an established responsibility/reuse case; do not add a public utility entry point.[^grid][^form]

## Required Grid continuation: M10.5-M10.9

These are additional slices of M10, not a new compatibility framework. Retain the verified M10.1-M10.4 implementation and measurements as history.[^grid-history]

| Stage | Contract and implementation | Acceptance |
|---|---|---|
| M10.5 Column state | Stable authored column keys separate from field paths and DOM IDs; resize, reorder, show/hide and reset; simple readable/replaceable state and change callback. Define grouped-heading, colspan, sticky-column and footer behavior before code. Provide pointer and keyboard controls through authored markup. Applications may persist state; no global registry. | Two HTML/CSS layouts, nested fields, grouped headings, hide/reorder/reset consistency, keyboard/pointer operation, focus, duplicate-ID checks, multiple instances, invalid-state rollback and dispose restoration. |
| M10.6 Selection, checks and filters | Stable-ID single/multiple selection, range operations, deselection/veto and separate row-check state. Define visible/filtered/store check-all scopes explicitly. Add header sort activation/direction, authored distinct-value filtering/search/counts and typed row-action context. | Sort/filter/page/rebind retain correct identity; disabled rows, shift ranges and keyboard interaction; scoped check-all/mixed status; callbacks, canceled changes and row actions affect the correct row. |
| M10.7 Bulk editing | Tab/newline paste through existing field parse/rules/drafts, nested paths and typed choices. Specify quoted/multiline input, overflow, readonly/disabled skipping and failure reporting. Default to an atomic validated update; application-owned row factory if row creation is supported. | Valid paste produces one coherent change; invalid paste produces no partial Rows update; precise row/field errors; protected fields/IDs and nested choice values remain correct. Test large paste, cancellation, disposal and focus. |
| M10.8 Viewport rendering | Actual viewport-based bounded rendering with overscan and row identity, plus progressive scroll-loading compatibility. Preserve drafts, validation, checks and selection outside rendered rows. Define focused/editor-row pinning, variable/multi-line height, merge/group boundaries, scrolling and accessible row indices/counts. Local paging/cache release alone is not virtualization. | Large fixture has bounded live DOM/ownership; scroll/edit/paste/filter/reorder/reload/dispose preserve data and focus; no offscreen error loss or late writes. All browser engines exercise keyboard and ARIA state. |
| M10.9 Remaining Grid parity | Grouped body templates, repeated-value row merging, visible changed/deleted policies, detail Form/Popup previous/next, empty state, row/bind hooks, append, height resize and action-driven reveal. Resolve all G01-G20 option/callback mappings. | Coverage ledger closes each Grid obligation with tests or an approved omission. Extend the existing full Grid demo with every implemented option/method and representative failures. No inactive demo controls pretending to implement features. |

M10.5 must publish compact HTML/TS examples and exact state/event/error/disposal types for review before implementation. Later slices receive their own detailed plan after the preceding results, including common-code reuse and cost observations. Avoid attempting column, selection, paste and viewport public contracts in a single unreviewable patch.

## Complete remaining legacy behavior through the existing milestones

The initial milestone order and history stay visible. Reopen the owning milestone's uncovered families; implement foundational dependencies before their consumers. Each row below needs its own compact detailed contract and test plan before code. These are required support obligations, not automatically excluded follow-up features.[^coverage]

| Owner | Required continuation and dependency |
|---|---|
| M3/M5: CVC, communication and declarations | Shared typed HTML loader/transport policy; ordered request/error/completion hooks; typed app configuration, declarations and asynchronous remote-code workflows; stable row-action context; tested old-server payload recipes and change projection. Resolve C01-C15 with the consolidated omission decision. |
| M5/M6: Form, List, Select, Pagination, Button | Complete native/group control matrix and explicit image/rich renderer behavior with text default; authored-default reset/create, bind hooks, editable List, check/multiple selection, ordering/copy/append/progressive render/reveal; generated radio/checkbox choices; configurable page-number windows/set navigation; native/anchor button blocking. Share control semantics with Grid. |
| M7: Dialog, Popup, Tabs | Authored alert/confirm/contextual messages and scoped overlays; nonmodal/retained reopen and dragging; Popup preload/state policy; Tabs preload/recreation/activation input/overflow and live disabled-focus reconciliation. Reuse the same CVC runtime and ownership. |
| M11: Tree and DatePicker | Folder/leaf selection policy, cascade/mixed checkbox state and queries; input/declarative calendar attachment, date/month mode, direct year/month navigation, holiday markers, selection/show/hide veto and pointer navigation. Keep calendar math private. |
| M12: Notify, Documents and shell | Authored rich messages/actions and opt-in accessible expiry with pause/interaction policy; SDI/MDI input/context, capacity and retained-entry page eviction, insertion/bulk close/menu/reveal; scoped aggregate request progress/exclusions/errors/blocking. Keep whole-app routing/business policy in application code. |
| M8/M9: Final parity and release validation | Close the full coverage ledger, migration recipes and installed API checks; replay the three fixed agent tasks under the same measurement method. Complete the mandatory [M13 whole-code review and remediation](m13-review-plan.md) before personal feature testing and separately requested release-candidate work. No registry publication or release tag during feature implementation. |

## Per-stage delivery and validation

1. Recover current.md; recheck preceding implementation and source intent.
2. Write goals, uncovered IDs, public HTML/TS contracts, minimal common-code responsibilities, change order, tests, docs and completion conditions. Distinguish required behavior from implementation machinery. Review changed core contracts through the existing milestone approval process; do not repeat the already approved feature scope or fragment the one omission decision.
3. Implement optimized direct code, smallest necessary types/options and deterministic error details. Compile bindings once, update affected fields and keep nested ownership/identity stable. Use modern browser features while preserving observable behavior.
4. Verify relevant unit and browser behavior, failures/cancellation/cleanup, two authored layouts, accessible keyboard/focus/labels and unique IDs in repeated/MDI views. Use Chromium, Firefox, WebKit and installed Chrome/Edge consumer gates as appropriate; real Safari remains excluded.
5. Update draft implemented API concepts, indexes, migration/demo and log in the same task. Independent source/test/doc review precedes verified stamps. Keep historical evidence immutable; do not recertify it with new timestamps.
6. Record defects, measured binding/DOM/update cost, agent retries/context/change extent/time and actual tokens when available. Context bytes are a separate proxy. Feed results into the next slice; pass changed docs with zero errors and record any full-check warnings.

Performance fixtures start with the existing 100/1,000-row binding budgets and 5,000-row Grid workload. Define viewport/large-paste data, measurement method and host-relative acceptance limits before implementation, including nested options, scrolling and cleanup. A bounded DOM claim requires real node/ownership evidence; do not infer it from local paging or assert a universal speedup.

# Next action

Follow orders 01-56 in [the numbered remaining plan](remaining-work-plan.md). The user authorized the separate M5.14-M5.20 stages and all necessary predecessors in one continuous run. P0.2 now records the exact five approved losses; all unlisted outcomes remain required. M5.20 closes the Data/Form shared-owner matrix; M10.9.7-M10.9.9 close concrete Grid validation/integration and all 89 surface entries, 17 dynamic groups, 30 contracts and 41 acceptance IDs; M8.1-M8.6 close core/UI/P0/docs/quality/agent acceptance before M13.1-M13.4. Personal acceptance and separately requested release/repository actions remain M9.1-M9.6. Existing-scope discoveries reopen their owner and do not create another unbounded continuation.[^remaining]

# Decisions

- Every uncovered supported behavior blocks full-parity release preparation until implemented or explicitly excluded by the user. Earlier selected completions remain accurate within their dated scopes.
- State/events/results follow the existing consistent handle model; UI declarations are not mutated into runtime handles. Prefer plain functions and objects and minimal public options over generic registration/extension engines.
- The main Grid demo grows with working features. Business formatting/validation/comparison stays in examples/applications and uses typed framework hooks.
- New code is refactored and measured even when it retains old behavior. Legacy jQuery logic, duplicate DOM IDs and general convenience libraries are not copied into 2.0.
- v1 source/license/docs and master remain untouched. Work and authorized pushes stay on 2.0.0-alpha.0.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-10-05 | Source-backed planning | Three independent audits and the initial AST checklist inform this plan. They establish concrete gaps, not full option closure or new runtime test results. |
| 2026-10-05 | Scope reconciliation | Six Grid additions and all 1.x framework behavior are mandatory; a single omission review remains to be completed. Historical runtime/artifact evidence is preserved. |
| 2026-10-05 | Independent planning review | Separate core/UI/Grid audits checked current-scope wording against source and current examples. The core reviewer independently reproduced all eight hashes and 43/394/338 structural counts. Its six document/JSON targets totaled 154,244 file bytes; AST/hash tooling read eight source files totaling 570,860 bytes. These are file-size/tool-input proxies, not actual tokens or full model context. Grid policy review checked ten target files totaling 134,726 file bytes; no runtime test or old performance result was rerun/recertified. |
| 2026-10-05 | Checklist reproduction | node tools/audit-v1-surface.mjs --check passed against preserved sources. The script is development-only and absent from package files; no dependency was added. |

# Open questions

P0.1 known source-case assignment is accepted. The exact O01-O05 decision is approved. Owning runtime/full-family acceptance and final P0 semantic checks remain separate and open. Remaining public contracts require their detailed slice review; implemented Grid contracts retain their original evidence. Manual assistive-technology testing and actual token telemetry remain open; available automated/browser checks must still run during implementation.[^inventory][^omission]

# M5.13 bounded U10 continuation

[M5.13](m5-choice-groups-plan.md) implemented authored native radio/checkbox generation before Form adoption and standalone choice replacement through one specific private descriptor owner. Stable zero/one/many checkbox arrays, native labels/names/defaults, exact string-code rendering, raw validation and reverse CVC cleanup preserve the actual legacy caller without copying generated forms or cardinality defects. Its adopted catalog lock is extended by M5.14 below; direct setValue/dispose remain locked. Broader Select/declaration/receiver/default equivalence stays required; that slice grants no U10/full-family closure or omission approval.[^form][^coverage]

# M5.14 live Form-owned catalogs

[M5.14](m5-live-choice-groups-plan.md) uses the existing setChoices method and a specific private group/Form handoff. The existing compiled field retains raw Rows, all row drafts, captured creation values, rules and display-cache ownership while controls, native lookup, error targets, reset subscriptions and focus follow the new catalog. Removed codes stay in committed data and drafts; zero/one/many choices remain valid catalogs. Ordinary failures restore old node identity and metadata; stale work cannot overwrite later source or ownership. The [two-layout example](../v2/choice-groups-example.md) and [API](../v2/choice-group.md) describe the implemented contract. Fresh full runtime and final independent evidence/document acceptance are recorded by the owning stage; this continuation does not close the whole U10 family.[^form]

[^coverage]: Initial source-backed coverage ledger
[^roadmap]: Milestone governance and current scope
[^grid-history]: Selected Grid implementation and historical measurements
[^architecture]: Implemented module ownership and private sharing
[^data]: Current RowId and shared Rows implementation
[^grid]: Current authored table implementation
[^form]: Current input, draft and validation ownership

[^remaining]: Fixed 56-stage continuation and exact known-record ownership

[^inventory]: Accepted known source-case assignment and retained runtime boundaries
[^omission]: Exact five approved omissions and retained obligations
