---
type: Report
title: Natural-JS 2.0 M8 unpublished beta candidate
description: M8 migration, agent tasks, browser, package, performance, and documentation gates before the M9 release plan.
tags: [meta, report, migration, ai]
status: draft
sources:
  - id: plan
    resource: https://github.com/bbalganjjm/natural_js/blob/e9db5d81496b5674b67e6d267c184cb63aa987c0/docs/implementation/m8-plan.md
    title: Approved M8 scope and completion gate
  - id: evaluation
    resource: https://github.com/bbalganjjm/natural_js/blob/e9db5d81496b5674b67e6d267c184cb63aa987c0/docs/implementation/m8-eval.md
    title: Fixed agent tasks and measured outcomes
  - id: audit
    resource: https://github.com/bbalganjjm/natural_js/blob/e9db5d81496b5674b67e6d267c184cb63aa987c0/docs/implementation/m8-api-audit.md
    title: Public surface and retained Form reachability
  - id: migration
    resource: https://github.com/bbalganjjm/natural_js/blob/e9db5d81496b5674b67e6d267c184cb63aa987c0/docs/v2/migration.md
    title: Executable 2.0 migration route
  - id: package
    resource: https://github.com/bbalganjjm/natural_js/blob/e9db5d81496b5674b67e6d267c184cb63aa987c0/package.json
    title: Private ESM package and export map
  - id: grid-benchmark
    resource: evidence/m8-binding-chromium.json
    title: Raw M8 Grid binding measurements
    git_blob: abb254a12d2738a982a7267af1def58c728ade0d
  - id: list-benchmark
    resource: evidence/m8-list-chromium.json
    title: Raw M8 List/page measurements
    git_blob: a5dfad984a95b94b6f1c73b3d3662e93bcd346d1
generated: { by: codex/gpt-6-sol, at: 2026-09-24T19:00:01Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T19:03:17Z }
---

M8 has an unpublished beta candidate on `2.0.0-alpha.0`. The package remains `private: true` and no npm version, tag, or release was published. This report is a review gate for M9; it does not authorize M9 publication.[^plan][^package]

# Scope and contract

The root package retains CVC on authored HTML/CSS, per-screen controllers, shared Rows, native controls and documented keyboard/ARIA behavior, and jQuery-free ESM. M8 changed agent navigation, migration documentation, evaluation fixtures, and the M4/M7 application examples' main-screen focus behavior; it did not change framework runtime exports. The API audit found five entries, 11 runtime values, and 35 exported types. Dynamic Form/Grid/List rule dispatch still reaches 23 formatters, 35 validators, and six combined validator spellings, including private mask, date, and byte support. No runtime export or reachable rule has a justified removal case.[^audit]

The [migration guide](../v2/migration.md) links a preserved 1.x search/grid/detail reference to runnable 2.0 M4 and M7 screens. It maps global `N`/jQuery calls to scoped ESM pages, DOM IDs and display indexes to `data-field` and `RowId`, implicit server payloads to explicit changed rows, and popup/tab positions to inputs, outputs, and keyed pages. The 1.x reference needs its original application services; only the linked 2.0 screens are executable here.[^migration]

# Verification

| Gate | Result |
|---|---|
| Build and package | TypeScript ESM build, strict typecheck, and Vitest 81/81 passed. Actual tarball installation passed separate JavaScript and TypeScript consumers. The dry-run package has 98 files, 136,401 compressed bytes, and no `v1/`, jQuery, docs, examples, tests, or user `js/` files. |
| Browser keyboard, focus, ARIA, and ID regression | Eight focused specs for CVC, M4 search/save/nested binding, M7 MDI, Form, Grid, List, Popup, and Tabs passed Chromium 75/75, WebKit 75/75, and Firefox 75/75. A narrower keyboard close/reopen and immediate-cancel check passed 5/5 in each engine. The additional Task 1 two-live-screen ID check passed 2/2 in Chromium. |
| Binding performance | On the reference i7-9700F host with headless Chromium 153, 1,000-row Grid flat initial/rebind medians were 12.2/16.2 ms versus 30/35 ms budgets; nested automatic were 40.1/44.8 ms versus 90/100 ms budgets. List initial/page-start/next medians were 12.6/1.0/0.2 ms; its fixture had zero duplicate IDs. These are development-server fixture measurements, not production profiling.[^grid-benchmark][^list-benchmark] |
| Documentation | Migration, public API/rule audit, fixed evaluation protocol, raw meter evidence, and the proposed M9 plan are indexed. Changed and full OKF checks passed: 35 concepts, five reserved files, zero errors and warnings. |

The M4/M7 main-screen callers now restore focus to their external Open/Add button after explicit removal. M7 ignores normal canceled main/Tab readiness without changing Popup result cancellation. Both layouts and an immediate open/close race were covered in the three browser engines. These are example-level fixes; the shared CVC runtime is unchanged.

# Agent evaluation

[The fixed protocol](m8-eval.md) reconstructs each task from the post-M7 commit and a small archived overlay; seed tar hashes, briefs, one meter, and supplemental QA are tracked under [`tests/evaluation/m8/`](../../tests/evaluation/m8/README.md). Fresh `gpt-6-sol` agents receive no prior milestone task history. The frozen post-M7 seed predates this M8 documentation, so these runs demonstrate task feasibility under the earlier 2.0 contract, not the effect of M8 documentation edits. [Raw meter logs and a cutoff manifest](evidence/m8-agent-meter-manifest.json) permit recalculating each first-pass read-cost figure. Correctness is checked before read-context cost; actual token telemetry is unavailable.[^evaluation]

| Task | First complete acceptance | Code retries | Content read/search/review output |
|---|---|---:|---:|
| 1. Authored search/List/detail screen | Chromium side/stack 2/2; changed/full OKF zero errors, one stale verification warning resolved by later independent review | 0 | 27 unique content files, 154,895 UTF-8 bytes; precise elapsed time unavailable |
| 2. Email validation and changed-row save | Chromium side/stack 2/2; changed/full OKF zero errors and warnings; 7m18s | 0 | 24 unique content files, 163,253 UTF-8 bytes |
| 3. Delayed close/reopen repair | Chromium 2/2; changed/full OKF zero errors and warnings; 5m39s | 0 | 14 unique content files, 109,304 UTF-8 bytes |

The task-specific apps live only in ignored evaluation checkouts. Task 1's frozen acceptance omitted an ID check while both screens were live; supplemental QA passed, but independent review found its evaluation-only close handler does not restore focus. The production-facing M4/M7 examples were corrected and checked separately in three browser engines. Task 3's first functional solution passed, but two read outputs were truncated, so its 76,834-byte lower bound is excluded. A clean fresh replay passed with untruncated output and supplies the result in the table. No like-for-like 1.x agent fixture exists, and these results do not support a numerical token- or time-savings claim.[^evaluation]

# Review boundary and next gate

The sole public-pruning candidate is the exported `Rule` tuple type: no 2.0 source, example, consumer, or public signature uses it. Deleting that type would affect external TypeScript imports, so it remains pending separate user review. Built-in Form rules, their private helpers, and all 11 runtime values remain. The package is still private and unpublished.[^audit][^plan]

M9 requires its own approved plan for beta, release candidate, and 2.0.0 publication. The planned live Chrome, Edge, and Safari check and a broader WCAG audit are M9 release gates; this M8 browser evidence is scoped to Playwright Chromium, Firefox, and WebKit keyboard, focus, ARIA, and duplicate-ID regressions. Actual agent tokens, 1.x-comparable task cost, and production-scale List virtualization remain unproven. The fixed 1,000-row List fixture meets its current budget.[^plan][^evaluation]

[^plan]: Approved M8 scope and completion gate
[^evaluation]: Fixed agent tasks and measured outcomes
[^audit]: Public surface and retained Form reachability
[^migration]: Executable 2.0 migration route
[^package]: Private ESM package and export map
[^grid-benchmark]: Raw M8 Grid binding measurements
[^list-benchmark]: Raw M8 List/page measurements
