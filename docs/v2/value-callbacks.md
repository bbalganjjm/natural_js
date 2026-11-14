---
type: API Reference
title: ValueBindContext
description: Project mounted Form, Grid and List values without changing raw Rows or validation.
tags: [ui, binding, callbacks]
status: draft
symbols: [ValueBindContext]
sources:
  - id: ui
    resource: ../../src/ui/index.ts
    title: Common public field value context
    git_blob: 0d3a883198da64468b0a6f967fb49c5423ffbdc4
  - id: binding
    resource: ../../src/ui/value-binding.ts
    title: Shared checked invocation, native replacements and write order
    git_blob: 9f59b5313d2eb0988f7f4dbdbaa37611ccc73184
  - id: form
    resource: ../../src/ui/form.ts
    title: Form cache, input and lifetime owner
    git_blob: 47b163dad56b382ea494ac6ddbb258a587423dd1
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid mounted-field, draft, focus and projection owner
    git_blob: 09ffaa47fbc1245bf8dec049a251a84ea41cfa21
  - id: list
    resource: ../../src/ui/list.ts
    title: Read-only List projection and refresh owner
    git_blob: 35b8bfff7026d894082cd9471326728182066937
  - id: browser
    resource: ../../tests/browser/collection-values.spec.ts
    title: Shared callback, raw-value and lifecycle witnesses
    git_blob: 5c2576a91c9b69b41f1e192db56ad3ec3635d678
generated: { by: codex/gpt-6, at: 2026-11-14T07:38:29Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T07:38:29Z }
---

beforeBindValue(value, context) and onBindValue(value, context) are synchronous optional callbacks on Rows-backed Form, Grid and List. ValueBindContext replaces the pre-release FormValueContext name without an alias. Pass the same application-owned functions explicitly to each binder; no global registry or implicit FormOptions inheritance is involved.[^ui][^binding]

# Context and order

The frozen context extends RuleContext with nonnull rowId, primary bound HTMLElement and phase: "bind" | "val". values is the immutable source-raw snapshot, including fields not displayed in this element. Populated grouped controls use their first element; an empty generated group uses its actual fieldset. A prepared clone may be detached while it is being bound for placement; pure offscreen validation/probing never invents an element or runs value hooks. Grid revealInvalid may subsequently mount a real invalid row; that projection uses the normal binding callbacks.[^ui][^form][^grid][^list]

Before receives source raw. Its effective result passes through the existing native, formatter or explicit-render writer, then after observes the written view and receives that projected raw. A different after result is checked and written once. Undefined preserves the current value; false, null, zero and empty string are values. A replacement is a finite native scalar or scalar array for a multiple-value field; one static checkbox requires boolean. Typed choices require available raw option occurrences. Unmarked native Selects keep native string conversion rather than typed occurrence matching. Structured display uses Form/Grid render; List has no render option and keeps text/native read-only output.[^binding]

Callbacks are captured once and called as plain functions, with the same context for the before/after pair. Errors retain API-specific VALUE_OPTIONS/VALUE codes, callback, field, row and phase where available, and the cause. Thenables fail the synchronous contract and their rejection is drained; stale/disposed value work may suppress that failure. One application-composed function remains one callback unit: framework checks follow its return, not each application subcall.[^binding][^form]

# Raw ownership, cache and refresh

Projection does not write Rows, originals, changed fields, business validation or save data. Validation and parsers receive raw data; invalid input drafts retain their entered raw. An available display choice does not make an unavailable stored choice valid. Options-only Select fields have no named value callback.[^form][^grid][^list]

| Owner | Execution boundary |
|---|---|
| Form | Retains its existing explicit bind/full or selected refresh, raw-change cache, focused input deferral, drafts and row lifetime. Local Forms still reject value hooks. |
| Grid | New/remounted fields and explicit refresh use bind; committed raw changes on retained fields use val. Editable text reveals raw on focus and restores cached projection on blur. |
| List | Initial/newly shown records and explicit visible refresh use bind; retained committed raw changes use val. Hidden retained records do not execute hooks. |

Successful unchanged projections remain cached. Corrected policy does not implicitly invalidate that cache. Explicit refresh or raw change retries a failed projection; choice-source changes recheck cached replacement availability. Native defaults, received-source reversion and component disposal retain their existing owners.[^form][^grid][^list]

# Application-owned live policy

```ts
import type { ValueBindContext } from "@bbalganjjm/natural_js/ui";

const policy = { prefix: "Employee: " };
const shared = {
  beforeBindValue(value: unknown, context: ValueBindContext) {
    if (context.field === "name" && context.element.tagName === "SPAN") {
      return policy.prefix + String(value);
    }
  }
};
// Pass { rows, ...shared } to each binder, keeping each Rows/lifetime explicit.
policy.prefix = "Person: ";
form.refresh(); grid.refresh(); list.refresh();
```

The stable callback deliberately reads the current application policy. Value callback references stay captured; changing the original options object does not install new value callbacks. Other component options retain their own contracts. The [Grid demo](grid-demo.md#shared-value-policy-preview) provides the executed three-owner example. [Form presets](form.md#shared-options-and-callback-composition) specifies shallow composition and optional local/shared pipelines.[^binding][^form]

# Failure and lifetime

Generation, source and disposal checks prevent stale framework writes and placement after callback work. Grid/List reject recursive binding with their BIND_REENTRANT codes; source changes may already have committed before a subscription reports that failure. Correct the callback and refresh. Earlier application/DOM side effects are not rolled back. Callback failures during construction release owned resources so the same authored root can retry.[^form][^grid][^list][^browser]

Whole Form observers, Grid row/completion hooks and selection retain their own lifecycle and ordering. No-hook operation uses the existing binding paths without value contexts or extra callback checkpoints. Local-source hooks, per-unbound-key observations, broader implicit defaults and full legacy parity remain outside this selected contract.[^form][^grid][^list]

# Generated group replacements

For an initialized choice group adopted by Form, radio replacements accept a string or null; checkbox replacements require a string array at zero, one or many choices. Duplicate, unavailable or nonstring entries fail before writing the view. Null is a valid unselected radio value even without a null catalog entry. A zero-choice group uses its actual fieldset as `context.element`; populated groups use their first input. Projection never normalizes Rows or originals. Static single checkboxes keep boolean replacement semantics. [Choice groups](choice-group.md) defines the generation/adoption boundary.[^binding][^form]

[^ui]: Common public field value context
[^binding]: Shared checked invocation, native replacements and write order
[^form]: Form cache, input and lifetime owner
[^grid]: Grid mounted-field, draft, focus and projection owner
[^list]: Read-only List projection and refresh owner
[^browser]: Shared callback, raw-value and lifecycle witnesses
