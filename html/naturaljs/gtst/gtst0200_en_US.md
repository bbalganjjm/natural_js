Create a web application base frame
===

Let's develop a Single Page Web Application by using the <a href="#cmVmcjA1MDIlMjREb2N1bWVudHMkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDUwMi5odG1s">Documents</a>(N.docs) component that places the menu on the left and displays the page in MDI form on the right.

<p class="alert">For more information about Documents(N.docs), please refer to the <a href="#cmVmcjA1MDIlMjREb2N1bWVudHMkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDUwMi5odG1s">Documents</a> menu.</p>

First, create the following folders to structure the development project.

 * /js/natural_js - Natural-JS Javascript library files folder
 * /js/natural_js/lib - jQuery library files folder
 * /js/natural_js/css - Default CSS file folder of Natural-JS UI components
 * /html/contents - Menu content file folder
 * /html/index - Files folder associated with the main index

When the folder creation is completed, download the following files from the master branch of [GitHub](https://github.com/bbalganjjm/natural_js) and copy them to the corresponding location.

 * js/natural_js/lib/jquery-1.12.4.min.js - In the "lib" folder of the compressed file downloaded from the master branch on GitHub
 * js/natural_js/css/natural.ui.css - In the "css" folder of the compressed file downloaded from the master branch on GitHub
 * js/natural_js/natural.js.min.js - In the "dist" folder of the compressed file downloaded from the master branch on GitHub
 * js/natural_js/natural.config.js - In the "dist" folder of the compressed file downloaded from the master branch on GitHub

The final project folder and files are structured as follows. I plan to explain the files by filling them one by one, so just create a folder.

![Development project structure](images/gtst/gtst0200/0.png)

When the development project configuration is completed, save the following code as **/index.html** file.

**/index.html**

```
<!DOCTYPE html>
<html>
<head>
<meta content="text/html; charset=utf-8" />
<title>Natural-JS</title>
<script type="text/javascript" src="js/natural_js/lib/jquery-1.12.4.min.js"></script>
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
    border-right: 1px solid #66BB6A;
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
    <!-- N.docs context elelemt. -->
    <div id="docs"></div>
</body>
</html>
```

**/index.html** is the main index page accessed by this application. Because it is SPA(Single Page Application), the browser URL will not change while using the web application.

**/index.html** At the top of the head tag area, statements for loading JavaScript and CSS files are placed. These files are  loaded only once while using the application, and will be share the features with pages that are loaded later.

See the callback function in the $(document).ready function.

```
    // Global N.docs instance.
    window.docs;

    $(document).ready(function() {
        // Import left menu page.
        N("#lefter").comm("html/index/lefter.html").submit(function() {
            // Create new N.docs instance;
            docs = N("#docs").docs();
        });

    });
```

This is the syntax to load the left block page into the #lefter element with N.comm after the DOM of **/index.html** is loaded. **/html/index/lefter.html** file contains the link element of the left menu and the Controller (N.cont) Object that activates it. N("#lefter").comm("html/index/lefter.html").submit function is a callback function that is executed after the **/html/index/lefter.html** file loading is completed. Here, the N.docs component creates an MDI page container inside the #docs element. Only one instance of N.docs component is created per application, so we will use it globally in the window object.
<p class="alert">The N.docs instance can be stored in any globally-defined object defined by the application, even if it is not necessarily a window object.</p>

Now let's create a left menu block page (/html/index/lefter.html) that loads menu content with the functionality provided by this N.docs instance.

Save the following code as **/html/index/lefter.html** file.

```
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

The style code block in the code above is for defining the style that is applied only to the view of this page.
<p class="alert">If you want the style to be applied on this page only, you must start with the view element selector when defining a CSS selector like  **.index-lefter** in <code>.index-lefter .menu a { ... }</code>.</p>
<p class="alert">The style is also removed when you close this page.</p>

In the init function of the N.cont object, the code to load the menu contents is written use add method of the N.docs instance stored in the window object in **/index.html** when the menu link element is clicked. If ```add("page id", "page name", { url : "pageURL" }``` function is executed with N.docs instance, the page is added to the right MDI area.
Since ```N(".menu", view).on("click", "a", function(e) { ... }, N(this).data("docid"), N(this).text(), N(this).attr("href")``` is a function provided by jQuery, please refer to [jQuery API Manual](https://api.jquery.com).

The basic operation is now complete. If you create only the content files to be linked to the menu, everything is done.

Please create the following menu content files.

 * **/html/contents/page1.html**
 * **/html/contents/page2.html**
 * **/html/contents/page3.html**
 * **/html/contents/page4.html**
 * **/html/contents/page5.html**

The above files are pages composed of very simple contents consisting only of the View and Controller structures.

**/html/contents/page1.html**
```
<style type="text/css">
    .page1 .text {
        font-size: 15em;
        text-align: center;
    }
</style>

<article class="page1">
    <p class="text">page1</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {

    }
});
</script>
```

**/html/contents/page2.html**
```
<style type="text/css">
    .page2 .text {
        font-size: 15em;
        text-align: center;
    }
</style>

<article class="page2">
    <p class="text">page2</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {

    }
});
</script>
```

**/html/contents/page3.html**
```
<style type="text/css">
    .page3 .text {
        font-size: 15em;
        text-align: center;
    }
</style>

<article class="page3">
    <p class="text">page3</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {

    }
});
</script>
```

**/html/contents/page4.html**
```
<style type="text/css">
    .page4 .text {
        font-size: 15em;
        text-align: center;
    }
</style>

<article class="page4">
    <p class="text">page4</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {

    }
});
</script>
```

**/html/contents/page1.html**
```
<style type="text/css">
    .page5 .text {
        font-size: 15em;
        text-align: center;
    }
</style>

<article class="page5">
    <p class="text">page5</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {

    }
});
</script>
```

After deploying the source files created so far to the web server and accessing **/index.html**, if the following screen is displayed, it is a success.

![Completion screen](images/gtst/gtst0200/1.png)

Full source code can be downloaded from [here](html/naturaljs/gtst/codes/natural_js_gtst0200.zip).

In the next step([Retrieving / Modifying Data with Grid](#Z3RzdDAzMDAlMjRSZXRyaWV2aW5nJTJGTW9kaWZ5aW5nJTIwRGF0YSUyMHdpdGglMjBHcmlkJGh0bWwlMkZuYXR1cmFsanMlMkZndHN0JTJGZ3RzdDAzMDAuaHRtbA==)), we will fill this content area with the components provided by the Natural-UI package.