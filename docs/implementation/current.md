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
    git_blob: 4fd27c7d253edc1f489cb375c1ccaa05d92dfb05
generated: { by: codex/gpt-6, at: 2026-10-05T07:43:45Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T07:43:45Z }
---

Use [the roadmap](roadmap.md) for milestone order and [the milestone index](index.md) for completed history. The fixed 1.x baseline is b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6; its LGPL source and docs stay unchanged under v1/.

# Goal

Release a small Apache-2.0, TypeScript-source ESM framework that keeps CVC and authored HTML/CSS, retained Form rules, accessible unique-ID MDI, fast nested binding, and short reliable paths for coding agents.

# Checkpoint

- M0-M8 are complete; the [M8 report](m8-beta-report.md) contains migration and fixed agent-task evidence.
- M9 has a verified unpublished beta; [the report](m9-beta-report.md) preserves its exact artifact and historical harness. npm publication and release tags remain deferred until remaining features are complete, personally tested, and explicitly requested.
- Selected [M10 slices](m10-plan.md) are complete: authored grouped/sticky Grid, offscreen record release, bounded initialPage and the full Grid demo. Column manipulation, bulk editing, multi-selection and virtualization remain unselected.
- [M11](m11-plan.md) is complete: authored Tree and DatePicker, two-layout CVC example, independent contract audit, and recovered full browser/package/document gates. The recreated tarball has the same SHA-256 as the artifact tested before the temporary Vite initialization.
- Work stays on 2.0.0-alpha.0. master and v1/ are unchanged. The original untracked js lockfile was restored from the Sep 24 backup and remains outside this task.

# Next action

Prepare M12 notification/document-tab/application-shell scope on the same CVC runtime. Do not publish to npm or create a release tag. Manual assistive-technology review and personal product testing remain open.

# Decisions

- mountPage owns per-instance controllers, cancellation, output and reverse-order cleanup. data-field and store-local RowId identify data; DOM IDs connect labels/ARIA only.
- Form/Grid/List/Tree share caller-owned Rows. Select/Pagination/DatePicker use controlled UI state. Retain framework-reachable rules; keep business logic in applications and no public utility package.
- Root 2.0 uses Apache-2.0; v1/ license, source and notices remain unchanged.
- Chromium, Firefox and WebKit are required. Use node_modules/.cache/playwright-m6 for Firefox if the default Windows cache fails. Installed Chrome/Edge verify the same package tarball; real macOS/iOS Safari is excluded.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-10-05 | M11 implementation | Initial full suites passed 144 per engine; 81 unit tests, installed JS/TS and five-browser exact-tarball checks passed. [M11 evidence](m11-plan.md) distinguishes the initial deleted artifact from recovery checks. |
| 2026-10-05 | Workspace recovery | The user authorized removing temporary Vite work. Restored Git at 60352c3 and missing tracked files, retained final M11 source/tests, removed untracked Vite defaults, restored original dependency metadata and the prior untracked lockfile, then rebuilt/typechecked and passed 81 unit tests. |
| 2026-10-05 | Final recovered gates | Chromium/Firefox/WebKit 144/144 each, installed JS/TS and five-browser consumers passed on SHA-256 15d171e80c5d72e137205e88d469f0a3d538801ffedac7bad7dd0c42ff37c257. The package contains 113 files. Raw measurements, source hashes and scoped audit limits live in the M11 plan. |

# Open questions

- Accessibility automation covers tested states only. Personal review and manual assistive-technology checks remain open.
- Actual token use and equivalent 1.x task data remain unavailable. Prior measurements and M11 docs-first reads are context proxies.
- Registry publication and release tags are deferred regardless of local manifest eligibility or authentication.
