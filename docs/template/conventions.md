---
type: Architecture Pattern
title: Natural-TEMPLATE conventions
description: Controller property naming (p., c., e.) that Natural-TEMPLATE turns into components, communicators and event bindings before init, and how to install and activate it.
tags: [template, controller, conventions, aop]
symbols: [N.template, NT, NT.aop, N.template.aop.codes, N.template.aop.template, NT.aop.codes, NT.aop.template, template.aop.codes, template.aop.template, onBeforeInitComponents, onInitComponents, onBeforeInitEvents, onInitEvents, onOpenDefer]
sources:
  - id: template-file
    resource: ../../src/natural.template.js
    title: natural.template.js (version, N.template registration)
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
  - id: codes
    resource: ../../src/natural.template.js
    title: NT.aop.codes (p.select code binding, entry point)
    symbol: NT.aop.codes
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: a2cf3eac0450
  - id: template
    resource: ../../src/natural.template.js
    title: NT.aop.template (hooks, p. and e. processing, init, onOpenDefer)
    symbol: NT.aop.template
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: 3e774a9d9e0b
  - id: components
    resource: ../../src/natural.template.js
    title: NT.aop.components
    symbol: NT.aop.components
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: e60d19c0f4b2
  - id: trinit
    resource: ../../src/natural.architecture.js
    title: NA.cont.trInit (runs advisors, then init)
    symbol: NA.cont.trInit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 82ac411abe72
  - id: aop
    resource: ../../src/natural.architecture.js
    title: NA.cont.aop (advisor wrapping)
    symbol: NA.cont.aop
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: d502a8d7e4f4
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-TEMPLATE.md
    title: Legacy Natural-TEMPLATE guide (removed)
  - id: legacy-examples
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-TEMPLATE-EXAMPLES.md
    title: Legacy Natural-TEMPLATE example guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

Natural-TEMPLATE (`src/natural.template.js`, version 0.4.12, exposed as `N.template`) standardizes Natural-JS block pages by naming convention: Controller properties named `p.{component}.{id}` become Natural-UI components, `e.{id}.{event}` become event bindings, and `c.{name}` hold communicators, all set up before `init` runs.[^template-file] It is driven by [Controller AOP](../architecture/aop.md) and does nothing until an `^init$` advisor calls `N.template.aop.codes(cont, joinPoint)`. Read [CVC pattern](../architecture/cvc-pattern.md) first; this page only adds the template layer.

# Intent

- Replace repetitive setup code (component creation, common-code loading, event binding) with declarations in the Controller object.
- Give every screen the same shape: `p.*` components, `c.*` communicators, `e.*` events, then `init`, so data flow can be read at a glance.
- Keep project-wide policy in one place: advisors and `template.aop.template` hooks run for every page, and AOP can wrap every `c.*` function.

# Participants

| Participant | Where | Role |
|---|---|---|
| `N.template` (`NT`) | a `+template` bundle in `dist/` | `N.template.aop.codes`, `.template`, `.components`, `.events` |
| `^init$` around advisor | `N.context.attr("architecture").cont.advisors` | Creates `cont.onOpenDefer` and calls `N.template.aop.codes(cont, joinPoint)` for every loaded page. |
| `^onOpen` around advisor | same list | Queues `onOpen...` calls of popup and tab pages on `cont.onOpenDefer`, so they run only after the template has run `init`. |
| `N.context.attr("template")` | `natural.config.js` | `aop.codes` (`codeUrl`, `codeKey`), optional `aop.template` hooks, `message` (`MSG-0001` to `MSG-0006`). |
| Controller object | the block page | `p.*`, `c.*` and `e.*` properties plus `init`. |
| Natural-UI components | `N.form`, `N.grid`, `N.select`, ... | Created from `p.*` declarations. |

# Lifecycle

After a loader inserts the page, `N.cont.trInit` wraps the controller's functions with the configured advisors and calls `init(view, request)`; the `^init$` advisor intercepts that call:[^trinit][^codes][^template]

1. **Codes** (`NT.aop.codes`): every `p.select.*` array is normalized to an object. `data` selects are bound at once; all `code` selects share one request to `codeUrl`; every `comm` select calls its `c.*` function. The template waits for all requests (`jQuery.when`) and replaces each `p.select.{id}` with an array of `N.select` instances. See [p.{component}.{id} declarations](component-declaration.md).
2. **Hook** `onBeforeInitComponents(cont, joinPoint)`.
3. **Components** (`NT.aop.components`): for each property starting with `p.`, in declaration order, the component is created and the property is replaced by the instance; `usage` is applied and `action` is queued.[^components]
4. **Hook** `onBeforeInitEvents(cont, joinPoint)`.
5. **Events** (`NT.aop.events`): each property starting with `e.` is bound and replaced by the bound element. See [e.{id}.{event} event binding](event-binding.md).
6. **Hook** `onInitEvents(cont, joinPoint)`.
7. **Actions**: queued `action` calls run in declaration order; `onInitComponents(cont, joinPoint)` runs after each one (see Known issues).
8. **init**: `joinPoint.proceed()` calls the real `init(view, request)`.
9. **onOpen**: a `setTimeout(0)` resolves `cont.onOpenDefer` when it exists, which runs the `onOpen...` calls queued by the `^onOpen` advisor. The template does not create `cont.onOpenDefer`; the advisors under Rules do.

`c.*` properties are never processed; they are called by `comm` selects and by your code. `onBeforeInitComponents`, `onBeforeInitEvents` and `onInitEvents` are called with `this` bound to `N.template.aop`; for `onInitComponents` see Known issues.[^template]

# Rules

**Load a bundle that contains Natural-TEMPLATE.** `dist/` has no standalone `natural.template.min.js`; use `natural.js+template.es6.min.js` (or `.es5`), or `natural.js+code+template.*`, in place of `natural.js.*.min.js`, then `natural.config.js`. See [Installation](../setup/installation.md).

```html
<script src="js/natural_js/lib/jquery-3.7.1.min.js"></script>
<script src="js/natural_js/dist/natural.js+template.es6.min.js"></script>
<script src="js/natural_js/dist/natural.config.js"></script>
```

**Keep the `template` block of `natural.config.js`.** `NT.aop.codes` throws `NC.error("NT.aop.codes", ...)` when `N.context.attr("template").aop` is missing, and the error messages are read from `template.message` for the current locale. Set `aop.codes.codeUrl` and `aop.codes.codeKey` when you use `code` selects; both ship as `null`. See [Configuration](../setup/configuration.md).

```js
N.context.attr("template", {
    aop: {
        codes: {
            codeUrl: "code/getCodeList.json",   // returns the rows of every requested code group
            codeKey: "group"                    // property of a row that holds its code group
        },
        template: {                             // optional hooks, all (cont, joinPoint)
            onBeforeInitComponents: null,
            onInitComponents: null,
            onBeforeInitEvents: null,
            onInitEvents: null
        }
    },
    message: { /* shipped MSG-0001 ... MSG-0006 for ko_KR and en_US */ }
});
```

**Register both advisors.** The `^init$` advisor creates `cont.onOpenDefer` and starts the template, which resolves that Deferred after `init` (Lifecycle step 9). The `^onOpen` advisor queues every `onOpen...` call on it, so popup and tab pages never run `onOpen...` before a delayed `init`; once `init` has run, `done()` on the resolved Deferred calls the method at once:[^aop][^template]

```js
"cont": {
    "advisors": [{
        "pointcut": "^init$",
        "adviceType": "around",
        "fn": function (cont, fnChain, args, joinPoint) {
            cont.onOpenDefer = cont.onOpenDefer || jQuery.Deferred();   // resolved by the template after init
            N.template.aop.codes(cont, joinPoint);                      // codes, p.*, e.*, actions, then init
        }
    }, {
        "pointcut": "^onOpen",
        "adviceType": "around",
        "fn": function (cont, fnChain, args, joinPoint) {
            if (cont.onOpenDefer) {
                cont.onOpenDefer.done(function () { joinPoint.proceed(); });
            } else {
                joinPoint.proceed();                                    // page without init: nothing to wait for
            }
        }
    }]
}
```

This works for loaded and preloaded popups and tabs alike, because the Deferred belongs to the page's controller and is created when its `init` is called. If a `code` or `comm` request of the page fails, `init` never runs and the queued `onOpen...` calls never run either.

**Page source structure.** A block page is an optional `<style>` whose selectors start with the page class, one root View element carrying that class, and a `<script>` that declares the controller. Keep the controller in a `const` so handlers can reach components through it:

```html
<style>
    .sample0001 .search-panel { padding: 8px; }
</style>

<article class="sample0001">
    <div id="search" class="search-panel">
        <input id="name" type="text">
        <select id="gender"><option value="">All</option></select>
        <button id="btnSearch" class="btn-search">Search</button>
    </div>
    <table id="master">
        <thead><tr><th>Name</th><th>Gender</th></tr></thead>
        <tbody><tr><td id="name"></td><td id="gender"></td></tr></tbody>
    </table>
</article>

<script type="text/javascript">
(() => {
    const cont = N(".sample0001").cont({
        "p.select.gender": { code: "gender", key: "codeName", val: "code" },
        "p.form.search": { usage: "search-box" },
        "p.grid.master": { height: 300, action: "bind" },

        "c.getList": () => cont["p.form.search"].data(false).comm("sample/getList.json"),

        "e.btnSearch.click": (e) => {
            e.preventDefault();
            cont["c.getList"]().submit((data) => {
                cont["p.grid.master"].bind(data);
            });
        },

        init: (view, request) => {
            cont["e.btnSearch.click"].trigger("click");
        }
    });
})();
</script>
```

**Property naming.**

| Prefix | Declared value | Processed by | Value after the template has run |
|---|---|---|---|
| `p.{component}.{id}` | options object (`p.select`: object or array) | `NT.aop.codes` (`p.select`), `NT.aop.components` | the component instance; `p.select`: array of `N.select`; `p.button`: the jQuery collection |
| `c.{name}` | function that returns a new `N.comm` | nothing (naming rule only) | unchanged |
| `e.{id}.{event}` | handler function, or `{ target, handler }` | `NT.aop.events` | the bound jQuery element (rows of `N.grid` / `N.list`: the grid or list element) |

Read and call them with bracket notation, because the names contain dots: `cont["p.grid.master"].bind(data)`, `cont["c.getList"]().submit(callback)`, `cont["e.btnSearch.click"].trigger("click")`.

**Declare communicators as functions.** `"c.name": () => N(...).comm(url)` builds a new request with the current data on every call; call it as `cont["c.name"]().submit(...)`. Because the function runs at call time, `cont["p.form.search"].data(false).comm(url)` sends the form's current data. An advisor with a pointcut such as `"^c\\."` wraps every communicator of every page. Scope element selections to the view, as everywhere: `N(".box", cont.view).comm("sample/page.html")`.

**Match declarations to element ids.** `p.{component}.{id}` and the function form of `e.{id}.{event}` look up `#id` inside the view. A `p.*` declaration whose element is missing (and which has no `context` or `url` option) throws `MSG-0005`; an `e.*` declaration whose element is missing is silently skipped.[^components]

**Name delayed handlers `onOpen...`.** Only controller methods matching the `^onOpen` pointcut are held back, so the method named by a popup's `onOpen` option or a tab's per-tab `onOpen` must start with `onOpen` (`"onOpen"`, `"onOpenDetail"`). In a tab, put code that needs the content's controller in the per-tab `onOpen` method, not in `N.tab`'s `onActive`, which is not delayed and can run before the content's `init`.

**Start from the template examples.** Each example is a complete screen written with these rules; copy one and adapt the markup, declarations and URLs:

- [Search form and grid](../examples/template/search-grid.md)
- [Search form and grid with CRUD](../examples/template/search-grid-crud.md)
- [Search form, grid and paging](../examples/template/search-grid-paging.md)
- [Search, grid and detail form, horizontal layout](../examples/template/search-grid-detail-horizontal.md)
- [Search, grid and detail form, vertical layout](../examples/template/search-grid-detail-vertical.md)

# Pitfalls

The legacy installation registered only the `^onOpen` advisor and said that this completed the setup.[^legacy] Without the `^init$` advisor nothing processes `p.`, `c.` or `e.` properties, and the first `onOpen...` call of every tab page, and of every popup without `preload`, is parked in a `cont.onOpenDefer` that nothing resolves.[^codes]

```js
// Wrong (legacy): "cont": { "advisors": [ onOpenAdvisor ] }
"cont": { "advisors": [ initAdvisor, onOpenAdvisor ] }   // both objects as shown under Rules
```

The legacy `^onOpen` advisor also decides by `cont.caller.options.preload` and creates the Deferred itself. `N.tab` has no instance `preload` option (preload is set per tab in `tabOpts`), so with that advisor the first `onOpen...` of a preloaded tab is parked in a new Deferred after the template has already run its `setTimeout`, and never runs. A popup with `preload: true` goes the other way: `onOpen...` runs at once, even when `init` is still waiting for `code` or `comm` responses.[^legacy][^template]

```js
// Wrong (legacy): if (cont.onOpenDefer || (cont.caller && cont.caller.options.preload)) { joinPoint.proceed(); } else { cont.onOpenDefer = jQuery.Deferred().done(function () { joinPoint.proceed(); }); }
if (cont.onOpenDefer) { cont.onOpenDefer.done(function () { joinPoint.proceed(); }); } else { joinPoint.proceed(); }   // with the ^init$ advisor creating cont.onOpenDefer
```

A page without an `init` function is not processed at all: the `^init$` advisor wraps only an existing `init`, and `N.cont.trInit` calls `init` only when it is defined. Declare `init`, even an empty one, on every template page.[^trinit]

The common-code settings live under `aop`:

```js
// Wrong (legacy): N.context.attr("template").codes = { codeUrl: "code.json", codeKey: "code" };
N.context.attr("template").aop.codes = { codeUrl: "code.json", codeKey: "code" };
```

There is no separate template script:

```js
// Wrong (legacy): <script type="text/javascript" src="js/natural_js/natural.template.min.js" charset="utf-8"></script>
<script src="js/natural_js/dist/natural.js+template.es6.min.js"></script>
```

Every controller property whose name starts with `p.` or `e.` is processed. A name with fewer than three segments, such as `"p.total": 0`, throws `MSG-0005` (`MSG-0006` for `e.`), so do not use these prefixes for other data.[^template]

When a page declares `code` or `comm` selects, `init` runs only after their responses arrive, while the loader continues at once: the `N.comm` submit callback, `N.popup` / `N.tab` `onLoad` and `N.docs` `onLoad` can run before `init`. Do page setup in `init` or in `onOpen...` methods, not in loader callbacks.

A `c.*` function used by a `comm` select runs in step 1, before any other `p.*` component exists, so it cannot read `cont["p.form.search"]`; at that point the property still holds the options object.

`init` written as an arrow function has no `this`; reach `caller`, `opener` and `request` through the controller variable (`cont.caller`) or write `init` as a `function`.

# Known issues

* **Natural-TEMPLATE is inert until an `init` advisor calls it** - Actual: nothing in `src/` or in the shipped `natural.config.js` calls `N.template.aop.codes`; `N.cont.trInit` only runs the advisors listed in `architecture.cont.advisors`, and the shipped list is empty. Loading a `+template` bundle alone leaves `p.`, `c.` and `e.` properties as plain data, and the legacy install step (only the `^onOpen` advisor) additionally swallows the first `onOpen...` call. Likely intent: the installation includes the `^init$` advisor. Workaround: register both advisors shown under Rules.[^codes][^trinit]
* **`onInitComponents` runs only for components that declare `action`** - Actual: `NT.aop.template` calls the hook inside the loop that resolves queued actions, once per component with an `action` and never when no component has one; `this` is that action's Deferred. Likely intent: once, after all components are initialized. Workaround: use `onBeforeInitEvents`, which runs once right after every `p.*` component has been created.[^template]

# Related

- [p.{component}.{id} declarations](component-declaration.md) - component options, `p.select` code and list binding, `usage` and `action`.
- [e.{id}.{event} event binding](event-binding.md) - handler forms, grid and list rows, component events.
- [Controller AOP](../architecture/aop.md) - advisors, pointcuts and `joinPoint.proceed()`.
- [N.cont](../architecture/controller.md) - `init`, `onOpen`, `caller` and `opener` of block pages.
- [N.comm](../architecture/communicator.md) - what `c.*` functions return.
- [Configuration](../setup/configuration.md) - the `template` and `architecture.cont` blocks.

[^template-file]: natural.template.js (version, N.template registration)
[^codes]: NT.aop.codes (p.select code binding, entry point)
[^template]: NT.aop.template (hooks, p. and e. processing, init, onOpenDefer)
[^components]: NT.aop.components
[^trinit]: NA.cont.trInit (runs advisors, then init)
[^aop]: NA.cont.aop (advisor wrapping)
[^legacy]: Legacy Natural-TEMPLATE guide (removed)
