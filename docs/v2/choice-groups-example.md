---
type: Example
title: Authored choice groups in two CVC layouts
description: Generate native radio and checkbox choices before Form in independent authored CVC screens.
tags: [ui, form, cvc, example, accessibility]
status: draft
sources:
  - id: view
    resource: ../../examples/vite/m5/choices.html
    title: Authored fieldsets, templates, two CSS layouts and standalone controls
    git_blob: 3aad48066172837ce2aafcd8e62cd78278d41069
  - id: controller
    resource: ../../examples/vite/m5/choices.ts
    title: Choices before Form, independent CVC records and reverse cleanup
    git_blob: 22af9b2f50b9ec5bf4df0fa258be54157497d239
  - id: group
    resource: ../../src/ui/choice-group.ts
    title: Standalone native generation, selection and replacement
    git_blob: 3b33c92ad50575807dd17e115d130730d0952619
  - id: owner
    resource: ../../src/ui/choice-group-owner.ts
    title: Form claim and public-write exclusion
    git_blob: 5fc27f10b4bc6ee0560d3e7ea59b6dd3b649f990
  - id: form
    resource: ../../src/ui/form.ts
    title: Captured defaults, Rows binding, validation and unbind
    git_blob: 47b163dad56b382ea494ac6ddbb258a587423dd1
  - id: page
    resource: ../../src/page/index.ts
    title: CVC page creation and cleanup
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: browser
    resource: ../../tests/browser/m513-choice-demo.spec.ts
    title: Authored-screen browser contract witnesses
    git_blob: d9b85843296297676c1ba219dc7e7b932c6c4a1a
  - id: legacy
    resource: ../../v1/docs/examples/template/search-grid-detail-horizontal.md
    title: Actual historical gender and favorite-fruit generation-before-Form caller
    git_blob: add6d13e3001ac86ea246e330a0287a3fc057d1f
generated: { by: codex/gpt-6, at: 2026-11-14T07:38:29Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T07:38:29Z }
---

This example loads gender and fruit choices before constructing Form, matching the actual legacy caller's useful workflow. One CVC definition creates two independent screens; authored CSS changes their layouts. A separate standalone group demonstrates replacement without modifying an adopted Form field.[^controller][^view][^legacy]

# Scenario

Run npm run build and npm run example, then open /m5/choices.html. The stacked editor starts with Ada and the chip editor with Bea. Each controller owns its own Rows store; within that screen, its Form and native group inputs edit the same record. The two screens do not share record state.[^controller][^view]

The committed record starts with gender female and favoriteFruit ["banana"]. Before Form construction, the group handles select male and ["apple"]. Form.defaults therefore records those creation values; the later form.bind displays the received record. This difference is deliberate.[^controller][^form]

# Components used

| Owner | Responsibility |
|---|---|
| mountPage | Runs one controller and cleanup lifetime per screen. |
| createRows | Keeps that screen's complete person, original values and committed changes. |
| bindChoiceGroup | Generates native radio/checkbox members from the authored templates. |
| bindForm | Adopts those fixed members, binds the person and owns field validation/captures. |
| Application HTML/CSS | Supplies legends, wrapping labels, controls, stacked layout and chip layout. |

Both fieldsets put data-field on the root. Their item templates contain an input and a data-choice-label span inside a label. The gender template uses native required; the fruit root uses data-validate='[["required"]]' for the existing logical rule. Pear is a disabled choice. No per-item IDs, generated form wrapper or theme is needed.[^view][^controller]

# Controller and lifetime

The controller creates Rows, then both group handles, then Form. Each resource registers with CVC in that order. Cleanup runs in reverse: the source observer stops, Form releases its claims, the groups restore authored nodes, and Rows is disposed. Controller event listeners use the CVC signal; each component removes its own listeners through its handle's dispose.[^controller][^page][^owner]

```ts
const rows = createRows<Person>([{ name: "Ada", gender: "female", favoriteFruit: ["banana"] }]);
own(() => rows.dispose());
const gender = bindChoiceGroup(genderRoot, { choices: genders, value: "male" });
own(() => gender.dispose());
const fruit = bindChoiceGroup(fruitRoot, { choices: fruits, value: ["apple"] });
own(() => fruit.dispose());
const form = bindForm<Person>(formRoot, { rows });
own(() => form.dispose());
```

In the actual controller, init calls form.bind only after cleanup is registered. The complete Rows snapshot feeds the Committed source panel; Form.defaults feeds Captured defaults. Application status text reports validation and editing state.[^controller]

# Try the Form screen

1. Choose a radio, check fruit and edit Name. Native input reaches the current Rows record; the committed source panel follows that store.
2. Use Validate record to display Form issues and focus a returned real field element.
3. Use Revert received values to restore the original person. Received reversion does not replace the captured creation defaults.
4. Use Restore captured fields to call form.unbind. The view returns to the captured fields and automatic editing pauses; Rows remains unchanged. Bind record resumes display and editing of the current source.
5. Close either screen, then reopen its layout. The other screen retains its own record and controller.[^controller][^view][^form]

The adopted handles remain readable, but their public setters and dispose are locked. The screen updates source through Form/Rows. Its close action disposes the owning Form before group cleanup; it does not attempt live adopted choice replacement.[^controller][^owner]

# Try standalone replacement

The top form binds a checkbox group with Apple selected. Choose Apple and Clear selection use setValue. Native changes update the selection output through onChange; Read selection explicitly reads the handle.[^view][^controller]

Choice list selects all fruits, one fruit, no choices or disabled fruits through setChoices. The binder preserves surviving current and native-default selections separately and leaves new choices unchecked. Empty groups still return []; disabled existing choices remain programmatically selectable. Replacement uses the native focus policy defined by the component.[^controller][^group]

Restore native defaults is an authored browser reset button. It resets checkedness to surviving defaultChecked values; use Read selection to refresh the JSON output afterward. It does not load a record, revert Rows or emit a synthetic choice change.[^view][^controller][^group]

# Accessibility and limits

The fieldsets have visible legends and native wrapping labels. The binder isolates generated native names, while Form owns group error associations and change markers. Tab, radio arrows and Space remain native; disabled choices retain their browser interaction. Layout CSS belongs to the example.[^view][^group][^form]

This stage demonstrates generation before Form and standalone replacement. Live Form-owned replacement, broader legacy Select operations and full U10-family acceptance remain required follow-up work. The example adds no code-loading registry, application utility package or new rendering owner. Browser witnesses and final acceptance are recorded separately; this draft is not a claim of completed browser or manual assistive-technology verification.[^owner][^browser][^legacy]

# Related

[bindChoiceGroup](choice-group.md), [Form](form.md), [CVC pages](page.md), [source ownership](form-source.md) and [migration](migration.md).

[^view]: Authored fieldsets, templates, two CSS layouts and standalone controls
[^controller]: Choices before Form, independent CVC records and reverse cleanup
[^group]: Standalone native generation, selection and replacement
[^owner]: Form claim and public-write exclusion
[^form]: Captured defaults, Rows binding, validation and unbind
[^page]: CVC page creation and cleanup
[^browser]: Authored-screen browser contract witnesses
[^legacy]: Actual historical gender and favorite-fruit generation-before-Form caller
