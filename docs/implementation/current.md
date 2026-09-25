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
generated: { by: codex/gpt-6-sol, at: 2026-09-25T01:10:39Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-25T01:11:51Z }
---

Use [the roadmap](roadmap.md) for milestone order. The fixed 1.x baseline is `b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6`; its LGPL source and docs remain unchanged under `v1/`.

# Goal

Release a small Apache-2.0, TypeScript-source ESM framework that keeps CVC and authored HTML/CSS, including every framework-reachable Form rule. Prioritize accessible, ID-clean MDI screens, fast nested binding, and short, reliable paths for coding agents.

# Checkpoint

- M0-M8 are complete on `2.0.0-alpha.0`. Their design and verification history is in the [milestone index](index.md), [M6](m6-plan.md), [M7](m7-plan.md), and the [M8 report](m8-beta-report.md). M8 was independently rechecked against pushed commit `e9db5d81496b5674b67e6d267c184cb63aa987c0`, raw agent logs, and a clean full OKF check.
- [M9](m9-plan.md) is approved and in progress. The working manifest is an unpublished `2.0.0-beta.0` candidate. The user approved removing only the unused public `Rule` type; Form formatter/validator runtime stays. Clean source commit `a45fbd669e42e70e4e03624de8286b6440012d53` produced the current [M9 beta artifact](m9-beta-report.md), SHA-256 `ca87cf82f6fe457823500e1933ec52de0a35d8f6a529be50cb37ed6fdea126b8`. Installed JS/TS and five-browser checks passed on that tarball after the Popup focus and authored-layout fix. A fixed docs-first CVC task passed its first complete acceptance with zero code retries on the earlier M9 source; its metered result is in the report.
- The user chose a full-feature interactive Grid demo as the M10 reference screen. M10.1 kept grouped/sticky headings in authored HTML/CSS; M10.2 released offscreen records; M10.3 added the approved opt-in Grid `initialPage?: PageRequest` without changing the default. The 5,000-row/50-visible-row first bind measured 3.0 ms and 1,347 DOM nodes versus 96.2 ms and 105,297 nodes for the unchanged default on the same source. The fixed 1,000-row budgets pass. M10.4's docs-first screen passed in Chromium and Firefox after one Vite module-URL correction, and the rebuilt unpublished tarball passed installed JS/TS and Chromium, Firefox, WebKit, real Chrome, and real Edge consumers. [M10 evidence and limits](m10-plan.md) records raw measurements, task cost, and exclusions. Column state, bulk edit, and multi-selection remain unselected; M11-M12 are later stages.
- `master` and `v1/` are unchanged. The user's untracked `js/` directory is outside this work. The user excluded real Safari on macOS or iOS from initial 2.0 support and deferred npm publication and release tags until remaining functionality is complete and personally tested. No npm publication or Git release tag has occurred.

# Next action

Review the completed M10 evidence, keep its small public contract stable, and prepare a detailed M11 tree/custom-date scope before implementing that milestone. Do not inherit unused 1.x operations without a real caller. Manual assistive-technology testing and personal product review remain open. Do not publish to npm or create a release tag until the user requests it.

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
| 2026-09-25 | Release scope decision | The user excluded real Safari on macOS or iOS from initial 2.0 support and deferred npm publication and release tags until remaining functionality is complete, personally tested, and explicitly requested for publication. Read-only npm lookup still shows only 1.x, and `npm whoami` reports `ENEEDAUTH`. |
| 2026-09-25 | M10.0/M10.1 authored screen | A 40-row, five-column grouped native table now runs in side-by-side and stacked CVC/MDI layouts with no Grid API change. Focused Chromium, Firefox, and WebKit cases pass 4/4 each, including sort/selection isolation, nested options, sticky geometry, 320px text spacing, and axe A/AA tags. Firefox required the repository-local Playwright browser cache after the default cache failed to launch. |
| 2026-09-25 | M10 demo and M10.2 lifetime | The interactive current-contract Grid demo passed 5/5 focused cases per engine in Chromium, Firefox, and WebKit. Existing and new Grid lifetime cases passed 12/12 per engine; M4 CVC and M10 two-layout checks passed another 23/23 per engine after the source change. Build/typecheck/Vitest 81/81 and installed JS/TS consumers passed; one unpublished SHA-gated tarball passed its browser consumer in Chromium, Firefox, and WebKit, with 98 packed files and no 1.x/jQuery/demo. Same-process 5,000-row forward/reverse comparisons cut post-page DOM nodes 105,238→1,288 with ~27–30% slower traversal; fixed 1,000-row flat/nested budgets passed. Initial 5,000-row DOM peak remains. Independent source audit found no severe lifetime regression and prompted explicit demo rebind warning plus textarea/checkbox checks. |
| 2026-09-25 | M10.3 bounded first page | Seven new Grid browser cases passed on final source in Chromium and Firefox after recovery; the same source had passed 35 focused Grid cases in each of Chromium, Firefox, and WebKit before recovery. The 5,000-row same-source final rerun measured 3.0 ms/1,347 DOM nodes with initialPage versus 96.2 ms/105,297 nodes by default. Fixed 100/1,000-row budgets passed. Build, typecheck, and Vitest 81/81 passed after recovery. |
| 2026-09-25 | M10.4 agent and artifact | Independent docs-first Grid screen passed Chromium and Firefox after one fixture module-URL correction, with agent-reported reads of 9 docs/60,445 bytes and 4 core docs/22,371 bytes; no raw meter or actual token count is available. The recovered local tarball SHA-256 08a698cf0e7008fb0dec4eea627a78ddb1685d1359830bf0011108a2ac4226d8 passed installed JS/TS and exact-hash browser consumers in Chromium 153, Firefox 155, WebKit 26.6, real Chrome 153, and real Edge 153. It remains unpublished. |
| 2026-09-25 | WebKit scope and rerun | The user clarified that Playwright WebKit remains required on this Windows host; only real Safari on macOS or iOS is unavailable. The current source passed the full Playwright suites in Chromium 123/123 (25.0 seconds), Firefox 123/123 (54.9 seconds with the local cache), and WebKit 123/123 (45.9 seconds). The exact M10.3 tarball SHA-256 08a698cf0e7008fb0dec4eea627a78ddb1685d1359830bf0011108a2ac4226d8 passed its WebKit 26.6 browser consumer. These are engine checks, not real Safari vendor coverage. |
| 2026-09-25 | Workspace recovery | A brief external Vite initialization removed tracked files. Restored the branch at b2335c3 and missing tracked files from Git, rebuilt dependencies and examples/docs, removed its root index.html and new IDE module file, and restored the one original untracked js lockfile from the Sep 24 backup. No tracked deletion remains; normalized Git diff is limited to M10.3/M10.4. A copied Git index still reports false modified stat entries for unchanged LF files, so stage only explicit task paths. |

# Open gates

- The nine previously stale OKF concepts were independently rechecked against source, examples, and the exact beta package; small documentation errors were corrected. The same independent review also covered the changed basic Grid concept and new M10 example. `docs:stamp --verified-by` refreshed all 11 trust fields. Changed and full OKF checks now have zero errors and zero warnings.
- Real Safari on macOS or iOS is outside the initial 2.0 support scope because this host has no Mac. Playwright WebKit is an available, required engine check on this Windows host alongside Chromium, Firefox, installed Chrome, and installed Edge. The current source passed 123/123 in each of Playwright Chromium, Firefox, and WebKit; the exact M10.3 tarball passed consumers in those engines plus installed Chrome and Edge. A WebKit pass does not claim real Safari coverage. The default Firefox Playwright cache fails to spawn on this host; the repository-local cache passes.
- Actual agent tokens and equivalent 1.x task data are unavailable. M8 read-output bytes are only a context proxy. The 1,000-row List fixture meets its measured budget but does not establish large-list virtualization.
- npm read-only lookup shows `latest` remains 1.x. Registry publish authentication is absent on this host (`npm whoami` returned `ENEEDAUTH`). Publication is deferred by the user until remaining functionality and personal tests are done, regardless of prior beta artifact approval.
