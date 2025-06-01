# Controller Constructor

The `N.cont` constructor initializes a Controller object for a specific view element in the DOM. This Controller object serves as the entry point for controlling the view and its associated data.

## Overview

Controller objects are a central part of Natural-JS's architecture, providing a structured way to manage UI interactions, data binding, and business logic. The constructor is responsible for initializing the Controller object and associating it with a view element.

## Constructor Syntax

```javascript
N(selector).cont(controllerObject)
```

Or alternatively:

```javascript
new N.cont(viewElement, controllerObject)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| selector / viewElement | String / jQuery Object | A CSS selector string or jQuery object that identifies the view element to be controlled |
| controllerObject | Object | An object containing methods and properties for controlling the view |

## Return Value

The constructor returns the initialized Controller object, which includes all user-defined properties and methods, as well as system-defined properties.

## Core Concepts

1. **View Binding**: The Controller is bound to a specific view element in the DOM, allowing it to manipulate and interact with that part of the interface.

2. **Initialization Process**: When a page with a Controller is loaded (via `N.comm`, `N.popup`, or `N.tab`), the system automatically calls the Controller's `init` function.

3. **Scope Management**: The Controller provides a consistent scope for all its methods, ensuring proper access to view elements and state.

## System-defined Properties

After initialization, the Controller object includes the following system-defined properties:

| Property | Type | Description |
|----------|------|-------------|
| view | jQuery Object | The view element that the Controller is bound to (same as the first argument of the init function) |
| request | Communicator.request | The request object used to load the page (same as the second argument of the init function) |
| caller | Component Instance | If the page was opened by a component like `N.popup` or `N.tab`, this contains the instance of the calling component |

## Examples

### Basic Controller Initialization

```javascript
N(".myView").cont({
    init: function(view, request) {
        // Initialize components, bind events, etc.
        N("button", view).button();
        
        // Access request parameters if needed
        var id = request.attr("id");
        
        // Call other methods defined in this Controller
        this.loadData(id);
    },
    
    loadData: function(id) {
        // Implementation details...
    }
});
```

### Alternative Initialization with Variable Reference

```javascript
(function() {
    // Store a reference to access the Controller object from any function scope
    var cont = N(".myView").cont({
        init: function(view, request) {
            this.setupUI();
        },
        
        setupUI: function() {
            // Access the view via the controller reference
            N("button", cont.view).on("click", function() {
                // Do something
            });
        }
    });
})();
```

## Best Practices

1. **Always use the view context**: When selecting elements within a Controller method, always use the `view` parameter as the context to avoid selecting elements from other parts of the page:
   ```javascript
   // Correct
   N("selector", view).hide();
   // Or
   view.find("selector").hide();
   
   // Incorrect - might select elements outside your view
   N("selector").hide();
   ```

2. **Use a variable reference**: For easier access to the Controller object across all methods, store it in a variable:
   ```javascript
   var cont = N(".view").cont({...});
   ```

3. **Keep state in the Controller**: Store page-specific state within the Controller object rather than in global variables to avoid conflicts and memory issues.
