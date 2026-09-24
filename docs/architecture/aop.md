---
type: API Reference
title: Controller AOP
description: Pointcuts and advisors in N.context.attr("architecture").cont that wrap Controller functions with before, after, around or error advice at page init.
tags: [architecture, aop, controller, config]
symbols: [NA.cont.aop, N.cont.aop, NA.cont.aop.wrap, NA.cont.aop.pointcuts.regexp, architecture.cont.advisors, architecture.cont.pointcuts, joinPoint.proceed, adviceType]
sources:
  - id: aop
    resource: ../../src/natural.architecture.js
    title: NA.cont.aop (built-in regexp pointcut and wrap)
    symbol: NA.cont.aop
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: d502a8d7e4f4
  - id: trinit
    resource: ../../src/natural.architecture.js
    title: NA.cont.trInit (calls NA.cont.aop.wrap before init)
    symbol: NA.cont.trInit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 82ac411abe72
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-ARCHITECTURE.md
    title: Legacy Natural-ARCHITECTURE guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

Natural-ARCHITECTURE applies aspect-oriented advice to Controller objects: advisors declared in `N.context.attr("architecture").cont` wrap every controller function whose dotted path matches a pointcut. Wrapping happens once per page, inside `N.cont.trInit`, just before `init` runs, so an `^init$` advisor is the standard hook for page-wide setup (loading codes, initializing components, deferring `init`). Declare advisors in `natural.config.js`; see [Configuration](../setup/configuration.md).

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| pointcut `fn` | `fn(param, contFrag, fnChain)` | truthy to wrap the function |
| `before` advice | `fn(contFrag, fnChain, args)` | ignored |
| `after` advice | `fn(contFrag, fnChain, args, result)` | ignored; the wrapped call returns `result` |
| `around` advice | `fn(contFrag, fnChain, args, joinPoint)` | becomes the wrapped call's return value |
| `error` advice | `fn(contFrag, fnChain, args, e)` | becomes the wrapped call's return value |
| `joinPoint.proceed` | `joinPoint.proceed()` | the original function's return value |
| `N.cont.aop.wrap` | `N.cont.aop.wrap(cont)` | `undefined` (internal) |

# Options

Configuration lives in `N.context.attr("architecture").cont`:[^aop]

```js
N.context.attr("architecture", {
    // page, comm, ...
    "cont": {
        "pointcuts": { /* optional custom pointcuts */ },
        "advisors": [ /* advisor objects */ ]
    }
});
```

Advisor object (one entry of `advisors`):

| Name | Type | Default | Description |
|---|---|---|---|
| `pointcut` | string \| RegExp \| object | — | Which functions to wrap. A string or RegExp uses the built-in `regexp` pointcut. A string may start with a jQuery selector and a colon (`".page-0001:^init$"`) to limit the advisor to views matching the selector; the split is at the **last** colon. The object form is `{ type, param[, selector] }`: `type` names a pointcut in `cont.pointcuts` or the built-in `regexp`, `param` is passed to that pointcut, `selector` limits the views. |
| `adviceType` | string | — | `"before"`, `"after"`, `"around"` or `"error"`. Any other value replaces every matched function with `undefined`. |
| `fn` | function | — | The advice. Arguments per type are listed under Functions. `this` is the advisor object. |

Pointcut object (one entry of `pointcuts`, keyed by the name used in `pointcut.type`):

| Name | Type | Default | Description |
|---|---|---|---|
| `fn` | function | — | `fn(param, contFrag, fnChain)`; return truthy to wrap the function. `this` is the pointcut object. A custom pointcut named `regexp` replaces the built-in one. |

The built-in `regexp` pointcut (`NA.cont.aop.pointcuts.regexp`) returns `(param instanceof RegExp ? param : new RegExp(param)).test(fnChain)`.[^aop]

Arguments used below:

- `contFrag`: the object that owns the function. For a top-level function (`init`) it is the Controller object; for a function inside a nested plain object (`cont.e.btnSave.click`) it is that nested object, not the controller.
- `fnChain`: the dotted path of the function from the controller root, for example `"init"` or `"e.btnSave.click"`.
- `args`: the call's arguments as an array.

# Functions

## `before: fn(contFrag, fnChain, args)`

Runs before the original function. The return value is ignored; the original function then runs with `args`.[^aop]

## `after: fn(contFrag, fnChain, args, result)`

Runs after the original function with its return value. The wrapped call still returns the original `result`; the advice's return value is ignored.

## `around: fn(contFrag, fnChain, args, joinPoint)`

Replaces the call. The original function runs only if the advice calls `joinPoint.proceed()`, and the wrapped call returns whatever the advice returns, so return the `proceed()` result unless you mean to change it. `proceed()` may be called later (for example in an `N.comm` callback) to defer the original function; the wrapped call then returns before it runs.

## `error: fn(contFrag, fnChain, args, e)`

Wraps the call in `try/catch`. When the original function throws synchronously, the advice receives the error as the **fourth** argument and its return value becomes the call's return value. The exception is swallowed unless the advice rethrows it. Errors thrown later in callbacks or promises are not caught.[^aop]

## `joinPoint.proceed()`

`joinPoint` is `{ contFrag, args, real, proceed }`. `proceed()` runs `this.real.apply(this.contFrag, this.args)`, so call it as a method of `joinPoint`, and change `joinPoint.args` (the same array as `args`) before calling it to alter the arguments.

## `N.cont.aop.wrap(cont)`

Internal; called by `N.cont.trInit` before `init`.[^trinit] It does nothing when `N.context.attr("architecture").cont.advisors` is missing or empty. Otherwise, for each advisor in array order:

1. Normalizes a string or RegExp `pointcut` to `{ type: "regexp", param, selector }` and writes it back to the advisor object, so the configuration is mutated on first use.
2. Resolves the pointcut from `cont.pointcuts[type]`, then `NA.cont.aop.pointcuts[type]`; an unknown type throws `NC.error("[NA.cont.aop.wrap]Unkown pointcut type : <type>")`, and `init` does not run.
3. Skips the advisor when a `selector` is set and `cont.view.is(selector)` is false.
4. Walks the controller's own enumerable properties recursively: functions that match are replaced by a wrapper; plain objects are descended into with `fnChain` prefix `"<key>."`.

# Pitfalls

The `error` advice receives the exception as the fourth argument; there is no `result` argument.[^aop]

```js
// Wrong (legacy): "fn" : function(cont, fnChain, args, result, e) { console.log(e.message); }
"fn": function (contFrag, fnChain, args, e) { console.log(fnChain, e.message); }
```

An `around` advice must return the `proceed()` result, or the wrapped function returns `undefined`.

```js
// Wrong (legacy): "fn" : function(cont, fnChain, args, joinPoint) { var result = joinPoint.proceed(); }
"fn": function (contFrag, fnChain, args, joinPoint) {
    const result = joinPoint.proceed();
    return result;
}
```

`proceed` reads `this.real`, `this.contFrag` and `this.args`, so always call it as `joinPoint.proceed()`; a destructured or detached reference loses `this`.

The first advice argument is the owning object, not always the controller. `contFrag.view` exists only for top-level functions; anchor pointcuts (`^init$`) or read the controller elsewhere when you advise nested functions.

A string pointcut is split at its last colon into selector and regex. A regex that itself contains a colon, such as a non-capturing group, is broken apart; see Known issues.

Wrappers call the original with `this` bound to `contFrag`. A wrapped controller method used as a jQuery event handler sees the controller (or nested object) as `this`, not the element.

Wrapped functions cannot be used as constructors: `new cont.MyType()` returns an empty wrapper object, and an ES class stored on the controller throws because the wrapper calls it without `new`. Exclude such members from the pointcut.

`wrap` descends into every own plain-object property, including injected ones such as `opener` (a plain controller object). Use anchored regexes so advisors do not wrap functions of the parent controller, and do not keep a cycle of plain objects on the controller (a property that points back to the controller or to an ancestor object), which recurses until the stack overflows.

Only functions present when `init` is about to run are wrapped; functions added inside `init` or later are not.

With several advisors on the same function, the later advisor wraps the earlier one: later `before` advice runs first, later `after` advice runs last.

# Known issues

* **String pointcuts containing a colon are split into a bogus selector** - Actual: `NA.cont.aop.wrap` splits every string pointcut at its last `:`, so `"^(?:init|search)$"` becomes selector `"^(?"` and regex `"init|search)$"`, and `cont.view.is("^(?")` throws a jQuery selector syntax error during `init`. Likely intent: split only when a selector prefix is present. Workaround: pass a RegExp (`/^(?:init|search)$/`) or the object form `{ type: "regexp", param: "^(?:init|search)$" }`, neither of which is split.[^aop]

# Examples

Declaring pointcuts and all four advice types:

```js
N.context.attr("architecture", {
    "page": { "context": "body" },
    "cont": {
        "pointcuts": {
            "errorPointcut": {
                "fn": function (param, contFrag, fnChain) {
                    return true;   // every function
                }
            }
        },
        "advisors": [{
            "pointcut": "^before.*",
            "adviceType": "before",
            "fn": function (contFrag, fnChain, args) {
                console.log("before %s", fnChain);
            }
        }, {
            "pointcut": "^after.*",
            "adviceType": "after",
            "fn": function (contFrag, fnChain, args, result) {
                console.log("after %s", fnChain, result);
            }
        }, {
            "pointcut": "^around.*",
            "adviceType": "around",
            "fn": function (contFrag, fnChain, args, joinPoint) {
                const result = joinPoint.proceed();
                console.log("around %s", fnChain, result);
                return result;
            }
        }, {
            "pointcut": { "type": "errorPointcut", "param": "" },
            "adviceType": "error",
            "fn": function (contFrag, fnChain, args, e) {
                console.error("error in %s", fnChain, e);
            }
        }],
        // comm, ...
    }
});
```

Load common codes before `init`, bind them with `N.select`, then run `init`:

```js
"cont": {
    "advisors": [{
        "pointcut": "^init$",
        "adviceType": "around",
        "fn": function (cont, fnChain, args, joinPoint) {
            N.comm("getCommCodeList.json").submit(function (data) {
                N(data).select({ context: N("#select", cont.view) }).bind();
                joinPoint.proceed();   // init runs after the codes are bound
            });
        }
    }]
}
```

Initialize components found in every loaded view, then run `init`:

```js
"cont": {
    "advisors": [{
        "pointcut": "^init$",
        "adviceType": "around",
        "fn": function (cont, fnChain, args, joinPoint) {
            N(".button", cont.view).button();
            N(".form", cont.view).each(function () { N([]).form(this); });
            N(".list", cont.view).each(function () { N([]).list(this); });
            N(".grid", cont.view).each(function () { N([]).grid(this); });

            const result = joinPoint.proceed();

            N("#grid01", cont.view).instance("grid").bind([]);
            return result;
        }
    }]
}
```

Limit an advisor to one page with a selector prefix:

```js
{ "pointcut": ".page-0001:^init$", "adviceType": "before", "fn": function (cont) { N.log(cont.view.data("pageid")); } }
```

# Related

- [N.cont](controller.md) - the Controller object that advisors wrap, and `N.cont.trInit`.
- [CVC pattern](cvc-pattern.md) - where AOP sits in the page load sequence.
- [Configuration](../setup/configuration.md) - the `architecture.cont` block of `natural.config.js`.
- [Natural-TEMPLATE conventions](../template/conventions.md) - Natural-TEMPLATE provides `N.template.aop.codes(cont, joinPoint)` and `N.template.aop.template(cont, joinPoint)`, which you call from your own `^init$` `around` advisor; it does not register advisors itself.
- [N.context](context.md) - where the configuration is stored.

[^aop]: NA.cont.aop (built-in regexp pointcut and wrap)
[^trinit]: NA.cont.trInit (calls NA.cont.aop.wrap before init)
