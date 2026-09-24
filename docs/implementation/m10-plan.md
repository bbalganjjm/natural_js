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
    git_blob: dedeca30ef8f10a78172748d8cb9911a68b7da03
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
generated: { by: codex/gpt-6-sol, at: 2026-09-24T22:17:03Z }
---

M10 is a later 2.x milestone, outside the first `2.0.0` feature set. This draft defines decision and implementation gates. The first grouped/sticky authored-table slice is implemented without a new Grid API; later runtime capabilities remain unselected. The user has deferred npm publication until remaining work is complete and personally tested. Safari is outside the initial 2.0 browser support scope.[^roadmap]

# Goal

Add only advanced Grid behavior that a representative authored-HTML screen needs. Keep `bindGrid`, caller-owned `Rows`, store-local `RowId`, Form-reachable rules, and native table semantics. Do not carry over 1.x pixel-correction options, copied headers, duplicate DOM IDs, jQuery, or a general utility layer.[^grid][^rows][^old-grid]

# Baseline and risk

The basic Grid already binds one authored row template, nested row-local Select choices, typed edits, validation drafts, selection, sort/filter, local paging, focus, and disposal. It stores a cloned record for every row it has displayed and rerenders on each `Rows.set` event. Large visited pages and per-cell bulk changes therefore need an explicit memory/rendering design. The M9 1,000-row fixture is a baseline, not a large-data guarantee.[^grid][^benchmark]

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

The inferred M10.0 reference is now [a 40-row employee assignment screen](../v2/advanced-grid-example.md), since no production advanced screen was supplied. It has five columns, two native column groups, a row-local nested Shift Select, keyboard-activated name sorting and row selection, a two-axis scroll region, and two independent MDI mounts. Side-by-side and stacked authored layouts reuse one CVC controller. The first selected capability is grouped and fixed headings/first column through HTML/CSS only. Column resize/reorder/hide, bulk paste, multi-selection, and virtualization remain unselected; no new Grid or Rows API is authorized by this fixture. M10.2 may study rendering lifetime on a separately declared larger workload without changing the basic contract.

The browser acceptance for this slice checks native table semantics, no copied header or duplicate IDs, nested choices, keyboard sort/selection, two-screen isolation, sticky geometry, 320 CSS-pixel reflow with enlarged text spacing, and axe-tagged A/AA results. Chromium, Firefox, and WebKit passed four focused cases each. On this Windows host Firefox required the repository-local Playwright browser cache; the default cache failed at process launch (`spawn UNKNOWN`) even with one worker. Automated checks do not establish manual screen-reader conformance.

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
| M10.2 Rendering lifetime | Measure and, if needed, bound cached records and update affected visible rows. Retain drafts/selection by `RowId` across page/window changes. | Fixed 1,000-row budgets do not regress; selected larger fixture meets a predeclared render/memory budget; repeated mounts release records/listeners. |
| M10.3 Selected operations | Implement only chosen column state, bulk edit, or multi-selection contracts on existing Rows/rule ownership. | Typed consumer example; keyboard/pointer flows; failure/revert, sorted/filtered/offscreen cases; no business rules in Grid. |
| M10.4 Agent/package review | Independent agent adds a small advanced screen from docs only. Prune needless API/file splits; install one SHA-gated artifact in JS, TS, and a browser-served consumer with the chosen new Grid behavior. | First-pass result or correction record, source/doc agreement, package scope audit, same-hash installed-browser result, and changed/full OKF checks with zero errors. |

# Validation and exclusions

Run build, typecheck, focused unit checks for non-DOM invariants, and real-browser tests on authored tables. Check keyboard-only use, header semantics and association, sort/column state announcements, focus visibility, text spacing, narrow layout, and MDI duplicate IDs. If resize/reorder is selected, include manual screen-reader and keyboard review or record its absence as an unverified gate. Browser engines are Chromium, Firefox, and WebKit; installed Chrome/Edge smokes use the selected package. WebKit is not labeled Safari, and automated axe results alone do not establish WCAG conformance.

Measure the existing flat/nested 100- and 1,000-row fixtures before and after rendering changes. Set any larger workload and budget in M10.0, rather than inventing a universal speed claim. Record agent first-pass correctness, files/bytes read, changed scope, elapsed time, and actual tokens only if available.

Update `docs/v2/grid.md`, examples, indexes, `docs/log.md`, and this plan with each slice. Keep `npm run docs:check -- --changed` at zero errors and independent `verified` fields honest. Do not recreate 1.x option names, copy the old Grid, add a generic table/clipboard library, alter the M9 beta artifact, or pull M11/M12 into M10.

The user approved proceeding with M10. The inferred M10.0 reference screen and public HTML/TS example are now implemented without a runtime or public API change. Review this concrete fixture before any M10 runtime mutation; revisit scope if a slice needs a new Rows contract or changes basic Grid behavior. Manual assistive-technology checks remain open; use the repository-local cache for repeat Firefox runs on this host.

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
