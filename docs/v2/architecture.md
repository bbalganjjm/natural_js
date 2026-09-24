---
type: Architecture Pattern
title: Natural-JS 2.0 module boundaries
description: Small role modules, one-way imports, and evidence-based sharing keep 2.0 easy to navigate.
tags: [architecture, modules, maintainability]
status: draft
sources:
  - id: package
    resource: ../../v2/package.json
    title: Public package boundaries
    git_blob: 87bd07cfc1832d359f4dca93a130859042951a0d
  - id: root
    resource: ../../v2/src/index.ts
    title: Root entry
    git_blob: d99a783055cf6bea9b6e15ca591c370ff514cec9
  - id: ui
    resource: ../../v2/src/ui/index.ts
    title: UI type dependencies
    git_blob: b8217f57369262011a20e2c5e69c4c30be55d101
  - id: error
    resource: ../../v2/src/internal/framework-error.ts
    title: Shared framework error
    git_blob: 6930da1fbcfd71733a45dab22a51aec784cafe7f
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:23:45Z }
---

The 2.0 package uses one directory per public role and a narrow private internal area. An agent can start at the package export map, then read one entry and its direct dependencies.

# Intent

Keep one definition of each framework behavior without collecting unrelated helpers in a public utility library. Place types and code beside the feature that owns them, and extract only when the same stable behavior is needed across roles.

# Participants

| Path | Responsibility and current M2 state |
|---|---|
| `v2/src/index.ts` | Root public entry; currently re-exports the real `FrameworkError`. |
| `v2/src/page/` | CVC lifecycle types; M3 adds the runtime. |
| `v2/src/data/` | Shared row identity and change types; M3-M5 add the store. |
| `v2/src/ui/` | Form rule and component handle types; later UI owns its common rule runner. |
| `v2/src/comm/` | Request types; M3 adds transport and hooks. |
| `v2/src/internal/` | Private cross-role implementation; currently the common error class only. |

# Lifecycle

Build `v2/src/` once with `tsc` to `v2/build/`. The package export map resolves public paths to generated JavaScript and declarations. Consumers cannot use an internal package subpath through `exports`. The 1.x code is outside this build and tarball.[^package]

# Rules

- Import downward and directly: UI may depend on data and page types; data and communication do not import UI. Runtime modules may use private internal code. No internal module imports the package root or another role's public package specifier.
- Start a helper inside its owning feature. Move it to `internal/` only after at least two roles need the same semantics, lifetime, error behavior, and tests. Small operations with different meaning stay local.
- Keep Form, List, and Grid rule execution in one UI-owned implementation when those runtimes arrive. Do not turn it into a generic formatting or validation utility package.
- Keep DOM references and row identity local to their mounted root and row store. Standard browser operations remain direct calls; no selector, event, date, or collection wrapper is added for convenience.
- A shared error code has one implementation. `FrameworkError` is the first cross-role contract, implemented privately and re-exported only at the root.[^root][^error]

# Pitfalls

A repeated snippet is not automatically a shared abstraction; first check whether it has identical inputs, outputs, cancellation, and ownership. A private helper must not become public merely because applications might find it useful. M2 type-only entries must not be mistaken for runtime implementations.

# Related

[The M1 contract](../implementation/m1-contract.md) gives behavioral invariants. [Package](package.md) lists what is actually installable in M2. [The roadmap](../implementation/roadmap.md) sets later implementation gates.

[^package]: Public package boundaries
[^root]: Root entry
[^error]: Shared framework error
