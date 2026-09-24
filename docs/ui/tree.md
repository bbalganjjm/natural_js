---
type: UI Component
title: N.tree
description: Builds a collapsible ul/li tree from a flat JSON object array in which each row names its parent, with node selection and optional cascading checkboxes.
tags: [ui, component, tree]
symbols: [N.tree, N().tree, NU.tree, NU.Tree, NU.Options.Tree]
sources:
  - id: ui
    resource: ../../src/natural.ui.js
    title: NU.tree implementation
    symbol: NU.tree
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: f6ae2cfd96ed
  - id: ui-plugin
    resource: ../../src/natural.ui.js
    title: NU.prototype.tree jQuery plugin wrapper
    symbol: NU.prototype.tree
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 9f80d15bbde1
  - id: ds
    resource: ../../src/natural.data.js
    title: ND.ds data synchronization
    symbol: ND.ds
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 64d1318e0071
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-UI-Tree.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.tree` turns a flat array of rows (each with a display name, a unique value and its parent's value) into a nested `ul`/`li` tree inside a block element. Nodes open and close by click, leaf nodes (or every node with `folderSelectable`) can be selected, and `checkbox: true` adds checkboxes that cascade to children and parents. The tree is display-only: it has no `val()`, `check()` or `update()` method.

# Quick start

```html
<div id="deptTree"></div>
```

```js
const tree = N([]).tree({
    context: "#deptTree",
    key: "deptNm",          // node name
    val: "deptCd",          // unique node value
    parent: "upDeptCd",     // parent's deptCd
    level: "lvl",           // 1 for root rows
    onSelect: function (index, liEle, rowData) {
        console.log(rowData.deptCd);
    }
});

N.comm("getDepts.json").submit(function (rows) {
    tree.bind(rows);        // builds the tree and opens the first root
});
```

# Constructor

## `N(data).tree(opts | context)`

- Calls `new NU.tree(this, opts)` where `this` is the `N(data)` collection, and returns the **N.tree instance**.[^ui-plugin]
- Takes exactly one argument; `key`, `val` and `parent` must go in the options object, so the context-only form is useful only with global configuration.

## `new N.tree(data, opts | context)`

- `data`: flat JSON object array (wrapped with `N()`) or an NJS wrapper.
- `opts | context`: a plain object is the options object; anything else becomes `context`.
- The constructor adds `tree__`, stores the instance (`N(context).instance("tree")`) and registers it with `ND.ds`. It does **not** build the tree: call `bind()`.[^ui]
- Throws `NC.error("NU.tree", e)` when `N.context.attr("ui")` is not defined.

# Options

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | array \| NJS | — | Flat rows, parents before their children. Set by the first constructor argument or the `data` option. |
| `context` | selector \| jQuery | — | Block element (`div`) that receives the tree; `bind()` empties it. |
| `key` | string | — | Property shown as the node name. Inserted as HTML (see Known issues). |
| `val` | string | — | Property holding the node's unique value. Used as the child `ul` `id` and in the class `tree_<val>__`. |
| `parent` | string | — | Property holding the parent node's `val`. |
| `level` | string \| null | `null` | Property holding the depth, where the number `1` marks a root. Without it only the first row is a root. |
| `folderSelectable` | boolean | `false` | `false`: a folder name click opens or closes the folder and only leaf nodes can be selected. `true`: every node name selects the node and only the icon opens or closes it. |
| `checkbox` | boolean | `false` | Adds a checkbox before each node name. |

Defaults are the `NU.tree` constructor values.[^ui] Event handler options are listed under Events.

# Methods

## `data([selFlag][, ...cols])`

| `selFlag` | Returns |
|---|---|
| omitted | Plain array of all rows. |
| `false` | The NJS wrapper itself. |
| `"selected"` | Array with the row of the selected node (empty when none). |
| `"checked"` | Rows of every checked node, including ancestors checked automatically by the cascade. |
| `"checkedInLastNode"` | Rows of checked leaf nodes only. |

With `cols`, the three string forms return objects projected to those keys (`NC.json.mapFromKeys`).[^ui]

## `context([selector])`

Returns the context element, or `context.find(selector)`.

## `bind([data])`

Replaces the data when `data` is given (arrays are wrapped), empties the context, builds the nodes, wires the click handlers and calls `collapse(true)`, which opens the first node. Returns the instance.

## `select()`

Returns the `val` property of the selected node's row, or `undefined` when nothing is selected.

## `select(val)`

Clicks the name of the node whose value is `val` (any primitive), which runs `onSelect` and marks it active. With `folderSelectable: false`, a folder node is opened or closed instead of selected. Collapsed ancestors are not opened. Returns the instance.

## `expand()`

Opens every folder node. Returns the instance.

## `collapse([isFirstNodeOpen])`

Closes every folder node; with `true`, then opens the first node. Returns the instance.

# Events

| Name | Signature | `this` | When |
|---|---|---|---|
| `onSelect` | `function(index, liEle, rowData)` | the `N.tree` instance | A selectable node name is clicked (or `select(val)` clicks it). `index` is the row index in the data, `liEle` the jQuery-wrapped `li`. Runs before `tree_active__` moves, so `this.select()` inside still returns the previous node. |
| `onCheck` | `function(index, liEle, rowData, checkedIndexes, checkedEles, checkedData, checkFlag)` | the `N.tree` instance | A checkbox is clicked with the mouse. `checkedEles` are the checked leaf checkboxes under the clicked node's parent folder (the whole tree for a root node), `checkedIndexes` and `checkedData` their row indexes and rows; `checkFlag` is `true` when the box became checked. |

A global handler with the same name in `N.context.attr("ui").tree` runs after the local one unless the local one returns `false`. See [Component model](component-model.md).

# Global configuration

`N.context.attr("ui").tree` is merged (shallow) over the constructor defaults, for example to share `key`, `val`, `parent` and `level` names across screens. The shipped `natural.config.js` does not define it. See [Configuration](../setup/configuration.md).

# Behavior

- **Build order**: rows are processed in array order. A row becomes a root when it is the first row or when `row[level] === 1`; any other row is appended to the already built node whose `val` equals `row[parent]`. A row whose parent has not been built yet is dropped silently.
- **Markup**: `ul.tree_level1_folder__` holds the roots. Each node is `li[data-index]` with `span.tree_icon__`, an optional `span.tree_check__ > input:checkbox`, `a.tree_key__ > span` (the name) and a child `ul#<val>`. Nodes without children lose the empty `ul` and get `tree_last_node__`.
- **Classes**: `tree__` (context), `tree_<val>__`, `tree_level<n>_node__` and `tree_level<n>_folder__` (with `level`; without it non-root nodes get `tree_level_node__`), `tree_open__` / `tree_close__`, `tree_active__` (selected name), `tree_auto_parents_select__` (partly checked ancestors). See [Theming](theming.md).
- **Opening**: clicking `span.tree_icon__` toggles a folder. `bind()` leaves only the first node open.
- **Checkbox cascade**: checking a node checks all of its descendants and checks its ancestors, marking them `tree_auto_parents_select__` while some of their descendants are unchecked. Unchecking a node unchecks its descendants; ancestors stay checked (marked) while another branch under them is checked and are unchecked when none is.[^ui]

# Pitfalls

Creating the instance does not render anything; call `bind()`.

```js
// Wrong (legacy): N([]).tree({ context: "#tree", data: rows, key: "name", val: "id", parent: "parent", checkbox: true });
N([]).tree({ context: "#tree", data: rows, key: "name", val: "id", parent: "parent", checkbox: true }).bind();
```

`level` defaults to `null`, not `"level"`. Without it only the first row is a root, so data with several roots needs `level`, and the root value must be the **number** `1` (compared with `===`); a string `"1"` root finds no parent and is dropped.

```js
// Wrong (legacy): N(rows).tree({ context: "#tree", key: "name", val: "id", parent: "parent" }).bind(); // expects level to default to "level"
N(rows).tree({ context: "#tree", key: "name", val: "id", parent: "parent", level: "level" }).bind();
```

Sort the rows so that every parent comes before its children (for example by level, or in depth-first order); the `level` option is about roots, not rendering speed.

`val` values become element ids and class names. Keep them unique in the page and limited to letters, digits, `-` and `_`; values with spaces, dots or other selector characters break child placement and `select(val)`.

`data("checked")` also returns partly checked ancestors. Use `data("checkedInLastNode")` when only the checked leaves matter.

`onCheck` does not fire for checkboxes toggled from code or from the keyboard (see Known issues).

# Known issues

* **Node names are not escaped** - Actual: `row[key]` is concatenated into the node HTML, so markup in the data is rendered and scripts in it can run. Likely intent: plain text names. Workaround: escape the name property before `bind()` when it can hold user input.[^ui]
* **`onCheck` fires only for mouse clicks** - Actual: the handler requires `e.clientX > 0 && e.clientY > 0` (marked FIXME in the code), so keyboard toggles and `.trigger("click")` skip `onCheck`, although the cascade still runs. Likely intent: fire on every check change. Workaround: bind your own `click` handler on `.tree_check__ > :checkbox` inside the context.[^ui]
* **A shared data wrapper makes linked components throw** - Actual: the tree registers with `ND.ds` but has no `update()` method, so when another component using the same `data(false)` wrapper changes a row, `ND.ds` calls `tree.update()` and raises a TypeError. Likely intent: either sync the tree or skip it. Workaround: give the tree its own wrapper, for example `N(grid.data()).tree(...)`, which copies the rows into a new array.[^ds]

# Examples

Basic tree with checkboxes:

```js
const tree = N([
    { id: 1, name: "Root", parent: null, level: 1 },
    { id: 2, name: "Child 1", parent: 1, level: 2 },
    { id: 3, name: "Child 2", parent: 1, level: 2 }
]).tree({
    context: "#tree",
    key: "name",
    val: "id",
    parent: "parent",
    level: "level",
    checkbox: true
}).bind();
```

Select a node by value and read the selection:

```js
tree.expand();                      // make sure the node is visible
tree.select(2);                     // runs onSelect for "Child 1"
console.log(tree.select());         // 2
console.log(tree.data("selected")); // [{ id: 2, name: "Child 1", ... }]
```

Expand and collapse:

```js
tree.expand();                      // open every folder
tree.collapse();                    // close every folder
tree.collapse(true);                // close all, then open the first node
```

Read checked nodes:

```js
const leaves = tree.data("checkedInLastNode", "id", "name");
const all = tree.data("checked");   // includes auto-checked ancestors
```

Tree driving a grid:

```js
const grid = N([]).grid("#empGrid");
const deptTree = N([]).tree({
    context: "#deptTree",
    key: "deptNm",
    val: "deptCd",
    parent: "upDeptCd",
    level: "lvl",
    folderSelectable: true,
    onSelect: function (index, liEle, rowData) {
        N({ deptCd: rowData.deptCd }).comm("getEmployees.json").submit(function (rows) {
            grid.bind(rows);
        });
    }
});

N.comm("getDepts.json").submit(function (depts) {
    deptTree.bind(depts);
});
```

# Related

- [Component model](component-model.md) - instances, option precedence and global event handlers.
- [N.list](list.md) - flat lists of rows.
- [N.grid](grid.md) - show the rows that belong to the selected node.
- [N.ds](../data/datasync.md) - why the tree must not share a data wrapper with editable components.
- [Configuration](../setup/configuration.md) - where `N.context.attr("ui").tree` is set.

[^ui]: NU.tree implementation
[^ui-plugin]: NU.prototype.tree jQuery plugin wrapper
[^ds]: ND.ds data synchronization
