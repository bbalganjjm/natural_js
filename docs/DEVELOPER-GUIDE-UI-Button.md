# Natural-UI Button Component Developer Guide

The Natural-UI Button (N.button) component is a UI component that creates buttons with consistent styles and features by specifying "a", "input[type=button]", or "button" elements as the context option.

## Contents

- Overview
- Constructor
- Default Options
- Declarative Options
- Methods
- Usage Examples

## Overview

The Button (N.button) component allows you to easily create and manage consistent buttons in web applications. It works with elements written as "a", "input[type=button]", or "button" tags, and provides various style options such as size, color, and type. It also includes methods to control the enabled/disabled state of the button.

## Constructor

### N.button

Creates an instance of N.button.

```javascript
const button = new N.button(context, opts);
```

- context: jQuery object | jQuery selector string
  - Specifies the context element(s) to apply N.button. The context element must be written as an a, button, or input[type=button] tag. Multiple elements can be selected at once.
- opts: object
  - Object specifying button options.

### N(obj).button

Creates an instance of the N.button object as a jQuery plugin method.

```javascript
const button = N(context).button(opts);
```

Although the instantiation method is different, instances created with "new N.button()" and "N().button" are the same. The first argument of the N() function is set as the first argument of the new N.button constructor.

## Default Options

- context: jQuery object | jQuery selector string (Required)
  - Specifies the context element(s) to apply N.button. Must be an a, button, or input[type=button] tag. Multiple elements can be selected at once.
- size: string (Optional, default: none)
  - Sets the button size. Can be one of "none", "smaller", "small", "medium", "large", or "big".
- color: string (Optional, default: none)
  - Sets the button color. Can be one of "none", "primary", "primary_container", "secondary", "secondary_container", "tertiary", or "tertiary_container". Color naming and defaults are based on [Material Design 3 Color tokens](https://m3.material.io/foundations/design-tokens/overview). To change button styles, edit classes starting with "btn_" in the natural.ui.css file.
- type: string (Optional, default: none)
  - Sets whether the button is filled or outlined. Can be one of "none", "filled", "outlined", or "elevated". The color is determined by the color option. If color is "none", the button has no background or border.
- disable: boolean (Optional, default: false)
  - If true, the button is created in a disabled state.
- onBeforeCreate: function (Optional)
  - Event handler executed before button options are applied. Useful for adding or editing HTML elements before applying external button libraries.
- onCreate: function (Optional)
  - Event handler executed after button options are applied. Useful for defining effect events or additional processing after button creation.

## Declarative Options

You can specify options declaratively using the `data-opts` attribute directly on the HTML element. This allows you to configure buttons with only HTML markup, without specifying options in JavaScript.

```html
<!-- Declarative options example -->
<a class="button" data-opts='{ "size": "large", "color": "primary", "type": "filled" }'>Large Button</a>
<button class="button" data-opts='{ "size": "small", "color": "secondary", "type": "outlined" }'>Small Button</button>
<input type="button" class="button" value="Disabled Button" data-opts='{ "disable": true }'>
```

Then, initialize the buttons in JavaScript:

```javascript
// Initialize buttons using declarative options in HTML
N("a.button, button.button, input.button").button();
```

## Methods

- disable: Sets the button to a disabled state.
  - Usage:
    ```javascript
    N("button").instance("button", () => {
        this.disable();
    });
    ```
- enable: Sets the button to an enabled state.
  - Usage:
    ```javascript
    N("button").instance("button", () => {
        this.enable();
    });
    ```

## Usage Examples

- Basic usage:
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

- Changing button state:
  ```javascript
  // Disable a button
  N("button#myButton").instance("button", () => {
      this.disable();
  });

  // Enable a button
  N("button#myButton").instance("button", () => {
      this.enable();
  });
  ```

- Using event handlers:
  ```javascript
  // Execute event handlers before and after button creation
  N("button#myButton").button({
      size: "large",
      color: "primary",
      onBeforeCreate: (context, opts) => {
          N(context).data("customData", "someValue");
          console.log("Before button creation:", context, opts);
      },
      onCreate: (context, opts) => {
          N(context).on("click", () => {
              console.log("Button clicked!");
          });
          console.log("After button creation:", context, opts);
      }
  });
  ```

- Using various button styles:
  ```javascript
  // Different sizes
  N("button#smallButton").button({ size: "small" });
  N("button#mediumButton").button({ size: "medium" });
  N("button#largeButton").button({ size: "large" });

  // Different colors
  N("button#primaryButton").button({ color: "primary", type: "filled" });
  N("button#secondaryButton").button({ color: "secondary", type: "filled" });
  N("button#tertiaryButton").button({ color: "tertiary", type: "filled" });

  // Different types
  N("button#filledButton").button({ color: "primary", type: "filled" });
  N("button#outlinedButton").button({ color: "primary", type: "outlined" });
  N("button#elevatedButton").button({ color: "primary", type: "elevated" });
  ```

- Declarative usage with HTML markup:
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
