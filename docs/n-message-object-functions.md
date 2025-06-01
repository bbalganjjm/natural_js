# Functions of N.message Object

N.message is a collection object of utility functions related to multilingual message handling.

You can use like "N.message.{function name}(arg[0...N])"

## N.message.get

**Return**: string

Returns the message that matches the currently set locale from the input message resource.

The default locale of the framework can be set with the value of the N.context.attr("core").locale property of Config(natural.config.js).

### Parameters

#### resource

**Type**: object

Specifies the message resource object.

Message resource must be created as object type and the message set for each locale should be composed as follows.

```javascript
var message = {
    "ko_KR" : {
        key : "안녕 {0}."
    },
    "en_US" : {
        key : "Hello {0}."
    }
}

var msg = N.message.get(message, "key", ["Natural-JS"]);

// msg : "Hello Natural-JS."
```

#### key

**Type**: string

Message property name.

#### vars

**Type**: array

The variable of the message is replaced with the entered value.

Variables such as {index} declared in the message are replaced with the value corresponding to the index of the array set with the vars option.
