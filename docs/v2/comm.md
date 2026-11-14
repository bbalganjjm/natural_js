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
    git_blob: 20c31fb67fc20a6b4fefd93742d0c6783483acb9
generated: { by: codex/gpt-6, at: 2026-11-14T15:07:04Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T15:07:04Z }
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

prepare and after are read once when the communicator is created and called as plain functions, with no implicit receiver. Replacing a callback property later does not change an existing communicator. Capture application state in a closure when policy must remain live. Supplying a nonfunction raises REQUEST_OPTIONS at createCommunicator; a hook returning the wrong native object retains its REQUEST_PREPARE or REQUEST_AFTER failure.[^comm]

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

decode is captured once per request and called plainly. A supplied nonfunction raises REQUEST_OPTIONS before preparation or transport; an already-aborted signal retains AbortError priority. Hook, network and decoder cancellation uses the existing request lifetime, including a pending hook that never settles.[^comm]

# Application request phases

Use ordinary typed functions around request for application policy. Normalize input before constructing a request, compose prepare/after functions explicitly, transform the awaited result, recover a chosen failure in catch and release request-local resources in finally. Throw or abort to stop later phases. A returned Error object has no hidden control meaning; throw it when the operation must fail.[^comm]

```ts
async function search(query: string): Promise<Employee[]> {
  pending++;
  try {
    const input = query.trim();
    if (!input) throw new Error("Enter a query.");
    return await comm.request<Employee[]>({ url, method: "POST", json: { query: input }, signal });
  } finally {
    pending--;
  }
}
```

Here Employee, comm, url, signal and pending belong to the application. finally executes once for success, pre-request failure, HTTP/parse failure and cancellation. If an application supplies a completion function that can throw, it chooses whether that error replaces a prior request failure; the framework adds no recovery or completion engine. Do not await an unbounded completion promise when cancellation must settle promptly. The [employee screen](employee-example.md) owns native busy state with this pattern and the page signal.[^comm]

# Pitfalls

`json` and `body` together fail with `REQUEST_OPTIONS` before `fetch`. Encoding, request construction, hooks, network, decoding, and default parsing can fail with `REQUEST_JSON`, `REQUEST_INIT`, `REQUEST_PREPARE`, `REQUEST_NETWORK`, `REQUEST_AFTER`, `REQUEST_DECODE`, and `REQUEST_PARSE` respectively. Non-abort request-execution failures are `FrameworkError` instances with `api: "Communicator.request"` and the original cause when available. Invalid creation-time hooks instead use REQUEST_OPTIONS with api createCommunicator. Aborts remain DOM `AbortError` instances.[^comm]

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
