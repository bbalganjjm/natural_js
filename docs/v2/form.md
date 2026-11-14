---
type: UI Component
title: bindForm
description: Bind authored Form fields to local raw input or Rows with formatting, typed choices, validation and accessible errors.
tags: [ui, form, binding, accessibility]
status: draft
symbols: [bindForm, FormOptions]
sources:
  - id: live-choice-browser
    resource: ../../tests/browser/form-live-choice-groups.spec.ts
    title: Live group catalog, draft, capture, reset, failure and focus witnesses
    git_blob: 590f938e05ebfb2e2bb0fcab877c4501f16b9c50
  - id: source-browser
    resource: ../../tests/browser/form-source.spec.ts
    title: Application normalization and complete raw source observation regressions
    git_blob: 0e8312b36bc6ec7c537b7dd4ca2d4a78e525881b
  - id: value-binding
    resource: ../../src/ui/value-binding.ts
    title: Private checked value callback execution shared with Grid and List
    git_blob: 9f59b5313d2eb0988f7f4dbdbaa37611ccc73184
  - id: presets-browser
    resource: ../../tests/browser/form-presets.spec.ts
    title: Explicit preset precedence and application callback composition regressions
    git_blob: 7d8a8307172217bc7bbf0d0c226d423510ed31af
  - id: discovery-browser
    resource: ../../tests/browser/form-discovery.spec.ts
    title: Explicit field adoption, retirement, ownership and recovery regressions
    git_blob: 08086d812c18dc6c0699e2c6b5277db4e272d313
  - id: defaults
    resource: ../../src/ui/native-defaults.ts
    title: Private native creation record and synchronous parser builder
    git_blob: 52fef0da7eb41701170a48d4cbf4c2e7febd498e
  - id: defaults-browser
    resource: ../../tests/browser/form-defaults.spec.ts
    title: Captured defaults, unbind, native files and inactive ownership regressions
    git_blob: 27c73285a0c4eb8fb3cd9297bff9ac6fe91e4888
  - id: binding-browser
    resource: ../../tests/browser/form-binding.spec.ts
    title: Whole-row lifecycle and same-row selected refresh regressions
    git_blob: 871b7dd1055123b008978f792688eb78b544fef5
  - id: local-browser
    resource: ../../tests/browser/form-local.spec.ts
    title: Local raw formatting, native reset, lifecycle and CVC regressions
    git_blob: 2c3d9d0ac8453a9e4e8039cddf2e9e9d4fa1ffa9
  - id: values-browser
    resource: ../../tests/browser/form-values.spec.ts
    title: Value projection, raw validation, focus and stale callback regressions
    git_blob: 8b4cc588a9e80407dba1fc545d4a0773e4b3120e
  - id: options
    resource: ../../src/ui/row-options.ts
    title: Shared row option extraction, DOM, selection and availability
    git_blob: 4d7359d7fdafb0fda5fafb0ee81372b26722538a
  - id: options-browser
    resource: ../../tests/browser/form-options.spec.ts
    title: Typed Form choices, occurrence identity and owned lifetime regressions
    git_blob: 2361a6ce248a83450a1d4465f5d5ea1dc5eaaa28
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public UI entry and Form types
    git_blob: 539621049109c0b416b33081e134dc6c6621aedf
  - id: form
    resource: ../../src/ui/form.ts
    title: Form binding runtime
    git_blob: 08985e05ef5675e4b359655e410bb018a01eca51
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Shared native field values, display and constraints
    git_blob: ba5da2de312e41492ce6ead4df8300d13004dd76
  - id: render
    resource: ../../src/ui/field-render.ts
    title: Private explicit field rendering and DOM ownership
    git_blob: 676d0e69a7cfc6eafab93b3abf5cd32c1a5a4a6c
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
    git_blob: 2971c8dc0dfdacaef95c92b137a231297fc6c14e
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
generated: { by: codex/gpt-6, at: 2026-11-14T20:09:48Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
  - { by: codex/gpt-6, at: 2026-11-14T20:09:48Z }
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

# Shared options and callback composition

Import FormOptions<T> from the UI entry to type an application-owned preset. Pass each screen's Rows in its instance call; object spread copies option properties, not the store, functions, DOM or referenced rule arguments. The employee controller reuses its company-email rule and salary parser this way.[^entry][^presets-browser]

```ts
import { bindForm, type FormOptions } from "@bbalganjjm/natural_js/ui";

type Employee = { name: string; salary: number };
const shared: FormOptions<Employee> = {
  autoValidate: false,
  parse: { salary: text => Number(text.replaceAll(",", "")) }
};
// root and rows belong to this screen.
const detail = bindForm(root, { ...shared, rows, autoValidate: true });
```

Later own properties win, including undefined. Omit a property to inherit it; own undefined removes an inherited callback or selects the ordinary framework default. For example, autoValidate: undefined restores true, while false overrides true. Null is not a typed substitute: null callbacks retain FORM_BIND/FORM_VALUE_OPTIONS errors and null autoValidate retains FORM_VALIDATE. Callbacks and catalogs are captured when constructing the Form; replacing preset properties later does not reconfigure it. Explicit locale/message providers can read live state; see [shared rules](rules.md#literal-and-live-message-policy).[^form][^presets-browser]

Object spread is shallow. Merge parse/render maps, RuleSet format/validate/fields maps and literal message maps, and each affected FieldRules entry explicitly when both declarations must survive. Ordered format/validate tuple lists replace; [] clears that kind. Shared argument objects remain application-owned, so avoid mutating them during a callback. Given shared and local presets typed FormOptions<Employee>, this example combines their maps, merges salary's entry and clears its formatting. Merge other overlapping field entries explicitly too:[^rules][^presets-browser]

```ts
const sharedMessages = shared.rules?.messages;
const localMessages = local.rules?.messages;
const options: FormOptions<Employee> = {
  ...shared,
  ...local,
  parse: { ...shared.parse, ...local.parse },
  render: { ...shared.render, ...local.render },
  rules: {
    ...shared.rules, ...local.rules,
    format: { ...shared.rules?.format, ...local.rules?.format },
    validate: { ...shared.rules?.validate, ...local.rules?.validate },
    messages: () => ({
      ...(typeof sharedMessages === "function" ? sharedMessages() : sharedMessages),
      ...(typeof localMessages === "function" ? localMessages() : localMessages)
    }),
    fields: {
      ...shared.rules?.fields, ...local.rules?.fields,
      salary: { ...shared.rules?.fields?.salary, ...local.rules?.fields?.salary, format: [] }
    }
  }
};
```

The message function above intentionally resolves the two captured policies on every generated issue; local entries win. Referenced literal map changes are live in this explicit composition. Use a literal merged map instead when both policies must stay fixed. No framework merge helper is required.[^rules]

When two callbacks must run, capture their function references and write their order in the application. This value pipeline preserves local output if shared returns undefined; all-undefined stays undefined, which matters for an unavailable choice. False, null, zero and empty text remain values. The small thenable check belongs to this example, not the framework API.[^form][^presets-browser]

```js
const thenable = value => value !== null &&
  (typeof value === "object" || typeof value === "function") && typeof value.then === "function";
const localValue = local.beforeBindValue;
const sharedValue = shared.beforeBindValue;
const beforeBindValue = (value, context) => {
  const first = localValue(value, context);
  if (thenable(first)) return first;
  const last = sharedValue(first === undefined ? value : first, context);
  return last === undefined ? first : last;
};
```

This recipe assumes both captured callbacks exist. Call references as plain functions, with the same frozen context and bind/val phase; do not use an options object as their receiver. Forward intermediate thenables immediately to Form's existing synchronous-result handling. Current value thenables fail and drain rejection; stale/disposed value work may suppress that failure. Whole-callback thenables still fail. Do not swallow a Promise or continue the application tail after receiving it.[^form][^presets-browser]

A whole observer can return immediately when its local result is exact false, otherwise call the shared observer. That false only skips the application's shared tail; it does not veto Form binding. The same immediate thenable forwarding applies. For a legacy after-value observer that needs original-input notification, call local(value, context), skip shared on exact false/thenable, then call shared(value, context); explicitly return the intended replacement. This is a separate recipe from the value pipeline.[^form][^presets-browser]

The combined function is one Form callback. Form checks its final return, current source/generation and disposal after the function returns. It cannot cancel arbitrary application subcalls: a shared tail may run after local code rebinds or disposes the Form, and a temporary invalid intermediate can be converted to a valid final value. Existing guards prevent stale framework projection after that return. No callback-layer engine, implicit global registry or deep merge is added.[^form][^presets-browser]

# Constructor and markers

`bindForm<T extends object = Record<string, unknown>>(root: HTMLElement, options?: FormOptions<T>): FormHandle<T>` binds one root. Options are `rows?: Rows<T>`, `rules?: RuleSet`, `parse?: Record<string, ParseInput>`, `autoValidate?: boolean`, `render?: Record<string, (value: unknown, context: RuleContext) => Node | string | null>`, `beforeBindValue?: (value: unknown, context: ValueBindContext) => unknown`, `onBindValue?: (value: unknown, context: ValueBindContext) => unknown`, `beforeBind?: (context: FormBindContext<T>) => unknown` and `onBind?: (context: FormBindContext<T>) => unknown`. Both callback pairs require Rows. A second live binding of that root raises `FORM_IN_USE`; disposal releases it. It leaves authored HTML and CSS in place.[^entry][^form]

The [shared rule contract](rules.md) defines RuleSet.fields, per-kind TS/HTML precedence, empty-list overrides and shared/local composition. autoValidate defaults to true; false bypasses automatic native/business constraints while retaining parse/JSON/native-value integrity and disabled/readOnly edit guards. It clears stale row constraint results at automatic evaluation. Explicit validate() still performs full precommit checks. This is independent of native value conversion and the application-owned scalar choice parser.[^form][^rules]

| Marker | Meaning |
|---|---|
| `data-field="path"` | Top-level property or safe dot-separated object path, independent of DOM `id`. The root or a descendant may carry it. |
| `data-field-changed` | Rows-backed Form owns `"true"`/`"false"` on every member of a bound field; local Forms leave this attribute to the application. |
| `data-format='[["name",...args]]'` | Ordered display-only formatter calls on text-like inputs, textareas, and text-bound elements. |
| `data-validate='[["name",...args]]'` | Ordered validator calls on the parsed raw candidate. |
| `data-error-for="path"` | Authored field error region; its value matches `data-field`. |

An image field writes the raw value to native `src`; `null` or empty text removes the attribute and leaves authored `alt` unchanged. Ordinary display fields remain text. Explicit rich display uses the `render` option described below.[^native][^render]

Rule names are case-insensitive. Combined validators accept the retained `+` and underscore spellings. For effective declarations, malformed JSON/name tuples raise `RULE_DECLARATION`, unknown names raise `RULE_UNKNOWN`, and invalid built-in arguments raise `RULE_ARGUMENT` at binding. `RuleSet.format` and `RuleSet.validate` can override built-ins per Form; `RuleSet.messages` replaces built-in messages. Built-in messages default to English; a locale beginning with `ko` selects Korean. The [shared message policy](rules.md#literal-and-live-message-policy) also accepts captured synchronous locale/message functions for existing instances. Domain rules belong in `RuleSet`, not a framework utility package.[^rules]

A path is parsed once. It rejects prototype keys, numeric array indexes, and expressions; a nested write copies that object path and replaces its top-level `Rows` field. Array values can still be stored or replaced as whole fields.[^path][^form]

A nonempty effective formatter list on a Select or non-text input (including radio, checkbox, file, and number) raises `FORM_FORMAT_CONTROL` at binding; changing those controls to display strings would corrupt their value semantics. A file input may bind only to a local Form (`FORM_FILE_ROWS` for Rows); `multiple` file selection is outside this field contract (`FORM_FILE_MULTIPLE`).[^form]

Repeated `data-field` paths are allowed only for radio or checkbox controls. A static radio group needs the same native `name` and form owner inside the binding root; its raw value is the checked option string or `null`. One static checkbox has a boolean raw value; two or more checkboxes with one `data-field` produce a string array. An unmarked native `<select multiple>` produces a string array. Group choices must have distinct values. For each kind falling back to HTML, all declarations of that attribute in one group must match; a typed override ignores that kind's HTML. The same authored `data-error-for` region describes every group member. Invalid combinations raise `FORM_FIELD_REPEAT`, `FORM_RADIO_OWNER`, `FORM_GROUP_VALUE`, or `FORM_GROUP_RULES`.[^form]

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

A parser may convert a static scalar radio or unmarked single Select string. Marked row-local choices already supply raw values and reject string parsers. On static fields, attaching a parser to a checkbox or multiple Select raises `FORM_PARSE_CONTROL`. Initialized generated groups reject parsers with `FORM_CHOICE_GROUP`. Multiple Select and checkbox groups retain arrays for empty and single selections. Only own parser/render configuration entries are callable, including a field named `toString`. These authored Selects are owned by Form until disposal, so a second `bindSelect` on the same element raises `SELECT_OWNED`.[^form][^controls-browser]

## Row-local typed choices

A Rows-backed Form recognizes a native Select with data-field, data-options, data-option-label and data-option-value. The selected value and option source may use different nested paths. All three option paths compile through the existing safe path owner. Marked local Forms, unsupported elements, missing markers and string parsers on marked choices fail before ownership or ARIA changes. An effective formatter still requires a text-like field. Marked choices use the existing constructor options.[^form][^options]

```html
<label>Shift
  <select data-field="assignment.chosen" data-options="assignment.shifts"
    data-option-label="meta.label" data-option-value="code" required>
    <option value="">Choose a shift</option>
  </select>
</label>
<output data-error-for="assignment.chosen"></output>
```

Options use literal text labels. Authored empty values map to null; other authored values remain strings. Generated options retain raw strings, finite numbers, booleans or null, including a generated empty string distinct from null. Single selection uses the first Object.is match. Multiple selection consumes one matching option per array item and reads in DOM order. A duplicate request such as [1,1] needs two raw-1 options. Rendering never rewrites the stored array. Declare every supported raw value type in the application's row type; HTML choices do not widen an inferred TypeScript field type.[^options][^form]

Availability uses the target row's effective values and its own option source, including validate(otherId) and hidden-row drafts. Null needs a real null option. Full validation rejects required scalar null/empty-string and empty multiple arrays; [null] and [""] are selections when their matching options exist. Foreign/unmapped and disabled selected options cannot enter Rows through events. Raw identity and occurrence checks remain mandatory with autoValidate:false; explicit validation also runs required/native and business rules.[^form][^options-browser]

Options refresh before displaying the committed value or raw draft, and unchanged source references retain option nodes. Removing an option preserves an invalid draft rather than replacing it with a prompt. Direct bind prepares every marked source before changing the binding or DOM, so a malformed later source preserves the previous selection. A nonarray source raises FORM_OPTIONS; absent/null lists are empty. Subscription errors remain post-commit and do not roll back Rows. A Form-owned render guard stops stale later-field work after callback replacement/rebind/disposal.[^form][^options-browser]

bind(null) removes generated row choices without writing data. Initialization failure or disposal restores the exact authored children and initial selection and releases Select ownership. Repeated disposal and late events are quiet. Local and unmarked authored Selects keep their existing string/scalar-parser behavior. Local callbacks and wider Form raw rendering retain separate follow-up scope.[^form][^options-browser]

## Value callbacks

Rows-backed Form accepts synchronous beforeBindValue and onBindValue functions. The [shared value contract](value-callbacks.md) also applies to Grid/List; Form retains its own bound-row, draft, focus and refresh rules. One frozen ValueBindContext extends RuleContext with phase "bind" or "val", a nonnull rowId and the primary bound HTMLElement. Its values snapshot contains source raw fields, not display projections. Populated grouped controls use their first member as element; empty generated groups use their actual fieldset. Functions receive explicit arguments; Form supplies no special this or global wrapper.[^entry][^form][^values-browser]

```ts
const form = bindForm(root, {
  rows,
  beforeBindValue(value, context) {
    if (context.field === "active" && context.element.tagName === "SPAN") {
      return value ? "Active" : "Inactive";
    }
  },
  onBindValue(value, context) {
    console.log(context.field, context.phase, value, context.element);
  }
});
```

beforeBindValue receives source raw. Its effective result goes through the existing native, formatter or display writer. onBindValue then receives that projected raw and observes the written view. Undefined preserves the current value; false, null, zero and empty string replace it. A changed after result is checked and written once without replaying either callback. Formatter/render callbacks may run twice when an after result changes their input. An unchanged cached projection still uses the existing whole-row formatter/render behavior.[^form][^values-browser]

Explicit replacements accept finite JSON scalars or scalar arrays for array controls. A static single checkbox requires a boolean. Marked Select replacements require matching raw option occurrences; unmarked native controls retain string coercion. Rejected shapes, async/thenable, structured object or DOM returns raise FORM_VALUE. Use render for structured/DOM display. Scalar-array replacements are copied and frozen. Undefined leaves existing source-display behavior intact, including an unavailable loaded choice. Every explicit replacement is checked even with autoValidate:false. A cached explicit choice is checked again against current options without replaying the callbacks; an unavailable projection raises FORM_VALUE until an explicit bind refreshes it.[^form][^native][^values-browser]

These callbacks change presentation only. Form.read(), Rows source/originals/status/changes, save payloads and data-field-changed retain actual raw data. Native and business validation use raw/candidate values; raw false projected true still fails required, and display padding cannot satisfy raw minlength. Callback options on local Forms or nonfunctions fail preflight with FORM_VALUE_OPTIONS before ownership/ARIA changes. Local Forms retain their existing DOM-owned contract.[^form][^values-browser]

An explicit bind(id) starts a bind cycle even when raw is equal. A changed raw restored by revert uses bind; committed updates and valid draft commits use val with the NEW raw. Per-field raw/row caching prevents callback replay for read, validation without a commit, move/append, unrelated rows or sibling paths, and focus-only restoration. Use explicit bind to refresh a projection depending on another field. An unchanged reset restores an applied projection or preserves its unapplied focused cycle.[^form][^values-browser]

A focused editable text field shows source raw and defers both callbacks until blur. Readonly text stays projected and binds immediately while focused. Explicit rebind shows the new row's raw immediately; unrelated updates retain the pending phase. Blur runs the latest pending cycle once, or restores the applied projection without callbacks. An invalid draft stays visible and cannot replace stored data. Unbind, current-row removal/replacement and disposal clear pending projections without callbacks.[^form][^values-browser]

Failures identify field, row, phase, callback and cause. During an active before/after value cycle, recursive work on the same field/row fails FORM_VALUE. Rebinding another row during that cycle may complete that row; generation/source checks suppress stale results, including formatter/render results before DOM commit. Ordinary cached, null or no-callback renderer recursion retains UI_RENDER. This is not a whole-Form transaction: earlier DOM writes, committed Rows changes and application side effects are not rolled back. An unchanged failed cycle stays quiet on unrelated repaint; explicit bind or a real row/raw change retries it. Callback output supplies no automatic inverse mapping for edited controls; normalize business values explicitly before loading or through a Rows write.[^form][^render][^values-browser]

## Whole-row binding and refresh

For hidden business keys and nested source JSON, use the existing full row in whole hooks and a page-owned Rows subscription for committed changes. [Source ownership](form-source.md) gives executed receive/observe/cleanup recipes and exact timing. These operations add no missing-field value callback or hidden source writeback; Form.read remains marked-field data.[^form][^source-browser]

Whole-row hooks observe full binding through one context: readonly root: HTMLElement, row: RowSnapshot<T> and event: RowsEvent | null. The immutable raw row includes unbound keys, identity and status. Constructor rendering does not call the hooks. Both options require Rows and functions; invalid options fail FORM_BIND before root/Select ownership or ARIA changes.[^entry][^form][^binding-browser]

```ts
const form = bindForm(root, {
  rows,
  beforeBind({ row }) { console.log("Binding", row.id, row.value); },
  onBind({ row }) { console.log("Bound", row.id, row.value); }
});
form.bind(id);                  // Full identity switch; before, fields/errors, after.
form.refresh();                 // Full refresh of the same row.
form.refresh(["salary"]);       // Refresh this compiled field; keep the current row.
```

Explicit nonnull bind and full refresh run beforeBind, the existing full field/draft/error pass, then onBind with event null. Reverting the current live row runs the same whole hooks with its original RowsEvent, even when changed:false; unchanged value callbacks are not forced by revert. A focused editable text projection may still wait for blur: onBind reports the completed synchronous pass. Keyed edits, input commits, validation, focus repaint, append/move/unrelated rows and local/unbound rendering do not run whole hooks. A vanished/deleted current row clears through the existing unbound path.[^form][^binding-browser]

Whole hooks ignore ordinary returns, including false. They cannot veto or replace raw values. Throwing or returning an async/thenable result raises FORM_BIND with callback, rowId and cause; rejected async work is drained. A before failure preserves the previous association, Form DOM and visible issues. An after failure keeps completed writes. Rows.revert has already committed source and invalidated reverted drafts before its hook; source and application side effects are not rolled back. A nested newer bind supersedes the old pass and suppresses its after hook; same-row/cyclic whole-hook entry fails and releases its guard for later recovery.[^form][^binding-browser]

A renderer cannot recursively refresh the same active field/RowId; this fails UI_RENDER and releases its private marker for retry. A failure propagating through a whole-row hook is wrapped as FORM_BIND with the renderer failure as its cause. During an active whole-row or value callback pass, different-row nested binding remains allowed; ordinary cached/no-hook/null rendering retains its existing recursion policy. Selected refresh from whole hooks outside that active renderer pair remains allowed. A newer render generation suppresses the older pass rather than publishing its stale renderer result.[^form][^binding-browser]

refresh(fields) accepts only an array of exact compiled data-field paths. It preflights all names and every selected typed option source before writing any selected field. Duplicates collapse and groups update atomically in DOM compilation order. An empty array does nothing after the disposal check, apart from already-completed local native reset cleanup. Invalid field names or a nonarray argument raise FORM_BIND; malformed selected option sources retain FORM_OPTIONS. Neither preflight failure partially refreshes selected fields. The selection never changes RowId, commits/parses input, validates or clears drafts/issues. Selecting every field still suppresses whole hooks.[^form][^binding-browser]

Only selected writers/value projections and option sources run. Focused editable text/caret follows the existing deferral policy; unselected input, errors, option nodes and drafts remain untouched. A malformed unselected choice source does not block another field. Local selected refresh uses existing raw/display ownership without whole hooks. Full unbound refresh reuses bind(null); selected unbound Rows refresh repaints only its selected empty fields. Refresh uses already compiled fields; use rescan for explicit field discovery. Direct hot-declaration equivalence remains required.[^form][^binding-browser]

## Field rediscovery

`rescan(): void` explicitly reconciles the marked fields and error/reset ownership in the current authored HTML. It does not project data values, run hooks/rules/parsers/renderers, commit input, select a row, write Rows or resume automatic binding. Ordinary bind/refresh/read/validate keep using compiled fields. After inserting markup, discover it and request only the projection you need:[^form][^discovery-browser]

```ts
departmentHost.append(departmentFields);
detail.rescan();
detail.refresh(["profile.department"]);
// Later, release that authored subtree without changing its stored value.
departmentFields.remove();
detail.rescan();
```

Compatible bindings retain the exact Field, raw/projection, issues, current/other-row drafts and creation capture: the path, native shape, ordered members and binding annotations stay the same. Reordering independent fields or moving unchanged controls between valid native form owners preserves those values. Error-region replacement preserves the control/draft and publishes already-known issues to the new region. Generated error IDs remain document-unique; original ARIA and old-region state are restored.[^form][^discovery-browser]

New bindings capture their complete live native/UI state once at adoption. A clean reshaped group is one new binding with the complete current native group capture. Retired bindings disappear from read/defaults and release Select, display, error/reset, raw/projection and private File resources. Retained captures do not change. Any retained row draft, including a valid uncommitted candidate, blocks retirement/replacement/reshaping with FORM_RESCAN and field/row identity. Known local issues or invalid raw caches also block retirement, including static displays; resolve or explicitly discard them first. Rescan does not validate to decide whether a draft is safe. A generated group's setChoices uses the specific catalog handoff below and retains its compiled field and drafts; it is not binding retirement or direct declaration editing.[^form][^discovery-browser][^live-choice-browser]

Binding annotations on owned nodes are fixed: data-field, format/validate/choice declarations, native type/multiple and grouped name/value metadata. Direct changes fail FORM_RESCAN. Detach the element/subtree, rescan to release, edit while detached, then reattach and rescan to adopt. Marker-only release must remove all binding/choice annotations; orphan data-options retains FORM_OPTIONS. New HTML rules use the existing captured catalogs/parsers. Function catalogs stay fixed; known render targets may temporarily disappear, while constructor rejection of unknown renderer targets remains.[^form][^discovery-browser]

Rescan rejects active Form work and pending native reset cleanup with FORM_RESCAN. Let reset cleanup finish, or flush through read/refresh after dispatch completes and before changing markup. During reconciliation, other public work is blocked except dispose; synthetic input and subscription projection/hooks are suppressed. Rows structural bookkeeping still prunes drafts and detaches a removed/replaced current row. These application mutations may clear obsolete issues; they do not trigger a stale value projection.[^form][^discovery-browser]

Structural/claim preflight completes before old ownership changes, retaining specific existing error codes. An unexpected native commit failure reports FORM_RESCAN with cause; the retained or published graph keeps drafts and can retry rescan or dispose. Reset listener retry uses the same native handler identity. Earlier DOM/application side effects are not rolled back. No-op rescan does not repaint or clear input/errors. There is no observer or automatic per-bind query.[^form][^discovery-browser]

## Captured defaults and unbind

Form captures live marked native values and the authored restoration view once, before its initial local formatting/rendering. Programmatic presets established before construction belong to this capture; later bind, refresh, native reset and Rows.revert do not replace it. Native default properties, captured values and received row originals are separate checkpoints.[^form][^defaults-browser]

An explicit rescan adds one capture for each newly adopted binding and removes retired captures. Defaults/unbind use the active adopted bindings; compatible fields keep their original capture. Callers that never rescan retain the construction-time behavior above.[^form][^discovery-browser]

defaults(): Record<string, unknown> returns detached native creation values, including readonly/disabled controls, nested paths and stable group shapes. Static/image fields and unbound business keys are excluded. Marked Selects use captured authored raw mappings; files contribute the first captured filename, without exposing private File references. Applicable own parsers see one complete unparsed native record, rowId null and the authored element. No formatting, validation, DOM/Rows write, error/draft change, native-reset flush or automatic resume occurs.[^form][^defaults]

Undefined, async/thenable, uncloneable, throwing or recursively entered parsers raise FORM_DEFAULTS; rejected promises are drained and guards release for retry. Duplicate native paths and parent/child conflicts fail before parsing in either order. Results do not claim complete T: the application supplies business identifiers, option sources, omitted properties and supported Rows JSON values.[^defaults][^defaults-browser]

```ts
const initial = form.defaults();
form.unbind(); // Restore the construction view; leave Rows unchanged.
const id = rows.add({
  email: typeof initial.email === "string" ? initial.email : "",
  salary: typeof initial.salary === "number" ? initial.salary : 0
});
form.bind(id); // Explicitly bind the new row and resume automatic behavior.
```

unbind(): void restores captured native values/checkedness, selected option occurrences, exact static/custom-rendered child nodes and exact image src attribute presence/value. It leaves alt, application disabled/readOnly state and native default properties unchanged. Marked choices recover their authored nodes/mapping; unmarked option structure stays application-owned and only still-present captured selected options are restored. No whole/value hook, formatter, renderer, parser or Rows notification runs from restoration itself.[^form][^defaults-browser]

The current Rows association and its invalid draft are dropped; other-row drafts and all committed Rows values/status/originals/changes remain. Rows-backed data-field-changed becomes false while unbound; local markers stay application-owned. Root, Select and error/ARIA ownership remain until dispose. Framework errors clear; native custom validity remains application-owned. Rows read() keeps marked paths with undefined values when no row is bound; use the caller-held RowId and Rows for the source record.[^form][^defaults-browser]

Automatic input/change, focus formatting, pointer tracking and framework reset cleanup stop after unbind. Explicit local read/validate still work; selected refresh remains display-only and does not resume automatic behavior. Full bind/refresh resumes it. For Rows, bind(id) chooses a new source; bind(null)/full unbound refresh clears the view. For a local Form, bind(null)/full refresh resumes the current raw display. These operations do not restore captured values themselves.[^form][^defaults-browser]

Native file restoration keeps actual captured File references privately, reconstructs a native FileList and assigns files; it never writes a nonempty filename. Empty captured selection clears the control. Reconstruction preflights before association/reset/DOM changes; failure raises FORM_UNBIND with field/cause. Uploads remain application File/FormData code, and existing Rows/multiple-file restrictions remain. Disposal releases the private restoration references and keeps its existing normal restoration behavior.[^form][^defaults-browser]

Unbind invalidates older binding/render/candidate work and pending reset cleanup. Recursive same-owner restoration fails FORM_UNBIND and releases its guard; newer full work can supersede restoration outside an active same-owner local display frame. The inherited FORM_RENDER guard still bounds local renderer → unbind → nested local resume. Superseded tails cannot clear newer issues. Native reset default action still runs after an in-dispatch unbind unless the application cancels it; application/native side effects are not rolled back.[^form][^defaults-browser]

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

Preflight rejects native value/image controls, editable regions, error regions, simultaneous nonempty effective formatters, and targets containing other bound fields/controls/error regions or framework interaction markers. [Grid's shared rendering contract](grid.md#display-rendering) details the same ownership rules. Rows-backed Form restores custom render targets' exact original child nodes on disposal. Local display cleanup also includes formatted static targets and raw control/image restoration described below. There is no new renderer registry or general utility API.[^render][^form][^controls-browser]

A local Form retains each custom display field's original raw text separately from generated DOM. Native input updates reevaluate its display using the current field snapshot; `read()` and validation use the retained raw value, not the renderer's text output. This keeps a display prefix or rich child from becoming application input.[^form]

## Local raw input and native reset

A Form without Rows also applies effective formatters. It retains raw only for fields whose formatter/renderer writes display; other controls, groups, Select and files stay native. Formatted text controls and images remember the last Form-written value/src so a later direct property/attribute write is read as new raw. Static renderer/formatted text retains its authored raw separately. An input event explicitly establishes entered raw, even when it equals the previous projection. Local read() returns unparsed native values; validation and defaults() apply parsers to their separate candidate records. RuleContext.rowId is null.[^form][^local-browser][^defaults]

```html
<form>
  <label>Amount <input data-field="amount" value="1200" data-format='[["commas"]]' pattern="[0-9]+"></label>
  <output data-error-for="amount"></output>
  <button type="reset">Reset fields</button>
</form>
```

```ts
const form = bindForm(root, { parse: { amount: Number } });
form.read(); // { amount: "1200" }; an unfocused control displays "1,200".
form.bind(null); // Refresh local display and clear visible errors, without replacing raw.
```

A formatted local static target cannot be editable, an error region, or contain interactive controls, bound fields or error regions (FORM_FORMAT_CONTROL). Ordinary decorative children and supported image src targets remain allowed. This preflight runs before ownership or DOM writes.[^form][^local-browser]

Initial binding, input, blur and local bind(null) use the same format/native/render owners. Editable focused text shows raw and preserves its caret. Readonly text stays formatted. An entered value found invalid stays raw. A changed native raw value invalidates that retained result; later validation establishes its new status. This state is separate from visible error cleanup. Programmatic writes are collected by read/validate/refresh; dispatch input to refresh dependent display. A formatted text control's native constraints use a raw-filled probe, including custom validity and effective disabled state. File inputs keep native validation and are never assigned a filename by this mechanism.[^form][^native][^local-browser]

Native form.reset() and reset buttons restore current native defaults. Local Form observes the effective form owners captured at binding for its valid controls and static fields, including an ancestor or form= owner outside the root. After moving compatible controls within the supported binding root, call rescan() to reconcile native reset ownership once observed reset cleanup has settled. Existing radio owner/name restrictions still apply. A canceled reset changes no retained raw, generated display or owned errors. Untrusted synthetic reset notifications do not run framework reset cleanup; native default behavior may differ by browser. Call the native method or activate a reset button for the reset contract.[^form][^local-browser]

Framework cleanup runs in a queued task after the native default action. Public local read/validate, subsequent input/focus or bind(null) flush completed pending resets synchronously. An in-dispatch read still sees pre-reset raw. Immediate validation or later input therefore survives an older queued cleanup. Coalesced resets are applied once per affected owner; another owner's raw, focus and errors remain. Reset refreshes formatted controls from native DOM, retains static/renderer raw and refreshes dependent display. User-owned native custom validity follows browser behavior.[^form][^local-browser]

Initialization failure restores written control values, exact authored children and image src attributes and releases ownership. Disposal cancels pending reset work/listeners, restores latest raw values/src to local formatted controls/images and restores authored children for local static display. It leaves alt unchanged; empty image raw uses the native writer's removal rule. Disposal/rebinding cannot recapture separators or display prefixes as raw. Rows disposal retains its existing behavior.[^form][^native][^local-browser]

Formatter/renderer results check current lifetime, generation and their target raw before DOM commit. An obsolete target write stops later field work. Recursive local display refresh raises FORM_RENDER (possibly wrapped by RULE_FAILED or UI_RENDER); earlier application/DOM side effects are not rolled back. Keep display callbacks focused on computing display and use input or an explicit refresh for application data changes.[^form][^render][^local-browser]

Received/business records, full unbound keys and received insert checkpoints belong in Rows. Local formatting adds no separate dataset, setter, callback type or registration API. beforeBindValue/onBindValue remain Rows-only. Native defaults differ from legacy live InitialData; use the explicit [migration recipes](migration.md) for those workflows.[^form][^entry][^local-browser]

# Methods

| Method | Behavior |
|---|---|
| `bind(id)` | Shows an existing nondeleted row or clears with `null`. Switching rows retains each row's invalid drafts and restores them on return. Local Form accepts only null to refresh current raw display and clear visible errors. |
| `refresh(fields?)` | Full current-row refresh when omitted; otherwise refresh only compiled paths with no identity switch, validation or issue clearing. Whole hooks run only for a nonnull full row. |
| `defaults()` | Detached captured native creation values with applicable own parsers; does not alter the current view/source. |
| `rescan()` | Reconcile authored fields and resource ownership without data projection, input commits or automatic resume. |
| `unbind()` | Restore the captured view, discard the current row association/draft and suspend automatic binding; retain the reusable owner and unrelated drafts. |
| `read()` | Returns a detached nested record of marked fields. A row-bound Form reads stored raw values, excluding invalid drafts; a local Form reads current control values without parsing. |
| `validate(id?)` | Combines native HTML constraints and declarative rules. Without an ID, checks the bound row and every row with a retained draft. With an ID, checks that row without rebinding; hidden-row issues have no `element`. A draft made valid by another change enters `Rows` before the final result. |
| `dispose()` | Removes listeners, pending local reset work and Rows subscription, releases ownership and restores error/ARIA state. Rows-backed fields recover authored change markers and custom render children. Local formatted controls/images recover latest raw; local static display recovers authored children. Other ordinary input values remain. Repeated disposal is safe. |

`ValidationIssue` contains `rowId`, `field`, `rule`, `message`, and an `element` only for visible or local fields. Later calls on a disposed handle raise `FORM_DISPOSED`. `Rows.replace`, removal, and `revert(id?)` discard the affected drafts, including a revert of a clean row. External `Rows.set` preserves drafts and clears stale errors for the visible row without calling application validators from the store subscription. An explicit `validate(id?)` rechecks drafts and commits those now valid before reporting the final state. If a `Rows.set` subscriber throws after an input edit was stored, Form clears that committed draft and propagates the original error; a rejected edit keeps its draft.[^form]

# Input and accessibility

With default automatic validation, Form passes one snapshot of all unparsed entered fields through `RuleContext.values`, then checks native constraints against entered control values. Declared validators receive each parsed field value as a string, with the combined typed candidate in `RuleContext.values`. Grouped radio and checkbox fields use their shared selected-value and `required` check. Candidates from all drafts of one row are combined before cross-field checks such as `equalTo`. Valid candidates enter `Rows`; an invalid or unparseable input remains visible as a row-keyed draft and cannot change its stored raw field. An edit through the same Form rechecks drafts immediately, so an `equalTo` draft can enter `Rows` after its peer changes. After an external `Rows.set`, call `validate()` before saving to recheck and commit any newly valid draft.[^form]

Visible, local and hidden-row native checks share the same candidate rules. Programmatically bound text obeys `minlength`/`maxlength`, as do entered drafts; hidden-row probes need no rebinding. Effective native disabled state and `willValidate` apply, including disabled fieldsets and their first-legend exception. Invalid stored date/time, number/range or color candidates that the native input sanitizes report an issue rather than rewriting stored data. An unsupported authored input type follows its effective browser-native fallback; no date polyfill is added.[^native][^form][^controls-browser]

Native `required` on a static radio or static repeated-checkbox field requires at least one matching choice; its shared error marks every group member. Built-in `required` fails for an unchecked single checkbox; a caller-supplied `required` rule still controls its own result. A local file field validates and reads the first selected filename, while application code takes the `File` or `FormData` for upload.[^form][^rules]

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
- Static Form radio groups keep their authored native name/form-owner contract; [Grid](grid.md) allocates isolated clone names for repeated logical records. Explicit render factories must not mutate Rows or take another field's DOM.[^form][^render]

A shared Rows `move` changes order only, and `append` adds separate clean records. Form retains its bound RowId, draft, validation message and current control focus for both notifications without rerendering or rerunning formatters. Independent copied or appended rows are separate snapshots; Form switches to one only through an explicit `bind(id)`. Form still rejects binding a deleted row even when another Grid shows retained deletion snapshots. See [Rows](data.md) for loaded-row, order and copy semantics.[^form]

# Related

[Rows](data.md) owns row identity and events. [DatePicker](datepicker.md) provides explicit ISO calendar selection. [Select](select.md) describes standalone typed choices; Form owns marked Select fields. [UI contracts](ui.md) defines `RuleSet`, `FormHandle`, and validation results. [The M1 contract](../implementation/m1-contract.md) records the first-release rule boundary.

# Authored choice groups

Initialize [bindChoiceGroup](choice-group.md) on each named `fieldset[data-field]` before creating Form. Form adopts its private native descriptor: radio is string/null; generated checkbox groups are string arrays even with zero or one choice. The first input is the primary callback element, or the actual fieldset when empty. Static single checkboxes keep boolean values. Root declarations, errors and change markers include the real group root and members; no hidden control is created.[^form][^native]

Rows retain received raw values. The view checks only exact string codes, while validation reports wrong shapes, duplicate entries and unavailable choices; disabled catalog choices remain available. Value-callback replacements require valid available string/null or string-array values. Group formatting, display renderers and string parsers are rejected. Native required checkboxes require each enabled input; use a root `data-validate` rule for logical selection. The existing text-based required rule still rejects `[""]`. A template-required empty group produces a Form issue unless effectively disabled; the fieldset alone does not participate in browser native constraint validation.[^form]

Creation selection sets native defaults before Form captures. `defaults()`, local native reset, captured restoration through `unbind()` and Rows reversion keep their existing distinct owners. Rows-backed native reset does not write Rows. Direct group setValue/dispose raise CHOICE_OWNED while adopted, including while Form is unbound. Dispose Form first, or successfully retire the field through rescan, to release that claim. Failed acquisition releases provisional claims; rejected rescan retains old claims.[^form]

The existing group setChoices call can replace a Form-owned catalog through its specific owner. Form keeps the same field, raw Rows/originals, every row draft and captured creation values; it retargets native members, errors/ARIA/change markers and local reset owners. Current drafts override old display caches. Without a draft, an applicable cached explicit callback replacement must fit the proposed codes or FORM_VALUE rejects before mutation. Raw unavailable source is retained; pending/failed projections do not replay. Local/unbound/paused views keep surviving native checkedness, and paused editing stays paused.[^form][^live-choice-browser]

Catalog replacement itself writes no Rows and runs no reconciliation, validator, whole/value hook, native change or onChange. It retains known issues until ordinary editing/validation changes them. Form's existing FORM_RESCAN guard rejects entry while it is reconciling or publishing field membership. Other active Form work, pending local reset, changed declarations and stale binding/source work raise FORM_CHOICE_GROUP. Release through detach/rescan before editing declarations; direct in-place changes remain rejected. An active automatic local Form cancels a trusted native reset during publication; Rows-backed, paused or synthetic notifications retain their existing policy.[^form][^live-choice-browser]

Ordinary publication failure rolls back old native nodes/maps/attributes/issues/listeners and restores focus under unchanged ownership. External Rows writes remain committed and their queued events follow the ordinary Form update path after rollback; those events may run normal hooks. Disposal/newer ownership cannot restore retired DOM. Native defaultChecked keeps only surviving codes, while defaults retains the original capture and unbind can restore captured codes reintroduced later. See [choice groups](choice-group.md) and the [two-layout CVC example](choice-groups-example.md) for the complete replacement boundary.[^form][^live-choice-browser]

[^entry]: Public UI entry and Form types
[^local-browser]: Local raw formatting, native reset, lifecycle and CVC regressions
[^values-browser]: Value projection, raw validation, focus and stale callback regressions
[^form]: Form binding runtime
[^source-browser]: Application normalization and complete raw source observation regressions
[^options]: Shared row option extraction, DOM, selection and availability
[^options-browser]: Typed Form choices, occurrence identity and owned lifetime regressions
[^native]: Shared native field values, display and constraints
[^render]: Private explicit field rendering and DOM ownership
[^controls-browser]: Shared native constraints, Form rendering and binding recovery regressions
[^path]: Shared safe object field paths
[^rules]: Private Form and Grid rule runner
[^formats]: Retained Form formatter behavior
[^validators]: Retained Form validator behavior
[^legacy]: Preserved 1.x formatter and validator behavior
[^binding-browser]: Whole-row lifecycle and same-row selected refresh regressions
[^defaults]: Private native creation record and synchronous parser builder
[^defaults-browser]: Captured defaults, unbind, native files and inactive ownership regressions
[^presets-browser]: Explicit preset precedence and application callback composition regressions
[^discovery-browser]: Explicit field adoption, retirement, ownership and recovery regressions
[^live-choice-browser]: Live group catalog, draft, capture, reset, failure and focus witnesses

[^value-binding]: Private checked value callback execution shared with Grid and List
