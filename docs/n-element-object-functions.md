# Functions of N.element Object

N.element is a collection object of utility functions related to HTML elements.

You can use like "N.element.{function name}(arg[0...N])"

## N.element.toData

**Return**: object

Creates a JSON object with the id and value attribute values of the specified input elements.

Used to create initial data in the add method of N.form.

### Parameters

#### eles

**Type**: jQuery object

Inputs jQuery object with only input elements selected.

**Example**:
```javascript
// Converts the value of input element in #box element to json data
var data = N.element.toData($("#box").find(":input"));
```

## N.element.maxZindex

**Return**: number

Returns the highest z-index value among the specified elements.

### Parameters

#### ele

**Type**: jQuery object

Inputs the target elements with jQuery object.

If not input, specifies the $("div, span, ul, p, nav, article, section") to default.

**Example**:
```javascript
var maxZindex = N.element.maxZindex($("div"));
```
