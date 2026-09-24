---
type: Example
title: M4 employee screen in two authored layouts
description: One controller runs search, Grid, detail Form, and save across side-by-side and stacked HTML views.
tags: [example, cvc, form, grid, accessibility]
status: draft
sources:
  - id: controller
    resource: ../../examples/vite/m4/employees.ts
    title: Shared employee controller
    git_blob: 88938bff9250438de302bf379194ef975b629c4f
  - id: runner
    resource: ../../examples/vite/m4/main.ts
    title: Page mounting in the example
    git_blob: caab5b56e337b106a0be53ac5ac8ecbc3ba7368b
  - id: side
    resource: ../../examples/vite/m4/side.html
    title: Side-by-side authored view
    git_blob: 94a4664f96065be8cfc2cc02271bd62ac4881875
  - id: stack
    resource: ../../examples/vite/m4/stack.html
    title: Stacked authored view
    git_blob: 1676fd589b4782d88e12c1063d60b26aed204036
  - id: side-css
    resource: ../../examples/vite/m4/side.css
    title: Side-by-side authored styling
    git_blob: 1c69ee3e5ee71208142c12598e5d78c33533f85e
  - id: stack-css
    resource: ../../examples/vite/m4/stack.css
    title: Stacked authored styling
    git_blob: ad6e5b425634f9a32baa31c7e3688134a04330d1
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
generated: { by: codex/gpt-6-sol, at: 2026-09-24T11:01:06Z }
---

Run `npm run build` and `npm run example`, then open `/m4/side.html` or `/m4/stack.html`. Both views use the same controller and fixture; their DOM placement and CSS differ. `/m4/side.html?view=server` fetches the same authored HTML through the page runtime instead of cloning its local template.[^side][^stack][^controller]

# Scenario

Search employees, select a row, edit its details, and save changed rows. The page also demonstrates local sorting/filtering, add/delete/revert, row-local nested Select options, a second live page instance, and removal during a delayed request.[^controller][^fixture]

# Components used

| Component | Example responsibility |
|---|---|
| `mountPage` | Creates each screen from the authored template and owns controller cleanup. |
| `createCommunicator` | Sends explicit JSON requests with page/search cancellation. |
| `createRows` | Shares immutable employee rows with Form and Grid and extracts changed records. |
| `bindForm` | Reads search input and connects detail inputs, custom rules, and errors. |
| `bindGrid` | Clones one authored row, keeps `RowId` selection, and connects row-local options. |

# View

The views deliberately place the detail Form on different sides of the table in the DOM. Both use the same `data-role` and `data-action` markers for application lookup. Framework field binding uses `data-field` and the Grid row template and Select markers; none of the repeated markup has a fixed DOM `id`.[^side][^stack]

```html
<tr data-row-template>
  <th scope="row"><button type="button" data-select-row>Open <span data-field="id"></span>: <span data-field="name"></span></button></th>
  <td data-field="email"></td>
  <td data-field="profile.team"></td>
  <td><label>Choice
    <select data-field="chosen" data-options="a" data-option-label="aa" data-option-value="bb">
      <option value="">Choose</option>
    </select>
  </label></td>
</tr>
```

The detail Form also binds the optional `profile.department` path in both views. The local filter sits outside the search form so Enter cannot silently submit a new search and discard an edit. The two stylesheets belong to the authored views; the framework supplies no visual theme. The table keeps native semantics, a sortable header announces `aria-sort`, and Form errors use authored `data-error-for` regions.[^side-css][^stack-css][^side]

# Controller

`createEmployees` receives one `PageContext` per screen. It registers each store and binding with `own`, so page disposal releases them in reverse order. The controller supplies the business-specific `companyEmail` validator and salary parser as application code. Built-in `email`, `integer`, `minvalue`, and `commas` rules come from the private M5 UI catalog.[^controller]

```ts
const rows = createRows<Employee>();
const detail = bindForm(detailRoot, { rows, rules, parse: { salary: parseSalary } });
const grid = bindGrid(table, { rows, onSelect: ({ id }) => detail.bind(id) });
```

The excerpt shows the relationship; see the source for the exact application parser and cleanup registration. A local filter and name comparator are passed directly to Grid rather than exposed as framework data utilities.[^controller]

# Server contract

The development-only Vite mock responds to `POST /api/employees/search?session=...` with JSON rows and to `POST /api/employees/save?session=...` with 204. Search body is `{ "query": string }`. Save body is an array of `{ status, value }` records from `Rows.changes()`, omitting the internal `RowId`. Sessions isolate two live screens and independent browser tests.[^server][^controller]

The fixed fixture contains `a: [{ aa: 11, bb: 22 }, {}]`; the incomplete option is skipped and selecting the first option retains numeric `22`. `expected-save.json` shows the raw payload after changing Ada's salary to `125000` and `profile.department` to `Infrastructure`.[^fixture][^expected] Search terms `empty`, `error`, and `slow` exercise empty, HTTP 503, and delayed responses in this mock.[^server]

# How it works

1. `main.ts` clones the requested authored template into a new page host; each Open click creates another independent CVC instance.[^runner]
2. The controller loads rows through `createCommunicator`, then `rows.replace` updates Grid and clears the previous detail selection.[^controller]
3. Form writes valid detail edits through `Rows.set`. Grid writes the selected raw option value, while a local sort/filter only changes display order.[^controller]
4. Save checks the current Form and every changed row, including rows hidden by the local filter. It sends only business values and status; a successful response reloads the mock server state. If that follow-up read fails after the save was accepted, the example marks the local rows clean and reports the refresh failure separately, preventing a duplicate insert on the next save.[^controller]
5. While a save is pending, the example makes editing controls inert but leaves Close available; it restores focus when the save settles. Invalid detail input stays with its `RowId` while the user selects or adds another row; save finds drafts across rows. New searches abort older searches, and closing a page aborts requests and disposes listeners, bindings, and the store.[^controller][^runner]

# Variations

Use `/m4/side.html` to inspect a table beside the detail Form, `/m4/stack.html` to inspect detail above the table, or `/m4/side.html?view=server` to exercise fetched server HTML. The controller and fixture are unchanged. Open another screen to check simultaneous instances and document-unique generated error IDs.[^side][^stack][^runner]

# Pitfalls

This screen started as the M4 vertical pilot and now exercises the M5 Form/Grid rule boundary. Do not copy the demo's `data-role` or `data-action` markers as framework API; they are application selectors. The mock API is part of the example server, not a production transport; it applies a whole save batch atomically. M6 completes standalone UI components.[^controller][^server]

# Related

[Form](form.md), [Grid](grid.md), and [UI contracts](ui.md) document the implemented boundary. [The M4 plan](../implementation/m4-plan.md) records the original screen gate; [the M5 plan](../implementation/m5-plan.md) records rule and draft verification.

[^controller]: Shared employee controller
[^runner]: Page mounting in the example
[^side]: Side-by-side authored view
[^stack]: Stacked authored view
[^side-css]: Side-by-side authored styling
[^stack-css]: Stacked authored styling
[^fixture]: Fixed employee rows
[^expected]: Expected raw save payload
[^server]: Development-only mock API