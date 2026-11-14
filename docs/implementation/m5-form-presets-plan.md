---
type: Plan
title: Natural-JS 2.0 M5.9 typed Form presets and callback composition
description: Reuse typed Form options and compose application callbacks without changing binding ownership.
tags: [meta, plan, form, configuration, migration]
status: draft
sources:
  - id: previous
    resource: m5-form-discovery-plan.md
    title: Completed explicit field discovery and lifetime scope
    git_blob: be80e819832830b8685191be2ae9b3c7221b8a8e
  - id: baseline
    resource: evidence/m58-verification.json
    title: Frozen 3f5e3ad source, runtime and installed package baseline
    git_blob: f12a744bd9459137d3c19c599fbf77676295b162
  - id: form
    resource: ../../src/ui/form.ts
    title: Constructor option capture and guarded callback execution
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public Form callback, rule and handle contracts
    git_blob: 0d3a883198da64468b0a6f967fb49c5423ffbdc4
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Captured catalogs and per-kind field declarations
    git_blob: a143951476286c0b66584ae57ea47932280d2ba2
  - id: example
    resource: ../../examples/vite/m4/employees.ts
    title: Independent CVC employee Forms and application rules
    git_blob: dfdf60b97c10a347ff46177c1abf34f9eb5d7fb7
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Form option precedence and local/global wrapper behavior
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: config
    resource: ../../v1/dist/natural.config.js
    title: Preserved application configuration and shipped empty Form defaults
    git_blob: 97217df2cf95b5f51f3a6f5dc0948a67afc6e9b8
  - id: parity
    resource: feature-parity-plan.md
    title: Complete retained feature obligations and consolidated omission review
    git_blob: 4dc432ebdc8eea1846745520efede712523494cf
generated: { by: codex/gpt-6, at: 2026-11-07T13:02:15Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-07T13:02:15Z }
---

# Goal

Provide one named Form options contract for reusable application configuration. Use existing bindForm behavior and plain objects/functions for application-wide, feature and instance settings. Keep CVC instances, Rows, captured UI defaults, validation and resource lifetimes explicit; add no runtime global registry or generic merge/composition library.[^form][^ui][^rules]

# Checkpoint

- M5.9 starts at pushed 3f5e3adaa60554633d62c43d7df826efff239be5 with a clean worktree; independent read-only M5.8 recovery and bounded pre-source contract review pass.[^baseline]
- FormOptions names the exact existing nine-property constructor shape. The real two-layout controller and isolated installed JS/TS/browser consumers exercise ordinary presets, per-screen Rows and explicit callback composition. Fresh emitted Form/UI JavaScript matches the actual M5.8 archive byte for byte.[^form][^ui][^example]
- Connected source/caller/test review, fresh canonical gates and independent raw/document reviews accept only selected outcomes. Wider global-wrapper/live configuration, embedded Grid/List inheritance, local-source and per-unbound-key callbacks and complete parity remain required.[^parity]

# Steps

1. Independently review this bounded contract before source edits. Export only FormOptions<T extends object = Record<string, unknown>> from the UI entry. Move the existing anonymous bindForm option shape unchanged into it and use that type in bindForm. Keep runtime checks, defaults, callback signatures and behavior unchanged. Remove only imports made unused by that extraction.
2. Use a typed, application-owned preset in the real two-layout employee controller for its existing company-email rule and salary parser. Reuse it across independent CVC instances, pass each Rows in the final instance call, and let a meaningful local onBind own the selected-label update. Keep null-selection cleanup explicit. Do not add identity callbacks or synthetic framework state merely to demonstrate defaults.
3. Specify standard object-spread behavior: later own properties win, including undefined; omit a property to inherit. Explicit false overrides a boolean preset. Own undefined can remove an inherited callback or return an ordinary option to the framework default. Legacy undefined-inheritance maps to omission; null callback disabling maps to own undefined. Explicit null callbacks retain FORM_BIND/FORM_VALUE_OPTIONS errors, and null autoValidate retains FORM_VALIDATE; the typed options contract does not accept those nulls. Do not silently emulate jQuery's different merge rules.
4. Merge parse/render and RuleSet format/validate/messages maps explicitly when both scopes must survive. Merge fields at the map level and an individual FieldRules entry by kind. Tuple lists replace as ordered lists; [] clears that kind. Keep Rows, functions, DOM and referenced argument objects under their existing owners; no JSON/deep cloning, global mutation, implicit deep merge or hot reconfiguration.
5. Supply and execute explicit application callback recipes. Capture local/shared function references and call them as plain functions with the same context/phase. For a value pipeline, run local on input, immediately forward a thenable to the existing Form handling, including value-callback stale/disposed error suppression and rejection draining, pass the effective local-or-input value to shared, and preserve local output when shared returns undefined. All-undefined must remain undefined; false/null/zero/empty string are values. A whole observer may conditionally skip shared on exact false without vetoing binding; forward an intermediate thenable to the existing handling rather than swallowing it. Map legacy after-value original-input/false-tail behavior with a separate explicit recipe when that outcome is needed.
6. Keep callback-unit boundaries honest. Internal application functions are not separate Form callbacks. Existing current/source/disposal and native projection checks run after the combined function returns; they do not cancel arbitrary application work between its subcalls or validate its temporary intermediate values. Tests must demonstrate stale framework DOM suppression after nested work without claiming skipped application tails. This slice adds no framework-managed layer contract; wider global-wrapper equivalence remains an open parity review, not approval to omit a capability or a promise to add an engine.
7. Add browser witnesses and isolated installed JS/TS consumers for typed presets, undefined/false precedence, nested-map/empty overrides, shared input immutability, independent CVC instances, captured references/receivers/phases, undefined/false output, thenables/throws, explicit legacy tails and callback-unit cancellation. Preserve native defaults/unbind/rescan and Rows originals. Fix the Form concept's stale dispose/recreate guidance for native-owner moves to name the existing rescan operation.
8. Independently review connected source/callers/tests/documents. Freeze runtime inputs before final gates. Run strict build/source/example types, units, full Chromium/Firefox/WebKit, one exact tar in isolated JS/TS and all five Windows browsers, original nine binding/twenty-one viewport budgets and changed/full OKF checks. Retain attempts, source/log/archive hashes, complete identities, immutable parents and protected fixtures.

# Next action

Selected typed-preset/application-composition outcomes are accepted. Plan M5.10 against the remaining source-backed Form configuration/default/callback outcomes, including live-global and embedded Grid/List ownership. Keep local-source/per-unbound-key observation, direct hot declarations and wider dynamic owners, List editing, Tree validation, unvalidated paste, general data/schema equivalence, other UI/CVC/P0 and M13 required. No omission or full-family closure is approved.

# Decisions

- Continued-work approval covers this bounded stage. Public API additions require an actual usage reason; FormOptions serves typed presets and installed consumers without Parameters/typeof type extraction.
- Application-wide configuration is an imported object or scoped factory passed explicitly. Per-screen Rows and lifetime ownership remain instance-local; shared settings are not a hidden dataset.
- One new named type; no new runtime function, method, constructor option, module, dependency or callback engine is planned.
- Preserve v1/master, immutable earlier evidence, original performance fixtures/budgets and the ignored legacy lock. Root 2.0 remains Apache-2.0; commits/pushes stay on 2.0.0-alpha.0.
- Serialize source browser/performance runs. All available Windows engines remain required; actual macOS/iOS Safari is excluded. No npm publication or release tag.
- No model-response evaluation or actual token-saving claim. Label any source/context-size measurement as a proxy.

# Verification log

Independent baseline/contract/source/caller/raw/document reviews pass. Fresh checks pass on 188 frozen inputs, 138 units and 766 full cases per engine, with 16 new browser cases and 0 new non-DOM units: strict build/source/example types, one actual 188-file tar in JS/TS and five Windows browsers, original 30 performance budgets and sixty recomputed medians. Sixteen canonical groups expand to 27 execution-stage commands and 13 Chromium collections. Complete 12-shard Chromium coverage has no retries/skips; Firefox/WebKit are unsharded. [The receipt](evidence/m59-verification.json) preserves every captured attempt, exact raw hashes and immutable parents; [the JavaScript comparison](evidence/m59-runtime-js.json) records exact prior archive/current build bytes. Changed/full OKF checks have zero errors/warnings; historical bodies/dates remain. No full-family/P0/M13 closure, omission, publication or tag.

# Open questions

Wider global-wrapper/live configuration, embedded Grid/List inheritance, local-source and per-unbound-key callbacks, all remaining owner families/P0/M13 and consolidated omission decisions remain required. Manual assistive technology, personal acceptance and final fixed-agent/token comparison remain unverified.

[^previous]: Completed explicit field discovery and lifetime scope
[^baseline]: Frozen 3f5e3ad source, runtime and installed package baseline
[^form]: Constructor option capture and guarded callback execution
[^ui]: Public Form callback, rule and handle contracts
[^rules]: Captured catalogs and per-kind field declarations
[^example]: Independent CVC employee Forms and application rules
[^legacy]: Form option precedence and local/global wrapper behavior
[^config]: Preserved application configuration and shipped empty Form defaults
[^parity]: Complete retained feature obligations and consolidated omission review
