---
type: Example
title: "Template: search form + grid + detail form (vertical)"
description: Vertical variant of the Natural-TEMPLATE master-detail screen, with the detail form below the grid and p.select declared in object form with default selections.
tags: [template, example, form, select]
sources:
  - id: codes
    resource: ../../../src/natural.template.js
    title: NT.aop.codes (object and array forms, selected)
    symbol: NT.aop.codes
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: a2cf3eac0450
  - id: template
    resource: ../../../src/natural.template.js
    title: NT.aop.template (codes finish before components are created)
    symbol: NT.aop.template
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: 3e774a9d9e0b
  - id: grid
    resource: ../../../src/natural.ui.js
    title: NU.grid implementation (select, onSelect, onBind)
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
    title: NU.form implementation (initial values captured at construction, unbind, add)
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: select
    resource: ../../../src/natural.ui.js
    title: NU.select implementation (val)
    symbol: NU.select
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 8518b356a7d1
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-TEMPLATE-EXAMPLES.md
    title: Legacy Natural-TEMPLATE example guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

The same master-detail screen as [Template: search form + grid + detail form (horizontal)](search-grid-detail-horizontal.md), laid out top to bottom: search form, a shorter grid, then the detail form. The controller declares every `p.select` in object form and uses `selected` to preset values, which also become the defaults of rows added in the detail form. Read the horizontal page first for the data flow; this page lists the complete code and the differences.

# Scenario

- Identical behavior to the horizontal example: search on load, first row selected, detail form edits the selected row, Add / Delete / Reset in the form, Save sends every changed row, department picked in a popup.
- The grid is 200 px high so the detail form fits below it.
- Gender starts as `male` in the search form and in the detail form; age (a detail field only) starts as `22`.

# Components used

| Declaration | Becomes | Difference from the horizontal example |
|---|---|---|
| `p.select.gender` | array of [N.select](../../ui/select.md) | `{ code: "gender", selected: "male" }` |
| `p.select.eyeColor`, `p.select.company`, `p.select.favoriteFruit` | arrays of `N.select` | `{ code: "..." }` instead of `[ "..." ]` |
| `p.select.age` | array of `N.select` | `{ comm, key, val, filter, selected: "22" }` instead of `[comm, key, val, filter]` |
| `p.form.search`, `p.form.detail` | [N.form](../../ui/form.md) | same options |
| `p.grid.master` | [N.grid](../../ui/grid.md) | `height: 200` |
| `p.popup.dept`, `c.*`, `e.*` | same | same |

# View

```html
<article class="type0402">
    <div id="search" class="search-panel">
        <ul>
            <li><label><span>Name</span><input id="name" type="text"></label></li>
            <li><label><span>Gender</span><select id="gender"><option value="">Select</option></select></label></li>
            <li><label><span>Eye color</span><select id="eyeColor"><option value="">Select</option></select></label></li>
        </ul>
    </div>

    <div class="button-panel">
        <button id="btnSearch" class="btn-search">Search</button>
        <button id="btnSave">Save</button>
    </div>
    <table id="master">
        <thead><tr><th>Name</th><th>Gender</th><th>Age</th><th>Email</th></tr></thead>
        <tbody><tr><td id="name"></td><td id="gender"></td><td id="age"></td><td id="email"></td></tr></tbody>
    </table>

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
</article>
```

# Controller

```html
<script type="text/javascript">
(() => {
    const cont = N(".type0402").cont({
        "p.select.gender": { code: "gender", selected: "male" },
        "p.select.eyeColor": { code: "eyeColor" },
        "p.select.company": { code: "company" },
        "p.select.favoriteFruit": { code: "favoriteFruit" },
        "p.select.age": {
            comm: "c.getSampleCodeList",
            key: "age",
            val: "age",
            filter: function (data) {
                return N(N.array.deduplicate(data, "age")).datasort("age");
            },
            selected: "22"
        },
        "p.form.search": { usage: "search-box" },
        "p.form.detail": { revert: true, autoUnbind: true },
        "p.grid.master": {
            height: 200,
            select: true,
            selectScroll: false,
            onSelect: function (index, rowEle, data, beforeRow, e) {
                if (index > -1) {
                    cont["p.form.detail"].unbind().bind(index, data);
                }
            },
            onBind: function (context, data, isFirstPage, isLastPage) {
                if (isFirstPage) {
                    if (data.length > 0) {
                        this.select(0);
                    } else {
                        cont["p.form.detail"].unbind().bind(0, data);
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
            if (!cont["p.form.detail"].validate()) {
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
                cont["p.form.detail"].add();                 // new row starts with gender "male" and age "22"
            }
        },
        "e.btnDelete.click": function (e) {
            e.preventDefault();
            if (cont["p.form.detail"].data(true)[0]) {
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

The popup page is shown in [Template: search form + grid (CRUD)](search-grid-crud.md).

# Server contract

Identical to [Template: search form + grid + detail form (horizontal)](search-grid-detail-horizontal.md). Because gender is preset, the first search sends `"gender":"male"`.

# How it works

1. **Object form.** `{ code: "gender", selected: "male" }` is the object that the array form `[ "gender" ]` is converted to, plus `selected`; `{ comm, key, val, filter }` is what `[comm, key, val, filter]` becomes. Both forms bind the same way; the object form is needed for `selected` and for `key` / `val` on `code` selects.[^codes]
2. **`selected` applies to every bound element.** After binding, each `N.select` of the declaration gets `val(selected)`. `p.select.gender` binds the search `select` and the detail radio group, so both start at `male`.[^codes][^select]
3. **Presets reach the search.** Components are created only after the code and list requests have finished. The search box's `add()` therefore reads `gender: "male"` into the search row, and the first search is filtered by it.[^template]
4. **Presets become defaults for new rows.** `p.form.detail` captures the initial values of its elements when it is created, also after the selects were preset. `add()` with `autoUnbind: true` first restores those values, so a new row starts with `gender: "male"` and `age: "22"` (when `22` is one of the loaded ages).[^form]
5. Everything else, including the shared data wrapper between grid and form, works as described in [Template: search form + grid + detail form (horizontal)](search-grid-detail-horizontal.md).

# Variations

- **Preset only the detail form**: give the search select another id, or set the detail value in `init` with `cont["p.select.gender"][1].val("male")` (index 1 is the second bound element in document order). A value set in `init` is not part of the form's captured initial values.
- **Array forms**: see the horizontal example; use them when no `selected`, `key` or `val` is needed.

# Pitfalls

The legacy controller stopped after the grid with "the rest is the same as the horizontal layout example"; the Controller above is complete. Its grid callbacks had the same arrow-function problem as the horizontal example:[^iteration]

```js
// Wrong (legacy): onBind: (context, data, isFirstPage, isLastPage) => { if (isFirstPage) { this.select(0); } }
onBind: function (context, data, isFirstPage, isLastPage) { if (isFirstPage && data.length > 0) { this.select(0); } }
```

```js
// Wrong (legacy): onSelect: (index, rowEle, data, beforeRow, e) => { APP.comm.utils.selectNBind.call(this, { args: arguments, cont: cont, form: "p.form.detail" }); }
onSelect: function (index, rowEle, data, beforeRow, e) { if (index > -1) { cont["p.form.detail"].unbind().bind(index, data); } }
```

`selected` is not a default for one element: it is applied to every `select`, radio group or checkbox group with that id, including the search form, which changes the first search. Use a distinct id or set the value in code when only one element should be preset.[^codes]

`p.select.{id}` holds an array even when only one element is bound; read values with an index, `cont["p.select.age"][0].val()`. See [p.{component}.{id} declarations](../../template/component-declaration.md).[^codes]

A `code` declaration without `key` and `val` relies on `N.context.attr("ui").select`; without that global configuration the options have `undefined` labels and values. Add `key: "codeName", val: "code"` (your code-row property names) to the object form when the configuration is not set.[^select]

# Related

- [Template: search form + grid + detail form (horizontal)](search-grid-detail-horizontal.md) - the data flow between grid and detail form in detail.
- [p.{component}.{id} declarations](../../template/component-declaration.md) - object and array forms of `p.select`, `selected`, `filter`.
- [N.form](../../ui/form.md) - initial values, `unbind()` and `add()`.
- [N.select](../../ui/select.md) - `val()` on selects and radio groups.
- [N.grid](../../ui/grid.md) - `select`, `onSelect` and `onBind`.
- [Natural-TEMPLATE conventions](../../template/conventions.md) - lifecycle: codes, components, events, actions, init.

[^codes]: NT.aop.codes (object and array forms, selected)
[^template]: NT.aop.template (codes finish before components are created)
[^iteration]: NU.ui.iteration (onSelect and onBind call with this bound to the grid)
[^form]: NU.form implementation (initial values captured at construction, unbind, add)
[^select]: NU.select implementation (val)
