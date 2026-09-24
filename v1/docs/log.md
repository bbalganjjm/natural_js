## 2026-09-24

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
