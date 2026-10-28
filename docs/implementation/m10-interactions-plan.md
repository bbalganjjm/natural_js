---
type: Plan
title: Natural-JS 2.0 M10.9.6.2 interaction and view controls
description: Add explicit selection toggles, applied distinct-value search and authored column recovery and action-scroll compositions.
tags: [meta, plan, grid, interaction]
status: draft
sources:
  - id: evidence
    resource: evidence/m10962-verification.json
    title: Frozen interaction inputs, installed artifact and measured gates
    git_blob: b028ab8ee7b6e9c4d23a783164633c3e60202278
  - id: toggle-tests
    resource: ../../tests/browser/grid-toggle.spec.ts
    title: Native toggles, veto, reentrancy, identity and teardown
    git_blob: 12977459c39dd2231fd215d7fa8fd47e651619c1
  - id: filter-tests
    resource: ../../tests/browser/grid-filter-apply.spec.ts
    title: Applied search, zero counts, cache guards and callback ownership
    git_blob: 3b343f4fd1a39c9ca575972bf980f74b4d8bf6cf
  - id: demo-tests
    resource: ../../tests/browser/m10-interactions.spec.ts
    title: Authored recovery and action-scroll acceptance
    git_blob: 50f57efa2deec6db6ee90b18890c6242fd69a5f3
  - id: parent
    resource: m10-closure-plan.md
    title: Required semantic slices and boundaries
    git_blob: 9297be6a74038feb050264600576c87da31ff697
  - id: audit
    resource: evidence/m1096-grid-audit.json
    title: Immutable complete Grid planning snapshot
    git_blob: 97f72ec88280d4cbcb49d737909f7d78d709825f
  - id: legacy
    resource: ../../v1/src/natural.ui.js
    title: Selection, filter, chooser and action-scroll behavior
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
  - id: grid
    resource: ../../src/ui/grid.ts
    title: Authored events, filters, reveal and lifecycle
    git_blob: 625fc54b599da36705208cb7ad4df45029e619c4
  - id: selection
    resource: ../../src/ui/grid-selection.ts
    title: Atomic active and selection-set transitions
    git_blob: 1b74c39d3161345aec1c9d0c3dd9de49c947f23d
  - id: filters
    resource: ../../src/ui/grid-filters.ts
    title: Typed choices, counts, caching and filter writes
    git_blob: a9a6604b72bf9077bf8cbf8f8db91bf0c774f7a8
  - id: columns
    resource: ../../src/ui/grid-columns.ts
    title: Existing layout validation and restoration
    git_blob: 874fca4953ffe70a2ef3b8e7001968da66bf89c4
generated: { by: codex/gpt-6, at: 2026-10-24T11:11:24Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-24T11:11:24Z }
---

# Goal

Complete the selected G08/G09/G12/G14/G15 interaction outcomes through existing owners. Keep authored HTML/CSS, native keyboard behavior, separate active/selected/checked identities, CVC, one Rows store and the existing column/reveal contracts. Add one boolean option and one authored Apply marker; use tested application compositions for chooser and scrolling. Do not close whole families or silently remove remaining row-wide activation, callback, progressive or cross-owner behavior.[^parent][^audit]

# Checkpoint

M10.9.6.1 is pushed at 1a0ca43. Independent recovery matched all 164 normalized inputs, 22 raw command logs, eight development logs and their receipt, sixteen final passing gates and all 183 actual archive members. The artifact SHA-256 is 27bcaca82b1d55b8be2b4f792f76c611eea0139254df2a19f16d57a36948da3a; packed/unpacked bytes are 287463/1418798. This restores historical evidence without rerunning or recertifying it. Work stays on 2.0.0-alpha.0; master/v1, license scope, publication and release tags remain unchanged.

# Steps

## Public contract before implementation

1. **Selection:** add toggleSelection?: boolean, default false, beside multiple. True changes only an unmodified authored select-button activation, including native Enter/Space clicks: single same-ID activation clears active; multiple toggles only the clicked membership, activating an added row and setting active to null when removing any member. Other members and checks stay unchanged. Ctrl/Meta/Shift/Alt gestures retain their existing behavior; programmatic select/setSelected remain absolute and idempotent. Reuse changeSelection for atomic veto, stale-transition rejection and post-commit callback behavior. Strict boolean validation uses GRID_SELECTION before DOM ownership.[^selection][^legacy]
2. **Distinct choices:** retain all scalar values from status-projected rows passing the manual whole-row filter, in first occurrence order. Counts additionally apply other column filters, excluding the queried column and paging. Preserve zero-count choices and existing explicit selections; do not disable them or drop them automatically. Keep typed raw scalars, immutable cached results, validation and no-op behavior. Value/label functions remain synchronous pure functions; locally reject stale choice publication after a one-shot mutation of Rows/manual/column state rather than claiming general callback transactions.[^filters]
3. **Apply search:** existing data-filter-search input continues preview-only. An authored type=button with data-apply-filter="team" opts into replacement of that complete column filter with matching raw choice values. It requires one corresponding native search/text input and a configured key. Nonblank query uses existing case-insensitive literal label matching; no match means [], blank/whitespace means null and clears the input after successful application if the completion callback has not replaced its query or ownership. Native plain Enter applies only when an enabled matching Apply button exists. Ignore composing/modifier/disabled cases and prevent form submission only when applying. Existing data-clear-filter keeps its search-preserving contract. Preparation failure retains prior filter/view; post-commit notification failure retains committed state.[^grid][^filters]
4. **Column chooser:** compose authored labeled native checkboxes, All, mixed state and visible/total output with columns(), setColumns() and onColumnsChange. The demo provides a separate actions/recovery column omitted from business-column choices; chooser writes always retain that column. All business columns may hide, then recover from the still-visible chooser/actions. Keep the existing all-physical-columns-hidden rejection. Preserve widths/order/group topology, focused nodes/drafts, callbacks, invalid-layout rollback and independent instances. No public chooser component/root option, registry or generic utility is needed. The legacy numeric count element was unwritten; the new authored output reports actual shown/total business columns.[^columns][^legacy]
5. **Action scroll:** use existing reveal(id,{block}) only after successful application actions and visible-page identity checks. Selection/checks center the last requested stable ID after verifying the complete intended resulting state; veto/failure does not scroll. Indexed insert centers; front/end insertion reveals start/end. Append reveals the last newly loaded visible-page ID at end only for a nonempty prior store and nonempty batch. Opt-out preserves scroll. Last-invalid policy uses the last issue row in current visual page order, with first-invalid core reveal disabled, and preserves focus. Skip offpage/filtered IDs rather than changing page/filter. These recipes stay application-owned; no auto-scroll option or second runtime.[^grid][^legacy]

Representative use keeps declarations small:

~~~ts
const grid = bindGrid(table, { rows, multiple: true, toggleSelection: true,
  filters: { team: { value: row => row.team } } });
// Application UI composes grid.columns()/setColumns() and a retained actions column.
~~~

~~~html
<label>Team search <input type="search" data-filter-search="team"></label>
<button type="button" data-apply-filter="team">Apply matches</button>
<label>Teams <select multiple data-filter-column="team"></select></label>
~~~

## Change order and acceptance

1. Independently review this contract against legacy and current callers before code.
2. Implement selection through its existing private owner and independent gesture/veto/reentrancy/native-keyboard tests.
3. Implement zero-count choice calculation and Apply/Enter through current filter/header owners; preserve search preview, raw types, manual/status scope, failure boundaries, teardown and source-local stale-result checks.
4. Extend the current all-options demo with toggle policy, applied search, authored chooser/recovery and opt-in action-scroll recipes. Cover native keyboard, counts/mixed state, all-business-hidden recovery, sorting/page/status/viewport, draft/focus retention, veto and independent instances. Keep source models and original benchmark fixtures unchanged.
5. Extend actual installed JS/TS/browser consumers and draft API/migration/demo/architecture documents, indexes, log and coverage. Freeze inputs; run strict build/types/example types, units, complete Chromium/Firefox/WebKit, the same inspected archive in JS/TS and all five Windows browsers, original binding/viewport budgets and changed/full docs. Independent source/API/archive/evidence/document review precedes verified stamps and authorized commit/push.

# Next action

The implementation and sixteen frozen runtime gates are complete. Independent source/API/evidence/document review approves this slice. Specify M10.9.6.3 progressive rendering/completion. Keep M10.9.6.4 semantic acceptance, other component/CVC parity, P0 and M13 whole-code ponytail-review/remediation required.

# Decisions

Share existing selection transitions, filter state, column layout and reveal behavior. New rules live at actual owners; authored business labels, presentation, scroll policy and whole-row predicates stay application code. Add no dependency, public utility bundle, new named state type or generic registration layer. Preserve first-class keyboard/focus/unique-ID MDI and measured bounded DOM.

# Verification log

Three independent read-only audits approved this contract before code. The selected implementation adds fifteen toggle cases, eighteen filter cases and thirteen demo cases, with the preceding twenty-four demo cases unchanged. Source/example type checks pass after emitting current declarations. Fresh frozen runtime/package/performance gates are complete and independently reviewed; changed/full documentation checks pass. Prior evidence remains unchanged.

Development checks retain their own input maps and exit codes. The first 53-case core run passed 49 and failed four fixture assertions: an extra authored Select option changed generated-only counts, and a second fixture lacked its required numeric parser. Corrected fixtures preserve the intended assertions; the 55-case rerun passes. Independent review also found and closed enabled-Apply lookup and post-completion disposal/query-ownership edges with regressions. A 92-case run passed 91 and identified one wrong descending-name fixture expectation; the corrected test explicitly distinguishes visual request order from canonical checked-ID order. A development example-type check initially used stale emitted package declarations after a no-emit source check; emitting the current build before that check resolves the tool-order issue. None of these development attempts certifies final inputs.

## Frozen runtime, installed package and performance

Build, strict source/example types and all 124 units pass. Full Chromium/Firefox/WebKit suites pass 448/448 each, including 46 new cases (15 toggle, 18 filter, 13 demo); the existing 24-case demo suite remains unchanged. Related Chromium checks pass 92/92 before the final freeze. JavaScript, TypeScript and all five Windows browser consumers pass the same unpublished 183-file tarball, SHA-256 9beeca3a827f1efde3c5d01911b125a2d1d4d142b186689a01df06de5377df6b, packed/unpacked 288930/1426995 bytes. Actual members match the frozen workspace. Five package entry points and zero runtime dependencies remain unchanged.[^evidence]

All sixteen final gates share 167 normalized source/configuration fingerprints with exit zero and unchanged inputs. The 28 command records preserve twelve development attempts separately, including fixture/tool-order failures and the first moving-source observation; they do not certify final inputs or reconstruct unavailable interim files. The immutable semantic audit retains its 7a36a39 baseline, 89 entries, 17 dynamic groups, twenty open families, thirty contracts and no approved omission. It is not rewritten as current completion evidence.[^evidence]

All original fixtures, operations, warmups, five samples and budgets remain unchanged. Sixty medians are recomputed: flat 1,000-row initial/rebind is 22.5/22.9ms against 30/35ms; nested-auto is 51.7/57.7ms against 90/100ms. Viewport flat/nested/two-tr append medians are 22.1/19.8/37.2ms, with at most 14/14/24 mounted physical rows. Final append, anchor/focus/data retention and cleanup cover 5,000 to 5,250 records. These same-host observations do not establish universal speed, heap retention or actual token savings.[^evidence]

## Review and work cost

Independent source reviews approve existing selection/filter/header ownership, exact callback failure boundaries and the authored recovery/scroll compositions. The source fixes for enabled-button lookup, post-completion disposal and newer query/owner preservation have focused regressions. An independent eleven-concept review covered 296,346 file bytes at that review plus README 6,888 bytes; source citations, defaults and centered last-invalid policy agree with code. These file-byte counts are a review-input proxy, not actual context or tokens. Independent source/receipt review reproduces all 167 inputs, 28 raw-log hashes and twelve development records versus sixteen final gates. A separate archive/performance review reproduces every actual member, all sixty medians and thirty unchanged budgets, fifteen append/cleanup samples, 300 scroll windows and the canonical audit/source hashes. No historical runtime result is rerun or recertified; changed/full OKF checks pass with 62 concepts, five reserved files, zero errors and zero warnings.

Runtime edits stay in three existing owners: 52 added/five removed source lines against 1a0ca43. One boolean and one authored marker extend public use; there is no new named public type, framework module, dependency, chooser component, utility bundle or generic registry. The demo derives state from existing handles and uses the existing CVC detail page and completion callback. Fixed equivalent-agent tasks and actual token telemetry were not rerun. The rest of .3/.4, other parity, P0 and M13 remains required.

## Documentation closure

Eleven reviewed semantic concepts receive verified metadata. Thirteen historical concepts preserve exact bodies and generated/verified dates, with source fingerprints refreshed only. The document-history receipt and changed/full checker logs preserve this distinction. Indexes, log and source/test links describe the selected current contract. Full semantic closure, .3/.4, other parity, P0 and M13 remain required; no omitted feature, registry publication or release tag is recorded.

# Open questions

Row-wide activation and full callback/default equivalence remain required under .4; progressive timing/completion belongs to .3. Actual macOS/iOS Safari is excluded. Manual assistive technology, OS IME/clipboard and final equivalent-agent/token evaluation remain unverified. No feature omission, npm publication or release tag is approved.

[^parent]: Required semantic slices and boundaries
[^audit]: Immutable complete Grid planning snapshot
[^legacy]: Selection, filter, chooser and action-scroll behavior
[^grid]: Authored events, filters, reveal and lifecycle
[^selection]: Atomic active and selection-set transitions
[^filters]: Typed choices, counts, caching and filter writes
[^columns]: Existing layout validation and restoration

[^evidence]: Frozen interaction inputs, installed artifact and measured gates
[^toggle-tests]: Native toggles, veto, reentrancy, identity and teardown
[^filter-tests]: Applied search, zero counts, cache guards and callback ownership
[^demo-tests]: Authored recovery and action-scroll acceptance
