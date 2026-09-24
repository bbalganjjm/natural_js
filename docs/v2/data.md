---
type: API Reference
title: Natural-JS 2.0 rows
description: Immutable JSON row snapshots with store-local identity, change tracking, and subscriptions.
tags: [data, rows, typescript]
status: draft
symbols: [RowId, Snapshot, RowStatus, RowSnapshot, RowChange, RowsEvent, Rows, createRows]
sources:
  - id: data
    resource: ../../src/data/index.ts
    title: Row store runtime and types
    git_blob: 10c07414eacccc414b81afc8be5661dd21afe3c6
generated: { by: codex/gpt-6-sol, at: 2026-09-24T11:12:31Z }
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
| `RowsEvent` | `type`, optional `id`, `changed` | Synchronous store notification |
| `Rows<T>` | Row operations below | Store interface |

# Functions

## `createRows(initial?)`

Accepts an optional array of plain, acyclic JSON-compatible row objects. It clones and deeply freezes rows and nested arrays/objects. Values such as `Date`, `undefined`, `NaN`, functions, symbol keys, and cycles fail with `ROW_VALUE`. Invalid replacement input leaves existing rows unchanged.[^data]

# Methods

| Store member | Behavior |
|---|---|
| `replace(values)` | Replaces all rows with clean copies and new IDs; existing IDs are never reused. |
| `entries()` | Returns non-deleted rows in store order. The returned frozen array is cached until a change. |
| `get(id)` | Returns a row snapshot, including a row marked for deletion, or `undefined`. |
| `add(value)` | Adds an inserted row and returns its ID. |
| `set(id, field, value)` | Replaces one top-level field. Nested arrays/objects are cloned and frozen as one value. Returning a field to its original value clears its dirty state. |
| `remove(id)` | Marks an original row deleted; removes an inserted row immediately. |
| `revert(id?)` | Restores one or all changed rows; discards inserted rows. |
| `changes()` | Returns cached frozen `insert`, `update`, and `delete` changes. A deleted row carries its original value. |
| `subscribe(listener)` | Calls `listener(event)` after a mutation or `revert` attempt and returns an unsubscribe function. An existing no-argument listener remains valid. Disposal during notification stops delivery to remaining listeners. |
| `dispose()` | Clears rows and listeners; later operations fail with `ROWS_DISPOSED`. Repeated disposal is safe. |

A no-op `set` and repeated `remove` of a deleted row do not notify. A clean-row `revert(id)` or an all-clean `revert()` sends an event with `changed: false` so subscribers can clear local drafts without invalidating the cached `entries()` and `changes()` arrays. Row snapshots remain stable until that row changes.[^data]

# Events

`RowsEvent` has `type: "replace" | "add" | "set" | "remove" | "revert"` and `changed: boolean`. `replace` has no `id`; `add`, `set`, and `remove` carry their target `id`; `revert(id)` carries that `id`, while `revert()` omits it. Actual data mutations have `changed: true`; only a clean `revert` has `changed: false`. Events are frozen and delivered synchronously. If a subscriber throws, later live subscribers still receive the same event, then the first thrown value is propagated to the caller. The data mutation has already happened.[^data]

# Pitfalls

`RowId` is neither a business key, an array index, nor a DOM `id`. Do not mutate a snapshot or infer its ID from sorted/filtered position. The store accepts nested JSON as an atomic top-level field; Form copies a nested object path before calling `Rows.set`, and Grid reads row-local option arrays. Form and Grid own their row-keyed drafts and rules; Rows only reports mutations. A throwing subscriber cannot block later live subscribers; its error propagates after delivery.[^data]

Invalid values use `ROW_VALUE`; missing IDs use `ROW_MISSING`; editing a deleted row uses `ROW_DELETED`; a non-string runtime field uses `ROW_FIELD`. These are `FrameworkError` codes with the failing `Rows.*` API.[^data]

# Examples

```ts
import { createRows } from "@bbalganjjm/natural_js/data";

const rows = createRows([
  { name: "Ada", options: [{ label: "First", value: 1 }] }
]);
const id = rows.entries()[0].id;
const unsubscribe = rows.subscribe(event => {
  if (event.changed) console.log(rows.entries().length);
});
rows.set(id, "options", [{ label: "Second", value: 2 }]);
const pending = rows.changes();
unsubscribe();
rows.dispose();
```

# Related

[The M1 contract](../implementation/m1-contract.md) defines row identity and nested data goals. [Form](form.md) and [Grid](grid.md) describe their binding contracts.

[^data]: Row store runtime and types