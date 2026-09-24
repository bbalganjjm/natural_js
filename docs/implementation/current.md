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
generated: { by: codex/gpt-6-sol, at: 2026-09-24T22:14:51Z }
---

Use [the roadmap](roadmap.md) for milestone order. The fixed 1.x baseline is `b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6`; its LGPL source and docs remain unchanged under `v1/`.

# Goal

Release a small Apache-2.0, TypeScript-source ESM framework that keeps CVC and authored HTML/CSS, including every framework-reachable Form rule. Prioritize accessible, ID-clean MDI screens, fast nested binding, and short, reliable paths for coding agents.

# Checkpoint

- M0-M8 are complete on `2.0.0-alpha.0`. Their design and verification history is in the [milestone index](index.md), [M6](m6-plan.md), [M7](m7-plan.md), and the [M8 report](m8-beta-report.md). M8 was independently rechecked against pushed commit `e9db5d81496b5674b67e6d267c184cb63aa987c0`, raw agent logs, and a clean full OKF check.
- [M9](m9-plan.md) is approved and in progress. The working manifest is an unpublished `2.0.0-beta.0` candidate. The user approved removing only the unused public `Rule` type; Form formatter/validator runtime stays. Clean source commit `a45fbd669e42e70e4e03624de8286b6440012d53` produced the current [M9 beta artifact](m9-beta-report.md), SHA-256 `ca87cf82f6fe457823500e1933ec52de0a35d8f6a529be50cb37ed6fdea126b8`. Installed JS/TS and five-browser checks passed on that tarball after the Popup focus and authored-layout fix. A fixed docs-first CVC task passed its first complete acceptance with zero code retries on the earlier M9 source; its metered result is in the report.
- The user approved the next M10 work. The [M10 advanced Grid plan](m10-plan.md) now has an inferred 40-row reference screen and [two authored layouts](../v2/advanced-grid-example.md). The first grouped/sticky table slice changes only examples, tests, and docs; it adds no runtime or public API. Chromium, Firefox, and WebKit pass all four focused cases per engine; Firefox needs the repository-local Playwright browser cache on this host. M10.1's automated gate passes, while manual assistive-technology review remains open. M11-M12 remain separate later stages.
- `master` and `v1/` are unchanged. The user's untracked `js/` directory is outside this work. The user excluded Safari from initial 2.0 support and deferred npm publication and release tags until remaining functionality is complete and personally tested. No npm publication or Git release tag has occurred.

# Next action

Review the concrete [M10 reference screen](../v2/advanced-grid-example.md) and its three-engine M10.1 evidence. Measure Grid record lifetime and choose a larger workload before any M10.2 runtime change. Keep the exact M9 beta artifact as unpublished evidence; record manual accessibility, Node/tooling, and trust-field limits without claiming they passed. Do not publish to npm or create a release tag until the user requests it again.

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
| 2026-09-25 | Release scope decision | The user excluded Safari from initial 2.0 support and deferred npm publication and release tags until remaining functionality is complete, personally tested, and explicitly requested for publication. Read-only npm lookup still shows only 1.x, and `npm whoami` reports `ENEEDAUTH`. |
| 2026-09-25 | M10.0/M10.1 authored screen | A 40-row, five-column grouped native table now runs in side-by-side and stacked CVC/MDI layouts with no Grid API change. Focused Chromium, Firefox, and WebKit cases pass 4/4 each, including sort/selection isolation, nested options, sticky geometry, 320px text spacing, and axe A/AA tags. Firefox required the repository-local Playwright browser cache after the default cache failed to launch. |

# Open gates

- The nine previously stale OKF concepts were independently rechecked against source, examples, and the exact beta package; small documentation errors were corrected. The same independent review also covered the changed basic Grid concept and new M10 example. `docs:stamp --verified-by` refreshed all 11 trust fields. Changed and full OKF checks now have zero errors and zero warnings.
- Safari is outside the initial 2.0 support scope by user decision. Chrome and Edge packed-artifact smokes passed on Windows; Playwright WebKit is reported separately as engine evidence. The default Firefox Playwright cache fails to spawn on this host; the repository-local cache passes the new M10 example.
- Actual agent tokens and equivalent 1.x task data are unavailable. M8 read-output bytes are only a context proxy. The 1,000-row List fixture meets its measured budget but does not establish large-list virtualization.
- npm read-only lookup shows `latest` remains 1.x. Registry publish authentication is absent on this host (`npm whoami` returned `ENEEDAUTH`). Publication is deferred by the user until remaining functionality and personal tests are done, regardless of prior beta artifact approval.
