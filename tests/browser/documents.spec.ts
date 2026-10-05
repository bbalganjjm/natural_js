// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { documents: source("../../src/ui/documents.ts"), pageModule: source("../../src/page/index.ts"), tabsModule: source("../../src/ui/tabs.ts") };

const markup = `
  <div role="tablist" aria-label="Documents">
    <template data-document-tab-template><div role="presentation">
      <button type="button" role="tab" data-document-tab><span data-document-title></span></button>
      <button type="button" data-document-close aria-label="Close document">×</button>
    </div></template>
  </div>
  <div data-document-items></div>
  <div data-document-panels><template data-document-panel-template><section role="tabpanel" hidden></section></template></div>
  <div data-document-empty><button type="button" data-open>Open a document</button></div>
  <p data-document-error role="alert" hidden><strong>Original error</strong> text</p>`;

test("documents reuse keys, reload with the original factory, isolate MDI, and restore authored markup", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ html, documents, pageModule }) => {
    const { bindDocuments } = await import(documents);
    const { mountPage } = await import(pageModule);
    const roots = [document.createElement("section"), document.createElement("section")];
    for (const root of roots) { root.dataset.documents = ""; root.innerHTML = html; document.body.append(root); }
    const authored = roots[0].outerHTML;
    const authoredError = roots[0].querySelector("strong");
    const counts = { mounts: 0, activates: 0, disposes: 0, ignored: 0 };
    const descriptor = { title: "<b>First</b>", page: (host: HTMLElement) => {
      counts.mounts++;
      return mountPage(host, {
        view: () => { const view = document.createElement("article"); view.innerHTML = '<label>Draft <input value="initial"></label>'; return view; },
        controller: () => ({ activate() { counts.activates++; }, dispose() { counts.disposes++; } })
      });
    } };
    const one = bindDocuments(roots[0]);
    const two = bindDocuments(roots[1]);
    await one.open("a", descriptor);
    const input = roots[0].querySelector<HTMLInputElement>("input")!;
    input.value = "retained";
    await one.open("b", descriptor);
    await one.open("a", { title: "Ignored", page: () => { counts.ignored++; throw new Error("ignored"); } });
    const resumed = { same: roots[0].querySelector("input") === input, draft: input.value,
      mounts: counts.mounts, selected: one.selected(), ignored: counts.ignored };
    const copy = one.keys() as string[]; copy.push("external");
    await two.open("a", descriptor);
    const labels = [...document.querySelectorAll("[data-document-title]")].map(element => element.textContent);
    const allIds = [...document.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
    const references = [...document.querySelectorAll("[aria-controls], [aria-labelledby], [aria-describedby]")]
      .flatMap(element => ["aria-controls", "aria-labelledby", "aria-describedby"].flatMap(name =>
        (element.getAttribute(name) ?? "").split(/\s+/).filter(Boolean)))
      .every(id => document.querySelectorAll(`[id="${id}"]`).length === 1);
    const ownership = roots.every(root => {
      const list = root.querySelector('[role="tablist"]')!;
      const owned = list.getAttribute("aria-owns")!.split(" ");
      return owned.length === root.querySelectorAll("[data-document-tab]").length && owned.every(id =>
        root.querySelector("[data-document-items]")!.contains(document.getElementById(id))) &&
        !list.querySelector("[data-document-close]");
    });
    await one.reload("a");
    const reloaded = { fresh: roots[0].querySelector("input") !== input, value: roots[0].querySelector<HTMLInputElement>("input")!.value,
      mounts: counts.mounts, selected: one.selected(), keys: one.keys(), ignored: counts.ignored };
    await one.close("a");
    const fallback = one.selected();
    await one.open("a", descriptor);
    const reopened = { selected: one.selected(), mounts: counts.mounts, keys: one.keys(), other: two.selected() };
    await Promise.all([one.dispose(), two.dispose()]);
    const restored = roots[0].outerHTML === authored && roots[0].querySelector("strong") === authoredError;
    await one.dispose();
    roots.forEach(root => root.remove());
    return { resumed, reloaded, fallback, reopened, counts, labels, idsUnique: new Set(allIds).size === allIds.length, references, ownership, restored };
  }, { html: markup, ...modules });
  expect(result.resumed).toEqual({ same: true, draft: "retained", mounts: 2, selected: "a", ignored: 0 });
  expect(result.reloaded).toEqual({ fresh: true, value: "initial", mounts: 4, selected: "a", keys: ["a", "b"], ignored: 0 });
  expect(result.fallback).toBe("b");
  expect(result.reopened).toEqual({ selected: "a", mounts: 5, keys: ["b", "a"], other: "a" });
  expect(result.counts.disposes).toBe(5);
  expect(result.labels).toEqual(["<b>First</b>", "<b>First</b>", "<b>First</b>"]);
  expect(result.idsUnique && result.references && result.ownership && result.restored).toBe(true);
});

test("malformed page handles release their partial work and Tabs restores authored alert nodes", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ html, documents, tabsModule }) => {
    const { bindDocuments } = await import(documents);
    const { bindTabs } = await import(tabsModule);
    const root = document.createElement("section"); root.dataset.documents = ""; root.innerHTML = html; document.body.append(root);
    const staticRoot = document.createElement("section"); staticRoot.dataset.tabs = "";
    staticRoot.innerHTML = '<div role="tablist" aria-label="Static"><button type="button" role="tab" data-tab="a">A</button></div><section data-panel="a" role="tabpanel" hidden></section><p data-tab-error role="alert" hidden><strong>Keep me</strong></p>';
    document.body.append(staticRoot);
    const authoredStrong = staticRoot.querySelector("strong");
    let disposals = 0;
    const invalid = (host: HTMLElement) => {
      host.append(document.createElement("article"));
      return { ready: Promise.resolve(), dispose() { disposals++; host.replaceChildren(); } };
    };
    const docs = bindDocuments(root);
    const docCode = await docs.open("a", { title: "A", page: invalid }).then(() => "ready", (cause: { code: string }) => cause.code);
    const unhandled: string[] = [];
    const onUnhandled = (event: PromiseRejectionEvent) => { unhandled.push(String(event.reason)); event.preventDefault(); };
    window.addEventListener("unhandledrejection", onUnhandled);
    const invalidCodes = [];
    for (const value of [1, "bad handle"]) {
      invalidCodes.push(await docs.open(String(value), { title: "Invalid", page: () => value })
        .then(() => "ready", (cause: { code: string }) => cause.code));
    }
    await new Promise(resolve => setTimeout(resolve, 0));
    window.removeEventListener("unhandledrejection", onUnhandled);
    const nullRejected = await docs.open("null", { title: "Null failure", page: () => ({
      ready: Promise.reject(null), activate() {}, deactivate() {}, dispose() {}
    }) }).then(() => false, (cause: unknown) => cause === null);
    const nullErrorShown = !root.querySelector<HTMLElement>("[data-document-error]")!.hidden;
    const tabs = bindTabs(staticRoot, { initial: "a", pages: { a: invalid } });
    const tabCode = await tabs.ready.then(() => "ready", (cause: { code: string }) => cause.code);
    const clean = !root.querySelector("article") && !staticRoot.querySelector("article");
    await Promise.all([docs.dispose(), tabs.dispose()]);
    const preserved = authoredStrong === staticRoot.querySelector("strong");
    const cleanupFailures = [];
    const customPage = (dispose: () => void, activate = () => {}) => ({
      ready: Promise.resolve(), activate, deactivate() {}, dispose
    });
    for (const firstFailure of [undefined, null]) {
      const original = root.outerHTML;
      let closeDisposals = 0;
      const closing = bindDocuments(root);
      await closing.open("a", { title: "A", page: () => customPage(() => { closeDisposals++; throw firstFailure; }) });
      await closing.open("b", { title: "B", page: () => customPage(() => { closeDisposals++; },
        () => { throw new Error("Adjacent activation failed"); }) });
      await closing.select("a");
      const closePreserved = await closing.close("a").then(() => false, (cause: unknown) => cause === firstFailure);
      const removed = closing.keys().join() === "b" && closing.selected() === null && closeDisposals === 2;
      await closing.dispose();
      let finalDisposals = 0;
      const disposing = bindDocuments(root);
      await disposing.open("a", { title: "A", page: () => customPage(() => { finalDisposals++; throw firstFailure; }) });
      await disposing.open("b", { title: "B", page: () => customPage(() => { finalDisposals++; throw new Error("Later cleanup failed"); }) });
      const disposePreserved = await disposing.dispose().then(() => false, (cause: unknown) => cause === firstFailure);
      const restored = root.outerHTML === original && disposing.selected() === null && disposing.keys().length === 0;
      cleanupFailures.push({ closePreserved, removed, disposePreserved, finalDisposals, restored });
    }
    root.remove(); staticRoot.remove();
    return { docCode, tabCode, disposals, clean, preserved, invalidCodes, unhandled, nullRejected, nullErrorShown, cleanupFailures };
  }, { html: markup, ...modules });
  expect(result).toEqual({ docCode: "DOCUMENT_PAGE", tabCode: "TAB_PAGE", disposals: 2, clean: true, preserved: true,
    invalidCodes: ["DOCUMENT_PAGE", "DOCUMENT_PAGE"], unhandled: [], nullRejected: true, nullErrorShown: true,
    cleanupFailures: Array.from({ length: 2 }, () => ({ closePreserved: true, removed: true,
      disposePreserved: true, finalDisposals: 2, restored: true })) });
});

test("close during reload waits for the original page cleanup before removing its panel", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ html, documents, pageModule }) => {
    const { bindDocuments } = await import(documents);
    const { mountPage } = await import(pageModule);
    const root = document.createElement("section"); root.dataset.documents = ""; root.innerHTML = html; document.body.append(root);
    const docs = bindDocuments(root);
    let entered: () => void = () => {};
    let release: () => void = () => {};
    const disposing = new Promise<void>(resolve => { entered = resolve; });
    const finishing = new Promise<void>(resolve => { release = resolve; });
    let panel: HTMLElement | undefined;
    let mounts = 0;
    await docs.open("a", { title: "A", page: (host: HTMLElement) => {
      panel = host; mounts++;
      return mountPage(host, { view: () => document.createElement("article"), controller: () => ({
        dispose() { entered(); return finishing; }
      }) });
    } });
    const reload = docs.reload("a").then(() => "ready", (cause: Error) => cause.name);
    await disposing;
    let closeDone = false;
    const close = docs.close("a").then((value: boolean) => { closeDone = true; return value; });
    await new Promise(resolve => setTimeout(resolve, 0));
    const waiting = { closeDone, attached: panel?.isConnected, pageAttached: !!panel?.querySelector("article") };
    release();
    const closed = await close;
    const reloaded = await reload;
    const after = { attached: panel?.isConnected, keys: docs.keys(), selected: docs.selected(), mounts };
    await docs.dispose(); root.remove();
    return { waiting, closed, reloaded, after };
  }, { html: markup, ...modules });
  expect(result).toEqual({ waiting: { closeDone: false, attached: true, pageAttached: true }, closed: true,
    reloaded: "AbortError", after: { attached: false, keys: [], selected: null, mounts: 1 } });
});

test("superseded documents abort, failures recover the previous page, and retained entries retry", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ html, documents, pageModule }) => {
    const { bindDocuments } = await import(documents);
    const { mountPage } = await import(pageModule);
    const root = document.createElement("section"); root.dataset.documents = ""; root.innerHTML = html; document.body.append(root);
    const docs = bindDocuments(root, { errorText: "Page failed" });
    let entered: () => void = () => {};
    const starting = new Promise<void>(resolve => { entered = resolve; });
    let signal: AbortSignal | undefined;
    let attempts = 0;
    const events: string[] = [];
    const descriptor = (name: string) => ({ title: name, page: (host: HTMLElement) => mountPage(host, {
      view: () => document.createElement("article"),
      controller(context: { signal: AbortSignal }) {
        return {
          init() {
            if (name === "b") { signal = context.signal; entered(); return new Promise<void>(() => {}); }
            if (name === "d" && ++attempts === 1) throw new Error("first failure");
          },
          activate() { events.push(`${name}:activate`); },
          deactivate() { events.push(`${name}:deactivate`); },
          dispose() { events.push(`${name}:dispose`); }
        };
      }
    }) });
    await docs.open("a", descriptor("a"));
    const pending = docs.open("b", descriptor("b")).then(() => "ready", (cause: Error) => cause.name);
    await starting;
    const loading = { key: docs.selected(), busy: root.querySelector('[aria-busy="true"]')?.getAttribute("role") };
    await docs.open("c", descriptor("c"));
    const superseded = await pending;
    const failed = await docs.open("d", descriptor("d")).then(() => "ready", (cause: { code: string }) => cause.code);
    const recovered = { selected: docs.selected(), failed, keys: docs.keys(), error: root.querySelector("[data-document-error]")!.textContent };
    await docs.select("d");
    const retried = { selected: docs.selected(), attempts, errorHidden: root.querySelector<HTMLElement>("[data-document-error]")!.hidden };
    await docs.dispose(); root.remove();
    return { loading, superseded, aborted: signal?.aborted, recovered, retried, bDisposals: events.filter(event => event === "b:dispose").length };
  }, { html: markup, ...modules });
  expect(result.loading).toEqual({ key: "b", busy: "tabpanel" });
  expect(result.superseded).toBe("AbortError");
  expect(result.aborted).toBe(true);
  expect(result.recovered).toEqual({ selected: "c", failed: "PAGE_INIT", keys: ["a", "b", "c", "d"], error: "Page failed" });
  expect(result.retried).toEqual({ selected: "d", attempts: 2, errorHidden: true });
  expect(result.bDisposals).toBe(1);
});

test("close guards deduplicate, refusal and errors preserve pages, and disposal cancels a pending guard", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ html, documents, pageModule }) => {
    const { bindDocuments } = await import(documents);
    const { mountPage } = await import(pageModule);
    const root = document.createElement("section"); root.dataset.documents = ""; root.innerHTML = html; document.body.append(root);
    let mode = "refuse";
    let guards = 0;
    let release: (allow: boolean) => void = () => {};
    let entered: () => void = () => {};
    let mountedSignal: AbortSignal | undefined;
    const docs = bindDocuments(root, { errorText: "Close failed", beforeClose() {
      guards++;
      if (mode === "refuse") return false;
      if (mode === "error") throw new Error("guard failed");
      if (mode === "null") throw null;
      entered();
      return new Promise<boolean>(resolve => { release = resolve; });
    } });
    const descriptor = { title: "A", page: (host: HTMLElement) => mountPage(host, {
      view: () => document.createElement("article"), controller({ signal }: { signal: AbortSignal }) { mountedSignal = signal; return {}; }
    }) };
    await docs.open("a", descriptor);
    const refused = await docs.close("a");
    mode = "error";
    const failed = await docs.close("a").then(() => "closed", (cause: Error) => cause.message);
    mode = "null";
    const nullRejected = await docs.close("a").then(() => false, (cause: unknown) => cause === null);
    const intact = { selected: docs.selected(), keys: docs.keys(), aborted: mountedSignal?.aborted,
      message: root.querySelector("[data-document-error]")!.textContent };
    mode = "delay";
    const guardStarted = new Promise<void>(resolve => { entered = resolve; });
    const first = docs.close("a"); const second = docs.close("a");
    await guardStarted;
    const same = first === second;
    release(true);
    const allowed = await first;
    const absent = await docs.close("missing");
    await docs.open("a", descriptor);
    const pendingStarted = new Promise<void>(resolve => { entered = resolve; });
    const pending = docs.close("a").then(() => "closed", (cause: Error) => cause.name);
    await pendingStarted;
    await docs.dispose();
    const canceled = await pending;
    release(true);
    await Promise.resolve();
    const final = { keys: docs.keys(), selected: docs.selected(), aborted: mountedSignal?.aborted,
      clones: root.querySelectorAll("[data-document-tab]").length };
    root.remove();
    return { refused, failed, nullRejected, intact, same, allowed, absent, guards, canceled, final };
  }, { html: markup, ...modules });
  expect(result.refused).toBe(false);
  expect(result.failed).toBe("guard failed");
  expect(result.nullRejected).toBe(true);
  expect(result.intact).toEqual({ selected: "a", keys: ["a"], aborted: false, message: "Close failed" });
  expect(result.same && result.allowed && result.absent).toBe(true);
  expect(result.guards).toBe(5);
  expect(result.canceled).toBe("AbortError");
  expect(result.final).toEqual({ keys: [], selected: null, aborted: true, clones: 0 });
});

test("closing an inactive document does not wait for or cancel another pending selection", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ html, documents, pageModule }) => {
    const { bindDocuments } = await import(documents);
    const { mountPage } = await import(pageModule);
    const root = document.createElement("section"); root.dataset.documents = ""; root.innerHTML = html; document.body.append(root);
    const docs = bindDocuments(root);
    let entered: () => void = () => {};
    const starting = new Promise<void>(resolve => { entered = resolve; });
    let cSignal: AbortSignal | undefined;
    const descriptor = (name: string) => ({ title: name, page: (host: HTMLElement) => mountPage(host, {
      view: () => document.createElement("article"), controller({ signal }: { signal: AbortSignal }) {
        return { init() { if (name === "c") { cSignal = signal; entered(); return new Promise<void>(() => {}); } } };
      }
    }) });
    await docs.open("a", descriptor("a")); await docs.open("b", descriptor("b"));
    const pending = docs.open("c", descriptor("c")).then(() => "ready", (cause: Error) => cause.name);
    await starting;
    const closedA = await docs.close("a");
    const during = { selected: docs.selected(), keys: docs.keys(), cAborted: cSignal?.aborted };
    const closedC = await docs.close("c");
    const after = { selected: docs.selected(), keys: docs.keys(), cAborted: cSignal?.aborted, outcome: await pending };
    await docs.dispose(); root.remove();
    return { closedA, closedC, during, after };
  }, { html: markup, ...modules });
  expect(result.closedA && result.closedC).toBe(true);
  expect(result.during).toEqual({ selected: "c", keys: ["b", "c"], cAborted: false });
  expect(result.after).toEqual({ selected: "b", keys: ["b"], cAborted: true, outcome: "AbortError" });
});

test("a present close guard must explicitly return a boolean before a document is removed", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ html, documents, pageModule }) => {
    const { bindDocuments } = await import(documents);
    const { mountPage } = await import(pageModule);
    const root = document.createElement("section"); root.dataset.documents = ""; root.innerHTML = html; document.body.append(root);
    let answer: unknown;
    const docs = bindDocuments(root, { beforeClose: () => answer });
    await docs.open("a", { title: "A", page: (host: HTMLElement) => mountPage(host, {
      view: () => document.createElement("article"), controller: () => ({})
    }) });
    const cases = [];
    for (const value of [undefined, null, "true", 0, Promise.resolve(undefined)]) {
      answer = value;
      const code = await docs.close("a").then(() => "closed", (cause: { code: string }) => cause.code);
      cases.push({ code, selected: docs.selected(), keys: docs.keys() });
    }
    answer = true;
    const closed = await docs.close("a");
    await docs.dispose(); root.remove();
    return { cases, closed };
  }, { html: markup, ...modules });
  expect(result.cases).toEqual(Array.from({ length: 5 }, () => ({ code: "DOCUMENT_GUARD", selected: "a", keys: ["a"] })));
  expect(result.closed).toBe(true);
});

for (const orientation of ["horizontal", "vertical"] as const) {
test(`${orientation} document keyboard activation, contextual close names, empty focus, and ARIA remain accessible`, async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async ({ html, documents, pageModule, orientation }) => {
    const { bindDocuments } = await import(documents);
    const { mountPage } = await import(pageModule);
    const root = document.createElement("section"); root.dataset.documents = "keyboard"; root.innerHTML = html; document.body.append(root);
    root.querySelector('[role="tablist"]')!.setAttribute("aria-orientation", orientation);
    const unavailable = document.createElement("button");
    unavailable.type = "button"; unavailable.textContent = "Hidden action"; unavailable.style.display = "none";
    root.querySelector("[data-document-empty]")!.prepend(unavailable);
    const docs = bindDocuments(root);
    const open = (key: string) => docs.open(key, { title: key.toUpperCase(), page: (host: HTMLElement) => mountPage(host, {
      view: () => { const view = document.createElement("article"); view.innerHTML = "<p>Document content</p>"; return view; }, controller: () => ({})
    }) });
    (window as any).documentTest = { docs, open };
  }, { html: markup, ...modules, orientation });
  const root = page.locator('[data-documents="keyboard"]');
  expect((await new AxeBuilder({ page }).include('[data-documents="keyboard"]').withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.evaluate(async () => { await (window as any).documentTest.open("a"); await (window as any).documentTest.open("b"); });
  const a = root.getByRole("tab", { name: "A", exact: true });
  const b = root.getByRole("tab", { name: "B", exact: true });
  await b.focus(); await b.press(orientation === "vertical" ? "ArrowUp" : "ArrowLeft");
  await expect(a).toBeFocused(); await expect(b).toHaveAttribute("aria-selected", "true");
  await a.press("Enter"); await expect(a).toHaveAttribute("aria-selected", "true");
  await expect(root.locator('[data-document-close]').first()).toHaveAccessibleDescription("A");
  expect((await new AxeBuilder({ page }).include('[data-documents="keyboard"]').withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  await a.press("Delete"); await expect(b).toHaveAttribute("aria-selected", "true"); await expect(b).toBeFocused();
  await b.press("Delete"); await expect(root.locator("[data-open]")).toBeFocused();
  await expect(root.locator('[role="group"]')).toHaveAccessibleName("Documents");
  await expect(root.locator('[role="group"]')).not.toHaveAttribute("aria-orientation");
  await page.evaluate(async () => { await (window as any).documentTest.docs.dispose(); });
  await expect(root.locator('[role="tablist"]')).toHaveAttribute("aria-orientation", orientation);
});
}

test("invalid repeated templates fail atomically before binding and the root can be corrected", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(({ html, documents }) => {
    return import(documents).then(({ bindDocuments }: any) => {
      const invalid = [
        html.replace("data-document-title", 'id="fixed-title" data-document-title'),
        html.replace("<span data-document-title></span>", "<input><span data-document-title></span>"),
        html.replace('role="tabpanel" hidden></section>', 'role="tabpanel" hidden><p>Not empty</p></section>'),
        html.replace('aria-label="Documents"', 'aria-labelledby="missing-name"'),
        html.replace('data-document-close aria-label="Close document"', 'data-document-close aria-label=""').replace("×", ""),
        html.replace("<span data-document-title></span>", "<span data-document-title><strong>Fixed</strong></span>"),
        html.replace("<span data-document-title></span>", "<video controls></video><span data-document-title></span>"),
        html.replace('role="tablist" aria-label="Documents"', 'role="tablist" aria-label="Documents" aria-owns="external"')
      ];
      const same = document.createElement("div"); same.innerHTML = html;
      same.querySelector("[data-document-empty]")!.remove();
      same.querySelector("[data-document-error]")!.setAttribute("data-document-empty", "");
      invalid.push(same.innerHTML);
      for (const [parent, child] of [
        ["[data-document-empty]", '[role="tablist"]'],
        ["[data-document-empty]", "[data-document-items]"],
        ["[data-document-error]", "[data-document-panels]"],
        ["[data-document-error]", "[data-document-empty]"]
      ]) {
        const nested = document.createElement("div"); nested.innerHTML = html;
        let container = nested.querySelector(parent)!;
        if (container.localName === "p") {
          const block = document.createElement("div");
          for (const attribute of container.attributes) block.setAttribute(attribute.name, attribute.value);
          block.append(...container.childNodes); container.replaceWith(block); container = block;
        }
        container.append(nested.querySelector(child)!);
        invalid.push(nested.innerHTML);
      }
      const results = invalid.map(bad => {
        const root = document.createElement("section"); root.dataset.documents = ""; root.innerHTML = bad; document.body.append(root);
        const before = root.outerHTML;
        let code = "";
        try { bindDocuments(root); } catch (cause) { code = (cause as { code: string }).code; }
        const unchanged = before === root.outerHTML;
        root.remove(); return { code, unchanged };
      });
      const root = document.createElement("section"); root.dataset.documents = ""; root.innerHTML = html; document.body.append(root);
      const docs = bindDocuments(root);
      let code = ""; try { bindDocuments(root); } catch (cause) { code = (cause as { code: string }).code; }
      return docs.dispose().then(async () => { const again = bindDocuments(root); await again.dispose(); root.remove(); return { results, code }; });
    });
  }, { html: markup, ...modules });
  expect(result.results).toEqual(Array.from({ length: 13 }, () => ({ code: "DOCUMENT_MARKUP", unchanged: true })));
  expect(result.code).toBe("DOCUMENT_OWNED");
});
