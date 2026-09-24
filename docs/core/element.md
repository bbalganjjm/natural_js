---
type: API Reference
title: N.element
description: HTML element helpers - read data-opts and data-format/data-validate rules, turn input elements into a data object, flash a changed element and find the highest z-index.
tags: [core, dom, declarative-options]
symbols: [N.element, NC.element, N.element.toOpts, N.element.toRules, N.element.toData, N.element.dataChanged, N.element.maxZindex]
sources:
  - id: element
    resource: ../../src/natural.core.js
    title: NC.element implementation
    symbol: NC.element
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 7d267b0649e0
  - id: vals
    resource: ../../src/natural.core.js
    title: NC.prototype.vals (used by toData)
    symbol: NC.prototype.vals
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 4178ea152b93
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CORE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.element` converts between markup and data: components read their declarative `data-opts`, `data-format` and `data-validate` attributes through it, and `N.form` builds new rows from input values with `toData`. It also provides the z-index scan used to keep alerts and popups on top. Application code mostly calls `toData` and `maxZindex`.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.element.toOpts` | `N.element.toOpts(ele)` | options object, raw string or `undefined` |
| `N.element.toRules` | `N.element.toRules(ele, ruleset)` | object keyed by element id or name |
| `N.element.toData` | `N.element.toData(eles)` | plain data object |
| `N.element.dataChanged` | `N.element.dataChanged(ele)` | `undefined` |
| `N.element.maxZindex` | `N.element.maxZindex([ele])` | number |

# Functions

## `N.element.toOpts(ele)`

Returns `N(ele).data("opts")`, the `data-opts` attribute of the first element as parsed by jQuery: an object when the value is valid JSON, the raw string otherwise, `undefined` when the attribute is missing.[^element] `N.button`, `N.tab` and `N.select` merge it into their options; see [Component model](../ui/component-model.md).

## `N.element.toRules(ele, ruleset)`

For each element of the collection `ele`, stores `element.data(ruleset)` under the element's `id` (the `name` for radio and checkbox inputs) and returns the object.[^element] `ruleset` is `"format"` or `"validate"`, which reads `data-format` or `data-validate`. [N.formatter](../data/formatter.md) and [N.validator](../data/validator.md) call it when rules are declared in markup.

```html
<input id="amount" data-format='[["numeric", "#,###"]]' data-validate='[["required"]]'>
```

```js
N.element.toRules(N("#amount"), "validate"); // { amount: [["required"]] }
```

## `N.element.toData(eles)`

Builds a data object from the elements in the collection `eles`.[^element]

| Element | Key | Value |
|---|---|---|
| radio or checkbox group (same `name`, found among siblings, sibling `label`s or the enclosing `.select_input_container__`) | `name` | `vals()` of the group |
| a single radio or checkbox | `id`, or `name` when there is no `id` | `vals()` (for a single checkbox `sgChkdVal` / `sgUnChkdVal`) |
| `select` with an `id` | `id` | `vals()` |
| `img` with an `id` | `id` | the `src` attribute |
| other form control (`input`, `textarea`, ...) with an `id` | `id` | `.val()` |
| any other element with an `id` | `id` | `.text()` |

Elements without an `id` are skipped, except radios and checkboxes, which fall back to `name`. Selected values come from [`N().vals()`](n-function.md).[^vals] `N.form.add()` uses it to build the initial row from the form's inputs, and `N.validator` uses it when it validates elements that have no bound data.

## `N.element.dataChanged(ele)`

Adds the class `data_changed__` to `ele` and runs `fadeOut(150).fadeIn(300)`. `N.form.update(row, key)` calls it for the element bound to `key`, which is how [N.ds](../data/datasync.md) data synchronization highlights a changed field.[^element]

## `N.element.maxZindex([ele])`

Returns the highest computed `z-index` among the elements of `ele` (default `jQuery("div, span, ul, p, nav, article, section")`); `auto` counts as `0`.[^element]

- Side effect: an element whose `z-index` is `2147483647` or more is lowered to `2147482648` and gets the attribute `fixed="[Natural-JS]limited_z-index_value(-999)"`.
- An empty collection returns `-Infinity` (`Math.max()` with no values).
- `N.alert` (and `N.popup`, which opens an alert) uses it for the `alwaysOnTop` option.

# Pitfalls

- `data-opts`, `data-format` and `data-validate` must be strict JSON (double-quoted keys and strings). Anything else is returned as a plain string and the options are not applied.
- jQuery caches `data-*` values after the first read, so changing the attribute afterwards has no effect on `toOpts` or `toRules`. Pass new options in JavaScript instead.
- `toData` reads display elements too: a `span` with an `id` inside the target set becomes a key with its text. Narrow the set, for example `N.element.toData(N("#box", view).find(":input"))`.
- `toData` returns an object, not a boolean.

# Known issues

* **`maxZindex` reports the value before capping** - Actual: an element at `z-index` 2147483647 or more is lowered to 2147482648, but the function still returns the original value, so callers that add `+ 1` get a value above the 32-bit maximum. Likely intent: return the lowered value. Workaround: `Math.min(N.element.maxZindex(eles), 2147483646)`.[^element]

# Examples

Collect the values of a search area as request parameters:

```js
const params = N.element.toData(N("#searchBox", view).find(":input"));
N(params).comm("search.json").submit(function (data) {
    N("#grid", view).instance("grid").bind(data);
});
```

Put a custom layer above everything on the page:

```js
const z = N.element.maxZindex(N("div", view));
N("#myLayer", view).css("z-index", String(z + 1));
```

# Related

- [N()](n-function.md) - `vals()`, which `toData` uses for selects, radios and checkboxes.
- [Component model](../ui/component-model.md) - how `data-opts` is merged into component options.
- [N.form](../ui/form.md) - uses `toData` in `add()` and `dataChanged` during data sync.
- [N.formatter](../data/formatter.md) and [N.validator](../data/validator.md) - read `data-format` and `data-validate` through `toRules`.
- [N.alert](../ui/alert.md) - `alwaysOnTop`, which relies on `maxZindex`.

[^element]: NC.element implementation
[^vals]: NC.prototype.vals (used by toData)
