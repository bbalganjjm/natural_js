---
type: Report
title: Natural-JS 2.0 M9 unpublished beta artifact
description: Exact beta tarball, installed-consumer, browser, accessibility, performance, package, and agent checks before release-candidate review.
tags: [meta, report, release, ai]
status: draft
sources:
  - id: plan
    resource: m9-plan.md
    title: Approved M9 release gates
    git_blob: 5d5295574ca4049a54c1f69bf055a920cd6ec475
  - id: package
    resource: ../../package.json
    title: Beta package metadata and scripts
    git_blob: 393602a69677d5fdaf7968fd49b19efd1b7d5cae
  - id: lock
    resource: ../../package-lock.json
    title: Reproducible development dependencies
    git_blob: 2634778a0c93af4e08ab9068277170265f213579
  - id: browser
    resource: ../../tools/check-packed-browser.mjs
    title: Exact-tarball browser consumer check
    git_blob: b90b0289ec02a933650c75ab0978557092dbff76
  - id: consumers
    resource: ../../tools/check-consumers.mjs
    title: Exact-tarball JavaScript and TypeScript consumer check
    git_blob: e22242522d425924b65afd99328af02c0e38e25b
  - id: a11y
    resource: ../../tests/browser/a11y-popup-tabs.spec.ts
    title: M4 and M7 keyboard, ID reference, and axe checks
    git_blob: 5bf9135a7931dc0684dcacbfb44f7d74298d11d3
  - id: popup
    resource: ../../src/ui/popup.ts
    title: Native Popup focus boundary
    git_blob: 49ec03d610615aff95952804541c94892799535f
  - id: zoom
    resource: evidence/m9-zoom-chromium.json
    title: Raw narrow-viewport and text-spacing geometry measurements
    git_blob: 545eef7a9e18bc149ea56294f12be0d909096232
  - id: grid-benchmark
    resource: evidence/m9-binding-chromium.json
    title: Raw M9 Grid binding measurements
    git_blob: ebfa20fcf965c7a4b89361892d6d4c2d35c645bb
  - id: list-benchmark
    resource: evidence/m9-list-chromium.json
    title: Raw M9 List/page measurements
    git_blob: 2277bcb71c290f639516d21b64f4562cc858ad38
  - id: agent-meter
    resource: evidence/m9-agent-meter-task3.jsonl
    title: Raw M9 Task 3 first-pass read-cost events
    git_blob: c366651912d7c9ea722b520eff527445ae0ec766
  - id: wcag
    resource: https://www.w3.org/TR/WCAG22/
    title: Web Content Accessibility Guidelines 2.2
generated: { by: codex/gpt-6-sol, at: 2026-09-24T21:44:43Z }
---

The clean source commit `a45fbd669e42e70e4e03624de8286b6440012d53` produced the unpublished `2.0.0-beta.0` tarball measured here. The earlier `c79b9eae` artifact was replaced after Popup focus and authored-layout reflow fixes. This report separates checks that installed the exact current tarball from source-checkout tests and records the remaining release gates. It does not claim registry publication, real Safari coverage, or complete WCAG 2.2 AA conformance.[^plan][^package]

# Artifact and scope

| Item | Result |
|---|---|
| Package | `@bbalganjjm/natural_js@2.0.0-beta.0`; five public entries: `.`, `./page`, `./data`, `./ui`, `./comm`; 11 runtime values and 34 public types. The unused `Rule` type is gone; all Form-reachable formatter and validator behavior remains.[^package] |
| Tarball | `bbalganjjm-natural_js-2.0.0-beta.0.tgz`; SHA-256 `ca87cf82f6fe457823500e1933ec52de0a35d8f6a529be50cb37ed6fdea126b8`; 98 files, 137,591 compressed bytes, 660,638 unpacked bytes. Local test copy: `node_modules/.cache/m9-release-a45/bbalganjjm-natural_js-2.0.0-beta.0.tgz`. |
| Contents | Root `LICENSE`, `README.md`, `package.json`, 76 `build/` files, and 19 `src/` TypeScript files. All 38 source maps resolve. No runtime dependencies, jQuery, 1.x code, general-purpose utility bundle, `v1/`, user `js/`, examples, tests, or docs are packed. |
| License | Root 2.0 package and all 19 packed TS source files identify Apache-2.0; preserved `v1/` and its LGPL-2.1 notices were not changed or packed. |
| Registry | Read-only npm lookup still returns `1.0.0-latest` as `latest`; `npm whoami` reports `ENEEDAUTH` on this host. No npm version, tag, or Git release tag was published. |

A second `npm pack` from the report-bearing branch tip reproduced the same SHA after only excluded docs/evidence files changed. After this exact-artifact review, the user excluded Safari from the initial 2.0 browser support scope and deferred npm publication until the remaining functionality and personal testing are complete. Playwright WebKit remains engine regression evidence, not a Safari claim. The JavaScript ESM and strict TypeScript consumers install this tarball by path and reject a wrong SHA before installation. The JavaScript fixture checks public import availability, FrameworkError, Rows changes, communication request/response, and a private UI deep import failing with `ERR_PACKAGE_PATH_NOT_EXPORTED`. The TypeScript fixture typechecks CVC and UI usage against the installed declarations; it does not execute DOM code. A separate Vite browser consumer installed from the same tarball runs two independent CVC pages with Form/Grid, nested row-local Select choices, unique ARIA IDs, editing, disposal, and reopening. List, Pagination, Popup, and Tabs are checked by installed imports/types here and by the source-checkout browser suite for behavior. The default consumer script remains available for working-tree development.[^consumers][^browser]

# Verification

| Gate | Result |
|---|---|
| Clean source | Lockfile-based `npm ci` ran before the final Popup/CSS patch; the lockfile did not change. On the final source, ESM build, strict typecheck, and Vitest 81/81 passed with Node.js 24.18.0 and npm 11.16.0 on Windows. No lower Node/tooling version is claimed yet. |
| Complete browser suite | Isolated Playwright runs passed 103/103 in each of Chromium, Firefox, and WebKit (309/309 total). The suite includes CVC lifecycle/data and M4/M7 authored-layout/UI regression coverage. |
| Packed browser consumer | The SHA-gated tarball passed in Playwright Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6, installed Chrome 153.0.8010.53, and installed Edge 153.0.4234.48, all on Windows. These vendor runs do not substitute for real Safari on macOS or iOS. |
| Popup keyboard and visibility | Native modal Tab/Shift+Tab boundaries wrap focus within the Popup. Opening and wrapping also keep the focused control visible in a 320 CSS-pixel viewport with enlarged text spacing. The focused regressions passed in Chromium, Firefox, and WebKit; scoped listeners are removed on disposal.[^popup][^a11y] |
| Documentation | The changed and full OKF checks each reported 36 concepts and zero errors. Nine `verified-stale` trust-field warnings remain recorded in the active plan after automatic approval review rejected a verification-stamp refresh. This is a trust-state warning, not an unexamined API export or source drift. |

The full suites were run separately because two simultaneous Playwright Vite servers using port 4173 can interfere with one another. Firefox initially failed to start from the host browser cache (`spawn UNKNOWN`); installing its Playwright binary under `node_modules/.cache/playwright-m6` allowed the final isolated 103/103 run and exact-tarball smoke to pass. No source change was made for that host-cache issue.

Raw source-suite logs are [Chromium](evidence/m9-browser-chromium.log), [Firefox](evidence/m9-browser-firefox.log), and [WebKit](evidence/m9-browser-webkit.log). Exact-tarball logs are [JS/TS consumers](evidence/m9-consumers.log) and packed [Chromium](evidence/m9-packed-chromium.log), [Firefox](evidence/m9-packed-firefox.log), [WebKit](evidence/m9-packed-webkit.log), [Chrome](evidence/m9-packed-chrome.log), and [Edge](evidence/m9-packed-edge.log). The source-suite Vite logs include errors intentionally triggered by negative tests; each suite ends with 103 passes.

# Reproduce the artifact checks

Run the package, installed-consumer, and browser commands from the clean `a45fbd6` package-source commit on the documented Windows/Node host. Run documentation checks from the later commit containing this report; the package-source commit predates the final M9 evidence update. Keep Playwright runs sequential; the full suite and the isolated agent fixture both use port 4173. The five packed-browser choices use one identical tarball and SHA.[^consumers][^browser]

```powershell
npm ci
npm run build
npm run typecheck
npm test
New-Item -ItemType Directory -Force node_modules/.cache/m9-release-a45 | Out-Null
npm pack --pack-destination node_modules/.cache/m9-release-a45
$tarball = 'node_modules/.cache/m9-release-a45/bbalganjjm-natural_js-2.0.0-beta.0.tgz'
$sha256 = 'ca87cf82f6fe457823500e1933ec52de0a35d8f6a529be50cb37ed6fdea126b8'
Get-FileHash -Path $tarball -Algorithm SHA256
npm run test:consumers -- --tarball $tarball --sha256 $sha256
foreach ($browser in 'chromium', 'firefox', 'webkit', 'chrome', 'edge') {
  npm run test:packed-browser -- --tarball $tarball --sha256 $sha256 --browser $browser
}
```

On the report-bearing branch tip, run the two OKF checks separately:

```powershell
npm run docs:check -- --changed
npm run docs:check
```

Run source-checkout browser regressions sequentially. Firefox on this Windows host needed a local browser cache because its default cache failed before the page opened.

```powershell
npm run test:browser -- --project=chromium
$env:PLAYWRIGHT_BROWSERS_PATH = 'node_modules/.cache/playwright-m6'
npx playwright install firefox
npm run test:browser -- --project=firefox
Remove-Item Env:PLAYWRIGHT_BROWSERS_PATH
npm run test:browser -- --project=webkit
```

# Accessibility boundary

The tested M4 and M7 side/stack application states have zero axe violations tagged WCAG 2 A/AA, 2.1 A/AA, and 2.2 A/AA. Automated and keyboard checks cover dialog and Tab focus paths, status/errors, two live MDI screens, repeated-row duplicate IDs, and valid ID references. Those results support the tested states only; WCAG conformance applies to complete pages and needs checks beyond automated rules.[^a11y][^wcag]

| Criterion family | Evidence | Remaining check |
|---|---|---|
| Semantics, names, errors, status (1.3.1, 3.3.1-3.3.3, 4.1.2-4.1.3) | axe A/AA and browser assertions on generated/live M4/M7 states; authored fields and labels appear in those fixtures. | Manual screen-reader announcements and all application-authored content. |
| Keyboard and focus (2.1.1-2.1.2, 2.4.3, 2.4.7) | Real browser keyboard tests for Popup and Tabs; focus entry, wrap, Escape, and return in the tested flows. | Screen-reader/keyboard review of complete user journeys and focus visibility under every app CSS/theme. |
| Text contrast and reflow (1.4.3, 1.4.10-1.4.12, 2.4.11, 2.5.8) | The axe `color-contrast` rule checks text contrast in tested states. M4 side/stack layouts and the M7 side-layout Popup were exercised at 320 CSS pixels with W3C text-spacing overrides in Chromium, Firefox, and WebKit. Document width remained 320px; wide data tables scrolled inside their list panel. Popup focus stayed visible after opening and Tab wrapping. | Non-text contrast under 1.4.11, actual 200%/400% browser zoom, target-size exceptions, all app CSS/themes, screen readers, and manual visual review remain unverified. |

The exploratory Chromium geometry record is [archived](evidence/m9-zoom-chromium.json); the three-engine regression results are in the browser-suite logs above. The framework owns generated IDs, ARIA relationships, state and focus handling. An application owns its authored labels, layout, and colors; each complete application page needs its own audit. This report therefore does not mark WCAG 2.2 AA as fully verified.[^wcag]

# Binding cost

The checked-in 100/1,000-row fixtures used headless Chromium 153 on the reference i7-9700F Windows host, two warm-up runs and five samples. At 1,000 rows, flat Grid initial/rebind/edit/sort/filter medians were 12.5/15.8/0.8/2.5/2.2 ms against 30/35/5/10/8 ms budgets. Nested automatic Grid initial/rebind/edit/sort/filter medians were 38.0/46.9/1.4/8.4/5.8 ms; initial/rebind/sort/filter are below their 90/100/25/18 ms budgets. The 1,000-row List initial/page-start/next/back medians were 11.4/0.9/0.2/0.2 ms, with zero duplicate IDs. These are fixture and host measurements, not universal speed guarantees or evidence of large-list virtualization.[^grid-benchmark][^list-benchmark]

# AI task replay

The fixed M8 Task 3 delayed CVC close/reopen seed was overlaid onto the earlier clean `c79b9eae` candidate in an ignored isolated checkout. This AI replay predates the Popup/accessibility patch, which did not change the CVC contract it exercised. The baseline archive SHA-256 was `0eb1d4aaf5e28f3adc7fb819c4776f22c4050baa203df0741855152f0c59e6e7` and the unchanged overlay SHA-256 was `c1c035df3cf1e2aa320c8365e56a1d87e5f351ac48e2b88aa2376ad19fbfb38d`. A fresh agent used the same metered read/search/review method and left fixed tests and framework source untouched.[^plan][^agent-meter]

| Measure | M9 replay |
|---|---|
| First complete acceptance | Build, typecheck, direct strict example TypeScript check, Chromium browser 2/2, and changed OKF check all passed. |
| Code retries | 0. A later documentation link fixed one new orphan warning; the isolated replay checkout then had zero OKF errors and six M9 `verified-stale` warnings. |
| Read context before first pass | 19 successful metered operations, 17 normalized content paths, 85,572 UTF-8 output bytes. A 10,083-byte diff review after the pass is excluded. |
| Changed scope | Six isolated-checkout files, +76/−8 lines; the example controller, its OKF concept/index/log, and a Related link. |
| Elapsed | 2026-09-24 19:51:43–19:58:36 UTC (6m53s). Actual agent token telemetry was unavailable. |

The full-file `docs/log.md` read exceeded the meter's 24 KiB output cap and was replaced with a narrower line read; the failed call emitted no file content. The comparable M8 Task 3 record was 14 paths, 109,304 output bytes, 5m39s, and first-pass success. The source/navigation and dependency baseline changed, so the two results show feasibility and measured context, not a causal token or speed improvement. Raw M9 events are [stored with this report](evidence/m9-agent-meter-task3.jsonl).[^agent-meter]

# Open release gates

- The `a45fbd6` beta tarball passed exact-artifact checks but remains unpublished.
- Complete WCAG 2.2 AA evaluation still needs manual screen-reader, actual zoom, target-size, and full-page authored-CSS review. The automated axe pass and tested 320px text-spacing states alone cannot close it.[^wcag]
- Registry credentials are absent on this host. The user deferred npm publication and release tags until remaining features are finished, personally tested, and publication is requested again.[^plan]
- A stable `2.0.0` manifest would change the packed bytes; this beta hash cannot serve as stable-artifact evidence. Repack and rerun artifact-dependent gates after any version or code change.[^plan]

[^plan]: Approved M9 release gates
[^package]: Beta package metadata and exports
[^consumers]: Exact-tarball JS/TS consumer check
[^browser]: Exact-tarball browser consumer check
[^a11y]: M4 and M7 browser accessibility regression
[^popup]: Native Popup focus implementation
[^grid-benchmark]: Raw M9 Grid measurements
[^list-benchmark]: Raw M9 List measurements
[^agent-meter]: Raw M9 Task 3 metered content events
[^wcag]: W3C Web Content Accessibility Guidelines 2.2
