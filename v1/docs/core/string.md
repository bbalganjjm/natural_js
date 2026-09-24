---
type: API Reference
title: N.string
description: String helpers - contains, startsWith, endsWith, insertAt, lpad and rpad, byteLength, removeWhitespace, isEmpty and the null-safe trimTo* family.
tags: [core, string, utilities]
symbols: [N.string, NC.string, N.string.contains, N.string.endsWith, N.string.startsWith, N.string.insertAt, N.string.removeWhitespace, N.string.lpad, N.string.rpad, N.string.isEmpty, N.string.byteLength, N.string.trimToEmpty, N.string.nullToEmpty, N.string.trimToNull, N.string.trimToUndefined, N.string.trimToZero, N.string.trimToVal]
sources:
  - id: string
    resource: ../../src/natural.core.js
    title: NC.string implementation
    symbol: NC.string
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: f093397fe7be
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CORE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.string` holds the string helpers Natural-JS uses internally and exposes for application code. The `trimTo*` functions accept `null` and `undefined`, which makes them the safe way to normalize values read from forms or server data. Call them as `N.string.fn(...)`; `removeWhitespace` uses `this` and breaks when detached.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.string.contains` | `N.string.contains(context, str)` | boolean |
| `N.string.startsWith` | `N.string.startsWith(context, str)` | boolean |
| `N.string.endsWith` | `N.string.endsWith(context, str)` | boolean |
| `N.string.insertAt` | `N.string.insertAt(context, idx, str)` | string |
| `N.string.removeWhitespace` | `N.string.removeWhitespace(str)` | string (or the input unchanged) |
| `N.string.lpad` | `N.string.lpad(str, length, padStr)` | string |
| `N.string.rpad` | `N.string.rpad(str, length, padStr)` | string |
| `N.string.isEmpty` | `N.string.isEmpty(str)` | boolean |
| `N.string.byteLength` | `N.string.byteLength(str[, charByteLength])` | number |
| `N.string.trimToEmpty` | `N.string.trimToEmpty(str)` | string |
| `N.string.nullToEmpty` | `N.string.nullToEmpty(str)` | the input, or `""` |
| `N.string.trimToNull` | `N.string.trimToNull(str)` | string or `null` |
| `N.string.trimToUndefined` | `N.string.trimToUndefined(str)` | string or `undefined` |
| `N.string.trimToZero` | `N.string.trimToZero(str)` | string (`"0"` when empty) |
| `N.string.trimToVal` | `N.string.trimToVal(str, val)` | string or `val` |

# Functions

## `N.string.contains(context, str)`

`true` when `context` contains `str`. Throws `N.error(...)` when `context` is not a string primitive.[^string]

## `N.string.startsWith(context, str)`

`true` when `context` starts with `str`. Throws when `context` is not a string.

## `N.string.endsWith(context, str)`

`true` when `context` ends with `str`. Throws when `context` is not a string; `str` must be a string too.

## `N.string.insertAt(context, idx, str)`

Returns `context.substring(0, idx) + str + context.substring(idx)`. No type check.

## `N.string.removeWhitespace(str)`

Removes every whitespace character (`/\s/g`). Returns the input unchanged when it is `null`, `undefined`, `""` or whitespace only (see Known issues).[^string]

## `N.string.lpad(str, length, padStr)`

Prepends `padStr` until `str.length >= length`. With a multi-character `padStr` the result can be longer than `length`.

## `N.string.rpad(str, length, padStr)`

Appends `padStr` until `str.length >= length`.

## `N.string.isEmpty(str)`

`true` for `null`, `undefined`, `""` and whitespace-only strings (`N.string.trimToEmpty(str).length === 0`). `0` is not empty.[^string]

## `N.string.byteLength(str[, charByteLength])`

Returns the byte length of `str`, counting each UTF-16 code unit as 1 byte below U+0080, 2 bytes below U+0800 and `charByteLength` bytes otherwise.[^string]

- `charByteLength` defaults to `N.context.attr("core").charByteLength`, or `3` when that is not set (the shipped `natural.config.js` sets `3`, the UTF-8 size of Korean and Chinese characters). See [Configuration](../setup/configuration.md).
- A surrogate pair (for example an emoji) counts as two code units, so `2 * charByteLength`.
- Counting stops at the first `"\0"` character. `str` must be a string.
- The `maxbyte`, `minbyte` and `rangebyte` rules of [N.validator](../data/validator.md) use the same setting.

## `N.string.trimToEmpty(str)`

`""` for `null` and `undefined`, otherwise `String(str).trim()` (numbers are converted: `5` becomes `"5"`).

## `N.string.nullToEmpty(str)`

`""` for `null` and `undefined`, otherwise `str` unchanged (not trimmed, not converted).

## `N.string.trimToNull(str)`

The trimmed string, or `null` when it is empty.

## `N.string.trimToUndefined(str)`

The trimmed string, or `undefined` when it is empty.

## `N.string.trimToZero(str)`

The trimmed string, or the string `"0"` when it is empty.

## `N.string.trimToVal(str, val)`

The trimmed string, or `val` when it is empty.

# Pitfalls

There is no `N.string.trim`; calling it throws a TypeError.[^string]

```js
// Wrong (legacy): N.string.trim(value)
N.string.trimToEmpty(value);
```

- `N.string.isEmpty("   ")` is `true`, and `N.string.byteLength` returns a number, not a string.
- `contains`, `startsWith` and `endsWith` throw for `null`, `undefined`, numbers and `String` objects. Normalize first: `N.string.contains(N.string.trimToEmpty(v), "x")`.
- `lpad` and `rpad` need a string: a number is returned unchanged because `(5).length` is `undefined`. Use `N.string.lpad(String(month), 2, "0")`.
- An empty `padStr` never reaches the target length and loops forever.

# Known issues

* **`removeWhitespace` keeps whitespace-only strings** - Actual: it returns `str` untouched when `this.isEmpty(str)` is true, and `isEmpty` trims first, so `"   "` comes back as `"   "`. Likely intent: guard only `null`, `undefined` and `""`. Workaround: `N.string.trimToEmpty(str).replace(/\s/g, "")`.[^string]

# Examples

```js
N.string.lpad("7", 3, "0");                 // "007"
N.string.rpad("ab", 4, "*");                // "ab**"
N.string.insertAt("20240131", 4, "-");      // "2024-0131"
N.string.byteLength("\uAC00\uB098a");      // two Hangul syllables + "a": 7 with charByteLength 3
N.string.byteLength("\uAC00\uB098a", 2);   // 5
N.string.trimToNull("  ");                  // null
N.string.trimToVal(param.page, "1");        // "1" when page is empty
N.string.endsWith(fileName, ".xlsx");
```

# Related

- [N (static functions)](n-static.md) - `N.isString` and the other type tests.
- [N.validator](../data/validator.md) - byte-length rules that share `charByteLength`.
- [N.formatter](../data/formatter.md) - formatting rules such as `lpad` and `trimtoempty` built on these helpers.
- [Configuration](../setup/configuration.md) - `N.context.attr("core").charByteLength`.
- [N.array](array.md) and [N.json](json.md) - the other data helpers in Natural-CORE.

[^string]: NC.string implementation
