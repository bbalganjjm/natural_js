# Natural-JS 2.0

Natural-JS 2.0 is a TypeScript-first CVC UI framework. It attaches behavior to authored HTML and does not impose a visual design. The migration is under active development.

This alpha package currently exports the real FrameworkError runtime class and type-only contracts from ./page, ./data, ./ui, and ./comm. Page mounting, data stores, communication, and UI behavior are not implemented or exported yet. In the source repository, docs/implementation/m1-contract.md records the proposed contract and docs/implementation/current.md records progress.

The v2/ package and newly written 2.0 code use Apache-2.0. The repository's existing 1.x source, bundles, and root LICENSE remain under their existing terms and are not part of this package. No 1.x JavaScript or third-party library is copied into the 2.0 distribution.

## Build and check

Run npm ci, npm run build, npm run typecheck, npm test, npm run test:consumers, and npm run test:browser from v2/. The browser test needs Playwright browser binaries installed with npx playwright install chromium firefox webkit. npm run example starts the Vite import example.

The output in build/ is generated from src/. Package exports are explicit; import only documented entry points. Keep types near their owning module. Share a private implementation only after two framework roles need the same behavior; do not create a public convenience utility API.
