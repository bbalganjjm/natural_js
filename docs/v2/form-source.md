---
type: Guide
title: Form source ownership and observation
description: Normalize application records and observe complete raw Rows without adding field callbacks for absent HTML.
tags: [ui, form, data, migration]
status: draft
sources:
  - id: form
    resource: ../../src/ui/form.ts
    title: Whole Form binding, marked reads and native commit boundaries
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
  - id: data
    resource: ../../src/data/index.ts
    title: Complete immutable source records and committed notifications
    git_blob: 38faf810b59fecebd9e0d0e7ee8a935b480bcecd
  - id: browser
    resource: ../../tests/browser/form-source.spec.ts
    title: Executed normalization, whole-source observation and cleanup recipes
    git_blob: 0e8312b36bc6ec7c537b7dd4ca2d4a78e525881b
  - id: installed
    resource: ../../tests/consumers/browser/main.js
    title: Installed source normalization and observation fixture
    git_blob: 94bce2522dbbbaa86e9e3395cb8d955d73da38f8
  - id: demo-browser
    resource: ../../tests/browser/m512-source-demo.spec.ts
    title: Actual reduced CVC detail and full source panel regression
    git_blob: 9ee6c87435de942cad1f6c7d5ca3df9db02daed7
  - id: installed-check
    resource: ../../tools/check-packed-browser.mjs
    title: Exact-package source, original, notification and cleanup assertions
    git_blob: 7e08a783489cb1932541cfa628fed065e92e24a4
  - id: example
    resource: ../../examples/vite/m10/demo.ts
    title: Actual selected or inspected full raw snapshot panel
    git_blob: d95fa80d55726d03ee0f90097591b35a3f3d24a5
  - id: detail
    resource: ../../examples/vite/m10/detail.ts
    title: Shared CVC detail identity and owned Rows subscription
    git_blob: 913acc81719d1f39fbcdf128707dc59337c88cfa
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Historical missing-element value callbacks and mutation timing
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
generated: { by: codex/gpt-6, at: 2026-11-14T05:40:36Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T05:40:36Z }
---

Use Rows for the complete received record, Form for marked HTML fields, and application functions for wire conversion and source observation. These recipes use existing owners; they add no framework observer, dataset or utility library.[^form][^data]

# Goal

Keep hidden business fields and nested JSON available without pretending they have DOM elements. Distinguish a full raw record from a Form read and a data notification from completed DOM rendering.[^form][^data][^browser]

# Prerequisites

Use an authored Form and caller-owned Rows. Validate untrusted response shape and business values in the application receive boundary. The following conversion uses already shaped, known fixture data; Number and an explicit string comparison are domain choices, not a general wire parser or validation policy.[^installed][^installed-check]

# Steps

## Normalize before loading Rows

The installed example converts named hidden numeric/boolean values and nested list counts with ordinary map/spread operations. It leaves the received object unchanged. Apply the same application conversion before replace/append, or before an explicit later business write; do not return a display replacement expecting Rows to store it.[^installed][^browser]

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindForm } from "@bbalganjjm/natural_js/ui";

const received = [{ name: "Ada", hidden: {
  amount: "12.5", enabled: "true", details: [{ count: "2" }]
} }];
const rows = createRows(received.map(row => ({ ...row, hidden: {
  ...row.hidden,
  amount: Number(row.hidden.amount),
  enabled: row.hidden.enabled === "true",
  details: row.hidden.details.map(detail => ({ ...detail, count: Number(detail.count) }))
} })));
```

Rows receives the normalized raw values as its clean originals. Formatting and value projections can change display without changing those originals or save data. Business status/wire serialization remains separately application-owned.[^data][^form][^browser]

## Observe the whole source and committed changes

Both whole Form callbacks receive the same immutable full row. Object.entries(row.value) enumerates its own top-level keys; an object or array value remains intact nested JSON, not a recursive stream of field paths. Keys with no matching data-field remain present. Form.read intentionally returns compiled marked paths only.[^form][^browser]

Inside a CVC controller, use its own cleanup registration and application-authored formRoot, keys output and source pre element:

```ts
const id = rows.entries()[0].id;
const form = bindForm(formRoot, {
  rows,
  beforeBind({ row }) { keys.textContent = Object.keys(row.value).join(", "); },
  onBind({ row }) { source.textContent = JSON.stringify(row.value, null, 2); }
});
const stop = rows.subscribe(() => {
  const row = rows.get(id);
  source.textContent = JSON.stringify(row?.value ?? null, null, 2);
});
own(() => { stop(); form.dispose(); });
form.bind(id);
```

Here formRoot is the authored Form, keys an application output and source an application pre element. textContent keeps raw strings literal. A CVC owner registers stop and form.dispose with its page cleanup. Form.dispose does not remove an independent application subscription or dispose shared Rows. Keep the selected RowId in application state when selection changes; replacement/removal can invalidate it.[^form][^data][^detail]

The actual Grid demo already follows this pattern: its selected/inspected snapshot panel reads the complete Rows.get result and original, while its Rows subscription refreshes the panel. Reduced CVC details omit phone/email/assignment/notes fields without removing them from Rows; native edits still reach the same complete source.[^example][^detail][^demo-browser]

## Keep observation boundaries explicit

| Operation | Whole Form callbacks | Application Rows subscription |
|---|---|---|
| Constructor | No whole-row callbacks | No initial event |
| bind(id), full refresh | Before the whole pass, then after its field/error work | No event from observation alone |
| Revert current live row | Existing whole binding with the revert event | Revert event; changed may be false |
| Selected refresh, read, validation without a commit | No invented whole pass | No data event |
| Real bound/unbound set or native input commit | Existing field projection, no whole-hook replay | Committed data event |
| setMany | No whole-hook replay | One coherent committed batch when values change |
| Equal set/setMany | No extra callback pass | No event |

The after whole callback is not a guarantee that focused editable text has replaced its entered raw value; existing focus deferral still applies. Rows subscriptions run after storage commits, including during native input handling. They do not promise completed Form/Grid DOM, attempted writes, changed-key lists or previous-value metadata. A failed earlier subscriber does not suppress later subscribers; committed values remain and the source operation reports its error. Do not use a subscription exception as a rollback or validation veto.[^form][^data][^browser]

# Verify

Focused browser witnesses cover full own/nested data, marked reads, before-all/after-all timing, full/selected refresh and reversion, hidden changes, native focus deferral, coherent batches, equal writes, independent Forms, normalized create/replace/append, failures and cleanup. The actual reduced CVC screen and exact installed package exercise source preservation and the same ordinary recipes. No new framework API or runtime behavior is inferred from these acceptance tests.[^browser][^demo-browser][^installed-check]

# Pitfalls

- Boolean("false") is true; use the application's actual wire mapping. Do not infer a universal boolean/number/date conversion policy from this fixture.
- A value callback has a real marked element. Do not create a dummy element or make ValueBindContext nullable to observe hidden keys.
- Whole callbacks bracket the whole Form pass. They do not interleave before/write/after for every raw key. Application callback subcalls are not separate framework lifecycle checkpoints.
- Legacy setters also exposed old values, invoked hooks on equal writes and could silently mutate after notification. These recipes do not reproduce those timings, inherited-key iteration or hidden writeback. Their defect-sensitive parity disposition remains unresolved; no capability omission or full-family closure is approved.[^legacy][^form][^data]

# Next

See [Form](form.md) for native/value projection, [Rows](data.md) for originals/events and [migration](migration.md) for preserved and unresolved 1.x workflows.

[^form]: Whole Form binding, marked reads and native commit boundaries
[^data]: Complete immutable source records and committed notifications
[^browser]: Executed normalization, whole-source observation and cleanup recipes
[^installed]: Installed source normalization and observation fixture
[^demo-browser]: Actual reduced CVC detail and full source panel regression
[^installed-check]: Exact-package source, original, notification and cleanup assertions
[^example]: Actual selected or inspected full raw snapshot panel
[^detail]: Shared CVC detail identity and owned Rows subscription
[^legacy]: Historical missing-element value callbacks and mutation timing
