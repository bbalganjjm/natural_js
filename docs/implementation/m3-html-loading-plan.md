---
type: Plan
title: Natural-JS 2.0 M3.3 common HTML loading
description: Connect URL views to an application communicator through one captured HTML loader while retaining common CVC parsing, IDs and lifetime.
tags: [meta, plan, cvc, communication, migration]
status: draft
sources:
  - id: evidence
    resource: evidence/m33-verification.json
    title: Selected M3.3 source, runtime and independent acceptance
    git_blob: a6e18716de4a267e5ae3568fd6766ee8efcd3b4b
  - id: page
    resource: ../../src/page/index.ts
    title: Existing page loader, validation and instance lifetime
    git_blob: 07b9cfb9b8cd7385ed24c5fc4bbb0f25bd07b6bd
  - id: legacy
    resource: ../../v1/src/natural.architecture.js
    title: Legacy HTML insertion and controller initialization
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
  - id: cvc
    resource: ../../v1/docs/architecture/cvc-pattern.md
    title: Existing CVC and authored HTML intent
    git_blob: 5a63f205b851d0202af405e747dbc0384dbe2157
  - id: registry
    resource: evidence/remaining-work-plan.json
    title: Fixed M3.3 scope and later owners
    git_blob: a18ff58091c2eb8d8050ba8222d6b3285a078a11
  - id: baseline
    resource: evidence/m32final-verification.json
    title: Accepted M3.2 communication and protocol checkpoint
    git_blob: c44fa622097d0c1b7073701598a2fe394014db57
  - id: omissions
    resource: omission-decision.md
    title: Only O01–O05 are approved exclusions
    git_blob: 3586346b948dbbd2cf38292a89bb71d09aa7f582
  - id: popup
    resource: ../../src/ui/popup.ts
    title: Direct PageDefinition forwarding and modal ownership
    git_blob: 49ec03d610615aff95952804541c94892799535f
  - id: tabs
    resource: ../../src/ui/tabs.ts
    title: Existing application page factories
    git_blob: 8e2fe057168717b6b8ad2182c66935a492a89292
  - id: documents
    resource: ../../src/ui/documents.ts
    title: Existing document page factories
    git_blob: 9d1da99633d4c2525eb6440b7aed98bb8753cb61
  - id: pages
    resource: ../../src/ui/tab-pages.ts
    title: Shared retained page and failed-candidate cleanup
    git_blob: 4e0f2ee8ee62e95f0b3e47d7a305ecffbe53bd31
  - id: browser
    resource: ../../tests/browser/page.spec.ts
    title: Existing page root, executable HTML and lifetime witnesses
    git_blob: c20cb28fb525516147f57eb22959cee99168bce7
  - id: containers
    resource: ../../tests/browser/documents.spec.ts
    title: Existing shared container recovery and cleanup witnesses
    git_blob: 153d53803a071dad845cb8c56f90f7f23a677cbb
generated: { by: codex/gpt-6, at: 2026-11-14T18:39:39Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T18:39:39Z }
---

# Goal

Add one optional `PageDefinition.loadHtml(url: URL, signal: AbortSignal): Promise<string>`. An application closes over its communicator and decodes text; mountPage keeps one parser, one controller runner and one resource owner. Keep authored HTML/CSS, independent CVC instances and small direct code. Add no loader registry, dependency, public context type, utility package or container-specific loading option.[^page][^legacy][^cvc]

# Checkpoint

Start from accepted, pushed M3.2 at 86be062fcbc30015a3671d629ef45df6779aeae8 and its final verification record.[^baseline]

# Steps

1. Review the committed page source and every concrete container caller. Popup currently forwards the full definition to mountPage; Tabs/Documents use application factories through the shared page owner. Preserve those routes instead of adding separate loaders.[^popup][^tabs][^documents][^pages]
2. Capture loadHtml once per mount. Reject a supplied nonfunction with PAGE_OPTIONS. Invoke the captured function plainly for URL views and keep it for reload; later replacement or addition of loadHtml does not alter that handle. Borrowed/factory elements keep their existing source paths. When absent, retain the current native fetch lookup and PAGE_FETCH/PAGE_HTTP behavior.[^page]
3. Require primitive text from the custom loader before shared parsing; a nonstring result raises PAGE_LOAD. Preserve communicator FrameworkErrors and normalize other loader failures as PAGE_FETCH. Pass the page signal, retain the existing prompt abort race and check it after text arrives. Late completion cannot insert HTML, construct a controller or revive a stale generation.[^page][^browser]
4. Traverse HTML template.content recursively with a local element stack when checking executable tags/attributes. Keep one-root validation and the existing rejection policy. Do not expand ID checks into inert template content: inert template IDs remain outside the live-document uniqueness check, while live document collisions still raise DUPLICATE_ID. Authored borrowed/factory roots retain their current trust boundary.[^page][^browser]
5. Execute one communicator-backed definition through main, Popup, Tabs and Documents. Observe prepared headers/transformed text and separate input/output/lifetime. Verify real failed Tab/Documents candidates release their work and preserve/recover the retained page through the existing owner.[^popup][^tabs][^documents][^pages][^containers]
6. Use explicit application-owned child hosts for destination/add/retain-old replacement. Keep the old page through candidate readiness; dispose/remove failed or superseded candidates. Candidate IDs must be unique or absent. Candidate ready includes activation before reveal, and old cleanup begins only at commit. Existing in-place reload continues removing its prior page first; do not promise rollback after retiring a controller.[^page][^pages]
7. Extend existing installed TS/browser JS/packed-browser checks for the new field, actual communicator text loading, captured/plain invocation, cancellation and nested-template rejection. Keep the DOM-free Node JS consumer and all existing witnesses. No new framework example abstraction is required.[^page]

# Next action

Finish independent raw and final-document acceptance on the frozen M3.3 runtime, then commit/push this stage and begin M3.4 from its saved baseline.[^evidence]

Run strict build/types/examples, the complete unit suite, focused page/container cases and all sixteen canonical gate groups. Retain all attempts, exact compressed/uncompressed browser-report hashes, three full engines, JS/TS and five installed browsers, actual tar payload verification and the original nine binding/twenty-one viewport budgets. Independent connected source, raw evidence and final semantic body reviews precede verified metadata.[^baseline][^registry]

# Decisions

The user approved only O01–O05, including O03's remote executable content/automatic discovery exclusion; other retained R/GR outcomes stay required. Explicit controller modules remain the supported connection.[^omissions][^registry]

M3.4 owns controller/view capture details, metadata and null/undefined cleanup failures. M3.5 owns scoped configuration/services. M7/M12 own preload, retention, activation and shell policy. This stage does not add deferred activation; ready still includes activation.[^registry][^page]

The bounded proposal changes one existing runtime module, adds one optional field and one browser file with fifteen proposed definitions, and updates three installed-contract paths. It adds no unit cases, runtime module or emitted package filename.[^page][^baseline]

Update page API, page-container example and migration text with the actual loader/error/security/host contracts, plus current/stage/batch status and navigation/log/fingerprints. Avoid duplicate contract paragraphs or reverse source edges in feature-parity-plan. Keep implementation plans separate from implemented draft API text. Documentation checks must have zero errors; record any warnings and preserve unrelated historical bodies/dates.[^registry]

# Verification log

M3.3 connected source/caller review, strict source/example checks, 155 units and 47 focused cases per engine pass. All sixteen canonical groups pass on 206 inputs and 891 full cases per engine, preserving 876 parent cases. The exact 203-file package passes JS/TS and five installed browsers; thirty original budgets/sixty medians pass. Twenty-four attempts preserve the first 46-pass/one-failure non-strict callback fixture and the corrected strict function; no framework fix is claimed. The source/focus snapshot stays immutable and the final wrapper owns later raw/document completion.[^evidence]

Completion requires: the shared communicator policy applies to URL HTML in all four containers; callback capture, failures/cancellation, nested inert HTML, live IDs and host ownership have actual witnesses. The exact installed artifact and original gates pass on one frozen input set. Independent reviews accept the bounded source/evidence/documents, receipt projections remain invariant and the authorized alpha branch receives a separate commit. npm publication, release tags and master/archive changes remain deferred.[^baseline][^registry]

# Open questions

Derive final input/case/archive counts from actual frozen sources and raw reports rather than treating these planning deltas as evidence.[^baseline]

[^evidence]: Selected M3.3 source, runtime and independent acceptance
[^page]: Page runtime and types
[^legacy]: Preserved HTML and controller flow
[^cvc]: CVC intent
[^registry]: Numbered remaining-work ownership
[^baseline]: Accepted M3.2 tool-inclusive baseline and separate saved commit
[^omissions]: Exact user-approved five exclusions
[^popup]: Popup page forwarding
[^tabs]: Tabs page factories
[^documents]: Documents page factories
[^pages]: Shared page resource owner
[^browser]: Existing page acceptance
[^containers]: Existing container recovery acceptance
