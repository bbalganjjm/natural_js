---
type: UI Component
title: bindDatePicker
description: Bind controlled ISO date selection and keyboard navigation to an authored calendar table.
tags: [ui, datepicker, binding, accessibility]
status: draft
symbols: [bindDatePicker, DatePickerHandle]
sources:
  - id: datepicker
    resource: ../../src/ui/datepicker.ts
    title: DatePicker ISO values, authored calendar rendering, keyboard, and disposal
    git_blob: ab5880c48e2ddf06ee1e6bce981684b15c316eb9
  - id: apg
    resource: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
    title: WAI-ARIA date picker dialog example
generated: { by: codex/gpt-6, at: 2026-10-05T07:27:08Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T07:43:44Z }
---

`bindDatePicker` adds date selection and keyboard navigation to an authored calendar table. It controls one ISO date independently of Form, dialog, or CVC ownership; application callbacks connect those components.[^datepicker]

# Quick start

```html
<div data-datepicker>
  <h3 data-date-title>Choose date</h3>
  <table data-date-grid>
    <thead><tr>
      <th scope="col" abbr="Sunday">Su</th><th scope="col" abbr="Monday">Mo</th>
      <th scope="col" abbr="Tuesday">Tu</th><th scope="col" abbr="Wednesday">We</th>
      <th scope="col" abbr="Thursday">Th</th><th scope="col" abbr="Friday">Fr</th>
      <th scope="col" abbr="Saturday">Sa</th>
    </tr></thead>
    <tbody><tr data-date-week-template>
      <td><button type="button" data-date-day></button></td>
      <td><button type="button" data-date-day></button></td>
      <td><button type="button" data-date-day></button></td>
      <td><button type="button" data-date-day></button></td>
      <td><button type="button" data-date-day></button></td>
      <td><button type="button" data-date-day></button></td>
      <td><button type="button" data-date-day></button></td>
    </tr></tbody>
  </table>
</div>
```

```ts
import { bindDatePicker } from "@bbalganjjm/natural_js/ui";

const picker = bindDatePicker(document.querySelector<HTMLElement>("[data-datepicker]")!, {
  value: "2026-10-05",
  min: "2026-01-01",
  max: "2027-12-31",
  onChange(value) { console.log(value); }
});
picker.setValue("2026-11-03");
picker.dispose();
```

# Constructor

`bindDatePicker(root: HTMLElement, options?): DatePickerHandle` requires a connected authored `[data-datepicker]` root, one separate `[data-date-title]`, and a native `table[data-date-grid]`. The table needs a single seven-header `<thead>` row and one `<tbody>` containing a seven-cell `tr[data-date-week-template]`. Each `td` contains one `button[type="button"][data-date-day]`; header and day cells have no row/column spans. A repeated week cannot contain fixed IDs or additional interactive controls. A second live binding raises `DATE_OWNED`.[^datepicker]

# Options

| Option | Type | Default | Behavior |
|---|---|---|---|
| `value` | `string \| null` | `null` | Selected ISO date. |
| `min` | `string` | `"0001-01-01"` | Inclusive first available ISO date. |
| `max` | `string` | `"9999-12-31"` | Inclusive last available ISO date. |
| `locale` | `string` | Host Intl locale | Localized month title and full-date button names. |
| `weekStartsOn` | `0 \| 1` | `0` | Sunday (`0`) or Monday (`1`); authored headers must match. |
| `onChange` | `(value: string, event: Event) => void` | None | Reports a changed user-selected date after updating internal state. |

Dates must be real Gregorian `YYYY-MM-DD` values from year 0001 to 9999. Malformed dates raise `DATE_VALUE`; reversed ranges or out-of-range selections raise `DATE_RANGE`. An invalid locale raises `DATE_LOCALE`. Bounds are constructor options; rebind when their contract changes.[^datepicker]

# Declarative options

| Marker | Element | Behavior |
|---|---|---|
| `data-datepicker` | Connected root | Defines the calendar's scope. |
| `data-date-title` | One element outside the table | Receives the focused month's localized title and a polite live announcement. |
| `data-date-grid` | Native table | Becomes an ARIA grid labelled by the title. |
| `data-date-week-template` | One seven-cell `tr` in the sole `tbody` | Repeated into six calendar weeks. |
| `data-date-day` | One `button[type="button"]` per `td` | Receives a date, accessible full-date name, availability, and roving Tab state. |
| `data-date-number` | Optional descendant of a day button | Receives the day number, preserving the rest of that button's authored markup. |
| `data-date-prev`, `data-date-next` | Optional distinct `button[type="button"]` outside the table | Change the focused month without choosing a date. |
| `data-date-today` | Optional `button[type="button"]` outside the table | Chooses today's local calendar date when available. |

Author seven named `th[scope="col"]` headings in the configured weekday order. Full weekday `abbr` text supplies expanded names while keeping short visual labels. Locale does not rewrite those headers or action text. Generated day buttons expose `data-date-value="YYYY-MM-DD"`; `data-date-outside` identifies adjacent-month days for application CSS. These adjacent dates remain selectable within bounds.[^datepicker]

# Methods

| Method | Behavior |
|---|---|
| `value()` | Returns the selected ISO string or `null`. |
| `setValue(value: string \| null)` | Validates and changes the selected value without `onChange`. Shows that date's month; `null` clears selection and focuses today clamped to bounds. Keeps focus inside the calendar if it was there. |
| `focus()` | Focuses the current enabled date; call after opening an authored dialog. |
| `dispose()` | Removes generated weeks and listeners, restores the original week/title nodes and changed attributes, and releases ownership. Repeated disposal is safe. |

Calls after disposal raise `DATE_DISPOSED`. Constructor errors restore the authored calendar so it can be corrected and rebound.[^datepicker]

# Events

| Event | Handler | Behavior |
|---|---|---|
| Day pointer click, native Enter/Space activation, or Today | `onChange(value, event)` | Fires only when the chosen value differs. `this` is not rebound. |

Arrow navigation, month/year movement, `setValue`, and choosing the already selected date do not emit a change. A throwing application callback leaves the newly chosen internal value in place.[^datepicker]

# Behavior

The calendar has one day in the Tab sequence. Left/Right move one day; Up/Down one week; Home/End move to the configured week boundaries. Page Up/Page Down change month while preserving the day number when possible; Shift adds year movement. Movement clamps to bounds. Native button activation selects. The selected `td` has `aria-selected="true"`; today's button has `aria-current="date"`. The title obtains a document-unique ID if needed.[^datepicker][^apg]

Calendar arithmetic uses UTC day values to avoid daylight-saving transitions; Today comes from the host's local calendar date. Six week rows are cloned once from the authored template and their day buttons are reused during movement, including adjacent-month days; dates outside supported years are hidden. The component supplies behavior and ARIA state, while application HTML/CSS owns structure and appearance.[^datepicker]

# Pitfalls

DatePicker does not format an input, write Rows, validate business rules, or open/close dialogs. Connect `onChange` to an input or application data explicitly. The retained Form `date` formatter is still display-only. For a modal calendar use authored `<dialog>`, native `showModal()`/`close()`, `picker.focus()` after opening, and restore focus to its opener on close. Native Escape closes that dialog; the calendar itself has no Escape-close contract.[^datepicker]

Generated day buttons are reused and their date/disabled state can change during a calendar click. A dialog controller that closes on confirmation should capture enabled-day eligibility before the calendar handles that click, then close after the selection handler completes. It must also handle reselecting the unchanged date, which emits no `onChange`. [The CVC example](tree-date-example.md) shows this without another framework callback.[^datepicker]

Keep fixed IDs outside repeated week markup. A different locale or week-start order also needs matching authored header/action translations. Automated browser/axe checks do not establish manual screen-reader conformance.[^datepicker][^apg]

# Examples

[Tree and DatePicker in two CVC layouts](tree-date-example.md) wires a native dialog calendar to a row-bound Form without a framework modal wrapper.

# Related

[Form](form.md) owns entered values and validation. [The page runtime](page.md) owns disposal. [Popup](popup.md) runs complete CVC pages inside a dialog when page loading is needed.

[^datepicker]: DatePicker ISO values, authored calendar rendering, keyboard, and disposal
[^apg]: WAI-ARIA date picker dialog example
