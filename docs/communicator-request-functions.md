# Methods

The Communicator.request object provides several methods to manage request data, retrieve parameters, and control page reloading. These methods provide a powerful interface for interacting with the request lifecycle.

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| attr | N/A | N/A | set:Controller.request<br>get:anything | Specifies the data to be passed to the page to be loaded or get the delivered data.<br><br>**Note**: If the number of arguments of the attr method is 2, it works as set, and if 1, it works as get.<br><br>Passing data:<br>```javascript
N(".view").cont({
    init : function(view, request) {
        N("#section").comm("page.html")
            .request.attr("data1", { data : ["1", "2"] })
            .request.attr("data2", ["3", "4"])
                .submit();
    }
});
```<br><br>Get data from the loaded page:<br>```javascript
N(".view").cont({
    init : function(view, request) {
        var data1 = request.attr("data1"); // { data : ["1", "2"] }
        var data2 = request.attr("data2"); // ["3", "4"]
    }
});
``` |
| | name | string | N/A | Specifies the data name. |
| | value | anything | N/A | Specifies the data value. |
| param | N/A | N/A | string\|object | Extracts the GET parameter value from the browser URL. |
| | name | string | N/A | Specifies the key of the parameter. If not specified, the entire GET parameter is returned as an object type. |
| get | N/A | N/A | Value object | Get the default option information set on the Communicator.request instance.<br><br>In addition to the default options, you can get "referrer"(Browser URL when submit method is called) value. |
| | key | string | N/A | Specifies the default option name. If not specified, default option object is returned. |
| reload | N/A | N/A | Controller object | Reloads the block page loaded by Communicator.<br><br>**Note**: If the value is not specified with the attr method before calling the reload method, the value of the request object before reload is retained even when reloading.<br><br>**Note**: The request data of the page reloaded by the attr method can be specified again.<br>```javascript
request.attr("param", { param : 1 });
request.reload();
```<br><br>**Note**: The reload function does not support method chaining.<br>```javascript
request.attr("param", { param : 1 }).reload(); // Can not be used like this.
``` |
| | callback | string | N/A | Specifies the callback to be executed when reloading is complete. You do not need to specify it if you do not need it.<br>```javascript
request.reload(function(html, request) {
    N.log(html, request);
});
``` |

## Using Communicator.request Methods

The methods of the Communicator.request object are designed to work together to provide a cohesive way to manage request data and behavior. Here are some common patterns for using these methods:

### Data Passing Between Pages

```javascript
// In the source page
N("#target-container").comm("destination-page.html")
    .request.attr("userData", {
        id: 12345,
        name: "John Doe",
        preferences: {
            theme: "dark",
            language: "en"
        }
    })
    .submit();

// In the destination page
N("#destination-container").cont({
    init: function(view, request) {
        const userData = request.attr("userData");
        console.log(userData.id); // 12345
        console.log(userData.name); // "John Doe"
        console.log(userData.preferences.theme); // "dark"
    }
});
```

### Working with URL Parameters

```javascript
N("#container").cont({
    init: function(view, request) {
        // For URL: example.com?id=123&type=user
        const allParams = request.param(); // { id: "123", type: "user" }
        const id = request.param("id"); // "123"
        const type = request.param("type"); // "user"
        
        // Use the parameters to initialize the page
        if (type === "user") {
            this.loadUserData(id);
        }
    },
    
    loadUserData: function(id) {
        // Implementation...
    }
});
```

### Page Reloading with Updated Data

```javascript
// When a user action requires the page to be refreshed with new data
updatePage: function(newData) {
    this.request.attr("refreshData", newData);
    this.request.reload(function(html, request) {
        console.log("Page reloaded with new data");
        // Additional operations after reload
    });
}
```
