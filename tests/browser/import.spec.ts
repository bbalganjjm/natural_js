import { expect, test } from "@playwright/test";

test("ESM package loads in two authored views without duplicate IDs", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.goto("/");
  const views = page.locator("[data-demo]");
  await expect(views).toHaveCount(2);
  await expect(views.nth(0).locator("output")).toHaveText("ESM ready");
  await expect(views.nth(1).locator("output")).toHaveText("ESM ready");

  await views.nth(0).getByRole("button", { name: "Check import" }).click();
  await expect(views.nth(0).locator("output")).toHaveText("IMPORT_OK: Package import works");
  await expect(views.nth(1).locator("output")).toHaveText("ESM ready");

  const duplicateIds = await page.locator("[id]").evaluateAll((elements) => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const element of elements) {
      if (seen.has(element.id)) duplicates.push(element.id);
      seen.add(element.id);
    }
    return duplicates;
  });
  expect(duplicateIds).toEqual([]);
  expect(pageErrors).toEqual([]);
});
