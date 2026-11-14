---
type: Plan
title: Natural-JS 2.0 M3.1 communication phases
description: Capture existing communication hooks and execute ordered application preparation, transformation and terminal cleanup without a middleware engine.
tags: [meta, plan, communication, cvc]
status: draft
sources:
  - id: runtime
    resource: ../../src/comm/index.ts
    title: Existing native Request, Response and cancellation owner
    git_blob: 4b05ebaa4121885a96f53e8a3b32dd38e1498704
  - id: legacy
    resource: ../../v1/src/natural.architecture.js
    title: Request filters, transformations, stopping and completion
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
  - id: example
    resource: ../../examples/vite/m4/employees.ts
    title: Actual two-layout CVC search and save caller
    git_blob: dfdf60b97c10a347ff46177c1abf34f9eb5d7fb7
  - id: baseline
    resource: evidence/m514-verification.json
    title: Accepted frozen source, archive and browser baseline
    git_blob: 8a247271a21c8774360f2f5547db4be3ff44cce5
  - id: registry
    resource: evidence/remaining-work-plan.json
    title: M3.1 scope and downstream owners
    git_blob: a18ff58091c2eb8d8050ba8222d6b3285a078a11
  - id: omissions
    resource: omission-decision.md
    title: Existing pending five-item decision
    git_blob: 3586346b948dbbd2cf38292a89bb71d09aa7f582
generated: { by: codex/gpt-6, at: 2026-11-14T15:07:04Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T15:07:04Z }
---

# Goal

Complete the useful communication phases through existing native objects and plain application functions. Capture supplied prepare/after callbacks once, validate them and invoke them without an implicit receiver. Retain existing Request/Response replacement, decoding, phase errors and prompt cancellation. Add no middleware registry, lifecycle API, dependency or generic option transformer.[^runtime][^legacy]

# Checkpoint

M3.1 began from accepted pushed M5.14 at 6bc3c04 on 2.0.0-alpha.0. Captured/plain hooks, early callback validation and actual application request ownership are implemented and independently reviewed. Two authored CVC layouts and installed consumers execute the selected phases. All forty emitted declarations remain byte-identical. The existing five-item omission decision is separate and pending.[^baseline][^runtime][^example][^registry][^omissions]

# Steps

1. Recover the clean accepted baseline. Read every communicator caller, current phase/cancellation tests, the M4 controller, installed JS/TS and packed-browser fixtures.
2. Capture prepare/after at communicator creation. Reject a supplied nonfunction with REQUEST_OPTIONS at createCommunicator. Capture/validate decode per request, before preparation or transport, while preserving an already-aborted signal's priority. Keep return-object validation in its existing REQUEST_PREPARE/REQUEST_AFTER phase. Deliberate live policy uses an application forwarding function; do not reread callback properties.
3. Execute a typed application request recipe: normalize and validate business input before request construction; compose Request/Response hooks explicitly; transform decoded output or recover a chosen failure in ordinary try/catch; finish each invocation once in finally. Throwing or aborting stops later phases. A genuine application completion callback has an explicit primary-error policy; ordinary native attribute restoration needs no speculative failure engine.
4. Use a page-local counter around actual M4 search/save requests. Capture authored aria-busy on the first pending request and restore it after the last. Join page and caller cancellation with AbortSignal.any. Page-owned cleanup restores captured state even if aborted requests have already settled; late requests do not write into an aborted page. Do not key ownership by URL or introduce IDs/another store.
5. Verify capture/getter/receiver and invalid-hook boundaries; pre-initialization stop, ordered transforms, HTTP/network/decode/prepare failure, explicit recovery, cancellation during pending hooks and exactly-once terminal cleanup. Check same-URL concurrency within/across scopes. Exercise real M4 busy/replacement/disposal in both authored layouts and real installed JS/TS/five-browser consumers.
6. Freeze this stage, run strict build/source/example types, units, complete Chromium/Firefox/WebKit, one actual package in isolated JS/TS and Chromium/Firefox/WebKit/Chrome/Edge, and the unchanged 9+21 performance budgets. Retain all attempts and complete case identities; serialize engines and performance. Two workers within one engine may reduce elapsed time without changing cases, retries or budgets.
7. Update the implemented draft communication/example/migration contracts, indexes/log/current queue and exact evidence in the same stage. Independently review source/callers, raw evidence and final semantic bodies; apply verified metadata only after review. Changed/full docs must have zero errors/warnings before the separate commit/push.

The application contract uses existing types:

```ts
async function search(query: string): Promise<Employee[]> {
  begin();
  try {
    const input = query.trim();
    if (!input) throw new Error("Enter a query.");
    return await comm.request<Employee[]>({ url, json: { query: input }, method: "POST", signal });
  } finally {
    end();
  }
}
```

# Next action

Continue with M3.2's separate protocol/custom-sender contract and actual native HTTP/XHR evidence. Retain pending omission boundaries and every remaining M5/ancestor obligation; this selected completion closes no whole family.[^registry][^omissions]

# Decisions

- Existing prepare/after and RequestOptions/Communicator supply the required composition. Native promises and explicit functions own application success, recovery and completion; no new public notification hooks are justified yet.
- Capture and plain invocation follow the existing Form/Grid/value callback policy. Application closures provide deliberate live services; M3.5 owns broader configuration policy.
- Terminal bookkeeping does not await an unbounded completion promise. Existing perform cancellation stays the request executor's owner.
- Protocol options, common HTML loading, page metadata/advice/declarations and shell aggregation remain separately owned by M3.2-M3.7/M12.4. This stage does not close those outcomes or whole families.
- Preserve CVC, authored HTML/CSS, accessibility, original budgets, v1/master/licenses and immutable evidence. No npm publication or tag.

# Verification log

Fresh verification passes on 203 inputs, 150 units and 857 full cases per engine, with twelve added units and four actual CVC cases. All 853 parent identities remain. The sixteen canonical groups include strict types, one actual 203-file tar in JS/TS and five Windows browsers, and thirty original budgets/sixty recomputed medians. All full engines use two workers, exact JSON collection/execution unions and no retries/skips; focus passes 25 each. [Final acceptance](evidence/m31-verification.json) retains immutable runtime evidence and independent source/raw/document reviews. The initial 149-pass/one-timeout unit attempt remains: only fixture correlation changed, with no framework red/green claim. Changed/full docs have zero errors/warnings; historical bodies/dates, evidence and fixtures remain. No omission, whole-family closure, publication or tag.[^baseline]

# Open questions

Await the existing O01-O05 decision without asking again. Unanswered or rejected outcomes remain required in their owners. M3.1 can proceed independently; it supplies no transport omission approval or whole-family acceptance.[^omissions]

[^runtime]: Existing native Request, Response and cancellation owner
[^legacy]: Request filters, transformations, stopping and completion
[^example]: Actual two-layout CVC search and save caller
[^baseline]: Accepted frozen source, archive and browser baseline
[^registry]: M3.1 scope and downstream owners
[^omissions]: Existing pending five-item decision
