---
type: Plan
title: Natural-JS 2.0 M1 contract plan
description: Detailed review plan for the public usage examples and minimum architecture contracts required before implementation.
tags: [meta, plan, migration]
sources:
  - id: baseline
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.architecture.js
    title: Immutable 1.x CVC and communication implementation
  - id: template
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.template.js
    title: Immutable 1.x component and event declaration implementation
generated: { by: codex/gpt-6-sol, at: 2026-09-24T07:26:34Z }
---

M1 is a design and usage-contract milestone. Its deliverable is concrete HTML and TypeScript application examples plus reviewed contracts; it does not implement the runtime. Use [M0 baseline](m0-baseline.md) as the inclusion filter and [the roadmap](roadmap.md) for later milestones.

# Goal

Freeze the smallest public surface that makes a CVC page, shared data, authored HTML components, and request-driven application flow clear to an agent before writing framework code.

# Checkpoint

- M0 selected the horizontal search-grid-detail example as the representative behavior, with a vertical HTML/CSS variant using the same controller and data.
- User correction after M0: Form-used formatter/validator engines, built-in rules, and their transitive helpers stay in 2.0. Only framework-unreachable utilities may be removed.
- The user approved this M1 scope on 2026-09-24, with the Form rule retention correction. M1 was later expanded to document nested JSON, duplicate-ID-free MDI, accessibility, and fast binding.

# Steps

1. Write the shortest JS and TS consumer examples for an existing HTML page, a fetched HTML fragment, a search/grid/detail/save page, and a popup round trip. Show imports and all ownership boundaries.
2. Define one page description that connects an HTML URL or existing root element to a controller factory. The same description must create independent instances in main content, popup, and tab. Define path resolution, exactly which root is mounted, and controller creation per instance.
3. Fix lifecycle order and public signatures for creation, asynchronous initialization, activation, deactivation, disposal, retry/reload, request cancellation, and error propagation. Specify what happens if a page is removed before initialization completes.
4. Define a stable row key, nested JSON ownership, source rows versus change state, new/deleted rows, shared subscription ownership, and how sorting/filtering affect selection and save payloads. Freeze the minimum data contract used by form and grid before M4.
5. Fix a field-binding marker distinct from DOM id, safe nested paths and row-local option arrays, the row-template scope, text-versus-explicit-HTML insertion, element lookup failure, event argument, and component disposal rules. Define duplicate-ID prevention and label/ARIA reference checks for repeated rows and simultaneous MDI views.
6. Preserve the HTML rule-list syntax and names used by Form, List, and Grid. Define the formatter/validator engine, built-in catalog, raw/display conversion, validation messages/results, and typed custom-rule options. Put only new business-specific example rules in the application.
7. Fix request input/result/cancel/error types, optional typed processing hooks, page-input separation, and explicit migration examples for the 1.x POST JSON and dataIsArray behavior. Avoid legacy return-shape overloads.
8. Review the examples against the user's code style: direct flow, grouped component/communication/event roles, small readable functions, few imports, and no type-changing declaration objects. Set an M4 prototype gate for nested Select binding, native-table keyboard access, and fixed-fixture binding benchmarks; record rejected abstractions and the final API decision table.
9. Map each accepted public export to a named 2.0 framework behavior and an English draft concept to create upon implementation. Audit direct, transitive, and declarative rule reachability before any removal. Publish the acceptance cases and next M2 plan.

M1 exit package: runnable-looking HTML, JS, and TS usage examples for all four flows, a public symbol/signature table, page lifecycle and failure sequence, nested-data/binding/formatter/validator contracts, duplicate-ID and accessibility policy, performance measurement plan, a 1.x server request conversion example, and an explicit accepted/rejected API decision table. Cross-check every example against the M0 inclusion inventory. No downstream milestone may invent an incompatible public contract without revising this package.

# Next action

Review [the proposed M1 contract](m1-contract.md) and [the M2 plan](m2-plan.md). M2 starts only after its scope is approved.

# Decisions

- Use one npm package with a small number of role-based entry points.
- Keep the existing CVC roles but use explicit HTML and controller module association rather than inline script execution or global selector discovery.
- Use an existing HTMLElement or an explicit HTML URL as a page View source; create controller state for each mounted instance.
- Prefer plain objects and typed callbacks for component definitions, request actions, and events. Keep definitions and created handles separate.
- Use browser standards for redundant helpers, but retain all Form-used built-in rule behavior and its transitive dependencies. Keep feature-specific helpers private.
- The representative popup example is contractual in M1; popup implementation remains M7.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | M1 input review | M0 CVC, data, UI, template, and example findings assembled; implementation has not started. |
| 2026-09-24 | M1 scope approval | User approved M1 and corrected the retention rule for Form-used formatter/validator behavior. |
| 2026-09-24 | M1 design steering | User requested standards-conformant IDs and accessibility, fast binding, nested JSON with row-local Select options, and optimized rewrites. |

# Open questions

- [The M1 contract](m1-contract.md) proposes export names, data-field, result types, and lifecycle signatures; user review is pending.
