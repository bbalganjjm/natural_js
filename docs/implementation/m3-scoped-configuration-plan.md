---
type: Plan
title: Natural-JS 2.0 M3.5 scoped configuration and captured ownership
description: Keep one Rows and base URL owner while supporting explicit live locale and message providers on existing UI instances.
tags: [meta, plan, cvc, configuration, validation, migration]
status: draft
sources:
  - id: baseline
    resource: evidence/m34-verification.json
    title: Accepted M3.4 page metadata and lifetime checkpoint
    git_blob: 3cbefd65d0ab001aee361b5bd2a963d530699f11
  - id: registry
    resource: evidence/remaining-work-plan.json
    title: Fixed M3.5 scope and remaining component owners
    git_blob: a18ff58091c2eb8d8050ba8222d6b3285a078a11
  - id: omissions
    resource: omission-decision.md
    title: Only O01–O05 are approved exclusions
    git_blob: 3480707796d751619a98ae094b61a294d63e74af
  - id: legacy
    resource: ../../v1/src/natural.architecture.js
    title: Legacy scoped context references and updates
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
  - id: locale
    resource: ../../v1/src/natural.data.js
    title: Existing-instance validation reads current locale and messages
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
  - id: communication
    resource: ../../src/comm/index.ts
    title: Captured communicator callbacks and repeated base URL reads
    git_blob: 9fa5534fcaa71e390603e0523e3a415bd564d98c
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid render, edit and subscription owner
    git_blob: 09718101d01218f9b891e37efce4ab5dd5dfada3
  - id: selection
    resource: ../../src/ui/grid-selection.ts
    title: Connected Grid selection and check data owner
    git_blob: 219727ea3f2526fc4722eaaa2725ebfc3c361f13
  - id: list
    resource: ../../src/ui/list.ts
    title: List render, selection and subscription owner
    git_blob: 6e21dcc210683adc4e790f3ba4fd0bf720da6347
  - id: tree
    resource: ../../src/ui/tree.ts
    title: Tree graph and subscription owner
    git_blob: f9984fcd70da26da37d5dbdc0f2960fcc5efa36d
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Literal rule snapshots and generated-message resolution
    git_blob: 2971c8dc0dfdacaef95c92b137a231297fc6c14e
  - id: api
    resource: ../../src/ui/index.ts
    title: Existing RuleSet locale and messages fields
    git_blob: 539621049109c0b416b33081e134dc6c6621aedf
generated: { by: codex/gpt-6, at: 2026-11-14T20:09:48Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T20:09:48Z }
---

# Goal

Keep each bound component connected to its original Rows, capture communicator baseURL at creation and restore actual existing-instance locale/message updates through two explicit synchronous RuleSet providers. Use ordinary application objects, forwarding functions and native Maps for separate scopes. Add no registry, deep merge, general utility engine or public type.[^registry][^legacy][^locale]

# Checkpoint

This plan is written before source application from accepted M3.4 commit fd5c66a507b140b8648907759395204ac4fe69d6. The source application gate remains independent. At the written-plan checkpoint, proposed runtime, unit, browser and installed-consumer changes had not run. The M3.4 controller/loader capture, live per-generation view and cleanup contracts remain unchanged.[^baseline]

Current Grid/List/Tree subscribe to the original options.rows but later reread the option; Grid's private selection/check owner does the same. Replacing that property can redirect reads or edits while the old store still drives notifications. Communicator rereads options.baseURL twice per request. RuleRunner snapshots literal locale/messages, whereas the legacy validation path reads current locale/messages for existing instances. These are the bounded implementation gaps.[^grid][^selection][^list][^tree][^communication][^rules][^locale]

# Steps

1. Recover clean pushed M3.4 and its immutable receipts, source maps, actual package and fixtures. Inspect every affected data/message owner and retain all preceding page/cancellation/callback rules. Accept the representative code and precise timing below before source GO.
2. Capture one sourceRows in each Grid/List/Tree binding. Read, subscribe, render, edit, validate, select and dispose through it. Pass that exact Rows explicitly into createGridSelection; do not spread the original options or read its getter again. Keep component-specific callbacks and live option policies in their fixed owners. A different store needs the documented owner/rebind route, not options mutation.
3. Read communicator baseURL once during creation and clone its value with native new URL. Original URL mutation, option replacement/deletion or later absent-property addition cannot retarget an existing communicator. Invalid supplied URL data becomes REQUEST_OPTIONS at creation with cause. Preserve dynamic native fetch and captured prepare/after/send, request-local options, response/error/cancel behavior.[^communication]
4. Expand only the values of existing RuleSet.locale and messages. Do not add a public type, field, update method, registration table, dependency or entry point.[^api]

```ts
interface RuleSet {
  // Existing format, validate and fields remain unchanged.
  locale?: string | (() => string);
  messages?: Record<string, string> | (() => Record<string, string>);
}
```

5. Read each supplied literal/function once at RuleRunner creation. Literal locale and validated own message entries remain snapshots. Capture provider references and invoke them plainly with no arguments, locale then messages, once per generated failed-rule message. Passing/optional blank validation and a custom validator's own nonempty message bypass providers. Bound functions retain an explicit binding; ordinary strict functions observe undefined this. Do not sweep other callbacks or change private call.run.
6. Keep existing locale mapping: case-insensitive ko prefix selects ko_KR, every other primitive string selects en_US; absent literal locale uses en_US. Invalid literal settings fail creation with RULE_DECLARATION. Providers must synchronously return a primitive locale string or a non-null, non-array message object of own enumerable string entries. Reuse normalized keys, duplicate/nonempty-message checks and placeholder substitution. Reject Promise/thenable results; drain only those invalid asynchronous results locally so rejection does not become an unrelated unhandled error. Do not await or support asynchronous policy.
7. Provider throw or invalid output becomes RULE_FAILED at the current API/field/rule with cause. Preserve valid fallback: rule-key override, built-in message for current locale, then nonempty field/rule text. No invalid provider silently becomes a default. Read whole message maps afresh on each generated issue; in-place application updates must remain visible. No repaint, subscription, map-identity cache or whole-validation snapshot is added. A policy error does not transfer disposal ownership.
8. Execute a two-scope application recipe inside two actual mountPage owners using plain typed objects, explicit presets, formatter/service forwarding and native Map. Each controller owns its live/fixed Forms and Rows through PageContext.own. One scope's changes must reach its existing live Form while literal Forms and the sibling page/scope keep their policies. An early Form close uses the same registered application disposer; later page closure removes its replacement by identity. Preserve zero/false/null data and supported local defaults; do not deep-clone Rows, roots, services, custom arguments or unrelated business values.

```ts
interface Employee { name: string }
const scope = {
  locale: "en_US", messages: {} as Record<string, string>,
  defaults: { autoValidate: false },
  rows: createRows<Employee>([{ name: "" }]),
  service: createCommunicator({ baseURL: new URL("/api/", location.href) }),
  handles: new Map<string, FormHandle<Employee> | undefined>()
};
const rules: RuleSet = {
  locale: () => scope.locale,
  messages: () => scope.messages
};
const form = bindForm(root, { ...scope.defaults, rows: scope.rows, rules });
scope.handles.set("detail", form);
page.own(() => {
  if (scope.handles.get("detail") === form) scope.handles.delete("detail");
  form.dispose();
});
const load = () => scope.service.request({ url: "employees", signal: page.signal });
```

Applications create one such object per scope. Native Map.has distinguishes missing from stored undefined; enumeration does not transfer ownership. An old cleanup deletes only its exact entry. Explicit forwarding chooses the current service per invocation; capture the service into a local variable before await if one whole application operation needs that snapshot.[^legacy]

9. Add eight unit candidates and five browser candidates. Cover base getter/URL/options changes, absent and invalid bases, static versus live message policy, provider getters/capture/plain invocation and ordering, custom string bypass, current fallback/placeholders and invalid/throw/async output. The deterministic cost witness performs 1000 valid validations with zero provider calls/map reads, then two failed generated messages with exactly two whole-map scans. It also checks the literal no-provider path after its creation copy; this is operation-count evidence, not a timing claim.
10. Exercise all three Rows binders with colliding IDs in two stores, frozen presets, option replacement, selection/edit/check ownership, original-store notifications and disposal isolation. Run the real two-page/two-scope Form/formatter/service/Map recipe: the first page's close removes its replacement handle, leaves the sibling page active, and both page closes leave no disposed Form registered. Check recovery/disposal after invalid live policy. Extend existing installed browser/TS/packed-checker paths against exact M3.4 consumer bases. Retain every M3.4 page-loading/lifetime witness; add no second demo application.
11. Freeze and independently review the connected source/callers and precise public unions. Root runs strict source/example/installed types, units, focused plus full Chromium/Firefox/WebKit, one actual archive in isolated JS/TS and all five installed browsers, and original thirty performance budgets. Derive every input/case/declaration/member/archive count from actual bytes and collection; no historical passing credit is reused.
12. Update current/stage/batch, rules.md (providers/errors/cost), comm.md (base URL), architecture.md (plain scopes/presets/Map/forwarding), Grid/List/Tree capture sentences and migration R04 boundaries, plus indexes and dated log. Reuse these existing concepts; only this stage plan is new. Record selected coverage and remaining boundaries. Independently review source, raw evidence and final semantic bodies; require zero changed/full docs errors/warnings and a separate commit/push before M3.6. Choose the exact semantic scope from actual body changes and avoid unnecessary source-of-source cycles.

# Next action

Save/push the separately verified M3.5 checkpoint, then finish the M3.6 bounded automatic-advice contract before source application. Keep all required automatic selection, later declaration, component-specific configuration and M5.18 outcomes; no additional omission is approved.[^registry][^baseline]

# Decisions

- Seven existing runtime modules change; no new runtime module is proposed. Two new test files and three existing installed paths provide the selected witnesses. Actual counts remain future evidence.
- The public expansion is exactly two existing RuleSet value unions. The private Grid selection helper receives its already-owned Rows explicitly; it is not a public entry point.
- Providers affect generated messages on the next validation/message invocation. Rule membership, global fallback, all retained catalogs/aliases/arguments/manual masks and custom call.run receiver behavior remain M5.18. No family closes here.
- Component-specific selection/action/text/date/factory policies retain their numbered owners. No framework service/context registry, implicit merging, generic translation map or broad callback-capture rewrite is added.
- Keep Apache-2.0 root, preserved v1/LGPL, evidence and benchmark fixtures. Only O01–O05 are excluded. No npm publication, tag, master/archive action, v1 cleanup, whole-framework or M13 closure follows.[^omissions][^registry]

# Verification log

Independent applied-source and eight implemented draft-contract reviews pass. The twelve owned paths retain their approved hashes: seven existing runtime modules, two new test files and three installed paths. Twenty-seven records include ten development attempts, sixteen latest passing canonical groups and one superseded full WebKit failure on the same 209 inputs. Strict source/example and installed TS, 163 units, 32 primary focused cases per engine and 911 latest full cases per engine pass, retaining all 906 parent browser cases and adding eight units/five browser cases. The first full WebKit run retains 910 passes and one page.goto connection failure in existing Grid progressive setup before framework imports. Unchanged 37-case Grid diagnostics pass in all three engines, followed by a complete unchanged WebKit pass. The original cause remains unknown; no source, fixture or configuration correction is claimed.

The exact 203-file archive 375b752ef05f77781bb671ce2001de5bc4bb5b1df4405f439d9114a34a03e7de passes JS/TS and installed Chromium/Firefox/WebKit/Chrome/Edge. The original thirty budgets retain sixty medians and 300 durations. Forty declaration payloads retain thirty-eight identical files; only UI RuleSet unions and the existing private Grid selection argument change. The deterministic policy witness verifies operation counts rather than elapsed-time savings. Independent raw/final semantic review and actual changed/full document checks accompany the selected acceptance. The immutable source/focus snapshot keeps pending-at-capture fields; m35-verification.json records later completion.

# Open questions

Broader configuration, component text/locale/declaration policies and M5.18 global fallback/catalog/manual-mask/callback obligations remain required. Selected source/runtime acceptance does not close those other owners or a whole family. No additional public mechanism is justified by the inspected caller graph.[^registry]

[^baseline]: Accepted M3.4 page metadata and lifetime checkpoint
[^registry]: Fixed M3.5 scope and remaining component owners
[^omissions]: Only O01–O05 are approved exclusions
[^legacy]: Legacy scoped context references and updates
[^locale]: Existing-instance validation reads current locale and messages
[^communication]: Captured communicator callbacks and repeated base URL reads
[^grid]: Grid render, edit and subscription owner
[^selection]: Connected Grid selection and check data owner
[^list]: List render, selection and subscription owner
[^tree]: Tree graph and subscription owner
[^rules]: Literal rule snapshots and generated-message resolution
[^api]: Existing RuleSet locale and messages fields
