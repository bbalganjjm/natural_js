---
type: Plan
title: Natural-JS 2.0 active plan
description: Checkpoint, next action, and verification record for the milestone-gated Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF conventions for the Natural-JS bundle
    git_blob: 1aec14a9274385900faa288921b27b17d193aeff
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:25:16Z }
---

The Natural-JS 2.0 migration follows [the master roadmap](roadmap.md). Read this short checkpoint before starting or resuming a milestone. The 1.x code and usage concepts remain the factual reference until a 2.0 implementation replaces them.

# Goal

Deliver a TypeScript-first, jQuery-free, ESM Natural-JS 2.0 that preserves CVC and behavior attached to authored HTML. Retain Form-used formatter/validator engines, built-in rules, and required helpers; remove only framework-unreachable utilities.

# Checkpoint

- M0 complete (2026-09-24): the clean 1.x baseline is commit b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6 on master; development branch codex/natural-js-2 starts at that commit.
- The changed docs check passed before M0 edits: 65 concepts, 16 reserved files, 0 errors, 0 warnings.
- The user approved M1 contract work on 2026-09-24 and corrected the migration boundary: Form-used formatter/validator behavior stays. A later M1 steering adds standards-conformant duplicate-ID handling, accessibility, fast binding, and nested JSON with row-local Select options. The user approved the M1 contract and M2 implementation on 2026-09-24. The 2.0 package foundation was built in `v2/`, while the 1.x root source, package, and LGPL license remain unchanged. Only the new 2.0 package uses Apache-2.0.

# Steps

- [x] Confirm clean 1.x baseline, restore repository contract, and create the 2.0 development branch.
- [x] Record code-backed CVC, HTML component, declaration, and data design intent in [M0 baseline](m0-baseline.md).
- [x] Classify public APIs, utilities, and libraries by 2.0 necessity and ownership.
- [x] Select the representative screen and three fixed agent evaluation tasks.
- [x] Write the [M1 detailed plan](m1-plan.md), including decisions to review before M1 implementation.
- [x] Run changed and full documentation checks; close the M0 checkpoint.
- [x] Correct M0/M1 migration classification for declarative Form rules and transitive helpers.
- [x] Draft [the M1 public contract](m1-contract.md) with JS/TS/HTML flows, signatures, failure rules, nested data, accessible IDs, performance gates, and API decisions.
- [x] Draft [the M2 tooling plan](m2-plan.md).
- [x] Receive user review of the M1 contract and approval of the M2 scope.
- [x] Complete the isolated TypeScript/ESM package, installed JS/TS checks, available browser smoke, and 2.0 OKF concepts; Firefox is blocked by this Windows host.
- [ ] Review M2 results and approve the detailed M3 runtime plan.

# Next action

Review the completed [M2 tooling plan](m2-plan.md) and [M3 runtime plan](m3-plan.md). Do not implement M3 before its scope is approved.

# Decisions

- Preserve the Communicator-View-Controller roles and authored HTML as design intent; replace jQuery-based mechanisms and global initialization.
- Retain behavior reachable through framework code, Form rule names in HTML, configuration, and List/Grid row Forms. Remove a utility only after this full reachability audit finds no framework use.
- Keep framework-specific mechanics inside their owning component when a public utility is unnecessary.
- Preserve the 1.x documentation at the immutable baseline commit. Do not describe unimplemented 2.0 APIs as current behavior.
- The approved M1 contract fixes minimum data ownership, row identity, validation results, Form rule retention, page lifecycle, and standards/performance gates before the M4 vertical screen.
- Put a private helper in a shared module only when at least two framework roles need the same stable behavior; otherwise keep it near its owner. Keep one-way role imports and never grow a public convenience utility catalog.
- Apache-2.0 applies only to newly written `v2/` source and its package. Preserve all 1.x LGPL files and third-party notices without relabeling them.

# Verification log

| Date | Check | Result |
|---|---|
| 2026-09-24 | M0 completion | Baseline and prior verification are recorded in [M0 baseline](m0-baseline.md); branch codex/natural-js-2 starts at b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6. |
| 2026-09-24 | M1 source/design audits | Separate agents checked CVC, Form rule dispatch, nested Select limits, duplicate IDs, accessibility, and example lifetimes; findings were corrected in the draft contract. |
| 2026-09-24 | M0 correction verification | An independent agent rechecked the revised M0 facts against source; the verified stamp was renewed. |
| 2026-09-24 | M1 docs checks | Changed and full OKF checks: 70 concepts, 16 reserved files, 0 errors, 0 warnings. |
| 2026-09-24 | M2 package | `npm ci`, build, typecheck, Vitest 2/2, installed JS/TS consumers, and docs checker regression test passed. `npm pack --dry-run` listed 33 files, including source and declarations, with no 1.x bundle or jQuery. |
| 2026-09-24 | M2 browser | Chromium and WebKit import smoke passed 2/2. Playwright Firefox could not start on this Windows host (SideBySide `mozglue` assembly error) after reinstall; its project remains configured. |
| 2026-09-24 | M2 documentation | Changed and full OKF checks: 78 concepts, 17 reserved files, 0 errors, 0 warnings. Independent review verified the 2.0 package and FrameworkError concepts. |

# Open questions

- M4 prototypes automatic nested Select binding and may request the user-approved explicit per-row fallback if correctness or performance fails.
- Firefox smoke remains unverified on this Windows host because the browser executable fails before loading the page; rerun on a working host before the later browser gate.
