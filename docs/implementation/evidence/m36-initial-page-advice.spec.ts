// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { PageAdvice, PageContext, PageDefinition, PageHandle } from "../../src/page/index.js";

const pageModule = `/@fs/${fileURLToPath(new URL("../../src/page/index.ts", import.meta.url)).replaceAll("\\", "/")}`;

test("two real pages discover nested methods and class lifecycle methods through native predicates with independent receivers", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async pageModule => {
    const { mountPage } = await import(pageModule), hosts = [document.createElement("div"), document.createElement("div")]; document.body.append(...hosts);
    const events: string[] = [], receivers: unknown[] = [], controllers: Controller[] = [], broadPaths: string[] = [];
    const contextMethods: Array<{ own: PageContext["own"]; output: PageContext["output"] }> = [];
    class ConstructorValue { constructor(readonly value: number) {} }
    class Controller {
      #count = 0;
      readonly ConstructorValue = ConstructorValue;
      readonly actions: { value: string; search(value: unknown): string; finish(): void };
      constructor(readonly context: PageContext<{ name: string }>) {
        this.actions = { value: context.input.name, search(value) { return this.value + ":" + value; }, finish: () => { events.push(context.input.name + ":owned"); } };
        controllers.push(this); contextMethods.push({ own: context.own, output: context.output }); context.own(() => this.actions.finish());
      }
      init() { this.#count++; }
      activate() {}
      deactivate() {}
      dispose() { this.#count++; }
      count() { return this.#count; }
    }
    const advice: readonly PageAdvice<{ name: string }>[] = Object.freeze([Object.freeze({
      match: function(this: void, path: string, _owner: object, context: PageContext<{ name: string }>) { "use strict"; receivers.push(this); return context.root.matches("article[data-advised]") && /^(init|activate|deactivate|dispose|actions\.(search|finish))$/.test(path); },
      wrap: function(this: void, proceed: (...args: unknown[]) => unknown, path: string, _owner: object, context: PageContext<{ name: string }>) { "use strict"; receivers.push(this); return function(this: void) { "use strict"; receivers.push(this); events.push(context.input.name + ":" + path); return proceed(...Array.from(arguments)); }; }
    }), Object.freeze({
      match: (path: string) => { broadPaths.push(path); return true; },
      wrap: (proceed: (...args: unknown[]) => unknown, _path: string, _owner: object, context: PageContext<{ name: string }>) => {
        context.own(() => { events.push(context.input.name + ":advice-owned"); }); context.output("installation"); return proceed;
      }
    })]);
    const definition = { view: () => { const root = document.createElement("article"); root.dataset.advised = ""; root.innerHTML = "<h1>Authored page</h1><button type='button'>Search</button>"; return root; }, advice, controller: (context: PageContext<{ name: string }>) => new Controller(context) };
    const first = mountPage(hosts[0], definition, { name: "first" }), second = mountPage(hosts[1], definition, { name: "second" }); await Promise.all([first.ready, second.ready]);
    const firstSearch = controllers[0].actions.search, secondSearch = controllers[1].actions.search;
    const values = [({ run: firstSearch }).run("A"), ({ run: secondSearch }).run("B")];
    const classValue = controllers.every(controller => controller.ConstructorValue === ConstructorValue && new controller.ConstructorValue(7).value === 7);
    const frameworkMethods = controllers.every((controller, index) => controller.context.own === contextMethods[index].own && controller.context.output === contextMethods[index].output);
    const contextSkipped = broadPaths.every(path => !path.startsWith("context."));
    await first.dispose(); const sibling = controllers[1].actions.search("C"); await second.dispose();
    const empty = hosts.every(host => host.childElementCount === 0); hosts.forEach(host => host.remove());
    return { values, sibling, classValue, frameworkMethods, contextSkipped, empty, plain: receivers.every(receiver => receiver === undefined), counts: controllers.map(controller => controller.count()), events };
  }, pageModule);
  expect(result.values).toEqual(["first:A", "second:B"]); expect(result.sibling).toBe("second:C");
  expect(result).toMatchObject({ classValue: true, frameworkMethods: true, contextSkipped: true, empty: true, plain: true, counts: [2, 2] });
  for (const name of ["first", "second"]) {
    expect(result.events.filter(event => event === name + ":init")).toHaveLength(1);
    expect(result.events.filter(event => event === name + ":dispose")).toHaveLength(1);
    expect(result.events.indexOf(name + ":dispose")).toBeLessThan(result.events.indexOf(name + ":actions.finish"));
    expect(result.events.indexOf(name + ":actions.finish")).toBeLessThan(result.events.indexOf(name + ":owned"));
  }
});

test("page creation captures advice once across reload while empty advice leaves accessor methods untouched", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async pageModule => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"), otherHost = document.createElement("div"); document.body.append(host, otherHost);
    let listReads = 0, matchReads = 0, wrapReads = 0, skippedReads = 0, wrapped = 0;
    const originals: Array<() => number> = [], controllers: Array<{ init(): void; run(): number }> = [];
    const entry = { get match() { matchReads++; return (path: string) => path === "run"; }, get wrap() { wrapReads++; return (proceed: (...args: unknown[]) => unknown) => () => { wrapped++; return proceed(); }; } };
    const supplied = [entry], definition = { view: () => document.createElement("article"), get advice() { listReads++; return supplied; }, controller() { const run = () => controllers.length, controller = { init() {}, run }; originals.push(run); controllers.push(controller); return controller; } };
    const handle = mountPage(host, definition); await handle.ready; controllers[0].run(); supplied.splice(0); Object.defineProperty(entry, "match", { value: () => false }); Object.defineProperty(definition, "advice", { value: [] });
    await handle.reload(); controllers[1].run(); await handle.dispose();
    const skipped = { init() {}, get dangerous(): never { skippedReads++; throw new Error("Unexpected discovery"); } };
    const empty = mountPage(otherHost, { view: () => document.createElement("article"), advice: [], controller: () => skipped }); await empty.ready; await empty.dispose();
    const restored = controllers.every((controller, index) => controller.run === originals[index]); host.remove(); otherHost.remove();
    return { listReads, matchReads, wrapReads, skippedReads, wrapped, restored, generations: controllers.length };
  }, pageModule);
  expect(result).toEqual({ listReads: 1, matchReads: 1, wrapReads: 1, skippedReads: 0, wrapped: 2, restored: true, generations: 2 });
});

for (const phase of ["init", "activate"] as const) {
  test(`late ${phase} proceed is canceled while controller and owned cleanup remain advised after abort`, async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(async ({ pageModule, phase }) => {
      const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
      let enter!: () => void, release!: () => void, late!: (...args: unknown[]) => unknown;
      const entered = new Promise<void>(resolve => { enter = resolve; }), gate = new Promise<void>(resolve => { release = resolve; }), events: string[] = [];
      const controller = { init() { events.push("init-core"); }, activate() { events.push("activate-core"); }, deactivate() { events.push("deactivate-core"); }, dispose() { events.push("dispose-core"); }, resources: { finish() { events.push("owned-core"); } } };
      const advice: readonly PageAdvice[] = [{ match: () => true, wrap: (proceed, path) => {
        if (path === phase) { late = proceed; return async () => { events.push("waiting"); enter(); await gate; return proceed(); }; }
        return (...args) => { events.push(path + ":advice"); return proceed(...args); };
      } }];
      const handle = mountPage(host, { view: () => document.createElement("article"), advice, controller(context: PageContext) { context.own(() => controller.resources.finish()); return controller; } });
      const ready = handle.ready.then(() => "ready", (cause: Error) => cause.name); await entered; await handle.dispose(); const beforeRelease = [...events];
      release(); await Promise.resolve(); let lateName = "none"; try { late(); } catch (cause) { lateName = (cause as Error).name; }
      const readyName = await ready, empty = host.childElementCount === 0; host.remove(); return { readyName, lateName, beforeRelease, events, empty };
    }, { pageModule, phase });
    expect(result).toMatchObject({ readyName: "AbortError", lateName: "AbortError", empty: true });
    expect(result.events).not.toContain(phase + "-core"); expect(result.beforeRelease).toContain("dispose:advice"); expect(result.beforeRelease).toContain("resources.finish:advice");
    expect(result.beforeRelease.indexOf("dispose-core")).toBeLessThan(result.beforeRelease.indexOf("owned-core"));
    if (phase === "activate") expect(result.beforeRelease).toContain("deactivate:advice");
  });
}

test("ordinary action advice explicitly guards its page signal without blocking arbitrary nested cleanup", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async pageModule => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
    let enter!: () => void, release!: () => void, context!: PageContext, action!: { run(): Promise<boolean>; finish(): void };
    const entered = new Promise<void>(resolve => { enter = resolve; }), gate = new Promise<void>(resolve => { release = resolve; }), events: string[] = [];
    const handle = mountPage(host, { view: () => document.createElement("article"), advice: [{ match: path => /^actions\./.test(path), wrap: (proceed, path, _owner, page) => path === "actions.run" ? async (...args) => {
      enter(); await gate; page.signal.throwIfAborted(); const result = await proceed(...args); page.signal.throwIfAborted(); events.push("after"); return result;
    } : (...args) => { events.push("cleanup-advice"); return proceed(...args); } }] satisfies readonly PageAdvice[], controller(page: PageContext) {
      context = page; action = { async run() { context.signal.throwIfAborted(); events.push("action-core"); return true; }, finish() { events.push("finish-core"); } };
      page.own(() => action.finish()); return { actions: action, init() {} };
    } });
    await handle.ready; const pending = action.run().then(() => "done", (cause: Error) => cause.name); await entered; await handle.dispose(); release();
    const outcome = await pending; host.remove(); return { outcome, events, aborted: context.signal.aborted };
  }, pageModule);
  expect(result).toEqual({ outcome: "AbortError", events: ["cleanup-advice", "finish-core"], aborted: true });
});

test("a second page cannot adopt or dispose another advised page's controller", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async pageModule => {
    const { mountPage } = await import(pageModule), hosts = [document.createElement("div"), document.createElement("div")]; document.body.append(...hosts);
    const events: string[] = [], controller = { init() { events.push("init"); }, run: () => 7, dispose() { events.push("dispose"); } }, original = controller.run;
    const advice: readonly PageAdvice[] = [{ match: path => path === "run", wrap: proceed => () => Number(proceed()) + 1 }];
    const first = mountPage(hosts[0], { view: () => document.createElement("article"), advice, controller(context: PageContext) { context.own(() => { events.push("first-owned"); }); return controller; } }); await first.ready;
    const second = mountPage(hosts[1], { view: () => document.createElement("article"), advice, controller(context: PageContext) { context.own(() => { events.push("second-owned"); }); return controller; } });
    const failure = await second.ready.then(() => null, (cause: { code: string; detail: { phase: string } }) => ({ code: cause.code, phase: cause.detail.phase })); await second.dispose();
    const beforeFirstClose = [...events], value = controller.run(), secondEmpty = hosts[1].childElementCount === 0; await first.dispose();
    const restored = controller.run === original; hosts.forEach(host => host.remove()); return { failure, beforeFirstClose, value, secondEmpty, restored, events };
  }, pageModule);
  expect(result).toEqual({ failure: { code: "PAGE_ADVICE", phase: "claim" }, beforeFirstClose: ["init", "second-owned"], value: 8, secondEmpty: true, restored: true, events: ["init", "second-owned", "dispose", "first-owned"] });
});

test("a shared nested slot rejects a false second matcher while keeping the first page usable", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async pageModule => {
    const { mountPage } = await import(pageModule), hosts = [document.createElement("div"), document.createElement("div")]; document.body.append(...hosts);
    const shared = { run: () => 4 }, events: string[] = []; let secondMatches = 0;
    const first = mountPage(hosts[0], { view: () => document.createElement("article"), advice: [{ match: path => path === "shared.run", wrap: proceed => () => Number(proceed()) + 1 }] satisfies readonly PageAdvice[], controller: () => ({ init() {}, shared, dispose() { events.push("first-dispose"); } }) }); await first.ready;
    const second = mountPage(hosts[1], { view: () => document.createElement("article"), advice: [{ match: () => { secondMatches++; return false; }, wrap: proceed => proceed }] satisfies readonly PageAdvice[], controller: () => ({ init() {}, shared, dispose() { events.push("second-dispose"); } }) });
    const failure = await second.ready.then(() => null, (cause: { code: string; detail: { phase: string } }) => ({ code: cause.code, phase: cause.detail.phase })); await second.dispose(); const value = shared.run(); await first.dispose();
    const restored = shared.run(); hosts.forEach(host => host.remove()); return { failure, secondMatches, events, value, restored };
  }, pageModule);
  expect(result).toEqual({ failure: { code: "PAGE_ADVICE", phase: "install" }, secondMatches: 0, events: ["second-dispose", "first-dispose"], value: 5, restored: 4 });
});

test("partial installation stays active through all cleanup and preserves a callback's later descriptor", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async pageModule => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
    const events: string[] = [], original = () => { events.push("a-core"); }, replacement = () => { events.push("b-replacement"); };
    const controller = { a: original, b: () => {}, init() { events.push("init"); }, dispose() { events.push("dispose"); controller.a(); controller.b(); } };
    const handle = mountPage(host, { view: () => document.createElement("article"), advice: [{ match: path => path === "a" || path === "b", wrap: (proceed, path, _owner, context) => {
      if (path === "b") { controller.b = replacement; context.own(() => { events.push("factory-owned"); controller.a(); }); }
      return (...args) => { events.push(path + "-advice"); return proceed(...args); };
    } }] satisfies readonly PageAdvice[], controller(context: PageContext) { context.own(() => { events.push("controller-owned"); controller.a(); }); return controller; } });
    const failure = await handle.ready.then(() => null, (cause: { code: string; detail: { phase: string } }) => ({ code: cause.code, phase: cause.detail.phase })); await handle.dispose();
    const restored = controller.a === original && controller.b === replacement, empty = host.childElementCount === 0; host.remove(); return { failure, restored, empty, events };
  }, pageModule);
  expect(result).toEqual({ failure: { code: "PAGE_ADVICE", phase: "install" }, restored: true, empty: true,
    events: ["dispose", "a-advice", "a-core", "b-replacement", "factory-owned", "a-advice", "a-core", "controller-owned", "a-advice", "a-core"] });
});

test("failed initialization releases advice after controller and owned cleanup without accumulating on retry", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async pageModule => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
    const events: string[] = []; let broken = true;
    const controller = { init() { if (broken) throw new Error("init failure"); }, run: () => 1, dispose() { events.push("dispose"); controller.run(); } }, original = controller.run;
    const definition = { view: () => document.createElement("article"), advice: [{ match: (path: string) => path === "run", wrap: (proceed: (...args: unknown[]) => unknown) => () => { events.push("run-advice"); return proceed(); } }], controller(context: PageContext) { context.own(() => { events.push("owned"); controller.run(); }); return controller; } };
    const first = mountPage(host, definition), failure = await first.ready.then(() => "none", (cause: { code: string }) => cause.code); await first.dispose(); const firstRestored = controller.run === original;
    broken = false; const second = mountPage(host, definition); await second.ready; controller.run(); await second.dispose(); const restored = controller.run === original; host.remove();
    return { failure, firstRestored, restored, events };
  }, pageModule);
  expect(result).toEqual({ failure: "PAGE_INIT", firstRestored: true, restored: true, events: ["dispose", "run-advice", "owned", "run-advice", "run-advice", "dispose", "run-advice", "owned", "run-advice"] });
});

for (const operation of ["dispose", "reload"] as const) {
  test(`factory ${operation} reentry adopts cleanup but never installs advice on the canceled generation`, async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(async ({ pageModule, operation }) => {
      const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
      const events: string[] = []; let handle!: PageHandle, reentry!: Promise<void>, generations = 0;
      const definition = { view: () => document.createElement("article"), advice: [{ match: (path: string) => { events.push("match:" + generations + ":" + path); return path === "init"; }, wrap: (proceed: (...args: unknown[]) => unknown) => proceed }], controller(context: PageContext) {
        const generation = ++generations; context.own(() => { events.push("owned:" + generation); });
        if (generation === 1) reentry = handle[operation]();
        return { init() { events.push("init:" + generation); }, dispose() { events.push("dispose:" + generation); } };
      } };
      handle = mountPage(host, definition); const firstReady = await handle.ready.then(() => "ready", (cause: Error) => cause.name); await reentry;
      await handle.dispose(); const empty = host.childElementCount === 0; host.remove(); return { firstReady, generations, events, empty };
    }, { pageModule, operation });
    expect(result).toMatchObject({ firstReady: "AbortError", generations: operation === "dispose" ? 1 : 2, empty: true });
    expect(result.events.some(event => event.startsWith("match:1:"))).toBe(false); expect(result.events).toContain("dispose:1"); expect(result.events).toContain("owned:1");
    if (operation === "reload") expect(result.events).toContain("init:2");
  });
}

test("restoration failure preserves an earlier primitive cleanup failure while restoring other slots and blocking reuse", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async pageModule => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"), retryHost = document.createElement("div"); document.body.append(host, retryHost);
    const events: string[] = [], first = () => 1, controller = { init() {}, first, stuck: () => 2, dispose() { events.push("dispose"); throw null; } };
    const advice: readonly PageAdvice[] = [{ match: path => path === "first" || path === "stuck", wrap: proceed => proceed }];
    const handle = mountPage(host, { view: () => document.createElement("article"), advice, controller(context: PageContext) { context.own(() => { events.push("owned"); }); return controller; } }); await handle.ready;
    Object.defineProperty(controller, "stuck", { value: controller.stuck, configurable: false, writable: false });
    const disposal = handle.dispose(), same = disposal === handle.dispose(), failure = await disposal.then(() => null, (cause: { code: string; cause: unknown }) => ({ code: cause.code, nullCause: cause.cause === null }));
    const retry = mountPage(retryHost, { view: () => document.createElement("article"), advice, controller: () => controller });
    const retryFailure = await retry.ready.then(() => "none", (cause: { code: string; detail: { phase: string } }) => cause.code + ":" + cause.detail.phase); await retry.dispose();
    const firstRestored = controller.first === first, empty = host.childElementCount === 0 && retryHost.childElementCount === 0; host.remove(); retryHost.remove();
    return { same, failure, retryFailure, firstRestored, events, empty };
  }, pageModule);
  expect(result).toEqual({ same: true, failure: { code: "PAGE_DISPOSE", nullCause: true }, retryFailure: "PAGE_ADVICE:claim", firstRestored: true, events: ["dispose", "owned"], empty: true });
});

test("an aborting discovery getter stops later getters and policy work while normal cleanup releases the controller for retry", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async pageModule => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
    let handle!: PageHandle, stop = true, later = 0, matches = 0, wraps = 0, disposed = 0, owned = 0;
    const controller = { init() {}, get first() { if (stop) void handle.dispose(); return () => 1; }, get later() { later++; return () => 2; }, dispose() { disposed++; } };
    const advice: readonly PageAdvice[] = [{ match: () => { matches++; return false; }, wrap: proceed => { wraps++; return proceed; } }];
    const definition = { view: () => document.createElement("article"), advice, controller(context: PageContext) { context.own(() => { owned++; }); return controller; } };
    handle = mountPage(host, definition); const firstReady = await handle.ready.then(() => "ready", (cause: Error) => cause.name); await handle.dispose();
    const first = { firstReady, later, matches, wraps, disposed, owned, empty: host.childElementCount === 0 };
    stop = false; handle = mountPage(host, definition); await handle.ready; await handle.dispose(); host.remove();
    return { first, retry: { later, matched: matches > 0, wraps, disposed, owned } };
  }, pageModule);
  expect(result).toEqual({ first: { firstReady: "AbortError", later: 0, matches: 0, wraps: 0, disposed: 1, owned: 1, empty: true }, retry: { later: 1, matched: true, wraps: 0, disposed: 2, owned: 2 } });
});

test("main Popup Tabs and Documents await the same automatic init preparation before original init and activation", async ({ page }) => {
  const source = (relative: string) => `/@fs/${fileURLToPath(new URL(relative, import.meta.url)).replaceAll("\\", "/")}`;
  const modules = { pageModule, popupModule: source("../../src/ui/popup.ts"), tabsModule: source("../../src/ui/tabs.ts"), documentsModule: source("../../src/ui/documents.ts") };
  const tabsMarkup = '<div role="tablist" aria-label="Pages"><button type="button" role="tab" data-tab="a">A</button>' +
    '<button type="button" role="tab" data-tab="b">B</button></div><section role="tabpanel" data-panel="a" hidden></section>' +
    '<section role="tabpanel" data-panel="b" hidden></section><p role="alert" data-tab-error hidden></p>';
  const documentsMarkup = '<div role="tablist" aria-label="Documents"><template data-document-tab-template><div role="presentation">' +
    '<button type="button" role="tab" data-document-tab><span data-document-title></span></button>' +
    '<button type="button" data-document-close aria-label="Close document">×</button></div></template></div>' +
    '<div data-document-items></div><div data-document-panels><template data-document-panel-template><section role="tabpanel" hidden></section></template></div>' +
    '<div data-document-empty><button type="button">Open a document</button></div><p data-document-error role="alert" hidden></p>';
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule, popupModule, tabsModule, documentsModule, tabsMarkup, documentsMarkup }) => {
    const { mountPage } = await import(pageModule), { openPopup } = await import(popupModule), { bindTabs } = await import(tabsModule), { bindDocuments } = await import(documentsModule);
    const mainHost = document.createElement("div"), dialog = document.createElement("dialog"), tabsRoot = document.createElement("section"), documentsRoot = document.createElement("section");
    dialog.setAttribute("aria-label", "Advised popup"); dialog.innerHTML = '<div data-page-host></div>';
    tabsRoot.dataset.tabs = ""; tabsRoot.innerHTML = tabsMarkup; documentsRoot.dataset.documents = ""; documentsRoot.innerHTML = documentsMarkup;
    document.body.append(mainHost, dialog, tabsRoot, documentsRoot);
    const template = document.createElement("template"); template.innerHTML = '<article data-advice-container><h1>Authored page</h1><button type="button" data-output>Complete</button></article>';
    const events: Record<string, string[]> = {}, outputs: string[] = [], signals: AbortSignal[] = [];
    const advice: readonly PageAdvice<{ slot: string }, string>[] = Object.freeze([{
      match: (path, _owner, context) => context.root.matches("[data-advice-container]") && (path === "init" || path === "activate"),
      wrap: (proceed, path, _owner, context) => path === "init" ? async (...args) => {
        const order = events[context.input.slot]; order.push("prepare-start"); await new Promise<void>(resolve => queueMicrotask(resolve));
        context.signal.throwIfAborted(); context.root.dataset.prepared = "true"; order.push("prepare-end");
        const result = await proceed(...args); order.push("init-after"); return result;
      } : (...args) => { events[context.input.slot].push("activate-advice"); return proceed(...args); }
    }] satisfies readonly PageAdvice<{ slot: string }, string>[]);
    const definition: PageDefinition<{ slot: string }, string> = {
      view: () => template.content.firstElementChild!.cloneNode(true) as HTMLElement, advice,
      controller(context) {
        const order = events[context.input.slot] = []; signals.push(context.signal);
        context.root.querySelector("button")!.addEventListener("click", () => context.output(context.input.slot), { signal: context.signal });
        context.own(() => { order.push("owned"); });
        return { init() { if (context.root.dataset.prepared !== "true") throw new Error("Preparation was not awaited"); order.push("init"); },
          activate() { order.push("activate"); }, dispose() { order.push("dispose"); } };
      }
    };
    const main = mountPage(mainHost, definition, { slot: "main" }); main.onOutput((value: string) => outputs.push(value)); await main.ready; main.root!.querySelector<HTMLButtonElement>("button")!.click();
    const popup = openPopup(dialog, definition, { slot: "popup" }); await popup.ready; const nativeDialog = dialog.open; dialog.querySelector<HTMLButtonElement>("button")!.click(); const popupOutput = await popup.result;
    const create = (host: HTMLElement, slot: string) => { const handle = mountPage(host, definition, { slot }); handle.onOutput((value: string) => outputs.push(value)); return handle; };
    const tabs = bindTabs(tabsRoot, { initial: "a", pages: { a: (host: HTMLElement) => create(host, "tab"), b: (host: HTMLElement) => create(host, "unused") } }); await tabs.ready;
    tabsRoot.querySelector<HTMLButtonElement>("[data-output]")!.click();
    const documents = bindDocuments(documentsRoot); await documents.open("a", { title: "Advised document", page: (host: HTMLElement) => create(host, "document") });
    documentsRoot.querySelector<HTMLButtonElement>("[data-output]")!.click(); await Promise.all([main.dispose(), tabs.dispose(), documents.dispose(), popup.dispose()]);
    const uniqueSignals = new Set(signals).size, allAborted = signals.every(signal => signal.aborted); [mainHost, dialog, tabsRoot, documentsRoot].forEach(root => root.remove());
    return { events, outputs, popupOutput, nativeDialog, uniqueSignals, allAborted };
  }, { ...modules, tabsMarkup, documentsMarkup });
  expect(result).toMatchObject({ outputs: ["main", "tab", "document"], popupOutput: "popup", nativeDialog: true, uniqueSignals: 4, allAborted: true });
  expect(Object.keys(result.events).sort()).toEqual(["document", "main", "popup", "tab"]);
  for (const order of Object.values(result.events)) expect(order).toEqual(["prepare-start", "prepare-end", "init", "init-after", "activate-advice", "activate", "dispose", "owned"]);
});

test("owned cleanup can call an earlier installed wrapper and final release still restores the original method", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async pageModule => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
    let earlier!: () => number; const events: unknown[] = [], original = () => 1;
    const controller = { init() {}, run: original, dispose() { controller.run = earlier; events.push("dispose"); } };
    const advice: readonly PageAdvice[] = [
      { match: path => path === "run", wrap: proceed => () => Number(proceed()) + 1 },
      { match: path => path === "run", wrap: proceed => { earlier = controller.run; return () => Number(proceed()) + 10; } }
    ];
    const handle = mountPage(host, { view: () => document.createElement("article"), advice, controller(context: PageContext) {
      context.own(() => { events.push(controller.run()); }); return controller;
    } }); await handle.ready; const before = controller.run(); await handle.dispose();
    const restored = controller.run === original, after = controller.run(), empty = host.childElementCount === 0; host.remove();
    return { before, restored, after, empty, events };
  }, pageModule);
  expect(result).toEqual({ before: 12, restored: true, after: 1, empty: true, events: ["dispose", 2] });
});

test("rejected generated roots preserve another active page and an occupied host's existing content", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async pageModule => {
    const { mountPage } = await import(pageModule), firstHost = document.createElement("div"), rejectedHost = document.createElement("div"), occupied = document.createElement("div");
    const authored = document.createElement("p"); authored.textContent = "Existing destination"; occupied.append(authored); document.body.append(firstHost, rejectedHost, occupied);
    let clicks = 0, disposed = 0, owned = 0, rejectedControllers = 0;
    const first = mountPage(firstHost, { view() { const root = document.createElement("article"); root.innerHTML = '<button type="button">Active page</button>'; return root; }, controller(context: PageContext) {
      context.root.querySelector("button")!.addEventListener("click", () => { clicks++; }, { signal: context.signal }); context.own(() => { owned++; }); return { init() {}, dispose() { disposed++; } };
    } }); await first.ready; const originalRoot = first.root!;
    const rejected = mountPage(rejectedHost, { view: () => originalRoot, controller: () => { rejectedControllers++; return {}; } });
    const activeCode = await rejected.ready.then(() => "none", (cause: { code: string }) => cause.code); await rejected.dispose();
    const activePreserved = first.root === originalRoot && firstHost.firstElementChild === originalRoot && originalRoot.isConnected;
    originalRoot.querySelector<HTMLButtonElement>("button")!.click();
    const detached = document.createElement("article"); detached.textContent = "Unadopted candidate";
    const rejectedOccupied = mountPage(occupied, { view: () => detached, controller: () => { rejectedControllers++; return {}; } });
    const occupiedCode = await rejectedOccupied.ready.then(() => "none", (cause: { code: string }) => cause.code); await rejectedOccupied.dispose();
    const destinationPreserved = occupied.childElementCount === 1 && occupied.firstElementChild === authored && authored.textContent === "Existing destination";
    const candidatePreserved = !detached.isConnected && detached.textContent === "Unadopted candidate";
    const before = { clicks, disposed, owned }; await first.dispose(); const empty = firstHost.childElementCount === 0 && rejectedHost.childElementCount === 0;
    firstHost.remove(); rejectedHost.remove(); occupied.remove(); return { activeCode, occupiedCode, activePreserved, destinationPreserved, candidatePreserved, rejectedControllers, before, disposed, owned, empty };
  }, pageModule);
  expect(result).toEqual({ activeCode: "ROOT_IN_USE", occupiedCode: "HOST_NOT_EMPTY", activePreserved: true, destinationPreserved: true, candidatePreserved: true, rejectedControllers: 0,
    before: { clicks: 1, disposed: 0, owned: 0 }, disposed: 1, owned: 1, empty: true });
});
