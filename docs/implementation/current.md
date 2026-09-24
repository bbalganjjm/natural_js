---
type: Plan
title: Natural-JS 2.0 active plan
description: Checkpoint, next action, and verification record for the milestone-gated Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF conventions for the Natural-JS bundle
    git_blob: 17cfe650daacff3935aa93a383868574afe95628
generated: { by: codex/gpt-6-sol, at: 2026-09-24T09:03:30Z }
---

The Natural-JS 2.0 migration follows [the master roadmap](roadmap.md). Read this checkpoint before resuming a milestone. The immutable 1.x baseline is commit `b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6`; its source, LGPL license, and usage docs are also archived under `v1/`.

# Goal

Deliver a TypeScript-source, jQuery-free, ESM Natural-JS 2.0 at the repository root. Preserve CVC, authored HTML, and framework-reachable Form formatter/validator rules. Remove only framework-unreachable utilities. Keep binding fast, accessible, free of duplicate IDs, and able to handle nested JSON.

# Checkpoint

- M0-M2 are complete. M2 was first built under `v2/` and verified before the user approved moving it to the repository root.
- The user approved M3 and requested the exact GitHub branch `2.0.0-alpha.0`. The local branch has been created; the root move and M3 implementation are being checked before a fast-forward push. Do not switch `master` or create its archive branch yet.
- The 2.0 root package and new source use Apache-2.0. The 1.x files under `v1/` keep their prior license and notices.
- M3 page, communication, and row runtime code is implemented. The `./ui` entry remains type-only until M4. M5 retains and rewrites the Form-used formatter/validator behavior.

# Steps

- [x] Preserve the fixed 1.x baseline and record the M0 design/reachability inventory.
- [x] Approve the M1 public CVC, data, UI, and communication contract.
- [x] Complete the M2 TypeScript/ESM package, installed consumers, browser smoke, and TS-aware OKF checker.
- [x] Receive approval for the M3 runtime and root 2.0 / `v1/` layout.
- [x] Move 2.0 source/package to the root and archive 1.x source/docs under `v1/` without changing their license.
- [x] Implement `mountPage`, `createCommunicator`, and `createRows` with focused tests and installed consumers.
- [ ] Complete M3 concept updates, source fingerprints, changed/full OKF checks, package audit, and GitHub fast-forward push.
- [ ] Review and approve [the M4 detailed plan](m4-plan.md) before implementing the representative UI screen.

# Next action

Finish the M3 documentation and package checks, commit and push the verified root tree to `origin/2.0.0-alpha.0`, then present M3 results and the M4 plan for review. Do not implement M4 before approval.

# Decisions

- One page runner owns generated HTML roots, controllers, output listeners, abort signals, and reverse-order resource cleanup. Borrowed roots remain caller-owned.
- DOM IDs are never field or row keys. Reject page ID collisions before insertion or activation.
- Row IDs are store-local. M3 nested objects/arrays are atomic top-level values; M5 will add path binding and nested Select behavior.
- Keep shared helpers private only when more than one runtime role needs the same stable operation. No new convenience utility catalog.
- Keep 1.x implementation and LGPL notices under `v1/`; only new 2.0 source and package outputs carry Apache-2.0.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | M2 baseline | Build, typecheck, Vitest 2/2, installed JS/TS consumers, Chromium/WebKit smoke, and changed/full OKF checks passed. |
| 2026-09-24 | M3 code | Build and typecheck passed; Vitest 20/20, Chromium/WebKit 16/16, and fresh-tarball JS/TS consumers passed. |
| 2026-09-24 | Checker | Node regression test passed after switching public-source discovery to the 2.0 root. |

# Open questions

- Firefox Playwright could not launch on this Windows host during M2 (SideBySide `mozglue` error) or M3 (`browserType.launch: spawn UNKNOWN` before page load); rerun on a working host before a later browser gate.
- M4 measures nested Select correctness and 100/1000-row binding cost, then sets numeric UI performance budgets. If automatic nested binding misses the gate, ask the user before switching to explicit per-row binding.
