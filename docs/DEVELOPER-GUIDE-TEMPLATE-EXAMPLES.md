# Natural-TEMPLATE Example Guide

Natural-TEMPLATE is a library that standardizes web application development based on Natural-JS, greatly improving code readability and development productivity. This document explains various Natural-TEMPLATE examples and describes the main features and implementation methods for each example in detail.

## Table of Contents

- [Natural-TEMPLATE Example Guide](#natural-template-example-guide)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [List of Examples](#list-of-examples)
  - [Template Examples](#template-examples)
    - [Search Form + Grid](#search-form--grid)
    - [Search Form + Grid (CRUD)](#search-form--grid-crud)
    - [Search Form + Grid + Paging](#search-form--grid--paging)
    - [Search Form + Grid + Detail Form (Horizontal Layout)](#search-form--grid--detail-form-horizontal-layout)
    - [Search Form + Grid + Detail Form (Vertical Layout)](#search-form--grid--detail-form-vertical-layout)
    - [Search Form + List + Grid + Detail Form](#search-form--list--grid--detail-form)
    - [Tree + Grid (CRUD)](#tree--grid-crud)
    - [Search Form + Tab](#search-form--tab)
  - [How to Use](#how-to-use)

## Introduction

Natural-TEMPLATE examples provide pre-implemented template patterns frequently used in real projects. Each example is constructed by combining various Natural-JS components, and is designed so that developers can easily understand and utilize them.

This guide introduces examples by template pattern, and explains the implementation method and main features of each. Each example demonstrates independent functionality, but all follow the basic code writing rules of Natural-TEMPLATE.

For the basic development guide of Natural-TEMPLATE, refer to the [Natural-TEMPLATE Development Guide](DEVELOPER-GUIDE-TEMPLATE.md).

## List of Examples

Natural-TEMPLATE provides template examples for various patterns as follows:

- Search Form + Grid: Basic search screen and data grid
- Search Form + Grid (CRUD): Grid with direct data input/edit/delete
- Search Form + Grid + Paging: Grid with server-side paging
- Search Form + Grid + Detail Form (Horizontal Layout): Grid and detail form placed side by side
- Search Form + Grid + Detail Form (Vertical Layout): Grid and detail form placed vertically
- Search Form + List + Grid + Detail Form: Composite pattern with list, grid, and detail form
- Tree + Grid (CRUD): Tree and grid combined for CRUD operations
- Search Form + Tab: Search form combined with tab component

## Template Examples

### Search Form + Grid

**Overview**
- Simple example composed of a search form (N.form) and a grid (N.grid).
- Enter search conditions to query data and display the results in the grid.

**Main Features**
- Automatic initialization and binding of common code data using `p.select.{id}`
- Data filtering using the grid's `filter` option
- Event handler definition using `e.{elementId}.{eventType}`

**HTML Structure**
```html
<article class="type0101 view-code">
    <!-- Page introduction -->
    <div class="view-intro">
        <h1>Search Form + Grid</h1>
        <ul class="view-desc">
            <!-- Description -->
        </ul>
    </div>
    <!-- Search form -->
    <h3>N.form</h3>
    <div id="search" class="form__">
        <div class="search-panel">
            <ul>
                <li><label><span>Name</span><input id="name" type="text" /></label></li>
                <li><label><span>Gender</span><select id="gender"><option value="">Select</option></select></label></li>
                <li><label><span>Eye Color</span><select id="eyeColor"><option value="">Select</option></select></label></li>
            </ul>
        </div>
    </div>
    <!-- Grid -->
    <div class="flex-horizental">
        <h3>N.grid</h3>
        <div class="button-panel">
            <button id="btnSearch" data-opts='{ "color": "primary" }'>Search</button>
        </div>
    </div>
    <table id="master" class="grid__">
        <!-- Grid columns -->
        <colgroup><!-- ... --></colgroup>
        <thead><!-- ... --></thead>
        <tbody><!-- ... --></tbody>
        <tfoot><!-- ... --></tfoot>
    </table>
</article>
```

**Controller Implementation**
```javascript
const cont = N('.type0101').cont({
    // Component initialization and options
    'p.select.gender': [ 'gender' ],
    'p.select.eyeColor': [ 'eyeColor' ],
    'p.select.favoriteFruit': [ 'favoriteFruit' ],
    'p.form.search': {
        usage: 'search-box'
    },
    'p.grid.master': {
        action: 'bind',
        filter: false,
        height: 350,
        onBind: (context, data) => {
            N('#totalCnt', cont.view).text(N.formatter.commas(String(data.length)));
        }
    },
    // Data communication
    'c.getSampleList': () => cont['p.form.search'].data(false).comm('sample/getSampleBigList.json'),
    // Event handler
    'e.btnSearch.click': async (e) => {
        e.preventDefault();
        if (cont['p.form.search'].validate()) {
            cont['p.grid.master'].bind(await cont['c.getSampleList']().submit());
        }
    },
    'e.eyeColor.change': {
        target: '#search #eyeColor',
        handler: (e) => {
            cont['e.btnSearch.click'].trigger('click');
        }
    },
    // Initialization
    init: (view, request) => {
        if (cont.opener) {
            cont['p.form.search'].context().hide().prev('h3').hide().prev('.view-intro').hide();
            view.find('#btnSearch').hide();
        }
    }
});
```

**Key Points**
- Automatic initialization and binding of common code data with `p.select.{id}`
- Data retrieval after form validation (`validate()`)
- Filtering with the grid's `filter` option
- Event handler definition with `e.{elementId}.{eventType}`

### Search Form + Grid (CRUD)

**Overview**
- Example with CRUD (Create, Read, Update, Delete) features using a search form (N.form) and a grid (N.grid).
- Data can be entered, edited, and deleted directly in the grid.

**Main Features**
- Input/query/edit/delete in the grid (N.grid)
- Automatic initialization and binding of common code data
- Control of buttons or elements inside grid rows
- Popup integration within the grid

**HTML Structure**
```html
<article class="type0201 view-code">
    <!-- Page introduction -->
    <div class="view-intro"><!-- ... --></div>
    <!-- Search form -->
    <h3>N.form</h3>
    <div id="search" class="form__"><!-- ... --></div>
    <!-- Grid -->
    <div class="flex-horizental">
        <h3 style="max-width: 100px;">N.grid</h3>
        <div class="button-panel">
            <button id="btnSearch">Search</button>
            <button id="btnAdd">Add</button>
            <button id="btnDelete">Delete</button>
            <button id="btnSave">Save</button>
        </div>
    </div>
    <table id="master" class="grid__">
        <!-- Grid columns -->
        <colgroup><!-- ... --></colgroup>
        <thead><!-- ... --></thead>
        <tbody>
            <!-- Editable grid rows -->
            <tr>
                <td rowspan="2" style="text-align: center;"><input class="checkAllTarget" type="checkbox"></td>
                <td id="index" style="text-align: center;" rowspan="2"></td>
                <td rowspan="2"><input id="name" type="text" data-validate='[["required"]]'></td>
                <!-- Other input fields -->
            </tr>
            <tr>
                <!-- Second row input fields -->
            </tr>
        </tbody>
        <tfoot><!-- ... --></tfoot>
    </table>
</article>
```

**Controller Implementation**
```javascript
const cont = N('.type0201').cont({
    // Component initialization and options
    'p.select.gender': [ 'gender' ],
    'p.select.eyeColor': [ 'eyeColor' ],
    'p.form.search': {
        usage: 'search-box'
    },
    'p.grid.master': {
        height: 350,
        resizable: false,
        checkAll: '#checkAll',
        checkAllTarget: '.checkAllTarget',
        scrollPaging: {
            size: 15
        }
    },
    'p.popup.dept': {
        url: 'html/naturaljs/template/samples/type04P0.html',
        onOpen: 'onOpen',
        height: 621,
        onClose: (onCloseData) => {
            if (onCloseData) {
                cont['p.grid.master']
                    .val(cont.selIdx, 'deptNm', onCloseData.deptNm)
                    .val(cont.selIdx, 'deptCd', onCloseData.deptCd);
            }
        }
    },
    // Data communication
    'c.getSampleList': () => cont['p.form.search'].data(false).comm('sample/getSampleList.json'),
    'c.saveSample': () => N(cont['p.grid.master'].data('modified')).comm({
        dataIsArray: true,
        url: 'sample/saveSample.json'
    }),
    // Event handlers
    'e.btnSearch.click': (e) => {
        e.preventDefault();
        if (cont['p.form.search'].validate()) {
            cont['c.getSampleList']().submit((data) => {
                cont['p.grid.master'].bind(data);
            });
        }
    },
    'e.btnSave.click': (e) => {
        e.preventDefault();
        return APP.comm.utils.save.call(this, {
            cont,
            comm: 'c.saveSample',
            changed: 'p.grid.master',
            validate: 'p.grid.master',
            after: (data) => {
                cont['e.btnSearch.click'].trigger('click');
            }
        });
    },
    'e.btnAdd.click': (e) => {
        e.preventDefault();
        cont['p.grid.master'].add();
    },
    'e.btnDelete.click': (e) => {
        e.preventDefault();
        return APP.comm.utils.del.call(this, {
            cont,
            inst: 'p.grid.master'
        });
    },
    'e.btnDeptCd.click': (e, idx) => {
        e.preventDefault();
        cont.selIdx = idx;
        cont['p.popup.dept'].open(cont['p.grid.master'].data()[idx]);
    },
    // Initialization
    init: (view, request) => {
        if (cont.opener) {
            // Logic for parent page
        } else {
            cont['e.btnSearch.click'].trigger('click');
        }
    }
});
```

**Key Points**
- Row selection with checkboxes (`checkAll`, `checkAllTarget` options)
- Grid data manipulation methods: `add()`, `remove()`, etc.
- Popup integration within grid rows (department search popup)
- Change detection and saving (`data("modified")`)
- Validation (`data-validate`)

### Search Form + Grid + Paging

**Overview**
- Example composed of a search form (N.form), grid (N.grid), and pagination (N.pagination).
- Demonstrates server-side paging.

**Main Features**
- Server-side paging with the pagination component (N.pagination)
- Automatic initialization and binding of common code data

**HTML Structure**
```html
<article class="type0301 view-code">
    <!-- Page introduction -->
    <div class="view-intro"><!-- ... --></div>
    <!-- Search form -->
    <h3>N.form</h3>
    <div id="search" class="form__"><!-- ... --></div>
    <!-- Grid -->
    <div class="flex-horizental">
        <h3>N.grid + N.pagination(DB)</h3>
        <div class="button-panel">
            <button id="btnSearch">Search</button>
        </div>
    </div>
    <div style="position: relative; min-height: 483px;">
        <table id="master" class="grid__"><!-- ... --></table>
    </div>
    <!-- Pagination -->
    <div class="pagination-box">
        <div id="masterPagination">
            <ul>
                <li><a href="#" title="First">first</a></li>
                <li><a href="#" title="Previous">prev</a></li>
            </ul>
            <ul>
                <li><a href="#"><span>1</span></a></li>
            </ul>
            <ul>
                <li><a href="#" title="Next">next</a></li>
                <li><a href="#" title="Last">last</a></li>
            </ul>
        </div>
    </div>
</article>
```

**Controller Implementation**
```javascript
const cont = N('.type0301').cont({
    // Component initialization and options
    'p.select.gender': [ 'gender' ],
    'p.select.eyeColor': [ 'eyeColor' ],
    'p.form.search': {
        usage: 'search-box'
    },
    'p.grid.master': {
        resizable: true,
        filter: false,
        fixedcol: 3,
        checkAll: '#checkAll',
        checkAllTarget: '.checkAllTarget',
        createRowDelay: 0
    },
    'p.pagination.masterPagination': {
        blockOnChangeWhenBind: true,
        countPerPage: 15,
        onChange: (pageNo, selEle, selData, currPageNavInfo) => {
            cont['c.getSampleList']().submit((data) => {
                let totalCount = 0;
                if (Array.isArray(data) && data[0] && data[0].totalCount) {
                    totalCount = data[0].totalCount;
                }
                cont['p.pagination.masterPagination'].bind(totalCount);
                cont['p.grid.master'].bind(data);
            });
        }
    },
    // Data communication
    'c.getSampleList': () => N(Object.assign(cont['p.form.search'].data()[0], cont['p.pagination.masterPagination'].currPageNavInfo())).comm('sample/getSamplePaginationList.json'),
    // Event handler
    'e.btnSearch.click': (e) => {
        e.preventDefault();
        if (cont['p.form.search'].validate()) {
            cont['p.pagination.masterPagination'].pageNo(1).bind();
            cont['c.getSampleList']().submit((data) => {
                let totalCount = 0;
                if (Array.isArray(data) && data[0] && data[0].totalCount) {
                    totalCount = data[0].totalCount;
                }
                cont['p.pagination.masterPagination'].bind(totalCount);
                cont['p.grid.master'].bind(data);
            });
        }
    },
    // Other event handlers
    'e.gender.change': {
        target: '#search #gender',
        handler: (e) => {
            cont['e.btnSearch.click'].trigger('click');
        }
    },
    'e.eyeColor.change': {
        target: '#search #eyeColor',
        handler: (e) => {
            cont['e.btnSearch.click'].trigger('click');
        }
    },
    // Initialization
    init: (view, request) => {
        if (cont.opener) {
            // Logic for parent page
        } else {
            cont['e.btnSearch.click'].trigger('click');
        }
    }
});
```

**Key Points**
- Pagination component (`p.pagination.masterPagination`) initialization
- Server-side paging using `totalCount`
- Data loading on page change via `onChange` event
- Get current page info with `currPageNavInfo()`
- Reset page number to 1 on search (`pageNo(1)`)

### Search Form + Grid + Detail Form (Horizontal Layout)

**Overview**
- Example composed of a search form (N.form), grid (N.grid), and detail form (N.form) placed side by side.
- Shows how to display details of the selected grid row in a form next to the grid.

**Main Features**
- Data binding to the detail form when a grid row is selected
- Use of various input components (select, radio, checkbox, etc.)
- Popup integration with the detail form

**HTML Structure**
```html
<article class="type0401 view-code">
    <!-- Page introduction -->
    <div class="view-intro"><!-- ... --></div>
    <!-- Search form -->
    <h3>N.form</h3>
    <div id="search" class="form__"><!-- ... --></div>
    <div class="flex-horizental">
        <!-- Grid area -->
        <div style="max-width: 33%;">
            <div class="flex-horizental">
                <h3>N.grid</h3>
                <div class="button-panel">
                    <button id="btnSearch">Search</button>
                    <button id="btnSave">Save</button>
                </div>
            </div>
            <table id="master" class="grid__"><!-- ... --></table>
        </div>
        <!-- Detail form area (horizontal layout) -->
        <div>
            <div class="flex-horizental">
                <h3>N.form</h3>
                <div class="button-panel">
                    <button id="btnAdd">Add</button>
                    <button id="btnDelete">Delete</button>
                    <button id="btnRevert">Reset</button>
                </div>
            </div>
            <ul id="detail" class="form__">
                <!-- Various form elements -->
                <li>
                    <label>
                        <span>Default Picture</span>
                        <img id="picture" style="height: 56px;">
                    </label>
                </li>
                <li>
                    <label>
                        <span>Name</span>
                        <input id="name" type="text" data-validate='[["required"]]'>
                    </label>
                </li>
                <!-- Other form elements -->
            </ul>
        </div>
    </div>
</article>
```

**Controller Implementation**
```javascript
const cont = N('.type0401').cont({
    // Component initialization and options
    'p.select.gender': [ 'gender' ],
    'p.select.eyeColor': [ 'eyeColor' ],
    'p.select.company': [ 'company' ],
    'p.select.favoriteFruit': [ 'favoriteFruit' ],
    'p.select.age': [ 'c.getSampleCodeList', 'age', 'age', (data) => {
        return N(N.array.deduplicate(data, 'age')).datasort('age');
    }],
    'p.form.search': {
        usage: 'search-box'
    },
    'p.form.detail': {
        revert: true,
        autoUnbind: true
    },
    'p.grid.master': {
        height: 486,
        select: true,
        selectScroll: false,
        onSelect: (index, rowEle, data, beforeRow, e) => {
            // Pre-processing
            APP.comm.utils.selectNBind.call(this, {
                args: arguments,
                cont: cont,
                form: 'p.form.detail'
            });
            // Post-processing
        },
        onBind: (context, data, isFirstPage, isLastPage) => {
            if (isFirstPage) {
                this.select(0);
            }
        }
    },
    'p.popup.dept': {
        url: 'html/naturaljs/template/samples/type04P0.html',
        onOpen: 'onOpen',
        height: 621,
        onClose: (onCloseData) => {
            if (onCloseData) {
                cont['p.form.detail']
                    .val('deptNm', onCloseData.deptNm)
                    .val('deptCd', onCloseData.deptCd);
            }
        }
    },
    // Data communication
    'c.getSampleCodeList': () => N.comm('sample/getSampleList.json'),
    'c.getSampleList': () => cont['p.form.search'].data(false).comm('sample/getSampleList.json'),
    'c.saveSample': () => N(cont['p.grid.master'].data('modified')).comm({
        dataIsArray: true,
        url: 'sample/saveSample.json'
    }),
    // Event handlers
    'e.btnSearch.click': (e) => {
        e.preventDefault();
        if (cont['p.form.search'].validate()) {
            cont['c.getSampleList']().submit((data) => {
                cont['p.grid.master'].bind(data);
            });
        }
    },
    'e.btnDeptCd.click': (e) => {
        e.preventDefault();
        cont['p.popup.dept'].open(cont['p.form.detail'].data(true)[0]);
    },
    'e.btnSave.click': (e) => {
        e.preventDefault();
        return APP.comm.utils.save.call(this, {
            cont: cont,
            comm: 'c.saveSample',
            changed: 'p.grid.master',
            validate: 'p.form.detail',
            after: (data) => {
                cont['e.btnSearch.click'].trigger('click');
            }
        });
    },
    'e.btnAdd.click': (e) => {
        e.preventDefault();
        if (cont['p.form.detail'].validate()) {
            cont['p.form.detail'].add();
        }
    },
    'e.btnDelete.click': (e) => {
        e.preventDefault();
        cont['p.form.detail'].remove();
    },
    'e.btnRevert.click': (e) => {
        e.preventDefault();
        if (cont['p.grid.master'].data('modified').length === 0) {
            N(window).alert(N.message.get(APP.comm.messages, 'COMM-0001')).show();
            return false;
        }
        cont['p.form.detail'].revert();
    },
    // Initialization
    init: (view, request) => {
        if (cont.opener) {
            // Logic for parent page
        } else {
            cont['e.btnSearch.click'].trigger('click');
        }
    }
});
```

**Key Points**
- Integration of detail form with grid's `onSelect` event
- Use of `revert` and `autoUnbind` options in the detail form
- Various data binding methods (common code, general data)
- Form data handling methods: `add()`, `remove()`, `revert()`
- Popup integration with the detail form (`p.popup.dept`)

### Search Form + Grid + Detail Form (Vertical Layout)

**Overview**
- Example composed of a search form (N.form), grid (N.grid), and detail form (N.form) placed vertically.
- The detail form is placed below the grid.

**Main Features**
- Data binding to the detail form when a grid row is selected
- Use of various input components
- Popup integration with the detail form

**HTML Structure**
```html
<article class="type0402 view-code">
    <!-- Page introduction -->
    <div class="view-intro"><!-- ... --></div>
    <!-- Search form -->
    <h3>N.form</h3>
    <div id="search" class="form__"><!-- ... --></div>
    <!-- Grid -->
    <div class="flex-horizental">
        <h3>N.grid</h3>
        <div class="button-panel">
            <button id="btnSearch">Search</button>
            <button id="btnSave">Save</button>
        </div>
    </div>
    <table id="master" class="grid__"><!-- ... --></table>
    <!-- Detail form area (vertical layout) -->
    <div>
        <div class="flex-horizental">
            <h3>N.form</h3>
            <div class="button-panel">
                <button id="btnAdd">Add</button>
                <button id="btnDelete">Delete</button>
                <button id="btnRevert">Reset</button>
            </div>
        </div>
        <ul id="detail" class="form__">
            <!-- Various form elements -->
        </ul>
    </div>
</article>
```

**Controller Implementation**
```javascript
const cont = N('.type0402').cont({
    // Component initialization and options
    'p.select.gender': {
        code: 'gender',
        selected: 'male'
    },
    'p.select.eyeColor': {
        code: 'eyeColor'
    },
    'p.select.company': {
        code: 'company'
    },
    'p.select.favoriteFruit': {
        code: 'favoriteFruit'
    },
    'p.select.age': {
        comm: 'c.getSampleCodeList',
        key: 'age',
        val: 'age',
        filter: (data) => {
            return N(N.array.deduplicate(data, 'age')).datasort('age');
        },
        selected: '22'
    },
    'p.form.search': {
        usage: 'search-box'
    },
    'p.form.detail': {
        revert: true,
        autoUnbind: true
    },
    'p.grid.master': {
        height: 200,
        select: true,
        selectScroll: false,
        onSelect: (index, rowEle, data, beforeRow, e) => {
            // Pre-processing
            APP.comm.utils.selectNBind.call(this, {
                args: arguments,
                cont: cont,
                form: 'p.form.detail'
            });
            // Post-processing
        },
        onBind: (context, data, isFirstPage, isLastPage) => {
            if (isFirstPage) {
                this.select(0);
            }
        }
    },
    // The rest is the same as the horizontal layout example
    // ...
});
```

**Key Points**
- Functionally the same as the horizontal layout example, but the UI layout is vertical
- Difference in component option declaration (array vs object)
- Grid height is smaller than the horizontal layout

### Search Form + List + Grid + Detail Form

This template is a composite pattern using a search form, list, grid, and detail form. Depending on the item selected in the main list, related data is displayed in the grid, and details of the selected grid row are shown in the form.

### Tree + Grid (CRUD)

This template combines a tree component and a grid. Data corresponding to the selected node in the tree is displayed in the grid, and CRUD operations can be performed in the grid.

### Search Form + Tab

This template combines a search form and tab component. Different content is displayed for each tab, and required features can be implemented in each tab.

## How to Use

You can use the Natural-TEMPLATE examples in the following ways:

- Reference the sample code: Refer to the HTML and JavaScript code of each example to implement similar features.
- Copy and modify templates: Copy the example code and modify it to fit your project requirements.
- Learn component combinations: Learn how various Natural-JS components are combined and used.
- Learn standard coding patterns: Learn the code writing rules of Natural-TEMPLATE to write consistent code.

Each example provides the most basic structure for the corresponding screen pattern, and you can add or modify features as needed.
