# Natural-JS Grid Component Developer Guide

Natural-JS Grid (N.grid) is a UI component that generates multi-column data lists using a table element as its context.

## Table of Contents

1. [Overview](#overview)
2. [Constructor](#constructor)
3. [Default Options](#default-options)
4. [Event Handler Options](#event-handler-options)
5. [Misc Options (Constants)](#misc-options-constants)
6. [Methods](#methods)
7. [Examples](#examples)

## Overview

Grid (N.grid) generates multi-column data lists using a table element as the context option.

- Integrates with Natural-DATA package components for simplified data formatting and input validation. See the [Declarative Options](#declarative-options) section for details.
- Data is bound when the property name (column name) of the bound data object matches the id attribute value of the element. Data formatting and validation are enabled only when data is bound to the element.
- Provides two types of grids: fixed header and list type.
- When an input value changes or data is changed via the val method, a rowStatus property is created: "insert" for new, "update" for modified, and "delete" for deleted.
- Offers various features for handling list data, such as Excel paste, data filter/sort, etc. See the options and methods sections for more details.

> ⚠️ The width of the table element used for the grid must always be specified, either as a fixed length (px) or variable length (%).

## Constructor

### N.grid
```javascript
const grid = new N.grid(data, opts|context);
```
- **data** (json object array): Data to bind to the grid.
- **opts|context** (object | selector string | object): Options object or context element for the component.
- **Returns:** N.grid instance

### N(obj).grid
```javascript
const grid = N(data).grid(opts|context);
```
- **data** (json object array): Data to bind to the grid.
- **opts|context** (object | selector string | object): Same as above.
- **Returns:** N.grid instance

Instances created with `new N.grid()` and `N().grid` are functionally identical; only the instantiation method differs. The first argument of N() is set as the first argument of the new N.grid constructor.

## Default Options

- data (json object array, required): Data to bind to N.grid.
- context (object|string, required): Context element for N.grid. Must be a table tag. Thead is for grid headers, tbody for grid body, tfoot for grid footer (optional). Data is bound when the property name matches the element's id attribute. You can bind multiple columns in one cell by adding multiple elements with id attributes inside a td. For more, see the original documentation.
- height (number, default: 0): Sets the grid body height. If greater than 0, the header is fixed and the grid body is scrollable. If 0, all data is shown at once.
- fixedcol (number, default: 0): Number of columns to fix from the left. 0 disables fixed columns.
- more (boolean|array, default: false): Enables column show/hide and detail popup features. If true, all columns are shown in the detail popup; if an array, only specified columns are shown.
- validate (boolean, default: true): If false, disables validation on focus-out.
- html (boolean, default: false): If true, applies HTML when binding data.
- addTop (boolean, default: false): If true, adds new rows to the top when calling add().
- resizable (boolean, default: false): If true, columns can be resized.
- vResizable (boolean, default: false): If true, grid body height can be resized.
- sortable (boolean, default: false): If true, enables sorting by column.
- filter (boolean, default: false): If true, enables filtering by column.
- windowScrollLock (boolean, default: true): If true, disables window scroll when scrolling the grid.
- revert (boolean, default: false): If true, enables revert functionality.
- select (boolean, default: false): If true, enables row selection.
- unselect (boolean, default: true): If false, disables unselecting a selected row.
- multiselect (boolean, default: false): If true, enables multi-row selection.
- checkAll, checkAllTarget, checkSingleTarget (string, default: null): For checkbox selection. See original for details.
- hover (boolean, default: false): If true, adds a hover class to rows on mouse over.
- createRowDelay (number, default: 1): Delay (ms) between row creation during binding.
- scrollPaging.size (number, default: 100): Number of rows to bind at once during scroll paging.
- fRules, vRules (object, default: null): Format and validation rules as objects.
- addSelect, addScroll, selectScroll, checkScroll, validateScroll, appendScroll (boolean): Various scroll and selection behaviors.
- tpBind (boolean, default: false): Prevents event conflicts before initialization.
- pastiable (boolean, default: false): Enables Excel-style paste.

## Event Handler Options

- rowHandlerBeforeBind (function): Called before data is bound to a row.
- rowHandler (function): Called after data is bound to a row.
- onBeforeSelect (function): Called before a row is selected. Return false to prevent selection.
- onSelect (function): Called after a row is selected.
- onBind (function): Called after data binding is complete.

## Misc Options (Constants)

Various options for fine-tuning column/row sizes and positions. See the original documentation for details.

## Methods

- bind([data [, "append"]]): Binds data to the context element. If "append" is specified, appends data.
- data([flag]): Returns data bound to the component. Flags: "modified", "insert", "update", "delete", "selected", "checked", undefined (all), false (jQuery object).
- add([idx [, data]]): Adds an empty row. Optionally specify index and data.
- remove(idx): Removes the row(s) at the specified index(es).
- select(idx [, isAdd]): Selects the row(s) at the specified index(es). If isAdd is true, adds to selection.
- check(idx [, isAdd]): Checks the row(s) at the specified index(es). If isAdd is true, adds to checked rows.
- val(idx, key [, val]): Gets or sets the value of a column in the specified row.
- revert([idx]): Reverts changes for the specified row or all rows.
- hide(idx): Hides the specified column.
- show(idx): Shows the specified column.
- move(fromIdx, toIdx): Moves a row from one index to another.
- copy(fromIdx, toIdx): Copies a row from one index to another.
- validate([idx]): Validates input data for the specified row or all rows.

## Declarative Options

You can specify options directly on elements using data-* attributes. For example:

- data-format: Specifies format rules.
  ```html
  <input id="age" type="text" data-format='[["trimToEmpty"], ["date", 8, "date"]]'>
  ```
- data-validate: Specifies validation rules.
  ```html
  <input id="age" type="text" data-validate='[["required"], ["integer"]]'>
  ```
- data-filter: Enables filter for a column.
  ```html
  <th data-filter="true"></th>
  ```
- data-rowspan: Enables row merging for a column.
  ```html
  <th data-rowspan="true"></th>
  ```

## Examples

### 1. Basic Grid Creation

```html
<table id="sampleGrid" class="table" style="width: 100%;">
    <thead>
        <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Email</th>
            <th>Registered</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text"></td>
            <td><input id="age" type="text"></td>
            <td><input id="email" type="text"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<script type="text/javascript">
    const data = [
        {
            name: "Hong Gil-dong",
            age: 30,
            email: "hong@example.com",
            registered: "2023-01-15"
        },
        {
            name: "Kim Cheol-su",
            age: 25,
            email: "kim@example.com",
            registered: "2023-02-20"
        }
    ];
    const grid = N(data).grid("#sampleGrid").bind();
</script>
```

### 2. Fixed Header Grid (height option)

```html
<table id="fixedHeaderGrid" class="table" style="width: 100%;">
    <thead>
        <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Email</th>
            <th>Registered</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text"></td>
            <td><input id="age" type="text"></td>
            <td><input id="email" type="text"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<script type="text/javascript">
    const data = [
        // ... data array
    ];
    const grid = N(data).grid({
        context: "#fixedHeaderGrid",
        height: 300 // Set grid height to 300px
    }).bind();
</script>
```

### 3. Sorting and Filtering

```html
<table id="sortFilterGrid" class="table" style="width: 100%;">
    <thead>
        <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Email</th>
            <th>Registered</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text"></td>
            <td><input id="age" type="text"></td>
            <td><input id="email" type="text"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<script type="text/javascript">
    const data = [
        // ... data array
    ];
    const grid = N(data).grid({
        context: "#sortFilterGrid",
        sortable: true,  // Enable sorting
        filter: true     // Enable filtering
    }).bind();
</script>
```

### 4. Row Selection Event

```html
<table id="selectEventGrid" class="table" style="width: 100%;">
    <thead>
        <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Email</th>
            <th>Registered</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text"></td>
            <td><input id="age" type="text"></td>
            <td><input id="email" type="text"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<script type="text/javascript">
    const data = [
        // ... data array
    ];
    const grid = N(data).grid({
        context: "#selectEventGrid",
        select: true,  // Enable row selection
        onSelect: (rowIdx, rowEle, rowData) => {
            console.log("Selected row:", rowIdx);
            console.log("Selected data:", rowData);
        }
    }).bind();
</script>
```
