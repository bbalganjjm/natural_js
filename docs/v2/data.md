---
type: API Reference
title: Natural-JS 2.0 data types
description: Type-only row identity, immutable snapshot, change tracking, and subscription contracts.
tags: [data, rows, typescript]
status: draft
symbols: [RowId, Snapshot, RowStatus, RowSnapshot, RowChange, Rows]
sources:
  - id: data
    resource: ../../v2/src/data/index.ts
    title: Data type contracts
    git_blob: 96983e05d1deb1b8b60a93abbc10fd438e74cbbe
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:19:59Z }
---

The `./data` entry exports types only in M2. `createRows` and its runtime behavior are planned for M3 through M5.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `RowId` | `number` | Store-local row identity |
| `Snapshot<T>` | Deep readonly mapping for JSON data | Immutable view type |
| `RowStatus` | `clean`, `insert`, `update`, `delete` | Change state |
| `RowSnapshot<T>` | `id`, `value`, `status` | Identified row |
| `RowChange<T>` | `id`, changed `status`, `value` | Save change |
| `Rows<T>` | `replace`, `entries`, `get`, `add`, `set`, `remove`, `revert`, `changes`, `subscribe`, `dispose` | Future store interface |

# Pitfalls

`RowId` is not a business key, array index, or DOM `id`. `Snapshot<T>` is a compile-time contract in M2; runtime immutability is not available until the store is implemented.

# Related

[The M1 contract](../implementation/m1-contract.md) specifies nested JSON, row-local Select binding, and mutation rules. [Architecture](architecture.md) defines the data/UI boundary.

[^data]: Data type contracts
