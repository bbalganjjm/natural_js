---
type: UI Component
title: N.notify
description: Shows self-dismissing global messages in one fixed container on document.body, optionally clickable to go to a URL or run a function.
tags: [ui-shell, component, notification]
symbols: [N.notify, N().notify, N.notify.add, NUS.notify, NUS.prototype.notify, NUS.notify.add, NUS.Notify, NUS.Options.Notify, NUS.Options.NotifyPosition, notify__, notify_msg__, notify_msg_close__]
sources:
  - id: notify
    resource: ../../src/natural.ui.shell.js
    title: NUS.notify implementation
    symbol: NUS.notify
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: 00af5ad03855
  - id: notify-plugin
    resource: ../../src/natural.ui.shell.js
    title: NUS.prototype.notify jQuery plugin wrapper
    symbol: NUS.prototype.notify
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: f9f20c44009a
  - id: factory
    resource: ../../src/natural.js.js
    title: N.notify factory and N.notify.add installation
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: message
    resource: ../../src/natural.core.js
    title: NC.message.get (locale lookup of the close label)
    symbol: NC.message.get
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 077cf89d5894
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI.Shell-Notify.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.notify` shows short site-wide messages that need no confirmation and disappear after `displayTime` seconds. All messages go into one shared, fixed-position `.notify__` container inside `container` (default `document.body`), whereas [N.alert](../ui/alert.md) dialogs live inside each view. Use it for global notices such as "Saved" or "New version available"; use `N.alert` for messages that belong to page content.

# Quick start

```js
N.notify.add("Saved.");                                    // defaults: top 10px, right 10px, 7 seconds

N.notify({ displayTime: 3 }).add("Saved.");                // one argument = opts

N.notify({ bottom: 10, right: 10 }, { html: true })       // two arguments = position, opts
    .add("<b>3</b> new messages", "#inbox")                // click sets location.hash
    .add("Manual updated", "https://example.com/manual");  // add() returns the instance
```

# Constructor

## `N.notify([position][, opts])`

- `N.notify` is a factory installed by `src/natural.js.js` (`function (position, opts) { return new NUS.notify(position, opts); }`), so `new` is optional; `new N.notify(...)` returns the same instance.[^factory]
- Argument dispatch in the `NUS.notify` constructor:[^notify]
  - `position` and `opts` both given: `position` (a plain object, or a jQuery-wrapped object whose first item is used) replaces the `position` option, then `opts` is merged.
  - One non-empty argument and no `opts`: the argument is taken as **`opts`**, not as a position. `N.notify({ html: true })` works; for a position use `N.notify({ position: { bottom: 10, left: 10 } })` or `N.notify({ bottom: 10, left: 10 }, {})`.
  - No argument: defaults plus global configuration.
- Returns the `NUS.notify` instance. Each call creates a new instance, but instances with the same `container` share one `.notify__` element (see Behavior).

## `N(position).notify([opts])`

- jQuery plugin form: `new NUS.notify(this, opts)`, where `this` is the wrapped position object. Returns the `NUS.notify` instance, not the jQuery collection.[^notify-plugin]
- Always pass `opts` (at least `{}`). Without it the wrapped set is taken as options; see Known issues.

## `N.notify.add(msg[, url])`

Static shortcut: runs `(new NUS.notify()).add(msg, url)` with defaults and global configuration. Returns `undefined`, so it cannot be chained.[^notify]

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `position` | object | `{ top: 10, right: 10 }` | CSS `top`, `right`, `bottom`, `left` (numbers are px). Applied to the shared `.notify__` container on every `add()`. |
| `container` | jQuery | `N("body")` | Element that receives the `.notify__` container. Evaluated when the instance is created. |
| `displayTime` | number | `7` | Seconds before a message removes itself. |
| `html` | boolean | `false` | `true` inserts `msg` with `.html()`; otherwise `.text()` is used. |
| `alwaysOnTop` | boolean | `false` | Sets the container's `z-index` to the highest `z-index` among `alwaysOnTopCalcTarget` elements plus 1, computed once when the instance is created. The shipped `natural.config.js` sets `true`. |
| `alwaysOnTopCalcTarget` | string | `"div, span, ul, p, nav, article, section, header, footer, aside"` | jQuery selector of the elements scanned for `alwaysOnTop`. Add selectors of elements that still cover the messages. |
| `message` | object | — | Localized labels keyed by locale; `close` is the title of each message's close button. Supplied by the global configuration; see Global configuration. |

Defaults are the `NUS.notify` constructor values.[^notify] `context` is internal: the constructor sets it to the `.notify__` element.

Precedence, lowest to highest: constructor defaults, `N.context.attr("ui.shell").notify` (shallow merge), the `position` argument, `opts` (shallow merge, so `opts.position` beats the `position` argument).

# Methods

## `context([selector])`

Returns the `.notify__` container, or `container.find(selector)` when `selector` is given.

## `add(msg[, url])`

Shows one message and returns the instance, so calls can be chained.[^notify]

- Clears `top`, `right`, `bottom` and `left` on the container, then applies `options.position`.
- Builds `div.notify_msg__` holding the text in an `a[href="#"]` (when `url` is given) or a `span`, plus a close link `a.notify_msg_close__` whose title is the `close` message. The box is appended to the container with the class `visible__`.
- `url` (optional):
  - function: called on click with `this` bound to the anchor element;
  - string starting with `#`: `location.hash = url`;
  - any other string: `location.href = url`.
  The click's default action is prevented. Clicking the text does not remove the message; the close link does.
- Calls `remove()` on the box after `displayTime` seconds.

## `remove(msgBoxEle)`

Hides a message box (`div.notify_msg__`): swaps `visible__` for `hidden__` and removes the element when its CSS transition ends, or at once when it has no transition. Returns the instance. `add()` does not return the box; select it with `notify.context(".notify_msg__")`.

# Global configuration

`N.context.attr("ui.shell").notify` is merged over the constructor defaults for every instance. The shipped `natural.config.js` sets `alwaysOnTop: true` and `message.close` for `ko_KR` and `en_US`. Keep a `message` entry for the current locale: `add()` reads `message[N.locale()].close` and throws a `TypeError` when that entry is missing.[^message] See [Configuration](../setup/configuration.md).

# Behavior

- One `.notify__` element (`position: fixed`) per container: the first instance creates it, later instances reuse it. Because every `add()` rewrites the container's position, the position of the latest `add()` applies to all messages on screen.
- Messages stack in the container in the order they were added.
- The instance is stored on the container, so `N(".notify__").instance("notify")` returns the most recently created instance.
- Styles come from `.notify__`, `.notify_msg__`, `.notify_msg_close__` and the `visible__` / `hidden__` state classes in `css/natural.ui.css`; see [Theming](../ui/theming.md).

# Pitfalls

A single argument is always options, and `N(position).notify()` without options loses the position (Known issues). The legacy example labeled "bottom right" passed `{ top: 5, right: 10 }` and no options: it runs into that Known issue, and even with the position applied, `top` and `right` place the container at the top right.[^legacy]

```js
// Wrong (legacy): N({ top: 5, right: 10 }).notify().add("The manual has been updated.", "https://example.com/manual");
N({ top: 5, right: 10 }).notify({}).add("The manual has been updated.", "https://example.com/manual");
N.notify({ position: { bottom: 10, right: 10 } }).add("Shown at the bottom right.");
```

`add()` returns the `N.notify` instance, not the message element.[^notify]

```js
// Wrong (legacy): const msgBox = notify.add("Saved."); notify.remove(msgBox);
notify.add("Saved.");
notify.remove(notify.context(".notify_msg__:last"));
```

`N.notify` is a factory, but the class behind it is not: `NUS.notify(...)` without `new` throws in `src/` and the ES6 bundles. Call `N.notify(...)` or `new NUS.notify(...)`.

With `html: true` the message is inserted as HTML. Escape any user-supplied text, or keep the default text mode.

# Known issues

* **`N(position).notify()` without options ignores the position** - Actual: the constructor treats a non-empty first argument with an `undefined` second argument as options and re-dispatches to `new NUS.notify(null, position)`. The jQuery-wrapped position is then merged into the options, so the position is lost and jQuery methods such as `position` and `html` overwrite the options of the same name; with jQuery 3.7.1 the following `add()` passes a function to `css()` and fails. Likely intent: use the wrapped object as the position. Workaround: pass an options object, `N(position).notify({})`, or use `N.notify({ position: position })`.[^notify][^notify-plugin]

# Examples

Site-wide notice that navigates when clicked:

```js
N.notify({ displayTime: 10 }).add("A new version is available. Click to reload.", function () {
    location.reload();
});
```

Messages at the bottom left, rendered as HTML:

```js
const notify = N.notify({ bottom: 20, left: 20 }, { html: true, displayTime: 5 });
notify.add("<strong>Upload finished</strong>");
notify.add("Open the <em>inbox</em>", "#inbox");
```

Notify after a save request:

```js
N({ userId: "u001", name: "Kim" }).comm("save.json").submit(function (data) {
    N.notify.add("Saved.");
});
```

# Related

- [N.alert](../ui/alert.md) - confirmation and message dialogs inside a view.
- [N.docs](documents.md) - the other Natural-UI.Shell component; tries to show an `N.notify` message when `maxTabs` is reached (see its Known issues).
- [Component model](../ui/component-model.md) - shared rules for instances and options of Natural-UI components.
- [Configuration](../setup/configuration.md) - the `ui.shell` block of `natural.config.js`.
- [Theming](../ui/theming.md) - styles of `.notify__` and its messages.

[^notify]: NUS.notify implementation
[^notify-plugin]: NUS.prototype.notify jQuery plugin wrapper
[^factory]: N.notify factory and N.notify.add installation
[^message]: NC.message.get (locale lookup of the close label)
[^legacy]: Legacy developer guide (removed)
