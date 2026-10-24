---
type: API Reference
title: Natural-JS 2.0 rows
description: Immutable JSON rows with stable identity, clean batch append, ordered edits, retained deletion snapshots, and subscriptions.
tags: [data, rows, typescript]
status: draft
symbols: [RowId, Snapshot, RowStatus, RowSnapshot, RowChange, RowsEvent, Rows, createRows]
sources:
  - id: data
    resource: ../../src/data/index.ts
    title: Row store runtime and types
    git_blob: ec509c2fe5274334a07f69b4c098a217262a1c6b
generated: { by: codex/gpt-6, at: 2026-10-24T05:58:18Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-24T05:58:18Z }
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
| `entries(options?)` | Returns non-deleted rows by default; `{ includeDeleted: true }` includes retained deletion snapshots in store order. Each frozen projection has its own cache. |
| `get(id)` | Returns a row snapshot, including a row marked for deletion, or `undefined`. |
| `append(values)` | Loads a validated batch of clean rows at the end; returns frozen new IDs and preserves existing identities, values and pending changes. |
| `add(value, before?)` | Adds an inserted row before a live RowId, or appends when omitted; returns a new ID. |
| `move(id, before?)` | Moves a live row before a live RowId, or to the end when omitted. |
| `copy(id, before?)` | Deeply copies the committed source value into a new inserted row at the requested position; returns its new ID. |
| `set(id, field, value)` | Replaces one top-level field. Nested arrays/objects are cloned and frozen as one value. Returning a field to its original value clears its dirty state. |
| `setMany(updates)` | Validates ordered `{ id, values: Partial<T> }` patches, then applies all effective top-level field changes in one batch. |
| `remove(id)` | Marks an original row deleted; removes an inserted row immediately. |
| `revert(id?)` | Restores changed values/statuses and discards inserted rows, retaining current store order. |
| `changes()` | Returns cached frozen `insert`, `update`, and `delete` changes. A deleted row carries its original value. |
| `subscribe(listener)` | Calls `listener(event)` after a mutation or `revert` attempt and returns an unsubscribe function. An existing no-argument listener remains valid. Disposal during notification stops delivery to remaining listeners. |
| `dispose()` | Clears rows and listeners; later operations fail with `ROWS_DISPOSED`. Repeated disposal is safe. |

A no-op `set`, net no-op `setMany`, empty `append`, unchanged `move`, and repeated `remove` of a deleted row do not notify. A clean-row `revert(id)` or an all-clean `revert()` sends an event with `changed: false` so subscribers can clear local drafts without invalidating the cached entry projections and `changes()` arrays. Row snapshots remain stable until that row changes.[^data]

## `entries(options?)` and `append(values)`

`entries({ includeDeleted: true })` returns all retained snapshots in Map order. It shares row snapshot objects with the live projection but uses a separate frozen-array cache. Omission or `false` preserves the existing live-only contract. Invalid option objects or a nonboolean `includeDeleted` raise `ROW_VALUE` under `Rows.entries`.[^data]

`append(values: readonly T[]): readonly RowId[]` loads clean records, unlike `add` and `copy`, which create inserted records. It validates and clones the complete batch before allocating IDs or changing state. An invalid later value leaves the batch unapplied; successful append assigns new monotonic IDs, preserves all prior snapshots/order/edits/tombstones, and emits one frozen `append` event carrying those IDs. An empty array returns frozen empty IDs without invalidating caches or notifying. Appended values do not enter `changes()` until edited or removed.[^data]

Application getter side effects follow the same revision/disposal checks as `replace`; a stale outer append fails without undoing the application's inner write. Subscriber failures propagate after the batch commits and later live subscribers receive it. A caught subscriber error is not permission to append the same batch again. CVC/controller code owns requests, cancellation and the decision to append while its page remains active.[^data]

Removing an original row retains its original value with `delete` status, including through `get` and inclusive `entries`; unsaved edited values are not its deletion snapshot. `changes()` also uses the original delete value. Inserted-row removal remains physical. [Grid](grid.md) can explicitly show these retained records. The 1.x edited-deletion display difference remains a P0 obligation, not an approved omission.[^data]

## `add(value, before?)`, `move(id, before?)`, `copy(id, before?)`

A before target is a live RowId in the same store. Omit it to append or move to the end. Missing IDs raise `ROW_MISSING`; deleted sources/targets raise `ROW_DELETED`. Validate the source/target and clone all supplied JSON before mutation or ID allocation; preparation failure preserves the current order, snapshots and cached arrays. Getter side effects follow the existing revision/disposal guards and are not rolled back.[^data]

`move` preserves every row snapshot, value, status and dirty field. Moving before itself, before its current immediate stored successor, or the last stored row to the end is a silent no-op. Successful movement emits one `move` event and invalidates order-dependent arrays. Store order includes retained deleted originals; their positions are kept for later reversion. `revert(id?)` restores values/status and removes inserted rows while keeping the current order. Applications persist order through their own payload or fields, including an ordered array from `entries()`; movement adds no save-payload status.[^data]

`copy` deeply detaches the committed source JSON, creates a new ID with `insert` status and emits the existing `add` event. It does not copy local UI drafts or source dirty/deletion metadata. Nested snapshots are independent even when the values are equal. A throwing subscriber sees the committed insertion/move; catching its exception does not imply rollback.[^data]

## `setMany(updates)`

Accepts `readonly { readonly id: RowId; readonly values: Partial<T> }[]`. Every ID must belong to a nondeleted row, including an empty patch. Each `values` must be a plain JSON-compatible object. All patches are cloned and checked before any stored value changes; an invalid later patch or ID leaves the entire batch unapplied. Duplicate IDs merge in input order, with the last value for a field winning. A patch replaces top-level fields; it does not interpret dot paths or merge a nested object.[^data]

Only rows with a final effective change receive a new snapshot. IDs, store order and unchanged row snapshots stay intact. Returning original fields to their original JSON values clears their dirty state; inserted rows remain inserted. An empty batch or duplicate patches that cancel out preserve cached arrays and do not notify. One `setMany` event lists only changed IDs, uniquely and in their first input-occurrence order. Subscribers see all committed rows together. This operation does not add or remove rows.[^data]

Scalar equality uses `Object.is`, including distinct `0` and `-0`; nested arrays and objects compare structurally. If evaluating supplied values reenters and changes the store, the stale outer `set`, `setMany`, `add` or `replace` fails before its own write (`ROW_VALUE`, or the first target/disposal error encountered). The application's inner side effects remain; they are not rolled back.[^data]

# Events

`RowsEvent` has `type: "replace" | "append" | "add" | "move" | "set" | "setMany" | "remove" | "revert"` and `changed: boolean`. `replace` has no target; `add`, `move`, `set`, and `remove` carry their target `id`; `append` and `setMany` carry frozen `ids: readonly RowId[]` instead of `id`. Append lists all newly loaded IDs; setMany lists only effective updates. `revert(id)` carries that `id`, while `revert()` omits it. Actual value/order mutations have `changed: true`; only a clean `revert` has `changed: false`. Events are frozen and delivered synchronously. If a subscriber throws, later live subscribers still receive the same event, then the first thrown value is propagated to the caller. The data mutation has already happened and is not rolled back. Unsubscription and disposal still stop delivery to affected listeners.[^data]

# Pitfalls

`RowId` is neither a business key, an array index, nor a DOM `id`. Do not mutate a snapshot or infer its ID from sorted/filtered position. The store accepts nested JSON as an atomic top-level field; Form copies a nested object path before calling `Rows.set`, and Grid prepares copied top-level paths before calling `Rows.setMany` for paste. Form and Grid own their row-keyed drafts and rules; Rows does not parse or validate business rules. A throwing subscriber cannot block later live subscribers; its error propagates after delivery. Do not retry a throwing batch assuming its values were rolled back.[^data]

`copy` preserves application business keys. A keyed component such as Tree may reject a duplicate key from its subscription after the copy commits. When a workflow needs a new business key, construct the application-owned value first and call `add(value, before?)`; RowId allocation does not rewrite domain fields. Copying a record is not a subtree-copy operation.[^data]

Invalid values use `ROW_VALUE`; missing IDs use `ROW_MISSING`; editing a deleted row uses `ROW_DELETED`; a non-string runtime field uses `ROW_FIELD`. These are `FrameworkError` codes with the failing `Rows.*` API.[^data]

# Examples

```ts
import { createRows } from "@bbalganjjm/natural_js/data";

const rows = createRows([
  { name: "Ada", options: [{ label: "First", value: 1 }] }
]);
const id = rows.entries()[0].id;
rows.append([{ name: "Grace", options: [{ label: "First", value: 1 }] }]); // Clean loaded record.
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
