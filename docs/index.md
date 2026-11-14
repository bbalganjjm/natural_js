---
okf_version: "0.2"
---

# Start here

* [Natural-JS 2.0 M3.5 scoped configuration and captured ownership](implementation/m3-scoped-configuration-plan.md) - Keep one Rows and base URL owner while supporting explicit live locale and message providers on existing UI instances. (draft)
* [Natural-JS 2.0 M3.4 page metadata and lifetime](implementation/m3-page-lifetime-plan.md) - Preserve page-local metadata through typed input and closures, capture controller factories and make every disposal observe the same complete cleanup result. (draft)
* [Natural-JS 2.0 M3.3 common HTML loading](implementation/m3-html-loading-plan.md) - Connect URL views to an application communicator through one captured HTML loader while retaining common CVC parsing, IDs and lifetime. (draft)
* [Natural-JS 2.0 M3.2 native protocol workflows](implementation/m3-protocol-plan.md) - Preserve native HTTP and custom XHR transfer workflows through one captured sender and explicit application wire recipes. (draft)

* [Natural-JS 2.0 M3.1 communication phases](implementation/m3-communication-plan.md) - Capture existing communication hooks and execute ordered application preparation, transformation and terminal cleanup without a middleware engine. (draft)

* [Natural-JS 2.0 consolidated omission decision](implementation/omission-decision.md) - Five explicitly approved legacy workflow omissions, with exact boundaries, alternatives, migration costs and retained obligations. (draft)

* [Natural-JS 2.0 sequential M5 completion run](implementation/m5-completion-run.md) - Complete M5.14 through M5.20 and their necessary predecessors as separately reviewed, verified and committed stages. (draft)

* [Natural-JS 2.0 M5.14 live Form choice catalogs](implementation/m5-live-choice-groups-plan.md) - Replace adopted native choice catalogs while retaining Form field identity, data, drafts, defaults and owned cleanup. (draft)

* [Natural-JS 2.0 numbered remaining work](implementation/remaining-work-plan.md) - Fixed execution order and terminal stage numbers for every remaining framework capability and delivery gate. (draft)

* [bindChoiceGroup](v2/choice-group.md) - Generate native radio or checkbox choices from an authored fieldset and replace catalogs through its Form owner. (draft)
* [Authored choice groups in two CVC layouts](v2/choice-groups-example.md) - Generate native choices before Form and replace adopted catalogs in independent authored CVC screens. (draft)

* [Natural-JS 2.0 M5.13 authored choice groups](implementation/m5-choice-groups-plan.md) - Generate native radio and checkbox choices from authored templates and adopt them safely in Form. (draft)

* [Natural-JS 2.0 M5.12 Form source ownership](implementation/m5-form-source-plan.md) - Execute application normalization and full-source observation through existing Form and Rows owners. (draft)

* [Natural-JS 2.0 M5.11 captured Grid binding callbacks](implementation/m5-grid-callbacks-plan.md) - Capture validated row and completion callbacks once and invoke them without an implicit receiver. (draft)

* [Natural-JS 2.0 M5.10 shared field value callbacks](implementation/m5-collection-values-plan.md) - Project mounted Form, Grid and List values through one callback contract without changing raw data ownership. (draft)

* [Natural-JS 2.0 M5.9 typed Form presets and callback composition](implementation/m5-form-presets-plan.md) - Reuse typed Form options and compose application callbacks without changing binding ownership. (draft)

* [Natural-JS 2.0 M5.8 Form field rediscovery](implementation/m5-form-discovery-plan.md) - Explicitly reconcile authored Form fields while preserving retained input, data and resource ownership. (draft)

* [Natural-JS 2.0 M5.7 Form captured defaults and unbind](implementation/m5-form-defaults-plan.md) - Return captured native creation values and restore the authored Form view without changing shared Rows data. (draft)

* [Natural-JS 2.0 M5.6 Form binding lifecycle and selective refresh](implementation/m5-form-binding-plan.md) - Add synchronous whole-row Form hooks and refresh compiled fields without changing row identity or unselected input. (draft)

* [Natural-JS 2.0 M10.9.6.3 progressive binding](implementation/m10-progressive-plan.md) - Bind already-loaded logical prefixes cooperatively with owned completion, cancellation and the existing viewport and CVC contracts. (draft)

* [Natural-JS 2.0 M10.9.6.2 interaction and view controls](implementation/m10-interactions-plan.md) - Add explicit selection toggles, applied distinct-value search and authored column recovery and action-scroll compositions. (draft)

* [Natural-JS 2.0 M10.9.6.1 change presentation](implementation/m10-change-state-plan.md) - Expose immutable loaded originals and bind exact committed-field changes while retaining edited deletion views and original deletion payloads. (draft)

* [Natural-JS 2.0 full feature implementation plan](implementation/feature-parity-plan.md) - Staged completion of required legacy behavior and advanced Grid features before release preparation. (draft)

* [Application shell in two CVC layouts](v2/shell-example.md) - Compose independent document workspaces, persistent notifications, shared Form data and Popup with one CVC editor definition. (draft)

* [Tree and DatePicker in two CVC layouts](v2/tree-date-example.md) - Connect authored hierarchy selection and ISO calendar input to a shared Form in independent CVC screens. (draft)

* [Interactive Grid contract demo](v2/grid-demo.md) - Inspect committed field changes, loaded originals and edited deletions alongside authored CVC details and two Grid layouts. (draft)
* [bindGrid](v2/grid.md) - Bind authored table records with status views, raw field-change flags, owned row hooks, native defaults, bounded rendering, paste, and accessible validation. (draft)
* [bindForm](v2/form.md) - Bind authored Form fields to local raw input or Rows with formatting, typed choices, validation and accessible errors. (draft)
* [Authored advanced Grid in two layouts](v2/advanced-grid-example.md) - Grouped native table headings and sticky rows and columns in two authored MDI layouts with no new Grid API. (draft)
* [Natural-JS 2.0 package](v2/package.md) - Build and verify the unpublished Apache-2.0 ESM beta candidate and its five entry points. (draft)
* [Natural-JS 2.0 module boundaries](v2/architecture.md) - Small role modules, one-way imports, and evidence-based sharing keep 2.0 easy to navigate. (draft)
* [Employee screen in two authored layouts](v2/employee-example.md) - One CVC controller shares Rows across Form, Grid, and List, coordinating Select and Pagination in two authored layouts and fetched HTML. (draft)
* [CVC pages in main content, Popup, and Tabs](v2/page-containers-example.md) - One picker PageDefinition shares Rows across main content, Popup, and People and Preview Tabs in two authored MDI layouts. (draft)
* [Migrating a 1.x screen to Natural-JS 2.0](v2/migration.md) - Move a 1.x search/list/detail screen, changed-row save, and Popup or Tab page to scoped ESM APIs. (draft)
* [Natural-JS 2.0 UI contracts](v2/ui.md) - Shared rule, validation, selection, and page types for the implemented HTML-bound UI. (draft)
* [Natural-JS 1.x reference](../v1/docs/index.md) - Preserved LGPL-2.1 source and usage documentation for migration research.

# Topics

* [Natural-JS 2.0](v2/index.md) - Implemented package, type contracts, and module boundaries.
* [Implementation](implementation/index.md) - Natural-JS 2.0 roadmap, public contract, and active milestone status.
* [Governance](governance/index.md) - OKF format, evidence-based answers, and repository upkeep rules.
