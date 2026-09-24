---
type: Example
title: Retrieve a data list
description: Block page that validates an N.form search box and loads the matching rows from the server into a sortable, filterable fixed-header N.grid.
tags: [ui, example, search, grid, form]
sources:
  - id: cont
    resource: ../../src/natural.architecture.js
    title: NA.cont controller registration
    symbol: NA.cont
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 8c6c783164aa
  - id: comm
    resource: ../../src/natural.architecture.js
    title: NA.comm communicator
    symbol: NA.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 40c48fda4ea0
  - id: request
    resource: ../../src/natural.architecture.js
    title: NA.comm.request defaults and body serialization
    symbol: NA.comm.request
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: b2f7caecba91
  - id: form
    resource: ../../src/natural.ui.js
    title: NU.form implementation
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: grid
    resource: ../../src/natural.ui.js
    title: NU.grid implementation
    symbol: NU.grid
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 3ba583d8d43c
  - id: select
    resource: ../../src/natural.ui.js
    title: NU.select implementation
    symbol: NU.select
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 8518b356a7d1
  - id: button
    resource: ../../src/natural.ui.js
    title: NU.button implementation
    symbol: NU.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c3c35975533f
  - id: filter
    resource: ../../src/natural.data.js
    title: ND.data.filter (used by N().datafilter)
    symbol: ND.data.filter
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 8a170452c193
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-EXAMPLES.md
    title: Legacy examples guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

A search box ([N.form](../ui/form.md)) and a result list ([N.grid](../ui/grid.md)) on one block page: the page loads code lists, validates the search conditions and binds the rows returned by the server to the grid. Start here for any "search, then show a list" screen.

# Scenario

The block page `exap0100.html` is loaded into the application frame (for example by [N.docs](../ui-shell/documents.md) or `N("#container").comm("exap0100.html").submit()`). When it opens it:

1. requests the Gender and Eye color code lists and renders them as a radio group and a select;
2. styles the Search link, creates the search form with one empty row, and creates an empty fixed-header grid;
3. on Search, validates the conditions, posts them, and binds the result rows to the grid, where the user can sort, filter and resize columns without another request.

# Components used

| Component | Role on this page | Reference |
|---|---|---|
| `N(".exap0100").cont({...})` | Controller; `init` runs after the page is inserted | [N.cont](../architecture/controller.md) |
| `N(obj).comm(url).submit(callback)` | Loads the code lists and the search result | [N.comm](../architecture/communicator.md) |
| `N(rows).datafilter(fn)` | Splits the code list by group | [N.data](../data/data-utilities.md) |
| `N(rows).select({ context, key, val }).bind()` | Renders the Gender radios and the Eye color options | [N.select](../ui/select.md) |
| `N(elements).button(opts)` | Styles the Search link | [N.button](../ui/button.md) |
| `N([]).form({ context }).add()` | Holds the search conditions as one row | [N.form](../ui/form.md) |
| `N([]).grid({ context, height, ... }).bind()` | Shows the result rows | [N.grid](../ui/grid.md) |

# View

```html
<article class="exap0100">
    <div class="searchBox">
        <ul>
            <li class="inputs">
                <label for="name">Name</label> <input id="name" type="text" data-validate='[["alphabet+integer"]]'>
                <span>Gender</span> <input id="gender" type="radio">
                <label for="eyeColor">Eye color</label> <select id="eyeColor"><option value="">All</option></select>
            </li>
            <li class="buttons">
                <a id="btnSearch" href="#">Search</a>
            </li>
        </ul>
    </div>

    <table id="grid" style="width: 100%;">
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
                <th>Eye color</th>
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
                <td id="age" style="text-align: right;"></td>
                <td id="company"></td>
                <td style="text-align: center;"><span id="isActive"></span></td>
            </tr>
        </tbody>
    </table>
</article>
```

The `article` is the View: a top-level element with a page-unique class (see [CVC pattern](../architecture/cvc-pattern.md)). The `tbody` is the grid's row template; each cell's `id` names the row property it shows.

# Controller

Put this script in a `<script type="text/javascript">` element right after `</article>` in the same file.

```js
(function () {
    const cont = N(".exap0100").cont({
        init: function (view, request) {
            cont.setCodes(["gender", "eyeColor"], function () {
                cont.setComponents();
                cont.setEvents();
            });
        },
        setCodes: function (groups, callback) {
            N({ codes: groups }).comm("code/getList.json").submit(function (data, request) {
                groups.forEach(function (group) {
                    N(data).datafilter(function (row) {
                        return row.group === group;
                    }).select({
                        context: N(".searchBox #" + group, cont.view),
                        key: "name",
                        val: "value"
                    }).bind();
                });
                callback();
            });
        },
        setComponents: function () {
            N(".buttons a", cont.view).button({ size: "medium", color: "primary", type: "filled" });

            cont.form = N([]).form({
                context: N(".searchBox .inputs", cont.view)
            }).add();

            cont.grid = N([]).grid({
                context: N("#grid", cont.view),
                height: 350,
                resizable: true,
                sortable: true,
                filter: true
            }).bind();
        },
        setEvents: function () {
            N("#btnSearch", cont.view).on("click", function (e) {
                e.preventDefault();
                cont.search();
            });
        },
        search: function () {
            if (cont.form.validate()) {
                N(cont.form.data(true)).comm("user/getList.json").submit(function (data, request) {
                    cont.grid.bind(data);
                });
            }
        }
    });
})();
```

# Server contract

The URLs and field names are this example's own contract; any names work as long as the element `id`s match the row keys and `key` / `val` name the code fields.

| Endpoint | Request | Response |
|---|---|---|
| `code/getList.json` | `POST`, JSON body `{"codes":["gender","eyeColor"]}` | JSON array of code rows for every requested group, for example `[{ "group": "gender", "name": "Male", "value": "male" }, { "group": "eyeColor", "name": "Blue", "value": "blue" }]` |
| `user/getList.json` | `POST`, JSON body: the search row, for example `{"name":"Kim","gender":"female","eyeColor":"","rowStatus":"insert"}` | JSON array of rows with the template keys: `index`, `name`, `email`, `gender`, `eyeColor`, `age`, `company`, `isActive` |

Both calls use the request defaults `type: "POST"` and `contentType: "application/json; charset=utf-8"`, and expect JSON back (`dataType: "json"`).[^request] See [N.comm.request](../architecture/request.md).

# How it works

- **Order of creation.** `init` creates the components only after the code list has arrived. `N.select` must generate the Gender radios before `N.form` binds, because the form looks up its elements on its first bind and caches them (`cache: true`).[^form]
- **Code lists.** `N(data).datafilter(fn)` returns a new N collection of the rows of one group.[^filter] `select({ context, key, val })` renders them: for the `select` it keeps the `All` option and appends one `option` per row; for the radio it clones the template input once per row and gives every clone `name="gender"`.[^select]
- **Search row.** `N([]).form({ context }).add()` builds a row from the current input values, `{ name: "", gender: "", eyeColor: "", rowStatus: "insert" }`, and binds it. Typing (on focusout), choosing an option (on change) and clicking a radio write into that row.[^form]
- **Validation.** `cont.form.validate()` runs the `data-validate` rules of every bound input (`alphabet+integer`: letters, digits and whitespace) and returns `false` after showing a tooltip next to the failing input. See [N.validator](../data/validator.md).
- **Request body.** `cont.form.data(true)` returns `[row]`. `N([row]).comm(url)` serializes only the first object (`dataIsArray` defaults to `false`), so the body is the search row as JSON.[^request]
- **Grid layout.** `height: 350` above `0` makes a fixed-header grid: the header stays in place, the body scrolls at 350 px and only 100 rows (`scrollPaging.size`) are rendered per scroll step. `resizable: true` moves the `colgroup` widths onto the `th` cells and lets the user drag them. `sortable` and `filter` sort and filter the loaded rows in the browser.[^grid]
- **Binding.** `cont.grid.bind(data)` replaces the grid data and renders rows asynchronously; the first `bind()` without data shows the empty-list message. Cells that are not inputs (`td`, `span`) receive the value with `.text()`.[^grid]

# Variations

Send only the search keys (no `rowStatus`):

```js
N(cont.form.data(true, "name", "gender", "eyeColor")).comm("user/getList.json").submit(function (data) {
    cont.grid.bind(data);
});
```

Add a Reset link: create the form with `revert: true` and restore the first row.

```js
cont.form = N([]).form({ context: N(".searchBox .inputs", cont.view), revert: true }).add();

N("#btnReset", cont.view).on("click", function (e) {
    e.preventDefault();
    cont.form.revert();   // back to the values captured by add()
});
```

- **List-type grid**: leave out `height` (default `0`); every row is rendered and the page scrolls. See [Grid CRUD (list type)](grid-crud-list-type.md).
- **Search on open**: call `cont.search()` at the end of the `setCodes` callback.
- **Server-side paging**: combine the grid with [N.pagination](../ui/pagination.md).
- **Error handling**: register `.error(function (e, request, xhr, textStatus) { ... })` before `.submit(...)`; see [N.comm](../architecture/communicator.md).

# Pitfalls

Write JSON in `data-validate` (and `data-format`) inside a single-quoted attribute. Backslashes do not escape quotes in HTML, so the legacy markup ends the attribute value at the first inner `"`.

```html
// Wrong (legacy): <input id="name" type="text" data-validate="[[\"alphabet+integer\"]]">
<input id="name" type="text" data-validate='[["alphabet+integer"]]'>
```

`N.select` needs `key` (option text) and `val` (option value). The shipped `natural.config.js` defines no `ui.select` defaults, so without them every option and radio label reads `undefined`.[^select] Prefer a function filter: a string condition has all spaces removed and `&&` turned into OR (see [N.data](../data/data-utilities.md)).[^filter]

```js
// Wrong (legacy): N(data).datafilter(`code === '${code}'`).select(N(`.searchBox #${code}`, cont.view)).bind();
N(data).datafilter(function (row) { return row.group === group; })
    .select({ context: N(".searchBox #" + group, cont.view), key: "name", val: "value" })
    .bind();
```

jQuery runs a block page's inline script as a global script, so a top-level `const cont` is declared once per document: loading this page a second time, or another page that also declares `cont` at the top level, throws `SyntaxError: Identifier 'cont' has already been declared`. Keep the declaration inside a function.

```js
// Wrong (legacy): const cont = N(".exap0100").cont({ init: (view, request) => { /* ... */ } });
(function () {
    const cont = N(".exap0100").cont({ init: function (view, request) { /* ... */ } });
})();
```

# Related

- [N.grid](../ui/grid.md) - options, `bind()` and the fixed-header and list layouts.
- [N.form](../ui/form.md) - `add()`, `data(true)` and the element binding rules.
- [N.select](../ui/select.md) - `key`, `val` and radio/checkbox generation.
- [N.comm](../architecture/communicator.md) - `submit` callback arguments and error handlers.
- [Retrieve form data](retrieve-form-data.md) - show one of the listed rows in a detail form.
- [Grid CRUD (fixed header)](grid-crud-fixed-header.md) - the same search box with add, delete and save.

[^request]: NA.comm.request defaults and body serialization
[^form]: NU.form implementation
[^grid]: NU.grid implementation
[^select]: NU.select implementation
[^filter]: ND.data.filter (used by N().datafilter)
