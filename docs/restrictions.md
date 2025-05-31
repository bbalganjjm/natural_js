# Restrictions

## Browser Compatibility Restrictions

* Natural-JS supports browsers that implement ECMAScript 5 (ES5) or higher.
* Internet Explorer (IE) 10 or higher is supported.
* Mobile browsers that support ES5 or higher are supported.

## Component Specific Restrictions

### Grid Component

* The Grid component does not support nested (hierarchical) grid structures.
* Row span is not supported in the grid component.
* When using a fixed header, horizontal scrolling can cause performance issues with large datasets.

### Form Component

* The Form component does not support form elements nested within nested tables.
* When binding data to elements with nested structures, only top-level elements are supported for data binding.

### Datepicker Component

* The Datepicker component cannot be used with input elements that have the readonly attribute set to true.
* The Datepicker component is optimized for the Gregorian calendar and may not properly support other calendar systems.

### Tree Component

* The Tree component has performance limitations when handling large hierarchical datasets (over 1,000 nodes).
* Dynamic loading of tree nodes from the server is supported, but with limited customization options.

## Framework Restrictions

### AOP (Aspect-Oriented Programming)

* AOP can only be applied to user-defined functions in Controller objects.
* AOP cannot be applied to built-in framework functions or methods.

### Communication Filter

* Communication filters only work with N.comm instances and cannot be applied to native XMLHttpRequest or fetch API calls.

### jQuery Dependency

* Natural-JS is built as an extension of jQuery and requires jQuery to function.
* Using Natural-JS with other DOM manipulation libraries like React or Angular may cause conflicts.

## Performance Considerations

* Using multiple Grid components with large datasets on a single page may cause performance issues.
* Two-way data binding between multiple components with large datasets may impact performance.
* Complex data processing operations should be performed on the server rather than client-side.
