# Functions of N.string Object

N.string is a collection object of utility functions related to strings.

You can use like "N.string.{function name}(arg[0...N])"

## N.string.contains

**Return**: boolean

Returns true if the input string is contained.

### Parameters

#### context

**Type**: string

Inputs the target string to be checked.

#### str

**Type**: string

Inputs the string to check.

## N.string.endsWith

**Return**: boolean

Returns true if it ends with the input string.

### Parameters

#### context

**Type**: string

Inputs the target string to be checked.

#### str

**Type**: string

Inputs the string to check.

## N.string.startsWith

**Return**: boolean

Returns true if it starts with the input string.

### Parameters

#### context

**Type**: string

Inputs the target string to be checked.

#### str

**Type**: string

Inputs the string to check.

## N.string.insertAt

**Return**: string

Inserts the input string at the wanted position in the string.

### Parameters

#### context

**Type**: string

Inputs the target string to be inserted.

#### idx

**Type**: number

Inputs the position(index) to insert the string.

#### str

**Type**: string

Inputs the string to insert.

## N.string.removeWhitespace

**Return**: string

Removes all spaces in the string.

### Parameters

#### str

**Type**: string

Inputs the target string to remove spaces.

## N.string.lpad

**Return**: string

Fill in from the left with the input character by the input length.

### Parameters

#### context

**Type**: string

Inputs the target string.

#### length

**Type**: number

Inputs the length to fill.

#### str

**Type**: string

Inputs character length to fill.

## N.string.rpad

**Return**: string

Fill in from the right with the input character by the input length.

### Parameters

#### context

**Type**: string

Inputs the target string.

#### length

**Type**: number

Inputs the length to fill.

#### str

**Type**: string

Inputs character length to fill.

## N.string.byteLength

**Return**: string

Returns the byte length of the input string.

> It is not the exact length of bytes, but the length of bytes such as Korean or Chinese characters handled by DBMS is calculated as 3 bytes(UTF-8), and English characters and numbers are calculated as 1 byte.
>
> If the byte length, such as Hangul or Hanja, is not 3 bytes, you can change the value of the N.context.attr("core").charByteLength property of Config(natural.config.js).

### Parameters

#### str

**Type**: string

Inputs the string to check the length.

## N.string.isEmpty

**Return**: string

Checks for null, undefined, or empty string("").

### Parameters

#### str

**Type**: string

Inputs the string to check.

## N.string.trim

**Return**: string

If a string is input, leading and trailing whitespace is removed from the input string, and if null or undefined is input, an empty string("") is returned.

> N.string.trim uses String.prototype.trim method as it is.

### Parameters

#### str

**Type**: string|null|undefined

Inputs the target string to trim.

## N.string.trimToEmpty

**Return**: string

If a string is input, leading and trailing whitespace is removed from the input string, and if null or undefined is input, an empty string("") is returned.

> N.string.trim uses String.prototype.trim method as it is.

### Parameters

#### str

**Type**: string|null|undefined

Inputs the target string to trim.

## N.string.trimToNull

**Return**: string|null

If a string is input, leading and trailing whitespace is removed from the input string, and if null or undefined is input, a null is returned.

### Parameters

#### str

**Type**: string|null|undefined

Inputs the target string to trim.

## N.string.trimToUndefined

**Return**: string|undefined

If a string is input, leading and trailing whitespace is removed from the input string, and if null or undefined is input, a undefined is returned.

### Parameters

#### str

**Type**: string|null|undefined

Inputs the target string to trim.

## N.string.trimToZero

**Return**: string

If a string is input, leading and trailing whitespace is removed from the input string, and if null or undefined is input, a "0" string is returned.

### Parameters

#### str

**Type**: string|null|undefined

Inputs the target string to trim.

## N.string.trimToVal

**Return**: string

If a string is input, leading and trailing whitespace is removed from the input string, and if null or undefined is input, a val(arguments[1]) argument's value is returned.

### Parameters

#### str

**Type**: string|null|undefined

Inputs the target string to trim.

#### val

**Type**: string

Inputs the string to be returned.
