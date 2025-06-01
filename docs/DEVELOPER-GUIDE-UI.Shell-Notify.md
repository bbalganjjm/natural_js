# Natural-UI.Shell Notify Component Developer Guide

The Notify (N.notify) component of Natural-UI.Shell is a UI component that displays global notification messages at a specified position, without requiring user confirmation.

## Table of Contents

1. [Overview](#overview)
2. [Constructor](#constructor)
3. [Default Options](#default-options)
4. [Methods](#methods)
5. [Usage Examples](#usage-examples)
6. [Notes](#notes)

## Overview

Notify (N.notify) is a UI component that displays global notification messages at a specified position, without requiring user confirmation. While Alert (N.alert) is used for message dialogs within content areas, N.notify is intended for site-wide messages. Therefore, N.alert elements are created within each View, while N.notify is created in the document.body element.

## Constructor

### N.notify

Creates an instance of `N.notify`.

```javascript
const notify = new N.notify(position, opts);
```

- **position** (object): Sets the position where the message will be displayed. Same as the position option in default options.
- **opts** (object): Specifies the default options object for the component.

### N(obj).notify

Creates an instance of N.notify using the jQuery plugin method.

```javascript
const notify = N(position).notify(opts);
```

Although the instantiation method differs, instances created with `new N.notify()` and `N().notify` are identical. The first argument of the N() function is set as the first argument of the new N.notify constructor.

- **opts** (object): Same as the second argument (opts) of the N.notify function.

## Default Options

- **position** (object, required, default: `{ top: 10, right: 10 }`): Sets the position where the message will be displayed. You can specify left, right, top, or bottom properties in the option object.
- **container** (jQuery object, optional, default: `N('body')`): Specifies the element where the message container will be stored. For N.alert or N.popup, each page becomes the message container.
- **displayTime** (number, optional, default: `7`): Sets the time (in seconds) the message will be displayed.
- **html** (boolean, optional, default: `false`): If set to true, the message will be rendered as HTML.
- **alwaysOnTop** (boolean, optional, default: `false`): If set to true, the message dialog will always be displayed on top.
- **alwaysOnTopCalcTarget** (string, optional, default: `div, span, ul, p, nav, article, section, header, footer, aside`): When alwaysOnTop is enabled, specifies the target elements for calculating the highest z-index. Use a jQuery selector. If N.notify elements are hidden by other elements, add their selectors here.

## Methods

- **context(selector: string): jQuery object**
  - Returns the message container element. If a jQuery selector is provided, returns the element(s) within the context.
- **add(msg: string, url: string): jQuery object**
  - Creates a notification message.
    - `msg`: The message text.
    - `url`: The URL to navigate to when the message is clicked.
- **remove(msgBoxEle: jQuery object): N.notify**
  - Removes a message dialog.
    - `msgBoxEle`: The message element to remove.

## Usage Examples

### 1. Three ways to display a message

```javascript
// Display a message with options
N.notify(opts).add(msg, url);

// Display a message with default options
N.notify.add(msg, url);

// Specify position and options, then display a message
N(position).notify(opts).add(msg, url);
```

### 2. Display a message at the bottom right, navigate on click

```javascript
N({
    top: 5,
    right: 10
}).notify().add("The Natural-JS API manual has been updated.", "http://bbalganjjm.github.io/natural_js/");
```

### 3. Display a message with HTML content

```javascript
N({
    bottom: 10,
    right: 10
}).notify({
    html: true
}).add("<b>Bold</b> and <i>italic</i> text in notification.", "https://example.com");
```

## Notes

- N.notify is intended for global notifications that do not require user confirmation.
- For content-specific dialogs, use N.alert instead.
- If notification elements are hidden by other elements, adjust the alwaysOnTopCalcTarget option accordingly.
