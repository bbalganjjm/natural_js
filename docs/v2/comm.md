---
type: API Reference
title: Natural-JS 2.0 communication types
description: Type-only request and response contracts for the future CVC communicator.
tags: [architecture, communication, typescript]
status: draft
symbols: [RequestOptions, Communicator]
sources:
  - id: comm
    resource: ../../v2/src/comm/index.ts
    title: Communication type contracts
    git_blob: bf04ba759196dac52cbbf89f80f2b9c78abe3ddc
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:19:59Z }
---

The `./comm` entry exports types only in M2. `createCommunicator` and network behavior are planned for M3.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `RequestOptions<Result>` | `url`, optional `method`, `json`, `body`, `signal`, `decode` | Request declaration |
| `Communicator` | `request<Result>(options)` | `Promise<Result>` |

# Pitfalls

`json` and `body` are alternatives in the proposed runtime contract. A type-only `Communicator` does not send requests; M3 will implement encoding, hooks, errors, and abort behavior.

# Related

[The M1 contract](../implementation/m1-contract.md) defines server conversion and response failure rules. [Architecture](architecture.md) shows the communicator's ownership.

[^comm]: Communication type contracts
