---
type: Example
title: Employee screen in two authored layouts
description: One CVC controller shares Rows across Form, Grid, and List, coordinating Select and Pagination in two authored layouts and fetched HTML.
tags: [example, cvc, form, grid, list, select, pagination, accessibility]
status: draft
sources:
  - id: controller
    resource: ../../examples/vite/m4/employees.ts
    title: Shared employee controller
    git_blob: c15ab21168b93cb5675d2ddbf1c3fa18bfef557c
  - id: runner
    resource: ../../examples/vite/m4/main.ts
    title: Page mounting in the example
    git_blob: 1d670bd4d61cb8600e28f2ac66cd85ab63b240d0
  - id: vite
    resource: ../../examples/vite/vite.config.ts
    title: Development-only HTML fragment route
    git_blob: ac3667b45edf705a64863173ca3554c04c18416d
  - id: side
    resource: ../../examples/vite/m4/side.html
    title: Side-by-side authored view
    git_blob: 701b6b74a863ed41bb92f80b423b1a7a94be6cd2
  - id: stack
    resource: ../../examples/vite/m4/stack.html
    title: Stacked authored view
    git_blob: c07d7af888c3c4e715a915b6011e1ec96a942129
  - id: side-css
    resource: ../../examples/vite/m4/side.css
    title: Side-by-side authored styling
    git_blob: d90c06cebc55155cbcd732e293799634b6f618de
  - id: stack-css
    resource: ../../examples/vite/m4/stack.css
    title: Stacked authored styling
    git_blob: fb2e884da8167bd0c41206b5d6b26e8f5e145cf9
  - id: fixture
    resource: ../../examples/vite/m4/employees.json
    title: Fixed employee rows
    git_blob: 549f537a8051f44d68213bd05f42097c1c3a585c
  - id: expected
    resource: ../../examples/vite/m4/expected-save.json
    title: Expected raw save payload
    git_blob: fa8f0a3fe67366868c0e69c7464572454cd87a54
  - id: server
    resource: ../../examples/vite/m4/mock-server.ts
    title: Development-only mock API
    git_blob: 71c10c7b63b9291fa1bbcbb64d7515e7887acfc8
  - id: m4-test
    resource: ../../tests/browser/m4-screen.spec.ts
    title: Original screen and server-HTML browser regression
    git_blob: 068f35a366cad8dec2bcb563d12e59aaec45f3ac
  - id: m6-test
    resource: ../../tests/browser/m6-screen.spec.ts
    title: List and paging browser regression
    git_blob: 9610ad289f93b7636a27f9c893a2640717caca9a
generated: { by: codex/gpt-6-sol, at: 2026-09-24T18:36:01Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T18:39:10Z }
---

Run `npm run build` and `npm run example`, then open `/m4/side.html` or `/m4/stack.html`. The paths retain their M4 name, but the same screen now exercises the M6 data UI. `/m4/side.html?view=server` loads its authored side view through `mountPage(URL)`.[^runner][^vite][^controller]

# Scenario

Search employees, select a row in either a native table or compact list, edit its detail Form, and save raw changes. The screen also demonstrates nested row-local choices, client sorting/filtering/paging, add/delete/revert, independent page instances, and request cancellation.[^controller][^m4-test][^m6-test]

# Components used

| Component | Responsibility in this screen |
|---|---|
| `mountPage` | Creates an independent controller for each authored screen and owns cleanup. |
| `createCommunicator` | Sends JSON search/save requests with cancellation. |
| `createRows` | Holds the shared employee records and extracts changed rows. |
| `bindForm` | Reads search input and edits the selected employee with rules and row-keyed drafts. |
| `bindGrid` | Clones the authored table row, edits the row-local Select, selects rows, and displays sort/page state. |
| `bindList` | Clones the authored `<li>` as a read-only compact view of the same rows. |
| `bindSelect` | Supplies numeric page sizes to the standalone authored Select. |
| `bindPagination` | Connects authored page buttons to the Grid/List page request. |

The native action buttons and their event handlers belong to the page controller; there is no Button binder or theme.[^controller][^side][^stack]

# View

The side view places Grid/List beside the detail Form; the stacked view places the Form above them and uses different CSS. Both keep the same `data-role` and `data-action` application selectors. The framework uses `data-field`, `data-row-template`, and `data-options`; no repeated row or page button template has a fixed DOM `id`.[^side][^stack][^side-css][^stack-css]

```html
<label>Rows per page <select data-role="page-size"><option value="">Choose a size</option></select></label>
<nav data-role="pager" aria-label="Employee pages">
  <button type="button" data-page-prev>Previous</button>
  <button type="button" data-page-template><span data-page-number></span></button>
  <button type="button" data-page-next>Next</button>
  <output data-page-status></output>
</nav>
<ul data-role="list">
  <li data-row-template>
    <button type="button" data-select-row><span data-field="name"></span></button>
    <span data-field="profile.team"></span>
    <label>Choice <select data-field="chosen" data-options="a"
      data-option-label="aa" data-option-value="bb"><option value="">Choose</option></select></label>
  </li>
  <li data-empty hidden>No visible employees</li>
</ul>
```

The table has native headers, including a name header with `aria-sort`; its repeated row contains a selection button and an editable Select with the same nested `a` options. The compact List Select is disabled because List is a read-only view. Native labels, `aria-pressed` row selection, `aria-current="page"` page state, `aria-live` status, and authored `data-error-for` regions retain browser semantics. Two live pages have no duplicate DOM IDs.[^side][^stack][^controller][^m6-test]

# Controller

`createEmployees` receives one `PageContext` per screen and registers every handle, subscription, and store with `own`. The controller owns the business-specific `companyEmail` validator, salary parser, name comparator/filter, API endpoints, and save conversion. UI rules `email`, `integer`, `minvalue`, and `commas` remain framework-reachable through Form.[^controller]

Grid and List use one `Rows<Employee>` instance. A List selection calls `grid.select(id)`; Grid's selection callback selects the same ID in List, binds the detail Form, and updates the live selected-name output. The standalone Select offers typed sizes 2 and 5. Page requests go through the controller, which sets Grid and List to the same slice, reads Grid's normalized state, and calls `pagination.set(state)`. Filtering and sorting apply to both views before page slicing. The application resets to page 1 on a new search, filter, or sort; `Rows` subscriptions recalculate totals after edits.[^controller]

For an invalid changed row hidden by a filter or page, save validation clears the filter, computes that row's page under the current name sort, and selects it. It rechecks detail Form issues or an unavailable Grid Select choice, then focuses the connected field when one is available. The browser regression covers the off-page Grid choice. Editing controls become inert during save while Close stays available; settled saves restore focus when the prior target still exists.[^controller][^m4-test][^m6-test]

# Server contract

The Vite-only mock responds to `POST /api/employees/search?session=...` with employee JSON and to `POST /api/employees/save?session=...` with 204. Search body is `{ "query": string }`; save body is `Rows.changes()` mapped to `{ status, value }`, without the internal `RowId`. Each controller uses its own session. The mock's `empty`, `error`, and `slow` search terms exercise zero rows, HTTP 503, and late responses.[^server][^controller]

The fixture includes `a: [{ aa: 11, bb: 22 }, {}]`: the incomplete option is skipped, and the first generated option retains raw number `22`. `expected-save.json` shows a salary change to `125000` and nested department change to `Infrastructure` as raw JSON.[^fixture][^expected][^m4-test]

# How it works

1. `main.ts` clones the requested HTML template into each page host. With `?view=server`, the Vite middleware extracts the current side-view template and supplies it as an HTML fragment to the same page runtime and controller.[^runner][^vite]
2. Search aborts its preceding request; `rows.replace` updates both views and resets the detail selection. Closing a screen aborts outstanding work and disposes its bindings, listeners, and store. The M4 caller then removes the host and returns keyboard focus to the external Open control.[^controller][^m4-test]
3. Table and list selection use store-local `RowId`, not a DOM `id` or display index. Form edits and the Grid choice write to `Rows`, so both visible views update. Page navigation only changes the rendered slice, not the stored rows or change status.[^controller][^m6-test]
4. Save validates the detail Form and Grid, including changed rows outside the visible slice. A successful save reloads server state; if only that refresh fails, the example marks local rows clean so an inserted row is not sent again. A failed save retains the edits and reports the response error.[^controller][^m4-test]

# Variations

Open `/m4/side.html` and `/m4/stack.html` to compare independent authored layout and CSS. Use `/m4/side.html?view=server` for fetched HTML, or Open another screen to inspect simultaneous state and unique IDs. The two-screen browser case closes with Enter, checks that focus returns to Open, and reopens with Enter. The M6 browser spec checks both layouts for keyboard page/row activation, synchronized List/Grid slices, typed page size, empty state, and independent two-screen paging.[^runner][^m6-test]

For an optional nested employee field, edit the two detail HTML inputs, the Employee shapes and new-row default in `employees.ts` and `mock-server.ts`, the fixture and expected-save JSON, and the matching browser case. Form follows `data-field` paths automatically; a data-only field needs no runtime or controller event-handler change. Start with those files rather than reading `main.ts` and CSS. The first save case in `tests/browser/m4-screen.spec.ts` is the narrowest payload regression; page-control changes start with the first case in `tests/browser/m6-screen.spec.ts`. After editing source-linked examples, check whether `m6-plan.md` needs a source-fingerprint refresh. Read only the recent entries of `docs/log.md` for a same-task update.[^controller][^side][^stack][^fixture][^expected][^server]

# Pitfalls

`data-role` and `data-action` are application selectors, not framework markers. The Vite mock and HTML-fragment middleware are development examples, not transport or rendering services supplied by the package. The pagination here is client-side over the filtered rows; it does not fetch a server page. List displays disabled row-local Selects, so edits belong in Form or Grid. The native name header is the only sortable column in this example.[^controller][^server][^vite][^side]

# Related

[Form](form.md) handles detail drafts and rules; [Grid](grid.md) and [List](list.md) share the rows. [Select](select.md) explains typed standalone choices, [Pagination](pagination.md) explains controlled page state, and [UI contracts](ui.md) lists public types. [The M4 plan](../implementation/m4-plan.md) records the original screen gate; [the M6 plan](../implementation/m6-plan.md) records the data UI gate.

[^controller]: Shared employee controller
[^runner]: Page mounting in the example
[^vite]: Development-only HTML fragment route
[^side]: Side-by-side authored view
[^stack]: Stacked authored view
[^side-css]: Side-by-side authored styling
[^stack-css]: Stacked authored styling
[^fixture]: Fixed employee rows
[^expected]: Expected raw save payload
[^server]: Development-only mock API
[^m4-test]: Original screen and server-HTML browser regression
[^m6-test]: List and paging browser regression
