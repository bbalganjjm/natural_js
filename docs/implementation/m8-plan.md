---
type: Plan
title: Natural-JS 2.0 M8 agent and migration QA plan
description: Approved agent evaluation, 1.x migration, API pruning, and beta-candidate evidence after M7.
tags: [meta, plan, migration, ai]
status: draft
sources:
  - id: roadmap
    resource: roadmap.md
    title: First-release milestones and M8 boundary
    git_blob: f5c11372df84b5cbddf729ec5d599825d59e3d99
  - id: baseline
    resource: m0-baseline.md
    title: Fixed representative screen and three agent tasks
    git_blob: 18172dc51ce39e36e35911d9e432ff75c904bb68
  - id: contract
    resource: m1-contract.md
    title: Approved CVC and retained Form rule contracts
    git_blob: 5cb7c544900bbd86867971e87003518858e498e1
  - id: m7
    resource: m7-plan.md
    title: M7 page-container result and fixed Preview task
    git_blob: 492f57c7d29bd9133d4e818c1115b86c8c906e89
  - id: workflow
    resource: ../governance/repository-workflow.md
    title: Same-task OKF source and verification rules
    git_blob: a8d61fb373b6ade2fc623216378de623324609c8
generated: { by: codex/gpt-6-sol, at: 2026-09-24T18:59:01Z }
---

M8 was approved by the user on 2026-09-25. This approval does not authorize a public contract deletion or package publication. It turns the implemented M0-M7 framework into a short, executable migration guide and a measured agent workflow before the M9 release gate.[^roadmap][^baseline][^m7]

# Goal

Let a coding agent locate the relevant contract, add or repair a screen correctly, and touch few files with little read context. Give a 1.x user a runnable route to 2.0 without discarding framework-reachable Form formatter, validator, mask, or date behavior. Produce an unpublished beta candidate with evidence, not a claim of token savings inferred from unlike tasks.[^baseline][^contract][^roadmap]

# Checkpoint

- M0 froze three representative tasks: add an authored-HTML search/list/detail page, add an email field with built-in and custom validation plus changed-row save, and fix a delayed-request close/reopen race. Their acceptance behavior remains fixed.[^baseline]
- M7 supplied one CVC page runtime for main content, Popup, and Tabs, with two authored MDI layouts and a first docs-only Preview task. That task passed its first code run without a retry; its read-byte method differs from earlier tasks, so it is evidence of usability, not a cross-version savings percentage.[^m7]
- M8 is complete against post-M7 commit `f659f1d8c86ad39925eda44b55d569b175e96e57`; [the candidate report](m8-beta-report.md) holds its measured gates and limits. The root 2.0 package remains private, while preserved LGPL-2.1 1.x source and documentation stay under `v1/`.[^roadmap]

# Steps

| Step | Work | Reviewable evidence |
|---|---|---|
| 0. Freeze comparisons | Pin the post-M7 2.0 commit, the preserved 1.x baseline, task prompts, model, tools, fixtures, acceptance tests, and measurement script. Use a fresh isolated checkout for each task. Keep task outcomes comparable even where API-specific instructions must differ. | Baseline manifest, neutral task briefs, exact acceptance criteria, and an explicit list of non-comparable measures. |
| 1. Shorten agent lookup | Audit the entry-point and concept paths from `docs/index.md` to the relevant source. Put exact signatures, minimal HTML/TS examples, failure clues, and direct source links near each task. Resolve contradictions and repeated prose without creating a new convenience library or a second documentation system. | A docs-first agent can find the one owner for CVC, Rows, Form rules, Popup, and Tabs without searching 1.x source for 2.0 use. |
| 2. Write migration guidance | Build runnable before/after search/list/detail, Form save, and Popup/Tab examples. Map legacy global `N`/jQuery calls to ESM and scoped roots; DOM ID/index lookup to `data-field` and `RowId`; implicit communication to explicit requests; and the old popup caller/tab position flow to input, output, and keyed pages. Classify excluded helpers as browser API, application implementation, or discontinued behavior. | JS and TS consumer examples execute. The guide states changed server payload and validation behavior, including `equalTo` field-path semantics. It does not republish the removed utility catalog. |
| 3. Verify retained Form reachability | Trace built-in formatter and validator names through declarations, Form dispatch, List/Grid row forms, and their internal mask/date/byte support. Keep rules that framework behavior can reach, including indirect string-named rules; distinguish an intentional 2.0 change from a 1.x bug. | A reachability table links each retained rule family to its call path and a focused regression. No rule is removed merely because a static import search misses dynamic dispatch. |
| 4. Run the three fixed agent tasks | Task 1 adds a search/list/detail screen in two authored layouts with the same keyboard behavior. Task 2 adds an `email` field, one application validator, and a changed-row save payload: invalid input sends zero requests and valid save sends only changed rows. Task 3 fixes a delayed-request close/reopen race: a removed view receives zero late updates and repeated use leaves no listener growth. Check first-run correctness before costs. | For each isolated attempt: acceptance result, code retries, unique files read, UTF-8 bytes from read/search/diff-review output (including rereads), changed files and added/deleted lines, elapsed time, and actual token usage only if exposed. Record build/test output separately. Compare 1.x and 2.0 only where the same counting method and acceptance contract apply. |
| 5. Prune with evidence | Inventory every public export and prominent example against an actual framework responsibility, user call site, and current docs. Remove redundant private splits, duplicate prose, or dead code only after direct and indirect reachability checks. Bring any public contract deletion or semantic change back for review before editing it. | A keep/remove-candidate table with reason and ownership; package export/declaration/consumer checks; no jQuery, legacy convenience bundle, or framework-reachable Form rule loss. |
| 6. Prepare beta candidate | Run focused CVC/MDI, keyboard/focus/ARIA/ID, delayed-work, nested binding and performance smoke checks in Chromium, Firefox, and WebKit; install the actual tarball in JS and TS consumers; check migration examples and OKF. Capture supported limits and release blockers. | Unpublished beta-candidate report with task costs, migration map, tests, package inventory, remaining risks, and zero changed/full OKF errors. M9 beta, release candidate, and 2.0.0 publication require their own plan and approval. |

# Next action

Review [the M8 candidate report](m8-beta-report.md), [fixed evaluation results](m8-eval.md), and [proposed M9 plan](m9-plan.md). Keep the unused public `Rule` type until a separate contract decision; M9 implementation and package publication remain outside this M8 approval.

# Decisions

- Preserve CVC, authored HTML/CSS, direct calls, small role modules, and framework-reachable Form rules. M8 simplifies navigation and examples; it does not add a generic registry, formatter package, or utility library.[^contract][^roadmap]
- First-pass correctness precedes time or context cost. Use one counting method for all new tasks. Report actual tokens only when the execution environment exposes them; UTF-8 read-output bytes are a separate proxy, never called tokens.[^baseline][^m7]
- Keep 1.x untouched, including its source, docs, bundle, and license. Root 2.0 remains Apache-2.0. Do not publish or tag a beta in M8 without a later explicit release decision.[^roadmap]
- Update English OKF concepts, folder indexes, bundle log, and source fingerprints with code changes. Add `verified` only after independent source review, and keep the changed check at zero errors.[^workflow]

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-25 | Planning input | Derived this plan from the M0 fixed tasks, M1 retained-rule contract, M7 container result, roadmap, and repository workflow. |
| 2026-09-25 | User approval | User approved M8 after the M7 GitHub push. Evaluation, migration, reachability, and beta-candidate checks may proceed; public API deletion and publication remain separate decisions. |
| 2026-09-25 | Migration and API | Indexed 1.x-to-2.0 migration, audited five public entries, 11 runtime values, 35 types, and all declaratively reachable Form rules. The only public removal candidate, `Rule`, remains unchanged. See [audit](m8-api-audit.md) and [guide](../v2/migration.md). |
| 2026-09-25 | Fixed agent tasks | Three fresh 2.0 tasks passed frozen Chromium acceptance (2/2 each) with zero post-implementation code retries. First-pass content output was 154,895/163,253/109,304 UTF-8 bytes across 27/24/14 unique files. Task 2/3 elapsed 7m18s/5m39s; Task 1 and actual token counts are unavailable. Raw meter logs and cutoffs are tracked; no 1.x or M8-doc-effect savings claim is made. See [evaluation](m8-eval.md). |
| 2026-09-25 | Browser, package, binding | Focused CVC/UI checks passed 75/75 each in Chromium, Firefox, and WebKit, plus Task 1 supplemental simultaneous-ID QA 2/2. Build, strict types, Vitest 81/81, packed JS/TS consumers, and 1,000-row reference Grid/List budgets passed. The 98-file tarball excludes legacy and evaluation files. See [candidate report](m8-beta-report.md). |
| 2026-09-25 | Documentation | Changed/full OKF checks passed with 35 concepts, 5 reserved files, zero errors and warnings after source review and fingerprinting. The M9 release plan is a draft for separate approval. |

# Open questions

- A 1.x versus 2.0 agent comparison needs equivalent task acceptance and the same measurement script. The M8 fresh tasks used frozen post-M7 documentation, so they establish 2.0 feasibility but not the effect of M8's new navigation/migration docs or numerical token savings.
- The user must review any proposed removal or changed meaning of a public 2.0 API. Treat such a finding as a decision point, not an automatic M8 cleanup.
- Actual token telemetry may remain unavailable; report the measured read context and its counting method without estimating tokens.

[^roadmap]: First-release milestones and M8 boundary
[^baseline]: Fixed representative screen and three agent tasks
[^contract]: Approved CVC and retained Form rule contracts
[^m7]: M7 page-container result and fixed Preview task
[^workflow]: Same-task OKF source and verification rules
