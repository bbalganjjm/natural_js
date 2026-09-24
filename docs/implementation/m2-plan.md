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
    git_blob: 8c868f2ca6877b6c19329cde9bc9b9225712a3d2
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:27:15Z }
---

M2 builds the source, package, test, and documentation foundation for the [M1 public contract](m1-contract.md). It ships real M2-owned exports and import-only consumer fixtures; CVC and UI runtime behavior begin in M3/M4.

# Goal

Make TypeScript the single implementation source and generate installable ESM JavaScript and declarations without pulling jQuery or unused 1.x utilities into the 2.0 package.

# Checkpoint

- The user approved the M1 design contract and M2 implementation scope. The 2.0 package is isolated in `v2/`; the 1.x root package and LGPL license remain unchanged.
- The fixed 1.x source/doc baseline is commit b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6; the 2.0 branch is codex/natural-js-2.
- Formatter, validator, built-in declarative rules, and their transitive internal operations are retained capabilities. M2 must not delete them while replacing the build.

# Steps

1. Compare the accepted M1 export/signature table with the current package and set a minimum `v2/package.json`: `type: module`, explicit `exports` for `./page`, `./data`, `./ui`, `./comm`, generated `.js` and `.d.ts`, and a files whitelist. Keep a lockfile. Preserve the 1.x package name until an explicit rename decision.
2. Add strict TypeScript configuration, one `v2/src/` source tree with modules matching public entry points, and a declaration-generating ESM build in `v2/build/`. Keep internal helpers feature-local and forbid internal imports from the package root. The published files contain no 1.x JavaScript bundle, jQuery, broad convenience library, or stale hand-maintained declarations.
3. Implement only real M2-owned code, such as the common error type, plus type-only contracts and entry modules. Add M3/M4 functions when their behavior exists; do not publish throwing runtime stubs as working APIs.
4. Add a Vite browser example that imports the package entry points and uses authored HTML. Add one small JavaScript consumer and one strict TypeScript consumer against `npm pack` output; their job in M2 is import/type/install verification, not behavioral claims.
5. Add Vitest for package/type-adjacent pure contracts and Playwright for browser import smoke checks. Configure Chromium, Firefox, and WebKit; M2 runs import smoke on two authored HTML sections and checks duplicate IDs. M4 adds real component accessibility and 100/1000-row binding fixtures when runtime behavior exists. Later milestones add behavioral checks. Avoid mirroring implementation with low-value tests.
6. Extend `tools/knowledge-docs` for TypeScript sources, exported symbols, and declaration output. Keep source fingerprints truthful. A changed 2.0 code file must flag affected draft concepts; 1.x baseline concepts keep immutable references.
7. Update the repository workflow and OKF index to distinguish 1.x baseline facts from implemented 2.0 APIs. Create a draft concept per new public entry point only when its code exists. Update affected concept bodies, folder indexes, `docs/log.md`, and stamps in the same work.
8. Run build, typecheck, the JS/TS installed consumers, focused browser smoke, `npm run docs:check -- --changed`, and full `npm run docs:check`. Record commands and results in the active plan. Inspect the `npm pack` file list and dependency graph for jQuery and excluded utilities.
9. Present the installed package shape, remaining gaps, and a detailed M3 runtime plan for review. Start M3 only after its scope is approved.

# Next action

M2 implementation is complete apart from host-blocked Firefox execution. Review the results and [the M3 runtime plan](m3-plan.md); start M3 only after its scope is approved.

# Decisions

- The 2.0 package, source, build, tests, and Apache-2.0 license live in `v2/`. Existing 1.x source, root package metadata, bundles, headers, and LGPL license are untouched. No 1.x or third-party implementation is copied into the 2.0 distribution.
- M2 uses npm with a tracked `v2/package-lock.json`, `tsc` for ESM and declarations, Vite for the HTML example, Vitest for focused logic, and Playwright for import smoke.
- M2 consumers import only the implemented `FrameworkError` runtime and type-only contracts; CVC/UI behavior waits for M3/M4.
- Package `exports` is the supported public boundary; internal files are not importable through package subpaths.
- A type-only export is documented as a type; no unfinished runtime function is presented as working behavior.
- Formatter/validator retention is tested through the M5 Form behavior, but M2's package structure reserves room for those rule modules and their private dependencies.
- A utility may be removed only after direct, transitive, configuration, template, and declarative rule reachability checks prove it unused by the framework.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Planning | User approved M1 and M2; `v2/` isolates the new Apache-2.0 package from unchanged 1.x files. |
| 2026-09-24 | Package and consumers | `npm ci`, build, typecheck, Vitest 2/2, fresh tarball JS/TS installation, and `npm pack --dry-run` passed; 33 files, no 1.x bundle or jQuery. |
| 2026-09-24 | Browser | Chromium and WebKit smoke passed 2/2. Firefox fails before page load with a Windows SideBySide `mozglue` assembly error, even after reinstall. |
| 2026-09-24 | OKF checker | Its TypeScript export/declaration regression test passed. Changed and full bundle checks: 78 concepts, 17 reserved files, 0 errors, 0 warnings. Independent review verified the package and FrameworkError concepts. |

# Open questions

- Playwright Firefox must run on a host where the browser executable starts; keep its project configured and do not treat this host error as an application pass.
