---
type: Guide
title: Your first page
description: Tutorial that writes a block page (View plus N.cont controller), fetches JSON with N.comm and loads the page from an index page.
tags: [project, getting-started, tutorial, block-page]
sources:
  - id: cont
    resource: ../../src/natural.architecture.js
    title: NA.cont (page id, view_context__, instance storage)
    symbol: NA.cont
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 8c6c783164aa
  - id: trinit
    resource: ../../src/natural.architecture.js
    title: NA.cont.trInit (request injection and init call)
    symbol: NA.cont.trInit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 82ac411abe72
  - id: comm
    resource: ../../src/natural.architecture.js
    title: NA.comm constructor (argument resolution)
    symbol: NA.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 40c48fda4ea0
  - id: submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (page insertion, controller lookup, callback arguments)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: request
    resource: ../../src/natural.architecture.js
    title: NA.comm.request (default request options)
    symbol: NA.comm.request
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: b2f7caecba91
  - id: alert
    resource: ../../src/natural.ui.js
    title: NU.alert constructor (container lookup)
    symbol: NU.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5933b105d560
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-GETTINGSTARTED.md
    title: Legacy getting started guide, tutorial part (removed)
generated: { by: codex/gpt-6-sol, at: 2026-09-24T05:37:38Z }
---

This tutorial builds the smallest complete Natural-JS application: an index page that loads one block page, whose controller fetches JSON from the server with `N.comm` and shows it. It applies the rules every later page relies on: the View comes first, the controller script right after it, and every selection is scoped to the view. Finish [Installation](../setup/installation.md) first.

# Goal

A browser page where `index.html` loads `block01.html` into `#contents`, the block page's `init(view, request)` runs, and the rows of `data.json` appear on screen.

# Prerequisites

- The Natural-JS files copied into your web root as described in [Installation](../setup/installation.md).
- A static HTTP server for the project folder. `N.comm` loads pages and data with `jQuery.ajax`, so opening `index.html` from the file system does not work.
- The block page layout rules from [CVC pattern](../architecture/cvc-pattern.md) (read it now or after this tutorial).

# Steps

## 1. Lay out the project

```text
index.html
block01.html
data.json
js/natural_js/lib/jquery-3.7.1.min.js
js/natural_js/css/natural.ui.css      (with tokens.css, light.css, dark.css in the same folder)
js/natural_js/dist/natural.js.es6.min.js
js/natural_js/dist/natural.config.js
```

Any bundle from `dist/` works; this tutorial uses `natural.js.es6.min.js`. See [Installation](../setup/installation.md) for the choice.

## 2. Point the configuration at your container

The shipped `natural.config.js` targets the [N.docs](../ui-shell/documents.md) content area, which this page does not have. In your copy of `dist/natural.config.js`, change only the existing `architecture.page.context` and `ui.alert.container` values. You can also append these assignments after the existing `N.context.attr(...)` calls:

```js
N.context.attr("architecture").page.context = "#contents";
N.context.attr("ui").alert.container = "#contents";
```

- `architecture.page.context` is the main content element. When `N.comm` loads HTML into that element, it first runs `N.gc[N.context.attr("core").gcMode]()` to release the handlers of the previous page's components.[^submit] See [N.gc](../core/gc.md).
- `ui.alert.container` receives the dialogs of `N.alert` and `N.popup`. The `N.alert` constructor throws "Container element is missing" when the selector matches nothing.[^alert]
- Optional: set `core.locale` to `"en_US"` for English component labels (the shipped value is `"ko_KR"`). Every key is listed in [natural.config.js](../setup/configuration.md).

## 3. Create the JSON data

`data.json` in the project root:

```json
[
  {
    "name": "Dean Stanley",
    "gender": "male",
    "email": "deanstanley@example.com",
    "eyeColor": "green",
    "age": "26",
    "registered": "20140220",
    "isActive": "Y"
  },
  {
    "name": "Lora Hunt",
    "gender": "female",
    "email": "lorahunt@example.com",
    "eyeColor": "blue",
    "age": "31",
    "registered": "20150611",
    "isActive": "N"
  }
]
```

Natural-JS components bind arrays of flat objects, and each property name matches the `id` of an element in the component's markup. The [Grid CRUD walkthrough](grid-crud-walkthrough.md) reuses this file; the values are strings for the reason given in its Pitfalls.

## 4. Write the block page

`block01.html`:

```html
<article class="block01">
    <h2>Employees</h2>
    <pre id="result"></pre>
</article>

<script type="text/javascript">
N(".block01").cont({
    init: function (view, request) {
        N.comm({ url: "data.json", type: "GET" }).submit(function (data, req) {
            N("#result", view).text(JSON.stringify(data, null, 2));
        });
    }
});
</script>
```

- **View**: one top-level element with a page-unique class. **Controller**: the script right after it calls `N(selector).cont({...})` with a selector that matches that element.
- `N(".block01").cont(obj)` sets `data-pageid="block01"` and the class `view_context__` on the view, stores `obj` on it (`N(".block01").instance("cont")`), sets `obj.view` and returns `obj`. It does not call `init`.[^cont]
- `init(view, request)` is called later by the loader with `this` bound to the controller object; `view` is the View element and `request` is the request that loaded the page.[^trinit]
- `N("#result", view)` scopes the selection to this page, so it cannot hit an element of another block page loaded at the same time.
- `N.comm({ url, type })` with one plain object is a data request without a body.[^comm] `type: "GET"` is set because the default is `"POST"` (the `NA.comm.request` default and the shipped `architecture.comm.request.options.type`), and static file servers usually refuse POST.[^request] Against a real API, keep POST and pass the parameters first: `N.comm({ deptCd: "D01" }, "api/employees").submit(...)` or `N({ deptCd: "D01" }).comm("api/employees").submit(...)`.
- The callback of a data request receives `(data, request)` with `this` bound to the communicator. `dataType` defaults to `"json"`, so `data` is already parsed.[^submit] Details: [N.comm](../architecture/communicator.md) and [N.comm.request](../architecture/request.md).

## 5. Create the index page

`index.html`:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Natural-JS</title>
<link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css">
<script src="js/natural_js/lib/jquery-3.7.1.min.js"></script>
<script src="js/natural_js/dist/natural.js.es6.min.js"></script>
<script src="js/natural_js/dist/natural.config.js"></script>
<script>
    jQuery(function () {
        N(N.context.attr("architecture").page.context).comm("block01.html").submit();
    });
</script>
</head>
<body>
    <!-- architecture.page.context element -->
    <div id="contents"></div>
</body>
</html>
```

`N(element).comm(url).submit([callback])` is a page load:[^submit]

1. The request is forced to `type: "GET"`, `dataType: "html"` and `contentType: "text/html; charset=UTF-8"`.
2. Because the target is the page context, `N.gc` runs, then the HTML is inserted with `html()`. jQuery runs the inline script during insertion, so `N(".block01").cont({...})` registers the controller.
3. The controller is found as `#contents > .view_context__:last`, and `N.cont.trInit` sets `cont.request` and calls `cont.init(cont.view, request)`.[^trinit]
4. An optional `callback(cont)` then receives the loaded controller.

## 6. Run it

Serve the project folder with any static HTTP server and open `index.html` through it (for example `http://localhost:8080/index.html`).

# Verify

- The page shows "Employees" and the two rows of `data.json` as JSON text.
- In the browser console, `N(".block01").instance("cont")` returns the controller object and `N(".block01").attr("data-pageid")` returns `"block01"`.
- The network panel shows `block01.html` and `data.json` loaded with GET and status 200; the console shows no "Container element is missing" error.

# Pitfalls

The controller selector must select the View element above it. The legacy sample declared `id="block01"` and selected `.block01`, so `N.cont` bound an empty set, `N.comm` found no `.view_context__` child and `init` never ran, without any error.[^cont][^submit]

```html
// Wrong (legacy): <article id="block01"> ... </article> <script> N(".block01").cont({ ... }); </script>
<article class="block01"> ... </article> <script> N(".block01").cont({ ... }); </script>
```

There is no `natural.js.min.js`, and `natural.config.js` lives in `dist/`. See [Installation](../setup/installation.md).

```html
// Wrong (legacy): <script type="text/javascript" src="js/natural_js/natural.js.min.js"></script>
<script src="js/natural_js/dist/natural.js.es6.min.js"></script>
// Wrong (legacy): <script type="text/javascript" src="js/natural_js/natural.config.js"></script>
<script src="js/natural_js/dist/natural.config.js"></script>
```

`N.comm(url)` sends POST by default. A static file server usually answers a POST to `data.json` with an error status, and without an `error()` handler `N.comm` then throws `NC.error("NA.comm.submit.error(url:...)")`.[^request][^submit]

```js
// Wrong (legacy): N.comm("data.json").submit(callback); // POST to a static file
N.comm({ url: "data.json", type: "GET" }).submit(callback);
```

- Opening `block01.html` directly, or pasting the block into server-rendered markup, declares the controller but never calls `init`: only `N.comm` (element target), `N.popup`, `N.tab` and `N.docs` call `N.cont.trInit`. See [N.cont](../architecture/controller.md).
- Wrapping the View in another element (`<div><article class="block01">`) hides it: the loader only looks at direct children of the container.
- Write `init` as `function` or method shorthand. An arrow function does not get the controller as `this`, so `this.request` (and, for pages loaded by components, `this.caller`) is unavailable.
- Relative URLs in a block page, such as `data.json`, are resolved against the address of `index.html`, not against the block page file, because the page runs inside `index.html`.
- Leaving the shipped `page.context` / `alert.container` in a page without `N.docs` makes every `N.alert` and `N.popup` throw "Container element is missing".[^alert]

# Next

- [SPA frame with N.docs](spa-frame-with-docs.md) - turn the index page into an application frame with a menu and document tabs.
- [CVC pattern](../architecture/cvc-pattern.md) - the full load sequence and block page rules.
- [N.cont](../architecture/controller.md) - the controller object, `init`, `request`, `caller`.
- [N.comm](../architecture/communicator.md) and [N.comm.request](../architecture/request.md) - data requests, page loads, request options.
- [natural.config.js](../setup/configuration.md) - `page.context`, `alert.container` and the other settings.

[^cont]: NA.cont (page id, view_context__, instance storage)
[^trinit]: NA.cont.trInit (request injection and init call)
[^comm]: NA.comm constructor (argument resolution)
[^submit]: NA.comm.submit (page insertion, controller lookup, callback arguments)
[^request]: NA.comm.request (default request options)
[^alert]: NU.alert constructor (container lookup)
