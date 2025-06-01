# AOP Examples

This document provides practical examples of how to use Aspect-Oriented Programming (AOP) in Natural-JS to implement cross-cutting concerns and common functionalities across your application.

## 1. AOP Configuration

AOP settings are defined in the `N.context.attr("architecture").cont` property of the `natural.config.js` configuration file. The following example shows a complete AOP configuration with different types of advice:

```javascript
N.context.attr("architecture", {
    "cont": {
        "pointcuts": {
            "regexp": {
                "fn": function(param, cont, fnChain) {
                    var regexp = param instanceof RegExp ? param : new RegExp(param);
                    return regexp.test(fnChain);
                }
            },
            "errorPointcut": {
                "fn": function(param, cont, fnChain) {
                    // Unconditionally allowed
                    return true;
                }
            }
        },
        "advisors": [{
            "pointcut": "^before.*",
            "adviceType": "before",
            "fn": function(cont, fnChain, args) {
                console.log("call me before %s", fnChain);
            }
        }, {
            "pointcut": "^after.*",
            "adviceType": "after",
            "fn": function(cont, fnChain, args, result) {
                console.log("call me after %s", fnChain);
                console.log("result", result);
            }
        }, {
            "pointcut": "^around.*",
            "adviceType": "around",
            "fn": function(cont, fnChain, args, joinPoint) {
                console.log("call me around %s", fnChain);
                var result = joinPoint.proceed();
                console.log("result ", result);
                return result;
            }
        }, {
            "pointcut": {
                "type": "errorPointcut",
                "param": ""
            },
            "adviceType": "error",
            "fn": function(cont, fnChain, args, result, e) {
                console.log("call me error %s", fnChain);
            }
        }]
    }
});
```

This configuration:
1. Defines two pointcuts: `regexp` (for matching function names with regular expressions) and `errorPointcut` (for error handling)
2. Sets up four advisors that demonstrate all advice types:
   - `before`: Executes before functions whose names start with "before"
   - `after`: Executes after functions whose names start with "after"
   - `around`: Executes around functions whose names start with "around"
   - `error`: Executes when an error occurs in any function

## 2. Loading Common Code for All Pages

The following example demonstrates how to load common code for all pages, bind it to elements using the N.select component, and then execute the Controller's init function:

```javascript
N.context.attr("architecture", {
    "cont": {
        "advisors": [{
            "pointcut": "^init$",
            "adviceType": "around",
            "fn": function(cont, fnChain, args, joinPoint) {
                // 1. Load common code data
                N.comm("getCommCodeList.json").submit(function(data) {
                    // 2. Bind common code to selection elements with N.select
                    N(data).select({
                        context: N("#select", cont.view)
                    }).bind()

                    // 3. Execute init function
                    joinPoint.proceed();
                });
            }
        }]
    }
});
```

This advisor:
1. Intercepts all `init` functions in Controller objects
2. Loads common code data from the server using `N.comm`
3. Binds the data to select elements within the Controller's view
4. Finally executes the original `init` function

## 3. Automatic Component Initialization

This example shows how to automatically initialize UI components (buttons, forms, grids, lists) when a page loads, before the Controller's init function executes:

```javascript
N.context.attr("architecture", {
    "cont": {
        "advisors": [{
            "pointcut": "^init$",
            "adviceType": "around",
            "fn": function(cont, fnChain, args, joinPoint) {
                // 1. Initialize button components
                N(".button").button();

                // 2. Initialize form components
                N(".form", cont.view).each(function() {
                    N([]).form(this);
                });

                // 3. Initialize list components
                N(".list", cont.view).each(function() {
                    N([]).list(this);
                });

                // 4. Initialize grid components
                N(".grid", cont.view).each(function() {
                    N([]).grid(this);
                });

                // 5. Execute the original init function
                joinPoint.proceed();

                // 6. After initialization, get component instances from context and use them
                var grid01 = N("#grid01", cont.view).instance("grid");
                grid01.bind([]);
            }
        }]
    }
});
```

This advisor:
1. Initializes various UI components by selecting elements within the Controller's view
2. Executes the original `init` function
3. After initialization, retrieves component instances and performs additional operations

## 4. Logging and Performance Monitoring

The following example demonstrates how to add logging and performance monitoring to all Controller functions:

```javascript
N.context.attr("architecture", {
    "cont": {
        "advisors": [{
            "pointcut": ".*",  // Apply to all functions
            "adviceType": "around",
            "fn": function(cont, fnChain, args, joinPoint) {
                console.log("Entering function: " + fnChain);
                var startTime = new Date().getTime();
                
                var result = joinPoint.proceed();
                
                var endTime = new Date().getTime();
                console.log("Exiting function: " + fnChain + " (execution time: " + (endTime - startTime) + "ms)");
                
                return result;
            }
        }]
    }
});
```

This advisor:
1. Intercepts all functions in all Controller objects
2. Logs when a function is entered
3. Measures execution time
4. Logs when a function exits, along with its execution time

## 5. Data Validation Before Save Operations

This example shows how to add validation before save operations:

```javascript
N.context.attr("architecture", {
    "cont": {
        "advisors": [{
            "pointcut": "^save",  // Apply to all functions starting with "save"
            "adviceType": "before",
            "fn": function(cont, fnChain, args) {
                // Check if the form is valid before proceeding
                var form = N("form", cont.view);
                if (form.length > 0) {
                    var validator = N(form).validator();
                    if (!validator.validate()) {
                        throw N.error("Please correct the errors in the form before saving.");
                    }
                }
            }
        }]
    }
});
```

This advisor:
1. Intercepts all functions that start with "save"
2. Finds a form within the Controller's view
3. Validates the form before allowing the save operation to proceed
4. Throws an error if validation fails

## 6. Centralized Error Handling

The following example implements centralized error handling for all Controller functions:

```javascript
N.context.attr("architecture", {
    "cont": {
        "advisors": [{
            "pointcut": {
                "type": "errorPointcut",
                "param": ""
            },
            "adviceType": "error",
            "fn": function(cont, fnChain, args, result, e) {
                // Log the error
                console.error("Error in function " + fnChain + ":", e);
                
                // Display a user-friendly message
                if (e.message) {
                    N().alert(e.message).show();
                } else {
                    N().alert("An unexpected error occurred. Please try again.").show();
                }
                
                // Additional error handling logic
                if (fnChain.indexOf("save") > -1) {
                    // Special handling for save operations
                    N(".saveBtn", cont.view).prop("disabled", false);
                }
            }
        }]
    }
});
```

This advisor:
1. Catches all errors in all Controller functions
2. Logs detailed error information to the console
3. Shows a user-friendly message
4. Applies special handling for specific types of functions

## Best Practices

1. **Organize AOP Declarations**: Group related advisors together for better readability and maintenance.

2. **Use Specific Pointcuts**: Target only the functions that need the advice, rather than applying advice too broadly.

3. **Keep Advice Functions Simple**: Implement each advice to do one thing well, rather than combining multiple concerns.

4. **Consider Performance**: Be aware that AOP can add overhead, especially for frequently called functions.

5. **Test Thoroughly**: Since AOP can change behavior across the application, thorough testing is essential.

By effectively using AOP in Natural-JS, you can significantly improve code organization, reduce duplication, and enforce consistent behavior across your application.
