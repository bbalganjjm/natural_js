---
type: UI Component
title: bindForm
description: Bind authored Form fields to local input or Rows with M4 validation and accessible error output.
tags: [ui, form, binding, accessibility]
status: draft
symbols: [bindForm]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public UI entry and Form types
    git_blob: f4004388ef1cb23c8e1e5fec340886f9c0416ef5
  - id: form
    resource: ../../src/ui/form.ts
    title: M4 Form binding runtime
    git_blob: 6a240838751510926bb37363b48145d4358fdb41
  - id: path
    resource: ../../src/ui/field-path.ts
    title: Shared safe object field paths
    git_blob: dfac85c3d4cc2c0a61cb2e4ee210b01583ecc5b2
generated: { by: codex/gpt-6-sol, at: 2026-09-24T10:12:21Z }
verified:
  - { by: codex/gpt-6-sol-independent, at: 2026-09-24T10:12:53Z }
---

`bindForm` attaches field reading, row editing, validation, and error output to existing HTML. M4 implements the minimum Form path for a search and detail screen; the retained built-in formatter and validator catalog is scheduled for M5.[^entry][^form]

# Quick start

```html
<form data-role="detail">
  <label>Name <input data-field="profile.name" required></label>
  <output data-error-for="profile.name"></output>
  <label>Email <input data-field="email" type="email"
    data-validate='[["companyEmail"]]'></label>
  <output data-error-for="email"></output>
</form>
```

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindForm } from "@bbalganjjm/natural_js/ui";

const rows = createRows([{ profile: { name: "Ada" }, email: "ada@example.com" }]);
const form = bindForm(document.querySelector<HTMLElement>('[data-role="detail"]')!, {
  rows,
  rules: {
    validate: {
      companyEmail: value => value.endsWith("@example.com") || "Use a company email"
    }
  }
});
form.bind(rows.entries()[0].id);
if (form.validate().valid) console.log(rows.changes());
form.dispose();
rows.dispose();
```

# Constructor

## `bindForm(root, options?)`

`bindForm<T extends object = Record<string, unknown>>(root: HTMLElement, options?: { rows?: Rows<T>; rules?: RuleSet; parse?: Record<string, ParseInput> }): FormHandle<T>` binds one HTML root. It rejects a second live binding of the same root with `FORM_IN_USE`; `dispose()` releases the root for reuse. It does not replace the author's HTML or CSS.[^form]

# Options

| Option | Type | Default | Effect |
|---|---|---|---|
| `rows` | `Rows<T>` | none | Enables `bind(id)` and writes valid edits to the identified row. Without it, the Form reads local controls, such as search fields. |
| `rules` | `RuleSet` | none | Supplies named `format` and `validate` functions and optional validation messages. Only supplied functions run in M4. |
| `parse` | `Record<string, ParseInput>` | none | Converts a field's entered string before row validation and write. A thrown parser creates a `parse` issue and prevents the write. |

`RuleSet.locale` exists in the type but M4 has no built-in localized rule catalog. A `FormatRule` returns display text; a `ValidateRule` returns `true`, `false`, or an error message. `false` uses `rules.messages[name]` when present, otherwise a short field/rule fallback message.[^entry][^form]

# Declarative options

| Marker | Value | M4 behavior |
|---|---|---|
| `data-field` | Property or dot-separated object path | Reads or writes a field without using the DOM `id`. It may be on the root or a descendant. |
| `data-format` | JSON list, such as `[["suffix"]]` | Runs only a named function supplied in `rules.format` when displaying a row value. |
| `data-validate` | JSON list, such as `[["companyEmail"]]` | Runs only named functions supplied in `rules.validate`, after input parsing and alongside HTML constraint checks. |
| `data-error-for` | Exact `data-field` path | Uses an authored descendant as the field's error text region. |

Each rule tuple is `[name, ...args]`; names are resolved case-insensitively among the supplied rule functions. Invalid JSON or tuple shape raises `RULE_DECLARATION`, and a name without a supplied function raises `RULE_UNKNOWN` during binding. A path is parsed once, rejects prototype keys, numeric array indexes, and expression syntax, and never evaluates JavaScript. Nested object writes copy the affected path and replace its top-level `Rows` field.[^form][^path]

# Methods

## `bind(id)`

Selects an existing, non-deleted `RowId` or `null`. A row binding renders its raw values through optional display formatters; `null` clears a row-bound Form. `bind(id)` clears the current M4 input draft and issues. A Form without `rows` accepts only `null`.[^form]

## `read()`

Returns a detached record containing only marked fields in their nested object shape. A local Form reads current control values; a row-bound Form reads stored raw values, so an invalid draft never appears as saved row data. Text fields return strings unless a row edit uses an explicit parser; local `read()` does not run parsers.[^form]

## `validate(id?)`

Returns `{ valid, issues }`, combining HTML constraint results and supplied validation rules. Without `rows`, it validates current controls. With `rows`, no argument validates the bound row. An explicit ID for another row validates stored values without rebinding or changing the currently visible Form. An explicit ID for the bound row validates the current input when it has an invalid draft and updates the visible issues; otherwise it validates stored values. An issue carries `rowId`, `field`, `rule`, and `message`; `element` is present for a visible row or local field and absent for another row.[^form]

## `dispose()`

Removes delegated input, change, and focus listeners, unsubscribes from `Rows`, and releases the root. It restores the original error-region text, `id`, `aria-live`, and field `aria-describedby`/`aria-invalid` attributes. Repeated disposal is safe; later `bind`, `read`, and `validate` calls raise `FORM_DISPOSED`.[^form]

# Behavior

Input and change events on marked controls first apply an optional parser, then native constraint checks and supplied validation rules. An invalid edit stays visible and does not enter `Rows`; a valid row edit calls `Rows.set`, replacing the affected top-level field for a nested object path. A row subscription refreshes the bound Form when the store changes and clears the view if that row disappears or is deleted. Display formatting is one-way: focusing a bound control restores its stored raw value, and leaving a control without a retained invalid draft formats it again.[^form][^path]

For each matched `data-error-for`, the Form keeps an authored `id` or adds a document-unique one, sets `aria-live="polite"` when absent, and adds that ID to the field's `aria-describedby`. Failed validation writes message text and sets `aria-invalid="true"`; valid state restores the field's prior `aria-invalid`. An authored wrapping `<label>` or another valid label association remains the application's responsibility.[^form]

# Pitfalls

- The 1.x built-in `data-format` and `data-validate` names are retained in the migration plan but are **not implemented in M4**. Do not declare `required`, `email`, or `commas` as a JSON rule unless that name is explicitly supplied in `RuleSet`; use native `required` and input `type` for this pilot. M5 implements the retained catalog.[^form]
- `read()` is not a save gate. Call `validate()` before a request, and use `Rows.changes()` for valid row edits. A local Form's `read()` still returns the entered text when an HTML constraint fails.[^form]
- M4 keeps a failed edit only while its row remains bound. Switching rows clears the draft; validation of another ID checks stored values, not a previously unbound draft. Full row-keyed drafts, filtered-out draft validation, and parse/display rule semantics are M5 work.[^form]
- `data-field` is not a DOM `id`, and an object path cannot index an array. Repeated or simultaneous authored views must avoid fixed duplicate IDs.[^path]

# Related

[Rows](data.md) provides row identity and immutable snapshots. [UI types](ui.md) defines `RuleSet`, `FormHandle`, and `ValidationResult`. [The M4 plan](../implementation/m4-plan.md) defines the pilot's boundary; [the M1 contract](../implementation/m1-contract.md) records the later Form rule and draft goals.

[^entry]: Public UI entry and Form types
[^form]: M4 Form binding runtime
[^path]: Shared safe object field paths
