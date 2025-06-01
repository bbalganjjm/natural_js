# Natural-UI Alert Component Developer Guide

The Natural-UI Alert (N.alert) component is a UI component that displays message dialogs, such as window.alert or window.confirm, as layer popups.

## Table of Contents

- [Natural-UI Alert Component Developer Guide](#natural-ui-alert-component-developer-guide)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Constructor](#constructor)
    - [N.alert](#nalert)
    - [N(obj).alert](#nobjalert)
  - [Default Options](#default-options)
  - [Methods](#methods)
  - [Usage Examples](#usage-examples)
  - [Notes](#notes)

## Overview

Alert (N.alert) is a UI component that displays message dialogs, such as window.alert or window.confirm, as layer popups. If the message dialog does not appear and an error occurs, you must specify the element where N.alert-related elements will be stored as a jQuery selector string in the N.context.attr("ui").alert.container property of Config (natural.config.js).

## Constructor

### N.alert

Creates an instance of N.alert.

```javascript
const alert = new N.alert(context, opts|msg);
// or
const alert = new N.alert(context, opts|msg, vars);
```

- context: window | jQuery object | jQuery selector string
  - Sets the context option. Same as the context option in default options.
- opts|msg: string | object
  - If a string is provided, it is set as the msg option in default options. The msg argument can be a message string, jQuery object, HTML string, or HTML element. If an object is provided, it is used as the default options object for the component.
- vars: array
  - Sets the vars option in default options.

### N(obj).alert

Creates an instance of the N.alert object as a jQuery plugin method.

```javascript
const alert = N(context).alert(opts|msg);
// or
const alert = N(context).alert(opts|msg, vars);
```

Although the instantiation method is different, instances created with "new N.alert()" and "N().alert" are the same. The first argument of the N() function is set as the first argument of the new N.alert constructor.

## Default Options

- context: window | jQuery object | jQuery selector string (Required)
  - Specifies the area where the N.alert message dialog will be displayed. If the modal option is true, the overlay element of N.alert covers only the element specified by context. If window is specified, it covers the entire screen. If a jQuery selector or object is specified, it covers only the specified element. If an input element (select, input, textarea, etc.) is specified, the message is displayed as a tooltip next to the input element.
- msg: string | object (Required)
  - The message content. Can be a string, jQuery object, HTML string, or HTML element.
- vars: array (Optional)
  - Replaces variables in the message with the values provided. Variables like {index} in the message are replaced with the corresponding value in the vars array.
- html: boolean (Optional, default: false)
  - If true, HTML in the message is rendered.
- confirm: boolean (Optional, default: false)
  - If true, both OK and Cancel buttons are displayed. If false, only the OK button is displayed.
- top: number (Optional)
  - Sets the top (px) position of the message dialog.
- left: number (Optional)
  - Sets the left (px) position of the message dialog.
- width: number | function (Optional, default: 0)
  - Sets the width of the message dialog. If a number, the value (px) is used. If a function, msgContext and msgContents are passed as arguments, and the returned value is used as the width.
- height: number | function (Optional, default: 0)
  - Sets the height of the message dialog content area (excluding the title). If a number, the value (px) is used. If a function, msgContext and msgContents are passed as arguments, and the returned value is used as the height.
- title: string (Optional)
  - Sets the title of the message dialog. If not set, the title bar is not created. Can also be set with the title attribute of the context element.
- button: boolean (Optional, default: true)
  - If false, the default (OK/Cancel) button elements are not created.
- okButtonOpts: object (Optional, default: true)
  - Options for the OK button, applied as N.button component options.
- cancelButtonOpts: object (Optional, default: true)
  - Options for the Cancel button, applied as N.button component options.
- closeMode: string (Optional, default: 'remove')
  - Determines whether the dialog element is hidden or removed when closed. 'hide': hides the dialog to preserve state. 'remove': removes the dialog to reset state.
- modal: boolean (Optional, default: true)
  - If true, creates an overlay element covering the context element and blocks all events except for the message dialog content.
- alwaysOnTop: boolean (Optional, default: false)
  - If true, the message dialog is always displayed on top.
- alwaysOnTopCalcTarget: string (Optional, default: 'div, span, ul, p, nav, article, section, header, footer, aside')
  - Specifies the target elements for calculating the highest z-index when alwaysOnTop is applied. Use jQuery selector syntax.
- dynPos: boolean (Optional, default: true)
  - If false, the overlay size and dialog position are not automatically adjusted when the browser is resized or the parent content height changes.
- draggable: boolean (Optional, default: false)
  - If true, the message dialog can be moved by dragging the title bar.
- draggableOverflowCorrection: boolean (Optional, default: true)
  - If false, the dialog is not automatically moved back inside the screen if dragged out of bounds.
- draggableOverflowCorrectionAddValues: object (Optional, default: { top: 0, bottom: 0, left: 0, right: 0 })
  - Specifies the position to move the dialog back inside the screen if dragged out of bounds. Adjusts the dialog position by increments of 1 if scrollbars appear.
- overlayClose: boolean (Optional, default: true)
  - If false, clicking the overlay does not close the dialog.
- overlayColor: string (Optional)
  - Specifies the background color of the overlay element. Use a CSS color value.
- escClose: boolean (Optional, default: true)
  - If false, pressing the ESC key does not close the dialog.
- windowScrollLock: boolean (Optional, default: true)
  - If true, disables browser window scrolling when using the mouse wheel over the dialog element. Only works when modal is true.
- saveMemory: boolean (Optional, default: false)
  - If true, removes unnecessary reference elements to save memory.
- onOk: function (Optional)
  - Event handler executed when the OK button is clicked. If 0 is returned, only the handler is executed and the dialog is not closed. Only works for the generated OK button if button is true.
- onCancel: function (Optional)
  - Event handler executed when the Cancel button, X button, overlay, or ESC key is used to close the dialog. If 0 is returned, only the handler is executed and the dialog is not closed. Only works for the generated Cancel button if button is true.
- onBeforeShow: function (Optional)
  - Event handler executed before the dialog is shown.
- onShow: function (Optional)
  - Event handler executed after the dialog is shown.
- onBeforeHide: function (Optional)
  - Event handler executed before the dialog is hidden. Not triggered if closeMode is 'remove'.
- onHide: function (Optional)
  - Event handler executed after the dialog is hidden. Not triggered if closeMode is 'remove'.
- onBeforeRemove: function (Optional)
  - Event handler executed before the dialog is removed. Not triggered if closeMode is 'hide'.
- onRemove: function (Optional)
  - Event handler executed after the dialog is removed. Not triggered if closeMode is 'hide'.

## Methods

- show: Displays the message dialog.
  - Usage: `N(context).alert(options).show();`
- hide: Hides the message dialog. Only available if closeMode is set to 'hide'.
  - Usage: `N(context).alert(options).hide();`
- remove: Removes the message dialog. Only available if closeMode is set to 'remove'.
  - Usage: `N(context).alert(options).remove();`

## Usage Examples

- Basic usage:
  ```javascript
  // Show a basic alert
  N(window).alert("Hello!").show();

  // Show an alert with a title
  N(window).alert({
      msg: "Welcome!",
      title: "Greeting"
  }).show();

  // Show a confirmation dialog
  N(window).alert({
      msg: "Do you want to continue?",
      confirm: true,
      onOk: () => {
          console.log("User clicked OK.");
      },
      onCancel: () => {
          console.log("User clicked Cancel.");
      }
  }).show();

  // Show an alert with HTML content
  N(window).alert({
      msg: "<strong>Bold</strong> text and <em>italic</em> text",
      html: true
  }).show();

  // Use variable substitution
  N(window).alert({
      msg: "{0}, welcome to {1}!",
      vars: ["User", "Natural-JS"]
  }).show();

  // Show a tooltip message for a specific element
  N("#username").alert("Please enter your username.").show();

  // Show a modal alert inside a specific container
  N("#container").alert({
      msg: "Alert displayed inside the container",
      title: "Container Alert"
  }).show();
  ```

- Advanced usage:
  ```javascript
  // Custom size and position
  N(window).alert({
      msg: "Alert with custom size and position",
      width: 400,
      height: 200,
      top: 100,
      left: 100
  }).show();

  // Draggable alert
  N(window).alert({
      msg: "This alert can be dragged.",
      title: "Draggable",
      draggable: true
  }).show();

  // Always on top
  N(window).alert({
      msg: "This alert is always on top.",
      alwaysOnTop: true
  }).show();

  // Custom button options
  N(window).alert({
      msg: "Custom button style",
      confirm: true,
      okButtonOpts: {
          size: "large",
          theme: "primary"
      },
      cancelButtonOpts: {
          size: "large",
          theme: "danger"
      }
  }).show();

  // Custom overlay color
  N(window).alert({
      msg: "Custom overlay color",
      overlayColor: "rgba(0, 0, 0, 0.8)"
  }).show();
  ```

## Notes

- If the Alert component does not appear and an error occurs, specify the element where N.alert-related elements will be stored as a jQuery selector string in the N.context.attr("ui").alert.container property of Config (natural.config.js).
- For automatic size adjustment, define the width and height options as functions to calculate them dynamically.
- The events triggered depend on the closeMode option, so consider the closeMode setting when defining event handlers.
- If the Alert is covered by another element with a high z-index, use the alwaysOnTop option and adjust alwaysOnTopCalcTarget as needed.
- If you return 0 from the onOk or onCancel event handler, the dialog will not close automatically. In this case, you must explicitly call the hide() or remove() method after your custom logic.
