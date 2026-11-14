---
type: Plan
title: Natural-JS 2.0 M5.13 authored choice groups
description: Generate native radio and checkbox choices from authored templates and adopt them safely in Form.
tags: [meta, plan, ui, binding, migration]
status: draft
sources:
  - id: previous
    resource: m5-form-source-plan.md
    title: Existing source ownership and next U10 requirement
    git_blob: 0e222ecd5b99b3b35488f40b2570976e93f7ee98
  - id: baseline
    resource: evidence/m512-verification.json
    title: Frozen M5.12 source, runtime and installed artifact baseline
    git_blob: e08d7fab8fa8a4a10ee1df29501a22b0c1091bf0
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Historical generated choices, selection and group lifecycle defects
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: caller
    resource: ../../v1/docs/examples/template/search-grid-detail-horizontal.md
    title: Actual codes-before-Form radio and checkbox caller
    git_blob: add6d13e3001ac86ea246e330a0287a3fc057d1f
  - id: form
    resource: ../../src/ui/form.ts
    title: Compiled native groups, drafts, captures, rescan and cleanup
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Shared native read, write and checkbox shape
    git_blob: ba5da2de312e41492ce6ead4df8300d13004dd76
  - id: select
    resource: ../../src/ui/select.ts
    title: Existing standalone choices and handle conventions
    git_blob: 4160eb77722751aad730fb997a4f0b07a967bd1e
  - id: parity
    resource: feature-parity-plan.md
    title: Complete required outcomes and consolidated omission obligations
    git_blob: 0bbbd0a39647721d8d802d4b0f93733dff35b76e
generated: { by: codex/gpt-6, at: 2026-11-14T07:38:29Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T07:38:29Z }
---

# Goal

Implement the real U10 generation-before-Form workflow with authored native HTML and stable group values. Add bindChoiceGroup and a precise ChoiceGroupHandle, reuse SelectChoice<string>, and keep compiled Form ownership explicit. Generate no form wrapper, visual theme, custom keyboard engine, code-loading registry or convenience library.[^caller][^legacy][^form][^select]

# Checkpoint

M5.13 starts at clean pushed 08c5aec77fd70e2cddd625734d94fc237a601582 on 2.0.0-alpha.0. Independent M5.12 recorded-byte recovery and bounded pre-source reviews pass. The actual codes-before-Form caller is implemented through one native group binder/private descriptor. Two authored CVC layouts, standalone replacement, source/default/validation/claim lifetimes and exact installed consumers execute the selected contract. No legacy generated form, HTML-label evaluation or cardinality-dependent checkbox collapse is copied.[^baseline][^caller][^legacy][^form]

# Steps

1. Independently approve this bounded contract before source edits. Inventory Form/native/value/default helpers, actual callers, public exports, installed consumers, examples and tests. Preserve existing Select and static checkbox behavior.
2. Add bindChoiceGroup(root: HTMLFieldSetElement, options) returning ChoiceGroupHandle. Reuse SelectChoice<string> for choices; optional value and native onChange use string | null | readonly string[]. The plain handle has setChoices, setValue, value and dispose; no value alias or generic type composition. Infer radio or checkbox from the authored item input. Reject nonstring/duplicate choice values, empty labels, invalid flags/callbacks or malformed templates before publishing ownership/DOM. Radio reads string or null; checkbox reads string[] for zero, one or many choices. Do not coerce numeric/boolean codes into strings silently.
3. Require an authored fieldset named by a legend, aria-label or aria-labelledby, and one direct template[data-choice-template]. Its item is one wrapping label with one radio/checkbox input and one noninteractive data-choice-label text target that does not contain the input. Preserve author layout/classes/attributes; write labels as literal text. Root carries data-field and Form declarations when adopted; generated inputs do not duplicate data-field. Reject per-item fixed IDs, explicit label-for and ambiguous checked defaults; supply initial selection through value. Generate a native name isolated from other names and IDs, reusing the existing DOM ID owner and checking native name collisions. Do not create a nested form or hidden proxy input.
4. Initial value sets checked and native defaultChecked before Form captures; omission starts null/[]. Later standalone setValue changes current checked state only. Wrong mode, nonstring values or null array entries fail before changing checkedness. Unknown string codes clear/drop from DOM selection, duplicate setter entries collapse to unique native choices in catalog order, and disabled existing choices remain programmatically selectable. Standalone setChoices validates/builds first, preserves surviving live and native-default selections separately, leaves new choices unchecked and never writes Rows. Preserve outside focus; restore a surviving focused choice or an enabled neighbor, then the real fieldset when empty or only disabled choices remain. A wholly disabled root does not force focus or create a proxy. Restore owned tabindex and exact authored children on disposal. Native change uses a captured plain callback; it observes native state, not a promised Form commit.
5. Add one specific private descriptor/claim owner shared by the binder and Form. Form compiles a marked initialized group root as one persistent field with real native members, an explicit array flag and root/member ARIA/change-state captures. Zero choices still represent null or [] and an actual fieldset error target; no fake controls or nullable contexts. Use the first input as primary when present and the real root when empty. Reject uninitialized/disposed marked templates, group formatting/rendering and group string parsers before destructive work. Group codes remain strings; normalize business data before Rows loading.
6. Share the explicit checkbox-array predicate with native read/write and value projection. Include empty groups in defaults, current source reads, validation, existing local Form native-reset ownership, change markers and unbind/captured restoration. Rows-backed reset introduces no store write or new reset subscription. Preserve normal Form Rows/original/draft and focus semantics. Source values stay raw: render only exact matching string codes; explicit/automatic validation under the existing policy reports invalid shape, duplicate or unavailable codes without rewriting source or originals. Disabled existing choices remain available. Group value-callback replacements require native-compatible string/null or string-array values and available choices; no source coercion. A template-required radio needs a selection. Template-required checkboxes retain native per-control semantics: every enabled generated checkbox is required; logical nonempty selection uses the existing root required rule. That rule keeps its existing text semantics: a single selected empty-string code still fails; use an application validator when only array cardinality matters. A template-required empty group yields a Form issue unless effectively disabled, including authored template disabling. Do not claim a fieldset alone participates in native browser constraint validation.
7. Form adoption locks public group setChoices, setValue and dispose before any DOM mutation. Read remains available; source changes use Rows and Form's internal writer. Form.dispose or successful field retirement through rescan releases the claim; rejected rescan/drafts retain old claims. Failed Form construction or rescan acquisition releases every provisional new claim. Register group cleanup before Form cleanup so CVC reverse disposal releases Form first. This stage supports generation-before-Form and standalone replacement; live replacement while adopted remains a required follow-up contract, not an omission or U10-family closure.
8. Rebuild the actual radio/single and checkbox/array scenario in two authored CVC instances. Demonstrate selected defaults, shared Rows updates, validation/revert, array cardinality and exact cleanup without additional framework helpers. Add focused browser and actual installed JS/TS/five-browser witnesses for valid/invalid markup, strings/null/arrays, zero/one/many choices, native keyboard/labels/disabled/defaults/reset, literal labels, name/ID isolation, errors/projection, adoption locks, rescan release/retry and teardown.
9. Freeze runtime inputs and run strict build/source/example types, units, complete Chromium/Firefox/WebKit, one actual tar in isolated JS/TS and Chromium/Firefox/WebKit/installed Chrome/Edge, original nine binding/twenty-one viewport budgets and changed/full OKF checks. Retain every attempt, source/log/archive hashes, complete case identities and unchanged original fixtures. Keep failure-only tracing enabled; it does not establish the earlier module-fetch cause.
10. Update implemented draft API, Form/native-value/type contracts, migration, actual example, parity, indexes/log and active plan in the same task. Independently review connected source/callers/tests, raw evidence and final semantic documents. Apply verified only after separate review; preserve historical bodies/dates during fingerprint refresh. Commit and normally push to 2.0.0-alpha.0.

# Next action

Plan M5.14 for safe live Form-owned choice replacement: preflight the new catalog, preserve source/drafts/defaults, reconcile compiled members and ownership, retain native accessibility/focus and reject stale work. Review the compact owner contract before code. Broader Select operations, declarations, exact legacy per-key timing and other data/UI/CVC/P0/M13 obligations remain required; no omission or full-family closure is approved.

# Decisions

- Continued-work approval covers this stage. One public binding function and one precise plain handle reuse SelectChoice<string> and existing method conventions. SelectHandle<string> permits unsupported null array entries, so it is not the return type. No public value alias, registry, generic extension engine, dependency or entry is planned.
- The private ownership map serves two real owners. Form retains its field graph, validation, captures, data and lifecycle; the group owner retains generated native nodes and standalone selection.
- Form-owned live choice replacement, broader Select removal/index/append/reset equivalence, dynamic declarations, exact legacy key timing, other data/UI/CVC/P0 and mandatory M13 remain required. Selected outcomes do not close a family or approve omissions.[^parity]
- Preserve authored HTML/CSS, unique document IDs and isolated native grouping. Root 2.0 remains Apache-2.0; master/LGPL v1, immutable evidence, protected fixtures and the ignored legacy lock remain unchanged.
- Serialize browser/performance checks. All available Windows engines remain required; actual macOS/iOS Safari is excluded. npm publication and release tags remain deferred.
- No model-response evaluation or actual token-saving claim. Context byte/line figures are labeled proxies.

# Verification log

Fresh gates pass on 201 frozen inputs, 138 units and 836 complete cases per engine, including 26 new browser cases. The sixteen latest groups cover strict build/source/example types, units, one actual 203-file tar in isolated JS/TS and all five Windows browsers, complete Chromium/Firefox/WebKit and the original thirty performance budgets/sixty recomputed medians. Chromium's twelve fresh sequential shards cover every identity exactly once without retries/skips; Firefox/WebKit are unsharded. [Raw evidence](evidence/m513-verification.json) preserves all attempts and input maps. Initial compiler narrowing and demo label-locator failures were corrected; independent review also added getter reentry, sparse catalog, insertion rollback/focus and shared-Rows ownership witnesses before final verification. Independent connected source/raw/final-document reviews pass. Changed/full OKF checks have zero errors/warnings; historical bodies/dates and immutable parents remain. Live adopted replacement, broader parity and mandatory M13 stay required. No omission, publication or tag.

# Open questions

Plan safe live Form-owned choice replacement separately before removing adopted members. Keep remaining full-owner/parity work, manual assistive technology, personal acceptance, prior module-fetch cause and fixed-agent/token comparison unverified.[^parity]

[^previous]: Existing source ownership and next U10 requirement
[^baseline]: Frozen M5.12 source, runtime and installed artifact baseline
[^legacy]: Historical generated choices, selection and group lifecycle defects
[^caller]: Actual codes-before-Form radio and checkbox caller
[^form]: Compiled native groups, drafts, captures, rescan and cleanup
[^native]: Shared native read, write and checkbox shape
[^select]: Existing standalone choices and handle conventions
[^parity]: Complete required outcomes and consolidated omission obligations
