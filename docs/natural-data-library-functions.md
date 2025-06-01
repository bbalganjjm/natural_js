# Functions

The Natural-DATA library provides powerful functions for manipulating JSON object arrays. This document outlines the available functions and their usage.

## Available Methods

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| N.data.filter | N/A | N/A | json object array | Extract data matching specified conditions. |
| | data | json object array | N/A | Data to be filtered |
| | condition | function\|string | N/A | Specifies filtering conditions. |
| N.data.sort | N/A | N/A | json object array | Sorts data based on the specified "key" argument value. |
| | data | json object array | N/A | Data to be sorted |
| | key | string | N/A | Property name of the object to be sorted by |
| | reverse | boolean | N/A | If set to true, it is sorted in descending order. |
| N(data).datafilter | N/A | N/A | jQuery object[json object] | Executes the N.data.filter function using the jQuery plugin method. |
| | condition | function\|string | N/A | Same as the condition argument of N.data.filter. |
| N(data).datasort | N/A | N/A | jQuery object[json object] | Executes the N.data.sort function using the jQuery plugin method. |
| | key | string | N/A | Same as the key argument of N.data.sort. |
| | reverse | boolean | N/A | Same as the reverse argument of N.data.sort. |

## N.data.filter

The `N.data.filter` function extracts data from a JSON object array that matches specified conditions.

### Using a Function Condition

When a function is specified as the condition, only rows that return true in the function are included in the filtered result:

```javascript
var data = [
    { name: "John", age: 18 },
    { name: "Mike", age: 16 },
    { name: "Mike", age: 14 }
];

var filteredData = N.data.filter(data, function(item) {
    return item.name === "Mike" && item.age === 16;
});

console.log(filteredData); // [{ name: "Mike", age: 16 }]
```

### Using a String Condition

When a condition string is specified, only rows matching the condition are included in the filtered result:

```javascript
var data = [
    { name: "John", age: 18 },
    { name: "Mike", age: 16 },
    { name: "Mike", age: 14 }
];

var filteredData = N.data.filter(data, 'name === "Mike"');

console.log(filteredData); // [{ name: "Mike", age: 16 }, { name: "Mike", age: 14 }]
```

> **Note**: It is faster to handle conditions with functions than to specify conditions with strings. The method of specifying a condition as a string does not support the expressions of and(&&) and or(||), but only a single conditional expression.

## N.data.sort

The `N.data.sort` function sorts a JSON object array based on a specified property.

```javascript
var data = [
    { name: "John", age: 18 },
    { name: "Mike", age: 16 },
    { name: "Alex", age: 20 }
];

// Sort by name (ascending)
var sortedByName = N.data.sort(data, "name");
console.log(sortedByName);
// [{ name: "Alex", age: 20 }, { name: "John", age: 18 }, { name: "Mike", age: 16 }]

// Sort by age (descending)
var sortedByAgeDesc = N.data.sort(data, "age", true);
console.log(sortedByAgeDesc);
// [{ name: "Alex", age: 20 }, { name: "John", age: 18 }, { name: "Mike", age: 16 }]
```

## jQuery Plugin Methods

### N(data).datafilter

The `N(data).datafilter` method is a jQuery plugin version of `N.data.filter`:

```javascript
var data = [
    { name: "John", age: 18 },
    { name: "Mike", age: 16 },
    { name: "Mike", age: 14 }
];

var filteredData = N(data).datafilter(function(item) {
    return item.age > 15;
});

console.log(filteredData); // [{ name: "John", age: 18 }, { name: "Mike", age: 16 }]
```

### N(data).datasort

The `N(data).datasort` method is a jQuery plugin version of `N.data.sort`:

```javascript
var data = [
    { name: "John", age: 18 },
    { name: "Mike", age: 16 },
    { name: "Alex", age: 20 }
];

var sortedData = N(data).datasort("name");
console.log(sortedData);
// [{ name: "Alex", age: 20 }, { name: "John", age: 18 }, { name: "Mike", age: 16 }]
```

## Advanced Usage Examples

### Combining Filter and Sort

You can chain filter and sort operations to create more complex data transformations:

```javascript
var data = [
    { name: "John", age: 18, active: true },
    { name: "Mike", age: 16, active: false },
    { name: "Alex", age: 20, active: true },
    { name: "Sarah", age: 17, active: true }
];

// Filter for active users and sort by age (descending)
var result = N.data.sort(
    N.data.filter(data, function(item) {
        return item.active === true;
    }), 
    "age", 
    true
);

console.log(result);
// [{ name: "Alex", age: 20, active: true }, 
//  { name: "John", age: 18, active: true }, 
//  { name: "Sarah", age: 17, active: true }]
```

### Using jQuery Plugin Chaining

```javascript
var data = [
    { name: "John", age: 18, active: true },
    { name: "Mike", age: 16, active: false },
    { name: "Alex", age: 20, active: true },
    { name: "Sarah", age: 17, active: true }
];

// Chain jQuery plugin methods
var result = N(data)
    .datafilter(function(item) {
        return item.active === true;
    })
    .datasort("name");

console.log(result);
// [{ name: "Alex", age: 20, active: true }, 
//  { name: "John", age: 18, active: true }, 
//  { name: "Sarah", age: 17, active: true }]
```

## Performance Considerations

- Using function conditions is more efficient than string conditions for filtering
- For large datasets, consider filtering before sorting to reduce the number of items that need to be sorted
- When chaining multiple operations, be mindful of the performance impact on large datasets
