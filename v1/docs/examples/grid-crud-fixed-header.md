---
type: Example
title: Grid CRUD (fixed header)
description: Block page with a search form and a fixed-header N.grid (height above 0, multi-row header) that adds, deletes, validates and saves changed rows in one request.
tags: [ui, example, grid, crud]
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
    title: NA.comm.request defaults and body serialization (dataIsArray)
    symbol: NA.comm.request
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: b2f7caecba91
  - id: grid
    resource: ../../src/natural.ui.js
    title: NU.grid implementation
    symbol: NU.grid
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 3ba583d8d43c
  - id: iteration
    resource: ../../src/natural.ui.js
    title: NU.ui.iteration row rendering and check-all logic
    symbol: NU.ui.iteration
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 67e1562d3c04
  - id: form
    resource: ../../src/natural.ui.js
    title: NU.form implementation (search form and row forms)
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
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
  - id: alert
    resource: ../../src/natural.ui.js
    title: NU.alert implementation
    symbol: NU.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5933b105d560
  - id: notify
    resource: ../../src/natural.ui.shell.js
    title: NUS.notify implementation
    symbol: NUS.notify
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: 00af5ad03855
  - id: message
    resource: ../../src/natural.core.js
    title: NC.message implementation
    symbol: NC.message
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 6818eb3bc817
  - id: vals
    resource: ../../src/natural.core.js
    title: NC.prototype.vals (single checkbox values)
    symbol: NC.prototype.vals
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 4178ea152b93
  - id: njs
    resource: ../../src/natural.js.js
    title: N global and factory installation (only window.N is exported)
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-EXAMPLES.md
    title: Legacy examples guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

Create, read, update and delete directly in an editable [N.grid](../ui/grid.md) with a fixed header: the user edits cells, adds and deletes rows, and Save sends every changed row with its `rowStatus` in one request. The fixed header comes from `height: 350`; the same screen with `height` left at `0` is [Grid CRUD (list type)](grid-crud-list-type.md).

# Scenario

The block page `exap0500.html` has a search box and a grid whose header spans three rows and whose row template spans two. Search loads the rows. Add inserts an empty row at the top, Delete marks the checked rows, Save validates the changed rows, confirms, sends them with `PUT` and reloads the list. Nothing reaches the server before Save.

# Components used

| Component | Role on this page | Reference |
|---|---|---|
| `N(".exap0500").cont({...})` | Controller | [N.cont](../architecture/controller.md) |
| `N(obj).comm(url \| opts).submit(callback)` | Code lists, search, batch save (`dataIsArray: true`) | [N.comm](../architecture/communicator.md), [N.comm.request](../architecture/request.md) |
| `N(rows).select({...}).bind()` | Selects in the search box and in the grid's row template | [N.select](../ui/select.md) |
| `N(elements).button(opts)` | Styles the four links | [N.button](../ui/button.md) |
| `N([]).form({ context }).add()` | Search conditions row | [N.form](../ui/form.md) |
| `N([]).grid({ height: 350, ... })` | `bind`, `add`, `check`, `remove`, `validate`, `data("modified")` | [N.grid](../ui/grid.md) |
| `N(window).alert({...}).show()` | Confirmations and messages | [N.alert](../ui/alert.md) |
| `N.notify.add(msg)` | "No changed data." and the save summary | [N.notify](../ui-shell/notify.md) |
| `N.message.get(resource, key[, vars])` | Texts with `{0}` placeholders | [N.message](../core/message.md) |

# View

```html
<article class="exap0500">
    <div class="searchBox">
        <ul>
            <li class="inputs">
                <label for="name">Name</label> <input id="name" type="text">
                <label for="gender">Gender</label> <select id="gender"><option value="">All</option></select>
                <label for="eyeColor">Eye color</label> <select id="eyeColor"><option value="">All</option></select>
            </li>
            <li class="buttons">
                <a id="btnAdd" href="#">Add</a>
                <a id="btnDelete" href="#">Delete</a>
                <a id="btnSave" href="#">Save</a>
                <a id="btnSearch" href="#">Search</a>
            </li>
        </ul>
    </div>

    <table id="grid" style="width: 100%;">
        <colgroup>
            <col style="width: 40px;">
            <col style="width: 60px;">
            <col style="width: 140px;">
            <col style="width: auto;">
            <col style="width: 110px;">
            <col style="width: 110px;">
            <col style="width: 70px;">
            <col style="width: 130px;">
            <col style="width: 70px;">
        </colgroup>
        <thead>
            <tr>
                <th rowspan="3"><input id="checkAll" type="checkbox" title="Check all"></th>
                <th rowspan="3">Index</th>
                <th colspan="7">Privacy</th>
            </tr>
            <tr>
                <th rowspan="2">Name</th>
                <th>Email</th>
                <th data-filter="true">Gender</th>
                <th data-filter="true">Eye color</th>
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
            <tr>
                <td rowspan="2" style="text-align: center;"><input class="checkAllTarget" type="checkbox"></td>
                <td rowspan="2" id="index" style="text-align: center;"></td>
                <td rowspan="2"><input id="name" type="text" data-validate='[["required"]]'></td>
                <td><input id="email" type="text" data-validate='[["required"], ["email"]]'></td>
                <td><select id="gender" data-validate='[["required"]]'><option value="">Select</option></select></td>
                <td><select id="eyeColor" data-validate='[["required"]]'><option value="">Select</option></select></td>
                <td rowspan="2"><input id="age" type="text" data-validate='[["required"], ["integer"]]'></td>
                <td><input id="registered" type="text" data-format='[["date", 8, "date"]]' data-validate='[["required"]]'></td>
                <td style="text-align: center;"><input id="isActive" type="checkbox"></td>
            </tr>
            <tr>
                <td colspan="3"><textarea id="about"></textarea></td>
                <td colspan="2"><input id="greeting" type="text"></td>
            </tr>
        </tbody>
    </table>
</article>
```

The `tbody` is the row template: every data row is a clone of both `tr` elements. Its cells line up with the header, so each `th` gets the column id of the body cell below it (`Name` gets `name`, `About` gets `about`), which drives sorting, the per-column filters (`th data-filter="true"`) and the `more` tools. The row checkbox has a class but no `id`, so it is not bound to the data.[^grid]

# Controller

Put this script in a `<script type="text/javascript">` element right after `</article>` in the same file.

```js
(function () {
    const cont = N(".exap0500").cont({
        init: function (view, request) {
            cont.setCodes(["gender", "eyeColor"], function () {
                cont.setComponents();
                cont.setEvents();
            });
        },
        setCodes: function (groups, callback) {
            N({ codes: groups }).comm("code/getList.json").submit(function (data, request) {
                groups.forEach(function (group) {
                    const rows = N(data).datafilter(function (row) {
                        return row.group === group;
                    });
                    rows.select({ context: N(".searchBox #" + group, cont.view), key: "name", val: "value" }).bind();
                    rows.select({ context: N("#grid #" + group, cont.view), key: "name", val: "value" }).bind();
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
                resizable: false,
                sortable: true,
                more: true,
                checkAll: "#checkAll",
                checkAllTarget: ".checkAllTarget"
            }).bind();
        },
        setEvents: function () {
            N("#btnSearch", cont.view).on("click", function (e) {
                e.preventDefault();
                cont.search();
            });
            N("#btnAdd", cont.view).on("click", function (e) {
                e.preventDefault();
                cont.grid.add();
            });
            N("#btnDelete", cont.view).on("click", function (e) {
                e.preventDefault();
                cont.deleteChecked();
            });
            N("#btnSave", cont.view).on("click", function (e) {
                e.preventDefault();
                cont.save();
            });
        },
        search: function () {
            if (cont.form.validate()) {
                N(cont.form.data(true)).comm("user/getList.json").submit(function (data, request) {
                    cont.grid.bind(data);
                });
            }
        },
        deleteChecked: function () {
            const checked = cont.grid.check();
            if (checked.length === 0) {
                N(window).alert(N.message.get(cont.messages, "EXAP0500-0004")).show();
                return;
            }
            N(window).alert({
                msg: N.message.get(cont.messages, "EXAP0500-0001"),
                confirm: true,
                onOk: function () {
                    // one index at a time, highest first (see Pitfalls)
                    checked.sort(function (a, b) { return b - a; }).forEach(function (row) {
                        cont.grid.remove(row);
                    });
                }
            }).show();
        },
        save: function () {
            const grid = cont.grid;
            if (grid.data("modified").length === 0) {
                N.notify.add(N.message.get(cont.messages, "EXAP0500-0003"));
                return;
            }
            if (!grid.validate()) {
                return;
            }
            N(window).alert({
                msg: N.message.get(cont.messages, "EXAP0500-0005"),
                confirm: true,
                onOk: function () {
                    const inserted = grid.data("insert").length;
                    const updated = grid.data("update").length;
                    const deleted = grid.data("delete").length;
                    N(grid.data("modified")).comm({
                        url: "user/saveList.json",
                        type: "PUT",
                        dataIsArray: true
                    }).submit(function (data, request) {
                        N.notify.add(N.message.get(cont.messages, "EXAP0500-0002")
                            + N.message.get(cont.messages, "EXAP0500-0006", [inserted])
                            + N.message.get(cont.messages, "EXAP0500-0007", [updated])
                            + N.message.get(cont.messages, "EXAP0500-0008", [deleted]));
                        cont.search();
                    });
                }
            }).show();
        },
        messages: {
            ko_KR: {
                "EXAP0500-0001": "Do you want to delete? It will not be reflected in the DB until you press the save button.",
                "EXAP0500-0002": "Saving is complete.",
                "EXAP0500-0003": "No changed data.",
                "EXAP0500-0004": "No selected row.",
                "EXAP0500-0005": "Do you want to save?",
                "EXAP0500-0006": " - Inserted: {0} rows",
                "EXAP0500-0007": " - Updated: {0} rows",
                "EXAP0500-0008": " - Deleted: {0} rows"
            },
            en_US: {
                "EXAP0500-0001": "Do you want to delete? It will not be reflected in the DB until you press the save button.",
                "EXAP0500-0002": "Saving is complete.",
                "EXAP0500-0003": "No changed data.",
                "EXAP0500-0004": "No selected row.",
                "EXAP0500-0005": "Do you want to save?",
                "EXAP0500-0006": " - Inserted: {0} rows",
                "EXAP0500-0007": " - Updated: {0} rows",
                "EXAP0500-0008": " - Deleted: {0} rows"
            }
        }
    });
})();
```

The `ko_KR` texts are placeholders. `N.message.get(resource, key, vars)` replaces `{0}` with `vars[0]`; pass `vars` as an array.[^message]

# Server contract

| Endpoint | Request | Response |
|---|---|---|
| `code/getList.json` | `POST`, JSON body `{"codes":["gender","eyeColor"]}` | JSON array of `{ "group", "name", "value" }` code rows |
| `user/getList.json` | `POST`, JSON body: the search row, for example `{"name":"","gender":"female","eyeColor":"","rowStatus":"insert"}` | JSON array of rows: `{ "id": "101", "index": "1", "name": "Kim Min-ji", "email": "minji@example.com", "gender": "female", "eyeColor": "blue", "age": "32", "registered": "20140325", "isActive": "Y", "about": "...", "greeting": "..." }` |
| `user/saveList.json` | `PUT`, JSON **array** of the changed rows, each with `"rowStatus"`: `"insert"` (no `id`), `"update"` or `"delete"` | Any JSON value, for example the number of processed rows; the page only reloads the list. An empty `200` body fails JSON parsing (`dataType: "json"`) and goes to the error path |

Keep a key (`id`) in every row so the server can update and delete; it needs no element. Send values that land in text inputs as strings and `isActive` as `"Y"` / `"N"` (see Pitfalls).[^vals]

# How it works

- **Selects before the grid.** The grid constructor clones the `tbody` as its row template, so the code options must be in the template's `select` elements before `N([]).grid(...)` runs; every row then gets them. The search box selects are filled at the same time.[^grid]
- **Fixed header.** `height: 350` above `0` wraps the table: the header moves to a separate table that stays in place, the body scrolls at 350 px, and only 100 rows (`scrollPaging.size`) are rendered per scroll step. `resizable: false` keeps the `colgroup` widths.[^grid]
- **More column.** `more: true` adds a header button that shows and hides columns and a button in each row that opens a detail popup listing every `id` of the row template.[^grid]
- **Rows are forms.** Each rendered `tbody` is an [N.form](../ui/form.md): editing a cell writes the row and sets `rowStatus: "update"` (text inputs only when their rules pass).[^form]
- **Add.** `add()` inserts a new row at the top (`addTop` defaults to `true`) built from the template's input values, with `rowStatus: "insert"`, and scrolls to it.[^grid]
- **Check and delete.** `checkAll` / `checkAllTarget` wire the header checkbox to the row checkboxes; `check()` returns the checked row indexes. `remove(row)` drops a row that has `rowStatus: "insert"` and marks any other row `rowStatus: "delete"` with the `row_data_deleted__` class; deleted rows stay visible until the list is reloaded.[^grid]
- **Save.** `data("modified")` returns every row that has a `rowStatus`. `validate()` checks only rows with `rowStatus` `"insert"` or `"update"` (and rows already showing a failure). `dataIsArray: true` makes the communicator send the whole array; `type: "PUT"` replaces the default `"POST"`.[^grid] [^request]
- **Summary.** The counts are taken before the request with `data("insert")`, `data("update")` and `data("delete")`, then `N.message.get(..., [count])` fills `{0}`.
- **Reload.** `cont.search()` rebinds the grid with fresh rows, which have no `rowStatus`.

# Variations

- **Filter every column**: add `filter: true` instead of `th data-filter="true"` on selected headers.
- **Smaller scroll pages**: `scrollPaging: { size: 50 }`.
- **Undo edits**: create the grid with `revert: true` and call `cont.grid.revert()` (every inserted or updated row) or `cont.grid.revert(row)`.
- **Append instead of prepend**: `addTop: false` adds rows at the end, but also turns scroll paging off for the whole grid.
- **Select a row for a detail form**: `select: true` with `onSelect(row, rowEle, data)`, where `data` is the whole data wrapper; see the master-detail example in [N.form](../ui/form.md).
- **Natural-TEMPLATE version**: [Natural-TEMPLATE search grid CRUD](template/search-grid-crud.md) declares the same components with `p.*` properties.

# Pitfalls

`NA` is not a global at runtime (only `window.N` is exported) and `NA.Objects.Request.HttpMethod` is a TypeScript `const enum`; the legacy expression throws a `ReferenceError` in JavaScript.[^njs]

```js
// Wrong (legacy): N(cont.grid.data("modified")).comm({ type: NA.Objects.Request.HttpMethod.PUT, dataIsArray: true, url: "html/naturaljs/exap/data/sample.json" })
N(cont.grid.data("modified")).comm({ type: "PUT", dataIsArray: true, url: "user/saveList.json" });
```

`remove([...])` orders the indexes as strings, so with indexes of different digit counts (for example `[2, 10]`) and an inserted row among them, the wrong rows are removed or marked (see [N.grid](../ui/grid.md) Known issues). Remove one index at a time, highest first.[^grid]

```js
// Wrong (legacy): cont.grid.remove(checkedIndexs);
checked.sort(function (a, b) { return b - a; }).forEach(function (row) { cont.grid.remove(row); });
```

A plain-text `N.alert` message is inserted with `.text()`, and the alert styles do not preserve line breaks, so `\n` shows as a space. Use `html: true` with `<br>` for a line break.[^alert]

```js
// Wrong (legacy): N(window).alert({ msg: "Do you want to delete?\nIt will not be reflected in the DB until you press the save button.", confirm: true }).show();
N(window).alert({ msg: "Do you want to delete?<br>It will not be reflected in the DB until you press the save button.", html: true, confirm: true }).show();
```

Every locale the application switches to needs a message entry: the legacy `en_US` object was an empty placeholder, so with `N.locale("en_US")` every dialog would show the key (`EXAP0500-0003`) instead of the text.[^message]

```js
// Wrong (legacy): en_US: { /* English messages... */ }
en_US: { "EXAP0500-0003": "No changed data." /* , every other key */ }
```

The header checkbox only checks: clearing it does not clear the row checkboxes, because the grid unchecks with `removeProp("checked")`, which has no effect under jQuery 3 (see [N.grid](../ui/grid.md) Known issues).[^iteration] Bind your own handler if users need to clear all:

```js
cont.grid.contextHead("#checkAll").on("click", function () {
    if (!this.checked) {
        cont.grid.context(".checkAllTarget").prop("checked", false);
    }
});
```

While a column filter is active the grid data holds only the visible rows, so `data("modified")` and `validate()` skip filtered-out rows. Clear the filter or search again before saving.[^grid]

Number values in text inputs (`"age": 32`) become strings and mark the row `"update"` as soon as the user tabs through it, and a boolean bound to the single `isActive` checkbox throws a `TypeError`.[^form] [^vals] Have the server send strings, or convert in `rowHandlerBeforeBind`:

```js
rowHandlerBeforeBind: function (rowIdx, rowEle, rowData) {
    if (typeof rowData.age === "number") {
        rowData.age = String(rowData.age);
    }
    if (typeof rowData.isActive === "boolean") {
        rowData.isActive = rowData.isActive ? "Y" : "N";
    }
}
```

jQuery runs a block page's inline script as a global script, so keep `const cont` inside a function; a top-level declaration throws a `SyntaxError` when the page is loaded again.

```js
// Wrong (legacy): const cont = N(".exap0500").cont({ init: (view, request) => { /* ... */ } });
(function () {
    const cont = N(".exap0500").cont({ init: function (view, request) { /* ... */ } });
})();
```

# Related

- [N.grid](../ui/grid.md) - options, methods, events and Known issues used here.
- [Grid CRUD (list type)](grid-crud-list-type.md) - the same screen with `height: 0` and resizable columns.
- [N.comm.request](../architecture/request.md) - `dataIsArray`, `type` and the other request options.
- [N.alert](../ui/alert.md) - confirmations, `html` and the dialog container.
- [N.notify](../ui-shell/notify.md) - global notices.
- [Natural-TEMPLATE search grid CRUD](template/search-grid-crud.md) - the Natural-TEMPLATE version.

[^grid]: NU.grid implementation
[^iteration]: NU.ui.iteration row rendering and check-all logic
[^form]: NU.form implementation (search form and row forms)
[^alert]: NU.alert implementation
[^message]: NC.message implementation
[^vals]: NC.prototype.vals (single checkbox values)
[^request]: NA.comm.request defaults and body serialization (dataIsArray)
[^njs]: N global and factory installation (only window.N is exported)
