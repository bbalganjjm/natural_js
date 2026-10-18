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
    git_blob: a6ff14aa948a02e0aeb60385ef9a0aee0056a7d4
generated: { by: codex/gpt-6, at: 2026-10-18T10:42:16Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-18T10:42:16Z }
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
| `RowsEvent` | `type`, target `id` or batch `ids` when applicable, `changed` | Synchronous store notification |
| `Rows<T>` | Row operations below | Store interface |

# Functions

## `createRows(initial?)`

Accepts an optional array of plain, acyclic JSON-compatible row objects. It clones and deeply freezes rows and nested arrays/objects. Values such as `Date`, `undefined`, `NaN`, functions, symbol keys, and cycles fail with `ROW_VALUE`. An invalid outer replacement does not commit; application side effects during value evaluation are not rolled back.[^data]

# Methods

| Store member | Behavior |
|---|---|
| `replace(values)` | Replaces all rows with clean copies and new IDs; existing IDs are never reused. |
| `entries()` | Returns non-deleted rows in store order. The returned frozen array is cached until a change. |
| `get(id)` | Returns a row snapshot, including a row marked for deletion, or `undefined`. |
| `add(value)` | Adds an inserted row and returns its ID. |
| `set(id, field, value)` | Replaces one top-level field. Nested arrays/objects are cloned and frozen as one value. Returning a field to its original value clears its dirty state. |
| `setMany(updates)` | Validates ordered `{ id, values: Partial<T> }` patches, then applies all effective top-level field changes in one batch. |
| `remove(id)` | Marks an original row deleted; removes an inserted row immediately. |
| `revert(id?)` | Restores one or all changed rows; discards inserted rows. |
| `changes()` | Returns cached frozen `insert`, `update`, and `delete` changes. A deleted row carries its original value. |
| `subscribe(listener)` | Calls `listener(event)` after a mutation or `revert` attempt and returns an unsubscribe function. An existing no-argument listener remains valid. Disposal during notification stops delivery to remaining listeners. |
| `dispose()` | Clears rows and listeners; later operations fail with `ROWS_DISPOSED`. Repeated disposal is safe. |

A no-op `set`, a net no-op `setMany`, and repeated `remove` of a deleted row do not notify. A clean-row `revert(id)` or an all-clean `revert()` sends an event with `changed: false` so subscribers can clear local drafts without invalidating the cached `entries()` and `changes()` arrays. Row snapshots remain stable until that row changes.[^data]

## `setMany(updates)`

Accepts `readonly { readonly id: RowId; readonly values: Partial<T> }[]`. Every ID must belong to a nondeleted row, including an empty patch. Each `values` must be a plain JSON-compatible object. All patches are cloned and checked before any stored value changes; an invalid later patch or ID leaves the entire batch unapplied. Duplicate IDs merge in input order, with the last value for a field winning. A patch replaces top-level fields; it does not interpret dot paths or merge a nested object.[^data]

Only rows with a final effective change receive a new snapshot. IDs, store order and unchanged row snapshots stay intact. Returning original fields to their original JSON values clears their dirty state; inserted rows remain inserted. An empty batch or duplicate patches that cancel out preserve cached arrays and do not notify. One `setMany` event lists only changed IDs, uniquely and in their first input-occurrence order. Subscribers see all committed rows together. This operation does not add or remove rows.[^data]

Scalar equality uses `Object.is`, including distinct `0` and `-0`; nested arrays and objects compare structurally. If evaluating supplied values reenters and changes the store, the stale outer `set`, `setMany`, `add` or `replace` fails before its own write (`ROW_VALUE`, or the first target/disposal error encountered). The application's inner side effects remain; they are not rolled back.[^data]

# Events

`RowsEvent` has `type: "replace" | "add" | "set" | "setMany" | "remove" | "revert"` and `changed: boolean`. `replace` has no target; `add`, `set`, and `remove` carry their target `id`; `setMany` carries a frozen `ids: readonly RowId[]` instead of `id`. `revert(id)` carries that `id`, while `revert()` omits it. Actual data mutations have `changed: true`; only a clean `revert` has `changed: false`. Events are frozen and delivered synchronously. If a subscriber throws, later live subscribers still receive the same event, then the first thrown value is propagated to the caller. The data mutation has already happened and is not rolled back. Unsubscription and disposal still stop delivery to affected listeners.[^data]

# Pitfalls

`RowId` is neither a business key, an array index, nor a DOM `id`. Do not mutate a snapshot or infer its ID from sorted/filtered position. The store accepts nested JSON as an atomic top-level field; Form copies a nested object path before calling `Rows.set`, and Grid prepares copied top-level paths before calling `Rows.setMany` for paste. Form and Grid own their row-keyed drafts and rules; Rows does not parse or validate business rules. A throwing subscriber cannot block later live subscribers; its error propagates after delivery. Do not retry a throwing batch assuming its values were rolled back.[^data]

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

```ts
const rows = createRows([{ name: "Ada", active: false }, { name: "Grace", active: false }]);
const [ada, grace] = rows.entries();
rows.setMany([
  { id: ada.id, values: { name: "Ada Lovelace", active: true } },
  { id: grace.id, values: { active: true } }
]); // One notification; row IDs stay unchanged.
rows.dispose();
```

# Related

[The M1 contract](../implementation/m1-contract.md) defines row identity and nested data goals. [Form](form.md) and [Grid](grid.md) describe their binding contracts.

[^data]: Row store runtime and types
