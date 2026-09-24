---
type: Plan
title: Natural-JS 2.0 M3 runtime plan
description: Proposed CVC lifecycle, communication, and minimum shared-row implementation with cancellation and cleanup gates.
tags: [meta, plan, migration]
sources:
  - id: contract
    resource: m1-contract.md
    title: Approved M1 public contract
    git_blob: 9ef6cc85ee2e44c083184978017d08303e38a51d
  - id: package
    resource: ../../package.json
    title: Isolated 2.0 package
    git_blob: 148dfc8e866559ae2859b5130afabafdaa1c0af3
  - id: page
    resource: ../../src/page/index.ts
    title: Page type contract
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: data
    resource: ../../src/data/index.ts
    title: Data type contract
    git_blob: 10c07414eacccc414b81afc8be5661dd21afe3c6
  - id: comm
    resource: ../../src/comm/index.ts
    title: Communication type contract
    git_blob: f3650ddbfeb5d87c3e58dc84904df9704e994368
generated: { by: codex/gpt-6-sol, at: 2026-09-24T11:01:11Z }
---

M3 turns the approved page, communication, and minimum row contracts into working runtime exports. It uses the M2 package without importing or relabeling 1.x code.

# Goal

Run two independent instances of one authored HTML page, complete predictable async lifecycle and request cleanup, and share a small identified row store needed by the M4 vertical screen.

# Checkpoint

- M2 first produced strict TypeScript, ESM and declarations in an isolated package. The user approved M3 and promotion of 2.0 to the repository root; 1.x is archived under `v1/`.
- `FrameworkError` is the only M2 runtime export. Page, data, and communication had type-only entries before M3; UI stays type-only throughout M3.
- Formatter/validator rules remain required capabilities for M5. M3 does not remove or port them.

# Steps

1. Recheck the implemented M2 declarations against [the M1 contract](m1-contract.md). Export `mountPage`, `createCommunicator`, and `createRows` only as each implementation and its focused checks land; do not leave throwing placeholders.
2. Implement a page-local lifecycle state machine: load one-root URL HTML or accept an element/factory, create a fresh controller for each mount, await `init` then `activate`, serialize later activation/deactivation/reload, and preserve the original input on reload. Borrowed roots stay caller-owned; generated roots are removed on disposal.
3. Give each page instance one `AbortSignal`, an `own()` disposer stack, and a generation check. Abort immediately on reload/disposal, run cleanup once in reverse registration order, reject pending readiness with `AbortError`, and wrap other failures in `FrameworkError` with code, API, cause, and actionable detail. Keep this machinery inside page until another role demonstrably needs identical semantics.
4. Check document-wide ID collisions once per mount before inserting a URL/factory root and before activating a borrowed root. Reject a collision with `DUPLICATE_ID`; never use DOM `id` for field or row lookup. Test two simultaneous ID-free views and a colliding authored view.
5. Implement `createCommunicator` on native `fetch` with explicit `json` versus `body`, request/response hooks, decoding, HTTP/parse/empty error codes, and signal cancellation. Hooks are per communicator instance, not a global registry. Do not add business API mapping or convenience URL/string helpers.
6. Implement `createRows` with store-local `RowId`, detached immutable snapshots, top-level `set`, add/remove/revert, change records, replacement, subscriptions, and disposal. Nested objects/arrays are atomic top-level values in M3; M5 adds Form path editing and nested Select integration. Preserve stable IDs across display sort/filter; never inject metadata into business JSON.
7. Use a small browser fixture to mount the same page twice, finish one while cancelling the other, reload quickly, and verify no late response or event mutates a disposed root. Add focused pure tests for row identity, change/revert, immutable reads, request errors, and abort timing.
8. Update the page, data, and communication 2.0 concepts, actual JS/TS installed consumers, package export list, source fingerprints, `docs/log.md`, and the active plan in the same work. Run build, typecheck, focused tests, installed consumers, changed/full OKF checks, and available Chromium/Firefox/WebKit browser checks.
9. Record any unsupported edge and measured package/test cost, then draft the M4 vertical-screen plan for user review. M4, not M3, decides Form/Grid binding architecture and numeric performance budgets.

# Next action

M3 runtime and its tests are complete. Review the [M4 plan](m4-plan.md) and receive separate approval before implementing UI behavior and rule ports.

# Decisions

- One owner per responsibility: page owns mounted roots and lifecycle, communication owns requests, data owns row identity and change tracking, UI later owns authored field binding and rule execution.
- A private shared module requires the same stable behavior in at least two runtime roles. `FrameworkError` is already shared; resource cleanup stays page-local until UI needs exactly the same lifetime contract.
- Use plain functions and objects, native `fetch`, `AbortController`, and DOM APIs. No jQuery adapter, broad utility namespace, registration engine, or mutable global page registry.
- The root package and new 2.0 source use Apache-2.0. The unchanged 1.x source and LGPL license remain under `v1/`; the 2.0 tarball excludes them.
- Browser import smoke is an M2 foundation, not proof of M3 lifecycle or UI behavior; the M3 fixture must check actual concurrent work and cancellation.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Approval | The user approved M3 implementation, root 2.0 promotion, `v1/` preservation, and the `2.0.0-alpha.0` GitHub branch. |
| 2026-09-24 | Runtime | Build, typecheck, Vitest 20/20, installed JS/TS consumers, and Chromium/WebKit browser 16/16 passed. URL/factory/borrowed roots, pending init cancellation, two independent pages, reload, and duplicate-ID rejection were exercised. |
| 2026-09-24 | Package | The 2.0 tarball lists 33 files and excludes `v1/`, jQuery, old bundles, and old utility libraries. |
| 2026-09-24 | Documentation and push | Changed and full OKF checks passed with 0 errors and warnings; commit `94c73a9f` was fast-forward pushed to `origin/2.0.0-alpha.0`. |

# Open questions

- M3 uses per-row detached frozen snapshots and clones only the changed top-level field. M4 must measure whether this remains within the binding budget at 100 and 1000 rows.
- Firefox failed before page load on this Windows host (`browserType.launch: spawn UNKNOWN`); run that project on a working host before the later release gate.
