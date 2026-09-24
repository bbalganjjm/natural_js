---
type: API Reference
title: Natural-JS 2.0 communicator
description: Fetch requests with explicit JSON or body input, response decoding, hooks, and cancellation.
tags: [architecture, communication, typescript]
status: draft
symbols: [RequestOptions, Communicator, createCommunicator]
sources:
  - id: comm
    resource: ../../src/comm/index.ts
    title: Communicator runtime and types
    git_blob: f3650ddbfeb5d87c3e58dc84904df9704e994368
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:52:33Z }
---

The `./comm` entry exports `createCommunicator` and request types. It uses browser `Request`, `Response`, and `fetch` directly; application code chooses its API URL and data conversion.[^comm]

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `createCommunicator` | `createCommunicator(options?)` | `Communicator` |
| `Communicator` | `request<Result>(options)` | `Promise<Result>` |
| `RequestOptions<Result>` | URL, payload, signal, decoder | Request declaration |

# Functions

## `createCommunicator(options?)`

| Option | Type | Behavior |
|---|---|---|
| `baseURL` | `URL` | Resolves relative request URLs. |
| `prepare` | `(request: Request) => Request \| Promise<Request>` | Runs before `fetch`; may return a new Request, including app headers. |
| `after` | `(response: Response) => Response \| Promise<Response>` | Runs after `fetch`, before HTTP status and decoding checks. |

A hook must return the native object declared by its type. If `prepare` returns a replacement Request, the caller's abort signal is still attached to the request sent by `fetch`.[^comm]

# Methods

## `request<Result>(options)`

| Option | Type | Behavior |
|---|---|---|
| `url` | `string \| URL` | Request address; required. |
| `method` | `string` | Defaults to `GET`. |
| `json` | `unknown` | Encoded with `JSON.stringify`; sets `Content-Type: application/json`. |
| `body` | `BodyInit` | Passed to the native Request; cannot be used with `json`. |
| `signal` | `AbortSignal` | Cancels hooks, fetch, and decoding with `AbortError`. |
| `decode` | `(response: Response) => Result \| Promise<Result>` | Optional application decoder. |

Without `decode`, a successful nonempty response is parsed as JSON. HTTP 204/205 and an empty body fail with `REQUEST_EMPTY`; supply a decoder when an empty successful response is expected. An HTTP failure uses `REQUEST_HTTP`, including status and status text in the error detail.[^comm]

# Pitfalls

`json` and `body` together fail with `REQUEST_OPTIONS` before `fetch`. Encoding, request construction, hooks, network, decoding, and default parsing can fail with `REQUEST_JSON`, `REQUEST_INIT`, `REQUEST_PREPARE`, `REQUEST_NETWORK`, `REQUEST_AFTER`, `REQUEST_DECODE`, and `REQUEST_PARSE` respectively. Non-abort failures are `FrameworkError` instances with `api: "Communicator.request"` and the original cause when available. Aborts remain DOM `AbortError` instances.[^comm]

There is no application-specific response envelope or automatic business data transformation. Implement that in `decode` or application code, rather than adding a generic framework utility.

# Examples

```ts
import { createCommunicator } from "@bbalganjjm/natural_js/comm";

const comm = createCommunicator({
  baseURL: new URL("/api/", location.href),
  prepare(request) {
    const headers = new Headers(request.headers);
    headers.set("X-App", "employees");
    return new Request(request, { headers });
  }
});
const employees = await comm.request<{ name: string }[]>({
  url: "employees",
  signal: new AbortController().signal
});
```

# Related

[Page runtime](page.md) provides a per-instance abort signal. [The M1 contract](../implementation/m1-contract.md) describes server conversion responsibility.

[^comm]: Communicator runtime and types