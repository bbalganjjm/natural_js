---
type: Example
title: Authored choice groups in two CVC layouts
description: Generate native choices before Form and replace adopted catalogs in independent authored CVC screens.
tags: [ui, form, cvc, example, accessibility]
status: draft
sources:
  - id: view
    resource: ../../examples/vite/m5/choices.html
    title: Authored fieldsets, two CSS layouts and live/standalone catalog controls
    git_blob: c554545c79bcadfde456a2fd12c3d55fd407f4cd
  - id: controller
    resource: ../../examples/vite/m5/choices.ts
    title: Choices before Form, live adopted replacement and reverse CVC cleanup
    git_blob: f96d11b580743c6a8ccad5582f110bbc7551c159
  - id: group
    resource: ../../src/ui/choice-group.ts
    title: Standalone native generation, selection and replacement
    git_blob: 55f64a676def493b2b82221138fade4dc0755d2e
  - id: owner
    resource: ../../src/ui/choice-group-owner.ts
    title: Form claim, catalog handoff and direct value/dispose exclusion
    git_blob: c2fd4d145d27b23dacd67c980f719926083b5b2b
  - id: form
    resource: ../../src/ui/form.ts
    title: Captured defaults, Rows binding, validation and unbind
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
  - id: page
    resource: ../../src/page/index.ts
    title: CVC page creation and cleanup
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: browser
    resource: ../../tests/browser/m513-choice-demo.spec.ts
    title: Authored-screen browser contract witnesses
    git_blob: 242fc8dff970819a134ef35adc5bb4fb44e486ba
  - id: legacy
    resource: ../../v1/docs/examples/template/search-grid-detail-horizontal.md
    title: Actual historical gender and favorite-fruit generation-before-Form caller
    git_blob: add6d13e3001ac86ea246e330a0287a3fc057d1f
generated: { by: codex/gpt-6, at: 2026-11-14T13:53:41Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T13:53:41Z }
---

This example loads gender and fruit choices before constructing Form, matching the actual legacy caller's useful workflow. One CVC definition creates two independent screens; authored CSS changes their layouts. Each screen replaces its adopted Fruit catalog through the same group handle. A separate standalone group demonstrates native replacement and reset.[^controller][^view][^legacy]

# Scenario

Run npm run build and npm run example, then open /m5/choices.html. The stacked editor starts with Ada and the chip editor with Bea. Each controller owns its own Rows store; within that screen, its Form and native group inputs edit the same record. The two screens do not share record state.[^controller][^view]

The committed record starts with gender female and favoriteFruit ["banana"]. Before Form construction, the group handles select male and ["apple"]. Form.defaults therefore records those creation values; the later form.bind displays the received record. This difference is deliberate.[^controller][^form]

# Components used

| Owner | Responsibility |
|---|---|
| mountPage | Runs one controller and cleanup lifetime per screen. |
| createRows | Keeps that screen's complete person, original values and committed changes. |
| bindChoiceGroup | Generates native radio/checkbox members from the authored templates. |
| bindForm | Adopts each group field, mediates catalog membership and owns binding, validation and captures. |
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
2. Change Fruit choices to No choices, Only Apple, All fruits or Disabled fruits. The controller calls fruit.setChoices through Form ownership. The source and captured-default panels stay unchanged; restored catalog codes display the corresponding source again.
3. Use Validate record to evaluate the current catalog, display issues and focus a returned real field element. Catalog replacement does not itself rerun validation or clear old issues.
4. Use Revert received values to restore the original person. Received reversion does not replace the captured creation defaults.
5. Use Restore captured fields to call form.unbind. Available captured fields return and automatic editing pauses; Rows remains unchanged. Catalog replacement still works while paused. Bind record resumes display and editing of the current source.
6. Close either screen, then reopen its layout. The other screen retains its own record, catalog and controller.[^controller][^view][^form]

Fruit choices uses the native select marked data-live-catalog in each authored screen. Its change listener supplies a complete new catalog; it does not write Rows, dispatch a synthetic choice change or recapture creation defaults. A zero-choice checkbox field remains an array-valued Form field with its real fieldset/error context. The other screen's catalog stays independent.[^controller][^view][^form]

Adopted value reads and setChoices remain available; direct setValue and dispose stay locked. Source changes go through native Form edits or Rows. Closing disposes the owning Form before group cleanup. Captured Apple creation values and surviving defaultChecked values remain separate: removing and reintroducing Apple does not recreate a lost native default, while a later unbind can restore its captured value.[^controller][^owner][^form]

# Try standalone replacement

The top form binds a checkbox group with Apple selected. Choose Apple and Clear selection use setValue. Native changes update the selection output through onChange; Read selection explicitly reads the handle.[^view][^controller]

Choice list selects all fruits, one fruit, no choices or disabled fruits through setChoices. The binder preserves surviving current and native-default selections separately and leaves new choices unchecked. Empty groups still return []; disabled existing choices remain programmatically selectable. Replacement uses the native focus policy defined by the component.[^controller][^group]

Restore native defaults is an authored browser reset button. It resets checkedness to surviving defaultChecked values; use Read selection to refresh the JSON output afterward. It does not load a record, revert Rows or emit a synthetic choice change.[^view][^controller][^group]

# Accessibility and limits

The fieldsets have visible legends and native wrapping labels. The binder isolates generated native names, while Form owns group error associations and change markers. Tab, radio arrows and Space remain native; disabled choices retain their browser interaction. Layout CSS belongs to the example.[^view][^group][^form]

This example demonstrates generation before Form, live Form-owned catalogs and standalone replacement. Broader Select/index/append/reset, generated row declarations and full U10-family acceptance remain required owner work. The example adds no code-loading registry, application utility package or new rendering owner. Browser witnesses and final acceptance are recorded separately; this draft is not a claim of completed browser or manual assistive-technology verification.[^owner][^browser][^legacy]

# Related

[bindChoiceGroup](choice-group.md), [Form](form.md), [CVC pages](page.md), [source ownership](form-source.md) and [migration](migration.md).

[^view]: Authored fieldsets, two CSS layouts and live/standalone catalog controls
[^controller]: Choices before Form, live adopted replacement and reverse CVC cleanup
[^group]: Standalone native generation, selection and replacement
[^owner]: Form claim, catalog handoff and direct value/dispose exclusion
[^form]: Captured defaults, Rows binding, validation and unbind
[^page]: CVC page creation and cleanup
[^browser]: Authored-screen browser contract witnesses
[^legacy]: Actual historical gender and favorite-fruit generation-before-Form caller
