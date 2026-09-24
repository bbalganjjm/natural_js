---
type: Playbook
title: Repository workflow
description: How agents work in this repository and keep the docs/ bundle current, llm-wiki style - query before coding, ingest every code change, lint before finishing.
tags: [meta, governance, llm-wiki]
sources:
  - id: llm-wiki
    resource: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
    title: LLM Wiki pattern (Andrej Karpathy)
  - id: okf-spec
    resource: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md
    title: Open Knowledge Format (OKF) v0.2 specification
  - id: checker
    resource: ../../tools/knowledge-docs/knowledge-docs.mjs
    title: knowledge-docs checker and stamper
    git_blob: 35ca43e9625fb9809c42e7246ecfd43be1a45a98
generated: { by: codex/gpt-6-sol, at: 2026-09-24T05:37:38Z }
---

This is the working contract for agents in the Natural-JS repository. It applies the LLM wiki pattern[^llm-wiki] to an OKF v0.2 bundle[^okf-spec]: the code is the raw source, `docs/` is the wiki that agents write and keep current, and this page plus the repository's agent instructions are the schema. "Automatic" upkeep means the agent does it without being asked, inside the scope of the approved task; there are no hooks or CI jobs.

# Scope

## Layers

| Layer | Paths | Who changes it |
|---|---|---|
| Raw sources (truth) | `src/*.js`, `@types/*.d.ts`, `css/*.css`, `dist/natural.config.js`, `compiler/*.sh`, `package.json` | Developers and agents, for approved code tasks only |
| Wiki | `docs/` (OKF bundle; format in [OKF conventions](okf-conventions.md)) | Agents, as part of every task that changes the raw layer |
| Schema | This page, [OKF conventions](okf-conventions.md), the repository's agent instruction file | Changed only when the user asks |

## Precedence

- Instructions and contracts: user request, then the nearest agent instruction file, then these governance pages, then code and tests.
- Facts about how Natural-JS behaves: the code wins. When a concept disagrees with the code, fix the concept.

# Rules

- **R1 Code is truth.** Every option, default, signature, argument order, return value, event argument and config key written in `docs/` must match `src/`. If the code looks buggy, document what it does today under `# Known issues` and propose the code fix separately; do not change code from a docs task.
- **R2 Same-task upkeep.** A task that changes a raw-layer file also updates every affected concept, the folder `index.md` descriptions and `docs/log.md` in the same task, then re-stamps the touched concepts. This is part of the approved scope; it needs no extra approval.
- **R3 Propose first.** Filing a chat answer back as a new concept, fixing drift unrelated to the current task, or restructuring the bundle changes files outside the task scope: propose it and wait for approval.
- **R4 Honest trust fields.** `stamp` only concepts whose content you actually compared with the current code. Add `verified` only after an independent check (a separate agent instance or a person). Never write a `human:` actor; people record their own reviews.
- **R5 English, AI-first.** Concepts are written in English for AI agents first: exact signatures, tables, pitfalls, relative links, symbols instead of line numbers.
- **R6 No silent gaps.** Knowledge you could not verify is removed and logged as `**Gap**` in `docs/log.md`, or recorded in the active plan.

# Procedures

## Before work

1. Read [docs/index.md](../index.md) and the folder index for the area you will touch.
2. Read the concepts in scope and, if an implementation is in progress, [the active plan](../implementation/current.md) (checkpoint, steps, next action, verification log).

## Query

Use this when writing Natural-JS code or answering a question about it.

1. Start at [docs/index.md](../index.md), open the folder `index.md`, then the concept. Titles of API and component pages are the public symbols (`N.grid`, `N.comm`), and `symbols` in frontmatter lists every name worth grepping.
2. Check the concept's `# Pitfalls` and `# Known issues` before copying an example.
3. When the answer matters, confirm it in the code named by the concept's `sources` (`symbol` points at the exact class or method).
4. If you discover something reusable that the bundle lacks (a comparison, a recipe, a pitfall), propose adding it (R3).

## Ingest

Use this whenever a raw-layer file changes (a code change, a new public API, a config default change).

1. Make the code change.
2. Run `npm run docs:check -- --changed`. Every concept whose `sources` point at the changed code shows up as `drift` or `unstamped` errors, grouped per source in the summary.
3. For each flagged concept, read the code diff (`git diff -- <file>`; the drift message also prints a `git log --find-object=<blob>` hint to find the version the concept was written against) and update the text: options, defaults, signatures, examples, Pitfalls, Known issues.
4. A new public class or namespace (reported as `uncovered-symbol`) gets a new concept with `status: draft`, listed in its folder `index.md`.
5. Update the folder `index.md` entry if a `description` changed, and add a dated entry to `docs/log.md` (`**Update**`, `**Correction**`, `**Creation**`, `**Deprecation**`).
6. Stamp: `npm run docs:stamp -- <concept...> --by <producer>/<version>` for concepts whose content changed; `npm run docs:stamp -- <concept...>` (no `--by`) for concepts you reviewed and found still correct.
7. Run `npm run docs:check -- --changed` again until it reports 0 errors.

## Lint

Run the full check (`npm run docs:check`) at the end of every task that touched `docs/` or the raw layer, and periodically as a health check.

| Finding | Action |
|---|---|
| `drift` | Re-read the code, update the concept, re-stamp (Ingest steps 3-6). |
| `unstamped` | Compare the concept with the code, then stamp. |
| `uncovered-symbol` | Write a draft concept for the new public API. |
| `index-gap`, `index-desc` | Add the concept to its folder `index.md` or copy its `description` verbatim. |
| `orphan` | Link the concept from a related concept's `# Related` section. |
| `verified-stale` | The content changed after verification; ask for or run an independent check, then `stamp --verified-by`. |
| `log-gap` | Add the missing dated entry to `docs/log.md`. |
| Contradictions between concepts | Resolve against the code; fix every concept involved. |

Warnings you cannot resolve in the current task go into [the active plan](../implementation/current.md) under open questions.

# Checks

Completion checklist for any task that changed code or docs:

- [ ] `npm run docs:check -- --changed` reports 0 errors.
- [ ] Every changed concept was compared with the code and re-stamped; `generated` updated where content changed.
- [ ] `docs/log.md` has a dated entry for the change; folder `index.md` descriptions match.
- [ ] Suspected code bugs are recorded under `# Known issues`, not silently fixed.
- [ ] The active plan is updated (or trimmed to "no active plan" when the work is finished).

# Exceptions

- Pure formatting of a concept (typos, wording) needs no stamp; it keeps its fingerprints.
- Files outside `docs/` that are not raw-layer files (for example README.md) are not tracked by the checker.
- The legacy guides removed on 2026-09-24 remain available at commit `8877a4a49c2363a3358cb266bd798cb698283412` and are cited as `legacy` sources by the concepts that replaced them.

[^llm-wiki]: LLM Wiki pattern (Andrej Karpathy)
[^okf-spec]: Open Knowledge Format (OKF) v0.2 specification
