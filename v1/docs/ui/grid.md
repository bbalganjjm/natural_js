---
type: UI Component
title: N.grid
description: Renders a JSON object array as tbody rows of a table template with id-based binding, fixed header or list layout, selection, sorting, filtering and rowStatus.
tags: [ui, component, data-binding, grid]
symbols: [N.grid, N().grid, NU.grid, NU.Grid, NU.Options.Grid, NU.Options.GridMisc]
sources:
  - id: ui
    resource: ../../src/natural.ui.js
    title: NU.grid implementation
    symbol: NU.grid
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 3ba583d8d43c
  - id: ui-plugin
    resource: ../../src/natural.ui.js
    title: NU.prototype.grid jQuery plugin wrapper
    symbol: NU.prototype.grid
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: aa060d1d1faa
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
  - id: comm-request
    resource: ../../src/natural.architecture.js
    title: NA.comm.request request data serialization
    symbol: NA.comm.request
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: b2f7caecba91
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Grid.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.grid` renders each row of a JSON object array by cloning the `tbody` template of a `table` and binding the row to the elements whose `id` equals a property name. Every rendered `tbody` is an [N.form](form.md), so edits flow back into the data with `rowStatus`, formatting and validation. The `height` option picks the layout: `0` is a list-type grid that shows every row, above `0` is a fixed-header grid with a scrolling body and scroll paging.

# Quick start

```html
<table id="empGrid" style="width: 100%;">
    <thead>
        <tr><th>Name</th><th>Age</th><th>Email</th><th>Registered</th></tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text" data-validate='[["required"]]'></td>
            <td><input id="age" type="text" data-validate='[["integer"]]'></td>
            <td><input id="email" type="text"></td>
            <td id="registered" data-format='[["date", 8]]'></td>
        </tr>
    </tbody>
</table>
```

```js
const grid = N([]).grid({ context: "#empGrid", height: 300, select: true, sortable: true });

N.comm("getEmployees.json").submit(function (rows) {
    grid.bind(rows);                    // renders asynchronously; use onBind to act on the rows
});
```

# Constructor

## `N(data).grid(opts | context)`

- Calls `new NU.grid(this, opts)` where `this` is the `N(data)` collection, and returns the **N.grid instance**.[^ui-plugin]
- Takes exactly one argument; pass `context` inside the options object when you need other options.

## `new N.grid(data, opts | context)`

- `data`: JSON object array (wrapped with `N()`) or an NJS wrapper (kept as is, so it can be shared).
- `opts | context`: a plain object is the options object; anything else becomes `context`.
- The constructor clones every `> tbody` of the table as the row template, adds `grid__`, builds the fixed header (`height > 0`) or fixed columns (`height === 0`), maps header cells to column ids, wires selection, check-all, sorting, resizing, filtering, paste and the `more` tools, stores the instance (`N(table).instance("grid")`) and registers it with `ND.ds`. It does **not** render rows: call `bind()`.[^ui]
- Throws `NC.error("NU.grid", e)` when `N.context.attr("ui")` is not defined.

The context table: `thead` holds the column titles (`th`, several `tr` allowed); the `tbody` is the row template (several `tr` allowed for multi-line rows; keep one `tbody`, because every `> tbody` is cloned into the template); `tfoot` is optional. Sorting, filtering, `checkAll` and `more` need a `thead`.

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | array \| NJS | — | Rows. Set by the first constructor argument. |
| `context` | selector \| jQuery | — | The `table`. |
| `height` | number | `0` | Above 0: fixed header, body scrolls at that height, scroll paging on. `0`: list type, every row rendered. |
| `fixedcol` | number | `0` | Number of left columns kept in place while the rest scrolls horizontally. Applied only when `height` is `0`. |
| `more` | boolean \| string[] | `false` | Adds a column with a show/hide-columns button in the header and a detail-popup button in each row. `true` lists every id of the template in the popup; an array lists only those column ids. |
| `validate` | boolean | `true` | Validates text inputs on focusout (forwarded to row forms). |
| `html` | boolean | `false` | Renders non-input values with `.html()` (forwarded to row forms). |
| `addTop` | boolean | `true` | `add()` without a row index inserts at the top. `false` also forces `scrollPaging.size` and `createRowDelay` to `0`. |
| `addSelect` | boolean | `false` | Selects the row created by `add()`. Needs `select` or `multiselect` and `height > 0`; with `height: 0` (including `fixedcol` grids) it has no effect. |
| `filter` | boolean | `false` | Adds a value filter to every header cell. Per-column filters use `th data-filter="true"`. |
| `resizable` | boolean | `false` | Column widths can be dragged in the header. Moves `col` widths from a `colgroup` to the `th` cells and removes the `colgroup`. |
| `vResizable` | boolean | `false` | Adds a drag handle under the grid to resize the body height. Needs `height > 0`. |
| `sortable` | boolean | `false` | Clicking a header cell that has a column id and text sorts by that column, alternating ascending and descending. |
| `windowScrollLock` | boolean | `true` | Keeps the window from scrolling when the grid body is scrolled past its ends. Needs `height > 0`. |
| `select` | boolean | `false` | Single-row selection by click; toggles `grid_selected__` on the `tbody`. |
| `unselect` | boolean | `true` | `false`: clicking the selected row keeps it selected. Ignored with `multiselect`. |
| `multiselect` | boolean | `false` | Each click toggles that row; several rows can be selected. |
| `checkAll` | selector \| null | `null` | Check-all checkbox, searched inside the `thead`. Active only together with `checkAllTarget`. |
| `checkAllTarget` | selector \| null | `null` | Row checkbox that `checkAll` controls, searched inside the row cells. |
| `checkSingleTarget` | selector \| null | `null` | Row checkbox for single-check mode. Used only when `checkAll` and `checkAllTarget` are not both set. |
| `hover` | boolean | `false` | Adds `grid_hover__` to the table so hovered rows are highlighted. |
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
| `pastiable` | boolean | `false` | Paste tab- and newline-separated text (for example from Excel) into the rows, starting at the focused cell. |
| `misc` | object | see below | Pixel corrections for `resizable` and `fixedcol` layouts. |

`misc` defaults in the constructor are all `0` except `fixedcolBodyAddHeight: 1` and `fixedcolRootContainer: null`; the shipped configuration overrides several of them per browser. Keys: `resizableCorrectionWidth`, `resizableLastCellCorrectionWidth`, `resizeBarCorrectionLeft`, `resizeBarCorrectionHeight`, `fixedcolHeadMarginTop`, `fixedcolHeadMarginLeft`, `fixedcolHeadHeight`, `fixedcolBodyMarginTop`, `fixedcolBodyMarginLeft`, `fixedcolBodyBindHeight`, `fixedcolBodyAddHeight`, `fixedcolRootContainer` (selector of the element that gets `position: relative`; `null` uses the grid container).

Defaults are the `NU.grid` constructor values; nested objects are deep-merged.[^ui] `row`, `beforeRow`, `currMoveToRow`, `isBinding`, `message` and `sortableItem` are internal or come from global configuration. Event handler options are listed under Events.

# Declarative options

`N.grid` does not read `data-opts`. Declarative settings are attributes:

| Attribute | On | Effect |
|---|---|---|
| `data-format` | elements in the `tbody` template | Format rules, see [N.formatter](../data/formatter.md). |
| `data-validate` | elements in the `tbody` template | Validation rules, see [N.validator](../data/validator.md). |
| `data-filter="true"` | `th` | Enables the value filter for that column. |
| `data-rowspan="true"` | `th` | Visually merges consecutive rows with equal values in that column (the repeated cell content is hidden). |
| `data-id="colId"` | `th` | Column id for sort, filter, rowspan and `more`. Usually filled automatically; see Known issues. |

```html
<thead>
    <tr><th data-filter="true">Dept</th><th data-rowspan="true">Team</th><th>Name</th></tr>
</thead>
<tbody>
    <tr><td id="dept"></td><td id="team"></td><td><input id="name" type="text"></td></tr>
</tbody>
```

The constructor gives each `th` the id of the element in the matching `tbody` cell: the `td`'s own `id`, else the first descendant with an `id`. A column without an id cannot be sorted or filtered.

# Methods

## `data([rowStatus][, ...cols])`

| `rowStatus` | Returns |
|---|---|
| omitted | Plain array of all bound rows. |
| `false` | The NJS wrapper itself; pass it to another component to share and sync the data. |
| `"modified"` | Rows that have any `rowStatus` (`cols` ignored). |
| `"insert"`, `"update"`, `"delete"` (any other string) | Rows whose `rowStatus` equals it. |
| `"selected"` | Rows of rendered `tbody` elements with `grid_selected__`. Returns `undefined` unless `select` or `multiselect` is on. |
| `"checked"` | Rows whose `checkAllTarget` (else `checkSingleTarget`) checkbox is checked. |

With `cols`, the string forms except `"modified"` return objects projected to those keys (`NC.json.mapFromKeys`). While a filter is active, all forms see only the filtered rows (see Pitfalls).[^ui]

## `context([selector])`

Returns the body `table`, or `table.find(selector)`.

## `contextHead([selector])`

Returns the header `thead` (the one in the separate header table when `height > 0`), or `thead.find(selector)`.

## `contextBodyTemplate([selector])`

Returns the cloned `tbody` template, or `template.find(selector)`. Changes to the template affect rows rendered afterwards.

## `select()`

Returns an array of selected row indexes. Logs a warning and returns `false` when neither `select` nor `multiselect` is on.

## `select(row[, isAppend])`

Selects the row index or array of indexes by triggering a click on each `tbody`, so `onBeforeSelect` and `onSelect` fire. Without `isAppend` the current selection is cleared first. Scrolls to the last row when `selectScroll` is on. Returns the instance, or `false` with a warning when selection is off.

## `check()`

Returns an array of indexes of rows whose `checkAllTarget` (else `checkSingleTarget`) checkbox is checked.

## `check(row[, isAppend])`

Checks the checkbox of the given row index or array of indexes by triggering a click on it. Without `isAppend` all row checkboxes are unchecked first. Scrolls when `checkScroll` is on. Returns the instance.

## `bind([data][, callType])`

- `data`: new rows (array or NJS wrapper) that replace `options.data`; omitted rebinds the current data.
- `callType === "append"` (the string): appends `data` to the current rows and renders only the new ones; scroll paging is turned off for that bind. `"grid.bind"`, `"grid.dataFilter"`, `"grid.sort"` and `"grid.update"` are internal values.
- Clears the sort indicator (except for sort binds) and the filter panels (except for filter binds), unchecks `checkAll`, removes the current rows and renders rows asynchronously (see Behavior). With no rows it renders one `tbody` whose `td.empty__` spans the visible columns and holds the `empty` message.
- If a bind is already running, the call is queued and runs when the current one finishes. Returns the instance.[^ui]

## `add([data][, row])`

Clones the template, then lets a row form create the row: values of the new row's inputs merged with `data`, `rowStatus: "insert"`. A numeric first argument is taken as `row`; a `row` below 0 or above `data.length` is ignored. Without `row` the row goes right after the `thead` (`addTop: true`) or to the end. Calls `rowHandlerBeforeBind` and `rowHandler` and clears the selection. With `height > 0` it also scrolls to the row and, with `addSelect`, selects it; both happen through the `div.tbody_wrap__` scroll box, so with `height: 0` neither happens. Returns the instance.[^ui]

## `remove(row)`

For each index (number or array): a row with `rowStatus: "insert"` is removed from the data and the DOM; any other row gets `rowStatus: "delete"` and `row_data_deleted__`. Throws `NC.error("[NU.grid.prototype.remove]Row index is out of range")` for a missing row. Without `row` nothing is removed (linked components are still notified). Returns the instance.

## `revert([row])`

Reverts the given row index or array through each row's form, calling `rowHandlerBeforeBind` (with the revert snapshot) and `rowHandler`. Without `row`, reverts every row whose `rowStatus` is `"update"` or `"insert"`. Throws when the `revert` option is `false`. Returns the instance.

## `validate([row])`

- `validate(row)`: validates the single row index through its form and returns a boolean.
- `validate()`: validates only rows whose `rowStatus` is `"update"` or `"insert"`, or that already contain a `validate_false__` element; untouched rows are skipped. Returns `true` when all pass and scrolls to the last failure when `validateScroll` is on.[^ui]

## `val(row, key)`

Returns `data[row][key]`.

## `val(row, key, value)`

Sets the value through the rendered row's form (`form.val(key, value)`; see [N.form](form.md)). If the row is not rendered, writes `data[row][key]` directly; throws `NC.error("[NU.grid.prototype.val]There is no row data that is <row> index")` when the row does not exist. Returns the instance.

## `move(fromRow, toRow)`

Moves the row so it sits before the row currently at `toRow`; a `toRow` past the last index moves it to the end. Moves both the data and the `tbody`. Does not change `rowStatus` or notify linked components. Returns the instance.[^iteration]

## `copy(fromRow, toRow)`

Inserts the row at `fromRow` again before `toRow` (or at the end) and clones its `tbody`. See Known issues before using it. Returns the instance.

## `show(colIdxs)`

Shows the column index or array of indexes hidden by `hide()`, restoring reduced `colspan` values, and updates the `colspan` of the empty-row cell. Column indexes are 0-based positions in the header/body cell map (cells carry `col_<n>__` classes). Returns the instance.

## `hide(colIdxs)`

Hides the column index or array of indexes in the header, the rendered rows and the template (cells spanning the column lose one `colspan` and are hidden at 0). Returns the instance.

## `update([row][, key])`

Called by `ND.ds` when a component sharing the data changes it. With `row` and `key`, updates that element in the row's form; with `row` only, re-renders the row (or rebinds the whole grid for an `"insert"` row); with no arguments, rebinds the grid without firing `onBind`. Returns the instance.

# Events

| Name | Signature | `this` | When |
|---|---|---|---|
| `rowHandlerBeforeBind` | `function(rowIdx, rowEle, rowData)` | the `N.grid` instance | For each row created by `bind()` or `add()`, after the `tbody` is cloned and before its data is bound. Also before `revert(row)`, with the revert snapshot as `rowData`. |
| `rowHandler` | `function(rowIdx, rowEle, rowData)` | the `N.grid` instance | For each row, after its data is bound. |
| `onBeforeSelect` | `function(row, rowEle, data, beforeRow, e)` | the `N.grid` instance | On a row click with `select` or `multiselect`, before the selection classes change. `row` is the clicked index or `-1` when the click deselects; `data` is the **whole** NJS data wrapper (use `data[row]`); `beforeRow` is the previously selected index. Returning `false` leaves the classes unchanged (see Known issues). |
| `onSelect` | `function(row, rowEle, data, beforeRow, e)` | the `N.grid` instance | After the selection classes change. When a row was selected, `beforeRow` already equals `row`. |
| `onBind` | `function(context, data, isFirstPage, isLastPage)` | the `N.grid` instance | After the last row of a bind (or of each scroll page) is rendered, and after an empty bind with `(context, data, true, true)`. Not fired by `update()` rebinds. |

`rowEle` is the jQuery-wrapped `tbody`. A global handler with the same name in `N.context.attr("ui").grid` chains after the local one for `onBeforeSelect`, `onSelect` and `onBind` (a local `false` return stops it). See [Component model](component-model.md).[^iteration]

# Global configuration

`N.context.attr("ui").grid` is deep-merged over the constructor defaults. The shipped `natural.config.js` defines:

| Key | Purpose |
|---|---|
| `sortableItem` | `{ asc: "▲", desc: "▼" }`, HTML shown in the sorted header cell. Required when `sortable` is on (see Known issues for the swap). |
| `message` | Per-locale texts: `empty`, `search`, `selectAll`, `dFilter`, `more`, `column`, `showHide`, `prev`, `next`. Required: an empty bind, the filter and `more` read `message[N.locale()]` and throw if that locale is missing. |
| `misc` | Browser-specific pixel corrections for `resizable` and `fixedcol`, and `fixedcolRootContainer: ".view_context__"`. |

See [Configuration](../setup/configuration.md).

# Behavior

- **Layouts**: with `height > 0` the table is wrapped in `div.grid_wrap__` holding `div.thead_wrap__` (a copy of the table with the `thead`), `div.tbody_wrap__` (the original table, fixed height, vertical scroll) and, when the table has a `tfoot`, `div.tfoot_wrap__` (a copy of the table with the `tfoot`). With `fixedcol > 0` and `height: 0`, the table is wrapped in `div.grid_container__ > div.grid_wrap__` and the fixed cells get `grid_head_fixed__` / `grid_body_fixed__` and absolute positions.
- **Asynchronous rendering**: `bind()` renders the first row immediately and each following row in a `setTimeout(createRowDelay)` chain, so `bind()` returns before all rows exist. Run code that needs the rows in `onBind`.
- **Scroll paging**: with `height > 0` and `scrollPaging.size > 0`, only `size` rows are rendered; scrolling to the bottom renders the next page and fires `onBind` again.
- **Rows are forms**: each `tbody` gets the class `form__` and an `N.form` instance (`N(tbody).instance("form")`), so row edits set `rowStatus`, validate and notify `ND.ds`. Rows rendered by `bind()` get a form with `unbind: false` and the grid's `cache`; rows created by `add()` get the form defaults (`unbind: true`, `cache: true`) plus the grid's `tpBind`.[^iteration] [^ui]
- **Sorting** wraps the same rows in a new NJS object, sorts it with `datasort` and rebinds it. **Filtering** lists the distinct values of a column and rebinds only the rows whose values stay checked. Both replace `options.data` with a new wrapper.
- **Paste** (`pastiable`): non-input `id` elements become `contenteditable` and accept only Ctrl key combinations; pasted cells are written with `val()` from the focused cell to the right and down, skipping `readonly` and `disabled` elements.
- **Selection** listens to clicks on `> tbody`; clicks on the `checkAllTarget` or `checkSingleTarget` checkbox do not change the selection. **Check-all** only checks the rows currently rendered, and it can only check: unchecking does not propagate (see Known issues).
- **CSS classes**: `grid__`, `grid_select__`, `grid_selected__`, `grid_hover__`, `empty__`, `grid_wrap__`, `thead_wrap__`, `tbody_wrap__`, `tfoot_wrap__`, `grid_container__`, `sortable__` with `asc__` / `desc__`, `btn_data_filter__`, `data_filter_panel__`, `grid_rowspan__`, `grid_more_*`, `resize_bar__`, `v_resizable__`, `col_<n>__`, plus the row form classes `form__`, `row_data_changed__`, `row_data_deleted__`, `data_changed__`. See [Theming](theming.md).

# Pitfalls

`add()` takes the data first and the row index second.[^ui]

```js
// Wrong (legacy): grid.add(0, { name: "new" });
grid.add({ name: "new" }, 0);
grid.add(0);            // a numeric first argument is the row index
```

`onSelect` receives the whole data wrapper as its third argument, not the selected row.[^iteration]

```js
// Wrong (legacy): onSelect: (rowIdx, rowEle, rowData) => { console.log(rowData.name); }
onSelect: function (row, rowEle, data, beforeRow, e) {
    if (row > -1) console.log(data[row].name);
}
```

Append mode is the string `"append"`, not a boolean.

```js
// Wrong (legacy): grid.bind(moreRows, true);
grid.bind(moreRows, "append");
```

`N.grid` is a class; call it with `new` (only `N.comm` and `N.notify` are factory wrappers).

```js
// Wrong (legacy): const grid = N.grid(data, "#empGrid");
const grid = new N.grid(data, "#empGrid");
```

`addTop` defaults to `true`, so `add()` inserts at the top. `addTop: false` appends, but also turns off scroll paging and row delay for the whole grid.

`fixedcol` does nothing on a fixed-header grid; it is applied only when `height` is `0`.

While a filter is active, `options.data` holds only the visible rows, so `data()`, `data("modified")` and `validate()` ignore filtered-out rows, and a form sharing the old `data(false)` wrapper stops syncing. Clear the filter (or rebind) before saving.

`validate()` skips rows the user has not changed; `validate(row)` takes one index. To check every rendered row, call `validate(i)` for each rendered `tbody`.

```js
let allValid = true;
grid.context(">tbody.form__").each(function (i) {
    if (!grid.validate(i)) allValid = false;
});
```

Code right after `bind(rows)` runs before most rows exist. Put follow-up work in `onBind`.

To send several rows, pass `dataIsArray: true` to the communicator. `N(rows).comm(url)` serializes only the first row (`obj.get(0)`), because `dataIsArray` defaults to `false`.[^comm-request] See [N.comm](../architecture/communicator.md).

```js
N(grid.data("modified")).comm({ url: "saveEmployees.json", dataIsArray: true }).submit(function (res) { /* ... */ });
```

# Known issues

* **`onBeforeSelect` returning `false` does not cancel the selection event** - Actual: `options.row` is updated before `onBeforeSelect` runs, and `onSelect` fires even when it returns `false`; only the `grid_selected__` class change is skipped. Likely intent: cancel the selection. Workaround: return `false` from `onBeforeSelect` and check the same condition at the top of `onSelect`.[^iteration]
* **`checkSingleTarget` does not uncheck the other rows** - Actual: the handler calls `removeAttr("checked")` on the other checkboxes; under jQuery 3 (the bundled 3.7.1) that no longer clears the `checked` property, so a box checked by a click stays checked. Likely intent: radio-like single check. Workaround: uncheck the others yourself in a click handler with `.prop("checked", false)`.[^iteration]
* **Tabbing through a row marks it updated** - Actual: row forms compare the row value with the input's string value using `!==` on focusout, so a row whose number or boolean fields sit in text inputs gets `rowStatus: "update"` (and string values) when the user merely leaves such an input. `data("modified")` then includes untouched rows. Likely intent: mark only real changes. Workaround: convert those fields to strings before binding, for example in `rowHandlerBeforeBind`. See [N.form](form.md).[^form]
* **`fRules`, `vRules` and most of `tpBind` have no effect** - Actual: rows rendered by `bind()` get a form without `fRules`, `vRules` or `tpBind`; rows created by `add()` get `tpBind` only. Likely intent: forward all three to every row form. Workaround: use `data-format` and `data-validate` attributes.[^iteration]
* **`remove([...])` hits the wrong rows for multi-digit indexes** - Actual: the indexes are ordered with `Array.prototype.sort()` (string order) and then reversed, so `[2, 10]` is processed as 2, then 10. Once an inserted row is spliced from the data and the DOM, every index processed after it points one row further, so the wrong rows are removed or marked `"delete"`: with `[2, 10]` and row 2 inserted, the row originally at index 11 gets `rowStatus: "delete"` instead of the one at index 10. Likely intent: process from the highest index down. Workaround: call `remove(i)` once per index, highest index first.[^ui]
* **Check-all can only check** - Actual: `NU.ui.iteration.checkAll` unchecks with `.removeProp("checked")`, which under jQuery 3 (the bundled 3.7.1) is `delete elem.checked` and leaves the native `checked` property unchanged. Clearing the header box leaves the row boxes checked, and clearing a row box leaves the header box checked; only checking (`.prop("checked", true)`) works. Likely intent: toggle in both directions. Workaround: bind your own click handlers that uncheck with `.prop("checked", false)`.[^iteration]
* **`add()` can add data without a visible row** - Actual: with `row` equal to the row count, the cloned `tbody` is never inserted; with `addTop: true` and no row index, it is inserted after `> thead`, so a grid without a `thead` gets no row either. The data row exists in both cases. Likely intent: append at the end / insert at the top. Workaround: keep a `thead`; to append, use `add(data)` with `addTop: false` or rebind after adding.[^ui]
* **`copy()` shares the row object** - Actual: the same object is inserted twice and the `tbody` is cloned together with its form instance; no `rowStatus` is set. Editing either row changes both. Likely intent: insert an independent copy. Workaround: `grid.add(jQuery.extend({}, grid.data()[fromRow]), toRow)`.[^iteration]
* **`val(row, key, value)` on a row that is not rendered skips rowStatus** - Actual: with scroll paging, a row outside the rendered pages is written directly, without `rowStatus: "update"` or an `ND.ds` notification. Likely intent: same result as for rendered rows. Workaround: also set `data[row].rowStatus = "update"` when the row has no `rowStatus`.[^ui]
* **`onBind`'s `isFirstPage` is `false` for non-paged grids with many rows** - Actual: it is computed as `rendered === scrollPaging.size || data.length <= scrollPaging.size`, so with `height: 0` (or `addTop: false`) and more rows than `scrollPaging.size` it is `false`. Likely intent: `true` when paging is off. Workaround: rely on `isLastPage` when `height` is `0`.[^iteration]
* **A declared `th data-id` is overwritten** - Actual: the constructor sets each header cell's id from the matching body cell (the `td`'s `id`, else its first descendant `id`) whenever the cell mapping succeeds, replacing the `data-id` attribute value. Likely intent: a declared `data-id` wins when a cell holds several id elements. Workaround: put the element whose id should drive sort and filter first in the cell, or give the `td` itself that `id`.[^ui]
* **Sort indicator labels are swapped** - Actual: after an ascending sort the header shows `sortableItem.desc` (with class `asc__`), after a descending sort `sortableItem.asc` (with class `desc__`). Likely intent: show the label that matches the order. Workaround: swap the two values in `N.context.attr("ui").grid.sortableItem` if the symbols must match.[^ui]

# Examples

List-type grid (every row rendered):

```js
N(data).grid("#empGrid").bind();
```

Fixed header with scroll paging:

```js
N(data).grid({ context: "#empGrid", height: 300, scrollPaging: { size: 50 } }).bind();
```

Sorting and filtering:

```js
N(data).grid({ context: "#empGrid", height: 300, sortable: true, filter: true }).bind();
```

Row selection into a detail form:

```js
const grid = N(data).grid({
    context: "#empGrid",
    select: true,
    onSelect: function (row, rowEle, data, beforeRow, e) {
        if (row > -1) detail.unbind().bind(row, data);   // data is the grid's wrapper, so edits sync
    }
}).bind();
const detail = grid.data(false).form("#empDetail");
```

Add, delete and save changed rows:

```js
const grid = N([]).grid({ context: "#empGrid", height: 300, multiselect: true, revert: true });

N("#btnAdd").on("click", function () { grid.add(); });
N("#btnDelete").on("click", function () {
    grid.select().sort(function (a, b) { return b - a; }).forEach(function (i) { grid.remove(i); });
});
N("#btnSave").on("click", function () {
    if (grid.validate()) {
        // dataIsArray: true sends every row; without it only the first row is sent
        N(grid.data("modified")).comm({ url: "saveEmployees.json", dataIsArray: true }).submit(function () { /* rebind */ });
    }
});
```

Checkboxes and column tools:

```html
<table id="wideGrid">
    <thead><tr><th><input type="checkbox" class="chk-all"></th><th>Name</th><th>Dept</th><th>Email</th><th>Phone</th></tr></thead>
    <tbody><tr><td><input type="checkbox" class="chk-row"></td><td id="name"></td><td id="dept"></td><td id="email"></td><td id="phone"></td></tr></tbody>
</table>
```

```js
const grid = N(data).grid({
    context: "#wideGrid",
    checkAll: ".chk-all",
    checkAllTarget: ".chk-row",
    more: ["name", "email", "phone"]
}).bind();

grid.hide(4);                  // hide the Phone column; the detail popup still shows it
console.log(grid.data("checked", "name", "dept"));
```

Fixed columns on a wide list-type grid (`height` must stay `0`):

```js
N(data).grid({ context: "#wideGrid", fixedcol: 2 }).bind();
```

# Related

- [N.form](form.md) - the per-row binding rules, element types and `val()` semantics.
- [N.list](list.md) - the `ul`/`li` sibling for single-column lists.
- [N.pagination](pagination.md) - page a grid by server-side or client-side pages.
- [N.ds](../data/datasync.md) - sync between components that share `data(false)`.
- [Grid CRUD with fixed header](../examples/grid-crud-fixed-header.md) - a complete retrieve, add, delete and save screen.
- [Grid CRUD, list type](../examples/grid-crud-list-type.md) - the same with `height: 0`.

[^ui]: NU.grid implementation
[^ui-plugin]: NU.prototype.grid jQuery plugin wrapper
[^iteration]: NU.ui.iteration shared row rendering, selection and check logic
[^form]: NU.form implementation (one instance per row)
[^comm-request]: NA.comm.request request data serialization
