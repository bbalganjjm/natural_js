---
type: UI Component
title: N.alert
description: Shows a message dialog (alert or confirm) as a layer over the window or an element, or a tooltip message next to an input element.
tags: [ui, component, dialog, alert]
symbols: [N.alert, N().alert, NU.alert, NU.Alert, NU.Options.Alert]
sources:
  - id: ui
    resource: ../../src/natural.ui.js
    title: NU.alert implementation
    symbol: NU.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5933b105d560
  - id: ui-plugin
    resource: ../../src/natural.ui.js
    title: NU.prototype.alert jQuery plugin wrapper
    symbol: NU.prototype.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: efe17ef81c7a
  - id: wrap
    resource: ../../src/natural.ui.js
    title: NU.ui.utils.wrapHandler (global handler chaining)
    symbol: NU.ui.utils
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 190de240129d
  - id: button
    resource: ../../src/natural.ui.js
    title: NU.button constructor (receives okButtonOpts and cancelButtonOpts)
    symbol: NU.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c3c35975533f
  - id: css
    resource: ../../css/natural.ui.css
    title: natural.ui.css (alert styles)
    git_blob: 7e2005229a00223490701634d4d52b5983233e4c
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Alert.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.alert` replaces `window.alert` and `window.confirm` with a layer dialog over the whole window or over one element, and shows short validation messages as a tooltip next to an input. The dialog is built (hidden) in the constructor and displayed with `show()`. [N.popup](popup.md) is built on top of it.

# Quick start

```js
// Window dialog
N(window).alert("Saved.").show();

// Confirm dialog with variables
N(window).alert({
    msg: "Delete {0} rows?",
    vars: ["3"],
    confirm: true,
    onOk: function (msgContext, msgContents) {
        deleteRows();          // returning 0 would keep the dialog open
    }
}).show();

// Tooltip next to an input (closes by itself)
N("#userId", view).alert("User ID is required.").show();
```

# Constructor

## `N(context).alert(msg | opts[, vars])`

- Calls `new NU.alert(this, msg, vars)` and returns the **N.alert instance**.[^ui-plugin]
- The dialog elements are created immediately but stay hidden until `show()`.

## `new N.alert(context, msg | opts[, vars])`

- `context` (required): `window` or a jQuery object. A selector string throws a `TypeError` because the constructor calls `context.get(0)` and `context.is("body")` on it.[^ui]
- `msg | opts`: a string is the `msg` option; a plain object is the options object.
- `vars` (array): the `vars` option.
- Throws `[NU.alert]Container element is missing...` when the `container` element does not exist, in every mode.
- Returns the instance.

The context decides the mode:[^ui]

| Context | Mode | Where the elements go |
|---|---|---|
| `window`, `N(window)`, `N("body")` | window | Overlay and dialog are appended to `container` with `position: fixed`; `context` becomes `N("body")`. |
| any other element | element | Overlay is inserted after the element and covers only it. |
| an `:input` element (`input`, `select`, `textarea`, `button`) | tooltip | A `span.msg__` is inserted next to the input; no overlay, no buttons. |

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `context` | window \| jQuery | — | Constructor argument; see the mode table. |
| `container` | jQuery \| selector | `N.context.attr("architecture").page.context`, then `N.context.attr("ui").alert.container` | Element that receives window-mode dialogs. A string is wrapped with `N()`. Must exist in every mode. |
| `msg` | string \| string[] \| jQuery \| element | — | Message. In window and element mode it is inserted with `.text()` unless `html` is `true`, so a jQuery object or element renders only with `html: true`. An array is supported only in tooltip mode (one line per item). |
| `vars` | string[] | `undefined` | Replaces `{0}`, `{1}`, ... in `msg` (each array item in tooltip mode). |
| `html` | boolean | `false` | Window and element mode: insert `msg` as HTML. Tooltip mode always inserts HTML. |
| `title` | string | the context element's `title` attribute; `undefined` for window, document and body | Creates the title bar with a close (X) button when not `undefined`. |
| `button` | boolean | `true` | `false` creates no button box at all. |
| `confirm` | boolean | `false` | `true` also shows the Cancel button. |
| `okButtonOpts` | object | `null` | [N.button](button.md) options for the OK button. See Known issues. |
| `cancelButtonOpts` | object | `null` | [N.button](button.md) options for the Cancel button. See Known issues. |
| `closeMode` | `"remove"` \| `"hide"` | `"remove"` | Method called by OK, Cancel, X, overlay click, ESC and the tooltip timeout. `"remove"` destroys the elements. |
| `modal` | boolean | `true` | `false` removes the overlay element, so `overlayClose` and `windowScrollLock` have no effect. |
| `overlayClose` | boolean | `true` | Clicking the overlay runs `onCancel`, then closes. |
| `overlayColor` | string | `null` | Inline `background-color` of the overlay. See Known issues. |
| `escClose` | boolean | `true` | ESC (keyup on `document`) runs `onCancel`, then closes. |
| `top` | number | `undefined` | Dialog top in px. |
| `left` | number | `undefined` | Dialog left in px. |
| `width` | number \| function | `0` | Width of `.msg_box__`. A function is called as `width.call(alert, msgContext, msgContents)` and returns px. `0` means automatic. |
| `height` | number \| function | `0` | Height of `.msg_box__` (the content area, without title and buttons), with `overflow-y: auto`. See Known issues for functions. |
| `alwaysOnTop` | boolean | `false` | Puts overlay and dialog above the highest `z-index` found in `alwaysOnTopCalcTarget`. |
| `alwaysOnTopCalcTarget` | selector | `"div, span, ul, p, nav, article, section, header, footer, aside"` | Elements scanned for the highest `z-index`. |
| `dynPos` | boolean | `true` | Element mode only: re-positions overlay and dialog every 500 ms while the context is visible. Window mode always follows `window` resize instead. |
| `windowScrollLock` | boolean | `true` | Stops mouse-wheel scrolling of the page over the overlay. Needs `modal: true`. |
| `draggable` | boolean | `false` | Drag the dialog by its title bar; needs a `title`. |
| `draggableOverflowCorrection` | boolean | `true` | Moves a dialog dropped outside the viewport back inside. |
| `draggableOverflowCorrectionAddValues` | object | `{ top: 0, bottom: 0, left: 0, right: 0 }` | Offsets (px) added by the correction. |
| `saveMemory` | boolean | `false` | Sets `options.msg` and `options.vars` to `null` after rendering. |

Defaults are the `NU.alert` constructor values.[^ui] Two more keys are read from the options but only come from the global configuration: `message` (button and close labels) and `input.displayTimeout` (tooltip lifetime in ms).

# Methods

## `context([selector])`

Returns the context (`N("body")` in window mode), or `context.find(selector)`.

## `show()`

Shows the dialog or tooltip and returns the instance. Runs `onBeforeShow`, starts positioning (window resize handler, or the 500 ms timer in element mode with `dynPos`), focuses the OK button when `button` is `true`, adds `visible__`, and binds ESC when `escClose` is `true`. `onShow` fires when the CSS transition ends. In tooltip mode it schedules `closeMode` after `input.displayTimeout` ms.[^ui]

## `hide()`

Returns the instance. Callable in any `closeMode`. Runs `onBeforeHide`, unbinds its window resize handler and (with `escClose`) its ESC handler, and then:[^ui]

- Window and element mode: hides the overlay and the dialog but keeps them, so a later `show()` displays them again.
- Tooltip mode: removes the `span.msg__` after the hide transition, like `remove()`, but fires `onBeforeHide` / `onHide` instead of the remove pair. A later `show()` has nothing to display.

## `remove()`

Removes the overlay and the dialog (or tooltip) and returns the instance. Callable in any `closeMode`; the instance cannot be shown again.

# Events

| Name | Signature | `this` | When |
|---|---|---|---|
| `onOk` | `function(msgContext, msgContents)` | the `N.alert` instance | OK clicked. Return `0` to keep the dialog open; anything else closes it with `closeMode`. |
| `onCancel` | `function(msgContext, msgContents)` | the `N.alert` instance | Cancel, X, overlay click or ESC. Return `0` to keep the dialog open. |
| `onBeforeShow` | `function(msgContext, msgContents)` | the `N.alert` instance | Start of `show()`; return value ignored. |
| `onShow` | `function(msgContext, msgContents)` | the `N.alert` instance | After the show transition (window and element mode). |
| `onBeforeHide` | `function(msgContext, msgContents)` | the `N.alert` instance | Start of `hide()`; return value ignored. |
| `onHide` | `function(msgContext, msgContents)` | the dialog DOM element | After the hide transition. |
| `onBeforeRemove` | `function(msgContext, msgContents)` | the `N.alert` instance | Start of `remove()`; return value ignored. |
| `onRemove` | `function(msgContext, msgContents)` | the dialog DOM element | After the elements are removed. |

`msgContext` is the overlay (the input in tooltip mode); `msgContents` is the dialog `.block_overlay_msg__` (the `span.msg__` in tooltip mode). The built-in close controls call `closeMode`, so with `"remove"` only the remove pair fires and with `"hide"` only the hide pair. `onShow` never fires in tooltip mode. Global handlers with the same names in `N.context.attr("ui").alert` are chained after the local ones; see [Component model](component-model.md).[^wrap]

# Global configuration

`N.context.attr("ui").alert` is deep-merged over the defaults. The shipped `natural.config.js` sets:

| Key | Shipped value | Effect |
|---|---|---|
| `container` | `".docs__ > .docs_contents__.visible__"` | Suits [N.docs](../ui-shell/documents.md) apps; set `"body"` (or your page context) otherwise. |
| `okButtonOpts` / `cancelButtonOpts` | `{ color: "primary", size: "medium" }` / `{ color: "primary_container", size: "medium" }` | Default button styles. |
| `input.displayTimeout` | `7000` | Tooltip lifetime in ms. Required by tooltip mode. |
| `input.closeBtn` | `"&times;"` | Not read by `NU.alert`. |
| `alwaysOnTop`, `draggable`, `saveMemory` | `true` | Effective defaults differ from the constructor defaults. |
| `draggableOverflowCorrectionAddValues` | `{ top: 0, bottom: 0, left: 2, right: -2 }` | |
| `message` | `ko_KR` / `en_US` labels for `confirm`, `cancel` | Picked by `N.locale()`. `close` is missing, so the X button's tooltip shows the key `close`. |

See [Configuration](../setup/configuration.md).

# Behavior

- Classes: overlay `.block_overlay__.alert_overlay__`; dialog `.block_overlay_msg__.alert__` containing `.msg_title_box__` (`.msg_title__`, `.msg_title_close_btn__`), `.msg_box__` and `.buttonBox__` (`button.confirm__`, `button.cancel__`); tooltip `span.msg__.alert__.alert_tooltip__`. Visibility uses `visible__` / `hidden__` transitions; see [Theming](theming.md).[^css]
- Tooltip mode: creating a new alert on the same input removes the previous tooltip. The tooltip goes after the input, or before it when the input's right edge plus 150 px would leave the window. Its close link calls `remove()`. To clear a tooltip from code, call `N(input).instance("alert").remove()`, as [N.validator](../data/validator.md) does.
- Each shown dialog binds its own `keyup.alert` handler on `document`, so one ESC closes every open alert and popup that has `escClose: true`.
- `show()` sets `z-index: 0` on `.docs__>.docs_tab_context__` (for [N.docs](../ui-shell/documents.md)); `hide()` and `remove()` reset it.
- `remove()` on a popup dialog (`.popup__`) also runs `N.gc.ds()`.

# Pitfalls

Only the number `0` keeps the dialog open; `false` closes it like any other value.[^ui]

```js
// Wrong (legacy): onOk: function () { if (!valid) return false; }
N(window).alert({ msg: "Apply?", confirm: true, onOk: function () { if (!valid) return 0; } }).show();
```

The class form does not wrap a selector string.

```js
// Wrong (legacy): new N.alert("#area", "Hello");
new N.alert(N("#area"), "Hello").show();
N("#area").alert("Hello").show();
```

`N.button` has no `theme` option and no `danger` color; use `color` with a Material color role.[^button]

```js
// Wrong (legacy): okButtonOpts: { size: "large", theme: "primary" }, cancelButtonOpts: { theme: "danger" }
N(window).alert({ msg: "Delete?", confirm: true, cancelButtonOpts: { size: "large", color: "secondary" } }).show(); // see Known issues when the global config also sets cancelButtonOpts
```

With the default `closeMode: "remove"` an instance is single use: create a new alert for each message instead of calling `show()` again after it closed. A tooltip instance is single use even with `closeMode: "hide"`, because `hide()` removes the tooltip element.[^ui]

`hide()` and `remove()` do not check `closeMode`; `closeMode` only selects what the built-in close controls call.

A jQuery object or HTML string as `msg` is shown as plain text unless `html: true`.

In a page without [N.docs](../ui-shell/documents.md), the shipped `container` selector matches nothing and every `N.alert` (and `N.popup`) throws; set `N.context.attr("ui").alert.container` to `"body"`.

# Known issues

* **Local okButtonOpts / cancelButtonOpts are ignored when the global config also sets them** - Actual: the constructor passes `okButtonOpts` and `cancelButtonOpts` through `NU.ui.utils.wrapHandler`, which replaces the local object with a wrapper function whenever `N.context.attr("ui").alert` has the same key (the shipped config does). `N.button` then receives a function, applies no options, and the button loses both the local and the global style. Likely intent: merge the local button options over the global ones. Workaround: restyle after construction, for example `alert.options.msgContents.find(".buttonBox__ .confirm__").button({ color: "secondary", size: "large" })`, or remove the keys from the global config.[^wrap]
* **Function height only works together with a function width** - Actual: the height branch of `NU.alert.wrapEle` tests `typeof opts.width === "function"`. A function `height` with a numeric `width` is handed to jQuery `.height(fn)` (called with `(index, currentHeight)` and the `.msg_box__` element as `this`); a numeric `height` greater than 0 with a function `width` throws `TypeError: opts.height.call is not a function`. Likely intent: test `opts.height`. Workaround: give `width` and `height` the same kind (both functions or both numbers).[^ui]
* **overlayColor has no visible effect** - Actual: the option is set as an inline style, but `natural.ui.css` declares `.alert_overlay__.block_overlay__ { background-color: ... !important }`, which wins. Likely intent: the option overrides the stylesheet color. Workaround: override that rule in your own CSS with `!important`, or call `alert.options.msgContext[0].style.setProperty("background-color", color, "important")` after construction.[^css]
* **hide() on an element-context alert lets the overlay come back** - Actual: in element mode with `dynPos: true`, `show()` starts a 500 ms timer that re-shows the overlay and dialog while the context is visible; only `remove()` clears it, so after `hide()` the overlay reappears. Likely intent: stop the timer on hide. Workaround: keep `closeMode: "remove"` for element contexts, or set `dynPos: false`.[^ui]
* **An empty message in tooltip mode throws** - Actual: `NU.alert.wrapInputEle` removes an earlier tooltip on the input and then calls `remove()` on the new instance, whose `msgContents` is still `null`, so `N(input).alert("")` (or `[]`, or no message) throws a `TypeError`. Likely intent: clear the tooltip silently. Workaround: `N(input).instance("alert")` and call `remove()` on it when it is defined.[^ui]
* **onHide and onRemove run with the DOM element as `this`** - Actual: both are called inside the transition-end callback with the dialog element as `this`, while `@types` declares `this: NU.Alert`. Likely intent: the `N.alert` instance. Workaround: close over the instance variable instead of using `this`.[^ui]

# Examples

Confirm before deleting, keeping the dialog open while a request runs:

```js
N(window).alert({
    msg: "Delete the selected rows?",
    title: "Confirm",
    confirm: true,
    onOk: function (msgContext, msgContents) {
        const dialog = this;
        N.comm("deleteRows.json").submit(function () {
            dialog.remove();
        });
        return 0;
    }
}).show();
```

Dialog that covers only one panel:

```js
N("#resultPanel", view).alert({ msg: "Loading failed.", title: "Error" }).show();
```

Several validation messages next to an input:

```js
N("#password", view).alert(["At least 8 characters.", "Must contain a digit."]).show();
```

HTML content with a fixed size, draggable by the title bar:

```js
N(window).alert({
    msg: "<strong>Maintenance</strong> starts at 22:00.",
    html: true,
    title: "Notice",
    width: 400,
    height: 120,
    draggable: true
}).show();
```

# Related

- [N.popup](popup.md) - layer popups built on `N.alert`.
- [N.button](button.md) - options accepted by `okButtonOpts` and `cancelButtonOpts`.
- [Component model](component-model.md) - option precedence, global handlers, instance storage.
- [Configuration](../setup/configuration.md) - `N.context.attr("ui").alert` (`container`, `message`, `input`).
- [Message](../core/message.md) - `N.message` variable replacement used for `vars`.
- [Theming](theming.md) - the alert classes and color tokens.

[^ui]: NU.alert implementation
[^ui-plugin]: NU.prototype.alert jQuery plugin wrapper
[^wrap]: NU.ui.utils.wrapHandler (global handler chaining)
[^button]: NU.button constructor (receives okButtonOpts and cancelButtonOpts)
[^css]: natural.ui.css (alert styles)
