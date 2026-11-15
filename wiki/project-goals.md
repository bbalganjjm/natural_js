---
type: Specification
title: Natural-JS project goals
description: Required feature migration, agent-readable ownership and evidence-based simplification guide Natural-JS development and maintenance.
tags: [project, goals, migration, maintenance]
sources:
  - id: roadmap
    resource: ../docs/implementation/roadmap.md
    title: Migration goals, required scope and simplification decisions
    git_blob: 492b2e46db6a3c0635ebcf0bde7a8eef1adbc41d
  - id: contract
    resource: ../docs/implementation/m1-contract.md
    title: Authored HTML, explicit ownership and retained framework behavior
    git_blob: 4d0b1b4d261e5a638f68dea6eabb8d0386f11647
  - id: evaluation
    resource: ../docs/implementation/m8-plan.md
    title: Fixed coding-agent tasks and honest cost measurements
    git_blob: ae3c5adb97af20549dce89e7bb1c133c529e5495
  - id: review
    resource: ../docs/implementation/m13-review-plan.md
    title: Whole-code review and unpublished development handoff
    git_blob: 828ccf4f284c41621fe0dc4c9283fe4cebcfe760
  - id: owners
    resource: v2/architecture.md
    title: Implemented module boundaries and concrete responsibility sharing
    git_blob: 3f5cc74fd50d2cc4df02c91610ffde2ad43c21ce
generated: { by: codex/gpt-6, at: 2026-11-15T01:13:51Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-15T01:13:51Z }
---

Natural-JS has three required outcomes: migrate the required 1.x capabilities to modern typed owners, make the UI framework understandable and maintainable by coding agents, and simplify its implementation without losing required behavior. These goals continue after the v2 migration; current stage numbers and test counts belong in work records.[^roadmap][^owners]

# Goals

| Goal | Required outcome | Evidence |
|---|---|---|
| Required feature migration | TypeScript-source, ESM and jQuery-free v2 preserves required v1 workflows, CVC, authored HTML/CSS, nested raw values, stable row identity and accessible interaction. Mandatory advanced Grid outcomes remain required. | Owning-stage contracts, executable workflow cases and the feature coverage ledger. |
| AI maintenance and extension | An agent can locate a contract, identify its owning code/types/callers, change the behavior and run its acceptance checks without reading the entire repository or reconstructing decisions from chat. | Source-linked wiki concepts, explicit module/lifetime boundaries and the fixed coding-agent tasks. |
| Evidence-based refactoring | Remove or merge unnecessary code, duplicated responsibilities and redundant public surface; rewrite required implementations for clarity and measured efficiency. | Reachability and compatibility checks, smallest complete changes, regressions and unchanged workload budgets. |

All three goals are required. A smaller implementation cannot trade away required behavior, and functional parity alone does not establish agent usability or a clear ownership structure.[^roadmap][^contract][^evaluation][^owners]

# Boundaries

Before classifying a feature or helper as unused, inspect direct and indirect callers, authored HTML declarations, configuration, types, dynamic rule dispatch and external usage contracts. Preserve framework-used formatter, validator, mask, date and byte behavior. Lack of a static call is insufficient evidence for removal.[^roadmap][^contract]

Deleting a public API or type, or changing its name, signature or meaning, follows the owning contract review and existing approval procedure independently of unused-code analysis. Reuse approvals already granted within scope; do not introduce a repeated permission gate.[^evaluation][^contract]

Only the exact O01-O05 losses in the [approved omission decision](../docs/implementation/omission-decision.md) are approved. Review any further supported capability loss together with its evidence, alternative and migration cost. Prefer native standards and private concrete owners over copied legacy machinery or public convenience wrappers.[^roadmap][^owners]

Preserve the v2 Apache-2.0 and historical v1 LGPL boundaries. Application code owns business policy and visual design. Do not turn the framework into an application configuration registry, a second data engine or an unrelated utility library.[^roadmap][^owners]

# Development acceptance

1. Resolve required functional coverage against actual source and executable cases, including cross-owner paths and explicitly approved exceptions.
2. Validate the exact source and package using the prescribed browser, consumer, accessibility, performance and documentation gates. Retain source/artifact/log identities, failures and unverified limits.
3. Complete the prescribed fixed coding-agent tasks under their authorized evaluation contract. Record correctness, retries, read files/bytes, changed scope and elapsed time separately from actual token telemetry; claim no unmeasured token or model improvement.
4. Complete M13's whole-code review, corrections and independent re-review with no unresolved confirmed Must fix or Should fix. Hand off an unpublished package, feature checklist, verification records and known limits for personal acceptance.[^review][^evaluation]

Personal acceptance is a user action. Registry publication, release tags and master/v1 transitions retain their separately requested and artifact-specific approval conditions. This document does not authorize them.[^roadmap][^review]

# Maintenance after migration

Begin with these goals, the relevant implemented contract and its source. Use a bounded work plan for multi-step changes; completed migration milestones remain history rather than a new checklist for every fix. Keep the same contract, ownership, accessibility, data-integrity and simplification rules.[^owners][^review]

For each fix or extension, identify affected callers/declarations/configuration, reproduce the problem or define acceptance, make the smallest complete correction and run the affected checks. Update the relevant wiki concept, links and knowledge log in the same task. Put the dated plan, execution/review record and raw evidence in docs/, and integrate lasting findings into the existing wiki topic instead of adding another task-summary page. See [Repository workflow](governance/repository-workflow.md).

# Related

Use [module boundaries](v2/architecture.md) for implementation ownership and [the package contract](v2/package.md) for public entries and installed-artifact checks. During migration, [the active work plan](../docs/implementation/current.md) owns the resume point and [the numbered continuation](../docs/implementation/remaining-work-plan.md) owns dependencies and final gates.

[^roadmap]: Migration goals, required scope and simplification decisions
[^contract]: Authored HTML, explicit ownership and retained framework behavior
[^evaluation]: Fixed coding-agent tasks and honest cost measurements
[^review]: Whole-code review and unpublished development handoff
[^owners]: Implemented module boundaries and concrete responsibility sharing
