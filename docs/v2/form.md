---
type: UI Component
title: bindForm
description: Bind authored Form fields and groups to Rows with row-keyed drafts, raw field-change flags, explicit display, retained rules, and accessible errors.
tags: [ui, form, binding, accessibility]
status: draft
symbols: [bindForm]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public UI entry and Form types
    git_blob: 8d5b7bffa6c796a933d088ddac43ff482685e2ad
  - id: form
    resource: ../../src/ui/form.ts
    title: Form binding runtime
    git_blob: 21df9a8451977f5d180d4a1170fd004da0c6dad9
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Shared native field values, display and constraints
    git_blob: 24943c238ebb41954764f4ab45306d5e7808b572
  - id: render
    resource: ../../src/ui/field-render.ts
    title: Private explicit field rendering and DOM ownership
    git_blob: 6cee41e892540ca138affb9988ab708506f6cb20
  - id: controls-browser
    resource: ../../tests/browser/grid-controls.spec.ts
    title: Shared native constraints, Form rendering and binding recovery regressions
    git_blob: 6df9b6e36371f8547a3366ea60e1afc9f70e5d56
  - id: path
    resource: ../../src/ui/field-path.ts
    title: Shared safe object field paths
    git_blob: dfac85c3d4cc2c0a61cb2e4ee210b01583ecc5b2
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Private Form and Grid rule runner
    git_blob: 967142342d060056cd3f124db29f6893a2875d48
  - id: formats
    resource: ../../src/ui/format-rules.ts
    title: Retained Form formatter behavior
    git_blob: ba7dbc318be4622e90ec0004846566fd3b5b5362
  - id: validators
    resource: ../../src/ui/validate-rules.ts
    title: Retained Form validator behavior
    git_blob: 4f1439b6e09b066bea1afd26d16b34471d9f4d18
  - id: legacy
    resource: ../../v1/src/natural.data.js
    title: Preserved 1.x formatter and validator behavior
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
generated: { by: codex/gpt-6, at: 2026-10-24T10:10:43Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
  - { by: codex/gpt-6, at: 2026-10-24T10:10:43Z }
---

`bindForm` connects marked fields in authored HTML to local input or a caller-owned `Rows` store. It keeps business JSON separate from display text, retains invalid drafts by row, and uses native controls, grouped choices, and authored error regions.[^form]

# Quick start

```html
<form data-role="detail">
  <label>Email <input data-field="email" data-validate='[["required"],["email"]]'></label>
  <output data-error-for="email"></output>
  <label>Salary <input data-field="salary" data-format='[["commas"]]'></label>
</form>
```

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindForm } from "@bbalganjjm/natural_js/ui";

const rows = createRows([{ email: "ada@example.com", salary: 1200 }]);
const form = bindForm(document.querySelector<HTMLElement>('[data-role="detail"]')!, {
  rows,
  parse: { salary: input => Number(input.replaceAll(",", "")) }
});
form.bind(rows.entries()[0].id);
if (form.validate().valid) console.log(rows.changes());
form.dispose();
rows.dispose();
```

The built-in `required`, `email`, and `commas` rules need no import or registration. `parse` is application code when an entered string must become a number or another raw JSON value. A Form without `rows` reads local controls, such as a search form.[^rules][^form]

# Constructor and markers

`bindForm<T extends object = Record<string, unknown>>(root: HTMLElement, options?): FormHandle<T>` binds one root. Options are `rows?: Rows<T>`, `rules?: RuleSet`, `parse?: Record<string, ParseInput>`, and `render?: Record<string, (value: unknown, context: RuleContext) => Node | string | null>`. A second live binding of that root raises `FORM_IN_USE`; disposal releases it. It leaves authored HTML and CSS in place.[^entry][^form]

| Marker | Meaning |
|---|---|
| `data-field="path"` | Top-level property or safe dot-separated object path, independent of DOM `id`. The root or a descendant may carry it. |
| `data-field-changed` | Rows-backed Form owns `"true"`/`"false"` on every member of a bound field; local Forms leave this attribute to the application. |
| `data-format='[["name",...args]]'` | Ordered display-only formatter calls on text-like inputs, textareas, and text-bound elements. |
| `data-validate='[["name",...args]]'` | Ordered validator calls on the parsed raw candidate. |
| `data-error-for="path"` | Authored field error region; its value matches `data-field`. |

An image field writes the raw value to native `src`; `null` or empty text removes the attribute and leaves authored `alt` unchanged. Ordinary display fields remain text. Explicit rich display uses the `render` option described below.[^native][^render]

Rule names are case-insensitive. Combined validators accept the retained `+` and underscore spellings. Malformed JSON/name tuples raise `RULE_DECLARATION`, unknown names raise `RULE_UNKNOWN`, and invalid built-in arguments raise `RULE_ARGUMENT` at binding. `RuleSet.format` and `RuleSet.validate` can override built-ins per Form; `RuleSet.messages` replaces built-in messages. Built-in messages default to English; a locale beginning with `ko` selects Korean. Domain rules belong in `RuleSet`, not a framework utility package.[^rules]

A path is parsed once. It rejects prototype keys, numeric array indexes, and expressions; a nested write copies that object path and replaces its top-level `Rows` field. Array values can still be stored or replaced as whole fields.[^path][^form]

A nonempty `data-format` list on a Select or non-text input (including radio, checkbox, file, and number) raises `FORM_FORMAT_CONTROL` at binding; changing those controls to display strings would corrupt their value semantics. A file input may bind only to a local Form (`FORM_FILE_ROWS` for Rows); `multiple` file selection is outside this field contract (`FORM_FILE_MULTIPLE`).[^form]

Repeated `data-field` paths are allowed only for radio or checkbox controls. A radio group needs the same native `name` and form owner inside the binding root; its raw value is the checked option string or `null`. One checkbox has a boolean raw value; two or more checkboxes with one `data-field` produce a string array. A native `<select multiple>` produces a string array. Group choices must have distinct values, and all declarations of the same rule attribute in one group must match. The same authored `data-error-for` region describes every group member. Invalid combinations raise `FORM_FIELD_REPEAT`, `FORM_RADIO_OWNER`, `FORM_GROUP_VALUE`, or `FORM_GROUP_RULES`.[^form]

```html
<form data-role="preferences">
  <label><input type="radio" name="level" value="basic" data-field="level" required>Basic</label>
  <label><input type="radio" name="level" value="advanced" data-field="level">Advanced</label>
  <output data-error-for="level"></output>
  <label><input type="checkbox" value="mail" data-field="channels">Mail</label>
  <label><input type="checkbox" value="sms" data-field="channels">SMS</label>
  <label>Tags <select multiple data-field="tags"><option value="a">A</option></select></label>
</form>
```

A parser may convert a scalar radio or single Select string. It cannot attach to a boolean checkbox or array-valued checkbox group or multiple Select (`FORM_PARSE_CONTROL`). Multiple Select and checkbox groups retain arrays for empty and single selections. Only own parser/render configuration entries are callable, including a field named `toString`. These authored Selects are owned by Form until disposal, so a second `bindSelect` on the same element raises `SELECT_OWNED`.[^form][^controls-browser]

## Loaded-value changes

A Rows-backed Form compares each field's committed raw path with `rows.original(id)` and writes `data-field-changed="true"` only when they differ. Nested sibling paths compare independently; arrays and objects compare structurally, and scalars use `Object.is`, including distinct `0` and `-0`. Every radio/checkbox group member receives the same flag. Formatters, custom display DOM, option labels and invalid or deferred drafts do not determine it. Returning the committed value to its loaded value clears the flag.[^form]

Inserted and copied rows have no loaded baseline, so their fields receive `"false"`. An unbound or removed/replaced current row also clears the flags. A focused control can keep its entered text and caret while its flag updates from committed Rows data. A local Form neither writes nor restores this attribute. Disposal of a Rows-backed Form restores each field's exact authored attribute value or absence. Use authored CSS and text to present changes; this marker adds no theme or live announcement. See [Rows](data.md#originalid) for the original-value lifetime.[^form]

## Explicit display

```ts
const form = bindForm(root, {
  rows,
  render: { summary(value, context) {
    const strong = context.element!.ownerDocument.createElement("strong");
    strong.textContent = String(value ?? "");
    return strong;
  } }
});
```

Each configured field must have exactly one display target. The synchronous callback receives its raw value and `RuleContext`; return literal text, `null` to clear, or a fresh disconnected parentless Element, Text or DocumentFragment from the target's document. Configuration, callback failures, recursive updates, async results and invalid/owned returned nodes raise `UI_RENDER` with the binder API, field and callback cause when present. The application creates and sanitizes any trusted DOM; strings are never interpreted as HTML.[^render]

Preflight rejects native value/image controls, editable regions, error regions, simultaneous `data-format`, and targets containing other bound fields/controls/error regions or framework interaction markers. [Grid's shared rendering contract](grid.md#display-rendering) details the same ownership rules. On Form disposal, only custom render targets recover their exact original child nodes; ordinary control values keep the existing Form disposal behavior. There is no new renderer registry or general utility API.[^render][^form][^controls-browser]

A local Form retains each custom display field's original raw text separately from generated DOM. Native input updates reevaluate its display using the current field snapshot; `read()` and validation use the retained raw value, not the renderer's text output. This keeps a display prefix or rich child from becoming application input.[^form]

# Methods

| Method | Behavior |
|---|---|
| `bind(id)` | Shows an existing nondeleted row or clears with `null`. Switching rows retains each row's invalid drafts and restores them on return. A local Form accepts only `null`. |
| `read()` | Returns a detached nested record of marked fields. A row-bound Form reads stored raw values, excluding invalid drafts; a local Form reads current control values without parsing. |
| `validate(id?)` | Combines native HTML constraints and declarative rules. Without an ID, checks the bound row and every row with a retained draft. With an ID, checks that row without rebinding; hidden-row issues have no `element`. A draft made valid by another change enters `Rows` before the final result. |
| `dispose()` | Removes delegated listeners and Rows subscription, releases the root, clears drafts, and restores original error text, field/error ARIA attributes and custom render target child nodes. Rows-backed fields also recover authored `data-field-changed` values or absence. It does not reset ordinary input values. Repeated disposal is safe. |

`ValidationIssue` contains `rowId`, `field`, `rule`, `message`, and an `element` only for visible or local fields. Later calls on a disposed handle raise `FORM_DISPOSED`. `Rows.replace`, removal, and `revert(id?)` discard the affected drafts, including a revert of a clean row. External `Rows.set` preserves drafts and clears stale errors for the visible row without calling application validators from the store subscription. An explicit `validate(id?)` rechecks drafts and commits those now valid before reporting the final state. If a `Rows.set` subscriber throws after an input edit was stored, Form clears that committed draft and propagates the original error; a rejected edit keeps its draft.[^form]

# Input and accessibility

For a scalar field with a parser, Form passes one snapshot of all unparsed entered fields through `RuleContext.values`, then checks native constraints against entered control values. Declared validators receive each parsed field value as a string, with the combined typed candidate in `RuleContext.values`. Grouped radio and checkbox fields use their shared selected-value and `required` check. Candidates from all drafts of one row are combined before cross-field checks such as `equalTo`. Valid candidates enter `Rows`; an invalid or unparseable input remains visible as a row-keyed draft and cannot change its stored raw field. An edit through the same Form rechecks drafts immediately, so an `equalTo` draft can enter `Rows` after its peer changes. After an external `Rows.set`, call `validate()` before saving to recheck and commit any newly valid draft.[^form]

Visible, local and hidden-row native checks share the same candidate rules. Programmatically bound text obeys `minlength`/`maxlength`, as do entered drafts; hidden-row probes need no rebinding. Effective native disabled state and `willValidate` apply, including disabled fieldsets and their first-legend exception. Invalid stored date/time, number/range or color candidates that the native input sanitizes report an issue rather than rewriting stored data. An unsupported authored input type follows its effective browser-native fallback; no date polyfill is added.[^native][^form][^controls-browser]

Native `required` on a radio or repeated checkbox field requires at least one matching choice; its shared error marks every group member. Built-in `required` fails for an unchecked single checkbox; a caller-supplied `required` rule still controls its own result. A local file field validates and reads the first selected filename, while application code takes the `File` or `FormData` for upload.[^form][^rules]

Formatting changes only the displayed text. Focus restores the stored raw value, and blur formats again when no invalid draft remains. When keyboard or programmatic focus starts at the beginning of a formatted control, Form selects its raw text for replacement; pointer focus keeps the clicked caret. Formatter fallback rules can display text for a stored `null` without changing that raw value. Call `validate()` before saving and use `Rows.changes()` for the raw save payload.[^form][^formats]

A matched error region keeps its authored `id` or receives a document-unique one and `aria-live="polite"`; every control in a field group gets that ID in `aria-describedby`. Failed validation sets `aria-invalid="true"` and writes text to the region. Disposal restores the prior attributes/text. Use an authored wrapping `<label>` or another valid HTML label association.[^form]

# 1.x migration notes

| Rule or behavior | 2.0 contract |
|---|---|
| `equalTo` | Its argument is a safe `data-field` path in the same Form/row, such as `[["equalTo","profile.password"]]`, not a document-wide jQuery selector. The 1.x camel-case dispatch defect is corrected. |
| `date` | Formatting is display-only; with no argument it selects a format from the input length, or accepts an explicit format or supported length. Invalid calendar dates remain unchanged for display and fail the `date` validator. Calendar tokens preserve the actual years `0000`–`0099` rather than native constructor remapping to 1900–1999. Use explicit `bindDatePicker` and an application callback to update the input and dispatch its native input event; formatting does not create a calendar. |
| `generic` | `#` accepts one digit, `@` a letter or space, and `~` an alphanumeric or space; `!` escapes the next literal. Unlike the 1.x mask, `#` does not accept whitespace. |
| `numeric` | A checked numeric pattern controls display and optional `round`, `ceil`, or `floor` behavior. Unsupported patterns fail at binding; use `parse` for the raw number. |
| `limit` | Truncates displayed text using the retained one/two-unit character count and optional suffix. It does not set the 1.x `title` tooltip or truncate stored raw data. |
| `replace` | Takes target and replacement strings for display only. The 1.x third argument that wrote a replacement into its value object is not supported; use application parsing or `Rows.set` for a raw change. |

These are the changes needed when moving a Form declaration. The full application migration guide belongs to M8; the preserved [1.x formatter](../../v1/docs/data/formatter.md) and [validator](../../v1/docs/data/validator.md) pages remain reference material.[^legacy][^formats][^validators]

# Pitfalls

- `read()` is not a save gate. A local Form can return invalid entered text; a row-bound Form excludes invalid drafts. Check `validate()` before sending `Rows.changes()`.[^form]
- A parser must return a JSON-compatible raw value. Throwing or returning `undefined` keeps the entered draft and produces a `parse` issue; arbitrary invalid objects are rejected by `Rows`.[^form]
- `data-field` is not a DOM `id`. Repeated and simultaneous authored views must avoid duplicate fixed IDs.[^path]
- Form radio groups keep their authored native name/form-owner contract; [Grid](grid.md) allocates isolated clone names for repeated logical records. Explicit render factories must not mutate Rows or take another field's DOM.[^form][^render]

A shared Rows `move` changes order only, and `append` adds separate clean records. Form retains its bound RowId, draft, validation message and current control focus for both notifications without rerendering or rerunning formatters. Independent copied or appended rows are separate snapshots; Form switches to one only through an explicit `bind(id)`. Form still rejects binding a deleted row even when another Grid shows retained deletion snapshots. See [Rows](data.md) for loaded-row, order and copy semantics.[^form]

# Related

[Rows](data.md) owns row identity and events. [DatePicker](datepicker.md) provides explicit ISO calendar selection. [Select](select.md) describes standalone typed choices; Form owns marked Select fields. [UI contracts](ui.md) defines `RuleSet`, `FormHandle`, and validation results. [The M1 contract](../implementation/m1-contract.md) records the first-release rule boundary.

[^entry]: Public UI entry and Form types
[^form]: Form binding runtime
[^native]: Shared native field values, display and constraints
[^render]: Private explicit field rendering and DOM ownership
[^controls-browser]: Shared native constraints, Form rendering and binding recovery regressions
[^path]: Shared safe object field paths
[^rules]: Private Form and Grid rule runner
[^formats]: Retained Form formatter behavior
[^validators]: Retained Form validator behavior
[^legacy]: Preserved 1.x formatter and validator behavior
