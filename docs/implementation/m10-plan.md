---
type: Plan
title: Natural-JS 2.0 M10 advanced Grid parity plan
description: Required Grid feature parity and release gates on authored native tables, with historical implementation and measurement records.
tags: [meta, plan, grid, m10]
status: draft
sources:
  - id: roadmap
    resource: roadmap.md
    title: 2.0 release boundary and M10 milestone
    git_blob: b99c9a254693cebb6886a114e0dc775957b3d80e
  - id: baseline
    resource: m0-baseline.md
    title: 1.x Grid intent and deferred capabilities
    git_blob: 18172dc51ce39e36e35911d9e432ff75c904bb68
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current Grid rendering, row identity, draft, and lifecycle behavior
    git_blob: b277c2b22e728630836eedcbc4fd998ddb4f5e5c
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
  - id: m10-initial
    resource: evidence/m10-initial-page-chromium.json
    title: M10.3 5,000-row bounded first-render measurement
    git_blob: 16c42eb3d75655853b182375f8414f81eba730d5
  - id: m10-no-initial
    resource: evidence/m10-no-initial-page-chromium.json
    title: M10.3 same-source default first-render measurement
    git_blob: 52cf73692441bd5948366d967908a948d134dc30
  - id: m10-initial-binding
    resource: evidence/m10-initial-page-binding-chromium.json
    title: M10.3 fixed 100/1,000-row budget rerun
    git_blob: 0dbd24366a169afaab3533dca27c2e2cfb201c0f
  - id: agent-screen
    resource: ../../tests/browser/m10-agent-screen.spec.ts
    title: M10.4 docs-first authored Grid task
    git_blob: 94fd90af72248bfabf0cef988fb9b35660f4b58f
generated: { by: codex/gpt-6, at: 2026-10-05T09:50:34Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-25T01:11:51Z }
  - { by: codex/gpt-6, at: 2026-10-05T09:50:34Z }
---

M10 now includes required work for the `2.0.0` release. The grouped/sticky authored-table slice, current-contract demo, internal offscreen-record lifetime change, and opt-in bounded initial page are implemented. Column resize/reorder/hide/show, multiple row selection, bulk paste, and real scroll virtualization remain unimplemented and must be completed before release. The [feature parity ledger](feature-parity.md) and [feature parity implementation plan](feature-parity-plan.md) define the wider requirement to preserve 1.x user features. The user has deferred npm publication until remaining work is complete and personally tested. Real Safari on macOS or iOS is outside the initial 2.0 browser support scope; Playwright WebKit remains required on this Windows host.

M10.0–M10.4 below record the earlier selected scope and its measurements. Earlier decisions to leave advanced operations optional, unselected, or for a later 2.x milestone are historical decisions, not the current release policy. These records do not establish completion of the expanded M10 requirement.

# Goal

Preserve the 1.x Grid's user features and implement the explicitly required advanced operations before `2.0.0`. Keep `bindGrid`, caller-owned `Rows`, store-local `RowId`, Form-reachable rules, and native table semantics. Legacy pixel corrections, copied headers, duplicate DOM IDs, and jQuery are implementation mechanisms to replace; replacing them does not authorize dropping their user-visible behavior. Any proposal to omit an obsolete or structurally unnecessary user feature must appear in one consolidated human approval request, as defined by the [parity plan](feature-parity-plan.md). Keep geometry and other internal helpers private rather than adding a general utility layer.[^grid][^rows][^old-grid]

# Baseline and risk

At the M10.2 audit, the basic Grid bound one authored row template, nested row-local Select choices, typed edits, validation drafts, selection, sort/filter, local paging, focus, and disposal. It stored a cloned record for every row it had displayed and rerendered on each `Rows.set` event. Large visited pages and per-cell bulk changes therefore needed an explicit memory/rendering design. The M9 1,000-row fixture is a baseline, not a large-data guarantee.[^grid][^benchmark]

The 1.x Grid exposed `height`, `fixedcol`, `resizable`, `pastiable`, `multiselect`, `more`, and check-all options. Audit their user behavior against the [parity ledger](feature-parity.md); preserving those behaviors does not require copying legacy option names or mechanisms.[^baseline][^old-grid]

# Required scope and contract review

Before implementation or API changes, present the detailed stage contract for human review: reference HTML/TypeScript, ownership, data size, input types, keyboard path, save behavior, errors, rollback, and acceptance cases. Use the interactive demo and two-layout employee fixture as concrete callers. A missing production screen does not defer a required feature. The following requirements remain to be implemented:

| Requirement | Implementation and contract boundary |
|---|---|
| Fixed header/columns and grouped structure | Preserve the authored `<thead>`, `rowspan`/`colspan`, sticky positioning, and scroll-container behavior already demonstrated. Close remaining body/footer and column/viewport integration gaps from the ledger. Never clone a header. |
| Column resize, reorder, hide/show | Required before release. Review one coherent column-state contract with stable column identity, keyboard and pointer controls, grouped cells, hidden columns, and persistence ownership. Do not expose generic drag/drop or layout utilities. |
| Real scroll virtualization | Required before release. Render a bounded viewport window while scrolling through the full view; local paging and offscreen-record release alone do not meet this requirement. Measure DOM count, render time, and memory; preserve selection, offscreen drafts, validation, and focus by `RowId`. |
| Atomic bulk paste | Required before release. Parse and validate through existing Grid/Form rules before committing the whole paste. Define what Rows, drafts, and subscribers observe on success and failure. Current `Rows.set` notifies per cell and `Rows.replace` changes IDs, so review whether one narrow Rows mutation contract is needed. Keep clipboard matrix parsing private. |
| Multiple selection/check-all and filters | Required before release. Define visible-page versus filtered-store selection, typed selected-ID results, check-all/single-check semantics, and value-filter controls. Preserve keyboard use and never identify rows by DOM position. |
| Remaining Grid parity | Account for every remaining ledger gap, including row groups, move/copy/placement, field controls/rendering, status display, detail navigation, value merging, lifecycle hooks, empty display, and scroll actions. Any omission needs the consolidated human decision. |

The earlier M10.1 implementation slice covered authored fixed/grouped headers in two layouts without a new public API. Each required follow-up slice needs a reviewed usage example, implementation contract, and acceptance evidence.

The [40-row two-layout screen](../v2/advanced-grid-example.md) is the completed M10.1 structure regression: grouped and fixed headings/first column use authored HTML/CSS without a new Grid API. The user then selected an interactive demo page that exercises every currently supported Grid option and behavior as the M10 reference screen. The demo covers `rows`, `initialPage`, `rules`, `parse`, and `onSelect`; every current Grid method and declarative marker; nested choices, row identity, validation drafts, accessibility, and Rows change tracking. It must show the observed result and label required but unimplemented features as unavailable. Extend this same demo for column resize/reorder/hide/show, multiple selection, atomic bulk paste, real virtualization, and remaining parity as their implementations and tests become available.

The M10.1 two-layout acceptance checks native table semantics, no copied header or duplicate IDs, nested choices, keyboard sort and pointer selection, two-screen isolation, sticky geometry, 320 CSS-pixel reflow with enlarged text spacing, and axe-tagged A/AA results. Chromium, Firefox, and WebKit passed four focused cases each. On this Windows host Firefox required the repository-local Playwright browser cache; the default cache failed at process launch (`spawn UNKNOWN`) even with one worker. Automated checks do not establish manual screen-reader conformance.

A read-only M10.2 audit found that `bindGrid` initially renders every row and retained each visited row's cloned DOM and Select after paging or filtering hid it. The internal change now releases offscreen records after DOM order and focus settle, and stores validation message text by `RowId` without element references for restoration when a row returns. Continuously visible rows still reuse their clones. External `Rows.set` clears stale errors without invoking user validators. Initial full-render peak cost remains until a separately reviewed initial-page contract exists.

M10.2 workload: 5,000 rows, 10 fields, local pages of 50, and a 1→100→1 traversal (198 transitions), with two warm-ups and five measured runs. The clean `e1844c2e` [baseline](evidence/m10-grid-baseline.json) on this host had median initial bind 85.2 ms, first page 32.0 ms, traversal 93.6 ms, and 105,238 retained DOM nodes after forced GC. Its Rows-only and post-traversal heaps were about 6.0 and 8.9 MB. Acceptance limits are initial bind ≤110 ms, first page ≤45 ms, traversal ≤150 ms, and retained DOM nodes ≤3,000, alongside the existing 1,000-row budgets. These limits were set after work had started and after one exploratory changed-runtime measurement, so they are an acceptance criterion for the final rerun, not a blind preimplementation benchmark. Report measured heap as diagnostic, with process and GC caveats.

The [same-process forward comparison](evidence/m10-grid-comparison.json) measured baseline → changed medians of 70.9 → 87.2 ms bind, 31.7 → 33.4 ms first page, and 93.9 → 121.6 ms for 198 transitions. The [reverse-order comparison](evidence/m10-grid-comparison-reverse.json) measured changed → baseline as 85.6 → 85.5 ms bind, 32.4 → 32.0 ms first page, and 119.4 → 93.5 ms for the traversal. After the traversal, forced-GC DOM nodes fell from 105,238 to 1,288 and diagnostic JS heap from about 8.9 to 4.4 MB. The revised Grid meets the acceptance limits in both orders, though its traversal is about 27–30% slower and initial binding still creates 105,238 nodes before paging. Same-process serial runs control browser version but do not remove JIT, run-order, or system-load effects. The script records source SHA-256 and fails if the Grid changes during measurement; rerun after any further runtime edit.[^m10-baseline][^m10-forward][^m10-reverse]

The fixed [100/1,000-row rerun](evidence/m10-binding-chromium.json) stayed inside every recorded M6 budget: at 1,000 rows, flat initial/rebind/edit/sort/filter medians were 13.1/14.7/0.7/2.7/1.8 ms and nested-auto medians were 37.2/43.6/1.1/7.4/4.9 ms. Its legacy 1.x comparison remains an architecture-level fixture, not an isolated algorithm score.[^m10-binding]

The M10.2 unpublished local tarball had SHA-256 `3a6b8f030fda3443943befeb47aad3fa279b9f57e96755e5ae4ab0072286a111`. Installed JavaScript and TypeScript consumers and its browser-served CVC/Form/Grid consumer passed against that exact artifact in Chromium, Firefox, and WebKit. The M10.3 artifact and its same-hash consumer results are recorded below. No npm publication or release tag occurred.

# Contract gates

- Show the reference HTML and TypeScript before implementation. Assign each behavior to framework, application, or native browser.
- Preserve simple `bindGrid` and `Rows` behavior. Publish a new option/type only when an application must call it; keep geometry, parsing, and caching helpers private.
- Keep raw/display values separate and use existing `parse`/`rules` semantics. Application-specific comparison, formatting, and validation stay with the caller.
- Preserve document-unique label/ARIA IDs and stable `RowId` through sort, filter, page, hidden columns, paste, and any viewport window. No copied header or display-index identity.
- Define errors, rollback, repeated bind/dispose, and focus behavior for each new operation.
- Review the detailed contract for M10.5 before runtime implementation, then apply the same contract review to subsequent stages. Track all gaps and any proposed omissions in the parity ledger; stage review does not itself approve dropping a user feature.

# Work sequence

| Stage | Work | Exit evidence |
|---|---|---|
| M10.0 Requirement fixture | Historical initial scope: audit 1.x intent, choose one advanced screen/workload, classify candidates, settle HTML/TS examples and budgets. | Initial approved scope, reference screen, concrete acceptance cases, and any bulk-operation visibility/rollback contract; superseded by the expanded parity requirement where narrower. |
| M10.1 Authored structure | Test grouped headings, sticky header/columns, horizontal overflow, sort controls, and two MDI instances in two authored layouts. Prefer CSS-only behavior. | No duplicate IDs or broken header associations; keyboard/focus works at desktop and 320 CSS pixels in Chromium, Firefox, WebKit; no unjustified public API. |
| M10.2 Rendering lifetime | Measure and, if needed, bound cached records and update affected visible rows. Retain drafts/selection by `RowId` across page/window changes. | Fixed 1,000-row budgets do not regress; selected larger fixture meets documented render/memory acceptance limits; repeated mounts release records/listeners. |
| M10.3 Bounded initial page | Implemented the approved opt-in first local page. The initial scope deferred column state, bulk edit, and multi-selection; required follow-up stages now cover them. | Typed consumer; initial/empty/invalid page, offscreen identity/drafts, focus, failure rollback, disposal, and binding budgets; no business rules in Grid. |
| M10.4 Agent/package review | Independent agent adds a small advanced screen from docs only. Prune needless API/file splits; install one SHA-gated artifact in JS, TS, and a browser-served consumer with the chosen new Grid behavior. | First-pass result or correction record, source/doc agreement, package scope audit, same-hash installed-browser result, and changed/full OKF checks with zero errors. |
| M10.5 Column state | Required, unimplemented: review then implement column resize/reorder/hide/show with grouped cells, stable IDs, and keyboard/pointer controls. | Reviewed contract; focus/header semantics, layout restoration, two-screen isolation, disposal, and demo/browser evidence. |
| M10.6 Selection/check/filter | Required, unimplemented: multiple selection, check-all/single-check and value-filter behavior with explicit view/store scope. | Stable selected/checked IDs across sort/filter/page/window changes, keyboard behavior, cancellation/error cases, and demo/browser evidence. |
| M10.7 Atomic bulk paste | Required, unimplemented: validate the complete clipboard matrix, then publish one atomic result without changing row IDs. Review any necessary narrow Rows mutation first. | Success/failure store, draft and subscriber invariants; typed/nested values, readonly/disabled/hidden columns, offscreen rows, and demo/browser evidence. |
| M10.8 Virtualization | Required, unimplemented: a real bounded viewport window over the scrolling view, integrated with column state, editing, selection, and paging. | Reviewed workload/budgets; bounded DOM, scroll/focus/identity/draft/validation behavior, repeated lifetime checks, and demo/browser evidence. |
| M10.9 Remaining Grid parity | Required, unimplemented: close every remaining Grid ledger gap or obtain the single consolidated human approval for proposed omissions. | Completed parity ledger, documented supported behavior, expanded demo, full browser checks, and same-artifact consumers before release. |

# Validation and exclusions

Run build, typecheck, focused unit checks for non-DOM invariants, and real-browser tests on authored tables. Check keyboard-only use, header semantics and association, sort/column state announcements, focus visibility, text spacing, narrow layout, and MDI duplicate IDs. Required resize/reorder behavior needs manual screen-reader and keyboard review, or an explicit record that this gate remains unverified. Current browser checks include Playwright Chromium, Firefox, and WebKit plus installed Chrome and Edge on this Windows host. Only real Safari on macOS or iOS is unavailable; a WebKit pass does not claim Safari vendor coverage. Automated axe results alone do not establish WCAG conformance.

Measure the existing flat/nested 100- and 1,000-row fixtures before and after rendering changes. Set any larger workload and budget in M10.0, rather than inventing a universal speed claim. Record agent first-pass correctness, files/bytes read, changed scope, elapsed time, and actual tokens only if available.

Update `docs/v2/grid.md`, the interactive demo and its documentation, the parity ledger, examples, indexes, `docs/log.md`, and this plan with each slice. Keep `npm run docs:check -- --changed` at zero errors and independent `verified` fields honest. Preserve user features without requiring identical 1.x option names or copied implementation. Keep table/clipboard helpers private, preserve the M9 beta artifact, and coordinate other component parity through the [parity plan](feature-parity-plan.md).

Under the earlier selected scope, the user approved M10 and chose the [current-contract Grid demo](../v2/grid-demo.md) as its reference screen. The demo and internal M10.2 rendering-lifetime change passed focused Grid and three-engine demo checks without changing public contracts. M10.3 then added only the `initialPage` Grid option, reusing the existing `PageRequest` type. The Grid source was also independently reviewed for clone, issue, selection, focus, and Select ownership behavior. The current expanded requirement adds mandatory M10.5–M10.9 work; review each stage's contract before adding a public option or Rows mutation. Manual assistive-technology checks remain open; use the repository-local cache for repeat Firefox runs on this host.

# M10.3 contract: bounded initial Grid page

The measured M10.2 initial peak came from `bindGrid` rendering every row before its caller could call `setPage`. The user approved one opt-in constructor option using the already public `PageRequest` shape:[^grid][^m10-forward]

```ts
const grid = bindGrid(table, {
  rows,
  initialPage: { page: 1, size: 50 }
});
```

The implemented option applies the same positive-safe-integer validation, last-page clamping, and `GRID_PAGE` error as `setPage` before the first render. `page()` reports that state as soon as binding returns. Only visible rows get clones, Select ownership, and generated error IDs; all `Rows` entries keep their identities and remain available to `select(id)` and `validate(id)`. Later `setPage` calls, including `setPage(null)`, retain their meaning. Omitting `initialPage` preserves the all-rows first view. A malformed request fails before the authored template or listeners change. One Grid-private validator serves construction and `setPage`, without a shared utility. An off-page formatter error surfaces on its first render; a row-local option error surfaces on render or `validate(id)`. If a later page fails while rendering, `setPage` keeps the prior page state and visible DOM and releases newly created row and Select resources so the caller can correct the data and retry. The request is copied at bind time so later caller mutation cannot change page state.

The reference-host acceptance requires at most 1,500 post-bind DOM nodes and ≤30 ms median bind for 5,000 rows × 10 fields with a 50-row initial page, while preserving no-option and fixed 100/1,000-row budgets. The recovered same-source Chromium 153 rerun used two warm-ups and five fresh-page samples. With `initialPage`, median bind was 3.0 ms and forced-GC post-bind DOM count was 1,347; without it, 96.2 ms and 105,297 nodes. The 198-transition round trip was 147.9 ms versus 130.3 ms. The initial-page mode's explicit first `setPage({ page: 1, size: 50 })` repeats its current state, so its timing is not comparable with the default mode's first transition (35.5 ms). Both DOM counts rose by 59 after the local Vite environment was rebuilt; the two final modes share that environment and source SHA. DOM counters include the page and Vite client; heap and timing measurements describe this host and fixture, not a universal ceiling. Both runs record Grid SHA-256 `67647434776f8126e007fcb3a590f9e59110ab5b5dd5219d3bc8a4b50de20add`.[^m10-initial][^m10-no-initial]

The fixed [100/1,000-row rerun](evidence/m10-initial-page-binding-chromium.json) stayed within every M6 budget: 1,000-row flat initial/rebind/edit/sort/filter medians were 13.5/15.2/0.9/3.0/2.0 ms, and nested-auto initial/rebind/sort/filter medians were 42.4/47.0/9.8/6.0 ms.[^m10-initial-binding] Seven focused browser cases cover bounds, empty Rows, invalid input and failure rollback, off-page selection/validation/drafts and delayed errors, nested choices, focus, unique IDs in two MDI screens, mutation/clamping, `setPage(null)`, and disposal/rebind. The interactive demo exposes the option before rebind and still exercises every implemented Grid option. No List option, column engine, virtualization, bulk edit, or generic data utility is included. The user approved this narrow public contract for M10.3.

# M10.4 agent and package review

An independent agent used documentation before inspecting implementation or existing tests to add an authored Grid screen with a nested row-local Select, initial local page, row selection, sorting, off-page identity, validation drafts, unique IDs, and disposal/rebind. The agent reported reading nine documentation files (60,445 bytes), then rereading four core files (22,371 bytes); no raw read-meter log was retained for independent recomputation. Its first actual Chromium run failed before an assertion because the fixture used Vite's wrong module URL; one URL-only correction made the case pass 1/1 in Chromium without changing screen logic. The same corrected case passed 1/1 in Firefox after workspace recovery. Elapsed time was about 18 minutes, including roughly 12 minutes waiting for the shared workspace to be restored; actual tokens were unavailable. This is a docs-first task result, not a claim of first-run success or a controlled speed comparison.[^agent-screen]

The M10.3 local tarball SHA-256 is `08a698cf0e7008fb0dec4eea627a78ddb1685d1359830bf0011108a2ac4226d8`. It contains 98 files with no 1.x source, jQuery, docs, tests, or demo. Its installed JavaScript and TypeScript consumers passed. Its browser-served consumer passed on the same SHA in Chromium 153, Firefox 155, WebKit 26.6, real Chrome 153, and real Edge 153 on Windows. The first Chromium attempt had Firefox's repository-local Playwright path set and could not find Chromium; rerunning with the correct environment passed. The current source passed the complete Playwright suites in Chromium 123/123 (25.0 seconds), Firefox 123/123 (54.9 seconds with the local cache), and WebKit 123/123 (45.9 seconds). The user clarified that the absence of a Mac excludes only real Safari, not WebKit engine tests. No registry publication or release tag occurred.

# Related

- [Feature parity ledger](feature-parity.md)
- [Feature parity implementation plan](feature-parity-plan.md)
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
[^m10-initial]: Bounded initial-page 5,000-row measurement
[^m10-no-initial]: Default first-render 5,000-row measurement on the same source
[^m10-initial-binding]: Fixed 100/1,000-row budget rerun after M10.3
[^agent-screen]: Independent docs-first authored Grid browser task
