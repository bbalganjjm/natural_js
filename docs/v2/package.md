---
type: Guide
title: Natural-JS 2.0 package
description: Build and inspect the isolated Apache-2.0 ESM package and its currently implemented exports.
tags: [setup, package, typescript]
status: draft
sources:
  - id: package
    resource: ../../v2/package.json
    title: 2.0 package and public exports
    git_blob: 87bd07cfc1832d359f4dca93a130859042951a0d
  - id: compiler
    resource: ../../v2/tsconfig.json
    title: 2.0 TypeScript build settings
    git_blob: c4fd0bf523412e3c3d7f14bc256552120a3353ee
  - id: license
    resource: ../../v2/LICENSE
    title: Apache License 2.0 text for the new package
    git_blob: d645695673349e3947e8e5ae42332d0ac3164cd7
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:19:59Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T08:23:52Z }
---

Build the independent `v2/` package to inspect real 2.0 exports. This M2 alpha is a foundation, not the complete CVC or UI runtime.

# Goal

Produce ESM JavaScript and generated declarations from one strict TypeScript source tree, then install the packed result in separate JavaScript and TypeScript consumers.

# Prerequisites

Use Node.js 24.18 or another version accepted by the pinned development tools. Run commands from `v2/`. The repository root still holds the unchanged LGPL-2.1 1.x package and source.

# Steps

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run test:consumers
npm pack --dry-run --json
```

`v2/package.json` lists only `.` , `./page`, `./data`, `./ui`, and `./comm` as package entry points. The root currently exports the implemented `FrameworkError` class. The role entries contain generated declarations and type-only ESM modules; no page, data, UI, or communication runtime function is exported yet. `v2/src/` is packaged with `v2/build/` so declaration and JavaScript source maps resolve to the TypeScript original.[^package][^compiler]

# Verify

`npm run test:consumers` packs the package into an isolated temporary directory, installs that tarball in separate JS and strict TS fixtures, and checks both imports. The pack list must contain no 1.x bundle, jQuery, hand-maintained 1.x declarations, or general utility library. For browser import smoke, install Playwright binaries with `npx playwright install chromium firefox webkit` and run `npm run test:browser`. `npm run example` serves the authored-HTML Vite fixture.

# Pitfalls

Use `import type` for `./page`, `./data`, `./ui`, and `./comm` until their functions are implemented. The package is marked private during the alpha foundation to prevent accidental registry publication; local `npm pack` and installed-consumer checks still work. Do not run the root package's 1.x scripts as 2.0 checks.

The new `v2/` source and packed output use Apache-2.0.[^license] The root 1.x `LICENSE`, source headers, package metadata, and third-party files stay unchanged and are excluded from the 2.0 tarball.

# Next

Read the current [page](page.md), [data](data.md), [UI](ui.md), and [communication](comm.md) type entries and the implemented [FrameworkError](framework-error.md). Follow [the active plan](../implementation/current.md). M3 implements the common page, communication, and data runtime only after its detailed scope is reviewed.

[^package]: 2.0 package and public exports
[^compiler]: 2.0 TypeScript build settings
[^license]: Apache License 2.0 text for the new package
