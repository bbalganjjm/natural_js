# Examples

This document provides practical examples of how to use the Formatter component in Natural-JS applications. These examples cover various formatting scenarios and implementation approaches.

## 1. Declaring Format Rules in HTML Elements

You can declare format rules directly in HTML elements using the `data-format` attribute. This is particularly useful when working with forms or data displays.

### For Input Elements

```html
<input id="startDate" type="text" data-format='[["date", 8]]'>
```

When declared on an input element as shown above, formatting is applied when focus leaves the element and is removed when the element is focused again. This allows users to edit the raw value while maintaining a formatted display.

### For Non-Input Elements

```html
<span id="startDate" data-format='[["date", 8]]'></span>
```

When format rules are declared on a non-input element, the formatted value is set as the element's text content.

> **Note**: The Formatter does not bind formatted values to elements in UI components like N.grid or N.form; it only formats the displayed values while keeping the original input data unchanged. Therefore, there is no need to unformat the data when sending it to the server.

## 2. Using the N.formatter Library Directly

You can use the N.formatter library methods directly to format strings programmatically.

```javascript
// N.formatter.{rule}("String to format", ...arguments);

N.formatter.limit("abcdefghijklmn", [12, "..."]); // Returns: 'abcdefghijkl...'
```

In this example, the `limit` rule is applied to truncate the string to 12 characters and append "..." at the end.

## 3. Triggering Formatter Events Manually

When you specify an input element for the Formatter, it generates "format" and "unformat" events on the input element. These events can be directly triggered using jQuery's trigger method.

```javascript
// Unformat an element (show raw value)
N("input[name='targetEle']").trigger("unformat");

// Format an element (show formatted value)
N("input[name='targetEle']").trigger("format");
```

## 4. Dynamically Changing Format Rules

You can dynamically change and immediately apply format rules to elements:

```javascript
N("selector").data("format", [["trimtoempty"]]).trigger("format");
```

> **Important**: For this code to function properly, at least one format rule must be declared in the data-format attribute of the target element before binding data to the component.

## 5. Complex Formatting Example

This example demonstrates applying multiple format rules to different properties in a dataset:

```javascript
// Sample data
var data = [
    {
        id: 1,
        amount: 12345.678,
        created: "20250601",
        description: "This is a very long description that needs to be truncated"
    }
];

// Create formatter with multiple rules
var formatted = new N.formatter(data, {
    "amount": [["trimtoempty"], ["numeric", "#,###.##"]],
    "created": [["date", 8, "yyyy-MM-dd"]],
    "description": [["limit", 20, "..."]]
}).format();

console.log(formatted);
// Output:
// [{
//   "id": 1,
//   "amount": "12,345.68",
//   "created": "2025-06-01",
//   "description": "This is a very long..."
// }]
```

## 6. Working with Form Elements

This example shows how to apply formatting to a form:

```html
<form id="userForm">
    <div>
        <label for="phone">Phone Number:</label>
        <input id="phone" name="phone" type="text" data-format='[["phone"]]'>
    </div>
    <div>
        <label for="amount">Amount:</label>
        <input id="amount" name="amount" type="text" data-format='[["numeric", "#,###.##"]]'>
    </div>
</form>

<script>
N("#userForm").on("submit", function(e) {
    e.preventDefault();
    
    // The form values are automatically in their original (unformatted) state
    // when accessing them through form elements
    var formData = {
        phone: N("#phone").val(),
        amount: N("#amount").val()
    };
    
    // Send formData to server...
});
</script>
```

In this example, users see formatted values in the form fields, but when submitting the form, the original unformatted values are used.

For a complete list of available format rules, please refer to the [Format Rule List](formatter-format-rule-list.md) documentation.
