---
type: API Reference
title: N()
description: N(selector[, context]) returns a jQuery collection built by the NJS subclass; Natural-JS adds the :regexp selector and core plugin methods such as instance, tpBind, vals and events.
tags: [core, selector, jquery-plugin, instance]
symbols: [N(), N, NJS, N().selector, N().instance, NC.prototype.instance, N().tpBind, NC.prototype.tpBind, N().vals, NC.prototype.vals, N().events, NC.prototype.events, N().remove_, NC.prototype.remove_, ":regexp", jQuery.expr.pseudos.regexp]
sources:
  - id: njs
    resource: ../../src/natural.js.js
    title: N(), class NJS and the jQuery.fn installation loop (src/natural.js.js)
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: instance
    resource: ../../src/natural.core.js
    title: NC.prototype.instance (N(selector).instance)
    symbol: NC.prototype.instance
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: de8beae8138f
  - id: tpbind
    resource: ../../src/natural.core.js
    title: NC.prototype.tpBind (N(selector).tpBind)
    symbol: NC.prototype.tpBind
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: e0ae17970a75
  - id: vals
    resource: ../../src/natural.core.js
    title: NC.prototype.vals (N(selector).vals)
    symbol: NC.prototype.vals
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 4178ea152b93
  - id: events
    resource: ../../src/natural.core.js
    title: NC.prototype.events (N(selector).events)
    symbol: NC.prototype.events
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: a106f4e76d1e
  - id: remove
    resource: ../../src/natural.core.js
    title: NC.prototype.remove_ (N(selector).remove_)
    symbol: NC.prototype.remove_
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 279f8d4c2470
  - id: toselector
    resource: ../../src/natural.core.js
    title: NC.toSelector (source of the selector property)
    symbol: NC.toSelector
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 1a93cc546c71
  - id: regexp
    resource: ../../src/natural.core.js
    title: jQuery.expr.pseudos.regexp (IIFE after class NC, whole-file fingerprint)
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CORE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N(selector[, context])` is the entry point of Natural-JS: it returns a jQuery collection and is also the namespace object that carries every static API (`N.grid`, `N.string`, `N.comm`, ...). Natural-JS installs its plugin methods on `jQuery.fn`, so collections from `N()`, `$()` and `jQuery()` all have them, while the static functions exist only on `N`. This page covers `N()` itself, the `:regexp` selector and the core plugin methods `instance`, `tpBind`, `vals`, `events` and `remove_`.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N()` | `N([selector[, context]])` | jQuery collection with a `selector` string property |
| `N().instance` | `instance([name][, instance])` | instance, collection of instances, `undefined` or the collection (depends on the call form) |
| `N().tpBind` | `tpBind(events[, data], handler)` | the collection |
| `N().vals` | `vals([vals])` | selected value(s) in get mode, the collection in set mode |
| `N().events` | `events([eventType[, namespace]])` | jQuery event object, handler array or `undefined` |
| `N().remove_` | `remove_(idx[, length])` | the collection (items removed) |
| `:regexp` | `selector:regexp(attribute[:property], pattern)` | elements whose value matches `pattern` |

# Constructor

## `N([selector[, context]])`

- Takes the same arguments as `jQuery(selector[, context])`: a selector string, an HTML string, an element, an array of elements, a jQuery object, a plain object, an array of plain objects or a DOM-ready function. `context` narrows a selector string.
- Implementation: `N(selector, context)` returns `new NJS(selector, context)`; `class NJS extends jQuery` calls `super(selector, context)` and then sets `this.selector = N.toSelector(selector)`.[^njs]
- The result is an ordinary jQuery object (jQuery's constructor returns a `jQuery.fn.init` object), so `N(x) instanceof jQuery` is `true` and `N(x) instanceof NJS` is `false`. Test for a collection with `N.isWrappedSet(obj)`.
- `selector` property: a string produced by `N.toSelector` (a selector string is kept as is, an element becomes `tag#id.class1.class2`, an array becomes `...[type](length)`).[^toselector] Only the object returned directly by `N()` has it; sets produced by jQuery traversal (`find`, `filter`, `eq`) and by `$()` do not. `N(view).cont(...)` uses it to derive `data-pageid` when the view has no `id`; see [Controller](../architecture/controller.md).
- Data components wrap data the same way: `N([{...}, {...}])` is a collection whose items are the row objects, and `N({ key: "value" })` wraps one object (`N(rows).grid(...)`, `N(params).comm(url)`).

`N` is also the namespace. `src/natural.js.js` runs `Object.assign(N, NC, NA, ND, NU, NUS)`, which copies every static member (component classes and utility namespaces) onto `N`. Component classes must be called with `new` (`new N.grid(...)`); only `N.comm(...)` and `N.notify(...)` are replaced by factory functions that call `new` for you (`N.notify.add` is copied onto the factory).[^njs] See [API conventions](../overview/api-conventions.md).

# Methods

Every own method of `NC.prototype`, `NA.prototype`, `ND.prototype`, `NU.prototype` and `NUS.prototype` is copied onto `jQuery.fn`, except `constructor` and `request`.[^njs]

| `jQuery.fn` method | Defined in | Documented in |
|---|---|---|
| `instance`, `tpBind`, `vals`, `events`, `remove_` | `NC.prototype` | this page |
| `comm(url)` | `NA.prototype` | [Communicator](../architecture/communicator.md) |
| `cont(contObj)` | `NA.prototype` | [Controller](../architecture/controller.md) |
| `datafilter(condition)`, `datasort(key, reverse)` | `ND.prototype` | [Data utilities](../data/data-utilities.md) |
| `formatter(rules)` | `ND.prototype` | [N.formatter](../data/formatter.md) |
| `validator(rules)` | `ND.prototype` | [N.validator](../data/validator.md) |
| `alert`, `button`, `datepicker`, `popup`, `tab`, `select` | `NU.prototype` | [N.alert](../ui/alert.md), [N.button](../ui/button.md), [N.datepicker](../ui/datepicker.md), [N.popup](../ui/popup.md), [N.tab](../ui/tab.md), [N.select](../ui/select.md) |
| `form`, `list`, `grid`, `pagination`, `tree` | `NU.prototype` | [N.form](../ui/form.md), [N.list](../ui/list.md), [N.grid](../ui/grid.md), [N.pagination](../ui/pagination.md), [N.tree](../ui/tree.md) |
| `notify`, `docs` | `NUS.prototype` | [N.notify](../ui-shell/notify.md), [N.docs](../ui-shell/documents.md) |

`NA.prototype.request` is deliberately not installed, so `N(el).request()` does not exist. `NU.prototype.select` overwrites jQuery's own `.select()` event shorthand on every jQuery object.

## `instance([name][, instance])`

Reads or stores component and Controller instances kept in jQuery data. Natural-JS stores each instance on its context (or view) element under the data key `name + "__"`; any data key ending in `__` counts as an instance.[^instance]

| Call | Action | Returns |
|---|---|---|
| `instance()` | Collects every stored instance of every element. | jQuery collection of instances (empty when there are none) |
| `instance(callback)` | Calls `callback.call(inst, name, inst)` once per stored instance. | the collection |
| `instance(name)` | Collects the instances stored as `name`. | `undefined` (none), the instance (exactly one) or a jQuery collection of instances (several) |
| `instance(name, callback)` | Calls `callback.call(inst, name, inst)` for each instance stored as `name`. | the collection |
| `instance(name, value)` | Stores `value` as `name` on every element (`data(name + "__", value)`). | the collection |

In a callback `this` is the instance, the first argument is the instance name without `__` and the second is the instance. A function cannot be stored, because a function in the second position is treated as a callback.

Instance names used by Natural-JS:

| Name | Stored by | Element |
|---|---|---|
| `cont` | `N.cont` (`N(view).cont(obj)`) | the view element, which also gets the class `view_context__` |
| `alert` | `N.alert` | the `.block_overlay_msg__` message element; the context element in input-tooltip mode |
| `button` | `N.button` | each button element |
| `datepicker`, `select`, `form`, `list`, `grid`, `pagination`, `tree` | the component | the `context` element |
| `popup` | `N.popup` | the popup context element; for `url` popups the loaded page elements |
| `tab` | `N.tab` | the tab context element; each loaded tab page stores its Controller as `cont` on its `.view_context__` element |
| `notify` | `N.notify` | the `.notify__` container |
| `docs` | `N.docs` | the `context` element |
| `ds` | `N.ds` | `var#data_sync_temp__` inside the page context |

## `tpBind(events[, data], handler)`

Binds a handler with jQuery `.on(...)` and moves it to the front of the element's handler list for that event type, so it runs before handlers bound earlier. Returns the collection.[^tpbind]

- Typical use is `N(el).tpBind("click.myns", N.event.disable)`, which blocks every other click handler on the element; `N.button`, `N.tab` and `N.datepicker` disable items this way. See [N.event](event.md).
- Only the type before the first `.` of `events` is reordered, so pass exactly one event type per call. With `"click touchstart"` an element that already has jQuery handlers throws a TypeError (the handler list for the key `"click touchstart"` does not exist); this includes the second and later elements of a collection, because the first pass binds on the whole collection. A single element with no handlers yet gets both bindings, but neither one is moved to the front.
- The delegated form (`events, selector, handler`) is not supported: jQuery inserts delegated handlers ahead of direct ones, so the wrong handler is moved.
- On a collection with more than one element the handler is bound several times; see Known issues.

## `vals([vals])`

Gets or sets the selected values of `select`, radio and checkbox elements. The mode is decided by the argument: `undefined` or a function means get, anything else means set. The element type is taken from the first element of the collection.[^vals]

Get mode, `vals()` and `vals(callback)`:

| Elements | `vals()` returns | `vals(callback)` |
|---|---|---|
| `select` | the trimmed value of the selected `option` (`""` when that option has no `value` attribute); an array when two or more are selected; `[]` for a `multiple` select with nothing selected | called per selected option; returns the selected options |
| radio group (same `name`) | the trimmed value of the checked radio, `""` when none is checked | called once with the checked radio; returns it |
| several checkboxes (same `name`) | one checked: a string; none: `[]`; several: an array | called per checked checkbox; returns the checked checkboxes |
| a single checkbox | `N.context.attr("core").sgChkdVal` when checked, `sgUnChkdVal` otherwise, and writes that value into the checkbox's `value` | called once with the checkbox |
| any other element | `""` | — |

Callback arguments are `(index, element)` with `this` bound to the element; the element is a raw DOM element when several are iterated and an N collection for a single selection. For a single selected `option` the index skips the `.select_default__` placeholder option added by `N.select`.

Set mode, `vals(value)`; returns the collection:

| Elements | `value` | Effect |
|---|---|---|
| `select` | string or array | `.val(value)`. An empty or whitespace string (or empty array) on a non-multiple select selects the first option. |
| radio group | string | checks the radio whose `value` equals `String(value)` and unchecks the others |
| several checkboxes | string or array | unchecks all, then checks those whose `value` is in the list |
| a single checkbox | `sgChkdVal` or `sgUnChkdVal`, as a string or a one-item array | checks it for `sgChkdVal`; any other string unchecks it; writes `sgChkdVal` or `sgUnChkdVal` into `value`. An array's first item is overwritten in place with the normalized value. A boolean, number or `null` throws a TypeError (see Pitfalls). |
| any other element | — | nothing |

`sgChkdVal` and `sgUnChkdVal` are `"Y"` and `"N"` in the shipped `natural.config.js`; see [Configuration](../setup/configuration.md). [N.element](element.md) `toData` reads select, radio and checkbox values through `vals()`.

## `events([eventType[, namespace]])`

Reads jQuery's internal event store (`jQuery._data(el, "events")`) of the first element.[^events]

| Call | Returns |
|---|---|
| `events()` | the whole events object, `{ click: [handleObj, ...], ... }` |
| `events(eventType)` | the handler array for that type, or `undefined` |
| `events(eventType, namespace)` | an array of the handler objects whose `namespace` equals the argument, or `undefined` when none match |

It returns `undefined` when the collection is empty or the element has no handlers. jQuery stores namespaces sorted and dot-joined (`"focusout.validate.form"` is stored with namespace `"form.validate"`), so pass the namespace in that form. `N.form` uses `ele.events("focusout", "form.validate")` to avoid binding a handler twice.

## `remove_(idx[, length])`

Removes items from the collection itself (not from the DOM) with `splice` and returns the collection. `idx` is a numeric index or an item of the collection; `length` defaults to `1`; an `undefined` `idx` does nothing.[^remove] Natural-JS uses it on rule arrays: `N(["date", 8]).remove_(0).toArray()` returns `[8]`.

# Rule catalog

## `selector:regexp(attribute[:property], pattern)`

A custom jQuery pseudo selector (`jQuery.expr.pseudos.regexp`) that keeps elements for which `new RegExp(pattern).test(value)` is true for at least one extracted value.[^regexp]

| `attribute` | Values tested |
|---|---|
| `data:<name>` | `.data(name)` (jQuery data, JSON-parsed); falsy values such as `0`, `false` or `""` never match |
| `css:<property>` | `.css(property)`, the computed value (for example `"128px"`) |
| `class` | each class of the `class` attribute, split on single spaces |
| any other name | `.attr(name)`; a missing or empty attribute never matches |

- The text before the first comma is the attribute spec; the rest, trimmed, is the pattern. An empty argument or one without a comma matches nothing.
- The pattern is written without quotes, is case-sensitive and takes no flags.
- Always put a base selector before `:regexp`; without it every element in the document is tested.

```js
N("div:regexp(class, ^someClass)");        // <div class="someClassA classB">
N("div:regexp(class, Btn$|Button$)");      // class="searchBtn" or class="searchButton"
N("div:regexp(data:sample, test-[1-2])");  // data-sample="test-1" or "test-2"
N("div:regexp(css:width, ^128px)");        // style="width:128px;"
N("div:regexp(id, page-[0-9])");           // id="page-1", id="page-2", ...
```

# Pitfalls

A backslash in a JavaScript string literal is consumed before jQuery sees the selector; double it to escape a regex metacharacter.

```js
// Wrong (legacy): N("a:regexp(href, Mr\.(Lee|Kim))")  - the dot matches any character
N("a:regexp(href, Mr\\.(Lee|Kim))");
```

`instance(name, callback)` binds `this` to the instance; an arrow function loses that binding.[^instance]

```js
// Wrong (legacy): N("#grid").instance("grid", () => { this.bind(data); });
N("#grid").instance("grid", function (name, grid) { this.bind(data); });
N("#grid").instance("grid").bind(data);
```

- `instance(name)` over several elements returns a jQuery collection of instances, not a single instance and not a plain array; iterate it with `.each` or use `instance(name, callback)`. `instance()` without arguments always returns a collection.
- `vals()` reads only `select`, radio and checkbox elements; on a text input it returns `""` and `vals("x")` does nothing. Use jQuery `.val()` there.
- A single checkbox is a flag: `vals("1")` and `vals("on")` uncheck it, because only `sgChkdVal` checks it. A non-string, non-array value such as `vals(true)`, `vals(1)` or `vals(null)` throws a TypeError (only a string is wrapped in an array, then the code reads and assigns `vals[0]` on the primitive in strict class code). Pass `"Y"`/`"N"` (`sgChkdVal`/`sgUnChkdVal`) or a one-item array.
- The multiple-select reset check is `select[multiple='multiple']`, so `<select multiple>` written without a value is treated as a single select when `vals("")` is called.
- `vals()` on an empty collection throws a TypeError (it reads `this.get(0).tagName`).
- A `$(".view")` collection has no `selector` property, so `$(".view").cont(obj)` throws a TypeError when the view has no `id` (the page id is derived from `selector`). Use `N(".view").cont(obj)`.
- `jQuery.fn.select` is Natural-JS's `N.select` component after loading, so `$(input).select()` no longer triggers the `select` event.

# Known issues

* **`tpBind` binds the handler once per element on every element** - Actual: inside `this.each(...)` it calls `self.on.apply(self, args)` on the whole collection, so a collection of n elements gets the handler n times on each element and only one copy is moved to the front. Likely intent: bind once per element. Workaround: call it per element, `N(els).each(function () { N(this).tpBind("click.x", handler); })`.[^tpbind]
* **`remove_(item)` removes the last item when `item` is not in the collection** - Actual: `this.toArray().indexOf(item)` returns `-1` and `splice(-1, 1)` removes the last item. Likely intent: do nothing. Workaround: check membership first or pass a numeric index.[^remove]

# Examples

Get a component instance and call its methods:

```js
N("#grid01", view).grid({ height: 300 });
const grid = N("#grid01", view).instance("grid");
grid.bind(rows);
```

Visit every instance stored on several elements:

```js
N(".grid01, .grid02", view).instance(function (name, inst) {
    N.log(name, inst === this); // "grid", true
});
```

Store and read your own object:

```js
N("#panel", view).instance("state", { dirty: false });
N("#panel", view).instance("state").dirty = true;
```

Block all clicks on a link until it is enabled again:

```js
N("#lnkNext", view).tpBind("click.lock", N.event.disable);
N("#lnkNext", view).off("click.lock");
```

Read and write a checkbox group and a single flag checkbox:

```html
<input type="checkbox" name="hobby" value="golf"><input type="checkbox" name="hobby" value="ski">
<input type="checkbox" id="useYn">
```

```js
N("input[name='hobby']", view).vals(["golf", "ski"]);
N("input[name='hobby']", view).vals();  // ["golf", "ski"]
N("#useYn", view).vals("Y");
N("#useYn", view).vals();               // "Y"
```

# Related

- [N (static functions)](n-static.md) - `N.isWrappedSet`, `N.toSelector` and the other functions on the `N` object.
- [N.event](event.md) - `N.event.disable`, the handler usually bound with `tpBind`.
- [Component model](../ui/component-model.md) - how components store instances and read `data-opts`.
- [Controller](../architecture/controller.md) - `N(view).cont(obj)` and the `cont` instance.
- [API conventions](../overview/api-conventions.md) - `new` versus factory calls and naming.
- [Configuration](../setup/configuration.md) - `sgChkdVal` and `sgUnChkdVal` in `N.context.attr("core")`.

[^njs]: N(), class NJS and the jQuery.fn installation loop (src/natural.js.js)
[^instance]: NC.prototype.instance (N(selector).instance)
[^tpbind]: NC.prototype.tpBind (N(selector).tpBind)
[^vals]: NC.prototype.vals (N(selector).vals)
[^events]: NC.prototype.events (N(selector).events)
[^remove]: NC.prototype.remove_ (N(selector).remove_)
[^toselector]: NC.toSelector (source of the selector property)
[^regexp]: jQuery.expr.pseudos.regexp (IIFE after class NC, whole-file fingerprint)
