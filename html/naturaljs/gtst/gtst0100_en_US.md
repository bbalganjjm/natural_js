Getting Started
===

## Configuring Natural-JS Execution Environment

First, download the Natural-JS library files in one of the following ways.

1.  Directly download from [GitHub](https://github.com/bbalganjjm/natural_js)
2.  Bower : bower install natural_js
3.  npm : npm install @bbalganjjm@natural_js

Among the downloaded files, the necessary library files for running Natural-JS are as follows.

1.  **lib/jquery-3.7.1.min.js** - Since Natural-JS depends on jQuery, it must be imported.
2.  **css/natural.ui.css** - This is the stylesheet file related to the Natural-UI design.
    > The files `dark.css`, `light.css`, and `css/tokens.css` located in the css folder must all be included.
3.  **dist/natural.js{+code}{+template}.{es5|es6}.min.js** - A minified file that combines the complete library files of Natural-JS.
    > Depending on the supported ECMAScript version and package, you can select one of the following files:
    > - dist/natural.js+code+template.es5.min.js: An ES5-based Natural-CODE and Natural-TEMPLATE package included Natural-JS file
    > - dist/natural.js+code+template.es6.min.js: An ES6-based Natural-CODE and Natural-TEMPLATE package included Natural-JS file
    > - dist/natural.js+code.es5.min.js: An ES5-based Natural-CODE package included Natural-JS file
    > - dist/natural.js+code.es6.min.js: An ES6-based Natural-CODE package included Natural-JS file
    > - dist/natural.js+template.es5.min.js: An ES5-based Natural-TEMPLATE package included Natural-JS file
    > - dist/natural.js+template.es6.min.js: An ES6-based Natural-TEMPLATE package included Natural-JS file
    > - dist/natural.js.es5.min.js: An ES5-based Natural-JS file
    > - dist/natural.js.es6.min.js: An ES6-based Natural-JS file
    > > You can also generate a desired package containing ES3 or higher using the `compiler/closure-compiler.jar` included in the natural_js source code.
4.  **dist/natural.config.js** - The configuration file for Natural-JS.

Natural-JS provides type declaration files to support TypeScript.

You can develop with Typescript by adding the path to the Natural-JS type declaration file in the `tsconfig.json` file as shown below.
```
{
  "compilerOptions": {
    ...
    "types": ["js/natural_js/@types"]
  }
}
```

Now, create the top-level HTML file and import the above files into the page in the following order.

```
<script type="text/javascript" src="js/natural_js/lib/jquery-3.7.1.min.js"></script>
<link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
<script type="module" charset="utf-8" src="js/natural_js/dist/natural.js+code+template.es6.min.js"></script>
<script type="module" charset="utf-8" src="js/natural_js/dist/natural.config.js"></script>
```

If you want to use the entire CORE, ARCHITECTURE, DATA, UI, UI.Shell, import natural.js.min.js and if you want to use it separately for each package, you can import it separately.

The dependencies for each package are as follows.

*   When using only Natural-CORE : natural.core.js
*   When using only Natural-ARCHITECTURE : natural.core.js, natural.architecture.js
*   When using only Natural-DATA : natural.core.js, natural.data.js
*   When using only Natural-UI : natural.core.js, natural.data.js, natural.ui.js
*   When using only Natural-UI.Shell : natural.core.js, natural.ui.js, natural.ui.shell.js

Importing only natural.js.min.js does not have a significant impact on performance, as natural.js.min.js has a combined capacity of 214kb for all Natural-JS libraries.

Now that you have imported the library, let's set up the environment for running Natural-JS.

Open the natural.config.js file that is a configuration file of Natural-JS.

```
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

Natural-JS environment settings are stored in the Context(N.context) object. N.context.attr("architecture").page.context value in the above syntaxes is a very important value among the environment settings. This value is specify for jQuery-selector string of the container element that contained Natural-JS's component elements. In other words, specify the dynamically unchanging element box that contained page content. In addition, Specify the container element selector that stores the N.alert HTML element in N.context.attr("ui").alert.context value. You specify the same element usually as the N.context.attr("architecture").page.context value. Resources of components supported by Natural-UI such as Tab (N.tab), Popup (N.popup), and Datepicker (N.datepicker) are created in the area specified here(N.context.attr...context) and when the page is changed, it will return the browser's resources by overwriting it again. When developing a Single Page Web Application that does not redirect pages, you don't have to manage browser resources separately. For other environment setting values, refer to [Config Example] in [API/DEMO] > [Natural-CORE] > [[Config](?page=html/naturaljs/refr/refr0102.html)] menu.

<p class="alert">If you are using the <a href="?page=html/naturaljs/refr/refr0502.html">Documents</a>(N.docs) component, you do not need to specify it.</p>
<p class="alert">If it is not a SPA(Single Page Application), set it to "body".</p>

In <a href="?page=html/naturaljs/refr/refr0102.html">Config(natural.config.js)</a>, the global settings for most UI components are specified, and all components are based on the options set here.

Natural-JS's component option's applied priority is as follows.

1.  The specified option values when initializing the component
2.  The specified options values in <a href="?page=html/naturaljs/refr/refr0102.html">Config(natural.config.js)</a>
3.  The default option values of component

Option values not specified in the <a href="?page=html/naturaljs/refr/refr0102.html">Config(natural.config.js)</a> among the default option values of the component class is if you do not specify any options at component initialization it works as the default option value of the component class. If you want to set the default option value of a component class that is not defined in the configuration file as the site global option value you can add it to the component part of the configuration file. For example, if you want to set the default height of all grid components body areas within the site to 300 pixels you can add the following to the N.context.attr ("ui").grid property

```
N.context.attr("ui", {
    ...
    "grid" : {
        ...
        "height" : 300,
        ...
    }
    ...
```

You have finished configuring your execution environment. Now let's write some sample code.

##Controller(N.cont) and Communicator(N.comm)

Natural-JS has a simple source code composition rule to separate development areas and design areas within a source code of page block and to guarantee the scope between elements and scripts. It is not so difficult. You just need to separate the view area and the Controller area as shown below and arrange them in order.

<p class="alert">For more information about View and Controller, please refer to the <a href="?page=html/naturaljs/refr/refr0201.html">Controller</a> menu.</p>

**block01.html**

```
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

All pages or page blocks based on Natural-ARCHITECTURE must be composed of the above code form.

Please save the above code as **block01.html** file.

The N.comm function in the init function of the ".block01" Controller object is a statement that retrieves data from the server.

<p class="alert">Natural-JS uses the Communicator(N.comm) module to send and receive data and files with the server. For more information about N.comm, please refer to the <a href="?page=html/naturaljs/refr/refr0203.html">Communicator</a> menu.</p>

I mentioned earlier that the data type for sending and receiving component data and data of Natural-JS is JSON.

First, we need a server that serves data in the json type, but we will omit the description of the server operation in this document. There are many modules that convert List or Map type object to JSON type simply with Spring MVC or PHP. For information on JSON conversion modules by programming language, please visit the site below.

[http://www.json.org/json-ko.html](http://www.json.org/json-ko.html)

To receive data temporarily, create and save a data file (data.json) composed of JSON strings as follows.

**data.json**

```
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
  }, {
    "key": "53e21cba47868d69889d7910",
    "index": 1,
    "guid": "9b855e26-2903-4b9a-b04a-e96544db2543",
    "isActive": "N",
    "balance": "$1,461.27",
    "picture": "http://placehold.it/32x32",
    "age": 31,
    "eyeColor": "green",
    "name": "Howard Kramer",
    "gender": "male",
    "company": "ASSISTIX",
    "email": "howardkramer@assistix.com",
    "phone": "+1 (806) 435-3679",
    "address": "173 Harwood Place, Yonah, Guam, 8467",
    "about": "Nisi velit eu non in dolor in. Qui aliquip sunt sit ut reprehenderit exercitation deserunt do.",
    "registered": "2014-03-24T22:55:08 -09:00",
    "latitude": -80.020226,
    "longitude": -153.640872,
    "greeting": "Hello, Howard Kramer! You have 9 unread messages.",
    "favoriteFruit": "apple"
  }, {
    "key": "53e21cba7a3cbdd773b7449d",
    "index": 2,
    "guid": "95b45a67-64ae-4bd6-a61f-c9226cfdf5af",
    "isActive": "Y",
    "balance": "$2,923.03",
    "picture": "http://placehold.it/32x32",
    "age": 26,
    "eyeColor": "green",
    "name": "Grace Hardy",
    "gender": "female",
    "company": "PROSELY",
    "email": "gracehardy@prosely.com",
    "phone": "+1 (872) 553-3815",
    "address": "526 Havemeyer Street, Holtville, Puerto Rico, 6513",
    "about": "Cillum incididunt reprehenderit elit laborum et sunt veniam. Velit pariatur id velit id occaecat.",
    "registered": "2014-03-13T16:54:10 -09:00",
    "latitude": 17.758973,
    "longitude": -112.334365,
    "greeting": "Hello, Grace Hardy! You have 8 unread messages.",
    "favoriteFruit": "strawberry"
  }
]
```

Now one block page is complete. This page can be imported as a Tab(N.tab), Popup(N.popup), or <a href="?page=html/naturaljs/refr/refr0502.html">Documents</a>(N.docs) component, and Communicator(N.comm) can be used to add elements of this page to the desired location.

Let's create a simple index page and add the ** block 01.html ** page to the desired position using N.comm.

Save the following code as **index.html** file.

**index.html**

```
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
    <!-- Page Context(N.context.attr("architecture").page.context) elelemt. -->
    <div id="contents"></div>
</body>
</html>
```

When the callback function of $(document).ready function is executed, use the N.comm, import  the **block01.html** page to **# contents**(N.context.attr("architecture").page.context) element. N.comm executes the init function of Controller(N.cont) object after DOM loading of the loaded page is completed.

<p class="alert">$(document).ready is a function provided by jQuery that executes the callback function specified as an argument after loading the page elements.</p>

Now you have done everything to run Natural-JS.

A web server is required to run the codes written so far.

First, install the web server and copy the above index.html, block01.html, data.json files to the web context root. Next, start the web server and open the page by entering the address (URL) of the **index.html** file in a browser.

The **block01.html** file is loaded by the index.html page, and the init function of the object specified as the argument of N.cont will be executed. Next, the data retrieved from the server will be displayed in the div element with the element id is "result" on the **block01.html** page.

<p class="alert">If you have a server that can retrieve data, enter the URL of the service in place of <strong>data.json</strong> in the url option of N.comm.</p>

Now that we know how to configure and run the default environment for Natural-JS, let's create a site environment where the block page will run?

Click the [Create a web application base frame](?page=html/naturaljs/gtst/gtst0200.html) menu.

<p class="alert">This site was developed with Natural-JS. Please refer to the source code of this site as it is published in <a href="https://github.com/bbalganjjm/natural_js/tree/gh-pages">gh-pages branch of github</a>.