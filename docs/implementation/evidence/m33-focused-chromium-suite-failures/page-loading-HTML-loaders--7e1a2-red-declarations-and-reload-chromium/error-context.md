# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: page-loading.spec.ts >> HTML loaders capture once, use plain calls and remain independent across shared declarations and reload
- Location: tests\browser\page-loading.spec.ts:18:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Object {
    "allAborted": true,
    "calls": 4,
    "controllers": 4,
    "isolated": true,
-   "plain": true,
+   "plain": false,
    "reads": 3,
    "roots": 3,
  }
```

# Page snapshot

```yaml
- main [ref=e2]:
  - heading "Natural-JS 2.0 import smoke" [level=1] [ref=e3]
  - paragraph [ref=e4]:
    - link "Grid contract demo" [ref=e5] [cursor=pointer]:
      - /url: /m10/demo.html
    - text: ·
    - link "Choice-group CVC demo" [ref=e6] [cursor=pointer]:
      - /url: /m5/choices.html
    - text: ·
    - link "Tree and DatePicker CVC demo" [ref=e7] [cursor=pointer]:
      - /url: /m11/side.html
    - text: ·
    - link "Application shell demo" [ref=e8] [cursor=pointer]:
      - /url: /m12/side.html
  - generic [ref=e9]:
    - heading "First authored view" [level=2] [ref=e10]
    - button "Check import" [ref=e11]
    - status [ref=e12]: ESM ready
  - generic [ref=e13]:
    - heading "Second authored view" [level=2] [ref=e14]
    - button "Check import" [ref=e15]
    - status [ref=e16]: ESM ready
```

# Test source

```ts
  1   | // SPDX-License-Identifier: Apache-2.0
  2   | import { fileURLToPath } from "node:url";
  3   | import { expect, test } from "@playwright/test";
  4   | import type { PageContext, PageDefinition } from "../../src/page/index.js";
  5   | 
  6   | const source = (relative: string) => `/@fs/${fileURLToPath(new URL(relative, import.meta.url)).replaceAll("\\", "/")}`;
  7   | const modules = { pageModule: source("../../src/page/index.ts"), commModule: source("../../src/comm/index.ts"),
  8   |   popupModule: source("../../src/ui/popup.ts"), tabsModule: source("../../src/ui/tabs.ts"), documentsModule: source("../../src/ui/documents.ts") };
  9   | const tabsMarkup = '<div role="tablist" aria-label="Pages"><button type="button" role="tab" data-tab="a">A</button>' +
  10  |   '<button type="button" role="tab" data-tab="b">B</button></div><section role="tabpanel" data-panel="a" hidden></section>' +
  11  |   '<section role="tabpanel" data-panel="b" hidden></section><p role="alert" data-tab-error hidden></p>';
  12  | const documentsMarkup = '<div role="tablist" aria-label="Documents"><template data-document-tab-template><div role="presentation">' +
  13  |   '<button type="button" role="tab" data-document-tab><span data-document-title></span></button>' +
  14  |   '<button type="button" data-document-close aria-label="Close document">×</button></div></template></div>' +
  15  |   '<div data-document-items></div><div data-document-panels><template data-document-panel-template><section role="tabpanel" hidden></section></template></div>' +
  16  |   '<div data-document-empty><button type="button">Open a document</button></div><p data-document-error role="alert" hidden></p>';
  17  | 
  18  | test("HTML loaders capture once, use plain calls and remain independent across shared declarations and reload", async ({ page }) => {
  19  |   await page.goto("/");
  20  |   const result = await page.evaluate(async ({ pageModule }) => {
  21  |     const { mountPage } = await import(pageModule);
  22  |     const hosts = Array.from({ length: 3 }, () => document.createElement("div")); document.body.append(...hosts);
  23  |     let reads = 0, calls = 0, controllers = 0;
  24  |     const receivers: unknown[] = [], signals: AbortSignal[] = [];
  25  |     const load = async function(this: unknown, url: URL, signal: AbortSignal) {
  26  |       receivers.push(this); signals.push(signal); calls++; return `<section data-url="${url.pathname}">Captured</section>`;
  27  |     };
  28  |     const definition = { view: new URL("/m33/same.html", location.href), get loadHtml() { reads++; return load; },
  29  |       controller: () => { controllers++; return {}; } };
  30  |     const first = mountPage(hosts[0], definition); await first.ready;
  31  |     Object.defineProperty(definition, "loadHtml", { value: async () => { throw new Error("Late replacement"); } });
  32  |     const shared = Object.freeze({ view: definition.view, get loadHtml() { reads++; return load; }, controller: definition.controller });
  33  |     const second = mountPage(hosts[1], shared), third = mountPage(hosts[2], shared); await Promise.all([second.ready, third.ready]);
  34  |     await first.reload();
  35  |     const isolated = signals[0].aborted && !signals[1].aborted && !signals[2].aborted && signals[0] !== signals[3];
  36  |     const roots = new Set([first.root, second.root, third.root]).size;
  37  |     await Promise.all([first.dispose(), second.dispose(), third.dispose()]); hosts.forEach(host => host.remove());
  38  |     return { reads, calls, controllers, plain: receivers.every(value => value === undefined), isolated, roots, allAborted: signals.every(signal => signal.aborted) };
  39  |   }, modules);
> 40  |   expect(result).toEqual({ reads: 3, calls: 4, controllers: 4, plain: true, isolated: true, roots: 3, allAborted: true });
      |                  ^ Error: expect(received).toEqual(expected) // deep equality
  41  | });
  42  | 
  43  | test("an absent loader stays native while borrowed and factory roots do not call a supplied loader", async ({ page }) => {
  44  |   let requests = 0;
  45  |   await page.route("**/m33/native.html", route => { requests++; return route.fulfill({ contentType: "text/html", body: "<section>Native</section>" }); });
  46  |   await page.goto("/");
  47  |   const result = await page.evaluate(async ({ pageModule }) => {
  48  |     const { mountPage } = await import(pageModule);
  49  |     const hosts = Array.from({ length: 3 }, () => document.createElement("div")); document.body.append(...hosts);
  50  |     let called = 0;
  51  |     const definition: PageDefinition = { view: new URL("/m33/native.html", location.href), controller: () => ({}) };
  52  |     const native = mountPage(hosts[0], definition);
  53  |     definition.loadHtml = async () => { called++; throw new Error("Must remain absent"); };
  54  |     await native.ready; await native.reload();
  55  |     const borrowedRoot = document.createElement("article"); hosts[1].append(borrowedRoot);
  56  |     const loadHtml = async () => { called++; throw new Error("Not a URL source"); };
  57  |     const borrowed = mountPage(hosts[1], { view: borrowedRoot, loadHtml, controller: () => ({}) });
  58  |     const generated = mountPage(hosts[2], { view: () => document.createElement("article"), loadHtml, controller: () => ({}) });
  59  |     await Promise.all([borrowed.ready, generated.ready]);
  60  |     const text = native.root?.textContent;
  61  |     await Promise.all([native.dispose(), borrowed.dispose(), generated.dispose()]);
  62  |     const borrowedKept = hosts[1].firstElementChild === borrowedRoot; hosts.forEach(host => host.remove());
  63  |     return { called, text, borrowedKept };
  64  |   }, modules);
  65  |   expect(result).toEqual({ called: 0, text: "Native", borrowedKept: true }); expect(requests).toBe(2);
  66  | });
  67  | 
  68  | test("loader function, text result and one-root failures happen before controller work", async ({ page }) => {
  69  |   await page.goto("/");
  70  |   const result = await page.evaluate(async ({ pageModule }) => {
  71  |     const { mountPage } = await import(pageModule);
  72  |     const host = document.createElement("div"); document.body.append(host);
  73  |     const codes: string[] = []; let controllers = 0;
  74  |     const definition = { view: new URL("/m33/unused.html", location.href), controller: () => { controllers++; return {}; } };
  75  |     for (const loadHtml of [null, false, 0, "bad", {}]) {
  76  |       try { mountPage(host, { ...definition, loadHtml }); } catch (cause) { codes.push((cause as { code: string }).code); }
  77  |     }
  78  |     for (const value of [undefined, null, false, {}, new String("<section></section>"), new Response("<section></section>"), "", "<section></section><section></section>"]) {
  79  |       const handle = mountPage(host, { ...definition, loadHtml: async () => value });
  80  |       codes.push(await handle.ready.then(() => "none", (cause: { code: string }) => cause.code)); await handle.dispose();
  81  |     }
  82  |     const empty = host.childElementCount === 0; host.remove(); return { codes, controllers, empty };
  83  |   }, modules);
  84  |   expect(result).toEqual({ codes: [...Array(5).fill("PAGE_OPTIONS"), ...Array(6).fill("PAGE_LOAD"), "ROOT_MISSING", "ROOT_MISSING"], controllers: 0, empty: true });
  85  | });
  86  | 
  87  | test("a communicator HTML loader uses common request and response processing before page parsing", async ({ page }) => {
  88  |   let prepared = false;
  89  |   await page.route("**/m33/policy.html", route => {
  90  |     prepared = route.request().headers()["x-page-policy"] === "employee";
  91  |     return route.fulfill({ contentType: "text/html", body: '<section data-page="raw">Original</section>' });
  92  |   });
  93  |   await page.goto("/");
  94  |   const result = await page.evaluate(async ({ pageModule, commModule }) => {
  95  |     const { mountPage } = await import(pageModule), { createCommunicator } = await import(commModule);
  96  |     const order: string[] = [], host = document.createElement("div"); document.body.append(host);
  97  |     const comm = createCommunicator({ prepare(request: Request) { order.push("prepare"); request.headers.set("X-Page-Policy", "employee"); return request; },
  98  |       async after(response: Response) { order.push("after"); return new Response((await response.text()).replace("Original", "Processed"), { status: response.status }); } });
  99  |     const handle = mountPage(host, { view: new URL("/m33/policy.html", location.href),
  100 |       loadHtml: (url: URL, signal: AbortSignal) => comm.request({ url, signal, decode(response: Response) { order.push("decode"); return response.text(); } }),
  101 |       controller: () => ({ init() { order.push("init"); }, activate() { order.push("activate"); } }) });
  102 |     await handle.ready; const text = handle.root?.textContent; await handle.dispose(); host.remove(); return { text, order };
  103 |   }, modules);
  104 |   expect(prepared).toBe(true); expect(result).toEqual({ text: "Processed", order: ["prepare", "after", "decode", "init", "activate"] });
  105 | });
  106 | 
  107 | test("native loading and communicator loading retain their own HTTP network and decode errors", async ({ page }) => {
  108 |   await page.route("**/m33/http.html", route => route.fulfill({ status: 503, body: "Unavailable" }));
  109 |   await page.route("**/m33/network.html", route => route.abort());
  110 |   await page.route("**/m33/decode.html", route => route.fulfill({ body: "not JSON" }));
  111 |   await page.goto("/");
  112 |   const result = await page.evaluate(async ({ pageModule, commModule }) => {
  113 |     const { mountPage } = await import(pageModule), { createCommunicator } = await import(commModule);
  114 |     const host = document.createElement("div"); document.body.append(host); const comm = createCommunicator(), cause = new Error("Application load failed");
  115 |     const definitions = [
  116 |       { view: new URL("/m33/http.html", location.href) }, { view: new URL("/m33/network.html", location.href) },
  117 |       { view: new URL("/m33/http.html", location.href), loadHtml: (url: URL, signal: AbortSignal) => comm.request({ url, signal, decode: (response: Response) => response.text() }) },
  118 |       { view: new URL("/m33/decode.html", location.href), loadHtml: (url: URL, signal: AbortSignal) => comm.request({ url, signal, decode: (response: Response) => response.json() }) },
  119 |       { view: new URL("/m33/unused.html", location.href), loadHtml: async () => { throw cause; } }
  120 |     ];
  121 |     const codes: string[] = []; let original = false;
  122 |     for (const definition of definitions) {
  123 |       const handle = mountPage(host, { ...definition, controller: () => ({}) });
  124 |       await handle.ready.catch((error: { code: string; cause?: unknown }) => { codes.push(error.code); original ||= error.cause === cause; }); await handle.dispose();
  125 |     }
  126 |     const empty = host.childElementCount === 0; host.remove(); return { codes, original, empty };
  127 |   }, modules);
  128 |   expect(result).toEqual({ codes: ["PAGE_HTTP", "PAGE_FETCH", "REQUEST_HTTP", "REQUEST_DECODE", "PAGE_FETCH"], original: true, empty: true });
  129 | });
  130 | 
  131 | test("hung and late loaders abort promptly without affecting a second loader at the same URL", async ({ page }) => {
  132 |   const errors: string[] = []; page.on("pageerror", error => errors.push(error.message)); await page.goto("/");
  133 |   const result = await page.evaluate(async ({ pageModule }) => {
  134 |     const { mountPage } = await import(pageModule);
  135 |     const hosts = [document.createElement("div"), document.createElement("div")]; document.body.append(...hosts);
  136 |     let enter!: () => void, release!: (value: string) => void, firstSignal!: AbortSignal, secondSignal!: AbortSignal, firstControllers = 0;
  137 |     const entered = new Promise<void>(resolve => { enter = resolve; }), view = new URL("/m33/same.html", location.href);
  138 |     const first = mountPage(hosts[0], { view, loadHtml: (_url: URL, signal: AbortSignal) => { firstSignal = signal; enter(); return new Promise<string>(resolve => { release = resolve; }); },
  139 |       controller: () => { firstControllers++; return {}; } });
  140 |     const outcome = first.ready.then(() => "ready", (cause: Error) => cause.name);
```