---
type: Plan
title: Natural-JS 2.0 consolidated omission decision
description: Five explicitly approved legacy workflow omissions, with exact boundaries, alternatives, migration costs and retained obligations.
tags: [meta, plan, migration, parity]
status: draft
sources:
  - id: decision
    resource: evidence/m32-approved-omissions.json
    title: Explicit user approval of exactly O01-O05
    git_blob: bd15aa6337a470741434ce52358e611bd40704bd
  - id: proposal
    resource: evidence/p02-omission-proposal.json
    title: Exact five-item proposal, source hashes and undecided dispositions
    git_blob: 05cd816b7daa25c35d546c36f1482af42ef08b3b
  - id: core
    resource: evidence/v1-core-parity.json
    title: Original core retirement candidates and required outcomes
    git_blob: 8d7594b97048b06779166c451443bfafcee11c12
  - id: grid
    resource: evidence/v1-grid-parity.json
    title: Original Grid mechanism candidates and preserved behavior
    git_blob: 6a61d2fb9c4cf6acc401c54caeb7db038ead33d3
  - id: registry
    resource: evidence/remaining-work-plan.json
    title: Fixed owning stages and inherited acceptance
    git_blob: a18ff58091c2eb8d8050ba8222d6b3285a078a11
  - id: core-preflight
    resource: evidence/p01-core-preflight.json
    title: Exact core origins and source-backed cases
    git_blob: 1c86afd03eb501ccc8704b97cf78ea9d36916de7
  - id: ui-preflight
    resource: evidence/p01-ui-grid-preflight.json
    title: UI and Grid source-case inventory with explicit inherited scope
    git_blob: 19cb2223720739044d5d391721c582a77a64a89b
  - id: ajax
    resource: ../../v1/@types/natural.architecture.misc.d.ts
    title: Public inherited request settings and script or JSONP workflows
    git_blob: a4966b6dbfd8512ec810d218aa059eb812613e37
  - id: cvc
    resource: ../../v1/docs/architecture/cvc-pattern.md
    title: Executable block HTML and controller discovery
    git_blob: 5a63f205b851d0202af405e747dbc0384dbe2157
  - id: filters
    resource: ../../v1/docs/data/data-utilities.md
    title: Predicate and executable string filter conditions
    git_blob: c5da78f19fb37c9edf06a718ec62643bf9eb29da
  - id: handlers
    resource: ../../v1/docs/core/n-function.md
    title: Public handler inspection and priority insertion
    git_blob: 61389065959ea7a95d5b7c2d674fd72ec137522d
  - id: comm
    resource: ../../src/comm/index.ts
    title: Current asynchronous communication owner
    git_blob: 4b05ebaa4121885a96f53e8a3b32dd38e1498704
  - id: page
    resource: ../../src/page/index.ts
    title: Explicit inert view and controller factory
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: ui
    resource: ../../src/ui/index.ts
    title: Existing typed Grid and List predicate contracts
    git_blob: 0d3a883198da64468b0a6f967fb49c5423ffbdc4
generated: { by: codex/gpt-6, at: 2026-11-14T18:01:25Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T18:01:25Z }
---

# Goal

Record the explicit user decision on five actual workflow losses. Preserve feasible framework behavior through the modern owners. Do not treat old names, private jQuery machinery, known defects or a different typed API as separate omissions.[^proposal][^core][^grid]

The user approved only O01-O05 through the original consolidated question on 2026-11-15 (Asia/Seoul). The immutable [proposal](evidence/p02-omission-proposal.json) preserves its original pending state, source hashes, caller evidence, alternatives and costs. The separate [approval record](evidence/m32-approved-omissions.json) preserves the exact response. Approval does not establish runtime parity.[^proposal][^decision]

# Checkpoint

The user authorized M5.14-M5.20 and their necessary prerequisite stages, with separate implementation, tests, documentation and commits. The single consolidated decision now approves only the five stated losses. Unlisted outcomes remain required in their existing numbered owners.[^registry]

The known source-case inventory resolves 775 structural records, 53 dynamic groups, 750 supplemental UI records, five UI findings, 30 Grid contracts and 41 original acceptance IDs. The core input separately resolves all 260 core records and 15 dynamic groups. Their exact pointers, inherited profiles/defaults/local acceptance and concrete cases or candidates have no remaining known-record assignment gap identified by the source-case reviews. P0.1's inventory-only gate is accepted and pushed in cf2210fc7d9eeef7b7ef1d126ec2dd79040821e7; its [receipt](evidence/p01-inventory-verification.json) records the scope. P0.2 decisions are separate.[^core-preflight][^ui-preflight][^proposal]

P0.1 acceptance does not establish runtime or full-family parity, approve omissions, certify every private external application, or close the final P0/M8 semantic checks. Those are different owning gates, rather than missing known-input assignments.[^registry][^proposal]

# Steps

## Approved decision set

The user approved omitting only the precise capability in each row. Retain the listed alternatives and every related behavior outside that boundary. An alternative marked as an owning-stage obligation is not presented as already implemented.[^proposal]

| ID | Approved loss | Retained route | Migration cost and limit |
|---|---|---|---|
| O01 | Synchronous network requests that block the browser UI through `async: false`. This is a public request option that reaches the bundled XHR transport. | Current Promise-based communication with `await`; complete timeout, cancellation and ordered terminal hooks in M3.1/M3.2. | Convert synchronous call chains to async code and explicitly manage pending actions. Awaited sequencing does not reproduce a blocked UI thread. |
| O02 | Framework-provided JSONP callback-script transport, including JSONP-only endpoints. | Ordinary JSON HTTP with the required CORS policy, or an application backend proxy; finish ordinary cross-origin policies in M3.2. | The endpoint or backend may need changes. Fetching JSON is not equivalent when a server offers only JSONP. |
| O03 | Automatically executing scripts received in remote HTML or a `dataType: script` response, then discovering the controller created by that text. This includes distributing an executable block as one HTML file. | Existing explicit `PageDefinition` view/controller composition; TS/ESM controller modules, authored inert HTML and the common M3.3 loader. Deliberate application module imports remain supported application code. | Split executable HTML into view and controller resources and update page registration. CVC, remote views and container reuse remain required; arbitrary response text is no longer automatically executable. |
| O04 | Compiling JavaScript string filter conditions with `new Function`, including runtime condition text. | Existing Grid/List `setFilter` predicates and native application filtering. | Convert authored expressions such as `age > 20` to `row => row.age > 20`. External condition data needs an application-owned allowed schema or parser; a predicate API does not itself execute text. |
| O05 | Returning another library's existing jQuery handler/type/namespace records or inserting a new handler ahead of unknown installed handlers by changing their internal order. | Owned native listeners and explicit action order; finish binding-before-action, disabled/canceled behavior and cleanup through M3.7/M6.7. Applications retain their own listener references and metadata. | Rewrite integrations that inspect or manipulate those event records. Browser debugging tools can assist inspection, but there is no equivalent programmatic inventory or reordering of arbitrary external handlers. |

O01/O02 are source-supported inherited transport capabilities; this bounded review did not identify a concrete synchronous request or JSONP-only endpoint in the application examples. External consumers remain unknown. That does not make the capabilities unused. O03 has a concrete executable CVC block convention. O04/O05 are documented callable contracts, with separate internal outcomes that remain required.[^ajax][^cvc][^filters][^handlers][^proposal]

The five items do not remove ordinary headers, credentials, HTTP status/response access, progress, custom transformation or transport outcomes, cache/CORS, payload recipes, errors, completion or cancellation. Those remain M3.1-M3.3 work. Old jqXHR method spelling alone is an API migration, not another omission.[^comm][^proposal]

## Outcomes that remain required

| Original group | Required disposition outside the five narrow proposals |
|---|---|
| R01 | Keep CVC, remote inert HTML, explicit controllers, code-data loading, metadata and lifecycle. Only O03 response-code execution is the approved omission. |
| R02 | Preserve useful before/after/around/error and path/view/custom-pointcut outcomes through reviewed modern composition, including arguments, results, receivers and async failures. No omission is proposed. |
| R03 | Preserve typed declarations, code choices, selected defaults, actions, search submission and row events. Property spellings and declaration-to-handle mutation are API migration, not justification to drop those outcomes. |
| R04 | Preserve scoped shared services/handles and intentional live defaults, locale, messages and rules. A smaller configuration model must still serve the useful workflows. |
| R05 | Preserve useful custom inspection, findings, exclusions, severity/abort and debugging outcomes through a reviewed scoped workflow. Lint or source maps alone do not prove equivalence. |
| R06 | Apart from O04/O05, preserve predicates, projections, filtering/sorting, cancellation, disabled actions and binding-before-action. |
| R07 | Apart from O01/O02/O03, preserve ordinary communication and applicable inherited settings. Do not use one transport omission to remove unrelated HTTP behavior. |
| R08 | Preserve bound rules and resolve supported standalone dataset/manual format/unformat/validate workflows through the existing rule owner. No blanket rule-library omission is proposed. |
| Value and callback boundaries | M5.15/M5.17 must resolve useful non-JSON/inherited/mutable-source and per-key/unbound/no-op/old-value/local-global/receiver outcomes. Modern JSON or whole-hook recipes alone are not exact parity proof. Do not reproduce silent corruption as a feature. |
| Mask diagnostics | M5.18 must explicitly resolve standalone partial-input, deletion and error diagnostics while retaining required UI mask behavior. No omission is proposed. |
| GR01/GR02 | Preserve useful topology, inspection, pinning, footer, resize, reflow and customization outcomes through native authored layout and concrete migration. Old mutable field or pixel-option names alone are not a feature loss. |
| GR03 | Preserve Grid declaration/code-choice/row-action behavior under R03. Do not ask for a duplicate approval. |

All these obligations retain their original source cases, secondary owners and fixed stages. Form-used formatter, validator, mask, date/time and byte behavior remains required. Rich notifications, expiry, Tree checks, month/holiday selection and other unfinished component behavior are implementation work, not omissions in this proposal.[^core][^grid][^registry][^proposal]

Unrelated convenience helpers use the user's existing removal authorization only after separate direct, transitive, configuration, declaration, alias and external-reachability proof. Used outcomes stay private to their owner. Do not move the helpers into another convenience package, and do not infer such proof from this decision.[^core-preflight][^proposal]

## Record the decision once

1. Independently verify the five source-backed boundaries, alternatives and costs against the exact decision record.
2. Present all five items together and obtain explicit item decisions. The user can approve the proposed set, retain it, or adjust individual items; silence approves nothing.
3. Record each outcome by O01-O05. A rejected or unanswered item stays required in its current owner and needs a reviewed native implementation or equivalent outcome.
4. Apply approved boundaries in the owning implementation and migration documents. Run the owner's actual checks and commit its result separately. This planning decision supplies no runtime acceptance.

# Next action

Apply the exact O01-O05 boundaries in each owning stage and its migration documentation. Continue all other authorized work. Do not ask the same question again or infer whole-family completion from approval.[^decision][^registry]

# Decisions

- The user approved all five exact items. No R/GR group receives blanket retirement approval.[^decision]
- Preserve feasible behavior through existing owners before proposing a loss. Do not add a generic extension engine or copy obsolete jQuery machinery to retain an old name.
- CVC and authored HTML/CSS remain core requirements. Explicit controller modules do not remove page composition, remote views or reusable Popup/Tabs/Documents behavior.[^page]
- Typed predicates remain supported; filtering and sorting themselves are not proposed for removal.[^ui]
- Keep the P0.1 known-input inventory gate separate from implementation, full-family acceptance and the final P0/M13 reviews.
- No npm publication, release tag, branch promotion or v1/license change is authorized here.

# Verification log

2026-11-14: Source and documented caller review narrowed the original candidates to five precise proposed losses. Independent source/document review confirms the actual legacy branches, 19 source hashes, costs, alternatives and retained obligations. The maintainer presented all five together for the single user decision. That historical review did not grant runtime or omission approval. Changed/full documentation checks pass with the current bundle.[^proposal]

# Open questions

The user has approved only O01-O05. Concrete private application dependencies on synchronous requests, JSONP, executable responses, string conditions or external handler introspection are unknown. An unknown external caller does not prove unused behavior, and an unlisted loss remains required until resolved through its existing owner and explicit scope review.[^proposal]

[^decision]: Explicit user approval of exactly O01-O05
[^proposal]: Exact five-item proposal, source hashes and undecided dispositions
[^core]: Original core retirement candidates and required outcomes
[^grid]: Original Grid mechanism candidates and preserved behavior
[^registry]: Fixed owning stages and inherited acceptance
[^core-preflight]: Exact core origins and source-backed cases
[^ui-preflight]: UI and Grid source-case inventory with explicit inherited scope
[^ajax]: Public inherited request settings and script or JSONP workflows
[^cvc]: Executable block HTML and controller discovery
[^filters]: Predicate and executable string filter conditions
[^handlers]: Public handler inspection and priority insertion
[^comm]: Current asynchronous communication owner
[^page]: Explicit inert view and controller factory
[^ui]: Existing typed Grid and List predicate contracts
