Retrieving / Modifying Data with Grid
===

In order to process creation / retrieval / modification / deletion with Grid, we will develop a program consisting of the search condition area and the search result Grid.

Code data will use [Select](#cmVmcjA0MDYlMjRTZWxlY3QkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwNi5odG1s)(N.select) component to bind data, [Form](#cmVmcjA0MDclMjRGb3JtJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDcuaHRtbA==)(N.form) component will create search condition area as form, and [Grid](#cmVmcjA0MDklMjRHcmlkJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDkuaHRtbA==)(N.grid) component will create a grid that can be input / viewed / modified / deleted. Buttons use the [Button](#cmVmcjA0MDIlMjRCdXR0b24kaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwMi5odG1s)(N.button) component.

Let's practice by adding a menu to the basic frame created in [Create a web application base frame](#Z3RzdDAyMDAlMjRDcmVhdGUlMjBhJTIwd2ViJTIwYXBwbGljYXRpb24lMjBiYXNlJTIwZnJhbWUkaHRtbCUyRm5hdHVyYWxqcyUyRmd0c3QlMkZndHN0MDIwMC5odG1s).

First, open the  **/html/index/lefter.html** file, add the li element to the end of the ul tag as follows, and add a menu link(page6.html) to work from now on.

```
...
<ul class="menu">
    <li><a href="html/contents/page1.html" data-docid="page1">MENU-1</a></li>
    <li><a href="html/contents/page2.html" data-docid="page2">MENU-2</a></li>
    <li><a href="html/contents/page3.html" data-docid="page3">MENU-3</a></li>
    <li><a href="html/contents/page4.html" data-docid="page4">MENU-4</a></li>
    <li><a href="html/contents/page5.html" data-docid="page5">MENU-5</a></li>

    <li><a href="html/contents/page6.html" data-docid="page6">Grid CRUD</a></li>

</ul>
...
```

When the menu addition is complete, download the [data.json](html/naturaljs/gtst/data/data.json) file and save it in the context root of your project for the execute data searching and saving.
<p class="alert">If the data.json file is not downloaded when you click the link, right-click on the data.json link, then click [Save Link As].</p>
<p class="alert">This tutorial is an example running on the Web Server, and the inquiry parameter or saved / modified / deleted data is not saved. Please check only the parameters transmitted to the server in the network tab of the developer tool. For an example that works with a server(DBMS), please refer to the document <a href="#Z3RzdDIwMDAlMjRHZXR0aW5nJTIwU3RhcnRlZCUyMHdpdGglMjBTYW1wbGUlMjBwcm9qZWN0JGh0bWwlMkZuYXR1cmFsanMlMkZndHN0JTJGZ3RzdDIwMDAuaHRtbA==">Getting Started with Sample project</a>.</p>


##Coding the view area

Create the **/html/contents/page6.html** file and write the code as follows.

```
<!-- Style -->
<style type="text/css">
    .page6 {
        padding: 15px;
    }

    .page6 .search-conditions {
        border: 1px solid #000;
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
        border: 1px solid #000;
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
        <a id="btnAdd" href="#" data-opts='{ "color": "green" }'>New</a>
        <a id="btnDelete" href="#" data-opts='{ "color": "green" }'>Delete</a>
        <a id="btnSave" href="#" data-opts='{ "color" : "gray" }'>Save</a>
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

The code is long? It becomes simple by separating Style, View area and Controller area. Let's focus on just 30 seconds. Isn't the code at a glance like Matrix Neo? -.-;

If the above style area is integrated into a common css file, the style area is unnecessary. However, to make it simple to see that the style of the context element defined in the Natural-JS component is applied as it is, the Style is defined on the page.
<p class="alert">If you collaborating with web publishers when working on a project with Natural-JS can simultaneously improve UI quality and development productivity. Web publishers do not need to learn Natural-JS, they just publish according to web standards.</p>

The part to focus on in the code above is the view area. Controller deliberately made a frame and left it empty. I'm going to fill in one by one.

The **.search-conditions** element at the first of the sub-elements on View is a search form where you can enter search conditions. Below, buttons are placed in the **.buttons** element, and in the **.result** element, a table, the context element of N.grid, is created to express the searched result data in a grid. To apply N.grid component, **table** tag to be created as grid must be written, and **thead** (grid header) and **tbody** tag must be written in table tag. The rows of N.grid represent the **tbody** element by duplicating as much as the length of the list data.
For more information about each component, please refer to the related document.

##Controller area coding

Looking at the Controller area, unlike the previous examples, the code that contains the Controller Object instance in the cont variable and the code that wraps it in a function and executes it are written.

```
(function() {

    var cont = N(".page6").cont({
        ...
    });

})();
```

The reason is to access the Contoller(N.cont) Object regardless of the function scope.
Define Controller as above, declare cont variable and execute N().cont() function, you can access Controller Object with cont variable at any position of function.
<p class="alert">When working on a project with Natural-JS, there are many times when you need to access the Controller Object to refer to the constant objects contained in the Controller object such as view, request, and caller, or to save or reference the page global variables.</p>
<p class="alert">When developing page contents with SPA, think that the Controller Object is the top-level object of the page and define global variables for each page. If you don't do so, declaring a global variable in the window object can cause data is twisted or a large increase in memory usage. Natural-JS manages the resource for the Controller Object, but does not participate in global variables bound to the window object.</p>

###Component initialization
Now, let's breathe the life by applying the following components to each element declared in View.

 * .search-conditions : **N.form**
 * .search-conditions #gender : **N.select**

 * .buttons #btnAdd : **N.button**
 * .buttons #btnDelete : **N.button**
 * .buttons #btnSave : **N.button**
 * .buttons #btnSearch : **N.button**

 * .result .grid : **N.grid**
 * .result .grid #eyeColor : **N.select**

#### N.select initialization

Let's bind the code data to the  **.search-conditions #gender** element and the **.result .grid #eyeColor** element with the **N.select** component.

Write the following code in the initComponents function.

```
...
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
},
...
```

<p class="alert">All functions and methods of Natural-JS support method chaining that can execute commands one after another, such as N([]).select.bind().</a>

Data-related components such as N.select are separated from component initialization and data binding. ```var grid = N([object, object, ...]).grid()``` The "a" command returns the component instance, the bind() method on the component instance binds the data, and the add() method calls creates new row data.

If you input JSON Array type data to the first argument of the N() function and then call the bind() method, the input data is bound when the instance is created. If you need to bind data dynamically, you can initialize the component by entering an empty array like ```var grid = N([]).grid()``` in the N() function and you can call the method by entering json array type data in the first argument of the bind() method.

If the data to be bound to N.select is retrieved from the server, change it similar to the following code.

```
...
initComponents : function() {
   cont.eyeColor = N([]).select({
        context : N("#eyeColor", cont.view),
        key : "codeName", // Property name to be displayed as text of option tag
        val : "codeValue" // The property name to be displayed as the value attribute of the option tag
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
},
...
```

#### N.form initialization

Add the following code to the initComponents function to apply the N.form component to the search form area(.search-conditions).

```
...
initComponents : function() {
   ...

   cont.form = N([]).form({
        context : N(".search-conditions", cont.view)
    }).add();
},
...
```

I created an empty data by applying an N.form component to the **.search-conditions** element and calling the add() method. Since the add() method was called, the following data would have been created in the cont.form instance. You can check this by running the ```cont.form.data()``` method.

```
[{
    "name" : "",
    "gender" : "",
    "rowStatus" : "insert"
}]
```

This generated data is synchronized with the internal dataset whenever the value of the input element changes, so if you declare it as follows, the last input search condition data is sent to the server as a parameter.

```
N(cont.form.data()).comm("data.json").submit(function(data) {
    N.log(data);
});
```

#### N.grid initialization

To apply the N.grid component to the table element in the grid area(.grid), add the following code to the initComponents function.

```
...
initComponents : function() {
    ...
    cont.grid = N([]).grid({
        context : N(".grid", cont.view),
        height : 300,
        resizable : true,
        sortable : true,
        checkAll : "#checkAll",
        checkAllTarget : ".checkAllTarget"
    }).bind();
},
...
```

Only the options are different from the N.form described earlier, but the declaration method is similar.

If N.grid binds an empty array object, the message "No inquired data or no data available." is displayed on the grid. If it is necessary to immediately bind the data retrieved from the server to the grid after the page loading is completed, simply create a component instance, but If the user needs to execute the query directly, the default row is displayed without any meaning, so call the bind() method to create a natural grid shape.

### Event binding

Event binding uses the functionality provided by jQuery.

#### [Search] button event

```
bindEvents : function() {
    N("#btnSearch", cont.view).click(function(e) {
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

<p class="alert">In the above code, among the options of N.comm, the "type" is an option that is arbitrarily defined because it cannot be requested through the POST method to the web server. If the server can handle POST requests, remove the type option because the default value of type is defined as "POST" in natural.config.js. For more information about the type option, refer to the [Default Options] tab in the <a href="#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwMjA0Lmh0bWw=">Communicator.request</a> document.</p>

The event handler of the Search button executes the following logic.
 1. Retrieve data from the server using the data of the search form(cont.form) as a parameter.
 2. Bind the retrieved data to the grid (cont.grid).

The ```cont.form.validate()``` is a method that validates input data by checking the data-validate option(refer to the [Declarative Options] tab in the [Form](#cmVmcjA0MDclMjRGb3JtJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDcuaHRtbA==) document) declared in the tag of the input element of the search form at once. The validate () method returns true only after all validations are passed, so if you declare it as an "if" condition as in the code above, you can conveniently handle annoying works such as "check required input".
and, at the end of the statement, the .button() method was executed to apply the Button(N.button) component to the event target element.

#### [New] Button event

```
bindEvents : function() {
    ...
    N("#btnAdd", cont.view).click(function(e) {
        e.preventDefault();
        cont.grid.add();
    }).button();
}
```

If the add() method is called on an instance of the N.grid component, a row is added to the grid.

#### [Delete] button event

```
bindEvents : function() {
    ...
    N("#btnDelete", cont.view).click(function(e) {
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
When the cont.grid.check() method is called, the checkbox of the first column of the grid returns the checked row index, and passing the returned index as an argument of the cont.grid.remove() method, the selected row is deleted from the grid.

#### [Save] button event

```
bindEvents : function() {
    ...
    N("#btnSave", cont.view).click(function(e) {
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
                        N("#btnSearch", cont.view).click();
                    });
                }
            }).show();
        }
    }).button();
}
```

The execution logic of the save event is as follows.

1. Check the changed data : ```if(cont.grid.data("modified").length === 0) {```

2. Validation of added and modified input values :  ```if(cont.grid.validate()) {```

3. Display Confirm dialog asking if you want to save :
```
...
N(window).alert({
    msg : "Do you want to save?",
    confirm : true,
...
```

4. Using N.comm send the changed data(```cont.grid.data("modified")```) of the grid to the server parameter.
<p class="alert">In the above code, among the options of N.comm, the "type" is an option that is arbitrarily defined because it cannot be requested through the POST method to the web server. If the server can handle POST requests, remove the type option because the default value of type is defined as "POST" in natural.config.js. For more information about the type option, refer to the [Default Options] tab in the <a href="#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwMjA0Lmh0bWw=">Communicator.request</a> document.</p>
<p class="alert">To send parameters of type array[object], not object, to server, you must enable dataIsArray option. For more information about the dataIsArray option, refer to the [Default Options] tab in the <a href="#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwMjA0Lmh0bWw=">Communicator.request</a> document.</p>
5. After saving, display the message using the N.notify component.
<p class="alert"><strong>rowStatus</strong> property is created when the value of input element is changed or data is changed by cont.grid.val () method. The rowStatus value can be one of "insert", "update", or "delete". <strong>insert / update / delete on the server can be handled with the rowStatus value</strong> defined in each row data object.
6. Click the Search button to retrieve the changed data again.

After deploying the source files created so far to the web server and accessing **/index.html**, if the following screen is displayed, it is a success.

![Completion screen](images/gtst/gtst0300/0.png)

Full source code can be downloaded from [here](html/naturaljs/gtst/codes/natural_js_gtst0300.zip).

If you want to continue learning, please analyze the source codes of various examples in the example menu.