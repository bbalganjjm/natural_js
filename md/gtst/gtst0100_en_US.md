Getting Started Natural-JS
===

## Config of Natural-JS and Communicator(N.comm), Controller(N.cont)

First, download the Natural-JS library files in one of the following ways.

1.  Directly download from [GitHub](https://github.com/bbalganjjm/natural_js)
2.  npm : npm install @bbalganjjm/natural_js
3.  Bower : bower install natural_js

Among the downloaded files, the necessary library files for running Natural-JS are as follows.

1.  **jquery-1.12.4.min.js** - You must import the jQuery library. because Natural-JS operates based on jQuery.
2.  **natural.ui.css** - This is style sheet file related with the Natural-UI design.
3.  **natural.js.min.js** - This is a minified file that combines the entire library files of Natural-JS.
4.  **natural.config.js** - This is Natural-JS's configuration file.

Now you can create a top-level HTML file and import the above files into the page in the following order.

    <script type="text/javascript" src="js/natural_js/lib/jquery-1.12.4.min.js"></script>
    <link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
    <script type="text/javascript" src="js/natural_js/natural.js.min.js"></script>
    <script type="text/javascript" src="js/natural_js/natural.config.js"></script>

If you want to use the entire CORE, ARCHITECTURE, DATA, UI, UI.Shell, import natural.js.min.js and if you want to use it separately for each package, you can import it separately.

The dependencies for each package are as follows.

*   When using only Natural-CORE : natural.core.js
*   When using only Natural-ARCHITECTURE : natural.core.js, natural.architecture.js
*   When using only Natural-DATA : natural.core.js, natural.data.js
*   When using only Natural-UI : natural.core.js, natural.data.js, natural.ui.js
*   When using only Natural-UI.Shell : natural.core.js, natural.ui.js, natural.ui.shell.js

Importing only natural.js.min.js does not have a significant impact on performance, as natural.js.min.js has a combined capacity of 210kb for all Natural-JS libraries.

Now that you have imported the library, let's set up the environment for running Natural-JS.

Open the natural.config.js file that is a configuration file of Natural-JS.

    /* Natural-ARCHITECTURE Config */
    N.context.attr("architecture", {
    	"page" : {
    		"context" : "#natural_contents"
    	},
    	...
    /* Natural-UI Config */
    N.context.attr("ui", {
    	"alert" : {
    		"container" : "#natural_contents"
    	...

You will see the syntax of above look like JSON format. you might known what is the JSON. that is very easy. if you don't know, refer to the following URL

[http://www.json.org](http://www.json.org)

JSON is very important on Natrual-JS. The data type that send and receive to server is a string of JSON type, and the data bound to the UI components is also an array object composed of JSON objects.

Back to the point... Natural-JS environment settings are stored in the Context(N.context) object. N.context.attr("architecture").page.context value in the above syntaxes is a very important value among the environment settings. This value is specify for jQuery-selector string of the container element that contained Natural-JS's component elements. In other words, specify the dynamically unchanging element box that contained page content. In addition, Specify the container element selector that stores the N.alert HTML element in N.context.attr("ui").alert.context value. You specify the same element usually as the N.context.attr("architecture").page.context value. Resources of components supported by Natural-UI such as Tab (N.tab), Popup (N.popup), and Datepicker (N.datepicker) are created in the area specified here(N.context.attr...context) and when the page is changed, it will return the browser's resources by overwriting it again. When developing a Single Page Web Application that does not redirect pages, you don't have to manage browser resources separately. For other environment setting values, refer to [Config Example] in [API / DEMO] > [Natural-CORE] > [Config Tab].

In N.config (natural.config.js), the global settings for most UI components are specified, and all components are based on the options set here.

Natural-JS's component option's applied priority is as follows.

1.  The specified option values when initializing the component
2.  The specified options values in N.config
3.  The default option values ​​of component

Option values ​​not specified in the configuration file (natural.config.js) among the default option values ​​of the component class is if you do not specify any options at component initialization it works as the default option value of the component class. If you want to set the default option value of a component class that is not defined in the configuration file as the site global option value you can add it to the component part of the configuration file. For example, if you want to set the default height of all grid components body areas within the site to 300 pixels you can add the following to the N.context.attr ("ui").grid property

    N.context.attr("ui", {
    	...
    	"grid" : {
    		...
    		"height" : 300,
    		...
    	}
    	...

"..." is an ellipsis, so do not put it in. :)
So now we have finished setting up the environment, so let's start development in earnest.

Natural-JS has a simple source code composition rule to separate development areas and design areas within a source code of page block and to guarantee the scope between elements and scripts. It is not so difficult. You just need to separate the view area and the Controller area as shown below and arrange them in order.

[c:/natural\_js/test\_html.html]

    <!-- View Context -->
    <div id="viewCont">
    	<div id="result">
    	</div>
    </div>
    <!-- View Context -->

    <script type="text/javascript">
    N("#viewCont").cont({
    	/* Controller Context */
    	init : function(view, request) {
        	// Start here.
        }
        /* Controller Context */
    });

    </script>

All pages or page blocks based on Natural-ARCHITECTURE must be composed of the above code form.

Save the above codes as "c:/natural\_js/test\_html.html" and save the codes below as "c:/natural\_js/index.html".
I will load the "c:/natural\_js/test\_html.html" file from the "c:/natural_js/index.html" file.

[c:/natural\_js/index.html]

    <!DOCTYPE html>
    <html>
    <head>
    <meta content="text/html; charset=utf-8" />
    <title>Natural-JS</title>
    <script type="text/javascript" src="js/natural_js/lib/jquery-1.12.4.min.js"></script>
    <link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
    <script type="text/javascript" src="js/natural_js/natural.js.min.js"></script>
    <script type="text/javascript" src="js/natural_js/natural.config.js"></script>

    <script type="text/javascript">
    $(document).ready(function() {
        ...
    });
    </script>

    </head>
    <body>
    	<div id="header">
    		<a id="logo" href="index.html">Natural-JS</a>
    	</div>
    	<div id="natural_contents">
    		<!-- This area is the page context(N.context.attr("architecture").page.context). -->
    	</div>
    </body>
    </html>

$(document).ready is a function provided by jQuery that executes the callback function specified by the argument after the DOM elements of the loaded HTML file are loaded into the browser.

Now I will load the contents of the test\_html.html file created above on the main page. Natural-JS uses the Communicator(N.comm) module to send and receive data and files with the server. For more information about Communicator, see [API / DEMO> Natural-ARCHITECTURE> Communicator Tab] screen.
Change the contents of the callback argument of the $(document).ready() function to the syntax below.

    ...
    $(document).ready(function() {
    	N(N.context.attr("architecture").page.context).comm("test_html.html").submit()
    })
    ...

Now, if you run the "index.html" file, import the contents of the HTML file via N.comm into the "#natural_contents" element and then execute the N.cont's init function immediately.

Now that page is loaded, let's try to load the data using N.comm.

The data type for sending and receiving and components data of Natural-JS is the JSON, right?

First, It need a server to serve data in json format, but in this document, I will skip the operation of the server that serves the data. There are a number of modules that simply convert List or Map type objects to JSON types using Spring MVC or PHP. Please refer to the following site for information on conversion modules for each programming language.

[http://www.json.org](http://www.json.org)

Now create and save a data file (c: /natural\_js/test\_data.json) consisting of the following JSON string.

[c:/natural\_js/test\_data.json]

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
      },
      {
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
      },
      {
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

It is normal to run the above files on the web server, but for the easily test, let's try to load the local files with the web browser.

Most web browsers are blocked from referencing local files with Ajax. But Firefox is just opened? If IE displays a security warning message, you can allow it. Chrome also has a way to disable it, so you can find it. ^^ Let's start by using Firefox.

    ...
    N("#viewCont").cont({
    	init : function(view, request) {
    		N.comm("test_data.json").submit(function(data) {
    			// data is received data from the server
    			N("#result", view).text(JSON.stringify(data));
    		});
        }
    });

Let's open the pre-written "c: /natural\_js/index.html" file in a web browser. The "c:/natural\_js/test_html.html" file will be loaded by the index page and the init function of the object specified in the argument of N.cont will be executed.
Then the above code will be executed and the contents of the file loaded into the div element with id as "result" will be displayed.
If you have a server that can query data, you can enter the URL of the service instead of "c:/natural\_js/test\_data.json".
If you want to send a parameter to the server, you should put the JSON type parameter as an argument of N() function as follows. That way, the value will be sent to the server in the HTTP Request Body.

To convert a parameter string of JSON type to an object such as Map or List on the server, you must have a [JSON conversion module](http://www.json.org).

    ...
    N("#viewCont").cont({
    	init : function(view, request) {
    		N({ "param1" : "This is parameter 1" }).comm("test_data.json").submit(function(data) {
    			// data is received data from the server
    			N("#result", view).text(JSON.stringify(data));
    		});
        }
    });

If look at the requested URL after refreshing the page on [Fiddler](https://www.telerik.com/fiddler) or select the Network tab of the developer tool provided by your browser, you can see that the text { "param1" : "This is parameter 1"} is sent to the requested URL

If an HTML element or a jQuery select string is specified as an argument of N() function in N().comm, the HTML block page loaded in the specified element is inserted and If the object of JSON type is specified, it becomes a request parameter of the requested URL.
Please refer to the [Natural-ARCHITECTURE API Documents](html/refr/refr0103.html) for details on the features provided by N.comm and N.cont.

Now that you know the basic structure, let's try to develop it with reference to the [API document](html/refr/refr0101.html).

This site is developed with Natural-JS. A reference to the source code of this site can be found in [Github's "gh-pages" branch](https://github.com/bbalganjjm/natural\_js/tree/gh-pages).