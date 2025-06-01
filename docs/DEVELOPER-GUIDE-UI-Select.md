# Natural-JS Select Component Developer Guide

The Select (N.select) component of Natural-JS is a UI component that binds data to select, input[type=checkbox], and input[type=radio] elements, providing selection functionality and extending the features of these controls.

## Table of Contents

- [Overview](#overview)
- [Constructor](#constructor)
- [Default Options](#default-options)
- [Methods](#methods)
- [Examples](#examples)
- [Switch Component](#switch-component)

## Overview

The Select component allows you to easily bind data to various HTML selection elements (select, checkbox, radio), retrieve or set selected values, and implement dynamic, data-driven selection controls.

## Constructor

### N.select

```javascript
const select = new N.select(data, optsOrContext);
```

- **data** (array of JSON objects): Sets the data option. Same as the data option in default options.
- **optsOrContext** (object | jQuery selector string | jQuery object): Specifies the default options object for the component. If a jQuery selector string or object is provided, it is set as the context option in default options.
- **Returns**: N.select instance

### N(obj).select

Creates an instance of N.select using the jQuery plugin method.

```javascript
const select = N(data).select(optsOrContext);
```

- **optsOrContext** (object | jQuery selector string | jQuery object): Same as the second argument (opts) of the N.select function.
- **Returns**: N.select instance

Instances created with `new N.select()` and `N().select` are identical except for the instantiation method. The first argument of the N() function is set as the first argument of the new N.select constructor.

## Default Options

- **data** (array of JSON objects, required): Specifies the data to bind to N.select.
- **context** (jQuery object or selector string, required): Specifies the context element to apply N.select. The context element should be a select, input[type=checkbox], or input[type=radio] element.
- **key** (string, required): Specifies the property name of the data to bind to the name attribute of the selection element.
- **val** (string, required): Specifies the property name of the data to bind to the value attribute of the selection element.
- **append** (boolean, optional, default: true): If false, clears the default options of the select element before binding data.
- **direction** (string, optional, default: 'h'): For input[type=checkbox] or input[type=radio] context, sets the layout direction. 'h' for horizontal, 'v' for vertical.

## Methods

- **data(selFlag)**: Returns the latest data bound to the component.
  - `selFlag` (boolean, optional): Determines the type of data returned.
    - If undefined: returns the data as an array of JSON objects.
    - If true: returns only the currently selected row data as an array.
    - If false: returns the original data as a jQuery object.
- **context(selector: string)**: Returns the context element. If a selector is provided, returns the element(s) within the context.
- **bind(data: array)**: Binds data to the component and creates the selection elements inside the context element.
- **val(val: string|array)**: Gets or sets the value(s) of the selected option(s). If no value is provided, returns the currently selected value(s).
- **index(index: number|array)**: Gets or sets the index(es) of the selected option(s). If no index is provided, returns the currently selected index(es).
- **remove(val: number)**: Removes the option and data object with the specified value.
- **reset(selFlag: boolean)**: Resets the selection. For select elements, if true, no option is selected; if false, the first option is selected.

## Examples

### Example data

```javascript
const data = [
  { key: 'blue', val: 'blue' },
  { key: 'brown', val: 'brown' },
  { key: 'green', val: 'green' }
];
```

You can set the key and val options globally in [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html) for convenient use:

```javascript
N.context.attr('ui', {
  ...
  select: {
    key: 'key',
    val: 'val'
  }
  ...
});
```

The following examples assume the above configuration. If not, set the key and val options when initializing the component.

### 1. Bind data to a select element

```html
<select class="eyeColor">
  <option>Select</option>
</select>
<script type="text/javascript">
  N(data).select('.eyeColor').bind();
</script>
```

### 1.1. Bind data and set default value to "brown"

```html
<select class="eyeColor">
  <option>Select</option>
</select>
<script type="text/javascript">
  N(data).select('.eyeColor').bind().val('brown');
</script>
```

### 2. Bind data to a select[multiple] element

```html
<select class="eyeColor" multiple="multiple"></select>
<script type="text/javascript">
  N(data).select('.eyeColor').bind();
</script>
```

### 2.1. Bind data and set default values to "brown" and "green"

```html
<select class="eyeColor" multiple="multiple"></select>
<script type="text/javascript">
  N(data).select('.eyeColor').bind().val(['brown', 'green']);
</script>
```

### 3. Bind data to an input[type=radio] element

```html
<input class="eyeColor" type="radio">
<script type="text/javascript">
  N(data).select('.eyeColor').bind();
</script>
```

### 3.1. Bind data and set default value to "brown"

```html
<input class="eyeColor" type="radio">
<script type="text/javascript">
  N(data).select('.eyeColor').bind().val('brown');
</script>
```

### 4. Bind data to an input[type=checkbox] element

```html
<input class="eyeColor" type="checkbox">
<script type="text/javascript">
  N(data).select('.eyeColor').bind();
</script>
```

### 4.1. Bind data and set default values to "brown" and "green"

```html
<input class="eyeColor" type="checkbox">
<script type="text/javascript">
  N(data).select('.eyeColor').bind().val(['brown', 'green']);
</script>
```

## Switch Component

The Switch is a CSS style that applies to a single checkbox using the Select component, turning the checkbox into a toggle switch for handling true/false, Y/N, etc.

### Overview

Switch can be applied to `input[type=checkbox]` elements using only CSS and can be used together with the Select component. It displays the checkbox as a modern toggle switch for improved user experience.

### Default Options (CSS Variables)

- **--njs-switch-height** (string, default: 27px): Sets the height of the toggle switch.
- **--njs-switch-width** (string): Sets the width of the toggle switch.
- **--njs-switch-padding** (string): Sets the padding of the toggle switch.
- **--njs-switch-on-content** (string): Sets the text when the switch is on.
- **--njs-switch-off-content** (string): Sets the text when the switch is off.
- **--njs-switch-font-size** (string): Sets the font size of the switch text.

Unless otherwise specified, the size of the switch is automatically calculated based on the `--njs-switch-height` value.

### Examples

#### 1. Basic toggle switch

Wrap the `input[type=checkbox]` element in a `label` tag with the class 'switch__'. Then add a `span` tag with the class 'switch_slider__' after the input.

```html
<label class="switch__">
  <input id="${id}" type="checkbox">
  <span class="switch_slider__"></span>
</label>
```

#### 2. Custom switch options

Example of a wide toggle switch:

```html
<label class="switch__" style="--njs-switch-width: 80px;">
  <input id="${id}" type="checkbox">
  <span class="switch_slider__"></span>
</label>
```

Example of a large toggle switch with 'Y/N' state text:

```html
<label class="switch__" style="--njs-switch-height: 40px; --njs-switch-on-content: 'Y'; --njs-switch-off-content: 'N';">
  <input id="${id}" type="checkbox">
  <span class="switch_slider__"></span>
</label>
```

#### 3. Using Switch with Select component

```html
<label class="switch__">
  <input id="useSwitch" name="useSwitch" type="checkbox">
  <span class="switch_slider__"></span>
</label>
<script type="text/javascript">
  // Bind data with Select component
  const switchData = [
    { key: 'useSwitch', val: true }
  ];
  N(switchData).select('#useSwitch').bind();
</script>
```

## Notes

- Use the `append` option to control whether to clear existing options before binding new data.
- Use the `direction` option to control the layout of checkboxes and radio buttons.
- Use the `reset` method to reset the selection to its default state.
- For custom toggle switches, use the Switch CSS variables for flexible styling.

## Related Components

- [Form](DEVELOPER-GUIDE-UI-Form.md): For form data binding and validation.
- [List](DEVELOPER-GUIDE-UI-List.md): For displaying lists of data.
- [Notify](DEVELOPER-GUIDE-UI.Shell-Notify.md): For global notifications.
