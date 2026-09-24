## 2026-09-24

* **Correction** An independent M4 recheck added a fetched-server-HTML route for the same authored employee view and controller, with a simultaneous-page and duplicate-ID regression. The unused future PopupHandle type was removed from the M5 public UI entry.
* **Creation** M5 rewrote the Form-reachable formatter and validator catalog inside private UI modules and gave Form and Grid one rule dispatcher. Built-in declarations, case-insensitive aliases, per-component overrides, and localized messages remain available without a public utility package.
* **Update** Rows now reports typed mutation events, including a clean revert, so Form and Grid can release row-keyed drafts. Form and Grid share raw/display/parse semantics, validate hidden rows, and use authored error regions with document-unique IDs.
* **Update** The employee screen uses retained built-in rules and row-keyed drafts across both authored layouts. The M1, data, UI, Form, Grid, package, architecture, and example concepts and indexes describe the M5 source.
* **Creation** Added an M6 review draft for Button, Select, pagination, Form, List, and basic Grid, with explicit approval, accessibility, performance, and agent-cost gates; M6 implementation has not begun.
* **Verification** M5 build, typecheck, Vitest 79/79, Chromium/WebKit 102/102, direct example TypeScript check, and installed JS/TS consumers passed. The 63-file, 86,228-byte package excludes 1.x, jQuery, docs, examples, and convenience utility bundles; the final same-host 1,000-row flat/nested initial bind medians were 12.9/37.6 ms, within the M6 budgets.

* **Creation** Added M4 `bindForm` and `bindGrid` pilots, a private shared safe field-path helper, focused browser/unit tests, and the two authored employee layouts driven by one controller. The screen covers search, selection, edit, add/delete/revert, validation, save, cancellation, and nested row-local Select options without repeated DOM IDs.
* **Creation** Added the fixed 100/1,000-row benchmark fixture and raw Chromium measurements. At 1,000 rows/10 fields, 2.0 flat initial/rebind medians were 11.9/13.8 ms versus 1.x 122.8/111.0 ms; automatic nested options measured 40.4/44.2 ms. The 2.0 fixture had zero duplicate IDs versus 9,990 in 1.x. M4 records comparison limits and M6 regression budgets.
* **Correction** Independent review found and prompted fixes for local filter submission, editing during save, invalid-draft navigation and Add, focus and invalid Select visibility, partial mock writes, and duplicate resend after a successful save with failed refresh. Regression checks cover these paths.
* **Update** The root README and 2.0 Form, Grid, UI, architecture, package, data, error, and employee-screen concepts, their indexes, and the M4 plan now describe the implemented pilot boundary. A separate source review checked six draft concepts and corrected one Form validation description.
* **Creation** Added the M5 data and rule plan for separate approval. It retains framework-reachable 1.x Form formatter/validator behavior while scoping row-keyed drafts, nested data, and complete validation contracts. No M5 implementation is included in M4.
* **Verification** M4 build, typecheck, example TypeScript check, Vitest 29/29, installed JS/TS consumers, and Chromium/WebKit 64/64 browser tests passed, including M4 screen 36/36. Firefox Playwright still fails to launch on this Windows host (`browserType.launch: spawn UNKNOWN`); the 48-file, 46,017-byte package audit excluded `v1/`, jQuery, docs, examples, and a convenience utility bundle. Changed and full OKF checks passed with 0 errors and 0 warnings; M4 commit `b9a1c902` was fast-forward pushed to `origin/2.0.0-alpha.0`.
* **Verification** A fresh docs-first agent added `profile.department` to both M4 layouts and shared data/save flow. Its first Chromium run passed with zero code retries; it read 15 unique files (53,364 bytes) and changed 7 files (12 added/5 replaced lines) in about 4m05s. Actual token use was unavailable.
* **Verification** At the M3 checkpoint, commit `94c73a9f` was fast-forward pushed to GitHub branch `2.0.0-alpha.0`; M4 was then a draft requiring separate approval.
* **Update** Promoted the Apache-2.0 2.0 package from `v2/` to the repository root on branch `2.0.0-alpha.0`; preserved all 142 checked 1.x tracked source/document files under `v1/` with their LGPL license and notices. Root docs and the OKF checker now target 2.0.
* **Creation** Added the M3 `mountPage`, `createCommunicator`, and `createRows` runtimes, focused unit/browser tests, and installed JS/TS consumer checks. UI remains type-only for M4.
* **Update** `docs/v2/`, `implementation/current.md`, `implementation/m3-plan.md`, and the repository workflow to describe shipped M3 behavior, abort/cleanup boundaries, root package exports, and 1.x archive links.
* **Creation** Added `implementation/m4-plan.md` for a separate review of the authored-HTML vertical screen, nested Select, accessibility, and binding performance gates.
* **Verification** M3 build and typecheck passed; Vitest 20/20, installed JS/TS consumers, Chromium/WebKit browser 16/16, checker regression test, and the 33-file package audit passed. Firefox remains blocked before page load on this Windows host (rowserType.launch: spawn UNKNOWN).
* **Creation** `v2/`: added an isolated Apache-2.0 TypeScript package with explicit ESM/declaration exports, source maps, a tracked lockfile, and no 1.x or jQuery files in its tarball.
* **Creation** `docs/v2/`: documented the implemented error, type-only role entries, installable package, and private-module boundaries without describing unimplemented runtime as shipped.
* **Creation** `implementation/m3-plan.md`: scoped the next CVC, communication, and row-store runtime milestone for review.
* **Update** `implementation/m1-contract.md`, `implementation/m2-plan.md`, `implementation/roadmap.md`, and `implementation/current.md`: recorded M1/M2 approval, 2.0-only Apache licensing, actual M2 checks, Firefox host limitation, and the evidence rule for shared modules.
* **Verification** M2 package: `npm ci`, build, typecheck, Vitest, separate installed JS/TS consumers, documentation checker regression test, and Chromium/WebKit smoke passed; Firefox could not launch because of this Windows host's SideBySide `mozglue` failure.
* **Verification** M2 OKF: changed and full checks passed with 78 concepts, 17 reserved files, 0 errors, and 0 warnings; an independent agent verified the package and FrameworkError concepts against source and tarball.

* **Update** governance/okf-conventions.md and governance/repository-workflow.md: added the 2.0 TypeScript source, package entry, emitted declaration, and public-symbol documentation checks; tools/knowledge-docs now checks explicit v2 exports and TS symbol fingerprints with a focused regression test.
* **Correction** implementation/roadmap.md and implementation/m0-baseline.md: retained Form-used formatter/validator engines, declarative built-in rules, and transitive helpers after the user's scope correction; only framework-unreachable utilities qualify for removal.
* **Update** implementation/m1-plan.md and implementation/current.md: recorded M1 approval, the corrected retention boundary, and the M1 review gate.
* **Creation** Added implementation/m1-contract.md with concrete HTML/JS/TS usage, public signatures, CVC lifetime, shared rows, Form rule behavior, and request/container examples.
* **Creation** Added implementation/m2-plan.md for the next approved-scope gate; implementation/index.md and docs/index.md link the new records.
* **Update** implementation/m1-contract.md, implementation/m1-plan.md, implementation/roadmap.md, and implementation/current.md: added nested JSON/row-local Select, duplicate-ID-free MDI, accessible native tables, fixed-fixture binding benchmarks, and optimized rewrites after user steering.
* **Correction** implementation/m1-contract.md: aligned request 204 decoding, raw-value restoration, late-request cancellation, row validation, page output lifetime, and popup result types after independent design review.
* **Verification** implementation/m0-baseline.md: independent recheck of Form rule dependencies and MDI/row-cloning facts; renewed its verified stamp.
* **Verification** M1 draft: changed and full OKF checks passed with 70 concepts, 16 reserved files, 0 errors, and 0 warnings; runtime implementation remains pending.

* **Correction** implementation/m0-baseline.md: corrected the 1.x View lookup scope, jQuery plugin installation exceptions, and grid-only sorting/filtering boundary after independent source review.
* **Update** implementation/m1-plan.md: included JavaScript consumer examples in the M1 exit package.
* **Creation** Added implementation/roadmap.md for the approved Natural-JS 2.0 milestone sequence and minimal migration policy.
* **Creation** Added implementation/m0-baseline.md with code-backed design intent, strict inclusion inventory, representative screen, and agent evaluation tasks.
* **Creation** Added implementation/m1-plan.md with the detailed scope and review gate for the 2.0 public contract.
* **Update** implementation/current.md now tracks the active 2.0 checkpoint; implementation/index.md and docs/index.md link the new records.

* **Creation** Added 62 Natural-JS concepts across overview, setup, getting started, core, architecture, data, UI, UI shell, template, code, and examples. The five code-only areas (`core/mask.md`, `data/datasync.md`, `ui/theming.md`, `setup/build-and-dist.md`, and `code/inspection.md`) are drafts.
* **Creation** Added 15 bundle and folder `index.md` files for concept lookup.
* **Creation** Added `tools/knowledge-docs/knowledge-docs.mjs` for OKF checks, source drift detection, and source stamping.
* **Creation** Added `governance/okf-conventions.md` and `governance/repository-workflow.md` to define the bundle format and upkeep procedure.
* **Update** implementation/current.md closed the migration after complete heading coverage and clean changed and full checks; the user chose to keep the current .gitignore entry.
* **Update** governance/okf-conventions.md added Pitfalls and Known issues to the optional Example section order.
* **Update** governance/repository-workflow.md made the stamp actor example independent of any one agent tool.
* **Verification** Recorded independent verification for 20 A-group concepts with no refuted findings and no subsequent content changes (`claude-code/unknown`). Other A-group and B-group concepts have no final-body independent verification recorded.

* **Correction** `overview/natural-js.md`: distinguished the public `window.N` from compiler-generated globals left by the unwrapped ES5 and ES6 bundles; plain `NC`, `NA`, `ND`, `NU`, `NUS`, `NT`, and `NCD` are undefined.
* **Correction** `overview/api-conventions.md`: fixed class construction, `N(position).notify(opts)`, form formatting and validation triggers, grid `revert`, malformed `data-opts`, and alert instance storage to match runtime behavior.
* **Correction** `setup/build-and-dist.md`: documented unwrapped classic-script output and the compiler-generated globals it leaves behind.
* **Correction** `setup/configuration.md`: corrected tab handler chaining, cached filter and copied rule configuration, the request `referrer` default, and message-bundle lookup behavior.
* **Correction** `setup/typescript.md`: corrected bundle globals, the declaration-file layout, and a typed grid/form controller example that binds the selected row and guards an empty form.
* **Correction** `core/n-function.md`: corrected single-checkbox `vals()` input and mutation behavior, and narrowed the `tpBind` multi-event failure to elements with existing event data.
* **Correction** `core/gc.md`: corrected accepted `gcMode` values and documented that `ds` is callable but does not unbind global handlers.
* **Correction** `core/mask.md`: corrected `#` to match digits and lowercase `s` rather than whitespace, and clarified `setGeneric` matching and input errors and `setNumeric` error returns.
* **Correction** `architecture/aop.md`: clarified that Natural-TEMPLATE supplies advisor helpers but does not register controller advisors.
* **Correction** `architecture/communication-filter.md`: clarified when `filterConfig` is first built and when `N.docs` resets it.
* **Correction** `architecture/communicator.md`: identified `NA.ajax` as the request function, corrected callback-exception arguments, and documented that thrown request callbacks can prevent `complete` filters from running.
* **Correction** `architecture/controller.md`: documented that `N.cont` needs `new`; only `N.comm` and `N.notify` have factory wrappers.
* **Correction** `data/datasync.md`: corrected when form values notify observers for fields with and without elements.
* **Correction** `data/formatter.md`: corrected element-mode input requirements and result keys, the timing of `data-format` setup, the generic `#` rule, and the date rule's focusout handlers.
* **Correction** `data/validator.md`: documented mixed radio or checkbox contexts that fail to mark invalid text inputs, and the date rule's acceptance of day `00` and nondigit years.
* **Correction** `ui/alert.md`: distinguished `hide()` behavior in window, element, and tooltip modes, including tooltip instance reuse.
* **Correction** `ui/button.md`: required a jQuery `context` and aligned `size`, `filled`, `outlined`, and `elevated` descriptions with the shipped CSS.
* **Correction** `ui/component-model.md`: distinguished deep tab-option merging in single-object construction from shallow merging in context-plus-options calls.
* **Correction** `ui/select.md`: narrowed the no-data warning to null, undefined, or objects with no enumerable properties; an empty collection does not trigger it.
* **Correction** `ui/theming.md`: removed the claim that font-family tokens are used by the shipped CSS and clarified button shape, size, and color classes.
* **Correction** `ui/form.md`: corrected constructor use, formatted field types, value notifications, bind and value callbacks, validation and synchronization behavior, and `unbind()` on list or grid rows.
* **Correction** `ui/grid.md`: corrected constructor use, selection height, differences between bound and added row forms, multi-index removal, check-all behavior, array submission, and footer creation.
* **Correction** `ui/list.md`: corrected selection height, differences between bound and added row forms, multi-index removal, and check-all behavior.
* **Correction** `ui/pagination.md`: documented the disabled last-link behavior with zero results and fixed the first-page search request example.
* **Correction** `ui-shell/documents.md`: corrected excluded-request load callbacks, the `maxTabs` notification failure in source and ES6 bundles, filter replacement, and asynchronous removal of visible tabs and sections.
* **Correction** `ui-shell/notify.md`: corrected the `N.docs` maximum-tabs notification claim and the legacy top-right example that omitted notification options.
* **Correction** `template/component-declaration.md`: documented that a truthy `code` option prevents creation of non-select components.
* **Correction** `template/conventions.md`: corrected the deferred `init`/`onOpen` advisor recipe, including tab and popup preload behavior and pages without `init`.
* **Correction** `getting-started/first-page.md`: changed the configuration example to assign the `page.context` and `alert.container` properties without replacing their parent configuration sections.
* **Correction** `getting-started/grid-crud-walkthrough.md`: removed the claim that the `data.json` GET demonstration saves data and adjusted its notification and verification text.
* **Correction** `examples/template/search-grid-paging.md`: after deleting the final row on the final page, the example now reloads page 1 to obtain the updated `totalCount`.

* **Gap** The legacy EXAMPLES heading "Screen Transition CRUD" contains no usable implementation; no concept was created from it.
* **Gap** The legacy EXAMPLES heading "Popup CRUD" contains no usable implementation; no concept was created from it.
* **Gap** The legacy EXAMPLES heading "Master Grid & Detail Form" contains no usable implementation; no concept was created from it.
* **Gap** The legacy EXAMPLES heading "Multi-Form Binding" contains no usable implementation; no concept was created from it.
* **Gap** The legacy TEMPLATE-EXAMPLES heading "Search Form + List + Grid + Detail Form" contains no usable implementation; no concept was created from it.
* **Gap** The legacy TEMPLATE-EXAMPLES heading "Tree + Grid" contains no usable implementation; no concept was created from it.
* **Gap** The legacy TEMPLATE-EXAMPLES heading "Search Form + Tab" contains no usable implementation; no concept was created from it.
