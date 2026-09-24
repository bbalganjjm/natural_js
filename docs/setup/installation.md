---
type: Guide
title: Installation
description: How to add Natural-JS to a web page with jQuery, one dist bundle, natural.config.js and natural.ui.css, in the right order.
tags: [project, setup, installation]
sources:
  - id: package
    resource: ../../package.json
    title: package.json (package name, dependencies, main, types)
    git_blob: 877da009582de8a7466890a65ef468ecbec3d025
  - id: js
    resource: ../../src/natural.js.js
    title: natural.js.js (NJS extends jQuery, window.N)
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: core
    resource: ../../src/natural.core.js
    title: NC class (static members that read jQuery at load time)
    symbol: NC.isPlainObject
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 8f4769f069b6
  - id: css
    resource: ../../css/natural.ui.css
    title: natural.ui.css (imports tokens.css, light.css, dark.css)
    git_blob: 7e2005229a00223490701634d4d52b5983233e4c
  - id: build-all
    resource: ../../compiler/minify-all-version.sh
    title: minify-all-version.sh (the eight bundles)
    git_blob: 61d8eb82143e4189aeb284d4956353fdbc05b42a
  - id: submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (loads a block page and runs its controller init)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-GETTINGSTARTED.md
    title: Legacy getting started guide, setup part (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

Natural-JS runs in the browser from four pieces: jQuery 3.7.1, one prebuilt bundle from `dist/`, your copy of `dist/natural.config.js`, and `css/natural.ui.css`. This guide gets those files into a page in the right order and ends with a minimal page that loads a first block page.

# Goal

A page where `window.N` exists, `N.context` holds your configuration, and a block page loaded with `N.comm` runs its controller.

# Prerequisites

- An HTTP server for the page, its block pages and JSON data: `N.comm` loads them with `jQuery.ajax` (`N.ajax`).
- Node.js and npm if you install from npm; otherwise a copy of the GitHub repository (https://github.com/bbalganjjm/natural_js).

# Steps

## 1. Get the files

```sh
npm install @bbalganjjm/natural_js
```

The files land in `node_modules/@bbalganjjm/natural_js/`; npm also installs `jquery` 3.7.1 as a dependency.[^package] The repository layout is the same, so you can copy the folders from a clone instead. Copy what the page needs into your web root, for example under `js/natural_js/`.

## 2. Pick the files

| File | Needed | Why |
|---|---|---|
| `lib/jquery-3.7.1.min.js` (or `node_modules/jquery/dist/jquery.min.js`) | yes | `NJS` extends `jQuery`, and several static members are copied from jQuery while the bundle loads (`NC.isPlainObject = jQuery.isPlainObject`).[^js][^core] |
| One `dist/natural.js*.min.js` bundle | yes | The library; it defines `window.N`.[^js] |
| `dist/natural.config.js` (your edited copy) | yes | Fills `N.context`; see [natural.config.js](configuration.md). |
| `css/natural.ui.css` with `tokens.css`, `light.css`, `dark.css` in the same folder | for UI components | `natural.ui.css` imports the other three itself (`light.css` or `dark.css` by `prefers-color-scheme`), so link only `natural.ui.css`.[^css] |
| `dist/*.min.map` | optional | Source maps for the matching bundle. |

Choose one bundle:[^build-all]

| Bundle | Contains |
|---|---|
| `natural.js.es6.min.js` / `natural.js.es5.min.js` | CORE, ARCHITECTURE, DATA, UI, UI.Shell |
| `natural.js+code.es6.min.js` / `.es5` | the above + Natural-CODE (`N.code`) |
| `natural.js+template.es6.min.js` / `.es5` | the above + Natural-TEMPLATE (`N.template`) |
| `natural.js+code+template.es6.min.js` / `.es5` | the above + both |

`es6` bundles are compiled to ECMAScript 2015, `es5` bundles to ECMAScript 5 with polyfills; use `es5` only for browsers without ES2015 support. How the bundles are built: [Build and dist bundles](build-and-dist.md).

## 3. Add the tags in order

```html
<link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css">
<script src="js/natural_js/lib/jquery-3.7.1.min.js"></script>
<script src="js/natural_js/dist/natural.js+code+template.es6.min.js"></script>
<script src="js/natural_js/dist/natural.config.js"></script>
```

jQuery must come before the bundle, and the bundle before `natural.config.js`, which calls `N.context.attr`, `N.browser.is` and `$.extend(N.formatter, ...)`. The bundles and the config file are classic scripts (no `import`/`export`), so load them with plain `<script>` tags as above.

## 4. Point the configuration at your container

In your copy of `natural.config.js`, set `N.context.attr("architecture").page.context` and `N.context.attr("ui").alert.container` to the element that will host block pages (for example `"#contents"`, or `"body"` for a page that is not an SPA). The shipped values point at the `N.docs` container and only work with `N.docs`. Details: [natural.config.js](configuration.md).

## 5. Write a minimal page

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
        N("#contents").comm("block01.html").submit();
    });
</script>
</head>
<body>
    <div id="contents"></div>
</body>
</html>
```

`block01.html`, a block page (view first, controller script right after it):

```html
<article id="block01">
    <p id="message"></p>
</article>

<script>
N("#block01").cont({
    init: function (view, request) {
        N("#message", view).text("Loaded " + request.get("url"));
    }
});
</script>
```

When `N(element).comm(url).submit()` loads HTML into an element, it inserts the page and then calls the controller's `init(view, request)`.[^submit] A controller on a page that is not loaded this way (or by `N.popup`, `N.tab`, `N.docs`) never gets `init` called.

# Verify

- Open `index.html` through the HTTP server; the text "Loaded block01.html" appears.
- In the browser console, `N.version` shows the package versions and `N.context.attr("architecture").page.context` shows `"#contents"`.
- No `N is not defined` or "Container element is missing" errors appear in the console.

# Pitfalls

The legacy npm command used `@` instead of `/`:

```sh
// Wrong (legacy): npm install @bbalganjjm@natural_js
npm install @bbalganjjm/natural_js
```

There is no `natural.js.min.js` file, and `natural.config.js` lives in `dist/`:

```html
// Wrong (legacy): <script src="js/natural_js/natural.js.min.js"></script>
<script src="js/natural_js/dist/natural.js.es6.min.js"></script>
// Wrong (legacy): <script src="js/natural_js/natural.config.js"></script>
<script src="js/natural_js/dist/natural.config.js"></script>
```

Mixing module and classic tags reorders execution: a `type="module"` script is deferred, so a classic `natural.config.js` after a module bundle runs first and fails with `N is not defined`:

```html
// Wrong (legacy): <script type="module" src="dist/natural.js+code+template.es6.min.js"></script> followed by <script type="text/javascript" src="dist/natural.config.js"></script>
<script src="dist/natural.js+code+template.es6.min.js"></script>
<script src="dist/natural.config.js"></script>
```

- The package files cannot be loaded one by one (the legacy "natural.core.js only" lists). The sources in `src/` are ES modules that import each other: `natural.core.js` imports `natural.js.js` and `natural.architecture.js`, and `natural.js.js` imports all five packages. Use a `dist/` bundle.
- The bundles are about 290 KB to 320 KB minified, not the 145 KB the legacy guide mentions.
- The alert container key is `alert.container`, not `alert.context`.
- The block page's controller selector must select the view element above it: `N("#block01").cont(...)` for `<article id="block01">`, not `N(".block01")`.
- `package.json` `main` and `types` point to files that do not exist, so `require("@bbalganjjm/natural_js")` and automatic type discovery do not work. Load the bundle with a `<script>` tag; see [Build and dist bundles](build-and-dist.md) and [TypeScript](typescript.md).

# Next

- [First page](../getting-started/first-page.md) - build a block page that loads and shows data.
- [natural.config.js](configuration.md) - every configuration key.
- [TypeScript](typescript.md) - type declarations and tsconfig setup.
- [Build and dist bundles](build-and-dist.md) - rebuild or customize the bundles.
- [Natural-JS](../overview/natural-js.md) - packages and the global `N`.

[^package]: package.json (package name, dependencies, main, types)
[^js]: natural.js.js (NJS extends jQuery, window.N)
[^core]: NC class (static members that read jQuery at load time)
[^css]: natural.ui.css (imports tokens.css, light.css, dark.css)
[^build-all]: minify-all-version.sh (the eight bundles)
[^submit]: NA.comm.submit (loads a block page and runs its controller init)
