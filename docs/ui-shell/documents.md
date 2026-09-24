---
type: UI Component
title: N.docs
description: MDI/SDI page container that loads Natural-JS block pages as document tabs or as a single page, with state limits, load indicators and parameter passing.
tags: [ui-shell, component, mdi, spa]
symbols: [N.docs, N().docs, NUS.docs, NUS.prototype.docs, NUS.Documents, NUS.DocumentsRequest, NUS.Options.Documents, NUS.Options.DocOpts, NUS.Options.DocsObject, docs.request, docOpts, docsFilter__, docs__, docs_tab__, docs_contents__]
sources:
  - id: docs
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs implementation
    symbol: NUS.docs
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: eb0057a9f328
  - id: ctor
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs constructor (defaults, global config, entire-load filter, request)
    symbol: NUS.docs.prototype.constructor
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: da534b14832a
  - id: docs-plugin
    resource: ../../src/natural.ui.shell.js
    title: NUS.prototype.docs jQuery plugin wrapper
    symbol: NUS.prototype.docs
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: aa7bcbbe7baf
  - id: wrap
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.wrapEle (markup, Close all and Menu list buttons)
    symbol: NUS.docs.wrapEle
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: fdb34bdfc68d
  - id: load
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.loadContent (page request, caller, init, docOpts)
    symbol: NUS.docs.loadContent
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: dda3f0f1277e
  - id: add
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.prototype.add
    symbol: NUS.docs.prototype.add
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: b42ff40436e8
  - id: active
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.prototype.active
    symbol: NUS.docs.prototype.active
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: f0ba27645ffb
  - id: remove-state
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.prototype.removeState
    symbol: NUS.docs.prototype.removeState
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: 3948f5364cd3
  - id: remove
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.prototype.remove
    symbol: NUS.docs.prototype.remove
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: 6277b8e2d0ff
  - id: reload
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs.prototype.reload
    symbol: NUS.docs.prototype.reload
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: 9ed49c42d93f
  - id: request-attr
    resource: ../../src/natural.architecture.js
    title: NA.comm.request.prototype.attr (setter returns the owner object)
    symbol: NA.comm.request.prototype.attr
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 8101f576ac81
  - id: submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (urlSync check, error handlers, element path)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI.Shell-Documents.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.docs` turns a block element into the page container of a single-page application: each menu page (a Natural-JS block page) is loaded by URL as a **document**. With `multi: true` (MDI) every document gets a tab and its own content section; with `multi: false` (SDI) one page is shown at a time. The loaded page's Controller receives the `N.docs` instance as `caller` and its options as `docOpts`.

# Quick start

```html
<div id="docs"></div>
```

```js
const docs = N("#docs").docs({ maxStateful: 5, tabScroll: true });

docs.request.attr("deptCd", "D01");                          // parameters for the next loaded document
docs.add("dept0001", "Departments", { url: "html/dept/dept0001.html" });
```

```html
<!-- html/dept/dept0001.html -->
<article class="dept0001">
    <h2>Departments</h2>
</article>
<script type="text/javascript">
    N(".dept0001").cont({
        init: function (view, request) {
            const deptCd = request.attr("deptCd");            // "D01"
        }
    });
</script>
```

# Constructor

## `N(context).docs([opts])`

Runs `new NUS.docs(this, opts)` and returns the `N.docs` instance (not the jQuery collection).[^docs-plugin]

## `new N.docs(context[, opts])`

- `context` (jQuery object, required): the container element. The constructor uses it as given, so a selector string is not accepted: `new N.docs("#docs")` fails on `addClass`. Use `new N.docs(N("#docs"))`.[^ctor]
- Merges the options, registers the entire-load filter when it is needed (see Behavior), creates `docs.request`, builds the markup, sets up tab scrolling (`tabScroll`) and stores the instance on the container (`N("#docs").instance("docs")`).
- Opens no document; call `add()`.

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `context` | jQuery | — | Container element, taken from the first constructor argument. |
| `multi` | boolean | `true` | `true`: MDI, a tab bar (`nav.docs_tab_context__`) with "Close all" and "Menu list" buttons plus one `section.docs_contents__` per document. `false`: SDI, no tabs; every `add()` loads a page that replaces the current one. |
| `maxStateful` | number | `0` | MDI only. Maximum number of documents that keep their loaded page; `0` is unlimited. See Behavior. |
| `maxTabs` | number | `0` | MDI only. Maximum number of open tabs; `0` is unlimited. When reached, `add()` opens nothing and tries to show the `maxTabs` message, a call that throws in `src/` and the ES6 bundles (see Known issues). |
| `addLast` | boolean | `false` | `true` appends new tabs at the end of the tab bar; `false` inserts them first. |
| `tabScroll` | boolean | `false` | Lets the user drag (mouse or touch) an overflowing tab bar and scrolls the activated tab into view. Tabs picked from the menu list then keep their place instead of moving first. |
| `tabScrollCorrection` | object | `{ rightCorrectionPx: 0 }` | `rightCorrectionPx` (px) is added to the width reserved for the tab utility buttons. Adjust by 1 when the last tab is cut off or leaves a gap. `opts` is merged shallowly, so pass the whole object. |
| `closeAllRedirectURL` | string \| null | `null` | "Close all" button: `null` asks `closeAllQ` and closes every tab except the active one; a URL asks `closeAllDQ` and then sets `location.href` to it. |
| `msgContext` | jQuery | `N(window)` | Context of the confirm dialogs (`closeAllQ`, `closeAllDQ`, `closeConf`, `maxStateful`), opened with `msgContext.alert({ confirm: true, ... })`. |
| `entireLoadIndicator` | boolean | `false` | Shows a progress bar (`.entire_load_indicator__`, placed after the tab bar, so MDI only) while Ajax requests are running. |
| `entireLoadScreenBlock` | boolean | `false` | Covers the page with `.entire_load_screen_block__` while Ajax requests are running, to prevent double submits. |
| `entireLoadExcludeURLs` | string[] | `[]` | Request URLs that do not change the running count. They still fire `onBeforeEntireLoad` / `onEntireLoad` and show the indicator and screen block when they run while no counted request is running. A request is excluded when its URL is a substring of the list joined with `\|`. |
| `alwaysOnTop` | boolean | `false` | Gives the "Menu list" dropdown the highest `z-index` among `alwaysOnTopCalcTarget` elements plus 1. The shipped config sets `true`. |
| `alwaysOnTopCalcTarget` | string | `"div, span, ul, p, nav, article, section, header, footer, aside"` | Elements scanned for the top `z-index` (menu list, load indicator, screen block). |
| `message` | object | — | Localized labels keyed by locale: `closeAll`, `closeAllTitle`, `closeAllQ`, `closeAllDQ`, `docList`, `docListTitle`, `selDocument`, `close`, `closeConf`, `maxTabs`, `maxStateful`. Supplied by the global configuration; see Global configuration. |

Defaults are the `NUS.docs` constructor values.[^ctor] Event handler options are listed under Events. `options` also holds internal state: `docs` (docId to document options), `order` (docIds by most recent activation, kept only while `maxStateful` > 0), `loadedDocId`, `entireLoadRequestCnt`, `entireLoadRequestMaxCnt`. `saveHistory` (`true`) is declared but never read.

Precedence: constructor defaults, then `N.context.attr("ui.shell").docs` (deep merge), then `opts` (shallow merge). A handler in `opts` replaces a global handler of the same name; they are not chained.

# Methods

## `context([selector])`

Returns the container, or `container.find(selector)` when `selector` is given.

## `add(docId, docNm, docOpts)`

Opens a document and returns the instance at once; the page loads asynchronously.[^add]

- `docId` (string): unique id. It becomes the CSS class `{docId}__` of the tab and the content section, so use only letters, digits, `-` and `_`.
- `docNm` (string): tab label; also fills the `selDocument` tab title and the `closeConf` / `maxStateful` messages.
- `docOpts` (object): options of this document only:

| Name | Type | Default | Description |
|---|---|---|---|
| `url` | string | `null` | URL of the block page. Required in practice. |
| `urlSync` | boolean | `true` | Passed to the page request: when `location.href` changed between request and response, `N.comm` drops the response and the page is not shown.[^submit] |
| `stateless` | boolean | `false` | Internal flag set when `maxStateful` removes the page's state; the next activation then reloads the page. Leave it `false`. |
| `onBeforeLoad` ... `onRemove` | function | `null` | Per-document versions of `onBeforeLoad`, `onLoad`, `onBeforeActive`, `onActive`, `onBeforeInactive`, `onInactive`, `onBeforeRemoveState`, `onRemoveState`, `onBeforeRemove`, `onRemove`. Same arguments; each runs right after the instance handler of the same name. |

`docId` and `docNm` are stored in the same object, which `doc(docId)` returns.

Steps:

1. A content section of `docId` that is still being removed is discarded.
2. MDI: if a tab for `docId` exists, `add()` only calls `active(docId)`. Nothing is loaded and `docs.request` is not consumed.
3. MDI: if `maxTabs` is reached, `add()` opens nothing. It tries to show the `maxTabs` message with `NUS.notify(...)`, but in `src/` and the `*.es6.min.js` bundles that call throws a `TypeError`; only the ES5 bundles show the message (see Known issues).
4. `removeState()` checks `maxStateful` and may ask for confirmation. The document is created only after OK; Cancel abandons the `add()`.
5. MDI: a tab is created (first, or last with `addLast`) and the current tab is deactivated.
6. The page is loaded (see Behavior), then `active(docId, false, true)` runs.

In SDI there are no tabs, so every `add()` loads the page again and replaces the previous one.

## `active(docId[, isFromDocsTabList[, isNotLoaded]])`

Activates a document and returns the instance. `isFromDocsTabList` and `isNotLoaded` are internal flags that are passed on to `onBeforeActive` and `onActive`. An unknown `docId` logs a warning and does nothing.[^active]

- MDI: deactivates the current tab, activates the tab (the `active__` class is set in a `setTimeout`) and shows its content. A `stateless` document is first reloaded through `removeState()` and then activated again. Updates `order` when `maxStateful` > 0.
- SDI: only swaps the visible content; no events fire.

## `removeState([docId][, callback])`

Enforces `maxStateful` and returns the instance.[^remove-state]

- `docId` defaults to the least recently activated document (the last entry of `order`). A function as the first argument is taken as `callback`.
- When `maxStateful` is not `0` and `order` holds `maxStateful` or more entries: fires `onBeforeRemoveState`, asks with the `maxStateful` message, and on OK marks the tab `stateless__`, removes its content section, fires `onRemoveState` and calls `callback(docId)` with `this` bound to the instance. Cancel calls nothing.
- Otherwise it removes nothing and calls `callback(docId)` at once.
- `callback` is required; without it the call throws when it reaches the callback.

## `remove(docId[, unconditional])`

Closes a document and returns the instance. An unknown `docId` logs a warning.[^remove]

1. Fires `onBeforeRemove` (also when the user cancels in the next step).
2. If an element in the document's content has the class `data_changed__` (set by [N.form](../ui/form.md), [N.list](../ui/list.md) and [N.grid](../ui/grid.md) on edited inputs) and `unconditional` is not `true`, asks with `closeConf`. Cancel focuses the first changed element.
3. Starts removing the tab and the content (all handlers inside are unbound), deletes the document from `doc()` and `order`, fires `onRemove`, and if the removed tab was active, activates the previous tab or, failing that, the next one. An inactive tab and a hidden section are removed at once; the active tab and the visible section first get the class `remove__` and are removed when their CSS transition ends (at once when they have no transition; the tab also by a timer fallback). With the shipped CSS both have transitions, so they can still be in the DOM during `onRemove`.

MDI only: in SDI no tab holds the document options and `remove()` throws a `TypeError`.

## `doc([docId])`

Returns the options object of `docId` (see `add()`), or the map of all documents when `docId` is omitted.

## `cont(docId)`

Returns the Controller object of the document's page (`.docs_contents__.{docId}__ > .view_context__`), or `undefined` while the page is not loaded or its state was removed.

## `reload(docId[, callback])`

Reloads a loaded document in place and returns the instance. Without a loaded controller it logs a warning.[^reload]

- Requests `cont.request.options.url` again into the same content section through the `N.comm` element path, reusing the old controller's request object. Attributes set on `docs.request` since the last load are merged into it (older attributes stay), then `docs.request` is cleared.
- `callback(cont)` receives the new Controller object; `this` is the communicator.
- `onBeforeLoad` and `onLoad` do not fire, and the new controller gets `request` but no `caller` or `docOpts` (see [CVC pattern](../architecture/cvc-pattern.md)).

## `request.attr(name[, value])`

`docs.request` is an [N.comm.request](../architecture/request.md) that the constructor creates for the `N.docs` instance itself. Use it to pass parameters to the next page that `N.docs` loads.[^request-attr]

- `attr(name, value)` stores a value and returns the **`N.docs` instance**, so `docs.request.attr("id", 1).add(...)` chains.
- `attr(name)` returns the value; `attr()` returns the whole map.
- The map is copied into the request of the next page load (an `add()` that loads, the reload of a stateless document, or `reload()`) and then cleared. The page reads it with `request.attr(name)`.

## `request.removeAttr(name)`

Deletes one pending attribute and returns the request object.

# Events

| Name | Signature | `this` | When |
|---|---|---|---|
| `onBeforeLoad` | `function(docId, target)` | the `N.docs` instance | Before the page request. `target` is the new, hidden `section.docs_contents__`. The Controller does not exist yet. |
| `onLoad` | `function(docId)` | the `N.docs` instance | After the page was inserted, its `init` was called, `cont.docOpts` was set and the first activation ran. |
| `onBeforeActive` | `function(docId, isFromDocsTabList, isNotLoaded)` | the `N.docs` instance | MDI. Before a tab is activated. `isFromDocsTabList` is `true` when the tab was picked from the menu list; `isNotLoaded` is `true` for the activation that follows a page load. |
| `onActive` | `function(docId, isFromDocsTabList, isNotLoaded)` | the `N.docs` instance | MDI. After a tab is activated. For a `stateless` document it fires only after the page has reloaded. |
| `onBeforeInactive` | `function(docId)` | the `N.docs` instance | MDI. Before the active tab (`docId`) is deactivated. |
| `onInactive` | `function(docId)` | the `N.docs` instance | MDI. After it was deactivated. |
| `onBeforeRemoveState` | `function(docId)` | the `N.docs` instance | Before the `maxStateful` confirmation for `docId`. |
| `onRemoveState` | `function(docId)` | the confirm `N.alert` instance | After the user confirmed and the content of `docId` was removed. See Known issues. |
| `onBeforeRemove` | `function(docId)` | the `N.docs` instance | At the start of `remove()`, before the `closeConf` confirmation. |
| `onRemove` | `function(docId)` | the `N.docs` instance | After removal of the tab and content has started and the document was deleted from `doc()` and `order`. The active document's tab and section are removed only when their CSS transition ends, so during `onRemove` they can still be in the DOM with the class `remove__`. |
| `onBeforeEntireLoad` | `function(docId)` | the `N.docs` instance | When any `N.comm` request starts while the running count is 0, including a request to an excluded URL. The indicator and screen block are shown at the same moment. `docId` is the last loaded document. |
| `onEntireLoad` | `function(docId, entireLoadRequestCnt, entireLoadRequestMaxCnt)` | the `N.docs` instance | When a request completes and the running count is 0 or less. An excluded request that completes while no counted request is running also fires it. |
| `onErrorEntireLoad` | `function(e, request, xhr, textStatus, callback)` | the `N.docs` instance | Added by the entire-load filter as an `N.comm` error handler to every request it sees. An Ajax error passes `(e, request, xhr, textStatus)`; an exception thrown in a `submit` callback makes `N.comm` pass `(xhr, textStatus, e, request, callback)`. The counters are reset. |

The first ten events can also be set per document in `docOpts` (see `add()`); the entire-load events are instance-only.[^docs]

# Global configuration

`N.context.attr("ui.shell").docs` is merged deeply over the constructor defaults. The shipped `natural.config.js` sets `alwaysOnTop: true` and all `message` keys for `ko_KR` and `en_US`. Keep them for the current locale: the MDI constructor reads `closeAll`, `closeAllTitle`, `docList` and `docListTitle`, and a missing locale entry throws. The shipped `N.context.attr("architecture").page.context` and `N.context.attr("ui").alert.container` point at the `N.docs` content area. See [Configuration](../setup/configuration.md).

# Behavior

- **Markup.** The container gets `docs__` (plus `multi__`, and `ios__` / `android__` on those platforms). MDI adds `nav.docs_tab_context__` holding `ul.docs_tabs__` and `ul.docs_tab_utils__` (Close all: `li.docs_tab_close_all_item__`; Menu list: `li.docs_tab_list_item__`). Each document gets `li.docs_tab__.{docId}__` with `a.docs_tab_active_btn__` and `a.docs_tab_close_btn__`, and `section.docs_contents__.{docId}__`, toggled with `visible__` / `hidden__`. The close button is hidden while only one tab is open.[^wrap]
- **Page loading.** `new N.comm({ url, urlSync, type: "GET", dataType: "html" })` fetches the page; the HTML is inserted into the section and the Controller is found as `section.children(".view_context__:last")`, so the View must be a top-level element of the page file. The Controller gets `caller` (the `N.docs` instance), `N.cont.trInit` runs its `init(view, request)`, and then `cont.docOpts` is set.[^load]
- **Event order on the first load (MDI):** `onBeforeInactive` / `onInactive` of the previous tab, `onBeforeLoad`, the page's `init`, `onBeforeActive`, `onActive`, `onLoad`.
- **Page context.** Every load, and every activation that shows a hidden document, sets `N.context.attr("architecture").page.context` and `N.context.attr("ui").alert.container` to the document's section, so `N.alert` and `N.popup` opened by that page are placed inside it.
- **maxStateful.** `order` lists the documents by most recent activation, at most `maxStateful` entries. When `add()` opens a new document, or a `stateless` document is activated, while `order` is full, the least recently activated document loses its state after confirmation: its content is removed, its tab stays (class `stateless__`) and its page reloads on the next activation, which may in turn remove another document's state.
- **Entire load.** When `onBeforeEntireLoad`, `onEntireLoad`, `entireLoadIndicator` or `entireLoadScreenBlock` is set, the constructor registers the communication filter `docsFilter__` in `N.context.attr("architecture").comm.filters` and rebuilds the filter list. `onErrorEntireLoad` alone does not register it. From the first document load on, the filter counts **every** `N.comm` request of the application, not only those of the loading page, except `entireLoadExcludeURLs`. The start test runs before the exclusion test, so an excluded request that starts while the count is 0 still fires `onBeforeEntireLoad`, shows the indicator or screen block, and fires `onEntireLoad` when it completes. Because the filter adds an error handler to every request it sees (excluded URLs included), `N.comm` no longer throws its default `NA.comm.submit.error` for failed requests. A second `N.docs` instance that also sets one of these options replaces the filter; an instance without them leaves the earlier filter, and its counters, in place. See [Communication filter](../architecture/communication-filter.md).[^ctor]
- **Menu list.** The "Menu list" button shows a dropdown of clones of the open tabs; picking one activates the document (and moves its tab first unless `tabScroll` is on).
- **SDI.** No tabs, so `maxTabs`, `maxStateful`, the activation events and `remove()` do not apply. Each `add()` removes the previous section after its CSS transition, and `doc()` keeps every `docId` ever added.

# Pitfalls

`add()` takes `docId`, `docNm` and `docOpts`; there is no `title` or `params` option. Pass parameters through `docs.request`.[^add]

```js
// Wrong (legacy): docs.add({ url: "page.html", title: "New Page", params: { foo: "bar" } });
docs.request.attr("foo", "bar");
docs.add("page0001", "New Page", { url: "page.html" });
```

Parameters go on the `N.docs` instance's own request before the page loads. The request of an already loaded controller is never copied to another document.[^load]

```js
// Wrong (legacy): docs.cont(docId).request.attr("userId", 123);
docs.request.attr("userId", 123).add("user0001", "User", { url: "html/user/user0001.html" });
```

`getTabList()` and `getActiveTab()` do not exist.

```js
// Wrong (legacy): docs.getTabList(); docs.getActiveTab();
const docIds = Object.keys(docs.doc());
const activeDocOpts = docs.context("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__").data("docOpts");
```

The constructor needs a jQuery object, not a selector string.[^ctor]

```js
// Wrong (legacy): const docs = new N.docs("#docs", { multi: true });
const docs = new N.docs(N("#docs"), { multi: true });
```

Calling `add()` for an open document only activates it: the page is not reloaded, and attributes set on `docs.request` stay pending for the next page that loads. To refresh an open document with new parameters, use `reload()`:

```js
docs.request.attr("userId", 456);
docs.reload("user0001");
```

`docOpts` is set on the Controller after `init` returns; read `this.docOpts` in later functions or in `onLoad`. `docs.cont(docId)` is `undefined` in `onBeforeLoad`.

Handlers are called with `this` bound to the `N.docs` instance (except `onRemoveState`), so write them as `function`, not as arrow functions, when they use `this.cont(docId)` or `this.doc(docId)`.

`docs.request` has no URL, so `docs.request.param()` throws; use only `attr` and `removeAttr` on it.

# Known issues

* **Reaching `maxTabs` throws instead of showing the message** - Actual: `NUS.docs.prototype.add` calls `NUS.notify({ html: true })` without `new`. `NUS.notify` is a class, so in `src/` and the `*.es6.min.js` bundles the call throws `TypeError: Class constructor ... cannot be invoked without 'new'`; the ES5 bundles compile the class to a function that re-dispatches with `new`, so the message appears there. In both cases no tab is opened. Likely intent: `new NUS.notify(...)` or `N.notify(...)`. Workaround: keep `maxTabs: 0` and check the count yourself before `add()`, for example `if (docs.context("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__:not(.remove__)").length >= 10) { N.notify.add("Close a tab first."); return; }`.[^add]
* **"Close all" leaves the closed documents registered** - Actual: the Close all handler in `NUS.docs.wrapEle` removes the other tabs and sections directly. `onBeforeRemove` / `onRemove` do not fire, `doc()` still lists the closed documents, `remove(docId)` on one of them throws a `TypeError`, and with `maxStateful` > 0 their ids stay in `order`, so a later `add()` can pick a closed document in `removeState()` and throw a `TypeError`. Likely intent: close them through `remove()`. Workaround: hide `li.docs_tab_close_all_item__` with CSS and close documents yourself through `remove()`, for example `const activeId = docs.context("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__").data("docOpts").docId; Object.keys(docs.doc()).forEach(function (id) { if (id !== activeId) { docs.remove(id, true); } });`.[^wrap][^remove-state]
* **Excluded URLs still start and end the entire load** - Actual: the `beforeSend` function of `docsFilter__` fires `onBeforeEntireLoad` and calls `NUS.docs.createLoadIndicator` whenever the running count is 0, before it checks `entireLoadExcludeURLs`, and `complete` fires `onEntireLoad` and removes the indicator whenever the count is 0 or less. A polling request to an excluded URL therefore flashes the indicator or screen block while the page is otherwise idle; the count itself never changes. Likely intent: excluded requests are ignored by the entire-load handling. Workaround: send such background requests with `jQuery.ajax` instead of `N.comm`, so the filter does not see them, or leave `entireLoadIndicator` and `entireLoadScreenBlock` off.[^ctor]
* **`onRemoveState` runs with the confirm dialog as `this`** - Actual: both the instance and the per-document `onRemoveState` are called inside the confirm dialog's `onOk`, where `this` is the `N.alert` instance. Likely intent: the `N.docs` instance, as for every other event. Workaround: use the `docs` variable instead of `this`.[^remove-state]

# Examples

MDI container with a menu:

```html
<ul id="menu">
    <li><a href="html/dept/dept0001.html" data-docid="dept0001">Departments</a></li>
    <li><a href="html/user/user0001.html" data-docid="user0001">Users</a></li>
</ul>
<div id="docs"></div>
```

```js
const docs = N("#docs").docs({
    maxStateful: 5,
    tabScroll: true,
    entireLoadIndicator: true,
    onActive: function (docId, isFromDocsTabList, isNotLoaded) {
        N("#menu a").removeClass("on").filter("[data-docid='" + docId + "']").addClass("on");
    },
    onLoad: function (docId) {
        N.log("loaded", docId, this.cont(docId).docOpts.url);
    }
});

N("#menu").on("click", "a", function (e) {
    e.preventDefault();
    const a = N(this);
    docs.add(a.data("docid"), a.text(), { url: a.attr("href") });
});
```

A document that closes itself (the Controller's `caller` is the `N.docs` instance):

```js
N(".user0001").cont({
    init: function (view, request) {
        N("#btnClose", view).on("click", () => {
            this.caller.remove(this.docOpts.docId);       // docOpts is set once init has returned
        });
    }
});
```

Per-document handler and forced close:

```js
docs.add("report01", "Monthly report", {
    url: "html/report/report01.html",
    onRemove: function (docId) {
        N.notify.add("Report closed.");
    }
});

docs.remove("report01", true);                            // skip the closeConf question
```

SDI container:

```js
const main = N("#main").docs({ multi: false });
main.add("home", "Home", { url: "html/home.html" });
main.add("notice", "Notice", { url: "html/notice.html" }); // replaces the home page
```

# Related

- [N.cont](../architecture/controller.md) - `caller`, `docOpts` and `init` of the loaded pages.
- [N.comm.request](../architecture/request.md) - `attr` and `removeAttr`, used by `docs.request`.
- [CVC pattern](../architecture/cvc-pattern.md) - how block pages are loaded and initialized.
- [N.tab](../ui/tab.md) - tabs inside a page; `N.docs` is the page-level container.
- [N.notify](notify.md) - the other Natural-UI.Shell component.
- [Configuration](../setup/configuration.md) - the `ui.shell` block and `architecture.page.context`.

[^docs]: NUS.docs implementation
[^ctor]: NUS.docs constructor (defaults, global config, entire-load filter, request)
[^docs-plugin]: NUS.prototype.docs jQuery plugin wrapper
[^wrap]: NUS.docs.wrapEle (markup, Close all and Menu list buttons)
[^load]: NUS.docs.loadContent (page request, caller, init, docOpts)
[^add]: NUS.docs.prototype.add
[^active]: NUS.docs.prototype.active
[^remove-state]: NUS.docs.prototype.removeState
[^remove]: NUS.docs.prototype.remove
[^reload]: NUS.docs.prototype.reload
[^request-attr]: NA.comm.request.prototype.attr (setter returns the owner object)
[^submit]: NA.comm.submit (urlSync check, error handlers, element path)
