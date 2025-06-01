# Functions of N.array Object

N.array is a collection object of utility functions related to array.

You can use like "N.array.{function name}(arg[0...N])"

## N.array.deduplicate

**Return**: array

Removes duplicate elements from array.

If an object is contained in the array, inputting the object's property name as the second argument removes the duplicated object based on the input property.

### Parameters

#### arr

**Type**: array

Inputs the array to deduplicate.

#### key

**Type**: string

If an object is stored in the array, inputs the base property name for remove the duplicate elements.
