---
type: API Reference
title: N.event
description: Event helpers - a number-key filter for keydown handlers, a handler that cancels an event completely, a wheel scroll lock, and CSS animation or transition end-event detection.
tags: [core, event, dom]
symbols: [N.event, NC.event, N.event.isNumberRelatedKeys, N.event.disable, N.event.windowScrollLock, N.event.getMaxDuration, N.event.whichAnimationEvent, N.event.whichTransitionEvent]
sources:
  - id: event
    resource: ../../src/natural.core.js
    title: NC.event implementation
    symbol: NC.event
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 3bde84c1e198
  - id: tpbind
    resource: ../../src/natural.core.js
    title: NC.prototype.tpBind (N(selector).tpBind)
    symbol: NC.prototype.tpBind
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: e0ae17970a75
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CORE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.event` collects the event utilities Natural-UI is built on: `disable` cancels an event and, bound first with `tpBind`, blocks every other handler; `isNumberRelatedKeys` filters keys for numeric inputs; the `which*Event` functions tell components which end event to wait for after a CSS transition. Call them as `N.event.fn(...)`; `whichAnimationEvent` and `whichTransitionEvent` use `this`.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.event.isNumberRelatedKeys` | `N.event.isNumberRelatedKeys(e)` | boolean |
| `N.event.disable` | `N.event.disable(e)` | `false` |
| `N.event.windowScrollLock` | `N.event.windowScrollLock(ele)` | `undefined` |
| `N.event.getMaxDuration` | `N.event.getMaxDuration(ele, cssProperty)` | milliseconds |
| `N.event.whichAnimationEvent` | `N.event.whichAnimationEvent([ele])` | event name or `"nothing"` |
| `N.event.whichTransitionEvent` | `N.event.whichTransitionEvent([ele])` | event name or `"nothing"` |

# Functions

## `N.event.isNumberRelatedKeys(e)`

For a `keydown` event (`window.event` when `e` is omitted), returns `true` when the key may be typed into a numeric field and `false` otherwise. The key code is `e.keyCode || e.which || e.charCode`.[^event]

| Allowed (`true`) | Blocked (`false`) |
|---|---|
| digits `0`-`9` on the main row and the keypad (Shift is not checked) | letters and punctuation |
| Backspace, Tab, Escape, Enter, Home, End, Left, Right, Delete, Insert | Up and Down arrows |
| Ctrl + A, C, V, S, P | Shift + End, Home, Left (codes 35-37) |
| F1-F12 in Firefox; events without a key code | everything else |

`N.datepicker` uses it in its `keydown` handler to block non-numeric input.

## `N.event.disable(e)`

Calls `e.preventDefault()`, `e.stopImmediatePropagation()` and `e.stopPropagation()` (errors are swallowed) and returns `false`. Bind it with [`tpBind`](n-function.md) so it runs before every other handler of that type; `N.button`, `N.tab` and `N.datepicker` disable items this way.[^event] [^tpbind]

## `N.event.windowScrollLock(ele)`

Binds `mousewheel.ui DOMMouseScroll.ui` handlers on `ele` that stop the wheel from scrolling the window once `ele` has reached its top or bottom. Returns `undefined`. `N.alert` (modal), `N.list` and `N.grid` apply it when their `windowScrollLock` option is true.[^event]

## `N.event.getMaxDuration(ele, cssProperty)`

Reads `ele.css(cssProperty)` (for example `"transition-duration"`) and returns the longest of its comma-separated durations in milliseconds. Returns `0` when the value is empty or starts with `"0"` (see Known issues).[^event]

## `N.event.whichAnimationEvent([ele])`

Returns the supported animation end event name (`"animationend"` or a vendor-prefixed one). Returns `"nothing"` when `ele` is a non-empty collection whose `animation-duration` gives `getMaxDuration(...) === 0`, or when no animation property is supported.[^event]

## `N.event.whichTransitionEvent([ele])`

Returns the supported transition end event name (`"transitionend"` or a vendor-prefixed one). Returns `"nothing"` when `ele` is given and its `transition-duration` gives `getMaxDuration(...) === 0`, or when no transition property is supported.[^event]

Natural-UI waits for the end of a CSS transition with this idiom, which runs the callback at once when the answer is `"nothing"`:

```js
el.one(N.event.whichTransitionEvent(el), function () {
    el.remove();
}).trigger("nothing");
```

# Pitfalls

- `isNumberRelatedKeys` expects `keydown` key codes. With `keypress`, `e.keyCode` is often `0` and `e.charCode` is a character code, so character codes collide with key codes: `.` (46) passes as Delete and the letters `a`-`i` (97-105) pass as keypad digits.
- Up and Down arrows are blocked by `isNumberRelatedKeys`; allow them yourself if a field needs them.
- `windowScrollLock` has no unlock function; remove it with `ele.off("mousewheel.ui DOMMouseScroll.ui")`.
- `N.event.disable` returns `false`, so it also works as a plain jQuery handler, but without `tpBind` handlers bound earlier still run.

# Known issues

* **Sub-second durations count as zero** - Actual: `getMaxDuration` returns `0` whenever the computed value starts with `"0"`, and browsers report computed durations in seconds (`"0.3s"`), so every duration under one second is treated as no transition and `whichTransitionEvent(ele)` / `whichAnimationEvent(ele)` return `"nothing"`. Callers that use the idiom above then run their callback immediately instead of after the transition. Likely intent: return `0` only for `"0s"`. Workaround: in your own code, parse the duration yourself, `parseFloat(el.css("transition-duration")) > 0`.[^event]

# Examples

Allow only digits in an input:

```js
N("#zipCode", view).on("keydown", function (e) {
    if (!N.event.isNumberRelatedKeys(e)) {
        e.preventDefault();
    }
});
```

Temporarily block every click on an element:

```js
N("#area", view).tpBind("click.block", N.event.disable);
// later
N("#area", view).off("click.block");
```

Keep a scrolling panel from scrolling the page:

```js
N.event.windowScrollLock(N("#sidePanel", view));
```

# Related

- [N()](n-function.md) - `tpBind`, which puts `N.event.disable` in front of other handlers, and `events()`.
- [N.button](../ui/button.md) - disables `a` buttons with `tpBind` and `N.event.disable`.
- [N.datepicker](../ui/datepicker.md) - uses `isNumberRelatedKeys` on its input.
- [N.alert](../ui/alert.md) - uses `windowScrollLock` and `whichTransitionEvent` when showing and hiding.
- [N.browser](browser.md) - browser detection helpers.

[^event]: NC.event implementation
[^tpbind]: NC.prototype.tpBind (N(selector).tpBind)
