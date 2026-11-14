---
type: API Reference
title: Natural-JS 2.0 communicator
description: Native requests with explicit payloads, custom sending, response decoding and cancellation.
tags: [architecture, communication, typescript]
status: draft
symbols: [RequestOptions, Communicator, createCommunicator]
sources:
  - id: native-control
    resource: ../implementation/evidence/m32-native-control-observation.json
    title: Direct Windows WebKit native Fetch wire-policy observations
    git_blob: 7124f5181dc6ded9b74675cccf044dbcd30c41ef
  - id: xhr
    resource: ../../examples/vite/m4/employee-xhr.ts
    title: Application-only finite-body XHR sender and native metadata
    git_blob: 865d8a4f5f95e0e211a9dd2e33fe90d3569b4662
  - id: comm
    resource: ../../src/comm/index.ts
    title: Communicator runtime and types
    git_blob: 4b05ebaa4121885a96f53e8a3b32dd38e1498704
generated: { by: codex/gpt-6, at: 2026-11-14T18:01:25Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T18:01:25Z }
---

The `./comm` entry exports `createCommunicator` and request types. It uses native Request/Response with Fetch as the default sender; application code chooses API URLs, wire conversion and any explicit custom sender.[^comm]

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
| `prepare` | `(request: Request) => Request \| Promise<Request>` | Runs before sending; may return a new Request, including app headers. |
| `after` | `(response: Response) => Response \| Promise<Response>` | Runs after sending, before HTTP status and decoding checks. |
| `send` | `(request: Request) => Promise<Response>` | Optional native/custom sender; omission uses the current global fetch when each request executes. |

Callbacks must satisfy their declared result types. If prepare returns a replacement Request, the caller's abort signal remains attached to the final sent Request.[^comm]

prepare, after and a supplied send are read once at communicator creation and called plainly, without an implicit receiver. Replacing or adding a callback later does not change that communicator. Use a closure for deliberate live policy. Nonfunctions raise REQUEST_OPTIONS at createCommunicator; wrong prepare/after results retain REQUEST_PREPARE/REQUEST_AFTER failures. Default fetch is looked up per request, so it is not captured as an artificial sender.[^comm]

send receives the final prepared Request with combined cancellation. Its resolved value must be a Response; rejection or a non-Response uses REQUEST_NETWORK before after, HTTP checks or decoding. Existing cancellation settles a pending sender promptly and suppresses late results. The custom sender must release its own native work when Request.signal aborts.[^comm]

```ts
const comm = createCommunicator({ send: request => sendEmployee(request, { progress: showTransfer }) });
await comm.request({ url, method: "POST", body: formData, signal });
```

sendEmployee and showTransfer above are application code. The executed [employee XHR example](../../examples/vite/m4/employee-xhr.ts) forwards finite prepared bytes, headers and cancellation through fresh native requests. It exposes progress/authentication and native response URL context without becoming a framework utility. Its explicit policy subset differs from native Fetch: it rejects credentials omit, nondefault cache/referrer, manual redirects, integrity and opaque/no-cors modes. Keep Fetch for those native policies. A synthetic Response has an empty url; retain native metadata in the application's transfer context.[^xhr]

Windows WebKit measurements expose two platform limits: native Fetch sends cookies for omit/same-origin and adds Content-Type after header deletion. Direct URL/Request controls reproduce them without the framework. Tests verify the final Request policy and exact native parity, preserving the original failures; they do not certify cookie/header withholding. Chromium and Firefox retain strict wire assertions.[^native-control]

# Methods

## `request<Result>(options)`

| Option | Type | Behavior |
|---|---|---|
| `url` | `string \| URL` | Request address; required. |
| `method` | `string` | Defaults to `GET`. |
| `json` | `unknown` | Encoded with `JSON.stringify`; sets `Content-Type: application/json`. |
| `body` | `BodyInit` | Passed to the native Request; cannot be used with `json`. |
| `signal` | `AbortSignal` | Cancels hooks, sending, and decoding with `AbortError`. |
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

`json` and `body` together fail with `REQUEST_OPTIONS` before sending. Encoding, request construction, hooks, network, decoding, and default parsing can fail with `REQUEST_JSON`, `REQUEST_INIT`, `REQUEST_PREPARE`, `REQUEST_NETWORK`, `REQUEST_AFTER`, `REQUEST_DECODE`, and `REQUEST_PARSE` respectively. Non-abort request-execution failures are `FrameworkError` instances with `api: "Communicator.request"` and the original cause when available. Invalid creation-time hooks instead use REQUEST_OPTIONS with api createCommunicator. Aborts remain DOM `AbortError` instances.[^comm]

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

[^native-control]: Direct Windows WebKit native Fetch wire-policy observations
[^xhr]: Application-only finite-body XHR sender and native metadata
[^comm]: Communicator runtime and types
