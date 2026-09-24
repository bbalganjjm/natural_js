---
type: Plan
title: Natural-JS 2.0 M6 data UI plan
description: Approved M6 contract and implementation evidence for Button, Select, pagination, Form, List, and basic Grid on authored HTML.
tags: [meta, plan, ui, migration]
status: draft
sources:
  - id: contract
    resource: m1-contract.md
    title: Approved 2.0 public and binding contract
    git_blob: ac3e447352807f54773cb746b7d12acabd22602d
  - id: roadmap
    resource: roadmap.md
    title: Milestone and first-release scope
    git_blob: bbc0367777f7e513bbd4c67eed84154d7d3f91a2
  - id: m4
    resource: m4-plan.md
    title: Two-layout screen and fixed performance baseline
    git_blob: c5f7a8617a7622faaf3ddc7deaa9428ab810a216
  - id: m5
    resource: m5-plan.md
    title: Retained rules, row drafts, and data boundary
    git_blob: d96b1362b15fcd9e1fef52293d25f328ab0fd744
  - id: ui
    resource: ../../src/ui/index.ts
    title: Current public UI types and exports
    git_blob: 6a2ee60393df8898e518a884fc1b8f3c6d6b9cf5
  - id: form
    resource: ../../src/ui/form.ts
    title: Current Form behavior
    git_blob: e603f619679c24be778b04f45ea3c467b50bf2c2
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Current Grid behavior
    git_blob: dedeca30ef8f10a78172748d8cb9911a68b7da03
  - id: list
    resource: ../../src/ui/list.ts
    title: M6 List implementation
    git_blob: 8d3ef3e1ff3e7b7fb7faed27fc592846dd5fe090
  - id: select
    resource: ../../src/ui/select.ts
    title: M6 standalone Select implementation
    git_blob: 4160eb77722751aad730fb997a4f0b07a967bd1e
  - id: pagination
    resource: ../../src/ui/pagination.ts
    title: M6 controlled Pagination implementation
    git_blob: 0239548e7638456548beb441b55956381272d454
  - id: employee
    resource: ../../examples/vite/m4/employees.ts
    title: Two-layout CVC integration
    git_blob: c15ab21168b93cb5675d2ddbf1c3fa18bfef557c
  - id: rows
    resource: ../../src/data/index.ts
    title: Row identity, mutation, and change tracking
    git_blob: 10c07414eacccc414b81afc8be5661dd21afe3c6
  - id: legacy-button
    resource: ../../v1/docs/ui/button.md
    title: Preserved 1.x Button contract
    git_blob: f04d663c2b8f1d82d592dac83cb4810b9d664c00
  - id: legacy-select
    resource: ../../v1/docs/ui/select.md
    title: Preserved 1.x Select contract
    git_blob: e95d5a777f9e897c1f435b385288d8b9be1b2e77
  - id: legacy-pagination
    resource: ../../v1/docs/ui/pagination.md
    title: Preserved 1.x pagination contract
    git_blob: f7e7eb9081bac1eac94ae90a78958d71de6041a2
  - id: legacy-list
    resource: ../../v1/docs/ui/list.md
    title: Preserved 1.x List contract
    git_blob: 1e93437c791acfc6b3f024c9d9f10c25349997cd
generated: { by: codex/gpt-6-sol, at: 2026-09-24T13:52:47Z }
---

The user approved M6 on 2026-09-24 after the M5 data and rule gate. This plan governs the first-release data UI on authored HTML and CSS while keeping the public surface small. The usage contract below records the public decisions before integration.

# Goal

Complete Button, Select, pagination, Form, List, and basic Grid as one consistent family: pass a root and small typed options, keep authored structure, use caller-owned `Rows` for shared data, and release listeners, clones, and subscriptions through `dispose()`. Preserve CVC ownership and the retained Form-reachable rules. Only behavior needed by these components belongs in the framework; formatting and validation rules already retained in M5 stay, while application comparisons, API calls, business rules, and visual design remain with the application.[^contract][^roadmap][^m5]

| Area | Minimum M6 responsibility | Boundary |
|---|---|---|
| Button | Native `<button>` semantics, disabled/busy state when a framework operation owns it, and a clear lifetime for any attached behavior. | Page action handlers stay ordinary DOM code when no framework state is needed. No size/color/class generator or styled-link substitute. |
| Select | Bind authored single and multiple `<select>` controls to typed raw choices, preserve authored placeholder options, and align standalone and row-local option behavior. | Form owns authored radio/checkbox group values; a new input generator or CSS switch is outside the minimum contract unless a reviewed use case requires it. |
| Pagination | Manage current page, page size, total count, bounds, and authored previous/next/page controls for client or server paging. | The application fetches server pages and owns business filtering; pagination controls do not mutate `Rows` or store page numbers in business rows. An application `Rows.replace` after a server fetch issues new `RowId` values. |
| Form | Finish the native control matrix, including authored radio/checkbox groups and multiple selection, on top of M5 raw/display/parse/validate/draft rules. | No new general mask, formatter, validator, or domain form schema engine. |
| List | Repeat one authored `<li>` template over `Rows`, show fields and row-local options, and support row-keyed selection. Reuse a separate Form for editing in the first slice. | Inline List editing needs a separately reviewed second caller for a shared edit operation; no timer-driven row creation, scroll paging engine, or index-based identity. |
| Basic Grid | Finish native-table text/checkbox editing, selection, sort/filter/page connection, validation, and change-state display. | Frozen columns, merged headers, virtual scrolling, large edit engines, and column reordering wait for M10. |

# Proposed contract decisions

These approved defaults guide the M6 usage contract and implementation. A change to an M1 invariant or the agreed milestone scope requires renewed review.

| Concern | Proposed M6 contract |
|---|---|
| Select ownership | A standalone Select binder owns only controls outside a bound Form/List/Grid. Form/List/Grid reuse a private raw-option mapping; binding one element twice raises a clear error. |
| Client page order | Apply filter, then sort, then page slicing. Client total is the filtered count; server total comes from the application response. Page controls never mutate Rows. |
| Server selection | Application use of Rows.replace for a fetched page issues new RowIds; off-page selection is cleared. Keeping a business selection across server pages is application state keyed by a business ID, never by RowId. |
| Form groups | Authored radio groups live inside a form owner so equal names in two MDI pages stay scoped. A radio group stores one scalar, checkbox groups an array, one checkbox a boolean, and a multiple Select an array. Required/error/focus behavior is defined per group in the usage example before implementation. |
| Typed Grid edits | Grid accepts a per-field parse callback with the existing ParseInput shape for number/date/raw JSON; failed conversion remains a row-keyed draft. List's first slice delegates edits to Form and does not add a second inline editor. |
| Button | Start with native button activation and page-owned event handlers. Add a public Button binder only when a concrete framework-owned busy/disabled lifetime cannot be expressed with that contract. |

# M6 usage contract

A native `<button type="button">` remains the Button contract. Page code attaches its click handler and sets `disabled` while its own async operation runs. The UI package exports no Button wrapper or visual theme. A repeated row-selection button must explicitly use `type="button"` so binding a List or Grid inside a form cannot submit it.

```html
<form data-role="search"><label>Search <input data-field="query"></label><button>Search</button></form>
<ul data-role="results">
  <li data-row-template><button type="button" data-select-row>
    <span data-field="profile.name"></span></button></li>
  <li data-empty hidden>No matches</li>
</ul>
<form data-role="detail"><label>Name <input data-field="profile.name"></label></form>
<label>Page size <select data-role="page-size"><option value="">Choose</option></select></label>
<nav data-role="pages" aria-label="Result pages">
  <button type="button" data-page-prev>Previous</button>
  <button type="button" data-page-template><span data-page-number></span></button>
  <button type="button" data-page-next>Next</button>
  <output data-page-status></output>
</nav>
```

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindForm, bindList, bindPagination, bindSelect } from "@bbalganjjm/natural_js/ui";

const rows = createRows([{ profile: { name: "Ada" } }]);
const detail = bindForm(document.querySelector<HTMLElement>('[data-role="detail"]')!, { rows });
const list = bindList(document.querySelector<HTMLUListElement>('[data-role="results"]')!, {
  rows, onSelect: ({ id }) => detail.bind(id)
});
const pageSize = bindSelect(document.querySelector<HTMLSelectElement>('[data-role="page-size"]')!, {
  choices: [{ label: "5", value: 5 }, { label: "10", value: 10 }], value: 5,
  onChange(value) {
    if (typeof value === "number") showPage(1, value);
  }
});
const pages = bindPagination(document.querySelector<HTMLElement>('[data-role="pages"]')!, {
  state: { page: 1, size: 5, total: rows.entries().length },
  onPage: ({ page, size }) => showPage(page, size)
});
function showPage(page: number, size: number): void {
  list.setPage({ page, size });
  pages.set(list.page()!);
}
showPage(1, 5);
// The owning CVC page registers each handle and Rows for disposal.
```

`bindSelect<V>(select, { choices, value?, onChange? })` keeps authored options and maps generated choices to their raw `string | number | boolean | null` values. The handle provides `setChoices`, `setValue`, `value`, and `dispose`. Authored nonempty options return strings; an authored empty value returns `null`. A multiple Select returns an array. A Select already claimed by Form/List/Grid cannot also be bound standalone.

`bindPagination(root, { state: { page, size, total }, onPage })` returns `set`, `state`, and `dispose`. Pages are one-based; an empty result has page 1 and zero pages. The callback requests `{ page, size }` and does not change the displayed state until the application calls `set`. List and Grid accept `setPage({ page, size } | null)` and report `page(): PageState | null` after filtering, sorting, and slicing. Their client totals are filtered row counts; server totals belong to the application. `RowId` and page index never replace one another. Sorting and filtering functions are supplied by the application.

`bindList(ulOrOl, { rows, rules?, onSelect? })` repeats one authored direct `<li data-row-template>` and exposes selection, sort, filter, page, validation, and disposal. It displays nested `data-field` paths and row-local `data-options` arrays without editing them; a separate Form edits the selected row. `bindGrid(table, { rows, rules?, parse?, onSelect? })` adds text/checkbox writes, row-keyed invalid drafts, optional parsed number inputs, header `aria-sort`, and the same page operations. `setSort(compare, { column: th, direction: "ascending" | "descending" })` accepts a heading in the table's `<thead>`. Grid rejects row-local multiple Selects; Form handles multiple selection.

For an editable numeric or structured raw value, pass `parse[field]`. Each parser sees all current unparsed entries in `RuleContext.values`; all parsers in one validation pass see that same input snapshot regardless of edit order. Validation sees the complete parsed candidate. HTML native constraints, authored labels, `aria-describedby` error regions, and row-selection button types remain part of the authored markup. No repeated template may contain a fixed DOM `id`.

M4 already proves the CVC screen in two layouts and row-local nested Selects. M5 supplies `Rows` events, safe object paths, built-in and custom rules, and invalid drafts. M6 should finish missing UI behavior rather than copy these foundations or import 1.x convenience libraries.[^m4][^m5][^form][^grid]

# Checkpoint

- M0-M5 are complete on `2.0.0-alpha.0`. The user approved M6 after an independent M5 audit. M6 now has public Form, Grid, List, Select, and Pagination contracts; Button remains native HTML. The M4 two-layout screen runs all of them through one CVC controller and caller-owned Rows.[^m4][^m5][^ui]
- Preserved 1.x Button styles, generated Select/input markup, positional pagination, and per-row List forms informed intent but were not copied. All Form-reachable formatter and validator rules remain in the private UI implementation; framework-unreachable conveniences remain outside the 2.0 package.[^legacy-button][^legacy-select][^legacy-pagination][^legacy-list]
- The original M4/M5 fixed fixture and 1,000-row List/page fixture have same-host Chromium measurements below the M6 budgets. Chromium, Firefox, and WebKit browser suites, installed JS/TS consumers, and the package-surface audit passed. The docs and independent agent-cost gate are being closed in this milestone.

# Steps

| Step | Work | Reviewable evidence |
|---|---|---|
| 0. Close M5 | Recheck the M5 Form/Grid/Rows contracts, benchmark, installed consumers, and source-linked OKF concepts. Record any known gap before freezing the input state for M6. | M5 gate, code baseline, and remaining environment gaps are linked from the active checkpoint. |
| 1. Freeze usage contract | Write short HTML and TS examples for a paged search/list/detail screen and a standalone Select; show the same controller in two distinct authored layouts. Confirm each proposed public name, root/option/result/event/disposal shape, row ownership, and whether Button needs a binder at all. Record the exact signatures and examples before broad implementation; revise M1 and seek renewed review only if an invariant or approved scope changes. | A reviewer can identify the single source file for each component and the application-owned code without reading implementation internals. |
| 2. Button and Select | Use a native button and preserve its authored label/classes; add only state that an actual framework operation needs. Implement standalone Select options and values from typed raw scalars/arrays, preserve author-provided options, and reuse the row-local value mapping where it is genuinely the same operation. | Keyboard activation, disabled/busy restoration, typed number/string distinction, empty and duplicate option values, rebind, and disposal pass without generated duplicate IDs. |
| 3. Pagination | Bind authored controls, compute page bounds from total count and size, announce the current page, and connect client-visible rows or server requests through a typed callback. Keep page changes independent of `Rows` status and selected `RowId`. | First/last/empty/short final pages, changed totals, rapid server responses, and keyboard navigation behave consistently in List and Grid. |
| 4. Form control matrix | Audit every supported native control against the M5 parse/format/validate/draft pipeline. Finish single/multiple Select, authored radio/checkbox groups, required/length/pattern constraints, raw boolean/array values, and unsupported file behavior. Correct Form and Grid differences through one small private helper only when both need identical stable semantics. | Empty, invalid, hidden, cross-field, programmatic change, switch-row, revert, and disposed cases preserve raw JSON and accessible errors. |
| 5. List | Bind one authored `<li>` template to `Rows` with cached field descriptors and row-local references. Add a real row-selection control and an authored empty-state region; use an existing Form for editing. Preserve selection identity through client sort/filter/page operations. Review inline editing separately only if the first-release List needs it. | Rows add/update/delete/revert appears correctly; a separate Form validates hidden edits. Nested option arrays, keyboard selection, and repeated bind/dispose pass without per-row document queries or Form instance duplication. |
| 6. Basic Grid | Extend the M5 native table to write user text/checkbox edits through parse and validation into `Rows`, retain invalid row-keyed drafts, and add authored header sort state (`aria-sort`), filter and page controls. Keep native table/tab order; use `role="grid"` only if its complete focus and arrow-key model is implemented and tested. | Sort/filter/page after edit targets the same `RowId`; raw payloads and change status are correct, including nested JSON and hidden rows. Two MDI copies remain ID-clean. |
| 7. Integration and hard cases | Run the full search → list/grid → select → detail edit → save path in both HTML/CSS layouts. Exercise empty results, server errors, repeated binding, rapid page/search changes, removal during requests, keyboard-only use, and generated error references. | No stale DOM response, leaked listener, duplicate DOM ID, broken label/ARIA reference, or silent invalid draft enters a save. |
| 8. Cost and documentation gate | Compare the fixed M4/M5 Grid fixture after each large change; add a List/pagination fixture for bind, page switch, and disposal. Inspect code/API growth and an independent docs-first screen task. Update affected English OKF concepts, indexes, log, fingerprints, examples, migration notes, and active checkpoint with code. | Build/typecheck, focused logic and browser checks, JS/TS installed consumers, changed OKF check with zero errors, full OKF findings recorded, package audit, and measurements support a user review before M7. |

# Next action

Finish source-linked OKF updates and the independent docs-first agent tasks, record their actual accuracy and context cost, then close M6 with a fast-forward push to `2.0.0-alpha.0`. Prepare the separate M7 page-UI plan for review; do not implement M7 under M6 approval.

# Decisions

- `data-field` and store-local `RowId`, not DOM IDs or display indexes, identify fields and rows. Parse paths and rules once per authored template; reuse local element references and batch new rows. Arrays can be row-local option sources or atomic `Rows.set` values; arbitrary array-index paths and expression binding are out of scope.[^contract][^grid][^rows]
- Keep native semantics: `<button>`, `<label>`, `<select>`, `<ul>/<ol>`, and `<table>` with real headings. Selection and page changes must expose state through appropriate native controls or `aria-pressed`, `aria-current="page"`, and `aria-sort`; errors use valid `aria-describedby` references and live text. Move/restore focus only when a component actually changes the active element. No design classes or forced layout are required.[^contract][^m4]
- Keep Form/List/Grid rules in the UI role and data ownership in `Rows`. Share private parsing, rule dispatch, field paths, and identical control handling only when more than one component needs the same stable operation. Do not export a general DOM, data, format, mask, date, sorting, or paging utility package.[^contract][^m5]
- Sort comparators, filter predicates, domain validation and parsing, display copy, API URLs, server paging requests, and save payload conversion stay as application functions. UI components call the smallest typed hook needed to connect them; there is no global registry or implicit request engine.[^contract][^roadmap]
- M6 does not include dialog/popup/tab (M7), advanced Grid (M10), custom calendar/tree (M11), or notification/document tabs (M12). The preserved `v1/` source and LGPL notices stay unchanged; new 2.0 source/package remains Apache-2.0.[^roadmap]

The initial implementation order is Button/Select → pagination → Form controls → List → Grid → integration. If a component forces new shared infrastructure, first show the two concrete callers and the smaller local alternative; keep the dependency direction `ui → data` and never have an internal module import the package root.[^contract]

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Planning baseline | This review draft compares the M1 contract, roadmap, M4/M5 plans and measurements, current Form/Grid/Rows source, and preserved 1.x Button/Select/Pagination/List documentation. No M6 code was implemented. |
| 2026-09-24 | Fixed performance gate | On the M4 reference host with the same fixture, flat initial/rebind/edit/sort/filter medians must remain at or below 30/35/5/10/8 ms; automatic nested initial/rebind/sort/filter at or below 90/100/25/18 ms. Require zero duplicate IDs. On another host, first collect its M4 baseline and require no more than twice the corresponding medians before comparing absolute numbers. Record 100- and 1,000-row measurements, DOM count, and diagnostic heap samples.[^m4] |
| 2026-09-24 | Agent-cost gate | After M6 implementation, repeat the fixed docs-first field task with the same acceptance checks and compare against both M5 runs; add a small List/page task for the new APIs. Record first-pass correctness, retries, unique files and content output, changed files and lines, elapsed time, and actual tokens only if available. The M5 field task passed on its first Chromium run with nine changed files in both runs; the short source map narrowed unique files from 23 to 17, with about 77-78 KB of content output in the guided replay before diff review. The M4 reference was 15 unique files/53,364 bytes, seven changed files, and about 4m05s, for a different field. These byte methods and setup times differ, so compare cautiously and investigate a growth in lookup or edit spread before approving a larger public API. M8 performs the full three-task comparison.[^m4][^roadmap] |

| 2026-09-24 | M6 implementation | Native Button handlers; standalone Select, controlled Pagination, read-only List, Form groups, and editable/paged Grid are implemented. Independent source review found and prompted fixes for numeric raw type, multiple-Select ambiguity, parser ordering, page-state mutation, selection-button submission, sort ARIA, root ownership, and focus restoration. |
| 2026-09-24 | Code and browsers | Build, typecheck, Vitest 81/81, installed JS/TS consumers, and the explicit employee example typecheck passed. Chromium/WebKit browser 144/144 and fresh-cache Firefox 72/72 passed across the complete suite, including the two authored layouts and concurrent ID-clean screens. |
| 2026-09-24 | Same-host Grid benchmark | Two warm-ups plus five Chromium 153 runs on i7-9700F: 1,000-row flat initial/rebind/edit/sort/filter medians 12.5/15.7/0.7/2.6/2.1 ms; nested automatic 46.0/45.5/1.5/9.2/5.8 ms. All M6 reference budgets pass; raw [Grid evidence](evidence/m6-binding-chromium.json). |
| 2026-09-24 | List/page benchmark and package | At 1,000 rows/10 fields, initial full List binding took 12.3 ms, applying 25-row paging plus Pagination 0.9 ms, Next 0.2 ms, and disposal 0.1 ms; duplicate IDs: 0. The first bind creates all row records. See [List evidence](evidence/m6-list-chromium.json). The 88-file, 120,488-byte dry-run package contains no `v1/`, jQuery, docs, examples, tests, or convenience utility bundle. |

Verification favors focused tests for high-risk behavior over copying every legacy convenience method. Run Chromium and WebKit on the current host. The fresh Playwright Firefox build passed this host after the M5 `spawn UNKNOWN` failure in an older browser cache. Release verification later checks actual Chrome, Edge, and Safari. Accessibility checks include keyboard-only activation and selection, meaningful state/error announcements, valid labels, focus retention after sorting/paging, and no duplicate IDs in repeated rows or simultaneous pages.[^m4][^roadmap]

# Open questions

- List/Grid cache row elements for revisited pages. At 1,000 rows/10 fields, the fixed List fixture creates all 1,000 rows before `setPage(25)` (12.3 ms, 12,008 connected elements); later page switches reuse those records. This meets M6 budgets but is not virtualized. If larger data sets need lower peak memory, review a focused M10 strategy rather than adding a generic data engine now.
- Browser heap samples lack controlled garbage collection and are diagnostic only. Another host needs its own baseline before absolute performance comparisons.
- The system-installed Firefox does not expose the Playwright protocol, but a fresh Playwright Firefox build passed the M6 suite on this Windows host. Keep the browser cache path explicit when reproducing this result.

[^contract]: Approved 2.0 public and binding contract
[^roadmap]: Milestone and first-release scope
[^m4]: Two-layout screen and fixed performance baseline
[^m5]: Retained rules, row drafts, and data boundary
[^ui]: Current public UI types and exports
[^form]: Current Form behavior
[^grid]: Current Grid behavior
[^rows]: Row identity, mutation, and change tracking
[^legacy-button]: Preserved 1.x Button contract
[^legacy-select]: Preserved 1.x Select contract
[^legacy-pagination]: Preserved 1.x pagination contract
[^legacy-list]: Preserved 1.x List contract