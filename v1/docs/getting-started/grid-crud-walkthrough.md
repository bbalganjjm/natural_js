---
type: Guide
title: Grid CRUD walkthrough
description: Tutorial that adds a search, add, delete and save page to the N.docs frame with N.select, N.form, N.grid, N.button, N.alert, N.notify and N.comm.
tags: [project, getting-started, grid, crud]
sources:
  - id: grid
    resource: ../../src/natural.ui.js
    title: NU.grid implementation (template clone, options)
    symbol: NU.grid
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 3ba583d8d43c
  - id: grid-check
    resource: ../../src/natural.ui.js
    title: NU.grid.prototype.check
    symbol: NU.grid.prototype.check
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: f635156f959c
  - id: grid-remove
    resource: ../../src/natural.ui.js
    title: NU.grid.prototype.remove
    symbol: NU.grid.prototype.remove
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 4d6ba9f4af77
  - id: grid-template
    resource: ../../src/natural.ui.js
    title: NU.grid.prototype.contextBodyTemplate
    symbol: NU.grid.prototype.contextBodyTemplate
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 6a6481f7dbe0
  - id: form
    resource: ../../src/natural.ui.js
    title: NU.form implementation
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: form-add
    resource: ../../src/natural.ui.js
    title: NU.form.prototype.add (new row from the current input values)
    symbol: NU.form.prototype.add
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 9aeb290ddee2
  - id: todata
    resource: ../../src/natural.core.js
    title: NC.element.toData (input values to a row object)
    symbol: NC.element.toData
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 82af7c87406a
  - id: select
    resource: ../../src/natural.ui.js
    title: NU.select implementation (key and val defaults, radio generation)
    symbol: NU.select
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 8518b356a7d1
  - id: validator
    resource: ../../src/natural.data.js
    title: ND.validator implementation (combined rule names, alphabet_integer pattern, empty-value skip)
    symbol: ND.validator
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 3783dcab12fc
  - id: button
    resource: ../../src/natural.ui.js
    title: NU.button implementation
    symbol: NU.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c3c35975533f
  - id: alert
    resource: ../../src/natural.ui.js
    title: NU.alert implementation (html option)
    symbol: NU.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5933b105d560
  - id: notify
    resource: ../../src/natural.ui.shell.js
    title: NUS.notify implementation (static add)
    symbol: NUS.notify
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: 00af5ad03855
  - id: comm
    resource: ../../src/natural.architecture.js
    title: NA.comm constructor
    symbol: NA.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 40c48fda4ea0
  - id: request
    resource: ../../src/natural.architecture.js
    title: NA.comm.request (data serialization, dataIsArray, GET query)
    symbol: NA.comm.request
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: b2f7caecba91
  - id: submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (urlSync check)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: cont
    resource: ../../src/natural.architecture.js
    title: NA.cont
    symbol: NA.cont
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 8c6c783164aa
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-GETTINGSTARTED.md
    title: Legacy getting started guide, tutorial part (removed)
generated: { by: codex/gpt-6-sol, at: 2026-09-24T05:37:38Z }
---

This tutorial adds a "Grid CRUD" document to the frame from [SPA frame with N.docs](spa-frame-with-docs.md): a search form, a button bar and an editable grid that retrieves, adds, deletes and saves rows. It uses [N.select](../ui/select.md) for code lists, [N.form](../ui/form.md) for the search conditions, [N.grid](../ui/grid.md) for the result, [N.button](../ui/button.md), [N.alert](../ui/alert.md) and [N.notify](../ui-shell/notify.md) for the UI, and [N.comm](../architecture/communicator.md) for the server calls.

# Goal

A menu entry "Grid CRUD" that opens `html/contents/page6.html`, where Search loads rows into a fixed-header grid, New adds an empty row, Delete marks the checked rows, and Save validates and sends only the changed rows with their `rowStatus`.

# Prerequisites

- The frame from [SPA frame with N.docs](spa-frame-with-docs.md) (`index.html`, `html/index/lefter.html`, the shipped `natural.config.js` values).
- `data.json` from [Your first page](first-page.md), copied to the project root (next to `index.html`).
- A static HTTP server for the project folder.

# Steps

## 1. Add the menu entry

In `html/index/lefter.html`, add a last item to the menu list:

```html
<ul class="menu">
    <li><a href="html/contents/page1.html" data-docid="page1">MENU-1</a></li>
    <li><a href="html/contents/page2.html" data-docid="page2">MENU-2</a></li>
    <li><a href="html/contents/page3.html" data-docid="page3">MENU-3</a></li>
    <li><a href="html/contents/page4.html" data-docid="page4">MENU-4</a></li>
    <li><a href="html/contents/page5.html" data-docid="page5">MENU-5</a></li>
    <li><a href="html/contents/page6.html" data-docid="page6">Grid CRUD</a></li>
</ul>
```

The menu's click handler already opens any entry with `add(docId, docNm, { url })`.

## 2. Check the sample data

The grid binds the rows of `data.json`: every property name (`name`, `email`, `eyeColor`, `age`, `registered`, `isActive`) is the `id` of an element in the grid's row template. Keep the values as strings, `registered` as `yyyyMMdd` digits (the datepicker created by the `date` format rule writes that form back) and `isActive` as `"Y"` / `"N"` (the shipped `core.sgChkdVal` / `sgUnChkdVal` of a single checkbox). See Pitfalls for why numbers are avoided.

## 3. Write the view

Create `html/contents/page6.html` with the style and the View:

```html
<style>
    .page6 {
        padding: 15px;
    }
    .page6 .search-conditions {
        border: 1px solid var(--md-sys-color-outline-variant);
        padding: 10px;
    }
    .page6 .search-conditions .field {
        margin-right: 40px;
    }
    .page6 .search-conditions input {
        margin-left: 10px;
    }
    .page6 .buttons {
        padding: 10px;
        text-align: right;
    }
    .page6 .result input[type=text] {
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
        border: 1px solid var(--md-sys-color-outline-variant);
        box-sizing: border-box;
    }
</style>

<article class="page6">

    <div class="search-conditions">
        <label class="field">Name<input id="name" type="text" data-validate='[["alphabet+integer"]]'></label>
        <span class="field">Gender<input id="gender" type="radio"></span>
    </div>

    <div class="buttons">
        <button id="btnAdd" type="button" data-opts='{ "size": "small", "color": "primary_container", "type": "filled" }'>New</button>
        <button id="btnDelete" type="button" data-opts='{ "size": "small", "color": "primary_container", "type": "filled" }'>Delete</button>
        <button id="btnSave" type="button" data-opts='{ "size": "small", "color": "primary_container", "type": "filled" }'>Save</button>
        <button id="btnSearch" type="button" data-opts='{ "size": "small", "color": "primary", "type": "filled" }'>Search</button>
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
                    <th><input id="checkAll" type="checkbox" title="Check all"></th>
                    <th>Name</th>
                    <th data-filter="true">Email</th>
                    <th data-filter="true">Eye color</th>
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
```

- `.search-conditions` becomes an `N.form`: its `id` elements are the search parameters. `data-validate` rules come from [N.validator](../data/validator.md); `alphabet+integer` (run as the `alphabet_integer` rule) allows Latin letters, digits and whitespace, and also `-` and `?`; an empty value passes because the rule list has no `required`.[^validator]
- The radio input is a template: `N.select` turns it into the radio of the first code (it keeps `id="gender"`) and clones it, without the `id`, for every further code. Each radio is wrapped in its own `label` inside a generated `form`, so the template sits in a `span`, not in a `label`.[^select]
- `.buttons` holds the commands; `data-opts` carries the [N.button](../ui/button.md) style options.
- The `table` becomes an `N.grid`: `thead` holds the titles (`data-filter="true"` adds a value filter to that column), the single `tbody` is the row template whose `id` elements bind to row properties, and `.checkAllTarget` is the row checkbox controlled by `#checkAll`.
- `data-format='[["date", 8, "date"]]'` shows `yyyyMMdd` digits as a date and attaches an [N.datepicker](../ui/datepicker.md) to the input; see [N.formatter](../data/formatter.md).

## 4. Add the controller skeleton

Append the script to `page6.html`, right after the View:

```html
<script type="text/javascript">
(function () {

    const cont = N(".page6").cont({
        init: function (view, request) {
            cont.initComponents();
            cont.bindEvents();
        },
        initComponents: function () {},
        bindEvents: function () {}
    });

})();
</script>
```

`N(".page6").cont(obj)` returns `obj` itself with `obj.view` set, so the other functions reach the view as `cont.view` and store component instances on `cont`.[^cont] `N.docs` calls `init` once, after it inserted the page.

## 5. Bind the code lists with N.select

```js
initComponents: function () {
    cont.eyeColor = N([
        { name: "Blue", code: "blue" },
        { name: "Brown", code: "brown" },
        { name: "Green", code: "green" }
    ]).select({
        context: N("#eyeColor", cont.view),
        key: "name",     // option text
        val: "code"      // option value = the value stored in the rows
    }).bind();

    cont.gender = N([
        { name: "Female", code: "female" },
        { name: "Male", code: "male" }
    ]).select({
        context: N("#gender", cont.view),
        key: "name",
        val: "code"
    }).bind();

    // ... steps 6 to 8
}
```

- `key` and `val` default to `null`, and the shipped configuration sets no `ui.select`, so both must be passed.[^select]
- `bind()` renders the `option` elements (after the original empty option) and, for the radio template, one radio per row, each named `gender` after the template's `id`.
- Order matters: the `eyeColor` select lives in the grid's row template, and the grid copies that template when it is created, so bind it before step 7. Bind the radio group before step 6, because `add()` reads the inputs that exist at that moment.[^grid][^form-add]

When the lists come from the server, fetch them first and create the components in the callback, in the same order:

```js
initComponents: function () {
    N.comm({ url: "codes.json", type: "GET" }).submit(function (codes) {
        cont.eyeColor = N(codes.eyeColorList).select({ context: N("#eyeColor", cont.view), key: "codeName", val: "codeValue" }).bind();
        cont.gender = N(codes.genderList).select({ context: N("#gender", cont.view), key: "codeName", val: "codeValue" }).bind();
        // then N.form (step 6) and N.grid (step 7)
    });
    // N.button (step 8)
}
```

```json
{
  "eyeColorList": [
    { "codeName": "Blue", "codeValue": "blue" },
    { "codeName": "Brown", "codeValue": "brown" },
    { "codeName": "Green", "codeValue": "green" }
  ],
  "genderList": [
    { "codeName": "Female", "codeValue": "female" },
    { "codeName": "Male", "codeValue": "male" }
  ]
}
```

## 6. Create the search form with N.form

```js
cont.form = N([]).form({ context: N(".search-conditions", cont.view) }).add();
```

- `N([]).form(opts)` returns the `N.form` instance; the plugin takes one argument, so `context` goes inside the options object.
- `add()` builds a row from the current values of the inputs in the context, sets `rowStatus: "insert"`, inserts it and binds it, which also starts validation on `#name`.[^form-add][^todata] Right after it, `cont.form.data()` returns:

```json
[{ "name": "", "gender": "", "rowStatus": "insert" }]
```

Typing in `#name` (on focusout or Enter) and clicking a radio write the values into that row.

## 7. Create the grid with N.grid

```js
cont.grid = N([]).grid({
    context: N(".grid", cont.view),
    height: 300,                    // fixed header, the body scrolls at 300 px
    resizable: true,                // drag column borders in the header
    sortable: true,                 // click a header to sort
    checkAll: "#checkAll",          // header checkbox ...
    checkAllTarget: ".checkAllTarget" // ... that checks the row checkboxes
}).bind();
```

- The constructor copies the `tbody` as the row template, builds the fixed header and wires sorting, resizing, filtering and check-all. It renders nothing; `bind()` without rows renders one row with the grid's `empty` message.[^grid]
- Every rendered row is an `N.form`, so edits set `rowStatus: "update"`, run the `data-validate` rules and apply `data-format`.
- `bind(rows)` renders asynchronously (one row per `createRowDelay` ms, scroll paging of 100 rows); code that needs the rendered rows belongs in the `onBind` event. All options: [N.grid](../ui/grid.md).

## 8. Style the buttons with N.button

```js
N(".buttons > button", cont.view).button();
```

The plugin creates one `N.button` instance per element from its `data-opts` and returns the jQuery collection.[^button] Read an instance with `N("#btnSave", cont.view).instance("button")`, for example to `disable()` it during a request.

## 9. Search

```js
bindEvents: function () {
    N("#btnSearch", cont.view).on("click", function (e) {
        if (cont.form.validate()) {
            N(cont.form.data(true)).comm({
                url: "data.json",
                type: "GET"              // static file demo; a real API keeps the default POST
            }).submit(function (data) {
                cont.grid.bind(data);
            });
        }
    });

    // ... steps 10 to 12
}
```

- `cont.form.validate()` runs every rule bound in the form and returns `false` (with a tooltip on the input) when one fails.
- `cont.form.data(true)` returns `[row]`: the bound row only, including its `rowStatus`.
- `N(array).comm(opts)` sends the first object of the array as JSON.[^request] With `type: "GET"` the JSON becomes the query string `q=<encodeURI(json)>`; the static server ignores it and always returns every row of `data.json`. With the default `POST`, the server receives the JSON as the request body.
- The callback receives the parsed rows; `cont.grid.bind(data)` replaces the grid's data and clears the sort indicator, the filter panels and the check-all box.

## 10. New

```js
N("#btnAdd", cont.view).on("click", function (e) {
    cont.grid.add();
});
```

`add()` creates a row from the template's input values with `rowStatus: "insert"`. It inserts it at the top (`addTop` defaults to `true`) and, because `height` is above 0, scrolls to it. Use `add(data[, row])` to pre-fill values or choose the position; the data comes first.

## 11. Delete

```js
N("#btnDelete", cont.view).on("click", function (e) {
    const checkedRows = cont.grid.check();
    if (checkedRows.length > 0) {
        N(window).alert({
            msg: "Delete the checked rows?<br>Nothing is deleted on the server until you click Save.",
            html: true,
            confirm: true,
            onOk: function () {
                checkedRows.sort(function (a, b) { return b - a; }).forEach(function (row) {
                    cont.grid.remove(row);
                });
            }
        }).show();
    } else {
        N(window).alert("No rows are checked.").show();
    }
});
```

- `check()` without arguments returns the indexes of the rendered rows whose `.checkAllTarget` checkbox is checked.[^grid-check]
- `remove(row)` drops a row whose `rowStatus` is `"insert"` from the data and the DOM; any other row gets `rowStatus: "delete"` and the class `row_data_deleted__`, so Save can send it.[^grid-remove] Remove one index at a time from the highest down; see Pitfalls.
- `N(window).alert(opts)` builds a dialog in the active document (`N.docs` has set `alert.container`), `show()` opens it, and `onOk` runs on OK; returning anything but `0` closes it. The message is inserted as text unless `html: true`.[^alert]

## 12. Save

```js
N("#btnSave", cont.view).on("click", function (e) {
    if (cont.grid.data("modified").length === 0) {
        N.notify.add("No data has been changed.");
        return;
    }

    if (cont.grid.validate()) {
        N(window).alert({
            msg: "Save the changes?",
            confirm: true,
            onOk: function () {
                N(cont.grid.data("modified")).comm({
                    url: "data.json",       // replace with the save API
                    type: "GET",            // static file demo; a real API keeps the default POST
                    dataIsArray: true       // send every modified row, not only the first
                }).submit(function (data) {
                    N.notify.add("Demo request completed; data.json was not changed.");
                    N("#btnSearch", cont.view).trigger("click");
                });
            }
        }).show();
    }
});
```

- `data("modified")` returns the rows that have any `rowStatus`: `"insert"` (added), `"update"` (edited in an input or with `grid.val(row, key, value)`) or `"delete"` (removed).
- `validate()` checks the inserted and updated rows and scrolls to the last failure.
- `dataIsArray: true` makes `N.comm` send the whole array; without it only the first row is sent.[^request]
- This static-file demo sends the modified rows as a GET query to `data.json`. The server returns the original file and persists nothing, so the callback reports a demo request rather than a save. Replace the URL with a real API and use POST to persist changes. That API receives a JSON array in the request body, inserts, updates or deletes each row according to its `rowStatus`, and answers with JSON before the callback reloads the grid.
- `N.notify.add(msg)` shows a self-closing message at the top right of the window.[^notify]

## 13. Assemble the controller

The complete script of `page6.html`:

```html
<script type="text/javascript">
(function () {

    const cont = N(".page6").cont({
        init: function (view, request) {
            cont.initComponents();
            cont.bindEvents();
        },
        initComponents: function () {
            cont.eyeColor = N([
                { name: "Blue", code: "blue" },
                { name: "Brown", code: "brown" },
                { name: "Green", code: "green" }
            ]).select({ context: N("#eyeColor", cont.view), key: "name", val: "code" }).bind();

            cont.gender = N([
                { name: "Female", code: "female" },
                { name: "Male", code: "male" }
            ]).select({ context: N("#gender", cont.view), key: "name", val: "code" }).bind();

            cont.form = N([]).form({ context: N(".search-conditions", cont.view) }).add();

            cont.grid = N([]).grid({
                context: N(".grid", cont.view),
                height: 300,
                resizable: true,
                sortable: true,
                checkAll: "#checkAll",
                checkAllTarget: ".checkAllTarget"
            }).bind();

            N(".buttons > button", cont.view).button();
        },
        bindEvents: function () {
            N("#btnSearch", cont.view).on("click", function (e) {
                if (cont.form.validate()) {
                    N(cont.form.data(true)).comm({ url: "data.json", type: "GET" }).submit(function (data) {
                        cont.grid.bind(data);
                    });
                }
            });

            N("#btnAdd", cont.view).on("click", function (e) {
                cont.grid.add();
            });

            N("#btnDelete", cont.view).on("click", function (e) {
                const checkedRows = cont.grid.check();
                if (checkedRows.length > 0) {
                    N(window).alert({
                        msg: "Delete the checked rows?<br>Nothing is deleted on the server until you click Save.",
                        html: true,
                        confirm: true,
                        onOk: function () {
                            checkedRows.sort(function (a, b) { return b - a; }).forEach(function (row) {
                                cont.grid.remove(row);
                            });
                        }
                    }).show();
                } else {
                    N(window).alert("No rows are checked.").show();
                }
            });

            N("#btnSave", cont.view).on("click", function (e) {
                if (cont.grid.data("modified").length === 0) {
                    N.notify.add("No data has been changed.");
                    return;
                }
                if (cont.grid.validate()) {
                    N(window).alert({
                        msg: "Save the changes?",
                        confirm: true,
                        onOk: function () {
                            N(cont.grid.data("modified")).comm({
                                url: "data.json",
                                type: "GET",
                                dataIsArray: true
                            }).submit(function (data) {
                                N.notify.add("Demo request completed; data.json was not changed.");
                                N("#btnSearch", cont.view).trigger("click");
                            });
                        }
                    }).show();
                }
            });
        }
    });

})();
</script>
```

# Verify

- The "Grid CRUD" menu entry opens a tab with the search box, four styled buttons and an empty grid showing the `empty` message.
- Search fills the grid with the rows of `data.json`; the network panel shows `data.json?q=...` with GET. Header clicks sort, and the filter buttons appear on the `data-filter` columns.
- New inserts an empty row at the top. Save then shows validation tooltips on its required fields.
- Editing a cell marks the input with `data_changed__`; Save asks for confirmation, sends the modified rows, reports that the demo request completed without changing `data.json`, and searches again. A real save needs a writable API.
- Checking rows and clicking Delete removes inserted rows and marks the others with `row_data_deleted__`.
- In the console, `N(".page6").instance("cont").grid.data("modified")` lists the pending changes.

# Pitfalls

`N.select` has no default `key` / `val` property names; without them every option reads `undefined`. The `val` values must also equal the values stored in the rows, or each row's select shows the empty option. The legacy sample had both problems.[^select]

```js
// Wrong (legacy): N([{ key: "blue", val: "EYE_COLOR_01" }]).select({ context: N("#eyeColor", cont.view) }).bind();
N([{ name: "Blue", code: "blue" }]).select({ context: N("#eyeColor", cont.view), key: "name", val: "code" }).bind();
```

A select inside the grid's row template must be filled before the grid is created: the constructor copies the `tbody` then, and rows are rendered from that copy. Binding the original element later changes nothing in the rows. Create the components after the code request returns (step 5), or bind the list to the copy with `contextBodyTemplate`, using a template select that was never bound before.[^grid][^grid-template]

```js
// Wrong (legacy): cont.eyeColor = N([]).select({ context: N("#eyeColor", cont.view), key: "codeName", val: "codeValue" }); /* grid created */ N.comm("data/url.json").submit(function (data) { cont.eyeColor.bind(data["eyeColorList"]); });
N(codes.eyeColorList).select({ context: cont.grid.contextBodyTemplate("#eyeColor"), key: "codeName", val: "codeValue" }).bind();
```

`remove([...])` sorts the indexes as strings, so with multi-digit indexes an inserted row spliced first shifts the later indexes and the wrong rows are removed or marked. Remove one index at a time, highest first (see N.grid Known issues).[^grid-remove]

```js
// Wrong (legacy): cont.grid.remove(checkedIndexs);
checkedIndexs.sort(function (a, b) { return b - a; }).forEach(function (i) { cont.grid.remove(i); });
```

`N.alert` inserts `msg` with `.text()` unless `html` is `true`, so markup such as `<br/>` shows up literally.[^alert]

```js
// Wrong (legacy): N(window).alert({ msg: "Are you sure you want to delete?<br/>It will not be saved in DBMS until you press the Save button.", confirm: true, onOk: fn }).show();
N(window).alert({ msg: "Delete the checked rows?<br>Nothing is deleted on the server until you click Save.", html: true, confirm: true, onOk: fn }).show();
```

`N.select` wraps every generated radio in its own `label` (inside a generated `form`), so a template radio inside a `label` produces nested labels, which HTML does not allow.[^select]

```html
// Wrong (legacy): <label>Gender<input id="gender" type="radio"></label>
<span class="field">Gender<input id="gender" type="radio"></span>
```

- `alphabet+integer` does not reject `-` or `?`: the `alphabet_integer` pattern `/^[a-z-?\d\s]+$/i` lists both literally. When they must be rejected, use `data-validate='[["regexp", "^[a-z\\d\\s]+$", "i"]]'`; a failure shows the generic `global` validator message because the shipped messages have no `regexp` entry. See [N.validator](../data/validator.md).[^validator]
- `type: "GET"` is only for the static `data.json`. With GET, `N.comm` puts the JSON into the URL with `encodeURI`, which does not escape `&`, `=` or `+` in values (see [N.comm.request](../architecture/request.md) Known issues) and makes long URLs for many rows. Send searches and saves to a real API with the default POST.
- Numbers and booleans bound to text inputs are compared with the input's string value on focusout, so tabbing through a row marks it `"update"` and adds it to `data("modified")`. The sample data uses strings; for server data convert such values before `bind()`, for example in `rowHandlerBeforeBind`. See [N.grid](../ui/grid.md) Known issues.
- While a column filter is active the grid's data holds only the visible rows, so `data("modified")` and `validate()` skip filtered-out changes. Clear the filter (search again) before saving.
- `validate()` checks only inserted and updated rows (and rows already marked invalid); untouched rows are not validated.
- The check-all box can only check: clearing it does not clear the row boxes (N.grid Known issues).
- With `<a href="#">` buttons, call `e.preventDefault()` in every handler. Following `#` changes `location.href`, and `N.comm` drops the response of any data request created before the change (`urlSync`, on by default) without calling its callback.[^submit]
- Create the components in the order select, form, grid. The form reads the radio group when `add()` runs, and the grid copies its template when it is constructed.
- Code placed right after `cont.grid.bind(data)` runs before most rows exist; use the grid's `onBind` event for work on rendered rows.

# Next

- [N.grid](../ui/grid.md) - every option, `data(rowStatus)`, `add`, `remove`, `validate`, events and Known issues.
- [N.form](../ui/form.md) and [N.select](../ui/select.md) - binding rules for inputs, selects, radios and checkboxes.
- [N.alert](../ui/alert.md) and [N.notify](../ui-shell/notify.md) - confirmation dialogs and global messages.
- [N.validator](../data/validator.md) and [N.formatter](../data/formatter.md) - the `data-validate` and `data-format` rule catalogs.
- [Grid CRUD with fixed header](../examples/grid-crud-fixed-header.md) and [Grid CRUD, list type](../examples/grid-crud-list-type.md) - complete CRUD examples.
- [N.comm](../architecture/communicator.md) - request options, `dataIsArray`, error handling.

[^grid]: NU.grid implementation (template clone, options)
[^grid-check]: NU.grid.prototype.check
[^grid-remove]: NU.grid.prototype.remove
[^grid-template]: NU.grid.prototype.contextBodyTemplate
[^form-add]: NU.form.prototype.add (new row from the current input values)
[^todata]: NC.element.toData (input values to a row object)
[^select]: NU.select implementation (key and val defaults, radio generation)
[^validator]: ND.validator implementation (combined rule names, alphabet_integer pattern, empty-value skip)
[^button]: NU.button implementation
[^alert]: NU.alert implementation (html option)
[^notify]: NUS.notify implementation (static add)
[^request]: NA.comm.request (data serialization, dataIsArray, GET query)
[^submit]: NA.comm.submit (urlSync check)
[^cont]: NA.cont
