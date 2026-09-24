---
type: API Reference
title: N.context
description: Application-wide key-value store that holds the natural.config.js settings and any shared data for the lifetime of the loaded document.
tags: [architecture, context, config, state]
symbols: [N.context, NA.context, N.context.attr, NA.context.attr, N.context.attrObj, NA.context.attrObj]
sources:
  - id: context
    resource: ../../src/natural.architecture.js
    title: NA.context implementation
    symbol: NA.context
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: a0dd406b9703
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-ARCHITECTURE.md
    title: Legacy Natural-ARCHITECTURE guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.context` is a static key-value store that lives as long as the document: from page load until the browser navigates to another URL. `natural.config.js` writes the framework settings into it (`N.context.attr("core")`, `N.context.attr("architecture")`, ...), every Natural-JS module reads them back from it, and applications can keep their own shared data there, such as the signed-in user. `N.context` is the same class object as `NA.context`.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.context.attr` | `N.context.attr(name)` | the stored value, or `undefined` |
| `N.context.attr` | `N.context.attr(name, obj)` | `N.context` (chainable) |
| `N.context.attr` | `N.context.attr()` | `N.context`, not the stored map |
| `N.context.attrObj` | property | the backing object holding every entry |

# Functions

## `N.context.attr(name[, obj])`

- `attr(name, obj)` stores `obj` under `name` (replacing any previous value) and returns `N.context`.[^context]
- `attr(name)` returns the stored value; `attr(name, undefined)` is also a getter, so `undefined` cannot be stored.
- `attr()` returns `N.context`. To list every entry, read `N.context.attrObj`.
- Values are stored by reference: mutating a returned object changes the stored configuration.

## `N.context.attrObj`

The plain object behind `attr`. Entries written by the shipped `natural.config.js` and read by the framework:

| Key | Read by | Holds |
|---|---|---|
| `"core"` | Natural-CORE | `locale`, `sgChkdVal`, `sgUnChkdVal`, `spltSepa`, `gcMode`, `charByteLength` |
| `"architecture"` | Natural-ARCHITECTURE | `page.context`, `cont` ([AOP](aop.md)), `comm.filters` ([filters](communication-filter.md)), `comm.request.options` ([request defaults](request.md)) |
| `"data"` | Natural-DATA | formatter, validator and data settings |
| `"ui"` | Natural-UI | per-component defaults and messages (`ui.alert`, `ui.grid`, ...) |
| `"ui.shell"` | Natural-UI.Shell | `notify` and `docs` defaults |
| `"template"` | Natural-TEMPLATE | template settings |
| `"code"` | Natural-CODE | code inspection settings |

The full schema is in [Configuration](../setup/configuration.md).

# Pitfalls

`attr(name, obj)` replaces the whole entry. To change one setting, mutate the stored object instead of writing a partial one.[^context]

```js
// Wrong (legacy): N.context.attr("architecture", { page: { context: "body" } });  // drops cont and comm
N.context.attr("architecture").page.context = "body";
```

`attr()` without arguments does not return the stored map.

```js
// Wrong (legacy): const all = N.context.attr();
const all = N.context.attrObj;
```

Framework code rewrites some entries at runtime: `N.docs` sets `architecture.page.context` and `ui.alert.container` to the active document's content element, and may add `architecture.comm.filters.docsFilter__`. Read these values when you need them instead of caching them at startup.

The store is per document. A full page navigation (not an `N.comm` page load) starts with an empty store and a freshly executed `natural.config.js`.

# Examples

Store and read shared data:

```js
N.context.attr("globalInfo", {
    userId: "jeff1942",
    userNm: "Jeff Beck"
});

const globalInfo = N.context.attr("globalInfo");
```

Chain several writes and read a framework setting:

```js
N.context.attr("menuId", "M0001").attr("theme", "dark");

const gcMode = N.context.attr("core").gcMode;               // "full" with the shipped config
const pageContext = N.context.attr("architecture").page.context;
```

# Related

- [Configuration](../setup/configuration.md) - every key that `natural.config.js` stores in `N.context`.
- [CVC pattern](cvc-pattern.md) - `N.context` as the Context participant.
- [Controller AOP](aop.md) - advisors read from `N.context.attr("architecture").cont`.
- [Communication filter](communication-filter.md) - filters read from `N.context.attr("architecture").comm.filters`; `N.config` holds the built filter chain.
- [Component model](../ui/component-model.md) - how `N.context.attr("ui")` defaults merge into component options.

[^context]: NA.context implementation
