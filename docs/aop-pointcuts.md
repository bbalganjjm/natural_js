# Pointcuts Object

The pointcuts object is a key component of Natural-JS's AOP (Aspect-Oriented Programming) implementation. It defines the criteria for selecting which functions in Controller objects should have advice applied to them.

## Configuration Location

Pointcuts are defined in the `N.context.attr("architecture").cont.pointcuts` property of the `natural.config.js` configuration file.

## Structure

A pointcut definition consists of a unique name (as the object key) and an object containing a function that determines whether a particular function in a Controller object should be affected by an advice.

```javascript
N.context.attr("architecture", {
    "cont": {
        "pointcuts": {
            "pointcutName": {
                "fn": function(param, cont, fnChain) {
                    // Pointcut logic...
                    return true; // Return true to apply advice, false to skip
                }
            }
        }
    }
});
```

## Pointcut Function Parameters

The pointcut function receives three parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| param | RegExp or string | The regular expression string or RegExp object passed in the advisor definition |
| cont | Object | The Controller object that contains the function being evaluated |
| fnChain | String | A string representation of the function chain, in the format "viewSelector:functionName.functionName..." |

## Return Value

The pointcut function must return a boolean value:

- `true`: The advice will be applied to the function
- `false`: The advice will not be applied to the function

## Built-in Pointcuts

Natural-JS comes with built-in pointcuts that you can use without defining custom ones:

### regexp

The most commonly used pointcut, which evaluates functions based on regular expressions. This is built into Natural-JS and covers most use cases.

```javascript
"regexp": {
    "fn": function(param, cont, fnChain) {
        var regexp = param instanceof RegExp ? param : new RegExp(param);
        return regexp.test(fnChain);
    }
}
```

Usage in an advisor:

```javascript
"advisors": [{
    "pointcut": "^init$", // Use regexp pointcut to match all functions named "init"
    "adviceType": "before",
    "fn": function(cont, fnChain, args) {
        // Advice logic...
    }
}]
```

### errorPointcut

A built-in pointcut for error handling that unconditionally returns true, allowing the advice to be applied to all functions.

```javascript
"errorPointcut": {
    "fn": function(param, cont, fnChain) {
        // Unconditionally allowed
        return true;
    }
}
```

## Creating Custom Pointcuts

While the built-in pointcuts cover most use cases, you can create custom pointcuts for more specific requirements:

### Example: Function Parameter Pointcut

This custom pointcut targets functions that have a specific parameter type:

```javascript
"parameterTypePointcut": {
    "fn": function(param, cont, fnChain) {
        // Get the function being evaluated
        var fn = cont;
        var parts = fnChain.split(":");
        if (parts.length > 1) {
            var functionPath = parts[1].split(".");
            for (var i = 0; i < functionPath.length; i++) {
                fn = fn[functionPath[i]];
                if (typeof fn !== "function") {
                    return false;
                }
            }
        }
        
        // Check function's source code for parameter type checks
        var fnSource = fn.toString();
        return fnSource.indexOf("instanceof " + param) > -1;
    }
}
```

Usage:

```javascript
"advisors": [{
    "pointcut": {
        "type": "parameterTypePointcut",
        "param": "FormData"
    },
    "adviceType": "before",
    "fn": function(cont, fnChain, args) {
        // This advice will apply to functions that check for FormData parameters
    }
}]
```

### Example: Function Name Pattern Pointcut

This pointcut matches functions based on a naming pattern beyond simple regular expressions:

```javascript
"namingPatternPointcut": {
    "fn": function(param, cont, fnChain) {
        // Extract the function name from the chain
        var parts = fnChain.split(":");
        var functionName = parts.length > 1 ? parts[1].split(".").pop() : "";
        
        // Check if function follows the specified naming pattern
        var patternParts = param.split("*");
        return functionName.startsWith(patternParts[0]) && 
               (patternParts.length === 1 || functionName.endsWith(patternParts[1]));
    }
}
```

Usage:

```javascript
"advisors": [{
    "pointcut": {
        "type": "namingPatternPointcut",
        "param": "save*Data"
    },
    "adviceType": "around",
    "fn": function(cont, fnChain, args, joinPoint) {
        // This advice will apply to functions like saveUserData, saveProductData, etc.
    }
}]
```

## Best Practices

1. **Use Built-in Pointcuts When Possible**: The built-in `regexp` pointcut is sufficient for most cases and is optimized for performance.

2. **Keep Pointcut Logic Simple**: Complex pointcut logic can impact performance, especially for applications with many Controller functions.

3. **Create Focused Pointcuts**: Design pointcuts that target specific categories of functions rather than applying complex logic to all functions.

4. **Document Custom Pointcuts**: If you create custom pointcuts, document their purpose and usage patterns for other developers.

5. **Test Pointcut Coverage**: Verify that your pointcuts are selecting exactly the functions you intend to target, no more and no less.

## Important Notes

- Pointcuts only apply to user-defined functions in Controller objects, not to built-in framework functions.
- When evaluating function chains, be aware that deeply nested functions might have long chain representations.
- If a pointcut function throws an error, the AOP system will skip applying advice to that function.
- For complex applications with many Controllers, consider the performance impact of your pointcut logic.
