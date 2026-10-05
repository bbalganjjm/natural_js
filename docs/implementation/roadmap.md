---
type: Plan
title: Natural-JS 2.0 master roadmap
description: Milestone order, scope boundary, and completion gates for the TypeScript-first Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: baseline
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/package.json
    title: Immutable Natural-JS 1.x package baseline
generated: { by: codex/gpt-6, at: 2026-10-05T09:50:34Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T09:50:34Z }
---

This roadmap governs the Natural-JS 2.0 migration. Use [the active checkpoint](current.md) for status and a milestone-specific plan before implementing that milestone. The 1.x source and documentation remain available under `v1/` and at commit b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6.

# Goal

Ship a TypeScript-source, ESM, jQuery-free UI framework that keeps CVC and attaches behavior to authored HTML. Support all 1.x framework capabilities, plus mandatory column resize/reorder/hide, multiple selection, bulk paste and true virtualization, except specifically approved omissions. Optimize for coding agents to find the relevant contract and source quickly, make a correct change, and use few tokens. One npm package exposes only necessary entry points.

# Checkpoint

- M0-M8 are complete on branch `2.0.0-alpha.0`. Button stays native HTML; Form, Grid, List, Select, and Pagination run in the two-layout CVC data screen. Native Dialog, Popup, and Tabs run on the common CVC page runtime in two authored MDI layouts. M6 and M7 evidence is in their [data UI](m6-plan.md) and [page UI](m7-plan.md) plans; [M8](m8-beta-report.md) holds the unpublished beta-candidate, migration, agent-task, and three-browser evidence. [M9 release work](m9-plan.md) has a verified unpublished beta; publication remains deferred.
- The initial plan prioritized form, list, basic grid, select, pagination, button, dialog, popup, and tab. The 2026-10-05 instruction supersedes that limited release scope: all 1.x framework behavior and six required Grid additions must be completed or specifically approved for omission before release preparation.
- Selected advanced Grid slices and M11 Tree and DatePicker are complete. M12 adds authored notifications, dynamic document tabs and an application shell composed from the same CVC runtime; its final verification is recorded in the [M12 plan](m12-plan.md).
- Selected completion is scoped historical evidence. The [coverage ledger](feature-parity.md) and [full feature implementation plan](feature-parity-plan.md) identify required gaps across Grid, other UI, CVC and communication. Their P0 exhaustive inventory remains open; no new omission is approved.

# Steps

| Milestone | Work and exit gate |
|---|---|
| M0 Baseline | Extract design intent; classify feature families by necessity and ownership; preserve 1.x at a fixed commit; choose a vertical screen and agent tasks. |
| M1 Contract | Review compact HTML and TypeScript usage examples; freeze module boundaries, CVC lifecycle, resource ownership, row identity, binding, conversion, and validation contracts before implementation. |
| M2 Tooling | Add strict TypeScript, ESM and declaration builds, explicit package exports, consumer verification, browser tests, and TS-aware OKF checks; separate 1.x facts from 2.0 concepts. |
| M3 Runtime | Implement scoped DOM and resource handling, communication, cancellation, page loading, lifecycle, and the minimum shared data layer. |
| M4 Vertical screen | Build search, grid, selection, detail edit, and save in two authored layouts; prototype row-local nested Select binding, duplicate-ID prevention in simultaneous pages, keyboard access, and fixed-fixture binding benchmarks before expanding UI. |
| M5 Data contracts | Complete nested JSON row ownership, path/Select binding, row changes, built-in formatter and validator rules, custom rule hooks, validation results, and stable declaration types. |
| M6 Data UI | Complete button, select, pagination, form, list, and basic grid against shared contracts, accessible authored HTML, nested option binding, and the M4 performance budgets. |
| M7 Page UI | Complete dialog, popup, and tab using the common CVC runtime, document-unique IDs, and focus/lifecycle rules across simultaneous MDI views. |
| M8 Agent and migration QA | Verify agent tasks, prune unnecessary API and documentation, write 1.x-to-2.0 examples, and prepare beta. |
| M9 Release | Verify installed JS/TS package, browsers, duplicate-ID-free MDI, keyboard/label/ARIA accessibility, binding performance, documentation, preserved Form rules, and removal of jQuery and truly unused utilities; complete beta, release candidate, and 2.0.0 gates. |
| M10 Advanced grid | Complete resize/reorder/hide, multiple selection/checks, bulk paste, true virtualization and remaining legacy Grid behavior within consistent contracts. |
| M11 Tree and date picker | Add tree and custom date picker with authored template and accessibility contracts. |
| M12 Shell | Add notification, document tabs, and application shell behavior on the shared page runtime. |

Each milestone starts with a detailed plan, user review, and approval of its contracts/scope. Record the next plan and verification in [current.md](current.md) before moving on. Reopen uncovered behavior under the existing owning milestone, with shared dependencies first. Required continuation now precedes M9 release preparation; the dated M0-M12 sequence and prior results remain history. The new execution plan stages M10.5-M10.9 and M3/M5/M6/M7/M11/M12 parity work. Feature retirement receives one consolidated review after P0, not repeated individual requests.

# Next action

Complete P0's option/member/dynamic mapping and one consolidated omission proposal, then the required Grid and other framework stages in [the execution plan](feature-parity-plan.md). Full required coverage and personal testing precede a separately planned M9 release candidate. Registry publication and release tags remain deferred until explicitly requested. Real Safari on macOS or iOS is excluded; available Playwright WebKit remains required. The previously approved unused public Rule alias stays removed; retained Form rules remain supported.

# Decisions

- Retain code used by framework behavior, including Form rules reached indirectly through HTML declarations, configuration, and List/Grid row forms. Remove a legacy utility only after checking direct and indirect framework reachability.
- Preserve all supported user-facing capabilities until implemented or explicitly approved for omission in the consolidated review. Standards/private rewrites may replace machinery while preserving outcomes. Previous selected-scope exclusions must be reconciled with the current instruction; a static call search alone cannot classify a helper as unused.
- Keep framework-specific helpers private and near their owning feature. Share a private module only when two or more framework roles need the same stable behavior; make import direction explicit and do not move convenience libraries into a legacy or add-on package.
- Keep the formatter and validator engines, built-in rule names, declarative Form integration, messages, and the internal mask/date operations their rules require. Applications own new business-specific rules and transformations; typed rule options connect them to the same engine.
- Use browser and JavaScript standards for replaceable helpers while preserving framework-visible behavior. Rewrite retained behavior with optimized, readable code rather than copying old implementations. Avoid wrapper APIs with no framework responsibility.
- Keep authored HTML and CSS authoritative. Use data markers instead of DOM IDs for binding; prevent duplicate IDs in repeated rows and simultaneous views. Generate only repeated or necessary supporting elements; optional templates and themes must not force a design.
- Use direct functions, plain objects, consistent options and results, and close placement of relevant code and types. Compile template bindings once, update affected fields, and measure speed on fixed nested-data fixtures. Measure agent correctness first, then context read, changes, elapsed time, and available token usage.
- The new 2.0 root source and package use Apache-2.0. Preserve the 1.x source, package metadata, bundles, headers, and LGPL license under `v1/`.
- M1 establishes the base architecture invariants. New API names and signatures are reviewed in their owning stage's detailed HTML/TS contract. Record each implemented change in English OKF concepts, folder indexes, and the bundle log; pass the changed docs check with zero errors.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Pre-M0 changed docs check | 65 concepts, 16 reserved files; 0 errors, 0 warnings. |
| 2026-10-05 | Scope correction | Full legacy behavior and six Grid features are required; concrete initial gaps and staged continuation are recorded separately. No runtime feature, omission decision or historical test recertification is introduced by this update. |

# Open questions

- M6 met the [reference-host binding budgets](m4-plan.md); List's first bind still builds all row records, so larger data sets need a later memory review. A fresh Playwright Firefox build passed the M6 browser suite on this host. M8 compared its three 2.0 tasks with one byte-count method; actual token use and an equivalent 1.x baseline remain unavailable.
- P0's complete mapping, consolidated omission proposal and detailed new public contracts remain open. Required parity gaps block release preparation.
