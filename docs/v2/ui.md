---
type: API Reference
title: Natural-JS 2.0 UI types
description: Type-only Form rules, validation results, and future component handle contracts.
tags: [ui, form, typescript]
status: draft
symbols: [Rule, RuleContext, FormatRule, ValidateRule, ParseInput, RuleSet, ValidationIssue, ValidationResult, FormHandle, GridHandle, PopupHandle]
sources:
  - id: ui
    resource: ../../v2/src/ui/index.ts
    title: UI type contracts
    git_blob: b8217f57369262011a20e2c5e69c4c30be55d101
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:19:59Z }
---

The `./ui` entry exports types only in M2. No Form, Grid, or popup function is implemented yet; later milestones attach their behavior to authored HTML.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `Rule` | Name with positional arguments | Declarative rule tuple |
| `RuleContext` | Field, values, row identity, optional element | Rule context |
| `FormatRule` | Value, arguments, context | Display string |
| `ValidateRule` | Value, arguments, context | Boolean or message |
| `ParseInput` | Input and context | Raw candidate |
| `RuleSet` | Formatter, validator, message, locale maps | Per-component rules |
| `ValidationIssue` | Row, field, rule, message, element | One failure |
| `ValidationResult` | `valid` plus `issues` | Collected failures |
| `FormHandle<T>` | `bind`, `read`, `validate`, `dispose` | Future Form handle |
| `GridHandle<T>` | Selection, sort, filter, validation, disposal | Future Grid handle |
| `PopupHandle<Output>` | Page handle, result, close | Future popup handle |

# Pitfalls

Form-used built-in formatter and validator names remain in scope; their runtime engine is not part of M2. Rule functions are application extension points, not a new public utility collection. Use `import type` until the owning component exists.

# Related

[The M1 contract](../implementation/m1-contract.md) records retained rule names, nested Select options, and HTML binding. [Architecture](architecture.md) keeps the rule runner private to UI.

[^ui]: UI type contracts
