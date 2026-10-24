// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
type ProofModule = typeof import("../../examples/vite/m10/progressive.js");
const proofModule = "/m10/progressive.ts";
const mainRows = '[data-grid] tbody tr:not([data-row-template]):not([aria-hidden="true"])';
async function current(page: Page) {
  const value = await page.locator("[data-render-current]").innerText();
  return value.startsWith("{") ? JSON.parse(value) : null;
}
async function demo(page: Page): Promise<void> {
  await page.goto("/m10/demo.html");
  await expect(page.locator(mainRows)).toHaveCount(6);
  await expect.poll(async () => (await current(page))?.last).toBe(true);
}
async function prefix(page: Page): Promise<void> {
  await demo(page);
  await page.locator("[data-render-mode]").selectOption("prefix");
  await expect.poll(async () => (await current(page))?.available).toBe(2);
  await expect(page.locator('[data-render-action="next"]')).toBeEnabled();
}
async function proof(page: Page): Promise<void> {
  await page.goto("/m10/progressive.html");
  const initial = await page.evaluate(async path => {
    const module = await import(path) as ProofModule;
    await module.ready;
    return Promise.all(["a", "b"].map(async slot => {
      const screen = module.screens.get(slot)!;
      const result = await screen.grid.whenBound();
      return { total: result.total, visible: result.visible, available: result.available, mounted: result.mounted,
        first: result.first, last: result.last, scope: screen.grid.rowIds("visible").length };
    }));
  }, proofModule);
  expect(initial).toEqual(["a", "b"].map(() => ({ total: 40, visible: 40, available: 5, mounted: 5,
    first: true, last: false, scope: 40 })));
  await expect.poll(() => page.evaluate(async path => {
    const module = await import(path) as ProofModule;
    return ["a", "b"].map(slot => { const screen = module.screens.get(slot)!;
      return { pending: screen.pending, available: JSON.parse(screen.root.querySelector("[data-progress-state]")!.textContent!).available }; });
  }, proofModule)).toEqual([{ pending: false, available: 5 }, { pending: false, available: 5 }]);
}

test("Immediate remains synchronous and prefix Next exposes full logical scope without changing Rows", async ({ page }) => {
  await demo(page);
  expect(await current(page)).toMatchObject({ total: 6, filtered: 6, visible: 6, available: 6, mounted: 6, first: true, last: true });
  await page.locator("[data-render-mode]").selectOption("prefix");
  await expect.poll(async () => (await current(page))?.available).toBe(2);
  await expect(page.locator(mainRows)).toHaveCount(2);
  expect(await current(page)).toMatchObject({ total: 6, visible: 6, mounted: 2, first: true, last: false });
  const next = page.locator('[data-render-action="next"]');
  await next.focus(); await page.keyboard.press("Enter");
  await expect.poll(async () => (await current(page))?.available).toBe(4);
  await expect(next).toBeFocused();
  expect(await current(page)).toMatchObject({ first: false, last: false });
  await next.click();
  await expect.poll(async () => (await current(page))?.last).toBe(true);
  await expect(next).toBeDisabled();
  await expect(page.locator(mainRows)).toHaveCount(6);
  await expect(page.locator("[data-changes]")).toHaveText("[]");
});

test("Yield all keeps Ping responsive and reports first and last chunk without per-row live output", async ({ page }) => {
  await demo(page);
  const validationRegions = await page.locator('[data-grid] [data-error-for]').evaluateAll(elements =>
    elements.map(element => ({ field: element.getAttribute("data-error-for"), live: element.getAttribute("aria-live") })));
  await page.locator("[data-render-delay]").fill("30"); await page.locator("[data-render-delay]").blur();
  await page.locator("[data-render-mode]").selectOption("all");
  const ping = page.locator('[data-render-action="ping"]');
  await ping.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-render-ping]")).toHaveText("1");
  await expect.poll(async () => (await current(page))?.last).toBe(true);
  const history = JSON.parse(await page.locator("[data-render-history]").innerText());
  expect(history.some((entry: { first: boolean; last: boolean }) => entry.first && !entry.last)).toBe(true);
  expect(history.at(-1)).toMatchObject({ first: false, last: true, available: 6, mounted: 6 });
  await expect(ping).toBeFocused();
  const progress = page.locator("[data-render-notice]");
  await expect(progress).toHaveAttribute("aria-live", "polite");
  await expect(progress).toHaveAttribute("aria-atomic", "true");
  expect(await progress.evaluate(element => element.closest("[data-grid]") === null)).toBe(true);
  await expect(page.locator('[data-grid] [data-render-current], [data-grid] [data-render-history]')).toHaveCount(0);
  expect(await page.locator('[data-grid] [data-error-for]').evaluateAll(elements =>
    elements.map(element => ({ field: element.getAttribute("data-error-for"), live: element.getAttribute("aria-live") })))).toEqual(validationRegions);
});

test("Cancel before full preparation returns unfinished snapshot and Resume retains loaded records", async ({ page }) => {
  await demo(page);
  await page.evaluate(() => {
    const size = document.querySelector<HTMLInputElement>("[data-render-size]")!;
    const delay = document.querySelector<HTMLInputElement>("[data-render-delay]")!;
    const mode = document.querySelector<HTMLSelectElement>("[data-render-mode]")!;
    size.value = "100"; size.dispatchEvent(new Event("change", { bubbles: true }));
    delay.value = "80"; delay.dispatchEvent(new Event("change", { bubbles: true }));
    mode.value = "all"; mode.dispatchEvent(new Event("change", { bubbles: true }));
    document.querySelector<HTMLButtonElement>('[data-render-action="cancel"]')!.click();
  });
  const canceled = await current(page);
  expect(canceled).toMatchObject({ total: 6, visible: 6, last: false });
  expect(canceled.mounted).toBeLessThan(6);
  await expect(page.locator("[data-grid]")).not.toHaveAttribute("aria-busy", "true");
  await expect(page.locator('[data-render-action="resume"]')).toBeEnabled();
  await expect(page.locator("[data-render-notice]")).toContainText("last=false");
  await page.locator('[data-render-action="resume"]').click();
  await expect.poll(async () => (await current(page))?.last).toBe(true);
  await expect(page.locator(mainRows)).toHaveCount(6);
  await expect(page.locator("[data-changes]")).toHaveText("[]");
});

test("a one-shot authored hook failure is observable and Resume retries retained prefix", async ({ page }) => {
  await prefix(page);
  await page.locator("[data-render-fail]").check();
  await page.locator('[data-render-action="next"]').click();
  await expect(page.locator("[data-render-notice]")).toContainText("Binding failed:");
  await expect(page.locator("[data-render-fail]")).not.toBeChecked();
  expect(await current(page)).toMatchObject({ last: false, total: 6 });
  await expect(page.locator('[data-render-action="resume"]')).toBeEnabled();
  await page.locator('[data-render-action="resume"]').click();
  await expect.poll(async () => (await current(page))?.available).toBe(4);
  await expect(page.locator(mainRows)).toHaveCount(4);
  await expect(page.locator("[data-changes]")).toHaveText("[]");
});

test("view supersession and dispose cannot let an old promise overwrite the newer binding UI", async ({ page }) => {
  await prefix(page);
  await page.locator("[data-render-delay]").fill("40"); await page.locator("[data-render-delay]").blur();
  await expect(page.locator('[data-render-action="next"]')).toBeEnabled();
  await page.locator('[data-render-action="next"]').click();
  await page.locator("[data-sort]").selectOption("name-desc");
  await expect(page.locator('[data-render-action="next"]')).toBeEnabled();
  expect(await current(page)).toMatchObject({ available: 2, first: true, last: false });
  await expect(page.locator(mainRows).first().locator('[data-field="name"]')).toHaveText("MARGARET");
  await page.locator('[data-render-action="next"]').click();
  await page.locator('[data-action="dispose"]').click();
  await expect(page.locator("[data-render-current]")).toHaveText("Grid unbound.");
  await page.locator('[data-action="rebind"]').click();
  await expect(page.locator('[data-render-action="next"]')).toBeEnabled();
  expect(await current(page)).toMatchObject({ available: 2, first: true, last: false });
});

test("bottom-scroll continuation and viewport retain bounded actual widgets for loaded prefixes", async ({ page }) => {
  await demo(page);
  await page.locator("[data-viewport]").check();
  await page.locator("[data-render-size]").fill("100"); await page.locator("[data-render-size]").blur();
  await page.locator("[data-render-mode]").selectOption("prefix");
  await page.locator("[data-dataset]").selectOption("5000");
  await expect.poll(async () => (await current(page))?.available).toBe(100);
  let state = await current(page);
  expect(state).toMatchObject({ total: 5000, visible: 5000, last: false });
  expect(state.mounted).toBeLessThan(30);
  await page.locator("[data-scroll-root]").evaluate(root => { root.scrollTop = root.scrollHeight; });
  await expect.poll(async () => (await current(page))?.available).toBeGreaterThanOrEqual(200);
  state = await current(page);
  expect(state.mounted).toBeLessThan(30);
  await expect(page.locator(mainRows)).toHaveCount(state.mounted);
  await expect(page.locator("[data-changes]")).toHaveText("[]");
});

test("late viewport row failure is read through whenBound and resumes without extra completion", async ({ page }) => {
  await demo(page);
  await page.locator("[data-viewport]").check();
  await page.locator("[data-render-size]").fill("6000"); await page.locator("[data-render-size]").blur();
  await page.locator("[data-render-mode]").selectOption("prefix");
  await page.locator("[data-dataset]").selectOption("5000");
  await expect.poll(async () => (await current(page))?.last).toBe(true);
  const previous = JSON.parse(await page.locator("[data-bind-state]").innerText()).calls;
  await page.locator("[data-render-fail]").check();
  await page.locator("[data-scroll-root]").evaluate(root => { root.scrollTop = root.scrollHeight; });
  await expect(page.locator("[data-render-notice]")).toContainText("Binding failed:");
  await expect(page.locator('[data-render-action="resume"]')).toBeEnabled();
  expect(await current(page)).toMatchObject({ available: 5000, visible: 5000, last: false });
  await page.locator('[data-render-action="resume"]').click();
  await expect.poll(async () => (await current(page))?.last).toBe(true);
  expect(JSON.parse(await page.locator("[data-bind-state]").innerText()).calls).toBe(previous);
});

test("empty progressive data completes once without creating rows or enabling continuation", async ({ page }) => {
  await demo(page);
  await page.locator("[data-render-mode]").selectOption("prefix");
  await page.locator("[data-dataset]").selectOption("0");
  await expect.poll(async () => (await current(page))?.last).toBe(true);
  expect(await current(page)).toMatchObject({ total: 0, filtered: 0, visible: 0, available: 0, mounted: 0, first: true, last: true });
  await expect(page.locator('[data-render-action="next"]')).toBeDisabled();
  await expect(page.locator(mainRows)).toHaveCount(0);
});

test("two CVC layouts publish logical chunks and nested raw values without Rows notifications", async ({ page }) => {
  await proof(page);
  const result = await page.evaluate(async path => {
    const module = await import(path) as ProofModule;
    const a = module.screens.get("a")!, b = module.screens.get("b")!;
    let notified = 0;
    const stop = a.rows.subscribe(() => notified++);
    const before = a.rows.entries(), original = a.rows.original(1);
    await a.grid.renderMore(); stop();
    return { loaded: [a.rows.entries().length, b.rows.entries().length], available: a.completions.at(-1)!.available,
      visible: a.grid.rowIds("visible").length, physical: [a.table.tBodies[0].rows.length, b.table.tBodies[0].rows.length],
      flags: a.completions.map(value => [value.first, value.last]), other: b.completions.at(-1)!.available,
      sameProjection: before === a.rows.entries(), sameOriginal: original === a.rows.original(1), raw: a.rows.get(1)!.value.assignment.chosen, notified };
  }, proofModule);
  expect(result).toEqual({ loaded: [40, 40], available: 10, visible: 40, physical: [10, 10], flags: [[true, false], [false, false]],
    other: 5, sameProjection: true, sameOriginal: true, raw: 1, notified: 0 });
});

test("native CVC yield keeps Ping available and cancel resume does not affect its neighbour", async ({ page }) => {
  await proof(page);
  const a = page.locator('[data-progressive-screen="a"]');
  await a.locator('[data-progress-action="all"]').click();
  await a.locator('[data-progress-action="ping"]').click();
  await expect(a.locator("[data-progress-ping]")).toHaveText("1");
  await a.locator('[data-progress-action="cancel"]').click();
  await expect(a.locator('[data-progress-action="resume"]')).toBeEnabled();
  const retained = JSON.parse(await a.locator("[data-progress-state]").innerText());
  expect(retained.last).toBe(false);
  await a.locator('[data-progress-action="resume"]').click();
  await expect(a.locator('[data-progress-action="next"]')).toBeEnabled();
  await expect(page.locator('[data-progressive-screen="b"] [data-progress-state]')).toContainText('"available": 5');
  await a.locator('[data-progress-action="all"]').click();
  await expect.poll(async () => JSON.parse(await a.locator("[data-progress-state]").innerText()).last).toBe(true);
  expect(JSON.parse(await a.locator("[data-progress-state]").innerText())).toMatchObject({ available: 40, mounted: 40 });
});

test("normal deactivate cancels a pending operation and activate resumes the retained instance", async ({ page }) => {
  await proof(page);
  const result = await page.evaluate(async path => {
    const module = await import(path) as ProofModule;
    const screen = module.screens.get("a")!, originalRows = screen.rows, original = screen.rows.original(1);
    const pending = screen.grid.renderMore().then(() => "resolved", cause => cause.name);
    await module.pages.get("a")!.deactivate();
    const paused = { aborted: screen.aborted, paused: screen.paused, connected: screen.root.isConnected,
      last: JSON.parse(screen.root.querySelector("[data-progress-state]")!.textContent!).last };
    const settled = await pending;
    await module.pages.get("a")!.activate(); await screen.grid.whenBound();
    return { paused, settled, sameInstance: module.screens.get("a") === screen, sameRows: screen.rows === originalRows,
      sameOriginal: screen.rows.original(1) === original, available: screen.completions.at(-1)!.available,
      neighbour: module.screens.get("b")!.completions.at(-1)!.available };
  }, proofModule);
  expect(result).toEqual({ paused: { aborted: false, paused: true, connected: true, last: false }, settled: "AbortError",
    sameInstance: true, sameRows: true, sameOriginal: true, available: 10, neighbour: 5 });
});

test("dispose aborts Grid before asynchronous controller cleanup while the other page continues", async ({ page }) => {
  await proof(page);
  const result = await page.evaluate(async path => {
    const module = await import(path) as ProofModule;
    const a = module.screens.get("a")!, b = module.screens.get("b")!;
    const detachedControl = a.table.querySelector<HTMLButtonElement>("[data-select-row]")!;
    const old = a.grid.renderMore().then(() => "resolved", cause => cause.name);
    const dispose = module.pages.get("a")!.dispose();
    const exact = a.table.outerHTML === a.original, snapshot = a.root.outerHTML;
    let mutations = 0; const observer = new MutationObserver(records => { mutations += records.length; });
    observer.observe(a.root, { childList: true, subtree: true, attributes: true, characterData: true });
    const nextB = b.grid.renderMore();
    await new Promise(resolve => setTimeout(resolve, 20));
    const early = { aborted: a.aborted, connected: a.root.isConnected, exact, quiet: snapshot === a.root.outerHTML };
    detachedControl.click();
    await dispose; await nextB;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    observer.disconnect();
    return { early, settled: await old, removed: !a.root.isConnected, mutations, active: a.resources.active,
      clicks: a.resources.clicks, exactAfter: a.table.outerHTML === a.original, other: b.completions.at(-1)!.available };
  }, proofModule);
  expect(result).toEqual({ early: { aborted: true, connected: true, exact: true, quiet: true }, settled: "AbortError",
    removed: true, mutations: 0, active: 0, clicks: 0, exactAfter: true, other: 10 });
});

test("early CVC reload replaces only its instance and suppresses old completion and late writes", async ({ page }) => {
  await proof(page);
  const result = await page.evaluate(async path => {
    const module = await import(path) as ProofModule;
    const old = module.screens.get("a")!, b = module.screens.get("b")!, bRows = b.rows;
    const pending = old.grid.renderMore().then(() => "resolved", cause => cause.name);
    const reload = module.pages.get("a")!.reload();
    const html = old.table.outerHTML, completions = old.completions.length;
    await reload;
    const fresh = module.screens.get("a")!; await fresh.grid.whenBound();
    await b.grid.renderMore();
    return { oldAborted: old.aborted, oldRemoved: !old.root.isConnected, oldExact: html === old.original && old.table.outerHTML === old.original,
      oldQuiet: old.completions.length === completions, oldActive: old.resources.active, settled: await pending,
      fresh: fresh !== old && fresh.rows !== old.rows, first: fresh.completions[0].first,
      available: fresh.completions.at(-1)!.available, bSame: b.rows === bRows, bAvailable: b.completions.at(-1)!.available };
  }, proofModule);
  expect(result).toEqual({ oldAborted: true, oldRemoved: true, oldExact: true, oldQuiet: true, oldActive: 0, settled: "AbortError",
    fresh: true, first: true, available: 5, bSame: true, bAvailable: 10 });
});

test("native CVC Next and two authored layouts retain unique IDs, focus and accessibility", async ({ page }) => {
  await proof(page);
  const a = page.locator('[data-progressive-screen="a"]');
  const next = a.locator('[data-progress-action="next"]');
  await next.focus(); await page.keyboard.press("Enter");
  await expect.poll(async () => JSON.parse(await a.locator("[data-progress-state]").innerText()).available).toBe(10);
  await expect(next).toBeFocused();
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]).analyze();
  expect(axe.violations.map(value => value.id)).toEqual([]);
});
