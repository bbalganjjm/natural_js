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
generated: { by: codex/gpt-6-sol, at: 2026-09-24T15:18:47Z }
---

Read [the roadmap](roadmap.md) for the full sequence and each completed milestone's plan for its history. The fixed 1.x baseline is commit `b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6`; its LGPL source and docs remain under `v1/`.

# Goal

Deliver an Apache-2.0, TypeScript-source, ESM Natural-JS 2.0 at the root. Preserve CVC, authored HTML and CSS, and every framework-reachable Form rule. Keep the package jQuery-free, accessible, ID-clean across MDI screens, fast on fixed nested-data fixtures, and small enough for coding agents to navigate efficiently.

# Checkpoint

- M0-M5 are complete; their decisions, checks, and source evidence live in [M0](m0-baseline.md), [M1](m1-contract.md), [M2](m2-plan.md), [M3](m3-plan.md), [M4](m4-plan.md), and [M5](m5-plan.md). The branch is `2.0.0-alpha.0`; `master` and preserved `v1/` remain unchanged.
- [M6 data UI](m6-plan.md) is complete. Commit `53790b44` implements native Button behavior, Form groups, List, standalone Select, Pagination, and editable/paged Grid in two authored CVC layouts. Three-browser, package, benchmark, source-doc, and two isolated agent-task gates passed; [M6](m6-plan.md) holds the detailed evidence.
- [M7 page UI](m7-plan.md) is complete. Native Dialog, Popup, and lazy Tabs use the same CVC runner across two authored MDI layouts; the user-approved M1 Popup amendment is reflected in the source and docs. The branch awaits review of the [proposed M8 plan](m8-plan.md).

# Next action

Review [the proposed M8 plan](m8-plan.md) and its fixed three-task protocol. M8 implementation and any public API pruning wait for separate user approval.

# Decisions

- One `mountPage` runtime owns controllers, generated roots, cancellation, outputs, and reverse-order disposal. Borrowed HTML roots remain caller-owned.
- `data-field` and store-local `RowId`, never DOM IDs or display indexes, identify bound values. UI remains authored HTML; framework helpers stay private unless a real cross-component responsibility needs sharing.
- Form/List/Grid share caller-owned `Rows`; Select and Pagination are controlled UI state. Retained Form formatter/validator rules stay inside the UI implementation. Business-specific rules and API conversion remain application code.
- The root 2.0 package uses Apache-2.0; preserved 1.x files and notices under `v1/` retain LGPL-2.1.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | M6 code and browser | Build, typecheck, Vitest 81/81, installed JS/TS consumers, Chromium/WebKit 144/144, and fresh-cache Firefox 72/72 passed. A focused Grid follow-up passed in all three engines. |
| 2026-09-24 | M6 performance and package | On the same i7-9700F Chromium host, 1,000-row flat Grid initial/rebind medians were 12.5/15.7 ms and nested automatic 46.0/45.5 ms, within M6 budgets. List initial/page-start/next medians were 12.3/0.9/0.2 ms. The 88-file, 120,488-byte tarball excludes `v1/`, jQuery, docs, examples, tests, and convenience libraries. See [raw M6 evidence](m6-plan.md). |
| 2026-09-24 | M6 agent tasks | Isolated agents completed an optional nested field (Chromium 19/19) and authored First/Last pagination controls (Chromium 7/7), both with zero code retries and no framework source edits. Field task: 19 unique files, 135,260 bytes of read/review output, 12 files changed (+27/-20 lines), about 9m45s. Page task: 17 unique files, about 147,243 bytes of read output, 8 files changed (+77/-10 lines), about 8m45s. Actual token usage was unavailable; counting methods differ from M5. |
| 2026-09-24 | M6 docs | Nine 2.0 concepts received independent code/source review and verified stamps. Changed and full OKF checks passed: 26 concepts, 5 reserved files, zero errors and warnings. |
| 2026-09-25 | M7 runtime and browser | Popup/Tabs and the two-layout CVC screen passed 20 focused cases in each of Chromium, WebKit, and fresh-cache Firefox (60/60). This includes 20 consecutive Popup openings, native close/cancel, nested focus recovery, async Tabs races, two simultaneous MDI workspaces, shared Rows, and duplicate-ID checks. |
| 2026-09-25 | M7 package and agent task | Build, strict typecheck, Vitest 81/81, installed JS/TS consumers, and a 98-file, 136,368-byte package audit passed. The docs-first Preview task passed first-run Chromium 5/5 and changed OKF check with no code retries: 22 unique read files, about 106,209 UTF-8 read/review bytes, 7 changed files (+87/-24 lines), and 12m03s. Actual token usage was unavailable; see [M7 evidence](m7-plan.md). |
| 2026-09-25 | M7 docs | Six M7 2.0 concepts were independently compared with source and verified. Changed and full OKF checks passed: 30 concepts, 5 reserved files, zero errors and warnings. |

# Open questions

- M6 agent correctness held, but read output increased and methods differ from the M5 replay. The [employee task map](../v2/employee-example.md) now points at narrow regression starts; M8 must use one measurement method for the three fixed tasks before claiming token savings.
- List creates all row records on first bind; its 1,000-row fixture meets the current budget, but a focused M10 review may be needed for larger data sets. Chromium heap samples lack controlled collection.
- The system-installed Firefox does not expose the Playwright protocol. The fresh Playwright Firefox build passed M7; reproduce with `PLAYWRIGHT_BROWSERS_PATH=node_modules/.cache/playwright-m6` for Firefox only. Chromium/WebKit use the default cache.
- M8 must use the same read-byte counting method and the M0 fixed tasks before claiming any 1.x-to-2.0 time or token improvement. M7's Preview result is one successful usability sample, not a comparable savings percentage.
