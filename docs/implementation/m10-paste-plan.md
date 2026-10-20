---
type: Plan
title: Natural-JS 2.0 M10.7 atomic paste plan
description: Coherent row batches and validated clipboard paste on authored Grid fields.
tags: [plan, grid, clipboard, data]
status: draft
sources:
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid field, draft and view owner
    git_blob: f1194e961ddbd2881c365362b45731c694a01716
  - id: data
    resource: ../../src/data/index.ts
    title: Immutable row store
    git_blob: fd3a3668649af8c7c270be5f7250bd01759823e8
  - id: parity
    resource: feature-parity-plan.md
    title: Required feature completion
    git_blob: 5ba1d09c171ba5d80fe51d529f6110c686cc2300
  - id: evidence
    resource: evidence/m107-verification.json
    title: Frozen M10.7 source, commands, artifact and results
    git_blob: b8cd7bb9b7687ebfd895a57548f124936f54b91c
  - id: browser
    resource: ../../tests/browser/grid-paste.spec.ts
    title: Clipboard, draft, lifecycle and shared-store regressions
    git_blob: 7eec047c1dc16e875190bb257809c7530dc4440c
  - id: unit
    resource: ../../tests/rows.test.ts
    title: Atomic batches, identity and reentrant JSON boundaries
    git_blob: 26f54b607abec62d7e6eb04c6583f603fb47d12c
generated: { by: codex/gpt-6, at: 2026-10-18T10:42:16Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-18T10:42:16Z }
---

# Goal

Implement required G18 bulk paste with one coherent store change, retained CVC/authored HTML, nested raw values, accessible feedback and small predictable contracts. The user authorized this stage after M10.6. Existing selected/check/filter, column and draft behavior must remain intact.[^grid][^parity]

# Contract before implementation

- `Rows.setMany(updates)` accepts ordered `{ id, values: Partial<T> }` patches of top-level fields. Validate every target and JSON value before mutation, merge duplicate IDs in input order, retain IDs and untouched snapshots, and publish one frozen `setMany` event with unique actually changed `ids`. A net no-op does not notify. Listener errors propagate after the committed mutation and cannot trigger rollback.[^data]
- `grid.paste(text, { id, field })` returns the existing `ValidationResult`. Native `text/plain` paste is opt-in through `paste: true`; `onPaste(result)` reports completed API/native attempts. Earlier cancellation of the DOM paste event is respected. No asynchronous clipboard permission or transaction platform is introduced.
- Capture displayed row order after sort/filter/page, then flatten bound field positions in current visible column order and authored order within each cell. Display fields participate, preserving legacy non-input paste without injecting a visual editor. Native display-field targets receive safe focusability only when enabled; interactive descendants do not gain nested tab stops. Hidden fields are excluded; disabled, readonly and `aria-readonly` fields consume their source position but are not written. Check/action columns without bound fields are not clipboard positions.
- Parse quoted TSV, escaped double quotes, quoted tabs/newlines, CRLF and a final line terminator. Reject malformed text and row/field overflow explicitly. Ragged rows write only supplied cells. Do not create rows, silently truncate input or execute clipboard HTML.
- Reuse compiled safe paths, existing parsers, HTML constraints, format/validation rules and row-local Select choices. Checkbox text is exactly `true` or `false`. Select text matches raw scalar serialization (`null` is empty); unknown, disabled or ambiguous raw values fail rather than changing type. Display labels are not implicit converters.
- Stage pasted fields over existing drafts; parse against one entered row and validate against one complete parsed candidate. Unrelated valid drafts are considered for validation but are not committed. Commit only pasted top-level paths, retaining other nested values. Failure leaves stored values, input values, drafts, selection and focus intact; accessible error feedback may change. Existing error messages are retained when reporting rejection.
- Reject stale preparation if callbacks change the store, view, columns, drafts or dispose the Grid. Application callback side effects belong to the application and cannot be rolled back. Reentrant paste is rejected. One batch notification reconciles affected Form/Grid/List instances once; Tree retains its existing event-agnostic subscription.

# Change order and ownership

1. Add the minimal Rows batch, dirty-state/no-op tests, and affected-ID Form/List handling. Grid owns its own batch reconciliation.
2. Add the private TSV reader and checks, pure candidate/validation preparation, bounded mapping, typed controls, batch commit and delegated paste ownership/cleanup.
3. Add focused browser tests and extend the existing Grid demo and installed JS/TS/browser consumers. Business parsers/rules remain application code.
4. Update API bodies, examples, indexes, change log, coverage and active plans with source fingerprints. Independently review source and evidence before verified metadata.
5. Run build/types, units, full Chromium/Firefox/WebKit, identical-artifact JS/TS and five-browser consumers, existing binding budgets, clipboard load checks and OKF changed/full gates. Commit and push only `2.0.0-alpha.0`.

# Acceptance and exclusions

Verify coherent single notification, invalid-last-cell rollback, stable IDs/dirty state, complete cross-field validation, retained drafts, typed nested choices, protected and reordered/hidden fields, multiline/overflow, cancellation, stale callbacks/disposal, listener failure after commit, focus, repeated disposal and document-unique IDs. Exercise a large matrix and shared Form/List/Tree consumers.

M10.8 real virtualization, remaining Grid/component parity and P0 semantic/dynamic closure remain required. No behavior retirement is inferred. No generic state/clipboard utility package, implicit row factory, npm publication, release tag, master/v1 modification or actual macOS/iOS Safari test is included. All available Windows browser engines and installed Chrome/Edge are included.

# Verification

The stage is implemented within the contract above. Build, strict source types, browser-controller types and 92 unit tests pass. Final full Chromium, Firefox and WebKit suites pass 219/219 each, including 19 paste regressions and the new demo case. A 1,000-row/two-field paste verifies one batch event, stable IDs, focus and document-unique error references; its completion timeout is a functional guard, not a speed claim.[^evidence][^browser][^unit]

Installed JS/TS and all five Windows browser consumers pass the same unpublished 148-file artifact: SHA-256 c01c3c2ea819aee418154b69534f5eb053f315fca1471b4b7857299b11bb3e0d, 230,483 packed bytes and 1,136,381 unpacked bytes. Every archive member matches the frozen workspace. Five package entry points and zero runtime dependencies remain; the TSV reader is private. Command arguments, exit codes, raw logs, 24 source/fixture hashes and superseded attempts are retained in the evidence record.[^evidence]

Same-host 1,000-row flat initial/rebind/edit/sort/filter medians are 12.8/16.1/0.9/2.8/2.0ms; nested-auto initial/rebind/sort/filter are 38.9/48.5/9.0/5.7ms. All existing budgets pass with two warm-ups and five measured runs. These are existing binding fixtures, not universal bulk/viewport performance.[^evidence]

Independent review reproduced and verified four corrections: captured draft/error identity retains newer subscriber edits; recovery rendering permits nested postcommit removal; Select/Rows distinguish signed zero using Object.is; and JSON value evaluation cannot commit a stale outer write or resurrect removed rows. Tests cover the corrections. Initial Chromium development reload/module-fetch failures and Firefox's discarded synthetic ClipboardEvent data are retained, not counted as successful gates. A readonly event-data fixture corrects Firefox's test-construction difference without changing production behavior or assertions.[^browser][^unit][^evidence]

The only new public operations are Rows.setMany and Grid.paste, plus paste/onPaste binder options. Existing ValidationResult is reused, with no new public result/event type, transaction platform or dependency. Actual token telemetry and an equivalent fixed AI task were not rerun; no agent-speed or token-saving measurement is claimed.

Historical M10.6 evidence remains unchanged. Personal acceptance, manual assistive-technology checks and actual OS clipboard integration remain open. Real macOS/iOS Safari remains excluded.

# Next action

Prepare the M10.8 viewport contract and representative HTML/TS before code. Keep existing visible scopes as the logical sorted/filtered page and introduce a private mounted window; preserve checks/ranges/paste across offscreen rows without mounting the entire range. Specify variable-height measurement and anchor preservation, bounded focus/caret retention, native table row counts/indices and spacer exclusion, column resizing, future indivisible row groups, cleanup and 5,000-row budgets. The full next-stage acceptance remains in the parity plan; no M10.8 implementation is claimed.

[^grid]: ../../src/ui/grid.ts
[^data]: ../../src/data/index.ts
[^parity]: feature-parity-plan.md
[^evidence]: Frozen M10.7 source, commands, artifact and results
[^browser]: Clipboard, draft, lifecycle and shared-store regressions
[^unit]: Atomic batches, identity and reentrant JSON boundaries
