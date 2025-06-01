# Natural-UI Grid Component Developer Guide

The Grid (N.grid) component is a UI component that generates multi-column data lists using a table element as its context.

## Table of Contents

- [Natural-UI Grid Component Developer Guide](#natural-ui-grid-component-developer-guide)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Constructor](#constructor)
  - [Default Options](#default-options)
  - [Declarative Options](#declarative-options)
  - [Methods](#methods)
  - [Events](#events)
  - [Examples](#examples)
    - [1. Basic Grid Creation](#1-basic-grid-creation)
    - [2. Fixed Header Grid (height option)](#2-fixed-header-grid-height-option)
    - [3. Sorting and Filtering](#3-sorting-and-filtering)
    - [4. Row Selection Event](#4-row-selection-event)

## Overview

Grid (N.grid) generates multi-column data lists using a table element as the context option.

- Integrates with Natural-DATA package components for data formatting and input validation.
- Data is bound when the property name (column name) of the bound data object matches the id attribute value of the element.
- Data formatting and validation are enabled only when data is bound to the element.
- Provides fixed header and list type grids.
- When an input value changes or data is changed via the val method, a rowStatus property is created: "insert" for new, "update" for modified, and "delete" for deleted.
- Offers features for handling list data, such as Excel paste, data filter/sort, etc.

> **Note:** The width of the table element used for the grid must always be specified, either as a fixed length (px) or variable length (%).

## Constructor

- `N.grid(data, opts|context)`
  - data: json object array (data to bind)
  - opts|context: options object or context element
  - Returns: N.grid instance

- `N(obj).grid(opts|context)`
  - jQuery plugin method to create an N.grid instance

## Default Options

- **data**: json object array (required)
  - Data to bind to N.grid.
- **context**: object|string (required)
  - Context element for N.grid. Must be a table tag. Thead is for grid headers, tbody for grid body, tfoot for grid footer (optional).
- **height**: number (default: 0)
  - Sets the grid body height. If greater than 0, the header is fixed and the grid body is scrollable. If 0, all data is shown at once.
- **fixedcol**: number (default: 0)
  - Number of columns to fix from the left. 0 disables fixed columns.
- **more**: boolean|array (default: false)
  - Enables column show/hide and detail popup features.
- **validate**: boolean (default: true)
  - If false, disables validation on focus-out.
- **html**: boolean (default: false)
  - If true, applies HTML when binding data.
- **addTop**: boolean (default: false)
  - If true, adds new rows to the top when calling add().
- **resizable**: boolean (default: false)
  - If true, columns can be resized.
- **vResizable**: boolean (default: false)
  - If true, grid body height can be resized.
- **sortable**: boolean (default: false)
  - If true, enables sorting by column.
- **filter**: boolean (default: false)
  - If true, enables filtering by column.
- **windowScrollLock**: boolean (default: true)
  - If true, disables window scroll when scrolling the grid.
- **revert**: boolean (default: false)
  - If true, enables revert functionality.
- **select**: boolean (default: false)
  - If true, enables row selection.
- **unselect**: boolean (default: true)
  - If false, disables unselecting a selected row.
- **multiselect**: boolean (default: false)
  - If true, enables multi-row selection.
- **checkAll, checkAllTarget, checkSingleTarget**: string (default: null)
  - For checkbox selection.
- **hover**: boolean (default: false)
  - If true, adds a hover class to rows on mouse over.
- **createRowDelay**: number (default: 1)
  - Delay (ms) between row creation during binding.
- **scrollPaging.size**: number (default: 100)
  - Number of rows to bind at once during scroll paging.
- **fRules, vRules**: object (default: null)
  - Format and validation rules as objects.
- **addSelect, addScroll, selectScroll, checkScroll, validateScroll, appendScroll**: boolean
  - Various scroll and selection behaviors.
- **tpBind**: boolean (default: false)
  - Prevents event conflicts before initialization.
- **pastiable**: boolean (default: false)
  - Enables Excel-style paste.

## Declarative Options

You can specify options directly on elements using data-* attributes.

- data-format: Specifies format rules.

  <input id="age" type="text" data-format='[["trimToEmpty"], ["date", 8, "date"]]'>

- data-validate: Specifies validation rules.

  <input id="age" type="text" data-validate='[["required"], ["integer"]]'>

- data-filter: Enables filter for a column.

  <th data-filter="true"></th>

- data-rowspan: Enables row merging for a column.

  <th data-rowspan="true"></th>

## Methods

- **bind(data, append)**: Binds data to the context element. If "append" is specified, appends data.
- **data(flag)**: Returns data bound to the component. Flags: "modified", "insert", "update", "delete", "selected", "checked", undefined (all), false (jQuery object).
- **add(idx, data)**: Adds an empty row. Optionally specify index and data.
- **remove(idx)**: Removes the row(s) at the specified index(es).
- **select(idx, isAdd)**: Selects the row(s) at the specified index(es). If isAdd is true, adds to selection.
- **check(idx, isAdd)**: Checks the row(s) at the specified index(es). If isAdd is true, adds to checked rows.
- **val(idx, key, val)**: Gets or sets the value of a column in the specified row.
- **revert(idx)**: Reverts changes for the specified row or all rows.
- **hide(idx)**: Hides the specified column.
- **show(idx)**: Shows the specified column.
- **move(fromIdx, toIdx)**: Moves a row from one index to another.
- **copy(fromIdx, toIdx)**: Copies a row from one index to another.
- **validate(idx)**: Validates input data for the specified row or all rows.

## Events

- **rowHandlerBeforeBind**: Called before data is bound to a row.
- **rowHandler**: Called after data is bound to a row.
- **onBeforeSelect**: Called before a row is selected. Return false to prevent selection.
- **onSelect**: Called after a row is selected.
- **onBind**: Called after data binding is complete.

## Examples

### 1. Basic Grid Creation

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

### 2. Fixed Header Grid (height option)

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

### 3. Sorting and Filtering

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

### 4. Row Selection Event

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
