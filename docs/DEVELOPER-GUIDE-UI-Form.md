# Natural-JS Form Component Developer Guide

The Form (N.form) component is a UI component that binds or creates single row data to a specified context element (such as div, table, or other block elements) using the context option.

## Overview

Form (N.form) binds or creates single row data to a specified context element (div, table, etc.) using the context option. It helps map form elements to data, bind data, and perform validation easily.

- Integrates with Natural-DATA package components for data formatting and input validation.
- Data is bound when the property name (column name) of the bound data object matches the id attribute value of the element.
- Data formatting and validation are enabled only when data is bound to the element.
- When an input value changes or data is changed via the val method, a rowStatus property is created: "insert" for new, "update" for modified, and "delete" for deleted.

> **Note:** Avoid overlapping context elements or duplicating column data between N.form and other data components (N.grid, N.list, etc.).
> **Note:** When calling add() or bind() repeatedly, always call unbind() in between to prevent data sync issues.

## Table of Contents

- Constructor
- Default Options
- Declarative Options
- Methods
- Events
- Examples

## Constructor

- `N.form(data, opts|context)`
  - data: json object array (data to bind)
  - opts|context: options object or context element
  - Returns: N.form instance

- `N(obj).form(opts|context)`
  - jQuery plugin method to create an N.form instance

## Default Options

- **data**: json object array (required)
  - Data to bind to N.form. Must be an array, even for a single row.
- **row**: number (default: -1)
  - Index of the row to bind from the data array. Defaults to 0 if not specified.
- **context**: object|string (required)
  - Context element for N.form. Use block elements like table, div, section, etc. Data is bound when the property name matches the element's id attribute.
- **validate**: boolean (default: true)
  - If false, disables validation on focus-out.
- **html**: boolean (default: false)
  - If true, applies HTML when binding data.
- **revert**: boolean (default: false)
  - If true, enables revert functionality and allows use of the revert method.
- **unbind**: boolean (default: true)
  - If true, enables unbind functionality and allows use of the unbind method.
- **autoUnbind**: boolean (default: false)
  - If true, automatically calls unbind before rebinding data to the same form element.
- **addTop**: boolean (default: false)
  - If true, adds new row data to the top of the data list when calling add().
- **tpBind**: boolean (default: false)
  - Prevents conflicts between pre-bound events and component events before initialization.
- **fRules**: object (default: null)
  - Specifies format rules as an object instead of using data-format attributes.
- **vRules**: object (default: null)
  - Specifies validation rules as an object instead of using data-validate attributes.
- **onBeforeBindValue**: function (default: null)
  - Event handler before a property value is bound to an element.
- **onBindValue**: function (default: null)
  - Event handler after a property value is bound to an element.
- **onBeforeBind**: function (default: null)
  - Event handler before data is bound to the form.
- **onBind**: function (default: null)
  - Event handler after data binding is complete.

## Declarative Options

You can specify options directly on HTML elements using data-* attributes. Especially, you can declaratively specify formatting and validation rules by integrating with Natural-DATA package components (Formatter, Validator).

- data-format: Specifies the display format for data. Integrates with the Formatter component.

  ```html
  <input id="balance" type="tel" data-format='[["numeric", "$#,###.##0"]]'>
  ```

- data-validate: Specifies validation rules for input data. Integrates with the Validator component.

  ```html
  <input id="name" type="text" data-validate='[["required"]]'>
  ```

## Methods

- **data(selFlag, ...propNames)**: Returns the latest data bound to the component.
  - selFlag (boolean, optional):
    - undefined: Returns data as a json object array (default).
    - true: Returns only the data currently bound to the form.
    - false: Returns the original data type as a jQuery object [json object array].
    > **Note:** When binding data to another data component, set selFlag to false to enable two-way data binding.
  - ...propNames (string, optional): If specified, returns only the specified properties (works only when selFlag is true).
- **row(before)**: Returns the index of the data bound to the form. If "before" is specified, returns the index of the previously bound data.
- **context(selector)**: Returns the context element. If a selector is specified, returns the matching element within the context.
- **bind(row, data, ...propNames)**: Binds data to elements with matching id attributes within the context.
  - row (number, optional): Index of the data object to bind.
  - data (json object array, optional): Data to bind.
  - ...propNames (string, optional): Only binds data to elements whose id matches the property name.
  > **Note:** Always call unbind before re-binding data to a context element.
- **unbind()**: Removes N.form-related events, states, and styles from the context element, restoring it to its pre-bind state. Data and selected row are not removed.
- **add(data, row)**: Adds a new row of data. If a data object is specified, it is merged with the created data. If data is a number, it is used as the row index.
- **remove()**: Removes the data object bound to the form from the data array. If rowStatus is "insert", the row is deleted; otherwise, rowStatus is set to "delete".
- **revert()**: Reverts to the initially bound or created data.
- **validate()**: Returns the result of validation for all added/modified data. Returns true if validation passes, false otherwise (and shows a tooltip with the error message).
- **val(key, val)**: Gets or sets the value of a property in the bound data object. If val is specified, sets the value; otherwise, gets the value.
  > **Note:** If the bound element exists, null is set as an empty string, numbers as string, and booleans as "true" or "false". If not, the original type is preserved.

## Events

- **onBeforeBindValue**: Called before a property value is bound to an element.
- **onBindValue**: Called after a property value is bound to an element.
- **onBeforeBind**: Called before data is bound to the form.
- **onBind**: Called after data binding is complete.

## Examples

### 1. Basic Form Creation and Data Binding

```html
<table id="form-example">
    <tr>
        <th><label for="name">Name</label></th>
        <td><input id="name" type="text" data-validate='[["required"]]'></td>
    </tr>
    <tr>
        <th><label for="email">Email</label></th>
        <td><input id="email" type="text" data-validate='[["required"], ["email"]]'></td>
    </tr>
    <tr>
        <th><label for="age">Age</label></th>
        <td><input id="age" type="number" data-validate='[["required"], ["number"]]'></td>
    </tr>
</table>

<script type="text/javascript">
    // Data object
    const data = [{
        name: "Hong Gil-dong",
        email: "hong@example.com",
        age: 30
    }];
    // Create Form component and bind data
    const form = N(data).form("#form-example").bind();
    // Validation
    if (form.validate()) {
        console.log("Validation successful");
    }
    // Get data
    const formData = form.data(true);
    console.log(formData);
</script>
```

### 2. Adding New Data

```javascript
// Create Form instance with empty data
const form = N([]).form("#form-example");
// Add new data (empty form)
form.add();
// After user fills the form, validate and save
if (form.validate()) {
    const newData = form.data(true);
    console.log("New data:", newData);
}
```

### 3. Modifying and Reverting Data

```javascript
// Create Form instance with data
const form = N(data).form("#form-example", {
    revert: true // Enable revert feature
}).bind();
// Modify data
form.val("name", "Kim Cheol-su");
form.val("age", 25);
// Revert to original data
form.revert();
```

### 4. Unbinding and Rebinding Data

```javascript
// Create Form instance with data
const form = N(data).form("#form-example", {
    unbind: true // Enable unbind feature
}).bind();
// Unbind
form.unbind();
// Rebind with new data
const newData = [{
    name: "Lee Young-hee",
    email: "lee@example.com",
    age: 28
}];
form.bind(0, newData);
```
