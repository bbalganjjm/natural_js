# Functions

The Formatter component provides methods to apply formatting rules to data and to revert formatting back to original values. This document outlines the available functions in the N.formatter object.

## Available Methods

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| format | N/A | N/A | array[object] | Executes the formatting process. |
| | row | number | N/A | Row index of the data list to be formatted. |
| unformat | N/A | N/A | array[object] | Replaces or returns the original data. |
| | row | number | N/A | Index of the row to unformat in the data list. |
| | key | string | N/A | Name of the column property to be unformatted in the row data. |

## format()

The `format()` method applies formatting rules to the data and returns the formatted data.

### Behavior Based on Rule Specification

- **When specifying rules as object options**: Returns a formatted data list object.
- **When specifying a context element containing elements with data-format attributes**: Shows the formatted data values in the specified elements.

### The `row` Parameter

If the `row` parameter is not set:
- **When specifying rules as object options**: All row data will be formatted.
- **When specifying a context element**: It is automatically set to the first row index (0).

### Return Value Format

When specifying rules as object options, it returns data in the following form:

```javascript
[{
    "Column property name": "Formatted data value"
}]
```

### Example

```javascript
// Format all rows in the data set
var formattedData = new N.formatter(data, {
    "numeric": [["numeric", "#,###.##"]]
}).format();

// Format only the second row (index 1)
var formattedRow = new N.formatter(data, {
    "numeric": [["numeric", "#,###.##"]]
}).format(1);
```

## unformat()

The `unformat()` method reverts formatted data back to its original values.

### Parameters

- **row**: Specifies which row to unformat. If not provided, all rows will be unformatted.
- **key**: Specifies which column to unformat. If not provided, all columns will be unformatted.

### Example

```javascript
// Create a formatter instance
var formatter = new N.formatter(data, {
    "numeric": [["numeric", "#,###.##"]],
    "date": [["date", 8]]
});

// Format the data
var formattedData = formatter.format();

// Later, unformat all data
var originalData = formatter.unformat();

// Or, unformat only the "numeric" column in row 2
formatter.unformat(2, "numeric");
```

## Working with DOM Elements

When working with HTML elements that have data-format attributes, the format and unformat operations are automatically applied when the element gains or loses focus. However, you can also trigger these events manually:

```javascript
// Trigger unformat event on an element
N("input[name='targetEle']").trigger("unformat");

// Trigger format event on an element
N("input[name='targetEle']").trigger("format");
```

This is particularly useful when you need to programmatically update the formatting of elements without changing focus.
