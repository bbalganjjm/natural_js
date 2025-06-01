# Natural-DATA Module Developer Guide

The Natural-DATA module is a core module of Natural-JS that provides libraries for data manipulation, validation, formatting, and related operations. This module offers essential tools for efficiently managing data flow between the user interface and the server.

## Table of Contents

- [Natural-DATA Module Developer Guide](#natural-data-module-developer-guide)
  - [Table of Contents](#table-of-contents)
  - [Formatter](#formatter)
    - [Overview](#overview)
    - [Constructor](#constructor)
      - [N.formatter](#nformatter)
      - [N(obj).formatter](#nobjformatter)
    - [Methods](#methods)
      - [format](#format)
      - [unformat](#unformat)
    - [Examples](#examples)
    - [Format Rule List](#format-rule-list)
  - [Validator](#validator)
    - [Overview](#overview-1)
    - [Constructor](#constructor-1)
      - [N.validator](#nvalidator)
      - [N(obj).validator](#nobjvalidator)
    - [Methods](#methods-1)
      - [validate](#validate)
    - [Examples](#examples-1)
    - [Validation Rule List](#validation-rule-list)
  - [Natural-DATA Library](#natural-data-library)
    - [Overview](#overview-2)
    - [Methods](#methods-2)
      - [N.data.filter](#ndatafilter)
      - [N.data.sort](#ndatasort)
      - [N(data).datafilter](#ndatadatafilter)
      - [N(data).datasort](#ndatadatasort)
    - [Usage Examples](#usage-examples)
    - [Advanced Usage](#advanced-usage)

## Formatter

<a name="formatter-overview"></a>
### Overview

Formatter (`N.formatter`) is a library that formats an input data set (array of JSON objects) and returns the formatted data set.

- If you pass a container element that wraps elements with data-format attributes instead of a rule set, the formatted string will be displayed in those elements. For input elements, the original data string is shown when focused, and the formatted string is shown when focus is lost.
- Formatting can also be applied to strings, not just data sets.

<a name="formatter-constructor"></a>
### Constructor

#### N.formatter

Creates an instance of `N.formatter`.

```javascript
var formatter = new N.formatter(data, rules|context);
```

- If you specify rules as an object option:
  - `{ "column property name": [["rule name", arg[0], arg[1]...]] }`
  - Example:
    ```javascript
    new N.formatter(data, {
        "numeric": [["trimtoempty"], ["numeric", "#,###.##0000"]],
        "generic": [["trimtoempty"], ["generic", "@@ABCD"]],
        "limit": [["trimtoempty"], ["limit", "13", "..."]],
        "etc": [["date", 12]]
    }).format();
    ```
- If you specify a jQuery object containing elements with data-format attributes:
  - Example:
    ```html
    <div class="formatter-context">
        <input id="limit" type="text" data-format='[["trimtoempty"], ["limit", "13", "..." ]]' />
    </div>
    ```
    ```javascript
    N.formatter(data, N(".formatter-context", view)).format();
    ```
- To change format rules dynamically:
  - Example:
    ```javascript
    N("#limit").data("format", [["trimtoempty"]])
    ```

#### N(obj).formatter

Creates an N.formatter instance as a jQuery plugin method.

```javascript
var formatter = N(data).formatter(rules|context);
```

The way you create the instance is different, but the instance created by `new N.formatter()` and `N().formatter` are the same. The first argument of the N() function is set as the first argument of the new N.formatter constructor.

<a name="formatter-methods"></a>
### Methods

#### format

Executes formatting.

```javascript
formatter.format(row);
```

- `row` (number): The row index of the data list to format.
- If `row` is not set:
  - If rules are specified as an object option: all rows are formatted.
  - If a jQuery object is specified: the first row index is used automatically.
- When rules are specified as an object option, the returned data is:
  - `[ { "column property name": "formatted data value" } ]`

#### unformat

Replaces or returns the original data.

```javascript
formatter.unformat(row, key);
```

- `row` (number): The row index to unformat.
- `key` (string): The property name to unformat in the row data.

### Examples

- Declare format rules in the data-format attribute of the element before binding data with N.form or N.grid:
  - Example:
    ```html
    <input id="startDate" type="text" data-format='[["date", 8]]'>
    ```
    - The format is applied when the element loses focus, and removed when it gains focus again.
    - For non-input elements:
      ```html
      <span id="startDate" data-format='[["date", 8]]'></span>
      ```
      - The formatted value is set as the element's text.
- Formatter only formats the displayed value in UI components like N.grid or N.form, without changing the original input data. There is no need to unformat data before sending it to the server.

- Using the N.formatter library for formatting:
  - Example:
    ```javascript
    // N.formatter.{rule}("string to format", ...args);
    N.formatter.limit("abcdefghijklmn", [12, "..."]); // 'abcdefghijkl...'
    ```

- Triggering formatter-related events directly:
  - Example:
    ```javascript
    N("input[name='targetEle']").trigger("unformat");
    N("input[name='targetEle']").trigger("format");
    ```

- Dynamically changing format rules and applying immediately:
  - Example:
    ```javascript
    N("selector").data("format", [["trimtoempty"]]).trigger("format");
    ```
    - At least one format rule must be declared in the data-format attribute before binding data to the component.

### Format Rule List

Format rule names are case-insensitive.

- commas: Adds thousand separators (comma) to numbers. Only the integer part is processed if there is a decimal point.
- rrn: Formats as a Korean resident registration number.
- ssn: Formats as a US social security number.
- kbrn: Formats as a Korean business registration number.
- kcn: Formats as a Korean corporate number.
- upper: Converts to uppercase.
- lower: Converts to lowercase.
- capitalize: Capitalizes the first alphabet character.
- zipcode: Formats as a Korean postal code.
- phone: Formats as a Korean phone number.
- realnum: Removes meaningless zeros. E.g., 0100.0 → 100, 0100.10 → 100.1
- trimToEmpty: Trims leading and trailing whitespace. If the input is null or undefined, returns an empty string.
- trimToZero: Trims whitespace. If the input is empty, null, or undefined, returns 0.
- trimToVal, valStr: Trims whitespace. If the input is empty, null, or undefined, returns valStr.
- date, 4|6|8|10|12|14, "month"|"date", {datepicker options}: Formats as a date.
  - Second argument (number):
    - 4: year
    - 6: year-month
    - 8: year-month-day
    - 10: year-month-day hour
    - 12: year-month-day hour:minute
    - 14: year-month-day hour:minute:second
  - Second argument (string):
    - Y: year (4 digits)
    - y: year (2 digits)
    - m: month
    - d: day
    - H: hour
    - i: minute
    - s: second
    - Examples:
      - "1999/12/31": "Y/m/d"
      - "99/12/31": "y/m/d"
      - "31/12": "d/m"
      - "12/31/1999": "m/d/Y"
      - "1999-12-31 12:01:59": "Y-m-d H:i:s"
  - Third argument:
    - date: Shows Datepicker
    - month: Shows Monthpicker
  - Fourth argument: JSON string for Datepicker options.
- time, 2|4|6: Formats as time.
  - 2: hour
  - 4: hour:minute
  - 6: hour:minute:second
- limit, cutLength, replaceStr: Cuts the string to cutLength and appends replaceStr.
- replace, targetStr, replaceStr: Replaces targetStr with replaceStr.
- lpad, length, fill string: Pads the left side to length with fill string.
- rpad, length, fill string: Pads the right side to length with fill string.
- mask, phone|email|address|name|rrn, masking character: Masks the value. If masking character is not provided, uses '*'.
- generic, userFormat: Formats the string using a user-defined format.
  - Mask characters:
    - #: number, whitespace
    - @: Korean (consonant/vowel), English, whitespace
    - ~: Korean, English, number, whitespace
- numeric, userFormat, option: Formats a numeric string using a user-defined format.
  - Option values:
    - ceil: round up
    - floor: round down
    - round: round to nearest

## Validator

<a name="validator-overview"></a>
### Overview

Validator (`N.validator`) is a library that validates an input data set (array of JSON objects) and returns the validation result data set.

If you pass a container element that wraps input elements with data-validate attributes, validation is triggered when the input loses focus. If validation fails, a tooltip error message is displayed near the input.

Validation can also be performed on strings, not just data sets.

<a name="validator-constructor"></a>
### Constructor

#### N.validator

Creates an instance of `N.validator`.

```javascript
var validator = new N.validator(data, rules|context);
```

- If you specify rules as an object option:
  - `{ "column property name": [["rule name", arg[0], arg[1]...]] }`
  - Example:
    ```javascript
    new N.validator(data, {
        "numeric": [["required"], ["integer+commas"]],
        "generic": [["required"], ["korean"]],
        "limit": [["required"], ["alphabet"]]
    }).validate();
    ```
- If you specify a jQuery object containing elements with data-validate attributes:
  - Example:
    ```html
    <div class="validator-context">
        <input id="numeric" type="text" data-validate='[["required"], ["integer+commas"]]'/>
    </div>
    ```
    ```javascript
    N.validator(data, N(".validator-context", view)).validate();
    ```
- To change validation rules dynamically:
  - Example:
    ```javascript
    N("#numeric").data("validate", [["required"], ["integer"]])
    ```

#### N(obj).validator

Creates an N.validator instance as a jQuery plugin method.

```javascript
var validator = N(data).validator(rules|context);
```

The way you create the instance is different, but the instance created by `new N.validator()` and `N().validator` are the same. The first argument of the N() function is set as the first argument of the new N.validator constructor.

### Methods

#### validate

Validates the specified data.

```javascript
validator.validate([row]);
```

- `row` (number, optional): The row index of the data list to validate. If omitted, all rows are validated.
- **Returns:**
  - Object: Validation result data. If validation fails, focus is given to the element and a tooltip error message is displayed.
  - Validation messages can be set in Config (`natural.config.js`) under `N.context.attr("data").validator.message`.

### Examples

- Declare validation rules in the data-validate attribute of the input element:
  - Example:
    ```html
    <input id="col01" type="text" data-validate='[["required"]]'>
    ```
    - Validation is triggered when the element loses focus. If validation fails, a tooltip with the reason is shown next to the input.

- Using the N.validator library for validation:
  - Example:
    ```javascript
    // N.validator.{rule}("String to validate", ...arguments);
    N.validator.rangevalue("Validation string", [1, 9]); // false
    ```

- Triggering validator-related events directly:
  - Example:
    ```javascript
    N("input[name='targetEle']").trigger("validate");
    ```

- Dynamically changing validation rules and applying immediately:
  - Example:
    ```javascript
    N("selector").data("validate", [["required"]]).trigger("validate");
    ```

### Validation Rule List

Validation rule names are case-insensitive.

- required: Required input
- alphabet: Only English letters allowed
- integer: Only integers allowed
- korean: Only Korean characters allowed
- alphabet+integer: Only English letters and integers allowed (order does not matter)
- integer+korean: Only integers and Korean allowed
- alphabet+korean: Only English letters and Korean allowed
- alphabet+integer+korean: Only English letters, integers, and Korean allowed
- integer+dash: Only integers and dash (-) allowed
- integer+commas: Only integers and commas allowed
- number: Only integers, commas, and dot (.) allowed
- decimal, length: Decimal allowed up to the specified length
- phone, isPartialDigits: Checks if the value matches phone number format. If isPartialDigits is true, passing only one digit of the last 4 digits is allowed.
- email: Checks if the value matches email format
- url: Checks if the value matches URL format
- zipcode: Checks if the value matches postal code format
- rrn: Checks if the value matches Korean resident registration number format
- ssn: Checks if the value matches US social security number format
- frn: Checks if the value matches foreigner registration number format
- frn_rrn: Checks if the value matches either foreigner or resident registration number format
- kbrn: Checks if the value matches Korean business registration number format
- kcn: Checks if the value matches Korean corporate number format
- date: Checks if the value matches date format
- time: Checks if the value matches time format
- accept, word: Only the value "word" is allowed
- notAccept, word: The value "word" is not allowed
- match, word: Only values containing "word" are allowed
- notMatch, word: Values containing "word" are not allowed
- acceptFileExt, fileExtension: Only file extensions containing "fileExtension" are allowed
- notAcceptFileExt, fileExtension: File extensions containing "fileExtension" are not allowed
- equalTo, input: Only allowed if the value is equal to the value of "input"
- maxlength, length: Only values with length less than or equal to the specified length are allowed
- minlength, length: Only values with length greater than or equal to the specified length are allowed
- rangelength, startLength, endLength: Only values with length between startLength and endLength are allowed
- maxbyte, byteLength, defaultCharByteLength: Only values with byte length less than or equal to byteLength are allowed. If defaultCharByteLength is not set, the value from Config is used.
- minbyte, byteLength, defaultCharByteLength: Only values with byte length greater than or equal to byteLength are allowed. If defaultCharByteLength is not set, the value from Config is used.
- rangebyte, startByteLength, endByteLength, defaultCharByteLength: Only values with byte length between startByteLength and endByteLength are allowed. If defaultCharByteLength is not set, the value from Config is used.
- maxvalue, number: Only values less than or equal to the specified value are allowed
- minvalue, number: Only values greater than or equal to the specified value are allowed
- rangevalue, startNumber, endNumber: Only values between startNumber and endNumber are allowed
- regexp, regexp string, flag, message: Validates using the specified regular expression. If validation fails, the message is shown as a tooltip. If no message is provided, the default message is shown.

## Natural-DATA Library

<a name="natural-data-library-overview"></a>
### Overview

The Natural-DATA library provides methods and features for sorting, filtering, and processing data in the form of an array of JSON objects. This allows efficient client-side data manipulation.

<a name="natural-data-library-methods"></a>
### Methods

#### N.data.filter

Extracts data matching the specified condition.

```javascript
var filteredData = N.data.filter(data, condition);
```

- `data` (array of JSON objects): Data to filter
- `condition` (function|string): Filtering condition
  - If a function is provided, only rows for which the function returns true are filtered.
    - Example:
      ```javascript
      var fData = N.data.filter([
          { name: "John", age: 18 },
          { name: "Mike", age: 16 },
          { name: "Mike", age: 14 }
      ], function(item) {
          return item.name === "Mike" && item.age === 16;
      });
      // Result: [{ name: "Mike", age: 16 }]
      ```
  - If a string is provided, only rows matching the condition string are filtered.
    - Example:
      ```javascript
      var fData = N.data.filter([
          { name: "John", age: 18 },
          { name: "Mike", age: 16 },
          { name: "Mike", age: 14 }
      ], 'name === "Mike"');
      // Result: [{ name: "Mike", age: 16 }, { name: "Mike", age: 14 }]
      ```
- Note:
  - Using a function as the condition is faster than using a string.
  - The string condition method does not support AND (&&) or OR (||) expressions; only a single condition is allowed.

#### N.data.sort

Sorts data based on the specified `key` argument.

```javascript
var sortedData = N.data.sort(data, key, reverse);
```

- `data` (array of JSON objects): Data to sort
- `key` (string): Property name to sort by
- `reverse` (boolean): If true, sorts in descending order

#### N(data).datafilter

Executes the N.data.filter function as a jQuery plugin method.

```javascript
var filteredData = N(data).datafilter(condition);
```

- `condition` (function|string): Same as the condition argument for N.data.filter

#### N(data).datasort

Executes the N.data.sort function as a jQuery plugin method.

```javascript
var sortedData = N(data).datasort(condition);
```

- `key` (string): Same as the key argument for N.data.sort
- `reverse` (boolean): Same as the reverse argument for N.data.sort

<a name="natural-data-library-usage-examples"></a>
### Usage Examples

- Filtering data:
  - Example:
    ```javascript
    var users = [
        { id: 1, name: "John", age: 28, active: true },
        { id: 2, name: "Mike", age: 32, active: false },
        { id: 3, name: "Sarah", age: 25, active: true },
        { id: 4, name: "David", age: 35, active: true }
    ];
    var activeUsers = N.data.filter(users, function(user) {
        return user.active === true && user.age < 30;
    });
    // Result: [{ id: 1, name: "John", age: 28, active: true }, { id: 3, name: "Sarah", age: 25, active: true }]
    var userNamedMike = N.data.filter(users, 'name === "Mike"');
    // Result: [{ id: 2, name: "Mike", age: 32, active: false }]
    var activeUsersJQuery = N(users).datafilter(function(user) {
        return user.active === true;
    });
    // Result: jQuery object containing [{ id: 1, name: "John", age: 28, active: true }, { id: 3, name: "Sarah", age: 25, active: true }, { id: 4, name: "David", age: 35, active: true }]
    ```

- Sorting data:
  - Example:
    ```javascript
    var products = [
        { id: 1, name: "Laptop", price: 1200 },
        { id: 2, name: "Phone", price: 800 },
        { id: 3, name: "Tablet", price: 500 },
        { id: 4, name: "Desktop", price: 1500 }
    ];
    var sortedByPrice = N.data.sort(products, "price", false);
    // Result: [{ id: 3, name: "Tablet", price: 500 }, { id: 2, name: "Phone", price: 800 }, { id: 1, name: "Laptop", price: 1200 }, { id: 4, name: "Desktop", price: 1500 }]
    var sortedByName = N.data.sort(products, "name", true);
    // Result: [{ id: 3, name: "Tablet", price: 500 }, { id: 2, name: "Phone", price: 800 }, { id: 1, name: "Laptop", price: 1200 }, { id: 4, name: "Desktop", price: 1500 }]
    var sortedByPriceJQuery = N(products).datasort("price", true);
    // Result: jQuery object containing sorted product list
    ```

<a name="natural-data-library-advanced-usage"></a>
### Advanced Usage

- Combining filtering and sorting:
  - Example:
    ```javascript
    var items = [
        { category: "A", value: 10, available: true },
        { category: "B", value: 5, available: false },
        { category: "A", value: 8, available: true },
        { category: "C", value: 12, available: true },
        { category: "B", value: 15, available: true }
    ];
    var filteredAndSorted = N.data.sort(
        N.data.filter(items, function(item) {
            return item.available === true;
        }),
        "value",
        true // descending
    );
    // Result:
    // [
    //   { category: "C", value: 12, available: true },
    //   { category: "A", value: 10, available: true },
    //   { category: "A", value: 8, available: true },
    //   { category: "B", value: 15, available: true }
    // ]
    ```

- Applying complex filtering conditions:
  - Example:
    ```javascript
    var transactions = [
        { date: "2023-01-15", amount: 120, type: "income" },
        { date: "2023-01-20", amount: 80, type: "expense" },
        { date: "2023-02-05", amount: 200, type: "income" },
        { date: "2023-02-10", amount: 50, type: "expense" },
        { date: "2023-03-01", amount: 300, type: "income" }
    ];
    var februaryIncome = N.data.filter(transactions, function(transaction) {
        return transaction.date.startsWith("2023-02") && transaction.type === "income";
    });
    // Result: [{ date: "2023-02-05", amount: 200, type: "income" }]
    ```

The Natural-DATA library provides simple yet powerful tools for efficiently processing JSON data on the client side. With filtering and sorting features, you can process and display data received from the server on the client side without additional server requests.
