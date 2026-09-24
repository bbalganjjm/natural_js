---
type: Plan
title: Natural-JS 2.0 M0 baseline
description: Code-backed 1.x design intent, minimum 2.0 migration inventory, and representative evaluation screen.
tags: [meta, plan, migration]
sources:
  - id: assembly
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.js.js
    title: Immutable 1.x N assembly and jQuery extension
  - id: architecture
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.architecture.js
    title: Immutable 1.x Communicator and Controller
  - id: core
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.core.js
    title: Immutable 1.x core and utility methods
  - id: data
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.data.js
    title: Immutable 1.x DataSync, formatting, validation, and data helpers
  - id: ui
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.ui.js
    title: Immutable 1.x UI implementation
  - id: shell
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.ui.shell.js
    title: Immutable 1.x MDI page insertion implementation
  - id: template
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.template.js
    title: Immutable 1.x declaration processing
  - id: package
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/package.json
    title: Immutable 1.x package contract
generated: { by: codex/gpt-6-sol, at: 2026-09-24T07:26:34Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T07:30:13Z }
---

M0 records the design principles to carry into 2.0 and the old mechanisms to replace. These are 1.x facts from the immutable baseline commit, not descriptions of implemented 2.0 behavior. The classification is a migration decision; implementation details and public signatures belong to M1 and later milestones.

# Goal

Preserve CVC and behavior attached to authored HTML. Retain every formatter, validator, and transitive helper required by Form, List, or Grid rules; remove only code unreachable from framework behavior. Applications own new business-specific rules and data transformations.

# Checkpoint

- Baseline: clean master at b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6. Development branch: codex/natural-js-2.
- Current 1.x code is eight JavaScript source files; TypeScript declarations are separately maintained. The package depends on jQuery and exposes a global N.
- The legacy OKF usage concepts remain accurate for 1.x at the baseline and must not silently become 2.0 usage documentation.

# Steps

## Design intent to preserve

| Intent | Evidence in 1.x | 2.0 consequence |
|---|---|---|
| Communicator, authored HTML View, and per-screen Controller divide client responsibilities; the server is the Model. | NA.comm.submit and NA.cont.trInit; architecture/cvc-pattern.md. | Keep these roles with an explicit page definition and one page runtime. |
| A screen fragment can run in main content, a popup, or a tab. | NA.comm.submit, NU.popup.loadContent, NU.tab.loadContent. | Container integrations call the same page runtime and lifecycle. |
| A controller searches only inside its View. | The first-page example scopes N selector calls to view. | Pass the root HTMLElement to each controller instance; keep queries scoped. |
| Existing HTML supplies component structure. | NU.grid copies tbody rows; NU.list copies li rows; NU.form reads existing fields. | Keep authored markup and CSS; generate only repeated or necessary supporting elements. |
| Component, communication, and event declarations are easy to scan together. | Natural-TEMPLATE p., c., and e. roles. | Keep readable role grouping but separate definitions from instances and avoid runtime property type changes. |
| A compact screen has a small HTML view and a short controller init; request functions can read current form values. | First-page and template master-detail examples. | Make ordinary application code direct and locally readable. |

## Mechanisms to replace

- NJS extends jQuery, prototype methods except constructor and request are copied to jQuery.fn, and classes are copied onto global N. This causes cross-module imports back through the aggregate entry point. Replace it with explicit ESM exports and browser APIs. [^assembly]
- HTML insertion executes inline scripts, then NA.comm searches the target container's direct children (or following sibling for replace) for a special View marker. NA.cont also selects globally when disambiguating duplicate views and derives page identity from selectors. Replace this with an explicit HTML resource or HTMLElement, controller factory, and root instance. [^architecture]
- Popup, tab, and document tab each repeat loading and initialization. Controller AOP and jQuery Deferred alter init timing. Use one asynchronous lifecycle and resource scope. [^architecture][^ui][^template]
- Repeated row HTML uses duplicate DOM ids as data keys; row indexes become unstable under sorting and filtering. MDI pages also reuse raw HTML, and the fixed-header Grid copies headers. Use a separate field binding marker, stable row identity, and a document-unique ID policy for accessibility. [^ui][^shell]
- N.ds compares wrapper identity and keeps observers in DOM; global GC cannot reliably release them. Use data ownership and subscriptions tied to page/component disposal. [^data][^core]
- N.data.filter evaluates string conditions with new Function. Do not migrate string evaluation or its public API. [^data]

## Minimum migration inventory

Every retained item below names a 2.0 behavior, its minimum responsibility, and whether it must be public.

| 1.x family | 2.0 behavior requiring it | Minimum 2.0 responsibility | Visibility / milestone |
|---|---|---|---|
| N.comm, N.cont | CVC screens and server requests | Typed request/result/error/cancel path; explicit page creation, init, activation, and disposal | Public communication and page APIs, M1/M3 |
| N.ds | Form, list, and grid sharing one record set | Stable row identity, change state, subscriptions and release | Public shared data handle, M1/M3/M5 |
| N.element field methods | Form and row binding | Scoped field lookup and native element read/write | Private binding code, M5 |
| N.formatter and N.validator | Form, List, and Grid formatting and validation | Rule parsing and dispatch, built-in rule names, raw/display conversion, validation results/messages, and typed custom rules | Public rule contract and private transitive helpers, M1/M5 |
| N.ui row iteration | List and grid from authored templates | Clone or instantiate author-supplied repeat template; compile field references once, bind nested child options, and avoid duplicate IDs | Private per component, M4/M6 |
| N.grid and N.list records | Editing, selection, and saving | Keep source row identity, change state, and shared edits | Public component behavior; private state, M4/M6 |
| N.grid view state | Basic grid sorting and filtering | Keep row identity and edits while the grid view reorders or filters | Public grid behavior; private view state, M4/M6 |
| N.alert, N.popup, N.tab | Dialog and page containers | Focus, interaction, lifecycle, result passing, and cleanup | Public UI APIs, M7 |
| N.event and N.gc internals | Correct event and resource lifetime | Register and dispose only owned listeners, timers, requests, and subscriptions | Private scope handling plus public dispose contract, M3 |
| N.context settings | Per-feature configuration | Explicit options on the application, page, request, or component that owns them | Public options only where required, M1 onward |

## Excluded or deferred inventory

| 1.x family | Decision | Replacement boundary |
|---|---|---|
| N(), NJS, jQuery plugin methods, and jQuery-specific selectors | Exclude | Standard DOM and explicit component/page creation |
| N.string, N.array, N.json, N.browser, generic N.date, and Date.prototype extensions | Reachability audit before removal | Keep operations used by built-in rules or UI internally; replace only truly redundant helpers with standards while preserving behavior. |
| N.message and N.locale as generic lookup libraries | Keep framework-used message behavior | Validator rule messages and component text remain available; only unrelated generic lookup helpers may be removed. |
| N.data.filter/sort and string condition syntax | Exclude | Standard arrays, user predicates/comparators, and private grid view state |
| N.mask and generic helper entry points | Keep only reachable behavior | Formatter rules call mask operations; retain those operations inside the rule implementation. Remove standalone helpers only when no framework behavior needs them. |
| N.element generic options/rules parser, N.event convenience methods, N.gc global cleanup | Exclude public APIs | Retain only feature-specific private handling when necessary |
| N.ajax alias, global N.context store, general controller AOP, and runtime p./c./e. string parsing | Exclude | Explicit request options, page state, lifecycle hooks, and typed declarations |
| N.code inspection and optional legacy code/template bundles | Exclude | M8 agent documentation and focused checks, not a shipped general inspection library |
| Fixed columns, resizing, complex headers, and bulk paste in N.grid | Defer | M10 advanced grid |
| N.tree and N.datepicker | Defer | M11 custom UI; retain the Form date formatter in M5 without its optional custom calendar attachment until M11. |
| N.notify and N.docs | Defer | M12 shell integrations |

Before removing a utility, inspect direct calls, transitive calls, dynamic rule-name dispatch, markup attributes, configuration, and row Form use in List/Grid. Replacing an internal helper with a standard API is allowed only when its framework-visible behavior remains intact.

## Representative screen and agent evaluation

- Base screen: examples/template/search-grid-detail-horizontal.md. Reproduce search, grid selection, shared detail editing, add/delete/revert, and changed-row save. Move department popup integration to M7.
- Layout A places the search/detail form next to the table; layout B places it below the table. Use the same controller, data, actions, and fixtures in both. Include one row-local nested Select and two simultaneous view instances. Authored classes, non-repeated structure, and CSS stay in place.
- Task 1: add a search/list/detail page from authored HTML. Both layouts pass the same behavior and keyboard scenarios.
- Task 2: add an email field with the built-in rule, add one custom validation rule, and update the save payload. Invalid data sends zero requests; valid changes send only changed rows.
- Task 3: fix a close/reopen race with a delayed request. The removed view receives zero late updates and listeners do not accumulate.
- Freeze prompts, model, initial context, fixture, and acceptance checks. Record first-pass correctness, retries, files and bytes read, changed files/lines, elapsed time, and actual token use when available. Label context size separately from token use. M4 establishes the first executable benchmark.

# Next action

Review [the M1 detailed plan](m1-plan.md) and freeze its contract before starting M2 tooling or M3 runtime work.

# Decisions

- 2.0 core behavior must justify every migrated item and every public export.
- Reproduce design intent and observable first-release capability, not every 1.x option or Known issue.
- Keep existing Form-used rule engines and built-in catalogs in the framework. M5 retains date formatting; M11 adds the optional custom date picker. Applications may supply new business rules through typed options; do not create a separate legacy utility package.
- Keep 1.x source and docs at the fixed baseline commit. New 2.0 usage concepts describe only implemented behavior.
- The M4 representative screen is the structural gate before broad UI implementation. It measures binding speed and tests duplicate IDs, keyboard access, and a nested row-local Select; automatic nested binding may be deferred only through the M4 review gate.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Source and concept review | CVC, template, data, UI, core, package, and representative examples compared with baseline source. |
| 2026-09-24 | Pre-M0 changed docs check | 65 concepts, 16 reserved files; 0 errors, 0 warnings. |

# Open questions

- Public symbol names and exact HTML binding syntax are set during M1, not assumed from this inventory.
- No executable 1.x browser fixture was found; the M4 benchmark needs new fixtures and test tooling.

[^assembly]: Immutable 1.x N assembly and jQuery extension
[^architecture]: Immutable 1.x Communicator and Controller
[^core]: Immutable 1.x core and utility methods
[^data]: Immutable 1.x DataSync, formatting, validation, and data helpers
[^ui]: Immutable 1.x UI implementation
[^shell]: Immutable 1.x MDI page insertion implementation
[^template]: Immutable 1.x declaration processing
