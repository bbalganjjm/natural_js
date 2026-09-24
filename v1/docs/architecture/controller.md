---
type: API Reference
title: N.cont
description: Registers a block page's Controller object on its View element; the loader later injects request, caller and opener and calls its init function.
tags: [architecture, controller, block-page, lifecycle]
symbols: [N.cont, N().cont, NA.cont, NA.prototype.cont, NA.cont.trInit, N.cont.trInit, NA.Controller, NA.Objects.Controller.Object, cont.init, cont.view, cont.request, cont.caller, cont.opener, cont.docOpts, view_context__, data-pageid]
sources:
  - id: cont
    resource: ../../src/natural.architecture.js
    title: NA.cont constructor
    symbol: NA.cont.prototype.constructor
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 2d87d7820d7f
  - id: cont-plugin
    resource: ../../src/natural.architecture.js
    title: NA.prototype.cont jQuery plugin wrapper
    symbol: NA.prototype.cont
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 631524239e47
  - id: trinit
    resource: ../../src/natural.architecture.js
    title: NA.cont.trInit
    symbol: NA.cont.trInit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 82ac411abe72
  - id: popup-ctor
    resource: ../../src/natural.ui.js
    title: NU.popup constructor (opener option handling)
    symbol: NU.popup.prototype.constructor
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 9b47da8caef3
  - id: popup-load
    resource: ../../src/natural.ui.js
    title: NU.popup.loadContent (caller and opener injection)
    symbol: NU.popup.loadContent
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: fd1fdf575851
  - id: popup-open
    resource: ../../src/natural.ui.js
    title: NU.popup.popOpen (onOpen method call)
    symbol: NU.popup.popOpen
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 83018aff3d8a
  - id: tab-ctor
    resource: ../../src/natural.ui.js
    title: NU.tab constructor (opener option handling)
    symbol: NU.tab.prototype.constructor
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: d36620c7c542
  - id: tab-load
    resource: ../../src/natural.ui.js
    title: NU.tab.loadContent (caller and opener injection)
    symbol: NU.tab.loadContent
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 285ba8440b52
  - id: tab-wrap
    resource: ../../src/natural.ui.js
    title: NU.tab.wrapEle (per-tab onOpen method call)
    symbol: NU.tab.wrapEle
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 0a7cc57683cb
  - id: docs-load
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.loadContent (caller and docOpts injection)
    symbol: NUS.docs.loadContent
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: dda3f0f1277e
  - id: instance
    resource: ../../src/natural.core.js
    title: NC.prototype.instance (N(selector).instance)
    symbol: NC.prototype.instance
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: de8beae8138f
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-ARCHITECTURE.md
    title: Legacy Natural-ARCHITECTURE guide (removed)
  - id: legacy-popup
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Popup.md
    title: Legacy Popup guide (removed)
  - id: legacy-tab
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Tab.md
    title: Legacy Tab guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.cont` binds a Controller object to the View of a block page: it marks the View element, stores the object on it and returns the same object. It does not run `init`; the loader (`N.comm`, `N.popup`, `N.tab` or `N.docs`) injects `request` (and `caller` / `opener`) and then calls `init(view, request)` through `N.cont.trInit`. See [CVC pattern](cvc-pattern.md) for the full load sequence.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N().cont` | `N(selector).cont(contObj)` | `contObj` (with `view` set) |
| `N.cont` | `new N.cont(view, contObj)` | `contObj` (with `view` set) |
| `N.cont.trInit` | `N.cont.trInit(cont[, request])` | `undefined` |
| `init` | `init(view, request)` (you write it) | ignored |
| `onOpen` | `<name>(onOpenData)` (you write it; name set by the popup or tab) | ignored |

# Constructor

## `N(selector).cont(contObj)`

- jQuery plugin form: runs `new NA.cont(this, contObj)` and returns `contObj`.[^cont-plugin]
- Call it right after the View markup: `N(".page-0001").cont({ init: function (view, request) { ... } })`.
- Call it on an `N(...)` object: the constructor reads the NJS `selector` property to build the page id (see Pitfalls).

## `new N.cont(view, contObj)`

- `view` (NJS object, required): the View element.
- `contObj` (object, required): the Controller object. Omitting it throws, because the constructor sets `contObj.view`.
- `N.cont` is a class copied onto `N`, so it needs `new`; calling `N.cont(...)` without `new` throws a TypeError.
- Steps:[^cont]
  1. If the element's `id` occurs more than once in the document, or the selector matches several elements, re-selects with `:not([data-pageid])` so only the newly loaded copy is bound.
  2. Sets `data-pageid` (the `id` if present, otherwise the selector without `. # [ ] ' : ( ) >`, spaces and `-`; see [CVC pattern](cvc-pattern.md)).
  3. Adds the class `view_context__`.
  4. Stores `contObj` on the View with `instance("cont", contObj)` (jQuery data key `cont__`).
  5. Sets `contObj.view` and returns `contObj`.

# Options

The Controller object is the only argument you design. The framework adds the members marked "injected".

| Member | Type | Set by | When | Description |
|---|---|---|---|---|
| `init` | function | you | — | Called once by `N.cont.trInit` as `cont.init(cont.view, request)`, after `request` is set and AOP advisors are applied. |
| any other function or value | any | you | — | Page logic. Functions matched by an [AOP](aop.md) pointcut are wrapped before `init` runs. |
| `view` | NJS | injected: `NA.cont` constructor | at `N(...).cont()` | The View element; same as `init`'s first argument. |
| `request` | [`NA.comm.request`](request.md) | injected: `N.cont.trInit` | before `init` | The request that loaded the page; read page parameters with `request.attr(name)`. Same as `init`'s second argument. |
| `caller` | `NU.popup` \| `NU.tab` \| `NUS.docs` | injected: the loading component | before `init` | The component instance that loaded this page with its `url` option. Not set for pages loaded by `N.comm` directly. |
| `opener` | Controller object | injected: `N.popup` / `N.tab` from their `opener` option | before `init` | The parent page's controller. Currently lost in the component constructors; see Known issues. |
| `docOpts` | object | injected: `N.docs` | **after** `init` | The document's options (`docId`, `url`, ...). Undefined inside `init`. |

Sources for the injected members: `N.cont.trInit`, `NU.popup.loadContent`, `NU.tab.loadContent`, `NUS.docs.loadContent`.[^trinit][^popup-load][^tab-load][^docs-load]

# Functions

## `init(view, request)`

- User-defined. `view` is the View element; `request` is the page's `NA.comm.request`.
- Called with `this` bound to the Controller object (`cont.init(...)`). Write it as `function` or method shorthand; an arrow function loses `this.caller`, `this.opener` and `this.request`.
- Called only by `N.cont.trInit`, so it never runs on a page that was not inserted by a loader.

## `onOpen(onOpenData)`

The method name is not fixed: the popup or tab names it with a string option, and the method is called as `cont[name](onOpenData)` with `this` bound to the controller.[^popup-open][^tab-wrap]

| Loader | Option | Called when | `onOpenData` |
|---|---|---|---|
| `N.popup` with `url` | `onOpen: "methodName"` | every `popup.open(onOpenData)`, after the popup is shown (first load: after `init`) | `open()`'s argument; when omitted, `options.onOpenData` (the option, or the data of the previous `open`) |
| `N.tab` | per-tab `onOpen: "methodName"` (in `tabOpts` or the tab's `data-opts`) | every activation of that tab; on first load after `init`, `onLoad` and `onActive` | `tab.open(idx, onOpenData)`'s second argument |

If the controller has no method with that name, the component logs a warning (`NC.warn`) and continues.

## `N.cont.trInit(cont[, request])`

- Framework hook called by `NA.comm.submit`, `NU.popup.loadContent`, `NU.tab.loadContent` and `NUS.docs.loadContent`.[^trinit]
- Sets `cont.request = request`, applies the AOP advisors from `N.context.attr("architecture").cont` (`NA.cont.aop.wrap`), then calls `cont.init(cont.view, request)` if `init` exists.
- Call it yourself only for a View that was not inserted by a loader (for example markup rendered into the main page); `request` may be omitted.

## `N(viewSelector).instance("cont")`

Reads a Controller object back from its View element (`NC.prototype.instance`).[^instance] Components offer shortcuts: `tab.cont([idx])` for tab contents and `docs.cont(docId)` for documents.

```js
const page01 = N("#page01").instance("cont");
page01.gridInst.bind([]);
```

# Pitfalls

`N.cont` is a class and needs `new`; only `N.comm` (and `N.notify` in Natural-UI.Shell) are wrapped in `new`-less factories.

```js
// Wrong (legacy): var cont = N.cont(N(".view"), { init: function (view, request) {} });
var cont = new N.cont(N(".view"), { init: function (view, request) {} });
var cont2 = N(".view2").cont({ init: function (view, request) {} });
```

`caller` and `opener` are properties of the Controller object, read through `this`. An arrow `init` cannot reach them.[^popup-load]

```js
// Wrong (legacy): N(".popup-0001").cont({ init: (view, request) => { const caller = this.caller; } });
N(".popup-0001").cont({
    init: function (view, request) {
        const caller = this.caller;                       // the NU.popup instance
        N(".btn-ok", view).on("click", function (e) {
            caller.close("Hello onClose.");               // the jQuery handler receives the event, not onCloseData
        });
    }
});
```

Inside tab content, `caller` is the `NU.tab` instance, not an `N.popup`, and it has no `close()`. Use `open(idx, onOpenData)`, `cont(idx)`, `enable(idx)` or `disable(idx)`.[^tab-load]

```js
// Wrong (legacy): this.caller.close(); // in a tab's content controller
this.caller.open(0, { from: "tab 2" });
```

Create the controller from an `N(...)` object. The constructor builds the page id from the NJS `selector` property; a plain jQuery object has none, so the call throws a TypeError when the View has no `id`.[^cont]

`docOpts` is assigned after `init` returns, so read it in later functions (or in `N.docs` events), not in `init`.[^docs-load]

A page re-loaded with `request.reload()` or `N.docs.reload(docId)` is initialized by the plain `N.comm` element path: the new Controller object gets `request` but no `caller`, `opener` or `docOpts`.

When an AOP pointcut matches a controller function, the wrapper calls it with `this` bound to the object that owns it. A wrapped function passed as a jQuery event handler therefore sees the controller as `this`, not the DOM element; use `e.currentTarget`. See [Controller AOP](aop.md).

# Known issues

* **The `opener` option of `N.popup` and `N.tab` never reaches the loaded controller** - Actual: the `NU.popup` and `NU.tab` constructors save the option in a block-scoped `const opener` inside an `if` block, then restore it with `opts.opener = opener` outside that block, where `opener` resolves to the global `window.opener`. `options.opener` therefore becomes `window.opener` (normally `null`), `loadContent` skips `cont.opener = opts.opener`, and the trailing `opener = undefined` overwrites `window.opener`. The same happens when Natural-TEMPLATE passes `opener` for `p.popup.*` / `p.tab.*` declarations. Likely intent: restore the saved controller so `this.opener` is the parent controller. Workaround: set `options.opener` on the instance right after construction; content is fetched asynchronously and reads `options.opener` when the response arrives.[^popup-ctor][^tab-ctor]

```js
const popup = N().popup({ url: "detail.html", onOpen: "onOpen" });
popup.options.opener = this;   // this = the parent controller
popup.open({ id: 1 });
```

# Examples

View and Controller, with the controller referenced from its own functions:

```html
<article class="page-0001">
    <p>View</p>
</article>

<script type="text/javascript">
(function () {
    const cont = N(".page-0001").cont({
        init: function (view, request) {
            this.fn();
        },
        fn: function () {
            N("p", cont.view).css("padding", "10px");
        }
    });
})();
</script>
```

Popup page with a `caller` and an `onOpen` method (`popup.html`):

```html
<article class="popup-0001" title="onOpen example">
    <p class="result"></p>
    <button class="btn-ok">Ok</button>
</article>

<script type="text/javascript">
N(".popup-0001").cont({
    init: function (view, request) {
        const caller = this.caller;
        N(".btn-ok", view).on("click", function () {
            caller.close("Hello onClose.");
        });
    },
    onOpenFn: function (onOpenData) {
        N(".result", this.view).text(onOpenData);
    }
});
</script>
```

Parent page that opens it:

```html
<article class="parent-0001">
    <p class="result"></p>
</article>

<script type="text/javascript">
N(".parent-0001").cont({
    init: function (view, request) {
        const popup = N().popup({
            url: "popup.html",
            onOpen: "onOpenFn",
            onClose: function (onCloseData) {
                N(".result", view).text(onCloseData);
            }
        });
        popup.options.opener = this;   // see Known issues
        popup.open("Hello onOpen.");
    }
});
</script>
```

# Related

- [CVC pattern](cvc-pattern.md) - load sequence, page id rules and block page layout.
- [N.comm.request](request.md) - the `request` object: `attr`, `get`, `param`, `reload`.
- [Controller AOP](aop.md) - advisors that wrap controller functions before `init`.
- [N.popup](../ui/popup.md) - `url`, `opener`, `onOpen` and `onOpenData` options.
- [N.tab](../ui/tab.md) - per-tab `url` and `onOpen`, `tab.cont(idx)`.
- [N.docs](../ui-shell/documents.md) - document tabs, `docs.cont(docId)` and `docOpts`.

[^cont]: NA.cont constructor
[^cont-plugin]: NA.prototype.cont jQuery plugin wrapper
[^trinit]: NA.cont.trInit
[^popup-ctor]: NU.popup constructor (opener option handling)
[^popup-load]: NU.popup.loadContent (caller and opener injection)
[^popup-open]: NU.popup.popOpen (onOpen method call)
[^tab-ctor]: NU.tab constructor (opener option handling)
[^tab-load]: NU.tab.loadContent (caller and opener injection)
[^tab-wrap]: NU.tab.wrapEle (per-tab onOpen method call)
[^docs-load]: NUS.docs.loadContent (caller and docOpts injection)
[^instance]: NC.prototype.instance (N(selector).instance)
