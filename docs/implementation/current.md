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
generated: { by: codex/gpt-6-sol, at: 2026-09-24T10:18:21Z }
---

The Natural-JS 2.0 migration follows [the master roadmap](roadmap.md). Read this checkpoint before resuming a milestone. The immutable 1.x baseline is commit `b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6`; its source, LGPL license, and usage docs are also archived under `v1/`.

# Goal

Deliver a TypeScript-source, jQuery-free, ESM Natural-JS 2.0 at the repository root. Preserve CVC, authored HTML, and framework-reachable Form formatter/validator rules. Remove only framework-unreachable utilities. Keep binding fast, accessible, free of duplicate IDs, and able to handle nested JSON.

# Checkpoint

- M0-M3 are complete. M3 and the root 2.0 layout were fast-forward pushed to `origin/2.0.0-alpha.0` at commit `94c73a9f`; `master` remains untouched. The 2.0 package uses Apache-2.0, while preserved `v1/` files retain their LGPL license and notices.
- The user approved [M4](m4-plan.md). Its two-layout employee screen, Form/Grid pilots, nested row-local Select binding, browser regressions, benchmark, and independent-agent change task are implemented. M4 build, browser, package, and documentation gates passed; commit `b9a1c902` was fast-forward pushed to `origin/2.0.0-alpha.0`. Its detailed evidence is in the M4 plan.
- [M5](m5-plan.md) is a draft for separate review and approval. It will complete retained Form formatter/validator rules, row-keyed drafts, and full data contracts; none of that broader work is authorized by M4 approval.

# Steps

- [x] Preserve the fixed 1.x baseline and record the M0 design/reachability inventory.
- [x] Approve the M1 public CVC, data, UI, and communication contract.
- [x] Complete the M2 TypeScript/ESM package, installed consumers, browser smoke, and TS-aware OKF checker.
- [x] Receive approval for the M3 runtime and root 2.0 / `v1/` layout.
- [x] Move 2.0 source/package to the root and archive 1.x source/docs under `v1/` without changing their license.
- [x] Implement `mountPage`, `createCommunicator`, and `createRows` with focused tests and installed consumers.
- [x] Complete M3 concept updates, source fingerprints, changed/full OKF checks, package audit, and GitHub fast-forward push.
- [x] Review and approve [the M4 detailed plan](m4-plan.md) before implementing the representative UI screen.
- [x] Implement the M4 representative screen in two authored layouts, nested Select binding, ID-clean keyboard access, and a fixed-fixture benchmark.
- [x] Record the independent-agent feature task, M4 pilot boundaries, and the detailed M5 review plan.
- [x] Close changed/full OKF checks and source stamps; commit and fast-forward push M4 to `2.0.0-alpha.0`.

# Next action

Review [the M5 plan](m5-plan.md) with the user. Start M5 implementation only after separate approval; the Firefox host limitation stays open.

# Decisions

- One page runner owns generated HTML roots, controllers, output listeners, abort signals, and reverse-order resource cleanup. Borrowed roots remain caller-owned.
- DOM IDs are never field or row keys. Reject page ID collisions before insertion or activation.
- Row IDs are store-local and never become DOM IDs. The M4 Form/Grid pilots share one private safe field-path operation and bind nested Select options per row; M5 completes row-keyed drafts and the retained rule catalog.
- M4 keeps authored layouts independent of controller code and uses native table/form controls. The benchmark supports automatic nested options within [the M4 plan's](m4-plan.md) M6 reference-host budgets.
- Keep shared helpers private only when more than one runtime role needs the same stable operation. No new convenience utility catalog.
- Keep 1.x implementation and LGPL notices under `v1/`; only new 2.0 source and package outputs carry Apache-2.0.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | M2 baseline | Build, typecheck, Vitest 2/2, installed JS/TS consumers, Chromium/WebKit smoke, and changed/full OKF checks passed. |
| 2026-09-24 | M3 code | Build and typecheck passed; Vitest 20/20, Chromium/WebKit 16/16, and fresh-tarball JS/TS consumers passed. |
| 2026-09-24 | Checker | Node regression test passed after switching public-source discovery to the 2.0 root. |
| 2026-09-24 | M3 docs and push | Changed and full OKF checks: 17 concepts, 5 reserved files, 0 errors, 0 warnings. The 33-file tarball excludes `v1/` and jQuery. Commit `94c73a9f` fast-forward pushed to `origin/2.0.0-alpha.0`. |
| 2026-09-24 | M4 code and browsers | Build, typecheck, and explicit example TypeScript check passed; Vitest 29/29, fresh-tarball JS/TS consumers, and Chromium/WebKit browser 64/64 passed, including M4 screen 36/36. Six draft concepts received independent source review; one Form validation wording correction was applied. |
| 2026-09-24 | M4 benchmark | Five measured Chromium runs after two warm-ups on the same i7-9700F host: at 1,000 rows/10 fields, 2.0 flat initial/rebind medians were 11.9/13.8 ms versus 1.x flat 122.8/111.0 ms; 2.0 nested automatic was 40.4/44.2 ms. Duplicate IDs were 0 in 2.0 and 9,990 in 1.x. See [raw data](evidence/m4-binding-chromium.json) and comparison caveats in [M4](m4-plan.md). |
| 2026-09-24 | M4 package audit | `npm pack --dry-run` lists 48 files (46,017 bytes), with no `v1/`, jQuery, docs, examples, or convenience utility bundle. |
| 2026-09-24 | M4 documentation | Changed and full OKF checks passed: 21 concepts, 5 reserved files, 0 errors, 0 warnings. Seven M4-related 2.0 concepts received independent source review. Commit `b9a1c902` was fast-forward pushed to `origin/2.0.0-alpha.0`. |
| 2026-09-24 | Independent agent | A fresh docs-first agent added `profile.department` to both layouts and the data/save path with zero code retries; its first Chromium run passed. It read 15 unique files (53,364 bytes) and changed 7 files (12 added/5 replaced lines) in about 4m05s. Actual token use was unavailable. |

# Open questions

- Firefox Playwright still fails before page load on this Windows host (`browserType.launch: spawn UNKNOWN`); rerun the browser gate on a working host before claiming Firefox support.
- The M4 heap readings are diagnostic without controlled collection. Recheck its fixed benchmark after M5 rule work; on another host collect a new baseline before comparing the M6 budgets.
