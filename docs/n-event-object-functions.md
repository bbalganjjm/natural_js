# Functions of N.event Object

N.event is a collection object of utility functions related to event.

You can use like "N.event.{function name}(arg[0...N])"

## N.event.isNumberRelatedKeys

**Return**: boolean

Returns true if the key pressed is a numeric related key.

The following is a list of keys related to numeric keys:

- 97 : a Ctrl + a Select All
- 65 : A Ctrl + A Select All
- 99 : c Ctrl + c Copy
- 67 : C Ctrl + C Copy
- 118 : v Ctrl + v paste
- 86 : V Ctrl + V paste
- 115 : s Ctrl + s save
- 83 : S Ctrl + S save
- 112 : p Ctrl + p print
- 80 : P Ctrl + P print
- 8 : backspace
- 9 : tab
- 27 : escape
- 13 : enter
- 35 : Home & shiftKey + #
- 36 : End & shiftKey + $
- 37 : left arrow & shiftKey + %
- 39 : right arrow & '
- 46 : delete & .
- 45 : Ins & -

**Example**:
```javascript
$("input").on("keydown", function(e) {
    if(N.event.isNumberRelatedKeys(e)) {
        // TODO
    }
});
```

Used by Datepicker (N.datepicker) to block numbers and related keystrokes.

### Parameters

#### e

**Type**: Event

Inputs the Key Event object.

## N.event.disable

**Return**: boolean

This is an event handler that can block the execution of events bound to the specified element. Use the N().tpBind method to bind the N.event.disable event handler to the front of the element events.

**Example**:
```javascript
// Enable the click protection.
$("selector").tpBind("click", N.event.disable);
// Disable the click protection.
$("selector").off("click", N.event.disable);
```

### Parameters

#### e

**Type**: Event

Inputs the event object argument of the event handler.
