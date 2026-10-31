---
type: Guide
title: Grid compositions
description: Use current Rows values, native events and authored table structure without adding Grid utility APIs.
tags: [ui, grid, events, migration]
status: draft
sources:
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid delegation and current row identity
    git_blob: 0a3fe6f4fa2fce0d9799059a8de06fd6e5ba6b6f
  - id: rows
    resource: ../../src/data/index.ts
    title: Immutable snapshots and independent store identity
    git_blob: 8316515489ad2fda7b04bdd88bb5772abc1c6cd9
  - id: recipes
    resource: ../../tests/browser/grid-recipes.spec.ts
    title: Projections, native event order and authored topology regressions
    git_blob: 09e49a7e553fa468c8035c1f46dcb6624500ea7d
  - id: activation
    resource: ../../tests/browser/grid-acceptance.spec.ts
    title: Accessible record-area activation regressions
    git_blob: 2e9a74870bcb0dad727465c5044c0d9cf63f4b45
  - id: demo
    resource: ../../examples/vite/m10/demo.ts
    title: Rebind-safe native event observation
    git_blob: e9e807d4ee582f4345358c8c838ce1d8c7789bdd
generated: { by: codex/gpt-6, at: 2026-10-28T13:26:39Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-28T13:26:39Z }
---

# Goal

Compose data projection, post-edit events and template inspection from [Grid](grid.md), [Rows](data.md) and native APIs. A RowId identifies data; a DOM index or repeated DOM ID does not.[^grid][^rows]

# Prerequisites

Keep the authored table and its template nodes in the owning controller. Pass caller-owned Rows to Grid. Register component disposers with the CVC page and retain native event cleanup at the same scope.

# Steps

## Project current values

`selected()` is the active detail identity. `selectedIds()` is independent batch membership; `checkedIds()` is independent checked membership. Neither set is restricted to mounted DOM. Resolve current values when using them, because previous snapshots intentionally remain unchanged after edits.[^grid][^rows]

```ts
const activeId = grid.selected();
const active = activeId === null ? undefined : rows.get(activeId);
const checkedIds = new Set(grid.checkedIds());
const checked = rows.entries().filter(row => checkedIds.has(row.id));
const visibleIds = new Set(grid.rowIds("visible"));
const checkedOnPage = checked.filter(row => visibleIds.has(row.id));
const values = checked.map(row => row.value);
const fields = values.map(value => Object.fromEntries(
  ["name", "profile"].filter(key => Object.hasOwn(value, key))
    .map(key => [key, Reflect.get(value, key)])
));
```

Use `setChecked(ids)` to replace membership. To append, merge IDs through `new Set([...grid.checkedIds(), ...ids])` before calling it. Single-check mode rejects an ambiguous multi-ID proposal. Store order controls returned membership, independent of sort, filter and page. Deleted/ineligible records are pruned through the existing owner. Application payloads use business keys; store-local RowIds are not server identifiers.[^recipes][^rows]

## Observe native events after Grid handling

Row-hook listeners execute before root delegation. To observe Grid's synchronous processing, register the application listener on the same table **after** `bindGrid`. Associate every physical row with its RowId through the existing row hook, and read a fresh snapshot at event time.[^grid][^recipes]

```ts
const ids = new WeakMap<HTMLTableRowElement, RowId>();
const grid = bindGrid(table, {
  rows,
  onRowBind({ row, elements, own }) {
    for (const element of elements) ids.set(element, row.id);
    own(() => { for (const element of elements) ids.delete(element); });
  }
});
const events = new AbortController();
table.addEventListener("change", event => {
  const target = event.target;
  if (!(target instanceof Element) || target.closest("table") !== table) return;
  const element = target.closest("tr");
  const id = element ? ids.get(element) : undefined;
  const row = id === undefined ? undefined : rows.get(id);
  if (row) observe({ event, row }); // Application handler.
}, { signal: events.signal });
own(() => { events.abort(); grid.dispose(); });
```

Here `RowId` comes from the data entry, `own` is the owning page's cleanup registration, and `observe` is application code. Input events may expose drafts while Rows retains the committed value. Invalid changes and manual timing do not promise a commit. Read the field and its error region when the application also needs entered text or validation presentation. A custom bubbling event can use the same listener pattern. Rebinding requires aborting the old listener and registering a new one after the new Grid instance; retaining its old registration would change event order.[^recipes][^demo]

The framework does not synthesize native input/change events for programmatic `Rows.set`, `Grid.paste` or `Grid.validate`. Use `Rows.subscribe` for committed programmatic data changes. A native custom event runs only when application code dispatches it; Grid does not synthesize one.[^grid][^rows][^recipes]

## Inspect authored topology and replace a template

Keep `table`, `table.tHead`, `table.tFoot`, the original template and its physical `tr` nodes. Native `rows`, `cells`, `rowSpan`, `colSpan` and authored `data-column`/`data-columns` describe structure. `grid.columns()` supplies current managed key order, preferred widths and hidden flags. Widths are preferences, not measured pixel sizes; inspect bounding rectangles only when the application needs current geometry. No public table matrix or copied compiler is needed.[^recipes]

Dispose before editing the original template, then bind again with the same Rows. Disposal restores the authored nodes. The new binding recompiles fields and installs one listener set. State held by the previous Grid, including drafts and selection, ends with that instance. Use controlled dispose/edit/rebind rather than mutating an owned template or adding a mutation observer.[^grid][^recipes]

## Add pointer activation and authored feedback

Set `selectOnRowClick: true` to activate from noninteractive record areas. Keep an authored selection button for Enter/Space, focus and `aria-pressed`; native table semantics stay unchanged. The alternative must have `tabIndex >= 0`. Hiding, disabling or removing every selection button from the tab order for a record also disables its added row-area click path. `toggleSelection` and `multiple` retain their existing meanings; programmatic `select` stays absolute.[^activation]

Use application CSS such as `tbody tr:hover, tbody tr:focus-within` for record feedback. The framework does not supply a visual design. A focusable enclosing scroll region does not make every descendant an interactive row target; controls within the clicked record remain excluded.[^activation][^demo]

# Verify

The recipe regressions cover current nested values, own properties, off-page membership, native event order, invalid/manual drafts, row lifetimes and authored inspection/rebind. Activation regressions cover button availability, modifiers, veto, physical-row identity and bounded viewport/progressive records. The selected [acceptance plan](../implementation/m10-acceptance-plan.md) owns execution evidence and unresolved cross-owner obligations.[^recipes][^activation]

# Pitfalls

Keeping an old snapshot or row-hook context does not keep its value current. Native same-root registration order is part of this composition. A descendant listener or one installed before Grid is not a post-edit observer. No callback composition, server status import or generic event declaration API is implied by these examples.

# Next

Use [the all-options demo](grid-demo.md) to exercise activation and inspect native event snapshots. Incoming legacy status metadata, shared programmatic field declarations and global/local hook composition remain required in the [parity plan](../implementation/feature-parity-plan.md).

[^grid]: Grid delegation and current row identity
[^rows]: Immutable snapshots and independent store identity
[^recipes]: Projections, native event order and authored topology regressions
[^activation]: Accessible record-area activation regressions
[^demo]: Rebind-safe native event observation
