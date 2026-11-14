---
type: UI Component
title: bindChoiceGroup
description: Generate native radio or checkbox choices from an authored fieldset template and adopt them in Form.
tags: [ui, select, form, binding, accessibility]
status: draft
symbols: [bindChoiceGroup, ChoiceGroupHandle]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public choice-group function, handle and shared choice type
    git_blob: 0d3a883198da64468b0a6f967fb49c5423ffbdc4
  - id: group
    resource: ../../src/ui/choice-group.ts
    title: Authored generation, native selection, defaults and focus
    git_blob: 3b33c92ad50575807dd17e115d130730d0952619
  - id: owner
    resource: ../../src/ui/choice-group-owner.ts
    title: Private registration, Form claim and source-value checks
    git_blob: 5fc27f10b4bc6ee0560d3e7ea59b6dd3b649f990
  - id: form
    resource: ../../src/ui/form.ts
    title: Form adoption, validation, captures, reset and retirement
    git_blob: 47b163dad56b382ea494ac6ddbb258a587423dd1
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Shared native group readers and writers
    git_blob: ba5da2de312e41492ce6ead4df8300d13004dd76
  - id: values
    resource: ../../src/ui/value-binding.ts
    title: Strict group value-callback replacement checks
    git_blob: 9f59b5313d2eb0988f7f4dbdbaa37611ccc73184
  - id: required
    resource: ../../src/ui/validate-rules.ts
    title: Existing required text semantics
    git_blob: 4f1439b6e09b066bea1afd26d16b34471d9f4d18
  - id: browser
    resource: ../../tests/browser/choice-group.spec.ts
    title: Standalone authored-group contract witnesses
    git_blob: a45bbbee27c6194d8fa85b10fb5e34e5a37179f7
  - id: form-browser
    resource: ../../tests/browser/form-choice-groups.spec.ts
    title: Form adoption and native-value contract witnesses
    git_blob: 409d559516a9f206d9872b7d70049c4170d9bb34
generated: { by: codex/gpt-6, at: 2026-11-14T07:38:29Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T07:38:29Z }
---

bindChoiceGroup fills an authored fieldset with native radio or checkbox inputs. The authored input type determines the mode once. Radio values are string or null; checkbox values are string arrays even with zero or one choice. The binder supplies behavior and native names; HTML and CSS supply the layout.[^group][^native]

# Quick start

```html
<form data-person>
  <fieldset data-field="favoriteFruit">
    <legend>Favorite fruit</legend>
    <template data-choice-template>
      <label><input type="checkbox"><span data-choice-label></span></label>
    </template>
  </fieldset>
</form>
```

```ts
import { bindChoiceGroup } from "@bbalganjjm/natural_js/ui";

const root = document.querySelector<HTMLFieldSetElement>('[data-field="favoriteFruit"]')!;
const fruit = bindChoiceGroup(root, {
  choices: [{ value: "apple", label: "Apple" }, { value: "banana", label: "Banana" }],
  value: ["apple"]
});
fruit.setValue(["banana"]);
console.log(fruit.value()); // ["banana"]
```

This handle is standalone until Form adopts the marked root. Use input type radio and a scalar string or null for a radio group.[^group][^form]

# Constructor

```ts
bindChoiceGroup(root: HTMLFieldSetElement, options: {
  choices: readonly SelectChoice<string>[];
  value?: string | null | readonly string[];
  onChange?: (value: string | null | readonly string[], event: Event) => void;
}): ChoiceGroupHandle
```

Each choice has a distinct string value, a nonempty string label and optional boolean disabled. Labels are written with textContent. Numbers, booleans and null choice codes are not silently converted. Initial value omission means null for radio or [] for checkbox; a supplied value must have the matching mode and contain no null array entries.[^entry][^group]

The fieldset needs a nonempty legend, aria-label or resolvable aria-labelledby. It must contain one direct template[data-choice-template] with one wrapping label, one radio or checkbox input and one noninteractive data-choice-label target outside that input. The item cannot contain IDs, explicit label-for, nested labels, data-field, other interactive content or checked defaults. Put data-field and Form rules on the fieldset, not generated inputs. Other authored root children remain in place.[^group][^form]

# Methods

| Method | Behavior |
|---|---|
| value() | Returns string/null for radio or a fresh string array in catalog order for checkbox. Available while Form owns the group. |
| setValue(value) | Standalone only. Rejects wrong shapes before changing checkedness; unknown string codes clear/drop from selection and duplicate array entries collapse to native choices. Existing disabled choices can be selected programmatically. |
| setChoices(choices) | Standalone only. Validates and prepares new controls first. Retains surviving current checked values and defaultChecked values separately; new choices start unchecked. It never writes Rows. |
| dispose() | Standalone only. Removes the listener/generated controls, restores exact authored child nodes and owned tabindex, then releases registration. Repeated completed disposal is safe. |

The initial selection sets both checked and defaultChecked. Later setValue changes current checkedness only. Native form reset restores defaultChecked, including defaults retained through setChoices. These native defaults and Form's captured creation values have separate owners.[^group][^form]

Replacement preserves focus outside the group. If an item owned focus, it focuses a surviving enabled item or an enabled neighbor; otherwise the real fieldset is the fallback, with an owned tabindex when needed. A disabled fieldset does not force focus. Native labels, radio arrows, Space, Tab and disabled input behavior remain browser-owned.[^group]

Setter preparation rechecks lifetime and ownership before publication. A newer standalone write during preparation supersedes the outer setter with CHOICE_STALE; disposal or Form adoption also prevents stale publication. Form can adopt a group only after its constructor has published successful initialization, not a provisional descriptor.[^group][^owner]

# Form adoption

Initialize marked groups before bindForm. Form compiles the root as one field, reads its actual native members and preserves checkbox-array shape at every cardinality. With no inputs, the real fieldset supplies the field/error context; there is no proxy input or nullable value-callback element.[^form][^native]

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindForm } from "@bbalganjjm/natural_js/ui";

const rows = createRows([{ favoriteFruit: ["banana"] }]);
const form = bindForm(document.querySelector<HTMLFormElement>("[data-person]")!, { rows });
form.bind(rows.entries()[0].id);

// Change adopted source through Rows; public fruit setters/dispose are locked.
rows.set(rows.entries()[0].id, "favoriteFruit", ["apple"]);
form.dispose();
fruit.dispose();
rows.dispose();
```

Public setValue, setChoices and dispose raise CHOICE_OWNED while adopted. Form.dispose or successful field retirement through rescan releases the claim; unbind does not. Rejected rescan retains old claims, while failed constructor/rescan acquisition releases provisional new claims. Register group cleanup before Form cleanup in CVC so reverse disposal releases Form first. Live choice replacement while adopted remains a required follow-up.[^owner][^form]

Rows values stay raw. Form displays exact matching string codes and reports invalid shapes, duplicate or unavailable codes through its existing validation path without rewriting source or originals. Disabled existing choices remain available. Value-callback replacements are stricter: their shape and every code must be valid for the group, otherwise the checked callback path raises an error. Normalize business values before loading Rows. Group parsers, formatting and display renderers are rejected.[^form][^owner][^values]

# Validation and reset

A template-required radio needs a selection. For required checkboxes, each enabled generated input keeps its native per-control constraint. An empty template-required group receives a Form issue unless effectively disabled, including template disabling; a fieldset alone does not participate in native browser constraint validation.[^form]

Use the root's ordinary required rule for nonempty text semantics. It is not an array-cardinality validator: [""] still fails. Supply an application validator when an empty string is a valid selected code and only cardinality matters. Source shape/availability and native-required constraints remain separate checks.[^form][^required]

Form.defaults and unbind include captured group values; root/member ARIA and change markers follow Form capture/restore. Local Form uses its existing native-reset owner. Rows-backed reset adds no store write or reset subscription: browser checkedness, current Rows data and received reversion remain separate. Use Form.refresh to display the current source again or Rows.revert to restore received values.[^form]

# Events and errors

onChange is captured once and called plainly for native changes from generated members. It observes native state, without promising that Form has committed. Programmatic setters do not dispatch change. Ordinary unbound strict/ESM callbacks receive no implicit component receiver.[^group]

| Error | Cause |
|---|---|
| CHOICE_ROOT / CHOICE_TEMPLATE | Invalid or unnamed fieldset, or invalid authored item structure. |
| CHOICE_OPTIONS / CHOICE_VALUE | Invalid choices/callback or wrong standalone selection shape. |
| CHOICE_OWNED | Duplicate binding or an attempted public write/disposal while Form owns the group. |
| CHOICE_DISPOSED | A non-dispose method is used after disposal. |
| CHOICE_STALE | A newer operation supersedes a setter while it prepares its change. |
| FORM_CHOICE_GROUP / FORM_FORMAT_CONTROL | Form sees an uninitialized group or an unsupported parser/renderer/formatter. |

Keep the template and generated control structure stable during ownership. Use standalone setChoices for catalog changes; release/recreate for a different authored mode. Existing static checkbox groups and native bindSelect keep their own contracts.[^group][^form][^native]

# Related

[Choice groups in two CVC layouts](choice-groups-example.md), [Form](form.md), [source ownership](form-source.md), [value callbacks](value-callbacks.md), [Select](select.md) and [UI contracts](ui.md).

[^entry]: Public choice-group function, handle and shared choice type
[^group]: Authored generation, native selection, defaults and focus
[^owner]: Private registration, Form claim and source-value checks
[^form]: Form adoption, validation, captures, reset and retirement
[^native]: Shared native group readers and writers
[^values]: Strict group value-callback replacement checks
[^required]: Existing required text semantics
[^browser]: Standalone authored-group contract witnesses
[^form-browser]: Form adoption and native-value contract witnesses
