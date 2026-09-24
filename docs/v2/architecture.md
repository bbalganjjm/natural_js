---
type: Architecture Pattern
title: Natural-JS 2.0 module boundaries
description: Small role modules, one-way imports, and evidence-based sharing keep 2.0 easy to navigate.
tags: [architecture, modules, maintainability]
status: draft
sources:
  - id: package
    resource: ../../package.json
    title: Public package boundaries
    git_blob: 148dfc8e866559ae2859b5130afabafdaa1c0af3
  - id: root
    resource: ../../src/index.ts
    title: Root entry
    git_blob: d99a783055cf6bea9b6e15ca591c370ff514cec9
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public UI contracts and component exports
    git_blob: f4004388ef1cb23c8e1e5fec340886f9c0416ef5
  - id: form
    resource: ../../src/ui/form.ts
    title: M4 Form binding
    git_blob: 6a240838751510926bb37363b48145d4358fdb41
  - id: grid
    resource: ../../src/ui/grid.ts
    title: M4 Grid binding
    git_blob: 387645f6294f0dc01a077a5c695163c388b32784
  - id: path
    resource: ../../src/ui/field-path.ts
    title: Private UI field path semantics
    git_blob: dfac85c3d4cc2c0a61cb2e4ee210b01583ecc5b2
  - id: page
    resource: ../../src/page/index.ts
    title: CVC page runner
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: data
    resource: ../../src/data/index.ts
    title: Row store
    git_blob: 85c9f0c7140580e7217dadb91476d824025b3a07
  - id: comm
    resource: ../../src/comm/index.ts
    title: Communicator
    git_blob: f3650ddbfeb5d87c3e58dc84904df9704e994368
  - id: error
    resource: ../../src/internal/framework-error.ts
    title: Shared framework error
    git_blob: 6930da1fbcfd71733a45dab22a51aec784cafe7f
generated: { by: codex/gpt-6-sol, at: 2026-09-24T10:12:21Z }
verified:
  - { by: codex/gpt-6-sol-independent, at: 2026-09-24T10:12:53Z }
---

The root 2.0 package uses one directory per public role and a narrow private internal area. An agent can start at the package export map, then read one entry and its direct dependencies.

# Intent

Keep one definition of each framework behavior without collecting unrelated helpers in a public utility library. Place types and code beside the feature that owns them, and extract only when the same stable behavior is needed across roles.

# Participants

| Path | Responsibility through M4 |
|---|---|
| `src/index.ts` | Root public entry; currently re-exports the real `FrameworkError`. |
| `src/page/` | `mountPage`, CVC lifecycle, authored HTML roots, and per-instance cancellation. |
| `src/data/` | `createRows`, immutable nested JSON snapshots, row identity, and change tracking. |
| `src/ui/` | `bindForm`, `bindGrid`, their types, and one private object-path helper shared by both. Full built-in rule execution remains M5 work. |
| `src/comm/` | `createCommunicator`, Request/Response hooks, JSON decoding, and cancellation. |
| `src/internal/` | Private cross-role implementation; currently the common error class only. |

# Lifecycle

Build `src/` once with `tsc` to `build/`. The package export map resolves public paths to generated JavaScript and declarations. Consumers cannot use an internal package subpath through `exports`. The preserved `v1/` code is outside this build and tarball. Form and Grid bind within an authored root, subscribe to the same row store when supplied, and release their own listeners and subscriptions on disposal.[^package][^form][^grid]

# Rules

- Import downward and directly: UI may depend on data and page types; data and communication do not import UI. Runtime modules may use private internal code. No internal module imports the package root or another role's public package specifier.
- Start a helper inside its owning feature. Move it to `internal/` only after at least two roles need the same semantics, lifetime, error behavior, and tests. Small operations with different meaning stay local.
- Keep Form, List, and Grid rule execution in one UI-owned implementation when the M5/M6 runtimes arrive. The M4 pilot has user-supplied Form rules and Select-option validation only. Do not turn it into a generic formatting or validation utility package.
- Keep DOM references and row identity local to their mounted root and row store. Standard browser operations remain direct calls; no selector, event, date, or collection wrapper is added for convenience.
- A shared error code has one implementation. `FrameworkError` is the first cross-role contract, implemented privately and re-exported only at the root.[^root][^error]

# Pitfalls

A repeated snippet is not automatically a shared abstraction; first check whether it has identical inputs, outputs, cancellation, and ownership. A private helper must not become public merely because applications might find it useful. The private `field-path.ts` exists because Form and Grid need the same safe object-path parsing and copy-on-write behavior; it is not a package export. Do not infer that the M4 Form/Grid pilots implement the retained built-in rule catalog.

# Related

[The M1 contract](../implementation/m1-contract.md) gives behavioral invariants. [Package](package.md) lists what is actually installable through M4. [The employee example](employee-example.md) exercises both components across two authored layouts. [The roadmap](../implementation/roadmap.md) sets later implementation gates.

[^package]: Public package boundaries
[^root]: Root entry
[^error]: Shared framework error

[^form]: M4 Form binding
[^grid]: M4 Grid binding
