# Functions of N.date Object

N.date is a collection object of utility functions related to date control.

You can use like "N.date.{function name}(arg[0...N])"

## N.date.diff

**Return**: string

Returns the difference in days between two input dates.

### Parameters

#### refDateStr

**Type**: string

Inputs the base date as an 8-digit date string (YYYYmmdd).

#### targetDateStr

**Type**: string

Inputs the date to be calculated as an 8-digit date string (YYYYmmdd).

## N.date.strToDateStrArr

**Return**: array

Creates an array type date object [year(number|string), month(number|string), day(number|string)] based on the input date string and input date format.

### Parameters

#### str

**Type**: string

Inputs the date string.

#### format

**Type**: string

Inputs the format (required input) of the date string.

- Y : year
- m : month
- d : day
- Ex) "19991231" : "Ymd"
- Ex) "3112" : "dm"
- Ex) "12311999" : "mdY"

#### isString

**Type**: boolean

If input is true, stores the date in the resulting array object as a string type, not as a number type.

## N.date.strToDate

**Return**: object

Converts the input date/time string to a date object and stores it in the object's properties to return. The properties of the returned object are:

```javascript
{
    obj : date object,
    format : Date format string
}
```

### Parameters

#### str

**Type**: string

Inputs the date + time string.

- "19991231" : "1999-12-31 00:00:00"
- "1999123103" : "1999-12-31 03:00:00"
- "199912310348" : "1999-12-31 03:48:00"
- "19991231034856" : "1999-12-31 03:48:56"

#### format

**Type**: string

Inputs the format (required input) of the date string.

- Y : year
- m : month
- d : day
- H : hour
- i : minute
- s : second
- Ex) "19991231" : "Ymd"
- Ex) "3112" : "dm"
- Ex) "12311999" : "mdY"
- Ex) "19991231120159" : "YmdHis"

If the format argument is not input, it is automatically set as follows according to the length of the input date string:

- 4-digit : "Y"
- 6-digit : "Y-m"
- 8-digit : "Y-m-d"
- 10-digit : "Y-m-d H"
- 12-digit : "Y-m-d H:i"
- 14-digit : "Y-m-d H:i:s"

Characters that separate date and time, such as dash(-) and colon(:), are defined as functions of N.context.attr("data").formatter.date object of Config(natural.config.js). The date/time separator can be changed to the return string of the corresponding function.

## N.date.format

**Return**: string

Formats the input date + time string based on the input date format.

### Parameters

#### str

**Type**: string

Inputs the date + time string.

#### format

**Type**: string

Inputs the format (required input) of the date string.

- Y : year
- m : month
- d : day
- H : hour
- i : minute
- s : second

**Example**:
```javascript
N.date.format("19991231120159", "Y-m-d H:i:s") // "1999-12-31 12:01:59"
N.date.format("19991231120159", "Y/m/d H:i:s") // "1999/12/31 12:01:59"
N.date.format("19991231120159", "Y.m.d H:i") // "1999.12.31 12:01"
N.date.format("19991231120159", N.context.attr("data").formatter.date.YmdHis()) // "1999-12-31 12:01:59"
```

Characters that separate date and time, such as dash(-) and colon(:), are defined as functions of N.context.attr("data").formatter.date object of Config(natural.config.js). The date/time separator can be changed to the return string of the corresponding function.

## N.date.dateToTs

**Return**: number

Convert a date object to a Timestamp.

If no dateObj argument is given, it is converted to the current date and time.

### Parameters

#### dateObj

**Type**: date object

Inputs the date object to be converted to Timestamp.

## N.date.tsToDate

**Return**: date object

Convert a Timestamp to a date object.

If no tsNum argument is given, it is converted to the current date and time.

### Parameters

#### tsNum

**Type**: number

Inputs the Timestamp to be converted to date object.

## N.date.dateList

**Return**: array[array[date]]

Returns a list of date objects by year + month.

### Parameters

#### year

**Type**: number

Inputs the base year.

#### month

**Type**: number

Inputs the base month.
