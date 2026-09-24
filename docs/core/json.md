---
type: API Reference
title: N.json
description: JSON data helpers - mapFromKeys projects objects onto chosen keys, mergeJsonArray appends rows with new key values to an array, and format pretty-prints JSON.
tags: [core, json, utilities]
symbols: [N.json, NC.json, N.json.mapFromKeys, N.json.mergeJsonArray, N.json.format]
sources:
  - id: json
    resource: ../../src/natural.core.js
    title: NC.json implementation
    symbol: NC.json
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 53d0db036c16
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CORE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.json` works on JSON-style data: plain objects and arrays of row objects as used by `N.form`, `N.grid` and `N.comm`. `mapFromKeys` is what the `data(rowStatus, ...keys)` methods of `N.form`, `N.list` and `N.grid` use to return only some columns. Note that `mergeJsonArray` modifies its first argument.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.json.mapFromKeys` | `N.json.mapFromKeys(obj, ...keys)` | new object or new array of objects (or `obj` itself) |
| `N.json.mergeJsonArray` | `N.json.mergeJsonArray(arr1, arr2, key)` | `arr1`, modified |
| `N.json.format` | `N.json.format(data[, indent])` | string or `null` |

# Functions

## `N.json.mapFromKeys(obj, ...keys)`

Returns copies of `obj` that contain only the given keys.[^json]

- `obj` is an object: returns a new object with each key whose value is not `undefined` (`null` values are kept).
- `obj` is an array: returns a new array with one projected object per row; an empty array is returned as is.
- No keys given: returns `obj` itself (same reference).
- When `N.context.attr("core").excludeMapFromKeys` is an array, its keys are appended to `keys`, so they are always copied.

```js
N.json.mapFromKeys({ id: 1, name: "Kim", age: 30 }, "id", "name");  // { id: 1, name: "Kim" }
N.json.mapFromKeys([{ id: 1, age: 30 }, { id: 2, age: 25 }], "id");  // [{ id: 1 }, { id: 2 }]
```

## `N.json.mergeJsonArray(arr1, arr2, key)`

Pushes each row of `arr2` whose `row[key]` does not occur in `arr1` onto `arr1`, and returns `arr1`.[^json]

- `arr1` is modified in place and returned (same reference).
- The check is a substring search in the comma-joined key values of `arr1` (see Known issues).
- Rows repeated inside `arr2` are all added; only `arr1` is checked.
- `key` is effectively required: without it nothing is deduplicated.

## `N.json.format(data[, indent])`

Returns `JSON.stringify(data, undefined, indent)` with `indent` defaulting to `4`. A JSON string is parsed first. Returns `null` when `N.isEmptyObject(data)` is true: `{}`, `[]`, `""`, `null`, and also numbers and booleans.[^json] An invalid JSON string throws a `SyntaxError`.

# Pitfalls

`mergeJsonArray` does not copy `arr1`.[^json]

```js
// Wrong (legacy): const merged = N.json.mergeJsonArray(rows, moreRows);   - rows is changed, nothing deduplicated
const merged = N.json.mergeJsonArray(rows.slice(), moreRows, "id");
```

- Despite its name, `excludeMapFromKeys` adds keys to every `mapFromKeys` projection; list keys there that must always travel with a row (for example `rowStatus`). It is not set in the shipped `natural.config.js`.
- `N.json.format(0)` and `N.json.format(true)` return `null`, not `"0"` or `"true"`.

# Known issues

* **`mergeJsonArray` matches key values as substrings** - Actual: the key values of `arr1` are joined into one string (`"10,20"`) and each new value is tested with `indexOf`, so key `1` or `"0,2"` counts as present and the row is skipped. Likely intent: exact key comparison. Workaround: filter with a `Set` of keys, `arr2.filter((r) => !new Set(arr1.map((x) => x.id)).has(r.id))`, then `push`.[^json]

# Examples

Send only the changed rows with selected columns:

```js
const grid = N("#grid", view).instance("grid");
const rows = N.json.mapFromKeys(grid.data("modified"), "empNo", "empNm", "rowStatus");
N(rows).comm("employees/save.json").submit();
```

Show a response in a `pre` element for debugging:

```js
N("#debug", view).text(N.json.format(data, 2));
```

# Related

- [N.array](array.md) - `deduplicate` for a single array.
- [N.grid](../ui/grid.md) and [N.form](../ui/form.md) - `data(rowStatus, ...keys)` uses `mapFromKeys`.
- [Configuration](../setup/configuration.md) - where `excludeMapFromKeys` would be set in `N.context.attr("core")`.
- [Data utilities](../data/data-utilities.md) - filtering and sorting data arrays.
- [Communicator](../architecture/communicator.md) - sending the resulting objects with `N.comm`.

[^json]: NC.json implementation
