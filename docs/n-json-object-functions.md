# Functions of N.json Object

N.json is a collection object of utility functions related to json object.

You can use like "N.json.{function name}(arg[0...N])"

## N.json.mergeJsonArray

**Return**: json object array

It merges two arrays containing json object.

Merges the arr2 argument based on the arr1 argument and excludes duplicated elements.

If the object property name is specified as the third argument, duplicate elements are excluded based on the property.

Memory references are not changed even if the object specified by the arr1 argument is merged.

### Parameters

#### arr1

**Type**: json object array

Inputs the original json object array.

#### arr2

**Type**: json object array

Inputs the json object array to be merged.

#### key

**Type**: string

Inputs the name of the base property to be merged (not a required argument).

## N.json.format

**Return**: string

Formats the json object beautifully.

### Parameters

#### obj

**Type**: json object array | json object

Inputs the json object or the array in which the json object is stored.

#### indent

**Type**: number

Inputs the number of spaces to be indented.
