# Advisors Object

The advisors object is a key component of Natural-JS's Aspect-Oriented Programming (AOP) implementation. It defines which advice to apply to specific functions in Controller objects, along with when and how to apply them.

## Configuration Location

Advisors are defined in the `N.context.attr("architecture").cont.advisors` property of the `natural.config.js` configuration file.

## Structure

An advisor definition consists of the following properties:

### pointcut

**Type**: object key string|object  
**Required**: Yes

Defines the pointcut to which the advisor will be applied. The pointcut targets function names in Controller objects.

#### Specifying as an Object

```javascript
"pointcut": {
    "type": "regexp",
    "param": "^init$"
}
```

In this case, the object defined in the param property is passed as a parameter to the pointcut function specified by the type property.

#### Specifying as a String

```javascript
"pointcut": "^init$"
```

If the value of pointcut is a string rather than an object, the built-in "regexp" pointcut is used by default.

#### Targeting Specific Views

You can limit the pointcut to specific views by prefixing the pointcut parameter with a jQuery selector and a colon:

```javascript
"pointcut": ".page01,#page02,.page03:^init$"
```

This will only apply the advice to pages that match the specified selectors.

### adviceType

**Type**: string  
**Required**: Yes

Sets when to execute the advisor. Possible values:

- **before**: Executes before the function specified in the pointcut
- **after**: Executes after the function specified in the pointcut
- **around**: Provides a joinPoint that can execute the function specified in the pointcut
- **error**: Executes when an exception occurs in the function specified in the pointcut

### fn

**Type**: function  
**Required**: Yes

Defines the advisor function. The arguments of the function vary depending on the adviceType:

#### before

```javascript
function(cont, fnChain, args) {
    // Advice logic
}
```

- **cont**: Controller object
- **fnChain**: Function(name) chain string
- **args**: Arguments of the original function

#### after

```javascript
function(cont, fnChain, args, result) {
    // Advice logic
}
```

- **cont**: Controller object
- **fnChain**: Function(name) chain string
- **args**: Arguments of the original function
- **result**: Return value of the original function

#### around

```javascript
function(cont, fnChain, args, joinPoint) {
    // Before logic
    var result = joinPoint.proceed();
    // After logic
    return result;
}
```

- **cont**: Controller object
- **fnChain**: Function(name) chain string
- **args**: Arguments of the original function
- **joinPoint**: Object that can execute the original function via the proceed() method

#### error

```javascript
function(cont, fnChain, args, result, e) {
    // Error handling logic
}
```

- **cont**: Controller object
- **fnChain**: Function(name) chain string
- **args**: Arguments of the original function
- **result**: Return value from the function (if any was returned before the error)
- **e**: Error object thrown

## Examples

### Basic Before Advice

```javascript
"advisors": [{
    "pointcut": "^init$",
    "adviceType": "before",
    "fn": function(cont, fnChain, args) {
        console.log("Before executing init function");
    }
}]
```

### After Advice with Return Value

```javascript
"advisors": [{
    "pointcut": "^getData$",
    "adviceType": "after",
    "fn": function(cont, fnChain, args, result) {
        // Process the result after getData is called
        if (result && result.length > 0) {
            console.log("Data retrieved successfully");
        }
    }
}]
```

### Around Advice for Data Processing

```javascript
"advisors": [{
    "pointcut": "^save",
    "adviceType": "around",
    "fn": function(cont, fnChain, args, joinPoint) {
        // Pre-process data
        if (args[0] && args[0].data) {
            args[0].data = sanitizeData(args[0].data);
        }
        
        // Execute the original function
        var result = joinPoint.proceed();
        
        // Post-process the result
        console.log("Save operation completed");
        
        return result;
    }
}]
```

### Global Error Handling

```javascript
"advisors": [{
    "pointcut": {
        "type": "errorPointcut",
        "param": ""
    },
    "adviceType": "error",
    "fn": function(cont, fnChain, args, result, e) {
        console.error("Error in function " + fnChain + ":", e);
        N().alert("An error occurred: " + e.message).show();
    }
}]
```

## Best Practices

1. **Keep Advice Functions Simple**: Complex advice functions can affect performance, especially if they apply to many Controller functions.

2. **Use Around Advice Judiciously**: While around advice provides the most control, it can make code harder to understand. Use it only when you need to modify both inputs and outputs.

3. **Focus on Cross-Cutting Concerns**: AOP is best for concerns that apply across multiple functions, such as logging, validation, or error handling.

4. **Check for Pointcut Conflicts**: When multiple advisors target the same function, be aware of their execution order and potential interactions.

5. **Document Your Advisors**: Since AOP can change the behavior of functions in non-obvious ways, good documentation is essential.

## Important Notes

- Advisors can only be applied to user-defined functions in Controller objects, not to built-in framework functions.
- If you use a Controller object function with the `new` operator, it may cause errors. In such cases, exclude that function from the pointcut.
- When implementing advisors, be aware of potential performance implications, especially for advice that applies to many functions.
- The fn parameter of an advisor should not be an arrow function as it might interfere with proper `this` binding in some contexts.
