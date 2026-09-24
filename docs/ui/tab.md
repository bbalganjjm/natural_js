---
type: UI Component
title: N.tab
description: Turns a div containing a ul of tab items and content divs into a tab view, optionally loading each tab's content page with its own Controller.
tags: [ui, component, tab, navigation]
symbols: [N.tab, N().tab, NU.tab, NU.Tab, NU.Options.Tab, NU.Options.EachTab]
sources:
  - id: ui
    resource: ../../src/natural.ui.js
    title: NU.tab implementation
    symbol: NU.tab
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 7281df6a6e18
  - id: ui-plugin
    resource: ../../src/natural.ui.js
    title: NU.prototype.tab jQuery plugin wrapper
    symbol: NU.prototype.tab
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 486b3d3a60dc
  - id: wrap
    resource: ../../src/natural.ui.js
    title: NU.tab.wrapEle (click handling, event order)
    symbol: NU.tab.wrapEle
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 0a7cc57683cb
  - id: load
    resource: ../../src/natural.ui.js
    title: NU.tab.loadContent (caller and opener)
    symbol: NU.tab.loadContent
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 285ba8440b52
  - id: open
    resource: ../../src/natural.ui.js
    title: NU.tab.prototype.open
    symbol: NU.tab.prototype.open
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 0d707f51bfa2
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Tab.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.tab` turns a `div` that holds a `ul` of tab items and one content `div` per tab into a tab view. A tab's content can be written inline or loaded from a page (`url`) whose Controller gets `caller` (the `N.tab` instance). Use it for tabbed detail screens and for splitting one page into sub-pages.

# Quick start

```html
<div id="detailTab">
    <ul>
        <li><a href="#basic">Basic</a></li>
        <li data-opts='{ "url": "html/emp/career.html", "onOpen": "onOpen" }'><a href="#career">Career</a></li>
        <li data-opts='{ "url": "html/emp/family.html", "stateless": true }'><a href="#family">Family</a></li>
    </ul>
    <div id="basic">Inline content</div>
    <div id="career"></div>
    <div id="family"></div>
</div>
```

```js
const tab = N("#detailTab", view).tab({
    onActive: function (tabIdx, tabEle, contentEle, links, contents) {
        console.log("active tab", tabIdx);
    }
});
tab.open(1, { empNo: "E001" });   // index only; the object goes to the Controller's onOpen
```

# Constructor

## `N(context).tab([opts])`

- Calls `new NU.tab(this, opts)` and returns the **N.tab instance**.[^ui-plugin]

## `new N.tab(context[, opts])`

- `context` (jQuery object): the tab container. A selector string throws a `TypeError` (the constructor calls `context.find`).[^ui]
- Also accepts a single options object that contains `context` (a selector or jQuery object): `new N.tab({ context: "#detailTab", tabOpts: [...] })`.
- Adds the class `tab__`, opens the default tab asynchronously (after the constructor returns), and returns the instance.

Required markup: the context `div` has a `ul` whose `li` children are the tabs (each with an `a` inside) and one direct child `div` per tab. Tabs and content divs are matched **by position**: the n-th `li` shows the n-th `div`. The `href` / `id` pair is not used for matching.[^wrap]

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `context` | jQuery | — | The tab container (`div` > `ul` > `li`, plus `div` children). |
| `tabOpts` | object[] | `[]` | Per-tab options in tab order (see Declarative options). When given, all `li` `data-opts` are ignored. |
| `randomSel` | boolean | `false` | Open a random tab on creation. See Known issues for how it interacts with `active`. |
| `blockOnActiveWhenCreate` | boolean | `false` | Do not run `onActive` for the tab opened on creation. |
| `opener` | Controller | `null` | Set as `cont.opener` on each loaded tab page's Controller. See Known issues. |
| `tabScroll` | boolean | `false` | Scroll the tab strip by dragging (desktop) or native scrolling (touch) when the tabs are wider than the container. |
| `tabScrollCorrection` | object | `{ tabContainerWidthCorrectionPx: 0, tabContainerWidthReCalcDelayTime: 0 }` | `tabContainerWidthCorrectionPx` is added to the computed tab strip width; `tabContainerWidthReCalcDelayTime` (ms) re-runs the width calculation once after that delay. |
| `onActive` | function | `null` | See Events. |
| `onLoad` | function | `null` | See Events. |

Defaults are the `NU.tab` constructor values.[^ui] `links` (the `li` elements) and `contents` (the content `div` elements) are internal options set by the constructor.

# Declarative options

Per-tab options are read from each `li`'s `data-opts` (strict JSON) when `tabOpts` is empty; otherwise `tabOpts[i]` is used for the i-th tab.[^ui]

| Name | Type | Default | Description |
|---|---|---|---|
| `url` | string | `undefined` | Page loaded into the tab's content `div` on first activation. |
| `active` | boolean | `false` | Open this tab on creation. With several, the last one wins. |
| `preload` | boolean | `false` | Load the page on creation instead of on first activation (only with `url`). |
| `onOpen` | string | `undefined` | Name of a method on the loaded page's Controller, called with `onOpenData` every time the tab is opened. Only with `url`. |
| `disable` | boolean | `false` | Create the tab disabled. |
| `stateless` | boolean | `false` | Reload the page and re-run its Controller `init` on every activation. |

# Methods

## `context([selector])`

Returns the container, or `context.find(selector)`.

## `open(idx[, onOpenData])`

Activates the tab at index `idx` (a number) and returns the instance. `onOpenData` is passed to the tab page's declarative `onOpen` method. Nothing happens when `idx` is already the last opened index, so the Controller's `onOpen` is not re-run for the current tab. Activation is queued and runs asynchronously.[^open]

## `open()`

Without arguments returns `{ index, tab, content, cont }` for the active tab: the index, the `li`, the content `div` and its Controller (`undefined` for inline content or a page that is still loading). When the last requested index is not the active tab yet (activation is asynchronous, or the tab is disabled) it returns `{ index, tab: "Tab content has not yet been loaded.", content: <same string>, cont: <same string> }`.[^open]

## `enable(idx)`

Enables the tab at index `idx`, removes `tab_disabled__`, returns the instance. Without `idx` it does nothing.

## `disable(idx)`

Disables the tab at index `idx`: clicks and `open(idx)` are blocked by `N.event.disable`; adds `tab_disabled__`; returns the instance.

## `cont([idx])`

Returns the Controller of the page loaded in tab `idx`, or of the active tab without `idx`. Returns `undefined` and logs a warning when the content is not loaded or has no Controller.

# Events

| Name | Signature | `this` | When |
|---|---|---|---|
| `onActive` | `function(tabIdx, tabEle, contentEle, links, contents)` | the `N.tab` instance | A tab becomes active (skipped for the creation-time tab with `blockOnActiveWhenCreate`). |
| `onLoad` | `function(tabIdx, tabEle, contentEle, cont)` | the `N.tab` instance | A `url` page was loaded and its Controller `init` ran (at creation for `preload` tabs). `cont` is `undefined` when the page has no Controller. |
| `onOpen` (Controller method) | `function(onOpenData)` | the tab page's Controller | Every activation of a `url` tab that declares `onOpen`. |

Order on the first activation of a `url` tab: page load, Controller `init`, `onLoad`, `onActive`, `onOpen`. Later activations (not `stateless`): `onActive`, `onOpen`.[^wrap]

# Global configuration

`N.context.attr("ui").tab` is deep-merged over the defaults. The shipped `natural.config.js` sets `tabScrollCorrection: { tabContainerWidthCorrectionPx: 1, tabContainerWidthReCalcDelayTime: 0 }`. Global `onActive` / `onLoad` handlers are replaced by local ones rather than chained (see Known issues). See [Configuration](../setup/configuration.md).

# Behavior

- Loaded pages: the tab `div` receives the page HTML through `N.comm` (`target` is the content `div`), `cont.caller` is set to the `N.tab` instance and `cont.opener` to `opener` when set, then `init(view, request)` runs. The load for the creation-time tab uses `urlSync: false`; `preload` loads and later activations use `urlSync: true`, so their response is dropped when the browser URL changed in between.[^load]
- A loaded tab keeps its state (it is not reloaded) unless it is `stateless`. `preload` tabs are never reloaded by clicks unless they are also `stateless`.
- Clicking the active tab does nothing. Clicks are ignored when the tab strip was dragged more than 15 px (tab scrolling).
- Classes: `tab__` (container), `tab_active__` (active `li`), `tab_content_active__` (visible `div`), `tab_disabled__`, `visible__` / `hidden__` (content transitions), `tab_scroll__`, `tab_scroll_prev__`, `tab_scroll_next__`, `tab_native_scroll__`. See [Theming](theming.md).
- `tabScroll` buttons: put at least two `a` elements (each with a `span`) as **direct children of the container `div`**; the first becomes the previous button, the second the next button. They are shown only while the tabs overflow.

```html
<div id="manyTabs">
    <a href="#"><span>&lt;</span></a>
    <ul> ... </ul>
    <a href="#"><span>&gt;</span></a>
    <div> ... </div>
</div>
```

# Pitfalls

`open`, `enable`, `disable` and `cont` take a numeric index only; an id string selects nothing.[^open]

```js
// Wrong (legacy): tab.open("career");
tab.open(1);
```

`caller` in a tab page's Controller is the `N.tab` instance, not an `N.popup`. Use it with a regular-function `init`.

```js
// Wrong (legacy): init: (view, request) => { this.caller.cont(0); }
init: function (view, request) {
    const tab = this.caller;         // N.tab instance
    const basicCont = tab.cont(0);
}
```

The scroll buttons belong to the container, not to the `ul`.

```html
// Wrong (legacy): <ul><a href="#"><span>&lt;</span></a><li>...</li><a href="#"><span>&gt;</span></a></ul>
<div id="manyTabs"><a href="#"><span>&lt;</span></a><ul><li>...</li></ul><a href="#"><span>&gt;</span></a><div>...</div></div>
```

`tabOpts` replaces every `li` `data-opts`; do not mix the two.

The default tab opens after the constructor returns and `url` pages load asynchronously, so `tab.cont(0)` or `tab.open()` right after creating the tab returns nothing useful. Use `onLoad`.

# Known issues

* **The opener option is dropped** - Actual: the constructor moves `opts.opener` into a block-scoped `const opener` and restores it from an out-of-scope identifier, which resolves to `window.opener` (normally `null`), so loaded Controllers never get the passed `opener`. Likely intent: keep the passed Controller. Workaround: set `tab.options.opener = parentCont;` right after construction, before any tab content finishes loading.[^ui]
* **Global onActive / onLoad handlers are not chained** - Actual: `wrapHandler` is only called in the single-options-object branch and is given the second constructor argument, which is normally `undefined`, so it does not wrap; a local `onActive` / `onLoad` simply replaces the global one from `N.context.attr("ui").tab`. Likely intent: chain like the other components. Workaround: call the global handler yourself from the local one.[^ui]
* **randomSel overrides active** - Actual: while scanning `tabOpts`, every tab without `active` recomputes a random index when `randomSel` is `true`, so an `active` tab wins only if it is the last tab. Likely intent: `active` takes precedence. Workaround: do not combine `randomSel` with `active`, or call `open(idx)` yourself.[^wrap]
* **onOpen as a function is ignored** - Actual: the tab looks up `cont[onOpen]`, so only a method name works; a function (allowed by `@types` `NU.Options.EachTab.onOpen`) produces the warning "The onOpen event handler(...) is not defined". Workaround: define the handler on the tab page's Controller and pass its name.[^wrap]

# Examples

Tabs configured in script, second tab preloaded:

```js
const tab = N("#detailTab", view).tab({
    tabOpts: [
        { active: true },
        { url: "html/emp/career.html", preload: true },
        { url: "html/emp/family.html", disable: true }
    ],
    onLoad: function (tabIdx, tabEle, contentEle, cont) {
        if (tabIdx === 1) {
            cont.search();           // a method of the career page Controller
        }
    }
});
tab.enable(2);
```

Tab page Controller that receives data on every open (its `li` declares `"onOpen": "onOpen"`, as in the Quick start):

```js
N(".career-page").cont({
    init: function (view, request) {
        // runs once (every time when the tab is stateless)
    },
    onOpen: function (onOpenData) {
        if (onOpenData) {
            N("#empNo", this.view).val(onOpenData.empNo);
        }
    }
});
```

Read the active tab:

```js
const active = tab.open();
if (typeof active.cont === "object") {
    active.cont.refresh();
}
```

# Related

- [Controller](../architecture/controller.md) - `caller`, `opener` and `init` of loaded tab pages.
- [N.popup](popup.md) - the same page-loading pattern in a dialog.
- [Documents](../ui-shell/documents.md) - `N.docs`, MDI/SDI page containers for whole menus.
- [Communicator](../architecture/communicator.md) - `N.comm`, used to load tab pages.
- [Component model](component-model.md) - instance storage, option precedence, global handlers.

[^ui]: NU.tab implementation
[^ui-plugin]: NU.prototype.tab jQuery plugin wrapper
[^wrap]: NU.tab.wrapEle (click handling, event order)
[^load]: NU.tab.loadContent (caller and opener)
[^open]: NU.tab.prototype.open
