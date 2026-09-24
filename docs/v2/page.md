---
type: API Reference
title: Natural-JS 2.0 page runtime
description: Mount authored HTML with an independent CVC controller, lifecycle, cancellation, and output.
tags: [architecture, cvc, typescript]
status: draft
symbols: [PageContext, PageController, PageDefinition, PageHandle, mountPage]
sources:
  - id: page
    resource: ../../src/page/index.ts
    title: Page runtime and types
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
generated: { by: codex/gpt-6-sol, at: 2026-09-24T09:00:49Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T09:10:24Z }
---

The `./page` entry exports `mountPage` and its CVC types. Each mount creates a controller instance for one authored HTML root.[^page]

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `mountPage` | `mountPage(host, definition, input?)` | `PageHandle<Output>` |
| `PageDefinition<Input, Output>` | `view` plus `controller(context)` | Page declaration |
| `PageContext<Input, Output>` | `root`, `input`, `signal`, `own()`, `output()` | Controller context |
| `PageController` | Optional `init()`, `activate()`, `deactivate()`, `dispose()` | Lifecycle hooks |
| `PageHandle<Output>` | `ready`, `root`, `onOutput()`, lifecycle methods | Mounted page |

# Functions

## `mountPage(host, definition, input?)`

`host` is an `HTMLElement`. `definition.view` is a `URL` for fetched HTML, an existing `HTMLElement`, or a synchronous factory returning a detached `HTMLElement`. Fetched HTML must have exactly one element root. Before insertion, the runner rejects executable elements (including `script` and `iframe`) and attributes such as inline event handlers, `srcdoc`, and `javascript:` URLs with `PAGE_HTML`. A generated root requires an empty host; an existing root must be the host or one of its descendants and remains in the DOM after disposal. Only one mount may claim the same existing root at a time.[^page]

The runner checks `id` uniqueness within the root and against `host.ownerDocument`. Repeated pages should use root-scoped selectors such as `data-field`; if an `id` is needed for a label or ARIA relation, make it unique across all live page instances. The runner does not rewrite IDs.[^page]

# Methods

| Handle member | Behavior |
|---|---|
| `ready` | Resolves after `init()` and first `activate()`; rejects on failure or cancellation. |
| `root` | Current HTML root, or `null` before loading and after cleanup. |
| `onOutput(listener)` | Subscribes to output and returns an unsubscribe function. Output is delivered only while active; reload or disposal during a listener stops delivery to the remaining listeners for that output. |
| `activate()`, `deactivate()` | Serialize lifecycle transitions and skip a duplicate active/inactive transition. |
| `reload()` | Aborts the current instance immediately, cleans it up, then creates a new instance with the original input. |
| `dispose()` | Aborts immediately, clears listeners, runs cleanup, and is safe to call again. |

`PageContext.signal` belongs to one instance; attach DOM listeners with `{ signal }` and pass it to requests. `own(dispose)` registers resource cleanup; a disposer registered after abort or cleanup begins runs immediately instead of joining the old cleanup stack. Cleanup runs `deactivate()` when activation started, then controller `dispose()`, then owned callbacks in reverse order. Generated roots are removed; borrowed roots remain. An aborted HTML load, `init()`, or `activate()` rejects promptly even if that user promise never settles. A user `deactivate()`, `dispose()`, or owned cleanup callback that never settles can still delay the handle's cleanup promise.[^page]

# Pitfalls

`output()` during initialization or inactivity is ignored. A new controller is created on reload, so keep durable application data outside the controller. A factory must return a fresh detached root for each concurrent mount.

Cancellation rejects with a DOM `AbortError`. Other failures use `FrameworkError` with `api: "mountPage"`: `ROOT_MISSING`, `ROOT_IN_USE`, `HOST_NOT_EMPTY`, `DUPLICATE_ID`, `PAGE_HTML`, `PAGE_FETCH`, `PAGE_HTTP`, `CONTROLLER_INVALID`, `PAGE_INIT`, `PAGE_ACTIVATE`, `PAGE_DEACTIVATE`, or `PAGE_DISPOSE`, according to the failed step.[^page]

# Examples

```ts
import { mountPage } from "@bbalganjjm/natural_js/page";

const host = document.querySelector<HTMLElement>("[data-page-host]")!;
const page = mountPage(host, {
  view: new URL("./editor.html", import.meta.url),
  controller({ root, signal, output }) {
    return {
      init() {
        root.querySelector("[data-action=save]")?.addEventListener(
          "click", () => output("save"), { signal }
        );
      }
    };
  }
});
page.onOutput(value => console.log(value));
await page.ready;
await page.dispose();
```

# Related

[The M1 contract](../implementation/m1-contract.md) defines the wider CVC design. [Communication](comm.md) accepts the same instance signal, and [architecture](architecture.md) defines ownership.

[^page]: Page runtime and types