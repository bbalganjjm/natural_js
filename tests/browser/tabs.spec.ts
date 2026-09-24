import { expect, test } from "@playwright/test";

test("authored tabs keep IDs, navigate manually, and isolate two instances", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindTabs, mountPage } = await import("/m7-fixture.ts");
    const first = document.createElement("section");
    first.dataset.tabs = "";
    first.innerHTML = `
      <div role="tablist" aria-label="First workspace">
        <button type="button" role="tab" data-tab="a" id="authored-tab-a">A</button>
        <button type="button" role="tab" data-tab="b">B</button>
      </div>
      <section role="tabpanel" data-panel="a" id="authored-panel-a" tabindex="0" hidden></section>
      <section role="tabpanel" data-panel="b" hidden></section>
      <p role="alert" data-tab-error hidden></p>`;
    const second = document.createElement("section");
    second.dataset.tabs = "";
    second.innerHTML = `
      <div role="tablist" aria-label="Second workspace">
        <button type="button" role="tab" data-tab="a">A</button>
        <button type="button" role="tab" data-tab="b">B</button>
      </div>
      <section role="tabpanel" data-panel="a" hidden></section>
      <section role="tabpanel" data-panel="b" hidden></section>
      <p role="alert" data-tab-error hidden></p>`;
    document.body.append(first, second);
    const events: string[] = [];
    const define = (label: string) => ({
      view: () => {
        const root = document.createElement("article");
        root.innerHTML = label.endsWith("a") ? '<button type="button">Inside</button>' : '<p>Read-only content</p>';
        return root;
      },
      controller: () => ({
        activate() { events.push(`${label}:activate`); },
        deactivate() { events.push(`${label}:deactivate`); },
        dispose() { events.push(`${label}:dispose`); }
      })
    });
    const one = bindTabs(first, { initial: "a", pages: {
      a: host => mountPage(host, define("one-a")),
      b: host => mountPage(host, define("one-b"))
    } });
    const two = bindTabs(second, { initial: "a", pages: {
      a: host => mountPage(host, define("two-a")),
      b: host => mountPage(host, define("two-b"))
    } });
    await Promise.all([one.ready, two.ready]);
    const authored = {
      ids: [first.querySelector('[data-tab="a"]')!.id, first.querySelector('[data-panel="a"]')!.id],
      relation: first.querySelector('[data-tab="a"]')!.getAttribute("aria-controls"),
      tabIndex: first.querySelector('[data-panel="a"]')!.getAttribute("tabindex")
    };
    const a = first.querySelector<HTMLButtonElement>('[data-tab="a"]')!;
    const b = first.querySelector<HTMLButtonElement>('[data-tab="b"]')!;
    a.focus();
    a.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    const manual = { focused: document.activeElement === b, selected: one.selected(),
      aTabIndex: a.tabIndex, bTabIndex: b.tabIndex };
    b.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 0));
    const afterEnter = { selected: one.selected(), other: two.selected(),
      firstHidden: first.querySelector<HTMLElement>('[data-panel="a"]')!.hidden,
      secondVisible: !first.querySelector<HTMLElement>('[data-panel="b"]')!.hidden,
      emptyPanelTabIndex: first.querySelector<HTMLElement>('[data-panel="b"]')!.tabIndex };
    const eventsBeforeDisposal = [...events];
    await one.select("a");
    first.querySelector<HTMLElement>("article button")!.focus();
    await one.select("b");
    const focusFallback = document.activeElement === b;
    const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
    const uniqueIds = ids.length === new Set(ids).size;
    await Promise.all([one.dispose(), two.dispose()]);
    const restored = {
      authoredIds: [first.querySelector('[data-tab="a"]')!.id, first.querySelector('[data-panel="a"]')!.id],
      generatedIds: [first.querySelector('[data-tab="b"]')!.id, second.querySelector('[data-tab="a"]')!.id],
      authoredTabIndex: first.querySelector('[data-panel="a"]')!.getAttribute("tabindex"),
      noPageRoots: first.querySelectorAll("article").length + second.querySelectorAll("article").length,
      hiddenA: first.querySelector<HTMLElement>('[data-panel="a"]')!.hidden,
      hiddenB: first.querySelector<HTMLElement>('[data-panel="b"]')!.hidden
    };
    first.remove(); second.remove();
    return { authored, manual, afterEnter, uniqueIds, restored, eventsBeforeDisposal, focusFallback };
  });
  expect(result.authored).toEqual({ ids: ["authored-tab-a", "authored-panel-a"],
    relation: "authored-panel-a", tabIndex: "0" });
  expect(result.manual).toEqual({ focused: true, selected: "a", aTabIndex: -1, bTabIndex: 0 });
  expect(result.afterEnter).toEqual({ selected: "b", other: "a", firstHidden: true,
    secondVisible: true, emptyPanelTabIndex: 0 });
  expect(result.uniqueIds).toBe(true);
  expect(result.restored).toEqual({ authoredIds: ["authored-tab-a", "authored-panel-a"],
    generatedIds: ["", ""], authoredTabIndex: "0", noPageRoots: 0, hiddenA: true, hiddenB: true });
  expect(result.eventsBeforeDisposal).toContain("one-a:deactivate");
  expect(result.eventsBeforeDisposal).toContain("one-b:activate");
  expect(result.eventsBeforeDisposal).not.toContain("two-a:deactivate");
  expect(result.focusFallback).toBe(true);
});

test("superseded loads abort, failed pages restore the previous tab, and retry remounts", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindTabs, mountPage } = await import("/m7-fixture.ts");
    const root = document.createElement("section");
    root.dataset.tabs = "";
    root.innerHTML = `
      <div role="tablist" aria-label="Async workspace">
        <button type="button" role="tab" data-tab="a">A</button>
        <button type="button" role="tab" data-tab="b">B</button>
        <button type="button" role="tab" data-tab="c">C</button>
        <button type="button" role="tab" data-tab="d">D</button>
      </div>
      <section role="tabpanel" data-panel="a" hidden></section>
      <section role="tabpanel" data-panel="b" hidden></section>
      <section role="tabpanel" data-panel="c" hidden></section>
      <section role="tabpanel" data-panel="d" hidden></section>
      <p role="alert" data-tab-error hidden></p>`;
    document.body.append(root);
    const events: string[] = [];
    let beginB: () => void = () => {};
    const enteredB = new Promise<void>(resolve => { beginB = resolve; });
    let bSignal: AbortSignal | undefined;
    let dAttempts = 0;
    const definition = (name: string) => ({
      view: () => document.createElement("article"),
      controller({ signal }: { signal: AbortSignal }) {
        if (name === "b") bSignal = signal;
        return {
          init() {
            if (name === "b") { beginB(); return new Promise<void>(() => {}); }
            if (name === "d" && ++dAttempts === 1) throw new Error("first D failed");
          },
          activate() { events.push(`${name}:activate`); },
          deactivate() { events.push(`${name}:deactivate`); },
          dispose() { events.push(`${name}:dispose`); }
        };
      }
    });
    const tabs = bindTabs(root, { initial: "a", errorText: "Page failed", pages: {
      a: host => mountPage(host, definition("a")),
      b: host => mountPage(host, definition("b")),
      c: host => mountPage(host, definition("c")),
      d: host => mountPage(host, definition("d"))
    } });
    await tabs.ready;
    const pending = tabs.select("b").then(() => "ready", (cause: Error) => cause.name);
    await enteredB;
    const during = { selected: tabs.selected(), visible: !root.querySelector<HTMLElement>('[data-panel="b"]')!.hidden,
      busy: root.querySelector('[data-panel="b"]')!.getAttribute("aria-busy") };
    await tabs.select("c");
    const superseded = await pending;
    const afterRace = { selected: tabs.selected(), bAborted: bSignal?.aborted,
      bRemoved: root.querySelector('[data-panel="b"]')!.childElementCount === 0,
      bDisposed: events.filter(event => event === "b:dispose").length,
      busy: root.querySelector('[data-panel="c"]')!.hasAttribute("aria-busy") };
    const failed = await tabs.select("d").then(() => "ready", (cause: { code?: string }) => cause.code);
    const afterFailure = { selected: tabs.selected(), failed,
      alert: root.querySelector('[data-tab-error]')!.textContent,
      alertVisible: !root.querySelector<HTMLElement>('[data-tab-error]')!.hidden,
      cActiveTwice: events.filter(event => event === "c:activate").length,
      dRemoved: root.querySelector('[data-panel="d"]')!.childElementCount === 0 };
    await tabs.select("d");
    const retried = { selected: tabs.selected(), dAttempts,
      errorHidden: root.querySelector<HTMLElement>('[data-tab-error]')!.hidden,
      cDeactivated: events.filter(event => event === "c:deactivate").length };
    await tabs.dispose();
    root.remove();
    return { during, superseded, afterRace, afterFailure, retried };
  });
  expect(result.during).toEqual({ selected: "b", visible: true, busy: "true" });
  expect(result.superseded).toBe("AbortError");
  expect(result.afterRace).toEqual({ selected: "c", bAborted: true, bRemoved: true,
    bDisposed: 1, busy: false });
  expect(result.afterFailure).toEqual({ selected: "c", failed: "PAGE_INIT", alert: "Page failed",
    alertVisible: true, cActiveTwice: 2, dRemoved: true });
  expect(result.retried).toEqual({ selected: "d", dAttempts: 2, errorHidden: true, cDeactivated: 2 });
});

test("initial failure is retryable, borrowed HTML stays, and invalid markup is rejected", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindTabs, mountPage } = await import("/m7-fixture.ts");
    const root = document.createElement("section");
    root.dataset.tabs = "";
    root.innerHTML = `
      <div role="tablist" aria-label="Inline workspace">
        <button type="button" role="tab" data-tab="a">A</button>
        <button type="button" role="tab" data-tab="b" disabled>B</button>
      </div>
      <section role="tabpanel" data-panel="a" hidden><article data-inline>Inline</article></section>
      <section role="tabpanel" data-panel="b" hidden></section>
      <p role="alert" data-tab-error hidden></p>`;
    document.body.append(root);
    const inline = root.querySelector<HTMLElement>("[data-inline]")!;
    let attempts = 0;
    const pages = {
      a: (host: HTMLElement) => mountPage(host, {
        view: inline,
        controller: () => ({ init() { if (++attempts === 1) throw new Error("first failure"); } })
      }),
      b: (host: HTMLElement) => mountPage(host, { view: () => document.createElement("article"), controller: () => ({}) })
    };
    const tabs = bindTabs(root, { initial: "a", pages });
    const first = await tabs.ready.then(() => "ready", (cause: { code?: string }) => cause.code);
    const initial = { first, selected: tabs.selected(), alert: !root.querySelector<HTMLElement>("[data-tab-error]")!.hidden,
      borrowed: inline.isConnected };
    await tabs.select("a");
    const retry = { selected: tabs.selected(), attempts, borrowed: inline.isConnected };
    const disabled = await tabs.select("b").then(() => "ready", (cause: { code?: string }) => cause.code);
    const focused = root.querySelector<HTMLButtonElement>('[data-tab="a"]')!;
    focused.focus();
    focused.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    const skipsDisabled = document.activeElement === focused;
    await tabs.dispose();
    const preserved = inline.isConnected && root.querySelector('[data-panel="a"]')!.contains(inline);
    const again = bindTabs(root, { initial: "a", pages });
    await again.ready;
    await again.dispose();
    const tablist = root.querySelector<HTMLElement>('[role="tablist"]')!;
    tablist.removeAttribute("aria-label");
    tablist.setAttribute("aria-labelledby", "missing-tablist-name");
    let missingLabelCode = "";
    try { bindTabs(root, { initial: "a", pages }); }
    catch (cause) { missingLabelCode = (cause as { code: string }).code; }
    const duplicate = document.createElement("section");
    duplicate.dataset.tabs = "";
    duplicate.innerHTML = `
      <div role="tablist" aria-label="Duplicate">
        <button type="button" role="tab" data-tab="a" id="same-id">A</button>
      </div>
      <section role="tabpanel" data-panel="a" id="same-id" hidden></section>
      <p role="alert" data-tab-error hidden></p>`;
    document.body.append(duplicate);
    let duplicateCode = "";
    try { bindTabs(duplicate, { initial: "a", pages: { a: pages.a } }); }
    catch (cause) { duplicateCode = (cause as { code: string }).code; }
    duplicate.remove(); root.remove();
    return { initial, retry, disabled, skipsDisabled, preserved, duplicateCode, missingLabelCode };
  });
  expect(result).toEqual({
    initial: { first: "PAGE_INIT", selected: null, alert: true, borrowed: true },
    retry: { selected: "a", attempts: 2, borrowed: true },
    disabled: "TAB_DISABLED", skipsDisabled: true, preserved: true, duplicateCode: "DUPLICATE_ID",
    missingLabelCode: "TAB_MARKUP"
  });
});

test("native Enter and Space activate once after arrow focus", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { bindTabs, mountPage } = await import("/m7-fixture.ts");
    const root = document.createElement("section");
    root.dataset.tabs = "keyboard";
    root.innerHTML = `
      <div role="tablist" aria-label="Keyboard workspace">
        <button type="button" role="tab" data-tab="a">A</button>
        <button type="button" role="tab" data-tab="b">B</button>
      </div>
      <section role="tabpanel" data-panel="a" hidden></section>
      <section role="tabpanel" data-panel="b" hidden></section>
      <p role="alert" data-tab-error hidden></p>`;
    document.body.append(root);
    const state = { mountsA: 0, mountsB: 0, activationA: 0, activationB: 0 };
    const tabs = bindTabs(root, { initial: "a", pages: {
      a: host => { state.mountsA++; return mountPage(host, {
        view: () => document.createElement("article"),
        controller: () => ({ activate() { state.activationA++; } })
      }); },
      b: host => { state.mountsB++; return mountPage(host, {
        view: () => document.createElement("article"),
        controller: () => ({
          async init() { await new Promise(resolve => setTimeout(resolve, 20)); },
          activate() { state.activationB++; }
        })
      }); }
    } });
    await tabs.ready;
    (window as typeof window & { m7Keyboard?: { tabs: typeof tabs; state: typeof state } }).m7Keyboard = { tabs, state };
  });
  const a = page.locator('[data-tabs="keyboard"] [data-tab="a"]');
  const b = page.locator('[data-tabs="keyboard"] [data-tab="b"]');
  await a.focus();
  await a.press("ArrowRight");
  await expect(b).toBeFocused();
  await expect(a).toHaveAttribute("aria-selected", "true");
  await b.press("Enter");
  await expect(b).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => page.evaluate(() => (window as typeof window & {
    m7Keyboard: { state: { activationB: number } }
  }).m7Keyboard.state.activationB)).toBe(1);
  await b.press("ArrowLeft");
  await expect(a).toBeFocused();
  await a.press("Space");
  await expect(a).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => page.evaluate(() => (window as typeof window & {
    m7Keyboard: { state: { activationA: number } }
  }).m7Keyboard.state.activationA)).toBe(2);
  const state = await page.evaluate(async () => {
    const harness = (window as typeof window & {
      m7Keyboard: { tabs: { dispose(): Promise<void> }; state: {
        mountsA: number; mountsB: number; activationA: number; activationB: number
      } }
    }).m7Keyboard;
    const snapshot = { ...harness.state };
    await harness.tabs.dispose();
    return snapshot;
  });
  expect(state).toEqual({ mountsA: 1, mountsB: 1, activationA: 2, activationB: 1 });
});

test("failed cached activation is evicted and a later visit creates a fresh page", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindTabs, mountPage } = await import("/m7-fixture.ts");
    const root = document.createElement("section");
    root.dataset.tabs = "";
    root.innerHTML = `
      <div role="tablist" aria-label="Revisit workspace">
        <button type="button" role="tab" data-tab="a">A</button>
        <button type="button" role="tab" data-tab="b">B</button>
        <button type="button" role="tab" data-tab="c">C</button>
      </div>
      <section role="tabpanel" data-panel="a" hidden></section>
      <section role="tabpanel" data-panel="b" hidden></section>
      <section role="tabpanel" data-panel="c" hidden></section>
      <p role="alert" data-tab-error hidden></p>`;
    document.body.append(root);
    let bMounts = 0;
    let bDisposals = 0;
    let cActivations = 0;
    const ordinary = (name: string) => ({
      view: () => document.createElement("article"),
      controller: () => ({ activate() { if (name === "c") cActivations++; } })
    });
    const tabs = bindTabs(root, { initial: "a", pages: {
      a: host => mountPage(host, ordinary("a")),
      b: host => {
        const mountNumber = ++bMounts;
        let activations = 0;
        return mountPage(host, {
          view: () => document.createElement("article"),
          controller: () => ({
            activate() { if (++activations === 2 && mountNumber === 1) throw new Error("revisit failed"); },
            dispose() { bDisposals++; }
          })
        });
      },
      c: host => mountPage(host, ordinary("c"))
    } });
    await tabs.ready;
    await tabs.select("b");
    await tabs.select("c");
    const failed = await tabs.select("b").then(() => "ready", (cause: { code?: string }) => cause.code);
    const recovered = { selected: tabs.selected(), failed, bMounts, bDisposals, cActivations,
      errorVisible: !root.querySelector<HTMLElement>("[data-tab-error]")!.hidden,
      staleRootGone: root.querySelector('[data-panel="b"]')!.childElementCount === 0 };
    await tabs.select("b");
    const retried = { selected: tabs.selected(), bMounts,
      errorHidden: root.querySelector<HTMLElement>("[data-tab-error]")!.hidden };
    await tabs.dispose();
    root.remove();
    return { recovered, retried };
  });
  expect(result).toEqual({
    recovered: { selected: "c", failed: "PAGE_ACTIVATE", bMounts: 1, bDisposals: 1,
      cActivations: 2, errorVisible: true, staleRootGone: true },
    retried: { selected: "b", bMounts: 2, errorHidden: true }
  });
});

test("dispose during initial loading aborts without an unhandled ready rejection", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindTabs, mountPage } = await import("/m7-fixture.ts");
    const root = document.createElement("section");
    root.dataset.tabs = "";
    root.innerHTML = `
      <div role="tablist" aria-label="Pending workspace">
        <button type="button" role="tab" data-tab="a">A</button>
      </div>
      <section role="tabpanel" data-panel="a" hidden></section>
      <p role="alert" data-tab-error hidden></p>`;
    document.body.append(root);
    let enter: () => void = () => {};
    const entered = new Promise<void>(resolve => { enter = resolve; });
    let signal: AbortSignal | undefined;
    const unhandled: string[] = [];
    const onUnhandled = (event: PromiseRejectionEvent) => {
      unhandled.push(String(event.reason?.name ?? event.reason));
      event.preventDefault();
    };
    window.addEventListener("unhandledrejection", onUnhandled);
    const tabs = bindTabs(root, { initial: "a", pages: {
      a: host => mountPage(host, {
        view: () => document.createElement("article"),
        controller(context: { signal: AbortSignal }) {
          signal = context.signal;
          return { init() { enter(); return new Promise<void>(() => {}); } };
        }
      })
    } });
    await entered;
    await tabs.dispose();
    await new Promise(resolve => setTimeout(resolve, 0));
    const result = { aborted: signal?.aborted, selected: tabs.selected(),
      initialHidden: root.querySelector<HTMLElement>('[data-panel="a"]')!.hidden,
      empty: root.querySelector('[data-panel="a"]')!.childElementCount === 0,
      unhandled };
    const readyOutcome = await tabs.ready.then(() => "ready", (cause: Error) => cause.name);
    window.removeEventListener("unhandledrejection", onUnhandled);
    root.remove();
    return { ...result, readyOutcome };
  });
  expect(result).toEqual({ aborted: true, selected: null, initialHidden: true, empty: true,
    unhandled: [], readyOutcome: "AbortError" });
});

test("superseding a slow deactivation retains the previous controller for revisit", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindTabs, mountPage } = await import("/m7-fixture.ts");
    const root = document.createElement("section");
    root.dataset.tabs = "";
    root.innerHTML = `
      <div role="tablist" aria-label="Slow exit workspace">
        <button type="button" role="tab" data-tab="a">A</button>
        <button type="button" role="tab" data-tab="b">B</button>
        <button type="button" role="tab" data-tab="c">C</button>
      </div>
      <section role="tabpanel" data-panel="a" hidden></section>
      <section role="tabpanel" data-panel="b" hidden></section>
      <section role="tabpanel" data-panel="c" hidden></section>
      <p role="alert" data-tab-error hidden></p>`;
    document.body.append(root);
    let entered: () => void = () => {};
    let release: () => void = () => {};
    const exitStarted = new Promise<void>(resolve => { entered = resolve; });
    const slowExit = new Promise<void>(resolve => { release = resolve; });
    let aSignal: AbortSignal | undefined;
    let aControllers = 0;
    let aActivations = 0;
    let aDisposals = 0;
    let bControllers = 0;
    let cActivations = 0;
    const tabs = bindTabs(root, { initial: "a", pages: {
      a: host => mountPage(host, {
        view: () => document.createElement("article"),
        controller({ signal }: { signal: AbortSignal }) {
          aControllers++;
          aSignal = signal;
          return {
            activate() { aActivations++; },
            deactivate() { entered(); return slowExit; },
            dispose() { aDisposals++; }
          };
        }
      }),
      b: host => mountPage(host, {
        view: () => document.createElement("article"),
        controller: () => { bControllers++; return {}; }
      }),
      c: host => mountPage(host, {
        view: () => document.createElement("article"),
        controller: () => ({ activate() { cActivations++; } })
      })
    } });
    await tabs.ready;
    const selectingB = tabs.select("b").then(() => "ready", (cause: Error) => cause.name);
    await exitStarted;
    const selectingC = tabs.select("c");
    const during = { aAborted: aSignal?.aborted, aDisposals, bControllers, selected: tabs.selected() };
    release();
    await selectingC;
    const bOutcome = await selectingB;
    const afterC = { selected: tabs.selected(), aControllers, aDisposals, bControllers, cActivations,
      aAborted: aSignal?.aborted };
    await tabs.select("a");
    const revisited = { selected: tabs.selected(), aControllers, aActivations,
      sameSignal: aSignal?.aborted === false, aDisposals };
    await tabs.dispose();
    root.remove();
    return { during, bOutcome, afterC, revisited };
  });
  expect(result).toEqual({
    during: { aAborted: false, aDisposals: 0, bControllers: 0, selected: "a" },
    bOutcome: "AbortError",
    afterC: { selected: "c", aControllers: 1, aDisposals: 0, bControllers: 0,
      cActivations: 1, aAborted: false },
    revisited: { selected: "a", aControllers: 1, aActivations: 2,
      sameSignal: true, aDisposals: 0 }
  });
});
