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
generated: { by: codex/gpt-6-sol, at: 2026-09-24T13:52:47Z }
---

The Natural-JS 2.0 migration follows [the master roadmap](roadmap.md). Read this checkpoint before resuming a milestone. The immutable 1.x baseline is commit `b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6`; its source, LGPL license, and usage docs are also archived under `v1/`.

# Goal

Deliver a TypeScript-source, jQuery-free, ESM Natural-JS 2.0 at the repository root. Preserve CVC, authored HTML, and framework-reachable Form formatter/validator rules. Remove only framework-unreachable utilities. Keep binding fast, accessible, free of duplicate IDs, and able to handle nested JSON.

# Checkpoint

- M0-M3 are complete. M3 and the root 2.0 layout were fast-forward pushed to `origin/2.0.0-alpha.0` at commit `94c73a9f`; `master` remains untouched. The 2.0 package uses Apache-2.0, while preserved `v1/` files retain their LGPL license and notices.
- The user approved [M4](m4-plan.md). Its two-layout employee screen, Form/Grid pilots, nested row-local Select binding, browser regressions, benchmark, and independent-agent change task are implemented. M4 build, browser, package, and documentation gates passed; commit `b9a1c902` was fast-forward pushed to `origin/2.0.0-alpha.0`. Its detailed evidence is in the M4 plan.
- [M5](m5-plan.md) is complete and pushed to `origin/2.0.0-alpha.0` at commit `25eafb15`. Its prior-milestone audit, fetched-HTML integration fix, retained rules, row-keyed drafts, Form/Grid/data contracts, tests, package audit, same-host benchmark, and two docs-first agent exercises are recorded below. The user approved [M6](m6-plan.md) on 2026-09-24 and reported a local Firefox installation; M6 is active.

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
- [x] Receive M5 approval and independently recheck the unchanged M4 baseline.
- [x] Close the fetched-HTML M4 integration gap with the same controller and HTML in both mount modes.
- [x] Implement M5 retained rules, row-keyed drafts, shared validation, docs, and verification.
- [x] Receive approval for the M6 data UI milestone.
- [ ] Complete the M6 usage contract, native controls, List, pagination, basic Grid, integration, and verification.

# Next action

M6 implementation, representative two-layout integration, build, installed consumers, three-browser tests, same-host benchmarks, and package audit have passed. Finish source-linked documentation, independent agent-cost evidence, and the push; then draft M7 for separate review.

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
| 2026-09-24 | Independent M4 recheck | The unchanged M4 baseline passed build, typecheck, Vitest 29/29, screen Chromium/WebKit 36/36, and full OKF 0/0. A fetched-server-HTML route now runs the same controller and authored view through `mountPage(URL)`; the M4 screen passed Chromium/WebKit 38/38. The premature future `PopupHandle` type was identified for removal during M5. |
| 2026-09-24 | M4 package audit | `npm pack --dry-run` lists 48 files (46,017 bytes), with no `v1/`, jQuery, docs, examples, or convenience utility bundle. |
| 2026-09-24 | M4 documentation | Changed and full OKF checks passed: 21 concepts, 5 reserved files, 0 errors, 0 warnings. Seven M4-related 2.0 concepts received independent source review. Commit `b9a1c902` was fast-forward pushed to `origin/2.0.0-alpha.0`. |
| 2026-09-24 | M5 final code | Build, typecheck, Vitest 79/79, Chromium/WebKit browser 102/102, direct example TypeScript check, and installed JS/TS consumers passed. The browser suite includes the fetched-HTML path, two simultaneous ID-clean pages, hidden drafts, native constraints, and unsupported-control errors. |
| 2026-09-24 | M5 final benchmark and package | Five Chromium runs after two warm-ups on the same 1,000-row/10-field host: flat initial/rebind 12.9/14.8 ms and nested automatic 37.6/44.8 ms; all M6 reference budgets passed. Raw report: [M5 binding](evidence/m5-binding-chromium.json). The 63-file, 86,228-byte tarball excludes `v1/`, jQuery, docs, examples, and convenience utility bundles. |
| 2026-09-24 | Independent M4 agent baseline | A fresh docs-first agent added `profile.department` to both layouts and the data/save path with zero code retries; its first Chromium run passed. It read 15 unique files (53,364 bytes) and changed 7 files (12 added/5 replaced lines) in about 4m05s. Actual token use was unavailable. |
| 2026-09-24 | M5 agent-cost exercise | Two fresh agents independently added optional `profile.office` across the two layouts, nested data, save expectation, browser regression, and OKF concept. Both passed Chromium 19/19 on the first code run, build and docs checks, with zero code retries and nine changed files. Before the short field-change map, one read 23 full files (117,294 bytes) plus 6,890 bytes of partial rereads in about 7-8 minutes. After the map, one opened 17 unique files, fully read ten (41,590 bytes), and inspected seven partially (about 36,751 output bytes on a replay) in about 6m27s. Its content output was roughly 77-78 KB before about 17 KB of diff review; the replay and the first run's 117,294 full plus 6,890 partial bytes use different counting methods. Actual tokens are unavailable, and both runs include differing setup overhead. Accuracy held and file discovery narrowed, while M6/M8 must still measure context and edit cost consistently. |

| 2026-09-24 | M6 implementation/browser gate | Native Button, Form groups, List, standalone Select, Pagination, and editable/paged Grid now run together in both HTML layouts. Build/typecheck, Vitest 81/81, installed JS/TS consumers, Chromium/WebKit 144/144, and fresh-cache Firefox 72/72 passed. Independent source review issues were fixed before the full run. |
| 2026-09-24 | M6 benchmark/package gate | Same-host Chromium 1,000-row flat Grid initial/rebind 12.5/15.7 ms, nested automatic 46.0/45.5 ms; all reference budgets pass. List initial/page-start/next 12.3/0.9/0.2 ms, with all rows cached on first bind. The 88-file, 120,488-byte tarball excludes `v1/`, jQuery, docs, examples, tests, and convenience libraries. See [M6 evidence](m6-plan.md). |

# Open questions

- The system-installed Firefox is not Playwright-controllable, but a fresh Playwright Firefox build passed the M6 browser suite (72/72). Reproduction uses `PLAYWRIGHT_BROWSERS_PATH=node_modules/.cache/playwright-m6` for Firefox only; Chromium/WebKit use the default cache.
- Chromium heap readings remain diagnostic without controlled collection. The same-host M5 rerun met the M6 reference budgets; on another host collect a new baseline before comparing them.
