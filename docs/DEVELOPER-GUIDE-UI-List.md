# Natural-UI List Component Developer Guide

List (N.list) is a UI component that generates single-column data lists using ul>li elements as the context option. It provides various features for displaying and managing list-type data.

## Table of Contents

- [Overview](#overview)
- [Constructor](#constructor)
- [Default Options](#default-options)
- [Declarative Options](#declarative-options)
- [Methods](#methods)
- [Examples](#examples)

## Overview

List (N.list) is a UI component that generates single-column data lists using ul>li elements as the context option. It provides various features for displaying and managing list-type data.

Main features:
- Integrates with Natural-DATA package components for simplified data formatting and input validation.
- Data is bound when the property name (column name) of the bound data object matches the id attribute value of the element.
- Data formatting and validation are enabled only when data is bound to the element.
- When an input value changes or data is changed via the val method, a rowStatus property is created: "insert" for new, "update" for modified, and "delete" for deleted.
- Provides features such as row selection (single or multiple), checkbox integration, and scroll paging.

## Constructor

### N.list
```javascript
var list = new N.list(data, opts|context);
```
Creates an instance of the List component.
- **data** (json object array): Data to bind to the component
- **opts|context** (object | selector string | object): Options object or context element for the component

### N(obj).list
```javascript
var list = N(data).list(opts|context);
```
Creates an instance of N.list in jQuery plugin style. The first argument of N() is set as the first argument of the new N.list constructor.

## Default Options

- data (json object array, required): Data to bind to N.list.
- context (object|string, required): Context element for N.list. Must be ul and li tags. Data is bound when the property name matches the element's id attribute.
- height (number, default: 0): Sets the list body height. If greater than 0, the list body is scrollable and fixed to the specified height. If 0, all data is shown at once.
- validate (boolean, default: true): If false, disables validation on focus-out.
- html (boolean, default: false): If true, applies HTML when binding data.
- addTop (boolean, default: false): If true, adds new rows to the top when calling add().
- vResizable (boolean, default: false): If true, the list body height can be resized.
- windowScrollLock (boolean, default: true): If true, disables window scroll when scrolling the list.
- revert (boolean, default: false): If true, enables revert functionality.
- select (boolean, default: false): If true, enables row selection.
- unselect (boolean, default: true): If false, disables unselecting a selected row.
- multiselect (boolean, default: false): If true, enables multi-row selection.
- checkAll, checkAllTarget, checkSingleTarget: For checkbox selection. See original for details.
- hover (boolean, default: false): If true, adds a hover class to rows on mouse over.
- createRowDelay (number, default: 1): Delay (ms) between row creation during binding.
- scrollPaging.size (number, default: 100): Number of rows to bind at once during scroll paging.
- fRules, vRules (object, default: null): Format and validation rules as objects.
- addSelect, addScroll, selectScroll, checkScroll, validateScroll, appendScroll (boolean): Various scroll and selection behaviors.
- tpBind (boolean, default: false): Prevents event conflicts before initialization.
- rowHandlerBeforeBind, rowHandler, onBeforeSelect, onSelect, onBind (function): Event handlers for row binding and selection.

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

- data([selFlag][, propName1, propName2, ...]): Returns the latest data bound to the component.
  - selFlag (boolean|string, optional):
    - undefined: Returns data as a json object array (default).
    - false: Returns the original data type as a jQuery object [json object array].
    - "modified": Returns added, modified, or deleted data.
    - "selected": Returns selected data (when select or multiselect is enabled).
    - "checked": Returns checked data (when checkAll or checkAllTarget is enabled).
    - "insert": Returns added data.
    - "update": Returns modified data.
    - "delete": Returns deleted data.
  - propName1, propName2, ... (string, optional): If specified, returns only the specified properties (works only with certain selFlag values).
- context([selector]): Returns the context element. If a selector is specified, returns the matching element within the context.
- contextBodyTemplate([selector]): Returns the li element(s) used as the row template.
- bind([data][, "append"]): Binds data to elements with matching id attributes within the context. If "append" is specified, merges new data and appends new rows.
- add([data][, row]): Adds a new row and data. If data is specified, it is merged with the created data. If data is a number, it is used as the row index.
- remove([row]): Removes the row(s) at the specified index(es).
- revert([row]): Reverts changes for the specified row(s) or all rows.
- validate([row]): Validates input data for the specified row(s) or all rows.
- val(row, key[, val]): Gets or sets the value of a property in the bound data object for the specified row.
- select([row][, isAppend]): Selects the row(s) at the specified index(es). If isAppend is true, adds to selection.
- check([row][, isAppend]): Checks the row(s) at the specified index(es). If isAppend is true, adds to checked rows.
- move(fromRow, toRow): Moves a row from one index to another.
- copy(fromRow, toRow): Copies a row from one index to another.

## Examples

### Basic List Creation and Data Binding

```html
<ul id="basic-list">
    <li>
        <span id="name"></span>
        <span id="age"></span>
        <span id="email"></span>
    </li>
</ul>

<script type="text/javascript">
    // Data object
    const data = [
        {
            name: "Hong Gil-dong",
            age: 30,
            email: "hong@example.com"
        },
        {
            name: "Kim Cheol-su",
            age: 25,
            email: "kim@example.com"
        },
        {
            name: "Lee Young-hee",
            age: 28,
            email: "lee@example.com"
        }
    ];
    // Create List component and bind data
    const list = N(data).list("#basic-list").bind();
</script>
```

### Row Selection Feature

```html
<ul id="selectable-list">
    <li>
        <span id="name"></span>
        <span id="age"></span>
        <span id="email"></span>
    </li>
</ul>

<script type="text/javascript">
    // Data object
    const data = [
        {
            name: "Hong Gil-dong",
            age: 30,
            email: "hong@example.com"
        },
        {
            name: "Kim Cheol-su",
            age: 25,
            email: "kim@example.com"
        }
    ];
    // Create List component and bind data (with row selection)
    const list = N(data).list({
        context: "#selectable-list",
        select: true,
        onSelect: (rowIdx, rowEle, rowData) => {
            console.log("Selected row:", rowIdx);
            console.log("Selected data:", rowData);
        }
    }).bind();
    // Programmatically select a row
    list.select(0);
</script>
```

### Checkbox Integration

```html
<div>
    <input type="checkbox" id="check-all"> <label for="check-all">Select All</label>
</div>
<ul id="checkbox-list">
    <li>
        <input type="checkbox" class="row-check">
        <span id="name"></span>
        <span id="age"></span>
    </li>
</ul>

<script type="text/javascript">
    // Data object
    const data = [
        { name: "Hong Gil-dong", age: 30 },
        { name: "Kim Cheol-su", age: 25 }
    ];
    // Create List component and bind data (with checkbox integration)
    const list = N(data).list({
        context: "#checkbox-list",
        checkAll: N("#check-all"),
        checkAllTarget: ".row-check"
    }).bind();
    // Check checked data
    N("#check-button").on("click", () => {
        const checkedData = list.data("checked");
        console.log("Checked data:", checkedData);
    });
</script>
```

### Scroll Paging

```html
<ul id="scroll-paging-list" style="height: 300px; overflow-y: auto;">
    <li>
        <span id="name"></span>
        <span id="age"></span>
        <span id="email"></span>
    </li>
</ul>

<script type="text/javascript">
    // Large data set
    const data = [];
    for (let i = 0; i < 1000; i++) {
        data.push({
            name: `User${i}`,
            age: 20 + Math.floor(Math.random() * 30),
            email: `user${i}@example.com`
        });
    }
    // Create List component and bind data (with scroll paging)
    const list = N(data).list({
        context: "#scroll-paging-list",
        scrollPaging: {
            size: 50 // Load 50 per page
        },
        onBind: (context, data, isFirstPage, isLastPage) => {
            console.log("Page loaded - first page:", isFirstPage, "last page:", isLastPage);
        }
    }).bind();
</script>
```

### Data Editing and Validation

```html
<ul id="edit-list">
    <li>
        <input id="name" type="text" data-validate='[["required"]]'>
        <input id="age" type="number" data-validate='[["required"], ["number"]]'>
        <input id="email" type="text" data-validate='[["required"], ["email"]]'>
        <button class="update-btn">Save</button>
    </li>
</ul>

<button id="add-row">Add Row</button>
<button id="validate-all">Validate All</button>

<script type="text/javascript">
    // Data object
    const data = [
        { name: "Hong Gil-dong", age: 30, email: "hong@example.com" }
    ];
    // Create List component and bind data
    const list = N(data).list({
        context: "#edit-list",
        validate: true,
        revert: true,
        rowHandler: (rowIdx, rowEle, rowData) => {
            // Add button event to each row
            N(rowEle).find(".update-btn").on("click", () => {
                if (list.validate(rowIdx)) {
                    console.log("Saved data:", list.data("modified"));
                }
            });
        }
    }).bind();
    // Add new row
    N("#add-row").on("click", () => {
        list.add();
    });
    // Validate all
    N("#validate-all").on("click", () => {
        if (list.validate()) {
            console.log("All data is valid");
        } else {
            console.log("There is invalid data");
        }
    });
</script>
```
