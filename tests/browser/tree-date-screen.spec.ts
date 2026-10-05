import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const layout of ["side", "stack"] as const) {
  test(`${layout} connects Tree and DatePicker to independent CVC Forms`, async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", error => errors.push(error));
    await page.goto(`/m11/${layout}.html`);
    const first = page.locator('[data-screen="1"]');
    const second = page.locator('[data-screen="2"]');
    await expect(first).toHaveAttribute("data-lifecycle", "active");
    await expect(second).toHaveAttribute("data-lifecycle", "active");
    expect(await first.getAttribute("data-controller")).not.toBe(await second.getAttribute("data-controller"));
    const ada = first.getByRole("treeitem", { name: /^Ada\s*Designer$/ });
    const product = first.getByRole("treeitem", { name: /^Product\s*Team$/ });
    await expect(ada).toHaveAttribute("aria-selected", "true");
    await ada.focus();
    await page.keyboard.press("ArrowUp");
    await expect(product).toBeFocused();
    await expect(ada).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(product).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(ada).toBeFocused();
    await page.keyboard.press("ArrowDown");
    const lin = first.getByRole("treeitem", { name: /^Lin\s*Engineer$/ });
    await expect(lin).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(first.locator('input[data-field="name"]')).toHaveValue("Lin");
    await expect(second.locator('input[data-field="name"]')).toHaveValue("Ada");

    await first.locator('input[data-field="name"]').fill("Lin Updated");
    await expect(first.getByRole("treeitem", { name: /^Lin Updated\s*Engineer$/ })).toHaveAttribute("aria-selected", "true");
    await expect(first.locator("[data-changes]")).toContainText('"name": "Lin Updated"');
    const opener = first.locator("[data-open-date]");
    await opener.click();
    const dialog = first.locator("[data-date-dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-date-value="2026-10-12"]')).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(dialog.locator('[data-date-value="2026-10-13"]')).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();
    await expect(first.locator('input[data-field="date"]')).toHaveValue("2026-10-13");
    await expect(first.locator("[data-changes]")).toContainText('"date": "2026-10-13"');
    await expect(second.locator('input[data-field="date"]')).toHaveValue("2026-10-05");

    await first.getByRole("button", { name: "Validate for save" }).click();
    await expect(first.locator("[data-result]")).toHaveText("Valid changes ready to save");
    await opener.click();
    await expect(dialog.locator('[data-date-value="2026-10-13"]')).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();
    await opener.click();
    await page.keyboard.press("PageDown");
    await expect(dialog.locator('[data-date-value="2026-11-13"]')).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();
    await expect(first.locator('input[data-field="date"]')).toHaveValue("2026-10-13");
    await opener.click();
    await expect(dialog.locator('[data-date-value="2026-10-13"]')).toBeFocused();
    await page.keyboard.press("Escape");
    await first.locator('input[data-field="date"]').fill("2027-11-01");
    await opener.click();
    await dialog.locator('[data-date-value="2027-12-04"]').click();
    await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();
    await expect(first.locator('input[data-field="date"]')).toHaveValue("2027-12-04");
    await first.getByRole("button", { name: "Revert changes" }).click();
    await expect(first.locator('input[data-field="name"]')).toHaveValue("Lin");
    await expect(first.locator('input[data-field="date"]')).toHaveValue("2026-10-12");
    await expect(first.locator("[data-changes]")).toHaveText("[]");
    expect(errors).toEqual([]);
  });

  test(`${layout} keeps authored MDI labels clean through modal use and repeated disposal`, async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", error => errors.push(error));
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(`/m11/${layout}.html`);
    await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }" });
    const first = page.locator('[data-screen="1"]');
    const second = page.locator('[data-screen="2"]');
    await expect(second).toHaveAttribute("data-lifecycle", "active");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
    const closed = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(closed.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => node.target) }))).toEqual([]);
    await first.locator("[data-open-date]").click();
    const dialog = first.locator("[data-date-dialog]");
    await expect(dialog).toBeVisible();
    const opened = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(opened.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => node.target) }))).toEqual([]);
    const references = await page.evaluate(() => {
      const targets = new Map<string, Element[]>();
      for (const element of document.querySelectorAll("[id]")) targets.set(element.id, [...targets.get(element.id) ?? [], element]);
      const duplicates = [...targets].filter(([, elements]) => elements.length !== 1).map(([id]) => id);
      const dangling: string[] = [];
      for (const element of document.querySelectorAll("[aria-labelledby], [aria-describedby]")) {
        for (const attribute of ["aria-labelledby", "aria-describedby"]) {
          for (const id of (element.getAttribute(attribute) ?? "").split(/\s+/).filter(Boolean)) {
            const target = targets.get(id);
            if (target?.length !== 1 || target[0].closest("[data-screen]") !== element.closest("[data-screen]")) dangling.push(id);
          }
        }
      }
      return { duplicates, dangling };
    });
    expect(references).toEqual({ duplicates: [], dangling: [] });
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(first.locator("[data-open-date]")).toBeFocused();
    await first.locator("[data-remove-screen]").click();
    await expect(first).toHaveCount(0);
    await expect(page.locator("[data-add-screen]")).toBeFocused();
    await page.locator("[data-add-screen]").click();
    const third = page.locator('[data-screen="3"]');
    await expect(third).toHaveAttribute("data-lifecycle", "active");
    await third.locator("[data-open-date]").click();
    await third.locator('[data-date-value="2026-10-07"]').click();
    await expect(third.locator('input[data-field="date"]')).toHaveValue("2026-10-07");
    await expect(second.locator('input[data-field="date"]')).toHaveValue("2026-10-05");
    await third.locator("[data-open-date]").click();
    await third.locator("[data-remove-screen]").evaluate(button => (button as HTMLButtonElement).click());
    await expect(third).toHaveCount(0);
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
