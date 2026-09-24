---
type: Guide
title: Natural-JS 2.0 package
description: Build and inspect the root Apache-2.0 ESM package and its currently implemented exports.
tags: [setup, package, typescript]
status: draft
sources:
  - id: package
    resource: ../../package.json
    title: 2.0 package and public exports
    git_blob: 148dfc8e866559ae2859b5130afabafdaa1c0af3
  - id: ui
    resource: ../../src/ui/index.ts
    title: UI runtime exports
    git_blob: 6a2ee60393df8898e518a884fc1b8f3c6d6b9cf5
  - id: compiler
    resource: ../../tsconfig.json
    title: 2.0 TypeScript build settings
    git_blob: c4fd0bf523412e3c3d7f14bc256552120a3353ee
  - id: license
    resource: ../../LICENSE
    title: Apache License 2.0 text for the new package
    git_blob: d645695673349e3947e8e5ae42332d0ac3164cd7
generated: { by: codex/gpt-6-sol, at: 2026-09-24T13:47:21Z }
---

Build the root package to inspect real 2.0 exports. The current alpha includes the CVC page runner, row store, communicator, shared error, Form, Grid, List, Select, and Pagination binding, plus retained UI-owned formatter/validator rules. Dialog, popup, and tabs remain a later milestone.

# Goal

Produce ESM JavaScript and generated declarations from one strict TypeScript source tree, then install the packed result in separate JavaScript and TypeScript consumers.

# Prerequisites

Use Node.js 24.18 or another version accepted by the pinned development tools. Run commands from the repository root. The preserved LGPL-2.1 1.x source, package, and documentation live under `v1/`.

# Steps

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run test:consumers
npm pack --dry-run --json
```

`package.json` exposes `.`, `./page`, `./data`, `./ui`, and `./comm`. The root exports `FrameworkError`; the page, data, and communication entries export `mountPage`, `createRows`, and `createCommunicator` respectively. The UI entry exports `bindForm`, `bindGrid`, `bindList`, `bindSelect`, `bindPagination`, and their types.[^ui] Every entry has generated JavaScript and declarations. `src/` is packaged with `build/` so declaration and JavaScript source maps resolve to the TypeScript original.[^package][^compiler]

# Verify

`npm run test:consumers` packs the package into an isolated temporary directory, installs that tarball in separate JS and strict TS fixtures, and checks both imports. The pack list must contain no 1.x bundle, jQuery, hand-maintained 1.x declarations, or general utility library. For browser import smoke, install Playwright binaries with `npx playwright install chromium firefox webkit` and run `npm run test:browser`. `npm run example` serves the authored-HTML Vite fixture.

# Pitfalls

Use `import type` for UI type names; `./ui` now also has the runtime Form, Grid, List, Select, and Pagination binding functions. The package is marked private during the alpha foundation to prevent accidental registry publication; local `npm pack` and installed-consumer checks still work. Use the root scripts for 2.0 checks; the 1.x package under `v1/` is reference material.

The root 2.0 source and packed output use Apache-2.0.[^license] The 1.x license, source headers, package metadata, and third-party files stay under `v1/` and are excluded from the 2.0 tarball.

# Next

Read the implemented [page](page.md), [data](data.md), and [communication](comm.md) APIs, the [UI contracts](ui.md), [Form](form.md), [Grid](grid.md), [List](list.md), [Select](select.md), [Pagination](pagination.md), and [employee example](employee-example.md), and [FrameworkError](framework-error.md). Follow [the active plan](../implementation/current.md) for the next milestone gate.

[^package]: 2.0 package and public exports
[^compiler]: 2.0 TypeScript build settings
[^license]: Apache License 2.0 text for the new package

[^ui]: UI runtime exports
