# Constructor

The Validator component in Natural-JS provides functionality to validate data according to specified rules. This document explains how to create and initialize a Validator instance.

## N.validator Constructor

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| N.validator | N/A | N/A | N.validator | Creates an N.validator instance. |
| | data | array[object] | N/A | Specifies the data to be validated. |
| | rules\|context | object\|jQuery object | N/A | Specifies the validation rules. |

## Creating a Validator Instance

You can create a Validator instance in two ways:

### Using the Constructor

```javascript
var validator = new N.validator(data, rules|context);
```

### Using jQuery Plugin Method

```javascript
var validator = N(data).validator(rules|context);
```

The method of creating object instances is different, but the instance created with `new N.validator()` and the instance created with `N().validator` are the same. The first argument of the N() function is set as the first argument of the new N.validator constructor.

## Specifying Validation Rules

Validation rules can be specified in two ways:

### 1. As Object Options

```javascript
// { "Column property name" : [["Rule name", arguments[0], arguments[1]... ]] }
new N.validator(data, {
    "numeric" : [["required"], ["integer+commas"]],
    "generic" : [["required"], ["korean"]],
    "limit" : [["required"], ["alphabet"]]
}).validate();
```

### 2. Via HTML Elements with data-validate Attributes

```html
<div class="validator-context">
    <!-- [ ["Rule name", "arguments[0]", "arguments[1]"], ... ] -->
    <input id="numeric" type="text" data-validate='[["required"], ["integer+commas"]]'/>
</div>
```

```javascript
N.validator(data, N(".validator-context", view)).validate();
```

## Dynamically Changing Validation Rules

To change the validation rule dynamically when you have specified the validation rule declaratively, you can specify the validation rule again in the "validate" data attribute value of the corresponding input element:

```javascript
N("#numeric").data("validate", [["required"], ["integer"]])
```

This will update the validation rule associated with the element and apply it the next time validation is triggered.
