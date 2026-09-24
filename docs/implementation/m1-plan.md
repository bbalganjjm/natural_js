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
generated: { by: codex/gpt-6-sol, at: 2026-09-24T06:51:22Z }
---

M1 is a design and usage-contract milestone. Its deliverable is concrete HTML and TypeScript application examples plus reviewed contracts; it does not implement the runtime. Use [M0 baseline](m0-baseline.md) as the inclusion filter and [the roadmap](roadmap.md) for later milestones.

# Goal

Freeze the smallest public surface that makes a CVC page, shared data, authored HTML components, and request-driven application flow clear to an agent before writing framework code.

# Checkpoint

- M0 selected the horizontal search-grid-detail example as the representative behavior, with a vertical HTML/CSS variant using the same controller and data.
- M0 classified business formatters, rule catalogs, general utilities, and legacy global APIs as outside the 2.0 package.
- M1 contract work starts only after review of this detailed milestone scope.

# Steps

1. Write the shortest JS and TS consumer examples for an existing HTML page, a fetched HTML fragment, a search/grid/detail/save page, and a popup round trip. Show imports and all ownership boundaries.
2. Define one page description that connects an HTML URL or existing root element to a controller factory. The same description must create independent instances in main content, popup, and tab. Define path resolution, exactly which root is mounted, and controller creation per instance.
3. Fix lifecycle order and public signatures for creation, asynchronous initialization, activation, deactivation, disposal, retry/reload, request cancellation, and error propagation. Specify what happens if a page is removed before initialization completes.
4. Define a stable row key, source rows versus change state, new/deleted rows, shared subscription ownership, and how sorting/filtering affect selection and save payloads. Freeze the minimum data contract used by form and grid before M4.
5. Fix a field-binding marker distinct from DOM id, the row-template scope, text-versus-explicit-HTML insertion, element lookup failure, event argument, and component disposal rules.
6. Fix callbacks for raw/display value conversion, HTML validity plus application validation, result display, user comparison/filtering, and errors. Keep example rules in the application, not the framework.
7. Fix request input/result/cancel/error types, optional typed processing hooks, page-input separation, and explicit migration examples for the 1.x POST JSON and dataIsArray behavior. Avoid legacy return-shape overloads.
8. Review the examples against the user's code style: direct flow, grouped component/communication/event roles, small readable functions, few imports, and no type-changing declaration objects. Record rejected abstractions and the final API decision table.
9. Map each accepted public export to a named 2.0 framework behavior and an English draft concept to create upon implementation. Publish the acceptance cases and next M2 plan.

M1 exit package: runnable-looking HTML, JS, and TS usage examples for all four flows, a public symbol/signature table, page lifecycle and failure sequence, data/binding/validation contracts, a 1.x server request conversion example, and an explicit accepted/rejected API decision table. Cross-check every example against the M0 inclusion inventory. No downstream milestone may invent an incompatible public contract without revising this package.

# Next action

Review this M1 scope and then produce the concrete API examples and signature table for approval before M2 implementation.

# Decisions

- Use one npm package with a small number of role-based entry points.
- Keep the existing CVC roles but use explicit HTML and controller module association rather than inline script execution or global selector discovery.
- Use an existing HTMLElement or an explicit HTML URL as a page View source; create controller state for each mounted instance.
- Prefer plain objects and typed callbacks for component definitions, request actions, and events. Keep definitions and created handles separate.
- Use browser standards directly where no framework behavior is added. Keep feature-specific helpers private.
- The representative popup example is contractual in M1; popup implementation remains M7.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | M1 input review | M0 CVC, data, UI, template, and example findings assembled; implementation has not started. |

# Open questions

- Final export and method names, HTML field marker, detailed return types, and lifecycle callback signatures are M1 deliverables for user review.
