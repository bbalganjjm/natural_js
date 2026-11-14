// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";
import type { PageContext } from "../../src/page/index.js";

const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { page: source("../../src/page/index.ts"), employee: "/m4/employees.ts" };

test("employee setup completes before component construction and supplies real page choices", async ({ page }) => {
  let release!: () => void, entered!: () => void, searches = 0;
  const waiting = new Promise<void>(resolve => { release = resolve; }), requested = new Promise<void>(resolve => { entered = resolve; });
  page.on("request", request => { if (request.url().includes("/api/employees/search")) searches++; });
  await page.route("**/m4/employee-setup.json", async route => {
    entered(); await waiting;
    await route.fulfill({ json: { pageSizes: [{ label: "Three", value: 3 }, { label: "Seven", value: 7 }], pageSize: 7 } });
  });
  await page.goto("/m4/side.html"); await requested;
  const early = await page.evaluate(async modules => {
    const [{ mountPage }, { createEmployees }] = await Promise.all([import(modules.page), import(modules.employee)]);
    const template = document.querySelector<HTMLTemplateElement>("template[data-screen]")!;
    const host = document.createElement("div"); document.body.append(host);
    let enter!: () => void, release!: () => void;
    const entered = new Promise<void>(resolve => { enter = resolve; }), waiting = new Promise<void>(resolve => { release = resolve; });
    let actions: { search(query: Record<string, unknown>): Promise<boolean> } | undefined, intercepted = 0;
    const handle = mountPage(host, {
      view: () => template.content.firstElementChild!.cloneNode(true),
      advice: [{ match: (path: string) => path === "actions.search", wrap: (proceed: (...args: unknown[]) => unknown) =>
        (...args: unknown[]) => { intercepted++; return proceed(...args); } }],
      controller(context: PageContext<{ close(): void }>) {
        const controller = createEmployees(context, async () => { enter(); await waiting;
          return { pageSizes: [{ label: "5", value: 5 }], pageSize: 5 }; });
        actions = controller.actions;
        return controller;
      }
    }, { close() { void handle.dispose(); } });
    const ready = handle.ready.then(() => "ready", (cause: Error) => cause.name);
    await entered;
    if (!actions) throw new Error("The actual Employee actions were not exposed before init.");
    const retained = actions.search;
    let before = "", after = "";
    try { await retained({ query: "early" }); } catch (cause) { before = cause instanceof Error ? cause.message : String(cause); }
    await handle.dispose(); release(); const readiness = await ready;
    try { await retained({ query: "late" }); } catch (cause) { after = cause instanceof Error ? cause.name : String(cause); }
    const released = host.childElementCount === 0; host.remove();
    return { before, after, readiness, released, intercepted };
  }, modules);
  expect(early).toEqual({ before: "Employee bindings are not ready.", after: "AbortError", readiness: "AbortError", released: true, intercepted: 2 });
  const screen = page.locator('[data-page="employees"]');
  await expect(screen.locator('[data-role="status"]')).toHaveText("Preparing…");
  await screen.locator('[data-role="search"]').evaluate(form => form.addEventListener("submit", event => {
    form.setAttribute("data-submit-prevented", String(event.defaultPrevented));
  }, { once: true }));
  await screen.locator('[data-role="search"] button[type="submit"]').click();
  await expect(screen.locator('[data-role="search"]')).toHaveAttribute("data-submit-prevented", "true");
  await expect(screen.locator('[data-role="page-size"] option')).toHaveCount(1);
  await expect(screen.locator("tbody tr")).toHaveCount(1);
  expect(searches).toBe(0);
  release();
  await expect(screen.locator("tbody tr")).toHaveCount(3);
  await expect(screen.locator('[data-role="page-size"]')).toHaveValue("7");
  await expect(screen.locator('[data-role="page-size"] option')).toHaveText(["Choose a size", "Three", "Seven"]);
  expect(searches).toBe(1);
});

test("closing a pending employee preparation aborts it while a sibling page completes independently", async ({ page }) => {
  let release!: () => void, enter!: () => void, complete!: () => void, calls = 0, searches = 0;
  const waiting = new Promise<void>(resolve => { release = resolve; }), requested = new Promise<void>(resolve => { enter = resolve; });
  const completed = new Promise<void>(resolve => { complete = resolve; });
  page.on("request", request => { if (request.url().includes("/api/employees/search")) searches++; });
  await page.route("**/m4/employee-setup.json", async route => {
    const first = ++calls === 1;
    try {
      if (first) { enter(); await waiting; }
      await route.fulfill({ json: { pageSizes: [{ label: "2", value: 2 }, { label: "5", value: 5 }], pageSize: 5 } });
    } finally { if (first) complete(); }
  });
  await page.goto("/m4/side.html"); await requested;
  const screens = page.locator('[data-page="employees"]');
  await page.locator('[data-action="open"]').click();
  await expect(screens.nth(1).locator("tbody tr")).toHaveCount(3);
  const aborted = page.waitForEvent("requestfailed", request => request.url().includes("/m4/employee-setup.json"));
  await screens.first().locator('[data-action="close"]').click();
  await aborted; await expect(screens).toHaveCount(1);
  release(); await completed;
  await expect(screens.locator('[data-role="status"]')).toHaveText("3 employees");
  expect(searches).toBe(1);
  await expect(page.locator('[data-action="open"]')).toBeFocused();
});

test("invalid employee preparation fails before bindings or search and a later page can retry", async ({ page }) => {
  let calls = 0, searches = 0;
  page.on("request", request => { if (request.url().includes("/api/employees/search")) searches++; });
  await page.route("**/m4/employee-setup.json", route => route.fulfill({ json: {
    pageSizes: [{ label: "5", value: 5 }], pageSize: ++calls === 1 ? 7 : 5
  } }));
  await page.goto("/m4/side.html");
  await expect(page.locator(".screen-host > p")).not.toBeEmpty();
  await expect(page.locator('[data-page="employees"]')).toHaveCount(0); expect(searches).toBe(0);
  await page.locator('[data-action="open"]').click();
  await expect(page.locator('[data-page="employees"] tbody tr')).toHaveCount(3); expect(searches).toBe(1);
});

for (const policy of ["", "trim-search"] as const) {
  test("the actual Employee action keeps search payload ownership with policy " + (policy || "absent"), async ({ page }) => {
    await page.goto("/m4/side.html" + (policy ? "?policy=" + policy : ""));
    const screen = page.locator('[data-page="employees"]');
    await expect(screen.locator("tbody tr")).toHaveCount(3);
    await screen.locator('[data-role="search"] [data-field="query"]').fill("  Ada  ");
    const sent = page.waitForRequest(request => request.url().includes("/api/employees/search"));
    await screen.locator('[data-role="search"] button[type="submit"]').click();
    expect((await sent).postDataJSON().query).toBe(policy ? "Ada" : "  Ada  ");
    await expect(screen.locator('[data-role="status"]')).not.toHaveText("Loading…");
  });
}

test("Employee view eligibility can exclude the real trim policy without changing the method or payload", async ({ page }) => {
  await page.route("**/m4/side-fragment.html", async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace('data-page="employees"', 'data-page="other-employees"');
    await route.fulfill({ response, body });
  });
  await page.goto("/m4/side.html?view=server&policy=trim-search");
  const screen = page.locator(".employee-page");
  await expect(screen.locator("tbody tr")).toHaveCount(3);
  await screen.locator('[data-role="search"] [data-field="query"]').fill("  Ada  ");
  const sent = page.waitForRequest(request => request.url().includes("/api/employees/search"));
  await screen.locator('[data-role="search"] button[type="submit"]').click();
  expect((await sent).postDataJSON().query).toBe("  Ada  ");
});
