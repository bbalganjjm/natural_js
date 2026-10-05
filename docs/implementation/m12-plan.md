---
type: Plan
title: Natural-JS 2.x M12 notification and document shell plan
description: Approved authored notification and dynamic document-tab scope on the existing CVC runtime.
tags: [meta, plan, ui, cvc, accessibility]
status: draft
sources:
  - id: m11
    resource: m11-plan.md
    title: Completed M11 contract and verification
    git_blob: e7e296bf67840bbb8baee698833216ddd8619c11
  - id: page
    resource: ../../src/page/index.ts
    title: Existing CVC runtime
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: tabs
    resource: ../../src/ui/tabs.ts
    title: Existing static Tabs contract
    git_blob: 8e2fe057168717b6b8ad2182c66935a492a89292
  - id: legacy
    resource: ../../v1/src/natural.ui.shell.js
    title: Preserved 1.x notification and document intent
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
  - id: tab-pattern
    resource: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
    title: WAI-ARIA tabs pattern
  - id: alert-pattern
    resource: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
    title: WAI-ARIA alert pattern
  - id: notify
    resource: ../../src/ui/notify.ts
    title: Implemented authored notifications
    git_blob: 78af2890f980c0091246e81abd2a041b084bc30f
  - id: documents
    resource: ../../src/ui/documents.ts
    title: Implemented dynamic document containers
    git_blob: 9d1da99633d4c2525eb6440b7aed98bb8753cb61
  - id: coordinator
    resource: ../../src/ui/tab-pages.ts
    title: Private shared page-tab coordination
    git_blob: 4e0f2ee8ee62e95f0b3e47d7a305ecffbe53bd31
  - id: shell
    resource: ../../examples/vite/m12/main.ts
    title: Application-owned CVC shell composition
    git_blob: 959409cbc96ca35251a09d205d5f13b1ac6756ac
  - id: verification
    resource: evidence/m12-verification.json
    title: Frozen M12 source, artifact, browser logs and audit limits
    git_blob: a9ff996758f319cc69209880debfcc69907d10c9
generated: { by: codex/gpt-6, at: 2026-10-05T09:51:27Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T09:51:27Z }
---

The user authorized committing/pushing the current state and proceeding to M12 on 2026-10-05. M11 commit a7bb7f5 is already on 2.0.0-alpha.0; no substantive pending changes were found. The copied Git index reports unchanged LF files as modified; only normalized content changes belong in a commit. The original untracked js lockfile remains outside this task.

# Goal

Complete the selected shell behaviors with concise TypeScript APIs, authored HTML/CSS, independent MDI state, accessible focus and IDs, and one CVC lifecycle. Keep application business state and navigation outside the framework. Preserve retained formatter/validator rules and leave v1/master unchanged.

# Checkpoint

The selected M12 scope is complete. M11 and its evidence were independently inspected before implementation; no conflicting CVC, Rows, UI or package contract was found. The detailed scope was recorded before source changes. Notify, Documents, the private coordinator and the two-layout CVC shell passed the final source and package gates below. The exact artifact contains 128 files and no runtime dependency; v1/master remain unchanged. The 2026-10-05 [full feature plan](feature-parity-plan.md) reopens uncovered legacy shell behavior; exclusions below describe this historical slice and do not authorize dropping that behavior from the expanded release scope.

# Steps

1. Add bindNotify and NotifyHandle on a named authored region, ul/ol item template, plain-text message marker, optional native close button, and stable status/alert announcement elements. show(message, { urgent? }) returns a dismissal function; clear and dispose release only owned entries. Messages persist until dismissed; no timer engine, HTML parsing, positioning or z-index scan.
2. Add bindDocuments and DocumentHandle on a named authored tablist, tab and empty panel templates, a separate data-document-items host, error alert and empty state. open(key, { title, page }) creates and selects a document; an existing key resumes its retained page and ignores the new descriptor. select/selected/keys/close/reload/dispose have fixed contracts. Keys are application identity; generated DOM IDs serve ARIA only.
3. Supply an optional typed beforeClose(key) boolean/Promise callback. The application owns dirty detection and native confirmation. A refused close returns false, an absent key is a successful no-op, and permitted close disposes the page before removing its DOM. Adjacent right/left selection and focused-control recovery apply only where necessary. A pending guard is canceled by binder disposal; a guard error leaves the document intact.
4. Share the real static/dynamic page-tab transition, cache, recovery and keyboard behavior through a private concrete module when needed. Keep mountPage and Popup ownership unchanged. New pages await ready (which already includes first activation); cached pages activate/deactivate. Latest selection wins, failed handles are evicted for retry, and slow deactivation retains the existing Tabs contract. reload recreates the selected target from its original descriptor; changed input requires explicit close/reopen.
5. Compose a small application shell in two authored layouts, with two independent shell instances. Reuse one page definition in main content, documents and Popup; share caller-owned Rows inside each shell. Include notification, guarded dirty close, loading/error/retry, rapid close and repeated teardown examples. No new shell class, router, global page registry or communication filter.
6. Update consumers, public export map, draft concepts, source/test map, indexes and log. Independently audit runtime and contracts, measure docs-first read context honestly, and record exact source/package verification.

# Decisions

| Addition | Necessary responsibility and visibility |
|---|---|
| bindNotify / NotifyHandle | Public plain-text notification, dismissal and owned cleanup; application owns persistence and messages. |
| bindDocuments / DocumentHandle | Public keyed dynamic page container, state reuse, explicit reload, close guard and cleanup. |
| beforeClose callback | Minimal connection for application dirty-state policy; no framework confirmation UI or data heuristic. |
| Private page-tab coordinator | Shared real static/dynamic transition, cache, recovery and keyboard behavior; not a new page runtime or public extension engine. |
| Existing dom-state helper | Reuse document-unique IDs and exact attribute restoration. |
| Application shell example | Ordinary CVC composition, input/output and Rows; no extra public shell API. |

Repeated templates reject fixed IDs and unintended interactive controls. A close button is a sibling of the document tab button, never nested inside it. Their wrappers are rendered in an authored data-document-items host outside the named tablist, which owns only generated tab IDs through aria-owns. This preserves native close controls while satisfying ARIA child-role rules. Keyboard arrows/Home/End move focus without opening; Enter/Space selects and Delete on a document tab closes through the same guard. Last-document close uses the authored empty-state control or container focus. Notifications announce through stable polite/assertive regions without taking focus; removal of a focused notification chooses a remaining close control or its region.[^tab-pattern][^alert-pattern]

The legacy global request queue, caller/docOpts injection, whole-application communication filter, URL navigation, drag layout, maxStateful eviction, animation timers, notification auto-expiry and global locale registry are outside this selected slice. Applications compose ordinary browser APIs and callbacks for those policies. No excluded convenience library or public utility package is introduced.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-10-05 | Current branch and prior milestone | GitHub and local HEAD a7bb7f5 match; no substantive pending diff. Independent read-only audits confirmed M11 evidence and identified 1.x shell intent/bugs without modifying v1 or rerunning historical claims. |
| 2026-10-05 | Accessibility structure correction | Initial shell behavior passed, but populated axe found that native close buttons inside the tablist violate its child-role rules. Added an authored item host outside the named tablist and explicit tab-only ARIA ownership; final cross-browser validation is required. Public method contracts are unchanged. |
| 2026-10-05 | Independent lifecycle review | Corrected partial/malformed page-handle cleanup, alert child-node identity restoration, pending cleanup before DOM removal, strict synchronous close-guard results, text-only titles and arbitrary thrown-null error display. Reviewed source keeps one CVC execution owner. |
| 2026-10-05 | Cross-engine test assumption | WebKit pointer clicks do not preserve native-button focus. The shell test now explicitly focuses and activates its notification/close controls with Enter to verify insertion focus preservation and owned-focus recovery. No runtime focus change was introduced for this browser behavior. |
| 2026-10-05 | Final edge review | Rejected coincident or nested document regions before mutation and skipped unavailable empty-state controls during final-close focus recovery. Cleanup now propagates its first rejection even when null/undefined. Earlier partial runs and the 7ccecf3e tarball are superseded by final frozen-source gates below. |
| 2026-10-05 | Build and strict types | Source build/typecheck, strict standalone shell example and final Vitest 81/81 passed. Public additions are only bindNotify/NotifyHandle and bindDocuments/DocumentHandle; the concrete page-tab coordinator remains private. |
| 2026-10-05 | Full frozen-source suites | Chromium 167/167 (22.8s), Firefox 167/167 (1.4m), WebKit 167/167 (59.9s). Includes existing Tabs regressions and both shell layouts, manual keyboard activation, guard/cancellation/error/cleanup, narrow-width/text-spacing axe states and unique ARIA IDs. |
| 2026-10-05 | Exact unpublished artifact | SHA-256 ea0f8e2e5538d6a0f210ab3918d3141658a2370b9c7362b72512008af5266c32; 128 files, 184003 packed bytes, 896713 unpacked bytes. JS/strict TS and Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6, installed Chrome 154.0.8037.93 and Edge 154.0.4258.53 all passed on this same artifact. |
| 2026-10-05 | Independent contract and context review | A separate agent read the three new contracts before source: 3 files / 21674 file bytes (5669 Notify, 9309 Documents, 6696 shell example). It then compared source, examples, regressions, consumers and affected concepts. This is a navigation/context proxy; no new implementation acceptance task, actual token meter, speedup or equivalent 1.x comparison. |

[The verification record](evidence/m12-verification.json) preserves frozen source SHA-256 values, LF-normalized raw-log hashes and audit limits.[^verification] Raw evidence is in [Chromium](evidence/m12-browser-chromium.log), [Firefox](evidence/m12-browser-firefox.log), [WebKit](evidence/m12-browser-webkit.log), [unit](evidence/m12-unit.log), [JS/TS](evidence/m12-consumers.log) and five m12-packed-* browser logs. The final auditor authored the small cleanup-sentinel patch after finding it; the root agent separately reviewed those branches, and the focused 17-case run plus final full suites covered them. Historical M8/M9/M11 evidence is not recertified by source-fingerprint maintenance.

# Next action

Commit and push the completed scope to 2.0.0-alpha.0 after the final changed/full OKF checks. The next product step is personal demo testing, followed by a separately planned release-candidate run; npm publication and release tags remain deferred. No further implementation milestone is active.

# Completion gates

- Key reuse preserves controller/data; close/reopen and reload create fresh instances. Failed init, rapid selection, slow deactivation, guarded close and disposal cancel/clean consistently.
- Two layouts and simultaneous shells preserve authored structure, ARIA references, unique IDs, keyboard access and focus recovery. Notifications never auto-dismiss or take focus on insertion.
- Chromium, Firefox and WebKit run the full source suite. The same unpublished tarball passes JS/TS plus Chromium, Firefox, WebKit, installed Chrome and Edge consumers. Real macOS/iOS Safari remains excluded.
- Draft APIs/types/examples, independent verification and source fingerprints agree. Changed/full documentation checks have zero errors; remaining warnings must be recorded if any.
- No jQuery, runtime dependency, unused utility, duplicate page engine, npm publication or release tag.

# Open questions

Manual assistive-technology review and personal product testing remain open. Actual agent tokens are unavailable unless a real meter is returned; file bytes are only a context proxy. User cleanup promises that never settle can delay final disposal, matching the existing page runtime contract.

[^tab-pattern]: WAI-ARIA tabs pattern
[^alert-pattern]: WAI-ARIA alert pattern
[^verification]: Frozen M12 source, artifact, browser logs and audit limits
