# Natural-UI.Shell Documents Component Developer Guide

The Documents (N.docs) component of Natural-JS is a page container that displays menu pages based on Natural-JS in either MDI (Multiple Document Interface) or SDI (Single Document Interface) structure. This document provides a detailed explanation of the features, options, and usage of the Documents component.

## Table of Contents

- [Natural-UI.Shell Documents Component Developer Guide](#natural-uishell-documents-component-developer-guide)
  - [Table of Contents](#table-of-contents)
  - [1. Overview](#1-overview)
  - [2. Constructor](#2-constructor)
    - [2.1 N.docs Constructor](#21-ndocs-constructor)
    - [2.2 jQuery Plugin Method](#22-jquery-plugin-method)
  - [3. Default Options](#3-default-options)
    - [3.1 Event-Related Options](#31-event-related-options)
  - [4. Document.request](#4-documentrequest)
  - [5. Main Methods](#5-main-methods)
  - [6. Utility Methods](#6-utility-methods)
  - [7. Usage Examples](#7-usage-examples)
    - [Open a new document (tab)](#open-a-new-document-tab)
    - [Pass parameters between documents](#pass-parameters-between-documents)
  - [8. Notes and Recommendations](#8-notes-and-recommendations)
  - [9. Related Components](#9-related-components)

## 1. Overview

The Documents component provides functionality to manage multiple pages as tabs in a web application. In MDI mode, you can open and manage multiple tabs, while in SDI mode, only a single page is displayed. Key features include:

- Setting the maximum number of pages and maximum number of stateful pages
- Loading indicator support
- Parameter passing between tabs
- Various event handler support

## 2. Constructor

You can create a Documents component in the following ways:

### 2.1 N.docs Constructor

```javascript
const docs = new N.docs(context, opts);
```

- **context**: Block element to apply Documents (jQuery object or selector string)
- **opts**: Default options object for the component

### 2.2 jQuery Plugin Method

```javascript
const docs = N(context).docs(opts);
```

Both methods provide the same functionality. The first argument of the N() function is set as the first argument of the new N.docs constructor.

## 3. Default Options

The Documents component provides various options for customizing its behavior.

- **context** (jQuery object or selector string, required, default: null): Specifies the block element to apply N.docs.
- **multi** (boolean, optional, default: true):
  - true: Creates an MDI (tab-based) interface with tabs and page content.
  - false: Creates an SDI interface with only a single page content and no tabs.
- **maxStateful** (number, optional, default: 0): When multi is true, sets the maximum number of stateful tab contents. If the number of open tab contents exceeds this value, the state of the earliest opened tab content is removed. 0 means unlimited.
- **maxTabs** (number, optional, default: 0): When multi is true, sets the maximum number of tab contents. If the number of tabs exceeds this value, no more tabs can be opened. 0 means unlimited.
- **addLast** (boolean, optional, default: false): If true, new tabs are added at the end when calling the add method.
- **tabScroll** (boolean, optional, default: false): If true, tabs can be scrolled by mouse drag or touch.
- **tabScrollCorrection** (object, optional, default: false): Provides options to adjust the appearance of the last tab if it is cut off or has extra margin due to CSS styles. Use rightCorrectionPx to correct the last tab's appearance.
- **closeAllRedirectURL** (string, optional, default: null): Defines the behavior when the "Close All" button is clicked. If null, all tabs except the active one are closed. If a URL string is provided, redirects to that URL.
- **entireLoadIndicator** (boolean, optional, default: false): If true, displays a progress bar until all Ajax requests during page loading are complete.
- **entireLoadScreenBlock** (boolean, optional, default: false): If true, blocks the screen until all Ajax requests during page loading are complete to prevent duplicate submissions.
- **entireLoadExcludeURLs** (array, optional, default: []): Specifies a list of URLs to exclude from entireLoad-related events or options.
- **alwaysOnTop** (boolean, optional, default: false): If true, always displays the menu list dialog on top.
- **alwaysOnTopCalcTarget** (string, optional, default: 'div, span, ul, p, nav, article, section, header, footer, aside'): Specifies the target elements for z-index calculation when alwaysOnTop is enabled.

### 3.1 Event-Related Options

- **onBeforeLoad** (function, optional, default: null): Event triggered before content is loaded.
- **onLoad** (function, optional, default: null): Event triggered after a page is loaded.
- **onBeforeEntireLoad** (function, optional, default: null): Event triggered before Ajax requests are captured during page loading.
- **onErrorEntireLoad** (function, optional, default: null): Event triggered if an error occurs during Ajax requests after page loading.
- **onEntireLoad** (function, optional, default: null): Event triggered after all Ajax requests are complete following page loading.
- **onBeforeActive** (function, optional, default: null): Event triggered before a tab is activated.
- **onActive** (function, optional, default: null): Event triggered after a tab is activated.
- **onBeforeInactive** (function, optional, default: null): Event triggered before a tab is deactivated.
- **onInactive** (function, optional, default: null): Event triggered after a tab is deactivated.
- **onBeforeRemoveState** (function, optional, default: null): Event triggered before a tab's state is removed.
- **onRemoveState** (function, optional, default: null): Event triggered after a tab's state is removed.
- **onBeforeRemove** (function, optional, default: null): Event triggered before a tab is removed.
- **onRemove** (function, optional, default: null): Event triggered after a tab is removed.

Each event handler function can be used as follows:

```javascript
onLoad: function(docId) {
    // docId: document id
    const doc = this.doc(docId); // Get document info
    const cont = this.cont(docId); // Get Controller object for the document
    const view = cont.view;
    const request = cont.request;
}
```

## 4. Document.request

Document.request (N.docs.request) cannot be used independently; it is created each time content is loaded with N.docs. The request object holds request information and allows you to pass parameters between documents using the attr method.

- **attr(key, value)**: Sets or gets a parameter for the document. If only the key is provided, returns the value. If both key and value are provided, sets the value for the key.

Example:

```javascript
// Set a parameter
request.attr('paramName', 'value');

// Get a parameter
const value = request.attr('paramName');
```

## 5. Main Methods

- **add(options)**: Adds a new document (tab/page) with the specified options.
- **remove(docId)**: Removes the document with the given ID.
- **active(docId)**: Activates the document (tab/page) with the given ID.
- **doc(docId)**: Returns information about the document with the given ID.
- **cont(docId)**: Returns the Controller object for the document with the given ID.

## 6. Utility Methods

- **getTabList()**: Returns a list of all open tabs (documents).
- **getActiveTab()**: Returns the currently active tab (document).
- **reload(docId)**: Reloads the content of the specified document.

## 7. Usage Examples

### Open a new document (tab)

```javascript
docs.add({
  url: 'page.html',
  title: 'New Page',
  params: { foo: 'bar' }
});
```

### Pass parameters between documents

```javascript
// In the parent document
const request = docs.cont(docId).request;
request.attr('userId', 123);

// In the child document
const userId = request.attr('userId');
```

## 8. Notes and Recommendations

- Use MDI mode for applications that require multiple pages or documents to be open simultaneously.
- Use SDI mode for simpler applications where only one page is needed at a time.
- Always manage the maximum number of tabs and stateful pages to ensure optimal performance.
- Use event handlers to customize behavior during loading, activation, and removal of documents.

## 9. Related Components

- [Tab](DEVELOPER-GUIDE-UI-Tab.md): For tabbed interfaces.
- [Popup](DEVELOPER-GUIDE-UI-Popup.md): For modal or modeless popups.
- [Notify](DEVELOPER-GUIDE-UI.Shell-Notify.md): For global notifications.
