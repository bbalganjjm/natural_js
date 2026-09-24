---
type: API Reference
title: N.mask
description: "User-format mask engine behind the generic and numeric rules of N.formatter - setGeneric applies @ # ~ character masks and setNumeric applies #,##0.00 style number masks."
tags: [core, mask, formatting]
status: draft
symbols: [N.mask, NC.mask, NC.mask.prototype.setGeneric, NC.mask.prototype.setNumeric]
sources:
  - id: mask
    resource: ../../src/natural.core.js
    title: NC.mask implementation
    symbol: NC.mask
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 185c0f7e1d96
  - id: generic
    resource: ../../src/natural.core.js
    title: NC.mask.prototype.setGeneric
    symbol: NC.mask.prototype.setGeneric
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: e822e4867f95
  - id: numeric
    resource: ../../src/natural.core.js
    title: NC.mask.prototype.setNumeric
    symbol: NC.mask.prototype.setNumeric
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: ec47ca778795
  - id: formatter
    resource: ../../src/natural.data.js
    title: ND.formatter (generic and numeric rules)
    symbol: ND.formatter
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: e20695aa680a
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.mask` is the formatting engine, adapted from the Pengoworks Mask JavaScript API, that the `generic` and `numeric` rules of [N.formatter](../data/formatter.md) run on. Prefer those formatter rules in application code (`["generic", "###-####"]`, `["numeric", "#,###.##"]`); use `new N.mask(format)` directly only to format a value outside a form or grid. It is a class, so it needs `new`.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.mask` | `new N.mask(format)` | mask instance |
| `setGeneric` | `mask.setGeneric(value[, deleting])` | formatted string, or `value` on error (`value` must be a string) |
| `setNumeric` | `mask.setNumeric(value[, mode[, deleting]])` | formatted string; on error `value` when it is a string, otherwise `true` |

# Constructor

## `new N.mask(format)`

Creates a mask for the format string `format` and initializes these instance properties:[^mask]

| Property | Initial value | Meaning |
|---|---|---|
| `format` | `format` | the mask string |
| `error` | `[]` | error messages pushed by failed calls |
| `errorCodes` | `[]` | error codes: `1` value or mask does not fit, `2` not a number |
| `strippedValue` | `""` | the last value after invalid characters were removed |
| `allowPartial` | `false` | set to `true` to format incomplete input; the next expected character class is then kept in `nextValidChar` (generic masks) |

`ND.formatter.generic` and `ND.formatter.numeric` create a new instance per call: `new NC.mask(args[0]).setGeneric(String(str))` and `new NC.mask(args[0]).setNumeric(String(str), args[1])`.[^formatter]

# Methods

## `setGeneric(value[, deleting])`

Removes every character that is not a letter, digit, Hangul character or space from `value`, then fills the mask placeholders from left to right and copies the other mask characters literally.[^generic]

- Without `allowPartial`, the stripped value must contain a run of consecutive characters that match the placeholders in order (an unanchored regex test). Otherwise the call records error code `1` and returns `value` unchanged: `new N.mask("##").setGeneric("1a2")` returns `"1a2"`, because the letter survives stripping and breaks the run of digits.
- Extra characters beyond the last placeholder are dropped.
- `deleting === true` drops the last character when the stripped value has the same length as the previous one (used while the user deletes).

## `setNumeric(value[, mode[, deleting]])`

Keeps digits, `.` and `-` from `value` (one decimal point) and formats the number with a numeric mask.[^numeric]

- `mode` is `"round"` (default), `"ceil"` or `"floor"` and applies when the value has more decimals than the mask.
- An empty or non-numeric value records error code `2`; an invalid mask records error code `1`. On either error the call returns `value` for string input and `true` for non-string input (`new N.mask("#,###").setNumeric(NaN)` returns `true`), so pass `String(v)` as `N.formatter` does.
- An empty mask returns the cleaned number without formatting.
- Rounding works on the absolute value; the sign is added afterwards.

# Rule catalog

## `setGeneric` mask characters

| Char | Accepts |
|---|---|
| `#` | a digit `0`-`9` (and, see Known issues, the letter `s`; a space is not accepted) |
| `@` | a letter `a-z`, `A-Z`, a Hangul syllable or jamo, or a space |
| `~` | any character accepted by `#` or `@` |
| any other | copied into the output as is |

## `setNumeric` mask syntax

| Part | Meaning |
|---|---|
| `#` | optional digit |
| `0` | required digit: the first `0` before the decimal point sets the minimum number of integer digits; the last `0` after it sets the minimum number of decimals |
| `,` | one comma between the first group and the rest (`#,###`) turns on thousands separators for the whole number |
| `.` | decimal point; the digits after it set the maximum number of decimals |
| leading `$` | adds `$` in front |
| `+` | shows `+` for positive numbers |
| `( ... )` | wraps negative numbers in parentheses instead of prefixing `-` |
| `-` | only matters together with `( ... )`: shows `-` inside the parentheses as well; without parentheses negative numbers always get `-` |

Masks with more than one comma (`#,###,###`) are rejected as invalid; `#,###` already separates every group of three.[^numeric]

```js
new N.mask("###-####-####").setGeneric("01012345678");  // "010-1234-5678"
new N.mask("#,###.##").setNumeric("1234567.891");       // "1,234,567.89"
new N.mask("#,##0.00").setNumeric("5");                 // "5.00"
new N.mask("000").setNumeric("7");                      // "007"
new N.mask("$#,###.00").setNumeric("1234.5");           // "$1,234.50"
new N.mask("(#,###)").setNumeric("-5");                 // "(5)"
```

# Pitfalls

- `setGeneric` calls `value.replace(...)` first, so a number or `null` throws a TypeError (`v.replace is not a function`). Pass `String(value)`.
- `setNumeric` returns `true`, not the input, when a non-string value fails (for example `NaN`, or a number formatted with an invalid mask). Check `mask.errorCodes.length` instead of comparing the result with the input, and pass `String(value)`.[^mask] [^numeric]

# Known issues

* **`#` also accepts the letter `s`** - Actual: the character classes are built from the string `"0-9\s"`, in which `\s` is just `s`, so `#` matches digits and `s` but not whitespace (`new N.mask("###").setGeneric("1s2")` returns `"1s2"`). Likely intent: whitespace. Workaround: validate digits separately, for example with the `integer` rule of [N.validator](../data/validator.md).[^generic]
* **The `!` escape drops the escaped character** - Actual: `!` is meant to make the next mask character literal, but the code reads `m.charAt(i++)`, so it outputs `!` itself and skips the next character (`"!#-##"` formats `"123"` as `"!-12"`). Likely intent: `m.charAt(++i)`. Workaround: do not use `!`; put literal characters that are not `#`, `@` or `~` directly in the mask.[^generic]
* **`mode` is ignored when the mask has no decimals** - Actual: the integer part is taken before rounding, so `"#,###"` turns `"1.9"` into `"1"` for every mode. Likely intent: round, ceil or floor the whole value. Workaround: round first, `new N.mask("#,###").setNumeric(String(Math.round(v)))`.[^numeric]
* **Rounding does not carry into the integer part** - Actual: `"#.00"` formats `"1.999"` as `"1.00"`. Likely intent: `"2.00"`. Workaround: round with `toFixed` before formatting, `setNumeric(Number(v).toFixed(2))`.[^numeric]
* **`ceil` looks only at the kept digits and the next one** - Actual: with `"#.00"`, `"1.2300"` becomes `"1.24"` and `"1.0001"` becomes `"1.00"`. Likely intent: true ceiling. Workaround: compute the ceiling yourself, `Math.ceil(v * 100) / 100`, and format with the default mode.[^numeric]

# Examples

Format a phone number and an amount outside a component:

```js
const phone = new N.mask("###-####-####").setGeneric(row.phone);
const amount = new N.mask("#,###").setNumeric(String(row.amount));
```

Check for errors after formatting:

```js
const mask = new N.mask("#,###");
const text = mask.setNumeric(input);
if (mask.errorCodes.length > 0) {
    N.warn(mask.error.join("\n"));
}
```

# Related

- [N.formatter](../data/formatter.md) - the `generic` and `numeric` rules that use `N.mask`.
- [N.validator](../data/validator.md) - input checks to pair with masks.
- [N.date](date.md) - date formatting, which does not use masks.
- [N.string](string.md) - padding and trimming helpers.

[^mask]: NC.mask implementation
[^generic]: NC.mask.prototype.setGeneric
[^numeric]: NC.mask.prototype.setNumeric
[^formatter]: ND.formatter (generic and numeric rules)
