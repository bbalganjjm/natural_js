<!-- filepath: d:\workspace\natural_js\docs\DEVELOPER-GUIDE-EXAMPLES.md -->
# Natural-JS Example Guide

This document provides a collection of practical examples for developing with Natural-JS. It explains common patterns and implementation methods frequently used in real-world application development.

## Table of Contents

1. [Retrieving a Data List](#retrieving-a-data-list)
2. [Retrieving Form Data](#retrieving-form-data)
3. [Entering Form Data](#entering-form-data)
4. [Editing Form Data](#editing-form-data)
5. [Data Grid CRUD (Fixed Header)](#data-grid-crud-fixed-header)
6. [Data Grid CRUD (List Type)](#data-grid-crud-list-type)
7. [Screen Transition CRUD (Paging)](#screen-transition-crud-paging)
8. [Popup CRUD](#popup-crud)
9. [Master Grid & Detail Form](#master-grid--detail-form)
10. [Multi-Form Binding](#multi-form-binding)

## Retrieving a Data List

An example combining a search box (N.form) and a data grid (N.grid) to retrieve a data list.

### Implementation Overview

- Initialize and bind code data
- Initialize N.button component
- Initialize N.form component and create search condition data
- Initialize N.grid component and bind empty data
- Handle search button event

### HTML Structure

```html
<div class="searchBox">
    <ul>
        <li class="inputs">
            <label>Name<input id="name" type="text" data-validate="[[\"alphabet+integer\"]]"></label>
            <label>Gender<input id="gender" type="radio"></label>
            <label>Eye Color<select id="eyeColor"><option></option></select></label>
        </li>
        <li class="buttons">
            <a id="btnSearch" href="#">
                <span lang="ko_KR">Search</span>
            </a>
        </li>
    </ul>
</div>

<table id="grid" class="grid__" style="width: 100%;">
    <colgroup>
        <col style="width: 9%;">
        <col style="width: 17%;">
        <col style="width: auto;">
        <col style="width: 11%;">
        <col style="width: 13%;">
        <col style="width: 7%;">
        <col style="width: 13%;">
        <col style="width: 12%;">
    </colgroup>
    <thead>
        <tr>
            <th>Index</th>
            <th>Name</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Eye Color</th>
            <th>Age</th>
            <th>Company</th>
            <th>Active</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td id="index" style="text-align: center;"></td>
            <td id="name"></td>
            <td id="email"></td>
            <td id="gender" style="text-align: center;"></td>
            <td id="eyeColor" style="text-align: center;"></td>
            <td id="age"></td>
            <td id="company"></td>
            <td style="text-align: center;"><span id="isActive"></span></td>
        </tr>
    </tbody>
</table>
```

### JavaScript Implementation

```typescript
const cont = N(".exap0100").cont({
    init: function (view, request) {
        cont.setCodes(["gender", "eyeColor"], function () {
            // N.select must be initialized before data components like N.grid or N.form
            cont.setComponents();
            cont.setEvents();
        });
    },
    setCodes: function (codeParams: string[], afterCodeInitFn: Function) {
        // 1. Initialize N.select and bind code data
        N({codes: codeParams}).comm("html/naturaljs/exap/data/code.json").submit(function (data, request) {
            N(codeParams).each(function (i, code) {
                N(data as NC.JSONObject[]).datafilter("code === '" + code + "'").select(N(".searchBox #" + code, cont.view)).bind();
            });
            afterCodeInitFn.call(cont);
        });
    },
    setComponents: function () {
        // 2. Initialize N.button
        N(".buttons a", cont.view).button();
        // 3. Initialize N.form and add new row data
        cont.form = N([]).form({
            context: N("div.searchBox li.inputs", cont.view),
            revert: true
        }).add();
        // 4. Initialize N.grid and bind empty data
        cont.grid = N([]).grid({
            context: N("#grid", cont.view),
            data: [],
            height: 350,
            resizable: true,
            sortable: true,
            filter: true
        }).bind();
    },
    setEvents: function () {
        // 5. Bind events
        N("#btnSearch", cont.view).on("click", function (e) {
            e.preventDefault();
            if (cont.form.validate()) {
                N(cont.form.data(true)).comm("html/naturaljs/exap/data/sample.json").submit(function (data, request) {
                    cont.grid.bind(data);
                });
            }
        });
    },
    messages: {
        "ko_KR": {},
        "en_US": {}
    }
});
```

### Key Features

- Implements a search condition input form
- Binds code data (gender, eye color)
- Handles search button events
- Displays data grid with filtering and sorting features

## Retrieving Form Data

An example of retrieving form data using N.form.

### Implementation Overview

- Initialize N.button component
- Initialize N.form component
- Bind form data

### HTML Structure

```html
<table id="detail" class="form__" style="width: 100%;">
    <tr>
        <th rowspan="11" style="width: 15%;">picture</th>
        <td rowspan="11" style="width: 35%; text-align: center; vertical-align: middle;"><img id="picture" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" style="height: 100px;"></td>
        <th style="width: 15%;">Name</th>
        <td id="name" style="width: 35%;"></td>
    </tr>
    <tr>
        <th>Email</th>
        <td id="email"></td>
    </tr>
    <tr>
        <th>Password</th>
        <td id="key" data-format="[[\"generic\", \"@@＊＊＊＊＊＊\"]]"></td>
    </tr>
    <!-- Additional fields... -->
</table>
```

### JavaScript Implementation

```typescript
const cont = N(".exap0200").cont({
    init : function(view, request) {
        cont._key = "101";
        cont.setComponents();
    },
    setComponents : function() {
        // 1. Initialize button
        N(".buttons a", cont.view).button();
        // 2. Initialize N.form
        cont.form = N([]).form(N("#detail", cont.view));
        // 2-1. Bind form data
        N.comm("html/naturaljs/exap/data/" + cont._key + ".json").submit(function(data) {
            // Bind data with N.form
            cont.form.bind(0, data);
        });
    },
    messages : {
        "ko_KR" : {},
        "en_US" : {}
    }
});
```

### Key Features

- Retrieve and display single data record
- Data formatting (password, date, currency, etc.)
- Read-only form implementation

## Entering Form Data

An example of creating new data using N.form.

### Implementation Overview

- Initialize and bind code data
- Initialize N.button component
- Initialize N.form component and create new data
- Handle save and revert button events

### HTML Structure

```html
<div class="searchBox">
    <ul>
        <li class="buttons">
            <a id="btnSave" href="#">
                <span lang="ko_KR">Save</span>
            </a>
            <a id="btnRevert" href="#">
                <span lang="ko_KR">Revert</span>
            </a>
        </li>
    </ul>
</div>

<table id="detail" class="form__" style="width: 100%;">
    <tr>
        <th rowspan="11" style="width: 15%;">picture</th>
        <td rowspan="11" style="width: 35%; text-align: center; vertical-align: middle;"><img id="picture" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" style="height: 100px;"></td>
        <th style="width: 15%;"><label for="name">Name</label></th>
        <td style="width: 35%;"><input id="name" type="text" data-validate="[[\"required\"]]"></td>
    </tr>
    <!-- Additional fields... -->
</table>
```

### JavaScript Implementation

```typescript
const cont = N(".exap0300").cont({
    init : function(view, request) {
        cont.setCodes([ "gender", "eyeColor", "company", "favoriteFruit" ], function() {
            // N.select must be initialized before data components like N.grid or N.form
            cont.setComponents();
            cont.setEvents();
        });
    },
    setCodes : function(codeParams: string[], afterCodeInitFn: Function) {
        // 1. Initialize N.select and bind code data
        N({ codes : codeParams }).comm("html/naturaljs/exap/data/code.json").submit(function(data, request) {
            N(codeParams).each(function(i, code) {
                N(data as NC.JSONObject[]).datafilter("code === '" + code + "'").select(N("#detail #" + code, cont.view)).bind();
            });
            afterCodeInitFn.call(cont);
        });
    },
    setComponents : function() {
        // 2. Initialize N.button
        N(".buttons a", cont.view).button();
        // 3. Initialize N.form and create new data
        cont.form = N([]).form({
            context : N("#detail", cont.view),
            revert : true
        }).add();
    },
    setEvents : function() {
        // 4. Bind events
        // 4-1 Save data to server
        N("#btnSave", cont.view).on("click", function(e) {
            e.preventDefault();
            if(cont.form.validate()) {
                N(window).alert({
                    msg : N.message.get(cont.messages, "EXAP0300-0003"),
                    confirm : true,
                    onOk : function(): undefined {
                        N(cont.form.data(true)).comm({
                            type : NA.Objects.Request.HttpMethod.POST,
                            url : "html/naturaljs/exap/data/sample.json"
                        }).submit(function(data) {
                            let msg;
                            if(data as number > 0) {
                                msg = N.message.get(cont.messages, "EXAP0300-0001");
                            } else {
                                msg = N.message.get(cont.messages, "EXAP0300-0002");
                            }
                            N(window).alert(msg).show();
                        });
                    }
                }).show();
            }
        });
        // 4-2 Reset to initial data
        N("#btnRevert", cont.view).on("click", function(e) {
            e.preventDefault();
            cont.form.revert();
        });
    },
    messages : {
        "ko_KR" : {
            "EXAP0300-0001" : "Saving is complete.",
            "EXAP0300-0002" : "Saving is not complete. Please contact the administrator.",
            "EXAP0300-0003" : "Do you want to save it?"
        },
        "en_US" : {
            "EXAP0300-0001" : "Saving is complete.",
            "EXAP0300-0002" : "Saving is not complete. Please contact the administrator.",
            "EXAP0300-0003" : "Do you want to save it?"
        }
    }
});
```

### Key Features

- Implements a new data entry form
- Applies required fields and validation rules
- Data formatting (date, number, etc.)
- Save and revert features

## Editing Form Data

An example of editing retrieved data using N.form.

### Implementation Overview

- Initialize and bind code data
- Initialize N.button component
- Initialize N.form component and bind data
- Handle save and revert button events

### HTML Structure

```html
<div class="searchBox">
    <ul>
        <li class="buttons">
            <a id="btnSave" href="#">
                <span lang="ko_KR">Save</span>
            </a>
            <a id="btnRevert" href="#">
                <span lang="ko_KR">Revert</span>
            </a>
        </li>
    </ul>
</div>

<table id="detail" class="form__" style="width: 100%;">
    <!-- Input fields... -->
</table>
```

### JavaScript Implementation

```typescript
const cont = N(".exap0400").cont({
    init : function(view, request) {
        cont._key = "101";
        cont.setCodes([ "gender", "eyeColor", "company", "favoriteFruit" ], function() {
            // N.select must be initialized before data components like N.grid or N.form
            cont.setComponents();
            cont.setEvents();
        });
    },
    setCodes : function(codeParams: string[], afterCodeInitFn: Function) {
        // 1. Initialize N.select and bind code data
        N({ codes : codeParams }).comm("html/naturaljs/exap/data/code.json").submit(function(data, request) {
            N(codeParams).each(function(i, code) {
                N(data as NC.JSONObject[]).datafilter("code === '" + code + "'").select(N("#detail #" + code as string, cont.view)).bind();
            });
            afterCodeInitFn.call(cont);
        });
    },
    setComponents : function() {
        // 2. Initialize button
        N(".buttons a", cont.view).button();
        // 3. Initialize N.form
        cont.form = N([]).form({
            context : N("#detail", cont.view),
            revert : true
        });
        // 3-1. Bind N.form data
        N.comm("html/naturaljs/exap/data/" + cont._key + ".json").submit(function(data) {
            // Bind data with N.form
            cont.form.bind(0, data);
        });
    },
    setEvents : function() {
        // 4. Bind events
        // 4-1 Save data to server
        N("#btnSave", cont.view).on("click", function(e) {
            e.preventDefault();
            if(cont.form.data(true)[0].rowStatus === undefined) {
                N.notify.add(N.message.get(cont.messages, "EXAP0400-0004"));
                return false;
            }
            if(cont.form.validate()) {
                N(window).alert({
                    msg : N.message.get(cont.messages, "EXAP0400-0003"),
                    confirm : true,
                    onOk : function(): undefined {
                        N(cont.form.data(true)).comm({
                            type : NA.Objects.Request.HttpMethod.PATCH,
                            url : "html/naturaljs/exap/data/" + cont._key + ".json"
                        }).submit(function(data) {
                            let msg;
                            if(data as number > 0) {
                                msg = N.message.get(cont.messages, "EXAP0400-0001");
                            } else {
                                msg = N.message.get(cont.messages, "EXAP0400-0002");
                            }
                            N(window).alert(msg).show();
                        });
                    }
                }).show();
            }
        });
        // 4-2 Reset to initial data
        N("#btnRevert", cont.view).on("click", function(e) {
            e.preventDefault();
            cont.form.revert();
        });
    },
    messages : {
        "ko_KR" : {
            "EXAP0400-0001" : "Editing is complete.",
            "EXAP0400-0002" : "Editing is not complete. Please contact the administrator.",
            "EXAP0400-0003" : "Do you want to save it?",
            "EXAP0400-0004" : "No changed data."
        },
        "en_US" : {
            "EXAP0400-0001" : "Editing is complete.",
            "EXAP0400-0002" : "Editing is not complete. Please contact the administrator.",
            "EXAP0400-0003" : "Do you want to save it?",
            "EXAP0400-0004" : "No changed data."
        }
    }
});
```

### Key Features

- Load and edit existing data
- Detect changed data
- Send only changed data to the server using PATCH method
- Validation and data formatting

## Data Grid CRUD (Fixed Header)

An example of handling create, read, update, and delete operations directly in a data grid (N.grid, fixed header type).

### Implementation Overview

- Initialize and bind code data
- Initialize N.button component
- Initialize N.form component (for search conditions)
- Initialize N.grid component (fixed header type)
- Handle search, add, delete, and save button events

### HTML Structure

```html
<div class="searchBox">
    <ul>
        <li class="inputs">
            <!-- Search condition fields... -->
        </li>
        <li class="buttons">
            <a id="btnAdd" href="#">
                <span lang="ko_KR">Add</span>
            </a>
            <a id="btnDelete" href="#">
                <span lang="ko_KR">Delete</span>
            </a>
            <a id="btnSave" href="#">
                <span lang="ko_KR">Save</span>
            </a>
            <a id="btnSearch" href="#">
                <span lang="ko_KR">Search</span>
            </a>
        </li>
    </ul>
</div>

<table id="grid" class="grid__" style="width: 100%;">
    <colgroup>
        <!-- Column width settings... -->
    </colgroup>
    <thead>
        <tr>
            <th rowspan="3">
                <input lang="ko_KR" id="checkAll" type="checkbox" title="Check All">
            </th>
            <th rowspan="3">Index</th>
            <th colspan="7">Privacy</th>
        </tr>
        <tr>
            <th rowspan="2">Name</th>
            <th>Email</th>
            <th data-filter="true">Gender</th>
            <th data-filter="true">Eye Color</th>
            <th rowspan="2" data-filter="true">Age</th>
            <th data-filter="true">Registered</th>
            <th data-filter="true">Active</th>
        </tr>
        <tr>
            <th colspan="3">About</th>
            <th colspan="2">Greeting</th>
        </tr>
    </thead>
    <tbody>
        <!-- Data row template... -->
    </tbody>
</table>
```

### JavaScript Implementation

```typescript
const cont = N(".exap0500").cont({
    init : function(view, request) {
        cont.setCodes([ "gender", "eyeColor" ], function() {
            // N.select must be initialized before data components like N.grid or N.form
            cont.setComponents();
            cont.setEvents();
        });
    },
    setCodes : function(codeParams: string[], afterCodeInitFn: Function) {
        // 1. Initialize N.select and bind code data
        N({ codes : codeParams }).comm("html/naturaljs/exap/data/code.json").submit(function(data, request) {
            N(codeParams).each(function(i, code) {
                const filteredData = N(data as NC.JSONObject[]).datafilter("code === '" + code + "'");
                filteredData.select(N(".searchBox #" + code, cont.view)).bind();
                filteredData.select(N(".grid__ #" + code, cont.view)).bind();
            });
            afterCodeInitFn.call(cont);
        });
    },
    setComponents : function() {
        // 2. Initialize button
        N(".buttons a", cont.view).button();
        // 3. Initialize N.form and add new row for search box
        cont.form = N([]).form({
            context : N(".searchBox", cont.view),
            revert : true
        }).add();
        // 4. Initialize N.grid and bind empty data for data list
        cont.grid = N([]).grid({
            context : N("#grid", cont.view),
            height : 350,
            resizable : false,
            sortable : true,
            more : true,
            checkAll : "#checkAll",
            checkAllTarget : ".checkAllTarget"
        }).bind();
    },
    setEvents : function() {
        // 5. Bind events
        // 5-1. Search button
        N("#btnSearch", cont.view).on("click", function(e) {
            e.preventDefault();
            if(cont.form.validate()) {
                N(cont.form.data(true)).comm("html/naturaljs/exap/data/sample.json").submit(function(data, request) {
                    // Bind data with N.grid
                    cont.grid.bind(data);
                });
            }
        });
        // 5-2. Add button
        N("#btnAdd", cont.view).on("click", function(e) {
            e.preventDefault();
            cont.grid.add();
        });
        // 5-3. Delete button
        N("#btnDelete", cont.view).on("click", function(e) {
            e.preventDefault();
            const checkedIndexs = cont.grid.check();
            if(checkedIndexs.length > 0) {
                N(window).alert({
                    msg : N.message.get(cont.messages, "EXAP0500-0001"),
                    confirm : true,
                    onOk : function(): undefined {
                        cont.grid.remove(checkedIndexs);
                    }
                }).show();
            } else {
                N(window).alert(N.message.get(cont.messages, "EXAP0500-0004")).show();
            }
        });
        // 5-4. Save button
        N("#btnSave", cont.view).on("click", function(e) {
            e.preventDefault();
            if(cont.grid.data("modified").length === 0) {
                N.notify.add(N.message.get(cont.messages, "EXAP0500-0003"));
                return false;
            }
            if(cont.grid.validate()) {
                N(window).alert({
                    msg : N.message.get(cont.messages, "EXAP0500-0005"),
                    confirm : true,
                    onOk : function(): undefined {
                        N(cont.grid.data("modified")).comm({
                            type : NA.Objects.Request.HttpMethod.PUT,
                            dataIsArray : true, // Send as array for multiple rows
                            url : "html/naturaljs/exap/data/sample.json"
                        }).submit(function(data) {
                            // Show success message and re-fetch data
                        });
                    }
                }).show();
            }
        });
    },
    messages : {
        "ko_KR" : {
            "EXAP0500-0001" : "Do you want to delete?\nIt will not be reflected in the DB until you press the save button.",
            "EXAP0500-0002" : "Saving is complete.",
            "EXAP0500-0003" : "No changed data.",
            "EXAP0500-0004" : "No selected row.",
            "EXAP0500-0005" : "Do you want to save?",
            "EXAP0500-0006" : " - Inserted: {0} rows",
            "EXAP0500-0007" : " - Updated: {0} rows",
            "EXAP0500-0008" : " - Deleted: {0} rows"
        },
        "en_US" : {
            // English messages...
        }
    }
});
```

### Key Features

- Implements a fixed header composite grid
- Multi-row selection and deletion via checkboxes
- Data filtering and sorting
- Validation and data formatting
- Detects changed data and processes in batch

## Data Grid CRUD (List Type)

An example of handling create, read, update, and delete operations directly in a data grid (N.grid, list type).

### Implementation Overview

- Initialize and bind code data
- Initialize N.button component
- Initialize N.form component (for search conditions)
- Initialize N.grid component (list type)
- Handle search, add, delete, and save button events

### HTML Structure

```html
<div class="searchBox">
    <ul>
        <li class="inputs">
            <!-- Search condition fields... -->
        </li>
        <li class="buttons">
            <a id="btnAdd" href="#">
                <span lang="ko_KR">Add</span>
            </a>
            <a id="btnDelete" href="#">
                <span lang="ko_KR">Delete</span>
            </a>
            <a id="btnSave" href="#">
                <span lang="ko_KR">Save</span>
            </a>
            <a id="btnSearch" href="#">
                <span lang="ko_KR">Search</span>
            </a>
        </li>
    </ul>
</div>

<table id="grid" class="grid__" style="width: 100%;">
    <colgroup>
        <!-- Column width settings... -->
    </colgroup>
    <thead>
        <tr>
            <th>
                <input lang="ko_KR" id="checkAll" type="checkbox" title="Check All">
            </th>
            <th>Name</th>
            <th data-filter="true">Email</th>
            <th data-filter="true">Gender</th>
            <th data-filter="true">Eye Color</th>
            <th data-filter="true">Age</th>
            <th data-filter="true">Registered</th>
            <th data-filter="true">Active</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="text-align: center;"><input class="checkAllTarget" type="checkbox"></td>
            <td><input id="name" type="text" data-validate="[[\"required\"]]"></td>
            <td><input id="email" type="text" data-validate="[[\"required\"], [\"email\"]]"></td>
            <td style="text-align: center;">
                <select id="gender" data-validate="[[\"required\"]]">
                    <option lang="ko_KR" value="">Select</option>
                </select>
            </td>
            <td style="text-align: center;">
                <select id="eyeColor" data-validate="[[\"required\"]]">
                    <option lang="ko_KR" value="">Select</option>
                </select>
            </td>
            <td><input id="age" type="text" data-validate="[[\"required\"], [\"integer\"]]"></td>
            <td><input id="registered" type="text" data-format="[[\"date\", 8, \"date\"]]" data-validate="[[\"required\"]]"></td>
            <td style="text-align: center;"><input id="isActive" type="checkbox"></td>
        </tr>
    </tbody>
</table>
```

### JavaScript Implementation

The implementation is similar to the fixed header grid, but with the following differences in grid initialization options:

```typescript
// N.grid initialization (list type)
cont.grid = N([]).grid({
    context : N("table#grid", cont.view),
    resizable : true, // resizable is true for list type grid
    sortable : true,
    checkAll : "#checkAll",
    checkAllTarget : ".checkAllTarget"
}).bind();
```

### Key Features

- Implements a list type grid (simpler than fixed header)
- Multi-row selection and deletion via checkboxes
- Data filtering and sorting
- Supports column resizing
- Validation and data formatting
- Detects changed data and processes in batch

## Screen Transition CRUD (Paging)

An example of implementing CRUD with pagination. This example shows how to manage data by switching between list and detail screens.

## Popup CRUD

An example of implementing CRUD using popup windows. This example shows how to handle data detail, entry, and editing via popups from the list screen.

## Master Grid & Detail Form

An example of managing master-detail data. The detail form content changes according to the data selected in the master grid.

## Multi-Form Binding

An example of binding a single data set to multiple forms. This shows how to display and manage the same data in multiple forms separated by tabs or panels.
