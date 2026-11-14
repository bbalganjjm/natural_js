---
type: Plan
title: Natural-JS 2.0 M3.6 automatic controller advice
description: Discover controller methods once before init and compose ordinary wrappers through one optional page contract while preserving cancellation and cleanup.
tags: [meta, plan, cvc, lifecycle, migration]
status: draft
sources:
  - id: baseline
    resource: evidence/m35-verification.json
    title: Accepted M3.5 configuration and captured ownership checkpoint
  - id: registry
    resource: evidence/remaining-work-plan.json
    title: Required M3.6 automatic interception and remaining owners
  - id: legacy
    resource: ../../v1/src/natural.architecture.js
    title: Legacy pre-init wrapping, nested method discovery and advice order
  - id: examples
    resource: ../../v1/docs/architecture/aop.md
    title: Existing automatic path, view and preparation workflows
  - id: page
    resource: ../../src/page/index.ts
    title: Common page controller, startup, cancellation and complete cleanup
  - id: errors
    resource: ../../src/internal/framework-error.ts
    title: Existing coded error and cause contract
  - id: shell
    resource: ../../examples/vite/m4/main.ts
    title: Actual employee page startup and close owner
  - id: employee
    resource: ../../examples/vite/m4/employees.ts
    title: Existing employee bindings, search and save-refresh behavior
  - id: omissions
    resource: omission-decision.md
    title: Only O01-O05 are approved exclusions
---

# Goal

Preserve automatic controller method selection before init, including nested plain-object methods and native path/view/custom predicates. Compose before, after, around and error behavior with ordinary functions rather than a new string interpreter. Keep synchronous results synchronous, preserve deliberate repeated or delayed proceeds and use the common CVC startup/cleanup owner in every container.[^registry][^legacy][^examples][^page]

# Checkpoint

This plan is written before project source application from saved and pushed M3.5 commit 99aef8b0ce2897dbcd20fcf5cae4a80b6baa4450. M3.5 retains 209 inputs, 163 units, 911 latest full cases per engine and its original unexplained WebKit setup failure. Its runtime/source/evidence and original fixtures remain immutable.[^baseline]

The first cached employee-only composer was insufficient: one manually routed search wrapper did not retain automatic discovery or intercept every call through the owning method. It remains a preserved proposal, without runtime or omission credit. The replacement contract adds one optional PageDefinition field and one exported page type. Independent contract/source review remains required before actual application. No compiler, project test, browser or benchmark has run for M3.6.[^registry][^legacy]

# Steps

1. Recover the clean pushed M3.5 checkpoint. Read the legacy automatic wrapper and actual controller callers, current page lifetime and employee startup. Keep exact O01-O05 exclusions; automatic interception is required and is not one of them. Correct one existing ownership defect in this runner: validate a generated root and host before storing current.root, so a rejected factory cannot remove another page's connected element. This defect predates advice and changes no public API.[^omissions][^examples][^page]
2. Add PageAdvice only to the existing page entry and one optional advice array on PageDefinition. Capture the array and each match/wrap function once at mount creation. Undefined/empty advice performs no discovery or ownership claim. Preserve existing captured controller/loadHtml and live per-generation view contracts.[^page]

```ts
interface PageAdvice<Input = unknown, Output = unknown> {
  readonly match: (path: string, owner: object, page: PageContext<Input, Output>) => boolean;
  readonly wrap: (
    proceed: (...args: unknown[]) => unknown,
    path: string,
    owner: object,
    page: PageContext<Input, Output>
  ) => (...args: unknown[]) => unknown;
}
// Added to PageDefinition<Input, Output>:
// advice?: readonly PageAdvice<Input, Output>[];
```

3. Use one private page-owned interceptor implementation. After creating the controller and before init, discover own enumerable string methods recursively through plain objects; include root class lifecycle methods without changing their receiver. Skip ES class constructor values, nonplain child objects and the current framework PageContext itself. This prevents a public class context field from making own/output intercept themselves. Ordinary application input aliases retain the normal graph contract. Do not add constructor probes, a Proxy, a global registry or an asynchronous controller factory. Read enumerable accessors once; reject a selected nonreplaceable slot rather than silently corrupting it.
4. Stop cyclic edges. Consider finite alias paths and group targets by physical owner/key. Each declaration selects at most one alias path per slot, in stable order; later declarations wrap earlier ones. Unmatched method identities and descriptors stay unchanged. Recheck captured own/prototype descriptors before replacement: a callback's newer method must survive a stale-install failure.
5. Validate match and wrap results synchronously, invoke both factories and produced wrappers plainly, and drain invalid asynchronous results. A lexical proceed calls the captured method with its original owner through Reflect.apply. A non-async forwarding function preserves immediate return/throw and false/null/zero/undefined. Applications write explicit await/try/catch when their selected action is asynchronous; no four-kind advice dispatcher or inferred Promise conversion is added.

```ts
const definition: PageDefinition = {
  view,
  controller: createController,
  advice: [{
    match: path => /^actions\./.test(path),
    wrap: proceed => (...args) => {
      before(args);
      try {
        const result = proceed(...args);
        after(result);
        return result;
      } catch (cause) {
        return recover(cause);
      }
    }
  }]
};
```

The sample names belong to the application. Its wrapper targets synchronous methods; async wrappers explicitly await proceed and any async after/recovery. A wrapper may omit proceed, replace arguments/results or call it more than once. Native RegExp, root.matches and typed closures express path, view and custom selection without string parsing.[^examples][^page]

6. Guard only owned root init/activate invocation and proceeds against an aborted page. Arbitrary actions retain their declared cancellation behavior and explicitly check the page signal after awaited work. Common untilAbort still settles readiness promptly. Root deactivate/dispose and nested cleanup remain callable after abort; no guessed cleanup names or async cleanup-depth bypass is added.
7. With nonempty advice, claim the controller before adopting it. A second page must not dispose another page's already-live controller after an ownership rejection. Reject already-claimed discovered method slots even when the second page's own match would be false. Use private weak lifetime claims; applications forward to genuinely shared services through fresh page-owned methods.
8. Keep full and partial installations through controller cleanup and every owned callback. Restore this page's replacements by identity only after ordinary cleanup, then release restored claims. Preserve callback-created replacements. Continue cleanup and keep M3.4's first failure, including null/undefined. If an owned wrapper cannot be restored, retain a blocked weak claim to prevent a later page from adopting stale context; no public reset mechanism is added. Method slots must remain replaceable until release.
9. Use PAGE_ADVICE with api mountPage for declaration/discovery/match/wrap/install/restore failures. Report phase, declaration index/path when known and cause. Leave ordinary intercepted user throws/rejections unchanged so outer error wrappers receive the actual cause. Existing Page startup and cleanup normalization retains its own boundaries.[^errors][^page]
10. Refactor the existing employee controller into a synchronous factory with stable public actions present before init. Async init awaits a validated page-size catalog, checks cancellation, then constructs existing bindings. Public actions forward to the initialized private implementation; a premature call rejects explicitly. Initial/native search and save-refresh all use the same public action property. The shell exposes Close during preparation. Use one asset-referenced JSON resource and PageDefinition.advice for the actual trim-search policy; discard the unapplied redundant employee-only wrapper module.[^shell][^employee]
11. Prove automatic own/nested/new pre-init selection without per-method assignments, native predicates, aliases/cycles, class receivers and constructor identity, descriptor errors, no-advice fast path, declaration capture and invalid results. Prove sync/falsy results, ordered async/error wrappers, zero/one/multiple/delayed proceeds, canceled startup, cleanup after abort, partial restoration, callback mutation and cross-page claim conflicts. Keep both existing employee HTML layouts, search/save UX and pending-preparation closure.
12. Independently review the complete cache manifest, actual written plan and connected caller changes before source GO. Apply only owned source/test/installed paths, then freeze. Root runs strict source/example/installed types, units, focused and complete Chromium/Firefox/WebKit, one actual package in JS/TS and five installed browser paths, plus original thirty performance budgets. Derive all counts and declaration/archive deltas from actual output; retain failed attempts and fixtures.
13. Update implemented page/employee/architecture/migration contracts as draft docs together with current/stage/batch, indexes and dated log. Independently review applied source, recorded raw bytes and final semantic bodies. Require actual changed/full docs checks with zero errors/warnings and a separate commit/push before M3.7.

# Next action

Complete the bounded contract co-review and exact joint cache manifest. Confirm the actual employee action graph exists before installation. Apply only after source GO, preserve every M3.5 input/receipt and continue the authorized separate-stage queue through M5.20.[^registry][^baseline]

# Decisions

- One optional PageDefinition field and one exported PageAdvice type; one private CVC owner with no public registration or extension engine.
- Automatic discovery is required. Native application wrappers replace the old advice-kind interpreter while retaining before/after/around/error capabilities.
- Keep the controller factory synchronous. Existing page ownership handles preparation, cancellation, partial failure and complete cleanup.
- Restore after all ordinary cleanup, including partial-install failure. Keep stale user replacements and reject unsafe cross-page reuse.
- Root Apache-2.0, preserved v1/LGPL/master, raw evidence, ignored legacy lockfile and benchmark fixtures remain. Only O01-O05 are excluded. No npm publication, release tag, master/archive change, v1 cleanup or full-family/M13 closure follows.[^omissions]

# Verification log

The saved employee-only R2/R3 proposals have zero runtime credit. Independent source review identified unmatched-identity, automatic-scope and preparation-timing gaps; the common match/wrap contract resolves them before project application. Contract review additionally requires deferred partial restoration, descriptor rechecks and explicit failed-restoration/cross-page ownership rules. Source preflight found that release must recognize earlier owned wrappers after a later replacement fails, and that discovery must exclude the current PageContext identity. It also found the preexisting early DOM-adoption defect; add one regression proving a failed factory preserves another page's root and event/output lifetime. These corrections require focused witnesses before source GO. Actual runtime/package/type/case/document results remain pending.

# Open questions

No new omission is requested. The final manifest must bind this plan, exact source/callers and the agreed ownership order before implementation. M3.7 declaration assembly and every later Form/UI/shell owner remain independently required.[^registry]

[^baseline]: Accepted M3.5 configuration and captured ownership checkpoint
[^registry]: Required M3.6 automatic interception and remaining owners
[^legacy]: Legacy pre-init wrapping, nested method discovery and advice order
[^examples]: Existing automatic path, view and preparation workflows
[^page]: Common page controller, startup, cancellation and complete cleanup
[^errors]: Existing coded error and cause contract
[^shell]: Actual employee page startup and close owner
[^employee]: Existing employee bindings, search and save-refresh behavior
[^omissions]: Only O01-O05 are approved exclusions
