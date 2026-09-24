---
type: API Reference
title: N.ds
description: DataSync (N.ds) keeps data components that share one data collection in step by forwarding row and cell changes from one component to the others.
tags: [data, datasync, data-binding]
status: draft
symbols: [N.ds, N.ds.instance, ND.ds, ND.ds.instance, ND.ds.prototype.notify, ND.ds.prototype.remove, data_sync_temp__]
sources:
  - id: ds
    resource: ../../src/natural.data.js
    title: ND.ds implementation (constructor, instance, remove, notify)
    symbol: ND.ds
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 64d1318e0071
  - id: gc-ds
    resource: ../../src/natural.core.js
    title: NC.gc.ds (prunes DataSync observers)
    symbol: NC.gc.ds
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: cd1f9b60cc81
  - id: form-update
    resource: ../../src/natural.ui.js
    title: NU.form.prototype.update
    symbol: NU.form.prototype.update
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 90d6ccb40457
  - id: grid-update
    resource: ../../src/natural.ui.js
    title: NU.grid.prototype.update
    symbol: NU.grid.prototype.update
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 81ff81deb9ec
  - id: list-update
    resource: ../../src/natural.ui.js
    title: NU.list.prototype.update
    symbol: NU.list.prototype.update
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 9eef2b69bea2
  - id: tree
    resource: ../../src/natural.ui.js
    title: NU.tree implementation (registers with ND.ds, no update method)
    symbol: NU.tree
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: f6ae2cfd96ed
  - id: comm-submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (loads views and calls NC.gc.ds)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

DataSync is the two-way binding hub of Natural-JS: data components register with it, and when one of them changes a row or a cell it notifies every other registered component that holds the **same data collection object**. It works without application code as long as components share one collection; call `N.ds.instance(component).notify(row, key)` only after changing bound data by hand. This page is written from code; there was no legacy guide.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.ds.instance` | `N.ds.instance(inst[, isReg])` | the shared DataSync object |
| `N.ds` | `new N.ds(inst[, isReg])` | the shared DataSync object |
| `notify` | `ds.notify([row[, key]])` | the DataSync object |
| `remove` | `ds.remove()` | the DataSync object |

# Constructor

## `N.ds.instance(inst[, isReg])`

Factory used by the framework; it returns `new ND.ds(inst, isReg)`.[^ds]

## `new N.ds(inst[, isReg])`

- `inst`: a component instance (N.form, N.list, N.grid, N.tree) whose `options.data` is its data collection.
- `isReg` (boolean): `true` also registers `inst` as an observer.
- Looks for `var#data_sync_temp__` inside the element(s) of `N.context.attr("architecture").page.context`, appending it when missing, and keeps one DataSync object on it as instance `"ds"`. The constructor returns that shared object, so every call inside one page context yields the same object.[^ds]
- The first call creates the object with `observable = [inst]`, whether or not `isReg` is set. Later calls set the object's current `inst` to the new component and, when `isReg === true`, push it onto `observable` without checking for duplicates.
- When `page.context` matches no element, it logs `[ND.ds]Context element is missing...` and returns a new unregistered object on every call, so synchronization silently does nothing. See [Configuration](../setup/configuration.md).
- `N.ds` is a class: calling it without `new` throws a `TypeError`.

Because the object is shared and `inst` is overwritten on every call, always chain the method onto the call: `N.ds.instance(this).notify(row, key)`.

# Options

There are no options. The shared object carries these fields:[^ds]

| Name | Type | Description |
|---|---|---|
| `inst` | component | The component passed to the latest `instance()` call; `notify` and `remove` act for it. |
| `observable` | component[] | Registered components. |
| `viewContext` | N collection | The `var#data_sync_temp__` element that stores the object. |

# Methods

## `notify([row[, key]])`

For every registered component other than `inst` whose `options.data` is the same object (`===`) as `inst.options.data`:[^ds]

- an N.form gets `update(row, key)` only when `row === form.row()`, so `notify()` without a row never updates forms;
- any other component gets `update(row, key)`.

What `update` does:

| Component | `update(row, key)` |
|---|---|
| N.form | With `key`: if `row` is the form's row, sets that column with `val(key, value, false)` (no further notify) and flashes the element with `NC.element.dataChanged` (class `data_changed__`). Without `key`: `bind(row, "update")`.[^form-update] |
| N.grid, N.list | `row` and `key`: updates that cell through the row's form. `row` only: re-renders that row, or rebinds all rows when the row's `rowStatus` is `"insert"`. No `row`: rebinds all rows.[^grid-update][^list-update] |
| N.tree | No `update` method (see Known issues). |

Callers in Natural-UI: N.form `add()`, `remove()`, `revert()`, `val()` (for a column with an element, only when the third argument is not `false`, and inputs and selects notify through their data-sync handler, which skips a value equal to the stored one and, for text inputs of a form whose `validate` option is on, a value that failed validation; for a column without an element, whenever the new value differs from the stored one, whatever the third argument is) and the input data-sync handlers (row forms of N.grid and N.list notify for their parent with the parent's row index), plus `N.list.prototype.remove` and `N.grid.prototype.remove`. N.form (when it is not a row form), N.list, N.grid and N.tree register themselves at the end of their constructors with `N.ds.instance(this, true)`.

## `remove()`

Removes the current `inst` from `observable` and returns the DataSync object. No framework code calls it.[^ds]

# Pitfalls

Components synchronize only when they hold the same collection object. Passing the same plain array to two components wraps it twice (`N(array)`), which gives two collections and no synchronization.

```js
// Wrong (legacy): grid.bind(rows); form.bind(0, rows); // two N(rows) collections, edits are not mirrored
grid.bind(rows);
form.bind(0, grid.data(false)); // data(false) returns the grid's own collection
```

- Registration has no de-duplication and the observer list is never pruned (Known issues), so a component re-created on the same element keeps its old instance registered until the page context is re-rendered.
- The registry lives inside the page context element. Loading a view into the page context with `obj.html(data)` removes `var#data_sync_temp__`, so the next registration starts a new registry.[^comm-submit]

# Known issues

* **`NC.gc.ds` never prunes observers** - Actual: it assigns the live component list to `instance("ds").obserable` (misspelled), while DataSync reads `observable`, so removed components stay registered and keep receiving `update` calls. Likely intent: replace `observable`. Workaround: none needed for correctness in most pages; avoid sharing one collection between a live component and components of views that were closed.[^gc-ds]
* **N.tree registers without an `update` method** - Actual: the N.tree constructor calls `ND.ds.instance(this, true)`, but its `update(row, key)` is commented out, so `notify` throws `TypeError: observable[i].update is not a function` when a tree shares its collection with the notifying component. Likely intent: implement `update` or skip registration. Workaround: give N.tree its own collection (`N(rows)` or a copy), not another component's.[^tree]

# Examples

Master grid and detail form on one collection:

```js
const grid = N([]).grid(N("#grid", view));
const form = N([]).form(N("#detail", view));

grid.bind(rows);
form.bind(0, grid.data(false));
// typing in #detail updates the row object, and the grid cell is refreshed through N.ds
```

Notify other components after editing bound data directly:

```js
const data = grid.data(false);
data[2].status = "done";
grid.update(2, "status");                  // refresh the grid itself (notify skips the caller)
N.ds.instance(grid).notify(2, "status");   // refresh every other component on the same collection
```

# Related

- [N.form](../ui/form.md) - `bind(row, data)`, `val()` and `update()`; the form side of synchronization.
- [N.grid](../ui/grid.md) and [N.list](../ui/list.md) - `data(false)` returns the collection to share.
- [N.tree](../ui/tree.md) - registers with DataSync but cannot receive updates.
- [N.gc](../core/gc.md) - `N.gc.ds` and the garbage collection run when views load.
- [Configuration](../setup/configuration.md) - `N.context.attr("architecture").page.context`, where the registry lives.

[^ds]: ND.ds implementation (constructor, instance, remove, notify)
[^gc-ds]: NC.gc.ds (prunes DataSync observers)
[^form-update]: NU.form.prototype.update
[^grid-update]: NU.grid.prototype.update
[^list-update]: NU.list.prototype.update
[^tree]: NU.tree implementation (registers with ND.ds, no update method)
[^comm-submit]: NA.comm.submit (loads views and calls NC.gc.ds)
