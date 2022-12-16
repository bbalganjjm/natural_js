<!--
### [Natural-JS Boot](https://github.com/bbalganjjm/natural_js_boot) is released. Create Natural-JS-based web applications easily with [Natural-JS Boot](https://github.com/bbalganjjm/natural_js_boot).
-->

[Natural-JS](https://bbalganjjm.github.io/natural_js)
===
Natural-JS is a Javascript framework library that can be easily and quickly development the enterprise web application UI such as ERP, CRM, etc.

Structure
===

Natural-JS consists of the Natural-CORE, Natural-ARCHITECTURE, Natural-DATA, and Natural-UI library packages. Natural-CORE is a common library package used globally by Natural-JS and Natural-ARCHITECTURE is a library package that makes up the architecture of Natural-JS. Natural-DATA is a library package that supports data synchronization, formatting, validation, and processing and Natural-UI is a library package that supports HTML-based UI components.

<p align="center">
	<img src="https://bbalganjjm.github.io/natural_js/images/intr/pic3.png" alt="Structure of Natural-JS">
</p>
<p align="center">[ Structure of Natural-JS ]</p>

<p align="center">
	<img src="https://bbalganjjm.github.io/natural_js/images/intr/pic0.png" alt="Natural-JS Architecture Framework">
</p>
<p align="center">[ Natural-JS Architecture Framework ]</p>

## Natural-CORE

Natural-CORE is a common library package used globally by Natural-JS.

### CORE Utitlities - N() & N
N() is a Natural-JS core method. Return a collection of matched elements either found in the DOM based on passed argument(s) or created by passing an HTML string.

N is an object class that defines the core functions of Natural-JS.

[N() and N](https://bbalganjjm.github.io/natural_js/#cmVmcjAxMDElMjROKCklMjAlMjYlMjBOJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjAxMDEuaHRtbA==) provide the following jQuery extensions and utility classes:

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

### Natural Config - Config(N.config)

[Config(N.config)](https://bbalganjjm.github.io/natural_js/#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s) is a place to save Natural-JS operation environment setting, AOP setting, Communication Filter setting, UI option value, etc.

## Natural-ARCHITECTURE

Natural-ARCHITECTURE is a library package that makes up the architecture of Natural-JS.

<p align="center">
	<img src="https://bbalganjjm.github.io/natural_js/images/intr/pic4.png" alt="Natural-ARCHITECTURE">
</p>
<p align="center">[ Natural-ARCHITECTURE ]</p>

### Communicator-View-Controller(CVC) Architecture Pattern

The CVC pattern is an architectural pattern based on the Model-View-Controlelr(MVC) pattern. As shown in the figure below, it is a client-centric architectural pattern that configures the client browser area as the Communicator-View-Controller architecture and defines the server as a model area. Applying the CVC pattern allows client browser implementation technologies to deviate from server technology and server architecture dependencies and
The complexity of development can be reduced by completely separating the design and development areas.

<p align="center">
	<img src="https://bbalganjjm.github.io/natural_js/images/intr/pic5.png" alt="Communicator-View-Controller(CVC) Architecture Pattern">
</p>
<p align="center">[ Communicator-View-Controller(CVC) Architecture Pattern ]</p>

### Natural Architecture Framework

Natural Architecture Framework is an architectural framework that implements the CVC Architecture Pattern.

<p align="center">
	<img src="https://bbalganjjm.github.io/natural_js/images/intr/pic6.png" alt="Natural Architecture Framework">
</p>
<p align="center">[ Natural Architecture Framework ]</p>

Natural Architecture Framework provides a clear separation of the areas of development, providing a foundation for division of work among professionals in each area.

#### Controller

[Controller(N.cont)](https://bbalganjjm.github.io/natural_js/#cmVmcjAyMDElMjRDb250cm9sbGVyJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjAyMDEuaHRtbA==) is a class that implements Controller layer of ​​CVC Architecture Pattern.
 * N.cont executes the init function of the Controller object and returns a Controller object.
   <p class="alert">The Controller object is the object that controls the elements of the View and the data retrieved by Communicator.</p>
 * Natural-ARCHITECTURE supports AOP (Aspect-Oriented Programming) for Controller objects.

#### View

View has no implementation and simply defines the HTML element area as View.

#### Communicator

[Communicator(N.comm)](https://bbalganjjm.github.io/natural_js/#cmVmcjAyMDMlMjRDb21tdW5pY2F0b3IkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDIwMy5odG1s) is a class that implements Communicator layer of ​​CVC Architecture Pattern.
 * N.comm is a library that supports Ajax communication with the server, such as requesting content or data from the server, or passing parameters.
 * N.comm provides a [Communication Filter](https://bbalganjjm.github.io/natural_js/#cmVmcjAyMDUlMjRDb21tdW5pY2F0aW9uJTIwRmlsdGVyJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjAyMDUuaHRtbA==) feature that can execute common logic in every request and response or error generation phase that communicates with the server.

#### Context

Context(N.context) is a space that ensures data persistence within the Life-Cycle(Until the page is loaded and redirected to another URL) of a Natural-JS-based application.
 * Natural-JS configuration values​([Config(N.config)](https://bbalganjjm.github.io/natural_js/#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s)), global configuration values, common messages of framework, etc. are stored in N.context objects.


## Natural-DATA

Natural-DATA is a library package that supports data synchronization, formatting, validation, and processing.

### DataSync

DataSync is a library that synchronizes data changed by components or libraries in real time.
<p class="alert">DataSync supports bidirectional data binding between components.</p>

### Formatter

[Formatter(N.formatter)](https://bbalganjjm.github.io/natural_js/#cmVmcjAzMDElMjRGb3JtYXR0ZXIkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDMwMS5odG1s) is a library that formats the input data set(array [json object]) and returns the formatted data set.

### Validator

[Validator(N.validator)](https://bbalganjjm.github.io/natural_js/#cmVmcjAzMDIlMjRWYWxpZGF0b3IkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDMwMi5odG1s) is a library that validates the input data set(array [json object]) and returns a validation result data set.

### Natural-DATA Library

[Natural-DATA Library](https://bbalganjjm.github.io/natural_js/#cmVmcjAzMDMlMjROYXR1cmFsLURBVEElMjBMaWJyYXJpZXMkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDMwMy5odG1s) provides methods and functions for sorting, filtering, and refining data of type array[json object].


## Natural-UI

Natural-UI is a library package that supports HTML-based UI components.

<p align="center">
	<img src="https://bbalganjjm.github.io/natural_js/images/intr/pic7.png" alt="Natural-UI">
</p>
<p align="center">[ Natural-UI ]</p>

### Alert

[Alert(N.alert)](https://bbalganjjm.github.io/natural_js/#cmVmcjA0MDElMjRBbGVydCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwNDAxLmh0bWw=) is a UI component that displays message dialogs such as window.alert or window.confirm in the form of layer popups.

### Button

[Button(N.button)](https://bbalganjjm.github.io/natural_js/#cmVmcjA0MDIlMjRCdXR0b24kaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwMi5odG1s) is a UI component that creates a button with a "a, input[type=button], button" element specified as a context option.

### Datepicker

[Datepicker(N.datepicker)](https://bbalganjjm.github.io/natural_js/#cmVmcjA0MDMlMjREYXRlcGlja2VyJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDMuaHRtbA==) a UI component that displays a calendar popup for selecting a date or month in the text input element specified by the context option.

### Popup

[Popup(N.popup)](https://bbalganjjm.github.io/natural_js/#cmVmcjA0MDQlMjRQb3B1cCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwNDA0Lmh0bWw=) is a UI component that makes a layer popup form the internal element specified by the context option or the page specified by the url option.

### Tab

[Tab(N.tab)](https://bbalganjjm.github.io/natural_js/#cmVmcjA0MDUlMjRUYWIkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwNS5odG1s) is a UI component that creates a tab page view by specifying an element consisting of div>ul>li tags as the context option.

### Select

[Select(N.select)](https://bbalganjjm.github.io/natural_js/#cmVmcjA0MDYlMjRTZWxlY3QkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwNi5odG1s) is a UI component that binds data to select, input[type=checkbox], and input[type=radio] elements to create a selection and extend the functionality of that control.

### Form

[Form(N.form)](https://bbalganjjm.github.io/natural_js/#cmVmcjA0MDclMjRGb3JtJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDcuaHRtbA==) is a UI component that binds or creates single row data to an element(block elements such as div and table) specified by the context option.

### List

[List(N.list)](https://bbalganjjm.github.io/natural_js/#cmVmcjA0MDglMjRMaXN0JGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDguaHRtbA==) is a UI component that creates a list of data in the form of a single column by specifying the ul>li element as the context option.

### Grid

[Grid(N.grid)](https://bbalganjjm.github.io/natural_js/#cmVmcjA0MDklMjRHcmlkJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDkuaHRtbA==) is a UI component that creates a list of data in a multi-column form by specifying a table element as a context option.

### Pagination

[Pagination(N.pagination)](https://bbalganjjm.github.io/natural_js/#cmVmcjA0MTAlMjRQYWdpbmF0aW9uJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MTAuaHRtbA==) is a UI component that creates paging indexes from list data or the total count of rows.

### Tree

[Tree(N.tree)](https://bbalganjjm.github.io/natural_js/#cmVmcjA0MTElMjRUcmVlJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MTEuaHRtbA==) is a UI component that makes hierarchical data into tree elements.

## Natural-UI.Shell

While Natural-UI supports UI development in the content area, Natural-UI.Shell is a component package that supports the development of shell areas outside the content area.

### Notify(N.notify)

[Notify(N.notify)](https://bbalganjjm.github.io/natural_js/#cmVmcjA1MDElMjROb3RpZnkkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDUwMS5odG1s) is a UI component that displays a global notification message in a specified location that does not require user confirmation.

### Documents(N.docs)

[Documents(N.docs)](https://bbalganjjm.github.io/natural_js/#cmVmcjA1MDIlMjREb2N1bWVudHMkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDUwMi5odG1s) is a page container that displays Natural-JS based menu pages in MDI(Multi Document Interface) or SDI(Single Document Interface) structure.

Supports
===

### Development language

* Javascript(ECMAScript 3 or later) / jQuery 1.12.4
* HTML / DHTML / HTML5
* CSS2 / CSS3

### Support browsers

* PC : Internet Explorer 8 or later(Optimized for Internet Explorer 9 or later), Chrome, Firefox, Safari(OSX), Opera latest version
* Mobile : iOS Safari, iOS UIWebView, Android Browser, Android Chrome, Android WebView

### Training and support

* Please contact us at <bbalganjjm@gmail.com>

### License
This software is licensed under the [LGPL v2.1](https://github.com/bbalganjjm/natural_js/blob/master/LICENSE) &copy; KIM HWANG MAN&lt;<bbalganjjm@gmail.com>&gt;
