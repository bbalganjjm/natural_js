// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";

test("shared value policy refresh updates the authored Form Grid and List preview without writing Rows", async ({ page }) => {
  await page.goto("/m10/demo.html");
  const preview = page.locator("[data-value-demo]");
  const employment = [preview.locator('[data-value-form] [data-field="active"]'),
    preview.locator('[data-value-grid] tbody [data-field="active"]').first(),
    preview.locator('[data-value-list] [data-field="active"]').first()];
  for (const value of employment) await expect(value).toHaveText("Active");
  const changes = await page.locator("[data-changes]").textContent();
  const events = await page.locator("[data-event]").textContent();
  await preview.getByRole("checkbox", { name: "Show readable employment labels" }).uncheck();
  for (const value of employment) await expect(value).toHaveText("Active");
  const refresh = preview.getByRole("button", { name: "Refresh shared value policy" });
  await refresh.focus(); await refresh.press("Enter");
  for (const value of employment) await expect(value).toHaveText("true");
  await expect(refresh).toBeFocused();
  await expect(page.locator("[data-changes]")).toHaveText(changes!);
  await expect(page.locator("[data-event]")).toHaveText(events!);
  const active = page.locator('[data-grid] tbody tr:not([data-row-template]) [data-field="active"]').first();
  await active.uncheck();
  for (const value of employment) await expect(value).toHaveText("false");
  await expect(preview.locator("[data-value-observer]")).toContainText('"phase": "val"');
  const committed = await page.locator("[data-changes]").textContent();
  await preview.getByRole("checkbox", { name: "Show readable employment labels" }).check();
  await refresh.click();
  for (const value of employment) await expect(value).toHaveText("Inactive");
  await expect(active).not.toBeChecked();
  await expect(page.locator("[data-changes]")).toHaveText(committed!);
});
