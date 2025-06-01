# Constructor

The Formatter component in Natural-JS provides functionality to format data according to specified rules. This document explains how to create and initialize a Formatter instance.

## N.formatter Constructor

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| N.formatter | N/A | N/A | N.formatter | Creates an N.formatter instance. |
| | data | array[object] | N/A | Specifies the data to be formatted. |
| | rules\|context | object\|jQuery object | N/A | Specifies the format rules. |

## Creating a Formatter Instance

You can create a Formatter instance in two ways:

### Using the Constructor

```javascript
var formatter = new N.formatter(data, rules|context);
```

### Using jQuery Plugin Method

```javascript
var formatter = N(data).formatter(rules|context);
```

The method of creating object instances is different, but the instance created with `new N.formatter()` and the instance created with `N().formatter` are the same. The first argument of the N() function is set as the first argument of the new N.formatter constructor.

## Specifying Format Rules

Format rules can be specified in two ways:

### 1. As Object Options

```javascript
// { "Column property name" : [["Rule name", arguments[0], arguments[1]... ]] }
new N.formatter(data, {
    "numeric" : [["trimtoempty"], ["numeric", "#,###.##0000"]],
    "generic" : [["trimtoempty"], ["generic", "@@ABCD"]],
    "limit" : [["trimtoempty"], ["limit", "13", "..."]],
    "etc" : [["date", 12]]
}).format();
```

### 2. Via HTML Elements with data-format Attributes

```html
<div class="formatter-context">
    <!-- [ ["Rule name", "arguments[0]", "arguments[1]"], ... ] -->
    <input id="limit" type="text" data-format='[["trimtoempty"], ["limit", "13", "..." ]]' />
</div>
```

```javascript
N.formatter(data, N(".formatter-context", view)).format();
```

## Dynamically Changing Format Rules

To change the format rule dynamically when you have specified the format rule declaratively, you can specify the format rule again in the "format" data attribute value of the corresponding input element:

```javascript
N("#limit").data("format", [["trimtoempty"]])
```

This will update the format rule associated with the element and apply it the next time formatting is triggered.
