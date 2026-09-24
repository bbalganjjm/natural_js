---
type: Plan
title: Natural-JS 2.0 active plan
description: Checkpoint, next action, and verification record for the milestone-gated Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF conventions for the Natural-JS bundle
    git_blob: 8a4d4db0197ba476c9c1a3b76e897787cf2a2a29
generated: { by: codex/gpt-6-sol, at: 2026-09-24T06:51:22Z }
---

The Natural-JS 2.0 migration follows [the master roadmap](roadmap.md). Read this short checkpoint before starting or resuming a milestone. The 1.x code and usage concepts remain the factual reference until a 2.0 implementation replaces them.

# Goal

Deliver a TypeScript-first, jQuery-free, ESM Natural-JS 2.0 that preserves CVC and behavior attached to authored HTML. Keep only functions required by framework behavior; application formatting, validation rules, and general utilities stay with the application.

# Checkpoint

- M0 complete (2026-09-24): the clean 1.x baseline is commit b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6 on master; development branch codex/natural-js-2 starts at that commit.
- The changed docs check passed before M0 edits: 65 concepts, 16 reserved files, 0 errors, 0 warnings.
- The approved roadmap keeps M0-M12 in order. Each milestone receives a detailed plan and review before implementation. M0 is complete; M1 contract work is the next reviewed scope.

# Steps

- [x] Confirm clean 1.x baseline, restore repository contract, and create the 2.0 development branch.
- [x] Record code-backed CVC, HTML component, declaration, and data design intent in [M0 baseline](m0-baseline.md).
- [x] Classify public APIs, utilities, and libraries by 2.0 necessity and ownership.
- [x] Select the representative screen and three fixed agent evaluation tasks.
- [x] Write the [M1 detailed plan](m1-plan.md), including decisions to review before M1 implementation.
- [x] Run changed and full documentation checks; close the M0 checkpoint.

# Next action

Review [the M1 detailed plan](m1-plan.md), then define and review the concrete API examples and signatures before M2 implementation.

# Decisions

- Preserve the Communicator-View-Controller roles and authored HTML as design intent; replace jQuery-based mechanisms and global initialization.
- Treat existing public use or internal calls as evidence to inspect, not automatic justification for migration.
- Keep framework-specific mechanics inside their owning component when a public utility is unnecessary.
- Preserve the 1.x documentation at the immutable baseline commit. Do not describe unimplemented 2.0 APIs as current behavior.
- M1 freezes minimum data ownership, row identity, validation-result, and page lifecycle contracts before the M4 vertical screen.

# Verification log

| Date | Check | Result |
|---|---|
| 2026-09-24 | Git baseline | Clean master at b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6; created codex/natural-js-2. |
| 2026-09-24 | Pre-M0 changed docs check | 65 concepts, 16 reserved files; 0 errors, 0 warnings. |
| 2026-09-24 | M0 independent source audits | Architecture, UI/data, and representative examples were checked against their 1.x sources by separate agents; four findings were corrected in the M0 and M1 records. |
| 2026-09-24 | M0 docs checks | Changed and full bundle checks: 68 concepts, 16 reserved files; 0 errors, 0 warnings. |

# Open questions

- M1 public API names, exact method signatures, and authored HTML binding syntax remain M1 design decisions.
