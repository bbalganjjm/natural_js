---
type: UI Component
title: N.list
description: Renders a JSON object array as li rows of a ul template with id-based two-way binding, row selection, checkboxes, scroll paging and rowStatus tracking.
tags: [ui, component, data-binding, list]
symbols: [N.list, N().list, NU.list, NU.List, NU.Options.List]
sources:
  - id: ui
    resource: ../../src/natural.ui.js
    title: NU.list implementation
    symbol: NU.list
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 1407dc7a79b1
  - id: ui-plugin
    resource: ../../src/natural.ui.js
    title: NU.prototype.list jQuery plugin wrapper
    symbol: NU.prototype.list
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 98d8f68fb16b
  - id: iteration
    resource: ../../src/natural.ui.js
    title: NU.ui.iteration shared row rendering, selection and check logic
    symbol: NU.ui.iteration
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 67e1562d3c04
  - id: form
    resource: ../../src/natural.ui.js
    title: NU.form implementation (one instance per row)
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-List.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.list` renders each row of a JSON object array by cloning the `li` template of a `ul` and binding the row to the elements whose `id` equals a property name. Every rendered `li` is an [N.form](form.md), so edits flow back into the data with `rowStatus`, formatting and validation. Use it for single-column lists; use [N.grid](grid.md) for tables with headers.

# Quick start

```html
<ul id="empList">
    <li>
        <span id="name"></span>
        <span id="age"></span>
        <input id="email" type="text" data-validate='[["email"]]'>
    </li>
</ul>
```

```js
const list = N([]).list({ context: "#empList", select: true });

N.comm("getEmployees.json").submit(function (rows) {
    list.bind(rows);                    // renders asynchronously; use onBind to act on the rows
});
```

# Constructor

## `N(data).list(opts | context)`

- Calls `new NU.list(this, opts)` where `this` is the `N(data)` collection, and returns the **N.list instance**.[^ui-plugin]
- Takes exactly one argument; pass `context` inside the options object when you need other options.

## `new N.list(data, opts | context)`

- `data`: JSON object array (wrapped with `N()`) or an NJS wrapper (kept as is, so it can be shared).
- `opts | context`: a plain object is the options object; anything else becomes `context`.
- The constructor clones every `> li` of the context as the row template, adds `list__`, wires selection, scrolling and check-all, stores the instance (`N(context).instance("list")`) and registers it with `ND.ds`. It does **not** render rows: call `bind()`.[^ui]
- Throws `NC.error("NU.list", e)` when `N.context.attr("ui")` is not defined.

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | array \| NJS | — | Rows. Set by the first constructor argument. |
| `context` | selector \| jQuery | — | A `ul`; all of its `li` children form the row template. |
| `height` | number | `0` | Above 0: wraps the `ul` in a `div.context_wrap__` of that height with a vertical scrollbar and enables scroll paging. `0`: renders every row. |
| `validate` | boolean | `true` | Validates text inputs on focusout (forwarded to row forms). |
| `html` | boolean | `false` | Renders non-input values with `.html()` (forwarded to row forms). |
| `addTop` | boolean | `true` | `add()` without a row index inserts at the top. `false` also forces `scrollPaging.size` and `createRowDelay` to `0`. |
| `addSelect` | boolean | `false` | Selects the row created by `add()`. Needs `select` or `multiselect` and `height > 0`; with `height: 0` it has no effect. |
| `vResizable` | boolean | `false` | Adds a drag handle (`div.v_resizable__`) under the list to resize its height. Needs `height > 0`. |
| `windowScrollLock` | boolean | `true` | Keeps the window from scrolling when the list body is scrolled past its ends. Needs `height > 0`. |
| `select` | boolean | `false` | Single-row selection by click; toggles `list_selected__`. |
| `unselect` | boolean | `true` | `false`: clicking the selected row keeps it selected. Ignored with `multiselect`. |
| `multiselect` | boolean | `false` | Each click toggles that row; several rows can be selected. |
| `checkAll` | selector \| null | `null` | Check-all checkbox, a document-wide selector or jQuery object. Active only together with `checkAllTarget`. |
| `checkAllTarget` | selector \| null | `null` | Row checkbox that `checkAll` controls, searched inside each `li`. |
| `checkSingleTarget` | selector \| null | `null` | Row checkbox for single-check mode. Used only when `checkAll` and `checkAllTarget` are not both set. |
| `hover` | boolean | `false` | Adds `list_hover__` to the context so hovered rows are highlighted. |
| `revert` | boolean | `false` | Enables `revert()` (forwarded to row forms). |
| `createRowDelay` | number | `1` | Milliseconds between row creations while binding. `0` renders all rows synchronously. |
| `scrollPaging` | object | `{ idx: 0, size: 100 }` | `size`: rows rendered per scroll page when `height > 0`; `0` disables paging. `idx` is internal. |
| `fRules` | object \| null | `null` | Declared but never passed to the row forms. |
| `vRules` | object \| null | `null` | Declared but never passed to the row forms. |
| `appendScroll` | boolean | `true` | `bind(data, "append")` scrolls to the bottom. |
| `addScroll` | boolean | `true` | `add(data, row)` with a row index scrolls to that row. |
| `selectScroll` | boolean | `true` | `select(row)` scrolls to the last selected row. |
| `checkScroll` | boolean | `true` | `check(row)` scrolls to the last checked row. |
| `validateScroll` | boolean | `true` | A failed `validate()` scrolls to the last failed row. |
| `cache` | boolean | `true` | Row forms cache their element lookup. Forwarded only to rows rendered by `bind()`; rows created by `add()` use the form default `true`. |
| `tpBind` | boolean | `false` | Row forms bind handlers with top priority. Forwarded only to rows created by `add()`. |

Defaults are the `NU.list` constructor values; nested objects (`scrollPaging`) are deep-merged.[^ui] `row` and `beforeRow` (selected and previously selected index), `isBinding` and `message` are internal or come from global configuration. Event handler options are listed under Events.

# Declarative options

`N.list` does not read `data-opts`. Put `data-format` and `data-validate` on the elements inside the `li` template; they apply to every rendered row. See [N.form](form.md) for how each element type is bound, [N.formatter](../data/formatter.md) and [N.validator](../data/validator.md) for the rules.

```html
<ul id="accounts">
    <li><span id="owner"></span> <input id="balance" type="text" data-format='[["commas"]]' data-validate='[["integer"]]'></li>
</ul>
```

# Methods

## `data([rowStatus][, ...cols])`

| `rowStatus` | Returns |
|---|---|
| omitted | Plain array of all rows. |
| `false` | The NJS wrapper itself; pass it to another component to share and sync the data. |
| `"modified"` | Rows that have any `rowStatus` (`cols` ignored). |
| `"insert"`, `"update"`, `"delete"` (any other string) | Rows whose `rowStatus` equals it. |
| `"selected"` | Rows of rendered `li` elements with `list_selected__`. Returns `undefined` unless `select` or `multiselect` is on. |
| `"checked"` | Rows whose `checkAllTarget` (else `checkSingleTarget`) checkbox is checked. |

With `cols`, the string forms except `"modified"` return objects projected to those keys (`NC.json.mapFromKeys`).[^ui]

## `context([selector])`

Returns the `ul`, or `ul.find(selector)`.

## `contextBodyTemplate([selector])`

Returns the cloned `li` template, or `template.find(selector)`. Changes to the template affect rows rendered afterwards.

## `select()`

Returns an array of selected row indexes. Logs a warning and returns `false` when neither `select` nor `multiselect` is on.

## `select(row[, isAppend])`

Selects the row index or array of indexes by triggering a click on each row, so `onBeforeSelect` and `onSelect` fire. Without `isAppend` the current selection is cleared first. Scrolls to the last row when `selectScroll` is on. Returns the instance, or `false` with a warning when selection is off.

## `check()`

Returns an array of indexes of rows whose `checkAllTarget` (else `checkSingleTarget`) checkbox is checked.

## `check(row[, isAppend])`

Checks the checkbox of the given row index or array of indexes by triggering a click on it. Without `isAppend` all row checkboxes are unchecked first. Scrolls when `checkScroll` is on. Returns the instance.

## `bind([data][, callType])`

- `data`: new rows (array or NJS wrapper) that replace `options.data`; omitted rebinds the current data.
- `callType === "append"`: appends `data` to the current rows and renders only the new ones; scroll paging is turned off for that bind. `"list.bind"` and `"list.update"` are internal values.
- Removes the current rows, then renders rows asynchronously (see Behavior). With no rows it renders `<li class="empty__">` holding the `empty` message.
- If a bind is already running, the call is queued and runs when the current one finishes. Returns the instance.[^ui]

## `add([data][, row])`

Clones the template, then lets a row form create the row: values of the new `li`'s inputs merged with `data`, `rowStatus: "insert"`. A numeric first argument is taken as `row`; a `row` below 0 or above `data.length` is ignored. Without `row` the row goes to the top (`addTop: true`) or the bottom. Calls `rowHandlerBeforeBind` and `rowHandler` and clears the selection. With `height > 0` it also scrolls to the row and, with `addSelect`, selects it; both happen through the `div.context_wrap__` scroll box, so with `height: 0` neither happens. Returns the instance.[^ui]

## `remove(row)`

For each index (number or array): a row with `rowStatus: "insert"` is removed from the data and the DOM; any other row gets `rowStatus: "delete"` and `row_data_deleted__`. Throws `NC.error("[NU.list.prototype.remove]Row index is out of range")` for a missing row. Without `row` nothing is removed (linked components are still notified). Returns the instance.

## `revert([row])`

Reverts the given row index or array through each row's form, calling `rowHandlerBeforeBind` (with the revert snapshot) and `rowHandler`. Without `row`, reverts every row whose `rowStatus` is `"update"` or `"insert"`. Throws when the `revert` option is `false`. Returns the instance.

## `validate([row])`

- `validate(row)`: validates the single row index through its form and returns a boolean.
- `validate()`: validates only rows whose `rowStatus` is `"update"` or `"insert"`, or that already contain a `validate_false__` element; untouched rows are skipped. Returns `true` when all pass and scrolls to the last failure when `validateScroll` is on.[^ui]

## `val(row, key)`

Returns `data[row][key]`.

## `val(row, key, value)`

Sets the value through the rendered row's form (`form.val(key, value)`; see [N.form](form.md)). If the row is not rendered, writes `data[row][key]` directly; throws `NC.error("[NU.list.prototype.val]There is no row data that is <row> index")` when the row does not exist. Returns the instance.

## `move(fromRow, toRow)`

Moves the row so it sits before the row currently at `toRow`; a `toRow` past the last index moves it to the end. Moves both the data and the `li`. Does not change `rowStatus` or notify linked components. Returns the instance.[^iteration]

## `copy(fromRow, toRow)`

Inserts the row at `fromRow` again before `toRow` (or at the end) and clones its `li`. See Known issues before using it. Returns the instance.

## `update([row][, key])`

Called by `ND.ds` when a component sharing the data changes it. With `row` and `key`, updates that element in the row's form; with `row` only, re-renders the row (or rebinds the whole list for an `"insert"` row); with no arguments, rebinds the list without firing `onBind`. Returns the instance.

# Events

| Name | Signature | `this` | When |
|---|---|---|---|
| `rowHandlerBeforeBind` | `function(rowIdx, rowEle, rowData)` | the `N.list` instance | For each row created by `bind()` or `add()`, after the `li` is cloned and before its data is bound. Also before `revert(row)`, with the revert snapshot as `rowData`. |
| `rowHandler` | `function(rowIdx, rowEle, rowData)` | the `N.list` instance | For each row, after its data is bound. |
| `onBeforeSelect` | `function(row, rowEle, data, beforeRow, e)` | the `N.list` instance | On a row click with `select` or `multiselect`, before the selection classes change. `row` is the clicked index or `-1` when the click deselects; `data` is the **whole** NJS data wrapper (use `data[row]`); `beforeRow` is the previously selected index. Returning `false` leaves the classes unchanged (see Known issues). |
| `onSelect` | `function(row, rowEle, data, beforeRow, e)` | the `N.list` instance | After the selection classes change. When a row was selected, `beforeRow` already equals `row`. |
| `onBind` | `function(context, data, isFirstPage, isLastPage)` | the `N.list` instance | After the last row of a bind (or of each scroll page) is rendered, and after an empty bind with `(context, data, true, true)`. Not fired by `update()` rebinds. |

`rowEle` is the jQuery-wrapped `li`. A global handler with the same name in `N.context.attr("ui").list` chains after the local one for `onBeforeSelect`, `onSelect` and `onBind` (a local `false` return stops it). See [Component model](component-model.md).[^iteration]

# Global configuration

`N.context.attr("ui").list` is deep-merged over the constructor defaults. The shipped `natural.config.js` sets `message.empty` per locale (`ko_KR`, `en_US`), the text of the empty-row `li`. Keep a `message` entry for every locale you use: an empty bind reads `message[N.locale()].empty` and throws if that locale is missing. See [Configuration](../setup/configuration.md).

# Behavior

- **Asynchronous rendering**: `bind()` renders the first row immediately and each following row in a `setTimeout(createRowDelay)` chain, so `bind()` returns before all rows exist. Run code that needs the rows (`select`, `check`, `val` on late rows) in `onBind`.
- **Scroll paging**: with `height > 0` and `scrollPaging.size > 0`, only `size` rows are rendered; scrolling to the bottom renders the next page and fires `onBind` again. With `height: 0` every row is rendered.
- **Rows are forms**: each `li` gets the class `form__` and an `N.form` instance (`N(li).instance("form")`), so row edits set `rowStatus`, validate and notify `ND.ds`. Rows rendered by `bind()` get a form with `unbind: false` and the list's `cache`; rows created by `add()` get the form defaults (`unbind: true`, `cache: true`) plus the list's `tpBind`.[^iteration] [^ui]
- **Selection** listens to clicks on `> li`; clicks on the `checkAllTarget` or `checkSingleTarget` checkbox do not change the selection.
- **Check-all** only checks the rows currently rendered, and it can only check: unchecking does not propagate (see Known issues).
- **CSS classes**: `list__`, `list_select__` (context, selection on), `list_selected__`, `list_hover__`, `empty__`, `context_wrap__`, `v_resizable__`, plus the row form classes `form__`, `row_data_changed__`, `row_data_deleted__`, `data_changed__`. See [Theming](theming.md).

# Pitfalls

`onSelect` receives the whole data wrapper as its third argument, not the selected row.[^iteration]

```js
// Wrong (legacy): onSelect: (rowIdx, rowEle, rowData) => { console.log(rowData.name); }
onSelect: function (row, rowEle, data, beforeRow, e) {
    if (row > -1) console.log(data[row].name);
}
```

Scroll paging needs the `height` option; a CSS height on the `ul` renders every row at once.

```js
// Wrong (legacy): N(data).list({ context: "#bigList", scrollPaging: { size: 50 } }); // height only in CSS
N(data).list({ context: "#bigList", height: 300, scrollPaging: { size: 50 } }).bind();
```

`addTop` defaults to `true`, so `add()` inserts at the top. `addTop: false` appends, but also turns off scroll paging and row delay for the whole list.

`validate()` skips rows the user has not changed. To check every rendered row, call `validate(i)` for each index.

```js
let allValid = true;
list.context(">li.form__").each(function (i) {
    if (!list.validate(i)) allValid = false;   // rendered rows only; unrendered rows have no form
});
```

`validate(row)` takes one index, not an array.

`select()` and `check()` without arguments are getters that return index arrays; `select()` returns `false` when neither `select` nor `multiselect` is on.

Code right after `bind(rows)` runs before most rows exist. Put follow-up work in `onBind`.

```js
N([]).list({
    context: "#empList",
    select: true,
    onBind: function (context, data, isFirstPage, isLastPage) {
        if (isLastPage && data.length > 0) this.select(0);
    }
}).bind(rows);
```

# Known issues

* **`onBeforeSelect` returning `false` does not cancel the selection event** - Actual: `options.row` is updated before `onBeforeSelect` runs, and `onSelect` fires even when it returns `false`; only the `list_selected__` class change is skipped. Likely intent: cancel the selection. Workaround: return `false` from `onBeforeSelect` and check the same condition at the top of `onSelect`.[^iteration]
* **`checkSingleTarget` does not uncheck the other rows** - Actual: the handler calls `removeAttr("checked")` on the other checkboxes; under jQuery 3 (the bundled 3.7.1) that no longer clears the `checked` property, so a box checked by a click stays checked. Likely intent: radio-like single check. Workaround: uncheck the others yourself in a click handler with `.prop("checked", false)`.[^iteration]
* **Tabbing through a row marks it updated** - Actual: row forms compare the row value with the input's string value using `!==` on focusout, so a row whose number or boolean fields sit in text inputs gets `rowStatus: "update"` (and string values) when the user merely leaves such an input. Likely intent: mark only real changes. Workaround: convert those fields to strings before binding, for example in `rowHandlerBeforeBind`. See [N.form](form.md).[^form]
* **`fRules`, `vRules` and most of `tpBind` have no effect** - Actual: rows rendered by `bind()` get a form without `fRules`, `vRules` or `tpBind`; rows created by `add()` get `tpBind` only. Likely intent: forward all three to every row form. Workaround: use `data-format` and `data-validate` attributes.[^iteration]
* **`remove([...])` hits the wrong rows for multi-digit indexes** - Actual: the indexes are ordered with `Array.prototype.sort()` (string order) and then reversed, so `[2, 10]` is processed as 2, then 10. Once an inserted row is spliced from the data and the DOM, every index processed after it points one row further, so the wrong rows are removed or marked `"delete"`: with `[2, 10]` and row 2 inserted, the row originally at index 11 gets `rowStatus: "delete"` instead of the one at index 10. Likely intent: process from the highest index down. Workaround: call `remove(i)` once per index, highest index first.[^ui]
* **Check-all can only check** - Actual: `NU.ui.iteration.checkAll` unchecks with `.removeProp("checked")`, which under jQuery 3 (the bundled 3.7.1) is `delete elem.checked` and leaves the native `checked` property unchanged. Clearing the check-all box leaves the row boxes checked, and clearing a row box leaves the check-all box checked; only checking (`.prop("checked", true)`) works. Likely intent: toggle in both directions. Workaround: bind your own click handlers that uncheck with `.prop("checked", false)`.[^iteration]
* **`add(data, row)` with `row` equal to the row count adds data but no `li`** - Actual: that branch never inserts the cloned template, so the row exists in the data but is not shown until the next `bind()`. Likely intent: append at the end. Workaround: use `add(data)` with `addTop: false`, or rebind after adding.[^ui]
* **`copy()` shares the row object** - Actual: the same object is inserted twice and the `li` is cloned together with its form instance; no `rowStatus` is set. Editing either row changes both. Likely intent: insert an independent copy. Workaround: `list.add(jQuery.extend({}, list.data()[fromRow]), toRow)`.[^iteration]
* **`val(row, key, value)` on a row that is not rendered skips rowStatus** - Actual: with scroll paging, a row outside the rendered pages is written directly, without `rowStatus: "update"` or an `ND.ds` notification. Likely intent: same result as for rendered rows. Workaround: also set `data[row].rowStatus = "update"` when the row has no `rowStatus`.[^ui]
* **`onBind`'s `isFirstPage` is `false` for non-paged lists with many rows** - Actual: it is computed as `rendered === scrollPaging.size || data.length <= scrollPaging.size`, so with `height: 0` (or `addTop: false`) and more rows than `scrollPaging.size` it is `false`. Likely intent: `true` when paging is off. Workaround: rely on `isLastPage` when `height` is `0`.[^iteration]

# Examples

Basic binding:

```js
N([
    { name: "Hong Gil-dong", age: 30, email: "hong@example.com" },
    { name: "Kim Cheol-su", age: 25, email: "kim@example.com" }
]).list("#empList").bind();
```

Row selection:

```js
const list = N(data).list({
    context: "#empList",
    select: true,
    onSelect: function (row, rowEle, data, beforeRow, e) {
        if (row > -1) console.log("Selected", row, data[row]);
    }
}).bind();
```

Checkbox selection:

```html
<label><input type="checkbox" id="checkAll"> Select all</label>
<ul id="checkList">
    <li><input type="checkbox" class="row-check"> <span id="name"></span> <span id="age"></span></li>
</ul>
<button id="btnChecked">Show checked</button>
```

```js
const list = N(data).list({
    context: "#checkList",
    checkAll: "#checkAll",
    checkAllTarget: ".row-check"
}).bind();

N("#btnChecked").on("click", function () {
    console.log(list.data("checked"), list.check());
});
```

Scroll paging over a large array:

```js
N(bigData).list({
    context: "#bigList",
    height: 300,
    scrollPaging: { size: 50 },
    onBind: function (context, data, isFirstPage, isLastPage) {
        console.log("page rendered", isFirstPage, isLastPage);
    }
}).bind();
```

Editable rows with per-row validation:

```html
<ul id="editList">
    <li>
        <input id="name" type="text" data-validate='[["required"]]'>
        <input id="email" type="text" data-validate='[["required"], ["email"]]'>
        <button class="btn-check">Check</button>
    </li>
</ul>
```

```js
const list = N(data).list({
    context: "#editList",
    revert: true,
    rowHandler: function (rowIdx, rowEle, rowData) {
        const self = this;
        rowEle.find(".btn-check").on("click", function () {
            console.log(self.validate(rowIdx), self.data("modified"));
        });
    }
}).bind();

N("#btnAdd").on("click", function () { list.add(); });
N("#btnValidate").on("click", function () { console.log(list.validate()); });
```

# Related

- [N.form](form.md) - the per-row binding rules, element types and `val()` semantics.
- [N.grid](grid.md) - the table-based sibling with headers, sorting, filtering and fixed columns.
- [N.pagination](pagination.md) - page a list by server or client data instead of scroll paging.
- [N.ds](../data/datasync.md) - sync between components that share `data(false)`.
- [Component model](component-model.md) - instances, option precedence and global event handlers.
- [Retrieve a data list](../examples/retrieve-data-list.md) - end-to-end retrieve and render example.

[^ui]: NU.list implementation
[^ui-plugin]: NU.prototype.list jQuery plugin wrapper
[^iteration]: NU.ui.iteration shared row rendering, selection and check logic
[^form]: NU.form implementation (one instance per row)
