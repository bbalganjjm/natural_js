---
type: API Reference
title: N.formatter
description: Formats a JSON object array, or the elements bound to it, with rule lists such as commas, date and mask; every rule is also a static function.
tags: [data, formatter, format-rules]
symbols: [N.formatter, N().formatter, ND.formatter, ND.prototype.formatter, ND.formatter.prototype.format, ND.formatter.prototype.unformat, data-format, format.formatter, unformat.formatter]
sources:
  - id: formatter
    resource: ../../src/natural.data.js
    title: ND.formatter implementation (constructor, format, unformat and rule functions)
    symbol: ND.formatter
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: e20695aa680a
  - id: plugin
    resource: ../../src/natural.data.js
    title: ND.prototype.formatter jQuery plugin wrapper
    symbol: ND.prototype.formatter
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 36b029374abf
  - id: to-rules
    resource: ../../src/natural.core.js
    title: NC.element.toRules (reads data-format attributes)
    symbol: NC.element.toRules
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: aa46cc448324
  - id: mask
    resource: ../../src/natural.core.js
    title: NC.mask.prototype.setNumeric (used by the numeric rule)
    symbol: NC.mask.prototype.setNumeric
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: ec47ca778795
  - id: mask-generic
    resource: ../../src/natural.core.js
    title: NC.mask.prototype.setGeneric (used by the generic rule)
    symbol: NC.mask.prototype.setGeneric
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: e822e4867f95
  - id: form-validate
    resource: ../../src/natural.ui.js
    title: NU.form.prototype.validate (triggers unformat, validate and format events)
    symbol: NU.form.prototype.validate
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: de2945525bd7
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-DATA.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.formatter` applies format rules to a data set (an array of row objects) and returns formatted copies of the values, or writes the formatted strings into the elements that display those rows. Data components such as [N.form](../ui/form.md), [N.grid](../ui/grid.md) and [N.list](../ui/list.md) create formatters for every element that carries a `data-format` attribute, so most code only declares rules in markup. Every rule is also a static function (`N.formatter.commas(str)`) for formatting a single string.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.formatter` | `new N.formatter(data, rules)` | `N.formatter` instance |
| `N().formatter` | `N(data).formatter(rules)` | `N.formatter` instance |
| `format` | `formatter.format([row])` | `object[]` of formatted values |
| `unformat` | `formatter.unformat(row, key)` | the raw value `options.data[row][key]` |
| rule functions | `N.formatter.<rule>(str[, args[, ele]])` | formatted string |

# Constructor

## `new N.formatter(data, rules)`

- `data` (array or N/jQuery collection of row objects; required): the rows to format. In rules-object mode a plain object is also accepted: it is wrapped with `N(obj)` and becomes one row. Element mode reads `obj.length` and `obj[0]` from the raw argument, so a plain object finds no targets and breaks `format()`; pass an array or `N(obj)` there (see Known issues).[^formatter]
- `rules` (required) selects the mode:
  - **Rules object**: `{ columnName: [["ruleName", arg0, arg1, ...], ...] }`. The rules of one column run left to right, and each rule receives the previous rule's output.
  - **Element mode**: an element, a jQuery/N object or a selector string (any string is treated as a selector). The context is `N(rules)`. If the first data row has a key equal to the context element's `id`, the context itself is the only target; otherwise every descendant whose `id` equals a key of the first row becomes a target. Rules are read from each target's `data-format` attribute with `NC.element.toRules`.[^to-rules] Element mode needs at least one data row: with none, `options.rules` keeps the element or selector and `format()` fails (see Known issues).
- `N.formatter` is a class: calling it without `new` throws a `TypeError`.

## `N(data).formatter(rules)`

Plugin form. Runs `new ND.formatter(this, rules)` with the N collection as `data` and returns the formatter instance, not the collection.[^plugin]

# Options

The constructor takes no options argument. The instance keeps its state in `formatter.options`:[^formatter]

| Name | Type | Initial value | Description |
|---|---|---|---|
| `data` | N collection \| array | the `data` argument (plain object wrapped with `N()`) | Rows being formatted. `format(row)` and element mode replace it with a one-row array. |
| `rules` | object | the `rules` argument, or the rules read from `data-format` in element mode | Column name to rule list. |
| `isElement` | boolean | `false` | `true` in element mode. |
| `createEvent` | boolean | `true` | In element mode, `format()` binds the `format.formatter` and `unformat.formatter` handlers on text inputs. Set it to `false` before calling `format()` to skip that. |
| `context` | N collection | `null` | `N(rules)` in element mode. |
| `targetEle` | N collection | `N()` | The target elements in element mode. |

# Methods

## `format([row])`

- `row` (number): index into `options.data`. An index outside `0 .. length - 1` throws `[ND.formatter.prototype.format]Row index out of range`.
- Without `row`, a rules-object formatter formats every row and an element-mode formatter formats row 0.
- With `row`, `options.data` is replaced by `[options.data[row]]` (see Known issues).
- Each value is converted with `NC.string.trimToEmpty` first, so numbers become strings and `null`/`undefined` become `""`.
- Returns one object per processed row, `[{ columnName: "formatted value" }, ...]`, with a key for every column in `options.rules`. In rules-object mode those are the keys of the rules object (a key missing from the row runs its rules on `""`). In element mode they are every target element, including targets without `data-format`, whose value is the trimmed raw value. The row objects themselves are never modified.
- An unknown rule name throws `ND.formatter.prototype.format("name" is invalid format rule)`; any other error inside a rule is re-thrown wrapped as `ND.formatter.prototype.format`.[^formatter]

In element mode `format()` also writes to the targets:

- `input[type=text]`, `input[type=tel]` and `textarea` get the formatted value. When `createEvent` is `true`, `format.formatter` and `unformat.formatter` handlers are bound (previous ones are removed first). `format` re-runs `format()` and writes the formatted value of the row object; `unformat` writes `unformat(0, id)`, the raw value.
- Other elements that are not form inputs (`span`, `div`, `td`, ...) get the formatted string as text.
- Other inputs (select, checkbox, radio, hidden, password) are left untouched.
- The rule list is re-read from `ele.data("format")` on every run, so `N(el).data("format", rules)` changes the rules used by the next `format`.

N.form triggers `unformat` on focusin and `format` on focusout of its bound text inputs, and `N.form.prototype.validate()` triggers `unformat`, `validate` and `format` in that order on its inputs.[^form-validate]

## `unformat(row, key)`

Returns `options.data[row][key]`, the raw value stored in the row object. It changes neither the data nor the element.[^formatter]

# Rule catalog

Rule names are case-insensitive: `format()` trims and lower-cases the name before looking up `ND.formatter[name]`, so the functions themselves are lowercase (`trimtoempty`, not `trimToEmpty`). Each rule is a static function `N.formatter.<rule>(str, args, ele)`:

- `str`: the string to format (in `format()`, the trimmed value or the previous rule's output).
- `args`: an array of the rule arguments after the name. Direct calls must also pass an array: `N.formatter.limit("abcdefghijklmn", [12, "..."])` returns `"abcdefghijkl..."`.
- `ele`: the target element in element mode, otherwise `undefined`.
- `this` is `N.formatter` (`ND.formatter`), which `kcn` and `mask` rely on (`this.rrn`, `this.phone`).

| Rule | Arguments | Result |
|---|---|---|
| `commas` | — | Removes existing commas, then inserts a comma every three digits of the leading integer part (sign allowed). Decimals are not touched. |
| `rrn` | `[maskCount[, maskChar]]` | Keeps digits and `*`. With exactly 13 left, returns `######-#######`; `maskCount` replaces the last N digits with `maskChar` (default `*`). Any other length returns the stripped string. |
| `ssn` | — | Only when the input is exactly 9 characters: keeps digits and `*` and returns `###-##-####`. Otherwise unchanged. |
| `kbrn` | — | Fewer than 5 characters: unchanged. Otherwise keeps digits and `*`, cuts to 10 and returns `###-##-#####`. |
| `kcn` | — | Same as `rrn` without arguments (`######-#######`). |
| `upper` | — | Upper case. |
| `lower` | — | Lower case. |
| `capitalize` | — | Upper-cases the first character only. |
| `zipcode` | — | Keeps digits and `*` and returns the first 3, `-`, then the next 3 (`123456` gives `123-456`, `12345` gives `123-45`). |
| `phone` | — | Keeps digits and `*` and splits into prefix (`02`, `01x` or any 3 digits), middle and last 4 digits: `02-1234-5678`, `010-1234-5678`, `031-123-4567`. |
| `realnum` | — | `String(parseFloat(str))`, with `NaN` turned into `""`: `0100.10` gives `100.1`. |
| `trimtoempty` | — | `NC.string.trimToEmpty`. |
| `trimtozero` | — | `NC.string.trimToZero` (blank gives `"0"`). |
| `trimtoval` | `[value]` | Blank gives `value`. Throws when `value` is missing. |
| `date` | `[format[, picker[, pickerOpts]]]` | See below. |
| `time` | `[digits]` | See below. |
| `limit` | `[cutLength, suffix]` | Counts characters with a char code above 128 as 2. When the count exceeds `cutLength`, returns the trimmed prefix plus `suffix`. Values already ending with `suffix` are unchanged. In element mode the element's `title` is set to the full string. `suffix` is effectively required (see Known issues). |
| `replace` | `[target, replacement]` | Replaces every literal occurrence of `target` (no regex). Throws when fewer than 2 arguments are given. |
| `lpad` | `[length, fill]` | `NC.string.lpad(str, length, fill)`. Both arguments are required. |
| `rpad` | `[length, fill]` | `NC.string.rpad(str, length, fill)`. Both arguments are required. |
| `mask` | `[type[, maskChar]]` | See below. |
| `generic` | `[pattern]` | See below. |
| `numeric` | `[pattern[, rounding]]` | See below. |

Rules marked "keeps digits and `*`" return an empty input unchanged. `rrn`, `ssn`, `kbrn`, `kcn`, `zipcode` and `phone` are Korean and US display formats and do not validate anything; use [N.validator](validator.md) for checks.[^formatter]

## `["date", format[, picker[, pickerOpts]]]`

- Non-digits are removed first. Empty or all-zero input returns `""`.
- A number `format` picks a pattern from `N.context.attr("data").formatter.date`: `4` gives `Y`, `6` gives `Ym()`, `8` gives `Ymd()`, `10` gives `YmdH()`, `12` gives `YmdHi()`, `14` gives `YmdHis()`, and any other number gives `Ymd()`. With the shipped configuration these are `Y`, `Y-m`, `Y-m-d`, `Y-m-d H`, `Y-m-d H:i` and `Y-m-d H:i:s`. See [Configuration](../setup/configuration.md).
- A string `format` is an output pattern for `Date.prototype.formatDate` (PHP `date()` letters such as `Y`, `y`, `m`, `d`, `H`, `i`, `s`): `["date", "m/d/Y"]` turns `19991231` into `12/31/1999`.
- The digits are parsed by `NC.date.strToDate` according to their count (3-4 = year, 6 = year-month, 8 = date, 10, 12 or 14 and more = date and time) in the configured input order. Other digit counts come back as the digit string. See [N.date](../core/date.md).
- `picker` `"date"` or `"month"`, in element mode on an `input` that is not yet a datepicker, creates an [N.datepicker](../ui/datepicker.md) with `{ monthonly: picker === "month" }` extended by `pickerOpts` (an object, not a JSON string). The rule wraps the datepicker's `onBeforeShow` (triggers `unformat`), `onSelect` (writes `Ymd` or `Ym` digits into the enclosing N.form with `val(id, value)`), `onBeforeHide` (keeps digits only, then triggers the input's `focusout.dataSync.form` and `focusout.form.format` handlers, so the form's data-sync and format handlers run but its validate handler does not), and `onChangeYear` / `onChangeMonth` when `yearChangeInput` / `monthChangeInput` are on. The original handlers still run.
- Without `format` the rule returns `undefined` (see Known issues).[^formatter]

## `["time"[, digits]]`

Removes non-digits and uses the separator `N.context.attr("data").formatter.date.timeSepa` (`:` by default). `digits` `2` gives `HH`, `4` gives `HH:mm`, `6` gives `HH:mm:ss`; anything else (or nothing) gives `HH:mm`. Before cutting, the digit string is right-padded with `0` to 6 characters only when its numeric value is greater than 6 (see Known issues).[^formatter]

## `["mask", type[, maskChar]]`

`maskChar` defaults to `*` and is used only when exactly two arguments are given and the second is not blank. Throws when `type` is missing.

| `type` | Result |
|---|---|
| `phone` | Formats with the `phone` rule, then masks the digits of the middle part: `010-****-5678`. |
| `email` | For a value that passes `N.validator.email`, replaces the last 1-3 characters of the local part with three mask characters: `abcdef@x.com` gives `abc***@x.com`. Invalid addresses are returned trimmed and unmasked. |
| `address` | Splits on spaces. Province names (`경기`, `강원`, `충북`, `충남`, `전북`, `전남`, `경북`, `경남`, `제주`) and words ending in `도`, `시`, `군` or `구` are kept. Words ending in `읍`, `면`, `동`, `리`, `로`, `길` or `가` that start with a non-digit keep only their last character. Every other word is fully masked. |
| `name` | Values made of Latin letters, digits, spaces, `.`, `-` or `?` get characters 4 to 10 masked (spaces kept): `Michael` gives `Mic****`. Other values (Korean names) mask the one character after the surname, with 2-character surnames for `남궁`, `제갈`, `선우`, `독고`, `황보`, `강전`, `동방`, `망절`, `사공`, `서문`, `소봉`, `장곡`: `홍길동` gives `홍*동`. |
| `rrn` | Replaces the last up to 7 characters with mask characters, then applies the `rrn` rule: `900101-*******`. |
| other | Returned unchanged. |

## `["generic", pattern]`

`new NC.mask(pattern).setGeneric(String(str))`.[^mask-generic] In `pattern`, `#` accepts a digit and also a lowercase `s` (see Known issues), `@` a Latin or Korean letter or a space, and `~` a letter, digit or space; any other character is copied literally. Characters that are not letters, digits or spaces are removed from the value first. A value that does not fit the pattern is returned unchanged. `["generic", "###-####-####"]` turns `01012345678` into `010-1234-5678`. See [N.mask](../core/mask.md).[^formatter]

## `["numeric", pattern[, rounding]]`

`new NC.mask(pattern).setNumeric(String(str), rounding)`.[^mask]

- `pattern` uses `#` (optional digit) and `0` (required digit), an optional thousands group (`#,###`), an optional decimal part and an optional leading `$`, `+`/`-` or parentheses. An invalid pattern or a non-numeric value returns the input unchanged.
- A `,` group in the pattern adds thousands separators. Trailing `0`s after the decimal point set the minimum number of decimals (zero-padded): `["numeric", "#,##0.00"]` turns `1234.5` into `1,234.50`.
- Extra decimals are rounded half-up by default; `rounding` `"ceil"` or `"floor"` changes that. A pattern without decimals drops the fraction whatever `rounding` says (see Known issues).

Custom rules: add functions to `N.context.attr("data").formatter.userRules` in `natural.config.js`. They become rules only because that file runs `$.extend(N.formatter, N.context.attr("data").formatter.userRules)`; no framework code reads `userRules`. Name them in lowercase, since rule names are lower-cased before lookup. A custom rule receives `(str, args, ele)` and returns the formatted string. See [Configuration](../setup/configuration.md).

# Pitfalls

Both constructors are classes, so the legacy calls without `new` throw a `TypeError`.

```js
// Wrong (legacy): N.formatter(data, N(".formatter-context", view)).format();
new N.formatter(data, N(".formatter-context", view)).format();
N(data).formatter(N(".formatter-context", view)).format(); // plugin form, same instance type
```

Rule functions are lowercase. Mixed case works inside rule arrays (the name is lower-cased), but a direct call with the legacy spelling finds nothing.

```js
// Wrong (legacy): N.formatter.trimToEmpty("  a  ");
N.formatter.trimtoempty("  a  "); // "a"
N(el).data("format", [["trimToEmpty"], ["upper"]]); // fine: rule arrays are case-insensitive
```

Datepicker options of the `date` rule are an object merged with `jQuery.extend`, not a JSON string.

```js
// Wrong (legacy): ["date", 8, "date", "{\"yearChangeInput\": true}"]
N(el).data("format", [["date", 8, "date", { yearChangeInput: true }]]);
```

`unformat()` only returns the raw value. It does not restore the element or the data; trigger the `unformat` event to put the raw value back into a text input.

```js
// Wrong (legacy): formatter.unformat(0, "amount"); // expecting the input to change
N("#amount", view).trigger("unformat"); // writes options.data[0].amount into the input
```

- `format(row)` changes the instance: create a new formatter for each call that passes a row (Known issues).
- Change rules with `N(el).data("format", rules)`, not `.attr("data-format", ...)`. jQuery caches `data-format` on first read, and the formatter re-reads the cached value.
- N.form and N.grid create a formatter only for elements whose `.data("format")` is defined when the data is bound: either a `data-format` attribute or a `N(el).data("format", rules)` call made before `bind`. To change the format of a text input after binding, give it a rule (markup or `.data`) before binding, then replace the rules with `.data("format", ...)` and `.trigger("format")`.
- In element mode, pass a non-empty array or `N(obj)` as `data`, never a bare object: `new N.formatter(N(row), N("#detail", view))`. A bare object is accepted only in rules-object mode.
- In element mode, targets without `data-format` still get the trimmed raw value written into them, because every element whose `id` matches a data key becomes a target.
- Text inputs are recognized by the attribute selector `[type='text'], [type='tel']`. An `<input>` without an explicit `type` attribute matches neither and is not written; always declare `type="text"`.

# Known issues

* **`format(row)` shrinks the data set** - Actual: `format(row)` assigns `options.data = [options.data[row]]`, so later `format()` calls process only that row and `unformat(row, key)` with `row > 0` throws a `TypeError`. Likely intent: format one row without changing the instance. Workaround: create a new formatter for every call that passes a row.[^formatter]
* **`["date"]` without a format returns `undefined`** - Actual: when `args[0]` is missing (and `args` is an array, as it always is inside `format()`), the rule falls through without a `return`. The value becomes `undefined`, and a text-input target is emptied. Likely intent: return the digits or the default `Ymd()` format. Workaround: always pass a format, for example `["date", 8]`.[^formatter]
* **`limit` throws without a suffix** - Actual: the rule reads `args[1].length` before checking `args[1]`, so `["limit", 10]` throws a `TypeError`, which `format()` re-throws. Likely intent: cut without a suffix. Workaround: pass an empty suffix, `["limit", 10, ""]`.[^formatter]
* **`replace` third argument throws** - Actual: `["replace", a, b, "true"]` runs `this.vo[ele.attr("name")] = ...`, but `N.formatter` has no `vo` property, so it throws a `TypeError`. Likely intent: also write the replaced value back to a value object. Workaround: pass only two arguments.[^formatter]
* **`time` pads by numeric value, not length** - Actual: `NC.string.trimToEmpty(str) > 6` compares the digit string as a number, so values such as `0000` or `0005` are not right-padded and `["time", 6]` returns `00:00:`. Likely intent: pad when the length is below 6. Workaround: supply six digits for `["time", 6]`.[^formatter]
* **Element mode breaks with a plain object or no rows** - Actual: the constructor tests `obj.length > 0` and `obj[0]` on the raw `data` argument, not on the wrapped `options.data`. For a plain object (no `length`) or an empty array no targets are collected and `options.rules` keeps the element or selector passed as `rules`, which `format()` then iterates with `for (const k in opts.rules)`. A selector string such as `"#detail"` reaches `jQuery("#")` and throws a jQuery syntax error; an element or jQuery object is walked property by property. Likely intent: read the wrapped `options.data`, so a plain object becomes one row as in rules-object mode. Workaround: pass a non-empty array or `N(obj)` in element mode.[^formatter]
* **`generic` `#` also accepts `s`** - Actual: `NC.mask.prototype.setGeneric` defines the `#` class as the plain string literal `"0-9\s"`, where `\s` is not an escape and becomes the letter `s`. The class is `[0-9s]`, so `["generic", "###"]` keeps `s12` as `s12`. The same collapse in the `@` and `~` classes has no visible effect, because they already contain `s`. Likely intent: the regex whitespace class `\s`. Workaround: remove letters before formatting, or check the value with `["integer"]` in [N.validator](validator.md).[^mask-generic]
* **`numeric` rounding errors** - Actual: in `NC.mask.prototype.setNumeric` the carry out of the decimals is lost (`1.999` with `0.00` gives `1.00`); `"ceil"` looks only at the first extra digit and at whether the kept digits are non-zero (`1.100` gives `1.11`, `1.0001` gives `1.00`); and a pattern without decimals drops the fraction whatever `rounding` says. Likely intent: correct half-up, ceiling and floor rounding at the pattern's precision. Workaround: round the number yourself before formatting when these cases matter.[^mask]

# Examples

Declare rules in markup and let N.form apply them. Inputs show the formatted value and switch to the raw value on focus:

```html
<div id="detail">
    <input id="startDate" type="text" data-format='[["date", 8]]'>
    <input id="amount" type="text" data-format='[["trimtoempty"], ["numeric", "#,##0"]]'>
    <span id="phoneNo" data-format='[["mask", "phone"]]'></span>
</div>
```

```js
N([{ startDate: "20240315", amount: "1234567", phoneNo: "01012345678" }]).form(N("#detail", view)).bind(0);
// startDate shows 2024-03-15, amount 1,234,567, phoneNo 010-****-5678; the row data keeps the raw values
```

Format a data set without elements:

```js
const rows = [{ price: "1234567.891", code: "abcdefghijklmn" }];
const result = new N.formatter(rows, {
    price: [["trimtoempty"], ["numeric", "#,###.00"]],
    code: [["limit", 10, "..."], ["upper"]]
}).format();
// result: [{ price: "1,234,567.89", code: "ABCDEFGHIJ..." }]; rows is unchanged
```

Format one string and change rules at run time:

```js
N.formatter.commas("-1234567.1234");       // "-1,234,567.1234"
N.formatter.date("20240315", ["m/d/Y"]);   // "03/15/2024"
N.formatter.mask("홍길동", ["name"]);       // "홍*동"

N("#amount", view).data("format", [["commas"]]).trigger("format");
N("#amount", view).trigger("unformat");
```

# Related

- [N.validator](validator.md) - the matching validation library; N.form runs unformat, validate and format in that order.
- [N.form](../ui/form.md) - binds rows to inputs and creates formatters for `data-format` elements (options `fRules` and `vRules`).
- [N.mask](../core/mask.md) - `NC.mask`, behind the `generic` and `numeric` rules.
- [N.date](../core/date.md) - date parsing and `formatDate` patterns used by the `date` rule.
- [Configuration](../setup/configuration.md) - `N.context.attr("data").formatter.date` and `formatter.userRules`.
- [N.datepicker](../ui/datepicker.md) - created by the `date` rule with the `date` or `month` picker argument.

[^formatter]: ND.formatter implementation (constructor, format, unformat and rule functions)
[^plugin]: ND.prototype.formatter jQuery plugin wrapper
[^to-rules]: NC.element.toRules (reads data-format attributes)
[^mask]: NC.mask.prototype.setNumeric (used by the numeric rule)
[^mask-generic]: NC.mask.prototype.setGeneric (used by the generic rule)
[^form-validate]: NU.form.prototype.validate (triggers unformat, validate and format events)
