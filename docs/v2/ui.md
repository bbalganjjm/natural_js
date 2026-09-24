---
type: API Reference
title: Natural-JS 2.0 UI contracts
description: Shared Form and Grid rule, validation, and handle types.
tags: [ui, form, grid, typescript]
status: draft
symbols: [Rule, RuleContext, FormatRule, ValidateRule, ParseInput, RuleSet, ValidationIssue, ValidationResult, FormHandle, GridHandle]
sources:
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public UI types and runtime exports
    git_blob: 024d2a174b00a1ac80f626942dcb07fa1142bf20
generated: { by: codex/gpt-6-sol, at: 2026-09-24T11:00:57Z }
---

The `./ui` entry exports `bindForm`, `bindGrid`, and only the types needed to use them. The types below describe component rule callbacks and validation results; the M7 popup contract remains in the approved design document.[^ui]

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `Rule` | Name with positional arguments | Declarative rule tuple |
| `RuleContext` | Field, values, row identity, optional element | Rule context |
| `FormatRule` | Value, arguments, context | Display string |
| `ValidateRule` | Value, arguments, context | Boolean or message |
| `ParseInput` | Input and context | Raw candidate |
| `RuleSet` | Formatter, validator, message, locale maps | Per-component rules |
| `ValidationIssue` | Row, field, rule, message, optional element | One failure |
| `ValidationResult` | `valid` plus `issues` | Collected failures |
| `FormHandle<T>` | `bind`, `read`, `validate`, `dispose` | Form handle |
| `GridHandle<T>` | Selection, sort, filter, validation, disposal | Grid handle |

# Pitfalls

Form and Grid resolve JSON `data-format` and `data-validate` names through one private UI rule runner. A per-component `RuleSet` may override a built-in name. Unknown names and invalid built-in arguments fail at binding; validation issues carry a row ID, field, rule, and nonempty message. No generic rule engine or M7 popup type is exported.[^ui]

# Related

[Form](form.md) and [Grid](grid.md) explain the implemented components. [The M1 contract](../implementation/m1-contract.md) records the retained built-in rule names and later full behavior.

[^ui]: Public UI types and runtime exports