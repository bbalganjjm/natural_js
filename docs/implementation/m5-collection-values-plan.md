---
type: Plan
title: Natural-JS 2.0 M5.10 shared field value callbacks
description: Project mounted Form, Grid and List values through one callback contract without changing raw data ownership.
tags: [meta, plan, binding, migration]
status: draft
sources:
  - id: previous
    resource: m5-form-presets-plan.md
    title: Explicit typed presets and application callback composition
    git_blob: ec52b1ca3073bb5e8fd0219254311bec9758224d
  - id: baseline
    resource: evidence/m59-verification.json
    title: Frozen 5ecda44 source, runtime and installed artifact baseline
    git_blob: 72b9c20a87803abe9f3d0c112810945050c00380
  - id: form
    resource: ../../src/ui/form.ts
    title: Existing guarded Form projection and raw input ownership
    git_blob: dade5db6e1bb7b3c37528034526150d73ce956a6
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid field caches, native editing and mounted row lifecycle
    git_blob: da177986f02bbfc5df160a10fda6ad88c9e253c1
  - id: list
    resource: ../../src/ui/list.ts
    title: Read-only List caches, choices and validation
    git_blob: 35b8bfff7026d894082cd9471326728182066937
  - id: ui
    resource: ../../src/ui/index.ts
    title: Public value context and component handles
    git_blob: b03e5d6328d64698689621724492dc4e66292737
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Embedded row Forms, global lookup and mounted value updates
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: declarations
    resource: ../../v1/@types/natural.ui.misc.d.ts
    title: Explicit Form, Grid and List value-hook contract
    git_blob: 9438abbb11e769c1a4776b7e92d0ae434159588a
  - id: parity
    resource: feature-parity-plan.md
    title: All retained behavior and consolidated omission obligations
    git_blob: b4e1f12791271f8a10702a533ab8c96871ea303a
generated: { by: codex/gpt-6, at: 2026-11-08T08:49:36Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-08T08:49:36Z }
---

# Goal

Restore the supported shared field-value callback outcome for rendered Grid/List rows. Reuse Form's checked invocation and native replacement logic, with each binder retaining its compiled fields, raw Rows, validation, cache and lifetime owners. Applications pass settings and live-policy forwarding functions explicitly; add no global registry, implicit inheritance, deep merge or callback-layer engine.[^form][^grid][^list][^legacy][^declarations]

# Checkpoint

- M5.10 starts at pushed 5ecda443abbe2f9c41a7a23b672507e4a82ed59b with a clean worktree; independent read-only M5.9 recovery and bounded pre-source contract review pass.[^baseline]
- One private owner shares checked native replacements and before-write-after execution. Grid/List add the two value functions, List gains refresh, and ValueBindContext replaces the old name without an alias. Component-local raw, validation, cache, focus and lifetime ownership remain. [Shared value callbacks](../v2/value-callbacks.md) owns the API.[^form][^grid][^list][^ui]
- The real Grid demo and exact installed JS/TS/browser consumers exercise one explicit policy across three owners. Connected source/caller/test review, fresh canonical gates and independent raw/document reviews accept only these selected outcomes; broader source/default/declaration and complete parity remain required.[^parity]

# Steps

1. Independently review the bounded contract before source edits. Rename the existing public FormValueContext to ValueBindContext with the same RuleContext fields, nonnull RowId, primary HTMLElement and bind/val phase. Remove the old name without an alias; update actual imports, installed consumers and current API/migration documents. Historical milestone bodies retain their dated names.
2. Add only beforeBindValue/onBindValue to Grid and List with the same unknown-returning function signatures as Form. Add ListHandle.refresh(): void for deliberate re-projection without Rows writes, selection loss or disposal. Do not pass FormOptions, whole Form observers, creation defaults or row stores implicitly between binders.
3. Extract Form's actual callback invocation, synchronous-result handling, error construction and scalar/array/native/choice replacement validation into one private value-binding.ts owner. Capture function references, call them plainly, retain Form's error details/causes and stale/disposed thenable draining. Grid/List use their own VALUE_OPTIONS/VALUE codes with the same field/row/phase/callback details. Constructor rejection precedes DOM/Select/ARIA ownership. Add no public helper, dependency or entry.
4. Preserve each binder's existing raw validation, parser, draft, formatter/render writer, option occurrence and change-marker owners. Before receives source raw, its effective result reaches the ordinary writer, then after observes the written value and can replace it once. Undefined preserves; false/null/zero/empty text are values. Context values and source/original/save JSON stay raw. Native replacement shape and available typed occurrences remain checked.
5. Keep Form's projection cache and lifetime behavior. Add per-bound-field caches to Grid/List only when hooks are configured: bind on creation/remount/explicit refresh, val on a retained committed raw change. Cache unchanged successful projections; suppress callbacks for drafts; retry failures on raw change or explicit refresh. Recheck cached choice availability when option sources change. Retained offscreen List records are not imaginary mounted elements; a later show is a binding operation.
6. Extend Grid's opt-in source/layout checkpoints and add opt-in List generation/reentry checks around callback work and final placement. Source replacement, nested work and disposal must stop stale framework writes. A composed application function remains one callback unit. Promise/thenable rejection is drained; callback failure retains useful causes, releases failed construction ownership and permits retry. No-hook operation retains the existing fast path without per-field contexts or DOM rediscovery.
7. Editable Grid text reveals committed raw on focus and restores cached projection on blur; invalid drafts stay entered raw. Projection must not commit a display replacement to Rows. Pure validation and detached/offscreen probes never execute value hooks. Optional invalid-row reveal can mount a real row and run its normal projection callbacks. Whole Form, Grid row/completion hooks and selection retain their current owners and ordering.
8. Reuse the existing active-to-Active/Inactive display callback in a real authored example and explicit application policy closure, targeting static spans while leaving native checkboxes intact. Demonstrate one callback contract across independent Form/Grid/List instances and deliberate refresh; do not create identity hooks or synthetic domain utilities.
9. Add fixed browser witnesses, strict installed TS type/old-name rejection checks, and exact-package JS/browser behavior. Cover replacements, formatting/native shapes/choices, raw validation/drafts, phases/cache/live policy, mounted/offscreen behavior, focus, errors/thenables/retry, reentry/disposal and shared ownership. Freeze runtime inputs, then run strict build/types/example types, units, complete Chromium/Firefox/WebKit, the same actual tar in JS/TS and five Windows browsers, original nine binding/twenty-one viewport budgets and changed/full OKF checks.
10. Independently review connected code/callers/tests, raw logs/archive/metrics and final semantic documents. Preserve every attempt, immutable parents and raw fixtures; add verified only after independent comparison. Keep active resume context short and preserve historical bodies/dates on fingerprint-only updates.

# Next action

Selected shared mounted-field value outcomes are accepted. Plan M5.11 against the remaining Form source/default/declaration outcomes, including local-source callbacks, per-unbound-key observation and existing row/completion callback capture and receiver contracts. Keep broader configuration equivalence, direct hot declarations and wider dynamic owners, List editing, Tree validation, unvalidated paste, general data/schema equivalence, other UI/CVC/P0 and M13 required. No omission or full-family closure is approved.

# Decisions

- Continued-work approval covers this stage. One existing context name is replaced, four constructor options and one List method are added, and one private shared owner is justified by three real binders. No compatibility alias or runtime registry.
- Live shared configuration is application-owned mutable policy read by stable forwarding functions. Value callback references stay captured; other component options retain their own contracts. Explicit refresh applies a changed policy to unchanged visible data; it does not mutate Rows.
- Preserve authored HTML/CSS, unique IDs, native accessibility, per-page CVC ownership and separate raw/display values. Root 2.0 remains Apache-2.0; v1/master and the ignored original lock remain unchanged.
- Serialize all browser/performance execution. Chromium, Firefox, WebKit and installed Chrome/Edge remain required; actual macOS/iOS Safari is excluded. No npm publication or release tag.
- No model calls, response evaluation or token-saving claim. Any context byte/line figure is a labeled proxy only.

# Verification log

Independent baseline/contract/source/caller/raw/document reviews pass. Fresh checks pass on 191 frozen inputs, 138 units and 793 full cases per engine, with 27 new browser cases and 0 new non-DOM units: strict build/source/example types, one actual 193-file tar in JS/TS and five Windows browsers, original 30 performance budgets and sixty recomputed medians. Sixteen canonical groups expand to 27 execution-stage commands and 13 Chromium collections. Latest complete 12-shard Chromium coverage has no retries/skips; Firefox/WebKit are unsharded. [The receipt](evidence/m510-verification.json) preserves all captured attempts, the initial two fixture-boundary failures, exact raw hashes and immutable parents. Correcting native change-event delivery and detached-clone test markup did not change framework source or weaken expected results. A separate earlier full Chromium attempt failed one module fetch before the test body; a later targeted diagnostic passed and recorded HTTP 200. Its trace does not capture the original failure or establish its cause. The incomplete attempt grants no full-suite credit; complete browser checks use unchanged runtime inputs. Changed/full OKF checks have zero errors/warnings; historical bodies/dates remain. No full-family/P0/M13 closure, omission, publication or tag.

# Open questions

Local-source callbacks, per-unbound-key observations, broader source/default/declaration equivalence, all remaining owner families/P0/M13 and consolidated omission decisions remain required. Manual assistive technology, personal acceptance and final fixed-agent/token comparison remain unverified.

[^previous]: Explicit typed presets and application callback composition
[^baseline]: Frozen 5ecda44 source, runtime and installed artifact baseline
[^form]: Existing guarded Form projection and raw input ownership
[^grid]: Grid field caches, native editing and mounted row lifecycle
[^list]: Read-only List caches, choices and validation
[^ui]: Public value context and component handles
[^legacy]: Embedded row Forms, global lookup and mounted value updates
[^declarations]: Explicit Form, Grid and List value-hook contract
[^parity]: All retained behavior and consolidated omission obligations
