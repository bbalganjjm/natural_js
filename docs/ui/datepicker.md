---
type: UI Component
title: N.datepicker
description: Opens a calendar panel under a text input for picking a date (or a year and month with monthonly) and writes the digits into the input.
tags: [ui, component, date, input]
symbols: [N.datepicker, N().datepicker, NU.datepicker, NU.Datepicker, NU.Options.Datepicker]
sources:
  - id: ui
    resource: ../../src/natural.ui.js
    title: NU.datepicker implementation
    symbol: NU.datepicker
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 173f5ab718b0
  - id: ui-plugin
    resource: ../../src/natural.ui.js
    title: NU.prototype.datepicker jQuery plugin wrapper
    symbol: NU.prototype.datepicker
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: a819b0fe22f7
  - id: date-rule
    resource: ../../src/natural.data.js
    title: ND.formatter date rule (creates datepickers)
    symbol: ND.formatter.date
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 7ee0807e98e4
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Datepicker.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.datepicker` attaches a calendar panel to a text input: the panel opens on focus, and a click on a day (or on a month with `monthonly`) writes the date digits into the input. Inside [N.form](form.md), [N.list](list.md) and [N.grid](grid.md) you rarely create it by hand: the `date` format rule with `"date"` or `"month"` creates it for the bound input.

# Quick start

```html
<input id="birthDate" type="text">
<input id="payMonth" type="text">
```

```js
N("#birthDate", view).datepicker();
N("#payMonth", view).datepicker({ monthonly: true });

// Through data binding: the date rule creates the datepicker and formats the value
// <input id="regDate" type="text" data-format='[["date", 8, "date"]]'>
N([{ regDate: "20241212" }]).form("#detail").bind();
```

# Constructor

## `N(input).datepicker([opts])`

- Calls `new NU.datepicker(this, opts)` and returns the **N.datepicker instance**.[^ui-plugin]
- Creates **one** instance for the whole collection. Use it on a single input, or loop (see Pitfalls).

## `new N.datepicker(context[, opts])`

- `context` (jQuery object, required): the text input. A selector string throws a `TypeError` (the constructor calls `context.addClass`).[^ui]
- `opts` (object): options.
- Returns the instance. Adds the class `datepicker__` to the input and stores the instance as `"datepicker"`.

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `context` | jQuery | — | Text input to attach to. |
| `monthonly` | boolean | `false` | Month picker: select a year and month; `maxlength` becomes 6 (8 otherwise). |
| `focusin` | boolean | `true` | Open the panel on `focusin`. Bound only if the input is not `readonly` or `disabled` when the datepicker is created. |
| `yearsPanelPosition` | `"left"` \| `"top"` | `"left"` | `"left"`: a list of 5 years with previous and next paging. `"top"`: a year select box with previous and next buttons. |
| `monthsPanelPosition` | `"left"` \| `"top"` | `"left"` | `"left"`: 12 month items. `"top"`: a month select box with previous and next buttons. |
| `minYear` | number | `200` | With `yearsPanelPosition: "top"`: years before the current year offered in the select box. |
| `maxYear` | number | `200` | With `yearsPanelPosition: "top"`: years after the current year offered in the select box. |
| `yearChangeInput` | boolean | `false` | Write the changed year into the input immediately. |
| `monthChangeInput` | boolean | `false` | Write the changed month into the input immediately. |
| `touchMonthChange` | boolean | `false` | Swipe on the panel to change the month (swipe right: next, swipe left: previous). Works only with `monthsPanelPosition: "top"`. |
| `scrollMonthChange` | boolean | `false` | Mouse wheel on the panel changes the month (wheel up: next). Works only with `monthsPanelPosition: "top"`. |
| `minDate` | string | `null` | Earliest selectable date as digits `YYYYMMDD` (typed 4- and 6-digit values are compared with its first 4 or 6 digits). |
| `maxDate` | string | `null` | Latest selectable date as digits `YYYYMMDD`. |
| `holiday` | object | `{ repeat: null, once: null }` | Holidays to mark; see below. |
| `contents` | jQuery | `N('<div class="datepicker__"></div>')` | Internal: replaced by the panel element on every `show()`. |

Defaults are the `NU.datepicker` constructor values.[^ui] The combination `yearsPanelPosition: "top"`, `monthsPanelPosition: "top"`, `monthonly: true` is not supported: the constructor warns and resets both positions to `"left"`. Two more keys come from the global configuration: `message` (labels and validation messages) and `monthonlyOpts`.

`holiday` format:

```js
{
    repeat: { "0101": "New Year", "1225": ["Christmas", "Company day"] },  // MMDD, every year
    once:   { "20240917": "Chuseok" }                                      // YYYYMMDD, one date
}
```

Matching day cells get the class `datepicker_holiday__` and a `title` with the names joined by `", "`.[^ui]

# Declarative options

The datepicker has no `data-opts`. Declare it on a bound input with the `date` format rule instead: `["date", length, "date" | "month", datepickerOpts]`. The third element creates a datepicker (`"month"` sets `monthonly: true`) and the optional fourth element is merged into its options.[^date-rule]

```html
<input id="startDate" type="text" data-format='[["date", 8, "date", { "minDate": "20240101" }]]'>
<input id="baseMonth" type="text" data-format='[["date", 6, "month"]]'>
```

The rule creates the datepicker only for `input` elements that do not already have the `datepicker__` class, and it syncs the picked value into the enclosing [N.form](form.md). See [Formatter](../data/formatter.md).

# Methods

## `context([selector])`

Returns the input, or `context.find(selector)`.

## `show()`

Builds the panel (hiding any other visible datepicker first), pre-selects the input's date or today, runs `onBeforeShow` (returning `false` cancels), positions the panel and returns the instance. `onShow` fires when the show transition ends.[^ui]

## `hide()`

Runs `onBeforeHide` (returning `false` cancels), starts the hide transition and returns the instance. The panel element is removed when the transition ends, then `onHide` fires. Does nothing when the panel is not visible.

# Events

| Name | Signature | `this` | When |
|---|---|---|---|
| `onSelect` | `function(context, selDate, monthonly)` | the `N.datepicker` instance | A day (or a month with `monthonly`) is clicked. `selDate` is `{ obj: Date, format: "Ymd" }` (`"Ym"` with `monthonly`; letters from the `data.formatter.date` config). Return `undefined` or `true` to write the value; any other value (for example `false`) skips writing. The panel closes either way. |
| `onBeforeShow` | `function(context, contents)` | the `N.datepicker` instance | Before the panel is shown. Return `false` to cancel. |
| `onShow` | `function(context, contents)` | the `N.datepicker` instance | After the show transition. |
| `onBeforeHide` | `function(context, contents[, arg])` | the `N.datepicker` instance | Before hiding. `arg` is whatever was passed to `hide()` (usually `undefined`). Return `false` to cancel. |
| `onHide` | `function(context)` | the `N.datepicker` instance | After the panel was removed. |
| `onChangeYear` | `function(context, year, e)` | the `N.datepicker` instance | Year changed; `year` is a 4-digit string. |
| `onChangeMonth` | `function(context, month, year, e)` | the `N.datepicker` instance | Month changed; `month` (`"1"`-`"12"`) and `year` are strings. |

`context` is the input and `contents` the panel element. After each handler the same-named jQuery event is triggered on the input with the same arguments, so `N("#birthDate").on("onSelect", function (e, context, selDate, monthonly) { ... })` also works; the option handler runs first. Global handlers in `N.context.attr("ui").datepicker` are chained after local ones; see [Component model](component-model.md).[^ui]

# Global configuration

`N.context.attr("ui").datepicker` is shallow-merged over the defaults; when `opts.monthonly === true`, `N.context.attr("ui").datepicker.monthonlyOpts` is merged next, then `opts`. The shipped `natural.config.js` defines:

| Key | Content |
|---|---|
| `monthonlyOpts` | `{ yearsPanelPosition: "left", monthsPanelPosition: "left" }` |
| `message` | `ko_KR` / `en_US`: `year`, `month`, `days` (comma-separated weekday names starting with Sunday), `yearNaN`, `monthNaN`, `dayNaN`, `minDate`, `maxDate`, `minMaxDate`, `prev`, `next` |

A site-wide `holiday` can be added as `N.context.attr("ui").datepicker.holiday`. Because the merge is shallow, an instance keeps a reference to that object: set it before creating datepickers or change the same object in place. See [Configuration](../setup/configuration.md).

# Behavior

- The panel `div.datepicker_contents__` is created on every `show()` and removed on hide. It is inserted after the input, or after the input's closest `label` or `span` wrapper. Inside a `.form__` element whose `position` is not `relative`, `show()` sets it to `relative` and `hide()` restores it.
- Keyboard: only number-related keys are accepted (and at most 8 digits); Enter and Tab blur the input and close the panel; ESC closes it. A click anywhere else closes it. Non-digits are stripped on `keyup` and `focusout`.
- While typing, the value is checked once it has an even length greater than 2: a year below 100, a month outside 1-12 or a day beyond the month's last day shows an input tooltip ([N.alert](alert.md)) with the `yearNaN`, `monthNaN` or `dayNaN` message and removes the bad part. A value outside `minDate` / `maxDate` is replaced with that limit and a `minDate` / `maxDate` tooltip.
- Day cells before `minDate` or after `maxDate` get `datepicker_min_date__` / `datepicker_max_date__` and ignore clicks.
- The value written on selection is digits only, ordered by the letters of `N.context.attr("data").formatter.date.Ymd()` (or `.Ym()`); separators are added by the [Formatter](../data/formatter.md) `date` rule, not by the datepicker.
- Main classes: `datepicker_years_panel__`, `datepicker_months_panel__`, `datepicker_days_panel__`, `datepicker_top_months_panel__`, `datepicker_year_item__`, `datepicker_month_item__`, `datepicker_day_item__`, `datepicker_prev_day_item__`, `datepicker_next_day_item__`, `*_selected__`, `datepicker_curr_year__`, `datepicker_monthonly__`, `years_panel_position_<pos>__`, `months_panel_position_<pos>__`. See [Theming](theming.md).

# Pitfalls

`N.datepicker` is a class and needs `new`.[^ui]

```js
// Wrong (legacy): const dp = N.datepicker(N("#date"), opts);
const dp = new N.datepicker(N("#date"), opts);
```

The plugin creates one instance shared by every matched input, which breaks when the selector matches several inputs. Create one per input.

```js
// Wrong (legacy): N(".datepicker").datepicker();
N(".datepicker").each(function () { N(this).datepicker(); });
```

The holiday class is lowercase.

```js
// Wrong (legacy): N(".Datepicker_holiday__")
N(".datepicker_holiday__", view);
```

`minDate` and `maxDate` are compared as numbers, so they must be digits only.

```js
// Wrong (legacy): N("#date").datepicker({ minDate: "2024-01-01" });
N("#date").datepicker({ minDate: "20240101", maxDate: "20241231" });
```

A local `holiday` option replaces the global holiday object instead of merging with it. `monthonlyOpts` is applied only when `monthonly: true` is passed in the options argument.

`touchMonthChange` and `scrollMonthChange` do nothing unless `monthsPanelPosition` is `"top"`.

# Examples

Month picker with a year select box (options passed here override the global `monthonlyOpts`):

```js
N("#baseMonth", view).datepicker({
    monthonly: true,
    yearsPanelPosition: "top",
    monthsPanelPosition: "left"
});
```

Range limits and holidays loaded from the server:

```js
N.comm("getHolidayList.json").submit(function (data) {
    const once = {};
    N(data).each(function () {
        once[this.holidayDate] = this.holidayName;   // "YYYYMMDD": "name"
    });
    N("#visitDate", view).datepicker({
        minDate: "20240101",
        maxDate: "20241231",
        holiday: { repeat: null, once: once }
    });
});
```

Reject weekends without writing the value:

```js
N("#meetingDate", view).datepicker({
    onSelect: function (context, selDate, monthonly) {
        const day = selDate.obj.getDay();
        if (day === 0 || day === 6) {
            context.alert("Pick a weekday.").show();
            return false;
        }
    }
});
```

# Related

- [Formatter](../data/formatter.md) - the `date` rule that creates datepickers and formats the value.
- [N.form](form.md) - data binding that syncs the picked value into the row.
- [Component model](component-model.md) - option precedence and global handlers.
- [Date](../core/date.md) - `N.date` helpers used for `selDate`.
- [N.alert](alert.md) - the input tooltips used for validation messages.
- [Configuration](../setup/configuration.md) - `N.context.attr("ui").datepicker` and `data.formatter.date`.

[^ui]: NU.datepicker implementation
[^ui-plugin]: NU.prototype.datepicker jQuery plugin wrapper
[^date-rule]: ND.formatter date rule (creates datepickers)
