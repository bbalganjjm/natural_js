# Examples

The Context object (N.context) provides a central repository for data that needs to be accessible throughout the application. The following examples demonstrate common usage patterns.

## 1. Storing data in Context

```javascript
<script type="text/javascript">
    N.context.attr("globalInfo", {
        userId : "jeff1942",
        userNm : "Jeff Beck"
    });
</script>
```

## 2. Getting data stored in Context

```javascript
<script type="text/javascript">
    var globalInfo = N.context.attr("globalInfo");
</script>
```

## 3. Working with Nested Data

```javascript
<script type="text/javascript">
    // Store nested data
    N.context.attr("application", {
        name: "My Natural-JS App",
        version: "1.0.0",
        settings: {
            theme: "light",
            language: "en",
            features: {
                enableAnimation: true,
                cacheResults: true,
                maxItems: 100
            }
        }
    });
    
    // Access nested data
    var appName = N.context.attr("application").name;
    var language = N.context.attr("application").settings.language;
    var animationEnabled = N.context.attr("application").settings.features.enableAnimation;
    
    console.log(appName);         // "My Natural-JS App"
    console.log(language);        // "en"
    console.log(animationEnabled); // true
</script>
```

## 4. Storing and Updating User Preferences

```javascript
<script type="text/javascript">
    // Initialize user preferences
    N.context.attr("userPreferences", {
        theme: "light",
        fontSize: "medium",
        showNotifications: true,
        dashboardLayout: "grid"
    });
    
    // Function to update a specific preference
    function updatePreference(key, value) {
        var prefs = N.context.attr("userPreferences");
        prefs[key] = value;
        N.context.attr("userPreferences", prefs);
        
        // Optionally persist to localStorage for persistence across page refreshes
        localStorage.setItem("userPreferences", JSON.stringify(prefs));
    }
    
    // Update a preference
    updatePreference("theme", "dark");
    
    // Get the updated preferences
    var currentPrefs = N.context.attr("userPreferences");
    console.log(currentPrefs.theme); // "dark"
</script>
```

## 5. Sharing Data Between Controllers

```javascript
<script type="text/javascript">
    // In Controller A
    N("#controller-a").cont({
        init: function(view, request) {
            // Store data that needs to be shared
            N.context.attr("sharedData", {
                selectedItems: [1, 2, 3],
                timestamp: new Date()
            });
        }
    });
    
    // In Controller B
    N("#controller-b").cont({
        init: function(view, request) {
            // Access the shared data
            var sharedData = N.context.attr("sharedData");
            
            if (sharedData) {
                console.log("Selected items:", sharedData.selectedItems);
                console.log("Timestamp:", sharedData.timestamp);
                
                // Use the shared data
                this.processItems(sharedData.selectedItems);
            }
        },
        
        processItems: function(items) {
            // Process the items
            // ...
        }
    });
</script>
```

## 6. Using Context for Feature Flags

```javascript
<script type="text/javascript">
    // Initialize feature flags
    N.context.attr("features", {
        enableNewUI: true,
        betaFeatures: false,
        experimentalAPI: false,
        debugMode: window.location.hostname === "localhost"
    });
    
    // Check feature flags before enabling functionality
    function initializeApp() {
        var features = N.context.attr("features");
        
        // Conditionally initialize features based on flags
        if (features.enableNewUI) {
            initializeNewUI();
        } else {
            initializeLegacyUI();
        }
        
        if (features.betaFeatures) {
            enableBetaFeatures();
        }
        
        if (features.debugMode) {
            enableDebugTools();
        }
    }
    
    initializeApp();
</script>
```
