---
type: Plan
title: Natural-JS 2.0 M9 release plan
description: Approved beta, release-candidate, and 2.0.0 gates for installed consumers, browsers, accessibility, performance, package scope, and publication.
tags: [meta, plan, release]
status: draft
sources:
  - id: roadmap
    resource: roadmap.md
    title: First-release scope and M9 gate
    git_blob: 716441c68a8971d34503b538ec67f4a7795e90fe
  - id: m8
    resource: https://github.com/bbalganjjm/natural_js/blob/e9db5d81496b5674b67e6d267c184cb63aa987c0/docs/implementation/m8-beta-report.md
    title: Unpublished M8 beta-candidate evidence and limits
  - id: audit
    resource: https://github.com/bbalganjjm/natural_js/blob/e9db5d81496b5674b67e6d267c184cb63aa987c0/docs/implementation/m8-api-audit.md
    title: Public surface and retained Form rule reachability
  - id: package
    resource: ../../package.json
    title: Current ESM beta package, exports, and scripts
    git_blob: 393602a69677d5fdaf7968fd49b19efd1b7d5cae
  - id: performance
    resource: https://github.com/bbalganjjm/natural_js/blob/e9db5d81496b5674b67e6d267c184cb63aa987c0/docs/implementation/m4-plan.md
    title: Fixed binding fixture and M6 performance budgets
  - id: workflow
    resource: ../governance/repository-workflow.md
    title: Source, documentation, and verification workflow
    git_blob: a8d61fb373b6ade2fc623216378de623324609c8
  - id: wcag
    resource: https://www.w3.org/TR/WCAG22/
    title: W3C Web Content Accessibility Guidelines 2.2
generated: { by: codex/gpt-6-sol, at: 2026-09-24T20:41:30Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T19:03:21Z }
---

M9 implementation is approved after [the unpublished M8 candidate](m8-beta-report.md). The user authorized deletion of the unused public `Rule` type while retaining Form formatter and validator behavior. No package publication, Git tag, or branch replacement has yet been approved against an exact release artifact.[^roadmap][^m8]

# Goal

Release Natural-JS 2.0.0 from a small Apache-2.0 ESM package whose installed JavaScript and TypeScript consumers, CVC lifecycle, authored-HTML components, retained Form rules, browser accessibility, nested binding, and documentation agree. Preserve the 1.x `v1/` tree and its LGPL notices; do not carry unneeded utilities or jQuery into the 2.0 artifact. Make every release gate reproducible by a coding agent using one short command/evidence map.[^roadmap][^audit][^package]

# Checkpoint

- M8 provides an unpublished candidate on `2.0.0-alpha.0`, a migration route, a public API/rule audit, fixed agent tasks, package checks, three Playwright-engine checks, and 1,000-row binding measurements. [Its report](m8-beta-report.md) records the completed M8 evaluation and OKF gates, with explicit limits.[^m8]
- M8 ended with a private `2.0.0-alpha.0` manifest. M9 now has an unpublished, publishable `2.0.0-beta.0` source candidate with the same five entry paths: `.`, `./page`, `./data`, `./ui`, and `./comm`. No npm beta, release candidate, or stable version has been published.[^package][^m8]
- The user approved removal of the unused public `Rule` tuple type. The runtime Form formatter and validator catalog remains unchanged. M8 counted 35 public types; the M9 source has 34.[^audit]
- Playwright Chromium, Firefox, and WebKit passed M8 focused coverage. Real Chrome and Edge are installed locally. The user has no Mac device, so real Safari cannot be tested on this host; WebKit evidence must remain labeled separately. Large List virtualization and actual agent token telemetry remain outside the first-release claim.[^m8]

# Steps

| Stage | Work | Exit evidence |
|---|---|---|
| 0. Freeze M8 handoff | Confirm M8's final report, commit, source and documentation checks, failing/known cases, API audit, test fixture versions, and release branch. Record the exact Git SHA used for the first beta build. Resolve or explicitly carry the `Rule` type decision before the public contract freezes. | A release checklist links the final M8 evidence, the proposed public export inventory, and each accepted limit. No unstated M8 warning is treated as a pass. |
| 1. Prepare reproducible beta | Select a `2.0.0-beta.N` candidate only after tests and docs pass. Update version, changelog, package metadata, README/install guide, migration guide, support matrix, and release notes together. Build and inspect an actual tarball from a clean commit; use its filename and checksum for every downstream test. Make the candidate manifest publishable by removing `private: true` or setting `private: false` before packing and testing it. Keep the registry unchanged through prepublication review; publish a prerelease only after that exact tarball, SHA, and registry tag receive explicit approval. | Candidate SHA and tarball hash; exact packed file list; declaration/runtime export match; license and provenance audit; install instructions that match the candidate. |
| 2. Test the packed package | Install the same tarball into fresh, separate JavaScript ESM and strict TypeScript projects, then run representative CVC, Rows, communication, Form/Grid/List/Select/Pagination, and Popup/Tabs imports and a browser-served screen. Confirm deep imports only through the five declared entries and that source maps/declarations resolve. Test the documented minimum Node/tooling versions in the consumer workflow. | Clean `npm ci`, `npm run build`, `npm run typecheck`, `npm test`, and `npm run test:consumers` passes from the candidate; JS/TS imports and runtime smoke results from the packed artifact, not the workspace source. |
| 3. Exercise browser and access gates | Run the full browser suite in Playwright Chromium, Firefox, and WebKit. Then execute a short manual or automated smoke against real Chrome and Edge on a supported desktop and real Safari on macOS/iOS where the planned support claim applies. Check keyboard-only open/close, tab change, selection, validation, focus entry/return, Escape, native dialog behavior, error/status announcements, labels, `aria-describedby`/`aria-sort`/`aria-current` references, repeated-row IDs, and two simultaneous MDI screens. Check both authored layouts without imposing a theme. Target WCAG 2.2 Level AA for each complete reference page and audit framework-generated or mutated DOM with an A/AA criterion matrix, automated checks, and manual keyboard, screen-reader, and contrast review; document that arbitrary application-authored HTML/CSS needs its own page audit.[^wcag] | Versioned browser/OS matrix, per-criterion results and test commands, screenshots or issue links for failures, and zero duplicate IDs or broken references in live repeated/MDI views. A missing vendor browser is recorded as an unverified release gate, not silently replaced by its Playwright engine. |
| 4. Exercise lifecycle and data gates | Repeat two independent instances, failed/aborted initialization, rapid reload, delayed request after removal, repeated Popup/Tab activation, nested Popup focus, and disposal without listener growth. Test flat and nested JSON, row-local Select choices, raw types, row ID stability after sort/filter/page, hidden changed-row validation, revert, invalid draft, and changed-row save. Trace built-in formatters/validators through declarative Form and row forms, including the private mask/date/byte helpers. | Focused regression results for each contract family; no late DOM update, resource growth, wrong-row write, invalid save, or loss of a framework-reachable rule.[^audit] |
| 5. Recheck binding cost | Re-run the checked-in 100- and 1,000-row, 10-field flat and nested Grid fixtures and 1,000-row List/page fixture after each release-candidate code change. Keep the M4/M6 Chromium reference-host budgets: flat initial/rebind/edit/sort/filter at most 30/35/5/10/8 ms; nested automatic initial/rebind/sort/filter at most 90/100/25/18 ms. On another host, collect its pinned baseline first and compare no more than 2× its corresponding medians. Record browser, host, warm-up, runs, median, DOM count, and diagnostic heap separately. | Raw JSON and a comparison table. Investigate any threshold failure before release; do not claim a universal speed guarantee or production List virtualization.[^performance] |
| 6. Audit package, license, and AI docs | Diff the packed files and exports against the M8 audit. Search the tarball and import graph for jQuery, globals, old 1.x bundles, convenience libraries, dead utilities, and accidental source/test/docs inclusion. Retain all framework-reachable Form rules. Confirm Apache-2.0 metadata and license cover the new root package while `v1/` content and LGPL notices remain untouched and excluded. Make the README, entry-point concepts, migration examples, error guidance, and release notes reflect the actual artifact. Re-run one fixed docs-first agent task when a release change alters navigation or contract. | Package inventory and SPDX/license review; correct public names and type declarations; executable examples; changed/full OKF checks with zero errors and warnings or a recorded, reviewed exception. Agent result reports correctness first, read context separately, and actual tokens only when available.[^audit][^workflow] |
| 7. Cut a release candidate | Fix beta findings with focused regressions and same-task OKF updates. Freeze the public exports, support range, known limits, and candidate SHA. Build `2.0.0-rc.N` from a clean commit and repeat packed-consumer, three-engine, vendor-browser, accessibility, performance, package, and documentation gates against that exact artifact. Any code/contract change invalidates affected evidence and requires another candidate. Publish an RC only after separate review of that exact artifact and prerelease registry tag. | One release-candidate report with exact commands, versions, raw evidence, all blockers closed, and a list of any waived non-blockers approved by the user. |
| 8. Review and publish 2.0.0 | Prepare the final `2.0.0` publishable manifest, release notes, migration guide, npm pack list, Git diff, and proposed tag/branch actions as a concrete reviewable result. Repack and rerun all artifact-dependent gates after the stable version or manifest changes; an RC tarball checksum cannot stand in for the stable tarball. Ask for explicit publication/tag approval after all gates are green. Publish the reviewed artifact once, verify registry metadata and installed JS/TS imports, then create/push the corresponding immutable tag and record its SHA. Do not move `master` or archive it under this M9 plan; that is a separate branch-transition decision. | Registry package/version and checksum match the reviewed tarball, tag points at the reviewed source, install smoke passes, release notes and OKF checkpoint identify the published result. |

# Next action

Proceed with the approved M9 implementation, beginning with the M8 recheck, public `Rule` type deletion, fixed-tarball consumer tests, and accessibility gates. Before any registry publication or tag, return the exact candidate SHA, tarball, package contents, release notes, completed gates, and remaining limitations for a final explicit publication decision. If real Safari cannot be tested on an available host, record the unsupported evidence and seek a support-scope or schedule decision rather than declaring the gate passed.

# Decisions

- Release correctness precedes optimization claims. A passing fixture proves that fixture and browser/host combination; agent read bytes are not tokens and incomparable 1.x/2.0 task runs do not prove savings.[^m8][^performance]
- Keep native, accessible authored HTML and CSS authoritative. `data-field` and store-local row identity bind values; document-unique IDs are used only where real HTML label or ARIA associations require them.[^roadmap]
- The framework owns CVC lifetime, data sharing, UI binding, and Form rule dispatch. Applications own business rules, API payload conversion, layout, and visual contrast of authored CSS. A release defect in the framework's generated or changed accessibility state is still a blocker.[^roadmap][^audit]
- Do not remove any other exported contract through release cleanup without its own reviewed decision. Do not remove a formatter, validator, or transitive helper while declarative Form/List/Grid can reach it. Avoid adding a compatibility utility package.[^audit]
- Version, publishable manifest, registry publication, and Git tag are separate state changes. The candidate must have its final manifest before packing and consumer checks; an approved implementation plan alone does not authorize publishing. Stage every beta, RC, and stable artifact for review before its registry write. Keep `master`, archived 1.x history, and `v1/` unchanged unless the user later approves a branch migration.[^m8]
- Release rollback means stop before the next stage, return to the last known-good commit and tag, and issue a new semver version for a fix. A published npm version cannot be overwritten; if a bad version escapes, correct its dist-tag or deprecate it with explicit approval, then publish a replacement. Preserve the failed artifact, command output, and cause for diagnosis.
- Change code, tests, English OKF concepts, folder indexes, bundle log, fingerprints, migration docs, and release notes together. Mark `verified` only after independent comparison with source and artifact. Keep the active checkpoint short enough to resume release work quickly.[^workflow]

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-25 | M9 approval and M8 recheck | An independent M8 recheck matched the pushed `e9db5d81` commit, three agent-task raw logs, 75/75 tests per Playwright engine, and a clean full OKF check. The user approved M9, removal of only the unused public `Rule` alias, and reported no Mac/Safari device. The rule runtime remains. |
| 2026-09-25 | M9 implementation gate | Build, typecheck, and Vitest 81/81 passed after public `Rule` removal. Popup Tab-boundary focus was fixed without a new public API. Isolated full suites passed 103/103 each in Chromium, Firefox, and WebKit. M4/M7 authored layouts passed automated axe A/AA checks for tested states. Reference-host 1,000-row flat Grid initial/rebind medians were 11.9/16.0 ms and nested-auto 37.3/44.4 ms; List initial was 11.5 ms, with duplicate IDs 0. These preliminary medians were superseded; the linked raw [Grid](evidence/m9-binding-chromium.json) and [List](evidence/m9-list-chromium.json) records now contain the corrected beta run below. Real Safari and manual screen-reader checks remain open. |
| 2026-09-25 | Corrected beta package gate | Clean source `a45fbd6` produced SHA-gated `2.0.0-beta.0` tarball `ca87cf82f6fe457823500e1933ec52de0a35d8f6a529be50cb37ed6fdea126b8`. JS/TS installed consumers, five Windows browser consumers, and 103/103 full source tests per Playwright engine passed. Updated 1,000-row flat Grid initial/rebind medians were 12.5/15.8 ms, nested-auto 38.0/46.9 ms, and List initial 11.4 ms. Three-engine M4 side/stack 320px text-spacing and M7 side-layout Popup focus regressions passed. The [M9 beta report](m9-beta-report.md) separates exact-tarball evidence from source checks and open Safari/manual-accessibility gates. |

# Open questions

- Real Safari remains untested on the available Windows host. Its support claim needs an explicit release-scope decision or an external Safari result before final publication.
- What minimum Node.js version should the published package promise? The build guide names tested Node.js 24.18; the browser package does not set a Node engine promise. Validate any wider development-tool range before documenting it.
- Is npm publication under `@bbalganjjm/natural_js` available with the intended registry access and account permissions? Verify read-only before preparing publication; the final publish command waits for explicit approval.
- Do the currently passing 1,000-row List numbers represent the expected first-release workload? Larger lists and virtualization remain M10 follow-up unless a real release blocker appears.

[^roadmap]: First-release scope and M9 gate
[^m8]: Unpublished M8 beta-candidate evidence and limits
[^audit]: Public surface and retained Form rule reachability
[^package]: ESM package, exports, and scripts
[^performance]: Fixed binding fixture and M6 performance budgets
[^workflow]: Source, documentation, and verification workflow
[^wcag]: W3C Web Content Accessibility Guidelines 2.2
