---
type: Example
title: Tree and DatePicker in two CVC layouts
description: Connect authored hierarchy selection and ISO calendar input to a shared Form in independent CVC screens.
tags: [ui, cvc, example, accessibility]
status: draft
sources:
  - id: controller
    resource: ../../examples/vite/m11/main.ts
    title: Shared CVC definition, Tree selection, Form input, and calendar ownership
    git_blob: e857700952f0c5f18082658d95639068607d4004
  - id: side
    resource: ../../examples/vite/m11/side.html
    title: Authored tree-first side-by-side view
    git_blob: 4410e305130fc2ba1a09e99d4164450748d2cf2e
  - id: stack
    resource: ../../examples/vite/m11/stack.html
    title: Authored Form-first stacked view
    git_blob: 9a0ddfd3c35b7ea3cd21a3572b432c2479ab0282
  - id: css
    resource: ../../examples/vite/m11/base.css
    title: Application-owned tree, calendar, and dialog styles
    git_blob: 5136d62071911c44fe17c781ca4c88cc2f22895c
  - id: side-css
    resource: ../../examples/vite/m11/side.css
    title: Application-owned side-by-side layout
    git_blob: dabb3744ab77c57b2672fa894087e475ebd11b28
  - id: stack-css
    resource: ../../examples/vite/m11/stack.css
    title: Application-owned stacked layout
    git_blob: e6349021ad661f6b019a794e96573ee0fdaa3e3b
  - id: browser
    resource: ../../tests/browser/tree-date-screen.spec.ts
    title: Authored-screen keyboard, MDI, Form, calendar, disposal, and axe checks
    git_blob: 65afe89fa5a26a8a22e229d32e71ff4b9425aaef
generated: { by: codex/gpt-6, at: 2026-10-05T07:27:08Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T07:43:44Z }
---

The M11 example connects one caller-owned Rows store to a Tree and editable Form inside each CVC page. A controlled DatePicker in an authored native dialog changes the Form's ISO date; two independent pages reuse the same controller and scoped markers.[^controller][^side][^stack]

# Scenario

Run `npm run build` and `npm run example`, then open `/m11/side.html` or `/m11/stack.html`. Two workspaces start with Ada selected. Use Tree arrows and Enter to select another person, edit their name or review date, choose a date through the calendar, validate for save, and inspect or revert raw `Rows.changes()`. Open and close workspaces to exercise fresh controller instances and disposal.[^controller][^side][^stack]

# Components used

| Component | Responsibility |
|---|---|
| `mountPage` | Creates one controller per workspace and owns reverse-order cleanup. |
| `createRows` | Owns the workspace's person records, stable RowIds, and raw changes. |
| `bindTree` | Displays domain `key`/`parent` hierarchy and selects RowIds. |
| `bindForm` | Edits and validates the selected person using native controls and retained rules. |
| `bindDatePicker` | Controls calendar selection and keyboard movement as ISO dates. |
| Native `<dialog>` | Opens, closes on Escape, and confines modal focus. Application code restores the opener. |

# View

`side.html` puts a tree-first two-column layout before the detail Form. `stack.html` puts the Form first and stacks the hierarchy below it. Both contain one authored list node template, wrapping input labels, authored error outputs, raw change text, and an authored native dialog calendar. The calendar uses Monday-first weekday headings matching `weekStartsOn: 1`; the repeatable week contains seven authored day buttons. No repeated template contains a fixed DOM ID. Styles belong to the application, including the selected-node appearance, calendar day states, responsive layout, and dialog sizing.[^side][^stack][^css][^side-css][^stack-css]

# Controller

`main.ts` defines one `PageDefinition<WorkspaceInput>` whose factory clones the current layout's authored template. Each controller creates its own Rows store and binds Form, DatePicker, and Tree to it. `Tree.onSelect` binds the Form to the same RowId and updates the calendar from the raw row date. A separate Rows subscription refreshes visible change text and the calendar when a valid direct input edit or revert changes that date.[^controller]

```ts
const tree = bindTree(treeRoot, {
  rows,
  key: row => row.key,
  parent: row => row.parent,
  onSelect({ id, row }) {
    form.bind(id);
    picker.setValue(row?.value.date ?? null);
  }
});
```

The DatePicker callback uses the Form's existing input contract:

```ts
onChange(value) {
  dateInput.value = value;
  dateInput.dispatchEvent(new Event("input", { bubbles: true }));
  dateInput.dispatchEvent(new Event("change", { bubbles: true }));
}
```

This leaves native date constraints and Rows commits with Form. DatePicker's `setValue` does not call `onChange`, so refreshing its controlled value cannot create a feedback loop. Before opening, `picker.setValue(picker.value())` resets a canceled navigation to the stored selection. The opener then calls native `showModal()` and `picker.focus()`; the native dialog's close event restores opener focus.[^controller]

An application capture-phase click handler checks whether the activated day or Today button is enabled before the calendar updates its reused cells, and queues closing until selection completes. This also handles reselecting the unchanged date, which produces no `onChange`. Native Enter/Space activate the same button. The queued close checks the CVC signal so removed screens cannot receive late dialog work. A canceled calendar leaves stored data unchanged.[^controller]

# How it works

The application registers Rows, Form, DatePicker, Tree, its subscription, and dialog cleanup with `context.own`; CVC frees them in reverse order. CVC's signal owns listeners on the workspace. Explicit removal also removes its window unload listener before disposing the page, and returns focus to the external Open another workspace button. Removing an open modal closes it before its calendar and Rows are released.[^controller]

Each screen has independent Rows, selection, Form drafts, calendar value, and generated label/error/title IDs. Both screens reuse the same data markers and application controller without document-wide ID lookup for binding. The integration tests cover both authored orders, keyboard focus versus selection, Form edits, calendar choice/cancel/reopen, unchanged-date confirmation, an adjacent-month selection, raw changes/revert, MDI independence, modal removal, narrow text-spacing layout, and axe A/AA-tagged states.[^controller][^browser]

# Variations

DatePicker can stay inline by removing the native dialog wrapper and application open/close handlers; its binding contract is unchanged. For a server-authored page, replace the CVC factory view with a URL while keeping this controller and field markers. Business holidays or application date display belong to the application; this example uses ISO raw values and native date constraints without a general date utility.[^controller]

# Pitfalls

An invalid Form date draft is not the stored row value. The calendar opens on its controlled stored date and can replace that draft with a valid choice; it does not parse arbitrary entered text. Validation is a local save gate; this example deliberately has no backend save request. Shared Rows means Tree and Form within a workspace, not all MDI workspaces.[^controller]

Use a short read path when changing this screen:

| Task | Read first | Edit |
|---|---|---|
| Change hierarchy or fields | [Tree](tree.md), [Rows](data.md) | `main.ts`, both authored HTML views |
| Change calendar behavior | [DatePicker](datepicker.md), [Form](form.md) | `main.ts`, both calendar views |
| Change layout | One authored HTML view and its CSS | `side.html`/`side.css` or `stack.html`/`stack.css` |
| Change lifecycle | [Page runtime](page.md) | `main.ts` and the screen browser test |

The `find` helper is local example code, not a framework selector utility. Automated accessibility results cover tested states and do not replace manual assistive-technology testing.[^controller][^browser]

# Related

[Tree](tree.md), [DatePicker](datepicker.md), [Form](form.md), [Rows](data.md), and [the page runtime](page.md) define the contracts used here. [The Grid demo](grid-demo.md) covers the existing Grid features.

[^controller]: Shared CVC definition, Tree selection, Form input, and calendar ownership
[^side]: Authored tree-first side-by-side view
[^stack]: Authored Form-first stacked view
[^css]: Application-owned tree, calendar, and dialog styles
[^side-css]: Application-owned side-by-side layout
[^stack-css]: Application-owned stacked layout
[^browser]: Authored-screen keyboard, MDI, Form, calendar, disposal, and axe checks
