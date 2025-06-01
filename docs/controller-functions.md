# Controller Object Functions

Controller objects in Natural-JS have special functions that define how the Controller interacts with the view and responds to lifecycle events. This document covers the built-in functions and how to implement your own custom functions.

## Built-in Functions

### init

The `init` function is a special lifecycle function that is automatically called after the view loading and Controller object initialization are complete. This is the primary entry point for your application logic.

**Syntax:**

```javascript
N(".view").cont({
    init: function(view, request) {
        // Initialization code here
    }
});
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| view | jQuery object | The view element that the Controller is bound to. This is the same as the `view` constant in the Controller object. |
| request | Communicator.request | The Communicator.request object for the Communicator (N.comm) that loaded this page. This is the same as the `request` constant in the Controller object. |

**Return Value:** None

**Usage:**

The `init` function is where you should:
- Initialize UI components
- Set up event handlers
- Load initial data
- Configure the application state

**Example:**

```javascript
N(".myView").cont({
    init: function(view, request) {
        // Initialize UI components
        N("button", view).button();
        N("#dataGrid", view).grid({
            columns: [
                { name: "id", label: "ID" },
                { name: "name", label: "Name" }
            ]
        });
        
        // Set up event handlers
        N("#searchButton", view).on("click", this.search);
        
        // Load initial data
        this.loadData();
    },
    
    loadData: function() {
        // Implementation...
    },
    
    search: function() {
        // Implementation...
    }
});
```

## Custom Functions

In addition to the `init` function, you can define any number of custom functions within your Controller object. These functions can be called from within other functions in the Controller or bound to UI events.

**Best Practices for Custom Functions:**

1. **Function Organization:**
   - Group related functions together
   - Use clear, descriptive names
   - Document complex logic with comments

2. **Event Handlers:**
   - Create dedicated functions for event handling
   - Ensure proper context by using `$.proxy()` or arrow functions

3. **Data Management:**
   - Create functions for data operations (load, save, update)
   - Keep data manipulation logic separate from UI logic

**Example with Custom Functions:**

```javascript
N(".userManagement").cont({
    init: function(view, request) {
        this.setupUI();
        this.bindEvents();
        this.loadUsers();
    },
    
    // UI Setup
    setupUI: function() {
        this.userGrid = N("#userGrid", this.view).grid({
            columns: [
                { name: "id", label: "ID" },
                { name: "name", label: "Name" },
                { name: "email", label: "Email" }
            ]
        });
        
        this.userForm = N("#userForm", this.view).form();
    },
    
    // Event Binding
    bindEvents: function() {
        N("#addButton", this.view).on("click", $.proxy(this.addUser, this));
        N("#saveButton", this.view).on("click", $.proxy(this.saveUser, this));
        N("#deleteButton", this.view).on("click", $.proxy(this.deleteUser, this));
        
        this.userGrid.on("select", $.proxy(this.onUserSelect, this));
    },
    
    // Data Operations
    loadUsers: function() {
        N.comm("api/users").submit($.proxy(function(data) {
            this.userGrid.bind(data);
        }, this));
    },
    
    saveUser: function() {
        if (!this.userForm.validate()) {
            return;
        }
        
        var userData = this.userForm.getData();
        N.comm("api/users/save")
            .request.data(userData)
            .submit($.proxy(function(response) {
                if (response.success) {
                    this.loadUsers();
                    this.userForm.clear();
                }
            }, this));
    },
    
    // Event Handlers
    onUserSelect: function(row) {
        this.userForm.bind(row.data);
    },
    
    addUser: function() {
        this.userForm.clear();
    },
    
    deleteUser: function() {
        var selectedUser = this.userGrid.selected();
        if (!selectedUser) {
            return;
        }
        
        if (confirm("Are you sure you want to delete this user?")) {
            N.comm("api/users/delete")
                .request.data({ id: selectedUser.id })
                .submit($.proxy(function(response) {
                    if (response.success) {
                        this.loadUsers();
                        this.userForm.clear();
                    }
                }, this));
        }
    }
});
```

## Function Context

Within any function in the Controller object, the `this` keyword refers to the Controller object itself. This allows you to access:

- Other functions within the Controller
- The built-in constants (view, request, caller, opener)
- Any custom properties you've defined

If you need to maintain the Controller's context in callback functions or event handlers, use one of these approaches:

1. **Using $.proxy:**
   ```javascript
   N("#button").on("click", $.proxy(this.handleClick, this));
   ```

2. **Using arrow functions (ES6):**
   ```javascript
   N("#button").on("click", () => this.handleClick());
   ```

3. **Storing the Controller reference:**
   ```javascript
   var self = this;
   N("#button").on("click", function() {
       self.handleClick();
   });
   ```
