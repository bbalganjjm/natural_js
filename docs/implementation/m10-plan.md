---
type: Plan
title: Natural-JS 2.x M10 advanced Grid plan
description: Draft scope and gates for advanced behavior on authored native tables without expanding Grid into a general utility library.
tags: [meta, plan, grid, m10]
status: draft
sources:
  - id: roadmap
    resource: roadmap.md
    title: 2.0 release boundary and M10 milestone
    git_blob: 2bf6a8dd16deff7de9a5f075cc1e16c85c5a3c4c
  - id: baseline
    resource: m0-baseline.md
    title: 1.x Grid intent and deferred capabilities
    git_blob: 18172dc51ce39e36e35911d9e432ff75c904bb68
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current Grid rendering, row identity, draft, and lifecycle behavior
    git_blob: 5599945bf62763fd645074c3475c8eef1a16a371
  - id: rows
    resource: ../../src/data/index.ts
    title: Rows ownership and event contract
    git_blob: 10c07414eacccc414b81afc8be5661dd21afe3c6
  - id: old-grid
    resource: ../../v1/src/natural.ui.js
    title: Preserved 1.x Grid options and implementation
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: benchmark
    resource: evidence/m9-binding-chromium.json
    title: Fixed 1,000-row Grid baseline
    git_blob: ebfa20fcf965c7a4b89361892d6d4c2d35c645bb
  - id: m10-baseline
    resource: evidence/m10-grid-baseline.json
    title: Clean 5,000-row Grid baseline
    git_blob: 9df12947b76c7446e64d10a4b11f401a64268031
  - id: m10-forward
    resource: evidence/m10-grid-comparison.json
    title: Same-process baseline then revised Grid comparison
    git_blob: 1f1472dbdc84b378a5f8b00b4faae5800968c610
  - id: m10-reverse
    resource: evidence/m10-grid-comparison-reverse.json
    title: Same-process revised then baseline Grid comparison
    git_blob: dc42e1aa633fbf25ecb3468011c7d95308757478
  - id: m10-binding
    resource: evidence/m10-binding-chromium.json
    title: Fixed 100/1,000-row Grid budget rerun
    git_blob: de8bd9fa7081081741450f894effa1affc62d0c2
generated: { by: codex/gpt-6-sol, at: 2026-09-24T23:38:53Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T23:38:54Z }
---

M10 is a later 2.x milestone, outside the first `2.0.0` feature set. This draft defines decision and implementation gates. The grouped/sticky authored-table slice, full-feature demo, and internal offscreen-record lifetime change are implemented without a new Grid API; public advanced operations remain unselected. The user has deferred npm publication until remaining work is complete and personally tested. Safari is outside the initial 2.0 browser support scope.[^roadmap]

# Goal

Add only advanced Grid behavior that a representative authored-HTML screen needs. Keep `bindGrid`, caller-owned `Rows`, store-local `RowId`, Form-reachable rules, and native table semantics. Do not carry over 1.x pixel-correction options, copied headers, duplicate DOM IDs, jQuery, or a general utility layer.[^grid][^rows][^old-grid]

# Baseline and risk

At the M10.2 audit, the basic Grid bound one authored row template, nested row-local Select choices, typed edits, validation drafts, selection, sort/filter, local paging, focus, and disposal. It stored a cloned record for every row it had displayed and rerendered on each `Rows.set` event. Large visited pages and per-cell bulk changes therefore needed an explicit memory/rendering design. The M9 1,000-row fixture is a baseline, not a large-data guarantee.[^grid][^benchmark]

The 1.x Grid exposed `height`, `fixedcol`, `resizable`, `pastiable`, `multiselect`, `more`, and check-all options. They are intent evidence, not a compatibility checklist.[^baseline][^old-grid]

# Scope selection

Before API changes, freeze one advanced reference screen, its authored table/CSS, data size, input types, keyboard path, and save behavior. If no production screen is available, extend the two-layout employee fixture and mark inferred requirements. Decide each candidate separately:

| Candidate | First owner and decision rule |
|---|---|
| Fixed header/columns and grouped headings | Prefer authored `<thead>`, `rowspan`/`colspan`, CSS `position: sticky`, and a scroll container. Add runtime only for demonstrated behavior native markup/CSS cannot meet across tested engines. Never clone a header. |
| Column resize, reorder, hide/show | Keep application-owned CSS/state by default. Add one opt-in Grid contract only if the reference screen needs consistent keyboard, pointer, and persisted column state. Do not expose generic drag/drop or layout utilities. |
| Many visible rows | Measure DOM count, old record retention, render time, and memory with the selected workload. Use paging or an internal visible-record lifetime before considering virtualization. Preserve selection, offscreen drafts, validation, and focus by `RowId`. |
| Bulk paste/edit | Implement only if the reference screen needs it. Parse and validate through existing Grid/Form rule semantics. Before coding, choose atomic failure or partial application and specify exactly what `Rows`, drafts, and subscribers observe after each failure. Current `Rows.set` notifies per cell and `Rows.replace` changes row IDs, so first prove the chosen contract fits the existing Rows API or justify one narrow mutation. No general clipboard parser. |
| Multi-selection/check-all | Add only with a defined visible-page versus filtered-store meaning and a typed selected-ID result. Preserve keyboard use and never identify rows by DOM position. |

The first implementation slice is authored fixed/grouped headers in two visually different layouts, with zero new public API if native HTML/CSS suffices. Subsequent slices need a usage example and cost justification.

The [40-row two-layout screen](../v2/advanced-grid-example.md) is the completed M10.1 structure regression: grouped and fixed headings/first column use authored HTML/CSS without a new Grid API. The user then selected an interactive demo page that can exercise every supported Grid option and behavior as the M10 reference screen. The demo must cover `rows`, `rules`, `parse`, and `onSelect`; every current Grid method and declarative marker; nested choices, row identity, validation drafts, accessibility, and Rows change tracking. It must make the observed result visible and explain unavailable advanced candidates without presenting them as working controls. Column resize/reorder/hide, bulk paste, multi-selection, and virtualization are still separate design candidates, not automatically inherited 1.x features. Add a candidate to the demo only when its implementation and tests exist.

The M10.1 two-layout acceptance checks native table semantics, no copied header or duplicate IDs, nested choices, keyboard sort and pointer selection, two-screen isolation, sticky geometry, 320 CSS-pixel reflow with enlarged text spacing, and axe-tagged A/AA results. Chromium, Firefox, and WebKit passed four focused cases each. On this Windows host Firefox required the repository-local Playwright browser cache; the default cache failed at process launch (`spawn UNKNOWN`) even with one worker. Automated checks do not establish manual screen-reader conformance.

A read-only M10.2 audit found that `bindGrid` initially renders every row and retained each visited row's cloned DOM and Select after paging or filtering hid it. The internal change now releases offscreen records after DOM order and focus settle, and stores validation message text by `RowId` without element references for restoration when a row returns. Continuously visible rows still reuse their clones. External `Rows.set` clears stale errors without invoking user validators. Initial full-render peak cost remains until a separately reviewed initial-page contract exists.

M10.2 workload: 5,000 rows, 10 fields, local pages of 50, and a 1→100→1 traversal (198 transitions), with two warm-ups and five measured runs. The clean `e1844c2e` [baseline](evidence/m10-grid-baseline.json) on this host had median initial bind 85.2 ms, first page 32.0 ms, traversal 93.6 ms, and 105,238 retained DOM nodes after forced GC. Its Rows-only and post-traversal heaps were about 6.0 and 8.9 MB. Acceptance limits are initial bind ≤110 ms, first page ≤45 ms, traversal ≤150 ms, and retained DOM nodes ≤3,000, alongside the existing 1,000-row budgets. These limits were set after work had started and after one exploratory changed-runtime measurement, so they are an acceptance criterion for the final rerun, not a blind preimplementation benchmark. Report measured heap as diagnostic, with process and GC caveats.

The [same-process forward comparison](evidence/m10-grid-comparison.json) measured baseline → changed medians of 70.9 → 87.2 ms bind, 31.7 → 33.4 ms first page, and 93.9 → 121.6 ms for 198 transitions. The [reverse-order comparison](evidence/m10-grid-comparison-reverse.json) measured changed → baseline as 85.6 → 85.5 ms bind, 32.4 → 32.0 ms first page, and 119.4 → 93.5 ms for the traversal. After the traversal, forced-GC DOM nodes fell from 105,238 to 1,288 and diagnostic JS heap from about 8.9 to 4.4 MB. The revised Grid meets the acceptance limits in both orders, though its traversal is about 27–30% slower and initial binding still creates 105,238 nodes before paging. Same-process serial runs control browser version but do not remove JIT, run-order, or system-load effects. The script records source SHA-256 and fails if the Grid changes during measurement; rerun after any further runtime edit.[^m10-baseline][^m10-forward][^m10-reverse]

The fixed [100/1,000-row rerun](evidence/m10-binding-chromium.json) stayed inside every recorded M6 budget: at 1,000 rows, flat initial/rebind/edit/sort/filter medians were 13.1/14.7/0.7/2.7/1.8 ms and nested-auto medians were 37.2/43.6/1.1/7.4/4.9 ms. Its legacy 1.x comparison remains an architecture-level fixture, not an isolated algorithm score.[^m10-binding]

The current unpublished local tarball has SHA-256 `3a6b8f030fda3443943befeb47aad3fa279b9f57e96755e5ae4ab0072286a111`. Installed JavaScript and TypeScript consumers passed, as did its browser-served CVC/Form/Grid consumer in Chromium, Firefox, and WebKit against that exact SHA. The 98-file dry-run package contains no `v1/`, jQuery, `docs/`, or demo files. This is a package-scope check for the current internal change; no npm publication or release tag occurred.

# Contract gates

- Show the reference HTML and TypeScript before implementation. Assign each behavior to framework, application, or native browser.
- Preserve simple `bindGrid` and `Rows` behavior. Publish a new option/type only when an application must call it; keep geometry, parsing, and caching helpers private.
- Keep raw/display values separate and use existing `parse`/`rules` semantics. Application-specific comparison, formatting, and validation stay with the caller.
- Preserve document-unique label/ARIA IDs and stable `RowId` through sort, filter, page, hidden columns, paste, and any viewport window. No copied header or display-index identity.
- Define errors, rollback, repeated bind/dispose, and focus behavior for each new operation.

# Work sequence

| Stage | Work | Exit evidence |
|---|---|---|
| M10.0 Requirement fixture | Audit 1.x intent, choose one advanced screen/workload, classify candidates above, settle HTML/TS examples and budgets. | Approved scope, exclusions, reference screen, concrete acceptance cases, and any bulk-operation visibility/rollback contract. |
| M10.1 Authored structure | Test grouped headings, sticky header/columns, horizontal overflow, sort controls, and two MDI instances in two authored layouts. Prefer CSS-only behavior. | No duplicate IDs or broken header associations; keyboard/focus works at desktop and 320 CSS pixels in Chromium, Firefox, WebKit; no unjustified public API. |
| M10.2 Rendering lifetime | Measure and, if needed, bound cached records and update affected visible rows. Retain drafts/selection by `RowId` across page/window changes. | Fixed 1,000-row budgets do not regress; selected larger fixture meets documented render/memory acceptance limits; repeated mounts release records/listeners. |
| M10.3 Selected operation | Review the proposed bounded initial page first; implement it only if its public contract is approved. Column state, bulk edit, and multi-selection still need a concrete caller. | Typed consumer example; initial/empty/invalid page, offscreen identity/drafts, focus and disposal; no business rules in Grid. |
| M10.4 Agent/package review | Independent agent adds a small advanced screen from docs only. Prune needless API/file splits; install one SHA-gated artifact in JS, TS, and a browser-served consumer with the chosen new Grid behavior. | First-pass result or correction record, source/doc agreement, package scope audit, same-hash installed-browser result, and changed/full OKF checks with zero errors. |

# Validation and exclusions

Run build, typecheck, focused unit checks for non-DOM invariants, and real-browser tests on authored tables. Check keyboard-only use, header semantics and association, sort/column state announcements, focus visibility, text spacing, narrow layout, and MDI duplicate IDs. If resize/reorder is selected, include manual screen-reader and keyboard review or record its absence as an unverified gate. Browser engines are Chromium, Firefox, and WebKit; installed Chrome/Edge smokes use the selected package. WebKit is not labeled Safari, and automated axe results alone do not establish WCAG conformance.

Measure the existing flat/nested 100- and 1,000-row fixtures before and after rendering changes. Set any larger workload and budget in M10.0, rather than inventing a universal speed claim. Record agent first-pass correctness, files/bytes read, changed scope, elapsed time, and actual tokens only if available.

Update `docs/v2/grid.md`, examples, indexes, `docs/log.md`, and this plan with each slice. Keep `npm run docs:check -- --changed` at zero errors and independent `verified` fields honest. Do not recreate 1.x option names, copy the old Grid, add a generic table/clipboard library, alter the M9 beta artifact, or pull M11/M12 into M10.

The user approved M10 and chose the [full-feature Grid demo](../v2/grid-demo.md) as its reference screen. The demo and internal M10.2 rendering-lifetime change now pass focused Grid and three-engine demo checks with the public Grid and Rows contracts unchanged. The Grid source was also independently reviewed for clone, issue, selection, focus, and Select ownership behavior. Revisit scope before adding a new public option, Rows mutation contract, or 1.x-style advanced operation. Manual assistive-technology checks remain open; use the repository-local cache for repeat Firefox runs on this host.

# Next proposal: bounded initial Grid page

The measured remaining peak comes from `bindGrid` rendering every row before its caller can call `setPage`. M10.3 proposes one opt-in constructor option using the already public `PageRequest` shape:[^grid][^m10-forward]

```ts
const grid = bindGrid(table, {
  rows,
  initialPage: { page: 1, size: 50 }
});
```

The proposed option would apply the same positive-safe-integer validation, last-page clamping, and `GRID_PAGE` error as `setPage` before the first render. `page()` would report that state as soon as binding returns. Only the requested visible rows would get clones, Select ownership, and generated error IDs; all `Rows` entries would keep their identities and remain available to `select(id)` and `validate(id)`. Later `setPage` calls, including `setPage(null)`, would keep their current meaning. Omitting `initialPage` would preserve the present all-rows initial view. A malformed request must fail before the authored template or listeners are changed; use one Grid-private request validator for construction and `setPage`, without adding a shared utility. An off-page row's option or formatter error may become visible only when that row is displayed or validated, rather than during binding, and this timing change must be documented and tested. The request is copied at bind time so later caller mutation cannot change page state.

Acceptance would add a second 5,000-row benchmark mode requiring at most 1,500 post-bind DOM nodes and ≤30 ms median bind on the reference host with a 50-row initial page, while retaining the existing no-option and 1,000-row budgets. Focused tests would cover page bounds, empty Rows, off-page validation/selection and delayed errors, nested choices, unique IDs in two MDI screens, Rows mutation/clamping, `setPage(null)`, disposal/rebind, and invalid-option atomicity in Chromium, Firefox, and WebKit. The interactive demo would then expose the new option before rebind so it continues to exercise every implemented Grid option. No List option, column engine, virtualization, bulk edit, or generic data utility is included. This is a public contract proposal and awaits user review before implementation.

# Related

- [Roadmap](roadmap.md)
- [Current Grid contract](../v2/grid.md)
- [Active plan](current.md)

[^roadmap]: 2.0 release boundary and M10 milestone
[^baseline]: 1.x Grid intent and deferred capabilities
[^grid]: Current Grid behavior
[^rows]: Rows ownership and event contract
[^old-grid]: Preserved 1.x Grid implementation
[^benchmark]: Fixed M9 Grid baseline
[^m10-baseline]: Clean 5,000-row Grid baseline
[^m10-forward]: Forward same-process 5,000-row comparison
[^m10-reverse]: Reverse same-process 5,000-row comparison
[^m10-binding]: Fixed 100/1,000-row budget rerun
