# Alert Constructor

The Alert component in Natural-JS can be instantiated using two different approaches: the direct constructor method and the jQuery plugin method.

## Constructor Methods

### N.alert

**Return**: N.alert instance

Creates an instance of N.alert.

```javascript
var alert = new N.alert(context, opts|msg);
var alert = new N.alert(context, opts|msg, vars);
```

#### Parameters

##### context
**Type**: window | jQuery object | jQuery selector string

Sets the context option. This is the same as the context option in the default options.

##### opts|msg
**Type**: string | object

If you provide a string argument, it is set as the msg option of the default options.

> **Note**: The msg argument can specify a message string, jQuery object, HTML string, or HTML element.

If you provide an object argument, it is specified as the component's default options object.

##### vars
**Type**: array

Sets the vars option of the default options.

### N(obj).alert

**Return**: N.alert instance

Creates an object instance of N.alert using the jQuery plugin method.

```javascript
var alert = N(context).alert(opts|msg);
var alert = N(context).alert(opts|msg, vars);
```

Although the method of creating object instances is different, the instance created with `new N.alert()` and the instance created with `N().alert` are functionally identical. The first argument of the N() function is set as the first argument of the new N.alert constructor.

#### Parameters

##### opts|msg
**Type**: string | object

Same as the second argument (opts|msg) of the N.alert function.

##### vars
**Type**: array

Same as the third argument (vars) of the N.alert function.

## Usage Examples

### Basic Alert with Message String

```javascript
// Using direct constructor
var alert1 = new N.alert(window, "This is an alert message");
alert1.show();

// Using jQuery plugin method
var alert2 = N(window).alert("This is an alert message");
alert2.show();
```

### Alert with Custom Options

```javascript
// Using direct constructor
var alert1 = new N.alert(window, {
    msg: "This is a customized alert",
    width: 400,
    height: 200,
    buttons: [{
        text: "OK",
        click: function() {
            this.close();
        }
    }]
});
alert1.show();

// Using jQuery plugin method
var alert2 = N(window).alert({
    msg: "This is a customized alert",
    width: 400,
    height: 200,
    buttons: [{
        text: "OK",
        click: function() {
            this.close();
        }
    }]
});
alert2.show();
```

### Alert with Variable Substitution

```javascript
// Using direct constructor
var alert1 = new N.alert(window, "Hello, {0}! Your score is {1}.", ["John", 95]);
alert1.show();

// Using jQuery plugin method
var alert2 = N(window).alert("Hello, {0}! Your score is {1}.", ["John", 95]);
alert2.show();
```

## Related Documentation

- [Alert Overview](alert-overview.md)
- [Alert Default Options](alert-default-options.md)
- [Alert Functions](alert-functions.md)
- [Alert Examples](alert-examples.md)
