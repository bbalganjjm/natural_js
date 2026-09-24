---
type: UI Component
title: N.form
description: Binds one row of a JSON object array to the id-matched elements inside a block element, with two-way sync, rowStatus tracking, formatting and validation.
tags: [ui, component, data-binding, form]
symbols: [N.form, N().form, NU.form, NU.Form, NU.Options.Form]
sources:
  - id: ui
    resource: ../../src/natural.ui.js
    title: NU.form implementation
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: ui-plugin
    resource: ../../src/natural.ui.js
    title: NU.prototype.form jQuery plugin wrapper
    symbol: NU.prototype.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 40b1c1dccf9a
  - id: ds
    resource: ../../src/natural.data.js
    title: ND.ds data synchronization
    symbol: ND.ds
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 64d1318e0071
  - id: formatter
    resource: ../../src/natural.data.js
    title: ND.formatter constructor and format
    symbol: ND.formatter
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: e20695aa680a
  - id: validator
    resource: ../../src/natural.data.js
    title: ND.validator constructor
    symbol: ND.validator
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 3783dcab12fc
  - id: iteration
    resource: ../../src/natural.ui.js
    title: NU.ui.iteration row rendering for N.list and N.grid
    symbol: NU.ui.iteration
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 67e1562d3c04
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Form.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.form` binds a single row of a JSON object array to the elements inside a block element (`div`, `table`, `section`, ...) whose `id` equals a property name, and writes user edits back into that row. Use it for detail, entry and edit panels; for many rows use [N.list](list.md) or [N.grid](grid.md), which create one `N.form` per row internally. Formatting and validation come from Natural-DATA and are active only on bound elements.

# Quick start

```html
<div id="detail">
    <input id="name" type="text" data-validate='[["required"], ["maxlength", 20]]'>
    <input id="salary" type="text" data-format='[["commas"]]' data-validate='[["integer"]]'>
    <span id="regDate"></span>
</div>
```

```js
const form = N([{ name: "Hong", salary: 3000000, regDate: "2024-01-15" }])
    .form("#detail")   // context only; row 0
    .bind();           // renders row 0 and starts two-way sync

if (form.validate()) {
    N(form.data(true)).comm("saveEmployee.json").submit(function (res) { /* ... */ });
}
```

# Constructor

## `N(data).form(opts | context)`

- Calls `new NU.form(this, opts)` where `this` is the `N(data)` collection, and returns the **N.form instance** (not the jQuery collection).[^ui-plugin]
- Takes exactly one argument. A second argument is ignored, so options must go in one object together with `context`.
- `N(array)` wraps the rows; `N(object)` wraps a single object as a one-row collection; `grid.data(false).form(...)` passes the grid's own wrapper, so both components share (and sync) the same data.

## `new N.form(data, opts | context)`

- `data`: JSON object array (wrapped with `N()`) or an existing NJS wrapper such as `grid.data(false)` (kept as is). A plain object is not wrapped and nothing binds.
- `opts | context`: a plain object is the options object; anything else (selector string, element, jQuery object) becomes `context` and `row` is set to `0`.
- The constructor adds the class `form__`, stores the instance on the context (`N(context).instance("form")`), snapshots the initial element values for `unbind()`, and registers the instance with `ND.ds`. It does **not** render data: call `bind()` or `add()`.[^ui]
- Throws `NC.error("NU.form", e)` when `N.context.attr("ui")` is not defined.

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | array \| NJS | — | Rows to bind. Set by the first constructor argument; arrays are wrapped with `N()`. |
| `context` | selector \| jQuery | — | Block element that contains the bound elements. |
| `row` | number | `0` | Index of the row to bind. The literal default is `-1`, but the constructor sets `0` whenever `row` is not passed. |
| `validate` | boolean | `true` | Validates text inputs on focusout and Enter. `false` does not disable `validate()` for text inputs and selects; see `validate()`. |
| `autoUnbind` | boolean | `false` | Calls `unbind()` before the rebinds done by `add()`, `revert()` and `update()`. See Known issues. |
| `html` | boolean | `false` | Non-input elements get `.html(value)` instead of `.text(value)`. |
| `addTop` | boolean | `true` | `add()` without a row index inserts at index 0; `false` appends to the end. |
| `revert` | boolean | `false` | Keeps a copy of the bound row so `revert()` works. `revert()` throws when this is `false`. |
| `cache` | boolean | `true` | Caches the element lookup on the first `bind()`; elements added to the context later are not bound. |
| `unbind` | boolean | `true` | Captures the initial values of every `[id]` element (except buttons) at construction so `unbind()` can restore them. |
| `tpBind` | boolean | `false` | Binds the form's handlers with `N(el).tpBind()` (moved to the front of the handler queue) so they run before handlers bound earlier. |
| `fRules` | object \| null | `null` | Format rules object used instead of `data-format`. Broken; see Known issues. |
| `vRules` | object \| null | `null` | Validation rules object used instead of `data-validate`. Broken; see Known issues. |

Defaults are the `NU.form` constructor values.[^ui] `state`, `extObj`, `extRow` and `InitialData` are internal (N.list and N.grid set `extObj`/`extRow` on their row forms). Event handler options are listed under Events.

# Declarative options

`N.form` does not read `data-opts`. Declarative behavior comes from Natural-DATA attributes on the bound elements:

```html
<input id="joinDate" type="text" data-format='[["date", 8]]' data-validate='[["required"], ["date"]]'>
```

- `data-format` - format rules for [N.formatter](../data/formatter.md), applied on bind and on focusout, removed on focusin.
- `data-validate` - rules for [N.validator](../data/validator.md), checked on focusout, on Enter and by `validate()`.

How each element type is bound:[^ui]

| Element | Receives | Writes back on |
|---|---|---|
| `input` of type text, password, hidden, file, number, tel, email, search, color, range, url; `textarea` | `.val(value)`. With `data-format`, only `type="text"`, `type="tel"` and `textarea` receive the (formatted) value; other types are not filled (see Pitfalls) | `focusout`, and `keyup` Enter (validate first, then sync) |
| `select` | `.vals(value)` | `change` |
| `input:radio`, `input:checkbox` | `.vals(value)`, matched by `name` first, then by `id` | `click`, `select` |
| `img` | `src` attribute | never |
| anything else (`span`, `td`, `div`, `input type=date`, `input` without `type`, ...) | `.text(value)` (or `.html(value)`), formatted when `data-format` is present | never |

`null` and `undefined` values are rendered as an empty string.

# Methods

## `data([selFlag][, ...cols])`

- No argument: a plain array of all rows (`options.data.get()`).
- `true`: an array holding only the bound row, `[row]`. With `cols`, each object is projected to those keys (`NC.json.mapFromKeys`).
- `false`: the NJS wrapper itself. Pass it to another data component to share the data and keep them in sync.
- `cols` work only with `true`.

## `row([before])`

Returns the index of the bound row. `row("before")` returns `options.beforeRow`, which N.form never sets (see Known issues).

## `context([selector])`

Returns the context element, or `context.find(selector)` when `selector` is given.

## `bind([row][, data][, ...cols])`

- `row`: row index to bind; omitted keeps the current one.
- `data`: new rows (array or NJS wrapper), which replace `options.data`. With `revert: true`, the revert snapshot is retaken from `data[row]`. The strings `"add"`, `"bind"`, `"revert"`, `"update"` in this position are internal state markers used by `add()`, `revert()` and `update()`.
- `cols`: bind only these keys. `onBeforeBind` and `onBind` do not fire in this form.
- Walks the **keys of the row object**: elements whose `id` is not a key keep whatever value they show. Does nothing when there is no row object at `row`.
- Sets `row_data_changed__` / `row_data_deleted__` on the context and `data_changed__` on elements from the row's `rowStatus`. Returns the instance.[^ui]

## `unbind([state])`

Restores the element values captured at construction, removes the form's event handlers (`.form.validate`, `.form.dataSync`, `.form.format`, `.form.unformat`, `format.formatter`, `unformat.formatter`), the `data_changed__`, `row_data_changed__` and `validate_false__` classes and open validation tooltips. The data and the row index are kept. `state` is ignored. Does nothing when the `unbind` option is `false`: this is the case for N.list and N.grid rows rendered by their `bind()`, while rows created by their `add()` keep the default `true`.[^iteration] Returns the instance.

## `add([data][, row])`

- Builds a new row from the **current values** of the context's inputs (`NC.element.toData(context.find(":input:not(:button)"))`), merges the `data` object over it and sets `rowStatus: "insert"`.
- A numeric first argument is taken as `row`. A `row` below 0 or above `data.length` is ignored.
- Inserts at `row`, else at index 0 (`addTop: true`) or at the end (`addTop: false`), makes it the bound row, takes the revert snapshot, binds it and notifies `ND.ds`.
- Throws `Error("[Form.add]Data is null. you must input data")` when `options.data` is `null`. Returns the instance.[^ui]

## `remove()`

If the bound row has `rowStatus: "insert"`, removes it from the data, sets `row` to `-1`, notifies `ND.ds` and calls `unbind()`. Otherwise sets `rowStatus: "delete"`, adds `row_data_deleted__` to the context and notifies. Returns the instance.

## `revert()`

Replaces the bound row's contents with the revert snapshot, binds it and notifies `ND.ds`. The snapshot is taken at construction, by `bind(row, data)` and by `add()`. Throws `NC.error("[NU.form.prototype.revert]Can not revert. ...")` when the `revert` option is `false`. Returns the instance.

## `validate()`

Triggers `unformat.formatter`, `validate.validator` and `format.formatter` on every `:input` in the context except radios and checkboxes, plus radios and checkboxes that carry `select_template__` (created by [N.select](select.md)). Returns `true` when no element has `validate_false__`. It checks every bound rule regardless of `rowStatus`. Only elements with `data-validate` that were bound by `bind()` have a validator: text inputs and selects get one whatever the `validate` option says, but radios and checkboxes (N.select templates) get one only with `validate: true`, so `validate: false` makes `validate()` skip them.[^ui]

## `val(key)`

Returns `data[row][key]` as stored (no conversion).

## `val(key, value[, notify])`

Sets a value on the bound row and its element, then returns the instance.

- Text input: sets the element value, validates it, then syncs it through the focusout handler, so the row receives the element's **string** value, and only when it passes validation. `select`, radio and checkbox work the same way through their change and click handlers.
- `img` and other elements: the row receives `value` as is, `rowStatus` becomes `"update"` and the element is re-rendered.
- No element with that `id`: when `value` differs from the stored value (`!==`), the row receives it as is, `rowStatus` becomes `"update"` and `ND.ds` is notified; an equal value changes nothing.
- `readonly` and `disabled` are lifted while the value is set, then restored.
- `notify === false`: no `ND.ds` notification for keys that have an element. For inputs, `select`, radios and checkboxes the handler that writes the row is skipped too, so **only the element changes**; this is the form `update()` uses when the row object was already changed by a linked component. For a key **without** an element, `notify` is ignored: whenever the value differs, the row is written, gets `rowStatus: "update"` and `ND.ds` is notified.[^ui]

## `update(row[, key])`

Called by `ND.ds` when a component sharing the same data changes it. Without `key`, rebinds `row`; with `key`, and only when `row === this.row()`, re-renders that element with `val(key, data[row][key], false)` and flashes it (`NC.element.dataChanged`). Returns the instance. See [N.ds](../data/datasync.md).

# Events

| Name | Signature | `this` | When |
|---|---|---|---|
| `onBeforeBindValue` | `function(ele, value, action)` | the `N.form` instance | Before each key is rendered by `bind()` (`action` `"bind"`) or set by `val()` (`"val"`). `ele` is the matched element (empty for radios and checkboxes in `bind()`). In `bind()`, a return value other than `undefined` replaces the row value before it is rendered. In `val()`, `value` is the row's current (old) value, not the new one, and a return value only overwrites that old value; `val()` then writes its own argument (when it writes the row at all), so the return value cannot change what is set. |
| `onBindValue` | `function(ele, value, action)` | the `N.form` instance | After each key is rendered or set. A return value other than `undefined` replaces the row value (the element keeps what it shows). In `val()`, `ele` is `undefined` when the key has an element (the variable is cleared before the call) and an empty set when it has none. |
| `onBeforeBind` | `function(context, rowData)` | the `N.form` instance | Before a whole-row `bind()` of a standalone form. Not fired when `cols` are passed or for N.list / N.grid row forms. |
| `onBind` | `function(context, rowData)` | the `N.form` instance | After a whole-row `bind()` completes, under the same conditions. |

A global handler with the same name in `N.context.attr("ui").form` runs after the local one unless the local one returns `false`. For `onBeforeBindValue` the global handler is called as `(ele, localReturnValue)` and its return value is used. See [Component model](component-model.md).[^ui]

# Global configuration

`N.context.attr("ui").form` is merged (shallow) over the constructor defaults for every form. The shipped `natural.config.js` does not define it. `N.context.attr("ui")` itself must exist, or the constructor throws. See [Configuration](../setup/configuration.md).

# Behavior

- **rowStatus**: an edit on an element of a row without `rowStatus` sets `rowStatus: "update"`; `add()` creates `"insert"`; `remove()` sets `"delete"` or drops an `"insert"` row. `"insert"` and `"delete"` rows stay as they are when edited.
- **Invalid text input is not written**: the focusout sync skips `disabled` and `readonly` inputs and, with `validate: true`, inputs that have `validate_false__`; the row keeps its last valid value until the input passes. A `select` writes whenever it is not disabled, because its change handler clears `validate_false__` (and the tooltip) first. Radios and checkboxes always write the row and set `rowStatus`; when disabled or readonly they only skip the `ND.ds` notification.[^ui]
- **Enter** in a text input validates it and writes it to the row without leaving the field.
- **CSS classes**: `form__` (context), `row_data_changed__` and `row_data_deleted__` (context), `data_changed__` (edited elements), `validate_false__` (failed elements, set by the validator). Styles live in `css/natural.ui.css`; see [Theming](theming.md).
- **Data sync**: a standalone form registers with `ND.ds`. Components whose `options.data` is the **same object** receive `update(row, key)` calls; a form reacts only when `row` is its bound row. See [N.ds](../data/datasync.md).[^ds]
- **Event namespaces**: `focusout.form.validate`, `focusout.form.dataSync`, `keyup.form.dataSync`, `change.form.dataSync`, `click.form.dataSync`, `select.form.dataSync`, `focusin.form.unformat`, `focusout.form.format`.

# Pitfalls

The plugin takes one argument. Options passed as a second argument are dropped, so `revert` stays `false` and `revert()` throws.[^ui-plugin]

```js
// Wrong (legacy): N(data).form("#form-example", { revert: true }).bind();
N(data).form({ context: "#form-example", revert: true }).bind();
```

`N.form` is a class; call it with `new` (only `N.comm` and `N.notify` are factory wrappers).

```js
// Wrong (legacy): const form = N.form(data, "#form-example");
const form = new N.form(data, "#form-example");
```

`addTop` defaults to `true`, so `add()` without a row index inserts the new row at index 0. Set `addTop: false` to append.

```js
const form = N(rows).form({ context: "#detail", addTop: false });
form.add(); // new row goes to the end
```

`add()` copies the values currently shown in the inputs into the new row, and `bind()` leaves elements whose `id` is not a key of the new row untouched. Call `unbind()` first to start from the initial markup values.

```js
form.unbind().add();
form.unbind().bind(3);
```

`validate()` checks every bound input of the current row, not only added or modified data (the legacy guide said otherwise).

`new N.form(object, ...)` with a plain object binds nothing; pass an array, or use the plugin, which wraps the object.

```js
new N.form([row], "#detail").bind();
N(row).form("#detail").bind();
```

`bind(row, data)` replaces the form's data with `data`. Pass the whole array or a `data(false)` wrapper, never a single row object.

To share data with a grid or list, call `.form()` on `grid.data(false)` or pass it to `new N.form(...)`. Wrapping it in `N()` again creates a new wrapper, so `ND.ds` no longer sees the same data and the components stop syncing.

`input type="date"` (and `datetime-local`, `month`, `time`, `week`) is not treated as a text input, and neither is an `input` without a `type` attribute: it gets `.text(value)`, shows nothing and never writes back. Write `type="text"` explicitly, and use `type="text"` with `data-format='[["date", 8, "date"]]'` for a date field with [N.datepicker](datepicker.md).

Put `data-format` only on `type="text"` and `type="tel"` inputs and on textareas. When another input type (number, email, search, color, range, url, password, hidden, file) has `data-format`, `bind()` writes nothing into it: the input keeps its current value (usually empty on the first bind), and leaving the field writes that value, usually `""`, into the row with `rowStatus: "update"` whenever it differs from the row value.[^formatter]

```html
<input id="balance" type="text" data-format='[["commas"]]' data-validate='[["integer"]]'>
```

Do not nest another data component inside a form's context: `bind()` searches all descendants with an `id`, including the inner component's elements.

# Known issues

* **`autoUnbind` ignores explicit `bind()` calls** - Actual: `unbind()` runs only when `bind()` receives a state string (`"add"`, `"bind"`, `"revert"`, `"update"`) as its second argument, which happens inside `add()`, `revert()` and `update()`; `bind()`, `bind(row)` and `bind(row, data)` never unbind. Likely intent: unbind before every rebind, as the option name and the type declarations say. Workaround: call `form.unbind().bind(row, data)`.[^ui]
* **Leaving a text input marks non-string values as updated** - Actual: the focusout sync compares the row value with the element's string value using `!==`, so a number or boolean bound to a text input is converted to a string and the row gets `rowStatus: "update"` as soon as the input loses focus, even without an edit. Likely intent: mark only real changes. Workaround: bind string values (convert numbers before `bind()`, or return `String(value)` from `onBeforeBindValue` for non-null values).[^ui]
* **`fRules` and `vRules` do not work** - Actual: both are consulted only for elements that also carry a `data-format` / `data-validate` attribute. For those, `fRules` builds a non-element `ND.formatter` that computes values but never writes them, so the element stays empty; `vRules` builds `ND.validator` from `N()` and a rules object, which calls `NC.element.toData(null)` and throws a TypeError. Likely intent: object rules as an alternative to the attributes. Workaround: use `data-format` and `data-validate` attributes.[^formatter] [^validator]
* **`row("before")` always returns `undefined`** - Actual: `NU.form.prototype.row` reads `options.beforeRow`, which only N.list and N.grid maintain. Likely intent: the previously bound row. Workaround: remember the previous `form.row()` yourself before calling `bind(row)`.[^ui]
* **`val(key, value, false)` still notifies for keys without an element** - Actual: when no element in the context has the `id` `key`, `val()` writes the value, sets `rowStatus: "update"` and calls `ND.ds` `notify()` whenever the value changed, without checking `notify`. Likely intent: `false` suppresses the notification for every key. Workaround: write such keys directly on the row object (`form.data(false)[form.row()][key] = value`) and set `rowStatus` yourself if needed.[^ui]
* **`bind(row)` keeps the old revert snapshot** - Actual: with `revert: true`, the snapshot is refreshed only by the constructor, `bind(row, data)` and `add()`. After `bind(3)`, `revert()` overwrites row 3 with the snapshot of the previously bound row. Likely intent: snapshot the newly bound row. Workaround: pass the data again, `form.bind(3, form.data(false))`.[^ui]

# Examples

Edit an existing record and send only that row:

```html
<table id="empForm">
    <tr><th><label for="name">Name</label></th><td><input id="name" type="text" data-validate='[["required"]]'></td></tr>
    <tr><th><label for="email">Email</label></th><td><input id="email" type="text" data-validate='[["required"], ["email"]]'></td></tr>
    <tr><th><label for="age">Age</label></th><td><input id="age" type="text" data-validate='[["required"], ["integer"]]'></td></tr>
</table>
```

```js
const form = N([{ name: "Hong Gil-dong", email: "hong@example.com", age: 30 }]).form("#empForm").bind();

N("#btnSave").on("click", function () {
    if (form.validate()) {
        const row = form.data(true)[0];          // includes rowStatus: "update" after an edit
        N(row).comm("updateEmployee.json").submit(function () { /* ... */ });
    }
});
```

New entry form:

```js
const form = N([]).form("#empForm");
form.add();                                      // empty row with rowStatus "insert"

N("#btnSave").on("click", function () {
    if (form.validate()) {
        N(form.data(true)).comm("insertEmployee.json").submit(function () { /* ... */ });
    }
});
```

Change values in code and revert them:

```js
const form = N(data).form({ context: "#empForm", revert: true }).bind();
form.val("name", "Kim Cheol-su");
form.val("age", 25);                             // stored as "25": the input writes its string value
form.revert();                                   // back to the values bound first
```

Reset the markup and bind other data:

```js
const form = N(data).form("#empForm").bind();
form.unbind();                                   // initial markup values, handlers removed
form.bind(0, [{ name: "Lee Young-hee", email: "lee@example.com", age: 28 }]);
```

Master grid and detail form that edit the same rows:

```js
const grid = N([]).grid({
    context: "#empGrid",
    select: true,
    onSelect: function (row, rowEle, data) {
        if (row > -1) {
            detail.unbind().bind(row, data);     // data is the grid's own wrapper
        }
    }
});
const detail = grid.data(false).form("#empDetail");

N.comm("getEmployees.json").submit(function (rows) {
    grid.bind(rows);
});
```

# Related

- [Component model](component-model.md) - instances, option precedence and global event handlers shared by all components.
- [N.grid](grid.md) and [N.list](list.md) - multi-row components built on one `N.form` per row.
- [N.formatter](../data/formatter.md) - rules for `data-format`.
- [N.validator](../data/validator.md) - rules for `data-validate`.
- [N.ds](../data/datasync.md) - how components sharing one data wrapper stay in sync.
- [Edit form data](../examples/edit-form-data.md) - a complete retrieve, edit and save screen.

[^ui]: NU.form implementation
[^ui-plugin]: NU.prototype.form jQuery plugin wrapper
[^ds]: ND.ds data synchronization
[^formatter]: ND.formatter constructor and format
[^validator]: ND.validator constructor
[^iteration]: NU.ui.iteration row rendering for N.list and N.grid
