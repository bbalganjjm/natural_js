# Natural-JS Getting Started Guide

This document provides a getting started guide and basic tutorial for the Natural-JS framework. It is designed to help developers new to Natural-JS learn step by step, from setting up the environment to developing a sample application.

## Table of Contents

- [Natural-JS Getting Started Guide](#natural-js-getting-started-guide)
  - [Table of Contents](#table-of-contents)
  - [Setting Up the Natural-JS Runtime Environment](#setting-up-the-natural-js-runtime-environment)
    - [Downloading the Library](#downloading-the-library)
    - [Required Library Files](#required-library-files)
    - [TypeScript Support](#typescript-support)
    - [Importing Libraries in HTML](#importing-libraries-in-html)
    - [Configuration](#configuration)
    - [Component Option Precedence](#component-option-precedence)
    - [Writing Sample Code](#writing-sample-code)
    - [Handling JSON Data](#handling-json-data)
    - [Creating the Index Page](#creating-the-index-page)
  - [Creating a Basic Web Application Frame](#creating-a-basic-web-application-frame)
    - [Project Structure](#project-structure)
    - [Creating the Index Page (Web App Frame)](#creating-the-index-page-web-app-frame)
    - [Creating the Left Menu](#creating-the-left-menu)
    - [Creating Content Pages](#creating-content-pages)
  - [Viewing and Modifying Data with Grid](#viewing-and-modifying-data-with-grid)
    - [Adding a Menu](#adding-a-menu)
    - [Writing the CRUD Page View](#writing-the-crud-page-view)
    - [Implementing the CRUD Page Controller](#implementing-the-crud-page-controller)
      - [Initializing N.select](#initializing-nselect)
      - [Initializing N.form](#initializing-nform)
      - [Initializing N.grid](#initializing-ngrid)
    - [Event Binding](#event-binding)
      - [Search Button Event](#search-button-event)
      - [New Button Event](#new-button-event)
      - [Delete Button Event](#delete-button-event)
      - [Save Button Event](#save-button-event)

## Setting Up the Natural-JS Runtime Environment

### Downloading the Library

First, download the Natural-JS library files using one of the following methods:

- Download directly from GitHub
- Bower: `bower install natural_js`
- npm: `npm install @bbalganjjm@natural_js`

### Required Library Files

The essential library files to run Natural-JS are as follows:

1. **lib/jquery-3.7.1.min.js**
   - Natural-JS depends on jQuery, so it must be imported.

2. **css/natural.ui.css**
   - Stylesheet file related to Natural-UI design.
   - Make sure to include all files in the css folder: `dark.css`, `light.css`, and `css/tokens.css`.

3. **dist/natural.js{+code}{+template}.{es5|es6}.min.js**
   - The minified file containing the entire Natural-JS library.
   - Depending on the ECMAScript version and package, use one of the following files:
     - dist/natural.js+code+template.es5.min.js: ES5-based, includes Natural-CODE and Natural-TEMPLATE packages
     - dist/natural.js+code+template.es6.min.js: ES6-based, includes Natural-CODE and Natural-TEMPLATE packages
     - dist/natural.js+code.es5.min.js: ES5-based, includes Natural-CODE package
     - dist/natural.js+code.es6.min.js: ES6-based, includes Natural-CODE package
     - dist/natural.js+template.es5.min.js: ES5-based, includes Natural-TEMPLATE package
     - dist/natural.js+template.es6.min.js: ES6-based, includes Natural-TEMPLATE package
     - dist/natural.js.es5.min.js: ES5-based Natural-JS file
     - dist/natural.js.es6.min.js: ES6-based Natural-JS file

   > You can also generate your own build including the desired packages using `compiler/closure-compiler.jar` included in the natural_js source code.

4. **dist/natural.config.js**
   - The configuration file for Natural-JS.

### TypeScript Support

Natural-JS provides type declaration files for TypeScript support. Add the path to the Natural-JS type declaration files in your `tsconfig.json` as shown below to enable TypeScript development:

```json
{
  "compilerOptions": {
    ...
    "types": ["js/natural_js/@types"]
  }
}
```

### Importing Libraries in HTML

Now, create a top-level HTML file and import the above files in the following order:

```html
<script type="text/javascript" src="js/natural_js/lib/jquery-3.7.1.min.js"></script>
<link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
<script type="module" charset="utf-8" src="js/natural_js/dist/natural.js+code+template.es6.min.js"></script>
<script type="module" charset="utf-8" src="js/natural_js/dist/natural.config.js"></script>
```

If you want to use all of CORE, ARCHITECTURE, DATA, UI, and UI.Shell, import `natural.js.min.js`. If you want to use each package separately, import them individually.

Package dependencies are as follows:

- To use only Natural-CORE: natural.core.js
- To use only Natural-ARCHITECTURE: natural.core.js, natural.architecture.js
- To use only Natural-DATA: natural.core.js, natural.data.js
- To use only Natural-UI: natural.core.js, natural.data.js, natural.ui.js
- To use only Natural-UI.Shell: natural.core.js, natural.ui.js, natural.ui.shell.js

> Since the combined natural.js.min.js is only about 145kb, importing just this file will not significantly affect performance.

### Configuration

Open the configuration file `natural.config.js` for Natural-JS. You will see settings like the following:

```javascript
/* Natural-ARCHITECTURE Config */
N.context.attr("architecture", {
    "page" : {
        "context" : "#contents"
    },
    ...
/* Natural-UI Config */
N.context.attr("ui", {
    "alert" : {
        "container" : "#contents"
    ...
```

The configuration values for Natural-JS are stored in the Context (N.context) object. Among these, `N.context.attr("architecture").page.context` is a very important value. This value should be set to a jQuery selector string that specifies the container element where Natural-JS components will be loaded. In other words, specify a static box element where page content will be displayed.

Also, set the selector for the container element where the N.alert HTML element will be stored in `N.context.attr("ui").alert.context`. Usually, this is the same as `N.context.attr("architecture").page.context`.

Resources for components such as Tab (N.tab), Popup (N.popup), and Datepicker (N.datepicker) provided by Natural-UI are created in the area specified by `N.context.attr...context`. When the page changes, this area is overwritten, releasing browser resources. This is convenient for developing single page web applications that do not use page redirects, as you do not need to manage browser resources separately.

> If you use the Documents (N.docs) component, you do not need to specify this.
> If it is not a SPA (Single Page Application), set it to "body".

### Component Option Precedence

The precedence for applying component options in Natural-JS is as follows:

1. Option values specified when initializing the component
2. Option values specified in Config (natural.config.js)
3. Default option values of the component

If a component's default option value is not specified in Config, and you do not specify it during initialization, the component will use its own default value. If you want to set a component's default option value as a site-wide option, add it to the relevant section in the configuration file.

For example, to set the default height of all grid component body areas to 300 pixels, add the following to N.context.attr("ui").grid:

```javascript
N.context.attr("ui", {
    ...
    "grid" : {
        ...
        "height" : 300,
        ...
    }
    ...
```

### Writing Sample Code

Natural-JS has simple code structure rules to separate development and design areas in page block source code and to guarantee scope between elements and scripts. Just separate the View and Controller areas and place them in order as shown below.

```html
<!-- block01.html -->
<!-- View -->
<article id="block01">
    <div id="result">
    </div>
</article>

<script type="text/javascript">
N(".block01").cont({ // Controller object
    init : function(view, request) {
        N.comm("data.json").submit(function(data) {
            // data is received data from the server
            N("#result", view).text(JSON.stringify(data));
        });
    }
});
</script>
```

All pages or page blocks based on Natural-ARCHITECTURE must be structured as above.

Save the above code as `block01.html`.

The N.comm function inside the init function of the ".block01" Controller object is used to retrieve data from the server.

Natural-JS uses the Communicator (N.comm) module to send and receive data and files with the server.

### Handling JSON Data

The data type for component data and data transmission in Natural-JS is JSON. You need a server that provides data in JSON format. For information on JSON conversion modules for each programming language, see [http://www.json.org/json-ko.html](http://www.json.org/json-ko.html).

To receive data temporarily, create and save a data file (data.json) as a JSON string as shown below:

```json
[
  {
    "key": "53e21cba9f982281b3459438",
    "index": 0,
    "guid": "1a9e5450-c664-4bfd-8174-d03005eca08d",
    "isActive": "Y",
    "balance": "$1,284.38",
    "picture": "http://placehold.it/32x32",
    "age": 26,
    "eyeColor": "green",
    "name": "Dean Stanley",
    "gender": "male",
    "company": "ZENTIA",
    "email": "deanstanley@zentia.com",
    "phone": "+1 (920) 409-2680",
    "address": "936 Meserole Street, Vicksburg, Massachusetts, 1198",
    "about": "Mollit elit qui reprehenderit fugiat excepteur adipisicing sunt id proident laborum sint proident.",
    "registered": "2014-02-20T03:58:09 -09:00",
    "latitude": 81.131606,
    "longitude": 87.110498,
    "greeting": "Hello, Dean Stanley! You have 1 unread messages.",
    "favoriteFruit": "strawberry"
  }
]
```

### Creating the Index Page

Now, let's create a simple index page and use N.comm to add the `block01.html` page to the desired location. Save the following code as `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
<meta content="text/html; charset=utf-8" />
<title>Natural-JS</title>
<script type="text/javascript" src="js/natural_js/lib/jquery-3.7.1.min.js"></script>
<link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
<script type="text/javascript" src="js/natural_js/natural.js.min.js"></script>
<script type="text/javascript" src="js/natural_js/natural.config.js"></script>

<script type="text/javascript">
    $(document).ready(() => {
        N(N.context.attr("architecture").page.context).comm("block01.html").submit();
    });
</script>

</head>
<body>
    <!-- Page Context(N.context.attr("architecture").page.context) element. -->
    <div id="contents"></div>
</body>
</html>
```

The callback argument of the $(document).ready function in `index.html` uses N.comm to load the `block01.html` page into the `#contents` (N.context.attr("architecture").page.context) element. When the page is loaded, N.comm automatically executes the init function of the Controller (N.cont) object.

Now, all preparations for running Natural-JS are complete. To run, you need a web server. Install a web server, copy the index.html, block01.html, and data.json files to the web context root, start the web server, and open the address (URL) of the index.html file in your browser.

## Creating a Basic Web Application Frame

This section explains how to develop a single page web application using the Documents (N.docs) component, which places the menu on the left and displays pages in MDI format on the right.

### Project Structure

First, create the following folders for your development project:

- /js/natural_js - Folder for Natural-JS JavaScript library files
- /js/natural_js/lib - Folder for jQuery library files
- /js/natural_js/css - Folder for Natural-JS UI component CSS files
- /html/contents - Folder for menu content files
- /html/index - Folder for main index and related files

After creating the folders, download the following files from the master branch on GitHub and copy them to the corresponding paths:

- js/natural_js/lib/jquery-3.7.1.min.js
- js/natural_js/css/natural.ui.css
- js/natural_js/natural.js.min.js
- js/natural_js/natural.config.js

### Creating the Index Page (Web App Frame)

Once the project environment is set up, save the following code as `/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
<meta content="text/html; charset=utf-8" />
<title>Natural-JS</title>
<script type="text/javascript" src="js/natural_js/lib/jquery-3.7.1.min.js"></script>
<link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
<script type="text/javascript" src="js/natural_js/natural.js.min.js" charset="utf-8"></script>
<script type="text/javascript" src="js/natural_js/natural.config.js" charset="utf-8"></script>

<style type="text/css">
html {
    height: 100%;
}

body {
    display: flex;
    flex-direction: row;
    font-size: 13px;
    margin: 0;
    height: 100%;
}

#lefter {
    flex: 1;
    max-width: 200px;
    border-right: 1px solid var(--md-sys-color-outline-variant);
    height: 100%;
}

#docs {
    flex: 1;
    height: 100%;
}
</style>

<script type="text/javascript">
    // Global N.docs instance.
    window.docs;

    $(document).ready(function() {
        // Import left menu page.
        N("#lefter").comm("html/index/lefter.html").submit(function() {
            // Create new N.docs instance;
            docs = N("#docs").docs();
        });

    });
</script>
</head>
<body>
    <!-- lefter -->
    <div id="lefter"></div>
    <!-- N.docs context element. -->
    <div id="docs"></div>
</body>
</html>
```

`/index.html` is the main index page for accessing this application. Since it is a SPA (Single Page Application), the browser URL will not change while using the web application.

The callback function of $(document).ready loads `/html/index/lefter.html` for the left menu and creates the MDI page container using the N.docs component. Only one instance of the N.docs component should be created per application, so it is stored in the window object for global use.

### Creating the Left Menu

Now, create the left menu block page (`/html/index/lefter.html`) that loads the menu content:

```html
<style type="text/css">
.index-lefter .menu a {
    text-decoration: none;
    line-height: 2em;
    color: #000;
}
</style>

<article class="index-lefter">
    <ul class="menu">
        <li><a href="html/contents/page1.html" data-docid="page1">MENU-1</a></li>
        <li><a href="html/contents/page2.html" data-docid="page2">MENU-2</a></li>
        <li><a href="html/contents/page3.html" data-docid="page3">MENU-3</a></li>
        <li><a href="html/contents/page4.html" data-docid="page4">MENU-4</a></li>
        <li><a href="html/contents/page5.html" data-docid="page5">MENU-5</a></li>
    </ul>
</article>

<script type="text/javascript">
N(".index-lefter").cont({
    init : function(view, request) {
        N(".menu", view).on("click", "a", function(e) {
            e.preventDefault();

            window.docs.add(N(this).data("docid"), N(this).text(), {
                url : N(this).attr("href")
            });
        });
    }
});
</script>
```

The style block defines styles that apply only to this page's view. When the page is closed, the styles are also removed.

The init function of the N.cont object binds a click event to the menu links. When a menu link is clicked, it uses the add method of the N.docs instance stored in the window object to load the menu content.

### Creating Content Pages

Next, create the menu content files. Here, we will create five simple pages: `/html/contents/page1.html` to `/html/contents/page5.html`. Each file has the same structure. For example, the code for page1.html is as follows:

```html
<style type="text/css">
    .page1 .text {
        text-align: center;
    }
</style>

<article class="page1">
    <p class="text">page1</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {
        // Initialization code
    }
});
</script>
```

Create all pages with the same structure, changing only the class name and text content to match the page number.

## Viewing and Modifying Data with Grid

This section explains how to develop a program that handles create/read/update/delete (CRUD) operations using a grid for the search condition area and the result grid.

- Use the Select (N.select) component to bind code data
- Use the Form (N.form) component to create the search condition area as a form
- Use the Grid (N.grid) component to create a grid for input/view/edit/delete
- Use the Button (N.button) component for buttons

### Adding a Menu

First, open `/html/index/lefter.html` and add a new `li` element at the end of the `ul` tag to add a Grid CRUD menu link (page6.html):

```html
<ul class="menu">
    <li><a href="html/contents/page1.html" data-docid="page1">MENU-1</a></li>
    <li><a href="html/contents/page2.html" data-docid="page2">MENU-2</a></li>
    <li><a href="html/contents/page3.html" data-docid="page3">MENU-3</a></li>
    <li><a href="html/contents/page4.html" data-docid="page4">MENU-4</a></li>
    <li><a href="html/contents/page5.html" data-docid="page5">MENU-5</a></li>
    <li><a href="html/contents/page6.html" data-docid="page6">Grid CRUD</a></li>
</ul>
```

### Writing the CRUD Page View

Create `/html/contents/page6.html` and write the following code:

```html
<!-- Style -->
<style type="text/css">
    .page6 {
        padding: 15px;
    }

    .page6 .search-conditions {
        border: 1px solid var(--md-sys-color-outline-variant);
        padding: 10px;
    }
    .page6 .search-conditions > label {
        margin-right: 40px;
    }
    .page6 .search-conditions input,
    .page6 .search-conditions select {
        margin-left: 10px;
    }

    .page6 .buttons {
        padding: 10px;
        text-align: right;
    }

    /* Grid Style */
    .page6 .result input {
        width: 90%;
        border-width: 1px;
    }
    .page6 table {
        border-spacing: 0;
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
    }
    .page6 table th,
    .page6 table td {
        border: 1px solid var(--md-sys-color-outline-variant);
        box-sizing: border-box;
    }
</style>

<!-- View -->
<article class="page6">

    <div class="search-conditions">
        <label>Name<input id="name" type="text" data-validate='[["alphabet+integer"]]'></label>
        <label>Gender<input id="gender" type="radio"></label>
    </div>

    <div class="buttons">
        <a id="btnAdd" href="#">New</a>
        <a id="btnDelete" href="#">Delete</a>
        <a id="btnSave" href="#">Save</a>
        <a id="btnSearch" href="#">Search</a>
    </div>

    <div class="result">
        <table class="grid">
            <colgroup>
                <col style="width: 50px;">
                <col style="width: 120px;">
                <col style="width: auto;">
                <col style="width: 90px;">
                <col style="width: 50px;">
                <col style="width: 110px;">
                <col style="width: 60px;">
            </colgroup>
            <thead>
                <tr>
                    <th><input lang="ko_KR" id="checkAll" type="checkbox" title="Check All"></th>
                    <th>Name</th>
                    <th data-filter="true">Email</th>
                    <th data-filter="true">Eye Color</th>
                    <th data-filter="true">Age</th>
                    <th data-filter="true">Registered</th>
                    <th data-filter="true">Active</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center;"><input class="checkAllTarget" type="checkbox"></td>
                    <td><input id="name" type="text" data-validate='[["required"]]'></td>
                    <td><input id="email" type="text" data-validate='[["required"], ["email"]]'></td>
                    <td style="text-align: center;">
                        <select id="eyeColor" data-validate='[["required"]]'>
                            <option value=""></option>
                        </select>
                    </td>
                    <td><input id="age" type="text" data-validate='[["required"], ["integer"]]'></td>
                    <td><input id="registered" type="text" data-format='[["date", 8, "date"]]' data-validate='[["required"]]'></td>
                    <td style="text-align: center;"><input id="isActive" type="checkbox"></td>
                </tr>
            </tbody>
        </table>
    </div>

</article>

<!-- Controller -->
<script type="text/javascript">
(function() {

    var cont = N(".page6").cont({
        init : function(view, request) {
            cont.initComponents();
            cont.bindEvents(this);
        },
        initComponents : function() {},
        bindEvents : function() {}
    });

})();
</script>
```

In the above HTML structure:
- The `.search-conditions` element is a search form for entering search conditions.
- The `.buttons` element contains the CRUD buttons.
- The `.result` element contains a table for displaying the result data as a grid.

### Implementing the CRUD Page Controller

Now, let's implement the controller to initialize each component and bind events.

#### Initializing N.select

First, bind code data using the N.select component:

```javascript
initComponents : function() {
    cont.eyeColor = N([
        { key: "blue", val: "EYE_COLOR_01" },
        { key: "brown", val: "EYE_COLOR_02" },
        { key: "green", val: "EYE_COLOR_03" },
    ]).select({
        context : N("#eyeColor", cont.view)
    }).bind();

    cont.gender = N([
        { key: "female", val: "GENDER_01" },
        { key: "male", val: "GENDER_02"}
    ]).select({
        context : N("#gender", cont.view)
    }).bind();
}
```

If you want to retrieve data from the server, implement as follows:

```javascript
initComponents : function() {
   cont.eyeColor = N([]).select({
        context : N("#eyeColor", cont.view),
        key : "codeName", // Property name for option tag text
        val : "codeValue" // Property name for option tag value
    });
   cont.gender = N([]).select({
        context : N("#gender", cont.view),
        key : "codeName",
        val : "codeValue"
    });

   N.comm("data/url.json").submit(function(data) {
           cont.eyeColor.bind(data["eyeColorList"]);
      cont.gender.bind(data["genderList"]);
   })
}
```

#### Initializing N.form

Apply the N.form component to the search form area:

```javascript
initComponents : function() {
   // ... previous code ...

   cont.form = N([]).form({
        context : N(".search-conditions", cont.view)
    }).add();
}
```

Call the `.add()` method to create empty data. In this case, running `cont.form.data()` will generate the following data:

```javascript
[{
    "name" : "",
    "gender" : "",
    "rowStatus" : "insert"
}]
```

#### Initializing N.grid

Apply the N.grid component to the grid area:

```javascript
initComponents : function() {
    // ... previous code ...
    
    cont.grid = N([]).grid({
        context : N(".grid", cont.view),
        height : 300,
        resizable : true,
        sortable : true,
        checkAll : "#checkAll",
        checkAllTarget : ".checkAllTarget"
    }).bind();
}
```

### Event Binding

Now, bind events to each button:

#### Search Button Event

```javascript
bindEvents : function() {
    N("#btnSearch", cont.view).on("click", function(e) {
        e.preventDefault();
        if(cont.form.validate()) {
            N(cont.form.data(true)).comm({
                url : "data.json",
                type : "GET"
            }).submit(function(data) {
                 // Data bind by N.grid
                 cont.grid.bind(data);
             });
        }
    }).button();
}
```

#### New Button Event

```javascript
bindEvents : function() {
    // ... previous code ...
    
    N("#btnAdd", cont.view).on("click", function(e) {
        e.preventDefault();
        cont.grid.add();
    }).button();
}
```

#### Delete Button Event

```javascript
bindEvents : function() {
    // ... previous code ...
    
    N("#btnDelete", cont.view).on("click", function(e) {
        e.preventDefault();
        var checkedIndexs = cont.grid.check();
        if(checkedIndexs.length > 0) {
            N(window).alert({
                msg : "Are you sure you want to delete?<br/>It will not be saved in DBMS until you press the Save button.",
                confirm : true,
                onOk : function() {
                    cont.grid.remove(checkedIndexs);
                }
            }).show();
        } else {
            N(window).alert("No rows selected.").show();
        }
    }).button();
}
```

#### Save Button Event

```javascript
bindEvents : function() {
    // ... previous code ...
    
    N("#btnSave", cont.view).on("click", function(e) {
        e.preventDefault();

        if(cont.grid.data("modified").length === 0) {
            N.notify.add("No data has been changed.");
            return false;
        }

        if(cont.grid.validate()) {
            N(window).alert({
                msg : "Do you want to save?",
                confirm : true,
                onOk : function() {
                    N(cont.grid.data("modified")).comm({
                       type : "GET",
                        dataIsArray : true,
                        url : "data.json"
                    }).submit(function(data) {
                        N.notify.add("Save completed.");
                        N("#btnSearch", cont.view).trigger("click");
                    });
                }
            }).show();
        }
    }).button();
}
```

Key points of the save event:
1. Check for modified data: `cont.grid.data("modified").length === 0`
2. Validate input values: `cont.grid.validate()`
3. Show a confirm dialog before saving
4. Send modified data to the server: `N(cont.grid.data("modified")).comm(...)`

When you change the value of an input element or use the `cont.grid.val()` method to change data, a `rowStatus` property is created. The value of rowStatus will be one of "insert", "update", or "delete". On the server, use the rowStatus value of each row data object to distinguish between insert, update, and delete operations.

----

By following this guide, you can understand the basic features of Natural-JS and have a foundation for developing real web applications. For more examples and detailed API documentation, refer to the documentation for each component.
