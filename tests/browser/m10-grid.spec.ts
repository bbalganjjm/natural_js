import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const textSpacing = `
  * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }
  p { margin-bottom: 2em !important; }
`;

for (const layout of ["side", "stack"] as const) {
  test(layout + " keeps grouped headings, nested choices, and MDI rows independent", async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", error => errors.push(error));
    await page.goto("/m10/" + layout + ".html");
    const screens = page.locator('[data-page="advanced-grid"]');
    const first = screens.first();
    await expect(first.locator("tbody tr")).toHaveCount(40);
    await expect(first.locator('thead th[scope="colgroup"]')).toHaveCount(2);
    await expect(first.locator('thead th[scope="col"]')).toHaveCount(5);
    await expect(first.locator("table")).not.toHaveAttribute("role", "grid");
    await expect(first.locator("tbody tr").first().locator("select option")).toHaveCount(2);
    await expect(first.locator("tbody tr").first().locator("select")).toHaveValue("morning");

    await page.locator("[data-open]").click();
    await expect(screens).toHaveCount(2);
    await expect(screens.last().locator("tbody tr")).toHaveCount(40);
    const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
    expect(new Set(ids).size).toBe(ids.length);

    await first.locator("tbody tr").first().locator("[data-select-row]").click();
    await expect(first.locator("[data-selected]")).toHaveText("Selected: Employee 01");
    await expect(screens.last().locator("[data-selected]")).toHaveText("No employee selected");
    await first.locator("[data-sort-name]").focus();
    await page.keyboard.press("Enter");
    await expect(first.locator("thead th[aria-sort]")).toHaveAttribute("aria-sort", "descending");
    await expect(first.locator("tbody tr").first()).toContainText("Employee 40");
    await expect(screens.last().locator("tbody tr").first()).toContainText("Employee 01");
    await expect(first.locator("[data-selected]")).toHaveText("Selected: Employee 01");

    await first.locator("[data-close]").click();
    await expect(screens).toHaveCount(1);
    await expect(page.locator("[data-open]")).toBeFocused();
    expect(errors).toEqual([]);
  });

  test(layout + " keeps fixed headings visible and the narrow document reflowed", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 256 });
    await page.goto("/m10/" + layout + ".html");
    await page.addStyleTag({ content: textSpacing });
    await expect(page.locator("tbody tr")).toHaveCount(40);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

    const geometry = await page.locator(".grid-scroll").evaluate(scroll => {
      scroll.scrollTop = 400;
      scroll.scrollLeft = 300;
      const bounds = scroll.getBoundingClientRect();
      const head = scroll.querySelector("thead")!.getBoundingClientRect();
      const row = [...scroll.querySelectorAll("tbody tr")].find(element => {
        const rect = element.getBoundingClientRect();
        return rect.top >= bounds.top && rect.bottom <= bounds.bottom;
      })!;
      const firstCell = row.querySelector("th")!.getBoundingClientRect();
      return { top: head.top - bounds.top, left: firstCell.left - bounds.left };
    });
    expect(Math.abs(geometry.top)).toBeLessThan(4);
    expect(Math.abs(geometry.left)).toBeLessThan(4);

    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
      .analyze();
    expect(result.violations.map(violation => violation.id)).toEqual([]);
  });
}
