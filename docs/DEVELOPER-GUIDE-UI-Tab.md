# Natural-JS Tab Component Developer Guide

The Tab (N.tab) component of Natural-JS creates a tabbed page view by specifying an element structured as div > ul > li as the context option.

## Table of Contents

- [Overview](#overview)
- [Constructor](#constructor)
- [Default Options](#default-options)
- [Declarative Options](#declarative-options)
- [Methods](#methods)
- [Examples](#examples)

## Overview

The Tab component provides an interface that allows users to easily switch between multiple content areas. Each tab is displayed as a text link, and clicking it shows the corresponding content. You can also set the url option to load other pages as tab content.

When a page is created as tab content using the url option, the Controller object for the tab includes caller (the N.popup instance that opened the tab) and opener (the parent page's Controller object, passed as an option). This allows you to control the parent page using opener, or close the tab or send data to the parent Controller using caller.

You can use the cont method of the N.tab instance to get the Controller object for each tab page. See the Methods section for details on the cont method.

## Constructor

### N.tab

```javascript
const tab = new N.tab(context, opts);
```

- **context** (jQuery object or selector string): The element to apply the Tab component to. Same as the context option in default options.
- **opts** (object): The default options object for the component.
- **Returns**: N.tab instance

### N(obj).tab

Creates an instance of N.tab using the jQuery plugin method.

```javascript
const tab = N(context).tab(opts);
```

- **opts** (object): Same as the second argument (opts) of the N.tab function.
- **Returns**: N.tab instance

Instances created with `new N.tab()` and `N().tab` are identical except for the instantiation method. The first argument of the N() function is set as the first argument of the new N.tab constructor.

## Default Options

- **context** (jQuery object or selector string, required): The context element to apply N.tab. The context element should be structured as a div containing ul, li, and div tags.
  - **Tabs**: Use li tags inside a ul tag for tab elements. The href attribute of the tab link (a tag) should match the id attribute of the tab content (div tag).
  - **Tab Content**: Use div tags for tab content. Create tab content divs according to the order and number of tabs. The id attribute of the tab content div should match the href attribute of the tab link.
  - You can use the url option in the tab options to load other pages as tab content, or write content directly inside the tab content div.

- **tabOpts** (array of objects, optional, default: []): Specifies options for each tab as an array of objects instead of using the data-opts attribute. Set an option object for each tab in order.

- **tabScroll** (boolean, optional, default: false): If true, tabs can be scrolled by mouse drag, touch, or first/last buttons. To use first/last buttons, add a tags with span tags as the first and last child elements of the ul tag.

- **tabScrollCorrection** (object, optional, default: false): Provides options to adjust the appearance of the last tab if it is cut off or has extra margin due to CSS styles. Use tabContainerWidthCorrectionPx and tabContainerWidthReCalcDelayTime to correct the tab appearance.

- **randomSel** (boolean, optional, default: false): If true, a random tab and its content are shown when the tab is initialized. If false, the first tab is shown. If the active option is set to true in a tab option, it takes precedence.

- **blockOnActiveWhenCreate** (boolean, optional, default: false): If true, the onActive event does not fire when the default tab is selected after creation.

- **opener** (N.cont object, optional, default: null): When loading another page as tab content using the url option, this option allows the Controller object of the tab content to reference the parent page's Controller object.

- **onActive** (function, optional, default: null): Event handler triggered whenever a tab is activated.

- **onLoad** (function, optional, default: null): Event handler triggered when tab content is loaded.

## Declarative Options

Declarative options for N.tab are set in the data-opts attribute of the tab (li) element. The format must strictly follow JSON standards (property names in double quotes).

- **url** (string): URL of the page to load as tab content.
- **active** (boolean, default: false): If true, the tab and its content are selected by default when N.tab is initialized. Only one tab should have active set to true.
- **preload** (boolean, default: false): If true, the page is loaded when the tab is initialized, not when it is first selected.
- **onOpen** (string): Name of the onOpen event handler function to execute whenever the tab is opened. The function should be defined in the Controller object of the loaded page. The first argument of the function is the onOpenData passed as the second argument to the open method. When tab content is loaded for the first time, the init function of the N.cont object is executed, followed by the onOpen function. If the onActive event is defined, it is executed before onOpen.
- **disable** (boolean, default: false): If true, the tab is created in a disabled state.
- **stateless** (boolean, default: false): If true, the tab content does not retain its state and is reloaded and reinitialized each time the tab is selected.

## Methods

- **context(selector: string): jQuery object**
  - Returns the context element. If a selector is provided, returns the element(s) within the context.
- **open(indexOrId: number|string): N.tab**
  - Opens the tab at the specified index or with the specified id.
- **enable(indexOrId: number|string): N.tab**
  - Enables the tab at the specified index or with the specified id.
- **disable(indexOrId: number|string): N.tab**
  - Disables the tab at the specified index or with the specified id.
- **cont(indexOrId: number|string): object**
  - Returns the Controller object for the tab at the specified index or with the specified id.

## Examples

### Basic usage

```javascript
const tab = N('#tab').tab({
  tabOpts: [
    { url: 'tab1.html', active: true },
    { url: 'tab2.html' },
    { url: 'tab3.html' }
  ]
});
```

### Open a tab by index

```javascript
tab.open(1); // Opens the second tab
```

### Enable/Disable a tab

```javascript
tab.disable(2); // Disables the third tab
tab.enable(2);  // Enables the third tab
```

### Get the Controller object for a tab

```javascript
const controller = tab.cont(0); // Gets the Controller for the first tab
```

## Notes

- Use the `tabOpts` option for more flexible tab configuration.
- Use the `onActive` and `onLoad` event handlers to customize tab behavior.
- Ensure that only one tab has `active: true` set in its options for correct initialization.
- Use the `stateless` option if you want the tab content to reload every time it is selected.

## Related Components

- [Popup](DEVELOPER-GUIDE-UI-Popup.md): For modal or modeless popups.
- [Tree](DEVELOPER-GUIDE-UI-Tree.md): For displaying hierarchical data.
- [Notify](DEVELOPER-GUIDE-UI.Shell-Notify.md): For global notifications.
