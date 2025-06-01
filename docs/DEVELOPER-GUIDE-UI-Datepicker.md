# Natural-JS Datepicker Component Developer Guide

The Natural-JS Datepicker (N.datepicker) is a UI component that displays a calendar popup for selecting a date or month in a text input element specified by the context option.

## Table of Contents

- [Constructor](#constructor)
- [Default Options](#default-options)
- [Methods](#methods)
- [Events](#events)
- [Examples](#examples)

## Overview

Datepicker (N.datepicker) displays a calendar popup for selecting a date or month in a text input element specified by the context option.

- You can easily use Datepicker by declaring the "date" rule in the data-format attribute of a text input element and linking it with data-related components.
- See the [Form], [List], and [Grid] menus' [Declarative Options] tab and the [Formatter] menu's [Format Rule List] tab for rules like ["date", 4|6|8|10|12|14, "month"|"date"].
- For an explanation of declarative options, see the **Declarative Options** section in the [API Documentation Guide].

## Constructor

- `N.datepicker(context, opts)`
  - context: jQuery object or selector string (input element to apply Datepicker)
  - opts: options object
  - Returns: N.datepicker instance

- `N(obj).datepicker(opts)`
  - jQuery plugin method to create an N.datepicker instance

## Default Options

- **context**: jQuery object or selector string (Required)
  - The input element to apply N.datepicker to.
- **yearsPanelPosition**: string ("left" | "top") (default: "left")
  - If set to "top", the year selection element is created at the top.
- **monthsPanelPosition**: string ("left" | "top") (default: "left")
  - If set to "top", the month selection element is created at the top.
- **minYear**: number (default: 200)
  - When yearsPanelPosition is "top", sets the number of previous years that can be selected.
- **maxYear**: number (default: 200)
  - When yearsPanelPosition is "top", sets the number of future years that can be selected.
- **yearChangeInput**: boolean (default: false)
  - If true, the changed date is immediately applied to the input when the year changes.
- **monthChangeInput**: boolean (default: false)
  - If true, the changed date is immediately applied to the input when the month changes.
- **touchMonthChange**: boolean (default: false)
  - If true, swiping left/right changes the month.
- **scrollMonthChange**: boolean (default: false)
  - If true, scrolling the mouse wheel changes the month.
- **monthonly**: boolean (default: false)
  - If true, only year and month can be selected (Monthpicker).
- **focusin**: boolean (default: true)
  - If false, Datepicker does not appear when the input is focused.
- **minDate**: string (default: null)
  - Prevents selection/input of dates before this value.
- **maxDate**: string (default: null)
  - Prevents selection/input of dates after this value.
- **holiday**: object (default: { repeat: null, once: null })
  - If set, holidays are displayed in the Datepicker.
- **onSelect**: function (default: null)
  - Event handler called when a date or month (if monthonly is true) is selected.
- **onBeforeShow**: function (default: null)
  - Event handler before the datepicker is shown.
- **onShow**: function (default: null)
  - Event handler after the datepicker is shown.
- **onBeforeHide**: function (default: null)
  - Event handler before the datepicker is hidden.
- **onHide**: function (default: null)
  - Event handler after the datepicker is hidden.
- **onChangeYear**: function (default: null)
  - Event handler when the year is changed.
- **onChangeMonth**: function (default: null)
  - Event handler when the month is changed.

### Example: Setting the holiday option

The holiday option can be set as follows:

```javascript
{
  repeat: {
    "0619": "Holiday1",
    "0620": "Holiday3",
    "0621": ["Holiday6", "Holiday7"],
    "0622": ["Holiday9", "Holiday10"]
  },
  once: {
    "20200619": "Holiday2",
    "20200620": ["Holiday4", "Holiday5"],
    "20200621": "Holiday8",
    "20200622": ["Holiday11", "Holiday12"]
  }
}
```

- Use the repeat object for holidays that repeat every year (exclude the year).
- Use the once object for holidays that do not repeat every year (use the full date: year, month, day).
- If there are multiple holidays on the same date, use an array of names.

If you set the N.context.attr("ui").datepicker.holiday property in [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html), it will apply to all Datepickers.

```javascript
N.comm("getHolidayList.json").submit(data => {
  const once = {};
  N(data).each(function() {
    once[this.holidayDate] = this.holidayName;
  });
  if (N.context.attr("ui").datepicker.holiday === undefined) {
    N.context.attr("ui").datepicker.holiday = {};
  }
  N.context.attr("ui").datepicker.holiday.once = once;
});
```

Elements marked as holidays will have the class "Datepicker_holiday__".

## Events

Datepicker defines the following events for the input element specified as context. Event handlers can be set as options during initialization or attached separately. If an event with the same name is already bound, the handler specified during initialization takes precedence.

- **onSelect**: Called when a date or month (if monthonly is true) is selected.
- **onBeforeShow**: Called before the datepicker is shown.
- **onShow**: Called after the datepicker is shown.
- **onBeforeHide**: Called before the datepicker is hidden.
- **onHide**: Called after the datepicker is hidden.
- **onChangeYear**: Called when the year is changed.
- **onChangeMonth**: Called when the month is changed.

### Event Handler Parameters

- **onSelect**

  ```javascript
  (context, selDate, monthonly) => {
    // this: N.datepicker instance
    // context: context element
    // selDate: selected date object
    //   selDate = {
    //     obj: Date object,
    //     format: date format string
    //   }
    //   selDate.obj.formatDate("d/m/Y") => "26/09/2024"
    // monthonly: value of the monthonly option
  }
  ```

- **onBeforeShow**

  ```javascript
  (context, contents) => {
    // this: N.datepicker instance
    // context: context element
    // contents: Datepicker panel element
  }
  ```

- **onShow**

  ```javascript
  (context, contents) => {
    // this: N.datepicker instance
    // context: context element
    // contents: Datepicker panel element
  }
  ```

- **onBeforeHide**

  ```javascript
  (context, contents) => {
    // this: N.datepicker instance
    // context: context element
    // contents: Datepicker panel element
  }
  ```

- **onHide**

  ```javascript
  (context) => {
    // this: N.datepicker instance
    // context: context element
  }
  ```

- **onChangeYear**

  ```javascript
  (context, year, e) => {
    // this: N.datepicker instance
    // context: context element
    // year: selected year
    // e: event object
  }
  ```

- **onChangeMonth**

  ```javascript
  (context, month, year, e) => {
    // this: N.datepicker instance
    // context: context element
    // month: selected month
    // year: selected year
    // e: event object
  }
  ```

## Methods

- **context([selector])**
  - Returns the context element. If a selector is provided, returns the element within the context.
- **show()**
  - Shows the Datepicker.
- **hide()**
  - Hides the Datepicker.

### Usage Example

```javascript
datepicker.context([selector]);
datepicker.show();
datepicker.hide();
```

## Examples

### 1. Creating a Datepicker

```html
<input class="datepicker" type="text">

<script type="text/javascript">
  N(".datepicker").datepicker();
</script>
```

### 2. Creating a Monthpicker

```html
<input class="datepicker" type="text">

<script type="text/javascript">
  N(".datepicker").datepicker({
    monthonly: true
  });
</script>
```

### 3. Automatically creating a Datepicker by specifying the "date" format rule when binding data with N.form, N.grid, or N.list

```html
<div class="form">
  <input id="datepicker" type="text" data-format='[["date", 8, "date"]]'>
</div>

<script type="text/javascript">
  N({ datepicker: "20141212" }).form(".form").bind();
</script>
```
