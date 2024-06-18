Natural-TEMPLATE Development Guide
===

## Introduction

Natural-TEMPLATE formalizes Natural-JS-based web application development, greatly improving code readability and development productivity.

> To learn the basic usage of Natural-JS, refer to the [Getting Started with Natural-JS](#html/naturaljs/gtst/gtst0100.html) document.

## Contents

* [**Install**](#install)
* [**Development guide**](#developmentguide)
    * [Page source code writing rules](#pagesourcecodewritingrules)
    * [Rules for creating property names for Controller object(N.cont)](#rulesforcreatingpropertynamesforcontrollerobjectncont)

        * [1. Starts with "p." - Create UI components](#1startswithpcreateuicomponents)
            * [1.1. N.select - Common code data binding](#11nselectcommoncodedatabinding)
            * [1.2. N.select - Binding general list data to select elements(select, radio, checkbox)](#12nselectbindinggenerallistdatatoselectelementsselectradiocheckbox)
            * [1.3. N.form](#13nform)
            * [1.4. All other components](#14allothercomponents)

        * [2. Starts with "c." - Communicator(N.comm) declaration](#2startswithccommunicatorncommdeclaration)

        * [3. Starts with "e." - Event binding](#3startswitheeventbinding)

## Install

1. Download the natural.template.min.js file from [Github](https://github.com/bbalganjjm/natural_js/tree/master/dist) and import the library as follows.

```
<script type="text/javascript" src="js/natural_js/natural.template.min.js" charset="utf-8"></script>
```

2. Add the following setting to [Config(natural.config.js)](#html/naturaljs/refr/refr0102.html). For a description of properties, refer to the **N.context.attr("template")** tab in the [Config(natural.config.js)](#html/naturaljs/refr/refr0102.html) menu.

```
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
        "en_US" : {
            "MSG-0001" : "Define the data option.",
            "MSG-0002" : "The common code list could not be queried because a server error occurred.",
            "MSG-0003" : "There is no N.comm({0}) to query the data code list.",
            "MSG-0004" : "The data code list could not be queried because a server error occurred.",
            "MSG-0005" : "Component({0}) was incorrectly specified.",
            "MSG-0006" : "Event({0}) was incorrectly specified."
        }
    }
});
```

3. Finally, add AOP Advice to the N.context.attr("architecture").cont property of [Config(natural.config.js)](#html/naturaljs/refr/refr0102.html) as follows to complete the installation.
   For an explanation of Natural-JS's AOP, please refer to the [AOP](#html/naturaljs/refr/refr0202.html) page.

```
...
"cont" : {
    "advisors" : [{ // Pointcut for executing onOpen after a delayed init on a popup or tab
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
...
```


# Development guide

## Page source code writing rules

Basically, the source code of Natural-JS block pages should be structured as follows.
First, Please refer to the usage and precautions of N.cont in the [Controller](#html/naturaljs/refr/refr0201.html) menu.

```javascript
<style>
    /* View(CSS) - It can be omitted and is added only when you want to apply the style only to the View in this file. */
    .page-id {
        /* When declaring a CSS selector, you must add .page-id first, like .page-id #target { }. Otherwise, it will affect other pages as well. */
    }
</style>

<article class="page-id">
    <!-- Specify page-id as a class attribute in the article tag. -->
</article>

<script type="text/javascript">
(function() {

    //  When executing the N.cont function, enter the "page-id" value defined as the class property of View as the argument of N.
    var cont = N(".page-id").cont({
        init : function(view, request) {
            // This "init" function runs automatically once the page has finished loading.
        }
    });

})();
</script>
```

## Rules for creating property names for Controller object(N.cont)
Natural-TEMPLATE functions can be executed using the naming convention for Controller object property names. Automate repetitive tasks such as initializing components and binding events.

### 1. Starts with "p." - Create UI components

If you declare as follows, Natural-UI component is created in the specified element and the created component instance is returned.
The property names of the Controller object that declares the component can be used in combination as follows.

```
"p.{Component name}.{Element id}" : {
    // Component options
}
```

When initialization is complete, the component option object specified by the `p.{Component name}.{Element id}` property value is replaced with an instance of the created component.

> The `p.select.{id}` declaration initializes the Select(N.select) component for all selected elements that have the corresponding id attribute value in the page view, stores the created component instances in the Array, and replaces the property value. When using an instance of the Select component, an instance to be used such as `cont["p.select.{id}"][1]` must be taken out of the Array and used.

> Component initialization options can be accessed with `cont["p.{Component name}.{Element id}"].options`, but direct use of the options is not recommended.

```
...
var cont = N(".page-id").cont({
    "p.select.id" : {
        // Component options
    },
    init : function(view, request) {
        N.log(cont["p.select.id"].val()); // Using component instances.
    }
});
...
```

In the context option of the component, the element specified by {id} is automatically assigned, but if you want to specify another selector, such as a class selector other than id, you can set the context option directly.

```
...
"p.form.detail" : {
    context : ".detail",
    revert : true,
    autoUnbind : true
},
...
```

If you declare the context option as above, a syntax that is found within the view, such as `N(".detail", view)`, is automatically generated.

>**The function name string of the `onOpen option of N.tab and N.popup components must start with onOpen (“onOpen”, “onOpenABC”, etc.). Otherwise, the onOpen function is executed before the init function of the Controller object, so you may not be able to reference component instances.**

>**Use the onActive option of N.tab component with caution. There is no countermeasure against delayed execution of the init function, so onActive is executed before init. Use onOpen if you want a similar, stable feature.**

As for component options, in addition to the default options for each component of Natural-UI, the option to specify the usage of the component or to execute the function immediately after initialization is added.
Additional options for each component available only in Natural-TEMPLATE are as follows.

### 1.1. N.select - Common code data binding

**To use this function, the service URL that provides common code data and the common code classification code column name must be set in the N.context.attr("template").codes property of [Config(natural.config.js)](#html/naturaljs/refr/refr0102.html).**

| Property | Option name | Type | Required | Property value | Description |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.select.{id} | - | - | - | - | Initialize the N.select component. |
| - | code | string | O | Common code classification code | Set the classification code value of the code list to be bound. |
| - | filter | function | | Data filter | Filter and bind common code data. |
| - | selected | string | | Default selection value | When initializing a component, set the value of the option to be selected by default. |

```
...
"p.select.gender" : {
    "code" : "gender",
    "selected" : "male"
},
...
```

 * You can also simply declare by an array type option like p.select.{id} : [ "code", filterFunction ]. If you don't need a filter, you can also only declare ["code"].

```
...
"p.select.gender" : [ "gender" ],
...
```

 * Example "filter" option
```
...
"filter" : function (data) {
    // When the data (original data) is processed and returned, the processed data is bound.
    return N(N.array.deduplicate(data, "age")).datasort("age"); // Sort after deduplication.
}
...
```

### 1.2. N.select - Binding general list data to select elements(select, radio, checkbox)

| Property | Option name | Type | Required | Property value | Description |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.select.{id} | - | - | - | - | Initialize the N.select component. |
| - | comm | string | | Communicator(N.comm) for get the list | Specify "c.{serviceName}" declared in the Controller object. |
| - | data | array[object] | | Data to bind | You can directly create and bind data such as [{}, {}] with the data option without specifying the comm option. |
| - | key | string | O | Data property name to be bound to the name of the option element | Set the property name to be bound in the retrieved data object. |
| - | val | string | O | Data property name to be bound to the value of the option element | Set the property name to be bound in the retrieved data object. |
| - | filter | function | | Data filter | Filter and bind common code data. |
| - | selected | string | | Default selection value | When initializing a component, set the value of the option to be selected by default. |

```
...
"p.select.age" : {
    "comm" : "c.getSampleCodeList",
    key : "age",
    val : "age",
    "filter" : function(data) {
        return N(N.array.deduplicate(data, "age")).datasort("age");
    },
    "selected" : "22"
},
...
```

 * You can also simply declare by an array type option like p.select.{id} : [ "comm", "key", "val", filterFunction ]. If you don't need a filter, you can also only declare [ "comm", "key", "val" ].

```
...
"p.select.age" : [ "c.getSampleCodeList", "age", "age", function(data) {
    return N(N.array.deduplicate(data, "age")).datasort("age");
}],
...
```

### 1.3. N.form

| Property | Option name | Type | Required | Property value | Description |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.form.{id} | - | - | - | - | Initialize the N.form component. |
| - | usage | string or object | O | Usage of Form | If you input the string "search-box", the specified area is created as a search box form.<br>You can specify more detailed options with the object type(See description below). |

 * General form example
```
...
"p.form.detail" : { // N.form component options
    revert : true,
    autoUnbind : true
},
...
```


 * Search form example

```
...
"p.form.search" : {
    "usage" : "search-box"
},
...
```

> In order to automatically process the enter key event in the search form, you must add the class attribute value "btn-search" to the main search button.

To set more detailed options, you can specify the "search-box" option as object as in the following example.

> Form with the "usage" option set to "search-box" is automatically bound to the event handler that is searched with the Enter key on the input element. To block the execution of this Enter key event handler and bind another event handler, define as many event handlers as necessary in the "events" property of the "search-box" option object.

```
...
"p.form.search" : {
    "usage" : {
        "search-box" : {
            "defaultButton" : ".btn-search", // A selector string that selects the button element to be clicked when the enter key is pressed.
            "events" : [{ // Add when you want to block the Enter key event and assign the event directly to the input element.
                "event" : "focusin", // Event type
                "target" : "#name", // Selector string to select the target element in the search box
                "handler" : function(e) { // Event handler
                    N.log(e);
                }
            }, {
                "event" : "click",
                "target" : ".id",
                "handler" : function(e) {
                    N.log(e);
                }
            }]
        }
    }
},
...
```

### 1.4. All other components

| Property | Option name | Type | Required | Property value | Description |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.{component}.{id} | - | - | - | - | Initialize the N.{component}. All components except N.alert can be initialized in this way. |
| - | action | string | - | Component function name | After the component is initialized, the specified function is immediately executed. |

 * Tab(N.tab) example

```
...
"p.tab.master" : { },
...
```

 * Popup(N.popup) example

```
...
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
},
...
```

 * Grid(N.grid) example

```
...
"p.grid.master" : {
    height : 200,
    select : true,
    selectScroll : false,
    onBind : function(context, data, isFirstPage, isLastPage) {
        if(isFirstPage) {
            this.select(0);
        }
    }
},
...
```

## 2. Starts with "c." - Communicator(N.comm) declaration

Any [Communicator(N.comm)](#html/naturaljs/refr/refr0203.html) that communicates with the server can be declared as a member variable of the Controller object. If you pre-declare Communicator, If you declare a Communicator in advance, you can check the data flow at a glance and apply AOP to the declared Communicator.
The property names of the Controller object declared as Communicator can be used in combination as follows.

```
"c.{serviceName}" : function() { 
    return N(params).comm({url}); 
}
```

>If possible, define the service name as the same as the service name in the last path of the calling URL. If there is a duplicate service name, define it by combining the extension, such as getSampleList*Json*.
>Still, if there are duplicate service names, list search is `get + {serviceName} + List`, single search is `get + {serviceName}`, multiple service names are saved(CUD) is `save + {serviceName} + List`, input is `insert. + {serviceName}`, edit is defined as `update + {serviceName}`, and deletion is defined as `delete + {serviceName}`.

```
...
var cont = N(".page-id").cont({
    "c.PAGEID" : {
        // "sample/PAGEID.html" Define a Communicator that loads the page into the .box element
        return N(".box").comm("sample/PAGEID.html");
    },
    "c.getSampleList" : {
        // Calling "sample/getSampleList.json" service with data of cont["p.form.search"] as a parameter.
        return cont["p.form.search"].data(false).comm("sample/getSampleList.json");
    },
    init : function(view, request) {
        // Inserting another page with Communicator
        cont["c.PAGEID"]().submit();

        // Getting data with Communicator
        cont["c.getSampleList"]().submit(function(data) {
           cont["p.grid.master"].bind(data);
        });
    }
});
```

Communicator declaration is a method of specifying an execution function rather than directly assigning an object or value. When used, the function execution syntax `()` is added, such as `cont["c.{service name}"]().submit`. Please be careful what you do.
If you connect the N.comm parameter to the data() method of a data-related component such as N.form, N.grid, or N.list as shown in the example above, the latest data of the component is automatically specified as a request parameter.

## 3. Starts with "e." - Event binding

You can declare event binding to elements in the view and define event handlers.

>When an event is declared on a, button, input[type=button] element, the N.button component is automatically applied, and the event handler defined by the Controller object property value is replaced with an instance of N.button.

```
"e.{elementId}.{eventType}" : function(e, [idx]) {
    // Event handler
}
```

or

```
"e.{eventId}.{eventType}" : {
    target : "{element selector}",
    handler : function(e, [idx]) {
        // Event handler
    }
}
```

When selecting an element with an attribute other than id, you can specify a jQuery selector string in the target attribute. At this time, even if you do not specify the selector's context as a view element, the view element is automatically specified as the context argument.

When event binding is completed, the event handler function defined by the property value of `e.{elementid}.{eventname}` is replaced with the target element(jQuery object).

```
...
var cont = N(".page-id").cont({
    "e.id.click" : function(e) { // When event binding is completed, this event handler function is replaced with the target element(jQuery object).
        e.preventDefault();

        cont["p.popup.dept"].open();
    },
    "e.id.click" : {
        target : ".div #id",
        handler : function(e) { // When event binding is completed, this event handler function is replaced with the target element(jQuery object).
            e.preventDefault();

            cont["p.popup.company"].open();
        }
    },
    init : function(view, request) {
        cont["e.id.click"].trigger("click"); // Fires this event when DOM loading is complete.
    }
});
...
```

You can also apply events provided by components as follows.

```
...
var cont = N(".page-id").cont({
    "e.dateInput.onSelect" : function(e, inputEle, selDate, isMonthonly, idx) { // onSelect event of N.datepicker
        e.preventDefault();

        N.log(selDate.obj.formatDate(selDate.format)); // The selected date is extracted to the set date format and print to the browser console.
    },
});
...
```

If an element in the N.grid or N.list component is specified, the `index of the row containing the element` in the last argument of the event handler function is `returned`.

>If you bind events for each row in rowHandler or rowHandlerBeforeBind, the browser heap memory usage increases by the number of events X rows, which degrades web application performance. Using the method below(Event Delegation applies) can significantly reduce the memory usage by events.

```
...
var cont = N(".page-id").cont({
    "e.id.click" : function(e, idx) {
        e.preventDefault();

        N.log(cont["p.grid.id"].data()[idx]); // 클릭한 버튼이 속한 행 데이터를 브라우저 콘솔에 출력.
    }
});
...
```

> When an element is specified with the target property as shown below, the context of the selector is set to the row element (tbody) of N.grid, not the view element.

```
...
"e.col01.click" : {
    target : ".col01Ele", // The context of this selector is set to the row element (tbody) of N.grid, not the view element.
    handler : function(e, idx) {
        // TODO
    }
}
...
```

>Natural-JS uses change event for select element, click event for radio, checkbox element, and focusout event for other text input elements (text, textarea, number, etc.) to synchronize internal data and input data. 
>When getting the internal data of a component, it must be bound with the event name as above. 
>Otherwise, data before the change is returned.

```
...
var cont = N(".page-id").cont({
    "e.textInput.focusout" : function(e, idx) { // When binding with the change event, the data before the change is returned.
        e.preventDefault();

        N.log(cont["p.grid.id"].val(idx, "textInput"));
    }
});
...
```

<br>