# Overview

Formatter (N.formatter) is a library that formats the input data set (JSON object array) and returns the formatted data set.

* If you enter an element that wraps the elements in which the format rules are declared with the data-format attribute instead of the rule set, it will display a formatted string on that element.
* In this case, if the element is one that inputs text, it displays the string of the original data when the cursor is focused, and the formatted string when the focus is out.
* You can also format in strings, not just in datasets.

## Purpose of Formatter

The Formatter library in Natural-JS provides a structured way to:

1. Transform raw data into user-friendly formats (e.g., formatting dates, numbers, currency)
2. Apply consistent formatting rules across the application
3. Automatically handle display formatting while preserving original data values
4. Support both dataset-level and individual string-level formatting

## How Formatter Works

The Formatter works by applying predefined format rules to data. These format rules can be specified in two ways:

1. **Ruleset Object**: Passed directly to the formatter function
2. **data-format Attributes**: Declared in HTML elements

When formatting is applied, the library processes the input data according to the specified rules and returns the formatted result. For form elements, it maintains the original value internally while displaying the formatted value to the user.

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│    Raw Data     │ ──────► │    Formatter    │ ──────► │ Formatted Data  │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │  Format Rules   │
                            │                 │
                            └─────────────────┘
```

## Key Features

### Dataset Formatting

The Formatter can process entire datasets (arrays of objects), applying format rules to specified properties. This is particularly useful for formatting tabular data or collections of records.

### Element-Based Formatting

When used with HTML elements, the Formatter can automatically:
- Format values based on data-format attributes
- Toggle between formatted and raw values for input elements on focus
- Update display values while preserving original data

### String Formatting

Beyond datasets and elements, the Formatter also provides functions for formatting individual string values according to specific format rules.

## Integration with Natural-JS

The Formatter is designed to work seamlessly with other Natural-JS components:

- It can be used to format data retrieved via the **Communicator** component
- It integrates with the **Validator** component for form validation
- It can be applied to data displayed in **UI** components

This integration allows for a consistent approach to data formatting throughout Natural-JS applications.
