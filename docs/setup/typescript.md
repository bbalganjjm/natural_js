---
type: Guide
title: TypeScript
description: How to use the Natural-JS type declarations in @types with TypeScript, including tsconfig setup, the real namespaces and type names, and a typed controller.
tags: [project, setup, typescript]
symbols: [NJS, NC.JSONObject, NA.Request, NA.Communicator, NA.Options.Request, NA.Objects.Controller.Object, NA.Objects.Controller.BaseObject, NU.Grid, NU.Options.Grid, NU.Form, NT.Objects.Controller.Object]
sources:
  - id: index
    resource: ../../@types/index.d.ts
    title: "@types/index.d.ts (entry, references every declaration file)"
    git_blob: fc9f35f5a5c6792579d413fc60e60872f346af66
  - id: js-dts
    resource: ../../@types/natural.js.d.ts
    title: "@types/natural.js.d.ts (N, NJS, namespace N)"
    git_blob: 86423dd07124d48394a29cf113270ee9979b9134
  - id: core-dts
    resource: ../../@types/natural.core.d.ts
    title: "@types/natural.core.d.ts (class NC)"
    git_blob: c8c127d5a34bbf72bc2b742efa23aad978847e3c
  - id: core-misc
    resource: ../../@types/natural.core.misc.d.ts
    title: "@types/natural.core.misc.d.ts (NC.JSONObject, NC.Selector ...)"
    git_blob: 1854ebee54a6aca505be715441a30df0bf54985f
  - id: arch-dts
    resource: ../../@types/natural.architecture.d.ts
    title: "@types/natural.architecture.d.ts (class NA, NA.Communicator, NA.Request)"
    git_blob: dd3f2f956d682a26bf8fd11524f084307f3e3f37
  - id: arch-misc
    resource: ../../@types/natural.architecture.misc.d.ts
    title: "@types/natural.architecture.misc.d.ts (NA.Options, NA.Callbacks, NA.Objects)"
    git_blob: a4966b6dbfd8512ec810d218aa059eb812613e37
  - id: data-dts
    resource: ../../@types/natural.data.d.ts
    title: "@types/natural.data.d.ts (class ND)"
    git_blob: 5f429a00fda56f1409b6985088de7ab29cf6f52a
  - id: data-misc
    resource: ../../@types/natural.data.misc.d.ts
    title: "@types/natural.data.misc.d.ts (ND.FormatRules, ND.ValidationRules ...)"
    git_blob: e31e323ac5de8d099ce933575c3229db72a2f03f
  - id: ui-dts
    resource: ../../@types/natural.ui.d.ts
    title: "@types/natural.ui.d.ts (class NU, NU.Grid, NU.Form ...)"
    git_blob: 61bc07d7bec783ec56cd2dbef9a237b390fea33b
  - id: ui-misc
    resource: ../../@types/natural.ui.misc.d.ts
    title: "@types/natural.ui.misc.d.ts (NU.Options, NU.EventHandlers ...)"
    git_blob: 9438abbb11e769c1a4776b7e92d0ae434159588a
  - id: shell-dts
    resource: ../../@types/natural.ui.shell.d.ts
    title: "@types/natural.ui.shell.d.ts (class NUS, NUS.Notify, NUS.Documents)"
    git_blob: 379e64753fa941b706aac63d5ea6dd386a4b1e7d
  - id: shell-misc
    resource: ../../@types/natural.ui.shell.misc.d.ts
    title: "@types/natural.ui.shell.misc.d.ts (NUS.Options ...)"
    git_blob: 44a29861cc9ee9633fb4c0c134eead82d5a39e95
  - id: template-dts
    resource: ../../@types/natural.template.d.ts
    title: "@types/natural.template.d.ts (class NT)"
    git_blob: a15fc84793c0e557f92a732a9215aa316738c246
  - id: template-misc
    resource: ../../@types/natural.template.misc.d.ts
    title: "@types/natural.template.misc.d.ts (NT.Options, NT.Objects.Controller)"
    git_blob: fbf72d1800b7c1fcc05d2862502c140b6b1f21fd
  - id: code-dts
    resource: ../../@types/natural.code.d.ts
    title: "@types/natural.code.d.ts (class NCD)"
    git_blob: 669bb3ea8eb0df8ed8d37f55ae61dbd6e30be81a
  - id: code-misc
    resource: ../../@types/natural.code.misc.d.ts
    title: "@types/natural.code.misc.d.ts (NCD.SeverityLevels, NCD.CodeInspectionResult)"
    git_blob: 6e47dd67f72ee6ae4025ef31158da49bdef99a7c
  - id: tests
    resource: ../../@types/natural_js-tests.ts
    title: "@types/natural_js-tests.ts (type-checked usage samples)"
    git_blob: a7e4a26435b4cd66e43c57f142e793c999b9ca2a
  - id: tsconfig
    resource: ../../tsconfig.json
    title: tsconfig.json (how the repository type-checks the declarations)
    git_blob: d0da9abcf44cc77973524ecce161e9ec0a3788ab
  - id: package
    resource: ../../package.json
    title: package.json (types and devDependencies)
    git_blob: 877da009582de8a7466890a65ef468ecbec3d025
  - id: js
    resource: ../../src/natural.js.js
    title: natural.js.js (runtime globals, plugins installed on jQuery.fn)
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: form-validate
    resource: ../../src/natural.ui.js
    title: NU.form.prototype.validate (triggers the validators that bind() registers)
    symbol: NU.form.prototype.validate
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: de2945525bd7
  - id: form-data
    resource: ../../src/natural.ui.js
    title: NU.form.prototype.data (data(true) returns the current row)
    symbol: NU.form.prototype.data
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: d506dda02d4d
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-TYPESCRIPT.md
    title: Legacy TypeScript guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

Natural-JS ships global type declarations in `@types/`: the function `N`, the collection interface `NJS<T>`, and one namespace per package (`NC`, `NA`, `ND`, `NU`, `NUS`, `NT`, `NCD`) for classes, options and callbacks. This guide wires them into `tsconfig.json`, maps each declaration file to its source, lists the type names you will actually use, and shows a typed controller. Runtime code still runs on the global `N` from a `dist/` bundle.

# Goal

TypeScript code that type-checks against the Natural-JS declarations and compiles to code that uses the global `N`.

# Prerequisites

- Natural-JS installed ([Installation](installation.md)) so that `@types/` is available, for example at `node_modules/@bbalganjjm/natural_js/@types/`.
- TypeScript in your project.
- `@types/jquery`: `index.d.ts` starts with `/// <reference types="jquery" />`, and the repository itself lists `@types/jquery` as a dev dependency.[^index][^package]

# Steps

## 1. Install the jQuery types

```sh
npm install --save-dev @types/jquery
```

## 2. Add the declarations to tsconfig.json

List `@types/index.d.ts` under `files`; the repository's own `tsconfig.json` checks the declarations the same way.[^tsconfig] Do not rely on `package.json` `types` (see Known issues).

```json
{
    "compilerOptions": {
        "target": "es2015",
        "lib": ["es2015", "dom"],
        "strict": true,
        "skipLibCheck": true,
        "noEmit": true
    },
    "files": [
        "node_modules/@bbalganjjm/natural_js/@types/index.d.ts"
    ],
    "include": [
        "src/**/*.ts"
    ]
}
```

A triple-slash reference in one of your files works too:

```ts
/// <reference path="../node_modules/@bbalganjjm/natural_js/@types/index.d.ts" />
```

## 3. Know the declaration layout

| File | Declares | Runtime source |
|---|---|---|
| `index.d.ts` | `/// <reference types="jquery" />`, then references every `natural.*.d.ts` file below (not `natural_js-tests.ts`), then `export = N` | — |
| `natural.js.d.ts` | `N()`, `interface NJS<T>`, `namespace N` (all static members such as `N.grid`, `N.comm`, `N.notify`) | `src/natural.js.js` |
| `natural.core.d.ts` / `.misc.d.ts` | `class NC`; `NC.Primitive`, `NC.JSONValue`, `NC.JSONObject`, `NC.Selector`, `NC.MaskInstance`, `NC.BrowserType`, `NC.ObjectType` ... | `src/natural.core.js` |
| `natural.architecture.d.ts` / `.misc.d.ts` | `class NA`; `NA.Communicator`, `NA.Request`, `NA.Controller`, `NA.Context`, `NA.Config`; `NA.Options.Request`, `NA.Callbacks.*`, `NA.Objects.Request.{Enctype, DataType, HttpMethod}`, `NA.Objects.Controller.{InitFunction, BaseObject, Object}` | `src/natural.architecture.js` |
| `natural.data.d.ts` / `.misc.d.ts` | `class ND`; `ND.Formatter`, `ND.Validator`, `ND.DataSync`; `ND.FormatRules`, `ND.ValidationRules`, `ND.FormatRuleObject`, `ND.ValidationRuleObject` ... | `src/natural.data.js` |
| `natural.ui.d.ts` / `.misc.d.ts` | `class NU`; `NU.Alert`, `NU.Button`, `NU.Datepicker`, `NU.Popup`, `NU.Tab`, `NU.Select`, `NU.Form`, `NU.List`, `NU.Grid`, `NU.Pagination`, `NU.Tree`; `NU.Options.*`, `NU.EventHandlers.*`, `NU.ButtonSize`, `NU.ButtonColor`, `NU.ButtonType` | `src/natural.ui.js` |
| `natural.ui.shell.d.ts` / `.misc.d.ts` | `class NUS`; `NUS.Notify`, `NUS.Documents`; `NUS.Options.*`, `NUS.EventHandlers.Documents` | `src/natural.ui.shell.js` |
| `natural.template.d.ts` / `.misc.d.ts` | `class NT`; `NT.Options.{Extra, Select, SelectFilter}`, `NT.Objects.Controller.{InitialObject, Object, EventHandler}` | `src/natural.template.js` |
| `natural.code.d.ts` / `.misc.d.ts` | `class NCD`; `NCD.SeverityLevels`, `NCD.CodeInspectionResult` | `src/natural.code.js` |
| `natural_js-tests.ts` | usage samples; not referenced by `index.d.ts`, listed separately under `files` in the repository `tsconfig.json` | — |

## 4. Use N for values, the namespaces for types

At runtime `N` is the only public global (plus jQuery). The bundles also leave compiler-generated names such as `N$$module$__$src$natural_js` and `NC$$module$__$src$natural_core` in the global scope, but `NC`, `NA`, `NU` and the other class names themselves are not defined; see [Build and dist bundles](build-and-dist.md).[^js] Use them only in type positions and for `const enum` members, which the compiler inlines.

| You need | Type |
|---|---|
| Result of `N(...)` | `NJS<T>` |
| JSON row / value | `NC.JSONObject`, `NC.JSONValue`, `NC.Primitive` |
| Controller object | `NA.Objects.Controller.Object` (`NT.Objects.Controller.Object` with Natural-TEMPLATE properties); your own interface extends `NA.Objects.Controller.BaseObject` |
| `init` | `NA.Objects.Controller.InitFunction`: `(view: NJS<HTMLElement[]>, request: NA.Request) => void` |
| Request object | `NA.Request` |
| `N.comm(...)` result, options, callbacks | `NA.Communicator`, `NA.Options.Request`, `NA.Callbacks.Communicator.Submit`, `NA.Callbacks.Communicator.Error` |
| Component instance | `NU.Grid`, `NU.Form`, `NU.Select`, `NU.List`, `NU.Tree`, `NU.Pagination`, `NU.Alert`, `NU.Button`, `NU.Datepicker`, `NU.Popup`, `NU.Tab`, `NUS.Notify`, `NUS.Documents` |
| Component options | `NU.Options.Grid`, `NU.Options.Form`, `NU.Options.Select` ... |
| Event handler | `NU.EventHandlers.Grid.OnSelect`, `NU.EventHandlers.Grid.RowHandler` ... |
| Rule names | `ND.FormatRules`, `ND.ValidationRules` (const enums) |
| Request enums | `NA.Objects.Request.HttpMethod`, `NA.Objects.Request.DataType`, `NA.Objects.Request.Enctype` |

## 5. Write a typed controller

Declare row shapes with `type` aliases: a type alias is assignable to `NC.JSONObject` (index signature), an `interface` is not.

```ts
type User = { id: string; name: string; email: string };

N(".user-page").cont({
    init(view: NJS<HTMLElement[]>, request: NA.Request): void {
        // A form created on empty data has no row until bind() or add() runs.
        const form: NU.Form = N([]).form({ context: N("#userForm", view) });

        const grid: NU.Grid = N([]).grid({
            context: N("#userGrid", view),
            height: 300,
            select: true,
            onSelect: function (rowIdx, rowEle, data) {
                // data is the grid's whole collection; rowIdx is -1 when the row was unselected
                if (rowIdx > -1) {
                    form.bind(rowIdx, data);
                }
            }
        });

        N.comm("user/list.json").submit(function (data) {
            grid.bind(data as User[]);
        });

        N("#btnSave", view).on("click", function () {
            const row = form.data(true)[0] as User | undefined; // undefined until a row is bound
            if (row !== undefined && form.validate()) {
                N(row).comm("user/save.json").submit(function () {
                    N(window).alert("Saved.").show();
                });
            }
        });
    }
});
```

`form.validate()` only checks elements that `bind()` or `add()` has prepared, and returns `true` before that; `form.data(true)` returns `[undefined]` until a row is bound. For a new record call `form.add()` first.[^form-validate][^form-data]

For access from other code, type the controller with your own interface. `instance()` is declared with a wide union return type, so cast through `unknown`:

```ts
interface UserPage extends NA.Objects.Controller.BaseObject {
    grid?: NU.Grid;
    reload(): void;
}

const userPage = N(".user-page").instance("cont") as unknown as UserPage;
```

## 6. Call the server with types

`submit()` without a callback returns the `jqXHR`, which can be awaited.[^arch-dts]

```ts
async function fetchJson<T>(url: string, params: NC.JSONObject = {}): Promise<T> {
    return await N(params).comm(url).submit() as T;
}

const users = await fetchJson<User[]>("user/list.json", { dept: "sales" });
```

## 7. Extend a declaration

The declarations are global, so extend them by declaration merging in a global `.d.ts` file (no `import` or `export`; inside a module, wrap it in `declare global { ... }`):

```ts
declare namespace NA.Options {
    interface Request {
        showLoading?: boolean; // read by your own communication filter via request.options.showLoading
    }
}
```

```ts
N([]).comm({ url: "user/list.json", showLoading: true }).submit(function (data) { /* ... */ });
```

# Verify

- `npx tsc --noEmit -p .` finishes without errors.
- In the editor, `N([]).grid({...})` is typed `NU.Grid` and `grid.bind` offers the `NU.Grid` members.
- In the browser, the compiled code runs against the `dist/` bundle with no `NC is not defined` style errors.

# Pitfalls

The legacy guide used type names that do not exist:

```ts
// Wrong (legacy): "types": ["js/natural_js/@types"]
"files": ["node_modules/@bbalganjjm/natural_js/@types/index.d.ts"]
// Wrong (legacy): init: (view: JQuery, request: NC.Request): void => {}
init: (view: NJS<HTMLElement[]>, request: NA.Request): void => {}
// Wrong (legacy): const grid = N([] as NC.JSONObject[]).grid({ context: "#userGrid", height: 400 }) as NC.Grid;
const grid: NU.Grid = N([]).grid({ context: N("#userGrid", view), height: 400 });
// Wrong (legacy): "p.grid.userList": { height: 400, select: true } as NC.GridOptions
"p.grid.userList": { height: 400, select: true } as NU.Options.Grid
// Wrong (legacy): "c.getUserList": { url: "user/list", cache: false } as NC.CommOptions
"c.getUserList": function () { return N.comm("user/list.json"); }
// Wrong (legacy): interface UserController extends NC.Controller { readonly "p.grid.userList": NC.Grid; }
interface UserController extends NA.Objects.Controller.BaseObject { "p.grid.userList": NU.Grid; }
```

Methods that do not exist on `NU.Grid` and `NU.Form`:

```ts
// Wrong (legacy): const rows = grid.getData();
const rows = grid.data();
// Wrong (legacy): grid.setOption({ onSelect: (rowIdx, rowEle, rowData) => { form.val(rowData); } });
N([]).grid({ context: N("#userGrid", view), select: true, onSelect: function (rowIdx, rowEle, data) { if (rowIdx > -1) form.bind(rowIdx, data); } });
// Wrong (legacy): form.val({ name: "Hong Gil-dong", age: 30 });
form.val("name", "Hong Gil-dong").val("age", 30);
// Wrong (legacy): const userData = form.val() as UserData;
const userData = form.data(true)[0] as User;
```

Calls that the types (and the runtime) reject:

```ts
// Wrong (legacy): N.alert("User information has been saved.").show();
N(window).alert("User information has been saved.").show();
// Wrong (legacy): N.comm({ url: "user/save", data: userData }).submit();
N(userData).comm("user/save.json").submit();
// Wrong (legacy): declare module "natural-js" { export interface MyCustomOptions { feature1: boolean; } }
declare namespace NA.Options { interface Request { feature1?: boolean; } }
// Wrong (legacy): declare namespace NC { interface CommOptions { customOption?: boolean; } }
declare namespace NA.Options { interface Request { customOption?: boolean; } }
```

- Natural-TEMPLATE property keys (`"p.grid.userList"`, `"c.getUserList"`, `"e.btnSave.click"`) only work when Natural-TEMPLATE is loaded and activated; see [Template conventions](../template/conventions.md). The option object becomes a component instance at runtime, so read it back with a cast: `this["p.grid.userList"] as NU.Grid`.
- `N.comm(...).submit(callback)` types `data` as a wide union; a callback declared as `(data: User[]) => void` fails under `strictFunctionTypes`. Take `data` untyped and cast inside (`data as User[]`).
- Adding members to `NC.JSONObject` by declaration merging fails when the member type is not a `NC.JSONValue` (its index signature), so a method cannot be added there.
- `NC`, `NA`, `NU` and the other namespaces are types only. `NC.serialExecute(...)` in `@types/natural_js-tests.ts` compiles, but the runtime call must be `N.serialExecute(...)`.[^tests][^js]
- `const enum` members (`NU.ButtonColor.PRIMARY`, `ND.FormatRules.NUMERIC`) are inlined by `tsc`; with `isolatedModules` (or a transpiler that compiles files one by one) ambient const enums cannot be used, so write the string values instead.
- `N(".button").button()` is typed as returning `NU.Button` but returns the collection; see [N.button](../ui/button.md).

# Known issues

* **`package.json` `types` points to a missing file** - Actual: `"types": "node_modules/@types/natural_js/index.d.ts"` is resolved inside the installed package, where no such path exists, so TypeScript does not find the declarations automatically. Likely intent: `"@types/index.d.ts"`. Workaround: list `@types/index.d.ts` under `files` (step 2).[^package]
* **The namespaces are declared as runtime classes** - Actual: `@types` declares `declare class NC`, `NA`, `ND`, `NU`, `NUS`, `NT` and `NCD`, so `NU.grid` or `NC.string` compile, but the bundles expose the classes only through `window.N` (their global class bindings carry compiler-generated names such as `NU$$module$__$src$natural_ui`), so those names throw `ReferenceError`. Likely intent: expose the classes only through `N`. Workaround: use `N.grid`, `N.string` and so on for values.[^core-dts][^js]
* **`N.version` does not type-check** - Actual: `version` is declared on the `NJS` interface (instances of `N()`), not on `namespace N`; at runtime `N.version` exists and `N().version` is `undefined`. Likely intent: a static `N.version`. Workaround: `(N as any).version`.[^js-dts][^js]
* **`N(el).request()` is declared but not installed** - Actual: `request()` is declared on `class NA`, which `NJS` extends, but `natural.js.js` skips `request` when it installs prototype methods on `jQuery.fn`, so the call throws `TypeError`. Likely intent: unclear. Workaround: use the `request` argument of `init` or `cont.request`.[^arch-dts][^js]
* **`N.comm` rejects plain objects** - Actual: `N.comm(obj: NJS<NC.JSONObject[]> | string, url?)` refuses a plain data object (`N.comm({ key: 1 }, "url")`) and an options object (`N.comm({ url })`), both of which the runtime accepts. Likely intent: accept `NC.JSONObject` and `NA.Options.Request` as the first argument. Workaround: `N(data).comm(url)` or `N([]).comm({ url, ... })`.[^js-dts]

# Next

- [API conventions](../overview/api-conventions.md) - class and plugin forms, which the types mirror.
- [Controller](../architecture/controller.md) - the controller object and `init`.
- [Communicator](../architecture/communicator.md) - `N.comm`, `submit` and error handlers.
- [N.grid](../ui/grid.md) - grid options and methods behind `NU.Grid`.
- [Installation](installation.md) - where the declaration files come from.

[^index]: @types/index.d.ts (entry, references every declaration file)
[^package]: package.json (types and devDependencies)
[^tsconfig]: tsconfig.json (how the repository type-checks the declarations)
[^js]: natural.js.js (runtime globals, plugins installed on jQuery.fn)
[^arch-dts]: @types/natural.architecture.d.ts (class NA, NA.Communicator, NA.Request)
[^tests]: @types/natural_js-tests.ts (type-checked usage samples)
[^core-dts]: @types/natural.core.d.ts (class NC)
[^js-dts]: @types/natural.js.d.ts (N, NJS, namespace N)
[^form-validate]: NU.form.prototype.validate (triggers the validators that bind() registers)
[^form-data]: NU.form.prototype.data (data(true) returns the current row)
