---
type: Plan
title: Natural-JS 2.0 active plan
description: Checkpoint, next action, and verification record for the milestone-gated Natural-JS 2.0 migration.
tags: [meta, plan, migration]
sources:
  - id: interactions
    resource: m10-interactions-plan.md
    title: M10.9.6.2 explicit interaction and authored view controls
    git_blob: eb9309843c9b6d29ef7e4cd6da9bb56557492b14
  - id: closure
    resource: m10-closure-plan.md
    title: Required Grid semantic continuation
    git_blob: 71dd27824a5726744f4dd0452c3155558dabe26b
  - id: change-state
    resource: m10-change-state-plan.md
    title: M10.9.6.1 committed-field changes and retained deletions
    git_blob: f1e48cf1457df86d2d799fa1de7168da557d58bc
  - id: conventions
    resource: ../governance/okf-conventions.md
    title: OKF conventions for the Natural-JS bundle
    git_blob: 17cfe650daacff3935aa93a383868574afe95628
  - id: m11
    resource: m11-plan.md
    title: M11 implementation and verification
    git_blob: d222f817e0192f16f0b2f3315b04951e72b8bb94
  - id: m12
    resource: m12-plan.md
    title: M12 notification and document shell implementation
    git_blob: 645640ce487f3d7830803a7698ddbdda8f3d4953
  - id: parity
    resource: feature-parity-plan.md
    title: Required feature completion and consolidated omission review
    git_blob: 4257da35d31c0303b536cc02c1e9131d0dd8edfa
  - id: columns
    resource: m10-columns-plan.md
    title: Implemented column state and final verification
    git_blob: 6f134d83c14a8b8135b9cd180a5322dd67044177
  - id: selection
    resource: m10-selection-plan.md
    title: M10.6 independent selection, checks and filters
    git_blob: c7e96dcfd26a0612856b41dd3c04c41b09800500
  - id: paste
    resource: m10-paste-plan.md
    title: M10.7 atomic paste and final verification
    git_blob: 5674e103e6e093e507251d20db1b3f81917602d5
  - id: viewport
    resource: m10-viewport-plan.md
    title: M10.8 measured viewport and final verification
    git_blob: 9cfb4ae2c9917a713fff43c202a51993f316e758
  - id: grid-parity
    resource: m10-parity-plan.md
    title: M10.9 ordered Rows and remaining Grid continuation
    git_blob: 03c34062aa9fed9d5fa461657c8a2487f0b489d2
  - id: controls
    resource: m10-controls-plan.md
    title: M10.9.3 native controls, display and validation gates
    git_blob: 42e2041882d710df72cbb959a8a2229c0a311d8f
  - id: lifecycle
    resource: m10-lifecycle-plan.md
    title: M10.9.4 status and row lifecycle verification
    git_blob: 13bfdbc7cdf22204e35368bafd97e98174a44aab
  - id: detail
    resource: m10-detail-plan.md
    title: M10.9.5 detail navigation and geometry verification
    git_blob: 62c7a18a89b135d2b7a1ee9fe486f937c6c21c18
generated: { by: codex/gpt-6, at: 2026-10-24T11:11:24Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-24T11:11:24Z }
---

Use [the roadmap](roadmap.md) for milestone order and [the milestone index](index.md) for completed history. The fixed 1.x baseline is b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6; its LGPL source and docs stay unchanged under v1/.

# Goal

Complete all 1.x framework capabilities and the required advanced Grid features in a small Apache-2.0, TypeScript-source ESM framework. Keep CVC, authored HTML/CSS, retained Form rules, accessible unique-ID MDI, fast nested binding, consistent contracts and short reliable paths for coding agents. Only explicitly approved omissions may reduce user-facing feature coverage.

# Checkpoint

- M0-M8 are complete; the [M8 report](m8-beta-report.md) contains migration and fixed agent-task evidence.
- M9 has a verified unpublished beta; [the report](m9-beta-report.md) preserves its exact artifact and historical harness. Release-candidate work, npm publication and release tags remain deferred until personal testing and the user's corresponding request.
- Selected [M10 slices](m10-plan.md) are complete: authored grouped/sticky Grid, offscreen record release, bounded initialPage and the current Grid demo. M10.5 implements resize/reorder/show/hide; M10.6 implements independent selection/check sets, authored header sort/filters and current-identity row actions. M10.7 implements atomic validated paste with one Rows batch and retained nested raw values/drafts. M10.8 adds measured variable-height viewport rendering, one attached focused editor, reveal and offscreen logical-page paste/checks. Their detailed plans preserve final gates; remaining Grid parity is mandatory.[^paste][^viewport]
- The selected [M11](m11-plan.md) scope is complete: authored Tree and DatePicker, two-layout CVC example, independent contract audit, and recovered full browser/package/document gates. Remaining 1.x Tree/calendar behavior is required by the new parity plan.
- Work stays on 2.0.0-alpha.0. master and v1/ are unchanged. The original untracked js lockfile was restored from the Sep 24 backup and remains outside this task.

- Selected M12 implementation is complete: authored Notify and dynamic Documents, a private coordinator shared with static Tabs, and two application shell layouts using the same CVC editor in main content/documents/Popup. Final verification is recorded in [its plan](m12-plan.md); remaining legacy shell behavior is not yet complete.
- Active work is [full feature completion](feature-parity-plan.md). The [coverage ledger](feature-parity.md) records 60 behavior families and all 775 checklist entries mapped to owners and acceptance obligations. Structural coverage is independently checked; semantic closure of options and 53 identified dynamic path groups, plus the consolidated omission proposal, remain open. No new user-facing omission is approved.[^parity]

- [M10.5 column state](m10-columns-plan.md) is implemented and tested: immutable full state, native grouped topology, authored pointer/keyboard resize, preserved field nodes/drafts/selection, independent layouts and restoration. Width-only changes skip row/topology work. Final evidence stays in the stage plan.[^columns]

# Next action

Specify M10.9.6.3 progressive rendering/completion under the [parent](m10-closure-plan.md): already-loaded prefix growth, yielding, per-chunk first/last completion and cancellation through existing Grid/CVC ownership. [M10.9.6.2](m10-interactions-plan.md) implements explicit native toggles, zero-count choices and Apply/Enter, authored chooser/recovery and action-scroll recipes; all sixteen frozen runtime gates pass. Its plan records completed independent source/API/archive/evidence/document review. Keep the complete 89-entry/17-group 7a36a39 audit immutable and all twenty families open until their full obligations close. Semantic acceptance (.4), other component/CVC parity, P0 and mandatory [M13 whole-code review/remediation](m13-review-plan.md) remain required. No npm publication or release tag.[^interactions][^closure][^parity]

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
| 2026-10-05 | Required scope correction | Full 1.x coverage and the required Grid capabilities precede release work; existing selected-scope evidence is retained. |
| 2026-10-05 | M10.5 final gates | Build/types/browser-controller types and 81 units pass; 182/182 tests in each required engine. JS/TS and all five Windows browser consumers pass the exact 133-file tarball SHA-256 0a43e4e97e295e1d7ee1ab3188008c613cf9607327970f93c5beda4b461c7f2e. Original binding budgets pass; column measurements, independent findings and limits stay in the stage plan. |
| 2026-10-18 | M10.6 final gates | Build/types/browser-controller types, 81 units and 199/199 full tests in each engine pass. JS/TS and five Windows browser consumers pass the exact 143-file tarball SHA-256 d5dbc96d5916a44b517e32af04693cf1d6f0efd1f99cdece9b8a4b0fe8fbefa9. Original binding budgets pass. Source/command hashes, independent corrections and scope limits stay in the M10.6 plan. |
| 2026-10-18 | M10.7 final gates | Build/types/browser-controller types, 92 units and 219/219 full tests in each engine pass. JS/TS and five Windows browsers pass the exact 148-file artifact SHA-256 c01c3c2ea819aee418154b69534f5eb053f315fca1471b4b7857299b11bb3e0d. Binding budgets pass; independent findings, retained failed attempts and limits stay in the stage plan. |
| 2026-10-18 | M10.8 final gates | Build/types/browser-controller types, 95 units and 242/242 full tests in each engine pass. Installed JS/TS and five Windows browsers pass the same 153-file artifact SHA-256 487285dc347b4d763391bd2101a6dab8faee6ee313fc5162b138dbe44ecdae69. The 5,000-row viewport fixtures mount at most 14 rows and pass declared timing/ownership budgets; original binding budgets pass. Independent corrections, raw logs and measured limits stay in the [stage plan](m10-viewport-plan.md). |
| 2026-10-20 | M10.9.1 final gates | Ordered add/move/independent copy and shared UI integration pass build/types, 102 units and 250/250 full tests per engine. JS/TS and five installed Windows browsers pass one 153-file artifact SHA-256 cdc1a545dcbf1dc9bbf149d3012acad01a3d4fdddb90f1a7f054a67cc064493e; original binding/viewport budgets and the new 5,000-row move budget pass. Exact evidence and baseline newline limits stay in [the stage plan](m10-parity-plan.md). |
| 2026-10-20 | M10.9.2 final gates | Authored multi-tr records and hierarchical native merging pass build/types, 104 units and 270/270 full tests per engine. JS/TS and five installed Windows browsers pass one 158-file artifact SHA-256 10fb7f8ea71ee36c798c015ca179ef47962ff815a870394ddcd96e51b6f7488e. All existing budgets and the new 5,000-record/two-tr budgets pass, with at most 24 physical rows. Changed/full docs: 55 concepts, five reserved files, zero errors/warnings. Exact evidence, independent findings and the isolated benchmark fixture correction stay in [the stage plan](m10-row-blocks-plan.md). |
| 2026-10-20 | M10.9.3 frozen runtime gates | Native groups, typed arrays, exclusive checks, validation timing/reveal and explicit display pass build/strict source/example types, 105 units and 313/313 full tests per engine. JS/TS and all five Windows browsers pass the same 168-file artifact SHA-256 cfe710f0d644d95505f63d81e2a36e2fff6b17a64c50be6bb0d45f8653225831. Sixteen final gates share 155 input fingerprints; all binding/viewport budgets pass. Independent corrections, provisional attempts and limits stay in [the stage plan](m10-controls-plan.md). |
| 2026-10-21 | M10.9.3 final closure | Independent source/API/plan/archive/evidence reviews approve the slice. Changed/full OKF checks pass with 57 concepts, five reserved files and zero errors/warnings. Fourteen reviewed concepts receive verified metadata; twelve historical concepts preserve bodies and generated/verified dates while fingerprints refresh. M10.9.4 is next; the required M13 whole-code review/remediation remains future work. |
| 2026-10-24 | M10.9.4 frozen gates | Status views/protected tombstones, native defaults, owned row callbacks, refresh, clean append and authored empty markup pass build/strict source/example types, 120 units and 347/347 full cases per required engine. JS/TS and all five Windows browsers pass the same 173-file artifact SHA-256 db2e2769332fbdab6c12ef5a3a655f58d704c3fa7a7dd5b625de7c9a985f80ea. Sixteen final gates match 158 source/configuration files plus two separately preserved cache metadata inputs. All binding/viewport/append budgets pass; 33 raw command records retain provisional runs and the pre-initialization Chromium network-buffer failure separately. Exact evidence stays in [the lifecycle plan](m10-lifecycle-plan.md). |
| 2026-10-24 | M10.9.4 final closure | Independent source/API/plan/archive/evidence review approves the slice. Changed/full OKF checks pass with 58 concepts, five reserved files and zero errors/warnings. Twelve reviewed concepts receive verified metadata; twenty-one historical concepts preserve bodies and generated/verified dates while fingerprints refresh. M10.9.5 detail/geometry is next. P0 obligations, remaining parity and M13 remain required; no npm publication or release tag. |
| 2026-10-24 | M10.9.5 frozen gates | Immutable row scopes, aligned reveal, authored height controls and validated CVC details pass build/strict source/example types, 120 units and 382/382 full cases in each required engine. Installed JS/TS and all five Windows browsers pass the same 178-file artifact SHA-256 8543ba57452aa6720fbb49765220f075ff713cd65a347dffe75159ec584fda8d. Sixteen final gates match 162 inputs; 23 raw command records retain seven provisional runs; three development logs are preserved separately. All unchanged binding/viewport budgets pass. Independent source/API/plan/archive/evidence review approves the slice; exact measurements and corrections stay in [the detail plan](m10-detail-plan.md). |
| 2026-10-24 | M10.9.5 final closure | Independent source/API/plan/evidence/document review approves the slice. Changed/full OKF checks pass with 59 concepts, five reserved files and zero errors/warnings. Ten reviewed concepts receive verified metadata; twenty historical concepts preserve bodies and generated/verified dates while fingerprints refresh. M10.9.6 legacy semantic closure is next. Other parity, P0 and M13 remain required; no npm publication or release tag. |

| 2026-10-24 | M10.9.6.1 frozen gates | Immutable loaded originals, exact committed-field markers and retained edited deletion display pass build/strict source/example types, 124 units and 402/402 full cases in each required engine. Installed JS/TS and all five Windows browsers pass one 183-file artifact SHA-256 27bcaca82b1d55b8be2b4f792f76c611eea0139254df2a19f16d57a36948da3a. Sixteen final gates match 164 inputs; six focused development attempts and two independent raw development logs stay separate. All original binding/viewport budgets pass; exact logs, measured limits and continuation boundaries stay in [the change-state plan](m10-change-state-plan.md). |

| 2026-10-24 | M10.9.6.1 final closure | Independent source/API/plan/archive/evidence review approves the selected slice. Changed/full OKF checks pass with 61 concepts, five reserved files and zero errors/warnings. Thirteen reviewed concepts receive verified metadata; fifteen historical concepts preserve bodies and generated/verified dates with fingerprint-only updates. M10.9.6.2 interaction/view controls is next. The parent, remaining parity, P0 and M13 remain required; no omission, npm publication or release tag. |

| 2026-10-24 | M10.9.6.2 frozen gates | Explicit selection toggles, applied search/zero-count choices and authored recovery/action-scroll compositions pass build/strict source/example types, 124 units and 448/448 full cases per engine. JS/TS and five Windows browsers pass one 183-file artifact SHA-256 9beeca3a827f1efde3c5d01911b125a2d1d4d142b186689a01df06de5377df6b. Sixteen final gates share 167 inputs; twelve development records stay separate. Original binding/viewport budgets pass with sixty recomputed medians. Exact evidence and limits belong to [the interaction plan](m10-interactions-plan.md); .3/.4, other parity, P0 and M13 remain required. |

| 2026-10-24 | M10.9.6.2 final closure | Independent source/API/plan/archive/evidence review approves the selected slice. Changed/full OKF checks pass with 62 concepts, five reserved files and zero errors/warnings. Eleven reviewed concepts receive verified metadata; thirteen historical concepts preserve bodies and generated/verified dates with fingerprint-only updates. M10.9.6.3 progressive rendering/completion is next. .4, remaining parity, P0 and M13 stay required; no omission, npm publication or release tag. |

# Open questions

- Accessibility automation covers tested states only. Personal review and manual assistive-technology checks remain open.
- Actual token use and equivalent 1.x task data remain unavailable. Prior measurements and M11 docs-first reads are context proxies.
- Registry publication and release tags are deferred regardless of local manifest eligibility or authentication.
- P0's semantic/dynamic closure and the one omission decision are pending. Remaining parity contracts require their detailed stage review; implemented selected-scope contracts do not prove full legacy coverage.

[^columns]: Implemented column state and final verification
[^selection]: M10.6 independent selection, checks and filters
[^paste]: M10.7 atomic paste and final verification
[^parity]: Required feature completion and consolidated omission review

[^viewport]: M10.8 measured viewport and final verification
[^grid-parity]: M10.9 ordered Rows and remaining Grid continuation
[^controls]: M10.9.3 native controls, display and validation gates
[^lifecycle]: M10.9.4 status and row lifecycle verification
[^detail]: M10.9.5 detail navigation and geometry verification

[^change-state]: M10.9.6.1 committed-field changes and retained deletions
[^closure]: Required Grid semantic continuation

[^interactions]: M10.9.6.2 explicit interaction and authored view controls
