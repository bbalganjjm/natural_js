# Controller API Demo

The demo does not include all options and features. For a complete list of features, please refer to the documentation of options and functions.

## Controller Basics

```javascript
// Basic Controller initialization
N(".myView").cont({
    // Controller init function
    init : function(view, request) {
        // 'view' is the jQuery object of the element selected with the selector
        // 'request' contains parameters passed when loading the page
        
        // Define controller properties
        this.data = null;
        
        // Initialize UI components
        this.initUI();
        
        // Load data
        this.loadData();
    },
    
    // Initialize UI components
    initUI : function() {
        // Example: Initialize button component
        this.btnSearch = N(".btn-search", this.view).button({
            size : "medium",
            click : $.proxy(this.search, this)
        });
        
        // Example: Initialize form component
        this.form = N("form", this.view).form({
            validate : true,
            submit : $.proxy(this.submit, this)
        });
    },
    
    // Load data method
    loadData : function() {
        N.comm({
            url : "sample/getSampleList.json",
            success : $.proxy(this.loadDataCallback, this)
        }).submit();
    },
    
    // Callback after loading data
    loadDataCallback : function(data) {
        this.data = data;
        // Process data...
    },
    
    // Search method
    search : function() {
        // Search implementation...
    },
    
    // Submit method
    submit : function() {
        // Submit implementation...
    }
});
```

## Controller Properties and Methods

Controllers can be accessed from other pages or components using the `instance()` method:

```javascript
// Get controller instance
var controller = N("#myPage").instance("cont");

// Call controller methods
controller.search();

// Access controller properties
var data = controller.data;
```

## Controller Event Handling

```javascript
N(".myView").cont({
    init : function(view, request) {
        // Event binding using jQuery proxy
        N(".button", view).on("click", $.proxy(this.onButtonClick, this));
    },
    
    onButtonClick : function(e) {
        // Handle button click event
        N.alert("Button clicked!");
    }
});
```

## Controller AOP Integration

```javascript
N.context.attr("architecture").cont = {
    pointcuts : {
        "pages" : { target : /.*/, method : ".*" }
    },
    advisors : {
        "before" : {
            pointcut : "pages",
            advice : function(cont, args, target, method) {
                console.log("Before executing " + method + " on page " + cont.view.attr("id"));
            }
        },
        "after" : {
            pointcut : "pages",
            advice : function(cont, args, target, method) {
                console.log("After executing " + method + " on page " + cont.view.attr("id"));
            }
        }
    }
};
```
