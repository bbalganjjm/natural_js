import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/m10/demo.html");
  await expect(page.locator("tbody tr:not([data-row-template])")).toHaveCount(6);
});

test("authored table binds raw nested choices, formatter, and accessible labels", async ({ page }) => {
  const rows = page.locator("tbody tr:not([data-row-template])");
  await expect(rows.first().locator('[data-field="name"]')).toHaveText("ADA");
  await expect(rows.first().locator("select option")).toHaveCount(3);
  await expect(rows.nth(1).locator("select option")).toHaveCount(3);
  await expect(rows.first().locator("select")).toHaveValue("1");
  await expect(rows.nth(1).locator("select")).toHaveValue("3");
  await page.locator('[data-action="select-first"]').click();
  await expect(page.locator("[data-snapshot]")).toContainText('"name": "Ada"');
  await expect(page.locator("[data-callback]")).toContainText("event programmatic");
  await rows.nth(1).locator("[data-select-row]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-callback]")).toContainText("event click");
  await expect(page.locator("[data-selection]")).toContainText("Grace");
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
    .analyze();
  expect(axe.violations.map(violation => violation.id)).toEqual([]);
  await page.setViewportSize({ width: 320, height: 640 });
  await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("sort, filter, and local pages preserve RowId selection", async ({ page }) => {
  const rows = page.locator("tbody tr:not([data-row-template])");
  await page.locator('[data-action="select-first"]').click();
  await page.locator("[data-sort]").selectOption("name-desc");
  await expect(page.locator('thead th[aria-sort="descending"]')).toContainText("Employee");
  await expect(rows.first()).toContainText("MARGARET");
  await page.locator("[data-sort]").selectOption("salary-desc");
  await expect(page.locator('thead th[aria-sort="descending"]')).toContainText("Salary");
  await expect(page.locator('thead th').first()).toHaveAttribute("aria-sort", "none");
  await page.locator("[data-filter]").selectOption("Platform");
  await expect(rows).toHaveCount(3);
  await page.locator("[data-size]").selectOption("2");
  await expect(page.locator("[data-page-state]")).toContainText("Page 1 of 2");
  await page.locator('[data-action="next"]').click();
  await expect(page.locator("[data-page-state]")).toContainText("Page 2 of 2");
  await expect(rows).toHaveCount(1);
  await expect(page.locator("[data-selection]")).toContainText("RowId 1: Ada");
  await page.locator("[data-size]").selectOption("");
  await page.locator("[data-filter]").selectOption("");
  await page.locator("[data-sort]").selectOption("none");
  await expect(rows.first()).toContainText("ADA");
  await expect(page.locator("[data-page-state]")).toContainText("paging off");
});

test("initial page choice rebinds a bounded view and keeps off-page RowId selection", async ({ page }) => {
  const rows = page.locator("tbody tr:not([data-row-template])");
  await page.locator('[data-action="select-first"]').click();
  await page.locator("[data-initial-page]").selectOption("second");
  await expect(page.locator("[data-status]")).toContainText("selection and uncommitted edits were cleared");
  await expect(page.locator("[data-selection]")).toHaveText("No row selected");
  await expect(page.locator("[data-size]")).toHaveValue("2");
  await expect(page.locator("[data-page-state]")).toContainText("Page 2 of 3");
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText("LINUS");

  await page.locator('[data-action="select-first"]').click();
  await expect(page.locator("[data-selection]")).toContainText("RowId 1: Ada");
  await expect(rows.first()).not.toContainText("ADA");
  await page.locator("[data-size]").selectOption("");
  await expect(page.locator("[data-page-state]")).toContainText("paging off");
  await expect(page.locator("[data-initial-page]")).toHaveValue("");
  await expect(rows).toHaveCount(6);
  await expect(rows.first().locator("[data-select-row]")).toHaveAttribute("aria-pressed", "true");
});

test("parsing, HTML constraints, and application validation retain invalid drafts", async ({ page }) => {
  const first = page.locator("tbody tr:not([data-row-template])").first();
  await first.locator("[data-select-row]").click();
  const salary = first.locator('[data-field="salary"]');
  await salary.fill("");
  await salary.blur();
  await page.locator('[data-action="validate-selected"]').click();
  await expect(page.locator("[data-issues]")).toContainText('"rule": "parse"');
  await expect(page.locator("[data-changes]")).toHaveText("[]");

  await salary.fill("50");
  await salary.blur();
  await page.locator('[data-action="validate-selected"]').click();
  await expect(first.locator('[data-error-for="salary"]')).toContainText("Salary must be at least 100.");
  await expect(page.locator("[data-issues]")).toContainText('"rule": "payAtLeast"');
  await expect(page.locator("[data-snapshot]")).toContainText('"salary": 150');

  await salary.fill("180");
  await salary.blur();
  await expect(page.locator("[data-snapshot]")).toContainText('"salary": 180');
  await expect(page.locator("[data-changes]")).toContainText('"status": "update"');
  const email = first.locator('[data-field="email"]');
  await email.fill("");
  await email.blur();
  await page.locator('[data-action="validate-selected"]').click();
  await expect(first.locator('[data-error-for="email"]')).not.toBeEmpty();
  await expect(page.locator("[data-issues]")).toContainText('"rule": "html"');

  const team = first.locator('[data-field="profile.team"]');
  await team.fill("");
  await team.blur();
  await page.locator('[data-action="validate-selected"]').click();
  await expect(page.locator("[data-issues]")).toContainText("This field is required.");
  await page.locator("[data-locale]").selectOption("ko-KR");
  await expect(page.locator("[data-status]")).toContainText("uncommitted edits were cleared");
  await expect(page.locator("[data-selection]")).toHaveText("No row selected");
  await page.locator('[data-action="select-first"]').click();
  await team.fill("");
  await team.blur();
  await page.locator('[data-action="validate-selected"]').click();
  await expect(page.locator("[data-issues]")).toContainText("필수 입력 항목이야.");
});

test("nested edits and Rows add, set, remove, revert, replace, changes stay observable", async ({ page }) => {
  const rows = page.locator("tbody tr:not([data-row-template])");
  const first = rows.first();
  await first.locator("[data-select-row]").click();
  await first.locator('[data-field="profile.team"]').fill("Support");
  await first.locator('[data-field="profile.team"]').blur();
  await first.locator("select").selectOption("2");
  await first.locator('[data-field="notes"]').fill("Review at noon");
  await first.locator('[data-field="notes"]').blur();
  await first.locator('input[type="checkbox"]').uncheck();
  await expect(page.locator("[data-snapshot]")).toContainText('"notes": "Review at noon"');
  await expect(page.locator("[data-snapshot]")).toContainText('"active": false');
  await expect(page.locator("[data-snapshot]")).toContainText('"chosen": 2');
  await expect(page.locator("[data-snapshot]")).toContainText('"team": "Support"');
  await page.locator("[data-new-salary]").fill("260");
  await page.locator('[data-action="set-salary"]').click();
  await expect(page.locator("[data-snapshot]")).toContainText('"salary": 260');
  await expect(page.locator("[data-event]")).toContainText("set RowId 1");
  await page.locator('[data-action="revert-selected"]').click();
  await expect(page.locator("[data-changes]")).toHaveText("[]");
  await expect(page.locator("[data-snapshot]")).toContainText('"salary": 150');
  await expect(page.locator("[data-snapshot]")).toContainText('"notes": "Morning handoff"');
  await expect(page.locator("[data-snapshot]")).toContainText('"active": true');

  await page.locator('[data-action="add"]').click();
  await expect(rows).toHaveCount(7);
  await expect(page.locator("[data-snapshot]")).toContainText('"status": "insert"');
  await page.locator('[data-action="remove"]').click();
  await expect(rows).toHaveCount(6);
  await expect(page.locator("[data-changes]")).toHaveText("[]");
  await page.locator('[data-action="select-first"]').click();
  await page.locator('[data-action="remove"]').click();
  await expect(page.locator("[data-changes]")).toContainText('"status": "delete"');
  await page.locator('[data-action="revert-all"]').click();
  await expect(rows).toHaveCount(6);
  await expect(page.locator("[data-changes]")).toHaveText("[]");
  await page.locator('[data-action="replace"]').click();
  await page.locator('[data-action="select-first"]').click();
  await expect(page.locator("[data-selection]")).toContainText("RowId 8: Ada");
  await expect(page.locator("[data-event]")).toContainText("replace");
});

test("required and unavailable choices validate; dispose and rebind restore the template", async ({ page }) => {
  const rows = page.locator("tbody tr:not([data-row-template])");
  await page.locator('[data-action="select-first"]').click();
  await page.locator('[data-action="missing-choice"]').click();
  await page.locator('[data-action="validate-selected"]').click();
  await expect(page.locator("[data-issues]")).toContainText('"rule": "select-option"');
  await page.locator('[data-action="revert-selected"]').click();
  await page.locator('[data-action="clear-choice"]').click();
  await page.locator('[data-action="validate-all"]').click();
  await expect(page.locator("[data-issues]")).toContainText('"rule": "html"');
  await expect(page.locator("[data-issues]")).toContainText('"field": "assignment.chosen"');
  await page.locator('[data-action="dispose"]').click();
  await expect(rows).toHaveCount(0);
  await expect(page.locator("tbody tr[data-row-template]")).toHaveCount(1);
  await expect(page.locator('[data-action="rebind"]')).toBeEnabled();
  await page.locator('[data-action="rebind"]').click();
  await expect(rows).toHaveCount(6);
  await expect(page.locator('[data-action="dispose"]')).toBeEnabled();
  await page.locator('[data-action="revert-all"]').click();
  await page.locator('[data-action="validate-all"]').click();
  await expect(page.locator("[data-issues]")).toHaveText("No issues.");
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
});
