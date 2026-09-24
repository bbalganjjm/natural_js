---
type: Plan
title: No active plan
description: Completed OKF migration record for Natural-JS; no implementation work is currently scheduled.
tags: [meta, plan]
sources:
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF conventions for the Natural-JS bundle
    git_blob: 8a4d4db0197ba476c9c1a3b76e897787cf2a2a29
generated: { by: codex/gpt-6-sol, at: 2026-09-24T05:48:21Z }
---

The legacy-guide migration is complete. No implementation plan is active.

# Goal

No active goal. The completed migration replaced 24 legacy guides with an English OKF v0.2 bundle and added the llm-wiki upkeep workflow.

# Checkpoint

- **Complete (2026-09-24):** 62 Natural-JS concepts, two governance pages, this plan, 15 index files, and one bundle log are present.
- All 474 inventoried legacy headings were accounted for: 442 mapped to concepts and 32 dropped with a recorded reason. Seven dropped example stubs are listed as Gaps in the log.
- All local concept sources are stamped. Twenty A-group concepts have an independent verification record that still applies to their final content; the remaining concepts have no final-body independent verification recorded.
- The 24 legacy guides were removed from the working tree. They remain available in Git commit 8877a4a4. No commit was made for this migration.

# Steps

- [x] CP0 Baseline, checker, conventions, reference concept, heading inventory.
- [x] CP1 Workflow A: 47 concepts and independent claim review.
- [x] CP2 Workflow B: 14 tutorial and example concepts reviewed; three behavior corrections made.
- [x] CP3 Coverage: 474 of 474 headings mapped or given a DROP reason.
- [x] CP4 Root and folder indexes plus bundle log.
- [x] CP5 Repository workflow, agent instructions, and package scripts.
- [x] CP6 Remove the 24 legacy guides from the working tree.
- [x] CP7 Stamp all 65 concepts and record only applicable independent verification.
- [x] CP8 Changed and full docs checks passed; agent links and legacy patterns reviewed.
- [x] CP9 Remove temporary migration records, compare protected files, and close the plan.

# Next action

No active migration work. Open a new checkpointed plan only for a newly approved task.

# Decisions

- Code remains the source of truth for Natural-JS behavior. Suspected code bugs are documented under Known issues and need separate approval for a code fix.
- Seven legacy example headings contained no usable implementation and remain explicit Gaps in the bundle log.
- Verification fields were withheld where the final concept body did not receive an independent code review.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Legacy heading coverage | 474 of 474 accounted for; 442 concept mappings, 32 DROP reasons; no duplicate or missing targets. |
| 2026-09-24 | Bundle source stamp | 65 concept files stamped; 20 unchanged A-group concepts independently verified. |
| 2026-09-24 | Changed docs check | 65 concepts, 16 reserved files; 0 errors and 0 warnings. |
| 2026-09-24 | Full docs check | 65 concepts, 16 reserved files; 0 errors and 0 warnings. |
| 2026-09-24 | Protected files | CLAUDE.md and .codex/config.toml match their baseline Git hashes. .gitignore changed from d79c8616 to 4f7f003b (.codex became .codex/); the current unstaged file was kept at the user's request. |
| 2026-09-24 | Legacy and agent links | No legacy guide files remain; required agent-linked docs files exist; legacy-pattern matches are intentional governance, TODO, and FIXME mentions. |

# Open questions

- None.
