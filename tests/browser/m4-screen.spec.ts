// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";

for (const layout of ["side", "stack"] as const) {
  test(layout + " preserves authored HTML through search, edit, nested choice, and save", async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", error => errors.push(error));
    await page.goto("/m4/" + layout + ".html");
    const screen = page.locator('[data-page="employees"]').first();
    await expect(screen.locator("tbody tr")).toHaveCount(3);
    await expect(screen.locator('[data-role="status"]')).toHaveText("3 employees");

    const ada = screen.locator("tbody tr").filter({ hasText: "Ada" });
    await expect(ada.locator("select option")).toHaveCount(2);
    await expect(ada.locator("select option").nth(1)).toHaveText("11");
    await expect(ada.locator("select")).toHaveValue("22");
    await ada.locator("[data-select-row]").focus();
    await page.keyboard.press("Enter");
    await expect(screen.locator('[data-role="selected"]')).toHaveText("Selected: Ada");
    const salary = screen.locator('[data-role="detail"] [data-field="salary"]');
    await expect(salary).toHaveValue("120,000");
    await salary.focus();
    await expect(salary).toHaveValue("120000");
    await salary.fill("125000");
    await salary.blur();
    await expect(salary).toHaveValue("125,000");
    const department = screen.locator('[data-role="detail"] [data-field="profile.department"]');
    await expect(department).toHaveValue("Engineering");
    await department.fill("Infrastructure");

    const saveRequest = page.waitForRequest(request => request.url().includes("/api/employees/save"));
    const saveButton = screen.locator('[data-action="save"]');
    await saveButton.focus();
    await page.keyboard.press("Enter");
    const payload = (await saveRequest).postDataJSON();
    const expected = await import("../../examples/vite/m4/expected-save.json", { with: { type: "json" } });
    expect(payload).toEqual(expected.default);
    expect(payload[0].value.profile).toEqual({ team: "Platform", department: "Infrastructure" });
    await expect(screen.locator('[data-role="status"]')).toHaveText("Saved");
    await expect(screen.locator('[data-action="save"]')).toBeFocused();
    await expect(screen.locator("tbody tr").filter({ hasText: "Ada" })).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test(layout + " keeps two pages ID-clean and independent", async ({ page }) => {
    await page.goto("/m4/" + layout + ".html");
    await page.locator('[data-action="open"]').click();
    const screens = page.locator('[data-page="employees"]');
    await expect(screens).toHaveCount(2);
    await expect(screens.nth(1).locator("tbody tr")).toHaveCount(3);
    await screens.nth(0).locator("tbody tr").filter({ hasText: "Grace" }).locator("[data-select-row]").click();
    await expect(screens.nth(0).locator('[data-role="selected"]')).toHaveText("Selected: Grace");
    await expect(screens.nth(1).locator('[data-role="selected"]')).toHaveText("No employee selected");
    const duplicateIds = await page.locator("[id]").evaluateAll(elements => {
      const ids = elements.map(element => element.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicateIds).toEqual([]);
    const brokenReferences = await page.locator("[aria-describedby]").evaluateAll(elements =>
      elements.flatMap(element => (element.getAttribute("aria-describedby") ?? "").split(/\s+/))
        .filter(id => id && !document.getElementById(id))
    );
    expect(brokenReferences).toEqual([]);
    await screens.nth(0).locator('[data-action="close"]').focus();
    await page.keyboard.press("Enter");
    await expect(screens).toHaveCount(1);
    await expect(page.locator('[data-action="open"]')).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(screens).toHaveCount(2);
    await expect(screens.last().locator("tbody tr")).toHaveCount(3);
  });

  test(layout + " keeps unsaved edits when Enter is pressed in the local filter", async ({ page }) => {
    await page.goto("/m4/" + layout + ".html");
    const screen = page.locator('[data-page="employees"]');
    await screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
    await screen.locator('[data-role="detail"] [data-field="name"]').fill("Ada Edited");
    const filter = screen.locator('[data-role="filter"]');
    await filter.fill("Grace");
    await filter.press("Enter");
    await expect(screen.locator("tbody tr")).toHaveCount(1);
    await expect(screen.locator('[data-role="detail"] [data-field="name"]')).toHaveValue("Ada Edited");
    await filter.fill("");
    await expect(screen.locator("tbody tr").filter({ hasText: "Ada Edited" })).toHaveCount(1);
  });
  test(layout + " keeps invalid drafts by row while navigating and adding", async ({ page }) => {
    await page.goto("/m4/" + layout + ".html");
    const screen = page.locator('[data-page="employees"]');
    const email = screen.locator('[data-role="detail"] [data-field="email"]');
    await screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
    await email.fill("ada-invalid");
    await screen.locator("tbody tr").filter({ hasText: "Grace" }).locator("[data-select-row]").click();
    await expect(screen.locator('[data-role="selected"]')).toHaveText("Selected: Grace");
    await email.fill("grace-invalid");
    await screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
    await expect(email).toHaveValue("ada-invalid");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await screen.locator('[data-action="add"]').click();
    await expect(screen.locator("tbody tr")).toHaveCount(4);
    await screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
    await expect(email).toHaveValue("ada-invalid");
    await screen.locator('[data-action="save"]').click();
    await expect(screen.locator('[data-role="error"]')).not.toBeEmpty();
    await expect(email).toHaveValue("ada-invalid");
  });

  test(layout + " restores focus to a hidden row with an unavailable choice", async ({ page }) => {
    const fixture = await import("../../examples/vite/m4/employees.json", { with: { type: "json" } });
    const rows = structuredClone(fixture.default);
    rows[0].chosen = 999;
    await page.route("**/api/employees/search?*", route => route.fulfill({ json: rows }));
    await page.goto("/m4/" + layout + ".html");
    const screen = page.locator('[data-page="employees"]');
    await screen.locator('[data-role="filter"]').fill("Grace");
    await screen.locator('[data-action="save"]').click();
    await expect(screen.locator('[data-role="error"]')).toHaveText("Choose an available option.");
    await expect(screen.locator('[data-role="filter"]')).toHaveValue("");
    await expect(screen.locator('[data-role="selected"]')).toHaveText("Selected: Ada");
    const select = screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("select");
    await expect(select).toBeFocused();
  });
  test(layout + " handles empty, failed, and replaced searches", async ({ page }) => {
    await page.goto("/m4/" + layout + ".html");
    const screen = page.locator('[data-page="employees"]');
    const query = screen.locator('[data-role="search"] [data-field="query"]');
    await query.fill("empty");
    await screen.locator('[data-role="search"] button[type="submit"]').click();
    await expect(screen.locator("tbody tr")).toHaveCount(0);
    await expect(screen.locator('[data-role="status"]')).toHaveText("0 employees");
    await query.fill("error");
    await screen.locator('[data-role="search"] button[type="submit"]').click();
    await expect(screen.locator('[data-role="status"]')).toHaveText("Search failed");
    await expect(screen.locator('[data-role="error"]')).toContainText("503");
    await query.fill("slow");
    await screen.locator('[data-role="search"] button[type="submit"]').click();
    await query.fill("Grace");
    await screen.locator('[data-role="search"] button[type="submit"]').click();
    await expect(screen.locator("tbody tr")).toHaveCount(1);
    await expect(screen.locator("tbody tr")).toContainText("Grace");
    await page.waitForTimeout(700);
    await expect(screen.locator("tbody tr")).toHaveCount(1);
  });

  test(layout + " validates hidden changes and recovers from save failure", async ({ page }) => {
    await page.goto("/m4/" + layout + ".html");
    const screen = page.locator('[data-page="employees"]');
    await screen.locator('[data-action="add"]').click();
    await screen.locator('[data-role="filter"]').fill("Ada");
    await expect(screen.locator("tbody tr")).toHaveCount(1);
    await screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
    await screen.locator('[data-action="save"]').click();
    await expect(screen.locator('[data-role="error"]')).toContainText(/fill out this field/i);
    await expect(screen.locator("tbody tr")).toHaveCount(4);
    await screen.locator('[data-action="revert"]').click();
    await expect(screen.locator("tbody tr")).toHaveCount(3);

    await screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
    await screen.locator('[data-role="detail"] [data-field="name"]').fill("Ada Lovelace");
    await page.route("**/api/employees/save?*", route => route.fulfill({
      status: 503, contentType: "application/json", body: '{"error":"Mock save failure"}'
    }));
    await screen.locator('[data-action="save"]').click();
    await expect(screen.locator('[data-role="status"]')).toHaveText("Save failed");
    await expect(screen.locator('[data-role="error"]')).toContainText("503");
    await expect(screen.locator("tbody tr").filter({ hasText: "Ada Lovelace" })).toHaveCount(1);
  });
}



test("a saved insert is not resent when the post-save refresh fails", async ({ page }) => {
  const saves: unknown[] = [];
  page.on("request", request => {
    if (request.url().includes("/api/employees/save")) saves.push(request.postDataJSON());
  });
  await page.goto("/m4/side.html");
  const screen = page.locator('[data-page="employees"]');
  await screen.locator('[data-action="add"]').click();
  const detail = screen.locator('[data-role="detail"]');
  await detail.locator('[data-field="name"]').fill("New Employee");
  await detail.locator('[data-field="email"]').fill("new@example.com");
  await detail.locator('[data-field="profile.team"]').fill("Operations");
  await screen.locator('[data-role="search"] [data-field="query"]').fill("error");
  await screen.locator('[data-action="save"]').click();
  await expect(screen.locator('[data-role="status"]')).toHaveText("Saved; refresh failed");
  await expect(screen.locator('[data-role="error"]')).toContainText("503");
  await expect(screen.locator("tbody tr").filter({ hasText: "New Employee" })).toHaveCount(1);
  await screen.locator('[data-action="save"]').click();
  await expect(screen.locator('[data-role="status"]')).toHaveText("No changes");
  expect(saves).toHaveLength(1);
});
test("save locks editing while keeping Close available and aborts after removal", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", error => errors.push(error));
  await page.route("**/api/employees/save?*", async route => {
    await new Promise(resolve => setTimeout(resolve, 500));
    try { await route.continue(); } catch { /* The page may close first. */ }
  });
  await page.goto("/m4/side.html");
  const screen = page.locator('[data-page="employees"]');
  await screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
  await screen.locator('[data-role="detail"] [data-field="name"]').fill("Ada Edited");
  await screen.locator('[data-action="save"]').click();
  await expect(screen.locator('[data-role="status"]')).toHaveText("Saving…");
  await expect(screen.locator('[data-role="detail"]')).toHaveJSProperty("inert", true);
  await expect(screen.locator('[data-role="grid"]')).toHaveJSProperty("inert", true);
  await expect(screen.locator('[data-action="close"]')).toHaveJSProperty("inert", false);
  await screen.locator('[data-action="close"]').click();
  await expect(screen).toHaveCount(0);
  await page.waitForTimeout(600);
  expect(errors).toEqual([]);
});

test("the development mock rejects an entire conflicting save", async ({ page }) => {
  await page.goto("/m4/side.html");
  const result = await page.evaluate(async () => {
    const session = crypto.randomUUID();
    const url = (name: string) => "/api/employees/" + name + "?session=" + session;
    const post = (name: string, body: unknown) => fetch(url(name), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    const original = await (await post("search", { query: "Ada" })).json();
    const changed = { ...original[0], name: "Ada Changed" };
    const response = await post("save", [
      { status: "update", value: changed },
      { status: "update", value: { ...changed, id: "missing" } }
    ]);
    const after = await (await post("search", { query: "Ada" })).json();
    return { status: response.status, name: after[0].name };
  });
  expect(result).toEqual({ status: 409, name: "Ada" });
});
test("closing during a delayed search does not update a removed page", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", error => errors.push(error));
  await page.goto("/m4/side.html");
  const screen = page.locator('[data-page="employees"]');
  await expect(screen.locator("tbody tr")).toHaveCount(3);
  await screen.locator('[data-role="search"] [data-field="query"]').fill("slow");
  await screen.locator('[data-role="search"] button[type="submit"]').click();
  await screen.locator('[data-action="close"]').click();
  await expect(screen).toHaveCount(0);
  await page.waitForTimeout(700);
  expect(errors).toEqual([]);
});
test("server HTML runs the same employee controller in two ID-clean pages", async ({ page }) => {
  const fragmentResponse = page.waitForResponse(response =>
    response.url().endsWith("/m4/side-fragment.html"));
  await page.goto("/m4/side.html?view=server");
  const fragment = await fragmentResponse;
  expect(fragment.ok()).toBe(true);
  expect(await fragment.text()).toContain('data-page="employees"');

  const screens = page.locator('[data-page="employees"]');
  await expect(screens).toHaveCount(1);
  await expect(screens.first().locator("tbody tr")).toHaveCount(3);
  await page.locator('[data-action="open"]').click();
  await expect(screens).toHaveCount(2);
  await expect(screens.nth(1).locator("tbody tr")).toHaveCount(3);
  const duplicateIds = await page.locator("[id]").evaluateAll(elements => {
    const ids = elements.map(element => element.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicateIds).toEqual([]);

  const first = screens.first();
  const ada = first.locator("tbody tr").filter({ hasText: "Ada" });
  const choice = ada.locator("select");
  await expect(choice.locator("option")).toHaveCount(2);
  await choice.selectOption({ index: 0 });
  await choice.selectOption({ index: 1 });
  await ada.locator("[data-select-row]").click();
  await expect(first.locator('[data-role="selected"]')).toHaveText("Selected: Ada");
  const salary = first.locator('[data-role="detail"] [data-field="salary"]');
  await salary.focus();
  await salary.fill("125000");
  const saveRequest = page.waitForRequest(request => request.url().includes("/api/employees/save"));
  await first.locator('[data-action="save"]').click();
  const payload = (await saveRequest).postDataJSON();
  expect(payload).toEqual([{
    status: "update",
    value: expect.objectContaining({ id: "E-101", salary: 125000, chosen: 22 })
  }]);
  await expect(first.locator('[data-role="status"]')).toHaveText("Saved");
  await expect(screens.nth(1).locator("tbody tr")).toHaveCount(3);
});