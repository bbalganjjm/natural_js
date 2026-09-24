---
type: UI Component
title: N.button
description: Styles a, button and input[type=button] elements as buttons (size, color, type) and toggles their enabled or disabled state.
tags: [ui, component, button]
symbols: [N.button, N().button, NU.button, NU.Button, NU.Options.Button]
sources:
  - id: ui
    resource: ../../src/natural.ui.js
    title: NU.button implementation
    symbol: NU.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c3c35975533f
  - id: ui-plugin
    resource: ../../src/natural.ui.js
    title: NU.prototype.button jQuery plugin wrapper
    symbol: NU.prototype.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 99e7697d9987
  - id: instance
    resource: ../../src/natural.core.js
    title: NC.prototype.instance (N(selector).instance)
    symbol: NC.prototype.instance
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: de8beae8138f
  - id: uicss
    resource: ../../css/natural.ui.css
    title: natural.ui.css button rules (btn_* classes)
    git_blob: 7e2005229a00223490701634d4d52b5983233e4c
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Button.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.button` turns `a`, `button` and `input[type=button]` elements into styled buttons and gives them `disable()` / `enable()` methods. Use it for every clickable command in a Natural-JS view so buttons share the site styles from `natural.ui.css`. The instance is stored on each element and is read back with `N(selector).instance("button")`.

# Quick start

```html
<button id="btnSave" data-opts='{ "size": "medium", "color": "primary", "type": "filled" }'>Save</button>
<a id="btnDelete">Delete</a>
```

```js
N("#btnSave", view).button();                                   // options from data-opts
N("#btnDelete", view).button({ size: "medium", color: "secondary", type: "outlined" });

N("#btnSave", view).instance("button").disable();               // get the N.button instance, then call methods
```

# Constructor

## `N(context).button([opts])`

- Creates one `N.button` instance per matched element (`new NU.button(N(element), opts)` for each).[^ui-plugin]
- Returns the jQuery (NJS) collection, **not** an `N.button` instance. Read instances with `N(context).instance("button")`.
- Runs only if at least one element in the collection is `a`, `button` or `input[type=button]`; otherwise returns `undefined`.

## `new N.button(context[, opts])`

- `context` (jQuery object, required): the element(s) to turn into buttons. A selector string throws a `TypeError` because the constructor calls `context.addClass("button__")` on the value as given.[^ui]
- Creates **one** instance shared by every element in `context`, and reads `data-opts` from the first element only.[^ui]
- Returns the `N.button` instance.

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `context` | jQuery | — | Element(s) to style. Must be `a`, `button` or `input[type=button]`. |
| `size` | string | `"none"` | `none`, `smaller`, `small`, `medium`, `large`, `big`. Any value other than `none` adds `btn_common__` (shape: inline-block, border radius, no margin, inherited font) and `btn_<size>__` (padding, font size and line height). |
| `color` | string | `"none"` | `none`, `primary`, `primary_container`, `secondary`, `secondary_container`, `tertiary`, `tertiary_container` (Material Design 3 color roles). Adds `btn_<color>__`. |
| `type` | string | `"none"` | `none`, `filled`, `outlined`, `elevated`. Adds `btn_<type>__`. `filled` has no CSS rule of its own (the color class gives the filled look) and `outlined` only has rules combined with a color class, so with color `none` both have no visible effect and `button` / `input` elements keep the browser's default look. `elevated` gives a transparent background and border, `on-surface` text and the `--njs-elevation-s` shadow, with or without a color: its rule comes after the color rules with the same specificity and overrides them. |
| `disable` | boolean | `false` | Creates the button in the disabled state. |

Defaults are the `NU.button` constructor values.[^ui] The visual effect of each `btn_*` class comes from the button rules in `css/natural.ui.css`.[^uicss] Event handler options are listed under Events.

# Declarative options

Any option except `context` can be written as JSON in the element's `data-opts` attribute:

```html
<a class="btn" data-opts='{ "size": "large", "color": "primary", "type": "filled" }'>Large</a>
<input type="button" class="btn" value="Off" data-opts='{ "disable": true }'>
```

Precedence, lowest to highest: constructor defaults, `N.context.attr("ui").button` (global configuration), `data-opts`, the `opts` argument.[^ui]

# Methods

## `context([selector])`

Returns the context element(s), or `context.find(selector)` when `selector` is given.

## `disable()`

Disables the button and returns the instance. For `a` elements it binds `N.event.disable` as the first `click` handler (`tpBind("click.button", ...)`), which prevents default and stops the other click handlers; for `button` and `input` it sets the `disabled` property. Adds the `btn_disabled__` class.[^ui]

## `enable()`

Enables the button and returns the instance. For `a` elements it removes the `N.event.disable` click handler; otherwise it clears the `disabled` property. Removes `btn_disabled__`.[^ui]

# Events

| Name | Signature | `this` | When |
|---|---|---|---|
| `onBeforeCreate` | `function(context, opts)` | the `N.button` instance | After the `button__` class is added, before style classes and the disabled state are applied. Use it to adjust markup. |
| `onCreate` | `function(context, opts)` | the `N.button` instance | After the instance is stored on the element. Use it to bind extra behavior. |

If a global handler with the same name exists in `N.context.attr("ui").button`, the local handler runs first and the global one runs next unless the local handler returns `false`. See [Component model](component-model.md).

# Global configuration

`N.context.attr("ui").button` is merged over the constructor defaults for every button. The shipped `natural.config.js` does not define it; add it to set site-wide defaults. See [Configuration](../setup/configuration.md).

# Behavior

- Every context element gets the class `button__`.
- Calling `button()` again on the same element first removes all `btn_*` style classes and then applies the new options, so it is safe for restyling.
- `a` elements get `onselectstart="return false;"` so their text is not selected by double clicks.
- Visual styles come from the `btn_*` classes in `css/natural.ui.css`; see [Theming](theming.md).

# Pitfalls

`instance(name, callback)` calls the callback with `this` bound to the instance and passes `(name, instance)`; an arrow function loses that binding.[^instance]

```js
// Wrong (legacy): N("#btnSave").instance("button", () => { this.disable(); });
N("#btnSave").instance("button", function (name, button) { this.disable(); });
N("#btnSave").instance("button").disable();
```

The plugin form returns the jQuery collection, so chaining a button method onto it fails.[^ui-plugin]

```js
// Wrong (legacy): const btn = N("#btnSave").button(); btn.disable();
N("#btnSave").button();
const btn = N("#btnSave").instance("button");
btn.disable();
```

The constructor does not wrap a selector string in `N()`; it calls `addClass` on `context` directly, so a string throws a `TypeError`.[^ui]

```js
// Wrong (legacy): new N.button("#btnSave", { color: "primary" });
new N.button(N("#btnSave", view), { color: "primary" });
```

`new N.button(N(".btn"))` over several elements creates a single shared instance configured from the first element's `data-opts`. Use `N(".btn").button()` to get one instance per element.

# Known issues

* **TypeScript declares the wrong return type for `N().button()`** - Actual: the plugin returns the NJS collection (`this.each(...)`), while `@types/natural.ui.d.ts` declares `button(opts?): NU.Button`. Likely intent: return the collection (consistent with jQuery plugins). Workaround: call `.instance("button")` to get the `NU.Button` instance.[^ui-plugin]

# Examples

Button styles, declared in markup and initialized once:

```html
<div class="toolbar">
    <button class="btn" data-opts='{ "size": "small", "color": "primary", "type": "filled" }'>New</button>
    <button class="btn" data-opts='{ "size": "small", "color": "secondary", "type": "outlined" }'>Edit</button>
    <a class="btn" data-opts='{ "size": "small", "color": "tertiary", "type": "elevated" }'>Help</a>
</div>
```

```js
N(".toolbar .btn", view).button();
```

Disable the save button while a request is running:

```js
const btnSave = N("#btnSave", view).button().instance("button");

N("#btnSave", view).on("click", function () {
    btnSave.disable();
    N.comm("save.json").submit(function (data) {
        btnSave.enable();
    });
});
```

Hooks around creation:

```js
N("#btnSave", view).button({
    color: "primary",
    type: "filled",
    onBeforeCreate: function (context, opts) {
        context.attr("title", "Save the form");
    },
    onCreate: function (context, opts) {
        console.log("created", this.options.size);
    }
});
```

# Related

- [Component model](component-model.md) - shared rules for instances, option precedence and global event handlers.
- [N()](../core/n-function.md) - `N(selector).instance(name[, callback])`, used to read button instances.
- [Theming](theming.md) - the `btn_*` classes and color tokens behind `size`, `color` and `type`.
- [N.alert](alert.md) - uses `N.button` options for its OK and Cancel buttons (`okButtonOpts`, `cancelButtonOpts`).
- [Configuration](../setup/configuration.md) - where `N.context.attr("ui").button` is set.

[^ui]: NU.button implementation
[^ui-plugin]: NU.prototype.button jQuery plugin wrapper
[^instance]: NC.prototype.instance (N(selector).instance)
[^uicss]: natural.ui.css button rules (btn_* classes)
