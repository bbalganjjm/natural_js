---
type: Guide
title: Migrating a 1.x screen to Natural-JS 2.0
description: Move a 1.x search/list/detail screen, changed-row save, and Popup or Tab page to scoped ESM APIs.
tags: [project, migration, cvc, form]
status: draft
sources:
  - id: legacy-screen
    resource: ../../v1/docs/examples/template/search-grid-detail-horizontal.md
    title: Preserved 1.x search, grid, detail, and save example
    git_blob: add6d13e3001ac86ea246e330a0287a3fc057d1f
  - id: legacy-comm
    resource: ../../v1/src/natural.architecture.js
    title: Preserved 1.x page loading and request serialization
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
  - id: legacy-ui
    resource: ../../v1/src/natural.ui.js
    title: Preserved 1.x Form, Grid, Popup, and Tab behavior
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: legacy-data
    resource: ../../v1/src/natural.data.js
    title: Preserved 1.x data sync and rule dispatch
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
  - id: package
    resource: ../../package.json
    title: Implemented 2.0 ESM package entries
    git_blob: 393602a69677d5fdaf7968fd49b19efd1b7d5cae
  - id: page
    resource: ../../src/page/index.ts
    title: Page definition, scoped root, output, and lifecycle
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: rows
    resource: ../../src/data/index.ts
    title: RowId, changes, and immutable row values
    git_blob: fd3a3668649af8c7c270be5f7250bd01759823e8
  - id: comm
    resource: ../../src/comm/index.ts
    title: Explicit request payload, decoder, and cancellation
    git_blob: f3650ddbfeb5d87c3e58dc84904df9704e994368
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public UI bindings and rule types
    git_blob: 6610eb68f3b484b5eccd323c116ceef61d21b8db
  - id: form
    resource: ../../src/ui/form.ts
    title: Form fields, drafts, and validation
    git_blob: 8c703966458830609cdda07e398009795ef5fbcf
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid row field dispatch and validation
    git_blob: f1194e961ddbd2881c365362b45731c694a01716
  - id: viewport
    resource: ../../src/ui/grid-viewport.ts
    title: Measured Grid viewport, anchoring and cleanup
    git_blob: 671b4e3bd886cbe159e851ebcd3625f1fd9ea2ae
  - id: viewport-browser
    resource: ../../tests/browser/grid-viewport.spec.ts
    title: Viewport logical scopes, typed paste and lifecycle regressions
    git_blob: 94b18cca941e2a8e5003c91a0346d4c07fa9b0cd
  - id: blocks
    resource: ../../src/ui/grid-row-blocks.ts
    title: Authored logical row blocks and native adjacent merging
    git_blob: bc21fd1cc985184a332034bf26bfddd40f1434a3
  - id: blocks-browser
    resource: ../../tests/browser/grid-row-blocks.spec.ts
    title: Multi-row identity, logical paste, merging and native geometry regressions
    git_blob: 04da68b796a5b2a0066f715fdacc8e10d1dbd58d
  - id: native
    resource: ../../src/ui/native-control.ts
    title: Shared native value, display and constraint contracts
    git_blob: 24943c238ebb41954764f4ab45306d5e7808b572
  - id: render
    resource: ../../src/ui/field-render.ts
    title: Explicit field rendering without HTML string evaluation
    git_blob: 6cee41e892540ca138affb9988ab708506f6cb20
  - id: controls-browser
    resource: ../../tests/browser/grid-controls.spec.ts
    title: Native groups, validation timing, display and isolation regressions
    git_blob: 6df9b6e36371f8547a3366ea60e1afc9f70e5d56
  - id: list
    resource: ../../src/ui/list.ts
    title: List row field dispatch and validation
    git_blob: 578c0619b9262c497a11d078d07832d0f1fdf4b6
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Private declarative rule dispatch
    git_blob: 967142342d060056cd3f124db29f6893a2875d48
  - id: formats
    resource: ../../src/ui/format-rules.ts
    title: Retained formatter and internal mask/date operations
    git_blob: ba7dbc318be4622e90ec0004846566fd3b5b5362
  - id: validators
    resource: ../../src/ui/validate-rules.ts
    title: Retained validators, equalTo, and byte rules
    git_blob: 4f1439b6e09b066bea1afd26d16b34471d9f4d18
  - id: employee
    resource: ../../examples/vite/m4/employees.ts
    title: Runnable search/list/detail controller and save flow
    git_blob: c15ab21168b93cb5675d2ddbf1c3fa18bfef557c
  - id: employee-runner
    resource: ../../examples/vite/m4/main.ts
    title: Runnable employee page mounting
    git_blob: 1d670bd4d61cb8600e28f2ac66cd85ab63b240d0
  - id: employee-view
    resource: ../../examples/vite/m4/side.html
    title: Authored employee screen markers
    git_blob: 701b6b74a863ed41bb92f80b423b1a7a94be6cd2
  - id: containers
    resource: ../../examples/vite/m7/main.ts
    title: Runnable main, Popup, and keyed Tab page flow
    git_blob: 96e37e19f8596b57caffe0845a121b2c626db875
  - id: containers-view
    resource: ../../examples/vite/m7/side.html
    title: Authored dialog and Tab markup
    git_blob: 0ea08c34a50524406eaffde2a550f4fc39be5de3
  - id: employee-test
    resource: ../../tests/browser/m4-screen.spec.ts
    title: Search, validation, payload, and cancellation browser checks
    git_blob: 068f35a366cad8dec2bcb563d12e59aaec45f3ac
  - id: containers-test
    resource: ../../tests/browser/m7-screen.spec.ts
    title: Popup and Tab browser checks
    git_blob: 67c6bdd310b8083059548eccbfec369678dd5167
  - id: format-test
    resource: ../../tests/format-rules.test.ts
    title: Retained formatter catalog and mask/date checks
    git_blob: 84d979da980a0105f85a5abc15f73bf0683fa6ae
  - id: validator-test
    resource: ../../tests/validate-rules.test.ts
    title: Retained validator catalog, byte, and equalTo checks
    git_blob: 95036684db9e663af1b723bd85e48fb89efc9278
  - id: rules-test
    resource: ../../tests/rules.test.ts
    title: Declarative dispatch and combined-name checks
    git_blob: 70f1881b500b99c138c04c834258ed57eb6021be
  - id: parity
    resource: ../implementation/feature-parity.md
    title: Required 1.x framework behavior and current 2.0 gaps
    git_blob: 73330951d3aa6b77b4fbc1ae533e6c5617fd8e3d
  - id: parity-plan
    resource: ../implementation/feature-parity-plan.md
    title: Full framework feature coverage execution plan
    git_blob: 5ba1d09c171ba5d80fe51d529f6110c686cc2300
generated: { by: codex/gpt-6, at: 2026-10-20T15:04:19Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-25T00:41:28Z }
  - { by: codex/gpt-6, at: 2026-10-20T15:04:19Z }
---

Migrate one screen by keeping its authored HTML and CVC roles, then replace implicit global registration, row indexes, and request serialization with explicit page, data, UI, and communication objects. The linked M4 and M7 examples are executable 2.0 screens; the preserved 1.x example is a reference that requires its original application services.[^legacy-screen][^employee][^containers]

# Goal

| 1.x screen mechanism | 2.0 owner |
|---|---|
| `N(view).cont(...)` and `N(container).comm(pageUrl).submit()` | `mountPage(host, { view, controller }, input)` |
| `N(selector, view)` and jQuery event methods | `context.root.querySelector(...)` and `addEventListener(..., { signal: context.signal })` |
| Element `id` as a data key; selected grid index | `data-field="path"` and store-local `RowId` |
| `N.ds`, `grid.data("modified")`, row `rowStatus` | Caller-owned `Rows`, `rows.changes()`, and an explicit server payload |
| `N.comm(...).submit(callback)` | `await createCommunicator(...).request({ url, method, json, signal, decode })` |
| `N.popup.open(data)`/`cont.caller.close(result)`; `tab.open(index, data)` | `openPopup(dialog, definition, input)`/page `output(result)`; `bindTabs` keyed pages |

The root package is ESM and exposes `./page`, `./data`, `./ui`, and `./comm`. It has no jQuery or global `N` entry.[^package][^ui]

The migration target includes all 1.x framework capabilities. The working APIs below describe the current implementation; selected milestone completion does not establish full feature coverage. Use the [feature coverage ledger](../implementation/feature-parity.md) and [execution plan](../implementation/feature-parity-plan.md) for required gaps and pending retirement review. No supported behavior is excluded before the user approves a consolidated retirement proposal.[^parity][^parity-plan]

# Prerequisites

Read the [1.x search/grid/detail example](../../v1/docs/examples/template/search-grid-detail-horizontal.md) for the old controller and payload. For the working 2.0 implementation, read the [employee example](employee-example.md) and [page-container example](page-containers-example.md), then their linked source files. Build and serve the existing TypeScript examples from the repository root:[^legacy-screen][^employee][^containers]

```sh
npm ci
npm run build
npm run example
```

Open `/m4/side.html` and `/m4/stack.html` for search/list/detail; open `/m7/side.html` and `/m7/stack.html` for main content, Popup, and Tabs. Vite transpiles these TypeScript examples to browser JavaScript. `npm run test:consumers` packs the library and checks separate installed JavaScript and TypeScript consumers. For a browser-served installed CVC/Form/Grid flow, use the fixed-tarball `test:packed-browser` command in [the package guide](package.md).[^employee][^containers][^package]

# Steps

## 1. Create a page and scope its work

The 1.x example registers an inline `N(...).cont({...})` controller. Its view is inserted by `N.comm`, which runs the inline script and starts `init`. In 2.0, `mountPage` receives an explicit view and controller; a URL view is fetched as HTML without executing embedded scripts. Use a fresh-root factory or URL for simultaneous pages. Query only within `root`, register listeners with `signal`, and register component and subscription cleanup with `own`.[^legacy-screen][^legacy-comm][^page]

```ts
// The executable version is examples/vite/m4/main.ts plus employees.ts.
import { mountPage } from "@bbalganjjm/natural_js/page";
import { createEmployees } from "./employees.js";

const page = mountPage(host, {
  view: () => template.content.firstElementChild!.cloneNode(true) as HTMLElement,
  controller: createEmployees
}, { close() { void page.dispose(); } });
await page.ready;
```

This compact extract assumes an `HTMLElement` host and an `HTMLTemplateElement` template as in [m4/main.ts](../../examples/vite/m4/main.ts); use that complete file to run it. The controller receives `root`, `input`, `signal`, and `own` per page instance. Dispose the page before removing its host so an aborted request cannot write into a closed view. After an explicit close, return focus to a connected external control; the M4 caller uses its Open button.[^page][^employee-runner][^employee-test]

## 2. Bind fields and select a row by identity

Replace repeated `id="name"` and index-based `form.bind(index, data)` with authored field paths and one shared `Rows` store. In M4, the search Form is local, while Grid, List, and detail Form receive the same `rows`. A Grid selection passes `{ id, row }`; the controller forwards that `id` to List and detail Form. A sort, filter, or page change cannot move the edit to another row because selection and drafts follow `RowId`, not display position.[^legacy-ui][^rows][^employee]

```html
<tr data-row-template>
  <th scope="row"><button type="button" data-select-row><span data-field="name"></span></button></th>
  <td data-field="profile.team"></td>
</tr>
<form data-role="detail">
  <label>Email <input type="email" data-field="email" data-validate='[["email"],["companyEmail"]]'></label>
  <small data-error-for="email"></small>
</form>
```

These are shortened M4 markup extracts. Copy the complete [side](../../examples/vite/m4/side.html) or [stack](../../examples/vite/m4/stack.html) screen to retain the required table, list, form, labels, and actions. `data-role` and `data-action` are application selectors; `data-field`, `data-row-template`, `data-validate`, and `data-error-for` are binding markers. Repeated templates must not contain fixed DOM IDs. `RowId` is local to one store and is not a business key to send to the server.[^employee-view][^page][^rows]

## 3. Validate before sending changed rows

The 1.x template reads `grid.data("modified")`; changed row objects contain `rowStatus`, and `dataIsArray: true` is needed to send the entire array. The M4 screen instead validates the current and hidden drafts, reads `rows.changes()`, and sends only changes. It validates every nondeleted changed row by ID, so an off-page invalid row sends zero save requests. `rows.changes()` includes internal IDs for UI checks; the controller deliberately omits them from JSON.[^legacy-screen][^legacy-comm][^employee][^employee-test]

```ts
const detailResult = detail.validate();
if (!detailResult.valid) return reportIssue(detailResult.issues[0]);
const gridResult = grid.validate();
if (!gridResult.valid) return reportIssue(gridResult.issues[0]);
const changes = rows.changes();
for (const change of changes) {
  if (change.status === "delete") continue;
  const validation = detail.validate(change.id);
  if (!validation.valid) return reportIssue(validation.issues[0]);
  const choice = grid.validate(change.id);
  if (!choice.valid) return reportIssue(choice.issues[0]);
}
if (changes.length) await comm.request<void>({
  url: "employees/save", method: "POST",
  json: changes.map(({ status, value }) => ({ status, value })),
  signal, decode: () => undefined
});
```

This is an abridged flow from `examples/vite/m4/employees.ts`; the full file handles pending search, save locks, errors, refresh, and cleanup. A local search Form uses `search.read()` as an explicit `{ query }` JSON body. `createCommunicator` defaults to `GET`; choose `POST` and `json` explicitly for these endpoints, and pass the page signal. The M4 save endpoint replies 204, so `decode: () => undefined` is required; default decoding expects nonempty JSON.[^employee][^comm]

```json
[{ "status": "update", "value": { "id": "E-101", "email": "ada@example.com" } }]
```

The JSON above shows the 2.0 envelope shape, not the full M4 fixture. Adapt an existing server that expects a 1.x row with embedded `rowStatus`; current createCommunicator does not automatically convert legacy payloads. `RowId` stays out of the body, while a business `value.id` remains available. Form formatting changes display text only, so the payload contains raw typed values. The exact M4 body is [expected-save.json](../../examples/vite/m4/expected-save.json).[^rows][^employee][^comm]

Tested migration recipes for the old default POST, GET q=JSON, dataIsArray and rowStatus payload workflows remain required gaps C05/C10. This M4 JSON POST example does not cover the complete legacy protocol range; the coverage review must preserve those server workflows without introducing a generic convenience library.[^parity][^parity-plan]

## 4. Move rules without dropping Form behavior

Keep the 1.x JSON tuple syntax on fields: `data-format='[["commas"]]'` and `data-validate='[["required"],["email"]]'`. `bindForm` compiles these names through the private UI rule runner; Grid and List use that runner for row fields. The retained formatter family reaches internal mask, date, and time operations, and the validator family reaches date/time, byte count, and combined names. These operations are still available through declarations even though standalone `N.formatter`, `N.validator`, `N.mask`, and generic `N.date` exports are absent. `RuleSet` adds application rules, messages, or a locale per binding; a field parser converts entered strings to raw JSON values when needed.[^form][^rules][^formats][^validators][^ui]

| Change | 2.0 behavior |
|---|---|
| Custom validation | `rules: { validate: { companyEmail: value => value.endsWith("@example.com") || "Use a company email." } }`, as in M4. |
| Numeric display | `data-format='[["commas"]]'` plus an application `parse` for a numeric raw field; a displayed comma is never stored in `Rows`. |
| Cross-field `equalTo` | `[["equalTo","profile.password"]]` compares with the same row's safe `data-field` path. A 1.x jQuery selector argument such as `"#password"` must be changed. |
| Date and mask | Current formatter rules remain display-only and do not attach a calendar. Explicit `bindDatePicker` and Form input events provide the current integration. The 1.x formatter-declared picker attachment remains a required gap in the feature coverage ledger. |

| Retained family | Reachable path | Focused check |
|---|---|---|
| 23 formatter names, including `mask`, `generic`, `numeric`, `date`, and `time` | `data-format` → Form, Grid, or List → private rule runner → `builtinFormats`; mask/date operations stay internal. | [format-rules.test.ts](../../tests/format-rules.test.ts) checks names and display behavior; [Form](../../tests/browser/form.spec.ts), [Grid](../../tests/browser/grid.spec.ts), and [List](../../tests/browser/list.spec.ts) browser checks exercise binding. |
| 35 validator names plus 6 combined spellings, including `equalTo` and byte rules | `data-validate` → Form, Grid, or List → private rule runner → `builtinValidators`; `RuleSet.validate` may override locally. | [validate-rules.test.ts](../../tests/validate-rules.test.ts) checks names, corrected arguments, byte counting, and `equalTo`; [rules.test.ts](../../tests/rules.test.ts) checks declaration aliases and overrides. |

The catalog tests enumerate every retained name. Static searches for calls to individual rules miss runtime dispatch from authored attributes, so these declarations and their internal dependencies remain part of the Form contract.[^form][^grid][^list][^rules][^formats][^validators][^format-test][^validator-test][^rules-test]

The 1.x `equalTo` name failed in declarative rule lists because dispatch lowercased it while its function was camel-cased. 2.0 resolves it case-insensitively and reads the peer value from `RuleContext.values` in the same Form or row. Form's invalid input stays as a row-keyed draft outside `Rows`; call `validate()` before save rather than using `read()` as the save gate.[^legacy-data][^validators][^form]

## 5. Replace Popup caller data and Tab positions

The 1.x popup used `open(row)` and a popup controller's `cont.caller.close(result)`; Tabs used `open(index, data)` and matched buttons to panels by position. In 2.0, pass typed `input` to a `PageDefinition`, emit `output(value)` from an active page event, await `openPopup(...).result`, and pair authored Tabs with `data-tab`/`data-panel` keys. Popup uses one connected native `<dialog>` with a direct `[data-page-host]` child. Tabs keeps visited pages and cancels superseded pending loads.[^legacy-ui][^page][^containers][^containers-view]

```html
<section data-tabs>
  <div role="tablist" aria-label="Employee views">
    <button type="button" role="tab" data-tab="people">People</button>
  </div>
  <section role="tabpanel" data-panel="people" hidden></section>
  <p data-tab-error role="alert" hidden></p>
</section>
<dialog data-picker-dialog aria-label="Choose employee">
  <div data-page-host></div>
  <form method="dialog"><button>Cancel</button></form>
</dialog>
```

The full M7 controller defines one `picker` and uses `openPopup(dialog, picker, input)` for each opening. Its `bindTabs` call supplies factories for all three authored keys: People and Preview mount the picker, while Help mounts its inline page. A Tabs binder with only a People factory would require markup containing only that key. It awaits Popup `result` before another opening, accepts `undefined` for ordinary cancel, and disposes the opening, Tabs, and main page before removing a workspace. The same picker definition also mounts in main content; every picker mount gets its own controller and scoped root. On workspace removal, the M7 caller returns focus to Add screen and ignores expected cancellation of pending main or Tab readiness. Popup result cancellation remains a separate reported path.[^containers][^containers-view][^page][^containers-test]

## 6. Classify remaining framework behavior and helper dependencies

| Boundary | 1.x examples | Migration |
|---|---|---|
| Browser and JavaScript APIs | `N()`/jQuery selectors and events, `N.button`, plain `N.alert`, generic `N.ajax`, simple string/array/date operations | Use scoped DOM queries, `addEventListener`, native buttons/dialogs, `fetch` through `createCommunicator` when its cancellation and hooks help, and standard JavaScript operations. |
| Framework shell | `N.notify`, `N.docs` | Current bindNotify/bindDocuments support authored templates, explicit page factories and beforeClose. Notification expiry/actions/rich content, document capacity/state eviction, and aggregate request progress/blocking remain required gaps; current application compositions do not retire those framework capabilities. |
| Current explicit application integrations | `N.context` app settings, generic `N.message`/locale lookup, `N.data` filter/sort, Natural-TEMPLATE `p.`/`c.`/`e.` declarations, API envelopes | Current examples use explicit options, application translations, predicates/comparators, direct functions and server conversion. Framework-reachable configuration, message lookup and declaration behavior still require the coverage review; this row is not an approved exclusion. |
| Changed mechanisms and required review | `N.data.filter` string conditions evaluated as code, global `N.gc`, generic controller AOP and runtime string declaration parsing, optional `N.code` inspection | Current APIs use explicit predicates, owned cleanup and controller methods, with no 2.0 compatibility entry. Safe equivalents of declaration behavior, cross-cutting hooks and inspection remain required gaps or pending retirement items. Preserve explicit ESM controllers and the current refusal to execute unsafe HTML. |

Standalone utility entry points are absent, but Form-reachable formatter, validator, mask, date, and byte behavior remains inside `./ui`. Grid accepts optional `initialPage: { page, size }` to limit the logical page and `viewport: { root, estimate, overscan? }` to limit mounted DOM independently. M11 adds explicit [Tree](tree.md) hierarchy selection over Rows and controlled ISO [DatePicker](datepicker.md) selection in authored calendars. Applications connect date callbacks to Form inputs; formatter declarations do not create calendars. M12 adds persistent [Notify](notify.md) messages and dynamic [Documents](documents.md) with keyed page reuse, an application close guard and explicit reload. The [shell example](shell-example.md) composes those binders with the existing page runtime.[^package][^ui][^rules][^formats][^validators][^grid]

Cascading Tree checks, month-only/holiday DatePicker behavior, editable and multiple-selection Lists, complete contextual Alert behavior, retained/preloaded Popup and Tab policies and the shell gaps above remain required additions. Grid column resize/reorder/show/hide uses authored keys and full GridColumn state. M10.6 adds independent selectedIds/setSelected and checkedIds/setChecked, explicit scoped check-all, authored sort/filter controls and stable row actions; select/selected/onSelect still control the active detail row only. M10.7 replaces legacy pastiable with opt-in native plaintext paste and grid.paste(text, { id, field }): quoted TSV is validated before one Rows.setMany change, protected fields consume positions, and overflow or ambiguous raw choices rejects the complete proposal. Display fields participate without injecting contenteditable; authored HTML remains the template. M10.8 adds measured variable-height viewport rendering, M10.9.2 adds authored multi-tr records and adjacent native merges, and M10.9.3 adds native groups/inputs, explicit display, validation timing/reveal and exclusive checks. Remaining lifecycle, detail and integration behavior stays required. The [coverage ledger](../implementation/feature-parity.md) records exact gaps and the [execution plan](../implementation/feature-parity-plan.md) orders their completion.[^parity][^parity-plan][^grid][^viewport][^blocks]

Replace row-local radio names/duplicate field IDs with `data-field` groups: Grid compiles members across the record and allocates a unique native radio name per clone, while Form keeps its explicit authored form/name contract. One checkbox is boolean, repeated checkboxes and multiple Selects always use arrays, and radio is string/null. This removes 1.x's selection-count-dependent scalar/array shape. Nested Grid Select options preserve raw scalar types. Native date/time/month/week/color/hidden values are strings; Grid number/range inputs require application parsers, and unsupported types follow the engine's native text fallback. File upload stays outside JSON Rows. Array clipboard values use a JSON array inside one normally quoted TSV cell; protected groups still consume one field position. See [Grid](grid.md) for the complete value/paste contract.[^grid][^form][^native][^controls-browser]

Move 1.x `checkSingleTarget` behavior to `checkMode: "single"`, which atomically replaces one checked ID through existing hooks; proposals containing multiple eligible IDs fail unchanged. Use Grid `validateOn: "blur"` for focus-out scalar commits or `"manual"` for explicit validation; the default `"change"` preserves input drafts and change commits. `revealInvalid: true` reveals the first current-page error without changing page/filter. Native programmatic text limits, effective disabled state and value sanitization are shared with Form/List.[^grid][^native][^controls-browser]

Replace 1.x `html: true` display with a Form/Grid `render` callback returning application-created fresh same-document DOM, literal text or `null`. Strings are never evaluated as HTML; application code owns trusted content and sanitization. Preflight protects other fields/controls/errors, and `UI_RENDER` identifies configuration, ownership, callback or asynchronous-return failures. Form restores original custom-render children on disposal without resetting ordinary inputs; List has no public rich-render option. An image `data-field` writes `src` and preserves `alt`, removing `src` for null/empty values.[^render][^form][^list][^native]

For a large local Grid, supply an authored ancestor scroll region with finite height and stable table/column widths, then pass `viewport: { root: scrollRegion, estimate: 48 }`. Overscan defaults to three logical rows per side; measurements refine the estimate rather than clipping wrapping content. `grid.reveal(id)` scrolls a current logical-page row to the nearest edge without selecting or focusing it; filtered-out/off-page IDs reject with `GRID_VIEWPORT_ROW`. Existing `"visible"` check scope, selection ranges and paste refer to the whole logical page, including unmounted rows. Nested choice plans and cached detached HTML-validation controls let offscreen paste/validation work without creating every target row. Native table ARIA positions include static/header/footer rows, and spacers stay hidden from accessibility. One focused row may remain attached across distant scrolling; other offscreen controls are released. The caller still owns progressive data requests and cancellation.[^grid][^viewport][^viewport-browser]

For a 1.x multi-row tbody record, mark one authored `<tbody data-row-template>` and keep all record tr children inside it. Grid repeats those tr blocks within the same tbody under one RowId; the existing single-tr form remains valid. Keep rowspans within that record; source rowspan 0 is normalized on clones. Replace cosmetic merge classes/options with a display-only first-row cell marked `data-merge="path"` and spanning the complete block. Raw nested scalar keys merge hierarchically in authored column order after sort/filter/page; interactive cells remain separate. Merge boundaries preserve focused display fields and bounded viewport windows. Clipboard lines address logical records, with fields ordered by physical row and current column order, including fields temporarily suppressed by merging. Native ARIA indexes count every physical tr. See [Grid](grid.md) for exact markup, protection, errors and cleanup, and the [interactive demo](grid-demo.md) for both authored layouts.[^grid][^blocks][^blocks-browser]

An unused helper unrelated to framework behavior may be removed after checking direct and indirect reachability, including authored declarations, configuration, callbacks and shared row forms. That dependency cleanup is separate from excluding supported behavior. A feature retirement requires one consolidated user approval; pending candidates remain support obligations until approved. Native browser APIs, authored CSS and typed callbacks can replace legacy mechanisms only when their required behavior is preserved and verified.[^parity][^parity-plan]

# Verify

Run the installed JS/TS consumer check and the focused existing browser regressions after changing an application screen:[^package][^employee-test][^containers-test]

```sh
npm run test:consumers
npx playwright test -c tests/playwright.config.ts tests/browser/m4-screen.spec.ts tests/browser/m7-screen.spec.ts
```

In M4, a valid save sends only the changed raw rows matching `examples/vite/m4/expected-save.json`; invalid visible or hidden drafts send no save request, and closing during delayed work leaves no late update. In M7, Popup result/cleanup and keyed Tabs work in two authored layouts with two live workspaces. The regular browser checks exercise executable workspace TypeScript screens; `test:consumers` checks packed JavaScript and TypeScript imports, while `test:packed-browser` exercises a separate installed CVC/Form/Grid browser screen from an exact tarball.[^employee-test][^containers-test]

# Pitfalls

- `read()` on a row-bound Form excludes invalid drafts, so a plausible record from `read()` is not evidence that save may proceed. Check `validate()` and changed rows, including off-page ones.[^form][^employee]
- `Rows.replace()` gives new IDs and clears prior changes; keep durable business identifiers in `value`, and never send store-local IDs as business keys.[^rows]
- `mountPage` does not run scripts embedded in fetched HTML. Move controller code into an ESM module, and keep repeated markup free of fixed IDs. It rejects duplicate IDs and unsafe executable HTML.[^page]
- A Popup result settles after close and cleanup. Await `result` before reopening its dialog; pass a fresh view factory or URL when a definition can be mounted more than once.[^page][^containers]
- The 2.0 rule engine retains built-in names and corrects documented 1.x defects; current custom overrides use per-binding `RuleSet`. Check rule arguments and current differences in [Form](form.md) before copying a declaration. Any other framework-reachable rule configuration remains subject to the coverage review.[^form][^rules][^parity]

# Next

Legacy addTop/indexed add/move/copy workflows now use Rows `add(value, beforeId?)`, `move(id, beforeId?)` and `copy(id, beforeId?)`. Resolve a live target ID from the intended store/view context instead of treating a display index as identity; omit it to append. Copy creates deeply independent stored JSON and a new inserted RowId while preserving business fields. Generate unique application keys before `add` when needed by Tree/server rules. Move does not change dirty status or add a save-payload operation, and value `revert` keeps the current order. The [M10.9 plan](../implementation/m10-parity-plan.md) tracks the remaining lifecycle, detail and integration gaps after authored row blocks and the [control contract](../implementation/m10-controls-plan.md).[^rows]

After all required features, the [M13 review and remediation gate](../implementation/m13-review-plan.md) precedes personal testing and separately requested release work.

Use [page](page.md), [Rows](data.md), [Form](form.md), [communication](comm.md), [Popup](popup.md), and [Tabs](tabs.md), [Documents](documents.md), and [Notify](notify.md) for exact signatures. For a narrower implementation start, inspect `examples/vite/m4/employees.ts` and `examples/vite/m7/main.ts`; their authored views and focused tests show the entire working routes.[^employee][^containers]

[^legacy-screen]: Preserved 1.x search, grid, detail, and save example
[^legacy-comm]: Preserved 1.x page loading and request serialization
[^legacy-ui]: Preserved 1.x Form, Grid, Popup, and Tab behavior
[^legacy-data]: Preserved 1.x data sync and rule dispatch
[^package]: Implemented 2.0 ESM package entries
[^page]: Page definition, scoped root, output, and lifecycle
[^rows]: RowId, changes, and immutable row values
[^comm]: Explicit request payload, decoder, and cancellation
[^ui]: Public UI bindings and rule types
[^form]: Form fields, drafts, and validation
[^grid]: Grid row field dispatch and validation
[^viewport]: Measured Grid viewport, anchoring and cleanup
[^viewport-browser]: Viewport logical scopes, typed paste and lifecycle regressions
[^blocks]: Authored logical row blocks and native adjacent merging
[^blocks-browser]: Multi-row identity, logical paste, merging and native geometry regressions
[^list]: List row field dispatch and validation
[^native]: Shared native value, display and constraint contracts
[^render]: Explicit field rendering without HTML string evaluation
[^controls-browser]: Native groups, validation timing, display and isolation regressions
[^rules]: Private declarative rule dispatch
[^formats]: Retained formatter and internal mask/date operations
[^validators]: Retained validators, equalTo, and byte rules
[^employee]: Runnable search/list/detail controller and save flow
[^employee-runner]: Runnable employee page mounting
[^employee-view]: Authored employee screen markers
[^containers]: Runnable main, Popup, and keyed Tab page flow
[^containers-view]: Authored dialog and Tab markup
[^employee-test]: Search, validation, payload, and cancellation browser checks
[^containers-test]: Popup and Tab browser checks
[^format-test]: Retained formatter catalog and mask/date checks
[^validator-test]: Retained validator catalog, byte, and equalTo checks
[^rules-test]: Declarative dispatch and combined-name checks
[^parity]: Required 1.x framework behavior and current 2.0 gaps
[^parity-plan]: Full framework feature coverage execution plan
