---
type: API Reference
title: N.comm
description: Ajax communicator that sends data requests or loads block pages into elements, runs communication filters and initializes the loaded page's controller.
tags: [architecture, communicator, ajax, block-page]
symbols: [N.comm, N().comm, NA.comm, NA.prototype.comm, NA.comm.submit, NA.comm.error, NA.Communicator, NA.ajax, N.ajax, comm.submit, comm.error, comm.request, comm.xhr]
sources:
  - id: comm
    resource: ../../src/natural.architecture.js
    title: NA.comm constructor
    symbol: NA.comm.prototype.constructor
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 291f824cca55
  - id: comm-plugin
    resource: ../../src/natural.architecture.js
    title: NA.prototype.comm jQuery plugin wrapper
    symbol: NA.prototype.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 417877f001e7
  - id: submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: error
    resource: ../../src/natural.architecture.js
    title: NA.comm.error
    symbol: NA.comm.error
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: c858b6e542e4
  - id: factory
    resource: ../../src/natural.js.js
    title: N.comm factory and jQuery.fn installation
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-ARCHITECTURE.md
    title: Legacy Natural-ARCHITECTURE guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.comm` is the Communicator of the [CVC pattern](cvc-pattern.md): it wraps `jQuery.ajax` to fetch JSON data or to load a block page into an element and start that page's controller. Every call runs the [communication filters](communication-filter.md) and creates a fresh [`request`](request.md) that carries the options and page parameters. Use it for all server calls; plain `jQuery.ajax` bypasses filters and controller initialization.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.comm` | `N.comm(url \| opts)` / `N.comm(data \| element, url \| opts)` | communicator |
| `N().comm` | `N(data \| element).comm(url \| opts)` | communicator |
| `submit` | `submit([callback])` | communicator with a callback; jqXHR without one; `undefined` if an `afterInit` filter stops |
| `error` | `error(callback)` | communicator |
| `request` | property | [`NA.comm.request`](request.md) instance |
| `xhr` | property | jqXHR of the last `submit()` |
| `resetFilterConfig` | `resetFilterConfig()` | communicator; see [Communication filter](communication-filter.md) |
| `initFilterConfig` | `initFilterConfig()` | a new filter configuration object |

A "communicator" is the jQuery object built from the first argument, augmented with the members above.

# Constructor

## `N.comm(obj[, url])`

- `N.comm` is a factory (`function (obj, url) { return new NA.comm(obj, url); }`) installed by `src/natural.js.js`, so `new` is optional. It is not the `NA.comm` class itself: `N.comm.request`, `N.comm.submit` and `N.comm.resetFilterConfig` are `undefined`.[^factory]
- Arguments are resolved by the `NA.comm` constructor:[^comm]

| Call | Wrapped object | Options | Result |
|---|---|---|---|
| `N.comm("data.json")` | `jQuery()` | `{ url: "data.json" }` | data request without a body |
| `N.comm({ url: "data.json", type: "GET" })` | `jQuery()` | the object | data request; a lone plain object is always treated as options |
| `N.comm({ id: 1 }, "data.json")` | `jQuery({ id: 1 })` | `{ url }` | data request; body `{"id":1}` |
| `N.comm([{...}, {...}], "data.json")` | `jQuery([...])` | `{ url }` | only the first object is sent unless `dataIsArray: true` |
| `N.comm(N("#box"), "page.html")` | the element | `{ url }` | block page loaded into `#box` |
| `N.comm()` | — | — | throws `NC.error("[NA.comm]You must input arguments[0]")` |

- The second argument is a URL string or a [request options](request.md) object.
- Construction runs the `beforeInit` filters, then creates `request` with `new NA.comm.request(obj, opts)` and attaches `submit`, `error`, `initFilterConfig` and `resetFilterConfig` as own methods. A `beforeInit` filter that returns an `Error` makes the constructor return the bare jQuery object without these members.

## `N(obj).comm([url])`

- jQuery plugin form: runs `new NA.comm(this, url)`.[^comm-plugin] `N({ id: 1 }).comm("data.json")` sends data; `N("#box").comm("page.html")` loads a page.
- Returns the same NJS object it was called on, now augmented as a communicator.

# Options

The options object (second argument, or a lone plain-object argument) is the request options object: `url`, `type`, `data`, `dataIsArray`, `urlSync`, `append`, `target` and any other `jQuery.ajax` setting except `beforeSend`, `success`, `error` and `complete`, which `submit()` replaces. Defaults and precedence are listed in [N.comm.request](request.md).

# Methods

## `submit([callback])`

Sends the request.[^submit]

1. If the communicator wraps an element, forces `contentType: "text/html; charset=UTF-8"`, `dataType: "html"`, `type: "GET"` and sets `request.options.target` to the element. These override your options.
2. Runs the `afterInit` filters; an `Error` result stops here and `submit` returns `undefined`.
3. Calls `NA.ajax(request.options)` (the static `jQuery.ajax` reference on `NA`; `N.ajax` is a copy made by `Object.assign`, so reassigning `N.ajax`, for example to mock it, does not affect `N.comm`) with its own `beforeSend`, `success`, `error` and `complete` handlers, which run the matching filters.
4. On success, after the `success` filters:
   - data request: if `urlSync` is true and `location.href` changed since the request was created, aborts, logs a warning and does not call `callback`;
   - element request: inserts the HTML, then initializes the page's controller (see [CVC pattern](cvc-pattern.md)).
5. Calls `callback` with `this` bound to the communicator:

| Request | Callback arguments |
|---|---|
| data (JSON, text, ...) | `(data, request)`; `data` is the value returned by the last `success` filter that returned something |
| element (block page) | `(cont)`: the loaded page's Controller object, or `undefined` if the page declares none |

- Returns the communicator when `callback` is given, and the jqXHR (`this.xhr`) when it is not. The jqXHR is a thenable: `await N.comm(url).submit()` resolves with the raw response (HTML text for a page load) and rejects with the jqXHR. Without an `error()` handler the rejection still reaches the awaiting code, but the internal error callback also throws an uncaught `NC.error(...)` and the `complete` filters are skipped (see Pitfalls).
- An exception thrown inside `callback` is passed to every `error()` handler and then rethrown as `NC.error("NA.comm.submit.success.callback(url:...)", e)`.

## `error(callback)`

Registers an error handler and returns the communicator, so several handlers can be chained. Handlers run in registration order with `this` bound to the communicator, but the arguments differ by situation:[^submit][^error]

| Situation | Handler arguments | After the handlers |
|---|---|---|
| Server or transport error (jQuery `error`) | `(e, request, xhr, textStatus)`; `e` is jQuery's `errorThrown` (the HTTP status text or a parse error) | nothing; without handlers the internal error callback throws `NC.error("NA.comm.submit.error(url:...)")` |
| Exception thrown in the `submit` callback | `(xhr, textStatus, e, request, callback)`; `textStatus` is jQuery's success status (`"success"`, or `"nocontent"` / `"notmodified"` for 204, HEAD or 304 responses) | the exception is rethrown |

If an `error` filter returns an `Error`, the handlers are skipped and nothing is thrown.

## `request`

The [`NA.comm.request`](request.md) created for this call. Set page parameters on it before `submit()`: `comm.request.attr("id", 1)` returns the communicator, so `.submit()` can follow.

## `xhr`

The jqXHR returned by `jQuery.ajax` in the last `submit()` call.

## `resetFilterConfig()` / `initFilterConfig()`

Rebuild or build the filter configuration from `N.context.attr("architecture").comm.filters`. See [Communication filter](communication-filter.md).

# Pitfalls

Server errors and callback exceptions call the same handler with different argument orders. Write handlers that tell them apart.[^submit]

```js
// Wrong (legacy): N.comm("data.json").error(function (xhr, textStatus, e, request, callback) { alert(xhr.status); })
N.comm("data.json").error(function (a0, a1, a2, a3) {
    const inCallback = typeof a1 === "string"; // (xhr, textStatus, e, request, callback); a server error passes the request object as a1
    const xhr = inCallback ? a0 : a2;          // server error: (e, request, xhr, textStatus)
    const e = inCallback ? a2 : a0;
    N.log(xhr.status, e);
}).submit(function (data, request) { /* ... */ });
```

`N.comm` is a factory, not the class, so the static members of `NA.comm` are not on it.

```js
// Wrong (legacy): N.comm.resetFilterConfig();
N.comm("noop").resetFilterConfig();   // instance method; no request is sent until submit()
N.config.filterConfig = undefined;    // or: rebuilt on the next N.comm(...) call
```

A single plain object is read as options, not as data. Pass the data first and the URL second.

```js
// Wrong (legacy): N.comm({ id: 1 }).submit(cb);
N.comm({ id: 1 }, "detail.json").submit(cb);
N({ id: 1 }).comm("detail.json").submit(cb);
```

Page loads into an element are always `GET` with `dataType: "html"`; `type` and `contentType` options are overwritten. Send parameters to the loaded page with `request.attr`, not with a body.[^submit]

```js
// Wrong (legacy): N("#box").comm({ url: "page.html", type: "POST", data: { id: 1 } }).submit();
N("#box").comm("page.html").request.attr("id", 1).submit();
```

An array argument sends only its first object unless `dataIsArray` is true; the `@types` note saying `N.comm(array, url)` sends the whole array does not match the code.[^comm]

```js
// Wrong (legacy): N.comm([{ id: 1 }, { id: 2 }], "save.json").submit();
N.comm([{ id: 1 }, { id: 2 }], { url: "save.json", dataIsArray: true }).submit();
N.comm({ rows: [{ id: 1 }, { id: 2 }] }, "save.json").submit();
```

Without an `error()` handler, a failed request makes the internal error callback throw `NC.error(...)`, which surfaces as an uncaught exception even when the awaiting code catches the rejected jqXHR. The throw happens inside jQuery's fail callbacks, before jQuery fires its `complete` callbacks, so the `complete` filters do not run for that request. An exception in the `submit` callback is always rethrown and skips the `complete` filters the same way. Register `.error(fn)` (it returns the communicator, so `.error(fn).submit()` still returns the jqXHR) or handle errors in an `error` filter that returns an `Error`.[^submit]

```js
// Wrong (legacy): const data = await N.comm("data.json").submit();   // no error() handler: a failure also throws an uncaught NC.error
try {
    const data = await N.comm("data.json").error(function (e, request, xhr, textStatus) { /* ... */ }).submit();
} catch (xhr) {
    N.log(xhr.status);   // the await rejects with the jqXHR
}
```

# Known issues

* **Error handlers receive two different argument orders** - Actual: `NA.comm.submit` calls handlers as `(e, request, xhr, textStatus)` for server errors and as `(xhr, textStatus, e, request, callback)` for exceptions in the success callback; the `NA.Callbacks.Communicator.Error` type and the legacy guide document only the second order. Likely intent: one order for both. Workaround: detect the case by checking whether the second argument is a string (callback exception) or the request object (server error) (see Pitfalls).[^submit]
* **Promise mode ignores filter results and `urlSync`** - Actual: without a callback, `submit()` returns the jqXHR, which resolves with jQuery's raw response. Data returned by `success` filters, an `Error` returned by a `success` filter, and the `urlSync` abort only affect the callback path. Likely intent: the awaited value matches what a callback would receive. Workaround: use the callback form when `success` filters transform or veto responses.[^submit]

# Examples

Retrieve data, with a callback or with `await`:

```js
N.comm("data.json").submit(function (data, request) {
    N.log(data);
});

const load = async () => {
    const data = await N.comm("data.json").submit();
    N.log(data);
};
```

Send parameters and read the result:

```js
N({ param1: 1, param2: "Mark" }).comm("data.json").submit(function (data) {
    N.log(data);
});
```

Load a block page into an element and use its controller:

```html
<article id="view-0001"></article>

<script type="text/javascript">
    N("#view-0001").comm("page.html").submit(function (cont) {
        // cont: controller of page.html, after its init has run
    });

    const reload = async () => {
        const html = await N("#view-0001").comm("page.html").submit();   // HTML text
        const cont = N("#view-0001 > .view_context__").instance("cont");
    };
</script>
```

Pass page parameters to the loaded page:

```js
N("#section").comm("page.html")
    .request.attr("data1", { data: ["1", "2"] })
    .request.attr("data2", ["3", "4"])
    .submit();
```

Handle errors:

```js
N.comm("data.json").error(function (e, request, xhr, textStatus) {
    N.log("server error", xhr.status, textStatus);
}).submit(function (data) {
    /* ... */
});
```

# Related

- [N.comm.request](request.md) - request options, defaults, `attr`, `get`, `param`, `reload`.
- [Communication filter](communication-filter.md) - hooks that run around every `N.comm` call.
- [CVC pattern](cvc-pattern.md) - what happens when a block page is loaded.
- [N.cont](controller.md) - the controller passed to the page-load callback.
- [Configuration](../setup/configuration.md) - global request options in `architecture.comm.request.options`.

[^comm]: NA.comm constructor
[^comm-plugin]: NA.prototype.comm jQuery plugin wrapper
[^submit]: NA.comm.submit
[^error]: NA.comm.error
[^factory]: N.comm factory and jQuery.fn installation
