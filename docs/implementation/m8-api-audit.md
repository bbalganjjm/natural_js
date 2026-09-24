---
type: Specification
title: Natural-JS 2.0 M8 public API and Form rule audit
description: Complete public export inventory, retained rule reachability, and review boundary for M8 pruning.
tags: [meta, audit, migration]
status: draft
sources:
  - id: package
    resource: ../../package.json
    title: Public package entry map
    git_blob: 148dfc8e866559ae2859b5130afabafdaa1c0af3
  - id: root
    resource: ../../src/index.ts
    title: Root public export
    git_blob: d99a783055cf6bea9b6e15ca591c370ff514cec9
  - id: page
    resource: ../../src/page/index.ts
    title: Page public exports and runtime
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: data
    resource: ../../src/data/index.ts
    title: Data public exports and runtime
    git_blob: 10c07414eacccc414b81afc8be5661dd21afe3c6
  - id: ui
    resource: ../../src/ui/index.ts
    title: UI public exports and types
    git_blob: fb7b7ba6e42f7c8fc818ca514bdaf55647e1cf80
  - id: comm
    resource: ../../src/comm/index.ts
    title: Communication public exports and runtime
    git_blob: f3650ddbfeb5d87c3e58dc84904df9704e994368
  - id: form
    resource: ../../src/ui/form.ts
    title: Form rule use
    git_blob: e603f619679c24be778b04f45ea3c467b50bf2c2
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid rule use
    git_blob: dedeca30ef8f10a78172748d8cb9911a68b7da03
  - id: list
    resource: ../../src/ui/list.ts
    title: List rule use
    git_blob: 8d3ef3e1ff3e7b7fb7faed27fc592846dd5fe090
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Declarative rule compilation and dispatch
    git_blob: 967142342d060056cd3f124db29f6893a2875d48
  - id: formats
    resource: ../../src/ui/format-rules.ts
    title: Retained format catalog and internal helpers
    git_blob: a3ec42f7837c785a5f3fa3688283c13117b528a1
  - id: validators
    resource: ../../src/ui/validate-rules.ts
    title: Retained validator catalog and internal helpers
    git_blob: 4f1439b6e09b066bea1afd26d16b34471d9f4d18
  - id: popup
    resource: ../../src/ui/popup.ts
    title: Popup page ownership and result handle
    git_blob: ac1f9cf3fba4445084943cc877674ffb4ffc0eef
  - id: tabs
    resource: ../../src/ui/tabs.ts
    title: Tabs page ownership and handle
    git_blob: 4bbd8b9a3b0280ed1ab2c59683bcc5597d7d6920
  - id: legacy-data
    resource: ../../v1/src/natural.data.js
    title: Preserved 1.x dynamic rule use
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
  - id: legacy-core
    resource: ../../v1/src/natural.core.js
    title: Preserved 1.x utility implementations
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
generated: { by: codex/gpt-6-sol, at: 2026-09-24T17:56:35Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T18:03:18Z }
---

This read-only audit covers the five `package.json` entry paths at post-M7 commit `f659f1d8`. Keep every framework-reachable Form rule; treat a public deletion or semantic change as a separate user decision.[^package][^rules]

# Public inventory

The source entries and generated `build/**/index.{js,d.ts}` expose 11 runtime values and 35 types. The [installed JavaScript and TypeScript consumers](../../tests/consumers/ts/check.ts) import every runtime value; the [M4 employee screen](../../examples/vite/m4/employees.ts) and [M7 MDI screen](../../examples/vite/m7/main.ts) provide actual component call paths.[^package][^root][^page][^data][^ui][^comm]

| Entry | Runtime values | Type exports | Framework responsibility and user call path | Decision |
|---|---|---|---|---|
| `.` | `FrameworkError` | — | Shared coded failures; the [application entry](../../examples/vite/main.ts) constructs it. | Keep. |
| `./page` | `mountPage` | `PageContext`, `PageController`, `PageDefinition`, `PageHandle` | One CVC lifecycle for main, Popup, and Tabs; M4/M7 controllers call `mountPage`. | Keep all. |
| `./data` | `createRows` | `RowId`, `Snapshot`, `RowStatus`, `RowSnapshot`, `RowChange`, `RowsEvent`, `Rows` | Shared row identity, immutable values, subscriptions, and changed-row saves; M4/M7 controllers call `createRows`. | Keep all. |
| `./comm` | `createCommunicator` | `RequestOptions`, `Communicator` | Explicit requests, response decoding, and cancellation; M4 controller calls `createCommunicator`. | Keep all. |
| `./ui` | `bindForm`, `bindGrid`, `bindList`, `bindSelect`, `bindPagination`, `openPopup`, `bindTabs` | `Rule`, `RuleContext`, `FormatRule`, `ValidateRule`, `ParseInput`, `RuleSet`, `ValidationIssue`, `ValidationResult`, `PageRequest`, `PageInput`, `PageState`, `SelectValue`, `SelectChoice`, `SelectSelection`, `SelectHandle`, `PaginationHandle`, `FormHandle`, `SortIndicator`, `ListHandle`, `GridHandle`, `PopupHandle`, `TabHandle` | M4 screen calls the five data-UI binders; M7 screen calls Popup/Tabs. Types describe callbacks, choices, paging, and handles. | Keep seven values and 21 types; review `Rule` separately. |

`openPopup` and `bindTabs` own pages created through the same page runtime; neither duplicates CVC loading. No runtime export or private split has a supported removal case from this audit.[^popup][^tabs][^page]

# Rule reachability

For each binder, authored `data-format` and `data-validate` JSON lists reach `createRuleRunner`: parse name and arguments, normalize case and combined `+`/`_` spellings, select component override or built-in, validate built-in arguments, then call the formatter or validator. Form, Grid, and List compile these declarations and call the shared runner during rendering or validation. Select controls can have validators but reject display formatting; List fields remain read-only. A missing static import for one rule name is therefore not evidence of dead behavior.[^rules][^form][^grid][^list]

| Retained family | Exact authored names | Internal support and focused regression |
|---|---|---|
| 23 formatters | `commas`, `rrn`, `ssn`, `kbrn`, `kcn`, `upper`, `lower`, `capitalize`, `zipcode`, `phone`, `realnum`, `trimtoempty`, `trimtozero`, `trimtoval`, `date`, `time`, `limit`, `replace`, `lpad`, `rpad`, `mask`, `generic`, `numeric` | `builtinFormats` and argument checks; [format catalog tests](../../tests/format-rules.test.ts). |
| 35 validators | `required`, `alphabet`, `integer`, `korean`, `number`, `decimal`, `phone`, `email`, `url`, `zipcode`, `rrn`, `ssn`, `frn`, `frn_rrn`, `kbrn`, `kcn`, `date`, `time`, `accept`, `notAccept`, `match`, `notMatch`, `acceptFileExt`, `notAcceptFileExt`, `equalTo`, `maxlength`, `minlength`, `rangelength`, `maxbyte`, `minbyte`, `rangebyte`, `maxvalue`, `minvalue`, `rangevalue`, `regexp` | `builtinValidators`, argument checks, English/Korean messages; [validator catalog tests](../../tests/validate-rules.test.ts). Camel-case names have lowercase internal keys. |
| 6 combined validator names | `alphabet+integer`, `integer+korean`, `alphabet+korean`, `alphabet+integer+korean`, `integer+dash`, `integer+commas` | Both `+` and underscore spellings resolve; [dispatch tests](../../tests/rules.test.ts). |

`mask` retains phone, email, resident-number, name, and address masking; `generic` retains character masks; `numeric` retains pattern formatting and rounding. The `date` formatter retains digit parsing and pattern tokens, while the date validator checks calendar validity. `maxbyte`, `minbyte`, and `rangebyte` call private byte counting; `limit` uses its separate one/two-unit display length. These helpers remain internal. The optional custom date picker waits for M11.[^formats][^validators]

# Pruning decision

| Candidate | Evidence | Risk and next action |
|---|---|---|
| Public `Rule` type in `src/ui/index.ts` | Declared and documented but unused by 2.0 source, examples, and installed consumers; no public signature refers to it. | Possible external TypeScript imports are unknown. Keep it until separate user review authorizes a public type deletion. |
| Legacy public `N.mask`, general `N.date`, `N.string`, `N.array`, `N.json`, `N.browser`, `N.event`, `N.gc`, `N.element`, and `Date.prototype.formatDate` | No corresponding 2.0 entry exports. In 1.x, formatter/validator dispatch calls mask, date, and byte helpers indirectly; 2.0 retains those operations privately as shown above. | Do not republish the general utility catalog. Migrate application-only calls explicitly; preserve every reachable rule behavior. |

The 1.x `equalTo` selector argument becomes a safe same-row `data-field` path in 2.0. That documented migration change and every future rule deletion or meaning change need contract review before implementation. Preserved `v1/` source is unchanged.[^legacy-data][^legacy-core][^validators]

[^package]: Public package entry map
[^root]: Root public export
[^page]: Page public exports and runtime
[^data]: Data public exports and runtime
[^ui]: UI public exports and types
[^comm]: Communication public exports and runtime
[^form]: Form rule use
[^grid]: Grid rule use
[^list]: List rule use
[^rules]: Declarative rule compilation and dispatch
[^formats]: Retained format catalog and internal helpers
[^validators]: Retained validator catalog and internal helpers
[^popup]: Popup page ownership and result handle
[^tabs]: Tabs page ownership and handle
[^legacy-data]: Preserved 1.x dynamic rule use
[^legacy-core]: Preserved 1.x utility implementations
