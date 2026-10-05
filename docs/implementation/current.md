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
    git_blob: 995067f23917286a98ddfb6c644752f3df1a1960
  - id: m12
    resource: m12-plan.md
    title: M12 notification and document shell implementation
    git_blob: e947086c6edc179aed596beb54a16c5d88a80b09
generated: { by: codex/gpt-6, at: 2026-10-05T08:58:30Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T08:58:30Z }
---

Use [the roadmap](roadmap.md) for milestone order and [the milestone index](index.md) for completed history. The fixed 1.x baseline is b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6; its LGPL source and docs stay unchanged under v1/.

# Goal

Release a small Apache-2.0, TypeScript-source ESM framework that keeps CVC and authored HTML/CSS, retained Form rules, accessible unique-ID MDI, fast nested binding, and short reliable paths for coding agents.

# Checkpoint

- M0-M8 are complete; the [M8 report](m8-beta-report.md) contains migration and fixed agent-task evidence.
- M9 has a verified unpublished beta; [the report](m9-beta-report.md) preserves its exact artifact and historical harness. Release-candidate work, npm publication and release tags remain deferred until personal testing and the user's corresponding request.
- Selected [M10 slices](m10-plan.md) are complete: authored grouped/sticky Grid, offscreen record release, bounded initialPage and the full Grid demo. Column manipulation, bulk editing, multi-selection and virtualization remain unselected.
- [M11](m11-plan.md) is complete: authored Tree and DatePicker, two-layout CVC example, independent contract audit, and recovered full browser/package/document gates.
- Work stays on 2.0.0-alpha.0. master and v1/ are unchanged. The original untracked js lockfile was restored from the Sep 24 backup and remains outside this task.

- M12 implementation is complete: authored Notify and dynamic Documents, a private coordinator shared with static Tabs, and two application shell layouts using the same CVC editor in main content/documents/Popup. Final verification is recorded in [its plan](m12-plan.md).

# Next action

Personally test the [full Grid demo](../v2/grid-demo.md), [Tree/DatePicker screen](../v2/tree-date-example.md) and [application shell](../v2/shell-example.md). Record concrete defects as scoped fixes with matching regression/docs updates. Plan a release-candidate run when requested; do not publish to npm or create a release tag. No additional implementation milestone is active.

# Decisions

- mountPage owns per-instance controllers, cancellation, output and reverse-order cleanup. data-field and store-local RowId identify data; DOM IDs connect labels/ARIA only.
- Form/Grid/List/Tree share caller-owned Rows. Select/Pagination/DatePicker use controlled UI state. Retain framework-reachable rules; keep business logic in applications and no public utility package.
- Root 2.0 uses Apache-2.0; v1/ license, source and notices remain unchanged.
- Chromium, Firefox and WebKit are required. Use node_modules/.cache/playwright-m6 for Firefox if the default Windows cache fails. Installed Chrome/Edge verify the same package tarball; real macOS/iOS Safari is excluded.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-10-05 | Previous milestones | Immutable evidence and recovery details stay in the individual milestone plans and reports; no historical result was rerun or recertified by a document fingerprint refresh. |
| 2026-10-05 | M12 final gates | Build/types/example types and 81 unit tests passed; Chromium/Firefox/WebKit 167/167 each. Installed JS/TS and all five Windows browser consumers passed on the same 128-file tarball, SHA-256 ea0f8e2e5538d6a0f210ab3918d3141658a2370b9c7362b72512008af5266c32. Independent findings, raw logs, source hashes and context limits stay in the [M12 plan](m12-plan.md). |

# Open questions

- Accessibility automation covers tested states only. Personal review and manual assistive-technology checks remain open.
- Actual token use and equivalent 1.x task data remain unavailable. Prior measurements and M11 docs-first reads are context proxies.
- Registry publication and release tags are deferred regardless of local manifest eligibility or authentication.
