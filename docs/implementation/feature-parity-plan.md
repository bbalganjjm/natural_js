---
type: Plan
title: Natural-JS 2.0 full feature implementation plan
description: Staged completion of required legacy behavior and advanced Grid features before release preparation.
tags: [meta, plan, migration, parity]
status: draft
sources:
  - id: coverage
    resource: feature-parity.md
    title: Initial source-backed coverage ledger
    git_blob: 09603c7af0f86e44d5592473b1895cfb9524cf4a
  - id: roadmap
    resource: roadmap.md
    title: Milestone governance and current scope
    git_blob: 4cbd20e61c7ea08e4b412a0c92dd88461ed52cf9
  - id: grid-history
    resource: m10-plan.md
    title: Selected Grid implementation and historical measurements
    git_blob: 77243df06689b88428890e14698d28c937e31452
  - id: architecture
    resource: ../v2/architecture.md
    title: Implemented module ownership and private sharing
    git_blob: c76a49215f22870b65e454bf8f378866e4574ff8
  - id: data
    resource: ../../src/data/index.ts
    title: Current RowId and shared Rows implementation
    git_blob: 8316515489ad2fda7b04bdd88bb5772abc1c6cd9
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current authored table implementation
    git_blob: 87c70d9ca2a4d566dbdd25dd80c734d2dce16314
  - id: form
    resource: ../../src/ui/form.ts
    title: Current input, draft and validation ownership
    git_blob: 21df9a8451977f5d180d4a1170fd004da0c6dad9
generated: { by: codex/gpt-6, at: 2026-10-24T13:51:10Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-24T13:51:10Z }
---

This plan applies the user's 2026-10-05 scope correction: all 1.x framework capabilities remain required unless the user approves a specific omission in one consolidated review. Column resize, reorder and hide, multiple selection, bulk paste and true scroll virtualization are mandatory. Existing implementations and immutable evidence remain useful; their selected completion does not establish full parity.[^coverage][^roadmap]

# Goal

Complete framework behavior through consistent, readable TypeScript while preserving CVC, authored HTML/CSS, document-unique IDs, nested binding, accessible interaction and measured binding performance. Keep application business rules outside the framework. Minimize agent context, API surface, duplicated processing, hidden conventions and test/debug effort.

# Checkpoint

- The implementation baseline is 80e1fb3 on 2.0.0-alpha.0. M0-M12 selected work is recorded in the existing plans; the M12 artifact remains unpublished. Runtime source and past evidence are unchanged by this scope correction.
- The initial coverage ledger has 60 behavior families. Its eight-file AST checklist records 43 classes, 394 members and 338 literal constructor option keys. Neither count proves exhaustive behavior coverage; merged defaults, dynamic declarations, aliases and callback ordering need P0 closure.[^coverage]
- No proposed feature omission is approved. Previously deferred/excluded behavior must be reconciled with the latest instruction. Already approved TS/ESM, new API naming, jQuery removal, unique IDs, root Apache-2.0 and preserved LGPL v1 do not need approval again.
- Release-candidate preparation is blocked by required feature gaps. npm publication and release tags additionally require personal testing and a later explicit request. Only real macOS/iOS Safari is outside browser scope; available Windows engines remain required.

M10.5 implements authored column state and controls; [its detailed plan](m10-columns-plan.md) preserves its gates. M10.6 implements independent selection/check sets, scoped checks, native header sort/filters and stable actions; [its plan](m10-selection-plan.md) records the contract and current gates. The detailed evidence maps all 775 checklist entries across core/Grid/other UI and shell, with 53 identified dynamic path groups; structural coverage is checked, while semantic/dynamic closure remains open. Continue that closure alongside the remaining Grid/component slices and prepare the single omission proposal; no candidate omission has been applied. Historical measurements retain their original source/artifact identities.[^coverage]

# Steps

## P0. Close the inventory and prepare the single omission review

Map each preserved member, option, event, declaration and reachable rule to a behavior-family ID, current equivalent, gap, owning module and acceptance check. Inspect defaults merged outside constructors and dynamic HTML/configuration dispatch. Separate legacy implementation defects from intended behavior. Use old types, examples and docs to resolve ambiguous public usage, then confirm it against source. Do not count a matching binder name or an absent static call as proof.

For each removal candidate record its direct/transitive/configuration/declaration/rule references, framework owner and replacement. Unused or unrelated convenience code can be removed within the user's existing authorization. Used helpers may be replaced by standards or private local code when behavior remains. Preserve Form-used formatter, validator, mask, date/time and byte processing. Do not create a separate convenience package.

Prepare one consolidated proposal for genuinely lost capabilities: legacy evidence, exact lost workflow, modern alternative, reason for retirement, affected callers and migration cost. Candidate mechanisms currently requiring investigation include executable HTML/controller discovery, arbitrary controller AOP, runtime TEMPLATE interpretation, global instance discovery, optional runtime code inspection and handler/expression introspection. Useful typed declaration, remote-code loading, configuration, row-event and lifecycle behavior must be preserved even if its old mechanism changes. Rich notifications, expiry, tree checks and month/holiday selection are implementation gaps, not automatic retirement candidates.

Ask once after the inventory is complete. Until an explicit decision, every proposed omission remains required. A native/ESM rewrite that preserves an already approved behavior does not require another approval. P0 completes only when all surface entries and dynamic use paths have owners, gaps have tests planned, and the omission proposal is ready for that consolidated decision.

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

Continue P0 dynamic semantic closure and prepare the single omission proposal after that review. M10.6 and [M10.7](m10-paste-plan.md) gates are complete within their contracts. [M10.8](m10-viewport-plan.md) implements measured viewport rendering while preserving logical-page checks/paste, one attached focused editor and native table indices. M10.9.1 ordered shared Rows, [M10.9.2 authored row blocks/merging](m10-row-blocks-plan.md), [M10.9.3 native controls/display/validation](m10-controls-plan.md) and [M10.9.4 status/row lifecycle](m10-lifecycle-plan.md) retain separate contracts and frozen evidence under [the detailed M10.9 plan](m10-parity-plan.md). M10.9.5 implements [authored detail navigation and geometry](m10-detail-plan.md) through existing owners. [M10.9.6](m10-closure-plan.md) separates change presentation (.1), interaction/view controls (.2), progressive rendering/completion (.3) and semantic acceptance (.4). The .1 contract implements immutable original access, exact committed-field state and edited deletion display. The reviewed [.2 interaction contract](m10-interactions-plan.md) adds explicit native toggles, applied search/zero-count choices and authored column-recovery/action-scroll compositions. The implemented [.3 progressive contract](m10-progressive-plan.md) provides logical prefix admission, cooperative row work, uniform completion and owned cancellation through current Grid/viewport/CVC; the remaining option/default/callback obligations stay required. Its 89-entry/17-group planning snapshot records the baseline rather than certifying full semantic parity. Continue the remaining required component/CVC slices afterward. Preserve other stages, the final M13 review/remediation gate and publication deferral.

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

P0's exhaustive behavior mapping, final omission candidates and their one user decision are pending. Remaining parity public contracts require their detailed slice review; implemented column, batch-edit, viewport and multi-row/merge contracts retain their owning evidence and P0 option/dynamic closure. Manual assistive-technology testing and actual token telemetry remain open; available automated/browser checks must still run during implementation.

[^coverage]: Initial source-backed coverage ledger
[^roadmap]: Milestone governance and current scope
[^grid-history]: Selected Grid implementation and historical measurements
[^architecture]: Implemented module ownership and private sharing
[^data]: Current RowId and shared Rows implementation
[^grid]: Current authored table implementation
[^form]: Current input, draft and validation ownership
