# Natural-JS 2.0

Natural-JS 2.0 is a TypeScript-first CVC UI framework. It attaches behavior to authored HTML and CSS without imposing a visual design. This branch is an alpha; the repository root contains the 2.0 package.

The current runtime provides `mountPage`, `createRows`, `createCommunicator`, `bindForm`, `bindGrid`, and `FrameworkError`. Form and Grid support search, selection, edit, and save with nested row-local Select options. M5 retains Form-reachable built-in formatter and validator rules inside UI and keeps invalid input drafts by row. The remaining first-release UI components follow in M6 and M7. See [the active plan](https://github.com/bbalganjjm/natural_js/blob/2.0.0-alpha.0/docs/implementation/current.md) and [the two-layout employee example](https://github.com/bbalganjjm/natural_js/blob/2.0.0-alpha.0/docs/v2/employee-example.md) for the exact implemented boundary.

The new 2.0 source and package use Apache-2.0. The preserved 1.x code, bundles, types, documentation, and LGPL-2.1 license live in `v1/` and are excluded from the 2.0 npm tarball. The original `master` branch remains unchanged.

## Build and check

Run `npm ci`, `npm run build`, `npm run typecheck`, `npm test`, `npm run test:consumers`, and `npm run test:browser` from the repository root. Browser checks need Playwright binaries installed with `npx playwright install chromium firefox webkit`. `npm run example` starts the authored-HTML Vite fixture.

The generated `build/` output comes from `src/`. Public package paths are explicit in `package.json`. Keep types near their owning module and share a private implementation only when multiple framework roles need identical behavior.