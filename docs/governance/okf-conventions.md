---
type: Specification
title: OKF conventions for the Natural-JS bundle
description: Layout, frontmatter, per-type body templates, link rules and checker rules that every concept in docs/ follows.
tags: [meta, governance, okf]
sources:
  - id: okf-spec
    resource: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md
    title: Open Knowledge Format (OKF) v0.2 specification
  - id: llm-wiki
    resource: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
    title: LLM Wiki pattern (Andrej Karpathy)
  - id: checker
    resource: ../../tools/knowledge-docs/knowledge-docs.mjs
    title: knowledge-docs checker and stamper
    git_blob: 6e58994a0f2fe00466fb67c1f047036e8f150e6a
generated: { by: codex/gpt-6, at: 2026-10-31T08:36:34Z }
---

`docs/` is an OKF v0.2 knowledge bundle[^okf-spec] maintained as an LLM wiki[^llm-wiki]. The primary reader is an AI coding agent writing Natural-JS code, so every rule below favors fast, unambiguous lookup over prose. The query and maintenance procedures live in [Repository workflow](repository-workflow.md); this page defines the format.

# Bundle layout

```
docs/                     active 2.0 bundle root (index.md declares okf_version "0.2")
  index.md  log.md        reserved files (OKF §3.1)
  v2/                     implemented 2.0 package and draft API concepts
  governance/             this specification and the repository workflow
  implementation/         milestone plans, active checkpoint, and design contract

v1/docs/                  preserved 1.x usage bundle; reference only
```

- One active 2.0 concept per public object, component or task. File names are lowercase kebab-case (`framework-error.md`, `package.md`).
- `index.md` and `log.md` are reserved at every level and are never concepts.
- The bundle root is `docs/`, not the repository root, so README.md and AGENTS.md stay outside the bundle.

# Frontmatter

Keys appear in this order; omit keys that do not apply.

```yaml
---
type: API Reference
title: FrameworkError
description: Shared 2.0 error with a stable code, API name, message, cause, and optional detail.
tags: [core, error, typescript]
status: draft
symbols: [FrameworkError]
sources:
  - id: entry
    resource: ../../src/index.ts
    title: Public package entry
    git_blob: d99a783055cf6bea9b6e15ca591c370ff514cec9
  - id: error
    resource: ../../src/internal/framework-error.ts
    title: FrameworkError implementation
    git_blob: 6930da1fbcfd71733a45dab22a51aec784cafe7f
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:23:45Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T08:23:52Z }
---
```

| Key | Rule |
|---|---|
| `type` | Required (OKF). One of: `Overview`, `Guide`, `API Reference`, `UI Component`, `Architecture Pattern`, `Configuration`, `Example`, `Playbook`, `Specification`, `Plan`. |
| `title` | The primary public symbol for API Reference and UI Component pages (`FrameworkError`, `PageContext`); plain words otherwise. |
| `description` | One sentence stating what the thing is. Never "This page ...". Copied verbatim into the folder `index.md`. |
| `tags` | Lowercase kebab-case. First tag is the module facet: `core`, `architecture`, `data`, `ui`, `ui-shell`, `template`, `code`, `project`, `meta`. Then 1-4 topical tags. |
| `status` | `draft` for pages written from code without a legacy guide or not yet reviewed; `deprecated` for retired pages kept for links. Absent means `stable`. |
| `symbols` | Producer extension. Every identifier an agent might grep for, including public entry names and their source declarations. Required for API Reference and UI Component pages. |
| `sources` | Provenance (OKF §5.1). At least one entry. See below. |
| `generated` | `{ by, at }`. Written by `stamp --by`; `at` is the last meaningful content change. |
| `verified` | List of `{ by, at }`. Written by `stamp --verified-by` after an independent check against code. |

**YAML subset.** The checker parses a deliberately small subset: `key: value` scalars, single-line flow lists `[a, b]`, single-line flow maps `{ by: x, at: y }`, block lists (`  - item`, `  - { ... }`, or `  - key: value` followed by `    key: value` fields), and one level of nested map. No block scalars (`|`, `>`), anchors, tags, tabs or multi-line flow collections. Quote a scalar with `"..."` when it contains `: ` or ` #`. Timestamps are ISO 8601 datetimes with an explicit offset (`2026-09-24T03:00:00Z`).

# Sources and fingerprints

- `resource` is REQUIRED in every entry. Code sources use a path relative to the concept file (for example `../../src/internal/framework-error.ts` from `docs/v2/`); external material uses an absolute URL.
- Local sources carry fingerprints written by `stamp`, never by hand:
  - `git_blob`: SHA-1 of `"blob <n>\0"` + file content with CRLF normalized to LF. It equals `git hash-object <file>`, works before commit, and is identical on every OS.
  - `symbol` + `symbol_sha1`: narrows drift detection to one code unit. In 1.x JavaScript, `symbol` is a dotted class/member path such as `NU.grid` or `NU.grid.prototype.add`. In 2.0 TypeScript, it names a top-level exported declaration or explicit named re-export such as `FrameworkError` or `PageContext`. `symbol_sha1` is the first 12 hex chars of the SHA-1 of that slice. When `symbol` is set, drift is decided by `symbol_sha1` only.
- Prefer a `symbol` over a whole file for large sources such as archived `v1/src/natural.ui.js`; otherwise every edit to that file flags every page.
- Historical 1.x type and configuration sources remain under `v1/`, alongside [the preserved usage bundle](../../v1/docs/index.md). Active 2.0 concepts cite root `src/**/*.ts`, never generated `build/**/*.d.ts`; the checker compares emitted declaration names to TS entry names when build output exists.
- Preserved 1.x pages migrated from the legacy guides keep one `legacy` source pointing at the removed file at commit `8877a4a49c2363a3358cb266bd798cb698283412`. It has no fingerprint.
- Per-claim attribution uses footnotes keyed by `sources[].id` (`...defaults to true.[^ui]`). Put footnotes on corrected claims, defaults and Known issues; in tables, cite once per section, not per cell.

# Trust

- Actors follow OKF §7: `claude-code/claude-opus-5-5` (an agent), `process:<id>`, `human:<id>`.
- `generated.by` is whoever last wrote the content. `verified` is added only after a separate agent instance (or a person) checked the content against the code. The same actor string may appear in both; the tier is then machine-confirmed.
- Agents never write `human:` actors. `stamp` refuses them; a person records their own review by editing `verified`.

# Body

Global rules:

- No H1 title line in the body; the title lives in frontmatter. The body opens with a lead of at most three sentences: what it is and when to use it.
- Sections are `#` headings in the fixed order for the page type (table below). Omit empty sections; never reorder.
- Entries inside a section are `##` headings whose text is the signature in backticks, for example ``## `add([data][, row])` ``, so ``grep -n '^## `add(' docs/ui/grid.md`` jumps straight to it.
- Options and events are tables. Default values come from the code, never from memory or legacy docs. Use `—` in the Default column for required options.
- Fenced code blocks always carry a language tag (`js`, `html`, `json`, `ts`, `css`, `sh`).
- No manual table of contents, no emoji, no `<!-- filepath -->` comments, no images that do not exist in the repository.
- Refer to code by symbol (`NU.grid.prototype.add`, `NC.element.toOpts`), never by line number.
- Keep definitions, lists, roles, applicability, exclusions and confirmation state in the same section or directly linked sections. Put shared scope in the lead, item-specific state beside the item, and link the evidence page while naming its relevant section or symbol.

| Type | Section order |
|---|---|
| UI Component | Quick start · Constructor · Options · Declarative options · Methods · Events · Global configuration · Behavior · Pitfalls · Known issues · Examples · Related |
| API Reference | Summary · Constructor · Options · Functions (or Methods) · Rule catalog · Pitfalls · Known issues · Examples · Related |
| Architecture Pattern | Intent · Participants · Lifecycle · Rules · Pitfalls · Known issues · Related |
| Guide | Goal · Prerequisites · Steps · Verify · Pitfalls · Next |
| Example | Scenario · Components used · View · Controller · Server contract · How it works · Variations · Pitfalls · Known issues · Related |
| Configuration | Location and load order · Schema · Precedence · Examples · Pitfalls · Known issues · Related |
| Overview | What it is · Map · Key concepts · Where to go next |
| Playbook | Scope · Rules · Procedures · Checks · Exceptions |
| Plan | Goal · Checkpoint · Steps · Next action · Decisions · Verification log · Open questions |

`# Summary` in an API Reference page is a table `| Symbol | Signature | Returns |` covering every entry on the page. `# Events` rows list the handler signature and what `this` is bound to.

**Pitfalls** records correct-but-surprising behavior and legacy misconceptions. Models trained on the old guides repeat their mistakes, so wrong forms are kept, clearly marked, next to the right form:

```js
// Wrong (legacy): grid.add(0, row)
grid.add(row, 0); // NU.grid.prototype.add(data, row)
```

A wrong form may appear only on a line starting with `// Wrong (legacy):` inside `# Pitfalls`.

**Known issues** records code that looks like a bug. Document what the code does today, never the intended behavior as if it were real, and do not edit the code from a docs task:

```md
* **rrn always fails** - Actual: ... Likely intent: ... Workaround: ...[^data]
```

# Links

- Concept-to-concept links are relative (`../v2/package.md`, `architecture.md`). OKF allows both forms; bundle-absolute `/v2/package.md` breaks on GitHub, in IDEs and inside the npm package because the bundle root is `docs/`.
- State the relationship in prose: "Requires", "See also", "Superseded by".
- Avoid anchor links to method headings; link the page and name the method.
- Never link to or cite `AGENTS.md` from a concept (it may be absent from a clone). The live site bbalganjjm.github.io is not canonical; link bundle pages instead.

# index.md

- No frontmatter, except the bundle-root `index.md`, which carries only `okf_version: "0.2"` (OKF §8, §12).
- One or more `# Section` headings with entries `* [Title](file.md) - <description copied verbatim from the concept frontmatter>`. Draft pages add ` (draft)` after the description.
- Order: overview or pattern pages first, then alphabetical. Subdirectories are listed in a trailing section as `* [Name](sub/index.md) - <one line>`.
- Every concept appears in its own folder's `index.md`; it may also appear elsewhere (for example "Start here" in the root index).

# log.md

- One bundle-level `docs/log.md`, no frontmatter, `## YYYY-MM-DD` headings, newest first (OKF §9).
- Entries start with a bold verb: `**Creation**`, `**Update**`, `**Correction**` (a code-is-truth fix; one bullet per concept listing its fixes), `**Deprecation**`, `**Verification**`, `**Gap**` (missing knowledge or an unverifiable claim that was removed).
- Append new dates at the top; do not rewrite older sections.

# Checker

`node tools/knowledge-docs/knowledge-docs.mjs` (npm scripts `docs:check`, `docs:stamp`)[^checker]:

| Command | Purpose |
|---|---|
| `check [path...]` | Lint the whole bundle; `path` limits which findings are printed. |
| `check --changed` | Also run `git status`; drift or missing fingerprints on sources changed in the working tree become errors. Use it as the completion gate. |
| `stamp <path...>` | Refresh `git_blob`/`symbol_sha1` for every local source of the given concepts or folders. |
| `stamp <path...> --by <actor>` | Also set `generated: { by, at: now }` (use after changing content). |
| `stamp <path...> --verified-by <actor>` | Also add or refresh a `verified` entry (use after an independent check). Refuses `human:`. |

Exit codes: `0` no errors, `1` errors, `2` usage or internal error.

| Level | Rules |
|---|---|
| error | `frontmatter-missing`, `frontmatter-parse`, `type-missing`, `timestamp`, `status`, `generated`, `verified`, `source-resource`, `source-id-dup`, `source-missing`, `symbol-unresolved`, `link-broken`, `link-case`, `footnote-unknown`, `index-frontmatter`, `okf-version`, `log-format`, `entry-source-missing`, `export-star`, `export-default`, `declaration-export`, `runtime-export`, `declaration-mismatch` |
| warn | `drift`, `unstamped` (both errors under `--changed` for changed files), `index-missing`, `index-gap`, `index-desc`, `index-entry-format`, `title-missing`, `description-missing`, `actor`, `verified-stale`, `log-gap`, `log-entry-format`, `orphan`, `uncovered-symbol` |

`uncovered-symbol` lists every named TypeScript export from the 2.0 entry files selected by root `package.json` that no concept names in `symbols` or `sources[].symbol`. A changed 2.0 entry raises this to an error. The checker requires explicit named exports in those entry files, so `export *` and default exports are errors. TypeScript symbol slicing covers top-level exported declarations and explicit named re-exports; for other internal syntax, cite the whole source file. `docs:check` does not require a prior build, but compares names in generated `.d.ts` files when they are present.

# Reference concept

[FrameworkError](../v2/framework-error.md) is a current 2.0 API Reference example. The 1.x UI Component examples are preserved under [the 1.x UI index](../../v1/docs/ui/index.md).

[^okf-spec]: Open Knowledge Format (OKF) v0.2 specification
[^llm-wiki]: LLM Wiki pattern (Andrej Karpathy)
[^checker]: knowledge-docs checker and stamper
