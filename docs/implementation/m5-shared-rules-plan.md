---
type: Plan
title: Natural-JS 2.0 M5.1 shared field rules
description: Compile shared typed field rules through existing UI owners and separate automatic validation from explicit checks.
tags: [meta, plan, form, grid, migration]
status: draft
sources:
  - id: previous
    resource: m10-pinned-plan.md
    title: Completed pinned-column continuation
    git_blob: e2511cf1ea2b85556a64cfbc275f03f79d3420d9
  - id: baseline
    resource: evidence/m10964p-verification.json
    title: Preserved a0f837a runtime baseline
    git_blob: 8ef410d0a0f85316d1702db410da034a6a040b7e
  - id: rules
    resource: ../../src/ui/rules.ts
    title: Existing per-binder rule compilation and execution
    git_blob: a143951476286c0b66584ae57ea47932280d2ba2
  - id: types
    resource: ../../src/ui/index.ts
    title: Shared rule and UI contracts
    git_blob: 6dae7f254a9f274e495941fb84da08963f8f2db3
  - id: form
    resource: ../../src/ui/form.ts
    title: Form candidates, drafts and validation ownership
    git_blob: dfc469e9c118292c41e804b80ebcc563a1c6d26c
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Grid candidates, commit timing and validated paste
    git_blob: 5f4cc1b5a2b4df9f07bc1d43d3521cb653dcb8e1
  - id: list
    resource: ../../src/ui/list.ts
    title: Display List fields and explicit validation
    git_blob: 851b940ae5aa42f60dee1dbac6e98c433409b6f5
  - id: tree
    resource: ../../src/ui/tree.ts
    title: Tree formatter caller and validation boundary
    git_blob: 4a5cd095c2e4d2aa106f9c944365e50964b7e243
  - id: render
    resource: ../../src/ui/field-render.ts
    title: Existing display renderer preflight
    git_blob: 803eaea983b60a34972c563520038bd6e9b9c7cf
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Preserved fRules, vRules and automatic validation behavior
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: browser
    resource: ../../tests/browser/shared-rules.spec.ts
    title: Shared declarations, effective guards and ownership regressions
    git_blob: 161995ca8a9ef53b749fe810e66740493240c15e
  - id: automatic
    resource: ../../tests/browser/auto-validation.spec.ts
    title: Automatic policy, integrity and explicit validation regressions
    git_blob: 09f4fa7c192a1181a662ecb9f4f1cec082eeb78e
  - id: acceptance
    resource: evidence/m51-shared-rules.json
    title: Selected contract witnesses and retained obligations
    git_blob: d3db6b526ef5a5f276811fca21738371377da37a
  - id: evidence
    resource: evidence/m51-verification.json
    title: Frozen source, package, browser and performance gates
    git_blob: b6598f48a95787ff8c8842554d8d4386efa5ce2a
generated: { by: codex/gpt-6, at: 2026-10-31T04:19:48Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-31T04:19:48Z }
---

# Goal

Make one explicitly supplied rule bundle usable by Form, Grid and List, including reduced authored templates. Preserve CVC, HTML/CSS ownership, nested raw values, fast compiled binding, native accessibility and current atomic paste. Reuse the existing rule runner; add no global defaults, registry, extension engine or utility package.[^rules][^legacy]

# Checkpoint

Start at pushed a0f837a4f6dfa1cbc6a2b8205fe86f0df7b60528 on 2.0.0-alpha.0 with a clean tree. Independent read-only recovery matches 177 inputs, fifty logs, twelve manifests, sixteen latest final gates and all actual 183 package files. Historical runtime is not rerun or recertified.[^baseline]

# Steps

1. Add one public FieldRules interface and RuleSet.fields. Each field entry has optional format and validate lists of readonly [name: string, ...args: unknown[]] tuples. Keep existing rule-name function catalogs, messages and locale. No additional public helper, handle or entry point.
2. Compile typed declarations in rules.ts, using the same normalization, argument checks, custom overrides and errors as HTML. For each rule kind, a provided typed list wins; undefined falls back to HTML and [] clears that list. Native HTML constraints are independent. Compile/copy supplied lists once per binder, do not serialize them into DOM attributes, and do not mutate caller objects.
3. Allow valid unbound field entries so full/reduced templates can share one bundle. Validate field paths, declaration shapes, rule names and built-in arguments before acquiring UI ownership, including supplied unbound entries. Only own map entries participate. This is a rule schema, not an automatic field/widget generator.
4. Preserve group consistency for the effective source. An overridden HTML kind is ignored; an omitted kind retains existing group checks. Form/Grid/List native-control and Form/Grid renderer restrictions use compiled effective formatter presence. Tree uses the same formatter contract and rejects nonempty effective validation; general Tree validation remains required later.
5. Add autoValidate?: boolean, default true, to Form and Grid. False skips automatic HTML constraints/business validation at their existing edit commit points. Preserve parsers, JSON storage limits, native-value integrity, existing Grid choice identities, disabled/readOnly checks and typed raw values. Form keeps application-owned scalar choice conversion; do not silently impose Grid's typed row-option identity contract on it. Automatic evaluation invalidates prior constraint results for that row and displays only current integrity errors; explicit validation recomputes the complete result. Existing Grid validateOn controls timing independently; manual still defers edits. Explicit validate() and paste() still perform complete precommit checks. Do not add a no-op policy to the current read-only List.
6. Compose shared/local catalogs, messages, locale and per-field kinds with ordinary typed object spreads. Show the two nested merge levels explicitly. Do not introduce framework deep merging or callback combinators. Keep bind-value hooks, arbitrary global callback/default composition and old unvalidated-paste equivalence open for their owning review.
7. Demonstrate the shared field bundle in the existing Grid/detail CVC example and expose the new Grid option with authored controls. Add installed JS/TS coverage without creating a second demo engine. Update implemented API/migration/coverage docs with source, index, log and fingerprints together.
8. Verify declaration/override failures before DOM ownership, effective native/group/render guards, raw values/drafts and explicit validation, offscreen Grid/List validation, atomic paste, independent instances and quiet restoration. Independently review connected source/callers/tests/docs and fix concrete findings.
9. Run strict build/source/example types, meaningful units, full Chromium/Firefox/WebKit, one exact package in isolated JS/TS and all five Windows browsers, unchanged binding/viewport budgets and changed/full OKF checks. Preserve failed attempts and original historical evidence.

# Contract

~~~ts
const shared = {
  fields: { salary: { format: [["numeric", "#,##0"]] } }
} satisfies RuleSet;
const rules = {
  ...shared,
  validate: { salaryLimit: value => Number(value) <= 1_000_000 },
  fields: {
    ...shared.fields,
    salary: { ...shared.fields.salary, validate: [["minvalue", 0], ["salaryLimit"]] }
  }
} satisfies RuleSet;
const parse = { salary: (value: string) => Number(value.replaceAll(",", "")) };
const form = bindForm(root, { rows, rules, parse });
const grid = bindGrid(table, { rows, rules, parse, autoValidate: false });
// Normal Grid edits can commit a parsed value that violates salaryLimit.
// Both explicit checks still apply native constraints and declared validators.
const result = grid.validate();
~~~

Author only data-field and accessible labels/errors when rules live in TS. HTML rule lists remain supported. An application chooses the shared bundle and local overrides explicitly; the framework does not discover or globally register them.

# Next action

The selected implementation, sixteen frozen runtime gates and independent evidence/document review are complete. Next, plan incoming statuses/wire contracts at their existing data/communication owners, including retained deletion ordering. Compare preserved loading/save behavior with createRows/replace/changes/revert before defining a minimal public contract. Keep the current validated-paste contract and all unclosed owner obligations explicit.

# Decisions

- The user's continued-work request authorizes this selected continuation. It repairs the intended field-map workflow despite the legacy fRules/vRules forwarding defects.
- autoValidate names the automatic-only policy explicitly; it cannot be mistaken for disabling validate(). Its default preserves existing behavior.
- RuleSet.fields contains declarations; RuleSet.format/validate contain functions. The runtime never changes one into the other.
- Typed tuples can carry custom-rule arguments without JSON serialization. Their list and argument-array containers are copied during compilation; referenced argument objects remain application-owned.
- No full U01/G06/C11/C13 family closure or omission is inferred. Form raw choice/render mapping, List editing, Tree validation, bind-value hooks, global callback/default lifecycles, date attachment, incoming status/wire formats, remaining UI/CVC parity, P0 and M13 remain required.
- Root Apache-2.0 and preserved v1 LGPL stay separate. Work and authorized pushes remain on 2.0.0-alpha.0. No npm publication or release tag.

# Verification log

Baseline recovery, independent legacy/current caller audits and implementation are complete. Three added units and twenty-four browser cases cover the selected contracts. All sixteen final gates pass on the same 179 frozen inputs; twenty-six command records retain ten development attempts and sixteen final results without superseded final runs.[^evidence]

| Check | Result |
|---|---|
| Source | Build, strict source/example types and 127 units pass. |
| Full engines | 574 cases pass in each of Chromium, Firefox and WebKit without skips. The delta is eleven shared-rule, twelve automatic-policy and one existing-demo case. |
| Exact package | 183 actual files; 304369 packed / 1513593 unpacked bytes; SHA-256 57c14d906608ef425a4a30915fd9ba43f529896408662840993db8f9cf926769. Every payload and individual size matches the workspace. |
| Installed consumers | Isolated JS/TS and Chromium/Firefox/WebKit/installed Chrome/Edge use that same tar. Shared Form/Grid/List formatting, unbound declarations, bypass/explicit checks, full paste, parse preservation and quiet exact disposal pass. |
| Original budgets | All nine binding and twenty-one viewport budgets pass with unchanged fixtures. Sixty medians are recomputed from 300 durations. Flat 1,000-row initial/rebind are 23.0/22.1 ms against 30/35; nested-auto are 46.6/54.9 ms against 90/100. |
| Bounded ownership | The 5,000-row flat/nested scenarios mount at most fourteen physical rows, authored blocks at most twenty-four. Append medians are 20.2/17.9/33.6 ms against 100; existing raw identity/draft/anchor and quiet restoration checks pass. |
| Documents | Changed/full OKF checks pass: 68 concepts, five reserved files, zero errors/warnings. Twelve reviewed semantic concepts receive verified metadata; twenty-eight historical concepts preserve bodies and generated/verified dates with fingerprint-only updates. The initial index-description warning after the resume rewrite is retained separately and corrected. |

Independent design review corrected the grouped-number example to strip its display separators in the application parser and specified row-wide stale-error invalidation. Connected review preserves Form's application-owned scalar choice conversion rather than silently adopting Grid's typed-option identity semantics; full raw choice/render equivalence remains required. Browser development exposed one test assumption: Windows WebKit can implement an authored date as text. The corrected witness asserts that effective native behavior and still requires range-value integrity in every engine; the failed attempt is retained.[^browser][^automatic][^acceptance]

One useful public type and three option properties extend existing owners. No framework module, handle method, package entry, dependency, registry or general utility is added. The active plan now links completed history instead of repeating old runtime tables. Actual tokens and final fixed-agent comparisons remain unavailable; context size is a separate proxy, not a token claim.

Independent connected Ponytail review approves source, callers, examples, consumers and the twelve semantic concepts. A separate raw review checks all twenty-six logs, three input manifests, every actual package member, sixty medians from 300 durations, viewport/append/disposal ownership and all six inherited evidence hashes. The document-history receipt measures the active resume file's UTF-8 size separately from actual agent tokens. Historical runtime and full-family status remain unchanged.

# Open questions

Manual assistive technology and final fixed-agent/token evaluation remain unverified. Actual macOS/iOS Safari is excluded; available WebKit is mandatory. This slice does not add List editing, unvalidated paste or global rule/configuration discovery.

[^previous]: Completed pinned-column continuation
[^baseline]: Preserved a0f837a runtime baseline
[^rules]: Existing per-binder rule compilation and execution
[^types]: Shared rule and UI contracts
[^form]: Form candidates, drafts and validation ownership
[^grid]: Grid candidates, commit timing and validated paste
[^list]: Display List fields and explicit validation
[^tree]: Tree formatter caller and validation boundary
[^render]: Existing display renderer preflight
[^legacy]: Preserved fRules, vRules and automatic validation behavior
[^browser]: Shared declarations, effective guards and ownership regressions
[^automatic]: Automatic policy, integrity and explicit validation regressions
[^acceptance]: Selected contract witnesses and retained obligations
[^evidence]: Frozen source, package, browser and performance gates
