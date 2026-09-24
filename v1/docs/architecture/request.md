---
type: API Reference
title: N.comm.request
description: Per-call request object of N.comm that holds the Ajax options and the page parameters passed to a loaded block page, with attr, get, param and reload.
tags: [architecture, communicator, request, page-parameters]
symbols: [N.comm.request, NA.comm.request, NA.Request, NA.Options.Request, comm.request, cont.request, request.attr, request.removeAttr, request.param, request.get, request.reload, NA.prototype.request]
sources:
  - id: request
    resource: ../../src/natural.architecture.js
    title: NA.comm.request constructor (defaults and data serialization)
    symbol: NA.comm.request.prototype.constructor
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: b6dcea75b2de
  - id: attr
    resource: ../../src/natural.architecture.js
    title: NA.comm.request.prototype.attr
    symbol: NA.comm.request.prototype.attr
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 8101f576ac81
  - id: param
    resource: ../../src/natural.architecture.js
    title: NA.comm.request.prototype.param
    symbol: NA.comm.request.prototype.param
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 2265b695e93a
  - id: reload
    resource: ../../src/natural.architecture.js
    title: NA.comm.request.prototype.reload
    symbol: NA.comm.request.prototype.reload
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: dd1c7ea201f9
  - id: submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (element-load overrides, urlSync, append, replace)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: prototype-request
    resource: ../../src/natural.architecture.js
    title: NA.prototype.request
    symbol: NA.prototype.request
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 4730975621fc
  - id: factory
    resource: ../../src/natural.js.js
    title: jQuery.fn installation (skips request)
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-ARCHITECTURE.md
    title: Legacy Natural-ARCHITECTURE guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

Every `N.comm(...)` call creates one request object (class `NA.comm.request`, reached as `comm.request`). It stores the `jQuery.ajax` options and a separate attribute map used to pass page parameters: the caller sets them with `request.attr(name, value)` before `submit()`, and the loaded page reads them from `init(view, request)` or `this.request`. `N.comm.request` is the conventional name; the runtime class is not reachable through the `N.comm` factory.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `attr` | `attr()` | the whole attribute map |
| `attr` | `attr(name)` | the value, or `undefined` |
| `attr` | `attr(name, obj)` | the owner (`request.obj`): the communicator, or the `N.docs` instance for `docs.request` |
| `removeAttr` | `removeAttr(name)` | the request |
| `param` | `param([name])` | query parameters of `options.url` (object, or one value) |
| `get` | `get([key])` | `options`, or `options[key]` |
| `reload` | `reload([callback])` | the request |
| `options` | property | the Ajax options object |
| `attrObj` | property | the attribute map |
| `obj` | property | the object passed to the constructor |

# Constructor

## `new NA.comm.request(obj[, opts])`

Created by the `NA.comm` constructor (and by `N.docs` for `docs.request`); you normally do not call it.[^request]

- `options` = code defaults, then `N.context.attr("architecture").comm.request.options` (ignored if missing), then `opts`.
- `obj` is kept as `request.obj`; `attr(name, value)` returns it.
- When `options.data` is `null`, the body is derived from `obj`:
  - `obj` wraps an element: no body.
  - otherwise `data = dataIsArray ? obj.get() : obj.get(0)`, then `JSON.stringify` when the result is an object (or an array with `dataIsArray`).
- When `type` is `GET` and the derived `data` string starts and ends with `{}` or `[]`, it becomes `"q=" + encodeURI(json)`, which jQuery appends to the URL: `N.comm({ a: 1 }, { url: "list.json", type: "GET" })` requests `list.json?q=%7B%22a%22:1%7D` (plus `&_=<timestamp>` when `cache` is false).
- A `data` option you pass yourself is used as is: it is neither stringified nor turned into `q=`.

# Options

| Name | Type | Default | Shipped config | Description |
|---|---|---|---|---|
| `url` | string | `null` | — | Request URL; a string second argument sets it. |
| `referrer` | string | `window.location.href` when the request is created | — | Compared with the current URL by `urlSync`. |
| `contentType` | string | `"application/json; charset=utf-8"` | same | Forced to `"text/html; charset=UTF-8"` for page loads into an element. |
| `cache` | boolean | `false` | `true` | `jQuery.ajax` cache flag; `false` appends `_=<timestamp>` to GET URLs. |
| `async` | boolean | `true` | — | `jQuery.ajax` flag. |
| `type` | string | `"POST"` | `"POST"` | HTTP method. Forced to `"GET"` for page loads into an element. |
| `data` | any | `null` | — | Body. `null` means "derive from the first `N.comm` argument" (see Constructor). |
| `dataIsArray` | boolean | `false` | — | Send the whole wrapped array (`obj.get()`) instead of its first object. |
| `dataType` | string | `"json"` | — | Expected response type. Forced to `"html"` for page loads into an element. |
| `urlSync` | boolean | `true` | `true` | Data requests only: drop the response (abort, warn, skip the callback) when `location.href` changed since `referrer` was taken, ignoring `!`. Page loads into an element are never dropped. `N.tab` turns it off for the first tab load; `N.docs` passes its `urlSync` document option. |
| `crossDomain` | boolean | `false` | — | `jQuery.ajax` flag. |
| `browserHistory` | boolean | `true` | `false` | Declared but not read anywhere (`// TODO` in the code). |
| `append` | boolean | `false` | `false` | Page loads: `target.append(html)` instead of `target.html(html)`. |
| `replace` | boolean | not set | — | Page loads: hide the target, rename its id to `<id>_pending_to_remove`, insert the page after it, initialize the first following `.view_context__`, then remove the target. Not declared in the defaults or in `@types`. |
| `target` | NJS | `null` | — | The element that receives the page. `submit()` sets it for element communicators; `N.popup`, `N.tab` and `N.docs` set it too. `reload()` requires it. |

Defaults are the `NA.comm.request` constructor values; the "Shipped config" column is `architecture.comm.request.options` in the distributed `natural.config.js` (see [Configuration](../setup/configuration.md)).[^request][^submit] Any other `jQuery.ajax` setting (for example `headers`, `timeout`) is passed through; `beforeSend`, `success`, `error` and `complete` are overwritten by `submit()`.

# Methods

## `attr([name[, obj]])`

- `attr()` returns the attribute map (`attrObj`).
- `attr(name)` returns the stored value or `undefined`. `attr(name, undefined)` is also a getter.
- `attr(name, obj)` stores the value and returns `request.obj`, the communicator, so `.submit()` or another `.request.attr(...)` can follow.[^attr]
- Values are stored by reference and travel with the request object to the loaded page's controller.

## `removeAttr(name)`

Deletes one attribute and returns the request.

## `param([name])`

Parses the query string of `options.url`, the URL of this request, not the browser URL.[^param] `param()` returns an object of all parameters (`{}` when the URL has no `?`); `param(name)` returns one value. Values are decoded with `decodeURIComponent`; names are not decoded.

## `get([key])`

Returns the whole `options` object, or `options[key]`. Use it in a loaded page to inspect the request, for example `request.get("url")`.

## `reload([callback])`

Reloads the block page this request loaded: runs `this.options.target.comm(this.options.url)`, replaces the new communicator's request with this one (attributes set with `attr` are kept), and calls `submit(callback)`. The callback receives `(cont)`, the new controller, like any page-load callback. Returns the request.[^reload]

- Requires `options.target`, so it works only for block pages (loaded by `N.comm` into an element, or by `N.popup`, `N.tab`, `N.docs`), not for data requests.
- The page script runs again and creates a new Controller object, which gets `request` but not `caller`, `opener` or `docOpts`.
- Error handlers registered on the original communicator are not carried over.

# Pitfalls

A `data` object passed in the options is not JSON-stringified; jQuery form-encodes it while the `Content-Type` header still says JSON. Pass the object as the first argument instead.[^request]

```js
// Wrong (legacy): N.comm({ url: "save.json", data: { id: 1 } }).submit(cb);
N.comm({ id: 1 }, "save.json").submit(cb);
N.comm({ url: "save.json", data: JSON.stringify({ id: 1 }) }).submit(cb);
```

`attr(name, value)` returns the communicator, which has no `reload`. Set the attribute, then reload in a separate statement.[^attr]

```js
// Wrong (legacy): request.attr("param", { param: 1 }).reload();
request.attr("param", { param: 1 });
request.reload();
```

`param()` reads the request URL. To read the browser's query string use `location.search`.

```js
// Wrong (legacy): const id = request.param("id"); // expecting the address-bar parameter
const id = new URLSearchParams(location.search).get("id");
```

The legacy GET example shows an array and a percent-encoded colon. A single object is sent as an object, and `encodeURI` leaves `:` and `,` unescaped: `N.comm({ param: "value" }, { url: "data.json", type: "GET" })` requests `data.json?q=%7B%22param%22:%22value%22%7D`.

To pass parameters to a document opened by `N.docs`, set them on the `N.docs` instance's own request before `add` or `reload`; the next loaded document receives them and the map is cleared. See [N.docs](../ui-shell/documents.md).

# Known issues

* **GET parameters are encoded with `encodeURI`** - Actual: the constructor builds `"q=" + encodeURI(json)`, so `&`, `#`, `+`, `=` and `?` inside values are not escaped; a value such as `"a&b=c"` splits the query string on the server. Likely intent: `encodeURIComponent`. Workaround: use `POST`, or build the URL yourself: `N.comm({ url: "list.json?q=" + encodeURIComponent(JSON.stringify(params)), type: "GET" })`.[^request]
* **`param()` returns the string `"undefined"` for a name without a value** - Actual: for `page.html?flag`, `decodeURIComponent(undefined)` yields `"undefined"`, so the `|| true` fallback never applies (it applies only to `flag=`). Likely intent: `true`. Workaround: test `param("flag") !== undefined` for presence.[^param]
* **`N(selector).request()` is declared but not installed** - Actual: `src/natural.js.js` skips the key `request` when copying `NA.prototype` onto `jQuery.fn`, and `NA.prototype.request` would only read an element property named `request`. `@types` still declares `request(): NA.Request` on N objects. Likely intent: read the request of a loaded view. Workaround: `N(viewSelector).instance("cont").request`.[^factory][^prototype-request]

# Examples

Pass page parameters and read them in the loaded page:

```js
// caller
N(".page-0001").cont({
    init: function (view, request) {
        N("#section", view).comm("page.html")
            .request.attr("data1", { data: ["1", "2"] })
            .request.attr("data2", ["3", "4"])
            .submit();
    }
});

// page.html
N(".page-0002").cont({
    init: function (view, request) {
        const data1 = request.attr("data1");   // { data: ["1", "2"] }
        const data2 = this.request.attr("data2");   // ["3", "4"]
    }
});
```

Read request information and reload the page with a new parameter:

```js
N(".page-0002").cont({
    init: function (view, request) {
        N.log(request.get("url"), request.param());
    },
    refresh: function (id) {
        this.request.attr("id", id);
        this.request.reload(function (cont) {
            // cont: the new controller of the reloaded page
        });
    }
});
```

Send an array body:

```js
N([{ id: 1 }, { id: 2 }]).comm({ url: "save.json", dataIsArray: true }).submit();
```

# Related

- [N.comm](communicator.md) - creates the request and sends it with `submit`.
- [N.cont](controller.md) - `init(view, request)` and `this.request`.
- [Communication filter](communication-filter.md) - filters receive the request as their first argument.
- [N.docs](../ui-shell/documents.md) - `docs.request` for passing parameters between documents.
- [Configuration](../setup/configuration.md) - `architecture.comm.request.options`.

[^request]: NA.comm.request constructor (defaults and data serialization)
[^attr]: NA.comm.request.prototype.attr
[^param]: NA.comm.request.prototype.param
[^reload]: NA.comm.request.prototype.reload
[^submit]: NA.comm.submit (element-load overrides, urlSync, append, replace)
[^prototype-request]: NA.prototype.request
[^factory]: jQuery.fn installation (skips request)
