---
type: UI Component
title: bindSelect
description: Bind typed choices and change events to a native Select while retaining authored options.
tags: [ui, select, binding, accessibility]
status: draft
symbols: [bindSelect]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public Select types and export
    git_blob: fb7b7ba6e42f7c8fc818ca514bdaf55647e1cf80
  - id: select
    resource: ../../src/ui/select.ts
    title: Select binding runtime
    git_blob: 4160eb77722751aad730fb997a4f0b07a967bd1e
  - id: owner
    resource: ../../src/ui/select-owner.ts
    title: Shared Select ownership
    git_blob: 6902e2789df6e44123b2ea599e4d05fa1c098fa4
generated: { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
---

`bindSelect` adds typed choices to an authored `<select>` and reports the raw selected value. Form owns marked `data-field` Selects, while Grid and List own marked Selects in their repeated templates. An unmarked Select can be bound standalone; bind each Select only once.[^select][^owner]

# Quick start

```html
<label>Priority
  <select data-role="priority">
    <option value="">Choose</option>
  </select>
</label>
```

```ts
import { bindSelect } from "@bbalganjjm/natural_js/ui";

const select = bindSelect(document.querySelector<HTMLSelectElement>('[data-role="priority"]')!, {
  choices: [{ label: "High", value: 2 }, { label: "Low", value: 1 }],
  value: 2,
  onChange(value) { console.log(value); }
});
select.setChoices([{ label: "Normal", value: 3 }]);
select.dispose();
```

# Constructor

`bindSelect<V extends SelectValue>(root: HTMLSelectElement, options: { choices: readonly SelectChoice<V>[]; value?: SelectSelection<V> | readonly SelectSelection<V>[]; onChange?: (value: SelectSelection<V> | readonly SelectSelection<V>[], event: Event) => void }): SelectHandle<V>` requires a native Select and a choice array. Each choice needs a string label and a string, finite number, boolean, or `null` value; `disabled` is optional. Invalid roots, choices, callbacks, or values raise `SELECT_ROOT`, `SELECT_CHOICES`, `SELECT_CALLBACK`, or `SELECT_VALUE`.[^entry][^select]

The component preserves authored child nodes and appends generated `<option>` elements. Authored nonempty option values remain strings; an authored empty value maps to `null`. Generated choices retain their raw scalar type even though DOM `option.value` is a string.[^select]

# Methods

| Method | Behavior |
|---|---|
| `value()` | Returns the raw selected value, `null` when a single Select has no selection, or an array for `multiple`. |
| `setValue(value)` | Selects matching raw values. A single Select accepts one scalar or `null`; `multiple` requires an array. Unmatched values leave no matching option selected. |
| `setChoices(choices)` | Rebuilds generated options, retains authored nodes, and tries to keep the previous raw selection. |
| `dispose()` | Removes the listener and generated options, restores authored nodes and their initial selection, and releases ownership. Repeated disposal is safe. |

After disposal, other methods raise `SELECT_DISPOSED`. A selected option inserted outside `setChoices` can raise `SELECT_OPTION` when read.[^select]

# Events

| Event | Handler | Behavior |
|---|---|---|
| Native `change` | `onChange(value, event)` | Reads the raw selection after the browser changes it; `this` is not rebound. |

# Behavior

A Select already claimed by Form, Grid, List, or another standalone Select raises `SELECT_OWNED` when bound again. It keeps the author's native label, keyboard behavior, `required`, and CSS. Use the owning component's `data-field` or row-local `data-options` markers instead of separately binding the same element.[^owner][^select]

# Pitfalls

The DOM string `value` is not enough to distinguish a generated numeric choice from an authored string choice. Use the handle's `value()`. On a `multiple` Select, the result is always an array and `setValue` needs an array.[^select]

# Related

[Form](form.md) owns field Selects. [Grid](grid.md) and [List](list.md) bind nested row-local choices. [UI contracts](ui.md) defines `SelectChoice` and `SelectHandle`.

[^entry]: Public Select types and export
[^select]: Select binding runtime
[^owner]: Shared Select ownership
