---
type: API Reference
title: N.browser
description: Browser helpers - read, write and remove cookies, detect the browser or mobile OS, read the IE version, get the URL context path and measure the scrollbar width.
tags: [core, browser, cookie]
symbols: [N.browser, NC.browser, N.browser.cookie, N.browser.removeCookie, N.browser.msieVersion, N.browser.is, N.browser.contextPath, N.browser.scrollbarWidth]
sources:
  - id: browser
    resource: ../../src/natural.core.js
    title: NC.browser implementation
    symbol: NC.browser
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 2cc6370b5e57
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CORE.md
    title: Legacy developer guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

`N.browser` wraps `document.cookie`, user-agent and feature sniffing, and a few layout measurements. Natural-UI uses `is` and `scrollbarWidth` to apply browser-specific corrections; application code mostly uses `cookie` and `removeCookie`.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.browser.cookie` | `N.browser.cookie(name[, value[, expiredays[, domain]]])` | cookie value or `undefined` (get), `undefined` (set) |
| `N.browser.removeCookie` | `N.browser.removeCookie(name[, domain])` | `undefined` |
| `N.browser.msieVersion` | `N.browser.msieVersion()` | IE version number, `0` when not IE |
| `N.browser.is` | `N.browser.is(name)` | boolean |
| `N.browser.contextPath` | `N.browser.contextPath()` | string |
| `N.browser.scrollbarWidth` | `N.browser.scrollbarWidth()` | number (pixels) |

# Functions

## `N.browser.cookie(name[, value[, expiredays[, domain]]])`

- Get: when `value` is `undefined`, returns the `decodeURIComponent`-decoded value of cookie `name`, or `undefined` when it is not set.
- Set: writes `name=value; path=/`, plus `expires` = now + `expiredays` days when given (a session cookie otherwise) and `domain` when given. Returns `undefined`.[^browser]
- The path is always `/`. The value is passed through `decodeURIComponent` before it is written (see Known issues).

## `N.browser.removeCookie(name[, domain])`

Expires cookie `name` on path `/` (and `domain` when given) by setting an expiry date in 1970.[^browser]

## `N.browser.msieVersion()`

Returns the Internet Explorer version from the user agent, or `0` for other browsers. IE 8-11 are derived from the `Trident/x.y` token (version = Trident major + 4).[^browser]

## `N.browser.is(name)`

`true` when the current browser matches `name`: `"opera"`, `"firefox"`, `"safari"`, `"chrome"`, `"ie"`, `"ios"` or `"android"`. The checks run in this order and the first one that applies decides the answer for every name:[^browser]

| Order | Detected as | Test |
|---|---|---|
| 1 | `opera` | `"opera" in window` or ` OPR/` in the user agent |
| 2 | `firefox` | `"InstallTrigger" in window` |
| 3 | `safari` | user agent contains `safari` but not `chrome`, `android`, `crios` or `fxios` (skipped when `name` is `"ios"`) |
| 4 | `chrome` | `"chrome" in window` |
| 5 | `ie` | `msieVersion() > 0` |
| 6 | `ios` | user agent contains `like Mac OS X` |
| 7 | `android` | user agent contains `android` |

## `N.browser.contextPath()`

Returns the first path segment of `location.href`, for example `"/app"` for `http://host/app/page.html`.[^browser]

## `N.browser.scrollbarWidth()`

Appends a hidden 50 px scrolling `div` to `body`, measures the difference between its inner width and its content width, removes it and returns the width in pixels (`0` with overlay scrollbars).[^browser] `N.grid` uses it to pad its fixed header and `N.tab` checks it when binding its tab events.

# Pitfalls

- `N.browser.is` answers one browser at a time: any browser that defines `window.chrome` is `"chrome"`, so `is("android")` and `is("ios")` are `false` for it even on a phone.
- `N.browser.cookie` and `N.browser.removeCookie` always use `path=/`; cookies written by the server on another path are not removed.
- `N.browser.scrollbarWidth` needs a rendered `body`; call it after the document is ready.

# Known issues

* **`cookie` decodes the value instead of encoding it** - Actual: the setter writes `decodeURIComponent(value)`, so `;`, `,` and spaces end up raw in `document.cookie` and a lone `%` throws a URIError, while the getter decodes. Likely intent: `encodeURIComponent(value)`. Workaround: store only cookie-safe values (letters, digits, `-`, `_`, `.`) or pass `encodeURIComponent(encodeURIComponent(value))`.[^browser]
* **`msieVersion` can throw** - Actual: when the user agent contains `MSIE ` or `.NET` but no `Trident/` token, `ua.match(...)` returns `null` and the code compares it with `undefined`, then reads `trident[1]` and throws a TypeError. Likely intent: fall back to the `MSIE` version number. Workaround: wrap the call in `try`/`catch` when non-IE user agents with `.NET` are possible.[^browser]
* **`contextPath` returns the origin for single-segment URLs** - Actual: for `http://host/index.html` or `http://host/` there is no second `/`, `indexOf` returns `-1` and `substring` swaps its arguments, returning `"http://host"`. Likely intent: `""`. Workaround: `const p = N.browser.contextPath(); const ctx = p.startsWith("/") ? p : "";`.[^browser]

# Examples

Remember a UI preference for 30 days:

```js
N.browser.cookie("gridPageSize", "50", 30);
const size = Number(N.browser.cookie("gridPageSize") || 20);
N.browser.removeCookie("gridPageSize");
```

Apply a Safari-only correction:

```js
if (N.browser.is("safari")) {
    N("#header", view).css("padding-right", N.browser.scrollbarWidth() + "px");
}
```

# Related

- [N (static functions)](n-static.md) - type tests and logging on the `N` object.
- [N.event](event.md) - event helpers that pair with the browser checks.
- [N.grid](../ui/grid.md) - uses `scrollbarWidth` and `is` for header alignment.
- [N.tab](../ui/tab.md) - checks `scrollbarWidth` when binding its tab events.
- [API conventions](../overview/api-conventions.md) - naming rules for the `N` namespaces.

[^browser]: NC.browser implementation
