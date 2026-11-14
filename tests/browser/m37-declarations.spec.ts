// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";

const codes = [
  { group: "page-size", label: "Two", value: 2 },
  { group: "page-size", label: "Five", value: 5 },
  { group: "page-size", label: "Ten", value: 10 },
  { group: "unrelated", label: "Unrelated", value: 1 }
];
const initial = { query: "", selectedEmployee: "E-102", maxPageSize: 5 };

for (const layout of ["side", "stack"] as const) {
  test(layout + " assembles actual async declarations from one code batch and separate initial data", async ({ page }) => {
    let batches = 0, starts = 0;
    page.on("request", request => { if (new URL(request.url()).pathname.endsWith("/employee-start.json")) starts++; });
    await page.route("**/m4/employee-codes.json?*", route => {
      batches++;
      expect(new URL(route.request().url()).searchParams.get("groups")).toBe("page-size");
      return route.fulfill({ json: codes });
    });
    await page.goto("/m4/" + layout + ".html?declarations=async");
    const screen = page.locator('[data-page="employees"]');
    await expect(screen.locator('[data-role="status"]')).toHaveText("Employee declarations ready");
    await expect(screen.locator("tbody tr")).toHaveCount(3);
    await expect(screen.locator('[data-role="page-size"] option')).toHaveText(["Choose a size", "Two", "Five"]);
    await expect(screen.locator('[data-role="page-size"]')).toHaveValue("5");
    await expect(screen.locator('[data-role="search"] [data-field="query"]')).toHaveValue("");
    await expect(screen.locator('[data-role="selected"]')).toHaveText("Selected: Grace");
    await expect(screen.locator('[data-role="detail"] [data-field="name"]')).toHaveValue("Grace");
    expect({ batches, starts }).toEqual({ batches: 1, starts: 1 });
  });
}

test("ordinary Employee setup still accepts its original overrides without declaration code requests", async ({ page }) => {
  let extras = 0;
  page.on("request", request => { if (/\/employee-(codes|start)\.json$/.test(new URL(request.url()).pathname)) extras++; });
  await page.route("**/m4/employee-setup.json", route => route.fulfill({ json: {
    pageSizes: [{ label: "Three", value: 3 }, { label: "Seven", value: 7 }], pageSize: 7
  } }));
  await page.goto("/m4/side.html");
  const screen = page.locator('[data-page="employees"]');
  await expect(screen.locator('[data-role="status"]')).toHaveText("3 employees");
  await expect(screen.locator('[data-role="page-size"]')).toHaveValue("7");
  await expect(screen.locator('[data-role="page-size"] option')).toHaveText(["Choose a size", "Three", "Seven"]);
  await expect(screen.locator('[data-role="selected"]')).toHaveText("No employee selected");
  expect(extras).toBe(0);
});

test("pending declaration sources block native submit and abort without late construction while a sibling completes", async ({ page }) => {
  let release!: () => void, enter!: () => void, complete!: () => void, seen = 0, settled = 0, searches = 0;
  const waiting = new Promise<void>(resolve => { release = resolve; }), requested = new Promise<void>(resolve => { enter = resolve; });
  const completed = new Promise<void>(resolve => { complete = resolve; });
  const calls = { codes: 0, start: 0 };
  page.on("request", request => { if (request.url().includes("/api/employees/search")) searches++; });
  await page.route(url => /\/m4\/employee-(codes|start)\.json$/.test(url.pathname), async route => {
    const name = new URL(route.request().url()).pathname.endsWith("codes.json") ? "codes" : "start";
    const first = ++calls[name] === 1;
    try {
      if (first) { if (++seen === 2) enter(); await waiting; }
      await route.fulfill({ json: name === "codes" ? codes : initial });
    } finally { if (first && ++settled === 2) complete(); }
  });
  await page.goto("/m4/side.html?declarations=async"); await requested;
  const screens = page.locator('[data-page="employees"]');
  await expect(screens.first().locator('[data-role="status"]')).toHaveText("Preparing…");
  await screens.first().locator('[data-role="search"]').evaluate(form => form.addEventListener("submit", event => {
    form.setAttribute("data-submit-prevented", String(event.defaultPrevented));
  }, { once: true }));
  await screens.first().locator('[data-role="search"] button[type="submit"]').click();
  await expect(screens.first().locator('[data-role="search"]')).toHaveAttribute("data-submit-prevented", "true");
  expect(searches).toBe(0);
  await page.locator('[data-action="open"]').click();
  await expect(screens.nth(1).locator('[data-role="status"]')).toHaveText("Employee declarations ready");
  const aborted = new Set<string>();
  const bothAborted = new Promise<void>(resolve => page.on("requestfailed", request => {
    const path = new URL(request.url()).pathname;
    if (/\/employee-(codes|start)\.json$/.test(path)) { aborted.add(path); if (aborted.size === 2) resolve(); }
  }));
  await screens.first().locator('[data-action="close"]').click(); await bothAborted;
  release(); await completed;
  await expect(screens).toHaveCount(1);
  await expect(screens.locator('[data-role="selected"]')).toHaveText("Selected: Grace");
  await expect(screens.locator('[data-role="status"]')).toHaveText("Employee declarations ready");
  expect(searches).toBe(1);
});

for (const failure of ["codes", "data", "action"] as const) {
  test("failed async declaration " + failure + " stops later phases and a fresh page can retry", async ({ page }) => {
    let codesCalls = 0, startCalls = 0, searches = 0;
    page.on("request", request => { if (request.url().includes("/api/employees/search")) searches++; });
    await page.route("**/m4/employee-codes.json?*", route => {
      if (++codesCalls === 1 && failure === "codes") return route.fulfill({ status: 503, body: "Unavailable" });
      return route.fulfill({ json: codes });
    });
    await page.route("**/m4/employee-start.json", route => {
      const first = ++startCalls === 1;
      return route.fulfill({ json: first && failure === "data" ? { ...initial, maxPageSize: "5" } :
        first && failure === "action" ? { ...initial, selectedEmployee: "E-missing" } : initial });
    });
    await page.goto("/m4/side.html?declarations=async");
    await expect(page.locator(".screen-host > p")).not.toBeEmpty();
    await expect(page.locator('[data-page="employees"]')).toHaveCount(0);
    expect(searches).toBe(failure === "action" ? 1 : 0);
    await page.locator('[data-action="open"]').click();
    await expect(page.locator('[data-page="employees"] [data-role="status"]')).toHaveText("Employee declarations ready");
    await expect(page.locator('[data-page="employees"] [data-role="selected"]')).toHaveText("Selected: Grace");
    expect(searches).toBe(failure === "action" ? 2 : 1);
  });
}

test("declared native search actions use current values exactly once and declared save reads current changes", async ({ page }) => {
  await page.goto("/m4/side.html?declarations=async");
  const screen = page.locator('[data-page="employees"]'), query = screen.locator('[data-role="search"] [data-field="query"]');
  await expect(screen.locator('[data-role="status"]')).toHaveText("Employee declarations ready");
  let searches = 0;
  page.on("request", request => { if (request.url().includes("/api/employees/search")) searches++; });
  await query.fill("Ada");
  const first = page.waitForRequest(request => request.url().includes("/api/employees/search"));
  const firstEntered = await query.inputValue(); await query.press("Enter");
  expect((await first).postDataJSON().query).toBe(firstEntered);
  await expect(screen.locator('[data-role="status"]')).toHaveText("1 employees");
  await query.fill("Grace");
  const second = page.waitForRequest(request => request.url().includes("/api/employees/search"));
  const secondEntered = await query.inputValue();
  await screen.locator('[data-role="search"]').evaluate(form => (form as HTMLFormElement).requestSubmit());
  expect((await second).postDataJSON().query).toBe(secondEntered);
  await expect(screen.locator('[data-role="status"]')).toHaveText("1 employees");
  expect(searches).toBe(2);
  await screen.locator("tbody tr [data-select-row]").click();
  const salary = screen.locator('[data-role="detail"] [data-field="salary"]');
  await salary.fill("111000"); await salary.blur();
  const saved = page.waitForRequest(request => request.url().includes("/api/employees/save"));
  await screen.locator('[data-action="save"]').click();
  const changes = (await saved).postDataJSON();
  expect(changes).toHaveLength(1);
  expect(changes[0]).toMatchObject({ status: "update", value: { id: "E-102", salary: 111000 } });
  await expect(screen.locator('[data-role="status"]')).toHaveText("Saved");
});

test("List repeated and custom row actions retain RowId through view changes and Grid native change observes the committed raw value", async ({ page }) => {
  await page.goto("/m4/side.html?declarations=async");
  const screen = page.locator('[data-page="employees"]'), status = screen.locator('[data-role="status"]');
  await expect(status).toHaveText("Employee declarations ready");
  const grace = screen.locator('[data-role="list"] li').filter({ hasText: "Grace" });
  await expect(grace.locator("select")).toBeDisabled();
  await grace.locator("[data-select-row]").click();
  await expect(status).toHaveText("Inspection 1: Grace (choice 44)");
  await grace.locator("[data-select-row]").click();
  await expect(status).toHaveText("Inspection 2: Grace (choice 44)");
  await grace.evaluate(element => element.dispatchEvent(new CustomEvent("employee-inspect", { bubbles: true, detail: "audit" })));
  await expect(status).toHaveText("Inspection 3: Grace (choice 44) [audit]");
  await screen.locator('[data-role="detail"] [data-field="name"]').fill("Grace Current");
  await screen.locator('[data-action="sort-name"]').click();
  await screen.locator('[data-role="page-size"]').selectOption("2");
  const current = screen.locator('[data-role="list"] li').filter({ hasText: "Grace Current" });
  await current.locator("[data-select-row]").click();
  await expect(status).toHaveText("Inspection 4: Grace Current (choice 44)");
  const retained = await current.elementHandle();
  if (!retained) throw new Error("The current List row is missing.");
  await screen.locator('[data-role="filter"]').fill("Ada");
  await retained.evaluate(element => element.dispatchEvent(new CustomEvent("employee-inspect", { bubbles: true, detail: "retired" })));
  await expect(status).toHaveText("Inspection 4: Grace Current (choice 44)");
  await screen.locator('[data-role="filter"]').fill("");
  const tableGrace = screen.locator("tbody tr").filter({ hasText: "Grace Current" });
  await tableGrace.locator("select").selectOption("66");
  await expect(status).toHaveText("Inspection 5: Grace Current (choice 66)");
  await current.evaluate(element => element.dispatchEvent(new CustomEvent("employee-inspect", { bubbles: true, detail: "reentered" })));
  await expect(status).toHaveText("Inspection 6: Grace Current (choice 66) [reentered]");
});

test("independent declaration pages isolate row actions and silence retained rows after page release", async ({ page }) => {
  await page.goto("/m4/stack.html?declarations=async");
  const screens = page.locator('[data-page="employees"]');
  await expect(screens.first().locator('[data-role="status"]')).toHaveText("Employee declarations ready");
  await page.locator('[data-action="open"]').click();
  await expect(screens.nth(1).locator('[data-role="status"]')).toHaveText("Employee declarations ready");
  const first = screens.first(), sibling = screens.nth(1);
  const row = first.locator('[data-role="list"] li').filter({ hasText: "Grace" });
  await row.locator("[data-select-row]").click(); await row.locator("[data-select-row]").click();
  await expect(first.locator('[data-role="status"]')).toHaveText("Inspection 2: Grace (choice 44)");
  await expect(sibling.locator('[data-role="status"]')).toHaveText("Employee declarations ready");
  const retained = await row.elementHandle();
  if (!retained) throw new Error("The first page's List row is missing.");
  await first.locator('[data-action="close"]').click(); await expect(screens).toHaveCount(1);
  await retained.evaluate(element => element.dispatchEvent(new CustomEvent("employee-inspect", { bubbles: true, detail: "released" })));
  await expect(screens.locator('[data-role="status"]')).toHaveText("Employee declarations ready");
  await screens.locator('[data-role="list"] li').filter({ hasText: "Grace" }).locator("[data-select-row]").click();
  await expect(screens.locator('[data-role="status"]')).toHaveText("Inspection 1: Grace (choice 44)");
});

test("explicit null initial selection and an empty result complete declaration actions without fabricating a row", async ({ page }) => {
  await page.route("**/m4/employee-start.json", route => route.fulfill({ json: { ...initial, query: "empty", selectedEmployee: null } }));
  await page.goto("/m4/side.html?declarations=async");
  const screen = page.locator('[data-page="employees"]');
  await expect(screen.locator('[data-role="status"]')).toHaveText("Employee declarations ready");
  await expect(screen.locator("tbody tr")).toHaveCount(0);
  await expect(screen.locator('[data-role="selected"]')).toHaveText("No employee selected");
  await expect(screen.locator('[data-role="list"] [data-empty]')).toBeVisible();
});
