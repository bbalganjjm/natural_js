# Natural-JS Datepicker Component Developer Guide

The Datepicker (N.datepicker) of Natural-JS is a UI component that displays a calendar popup for selecting a date or month in a text input element specified by the context option.

## Overview

Datepicker (N.datepicker) displays a calendar popup for selecting a date or month in a text input element specified by the context option.

- You can easily use the Datepicker by declaring the "date" rule in the data-format attribute of a text input element and linking it with data-related components.
- See the [Form], [List], [Grid] menus' [Declarative Options] tab and the [Formatter] menu's [Format Rule List] tab for the "date" rule.
- For details on declarative options, see the **Declarative Options** section in the [API Documentation Guide].

## Table of Contents

- Constructor
- Default Options
- Methods
- Events
- Examples

## Constructor

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| N.datepicker | context, opts | context: jQuery object/selector<br>opts: object | N.datepicker | Creates an N.datepicker instance.<br><pre><code>var datepicker = new N.datepicker(context, opts);</code></pre> |
| N(obj).datepicker | opts | opts: object | N.datepicker | Creates an N.datepicker instance using the jQuery plugin method.<br><pre><code>var datepicker = N(context).datepicker(opts);</code></pre> |

- context: The input element to apply the Datepicker to (jQuery object or selector string)
- opts: Default options object for the component
- Return value: N.datepicker instance

## Default Options

- **context**: jQuery object or selector string — The input element to apply N.datepicker to.
- **yearsPanelPosition**: string (left|top) — If set to top, the year selection element is created at the top.
- **monthsPanelPosition**: string (left|top) — If set to top, the month selection element is created at the top.
- **minYear**: number — When yearsPanelPosition is "top", sets the number of previous years that can be selected.
- **maxYear**: number — When yearsPanelPosition is "top", sets the number of future years that can be selected.
- **yearChangeInput**: boolean — If true, the changed date is immediately applied to the input when the year changes.
- **monthChangeInput**: boolean — If true, the changed date is immediately applied to the input when the month changes.
- **touchMonthChange**: boolean — If true, swiping left/right changes the month.
- **scrollMonthChange**: boolean — If true, scrolling the mouse wheel changes the month.
- **monthonly**: boolean — If true, displays a Monthpicker for selecting only year and month.
- **focusin**: boolean — If false, the datepicker does not appear when the input is focused.
- **minDate**: string — Prevents selection/input of dates before this value.
- **maxDate**: string — Prevents selection/input of dates after this value.
- **holiday**: object — Sets holidays to be displayed in the Datepicker. See below for details.
- **onSelect**: function — Event handler executed when a date or month is selected.
- **onBeforeShow/onShow/onBeforeHide/onHide/onChangeYear/onChangeMonth**: function — Event handlers for various Datepicker events.

### Example of Setting the holiday Option

The holiday option can be set as repeat and once objects as shown below:

```javascript
{
    "repeat" : {
        "0619" : "Holiday1",
        "0620" : "Holiday3",
        "0621" : ["Holiday6", "Holiday7"],
        "0622" : ["Holiday9", "Holiday10"]
    },
    "once" : {
        "20200619" : "Holiday2",
        "20200620" : ["Holiday4", "Holiday5"],
        "20200621" : "Holiday8",
        "20200622" : ["Holiday11", "Holiday12"]
    }
}
```

- Use repeat for holidays that repeat every year (without the year).
- Use once for holidays that do not repeat every year (with year, month, day).
- If there are multiple holidays on the same date, use an array.

If you set the N.context.attr("ui").datepicker.holiday property in [Config(natural.config.js)], it applies to all Datepickers.

```javascript
N.comm("getHolidayList.json").submit(function(data) {
    var once = {};
    N(data).each(function() {
        once[this.holidayDate] = this.holidayName;
    });
    if(N.context.attr("ui").datepicker.holiday === undefined) {
        N.context.attr("ui").datepicker.holiday = {};
    }
    N.context.attr("ui").datepicker.holiday.once = once;
});
```

Elements displayed as holidays get the "Datepicker_holiday__" class.

## Events

Datepicker defines the following events for the input element specified as context. Event handlers can be set as options during initialization or attached separately. If an event with the same name is already bound, the handler specified during initialization takes precedence.

- **onSelect**: Executed when a date or month is selected.
- **onBeforeShow**: Executed before the datepicker is shown.
- **onShow**: Executed after the datepicker is shown.
- **onBeforeHide**: Executed before the datepicker is hidden.
- **onHide**: Executed after the datepicker is hidden.
- **onChangeYear**: Executed when the year changes.
- **onChangeMonth**: Executed when the month changes.

### Event Handler Function Parameters

#### onSelect

```javascript
onSelect : function(context, selDate, monthonly) {
    // this : N.datepicker instance
    // context : context element
    // selDate : selected date object
    //      selDate = {
    //          obj: Date object,
    //          format: date format string
    //      }
    //      selDate.obj.formatDate("d/m/Y") => "26/09/2024";
    // monthonly : value of monthonly option
}
```

#### onBeforeShow

```javascript
onBeforeShow : function(context, contents) {
    // this : N.datepicker instance
    // context : context element
    // contents : Datepicker panel element
}
```

#### onShow

```javascript
onShow : function(context, contents) {
    // this : N.datepicker instance
    // context : context element
    // contents : Datepicker panel element
}
```

#### onBeforeHide

```javascript
onBeforeHide : function(context, contents) {
    // this : N.datepicker instance
    // context : context element
    // contents : Datepicker panel element
}
```

#### onHide

```javascript
onHide : function(context) {
    // this : N.datepicker instance
    // context : context element
}
```

#### onChangeYear

```javascript
onChangeYear : function(context, year, e) {
    // this : N.datepicker instance
    // context : context element
    // year : selected year
    // e : event object
}
```

#### onChangeMonth

```javascript
onChangeMonth : function(context, month, year, e) {
    // this : N.datepicker instance
    // context : context element
    // month : selected month
    // year : selected year
    // e : event object
}
```

## Methods

- **context([selector])**: Returns the context element(s). If a selector is provided, returns the element(s) within the context.
- **show()**: Shows the Datepicker.
- **hide()**: Hides the Datepicker.

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

### 3. Automatically Creating a Datepicker by Specifying the "date" Format Rule When Binding Data with N.form, N.grid, or N.list

```html
<div class="form">
    <input id="datepicker" type="text" data-format='[["date", 8, "date"]]'>
</div>

<script type="text/javascript">
    N({ datepicker: "20141212" }).form(".form").bind();
</script>
```
