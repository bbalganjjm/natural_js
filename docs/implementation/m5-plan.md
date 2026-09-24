---
type: Plan
title: Natural-JS 2.0 M5 data and rule plan
description: Approved M5 implementation plan and verification for retained Form rules, row-keyed drafts, nested binding, and shared validation.
tags: [meta, plan, migration, form, validation]
status: draft
sources:
  - id: contract
    resource: m1-contract.md
    title: Approved M1 rule and binding contract
    git_blob: ac3e447352807f54773cb746b7d12acabd22602d
  - id: m4
    resource: m4-plan.md
    title: M4 pilot and exit evidence
    git_blob: 3bd2670785327638f8c678be54fc3b5cf1ffc9fe
  - id: form
    resource: ../../src/ui/form.ts
    title: Current Form pilot
    git_blob: e603f619679c24be778b04f45ea3c467b50bf2c2
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current Grid pilot
    git_blob: dedeca30ef8f10a78172748d8cb9911a68b7da03
  - id: legacy-data
    resource: ../../v1/src/natural.data.js
    title: Preserved 1.x formatter and validator implementation
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
  - id: legacy-ui
    resource: ../../v1/src/natural.ui.js
    title: Preserved 1.x Form, List, and Grid rule integration
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
generated: { by: codex/gpt-6-sol, at: 2026-09-24T13:52:47Z }
---

M5 completes the data, binding, and rule contract behind the M4 authored-HTML screen. The user approved M5 implementation on 2026-09-24 and requested an independent M4 recheck before changing the runtime.

# Goal

Retain the 1.x formatter and validator behavior that Form, List, and Grid can reach, but rewrite it as a small typed UI-owned implementation. Make raw values, display formatting, parsing, row-keyed invalid drafts, nested object paths, and validation of hidden rows consistent across Form and Grid, without importing legacy utility packages.

# Checkpoint

- At the M4 exit, the repository supplied working `bindForm` and `bindGrid` pilots, one private safe field-path helper, a two-layout screen, and nested row-local Select options. The pilots use application-supplied Form rules; Grid rejects `rules` explicitly and checks only Select availability.
- At the M4 exit, Form retained an invalid draft only for the bound row. Its example blocks navigation away from invalid input to avoid silent loss. M5 replaces that example guard with a framework-level row-keyed draft contract.
- M4 benchmark evidence and its same-host M6 regression budgets are recorded in [the M4 plan](m4-plan.md). The 1.x source under `v1/` stays unchanged and excluded from the 2.0 package.
- The [M1 contract](m1-contract.md) fixes the retained rule names and public `RuleSet`, `ParseInput`, `ValidationIssue`, `FormHandle`, and `GridHandle` shapes. The 1.x runtime and declarations also reach each combined validator through its underscore name as well as the `+` spelling; both spellings remain in scope.

# Steps

| Step | Work | Evidence |
|---|---|---|
| 1. Rule inventory | Trace every 1.x Form/List/Grid declarative rule name and its transitive mask/date/byte-count work. Separate intended behavior from known 1.x bugs and confirm the complete retained catalog in M1. | Code-backed table: name, arguments, output/issue, transitive operation, source, and 2.0 owner. No Form-reachable rule is dropped because static calls are absent. |
| 2. Private rule runner | Refine the M4 Form JSON parser into one UI-owned parser/dispatcher for case-insensitive and combined names, application overrides, messages, and short errors. Put a helper beside the rule that needs it; share only semantics both Form and Grid actually use. | Form and Grid invoke the same runner; both `+` and underscore combined names resolve. No public generic formatter/validator utility or mutable global registry appears in the tarball. |
| 3. Raw/display/parse | Complete the M4 raw/display/parse pilot across retained rules: keep stored JSON raw; apply `data-format` to display only; focus restores raw input; parse a candidate before validation and write. A parse/rule failure leaves a visible draft and never corrupts `Rows`. | Number, date, mask, string, and user-rule examples show raw payloads independent of display text. |
| 4. Row-keyed drafts | Add minimal typed Rows mutation events so a clean-row `revert(id)` can discard its draft without a public Form reset method. Store invalid input by `RowId` and field path, not by current DOM control. Switching, sorting, or filtering retains drafts; `validate(id)` reports issues for an unrendered row without rebinding. `replace`, revert, delete, and dispose release the right drafts. | Two edited rows keep independent drafts; hidden invalid rows block save and can be revealed/focused without changing another draft. Existing no-argument subscribers still work, and all live subscribers receive a mutation even if one callback throws. |
| 5. Nested data | Reuse safe parsed object paths and top-level `Rows.set` replacement. Preserve row-local Select raw scalar mapping, unavailable-option issues, and atomic nested-array replacement/revert; avoid arbitrary array-index paths. | Exact `a: [{ aa: 11, bb: 22 }, {}]` fixture, nested Form fields, same-value type distinction, sort/filter identity, and dual-page ID cleanliness pass. |
| 6. Rule catalog | Rewrite retained 1.x formatter, validator, and combined validator names in small cohorts with argument checks. Correct documented 1.x defects such as `equalTo` lookup while recording behavioral changes in the migration guide. Keep only mask/date/byte operations those rules require. | Each retained name has representative valid, invalid, malformed-argument, and user-override checks where risk warrants them; no 1.x implementation is copied unchanged. |
| 7. Integration and docs | Enable Grid `rules` after it actually runs, align Form/Grid results and ARIA error output, and update the M4 screen to use the finished contract. Update JS/TS installed consumers, OKF concepts/index/log/fingerprints, and the active checkpoint in the same work. | Build, typecheck, focused tests, installed consumers, Chromium/WebKit browser flows, changed/full OKF checks, and a package-surface audit pass. Record Firefox host limitations rather than claiming a pass. |
| 8. Cost review | Rerun the fixed M4 benchmark on the same host/browser and the agent feature-change task after the rule/draft rewrite. Investigate any M6 budget overrun before enlarging the UI catalog. | Median times, DOM count, memory caveat, changed files, and task-context measurements are attached to the M5 result. |

# Next action

M5's approved scope and verification are complete. The user subsequently approved [M6](m6-plan.md), which extended these Form/Grid components while keeping the retained rule catalog and drafts inside UI.

# Decisions

- Preserve all Form-reachable formatter, validator, combined-rule, and transitive behavior as the migration baseline. Modern browser APIs replace unnecessary helpers only when the framework-visible behavior is retained.
- Keep `data-format` display-only and `data-validate` candidate-oriented; domain rules remain application functions in `RuleSet`.
- Keep the path helper private inside UI. Do not export a path, mask, format, date, or validation utility package.
- Prefer one direct runner and ordinary objects over a registration engine, deep type gymnastics, and repeated assertions. Parse descriptors once per authored template, update only affected controls, and preserve native HTML semantics.
- Treat M4's invalid-row navigation guard and `GRID_RULES` error as pilot boundaries to remove only when the full M5 behavior and tests are present. Do not pre-export types for M7 containers while completing the M5 public surface.
- Keep 1.x LGPL files unchanged under `v1/`; newly written 2.0 files use Apache-2.0. Do not switch Git `master` or publish to npm as part of M5.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Planning | Drafted from the approved M1 contract, M4 pilot behavior, and preserved 1.x rule implementation; no M5 code was written. |
| 2026-09-24 | Same-host M5 benchmark | Five measured Chromium runs after two warm-ups on the same i7-9700F/Chromium 153 fixture: 1,000-row flat initial/rebind 12.9/14.8 ms (M4 11.9/13.8), nested automatic 37.6/44.8 ms (M4 40.4/44.2). Flat edit/sort/filter 0.7/2.9/1.9 ms and nested 1.6/9.6/6.3 ms all meet the recorded M6 budgets. See [raw data](evidence/m5-binding-chromium.json); instantaneous heap readings remain diagnostic. |
| 2026-09-24 | Final implementation checks | Build, typecheck, Vitest 79/79, Chromium/WebKit browser 102/102, direct example TypeScript check, and installed JS/TS consumers passed. The final tarball has 63 files/86,228 bytes and excludes 1.x, jQuery, docs, examples, and convenience utility bundles. |
| 2026-09-24 | Approval and M4 recheck | The user approved M5 and requested a prior-milestone recheck. The unchanged M4 baseline passed build, typecheck, Vitest 29/29, Chromium/WebKit employee-screen 36/36, and full OKF 0 errors/0 warnings. Read-only audits found a fetched-HTML integration test gap and an unused future PopupHandle type; both were addressed within the approved M5 scope. |
| 2026-09-24 | Agent-cost check | Two isolated docs-first agents added the same optional nested employee field. Both passed Chromium 19/19 first time and changed nine files without code retries. Before the source map: 23 fully read files/117,294 bytes plus 6,890 bytes of partial rereads, about 7-8 minutes. After the map: 17 unique files, ten fully read/41,590 bytes and seven partially viewed/about 36,751 output bytes on a replay, about 6m27s. Content output was roughly 77-78 KB before about 17 KB of diff review. The replay and first run used different counting methods, so no precise total byte or token saving is claimed. M4's earlier task used 15 files/53,364 bytes and took about 4m05s, with a different field and setup. |
| 2026-09-24 | Final documentation | Changed and full OKF checks passed with 0 errors and 0 warnings; the separate M6 review plan and its source fingerprints are current. |

# Open questions

- Independent source review prompted fixes for Form stale errors and visible/hidden length consistency, Grid cross-field Select drafts, checkbox state, unsupported input controls, and stale errors; the final code/browser gate passed.
- The same-host M5 rerun stayed within every M6 reference budget; repeat the fixed fixture after major M6 Grid changes. Browser heap readings remain diagnostic without controlled collection.
- At the M5 gate, the older Firefox Playwright cache failed before page load (`browserType.launch: spawn UNKNOWN`). A fresh Playwright Firefox build later passed the full M6 browser suite on this host; see [M6](m6-plan.md).