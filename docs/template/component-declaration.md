---
type: API Reference
title: p.{component}.{id} declarations
description: How Natural-TEMPLATE turns p.{component}.{id} Controller properties into Natural-UI component instances, including p.select code and list binding, usage and action.
tags: [template, components, select, form]
symbols: [p.select, p.form, p.grid, p.popup, p.tab, NT.aop.codes, NT.aop.components, N.template.aop.codes, N.template.aop.components, NT.Options.Extra, NT.Options.Select, NT.Objects.Controller.InitialObject, search-box, search_box__, btn-search]
sources:
  - id: components
    resource: ../../src/natural.template.js
    title: NT.aop.components (creation, context, usage, action)
    symbol: NT.aop.components
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: e60d19c0f4b2
  - id: codes
    resource: ../../src/natural.template.js
    title: NT.aop.codes (p.select normalization and binding)
    symbol: NT.aop.codes
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: a2cf3eac0450
  - id: template
    resource: ../../src/natural.template.js
    title: NT.aop.template (order of components, events and actions)
    symbol: NT.aop.template
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: 3e774a9d9e0b
  - id: select
    resource: ../../src/natural.ui.js
    title: NU.select (key and val default to null)
    symbol: NU.select
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 8518b356a7d1
  - id: ui-plugins
    resource: ../../src/natural.ui.js
    title: NU.prototype.button (returns the jQuery collection)
    symbol: NU.prototype.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 99e7697d9987
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-TEMPLATE.md
    title: Legacy Natural-TEMPLATE guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

A Controller property named `p.{component}.{id}` declares a Natural-UI component: before `init`, Natural-TEMPLATE creates the component on the element `#{id}` of the view with the property value as options and replaces the property with the instance. `p.select.{id}` additionally loads and binds common codes or list data. The template must be activated first; see [Natural-TEMPLATE conventions](conventions.md).

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `p.{component}.{id}` | `"p.grid.master": { ...componentOptions }` | the property becomes the component instance |
| `p.select.{id}` | `{ code \| comm \| data, key, val, filter, selected }`, `[code, filter]` or `[comm, key, val, filter]` | the property becomes an array of `N.select` instances |
| `usage` | `usage: "search-box"` or `usage: { "search-box": { defaultButton, events } }` | makes the component a search box |
| `action` | `action: "method"` or `action: ["method", arg1, ...]` | calls the method on the new instance before `init` |
| `N.template.aop.codes` | `N.template.aop.codes(cont, joinPoint)` | `undefined` (entry point, called by the `^init$` advisor) |
| `N.template.aop.components` | `N.template.aop.components(cont, prop, compActionDefer)` | `undefined` (internal) |

# Options

Options understood by the template itself. Every other key is passed to the component unchanged, except that `code` is reserved for `p.select`: a declaration other than `p.button`, `p.popup`, `p.tab` or `p.datepicker` that has a truthy `code` option is not created, and the property keeps its options object.[^components] See the component's page ([N.form](../ui/form.md), [N.grid](../ui/grid.md), [N.select](../ui/select.md), ...).

| Name | Type | Default | Description |
|---|---|---|---|
| `context` | selector \| element \| jQuery | `#{id}` in the view | Element(s) of the component, resolved with `N(context, cont.view)`. Use it to target a class or another selector. Not used by `p.select`. |
| `action` | string \| array | `undefined` | Method to call on the new instance after all components and events are set up, just before `init`: `"bind"`, or `["bind", data]` for arguments. Not used by `p.select`. |
| `usage` | string \| object | `undefined` | `"search-box"`, or `{ "search-box": { defaultButton, events } }`; meant for `p.form`. |
| `code` | string | `undefined` | `p.select`: code group to bind from the common-code request. |
| `comm` | string | `undefined` | `p.select`: name of the `c.*` property whose communicator returns the list. |
| `data` | object[] | `undefined` | `p.select`: list to bind directly, without a request. |
| `key` | string | `null` | `p.select`: row property shown as the label. An `N.select` option; its default is `null`. |
| `val` | string | `null` | `p.select`: row property used as the value. An `N.select` option; its default is `null`. |
| `filter` | function | `undefined` | `p.select`: `filter(data)` returns the list that is bound. |
| `selected` | string | `undefined` | `p.select`: value selected after binding, set with `select.val(selected)`. |

Sub-options of `usage["search-box"]`:[^components]

| Name | Type | Default | Description |
|---|---|---|---|
| `defaultButton` | selector | `".btn-search"` | Element clicked when Enter is pressed in an input of the component. Searched in the whole view. |
| `events` | object[] | `[]` | `{ event, target, handler }` entries bound on `context.find(target)` as `{event}.{pageid}`. Their targets are excluded from the Enter handling. |

# Functions

## `"p.{component}.{id}": opts`

Runs in declaration order, after the `p.select` requests have finished and before any `e.*` binding.[^template][^components]

- The name must have three segments: `component` is the name of a Natural-UI plugin (`form`, `grid`, `list`, `pagination`, `tree`, `popup`, `tab`, `datepicker`, `button`, `alert`, `select`) and `id` is the element id.
- The element is `N("#{id}", cont.view)`, or `N(opts.context, cont.view)` when `context` is given; it is written back to `opts.context`.
- How the component is created and what the property holds afterwards:

| `component` | Created with | Property value |
|---|---|---|
| `button` | `opts.context.button(opts)` | the jQuery collection (the `N.button` plugin returns it), or `undefined` when the element is not `a`, `button` or `input[type=button]`[^ui-plugins] |
| `popup`, `tab`, `datepicker` | `opts.context[component](opts)` | the `N.popup` / `N.tab` / `N.datepicker` instance |
| `select` | `NT.aop.codes` (next entry) | array of `N.select` instances |
| any other | `N([])[component](opts)`, with the element in `opts.context` | the instance (`N.form`, `N.grid`, `N.list`, `N.pagination`, `N.tree`, `N.alert`), except that a declaration with a truthy `code` option is not created: the property keeps its options object, and a `usage` or `action` on it then throws a `TypeError` |

- `p.popup` with a `url`, and every `p.tab`, get `opener: cont` unless `opener` is set. The popup and tab constructors currently lose this option; see Known issues on [N.cont](../architecture/controller.md).
- The id `file` is reserved for popups: `p.popup.file` is forced to `url: "file/manager.view"`, `top: 20`, `onOpen: "onOpen"`, `overlayClose: false`, `escClose: false`.
- Throws `MSG-0005` ("Component (pageid:prop) was incorrectly specified") when the name has fewer than three segments, or when no element is found and the options have neither `context` nor `url`. A `context` that matches nothing is not reported, and a `p.popup` with `url` needs no element.

The instance's options stay readable as `cont["p.grid.master"].options`.

## `"p.select.{id}": opts | array`

Handled by `NT.aop.codes` before every other declaration.[^codes]

Array forms are converted to objects first:

| Array | Becomes |
|---|---|
| `[code]` or `[code, filter]` (length 1 or 2) | `{ code, filter }` |
| `[comm, key, val]` or `[comm, key, val, filter]` (length 3 or 4) | `{ comm, key, val, filter }` |

Then each declaration is bound by the first matching source:

1. **`code`**: all code selects of the page share one request, `N({ codes: [code, ...] }).comm({ url: codeUrl }).submit(...)`, sent with the global request options (the shipped config posts JSON: `{"codes":["gender","eyeColor"]}`). The response must be an array of rows; the rows whose `row[codeKey] === code` are bound. `codeUrl` and `codeKey` come from `N.context.attr("template").aop.codes`.
2. **`comm`**: `cont[comm]()` is called and submitted; its response is bound.
3. **`data`**: the list is bound at once, without a request.
4. None of them: throws `MSG-0001`.

Binding: every element of the view with `id="{id}"` that is a `select`, `input[type=checkbox]` or `input[type=radio]` gets its own `N.select` (`N(list).select(opts).bind()`), after `filter` and followed by `val(selected)`. The property becomes the array of those instances in document order, so several elements may share one declaration (for example the same select in a search form and in a detail form). `key` and `val` must come from the declaration or from `N.context.attr("ui").select`, because `N.select` defaults both to `null`.[^select]

The template waits for every code and `comm` request before it creates the other components and runs `init`.

## `usage: "search-box" | { "search-box": { defaultButton, events } }`

Turns the component (normally `p.form`) into a search box:[^components]

- Adds the class `search_box__` to the context.
- Calls `add()` on the instance at once, so the form has a data row and `cont["p.form.search"].data()` works in `c.*` functions. With `action: "add"` the call is left to `action`.
- Binds `keyup.{pageid}` on the context for every `:input` except the `events` targets: Enter clicks `cont.view.find(defaultButton)`. In Internet Explorer Enter also blurs the input.
- Binds each `events` entry with `context.find(target).on(event + "." + pageid, handler)`.

Any truthy `usage` value switches this on, because the defaults always contain `"search-box"`.

## `action: "method" | ["method", ...args]`

Queues a call on the new instance. Queued actions run in declaration order after every `p.*` component has been created and every `e.*` binding is in place, just before `init`:[^components][^template]

- string: `cont[prop][method]()`;
- array with at least two items: `cont[prop][method](...args)`;
- anything else (a function, a one-item array) is ignored.

## `N.template.aop.codes(cont, joinPoint)`

Entry point of Natural-TEMPLATE. Call it from an `^init$` around advisor; it binds the `p.select` declarations, then runs `NT.aop.template`, which creates the other components, binds events, runs actions and finally calls `joinPoint.proceed()`. See [Natural-TEMPLATE conventions](conventions.md).[^codes]

| Message | Thrown when |
|---|---|
| `MSG-0001` | a `p.select` declaration has no `code`, `comm` or `data` |
| `MSG-0002` | the common-code request fails |
| `MSG-0003` | the `comm` name is not a property of the controller |
| `MSG-0004` | a `comm` request fails |
| `MSG-0005` | a `p.*` declaration is invalid (see the first entry) |

The texts come from `N.context.attr("template").message` for the current locale.

## `N.template.aop.components(cont, prop, compActionDefer)`

Internal: creates the component of one `p.*` property and pushes a Deferred for its `action` onto `compActionDefer`. `NT.aop.template` calls it for every `p.` property.[^components]

# Pitfalls

`p.select.{id}` holds an **array** of `N.select` instances, not one instance.[^codes]

```js
// Wrong (legacy): N.log(cont["p.select.id"].val());
N.log(cont["p.select.id"][0].val());
```

`action` names a method; a function is ignored.[^components]

```js
// Wrong (legacy): "p.grid.master": { action: function () { this.bind([]); } }
"p.grid.master": { action: "bind" }
"p.grid.master": { action: ["bind", []] }
```

Component event options such as `onBind` and `onSelect` are called with `this` bound to the component. An arrow function loses it.

```js
// Wrong (legacy): "p.grid.master": { onBind: (context, data, isFirstPage) => { if (isFirstPage) { this.select(0); } } }
"p.grid.master": { onBind: function (context, data, isFirstPage, isLastPage) { if (isFirstPage) { this.select(0); } } }
```

A `code` declaration without `key` and `val` binds `undefined` labels unless `N.context.attr("ui").select` supplies them:

```js
"p.select.gender": { code: "gender", key: "codeName", val: "code", selected: "M" }
```

`p.button.{id}` holds the jQuery collection; get the `N.button` instance with `instance("button")`:

```js
cont["p.button.btnSave"].instance("button").disable();
```

Every `p.select.{id}` needs an element with that id in the view. Otherwise the property becomes an empty array, the component step that follows the code and list requests throws `MSG-0005`, and `init` never runs. The `context` option does not apply to `p.select`.[^components]

The Enter key of a search box clicks `.btn-search` by default. Give the search button that class, or set `defaultButton`:

```js
"p.form.search": { usage: { "search-box": { defaultButton: "#btnSearch" } } }
```

Do not name a popup `p.popup.file`: its `url` and several options are overwritten.

# Known issues

* **TypeScript declares the wrong types for `p.select.*` and `p.button.*`** - Actual: `NT.Objects.Controller.Object` types them as `NU.Select` and `NU.Button`, while the runtime values are an array of `NU.Select` and the jQuery collection. Likely intent: `NU.Select[]` and the collection. Workaround: cast (`cont["p.select.gender"] as unknown as NU.Select[]`). See [TypeScript](../setup/typescript.md).[^codes][^components]
* **A one-item `action` array does nothing** - Actual: `NT.aop.components` runs an array action only when `opts.action.length > 1`, so `action: ["bind"]` is silently ignored. Likely intent: call the method without arguments. Workaround: use the string form, `action: "bind"`.[^components]

# Examples

Common codes, a list from a communicator, and fixed data:

```js
const cont = N(".sample0002").cont({
    "p.select.gender": [ "gender" ],                           // key/val from N.context.attr("ui").select
    "p.select.eyeColor": { code: "eyeColor", key: "codeName", val: "code", selected: "BL" },
    "p.select.age": [ "c.getAgeList", "age", "age", function (data) {
        return N(N.array.deduplicate(data, "age")).datasort("age");
    }],
    "p.select.useYn": { data: [ { label: "Yes", value: "Y" }, { label: "No", value: "N" } ], key: "label", val: "value" },

    "c.getAgeList": () => N({}).comm("sample/getAgeList.json"),

    init: (view, request) => {
        cont["p.select.eyeColor"][0].val("GR");
    }
});
```

A common-code response for `codeKey: "group"`:

```json
[
    { "group": "gender", "code": "M", "codeName": "Male" },
    { "group": "gender", "code": "F", "codeName": "Female" },
    { "group": "eyeColor", "code": "BL", "codeName": "Blue" }
]
```

Search box, detail form bound to another element, grid, popup and tab:

```js
const cont = N(".sample0003").cont({
    "p.form.search": { usage: "search-box" },
    "p.form.detail": { context: ".detail", revert: true, autoUnbind: true },
    "p.grid.master": {
        height: 300,
        select: true,
        action: "bind",
        onSelect: function (index, rowEle, data, beforeRow, e) {
            cont["p.form.detail"].bind(index, data);      // the form edits the grid's row object
        }
    },
    "p.popup.dept": {
        url: "html/popup/deptPopup.html",
        onOpen: "onOpen",
        onClose: function (onCloseData) {
            if (onCloseData) {
                cont["p.form.detail"].val("deptCd", onCloseData.deptCd).val("deptNm", onCloseData.deptNm);
            }
        }
    },
    "p.tab.info": {},

    init: (view, request) => {
        cont["p.form.search"].val("name", "Kim");
    }
});
```

# Related

- [Natural-TEMPLATE conventions](conventions.md) - installation, lifecycle and naming rules.
- [e.{id}.{event} event binding](event-binding.md) - the `e.*` declarations that run after the components.
- [N.select](../ui/select.md) - `key`, `val`, radio and checkbox binding.
- [N.form](../ui/form.md) - `add()`, `data()` and `val()` used with search boxes.
- [N.grid](../ui/grid.md) - grid options and events used in `p.grid` declarations.
- [N.popup](../ui/popup.md) - `url`, `onOpen` and `onClose` of `p.popup` declarations.

[^components]: NT.aop.components (creation, context, usage, action)
[^codes]: NT.aop.codes (p.select normalization and binding)
[^template]: NT.aop.template (order of components, events and actions)
[^select]: NU.select (key and val default to null)
[^ui-plugins]: NU.prototype.button (returns the jQuery collection)
