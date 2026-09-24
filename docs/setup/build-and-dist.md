---
type: Guide
title: Build and dist bundles
description: How the eight dist bundles are built from src with the bundled Closure Compiler scripts, and how to rebuild or customize them.
tags: [project, build, dist]
status: draft
sources:
  - id: all
    resource: ../../compiler/minify-all-version.sh
    title: minify-all-version.sh (runs the eight build scripts)
    git_blob: 61d8eb82143e4189aeb284d4956353fdbc05b42a
  - id: base-es5
    resource: ../../compiler/minify-natural.js.es5.sh
    title: minify-natural.js.es5.sh
    git_blob: 0659f8eaadcaa0e2ec384a00ea7c5d57fcc2ea66
  - id: base-es6
    resource: ../../compiler/minify-natural.js.es6.sh
    title: minify-natural.js.es6.sh
    git_blob: c1161741f52ef7b58cc198845478f6a65c6d22ae
  - id: code-es5
    resource: ../../compiler/minify-natural.js+code.es5.sh
    title: minify-natural.js+code.es5.sh
    git_blob: 4c0796fa4104526e58cbe87c1a0aa0769b599afa
  - id: code-es6
    resource: ../../compiler/minify-natural.js+code.es6.sh
    title: minify-natural.js+code.es6.sh
    git_blob: b32ae65391ea620f3c11009af2503a2436d3a744
  - id: template-es5
    resource: ../../compiler/minify-natural.js+template.es5.sh
    title: minify-natural.js+template.es5.sh
    git_blob: b1536bb3eaf257656b28753ac0c7f34cd282fc03
  - id: template-es6
    resource: ../../compiler/minify-natural.js+template.es6.sh
    title: minify-natural.js+template.es6.sh
    git_blob: 6029f1be8bcb3029ee1622f8f8d8f03d7f936b9f
  - id: full-es5
    resource: ../../compiler/minify-natural.js+code+template.es5.sh
    title: minify-natural.js+code+template.es5.sh
    git_blob: d87a4fffd24a7e7906323aa2b2a5b9ce908f2c4b
  - id: full-es6
    resource: ../../compiler/minify-natural.js+code+template.es6.sh
    title: minify-natural.js+code+template.es6.sh
    git_blob: a686e25604860639aef3c52616a9cd47cc481896
  - id: js
    resource: ../../src/natural.js.js
    title: natural.js.js (imports the five packages, defines window.N)
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: code
    resource: ../../src/natural.code.js
    title: natural.code.js (imports N and NJS from natural.js.js)
    git_blob: cace23c7b3b7bc5cd23c75a516220586472d7b3c
  - id: template
    resource: ../../src/natural.template.js
    title: natural.template.js (imports N and NJS from natural.js.js)
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
  - id: package
    resource: ../../package.json
    title: package.json (main, types, dependencies)
    git_blob: 877da009582de8a7466890a65ef468ecbec3d025
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

The files in `dist/` are produced by eight shell scripts in `compiler/` that run the bundled Google Closure Compiler (`closure-compiler-v20240317.jar`) over `src/*.js`. Read this page to pick the right bundle, rebuild the bundles after changing `src/`, or make a bundle with a different package set.

# Goal

Rebuilt `dist/natural.js*.min.js` bundles and their `.min.map` source maps, produced from the current `src/`.

# Prerequisites

- A Java runtime: every script runs `java -jar ./closure-compiler-v20240317.jar`.[^all]
- A POSIX shell (`sh`); on Windows use Git Bash or WSL.
- Run the scripts from inside `compiler/`: they use the relative paths `./closure-compiler-v20240317.jar`, `../src/...` and `../dist/...`.

# Steps

## 1. Know the bundle matrix

| Script | Output (`dist/`) | Packages |
|---|---|---|
| `minify-natural.js.es5.sh` / `.es6.sh` | `natural.js.es5.min.js` / `natural.js.es6.min.js` | CORE, ARCHITECTURE, DATA, UI, UI.Shell |
| `minify-natural.js+code.es5.sh` / `.es6.sh` | `natural.js+code.es5.min.js` / `.es6.min.js` | the above + Natural-CODE |
| `minify-natural.js+template.es5.sh` / `.es6.sh` | `natural.js+template.es5.min.js` / `.es6.min.js` | the above + Natural-TEMPLATE |
| `minify-natural.js+code+template.es5.sh` / `.es6.sh` | `natural.js+code+template.es5.min.js` / `.es6.min.js` | the above + both |

Each script also writes a source map next to its bundle (`--create_source_map`, same name with `.min.map`).

## 2. Know the compiler settings

All eight scripts share the same flags; only `--language_out` and the input list differ:[^base-es5][^base-es6]

| Flag | Value | Effect |
|---|---|---|
| `--dependency_mode` | `NONE` | inputs are compiled in the order given |
| `--language_in` | `UNSTABLE` | accepts the newest syntax in `src/` (static class fields) |
| `--language_out` | `ECMASCRIPT5` (`.es5`) or `ECMASCRIPT_2015` (`.es6`) | output language; ES5 output includes `$jscomp` polyfills |
| `--js` | the source files, in the order below | |
| `--js_output_file`, `--create_source_map` | `../dist/<bundle>.min.js`, `../dist/<bundle>.min.map` | outputs |

Input order:

1. `../src/natural.core.js`
2. `../src/natural.architecture.js`
3. `../src/natural.data.js`
4. `../src/natural.ui.js`
5. `../src/natural.ui.shell.js`
6. `../src/natural.js.js`
7. `../src/natural.code.js` (`+code` bundles only)
8. `../src/natural.template.js` (`+template` bundles only)

`natural.js.js` must come after the five packages because it assembles `N` from them, and `natural.code.js` / `natural.template.js` must come after it because they import `N` and `NJS` from it to set `N.code`, `N.template` and their `N.version` entries.[^js][^code][^template] The ES module syntax is compiled away, and no `--output_wrapper` is passed, so the output is an unwrapped classic script. `window.N` is its only public global, but the compiler-generated top-level names also end up in the global scope: `N$$module$__$src$natural_js`, the `module$__$src$natural_*` objects, class bindings such as `NC$$module$__$src$natural_core`, and `$jscomp` / `$jscomp$lookupPolyfilledValue` in ES5 output. The plain names `NC`, `NU` and so on are not defined.[^base-es5][^base-es6]

## 3. Rebuild every bundle

```sh
cd compiler
sh minify-all-version.sh
```

`minify-all-version.sh` calls each script as `./minify-*.sh`, so those files must be executable; otherwise run them one by one with `sh`.[^all]

## 4. Rebuild one bundle

```sh
cd compiler
sh minify-natural.js+code+template.es6.sh
```

## 5. Make a custom bundle

Copy one script, change `--js_output_file` and `--create_source_map`, and edit the `--js` list. Keep the five package files and `natural.js.js` in the order above; `natural.js.js` imports all five packages, so a bundle without one of them is not supported. Add `natural.code.js` and/or `natural.template.js` after `natural.js.js`.

# Verify

- The new files in `dist/` start with the `Natural-CORE` license banner and contain `window.N=`.
- A page that loads the bundle (see [Installation](installation.md)) shows the expected packages in `N.version`, including `Natural-CODE` / `Natural-TEMPLATE` for the `+code` / `+template` bundles.

# Pitfalls

The legacy guide named a jar that does not exist:

```sh
// Wrong (legacy): java -jar compiler/closure-compiler.jar ...
cd compiler && sh minify-natural.js.es6.sh   # uses ./closure-compiler-v20240317.jar
```

- `dist/natural.config.js` is not produced by the build; it is a hand-maintained file. See [natural.config.js](configuration.md).
- The bundles do not end with a `//# sourceMappingURL=` comment, so browsers do not load the `.min.map` files automatically; add the comment or attach the map in the developer tools.
- Running a script from the repository root fails because of the relative paths; `cd compiler` first.

# Known issues

* **`package.json` `main` points to a missing file** - Actual: `"main": "natural.js.min.js"`, but no such file exists (the bundles are in `dist/` with other names), and the bundles export nothing because they are classic scripts. Likely intent: a `dist/` bundle path. Workaround: load a `dist/` bundle with a `<script>` tag and reference it by path.[^package]
* **`package.json` `types` points to a missing file** - Actual: `"types": "node_modules/@types/natural_js/index.d.ts"`. Likely intent: `@types/index.d.ts`. Workaround: see [TypeScript](typescript.md).[^package]
* **The package depends on itself** - Actual: `dependencies` contains `"@bbalganjjm/natural_js": "file:"` next to `"jquery": "3.7.1"`. Likely intent: a local development link that should not be published. Workaround: none needed for `<script>` use; check the installed tree if npm reports a problem with this entry.[^package]

# Next

- [Installation](installation.md) - which bundle to load and in what order.
- [natural.config.js](configuration.md) - the configuration file that ships next to the bundles.
- [TypeScript](typescript.md) - the `@types` declarations shipped with the package.
- [Natural-JS](../overview/natural-js.md) - what each package in the bundle contains.

[^all]: minify-all-version.sh (runs the eight build scripts)
[^base-es5]: minify-natural.js.es5.sh
[^base-es6]: minify-natural.js.es6.sh
[^js]: natural.js.js (imports the five packages, defines window.N)
[^code]: natural.code.js (imports N and NJS from natural.js.js)
[^template]: natural.template.js (imports N and NJS from natural.js.js)
[^package]: package.json (main, types, dependencies)
