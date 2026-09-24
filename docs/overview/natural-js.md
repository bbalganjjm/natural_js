---
type: Overview
title: Natural-JS
description: jQuery-based JavaScript architecture framework for enterprise web UIs, exposing CVC architecture, UI components and data libraries on the global N.
tags: [project, overview, architecture]
symbols: [N, N(), NJS, N.version, NJS.version, N.code, N.template]
sources:
  - id: js
    resource: ../../src/natural.js.js
    title: natural.js.js (N assembly, jQuery plugin installation, NJS.version, window.N)
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: code
    resource: ../../src/natural.code.js
    title: natural.code.js (registers Natural-CODE version and N.code)
    git_blob: cace23c7b3b7bc5cd23c75a516220586472d7b3c
  - id: template
    resource: ../../src/natural.template.js
    title: natural.template.js (registers Natural-TEMPLATE version and N.template)
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
  - id: submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (loads block pages and triggers the controller init)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: ds
    resource: ../../src/natural.data.js
    title: ND.ds DataSync implementation
    symbol: ND.ds
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: 64d1318e0071
  - id: build
    resource: ../../compiler/minify-natural.js+code+template.es6.sh
    title: Full bundle build script (package input order, no output wrapper)
    git_blob: a686e25604860639aef3c52616a9cd47cc481896
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

Natural-JS is a jQuery-based JavaScript architecture framework for building enterprise web application UIs. Everything is reached through one global, `N`: `N(selector)` is an extended jQuery collection, and `N.xxx` holds the utility libraries, the architecture classes and the UI component classes. Use this page to find which package owns an API before opening its reference page.

# What it is

- **CVC architecture.** Pages are split into Communicator (`N.comm`), View (HTML) and Controller (`N.cont`) with the server as the Model; see [CVC pattern](../architecture/cvc-pattern.md).
- **Block pages.** A page is an HTML fragment (a view element followed by a script that calls `N(view).cont({...})`). It is loaded into a container by `N(container).comm(url).submit()`, `N.popup` (url), `N.tab` (url) or `N.docs`, and the controller's `init(view, request)` runs after loading.[^submit]
- **AOP on controllers.** `before`, `after`, `around` and `error` advisors wrap controller functions; they are declared in `N.context.attr("architecture").cont.advisors`. See [AOP](../architecture/aop.md).
- **Communication filters.** Hooks (`beforeInit`, `afterInit`, `beforeSend`, `success`, `error`, `complete`) run for every `N.comm` request; see [Communication filter](../architecture/communication-filter.md).
- **UI components.** Data components `N.select`, `N.form`, `N.list`, `N.grid`, `N.pagination`, `N.tree`; UI components `N.alert`, `N.button`, `N.datepicker`, `N.popup`, `N.tab`; shell components `N.notify`, `N.docs`.
- **Data binding and sync.** Data components bind JSON object arrays to elements whose `id` matches a property name. `N.ds` (DataSync) updates every registered component that shares the same bound data collection when one of them changes a row.[^ds]
- **Data libraries.** `N.formatter` (format rules), `N.validator` (validation rules) and `N.data` (filter, sort) work on JSON object arrays; rules can be declared in `data-format` / `data-validate` attributes.
- **Themes.** Component styles come from `css/natural.ui.css`, which imports design tokens and light or dark palettes by `prefers-color-scheme`; see [Theming](../ui/theming.md).
- **Browsers and tooling.** Every bundle ships in an ES5 and an ES6 build; TypeScript declarations live in `@types/`. See [Build and dist bundles](../setup/build-and-dist.md) and [TypeScript](../setup/typescript.md).

# Map

| Package | Source file | Class | Version | Reached through | Concepts |
|---|---|---|---|---|---|
| Natural-CORE | `src/natural.core.js` | `NC` | 1.0.1 | `N()`, `N.string`, `N.date`, `N.element`, `N.browser`, `N.message`, `N.array`, `N.json`, `N.event`, `N.gc`, `N.mask`, `N.locale`, `N.log` ...; plugins `instance`, `vals`, `events`, `tpBind`, `remove_` | [N()](../core/n-function.md), [N static functions](../core/n-static.md) |
| Natural-ARCHITECTURE | `src/natural.architecture.js` | `NA` | 1.0.0 | `N.cont`, `N.comm`, `N.context`, `N.config`, `N.ajax`; plugins `cont`, `comm` | [CVC pattern](../architecture/cvc-pattern.md), [Controller](../architecture/controller.md), [Communicator](../architecture/communicator.md), [Context](../architecture/context.md) |
| Natural-DATA | `src/natural.data.js` | `ND` | 1.0.0 | `N.ds`, `N.formatter`, `N.validator`, `N.data`; plugins `formatter`, `validator`, `datafilter`, `datasort` | [Formatter](../data/formatter.md), [Validator](../data/validator.md), [Data utilities](../data/data-utilities.md), [DataSync](../data/datasync.md) |
| Natural-UI | `src/natural.ui.js` | `NU` | 1.0.0 | `N.alert`, `N.button`, `N.datepicker`, `N.popup`, `N.tab`, `N.select`, `N.form`, `N.list`, `N.grid`, `N.pagination`, `N.tree`, `N.ui` | [Component model](../ui/component-model.md) |
| Natural-UI.Shell | `src/natural.ui.shell.js` | `NUS` | 1.0.0 | `N.notify`, `N.docs` | [N.notify](../ui-shell/notify.md), [N.docs](../ui-shell/documents.md) |
| Natural-CODE (optional) | `src/natural.code.js` | `NCD` | 0.4.8 | `N.code` (`N.code.inspection`, `N.code.addSourceURL`) | [Code inspection](../code/inspection.md) |
| Natural-TEMPLATE (optional) | `src/natural.template.js` | `NT` | 0.4.12 | `N.template` (`N.template.aop`) | [Template conventions](../template/conventions.md) |
| Assembly | `src/natural.js.js` | `NJS` | 1.0.0 | `N`, `N.version` | [API conventions](api-conventions.md) |

Natural-CODE and Natural-TEMPLATE exist only in the `+code` and `+template` bundles. The build concatenates the packages in this order: core, architecture, data, ui, ui.shell, natural.js.js, then code and template.[^build]

# Key concepts

## How `N` is assembled

`src/natural.js.js` builds the global in five steps:[^js]

1. `N(selector, context)` returns `new NJS(selector, context)`. `NJS` extends `jQuery`, so the result is a jQuery collection with one extra property, `selector` (a string made by `NC.toSelector`).
2. `Object.assign(N, NC, NA, ND, NU, NUS)` copies every static member of the five package classes onto `N`. `N.grid` is the `NU.grid` class itself, so component classes are called with `new` (`new N.grid(data, opts)`).
3. Every prototype method of `NC`, `NA`, `ND`, `NU` and `NUS` except `constructor` and `request` is installed on `jQuery.fn`. That is the plugin form, `N(selector).grid(opts)`; it also works on `$()` collections.
4. `N.comm` is replaced by a factory, `function (obj, url) { return new NA.comm(obj, url); }`, and `N.notify` by `function (position, opts) { return new NUS.notify(position, opts); }` with `N.notify.add = NUS.notify.add`. These two are the only component or library classes that can be called without `new`.
5. `N.version = NJS.version` and `window.N = N`.

`natural.code.js` and `natural.template.js` then set `N.code = NCD` and `N.template = NT` and add their versions to the same `N.version` object.[^code][^template] Calling conventions that follow from this are in [API conventions](api-conventions.md).

## Runtime globals

`window.N` is the only public global of the dist bundles (jQuery's `jQuery` and `$` must be loaded first). The bundles are unwrapped classic scripts, so they also leave compiler-generated names in the global scope: `N$$module$__$src$natural_js`, `module$__$src$natural_core` and the other `module$__$src$natural_*` objects, class bindings such as `NC$$module$__$src$natural_core`, and `$jscomp` in the ES5 bundles.[^build] Do not use or overwrite them. The plain names `NC`, `NA`, `ND`, `NU`, `NUS`, `NT` and `NCD` are not defined at runtime: in application code write `N.formatter`, `N.grid`, `N.context`, never `ND.formatter` or `NU.grid`. The TypeScript declarations use the internal names as namespaces for types only; see [TypeScript](../setup/typescript.md).

## `N.version`

```json
{
    "Natural-JS": "1.0.0",
    "Natural-CORE": "1.0.1",
    "Natural-ARCHITECTURE": "1.0.0",
    "Natural-DATA": "1.0.0",
    "Natural-UI": "1.0.0",
    "Natural-UI.Shell": "1.0.0",
    "Natural-CODE": "0.4.8",
    "Natural-TEMPLATE": "0.4.12"
}
```

The last two keys appear only when the bundle includes Natural-CODE or Natural-TEMPLATE.[^js][^code][^template]

## CVC in brief

| Layer | In Natural-JS | Notes |
|---|---|---|
| Communicator | `N.comm` | Ajax requests for JSON data or HTML block pages; communication filters run on every request. |
| View | The block page's HTML element | No class; the element passed to `N(view).cont(...)` becomes `cont.view`. |
| Controller | The object passed to `N(view).cont({...})` | `init(view, request)` runs when the page is loaded through `N.comm`, `N.popup`, `N.tab` or `N.docs`; functions can be wrapped by AOP advisors. |
| Model | The server | Any server that exchanges JSON (or HTML fragments). |
| Context | `N.context` | Shared storage for the page's lifetime; holds the `natural.config.js` blocks. |

The full pattern, including page ids and controller rules, is in [CVC pattern](../architecture/cvc-pattern.md).

## Configuration

`dist/natural.config.js` fills `N.context` with one block per package (`core`, `architecture`, `data`, `ui`, `ui.shell`, `template`, `code`). Two values must match your page layout: `N.context.attr("architecture").page.context` and `N.context.attr("ui").alert.container`. See [natural.config.js](../setup/configuration.md).

# Where to go next

- [Installation](../setup/installation.md) - required files, script order and a minimal page.
- [API conventions](api-conventions.md) - class vs plugin forms, return values, instances, `data-*` attributes.
- [natural.config.js](../setup/configuration.md) - every configuration key and its default.
- [First page](../getting-started/first-page.md) - build and load a first block page.
- [CVC pattern](../architecture/cvc-pattern.md) - how Controller, View and Communicator fit together.
- [Component model](../ui/component-model.md) - rules shared by all UI components.

[^js]: natural.js.js (N assembly, jQuery plugin installation, NJS.version, window.N)
[^code]: natural.code.js (registers Natural-CODE version and N.code)
[^template]: natural.template.js (registers Natural-TEMPLATE version and N.template)
[^submit]: NA.comm.submit (loads block pages and triggers the controller init)
[^ds]: ND.ds DataSync implementation
[^build]: Full bundle build script (package input order, no output wrapper)
