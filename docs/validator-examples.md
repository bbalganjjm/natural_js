# Examples

This document provides practical examples of how to use the Validator component in Natural-JS applications. These examples cover various validation scenarios and implementation approaches.

## 1. Declaring Validation Rules in HTML Elements

You can declare validation rules directly in HTML elements using the `data-validate` attribute. This is particularly useful when working with forms.

```html
<input id="col01" type="text" data-validate='[["required"]]'>
```

When declared on an input element as shown above, validation is executed when the focus leaves the element. If validation fails, the reason for the failure is displayed as a tooltip next to the input element.

## 2. Using the N.validator Library Directly

You can use the N.validator library methods directly to validate strings programmatically.

```javascript
// N.validator.{rule}("String to validate", ...arguments);

// Check if value is between 1 and 9
N.validator.rangevalue("Validation string", [1, 9]); // Returns: false
```

In this example, the `rangevalue` rule is applied to check if the value is within the specified range.

## 3. Triggering Validator Events Manually

When you specify an input element for the Validator, it generates a "validate" event on that input element. This event can be directly triggered using jQuery's trigger method.

```javascript
// Trigger validation on an element
N("input[name='targetEle']").trigger("validate");
```

## 4. Dynamically Changing Validation Rules

You can dynamically change and immediately apply validation rules to elements:

```javascript
N("selector").data("validate", [["required"]]).trigger("validate");
```

> **Important**: For this code to function properly, at least one validation rule must be declared using the data-validate attribute on the target element before binding data to the component.

## 5. Complex Validation Example

This example demonstrates applying multiple validation rules to different properties in a dataset:

```javascript
// Sample data
var data = [
    {
        id: 1,
        email: "user@example.com",
        phone: "0101234567",
        age: 25
    }
];

// Create validator with multiple rules
var validationResult = new N.validator(data, {
    "email": [["required"], ["email"]],
    "phone": [["required"], ["phone"]],
    "age": [["required"], ["rangevalue", 18, 65]]
}).validate();

console.log(validationResult);
// Output format:
// [{
//   "email": [
//     { "rule": "required", "success": true, "message": "" },
//     { "rule": "email", "success": true, "message": "" }
//   ],
//   "phone": [
//     { "rule": "required", "success": true, "message": "" },
//     { "rule": "phone", "success": false, "message": "Please enter a valid phone number." }
//   ],
//   "age": [
//     { "rule": "required", "success": true, "message": "" },
//     { "rule": "rangevalue", "success": true, "message": "" }
//   ]
// }]
```

## 6. Working with Form Validation

This example shows how to validate a form before submission:

```html
<form id="registrationForm">
    <div>
        <label for="email">Email:</label>
        <input id="email" name="email" type="text" data-validate='[["required"], ["email"]]'>
    </div>
    <div>
        <label for="password">Password:</label>
        <input id="password" name="password" type="password" data-validate='[["required"], ["minlength", 8]]'>
    </div>
    <button type="submit">Register</button>
</form>

<script>
N("#registrationForm").on("submit", function(e) {
    e.preventDefault();
    
    // Get form elements
    var formElements = N(this).find("[data-validate]");
    
    // Trigger validation on all elements
    formElements.trigger("validate");
    
    // Check if any validation failed
    var hasErrors = formElements.filter(function() {
        return N(this).data("validate-error") === true;
    }).length > 0;
    
    if (!hasErrors) {
        // Submit the form or process data
        console.log("Form is valid, proceeding with submission");
    } else {
        console.log("Form contains errors, please correct them");
    }
});
</script>
```

## 7. Custom Validation Function

You can also create a custom validation function for complex validation scenarios:

```javascript
// Define a custom validation function
N.validator.customPasswordValidation = function(value) {
    // Password must contain at least one uppercase letter, one lowercase letter,
    // one number, and be at least 8 characters long
    var hasUpperCase = /[A-Z]/.test(value);
    var hasLowerCase = /[a-z]/.test(value);
    var hasNumbers = /\d/.test(value);
    var hasMinLength = value.length >= 8;
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasMinLength;
};

// Use the custom validation
N("#password").data("validate", [["required"], ["customPasswordValidation"]]);
```

For a complete list of available validation rules, please refer to the [Validation Rule List](validator-validation-rule-list.md) documentation.
