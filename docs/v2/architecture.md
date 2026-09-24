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
    git_blob: 393602a69677d5fdaf7968fd49b19efd1b7d5cae
  - id: root
    resource: ../../src/index.ts
    title: Root entry
    git_blob: d99a783055cf6bea9b6e15ca591c370ff514cec9
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public UI contracts and component exports
    git_blob: e1c3c3d309fb5b5724965ce348396046b1c77db7
  - id: form
    resource: ../../src/ui/form.ts
    title: Form binding
    git_blob: e603f619679c24be778b04f45ea3c467b50bf2c2
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid binding
    git_blob: dedeca30ef8f10a78172748d8cb9911a68b7da03
  - id: list
    resource: ../../src/ui/list.ts
    title: List binding
    git_blob: 8d3ef3e1ff3e7b7fb7faed27fc592846dd5fe090
  - id: select
    resource: ../../src/ui/select.ts
    title: Standalone Select binding
    git_blob: 4160eb77722751aad730fb997a4f0b07a967bd1e
  - id: pagination
    resource: ../../src/ui/pagination.ts
    title: Pagination binding
    git_blob: 0239548e7638456548beb441b55956381272d454
  - id: popup
    resource: ../../src/ui/popup.ts
    title: Authored dialog and CVC Popup lifetime
    git_blob: 33fa1227a630e0f9dad828ea003c5eb2692bf6d5
  - id: tabs
    resource: ../../src/ui/tabs.ts
    title: Authored Tabs and CVC page lifetime
    git_blob: 4bbd8b9a3b0280ed1ab2c59683bcc5597d7d6920
  - id: row-options
    resource: ../../src/ui/row-options.ts
    title: Private row-local choice extraction
    git_blob: 72facd6bc5b30845938731897f1f5aadd257a7fa
  - id: select-owner
    resource: ../../src/ui/select-owner.ts
    title: Private Select ownership
    git_blob: 6902e2789df6e44123b2ea599e4d05fa1c098fa4
  - id: path
    resource: ../../src/ui/field-path.ts
    title: Private UI field path semantics
    git_blob: dfac85c3d4cc2c0a61cb2e4ee210b01583ecc5b2
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Private Form/Grid rule runner
    git_blob: 967142342d060056cd3f124db29f6893a2875d48
  - id: formats
    resource: ../../src/ui/format-rules.ts
    title: Private retained formatter rules
    git_blob: a3ec42f7837c785a5f3fa3688283c13117b528a1
  - id: validators
    resource: ../../src/ui/validate-rules.ts
    title: Private retained validator rules
    git_blob: 4f1439b6e09b066bea1afd26d16b34471d9f4d18
  - id: page
    resource: ../../src/page/index.ts
    title: CVC page runner
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: data
    resource: ../../src/data/index.ts
    title: Row store
    git_blob: 10c07414eacccc414b81afc8be5661dd21afe3c6
  - id: comm
    resource: ../../src/comm/index.ts
    title: Communicator
    git_blob: f3650ddbfeb5d87c3e58dc84904df9704e994368
  - id: error
    resource: ../../src/internal/framework-error.ts
    title: Shared framework error
    git_blob: 6930da1fbcfd71733a45dab22a51aec784cafe7f
generated: { by: codex/gpt-6-sol, at: 2026-09-24T15:56:13Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T15:58:02Z }
---

The root 2.0 package uses one directory per public role and a narrow private internal area. An agent can start at the package export map, then read one entry and its direct dependencies.

# Intent

Keep one definition of each framework behavior without collecting unrelated helpers in a public utility library. Place types and code beside the feature that owns them, and extract only when the same stable behavior is needed across roles.

# Participants

| Path | Responsibility through M7 |
|---|---|
| `src/index.ts` | Root public entry; currently re-exports the real `FrameworkError`. |
| `src/page/` | `mountPage`, CVC lifecycle, authored HTML roots, and per-instance cancellation. |
| `src/data/` | `createRows`, immutable nested JSON snapshots, row identity, and change tracking. |
| `src/ui/` | `bindForm`, `bindGrid`, `bindList`, `bindSelect`, `bindPagination`, `openPopup`, `bindTabs`, their types, and UI-owned field-path, rule, row-option, and Select-ownership helpers. |
| `src/comm/` | `createCommunicator`, Request/Response hooks, JSON decoding, and cancellation. |
| `src/internal/` | Private cross-role implementation; currently the common error class only. |

# Lifecycle

Build `src/` once with `tsc` to `build/`. The package export map resolves public paths to generated JavaScript and declarations. Consumers cannot use an internal package subpath through `exports`. The preserved `v1/` code is outside this build and tarball. Form, Grid, and List bind within authored roots, subscribe to a caller-owned row store when supplied, and release their own listeners and subscriptions on disposal. Standalone Select and Pagination bind native controls, own no row store, and restore authored markup on disposal. Popup and Tabs own private `PageHandle` instances from the same `mountPage` runtime; Popup owns one opening, while Tabs retain successfully visited pages until final disposal and evict failed or canceled pages.[^package][^form][^grid][^list][^select][^pagination][^popup][^tabs]

# Rules

- Import downward and directly: UI may depend on data and the page runtime/types; data and communication do not import UI. Runtime modules may use private internal code. No internal module imports the package root or another role's public package specifier.
- Start a helper inside its owning feature. Move it to `internal/` only after at least two roles need the same semantics, lifetime, error behavior, and tests. Small operations with different meaning stay local.
- Form, Grid, and List use one UI-owned declaration parser and dispatcher. Built-in formatter and validator implementations remain private. Grid and List share only the stable row-local option operation; Form, Grid, and List share Select ownership with standalone Select. Do not turn them into a generic formatting or validation utility package.
- Keep DOM references and row identity local to their mounted root and row store. Standard browser operations remain direct calls; no selector, event, date, or collection wrapper is added for convenience.
- A shared error code has one implementation. `FrameworkError` is the first cross-role contract, implemented privately and re-exported only at the root.[^root][^error]

# Pitfalls

A repeated snippet is not automatically a shared abstraction; first check whether it has identical inputs, outputs, cancellation, and ownership. A private helper must not become public merely because applications might find it useful. The private `field-path.ts` exists because Form, Grid, and List need the same safe object-path reading; Form and Grid also need copy-on-write. It is not a package export. The rule runner exists because Form, Grid, and List need the same declarative lookup, overrides, messages, and errors; individual rule operations remain beside their catalog. The row-option and Select-ownership helpers each have two or more concrete UI callers.[^row-options][^select-owner]

# Related

[The M1 contract](../implementation/m1-contract.md) gives behavioral invariants. [Package](package.md) lists what is actually installable. [The employee example](employee-example.md) exercises data UI across two authored layouts. [Popup](popup.md) and [Tabs](tabs.md) document the M7 container contracts; [the page-container example](page-containers-example.md) traces one definition across main content, Popup, and Tabs. [The roadmap](../implementation/roadmap.md) sets later implementation gates.

[^package]: Public package boundaries
[^root]: Root entry
[^error]: Shared framework error

[^form]: Form binding
[^grid]: Grid binding
[^list]: List binding
[^select]: Standalone Select binding
[^pagination]: Pagination binding
[^popup]: Authored dialog and CVC Popup lifetime
[^tabs]: Authored Tabs and CVC page lifetime
[^row-options]: Private row-local choice extraction
[^select-owner]: Private Select ownership
