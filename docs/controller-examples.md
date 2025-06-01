# Controller Examples

This document provides practical examples of how to use the Controller in Natural-JS applications. These examples demonstrate best practices and common patterns for implementing Controllers effectively.

## Basic Controller Structure

The most basic Controller implementation defines a view and its corresponding Controller object:

```html
<!-- View -->
<article class="view">
    <p>View</p>
</article>

<!-- Controller -->
<script type="text/javascript">
    N(".view").cont({
        init: function(view, request) {
            N("p", view).css("padding", "10px");
        }
    });
</script>
```

In this example:
- The view is defined as an HTML article element with the class "view"
- The Controller is initialized with `N(".view").cont({...})`
- The `init` function is automatically called when the page loads
- Within the `init` function, elements are selected using the view as context

## Controller Object Access in All Functions

To access the Controller object from all functions within the Controller, store a reference to it in a variable:

```html
<article class="view">
    <p>View</p>
</article>

<script type="text/javascript">
(function() {
    var cont = N(".view").cont({
        init: function(view, request) {
            this.fn();
        },
        fn: function() {
           N("p", cont.view).css("padding", "10px");
        }
    });
})();
</script>
```

Key points:
- Wrap the Controller initialization in an IIFE (Immediately Invoked Function Expression)
- Store the Controller object in the `cont` variable
- Use `cont` to access Controller properties from any function
- This pattern ensures access to the Controller object regardless of function scope

## Component Initialization and Management

A common pattern is to initialize and manage UI components within the Controller:

```javascript
N(".userManagementView").cont({
    init: function(view, request) {
        // Initialize UI components
        this.initComponents();
        
        // Bind events
        this.bindEvents();
        
        // Load initial data
        this.loadData();
    },
    
    initComponents: function() {
        // Initialize form
        this.userForm = N("#userForm", this.view).form();
        
        // Initialize grid
        this.userGrid = N("#userGrid", this.view).grid({
            columns: [
                { name: "id", label: "ID" },
                { name: "name", label: "Name" },
                { name: "email", label: "Email" }
            ]
        });
        
        // Initialize buttons
        N(".action-buttons button", this.view).button();
    },
    
    bindEvents: function() {
        var self = this;
        
        // Button event handlers
        N("#addButton", this.view).on("click", function() {
            self.userForm.clear();
        });
        
        N("#saveButton", this.view).on("click", function() {
            self.saveUser();
        });
        
        // Grid event handlers
        this.userGrid.on("select", function(row) {
            self.userForm.bind(row.data);
        });
    },
    
    loadData: function() {
        var self = this;
        
        N.comm("users/list").submit(function(data) {
            self.userGrid.bind(data);
        });
    },
    
    saveUser: function() {
        var self = this;
        var userData = this.userForm.getData();
        
        N.comm("users/save")
            .request.data(userData)
            .submit(function(response) {
                if (response.success) {
                    self.loadData();
                }
            });
    }
});
```

## Communication Between Controllers

When working with multiple Controllers (such as in popups or tabs), you can establish communication between them:

```javascript
// Parent page Controller
N(".parentView").cont({
    init: function(view, request) {
        this.setupActions();
    },
    
    setupActions: function() {
        var self = this;
        
        N("#openDetailButton", this.view).on("click", function() {
            // Open a popup and pass the current Controller as opener
            N().popup({
                url: "detail.html",
                title: "User Detail",
                width: 600,
                height: 400,
                opener: self  // Pass this Controller to the popup
            }).open();
        });
    },
    
    // Method that will be called from the child Controller
    refreshData: function() {
        console.log("Refreshing parent data after child update");
        // Implementation...
    }
});

// Child page Controller (detail.html)
N(".detailView").cont({
    init: function(view, request) {
        this.setupActions();
    },
    
    setupActions: function() {
        var self = this;
        
        N("#saveButton", this.view).on("click", function() {
            // Save data...
            
            // Then notify the parent Controller to refresh
            if (self.opener) {
                self.opener.refreshData();
            }
            
            // Close this popup
            self.caller.close();
        });
    }
});
```

## Parameter Passing Between Controllers

You can pass parameters between Controllers using the request object:

```javascript
// Parent Controller
N(".listView").cont({
    init: function(view, request) {
        // Initialize grid with user data...
        
        this.userGrid.on("select", function(row) {
            // Open detail page with selected user data
            N().popup({
                url: "userDetail.html",
                title: "User Detail",
                width: 600,
                height: 400
            })
            .request.attr("userData", row.data)  // Pass data to the detail page
            .open();
        });
    }
});

// Detail Controller (userDetail.html)
N(".userDetailView").cont({
    init: function(view, request) {
        // Get the user data passed from the parent page
        var userData = request.attr("userData");
        
        if (userData) {
            // Bind the user data to the form
            this.userForm = N("#detailForm", view).form();
            this.userForm.bind(userData);
        }
    }
});
```

## Advanced Component Management with Namespaces

For complex pages with multiple components, you can use a naming convention to manage components effectively:

```javascript
N(".dashboardView").cont({
    // Component namespaces - use "p." prefix for UI components
    "p.grid.users": {
        columns: [
            { name: "id", label: "ID" },
            { name: "name", label: "Name" }
        ]
    },
    
    "p.grid.orders": {
        columns: [
            { name: "id", label: "Order ID" },
            { name: "date", label: "Date" },
            { name: "total", label: "Total" }
        ]
    },
    
    "p.form.userDetail": {
        validate: true
    },
    
    // Communication namespaces - use "c." prefix for communicators
    "c.getUsers": function() {
        return N.comm("api/users");
    },
    
    "c.getOrders": function() {
        return N.comm("api/orders");
    },
    
    // Event handlers - use "e." prefix for events
    "e.refreshButton.click": function() {
        this.loadData();
    },
    
    "e.userGrid.select": function(row) {
        this["p.form.userDetail"].bind(row.data);
    },
    
    // Regular methods
    init: function(view, request) {
        this.initComponents();
        this.bindEvents();
        this.loadData();
    },
    
    initComponents: function() {
        // Initialize grids
        N("#userGrid", this.view).grid(this["p.grid.users"]);
        N("#orderGrid", this.view).grid(this["p.grid.orders"]);
        
        // Initialize form
        N("#userDetailForm", this.view).form(this["p.form.userDetail"]);
    },
    
    bindEvents: function() {
        // Bind the refresh button click event
        N("#refreshButton", this.view).on("click", $.proxy(this["e.refreshButton.click"], this));
        
        // Bind the user grid select event
        N("#userGrid", this.view).on("select", $.proxy(this["e.userGrid.select"], this));
    },
    
    loadData: function() {
        var self = this;
        
        // Load users data
        this["c.getUsers"]().submit(function(data) {
            N("#userGrid", self.view).grid("instance").bind(data);
        });
        
        // Load orders data
        this["c.getOrders"]().submit(function(data) {
            N("#orderGrid", self.view).grid("instance").bind(data);
        });
    }
});
```

This approach offers several benefits:
- Clear organization of components, events, and communicators
- Easy to locate and understand the purpose of each piece
- Simplifies maintenance and debugging
