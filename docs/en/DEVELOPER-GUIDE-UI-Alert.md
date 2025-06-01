# Natural-UI Alert Component Developer Guide

The Alert (N.alert) component of Natural-UI is a UI component that displays message dialogs, similar to window.alert or window.confirm, as layer popups.

## Table of Contents

1. Overview
2. Constructor
3. Default Options
4. Methods
5. Usage Examples
6. Notes

## Overview

Alert (N.alert) is a UI component that displays message dialogs, like window.alert or window.confirm, as layer popups. If the message dialog does not appear or an error occurs, you must specify the element where N.alert-related elements will be stored using the jQuery selector string in the N.context.attr("ui").alert.container property of Config (natural.config.js).

## Constructor

### N.alert

Creates an instance of N.alert.

```javascript
var alert = new N.alert(context, opts|msg);
// or
var alert = new N.alert(context, opts|msg, vars);
```

- **context**: window | jQuery object | jQuery selector string — Sets the context option. Same as the context option in the default options.
- **opts|msg**: string | object — If a string is provided, it is set as the msg option. The msg argument can be a message string, jQuery object, HTML string, or HTML element. If an object is provided, it is used as the default options object for the component.
- **vars**: array — Sets the vars option in the default options.

### N(obj).alert

Creates an N.alert instance using the jQuery plugin method.

```javascript
var alert = N(context).alert(opts|msg);
// or
var alert = N(context).alert(opts|msg, vars);
```

The way the instance is created is different, but the instance created with `new N.alert()` and the one created with `N().alert` are the same. The first argument of the N() function is set as the first argument of the new N.alert constructor.

- **opts|msg**: string | object — Same as the second argument of N.alert.
- **vars**: array — Same as the third argument of N.alert.

## Default Options

- **context**: window | jQuery object | jQuery selector string — The area where the N.alert message dialog will be displayed. If modal is true, the overlay element covers the area specified by context. If window is specified, it covers the entire screen; if a selector or jQuery object is specified, it covers only that element. If an input element (select, input, textarea, etc.) is specified, the message is displayed as a tooltip next to the input element.
- **msg**: string | object — The message content. Can be a string, jQuery object, HTML string, or HTML element.
- **vars**: array — Replaces variables in the message with the values provided. Variables like {index} in the message are replaced with the corresponding value in the vars array.
- **html**: boolean — If true, the message is rendered as HTML.
- **confirm**: boolean — If true, shows OK/Cancel buttons. If false, shows only the OK button.
- **top/left/width/height**: number | function — Position and size of the dialog. Can be set as a number (px) or a function returning a value.
- **title**: string — Title of the dialog. If not set, no title bar is created.
- **button**: boolean — If false, does not create default (OK/Cancel) buttons.
- **okButtonOpts/cancelButtonOpts**: object — Options for the OK/Cancel buttons (N.button component options).
- **closeMode**: string — 'remove' (default) or 'hide'. Determines whether the dialog is removed or hidden when closed.
- **modal**: boolean — If true, creates an overlay to block events except for the dialog.
- **alwaysOnTop**: boolean — If true, the dialog is always on top.
- **alwaysOnTopCalcTarget**: string — Selector for elements to calculate the highest z-index for alwaysOnTop.
- **dynPos**: boolean — If false, does not automatically adjust overlay/dialog position on browser resize or content change.
- **draggable**: boolean — If true, the dialog can be dragged by the title bar.
- **draggableOverflowCorrection**: boolean — If false, does not auto-correct dialog position if dragged out of view.
- **draggableOverflowCorrectionAddValues**: object — Specifies how much to correct the dialog position if dragged out of view.
- **overlayClose**: boolean — If false, clicking the overlay does not close the dialog.
- **overlayColor**: string — Background color of the overlay.
- **escClose**: boolean — If false, pressing ESC does not close the dialog.
- **windowScrollLock**: boolean — If true, disables browser window scrolling when the dialog is open and the mouse wheel is used over the dialog.
- **saveMemory**: boolean — If true, removes unnecessary references to save memory.
- **onOk/onCancel/onBeforeShow/onShow/onBeforeHide/onHide/onBeforeRemove/onRemove**: function — Event handlers for various dialog events. Returning 0 from onOk or onCancel prevents the dialog from closing automatically.

## Methods

### show

Displays the message dialog.

```javascript
N(context).alert(options).show();
```

### hide

Hides the message dialog. Only available if closeMode is set to 'hide'.

```javascript
N(context).alert(options).hide();
```

### remove

Removes the message dialog. Only available if closeMode is set to 'remove'.

```javascript
N(context).alert(options).remove();
```

## Usage Examples

### Basic Usage

```javascript
// Show a basic alert
N(window).alert("Hello!").show();

// Show an alert with a title
N(window).alert({
    msg : "Welcome!",
    title : "Greeting"
}).show();

// Show a confirmation dialog
N(window).alert({
    msg : "Do you want to continue?",
    confirm : true,
    onOk : function() {
        console.log("User clicked OK.");
    },
    onCancel : function() {
        console.log("User clicked Cancel.");
    }
}).show();

// Alert with HTML content
N(window).alert({
    msg : "<strong>Bold</strong> text and <em>italic</em> text",
    html : true
}).show();

// Using variable replacement
N(window).alert({
    msg : "{0}, welcome to {1}!",
    vars : ["User", "Natural-JS"]
}).show();

// Show a tooltip-style message for a specific element
N("#username").alert("Please enter your username.").show();

// Show a modal alert inside a specific container
N("#container").alert({
    msg : "Alert displayed inside the container",
    title : "Container Alert"
}).show();
```

### Advanced Usage

```javascript
// Custom size and position
N(window).alert({
    msg : "Alert with custom size and position",
    width : 400,
    height : 200,
    top : 100,
    left : 100
}).show();

// Draggable alert
N(window).alert({
    msg : "This alert can be dragged.",
    title : "Draggable",
    draggable : true
}).show();

// Always on top
N(window).alert({
    msg : "This alert is always on top.",
    alwaysOnTop : true
}).show();

// Custom button options
N(window).alert({
    msg : "Custom button style",
    confirm : true,
    okButtonOpts : {
        size : "large",
        theme : "primary"
    },
    cancelButtonOpts : {
        size : "large",
        theme : "danger"
    }
}).show();

// Custom overlay color
N(window).alert({
    msg : "Custom overlay color",
    overlayColor : "rgba(0, 0, 0, 0.8)"
}).show();
```

## Notes

1. If the Alert component does not appear or an error occurs, specify the element for N.alert in the N.context.attr("ui").alert.container property of Config (natural.config.js).
2. For automatic size adjustment, define width and height options as functions to calculate dynamically.
3. The events triggered depend on the closeMode option, so consider this when defining event handlers.
4. If the Alert is hidden by other elements with a high z-index, use the alwaysOnTop option and adjust alwaysOnTopCalcTarget as needed.
5. If you return 0 from the onOk or onCancel event handler, the dialog will not close automatically; you must explicitly call hide() or remove() after your custom logic.
