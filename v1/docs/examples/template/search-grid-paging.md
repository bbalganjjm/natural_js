---
type: Example
title: "Template: search form + grid + paging"
description: Natural-TEMPLATE screen that pages search results on the server with N.pagination, sending the search row plus the page numbers and redrawing the links from totalCount.
tags: [template, example, pagination, grid]
sources:
  - id: components
    resource: ../../../src/natural.template.js
    title: NT.aop.components (component creation, search-box usage)
    symbol: NT.aop.components
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: e60d19c0f4b2
  - id: events
    resource: ../../../src/natural.template.js
    title: NT.aop.events (e.* binding)
    symbol: NT.aop.events
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: 02c30b39f119
  - id: pagination
    resource: ../../../src/natural.ui.js
    title: NU.pagination implementation (bind, pageNo, currPageNavInfo, onChange)
    symbol: NU.pagination
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: dee9c8487ced
  - id: grid
    resource: ../../../src/natural.ui.js
    title: NU.grid implementation (fixedcol, createRowDelay)
    symbol: NU.grid
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 3ba583d8d43c
  - id: form
    resource: ../../../src/natural.ui.js
    title: NU.form implementation (data() returns the row objects)
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: comm
    resource: ../../../src/natural.architecture.js
    title: NA.comm (request body from a plain object)
    symbol: NA.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 40c48fda4ea0
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-TEMPLATE-EXAMPLES.md
    title: Legacy Natural-TEMPLATE example guide (removed)
generated: { by: codex/gpt-6-sol, at: 2026-09-24T05:37:38Z }
---

A Natural-TEMPLATE screen that retrieves one page of rows at a time: the server receives the search conditions plus the page range and returns that page with the total row count, and [N.pagination](../../ui/pagination.md) draws the page links. Copy it for lists too large to retrieve at once. It needs an activated Natural-TEMPLATE; see [Natural-TEMPLATE conventions](../../template/conventions.md).

# Scenario

- The page searches page 1 on load; search, Enter, or changing gender or eye color starts again at page 1.
- Clicking a page link, or first / previous / next / last, retrieves that page with the same search conditions.
- Every response carries the current total, so the links are redrawn after each page and reflect rows added or deleted in the meantime.
- The grid is list type (`height: 0`), shows the whole page and keeps the first three columns fixed while the rest scrolls horizontally.

# Components used

| Declaration | Becomes | Purpose |
|---|---|---|
| `p.select.gender`, `p.select.eyeColor` | array of [N.select](../../ui/select.md) | Common-code options of the search form. |
| `p.form.search` | [N.form](../../ui/form.md), `usage: "search-box"` | Search conditions. |
| `p.grid.master` | [N.grid](../../ui/grid.md) | List type with `fixedcol: 3`, resizable columns, synchronous rendering. |
| `p.pagination.masterPagination` | [N.pagination](../../ui/pagination.md) | Server paging, 15 rows per page, `blockOnChangeWhenBind: true`. |
| `c.getSampleList(navInfo)` | function returning an [N.comm](../../architecture/communicator.md) | Search row plus page numbers in one request body. |
| `load(navInfo)` | plain controller function | Requests a page, then binds the total and the rows. |
| `e.btnSearch.click`, `e.gender.change`, `e.eyeColor.change` | bound elements | Start a new search at page 1. |

# View

```html
<article class="type0301">
    <div id="search" class="search-panel">
        <ul>
            <li><label><span>Name</span><input id="name" type="text"></label></li>
            <li><label><span>Gender</span><select id="gender"><option value="">Select</option></select></label></li>
            <li><label><span>Eye color</span><select id="eyeColor"><option value="">Select</option></select></label></li>
        </ul>
    </div>

    <div class="button-panel">
        <button id="btnSearch" class="btn-search">Search</button>
    </div>

    <div style="position: relative; min-height: 483px;">
        <table id="master">
            <thead>
                <tr><th>No.</th><th>Name</th><th>Gender</th><th>Age</th><th>Eye color</th><th>Company</th><th>Email</th><th>Phone</th><th>Address</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td id="index" style="text-align: center;"></td>
                    <td id="name"></td>
                    <td id="gender"></td>
                    <td id="age" style="text-align: right;"></td>
                    <td id="eyeColor"></td>
                    <td id="company"></td>
                    <td id="email"></td>
                    <td id="phone"></td>
                    <td id="address"></td>
                </tr>
            </tbody>
        </table>
    </div>

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

The pagination context needs exactly three `ul` elements in this order: first and previous links, one page-number template (`li > a > span`), next and last links. Keep the grid and the pagination on different ids.

# Controller

```html
<script type="text/javascript">
(() => {
    const cont = N(".type0301").cont({
        "p.select.gender": [ "gender" ],
        "p.select.eyeColor": [ "eyeColor" ],
        "p.form.search": { usage: "search-box" },
        "p.grid.master": {
            resizable: true,
            fixedcol: 3,                                 // applied because height is 0
            createRowDelay: 0                            // render the page synchronously
        },
        "p.pagination.masterPagination": {
            countPerPage: 15,
            blockOnChangeWhenBind: true,                 // bind(totalCount) in load() must not fire onChange again
            onChange: function (pageNo, selEle, selData, currPageNavInfo) {
                cont.load(currPageNavInfo);              // selData is always [] in server paging
            }
        },

        "c.getSampleList": (navInfo) => N(Object.assign({}, cont["p.form.search"].data()[0], navInfo))
            .comm("sample/getSamplePaginationList.json"),

        firstPageNavInfo: function () {
            const size = cont["p.pagination.masterPagination"].countPerPage();
            return { pageNo: 1, countPerPage: size, startRowIndex: 0, endRowIndex: size - 1, startRowNum: 1, endRowNum: size };
        },
        load: (navInfo) => {
            cont["c.getSampleList"](navInfo).submit(function (data) {
                // A deleted last page has no row from which to read totalCount.
                if (Array.isArray(data) && data.length === 0 && navInfo.pageNo > 1) {
                    cont["p.pagination.masterPagination"].pageNo(1);
                    cont.load(cont.firstPageNavInfo());
                    return;
                }
                const totalCount = Array.isArray(data) && data.length > 0 ? data[0].totalCount : 0;
                cont["p.pagination.masterPagination"].bind(totalCount);   // redraws the links around pageNo
                cont["p.grid.master"].bind(data);
            });
        },

        "e.btnSearch.click": function (e) {
            e.preventDefault();
            if (cont["p.form.search"].validate()) {
                const paging = cont["p.pagination.masterPagination"];
                paging.pageNo(1);
                // Page 1 is built here: currPageNavInfo() is still capped by the previous totalCount.
                cont.load(cont.firstPageNavInfo());
            }
        },
        "e.gender.change": {
            target: "#search #gender",
            handler: function (e) {
                cont["e.btnSearch.click"].trigger("click");
            }
        },
        "e.eyeColor.change": {
            target: "#search #eyeColor",
            handler: function (e) {
                cont["e.btnSearch.click"].trigger("click");
            }
        },

        init: function (view, request) {
            cont["e.btnSearch.click"].trigger("click");
        }
    });
})();
</script>
```

# Server contract

Common codes are configured as in [Template: search form + grid](search-grid.md).

`sample/getSamplePaginationList.json` receives one JSON object: the search row merged with the page numbers. From a search it holds the six keys built in `e.btnSearch.click`; from a page link it holds the whole `currPageNavInfo` object (the same six plus `countPerPageSet`, `totalCount`, `pageCount`, `pageSetCount`, `currSelPageSet`, `startPage`, `endPage`).

```json
{ "name": "", "gender": "female", "eyeColor": "", "rowStatus": "insert",
  "pageNo": 1, "countPerPage": 15, "startRowIndex": 0, "endRowIndex": 14, "startRowNum": 1, "endRowNum": 15 }
```

| Server query style | Use |
|---|---|
| Row number between (`ROWNUM`, `ROW_NUMBER()`) | `startRowNum` to `endRowNum` (1-based, inclusive) |
| `LIMIT` / `OFFSET` | `countPerPage` rows from `startRowIndex` (0-based) |

The response is the array of rows of that page; every row (at least the first) carries `totalCount`, the number of rows matching the search. An empty response on page 1 means no rows. An empty response on a later page may mean that page disappeared after a deletion, so the controller retries page 1 before deciding the total is zero.

# How it works

1. **Creation.** Natural-TEMPLATE creates the pagination with `N([]).pagination(opts)` on `#masterPagination`. With no data, `totalCount` stays `0`; the constructor draws link `1` without click handlers, and `onChange` cannot fire until the first `bind()`.[^components][^pagination]
2. **Search.** The handler resets `pageNo` to 1 and requests page 1 with numbers it builds itself. `currPageNavInfo()` is not used here because it caps `endRowIndex` and `endRowNum` at `totalCount - 1` of the *previous* result (`0` before the first response), which would make a row-number query return too few rows or none.[^pagination]
3. **Response.** If a later page is empty, `load()` returns to page 1 to obtain a row carrying the current `totalCount`. Otherwise `bind(totalCount)` stores the total, redraws the page set that contains `pageNo` and selects that link; `blockOnChangeWhenBind: true` keeps this selection from firing `onChange`. The grid then renders the rows; `createRowDelay: 0` renders them synchronously.[^pagination][^grid]
4. **Page change.** A link click sets `pageNo`, recomputes `currPageNavInfo` and calls `onChange(pageNo, selEle, selData, currPageNavInfo)`; `load()` sends that object, whose range is correct because `totalCount` is now known. Previous and next move by page set, not by one page.[^pagination]
5. **Request body.** `data()` of the search form returns its row objects themselves, so the controller merges them into a new object with `Object.assign({}, ...)`; `N(object).comm(url)` then sends that object as the JSON body.[^form][^comm]

# Variations

- **Client-side paging**: retrieve all rows once and let the pagination slice them. `bind(rows)` sets `totalCount` to `rows.length`, and `onChange` receives the page's rows as `selData`:

```js
"p.pagination.masterPagination": {
    countPerPage: 15,
    onChange: function (pageNo, selEle, selData, currPageNavInfo) {
        cont["p.grid.master"].bind(selData);
    }
},
"e.btnSearch.click": function (e) {
    e.preventDefault();
    cont["c.getSampleList"]().submit(function (rows) {        // c.getSampleList without page numbers
        cont["p.pagination.masterPagination"].pageNo(1).bind(rows);   // fires onChange for page 1
    });
}
```

- **Count and rows in separate requests**: request the count once per search, `bind(count)` the pagination, and query only rows in `onChange`; see the server-side examples on [N.pagination](../../ui/pagination.md).
- **Fixed-header grid**: `height > 0` gives a scrolling body, but then `fixedcol` is ignored and scroll paging renders only `scrollPaging.size` rows at a time; keep `countPerPage` at or below that size.

# Pitfalls

The legacy communicator merged the page numbers into the search form's own row and read `currPageNavInfo()` at search time. `Object.assign(row, ...)` writes `pageNo`, `totalCount` and the other keys into the search form's data, and the range it read for a new search was capped by the previous total.[^form][^pagination]

```js
// Wrong (legacy): "c.getSampleList": () => N(Object.assign(cont["p.form.search"].data()[0], cont["p.pagination.masterPagination"].currPageNavInfo())).comm("sample/getSamplePaginationList.json")
"c.getSampleList": (navInfo) => N(Object.assign({}, cont["p.form.search"].data()[0], navInfo)).comm("sample/getSamplePaginationList.json")
```

```js
// Wrong (legacy): cont["p.pagination.masterPagination"].pageNo(1).bind(); cont["c.getSampleList"]().submit(...);
paging.pageNo(1);
cont.load({ pageNo: 1, countPerPage: size, startRowIndex: 0, endRowIndex: size - 1, startRowNum: 1, endRowNum: size });
```

Keep `blockOnChangeWhenBind: true` whenever `onChange` leads to `bind(totalCount)`: without it, every `bind()` selects the page link, fires `onChange`, requests the page again and binds again, forever.[^pagination]

`filter: false` in the legacy grid options was the default and has been dropped. In server paging the grid only holds the current page, so header filters would filter that page only.[^grid]

When a later response has rows but reports fewer pages than the current `pageNo`, `bind(totalCount)` finds no link for that page, so no page is highlighted. The sample server contract should not produce that combination: a page beyond the end returns an empty array, which `load()` handles by retrying page 1. If a server can return rows with an out-of-range `pageNo`, check `paging.pageNo() > Math.ceil(totalCount / paging.countPerPage())` and request page 1 again (see Known issues on [N.pagination](../../ui/pagination.md)).

# Related

- [N.pagination](../../ui/pagination.md) - `bind`, `pageNo`, `countPerPage`, `currPageNavInfo` and `onChange`.
- [N.grid](../../ui/grid.md) - list-type layout, `fixedcol` and `createRowDelay`.
- [N.comm](../../architecture/communicator.md) - how an object becomes the request body.
- [p.{component}.{id} declarations](../../template/component-declaration.md) - how `p.pagination` and the search box are created.
- [Template: search form + grid](search-grid.md) - the same screen without paging, with the shared configuration.
- [Natural-TEMPLATE conventions](../../template/conventions.md) - activation and lifecycle.

[^components]: NT.aop.components (component creation, search-box usage)
[^pagination]: NU.pagination implementation (bind, pageNo, currPageNavInfo, onChange)
[^grid]: NU.grid implementation (fixedcol, createRowDelay)
[^form]: NU.form implementation (data() returns the row objects)
[^comm]: NA.comm (request body from a plain object)
