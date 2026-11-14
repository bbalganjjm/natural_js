---
type: Plan
title: Natural-JS 2.0 M3.4 page metadata and lifetime
description: Preserve page-local metadata through typed input and closures, capture controller factories and make every disposal observe the same complete cleanup result.
tags: [meta, plan, cvc, lifecycle, migration]
status: draft
sources:
  - id: page
    resource: ../../src/page/index.ts
    title: Common page generation, input, output and cleanup owner
    git_blob: a9c55c619db80f2fdac55b3b948f6f9ce1d3c20c
  - id: legacy
    resource: ../../v1/src/natural.architecture.js
    title: Legacy request attributes and controller initialization
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
  - id: popup-legacy
    resource: ../../v1/src/natural.ui.js
    title: Legacy Popup caller and opener context
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: documents-legacy
    resource: ../../v1/src/natural.ui.shell.js
    title: Legacy Documents caller and document options
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
  - id: registry
    resource: evidence/remaining-work-plan.json
    title: Fixed M3.4 metadata and lifecycle outcomes
    git_blob: a18ff58091c2eb8d8050ba8222d6b3285a078a11
  - id: baseline
    resource: evidence/m33-verification.json
    title: Accepted M3.3 common HTML loading checkpoint
    git_blob: a6e18716de4a267e5ae3568fd6766ee8efcd3b4b
  - id: omissions
    resource: omission-decision.md
    title: Only O01–O05 are approved exclusions
    git_blob: 3480707796d751619a98ae094b61a294d63e74af
  - id: popup
    resource: ../../src/ui/popup.ts
    title: Definition forwarding, modal result and child page cleanup
    git_blob: 49ec03d610615aff95952804541c94892799535f
  - id: pages
    resource: ../../src/ui/tab-pages.ts
    title: Shared retained page and disposal ownership
    git_blob: 4e0f2ee8ee62e95f0b3e47d7a305ecffbe53bd31
  - id: tests
    resource: ../../tests/browser/page.spec.ts
    title: Existing concurrent page, cancellation and root ownership checks
    git_blob: c20cb28fb525516147f57eb22959cee99168bce7
  - id: installed
    resource: ../../tests/consumers/browser/main.js
    title: Existing installed page loading and communicator witness
    git_blob: 9f8fad31a4a8acc7467916729f745de34ebbda40
generated: { by: codex/gpt-6, at: 2026-11-14T19:10:56Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T19:10:56Z }
---

# Goal

Finish the bounded M3.4 metadata and lifetime contract through the common page owner. Keep caller, opener, parent, request and application context in a concrete typed input object or closure. Capture the controller factory, preserve class lifecycle receivers and ensure concurrent or repeated disposal observes one complete cleanup result. Add no public metadata map, registry, type, export, dependency or activation policy.[^page][^registry][^legacy][^popup-legacy][^documents-legacy]

# Checkpoint

This plan is written before source application from accepted and pushed M3.3 b1d16082af4b938b1a885c8508f6243c886c3435. The bounded cache contract/source/callers have independent pre-implementation review. The current M3.3 page source is b8b00a8ac5ff4f2c383c0e11fa6b09256488b7b0544fc1b0cebb81df1a7150bf. At the written-plan checkpoint, the proposed source/test/installed changes were uncompiled and unexecuted. Historical runtime credit remains in its original receipt.[^baseline]

The existing owner already provides typed PageContext.input, page-local output, an abort signal and owned cleanup. Popup passes the complete definition/input to mountPage; Tabs and Documents own application page factories through the same private page owner. Those contracts can carry concrete legacy metadata interactions without exposing another controller instance or a mutable global object.[^page][^popup][^pages]

# Steps

1. Recover the clean pushed M3.3 checkpoint and retained runtime/doc evidence. Read the common page owner, real container callers, legacy request attributes/caller/docOpts and the installed checkPageLoading witness. Confirm this stage adds no new public API or dependency.
2. At mountPage creation, read loadHtml and controller once, validate the controller function with PAGE_OPTIONS and retain both captured functions. Invoke the controller factory plainly for each generation. Keep init/activate/deactivate/dispose as methods on the returned controller so class instances retain their receiver. A bound factory retains its explicit binding; ordinary unbound strict functions observe undefined this. Do not add an isolated this:void type convention.
3. Keep definition.view live between reloads. Inside each admitted start, read it once and use that exact value for generated/borrowed classification and loading. Recheck generation/disposed immediately after its getter; a getter that reloads or disposes cannot start stale native/custom loading. This is a mountPage generation rule; Popup's existing host preflight reads remain outside it.[^page][^popup]
4. Replace the cleanup value sentinel with an explicit first-failure flag. Deactivate when activation began, dispose the controller and run owned cleanup in reverse order even after an earlier failure. Release the borrowed claim/remove generated DOM, then preserve an existing FrameworkError/AbortError or normalize another first failure as PAGE_DISPOSE. Both throw null and throw undefined retain an own cause property. Later cleanup failures must not replace the first.
5. Capture the current instance before aborting/waiting in reload and dispose. Publish one cached disposal promise before abort listeners can reenter. Concurrent, reentrant and later dispose calls return that promise and observe its rejection. During canceled initialization, ready keeps AbortError while the initiating disposal/reload observes captured cleanup failure after the live instance pointer clears. A cleanup failure blocks that reload; a later explicit retry may start after release. Do not replay an old ready failure from an already-empty handle. Late context.own registration retains its existing immediate-cleanup/error policy and does not join an already captured disposal promise.
6. Use an application-owned input interface for caller capabilities, opener element, parent key/signal, request primitives and locale/scope context. Preserve zero, false and null. Register child container disposal/output unsubscription before awaiting child readiness. Guard direct application capabilities with parent.signal; page output already follows its own active/current/canceled checks. Input is not deep-cloned or frozen at runtime.

```ts
interface ChildInput {
  caller: { accept(value: string): void };
  opener: HTMLButtonElement;
  parent: { key: string; signal: AbortSignal };
  request: { method: "GET"; zero: 0; enabled: false; empty: null };
  context: { locale: string; scope: string };
}

// parentContext is the parent PageContext; input.parent is metadata.
const child = mountPage<ChildInput, string>(host, definition, input);
parentContext.own(() => child.dispose());
parentContext.own(child.onOutput(value => {
  if (!parentContext.signal.aborted) input.caller.accept(value);
}));
await child.ready;
```

The input interface and parent variable are application code. No global discovery or arbitrary framework metadata bag is needed for this interaction.[^page][^legacy][^popup-legacy][^documents-legacy]

7. Add one focused browser file with fifteen candidate cases: seven direct cases and four null/undefined pairs. Cover factory/getter capture, strict plain invocation and class receivers; invalid factories/results; consistent live views and getter reentry; concurrent/rapid reload and stale output; continued cleanup and shared disposal failures; pending-init disposal/reload; failed-init aggregation; actual Popup/Documents children in two independent parent scopes. Explicitly mark strict test functions created inside page.evaluate so sloppy serialized callbacks do not create a false receiver failure.
8. Extend the existing installed checkPageLoading rather than building another application. Retain communicator/parser/cancel/template checks; add captured factory, live view, class lifecycle, input/output identity and reentrant undefined cleanup rejection. Extend the existing TS consumer with typed metadata/class controller usage and the packed checker with exact results. Keep the DOM-free JS consumer unchanged. Derive collection, archive and declaration counts from actual frozen inputs rather than this proposal.
9. Freeze inputs and independently review connected source/callers. Root runs strict source/example/installed TS checks, units, focused and complete Chromium/Firefox/WebKit suites, one actual archive installed in JS/TS and all five browser paths, and the original thirty performance budgets. Retain every attempt, original fixture, parent receipt and exact case identity; do not reuse historical passing credit.
10. Update current/stage/batch plus implemented page/container/migration contracts, indexes and dated log together. Independently review source, recorded raw bytes and final semantic bodies. Require changed/full docs checks with zero errors/warnings, independent final acceptance and a separate commit/push before M3.5. Derive exact semantic scope from actual changed bodies; avoid adding an unnecessary reverse source edge to feature-parity-plan.

# Next action

Save and push the separately verified M3.4 checkpoint, then implement M3.5 from its own written scoped-configuration contract. Keep every later owner and inherited limitation explicit; do not expand this common page change into a metadata registry.[^registry][^baseline]

# Decisions

- No public API, type, entry, dependency, controller registry, general metadata object or services engine is added.
- One common page owner implements the change; Popup/Tabs/Documents keep their existing ownership and forwarding. Lifecycle readiness still includes activation; retained/preloaded/stateless policy remains M7 work.
- An ordinary initialization error plus cleanup failure keeps the existing PAGE_DISPOSE/AggregateError structure: original init error, then normalized first cleanup error. Cancellation keeps ready's AbortError and separately reports cleanup through the initiating disposal/reload.
- Creation/capture and intended live view reads are distinct. Broader scoped configuration remains M3.5; do not generalize this stage to all option objects.
- Root Apache-2.0, preserved v1/LGPL, original evidence and benchmark fixtures remain. Only exact O01–O05 omissions are approved. No whole-family, release, npm, tag, master/archive or v1-cleanup closure follows.[^omissions][^registry]

# Verification log

Cache-only preflight and the original revision remain preserved. Applied source/caller/draft review passes independently. Fifteen new cases and all 891 parent cases pass in each full 906-case engine suite; the 62-case focused suite passes in all three engines. Twenty-three retained attempts include seven development records and sixteen latest canonical groups, with no current failed attempt. The same 207 frozen inputs pass 155 units, strict source/example and installed TS, actual JS/TS installation, installed Chromium/Firefox/WebKit/Chrome/Edge and the unchanged thirty performance budgets with sixty raw medians and 300 durations.

The exact 203-file archive is bc89851fb0ab02b069188f3df678f6e9ee76ab724e4f89898d0a58be0facfeff; all forty declaration files remain byte-identical to M3.3. Independent raw and final semantic reviews accompany actual changed/full document checks. The immutable source/focus snapshot retains its pending-at-capture fields; the separate m34-verification.json wrapper records later completion. Parent native/Tree/date/Edge limits and all other stage owners remain open.

# Open questions

No new metadata API is justified by the inspected caller graph. A later actual interaction that typed input/closures cannot express must be recorded before expanding the contract. M3.5 configuration, M7 activation/container policy and M12 shell metadata/capacity retain their owners. Selected M3.4 evidence does not close later configuration, Form, shell, whole-family or release obligations.[^registry]

[^page]: Common page generation, input, output and cleanup owner
[^legacy]: Legacy request attributes and controller initialization
[^popup-legacy]: Legacy Popup caller and opener context
[^documents-legacy]: Legacy Documents caller and document options
[^registry]: Fixed M3.4 metadata and lifecycle outcomes
[^baseline]: Accepted M3.3 common HTML loading checkpoint
[^omissions]: Only O01–O05 are approved exclusions
[^popup]: Definition forwarding, modal result and child page cleanup
[^pages]: Shared retained page and disposal ownership
[^tests]: Existing concurrent page, cancellation and root ownership checks
[^installed]: Existing installed page loading and communicator witness
