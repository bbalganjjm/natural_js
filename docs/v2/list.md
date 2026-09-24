---
type: UI Component
title: bindList
description: Bind an authored native list to Rows with read-only fields, row-local choices, selection, and paging.
tags: [ui, list, binding, accessibility]
status: draft
symbols: [bindList]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public List handle and export
    git_blob: e1c3c3d309fb5b5724965ce348396046b1c77db7
  - id: list
    resource: ../../src/ui/list.ts
    title: List binding runtime
    git_blob: 8d3ef3e1ff3e7b7fb7faed27fc592846dd5fe090
  - id: options
    resource: ../../src/ui/row-options.ts
    title: Shared private row-local options
    git_blob: 72facd6bc5b30845938731897f1f5aadd257a7fa
  - id: path
    resource: ../../src/ui/field-path.ts
    title: Safe nested field paths
    git_blob: dfac85c3d4cc2c0a61cb2e4ee210b01583ecc5b2
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Private UI rule runner
    git_blob: 967142342d060056cd3f124db29f6893a2875d48
generated: { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
---

`bindList` renders a caller-owned `Rows` store inside an authored `<ul>` or `<ol>`. The List displays data and lets users select a row; edit a selected record through a separate Form or Grid.[^list]

# Quick start

```html
<ul data-role="employees">
  <li data-row-template>
    <button type="button" data-select-row>
      <span data-field="profile.name"></span>
    </button>
    <label>Team
      <select data-field="team" data-options="teams"
        data-option-label="name" data-option-value="id">
        <option value="">Choose</option>
      </select>
    </label>
    <output data-error-for="team"></output>
  </li>
  <li data-empty hidden>No employees</li>
</ul>
```

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindList } from "@bbalganjjm/natural_js/ui";

const rows = createRows([{
  profile: { name: "Ada" },
  team: 2,
  teams: [{ id: 2, name: "Platform" }]
}]);
const list = bindList(document.querySelector<HTMLUListElement>('[data-role="employees"]')!, {
  rows,
  onSelect({ id }) { console.log(id); }
});
list.setPage({ page: 1, size: 20 });
if (list.validate().valid) console.log(rows.changes());
list.dispose();
rows.dispose();
```

# Constructor

`bindList<T extends object>(root: HTMLUListElement | HTMLOListElement, options: { rows: Rows<T>; rules?: RuleSet; onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void }): ListHandle<T>` requires exactly one direct `li[data-row-template]` and at most one direct `li[data-empty]`. The template and descendants cannot have fixed DOM IDs. The component replaces the template temporarily, creates row elements from it, and restores the original on disposal. A second live binding of the root raises `LIST_IN_USE`.[^entry][^list]

| Option | Behavior |
|---|---|
| `rows` | Required caller-owned Rows store; List never disposes it. |
| `rules` | Optional component-local formatter/validator overrides, messages, and locale. Retained UI built-ins also resolve. |
| `onSelect` | Receives changed row ID, row snapshot or `null`, and the source event; programmatic changes pass `event: null`. |

# Declarative options

| Marker | Element | Behavior |
|---|---|---|
| `data-row-template` | One direct `li` | Defines the repeated authored markup. |
| `data-empty` | Optional direct `li` | Shown when the visible slice is empty; prior hidden state returns on disposal. |
| `data-field="path"` | Row descendant | Reads a safe dot-separated object path; text uses `textContent`. |
| `data-format='[["name",...args]]'` | Text-like input, textarea, or text element | Formats display only; non-text inputs and Selects reject it. |
| `data-validate='[["name",...args]]'` | Field | Validates the stored raw value. |
| `data-error-for="path"` | Row descendant | Displays issues as text and associates with a matching field. |
| `data-select-row` | Button with `type="button"` | Changes selected row and reflects it with `aria-pressed`. |
| `data-options="path"` | Select | Reads a row-local array of option objects. |
| `data-option-label="path"`, `data-option-value="path"` | Select with `data-options` | Read an option label and raw scalar value. |

Nested field and option paths reject array indices, expressions, prototype keys, and empty segments. For `{ teams: [{ id: 2, name: "Platform" }] }`, `data-options="teams"` binds the nested array directly into that row's Select. The selected `data-field` may be a different nested scalar. Authored options remain; generated choices preserve raw string, finite number, boolean, or `null` values. A row-local `<select multiple>` displays an array of raw choices without editing it; validation requires the stored field to be an array whose values are available options. Repeated equal raw values select one matching option per array item.[^list][^options][^path]

# Methods

| Method | Behavior |
|---|---|
| `select(id)` | Selects an existing nondeleted row or clears with `null`. Hidden and off-page rows can remain selected; unavailable IDs raise `LIST_ROW`. |
| `selected()` | Returns the store-local ID or `null`. |
| `setSort(compare)` | Applies an application comparator to immutable row values, or clears with `null`. |
| `setFilter(predicate)` | Applies an application predicate to immutable row values, or clears with `null`. |
| `setPage(request)` | Uses a one-based positive page and size after filtering and sorting; `null` disables local paging. |
| `page()` | Returns the normalized `PageState` or `null` when paging is off. An empty result has page 1 and 0 pages. |
| `validate(id?)` | Validates one nondeleted row or every nondeleted row, including hidden rows. Returns issues without changing Rows. |
| `dispose()` | Removes listeners, subscriptions, clones, and generated options; restores the template. Repeated disposal is safe. |

An invalid page request raises `LIST_PAGE`; use after disposal raises `LIST_DISPOSED`.[^list]

# Events

| Event | Handler | Behavior |
|---|---|---|
| Native selection button `click` | `onSelect({ id, row, event })` | Fires only when the selected ID changes; `this` is not rebound. |

# Behavior

List fields and row-local Selects are display-only; bound input and Select controls in cloned rows are disabled. Use a Form for editing. Validation checks native input constraints, retained or application rules, Select availability and `required`; invalid controls get `aria-invalid`, and authored error regions receive text and a document-unique `id` for `aria-describedby`. The list keeps native semantics and authored CSS. When a focused row leaves the visible slice, focus moves to another selection button or the list root.[^list]

Cloned row elements are reused across sort/filter/page changes and updated when their row snapshot changes. `RowId` never becomes a DOM ID. A deleted selected row clears selection. `Rows.replace` and changes clear stale issues without running validators in a store callback; call `validate()` before saving.[^list]

# Pitfalls

A List does not commit edits from its disabled display controls. Keep application sort/filter functions outside the framework. A Select inside a List row is owned by List and cannot also be bound with `bindSelect`. A fixed ID in the repeated template raises `DUPLICATE_ID`; keep IDs outside repeated markup and use `data-field` for binding.[^list]

# Related

[Rows](data.md) owns row identity and changes. [Form](form.md) edits a selected row. [Grid](grid.md) offers inline cell editing. [Pagination](pagination.md) can use `list.page()`. [UI contracts](ui.md) defines `ListHandle`.

[^entry]: Public List handle and export
[^list]: List binding runtime
[^options]: Shared private row-local options
[^path]: Safe nested field paths
[^rules]: Private UI rule runner
