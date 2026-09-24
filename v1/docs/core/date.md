---
type: API Reference
title: N.date
description: Date helpers - parse digit strings into Date objects, format them with PHP-style format characters (Date.prototype.formatDate), compute day differences, convert timestamps and build a month calendar.
tags: [core, date, formatting]
symbols: [N.date, NC.date, N.date.diff, N.date.strToDateStrArr, N.date.strToDate, N.date.format, N.date.dateToTs, N.date.tsToDate, N.date.dateList, Date.prototype.formatDate, Date.DATE_ATOM, Date.DATE_ISO8601, Date.DATE_RFC2822, Date.DATE_W3C]
sources:
  - id: date
    resource: ../../src/natural.core.js
    title: NC.date implementation
    symbol: NC.date
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: ae1198d28d65
  - id: formatdate
    resource: ../../src/natural.core.js
    title: Date.prototype.formatDate and Date.DATE_* constants (IIFE after class NC, whole-file fingerprint)
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CORE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.date` parses the digit strings that business systems exchange (`"20240131"`, `"202401311345"`) into `Date` objects and formats them back. Formatting is done by `Date.prototype.formatDate`, which Natural-CORE adds to every `Date` and which uses PHP `date()` format characters (`Y-m-d H:i:s`). The default input formats come from `N.context.attr("data").formatter.date` in `natural.config.js`.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.date.diff` | `N.date.diff(refDate, targetDate)` | number of days |
| `N.date.strToDateStrArr` | `N.date.strToDateStrArr(str, format[, isString])` | `[year, month, day]` or `[year, month]` |
| `N.date.strToDate` | `N.date.strToDate(str[, format])` | `{ obj, format }` or `null` |
| `N.date.format` | `N.date.format(str[, format])` | string |
| `N.date.dateToTs` | `N.date.dateToTs([dateObj])` | Unix time in seconds |
| `N.date.tsToDate` | `N.date.tsToDate([ms])` | `Date` |
| `N.date.dateList` | `N.date.dateList(year, month)` | `Date[6][7]` |
| `Date.prototype.formatDate` | `date.formatDate(format[, time])` | string |
| `Date.DATE_*` | `Date.DATE_ATOM`, `Date.DATE_ISO8601`, `Date.DATE_RFC2822`, `Date.DATE_W3C` | format strings |

# Functions

## `N.date.diff(refDate, targetDate)`

Returns `Math.ceil((target - ref) / 86400000)`: positive when `targetDate` is later. Each argument is a `Date` or a string parsed with `N.date.strToDate`.[^date]

- Partial days round up: `N.date.diff("20240101", "2024010112")` is `1`.
- A string that `strToDate` cannot parse throws a TypeError.

## `N.date.strToDateStrArr(str, format[, isString])`

Splits a digits-only date string into parts according to `format`, whose leading letters must be one of `Ymd`, `mdY`, `dmY` (returns `[year, month, day]`) or `Ym`, `mY` (returns `[year, month]`). Any other format throws `N.error(...)`. Parts are numbers (`parseInt`) unless `isString` is `true`. A 7-character string with a 3-letter format (or 5 characters with 2 letters) is read with a 3-digit year.[^date]

```js
N.date.strToDateStrArr("20240131", "Ymd");        // [2024, 1, 31]
N.date.strToDateStrArr("12312024", "mdY", true);  // ["2024", "12", "31"]
```

## `N.date.strToDate(str[, format])`

Removes every non-digit from `str` and builds a `Date` from the remaining digits. Returns `{ obj: Date, format: string }`, or `null` for an unsupported length.[^date]

| Digits | `obj` | Default `format` (from `N.context.attr("data").formatter.date`) |
|---|---|---|
| 3-4 | 1 February of that year, 00:00 (see Known issues) | `"Y"` (the `format` argument is ignored) |
| 6 | first day of the month | `Ym()` (shipped: `"Y-m"`) |
| 8 | the day, 00:00 | `Ymd()` (shipped: `"Y-m-d"`) |
| 10 | with hours | `YmdH()` (shipped: `"Y-m-d H"`) |
| 12 | with hours and minutes | `YmdHi()` (shipped: `"Y-m-d H:i"`) |
| 14 or more | with hours, minutes and seconds (extra digits ignored) | `YmdHis()` (shipped: `"Y-m-d H:i:s"`) |
| other | `null` returned | — |

- Only the `Y`, `m` and `d` letters of `format` decide the date order (passed to `strToDateStrArr`); hours, minutes and seconds are always digits 9-10, 11-12 and 13-14.
- The returned `format` is the `format` argument or the configured default, separators included; `N.date.format` uses it as the output format.
- Values are not validated: `"20241345"` rolls over to 14 February 2025.

## `N.date.format(str[, format])`

Parses `str` with `N.date.strToDate(str)` (default formats, so the input must be in the configured `Y`, `m`, `d` order) and returns `date.formatDate(format)`, or `formatDate` with the parsed default format when `format` is omitted. Returns `str` unchanged when it cannot be parsed.[^date]

```js
N.date.format("20240131");                    // "2024-01-31" with the shipped config
N.date.format("202401311345", "Y.m.d H:i");   // "2024.01.31 13:45"
N.date.format("abc");                         // "abc"
```

## `N.date.dateToTs([dateObj])`

Returns `Math.round(dateObj.getTime() / 1000)`, Unix time in **seconds**; the current time when `dateObj` is omitted.[^date]

## `N.date.tsToDate([ms])`

Returns `new Date(ms)`, so the argument is a timestamp in **milliseconds**; the current time when omitted.[^date]

## `N.date.dateList(year, month)`

Returns a calendar grid for `month` (1-12): always 6 weeks of 7 `Date` objects at 00:00, each week starting on Sunday, padded with days of the previous and next months. No Natural-JS component calls it; use it to render your own calendar.[^date]

```js
const weeks = N.date.dateList(2024, 2);
weeks[0][0].getDate(); // 28 (Sunday 28 January 2024)
weeks[5][6].getDate(); // 9  (Saturday 9 March 2024)
```

## `date.formatDate(format[, time])`

`Date.prototype.formatDate`, added to every `Date` by Natural-CORE. Replaces each format character (see Rule catalog) with the date's value and keeps other characters as they are; `%` makes the next character literal. When `time` is truthy the method formats `new Date(time)` instead of the receiver, so `time` is in milliseconds (the source comment says seconds).[^formatdate]

```js
new Date(2024, 0, 5, 14, 3, 9).formatDate("Y-m-d H:i:s");  // "2024-01-05 14:03:09"
new Date(2024, 0, 5).formatDate("D, j M y");                // "Fri, 5 Jan 24"
new Date(2024, 0, 5).formatDate("%Y Y");                    // "Y 2024"
```

## `Date.DATE_ATOM`, `Date.DATE_ISO8601`, `Date.DATE_RFC2822`, `Date.DATE_W3C`

Predefined format strings for `formatDate`: `DATE_ATOM` and `DATE_W3C` are `"Y-m-d%TH:i:sP"` (`2024-01-05T01:02:03+09:00`), `DATE_ISO8601` is `"Y-m-d%TH:i:sO"` (`+0900` offset) and `DATE_RFC2822` is `"D, d M Y H:i:s O"`.[^formatdate]

# Rule catalog

## `formatDate` format characters

| Char | Output | Char | Output |
|---|---|---|---|
| `Y` | 4-digit year | `y` | 2-digit year |
| `m` | month `01`-`12` | `n` | month `1`-`12` |
| `F` | `January`-`December` | `M` | `Jan`-`Dec` |
| `d` | day `01`-`31` | `j` | day `1`-`31` |
| `l` | `Sunday`-`Saturday` | `D` | `Sun`-`Sat` |
| `N` | ISO weekday `1` (Mon)-`7` (Sun) | `w` | weekday `0` (Sun)-`6` (Sat) |
| `S` | English ordinal suffix `st`, `nd`, `rd`, `th` | `z` | day of the year from `0` |
| `W` | ISO-8601 week number | `t` | days in the month |
| `L` | `1` in a leap year, else `0` | `I` | `1` if daylight saving time is guessed, else `0` |
| `H` | hour `00`-`23` | `G` | hour `0`-`23` |
| `h` | hour `01`-`12` | `g` | hour `1`-`12` |
| `i` | minutes `00`-`59` | `s` | seconds `00`-`59` |
| `a` | `am` / `pm` | `A` | `AM` / `PM` |
| `O` | UTC offset `+0900` | `P` | UTC offset `+09:00` |
| `Z` | UTC offset in seconds | `U` | seconds since the Unix epoch |
| `c` | ISO 8601 date-time `2024-01-05T14:03:09+09:00` | `r` | RFC 822 date `Fri, 05 Jan 2024 14:03:09 +0900` |
| `B` | Swatch Internet time | `%` | makes the next character literal |

Month and day names are English only. [N.formatter](../data/formatter.md) date rules and `N.datepicker` use these characters.[^formatdate]

# Pitfalls

`dateToTs` returns seconds while `tsToDate` expects milliseconds, so the round trip lands in January 1970.[^date]

```js
// Wrong (legacy): N.date.tsToDate(N.date.dateToTs(date))
N.date.tsToDate(N.date.dateToTs(date) * 1000);
```

- The second argument of `N.date.format` is the **output** format. To read a string in another order, parse it explicitly: `N.date.strToDate("31012024", "dmY").obj.formatDate("Y-m-d")`.
- `diff`, `strToDate` and `format` return a number, an object (or `null`) and a string respectively.
- `strToDate` accepts impossible dates; validate input with the `date` rule of [N.validator](../data/validator.md).
- `N.date.diff` and `N.date.format` call `this.strToDate`; call them as `N.date.diff(...)`, not detached.

# Known issues

* **A year-only string parses to 1 February** - Actual: for 3-4 digits `strToDate` calls `new Date(str, 1, 1)`, and month index `1` is February. Formatting with `"Y"` hides it, but `N.date.strToDate("2024").obj` is 2024-02-01. Likely intent: 1 January. Workaround: `new Date(Number(year), 0, 1)`.[^date]
* **`dateToTs` and `tsToDate` use different units** - Actual: `dateToTs` returns seconds and `tsToDate` passes its argument to `new Date(ms)`. Likely intent: symmetric conversion. Workaround: multiply by 1000 before `tsToDate`.[^date]

# Examples

Days until a due date:

```js
const today = new Date().formatDate("Ymd");
const left = N.date.diff(today, row.dueDate); // row.dueDate = "20241231"
```

Show a server timestamp:

```js
const text = new Date(row.updatedAt).formatDate("Y-m-d H:i"); // updatedAt in ms
```

Parse and re-format a date-time string:

```js
const info = N.date.strToDate("2024-01-31 13:45:10");
info.format;                        // "Y-m-d H:i:s" (shipped config)
info.obj.formatDate("m/d/Y g:i A"); // "01/31/2024 1:45 PM"
```

# Related

- [N.formatter](../data/formatter.md) - `date` format rules built on `N.date.format` and `formatDate`.
- [N.validator](../data/validator.md) - date validation rules.
- [N.datepicker](../ui/datepicker.md) - the date input component, which formats its values with `formatDate`.
- [Configuration](../setup/configuration.md) - `N.context.attr("data").formatter.date` default formats and separators.
- [N.string](string.md) - string helpers such as `lpad` for building date strings.

[^date]: NC.date implementation
[^formatdate]: Date.prototype.formatDate and Date.DATE_* constants (IIFE after class NC, whole-file fingerprint)
