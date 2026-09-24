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
  - id: compiler
    resource: ../../tsconfig.json
    title: 2.0 TypeScript build settings
    git_blob: c4fd0bf523412e3c3d7f14bc256552120a3353ee
  - id: license
    resource: ../../LICENSE
    title: Apache License 2.0 text for the new package
    git_blob: d645695673349e3947e8e5ae42332d0ac3164cd7
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:52:33Z }
---

Build the root package to inspect real 2.0 exports. The M3 alpha includes the CVC page runner, row store, communicator, and shared error; Form and Grid remain future UI work.

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

`package.json` exposes `.`, `./page`, `./data`, `./ui`, and `./comm`. The root exports `FrameworkError`; the page, data, and communication entries export `mountPage`, `createRows`, and `createCommunicator` respectively. The UI entry still exports types only. Every entry has generated JavaScript and declarations. `src/` is packaged with `build/` so declaration and JavaScript source maps resolve to the TypeScript original.[^package][^compiler]

# Verify

`npm run test:consumers` packs the package into an isolated temporary directory, installs that tarball in separate JS and strict TS fixtures, and checks both imports. The pack list must contain no 1.x bundle, jQuery, hand-maintained 1.x declarations, or general utility library. For browser import smoke, install Playwright binaries with `npx playwright install chromium firefox webkit` and run `npm run test:browser`. `npm run example` serves the authored-HTML Vite fixture.

# Pitfalls

Use `import type` for the `./ui` entry and for type names in other entries; `./page`, `./data`, and `./comm` have runtime functions. The package is marked private during the alpha foundation to prevent accidental registry publication; local `npm pack` and installed-consumer checks still work. Use the root scripts for 2.0 checks; the 1.x package under `v1/` is reference material.

The root 2.0 source and packed output use Apache-2.0.[^license] The 1.x license, source headers, package metadata, and third-party files stay under `v1/` and are excluded from the 2.0 tarball.

# Next

Read the implemented [page](page.md), [data](data.md), and [communication](comm.md) APIs, the [UI types](ui.md), and [FrameworkError](framework-error.md). Follow [the active plan](../implementation/current.md) for the next milestone gate.

[^package]: 2.0 package and public exports
[^compiler]: 2.0 TypeScript build settings
[^license]: Apache License 2.0 text for the new package
