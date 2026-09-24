---
type: API Reference
title: Communication filter
description: Named filter objects in N.context.attr("architecture").comm.filters whose six hooks run at each stage of every N.comm call.
tags: [architecture, communicator, filter, config]
symbols: [NA.config, N.config, NA.config.filterConfig, N.config.filterConfig, NA.comm.initFilterConfig, NA.comm.resetFilterConfig, comm.initFilterConfig, comm.resetFilterConfig, architecture.comm.filters, NA.Objects.Config.FilterConfig]
sources:
  - id: init
    resource: ../../src/natural.architecture.js
    title: NA.comm.initFilterConfig (ordering and hook collection)
    symbol: NA.comm.initFilterConfig
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 0aa8cfdde898
  - id: reset
    resource: ../../src/natural.architecture.js
    title: NA.comm.resetFilterConfig
    symbol: NA.comm.resetFilterConfig
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: b2fb6ccce5d0
  - id: comm
    resource: ../../src/natural.architecture.js
    title: NA.comm constructor (lazy build, beforeInit)
    symbol: NA.comm.prototype.constructor
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 291f824cca55
  - id: submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (afterInit, beforeSend, success, error, complete)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: config
    resource: ../../src/natural.architecture.js
    title: NA.config (filterConfig holder)
    symbol: NA.config
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 9a52b4e73e53
  - id: docs-ctor
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs constructor (registers docsFilter__ and calls resetFilterConfig)
    symbol: NUS.docs.prototype.constructor
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: da534b14832a
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-ARCHITECTURE.md
    title: Legacy Natural-ARCHITECTURE guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

Communication filters run shared logic at each stage of every [`N.comm`](communicator.md) call: before and after the communicator is built, before the request is sent, and on success, error and completion. Declare them as named filter objects in `N.context.attr("architecture").comm.filters` in `natural.config.js` (see [Configuration](../setup/configuration.md)). Calls made with `jQuery.ajax` directly do not pass through filters.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `beforeInit` | `beforeInit(obj)` | `Error` to veto; another value replaces `obj` |
| `afterInit` | `afterInit(request)` | `Error` to veto |
| `beforeSend` | `beforeSend(request, xhr, settings)` | `Error` to cancel |
| `success` | `success(request, data, textStatus, xhr)` | `Error` to stop; another value replaces `data` |
| `error` | `error(request, xhr, textStatus, errorThrown)` | `Error` to mark the error handled |
| `complete` | `complete(request, xhr, textStatus)` | `Error` to stop later `complete` filters |
| `N.config.filterConfig` | property | the built filter configuration, or `undefined` |
| `initFilterConfig` | `comm.initFilterConfig()` | a new filter configuration object |
| `resetFilterConfig` | `comm.resetFilterConfig()` | the communicator |

# Options

Filter object (each property of `comm.filters`; the property name is free):[^init][^comm][^submit]

| Name | Type | Called | `this` | Effect of the return value |
|---|---|---|---|---|
| `order` | number | — | — | Sort key. Filters with `order` run first, sorted as text (see Known issues); filters without it follow in property order. |
| `beforeInit(obj)` | function | `NA.comm` constructor, before `request` exists. `obj` is the jQuery-wrapped first argument: the data object(s), the target element, or an empty `jQuery()` for `N.comm(url)`. | none | `Error`: later `beforeInit` filters are skipped and `N.comm` returns `obj` without `request` or `submit`. Any other value except `undefined`: `obj` is replaced by `jQuery(value)`. |
| `afterInit(request)` | function | Start of `submit()`, after the element-load overrides. | none | `Error`: later `afterInit` filters are skipped, nothing is sent and `submit()` returns `undefined`. |
| `beforeSend(request, xhr, settings)` | function | jQuery `beforeSend`. | communicator | `Error`: later filters are skipped and jQuery cancels the request; no `success`, `error` or `complete` handler or filter runs. |
| `success(request, data, textStatus, xhr)` | function | jQuery `success`, before the `urlSync` check, page insertion and the `submit` callback. | communicator | `Error`: later filters are skipped and the page is not inserted, `init` does not run and the callback is not called. Any other value except `undefined`: replaces `data` for later filters and the callback. |
| `error(request, xhr, textStatus, errorThrown)` | function | jQuery `error`. | communicator | `Error`: later filters are skipped, `error()` handlers are not called and no exception is thrown. |
| `complete(request, xhr, textStatus)` | function | jQuery `complete`, after `success` or `error`. | communicator | `Error`: later `complete` filters are skipped. |

"none" means the hook is called as a plain function, so `this` is `undefined` (or `window` in non-strict code). Only an `Error` instance stops a chain; `false` and other falsy values do not.

# Functions

## `N.config.filterConfig`

`NA.config.filterConfig` (the same object as `N.config.filterConfig`) holds the built configuration `{ beforeInitFilters, afterInitFilters, beforeSendFilters, successFilters, errorFilters, completeFilters }`, each an array of hook functions in execution order.[^config] It is `undefined` until it is first built: by the first `N.comm(...)` call (with `initFilterConfig()`), or earlier by `resetFilterConfig()`, which `N.docs` calls when it registers `docsFilter__`.[^comm][^docs-ctor] Setting it back to `undefined` makes the next `N.comm(...)` call rebuild it. `N.config` is only this runtime holder; it is not `natural.config.js`.

## `comm.initFilterConfig()`

Reads `N.context.attr("architecture").comm.filters` and `N.context.attr("core").spltSepa`, orders the filters and returns a new configuration object without storing it.[^init] It throws a TypeError when `architecture.comm` is missing. It is attached to every communicator as an instance method (the static `NA.comm.initFilterConfig` is not reachable through the `N.comm` factory).

## `comm.resetFilterConfig()`

Sets `N.config.filterConfig = initFilterConfig()` and returns `this` (the communicator when called on one).[^reset] Call it after adding or changing filters at runtime. `N.docs` does this itself when it registers its `docsFilter__` filter, which happens in its constructor whenever `onBeforeEntireLoad` or `onEntireLoad` is not `null`, or `entireLoadIndicator` or `entireLoadScreenBlock` is truthy (after merging the `ui.shell.docs` configuration and the constructor options), even if `N.comm` has never been called.[^docs-ctor]

# Pitfalls

Filters are collected once, when the configuration is first built (the first `N.comm(...)` call, or an `N.docs` created with entire-load options). A filter added to `comm.filters` later is ignored until the configuration is rebuilt.[^comm][^docs-ctor]

```js
// Wrong (legacy): N.context.attr("architecture").comm.filters.auth = { beforeSend: fn };  // after N.comm or N.docs has built the configuration
N.context.attr("architecture").comm.filters.auth = { beforeSend: fn };
N.config.filterConfig = undefined;          // rebuilt on the next N.comm(...) call
```

`afterInit` runs when `submit()` is called, not when `N.comm(...)` returns; a communicator that is never submitted never reaches it.

`success` filter results reach only the callback form. `await N.comm(url).submit()` resolves with the raw response even if a `success` filter returned new data or an `Error`. See [N.comm](communicator.md) Known issues.

An `error` filter that returns an `Error` swallows the error for that call: the communicator's `error()` handlers are skipped and nothing is thrown. Return `undefined` when handlers should still run.

The hooks receive the request first. The `xhr` of `beforeSend` is the jqXHR, so headers can be added with `xhr.setRequestHeader(name, value)`.

# Known issues

* **`order` is compared as text** - Actual: `initFilterConfig` sorts strings of the form `order + spltSepa + name` with `Array.prototype.sort()`, so `order: 10` runs before `order: 2`. Likely intent: numeric order. Workaround: give every ordered filter the same number of digits (`10`, `20`, `30`).[^init]
* **A `beforeInit` veto breaks the call chain** - Actual: when a `beforeInit` filter returns an `Error`, `N.comm(...)` returns the bare jQuery object, so the usual `N.comm(url).submit(cb)` throws "submit is not a function". Likely intent: cancel the request quietly. Workaround: veto in `afterInit` or `beforeSend`, which stop the request without breaking the chain, or check `comm.request` before calling `submit`.[^comm]

# Examples

Two ordered filters with every hook:

```js
N.context.attr("architecture", {
    "page": { "context": "body" },
    "comm": {
        "filters": {
            "exFilter1": {
                order: 1,
                beforeInit: function (obj) { },
                afterInit: function (request) { },
                beforeSend: function (request, xhr, settings) { },
                success: function (request, data, textStatus, xhr) {
                    // return a value to replace data for the submit callback
                },
                error: function (request, xhr, textStatus, errorThrown) { },
                complete: function (request, xhr, textStatus) { }
            },
            "exFilter2": {
                order: 2,
                beforeSend: function (request, xhr, settings) { },
                complete: function (request, xhr, textStatus) { }
            }
        },
        "request": { "options": { "type": "POST" } }
    }
});
```

Add a header, unwrap a response envelope and handle an expired session:

```js
"filters": {
    "session": {
        beforeSend: function (request, xhr, settings) {
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        },
        success: function (request, data, textStatus, xhr) {
            if (request.get("dataType") === "json" && data && data.result !== undefined) {
                return data.result;          // callbacks receive data.result
            }
        },
        error: function (request, xhr, textStatus, errorThrown) {
            if (xhr.status === 401) {
                location.href = "/login";
                return new Error("session expired");   // skip error() handlers and the default throw
            }
        }
    }
}
```

# Related

- [N.comm](communicator.md) - `submit`, `error` handlers and how filter results reach callbacks.
- [N.comm.request](request.md) - the `request` argument every hook receives.
- [N.context](context.md) - where `architecture.comm.filters` is stored.
- [Configuration](../setup/configuration.md) - the `architecture.comm` block of `natural.config.js`.
- [N.docs](../ui-shell/documents.md) - registers its own `docsFilter__` for the entire-load indicator.

[^init]: NA.comm.initFilterConfig (ordering and hook collection)
[^reset]: NA.comm.resetFilterConfig
[^comm]: NA.comm constructor (lazy build, beforeInit)
[^submit]: NA.comm.submit (afterInit, beforeSend, success, error, complete)
[^config]: NA.config (filterConfig holder)
[^docs-ctor]: NUS.docs constructor (registers docsFilter__ and calls resetFilterConfig)
