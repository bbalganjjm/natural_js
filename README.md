# Natural-JS 2.0

Natural-JS 2.0 is a TypeScript-first CVC UI framework. It attaches behavior to authored HTML and CSS without imposing a visual design. This branch is an alpha; the repository root contains the 2.0 package.

The current runtime provides `mountPage`, `createRows`, `createCommunicator`, Form, Grid, List, Select, Pagination, Popup, Tabs, and `FrameworkError`. A plain Dialog uses authored `<dialog>` markup and native methods. Form/Grid retain nested row-local Select binding and Form-reachable formatter/validator rules. The [employee example](docs/v2/employee-example.md) covers data binding; the [page-container example](docs/v2/page-containers-example.md) runs one CVC definition in main content, Popup, and Tabs across two MDI layouts. Start with the [2.0 migration guide](docs/v2/migration.md) when moving a 1.x screen. See the [active plan](docs/implementation/current.md) for the current milestone gate.

The new 2.0 source and package use Apache-2.0. The preserved 1.x code, bundles, types, documentation, and LGPL-2.1 license live in `v1/` and are excluded from the 2.0 npm tarball. The original `master` branch remains unchanged.

## Build and check

Run `npm ci`, `npm run build`, `npm run typecheck`, `npm test`, `npm run test:consumers`, and `npm run test:browser` from the repository root. Browser checks need Playwright binaries installed with `npx playwright install chromium firefox webkit`. `npm run example` starts the authored-HTML Vite fixture.

The generated `build/` output comes from `src/`. Public package paths are explicit in `package.json`. Keep types near their owning module and share a private implementation only when multiple framework roles need identical behavior.