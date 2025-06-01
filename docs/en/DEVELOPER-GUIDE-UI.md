# Natural-UI Developer Guide

Natural-UI is the UI component library of Natural-JS, providing a variety of UI components needed for web application development. This document describes the overview and main features of Natural-UI components.

## Table of Contents

1. Overview
2. UI Components
   - Alert
   - Button
   - Datepicker
   - Form
   - Grid
   - List
   - Pagination
   - Popup
   - Select
   - Tab
   - Tree
3. UI.Shell Components
   - Documents
   - Notify
4. Common Features
   - Event Handling
   - Styling
   - Theme Support

## Overview

Natural-UI is a UI component library built on top of Natural-JS. It provides a variety of UI components required for web application development, and all components are designed to be easy to use, integrated with jQuery.

Main features of Natural-UI include:

- **Consistent API**: All components can be initialized, configured, and data-bound in a consistent way.
- **Theme Support**: Supports light and dark themes, and allows custom themes.
- **Responsive Design**: Designed to adapt to various screen sizes.
- **Accessibility**: Developed in compliance with web accessibility standards.
- **Data Binding**: Provides data binding features that easily integrate with JSON data.

## UI Components

Natural-UI provides a variety of UI components. For detailed guides on each component, refer to the documentation for that component.

### Alert

The [Alert](DEVELOPER-GUIDE-UI-Alert.md) component displays message dialogs like window.alert or window.confirm as layer popups.

### Button

The [Button](DEVELOPER-GUIDE-UI-Button.md) component extends the basic HTML button element to provide various styles and features.

### Datepicker

The [Datepicker](DEVELOPER-GUIDE-UI-Datepicker.md) component provides a calendar UI for date selection.

### Form

The [Form](DEVELOPER-GUIDE-UI-Form.md) component binds HTML form elements to data and provides validation features.

### Grid

The [Grid](DEVELOPER-GUIDE-UI-Grid.md) component displays data in a table format and provides editing features.

### List

The [List](DEVELOPER-GUIDE-UI-List.md) component displays data in a list format.

### Pagination

The [Pagination](DEVELOPER-GUIDE-UI-Pagination.md) component provides page navigation.

### Popup

The [Popup](DEVELOPER-GUIDE-UI-Popup.md) component provides modal or modeless popup windows.

### Select

The [Select](DEVELOPER-GUIDE-UI-Select.md) component extends the basic HTML select element to provide various styles and features.

### Tab

The [Tab](DEVELOPER-GUIDE-UI-Tab.md) component provides a tab-based interface.

### Tree

The [Tree](DEVELOPER-GUIDE-UI-Tree.md) component displays hierarchical data in a tree format.

## UI.Shell Components

Natural-UI.Shell provides components for composing the shell (outer frame) area of a web application.

### Documents

The [Documents](DEVELOPER-GUIDE-UI.Shell-Documents.md) component is a container for managing pages in MDI (Multi Document Interface) or SDI (Single Document Interface) format.

### Notify

The [Notify](DEVELOPER-GUIDE-UI.Shell-Notify.md) component provides functionality for displaying notification messages to users.

## Common Features

Natural-UI components provide the following common features.

### Event Handling

All components support standard DOM events and also provide component-specific events. Event handlers can be registered using jQuery's `.on()` method.

```javascript
N("#myButton").on("click", function() {
    // Code to handle button click
}).button();
```

### Styling

Natural-UI components use the styles from the natural.ui.css file by default. To apply custom styles, you can use the following methods:

1. CSS class override: Override the CSS classes used by the component to change styles.
2. Inline styles: Apply styles directly to component elements.
3. Component options: Some components provide style-related options.

### Theme Support

Natural-UI provides light and dark themes by default. You can switch themes as follows:

```javascript
// Switch to dark theme
N.context.attr("ui").theme = "dark";

// Switch to light theme
N.context.attr("ui").theme = "light";
```

To configure a custom theme, override CSS variables as needed.

This document provided an overview and main features of Natural-UI. For more details on each component, refer to the documentation for that component.
