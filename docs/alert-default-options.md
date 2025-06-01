# Alert Default Options

The Alert component provides numerous configuration options to customize its appearance and behavior. This document details all the available default options that can be used when creating an Alert instance.

## Basic Configuration Options

### context
**Type**: window | jQuery object | jQuery selector string  
**Default**: null  
**Required**: Yes

Specifies the area where the N.alert message dialog will be displayed. When the modal option is set to true, the overlay element of N.alert covers as much as the element specified by context.

> **Note**: If a window object is specified, the entire screen is covered. If a jQuery selector or jQuery object is entered, only the specified elements are covered.

If an input element (select, input, textarea, etc.) is specified, a message is displayed as a tooltip next to the input element.

### msg
**Type**: string | object  
**Default**: undefined  
**Required**: Yes

Message content to be displayed in the alert dialog.

> **Note**: You can specify a message string, jQuery object, HTML string, or HTML element.

### vars
**Type**: array  
**Default**: undefined  
**Required**: No

Replaces variables in the message with the values provided in this array.

> **Note**: Variables like {index} declared in the message are replaced with the value corresponding to the index of the array set with the vars option.

```javascript
N(window).alert({
    msg: "{0} {1}-JS.",
    vars: ["Hello", "Natural"]
}).show();

// Result message: "Hello Natural-JS"
```

### html
**Type**: boolean  
**Default**: false  
**Required**: No

If set to true, HTML in the message will be rendered rather than displayed as plain text.

### confirm
**Type**: boolean  
**Default**: false  
**Required**: No

When set to true, both OK and Cancel buttons are displayed. When set to false, only the OK button is displayed.

## Position and Size Options

### top
**Type**: number  
**Default**: undefined  
**Required**: No

The top (px) position of the message dialog.

### left
**Type**: number  
**Default**: undefined  
**Required**: No

The left (px) position of the message dialog.

### width
**Type**: number | function  
**Default**: 0  
**Required**: No

The width of the message dialog.

- If set to number type, the entered value (px) is set as the element width.
- If set to function type, msgContext (the element that covers the screen when the modal option is true) and msgContents (the message content element) are passed as arguments, and the width of the element is set as the returned value.

```javascript
// Fully fill the width of the dialog on the screen
width: function(msgContext, msgContents) {
    return $(window).width();
}
```

### height
**Type**: number | function  
**Default**: 0  
**Required**: No

The height of the content, excluding the title area of the message dialog.

- If set to number type, the entered value (px) is set as the element height.
- If set to function type, msgContext (the element that covers the screen when the modal option is true) and msgContents (the message content element) are passed as arguments, and the height of the element is set as the returned value.

```javascript
// Fully fill the height of the dialog on the screen
height: function(msgContext, msgContents) {
    // You need to call the show() function and then get the height of the title area 
    // because the message Content is hidden when the message dialog opens.
    return $(window).height() - msgContents.show().find(".msg_title_box__").height();
}
```

## Appearance Options

### title
**Type**: string  
**Default**: undefined  
**Required**: No

Sets the title of the message dialog. If not set, the title bar is not created.

> **Note**: It can also be set with the title attribute of the context element.

### button
**Type**: boolean  
**Default**: true  
**Required**: No

If set to false, it does not create basic button (OK/Cancel buttons) related elements.

### okButtonOpts
**Type**: object  
**Default**: true  
**Required**: No

Defines the options of the N.button component applied to the OK button of the message dialog.

### cancelButtonOpts
**Type**: object  
**Default**: true  
**Required**: No

Defines the options of the N.button component applied to the Cancel button of the message dialog.

### closeMode
**Type**: string  
**Default**: "remove"  
**Required**: No

Sets whether to hide or remove the dialog element when the message dialog is closed.

- **hide**: Hides the message dialog element to maintain its previous state.
- **remove**: Initializes the state by removing the message dialog element.

## Behavior Options

### modal
**Type**: boolean  
**Default**: true  
**Required**: No

If set to true, creates an overlay element that covers the element specified by context to block all events except the content of the message dialog.

### alwaysOnTop
**Type**: boolean  
**Default**: false  
**Required**: No

If set to true, the message dialog is always displayed at the top level (highest z-index).

### alwaysOnTopCalcTarget
**Type**: string  
**Default**: "div, span, ul, p, nav, article, section, header, footer, aside"  
**Required**: No

When applying the alwaysOnTop option, this specifies the target elements for calculating the highest z-index.

> **Note**: It is specified using jQuery selector syntax. Add an element selector that is obscured when elements related to N.alert or N.popup are obscured by other elements.

### dynPos
**Type**: boolean  
**Default**: true  
**Required**: No

If set to false, it does not automatically adjust the size of the block overlay and the location of the message dialog when the browser is resized or the height of the parent content is dynamically changed.

### draggable
**Type**: boolean  
**Default**: false  
**Required**: No

If set to true, the message dialog will be draggable by the title bar.

### draggableOverflowCorrection
**Type**: boolean  
**Default**: true  
**Required**: No

If set to false, the message dialog will not automatically move inside when dropped off the screen.

### draggableOverflowCorrectionAddValues
**Type**: object  
**Default**:
```javascript
{
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
}
```
**Required**: No

Specifies the position to move to inside when the message dialog is dropped off the screen.

> **Note**: Correct the position of the message dialog by incrementing or decrementing by 1 when a scroll bar appears on the screen because the message dialog does not completely return to the inside.

### overlayClose
**Type**: boolean  
**Default**: true  
**Required**: No

If set to false, message dialog does not close when clicking msgContext (the element that covers the screen when the modal option is true).

### overlayColor
**Type**: string  
**Default**: null  
**Required**: No

Specifies the background color of msgContext (the element that covers the screen when the modal option is true). It can be defined as the color property value of CSS.

### escClose
**Type**: boolean  
**Default**: true  
**Required**: No

If set to false, message dialog does not close when pressing the ESC key.

### windowScrollLock
**Type**: boolean  
**Default**: true  
**Required**: No

If set to true, disables browser window scrolling when scrolling with the mouse wheel over message dialog elements. Blocks the browser's default behavior of scrolling the browser window up or down when the message dialog element is scrolled first or last.

> **Note**: Only works when modal option is set to true.

### saveMemory
**Type**: boolean  
**Default**: false  
**Required**: No

If set to true, save memory usage by removing unnecessary reference elements.

## Event Handler Options

### onOk
**Type**: function  
**Default**: null  
**Required**: No

Defines an event handler that is executed when the OK button is clicked.

```javascript
onOk: function(msgContext, msgContents) {
    // this: N.alert instance
    // msgContext: Message overlay element
    // msgContents: Message dialog element
}
```

> **Note**: If it returns 0, only the event handler is executed and the dialog box is not closed. It works on the OK button created when the button option is set to true.

### onCancel
**Type**: function  
**Default**: null  
**Required**: No

Defines an event handler that is executed when the message dialog box is closed by clicking the Cancel button, clicking the X button, clicking the message overlay element, or pressing the ESC key.

```javascript
onCancel: function(msgContext, msgContents) {
    // this: N.alert instance
    // msgContext: Message overlay element
    // msgContents: Message dialog element
}
```

> **Note**: If it returns 0, only the event handler is executed and the message dialog is not closed. It works on the Cancel button created when the button option is set to true.

### onBeforeShow
**Type**: function  
**Default**: null  
**Required**: No

Defines an event handler that is executed before the message dialog is displayed.

```javascript
onBeforeShow: function(msgContext, msgContents) {
    // this: N.alert instance
    // msgContext: Message overlay element
    // msgContents: Message dialog element
}
```

### onShow
**Type**: function  
**Default**: null  
**Required**: No

Defines an event handler that is executed after the message dialog is displayed.

```javascript
onShow: function(msgContext, msgContents) {
    // this: N.alert instance
    // msgContext: Message overlay element
    // msgContents: Message dialog element
}
```

### onBeforeHide
**Type**: function  
**Default**: null  
**Required**: No

Defines an event handler that is executed before the message dialog is hidden.

```javascript
onBeforeHide: function(msgContext, msgContents) {
    // this: N.alert instance
    // msgContext: Message overlay element
    // msgContents: Message dialog element
}
```

> **Note**: The onBeforeHide event is not fired when the closeMode option is set to remove.

### onHide
**Type**: function  
**Default**: null  
**Required**: No

Defines an event handler that is executed after the message dialog is hidden.

```javascript
onHide: function(msgContext, msgContents) {
    // this: N.alert instance
    // msgContext: Message overlay element
    // msgContents: Message dialog element
}
```

> **Note**: The onHide event is not fired when the closeMode option is set to remove.

### onBeforeRemove
**Type**: function  
**Default**: null  
**Required**: No

Defines an event handler that is executed before the message dialog is removed.

```javascript
onBeforeRemove: function(msgContext, msgContents) {
    // this: N.alert instance
    // msgContext: Message overlay element
    // msgContents: Message dialog element
}
```

> **Note**: The onBeforeRemove event is not fired when the closeMode option is set to hide.

### onRemove
**Type**: function  
**Default**: null  
**Required**: No

Defines an event handler that is executed after the message dialog is removed.

```javascript
onRemove: function(msgContext, msgContents) {
    // this: N.alert instance
    // msgContext: Message overlay element
    // msgContents: Message dialog element
}
```

> **Note**: The onRemove event is not fired when the closeMode option is set to hide.
