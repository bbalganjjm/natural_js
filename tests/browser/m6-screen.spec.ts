// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";

for (const layout of ["side", "stack"] as const) {
  test(layout + " keeps Grid, List, Select, Pagination, and Form in one row flow", async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", error => errors.push(error));
    await page.goto("/m4/" + layout + ".html");
    const screen = page.locator('[data-page="employees"]');
    const gridRows = screen.locator("tbody tr");
    const listRows = screen.locator('[data-role="list"] > li:not([data-empty])');
    const pager = screen.locator('[data-role="pager"]');
    const size = screen.locator('[data-role="page-size"]');

    await expect(gridRows).toHaveCount(3);
    await expect(listRows).toHaveCount(3);
    await expect(size).toHaveValue("5");
    await expect(listRows.filter({ hasText: "Ada" }).locator("select option")).toHaveCount(2);
    await expect(listRows.filter({ hasText: "Ada" }).locator("select")).toBeDisabled();
    await size.selectOption("2");
    await expect(gridRows).toHaveCount(2);
    await expect(listRows).toHaveCount(2);
    await expect(pager.locator("[data-page-status]")).toHaveText("Page 1 of 2");
    await expect(pager.locator("[data-page-prev]")).toBeDisabled();

    const next = pager.locator("[data-page-next]");
    await next.focus();
    await page.keyboard.press("Enter");
    await expect(gridRows).toHaveCount(1);
    await expect(gridRows).toContainText("Lin");
    await expect(listRows).toHaveCount(1);
    await expect(listRows).toContainText("Lin");
    await expect(pager.locator("[data-page-status]")).toHaveText("Page 2 of 2");
    await expect(next).toBeDisabled();
    const listButton = listRows.locator("[data-select-row]");
    await listButton.focus();
    await page.keyboard.press("Enter");
    await expect(screen.locator('[data-role="selected"]')).toHaveText("Selected: Lin");
    await expect(gridRows.locator("[data-select-row]")).toHaveAttribute("aria-pressed", "true");
    await expect(screen.locator('[data-role="detail"] [data-field="name"]')).toHaveValue("Lin");

    await size.selectOption("5");
    await expect(gridRows).toHaveCount(3);
    await expect(listRows).toHaveCount(3);
    await listRows.filter({ hasText: "Ada" }).locator("[data-select-row]").click();
    const name = screen.locator('[data-role="detail"] [data-field="name"]');
    await name.fill("Ada Updated");
    await expect(gridRows.filter({ hasText: "Ada Updated" })).toHaveCount(1);
    await expect(listRows.filter({ hasText: "Ada Updated" })).toHaveCount(1);

    await screen.locator('[data-action="sort-name"]').click();
    await expect(screen.locator("th[aria-sort]")).toHaveAttribute("aria-sort", "ascending");
    const filter = screen.locator('[data-role="filter"]');
    await filter.fill("Grace");
    await expect(gridRows).toHaveCount(1);
    await expect(listRows).toHaveCount(1);
    await expect(pager.locator("[data-page-status]")).toHaveText("Page 1 of 1");
    await filter.fill("No match");
    await expect(gridRows).toHaveCount(0);
    await expect(listRows).toHaveCount(0);
    await expect(screen.locator('[data-role="list"] [data-empty]')).toBeVisible();
    await expect(pager.locator("[data-page-status]")).toHaveText("No pages");
    await filter.fill("");
    await expect(gridRows).toHaveCount(3);
    await expect(listRows).toHaveCount(3);
    expect(errors).toEqual([]);
  });

  test(layout + " keeps two paged instances separate and ID-clean", async ({ page }) => {
    await page.goto("/m4/" + layout + ".html");
    await page.locator('[data-action="open"]').click();
    const screens = page.locator('[data-page="employees"]');
    await expect(screens).toHaveCount(2);
    await expect(screens.nth(1).locator("tbody tr")).toHaveCount(3);
    await screens.first().locator('[data-role="page-size"]').selectOption("2");
    await screens.first().locator('[data-role="pager"] [data-page-next]').click();
    await expect(screens.first().locator("tbody tr")).toHaveCount(1);
    await expect(screens.nth(1).locator("tbody tr")).toHaveCount(3);
    await expect(screens.first().locator('[data-role="list"] > li:not([data-empty])')).toHaveCount(1);
    await expect(screens.nth(1).locator('[data-role="list"] > li:not([data-empty])')).toHaveCount(3);
    const duplicateIds = await page.locator("[id]").evaluateAll(elements => {
      const ids = elements.map(element => element.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicateIds).toEqual([]);
    await screens.first().locator('[data-action="close"]').click();
    await expect(screens).toHaveCount(1);
    await expect(screens.first().locator("tbody tr")).toHaveCount(3);
  });
}

test("a hidden invalid Grid choice reopens its page before focusing", async ({ page }) => {
  const fixture = await import("../../examples/vite/m4/employees.json", { with: { type: "json" } });
  const rows = structuredClone(fixture.default);
  rows[0].chosen = 999;
  await page.route("**/api/employees/search?*", route => route.fulfill({ json: rows }));
  await page.goto("/m4/side.html");
  const screen = page.locator('[data-page="employees"]');
  await screen.locator('[data-role="page-size"]').selectOption("2");
  await screen.locator('[data-role="pager"] [data-page-next]').click();
  await expect(screen.locator("tbody tr")).toContainText("Lin");
  await screen.locator('[data-action="save"]').click();
  await expect(screen.locator('[data-role="error"]')).toHaveText("Choose an available option.");
  await expect(screen.locator('[data-role="pager"] [data-page-status]')).toHaveText("Page 1 of 2");
  await expect(screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("select")).toBeFocused();
});
