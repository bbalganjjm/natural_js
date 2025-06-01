# Default Options

The Communicator.request object is created each time N.comm is initialized, and its options are populated from the settings provided to the N.comm function or the N().comm method. These options control how the request is processed and how responses are handled.

The following table lists the default options for the Communicator.request object:

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| append | boolean | false | No | If set to `true`, the loaded page will be appended to the element specified by the `target` option rather than overwritten. |
| urlSync | boolean | true | No | If set to false, the response will not be blocked even if location.href when requesting to the server and location.href when receiving a response from the server are different. <br>**Note**: If the server response is blocked for unknown reasons, set this option to false to test. |
| dataIsArray | boolean | false | No | If set to true, the parameter object specified as an argument of N function in N().comm can be specified as an array type.<br>**Note**: If Communicator is used as N(params).comm(url).submit();, only the first object in the array is sent when the object type of params is array and the dataIsArray option is set to false. The cause of this problem is that if you call get function after setting the argument of jQuery function to array(jQuery([{}])) or object($({})), both return array ([{}]). Even if inconvenient, when sending an array to the server, set dataIsArray to true or use an object in an array.<br>**Note**: When Communicator is used as N.comm(params, url).submit();, params are not created as jQuery objects even if the dataIsArray option is not set to true, so they are sent as an array type.<br>**Note**: Natural-ARCHITECTURE v0.8.1.4 or later. |
| target | jQuery object | null | No | Specifies the element to insert HTML content.<br>**Note**: If Communicator is used as N(".block").comm("page.html").submit();, the N(".block") element object is assigned as the target attribute value. |
| contentType | string | application/json; charset=utf-8 | Yes | Specifies the contentType for server requests.<br>**Note**: The contentType option remains the same as the jQuery.ajax function option. See the contentType property in the settings section of the [jQuery.ajax](http://api.jquery.com/jquery.ajax/) manual. |
| cache | boolean | false | No | If set to true, it will force requested pages to be cached by the browser.<br>**Note**: The cache option remains the same as the jQuery.ajax function option. See the cache property in the settings section of the [jQuery.ajax](http://api.jquery.com/jquery.ajax/) manual. |
| type | string | POST | No | The HTTP method to use for the request (e.g. "POST", "GET", "PUT").<br>**Note**: The type option remains the same as the jQuery.ajax function option. See the type property in the settings section of the [jQuery.ajax](http://api.jquery.com/jquery.ajax/) manual. |
| data | json object array¹\|json object | null | No | Data to be sent to the server. It is converted to a string, if not already a string.<br>**Note**: The data option remains the same as the jQuery.ajax function option. See the data property in the settings section of the [jQuery.ajax](http://api.jquery.com/jquery.ajax/) manual. |
| dataType | string(xml, json, script, or html) | "json" | No | Set the server response data type(xml, json, script, or html).<br>**Note**: The dataType option remains the same as the jQuery.ajax function option. See the dataType property in the settings section of the [jQuery.ajax](http://api.jquery.com/jquery.ajax/) manual. |
| crossDomain | boolean | false | No | If you wish to force a crossDomain request(such as JSONP) on the same domain, set the value of crossDomain to true. This allows, for example, server-side redirection to another domain.<br>**Note**: The crossDomain option remains the same as the jQuery.ajax function option. See the crossDomain property in the settings section of the [jQuery.ajax](http://api.jquery.com/jquery.ajax/) manual. |

**Note**: N.comm uses the jQuery.ajax module to process Ajax requests. The options in jQuery.ajax also apply to N.comm except for beforeSend, success, error and complete options, which are handled internally by Natural-JS.

## Option Usage in the Communicator.request Context

When using the Communicator.request object, it's important to understand how these options influence the request lifecycle:

1. **Options Storage**: All options are stored in the `Communicator.request.options` object.
2. **Parameter Handling**: The parameters passed to N.comm are processed according to these options.
3. **Server Communication**: The options determine how the request is formatted when sent to the server.
4. **Response Processing**: They also influence how the response is handled after it's received.

## Example: Accessing Options in a Controller

```javascript
N("#container").cont({
    init: function(view, request) {
        // Access the request options
        console.log(request.options);
        
        // Access specific options
        console.log("Request type:", request.options.type);
        console.log("Content type:", request.options.contentType);
        
        // Access any parameters sent with the request
        console.log("Parameters:", request.options.data);
    }
});
```

---

**Footnotes**

1. An array object containing JSON format objects.
