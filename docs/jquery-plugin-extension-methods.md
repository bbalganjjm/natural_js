# jQuery Plugin Extension Methods

CORE utility functions provided as jQuery plugin types are as follows.

## N("selector").instance

Returns the instance of the component object or the Controller object from the context element or View element of the UI component, or saves the object instance to the element.

> Natural-JS stores the created object instance in the template (context or view) element specified when initializing the component or library to easily control block contents such as tabs or pop-ups.

It works differently depending on the number and type of parameters as follows:

1. Returns all instances stored in the specified element.
   
   If the returned instance is 1, the original instance object is returned. If there are more than one instance, they are stored in an array and returned. If no instance is returned, undefined is returned.
   
   ```javascript
   var all = N(".grid01", ".grid02").instance();
   ```

2. Specifies all instances stored in the selected element as arguments of the callback function.
   
   > Callback function is executed as many as the number of instances.
   
   ```javascript
   var all = N(".grid01", ".grid02").instance(function(instanceId, instance) {
       // this : instance
       // instanceId : Identifier of the stored instance
       // instance : Stored instance
   });
   ```

3. Returns all instances whose instanceId is stored as "name" in the selected element.
   
   If the returned instance is 1, the original instance object is returned. If there are more than one instance, they are stored in an array and returned. If no instance is returned, undefined is returned.
   
   ```javascript
   var all = N(".grid01", ".grid02").instance("name");
   ```

4. Return all instances where instanceId is stored as "name" in the selected element as argument of callback function.
   
   > Callback function is executed as many as the number of instances.
   
   ```javascript
   var all = N(".grid01", ".grid02").instance("name", function(instanceId, instance) {
       // this : instance
       // instanceId : Identifier of the stored instance
       // instance : Stored instance
   });
   ```

5. Store instance as "name" in the selected element.
   
   ```javascript
   N(".grid01").instance("name", instance);
   ```
   
   > When saving an instance, if the instance argument is a function type, it may not work properly. Types such as object or string, except the function type, should be specified as instance arguments.

### Parameters

#### name

Type: string

Instance name

The predefined instance names are as follows:

- Controller object of N.cont: cont
- Instance of N.alert: alert
  > It is stored in the .block_overlay_msg__ element.
- Instance of N.button: button
- Instance of N.datepicker: datepicker
- Instance of N.popup: popup
  > The Controller object of the loaded pop-up content is stored in the .block_overlay_msg__ > .msg_box__ > .view_context__ element.
- Instance of N.tab: tab
  > The Controller object of the loaded tab content is stored in the .tab__ > .{tab content element id} > .view_context__ element.
- Instance of N.select: select
- Instance of N.form: form
- Instance of N.list: list
- Instance of N.grid: grid
- Instance of N.pagination: pagination
- Instance of N.tree: tree
- Instance of N.notify: notify
- Instance of N.docs: docs

> Components that do not specify where to store the instance are stored in the element specified by the context option.

#### instance

Type: object|function

Callback function to get the instance or instance to be saved in the selected element.

> As the argument of callback, index(arguments[0]) and each instance(arguments[1]) are returned. This callback function's "this" points to each instance.

## N("selector").tpBind

Even if an event of the same name is defined in the selected element, the event defined by tpBind is executed first.

The basic usage is the same as the [jQuery().bind](//api.jquery.com/bind) method.

### Parameters

#### event

Type: string

Event type

#### handler

Type: function

Event handler

## N("selector").vals

Gets or selects the selected value of a selection element such as select, select[multiple=multiple], input[type=radio], input[type=checkbox].

- If the vals argument is not entered, the selected values are returned. If the vals argument is specified, option elements that match the entered values are selected.
- If only one is selected, only one value of type string is returned, and if it is more than two, values are returned in an array.

> In the case of checkbox, if there is only one option, it works in decision mode like Y/N or 1/0.
>
> Whether the standard value of a single selection is Y / N, 1/0, or on / off can be set to the **N.context.attr("core").sgChkdVal("check value")** and **N.context.attr("core").sgChkdVal("uncheck value")** variable values of natural.config.js.

### Parameters

#### vals

Type: array|string|function

When specifying a single value, specify the value as a string and when selecting two or more options, specify the value by storing the string in an array.

If function is specified, the specified callback function is executed as many as the number of selected option elements. The arguments of the callback function are as follows:

- this: Selected option element
- arguments[0]: Index of selected option element
- arguments[1]: Selected option element

## N(array).remove_

Removes the elements of the array specified as arguments.

### Parameters

#### idx

Type: number

Index of elements to remove from the array

#### length

Type: number

Number of array elements to remove

## N(selector).events

Returns the events bound to the selected element.

> If both the eventType and namespace arguments are not entered, all events are returned. If no namespace is entered, only the events corresponding to the specified eventType are returned.
>
> If the namespace argument is entered, the event is returned as an array object type. Otherwise, the event is returned as a jQuery object type. If there are no bound events, undefined is returned.

### Parameters

#### eventType

Type: string

Event type

#### namespace

Type: string

Event namespace
