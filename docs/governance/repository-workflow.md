---
type: Playbook
title: Repository workflow
description: How agents answer from scoped evidence, keep the docs/ bundle current, and check documentation changes.
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
    git_blob: 6e58994a0f2fe00466fb67c1f047036e8f150e6a
generated: { by: codex/gpt-6, at: 2026-10-31T08:36:34Z }
---

This is the working contract for agents in the Natural-JS repository. It applies the LLM wiki pattern[^llm-wiki] to an OKF v0.2 bundle[^okf-spec]: the root 2.0 code is the raw source, `docs/` is the active wiki that agents write and keep current, and this page plus the repository's agent instructions are the schema. It also defines how agents answer questions from evidence. "Automatic" upkeep means the agent does it without being asked, inside the scope of the approved task; there are no hooks or CI jobs.

# Scope

## Layers

| Layer | Paths | Who changes it |
|---|---|---|
| Preserved 1.x reference | `v1/src/*.js`, `v1/@types/*.d.ts`, `v1/css/*.css`, `v1/dist/natural.config.js`, `v1/compiler/*.sh`, `v1/package.json`, `v1/docs/` | Historical LGPL-2.1 source and usage docs; change only in separately approved 1.x work |
| 2.0 raw sources (truth for 2.0) | `src/**/*.ts`, root `package.json`, root `tsconfig.json` | Developers and agents, for approved 2.0 milestones only |
| Generated 2.0 package | `build/**/*.js`, `build/**/*.d.ts` | Build output; compare exports to the TS source, never edit by hand |
| Wiki | `docs/` (OKF bundle; format in [OKF conventions](okf-conventions.md)) | Agents, as part of every task that changes the raw layer |
| Schema | This page, [OKF conventions](okf-conventions.md), the repository's agent instruction file | Changed only when the user asks |

## Precedence

- Instructions and contracts: user request, then the nearest agent instruction file, then these governance pages, then code and tests.
- Facts about how Natural-JS behaves: the code wins. When a concept disagrees with the code, fix the concept.

# Rules

- **R1 Code is truth.** An implemented 2.0 claim must match root `src/`; a historical 1.x claim must match `v1/src/`. Milestone contract pages mark future behavior as a draft until code exists. If the code looks buggy, document what it does today under `# Known issues` and propose the code fix separately; do not change code from a docs task.
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

Use this for Natural-JS questions, claim checks, comparisons and code work. Apply R1 to 2.0 and preserved 1.x claims, and stay within the user's permitted sources and requested scope.

1. Identify the target, each requested item or list member, applicability and exclusions, comparison basis, numbers and units, as-of date, and whether each claim or decision is final. Keep the user's terms and distinguish the requested facts from assumptions.
2. Start at [docs/index.md](../index.md), choose the topic in its folder `index.md`, then read the relevant concept sections and their scope, conditions, exclusions and confirmation state; check `# Pitfalls` and `# Known issues` where applicable. Follow `sources` to the corresponding code or evidence sections; `symbols` identify public exports and their source declarations. For 1.x, start at [the preserved index](../../v1/docs/index.md). Reuse paths, instructions and evidence already read for this request, and reopen only a missing or changed source passage. Search results, indexes and prior answers locate material but do not prove a claim; if output is truncated, read the missing range directly.
3. For each requested item, pair the directly read source and section with a checked or unchecked state. Check the same criteria separately for each comparison target. When combining documents, distinguish each source's facts from the relationship or conclusion inferred from them. Keep confirmed findings even if another item is unchecked, and name the gap.
4. Judge each claim together with all its conditions:

   | Verdict | Use when |
   |---|---|
   | `일치` (match) | Directly read evidence supports every asserted element and condition. |
   | `불일치` (mismatch) | Directly read evidence contradicts an asserted element or condition; identify it. |
   | `확인 필요` (needs verification) | Evidence is incomplete or conflicting without resolution, or the decision or status is not final. |
   | `확인할 수 없습니다` (cannot verify) | Required information is absent from permitted sources; state what is missing. |

   A concept's `status: draft` describes the document, not whether an operational decision has been approved. For evaluation questions, preserve fixed answer criteria, prior results and allowed evidence boundaries in their owning evaluation records. Distinguish automated scoring from semantic accuracy. Do not copy answer keys or past answers into operational concepts or example answers. Do not run response-generation tests or performance evaluations or make model calls without a separate request; do not invent unmeasured models, settings, scores or improvements.
5. Answer the requested result first and connect each claim to its actual source. Quote only an exact, directly read span from one source, preserving scope, exclusions and role boundaries. Do not join fragments into one purported quote or copy a whole document instead of identifying sufficient evidence. For a calculation, show each original value, its unit and source, plus the formula; do not fill missing inputs by assumption.
6. Before sending, check the requested items, conditions and states, claim-to-source links, quotes, verdicts, uncertainty and calculations. Re-read only evidence needed for a missing item or unresolved contradiction; do not repeat a completed check without a reason.
7. If new evidence or a correction changes reusable knowledge within the approved scope, update the affected concept, its sources and links, the relevant index descriptions and `docs/log.md` through Ingest. An answer is not a factual source. Propose unrelated additions or drift fixes before editing them (R3).

## Ingest

Use this whenever a raw-layer file changes (a code change, a new public API, a config default change).

1. Make the code change.
2. Run `npm run docs:check -- --changed`. Every concept whose `sources` point at the changed code shows up as `drift` or `unstamped` errors, grouped per source in the summary.
3. For each flagged concept, read the code diff (`git diff -- <file>`; the drift message also prints a `git log --find-object=<blob>` hint to find the version the concept was written against) and update the text: options, defaults, signatures, examples, Pitfalls, Known issues.
4. A new 2.0 named export (reported as `uncovered-symbol`) gets a new `status: draft` concept or explicit coverage in an existing entry-point concept, listed in its folder `index.md`. The 2.0 entry files are `src/index.ts` and `src/{page,data,ui,comm}/index.ts`; their names come from root `package.json` exports.
5. Update the folder `index.md` entry if a `description` changed, and add a dated entry to `docs/log.md` (`**Update**`, `**Correction**`, `**Creation**`, `**Deprecation**`).
6. Stamp: `npm run docs:stamp -- <concept...> --by <producer>/<version>` for concepts whose content changed; `npm run docs:stamp -- <concept...>` (no `--by`) for concepts you reviewed and found still correct.
7. Run `npm run docs:check -- --changed` again until it reports 0 errors. When a 2.0 build exists, the checker also compares each entry's named TS exports with its generated `.d.ts`; build and installed-consumer checks remain responsible for actual package usability.

## Lint

Run the full check (`npm run docs:check`) at the end of every task that touched `docs/` or the raw layer, and periodically as a health check.

| Finding | Action |
|---|---|
| `drift` | Re-read the code, update the concept, re-stamp (Ingest steps 3-6). |
| `unstamped` | Compare the concept with the code, then stamp. |
| `uncovered-symbol` | Cover the named public export in a draft concept; a changed 2.0 entry makes this an error. |
| `declaration-mismatch`, `declaration-export`, `runtime-export`, `entry-source-missing`, `export-star`, `export-default` | Check the 2.0 package entry map and generated declaration against explicit TS exports. |
| `index-gap`, `index-desc` | Add the concept to its folder `index.md` or copy its `description` verbatim. |
| `orphan` | Link the concept from a related concept's `# Related` section. |
| `verified-stale` | The content changed after verification; ask for or run an independent check, then `stamp --verified-by`. |
| `log-gap` | Add the missing dated entry to `docs/log.md`. |
| Contradictions between concepts | Resolve against the code; fix every concept involved. |

Warnings you cannot resolve in the current task go into [the active plan](../implementation/current.md) under open questions.

# Checks

Completion checklist for any task that changed code or docs:

- [ ] `npm run docs:check -- --changed` reports 0 errors; `node --test tools/knowledge-docs/knowledge-docs.test.mjs` passes when the checker itself changes.
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
