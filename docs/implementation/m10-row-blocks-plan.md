---
type: Plan
title: Natural-JS 2.0 M10.9.2 authored row blocks and merging
description: Implement authored multi-tr records and hierarchical native cell merging without expanding measured viewport windows.
tags: [plan, grid, accessibility, performance]
status: draft
sources:
  - id: continuation
    resource: m10-parity-plan.md
    title: Required Grid continuation and prior ordered Rows gates
    git_blob: 29fd7ca35bff0c58027d705390bc6446d2cc6000
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid binding, logical identities, drafts and paste
    git_blob: 5f4cc1b5a2b4df9f07bc1d43d3521cb653dcb8e1
  - id: columns
    resource: ../../src/ui/grid-columns.ts
    title: Authored column topology and layout ownership
    git_blob: 002de08f3bc3f822bd39bb2d1f52bfee6f516d6e
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Measured logical-row windows and focus pinning
    git_blob: d02fbfe5407b80786733034f2f5aaaea5d71ef55
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Historical tbody cloning and hierarchical repeated-value display
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: body
    resource: ../../src/ui/grid-row-blocks.ts
    title: Private authored record structure and native merge ownership
    git_blob: 71d2218d3cf773d875bb423f8a324d5db70077ab
  - id: browser
    resource: ../../tests/browser/grid-row-blocks.spec.ts
    title: Multi-tr binding, native geometry, ownership and logical paste regressions
    git_blob: 29925f3b06132277a2628b258db900ed6669bc98
  - id: benchmark
    resource: ../../tools/benchmark-grid-viewport.mjs
    title: Original viewport budgets and declared two-tr merged measurements
    git_blob: 7370923a46bd5960e8803319da24777f1128262c
  - id: demo
    resource: ../../examples/vite/m10/demo.ts
    title: Two authored layouts sharing nested record state
    git_blob: c026da7f07812031e363e604265f74b7afbf6640
  - id: artifact-audit
    resource: evidence/m1092-artifact-audit.json
    title: Independent byte-exact package and private-entry audit
    git_blob: 6a2c88c1ae86ba9f65cc857ea8acc4efbdf9ec5a
  - id: evidence
    resource: evidence/m1092-verification.json
    title: Final M10.9.2 source, command, artifact and measurement evidence
    git_blob: 36d37d371b2b5b8bb4f3f776eb14372d5bd9a507
generated: { by: codex/gpt-6, at: 2026-10-20T13:42:47Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-20T13:42:47Z }
---

# Goal and boundary

Complete the authored-body and adjacent-merging slice of M10.9 on `2.0.0-alpha.0`. Preserve CVC, caller-owned Rows, authored HTML/CSS, retained rules and compact declarations. The 1.x implementation cloned an entire tbody for each record and cosmetically suppressed adjacent repeated values. The new implementation uses one persistent tbody and native cell rowspans, allowing authored multi-tr records without a second renderer. Later control/status/lifecycle/detail obligations remain in the parent plan. No user-facing feature is retired, no dependency or public named type is added, and v1/master/npm publication remain untouched.[^continuation][^legacy]

# Contract before integration

```html
<table>
  <thead><tr><th>Team</th><th>Name</th><th>Detail</th></tr></thead>
  <tbody data-row-template>
    <tr>
      <td rowspan="2" data-merge="team"><span data-field="team"></span></td>
      <th scope="row"><button type="button" data-select-row><span data-field="name"></span></button></th>
      <td><label>Code <input data-field="detail.code"></label></td>
    </tr>
    <tr><td colspan="2"><label>Note <textarea data-field="detail.note"></textarea></label></td></tr>
  </tbody>
</table>
```

```ts
const grid = bindGrid(table, { rows, viewport: { root: scrollRoot, estimate: 80 }, paste: true });
// Existing selection, columns, sort/filter/page, paste, validation and disposal APIs remain.
```

- Retain exactly one existing `tr[data-row-template]`, or accept one `tbody[data-row-template]` whose direct tr children form one logical RowId block. Mixing forms, multiple template bodies, an empty body, or fixed IDs inside repeated rows fails before acquiring bindings or changing DOM.
- Every clone's physical tr maps to the same RowId. Field/error/select descriptors compile once over the complete block. Selection/checks/actions can occur in any physical row. Offscreen drafts and errors remain RowId-owned.
- A native authored rowspan cannot escape the block. Interpret source `rowspan="0"` as the remaining rows of this authored block and normalize the clone to that finite count. Preserve original template nodes, attributes, whitespace and positions on teardown. Native colspans and carried rowspans must stay consistent with column topology.
- `data-merge="path"` belongs to a direct cell in the block's first tr that spans the whole authored block. It names a safe dot-separated raw scalar or missing value. Use display-only content for merging; authored controls, focus targets, row actions and validation regions are excluded from that cell because their record ownership must remain visible.
- Merge keys follow authored cell order. A later marked cell merges only when its value and preceding merge keys match the previous projected record. Compare raw values with `Object.is`; formatting does not define identity. This explicitly distinguishes signed zero, whereas 1.x used strict equality. Missing values are permitted; arrays/objects in merge keys fail without changing DOM projection.
- Merge only consecutive logical IDs of the current sorted/filtered page that are actually mounted. Split at viewport gaps and page/window boundaries, and on both sides of any focused merge cell's record. The visible leader carries finite native rowspan; duplicate cells remain attached with owned display suppression. Never expand a window to include an entire equal-value run. Split again at the browser's finite native rowspan limit.
- Column visibility owns `hidden`; merging owns temporary rowspan/display and physical-row height floors. Before applying cross-record spans, restore previous owned state and batch-read natural row heights; preserve those heights across every covered physical row so a fully merged column cannot collapse viewport geometry. Recompute after binding/view/column/geometry changes and restore exact authored styles on release. Preserve exact focused nodes, caret/composition, source data and validation drafts through edits and layout changes.
- Paste operates on logical fields even when a repeated display cell is visually merged. Authored hidden/inert/read-only/disabled protection remains intact. Order fields by physical row, then current managed column order within that row, then authored field order within a spanning cell. A spanning column cell participates when any member is visible and uses its first visible member for logical position.
- ARIA row counts and indexes refer to physical native rows: static rows plus logical records times block size. Every physical tr in a mounted record receives its own correct index when viewport rendering is active. DOM IDs remain document-unique label/error references, separate from data keys.

# Ownership and change order

1. Recheck M10.9.1's checkpoint and relevant legacy paths. Agree the compact markup contract and independent acceptance cases.
2. Extend private column topology and viewport geometry to stable arrays of physical rows. A group measures from its first participating tr to its last, with internal border spacing included once and one external gap. Observe/release the full group; retain the focused physical node without detaching its block.
3. Add a private Grid body-structure owner for template extraction/restoration and merge declarations. Integrate whole-block binding/placement/indexing into Grid, keeping the existing single-row fast path and one shared execution flow.
4. Extend the existing interactive Grid demo with two authored block layouts and merge controls/examples. Preserve its complete earlier capability coverage.
5. Verify failure rollback, store/view operations, nested choices and drafts, logical paste, column topology, focus, accessibility, bounded DOM and teardown. Update installed JS/TS/browser consumers and measurements.
6. Freeze source/fixtures and run all required gates. Independently compare code/contracts/evidence, then stamp semantic docs and refresh affected fingerprints without recertifying historical results. Commit/push only the verified scope.

# Verification and budgets

- Meaningful focused tests cover valid/invalid templates, source restoration, carried spans/colspans, hierarchy and raw keys, split/merge after edit/order/sort/filter/page, RowId actions in every physical row, shared Form/List state, nested selects, failure drafts/errors, offscreen paste and callbacks.
- Browser checks cover two authored layouts, native physical row indexes/counts, unique IDs, focus/keyboard/reveal, hidden boundary rows, column hide/reorder/resize and repeated disposal. The same 5,000-key merge run must remain bounded by the measured window plus one focused logical block, including a one-column fixture whose cells are all merged and would otherwise collapse native row geometry.
- Keep every existing binding and single-row viewport budget unchanged. Before measurement, declare an additional 5,000-record/two-tr/merged fixture at 400px authored height, estimate 80px, overscan 3, two warmups and five samples. Maximum mounted physical data rows: 64. Median settled budgets in milliseconds: initial 35, reveal 100, scroll 120, columns 100, paste 85, move 100. The block fixture pastes 100 offscreen records, two fields each; original flat/nested fixtures retain their 1,000-record paste. Record raw samples, node bounds and cleanup; do not claim portable hardware speed, heap measurements or actual token savings.[^benchmark]
- Final gates: build, strict source types, example types, all units; complete Chromium/Firefox/WebKit suites; one inspected npm tarball installed into JS/TS and Chromium/Firefox/WebKit/Chrome/Edge; original and new performance budgets; changed/full documentation checks with zero errors. Record any warning or failed attempt honestly.
- Native OS IME/clipboard, manual assistive technology and actual Safari are not certified by synthetic browser checks; real macOS/iOS Safari stays outside scope. No npm publication or release tag.

# Verification record

M10.9.2 is implemented within this contract. Build, strict source/example types and 104 unit tests pass. Complete Chromium/Firefox/WebKit suites pass 270/270 each, including 15 row-block cases, three column-owner cases and two demo cases added in this slice. Native geometry regressions include a 5,000-record fully equal one-column table and hidden boundary tr elements; other cases cover shared Form/List identity, nested choices, raw hierarchy, cross-row validation references, protected/merged-field paste, focus/caret, source restoration and scoped accessibility.[^browser][^evidence]

JS/TS and all five Windows browser consumers pass one unpublished 158-file artifact, SHA-256 `10fb7f8ea71ee36c798c015ca179ef47962ff815a870394ddcd96e51b6f7488e`, 254,389 packed / 1,255,017 unpacked bytes. Installed block checks exercise finite source-rowspan normalization, native merging, secondary-row actions, nested raw Select paste, focused movement and exact teardown. The independent archive audit matches every member byte-for-byte to the workspace, confirms five public entries, 31 reachable runtime modules, zero runtime dependencies and eight blocked private subpaths. No jQuery, v1, vendor or unrelated utility paths enter the artifact.[^artifact-audit][^evidence]

With two warmups and five measured runs, the 5,000-record/two-tr merged fixture mounts at most 24 physical rows. Initial/reveal/scroll/columns/paste/move medians are 17.0/65.6/49.7/50.3/33.8/62.5ms, within every predeclared budget. Raw samples preserve record rectangles, physical heights, merge spans, actual viewport intersections, twenty scroll cycles, unchanged pinned drafts/caret and zero late teardown mutations. Original 5,000-row flat/nested fixtures stay at most 14 physical rows and pass all prior budgets. Original 1,000-row flat initial/rebind/edit/sort/filter medians are 15.5/18.4/0.8/2.2/1.0ms; nested-auto initial/rebind/sort/filter are 43.3/56.8/6.8/3.1ms, within unchanged limits.[^benchmark][^evidence]

Independent review corrected a preflight gap that allowed native media/frame controls to disappear inside merged cells; audio/video/iframe now fail without changing authored markup, and the broader native focus targets are excluded. The width-only documentation now distinguishes column width ownership from Grid merge/viewport geometry recalculation. A separate review matches the Grid/demo/architecture/migration bodies to implementation. Final command records preserve 31 normalized source/fixture hashes and byte-exact log hashes, including silent compiler runs, the successful pre-review Chromium run and intentionally interrupted provisional Firefox child; neither superseded run certifies the final source.[^body][^evidence]

The first block measurement fixture put a display name between its intended score/note clipboard targets. Moving that display before the score input corrects the fixture's authored row-major order; runtime, package, browser fixtures, assertions, sample counts and budgets are unchanged. Only this affected benchmark was rerun. Evidence explicitly records its old/new fingerprint and the unaffected earlier gates rather than claiming the revised benchmark was their input. The failed measurement is retained. A documentation check also caught two final-log links before their destinations were opened; opening the log sinks before checking resolves this recording-order issue, and its failed output is retained.[^benchmark][^evidence]

Work-cost observations: one private body owner keeps template/merge state separate from binding and viewport geometry. Existing field paths, column ownership, Rows, rules and Select ownership are reused. No public method/option/named type, dependency, renderer registry or generic utility is added. Agent-task speed and actual token use were not measured; the source map, declaration contracts and concise discovery docs are design choices, not measured savings.[^body][^grid]

Changed and full documentation checks pass with 55 concepts, five reserved files, zero errors and zero warnings. Nine independently reviewed changed concepts receive verified metadata; eight historical concepts receive fingerprints only, with their bodies and generated/verified dates preserved. Raw [changed](evidence/m1092-docs-changed.log) and [full](evidence/m1092-docs-full.log) outputs retain the final result.

# Checkpoint and next action

This authored-record/merge slice is complete; all remaining Grid/component and P0 semantic/dynamic obligations stay required. Prepare M10.9.3 native controls, explicit display and validation interaction contracts against 1.x before implementation. No new omission, npm publication, release tag, master or v1 change is included.

A CSS-only font/line-height shrink that leaves table and scroll-root dimensions unchanged may be masked by owned merge height floors. Natural heights are recomputed on the next normal Grid data/view/column/scroll/geometry update; no arbitrary style observer or public refresh API is added. Manual assistive technology, personal acceptance and actual OS IME/clipboard checks remain open; actual macOS/iOS Safari is excluded.[^body]

[^continuation]: Required Grid continuation and prior ordered Rows gates
[^legacy]: Historical tbody cloning and hierarchical repeated-value display
[^grid]: Grid binding, logical identities, drafts and paste
[^columns]: Authored column topology and layout ownership
[^viewport]: Measured logical-row windows and focus pinning
[^body]: Private authored record structure and native merge ownership
[^browser]: Multi-tr binding, native geometry, ownership and logical paste regressions
[^benchmark]: Original viewport budgets and declared two-tr merged measurements
[^demo]: Two authored layouts sharing nested record state
[^artifact-audit]: Independent byte-exact package and private-entry audit
[^evidence]: Final M10.9.2 source, command, artifact and measurement evidence
