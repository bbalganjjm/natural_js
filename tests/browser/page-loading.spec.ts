// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { PageContext, PageDefinition } from "../../src/page/index.js";

const source = (relative: string) => `/@fs/${fileURLToPath(new URL(relative, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { pageModule: source("../../src/page/index.ts"), commModule: source("../../src/comm/index.ts"),
  popupModule: source("../../src/ui/popup.ts"), tabsModule: source("../../src/ui/tabs.ts"), documentsModule: source("../../src/ui/documents.ts") };
const tabsMarkup = '<div role="tablist" aria-label="Pages"><button type="button" role="tab" data-tab="a">A</button>' +
  '<button type="button" role="tab" data-tab="b">B</button></div><section role="tabpanel" data-panel="a" hidden></section>' +
  '<section role="tabpanel" data-panel="b" hidden></section><p role="alert" data-tab-error hidden></p>';
const documentsMarkup = '<div role="tablist" aria-label="Documents"><template data-document-tab-template><div role="presentation">' +
  '<button type="button" role="tab" data-document-tab><span data-document-title></span></button>' +
  '<button type="button" data-document-close aria-label="Close document">×</button></div></template></div>' +
  '<div data-document-items></div><div data-document-panels><template data-document-panel-template><section role="tabpanel" hidden></section></template></div>' +
  '<div data-document-empty><button type="button">Open a document</button></div><p data-document-error role="alert" hidden></p>';

test("HTML loaders capture once, use plain calls and remain independent across shared declarations and reload", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule);
    const hosts = Array.from({ length: 3 }, () => document.createElement("div")); document.body.append(...hosts);
    let reads = 0, calls = 0, controllers = 0;
    const receivers: unknown[] = [], signals: AbortSignal[] = [];
    const load = async function(this: unknown, url: URL, signal: AbortSignal) {
      "use strict";
      receivers.push(this); signals.push(signal); calls++; return `<section data-url="${url.pathname}">Captured</section>`;
    };
    const definition = { view: new URL("/m33/same.html", location.href), get loadHtml() { reads++; return load; },
      controller: () => { controllers++; return {}; } };
    const first = mountPage(hosts[0], definition); await first.ready;
    Object.defineProperty(definition, "loadHtml", { value: async () => { throw new Error("Late replacement"); } });
    const shared = Object.freeze({ view: definition.view, get loadHtml() { reads++; return load; }, controller: definition.controller });
    const second = mountPage(hosts[1], shared), third = mountPage(hosts[2], shared); await Promise.all([second.ready, third.ready]);
    await first.reload();
    const isolated = signals[0].aborted && !signals[1].aborted && !signals[2].aborted && signals[0] !== signals[3];
    const roots = new Set([first.root, second.root, third.root]).size;
    await Promise.all([first.dispose(), second.dispose(), third.dispose()]); hosts.forEach(host => host.remove());
    return { reads, calls, controllers, plain: receivers.every(value => value === undefined), isolated, roots, allAborted: signals.every(signal => signal.aborted) };
  }, modules);
  expect(result).toEqual({ reads: 3, calls: 4, controllers: 4, plain: true, isolated: true, roots: 3, allAborted: true });
});

test("an absent loader stays native while borrowed and factory roots do not call a supplied loader", async ({ page }) => {
  let requests = 0;
  await page.route("**/m33/native.html", route => { requests++; return route.fulfill({ contentType: "text/html", body: "<section>Native</section>" }); });
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule);
    const hosts = Array.from({ length: 3 }, () => document.createElement("div")); document.body.append(...hosts);
    let called = 0;
    const definition: PageDefinition = { view: new URL("/m33/native.html", location.href), controller: () => ({}) };
    const native = mountPage(hosts[0], definition);
    definition.loadHtml = async () => { called++; throw new Error("Must remain absent"); };
    await native.ready; await native.reload();
    const borrowedRoot = document.createElement("article"); hosts[1].append(borrowedRoot);
    const loadHtml = async () => { called++; throw new Error("Not a URL source"); };
    const borrowed = mountPage(hosts[1], { view: borrowedRoot, loadHtml, controller: () => ({}) });
    const generated = mountPage(hosts[2], { view: () => document.createElement("article"), loadHtml, controller: () => ({}) });
    await Promise.all([borrowed.ready, generated.ready]);
    const text = native.root?.textContent;
    await Promise.all([native.dispose(), borrowed.dispose(), generated.dispose()]);
    const borrowedKept = hosts[1].firstElementChild === borrowedRoot; hosts.forEach(host => host.remove());
    return { called, text, borrowedKept };
  }, modules);
  expect(result).toEqual({ called: 0, text: "Native", borrowedKept: true }); expect(requests).toBe(2);
});

test("loader function, text result and one-root failures happen before controller work", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule);
    const host = document.createElement("div"); document.body.append(host);
    const codes: string[] = []; let controllers = 0;
    const definition = { view: new URL("/m33/unused.html", location.href), controller: () => { controllers++; return {}; } };
    for (const loadHtml of [null, false, 0, "bad", {}]) {
      try { mountPage(host, { ...definition, loadHtml }); } catch (cause) { codes.push((cause as { code: string }).code); }
    }
    for (const value of [undefined, null, false, {}, new String("<section></section>"), new Response("<section></section>"), "", "<section></section><section></section>"]) {
      const handle = mountPage(host, { ...definition, loadHtml: async () => value });
      codes.push(await handle.ready.then(() => "none", (cause: { code: string }) => cause.code)); await handle.dispose();
    }
    const empty = host.childElementCount === 0; host.remove(); return { codes, controllers, empty };
  }, modules);
  expect(result).toEqual({ codes: [...Array(5).fill("PAGE_OPTIONS"), ...Array(6).fill("PAGE_LOAD"), "ROOT_MISSING", "ROOT_MISSING"], controllers: 0, empty: true });
});

test("a communicator HTML loader uses common request and response processing before page parsing", async ({ page }) => {
  let prepared = false;
  await page.route("**/m33/policy.html", route => {
    prepared = route.request().headers()["x-page-policy"] === "employee";
    return route.fulfill({ contentType: "text/html", body: '<section data-page="raw">Original</section>' });
  });
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule, commModule }) => {
    const { mountPage } = await import(pageModule), { createCommunicator } = await import(commModule);
    const order: string[] = [], host = document.createElement("div"); document.body.append(host);
    const comm = createCommunicator({ prepare(request: Request) { order.push("prepare"); request.headers.set("X-Page-Policy", "employee"); return request; },
      async after(response: Response) { order.push("after"); return new Response((await response.text()).replace("Original", "Processed"), { status: response.status }); } });
    const handle = mountPage(host, { view: new URL("/m33/policy.html", location.href),
      loadHtml: (url: URL, signal: AbortSignal) => comm.request({ url, signal, decode(response: Response) { order.push("decode"); return response.text(); } }),
      controller: () => ({ init() { order.push("init"); }, activate() { order.push("activate"); } }) });
    await handle.ready; const text = handle.root?.textContent; await handle.dispose(); host.remove(); return { text, order };
  }, modules);
  expect(prepared).toBe(true); expect(result).toEqual({ text: "Processed", order: ["prepare", "after", "decode", "init", "activate"] });
});

test("native loading and communicator loading retain their own HTTP network and decode errors", async ({ page }) => {
  await page.route("**/m33/http.html", route => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.route("**/m33/network.html", route => route.abort());
  await page.route("**/m33/decode.html", route => route.fulfill({ body: "not JSON" }));
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule, commModule }) => {
    const { mountPage } = await import(pageModule), { createCommunicator } = await import(commModule);
    const host = document.createElement("div"); document.body.append(host); const comm = createCommunicator(), cause = new Error("Application load failed");
    const definitions = [
      { view: new URL("/m33/http.html", location.href) }, { view: new URL("/m33/network.html", location.href) },
      { view: new URL("/m33/http.html", location.href), loadHtml: (url: URL, signal: AbortSignal) => comm.request({ url, signal, decode: (response: Response) => response.text() }) },
      { view: new URL("/m33/decode.html", location.href), loadHtml: (url: URL, signal: AbortSignal) => comm.request({ url, signal, decode: (response: Response) => response.json() }) },
      { view: new URL("/m33/unused.html", location.href), loadHtml: async () => { throw cause; } }
    ];
    const codes: string[] = []; let original = false;
    for (const definition of definitions) {
      const handle = mountPage(host, { ...definition, controller: () => ({}) });
      await handle.ready.catch((error: { code: string; cause?: unknown }) => { codes.push(error.code); original ||= error.cause === cause; }); await handle.dispose();
    }
    const empty = host.childElementCount === 0; host.remove(); return { codes, original, empty };
  }, modules);
  expect(result).toEqual({ codes: ["PAGE_HTTP", "PAGE_FETCH", "REQUEST_HTTP", "REQUEST_DECODE", "PAGE_FETCH"], original: true, empty: true });
});

test("hung and late loaders abort promptly without affecting a second loader at the same URL", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message)); await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule);
    const hosts = [document.createElement("div"), document.createElement("div")]; document.body.append(...hosts);
    let enter!: () => void, release!: (value: string) => void, firstSignal!: AbortSignal, secondSignal!: AbortSignal, firstControllers = 0;
    const entered = new Promise<void>(resolve => { enter = resolve; }), view = new URL("/m33/same.html", location.href);
    const first = mountPage(hosts[0], { view, loadHtml: (_url: URL, signal: AbortSignal) => { firstSignal = signal; enter(); return new Promise<string>(resolve => { release = resolve; }); },
      controller: () => { firstControllers++; return {}; } });
    const outcome = first.ready.then(() => "ready", (cause: Error) => cause.name);
    const second = mountPage(hosts[1], { view, loadHtml: async (_url: URL, signal: AbortSignal) => { secondSignal = signal; return "<section>Second</section>"; }, controller: () => ({}) });
    await entered; await second.ready; await first.dispose();
    const isolated = firstSignal.aborted && !secondSignal.aborted && second.root?.textContent === "Second";
    release("<section>Late</section>"); await Promise.resolve(); await Promise.resolve();
    const empty = hosts[0].childElementCount === 0 && first.root === null;
    let rejectLate!: (cause: Error) => void;
    const rejected = mountPage(hosts[0], { view, loadHtml: () => new Promise<string>((_resolve, reject) => { rejectLate = reject; }), controller: () => { firstControllers++; return {}; } });
    const rejection = rejected.ready.then(() => "ready", (cause: Error) => cause.name);
    await rejected.dispose(); rejectLate(new Error("Ignored late rejection")); await new Promise(resolve => setTimeout(resolve, 0));
    await second.dispose(); hosts.forEach(host => host.remove()); return { outcome: await outcome, lateRejection: await rejection, isolated, firstControllers, empty };
  }, modules);
  expect(result).toEqual({ outcome: "AbortError", lateRejection: "AbortError", isolated: true, firstControllers: 0, empty: true }); expect(errors).toEqual([]);
});

test("rapid reload uses the captured loader and rejects an old generation before its HTML arrives", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
    let enter!: () => void, release!: (value: string) => void, calls = 0, controllers = 0;
    const entered = new Promise<void>(resolve => { enter = resolve; });
    const definition = { view: new URL("/m33/reload.html", location.href), loadHtml: async () => {
      if (++calls === 1) { enter(); return new Promise<string>(resolve => { release = resolve; }); } return "<section>New</section>";
    }, controller: () => { controllers++; return {}; } };
    const handle = mountPage(host, definition), first = handle.ready.then(() => "ready", (cause: Error) => cause.name);
    await entered; await handle.reload(); release("<section>Old</section>"); await Promise.resolve(); await Promise.resolve();
    const text = handle.root?.textContent; await handle.dispose(); host.remove(); return { first: await first, calls, controllers, text };
  }, modules);
  expect(result).toEqual({ first: "AbortError", calls: 2, controllers: 1, text: "New" });
});

test("safe nested template IDs remain inert while live page IDs stay unique", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"), existing = document.createElement("span");
    existing.id = "m33-inert-id"; document.body.append(existing, host);
    const handle = mountPage(host, { view: new URL("/m33/inert.html", location.href),
      loadHtml: async () => '<section><template><label for="m33-inert-id">Choice</label><input id="m33-inert-id"><input id="m33-inert-id"><template><input id="m33-inert-id"></template></template></section>',
      controller: () => ({}) });
    await handle.ready;
    const template = handle.root!.querySelector("template")!;
    const result = { directInertIds: template.content.querySelectorAll("[id]").length, liveIds: document.querySelectorAll('[id="m33-inert-id"]').length,
      nestedId: template.content.querySelector("template")!.content.querySelector("input")!.id };
    await handle.dispose(); existing.remove(); host.remove(); return result;
  }, modules);
  expect(result).toEqual({ directInertIds: 2, liveIds: 1, nestedId: "m33-inert-id" });
});

for (const [name, payload] of [
  ["script", "<script>globalThis.__m33Executed = true</script>"], ["event attribute", '<img onerror="globalThis.__m33Executed = true">'],
  ["executable URL", '<a href="javascript:globalThis.__m33Executed=true">Open</a>'], ["srcdoc", '<iframe srcdoc="unsafe"></iframe>']
]) test(`native and custom HTML reject ${name} inside multiply nested templates before insertion`, async ({ page }) => {
  const html = `<section><template><template>${payload}</template></template></section>`;
  await page.route("**/m33/unsafe.html", route => route.fulfill({ contentType: "text/html", body: html })); await page.goto("/");
  const result = await page.evaluate(async ({ pageModule, html }) => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host); let controllers = 0;
    const codes: string[] = [];
    for (const custom of [false, true]) {
      const handle = mountPage(host, { view: new URL("/m33/unsafe.html", location.href), ...(custom ? { loadHtml: async () => html } : {}),
        controller: () => { controllers++; return {}; } });
      codes.push(await handle.ready.then(() => "none", (cause: { code: string }) => cause.code)); await handle.dispose();
    }
    const empty = host.childElementCount === 0, ran = (globalThis as { __m33Executed?: boolean }).__m33Executed === true; host.remove();
    return { codes, controllers, empty, ran };
  }, { pageModule: modules.pageModule, html });
  expect(result).toEqual({ codes: ["PAGE_HTML", "PAGE_HTML"], controllers: 0, empty: true, ran: false });
});

test("main Popup Tabs and Documents forward one complete HTML-loaded definition", async ({ page }) => {
  const requestPolicies: (string | undefined)[] = [];
  await page.route("**/m33/shared.html", route => {
    requestPolicies.push(route.request().headers()["x-page-policy"]);
    return route.fulfill({ contentType: "text/html", body: '<article><button type="button" data-output>Original</button></article>' });
  });
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule, commModule, popupModule, tabsModule, documentsModule, tabsMarkup, documentsMarkup }) => {
    const { mountPage } = await import(pageModule), { createCommunicator } = await import(commModule), { openPopup } = await import(popupModule), { bindTabs } = await import(tabsModule), { bindDocuments } = await import(documentsModule);
    const mainHost = document.createElement("div"), dialog = document.createElement("dialog"), tabsRoot = document.createElement("section"), documentsRoot = document.createElement("section");
    dialog.setAttribute("aria-label", "Employee popup"); dialog.innerHTML = '<div data-page-host></div>';
    tabsRoot.dataset.tabs = ""; tabsRoot.innerHTML = tabsMarkup; documentsRoot.dataset.documents = ""; documentsRoot.innerHTML = documentsMarkup;
    document.body.append(mainHost, dialog, tabsRoot, documentsRoot);
    let reads = 0, loads = 0, disposed = 0, prepares = 0, afters = 0, decodes = 0; const outputs: string[] = [], signals: AbortSignal[] = [], texts: (string | null)[] = [];
    const comm = createCommunicator({ prepare(request: Request) { prepares++; request.headers.set("X-Page-Policy", "containers"); return request; },
      async after(response: Response) { afters++; return new Response((await response.text()).replace("Original", "Processed"), { status: response.status }); } });
    const definition = { view: new URL("/m33/shared.html", location.href), get loadHtml() { reads++; return (url: URL, signal: AbortSignal) => {
      loads++; signals.push(signal); return comm.request({ url, signal, decode(response: Response) { decodes++; return response.text(); } }); }; },
      controller(context: PageContext<{ slot: string }, string>) {
        texts.push(context.root.querySelector("button")!.textContent);
        context.root.dataset.slot = context.input.slot;
        context.root.querySelector("button")!.addEventListener("click", () => context.output(context.input.slot), { signal: context.signal });
        return { dispose() { disposed++; } };
      } };
    const main = mountPage(mainHost, definition, { slot: "main" }); main.onOutput((value: string) => outputs.push(value)); await main.ready;
    main.root!.querySelector<HTMLButtonElement>("button")!.click();
    const popup = openPopup(dialog, definition, { slot: "popup" }); await popup.ready; dialog.querySelector<HTMLButtonElement>("button")!.click(); const popupOutput = await popup.result;
    function create(host: HTMLElement, slot: string) { const handle = mountPage(host, definition, { slot }); handle.onOutput((value: string) => outputs.push(value)); return handle; }
    const tabs = bindTabs(tabsRoot, { initial: "a", pages: { a: (host: HTMLElement) => create(host, "tab"), b: (host: HTMLElement) => create(host, "unused") } }); await tabs.ready;
    tabsRoot.querySelector<HTMLButtonElement>("[data-output]")!.click();
    const documents = bindDocuments(documentsRoot); await documents.open("a", { title: "Employee", page: (host: HTMLElement) => create(host, "document") });
    documentsRoot.querySelector<HTMLButtonElement>("[data-output]")!.click();
    const count = new Set(signals).size; await Promise.all([main.dispose(), tabs.dispose(), documents.dispose(), popup.dispose()]);
    [mainHost, dialog, tabsRoot, documentsRoot].forEach(root => root.remove()); return { reads, loads, disposed, outputs, popupOutput, count, prepares, afters, decodes, texts, allAborted: signals.every(signal => signal.aborted) };
  }, { ...modules, tabsMarkup, documentsMarkup });
  expect(result).toEqual({ reads: 4, loads: 4, disposed: 4, outputs: ["main", "tab", "document"], popupOutput: "popup", count: 4, prepares: 4, afters: 4, decodes: 4,
    texts: Array(4).fill("Processed"), allAborted: true });
  expect(requestPolicies).toEqual(Array(4).fill("containers"));
});

test("failed loaded Tab and Document candidates restore their retained page without reconstructing it", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule, tabsModule, documentsModule, tabsMarkup, documentsMarkup }) => {
    const { mountPage } = await import(pageModule), { bindTabs } = await import(tabsModule), { bindDocuments } = await import(documentsModule);
    const tabsRoot = document.createElement("section"), documentsRoot = document.createElement("section"); tabsRoot.dataset.tabs = ""; tabsRoot.innerHTML = tabsMarkup;
    documentsRoot.dataset.documents = ""; documentsRoot.innerHTML = documentsMarkup; document.body.append(tabsRoot, documentsRoot);
    let mounts = 0, disposed = 0, failedControllers = 0;
    const good = { view: new URL("/m33/good.html", location.href), loadHtml: async () => '<article data-loaded="good">Retained</article>',
      controller: () => { mounts++; return { dispose() { disposed++; } }; } };
    const bad = { view: new URL("/m33/fail.html", location.href), loadHtml: async () => { throw new Error("Loader failed"); }, controller: () => { failedControllers++; return {}; } };
    const tabs = bindTabs(tabsRoot, { initial: "a", pages: { a: (host: HTMLElement) => mountPage(host, good), b: (host: HTMLElement) => mountPage(host, bad) } });
    await tabs.ready; const tabRoot = tabsRoot.querySelector('[data-loaded="good"]');
    const tabError = await tabs.select("b").then(() => "none", (cause: { code: string }) => cause.code);
    const documents = bindDocuments(documentsRoot); await documents.open("a", { title: "Good", page: (host: HTMLElement) => mountPage(host, good) });
    const documentRoot = documentsRoot.querySelector('[data-loaded="good"]');
    const documentError = await documents.open("b", { title: "Bad", page: (host: HTMLElement) => mountPage(host, bad) }).then(() => "none", (cause: { code: string }) => cause.code);
    const kept = tabs.selected() === "a" && documents.selected() === "a" && tabRoot === tabsRoot.querySelector('[data-loaded="good"]') && documentRoot === documentsRoot.querySelector('[data-loaded="good"]');
    const failedEmpty = tabsRoot.querySelector('[data-panel="b"]')!.childElementCount === 0;
    const before = disposed; await Promise.all([tabs.dispose(), documents.dispose()]); tabsRoot.remove(); documentsRoot.remove();
    return { tabError, documentError, kept, failedEmpty, mounts, failedControllers, before, disposed };
  }, { ...modules, tabsMarkup, documentsMarkup });
  expect(result).toEqual({ tabError: "PAGE_FETCH", documentError: "PAGE_FETCH", kept: true, failedEmpty: true, mounts: 2, failedControllers: 0, before: 0, disposed: 2 });
});

test("owned destination and replacement recipes retain old pages until a candidate is ready and release failed candidate work", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule), root = document.createElement("section"), firstHost = document.createElement("div"), siblingHost = document.createElement("div");
    root.append(firstHost, siblingHost); document.body.append(root);
    const events: string[] = []; let cleaned = 0, releasedSignal!: AbortSignal;
    const definition = (label: string) => ({ view: new URL("/m33/same.html", location.href), loadHtml: async () => `<article>${label}</article>`,
      controller: () => ({ activate() { events.push(label + ":activate"); }, dispose() { events.push(label + ":dispose"); } }) });
    const previous = mountPage(firstHost, definition("old")), sibling = mountPage(siblingHost, definition("sibling")); await Promise.all([previous.ready, sibling.ready]);
    const oldRoot = previous.root, siblingRoot = sibling.root;
    const failedHost = document.createElement("div"); failedHost.hidden = true; failedHost.inert = true; root.append(failedHost);
    const failed = mountPage(failedHost, { ...definition("failed"), controller(context: PageContext) { releasedSignal = context.signal; context.own(() => { cleaned++; });
      return { init() { throw new Error("Candidate initialization failed"); } }; } });
    const failure = await failed.ready.then(() => "none", (cause: { code: string }) => cause.code); await failed.dispose(); failedHost.remove();
    const retained = previous.root === oldRoot && oldRoot!.isConnected && sibling.root === siblingRoot && cleaned === 1 && releasedSignal.aborted;
    const canceledHost = document.createElement("div"); canceledHost.hidden = true; canceledHost.inert = true; root.append(canceledHost);
    let release!: (html: string) => void, canceledSignal!: AbortSignal;
    const canceled = mountPage(canceledHost, { ...definition("canceled"), loadHtml: (_url: URL, signal: AbortSignal) => {
      canceledSignal = signal; return new Promise<string>(resolve => { release = resolve; });
    } });
    const canceledReady = canceled.ready.then(() => "ready", (cause: Error) => cause.name);
    await canceled.dispose(); release("<article>Late candidate</article>"); await Promise.resolve(); await Promise.resolve();
    const canceledKeptOld = (await canceledReady) === "AbortError" && canceledSignal.aborted && canceledHost.childElementCount === 0 && previous.root === oldRoot;
    canceledHost.remove();
    const candidateHost = document.createElement("div"); candidateHost.hidden = true; candidateHost.inert = true; root.append(candidateHost);
    const candidate = mountPage(candidateHost, definition("new")); await candidate.ready;
    const activatedBeforeRetirement = events.indexOf("new:activate") > events.indexOf("old:activate") && !events.includes("old:dispose");
    await previous.dispose(); firstHost.remove(); candidateHost.hidden = false; candidateHost.inert = false;
    const committed = candidate.root?.textContent === "new" && !oldRoot!.isConnected && sibling.root === siblingRoot && siblingRoot!.isConnected;
    await Promise.all([candidate.dispose(), sibling.dispose()]); root.remove(); return { failure, retained, cleaned, canceledKeptOld, activatedBeforeRetirement, committed };
  }, modules);
  expect(result).toEqual({ failure: "PAGE_INIT", retained: true, cleaned: 1, canceledKeptOld: true, activatedBeforeRetirement: true, committed: true });
});
