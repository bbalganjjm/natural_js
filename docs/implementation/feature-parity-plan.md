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
    git_blob: 33b2dbf0b732e005a46fa997fc44de65ca9c7fde
  - id: roadmap
    resource: roadmap.md
    title: Milestone governance and current scope
    git_blob: b99c9a254693cebb6886a114e0dc775957b3d80e
  - id: grid-history
    resource: m10-plan.md
    title: Selected Grid implementation and historical measurements
    git_blob: e3c632005ad396fc6aa2992e84fb066893df0d49
  - id: architecture
    resource: ../v2/architecture.md
    title: Implemented module ownership and private sharing
    git_blob: bdcb4f923e823f922fea6ba2b860ed6b04107595
  - id: data
    resource: ../../src/data/index.ts
    title: Current RowId and shared Rows implementation
    git_blob: 10c07414eacccc414b81afc8be5661dd21afe3c6
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current authored table implementation
    git_blob: b277c2b22e728630836eedcbc4fd998ddb4f5e5c
  - id: form
    resource: ../../src/ui/form.ts
    title: Current input, draft and validation ownership
    git_blob: e603f619679c24be778b04f45ea3c467b50bf2c2
generated: { by: codex/gpt-6, at: 2026-10-05T09:51:37Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T09:51:37Z }
---

This plan applies the user's 2026-10-05 scope correction: all 1.x framework capabilities remain required unless the user approves a specific omission in one consolidated review. Column resize, reorder and hide, multiple selection, bulk paste and true scroll virtualization are mandatory. Existing implementations and immutable evidence remain useful; their selected completion does not establish full parity.[^coverage][^roadmap]

# Goal

Complete framework behavior through consistent, readable TypeScript while preserving CVC, authored HTML/CSS, document-unique IDs, nested binding, accessible interaction and measured binding performance. Keep application business rules outside the framework. Minimize agent context, API surface, duplicated processing, hidden conventions and test/debug effort.

# Checkpoint

- The implementation baseline is 80e1fb3 on 2.0.0-alpha.0. M0-M12 selected work is recorded in the existing plans; the M12 artifact remains unpublished. Runtime source and past evidence are unchanged by this scope correction.
- The initial coverage ledger has 60 behavior families. Its eight-file AST checklist records 43 classes, 394 members and 338 literal constructor option keys. Neither count proves exhaustive behavior coverage; merged defaults, dynamic declarations, aliases and callback ordering need P0 closure.[^coverage]
- No proposed feature omission is approved. Previously deferred/excluded behavior must be reconciled with the latest instruction. Already approved TS/ESM, new API naming, jQuery removal, unique IDs, root Apache-2.0 and preserved LGPL v1 do not need approval again.
- Release-candidate preparation is blocked by required feature gaps. npm publication and release tags additionally require personal testing and a later explicit request. Only real macOS/iOS Safari is outside browser scope; available Windows engines remain required.

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

Design multi-line row groups, data-driven merges and virtual row identity together before adding a single-row-only viewport abstraction. Type declarations stay near their owner. Share a private file only for an established responsibility/reuse case; do not add a public utility entry point.[^grid][^form]

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
| M8/M9: Final parity and release validation | Close the full coverage ledger, migration recipes and installed API checks; replay the three fixed agent tasks under the same measurement method; then personal feature testing and separately requested release-candidate work. No registry publication or release tag during feature implementation. |

## Per-stage delivery and validation

1. Recover current.md; recheck preceding implementation and source intent.
2. Write goals, uncovered IDs, public HTML/TS contracts, minimal common-code responsibilities, change order, tests, docs and completion conditions. Distinguish required behavior from implementation machinery. Review changed core contracts through the existing milestone approval process; do not repeat the already approved feature scope or fragment the one omission decision.
3. Implement optimized direct code, smallest necessary types/options and deterministic error details. Compile bindings once, update affected fields and keep nested ownership/identity stable. Use modern browser features while preserving observable behavior.
4. Verify relevant unit and browser behavior, failures/cancellation/cleanup, two authored layouts, accessible keyboard/focus/labels and unique IDs in repeated/MDI views. Use Chromium, Firefox, WebKit and installed Chrome/Edge consumer gates as appropriate; real Safari remains excluded.
5. Update draft implemented API concepts, indexes, migration/demo and log in the same task. Independent source/test/doc review precedes verified stamps. Keep historical evidence immutable; do not recertify it with new timestamps.
6. Record defects, measured binding/DOM/update cost, agent retries/context/change extent/time and actual tokens when available. Context bytes are a separate proxy. Feed results into the next slice; pass changed docs with zero errors and record any full-check warnings.

Performance fixtures start with the existing 100/1,000-row binding budgets and 5,000-row Grid workload. Define viewport/large-paste data, measurement method and host-relative acceptance limits before implementation, including nested options, scrolling and cleanup. A bounded DOM claim requires real node/ownership evidence; do not infer it from local paging or assert a universal speedup.

# Next action

Complete P0's per-surface/dynamic mapping and the one consolidated omission proposal. In parallel prepare M10.5's representative authored HTML/TS and exact column-state contract, coordinating row-group/viewport constraints with shared foundations. No new public API is implemented by this document.

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

P0's exhaustive behavior mapping, final omission candidates and their one user decision are pending. Exact column/group/viewport and batch-edit public types require the detailed slice review. Manual assistive-technology testing and actual token telemetry remain open; available automated/browser checks must still run during implementation.

[^coverage]: Initial source-backed coverage ledger
[^roadmap]: Milestone governance and current scope
[^grid-history]: Selected Grid implementation and historical measurements
[^architecture]: Implemented module ownership and private sharing
[^data]: Current RowId and shared Rows implementation
[^grid]: Current authored table implementation
[^form]: Current input, draft and validation ownership
