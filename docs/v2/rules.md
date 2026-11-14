---
type: API Reference
title: Shared field rules and automatic validation
description: Supply typed field declarations and shared rule catalogs without global registration or changing authored HTML.
tags: [ui, form, validation]
status: draft
sources:
  - id: types
    resource: ../../src/ui/index.ts
    title: RuleSet, FieldRules and rule callback types
    git_blob: 539621049109c0b416b33081e134dc6c6621aedf
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Shared per-binder declaration compiler and execution
    git_blob: 2971c8dc0dfdacaef95c92b137a231297fc6c14e
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Native value integrity and optional constraints
    git_blob: ba5da2de312e41492ce6ead4df8300d13004dd76
  - id: form
    resource: ../../src/ui/form.ts
    title: Form automatic and explicit validation
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid timing, typed options and atomic paste
    git_blob: 49ad06146be28548099caf2e276adfc7698265b1
  - id: list
    resource: ../../src/ui/list.ts
    title: Display List rules and explicit validation
    git_blob: e97c85d1a9618672a5e84c23b1a38633b5e3d79c
  - id: tree
    resource: ../../src/ui/tree.ts
    title: Tree formatter caller and effective validation restriction
    git_blob: f9984fcd70da26da37d5dbdc0f2960fcc5efa36d
  - id: browser
    resource: ../../tests/browser/shared-rules.spec.ts
    title: Shared declarations, overrides and ownership regressions
    git_blob: 161995ca8a9ef53b749fe810e66740493240c15e
  - id: automatic
    resource: ../../tests/browser/auto-validation.spec.ts
    title: Automatic policy, integrity and explicit-check regressions
    git_blob: 09f4fa7c192a1181a662ecb9f4f1cec082eeb78e
generated: { by: codex/gpt-6, at: 2026-11-14T20:09:48Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T20:09:48Z }
---

# Contract

Pass a RuleSet through the existing rules option. Its format and validate maps associate rule names with functions; fields associates safe data-field paths with ordered rule calls. messages and locale keep the existing per-binder message policy. The framework neither discovers nor globally registers application rules.[^types][^rules]

~~~ts
import { bindForm } from "@bbalganjjm/natural_js/ui";
import type { RuleSet } from "@bbalganjjm/natural_js/ui";

const shared = {
  fields: { salary: { format: [["numeric", "#,##0"]] } }
} satisfies RuleSet;
const rules = {
  ...shared,
  validate: { salaryLimit: value => Number(value) <= 1_000_000 },
  fields: {
    ...shared.fields,
    salary: { ...shared.fields.salary, validate: [["minvalue", 0], ["salaryLimit"]] }
  }
} satisfies RuleSet;
const form = bindForm(root, {
  rows, rules, parse: { salary: value => Number(value.replaceAll(",", "")) }
});
~~~

~~~html
<label>Salary <input data-field="salary" inputmode="decimal" required></label>
<output data-error-for="salary"></output>
~~~

FieldRules has two optional properties, format and validate. Each is a readonly list of readonly [name: string, ...args: unknown[]] tuples. Use existing built-ins or explicitly supplied rule functions. FormatRule receives display text; ValidateRule receives the parsed value as text. Both receive arguments and RuleContext containing field, raw candidate values, rowId and an element only when available.[^types][^rules]

# Declaration precedence

| Per-field property | Effective source |
|---|---|
| A supplied list | Replaces that kind's HTML data-format or data-validate declaration. |
| [] | Removes that kind's rule list, including an ignored malformed HTML declaration. |
| Undefined or omitted | Uses the authored HTML declaration. |

The two kinds resolve independently. Clearing validators does not remove native required, minlength, range or other HTML constraints. Overridden HTML declarations are ignored, including group conflicts for that kind; a fallback kind still enforces existing group consistency. No data attribute is written or removed by typed rule compilation.[^rules][^form][^grid]

All supplied field entries are checked before UI ownership, including unbound entries. Safe paths use the same object-property grammar as data-field; prototype keys, numeric indices and expressions are rejected. Invalid maps/tuples raise RULE_DECLARATION, unavailable names raise RULE_UNKNOWN and invalid built-in arguments raise RULE_ARGUMENT with the binder API and field. Valid unbound entries do nothing, allowing full and reduced templates to share a bundle.[^rules][^browser]

Compilation copies list and argument-array containers once per binder. Referenced argument objects and function closures remain application-owned. Later replacement of a caller's tuple/list does not reconfigure an existing binder; dispose and bind with the new configuration. No per-record rule parsing or new observer/listener is added.[^rules]

# Shared and local configuration

Use ordinary object spreads. Merge format/validate catalogs and literal message maps explicitly when both shared and local entries must survive. Compose message providers with ordinary functions; spreading a function does not resolve its returned map. Merge fields at the map level and then merge an individual field entry when retaining one kind while replacing the other, as salary above does. A replaced tuple list is a complete ordered replacement; there is no implicit deep merge or callback composition. Use consistent catalog spelling when overriding a name: duplicate aliases after case/combined-name normalization are rejected.[^rules]

Form, Grid and List use the same field declaration contract. Effective nonempty formatters retain each component's control restrictions and cannot coexist with a Form/Grid renderer. An explicit empty formatter list can clear an authored format before those checks. Tree supports the same formatter declarations and rejects nonempty effective validation on its bound fields; empty overrides can clear an authored validator declaration. This does not add editable List or general Tree validation.[^form][^grid][^list][^tree][^browser]

# Literal and live message policy

RuleSet.locale accepts a string or () => string. RuleSet.messages accepts a Record<string, string> or () => Record<string, string>. The runner reads each option once at construction. Literal locale and copied own enumerable message entries stay fixed; replacing an option does not reconfigure that runner. Captured functions may deliberately read current application state.[^types][^rules]

~~~ts
const scope = { locale: "en_US", messages: {} as Record<string, string> };
const rules: RuleSet = {
  locale: () => scope.locale,
  messages: () => scope.messages
};
// Existing Forms using these functions observe the next generated message.
scope.locale = "ko_KR";
scope.messages.required = "Enter an employee name.";
~~~

For each generated failed-rule message, call locale first and then messages, once each, plainly with no arguments. Passing validation, skipped optional blank values and a validator's own nonempty message do not call them. Bound functions retain their explicit receiver. A case-insensitive ko prefix selects Korean; every other primitive string selects English. Resolution remains normalized rule-key override, current built-in message, then field/rule text. Placeholder substitution and inert text rendering remain unchanged.[^rules]

Providers must synchronously return the declared value. Invalid literals fail creation with RULE_DECLARATION; provider throws or invalid outputs fail with RULE_FAILED and the current API, field, rule and cause. Promise/thenable outputs are rejected and their rejection is drained. Message results must be non-null, non-array objects with own enumerable nonempty string values and no duplicate normalized keys. Empty maps use the existing fallback. The whole map is checked per generated issue; keep component message maps small. There is no automatic repaint, subscription or whole-validation snapshot.[^rules]

The [configuration test](../../tests/configuration.test.ts) verifies 1000 passing validations without provider/map reads and two generated issues with two scans of a 102-entry map. These operation counts describe this path; they are not timing results. Global custom-rule fallback, standalone rules and remaining catalog/mask parity retain M5.18 ownership.[^rules]

# Automatic versus explicit validation

Form and Grid accept autoValidate?: boolean, default true. False skips automatic HTML constraints and business validators at their existing edit commit points. It preserves parser failures, JSON storage boundaries, native control sanitization/integrity, Grid choice identity and disabled/readOnly edit guards. Form keeps its existing application-owned scalar choice conversion contract.[^form][^grid][^native]

| Operation | autoValidate: false |
|---|---|
| Normal Form edit | Commits parsed values passing integrity checks without automatic native/business constraints. |
| Grid edit | Keeps the existing validateOn timing. change/blur/Enter still reach their normal commit points; manual keeps drafts deferred. |
| Automatic error display | Discards prior constraint results for the affected row and shows current integrity errors. |
| validate() | Performs full precommit reconciliation and returns all native/business issues in its existing scope. |
| Grid paste() or enabled native paste | Retains full validation and atomic batch rejection. |

HTML control types follow the effective browser-native implementation. An unsupported authored date type can fall back to text; this policy adds no control polyfill. Automatic bypass does not rewrite invalid stored values into browser-sanitized values. List is currently display-only and has no automatic-edit policy option.[^native][^list][^automatic]

# Migration boundary

Legacy fRules/vRules field maps become RuleSet.fields; named custom functions still belong to RuleSet.format/validate. Legacy validate:false's normal-edit bypass maps to autoValidate:false, independently of Grid's manual timing. The older unvalidated-paste path, arbitrary global callback/default lifecycles, bind-value hooks and Form raw choice/render mapping remain separate required parity work. No capability exclusion is approved by this contract.

See [Form](form.md), [Grid](grid.md), [List](list.md) and [Tree](tree.md) for their native control, lifecycle and error-result rules. Existing [Form rule catalogs](form.md#1x-migration-notes) retain mask, format, validation, date and byte behavior.

[^types]: RuleSet, FieldRules and rule callback types
[^rules]: Shared per-binder declaration compiler and execution
[^native]: Native value integrity and optional constraints
[^form]: Form automatic and explicit validation
[^grid]: Grid timing, typed options and atomic paste
[^list]: Display List rules and explicit validation
[^tree]: Tree formatter caller and effective validation restriction
[^browser]: Shared declarations, overrides and ownership regressions
[^automatic]: Automatic policy, integrity and explicit-check regressions
