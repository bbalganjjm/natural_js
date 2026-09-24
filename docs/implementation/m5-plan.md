---
type: Plan
title: Natural-JS 2.0 M5 data and rule plan
description: Review plan for retained Form rules, row-keyed drafts, nested binding, and shared validation contracts.
tags: [meta, plan, migration, form, validation]
status: draft
sources:
  - id: contract
    resource: m1-contract.md
    title: Approved M1 rule and binding contract
    git_blob: f08f99ca449b6c53f81beb42f6d4d55d3d68e72f
  - id: m4
    resource: m4-plan.md
    title: M4 pilot and exit evidence
    git_blob: 014324e32a0b05fb6d09b2850c2134e8918a769f
  - id: form
    resource: ../../src/ui/form.ts
    title: Current Form pilot
    git_blob: 6a240838751510926bb37363b48145d4358fdb41
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current Grid pilot
    git_blob: 387645f6294f0dc01a077a5c695163c388b32784
  - id: legacy-data
    resource: ../../v1/src/natural.data.js
    title: Preserved 1.x formatter and validator implementation
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
  - id: legacy-ui
    resource: ../../v1/src/natural.ui.js
    title: Preserved 1.x Form, List, and Grid rule integration
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
generated: { by: codex/gpt-6-sol, at: 2026-09-24T10:12:21Z }
---

M5 completes the data, binding, and rule contract behind the M4 authored-HTML screen. This is a proposal for separate review; drafting it does not authorize M5 implementation.

# Goal

Retain the 1.x formatter and validator behavior that Form, List, and Grid can reach, but rewrite it as a small typed UI-owned implementation. Make raw values, display formatting, parsing, row-keyed invalid drafts, nested object paths, and validation of hidden rows consistent across Form and Grid, without importing legacy utility packages.

# Checkpoint

- M4 supplies working `bindForm` and `bindGrid` pilots, one private safe field-path helper, a two-layout screen, and nested row-local Select options. The pilots use application-supplied Form rules; Grid rejects `rules` explicitly and checks only Select availability.
- M4 Form currently retains an invalid draft only for the bound row. Its example blocks navigation away from invalid input to avoid silent loss. M5 replaces that example guard with a framework-level row-keyed draft contract.
- M4 benchmark evidence and its same-host M6 regression budgets are recorded in [the M4 plan](m4-plan.md). The 1.x source under `v1/` stays unchanged and excluded from the 2.0 package.
- The [M1 contract](m1-contract.md) fixes the retained rule names and public `RuleSet`, `ParseInput`, `ValidationIssue`, `FormHandle`, and `GridHandle` shapes.

# Steps

| Step | Work | Evidence |
|---|---|---|
| 1. Rule inventory | Trace every 1.x Form/List/Grid declarative rule name and its transitive mask/date/byte-count work. Separate intended behavior from known 1.x bugs and confirm the complete retained catalog in M1. | Code-backed table: name, arguments, output/issue, transitive operation, source, and 2.0 owner. No Form-reachable rule is dropped because static calls are absent. |
| 2. Private rule runner | Refine the M4 Form JSON parser into one UI-owned parser/dispatcher for case-insensitive and combined names, application overrides, messages, and short errors. Put a helper beside the rule that needs it; share only semantics both Form and Grid actually use. | Form and Grid invoke the same runner. No public generic formatter/validator utility or mutable global registry appears in the tarball. |
| 3. Raw/display/parse | Complete the M4 raw/display/parse pilot across retained rules: keep stored JSON raw; apply `data-format` to display only; focus restores raw input; parse a candidate before validation and write. A parse/rule failure leaves a visible draft and never corrupts `Rows`. | Number, date, mask, string, and user-rule examples show raw payloads independent of display text. |
| 4. Row-keyed drafts | Store invalid input by `RowId` and field path, not by current DOM control. Switching, sorting, or filtering retains drafts; `validate(id)` reports issues for an unrendered row without rebinding. `replace`, revert, delete, and dispose release the right drafts. | Two edited rows keep independent drafts; hidden invalid rows block save and can be revealed/focused without changing another draft. |
| 5. Nested data | Reuse safe parsed object paths and top-level `Rows.set` replacement. Preserve row-local Select raw scalar mapping, unavailable-option issues, and atomic nested-array replacement/revert; avoid arbitrary array-index paths. | Exact `a: [{ aa: 11, bb: 22 }, {}]` fixture, nested Form fields, same-value type distinction, sort/filter identity, and dual-page ID cleanliness pass. |
| 6. Rule catalog | Rewrite retained 1.x formatter, validator, and combined validator names in small cohorts with argument checks. Correct documented 1.x defects such as `equalTo` lookup while recording behavioral changes in the migration guide. Keep only mask/date/byte operations those rules require. | Each retained name has representative valid, invalid, malformed-argument, and user-override checks where risk warrants them; no 1.x implementation is copied unchanged. |
| 7. Integration and docs | Enable Grid `rules` after it actually runs, align Form/Grid results and ARIA error output, and update the M4 screen to use the finished contract. Update JS/TS installed consumers, OKF concepts/index/log/fingerprints, and the active checkpoint in the same work. | Build, typecheck, focused tests, installed consumers, Chromium/WebKit browser flows, changed/full OKF checks, and a package-surface audit pass. Record Firefox host limitations rather than claiming a pass. |
| 8. Cost review | Rerun the fixed M4 benchmark on the same host/browser and the agent feature-change task after the rule/draft rewrite. Investigate any M6 budget overrun before enlarging the UI catalog. | Median times, DOM count, memory caveat, changed files, and task-context measurements are attached to the M5 result. |

# Next action

Review the M4 result and this detailed M5 scope with the user. Start M5 only after explicit separate approval; if M4 structure, nested automatic binding, or accessibility needs correction, resolve that before rule-catalog expansion.

# Decisions

- Preserve all Form-reachable formatter, validator, combined-rule, and transitive behavior as the migration baseline. Modern browser APIs replace unnecessary helpers only when the framework-visible behavior is retained.
- Keep `data-format` display-only and `data-validate` candidate-oriented; domain rules remain application functions in `RuleSet`.
- Keep the path helper private inside UI. Do not export a path, mask, format, date, or validation utility package.
- Prefer one direct runner and ordinary objects over a registration engine, deep type gymnastics, and repeated assertions. Parse descriptors once per authored template, update only affected controls, and preserve native HTML semantics.
- Treat M4's invalid-row navigation guard and `GRID_RULES` error as pilot boundaries to remove only when the full M5 behavior and tests are present.
- Keep 1.x LGPL files unchanged under `v1/`; newly written 2.0 files use Apache-2.0. Do not switch Git `master` or publish to npm as part of M5.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Planning | Drafted from the approved M1 contract, M4 pilot behavior, and preserved 1.x rule implementation; no M5 code was written. |

# Open questions

- Confirm the exact 1.x argument edge cases and message-language fallback from source before writing individual rule cohorts.
- Decide whether any built-in rule's old behavior was an intentional public contract or a defect requiring an explicit migration note.
- Set final M5 performance acceptance against the measured M4 baseline after the same-browser rerun; browser heap readings are diagnostic only without controlled collection.