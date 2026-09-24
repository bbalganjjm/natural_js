---
type: Plan
title: Natural-JS 2.0 M2 tooling plan
description: Proposed implementation scope for TypeScript source, ESM packaging, consumer checks, and 2.0 documentation tooling.
tags: [meta, plan, migration]
status: draft
sources:
  - id: package
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/package.json
    title: Immutable 1.x package and dependency baseline
  - id: checker
    resource: ../../tools/knowledge-docs/knowledge-docs.mjs
    title: Current OKF checker and stamper
    git_blob: 35ca43e9625fb9809c42e7246ecfd43be1a45a98
generated: { by: codex/gpt-6-sol, at: 2026-09-24T07:38:28Z }
---

M2 builds the source, package, test, and documentation foundation for the [M1 public contract](m1-contract.md). It ships real M2-owned exports and import-only consumer fixtures; CVC and UI runtime behavior begin in M3/M4.

# Goal

Make TypeScript the single implementation source and generate installable ESM JavaScript and declarations without pulling jQuery or unused 1.x utilities into the 2.0 package.

# Checkpoint

- M1 scope was approved; its draft API contract and the M2 scope await user review and approval.
- The fixed 1.x source/doc baseline is commit b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6; the 2.0 branch is codex/natural-js-2.
- Formatter, validator, built-in declarative rules, and their transitive internal operations are retained capabilities. M2 must not delete them while replacing the build.

# Steps

1. Compare the accepted M1 export/signature table with the current package and set a minimum 2.0 `package.json`: `type: module`, explicit `exports` for `./page`, `./data`, `./ui`, `./comm`, generated `.js` and `.d.ts`, and a files whitelist. Keep a lockfile. Preserve the 1.x package name until an explicit rename decision.
2. Add strict TypeScript configuration, one `src2/` source tree with modules matching public entry points, and a declaration-generating ESM build. Keep internal helpers feature-local and forbid internal imports from the package root. The published files contain no 1.x JavaScript bundle, jQuery, broad convenience library, or stale hand-maintained declarations.
3. Implement only real M2-owned code, such as the common error type, plus type-only contracts and entry modules. Add M3/M4 functions when their behavior exists; do not publish throwing runtime stubs as working APIs.
4. Add a Vite browser example that imports the package entry points and uses authored HTML. Add one small JavaScript consumer and one strict TypeScript consumer against `npm pack` output; their job in M2 is import/type/install verification, not behavioral claims.
5. Add Vitest for package/type-adjacent pure contracts and Playwright for browser import smoke checks. Configure Chromium, Firefox, and WebKit; M2 runs a minimal smoke set and prepares an accessibility/duplicate-ID and performance fixture for M4. Later milestones add behavioral checks. Avoid mirroring implementation with low-value tests.
6. Extend `tools/knowledge-docs` for TypeScript sources, exported symbols, and declaration output. Keep source fingerprints truthful. A changed 2.0 code file must flag affected draft concepts; 1.x baseline concepts keep immutable references.
7. Update the repository workflow and OKF index to distinguish 1.x baseline facts from implemented 2.0 APIs. Create a draft concept per new public entry point only when its code exists. Update affected concept bodies, folder indexes, `docs/log.md`, and stamps in the same work.
8. Run build, typecheck, the JS/TS installed consumers, focused browser smoke, `npm run docs:check -- --changed`, and full `npm run docs:check`. Record commands and results in the active plan. Inspect the `npm pack` file list and dependency graph for jQuery and excluded utilities.
9. Present the installed package shape, remaining gaps, and a detailed M3 runtime plan for review. Start M3 only after its scope is approved.

# Next action

Wait for user review of M1 and approval of this M2 scope. Then implement the steps above without expanding into M3 runtime or deleting Form-used rule behavior.

# Decisions

- Only the source/build layout changes in M2; existing 1.x code remains available at the fixed Git baseline and need not be destructively removed before the 2.0 replacement works.
- Package `exports` is the supported public boundary; internal files are not importable through package subpaths.
- A type-only export is documented as a type; no unfinished runtime function is presented as working behavior.
- Formatter/validator retention is tested through the M5 Form behavior, but M2's package structure reserves room for those rule modules and their private dependencies.
- A utility may be removed only after direct, transitive, configuration, template, and declarative rule reachability checks prove it unused by the framework.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Planning | Scope prepared during M1; implementation and checks are pending approval. |

# Open questions

- The exact build tool and lockfile manager are selected during M2 from repository constraints, then recorded before package changes.
- M2 consumer checks import only implemented runtime exports and type-only contracts; behavioral examples wait for M3/M4.
