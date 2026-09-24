---
type: Guide
title: SPA frame with N.docs
description: Tutorial that builds a single-page application frame with a left menu block page and an N.docs container that opens menu pages as document tabs.
tags: [project, getting-started, spa, documents]
sources:
  - id: docs
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs implementation
    symbol: NUS.docs
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: eb0057a9f328
  - id: docs-plugin
    resource: ../../src/natural.ui.shell.js
    title: NUS.prototype.docs jQuery plugin wrapper
    symbol: NUS.prototype.docs
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: aa7bcbbe7baf
  - id: wrap
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.wrapEle (tab bar, close-all and menu-list button labels)
    symbol: NUS.docs.wrapEle
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: fdb34bdfc68d
  - id: add
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.prototype.add
    symbol: NUS.docs.prototype.add
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: b42ff40436e8
  - id: load
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.loadContent (page request, caller, init, docOpts, page context)
    symbol: NUS.docs.loadContent
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: dda3f0f1277e
  - id: remove
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.prototype.remove
    symbol: NUS.docs.prototype.remove
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: 6277b8e2d0ff
  - id: submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (page load into an element)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: cont
    resource: ../../src/natural.architecture.js
    title: NA.cont (page id and controller storage)
    symbol: NA.cont
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 8c6c783164aa
  - id: instance
    resource: ../../src/natural.core.js
    title: NC.prototype.instance (N(selector).instance)
    symbol: NC.prototype.instance
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: de8beae8138f
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-GETTINGSTARTED.md
    title: Legacy getting started guide, tutorial part (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

This tutorial builds the frame of a single-page application: a left menu loaded as a block page and an [N.docs](../ui-shell/documents.md) container on the right that opens each menu page as a document tab (MDI). Pages are fetched with Ajax and inserted into the frame, so the browser never navigates away from `index.html`. It continues [Your first page](first-page.md).

# Goal

`index.html` shows a menu with five entries; clicking an entry opens `html/contents/pageN.html` in its own tab, clicking it again re-activates that tab, and each page's controller `init` runs once when its tab is opened.

# Prerequisites

- [Your first page](first-page.md): block pages, `N.cont` and `N.comm` page loads.
- The Natural-JS files from [Installation](../setup/installation.md) and a static HTTP server.

# Steps

## 1. Create the project structure

```text
index.html                                 application frame (step 3)
html/index/lefter.html                     left menu block page (step 4)
html/contents/page1.html ... page5.html    menu pages (step 5)
js/natural_js/lib/jquery-3.7.1.min.js
js/natural_js/css/natural.ui.css           (with tokens.css, light.css, dark.css in the same folder)
js/natural_js/dist/natural.js.es6.min.js
js/natural_js/dist/natural.config.js
```

## 2. Keep the N.docs settings in natural.config.js

Use the shipped `natural.config.js` values here; if you changed them for [Your first page](first-page.md), restore them.

- `architecture.page.context` and `ui.alert.container` ship as `".docs__ > .docs_contents__.visible__"`. Every time `N.docs` loads or shows a document it overwrites both with that document's content section, so `N.alert` and `N.popup` dialogs of a page open inside its tab.[^load]
- `ui.shell.docs.message` must contain the current locale (`core.locale`); the MDI constructor reads its labels and throws when the locale entry is missing. See [natural.config.js](../setup/configuration.md).

## 3. Write the frame

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

<style>
html {
    height: 100%;
}
body {
    display: flex;
    flex-direction: row;
    font-size: 13px;
    margin: 0;
    height: 100%;
}
#lefter {
    flex: 1;
    max-width: 200px;
    border-right: 1px solid var(--md-sys-color-outline-variant);
    height: 100%;
}
#docs {
    flex: 1;
    height: 100%;
}
</style>

<script>
    jQuery(function () {
        // 1. Load the left menu block page; its init binds the menu clicks.
        N("#lefter").comm("html/index/lefter.html").submit(function (cont) {
            // 2. Create the one N.docs instance of the application.
            N("#docs").docs();
        });
    });
</script>
</head>
<body>
    <div id="lefter"></div>
    <!-- N.docs container -->
    <div id="docs"></div>
</body>
</html>
```

- `N("#lefter").comm(url).submit(callback)` inserts the menu page, runs its `init`, then calls `callback(cont)` with the menu controller.[^submit]
- `N("#docs").docs([opts])` creates the `N.docs` instance, builds the tab bar (MDI is the default, `multi: true`) and stores the instance on `#docs`; it returns the instance, not the jQuery collection.[^docs-plugin] Any page reads it back with `N("#docs").instance("docs")`.[^instance] Options such as `maxStateful`, `maxTabs` and `tabScroll` are listed in [N.docs](../ui-shell/documents.md).
- Create a single `N.docs` for the frame: each instance writes the global `page.context` and `alert.container` whenever it loads a document.[^load]
- `N.docs` does not change `location` when it opens or switches documents (only the optional `closeAllRedirectURL` navigates), so the address bar keeps showing `index.html`.[^docs]

## 4. Write the left menu

`html/index/lefter.html`:

```html
<style>
.index-lefter .menu a {
    text-decoration: none;
    line-height: 2em;
    color: inherit;
}
</style>

<article class="index-lefter">
    <ul class="menu">
        <li><a href="html/contents/page1.html" data-docid="page1">MENU-1</a></li>
        <li><a href="html/contents/page2.html" data-docid="page2">MENU-2</a></li>
        <li><a href="html/contents/page3.html" data-docid="page3">MENU-3</a></li>
        <li><a href="html/contents/page4.html" data-docid="page4">MENU-4</a></li>
        <li><a href="html/contents/page5.html" data-docid="page5">MENU-5</a></li>
    </ul>
</article>

<script type="text/javascript">
N(".index-lefter").cont({
    init: function (view, request) {
        N(".menu", view).on("click", "a", function (e) {
            e.preventDefault();
            const a = N(this);
            N("#docs").instance("docs").add(a.data("docid"), a.text(), {
                url: a.attr("href")
            });
        });
    }
});
</script>
```

- `add(docId, docNm, docOpts)`: `docId` identifies the document and becomes the CSS class `{docId}__` of its tab and content section, so use letters, digits, `-` and `_` only; `docNm` is the tab label; `docOpts.url` is the block page URL.[^add]
- Calling `add()` for a `docId` that already has a tab only activates it; the page is not reloaded.[^add]
- `e.preventDefault()` keeps the browser from following the link; the `href` doubles as the page URL, relative to `index.html`.
- The `<style>` element is ordinary global CSS. It affects only this page because every selector starts with the view class `.index-lefter`, and it disappears together with the page's HTML.

## 5. Write the menu pages

`html/contents/page1.html`:

```html
<style>
    .page1 .text {
        text-align: center;
    }
</style>

<article class="page1">
    <p class="text">page1</p>
</article>

<script type="text/javascript">
N(".page1").cont({
    init: function (view, request) {
        // this.caller is the N.docs instance that loaded this page.
        // this.docOpts ({ docId, docNm, url, ... }) is set after init returns.
    }
});
</script>
```

Create `page2.html` to `page5.html` the same way, changing the class (`page2`, ...) in the style, the view and the `cont` selector, and the text.

How `N.docs` loads a page:[^load]

1. Appends a hidden `section.docs_contents__.{docId}__` to the container and fires `onBeforeLoad`.
2. Fetches the page with `N.comm` (`type: "GET"`, `dataType: "html"`), inserts it into the section and finds the controller as `section > .view_context__:last`.
3. Sets `cont.caller` to the `N.docs` instance, runs `init(view, request)` through `N.cont.trInit`, then sets `cont.docOpts`, activates the tab and fires `onLoad`.

When the user closes a tab, `remove(docId)` removes the tab and its section with every element and handler inside, including the page's `<style>`. If an input in the page carries `data_changed__` (edited in an `N.form`, `N.list` or `N.grid`), it first asks for confirmation.[^remove]

## 6. Run it

Serve the project folder and open `index.html` through the HTTP server.

# Verify

- The menu appears on the left; clicking MENU-1 opens a tab "MENU-1" showing "page1". Clicking MENU-1 again only re-activates the tab.
- Opening several entries shows one tab per entry next to the close-all and menu-list buttons. Their labels come from `ui.shell.docs.message` for the current `core.locale`: with the shipped `"ko_KR"` they read "전체 닫기" and "메뉴 목록", with `"en_US"` they read "Close all" and "Menu list".[^wrap] A tab's close button removes it (the button is hidden while only one tab is open).
- In the console, `N("#docs").instance("docs").doc()` lists the opened documents, `N("#docs").instance("docs").cont("page1")` returns the page1 controller, and `N.context.attr("architecture").page.context` is the jQuery object of the active section.

# Pitfalls

The controller selector must match the view class. The legacy page1 declared `class="page1"` and selected `.page01`, so `init` never ran.[^cont]

```html
// Wrong (legacy): <article class="page1"> ... </article> <script> N(".page01").cont({ ... }); </script>
<article class="page1"> ... </article> <script> N(".page1").cont({ ... }); </script>
```

The legacy frame kept the instance in an implicit global created by assignment. That depends on non-strict scripts, and until the assignment `window.docs` resolves to the `<div id="docs">` element through the browser's named element access; a top-level `let docs` or `const docs` does not create `window.docs` at all. Read the instance from its element instead.[^instance]

```js
// Wrong (legacy): window.docs; docs = N("#docs").docs(); ... window.docs.add(docId, docNm, { url: url });
N("#docs").docs();
N("#docs").instance("docs").add(docId, docNm, { url: url });
```

The legacy frame loaded `js/natural_js/natural.js.min.js` and `js/natural_js/natural.config.js`, which do not exist; load a `dist/` bundle and `dist/natural.config.js` as in [Installation](../setup/installation.md).

- A page View wrapped in another element is never found: `N.docs` only looks at the direct children of the content section.
- `add()` takes three arguments; there is no `title` or `params` option. Pass page parameters with `docs.request.attr(name, value)` before `add()`, and use `reload(docId)` to refresh an open document. See [N.docs](../ui-shell/documents.md).
- `this.docOpts` is `undefined` inside `init`; read it in later functions or in the `onLoad` event.
- A page reloaded with `request.reload()` or `docs.reload(docId)` gets a new controller without `caller` and `docOpts`. See [N.cont](../architecture/controller.md).
- Write `N.docs` event handlers as `function` when they use `this` (the `N.docs` instance, except in `onRemoveState`).

# Next

- [Grid CRUD walkthrough](grid-crud-walkthrough.md) - add a menu page that searches, adds, deletes and saves rows with `N.grid`.
- [N.docs](../ui-shell/documents.md) - every option, method and event of the document container.
- [N.cont](../architecture/controller.md) - `caller`, `docOpts` and `init` of loaded pages.
- [CVC pattern](../architecture/cvc-pattern.md) - how the different loaders find and initialize a controller.
- [natural.config.js](../setup/configuration.md) - `page.context`, `alert.container` and the `ui.shell` block.

[^docs]: NUS.docs implementation
[^docs-plugin]: NUS.prototype.docs jQuery plugin wrapper
[^wrap]: NUS.docs.wrapEle (tab bar, close-all and menu-list button labels)
[^add]: NUS.docs.prototype.add
[^load]: NUS.docs.loadContent (page request, caller, init, docOpts, page context)
[^remove]: NUS.docs.prototype.remove
[^submit]: NA.comm.submit (page load into an element)
[^cont]: NA.cont (page id and controller storage)
[^instance]: NC.prototype.instance (N(selector).instance)
