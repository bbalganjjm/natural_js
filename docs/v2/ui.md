---
type: API Reference
title: Natural-JS 2.0 UI contracts
description: Shared rule, validation, selection, and page types for the implemented HTML-bound UI.
tags: [ui, typescript, binding]
status: draft
symbols: [Rule, RuleContext, FormatRule, ValidateRule, ParseInput, RuleSet, ValidationIssue, ValidationResult, PageRequest, PageInput, PageState, SelectValue, SelectChoice, SelectSelection, SelectHandle, PaginationHandle, FormHandle, SortIndicator, ListHandle, GridHandle]
sources:
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public UI types and runtime exports
    git_blob: 6a2ee60393df8898e518a884fc1b8f3c6d6b9cf5
generated: { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
---

The `./ui` entry exports the HTML-bound Form, Grid, List, Select, and Pagination functions and their types. The types below keep callbacks, values, and component handles explicit; no generic component registry is exported.[^ui]

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `Rule` | Name with positional arguments | Declarative rule tuple |
| `RuleContext` | Field, values snapshot, row identity, optional field element | Rule context |
| `FormatRule` | Value, arguments, context | Display string |
| `ValidateRule` | Value, arguments, context | Boolean or message |
| `ParseInput` | Entered string and context | Raw candidate |
| `RuleSet` | Formatter, validator, message, locale maps | Per-component rules |
| `ValidationIssue` | Row, field, rule, message, optional element | One failure |
| `ValidationResult` | `valid` plus `issues` | Collected failures |
| `PageRequest` | One-based `page`, positive `size` | Requested slice |
| `PageInput` | `PageRequest` plus nonnegative `total` | Pagination input |
| `PageState` | `PageInput` plus computed `pages` | Normalized page state |
| `SelectValue` | `string | number | boolean | null` | Choice raw scalar |
| `SelectChoice<V>` | `label`, `value`, optional `disabled` | Generated option input |
| `SelectSelection<V>` | `V | string | null` | Raw choice or authored string |
| `SelectHandle<V>` | `setChoices`, `setValue`, `value`, `dispose` | Select handle |
| `PaginationHandle` | `set`, `state`, `dispose` | Pagination handle |
| `FormHandle<T>` | `bind`, `read`, `validate`, `dispose` | Form handle |
| `SortIndicator` | Header `column`, ascending/descending `direction` | Grid ARIA sort state |
| `ListHandle<T>` | Selection, sort, filter, page, validation, disposal | List handle |
| `GridHandle<T>` | Selection, sort, filter, page, validation, disposal | Grid handle |

# Pitfalls

A `PageRequest` does not carry `total`; read `list.page()` or `grid.page()` after a local slice and pass that `PageState` to Pagination. The page index is one-based; an empty result has `page: 1` and `pages: 0`.[^ui]

Use an authored native `<button type="button">` and a page/controller event handler for ordinary actions. M6 has no `bindButton` export or framework button theme.

A parser sees one snapshot of all currently entered, still unparsed drafts in `RuleContext.values`; parser order does not change that snapshot. Validator `RuleContext.values` holds the combined typed candidate, but each `ValidateRule` receives its field value as a string. Formatters see stored row values. A rule's `element` may still be detached when the component initializes; use `element.isConnected` if connection matters. Form, Grid, and List resolve JSON `data-format` and `data-validate` names through one private UI rule runner. A per-component `RuleSet` may override a retained built-in name. Unknown names and invalid built-in arguments fail at binding. Formatters and validators used by the UI remain; they are not a public utility package.[^ui]

# Related

[Form](form.md), [Grid](grid.md), [List](list.md), [Select](select.md), and [Pagination](pagination.md) document runtime behavior. [The M1 contract](../implementation/m1-contract.md) records the first-release boundary.

[^ui]: Public UI types and runtime exports
