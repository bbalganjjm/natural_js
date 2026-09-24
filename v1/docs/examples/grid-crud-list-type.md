---
type: Example
title: Grid CRUD (list type)
description: Block page with a search form and a list-type N.grid (height 0, resizable columns) that adds, deletes, validates and saves changed rows in one request.
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
  - id: cont-ctor
    resource: ../../src/natural.architecture.js
    title: NA.cont constructor (data-pageid and view binding)
    symbol: NA.cont.prototype.constructor
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 2d87d7820d7f
  - id: njs
    resource: ../../src/natural.js.js
    title: N global and factory installation (only window.N is exported)
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-EXAMPLES.md
    title: Legacy examples guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

The editable grid CRUD screen with a list-type [N.grid](../ui/grid.md): `height` stays at its default `0`, so every row is rendered and the page itself scrolls. The controller is the one of [Grid CRUD (fixed header)](grid-crud-fixed-header.md) with a different page id and grid options; this page lists the full code so it can be copied on its own.

# Scenario

The block page `exap0600.html` has a search box and a grid with a one-row header, a one-row template and draggable column widths. Search loads the rows; Add, Delete and cell edits only change the grid data; Save validates the changed rows, confirms, sends them with `PUT` and reloads the list.

# Components used

| Component | Role on this page | Reference |
|---|---|---|
| `N(".exap0600").cont({...})` | Controller | [N.cont](../architecture/controller.md) |
| `N(obj).comm(url \| opts).submit(callback)` | Code lists, search, batch save (`dataIsArray: true`) | [N.comm](../architecture/communicator.md), [N.comm.request](../architecture/request.md) |
| `N(rows).select({...}).bind()` | Selects in the search box and in the grid's row template | [N.select](../ui/select.md) |
| `N(elements).button(opts)` | Styles the four links | [N.button](../ui/button.md) |
| `N([]).form({ context }).add()` | Search conditions row | [N.form](../ui/form.md) |
| `N([]).grid({ resizable: true, ... })` | `bind`, `add`, `check`, `remove`, `validate`, `data("modified")` | [N.grid](../ui/grid.md) |
| `N(window).alert({...}).show()` | Confirmations and messages | [N.alert](../ui/alert.md) |
| `N.notify.add(msg)` | "No changed data." and the save summary | [N.notify](../ui-shell/notify.md) |
| `N.message.get(resource, key[, vars])` | Texts with `{0}` placeholders | [N.message](../core/message.md) |

# View

```html
<article class="exap0600">
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
            <col style="width: 150px;">
            <col style="width: auto;">
            <col style="width: 110px;">
            <col style="width: 110px;">
            <col style="width: 70px;">
            <col style="width: 130px;">
            <col style="width: 70px;">
        </colgroup>
        <thead>
            <tr>
                <th><input id="checkAll" type="checkbox" title="Check all"></th>
                <th>Name</th>
                <th data-filter="true">Email</th>
                <th data-filter="true">Gender</th>
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
                    <select id="gender" data-validate='[["required"]]'><option value="">Select</option></select>
                </td>
                <td style="text-align: center;">
                    <select id="eyeColor" data-validate='[["required"]]'><option value="">Select</option></select>
                </td>
                <td><input id="age" type="text" data-validate='[["required"], ["integer"]]'></td>
                <td><input id="registered" type="text" data-format='[["date", 8, "date"]]' data-validate='[["required"]]'></td>
                <td style="text-align: center;"><input id="isActive" type="checkbox"></td>
            </tr>
        </tbody>
    </table>
</article>
```

# Controller

Put this script in a `<script type="text/javascript">` element right after `</article>` in the same file. Only `setComponents`, the page id and the message keys differ from the fixed-header page.

```js
(function () {
    const cont = N(".exap0600").cont({
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
                resizable: true,
                sortable: true,
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
                N(window).alert(N.message.get(cont.messages, "EXAP0600-0004")).show();
                return;
            }
            N(window).alert({
                msg: N.message.get(cont.messages, "EXAP0600-0001"),
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
                N.notify.add(N.message.get(cont.messages, "EXAP0600-0003"));
                return;
            }
            if (!grid.validate()) {
                return;
            }
            N(window).alert({
                msg: N.message.get(cont.messages, "EXAP0600-0005"),
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
                        N.notify.add(N.message.get(cont.messages, "EXAP0600-0002")
                            + N.message.get(cont.messages, "EXAP0600-0006", [inserted])
                            + N.message.get(cont.messages, "EXAP0600-0007", [updated])
                            + N.message.get(cont.messages, "EXAP0600-0008", [deleted]));
                        cont.search();
                    });
                }
            }).show();
        },
        messages: {
            ko_KR: {
                "EXAP0600-0001": "Do you want to delete? It will not be reflected in the DB until you press the save button.",
                "EXAP0600-0002": "Saving is complete.",
                "EXAP0600-0003": "No changed data.",
                "EXAP0600-0004": "No selected row.",
                "EXAP0600-0005": "Do you want to save?",
                "EXAP0600-0006": " - Inserted: {0} rows",
                "EXAP0600-0007": " - Updated: {0} rows",
                "EXAP0600-0008": " - Deleted: {0} rows"
            },
            en_US: {
                "EXAP0600-0001": "Do you want to delete? It will not be reflected in the DB until you press the save button.",
                "EXAP0600-0002": "Saving is complete.",
                "EXAP0600-0003": "No changed data.",
                "EXAP0600-0004": "No selected row.",
                "EXAP0600-0005": "Do you want to save?",
                "EXAP0600-0006": " - Inserted: {0} rows",
                "EXAP0600-0007": " - Updated: {0} rows",
                "EXAP0600-0008": " - Deleted: {0} rows"
            }
        }
    });
})();
```

The `ko_KR` texts are placeholders; keep an entry for every locale the application uses.[^message]

# Server contract

| Endpoint | Request | Response |
|---|---|---|
| `code/getList.json` | `POST`, JSON body `{"codes":["gender","eyeColor"]}` | JSON array of `{ "group", "name", "value" }` code rows |
| `user/getList.json` | `POST`, JSON body: the search row, for example `{"name":"Kim","gender":"","eyeColor":"","rowStatus":"insert"}` | JSON array of rows: `{ "id": "101", "name": "Kim Min-ji", "email": "minji@example.com", "gender": "female", "eyeColor": "blue", "age": "32", "registered": "20140325", "isActive": "Y" }` |
| `user/saveList.json` | `PUT`, JSON **array** of the changed rows, each with `"rowStatus"`: `"insert"` (no `id`), `"update"` or `"delete"` | Any JSON value, for example the number of processed rows; the page only reloads the list |

Send values that land in text inputs as strings and `isActive` as `"Y"` / `"N"`; the reasons are in the Pitfalls of [Grid CRUD (fixed header)](grid-crud-fixed-header.md).

# How it works

Differences from the fixed-header page:[^grid]

| | Fixed header | List type (this page) |
|---|---|---|
| Layout switch | `height: 350` (any value above `0`) | `height` omitted (default `0`) |
| Rendering | 100 rows per scroll step (`scrollPaging.size`) inside a 350 px scroll box | Every row (still asynchronously, one row per `createRowDelay` ms); the page scrolls |
| Header | Moved to a separate table that stays in place | Scrolls with the rows |
| `add()` | Scrolls the body to the new row; `addSelect` can select it | No scrolling; `addSelect` has no effect |
| `fixedcol` | Ignored | Available (keeps left columns in place) |
| `resizable` | Works | Works; this page turns it on |

The rest works as on the fixed-header page:

- **Selects before the grid**: the code options are bound into the template's `select` elements before the grid clones the `tbody`.[^select]
- **Resizable columns**: `resizable: true` moves each `col` width to its `th`, removes the `colgroup` and adds drag handles to the header.[^grid]
- **Rows are forms**: edits write the row and set `rowStatus: "update"`; `add()` creates a `"insert"` row at the top; `remove(row)` drops `"insert"` rows and marks others `"delete"`.[^form] [^grid]
- **Save**: `data("modified")` collects every row with a `rowStatus`, `validate()` checks the inserted and updated rows, and `dataIsArray: true` sends them as one JSON array.[^request]

# Variations

- **Keep the first columns in place** on a wide grid: `fixedcol: 2` (list type only).
- **Highlight the hovered row**: `hover: true`.
- **Paste from a spreadsheet**: `pastiable: true` pastes tab-separated text starting at the focused cell.
- **Undo edits**: `revert: true` plus `cont.grid.revert()`.
- **Paging instead of one long list**: bind one page at a time with [N.pagination](../ui/pagination.md).

# Pitfalls

List type and fixed header are the same component: `height` alone switches the layout, and `resizable` works in both. The legacy comment suggested otherwise.[^grid]

```js
// Wrong (legacy): resizable: true, // resizable is true for list type grid
cont.grid = N([]).grid({ context: N("#grid", cont.view), resizable: true });                // list type: height defaults to 0
cont.grid = N([]).grid({ context: N("#grid", cont.view), height: 350, resizable: true });   // fixed header, also resizable
```

The legacy list-type example reused the controller selector `.exap0500` and the `EXAP0500-*` message keys of the fixed-header example. When both pages are open in one document (for example in two [N.docs](../ui-shell/documents.md) tabs), both views get `data-pageid="exap0500"` and every document-wide lookup such as `N(".exap0500")` or a `.exap0500` style rule matches both.[^cont-ctor] Give every page its own class and keys.

```js
// Wrong (legacy): const cont = N(".exap0500").cont({ /* list-type page */ });
(function () {
    const cont = N(".exap0600").cont({ /* list-type page */ });
})();
```

`NA` is not a global at runtime and `NA.Objects.Request.HttpMethod` is a TypeScript `const enum`, so the legacy expression throws a `ReferenceError` in JavaScript.[^njs]

```js
// Wrong (legacy): N(cont.grid.data("modified")).comm({ type: NA.Objects.Request.HttpMethod.PUT, dataIsArray: true, url: "html/naturaljs/exap/data/sample.json" })
N(cont.grid.data("modified")).comm({ type: "PUT", dataIsArray: true, url: "user/saveList.json" });
```

Remove checked rows one index at a time, highest first; `remove([...])` orders indexes as strings and hits the wrong rows when an inserted row is among indexes of different digit counts (see [N.grid](../ui/grid.md) Known issues).[^grid]

```js
// Wrong (legacy): cont.grid.remove(checkedIndexs);
checked.sort(function (a, b) { return b - a; }).forEach(function (row) { cont.grid.remove(row); });
```

Write `data-format` and `data-validate` JSON inside single-quoted attributes; backslashes do not escape quotes in HTML.

```html
// Wrong (legacy): <input id="registered" type="text" data-format="[[\"date\", 8, \"date\"]]" data-validate="[[\"required\"]]">
<input id="registered" type="text" data-format='[["date", 8, "date"]]' data-validate='[["required"]]'>
```

The header checkbox can only check rows, not clear them (jQuery 3 ignores the grid's `removeProp("checked")`); see the workaround in [Grid CRUD (fixed header)](grid-crud-fixed-header.md) and [N.grid](../ui/grid.md) Known issues.[^iteration]

# Related

- [N.grid](../ui/grid.md) - layouts, `fixedcol`, `resizable` and Known issues.
- [Grid CRUD (fixed header)](grid-crud-fixed-header.md) - the fixed-header version and the full list of pitfalls.
- [N.form](../ui/form.md) - the per-row binding rules behind every grid row.
- [N.validator](../data/validator.md) - the `required`, `email` and `integer` rules in the template.
- [N.comm.request](../architecture/request.md) - `dataIsArray` and request options.

[^grid]: NU.grid implementation
[^iteration]: NU.ui.iteration row rendering and check-all logic
[^form]: NU.form implementation (search form and row forms)
[^select]: NU.select implementation
[^message]: NC.message implementation
[^request]: NA.comm.request defaults and body serialization (dataIsArray)
[^cont-ctor]: NA.cont constructor (data-pageid and view binding)
[^njs]: N global and factory installation (only window.N is exported)
