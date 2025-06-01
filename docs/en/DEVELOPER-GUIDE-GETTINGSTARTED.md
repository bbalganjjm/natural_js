# Natural-JS Getting Started Guide

This document provides a getting started guide and basic tutorial for the Natural-JS framework. It is designed so that developers new to Natural-JS can learn step by step, from basic environment setup to developing a sample application.

## Table of Contents

1. [Setting Up the Natural-JS Environment](#setting-up-the-natural-js-environment)
2. [Creating a Basic Web Application Frame](#creating-a-basic-web-application-frame)
3. [Viewing/Editing Data with Grid](#viewingediting-data-with-grid)

## Setting Up the Natural-JS Environment

### Downloading the Library

First, download the Natural-JS library files using one of the following methods:

- Download directly from GitHub
- Bower: `bower install natural_js`
- npm: `npm install @bbalganjjm@natural_js`

### Required Library Files

The following library files are required to run Natural-JS:

1. **lib/jquery-3.7.1.min.js**
   - Natural-JS depends on jQuery, so it must be imported.
2. **css/natural.ui.css**
   - Stylesheet file related to Natural-UI design.
   - All files in the css folder, such as `dark.css`, `light.css`, and `css/tokens.css`, must be included.
3. **dist/natural.js{+code}{+template}.{es5|es6}.min.js**
   - Minified file containing the entire Natural-JS library.
   - Depending on the supported ECMAScript version and package, use one of the following files:
     - dist/natural.js+code+template.es5.min.js: ES5-based file including Natural-CODE and Natural-TEMPLATE packages
     - dist/natural.js+code+template.es6.min.js: ES6-based file including Natural-CODE and Natural-TEMPLATE packages
     - dist/natural.js+code.es5.min.js: ES5-based file including Natural-CODE package
     - dist/natural.js+code.es6.min.js: ES6-based file including Natural-CODE package
     - dist/natural.js+template.es5.min.js: ES5-based file including Natural-TEMPLATE package
     - dist/natural.js+template.es6.min.js: ES6-based file including Natural-TEMPLATE package
     - dist/natural.js.es5.min.js: ES5-based Natural-JS file
     - dist/natural.js.es6.min.js: ES6-based Natural-JS file

   > You can also generate your own build including the desired packages for ES3 or higher using the `compiler/closure-compiler.jar` included in the natural_js source code.

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

- For Natural-CORE only: natural.core.js
- For Natural-ARCHITECTURE only: natural.core.js, natural.architecture.js
- For Natural-DATA only: natural.core.js, natural.data.js
- For Natural-UI only: natural.core.js, natural.data.js, natural.ui.js
- For Natural-UI.Shell only: natural.core.js, natural.ui.js, natural.ui.shell.js

> Since the size of natural.js.min.js, which includes all Natural-JS libraries, is only about 145kb, importing just natural.js.min.js does not significantly affect performance.

### Configuration

Open the configuration file for Natural-JS, `natural.config.js`, and you will see settings like the following:

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

Natural-JS configuration values are stored in the Context (N.context) object. The value `N.context.attr("architecture").page.context` is very important. This value specifies the container element where Natural-JS component elements will be loaded, using a jQuery selector string. In short, specify a static box element where page content will be displayed.

Also, specify the selector for the container element where the N.alert HTML element will be stored in `N.context.attr("ui").alert.context`. Usually, this is the same element as `N.context.attr("architecture").page.context`.

Resources for components such as Tab (N.tab), Popup (N.popup), and Datepicker (N.datepicker) supported by Natural-UI are created in the area specified here (`N.context.attr...context`), and when the page is switched, this area is overwritten to release browser resources. This is convenient when developing a Single Page Web Application, as you do not need to manage browser resources separately.

> If you are using the Documents (N.docs) component, you do not need to specify this.
> If it is not an SPA (Single Page Application), set it to "body".

### Component Option Application Priority

The priority for applying component options in Natural-JS is as follows:

1. Option values specified when initializing the component
2. Option values specified in Config (natural.config.js)
3. Default option values of the component

If a default option value of a component class is not specified in Config (natural.config.js) and no option is specified when initializing the component, the default option value of the component class is used. If you want to set a default option value for all grid component body areas to 300 pixels in height throughout the site, add the following to the N.context.attr("ui").grid section in the configuration file:

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

Natural-JS has a simple source code structure rule to separate development and design areas in page block source code and to guarantee scope between elements and scripts. Just separate and arrange the View and Controller areas in order as shown below.

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

All pages or page blocks based on Natural-ARCHITECTURE must be structured in the form above. Save the above code as `block01.html`.

The N.comm function in the init function of the ".block01" Controller object is the statement for retrieving data from the server.

Natural-JS uses the Communicator (N.comm) module to send and receive data and files with the server.

### Handling JSON Data

The data type for component data and data transmission/reception in Natural-JS is JSON. You need a server that serves data in JSON format. For information on JSON conversion modules for each programming language, see [http://www.json.org/json-ko.html](http://www.json.org/json-ko.html).

To receive data temporarily, create and save a data file (data.json) composed of JSON strings as follows:

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

### Creating an Index Page

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
    $(document).ready(function() {
        N(N.context.attr("architecture").page.context).comm("block01.html").submit()
    });
</script>

</head>
<body>
    <!-- Page Context(N.context.attr("architecture").page.context) element. -->
    <div id="contents"></div>
</body>
</html>
```

The callback argument of the $(document).ready function in `index.html` uses N.comm to load the `block01.html` page into the `#contents` (N.context.attr("architecture").page.context) element. When the loading of the `block01.html` page is complete, N.comm executes the init function of the Controller (N.cont) object.

Now you have completed all the steps to run Natural-JS. To run it, you need a web server. Install a web server, copy the above index.html, block01.html, and data.json files to the web context root, start the web server, and open the page by entering the URL of the index.html file in your browser.

## Creating a Basic Web Application Frame

This section explains how to develop a Single Page Web Application using the Documents (N.docs) component, which places the menu on the left and displays pages in MDI format on the right.

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

### Creating the Index Page

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

The callback function of $(document).ready loads `/html/index/lefter.html` to set up the left menu and creates the MDI page container with the N.docs component. Only one instance of the N.docs component is created per application, so it is stored in the window object for global use.

### Creating the Left Menu

Now, let's create the left menu block page (`/html/index/lefter.html`) that loads the menu content:

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
            // ...
        });
    }
});
</script>
```
