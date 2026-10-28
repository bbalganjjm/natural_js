import { expect, test } from "@playwright/test";

const records = '[data-grid] tbody tr:not([data-row-template]):not([aria-hidden="true"])';
const errors = new WeakMap<object, string[]>();
test.beforeEach(({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", error => messages.push(error.message));
});
test.afterEach(({ page }) => { expect(errors.get(page)).toEqual([]); });

test("demo row-area activation is opt-in, excludes editors and survives policy rebind", async ({ page }) => {
  await page.goto("/m10/demo.html");
  const cell = page.locator(records).first().locator("td").first();
  await cell.evaluate(element => (element as HTMLElement).click());
  await expect(page.locator("[data-selection]")).toHaveText("No row selected");
  await page.locator("[data-select-on-row-click]").check();
  await page.locator("[data-toggle-selection]").check();
  await cell.evaluate(element => (element as HTMLElement).click());
  await expect(page.locator("[data-selection]")).toContainText("Ada");
  await cell.evaluate(element => (element as HTMLElement).click());
  await expect(page.locator("[data-selection]")).toHaveText("No row selected");
  await page.locator(records).first().locator('input[data-field="email"]').click();
  await expect(page.locator("[data-selection]")).toHaveText("No row selected");
  const button = page.locator(records).first().locator("[data-select-row]");
  await button.focus();
  await button.press("Space");
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await button.press("Enter");
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await page.locator("[data-select-on-row-click]").uncheck();
  await cell.evaluate(element => (element as HTMLElement).click());
  await expect(page.locator("[data-selection]")).toHaveText("No row selected");
});

test("demo root observation follows Grid commits and invalid drafts without accumulating listeners", async ({ page }) => {
  await page.goto("/m10/demo.html");
  const output = page.locator("[data-post-edit]");
  const salary = page.locator(records).first().locator('input[data-field="salary"]');
  await salary.fill("245");
  await expect(output).toContainText('"event":"input"');
  await expect(output).toContainText('"salary":150');
  await salary.dispatchEvent("change");
  await expect(output).toContainText('"event":"change"');
  await expect(output).toContainText('"salary":245');
  await salary.fill("-1");
  await salary.dispatchEvent("change");
  await expect(salary).toHaveAttribute("aria-invalid", "true");
  await expect(output).toContainText('"salary":245');
  await page.locator("[data-select-on-row-click]").check();
  await salary.fill("260");
  await salary.dispatchEvent("change");
  await expect(output).toContainText('"salary":260');
  await page.locator('[data-action="dispose"]').evaluate(button => (button as HTMLButtonElement).click());
  const retained = await output.innerText();
  await page.locator('[data-grid] input[data-field="salary"]').dispatchEvent("change");
  await expect(output).toHaveText(retained);
});

test("authored row hover and keyboard focus remain presentation in both independent layouts", async ({ page }) => {
  await page.goto("/m10/columns.html");
  const tables = page.locator("table");
  await expect(tables).toHaveCount(2);
  for (const table of await tables.all()) {
    const row = table.locator("tbody tr").first();
    const before = await row.innerText();
    await row.hover();
    await expect(row).toHaveCSS("outline-style", "solid");
    const button = row.locator("[data-select-row]");
    await page.mouse.move(0, 0);
    await button.focus();
    await expect(row).toHaveCSS("outline-style", "solid");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(row).toHaveText(before, { useInnerText: true });
    await expect(row).not.toHaveAttribute("role", "gridcell");
  }
});
