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
  - id: m11
    resource: m11-plan.md
    title: M11 implementation and verification
    git_blob: 9e17e3e9105eb359f364760c551a3caaa4094d7d
  - id: m12
    resource: m12-plan.md
    title: M12 notification and document shell implementation
    git_blob: 86629a9401e3172ea7157003c513a0353648284b
  - id: parity
    resource: feature-parity-plan.md
    title: Required feature completion and consolidated omission review
    git_blob: 821e6b9d0ffc7f9bef29b0690790f79be2bb6d67
generated: { by: codex/gpt-6, at: 2026-10-05T09:51:49Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T09:51:49Z }
---

Use [the roadmap](roadmap.md) for milestone order and [the milestone index](index.md) for completed history. The fixed 1.x baseline is b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6; its LGPL source and docs stay unchanged under v1/.

# Goal

Complete all 1.x framework capabilities and the required advanced Grid features in a small Apache-2.0, TypeScript-source ESM framework. Keep CVC, authored HTML/CSS, retained Form rules, accessible unique-ID MDI, fast nested binding, consistent contracts and short reliable paths for coding agents. Only explicitly approved omissions may reduce user-facing feature coverage.

# Checkpoint

- M0-M8 are complete; the [M8 report](m8-beta-report.md) contains migration and fixed agent-task evidence.
- M9 has a verified unpublished beta; [the report](m9-beta-report.md) preserves its exact artifact and historical harness. Release-candidate work, npm publication and release tags remain deferred until personal testing and the user's corresponding request.
- Selected [M10 slices](m10-plan.md) are complete: authored grouped/sticky Grid, offscreen record release, bounded initialPage and the current Grid demo. Resize/reorder/hide, multiple selection, bulk paste and true virtualization are now mandatory gaps, not optional post-release work.
- The selected [M11](m11-plan.md) scope is complete: authored Tree and DatePicker, two-layout CVC example, independent contract audit, and recovered full browser/package/document gates. Remaining 1.x Tree/calendar behavior is required by the new parity plan.
- Work stays on 2.0.0-alpha.0. master and v1/ are unchanged. The original untracked js lockfile was restored from the Sep 24 backup and remains outside this task.

- Selected M12 implementation is complete: authored Notify and dynamic Documents, a private coordinator shared with static Tabs, and two application shell layouts using the same CVC editor in main content/documents/Popup. Final verification is recorded in [its plan](m12-plan.md); remaining legacy shell behavior is not yet complete.
- Active work is [full feature completion](feature-parity-plan.md). The [initial coverage ledger](feature-parity.md) records 60 behavior families and the eight-file surface checklist; exhaustive per-option/dynamic mapping and the consolidated omission proposal remain open. No new user-facing omission is approved.[^parity]

# Next action

Close P0's surface/options/dynamic-reachability mapping and prepare one consolidated feature-omission proposal. Prepare M10.5's authored HTML/TS column-state contract with shared row/control and viewport dependencies, then continue M10.6-M10.9 and the other owning milestones. Follow the [execution plan](feature-parity-plan.md) without loading all historical reports for routine tasks. Existing demos remain available for testing; extend the Grid demo as features work. Full required behavior and personal testing precede any separately requested release candidate. No npm publication or release tag.[^parity]

# Decisions

- mountPage owns per-instance controllers, cancellation, output and reverse-order cleanup. data-field and store-local RowId identify data; DOM IDs connect labels/ARIA only.
- Form/Grid/List/Tree share caller-owned Rows. Select/Pagination/DatePicker use controlled UI state. Retain framework-reachable rules; keep business logic in applications and no public utility package.
- Complete all 1.x framework behavior using modern implementations. Proposed obsolete/unneeded feature omissions require one consolidated user decision; until then they remain required. Remove only unused/unrelated helpers after direct, indirect, configuration and declaration reachability checks. Used replaceable helpers preserve their owning behavior.
- Plan common responsibilities before implementing them. Share actual control/identity/change/cleanup behavior, keep feature-specific algorithms local, and avoid a new generic library. Optimize binding and bulk/viewport updates with measured evidence.
- Root 2.0 uses Apache-2.0; v1/ license, source and notices remain unchanged.
- Chromium, Firefox and WebKit are required. Use node_modules/.cache/playwright-m6 for Firefox if the default Windows cache fails. Installed Chrome/Edge verify the same package tarball; real macOS/iOS Safari is excluded.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-10-05 | Previous milestones | Immutable evidence and recovery details stay in the individual milestone plans and reports; no historical result was rerun or recertified by a document fingerprint refresh. |
| 2026-10-05 | M12 final gates | Build/types/example types and 81 unit tests passed; Chromium/Firefox/WebKit 167/167 each. Installed JS/TS and all five Windows browser consumers passed on the same 128-file tarball, SHA-256 ea0f8e2e5538d6a0f210ab3918d3141658a2370b9c7362b72512008af5266c32. Independent findings, raw logs, source hashes and context limits stay in the [M12 plan](m12-plan.md). |
| 2026-10-05 | Required scope correction | Initial source audits identify concrete Grid, other UI and core gaps. Full 1.x coverage and six Grid capabilities are release prerequisites. This planning update adds no runtime feature and reruns no historical gate. |

# Open questions

- Accessibility automation covers tested states only. Personal review and manual assistive-technology checks remain open.
- Actual token use and equivalent 1.x task data remain unavailable. Prior measurements and M11 docs-first reads are context proxies.
- Registry publication and release tags are deferred regardless of local manifest eligibility or authentication.
- P0's complete mapping and the one omission decision are pending. New public column/batch/viewport contracts require detailed stage review; earlier selected-scope approvals do not prove full legacy coverage.

[^parity]: Required feature completion and consolidated omission review
