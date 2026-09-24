---
type: UI Component
title: N.pagination
description: Builds page index links for a client-side data array or a server-side total row count and reports each page change with its rows and paging numbers.
tags: [ui, component, pagination, paging]
symbols: [N.pagination, N().pagination, NU.pagination, NU.Pagination, NU.Options.Pagination, NU.Options.CurrPageNavInfo]
sources:
  - id: ui
    resource: ../../src/natural.ui.js
    title: NU.pagination implementation
    symbol: NU.pagination
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: dee9c8487ced
  - id: ui-plugin
    resource: ../../src/natural.ui.js
    title: NU.prototype.pagination jQuery plugin wrapper
    symbol: NU.prototype.pagination
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 6d45895ffa9e
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Pagination.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.pagination` turns a `div` with three `ul` elements into first / previous / page-number / next / last links. Give it a data array to page rows in the browser, or only a `totalCount` to page on the server (SQL paging); `onChange` receives the page's rows or the row range to query. Bind the page to an [N.grid](grid.md) or [N.list](list.md) with `height: 0`.

# Quick start

```html
<div id="empPaging">
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

```js
const grid = N([]).grid("#empGrid");

N.comm("getEmployees.json").submit(function (rows) {
    N(rows).pagination({
        context: "#empPaging",
        countPerPage: 20,
        onChange: function (pageNo, selEle, selData, currPageNavInfo) {
            grid.bind(selData);            // rows of the selected page
        }
    }).bind();                             // draws the links and fires onChange for pageNo
});
```

# Constructor

## `N(data).pagination(opts | context)`

- Calls `new NU.pagination(this, opts)` where `this` is the `N(data)` collection, and returns the **N.pagination instance**.[^ui-plugin]
- For server paging there is no data: use `N([])` or `N()`.

## `new N.pagination(data, opts | context)`

- `data`: JSON object array (wrapped with `N()`) or an NJS wrapper. When it has rows, `totalCount` is set to its length before `opts` is merged, so an explicit `opts.totalCount` still wins.[^ui]
- `opts | context`: a plain object is the options object; anything else becomes `context`.
- The constructor tags the link elements, draws the first page set (without click handlers), computes `currPageNavInfo`, adds `pagination__` and stores the instance (`N(context).instance("pagination")`). Call `bind()` to attach the handlers and select `pageNo`. N.pagination is not registered with `ND.ds`.

Required markup inside `context` (found with `ul:eq(0..2)`):

| `ul` | Content | Result |
|---|---|---|
| first | two `li > a` | first-page and previous-set links; with any other number of `li`, the first `li` is the previous-set link only |
| second | one `li > a > span` | template cloned for every page number; the number is written into the `span` |
| third | two `li > a` | next-set and last-page links; with any other number of `li`, the first `li` is the next-set link only |

The `ul` elements are found by position, so all three must exist in this order; with fewer `ul` elements the links are assigned to the wrong lists or `bind()` throws a TypeError.

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | array \| NJS | — | Rows paged in the browser. Omit (empty) for server paging. |
| `context` | selector \| jQuery | — | The `div` holding the three `ul` elements. |
| `totalCount` | number | `0` | Total row count. Set automatically from the constructor's data; set it yourself for server paging. |
| `countPerPage` | number | `10` | Rows per page. |
| `countPerPageSet` | number | `10` | Page links per page set. |
| `pageNo` | number | `1` | Page selected by the next `bind()`. |
| `blockOnChangeWhenBind` | boolean | `false` | `true`: `bind()` selects the page without firing `onChange`; only link clicks fire it. |
| `onChange` | function \| null | `null` | Page change handler; see Events. |

Defaults are the `NU.pagination` constructor values.[^ui] `currPageNavInfo` is kept in the options as well; read it with `currPageNavInfo()`.

# Methods

## `data([selFlag])`

No argument: plain array of the rows. `false`: the NJS wrapper. Any other value returns `undefined`.

## `context([selector])`

Returns the context `div`, or `div.find(selector)`.

## `bind([dataOrTotalCount][, totalCount])`

- A number sets `totalCount`.
- An array replaces the data and sets `totalCount` to the second argument, or to the array length. An NJS wrapper is neither and is ignored.
- Redraws the page set that contains `pageNo`, rebinds the click handlers of all links and clicks the `pageNo` link, which fires `onChange` unless `blockOnChangeWhenBind` is `true`.
- Returns the instance.[^ui]

## `totalCount([totalCount])`

Getter returns `totalCount`. Setter stores it and returns the instance; call `bind()` to redraw.

## `pageNo([pageNo])`

Getter returns the current page number. Setter stores it and returns the instance; call `bind()` to redraw and select it.

## `countPerPage([countPerPage])`

Getter returns rows per page. Setter stores it, **resets `pageNo` to 1** and returns the instance; call `bind()` to redraw.

## `countPerPageSet([countPerPageSet])`

Getter returns links per set. Setter stores it, **resets `pageNo` to 1** and returns the instance; call `bind()` to redraw.

## `currPageNavInfo()`

Returns the paging numbers computed by the last constructor, `bind()` or link click:

| Key | Value |
|---|---|
| `pageNo` | Selected page (1-based). |
| `countPerPage`, `countPerPageSet`, `totalCount` | Copies of the options. |
| `pageCount` | `Math.ceil(totalCount / countPerPage)`. |
| `pageSetCount` | `Math.ceil(pageCount / countPerPageSet)`. |
| `currSelPageSet` | `Math.ceil(pageNo / countPerPageSet)`, capped at `pageSetCount`. |
| `startPage`, `endPage` | First and last page number of the current set (at least 1). |
| `startRowIndex` | `(pageNo - 1) * countPerPage` (0-based). |
| `endRowIndex` | `startRowIndex + countPerPage - 1`, capped at `totalCount - 1`. |
| `startRowNum`, `endRowNum` | `startRowIndex + 1`, `endRowIndex + 1` (1-based, inclusive). |

# Events

| Name | Signature | `this` | When |
|---|---|---|---|
| `onChange` | `function(pageNo, selEle, selData, currPageNavInfo)` | the `N.pagination` instance | A page link is clicked, the first / previous / next / last link moves to a page, or `bind()` selects `pageNo` (unless `blockOnChangeWhenBind`). `selEle` is the jQuery-wrapped page `a`; `selData` holds `data[startRowIndex..endRowIndex]` when the data has rows and `data.length <= totalCount`, otherwise `[]`; `currPageNavInfo` is the object above. |

A global `onChange` in `N.context.attr("ui").pagination` runs after the local one unless the local one returns `false`. See [Component model](component-model.md).

# Global configuration

`N.context.attr("ui").pagination` is merged (shallow) over the constructor defaults, for example to set a site-wide `countPerPage`. The shipped `natural.config.js` does not define it. See [Configuration](../setup/configuration.md).

# Behavior

- **Previous and next move by page set**, not by page: previous selects the first page of the previous set, next the first page of the next set. First selects page 1 and last selects `pageCount`.
- **Disabled links** get `pagination_disable__`: previous on the first set, next on the last set, first on page 1, last on the last page (or when there are no pages). Their handlers do nothing, except the disabled last link when there are no pages (`totalCount: 0`): clicking it reselects page 1 and fires `onChange` with `selData` `[]`, even with `blockOnChangeWhenBind: true` (see Known issues).[^ui]
- **Active page**: the selected page `li` gets `pagination_active__`; every page `li` carries `data-pageno`.
- **No rows**: with `totalCount: 0` one page link `1` is drawn, and `bind()` still fires `onChange` with `selData` `[]` (unless blocked).
- **CSS classes**: `pagination__`, `pagination_lefter__`, `pagination_body__`, `pagination_righter__`, `pagination_page__`, `pagination_first__`, `pagination_prev__`, `pagination_next__`, `pagination_last__`, `pagination_disable__`, `pagination_active__`. See [Theming](theming.md).

# Pitfalls

In server paging there is no `data` option, so `selData` is always `[]`. Bind the rows the server returns.

```js
// Wrong (legacy): N(currPageNavInfo).comm("getPagedDataList.json").submit(data => { grid.bind(selData); });
N(currPageNavInfo).comm("getPagedDataList.json").submit(function (rows) { grid.bind(rows); });
```

Do not create the pagination from the count response: `N(countResponse)` becomes the `data` option, and page 1 then reports the count object as its `selData`.

```js
// Wrong (legacy): N(data).pagination({ context: ".pagination-context", totalCount: data.totalCount, onChange: ... });
N([]).pagination({ context: ".pagination-context", totalCount: res.totalCount, onChange: onPageChange });
```

Give the grid and the pagination different selectors; one shared class makes both components match both elements.

```js
// Wrong (legacy): N(data).grid(".pagination"); N(data).pagination({ context: ".pagination" });
N([]).grid("#empGrid");
N([]).pagination({ context: "#empPaging" });
```

`bind()` fires `onChange` by default. If `onChange` itself calls `bind(totalCount)`, set `blockOnChangeWhenBind: true` or the two call each other forever.

`countPerPage(n)` and `countPerPageSet(n)` reset `pageNo` to 1, so set `pageNo` after them. None of the setters redraw; call `bind()`.

```js
paging.countPerPage(20).pageNo(3).bind();
```

`currPageNavInfo()` caps `endRowIndex` and `endRowNum` at `totalCount - 1`. In server paging, do not start a new search with `load(paging.currPageNavInfo())`: before the first response `totalCount` is `0`, so `endRowNum` is `0` and a row-number (`ROWNUM`, `ROW_NUMBER()`) query returns nothing, and on later searches `endRowNum` is capped by the previous search's total. Only the `LIMIT` / `OFFSET` style (`countPerPage` rows from `startRowIndex`) works with that call; otherwise build the page-1 request yourself, as in the last example.[^ui]

Neither `data` nor `totalCount` is required (the legacy guide said both were); `totalCount` defaults to `0`.

# Known issues

* **`new N.pagination(undefined, opts)` throws** - Actual: the constructor reads `options.data.length` before merging `opts`, so an `undefined` or `null` first argument raises a TypeError. Likely intent: data is optional. Workaround: pass `[]` (the plugin form always passes a collection).[^ui]
* **`opts.data` does not set `totalCount`** - Actual: only the first constructor argument sets `totalCount`; rows given as `{ data: rows }` leave it at `0`, so there is one page and `selData` is `[]`. Likely intent: same as the first argument. Workaround: use `N(rows).pagination(...)` or `bind(rows)`.[^ui]
* **The disabled last link fires `onChange` when there are no pages** - Actual: with `totalCount: 0`, `pageCount` is `0` and the last-link handler only checks `pageNo !== pageCount`, so a click sets `pageNo` to `0`, redraws link `1` and clicks it; the page handler then sets `pageNo` back to `1` and calls `onChange` (not blocked by `blockOnChangeWhenBind`, which only covers `bind()`). Likely intent: a disabled link does nothing. Workaround: return early from `onChange` when `currPageNavInfo.pageCount === 0`, or hide the pagination while there are no rows.[^ui]
* **`pageNo` is not clamped to `pageCount`** - Actual: after `totalCount` shrinks, `bind()` looks for a page link that is not drawn, so no page is active and `onChange` does not fire. Likely intent: fall back to the last page. Workaround: reset with `pageNo(1)` before `bind(newTotal)` when `pageNo() > Math.ceil(newTotal / countPerPage())`.[^ui]

# Examples

## Client-side paging

The whole list is retrieved once and paged in the browser; see Quick start. Start on another page with `pageNo` before `bind()`:

```js
N(rows).pagination({
    context: "#empPaging",
    onChange: function (pageNo, selEle, selData, currPageNavInfo) {
        grid.bind(selData);
    }
}).pageNo(3).bind();
```

## Server-side (SQL) paging

Ask the server for the total count, create the pagination with `totalCount` only, and query each page with the numbers in `currPageNavInfo`. `N(currPageNavInfo).comm(url)` sends every key of the object as a request parameter (see [N.comm](../architecture/communicator.md)).

```js
const grid = N([]).grid("#empGrid");                 // height 0: show the whole page

N.comm("getEmployeeCount.json").submit(function (res) {
    N([]).pagination({
        context: "#empPaging",
        totalCount: res.totalCount,
        onChange: function (pageNo, selEle, selData, currPageNavInfo) {
            N(currPageNavInfo).comm("getEmployeePage.json").submit(function (rows) {
                grid.bind(rows);
            });
        }
    }).bind();                                       // fires onChange for page 1
});
```

The server picks the rows with the 1-based inclusive range or the 0-based offset:

| Server query style | Use |
|---|---|
| Row number between (for example `ROWNUM`, `ROW_NUMBER()`) | `startRowNum` to `endRowNum` |
| `LIMIT` / `OFFSET` | `countPerPage` rows from `startRowIndex` |

When every page response also carries the current total, redraw the links on each response so rows added or deleted by other users are reflected. This costs a redraw per page change; `blockOnChangeWhenBind: true` keeps that `bind()` from firing `onChange` again:

```js
const grid = N([]).grid("#empGrid");
const paging = N([]).pagination({
    context: "#empPaging",
    blockOnChangeWhenBind: true,
    onChange: function (pageNo, selEle, selData, currPageNavInfo) {
        load(currPageNavInfo);
    }
});

function load(navInfo) {
    N(navInfo).comm("getEmployeePage.json").submit(function (rows) {
        paging.bind(rows.length > 0 ? rows[0].totalCount : 0);
        grid.bind(rows);
    });
}

N("#btnSearch").on("click", function () {
    const size = paging.countPerPage();
    paging.pageNo(1);
    // Build page 1 yourself: currPageNavInfo() caps endRowIndex/endRowNum at the previous totalCount - 1
    load({ pageNo: 1, countPerPage: size, startRowIndex: 0, endRowIndex: size - 1, startRowNum: 1, endRowNum: size });
});
```

# Related

- [N.grid](grid.md) and [N.list](list.md) - render the rows of the selected page.
- [N.comm](../architecture/communicator.md) - send `currPageNavInfo` as request parameters.
- [Component model](component-model.md) - instances, option precedence and global event handlers.
- [Search, grid and paging template](../examples/template/search-grid-paging.md) - a complete paged screen with Natural-TEMPLATE.
- [Configuration](../setup/configuration.md) - where `N.context.attr("ui").pagination` is set.

[^ui]: NU.pagination implementation
[^ui-plugin]: NU.prototype.pagination jQuery plugin wrapper
