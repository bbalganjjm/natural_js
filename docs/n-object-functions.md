# Functions of N Object

These are core and utility functions of the N object.

## N

**Return**: jQuery object

It is a core object that defines the library and N object member variables and functions provided as plug-in types of Natural-JS.

When N(selector) is executed, a selector is input as an argument of jQuery's init method, and Natural-JS and jQuery are initialized at the same time.

```javascript
var divs = N("div");
```

### Parameters

#### selector

**Type**: selector string|function|element|array[element]|jQuery object|object

Same as a jQuery selector. For details, see the description of the selector argument of the [jQuery()](https://api.jquery.com/jQuery/) function.

#### context

**Type**: selector string|jQuery object[element]

If a selector string is input in the selector argument, only the elements within the element specified as the context argument are selected.

## N.version["package name"]

**Return**: string

Returns the each package version of Natural-JS.

- Package version of Natural-CORE: N.version["Natural-CORE"]
- Package version of Natural-ARCHITECTURE: N.version["Natural-ARCHITECTURE"]
- Package version of Natural-DATA: N.version["Natural-DATA"]
- Package version of Natural-UI: N.version["Natural-UI"]
- Package version of Natural-UI.Shell: N.version["Natural-UI.Shell"]

## N.locale

**Return**: undefined

You can get or set the locale value set in the framework.

> The framework's default messages are processed in multilingual according to the set locale value.
>
> The pre-registered multilingual message set has en_US, ko_KR and can be edited in the message attribute of Config(natural.config.js).
>
> The default locale of the framework can be set with the value of the N.context.attr("core").locale property of Config(natural.config.js).

### Parameters

#### locale

**Type**: string

Locale strings such as "en_US", "ko_KR", etc.

## N.debug

**Return**: undefined

Prints the debug messages in the browser console.

> Same as a window.console.debug function. If the browser does not support the window.console.debug function, no message is printed.

### Parameters

#### msg

**Type**: string

Message text.

## N.log

**Return**: undefined

Prints the log messages in the browser console.

> Same as a window.console.log function. If the browser does not support the window.console.log function, no message is printed.

### Parameters

#### msg

**Type**: string

Message text.

## N.info

**Return**: undefined

Prints the info messages in the browser console.

> Same as a window.console.info function. If the browser does not support the window.console.info function, no message is printed.

### Parameters

#### msg

**Type**: string

Message text.

## N.warn

**Return**: undefined

Prints the warn messages in the browser console.

> Same as a window.console.warn function. If the browser does not support the window.console.warn function, no message is printed.

### Parameters

#### msg

**Type**: string

Message text.

## N.error

**Return**: ErrorThrown

It occurs an error and then prints an error message to the browser console.

> The N.error function returns an ErrorThrown object, so to throw an error you must declare a throw statement previous the N.error function.

```javascript
throw N.error("An error has occurred.");
```

### Parameters

#### msg

**Type**: string

Error message text.

#### e

**Type**: ErrorThrown

If an ErrorThrown object is specified, an error is thrown using the specified object.

## N.type

**Return**: string

Returns the type("number", "string", "array", "object", "function", "date") of the specified object.

### Parameters

#### obj

**Type**: anything

Object to check the type.

## N.isString

**Return**: boolean

Checks whether the input object is of type string.

### Parameters

#### obj

**Type**: anything

Object to check the type.

## N.isNumeric

**Return**: boolean

Checks whether the input object is of type numeric.

> N.isNumeric uses jQuery.isNumeric function as it is.

### Parameters

#### obj

**Type**: anything

Object to check the type.

## N.isPlainObject

**Return**: boolean

Checks whether the input object is a pure object type.

> Executing typeof N() or N.type(N()) returns "object" but N.isPlainObject does not evaluate these objects as pure objects. Only objects created with new Object() or object literals({}) return true.
>
> N.isPlainObject uses jQuery.isPlainObject function as it is.

### Parameters

#### obj

**Type**: anything

Object to check the type.

## N.isEmptyObject

**Return**: boolean

Checks whether the input object is an empty object.

> "" or {}, [] both return true from an empty object, but [{}] returns false because there is another empty object in the object.

### Parameters

#### obj

**Type**: anything

Object to check the type.

## N.isArray

**Return**: boolean

Checks whether the input object is an array type.

> N.isArray uses Array.isArray function as it is.

### Parameters

#### obj

**Type**: anything

Object to check the type.

## N.isArraylike

**Return**: boolean

Checks whether the entered object is of a type similar to array.

> The jQuery object is also apparently similar to an array, returning true. Use this when you want to evaluate both array and jQuery objects as the same object.

### Parameters

#### obj

**Type**: anything

Object to check the type.

## N.isWrappedSet

**Return**: boolean

Checks whether the input object is a jQuery object type initialized with N(), $(), or jQuery().

### Parameters

#### obj

**Type**: anything

Object to check the type.

## N.isElement

**Return**: boolean

Checks whether the object specified by N(), $(), or jQuery() is an HTML element.

### Parameters

#### obj

**Type**: jQuery object

jQuery object to check the type.

## N.toSelector

**Return**: boolean

Extracts the selector of the object entered as an argument to the N() function.

### Parameters

#### obj

**Type**: jQuery object|object

jQuery object or object to extract selector.

## N.serialExecute

**Return**: [jQuery Deferred Objects]

This is a function that enables hierarchical callbacks of asynchronous execution logics to be serialized using jQuery.Deferred.

- You make the logic that works asynchronously and the pre and post processing logic of the logic into one function block and input it as an argument of the N.serialExecute function.
- The functions are executed in the order of the input arguments. To execute the function block defined with the next argument, the resolve method of the defer(Deferred) argument must be executed at the point where the asynchronous logic ends or the next function should be executed.
- The arguments of the defer.resolve method are specified in order from the second argument of the next function block to be executed.
- The this and return objects of each function block are array objects that contain Deferred objects of the function blocks entered as arguments.
- When "this" is used to execute this[3].resolve() when the asynchronous logic of the first function block is completed, the second and third function blocks can be skipped and the fourth function block can be executed.
   
  > Because at the start point of asynchronous logic, the Deferred object of the next function block has not been created yet, function blocks defined before the corresponding function block can be referenced, but function blocks defined after it cannot be referenced.

### Examples

Here is the general asynchronous execution logic:

```javascript
setTimeout(function() {
    setTimeout(function() {
        setTimeout(function() {
            setTimeout(function() {
                N.log("Logic 4 complete.");
            }, 500);
            N.log("Logic 3 complete.");
        }, 500);
        N.log("Logic 2 complete.");
    }, 500);
    N.log("Logic 1 complete.");
}, 500);
```

Using N.serialExecute, you can declare hierarchical asynchronous logic like this in serial as below:

```javascript
var defers = N.serialExecute(
    function(defer){
        setTimeout(function() {
            defer.resolve("0", "1");
            N.log("Logic 1 complete.");
        }, 500);
    },
    function(defer, arg0, arg1){
        setTimeout(function() {
            defer.resolve(arg0, arg1);
            N.log("Logic 2 complete.", arg0, arg1);
        }, 500);
    },
    function(defer, arg0, arg1){
        setTimeout(function() {
            defer.resolve(arg0, arg1);
            N.log("Logic 3 complete.", arg0, arg1);
        }, 500);
    },
    function(defer, arg0){
        setTimeout(function() {
            defer.resolve();
            N.log("Logic 4 complete.", arg0);
        }, 500);
    }
);
```

Using jQuery $.when, you can group the function blocks with the defers variable object returned from the above source code, and also execute the logic after all the function blocks of the corresponding group are completed.

```javascript
// Executes logic when the second and third function blocks are completed
$.when(defers[1], defers[2]).done(function(arguments[0], arguments[1]) {
    // arguments[0] and arguments[1] are objects specified as arguments when executing the defer.resolve function in each function block.
    N.log("Completed logic 2 and 3.");
});

// Executes logic when all function blocks are completed
$.when.apply($, defers).done(function(arguments[0], arguments[1], arguments[2], arguments[3]) {
    // arguments[0], arguments[1], arguments[2] and arguments[3] are objects specified as arguments when executing the defer.resolve function in each function block.
    N.log("Completed entire logic 1, 2, 3 and 4.");
});
```
