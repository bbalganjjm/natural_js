---
type: Plan
title: Natural-JS 2.0 M3 runtime plan
description: Proposed CVC lifecycle, communication, and minimum shared-row implementation with cancellation and cleanup gates.
tags: [meta, plan, migration]
status: draft
sources:
  - id: contract
    resource: m1-contract.md
    title: Approved M1 public contract
    git_blob: fc2e61202c1cab234d25ab1ef12052e0e46d4d54
  - id: package
    resource: ../../v2/package.json
    title: Isolated 2.0 package
    git_blob: 87bd07cfc1832d359f4dca93a130859042951a0d
  - id: page
    resource: ../../v2/src/page/index.ts
    title: Page type contract
    git_blob: d933b25708d293ee1596b95045d1025746da4f3b
  - id: data
    resource: ../../v2/src/data/index.ts
    title: Data type contract
    git_blob: 96983e05d1deb1b8b60a93abbc10fd438e74cbbe
  - id: comm
    resource: ../../v2/src/comm/index.ts
    title: Communication type contract
    git_blob: bf04ba759196dac52cbbf89f80f2b9c78abe3ddc
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:19:59Z }
---

M3 turns the approved page, communication, and minimum row contracts into working runtime exports. It uses the M2 package without importing or relabeling 1.x code.

# Goal

Run two independent instances of one authored HTML page, complete predictable async lifecycle and request cleanup, and share a small identified row store needed by the M4 vertical screen.

# Checkpoint

- M2 produces strict TypeScript, ESM and declarations in the independent Apache-2.0 `v2/` package. M3 starts only after the user reviews M2 results and approves this plan.
- `FrameworkError` is the only M2 runtime export. Page, data, and communication entry points currently export types only; UI stays type-only throughout M3.
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

Wait for explicit M3 approval after M2 review. Then implement the page, communicator, and rows runtime in that order while keeping UI behavior and rule ports in later milestones.

# Decisions

- One owner per responsibility: page owns mounted roots and lifecycle, communication owns requests, data owns row identity and change tracking, UI later owns authored field binding and rule execution.
- A private shared module requires the same stable behavior in at least two runtime roles. `FrameworkError` is already shared; resource cleanup stays page-local until UI needs exactly the same lifetime contract.
- Use plain functions and objects, native `fetch`, `AbortController`, and DOM APIs. No jQuery adapter, broad utility namespace, registration engine, or mutable global page registry.
- The root package and source remain 1.x LGPL. Only newly written `v2/` source and its tarball are Apache-2.0.
- Browser import smoke is an M2 foundation, not proof of M3 lifecycle or UI behavior; the M3 fixture must check actual concurrent work and cancellation.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Planning | M3 scope drafted from the approved M1 contract and M2 implementation; runtime work awaits user approval. |

# Open questions

- M3 should determine whether immutable snapshots need shallow freezing at each changed path or another approach that meets M5 nested-data and M4 performance gates without whole-store cloning.
- If this Windows host still cannot launch Playwright Firefox, record the failure and run that project on a working host before the later release gate.
