# API Documentation Guide

The API documentation provides usage methods and explanations for the features and options supported by Natural-JS components and libraries.

The documentation is divided into pages by component, and page sections are separated by tabs.

* **Overview**: Overview of the component or library.

* **API DEMO**: Demo program for testing components or libraries in real-time.

* **Constructor**: Description of the function that is executed when a component instance or library instance is created and constructor arguments.

    Example: **N.grid**[<sup>1)</sup>](#fn1)(***argument[0]***[<sup>2)</sup>](#fn2)), **N().grid**(***argument[0]***)

* **Default Options**: Description of the default options for the component or library.

    Example: N([]).grid(**{ resizeable: true }**[<sup>3)</sup>](#fn3))

* **Declarative Options**: Options defined in JSON format in the data-* attributes of the template HTML elements used by the component or library.

    Example: &lt;input id="date" type="text" **data-format='[["date", 8]]'**[<sup>4)</sup>](#fn4) /&gt;
    
    * Declarative options can be defined with the following attributes:
      1. Format Rules: data-format
      2. Validation Rules: data-validate
      3. All component options except a and b: data-opts

> Declarative options must strictly adhere to the JSON standard format (key values must be enclosed in double quotes). If the JSON standard format is not followed, declarative options will not be recognized or errors will occur.

> Rules executed by declarative options such as data-format or data-validate are defined as array-type strings, with arguments listed in order after the rule name.
> Example) data-format='[["date", 8], ["lpad", 10, "@"]]'

* **Functions**: Description of methods and arguments provided by component or library instances.

    Example: N([]).grid({ resizeable: true }).**revert**[<sup>5)</sup>](#fn5)(**3**[<sup>6)</sup>](#fn6))

* **Examples**: Examples of component or library usage.

---

**Terminology**
* jQuery object: jQuery extension object or jQuery selector returned when executing jQuery() or $(), N() function.
* selector: A string specified in CSS selector form in jQuery, or object, array, html element, function, etc.

---

**Footnotes**
1. <span id="fn1">Constructor</span>
2. <span id="fn2">Constructor arguments</span>
3. <span id="fn3">Default options</span>
4. <span id="fn4">Declarative options</span>
5. <span id="fn5">Function</span>
6. <span id="fn6">Function arguments</span>
