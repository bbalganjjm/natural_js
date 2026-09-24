---
type: Plan
title: Natural-JS 2.0 M6 data UI review plan
description: Review draft for completing Button, Select, pagination, Form, List, and basic Grid on authored HTML.
tags: [meta, plan, ui, migration]
status: draft
sources:
  - id: contract
    resource: m1-contract.md
    title: Approved 2.0 public and binding contract
    git_blob: 9ef6cc85ee2e44c083184978017d08303e38a51d
  - id: roadmap
    resource: roadmap.md
    title: Milestone and first-release scope
    git_blob: d881808046dba7ee9195224708b351a7cc2e6a85
  - id: m4
    resource: m4-plan.md
    title: Two-layout screen and fixed performance baseline
    git_blob: 32e787e7cfcf9c5d4aced515732d08fd3b4e89fd
  - id: m5
    resource: m5-plan.md
    title: Retained rules, row drafts, and data boundary
    git_blob: 5ad258bc1653fd5ad566a891fe6015ac661eee7a
  - id: ui
    resource: ../../src/ui/index.ts
    title: Current public UI types and exports
    git_blob: 024d2a174b00a1ac80f626942dcb07fa1142bf20
  - id: form
    resource: ../../src/ui/form.ts
    title: Current Form behavior
    git_blob: 9d086ea8c09e30a688e25d474483a91b199d3308
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current Grid behavior
    git_blob: cc5de08d7431e0e9d201b164f80caa6545718167
  - id: rows
    resource: ../../src/data/index.ts
    title: Row identity, mutation, and change tracking
    git_blob: 10c07414eacccc414b81afc8be5661dd21afe3c6
  - id: legacy-button
    resource: ../../v1/docs/ui/button.md
    title: Preserved 1.x Button contract
    git_blob: f04d663c2b8f1d82d592dac83cb4810b9d664c00
  - id: legacy-select
    resource: ../../v1/docs/ui/select.md
    title: Preserved 1.x Select contract
    git_blob: e95d5a777f9e897c1f435b385288d8b9be1b2e77
  - id: legacy-pagination
    resource: ../../v1/docs/ui/pagination.md
    title: Preserved 1.x pagination contract
    git_blob: f7e7eb9081bac1eac94ae90a78958d71de6041a2
  - id: legacy-list
    resource: ../../v1/docs/ui/list.md
    title: Preserved 1.x List contract
    git_blob: 1e93437c791acfc6b3f024c9d9f10c25349997cd
generated: { by: codex/gpt-6-sol, at: 2026-09-24T11:39:18Z }
---

This is a review draft for M6 after the M5 data and rule gate. It completes the first-release data UI on authored HTML and CSS while keeping the public surface small; it does not authorize implementation yet.

# Goal

Complete Button, Select, pagination, Form, List, and basic Grid as one consistent family: pass a root and small typed options, keep authored structure, use caller-owned `Rows` for shared data, and release listeners, clones, and subscriptions through `dispose()`. Preserve CVC ownership and the retained Form-reachable rules. Only behavior needed by these components belongs in the framework; formatting and validation rules already retained in M5 stay, while application comparisons, API calls, business rules, and visual design remain with the application.[^contract][^roadmap][^m5]

| Area | Minimum M6 responsibility | Boundary |
|---|---|---|
| Button | Native `<button>` semantics, disabled/busy state when a framework operation owns it, and a clear lifetime for any attached behavior. | Page action handlers stay ordinary DOM code when no framework state is needed. No size/color/class generator or styled-link substitute. |
| Select | Bind authored single and multiple `<select>` controls to typed raw choices, preserve authored placeholder options, and align standalone and row-local option behavior. | Form owns authored radio/checkbox group values; a new input generator or CSS switch is outside the minimum contract unless a reviewed use case requires it. |
| Pagination | Manage current page, page size, total count, bounds, and authored previous/next/page controls for client or server paging. | The application fetches server pages and owns business filtering; pagination never changes `RowId` or stores page numbers in business rows. |
| Form | Finish the native control matrix, including authored radio/checkbox groups and multiple selection, on top of M5 raw/display/parse/validate/draft rules. | No new general mask, formatter, validator, or domain form schema engine. |
| List | Repeat one authored `<li>` template over `Rows`, show fields and row-local options, and support row-keyed selection. Reuse a separate Form for editing in the first slice. | Inline List editing needs a separately reviewed second caller for a shared edit operation; no timer-driven row creation, scroll paging engine, or index-based identity. |
| Basic Grid | Finish native-table text/checkbox editing, selection, sort/filter/page connection, validation, and change-state display. | Frozen columns, merged headers, virtual scrolling, large edit engines, and column reordering wait for M10. |

# Proposed contract decisions

These defaults make the approval review concrete; M6 does not implement them until the user approves this slice.

| Concern | Proposed M6 contract |
|---|---|
| Select ownership | A standalone Select binder owns only controls outside a bound Form/List/Grid. Form/List/Grid reuse a private raw-option mapping; binding one element twice raises a clear error. |
| Client page order | Apply filter, then sort, then page slicing. Client total is the filtered count; server total comes from the application response. Page controls never mutate Rows. |
| Server selection | Application use of Rows.replace for a fetched page issues new RowIds; off-page selection is cleared. Keeping a business selection across server pages is application state keyed by a business ID, never by RowId. |
| Form groups | Authored radio groups live inside a form owner so equal names in two MDI pages stay scoped. A radio group stores one scalar, checkbox groups an array, one checkbox a boolean, and a multiple Select an array. Required/error/focus behavior is defined per group in the usage example before implementation. |
| Typed Grid edits | Grid accepts a per-field parse callback with the existing ParseInput shape for number/date/raw JSON; failed conversion remains a row-keyed draft. List's first slice delegates edits to Form and does not add a second inline editor. |
| Button | Start with native button activation and page-owned event handlers. Add a public Button binder only when a concrete framework-owned busy/disabled lifetime cannot be expressed with that contract. |

M4 already proves the CVC screen in two layouts and row-local nested Selects. M5 supplies `Rows` events, safe object paths, built-in and custom rules, and invalid drafts. M6 should finish missing UI behavior rather than copy these foundations or import 1.x convenience libraries.[^m4][^m5][^form][^grid]

# Checkpoint

- M0-M4 are complete on `2.0.0-alpha.0`. M5 is approved and under final verification; its gate must close before M6 implementation begins. This document is a proposal for user review, not a claim that M6 code exists.[^roadmap][^m5]
- Current `bindForm` reads local or row-bound fields and keeps row-keyed invalid drafts. Current `bindGrid` owns a native table template, raw Select choices, selection, sort/filter, display rules, validation, and draft reconciliation. Grid text and checkbox controls still display or validate without user edit write-through; List, standalone Select, and pagination are not yet public UI exports.[^ui][^form][^grid]
- The preserved 1.x Button mostly adds styles and enable/disable behavior; Select also generates option and input markup; pagination assumes positional lists; List creates a Form per row and supports scroll paging. Those mechanics are evidence for intent, not APIs to copy. The 2.0 implementation keeps only behavior required by the first-release components.[^legacy-button][^legacy-select][^legacy-pagination][^legacy-list]
- M4 measured the fixed 1,000-row/10-field Chromium fixture at 11.9/13.8 ms for flat initial/rebind and 40.4/44.2 ms for automatic nested initial/rebind. The final same-host M5 rerun recorded 12.9/14.8 ms and 37.6/44.8 ms. Both records distinguish context bytes from actual agent tokens and treat heap samples as diagnostic.[^m4][^m5]

# Steps

| Step | Work | Reviewable evidence |
|---|---|---|
| 0. Close M5 | Recheck the M5 Form/Grid/Rows contracts, benchmark, installed consumers, and source-linked OKF concepts. Record any known gap before freezing the input state for M6. | M5 gate, code baseline, and remaining environment gaps are linked from the active checkpoint. |
| 1. Freeze usage contract | Write short HTML and TS examples for a paged search/list/detail screen and a standalone Select; show the same controller in two distinct authored layouts. Confirm each proposed public name, root/option/result/event/disposal shape, row ownership, and whether Button needs a binder at all. Revise M1 first if an invariant changes, then seek user approval of the M6 implementation slice. | A reviewer can identify the single source file for each component and the application-owned code without reading implementation internals. |
| 2. Button and Select | Use a native button and preserve its authored label/classes; add only state that an actual framework operation needs. Implement standalone Select options and values from typed raw scalars/arrays, preserve author-provided options, and reuse the row-local value mapping where it is genuinely the same operation. | Keyboard activation, disabled/busy restoration, typed number/string distinction, empty and duplicate option values, rebind, and disposal pass without generated duplicate IDs. |
| 3. Pagination | Bind authored controls, compute page bounds from total count and size, announce the current page, and connect client-visible rows or server requests through a typed callback. Keep page changes independent of `Rows` status and selected `RowId`. | First/last/empty/short final pages, changed totals, rapid server responses, and keyboard navigation behave consistently in List and Grid. |
| 4. Form control matrix | Audit every supported native control against the M5 parse/format/validate/draft pipeline. Finish single/multiple Select, authored radio/checkbox groups, required/length/pattern constraints, raw boolean/array values, and unsupported file behavior. Correct Form and Grid differences through one small private helper only when both need identical stable semantics. | Empty, invalid, hidden, cross-field, programmatic change, switch-row, revert, and disposed cases preserve raw JSON and accessible errors. |
| 5. List | Bind one authored `<li>` template to `Rows` with cached field descriptors and row-local references. Add a real row-selection control and an authored empty-state region; use an existing Form for editing. Preserve selection identity through client sort/filter/page operations. Review inline editing separately only if the first-release List needs it. | Rows add/update/delete/revert appears correctly; a separate Form validates hidden edits. Nested option arrays, keyboard selection, and repeated bind/dispose pass without per-row document queries or Form instance duplication. |
| 6. Basic Grid | Extend the M5 native table to write user text/checkbox edits through parse and validation into `Rows`, retain invalid row-keyed drafts, and add authored header sort state (`aria-sort`), filter and page controls. Keep native table/tab order; use `role="grid"` only if its complete focus and arrow-key model is implemented and tested. | Sort/filter/page after edit targets the same `RowId`; raw payloads and change status are correct, including nested JSON and hidden rows. Two MDI copies remain ID-clean. |
| 7. Integration and hard cases | Run the full search → list/grid → select → detail edit → save path in both HTML/CSS layouts. Exercise empty results, server errors, repeated binding, rapid page/search changes, removal during requests, keyboard-only use, and generated error references. | No stale DOM response, leaked listener, duplicate DOM ID, broken label/ARIA reference, or silent invalid draft enters a save. |
| 8. Cost and documentation gate | Compare the fixed M4/M5 Grid fixture after each large change; add a List/pagination fixture for bind, page switch, and disposal. Inspect code/API growth and an independent docs-first screen task. Update affected English OKF concepts, indexes, log, fingerprints, examples, migration notes, and active checkpoint with code. | Build/typecheck, focused logic and browser checks, JS/TS installed consumers, changed OKF check with zero errors, full OKF findings recorded, package audit, and measurements support a user review before M7. |

# Next action

Finish and push M5, then review this M6 draft with the user. Before coding M6, settle the Button binder question, the first-release Select group subset, and exact pagination/List public signatures using representative authored HTML and TypeScript. Record the approved slice in the active plan. Changes to M1 invariants require an updated contract and renewed review.[^contract][^roadmap]

# Decisions

- `data-field` and store-local `RowId`, not DOM IDs or display indexes, identify fields and rows. Parse paths and rules once per authored template; reuse local element references and batch new rows. Arrays can be row-local option sources or atomic `Rows.set` values; arbitrary array-index paths and expression binding are out of scope.[^contract][^grid][^rows]
- Keep native semantics: `<button>`, `<label>`, `<select>`, `<ul>/<ol>`, and `<table>` with real headings. Selection and page changes must expose state through appropriate native controls or `aria-pressed`, `aria-current="page"`, and `aria-sort`; errors use valid `aria-describedby` references and live text. Move/restore focus only when a component actually changes the active element. No design classes or forced layout are required.[^contract][^m4]
- Keep Form/List/Grid rules in the UI role and data ownership in `Rows`. Share private parsing, rule dispatch, field paths, and identical control handling only when more than one component needs the same stable operation. Do not export a general DOM, data, format, mask, date, sorting, or paging utility package.[^contract][^m5]
- Sort comparators, filter predicates, domain validation and parsing, display copy, API URLs, server paging requests, and save payload conversion stay as application functions. UI components call the smallest typed hook needed to connect them; there is no global registry or implicit request engine.[^contract][^roadmap]
- M6 does not include dialog/popup/tab (M7), advanced Grid (M10), custom calendar/tree (M11), or notification/document tabs (M12). The preserved `v1/` source and LGPL notices stay unchanged; new 2.0 source/package remains Apache-2.0.[^roadmap]

The initial implementation order is Button/Select → pagination → Form controls → List → Grid → integration. If a component forces new shared infrastructure, first show the two concrete callers and the smaller local alternative; keep the dependency direction `ui → data` and never have an internal module import the package root.[^contract]

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Planning baseline | This review draft compares the M1 contract, roadmap, M4/M5 plans and measurements, current Form/Grid/Rows source, and preserved 1.x Button/Select/Pagination/List documentation. No M6 code was implemented. |
| 2026-09-24 | Fixed performance gate | On the M4 reference host with the same fixture, flat initial/rebind/edit/sort/filter medians must remain at or below 30/35/5/10/8 ms; automatic nested initial/rebind/sort/filter at or below 90/100/25/18 ms. Require zero duplicate IDs. On another host, first collect its M4 baseline and require no more than twice the corresponding medians before comparing absolute numbers. Record 100- and 1,000-row measurements, DOM count, and diagnostic heap samples.[^m4] |
| 2026-09-24 | Agent-cost gate | Repeat the fixed docs-first screen/field task at the M5 checkpoint with the same task and acceptance checks; add a small List/page task for the new APIs; record first-pass correctness, retries, unique files and bytes read, changed files and lines, elapsed time, and actual tokens only if available. The M4 reference was 15 unique files/53,364 bytes, seven changed files, and about 4m05s; context bytes are not token counts. Investigate a growth in lookup or edit spread before approving a larger public API. M8 performs the full three-task comparison.[^m4][^roadmap] |

Verification favors focused tests for high-risk behavior over copying every legacy convenience method. Run Chromium and WebKit on the current host, and Firefox on a host that can launch it; the current Windows `spawn UNKNOWN` failure is an environment gap, not a Firefox pass. Release verification later checks actual Chrome, Edge, and Safari. Accessibility checks include keyboard-only activation and selection, meaningful state/error announcements, valid labels, focus retention after sorting/paging, and no duplicate IDs in repeated rows or simultaneous pages.[^m4][^roadmap]

# Open questions

- Does Button need a public binder beyond native `button.disabled` and page-owned `addEventListener`? The M6 review should accept one concrete framework-owned busy/disabled use case or keep Button as a documented native-HTML contract; do not publish a click wrapper for convenience alone.[^legacy-button][^contract]
- Should a standalone Select binder include multiple selection in its first slice, and should authored radio/checkbox groups remain Form-only? Confirm raw scalar versus array return and write types before naming public methods; preserve framework-reachable Form behavior without recreating the old generated-input styling.[^legacy-select][^form]
- Pagination needs one agreed state/result/event contract for client and server modes. Decide whether page-visible IDs are supplied by the caller or derived inside List/Grid, while keeping `Rows` unchanged and avoiding a generic data slicing API.[^legacy-pagination][^rows]
- Form and Grid have some distinct native-control edge handling today. M6 should choose one private shared operation only where behavior is identical and measured code duplication or drift warrants it.[^form][^grid]
- Firefox still cannot launch on the current Windows host. Do not mark that browser verified until the same suite runs on a working host.[^m4]

[^contract]: Approved 2.0 public and binding contract
[^roadmap]: Milestone and first-release scope
[^m4]: Two-layout screen and fixed performance baseline
[^m5]: Retained rules, row drafts, and data boundary
[^ui]: Current public UI types and exports
[^form]: Current Form behavior
[^grid]: Current Grid behavior
[^rows]: Row identity, mutation, and change tracking
[^legacy-button]: Preserved 1.x Button contract
[^legacy-select]: Preserved 1.x Select contract
[^legacy-pagination]: Preserved 1.x pagination contract
[^legacy-list]: Preserved 1.x List contract