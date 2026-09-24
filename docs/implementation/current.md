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
generated: { by: codex/gpt-6-sol, at: 2026-09-24T20:41:30Z }
---

Use [the roadmap](roadmap.md) for milestone order. The fixed 1.x baseline is `b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6`; its LGPL source and docs remain unchanged under `v1/`.

# Goal

Release a small Apache-2.0, TypeScript-source ESM framework that keeps CVC and authored HTML/CSS, including every framework-reachable Form rule. Prioritize accessible, ID-clean MDI screens, fast nested binding, and short, reliable paths for coding agents.

# Checkpoint

- M0-M8 are complete on `2.0.0-alpha.0`. Their design and verification history is in the [milestone index](index.md), [M6](m6-plan.md), [M7](m7-plan.md), and the [M8 report](m8-beta-report.md). M8 was independently rechecked against pushed commit `e9db5d81496b5674b67e6d267c184cb63aa987c0`, raw agent logs, and a clean full OKF check.
- [M9](m9-plan.md) is approved and in progress. The working manifest is an unpublished `2.0.0-beta.0` candidate. The user approved removing only the unused public `Rule` type; Form formatter/validator runtime stays. Clean source commit `a45fbd669e42e70e4e03624de8286b6440012d53` produced the current [M9 beta artifact](m9-beta-report.md), SHA-256 `ca87cf82f6fe457823500e1933ec52de0a35d8f6a529be50cb37ed6fdea126b8`. Installed JS/TS and five-browser checks passed on that tarball after the Popup focus and authored-layout fix. A fixed docs-first CVC task passed its first complete acceptance with zero code retries on the earlier M9 source; its metered result is in the report.
- `master` and `v1/` are unchanged. The user's untracked `js/` directory is outside this work. No npm publication or Git release tag has occurred.

# Next action

Review the exact beta artifact, remaining Safari/manual-accessibility and npm-auth gates, and trust-field warnings before any registry publication or release tag. If the beta is approved and publishing becomes available, publish that exact version; then plan and verify the RC and stable artifacts separately. Do not treat Playwright WebKit as a real Safari test.

# Decisions

- One `mountPage` runtime owns per-instance controllers, cancellation, outputs, and reverse-order cleanup. `data-field` and store-local `RowId` identify values; DOM IDs only connect labels and ARIA.
- Form/List/Grid share caller-owned Rows; Select/Pagination are controlled UI state. Keep Form-reachable rules and their private helpers; leave business logic to applications. Publish no convenience utility package.
- The root 2.0 package is Apache-2.0. Preserved 1.x files and LGPL notices stay in `v1/`.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-25 | M8 handoff | Independent review matched the pushed SHA, three fixed task raw logs, browser evidence, package scope, and 35-concept OKF check with zero errors/warnings. [M8 report](m8-beta-report.md) has counts and limits. |
| 2026-09-25 | M9 early checks | Build, typecheck, and Vitest 81/81 passed after the `Rule` type removal. The fixed-tarball JS/TS harness passed on a test tarball; the packed browser harness passed on a beta tarball in Chromium. Final candidate SHA-gated checks remain. Popup keyboard focus regression passed in Chromium, Firefox, and WebKit. The isolated full browser suite passed 103/103 each in Chromium, Firefox, and WebKit. Both authored M4/M7 layouts passed axe-tagged A/AA checks in the tested states; binding budgets passed on the reference host. |
| 2026-09-25 | Exact beta artifact | Commit `c79b9eae` produced tarball SHA-256 `8695a3ba04950f0caa278b38b6acc0d8aafca1717c36a7091cb0849fd2bcfc7e`. Its JS/TS installed consumers and Chromium, Firefox, WebKit, real Chrome, and real Edge browser consumers passed on Windows. The [M9 beta report](m9-beta-report.md) records versions, package contents, accessibility limits, and absent npm auth. |
| 2026-09-25 | M9 replay and raw logs | A fresh agent repaired the fixed delayed CVC example on the first complete acceptance: Chromium 2/2, zero code retries, 17 files and 85,572 metered output bytes in 6m53s. The [M9 beta report](m9-beta-report.md) lists the task limits and raw meter. |
| 2026-09-25 | Corrected beta artifact | The `a45fbd6` package passed 103/103 source browser tests in each of Chromium, Firefox, and WebKit; SHA-gated installed JS/TS and packed browser checks in those three engines plus real Chrome and Edge on Windows; and refreshed Grid/List budget measurements. An independent package audit found 98 packed files, five public entries, 11 runtime exports, 34 types, and no jQuery or 1.x. M4 side/stack 320px text-spacing and M7 side-layout Popup focus regressions passed in three engines. |

# Open gates

- The changed OKF check has zero errors and nine `verified-stale` warnings: six from the original M9 candidate and three from the accessibility architecture/examples. Automatic approval review rejected refreshing the original six trust stamps because it considered the separate-agent report insufficient evidence. Keep all nine as warnings pending accepted independent verification; do not mark them verified by another route.
- No Mac is available, so real Safari is unverified. Chrome and Edge packed-artifact smokes passed on Windows; Playwright WebKit is reported separately.
- Actual agent tokens and equivalent 1.x task data are unavailable. M8 read-output bytes are only a context proxy. The 1,000-row List fixture meets its measured budget but does not establish large-list virtualization.
- npm read-only lookup shows `latest` remains 1.x. Registry publish authentication is absent on this host (`npm whoami` returned `ENEEDAUTH`); do not publish before exact-artifact approval.
