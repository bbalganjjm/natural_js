---
type: Plan
title: Natural-JS 2.0 M5.12 Form source ownership
description: Execute application normalization and full-source observation through existing Form and Rows owners.
tags: [meta, plan, binding, migration]
status: draft
sources:
  - id: previous
    resource: m5-grid-callbacks-plan.md
    title: Captured Grid callbacks and unresolved source observation
    git_blob: 7cf244a8f2cd15a7049957b65520ea6cde942abd
  - id: baseline
    resource: evidence/m511-verification.json
    title: Frozen M5.11 source, runtime and installed artifact baseline
    git_blob: 3e48d10b551bde9c9ab99b673557a428302fa3d2
  - id: form
    resource: ../../src/ui/form.ts
    title: Whole-row Form callbacks, compiled field reads and native commits
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
  - id: data
    resource: ../../src/data/index.ts
    title: Immutable full records, committed notifications and no-op writes
    git_blob: 38faf810b59fecebd9e0d0e7ee8a935b480bcecd
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Unbound-key loops, value setters and legacy mutation timing
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: example
    resource: ../../examples/vite/m10/demo.ts
    title: Existing full raw selected or inspected source snapshot
    git_blob: d95fa80d55726d03ee0f90097591b35a3f3d24a5
  - id: parity
    resource: feature-parity-plan.md
    title: All retained outcomes and consolidated omission obligations
    git_blob: 42d57606e683a6bb854e54480259b51530923ea6
generated: { by: codex/gpt-6, at: 2026-11-14T05:40:36Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T05:40:36Z }
---

# Goal

Verify the useful source-only Form outcomes with existing owners: normalize business values before loading Rows, inspect all own source keys in Form whole-row callbacks, and observe committed changes through Rows.subscribe. Keep UI value projection separate from source mutation. No demonstrated caller requires another observer option, nullable field context, dataset or registration engine.[^form][^data][^legacy][^example]

# Checkpoint

- M5.12 starts at pushed 0c523cda08ca21f3c0e642666507f29b5ad3a9ea with a clean worktree; independent recorded-byte M5.11 recovery and pre-implementation recipe/config reviews pass.[^baseline]
- Nine new focused/actual CVC witnesses and exact installed consumers execute application normalization and full-source observation using existing owners. Framework source/public contracts stay unchanged. [Source ownership](../v2/form-source.md) owns the executed recipe and timing boundaries.[^form][^data][^example]
- Standard failure-only tracing keeps DOM/network evidence without screenshots/sources. A controlled request validates actual capture; fresh canonical gates and independent source/raw/final document reviews accept only selected outcomes.[^parity]

# Steps

1. Independently review this bounded contract before implementation. Inventory Form whole hooks, Rows notifications, the actual M10 raw snapshot caller, installed consumers and existing callback tests. Keep every broader parity obligation open.
2. Execute an application receive recipe that explicitly normalizes named numeric/boolean/nested business fields before createRows, replace or append. Keep incoming data unchanged, complete raw records and received originals independent from field presentation. Use explicit application writes for later normalization, not a display callback return or a framework serializer.
3. Execute Object.entries(row.value) in beforeBind/onBind to observe every own top-level source key and intact nested JSON, including keys without HTML fields. Whole callbacks surround the whole Form pass; they are not interleaved per source key and focused projection may defer. Form.read returns compiled fields only; Rows.get supplies the full record.
4. Execute page-owned Rows subscriptions for bound and unbound committed updates, native input, coherent setMany, reversion, independent shared Forms and cleanup. Subscriptions observe committed data, not setter attempts, changed-key/old-value metadata or completed DOM. Equal writes remain quiet; subscriber failures retain committed data and do not prevent later listeners. Preserve existing selected-refresh, validation, source-change and disposal boundaries.
5. Add focused browser and exact installed JS/TS/browser witnesses using those ordinary owners. Verify the actual reduced CVC detail and existing raw snapshot panel without adding synthetic application controls, helper libraries or framework callbacks. Reuse current examples rather than create another rendering path.
6. Preserve the unresolved module-import failure as an infrastructure issue. Configure standard Playwright failure-only tracing with screenshots/sources disabled. Keep DOM snapshots: the installed Playwright starts its network recorder only with that setting. A controlled diagnostic must prove actual network/error capture with no retry, skip, tolerance or timeout change. This captures future evidence; it does not establish or fix the earlier cause.
7. Keep src, public entries/types and runtime dependencies unchanged. Freeze runtime inputs, then run strict build/source/example types, units, complete Chromium/Firefox/WebKit, one actual tar in isolated JS/TS and five available Windows browsers, original nine binding/twenty-one viewport budgets and changed/full OKF checks. Compare every emitted/runtime archive member with the M5.11 artifact; preserve all attempts and exact logs/maps/identities.
8. Write a short executed source-ownership guide and update Form, migration, actual demo guidance, parity and active planning together. Independently review connected recipes/callers/tests, raw archives/logs/metrics and final semantic bodies. Apply verified metadata only after separate review, preserve historical bodies/dates during fingerprint refresh, then commit and normally push to 2.0.0-alpha.0.

# Next action

Plan M5.13 for authored, data-driven native radio and checkbox choice groups (U10). Establish item-template HTML, raw selection, accessible labels and instance-scoped group names, Form reconciliation and cleanup against the real legacy caller before implementing a minimal shared owner. Keep exact legacy per-key timing, configuration/declaration and legacy receiver/initial-selection equivalence, wider dynamic owners, List editing, Tree validation, unvalidated paste, data/schema equivalence, other UI/CVC/P0 and M13 required. No omission or full-family closure is approved.

# Decisions

- Continued-work approval covers this bounded stage. No framework API, source observer, callback type, runtime module, convenience utility or dependency is added.
- Rows owns complete raw JSON and received originals. Form owns marked HTML fields, native input, projection, validation and its lifetime. Applications own wire conversion and full-source observations.
- Recipes do not reproduce literal v1 key-by-key interleaving, equal-write callback invocation, inherited enumerable keys, before-set old-value timing or silent after-notification mutation. Retain these defect-sensitive obligations for explicit parity disposition; no omission or full-family closure is approved.[^parity]
- Preserve CVC, authored HTML/CSS, unique IDs, accessibility and the unchanged no-hook binding path. Root 2.0 remains Apache-2.0; master/LGPL v1, immutable evidence, protected fixtures and the ignored legacy lock remain unchanged.
- Serialize browser/performance execution. Chromium, Firefox, WebKit and installed Chrome/Edge are required. Actual macOS/iOS Safari is excluded; npm publication and release tags remain deferred.
- No model calls, response evaluation or actual token-saving claim. Context-size figures, if recorded, are labeled proxies.

# Verification log

Fresh checks pass on 194 frozen inputs, 138 units and 810 full cases per engine, with nine new browser cases and no new units. All sixteen latest groups cover strict build/source/example types, one actual 193-file tar in isolated JS/TS and all five Windows browsers, complete Chromium/Firefox/WebKit and the original thirty performance budgets/sixty recomputed medians. The actual archive and all payloads are byte-identical to M5.11; no framework source, public API or runtime dependency changed. Chromium's twelve fresh-process shards cover each identity once without retries/skips; Firefox/WebKit are unsharded. [The receipt](evidence/m512-verification.json) preserves actual attempts and raw identities. The first controlled probe stopped before collection because Node rejects TypeScript stripping inside node_modules; only its ignored fixture extensions changed to JavaScript. A later deliberately aborted module request produced the expected single failing child and actual retained network/error evidence, with no screenshots/source capture. That diagnostic self-check passed but earns no framework/full-suite coverage and establishes no earlier failure cause. Independent connected source/caller, raw/archive/metric and final semantic reviews pass. Changed/full OKF checks have zero errors/warnings; historical bodies/dates remain. No family/P0/M13 closure, omission, publication or tag.

# Open questions

Exact legacy per-key timing, broader source/default/declaration/receiver/initial-selection equivalence, wider dynamic owners, List editing, Tree validation, unvalidated paste, data/schema equivalence, other UI/CVC/P0 and mandatory M13 remain required. The earlier module-fetch cause, manual assistive technology, personal acceptance and fixed-agent/token comparison remain unverified.[^parity]

[^previous]: Captured Grid callbacks and unresolved source observation
[^baseline]: Frozen M5.11 source, runtime and installed artifact baseline
[^form]: Whole-row Form callbacks, compiled field reads and native commits
[^data]: Immutable full records, committed notifications and no-op writes
[^legacy]: Unbound-key loops, value setters and legacy mutation timing
[^example]: Existing full raw selected or inspected source snapshot
[^parity]: All retained outcomes and consolidated omission obligations
