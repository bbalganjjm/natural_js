# Natural-UI Pagination Component Developer Guide

The Natural-UI Pagination (`N.pagination`) component is a UI component that generates paging indexes for list data or a total row count.

## Table of Contents

1. [Overview](#overview)
2. [Constructor](#constructor)
3. [Default Options](#default-options)
4. [Methods](#methods)
5. [Usage Examples](#usage-examples)
6. [Notes](#notes)

## Overview

Pagination (`N.pagination`) is a UI component that generates paging indexes for list data or a total row count. The context element of `N.pagination` consists of `div > ul > li > a` elements. With the N.pagination component, you can generate parameters for SQL paging or paginate a full list of data in a JSON object array format.

## Constructor

### N.pagination

Creates an instance of `N.pagination`.

```javascript
const pagination = new N.pagination(data, optsOrContext);
```

- **data**: JSON object array. Sets the data option. Same as the data option in default options.
- **optsOrContext**: Object or selector string or jQuery object. Specifies the default options object for the component. If a selector string or jQuery object is provided, it is set as the context option in the default options.

### N(obj).pagination

Creates an instance of the N.pagination object using the jQuery plugin method.

```javascript
const pagination = N(data).pagination(optsOrContext);
```

Although the instantiation method differs, instances created with `new N.pagination()` and `N().pagination` are identical. The first argument of the N() function is set as the first argument of the new N.pagination constructor.

- **optsOrContext**: Object or selector string or jQuery object. Same as the second argument (opts) of the N.pagination function.

## Default Options

- **data** (JSON object array, required): Specifies the data to bind to N.pagination. If the data option is set, the totalCount value is automatically calculated and set, so totalCount should be set to 0 or omitted. For DB paging, do not set the data option; only set the totalCount value from the server.
- **context** (jQuery object or selector string, required): Specifies the context element to apply N.pagination. The context element must be written as ul and li tags inside a div tag.
    - For first, last, previous, and next page buttons, use a tags inside li tags within ul tags. Separate ul tags for first/previous and last/next elements. If you omit the tags for first/last page links, those features are disabled.
    - For page indexes, use a tags inside li tags within ul tags.
    - Example:

```html
<div class="pagination-context">
    <ul>
        <li><a href="#">first</a></li>
        <li><a href="#">prev</a></li>
    </ul>
    <ul>
        <li><a href="#"><span>1</span></a></li>
    </ul>
    <ul>
        <li><a href="#">next</a></li>
        <li><a href="#">last</a></li>
    </ul>
</div>
```

- **totalCount** (number, required): Sets the total number of rows to be paged. For DB paging, do not set the data option; only set the totalCount value from the server.
- **countPerPage** (number, default: 10): Sets the number of rows per page.
- **countPerPageSet** (number, default: 10): Sets the number of pages per page set.
- **pageNo** (number, default: 1): Sets the page number to display first after initializing N.pagination.
- **blockOnChangeWhenBind** (boolean, default: false): If true, the onChange event is not triggered when calling the bind method.
- **onChange** (function): Defines the event handler executed when the page changes.

```javascript
onChange: (pageNo, selEle, selData, currPageNavInfo) => {
    // this: N.pagination instance
    // pageNo: page number
    // selEle: selected page navigation element
    // selData: data list for the selected page
    // currPageNavInfo: page info at the time of the event
}
```

### currPageNavInfo Object Properties

- pageNo: Current page number
- countPerPage: Rows per page
- countPerPageSet: Pages per page set
- currSelPageSet: Current page set number
- pageCount: Total number of pages
- pageSetCount: Total number of page sets
- totalCount: Total number of rows
- startPage: First page number in the current page set
- startRowIndex: Index of the first row on the selected page
- startRowNum: Row number of the first row on the selected page
- endPage: Last page number in the current page set
- endRowIndex: Index of the last row on the selected page
- endRowNum: Row number of the last row on the selected page

For DB paging, first get the totalCount value from the server, then send the currPageNavInfo argument values from the onChange event handler to the server as parameters to retrieve the paged data. Bind the paged data to N.grid or N.list whenever the page changes in the onChange event.

```javascript
const grid = N(data).grid(".grid-context");

N.comm("getTotalCnt.json").submit(data => {
    N(data).pagination({
        context: ".pagination-context",
        totalCount: data.totalCount,
        onChange: (pageNo, selEle, selData, currPageNavInfo) => {
            N(currPageNavInfo).comm("getPagedDataList.json").submit(data => {
                grid.bind(selData);
            });
        }
    }).bind();
});
```

If blockOnChangeWhenBind is set to true, the event is only triggered when clicking the paging buttons.

## Methods

- **data(selFlag)**: Returns the latest data bound to the component. If selFlag is undefined, returns a JSON object array. If false, returns the original jQuery object [JSON object array]. When binding data to another data-related component, set selFlag to false to enable two-way data binding.
- **context(selector)**: Returns the context element. If a jQuery selector is provided, finds and returns the specified element within the context.
- **bind(dataOrTotalCount, totalCount)**: Binds data to the context element specified in the context option and creates the pagination. If the first argument is a number, it is set as totalCount; if it is an array, it is set as data. The second argument is the total row count for pagination.
- **pageNo(pageNo)**: Gets or sets the page number. If no argument is provided, returns the current pageNo. If an argument is provided, sets pageNo to that value. Only the option value is changed; you must call bind after this function to update the pagination display.
- **totalCount(totalCount)**: Gets or sets the total row count. If no argument is provided, returns the current totalCount. If an argument is provided, sets totalCount to that value. Only the option value is changed; you must call bind after this function to update the pagination display.
- **countPerPage(countPerPage)**: Gets or sets the number of rows per page. If no argument is provided, returns the current countPerPage. If an argument is provided, sets countPerPage to that value. Only the option value is changed; you must call bind after this function to update the pagination display.
- **countPerPageSet(countPerPageSet)**: Gets or sets the number of pages per page set. If no argument is provided, returns the current countPerPageSet. If an argument is provided, sets countPerPageSet to that value. Only the option value is changed; you must call bind after this function to update the pagination display.
- **currPageNavInfo()**: Returns the paging info object, which includes various paging-related information such as page number, rows per page, and pages per page set.

## Usage Examples

### 1. Binding Data to Pagination

```html
<div class="pagination">
    <ul>
        <li><a href="#" title="First Page">first</a></li>
        <li><a href="#" title="Previous Page">prev</a></li>
    </ul>
    <ul>
        <li><a href="#"><span>1</span></a></li>
    </ul>
    <ul>
        <li><a href="#" title="Next Page">next</a></li>
        <li><a href="#" title="Last Page">last</a></li>
    </ul>
</div>

<script type="text/javascript">
    N.comm("data.json").submit(data => {
        N(data).pagination({
            context: ".pagination",
            onChange: (pageNo, selEle, selData, currPageNavInfo) => {
                N.log(selData);
            }
        }).bind();
    });
</script>
```

### 2. Creating Pagination with the Third Page Selected by Default

```html
<div class="pagination">
    <ul>
        <li><a href="#">first</a></li>
        <li><a href="#">prev</a></li>
    </ul>
    <ul>
        <li><a href="#"><span>1</span></a></li>
    </ul>
    <ul>
        <li><a href="#">next</a></li>
        <li><a href="#">last</a></li>
    </ul>
</div>

<script type="text/javascript">
    N.comm("data.json").submit(data => {
        N(data).pagination({
            context: ".pagination",
            onChange: (pageNo, selEle, selData, currPageNavInfo) => {
                N.log(selData);
            }
        })
        .pageNo(3)
        .bind();
    });
</script>
```

### 3. Paging Grid Data by Linking N.pagination and N.grid

```html
<table class="pagination">
    <thead>
        <tr>
            <th>name</th>
            <th>age</th>
            <th>gender</th>
            <th>email</th>
            <th>registered</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td id="name"></td>
            <td id="age"></td>
            <td id="gender"></td>
            <td id="email"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<div class="pagination">
    <ul>
        <li><a href="#">first</a></li>
        <li><a href="#">prev</a></li>
    </ul>
    <ul>
        <li><a href="#"><span>1</span></a></li>
    </ul>
    <ul>
        <li><a href="#">next</a></li>
        <li><a href="#">last</a></li>
    </ul>
</div>

<script type="text/javascript">
    const grid = N(data).grid(".pagination");

    N.comm("data.json").submit(data => {
        N(data).pagination({
            context: ".pagination",
            onChange: (pageNo, selEle, selData, currPageNavInfo) => {
                grid.bind(selData);
            }
        }).bind();
    });
</script>
```

### 4. SQL Paging

For SQL paging, first get the totalCount value from the server, then send the currPageNavInfo info to the server to retrieve the paged data, and bind the returned data to N.grid.

```html
<table class="pagination">
    <thead>
        <tr>
            <th>name</th>
            <th>age</th>
            <th>gender</th>
            <th>email</th>
            <th>registered</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td id="name"></td>
            <td id="age"></td>
            <td id="gender"></td>
            <td id="email"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<div class="pagination">
    <ul>
        <li><a href="#">first</a></li>
        <li><a href="#">prev</a></li>
    </ul>
    <ul>
        <li><a href="#"><span>1</span></a></li>
    </ul>
    <ul>
        <li><a href="#">next</a></li>
        <li><a href="#">last</a></li>
    </ul>
</div>

<script type="text/javascript">
    const grid = N(data).grid(".pagination");

    N.comm("retrieveCnt.json").submit(data => {
        N(data).pagination({
            context: ".pagination",
            totalCount: data.totalCount,
            onChange: (pageNo, selEle, selData, currPageNavInfo) => {
                N(currPageNavInfo)
                .comm("data.json").submit(data => {
                    grid.bind(selData);
                });
            }
        }).bind();
    });
</script>
```

If the paged data includes a totalCount value, you can also pass the totalCount value to the bind method of N.pagination each time data is retrieved, so that the paging index is regenerated. This approach has the disadvantage of regenerating the pagination index every time the page changes, but the advantage of accurate paging even if other users add or delete data after data retrieval.

```javascript
<script type="text/javascript">
    const grid = N(data).grid(".pagination");

    const pagination = N(data).pagination({
        context: ".pagination",
        blockOnChangeWhenBind: true,
        onChange: (pageNo, selEle, selData, currPageNavInfo) => {
            N(currPageNavInfo)
            .comm("data.json").submit(data => {
                pagination.bind(data[0] && data[0].totalCount ? data[0].totalCount : 0);
                grid.bind(data);
            });
        }
    }).bind();

    N(".btn-search").on("click", () => {
        pagination.pageNo(1).bind();
        N(pagination.currPageNavInfo())
        .comm("data.json").submit(data => {
            pagination.bind(data[0] && data[0].totalCount ? data[0].totalCount : 0);
            grid.bind(data);
        });
    });
</script>
```

## Notes

1. The context element of the Pagination component must be written as ul and li tags inside a div tag.
2. If the data option is set, the totalCount value is automatically calculated and set, so totalCount should be set to 0 or omitted.
3. For DB paging, do not set the data option; only set the totalCount value from the server.
4. If blockOnChangeWhenBind is set to true, the onChange event is not triggered when calling the bind method, preventing infinite loops.
5. When regenerating the paging index, you must call the bind method. After running functions such as pageNo, totalCount, countPerPage, or countPerPageSet, always call bind to reflect the changes in the pagination.
