---
type: Plan
title: Natural-JS 2.x M11 Tree and DatePicker plan
description: Approved authored-HTML Tree and DatePicker scope, ownership, accessibility, and verification gates.
tags: [meta, plan, ui, accessibility]
status: draft
sources:
  - id: roadmap
    resource: roadmap.md
    title: Migration roadmap
    git_blob: b99c9a254693cebb6886a114e0dc775957b3d80e
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public UI entry
    git_blob: 98601f6d9ce1b487dd52c81dad860b465b71e8c0
  - id: tree
    resource: ../../src/ui/tree.ts
    title: Tree implementation
    git_blob: 730aec4bc38bd3f001cea36677825ee1b4d15cd0
  - id: datepicker
    resource: ../../src/ui/datepicker.ts
    title: DatePicker implementation
    git_blob: ab5880c48e2ddf06ee1e6bce981684b15c316eb9
  - id: dom
    resource: ../../src/ui/dom-state.ts
    title: Shared private DOM state ownership
    git_blob: 885c8d0cf0c6914d73bbbb71a0fb6aab3b35f6d3
  - id: measurements
    resource: evidence/m11-tree-chromium.json
    title: Final recovered 1000-row Tree measurements
    git_blob: f28e7f507342705cc7495638d8846d75fac15a7f
  - id: verification
    resource: evidence/m11-verification.json
    title: Recovered source and exact-tarball verification record
    git_blob: d86cef2e35862853729ddcfac03ccb2b725a6b39
  - id: tree-pattern
    resource: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
    title: WAI-ARIA treeview pattern
  - id: date-pattern
    resource: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
    title: WAI-ARIA date picker keyboard example
generated: { by: codex/gpt-6, at: 2026-10-05T09:51:16Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T09:51:16Z }
---

M11 adds small HTML-bound Tree and DatePicker components after the completed M10 slices. The user authorized implementation on 2026-10-05 and later authorized restoring an external Vite initialization. Implemented contracts live in separate draft component concepts.

# Goal

Preserve CVC, authored HTML/CSS, caller-owned Rows, safe nested text binding, retained UI formatters, document-unique IDs, and short source lookup for coding agents. Avoid a new state engine, public utility package, theme, or page runtime.

# Checkpoint

The selected M11 scope below is complete. Runtime, authored two-layout CVC example, browser tests and draft concepts passed independent review and recovery validation. Source/tests were preserved before restoring externally deleted Git, docs, examples, build and caches; the regenerated package is byte-identical to the initial tested artifact. The 2026-10-05 [full feature plan](feature-parity-plan.md) reopens uncovered legacy Tree/calendar behavior; historical exclusions below do not authorize omitting it from the expanded release scope.

# Steps

1. Audit 1.x hierarchy/date selection intent and existing List/Form/Select contracts. Rewrite necessary behavior directly against Rows and browser APIs.
2. Add named authored ul/ol Tree with a node template, label and empty child list. Typed key/parent callbacks map flat application records; store-local RowId controls selection. Reuse field-path and formatter rules, compile element indexes once, validate hierarchy in O(n), update changed fields and reuse row DOM.
3. Add controlled ISO DatePicker on an authored native table with seven weekday headers and a seven-cell week template. Clone six weeks once, cache the 42 cells, and keep inclusive ranges, UTC day/month arithmetic, Gregorian Intl names and keyboard navigation local.
4. Share only attribute restoration and unique-ID allocation in private dom-state.ts for the two components and existing Tabs. Applications explicitly connect date callbacks to Form input events and native dialog ownership.
5. Verify independent CVC instances in tree-first and Form-first HTML/CSS, keyboard/focus/ARIA, failed binding rollback, hierarchy reparent/removal/replace, range and leap dates, repeated disposal, fixed binding workloads, installed JS/TS and one exact-hash tarball in all five available browsers. Update component concepts, source/test map, indexes, log and fingerprints together.

# Next action

Push only the approved development branch and prepare the M12 notification/document-tab/application-shell scope next; npm publication and release tags remain deferred until personal testing and an explicit publication request.

# Decisions

| Addition | Framework need and visibility |
|---|---|
| bindTree / TreeHandle | Public creation, single selection, expansion and cleanup; no separate tree store. |
| Tree key/parent callbacks | Application hierarchy mapping while RowId remains the UI identity; domain keys are not DOM IDs. |
| Tree field/rule binding | Private reuse of safe nested paths and retained display rules. |
| bindDatePicker / DatePickerHandle | Public controlled ISO value/setValue/focus/dispose; applications own input/dialog connection. |
| Calendar calculations | Private parsing, range checks and navigation required by the component. |
| DOM state helper | Private restoration/ID allocation shared by three real callers; no convenience export. |

Cascading checks, Tree sorting/filtering, dragging and lazy transport remain unselected. DatePicker excludes month-only mode, holiday/business-day engines and swipe/wheel behavior. The Form date formatter remains display-only. M10 column/bulk-edit/virtualization candidates and M12 shell are separate.

Tree separates focus and selection, uses visible-node navigation and roving tabindex, and exposes expansion only on parents. An empty Tree becomes a named group, then returns to tree semantics when rows appear. DatePicker uses native table/grid semantics, a single day Tab stop, month announcements and day/week/month/year movement. Repeated templates reject fixed IDs and unsupported extra interactive controls. The APG sources guide interaction; they do not certify assistive-technology support.[^tree-pattern][^date-pattern]

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-10-05 | Authorization and prior-contract audit | The next milestone and later workspace recovery were explicitly authorized. Prior module/data/Form/CVC contracts were independently checked; no conflicting contract was found. |
| 2026-10-05 | Initial implementation checks | Build/typecheck, Vitest 81, full source suites 144 per engine, final DatePicker and example followups, and 113-file SHA-gated JS/TS plus five-browser consumers passed before the external initialization. That deleted local artifact had SHA-256 15d171e80c5d72e137205e88d469f0a3d538801ffedac7bad7dd0c42ff37c257; recovery requires a newly measured artifact. |
| 2026-10-05 | Independent contract audit | Three docs/24,571 file bytes explained selection/Form/date wiring before source inspection. Separate agents checked implementation and contracts, including media controls, ancestry reversal, dialog capture ordering, canceled-navigation reset, and disposal. This is a read-context proxy, not a token comparison or a new fixed implementation task. |
| 2026-10-05 | Recovered full checks | Build/typecheck, example TypeScript and Vitest 81/81 passed. Chromium 144/144 (47.6s), Firefox 144/144 (1.8m), WebKit 144/144 (1.5m) passed with final media/capture/reopen regressions included. |
| 2026-10-05 | Recovered exact artifact | 113 files, no v1/jQuery/docs/tests/examples/convenience bundle. SHA-256 15d171e80c5d72e137205e88d469f0a3d538801ffedac7bad7dd0c42ff37c257 regenerated identically; installed JS/TS plus Chromium 153, Firefox 155, WebKit 26.6, Chrome 154 and Edge 154 consumers passed. No npm publication or tag. |
| 2026-10-05 | Recovered Tree cost | 1000 rows, one nested field, two warmups/five samples each: flat bind/update medians 6.2/1.4 ms; mixed hierarchy 6.2/1.6 ms. All 1000 DOM records remained identical after an update. These reference-host samples do not establish virtualization or device-independent budgets. |

Raw measurements and source/artifact checks are preserved with source hashes.[^measurements][^verification]

# Open questions

Personal product review and manual assistive-technology checks remain open. Real macOS/iOS Safari is excluded; available Playwright WebKit is required. npm publication and release tags remain deferred. M12 scope and the user’s personal product review are the next gates.

[^tree-pattern]: WAI-ARIA treeview pattern
[^date-pattern]: WAI-ARIA date picker keyboard example

[^measurements]: Final recovered 1000-row Tree measurements
[^verification]: Recovered source and exact-tarball verification record
