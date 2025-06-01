# Examples

## 1. Filter Declaration

When working with Communication Filters in Natural-JS, it's important to understand:

- All requests and responses called by N.comm will pass through the defined filters, allowing you to implement common logic between server requests and responses.
- The request argument of filter event handler functions contains useful information about Ajax requests. For more information on the request object, see the [Communicator.request](communicator-request-overview.md) documentation.
- You can declare multiple filters, and the name of each filter object (filter property name in the filters object) can be specified freely.
- Filter settings are configured in the N.context.attr("architecture").comm.filters property of the natural.config.js file.

```javascript
N.context.attr("architecture", {
    "comm" : {
        "filters" : {
            "exFilter1" : {
                /**
                 * Filter execution order.
                 */
                order : 1,
                /**
                 * Executes before N.comm is initialized. You can get the parameters of original type 
                 * that have not been converted to string.
                 */
                beforeInit : function(obj) {
                },
                /**
                 * Executes after N.comm is initialized. (Not an "init" of N.cont.)
                 */
                afterInit : function(request) {
                },
                /**
                 * Executes before sending a request to the server.
                 */
                beforeSend : function(request, xhr, settings) {
                },
                /**
                 * Executes when a success response is sent from the server.
                 */
                success : function(request, data, textStatus, xhr) {
                    // If data is modified and returned, it is returned as the data argument value
                    // of all Communicator's submit callback functions.
                },
                /**
                 * Executes when an error response is sent from the server.
                 */
                error : function(request, xhr, textStatus, errorThrown) {
                },
                /**
                 * Executes when the server's response is complete.
                 */
                complete : function(request, xhr, textStatus) {
                }
            },
            "exFilter2" : {
                order : 2,
                beforeInit : function(obj) {
                },
                afterInit : function(request) {
                },
                beforeSend : function(request, xhr, settings) {
                },
                success : function(request, data, textStatus, xhr) {
                },
                error : function(request, xhr, textStatus, errorThrown) {
                },
                complete : function(request, xhr, textStatus) {
                }
            }
        }
    }
});
```

## 2. Authentication Filter Example

The following example demonstrates how to implement an authentication filter that adds an authentication token to all outgoing requests and handles authentication failures:

```javascript
N.context.attr("architecture", {
    "comm" : {
        "filters" : {
            "authFilter" : {
                order : 1,
                beforeSend : function(request, xhr, settings) {
                    // Add authentication token to all requests
                    if (!settings.headers) {
                        settings.headers = {};
                    }
                    
                    // Get token from localStorage or session
                    var authToken = localStorage.getItem("authToken");
                    if (authToken) {
                        settings.headers["Authorization"] = "Bearer " + authToken;
                    } else {
                        // Redirect to login if no token is available
                        window.location.href = "/login.html";
                        return new Error("Authentication required");
                    }
                },
                error : function(request, xhr, textStatus, errorThrown) {
                    // Handle authentication failures
                    if (xhr.status === 401 || xhr.status === 403) {
                        // Clear token and redirect to login
                        localStorage.removeItem("authToken");
                        window.location.href = "/login.html?reason=auth_failed";
                        return new Error("Authentication failed");
                    }
                }
            }
        }
    }
});
```

## 3. Loading Indicator Filter Example

This example shows how to implement a filter that displays and hides a loading indicator for all Ajax requests:

```javascript
N.context.attr("architecture", {
    "comm" : {
        "filters" : {
            "loadingIndicator" : {
                beforeSend : function(request, xhr, settings) {
                    // Skip for background requests if needed
                    if (settings.background === true) {
                        return;
                    }
                    
                    // Show loading indicator
                    var $indicator = $("#loading-indicator");
                    if ($indicator.length === 0) {
                        $indicator = $("<div id='loading-indicator'>Loading...</div>");
                        $("body").append($indicator);
                    }
                    
                    $indicator.show();
                },
                complete : function(request, xhr, textStatus) {
                    // Hide loading indicator
                    $("#loading-indicator").hide();
                }
            }
        }
    }
});
```

## 4. Data Transformation Filter Example

This example demonstrates a filter that transforms data before sending to the server and after receiving from the server:

```javascript
N.context.attr("architecture", {
    "comm" : {
        "filters" : {
            "dataTransform" : {
                beforeSend : function(request, xhr, settings) {
                    // Convert date objects to ISO strings in outgoing data
                    if (settings.data && typeof settings.data === "string") {
                        try {
                            var data = JSON.parse(settings.data);
                            
                            var convertDates = function(obj) {
                                for (var key in obj) {
                                    if (obj[key] instanceof Date) {
                                        obj[key] = obj[key].toISOString();
                                    } else if (typeof obj[key] === "object" && obj[key] !== null) {
                                        convertDates(obj[key]);
                                    }
                                }
                            };
                            
                            convertDates(data);
                            settings.data = JSON.stringify(data);
                        } catch (e) {
                            // Not JSON data, skip transformation
                        }
                    }
                },
                success : function(request, data, textStatus, xhr) {
                    // Transform server response data if needed
                    if (data && typeof data === "object") {
                        // For example, convert string dates to Date objects
                        var convertStringsToDates = function(obj) {
                            for (var key in obj) {
                                if (typeof obj[key] === "string" && 
                                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj[key])) {
                                    obj[key] = new Date(obj[key]);
                                } else if (typeof obj[key] === "object" && obj[key] !== null) {
                                    convertStringsToDates(obj[key]);
                                }
                            }
                        };
                        
                        convertStringsToDates(data);
                        return data; // Return modified data
                    }
                }
            }
        }
    }
});
```
