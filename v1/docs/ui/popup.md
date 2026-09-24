---
type: UI Component
title: N.popup
description: Opens a layer popup built on N.alert, either from an element of the current page or from a separately loaded page with its own Controller.
tags: [ui, component, dialog, popup]
symbols: [N.popup, N().popup, NU.popup, NU.Popup, NU.Options.Popup]
sources:
  - id: ui
    resource: ../../src/natural.ui.js
    title: NU.popup implementation
    symbol: NU.popup
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c707aa4dadb7
  - id: ui-plugin
    resource: ../../src/natural.ui.js
    title: NU.prototype.popup jQuery plugin wrapper
    symbol: NU.prototype.popup
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: ab94b5af2fef
  - id: load
    resource: ../../src/natural.ui.js
    title: NU.popup.loadContent (url mode, caller and opener)
    symbol: NU.popup.loadContent
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: fd1fdf575851
  - id: alert
    resource: ../../src/natural.ui.js
    title: NU.alert implementation (dialog, buttons, close handling)
    symbol: NU.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5933b105d560
  - id: comm
    resource: ../../src/natural.architecture.js
    title: NA.comm (submit callback binding)
    symbol: NA.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 40c48fda4ea0
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Popup.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.popup` shows a layer popup over the window, either from a hidden block element of the current page (context mode) or from an HTML page fetched with `url` (url mode). In url mode the loaded page's Controller gets a `caller` property pointing back to the popup, which it uses to close the popup and return data. The dialog itself is an internal [N.alert](alert.md), so most visual options are alert options.

# Quick start

```html
<div class="popupArea" title="Edit memo">
    <textarea id="memo"></textarea>
</div>
```

```js
// Context mode: reuse an element of this page
const memoPopup = N(".popupArea", view).popup({ width: 400, button: true });
memoPopup.open();

// Url mode: load a page with its own Controller
const userPopup = N().popup({
    url: "html/user/userSearch.html",
    title: "Search users",
    width: 800,
    onClose: function (onCloseData) {
        N("#userId", view).val(onCloseData.userId);
    }
});
userPopup.open();
```

# Constructor

## `N(context).popup([opts | url])`

- Calls `new NU.popup(this, opts)` and returns the **N.popup instance**.[^ui-plugin]
- Use `N(element)` for context mode, `N()` for url mode. A string argument is the `url`: `N().popup("page.html")`.

## `new N.popup(context[, opts | url])`

- `context`: a jQuery object (context mode) or `N()` (url mode). A selector string throws a `TypeError` in context mode (the constructor calls `context.hide()`).[^ui]
- A single plain-object argument is also accepted, `new N.popup({ url: "page.html" })`; it is used as the options.
- Context mode builds the dialog immediately. Url mode loads nothing until `open()`, unless `preload` is `true`.

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `context` | jQuery | the first constructor argument | Context mode: the block element shown in the popup. It is hidden and moved into the dialog. |
| `url` | string | `null` | Url mode: page loaded with `N.comm` (`GET`, `dataType: "html"`). |
| `title` | string | `null` | Title bar text; with `null` the context element's `title` attribute (url mode: the last top-level non-`style`/`script` element's `title`) is used and the attribute is removed. No title means no title bar and no X button. |
| `button` | boolean | `true` | OK/Cancel button box (passed to N.alert). |
| `confirm` | boolean | `true` | Show the Cancel button next to OK. |
| `okButtonOpts` / `cancelButtonOpts` | object | not defined (N.alert: `null`) | [N.button](button.md) options; see the N.alert Known issues. |
| `closeMode` | `"hide"` \| `"remove"` | `"hide"` | What closing does. `"hide"` keeps the elements and the loaded page; `"remove"` destroys them (url mode reloads on the next `open()`, context mode cannot be reopened). |
| `modal` | boolean | `true` | Overlay that blocks the page. |
| `top` / `left` | number | `undefined` | Dialog position in px. |
| `width` | number \| function | `0` | Width of the content area; a function is called as `width.call(alert, msgContext, msgContents)`. |
| `height` | number \| function | `0` | Height of the content area (without title and buttons); function form has the N.alert height issue. |
| `alwaysOnTop` | boolean | `false` | Put the popup above the highest `z-index`. |
| `overlayClose` | boolean | `true` | Close (via `onCancel`) on overlay click. |
| `escClose` | boolean | `true` | Close (via `onCancel`) on ESC. |
| `dynPos` | boolean | `true` | Passed to N.alert; has no effect because the popup's alert is always window based. |
| `windowScrollLock` | boolean | `true` | Block page wheel scrolling over the overlay (`modal` only). |
| `draggable` | boolean | `false` | Drag by the title bar (needs a title). |
| `draggableOverflowCorrection` | boolean | `true` | Move a popup dropped off screen back inside. |
| `draggableOverflowCorrectionAddValues` | object | `{ top: 0, bottom: 0, left: 0, right: 0 }` | Offsets used by the correction. |
| `preload` | boolean | `false` | Url mode: load the page in the constructor instead of on the first `open()`. |
| `opener` | Controller | `null` | Url mode: set as `cont.opener` on the popup's Controller. See Known issues. |
| `onOpen` | string | `null` | Url mode: **name** of a method on the popup's Controller, called on every `open()` with `onOpenData`. In context mode the element normally has no Controller, and `open()` then throws a `TypeError`. |
| `onOpenData` | any | `null` | Default argument for `open()`. When `onOpen` is set, every `open()` stores its argument here. |
| `onClose` | function | `null` | Called by `close()`; see Events. Works in both modes. |
| `onCloseData` | any | `null` | Default argument for `close()`. |
| `onLoad` | function | `null` | Url mode: called after the page loaded and its `init` ran. |
| `saveMemory` | boolean | `false` | Drop the internal alert's `msg` reference after building. |

Defaults are the `NU.popup` constructor values.[^ui] The option object is passed to `N(window).alert(...)` as a whole, so any [N.alert](alert.md) option (for example `overlayColor`, `container`) also works, and keys the popup does not define are filled from `N.context.attr("ui").alert`.[^alert]

# Methods

## `context([selector])`

Returns the context element, or `context.find(selector)`. In url mode this is the loaded page's top-level nodes after loading (before loading: the `N()` receiver).

## `open([onOpenData])`

Opens the popup and returns the instance. Url mode loads the page first if it is not loaded (always with `closeMode: "remove"`). Shows the dialog, then, if `onOpen` is set, calls `cont[onOpen](onOpenData)` on the popup's Controller. Without an argument, `options.onOpenData` is used.[^ui]

## `close([onCloseData])`

Calls `onClose(onCloseData)` (falling back to `options.onCloseData`), then hides or removes the dialog according to `closeMode`. Returns the instance.

## `remove()`

Removes the dialog and its content (`popup.alert.remove()`) and returns the instance.

The internal dialog is available as `popup.alert` (an `N.alert` instance).

# Events

| Name | Signature | `this` | When |
|---|---|---|---|
| `onOk` | `function(msgContext, msgContents)` | the internal `N.alert` (`popup.alert`) | OK clicked. Return `0` to keep it open. |
| `onCancel` | `function(msgContext, msgContents)` | the internal `N.alert` | Cancel, X, overlay click or ESC. Return `0` to keep it open. |
| `onBeforeShow` / `onShow` | `function(msgContext, msgContents)` | the internal `N.alert` | Around showing; `onShow` after the transition. |
| `onBeforeHide` | `function(msgContext, msgContents)` | the internal `N.alert` | Start of hiding (`closeMode: "hide"`). |
| `onHide` | `function(msgContext, msgContents)` | the dialog DOM element | After hiding. |
| `onBeforeRemove` | `function(msgContext, msgContents)` | the internal `N.alert` | Start of removal (`closeMode: "remove"` or `remove()`). |
| `onRemove` | `function(msgContext, msgContents)` | the dialog DOM element | After removal. |
| `onClose` | `function(onCloseData)` | the `N.popup` instance | Only when `close()` is called. |
| `onLoad` | `function(cont)` | the `N.comm` instance that loaded the page | Url mode, after loading and `init`. `cont` is the popup page's Controller, or `undefined` if it has none. |
| `onOpen` (Controller method) | `function(onOpenData)` | the popup's Controller | Every `open()` in url mode. |

`msgContext` is the overlay and `msgContents` the dialog element `.block_overlay_msg__.popup__`. Global handlers in `N.context.attr("ui").popup` are chained after the local ones, and inside the internal alert the `N.context.attr("ui").alert` handlers are chained again; see [Component model](component-model.md).[^ui]

Order in url mode: first `open()` loads the page, runs the Controller's `init`, shows the dialog, runs `onOpen`, then `onLoad`. With `preload`, the constructor starts the request and `init` and `onLoad` run when it completes; later `open()` calls only show the dialog and run `onOpen`.[^load]

# Global configuration

`N.context.attr("ui").popup` is deep-merged over the defaults. The shipped `natural.config.js` sets `alwaysOnTop: true`, `draggable: true`, `saveMemory: true` and `button: false`, so popups have **no OK/Cancel buttons** unless you pass `button: true`. The popup also inherits `container`, `okButtonOpts`, `cancelButtonOpts` and `message` from `N.context.attr("ui").alert`. See [Configuration](../setup/configuration.md).

# Behavior

- The dialog is `N(window).alert(options)`: the overlay gets `popup_overlay__` and the dialog `popup__` (plus the N.alert classes); the content is inserted as HTML.[^alert]
- Url mode: the loaded page is inserted into the dialog, `cont.caller` is set to the `N.popup` instance (and `cont.opener` to `opener` when set), then the Controller's `init(view, request)` runs. The request target is the dialog content element.[^load]
- The built-in close controls (OK, Cancel, X, overlay, ESC) call the internal alert's `hide()` or `remove()` directly, not `popup.close()`, so `onClose` does **not** run for them. Call `this.caller.close(data)` from the popup Controller to return data.
- With the shipped config (`button: false`) a popup without a title has no visible close control; it closes with ESC, an overlay click, or `close()` from code.
- Url mode with `closeMode: "remove"` refetches the page and re-runs `init` on every `open()`; with `"hide"` the page is loaded once and keeps its state.
- When `onOpen` is set, the value passed to `open()` is stored in `options.onOpenData`, so a later `open()` without an argument reuses it.

# Pitfalls

The popup Controller must use a regular function for `init` to reach `this.caller`; the click handler's first argument is the jQuery event, not data.

```js
// Wrong (legacy): init: (view, request) => { const caller = this.caller; N(".btn-ok", view).on("click", (onCloseData) => { caller.close("Hello onClose."); }); }
init: function (view, request) {
    const cont = this;
    N(".btn-ok", view).on("click", function () {
        cont.caller.close("Hello onClose.");
    });
}
```

`onClose` works in context mode too, but only through `close()`; it is not an url-only option and it is not called by the X button, ESC or the overlay.

`this` inside `onOk`, `onCancel` and the show/hide handlers is the internal alert, not the popup. Keep a reference to the popup instead.

```js
// Wrong (legacy): onOk: function () { this.close(); }
const popup = N(".popupArea").popup({
    button: true,
    onOk: function () { popup.close(); return 0; }
});
```

Returning `0` from `onOk` above keeps the alert from closing itself, so `popup.close()` (and `onClose`) handles it once.

Context mode with `closeMode: "remove"` destroys the context element on the first close; a second `open()` shows nothing. Create a new popup, or keep `"hide"`.

# Known issues

* **The opener option is dropped** - Actual: the constructor moves `opts.opener` into a block-scoped `const opener` and later restores it from an identifier that is no longer in scope, which resolves to the browser's `window.opener` (normally `null`). `cont.opener` is therefore never set to the given Controller. Likely intent: keep the passed Controller. Workaround: assign it after construction and before the page loads, `popup.options.opener = parentCont;`, or pass data through `open(onOpenData)`.[^ui]
* **Dialog handlers are not bound to the N.popup** - Actual: `onOk`, `onCancel`, `onBeforeShow`, `onShow`, `onBeforeHide` and `onBeforeRemove` run with the internal `N.alert` as `this`, and `onHide` / `onRemove` with the dialog element, while `@types` declares `this: NU.Popup`. Likely intent: the popup instance. Workaround: close over the popup variable.[^alert]
* **onLoad runs with the N.comm instance as `this`** - Actual: `onLoad` is called inside the `N.comm` submit callback with that callback's `this`, the `N.comm` instance that loaded the page.[^comm] Likely intent: the popup instance (as `@types` declares). Workaround: close over the popup variable; the Controller arrives as the argument.
* **preload in context mode tries to load a page** - Actual: with `preload: true` and `closeMode: "remove"` and no `url`, the constructor calls `NU.popup.loadContent` with `url: null`. Likely intent: preload is url-only. Workaround: do not set `preload` in context mode.[^ui]

# Examples

Data exchange between a parent page and a popup page.

Popup page `popup.html`:

```html
<article class="popup-0001" title="onOpen example">
    <p class="result"></p>
    <button class="btn-ok">OK</button>
</article>

<script type="text/javascript">
N(".popup-0001").cont({
    init: function (view, request) {
        const cont = this;
        N(".btn-ok", view).button().on("click", function () {
            cont.caller.close("Hello onClose.");   // runs the parent's onClose
        });
    },
    onOpenFn: function (onOpenData) {              // runs on every open()
        N(".result", this.view).text(onOpenData);
    }
});
</script>
```

Parent page:

```js
N(".parent-0001").cont({
    init: function (view, request) {
        const popup = N().popup({
            url: "./popup.html",
            onOpen: "onOpenFn",
            onClose: function (onCloseData) {
                N(".result", view).text(onCloseData);
            }
        });
        popup.open("Hello onOpen.");
    }
});
```

Reload the page on every open (fresh state):

```js
const popup = N().popup({
    url: "html/order/orderDetail.html",
    closeMode: "remove",
    title: "Order",
    onOpen: "setOrder"               // method of the orderDetail Controller, receives onOpenData
});
N("#btnDetail", view).on("click", function () {
    popup.open({ orderId: N("#orderId", view).val() });
});
```

Preload a page so its Controller is usable before opening:

```js
const popup = N().popup({
    url: "html/common/codeSearch.html",
    preload: true,
    onLoad: function (cont) {
        cont.setMode("single");      // a method defined on the popup Controller
    }
});
```

# Related

- [N.alert](alert.md) - the dialog behind every popup; shares options and Known issues.
- [Controller](../architecture/controller.md) - `caller`, `opener` and `init` of the loaded page.
- [N.tab](tab.md) - loads pages into tabs with the same `caller` / `onOpen` pattern.
- [Communicator](../architecture/communicator.md) - `N.comm`, used to fetch url pages.
- [Component model](component-model.md) - option precedence and global handlers.
- [Configuration](../setup/configuration.md) - `N.context.attr("ui").popup` and `.alert`.

[^ui]: NU.popup implementation
[^ui-plugin]: NU.prototype.popup jQuery plugin wrapper
[^load]: NU.popup.loadContent (url mode, caller and opener)
[^alert]: NU.alert implementation (dialog, buttons, close handling)
[^comm]: NA.comm (submit callback binding)
