---
type: Example
title: "Template: search form + grid + detail form (horizontal)"
description: Natural-TEMPLATE master-detail screen where selecting a grid row binds it into a detail form beside the grid; both share one data set for add, delete, reset and save.
tags: [template, example, form, grid]
sources:
  - id: codes
    resource: ../../../src/natural.template.js
    title: NT.aop.codes (code, comm and data selects)
    symbol: NT.aop.codes
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: a2cf3eac0450
  - id: components
    resource: ../../../src/natural.template.js
    title: NT.aop.components (component creation, popup opener)
    symbol: NT.aop.components
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: e60d19c0f4b2
  - id: grid
    resource: ../../../src/natural.ui.js
    title: NU.grid implementation (select, onSelect, onBind, update)
    symbol: NU.grid
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 3ba583d8d43c
  - id: iteration
    resource: ../../../src/natural.ui.js
    title: NU.ui.iteration (onSelect and onBind call with this bound to the grid)
    symbol: NU.ui.iteration
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 67e1562d3c04
  - id: form
    resource: ../../../src/natural.ui.js
    title: NU.form implementation (bind, unbind, add, remove, revert, autoUnbind)
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: popup
    resource: ../../../src/natural.ui.js
    title: NU.popup implementation (url mode, onClose)
    symbol: NU.popup
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c707aa4dadb7
  - id: ds
    resource: ../../../src/natural.data.js
    title: ND.ds data synchronization
    symbol: ND.ds
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 64d1318e0071
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

A Natural-TEMPLATE master-detail screen: a narrow grid lists the search result and a detail form beside it edits the selected row with text inputs, selects, radios, checkboxes, an image and a popup lookup. The form is bound to the grid's own data wrapper, so edits, new rows and deletions appear in both at once and one save sends them all. It needs an activated Natural-TEMPLATE; see [Natural-TEMPLATE conventions](../../template/conventions.md).

# Scenario

- The page searches on load and selects the first row, whose values appear in the detail form.
- Selecting another row shows it in the form; editing a field updates the grid row immediately.
- Add validates the current row and inserts a new empty row at the top; Delete removes a new row or marks an existing one for deletion; Reset restores the bound row to its state when it was selected.
- Save validates the bound row, sends every changed row after a confirm dialog and searches again.
- The department is picked in a popup page and written into the form.

# Components used

| Declaration | Becomes | Purpose |
|---|---|---|
| `p.select.gender`, `p.select.eyeColor`, `p.select.company`, `p.select.favoriteFruit` | arrays of [N.select](../../ui/select.md) | Common codes; `gender` fills a search `select` **and** a detail radio group. |
| `p.select.age` | array of `N.select` | Distinct ages from the list returned by `c.getSampleCodeList`, sorted. |
| `p.form.search` | [N.form](../../ui/form.md), `usage: "search-box"` | Search conditions. |
| `p.form.detail` | `N.form` with `revert: true`, `autoUnbind: true` | Edits the selected grid row. |
| `p.grid.master` | [N.grid](../../ui/grid.md) with `select: true` | Master list; `onSelect` binds the detail form, `onBind` selects row 0. |
| `p.popup.dept` | [N.popup](../../ui/popup.md) in url mode | Department lookup; `onClose` writes into the form. |
| `c.getSampleCodeList`, `c.getSampleList`, `c.saveSample` | functions returning [N.comm](../../architecture/communicator.md) | Age list, search, save. |
| `e.btnSearch.click`, `e.btnSave.click`, `e.btnAdd.click`, `e.btnDelete.click`, `e.btnRevert.click`, `e.btnDeptCd.click` | bound buttons | Commands. |

# View

```html
<article class="type0401">
    <div id="search" class="search-panel">
        <ul>
            <li><label><span>Name</span><input id="name" type="text"></label></li>
            <li><label><span>Gender</span><select id="gender"><option value="">Select</option></select></label></li>
            <li><label><span>Eye color</span><select id="eyeColor"><option value="">Select</option></select></label></li>
        </ul>
    </div>

    <div style="display: flex; gap: 16px;">
        <div style="flex: 1; max-width: 33%;">
            <div class="button-panel">
                <button id="btnSearch" class="btn-search">Search</button>
                <button id="btnSave">Save</button>
            </div>
            <table id="master">
                <thead><tr><th>Name</th><th>Email</th></tr></thead>
                <tbody><tr><td id="name"></td><td id="email"></td></tr></tbody>
            </table>
        </div>

        <div style="flex: 2;">
            <div class="button-panel">
                <button id="btnAdd">Add</button>
                <button id="btnDelete">Delete</button>
                <button id="btnRevert">Reset</button>
            </div>
            <ul id="detail">
                <li><span>Picture</span><img id="picture" style="height: 56px;"></li>
                <li><label><span>Name</span><input id="name" type="text" data-validate='[["required"]]'></label></li>
                <li><span>Gender</span><input id="gender" type="radio"></li>
                <li><label><span>Age</span><select id="age"><option value="">Select</option></select></label></li>
                <li><label><span>Eye color</span><select id="eyeColor"><option value="">Select</option></select></label></li>
                <li><label><span>Company</span><select id="company"><option value="">Select</option></select></label></li>
                <li><span>Favorite fruit</span><input id="favoriteFruit" type="checkbox"></li>
                <li><label><span>Email</span><input id="email" type="text" data-validate='[["required"], ["email"]]'></label></li>
                <li>
                    <span>Department</span>
                    <input id="deptNm" type="text" readonly>
                    <input id="deptCd" type="hidden">
                    <button id="btnDeptCd">Find</button>
                </li>
            </ul>
        </div>
    </div>
</article>
```

The radio and checkbox templates are not wrapped in a `label`: `N.select` clones each of them once per code into its own generated `label`, and the clones take the template's `id` as their `name`.

# Controller

```html
<script type="text/javascript">
(() => {
    const cont = N(".type0401").cont({
        "p.select.gender": [ "gender" ],
        "p.select.eyeColor": [ "eyeColor" ],
        "p.select.company": [ "company" ],
        "p.select.favoriteFruit": [ "favoriteFruit" ],
        "p.select.age": [ "c.getSampleCodeList", "age", "age", function (data) {    // [comm, key, val, filter]
            return N(N.array.deduplicate(data, "age")).datasort("age");
        }],
        "p.form.search": { usage: "search-box" },
        "p.form.detail": { revert: true, autoUnbind: true },
        "p.grid.master": {
            height: 486,
            select: true,
            selectScroll: false,
            onSelect: function (index, rowEle, data, beforeRow, e) {
                if (index > -1) {
                    // data is the grid's wrapper: the form edits the grid's row objects
                    cont["p.form.detail"].unbind().bind(index, data);
                }
            },
            onBind: function (context, data, isFirstPage, isLastPage) {
                if (isFirstPage) {
                    if (data.length > 0) {
                        this.select(0);                              // this: the N.grid instance
                    } else {
                        cont["p.form.detail"].unbind().bind(0, data);   // share the empty wrapper so add() reaches the grid
                    }
                }
            }
        },
        "p.popup.dept": {
            url: "html/sample/deptPopup.html",
            onOpen: "onOpen",
            height: 600,
            onClose: function (onCloseData) {
                if (onCloseData) {
                    cont["p.form.detail"]
                        .val("deptNm", onCloseData.deptNm)
                        .val("deptCd", onCloseData.deptCd);
                }
            }
        },

        "c.getSampleCodeList": () => N.comm("sample/getSampleList.json"),
        "c.getSampleList": () => cont["p.form.search"].data(false).comm("sample/getSampleList.json"),
        "c.saveSample": () => N(cont["p.grid.master"].data("modified")).comm({
            url: "sample/saveSample.json",
            dataIsArray: true
        }),

        "e.btnSearch.click": function (e) {
            e.preventDefault();
            if (cont["p.form.search"].validate()) {
                cont["c.getSampleList"]().submit(function (data) {
                    cont["p.grid.master"].bind(data);
                });
            }
        },
        "e.btnSave.click": function (e) {
            e.preventDefault();
            const modified = cont["p.grid.master"].data("modified");
            if (modified.length === 0) {
                N(window).alert("There is no changed data.").show();
                return;
            }
            if (!cont["p.form.detail"].validate()) {             // the bound row only
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
        "e.btnAdd.click": function (e) {
            e.preventDefault();
            if (cont["p.form.detail"].validate()) {
                cont["p.form.detail"].add();                     // autoUnbind: starts from the initial markup values
            }
        },
        "e.btnDelete.click": function (e) {
            e.preventDefault();
            if (cont["p.form.detail"].data(true)[0]) {           // a row is bound
                cont["p.form.detail"].remove();
            }
        },
        "e.btnRevert.click": function (e) {
            e.preventDefault();
            const row = cont["p.form.detail"].data(true)[0];
            if (!row || !row.rowStatus) {
                N(window).alert("There is no changed data to reset.").show();
                return;
            }
            cont["p.form.detail"].revert();
        },
        "e.btnDeptCd.click": function (e) {
            e.preventDefault();
            cont["p.popup.dept"].open(cont["p.form.detail"].data(true)[0]);
        },

        init: function (view, request) {
            cont["e.btnSearch.click"].trigger("click");
        }
    });
})();
</script>
```

The department popup page is the one shown in [Template: search form + grid (CRUD)](search-grid-crud.md); it calls `cont.caller.close({ deptCd, deptNm })`.

# Server contract

Common codes and the `N.context.attr("ui").select` key and value properties are configured as in [Template: search form + grid](search-grid.md).

| Request | Sent by | Body (shipped config: POST JSON) | Response |
|---|---|---|---|
| `codeUrl` | `NT.aop.codes` | `{"codes":["gender","eyeColor","company","favoriteFruit"]}` | code rows |
| `sample/getSampleList.json` | `c.getSampleCodeList` (for the age select) | none | array of rows with `age` |
| `sample/getSampleList.json` | `c.getSampleList` | the search row | array of rows with `picture` (image URL), `name`, `gender`, `age`, `eyeColor`, `company`, `favoriteFruit`, `email`, `deptCd`, `deptNm` |
| `sample/saveSample.json` | `c.saveSample` | array of changed rows with `rowStatus` `"insert"`, `"update"` or `"delete"` | anything; the page searches again |

The code request and the age request run in parallel, and `init` (with the first search) starts only after both have answered.[^codes]

# How it works

1. **Selects.** `code` declarations share one request; `p.select.age` is a `comm` declaration, so `cont["c.getSampleCodeList"]()` is submitted and its response passes through the filter (deduplicated by `age`, sorted) before binding. The gender codes fill the search `select` and the detail radio group, so `cont["p.select.gender"]` holds two `N.select` instances.[^codes]
2. **Shared data.** `onSelect` receives the grid's whole data wrapper; `bind(index, data)` makes it the form's data and snapshots the row for `revert()`. Both components now hold the same wrapper, so [N.ds](../../data/datasync.md) forwards every change: a detail edit re-renders the grid cell, `add()` and the removal of an inserted row rebind the grid, and marking a row `"delete"` re-renders that grid row.[^form][^ds][^grid]
3. **Clean rebinds.** `unbind()` restores the values the detail elements had when the form was created and removes its handlers, so fields that the next row lacks do not keep the previous row's values. `autoUnbind: true` does the same inside `add()` and `revert()`, but not for explicit `bind()` calls, which is why `onSelect` calls `unbind()` itself.[^form]
4. **First row.** `onBind` runs with `this` bound to the grid; on the first page it selects row 0, which fires `onSelect`. For an empty result it binds the form to the grid's empty wrapper instead, so a following Add inserts into the grid's data.[^iteration]
5. **Add, delete, reset.** `add()` builds the new row from the (unbound, initial) input values, sets `rowStatus: "insert"`, inserts it at index 0 of the shared wrapper and binds it; the grid rebinds without firing `onBind`. `remove()` deletes an inserted row or marks the row `"delete"`. `revert()` restores the snapshot taken when the row was selected.[^form][^grid]
6. **Popup.** `open(row)` passes the bound row to the popup page's `onOpen`; `onClose` writes the result with `val(key, value)`, which lifts `readonly` on `deptNm` while it sets the value and syncs the grid through `N.ds`.[^popup][^form]
7. **Save.** Because the form edits the grid's row objects, `grid.data("modified")` contains every row changed through the form; `dataIsArray: true` sends the whole array.[^comm]

# Variations

- **Vertical layout and object-form declarations**: [Template: search form + grid + detail form (vertical)](search-grid-detail-vertical.md).
- **Keep the selection on a second click**: add `unselect: false` to the grid, so clicking the selected row does not deselect it (`index` stays `>= 0`).
- **Validate every changed row on save**: `validate()` of the detail form checks the bound row only. To check all rows, bind each changed row in turn or validate on the server.
- **Localized texts**: keep the alert texts in a controller resource and use [N.message](../../core/message.md).

# Pitfalls

Grid callbacks are called with `this` bound to the grid and with their own `arguments`. The legacy example wrote them as arrow functions, where `this` is not the grid and `arguments` is not the callback's arguments.[^iteration]

```js
// Wrong (legacy): onBind: (context, data, isFirstPage, isLastPage) => { if (isFirstPage) { this.select(0); } }
onBind: function (context, data, isFirstPage, isLastPage) { if (isFirstPage && data.length > 0) { this.select(0); } }
```

`APP.comm.utils.selectNBind`, `APP.comm.utils.save` and `APP.comm.messages` were demo-site helpers, not Natural-JS APIs. Bind the selected row yourself:

```js
// Wrong (legacy): onSelect: (index, rowEle, data, beforeRow, e) => { APP.comm.utils.selectNBind.call(this, { args: arguments, cont: cont, form: "p.form.detail" }); }
onSelect: function (index, rowEle, data, beforeRow, e) { if (index > -1) { cont["p.form.detail"].unbind().bind(index, data); } }
```

```js
// Wrong (legacy): N(window).alert(N.message.get(APP.comm.messages, "COMM-0001")).show();
N(window).alert("There is no changed data to reset.").show();
```

`autoUnbind: true` does not unbind before `bind(index, data)`; only `add()`, `revert()` and `update()` pass the state that triggers it. Without the explicit `unbind()`, a field missing from the new row keeps the value of the previously selected row (see Known issues on [N.form](../../ui/form.md)).[^form]

`unbind()` resets an `img` only when it had a `src` when the form was created; `#picture` above has none, so after Add the new row still shows the previous row's picture until a picture is set. Give the image a placeholder `src` in the markup if that matters.[^form]

`onSelect` also fires with `index` `-1` when the selected row is clicked again (deselect). `bind(-1, data)` binds nothing, so guard with `index > -1`.[^iteration]

`remove()` and `revert()` expect a bound row: with none (after an inserted row was removed, or on an empty result) they throw a `TypeError`. Guard with `data(true)[0]`, as in the Controller.[^form]

Pass the grid's wrapper to the form unchanged. `N(data)` or `grid.data()` (a plain array) gives the form a different object, and the two components stop syncing.[^ds]

# Related

- [N.form](../../ui/form.md) - `bind(row, data)`, `unbind`, `add`, `remove`, `revert`, `autoUnbind`.
- [N.grid](../../ui/grid.md) - `select`, `onSelect`, `onBind` and `data("modified")`.
- [N.ds](../../data/datasync.md) - why the grid and the form stay in sync.
- [N.select](../../ui/select.md) - radio and checkbox groups generated from one template input.
- [Template: search form + grid + detail form (vertical)](search-grid-detail-vertical.md) - the same screen stacked vertically.
- [p.{component}.{id} declarations](../../template/component-declaration.md) - `code`, `comm` and array forms of `p.select`.

[^codes]: NT.aop.codes (code, comm and data selects)
[^grid]: NU.grid implementation (select, onSelect, onBind, update)
[^iteration]: NU.ui.iteration (onSelect and onBind call with this bound to the grid)
[^form]: NU.form implementation (bind, unbind, add, remove, revert, autoUnbind)
[^popup]: NU.popup implementation (url mode, onClose)
[^ds]: ND.ds data synchronization
[^comm]: NA.comm (dataIsArray request serialization)
