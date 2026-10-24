---
type: Plan
title: Natural-JS 2.0 M10.9.3 controls and validation
description: Complete Grid control values, explicit display, exclusive checks and validation interaction using shared native field semantics.
tags: [plan, grid, forms, accessibility]
status: draft
sources:
  - id: parent
    resource: m10-parity-plan.md
    title: Required Grid continuation and stage boundaries
    git_blob: 87470e331d6c6c551c1787cd48a52cdddc1c8108
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid fields, drafts, paste and row lifetime
    git_blob: e9e6c3bdcaa81e4f99d98c7b7100f7f13263ef26
  - id: form
    resource: ../../src/ui/form.ts
    title: Form group values, native constraints and display
    git_blob: cf97e4f21033e353f9a5aaafddec1b9623d05267
  - id: list
    resource: ../../src/ui/list.ts
    title: Existing nested Select and display semantics
    git_blob: 578c0619b9262c497a11d078d07832d0f1fdf4b6
  - id: checks
    resource: ../../src/ui/grid-selection.ts
    title: Atomic checked-ID transitions and vetoes
    git_blob: eb9ae76806af63029078cb64d5f68acccc62053c
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Historical Grid-to-Form delegation and interaction intent
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Private shared native values, display and constraints
    git_blob: 24943c238ebb41954764f4ab45306d5e7808b572
  - id: rendering
    resource: ../../src/ui/field-render.ts
    title: Private explicit display and DOM ownership checks
    git_blob: 6cee41e892540ca138affb9988ab708506f6cb20
  - id: controls-browser
    resource: ../../tests/browser/grid-controls.spec.ts
    title: Groups, raw arrays, timing, protected paste and invalid reveal
    git_blob: 6df9b6e36371f8547a3366ea60e1afc9f70e5d56
  - id: rendering-browser
    resource: ../../tests/browser/field-render.spec.ts
    title: Renderer ownership, local raw values and restoration
    git_blob: 8320051e7aa3cb4af2ee5be9f4225e3a8a6fb0c7
  - id: demo
    resource: ../../examples/vite/m10/demo.ts
    title: Live all-options Grid and two authored record layouts
    git_blob: b97ee4c4cbea81aaabb4e3c8ceb2bcb5ed1cafd7
  - id: benchmark
    resource: ../../tools/benchmark-grid-viewport.mjs
    title: Unchanged flat, nested and multi-tr viewport budgets
    git_blob: 7370923a46bd5960e8803319da24777f1128262c
  - id: evidence
    resource: evidence/m1093-verification.json
    title: Frozen execution inputs, raw gates, exact artifact and measurements
    git_blob: eca768223e810c85a13871f8cdca10be8e7deca8
generated: { by: codex/gpt-6, at: 2026-10-20T15:04:19Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-20T15:04:19Z }
---

# Goal and scope

Continue G04/G05/G06/G10 without changing caller-owned Rows, CVC, authored HTML, unique DOM identity or bounded rendering. Recheck M10.9.2 first. Its 104 unit and 270-per-engine gates, exact artifact and measurements remain historical evidence rather than a new full-parity claim. Preserve all later G01-G20 and other component/P0 obligations. No legacy behavior is retired, dependency or general renderer registry is added, and v1/master/publication remain unchanged.[^parent][^legacy]

# Contract before code

```html
<tbody data-row-template><tr>
  <td><fieldset><legend>Assignment</legend>
    <label><input type="radio" data-field="assignment.mode" value="office">Office</label>
    <label><input type="radio" data-field="assignment.mode" value="remote">Remote</label>
  </fieldset></td>
  <td><label>Shifts <select multiple data-field="assignment.selected"
    data-options="assignment.shifts" data-option-label="label" data-option-value="code"></select></label></td>
  <td><img data-field="avatar" alt="Employee portrait"><span data-field="summary"></span></td>
</tr></tbody>
```

```ts
const grid = bindGrid(table, {
  rows, checkMode: "single", validateOn: "blur", revealInvalid: true,
  render: { summary(value, context) {
    const strong = context.element!.ownerDocument.createElement("strong");
    strong.textContent = String(value ?? "");
    return strong;
  } }
});
```

- Keep the scalar fast path. Compile radio/repeated-checkbox members once per logical field across all physical tr elements. Radio members must share one native form owner (all null is allowed); reject mixed owners before mutation. Each cloned radio group receives a document-unique native name, independent of field path, RowId and DOM id; authored source names/markup remain unchanged. Do not create one Form controller per row.
- Native field values match Form: one checkbox is boolean; repeated checkboxes are string arrays; radio is string/null; multiple Select always returns an array, including empty/one choice. Nested Select options retain their raw numeric/boolean/null values through the existing option map. Native date/time/month/week/color/hidden inputs use strings; number/range require an application parser in Grid. File stays supported by local Form, outside JSON Rows.
- Formatters/validators remain reachable and shared. A string parser cannot handle checkbox/array controls. Only own configuration keys are callable, including fields named toString. Native constraints use the same candidate and disabled rules for visible/offscreen controls. Always check text min/max lengths for programmatic values; detect invalid native value sanitization without overwriting stored data.
- Clipboard positions remain logical and row-major. Radio accepts one available string or blank/null; array controls accept a JSON array in a single TSV field (normal TSV quoting still applies). Raw option identity, disabled/read-only protection, one atomic commit and unrelated drafts are preserved. Unsupported or ambiguous choices fail before writes; partially protected groups are skipped as one protected logical field.
- Images write their native src attribute; null/empty removes src and authored alt remains. Plain display stays text. Grid and Form accept a typed field render function returning a fresh disconnected same-document Node, string or null. Strings stay text; application code creates/sanitizes trusted rich DOM. Compile and validate render targets/configuration before ownership; do not allow a renderer to remove another bound field/control/error region. No asynchronous render or string-to-HTML option is introduced.
- checkMode defaults to multiple; single allows zero or one checked RowId, independently of active/selected membership and data checkboxes. Checking a new row atomically replaces the previous ID through existing veto/callback paths. A full replacement containing more than one eligible ID fails unchanged. checkAll(true, scope) preserves existing checks for zero eligible IDs, replaces them for one, and rejects more than one unchanged. Header check-all controls are disabled when their scope contains more than one eligible row in single mode.
- validateOn defaults to change, preserving current behavior. blur defers scalar text commits until focus leaves the logical field; manual keeps drafts until explicit validate. Enter commits/validates a scalar field in change/blur mode; textarea Enter, composition and modified/native shortcuts remain native. Group/Select change behavior is explicit and does not fire twice through blur.
- revealInvalid defaults to false. When enabled, explicit validate and rejected paste reveal the first invalid RowId on the current logical page through the existing viewport and focus its enabled visible field. Off-page errors remain recorded without changing the application's page/filter. Validation results retain correct connected element references after reveal. No navigation to another CVC page or second scrolling engine is added.

# Change order and shared responsibilities

1. Compare the prior checkpoint and actual 1.x Form delegation. Write the above compact contract and representative failures before integration.
2. Extract only existing scalar/group read/write, format-capability and native constraint checks into a private field module used by Form/Grid/List. Keep field compilation, probes, RowId/drafts, rules and error ownership with each binder.
3. Integrate Grid groups/native controls, isolated names, typed multiple Select and atomic array paste into the existing render/update path; preserve column, multi-tr and viewport behavior.
4. Add one small shared display function for explicit rich DOM to Form/Grid, then implement validation timing/reveal and exclusive checks through existing event/selection owners.
5. Extend the existing all-options demo with working controls and both authored layouts; update API/migration/index/log and installed JS/TS/browser examples in the same task.
6. Independently review concrete cases and fixes, freeze execution inputs, run affected/full gates and record exact evidence before verified stamps. Push the tested scope to 2.0.0-alpha.0.

# Verification and budgets

- Cover radio isolation within one/no native form and multiple MDI Grids; cross-tr groups; empty/single/multiple choices; raw nested option types; invalid defaults/disabled controls; drafts/errors through move/sort/filter/page/reveal/disposal; protected/invalid atomic array paste; inherited option keys; native value sanitization; image/text/rich display and ownership failures.
- Cover identical Form/Grid/List programmatic length constraints, before/after hooks and no duplicate commits, native blur/Enter/composition, first-error reveal/focus, off-page errors and separate single-check veto/reentrancy.
- Preserve every existing 100/1,000-row binding and 5,000-row flat/nested/two-tr viewport budget and sample count. Add a small representative group fixture before measurement if the existing nested/group browser evidence cannot establish bounded work. No universal speed, heap or actual token claim.
- Required gates: strict source/example types, build and units; full Chromium/Firefox/WebKit; one inspected artifact in JS/TS and Chromium/Firefox/WebKit/installed Chrome/Edge; unchanged performance budgets; changed/full docs with zero errors and recorded warnings. Actual Safari remains excluded; native OS IME/clipboard, manual assistive technology and personal acceptance are not implied by automation.
- Record source/fixture/log/archive identities, failed attempts and review corrections. If only a benchmark fixture changes after unrelated gates, prove the narrow difference and execution dependency rather than rerun unrelated gates or claim they used a later fixture.

# Checkpoint

This slice and its independent source/API/evidence/document closure are complete. Next prepare M10.9.4 status and row lifecycle. Later Grid/component/P0 work remains required. The new M13 whole-code review/remediation milestone runs only after all required feature work, before personal testing and separately requested release work.

# Baseline and review corrections

A separate read-only audit matched all 31 preceding HEAD-normalized source/fixture hashes, 23 byte-exact logs and gate records, and 16 final M10.9.2 gates. The exact 158-member tarball and pack manifest match the retained record. Its 34 source/metadata members match HEAD, allowing only normalized newlines; all generated members match the preserved verified cache. This does not claim an independent historical rebuild. The documented old benchmark input in 15 unaffected gates remains explicit; no historical evidence or date is rewritten.[^parent]

Independent review reproduced mixed native radio form owners ignoring a new selection, and first-error reveal retaining a detached element on a different invalid row. Preflight now rejects mixed owners without mutation; all returned issue references are refreshed after reveal. A partially hidden choice group retains one protected clipboard position, including hidden managed columns in offscreen rows. Array duplicate checks preserve Object.is identity for negative/positive zero while rejecting true duplicates. Focused regressions cover each correction.[^grid][^controls-browser]

The final connected review reproduced a required radio parser supplying a nonempty default for an empty entered value, and hidden viewport/ancestor state protecting only mounted rows. Native groups now validate explicit entered null/arrays separately from parsed business values. The shared paste visibility check includes actual root/ancestor hidden state for both mounted and detached source probes. Both fixes independently pass their regressions; documentation distinguishes default focus preservation from opted-in invalid-row reveal.[^grid][^controls-browser]

Renderer preflight shares the existing native interactive-content boundary with merge compilation, so an authored link, media control or frame cannot be removed by replacing a parent display field. A separate connected-flow review also found that newly returned interactive DOM could bypass authored merge guards and disappear in a follower record. Grid now checks returned DOM before replacement only for merged display fields; plain strong/text output and ordinary nonmerged interactive display remain supported. Local Form claims its root before invoking renderers, retains original raw display values for read/validation, releases ownership and restores original children after failed initialization, and restores only configured display children on disposal. Native value/constraint sharing remains private to actual Form/Grid/List consumers. Date formatting keeps years 0000-0099 through native full-year setters rather than Date.UTC's historical 1900 offset.[^native][^rendering][^form][^rendering-browser][^controls-browser]

The first provisional full Chromium run passed 308/309 cases; its sole failure expected a radio input to remain unsupported. Replace that obsolete assertion with actual checked/valid/disposed behavior while retaining its file, native-length, disabled-checkbox and forbidden-format assertions. Later provisional Chromium runs passed 310/310 and 311/311 on their recorded inputs. Two provisional Firefox children were deliberately stopped for independently reproduced merge-render and final native-group/hidden-root corrections; the latter detects the in-progress source change and records sources_unchanged=false. Rebuild/retype/retest/repack before final gates; all provisional records remain retained and do not certify final source. Windows WebKit date/color inputs may fall back to text; capability checks require every supported constraint without inventing a custom picker or corrupting stored values.[^controls-browser][^evidence]

Work-cost observations: two private modules replace shared native/display responsibilities at actual callers; no named public type, runtime dependency or public utility/registration engine is added. Group membership and renderer configuration compile once, with ordinary text/scalar binding retaining its direct path. New API, demo and installed-consumer examples are located together through the indexes. Actual tokens and equivalent agent-task speed are not measured here; M13 retains the final fixed-task evaluation.

# Frozen verification

Build, strict source/example types and all 105 unit tests pass. Complete Chromium, Firefox and WebKit suites pass 313/313 each. The 43 added cases comprise 27 integrated control cases, six display-owner cases, five exclusive-check cases, three Form cases and two demo cases; older unsupported-radio/multiple-Select assertions now verify the implemented values while retaining unrelated protections. The two authored demo layouts share the same Rows and retain automated accessibility, unique-ID and narrow-screen checks.[^controls-browser][^rendering-browser][^demo][^evidence]

Installed JS/TS and Chromium/Firefox/WebKit/installed Chrome/Edge pass one exact unpublished 168-file artifact, SHA-256 cfe710f0d644d95505f63d81e2a36e2fff6b17a64c50be6bb0d45f8653225831, 266,871 packed / 1,309,779 unpacked bytes. All members match the frozen workspace; the five public entries remain unchanged, private helpers cannot be imported through package subpaths, and runtime dependencies remain zero. Sixteen final gates share 155 normalized 2.0 source/fixture/configuration fingerprints and byte-exact logs. All 42 command records retain provisional and interrupted attempts separately; no superseded input certifies final code.[^evidence]

Two warm-ups and five measured samples preserve all existing fixtures and budgets. The 1,000-row flat initial/rebind/edit/sort/filter medians are 16.7/21.9/0.8/2.5/1.3ms; nested automatic initial/rebind/sort/filter medians are 41.9/49.2/6.3/3.2ms. For 5,000 logical records, flat/nested initial medians are 17.4/8.3ms with at most 14 physical rows. The two-tr/merged fixture initial/reveal/scroll/columns/paste/move medians are 17.1/66.2/50.2/49.1/34.1/62.9ms with at most 24 physical rows. Actual intersections, focused drafts/nodes, row bounds and cleanup assertions remain intact. New group tests also cover bounded offscreen array operations. These are reference-host DOM timings, not universal speed, measured heap retention or AI-token savings.[^benchmark][^controls-browser][^evidence]

Actual macOS/iOS Safari remains excluded. Manual assistive technology, actual OS IME/clipboard, personal acceptance and fixed final agent-task/token evaluation remain unverified. No npm publication, release tag, master/v1 edit or new feature omission is included.

Changed and full OKF checks pass with 57 concepts, five reserved files, zero errors and zero warnings. Fourteen independently reviewed changed concepts receive verified metadata; twelve historical concepts receive fingerprints only, retaining their exact bodies and generated/verified dates. The independent final audit matches all 155 current inputs, 42 raw log hashes, sixteen final gates, every actual archive member and 57 recomputed raw medians against the unchanged budgets. Raw [changed](evidence/m1093-docs-changed.log) and [full](evidence/m1093-docs-full.log) outputs retain the final documentation result.

[^parent]: Required Grid continuation and stage boundaries
[^grid]: Grid fields, drafts, paste and row lifetime
[^form]: Form group values, native constraints and display
[^list]: Existing nested Select and display semantics
[^checks]: Atomic checked-ID transitions and vetoes
[^legacy]: Historical Grid-to-Form delegation and interaction intent
[^native]: Private shared native values, display and constraints
[^rendering]: Private explicit display and DOM ownership checks
[^controls-browser]: Groups, raw arrays, timing, protected paste and invalid reveal
[^rendering-browser]: Renderer ownership, local raw values and restoration
[^demo]: Live all-options Grid and two authored record layouts
[^benchmark]: Unchanged flat, nested and multi-tr viewport budgets
[^evidence]: Frozen execution inputs, raw gates, exact artifact and measurements
