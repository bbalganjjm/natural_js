---
type: API Reference
title: N.array
description: Array helper - N.array.deduplicate returns a new array without duplicate values, or without objects that repeat a given key.
tags: [core, array, utilities]
symbols: [N.array, NC.array, N.array.deduplicate]
sources:
  - id: array
    resource: ../../src/natural.core.js
    title: NC.array implementation
    symbol: NC.array
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 27e4140e8c73
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CORE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.array` currently holds one function, `deduplicate`, which removes repeated values from an array or repeated rows from a data array by key. The input is not modified. For merging two data arrays see [N.json](json.md) `mergeJsonArray`.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.array.deduplicate` | `N.array.deduplicate(arr[, key])` | new array |

# Functions

## `N.array.deduplicate(arr[, key])`

Walks `arr` (an array or a jQuery collection) in order and keeps the first occurrence of each item.[^array]

- Plain objects with `key` given: an object is dropped when an already kept object has the same `obj[key]` (strict `===` comparison).
- Everything else (primitives, or objects without `key`): compared with `===`, so `2` and `"2"` are different and two objects with the same content are both kept.
- Returns a new array; `arr` is not changed.

```js
N.array.deduplicate([1, 2, 2, "2"]);                                // [1, 2, "2"]
N.array.deduplicate([{ id: 1, a: 1 }, { id: 1, a: 2 }, { id: 2 }], "id"); // [{ id: 1, a: 1 }, { id: 2 }]
```

# Pitfalls

- Without `key`, objects are compared by reference: `N.array.deduplicate([{ a: 1 }, { a: 1 }])` keeps both.
- Objects whose `key` value is `null` or `undefined` are never treated as duplicates of each other (the kept keys are collected with jQuery `map`, which drops those values).
- Passing a string instead of an array makes jQuery treat it as a selector; always pass an array.

# Examples

Unique department codes from grid rows:

```js
const rows = N("#grid", view).instance("grid").data();
const depts = N.array.deduplicate(rows.map(function (r) { return r.deptCd; }));
```

Unique rows by primary key before sending them:

```js
const unique = N.array.deduplicate(selectedRows, "empNo");
N(unique).comm("employees/save.json").submit();
```

# Related

- [N.json](json.md) - `mergeJsonArray` and `mapFromKeys` for data arrays.
- [Data utilities](../data/data-utilities.md) - filtering and sorting data arrays.
- [N (static functions)](n-static.md) - `N.isArray` and `N.isArraylike`.
- [N.grid](../ui/grid.md) - `data()` returns the row arrays these helpers work on.

[^array]: NC.array implementation
