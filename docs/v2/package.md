---
type: Guide
title: Natural-JS 2.0 package
description: Build and verify the unpublished Apache-2.0 ESM beta candidate and its five entry points.
tags: [setup, package, typescript]
status: draft
sources:
  - id: package
    resource: ../../package.json
    title: 2.0 package and public exports
    git_blob: 393602a69677d5fdaf7968fd49b19efd1b7d5cae
  - id: ui
    resource: ../../src/ui/index.ts
    title: UI runtime exports
    git_blob: e1c3c3d309fb5b5724965ce348396046b1c77db7
  - id: compiler
    resource: ../../tsconfig.json
    title: 2.0 TypeScript build settings
    git_blob: c4fd0bf523412e3c3d7f14bc256552120a3353ee
  - id: license
    resource: ../../LICENSE
    title: Apache License 2.0 text for the new package
    git_blob: d645695673349e3947e8e5ae42332d0ac3164cd7
generated: { by: codex/gpt-6-sol, at: 2026-09-24T21:37:53Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T22:14:07Z }
---

Build the root package to inspect real 2.0 exports. The unpublished `2.0.0-beta.0` candidate includes the CVC page runner, row store, communicator, shared error, Form, Grid, List, Select, Pagination, Popup, and Tabs, plus retained UI-owned formatter/validator rules. A plain Dialog uses native HTML methods; it has no framework binder.

# Goal

Produce ESM JavaScript and generated declarations from one strict TypeScript source tree, then install the packed result in separate JavaScript and TypeScript consumers.

# Prerequisites

The release checks use Node.js 24.18; other development-tool versions have not yet been verified. Run commands from the repository root. The preserved LGPL-2.1 1.x source, package, and documentation live under `v1/`.

# Steps

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run test:consumers
npm pack --dry-run --json
```

`package.json` exposes `.`, `./page`, `./data`, `./ui`, and `./comm`. The root exports `FrameworkError`; the page, data, and communication entries export `mountPage`, `createRows`, and `createCommunicator` respectively. The UI entry exports `bindForm`, `bindGrid`, `bindList`, `bindSelect`, `bindPagination`, `openPopup`, `bindTabs`, and their types.[^ui] Every entry has generated JavaScript and declarations. `src/` is packaged with `build/` so declaration and JavaScript source maps resolve to the TypeScript original.[^package][^compiler]

# Verify

`npm run test:consumers` builds and packs into an isolated temporary directory, then installs that tarball in separate JS and strict TS fixtures. For a frozen release artifact, run `npm run test:consumers -- --tarball <path.tgz> --sha256 <64-hex>`; this verifies the checksum before installing the exact same tarball in both fixtures and skips rebuilding. Run `npm run test:packed-browser -- --tarball <path.tgz> --sha256 <64-hex> --browser chromium` for a browser-served CVC/Form/Grid consumer installed from that artifact. The browser option also accepts `firefox`, `webkit`, `chrome`, or `edge` when available locally. The pack list must contain no 1.x bundle, jQuery, hand-maintained 1.x declarations, or general utility library. For browser import smoke, install Playwright binaries with `npx playwright install chromium firefox webkit` and run `npm run test:browser`. `npm run example` serves the authored-HTML Vite fixture.

# Browser and publication scope

Safari is outside the initial 2.0 browser support scope by the user's decision. The frozen beta artifact passed installed-browser smokes in Chrome and Edge on Windows, plus Playwright Chromium, Firefox, and WebKit. Playwright WebKit is engine regression evidence, not a Safari vendor test. Other vendor/OS combinations have not been verified. Automated accessibility checks and tested keyboard flows do not establish complete WCAG 2.2 AA conformance for applications with their own HTML and CSS.

The user deferred npm publication until the remaining functionality is finished, personally tested, and explicitly requested for publication. The current tarball is a local candidate only; no 2.0 release tag or registry version exists.

# Pitfalls

Use `import type` for UI type names; `./ui` now also has the runtime Form, Grid, List, Select, Pagination, Popup, and Tabs functions. The beta candidate is publishable in its manifest, but has not been published. The existing npm `latest` tag still resolves to 1.x. Review the exact tarball and checksum before any `npm publish --tag beta` command. Use the root scripts for 2.0 checks; the 1.x package under `v1/` is reference material.

The root 2.0 source and packed output use Apache-2.0.[^license] The 1.x license, source headers, package metadata, and third-party files stay under `v1/` and are excluded from the 2.0 tarball.

# Next

Read the implemented [page](page.md), [data](data.md), and [communication](comm.md) APIs, the [UI contracts](ui.md), [Form](form.md), [Grid](grid.md), [List](list.md), [Select](select.md), [Pagination](pagination.md), [Popup](popup.md), [Tabs](tabs.md), and [employee example](employee-example.md), and [FrameworkError](framework-error.md). Follow [the active plan](../implementation/current.md) for the next milestone gate.

[^package]: 2.0 package and public exports
[^compiler]: 2.0 TypeScript build settings
[^license]: Apache License 2.0 text for the new package

[^ui]: UI runtime exports
