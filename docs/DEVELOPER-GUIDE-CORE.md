# Natural-CORE Reference Guide

This document provides a comprehensive overview of the core features and utilities of Natural-CORE.

## Table of Contents

- [Natural-CORE Reference Guide](#natural-core-reference-guide)
  - [Table of Contents](#table-of-contents)
  - [N() \& N](#n--n)
    - [Overview](#overview)
    - [jQuery Selector Extension](#jquery-selector-extension)
      - [\[selector\] :regexp(attributeName\[:propertyName\], expr)](#selector-regexpattributenamepropertyname-expr)
      - [:regexp Filter Attributes and Examples](#regexp-filter-attributes-and-examples)
    - [jQuery Plugin Extension Methods](#jquery-plugin-extension-methods)
      - [N("selector").instance()](#nselectorinstance)
        - [Instance Storage Locations](#instance-storage-locations)
  - [N Object Functions](#n-object-functions)
      - [N(\[selector\[, context\]\])](#nselector-context)
      - [N.version\["package name"\]](#nversionpackage-name)
      - [N.locale(\[locale\])](#nlocalelocale)
      - [N.debug(msg)](#ndebugmsg)
      - [N.log(msg)](#nlogmsg)
      - [N.info(msg)](#ninfomsg)
      - [N.warn(msg)](#nwarnmsg)
      - [N.error(msg\[, e\])](#nerrormsg-e)
      - [N.type(obj)](#ntypeobj)
      - [N.isString(obj)](#nisstringobj)
      - [N.isNumeric(obj)](#nisnumericobj)
      - [N.isPlainObject(obj)](#nisplainobjectobj)
      - [N.isEmptyObject(obj)](#nisemptyobjectobj)
      - [N.isArray(obj)](#nisarrayobj)
      - [N.isArraylike(obj)](#nisarraylikeobj)
      - [N.isWrappedSet(obj)](#niswrappedsetobj)
      - [N.isElement(obj)](#niselementobj)
      - [N.toSelector(obj)](#ntoselectorobj)
      - [N.serialExecute(fn1, fn2, ...)](#nserialexecutefn1-fn2-)
  - [N.gc Object Functions](#ngc-object-functions)
      - [N.gc.minimum()](#ngcminimum)
      - [N.gc.full()](#ngcfull)
  - [N.string Object Functions](#nstring-object-functions)
      - [N.string.contains(context, str)](#nstringcontainscontext-str)
      - [N.string.endsWith(context, str)](#nstringendswithcontext-str)
      - [N.string.startsWith(context, str)](#nstringstartswithcontext-str)
      - [N.string.insertAt(context, idx, str)](#nstringinsertatcontext-idx-str)
      - [N.string.removeWhitespace(str)](#nstringremovewhitespacestr)
      - [N.string.lpad(context, length, str)](#nstringlpadcontext-length-str)
      - [N.string.rpad(context, length, str)](#nstringrpadcontext-length-str)
      - [N.string.byteLength(str)](#nstringbytelengthstr)
      - [N.string.isEmpty(str)](#nstringisemptystr)
      - [N.string.trim(str)](#nstringtrimstr)
      - [N.string.trimToEmpty(str)](#nstringtrimtoemptystr)
      - [N.string.trimToNull(str)](#nstringtrimtonullstr)
      - [N.string.trimToUndefined(str)](#nstringtrimtoundefinedstr)
      - [N.string.trimToZero(str)](#nstringtrimtozerostr)
      - [N.string.trimToVal(str, val)](#nstringtrimtovalstr-val)
  - [N.element Object Functions](#nelement-object-functions)
      - [N.element.toData(eles)](#nelementtodataeles)
      - [N.element.maxZindex(\[ele\])](#nelementmaxzindexele)
  - [N.date Object Functions](#ndate-object-functions)
      - [N.date.diff(refDateStr, targetDateStr)](#ndatediffrefdatestr-targetdatestr)
      - [N.date.strToDateStrArr(str, format\[, isString\])](#ndatestrtodatestrarrstr-format-isstring)
      - [N.date.strToDate(str\[, format\])](#ndatestrtodatestr-format)
      - [N.date.format(str, format)](#ndateformatstr-format)
      - [N.date.dateToTs(\[dateObj\])](#ndatedatetotsdateobj)
      - [N.date.tsToDate(\[tsNum\])](#ndatetstodatetsnum)
  - [N.browser Object Functions](#nbrowser-object-functions)
      - [N.browser.cookie(name, value, expiredays\[, domain\])](#nbrowsercookiename-value-expiredays-domain)
      - [N.browser.removeCookie(name\[, domain\])](#nbrowserremovecookiename-domain)
      - [N.browser.msieVersion()](#nbrowsermsieversion)
      - [N.browser.is(name)](#nbrowserisname)
      - [N.browser.contextPath()](#nbrowsercontextpath)
      - [N.browser.scrollbarWidth()](#nbrowserscrollbarwidth)
  - [N.message Object Functions](#nmessage-object-functions)
      - [N.message.get(resource, key\[, vars\])](#nmessagegetresource-key-vars)
  - [N.array Object Functions](#narray-object-functions)
      - [N.array.deduplicate(arr\[, key\])](#narraydeduplicatearr-key)
  - [N.json Object Functions](#njson-object-functions)
      - [N.json.mergeJsonArray(arr1, arr2\[, key\])](#njsonmergejsonarrayarr1-arr2-key)
      - [N.json.format(obj, indent)](#njsonformatobj-indent)
  - [N.event Object Functions](#nevent-object-functions)
      - [N.event.isNumberRelatedKeys(e)](#neventisnumberrelatedkeyse)
      - [N.event.disable(e)](#neventdisablee)

## N() & N

### Overview

N() is the core method of Natural-JS. It finds elements in the DOM based on the given argument or returns a collection of matched elements created from an HTML string.

N is the core class where common functions of Natural-JS are defined.

> N() is an extension of the jQuery() function. Therefore, you can use $() or jQuery() as a replacement. However, local functions of the N object cannot be used in jQuery or $ objects.

### jQuery Selector Extension

Natural-CORE extends the selector to support regexp filters for evaluating attribute values with regular expressions, which are not supported in CSS1~3. This allows for more complex element searches.

#### [selector] :regexp(attributeName[:propertyName], expr)

**Return**: jQuery Object

- **selector**: string
  - The base selector string. If omitted, all elements are evaluated, so it is recommended to specify a base selector whenever possible.
- **attributeName**: string
  - The attribute name of the HTML DOM element to evaluate. All attribute values except those listed below are evaluated using `.attr(attributeName)`.
    - **data**: Extracts the data attribute. You must specify a sub-property as propertyName. Equivalent to `.data(propertyName)`.
    - **css**: Extracts the css property. You must specify a sub-property as propertyName. Equivalent to `.css(propertyName)`.
    - **class**: Extracts the class attribute. If the element has multiple classes, each class is evaluated.
- **propertyName**: string
  - If attributeName is data or css, this means the sub-property. Otherwise, it is ignored.
- **expr**: string
  - The regular expression string. Do not wrap it in single or double quotes.

**Correct Usage Example**:
```javascript
// Extract all <a> tags whose href attribute contains "Mr.Lee" or "Mr.Kim"
const anchors = N("a:regexp(href, Mr\.(Lee|Kim))");
```

#### :regexp Filter Attributes and Examples

- Filtering elements with multiple class values:
  - Example:
    - `<div class="someClassA classB"></div>`
    - `N("div:regexp(class, ^someClass)")`
    - `<div class="searchBtn"></div>`
    - `<div class="searchBtn"></div>`
    - `<div class="searchButton"></div>`
    - `N("div:regexp(class, Btn$|Button$)")`
- Filtering by data attribute property:
  - Example:
    - `<div data-sample="test-1"></div>`
    - `<div data-sample="test-2"></div>`
    - `N("div:regexp(data:sample, test-[1-2])")`
- Filtering by css property:
  - Example:
    - `<div style="width:128px;"></div>`
    - `N("div:regexp(css:width, ^128px)")`
- Filtering by id attribute:
  - Example:
    - `<div id="page-1"></div><div id="page-2"></div><div id="page-3"></div>`
    - `N("div:regexp(id, page-[0-9])")`

### jQuery Plugin Extension Methods

Natural-JS provides core utility functions as jQuery plugins. The following are descriptions of the main functions.

#### N("selector").instance()

**Return**: object

Returns the instance of a component or Controller object from the context element of a UI component or View element, or stores an object instance in the element.

Natural-JS stores the created object instance in the template (context or view) element specified during component or library initialization for easy control of block content such as tabs or popups.

The behavior varies depending on the number and type of arguments:

1. **No arguments**: Returns all instances stored in the selected elements.
2. **Function argument**: Passes all stored instances in the selected elements to the callback function.
3. **String argument**: Returns all instances stored with the instanceId "name" in the selected elements.
4. **String and function arguments**: Passes all instances stored with the instanceId "name" in the selected elements to the callback function.
5. **String and object arguments**: Stores the instance as "name" in the selected elements.

##### Instance Storage Locations

- cont: N.cont
- alert: N.alert (stored in .block_overlay_msg__)
- button: N.button
- datepicker: N.datepicker
- popup: N.popup (Controller object stored in .block_overlay_msg__ > .msg_box__ > .view_context__)
- tab: N.tab (Controller object stored in .tab__ > .{tab content element id} > .view_context__)
- select: N.select
- form: N.form
- list: N.list
- grid: N.grid
- pagination: N.pagination
- tree: N.tree
- notify: N.notify
- docs: N.docs

If not specified, the instance is stored in the element specified by the context option.

## N Object Functions

N object core and utility functions.

#### N([selector[, context]])

**Return**: jQuery object

Acts as the core object where libraries provided as plugin types and member variables or functions of the N object are defined.

When N(selector) is executed, the selector is passed to the jQuery init method, initializing both Natural-JS and jQuery.

```javascript
var divs = N("div");
```

- **selector**: selector string|function|element|array[element]|jQuery object|object - Same as jQuery selector. See jQuery() selector argument for details.
- **context**: selector string|jQuery object[element] - If a selector string is entered, only elements within the specified context are selected.

#### N.version["package name"]

**Return**: string

Returns the version of each Natural-JS package.

- Natural-CORE: `N.version["Natural-CORE"]`
- Natural-ARCHITECTURE: `N.version["Natural-ARCHITECTURE"]`
- Natural-DATA: `N.version["Natural-DATA"]`
- Natural-UI: `N.version["Natural-UI"]`
- Natural-UI.Shell: `N.version["Natural-UI.Shell"]`

#### N.locale([locale])

**Return**: undefined

Gets or sets the locale value set in the framework. The default messages of the framework are localized according to the set locale value.

Pre-registered locale message sets are en_US and ko_KR, and can be modified in the message property of Config(natural.config.js). The default locale of the framework can be set with the N.context.attr("core").locale property in Config(natural.config.js).

- **locale**: string - Locale string such as "en_US", "ko_KR"

#### N.debug(msg)

**Return**: undefined

Outputs a debug message to the browser console. Equivalent to window.console.debug. If the browser does not support window.console.debug, the message is not output.

- **msg**: string - Message text

#### N.log(msg)

**Return**: undefined

Outputs a log message to the browser console. Equivalent to window.console.log. If the browser does not support window.console.log, the message is not output.

- **msg**: string - Message text

#### N.info(msg)

**Return**: undefined

Outputs an info message to the browser console. Equivalent to window.console.info. If the browser does not support window.console.info, the message is not output.

- **msg**: string - Message text

#### N.warn(msg)

**Return**: undefined

Outputs a warning message to the browser console. Equivalent to window.console.warn. If the browser does not support window.console.warn, the message is not output.

- **msg**: string - Message text

#### N.error(msg[, e])

**Return**: ErrorThrown

Throws an error and outputs the error message to the browser console. Since N.error returns an ErrorThrown object, use the throw statement before N.error to throw an error.

```javascript
throw N.error("An error occurred.");
```

- **msg**: string - Error message text
- **e**: ErrorThrown - If specified, throws the given ErrorThrown object.

#### N.type(obj)

**Return**: string

Returns the type ("number", "string", "array", "object", "function", "date") of the specified object.

- **obj**: anything - Object to check type

#### N.isString(obj)

**Return**: boolean

Checks if the input object is of type string.

- **obj**: anything - Object to check type

#### N.isNumeric(obj)

**Return**: boolean

Checks if the input object is of type number. N.isNumeric uses jQuery.isNumeric.

- **obj**: anything - Object to check type

#### N.isPlainObject(obj)

**Return**: boolean

Checks if the input object is a plain object. typeof N() or N.type(N()) returns "object", but N.isPlainObject does not consider these as plain objects. Only objects created with new Object() or object literals ({}) return true. N.isPlainObject uses jQuery.isPlainObject.

- **obj**: anything - Object to check type

#### N.isEmptyObject(obj)

**Return**: boolean

Checks if the input object is an empty object. "", {}, and [] all return true, but [{}] returns false because it contains another empty object.

- **obj**: anything - Object to check type

#### N.isArray(obj)

**Return**: boolean

Checks if the input object is of type array. N.isArray uses Array.isArray.

- **obj**: anything - Object to check type

#### N.isArraylike(obj)

**Return**: boolean

Checks if the input object is array-like. jQuery objects also appear array-like and return true. Use this when you want to treat both arrays and jQuery objects as the same.

- **obj**: anything - Object to check type

#### N.isWrappedSet(obj)

**Return**: boolean

Checks if the input object is a jQuery object initialized by N(), $(), or jQuery().

- **obj**: anything - Object to check type

#### N.isElement(obj)

**Return**: boolean

Checks if the object specified as an argument to N(), $(), or jQuery() is an HTML element.

- **obj**: jQuery object - Object to check type

#### N.toSelector(obj)

**Return**: boolean

Extracts the selector from the object passed as an argument to the N() function.

- **obj**: jQuery object|object - jQuery object or object to extract selector from

#### N.serialExecute(fn1, fn2, ...)

**Return**: [jQuery Deferred Objects]

Allows you to express hierarchical callbacks of asynchronous logic in series using jQuery.Deferred.

You can group asynchronous logic and its pre/post-processing logic into function blocks and pass them as arguments to N.serialExecute. The functions are executed in the order they are passed. To execute the next function, call the resolve method of the defer (Deferred) argument at the end of the asynchronous logic. The arguments to defer.resolve are passed as arguments to the next function block.

The this and return object of each function block is an array of Deferred objects. You can use this to skip to a specific function block by calling this[3].resolve() in the first function block, for example.

Earlier function blocks can reference Deferred objects of later blocks, but not vice versa.

**Example**

Typical asynchronous logic:
```javascript
// ES6+ Example: Typical asynchronous logic
setTimeout(() => {
    setTimeout(() => {
        setTimeout(() => {
            setTimeout(() => {
                N.log("Step 4 complete");
            }, 500);
            N.log("Step 3 complete");
        }, 500);
        N.log("Step 2 complete");
    }, 500);
    N.log("Step 1 complete");
}, 500);

// With N.serialExecute (ES6+)
const defers = N.serialExecute(
    defer => {
        setTimeout(() => {
            defer.resolve("0", "1");
            N.log("Step 1 complete");
        }, 500);
    },
    (defer, arg0, arg1) => {
        setTimeout(() => {
            defer.resolve(arg0, arg1);
            N.log("Step 2 complete", arg0, arg1);
        }, 500);
    },
    (defer, arg0, arg1) => {
        setTimeout(() => {
            defer.resolve(arg0, arg1);
            N.log("Step 3 complete", arg0, arg1);
        }, 500);
    },
    (defer, arg0) => {
        setTimeout(() => {
            defer.resolve();
            N.log("Step 4 complete", arg0);
        }, 500);
    }
);

// ES6+ Example: $.when usage
$.when(defers[1], defers[2]).done((arg0, arg1) => {
    N.log("Step 2 and 3 both complete.");
});

$.when(...defers).done((...args) => {
    N.log("All steps complete.");
});
```

## N.gc Object Functions

N.gc is a collection of garbage collection utility functions for Natural-JS.

Use as "N.gc.{functionName}(arg[0...N])".

#### N.gc.minimum()

**Return**: boolean

Releases the minimum resources for elements and events used by Natural-JS components and libraries.

When loading a page into the N.context.attr("architecture").page.context area via N.comm, N.gc[N.context.attr("core").gcMode]() is automatically executed.

#### N.gc.full()

**Return**: boolean

Releases all resources for elements and events used by Natural-JS components and libraries.

If memory usage increases every time a page is opened in a SPA, there may be a memory leak. Running N.gc.full() can help resolve this if it cannot be automatically detected by N.comm.

## N.string Object Functions

N.string is a collection of string utility functions for Natural-JS.

Use as "N.string.{functionName}(arg[0...N])".

#### N.string.contains(context, str)

**Return**: boolean

Returns true if the input string is contained.

- **context**: string - The string to check.
- **str**: string - The string to search for.

#### N.string.endsWith(context, str)

**Return**: boolean

Returns true if the input string ends with the given string.

- **context**: string - The string to check.
- **str**: string - The string to search for.

#### N.string.startsWith(context, str)

**Return**: boolean

Returns true if the input string starts with the given string.

- **context**: string - The string to check.
- **str**: string - The string to search for.

#### N.string.insertAt(context, idx, str)

**Return**: string

Inserts the given string at the specified position in the string.

- **context**: string - The target string.
- **idx**: number - The index at which to insert the string.
- **str**: string - The string to insert.

#### N.string.removeWhitespace(str)

**Return**: string

Removes all whitespace from the string.

- **str**: string - The string to remove whitespace from.

#### N.string.lpad(context, length, str)

**Return**: string

Pads the string on the left with the given character up to the specified length.

- **context**: string - The target string.
- **length**: number - The length to pad to.
- **str**: string - The character to pad with.

#### N.string.rpad(context, length, str)

**Return**: string

Pads the string on the right with the given character up to the specified length.

- **context**: string - The target string.
- **length**: number - The length to pad to.
- **str**: string - The character to pad with.

#### N.string.byteLength(str)

**Return**: string

Returns the byte length of the input string. For Korean, Chinese, etc., the byte length is calculated as 3 bytes (UTF-8), and for English letters and numbers, it is 1 byte. If the byte length for Korean or Chinese is not 3 bytes, change the N.context.attr("core").charByteLength property in Config(natural.config.js).

- **str**: string - The string to check length.

#### N.string.isEmpty(str)

**Return**: string

Checks if the string is null, undefined, or an empty string ("").

- **str**: string - The string to check.

#### N.string.trim(str)

**Return**: string

Removes whitespace from both ends of the string. If null or undefined is entered, returns an empty string (""). Uses String.prototype.trim.

- **str**: string|null|undefined - The string to trim.

#### N.string.trimToEmpty(str)

**Return**: string

Removes whitespace from both ends of the string. If null or undefined is entered, returns an empty string (""). Uses String.prototype.trim.

- **str**: string|null|undefined - The string to trim.

#### N.string.trimToNull(str)

**Return**: string|null

Removes whitespace from both ends of the string. If null or undefined is entered, returns null.

- **str**: string|null|undefined - The string to trim.

#### N.string.trimToUndefined(str)

**Return**: string|undefined

Removes whitespace from both ends of the string. If null or undefined is entered, returns undefined.

- **str**: string|null|undefined - The string to trim.

#### N.string.trimToZero(str)

**Return**: string

Removes whitespace from both ends of the string. If null or undefined is entered, returns "0".

- **str**: string|null|undefined - The string to trim.

#### N.string.trimToVal(str, val)

**Return**: string

Removes whitespace from both ends of the string. If null or undefined is entered, returns the value of the val argument.

- **str**: string|null|undefined - The string to trim.
- **val**: string - The value to return.

## N.element Object Functions

N.element is a collection of HTML element utility functions for Natural-JS.

Use as "N.element.{functionName}(arg[0...N])".

#### N.element.toData(eles)

**Return**: boolean

Creates a JSON object from the id and value attributes of the specified input elements. Used to generate initial data in the add method of N.form.

```javascript
// ES6+ Example: Convert input values in #box to JSON data
const data = N.element.toData($("#box").find(":input"));
```

- **eles**: jQuery object - jQuery object with input elements selected.

#### N.element.maxZindex([ele])

**Return**: number

Returns the highest z-index value among the specified elements.

```javascript
// ES6+ Example: Get max z-index among divs
const maxZindex = N.element.maxZindex($("div"));
```

- **ele**: jQuery object - Target elements as a jQuery object. If omitted, defaults to $("div, span, ul, p, nav, article, section").

## N.date Object Functions

N.date is a collection of date utility functions for Natural-JS.

Use as "N.date.{functionName}(arg[0...N])".

#### N.date.diff(refDateStr, targetDateStr)

**Return**: string

Returns the difference in days between the two input dates.

- **refDateStr**: string - Reference date as an 8-digit string (YYYYmmdd).
- **targetDateStr**: string - Target date as an 8-digit string (YYYYmmdd).

#### N.date.strToDateStrArr(str, format[, isString])

**Return**: array

Creates an array [year, month, day] from the input date string and format. If isString is true, stores as strings; otherwise, as numbers.

- **str**: string - Date string.
- **format**: string - Format of the date string. (Y: year, m: month, d: day)
- **isString**: boolean - If true, stores as strings.

#### N.date.strToDate(str[, format])

**Return**: string

Converts the input date/time string to a date object and returns an object with properties obj (date object) and format (date format string).

- **str**: string - Date/time string.
- **format**: string - Format of the date string. (Y: year, m: month, d: day, H: hour, i: minute, s: second)

If format is omitted, it is set automatically based on the length of the input string.

#### N.date.format(str, format)

**Return**: array

Formats the input date/time string according to the given format.

- **str**: string - Date/time string.
- **format**: string - Format string.

#### N.date.dateToTs([dateObj])

**Return**: number

Converts a date object to a timestamp. If dateObj is omitted, uses the current date and time.

- **dateObj**: date object - Date object to convert.

#### N.date.tsToDate([tsNum])

**Return**: date object

Converts a timestamp to a date object. If tsNum is omitted, uses the current date and time.

- **tsNum**: number - Timestamp to convert.

## N.browser Object Functions

N.browser is a collection of browser utility functions for Natural-JS.

Use as "N.browser.{functionName}(arg[0...N])".

#### N.browser.cookie(name, value, expiredays[, domain])

**Return**: undefined

Creates a browser cookie.

- **name**: string - Cookie name.
- **value**: string - Cookie value.
- **expiredays**: number - Expiration days.
- **domain**: string - Domain for the cookie.

#### N.browser.removeCookie(name[, domain])

**Return**: undefined

Removes a created cookie.

- **name**: string - Cookie name.
- **domain**: string - Domain of the cookie to remove.

#### N.browser.msieVersion()

**Return**: number

Returns the version of Microsoft Internet Explorer. Returns 0 if not IE.

#### N.browser.is(name)

**Return**: boolean

Returns true if the browser or mobile OS matches the input name.

- **name**: string - Browser or OS name. ("opera", "firefox", "safari", "chrome", "ie", "android", "ios")

#### N.browser.contextPath()

**Return**: string

Returns the context path from the browser URL.

#### N.browser.scrollbarWidth()

**Return**: number

Returns the width of the browser scrollbar.

## N.message Object Functions

N.message is a collection of multilingual message utility functions for Natural-JS.

Use as "N.message.{functionName}(arg[0...N])".

#### N.message.get(resource, key[, vars])

**Return**: string

Returns the message for the current locale from the given resource object.

- **resource**: object - Message resource object. Should be structured by locale.
- **key**: string - Message property name.
- **vars**: array - Replaces variables in the message with the values in the array.

## N.array Object Functions

N.array is a collection of array utility functions for Natural-JS.

Use as "N.array.{functionName}(arg[0...N])".

#### N.array.deduplicate(arr[, key])

**Return**: array

Removes duplicate elements from an array. If the array contains objects, specify a property name as the second argument to deduplicate by that property.

- **arr**: array - Array to deduplicate.
- **key**: string - Property name for deduplication (if array contains objects).

## N.json Object Functions

N.json is a collection of JSON object utility functions for Natural-JS.

Use as "N.json.{functionName}(arg[0...N])".

#### N.json.mergeJsonArray(arr1, arr2[, key])

**Return**: json object array

Merges two arrays of JSON objects, excluding duplicates. If a property name is specified, deduplication is based on that property. The arr1 object is not changed by merging.

- **arr1**: json object array - Original array.
- **arr2**: json object array - Array to merge.
- **key**: string - Property name for deduplication (optional).

#### N.json.format(obj, indent)

**Return**: string

Formats a JSON object for readability.

- **obj**: json object array|json object - JSON object or array.
- **indent**: number - Number of spaces for indentation.

## N.event Object Functions

N.event is a collection of event utility functions for Natural-JS.

Use as "N.event.{functionName}(arg[0...N])".

#### N.event.isNumberRelatedKeys(e)

**Return**: boolean

Returns true if the pressed key is related to numbers. Used in Datepicker (N.datepicker) to block non-numeric input.

- **e**: Event - Key event object.

#### N.event.disable(e)

**Return**: boolean

Event handler to block execution of events bound to the specified element. Use N().tpBind to bind N.event.disable at the beginning of the event handler chain.

- **e**: Event - Event object.
