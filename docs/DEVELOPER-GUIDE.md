# Natural-JS Guidebook

## Overview of Natural-JS

Natural-JS is a JavaScript architecture framework designed to help you build enterprise web application user interfaces intuitively, easily, and quickly.

### Features of Natural-JS

- Provides a Natural-ARCHITECTURE framework based on the **CVC architecture pattern**
- **AOP (Aspect-Oriented Programming)**: Allows AOP to be applied to user-defined functions of Controller objects
- **Communication Filter**: Filters all data exchanged with the server
- **Web Components**: Architecture for developing pages in block units
  - Page blocks can be loaded as Tab or Popup content, SPA (Single Page Application) page content, or MSA (Micro Service Architecture) web components
- **Separation of UI Development Roles**: Completely separates development and presentation areas within UI source code for clear role division
- **Various UI Components**
  - **Data processing components**: Grid, List, Form, Select, Pagination, Tree
  - **UI components**: Alert, Popup, Tab, Button, Datepicker, Notify, Documents
- **Two-way Data Binding**: Real-time synchronization and interaction when the same data is bound to different UI components
- **Component Design**: Easily change component styles and automatically apply common site styles
- **Data Processing Libraries**
  - **Data formatting**: Formatter library
  - **Data validation**: Validator library
  - **Data utilities**: Libraries such as filter, sort
- **Mobile Support**: Supports mobile browsers (ES5+) and touch devices, and integration with mobile hybrid apps. For details, see the [Mobile Guide](DEVELOPER-GUIDE-MOBILE.md).
- **TypeScript Support**: Provides type declaration files. For details, see the [TypeScript Guide](DEVELOPER-GUIDE-TYPESCRIPT.md).

### Structure of Natural-JS

Natural-JS consists of the following main packages:

1. **Natural-CORE**: Common library package used globally within Natural-JS
2. **Natural-ARCHITECTURE**: Library package that forms the architecture of Natural-JS
3. **Natural-DATA**: Library package supporting data synchronization, formatting, validation, and processing
4. **Natural-UI**: Library package providing HTML-based UI components

## Natural-CORE

### N() & N

- **N()**: The core method of Natural-JS. Returns a collection of elements found in the DOM based on the given argument, or creates elements from an HTML string.
- **N**: The object class where Natural-JS core functions are defined.

For details, see the [Natural-CORE Guide](DEVELOPER-GUIDE-CORE.md).

N() and N provide the following jQuery extension features and utility classes:

- **jQuery selector extension**: Extends jQuery selectors to allow selection by style or data- attributes in HTML
- **jQuery plugin extension methods**: Natural-JS utility methods as jQuery plugins
- **N.gc**: Utility class for internal garbage collection in Natural-JS
- **N.string**: Utility class for string manipulation
- **N.element**: Utility class for HTML element manipulation
- **N.date**: Utility class for date manipulation
- **N.browser**: Utility class for web browser information
- **N.message**: Utility class for message (i18n) handling
- **N.array**: Utility class for array data manipulation
- **N.json**: Utility class for JSON data manipulation
- **N.event**: Utility class for event handling

### Config (natural.config.js)

Config (natural.config.js) is the space for storing Natural-JS environment settings, AOP settings, Communication Filter settings, and default options for UI components. For details, see the [Config Reference](DEVELOPER-GUIDE-CONFIG.md).

## Natural-ARCHITECTURE

Natural-ARCHITECTURE is the library package that forms the architecture of Natural-JS. For details, see the [Natural-ARCHITECTURE Guide](DEVELOPER-GUIDE-ARCHITECTURE.md).

### Communicator-View-Controller (CVC) Architecture Pattern

The CVC pattern is an architecture pattern based on the Model-View-Controller (MVC) pattern. It structures the client browser area as Communicator-View-Controller, and defines the entire server as the Model area, focusing on the client side.

Advantages of the CVC pattern:
- Client browser implementation can be independent of server technology and architecture.
- Perfect separation of design and development areas reduces development complexity.

### Natural Architecture Framework

The Natural Architecture Framework implements the CVC Architecture Pattern. It clearly separates development areas, enabling division of labor among specialists for each area.

#### Controller

Controller (N.cont) is the class implementing the Controller layer of the CVC Architecture Pattern. For details, see the [Controller Guide](DEVELOPER-GUIDE-CONTROLLER.md).
- The Controller object is where user-defined functions controlling block pages are implemented.
- N.cont runs the init function of the Controller object and returns the Controller object.
- Natural-ARCHITECTURE supports AOP (Aspect-Oriented Programming) for Controller objects. For details, see the [AOP Guide](DEVELOPER-GUIDE-AOP.md).

#### View

The View has no separate implementation; the HTML element area of the block page is defined as the View.

#### Communicator

Communicator (N.comm) is the class implementing the Communicator layer of the CVC architecture pattern. For details, see the [Communicator Guide](DEVELOPER-GUIDE-COMMUNICATOR.md).
- N.comm is a library that supports Ajax communication with the server, such as requesting content or data and passing parameters.
- N.comm provides a Communication Filter feature that allows common logic to be executed at every request, response, or error stage when communicating with the server.

#### Context

Context (N.context) is the space that guarantees data persistence within the life cycle of a Natural-JS-based application (from page load until redirect to another URL). For details, see the [Context Guide](DEVELOPER-GUIDE-CONTEXT.md).
- Natural-JS environment settings (Config (natural.config.js)), framework common messages, etc. are stored in the N.context object.

## Natural-DATA

Natural-DATA is a library package that supports data synchronization, formatting, validation, and processing. For details, see the [Natural-DATA Guide](DEVELOPER-GUIDE-DATA.md).

### DataSync

DataSync is a library that synchronizes data changed by components or libraries in real time.
- DataSync supports two-way data binding between components.

### Formatter

Formatter (N.formatter) is a library that formats the input dataset (json object array) and returns the formatted dataset.

### Validator

Validator (N.validator) is a library that validates the input dataset (json object array) and returns the validation result dataset.

### Natural-DATA Library

The Natural-DATA Library provides methods and functions for sorting, filtering, and refining data of type json object array.

## Natural-UI

Natural-UI is a library package that supports HTML-based UI components. Components such as Grid, List, and Form have no built-in styles. If you define styles for the component's context element (such as table, ul/li, etc.) before initializing the component, the component will be created with the defined styles. For details, see the [Natural-UI Guide](DEVELOPER-GUIDE-UI.md).

### Alert

Alert (N.alert) is a UI component that displays message dialogs such as window.alert or window.confirm as layer popups. For details, see the [Alert Guide](DEVELOPER-GUIDE-UI-Alert.md).

### Button

Button (N.button) is a UI component that creates buttons using elements specified by the context option, such as "a, input[type=button], button". For details, see the [Button Guide](DEVELOPER-GUIDE-UI-Button.md).

### Datepicker

Datepicker (N.datepicker) is a UI component that displays a calendar popup for selecting a date or month in a text input element specified by the context option. For details, see the [Datepicker Guide](DEVELOPER-GUIDE-UI-Datepicker.md).

### Popup

Popup (N.popup) is a UI component that creates a layer popup from an internal element specified by the context option or a page specified by the url option. For details, see the [Popup Guide](DEVELOPER-GUIDE-UI-Popup.md).

### Tab

Tab (N.tab) is a UI component that creates a tab page view using an element composed of div>ul>li tags specified by the context option. For details, see the [Tab Guide](DEVELOPER-GUIDE-UI-Tab.md).

### Select

Select (N.select) is a UI component that binds data to select, input[type=checkbox], or input[type=radio] elements and extends the functionality of those controls. For details, see the [Select Guide](DEVELOPER-GUIDE-UI-Select.md).

### Form

Form (N.form) is a UI component that binds or creates single-row data in an element (such as div, table, etc.) specified by the context option. For details, see the [Form Guide](DEVELOPER-GUIDE-UI-Form.md).

### List

List (N.list) is a UI component that creates a single-column data list using ul>li elements specified by the context option. For details, see the [List Guide](DEVELOPER-GUIDE-UI-List.md).

### Grid

Grid (N.grid) is a UI component that creates a multi-column data list using table elements specified by the context option. For details, see the [Grid Guide](DEVELOPER-GUIDE-UI-Grid.md).

### Pagination

Pagination (N.pagination) is a UI component that creates a paging index from list data or total row count. For details, see the [Pagination Guide](DEVELOPER-GUIDE-UI-Pagination.md).

### Tree

Tree (N.tree) is a UI component that creates a tree element from hierarchical data. For details, see the [Tree Guide](DEVELOPER-GUIDE-UI-Tree.md).

## Natural-UI.Shell

While Natural-UI supports UI development for content areas, Natural-UI.Shell is a component package that supports development of shell areas outside the content area.

### Notify

Notify (N.notify) is a UI component that displays global notification messages that do not require user confirmation at a specified location. For details, see the [Notify Guide](DEVELOPER-GUIDE-UI.Shell-Notify.md).

### Documents

Documents (N.docs) is a page container that displays menu pages based on Natural-JS as an MDI (Multi Document Interface) or SDI (Single Document Interface) structure. For details, see the [Documents Guide](DEVELOPER-GUIDE-UI.Shell-Documents.md).

## Natural-TEMPLATE

Natural-TEMPLATE is a library that standardizes web application development based on Natural-JS, greatly improving code readability and development productivity. For details, see the [Natural-TEMPLATE Guide](DEVELOPER-GUIDE-TEMPLATE.md) and [Examples](DEVELOPER-GUIDE-TEMPLATE-EXAMPLES.md).

## API Documentation Guide

The Natural-JS API documentation provides usage and explanations for the features and options supported by the framework's components and libraries. The documentation is divided by component, and each page is organized into the following sections:

- **Overview**: Describes the overview of the component or library.
- **API DEMO**: Provides a demo program for real-time testing of the component or library.
- **Constructor**: Describes the function executed when a component or library instance is created and its constructor arguments.
  - Example:
    ```javascript
    N.grid(argument[0])
    N().grid(argument[0])
    ```
- **Default Options**: Describes the default options for the component or library.
  - Example:
    ```javascript
    N([]).grid({ resizeable: true })
    ```
- **Declarative Options**: Describes options defined in JSON format in the data-* attribute of the template HTML element used by the component or library.
  - Example:
    ```html
    <input id="date" type="text" data-format='[["date", 8]]' />
    ```
  - Declarative options can be defined with the following attributes:
    - **Format rules**: `data-format`
    - **Validation rules**: `data-validate`
    - **Other component options**: `data-opts`
  - Declarative options must strictly follow the JSON standard format (key values must be enclosed in double quotes). If the JSON format is not followed, the declarative option will not be recognized or an error will occur.
  - Rules executed by declarative options such as `data-format` or `data-validate` are defined as an array of strings, with the rule name followed by arguments in order.
  - Example:
    ```
    data-format='[["date", 8], ["lpad", 10, "@"]]'
    ```
- **Methods**: Describes the methods provided by the component or library instance and their arguments.
  - Example:
    ```javascript
    N([]).grid({ resizeable: true }).revert(3)
    ```
- **Examples**: Provides usage examples for the component or library.

### API Documentation Terminology

- **jQuery object**: The jQuery extended object or jQuery selector returned by executing `jQuery()`, `$()`, or `N()`
- **selector**: A string specified in CSS selector format in jQuery, or an object, array, HTML element, function, etc.

## Support Information

### Supported Browsers

All PC/mobile web browsers that support ECMAScript5 (ES5) or higher

### Training and Support

Contact: bbalganjjm@gmail.com

### License

This software is provided under the LGPL v2.1 license.
© Goldman Kim (bbalganjjm@gmail.com)

## Limitations and Tips

### Limitations

- **Limitation on jQuery.ajax function usage**
  - If you use the jQuery.ajax function, you cannot use the Communication Filter feature.
  - Always use Communicator (N.comm) for server communication.
- **Limitation on changing values of data-bound elements**
  - If you use the jQuery.val function to change the value of an input element bound to data using a UI component, only the value on the screen changes, not the internal data.
  - Always use the val method of the component instance.
- **Caution when selecting elements**
  - When selecting elements on a page, always use find on the view or specify the view as the context argument (second argument) of the jQuery function. Otherwise, you may select unintended elements from other block pages, causing unpredictable errors.
  - Example:
    ```javascript
    N(".pageId").cont({
        init: function(view, request) {
            $("selector", view);  // Correct way
            view.find("selector"); // Correct way
        }
    });
    ```
