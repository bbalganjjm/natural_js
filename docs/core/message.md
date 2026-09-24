---
type: API Reference
title: N.message
description: Locale-aware message lookup - N.message.get picks the message for the current N.locale() from a resource object and fills {0}, {1} placeholders.
tags: [core, i18n, message]
symbols: [N.message, NC.message, N.message.get, N.message.replaceMsgVars]
sources:
  - id: message
    resource: ../../src/natural.core.js
    title: NC.message implementation
    symbol: NC.message
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 6818eb3bc817
  - id: locale
    resource: ../../src/natural.core.js
    title: NC.locale
    symbol: NC.locale
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: f894f93da288
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CORE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.message` returns the message for the current locale from a resource object keyed first by locale and then by message key. Natural-JS components read their built-in texts (button labels, date range warnings) through it from their `message` options, and application code can use it for its own messages. The current locale is `N.locale()`, stored in `N.context.attr("core").locale`.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.message.get` | `N.message.get(resource, key[, vars])` | message string, or `key` when missing |
| `N.message.replaceMsgVars` | `N.message.replaceMsgVars(msg[, vars])` | string |

# Functions

## `N.message.get(resource, key[, vars])`

Reads `resource[N.locale()][key]`.[^message]

- Found: returns it with `{0}`, `{1}`, ... replaced by `vars[0]`, `vars[1]`, ... (see `replaceMsgVars`).
- Key missing for the current locale: returns `key` itself.
- No entry for the current locale at all: throws a TypeError.

```js
const MSG = {
    "ko_KR": { saved: "{0} rows saved (Korean text here)." },
    "en_US": { saved: "{0} rows saved." }
};
N.message.get(MSG, "saved", [3]); // "3 rows saved." when N.locale() is "en_US"
```

## `N.message.replaceMsgVars(msg[, vars])`

Replaces every `{i}` in `msg` with `vars[i]` for each index of `vars`, and returns `msg` unchanged when `vars` is `undefined`. Values are converted to strings by `join`.[^message]

# Pitfalls

- The resource is locale first, then key. The JSDoc of `NC.MessageResourceObj` in the TypeScript typings describes the opposite nesting; the code reads `resource[locale][key]`.
- Every resource needs a sub-object for every locale you switch to. The shipped `natural.config.js` sets `"ko_KR"` as the locale, so a resource that defines only `en_US` throws until `N.locale("en_US")` is called.[^locale]
- Pass `vars` as an array even for one value: a string is iterated character by character, so `N.message.get(MSG, "saved", "12")` fills `{0}` with `"1"` and `{1}` with `"2"`.
- A missing key returns the key, so a typo shows up on screen as the key text rather than as an error.

# Examples

Messages kept in the Controller and shown in an alert:

```js
N(".page01").cont({
    messages: {
        "ko_KR": { confirmDelete: "Delete {0} rows? (Korean text here)" },
        "en_US": { confirmDelete: "Delete {0} rows?" }
    },
    init: function (view, request) {
        const cont = this;
        N("#btnDelete", view).on("click", function () {
            const count = N("#grid", view).instance("grid").data("delete").length;
            N(window).alert({
                msg: N.message.get(cont.messages, "confirmDelete", [count]),
                confirm: true
            }).show();
        });
    }
});
```

Framework messages come from component `message` options configured in `natural.config.js` (for example the alert's `confirm` and `cancel` labels). See [Configuration](../setup/configuration.md).

# Related

- [N (static functions)](n-static.md) - `N.locale()` to read or switch the locale.
- [Configuration](../setup/configuration.md) - the default locale and the built-in message sets.
- [N.alert](../ui/alert.md) - shows messages and uses `N.message` for its own labels.
- [N.datepicker](../ui/datepicker.md) - `minDate` and `maxDate` warnings built with `vars`.
- [Controller](../architecture/controller.md) - a natural place to keep page messages.

[^message]: NC.message implementation
[^locale]: NC.locale
