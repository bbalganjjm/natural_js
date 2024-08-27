<h1 class="logo title">Natural-JS</h1>
Natural-JS is a JavaScript architectural framework designed for enterprise web applications, allowing intuitive, easy, and fast implementation of user interfaces.

Structure
===

Natural-JS consists of the Natural-CORE, Natural-ARCHITECTURE, Natural-DATA, and Natural-UI library packages. Natural-CORE is a common library package used globally by Natural-JS and Natural-ARCHITECTURE is a library package that makes up the architecture of Natural-JS. Natural-DATA is a library package that supports data synchronization, formatting, validation, and processing and Natural-UI is a library package that supports HTML-based UI components.

![Structure of Natural-JS](images/intr/pic3.png)

<center>[ Structure of Natural-JS ]</center>

![Natural-JS Architecture Framework](images/intr/pic0.png)

<center>[ Natural-JS Architecture Framework ]</center>

## Natural-CORE

Natural-CORE is a common library package used globally by Natural-JS.

### CORE Utitlities - N() & N
N() is a Natural-JS core method. Return a collection of matched elements either found in the DOM based on passed argument(s) or created by passing an HTML string.

N is an object class that defines the core functions of Natural-JS.

[N() and N](#html/naturaljs/refr/refr0101.html) provide the following jQuery extensions and utility classes:

* jQuery selector extensions : JQuery selector extension for defining selectors with attributes such as style or data
* jQuery plugin extension methods : Natural-JS utility method created with jQuery Plugin
* N : Object class that defines the core functions of Natural-JS
* N.gc : Function set class for Natural-JS internal garbage collection
* N.string : Function set class for string control
* N.element : Function set class for controlling HTML elements
* N.date : Function set class for date control
* N.browser : Web Browser information related function set class
* N.message : Function set class for handling messages(multilingual)
* N.array : Function set class for manipulating Array data
* N.json : Function set class for manipulating JSON data
* N.event : Function set class for event control

### Natural Config - Config(natural.config.js)

[Config(natural.config.js)](#html/naturaljs/refr/refr0102.html) is a place to save Natural-JS operation environment setting, AOP setting, Communication Filter setting, UI option value, etc.

## Natural-ARCHITECTURE

Natural-ARCHITECTURE is a library package that makes up the architecture of Natural-JS.

![Natural-ARCHITECTURE](images/intr/pic4.png)

<center>[ Natural-ARCHITECTURE ]</center>

### Communicator-View-Controller(CVC) Architecture Pattern

The CVC pattern is an architectural pattern based on the Model-View-Controlelr(MVC) pattern. As shown in the figure below, it is a client-centric architectural pattern that configures the client browser area as the Communicator-View-Controller architecture and defines the server as a model area. Applying the CVC pattern allows client browser implementation technologies to deviate from server technology and server architecture dependencies and
The complexity of development can be reduced by completely separating the design and development areas.

![CVC Architecture Pattern](images/intr/pic5.png)

<center>[ Communicator-View-Controller(CVC) Architecture Pattern ]</center>

### Natural Architecture Framework

Natural Architecture Framework is an architectural framework that implements the CVC Architecture Pattern.

![Natural Architecture Framework](images/intr/pic6.png)

<center>[ Natural Architecture Framework ]</center>

Natural Architecture Framework provides a clear separation of the areas of development, providing a foundation for division of work among professionals in each area.

#### Controller

[Controller(N.cont)](#html/naturaljs/refr/refr0201.html) is a class that implements Controller layer of CVC Architecture Pattern.
 * Controller object is an object in which user-defined functions that control block pages are implemented.
   <p class="alert">N.cont executes the init function of the Controller object and returns a Controller object.</p>
 * Natural-ARCHITECTURE supports AOP (Aspect-Oriented Programming) for Controller objects.

#### View

There is no separate implementation of View, and the HTML element area of the block page is defined as View.

#### Communicator

[Communicator(N.comm)](#html/naturaljs/refr/refr0203.html) is a class that implements Communicator layer of CVC Architecture Pattern.
 * N.comm is a library that supports Ajax communication with the server, such as requesting content or data from the server, or passing parameters.
 * N.comm provides a [Communication Filter](#html/naturaljs/refr/refr0205.html) feature that can execute common logic in every request and response or error generation phase that communicates with the server.

#### Context

Context(N.context) is a space that ensures data persistence within the Life-Cycle(Until the page is loaded and redirected to another URL) of a Natural-JS-based application.
 * Natural-JS configuration values​([Config(natural.config.js)](#html/naturaljs/refr/refr0102.html)), global configuration values, common messages of framework, etc. are stored in N.context objects.


## Natural-DATA

Natural-DATA is a library package that supports data synchronization, formatting, validation, and processing.

### DataSync

DataSync is a library that synchronizes data changed by components or libraries in real time.
<p class="alert">DataSync supports two way databinding between components.</p>

### Formatter

[Formatter(N.formatter)](#html/naturaljs/refr/refr0301.html) is a library that formats the input data set(array [json object]) and returns the formatted data set.

### Validator

[Validator(N.validator)](#html/naturaljs/refr/refr0302.html) is a library that validates the input data set(array [json object]) and returns a validation result data set.

### Natural-DATA Library

[Natural-DATA Library](#html/naturaljs/refr/refr0303.html) provides methods and functions for sorting, filtering, and refining data of type array[json object].


## Natural-UI

Natural-UI is a library package that supports HTML-based UI components.

<p class="alert">Components such as Grid, List, and Form do not have their own style. If the style is defined in the context element(table, ul/li, etc.) of the component before initializing the component, the component is created according to the defined style.</p>

![Natural-UI](images/intr/pic7.png)

<center>[ Natural-UI ]</center>

### Alert

[Alert(N.alert)](#html/naturaljs/refr/refr0401.html) is a UI component that displays message dialogs such as window.alert or window.confirm in the form of layer popups.

### Button

[Button(N.button)](#html/naturaljs/refr/refr0402.html) is a UI component that creates a button with a "a, input[type=button], button" element specified as a context option.

### Datepicker

[Datepicker(N.datepicker)](#html/naturaljs/refr/refr0403.html) a UI component that displays a calendar popup for selecting a date or month in the text input element specified by the context option.

### Popup

[Popup(N.popup)](#html/naturaljs/refr/refr0404.html) is a UI component that makes a layer popup form the internal element specified by the context option or the page specified by the url option.

### Tab

[Tab(N.tab)](#html/naturaljs/refr/refr0405.html) is a UI component that creates a tab page view by specifying an element consisting of div>ul>li tags as the context option.

### Select

[Select(N.select)](#html/naturaljs/refr/refr0406.html) is a UI component that binds data to select, input[type=checkbox], and input[type=radio] elements to create a selection and extend the functionality of that control.

### Form

[Form(N.form)](#html/naturaljs/refr/refr0407.html) is a UI component that binds or creates single row data to an element(block elements such as div and table) specified by the context option.
### List

[List(N.list)](#html/naturaljs/refr/refr0408.html) is a UI component that creates a list of data in the form of a single column by specifying the ul>li element as the context option.

### Grid

[Grid(N.grid)](#html/naturaljs/refr/refr0409.html) is a UI component that creates a list of data in a multi-column form by specifying a table element as a context option.

### Pagination

[Pagination(N.pagination)](#html/naturaljs/refr/refr0410.html) is a UI component that creates paging indexes from list data or the total count of rows.

### Tree

[Tree(N.tree)](#html/naturaljs/refr/refr0411.html) is a UI component that makes hierarchical data into tree elements.

## Natural-UI.Shell

While Natural-UI supports UI development in the content area, Natural-UI.Shell is a component package that supports the development of shell areas outside the content area.

### Notify(N.notify)

[Notify(N.notify)](#html/naturaljs/refr/refr0501.html) is a UI component that displays a global notification message in a specified location that does not require user confirmation.

### Documents(N.docs)

[Documents(N.docs)](#html/naturaljs/refr/refr0502.html) is a page container that displays Natural-JS based menu pages in MDI(Multi Document Interface) or SDI(Single Document Interface) structure.

Supports
===

### Support browsers

* PC : Chrome, Edge, Firefox, Safari, Opera, Internet Explorer 11(limited support)
* Mobile : iOS Safari, iOS UIWebView, Android Browser, Android Chrome, Android WebView

### Training and support

* Please contact us at <bbalganjjm@gmail.com>.

### License
This software is licensed under the [LGPL v2.1](https://github.com/bbalganjjm/natural_js/blob/master/LICENSE) &copy; KIM HWANG MAN&lt;<bbalganjjm@gmail.com>&gt;