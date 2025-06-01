# Functions

The Validator component provides methods to validate data against specified rules. This document outlines the available functions in the N.validator object.

## Available Methods

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| validate | N/A | N/A | array[object[array[object]]] | Executes the validation. |
| | row | number | N/A | Row index of the data list to be validated. |

## validate()

The `validate()` method applies validation rules to the data and returns the validation result.

### Behavior Based on Rule Specification

- **When specifying rules as object options**: Returns a validated data list object.
- **When specifying a context element containing elements with data-validate attributes**: Shows the validated data values in the specified elements and displays error messages as tooltips for invalid data.

### The `row` Parameter

If the `row` parameter is not set:
- **When specifying rules as object options**: All row data will be validated.
- **When specifying a context element**: It is automatically set to the first row index (0).

### Return Value Format

When specifying rules as object options, it returns data in the following form:

```javascript
[{
    "Column property name": [
        {
            "Verification rule": "rule",
            "Whether the verification succeeded": true|false,
            "Verification message": "Message"
        }
    ]
}]
```

> **Note**: The validation message can be set in the N.context.attr("data").validator.message property of the Config (natural.config.js).

### Example

```javascript
// Validate all rows in the data set
var validationResult = new N.validator(data, {
    "numeric": [["required"], ["integer+commas"]],
    "generic": [["required"], ["korean"]]
}).validate();

// Validate only the second row (index 1)
var rowValidationResult = new N.validator(data, {
    "numeric": [["required"], ["integer+commas"]],
    "generic": [["required"], ["korean"]]
}).validate(1);
```

## Working with DOM Elements

When working with HTML elements that have data-validate attributes, validation is automatically applied when the element loses focus. However, you can also trigger validation manually:

```javascript
// Trigger validate event on an element
N("input[name='targetEle']").trigger("validate");
```

This is particularly useful when you need to programmatically validate elements without changing focus.

## Customizing Error Messages

You can customize error messages for validation rules by configuring them in the Natural-JS configuration:

```javascript
// In natural.config.js
N.context.attr("data").validator.message = {
    required: "This field is required.",
    integer: "Please enter only integers.",
    email: "Please enter a valid email address."
    // Add custom messages for other rules
};
```

These custom messages will be used when displaying validation errors to users.

## Using Multiple Validation Rules

You can apply multiple validation rules to a single field. Rules are checked in sequence, and validation stops at the first rule that fails:

```javascript
// First check if required, then check if it's a valid email
var rules = [["required"], ["email"]];
```

This ensures comprehensive validation of user input according to multiple criteria.
