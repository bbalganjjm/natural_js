import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/m10/demo.html");
  await expect(page.locator("[data-grid] tbody tr:not([data-row-template])")).toHaveCount(6);
});

test("authored table binds raw nested choices, formatter, and accessible labels", async ({ page }) => {
  const rows = page.locator("[data-grid] tbody tr:not([data-row-template])");
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
  const rows = page.locator("[data-grid] tbody tr:not([data-row-template])");
  await page.locator('[data-action="select-first"]').click();
  await page.locator("[data-sort]").selectOption("name-desc");
  await expect(page.locator('[data-grid] thead th[aria-sort="descending"]')).toContainText("Employee");
  await expect(rows.first()).toContainText("MARGARET");
  await page.locator("[data-sort]").selectOption("salary-desc");
  await expect(page.locator('[data-grid] thead th[aria-sort="descending"]')).toContainText("Salary");
  await expect(page.locator('[data-grid] thead th').first()).toHaveAttribute("aria-sort", "none");
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
  const rows = page.locator("[data-grid] tbody tr:not([data-row-template])");
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

test("check and validation policy controls rebind working Grid options", async ({ page }) => {
  const rows = page.locator("[data-grid] tbody tr:not([data-row-template])");
  const checks = rows.locator("[data-check-row]");
  await checks.nth(0).check();
  await checks.nth(1).check();
  await expect(rows.locator("[data-check-row]:checked")).toHaveCount(2);
  await page.locator("[data-check-mode]").selectOption("single");
  await expect(rows.locator("[data-check-row]:checked")).toHaveCount(0);
  await expect(page.locator("[data-check-all]")).toBeDisabled();
  await checks.nth(0).check();
  await checks.nth(1).check();
  await expect(checks.nth(0)).not.toBeChecked();
  await expect(checks.nth(1)).toBeChecked();
  await page.locator("[data-check-mode]").selectOption("multiple");
  await expect(page.locator("[data-check-all]")).toBeEnabled();

  await page.locator("[data-validate-on]").selectOption("blur");
  await page.locator('[data-action="select-first"]').click();
  const salary = rows.first().locator('[data-field="salary"]');
  await salary.fill("190");
  await salary.dispatchEvent("change");
  await expect(page.locator("[data-snapshot]")).toContainText('"salary": 150');
  await salary.blur();
  await expect(page.locator("[data-snapshot]")).toContainText('"salary": 190');

  await page.locator("[data-validate-on]").selectOption("manual");
  await page.locator("[data-reveal-invalid]").check();
  await page.locator('[data-action="select-first"]').click();
  await salary.fill("210");
  await salary.blur();
  await expect(page.locator("[data-snapshot]")).toContainText('"salary": 190');
  await page.locator('[data-action="validate-selected"]').click();
  await expect(page.locator("[data-snapshot]")).toContainText('"salary": 210');
  await salary.fill("50");
  await salary.blur();
  await expect(salary).not.toHaveAttribute("aria-invalid", "true");
  await page.locator('[data-action="validate-selected"]').click();
  await expect(salary).toBeFocused();
  await expect(salary).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("[data-issues]")).toContainText("Salary must be at least 100.");
  await expect(page.locator("[data-snapshot]")).toContainText('"salary": 210');
});

test("parsing, HTML constraints, and application validation retain invalid drafts", async ({ page }) => {
  const first = page.locator("[data-grid] tbody tr:not([data-row-template])").first();
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
  const rows = page.locator("[data-grid] tbody tr:not([data-row-template])");
  const first = rows.first();
  await first.locator("[data-select-row]").click();
  await first.locator('[data-field="profile.team"]').fill("Support");
  await first.locator('[data-field="profile.team"]').blur();
  await first.locator("select").selectOption("2");
  await first.locator('[data-field="notes"]').fill("Review at noon");
  await first.locator('[data-field="notes"]').blur();
  await first.locator('[data-field="active"]').uncheck();
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
  const rows = page.locator("[data-grid] tbody tr:not([data-row-template])");
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
  await expect(page.locator("[data-grid] tbody tr[data-row-template]")).toHaveCount(1);
  await expect(page.locator('[data-action="rebind"]')).toBeEnabled();
  await page.locator('[data-action="rebind"]').click();
  await expect(rows).toHaveCount(6);
  await expect(page.locator('[data-action="dispose"]')).toBeEnabled();
  const checkAll = page.locator("[data-check-all]");
  await expect(checkAll).toBeEnabled();
  await checkAll.check();
  await expect(rows.locator("[data-check-row]:checked")).toHaveCount(6);
  await checkAll.uncheck();
  await page.locator('[data-action="revert-all"]').click();
  await page.locator('[data-action="validate-all"]').click();
  await expect(page.locator("[data-issues]")).toHaveText("No issues.");
  await page.locator('[data-action="empty-team-filter"]').click();
  await expect(rows).toHaveCount(0);
  await expect(checkAll).toBeDisabled();
  await page.locator('[data-action="dispose"]').click();
  await page.locator('[data-action="rebind"]').click();
  await expect(rows).toHaveCount(6);
  await expect(checkAll).toBeEnabled();
  await checkAll.check();
  await expect(rows.locator("[data-check-row]:checked")).toHaveCount(6);
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
});

test("bulk paste reports atomic rejection and applies typed cells with protected positions", async ({ page }) => {
  const rows = page.locator("[data-grid] tbody tr:not([data-row-template])");
  await page.locator('[data-action="select-first"]').click();
  const sample = await page.locator("[data-paste-text]").inputValue();
  await page.locator("[data-paste-text]").fill(sample.replace(/225$/, "50"));
  await page.locator('[data-action="paste"]').click();
  await expect(page.locator("[data-paste-status]")).toContainText("Paste rejected");
  await expect(page.locator("[data-issues]")).toContainText('"field": "salary"');
  await expect(page.locator("[data-changes]")).toHaveText("[]");
  await expect(rows.first().locator('[data-field="email"]')).toHaveValue("employee1@example.com");
  await expect(rows.nth(1).locator('[data-field="salary"]')).toHaveValue("175");

  await page.locator("[data-paste-text]").fill(sample);
  await page.locator('[data-action="paste"]').click();
  await expect(page.locator("[data-paste-status]")).toContainText("Paste accepted");
  await expect(page.locator("[data-event]")).toHaveText("setMany RowIds 1, 2, changed true");
  await expect(rows.first().locator('[data-field="email"]')).toHaveValue("ada.paste@example.com");
  await expect(rows.first().locator('[data-field="phone"]')).toHaveValue("+1 555 0101");
  await expect(rows.first().locator("select")).toHaveValue("2");
  await expect(rows.nth(1).locator("select")).toHaveValue("4");
  await expect(rows.nth(1).locator('[data-field="active"]')).not.toBeChecked();
  await expect(rows.first().locator('[data-field="notes"]')).toHaveValue("First line\nSecond line");
  await expect(page.locator("[data-snapshot]")).toContainText('"chosen": 2');

  const native = await rows.first().locator('[data-field="salary"]').evaluate(element => {
    element.focus();
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "220\n250");
    // Firefox discards DataTransfer passed to an untrusted ClipboardEvent constructor.
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: clipboardData });
    element.dispatchEvent(event);
    return { prevented: event.defaultPrevented, focused: document.activeElement === element };
  });
  expect(native).toEqual({ prevented: true, focused: true });
  await expect(rows.first().locator('[data-field="salary"]')).toHaveValue("220");
  await expect(rows.nth(1).locator('[data-field="salary"]')).toHaveValue("250");
  await expect(page.locator("[data-paste-status]")).toContainText("Paste accepted");
});

test("viewport mode bounds a 5,000-row dataset and reveals a row without selecting it", async ({ page }) => {
  await page.locator("[data-viewport]").check();
  await page.locator("[data-dataset]").selectOption("5000");
  const rows = page.locator('[data-grid] tbody tr:not([data-row-template]):not([aria-hidden="true"])');
  await expect(page.locator("[data-viewport-state]")).toContainText("5,000 store rows");
  await expect(page.locator("[data-viewport-state]")).toContainText("viewport on");
  expect(await rows.count()).toBeLessThan(80);
  await expect(page.locator("[data-grid]")).toHaveAttribute("aria-rowcount", "5002");
  await page.locator("[data-reveal-row]").fill("2500");
  await page.locator('[data-action="reveal"]').click();
  await expect.poll(() => rows.locator('[data-field="name"]').allTextContents()).toContain("NEW EMPLOYEE 2500");
  await expect(page.locator("[data-selection]")).toHaveText("No row selected");
  await expect(page.locator("[data-status]")).toContainText("selection unchanged");
  expect(await rows.count()).toBeLessThan(80);
  await page.locator('[data-action="check-all"]').click();
  await expect(page.locator("[data-selection-state]")).toContainText('"count": 5000');
  await page.locator('[data-action="dispose"]').click();
  await expect(rows).toHaveCount(0);
  await expect(page.locator("[data-grid] tbody tr[data-row-template]")).toHaveCount(1);
  await page.locator("[data-dataset]").selectOption("6");
  await page.locator("[data-viewport]").uncheck();
  await expect(rows).toHaveCount(6);
});

test("ordered row controls insert and copy by identity while value revert keeps store order", async ({ page }) => {
  const rows = page.locator('[data-grid] tbody tr:not([data-row-template]):not([aria-hidden="true"])');
  const names = rows.locator('[data-field="name"]');
  await page.locator('[data-action="select-first"]').click();
  await page.locator('[data-action="move-end"]').click();
  await expect(names.last()).toHaveText("ADA");
  await expect(page.locator('[data-event]')).toContainText("move RowId 1");
  await page.locator('[data-action="move-first"]').click();
  await expect(names.first()).toHaveText("ADA");
  await page.locator('[data-action="move-down"]').click();
  await expect(names.nth(1)).toHaveText("ADA");
  await page.locator('[data-action="move-up"]').click();
  await expect(names.first()).toHaveText("ADA");
  await page.locator('[data-action="copy-before"]').click();
  await expect(rows).toHaveCount(7);
  await expect(names.nth(1)).toHaveText("ADA");
  await expect(page.locator('[data-selection]')).toContainText("RowId 7");
  await rows.first().locator('[data-field="email"]').fill("copy@example.com");
  await rows.first().locator('[data-field="email"]').dispatchEvent("change");
  await expect(rows.nth(1).locator('[data-field="email"]')).toHaveValue("employee1@example.com");
  await page.locator('[data-action="insert-before"]').click();
  await expect(rows).toHaveCount(8);
  await expect(page.locator('[data-selection]')).toContainText("RowId 8");
  await page.locator('[data-action="copy-end"]').click();
  await expect(rows).toHaveCount(9);
  await expect(page.locator('[data-selection]')).toContainText("RowId 9");
  await rows.nth(2).locator('[data-select-row]').click();
  await expect(page.locator('[data-selection]')).toContainText("RowId 1");
  await page.locator('[data-action="move-end"]').click();
  await page.locator('[data-action="revert-all"]').click();
  await expect(rows).toHaveCount(6);
  await expect(names.first()).toHaveText("GRACE");
  await expect(names.last()).toHaveText("ADA");
  await expect(page.locator('[data-status]')).toContainText("row order kept");
});

test("two authored row-block layouts share edits, nested choices and hierarchical merge keys", async ({ page }) => {
  const two = page.locator('[data-block-grid="two"]');
  const three = page.locator('[data-block-grid="three"]');
  await expect(two.locator("tbody tr")).toHaveCount(8);
  await expect(three.locator("tbody tr")).toHaveCount(12);
  await expect(two.locator('[data-merge="department"]').first()).toHaveAttribute("rowspan", "6");
  await expect(three.locator('[data-merge="department"]').first()).toHaveAttribute("rowspan", "9");
  await expect(two.locator('[data-merge="team"]').first()).toHaveAttribute("rowspan", "4");
  await expect(three.locator('[data-merge="team"]').first()).toHaveAttribute("rowspan", "6");

  await two.locator('[data-field="notes"]').first().fill("Shared across authored layouts");
  await two.locator('[data-field="notes"]').first().blur();
  await expect(three.locator('[data-field="notes"]').first()).toHaveValue("Shared across authored layouts");
  await three.locator('[data-field="name"]').first().fill("Ada Lovelace");
  await three.locator('[data-field="name"]').first().blur();
  await expect(two.locator('[data-field="name"]').first()).toHaveValue("Ada Lovelace");
  await three.locator('select[data-field="assignment.chosen"]').first().selectOption("2");
  await expect(two.locator('select[data-field="assignment.chosen"]').first()).toHaveValue("2");

  await two.locator("[data-select-row]").nth(1).click();
  await page.locator("[data-block-department]").fill("Research");
  await page.locator('[data-block-action="keys"]').click();
  await expect(two.locator('[data-merge="department"]').first()).toHaveAttribute("rowspan", "2");
  await expect(three.locator('[data-merge="department"]').first()).toHaveAttribute("rowspan", "3");
  await expect(two.locator('[data-merge="department"]:visible')).toHaveCount(4);
  await expect(three.locator('[data-merge="team"]:visible')).toHaveCount(4);
  await page.locator("[data-block-department]").fill("Engineering");
  await page.locator('[data-block-action="keys"]').click();
  await expect(two.locator('[data-merge="department"]').first()).toHaveAttribute("rowspan", "6");
  await expect(three.locator('[data-merge="team"]:visible')).toHaveCount(3);
  await expect(page.locator("[data-grid] tbody tr")).toHaveCount(6);
  await expect(page.locator("[data-selection]")).toHaveText("No row selected");
});

test("row-block store controls move and copy whole records independently of the employee demo", async ({ page }) => {
  const two = page.locator('[data-block-grid="two"]');
  const three = page.locator('[data-block-grid="three"]');
  const codes = two.locator('[data-field="code"]');
  await two.locator("[data-select-row]").first().click();
  await page.locator('[data-block-action="last"]').click();
  await expect(codes).toHaveText(["R2", "R3", "R4", "R1"]);
  await expect(three.locator('[data-field="code"]')).toHaveText(["R2", "R3", "R4", "R1"]);
  await page.locator('[data-block-action="first"]').click();
  await expect(codes.first()).toHaveText("R1");
  await page.locator('[data-block-action="copy"]').click();
  await expect(codes).toHaveText(["R1", "R2", "R3", "R4", "R5"]);
  await expect(two.locator("tbody tr")).toHaveCount(10);
  await expect(three.locator("tbody tr")).toHaveCount(15);
  await two.locator('[data-field="notes"]').last().fill("Copy only");
  await two.locator('[data-field="notes"]').last().blur();
  await expect(three.locator('[data-field="notes"]').last()).toHaveValue("Copy only");
  await expect(two.locator('[data-field="notes"]').first()).toHaveValue("Morning handoff");
  await three.locator("[data-row-action]").last().click();
  await expect(page.locator("[data-block-status]")).toContainText("Inspect RowId 5: Ada, Copy only");
  await page.locator('[data-block-action="reset"]').click();
  await expect(codes).toHaveText(["R1", "R2", "R3", "R4"]);
  await expect(two.locator("tbody tr")).toHaveCount(8);
  await expect(three.locator("tbody tr")).toHaveCount(12);
  await expect(page.locator('[data-block-action="copy"]')).toBeDisabled();
  await expect(page.locator("[data-block-state]")).toContainText('"selected": null');
  await expect(page.locator("[data-grid] tbody tr")).toHaveCount(6);
  await expect(page.locator("[data-changes]")).toHaveText("[]");
});

test("authored row blocks share grouped controls, typed multiple choices and native values", async ({ page }) => {
  const two = page.locator('[data-block-grid="two"]');
  const three = page.locator('[data-block-grid="three"]');
  await two.locator('[data-field="mode"][value="office"]').first().check();
  await expect(three.locator('[data-field="mode"][value="office"]').first()).toBeChecked();
  await two.locator('[data-field="channels"][value="chat"]').first().check();
  await two.locator('[data-field="channels"][value="email"]').first().uncheck();
  await expect(three.locator('[data-field="channels"][value="chat"]').first()).toBeChecked();
  await expect(three.locator('[data-field="channels"][value="email"]').first()).not.toBeChecked();
  await three.locator('[data-field="assignment.selected"]').first().selectOption(["1", "2"]);
  await expect(two.locator('[data-field="assignment.selected"]').first()).toHaveValues(["1", "2"]);
  await two.locator('[data-field="date"]').first().fill("2026-11-01");
  await two.locator('[data-field="date"]').first().blur();
  await expect(three.locator('[data-field="date"]').first()).toHaveValue("2026-11-01");
  await three.locator('[data-field="hours"]').first().focus();
  await page.keyboard.press("ArrowLeft");
  await expect(two.locator('[data-field="hours"]').first()).toHaveValue("7");
  const state = JSON.parse(await page.locator("[data-block-state]").innerText());
  expect(state.records[0].value).toMatchObject({
    mode: "office", channels: ["chat"], assignment: { selected: [1, 2] }, date: "2026-11-01", hours: 7
  });
  expect(state.records[1].value.mode).toBe("office");
  await expect(two.locator('[data-field="team"] strong').first()).toHaveText("Platform");
  const image = two.locator('img[data-field="avatar"]').first();
  await expect(image).toHaveAttribute("src", /^data:image\/svg\+xml,/);
  await expect(image).toHaveAttribute("alt", "Employee avatar");
  await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBe(32);
  const radioNames = await page.locator('[data-block-grid] input[type="radio"]').evaluateAll(elements =>
    elements.map(element => (element as HTMLInputElement).name));
  expect(radioNames.every(Boolean)).toBe(true);
  expect(new Set(radioNames).size).toBe(8);
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  await expect(page.locator("[data-changes]")).toHaveText("[]");
});
