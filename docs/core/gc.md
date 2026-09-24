---
type: API Reference
title: N.gc
description: Unbinds the global window and document event handlers that Natural-JS components leave behind; N.comm runs it automatically when it replaces the main page content.
tags: [core, memory, spa]
symbols: [N.gc, NC.gc, N.gc.minimum, N.gc.full, N.gc.ds]
sources:
  - id: gc
    resource: ../../src/natural.core.js
    title: NC.gc implementation
    symbol: NC.gc
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: fcd6397e7c4c
  - id: comm-submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (automatic N.gc calls on page loads)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: alert-remove
    resource: ../../src/natural.ui.js
    title: NU.alert.prototype.remove (N.gc.ds call when a popup is removed)
    symbol: NU.alert.prototype.remove
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 53a992be49dc
  - id: ds
    resource: ../../src/natural.data.js
    title: ND.ds implementation (observable list)
    symbol: ND.ds
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 64d1318e0071
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CORE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

`N.gc` removes the namespaced event handlers that datepickers, alerts and grids bind on `window` and `document`, which would otherwise outlive the page that created them in a single-page application. `N.comm` calls it for you whenever it loads a page into the main content area, so call it yourself only when you replace page content some other way. It does not remove DOM elements or component instances.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.gc.minimum` | `N.gc.minimum()` | `true` |
| `N.gc.full` | `N.gc.full()` | `true` |
| `N.gc.ds` | `N.gc.ds()` | `undefined` |

# Functions

Automatic calls:

| Trigger | Call |
|---|---|
| `N.comm` loads HTML into the element matching `N.context.attr("architecture").page.context` | `N.gc[N.context.attr("core").gcMode]()`, before the new content is inserted[^comm-submit] |
| `N.comm` loads HTML into any other element | `N.gc.ds()`, after the content is inserted[^comm-submit] |
| An `N.popup` is removed (its alert gets `remove()`) | `N.gc.ds()`[^alert-remove] |

- `gcMode` is `"full"` in the shipped `natural.config.js` and must be `"minimum"` or `"full"`; see [Configuration](../setup/configuration.md).
- Handlers bound on elements inside the replaced content are released by jQuery when `N.comm` replaces the content (the default `.html()` insertion); `N.gc` only covers the global `window` and `document` handlers listed above.

## `N.gc.minimum()`

Unbinds the global handlers that reposition datepickers and alerts on window resize and that close them, or a grid's filter and "more" panels, on outside clicks and key presses (first two rows of the table below). Returns `true`.[^gc]

## `N.gc.full()`

Does everything `minimum()` does and also unbinds the drag and resize handlers of alerts and grids, then returns `true`.[^gc]

| Target | Namespaced events | `minimum()` | `full()` |
|---|---|---|---|
| `window` | `resize.datepicker`, `resize.alert` | yes | yes |
| `document` | `click.datepicker`, `keyup.alert`, `click.grid.dataFilter`, `click.grid.more`, `touchstart.grid.more` | yes | yes |
| `document` | `dragstart`, `selectstart`, `mousemove`, `touchmove`, `mouseup`, `touchend` in the namespaces `.alert`, `.grid.vResize` and `.grid.resize` | no | yes |

## `N.gc.ds()`

Meant to drop [N.ds](../data/datasync.md) observers whose components are gone: when the page context has a `#data_sync_temp__` child, it collects the instances of the `.grid__`, `.list__`, `.form__` and `.tree__` elements still in the page context. The result is written to a misspelled property, so it has no effect (see Known issues).[^gc]

# Pitfalls

- `N.gc` unbinds whole namespaces globally. A datepicker, alert or grid that lives outside the page context (for example in a fixed header) loses its `document` and `window` handlers too, such as click-outside-to-close and window-resize repositioning.
- Use `"minimum"` or `"full"` for `gcMode`. A missing value, or any value that does not name a function on `N.gc`, makes page loads into the main context throw a TypeError (`N.gc[undefined]` is not a function). `"ds"` does not throw, but it only calls `N.gc.ds()` and unbinds no global handlers.
- Replacing the main content without `N.comm` (plain `jQuery.load`, `innerHTML`) skips the automatic call; run `N.gc.full()` yourself afterwards.

# Known issues

* **`N.gc.ds()` has no effect** - Actual: it assigns the live instances to `obserable` (misspelled) on the `N.ds` instance, while `N.ds` reads and updates `observable`, so the observer list is never pruned. Likely intent: replace `observable`. Workaround: none through the API; stale observers stay registered until `N.comm` replaces the page context, which also removes `#data_sync_temp__`.[^gc] [^ds]

# Examples

Clean up after swapping the main content without `N.comm`:

```js
N(".docs_contents__.visible__").html(pageHtml);
N.gc.full();
```

Switch the collection level at runtime (the permanent setting is the `gcMode` key of the `core` block in `natural.config.js`):

```js
N.context.attr("core").gcMode = "minimum";
```

# Related

- [Communicator](../architecture/communicator.md) - `N.comm`, which triggers `N.gc` on page loads.
- [N.context](../architecture/context.md) - `page.context` and the `core` settings read here.
- [N.ds](../data/datasync.md) - the data-sync observer list that `N.gc.ds` targets.
- [Configuration](../setup/configuration.md) - where `gcMode` is set.
- [N.datepicker](../ui/datepicker.md), [N.alert](../ui/alert.md), [N.grid](../ui/grid.md) - the components whose global handlers are removed.

[^gc]: NC.gc implementation
[^comm-submit]: NA.comm.submit (automatic N.gc calls on page loads)
[^alert-remove]: NU.alert.prototype.remove (N.gc.ds call when a popup is removed)
[^ds]: ND.ds implementation (observable list)
