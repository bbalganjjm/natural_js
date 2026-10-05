---
type: Plan
title: Natural-JS 2.0 M10.5 column implementation
description: Column state, authored table topology, accessible resizing, and restoration gates for M10.5.
tags: [meta, plan, grid, columns]
status: draft
sources:
  - id: parity
    resource: feature-parity-plan.md
    title: Required full framework and Grid scope
    git_blob: 2512abdf8fd2bfbaa2370df7892a2bcf2bd2b37a
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid field ownership and row lifetime
    git_blob: d606737eaa4d51860407c50b4d3ba2f378739ed3
  - id: columns
    resource: ../../src/ui/grid-columns.ts
    title: Private native column topology and resize ownership
    git_blob: 320875af9ad09ea42e98898a1f745b3cec69d652
  - id: dom-state
    resource: ../../src/ui/dom-state.ts
    title: Shared restoration and available-control focus
    git_blob: 885c8d0cf0c6914d73bbbb71a0fb6aab3b35f6d3
  - id: browser
    resource: ../../tests/browser/grid-columns.spec.ts
    title: Column state, resize, failure and lifetime regressions
    git_blob: d36cd2d5df6ed96b280f7fa8eb560ad3ef94fc72
  - id: example
    resource: ../../examples/vite/m10/columns.ts
    title: Two independent column CVC instances
    git_blob: 258c4e7a7ec55304a826ea7fe2059e5d82d43ea4
  - id: evidence
    resource: evidence/m10-columns-verification.json
    title: Final column source, logs, package and measurement record
    git_blob: 320fc10dc679b181f5c574f1f0cb88935250a1d2
  - id: workload
    resource: ../../tools/benchmark-m10-columns.mjs
    title: Reproducible authored column workload
    git_blob: 6aca59f69d6fd487b53b2d8272acafabbf61e216
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public Grid handle and column state
    git_blob: 98601f6d9ce1b487dd52c81dad860b465b71e8c0
  - id: tables
    resource: https://www.w3.org/WAI/tutorials/tables/irregular/
    title: WAI grouped header and native column associations
  - id: html
    resource: https://html.spec.whatwg.org/multipage/tables.html#the-colgroup-element
    title: Native column group model
generated: { by: codex/gpt-6, at: 2026-10-05T11:42:46Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T11:43:54Z }
---

The user authorized continuation of required feature completion on 2026-10-05. M10.5 implements column resize/reorder/show/hide within that scope; full legacy coverage and the single omission review remain separate open work.[^parity]

# Goal

Add one consistent column-state contract while preserving authored HTML/CSS, native header associations, nested bindings, stable rows/drafts, accessibility and efficient incremental work. Do not add generic drag, layout or persistence libraries.

# Checkpoint

Baseline 1de143f has the required-scope plan and selected previous implementation evidence. Existing Grid compiles field indices from the original row template; column movement must happen after those node references are captured. Row creation/disposal must register/release private column ownership. No-column markup keeps the existing behavior and performance path.[^grid]

# Steps

## Public contract and representative usage

```ts
interface GridColumn {
  readonly key: string;
  readonly width?: number;
  readonly hidden?: boolean;
}

const grid = bindGrid(table, {
  rows,
  columns: [{ key: "name" }, { key: "team", width: 180 }],
  onColumnsChange({ columns, event }) { /* app status/persistence */ }
});
grid.columns(); // Immutable copied state in display order.
grid.setColumns([{ key: "team", width: 200 }, { key: "name" }]);
```

```html
<table>
  <thead><tr>
    <th scope="col" data-column="name">Name</th>
    <th scope="col" data-column="team">Team
      <button type="button" data-resize-column="team"
        aria-label="Resize Team column">Resize</button>
    </th>
  </tr></thead>
  <tbody><tr data-row-template>
    <td data-column="name" data-field="name"></td>
    <td data-column="team" data-field="profile.team"></td>
  </tr></tbody>
</table>
```

This is the implemented stage contract; completed gates are recorded below. Column key, data-field path and label/ARIA DOM ID are distinct. Presence of template data-column markers or the columns option enables management. Every direct template cell has one unique key and colspan 1. Header/footer/static cells use data-column or data-columns="team shift" for an explicit group. Existing rowspan remains. Column state contains every key exactly once, positive finite preferred CSS-pixel widths and optional booleans; at least one column remains visible. Omitted width restores the authored preference and omitted hidden means visible. No markup/option yields columns()=[]; a nonempty state requires column markup.[^entry]

Widths are native CSS preferences, subject to table layout/minimum-content constraints. Applications choose CSS/table layout and persist serialized state. Full-state replacement avoids separate resize/move/hide APIs. Group members must remain contiguous in state order, including hidden keys, so grouped headers and authored colgroups retain meaningful associations. Flat tables allow arbitrary key order; grouped tables allow within-group order and whole-group movement. Invalid state/markup fails before mutating DOM or state. Callback errors propagate after the successful committed state; initial binding/no-op/disposal emits no change callback.

A scope="colgroup" cell must match an authored native colgroup membership. Missing implicit columns get separate private native groups so no invented group constrains order. Native header nodes are moved, never copied. Hidden cells/cols and empty groups leave the connected native topology, retaining their original nodes in compiled plans for show/restoration. Visible group colspan matches visible membership. Native colgroups span/children/order/style are owned/restored exactly. Header semantics follow the WAI guidance and HTML column model; browser/axe tests cannot certify manual assistive-technology use.[^tables][^html]

## Implementation order

1. Inspect existing Grid field mapping, Select claims, sort indicators, drafts and cleanup; independently compare previous evidence without recertifying it.
2. Add GridColumn plus columns/setColumns and the two binder options. Implement private grid-columns.ts because table topology/geometry is a distinct Grid responsibility. Do not turn it into a public utility or alternative UI runtime.
3. Validate/compile static/template topology once. Connect cloned rows only after field references are mapped, and release topology with offscreen/removal/failure/disposal. Preserve original repeated template.
4. Pointer resize previews DOM with one completed notification; cancellation/Escape restores prior state. Native resize buttons support ArrowLeft/ArrowRight (10px; Shift 1px) and Home reset. Keep focus/caret after moves; hiding focused content chooses an available connected control or owned temporary table focus. Restore any owned attributes/listeners/capture.
5. Extend the full Grid demo and add a second CVC layout fixture with grouped headers/footer, span/native cols, two independent instances and state/result controls. Test real failure/recovery rather than inactive controls.
6. Measure layout-only work and avoid traversing rows for width-only updates; preserve topology/focus work for order or visibility changes. Recheck source/build/types/unit, relevant and full three-engine browser gates, existing binding budgets, exact-tarball JS/TS and five-browser consumer checks. Update actual API/demo/migration/index/log and source fingerprints; obtain independent source/doc review before verified stamps.

# Next action

M10.5 is complete within its column contract. Prepare M10.6 multiple selection, independent row checks and sort/filter controls using the remaining legacy mappings; keep its detailed public contract and common-code responsibilities reviewable before code. Continue P0 dynamic/semantic closure and prepare the one consolidated omission proposal. No feature omission or publication.

# Decisions

- This is the approved column stage. Multiple selection/checks/filter UI, paste, true virtualization, grouped body records and other Grid gaps remain required subsequent stages; this stage does not close all G14 legacy options/callbacks automatically.
- Existing no-column Grid behavior remains; shared Rows/control batch changes are not needed for column state and remain separately planned dependencies for later consumers.
- Compile topology once and touch connected row/column nodes on state changes; never rebind data, replace RowIds or notify Rows for layout-only changes.
- Preserve v1/master, current package version and publication deferral. Push approved development work only to 2.0.0-alpha.0.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-10-05 | Prior checkpoint | 1de143f has no substantive pending tracked diff; previous selected scopes and immutable evidence remain unchanged. |
| 2026-10-05 | Contract preparation | Column state/topology and lifetime were specified before implementation. User-approved required scope; no retirement decision. |
| 2026-10-05 | Runtime and independent findings | Native groups/implicit leaf cols, unchanged template, row lifetime, hidden sorting, pointer/keyboard state, sparse input, cancellation/no-op previews, callback failure commit, hidden/inert/CSS focus and lazy CSSOM restoration pass. Width-only updates mutate no row topology or attributes. Constructor null state is rejected consistently with state replacement; the atomic retry test covers JavaScript callers. |
| 2026-10-05 | Build and browser gates | Build, strict package/browser-controller types and 81 unit tests pass. Fifteen new column cases join the full 182/182 suite in each of Chromium, Firefox and WebKit; source fixtures exclude Vite reloads. |
| 2026-10-05 | Installed artifact | Final 133-file tarball is 201,921 bytes (988,028 unpacked), SHA-256 0a43e4e97e295e1d7ee1ab3188008c613cf9607327970f93c5beda4b461c7f2e. Installed JS/TS and Chromium/Firefox/WebKit/Chrome/Edge consumers pass on the same artifact. Five entries, no runtime dependency/legacy/convenience bundle; no publication. |
| 2026-10-05 | Existing binding budgets | Same-host 1,000-row flat initial/rebind/edit/sort/filter medians 13.0/16.6/0.7/2.6/1.9ms; nested-auto initial/rebind/sort/filter 38.6/50.7/10.0/7.0ms. Every M6 budget passes. |
| 2026-10-05 | Column workload | Two warm-ups/five runs, 10 columns at 100/1,000 rendered rows, zero Rows notifications/duplicate IDs. Before width-only optimization, 1,000-row width median was 14ms; final observation about 0.1ms at browser timing resolution. Full 1,000-row initial/reverse/hide medians remain 26.8/124.4/68.3ms; topology and native geometry cost persists. No paint fence/universal multiplier/virtualization claim. |
| 2026-10-05 | Audit and cost limits | Separate source/doc reviewers found and rechecked concrete failures. The first review scope totals 256,833 file bytes (not actual bytes read/tokens); a later docs-first review read eight files totaling 120,475 file bytes before source. No fixed agent task rerun or actual token savings measured. Raw logs/source hashes and harness corrections stay in the verification record.[^evidence][^workload] |

# Open questions

No stage-blocking issue remains in the tested column contract. Manual assistive-technology review and actual token telemetry remain open. P0 dynamic/semantic closure and the consolidated omission proposal remain open; full required framework behavior is incomplete.

[^parity]: Required full framework and Grid scope
[^grid]: Grid field ownership and row lifetime
[^columns]: Private native column topology and resize ownership
[^dom-state]: Shared restoration and available-control focus
[^browser]: Column state, resize, failure and lifetime regressions
[^example]: Two independent column CVC instances
[^evidence]: Final column source, logs, package and measurement record
[^workload]: Reproducible authored column workload
[^entry]: Public Grid handle and column state
[^tables]: WAI grouped header and native column associations
[^html]: Native column group model
