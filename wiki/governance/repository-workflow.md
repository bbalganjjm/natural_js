---
type: Playbook
title: Repository workflow
description: How agents answer from scoped evidence, keep the wiki/ knowledge bundle current, and separate it from docs/ work records.
tags: [meta, governance, llm-wiki]
sources:
  - id: llm-wiki
    resource: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
    title: LLM Wiki pattern (Andrej Karpathy)
  - id: okf-spec
    resource: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md
    title: Open Knowledge Format (OKF) v0.2 specification
  - id: openwiki
    resource: https://github.com/langchain-ai/openwiki/blob/main/README.md
    title: OpenWiki source-grounded incremental maintenance
  - id: openwiki-retrieval
    resource: https://github.com/langchain-ai/openwiki/blob/main/AGENTS.md
    title: OpenWiki selective retrieval and authoritative evidence
  - id: context7
    resource: https://context7.com/langchain-ai/openwiki
    title: Context7 OpenWiki documentation lookup
  - id: checker
    resource: ../../tools/knowledge-docs/knowledge-docs.mjs
    title: knowledge-docs checker and stamper
    git_blob: 2752950e806b769b507b3f3e99b4a8a5c2674594
generated: { by: codex/gpt-6, at: 2026-11-15T01:13:51Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-15T01:13:51Z }
---

This is the working contract for agents maintaining Natural-JS. The LLM wiki pattern separates source evidence, durable knowledge in `wiki/`, and operating rules; `docs/` contains work plans, reviews, execution records and raw artifacts.[^llm-wiki][^okf-spec] Same-task upkeep is performed by the agent inside the approved scope, without an OpenWiki installation, model service, scheduler or automatic CI job.

# Scope

## Layers

| Layer | Paths | Who changes it |
|---|---|---|
| Preserved 1.x reference | `v1/src/*.js`, `v1/@types/*.d.ts`, `v1/css/*.css`, `v1/dist/natural.config.js`, `v1/compiler/*.sh`, `v1/package.json`, `v1/docs/` | Historical LGPL-2.1 source and usage docs; change only in separately approved 1.x work |
| 2.0 raw sources (truth for 2.0) | `src/**/*.ts`, root `package.json`, root `tsconfig.json` | Developers and agents, for approved migration, maintenance and extension tasks |
| Generated 2.0 package | `build/**/*.js`, `build/**/*.d.ts` | Build output; compare exports to the TS source, never edit by hand |
| Knowledge | `wiki/` (OKF bundle; format in [OKF conventions](okf-conventions.md)) | Agents integrate lasting, source-backed contracts and findings into existing topics |
| Work records | `docs/implementation/`, `docs/log.md` | Agents record bounded plans, checkpoints, reviews, attempts and raw evidence; link lasting knowledge instead of duplicating it |
| Schema | This page, [OKF conventions](okf-conventions.md), the repository's agent instruction file | Changed only when the user asks |

## Reference choices

Karpathy provides the source/knowledge/schema separation and ingest/query/lint cycle. Apply it to approved code changes and source-backed findings; frozen evidence remains immutable, while live source is still changed by development tasks.[^llm-wiki]

Context7 research of LangChain OpenWiki supports evidence-linked facts, targeted refresh of changed claims, explicit revision/removal of stale claims and retaining unchanged content. We use existing `sources`, fingerprints and independent review rather than adding its Claims sidecar or runtime.[^openwiki][^context7]

Use a small goal/index route and read only the relevant sections and source. Do not preload the wiki. Source and tests determine behavior; an unknown or review question is a verification gap, not an automatic new requirement.[^openwiki-retrieval]

## Precedence

- Instructions and contracts: user request, then the nearest agent instruction file, then these governance pages, then code and tests.
- Facts about how Natural-JS behaves: the code wins. When a concept disagrees with the code, fix the concept.

# Rules

- **R1 Code is truth.** An implemented 2.0 claim must match root `src/`; a historical 1.x claim must match `v1/src/`. Milestone contract pages mark future behavior as a draft until code exists. If the code looks buggy, document what it does today under `# Known issues` and propose the code fix separately; do not change code from a docs task.
- **R2 Same-task upkeep.** A task that changes a raw-layer file also updates every affected concept, the folder `index.md` descriptions and `wiki/log.md` in the same task, then re-stamps the touched concepts. This is part of the approved scope; it needs no extra approval.
- **R3 Keep scope.** Integrate reusable, source-backed findings from the approved task into the relevant wiki topic. A chat answer alone is not evidence. Unrelated drift repair, new out-of-scope topics or bundle restructuring require a proposal and user approval before editing.
- **R4 Honest trust fields.** `stamp` only concepts whose content you actually compared with the current code. Add `verified` only after an independent check (a separate agent instance or a person). Never write a `human:` actor; people record their own reviews.
- **R5 English, AI-first.** Concepts are written in English for AI agents first: exact signatures, tables, pitfalls, relative links, symbols instead of line numbers.
- **R6 No silent gaps.** Knowledge you could not verify is removed and logged as `**Gap**` in `wiki/log.md`, or recorded in the active plan.

# Procedures

## Before work

1. Read [project goals](../project-goals.md) and the relevant entry in [wiki/index.md](../index.md), then the in-scope concept sections and sources. Do not enumerate the entire wiki or historical log.
2. During v2 migration, read [the active plan](../../docs/implementation/current.md) and its owning-stage contract. After migration, use a bounded plan for the requested change; completed milestones remain historical records.
3. State which project outcome the change serves: required feature behavior, agent-readable maintenance or evidence-based simplification. Define acceptance before implementing.

## Query

Use this for Natural-JS questions, claim checks, comparisons and code work. Apply R1 to 2.0 and preserved 1.x claims, and stay within the user's permitted sources and requested scope.

1. Identify the target, each requested item or list member, applicability and exclusions, comparison basis, numbers and units, as-of date, and whether each claim or decision is final. Keep the user's terms and distinguish the requested facts from assumptions.
2. Start at [wiki/index.md](../index.md), choose the relevant topic, then read its scope, conditions, exclusions and confirmation state; check `# Pitfalls` and `# Known issues` where applicable. Follow `sources` to the corresponding code or evidence; `symbols` identify public exports and declarations. For 1.x, start at [the preserved index](../../v1/docs/index.md). Reuse evidence already read for this request and reopen only a missing or changed passage. Search results, indexes and prior answers locate material but do not prove a claim; if output is truncated, read the missing range directly.
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
7. If new evidence or a correction changes reusable knowledge within the approved scope, update the affected concept, its sources and links, the relevant index descriptions and `wiki/log.md` through Ingest. An answer is not a factual source. Propose unrelated additions or drift fixes before editing them (R3).

## Ingest

Use this whenever a raw-layer file changes (a code change, a new public API, a config default change).

1. Make the code change.
2. Run `npm run docs:check -- --changed`. Every concept whose `sources` point at the changed code shows up as `drift` or `unstamped` errors, grouped per source in the summary.
3. For each flagged concept, read the code diff (`git diff -- <file>`; the drift message also prints a `git log --find-object=<blob>` hint to find the version the concept was written against) and update the text: options, defaults, signatures, examples, Pitfalls, Known issues.
4. A new 2.0 named export (reported as `uncovered-symbol`) gets a `status: draft` concept in `wiki/` or explicit coverage in an existing wiki entry-point concept; a work plan cannot establish implementation coverage. It is listed in its folder `index.md`. The 2.0 entry files are `src/index.ts` and `src/{page,data,ui,comm}/index.ts`; their names come from root `package.json` exports.
5. Put lasting API, ownership, decision rationale and pitfalls in `wiki/`; retain the stage plan, review report, attempts and raw results in `docs/`. Update the folder `index.md` entry if a `description` changed, and add a dated entry to `wiki/log.md` (`**Update**`, `**Correction**`, `**Creation**`, `**Deprecation**`).
6. Stamp: `npm run docs:stamp -- <concept...> --by <producer>/<version>` for concepts whose content changed; `npm run docs:stamp -- <concept...>` (no `--by`) for concepts you reviewed and found still correct.
7. Run `npm run docs:check -- --changed` again until it reports 0 errors. When a 2.0 build exists, the checker also compares each entry's named TS exports with its generated `.d.ts`; build and installed-consumer checks remain responsible for actual package usability.

## Lint

Run the full check (`npm run docs:check`) at the end of every task that touched `wiki/`, `docs/` or the raw layer, and periodically as a health check.

| Finding | Action |
|---|---|
| `drift` | Re-read the code, update the concept, re-stamp (Ingest steps 3-6). |
| `unstamped` | Compare the concept with the code, then stamp. |
| `uncovered-symbol` | Cover the named public export in a draft concept; a changed 2.0 entry makes this an error. |
| `declaration-mismatch`, `declaration-export`, `runtime-export`, `entry-source-missing`, `export-star`, `export-default` | Check the 2.0 package entry map and generated declaration against explicit TS exports. |
| `index-gap`, `index-desc` | Add the concept to its folder `index.md` or copy its `description` verbatim. |
| `knowledge-location`, `work-location` | Move reusable API/component/architecture knowledge to wiki/, or a work plan to docs/, and update its references. |
| `orphan` | Link the concept from a related concept's `# Related` section. |
| `verified-stale` | The content changed after verification; ask for or run an independent check, then `stamp --verified-by`. |
| `log-gap` | Add the missing dated entry to the owning root's log: wiki/log.md for knowledge, docs/log.md for work. |
| Contradictions between concepts | Resolve against the code; fix every concept involved. |

Warnings you cannot resolve in the current task go into [the active plan](../../docs/implementation/current.md) under open questions.

# Checks

Completion checklist for any task that changed code or docs:

- [ ] `npm run docs:check -- --changed` reports 0 errors; `node --test tools/knowledge-docs/knowledge-docs.test.mjs` passes when the checker itself changes.
- [ ] Every changed concept was compared with the code and re-stamped; `generated` updated where content changed.
- [ ] Knowledge changes are in `wiki/` and `wiki/log.md`; dated execution/review records remain in `docs/`. Folder index descriptions match.
- [ ] Suspected code bugs are recorded under `# Known issues`, not silently fixed.
- [ ] The active plan is updated (or trimmed to "no active plan" when the work is finished).

# Exceptions

- Pure formatting of a concept (typos, wording) needs no stamp; it keeps its fingerprints.
- Files outside `wiki/` and `docs/` that are not raw-layer files (for example README.md) are not tracked by the checker.
- The legacy guides removed on 2026-09-24 remain available at commit `8877a4a49c2363a3358cb266bd798cb698283412` and are cited as `legacy` sources by the concepts that replaced them.

[^llm-wiki]: LLM Wiki pattern (Andrej Karpathy)
[^okf-spec]: Open Knowledge Format (OKF) v0.2 specification

[^openwiki]: OpenWiki source-grounded incremental maintenance
[^openwiki-retrieval]: OpenWiki selective retrieval and authoritative evidence
[^context7]: Context7 OpenWiki documentation lookup
