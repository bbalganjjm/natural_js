---
type: UI Component
title: bindList
description: Bind an authored native list to Rows with read-only fields, row-local choices, selection, and paging.
tags: [ui, list, binding, accessibility]
status: draft
symbols: [bindList]
sources:
  - id: row-hooks
    resource: ../../src/ui/grid-hooks.ts
    title: Shared Grid and List row resource lifetime
    git_blob: b3817f2602ecdbc7e4356069ef9266757768dee9
  - id: row-browser
    resource: ../../tests/browser/list-row-bindings.spec.ts
    title: List row resource capture, placement, reentry and cleanup regressions
    git_blob: 1bb534f10b2abd961fd271b4f8eabd3593418d79
  - id: values-browser
    resource: ../../tests/browser/collection-values.spec.ts
    title: Shared mounted value projection, cache, refresh and lifetime regressions
    git_blob: 5c2576a91c9b69b41f1e192db56ad3ec3635d678
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public List handle and export
    git_blob: 539621049109c0b416b33081e134dc6c6621aedf
  - id: list
    resource: ../../src/ui/list.ts
    title: List binding runtime
    git_blob: e97c85d1a9618672a5e84c23b1a38633b5e3d79c
  - id: options
    resource: ../../src/ui/row-options.ts
    title: Shared private row-local options
    git_blob: 4d7359d7fdafb0fda5fafb0ee81372b26722538a
  - id: path
    resource: ../../src/ui/field-path.ts
    title: Safe nested field paths
    git_blob: dfac85c3d4cc2c0a61cb2e4ee210b01583ecc5b2
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Private UI rule runner
    git_blob: 2971c8dc0dfdacaef95c92b137a231297fc6c14e
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Shared native field values, display and constraints
    git_blob: ba5da2de312e41492ce6ead4df8300d13004dd76
  - id: controls-browser
    resource: ../../tests/browser/grid-controls.spec.ts
    title: Shared native display and authored-template constraint regressions
    git_blob: 6df9b6e36371f8547a3366ea60e1afc9f70e5d56
generated: { by: codex/gpt-6, at: 2026-11-14T22:40:53Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
  - { by: codex/gpt-6, at: 2026-11-14T22:40:53Z }
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

`bindList<T extends object>(root: HTMLUListElement | HTMLOListElement, options: { rows: Rows<T>; rules?: RuleSet; onRowBind?: (context: { readonly row: RowSnapshot<T>; readonly elements: readonly HTMLLIElement[]; own(dispose: () => void): void }) => void; beforeBindValue?: (value: unknown, context: ValueBindContext) => unknown; onBindValue?: (value: unknown, context: ValueBindContext) => unknown; onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void }): ListHandle<T>` requires exactly one direct `li[data-row-template]` and at most one direct `li[data-empty]`. The template and descendants cannot have fixed DOM IDs. The component replaces the template temporarily, creates row elements from it, and restores the original on disposal. A second live binding of the root raises `LIST_IN_USE`.[^entry][^list]

| Option | Behavior |
|---|---|
| `rows` | Required caller-owned Rows store; List never disposes it. |
| `rules` | Optional RuleSet catalogs, messages, locale and field declarations; see [shared rules](rules.md). Retained UI built-ins also resolve. |
| `beforeBindValue`, `onBindValue` | Captured synchronous value functions for named rendered fields; see [shared value callbacks](value-callbacks.md). |
| `onRowBind` | Captured synchronous function over the current immutable row, one readonly LI element and owned cleanup; see [row resources](#row-binding-and-owned-resources). |
| `onSelect` | Receives changed row ID, row snapshot or `null`, and the source event; programmatic changes pass `event: null`. |

bindList captures its Rows once. Rendering, subscription, selection and validate() use that same store; replacing options.rows cannot redirect an existing binding. Update the captured Rows normally, or dispose and bind a new owner for another store. No store is cloned or frozen.[^list]

# Value callbacks and refresh

List shares beforeBindValue/onBindValue and ValueBindContext with Form/Grid. Projections pass through existing display and typed-choice writers; read-only controls remain read-only. Raw Rows, originals and validation stay separate. Options-only Selects have no named value callback; hidden retained records and detached validation probes do not run hooks. A clone being prepared for actual placement can receive callbacks before document connection.[^list][^values-browser]

Initial/newly shown rows and explicit refresh use bind; a retained committed raw change uses val. Unchanged successful projections stay cached; raw change or refresh retries a failed projection. Choice-source-only updates recheck cached replacement availability. Reentrant binding raises LIST_BIND_REENTRANT; source mutations can already be committed, so correct the callback and refresh rather than assuming rollback.[^list][^values-browser]

refresh(): void reprojects the visible records using the same compiled fields and existing row identities. It retains selection and the configured sort/filter/paging policies; ordinary rendering recomputes their visible result and applies the existing focus policy. Known issues and raw data remain. Use it after deliberately changing an application policy read by a forwarding callback. Hidden records receive no refresh hook; showing them later performs bind. No new dataset, whole-Form observer or edit mode is introduced.[^list][^values-browser]

# Row binding and owned resources

onRowBind receives the inferred { row, elements, own } context after values and final LI placement, in displayed order. Capture occurs once at creation; calls are plain and synchronous. The row retains its store-local RowId and the one-element array is frozen. Connect the List root before measuring document layout. No named row-context type is exported from the UI entry.[^list][^row-hooks][^row-browser]

Use own(() => void) for each resource created for this binding. Cleanup runs in reverse registration order before changed/forced value writes, view exit, source pruning or disposal. Pure sorting of retained unchanged rows preserves their resources. A filtered or paged row gets a fresh binding when it re-enters, even if its cached LI and snapshot are unchanged. Hidden rows get no callback. A late own call immediately disposes its new resource and rejects the released binding.[^row-hooks][^list][^row-browser]

```ts
const list = bindList(root, {
  rows,
  onRowBind({ row, elements, own }) {
    const element = elements[0];
    const inspect = () => showEmployee(rows.get(row.id));
    element.addEventListener("employee-inspect", inspect);
    own(() => element.removeEventListener("employee-inspect", inspect));
  }
});
```

root, rows and showEmployee are application values. Read Rows.get(row.id) in a later action to observe current source data. onSelect remains a changed-selection notification; repeated actions on the same selected row belong to authored native/custom event handlers. The employee example demonstrates delegated row handlers with one WeakMap of physical elements and owned registrations.[^list][^row-browser]

Asynchronous callback/cleanup results are drained and rejected. Reentrant refresh/sort/filter/page binding raises LIST_BIND_REENTRANT before changing those view options. A post-callback source/view checkpoint raises LIST_BIND_STALE when it detects changed work. An uncaught subscriber reentry can instead propagate LIST_BIND_REENTRANT first; the source mutation may already have committed. Correct the callback and refresh. A callback/checkpoint failure closes all prepared bindings, while initial setup failure restores template/Select ownership. Cleanup continues across all resources and reports the first LIST_BIND error after restoration; an earlier setup failure stays primary. List controls remain read-only.[^list][^row-hooks][^row-browser]

# Declarative options

| Marker | Element | Behavior |
|---|---|---|
| `data-row-template` | One direct `li` | Defines the repeated authored markup. |
| `data-empty` | Optional direct `li` | Shown when the visible slice is empty; prior hidden state returns on disposal. |
| `data-field="path"` | Row descendant | Reads a safe dot-separated object path; ordinary display uses text, and images receive native `src`. |
| `data-format='[["name",...args]]'` | Text-like input, textarea, or text element | Formats display only; non-text inputs and Selects reject nonempty effective formatters. |
| `data-validate='[["name",...args]]'` | Field | Validates the stored raw value. |
| `data-error-for="path"` | Row descendant | Displays issues as text and associates with a matching field. |
| `data-select-row` | Button with `type="button"` | Changes selected row and reflects it with `aria-pressed`. |
| `data-options="path"` | Select | Reads a row-local array of option objects. |
| `data-option-label="path"`, `data-option-value="path"` | Select with `data-options` | Read an option label and raw scalar value. |

Nested field and option paths reject array indices, expressions, prototype keys, and empty segments. For `{ teams: [{ id: 2, name: "Platform" }] }`, `data-options="teams"` binds the nested array directly into that row's Select. The selected `data-field` may be a different nested scalar. Authored options remain; generated choices preserve raw string, finite number, boolean, or `null` values. A row-local `<select multiple>` displays an array of raw choices without editing it; validation requires the stored field to be an array whose values are available options. Repeated equal raw values select one matching option per array item. Validation also counts available occurrences: [1,1] needs two raw-1 options; an excess occurrence reports select-option without rewriting the stored value.[^list][^options][^path]

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

Native validation probes use the authored template's constraints and effective disabled state, rather than the display clone's forced disabled state. Programmatic text min/max lengths and invalid native value sanitization therefore report the same failures as Form/Grid, including for off-page rows. Authored disabled controls retain native `willValidate` behavior. An image's `src` is removed for `null` or empty text, with authored `alt` preserved. These shared operations stay private; List has no public `render` option and remains display-only.[^native][^list][^controls-browser]

Cloned row elements are reused across sort/filter/page changes and updated when their row snapshot changes. `RowId` never becomes a DOM ID. A deleted selected row clears selection. `Rows.replace` and changes clear stale issues without running validators in a store callback; call `validate()` before saving.[^list]

# Pitfalls

A List does not commit edits from its disabled display controls. Keep application sort/filter functions outside the framework. A Select inside a List row is owned by List and cannot also be bound with `bindSelect`. A fixed ID in the repeated template raises `DUPLICATE_ID`; keep IDs outside repeated markup and use `data-field` for binding.[^list]

Shared Rows insertion/movement/copy changes store order while preserving existing IDs. Sort/filter/page still controls displayed order. Movement retains existing validation messages and keeps a focused row button attached during reorder; bound fields remain read-only under the current List contract. Value reversion retains store order; see [Rows](data.md) for the operation contract.[^list]

# Related

[Rows](data.md) owns row identity and changes. [Form](form.md) edits a selected row. [Grid](grid.md) offers inline cell editing. [Pagination](pagination.md) can use `list.page()`. [UI contracts](ui.md) defines `ListHandle`.

[^entry]: Public List handle and export
[^list]: List binding runtime
[^options]: Shared private row-local options
[^path]: Safe nested field paths
[^rules]: Private UI rule runner
[^native]: Shared native field values, display and constraints
[^controls-browser]: Shared native display and authored-template constraint regressions

[^values-browser]: Shared mounted value projection, cache, refresh and lifetime regressions

[^row-hooks]: Shared Grid and List row resource lifetime
[^row-browser]: List row resource capture, placement, reentry and cleanup regressions
