---
type: API Reference
title: N.validator
description: Validates a JSON object array, or the input elements bound to it, against rule lists such as required, maxlength and email, and shows failures as input tooltips.
tags: [data, validator, validation-rules]
symbols: [N.validator, N().validator, ND.validator, ND.prototype.validator, data-validate, validate.validator, validate_false__]
sources:
  - id: validator
    resource: ../../src/natural.data.js
    title: ND.validator implementation (constructor, validate and rule functions)
    symbol: ND.validator
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 3783dcab12fc
  - id: plugin
    resource: ../../src/natural.data.js
    title: ND.prototype.validator jQuery plugin wrapper
    symbol: ND.prototype.validator
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 2379e67cdbb2
  - id: to-data
    resource: ../../src/natural.core.js
    title: NC.element.toData (reads current element values)
    symbol: NC.element.toData
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 82af7c87406a
  - id: msg-vars
    resource: ../../src/natural.core.js
    title: NC.message.replaceMsgVars (fills {0}, {1} in messages)
    symbol: NC.message.replaceMsgVars
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: df31b7535270
  - id: byte-length
    resource: ../../src/natural.core.js
    title: NC.string.byteLength (used by the byte rules)
    symbol: NC.string.byteLength
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: e17b2fe46fc7
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

`N.validator` checks a data set (an array of row objects) against rule lists and returns a result for every rule of every column. In element mode it validates inputs that carry a `data-validate` attribute, marks failures with the class `validate_false__` and shows the messages in an [N.alert](../ui/alert.md) tooltip next to the input. [N.form](../ui/form.md), [N.grid](../ui/grid.md) and [N.list](../ui/list.md) create validators for their `data-validate` inputs automatically; every rule is also a static function (`N.validator.email(str)`).

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.validator` | `new N.validator(data, rules)` | `N.validator` instance |
| `N().validator` | `N(data).validator(rules)` | `N.validator` instance |
| `validate` | `validator.validate([row])` | `object[]` of rule results |
| rule functions | `N.validator.<rule>(str[, args])` | boolean |

# Constructor

## `new N.validator(data, rules)`

- `data` (array or N/jQuery collection of row objects): the rows to validate. When it is empty (`N()`, `[]`) in element mode, the current values of the target elements are read with `NC.element.toData` and validated as one row.[^to-data] A plain object is discarded (see Known issues); wrap it in an array or use `N(obj)`.
- `rules` selects the mode:[^validator]
  - **Rules object**: `{ columnName: [["ruleName", arg0, arg1, ...], ...] }`.
  - **Element mode**: an element, a jQuery/N object or a selector string. The targets are the context itself when it is an input, otherwise its descendant `:input` elements, keeping only those with a `data-validate` attribute. Radio buttons and checkboxes are keyed by `name`, other inputs by `id`. Each target gets a `validate.validator` handler (previous ones are removed) that validates that element's current value: `N().validator(N(this)).validate()`.
- `N.validator` is a class: calling it without `new` throws a `TypeError`.

## `N(data).validator(rules)`

Plugin form. Runs `new ND.validator(this, rules)` with the N collection as `data` and returns the validator instance.[^plugin] `N().validator(element)` (empty collection) is the element-value form that N.form uses.

# Options

The constructor takes no options argument. The instance keeps its state in `validator.options`:[^validator]

| Name | Type | Initial value | Description |
|---|---|---|---|
| `data` | N collection \| array | the `data` argument, or `N(NC.element.toData(targetEle))` when it is empty | Rows being validated. |
| `rules` | object | the `rules` argument, or the rules read from `data-validate` in element mode | Column name to rule list. |
| `isElement` | boolean | `false` | `true` in element mode. |
| `createEvent` | boolean | `true` | Read only inside the constructor (binds the `validate.validator` handlers), so it cannot be turned off from outside. |
| `context` | N collection | `null` | `N(rules)` in element mode. |
| `targetEle` | N collection | `null` | The target inputs in element mode. |

# Methods

## `validate([row])`

- `row` (number): index of the row to validate. An index outside `0 .. length - 1` throws `[ND.validator.prototype.validate]Row index out of range`. Without `row`, a rules-object validator checks every row and an element-mode validator checks row 0. Unlike the formatter, `options.data` is not modified.
- Returns one object per row, each column mapping to one result per rule (shape below). `rule` is the rule array joined with commas, `result` is the rule's boolean, and `msg` is `null` for a pass or the message for a failure.[^validator]
- Values are trimmed with `NC.string.trimToEmpty` before a rule runs.
- A non-`required` rule is skipped (result `true`) when the value is blank after trimming and no rule of that column contains the text `required`. `null` and `undefined` are not skipped (see Known issues).
- An unknown rule name throws `ND.validator.prototype.validate("name" is invalid format rule)`; other errors in a rule are re-thrown wrapped as `ND.validator.prototype.validate`.
- In element mode, a failing column adds `validate_false__` to its input and opens an input-mode N.alert with every failure message of the column; a passing column removes the class and any alert on the input. Throws when Natural-UI is not loaded.
- The input is found with `filter("#" + column)`, except when any target is a radio or checkbox: then every column is looked up as the `.select_template__` input with that `name`. In a context that mixes text inputs with radios or checkboxes, failing text inputs therefore get no `validate_false__` and their alert is built on an empty collection; the returned results are still correct (see Known issues).
- `validate` is assigned as an instance property (a class field), not defined on `N.validator.prototype`.

```js
[
    {
        name: [{ rule: "required", result: false, msg: "..." }],
        age: [{ rule: "integer", result: true, msg: null }, { rule: "maxvalue,150", result: false, msg: "..." }]
    }
]
```

Messages come from `N.context.attr("data").validator.message[N.locale()][ruleKey]`, falling back to the locale's `global` message. `ruleKey` is the normalized rule name (lowercase, combined rules sorted and joined with `_`). `{0}`, `{1}`, ... are replaced by the rule arguments with `NC.message.replaceMsgVars`.[^msg-vars] The byte rules write the default `charByteLength` into their argument array before the message is built, so `{1}` (`{2}` for `rangebyte`) shows it. See [Configuration](../setup/configuration.md) for the message sets.

N.form triggers `validate.validator` on focusout of its bound text inputs, and `N.form.prototype.validate()` triggers `unformat`, `validate` and `format` on its inputs and returns `true` when no input has `validate_false__`.[^form-validate]

# Rule catalog

Rule names are case-insensitive: `validate()` trims and lower-cases the name, and a name containing `+` is split, sorted and joined with `_` (`integer+commas` and `commas+integer` both resolve to `commas_integer`). Each rule is a static function `N.validator.<rule>(str, args)` that returns a boolean; `args` is the array of arguments after the rule name and must be an array in direct calls too. The function names are lowercase except `equalTo`.[^validator]

| Rule | Arguments | Passes when |
|---|---|---|
| `required` | — | The trimmed value is not empty. |
| `alphabet` | — | Latin letters and whitespace only. |
| `integer` | — | Optional `+`/`-` followed by digits. |
| `korean` | — | Hangul syllables, Hangul jamo and whitespace only (the pattern also lets `\|` through). |
| `alphabet+integer` | — | Latin letters, digits and whitespace (the pattern also lets `-` and `?` through). |
| `integer+korean` | — | Hangul, digits and whitespace (also `-`, `?`, `\|`). |
| `alphabet+korean` | — | Hangul, Latin letters and whitespace (also `\|`). |
| `alphabet+integer+korean` | — | Hangul, Latin letters, digits and whitespace (also `-`, `?`, `\|`). |
| `integer+dash` | — | Digits and `-` only (function `dash_integer`). |
| `integer+commas` | — | Digits and `,` only (function `commas_integer`). |
| `number` | — | Optional sign, then digits, `,` and `.` in any arrangement (`1.2.3` passes). |
| `decimal` | `[places]` | An integer, or an optional `-`, digits, `.` and at most `places` decimals (default 10). `.5` and `1.` pass. |
| `phone` | `["true"]` | `^\d{2,3}-\d{3,4}-\d{4}$`. With the string `"true"`, any value starting with `NN(N)-NNN(N)-` and one word character passes. |
| `email` | — | Matches the built-in e-mail pattern. |
| `url` | — | An `http`, `https` or `ftp` URL. |
| `zipcode` | — | `^\d{3}-\d{3}$`. |
| `rrn` | — | Never passes (see Known issues). |
| `ssn` | — | Contains `###-##-####` anywhere (the pattern is not anchored). |
| `frn` | — | After removing characters other than digits and `*`: 13 digits, 7th digit 5, 6 or 8, digits 8-9 forming an even number, and a valid check digit. |
| `frn_rrn` | — | Not 13 digits: fails. 13 digits: throws (see Known issues). |
| `kbrn` | — | The first 10 digits carry a valid business-registration check digit (length is not checked). |
| `kcn` | — | Never passes (see Known issues). |
| `date` | — | After removing `N.context.attr("data").formatter.date.dateSepa`: 8 characters read as `YYYYMMDD`, where the month must convert to an integer 1-12 and the day to a number not above that month's length (leap years handled). Digits are not enforced: the year part is never checked (`abcd0115` passes) and day `00` passes. Other separators are not removed (see Known issues). |
| `time` | — | After removing non-digits: `HH`, `HHmm` or `HHmmss` with hours 00-23 and minutes and seconds 00-59. |
| `accept` | `[value]` | The whole value matches `^(value)$`; `value` is a regex, so `"Y\|N"` accepts either. |
| `notAccept` | `[value]` | Opposite of `accept` (function `notaccept`). |
| `match` | `[pattern]` | `new RegExp(pattern)` finds a match anywhere in the value. |
| `notMatch` | `[pattern]` | Opposite of `match` (function `notmatch`). |
| `acceptFileExt` | `[extensions]` | The value ends with `.(extensions)`, case-insensitive: `["acceptFileExt", "jpg\|png"]`. The `.` is unescaped, so it matches any character (function `acceptfileext`). |
| `notAcceptFileExt` | `[extensions]` | Opposite of `acceptFileExt` (function `notacceptfileext`). |
| `equalTo` | `[selector]` | The value equals `jQuery(selector).val()`, or that value is blank. Only callable directly (see Known issues). |
| `maxlength` | `[length]` | Character count of the trimmed value is at most `length`. |
| `minlength` | `[length]` | Character count is at least `length`. |
| `rangelength` | `[min, max]` | Character count is between `min` and `max`. |
| `maxbyte` | `[bytes[, charByteLength]]` | `NC.string.byteLength` of the trimmed value is at most `bytes`. |
| `minbyte` | `[bytes[, charByteLength]]` | Byte length is at least `bytes`. |
| `rangebyte` | `[min, max[, charByteLength]]` | Byte length is between `min` and `max`. |
| `maxvalue` | `[number]` | `Number(value)` is at most `number` (blank counts as 0, non-numeric fails). |
| `minvalue` | `[number]` | `Number(value)` is at least `number`. |
| `rangevalue` | `[min, max]` | `Number(value)` is between `min` and `max`. |
| `regexp` | `[pattern, flags, message]` | `new RegExp(pattern, flags)` finds a match. `flags` is required (use `""`), and `message` is shown on failure. |

Byte length counts 1 for U+0000-U+007F, 2 for U+0080-U+07FF and `charByteLength` for everything above; the default is `N.context.attr("core").charByteLength` (3 in the shipped configuration).[^byte-length] Rules that need an argument throw an `Error` such as `[ND.validator.maxlength]You must input args[0](length)` when it is missing.

Custom rules: add functions to `N.context.attr("data").validator.userRules` in `natural.config.js` and a message with the same key to each locale of `validator.message`. They become rules only because that file runs `$.extend(N.validator, N.context.attr("data").validator.userRules)`; no framework code reads `userRules`. Name them in lowercase, since rule names are lower-cased before lookup. A custom rule receives `(str, args)` and returns `true` to pass.

# Pitfalls

Both constructors are classes, so the legacy calls without `new` throw a `TypeError`.

```js
// Wrong (legacy): N.validator(data, N(".validator-context", view)).validate();
new N.validator(data, N(".validator-context", view)).validate();
N(data).validator(N(".validator-context", view)).validate();
```

`validate()` returns an array with one object per row, and each column holds an array of rule results.

```js
// Wrong (legacy): if (validator.validate().name.result) { ... }
const results = validator.validate();
const nameOk = results[0].name.every(function (r) { return r.result; });
```

Partial phone matching needs the string `"true"`; a JSON boolean is ignored.

```js
// Wrong (legacy): data-validate='[["phone", true]]'
N(el).data("validate", [["phone", "true"]]);
```

`regexp` requires the flags argument, and the message is the third argument.

```js
// Wrong (legacy): data-validate='[["regexp", "^[A-Z]{3}$"]]'
N(el).data("validate", [["regexp", "^[A-Z]{3}$", "", "Enter three capital letters"]]);
```

Direct calls use the lowercase function names (`equalTo` is the only camel-case function).

```js
// Wrong (legacy): N.validator.acceptFileExt("a.png", ["png"]);
N.validator.acceptfileext("a.png", ["png"]); // true
N.validator.rangevalue("5", [1, 9]);         // true
```

- `N.locale()` must name a locale that exists in `N.context.attr("data").validator.message`; otherwise the first failing rule throws a `TypeError` while reading the message set.
- Change rules with `N(el).data("validate", rules)` and apply them with `.trigger("validate")`. jQuery caches `data-validate` on first read, so `.attr()` changes are not seen.

# Known issues

* **`rrn` never passes** - Actual: the check digit is a number and is compared with `===` to `b7`, a one-character string from `substring`, so the rule always returns `false`. Likely intent: compare numbers. Workaround: register a corrected custom rule under another name through `validator.userRules`.[^validator]
* **`kcn` never passes** - Actual: `iCheck_digit === arr_regno[12]` compares a number with a string from `split("")`, so the rule always returns `false`. Likely intent: compare numbers. Workaround: a custom rule.[^validator]
* **`frn_rrn` throws on 13-digit input** - Actual: it calls `this.frn()` / `this.rrn()` without the value, so `str.replace` runs on `undefined` and `validate()` re-throws the `TypeError`. Inputs of any other length return `false`. Likely intent: `this.frn(str)` / `this.rrn(str)`. Workaround: use `frn` alone, or a custom rule.[^validator]
* **`equalTo` cannot be used in rule lists** - Actual: `validate()` lower-cases rule names, but the function is declared as `equalTo`, so `ND.validator["equalto"]` is undefined and `validate()` throws `"equalTo" is invalid format rule`. Likely intent: a lowercase `equalto` function. Workaround: call `N.validator.equalTo(value, [selector])` directly.[^validator]
* **Camel-case message keys never match** - Actual: messages are looked up with the lowercase rule key, but the shipped message sets use `acceptFileExt`, `notAccept`, `notMatch`, `notAcceptFileExt` and `equalTo`, so these rules show the `global` message. The `ko_KR` set also names `frn_ssn` instead of `frn_rrn`. Likely intent: keys equal to the lowercase rule names. Workaround: add lowercase keys (`acceptfileext`, `notaccept`, `notmatch`, `notacceptfileext`, `frn_rrn`) to each locale in `natural.config.js`.[^validator]
* **`regexp` without a message shows `{2}`** - Actual: the shipped `regexp` message is `"{2}"`, and `NC.message.replaceMsgVars` only replaces indexes that exist in the argument array, so with two arguments the literal `{2}` is shown. Likely intent: fall back to the `global` message. Workaround: always pass the third argument.[^msg-vars]
* **`date` accepts day `00` and non-digit years** - Actual: `isDateFormat` checks only that the trimmed value has 8 characters, and `day === 0` compares the string `"00"` with a number and never matches. The year part is used only in the leap-year test (`"abcd" % 4` is `NaN`, so not a leap year), and month and day are compared through number coercion. `20240100` and `abcd0115` both pass. Likely intent: 8 digits with a day of at least 1. Workaround: add `["regexp", "^[0-9]{4}[^0-9]?[0-9]{2}[^0-9]?(0[1-9]|[12][0-9]|3[01])$", "", "Invalid date"]` next to `["date"]`, or register a corrected custom rule.[^validator]
* **Mixed radio/checkbox contexts do not mark text inputs** - Actual: `validate()` chooses the element lookup once with `opts.targetEle.is("input:radio, input:checkbox")`, which is true when any target is a radio or checkbox. Every column is then looked up with `filter("[name='" + k + "'].select_template__")`, which text inputs do not match, so their failures add no `validate_false__` and the N.alert is built on an empty collection. Likely intent: choose the lookup per column. Workaround: use separate validators for text inputs and for radio/checkbox groups, or validate each input with `.trigger("validate")`, as N.form does.[^validator]
* **`null` and `undefined` values are checked by non-required rules** - Actual: the skip test uses `String(obj[k])`, which is `"null"` or `"undefined"` rather than `""`, so the rule runs on the trimmed value `""` and rules such as `alphabet` or `email` fail. Likely intent: treat them as empty. Workaround: convert `null`/`undefined` to `""` before validating data rows.[^validator]
* **Rules-object mode throws on empty or plain-object data** - Actual: the constructor ends with `options.data = obj.length > 0 ? obj : N(NC.element.toData(targetEle))`; with a rules object `targetEle` is `null`, so `[]`, `N()` or a plain object (no `length`) makes `NC.element.toData(null)` throw a `TypeError`. The same call, `N().validator(rulesObject)`, is what N.form makes for its `vRules` option. Likely intent: validate the wrapped `options.data`. Workaround: pass a non-empty array or `N(obj)`.[^validator]
* **Partial `phone` mode ignores booleans** - Actual: the rule checks `args[0] === "true"`, while the TypeScript declaration types the argument as a boolean. Likely intent: accept `true`. Workaround: pass the string `"true"`. See [TypeScript](../setup/typescript.md).[^validator]

# Examples

Declare rules in markup; N.form validates on focusout and in `validate()`:

```html
<div id="detail">
    <input id="userId" type="text" data-validate='[["required"], ["alphabet+integer"], ["rangelength", 4, 12]]'>
    <input id="email" type="text" data-validate='[["email"]]'>
    <input id="nickname" type="text" data-validate='[["maxbyte", 20]]'>
</div>
```

```js
const form = N([{ userId: "", email: "", nickname: "" }]).form(N("#detail", view)).bind(0);

N("#btnSave", view).on("click", function () {
    if (form.validate()) { // false while any input has validate_false__
        // submit
    }
});
```

Validate data without elements:

```js
const results = new N.validator([{ name: "", age: "200" }], {
    name: [["required"]],
    age: [["integer"], ["maxvalue", 150]]
}).validate();
// results[0].name[0]: { rule: "required", result: false, msg: <required message> }
// results[0].age[1]:  { rule: "maxvalue,150", result: false, msg: <maxvalue message with {0} = 150> }
```

Change rules at run time and validate one input:

```js
N("#email", view).data("validate", [["required"], ["email"]]).trigger("validate");
```

# Related

- [N.formatter](formatter.md) - format rules; N.form unformats before validating and formats afterwards.
- [N.form](../ui/form.md) - validates `data-validate` inputs and exposes `validate()` (options `validate`, `vRules`).
- [N.alert](../ui/alert.md) - the input-mode tooltip used for failure messages.
- [N.message](../core/message.md) - message resources and `{0}` placeholders.
- [N.string](../core/string.md) - `trimToEmpty` and `byteLength` used by the rules.
- [Configuration](../setup/configuration.md) - `N.context.attr("data").validator.message`, `validator.userRules` and `core.charByteLength`.

[^validator]: ND.validator implementation (constructor, validate and rule functions)
[^plugin]: ND.prototype.validator jQuery plugin wrapper
[^to-data]: NC.element.toData (reads current element values)
[^msg-vars]: NC.message.replaceMsgVars (fills {0}, {1} in messages)
[^byte-length]: NC.string.byteLength (used by the byte rules)
[^form-validate]: NU.form.prototype.validate (triggers unformat, validate and format events)
