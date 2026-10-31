---
type: Plan
title: Natural-JS 2.0 M5.3 Form row-local choices
description: Bind nested typed Form choices through existing option owners and remove manual detail-screen option conversion.
tags: [meta, plan, form, binding, accessibility]
status: draft
sources:
  - id: previous
    resource: m5-state-plan.md
    title: Completed received-state continuation
    git_blob: eb68aa60858b50a10cca9e0588228623da4a5535
  - id: baseline
    resource: evidence/m52-verification.json
    title: Preserved 4660cd6 source and runtime evidence
    git_blob: bb7428451aed61b309e05b26dd962d2a084cb07e
  - id: form
    resource: ../../src/ui/form.ts
    title: Form fields, candidates, drafts, validation and lifetime
    git_blob: 7b5d6f99b96cf413f277169eafbba722f7e350d1
  - id: options
    resource: ../../src/ui/row-options.ts
    title: Existing row-local option extraction
    git_blob: 4d7359d7fdafb0fda5fafb0ee81372b26722538a
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid raw option maps and validation
    git_blob: 567439878a74284e7a1f60c6898d636322c190e5
  - id: list
    resource: ../../src/ui/list.ts
    title: List raw option maps and occurrence-based selection
    git_blob: be00786b8aa50a9ef64af11d5402298cdbc065b3
  - id: select
    resource: ../../src/ui/select.ts
    title: Standalone Select identity and authored-node restoration
    git_blob: 4160eb77722751aad730fb997a4f0b07a967bd1e
  - id: detail
    resource: ../../examples/vite/m10/detail.ts
    title: Existing manual nested shift-option conversion
    git_blob: 92f3a841d3d96b90eb2d2f3cfa9baf66f23f628f
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Preserved Form and Select intent
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: acceptance
    resource: evidence/m53-form-options.json
    title: Selected typed-choice, occurrence and lifecycle witnesses
    git_blob: 1a91b99fede2dc3066aa20d3c6468bc59e02b461
  - id: runtime
    resource: evidence/m53-verification.json
    title: Frozen M5.3 inputs, raw gates, package and measurements
    git_blob: d83d915c354e867c1e7135db46939be98eca2353
generated: { by: codex/gpt-6, at: 2026-10-31T08:28:09Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-31T08:28:09Z }
---

# Goal

Let a Rows-backed Form bind a nested option list and retain its raw string, number, boolean or null values. Use authored native HTML and the existing row-option, Select ownership, field-path and rule owners. Remove the detail controller's manual shift options, numeric conversion and subscriber-order dependency. Add no public type, option, method, module, dependency or registration engine.[^form][^options][^detail]

# Checkpoint

Start at pushed 4660cd6d2590f9df2e2dfa55ef4a7542c181d9e8 on 2.0.0-alpha.0 with a clean tree. Independent recovery matches 180 inputs, twenty-eight gate logs, three extra development logs, four manifests, sixteen final gates and every actual 183-file package member. Preserve the M5.2 receipt and raw evidence; do not rerun or recertify historical runtime.[^baseline]

# Steps

1. Recognize a Select with data-field and data-options only in a Rows-backed Form. Require data-option-label and data-option-value, matching Grid/List. Parse all paths with the existing safe path owner. Reject unsupported tags, missing field/path markers, marked local Forms and string parsers on marked single/multiple Selects before DOM ownership or ARIA changes. Keep all unmarked authored Select and local/scalar-parser behavior unchanged.
2. Retain authored child nodes, options and initial selection. Map authored empty option values to raw null; other authored values remain strings. Generate row-local options through rowOptions, textContent and ownerDocument. Preserve nested label/value paths, ignored incomplete choices and absent/null source as an empty list; a nonarray source raises FORM_OPTIONS with field/row information.
3. Extract three small private functions into the existing row-options owner: build option DOM/raw maps, select raw values, and test available raw occurrences. Reuse each at Form/Grid/List callers. Keep caller caches, lifecycle, errors, drafts and rules in their current owners; add no parallel binding engine. Standalone Select public behavior stays unchanged.
4. Match raw values with Object.is, including 0/-0 and number/string distinctions. Single selection uses the first matching option. Multiple selection consumes one matching option per requested occurrence and reads in DOM order. Correct Grid's existing over-selection of equal options. Availability also consumes occurrences, so [1,1] needs two raw-1 options; reject an unrepresentable request instead of silently changing stored arrays. Apply this concrete consistency fix to Form/Grid/List, including full Grid paste validation.
5. Store entered marked-choice drafts as raw values. A foreign/unmapped or disabled selected option produces an invalid draft and select-option issue, without writing undefined into Rows. Keep raw-choice integrity mandatory with autoValidate:false. Programmatic binding may display a disabled authored choice. Selection writes never derive identity from serialized HTML option.value.
6. Validate against the target row's effective values and option source, including hidden-row drafts and validate(otherId). Do not consult the visible row's raw map or change its DOM. Optional scalar null is available only when a real authored/generated null choice exists, matching Grid/List; required scalar null/empty-string and empty multiple arrays fail full validation. A multiple [null] or [""] is selected when its matching option exists. Preserve native disabled/custom validity and business-rule boundaries.
7. Prepare every typed field's options before changing boundId or option DOM on a direct bind. A malformed later field leaves the previous binding/options/drafts intact. On row changes, rebuild only when the source identity changes, then display the committed value or preserved raw draft. Option-source changes do not normalize Rows or discard an invalid draft. Stop stale later-field work after reentrant callbacks, replacement, rebinding or disposal using a Form-owned render/source guard; do not introduce a generic render transaction or claim wider callback closure.
8. Reuse existing replace/append/remove/revert notifications, row-keyed drafts and null-binding rules. bind(null) removes generated row options without writing data. Initialization failure or disposal restores the exact authored nodes and initial selection and releases Select claims, events and errors; disposal remains idempotent and quiet. A subscriber failure after a Rows commit does not roll it back.
9. Mark the existing full detail template with the same nested option paths as Grid and delete updateChoices/codes/custom parser/order glue. Keep the reduced template and CVC controller ownership working. Extend isolated JS/TS and actual packed browser acceptance without adding public API.
10. Add focused option-identity/occurrence units and browser cases covering nesting, shared UI, invalid drafts, offscreen validation, malformed-source atomicity, callback reentry, required/integrity guards, MDI accessibility, ownership rollback and exact cleanup. Independently review connected code/examples/docs, then run strict build/source/example checks, full Chromium/Firefox/WebKit, exact-package JS/TS and five Windows browsers, unchanged binding/viewport budgets and changed/full OKF checks.

# Contract

~~~html
<form>
  <label>Shift
    <select data-field="assignment.chosen" data-options="assignment.shifts"
      data-option-label="meta.label" data-option-value="code" required>
      <option value="">Choose a shift</option>
    </select>
  </label>
  <output data-error-for="assignment.chosen"></output>
</form>
~~~

~~~ts
import type { SelectValue } from "@bbalganjjm/natural_js/ui";
type Assignment = { shifts: { meta: { label: string }; code: SelectValue }[]; chosen: SelectValue };
const rows = createRows<{ assignment: Assignment }>([{ assignment: {
  shifts: [{ meta: { label: "Off" }, code: false }, { meta: { label: "First" }, code: 1 }],
  chosen: false
} }]);
const form = bindForm(root, { rows });
form.bind(rows.entries()[0].id);
// Native changes commit false or 1, preserving their original types.
form.dispose();
~~~

HTML option serialization can coincide for distinct raw values; option-node ownership identifies them. A generated empty string differs from raw null. No separate typed mode option, placeholder policy engine, local data-source API or automatic business conversion is added.[^form][^grid][^list][^select]

# Next action

Selected implementation and verification are complete. Plan Form bind-value callbacks in bind/val phases through existing candidate/render owners; false replaces a value while undefined preserves it. Wider Form raw rendering, List editing, Tree validation, remaining defaults/hooks/UI/CVC/P0 and M13 remain required. No full-family closure or omission is inferred.

# Decisions

- The continued-work request authorizes this selected stage and the actual common-owner consistency fixes. No family closure or feature omission is inferred.
- Local Forms have no object-data source. Preserve their existing DOM-input contract and standalone Select support; data-options requires Rows instead of inventing a second input API.
- Preserve master, LGPL v1, immutable fixtures and the ignored original lockfile. Root 2.0 stays Apache-2.0; work and authorized pushes stay on 2.0.0-alpha.0.
- Captured Chromium Windows net::ERR_NO_BUFFER_SPACE failures during source-module loading require three sequential built-in shards for its full suite. Collection and execution identities must prove the complete suite runs exactly once, with no skipped or retried tests. Preserve raw child reports and the trace; Firefox/WebKit keep their complete unsharded runs.
- npm publication and release tags remain deferred. Chromium/Firefox/WebKit and installed Windows Chrome/Edge are required; actual macOS/iOS Safari is excluded.

# Verification log

Independent baseline recovery and contract/connected Ponytail source, example, consumer and document reviews pass. Form/Grid/List now share three small private option functions. Mandatory identity guards reject foreign/disabled option gestures; target-row validation isolates visible custom errors; fresh occurrence checks and render versions stop stale ready-field writes after subscriber option changes or rebinding.[^acceptance][^runtime]

Sixteen canonical groups cover eighteen final execution commands on 181 frozen inputs: build/strict source/example types, 138 units, 605 full cases in each required engine and exact-package isolated JS/TS plus five Windows browser consumers. The 183-file tar is 308978/1537111 packed/unpacked bytes, SHA-256 acebbba6bb10a70ab1a9195fc285d37d4a1ccc35b08213c37b267ae083f18335. Every actual member and individual size matches the workspace. No public type, option, method, module, entry or dependency is added.

All original nine binding/twenty-one viewport budgets pass. Independent review recomputes sixty medians from three hundred durations, 105 live checkpoints, 300 scroll windows and fifteen append/quiet-disposal samples, with physical maxima 14/14/24. These same-host checks do not establish universal speed or actual token savings.

[The receipt](evidence/m53-verification.json) retains 32 top-level commands plus Chromium child reports, including development attempts, exact input maps and two new unit/19 browser/three installed source witnesses. Two initial test expectations incorrectly required select-option for an early paste issue and omitted the application allowed issue; the failed Chromium log remains. Corrected witnesses require both native integrity and full business validation. Three unsharded Chromium attempts each passed 604 cases and failed one source-import initialization. The retained trace proves grid.ts returned HTTP 200 while its row-options.ts dependency failed with net::ERR_NO_BUFFER_SPACE. The unchanged first case passed in isolation; a separate 400-context ephemeral-port stress passed but did not reproduce the fixed-port HMR environment. Chromium therefore runs three sequential built-in shards with complete list/execution identity, disjoint-union and passed-once/retry-zero/skip-zero checks. Firefox/WebKit remain unsharded. Eighteen actual final execution commands implement sixteen canonical check groups; four additional Chromium collection commands prove coverage. Preserve every superseded failure, child report and trace; no source, test assertion, retry setting or exclusion was weakened. Two standalone compiler attempts were reported only in tool output; the separate observations record their known command/results without inventing raw logs, hashes or timestamps. The last reports only the pre-existing absent node:url declaration; final strict source/example gates pass.

Ten reviewed semantic concepts receive verified metadata. 24 historical concepts retain bodies and generated/verified dates with fingerprint-only updates. Changed/full OKF checks pass with 70 concepts, five reserved files and zero errors/warnings. Six inherited evidence/coverage parents, original fixtures, v1, the ignored lockfile and master remain unchanged. npm publication, release tags, omissions and full-family closure are not performed.

# Open questions

Manual assistive technology and final fixed-agent/token evaluation remain unverified. Complete retained feature/dynamic coverage and mandatory M13 before personal acceptance or separately requested publication.

[^previous]: Completed received-state continuation
[^baseline]: Preserved 4660cd6 source and runtime evidence
[^form]: Form fields, candidates, drafts, validation and lifetime
[^options]: Existing row-local option extraction
[^grid]: Grid raw option maps and validation
[^list]: List raw option maps and occurrence-based selection
[^select]: Standalone Select identity and authored-node restoration
[^detail]: Existing manual nested shift-option conversion
[^legacy]: Preserved Form and Select intent

[^acceptance]: Selected typed-choice, occurrence and lifecycle witnesses
[^runtime]: Frozen M5.3 inputs, raw gates, package and measurements
