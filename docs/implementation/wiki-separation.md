---
type: Plan
title: Natural-JS wiki and work-record separation
description: Separate reusable wiki knowledge from work records while preserving the paused v2 migration and its evidence.
tags: [meta, plan, documentation]
sources:
  - id: goals
    resource: ../../wiki/project-goals.md
    title: Lasting migration, maintenance and simplification goals
    git_blob: 2aa76e89c51018b9936f991ee33987f3eea5cca4
  - id: workflow
    resource: ../../wiki/governance/repository-workflow.md
    title: Source-grounded same-task wiki maintenance
    git_blob: 2d6f65ecb4763000971e655a355b4c9dc703fefe
  - id: format
    resource: ../../wiki/governance/okf-conventions.md
    title: Separate OKF knowledge and work roots
    git_blob: a686d5dddba29d0079fbdbbd3851d9c20bb28bb4
  - id: checker
    resource: ../../tools/knowledge-docs/knowledge-docs.mjs
    title: Cross-root documentation checker and stamper
    git_blob: 2752950e806b769b507b3f3e99b4a8a5c2674594
generated: { by: codex/gpt-6, at: 2026-11-15T01:19:18Z }
---

This work changes documentation ownership and tooling, not the paused M5.16 implementation. Its tests and raw evidence do not establish a new framework acceptance result.

# Goal

Keep only work plans, checkpoints, reviews, execution records and raw artifacts in docs/. Compile lasting contracts, architecture, design reasons, pitfalls and maintenance knowledge into wiki/. Keep the three [project goals](../../wiki/project-goals.md) visible during migration and subsequent maintenance.[^goals][^workflow]

# Checkpoint

- The user paused the other migration session before final preservation checks. A temporary backup stores the original active documents and a SHA-256 manifest of 3,903 runtime, test, example, tool and raw-evidence files. The two documentation-tool files are intentionally outside that unchanged-file manifest.
- The previous local AGENTS.md was created in the preceding task; it is now updated for this explicit schema change.
- Context7 resolved `/langchain-ai/openwiki` and supplied source-evidence reconciliation and selective agent retrieval documentation. Karpathy's original gist and OpenWiki's official sources were also read. OpenWiki is a reference, not an installed project dependency.

# Steps

| Area | Result |
|---|---|
| `docs/v2/` and `docs/governance/` | Move to `wiki/v2/` and `wiki/governance/`; no duplicate canonical pages or redirects remain. |
| `wiki/index.md`, `wiki/log.md`, `wiki/project-goals.md` | Add a short navigation route, a new knowledge log and stable goals; do not copy current milestone counts or raw execution history. |
| `docs/implementation/`, `docs/log.md` | Retain work records, historical dates and raw artifacts; update only required document links and migration routing. |
| Checker and regression fixtures | Validate both roots and cross-links, keep work records stampable, reject clearly misplaced API/component/architecture knowledge or work plans, restrict public symbol coverage to wiki knowledge and preserve the exact raw-evidence exclusion. |
| Provenance | Preserve pre-existing unfinished source drift and missing stamps. Refresh only reviewed documentation/tool provenance affected by this migration; do not certify paused code. |

References and operating principles are documented in [Repository workflow](../../wiki/governance/repository-workflow.md). Keep existing OKF provenance and independent checks rather than adding an OpenWiki runtime, Claims database or scheduled model work.[^workflow][^format][^checker]

## Historical evaluation path adapter

The fixed M8 briefs, seeds, acceptance tests and evidence remain unchanged. When a future authorized replay uses their old documentation paths, record this navigation-only adapter: `docs/v2/` → `wiki/v2/`, `docs/governance/` → `wiki/governance/`, knowledge navigation/logging → `wiki/index.md` and `wiki/log.md`. Work-plan and raw-evidence paths stay in docs/. This changes no behavioral acceptance criterion and earns no new evaluation result.

# Next action

This separation is complete. Resume the existing stage from [current.md](current.md), using wiki/ for every lasting contract and knowledge update. The paused implementation retains its own source review, runtime/package/browser/performance gates and document reconciliation.

# Decisions

- New reusable knowledge is integrated into wiki topics only. A work report remains in docs/ and links the lasting concept rather than duplicating it.
- Old migration plans are work history after completion; routine maintenance starts from current goals, contracts and code.
- Existing raw bytes, historical timestamps, fixed tests and unfinished code are preserved. A successful documentation check is not runtime verification.

# Verification log

| Check | Result |
|---|---|
| Documentation-tool regression | `node --test tools/knowledge-docs/knowledge-docs.test.mjs`: 1/1 passes, including dual roots, cross-links, historical logs, wiki-only API coverage and exact evidence exclusion. |
| Independent tool review | No actionable finding; six additional assertions cover bundle-relative and cross-root paths, sibling boundaries and Windows path casing. |
| Paused-file preservation | All 3,903 recorded runtime/example/test/tool/raw-artifact SHA-256 values remain identical. |
| Independent goal/operating-rule review | The three goals, maintenance lifecycle and docs/wiki roles agree with their source contracts; explicitly retain public API/type review boundaries. |
| Full documentation structure | Both roots load without broken links, missing sources or metadata/index errors. Unfinished source drift and missing stamps are retained for the owning M5.16 stage. |

The [machine-readable receipt](evidence/wiki-separation-20261115.json) records selected document-source updates, excluded pre-existing drift, final commands, logs and hashes. The final full check has zero structural errors and 126 retained source-drift/missing-stamp warnings; changed mode raises 121 of those findings to errors. The new goals, governance and separation record pass the scoped check with zero errors or warnings. Framework runtime, consumer, browser, performance and model evaluations have not run in this task.

# Open questions

Paused M5.16 source changes retain their original incomplete documentation/verification status. Resolve those in the owning migration stage; never hide them through a bulk stamp.

[^goals]: Lasting migration, maintenance and simplification goals
[^workflow]: Source-grounded same-task wiki maintenance
[^format]: Separate OKF knowledge and work roots
[^checker]: Cross-root documentation checker and stamper
