API Documentation Guide
===

API documentation is a document that provides usage and descriptions of the features and options supported by Natural-JS's components and libraries.

Documents are divided into pages by component, and page paragraphs are separated by tabs.

* __Overview__ : Overview of the component or library.

* __API DEMO__ : Demo program for testing components or libraries in real time

* __Constructor__ : A description of the function and constructor arguments that are executed when the component instance or library instance is created.

    ex) __N.grid__[<sup>1)</sup>](#fn1)(___argument[0]___[<sup>2)</sup>](#fn2)), __N().grid__(___argument[0]___)

* __Default Options__ : Description of default options for a component or library.

    ex) N([]).grid(__{ resizeable : true }__[<sup>3)</sup>](#fn3))

* __Declarative Options__ : Option defined as a JSON-formatted string in the data-* attribute of the template HTML elements used by the component or library.

    ex) &lt;input id="date" type="text" __data-format='[["date", 8]]'__[<sup>4)</sup>](#fn4) /&gt;

    * Declarative options can be defined with the following attributes.
        1. Format Rules : data-format
        2. Validation Rules : data-validate
        3. All component options except a and b : data-opts

<p class="alert">Declarative options must conform exactly to the JSON standard format(Property names must be enclosed in double quotes). If you do not comply with the JSON standard format, the declarative options are not recognized or an error occurs.</p>

<div class="alert">
    Rules executed with declarative options such as data-format or data-validate are defined in an array type string and the arguments are listed in order after the rule name.
    <div class="alert">ex) data-format='[["date", 8], ["lpad", 10, "@"]]'</div>
</div>

* __Methods__ : A description of the methods and arguments provided by the component or library instance.

    예) N([]).grid( { resizeable : true } ).__revert__[<sup>5)</sup>](#fn5)(__3__[<sup>6)</sup>](#fn6))

* __Examples__ : Examples of using a component or library

---

__Terms__
* jquery object : Object returned by jQuery extension object or jQuery selector when executing jQuery() or $(), N() function.
* selector : Strings or objects, arrays, html elements, and functions that you specify in CSS selector form in jQuery.

---

__Note__
1. <span id="fn1">Constructor</span>
2. <span id="fn2">Constructor arguments</span>
3. <span id="fn3">Default Option</span>
4. <span id="fn4">eclarative Option</span>
5. <span id="fn5">Method</span>
6. <span id="fn6">Method arguments</span>