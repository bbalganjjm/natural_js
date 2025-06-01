# Overview

Validator (N.validator) is a library that validates the input data set (JSON object array) and returns a validation result data set.

* If you enter an element that wraps the input elements with validation rules declared in the data-validate attribute instead of the rule set, when the cursor of an input element loses focus, the value entered in that element is validated. If validation fails, an error message is displayed as a tooltip near the input element.
* You can also validate individual strings, not just datasets.

## Purpose of Validator

The Validator library in Natural-JS provides a structured way to:

1. Ensure data integrity by validating input values against predefined rules
2. Apply consistent validation standards across the application
3. Provide immediate feedback to users when input validation fails
4. Support both server-side and client-side validation scenarios

## How Validator Works

The Validator works by applying predefined validation rules to data. These validation rules can be specified in two ways:

1. **Ruleset Object**: Passed directly to the validator function
2. **data-validate Attributes**: Declared in HTML input elements

When validation is applied, the library processes the input data according to the specified rules and returns the validation result. For form elements, it provides visual feedback when validation fails, helping users understand what corrections are needed.

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│    Input Data   │ ──────► │    Validator    │ ──────► │ Validation      │
│                 │         │                 │         │ Results         │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │ Validation Rules│
                            │                 │
                            └─────────────────┘
```

## Key Features

### Dataset Validation

The Validator can process entire datasets (arrays of objects), applying validation rules to specified properties. This is particularly useful for validating form submissions or imported data.

### Element-Based Validation

When used with HTML elements, the Validator can automatically:
- Validate values based on data-validate attributes
- Display error messages as tooltips when validation fails
- Trigger validation on focus-out events

### String Validation

Beyond datasets and elements, the Validator also provides functions for validating individual string values according to specific validation rules.

## Integration with Natural-JS

The Validator is designed to work seamlessly with other Natural-JS components:

- It can validate data before submission via the **Communicator** component
- It works alongside the **Formatter** component for complete data handling
- It can be applied to data entered in **UI** components

This integration allows for a consistent approach to data validation throughout Natural-JS applications.

## Validation Process Flow

1. User enters data into a form field
2. When the field loses focus, validation rules are applied
3. If validation passes, the form proceeds normally
4. If validation fails, an error message is displayed
5. The user can correct the input and try again

This real-time validation approach improves user experience by providing immediate feedback rather than waiting for form submission.
