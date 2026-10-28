---
type: Plan
title: Natural-JS 2.0 M13 whole-code review and remediation
description: Required whole-code review and verified remediation after feature parity and before personal testing or release preparation.
tags: [meta, plan, review, quality]
status: draft
sources:
  - id: roadmap
    resource: roadmap.md
    title: Milestone order and final review gate
    git_blob: 4cbd20e61c7ea08e4b412a0c92dd88461ed52cf9
  - id: parity
    resource: feature-parity-plan.md
    title: Required feature completion and dependency order
    git_blob: f21dc30191205e687f1ab6d8e85a5fa050893a98
  - id: coverage
    resource: feature-parity.md
    title: Framework behavior coverage and approved omission boundary
    git_blob: 3685a8bafa18e201e2eb251508dd150e167c88d6
  - id: workflow
    resource: ../governance/repository-workflow.md
    title: Source truth, independent review and documentation upkeep
    git_blob: a8d61fb373b6ade2fc623216378de623324609c8
  - id: architecture
    resource: ../v2/architecture.md
    title: Public ownership, one-way dependencies and private sharing
    git_blob: 4eafe9804d201c4eaa9db1b5c764e21f741b4f3d
  - id: evaluation
    resource: m8-eval.md
    title: Fixed agent tasks and honest read-cost accounting
    git_blob: 55fc924b1d85dbaaf41718eb8441930b95ac1865
  - id: package
    resource: ../../package.json
    title: Package entries, build and verification commands
    git_blob: 393602a69677d5fdaf7968fd49b19efd1b7d5cae
generated: { by: codex/gpt-6, at: 2026-10-20T15:04:19Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-20T15:04:19Z }
---

# Goal

Complete a final review of the entire 2.0 implementation using `ponytail:ponytail-review`, then resolve its findings in the milestone's approved remediation step, with regression checks and independent re-review. This is a mandatory gate after all required feature parity and before personal testing or separately requested release preparation. Preserve CVC, authored HTML/CSS, stable row identity, retained Form rules and the existing public ownership boundaries.[^roadmap][^parity][^architecture]

# Checkpoint

M13 is a future required milestone. Its review and fixes have not run. Earlier M0-M12 results remain dated evidence within their original scopes. Finish every required Grid/component/CVC/communication family, P0 semantic and dynamic closure, and the owning milestone gates first. A pending omission is still required until the user's consolidated decision explicitly approves it.[^coverage][^parity]

The named skill produces a read-only report: it lists findings and changes no code. Explicitly name the complete scope below when invoking it; its default last-change scope does not satisfy M13. Apply fixes in the separate implementation step authorized for this milestone, outside the skill's read-only report; this separation does not add another permission gate for routine fixes. New core contracts and proposed feature removal retain their existing review requirements.[^workflow][^roadmap]

| Review area | Required coverage |
|---|---|
| 2.0 runtime | All `src/` modules, their callers and transitive dependencies; trace inputs, stored state, outputs, errors and cleanup across role boundaries. |
| Consumers and verification | Tests, fixtures, application examples and tools, including installed JS/TS and browser consumers, benchmarks and document checks. |
| Public delivery | Public exports/types, package metadata, generated build contents, archive boundaries, README, API/migration/demo documentation and behavior coverage. Compare generated output; never edit it by hand. |
| Preserved reference | Use `v1/` only to resolve intended behavior and migration obligations. Its source, docs, licenses and bundles stay unchanged; master remains untouched. |

# Steps

1. **Freeze the review baseline.** Record the branch, commit, source fingerprints, declared browser/load assumptions and exact package artifact. Confirm required parity and its gates are complete. Map the whole scope to owning modules so the review covers existing code as well as the final diff; record anything unavailable instead of claiming it was checked.[^parity][^coverage]
2. **Run the read-only skill review.** Inspect correctness, security, data loss, failure/cancellation/disposal, expected-load behavior, meaningful test gaps, speed and unnecessary code. Trace every affected caller and indirect declaration/configuration/rule path. Keep the skill's numbered Must fix, Should fix and Nice to have report, including each concrete trigger, wrong result, smallest fix and consequence of skipping it. No concrete case means no finding.
3. **Record and resolve each finding.** Give each finding a stable ID, owner, affected symbols/callers, reproduction, expected/actual result and disposition. Must fix and Should fix findings must be fixed and verified before M13 closes. A claim disproved by evidence is recorded as such rather than silently dropped. Every Nice to have receives either a fix or a concrete decision explaining why the current behavior/code is retained. Do not defer a confirmed Must fix or Should fix beyond this gate.
4. **Apply the smallest complete authorized correction.** Reproduce the defect first and retain a regression that fails on the baseline and passes after the fix, or an equivalent deterministic check. Fix the shared cause and all affected callers, tests, fixtures, tools, exports and docs. Preserve boundary validation and error handling. Follow the existing module ownership and public API contracts; avoid speculative abstractions, extra dependencies and convenience APIs.[^architecture][^workflow]
5. **Verify behavior, performance and agent work cost.** Run the affected gates after each correction. Retain the fixed binding, nested-data, bulk-paste, row-block and viewport budgets; measure changed hot paths against the same fixture, host, warm-ups and sample method, with any new limit declared before measurement. Replay the three fixed task briefs and acceptance checks against the frozen final 2.0 baseline; pin each reconstructed seed and one declared read-accounting method. Preserve old seed identities as history and disclose any necessary fixture adapter without weakening acceptance. Record correctness, retries, full/partial file and byte reads, changed scope, elapsed time and actual tokens only when available. File-size or context-read proxies are separate measures; do not claim token or speed savings without comparable evidence.[^evaluation]
6. **Run final gates on frozen corrected sources.** Pass build, strict source/example types, units, full Chromium/Firefox/WebKit, installed JS/TS and all five required Windows browser consumers on one exact tarball, existing performance budgets, and changed/full OKF checks with zero errors and warnings. Verify public entries and declarations, every archive member, source/log/artifact hashes, package dependency/license boundaries and updated indexes/log. Keep earlier evidence immutable.[^package][^workflow]
7. **Independently re-review and hand off.** A separate reviewer checks the corrections and their connected flows, tests, documentation and final evidence. Recheck all original and newly found Must fix/Should fix findings; repeat correction and verification until none remains. Record remaining suggestion decisions and unverified limits. Only then mark M13 complete and hand over for personal testing; any release-candidate work, release tag or npm publication still needs its separate user request.[^roadmap][^workflow]

The completion record must connect each finding to its reproduction, minimal correction, regression and affected gate results, final source identity and independent re-review outcome. Passing a suite alone does not close a finding whose reported case was never checked.

# Next action

Continue the active required parity work. Prepare M13's frozen scope and invoke `ponytail:ponytail-review` only after that work and P0 closure are complete. This plan adds the final gate; it does not start a whole-code review or certify unfinished features.

# Decisions

- Review the complete 2.0 code and delivery path, including established code outside the last diff. Judge load against the repository's real supported workloads and declared fixtures.
- Check public signatures, defaults, errors, callback order, nested raw/display values, document-unique IDs and accessibility against callers, tests and docs. A smaller implementation must preserve required behavior.
- Remove code only after checking direct, transitive, configuration, declaration and runtime rule reachability. Retain framework-used formatter/validator/mask/date/byte behavior; application-owned business logic stays outside the framework. A static absence of calls is insufficient proof of dead code.[^parity][^architecture]
- Share identical existing responsibilities and keep feature-specific algorithms with their owner. A lean-code suggestion must name the unused code or existing replacement and its demonstrated effect.
- Real macOS/iOS Safari remains excluded. Available Chromium, Firefox, WebKit and installed Chrome/Edge gates remain required. Manual assistive-technology, actual OS IME/clipboard and personal acceptance limits remain explicit; automation does not establish those results.
- M13 approves no feature omission, master/v1 change, release tag or npm publication. Personal testing follows M13 and precedes separately requested release work.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-10-20 | Final review milestone requested | Draft plan only. The whole-code review, remediation, runtime gates and independent final re-review remain pending; no historical result is recertified. |

# Open questions

- The final source baseline, supported-load assumptions and package identity are selected after required parity closes; current milestone evidence cannot certify that future baseline.
- Actual token telemetry and an equivalent comparison may remain unavailable. Record that limit and the separate read-cost observations without inventing measurements.[^evaluation]
- Personal/manual acceptance and any remaining manual accessibility or OS-integration checks stay open. Real Safari remains outside the agreed scope; publication remains deferred.

[^roadmap]: Milestone order and final review gate
[^parity]: Required feature completion and dependency order
[^coverage]: Framework behavior coverage and approved omission boundary
[^workflow]: Source truth, independent review and documentation upkeep
[^architecture]: Public ownership, one-way dependencies and private sharing
[^evaluation]: Fixed agent tasks and honest read-cost accounting
[^package]: Package entries, build and verification commands
