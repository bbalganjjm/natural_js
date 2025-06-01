# Examples

## 1. Passing data (page parameters) to the page to load

### 1.1. Execute the (Communicator instance).request.attr("name", object) command before calling the submit method

```javascript
N(".view").cont({
    init : function(view, request) {
        N("#section").comm("page.html")
            .request.attr("data1", { data : ["1", "2"] })
            .request.attr("data2", ["3", "4"])
                .submit();
    }
});
```

### 1.2. Get the data passed from the init method of the Controller object of the loaded page to the attr method of the Communicator.request instance

```javascript
N(".view").cont({
    init : function(view, request) {
        var data1 = request.attr("data1"); // { data : ["1", "2"] }
        var data2 = request.attr("data2"); // ["3", "4"]
    }
});
```

## 2. Working with URL parameters

### 2.1. Retrieving all URL parameters

```javascript
N(".view").cont({
    init : function(view, request) {
        // For URL: example.com?id=123&type=user&status=active
        var allParams = request.param(); 
        // Returns: { id: "123", type: "user", status: "active" }
        
        console.log(allParams);
    }
});
```

### 2.2. Retrieving a specific URL parameter

```javascript
N(".view").cont({
    init : function(view, request) {
        // For URL: example.com?id=123&type=user&status=active
        var id = request.param("id"); // "123"
        var type = request.param("type"); // "user"
        
        console.log("ID:", id);
        console.log("Type:", type);
    }
});
```

## 3. Reloading a page with new data

```javascript
N(".view").cont({
    init : function(view, request) {
        // Initial page load
        this.loadData();
    },
    
    loadData : function() {
        var self = this;
        
        // Fetch new data from server
        N.comm("data.json").submit(function(data) {
            // Update request data and reload the page
            self.request.attr("newData", data);
            self.request.reload(function(html, request) {
                console.log("Page reloaded with new data");
            });
        });
    }
});
```

## 4. Accessing request options

```javascript
N(".view").cont({
    init : function(view, request) {
        // Get all options
        var options = request.get();
        console.log("All options:", options);
        
        // Get specific option
        var contentType = request.get("contentType");
        console.log("Content Type:", contentType);
        
        // Get referrer URL
        var referrer = request.get("referrer");
        console.log("Referrer:", referrer);
    }
});
```

## 5. Complex data passing between pages

```javascript
// In the source page
N(".view").cont({
    init : function(view, request) {
        // Preparing complex data structure
        var userData = {
            profile: {
                id: 12345,
                name: "John Doe",
                email: "john@example.com"
            },
            permissions: ["read", "write", "admin"],
            settings: {
                theme: "dark",
                notifications: {
                    email: true,
                    sms: false,
                    push: true
                }
            }
        };
        
        // Passing the complex data to another page
        N("#target").comm("details.html")
            .request.attr("userData", userData)
            .submit();
    }
});

// In the destination page
N(".details").cont({
    init : function(view, request) {
        // Retrieving the complex data
        var userData = request.attr("userData");
        
        // Accessing nested properties
        console.log("User ID:", userData.profile.id);
        console.log("Permissions:", userData.permissions.join(", "));
        console.log("Theme:", userData.settings.theme);
        console.log("Push notifications:", 
            userData.settings.notifications.push ? "Enabled" : "Disabled");
        
        // Use the data to initialize the page
        this.renderUserProfile(userData.profile);
        this.setupPermissions(userData.permissions);
        this.applyTheme(userData.settings.theme);
    },
    
    renderUserProfile: function(profile) {
        // Implementation...
    },
    
    setupPermissions: function(permissions) {
        // Implementation...
    },
    
    applyTheme: function(theme) {
        // Implementation...
    }
});
```
