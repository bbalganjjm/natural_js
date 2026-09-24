import { expect, test } from "@playwright/test";

test("two pages keep separate roots, outputs, and reload input", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { mountPage } = await import("/m3-fixture.ts");
    const hosts = [document.createElement("div"), document.createElement("div")];
    hosts.forEach(host => document.body.append(host));
    const outputs: number[][] = [[], []];
    const inputs: number[] = [];
    let disposed = 0;
    const definition = {
      view: () => {
        const root = document.createElement("section");
        root.innerHTML = '<button type="button">Increment</button><output></output>';
        return root;
      },
      controller({ root, signal, input, output }: {
        root: HTMLElement; signal: AbortSignal; input: { start: number }; output: (value: number) => void
      }) {
        inputs.push(input.start);
        let count = input.start;
        return {
          init() {
            root.querySelector("button")!.addEventListener("click", () => {
              count++;
              root.querySelector("output")!.textContent = String(count);
              output(count);
            }, { signal });
          },
          dispose() { disposed++; }
        };
      }
    };
    const first = mountPage(hosts[0], definition, { start: 10 });
    const second = mountPage(hosts[1], definition, { start: 20 });
    first.onOutput(value => outputs[0].push(value));
    second.onOutput(value => outputs[1].push(value));
    await Promise.all([first.ready, second.ready]);
    const oldRoot = first.root!;
    oldRoot.querySelector("button")!.dispatchEvent(new Event("click"));
    second.root!.querySelector("button")!.dispatchEvent(new Event("click"));
    await first.reload();
    const reloaded = first.root !== oldRoot && !oldRoot.isConnected;
    oldRoot.querySelector("button")!.dispatchEvent(new Event("click"));
    first.root!.querySelector("button")!.dispatchEvent(new Event("click"));
    await Promise.all([first.dispose(), second.dispose()]);
    const empty = hosts.every(host => host.childElementCount === 0);
    hosts.forEach(host => host.remove());
    return { outputs, inputs, reloaded, disposed, empty };
  });
  expect(result).toEqual({
    outputs: [[11, 11], [21]],
    inputs: [10, 20, 10],
    reloaded: true,
    disposed: 3,
    empty: true
  });
});

test("pending initialization aborts immediately and releases resources", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { mountPage } = await import("/m3-fixture.ts");
    const host = document.createElement("div");
    document.body.append(host);
    let started = () => {};
    const entered = new Promise<void>(resolve => { started = resolve; });
    let signal: AbortSignal | undefined;
    let clicks = 0;
    const root = document.createElement("section");
    root.innerHTML = '<button type="button">Run</button>';
    const handle = mountPage(host, {
      view: () => root,
      controller(context: { root: HTMLElement; signal: AbortSignal }) {
        signal = context.signal;
        context.root.querySelector("button")!.addEventListener("click", () => { clicks++; }, { signal });
        return {
          init() {
            started();
            return new Promise<void>(() => {});
          }
        };
      }
    });
    const readiness = handle.ready.then(() => "ready", cause => cause?.name);
    await entered;
    const done = handle.dispose();
    const immediate = signal?.aborted;

    const outcome = await readiness;
    await done;
    root.querySelector("button")!.dispatchEvent(new Event("click"));
    const detached = !root.isConnected && handle.root === null;
    host.remove();
    return { immediate, outcome, detached, clicks };
  });
  expect(result).toEqual({ immediate: true, outcome: "AbortError", detached: true, clicks: 0 });
});

test("fetched HTML has one root and duplicate IDs are rejected", async ({ page }) => {
  await page.route("**/page-fragment.html", route => route.fulfill({
    status: 200,
    contentType: "text/html",
    body: '<section><label for="name">Name</label><input id="name"></section>'
  }));
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { mountPage } = await import("/m3-fixture.ts");
    const firstHost = document.createElement("div");
    const secondHost = document.createElement("div");
    document.body.append(firstHost, secondHost);
    const first = mountPage(firstHost, {
      view: new URL("/page-fragment.html", location.href),
      controller: () => ({})
    });
    await first.ready;
    const second = mountPage(secondHost, {
      view: () => {
        const root = document.createElement("section");
        root.innerHTML = '<label for="name">Other</label><input id="name">';
        return root;
      },
      controller: () => ({})
    });
    const code = await second.ready.then(() => "none", cause => cause?.code);
    const blocked = secondHost.childElementCount === 0;
    await Promise.all([first.dispose(), second.dispose()]);
    firstHost.remove();
    secondHost.remove();
    return { code, blocked };
  });
  expect(result).toEqual({ code: "DUPLICATE_ID", blocked: true });
});



test("fetched HTML rejects executable attributes before insertion", async ({ page }) => {
  await page.route("**/unsafe-fragment.html", route => route.fulfill({
    status: 200,
    contentType: "text/html",
    body: '<section><img src="/missing-image" onerror="globalThis.__inlineRan = true"></section>'
  }));
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { mountPage } = await import("/m3-fixture.ts");
    const host = document.createElement("div");
    document.body.append(host);
    const handle = mountPage(host, {
      view: new URL("/unsafe-fragment.html", location.href),
      controller: () => ({})
    });
    const code = await handle.ready.then(() => "none", cause => cause?.code);
    await handle.dispose();
    const inserted = host.childElementCount > 0;
    const ran = (globalThis as { __inlineRan?: boolean }).__inlineRan === true;
    host.remove();
    return { code, inserted, ran };
  });
  expect(result).toEqual({ code: "PAGE_HTML", inserted: false, ran: false });
});

test("factory roots are checked against the insertion document", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { mountPage } = await import("/m3-fixture.ts");
    const existing = document.createElement("span");
    existing.id = "cross-document-id";
    const host = document.createElement("div");
    document.body.append(existing, host);
    const other = document.implementation.createHTMLDocument("other");
    const handle = mountPage(host, {
      view: () => {
        const root = other.createElement("section");
        root.id = "cross-document-id";
        return root;
      },
      controller: () => ({})
    });
    const code = await handle.ready.then(() => "none", cause => cause?.code);
    const inserted = host.childElementCount > 0;
    await handle.dispose();
    existing.remove();
    host.remove();
    return { code, inserted };
  });
  expect(result).toEqual({ code: "DUPLICATE_ID", inserted: false });
});

test("late own registration disposes a resource after cancellation", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { mountPage } = await import("/m3-fixture.ts");
    const host = document.createElement("div");
    document.body.append(host);
    let resume = () => {};
    let entered = () => {};
    const started = new Promise<void>(resolve => { entered = resolve; });
    let released = 0;
    const handle = mountPage(host, {
      view: () => document.createElement("section"),
      controller(context: { own: (dispose: () => void) => void }) {
        return {
          init() {
            entered();
            return new Promise<void>(resolve => { resume = resolve; }).then(() => {
              context.own(() => { released++; });
            });
          }
        };
      }
    });
    const readiness = handle.ready.then(() => "ready", cause => cause?.name);
    await started;
    await handle.dispose();
    resume();
    await Promise.resolve();
    await Promise.resolve();
    const outcome = await readiness;
    host.remove();
    return { released, outcome };
  });
  expect(result).toEqual({ released: 1, outcome: "AbortError" });
});

test("output stops when a listener reloads its page", async ({ page }) => {
  await page.goto("/");
  const stale = await page.evaluate(async () => {
    const { mountPage } = await import("/m3-fixture.ts");
    const host = document.createElement("div");
    document.body.append(host);
    const handle = mountPage(host, {
      view: () => {
        const root = document.createElement("section");
        root.innerHTML = '<button type="button">Emit</button>';
        return root;
      },
      controller({ root, signal, output }: {
        root: HTMLElement; signal: AbortSignal; output: (value: number) => void
      }) {
        return {
          init() {
            root.querySelector("button")!.addEventListener("click", () => output(1), { signal });
          }
        };
      }
    });
    await handle.ready;
    let pending: Promise<void> | undefined;
    let oldOutput = 0;
    handle.onOutput(() => { pending = handle.reload(); });
    handle.onOutput(() => { oldOutput++; });
    handle.root!.querySelector("button")!.dispatchEvent(new Event("click"));
    await pending;
    await handle.dispose();
    host.remove();
    return oldOutput;
  });
  expect(stale).toBe(0);
});
