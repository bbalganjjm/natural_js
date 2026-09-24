import { expect, test } from "@playwright/test";

for (const layout of ["side", "stack"]) {
  test(`${layout} keeps document IDs unique with two live screens`, async ({ page }) => {
    await page.goto(`/m8-task1/${layout}.html`);
    await expect(page.locator("section[data-screen]")).toHaveCount(1);
    await page.getByRole("button", { name: "Open another screen" }).click();
    await expect(page.locator("section[data-screen]")).toHaveCount(2);
    await expect(page.getByRole("searchbox", { name: "Search name" })).toHaveCount(2);
    const duplicates = await page.locator("[id]").evaluateAll(elements => {
      const ids = elements.map(element => element.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicates).toEqual([]);
  });
}
