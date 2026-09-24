---
type: Overview
title: API conventions
description: Calling conventions for Natural-JS code covering class and plugin forms, return values, instance lookup, declarative data attributes and option precedence.
tags: [project, conventions, api]
symbols: [N(), N().instance, NC.prototype.instance, N.element.toOpts, NC.element.toOpts, N.element.toRules, NC.element.toRules, data-opts, data-format, data-validate]
sources:
  - id: js
    resource: ../../src/natural.js.js
    title: natural.js.js (Object.assign onto N, jQuery.fn installation, N.comm and N.notify factories)
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: instance
    resource: ../../src/natural.core.js
    title: NC.prototype.instance (N(selector).instance)
    symbol: NC.prototype.instance
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: de8beae8138f
  - id: toopts
    resource: ../../src/natural.core.js
    title: NC.element.toOpts (reads data-opts)
    symbol: NC.element.toOpts
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 29751ebee9fa
  - id: torules
    resource: ../../src/natural.core.js
    title: NC.element.toRules (reads data-format and data-validate)
    symbol: NC.element.toRules
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: aa46cc448324
  - id: nu-alert
    resource: ../../src/natural.ui.js
    title: NU.prototype.alert plugin
    symbol: NU.prototype.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: efe17ef81c7a
  - id: nu-button
    resource: ../../src/natural.ui.js
    title: NU.prototype.button plugin
    symbol: NU.prototype.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 99e7697d9987
  - id: nu-popup
    resource: ../../src/natural.ui.js
    title: NU.prototype.popup plugin (element components)
    symbol: NU.prototype.popup
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: ab94b5af2fef
  - id: nu-grid
    resource: ../../src/natural.ui.js
    title: NU.prototype.grid plugin (data components)
    symbol: NU.prototype.grid
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: aa060d1d1faa
  - id: nus-notify
    resource: ../../src/natural.ui.shell.js
    title: NUS.prototype.notify plugin
    symbol: NUS.prototype.notify
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: f9f20c44009a
  - id: nus-docs
    resource: ../../src/natural.ui.shell.js
    title: NUS.prototype.docs plugin
    symbol: NUS.prototype.docs
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: aa7bcbbe7baf
  - id: na-comm-plugin
    resource: ../../src/natural.architecture.js
    title: NA.prototype.comm plugin
    symbol: NA.prototype.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 417877f001e7
  - id: na-cont-plugin
    resource: ../../src/natural.architecture.js
    title: NA.prototype.cont plugin
    symbol: NA.prototype.cont
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 631524239e47
  - id: na-comm
    resource: ../../src/natural.architecture.js
    title: NA.comm constructor (returns the augmented collection)
    symbol: NA.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 40c48fda4ea0
  - id: na-cont
    resource: ../../src/natural.architecture.js
    title: NA.cont constructor (returns the controller object)
    symbol: NA.cont
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 8c6c783164aa
  - id: nd-formatter-plugin
    resource: ../../src/natural.data.js
    title: ND.prototype.formatter plugin
    symbol: ND.prototype.formatter
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 36b029374abf
  - id: nd-datafilter
    resource: ../../src/natural.data.js
    title: ND.prototype.datafilter plugin
    symbol: ND.prototype.datafilter
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: ed565ac76a89
  - id: formatter-format
    resource: ../../src/natural.data.js
    title: ND.formatter.prototype.format (rule lookup)
    symbol: ND.formatter.prototype.format
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 62abb5c89072
  - id: validator
    resource: ../../src/natural.data.js
    title: ND.validator (rule lookup and rule combination)
    symbol: ND.validator
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 3783dcab12fc
  - id: ui-utils
    resource: ../../src/natural.ui.js
    title: NU.ui.utils.wrapHandler (global event handler chaining)
    symbol: NU.ui.utils
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 190de240129d
  - id: button
    resource: ../../src/natural.ui.js
    title: NU.button constructor (option precedence example)
    symbol: NU.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c3c35975533f
  - id: select
    resource: ../../src/natural.ui.js
    title: NU.select constructor
    symbol: NU.select
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 8518b356a7d1
  - id: alert
    resource: ../../src/natural.ui.js
    title: NU.alert constructor (stores the instance on the message element or the input element)
    symbol: NU.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5933b105d560
  - id: form
    resource: ../../src/natural.ui.js
    title: NU.form (fRules / vRules options and the bindEvents that read them)
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: grid-revert
    resource: ../../src/natural.ui.js
    title: NU.grid.prototype.revert (requires the revert option)
    symbol: NU.grid.prototype.revert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c9615ba89e18
  - id: notify
    resource: ../../src/natural.ui.shell.js
    title: NUS.notify constructor (single-argument restart)
    symbol: NUS.notify
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: 00af5ad03855
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE.md
    title: Legacy developer guide, API Documentation Guide section (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

These rules apply to every Natural-JS API, and every reference page assumes them. They follow from how `src/natural.js.js` assembles the global `N`: component classes are copied onto `N` (call them with `new`), and prototype methods become jQuery plugins (call them on `N(selector)`). Read this page before writing Natural-JS code for the first time.

# What it is

- A class form and a plugin form exist for almost every component and library; both create the same kind of instance, but the arguments and the return value differ.
- Component instances are stored on DOM elements and read back with `N(selector).instance(name)`.
- Options come from four layers (defaults, `natural.config.js`, `data-opts`, the `opts` argument), and declarative rules come from `data-format` and `data-validate` attributes written as JSON.

# Map

| Form | Syntax | Returns | Use for |
|---|---|---|---|
| Class | `new N.grid(data, opts)`, `new N.button(context, opts)` | the instance | explicit construction; every class on `N` needs `new` |
| Plugin | `N(data).grid(opts)`, `N(context).button(opts)` | depends on the plugin (table below) | the usual form in controllers |
| Factory | `N.comm(url)`, `N.comm(data, url)`, `N.notify(position, opts)` | the created object | the two members that work with or without `new` |
| Static function | `N.string.lpad(str, length, padStr)`, `N.formatter.lpad(str, args)` | the function result | utilities and single rule calls |
| Instance lookup | `N(selector).instance("grid")` | the stored instance | getting a component created elsewhere |

# Key concepts

## Class form needs `new`

`Object.assign(N, NC, NA, ND, NU, NUS)` copies the static class fields, so `N.grid === NU.grid` and `N.formatter === ND.formatter`.[^js] What happens when a class is called without `new` depends on the bundle. In the ES6 bundles it throws `TypeError: Class constructor ... cannot be invoked without 'new'`. In the ES5 bundles the classes are compiled to plain non-strict functions, so the constructor runs with `this` = `window`: it may fail later with an unrelated error, or quietly write `options` to `window` and return `window`. Always use `new` or the plugin form. The only exceptions are `N.comm` and `N.notify`, which `natural.js.js` replaces with factory functions (`new N.comm(url)` also works because the factory returns an object).

Classes take one of four argument shapes:

| Shape | Classes | Constructor |
|---|---|---|
| Element context | `N.alert`, `N.button`, `N.datepicker`, `N.popup`, `N.tab`, `N.docs` | `new N.x(context, opts)`; `N.alert` is `new N.alert(context, msgOrOpts[, vars])` |
| Data first | `N.select`, `N.form`, `N.list`, `N.grid`, `N.pagination`, `N.tree` | `new N.x(data, opts)`; `opts` is an options object with `context`, or the context itself (selector, element or collection) |
| Data and rules | `N.formatter`, `N.validator` | `new N.x(data, rulesOrContext)`; a rules object, or an element or selector whose `data-format` / `data-validate` attributes supply the rules |
| Special | `N.cont`, `N.comm`, `N.notify`, `N.ds` | `new N.cont(view, contObj)`, `N.comm(dataOrUrl[, url])`, `N.notify([position, ]opts)`, `N.ds.instance(inst, isReg)` |

## Plugin form and what it returns

Every prototype method of `NC`, `NA`, `ND`, `NU` and `NUS` except `constructor` and `request` is installed on `jQuery.fn`.[^js] The collection the plugin is called on becomes the first constructor argument.

| Plugin | Returns |
|---|---|
| `N(context).alert(msgOrOpts[, vars])` | the `N.alert` instance[^nu-alert] |
| `N(context).button([opts])` | the collection (one instance per element), or `undefined` when no element is `a`, `button` or `input[type=button]`[^nu-button] |
| `N(context).datepicker([opts])`, `.popup([opts])`, `.tab([opts])` | the instance[^nu-popup] |
| `N(data).select(opts)`, `.form(opts)`, `.list(opts)`, `.grid(opts)`, `.pagination(opts)`, `.tree(opts)` | the instance[^nu-grid] |
| `N(position).notify(opts)` | the `N.notify` instance; `opts` is effectively required (pass `{}` for the defaults), see Pitfalls[^nus-notify] |
| `N(context).docs([opts])` | the `N.docs` instance[^nus-docs] |
| `N(dataOrElement).comm(urlOrOpts)` | the same collection, extended with `request`, `submit`, `error` and the filter helpers; `submit` later sets `xhr`[^na-comm-plugin][^na-comm] |
| `N(view).cont(contObj)` | `contObj` itself, with `contObj.view` set[^na-cont-plugin][^na-cont] |
| `N(data).formatter(rulesOrContext)`, `.validator(rulesOrContext)` | the `N.formatter` / `N.validator` instance[^nd-formatter-plugin] |
| `N(data).datafilter(condition)` | a new filtered collection[^nd-datafilter] |
| `N(data).datasort(key[, reverse])` | the same collection, sorted in place |
| `N(el).instance(...)`, `.vals(...)`, `.events(...)`, `.tpBind(...)`, `.remove_(...)` | see [N()](../core/n-function.md) |

Because the plugins live on `jQuery.fn`, `$(el).grid(...)` also works, but a `$()` collection has no `selector` property; see Pitfalls.

## Instances are stored on elements

Each component stores itself with `context.instance(name, this)` (jQuery data key `name + "__"`): `alert` (on the generated message element, or on the context element itself when the context is an input element), `button`, `datepicker`, `popup`, `tab`, `select`, `form`, `list`, `grid`, `pagination`, `tree`, `notify`, `docs`, and `cont` for controllers (on the view element).[^alert]

## `N(selector).instance([name][, instanceOrCallback])`

| Call | Result |
|---|---|
| `instance()` | a collection of every stored instance on the matched elements |
| `instance("grid")` | the instance when exactly one is found, `undefined` when none, a collection when several |
| `instance(function (name, inst) {})` | calls the callback for each stored instance with `this` = the instance; returns the collection |
| `instance("grid", function (name, inst) {})` | the same, only for `grid`; returns the collection |
| `instance("grid", value)` | stores `value` as the `grid` instance; returns the collection |

Callbacks receive `this` bound to the instance, so use `function`, not an arrow function.[^instance]

## Declarative attributes

Three `data-*` attributes carry JSON. jQuery's `.data()` parses them, so the value must be valid JSON: double-quoted keys and strings, the whole attribute wrapped in single quotes.

| Attribute | Read by | Shape |
|---|---|---|
| `data-opts` | `NC.element.toOpts(ele)` = `N(ele).data("opts")`[^toopts] | an options object: `'{ "size": "small", "color": "primary" }'` |
| `data-format` | `NC.element.toRules(eles, "format")`, used by `N.formatter` with an element context and by the data components[^torules] | a rule list: `'[["date", 8], ["lpad", 10, "@"]]'` |
| `data-validate` | `NC.element.toRules(eles, "validate")`, used by `N.validator` with an element context and by the data components[^torules] | a rule list: `'[["required"], ["maxlength", 20]]'` |

- A rule list is an array of arrays; the first item is the rule name and the rest are its arguments, passed to the rule function as one array (`N.formatter.lpad(value, [10, "@"])`).[^formatter-format]
- Rule names are lowercased before lookup, so `"LPAD"` and `"lpad"` are the same rule. The validator also accepts combined rules written with `+`: the parts are sorted and joined with `_` (`"integer+alphabet"` runs `alphabet_integer`).[^validator]
- `toRules` keys each rule list by the element `id`, or by `name` for radio buttons and checkboxes; the key must match the data property name.[^torules]
- Declare rules with the attributes. `N.form`, `N.list` and `N.grid` declare `fRules` / `vRules` options, but they do not replace the attributes. In `N.form` the element still needs `data-format` / `data-validate` as the trigger; a non-null `fRules` builds a formatter from a plain rules object, whose result is never written to the element (the field stays empty); and a non-null `vRules` throws a `TypeError` when such an element is bound. `N.list` and `N.grid` never pass the two options to their row forms, so there they have no effect.[^form][^formatter-format][^validator]
- `data-opts` is read only by `N.button` (its context element) and by `N.tab` (each `ul > li` becomes one `tabOpts` entry; a `tabOpts` option passed in `opts` replaces them). `N.select` calls `toOpts` before its context is set, so it never reads `data-opts`.[^button][^select] The other components ignore `data-opts`.

## Option precedence

Lowest to highest, as implemented in the component constructors:[^button]

1. The constructor defaults (`this.options` in each `NU.x` / `NUS.x` class).
2. `N.context.attr("ui").<component>` or `N.context.attr("ui.shell").<component>` from [natural.config.js](../setup/configuration.md).
3. `data-opts` on the context element (only where it is read, see above).
4. The `opts` argument.

The merge is shallow for most components, so a nested object in `opts` replaces the whole default object; `N.alert`, `N.popup`, `N.list` and `N.grid` merge `opts` deeply. `N.comm` has its own layers (request defaults, `architecture.comm.request.options`, the call arguments); see [Communicator.request](../architecture/request.md).

## Event handlers

- UI component handlers are called with `this` bound to the component instance unless the component page says otherwise. Controller `init(view, request)` runs with `this` = the controller object. `N.comm(...).submit(callback)` calls `callback(data, request)` with `this` = the communicator collection (for an HTML page load, `callback(cont)`).
- When the same handler name is set both in `opts` and in `N.context.attr("ui").<component>`, and the component wraps that name, the local handler runs first and the global one runs next unless the local handler returns `false`. For `onBeforeBindValue` the global handler receives the first argument and the local return value.[^ui-utils] Each component page lists which handler names it wraps; for other names the global value is only a default that a local value replaces.

## Scope selectors to the view

Inside controller functions select elements with the view as context, `N("#grid", view)` or `cont.view.find("#grid")`. A bare `N("#grid")` searches the whole document and can hit an element of another block page loaded at the same time. The Natural-CODE rule `NoContextSpecifiedInSelector` reports this; see [Code inspection](../code/inspection.md).

## Terminology

| Term | Meaning |
|---|---|
| jQuery object, collection | the object returned by `N()`, `jQuery()` or `$()`; `N()` adds a `selector` string |
| context | the element(s) a component works on (`opts.context` or the first constructor argument) |
| view | the root element of a block page; `cont.view` and the first `init` argument |
| controller object | the object passed to `N(view).cont(...)`, also read with `N(view).instance("cont")` |
| block page | an HTML fragment with a view and its controller script, loaded by `N.comm`, `N.popup`, `N.tab` or `N.docs` |
| rules | format or validation rule lists (`[["name", arg...], ...]`) |
| global options | per-component defaults in `N.context.attr("ui")` / `("ui.shell")` |

The legacy API pages had Overview, API DEMO, Constructor, Default Options, Declarative Options, Methods and Examples tabs. In this bundle they map to the lead and `# Quick start`, (dropped), `# Constructor`, `# Options`, `# Declarative options`, `# Methods` plus `# Events`, and `# Examples`.

# Pitfalls

The legacy API guide showed the class form without `new`, misspelled a grid option and called `revert` on a grid that cannot revert:[^grid-revert]

```js
// Wrong (legacy): N.grid(argument[0]);
new N.grid(data, { context: N("#grid", view) }); // or N(data).grid({ context: N("#grid", view) })
// Wrong (legacy): N([]).grid({ resizeable: true }).revert(3);
const grid = N([]).grid({ context: N("#grid", view), resizable: true, revert: true });
grid.bind(data);
// ... after the user edits row 3
grid.revert(3); // throws unless the grid was created with revert: true (default false)
```

A class called like a function does not create a working instance (see Class form needs `new`); use the plugin form or `new`:

```js
// Wrong (legacy): N.alert("Saved.").show();
N(window).alert("Saved.").show();
```

`N(position).notify()` without `opts` loses the position. The constructor sees a non-empty first argument and no `opts`, so it restarts as `new N.notify(null, position)` and merges the whole collection, inherited jQuery methods included, into its options: `options.position` becomes `jQuery.fn.position`, and the first `add()` throws a `TypeError`.[^notify] A single argument to the factory, `N.notify(x)`, is likewise always taken as `opts`.

```js
// Wrong (legacy): N({ top: 5, right: 10 }).notify().add("Updated.");
N({ top: 5, right: 10 }).notify({}).add("Updated.");
```

Instance callbacks lose `this` in an arrow function:

```js
// Wrong (legacy): N("#grid", view).instance("grid", () => { this.bind([]); });
N("#grid", view).instance("grid", function (name, grid) { this.bind([]); });
```

- `N(view).cont(...)` builds the page id from `obj.selector` when the view element has no `id`. A `$()` collection has no `selector`, so `$(".view").cont({...})` throws a `TypeError`; always use `N()`.[^na-cont]
- jQuery reads a `data-*` attribute once and caches the parsed value. Changing the attribute with `.attr("data-format", ...)` after the first read has no effect; set new values with `.data("format", [...])`.
- jQuery reports no error for invalid JSON in `data-opts`, `data-format` or `data-validate`; it keeps the raw string. `N.button` then merges a `data-opts` string character by character (keys `"0"`, `"1"` ...), so the options are silently ignored; `N.tab` keeps the string as that tab's options, and in the ES6 bundles setting its `target` throws a `TypeError`. A `data-format` / `data-validate` string is passed to `jQuery()` as a selector, which usually throws `Syntax error, unrecognized expression` when the field is bound, formatted or validated.[^toopts][^torules][^formatter-format][^validator]
- Custom rules added through `natural.config.js` must have lowercase names because the lookup lowercases the rule name; see [natural.config.js](../setup/configuration.md).

# Where to go next

- [Natural-JS](natural-js.md) - packages and how the global `N` is assembled.
- [Component model](../ui/component-model.md) - lifecycle and shared rules of UI components.
- [N()](../core/n-function.md) - `instance`, `vals`, `events` and the other core plugins.
- [natural.config.js](../setup/configuration.md) - the global option layer and handler chaining.
- [Formatter](../data/formatter.md) and [Validator](../data/validator.md) - the rule catalogs used by `data-format` and `data-validate`.

[^js]: natural.js.js (Object.assign onto N, jQuery.fn installation, N.comm and N.notify factories)
[^instance]: NC.prototype.instance (N(selector).instance)
[^toopts]: NC.element.toOpts (reads data-opts)
[^torules]: NC.element.toRules (reads data-format and data-validate)
[^nu-alert]: NU.prototype.alert plugin
[^nu-button]: NU.prototype.button plugin
[^nu-popup]: NU.prototype.popup plugin (element components)
[^nu-grid]: NU.prototype.grid plugin (data components)
[^nus-notify]: NUS.prototype.notify plugin
[^nus-docs]: NUS.prototype.docs plugin
[^na-comm-plugin]: NA.prototype.comm plugin
[^na-cont-plugin]: NA.prototype.cont plugin
[^na-comm]: NA.comm constructor (returns the augmented collection)
[^na-cont]: NA.cont constructor (returns the controller object)
[^nd-formatter-plugin]: ND.prototype.formatter plugin
[^nd-datafilter]: ND.prototype.datafilter plugin
[^formatter-format]: ND.formatter.prototype.format (rule lookup)
[^validator]: ND.validator (rule lookup and rule combination)
[^ui-utils]: NU.ui.utils.wrapHandler (global event handler chaining)
[^button]: NU.button constructor (option precedence example)
[^select]: NU.select constructor
[^alert]: NU.alert constructor (stores the instance on the message element or the input element)
[^form]: NU.form (fRules / vRules options and the bindEvents that read them)
[^grid-revert]: NU.grid.prototype.revert (requires the revert option)
[^notify]: NUS.notify constructor (single-argument restart)
