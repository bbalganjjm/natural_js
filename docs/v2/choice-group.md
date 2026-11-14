---
type: UI Component
title: bindChoiceGroup
description: Generate native radio or checkbox choices from an authored fieldset and replace catalogs through its Form owner.
tags: [ui, select, form, binding, accessibility]
status: draft
symbols: [bindChoiceGroup, ChoiceGroupHandle]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public choice-group function, handle and shared choice type
    git_blob: 539621049109c0b416b33081e134dc6c6621aedf
  - id: group
    resource: ../../src/ui/choice-group.ts
    title: Authored generation, native selection, defaults and focus
    git_blob: 55f64a676def493b2b82221138fade4dc0755d2e
  - id: owner
    resource: ../../src/ui/choice-group-owner.ts
    title: Private registration, Form claim and source-value checks
    git_blob: c2fd4d145d27b23dacd67c980f719926083b5b2b
  - id: form
    resource: ../../src/ui/form.ts
    title: Form adoption, validation, captures, reset and retirement
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
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
    git_blob: 9bacad0415336b4b0f47e745d73e6a3400785ccd
  - id: form-browser
    resource: ../../tests/browser/form-choice-groups.spec.ts
    title: Form adoption and native-value contract witnesses
    git_blob: c703cf541e845fbc0081c521c31d8d24901bb977
  - id: live-browser
    resource: ../../tests/browser/form-live-choice-groups.spec.ts
    title: Live Form catalog ownership, drafts, defaults, rollback and focus witnesses
    git_blob: 590f938e05ebfb2e2bb0fcab877c4501f16b9c50
generated: { by: codex/gpt-6, at: 2026-11-14T13:53:41Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T13:53:41Z }
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
| setChoices(choices) | Validates and prepares new controls first. Standalone replacement retains surviving current checked values and defaultChecked separately. An adopting Form mediates membership and displayed selection as described below. The call itself never writes Rows. |
| dispose() | Standalone only. Removes the listener/generated controls, restores exact authored child nodes and owned tabindex, then releases registration. Repeated completed disposal is safe. |

The initial selection sets both checked and defaultChecked. Later setValue changes current checkedness only. Native form reset restores defaultChecked, including defaults retained through setChoices. These native defaults and Form's captured creation values have separate owners.[^group][^form]

Replacement preserves focus outside the group. If an item owned focus, it focuses a surviving enabled item or an enabled neighbor; otherwise the real fieldset is the fallback, with an owned tabindex when needed. A disabled fieldset does not force focus. Native labels, radio arrows, Space, Tab and disabled input behavior remain browser-owned.[^group]

Setter preparation rechecks lifetime and exact ownership before publication. A newer write or a changed registration/Form claim supersedes the outer setter with CHOICE_STALE, including a temporary claim released during preparation. Form can adopt a group only after its constructor has published successful initialization, not a provisional descriptor.[^group][^owner]

# Form adoption

Initialize marked groups before bindForm. Form compiles the root as one field, reads its actual native members and preserves checkbox-array shape at every cardinality. With no inputs, the real fieldset supplies the field/error context; there is no proxy input or nullable value-callback element.[^form][^native]

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindForm } from "@bbalganjjm/natural_js/ui";

const rows = createRows([{ favoriteFruit: ["banana"] }]);
const form = bindForm(document.querySelector<HTMLFormElement>("[data-person]")!, { rows });
form.bind(rows.entries()[0].id);

// Replace the catalog without changing the stored ["banana"] value.
fruit.setChoices([{ value: "apple", label: "Apple" }]);
// Change the adopted source through Rows; direct setValue/dispose stay locked.
rows.set(rows.entries()[0].id, "favoriteFruit", ["apple"]);
form.dispose();
fruit.dispose();
rows.dispose();
```

Public setValue and dispose raise CHOICE_OWNED while adopted. setChoices uses the Form's specific replacement owner. Form.dispose or successful field retirement through rescan releases the claim; unbind does not. Rejected rescan retains old claims, while failed constructor/rescan acquisition releases provisional new claims. Register group cleanup before Form cleanup in CVC so reverse disposal releases Form first.[^owner][^form]

Rows values stay raw. Form displays exact matching string codes and reports invalid shapes, duplicate or unavailable codes through its existing validation path without rewriting source or originals. Disabled existing choices remain available. Value-callback replacements are stricter: their shape and every code must be valid for the group, otherwise the checked callback path raises an error. Normalize business values before loading Rows. Group parsers, formatting and display renderers are rejected.[^form][^owner][^values]

# Live catalogs in Form

Form keeps the same compiled field, path, rules, captured creation value and RowId-keyed drafts when setChoices replaces its members. It retargets native input lookup, error/ARIA/change attributes and local reset ownership to the new controls. An empty group uses its real fieldset as the field/error context. Retired controls no longer commit through Form.[^form][^live-browser]

| View before replacement | Selection after replacement |
|---|---|
| Committed Rows source without a draft | Displays matching raw codes; removing a code leaves source, originals and changes untouched. Reintroducing it displays that stored value again. |
| Current or hidden row draft | Retains the draft under the same field and RowId. The current view shows available draft codes; switching back to a hidden row still finds its draft. |
| Applied explicit value-callback projection without a current draft | Checks its cached replacement against the proposed codes before mutation. An unavailable replacement raises FORM_VALUE and leaves the catalog unchanged. |
| Pending or failed projection | Keeps the current surviving native selection without replaying hooks. The existing explicit refresh path retries the projection. |
| Local, unbound or paused Form | Retains surviving native checkedness. Removed selections drop from local reads; no hidden local raw store is added and paused editing stays paused. |

A current draft takes precedence over an older applied projection. Replacement itself runs no validator, whole/value hook, reconciliation, native change or onChange and does not update Rows. Existing issues retain their messages and point to a current real element; native editing or explicit validate evaluates availability against the new catalog.[^form][^values][^live-browser]

Call setChoices outside active Form bind/render/value/rule work, restoration, reconciliation, rescan or pending local native reset. Release a binding through the normal detach/rescan workflow before changing its declarations, then reattach/rescan to adopt it; changed in-place annotations are rejected. Stale Form generation, binding or source snapshots reject publication. During publication, an active automatic local Form cancels a trusted native reset and invalidates the replacement. Rows-backed, paused or synthetic reset notifications do not use that interception.[^form][^live-browser]

Under unchanged ownership, an ordinary publication failure restores old node identity, checkedness, field maps, issues, attributes, reset listeners and focus. Native publication failures keep their original error; cleanup failures do not replace it. Disposal or newer ownership prevents old DOM from being restored. If application code writes Rows during native insertion, that write remains committed: Form rolls back the catalog and processes the queued external event through its ordinary update path, which may run the normal projections/hooks.[^group][^owner][^form][^live-browser]

# Validation and reset

A template-required radio needs a selection. For required checkboxes, each enabled generated input keeps its native per-control constraint. An empty template-required group receives a Form issue unless effectively disabled, including template disabling; a fieldset alone does not participate in native browser constraint validation.[^form]

Use the root's ordinary required rule for nonempty text semantics. It is not an array-cardinality validator: [""] still fails. Supply an application validator when an empty string is a valid selected code and only cardinality matters. Source shape/availability and native-required constraints remain separate checks.[^form][^required]

Form.defaults retains captured group values even when their codes are absent from the current catalog. unbind restores the captured codes available now, including an empty group; reintroduced codes can be restored by a later unbind. Catalog changes retain only surviving defaultChecked values, so native reset and captured creation values remain separate. Root/member ARIA and change markers follow Form capture/restore.[^form][^live-browser]

Local Form follows the real native form owners, including an explicit fieldset form attribute when the group is empty. Rows-backed reset adds no store write or reset subscription: browser checkedness, current Rows data and received reversion remain separate. Use Form.refresh to display the current source again or Rows.revert to restore received values.[^form][^live-browser]

# Events and errors

onChange is captured once and called plainly for native changes from generated members. It observes native state, without promising that Form has committed. Programmatic setters do not dispatch change. Ordinary unbound strict/ESM callbacks receive no implicit component receiver.[^group]

| Error | Cause |
|---|---|
| CHOICE_ROOT / CHOICE_TEMPLATE | Invalid or unnamed fieldset, or invalid authored item structure. |
| CHOICE_OPTIONS / CHOICE_VALUE | Invalid choices/callback or wrong standalone selection shape. |
| CHOICE_OWNED | Duplicate binding, direct setValue/dispose while adopted, or an owner that cannot mediate catalog replacement. |
| CHOICE_DISPOSED | A non-dispose method is used after disposal. |
| CHOICE_STALE | A newer operation, registration or claim supersedes catalog preparation. |
| FORM_CHOICE_GROUP | Invalid adoption, a group parser/renderer, active/pending Form work, changed annotations or stale Form/source work during replacement. |
| FORM_RESCAN | Form is already reconciling or publishing field membership. This existing guard runs before replacement preflight. |
| FORM_VALUE | The proposed catalog cannot represent an applicable cached explicit callback replacement. |
| FORM_FORMAT_CONTROL | A formatter is assigned to a generated group. |

Keep the template and generated control structure stable during ownership. Use setChoices for standalone or Form-mediated catalog changes; release/recreate for a different authored mode. Existing static checkbox groups and native bindSelect keep their own contracts.[^group][^form][^native]

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
[^live-browser]: Live Form catalog ownership, drafts, defaults, rollback and focus witnesses
