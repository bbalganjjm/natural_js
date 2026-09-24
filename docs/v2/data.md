---
type: API Reference
title: Natural-JS 2.0 rows
description: Immutable JSON row snapshots with store-local identity, change tracking, and subscriptions.
tags: [data, rows, typescript]
status: draft
symbols: [RowId, Snapshot, RowStatus, RowSnapshot, RowChange, Rows, createRows]
sources:
  - id: data
    resource: ../../src/data/index.ts
    title: Row store runtime and types
    git_blob: 85c9f0c7140580e7217dadb91476d824025b3a07
generated: { by: codex/gpt-6-sol, at: 2026-09-24T09:00:49Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T09:10:24Z }
---

The `./data` entry exports `createRows` and row types. It stores JSON-compatible rows without adding framework fields to business values, and uses store-local numeric IDs for identity.[^data]

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `createRows<T>` | `createRows(initial?)` | `Rows<T>` |
| `RowId` | `number` | Store-local row identity |
| `Snapshot<T>` | Deep readonly mapping | Immutable JSON view |
| `RowStatus` | `clean`, `insert`, `update`, `delete` | Change state |
| `RowSnapshot<T>` | `id`, `value`, `status` | Identified row |
| `RowChange<T>` | `id`, changed `status`, `value` | Save change |
| `Rows<T>` | Row operations below | Store interface |

# Functions

## `createRows(initial?)`

Accepts an optional array of plain, acyclic JSON-compatible row objects. It clones and deeply freezes rows and nested arrays/objects. Values such as `Date`, `undefined`, `NaN`, functions, symbol keys, and cycles fail with `ROW_VALUE`. Invalid replacement input leaves existing rows unchanged.[^data]

# Methods

| Store member | Behavior |
|---|---|
| `replace(values)` | Replaces all rows with clean copies and new IDs; existing IDs are never reused. |
| `entries()` | Returns visible rows in store order; deleted rows are omitted. The returned frozen array is cached until a change. |
| `get(id)` | Returns a row snapshot, including a row marked for deletion, or `undefined`. |
| `add(value)` | Adds an inserted row and returns its ID. |
| `set(id, field, value)` | Replaces one top-level field. Nested arrays/objects are cloned and frozen as one value. Returning a field to its original value clears its dirty state. |
| `remove(id)` | Marks an original row deleted; removes an inserted row immediately. |
| `revert(id?)` | Restores one or all changed rows; discards inserted rows. |
| `changes()` | Returns cached frozen `insert`, `update`, and `delete` changes. A deleted row carries its original value. |
| `subscribe(listener)` | Calls the listener after a mutation and returns an unsubscribe function. Disposal during notification stops delivery to remaining listeners. |
| `dispose()` | Clears rows and listeners; later operations fail with `ROWS_DISPOSED`. Repeated disposal is safe. |

A no-op `set`, repeated `remove` of a deleted row, and `revert` of clean rows do not notify. Row snapshots remain stable until that row changes; `entries()` and `changes()` reuse their array reference until mutation.[^data]

# Pitfalls

`RowId` is neither a business key, an array index, nor a DOM `id`. Do not mutate a snapshot or infer its ID from sorted/filtered position. The M3 store accepts nested JSON as an atomic field; nested-path edits and row-local Select option binding belong to later UI milestones. A throwing subscriber propagates after the mutation and prevents later listeners from running.[^data]

Invalid values use `ROW_VALUE`; missing IDs use `ROW_MISSING`; editing a deleted row uses `ROW_DELETED`; a non-string runtime field uses `ROW_FIELD`. These are `FrameworkError` codes with the failing `Rows.*` API.[^data]

# Examples

```ts
import { createRows } from "@bbalganjjm/natural_js/data";

const rows = createRows([
  { name: "Ada", options: [{ label: "First", value: 1 }] }
]);
const id = rows.entries()[0].id;
const unsubscribe = rows.subscribe(() => console.log(rows.entries().length));
rows.set(id, "options", [{ label: "Second", value: 2 }]);
const pending = rows.changes();
unsubscribe();
rows.dispose();
```

# Related

[The M1 contract](../implementation/m1-contract.md) defines row identity and nested data goals. [UI types](ui.md) describe the future Form/Grid connection.

[^data]: Row store runtime and types