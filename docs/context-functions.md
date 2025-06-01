# Methods

The N.context object provides a simple yet powerful API for storing and retrieving application-wide data and settings. The following table documents the available methods:

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| attr | N/A | N/A | set:N.context<br>get:anything | Specifies the data to be saved in the Context or get the specified data.<br><br>**Note**: If the number of arguments of the attr method is 2, it works as set, and if 1, it works as get. |
| | name | string | N/A | Specifies the data name. |
| | obj | anything | N/A | Specifies the data value. |

## Using the attr() Method

The `attr()` method is the primary interface for interacting with the N.context object. It serves as both a getter and a setter, depending on the number of arguments provided:

### Setting Values in Context

When called with two arguments, `attr()` functions as a setter:

```javascript
// Set a simple value
N.context.attr("myFlag", true);

// Set a complex object
N.context.attr("userSettings", {
    theme: "dark",
    fontSize: "medium",
    notifications: {
        email: true,
        push: false
    }
});

// Set nested values
N.context.attr("app.version", "1.2.3");
N.context.attr("app.releaseDate", new Date(2023, 5, 15));

// Method chaining is supported
N.context
    .attr("mode", "development")
    .attr("debug", true)
    .attr("logLevel", "verbose");
```

### Getting Values from Context

When called with a single argument, `attr()` functions as a getter:

```javascript
// Get a simple value
var myFlag = N.context.attr("myFlag"); // true

// Get a complex object
var userSettings = N.context.attr("userSettings");
console.log(userSettings.theme); // "dark"
console.log(userSettings.notifications.email); // true

// Get nested values
var appVersion = N.context.attr("app.version"); // "1.2.3"
```

### Accessing Default Configuration Values

N.context is commonly used to access the framework's configuration values:

```javascript
// Get core settings
var coreSettings = N.context.attr("core");

// Get specific core setting
var defaultLocale = N.context.attr("core.locale"); 

// Get architecture settings
var architecture = N.context.attr("architecture");

// Get specific Communicator filter
var commFilters = N.context.attr("architecture.comm.filters");
```

## Best Practices

When working with N.context, consider the following best practices:

1. **Use namespacing**: Organize your data with meaningful namespaces to avoid conflicts
   ```javascript
   // Good
   N.context.attr("myApp.user.preferences", {...});
   
   // Not recommended - too generic
   N.context.attr("preferences", {...});
   ```

2. **Avoid storing large datasets**: N.context is meant for configuration and small persistent data, not for large datasets
   ```javascript
   // Good
   N.context.attr("myApp.datasetId", "12345");
   
   // Not recommended
   N.context.attr("myApp.fullDataset", largeArrayWithThousandsOfItems);
   ```

3. **Consider data persistence needs**: Remember that N.context data persists only for the current page lifecycle
   ```javascript
   // For data that needs to survive page refreshes, use storage mechanisms
   localStorage.setItem("persistentPreference", JSON.stringify(preferences));
   
   // For current page data only
   N.context.attr("currentPageState", state);
   ```
