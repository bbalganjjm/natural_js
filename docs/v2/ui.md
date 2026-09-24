---
type: API Reference
title: Natural-JS 2.0 UI contracts
description: Shared Form and Grid rule, validation, handle, and future popup types.
tags: [ui, form, grid, typescript]
status: draft
symbols: [Rule, RuleContext, FormatRule, ValidateRule, ParseInput, RuleSet, ValidationIssue, ValidationResult, FormHandle, GridHandle, PopupHandle]
sources:
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public UI types and runtime exports
    git_blob: f4004388ef1cb23c8e1e5fec340886f9c0416ef5
generated: { by: codex/gpt-6-sol, at: 2026-09-24T10:12:21Z }
verified:
  - { by: codex/gpt-6-sol-independent, at: 2026-09-24T10:12:53Z }
---

The `./ui` entry exports the M4 `bindForm` and `bindGrid` runtimes and their shared types. The types below describe component rule callbacks and validation results; popup behavior remains an M7 contract.[^ui]

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
| `PopupHandle<Output>` | Page handle, result, close | Future popup handle |

# Pitfalls

M4 Form resolves JSON `data-format` and `data-validate` names only from the supplied `RuleSet`; unknown names fail at binding. The legacy built-in formatter and validator catalog remains in scope for M5. M4 Grid rejects a `rules` option with `GRID_RULES` until its shared rule runner exists; it does validate row-local Select options. Do not present either pilot as the finished M5/M6 rule system.[^ui]

# Related

[Form](form.md) and [Grid](grid.md) explain the implemented M4 components. [The M1 contract](../implementation/m1-contract.md) records the retained built-in rule names and later full behavior.

[^ui]: Public UI types and runtime exports