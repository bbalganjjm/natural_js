# Natural-UI Button Component Developer Guide

The Button (N.button) component of Natural-UI is a UI component that creates buttons with consistent styles and features by specifying "a, input[type=button], button" elements as the context option.

## Table of Contents

1. Overview
2. Constructor
3. Default Options
4. Declarative Options
5. Methods
6. Usage Examples

## Overview

The Button (N.button) component makes it easy to create and manage consistent buttons in web applications. It works with elements written as "a", "input[type=button]", or "button" tags, and provides various style options such as size, color, and type. It also includes methods to control the enabled/disabled state of the button.

## Constructor

### N.button

Creates an instance of N.button.

```javascript
var button = new N.button(context, opts);
```

- **context**: jQuery object | jQuery selector string — The context element(s) to apply N.button to. Must be an a, button, or input[type=button] element. Multiple elements can be selected at once.
- **opts**: object — Options for the button.

### N(obj).button

Creates an N.button instance using the jQuery plugin method.

```javascript
var button = N(context).button(opts);
```

The way the instance is created is different, but the instance created with `new N.button()` and the one created with `N().button` are the same. The first argument of the N() function is set as the first argument of the new N.button constructor.

- **opts**: object — Options for the button.

## Default Options

- **context**: jQuery object | jQuery selector string — The context element(s) to apply N.button to. Must be an a, button, or input[type=button] element. Multiple elements can be selected at once.
- **size**: string — Sets the button size. One of "none", "smaller", "small", "medium", "large", or "big".
- **color**: string — Sets the button color. One of "none", "primary", "primary_container", "secondary", "secondary_container", "tertiary", "tertiary_container". Color naming and defaults are based on [Material Design 3 Color tokens](https://m3.material.io/foundations/design-tokens/overview). To change button styles, edit the classes starting with "btn_" in natural.ui.css.
- **type**: string — Sets whether the button is filled or outlined. One of "none", "filled", "outlined", or "elevated". The color is determined by the color option. If color is "none", the button has no background or border.
- **disable**: boolean — If true, the button is created in a disabled state.
- **onBeforeCreate**: function — Event handler executed before button options are applied. Useful for adding custom HTML or editing elements before creation.
- **onCreate**: function — Event handler executed after button options are applied. Useful for adding effects or custom logic after creation.

## Declarative Options

You can specify options declaratively using the `data-opts` attribute directly on HTML elements. This allows you to configure buttons using only HTML markup, without separate JavaScript code.

```html
<!-- Declarative options example -->
<a class="button" data-opts='{ "size": "large", "color": "primary", "type": "filled" }'>Large Button</a>
<button class="button" data-opts='{ "size": "small", "color": "secondary", "type": "outlined" }'>Small Button</button>
<input type="button" class="button" value="Disabled Button" data-opts='{ "disable": true }'>
```

Then, initialize the buttons in JavaScript:

```javascript
// Initialize buttons using declarative options from HTML
N("a.button, button.button, input.button").button();
```

## Methods

### disable

Sets the button to a disabled state.

```javascript
N("button").instance("button", function() {
    this.disable();
});
```

### enable

Sets the button to an enabled state.

```javascript
N("button").instance("button", function() {
    this.enable();
});
```

## Usage Examples

### Basic Usage

```javascript
// Create a button from an a tag
N("a#myButton").button({
    size: "large",
    color: "primary",
    type: "filled"
});

// Create a button from an input[type=button] tag
N("input#myInputButton").button({
    size: "medium",
    color: "secondary",
    type: "outlined"
});

// Create a button from a button tag
N("button#myButtonElement").button({
    size: "small",
    color: "tertiary"
});

// Create buttons from multiple elements at once
N("a.button, button.button, input.button").button();
```

### Changing Button State

```javascript
// Disable a button
N("button#myButton").instance("button", function() {
    this.disable();
});

// Enable a button
N("button#myButton").instance("button", function() {
    this.enable();
});
```

### Using Event Handlers

```javascript
// Execute event handlers before and after button creation
N("button#myButton").button({
    size: "large",
    color: "primary",
    onBeforeCreate: function(context, opts) {
        N(context).data("customData", "someValue");
        console.log("Before button creation:", context, opts);
    },
    onCreate: function(context, opts) {
        N(context).on("click", function() {
            console.log("Button clicked!");
        });
        console.log("After button creation:", context, opts);
    }
});
```

### Using Buttons with Various Styles

```javascript
// Buttons of various sizes
N("button#smallButton").button({ size: "small" });
N("button#mediumButton").button({ size: "medium" });
N("button#largeButton").button({ size: "large" });

// Buttons of various colors
N("button#primaryButton").button({ color: "primary", type: "filled" });
N("button#secondaryButton").button({ color: "secondary", type: "filled" });
N("button#tertiaryButton").button({ color: "tertiary", type: "filled" });

// Buttons of various types
N("button#filledButton").button({ color: "primary", type: "filled" });
N("button#outlinedButton").button({ color: "primary", type: "outlined" });
N("button#elevatedButton").button({ color: "primary", type: "elevated" });
```

### Declarative Usage with HTML Markup

```html
<div class="button-container">
    <a href="#" class="button-context" data-opts='{ "size": "large", "color": "primary", "type": "filled" }'>Large Button</a>
    <button class="button-context" data-opts='{ "size": "medium", "color": "secondary", "type": "outlined" }'>Medium Button</button>
    <input type="button" value="Small Button" class="button-context" data-opts='{ "size": "small", "color": "tertiary", "type": "elevated" }'>
</div>
```

```javascript
// Initialize buttons using declarative options
N(".button-container .button-context").button();
```
