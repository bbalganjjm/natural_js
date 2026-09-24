---
type: Plan
title: Natural-JS 2.0 master roadmap
description: Milestone order, scope boundary, and completion gates for the TypeScript-first Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: baseline
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/package.json
    title: Immutable Natural-JS 1.x package baseline
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:54:36Z }
---

This roadmap governs the Natural-JS 2.0 migration. Use [the active checkpoint](current.md) for status and a milestone-specific plan before implementing that milestone. The 1.x source and documentation remain available under `v1/` and at commit b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6.

# Goal

Ship a TypeScript-source, ESM, jQuery-free UI framework that keeps CVC and attaches behavior to authored HTML. Optimize for coding agents to find the relevant contract and source quickly, make a correct change, and use few tokens. One npm package exposes only necessary entry points.

# Checkpoint

- M0-M2 are complete; M3 runtime is approved and in progress on branch `2.0.0-alpha.0`. See [current.md](current.md).
- The initial 2.0 release includes form, list, basic grid, select, pagination, button, dialog, popup, and tab.
- Advanced grid, tree, custom date picker, notification, and document tabs follow in 2.x.

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
| M10 Advanced grid | Add selected complex grid behavior within the basic grid contract. |
| M11 Tree and date picker | Add tree and custom date picker with authored template and accessibility contracts. |
| M12 Shell | Add notification, document tabs, and application shell behavior on the shared page runtime. |

Each milestone starts with a detailed plan, user review, and approval of its scope. Record the next plan and verification in [current.md](current.md) before moving on.

# Next action

Complete [the M3 runtime plan](m3-plan.md), then review [the M4 vertical-screen plan](m4-plan.md) before implementing M4.

# Decisions

- Retain code used by framework behavior, including Form rules reached indirectly through HTML declarations, configuration, and List/Grid row forms. Remove a legacy utility only after checking direct and indirect framework reachability.
- Keep framework-specific helpers private and near their owning feature. Share a private module only when two or more framework roles need the same stable behavior; make import direction explicit and do not move convenience libraries into a legacy or add-on package.
- Keep the formatter and validator engines, built-in rule names, declarative Form integration, messages, and the internal mask/date operations their rules require. Applications own new business-specific rules and transformations; typed rule options connect them to the same engine.
- Use browser and JavaScript standards for replaceable helpers while preserving framework-visible behavior. Rewrite retained behavior with optimized, readable code rather than copying old implementations. Avoid wrapper APIs with no framework responsibility.
- Keep authored HTML and CSS authoritative. Use data markers instead of DOM IDs for binding; prevent duplicate IDs in repeated rows and simultaneous views. Generate only repeated or necessary supporting elements; optional templates and themes must not force a design.
- Use direct functions, plain objects, consistent options and results, and close placement of relevant code and types. Compile template bindings once, update affected fields, and measure speed on fixed nested-data fixtures. Measure agent correctness first, then context read, changes, elapsed time, and available token usage.
- The new 2.0 root source and package use Apache-2.0. Preserve the 1.x source, package metadata, bundles, headers, and LGPL license under `v1/`.
- New API names and signatures are decided in M1. Record each change in English OKF concepts, folder indexes, and the bundle log; pass the changed docs check with zero errors.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Pre-M0 changed docs check | 65 concepts, 16 reserved files; 0 errors, 0 warnings. |

# Open questions

- M4 must measure nested Select binding and may stage the explicit per-row fallback if the automatic path misses correctness or performance gates.
