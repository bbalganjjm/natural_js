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
    git_blob: a9c55c619db80f2fdac55b3b948f6f9ce1d3c20c
generated: { by: codex/gpt-6, at: 2026-11-14T19:10:56Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T09:10:24Z }
  - { by: codex/gpt-6, at: 2026-11-14T19:10:56Z }
---

The `./page` entry exports `mountPage` and its CVC types. Each mount creates a controller instance for one authored HTML root.[^page]

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `mountPage` | `mountPage(host, definition, input?)` | `PageHandle<Output>` |
| `PageDefinition<Input, Output>` | `view`, optional `loadHtml`, `controller(context)` | Page declaration |
| `PageContext<Input, Output>` | `root`, `input`, `signal`, `own()`, `output()` | Controller context |
| `PageController` | Optional `init()`, `activate()`, `deactivate()`, `dispose()` | Lifecycle hooks |
| `PageHandle<Output>` | `ready`, `root`, `onOutput()`, lifecycle methods | Mounted page |

# Functions

## `mountPage(host, definition, input?)`

`host` is an `HTMLElement`. `definition.view` is a `URL` for fetched HTML, an existing `HTMLElement`, or a synchronous factory returning a detached `HTMLElement`. URL HTML must have exactly one element root. Both native Fetch and a custom loader use this same parser. Before insertion, the runner checks all descendants, including nested HTML template contents, and rejects executable elements (including `script` and `iframe`) and attributes such as inline event handlers, `srcdoc`, and `javascript:` URLs with `PAGE_HTML`. A generated root requires an empty host; an existing root must be the host or one of its descendants and remains in the DOM after disposal. Only one mount may claim the same existing root at a time.[^page]

For URL views, optional loadHtml(url: URL, signal: AbortSignal): Promise<string> connects the application communicator or another explicit text loader. It is read once per mount, called plainly, and reused for reload. Later replacement or addition of loadHtml does not change that handle; borrowed/factory views do not call it. Omission retains native Fetch. The page owner still parses, checks IDs and manages controller/cancellation/cleanup; a late loader result cannot insert HTML or revive a disposed generation.[^page]

The controller factory is also captured once per mount, validated and called plainly for each generation. Returned controller hooks remain method calls, so class lifecycle methods retain their receiver. Later controller replacement does not change an existing handle; use a closure for deliberate live policy.[^page]

definition.view remains live between reloads. Each admitted mountPage generation reads it once for both root classification and loading, then checks whether its getter reloaded/disposed the page. Popup may perform its own earlier host preflight reads; this is not a global getter-count guarantee.[^page]

A nonfunction controller or supplied nonfunction loadHtml raises PAGE_OPTIONS synchronously; a nonstring loader result raises PAGE_LOAD. Capturing a getter can throw synchronously. Other custom loader failures use PAGE_FETCH while existing FrameworkError/AbortError values keep their owner. Native Fetch retains PAGE_FETCH/PAGE_HTTP. Ordinary native response-body read failures use PAGE_INIT; AbortError and existing FrameworkError values keep their propagation.[^page]

The runner checks `id` uniqueness within the root and against `host.ownerDocument`. Repeated pages should use root-scoped selectors such as `data-field`; if an `id` is needed for a label or ARIA relation, make it unique across all live page instances. The runner does not rewrite IDs. IDs inside inert template contents are not live document IDs and do not participate in this check.[^page]

# Methods

| Handle member | Behavior |
|---|---|
| `ready` | Resolves after `init()` and first `activate()`; rejects on failure or cancellation. |
| `root` | Current HTML root, or `null` before loading and after cleanup. |
| `onOutput(listener)` | Subscribes to output and returns an unsubscribe function. Output is delivered only while active; reload or disposal during a listener stops delivery to the remaining listeners for that output. |
| `activate()`, `deactivate()` | Serialize lifecycle transitions and skip a duplicate active/inactive transition. |
| `reload()` | Aborts the current instance immediately, cleans it up, then creates a new instance with the original input. |
| `dispose()` | Aborts immediately, clears listeners and returns one cached complete-cleanup promise, including the same rejection for repeated/reentrant callers. |

`PageContext.signal` belongs to one instance; attach DOM listeners with `{ signal }` and pass it to requests. `own(dispose)` registers resource cleanup; a disposer registered after abort or cleanup begins runs immediately instead of joining the old cleanup stack. Cleanup runs `deactivate()` when activation started, then controller `dispose()`, then owned callbacks in reverse order. Generated roots are removed; borrowed roots remain. Cleanup continues after a failure and preserves the first failure, including null/undefined, after releasing the root claim/DOM. The public disposal promise is cached before abort listeners can reenter. Reload/dispose retain the instance being canceled, so pending initialization cannot hide its cleanup failure by clearing the live pointer. During canceled startup, ready retains AbortError while the initiating disposal/reload observes cleanup failure; an already-cleaned empty handle does not replay an old ready failure.[^page] An aborted HTML load, `init()`, or `activate()` rejects promptly even if that user promise never settles. A user `deactivate()`, `dispose()`, or owned cleanup callback that never settles can still delay the handle's cleanup promise.[^page]

# Pitfalls

`output()` during initialization or inactivity is ignored. A new controller is created on reload, so keep durable application data outside the controller. A factory must return a fresh detached root for each concurrent mount.

Cancellation rejects with a DOM `AbortError`. Declaration-getter errors retain their JavaScript propagation. Runner-created page-operation errors use `FrameworkError` with `api: "mountPage"`; existing FrameworkError values from a custom loader retain their original code/API, including communicator REQUEST_HTTP/REQUEST_DECODE. Runner error codes include: `ROOT_MISSING`, `ROOT_IN_USE`, `HOST_NOT_EMPTY`, `DUPLICATE_ID`, `PAGE_HTML`, `PAGE_OPTIONS`, `PAGE_LOAD`, `PAGE_FETCH`, `PAGE_HTTP`, `CONTROLLER_INVALID`, `PAGE_INIT`, `PAGE_ACTIVATE`, `PAGE_DEACTIVATE`, or `PAGE_DISPOSE`, according to the failed step.[^page]

Typed input or closures carry application caller capabilities, opener elements, parent identity/signal, request values and scope context. Input is not deep-cloned or frozen at runtime. The application owns parent-child cleanup and guards direct capabilities with its parent signal; there is no implicit controller discovery or metadata registry.[^page]

# Examples

```ts
import { mountPage } from "@bbalganjjm/natural_js/page";
import { createCommunicator } from "@bbalganjjm/natural_js/comm";

const comm = createCommunicator();
const host = document.querySelector<HTMLElement>("[data-page-host]")!;
const page = mountPage(host, {
  view: new URL("./editor.html", import.meta.url),
  loadHtml: (url, signal) => comm.request<string>({
    url, signal, decode: response => response.text()
  }),
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

[Documents](documents.md) retains dynamic pages and calls their existing lifecycle methods; [the shell example](shell-example.md) reuses a definition in main content, Documents and Popup. [The M1 contract](../implementation/m1-contract.md) defines the wider CVC design. [Communication](comm.md) accepts the same instance signal, and [architecture](architecture.md) defines ownership.

[^page]: Page runtime and types