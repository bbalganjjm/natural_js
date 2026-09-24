---
type: API Reference
title: Natural-JS 2.0 page types
description: Type-only CVC page contracts for controller instances, HTML roots, lifecycle, and output.
tags: [architecture, cvc, typescript]
status: draft
symbols: [PageContext, PageController, PageDefinition, PageHandle]
sources:
  - id: page
    resource: ../../v2/src/page/index.ts
    title: Page type contracts
    git_blob: d933b25708d293ee1596b95045d1025746da4f3b
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:19:59Z }
---

The `./page` entry exports types only in M2. The page runner and `mountPage` runtime function are planned for M3.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `PageContext<Input, Output>` | `root`, `input`, `signal`, `own()`, `output()` | Controller context |
| `PageController` | Optional `init()`, `activate()`, `deactivate()`, `dispose()` | Lifecycle shape |
| `PageDefinition<Input, Output>` | `view` plus `controller(context)` | Page declaration |
| `PageHandle<Output>` | `ready`, `root`, output listener, lifecycle methods | Future mounted page handle |

# Pitfalls

Use `import type` for this entry. No M2 runtime page loader exists. Do not treat a typed `PageDefinition` as an active page until M3 implements and tests its lifecycle.

# Examples

```ts
import type { PageDefinition } from "@bbalganjjm/natural_js/page";

const definition: PageDefinition<{ name: string }, string> = {
  view: new URL("./hello.html", import.meta.url),
  controller(context) {
    return { init() { context.output(context.input.name); } };
  }
};
```

# Related

[The M1 contract](../implementation/m1-contract.md) defines lifecycle, cancellation, root ownership, and repeated instances. [Architecture](architecture.md) defines import direction.

[^page]: Page type contracts
