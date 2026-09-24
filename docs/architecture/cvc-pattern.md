---
type: Architecture Pattern
title: CVC pattern
description: Communicator-View-Controller, the Natural-JS client architecture in which each block page is a View plus one Controller object, loaded and initialized by N.comm.
tags: [architecture, cvc, controller, block-page]
sources:
  - id: cont
    resource: ../../src/natural.architecture.js
    title: NA.cont constructor (pageid, view_context__, instance storage)
    symbol: NA.cont.prototype.constructor
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 2d87d7820d7f
  - id: trinit
    resource: ../../src/natural.architecture.js
    title: NA.cont.trInit (request injection, AOP, init call)
    symbol: NA.cont.trInit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 82ac411abe72
  - id: submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (page insertion and controller lookup)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: popup-load
    resource: ../../src/natural.ui.js
    title: NU.popup.loadContent
    symbol: NU.popup.loadContent
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: fd1fdf575851
  - id: tab-load
    resource: ../../src/natural.ui.js
    title: NU.tab.loadContent
    symbol: NU.tab.loadContent
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 285ba8440b52
  - id: docs-load
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.loadContent
    symbol: NUS.docs.loadContent
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: dda3f0f1277e
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE.md
    title: Legacy developer guide hub (removed)
  - id: legacy-architecture
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-ARCHITECTURE.md
    title: Legacy Natural-ARCHITECTURE guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

CVC (Communicator-View-Controller) is the MVC variant Natural-JS uses on the client: the whole server is the Model, and the browser side is split into a Communicator (`N.comm`), a View (plain HTML) and a Controller object (`N.cont`). Every screen is a **block page**, an HTML fragment that holds one View and the script that declares its Controller. Read this page before writing any Natural-JS page; it defines how a page is loaded, when `init` runs and why selections must be scoped to the view.

# Intent

- Keep client code independent of server technology: the client talks to the server only through `N.comm` with JSON or HTML.
- Separate markup (View, owned by designers) from behavior (Controller object, owned by developers).
- Make every block page self-contained so it can be loaded into a container, a popup, a tab or a document tab with the same code.

# Participants

| Role | Natural-JS object | Responsibility |
|---|---|---|
| Model | the server | Returns JSON data or HTML block pages. |
| Communicator | [`N.comm`](communicator.md) and its [`request`](request.md) | Sends Ajax requests, runs [communication filters](communication-filter.md), inserts HTML pages and starts their controllers. |
| View | the block page's root element | Plain HTML, no separate implementation. It becomes the controller's `view` and gets the class `view_context__` and a `data-pageid` attribute. |
| Controller | the object passed to [`N(".page-id").cont({...})`](controller.md) | Holds `init` and the page's functions; controls the View and the data returned by the Communicator. [AOP](aop.md) advisors can wrap its functions. |
| Context | [`N.context`](context.md) | Application-wide store for configuration (`natural.config.js`) and shared data for the lifetime of the document. |

# Lifecycle

Loading a block page with `N("#container").comm("page.html").submit(callback)` runs these steps:[^submit]

1. **Construct** (`NA.comm` constructor): the filter configuration is built on first use, `beforeInit` filters run, and a `NA.comm.request` is created with its options merged from defaults, `N.context.attr("architecture").comm.request.options` and the call's options.
2. **Submit** (`NA.comm.submit`): because the communicator wraps an element, the request is forced to `type: "GET"`, `dataType: "html"`, `contentType: "text/html; charset=UTF-8"`, and `request.options.target` is set to the container. `afterInit` filters run, then `jQuery.ajax` is called; `beforeSend` filters run inside it.
3. **Insert**: `success` filters run (they may replace the HTML). If the container matches `N.context.attr("architecture").page.context`, `N.gc[N.context.attr("core").gcMode]()` runs first. The HTML is inserted with `html()` (or `append()` / `replace` behavior, see [request options](request.md)); jQuery executes the page's inline `<script>` during insertion.
4. **Declare**: the page script calls `N(".page-id").cont({...})`. The `NA.cont` constructor sets `data-pageid`, adds the class `view_context__`, stores the object with `instance("cont", contObj)` and sets `contObj.view`. It does **not** call `init`.[^cont]
5. **Clean up**: if the container is not the page context, `N.gc.ds()` removes stale DataSync observers.
6. **Initialize** (`NA.cont.trInit`): the controller is looked up as `container.children(".view_context__:last").instance("cont")` (with `replace`, the first following sibling `.view_context__`); `trInit` sets `cont.request`, applies AOP advisors (`NA.cont.aop.wrap`), then calls `cont.init(cont.view, request)`.[^trinit]
7. **Callback**: `callback.call(comm, cont)` receives the new controller (or `undefined` if the page declared none).
8. **Complete**: `complete` filters run.

Popups, tabs and document tabs load the page as a data request (`new NA.comm({ url, dataType: "html", type: "GET" })`), insert it themselves, inject a `caller` before `init`, then fire their own events:[^popup-load][^tab-load][^docs-load]

| Loader | Controller lookup | Injected before `init` | Order after insertion |
|---|---|---|---|
| `N(el).comm(url).submit(cb)` | `el.children(".view_context__:last")` | `request` | `init` → `cb(cont)` |
| `N().popup({ url })` | top-level `filter(".view_context__:last")` of the loaded HTML | `request`, `caller` (the `N.popup`), `opener` (see [N.cont Known issues](controller.md)) | first `open()`: `init` → `onOpen` method → `onLoad`; with `preload: true`: `init` → `onLoad`, `onOpen` on each later `open()` |
| `N.tab` tab with `url` | `content.children(".view_context__:last")` | `request`, `caller` (the `N.tab`), `opener` | `init` → `onLoad` → `onActive` → per-tab `onOpen` method |
| `N.docs` document | `target.children(".view_context__:last")` | `request`, `caller` (the `N.docs`) | `init` → `cont.docOpts` is set → `onLoad` |

# Rules

**Block page layout.** A block page file is an optional `<style>`, one root View element carrying a unique page-id class, and a `<script>` that declares the controller right after the View:

```html
<style>
    .page-0001 .result { padding: 10px; }
</style>

<article class="page-0001">
    <p class="result"></p>
</article>

<script type="text/javascript">
    N(".page-0001").cont({
        init: function (view, request) {
            N(".result", view).text("loaded");
        }
    });
</script>
```

**The View must be a top-level element of the file.** Every loader looks for `.view_context__` among the *direct children* of the container (popup: top-level nodes of the fetched HTML) and takes the last one. A View nested inside a wrapper element is never found, so `init` never runs.[^submit]

**Scope every selection to the view.** Several block pages live in one document at once, so always pass `view` as the context argument (`N("selector", view)`, `$("selector", view)`) or use `view.find(...)`. An unscoped selector can hit elements of another page.

**Use a page-unique class for the view selector.** The selector passed to `N(...).cont()` is evaluated against the whole document, not the container.

**Load pages only through a loader.** `init` is called only by `NA.cont.trInit`, which only `N.comm` (element target), `N.popup`, `N.tab` and `N.docs` call. A page opened directly in the browser runs `N(...).cont({...})` but never `init`, unless you call `N.cont.trInit(cont, request)` yourself (see [N.cont](controller.md)).

**Page id (`data-pageid`).** The `NA.cont` constructor writes `data-pageid` on the View:[^cont]

- If the View element has an `id`, the id is used verbatim (no characters removed).
- Otherwise the selector string is used with these characters removed: `.` `#` `[` `]` `'` `:` `(` `)` `>` space `-`. The double quote `"` is **not** removed. `N(".page-0001").cont({...})` gives `data-pageid="page0001"`; `N("page.view-01").cont({...})` gives `pageview01`.
- When the argument is an element instead of a string, the selector is derived as `tag#id.class1.class2` (`NC.toSelector`), for example `articlepage0001` for `<article class="page-0001">`.
- If the same page is loaded twice (same id on several elements, or the selector matches several elements), the constructor re-selects with `:not([data-pageid])`, so only the newly inserted copy is bound. The re-selection runs against the whole document.
- Natural-TEMPLATE uses the page id as the jQuery event namespace (`click.<pageid>`), so keep it free of the removed characters and unique per page.

**Main content container.** `N.context.attr("architecture").page.context` names the element that holds the main content (the shipped config uses the `N.docs` content area; a non-SPA site uses `"body"`). Loading a page *into* that element first runs `N.gc[N.context.attr("core").gcMode]()` (`"full"` in the shipped config), which unbinds the document-level handlers of the previous page's components. See [Configuration](../setup/configuration.md) and [N.gc](../core/gc.md).

# Pitfalls

`init` runs only when a loader inserts the page. Opening `page.html` directly, or including the block in server-rendered markup, declares the controller but never initializes it. Load the page with `N.comm`, or initialize a statically included view yourself:[^trinit]

```js
N("#container").comm("page.html").submit();   // normal case: N.comm inserts the page and calls init

const cont = N(".page-0001").cont({ init: function (view, request) { /* ... */ } });
N.cont.trInit(cont);                          // static markup: applies AOP, then calls init(view, undefined)
```

Wrapping the View in another element (`<div class="wrapper"><article class="page-0001">`) hides it from every loader, because the lookup only checks direct children of the container.

A page that is re-loaded with `request.reload()` or `N.docs.reload(docId)` goes through the `N.comm` element path, which does not inject `caller`, `opener` or `docOpts` into the new controller.

The page id of a View that has an `id` attribute is the raw id, hyphens included; only selector-derived ids are stripped.[^cont]

# Related

- [N.cont](controller.md) - the controller object, its injected properties and `init` / `onOpen`.
- [N.comm](communicator.md) - loading pages and data; `submit` callback arguments.
- [N.comm.request](request.md) - page parameters (`request.attr`) and request options.
- [Controller AOP](aop.md) - wrapping controller functions with advisors.
- [Configuration](../setup/configuration.md) - `architecture.page.context` and the rest of `natural.config.js`.
- [First page](../getting-started/first-page.md) - a step-by-step block page.

[^submit]: NA.comm.submit (page insertion and controller lookup)
[^cont]: NA.cont constructor (pageid, view_context__, instance storage)
[^trinit]: NA.cont.trInit (request injection, AOP, init call)
[^popup-load]: NU.popup.loadContent
[^tab-load]: NU.tab.loadContent
[^docs-load]: NUS.docs.loadContent
