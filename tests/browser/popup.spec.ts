import { expect, test } from "@playwright/test";

test("output waits for page cleanup, restores focus, and permits immediate reopening", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { openPopup } = await import("/m3-fixture.ts");
    const opener = document.createElement("button");
    opener.textContent = "Open";
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-label", "Picker");
    dialog.innerHTML = '<div data-page-host></div><form method="dialog"><button>Cancel</button></form>';
    document.body.append(opener, dialog);
    opener.focus();
    let release = () => {};
    let disposed = 0;
    let disposeEntered = 0;
    let created = 0;
    async function waitForDispose(count: number) {
      while (disposeEntered < count) await new Promise(resolve => setTimeout(resolve, 0));
    }
    const definition = {
      view: () => {
        const root = document.createElement("section");
        root.innerHTML = '<button type="button">Choose</button>';
        return root;
      },
      controller({ root, signal, output }: {
        root: HTMLElement; signal: AbortSignal; output: (value: number) => void;
      }) {
        created++;
        root.querySelector("button")!.addEventListener("click", () => output(created), { signal });
        return { dispose: () => new Promise<void>(resolve => {
          disposeEntered++;
          release = () => { disposed++; resolve(); };
        }) };
      }
    };
    const first = openPopup(dialog, definition);
    await first.ready;
    dialog.querySelector<HTMLElement>("[data-page-host] button")!.click();
    await waitForDispose(1);
    let settled = false;
    void first.result.then(() => { settled = true; });
    await Promise.resolve();
    const pending = !dialog.open && !settled && disposed === 0;
    release();
    const choice = await first.result;
    const reused = !dialog.open && !dialog.querySelector("[data-page-host]")!.childElementCount && document.activeElement === opener;
    const second = openPopup(dialog, definition);
    await second.ready;
    dialog.close();
    await waitForDispose(2);
    release();
    const canceled = await second.result;
    const focus = document.activeElement === opener;
    await first.close();
    await first.dispose();
    opener.remove(); dialog.remove();
    return { pending, choice, reused, canceled, focus, created, disposed };
  });
  expect(result).toEqual({
    pending: true, choice: 1, reused: true, canceled: undefined,
    focus: true, created: 2, disposed: 2
  });
});

test("closing during initialization aborts ready but resolves an ordinary result", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { openPopup } = await import("/m3-fixture.ts");
    const opener = document.createElement("button");
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-label", "Pending picker");
    dialog.innerHTML = '<div data-page-host></div><button type="button">Cancel</button>';
    document.body.append(opener, dialog);
    opener.focus();
    let started = () => {};
    const entered = new Promise<void>(resolve => { started = resolve; });
    let signal: AbortSignal | undefined;
    let lateOutput = () => {};
    let released = 0;
    const definition = {
      view: () => document.createElement("section"),
      controller(context: { signal: AbortSignal; output: (value: number) => void }) {
        signal = context.signal;
        lateOutput = () => context.output(7);
        return {
          init() { started(); return new Promise<void>(() => {}); },
          dispose() { released++; }
        };
      }
    };
    const handle = openPopup(dialog, definition);
    const readiness = handle.ready.then(() => "ready", cause => cause?.name);
    await entered;
    const closing = handle.close();
    const immediateAbort = signal?.aborted;
    lateOutput();
    const value = await handle.result;
    await closing;
    const ready = await readiness;
    const clean = !dialog.open && !dialog.querySelector("[data-page-host]")!.childElementCount;
    const second = openPopup(dialog, { view: () => document.createElement("section"), controller: () => ({}) });
    const secondReady = second.ready.then(() => "ready", cause => cause?.name);
    const secondResult = second.result.then(() => "resolved", cause => cause?.name);
    await second.dispose();
    const disposed = await secondResult;
    const third = openPopup(dialog, { view: () => document.createElement("section"), controller: () => ({}) });
    await third.ready;
    await third.close();
    const reopenedAfterDispose = !dialog.open;
    opener.remove(); dialog.remove();
    return { immediateAbort, value, ready, clean, released, secondReady: await secondReady, disposed, reopenedAfterDispose };
  });
  expect(result).toEqual({
    immediateAbort: true, value: undefined, ready: "AbortError", clean: true,
    released: 1, secondReady: "AbortError", disposed: "AbortError", reopenedAfterDispose: true
  });
});

test("native cancellation, detached host, and cleanup failure keep one terminal result", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { openPopup } = await import("/m3-fixture.ts");
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-label", "Native picker");
    dialog.innerHTML = '<div data-page-host></div><form method="dialog"><button>Cancel</button></form>';
    document.body.append(dialog);
    const native = openPopup(dialog, { view: () => document.createElement("section"), controller: () => ({}) });
    await native.ready;
    const prevent = (event: Event) => event.preventDefault();
    dialog.addEventListener("cancel", prevent, { once: true });
    dialog.requestClose();
    const prevented = dialog.open;
    dialog.requestClose();
    const nativeResult = await native.result;
    const method = openPopup(dialog, { view: () => document.createElement("section"), controller: () => ({}) });
    await method.ready;
    dialog.querySelector<HTMLButtonElement>("form button")!.click();
    const methodResult = await method.result;
    const detached = openPopup(dialog, { view: () => document.createElement("section"), controller: () => ({}) });
    await detached.ready;
    const detachedOutcome = detached.result.then(() => "resolved", cause => cause?.name);
    dialog.remove();
    const detachedResult = await detachedOutcome;
    const empty = !dialog.querySelector("[data-page-host]")!.childElementCount;
    document.body.append(dialog);
    const failed = openPopup(dialog, {
      view: () => {
        const root = document.createElement("section");
        root.innerHTML = '<button type="button">Choose</button>';
        return root;
      },
      controller({ root, signal, output }: { root: HTMLElement; signal: AbortSignal; output: (value: number) => void }) {
        root.querySelector("button")!.addEventListener("click", () => output(3), { signal });
        return { dispose() { throw new Error("cleanup failed"); } };
      }
    });
    await failed.ready;
    const failedOutcome = failed.result.then(() => "resolved", cause => cause?.code);
    dialog.querySelector<HTMLElement>("[data-page-host] button")!.click();
    const failure = await failedOutcome;
    dialog.remove();
    return { prevented, nativeResult, methodResult, detachedResult, empty, failure };
  });
  expect(result).toEqual({ prevented: true, nativeResult: undefined, methodResult: undefined, detachedResult: "AbortError", empty: true, failure: "PAGE_DISPOSE" });
});

test("malformed dialogs fail synchronously and failed initialization leaves a reusable host", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { openPopup } = await import("/m3-fixture.ts");
    const definition = { view: () => document.createElement("section"), controller: () => ({}) };
    function code(action: () => unknown): string {
      try { action(); return "none"; } catch (cause) { return (cause as { code: string }).code; }
    }
    const detached = document.createElement("dialog");
    const detachedCode = code(() => openPopup(detached, definition));
    const dialog = document.createElement("dialog");
    document.body.append(dialog);
    const malformed = code(() => openPopup(dialog, definition));
    dialog.innerHTML = '<div data-page-host></div>';
    const prevent = (event: Event) => {
      if ((event as ToggleEvent).newState === "open") event.preventDefault();
    };
    dialog.addEventListener("beforetoggle", prevent);
    const prevented = code(() => openPopup(dialog, definition));
    dialog.removeEventListener("beforetoggle", prevent);
    const failing = openPopup(dialog, {
      view: () => document.createElement("section"),
      controller: () => ({ init() { throw new Error("init failed"); } })
    });
    const ready = failing.ready.then(() => "ready", cause => cause?.code);
    const failure = await failing.result.then(() => "resolved", cause => cause?.code);
    const afterFailure = !dialog.open && !dialog.querySelector("[data-page-host]")!.childElementCount;
    const reopened = openPopup(dialog, definition);
    await reopened.ready;
    const busy = code(() => openPopup(dialog, definition));
    await reopened.close();
    dialog.remove();
    return { detachedCode, malformed, prevented, ready: await ready, failure, afterFailure, busy };
  });
  expect(result).toEqual({
    detachedCode: "POPUP_HOST", malformed: "POPUP_HOST", prevented: "POPUP_OPEN",
    ready: "PAGE_INIT", failure: "PAGE_INIT", afterFailure: true, busy: "POPUP_ACTIVE"
  });
});


test("nested popup restores focus to the next authored control when its opener disappears", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { openPopup } = await import("/m3-fixture.ts");
    const outer = document.createElement("dialog");
    outer.setAttribute("aria-label", "Workspace");
    outer.innerHTML = '<button type="button">Before</button><button type="button" data-opener>Open</button><button type="button" data-next>Next</button><dialog aria-label="Nested picker"><div data-page-host></div><button type="button">Cancel</button></dialog>';
    document.body.append(outer);
    outer.showModal();
    const opener = outer.querySelector<HTMLButtonElement>("[data-opener]")!;
    const next = outer.querySelector<HTMLButtonElement>("[data-next]")!;
    const nested = outer.querySelector<HTMLDialogElement>("dialog")!;
    opener.focus();
    const popup = openPopup(nested, { view: () => document.createElement("section"), controller: () => ({}) });
    await popup.ready;
    opener.remove();
    await popup.close();
    const restored = document.activeElement === next && outer.open;
    const again = openPopup(nested, { view: () => document.createElement("section"), controller: () => ({}) });
    await again.ready;
    await again.close();
    const restoredAgain = document.activeElement === next;
    outer.close(); outer.remove();
    return { restored, restoredAgain };
  });
  expect(result).toEqual({ restored: true, restoredAgain: true });
});

test("direct open-attribute removal still aborts page work and settles the result", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { openPopup } = await import("/m3-fixture.ts");
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-label", "Fallback picker");
    dialog.innerHTML = '<div data-page-host></div>';
    document.body.append(dialog);
    let signal: AbortSignal | undefined;
    const popup = openPopup(dialog, {
      view: () => document.createElement("section"),
      controller(context: { signal: AbortSignal }) { signal = context.signal; return {}; }
    });
    await popup.ready;
    dialog.removeAttribute("open");
    const value = await popup.result;
    const clean = signal?.aborted && !dialog.querySelector("[data-page-host]")!.childElementCount;
    dialog.remove();
    return { value, clean };
  });
  expect(result).toEqual({ value: undefined, clean: true });
});


test("twenty openings leave no page DOM or Popup listeners behind", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { openPopup } = await import("/m3-fixture.ts");
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-label", "Repeated picker");
    dialog.innerHTML = '<div data-page-host></div>';
    document.body.append(dialog);
    const add = dialog.addEventListener.bind(dialog);
    const remove = dialog.removeEventListener.bind(dialog);
    let added = 0;
    let removed = 0;
    let disposed = 0;
    dialog.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean) => {
      if (type === "beforetoggle" || type === "close") added++;
      add(type, listener, options);
    }) as typeof dialog.addEventListener;
    dialog.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean) => {
      if (type === "beforetoggle" || type === "close") removed++;
      remove(type, listener, options);
    }) as typeof dialog.removeEventListener;
    const definition = {
      view: () => {
        const root = document.createElement("section");
        root.innerHTML = '<button type="button">Pick</button>';
        return root;
      },
      controller({ root, signal, output }: {
        root: HTMLElement; signal: AbortSignal; output: (value: number) => void;
      }) {
        root.querySelector("button")!.addEventListener("click", () => output(1), { signal });
        return { dispose() { disposed++; } };
      }
    };
    const values: Array<number | undefined> = [];
    let clean = true;
    for (let index = 0; index < 20; index++) {
      const popup = openPopup(dialog, definition);
      await popup.ready;
      if (index % 2) dialog.close();
      else dialog.querySelector<HTMLElement>("[data-page-host] button")!.click();
      values.push(await popup.result);
      clean &&= !dialog.open && dialog.querySelector("[data-page-host]")!.childElementCount === 0;
    }
    dialog.remove();
    return { clean, added, removed, disposed, values };
  });
  expect(result.clean).toBe(true);
  expect(result.added).toBe(40);
  expect(result.removed).toBe(40);
  expect(result.disposed).toBe(20);
  expect(result.values).toEqual(Array.from({ length: 20 }, (_, index) => index % 2 ? undefined : 1));
});

test("close wins over same-task output without beforetoggle notification", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { openPopup } = await import("/m3-fixture.ts");
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-label", "Fallback order");
    dialog.innerHTML = '<div data-page-host></div>';
    document.body.append(dialog);
    dialog.addEventListener("beforetoggle", event => {
      if ((event as ToggleEvent).newState === "closed") event.stopImmediatePropagation();
    });
    let emit = () => {};
    const popup = openPopup(dialog, {
      view: () => document.createElement("section"),
      controller({ output }: { output: (value: number) => void }) {
        emit = () => output(7);
        return {};
      }
    });
    await popup.ready;
    dialog.close();
    emit();
    const value = await popup.result;
    dialog.remove();
    return value;
  });
  expect(result).toBeUndefined();
});
