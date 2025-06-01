# Natural-JS Popup Component Developer Guide

The Natural-JS Popup (N.popup) is a UI component that creates a layer popup from an element on the current page specified by the context option, or from a page specified by the url option.

## Table of Contents

- [Overview](#overview)
- [Table of Contents](#table-of-contents)
- [Constructor](#constructor)
- [Default Options](#default-options)
- [Methods](#methods)
- [Examples](#examples)

## Overview

The Popup component can display an existing element as a popup or load a new page as a popup.

When creating a popup with the url option, the generated popup's Controller object will have two additional properties: caller (the N.popup instance that opened the popup) and opener (the parent page's Controller object, passed as an option). You can use opener to control the parent page, or caller to close the popup or send data to the parent Controller.

If the popup dialog does not appear and an error occurs, make sure to set the N.context.attr("ui").alert.container property in [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html) to a jQuery selector string for the element where N.alert-related elements will be stored.

## Constructor

### N.popup

```javascript
const popup = new N.popup(context, opts);
```

- **context** (jQuery object or selector string): The element to apply the popup to. Same as the context option in default options.
- **opts** (object): The default options object for the component.
- **Returns**: N.popup instance

### N(obj).popup

A jQuery plugin method to create an N.popup instance.

```javascript
const popup = N(context).popup(opts);
```

- **opts** (object): Same as the second argument (opts) of N.popup.
- **Returns**: N.popup instance

Instances created with `new N.popup()` and `N().popup` are identical except for the instantiation method.

## Default Options

- **context**: jQuery object or selector string (default: null)
  - Specifies the block element in the page to create the popup from. Do not set the url option when using this.
- **url**: string (default: null)
  - Specifies the URL of the page to load as a popup. The popup's init method is called after loading. Do not set the context option when using this.
- **title**: string (default: undefined)
  - Sets the popup title. If not set, no title bar is created. If url is set, the title can also be set via the view element's title attribute. If using context, the context element's title attribute can be used.
- **button**: boolean (default: true)
  - If false, does not create default (OK/Cancel) buttons.
- **okButtonOpts**: object (default: true)
  - Options for the OK button (N.button component).
- **cancelButtonOpts**: object (default: true)
  - Options for the Cancel button (N.button component).
- **closeMode**: string (default: 'hide')
  - Determines whether to hide or remove the popup element when closing. 'hide' keeps the element for later use; 'remove' deletes it.
- **modal**: boolean (default: true)
  - If true, creates an overlay that blocks all events except for the popup content.
- **top**: number (default: undefined)
  - Sets the top (px) position of the popup.
- **left**: number (default: undefined)
  - Sets the left (px) position of the popup.
- **width**: number or function (default: 0)
  - Sets the popup width. If a function, receives msgContext and msgContents as arguments and should return the width.
- **height**: number or function (default: 0)
  - Sets the popup content height (excluding the title area). If a function, receives msgContext and msgContents as arguments and should return the height.
- **alwaysOnTop**: boolean (default: false)
  - If true, the popup always stays on top.
- **dynPos**: boolean (default: true)
  - If false, does not automatically adjust overlay size and popup position on browser resize or parent content changes.
- **draggable**: boolean (default: false)
  - If true, allows dragging the popup by the title bar.
- **draggableOverflowCorrection**: boolean (default: true)
  - If false, does not automatically move the popup back into view if dropped outside the screen.
- **draggableOverflowCorrectionAddValues**: object (default: { top: 0, bottom: 0, left: 0, right: 0 })
  - Adjusts the position when the popup is moved outside the screen.
- **overlayClose**: boolean (default: true)
  - If false, clicking the overlay does not close the popup.
- **escClose**: boolean (default: true)
  - If false, pressing ESC does not close the popup.
- **preload**: boolean (default: false)
  - If true, preloads popup content on initialization. Only works when using url.
- **windowScrollLock**: boolean (default: true)
  - If true, disables browser window scrolling when using the mouse wheel over the popup. Only works when modal is true.
- **opener**: N.cont object (default: null)
  - Option to reference the parent page's Controller object from the popup's Controller. Only works when using url.
- **saveMemory**: boolean (default: false)
  - If true, removes unnecessary references to save memory.
- **onOk**: function (default: null)
  - Event handler for the OK button. If returns 0, only the handler runs and the dialog does not close.
- **onCancel**: function (default: null)
  - Event handler for the Cancel button, X button, overlay click, or ESC key. If returns 0, only the handler runs and the popup does not close.
- **onBeforeShow**: function (default: null)
  - Event handler before the popup is shown.
- **onShow**: function (default: null)
  - Event handler after the popup is shown.
- **onBeforeHide**: function (default: null)
  - Event handler before the popup is hidden. Not called if closeMode is 'remove'.
- **onHide**: function (default: null)
  - Event handler after the popup is hidden. Not called if closeMode is 'remove'.
- **onBeforeRemove**: function (default: null)
  - Event handler before the popup is removed. Not called if closeMode is 'hide'.
- **onRemove**: function (default: null)
  - Event handler after the popup is removed. Not called if closeMode is 'hide'.
- **onOpen**: string (default: null)
  - Event handler called every time the popup opens. Specify the function name as a string, and implement the handler in the popup content's Controller object. Only works when using url.
- **onOpenData**: any (default: null)
  - Data to pass as the first argument to the onOpen event handler. Only works when using url.
- **onClose**: function (default: null)
  - Event handler called every time the popup closes. Only works when using url.
- **onCloseData**: any (default: null)
  - Data to pass as the first argument to the onClose event handler. Only works when using url.
- **onLoad**: function (default: null)
  - Event handler called when the popup content finishes loading. Only works when using url.

### Event Handler Parameters

- **onOk, onCancel, onBeforeShow, onShow, onBeforeHide, onHide, onBeforeRemove, onRemove**
  ```javascript
  (msgContext, msgContents) => {
    // this: N.popup instance
    // msgContext: popup overlay element
    // msgContents: popup element
  }
  ```
- **onClose**
  ```javascript
  (onCloseData) => {
    // this: N.popup instance
    // onCloseData: value passed as the first argument to (Controller object).caller.close
  }
  ```
- **onLoad**
  ```javascript
  (cont) => {
    // this: N.popup instance
    // cont: popup's Controller object
  }
  ```

## Methods

- **context([selector])**
  ```javascript
  popup.context(selector);
  ```
  - **selector** (string, optional): Returns the element matching the selector within the context element.
  - **Returns**: jQuery object (the context element)

- **open([onOpenData])**
  ```javascript
  popup.open(onOpenData);
  ```
  - **onOpenData** (object, optional): Passed as the first argument to the onOpen event handler.
  - **Returns**: N.popup (opens the popup)

- **close([onCloseData])**
  ```javascript
  popup.close(onCloseData);
  ```
  - **onCloseData** (object, optional): Passed as the first argument to the onClose event handler.
  - **Returns**: N.popup (closes or removes the popup)

- **remove()**
  ```javascript
  popup.remove();
  ```
  - **Returns**: N.popup (removes all elements related to N.popup)

## Examples

### 1. Creating a popup from a specified element (.popupArea)

```html
<div title="Popup Example" class="popupArea" style="height: 200px; border: 3px dotted var(--md-sys-color-outline-variant);">Popup Block...</div>

<script type="text/javascript">
  N(".popupArea").popup().open();
</script>
```

### 2. Loading a page as a popup

```javascript
const popup = N().popup("page.html");
popup.open();
```

### 3. Creating a draggable popup by loading a page

```javascript
const popup = N().popup({
  url: "page.html",
  title: "Title",
  width: 800,
  draggable: true
});
popup.open();
```

### 4. Reloading the page every time the popup opens

(Example omitted in the original)

### 5. Sending and receiving data between popup and parent page

#### 5.1. Popup page (popup.html)

```html
<!-- Style -->
<style>
  .popup-0001 .result { width: 400px; height: 300px; border: 1px solid var(--md-sys-color-outline-variant); }
</style>

<!-- View -->
<article class="popup-0001" title="onOpen Example">
  <p class="result"></p>
  <button class="btn-ok">Ok</button>
</article>

<!-- Controller -->
<script type="text/javascript">
N(".popup-0001").cont({
  init: (view, request) => {
    const caller = this.caller; // caller is the N.popup instance that opened this popup
    N(".btn-ok", view).on("click", (onCloseData) => {
      caller.close("Hello onClose."); // Pass onCloseData to the close function
    });
  },
  // This function runs every time the popup opens
  onOpenFn: function(onOpenData) {
    N(".result", this.view).text(onOpenData);
  }
});
</script>
```

#### 5.2. Parent page (parent.html)

```html
<!-- Style -->
<style>
  .parent-0001 .result { width: 400px; height: 300px; border: 1px solid var(--md-sys-color-outline-variant); }
</style>

<!-- View -->
<article class="parent-0001" title="onOpen Example">
  <p class="result"></p>
</article>

<!-- Controller -->
<script type="text/javascript">
N(".parent-0001").cont({
  init: (view, request) => {
    const popup = N().popup({
      url: "./popup.html",
      onOpen: "onOpenFn", // Function to run every time the popup opens
      onClose: (onCloseData) => { // Handler for when the popup closes
        N(".result", view).text(onCloseData);
      }
    });
    popup.open("Hello onOpen."); // Pass onOpenData to the open function
  }
});
</script>
```
