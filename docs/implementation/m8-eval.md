---
type: Plan
title: Natural-JS 2.0 M8 fixed agent evaluation
description: Pinned task seeds, acceptance checks, and consistent agent read-cost accounting for M8.
tags: [meta, plan, ai, evaluation]
status: draft
sources:
  - id: baseline
    resource: m0-baseline.md
    title: Fixed representative screen and agent tasks
    git_blob: 18172dc51ce39e36e35911d9e432ff75c904bb68
  - id: m8
    resource: m8-plan.md
    title: Approved M8 agent evaluation gate
    git_blob: a184d6e243dde94460fadf28d3bb116b24d27a2a
  - id: m7
    resource: m7-plan.md
    title: Earlier agent sample and source map
    git_blob: 492f57c7d29bd9133d4e818c1115b86c8c906e89
  - id: fixture-readme
    resource: ../../tests/evaluation/m8/README.md
    title: Pinned reconstruction procedure and archive hashes
    git_blob: afabc750816535a3325545a34184d0f211b7948c
  - id: meter
    resource: ../../tests/evaluation/m8/meter.mjs
    title: Common UTF-8 content-output meter
    git_blob: 1a275eaff10683ebbb0dee713d0f46ced550b42d
  - id: task1-brief
    resource: ../../tests/evaluation/m8/task1-brief.md
    title: Frozen Task 1 instructions
    git_blob: 8c09bf359137bee6c6d7942f3824d3a07aae0d4a
  - id: task2-brief
    resource: ../../tests/evaluation/m8/task2-brief.md
    title: Frozen Task 2 instructions
    git_blob: 799e098f07e549d8a9bbf7ea8362360a40bebc5d
  - id: task3-brief
    resource: ../../tests/evaluation/m8/task3-brief.md
    title: Frozen Task 3 instructions
    git_blob: 38e2f36cf0a77f987a3383c42bf94db4eccaa3b0
  - id: task1-seed
    resource: ../../tests/evaluation/m8/task1-seed.tar
    title: Task 1 authored fixture and acceptance
    git_blob: aed935544d74ace6d6e0313bc3c13015f488ea97
  - id: task2-seed
    resource: ../../tests/evaluation/m8/task2-seed.tar
    title: Task 2 authored fixture and acceptance
    git_blob: 56dac735eb3a70d712d0e11300c74154a6e7f991
  - id: task3-seed
    resource: ../../tests/evaluation/m8/task3-seed.tar
    title: Task 3 authored fixture and acceptance
    git_blob: 4dbb5ec697a5ec4b5802757795834525a4693137
  - id: task1-mdi-qa
    resource: ../../tests/evaluation/m8/task1-mdi-qa.spec.mjs
    title: Supplemental two-live-screen duplicate-ID acceptance
    git_blob: 3a45407e6c74cb600c7f036168635ea81cd3a802
  - id: meter-manifest
    resource: evidence/m8-agent-meter-manifest.json
    title: First-pass record cutoffs and recomputation formula
    git_blob: bdc470edbddd2e38dbbe5a55fae22529401f4bbf
  - id: meter-task1
    resource: evidence/m8-agent-meter-task1.jsonl
    title: Task 1 raw read-cost log
    git_blob: 0cec3e5465fe6349d43bf817db5751358436b87a
  - id: meter-task2
    resource: evidence/m8-agent-meter-task2.jsonl
    title: Task 2 raw read-cost log
    git_blob: 30881a62f819a9f08b06f252a7a29ee50f8cfd36
  - id: meter-task3
    resource: evidence/m8-agent-meter-task3.jsonl
    title: Task 3 clean replay raw read-cost log
    git_blob: 28252d00d01abfa1640840fb1553c36b4859d9bc
  - id: meter-task3-excluded
    resource: evidence/m8-agent-meter-task3-excluded.jsonl
    title: Task 3 excluded truncated-output run log
    git_blob: 5ef25da1659144fb1836b4b6a7b94cb035d24369
generated: { by: codex/gpt-6-sol, at: 2026-09-24T18:59:05Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T19:03:13Z }
---

M8 was approved on 2026-09-25. This protocol measures whether a coding agent can add or repair an authored-HTML CVC screen from the frozen post-M7 documentation, while keeping correctness ahead of time and context cost.[^baseline][^m8] The M7 Preview sample used a different byte-counting method and cannot serve as a numeric comparison.[^m7]

# Fixed inputs

| Item | Frozen value |
|---|---|
| 2.0 source baseline | `f659f1d8c86ad39925eda44b55d569b175e96e57` after M7; baseline tar SHA-256 `4F0AF4527034494F737D1563E24CD891B30A5C2DB40EBF28A2A537F50DF66191` |
| Model and context for formal replay | `gpt-6-sol`, `fork_turns:none`, no prior milestone task history; the fixed brief plus repository agent instructions are the initial task context |
| Tools | Repository shell, `rg`, build/typecheck, Vite and Playwright; no browser state or unrecorded external fixture |
| Task 1 seed | Pinned source archive plus an authored side layout, authored stack layout, CSS, employee JSON, JavaScript Playwright acceptance, and evaluation-only `.mjs` config; no `main.ts` implementation |
| Task 1 seed identity | Local evaluation commit `2e9d00b12dec3b4bd99bdcde515c2e6bcb9fea0a`, tree `c45286d7794770ab5b0424e3243fdbffcdc5f15d`; seed tar SHA-256 `8AE5F81F2F58EFF35B9788C3A61B42E8C8B6176B46781F13A00CCCA63BC4052E` |
| Task 2 seed identity | Local evaluation commit `26ca1d6ad9ee274c5f5680c226c53fd72c55d986`; seed tar SHA-256 `BA39CC15DD2EAA6294D19A25537C987C113DF3B5F0AC222A7E15DC233A484990` |
| Task 3 seed identity | Local evaluation commit `014cee6897a09290a066ffd26daff4385a2b8c5d`; seed tar SHA-256 `C1C035DF3CF1E2AA320C8365E56A1D87E5F351AC48E2B88AA2376AD19FBFB38D` |
| Fixture location for this run | Ignored `node_modules/.cache/m8-task1-f659f1d8/` with `baseline.tar`, `task1-seed.tar`, `task1-brief.md`, `meter.mjs`, `seed/`, `work/`, and a reconstructed `replay-seed/` |

The seed tar extracted over the pinned source archive was independently checked in a fresh directory. Its Git tree exactly matches the local seed commit tree and has no `examples/vite/m8-task1/main.ts`. The ignored local Git commit is an identity for this evaluation seed, not a project commit. The preserved `v1/`, the root checkout, and the user's untracked `js/` are outside the evaluation write path.

# Tasks and acceptance

| Task | Fixed implementation target | First-run acceptance |
|---|---|---|
| 1. Add a directory screen | Use the seeded side/stack authored HTML with one CVC controller, search Form, read-only List and row-local nested Select, selected detail Form, one Rows store per screen, and two independent screen instances. | Both layout cases pass Enter search/selection, raw nested choice `22`, skipped incomplete option, detail edit reflected in List, two-screen isolation and cleanup, zero duplicate IDs and page errors. The fixed test is `tests/browser/m8-task1.spec.mjs`; the seed test cannot be edited. |
| 2. Add validated email and save | Begin from the post-M7 M4 screen with its detail email field, application validator, and changed-row payload deliberately removed. Restore built-in email validation, one application validator, and changed-row save. | Invalid input sends zero requests; a valid save sends only changed rows, with the same test on both layouts. The fixed test is `tests/browser/m8-task2.spec.mjs`; the seed test cannot be edited. |
| 3. Repair delayed close/reopen | Begin from a small authored CVC profile screen with an intentionally seeded delayed-response write and retained document listener. | A removed view receives zero late updates, a reopened view has its own result, and repeated use shows no listener growth. The fixed test is `tests/browser/m8-task3.spec.mjs`; the seed test cannot be edited. |

Task 1 instructions are frozen in the ignored `task1-brief.md`. Run `npm run build`, `npm run typecheck`, a direct TS 7 check of the added `main.ts` with `--ignoreConfig`, the fixed Chromium Playwright test through `tests/playwright.eval.config.mjs`, and changed/full OKF checks after documenting the example. The evaluation checkout is under `node_modules/.cache`, where Node refuses to strip TypeScript from Playwright config or test files; the seeded `.mjs` files are an environment adapter, not an application change. The fixed `reuseExistingServer: false` setting prevents a different checkout's Vite server on port 4173 from silently satisfying the test.

Task 2 and Task 3 each have a frozen brief and unchanged two-layout or two-case Chromium test under their respective ignored cache directories. Task 2's missing email and all-row payload fail both cases in the seed; a separate validation copy passed both without changing acceptance. Task 3's delayed detached-root write and accumulated refresh listener fail both cases in the seed. No formal agent result is claimed from these fixture calibrations. A 1.x comparison still needs equivalent acceptance and the same meter; 1.x has no matching browser fixture yet. The formal seeds predate this M8 migration and navigation documentation, so these results do not measure that new documentation's effect.[^baseline][^m8]

# Measurement method

1. Start a fresh isolated checkout for each attempt. Give the agent only the fixed brief, seed, repository instructions, and allowed tool names. Start elapsed wall time at task dispatch; stop at the first complete acceptance run. Record the first complete run separately from later repair runs.
2. Route every content read, `rg` search, filename listing, and diff review through `meter.mjs --work <checkout> {read|read-lines|search|files|review}`. The meter emits the content and records its UTF-8 byte count and matched content-file paths in `<checkout>-meter.jsonl` beside the checkout. Repeated reads count again in bytes; unique content files count once. Filename-only listings contribute output bytes but do not count as content files.
3. Keep each meter output at or below 24 KiB and set the tool output budget high enough to show it completely. Split larger reads by line ranges or narrow searches. A truncated tool response invalidates that sample until rerun. Read framing headers are counted; the short meter diagnostic footer is excluded by definition.
4. Exclude build/test/runtime output from read-context bytes and report it separately. After the first implementation, run the complete acceptance once. A failed behavior is a first-pass correctness failure even if a later retry succeeds. Count code-change cycles after that run as code retries; report environment-only command/test-harness reruns separately.
5. Use `git add -N` for new files and `git diff --numstat` against the seed to record changed files and added/deleted lines. Read and review output includes any `git diff` emitted to the agent; `git diff --numstat` is result metadata and is excluded from the content-byte count for all three tasks. Report actual tokens only when the execution host exposes telemetry; UTF-8 output bytes are a context proxy, not tokens.

The meter is a tracked evaluation helper, not a package utility. Its optional `--work` argument selects a fresh checkout so the formal replay does not read the pilot's work tree or append to its meter log. The [raw meter logs and manifest](evidence/m8-agent-meter-manifest.json) preserve first-pass record cutoffs, SHA-256 hashes, and a recomputation formula. For each task, sum non-`files` `bytes` and count distinct `files` in the first-pass records; sum filename-only bytes separately. Later diff reviews and reads are excluded from first-pass cost.

# Task 1 pilot result

An agent with inherited M7 Popup context used the fixed authored layouts and added `examples/vite/m8-task1/main.ts` (78 lines). The same controller loaded the fixture with the page signal, bound the local search and row-bound detail Forms plus List to per-screen Rows, filtered by name, kept nested choices, and disposed all handles through CVC ownership. It also wrote an English OKF example and related index/log entries in the isolated work tree. Five files differ from the seed: +148/-4 lines. No root source, public export, preserved 1.x file, or user `js/` file changed.

The pilot build and strict package typecheck passed. Actual token telemetry and a clean-start elapsed time were unavailable. A direct TypeScript check passed after using TS 7's required `--ignoreConfig` flag. The final fixed Chromium acceptance passed both authored layouts (2/2); changed and full OKF checks passed with 31 concepts, 5 reserved files, zero errors and warnings. The first test attempts exposed only evaluation-harness mistakes: Node's TypeScript restriction in the ignored cache path, a selector that counted the `<template>` as a live screen, and a positional locator that changed after closing the first screen. The seed and test were corrected before the 2/2 run; application code was not revised after its first draft.

This pilot is a procedure check, not a formal fresh-agent score. The agent had prior M7 context, content reads began before the final meter, and the acceptance seed changed during calibration. Do not compare its read bytes, time, or first-pass status to M4-M7 or 1.x. A fresh agent must start again from the final seed above and produce a separate first-run record.

# Task 1 formal replay

A fresh `gpt-6-sol` agent with no M7 history started from the one-commit checkout whose tree matches the frozen Task 1 seed. Its first complete acceptance passed build, package typecheck, direct strict example TypeScript, and the fixed Chromium side/stack cases (2/2). Changed and full OKF checks had zero errors and one `verified-stale` warning because the agent added a Related link to an earlier verified concept; it did not self-verify that page. Code retries: zero. A separate reviewer compared the new example and related existing concept with their source after scoring; both were verified and the stale warning was cleared.

Before the first pass, the meter recorded 27 unique content files and 154,895 UTF-8 bytes from reads and searches; filename-list output was 9,179 bytes separately. There was no diff review before the pass. The first-pass result changed five files (+148/-2 lines). A later diff review emitted 11,571 bytes, excluded from the first-pass cost. Actual tokens and precise dispatch-to-pass elapsed time were unavailable for Task 1, so neither is estimated. Task 2 and Task 3 capture dispatch and completion timestamps explicitly.

The fixed Task 1 test checks duplicate DOM IDs only after closing the first of two screens. This does not prove IDs are unique while both are live. The separate [simultaneous MDI QA](../../tests/evaluation/m8/task1-mdi-qa.spec.mjs) passed both layouts (2/2) while both screens were open, without changing the frozen scoring test. Independent review also found that the evaluation-only opener does not restore focus after close and may rethrow an early normal page cancellation. These are not covered by the fixed score. Root M4/M7 caller focus and normal-cancellation handling were corrected, documented, and tested in Chromium, WebKit, and Firefox.

# Task 2 formal replay

A separate fresh `gpt-6-sol` agent started from the parentless checkout whose tree matches the Task 2 seed. Its first complete acceptance passed build, package typecheck, direct strict example TypeScript, the fixed Chromium side/stack cases (2/2), and changed/full OKF with zero errors and warnings. Code retries: zero. The changed-doc check needed three failed fingerprint iterations before its fourth pass; these are documentation corrections, not application-code retries.

Dispatch was 2026-09-24 18:24:13 UTC and first full pass 18:31:31 UTC, or 7m18s. The meter recorded 24 unique content files and 163,253 UTF-8 bytes of first-pass read/search output; filename-list output was 32 bytes separately. A later diff review emitted 15,172 bytes and is excluded. Ten files changed (+24/-16 lines). Actual tokens were unavailable. This is a successful 2.0 task, not a 1.x savings comparison.

# Task 3 formal replay

The first fresh Task 3 agent repaired the seeded detached-root write and retained document listener. Its first complete acceptance passed the fixed Chromium cases (2/2), build, package typecheck, direct strict example TypeScript, and changed/full OKF with zero errors; full OKF retained one orphan warning. There were zero code retries. Dispatch-to-pass elapsed time was 5m29s and five files changed (+74/-6 lines). Two content outputs were truncated by the outer tool channel, however, so its recorded 76,834 UTF-8 bytes are only a lower bound and are excluded from comparable context-cost results.

A second fresh `gpt-6-sol` agent started from the identical Task 3 seed tree with a clean meter and no sibling-worktree access. The initial seeded browser run failed both cases as expected. After one implementation, the first complete acceptance passed build, package typecheck, direct strict example TypeScript, fixed Chromium cases (2/2), and changed/full OKF (31 concepts, zero errors and warnings). There was no post-implementation code retry. Dispatch at 18:44:08 UTC and pass at 18:49:47 UTC on 2026-09-24 give 5m39s. The first-pass meter records contain 14 unique content files and 109,304 UTF-8 bytes of read/search/review output; there was no filename-list output before the pass. Later review/read output of 8,530 bytes and filename-list output of 7,570 bytes are excluded. Six files changed (+70/-8 lines). One oversized meter read was rejected and split before output; no emitted tool response was truncated. Actual tokens were unavailable. The replay is the Task 3 cost result; the earlier functional run remains disclosed but is not averaged into it. The clean log and cutoff manifest allow independent recomputation without opening an ignored evaluation checkout.

# Open questions

- The seed overlay archives, briefs, meter, raw formal logs, and cutoff manifest are tracked under `tests/evaluation/m8/` and `docs/implementation/evidence/`. The upstream baseline tar is reproducible byte-for-byte from the pinned Git commit and its hash above; later replays should compare all four archive hashes before starting.
- Task 2 and Task 3 seed archives are fixed and independently checked red; preserve their archive hashes and briefs for later replay. The Task 2 fixture green check used a separate validation copy. Both formal fresh-agent replays now passed the frozen browser acceptance.
- The fixed agent-task tests run in Chromium only. The production-facing M4/M7 CVC and UI regression suite passed separately in Chromium, Firefox, and WebKit; actual Chrome, Edge, and Safari remain M9 release gates.[^m8]

[^baseline]: Fixed representative screen and agent tasks
[^m8]: Approved M8 agent evaluation gate
[^m7]: Earlier agent sample and source map
