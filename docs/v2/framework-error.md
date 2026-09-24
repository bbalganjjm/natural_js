---
type: API Reference
title: FrameworkError
description: Shared 2.0 error with a stable code, API name, message, cause, and optional detail.
tags: [core, error, typescript]
status: draft
symbols: [FrameworkError]
sources:
  - id: entry
    resource: ../../src/index.ts
    title: Public package entry
    git_blob: d99a783055cf6bea9b6e15ca591c370ff514cec9
  - id: error
    resource: ../../src/internal/framework-error.ts
    title: FrameworkError implementation
    git_blob: 6930da1fbcfd71733a45dab22a51aec784cafe7f
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:52:33Z }
---

`FrameworkError` is the shared error class used by the M3 page runner, row store, and communicator. It carries a short code and actionable context.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `FrameworkError` | `new FrameworkError({ code, api, message, cause?, detail? })` | `Error` with public `code`, `api`, `cause`, and `detail` |

# Constructor

## `new FrameworkError(options)`

The constructor requires nonblank `code`, `api`, and `message` strings. A missing required value throws `TypeError`. It sets `name` to `FrameworkError` and passes `cause` through the standard `Error` cause option.[^error]

# Options

| Key | Type | Required | Meaning |
|---|---|---|---|
| `code` | `string` | Yes | Stable short failure identifier. |
| `api` | `string` | Yes | Public operation that failed. |
| `message` | `string` | Yes | Concise explanation for diagnosis. |
| `cause` | `unknown` | No | Original error without wrapping away its identity. |
| `detail` | `Readonly<Record<string, unknown>>` | No | Field, rule, root, or other correction context. |

# Pitfalls

`mountPage`, `createRows`, and `createCommunicator` now export runtime functions from their role entries. The `./ui` entry remains type-only; importing its Form or Grid handle type does not add runtime behavior.

# Examples

```ts
import { FrameworkError } from "@bbalganjjm/natural_js";

throw new FrameworkError({
  code: "INVALID_EMPLOYEE",
  api: "saveEmployee",
  message: "The employee name is required.",
  detail: { field: "profile.name" }
});
```

# Related

[Package and installation](package.md) identifies the actual M3 exports. [The M1 contract](../implementation/m1-contract.md) specifies errors required by later runtime milestones.

[^error]: FrameworkError implementation
