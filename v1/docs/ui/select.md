---
type: UI Component
title: N.select
description: Binds a JSON object array to a select, select[multiple], radio or checkbox element as options or generated inputs, and gets or sets the selection; also covers the CSS-only Switch.
tags: [ui, component, data-binding, select]
symbols: [N.select, N().select, NU.select, NU.Select, NU.Options.Select, switch__, switch_slider__]
sources:
  - id: ui
    resource: ../../src/natural.ui.js
    title: NU.select implementation
    symbol: NU.select
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 8518b356a7d1
  - id: ui-plugin
    resource: ../../src/natural.ui.js
    title: NU.prototype.select jQuery plugin wrapper
    symbol: NU.prototype.select
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: fd1fe9f48a24
  - id: vals
    resource: ../../src/natural.core.js
    title: NC.prototype.vals (N(selector).vals)
    symbol: NC.prototype.vals
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 4178ea152b93
  - id: to-opts
    resource: ../../src/natural.core.js
    title: NC.element.toOpts (data-opts reader)
    symbol: NC.element.toOpts
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 29751ebee9fa
  - id: css
    resource: ../../css/natural.ui.css
    title: natural.ui.css (select and switch styles)
    git_blob: 7e2005229a00223490701634d4d52b5983233e4c
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Select.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.select` renders a JSON object array into a `select` (options), a `select[multiple]`, or a group of radio or checkbox inputs cloned from one template input, and reads or sets the selection. Use it for code lists; inside [N.form](form.md) the bound value is then read and written by the form. The Switch (`label.switch__`) at the end of this page is a pure CSS toggle for a single checkbox.

# Quick start

```html
<select id="eyeColor"><option value="">Select</option></select>
<input id="hobby" type="checkbox">
```

```js
const colors = [
    { name: "Blue", code: "blue" },
    { name: "Brown", code: "brown" },
    { name: "Green", code: "green" }
];

N(colors).select({ context: "#eyeColor", key: "name", val: "code" }).bind().val("brown");
N(colors).select({ context: "#hobby", key: "name", val: "code" }).bind().val(["blue", "green"]);
```

# Constructor

## `N(data).select(context | opts)`

- Calls `new NU.select(this, opts)` where `this` is the `N(data)` collection, and returns the **N.select instance**.[^ui-plugin]
- Nothing is rendered until `bind()`.

## `new N.select(data, context | opts)`

- `data`: an array of row objects or a wrapped set (`N([...])`).
- `context | opts`: a selector string or jQuery object (the context), or an options object with a `context` key. The context is always wrapped with `N()`.[^ui]
- Detects the element type, marks existing `option` elements with `select_default__`, adds the class `select__`, stores the instance as `"select"` and returns it.

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | object[] \| NJS | — | Rows to render. An array is wrapped with `N()`. |
| `context` | selector \| jQuery | `null` | `select`, `select[multiple="multiple"]`, `input[type=radio]` or `input[type=checkbox]`. For radio and checkbox this single input is the template. |
| `key` | string | `null` | Row property used as the visible text (`option` text, or the label text next to each generated input). |
| `val` | string | `null` | Row property used as the `value` attribute. For `select`, `null` values become `""`. |
| `append` | boolean | `true` | `select` only: keep the element's original options (`select_default__`) in front of the data options. `false` drops them. |
| `direction` | `"h"` \| `"v"` | `"h"` | Radio and checkbox only: horizontal or vertical layout of the generated labels. |

Defaults are the `NU.select` constructor values.[^ui] `type` (1 select, 2 select[multiple], 3 radio, 4 checkbox) and `template` (the context element) are internal options set by the constructor.

# Methods

## `data([selFlag])`

- `data()` returns the bound rows as a plain array (`options.data.get()`).
- `data(true)` returns the rows of the selected options or checked inputs (default options excluded); `[]` when nothing is selected.
- `data(false)` returns the live wrapped set held in `options.data`.

## `context([selector])`

Returns the context, or `context.find(selector)`.

## `bind([data])`

Renders the rows and returns the instance. `data` (array or wrapped set) replaces `options.data` first.[^ui]

- `select`: empties the element, re-adds the original default options when `append` is `true`, then appends `<option value="{val}">{key}</option>` per row. `key` is inserted as HTML, not escaped.
- radio / checkbox: on the **first** call only, wraps the template input and clones it once per row into `<form class="select_input_container__ select_input_horizontal__|select_input_vertical__" style="display: inline;">`, each inside `label.select_input_label__.{id}_{i}__` followed by `<span>{key}</span>`. Every input gets `name` = the template's `id`; clones lose the `id`. See Known issues for later calls.

## `val([value])`

- Getter (no argument): `select` returns the selected value as a string; `select[multiple]` and checkbox groups return a string when exactly one item is selected, an array when several are, `[]` when none; radio returns the checked value or `""`.[^vals]
- Setter: a string or, for multiple select and checkboxes, an array of values; returns the instance. For a single `select`, `""` or `null` selects the first option.
- The data check is `NC.isEmptyObject(options.data)` (`jQuery.isEmptyObject`), which is `false` for any NJS collection, even an empty one. So only when `options.data` is `null`, `undefined` or another value without enumerable properties such as `{}` (for example `new N.select(undefined, "#ctx")`) does it log "[NU.select.prototype.val]There is no data bound to the NU.select component." and return the instance without touching the element. With an empty array, or before `bind()`, it still reads or sets the element's value.[^ui]

## `index([idx])`

- Getter: the selected position as a number, an array for several, or `-1` when nothing is selected. For `select` the positions **include the default options**.
- Setter: a number or an array of numbers; selects those positions and returns the instance.

## `remove(value)`

Removes the option (or the label holding the input) whose `value` attribute equals `value`, removes the matching row from `options.data`, and returns the instance.

## `reset([selFlag])`

Returns the instance. `select`: `reset(true)` selects the first option (`selectedIndex = 0`); `reset()` / `reset(false)` sets the value to `""`, which selects an option whose value is `""` or else leaves nothing selected. radio / checkbox: unchecks the template input only. See Known issues.

# Events

`N.select` has no event options. Listen to the elements' own `change` events.

# Global configuration

`N.context.attr("ui").select` is shallow-merged over the defaults, typically to fix site-wide `key` / `val` property names. The shipped `natural.config.js` does not define it. See [Configuration](../setup/configuration.md).

```js
N.context.attr("ui").select = { key: "name", val: "code" };   // or add "select" to the ui block of natural.config.js
```

# Behavior

- `N.select` is not registered with `N.ds`; inside a bound [N.form](form.md), the form writes the selected value into the row when the user changes it.
- Generated radio and checkbox labels carry `select_input_label__` and `{id}_{i}__`; the template input gets `select_input__ select_template__`. Horizontal and vertical layouts come from `.select_input_container__` rules in `natural.ui.css`.[^css]
- Values are read and written through `N(selector).vals()`; a single checkbox uses the `core.sgChkdVal` / `core.sgUnChkdVal` values (`"Y"` / `"N"` in the shipped config) only when the group has exactly one input.

# Pitfalls

`key` is the visible text and the radio/checkbox `name` comes from the context element's `id`. An input without `id` produces ungrouped radios and labels with the class `undefined_{i}__`.[^ui]

```html
// Wrong (legacy): <input class="eyeColor" type="radio">
<input id="eyeColor" class="eyeColor" type="radio">
```

`index()` counts the default options of a `select`: with `<option>Select</option>` in front, the first data row is index `1`.

`reset(true)` selects the first option and `reset()` clears the selection, the reverse of the legacy description.

```js
// Wrong (legacy): select.reset(true); // expecting "no option selected"
select.reset();      // value "" (nothing selected unless an option has value "")
select.reset(true);  // first option
```

The Switch markup must keep the input and `span.switch_slider__` as siblings. Binding the switch checkbox with `N.select` wraps the input in a generated label and `form`, so the `input:checked + .switch_slider__` styles stop matching. Bind a switch as a single checkbox with [N.form](form.md) instead.

```js
// Wrong (legacy): N([{ key: "useSwitch", val: true }]).select("#useSwitch").bind();
N([{ useYn: "Y" }]).form("#settings").bind();   // #settings holds the switch markup below; "Y" checked, "N" unchecked
```

# Known issues

* **reset() does not restore the default selection** - Actual: for `select` elements `reset()` calls `context.val(context.prop("defaultSelected"))`; `defaultSelected` is an `option` property, so on a `select` it is `undefined` and the value becomes `""`. For radio and checkbox groups only the template input (the original context element) is unchecked. Likely intent: restore the default-selected option, and uncheck every generated input. Workaround: `select.val(defaultValue)`, or `select.index(0)`; for groups, `select.val([])` / uncheck `select.context().closest(".select_input_container__").find(":input")`.[^ui]
* **bind() renders radio and checkbox groups only once** - Actual: generation is skipped when the template already has `select_template__`, so a second `bind(newData)` replaces `options.data` but leaves the old inputs on screen. Likely intent: re-render. Workaround: create the group from fresh markup (a new template input) and a new `N.select`.[^ui]
* **data-opts on the context is ignored** - Actual: the constructor reads `NC.element.toOpts(this.options.context)` while `context` is still `null`, so `data-opts` on the element never applies. Likely intent: declarative options like `N.button`. Workaround: pass options in the options object.[^to-opts]

# Examples

Select with default option, then set and read the value:

```html
<select id="dept"><option value="">All departments</option></select>
```

```js
const dept = N(deptList).select({ context: "#dept", key: "deptNm", val: "deptCd" }).bind();
dept.val("D01");
dept.val();          // "D01"
dept.data(true);     // [the row whose deptCd is "D01"]
dept.index();        // 1 when "D01" is the first row (the default option is index 0)
```

Vertical radio group:

```html
<input id="gender" type="radio">
```

```js
N([{ nm: "Male", cd: "M" }, { nm: "Female", cd: "F" }])
    .select({ context: "#gender", key: "nm", val: "cd", direction: "v" })
    .bind()
    .val("F");
```

Multiple select without the original options:

```html
<select id="skills" multiple="multiple"><option>placeholder</option></select>
```

```js
N(skillList).select({ context: "#skills", key: "name", val: "id", append: false }).bind().val(["js", "css"]);
```

## Switch toggle (CSS only)

The Switch styles one checkbox as a toggle. It is plain CSS in `natural.ui.css`: no JavaScript component and no instance.[^css]

```html
<label class="switch__">
    <input id="useYn" type="checkbox">
    <span class="switch_slider__"></span>
</label>
```

The input must be followed directly by `span.switch_slider__` inside `label.switch__`; the input itself is hidden. Customize it with CSS custom properties set on the `label.switch__` element (inline `style` or a selector at least as specific as `.switch__`; values set on `:root` are overridden by the `.switch__` rule):

| Property | Default | Description |
|---|---|---|
| `--njs-switch-height` | `27px` | Height; every other size derives from it. |
| `--njs-switch-width` | `calc(var(--njs-switch-height) * 2)` | Width. |
| `--njs-switch-padding` | `calc(var(--njs-switch-height) / 7)` | Gap around the knob. |
| `--njs-switch-on-content` | `"ON"` | Text shown when checked (a CSS string). |
| `--njs-switch-off-content` | `"OFF"` | Text shown when unchecked. |
| `--njs-switch-font-size` | not set; falls back to `calc((height / 2) - (padding / 1.3))` | Text size. |

```html
<label class="switch__" style="--njs-switch-width: 80px;">
    <input id="notice" type="checkbox"><span class="switch_slider__"></span>
</label>
<label class="switch__" style="--njs-switch-height: 40px; --njs-switch-on-content: 'Y'; --njs-switch-off-content: 'N';">
    <input id="agree" type="checkbox"><span class="switch_slider__"></span>
</label>
```

Colors use `--md-sys-color-primary-container` (off), `--md-sys-color-primary` (on) and `--md-sys-color-inverse-on-surface` (knob); see [Theming](theming.md).

# Related

- [N.form](form.md) - binds the selected value into a row, and binds single-checkbox switches.
- [Component model](component-model.md) - construction forms and the common data API.
- [Theming](theming.md) - Switch colors and the `select_input_*` classes.
- [N()](../core/n-function.md) - `N(selector).vals()`, used to read and write the selection.
- [Configuration](../setup/configuration.md) - `N.context.attr("ui").select` and `core.sgChkdVal` / `sgUnChkdVal`.

[^ui]: NU.select implementation
[^ui-plugin]: NU.prototype.select jQuery plugin wrapper
[^vals]: NC.prototype.vals (N(selector).vals)
[^to-opts]: NC.element.toOpts (data-opts reader)
[^css]: natural.ui.css (select and switch styles)
