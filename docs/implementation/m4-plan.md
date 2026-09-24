---
type: Plan
title: Natural-JS 2.0 M4 vertical-screen plan
description: Review plan for the first authored-HTML search, grid, detail, and save screen with nested binding, accessibility, and performance gates.
tags: [meta, plan, migration]
status: draft
sources:
  - id: contract
    resource: m1-contract.md
    title: Approved M1 public contract and representative screen
    git_blob: 6f477ebc2a56d26afb704da194674f1728d9af31
  - id: roadmap
    resource: roadmap.md
    title: Milestone order and M4 exit gate
    git_blob: 9a2ae5fa12f8a0309ca41b6565556fa05f826c54
  - id: page
    resource: ../../src/page/index.ts
    title: M3 page lifecycle implementation
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: rows
    resource: ../../src/data/index.ts
    title: M3 shared row store
    git_blob: 85c9f0c7140580e7217dadb91476d824025b3a07
  - id: comm
    resource: ../../src/comm/index.ts
    title: M3 request implementation
    git_blob: f3650ddbfeb5d87c3e58dc84904df9704e994368
generated: { by: codex/gpt-6-sol, at: 2026-09-24T09:03:26Z }
---

M4 tests the 2.0 structure through one complete application path before expanding the UI catalog. This is a plan for user review. M4 implementation does not start until its scope is approved.

# Goal

Run search → list → select → detail edit → save against authored HTML with the same controller and data in two layouts. Use the result to decide whether row-local nested Select binding, ID-free repeated markup, accessible native-table interaction, and fast binding fit the M1 contract. Correct the structure before M5/M6 if this screen exposes a boundary problem.

# Checkpoint

- M1 fixes the public direction: one page runtime, Rows identity, data-field independent of DOM id, and Form/Grid on authored HTML. [The M1 contract](m1-contract.md) is a design contract; M4 must label any still-unimplemented behavior accurately.
- M3 implements page lifecycle, communication, and the minimum immutable row store. Nested arrays are atomic values under top-level Rows.set; Form path editing and the retained formatter/validator catalog remain M5 work.
- The existing 1.x formatter, validator, and transitive rule helpers stay in v1/ as reference. No M4 prototype justifies deleting Form-reachable behavior or replacing it with an application-only rule system.
- The 2.0 source, package, and active OKF docs are at the repository root. v1/ is preserved reference code, not the 2.0 distribution.

# Scope and sequence

| Step | Work | Evidence |
|---|---|---|
| 1. Freeze fixture | Fix one employee dataset, mock search/save endpoints, a nested option array, empty/error/delayed responses, and expected save payloads. Use IDs as business data only; never as row or DOM identity. | Fixture and expected raw JSON checked into the example; two layouts share it. |
| 2. Two authored views | Provide a side-by-side search/table/detail layout and a stacked layout with different DOM placement and CSS. Keep the same data markers, controller module, requests, actions, and test data. | Identical behavior tests pass with either view; authored classes, structure, and styling are retained except repeated rows and necessary state/ARIA additions. |
| 3. Minimal Form/Grid path | Implement only the Form and basic Grid binding needed by the vertical screen under the M1 bindForm/bindGrid contracts: scoped fields, search read, row selection, detail binding/edit, a repeated row template, shared Rows updates, changed-row save, disposal. Keep template descriptors and element references local to the owning component. | Search, select, edit, add/delete/revert, save, empty result, and server failure work without a second CVC runner or a public binding utility catalog. |
| 4. Nested-data prototype | Parse safe dot-separated object paths once per template. Prototype data-options="a" with row-local option label/value paths (aa/bb) and a separate selected data-field="chosen". Replace the affected top-level field for nested edits; do not mutate a snapshot. | Each row shows its own options, retains raw number 22 rather than DOM string "22", skips incomplete options, handles a missing selected option, and tracks/reverts an option-array replacement. |
| 5. Standards and access | Reject fixed IDs in repeated templates and detect collisions across two live page roots. Scope all lookup to the page/component root or cached row references. Keep native table, header scope, buttons, labels, keyboard operation, focus, status text, and valid ARIA references. | Two simultaneous instances and repeated rows have no duplicate IDs or broken label/ARIA references; keyboard-only search, selection, edit, and save pass. |
| 6. Failure and lifetime | Compose request and page abort signals, discard stale searches, dispose bindings/subscriptions with their page, and prevent a late save/search result from changing a removed view. | Delayed response, rapid search, failed save, disposal, and reopen scenarios leave no stale DOM update or accumulated listener. |
| 7. Measure and decide | Run fixed binding measurements and a small independent-agent change task, inspect package/API growth, then review the structure and any fallback with the user. | A recorded comparison, the M5 handoff, and explicit user approval or requested correction. |

The M4 example sends only status and value records from Rows.changes(), without internal RowId. A replace after a successful search clears prior selection and drafts. Programmatic sort/filter change display order only and keep selection/edit/status attached to RowId; M6 finishes the complete Grid controls. The M4 save example checks changed rows even when their view is filtered out, using its pilot application callback; M5 moves this into the full Form/Grid validation flow.

# Form and validation boundary

M4 must prove the connection points while avoiding a partial rewrite of the legacy rule catalog. The vertical fixture may use HTML required, input types, and an application-supplied validation/format function through the approved RuleSet shape. It tests that invalid data blocks a request, a validation issue reaches the authored error region, and valid raw data reaches Rows and the save payload. The sample must distinguish this pilot from full declarative data-format/data-validate behavior.

M5 implements the retained built-in formatter/validator names, the 1.x JSON rule-list syntax, message resolution, drafts, parse-before-validation, raw/display separation, nested Form path editing, and validation of filtered-out rows. M6 completes the independently usable Form/List/Grid/Select components. M4 must not advertise those later behaviors as implemented, drop any Form-used rule, or create a framework-level generic utility to stand in for them. Business validation, comparison, and server transformations remain application code; typed callbacks are the framework boundary.

# Nested Select decision gate

Automatic row-local binding is the proposed 2.0 behavior, not an unconditional implementation shortcut. The M4 prototype must cover the exact M1 example of a row with a: [{ aa: 11, bb: 22 }, {}] and b: 2, separate option data from the selected field, preserve the raw selected type, and keep row IDs stable after sort/filter. A missing option value/label is skipped; an authored empty option and an unavailable selected value follow the M1 validation contract. Unsafe prototype keys, numeric array indexes, and expression evaluation are rejected as binding paths.

Measure automatic options against an explicit per-row binding of the same fixture. If correctness, accessibility, or the measured cost is unacceptable, record the failure and present an explicit-binding 2.0 fallback to the user at the M4 review gate. Do not silently narrow the approved capability. M5 implements the selected path; M6 completes component integration.

# Accessibility and binding measurements

The repeated template contains no fixed DOM id. The component never uses getElementById for a row or field. Generated IDs are document-unique only where a label or error association needs them; authored IDs are preserved. An optional legacy ID-scoping transform may be considered only after a separate prototype proves that local for, ARIA ID references, fragment links, and authored selectors still work. Otherwise the migration guide replaces fixed IDs in reusable HTML. Keep native table semantics; do not add role="grid" without its full keyboard and focus model.

Benchmark 100 and 1,000 rows with 10 visible fields, using the same browser, machine, fixture, warm-up, and repeated runs. Record median time for initial bind, rebind, one-field edit, sort/filter, and disposal; record DOM count and memory where the browser exposes it. Compare shared scenarios with 1.x, and measure nested Select separately because 1.x has no automatic row-local path. Inspect scaling and extra DOM queries before setting numeric M6 regression budgets from these results; do not invent a universal millisecond target before measurement. Keep the benchmark script and raw measurements reviewable.

# Verification and docs

- Run focused data/binding tests and Chromium, Firefox, and WebKit browser checks where the host can launch them. Confirm two live instances, two layouts, no duplicate IDs, valid label/ARIA references, keyboard focus and selection, nested raw option values, selected-row stability after sort/filter, filtered-out changed-row validation, validation/save failure, and cancellation after removal. Record a host-level browser failure as an environment gap, not as a pass.
- Verify that a newly added field can be located and changed by an independent agent using only the active English OKF docs and source links. Record first-pass correctness, retries, files/bytes read, changed files/lines, elapsed time, and actual token use when available; label context size separately from token use. M8 performs the full fixed three-task comparison.
- Keep new public exports and their types next to their implementations. Update affected docs/v2/ draft concepts, folder indexes, docs/log.md, source fingerprints, and the active checkpoint with each code change. Run installed JS/TS consumers, build, typecheck, focused tests, npm run docs:check -- --changed with zero errors, and full npm run docs:check; record unresolved full-check warnings in the active plan.
- Audit every helper introduced by M4: name its necessary framework behavior, keep it private near one owner unless two roles share stable behavior, and exclude business rules or convenience methods from the package API.

# Completion gate

M4 is complete only when the two authored views run the same controller, the vertical flow and failure cases pass, the nested Select decision is supported by correctness and benchmark evidence, simultaneous views remain ID-clean and keyboard-accessible, and the public surface and source layout remain easy to navigate. Review the resulting code, measurements, remaining gaps, and M5 scope with the user. Fix any structural issue before broadening UI work. M5 implementation requires its own detailed plan and approval.

# Next action

Wait for M3 to close and for the user to review and approve this M4 plan. No M4 runtime or UI implementation is authorized by drafting this document.

# Decisions

- Reuse the M3 mountPage, createCommunicator, and createRows implementations; UI binding owns its template descriptors and DOM references.
- Preserve authored HTML and CSS, with scoped markers and native accessible controls rather than framework visual design.
- Retain the 1.x Form rule capability for M5 and use only the M4 pilot's narrow validation connection in the representative screen.
- Let measured correctness and cost decide whether automatic row-local options are ready for 2.0; ask the user before selecting the documented fallback.
- Keep one example controller across the two layouts so markup differences test the framework boundary rather than duplicate application code.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Planning | M4 scope drafted from M1, the roadmap, and M3 role implementations; no M4 code was written. |

# Open questions

- M4 measurements will set concrete M6 binding budgets and may expose a need to revise the M1 nested Select path or the minimum Form/Grid split.
- Firefox Playwright startup failed on the M2 Windows host; rerun on a working host before treating its browser gate as verified.
