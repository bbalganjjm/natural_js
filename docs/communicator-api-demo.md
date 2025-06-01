# Communicator API Demo

This document demonstrates the basic usage of the Communicator (N.comm) API in Natural-JS, showing how to load data from the server and how to load HTML pages.

## 1. Loading Data from Server

The following example demonstrates how to load JSON data from a server endpoint.

### Basic Setup

```javascript
// Configure Communicator options
var opts = {
    url: "data/users.json",  // URL to fetch data from
    type: "GET",             // HTTP method (GET, POST, PUT, DELETE)
    dataType: "json"         // Expected response type
};

// Create a Communicator instance and submit the request
N.comm(opts).submit(function(data, request) {
    // Handle the response data
    console.log(data);
    
    // The request object contains information about the request
    console.log(request);
});
```

### With Parameters

```javascript
// Create parameters for the request
var params = {
    userId: 123,
    includeDetails: true
};

// Send parameters with the request
N(params).comm("data/user-details.json").submit(function(data, request) {
    // Handle the response data
    console.log(data);
});
```

### Alternative Syntax

```javascript
// Alternative parameter passing
N.comm(params, "data/user-details.json").submit(function(data, request) {
    // Handle the response data
    console.log(data);
});
```

## 2. Loading HTML Pages

The following example demonstrates how to load an HTML page and insert it into a specified element.

### Basic Setup

```javascript
// Configure options
var opts = {
    url: "pages/userProfile.html",  // URL of the HTML page
    type: "GET",                    // HTTP method
    dataType: "html"                // Expected response type
};

// Target element to insert the HTML into
var targetElement = "#contentArea";

// Load the HTML page into the target element
N(targetElement).comm(opts).submit(function(controller) {
    // This callback is executed after the page is loaded and initialized
    // controller is the Controller object for the loaded page
    console.log(controller.view);    // The view (DOM element) of the loaded page
    console.log(controller.request); // The request object with parameters
});
```

### Passing Parameters to the Loaded Page

```javascript
// Configure options
var opts = {
    url: "pages/userProfile.html",
    type: "GET",
    dataType: "html"
};

// Load the HTML page with parameters
N("#contentArea").comm(opts)
    .request.attr("userId", 123)    // Add parameters to the request
    .submit(function(controller) {
        // The loaded page can access the parameters via controller.request
        console.log("Page loaded with userId:", controller.request.attr("userId"));
    });
```

## 3. Working with Forms and Other Components

Communicator integrates seamlessly with other Natural-JS components:

```javascript
// Get form data and send it to the server
N("#myForm").data().comm("data/save-user.json").submit(function(response) {
    if (response.success) {
        N().alert("User data saved successfully").show();
    }
});

// Or in a Controller object
"c.saveUser": function() {
    return this["p.form.user"].data().comm("data/save-user.json");
},

// Later in your code
this["c.saveUser"]().submit(function(response) {
    // Handle response
});
```

## 4. Error Handling

```javascript
N.comm("data/users.json").submit(function(data) {
    // Success handler
}).error(function(e) {
    // Error handler
    console.error("Failed to load data:", e);
    N().alert("Failed to load data: " + e.message).show();
});
```

## 5. Complete Example

Below is a complete example showing both data loading and page loading:

```javascript
// Load JSON data
document.getElementById("loadDataButton").addEventListener("click", function() {
    var dataUrl = document.getElementById("dataUrl").value;
    
    N.comm({
        url: dataUrl,
        type: "GET",
        dataType: "json"
    }).submit(function(data, request) {
        document.getElementById("dataResult").textContent = JSON.stringify(data, null, 2);
    }).error(function(e) {
        N().alert("Error loading data: " + e.message).show();
    });
});

// Load HTML page
document.getElementById("loadPageButton").addEventListener("click", function() {
    var pageUrl = document.getElementById("pageUrl").value;
    var targetElement = document.getElementById("pageTarget").value;
    var pageParam = document.getElementById("pageParam").value;
    
    N(targetElement).comm({
        url: pageUrl,
        type: "GET",
        dataType: "html"
    }).request.attr("param", pageParam)
      .submit(function(controller) {
          console.log("Page loaded successfully");
      }).error(function(e) {
          N().alert("Error loading page: " + e.message).show();
      });
});
```

## Notes

- The `submit()` method initiates the request and accepts a callback function that will be called when the request completes successfully.
- When loading HTML pages, the callback function receives the Controller object of the loaded page.
- When loading data, the callback function receives the response data and the request object.
- The `error()` method allows you to define a callback for handling errors.
- For more advanced options and configurations, refer to the Communicator Options and Functions documentation.

This API demo provides a basic introduction to the Communicator component. The actual implementation may require additional configuration based on your specific server endpoints and application requirements.
