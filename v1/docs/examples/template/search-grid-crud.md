---
type: Example
title: "Template: search form + grid (CRUD)"
description: Natural-TEMPLATE screen that retrieves rows into an editable grid, adds, deletes and saves them, and fills a row field from a department popup opened by a row button.
tags: [template, example, grid, crud]
sources:
  - id: components
    resource: ../../../src/natural.template.js
    title: NT.aop.components (component creation, popup opener, search-box usage)
    symbol: NT.aop.components
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: e60d19c0f4b2
  - id: codes
    resource: ../../../src/natural.template.js
    title: NT.aop.codes (p.select binds every element with the id)
    symbol: NT.aop.codes
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: a2cf3eac0450
  - id: events
    resource: ../../../src/natural.template.js
    title: NT.aop.events (delegated row events with row index)
    symbol: NT.aop.events
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: 02c30b39f119
  - id: grid
    resource: ../../../src/natural.ui.js
    title: NU.grid implementation (add, remove, check, validate, data)
    symbol: NU.grid
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 3ba583d8d43c
  - id: popup
    resource: ../../../src/natural.ui.js
    title: NU.popup implementation (url mode, onOpen, onClose)
    symbol: NU.popup
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c707aa4dadb7
  - id: alert
    resource: ../../../src/natural.ui.js
    title: NU.alert implementation (confirm dialog)
    symbol: NU.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5933b105d560
  - id: comm
    resource: ../../../src/natural.architecture.js
    title: NA.comm (dataIsArray request serialization)
    symbol: NA.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 40c48fda4ea0
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-TEMPLATE-EXAMPLES.md
    title: Legacy Natural-TEMPLATE example guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

A Natural-TEMPLATE screen where rows are edited directly in a fixed-header grid: search, add, delete checked rows, save the changed rows, and pick a department for a row from a popup page. Copy it for master-data maintenance screens. It builds on [Template: search form + grid](search-grid.md) and needs an activated Natural-TEMPLATE; see [Natural-TEMPLATE conventions](../../template/conventions.md).

# Scenario

- The page searches once on load; the user can search again by button or Enter.
- Every row is editable: name, gender and eye color selects, age, email, and a department that is chosen in a popup.
- Add inserts an empty row at the top; Delete removes the checked rows (new rows disappear, existing rows are marked for deletion); Save validates and sends every changed row in one request after a confirm dialog, then searches again.

# Components used

| Declaration | Becomes | Purpose |
|---|---|---|
| `p.select.gender`, `p.select.eyeColor` | array of [N.select](../../ui/select.md) | Options in the search form **and** in the grid row template. |
| `p.form.search` | [N.form](../../ui/form.md), `usage: "search-box"` | Search conditions. |
| `p.grid.master` | [N.grid](../../ui/grid.md) | Editable rows, check-all column, scroll paging of 15 rows. |
| `p.popup.dept` | [N.popup](../../ui/popup.md) in url mode | Department search page; returns the chosen row through `onClose`. |
| `c.getSampleList`, `c.saveSample` | functions returning [N.comm](../../architecture/communicator.md) | Search, and save of `data("modified")` with `dataIsArray: true`. |
| `e.btnSearch.click`, `e.btnAdd.click`, `e.btnDelete.click`, `e.btnSave.click` | bound buttons | Toolbar commands. |
| `e.btnDeptCd.click` | the grid element (delegated) | Row button; the handler receives the row index. |

# View

```html
<article class="type0201">
    <div id="search" class="search-panel">
        <ul>
            <li><label><span>Name</span><input id="name" type="text"></label></li>
            <li><label><span>Gender</span><select id="gender"><option value="">Select</option></select></label></li>
            <li><label><span>Eye color</span><select id="eyeColor"><option value="">Select</option></select></label></li>
        </ul>
    </div>

    <div class="button-panel">
        <button id="btnSearch" class="btn-search">Search</button>
        <button id="btnAdd">Add</button>
        <button id="btnDelete">Delete</button>
        <button id="btnSave">Save</button>
    </div>

    <table id="master">
        <thead>
            <tr>
                <th rowspan="2"><input id="checkAll" type="checkbox"></th>
                <th rowspan="2">No.</th>
                <th rowspan="2">Name</th>
                <th>Gender</th>
                <th>Age</th>
                <th rowspan="2">Department</th>
            </tr>
            <tr>
                <th>Eye color</th>
                <th>Email</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td rowspan="2" style="text-align: center;"><input class="checkAllTarget" type="checkbox"></td>
                <td rowspan="2" id="index" style="text-align: center;"></td>
                <td rowspan="2"><input id="name" type="text" data-validate='[["required"]]'></td>
                <td><select id="gender" data-validate='[["required"]]'><option value="">Select</option></select></td>
                <td><input id="age" type="text" data-validate='[["required"], ["integer"]]'></td>
                <td rowspan="2">
                    <input id="deptNm" type="text" readonly>
                    <input id="deptCd" type="hidden">
                    <button id="btnDeptCd">Find</button>
                </td>
            </tr>
            <tr>
                <td><select id="eyeColor"><option value="">Select</option></select></td>
                <td><input id="email" type="text" data-validate='[["email"]]'></td>
            </tr>
        </tbody>
    </table>
</article>
```

The `tbody` is the row template; its two `tr` elements form one record. The check-all box lives in the `thead`, outside the row template. The row checkbox is found by its `checkAllTarget` class and has no `id`, so it is not bound to row data.

# Controller

```html
<script type="text/javascript">
(() => {
    const cont = N(".type0201").cont({
        "p.select.gender": [ "gender" ],
        "p.select.eyeColor": [ "eyeColor" ],
        "p.form.search": { usage: "search-box" },
        "p.grid.master": {
            height: 350,
            checkAll: "#checkAll",
            checkAllTarget: ".checkAllTarget",
            scrollPaging: { size: 15 }
        },
        "p.popup.dept": {
            url: "html/sample/deptPopup.html",
            onOpen: "onOpen",                            // method of the popup page's controller
            height: 600,
            onClose: function (onCloseData) {            // called by caller.close(data) in the popup page
                if (onCloseData) {
                    cont["p.grid.master"]
                        .val(cont.selIdx, "deptNm", onCloseData.deptNm)
                        .val(cont.selIdx, "deptCd", onCloseData.deptCd);
                }
            }
        },

        "c.getSampleList": () => cont["p.form.search"].data(false).comm("sample/getSampleList.json"),
        "c.saveSample": () => N(cont["p.grid.master"].data("modified")).comm({
            url: "sample/saveSample.json",
            dataIsArray: true                            // send every changed row, not only the first
        }),

        "e.btnSearch.click": function (e) {
            e.preventDefault();
            if (cont["p.form.search"].validate()) {
                cont["c.getSampleList"]().submit(function (data) {
                    cont["p.grid.master"].bind(data);
                });
            }
        },
        "e.btnAdd.click": function (e) {
            e.preventDefault();
            cont["p.grid.master"].add();                 // empty row at the top, rowStatus "insert"
        },
        "e.btnDelete.click": function (e) {
            e.preventDefault();
            const grid = cont["p.grid.master"];
            const checked = grid.check();                // indexes of the checked rendered rows
            if (checked.length === 0) {
                N(window).alert("Check the rows to delete.").show();
                return;
            }
            checked.sort((a, b) => b - a).forEach((idx) => {
                grid.remove(idx);                        // highest index first
            });
        },
        "e.btnSave.click": function (e) {
            e.preventDefault();
            const grid = cont["p.grid.master"];
            const modified = grid.data("modified");
            if (modified.length === 0) {
                N(window).alert("There is no changed data.").show();
                return;
            }
            if (!grid.validate()) {                      // checks inserted and updated rows
                return;
            }
            N(window).alert({
                msg: "Save {0} changed rows?",
                vars: [ String(modified.length) ],
                confirm: true,
                onOk: function () {
                    cont["c.saveSample"]().submit(function () {
                        cont["e.btnSearch.click"].trigger("click");
                    });
                }
            }).show();
        },
        "e.btnDeptCd.click": function (e, idx) {         // #btnDeptCd is in the row template: idx is the row index
            e.preventDefault();
            cont.selIdx = idx;
            cont["p.popup.dept"].open(cont["p.grid.master"].data()[idx]);
        },

        init: function (view, request) {
            cont["e.btnSearch.click"].trigger("click");
        }
    });
})();
</script>
```

The department popup page (`html/sample/deptPopup.html`) is a template page too. Its `onOpen` method is named by the `onOpen` option above, and the `^onOpen` advisor runs it only after the popup's `init`:

```html
<article class="deptPopup" title="Find department">
    <table id="deptGrid">
        <thead><tr><th>Code</th><th>Department</th></tr></thead>
        <tbody><tr><td id="deptCd"></td><td id="deptNm"></td></tr></tbody>
    </table>
</article>

<script type="text/javascript">
(() => {
    const cont = N(".deptPopup").cont({
        "p.grid.deptGrid": {
            height: 400,
            select: true,
            onSelect: function (row, rowEle, data, beforeRow, e) {
                if (row > -1) {
                    cont.caller.close(data[row]);        // runs the parent's onClose with { deptCd, deptNm, ... }
                }
            }
        },
        "c.getDeptList": () => N.comm("sample/getDeptList.json"),

        onOpen: function (onOpenData) {                  // onOpenData: the grid row being edited
            cont["c.getDeptList"]().submit(function (data) {
                cont["p.grid.deptGrid"].bind(data);
            });
        },
        init: function (view, request) {}
    });
})();
</script>
```

# Server contract

Common codes and the `N.context.attr("ui").select` key and value properties are configured as in [Template: search form + grid](search-grid.md).

| Request | Sent by | Body (shipped config: POST JSON) | Response |
|---|---|---|---|
| `codeUrl` | `NT.aop.codes` | `{"codes":["gender","eyeColor"]}` | code rows |
| `sample/getSampleList.json` | `c.getSampleList` | the search row | array of rows with `index`, `name`, `gender`, `age`, `eyeColor`, `email`, `deptCd`, `deptNm` |
| `sample/saveSample.json` | `c.saveSample` | array of changed rows, each with `rowStatus` `"insert"`, `"update"` or `"delete"` | anything; the page only searches again |
| `sample/getDeptList.json` | popup `c.getDeptList` | none | array of `{ deptCd, deptNm }` |

# How it works

1. **One declaration, two places.** `NT.aop.codes` binds every `select`, radio or checkbox whose id is `gender`, including the `select` in the grid's `tbody`. This happens before `p.grid.master` is created, so the grid clones a row template whose selects already hold the options, and every rendered row inherits them. `cont["p.select.gender"]` is `[searchSelect, rowTemplateSelect]` in document order.[^codes]
2. **Row button.** `#btnDeptCd` lies inside the `.grid__` table, so `NT.aop.events` applies `N.button` to the row template's button and delegates one `click.type0201` handler from the grid element to `>.form__ #btnDeptCd`. The handler receives the row index as its last argument, and `cont["e.btnDeptCd.click"]` holds the grid element.[^events]
3. **Popup.** `p.popup.dept` has a `url`, so it needs no `#dept` element and is created in url mode with the `onOpen` method name. `open(row)` loads the page on first use, runs its `init`, then its `onOpen(row)`. The popup returns a department with `cont.caller.close(data)`, which calls this page's `onClose`; `grid.val(row, key, value)` writes through the row form, lifting `readonly` while it sets `deptNm`.[^popup][^grid]
4. **Add and delete.** `add()` clones the template at the top with `rowStatus: "insert"`. `remove(idx)` drops a row whose `rowStatus` is `"insert"` and marks any other row `"delete"` (class `row_data_deleted__`). Deleting from the highest index down keeps the remaining indexes valid; see Known issues on [N.grid](../../ui/grid.md) for why an index array is avoided.[^grid]
5. **Save.** `grid.validate()` checks only inserted and updated rows. `data("modified")` returns the inserted, updated and deleted rows, and `dataIsArray: true` makes the communicator send the whole array; without it only the first row is sent.[^grid][^comm] The confirm dialog is an [N.alert](../../ui/alert.md) with `confirm: true`; its `onOk` sends the request.[^alert]
6. **Check-all** only checks: clearing the header box does not clear the row boxes (see Known issues on [N.grid](../../ui/grid.md)).

# Variations

- **List-type grid**: drop `height` and `scrollPaging` to render every row with `height: 0`; the same controller works. Compare [Grid CRUD, list type](../grid-crud-list-type.md).
- **Delete selected rows instead of checked rows**: set `multiselect: true` and use `grid.select()` in place of `grid.check()`.
- **Localized texts**: keep the alert texts in a controller resource and read them with [N.message](../../core/message.md) `get(resource, key[, vars])`.
- **Same screen without Natural-TEMPLATE**: [Grid CRUD with fixed header](../grid-crud-fixed-header.md).

# Pitfalls

`APP.comm.utils.save`, `APP.comm.utils.del` and `APP.comm.messages` in the legacy example were helpers of the demo site; they are not part of Natural-JS and are not defined anywhere in the library. Write the steps out as in the Controller above.

```js
// Wrong (legacy): return APP.comm.utils.save.call(this, { cont, comm: "c.saveSample", changed: "p.grid.master", validate: "p.grid.master", after: (data) => { cont["e.btnSearch.click"].trigger("click"); } });
if (grid.data("modified").length > 0 && grid.validate()) { cont["c.saveSample"]().submit(function () { cont["e.btnSearch.click"].trigger("click"); }); }
```

```js
// Wrong (legacy): return APP.comm.utils.del.call(this, { cont, inst: "p.grid.master" });
grid.check().sort((a, b) => b - a).forEach((idx) => { grid.remove(idx); });
```

The popup page cannot read `this.opener`: Natural-TEMPLATE adds `opener: cont` to `p.popup` declarations with a `url`, but the `N.popup` constructor currently loses it (see Known issues on [N.cont](../../architecture/controller.md)). Pass what the popup needs through `open(onOpenData)` and return results through `caller.close(onCloseData)`, as above.[^components][^popup]

Numbers bound to text inputs mark rows as changed: leaving such an input compares the stored number with the input's string using `!==` and writes the string back, so an untouched row with a numeric `age` gets `rowStatus: "update"`, is validated by `validate()` and is sent on save. Convert those fields to strings before they are bound (see Known issues on [N.grid](../../ui/grid.md)):[^grid]

```js
"p.grid.master": {
    height: 350,
    rowHandlerBeforeBind: function (rowIdx, rowEle, rowData) {
        if (rowData.age != null) {
            rowData.age = String(rowData.age);
        }
    }
}
```

`cont["e.btnDeptCd.click"]` is the grid element, because the handler is delegated from the grid; `trigger("click")` on it does not reach the row buttons.[^events]

# Related

- [N.grid](../../ui/grid.md) - `add`, `remove`, `check`, `validate`, `val` and `data("modified")`.
- [e.{id}.{event} event binding](../../template/event-binding.md) - delegated row events and the row index argument.
- [N.popup](../../ui/popup.md) - url mode, `onOpen`, `onClose` and `caller.close()`.
- [N.comm](../../architecture/communicator.md) - `dataIsArray` and the submit callback.
- [Template: search form + grid + detail form (horizontal)](search-grid-detail-horizontal.md) - the same data edited in a detail form.
- [Natural-TEMPLATE conventions](../../template/conventions.md) - activation and the `^onOpen` advisor used by the popup page.

[^components]: NT.aop.components (component creation, popup opener, search-box usage)
[^codes]: NT.aop.codes (p.select binds every element with the id)
[^events]: NT.aop.events (delegated row events with row index)
[^grid]: NU.grid implementation (add, remove, check, validate, data)
[^popup]: NU.popup implementation (url mode, onOpen, onClose)
[^alert]: NU.alert implementation (confirm dialog)
[^comm]: NA.comm (dataIsArray request serialization)
