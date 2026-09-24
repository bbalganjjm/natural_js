---
type: Configuration
title: natural.config.js
description: Reference for dist/natural.config.js, the script that fills N.context with the core, architecture, data, ui, ui.shell, template and code settings.
tags: [project, configuration, context]
symbols: [N.context, N.context.attr, NA.context, N.config, NA.config, N.locale, natural.config.js]
sources:
  - id: config
    resource: ../../dist/natural.config.js
    title: Shipped natural.config.js
    git_blob: 97217df2cf95b5f51f3a6f5dc0948a67afc6e9b8
  - id: context
    resource: ../../src/natural.architecture.js
    title: NA.context (N.context.attr)
    symbol: NA.context
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: a0dd406b9703
  - id: config-class
    resource: ../../src/natural.architecture.js
    title: NA.config (cached filter configuration)
    symbol: NA.config
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 9a52b4e73e53
  - id: request
    resource: ../../src/natural.architecture.js
    title: NA.comm.request constructor (request option defaults)
    symbol: NA.comm.request
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: b2f7caecba91
  - id: filters
    resource: ../../src/natural.architecture.js
    title: NA.comm.initFilterConfig (filter ordering)
    symbol: NA.comm.initFilterConfig
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 0aa8cfdde898
  - id: comm
    resource: ../../src/natural.architecture.js
    title: NA.comm constructor (beforeInit filters, filter cache)
    symbol: NA.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 40c48fda4ea0
  - id: submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (filters, gcMode, urlSync)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: aop
    resource: ../../src/natural.architecture.js
    title: NA.cont.aop (advisors and pointcuts)
    symbol: NA.cont.aop
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: d502a8d7e4f4
  - id: alert
    resource: ../../src/natural.ui.js
    title: NU.alert (container fallback, message keys, input options)
    symbol: NU.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5933b105d560
  - id: ui-utils
    resource: ../../src/natural.ui.js
    title: NU.ui.utils.wrapHandler (global event handler chaining)
    symbol: NU.ui.utils
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 190de240129d
  - id: datepicker
    resource: ../../src/natural.ui.js
    title: NU.datepicker constructor (monthonlyOpts)
    symbol: NU.datepicker
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 173f5ab718b0
  - id: grid-sort
    resource: ../../src/natural.ui.js
    title: NU.grid.sort (sortableItem)
    symbol: NU.grid.sort
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: bbcb36f68989
  - id: tab
    resource: ../../src/natural.ui.js
    title: NU.tab constructor (wrapHandler only in the single-object form)
    symbol: NU.tab
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 7281df6a6e18
  - id: button
    resource: ../../src/natural.ui.js
    title: NU.button constructor (option precedence)
    symbol: NU.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c3c35975533f
  - id: docs
    resource: ../../src/natural.ui.shell.js
    title: NUS.docs (overwrites page.context and alert.container, adds docsFilter__)
    symbol: NUS.docs
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: eb0057a9f328
  - id: message
    resource: ../../src/natural.core.js
    title: NC.message.get (locale lookup)
    symbol: NC.message
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 6818eb3bc817
  - id: locale
    resource: ../../src/natural.core.js
    title: NC.locale
    symbol: NC.locale
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: f894f93da288
  - id: bytelength
    resource: ../../src/natural.core.js
    title: NC.string.byteLength (charByteLength)
    symbol: NC.string.byteLength
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: e17b2fe46fc7
  - id: mapfromkeys
    resource: ../../src/natural.core.js
    title: NC.json.mapFromKeys (excludeMapFromKeys)
    symbol: NC.json.mapFromKeys
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 1fb76e59b63b
  - id: gc
    resource: ../../src/natural.core.js
    title: NC.gc (gcMode targets)
    symbol: NC.gc
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: fcd6397e7c4c
  - id: format
    resource: ../../src/natural.data.js
    title: ND.formatter.prototype.format (format rule lookup)
    symbol: ND.formatter.prototype.format
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 62abb5c89072
  - id: validator
    resource: ../../src/natural.data.js
    title: ND.validator (validation rule and message lookup)
    symbol: ND.validator
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 3783dcab12fc
  - id: template
    resource: ../../src/natural.template.js
    title: NT.aop (template.aop.codes and template.aop.template)
    symbol: NT.aop
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: 974f8f618d80
  - id: inspection
    resource: ../../src/natural.code.js
    title: NCD.inspection (code.inspection settings)
    symbol: NCD.inspection
    git_blob: cace23c7b3b7bc5cd23c75a516220586472d7b3c
    symbol_sha1: 62ffc7a7cafc
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CONFIG.md
    title: Legacy config reference (removed)
  - id: legacy-gs
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-GETTINGSTARTED.md
    title: Legacy getting started guide, configuration part (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`natural.config.js` is the application's configuration script: it stores one settings block per package in `N.context` (environment values, AOP advisors, communication filters, global component options and message bundles). Every Natural-JS application loads a copy of `dist/natural.config.js` right after the library bundle. Keys, shipped values and built-in defaults below are taken from the shipped file and the code that reads them.

# Location and load order

- The shipped file is `dist/natural.config.js`. It is maintained by hand (the build does not generate it); copy it into your application and edit the copy.
- It is a classic script, `(function(N) { ... })(N)`, so it must run after the bundle has defined `window.N` and after jQuery (it calls `$.extend`). See [Installation](installation.md) for the tag order.
- It makes seven calls, each replacing one block:[^config]

| Block | Read by | Required |
|---|---|---|
| `N.context.attr("core")` | Natural-CORE utilities, `N.locale`, `N(el).vals()` | yes |
| `N.context.attr("architecture")` | `N.comm`, `N.cont`, `N.ds`, `N.gc.ds` | yes |
| `N.context.attr("data")` | `N.formatter`, `N.validator`, `N.date`, `N.datepicker` | yes |
| `N.context.attr("ui")` | Natural-UI components | yes |
| `N.context.attr("ui.shell")` | `N.notify`, `N.docs` | yes when Natural-UI.Shell is used |
| `N.context.attr("template")` | `N.template.aop` | only with a `+template` bundle |
| `N.context.attr("code")` | `N.code.inspection` | only with a `+code` bundle |

- Right after the data block it runs `$.extend(N.formatter, N.context.attr("data").formatter.userRules)` and `$.extend(N.validator, N.context.attr("data").validator.userRules)`. Keep both lines; they install custom rules.
- Values are read when they are used (when a component is created, when `N.comm` runs), not when the file loads. Changing `N.context.attr("ui").grid.height` at runtime affects grids created afterwards. There are two exceptions. `architecture.comm.filters` is compiled once into `N.config.filterConfig` on the first `N.comm` call.[^comm] `data.formatter.userRules` and `data.validator.userRules` are copied into `N.formatter` / `N.validator` by the two `$.extend` lines when the file loads, and rules are looked up only as `N.formatter[name]` / `N.validator[name]`; to add a rule later, run `$.extend(N.formatter, {...})` (or `N.validator`) directly.[^config][^format][^validator]

## `N.context.attr(name[, obj])`

- `N.context.attr(name)` returns the stored object (or `undefined`).
- `N.context.attr(name, obj)` stores `obj` under `name`, **replacing** the previous object (no merge), and returns `N.context`.
- `N.context.attr()` returns `N.context`. All blocks live in `N.context.attrObj`.[^context]

`N.context` is also a general store for application data that must survive while the page is loaded (`N.context.attr("user", {...})`). See [Context](../architecture/context.md).

# Schema

"Built-in default" is the value the reading code uses when the key is absent; "—" means there is none, so removing the shipped key breaks the feature that reads it.

## core

| Key | Shipped | Built-in default | Description |
|---|---|---|---|
| `locale` | `"ko_KR"` | — | Current locale. `N.locale()` returns it, `N.locale(str)` sets it.[^locale] Every message bundle is indexed by it, so it must be a key that all bundles define (`"ko_KR"` and `"en_US"` are shipped). |
| `sgChkdVal` | `"Y"` | — | Value of a lone checked checkbox in `N(el).vals()` and in data binding. |
| `sgUnChkdVal` | `"N"` | — | Value of a lone unchecked checkbox. |
| `spltSepa` | `"$@^"` | — | Internal separator used to build lookup strings (filter ordering, `N.select` index lookup, `N.form` column lists). Must not occur in data values. |
| `gcMode` | `"full"` | — | Name of the `N.gc` function, `"full"` or `"minimum"`, that `N.comm` runs before it loads HTML into the `page.context` element.[^submit][^gc] |
| `charByteLength` | `3` | `3` in `N.string.byteLength` | Bytes counted per character at U+0800 or above by `N.string.byteLength` and by the `maxbyte`, `minbyte`, `rangebyte` rules when their byte argument is omitted. Characters U+0080 to U+07FF always count 2 bytes, ASCII 1.[^bytelength] |
| `excludeMapFromKeys` | not shipped | — | Array of property names appended to every `N.json.mapFromKeys` key list (used by `data(true, ...cols)` of data components). See Known issues. |

## architecture

| Key | Shipped | Built-in default | Description |
|---|---|---|---|
| `page.context` | `".docs__ > .docs_contents__.visible__"` | — | jQuery selector of the element that hosts block pages. **Required.** In an SPA use the element menu pages are loaded into; otherwise `"body"` or the element wrapping all content. `N.docs` overwrites it (and `ui.alert.container`) with the active document's content element, a jQuery object, every time it loads or shows a document.[^docs] Read by `N.alert` (container fallback), `N.ds`, `N.gc.ds` and `N.comm`. |
| `cont` | `{}` | — | Controller AOP settings: `advisors` and `pointcuts` (below). There is no `architecture.aop` key.[^aop] |
| `comm.filters` | `{}` | — | Communication filters, `{ name: { order, beforeInit, afterInit, beforeSend, success, error, complete } }` (below). |
| `comm.request.options.type` | `"POST"` | `"POST"` | HTTP method. |
| `comm.request.options.contentType` | `"application/json; charset=utf-8"` | same | Request content type. |
| `comm.request.options.cache` | `true` | `false` | `jQuery.ajax` cache flag. |
| `comm.request.options.urlSync` | `true` | `true` | For data requests, drops the response (aborts and warns) when `location.href` changed between request and response. |
| `comm.request.options.browserHistory` | `false` | `true` | Not read by any code. |
| `comm.request.options.append` | `false` | `false` | For HTML page loads, append the page instead of replacing the target's content. |
| other `comm.request.options` | not shipped | `url: null`, `referrer: window.location.href` (taken when the request is created; compared with `location.href` by `urlSync`), `async: true`, `data: null`, `dataIsArray: false`, `dataType: "json"`, `crossDomain: false`, `target: null` | Any `jQuery.ajax` setting can be added; the merged options are passed to `N.ajax`.[^request] |

### `cont.advisors`

An array of advisor objects, applied when a controller is initialized (block page loaded by `N.comm`, `N.popup`, `N.tab` or `N.docs`). Details: [AOP](../architecture/aop.md).[^aop]

| Field | Type | Meaning |
|---|---|---|
| `pointcut` | string \| RegExp \| `{ type, param, selector }` | Which controller functions to wrap. A string is a regular expression tested against the function path (`"init"`, `"p.grid.list.onSelect"`); text before its last `:` is a jQuery selector the view must match (`".page01:^init$"`). |
| `adviceType` | `"before"` \| `"after"` \| `"around"` \| `"error"` | When `fn` runs. |
| `fn` | function | `before`: `fn(contFrag, fnChain, args)`; `after`: `fn(contFrag, fnChain, args, result)`; `around`: `fn(contFrag, fnChain, args, joinPoint)`, call `joinPoint.proceed()` to run the original and return its result; `error`: `fn(contFrag, fnChain, args, e)`, whose return value becomes the result. `this` is the advisor; `contFrag` is the object that owns the function. |

`cont.pointcuts` adds pointcut types: `{ typeName: { fn: function (param, contFrag, fnChain) { return true; } } }`. The built-in type is `regexp`.

### `comm.filters`

Each filter is an object with an optional `order` and any of six hooks. Filters with `order` run first (see Known issues for how `order` is sorted), then the others in key order.[^filters][^submit] Details: [Communication filter](../architecture/communication-filter.md).

| Hook | Called as | Return value |
|---|---|---|
| `beforeInit` | `fn(obj)`, `obj` = the data collection given to `N.comm` | a value other than `undefined` replaces `obj`; an `Error` stops, and `N.comm` returns the collection without `submit` |
| `afterInit` | `fn(request)` | an `Error` cancels `submit` |
| `beforeSend` | `fn.call(comm, request, xhr, settings)` | an `Error` cancels the request |
| `success` | `fn.call(comm, request, data, textStatus, xhr)` | a value other than `undefined` replaces `data`; an `Error` stops before the callback |
| `error` | `fn.call(comm, request, xhr, textStatus, e)` | an `Error` suppresses the registered error handlers |
| `complete` | `fn.call(comm, request, xhr, textStatus)` | an `Error` skips later complete filters |

`N.docs` registers its own filter, `docsFilter__`, when its entire-load options are used.[^docs]

## data

| Key | Shipped | Built-in default | Description |
|---|---|---|---|
| `formatter.userRules` | `{}` | — | Custom format rules, `name: function (str, args, ele) { return formatted; }`. Installed into `N.formatter` by the `$.extend` line. Names must be lowercase.[^format] |
| `formatter.date.dateSepa` | `"-"` | — | Date separator used by the format functions below and stripped by the `date` validation rule. |
| `formatter.date.timeSepa` | `":"` | — | Time separator used by the format functions and the `time` format rule. |
| `formatter.date.Ym` | returns `"Y" + dateSepa + "m"` | — | Year-month format. Formats use `Y` year, `m` month, `d` day, `H` hour, `i` minute, `s` second. |
| `formatter.date.Ymd` | returns `"Y" + dateSepa + "m" + dateSepa + "d"` | — | Year-month-day format. |
| `formatter.date.YmdH` | `this.Ymd() + " H"` | — | Date and hour format. |
| `formatter.date.YmdHi` | `this.Ymd() + " H" + timeSepa + "i"` | — | Date, hour and minute format. |
| `formatter.date.YmdHis` | `this.Ymd() + " H" + timeSepa + "i" + timeSepa + "s"` | — | Date and time format. |
| `validator.userRules` | `{}` | — | Custom validation rules, `name: function (str, args) { return true; }` (`true` = valid). Installed into `N.validator`. Names must be lowercase. |
| `validator.message` | `{ ko_KR: {...}, en_US: {...} }` | — | Error message per locale per rule name; `global` is the fallback. `{0}`, `{1}` ... are replaced by the rule arguments.[^validator] |

The date functions are called as methods of `formatter.date` (`this.dateSepa`), so keep them as `function`, not arrow functions. They are read by `N.date`, the `date` format rule and `N.datepicker`.

## ui

| Key | Shipped | Built-in default | Description |
|---|---|---|---|
| `alert.container` | `".docs__ > .docs_contents__.visible__"` | `architecture.page.context` | jQuery selector of the element that holds `N.alert` and `N.popup` elements. **Required** in practice: `N.alert` throws when it resolves to no element. Usually the same as `page.context`; `N.docs` overwrites it.[^alert][^docs] |
| `alert.okButtonOpts` | `{ color: "primary", size: "medium" }` | `null` | `N.button` options for the OK button. See Known issues. |
| `alert.cancelButtonOpts` | `{ color: "primary_container", size: "medium" }` | `null` | `N.button` options for the Cancel button. |
| `alert.input.displayTimeout` | `7000` | — | Milliseconds a message shown on an input element (validation messages) stays visible. `N.alert` has no own `input` default, so keep this key. |
| `alert.input.closeBtn` | `"&times;"` | — | Not read by any code. |
| `alert.alwaysOnTop` | `true` | `false` | Keep dialogs above other elements. |
| `alert.draggableOverflowCorrectionAddValues` | `{ top: 0, bottom: 0, left: +2, right: -2 }` | all `0` | Offsets applied when a dragged dialog is moved back inside the window. |
| `alert.draggable` | `true` | `false` | Drag dialogs by the title bar. |
| `alert.saveMemory` | `true` | `false` | Drop the dialog's references to the message and its variables once the dialog element is built. |
| `alert.message` | `confirm`, `cancel` per locale | — | Button labels. See Known issues (`close`). |
| `datepicker.monthonlyOpts.yearsPanelPosition` | `"left"` | `"left"` | Applied only when the `monthonly` option is `true`: `"left"` or `"top"`.[^datepicker] |
| `datepicker.monthonlyOpts.monthsPanelPosition` | `"left"` | `"left"` | Same, for the month panel. |
| `datepicker.message` | per locale | — | Labels and input error messages. |
| `popup.alwaysOnTop` | `true` | `false` | As for alert. |
| `popup.draggable` | `true` | `false` | As for alert. |
| `popup.saveMemory` | `true` | `false` | Drop the internal alert's message reference once the popup is built. |
| `popup.button` | `false` | `true` | Create the OK and Cancel buttons. |
| `tab.tabScrollCorrection.tabContainerWidthCorrectionPx` | `1` | `0` | Pixels added to the tab bar width when `tabScroll` is on. |
| `tab.tabScrollCorrection.tabContainerWidthReCalcDelayTime` | `0` | `0` | Delay (ms) before recalculating the tab bar width. |
| `list.message` | `empty` per locale | — | Text shown when a list has no data. |
| `grid.sortableItem` | `{ asc: "▲", desc: "▼" }` | — | Sort indicators (HTML allowed). Required when `sortable` is used. See Known issues.[^grid-sort] |
| `grid.message` | per locale | — | Grid labels (`empty`, `search`, `selectAll`, `dFilter`, `more`, `column`, `showHide`, `prev`, `next`). |
| `grid.misc.*` | browser-dependent correction values; `fixedcolRootContainer: ".view_context__"` | `fixedcolBodyAddHeight: 1`, others `0` or `null` | Pixel corrections for `resizable` and `fixedcol` grids. See [N.grid](../ui/grid.md). |

Any other component name under `ui` (`button`, `select`, `form`, `pagination`, `tree`, or extra keys for the shipped ones such as `grid.height`) is merged into that component's options as a site-wide default.[^button]

## ui.shell

| Key | Shipped | Built-in default | Description |
|---|---|---|---|
| `notify.alwaysOnTop` | `true` | `false` | Keep notifications above other elements. |
| `notify.message` | `close` per locale | — | Close button label. |
| `docs.alwaysOnTop` | `true` | `false` | Keep the document list dialog above other elements. |
| `docs.message` | per locale | — | Labels and confirmation messages of `N.docs`. |

## template

| Key | Shipped | Built-in default | Description |
|---|---|---|---|
| `aop.codes.codeUrl` | `null` | `null` | URL that returns the common code list for `p.select.*` code bindings.[^template] |
| `aop.codes.codeKey` | `null` | `null` | Property name of the code group in each code row. |
| `aop.template` | not shipped | all `null` | Optional hooks `onBeforeInitComponents`, `onInitComponents`, `onBeforeInitEvents`, `onInitEvents`, called with `(cont, joinPoint)`. |
| `message` | `MSG-0001` to `MSG-0006` per locale | — | Natural-TEMPLATE error messages. |

Nothing in the library calls `N.template.aop.codes`. Natural-TEMPLATE processing of `p.`, `c.` and `e.` controller properties starts only when an `around` advisor calls it (see Examples). See [Template conventions](../template/conventions.md).

## code

| Key | Shipped | Built-in default | Description |
|---|---|---|---|
| `inspection.abortOnError` | `false` | — | When `true`, `N.code.inspection.report.console` throws on a Blocker or Critical finding instead of logging it.[^inspection] |
| `inspection.excludes` | `[]` | — | Strings; a detected code line containing one of them is not reported. |
| `inspection.message` | per locale | — | Messages for the `NoContextSpecifiedInSelector` and `UseTheComponentsValMethod` rules. |

`N.code.inspection.test` throws unless `N.context.attr("code").inspection` exists. See [Code inspection](../code/inspection.md).

## Message bundles

Every `message` object above except `data.validator.message` is read with `N.message.get` as `bundle[N.locale()][key]`: a missing locale throws a `TypeError`, and a missing key returns the key itself.[^message] `data.validator.message` is read directly by the validator: a missing locale also throws, and a missing rule key falls back to the locale's `global` message.[^validator] To add a language, copy the `en_US` object of **every** bundle under the new locale name.

# Precedence

Component options, lowest to highest (details in [API conventions](../overview/api-conventions.md)):[^button]

1. Constructor defaults of the component.
2. `N.context.attr("ui").<component>` or `N.context.attr("ui.shell").<component>`.
3. `data-opts` on the context element (`N.button`; `N.tab` per tab).
4. The `opts` argument of the constructor or plugin.

`N.alert`, `N.popup`, `N.tab`, `N.list`, `N.grid` and `N.docs` merge the global block deeply; the other components merge it shallowly, so a nested object there replaces the default object.

Event handlers: when a handler is set both globally and locally, and the component wraps that handler name, the **local handler runs first**; the global one runs next unless the local one returns `false`.[^ui-utils] Wrapped names:

| Component | Handlers chained with a global handler |
|---|---|
| `N.alert` | `onOk`, `onCancel`, `onBeforeShow`, `onShow`, `onBeforeHide`, `onHide`, `onBeforeRemove`, `onRemove` |
| `N.button` | `onBeforeCreate`, `onCreate` |
| `N.datepicker` | `onChangeYear`, `onChangeMonth`, `onSelect`, `onBeforeShow`, `onShow`, `onBeforeHide`, `onHide` |
| `N.popup` | `onOk`, `onCancel`, `onBeforeShow`, `onShow`, `onBeforeHide`, `onHide`, `onBeforeRemove`, `onRemove`, `onOpen`, `onClose`, `onLoad` |
| `N.form` | `onBeforeBind`, `onBind`, `onBeforeBindValue`, `onBindValue` |
| `N.list`, `N.grid` | `onBeforeSelect`, `onSelect`, `onBind` |
| `N.pagination` | `onChange` |
| `N.tree` | `onSelect`, `onCheck` |

Other handlers in the global block are plain defaults that a local handler replaces. `N.select`, `N.tab`, `N.notify` and `N.docs` chain none. (`N.tab` calls the wrapper only in its single-object form, `new N.tab({ context, ... })`, and there it wraps the undefined second argument, so a local `onActive` / `onLoad` always replaces the global one.)[^tab]

`N.comm` requests: the `NA.comm.request` defaults, then `architecture.comm.request.options`, then the options given to `N.comm`. When the target is an element (HTML page load), `submit` forces `type: "GET"`, `dataType: "html"` and `contentType: "text/html; charset=UTF-8"`.[^request][^submit]

# Examples

A page without `N.docs` that loads block pages into `#contents` (edit both values in your copy):

```js
N.context.attr("architecture", {
    "page": {
        "context": "#contents"
    },
    // cont, comm ... unchanged
});

N.context.attr("ui", {
    "alert": {
        "container": "#contents",
        // okButtonOpts, input, message ... unchanged
    },
    // other blocks unchanged
});
```

Site-wide defaults and a global handler, added inside the existing `ui` block (keep the shipped `grid` keys):

```js
"grid": {
    "height": 300,
    "sortableItem": { "asc": "▲", "desc": "▼" },
    "message": { /* shipped bundle */ },
    "misc": { /* shipped values */ }
},
"button": {
    "size": "small",
    "onCreate": function (context, opts) {
        context.attr("data-ready", "Y");
    }
}
```

Runtime changes after the file has loaded:

```js
N.context.attr("ui").grid.height = 400;   // mutate; never N.context.attr("ui", { grid: {...} })
N.locale("en_US");                        // must be a locale present in every message bundle
```

Custom rules (lowercase names) and their message:

```js
"formatter": {
    "userRules": {
        "yesno": function (str, args) {
            return str === "Y" ? "Yes" : "No";
        }
    },
    // date ... unchanged
},
"validator": {
    "userRules": {
        "evennumber": function (str, args) {
            return Number(str) % 2 === 0;
        }
    },
    "message": {
        "ko_KR": { /* shipped keys */ "evennumber": "짝수만 입력할 수 있습니다." },
        "en_US": { /* shipped keys */ "evennumber": "Enter an even number." }
    }
}
```

```html
<input id="useYn" type="text" data-format='[["yesno"]]'>
<input id="qty" type="text" data-validate='[["required"], ["evennumber"]]'>
```

A communication filter that adds a header and unwraps responses:

```js
"comm": {
    "filters": {
        "common": {
            "order": 1,
            "beforeSend": function (request, xhr, settings) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            },
            "success": function (request, data, textStatus, xhr) {
                return data && data.result !== undefined ? data.result : data;
            }
        }
    },
    "request": { /* shipped options */ }
}
```

Activating Natural-TEMPLATE with an `around` advisor on `init` (inside the `architecture` block):

```js
"cont": {
    "advisors": [{
        "pointcut": "^init$",
        "adviceType": "around",
        "fn": function (cont, fnChain, args, joinPoint) {
            N.template.aop.codes(cont, joinPoint); // binds codes, creates p.* components, binds e.* events, then joinPoint.proceed()
        }
    }]
}
```

# Pitfalls

Key paths that the legacy guides got wrong:

```js
// Wrong (legacy): N.context.attr("ui").alert.context = "#contents";
N.context.attr("ui").alert.container = "#contents";
// Wrong (legacy): "alert": { "global": { "okBtnStyle": { color: "yellowgreen", size: "medium" }, "cancelBtnStyle": { size: "medium" } } }
"alert": { "okButtonOpts": { color: "primary", size: "medium" }, "cancelButtonOpts": { color: "primary_container", size: "medium" } }
// Wrong (legacy): "grid": { "message": { asc: "▼", desc: "▲" } }
"grid": { "sortableItem": { "asc": "▲", "desc": "▼" } }
// Wrong (legacy): N.context.attr("template").codes = { codeUrl: "code.json", codeKey: "code" };
N.context.attr("template").aop.codes = { codeUrl: "code.json", codeKey: "code" };
// Wrong (legacy): N.context.attr("code", { abortOnError: false, excludes: [] });
N.context.attr("code", { inspection: { abortOnError: false, excludes: [], message: { /* ... */ } } });
// Wrong (legacy): N.context.attr("architecture").aop = { advisors: [...] };
N.context.attr("architecture").cont.advisors = [ /* ... */ ];
```

- The legacy guides (and the `N.config` comment in `@types/natural.js.d.ts`) say a global event handler runs before the local one. The code runs the local handler first; see Precedence.[^ui-utils]
- `N.context.attr(name, obj)` replaces the whole block. Calling it with a partial object after the config has loaded drops every other key (for example `alert.container`); mutate the returned object instead.[^context]
- Custom rule names are lowercased before lookup, so a rule named `userRule` can never be called; name it `userrule`.[^format][^validator]
- `N.locale("en-US")` or `N.locale("en")` makes every message lookup throw; the shipped locale keys are `"ko_KR"` and `"en_US"`.[^message]
- Filters added to `architecture.comm.filters` after the first `N.comm` call are ignored because the compiled list is cached in `N.config.filterConfig`. Reset it with `N.config.filterConfig = undefined;` so the next `N.comm` rebuilds it.[^comm][^config-class]
- Rules added to `N.context.attr("data").formatter.userRules` or `validator.userRules` after the file has loaded are never found, because only the `$.extend` lines copy them into `N.formatter` / `N.validator`. Add a runtime rule with `$.extend(N.formatter, { myrule: function (str, args, ele) { /* ... */ } })`.[^config][^format]
- `alert.input.displayTimeout`, `grid.sortableItem` and the `message` bundles have no built-in defaults. Removing them makes input messages, grid sorting or labels throw.
- The shipped `page.context` and `alert.container` point at the `N.docs` container. Without `N.docs`, set both to your own container (or `"body"`), or `N.alert` throws "Container element is missing".[^alert]

# Known issues

* **Some validation messages are never shown** - Actual: the validator looks up `message[locale][rule]` with the lowercased rule name, but the shipped keys `acceptFileExt`, `notAccept`, `notMatch` and `notAcceptFileExt` are camelCase, and `ko_KR` names the combined rule `frn_ssn` while the rule is `frn_rrn`; those failures show the `global` message. `equalTo` has no matching rule at all. Likely intent: one message per rule. Workaround: add lowercase keys (`acceptfileext`, `notaccept`, `notmatch`, `notacceptfileext`, and `frn_rrn` under `ko_KR`) to your copy.[^validator][^config]
* **`grid.sortableItem` keys are swapped** - Actual: after an ascending sort the header shows `sortableItem.desc` (shipped `"▼"`, class `asc__`); after a descending sort it shows `sortableItem.asc` (`"▲"`, class `desc__`). Likely intent: `asc` is shown for ascending order. Workaround: put the indicator you want for ascending order in `desc` and vice versa.[^grid-sort]
* **`alert.message` has no `close` key** - Actual: `N.alert` reads `message[locale].close` for the title-bar close button and the close link of input messages; the key is missing in both shipped locales, so the tooltip is the literal text `close`. Likely intent: a translated label. Workaround: add `"close"` to each locale of `ui.alert.message`.[^alert][^config]
* **`alert.input.closeBtn` has no effect** - Actual: no code reads it. Likely intent: markup of the close button of input messages. Workaround: none; style `.msg_close__` in CSS instead.[^alert]
* **Local `okButtonOpts` / `cancelButtonOpts` are ignored while the global ones exist** - Actual: `N.alert` passes these option objects through the event-handler wrapper, which replaces a local value with a function whenever `ui.alert.okButtonOpts` (or `cancelButtonOpts`) is also set; `N.button` then receives that function and neither the local nor the global style is applied. Likely intent: local options override the global ones. Workaround: remove the key from `ui.alert` to use per-dialog button options, or style the buttons after the dialog is created.[^alert][^ui-utils]
* **Global `tab.onActive` / `tab.onLoad` are never chained** - Actual: `N.tab` calls the handler wrapper only when its first argument is a plain options object, and then passes the second argument, which that form leaves undefined; in the plugin form and `new N.tab(context, opts)` the wrapper never runs. A local handler therefore always replaces the global one, and the global one runs only for tabs that set no local handler. Likely intent: chain them like the other components. Workaround: call the global handler from the local one, `N.context.attr("ui").tab.onActive.apply(this, arguments)`.[^tab][^ui-utils]
* **Filter `order` is sorted as text** - Actual: ordered filters are sorted by the string `order + spltSepa + name`, so `order: 10` runs before `order: 2`. Likely intent: numeric order. Workaround: use single-digit orders or zero-padded strings (`"01"`, `"02"`, `"10"`).[^filters]
* **`core.excludeMapFromKeys` includes keys** - Actual: the listed names are appended to the requested key list, so `N.json.mapFromKeys` (and `data(true, ...cols)`) copies them into the result when present. Likely intent: unclear; the name suggests exclusion. Workaround: leave it unset unless you want those keys always included.[^mapfromkeys]

# Related

- [Installation](installation.md) - where the config file goes in the script order.
- [API conventions](../overview/api-conventions.md) - option precedence and `data-opts`.
- [Context](../architecture/context.md) - the `N.context` store itself.
- [AOP](../architecture/aop.md) and [Communication filter](../architecture/communication-filter.md) - full semantics of `cont.advisors` and `comm.filters`.
- [Validator](../data/validator.md) - rule catalog behind `validator.message`.

[^config]: Shipped natural.config.js
[^context]: NA.context (N.context.attr)
[^config-class]: NA.config (cached filter configuration)
[^request]: NA.comm.request constructor (request option defaults)
[^filters]: NA.comm.initFilterConfig (filter ordering)
[^comm]: NA.comm constructor (beforeInit filters, filter cache)
[^submit]: NA.comm.submit (filters, gcMode, urlSync)
[^aop]: NA.cont.aop (advisors and pointcuts)
[^alert]: NU.alert (container fallback, message keys, input options)
[^ui-utils]: NU.ui.utils.wrapHandler (global event handler chaining)
[^datepicker]: NU.datepicker constructor (monthonlyOpts)
[^grid-sort]: NU.grid.sort (sortableItem)
[^tab]: NU.tab constructor (wrapHandler only in the single-object form)
[^button]: NU.button constructor (option precedence)
[^docs]: NUS.docs (overwrites page.context and alert.container, adds docsFilter__)
[^message]: NC.message.get (locale lookup)
[^locale]: NC.locale
[^bytelength]: NC.string.byteLength (charByteLength)
[^mapfromkeys]: NC.json.mapFromKeys (excludeMapFromKeys)
[^gc]: NC.gc (gcMode targets)
[^format]: ND.formatter.prototype.format (format rule lookup)
[^validator]: ND.validator (validation rule and message lookup)
[^template]: NT.aop (template.aop.codes and template.aop.template)
[^inspection]: NCD.inspection (code.inspection settings)
