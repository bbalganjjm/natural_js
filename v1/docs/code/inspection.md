---
type: API Reference
title: N.code
description: Natural-CODE (N.code) scans the script of view HTML for selectors without a view context and jQuery val() setters, and reports the findings to the console.
tags: [code, inspection, lint]
status: draft
symbols: [N.code, N.code.inspection, N.code.inspection.test, N.code.inspection.rules, N.code.inspection.report, N.code.severityLevels, N.code.addSourceURL, NCD, NCD.inspection, NCD.severityLevels, NCD.addSourceURL]
sources:
  - id: inspection
    resource: ../../src/natural.code.js
    title: NCD.inspection (test, rules, report.console)
    symbol: NCD.inspection
    git_blob: cace23c7b3b7bc5cd23c75a516220586472d7b3c
    symbol_sha1: 62ffc7a7cafc
  - id: severity
    resource: ../../src/natural.code.js
    title: NCD.severityLevels
    symbol: NCD.severityLevels
    git_blob: cace23c7b3b7bc5cd23c75a516220586472d7b3c
    symbol_sha1: 6ed57155fd27
  - id: source-url
    resource: ../../src/natural.code.js
    title: NCD.addSourceURL
    symbol: NCD.addSourceURL
    git_blob: cace23c7b3b7bc5cd23c75a516220586472d7b3c
    symbol_sha1: 83cd3bb8b14f
  - id: nc-error
    resource: ../../src/natural.core.js
    title: NC.error (builds an Error without logging)
    symbol: NC.error
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: c876d46fd925
  - id: comm-submit
    resource: ../../src/natural.architecture.js
    title: NA.comm.submit (runs success filters on loaded view HTML)
    symbol: NA.comm.submit
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 18f0d9eb2bce
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-CONFIG.md
    title: Legacy config reference guide (removed), Natural-CODE section
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
verified:
  - { by: claude-code/unknown, at: 2026-09-24T05:37:19Z }
---

Natural-CODE (`src/natural.code.js`, version 0.4.8) is an optional static checker for view HTML: `N.code.inspection.test` looks for two anti-patterns in a view's script and `N.code.inspection.report.console` prints the findings. It ships only in the `natural.js+code` and `natural.js+code+template` bundles, and no framework code calls it, so an application wires it in itself, typically with a communication filter on loaded views. The module exports nothing; its static class `NCD` is reachable only as `N.code`.

# Summary

| Symbol | Signature | Returns |
|---|---|---|
| `N.code.inspection.test` | `N.code.inspection.test(codes[, rules])` | `false`, or an array of findings |
| `N.code.inspection.rules` | `{ RuleName: function (codes, excludes, report) }` | rule functions push findings into `report` |
| `N.code.inspection.report.console` | `N.code.inspection.report.console(data, url)` | `false` when `data` is falsy, otherwise `undefined` |
| `N.code.severityLevels` | frozen `{ BLOCKER, CRITICAL, MAJOR, MINOR }` | `[label, color, logger]` per level |
| `N.code.addSourceURL` | `N.code.addSourceURL(codes, sourceURL)` | the HTML with a `//# sourceURL=` comment |

# Options

`N.code` has no constructor. Its settings live in `N.context.attr("code").inspection`, defined in `natural.config.js`:[^inspection]

| Name | Type | Shipped value | Description |
|---|---|---|---|
| `abortOnError` | boolean | `false` | When `true`, `report.console` throws on the first Blocker or Critical finding. |
| `excludes` | string[] | `[]` | A match is skipped when the matched source text contains any of these strings, for example `[".index-header", ".page-header"]`. |
| `message` | object | `ko_KR` and `en_US` sets | Messages per locale, keyed by rule name (`NoContextSpecifiedInSelector`, `UseTheComponentsValMethod`). |

`test()` throws when `N.context.attr("code").inspection` is missing. See [Configuration](../setup/configuration.md).

# Functions

## `N.code.inspection.test(codes[, rules])`

- `codes` (string): the whole HTML text of a view.
- `rules` (string[]): names of entries in `N.code.inspection.rules` to run; all rules run when omitted. An unknown name throws a `TypeError`.
- Returns `false` when `codes` contains no `<script`.
- Throws `Define Natural-CODE options and message resources in NA.context.attr("code").inspection in the natural.config.js file.` when the configuration block is missing.
- Otherwise returns an array (possibly empty) of findings:[^inspection]

| Field | Description |
|---|---|
| `level` | Severity label from `severityLevels`: `"Critical"` or `"Major"` for the built-in rules. |
| `message` | `NC.message.get(inspection.message, ruleName)` for the current locale (the rule name when the key is missing). |
| `line` | 1-based line number in `codes` where the match ends. |
| `code` | The matched source text, from the call to the end of the line. |

## `N.code.inspection.report.console(data, url)`

- `data`: the result of `test()`. Returns `false` when it is falsy (for example `false` for HTML without scripts).
- `url` (string): printed with each finding.
- For each finding the logger is `severityLevels[LEVEL][2]` (`NC.error`, `NC.warn` or `NC.log`). The line `[level] url - line : code` is printed in the level color with `%c` styling (without styling in Internet Explorer), followed by the message.
- With `abortOnError` on, a Blocker or Critical finding throws the `Error` built by `NC.error` (`[level] url - line : code` plus the message) and stops the loop.[^inspection]
- Without `abortOnError`, Blocker and Critical findings print nothing (see Known issues).

## `N.code.severityLevels`

A frozen object. Index 0 is the label used as `finding.level`, index 1 the console color, index 2 the logger.[^severity]

| Key | Value |
|---|---|
| `BLOCKER` | `["Blocker", "darkred", NC.error]` |
| `CRITICAL` | `["Critical", "red", NC.error]` |
| `MAJOR` | `["Major", "orange", NC.warn]` |
| `MINOR` | `["Minor", "black", NC.log]` |

## `N.code.addSourceURL(codes, sourceURL)`

Returns `codes` unchanged when it contains no `<script`. Otherwise inserts `\n//# sourceURL=<sourceURL>\n` before the last `</script>` that follows a newline, a tab or a space (tried in that order), so browser developer tools can list the inline view script under `sourceURL`.[^source-url]

# Rule catalog

`N.code.inspection.rules` is a plain object; `test()` runs every key, so an application can add a rule `function (codes, excludes, report)` that pushes `{ level, message, line, code }` objects into `report`. Both built-in rules skip `//` line comments and matches that contain an `excludes` string, and report a match only when its text also occurs in the first `<script>` block of `codes`.[^inspection]

| Rule | Level | Reports | Not reported when |
|---|---|---|---|
| `NoContextSpecifiedInSelector` | Critical | `N("...")` or `$("...")` whose first argument is a string literal and that is not scoped to a view, so it can select elements of other views. | The selector has a second argument (`, view`, `, cont.view` or any `",` / `',`), contains `(`, `html` or `body`, or is an HTML string (`"<...`, `...>"`); the rest of the line contains `view)`; or the call is followed by `.cont(`, `.comm(`, `.select(`, `.form(`, `.list(`, `.grid(`, `.pagination(`, `.tree(` or `.instance(`. A concatenated selector (`"#a" + id`) without `, view` overrides the selector exclusions and is reported unless a method exclusion applies. |
| `UseTheComponentsValMethod` | Major | `N(...).val(x)` or `$(...).val(x)` with an argument: setting an input value with jQuery bypasses the bound component data. Use the component's `val` (`form.val("col", v)`, `grid.val(row, "col", v)`). | The `val()` call has no argument (a getter). |

# Pitfalls

The settings are nested under `inspection`; the legacy guide put them directly under `code`, where `test()` does not find them and throws.

```js
// Wrong (legacy): N.context.attr("code", { abortOnError: false, excludes: [], message: { /* ... */ } });
N.context.attr("code", { inspection: { abortOnError: false, excludes: [], message: { /* ko_KR, en_US ... */ } } });
```

- Nothing runs automatically. Loading `natural.js+code` only defines `N.code`; call `test()` and `report.console()` yourself (see Examples).
- `natural.code.js` imports `N` and `NJS` from `natural.js.js` and sets `N.code` on load, so it must come after the core modules. See [Build and dist](../setup/build-and-dist.md).
- `import { NCD } from ".../natural.code.js"` fails because the module has no exports; use `N.code`.
- Line numbers count from the start of the HTML passed to `test()`, not from the start of the script.

# Known issues

* **Blocker and Critical findings are silent unless `abortOnError` is on** - Actual: their logger is `NC.error`, which only builds and returns an `Error` without writing to the console, so `report.console` prints nothing for `NoContextSpecifiedInSelector`. Likely intent: log with `console.error`. Workaround: set `abortOnError: true` during development, or print the array returned by `test()` yourself.[^nc-error]
* **Only the first script block is inspected** - Actual: rules compare matches with `codes.substring(codes.indexOf("<script"), codes.indexOf("</script>"))`, so findings in later `<script>` blocks are dropped. Likely intent: inspect every script block. Workaround: keep one `<script>` block per view.[^inspection]
* **`addSourceURL` can corrupt HTML** - Actual: when no `</script>` is preceded by a newline, tab or space, `cutIndex` is `-1` and the comment is inserted before the last character of the whole document. Likely intent: insert before the last `</script>` in any case. Workaround: put `</script>` on its own line.[^source-url]
* **TypeScript declares no `severityLevels`** - Actual: the `NCD` declaration lists only `inspection` and `addSourceURL`. Likely intent: declare the frozen level table. Workaround: cast `N.code` to `any` to read it. See [TypeScript](../setup/typescript.md).[^severity]

# Examples

Inspect every loaded view with a communication `success` filter declared in the `architecture` block of `natural.config.js` (filters are indexed once, when the first `N.comm` is created). For view loads `NA.comm.submit` sets `request.options.dataType` to `"html"`, and a value returned by a success filter replaces the response data before it is inserted:[^comm-submit]

```js
N.context.attr("architecture", {
    "page" : { "context" : "body" },
    "cont" : {},
    "comm" : {
        "filters" : {
            "codeInspection" : {
                success : function(request, data, textStatus, xhr) {
                    if (N.code !== undefined && request.options.dataType === "html" && typeof data === "string") {
                        N.code.inspection.report.console(N.code.inspection.test(data), request.options.url);
                        return N.code.addSourceURL(data, request.options.url);
                    }
                }
            }
        },
        "request" : { "options" : { /* shipped request defaults */ } }
    }
});
```

Run one rule on a string and read the findings directly:

```js
const findings = N.code.inspection.test(html, ["UseTheComponentsValMethod"]);
if (findings) {
    findings.forEach(function (f) { console.warn(f.level, f.line, f.code, f.message); });
}
```

# Related

- [Communication filter](../architecture/communication-filter.md) - the `success` filter used to hook inspection into view loading.
- [Controller](../architecture/controller.md) - why selectors must be scoped to `view`.
- [N.form](../ui/form.md) - the component `val` methods recommended by `UseTheComponentsValMethod`.
- [Configuration](../setup/configuration.md) - the `N.context.attr("code").inspection` block.
- [Build and dist](../setup/build-and-dist.md) - bundles that include Natural-CODE.

[^inspection]: NCD.inspection (test, rules, report.console)
[^severity]: NCD.severityLevels
[^source-url]: NCD.addSourceURL
[^nc-error]: NC.error (builds an Error without logging)
[^comm-submit]: NA.comm.submit (runs success filters on loaded view HTML)
