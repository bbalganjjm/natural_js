# Default Options & Functions of Filter Object

Communication Filters provide powerful hooks into the communication lifecycle. Each filter object can implement one or more of the following options and functions to intercept and modify the communication process.

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| order | number | undefined | No | Set the execution order of filter objects.<br><br>**Note**: Filters with the order attribute defined are executed first, followed by filters with no order attribute defined. |
| beforeInit | function | undefined | No | This function is executed before all N.comm is initialized.<br><br>**Note**: This event is executed before N.comm is instantiated, not before the Controller object init method is executed.<br><br>The following object or value is specified as an argument of the event handler function:<br>- obj: Argument of the N() function before calling the comm method of Communication that is the parameter data object or the element to insert page.<br><br>**Note**: If the parameter data is of type object, the original object (jQuery object type) before conversion to a string in Communicator is returned. If it is of element type, the selected element is returned.<br><br>**Note**: If obj is modified and returned, the returned obj is applied to all Communicators.<br><br>**Note**: If the Error object is returned from the event handler function, the filter in the next step is not executed.<br>```javascript
...
beforeInit: function(obj) {
    if(data && data.fail){
        return new Error("The filter stops executing after this.");
    }
}
...
``` |
| afterInit | function | undefined | No | This function is executed after N.comm is initialized.<br><br>**Note**: This event is executed before N.comm is instantiated, not before the Controller object init method is executed.<br><br>The following object or value is specified as an argument of the event handler function:<br>- request(arguments[0]): Communicator.request<br><br>**Note**: If the Error object is returned from the event handler function, the filter in the next step is not executed.<br>```javascript
...
afterInit: function(request) {
    if(data && data.fail){
        return new Error("stop filter execution after this");
    }
}
...
``` |
| beforeSend | function | undefined | No | This function is executed before sending a request to the server.<br><br>The following object or value is specified as an argument of the event handler function:<br>- request(arguments[0]): Communicator.request<br>- xhr(arguments[1]): jQuery XMLHTTPRequest<br>- settings(arguments[2]): [Request information](http://api.jquery.com/jquery.ajax/) of jQuery XMLHTTPRequest<br><br>**Note**: If the Error object is returned from the event handler function, the filter in the next step is not executed.<br>```javascript
...
beforeSend: function(request, xhr, settings) {
    if(data && data.fail){
        return new Error("stop filter execution after this");
    }
}
...
``` |
| success | function | undefined | No | This function is executed when the request is successful.<br><br>**Note**: If you return by modifying the data argument, you can receive the modified data as response data of all N.comm.<br><br>The following object or value is specified as an argument of the event handler function:<br>- request(arguments[0]): Communicator.request<br>- data(arguments[1]): Server response data (JSON, HTML, etc.)<br>- textStatus(arguments[2]): Server response status ("success", "notmodified", "nocontent", "error", "timeout", "abort", or "parsererror")<br>- xhr(arguments[3]): jQuery XMLHTTPRequest<br><br>**Note**: If the Error object is returned from the event handler function, the filter in the next step is not executed.<br>```javascript
...
success: function(request, data, textStatus, xhr) {
    if(data && data.fail){
        return new Error("stop filter execution after this");
    }
}
...
``` |
| error | function | undefined | No | This function is executed when an error occurs on the server.<br><br>The following object or value is specified as an argument of the event handler function:<br>- request(arguments[0]): Communicator.request<br>- xhr(arguments[1]): jQuery XMLHTTPRequest<br>- textStatus(arguments[2]): Server response status ("timeout", "error", "abort", and "parsererror")<br>- errorThrown(arguments[3]): Error thrown object<br><br>**Note**: If the Error object is returned from the event handler function, the filter in the next step is not executed.<br>```javascript
...
error: function(request, xhr, textStatus, errorThrown) {
    if(data && data.fail){
        return new Error("stop filter execution after this");
    }
}
...
``` |
| complete | function | undefined | No | This function is executed when the server response is completed.<br><br>The following object or value is specified as an argument of the event handler function:<br>- request(arguments[0]): Communicator.request<br>- xhr(arguments[1]): jQuery XMLHTTPRequest<br>- textStatus(arguments[2]): Server response status ("success", "notmodified", "nocontent", "error", "timeout", "abort", or "parsererror")<br><br>**Note**: If the Error object is returned from the event handler function, the filter in the next step is not executed.<br>```javascript
...
complete: function(request, xhr, textStatus) {
    if(data && data.fail){
        return new Error("stop filter execution after this");
    }
}
...
``` |

## Filter Function Return Values

Filter functions can return different values to control the flow of the communication process:

1. **Return nothing (undefined)**: The filter chain continues normally.
2. **Return an Error object**: The filter chain is interrupted and no further filters in the current stage will be executed.
3. **Return a modified data object (in success function)**: The modified data will be used in the rest of the communication process.

## Filter Execution Order

When multiple filters are defined, they are executed in the following order:

1. Filters with an `order` property defined, in ascending order of their `order` value.
2. Filters without an `order` property, in the order they were defined in the configuration.
