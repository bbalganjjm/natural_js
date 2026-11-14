// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { PageContext, PageHandle } from "../../src/page/index.js";

const source = (relative: string) => `/@fs/${fileURLToPath(new URL(relative, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { pageModule: source("../../src/page/index.ts"), popupModule: source("../../src/ui/popup.ts"), documentsModule: source("../../src/ui/documents.ts") };
const documentsMarkup = '<div role="tablist" aria-label="Documents"><template data-document-tab-template><div role="presentation">' +
  '<button type="button" role="tab" data-document-tab><span data-document-title></span></button>' +
  '<button type="button" data-document-close aria-label="Close document">×</button></div></template></div>' +
  '<div data-document-items></div><div data-document-panels><template data-document-panel-template><section role="tabpanel" hidden></section></template></div>' +
  '<div data-document-empty><button type="button">Open a document</button></div><p data-document-error role="alert" hidden></p>';

test("controller factories capture once and call plainly while class lifecycle methods retain their receiver", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule), hosts = Array.from({ length: 3 }, () => document.createElement("div")); document.body.append(...hosts);
    let reads = 0; const receivers: unknown[] = [], instances: Controller[] = [];
    class Controller {
      readonly order: string[] = [];
      constructor(readonly context: PageContext) { instances.push(this); }
      init() { this.order.push("init"); this.context.root.dataset.initialized = "true"; }
      activate() { this.order.push("activate"); }
      deactivate() { this.order.push("deactivate"); }
      dispose() { this.order.push("dispose"); }
    }
    const factory = function(this: unknown, context: PageContext) { "use strict"; receivers.push(this); return new Controller(context); };
    const view = () => document.createElement("article");
    const definition = { view, get controller() { reads++; return factory; } };
    const first = mountPage(hosts[0], definition); await first.ready;
    Object.defineProperty(definition, "controller", { value: () => { throw new Error("Late factory replacement"); } });
    const shared = Object.freeze({ view, get controller() { reads++; return factory; } });
    const second = mountPage(hosts[1], shared), third = mountPage(hosts[2], shared); await Promise.all([second.ready, third.ready]);
    await first.reload(); await Promise.all([first.dispose(), second.dispose(), third.dispose()]); hosts.forEach(host => host.remove());
    return { reads, instances: new Set(instances).size, plain: receivers.length === 4 && receivers.every(receiver => receiver === undefined),
      methods: instances.every(instance => instance.order.join(",") === "init,activate,deactivate,dispose") };
  }, modules);
  expect(result).toEqual({ reads: 3, instances: 4, plain: true, methods: true });
});

test("invalid controller factories fail at creation while invalid factory results release their owned partial resources", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
    const codes: string[] = []; let released = 0;
    for (const controller of [undefined, null, false, 0, "bad", {}]) {
      try { mountPage(host, { view: () => document.createElement("article"), controller }); }
      catch (cause) { codes.push((cause as { code: string }).code); }
    }
    for (const value of [undefined, null, false, 0, "bad", () => {}]) {
      const handle = mountPage(host, { view: () => document.createElement("article"), controller(context: PageContext) { context.own(() => { released++; }); return value; } });
      codes.push(await handle.ready.then(() => "none", (cause: { code: string }) => cause.code)); await handle.dispose();
    }
    const empty = host.childElementCount === 0; host.remove(); return { codes, released, empty };
  }, modules);
  expect(result).toEqual({ codes: [...Array(6).fill("PAGE_OPTIONS"), ...Array(6).fill("CONTROLLER_INVALID")], released: 6, empty: true });
});

test("one view read classifies each generation while a changed URL remains live on reload", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
    let reads = 0; const other = document.createElement("article"); other.textContent = "Wrong second read";
    const first = mountPage(host, { get view() { reads++; return reads === 1 ? () => { const root = document.createElement("article"); root.textContent = "Factory"; return root; } : other; }, controller: () => ({}) });
    await first.ready; const consistent = reads === 1 && first.root?.textContent === "Factory"; await first.dispose();
    let url = new URL("/m34/first.html", location.href), urlReads = 0; const loaded: string[] = [];
    const second = mountPage(host, { get view() { urlReads++; return url; }, loadHtml: async (value: URL) => { loaded.push(value.pathname); return "<article>Loaded</article>"; }, controller: () => ({}) });
    await second.ready; url = new URL("/m34/second.html", location.href); await second.reload(); await second.dispose(); host.remove();
    return { consistent, urlReads, loaded };
  }, modules);
  expect(result).toEqual({ consistent: true, urlReads: 2, loaded: ["/m34/first.html", "/m34/second.html"] });
});

test("a view getter that disposes its page cannot start native or custom loading after cancellation", async ({ page }) => {
  let requests = 0;
  await page.route("**/m34/reentry.html", route => { requests++; return route.fulfill({ body: "<article>Native</article>" }); }); await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule), outcomes = [];
    for (const custom of [false, true]) {
      const host = document.createElement("div"); document.body.append(host); let handle!: PageHandle, close!: Promise<void>, cancel = false, reads = 0, calls = 0;
      const definition = { get view() { reads++; if (cancel) close = handle.dispose(); return new URL("/m34/reentry.html", location.href); },
        ...(custom ? { loadHtml: async () => { calls++; return "<article>Custom</article>"; } } : {}), controller: () => ({}) };
      handle = mountPage(host, definition); await handle.ready; cancel = true;
      const outcome = await handle.reload().then(() => "ready", (cause: Error) => cause.name); await close;
      outcomes.push({ outcome, reads, calls, empty: host.childElementCount === 0, same: handle.dispose() === close }); host.remove();
    }
    return outcomes;
  }, modules);
  expect(result).toEqual([{ outcome: "AbortError", reads: 2, calls: 0, empty: true, same: true }, { outcome: "AbortError", reads: 2, calls: 1, empty: true, same: true }]); expect(requests).toBe(1);
});

test("a reentrant reload from the view getter supersedes that generation without loading its URL", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
    let handle!: PageHandle, pending!: Promise<void>, reads = 0, reenter = false, controllers = 0; const loaded: string[] = [];
    handle = mountPage(host, { get view() { const read = ++reads; if (reenter) { reenter = false; pending = handle.reload(); } return new URL(`/m34/${read}.html`, location.href); },
      loadHtml: async (url: URL) => { loaded.push(url.pathname); return "<article>Current</article>"; }, controller: () => { controllers++; return {}; } });
    await handle.ready; reenter = true; const outer = await handle.reload().then(() => "ready", (cause: Error) => cause.name); await pending;
    await handle.dispose(); host.remove(); return { outer, reads, controllers, loaded };
  }, modules);
  expect(result).toEqual({ outer: "AbortError", reads: 3, controllers: 2, loaded: ["/m34/1.html", "/m34/3.html"] });
});

test("rapid reload keeps only the latest instance and stale outputs cannot reach the current page listener", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule }) => {
    const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
    let made = 0, cleaned = 0; const contexts: PageContext<string, string>[] = [], outputs: string[] = [];
    const handle = mountPage(host, { view: () => document.createElement("article"), controller(context: PageContext<string, string>) { made++; contexts.push(context); context.own(() => { cleaned++; }); return {}; } }, "original input");
    handle.onOutput((value: string) => outputs.push(value)); await handle.ready; contexts[0].output("initial");
    const first = handle.reload(), second = handle.reload(); const statuses = await Promise.allSettled([first, second]);
    contexts[0].output("stale"); contexts[1].output("fresh"); const inputs = contexts.map(context => context.input);
    const firstAborted = statuses[0].status === "rejected" && statuses[0].reason.name === "AbortError", secondReady = statuses[1].status === "fulfilled";
    await handle.dispose(); contexts[1].output("after disposal"); host.remove(); return { firstAborted, secondReady, made, cleaned, outputs, inputs };
  }, modules);
  expect(result).toEqual({ firstAborted: true, secondReady: true, made: 2, cleaned: 2, outputs: ["initial", "fresh"], inputs: ["original input", "original input"] });
});

for (const kind of ["null", "undefined"]) {
  test(`${kind} first cleanup failure survives later rejections and concurrent reentrant disposal observes one result`, async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(async ({ pageModule, kind }) => {
      const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
      const original = kind === "null" ? null : undefined, order: string[] = []; let handle!: PageHandle, reentrant: Promise<void> | undefined;
      handle = mountPage(host, { view: () => document.createElement("article"), controller(context: PageContext) {
        context.signal.addEventListener("abort", () => { reentrant = handle.dispose(); }, { once: true });
        context.own(() => { order.push("owned-first"); }); context.own(async () => { order.push("owned-second"); throw new Error("Later owned failure"); });
        return { deactivate() { order.push("deactivate"); throw original; }, async dispose() { order.push("dispose"); throw new Error("Later controller failure"); } };
      } });
      await handle.ready; const first = handle.dispose(), second = handle.dispose(), outcomes = await Promise.allSettled([first, second]);
      const reason = outcomes[0].status === "rejected" ? outcomes[0].reason : null;
      const late = handle.dispose(), lateReason = await late.then(() => null, cause => cause);
      const same = first === second && first === reentrant && first === late && outcomes[1].status === "rejected" && outcomes[1].reason === reason && lateReason === reason;
      const kept = reason?.code === "PAGE_DISPOSE" && Object.hasOwn(reason, "cause") && reason.cause === original;
      const empty = host.childElementCount === 0 && handle.root === null; host.remove(); return { same, kept, empty, order };
    }, { pageModule: modules.pageModule, kind });
    expect(result).toEqual({ same: true, kept: true, empty: true, order: ["deactivate", "dispose", "owned-second", "owned-first"] });
  });

  test(`disposal during pending init reports ${kind} cleanup failure even after initialization clears the instance`, async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(async ({ pageModule, kind }) => {
      const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
      const original = kind === "null" ? null : undefined, order: string[] = []; let enter!: () => void;
      const entered = new Promise<void>(resolve => { enter = resolve; });
      const handle = mountPage(host, { view: () => document.createElement("article"), controller(context: PageContext) {
        context.own(async () => { order.push("later"); throw new Error("Later failure"); }); context.own(() => { order.push("first"); throw original; });
        return { init() { enter(); return new Promise<void>(() => {}); }, dispose() { order.push("dispose"); } };
      } });
      const initial = handle.ready.then(() => "ready", (cause: Error) => cause.name); await entered;
      const first = handle.dispose(), second = handle.dispose(), reason = await first.then(() => null, cause => cause);
      const secondReason = await second.then(() => null, cause => cause);
      const same = first === second && secondReason === reason, kept = reason?.code === "PAGE_DISPOSE" && Object.hasOwn(reason, "cause") && reason.cause === original;
      const empty = host.childElementCount === 0 && handle.root === null; host.remove(); return { initial: await initial, same, kept, empty, order };
    }, { pageModule: modules.pageModule, kind });
    expect(result).toEqual({ initial: "AbortError", same: true, kept: true, empty: true, order: ["dispose", "first", "later"] });
  });

  test(`reload during pending init reports ${kind} cleanup failure before admitting another generation`, async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(async ({ pageModule, kind }) => {
      const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
      const original = kind === "null" ? null : undefined; let enter!: () => void, factories = 0;
      const entered = new Promise<void>(resolve => { enter = resolve; });
      const handle = mountPage(host, { view: () => document.createElement("article"), controller(context: PageContext) {
        const first = ++factories === 1; if (first) context.own(() => { throw original; });
        return { init() { if (first) { enter(); return new Promise<void>(() => {}); } } };
      } });
      const initial = handle.ready.then(() => "ready", (cause: Error) => cause.name); await entered;
      const reason = await handle.reload().then(() => null, cause => cause), blocked = factories === 1 && handle.root === null;
      const kept = reason?.code === "PAGE_DISPOSE" && Object.hasOwn(reason, "cause") && reason.cause === original;
      await handle.reload(); const retried = factories === 2 && handle.root?.isConnected; await handle.dispose(); host.remove(); return { initial: await initial, blocked, kept, retried };
    }, { pageModule: modules.pageModule, kind });
    expect(result).toEqual({ initial: "AbortError", blocked: true, kept: true, retried: true });
  });

  test(`failed init retains its original error and ${kind} cleanup failure while remaining resources still release`, async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(async ({ pageModule, kind }) => {
      const { mountPage } = await import(pageModule), host = document.createElement("div"); document.body.append(host);
      const original = kind === "null" ? null : undefined, initial = new Error("Initialization failed"), order: string[] = [];
      const handle = mountPage(host, { view: () => document.createElement("article"), controller(context: PageContext) {
        context.own(async () => { order.push("later"); throw new Error("Later failure"); }); context.own(() => { order.push("first"); throw original; });
        return { init() { throw initial; }, dispose() { order.push("dispose"); } };
      } });
      const reason = await handle.ready.then(() => null, cause => cause), aggregate = reason?.cause;
      const kept = reason?.code === "PAGE_DISPOSE" && aggregate instanceof AggregateError && aggregate.errors[0] === initial &&
        aggregate.errors[1]?.code === "PAGE_DISPOSE" && Object.hasOwn(aggregate.errors[1], "cause") && aggregate.errors[1].cause === original;
      await handle.dispose(); const empty = host.childElementCount === 0 && handle.root === null; host.remove(); return { kept, empty, order };
    }, { pageModule: modules.pageModule, kind });
    expect(result).toEqual({ kept: true, empty: true, order: ["dispose", "first", "later"] });
  });
}

test("typed input and closures carry caller opener request and context across two container scopes and stop delivery after parent closure", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pageModule, popupModule, documentsModule, documentsMarkup }) => {
    const { mountPage } = await import(pageModule), { openPopup } = await import(popupModule), { bindDocuments } = await import(documentsModule);
    interface ChildInput {
      caller: { accept(value: string): void };
      opener: HTMLButtonElement;
      parent: { key: string; signal: AbortSignal };
      request: { url: string; method: "GET"; zero: 0; enabled: false; empty: null };
      context: { locale: string; scope: string };
    }
    const hosts = [document.createElement("div"), document.createElement("div")]; document.body.append(...hosts);
    const delivered: string[] = [], resultErrors: string[] = [], captured = new Map<string, PageContext<ChildInput, string>>(); let childCleanup = 0;
    const childDefinition = { view: new URL("/m34/shared.html", location.href), loadHtml: async () => '<article><button type="button">Choose</button></article>',
      controller(context: PageContext<ChildInput, string>) { captured.set(context.input.parent.key, context); context.own(() => { childCleanup++; }); return {}; } };
    const parentDefinition = (scope: string, popup: boolean) => ({
      view: () => { const root = document.createElement("section"); root.innerHTML = '<button type="button" data-opener>Open</button>' +
        (popup ? '<dialog aria-label="Child"><div data-page-host></div></dialog>' : `<section data-documents>${documentsMarkup}</section>`); return root; },
      controller(parent: PageContext) {
        const opener = parent.root.querySelector<HTMLButtonElement>("[data-opener]")!;
        const input: ChildInput = { caller: { accept(value) { if (!parent.signal.aborted) delivered.push(scope + ":" + value); } }, opener,
          parent: { key: scope, signal: parent.signal }, request: { url: new URL("/m34/shared.html", location.href).href, method: "GET", zero: 0, enabled: false, empty: null },
          context: { locale: scope === "one" ? "ko_KR" : "en_US", scope } };
        return { async init() {
          if (popup) {
            const child = openPopup(parent.root.querySelector<HTMLDialogElement>("dialog")!, childDefinition, input); parent.own(() => child.dispose());
            void child.result.then((value: string | undefined) => { if (value !== undefined) input.caller.accept(value); }, (cause: Error) => { if (cause.name !== "AbortError") resultErrors.push(cause.name); });
            await child.ready;
          } else {
            const documents = bindDocuments(parent.root.querySelector<HTMLElement>("[data-documents]")!); parent.own(() => documents.dispose());
            await documents.open("child", { title: "Child", page(host: HTMLElement) { const child = mountPage(host, childDefinition, input);
              const unsubscribe = child.onOutput((value: string) => input.caller.accept(value)); parent.own(unsubscribe); return child; } });
          }
        } };
      }
    });
    // Open Documents before the modal so the second scope does not depend on interacting through a modal boundary.
    const second = mountPage(hosts[1], parentDefinition("two", false)); await second.ready;
    const first = mountPage(hosts[0], parentDefinition("one", true)); await first.ready;
    const one = captured.get("one")!, two = captured.get("two")!;
    const metadata = [one, two].every(context => context.input.opener.matches("[data-opener]") && context.input.request.zero === 0 &&
      context.input.request.enabled === false && context.input.request.empty === null && context.input.request.method === "GET" && context.input.context.scope === context.input.parent.key);
    const isolated = one.input.parent.signal !== two.input.parent.signal && one.input.context.locale !== two.input.context.locale;
    two.output("before"); await first.dispose(); one.output("stale"); one.input.caller.accept("guarded stale");
    const survivor = !two.signal.aborted && !two.input.parent.signal.aborted && two.root.isConnected;
    two.output("after"); await second.dispose(); two.output("closed"); two.input.caller.accept("guarded closed");
    const closed = one.signal.aborted && one.input.parent.signal.aborted && two.signal.aborted && two.input.parent.signal.aborted;
    hosts.forEach(host => host.remove()); return { metadata, isolated, survivor, closed, childCleanup, delivered, resultErrors };
  }, { ...modules, documentsMarkup });
  expect(result).toEqual({ metadata: true, isolated: true, survivor: true, closed: true, childCleanup: 2, delivered: ["two:before", "two:after"], resultErrors: [] });
});
