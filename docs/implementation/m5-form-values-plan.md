---
type: Plan
title: Natural-JS 2.0 M5.4 Form value callbacks
description: Apply scoped Form value projections and observations without implicit Rows mutation or repeated validation callbacks.
tags: [meta, plan, form, binding, migration]
status: draft
sources:
  - id: previous
    resource: m5-form-options-plan.md
    title: Completed typed-choice continuation
    git_blob: b5a2fbbb976a4dde6c53ada735adf5b0b261633c
  - id: baseline
    resource: evidence/m53-verification.json
    title: Preserved d923434 runtime and code baseline
    git_blob: d83d915c354e867c1e7135db46939be98eca2353
  - id: form
    resource: ../../src/ui/form.ts
    title: Compiled fields, render generations, candidates, drafts and subscriptions
    git_blob: 7b5d6f99b96cf413f277169eafbba722f7e350d1
  - id: ui
    resource: ../../src/ui/index.ts
    title: Existing RuleContext and public Form contract
    git_blob: 30196434ef6930be3b021b0879f87e5287b5d932
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Native shape, display and raw constraint operations
    git_blob: 0a94918ba94c3f153c8de51e1b7036c2ab868363
  - id: render
    resource: ../../src/ui/field-render.ts
    title: Existing explicit display ownership and errors
    git_blob: 676d0e69a7cfc6eafab93b3abf5cd32c1a5a4a6c
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Legacy bind/val value callbacks and global wrappers
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: example
    resource: ../../v1/docs/examples/edit-form-data.md
    title: Historical numeric/boolean conversion workaround
    git_blob: 5afd3868f4f111944481930bb47090a2c2ab6ec0
  - id: workflow
    resource: ../governance/repository-workflow.md
    title: Current scoped evidence and documentation contract
    git_blob: a42962520d3f0c575a58fbeee3afb68ea9fc65f9
generated: { by: codex/gpt-6, at: 2026-10-31T10:01:54Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-31T10:01:54Z }
---

# Goal

Add the smallest explicit before/after value-binding contract to Rows-backed Form. Preserve real false/null/zero/empty-string replacements and native DOM observation, while keeping received originals, source values, dirty markers and save payloads under Rows ownership. Reuse Form's compiled fields, source/generation guards and native/formatter/render paths. Add no inverse-value engine, registration system, shared module or dependency.[^form][^ui][^native][^render]

# Checkpoint

Code and runtime evidence match pushed d923434ea9776e3978596e53a8da21c3daf6a642: 181 inputs, 138 units, 605 cases per engine, exact 183-file package and original performance budgets. Chromium's independently checked three-shard union is complete and once-only; Firefox/WebKit are unsharded. Historical runtime is not rerun or recertified.[^baseline]

The worktree initially contains ten preexisting documentation changes, including the updated governance contract. Preserve those changes and their provenance; a raw backup and patch are in node_modules/.cache/m54-preexisting-docs.json and m54-preexisting-docs.patch. Do not treat those changes as M5.4 implementation or rewrite governance. No response-generation/model evaluation is requested.[^workflow]

# Steps

1. Add one public FormValueContext extending RuleContext with readonly phase: "bind" | "val", nonnull RowId and the primary bound HTMLElement. Add optional beforeBindValue(value, context) and onBindValue(value, context), both synchronous unknown-returning functions. Call them directly without changing this. Validate option types and the Rows requirement before ownership or ARIA changes. Local Forms remain unchanged and reject these new callback options; their DOM-only source contract is a separate follow-up.
2. For one actual field-value cycle, call beforeBindValue with source raw, apply its effective projected raw through the existing native/formatter/render writer, then call onBindValue with that projected RAW while its element shows the written view. Undefined keeps the current projected raw; false, null, 0 and empty string are real replacements. A changed after replacement is checked and applied once without invoking either hook again. Formatter/render functions may therefore run twice only when an after replacement changes the projected input.
3. Explicit replacements must satisfy the target's native value shape: finite scalar/string/boolean/null, or scalar arrays for an array control. Marked Selects require exact raw option occurrences; unmarked controls retain native string coercion. Reuse existing native sanitization and occurrence owners. Reject async/thenable, function, symbol, bigint, DOM and structured-object replacements with FORM_VALUE; use existing render for structured/DOM display. Undefined preserves an unchanged structured or unavailable source under existing behavior. Copy/freeze scalar-array replacements before caching. Every explicit replacement is checked even with autoValidate:false. Recheck a cached explicit projection against current typed choices on repaint without replaying hooks; if its option disappeared, raise FORM_VALUE and refresh through explicit bind.
4. Returns affect presentation only. Form.read, Rows values/originals/status/changes and committed-field flags retain actual source raw. Validators, parsers and offscreen checks use raw/candidate values. When hooks exist, populate a detached raw native probe instead of validating projected DOM; copy custom validity only for the currently bound row. A raw false projected true cannot satisfy required, and a projected longer string cannot hide raw minlength failure.
5. Cache only the new projection per compiled field, RowId and sameJson source value; do not disable existing formatter/render whole-row reactivity. Explicit bind forces a bind cycle even at equal raw. Revert/reset uses bind when a field raw actually changes; an unchanged reset restores an applied cache without replay, or preserves an unapplied focused pending cycle until blur. A committed Rows update or successful draft commit uses val and the NEW raw. Read, draft checks, no-op validation, move/append, unrelated rows/sibling values and focus-only repaint do not replay hooks. Explicit bind is the refresh operation for a projection depending on another field.
6. Keep entered drafts separate. Both explicit binding and subscription work defer callback pairs for a focused editable text-like field until blur. A new explicit binding shows its new raw immediately, then marks its projection unapplied. Retain pending phase on unrelated renders; only a real row/raw change or explicit bind/reset replaces it. On focus show source raw without hooks. On blur apply the latest deferred cycle once, or restore the cached projection without hooks when raw is unchanged. Readonly text fields remain display-only: focus neither reveals raw nor defers their callbacks. An invalid draft remains visible and deferred. Do not mark unapplied work as complete.
7. Rows bind(null) and removed/replaced current rows clear projection state and apply the existing empty view without callbacks. Disposal clears pending state and follows existing cleanup: retain ordinary field values/text, restore explicit renderer-owned children and prevent late repaint. Invalid drafts, restored original values and pending states keep their existing ownership and no implicit normalization. Do not add a local raw store, a new Form setter, global defaults or wider row lifecycle hooks in this slice.
8. Guard generation, bound ID, disposal and source after BEFORE, after the writer, after AFTER and before a final write/cache. After a user formatter/renderer callback, also check freshness before committing its result to DOM. Track active Field/RowId value-cycle pairs: A-to-B rebind may complete B and suppress stale A, while A-to-A or A-to-B-to-A fails FORM_VALUE instead of recursing. Ordinary cached/null/no-callback renderer recursion retains UI_RENDER. Wrap callback errors with field, row, phase, callback name and cause. Do not promise a whole-Form transaction: earlier DOM writes, committed Rows updates and application side effects are not rolled back. Before/after failures publish no later stale work. A matching failed cycle stays quiet through unrelated repaint; retry only through explicit bind or a real row/raw change.
9. Document the exact migration boundary. v1 iterated unbound row keys and changed its dataset before/after DOM; its setter-before used old data and setter-after could leave unnotified data/DOM differences. Modern source normalization belongs in receive/decode/parse or an explicit Rows write. Supply application examples for those cases and explicit callback composition. Native boolean/numeric controls remove the old string-conversion workaround. Global/local wrappers, unbound-key processing and full family closure remain separately required; do not claim hidden dataset mutation parity.
10. Exercise the contract in the current CVC detail example and isolated installed JS/TS/browser consumers. Add focused cases for callback order/returns/context, formatter/render reactivity, typed/group/unmarked values, raw constraints, source/draft ownership, cache/focus/pending reasons, callback errors/async/reentry/disposal, different HTML/MDI and migration normalization. Independently review code/docs. Run strict source/build/example types, meaningful units, all Chromium/Firefox/WebKit cases, identical-package JS/TS plus five Windows browsers, unchanged binding/viewport budgets and changed/full OKF checks.

# Contract

~~~ts
const form = bindForm(root, {
  rows,
  beforeBindValue(value, context) {
    if (context.field === "displayName") return String(value ?? "").toUpperCase();
  },
  onBindValue(value, context) {
    if (context.field === "displayName") console.log(context.phase, context.rowId, context.element.textContent);
  }
});
form.bind(rows.entries()[0].id);
// Display projection does not change the stored displayName or save payload.
~~~

Use an authored display span for this example. A decorated text input shows actual raw while editing. Nontext projection is presentation, not inverse mapping: normalize business boolean/code values explicitly before loading or through an intentional data operation. The primary element represents a grouped field; no jQuery collection or implicit global callback composition is introduced.[^form][^native][^legacy][^example]

# Next action

The selected Rows-backed contract is implemented and independently reviewed. Next plan local callback/source semantics and wider Form raw rendering; keep shared global/row lifecycles, List editing, Tree validation, remaining UI/CVC/data/P0 and mandatory M13 open.

# Decisions

- The continued-work request authorizes the selected stage; no family closure, retirement or feature omission is inferred.
- Keep callbacks at the actual Rows-backed display owner. Do not run raw normalization from every render or reuse validate/parse loops as observable binding events.
- Preserve the ten initial document changes. Keep semantic edits scoped and historical generated/verified dates unchanged unless separately reviewed.
- Root 2.0 remains Apache-2.0; preserve master, LGPL v1, original fixtures and ignored legacy lockfile. Work and authorized pushes stay on 2.0.0-alpha.0.
- Chromium full coverage uses checked built-in shards when needed for the recorded Windows buffer limit; no skips or retries. Firefox/WebKit remain required, alongside installed Chrome/Edge. Actual macOS/iOS Safari is excluded.
- npm publication/tags remain deferred. Original browser performance checks are required; no model-response generation/evaluation or token-saving claim is added.

# Verification log

Read-only baseline recovery and direct legacy/current owner audits passed. Fresh checks cover 182 frozen inputs, 138 units, 630 full cases per engine, 25 new DOM cases, one exact 183-file package in JS/TS and all five Windows browsers, unchanged 30 performance budgets and 60 recomputed raw medians. Sixteen canonical groups expand to 18 execution-stage commands plus 4 Chromium collections. Chromium is a checked three-shard union without retries/skips; Firefox/WebKit run unsharded. [The receipt](evidence/m54-verification.json) retains every captured attempt, exact raw hashes, immutable parents, initial-doc provenance and scope limits. Independent source/document/raw-log/archive/measurement review passes; changed/full OKF checks have zero errors/warnings. npm publication/tags remain deferred.

# Open questions

Manual assistive technology and actual final agent-task/token measurements remain unverified. Complete required legacy/dynamic owners and M13 before personal acceptance or separately requested publication.

[^previous]: Completed typed-choice continuation
[^baseline]: Preserved d923434 runtime and code baseline
[^form]: Compiled fields, render generations, candidates, drafts and subscriptions
[^ui]: Existing RuleContext and public Form contract
[^native]: Native shape, display and raw constraint operations
[^render]: Existing explicit display ownership and errors
[^legacy]: Legacy bind/val value callbacks and global wrappers
[^example]: Historical numeric/boolean conversion workaround
[^workflow]: Current scoped evidence and documentation contract
