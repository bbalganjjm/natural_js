---
type: Example
title: Authored advanced Grid in two layouts
description: Grouped native table headings and sticky rows and columns in two authored MDI layouts with no new Grid API.
tags: [ui, grid, example, accessibility]
status: draft
sources:
  - id: controller
    resource: ../../examples/vite/m10/main.ts
    title: Shared CVC controller and Grid binding
    git_blob: 75ca514b1b7bbf73e3dcd670d1e7f7641b031545
  - id: side
    resource: ../../examples/vite/m10/side.html
    title: Side-by-side authored table
    git_blob: 86e981b10bb7250ebbdf8949ba0bed471b932c20
  - id: stack
    resource: ../../examples/vite/m10/stack.html
    title: Stacked authored table
    git_blob: 74569b2790766a22240ea2d3ceefc8b548ed6332
  - id: side-css
    resource: ../../examples/vite/m10/side.css
    title: Side-by-side sticky table styling
    git_blob: e86fbec3db4585f41bee12d49b7ed6d160a607b9
  - id: stack-css
    resource: ../../examples/vite/m10/stack.css
    title: Stacked sticky table styling
    git_blob: 114e4c31cdc62c75a066faf3cae383f1c04f6ae1
  - id: browser
    resource: ../../tests/browser/m10-grid.spec.ts
    title: Grouping, MDI, sticky geometry, and narrow-screen checks
    git_blob: 2f0d65d7ed5a7e3c986cf9b733ae263bd6e5e824
  - id: wai
    resource: https://www.w3.org/WAI/tutorials/tables/irregular/
    title: W3C WAI irregular table headers
  - id: wai-multi
    resource: https://www.w3.org/WAI/tutorials/tables/multi-level/
    title: W3C WAI multi-level table headers
generated: { by: codex/gpt-6-sol, at: 2026-09-24T23:26:30Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T23:31:17Z }
---

This completed M10.1 structural regression screen keeps a native table, authored HTML and CSS, and the existing `bindGrid` contract. It demonstrates grouped headings and fixed positioning as markup and styling concerns; the framework still owns row binding and row-keyed state.

# Scenario

An employee assignment table has 40 rows, five columns, nested per-row Shift choices, a sort button, and two simultaneously mounted CVC screens. `side.html` places the table beside a selection panel; `stack.html` places the selection panel above it. Both layouts use the same `main.ts` controller. The 40-row workload exercises scrolling and MDI isolation; it is not a large-data performance budget.[^controller][^side][^stack]

# Components used

| Owner | Responsibility |
|---|---|
| Native table and CSS | Group Contact and Assignment columns, scroll within a named region, keep the heading and first column visible. |
| Application controller | Build fixture rows, provide the name comparator, and manage each screen's close button. |
| `mountPage` | Create and dispose independent CVC controller instances. |
| `createRows` and `bindGrid` | Own row identities, nested choices, selection, sorting, and cleanup. |

# View

Each page authors three `<colgroup>` elements with spans 1, 2, and 2. A two-row `<thead>` uses `scope="colgroup"` on Contact and Assignment, `scope="col"` on leaf columns, and `rowspan="2"` for Name. This simple grouping uses native table header semantics.[^side][^stack][^wai] More complex relationships may require document-unique `id`/`headers` associations.[^wai-multi]

```html
<div class="grid-scroll" role="region" aria-label="Scrollable employee assignments" tabindex="0">
  <table data-grid>
    <caption>Employee assignments</caption>
    <colgroup span="1"></colgroup><colgroup span="2"></colgroup><colgroup span="2"></colgroup>
    <thead>
      <tr>
        <th scope="col" rowspan="2" aria-sort="none"><button type="button" data-sort-name>Name</button></th>
        <th scope="colgroup" colspan="2">Contact</th>
        <th scope="colgroup" colspan="2">Assignment</th>
      </tr>
      <tr><th scope="col">Email</th><th scope="col">Phone</th><th scope="col">Team</th><th scope="col">Shift</th></tr>
    </thead>
    <tbody>
      <tr data-row-template>
        <th scope="row"><button type="button" data-select-row><span data-field="name"></span></button></th>
        <td data-field="email"></td><td data-field="phone"></td>
        <td data-field="profile.team"></td>
        <td><label>Shift <select data-field="chosen" data-options="shifts"
          data-option-label="label" data-option-value="value"></select></label></td>
      </tr>
    </tbody>
  </table>
</div>
```

The repeated row has no fixed DOM `id`. The focusable, named scroll region makes the horizontal and vertical overflow available to keyboard users. Both authored CSS files apply `position: sticky` to the `thead` and first body column; they keep the wide table inside the scroll region rather than widening the document.[^side][^stack][^side-css][^stack-css]

# Controller

The application passes each page a new `Rows` instance and binds the table once. Its sort click handler orders names descending on the first activation and passes the header as the `aria-sort` indicator. The comparator remains application code.[^controller]

```ts
const rows = createRows(employees());
own(() => rows.dispose());
const grid = bindGrid(table, {
  rows,
  onSelect({ row }) {
    selected.textContent = row ? "Selected: " + row.value.name : "No employee selected";
  }
});
own(() => grid.dispose());
let descending = false;
const sortName = () => {
  descending = !descending;
  grid.setSort((a, b) => (descending ? -1 : 1) * a.name.localeCompare(b.name), {
    column: header,
    direction: descending ? "descending" : "ascending"
  });
};
sort.addEventListener("click", sortName);
own(() => sort.removeEventListener("click", sortName));
```

The complete executable controller creates and removes MDI hosts with `mountPage` and restores focus to the Open button after closing a screen.[^controller]

# How it works

The Group and sticky behavior uses no new public Grid type or option. `bindGrid` clones only the authored body row, so the single table head remains in place. The browser checks verify 40 bound rows, grouped header markup, row-local choices, sort and selection isolation across two screens, duplicate-ID absence, sticky geometry after two-axis scrolling, and no document-wide horizontal overflow at 320 CSS pixels with enlarged text spacing. The focused Chromium, Firefox, and WebKit runs pass all four cases per engine. Axe reports no tagged A/AA violations in each layout's narrow, text-spaced test state. Firefox uses the repository-local Playwright browser cache because the default Windows cache fails to launch on this host. These results do not establish WCAG conformance.[^browser]

# Variations

Change the page layout or colors in HTML/CSS without changing the controller. Keep a native table and visible focus when adding a new column. A column-resize, bulk-edit, or multi-selection API requires a separate M10 contract and measured need; this example does not imply those operations exist.

# Pitfalls

Do not copy the `<thead>` into a second table or put a static `id` in `data-row-template`. Do not add `role="grid"` unless implementing its composite keyboard model. CSS sticky positioning belongs to the authored layout, and a new Grid option is unnecessary for this case.

# Related

[Basic Grid](grid.md) defines `bindGrid` and row identity. [Interactive Grid demo](grid-demo.md) exercises the complete current Grid contract. [M10 plan](../implementation/m10-plan.md) records the staged capability decisions. [Employee example](employee-example.md) remains the basic CVC screen.