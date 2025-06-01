# Natural-UI Tree Component Developer Guide

The Tree (N.tree) component of Natural-UI is a UI component that creates tree elements from hierarchical data.

## Contents

1. Overview
2. Constructor
3. Default Options
4. Methods
5. Usage Examples
6. Notes
7. Related Components

## Overview

Tree (N.tree) is a UI component that creates tree elements from hierarchical data. You can add checkboxes to nodes for group selection.

## Constructor

### N.tree

Creates an instance of `N.tree`.

```javascript
const tree = new N.tree(data, optsOrContext);
```

- **data** (array of JSON objects): Sets the data option. Same as the data option in default options.
- **optsOrContext** (object | jQuery selector string | jQuery object): Specifies the default options object for the component. If a jQuery selector string or object is provided, it is set as the context option in default options.

### N(obj).tree

Creates an instance of N.tree using the jQuery plugin method.

```javascript
const tree = N(data).tree(optsOrContext);
```

Although the instantiation method differs, instances created with `new N.tree()` and `N().tree` are identical. The first argument of the N() function is set as the first argument of the new N.tree constructor.

- **optsOrContext** (object | jQuery selector string | jQuery object): Same as the second argument (opts) of the N.tree function.

## Default Options

- **data** (array of JSON objects, required): Specifies the data to bind to N.tree.
- **context** (jQuery object or selector string, required): Specifies the block (div) element to apply N.tree.
- **key** (string, required): Specifies the property name of the data to display as the node name.
- **val** (string, required): Specifies the property name of the data to use as the node value.
- **parent** (string, required): Specifies the property name of the data to use as the parent node value.
- **level** (string, optional, default: 'level'): Specifies the property name of the data to use as the node level. Not required, but specifying it can improve rendering speed.
- **folderSelectable** (boolean, optional, default: false): If true, folder nodes can be selected. If true, clicking the [+] icon expands the folder, and clicking the node name selects the node. If false, clicking the folder node name only expands the folder.
- **checkbox** (boolean, optional, default: false): If true, checkboxes are added before node names. When checked, all child nodes are checked and the onCheck event handler is triggered.
- **onSelect** (function, optional, default: null): Event handler triggered when a node is selected.
- **onCheck** (function, optional, default: null): Event handler triggered when a node is checked.

## Methods

- **data(selFlag, ...props): array | jQuery object**
  - Returns the latest data bound to the component.
    - `selFlag`: Determines the type of data returned or filters the data.
      - If undefined: returns the data as an array of JSON objects.
      - If false: returns the original data as a jQuery object.
      - If 'selected': returns the data of selected nodes (array of objects).
      - If 'checked': returns the data of checked nodes (array of objects).
      - If 'checkedInLastNode': returns the data of the last checked nodes (array of objects).
    - Additional arguments: If you specify property names as additional arguments, only those properties are returned (works only when selFlag is 'selected', 'checked', or 'checkedInLastNode').

- **context(selector: string): jQuery object**
  - Returns the context element. If a selector is provided, returns the element(s) within the context.

- **bind(data: array): N.tree**
  - Binds data to the component and creates the tree inside the context element.

- **select(val: string): string | N.tree**
  - Selects a node or returns the value of the selected node. If no argument is provided, returns the value of the selected node. If a value is provided, selects the node with that value.

- **expand(): N.tree**
  - Expands all tree nodes.

- **collapse(isFirstNodeOpen: boolean): N.tree**
  - Collapses all tree nodes. If isFirstNodeOpen is true, all nodes except the first are collapsed.

## Usage Examples

### Basic usage

```javascript
const tree = N([]).tree({
  context: '#tree',
  data: [
    { id: 1, name: 'Root', parent: null },
    { id: 2, name: 'Child 1', parent: 1 },
    { id: 3, name: 'Child 2', parent: 1 }
  ],
  key: 'name',
  val: 'id',
  parent: 'parent',
  checkbox: true
});
```

### Select a node by value

```javascript
tree.select(2); // Selects the node with value 2
```

### Expand and collapse all nodes

```javascript
tree.expand();   // Expands all nodes
tree.collapse(); // Collapses all nodes
```

### Get selected and checked nodes

```javascript
const selected = tree.data('selected'); // Gets selected node data
const checked = tree.data('checked');   // Gets checked nodes data
```

## Notes

- Use the `checkbox` option to enable group selection of nodes.
- Use the `onSelect` and `onCheck` event handlers to customize node selection and checking behavior.
- For best performance, specify the `level` property if your data includes node levels.

## Related Components

- [List](DEVELOPER-GUIDE-UI-List.md): For displaying flat lists of data.
- [Tab](DEVELOPER-GUIDE-UI-Tab.md): For tabbed interfaces.
- [Notify](DEVELOPER-GUIDE-UI.Shell-Notify.md): For global notifications.
