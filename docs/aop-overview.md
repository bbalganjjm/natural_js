# AOP Overview

Aspect-Oriented Programming (AOP) is a programming paradigm that aims to increase modularity by allowing the separation of cross-cutting concerns. Natural-JS provides AOP support for Controller objects, enabling developers to apply common logic across multiple components without duplicating code.

## What is AOP?

AOP complements Object-Oriented Programming (OOP) by providing another way of thinking about program structure. While OOP modularizes applications using classes and objects, AOP modularizes them using aspects. Aspects enable the modularization of concerns (such as logging, security, transaction management) that cut across multiple types and objects.

In Natural-JS, AOP allows you to intercept the execution of functions in Controller objects, applying additional behavior before, after, or around the execution of those functions, or when an error occurs.

## Key Concepts in AOP

### Pointcut

A pointcut is an expression that selects specific join points (in Natural-JS, these are functions in Controller objects) where advice should be applied. Natural-JS provides built-in pointcut types for easy selection of target functions:

- **regexp**: The most commonly used pointcut type, which matches function names using regular expressions

### Advice

Advice defines the action to be taken at a particular join point. Natural-JS supports several types of advice:

- **before**: Executed before the target function
- **after**: Executed after the target function, receiving the return value of the function
- **around**: Provides complete control over the function execution, with the ability to modify inputs and outputs
- **error**: Executed when an exception occurs in the target function

### Advisor

An advisor combines a pointcut with advice, defining both what functions to target and what action to take when those functions are executed.

## Benefits of AOP in Natural-JS

- **Code Reusability**: Apply common logic across multiple Controller objects without duplication
- **Clean Separation of Concerns**: Keep business logic separate from cross-cutting concerns
- **Centralized Configuration**: Manage cross-cutting concerns in a central configuration
- **Enhanced Productivity**: Reduce boilerplate code and simplify maintenance
- **Standardization**: Enforce consistent behavior across the application

## Using AOP in Natural-JS

AOP declarations are defined in the `N.context.attr("architecture").cont` section of the Natural-JS configuration file (`natural.config.js`). This centralized approach allows you to manage all aspects in one place.

```javascript
N.context.attr("architecture", {
    "cont": {
        "pointcuts": {
            // Define custom pointcuts here (optional, as regexp is built-in)
            "customPointcut": {
                "fn": function(param, cont, fnChain) {
                    // Your pointcut logic here
                    return true; // Return boolean to determine if advice should be applied
                }
            }
        },
        "advisors": [{
            // Define what functions to target
            "pointcut": "^init$",  // Target all init functions (using regexp)
            
            // Define when to execute the advice
            "adviceType": "before", // before, after, around, or error
            
            // Define the advice function
            "fn": function(cont, fnChain, args) {
                // Your advice logic here
                console.log("Before executing init function");
            }
        }]
    }
});
```

## Common Use Cases

### 1. Logging and Debugging

Track function calls, parameters, and execution times for debugging and monitoring:

```javascript
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
```

### 2. Data Preprocessing

Validate or transform data before it's processed by the target function:

```javascript
"advisors": [{
    "pointcut": "^save",  // Apply to all save functions
    "adviceType": "before",
    "fn": function(cont, fnChain, args) {
        // Sanitize input data
        if (args[0] && args[0].data) {
            args[0].data = sanitizeData(args[0].data);
        }
    }
}]
```

### 3. Error Handling

Provide centralized error handling across the application:

```javascript
"advisors": [{
    "pointcut": ".*",  // Apply to all functions
    "adviceType": "error",
    "fn": function(cont, fnChain, args, result, error) {
        console.error("Error in function " + fnChain + ":", error);
        N().alert("An error occurred: " + error.message).show();
    }
}]
```

### 4. Component Initialization

Automatically initialize UI components after page loading:

```javascript
"advisors": [{
    "pointcut": "^init$",  // Target all init functions
    "adviceType": "after",
    "fn": function(cont, fnChain, args) {
        // Initialize buttons
        N("button", cont.view).button();
        
        // Initialize other components
        N(".datepicker", cont.view).datepicker();
    }
}]
```

## Important Notes

- AOP in Natural-JS can only be applied to user-defined functions in Controller objects, not to built-in framework functions.
- If you use a Controller object function with the `new` operator, it may cause errors. In such cases, exclude that function from the pointcut.
- Use AOP judiciously - while it can greatly enhance modularity, overuse can make the application flow difficult to understand.
- When implementing advice functions, be aware of potential performance implications, especially for advice that applies to many functions.

By effectively leveraging AOP in Natural-JS, you can significantly improve code organization, maintainability, and development productivity.
