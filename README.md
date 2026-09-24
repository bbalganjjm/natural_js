# Natural-JS 2.0

Natural-JS 2.0 is a TypeScript-first CVC UI framework. It attaches behavior to authored HTML without imposing a visual design. This branch is an alpha foundation.

The root package is the 2.0 package. Its only implemented runtime export in this milestone is FrameworkError. The page, data, UI, and communication entry points currently export types; their runtime functions are added in later milestones. See docs/index.md for current API facts and docs/implementation/current.md for progress.

The 2.0 source and package use Apache-2.0. The preserved 1.x code, bundles, types, documentation, and LGPL-2.1 license live in v1/ and are excluded from the 2.0 npm tarball. The original master branch remains unchanged.

## Build and check

Run npm ci, npm run build, npm run typecheck, npm test, npm run test:consumers, and npm run test:browser from the repository root. Browser checks need Playwright binaries installed with npx playwright install chromium firefox webkit. npm run example starts the authored-HTML Vite fixture.

The build/ output is generated from src/. Public package paths are explicit in package.json. Keep types near their owning module and share a private implementation only when multiple framework roles need identical behavior.
