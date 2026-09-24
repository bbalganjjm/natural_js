---
type: API Reference
title: N.data
description: Filters and sorts JSON object arrays on the client with N.data.filter and N.data.sort, or with the N(data).datafilter and N(data).datasort plugin forms.
tags: [data, filter, sort]
symbols: [N.data, N.data.filter, N.data.sort, N.data.sortBy, N().datafilter, N().datasort, ND.data, ND.prototype.datafilter, ND.prototype.datasort]
sources:
  - id: filter
    resource: ../../src/natural.data.js
    title: ND.data.filter
    symbol: ND.data.filter
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 8a170452c193
  - id: sort
    resource: ../../src/natural.data.js
    title: ND.data.sort
    symbol: ND.data.sort
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: c1b46dbcb91a
  - id: sort-by
    resource: ../../src/natural.data.js
    title: ND.data.sortBy comparator factory
    symbol: ND.data.sortBy
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 4997c9fcc929
  - id: datafilter
    resource: ../../src/natural.data.js
    title: ND.prototype.datafilter jQuery plugin wrapper
    symbol: ND.prototype.datafilter
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: ed565ac76a89
  - id: datasort
    resource: ../../src/natural.data.js
    title: ND.prototype.datasort jQuery plugin wrapper
    symbol: ND.prototype.datasort
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 7ec41e8d8ac3
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-DATA.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.data` holds the static helpers for filtering and sorting arrays of row objects without a server round trip. `N(data).datafilter(...)` and `N(data).datasort(...)` are the same functions called on an N collection. N.grid and N.list use them internally: `data("modified")` filters with `datafilter`, and grid column sorting uses `datasort`.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.data.filter` | `N.data.filter(data, condition)` | new array, or new N collection when `data` is one |
| `N.data.sort` | `N.data.sort(data, key[, reverse])` | `data` itself, sorted in place |
| `N.data.sortBy` | `N.data.sortBy(key, direction)` | comparator `function(a, b)` |
| `N().datafilter` | `N(data).datafilter(condition)` | new N collection |
| `N().datasort` | `N(data).datasort(key[, reverse])` | the same N collection, sorted in place |

# Functions

## `N.data.filter(data, condition)`

- `data` (array or N/jQuery collection of row objects): the rows to filter.
- `condition`:[^filter]
  - **function** `(item, index) => boolean`: passed to `jQuery.grep`; rows for which it returns a truthy value are kept.
  - **string**: an expression on the row's properties, such as `'name === "Mike"'` or `'age > 20'`. It is compiled once with `new Function("item", "return item." + condition)` after two rewrites: every space is removed, and both `||` and `&&` are replaced by ` || item.` (see Known issues).
  - anything else: `data` is returned unchanged.
- Returns a new plain array for array input, or a new N collection (`N(jQuery.grep(...))`) for an N/jQuery collection. The row objects are shared with the input, not copied.

## `N.data.sort(data, key[, reverse])`

- `data` (array or N/jQuery collection): sorted **in place** with `data.sort(...)` and returned; no copy is made.[^sort]
- `key` (string): property to compare.
- `reverse` (boolean): truthy sorts in descending order.
- Uses `this.sortBy(...)`, so call it as `N.data.sort(...)`; a detached reference (`const sort = N.data.sort; sort(rows, "k")`) throws.

## `N.data.sortBy(key, direction)`

Returns the comparator that `sort` uses. `direction` is `1` (ascending) or `-1` (descending), not a boolean. Values are compared as numbers only when both `Number(a)` and `Number(b)` are non-zero numbers; otherwise they are compared with `<` and `>` as they are (strings lexicographically). Rows with equal or incomparable values (for example `undefined`) return `0`.[^sort-by]

## `N(data).datafilter(condition)`

Runs `N.data.filter(this, condition)` on the N collection and returns a new N collection. Call `.get()` or `.toArray()` for a plain array.[^datafilter]

## `N(data).datasort(key[, reverse])`

Runs `N.data.sort(this, key, reverse)`. The collection itself is sorted in place (jQuery collections carry `Array.prototype.sort`) and returned.[^datasort]

# Pitfalls

`datasort` takes a key and a direction, not a condition or comparator.

```js
// Wrong (legacy): N(products).datasort(function (a, b) { return a.price - b.price; });
N(products).datasort("price", true); // descending by price
```

`sort` changes the input array. Copy first when the original order is still needed.

```js
// Wrong (legacy): const sorted = N.data.sort(products, "price"); // then using products as unsorted
const sorted = N.data.sort(products.slice(), "price");
```

String conditions are not JavaScript expressions: spaces are removed and `&&` means OR. Use a function for anything but a single comparison without spaces inside literals.

```js
// Wrong (legacy): N.data.filter(users, 'active === true && age < 30');
N.data.filter(users, function (user) { return user.active === true && user.age < 30; });
```

- String conditions use `new Function`, which a Content-Security-Policy without `'unsafe-eval'` blocks. Function conditions have no such limit.
- The plugin forms return N collections, not arrays; `JSON.stringify(N(rows).datafilter(fn))` serializes the jQuery object. Use `.get()`.

# Known issues

* **String conditions turn `&&` into `||`** - Actual: `condition.replace(/\&\&/g, " || item.")`, so `'a === 1 && b === 2'` keeps rows that match either comparison. Likely intent: AND. Workaround: use a function condition.[^filter]
* **String conditions drop spaces inside literals** - Actual: `condition.replace(/ /g, "")` also strips spaces inside quoted values, so `'name === "Mike Lee"'` compares against `"MikeLee"`. Likely intent: remove only spaces around operators. Workaround: use a function condition.[^filter]

# Examples

Filtering:

```js
const users = [
    { id: 1, name: "John", age: 28, active: true },
    { id: 2, name: "Mike", age: 32, active: false },
    { id: 3, name: "Sarah", age: 25, active: true },
    { id: 4, name: "David", age: 35, active: true }
];

N.data.filter(users, function (user) { return user.active && user.age < 30; });
// [{ id: 1, name: "John", ... }, { id: 3, name: "Sarah", ... }]

N.data.filter(users, 'name === "Mike"');
// [{ id: 2, name: "Mike", age: 32, active: false }]

N(users).datafilter(function (user) { return user.active; }).get();
// John, Sarah, David
```

Sorting (the two `N.data.sort` calls reorder `products` itself; `N(products)` is a new collection, so `datasort` reorders only that collection):

```js
const products = [
    { id: 1, name: "Laptop", price: 1200 },
    { id: 2, name: "Phone", price: 800 },
    { id: 3, name: "Tablet", price: 500 },
    { id: 4, name: "Desktop", price: 1500 }
];

N.data.sort(products, "price");       // Tablet 500, Phone 800, Laptop 1200, Desktop 1500
N.data.sort(products, "name", true);  // Tablet, Phone, Laptop, Desktop
N(products).datasort("price", true);  // N collection: Desktop, Laptop, Phone, Tablet
```

Filter, then sort descending:

```js
const items = [
    { category: "A", value: 10, available: true },
    { category: "B", value: 5, available: false },
    { category: "A", value: 8, available: true },
    { category: "C", value: 12, available: true },
    { category: "B", value: 15, available: true }
];

N.data.sort(N.data.filter(items, function (item) { return item.available; }), "value", true);
// [{ B, 15 }, { C, 12 }, { A, 10 }, { A, 8 }]
```

# Related

- [N.grid](../ui/grid.md) - `data("modified")` uses `datafilter`; sortable columns use `datasort`.
- [N()](../core/n-function.md) - N collections, the receiver of `datafilter` and `datasort`.
- [N.array](../core/array.md) - other array helpers in Natural-CORE.
- [N.formatter](formatter.md) and [N.validator](validator.md) - the other Natural-DATA libraries.
- [API conventions](../overview/api-conventions.md) - static functions versus plugin forms.

[^filter]: ND.data.filter
[^sort]: ND.data.sort
[^sort-by]: ND.data.sortBy comparator factory
[^datafilter]: ND.prototype.datafilter jQuery plugin wrapper
[^datasort]: ND.prototype.datasort jQuery plugin wrapper
