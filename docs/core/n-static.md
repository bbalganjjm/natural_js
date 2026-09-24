---
type: API Reference
title: N (static functions)
description: Static helpers on the N object - N.version, N.locale, console logging, N.error, N.type and the is* predicates, N.toSelector and N.serialExecute.
tags: [core, utilities, type-check, logging]
symbols: [N.version, NJS.version, N.locale, NC.locale, N.debug, NC.debug, N.log, NC.log, N.info, NC.info, N.warn, NC.warn, N.error, NC.error, N.type, NC.type, N.isString, NC.isString, N.isNumeric, NC.isNumeric, N.isPlainObject, NC.isPlainObject, N.isEmptyObject, NC.isEmptyObject, N.isArray, NC.isArray, N.isArraylike, NC.isArraylike, N.isWrappedSet, NC.isWrappedSet, N.isElement, NC.isElement, N.toSelector, NC.toSelector, N.serialExecute, NC.serialExecute]
sources:
  - id: version
    resource: ../../src/natural.js.js
    title: NJS.version (N.version)
    symbol: NJS.version
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
    symbol_sha1: 6e757c9f1e2e
  - id: locale
    resource: ../../src/natural.core.js
    title: NC.locale
    symbol: NC.locale
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: f894f93da288
  - id: debug
    resource: ../../src/natural.core.js
    title: NC.debug
    symbol: NC.debug
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: ce534f372725
  - id: log
    resource: ../../src/natural.core.js
    title: NC.log
    symbol: NC.log
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 339807991fef
  - id: info
    resource: ../../src/natural.core.js
    title: NC.info
    symbol: NC.info
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: e2a689a567e3
  - id: warn
    resource: ../../src/natural.core.js
    title: NC.warn
    symbol: NC.warn
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 5d78c071d934
  - id: error
    resource: ../../src/natural.core.js
    title: NC.error
    symbol: NC.error
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: c876d46fd925
  - id: type
    resource: ../../src/natural.core.js
    title: NC.type
    symbol: NC.type
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: a28e0c736191
  - id: isstring
    resource: ../../src/natural.core.js
    title: NC.isString
    symbol: NC.isString
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 9033db2caba7
  - id: isnumeric
    resource: ../../src/natural.core.js
    title: NC.isNumeric
    symbol: NC.isNumeric
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 7d5078bf7c41
  - id: isplainobject
    resource: ../../src/natural.core.js
    title: NC.isPlainObject
    symbol: NC.isPlainObject
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 8f4769f069b6
  - id: isemptyobject
    resource: ../../src/natural.core.js
    title: NC.isEmptyObject
    symbol: NC.isEmptyObject
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: cf820b098e39
  - id: isarray
    resource: ../../src/natural.core.js
    title: NC.isArray
    symbol: NC.isArray
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 237c98085254
  - id: isarraylike
    resource: ../../src/natural.core.js
    title: NC.isArraylike
    symbol: NC.isArraylike
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: c07283ebfae8
  - id: iswrappedset
    resource: ../../src/natural.core.js
    title: NC.isWrappedSet
    symbol: NC.isWrappedSet
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 275f8be08140
  - id: iselement
    resource: ../../src/natural.core.js
    title: NC.isElement
    symbol: NC.isElement
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 1bc7ece3440a
  - id: toselector
    resource: ../../src/natural.core.js
    title: NC.toSelector
    symbol: NC.toSelector
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 1a93cc546c71
  - id: serial
    resource: ../../src/natural.core.js
    title: NC.serialExecute
    symbol: NC.serialExecute
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: d17bc04436bb
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CORE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

These functions live directly on the `N` object (copied from `NC` and `NJS`), next to the namespaces such as [N.string](string.md) and [N.date](date.md). Use them for version checks, locale switching, console output, building errors, type tests and running asynchronous steps in order. Call them as `N.fn(...)`; several use `this` internally and break when detached.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.version` | `N.version[packageName]` | version string (object of strings) |
| `N.locale` | `N.locale([locale])` | locale string (get) or `undefined` (set) |
| `N.debug` | `N.debug(...args)` | `undefined` |
| `N.log` | `N.log(...args)` | `undefined` |
| `N.info` | `N.info(...args)` | `undefined` |
| `N.warn` | `N.warn(...args)` | `undefined` |
| `N.error` | `N.error(msg[, e])` | `Error` (not thrown) |
| `N.type` | `N.type(obj)` | lowercase type name |
| `N.isString` | `N.isString(obj)` | boolean |
| `N.isNumeric` | `N.isNumeric(obj)` | boolean |
| `N.isPlainObject` | `N.isPlainObject(obj)` | boolean |
| `N.isEmptyObject` | `N.isEmptyObject(obj)` | boolean |
| `N.isArray` | `N.isArray(obj)` | boolean |
| `N.isArraylike` | `N.isArraylike(obj)` | boolean |
| `N.isWrappedSet` | `N.isWrappedSet(obj)` | boolean |
| `N.isElement` | `N.isElement(obj)` | boolean |
| `N.toSelector` | `N.toSelector(obj)` | string |
| `N.serialExecute` | `N.serialExecute(fn1, fn2, ...)` | array of jQuery Deferred objects |

# Functions

## `N.version[packageName]`

An object, not a function, mapping package names to version strings. It is the same object as `NJS.version`.[^version]

| Key | Present when |
|---|---|
| `"Natural-JS"`, `"Natural-CORE"`, `"Natural-ARCHITECTURE"`, `"Natural-DATA"`, `"Natural-UI"`, `"Natural-UI.Shell"` | always |
| `"Natural-TEMPLATE"` | `natural.template.js` is loaded (the `natural.js+template` and `natural.js+code+template` bundles) |
| `"Natural-CODE"` | `natural.code.js` is loaded (the `natural.js+code` and `natural.js+code+template` bundles) |

## `N.locale([locale])`

- Without an argument returns `N.context.attr("core").locale` (`"ko_KR"` in the shipped `natural.config.js`).
- With an argument (for example `"en_US"`) stores it there and returns `undefined`.[^locale]
- [N.message](message.md) `get` and the built-in component messages read the locale each time they build a message, so a change applies to messages created afterwards. See [Configuration](../setup/configuration.md).

## `N.debug(...args)`

`console.debug` bound to `window.console` when it exists, otherwise a no-op. Accepts any number of arguments.[^debug]

## `N.log(...args)`

`console.log` bound to `window.console`, or a no-op.[^log]

## `N.info(...args)`

`console.info` bound to `window.console`, or a no-op.[^info]

## `N.warn(...args)`

`console.warn` bound to `window.console`, or a no-op. Natural-JS reports recoverable misuse through it.[^warn]

## `N.error(msg[, e])`

Builds and returns an `Error`; it neither throws nor writes to the console.[^error]

- Without `e` (or when `N.type(e)` is not `"error"`): returns `new Error(msg)`, with `Error.captureStackTrace(e, N.error)` applied when the engine supports it.
- With an `Error`: prefixes its message with `"[" + msg + "]"` (no prefix when `msg` is `null` or `undefined`) and returns the same object, so its class (`TypeError`, ...) is kept.
- Framework code uses it as `throw N.error("[NC.string.contains]...")`.

## `N.type(obj)`

Returns the lowercase internal class name from `Object.prototype.toString`: `"number"`, `"string"`, `"boolean"`, `"array"`, `"object"`, `"function"`, `"asyncfunction"`, `"date"`, `"regexp"`, `"error"`, `"null"`, `"undefined"`, and names such as `"htmldivelement"` or `"window"` for host objects.[^type] Only the leading letters are kept (`Uint8Array` gives `"uint"`). `NaN` is `"number"`; jQuery collections and class instances are `"object"`.

## `N.isString(obj)`

`N.type(obj) === "string"`, so `new String("a")` is also `true`.[^isstring]

## `N.isNumeric(obj)`

Natural-JS's own test: `(typeof obj === "number" || typeof obj === "string") && !isNaN(obj - parseFloat(obj))`.[^isnumeric]

| `true` | `false` |
|---|---|
| `5`, `"12"`, `" 12 "`, `"1e3"`, `"0x1A"` | `""`, `"12px"`, `NaN`, `Infinity`, `null`, `true` |

## `N.isPlainObject(obj)`

`jQuery.isPlainObject`: `true` only for objects created by `{}`, `new Object()` or with a `null` prototype. `N(...)` collections and class instances are `false`.[^isplainobject]

## `N.isEmptyObject(obj)`

`jQuery.isEmptyObject`: `true` when a `for...in` loop finds no enumerable property. `{}`, `[]`, `""`, `null`, `undefined` and numbers are `true`; `[{}]` and `"abc"` are `false`.[^isemptyobject]

## `N.isArray(obj)`

`Array.isArray`.[^isarray]

## `N.isArraylike(obj)`

`true` for arrays, jQuery collections, `arguments`, `NodeList`s, elements with a non-zero `length` (such as `form` and `select`) and objects with a numeric `length` whose last index exists (or `length === 0`). `false` for `undefined`, objects without `length`, functions, strings, numbers, dates, booleans and `window`. Throws for `null` (see Known issues).[^isarraylike]

## `N.isWrappedSet(obj)`

`true` when `obj` is array-like and has a `jquery` property, that is, any collection created by `N()`, `$()` or `jQuery()`.[^iswrappedset]

## `N.isElement(obj)`

`true` for a DOM element, or for a collection whose first item is a DOM element. `false` for `document`, `window`, text nodes and non-DOM values.[^iselement]

## `N.toSelector(obj)`

Returns a string describing `obj`; `N()` stores it as the collection's `selector` property.[^toselector]

| Input | Result |
|---|---|
| string | the string unchanged |
| element, or collection (first element used) | `tag` + `#id` + `.class1.class2`, for example `"div#box.panel.active"` |
| array | `...[type](length)` from the last item: `'...["string"](2)'`, `"...[object](3)"`, `"...[](0)"` |
| anything else | `String(obj)`, for example `"[object Object]"` or `"undefined"` |

## `N.serialExecute(fn1, fn2, ...)`

Runs asynchronous steps in order with jQuery Deferreds and returns the array of Deferreds, one per function.[^serial]

- Each function is called as `fn.apply(defers, [defer, ...args])`: `this` is the Deferred array, `defer` is the function's own Deferred and `args` are the arguments passed to the previous function's `defer.resolve(...)`.
- The first function runs immediately (synchronously) inside `N.serialExecute`; each later function runs when the previous Deferred is resolved. Rejecting or never resolving a Deferred stops the chain.
- All steps share the same array, so any step can read `this[i]`. Resolving `this[n]` runs step `n + 1` with the given arguments, which skips the steps in between if their own Deferreds are never resolved. Later Deferreds exist only after `N.serialExecute` has returned, so reach forward only from asynchronous code.
- The returned Deferreds work with `jQuery.when(...)`.

# Pitfalls

`N.error` only builds the error object.[^error]

```js
// Wrong (legacy): N.error("Save failed");   - nothing happens
throw N.error("Save failed");
```

- `N.isWrappedSet`, `N.isElement` and `N.toSelector` call `this.isArraylike` / `this.isWrappedSet` / `this.isElement`; passing them as callbacks throws a TypeError. Wrap them: `list.filter((x) => N.isElement(x))`.
- `N.isNumeric("12")` is `true`; test `typeof value === "number"` when a numeric string is not acceptable.
- `N.type(N("div"))` is `"object"`; use `N.isPlainObject` to separate plain objects from collections and class instances.
- In `N.serialExecute`, arrow functions do not receive the Deferred array as `this`; use regular functions or the returned array.
- `N.locale(value)` returns `undefined`, not the previous locale.

# Known issues

* **`N.isArraylike(null)` throws** - Actual: only `undefined` is guarded before reading `obj.length`, so `null` raises a TypeError. Likely intent: return `false`. Workaround: `obj != null && N.isArraylike(obj)`.[^isarraylike]

# Examples

Wrap a caught error with context and rethrow it:

```js
try {
    JSON.parse(text);
} catch (e) {
    throw N.error("Invalid response", e); // e.message becomes "[Invalid response]" + original message
}
```

Switch the locale for built-in messages:

```js
if (N.locale() !== "en_US") {
    N.locale("en_US");
}
```

Run three asynchronous steps in order and wait for the last two:

```js
const defers = N.serialExecute(
    function (defer) {
        N.comm("step1.json").submit(function (data) { defer.resolve(data); });
    },
    function (defer, data) {
        N(data).comm("step2.json").submit(function (res) { defer.resolve(res); });
    },
    function (defer, res) {
        N.log("step 3", res);
        defer.resolve();
    }
);

jQuery.when(defers[1], defers[2]).done(function () {
    N.log("steps 2 and 3 finished");
});
```

# Related

- [N()](n-function.md) - the `N(selector)` collection, its `selector` property and the plugin methods.
- [N.message](message.md) - locale-aware messages that use `N.locale()`.
- [Configuration](../setup/configuration.md) - `N.context.attr("core").locale`.
- [API conventions](../overview/api-conventions.md) - naming, `new` and factory rules for the `N` namespace.
- [Installation](../setup/installation.md) - which bundle adds `Natural-TEMPLATE` and `Natural-CODE`.

[^version]: NJS.version (N.version)
[^locale]: NC.locale
[^debug]: NC.debug
[^log]: NC.log
[^info]: NC.info
[^warn]: NC.warn
[^error]: NC.error
[^type]: NC.type
[^isstring]: NC.isString
[^isnumeric]: NC.isNumeric
[^isplainobject]: NC.isPlainObject
[^isemptyobject]: NC.isEmptyObject
[^isarray]: NC.isArray
[^isarraylike]: NC.isArraylike
[^iswrappedset]: NC.isWrappedSet
[^iselement]: NC.isElement
[^toselector]: NC.toSelector
[^serial]: NC.serialExecute
