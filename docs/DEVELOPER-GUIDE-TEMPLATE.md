<!-- filepath: d:\workspace\natural_js\docs\DEVELOPER-GUIDE-TEMPLATE.md -->
# Natural-TEMPLATE Developer Guide

Natural-TEMPLATE is a library that standardizes web application development based on Natural-JS, greatly improving code readability and development productivity. This guide explains the coding conventions for Natural-TEMPLATE.

## Table of Contents

- [Natural-TEMPLATE Developer Guide](#natural-template-developer-guide)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Development Guide](#development-guide)
    - [Page Source Code Conventions](#page-source-code-conventions)
    - [Controller object (N.cont) Property Naming Rules](#controller-object-ncont-property-naming-rules)
      - [Starts with "p." - UI Component Creation](#starts-with-p---ui-component-creation)
        - [N.select - Common Code Data Binding](#nselect---common-code-data-binding)
        - [N.select - Bind General List Data to Select, Radio, Checkbox](#nselect---bind-general-list-data-to-select-radio-checkbox)
        - [N.form](#nform)
        - [All Other Components](#all-other-components)
      - [Starts with "c." - Communicator (N.comm) Declaration](#starts-with-c---communicator-ncomm-declaration)
      - [Starts with "e." - Event Binding](#starts-with-e---event-binding)

## Introduction

Natural-TEMPLATE standardizes web application development based on Natural-JS, greatly improving code readability and productivity. For basic usage of Natural-JS, refer to the [Getting Started with Natural-JS](DEVELOPER-GUIDE-GETTINGSTARTED.md) document.

## Installation

1. Download `natural.template.min.js` from [Github](https://github.com/bbalganjjm/natural_js) and import it as follows:

```html
<script type="text/javascript" src="js/natural_js/natural.template.min.js" charset="utf-8"></script>
```

2. Add the following settings to [Config(natural.config.js)](DEVELOPER-GUIDE-CONFIG.md). For property descriptions, see the N.context.attr("template") tab in the [Config(natural.config.js)](DEVELOPER-GUIDE-CONFIG.md) menu.

```javascript
/**
 * Natural-TEMPLATE Config
 */
N.context.attr("template", {
    aop : {
        /**
         * Common code request information
         *
         * @codeUrl Common Code request URL
         * @codeKey Group code property name
         */
        codes : {
            codeUrl : "html/naturaljs/exap/data/code.json",
            codeKey : "code"
        }
    },
    /**
     * Multilingual Message
     */
    "message" : {
        "ko_KR" : {
            "MSG-0001" : "Please define the data option.",
            "MSG-0002" : "A server error occurred and the common code list could not be retrieved.",
            "MSG-0003" : "There is no N.comm({0}) to retrieve the data code list.",
            "MSG-0004" : "A server error occurred and the data code list could not be retrieved.",
            "MSG-0005" : "The component ({0}) is incorrectly specified.",
            "MSG-0006" : "The event ({0}) is incorrectly specified."
        }
    }
});
```

3. Finally, add the following AOP Advice to the N.context.attr("architecture").cont property in [Config(natural.config.js)](DEVELOPER-GUIDE-CONFIG.md) to complete the installation. For details on Natural-JS AOP, see the [AOP](DEVELOPER-GUIDE-ARCHITECTURE.md) page.

```javascript
"cont" : {
    "advisors" : [{
        "pointcut" : "^onOpen",
        "adviceType" : "around",
        "fn" : function(cont, fnChain, args, joinPoint) {
            if(cont.onOpenDefer || (cont.caller && cont.caller.options.preload)) {
                joinPoint.proceed();
            } else {
                cont.onOpenDefer = $.Deferred().done(function() {
                    joinPoint.proceed();
                });
            }
        }
    }]
},
```

## Development Guide

### Page Source Code Conventions

By default, the source code for block pages in Natural-JS should be structured as follows. First, refer to the [Controller](DEVELOPER-GUIDE-ARCHITECTURE.md) menu for usage and precautions for N.cont.

```html
<style>
    /* View (CSS) - Optional, add only if you want to apply styles to this file's view only. */
    .page-id {
        /* When declaring CSS selectors, always prefix with .page-id, e.g., .page-id #target { }, to avoid affecting other pages. */
    }
</style>

<article class="page-id">
    <!-- Specify page-id as the class attribute for the article tag. -->
</article>

<script type="text/javascript">
(() => {
    // When running N.cont, pass the value of the View's class attribute ("page-id") as an argument to N.
    const cont = N(".page-id").cont({
        init: (view, request) => {
            // The "init" function is automatically executed when the page load is complete.
        }
    });
})();
</script>
```

### Controller object (N.cont) Property Naming Rules

Natural-TEMPLATE features can be executed by naming Controller object properties according to conventions. This automates repetitive tasks such as initializing components or binding events.

#### Starts with "p." - UI Component Creation

Declare as below to create a Natural-UI component on the specified element and return the component instance. The property name for declaring a component in the Controller object can be combined as follows:

```javascript
"p.{component}.{elementId}" : {
    // Component options
}
```

After initialization, the property value for `p.{component}.{elementId}` is replaced with the created component instance.

Declaring `p.select.{id}` initializes the Select (N.select) component for all select elements with the specified id in the page view, stores the created component instances in an array, and replaces the property value. To use a Select component instance, retrieve it from the array, e.g., `cont["p.select.{id}"][1]`.

Component initialization options can be accessed via `cont["p.{component}.{elementId}"].options`, but direct use is not recommended.

```javascript
const cont = N(".page-id").cont({
    "p.select.id": {
        // Component options
    },
    init: (view, request) => {
        N.log(cont["p.select.id"].val()); // Use the component instance.
    }
});
```

The context option of a component is automatically assigned to the element with the specified id, but you can set it directly if you want to use a different selector (e.g., class selector).

```javascript
"p.form.detail" : {
    context : ".detail",
    revert : true,
    autoUnbind : true
},
```

When you declare the context option as above, it is automatically resolved as `N(".detail", view)`.

For N.tab and N.popup components, the function name string for the **onOpen option must start with "onOpen"** (e.g., "onOpen", "onOpenABC"). Otherwise, the onOpen function may execute before the Controller object's init function, making it impossible to reference component instances.

For N.tab, use the onOpen option instead of onActive for reliable delayed execution, as onActive may execute before init.

Component options include not only the default options for each Natural-UI component but also additional options for specifying the component's purpose or functions to execute immediately after initialization.

##### N.select - Common Code Data Binding

To use this feature, set the service URL and group code column name for common code data in the N.context.attr("template").codes property in [Config(natural.config.js)](DEVELOPER-GUIDE-CONFIG.md).

- code: Group code value to bind
- filter: Data filter function
- selected: Default selected value

Example:

```javascript
"p.select.gender" : {
    "code" : "gender",
    "selected" : "male"
}
```

You can also declare as an array: `p.select.{id} : [ "code", filterFunction ]`. If no filter is needed, just `[ "code" ]`.

```javascript
"p.select.gender" : [ "gender" ]
```

Example filter option:

```javascript
"filter" : function (data) {
    // Process the original data and return the processed data for binding.
    return N(N.array.deduplicate(data, "age")).datasort("age"); // Remove duplicates and sort.
}
```

##### N.select - Bind General List Data to Select, Radio, Checkbox

- comm: Communicator (N.comm) to retrieve the list
- data: Data to bind directly
- key: Property name for label
- val: Property name for value
- filter: Data filter function
- selected: Default selected value

Example:

```javascript
"p.select.age" : {
    "comm" : "c.getSampleCodeList",
    key : "age",
    val : "age",
    "filter" : function(data) {
        return N(N.array.deduplicate(data, "age")).datasort("age");
    },
    "selected" : "22"
}
```

You can also declare as an array: `p.select.{id} : [ "comm", "key", "val", filterFunction ]`. If no filter is needed, just `[ "comm", "key", "val" ]`.

```javascript
"p.select.age" : [ "c.getSampleCodeList", "age", "age", function(data) {
    return N(N.array.deduplicate(data, "age")).datasort("age");
}]
```

##### N.form

- usage: Purpose of the form (e.g., "search-box")

Example (general form):

```javascript
"p.form.detail" : { // N.form component options
    revert : true,
    autoUnbind : true
}
```

Example (search form):

```javascript
"p.form.search" : {
    "usage" : "search-box"
}
```

To automatically handle Enter key events in a search form, add the class "btn-search" to the main search button.

For more detailed options, specify the "search-box" option as an object:

```javascript
"p.form.search" : {
    "usage" : {
        "search-box" : {
            "defaultButton" : ".btn-search", // Selector for the button to click on Enter
            "events" : [{
                "event" : "focusin",
                "target" : "#name",
                "handler" : function(e) { N.log(e); }
            }, {
                "event" : "click",
                "target" : ".id",
                "handler" : function(e) { N.log(e); }
            }]
        }
    }
}
```

If the "usage" option is set to "search-box", Enter key event handlers are automatically bound to input elements. To override this, define your own handlers in the "events" array.

##### All Other Components

- action: Function to execute after initialization

Example (Tab):

```javascript
"p.tab.master" : { }
```

Example (Popup):

```javascript
"p.popup.dept" : {
    url : "html/naturaljs/template/samples/type04P0.html",
    onOpen : "onOpen",
    height: 621,
    onClose : function(onCloseData) {
        if (onCloseData) {
            cont["p.form.detail"]
            .val("deptNm", onCloseData.deptNm)
            .val("deptCd", onCloseData.deptCd);
        }
    }
}
```

Example (Grid):

```javascript
"p.grid.master" : {
    height : 200,
    select : true,
    selectScroll : false,
    onBind : function(context, data, isFirstPage, isLastPage) {
        if(isFirstPage) {
            this.select(0);
        }
    }
}
```

#### Starts with "c." - Communicator (N.comm) Declaration

Declare all [Communicator (N.comm)](DEVELOPER-GUIDE-ARCHITECTURE.md) objects as members of the Controller object. This makes data flow easy to see and allows AOP to be applied to declared Communicators.

Example:

```javascript
const cont = N(".page-id").cont({
    "c.PAGEID": () => {
        // Define a Communicator to load "sample/PAGEID.html" into the .box element
        return N(".box").comm("sample/PAGEID.html");
    },
    "c.getSampleList": () => {
        // Call "sample/getSampleList.json" using data from cont["p.form.search"]
        return cont["p.form.search"].data(false).comm("sample/getSampleList.json");
    },
    init: (view, request) => {
        // Insert another page using the Communicator
        cont["c.PAGEID"]().submit();
        // Load data using the Communicator
        cont["c.getSampleList"]().submit((data) => {
           cont["p.grid.master"].bind(data);
        });
    }
});
```

Declare Communicators as functions, not direct objects or values. Use them as `cont["c.{serviceName}"]().submit` (note the function call `()`).

If you connect N.comm parameters to data components like N.form, N.grid, or N.list, the latest data is automatically used as request parameters.

#### Starts with "e." - Event Binding

Declare event bindings for elements in the view in the Controller object and define event handlers.

For a, button, and input[type=button] elements, N.button is automatically applied, and the event handler is replaced with the N.button instance.

```javascript
"e.{elementId}.{eventType}" : function(e, [idx]) {
    // Event handler
}
```

or

```javascript
"e.{eventKey}.{eventType}" : {
    target : "{element selector}",
    handler : function(e, [idx]) {
        // Event handler
    }
}
```

If you want to select elements by attributes other than id, specify the selector in the target property. The context is automatically set to the view element.

After binding, the event handler function is replaced with the target element (jQuery object).

```javascript
const cont = N(".page-id").cont({
    "e.id.click": (e) => {
        e.preventDefault();
        cont["p.popup.dept"].open();
    },
    "e.id.click": {
        target: ".div #id",
        handler: (e) => {
            e.preventDefault();
            cont["p.popup.company"].open();
        }
    },
    init: (view, request) => {
        cont["e.id.click"].trigger("click");
    }
});
```

You can also apply component-provided events:

```javascript
const cont = N(".page-id").cont({
    "e.dateInput.onSelect": (e, inputEle, selDate, isMonthonly, idx) => {
        e.preventDefault();
        N.log(selDate.obj.formatDate(selDate.format));
    }
});
```

If you specify an element inside N.grid or N.list, the last argument of the event handler function returns the row index.

To reduce memory usage, use event delegation instead of binding events for each row in rowHandler or rowHandlerBeforeBind.

```javascript
const cont = N(".page-id").cont({
    "e.id.click": (e, idx) => {
        e.preventDefault();
        N.log(cont["p.grid.id"].data()[idx]);
    }
});
```

If you specify the target property as below, the context is set to the row element (tbody) of N.grid, not the view element.

```javascript
"e.col01.click" : {
    target : ".col01",
    handler : function(e, idx) {
        // TODO
    }
}
```

Natural-JS uses the change event for select elements, the click event for radio and checkbox elements, and the focusout event for other text input elements to synchronize internal and input data. Always bind events using these types to ensure you get the latest data.

```javascript
const cont = N(".page-id").cont({
    "e.textInput.focusout": (e, idx) => {
        e.preventDefault();
        N.log(cont["p.grid.id"].val(idx, "textInput"));
    }
});
```
