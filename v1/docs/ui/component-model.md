---
type: Overview
title: Natural-UI component model
description: Rules shared by every Natural-UI component - construction forms, plugin return values, instance storage, option precedence, global event handlers and the data-bound API.
tags: [ui, component, overview]
symbols: [NU, NU.ui, NU.ui.utils, NU.ui.utils.wrapHandler, N().instance, NC.prototype.instance]
sources:
  - id: ui-utils
    resource: ../../src/natural.ui.js
    title: NU.ui.utils (wrapHandler, isTextInput)
    symbol: NU.ui.utils
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 190de240129d
  - id: plugin-alert
    resource: ../../src/natural.ui.js
    title: NU.prototype.alert jQuery plugin wrapper
    symbol: NU.prototype.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: efe17ef81c7a
  - id: plugin-button
    resource: ../../src/natural.ui.js
    title: NU.prototype.button jQuery plugin wrapper
    symbol: NU.prototype.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 99e7697d9987
  - id: plugin-select
    resource: ../../src/natural.ui.js
    title: NU.prototype.select jQuery plugin wrapper
    symbol: NU.prototype.select
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: fd1fe9f48a24
  - id: plugin-grid
    resource: ../../src/natural.ui.js
    title: NU.prototype.grid jQuery plugin wrapper
    symbol: NU.prototype.grid
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: aa060d1d1faa
  - id: form
    resource: ../../src/natural.ui.js
    title: NU.form implementation (data-bound constructor pattern)
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: list-data
    resource: ../../src/natural.ui.js
    title: NU.list.prototype.data (row status filters)
    symbol: NU.list.prototype.data
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: fc3bea325dea
  - id: instance
    resource: ../../src/natural.core.js
    title: NC.prototype.instance (N(selector).instance)
    symbol: NC.prototype.instance
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: de8beae8138f
  - id: to-opts
    resource: ../../src/natural.core.js
    title: NC.element.toOpts (data-opts reader)
    symbol: NC.element.toOpts
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 29751ebee9fa
  - id: ds
    resource: ../../src/natural.data.js
    title: ND.ds data synchronization
    symbol: ND.ds
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 64d1318e0071
  - id: bootstrap
    resource: ../../src/natural.js.js
    title: Object.assign(N, NU) and jQuery.fn registration
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

Natural-UI (`NU`, copied onto `N`) is the jQuery-based component layer of Natural-JS: dialogs, buttons, pickers, tabs, and data-bound components that render JSON arrays. Every component follows the same rules for construction, instance lookup, option merging and global event handlers; read this page before any single component page.

# What it is

- Components are ES classes declared as `static <name> = class` members of `NU` in `src/natural.ui.js`. `src/natural.js.js` copies them onto `N` with `Object.assign(N, NC, NA, ND, NU, NUS)` and registers every `NU.prototype` method as a jQuery plugin (`jQuery.fn[key]`).[^bootstrap]
- `N.alert`, `N.grid`, ... are therefore **classes**: call them with `new`. Calling one without `new` throws a `TypeError`. (Only `N.comm` and `N.notify` are factory functions.)
- Every component reads its global defaults from `N.context.attr("ui")`, so `natural.config.js` must be loaded first; a missing `ui` block makes the constructor throw. See [Configuration](../setup/configuration.md).
- Natural-UI.Shell components ([N.notify](../ui-shell/notify.md), [N.docs](../ui-shell/documents.md)) live in `src/natural.ui.shell.js` and are documented separately.

# Map

| Component | Page | Plugin form | Class form | Data-bound |
|---|---|---|---|---|
| `N.alert` | [alert.md](alert.md) | `N(context).alert(msg\|opts[, vars])` | `new N.alert(context, msg\|opts[, vars])` | no |
| `N.button` | [button.md](button.md) | `N(elements).button([opts])` | `new N.button(context[, opts])` | no |
| `N.datepicker` | [datepicker.md](datepicker.md) | `N(input).datepicker([opts])` | `new N.datepicker(context[, opts])` | no |
| `N.popup` | [popup.md](popup.md) | `N(context).popup([opts\|url])` | `new N.popup(context[, opts\|url])` | no |
| `N.tab` | [tab.md](tab.md) | `N(context).tab([opts])` | `new N.tab(context[, opts])` | no |
| `N.select` | [select.md](select.md) | `N(data).select(context\|opts)` | `new N.select(data, context\|opts)` | yes |
| `N.form` | [form.md](form.md) | `N(data).form(context\|opts)` | `new N.form(data, context\|opts)` | yes |
| `N.list` | [list.md](list.md) | `N(data).list(context\|opts)` | `new N.list(data, context\|opts)` | yes |
| `N.grid` | [grid.md](grid.md) | `N(data).grid(context\|opts)` | `new N.grid(data, context\|opts)` | yes |
| `N.pagination` | [pagination.md](pagination.md) | `N(data).pagination(context\|opts)` | `new N.pagination(data, context\|opts)` | yes |
| `N.tree` | [tree.md](tree.md) | `N(data).tree(context\|opts)` | `new N.tree(data, context\|opts)` | yes |

Visual styles for all of them come from `css/natural.ui.css`; see [Theming](theming.md).

# Key concepts

## Two construction forms

- **Plugin form** `N(x).comp(arg)`: the plugin calls `new NU.comp(this, arg)`, so the `N(x)` receiver becomes the first constructor argument. For element components (`alert`, `button`, `datepicker`, `popup`, `tab`) the receiver is the context element; for data-bound components it is the data array.[^plugin-grid]
- **Class form** `new N.comp(first, second)`: element components use the first argument as-is, so it must already be a jQuery object (`N("#id")`). A selector string throws a `TypeError` because the constructors call jQuery methods on it. Exceptions: `N.alert` also accepts the raw `window` object, `N.tab` also accepts a single options object that contains `context`, and `N.popup` accepts a single options object (typically with `url`).
- Data-bound components wrap their second argument with `N()`, so a selector string, a jQuery object or an options object with a `context` key all work there.[^form]

## What each plugin returns

| Plugin | Returns |
|---|---|
| `N(context).alert(...)` | the `N.alert` instance (created hidden; call `show()`)[^plugin-alert] |
| `N(elements).button(...)` | the **NJS collection** (`this.each(...)`), one `N.button` per element; `undefined` when no element is `a`, `button` or `input[type=button]`[^plugin-button] |
| `N(input).datepicker(...)` | one `N.datepicker` instance for the whole collection |
| `N(context).popup(...)`, `N(context).tab(...)` | the instance |
| `N(data).select/form/list/grid/pagination/tree(...)` | the instance[^plugin-select] |

Only `button` breaks the rule; read its instances back with `N(selector).instance("button")`.

## Instance storage and `N(el).instance(name)`

Every constructor stores itself with `element.instance(name, this)`, which is jQuery data under the key `name + "__"`.[^instance]

| Component | Name | Stored on |
|---|---|---|
| alert | `"alert"` | the dialog element `.block_overlay_msg__` (window and element mode) or the input (tooltip mode) |
| button | `"button"` | each button element |
| datepicker | `"datepicker"` | the context input(s) |
| popup | `"popup"` | the context element (context mode) or the loaded page's top-level nodes (url mode, after loading) |
| tab, select, form, list, grid, pagination, tree | component name | the context element |

`NC.prototype.instance` (`N(selector).instance(...)`) has five forms:[^instance]

| Call | Result |
|---|---|
| `instance()` | collection of every component instance stored on the elements |
| `instance(name)` | `undefined` if none, the instance if exactly one, otherwise a collection of instances |
| `instance(name, callback)` | calls `callback.call(inst, name, inst)` for each match; returns the collection |
| `instance(callback)` | calls `callback.call(inst, name, inst)` for every instance of any name |
| `instance(name, value)` | stores `value` (used by the constructors) |

Use a regular `function` for callbacks; an arrow function does not receive the instance as `this` (use the second argument instead).

## Option precedence

The effective options are built in the constructor, lowest to highest priority:

1. Constructor defaults (the `this.options = {...}` literal).
2. Global configuration `N.context.attr("ui").<component>`.
3. The `data-opts` attribute, only where the component reads it (see below).
4. The options argument.

The merge depth differs per component, which matters for nested option objects:

| Component | Merge | Notes |
|---|---|---|
| alert, popup | deep (`jQuery.extend(true, ...)`) | A popup passes its whole option object to an internal `N.alert`, so `ui.alert` values fill keys the popup does not define. |
| list, grid | deep | |
| tab | global deep; options shallow in `N(ctx).tab(opts)` / `new N.tab(ctx, opts)`, deep in the single-object form `new N.tab({ context, ... })` | Per-tab `data-opts` are read only when `tabOpts` is empty. |
| button, datepicker, select, form, pagination, tree | shallow | A nested object in the options (for example datepicker `holiday`) replaces the global one entirely. `datepicker` also applies `ui.datepicker.monthonlyOpts` when `opts.monthonly === true`. |

`data-opts` on the context element is read (through `NC.element.toOpts`) only by `N.button`; `N.tab` reads `data-opts` on each `li`. `N.select` calls the reader before its context is set, so it has no effect there. Data-bound components are configured in markup through `data-format` and `data-validate` on the bound inputs instead; see [Formatter](../data/formatter.md) and [Validator](../data/validator.md).[^to-opts]

## Global event handlers

`NU.ui.utils.wrapHandler(opts, compNm, eventNm)` combines a handler passed in the options with a handler of the same name in `N.context.attr("ui")[compNm]`:[^ui-utils]

- It acts only when **both** exist. The local handler runs first; the global one runs next with the same `this` and arguments, unless the local handler returns `false`. The wrapper returns the global handler's return value.
- `onBeforeBindValue` (form) is special: the global handler is called as `(firstArg, localReturnValue)` and its return value wins.
- When only the global handler exists, it is merged into the options like any other global default and runs alone.

| Component | Events that are chained |
|---|---|
| alert | `onOk`, `onCancel`, `onBeforeShow`, `onShow`, `onBeforeHide`, `onHide`, `onBeforeRemove`, `onRemove` |
| button | `onBeforeCreate`, `onCreate` |
| datepicker | `onChangeYear`, `onChangeMonth`, `onSelect`, `onBeforeShow`, `onShow`, `onBeforeHide`, `onHide` |
| popup | `onOk`, `onCancel`, `onBeforeShow`, `onShow`, `onBeforeHide`, `onHide`, `onBeforeRemove`, `onRemove`, `onOpen`, `onClose`, `onLoad` (and again with the `ui.alert` handlers inside the internal alert) |
| form | `onBeforeBindValue`, `onBindValue`, `onBeforeBind`, `onBind` |
| list, grid | `onBeforeSelect`, `onSelect`, `onBind` |
| pagination | `onChange` |
| tree | `onSelect`, `onCheck` |
| tab | none: the constructor never wraps `onActive` / `onLoad` effectively, so a local handler replaces the global one (see [N.tab](tab.md)) |

`N.alert` also passes `okButtonOpts` and `cancelButtonOpts` through `wrapHandler`, which breaks them when they are set both globally and locally; see [N.alert](alert.md).

## `this` in event handlers

Handlers are normally called with `this` bound to the component instance, which is why the pages use `function () {}` rather than arrow functions. Documented exceptions: [N.popup](popup.md) dialog handlers run with the internal `N.alert` (or the dialog element) as `this`, `N.alert` `onHide` / `onRemove` run with the dialog element as `this`, and `N.popup` `onLoad` runs with the `N.comm` instance that loaded the page as `this`.

## The `context([selector])` method

Every component has `context(sel)`: it returns `options.context`, or `options.context.find(sel)` when `sel` is given.

## Common API of data-bound components

| Method | form | list, grid | select | Notes |
|---|---|---|---|---|
| `data()` | array | array | array | `options.data.get()`: plain array of the bound row objects (same references). |
| `data(false)` | wrapped set | wrapped set | wrapped set | The live NJS collection held in `options.data`. |
| `data(true[, key...])` | `[currentRow]` | - | selected rows | form: extra arguments pick keys via `N.json.mapFromKeys`. |
| `data(rowStatus[, key...])` | - | filtered rows | - | `"modified"` (any `rowStatus`), `"insert"`, `"update"`, `"delete"`, `"selected"`, `"checked"`. |
| `bind(...)` | `bind([row][, data])` | `bind([data][, callType])` | `bind([data])` | Renders; passing data replaces `options.data`. |
| `add(...)` | `add([data][, row])` | `add([data][, row])` | - | New rows get `rowStatus: "insert"`. |
| `remove(...)` | `remove()` | `remove(row\|rows)` | `remove(value)` | An `"insert"` row is spliced out; any other row gets `rowStatus: "delete"` and the class `row_data_deleted__`. |
| `revert(...)` | `revert()` | `revert([row\|rows])` | - | Requires the `revert: true` option, otherwise throws. |
| `val(...)` | `val(key[, val][, notify])` | `val(row, key[, val])` | `val([val])` | Getter without a value. |

Row status (`rowStatus` property written into the row objects):[^list-data]

| Value | Set when |
|---|---|
| `"insert"` | `add()` created the row |
| `"update"` | a bound value of an existing row changed |
| `"delete"` | `remove()` hit a row that was not inserted |

Rows without `rowStatus` are unchanged. Send `data("modified")` (list, grid) or `data(true)` (form) to the server; see [Data utilities](../data/data-utilities.md).

## Data synchronization (`N.ds`)

`N.form` (standalone, not the row forms of list and grid), `N.list`, `N.grid` and `N.tree` register with `ND.ds` in their constructors. After a change, `ND.ds.instance(inst).notify(row, key)` calls `update(row, key)` on every other registered instance whose `options.data` is **the same object**; a form updates only when `row` is its current row.[^ds]

- `N(x).form(...)` wraps `x` in a new collection, so it does not share identity with `x`. To share data, hand over the other component's `data(false)` object itself: `form.bind(row, grid.data(false))`, `new N.form(grid.data(false), "#detail")` or `{ data: grid.data(false), context: "#detail" }` (a wrapped set is stored as-is; only plain arrays are re-wrapped).
- `N.select` and `N.pagination` do not register.
- Details: [Data sync](../data/datasync.md).

## CSS classes set by components

Each component adds a root class ending in `__` to its context (`button__`, `datepicker__`, `tab__`, `select__`, `form__`, `list__`, `grid__`, `pagination__`, `tree__`; `alert__` and `popup__` go on the dialog element) and uses `visible__` / `hidden__` classes with CSS transitions for show and hide. Event handlers such as `onShow` and `onHide` fire when that transition ends. Naming rules and tokens: [Theming](theming.md).

# Where to go next

- [N.button](button.md) - the reference component page; the simplest component.
- [N.alert](alert.md) and [N.popup](popup.md) - dialogs; popup is built on alert.
- [N.form](form.md), [N.grid](grid.md) - the main data-bound components.
- [Theming](theming.md) - tokens, light and dark color schemes, class conventions.
- [Configuration](../setup/configuration.md) - where `N.context.attr("ui")` defaults and global handlers are defined.
- [N()](../core/n-function.md) - the `N()` function and `N(selector).instance(...)`.

[^ui-utils]: NU.ui.utils (wrapHandler, isTextInput)
[^plugin-alert]: NU.prototype.alert jQuery plugin wrapper
[^plugin-button]: NU.prototype.button jQuery plugin wrapper
[^plugin-select]: NU.prototype.select jQuery plugin wrapper
[^plugin-grid]: NU.prototype.grid jQuery plugin wrapper
[^form]: NU.form implementation (data-bound constructor pattern)
[^list-data]: NU.list.prototype.data (row status filters)
[^instance]: NC.prototype.instance (N(selector).instance)
[^to-opts]: NC.element.toOpts (data-opts reader)
[^ds]: ND.ds data synchronization
[^bootstrap]: Object.assign(N, NU) and jQuery.fn registration
