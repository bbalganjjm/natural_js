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

- **DataSync**: Synchronizes data changed by components or libraries in real time. Supports two-way data binding between components.
- **Formatter (N.formatter)**: Formats input datasets (JSON object arrays) and returns the formatted dataset.
- **Validator (N.validator)**: Validates input datasets (JSON object arrays) and returns the validation result dataset.
- **Natural-DATA Library**: Provides methods and functions for sorting, filtering, and refining JSON object array data.

## Natural-UI

Natural-UI is a library package that provides HTML-based UI components. Components such as Grid, List, and Form do not have their own styles. If you define styles for the context element (table, ul/li, etc.) before initializing the component, the component will be created with the defined styles. For details, see the [Natural-UI Guide](DEVELOPER-GUIDE-UI.md).

- **Alert (N.alert)**: UI component that displays message dialogs as layer popups, similar to window.alert or window.confirm. See [Alert Guide](DEVELOPER-GUIDE-UI-Alert.md).
- **Button (N.button)**: UI component that creates buttons using elements specified by the context option (a, input[type=button], button). See [Button Guide](DEVELOPER-GUIDE-UI-Button.md).
- **Datepicker (N.datepicker)**: UI component that displays a calendar popup for selecting dates or months in a text input element specified by the context option. See [Datepicker Guide](DEVELOPER-GUIDE-UI-Datepicker.md).
- **Popup (N.popup)**: UI component that creates a layer popup from an internal element specified by the context option or a page specified by the url option. See [Popup Guide](DEVELOPER-GUIDE-UI-Popup.md).
- **Tab (N.tab)**: UI component that creates a tab page view using elements structured as div>ul>li specified by the context option. See [Tab Guide](DEVELOPER-GUIDE-UI-Tab.md).
- **Select (N.select)**: UI component that binds data to select, input[type=checkbox], or input[type=radio] elements and extends their functionality. See [Select Guide](DEVELOPER-GUIDE-UI-Select.md).
- **Form (N.form)**: UI component that binds or creates single-row data in an element (div, table, etc.) specified by the context option. See [Form Guide](DEVELOPER-GUIDE-UI-Form.md).
- **List (N.list)**: UI component that creates a single-column data list using ul>li elements specified by the context option. See [List Guide](DEVELOPER-GUIDE-UI-List.md).
- **Grid (N.grid)**: UI component that creates a multi-column data list using table elements specified by the context option. See [Grid Guide](DEVELOPER-GUIDE-UI-Grid.md).
- **Pagination (N.pagination)**: UI component that creates a paging index from list data or total row count. See [Pagination Guide](DEVELOPER-GUIDE-UI-Pagination.md).
- **Tree (N.tree)**: UI component that creates a tree element from hierarchical data. See [Tree Guide](DEVELOPER-GUIDE-UI-Tree.md).

## Natural-UI.Shell

While Natural-UI supports UI development for content areas, Natural-UI.Shell is a component package supporting development for shell areas outside the content area.

- **Notify (N.notify)**: UI component that displays global notification messages at a specified location without user confirmation. See [Notify Guide](DEVELOPER-GUIDE-UI.Shell-Notify.md).
- **Documents (N.docs)**: Page container that displays menu pages in MDI (Multi Document Interface) or SDI (Single Document Interface) structure. See [Documents Guide](DEVELOPER-GUIDE-UI.Shell-Documents.md).

## Natural-TEMPLATE

Natural-TEMPLATE is a library that standardizes web application development with Natural-JS, greatly improving code readability and development productivity. For details, see the [Natural-TEMPLATE Guide](DEVELOPER-GUIDE-TEMPLATE.md) and [Examples](DEVELOPER-GUIDE-TEMPLATE-EXAMPLES.md).

## API Documentation Guide

The Natural-JS API documentation provides usage and descriptions for the features and options supported by the framework's components and libraries. Each component has its own page, and each page is divided into the following sections:

- **Overview**: Describes the overview of the component or library.
- **API DEMO**: Provides a demo program for real-time testing of the component or library.
- **Constructor**: Describes the functions and constructor arguments executed when creating a component or library instance.

  Example:

  ```javascript
  N.grid(argument[0]);
  N().grid(argument[0]);
  ```

- **Default Options**: Describes the default options for the component or library.

  Example:

  ```javascript
  N([]).grid({ resizeable: true });
  ```

- **Declarative Options**: Describes options defined in JSON format in the data-* attributes of template HTML elements used by the component or library.

  Example:

  ```html
  <input id="date" type="text" data-format='[["date", 8]]' />
  ```

  - Declarative options can be defined as:
    - Format rules: `data-format`
    - Validation rules: `data-validate`
    - Other component options: `data-opts`
  - Declarative options must strictly follow the JSON standard format (keys must be enclosed in double quotes). If the JSON format is not followed, the options may not be recognized or may cause errors.
  - Rules executed as declarative options such as `data-format` or `data-validate` are defined as string arrays, with the rule name followed by arguments in order.

  Example:

  ```json
  data-format='[["date", 8], ["lpad", 10, "@"]]
  ```

- **Methods**: Describes the methods and arguments provided by the component or library instance.

  Example:

  ```javascript
  N([]).grid({ resizeable: true }).revert(3);
  ```

- **Examples**: Provides usage examples for the component or library.

### API Documentation Terminology

- **jQuery object**: The jQuery extension object or selector returned by executing `jQuery()`, `$()`, or `N()`.
