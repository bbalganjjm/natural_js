import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

declare global {
  interface Window {
    interactionReveals: { id: string | null; block?: ScrollLogicalPosition }[];
    interactionDraft?: HTMLInputElement;
    interactionTable?: string;
  }
}

const mainRows = '[data-grid] tbody tr:not([data-row-template]):not([aria-hidden="true"])';
async function act(page: Page, action: string): Promise<void> {
  await page.locator('[data-action="' + action + '"]').evaluate((button: HTMLButtonElement) => button.click());
}
async function identity(page: Page) {
  return JSON.parse(await page.locator("[data-selection-state]").innerText());
}
async function probe(page: Page): Promise<void> {
  await page.locator("[data-row-resources]").check();
  await page.evaluate(() => {
    window.interactionReveals = [];
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (options) {
      if (this instanceof HTMLTableRowElement && this.closest("table")?.matches("[data-grid]")) {
        window.interactionReveals.push({ id: this.getAttribute("data-demo-before"),
          block: typeof options === "object" ? options.block : undefined });
      }
      original.call(this, options);
    };
  });
}
async function clearReveals(page: Page): Promise<void> {
  await page.evaluate(() => { window.interactionReveals = []; });
}
async function reveals(page: Page) { return page.evaluate(() => window.interactionReveals); }

test.beforeEach(async ({ page }) => {
  await page.goto("/m10/demo.html");
  await expect(page.locator(mainRows)).toHaveCount(6);
});

test("authored column chooser has native mixed state and recovers every hidden business column", async ({ page }) => {
  const all = page.locator("[data-column-all]");
  await expect(page.locator("[data-column-count]")).toHaveText("8 / 8");
  await page.locator('[data-visible-column="email"]').focus();
  await page.keyboard.press("Space");
  await expect(page.locator('[data-visible-column="email"]')).not.toBeChecked();
  await expect(page.locator('[data-visible-column="email"]')).toBeFocused();
  await expect(page.locator("[data-column-count]")).toHaveText("7 / 8");
  expect(await all.evaluate((input: HTMLInputElement) => input.indeterminate)).toBe(true);
  await all.check();
  await all.uncheck();
  await expect(page.locator("[data-column-count]")).toHaveText("0 / 8");
  await expect(page.locator(mainRows).first().locator("[data-column]")).toHaveCount(1);
  await expect(page.locator(mainRows).first().locator('[data-column="actions"]')).toBeVisible();
  await expect(page.locator('[data-grid] thead th[data-column="actions"]')).toBeVisible();
  await page.locator("[data-column-chooser] summary").click();
  await expect(page.locator("[data-column-all]")).not.toBeVisible();
  await page.locator('[data-action="show-columns"]').click();
  await expect(page.locator("[data-column-chooser] summary")).toBeFocused();
  await expect(all).toBeVisible();
  await all.check();
  await expect(page.locator("[data-column-count]")).toHaveText("8 / 8");
  await expect(page.locator(mainRows).first().locator("[data-column]")).toHaveCount(9);
  await page.locator("[data-column-choice]").selectOption("actions");
  await expect(page.locator("[data-column-hidden]")).toBeDisabled();
});

test("chooser retains widths, group order, raw drafts and selection while another store is unchanged", async ({ page }) => {
  await page.locator("[data-column-choice]").selectOption("email");
  await page.locator("[data-column-width]").fill("310");
  await act(page, "apply-columns");
  await act(page, "swap-groups");
  const initial = JSON.parse(await page.locator("[data-columns-state]").innerText());
  const row = page.locator(mainRows).first();
  await row.locator("[data-select-row]").click();
  await row.locator('[data-field="email"]').fill("not an address");
  await row.locator('[data-field="email"]').blur();
  const state = await identity(page);
  await page.evaluate(() => {
    window.interactionDraft = document.querySelector<HTMLInputElement>('[data-grid] tbody input[data-field="email"]')!;
  });
  const block = page.locator('[data-block-grid="two"]');
  const other = await block.innerHTML();
  await page.locator('[data-visible-column="email"]').uncheck();
  await expect(row.locator('[data-field="email"]')).toHaveCount(0);
  await page.locator('[data-visible-column="email"]').check();
  await expect(row.locator('[data-field="email"]')).toHaveValue("not an address");
  await expect(row.locator('[data-field="email"]')).toHaveAttribute("aria-invalid", "true");
  expect(await page.evaluate(() => window.interactionDraft === document.querySelector('[data-grid] tbody input[data-field="email"]'))).toBe(true);
  expect(await identity(page)).toEqual(state);
  const current = JSON.parse(await page.locator("[data-columns-state]").innerText());
  expect(current.map(({ key, width, hidden }: { key: string; width: number; hidden?: boolean }) => ({ key, width, hidden: !!hidden })))
    .toEqual(initial.map(({ key, width, hidden }: { key: string; width: number; hidden?: boolean }) => ({ key, width, hidden: !!hidden })));
  expect(await block.innerHTML()).toBe(other);
  await expect(page.locator("[data-changes]")).toHaveText("[]");
});

test("recovery-only rows retain shared CVC details and Undo without duplicate IDs or accessibility errors", async ({ page }) => {
  await page.locator("[data-column-all]").uncheck();
  const row = page.locator(mainRows).first();
  await row.locator('[data-row-action="detail-popup"]').click();
  const dialog = page.locator("[data-detail-dialog]");
  await expect(dialog).toBeVisible();
  await dialog.locator('[data-field="notes"]').fill("Edited while all data columns are hidden");
  await dialog.locator("[data-detail-close]").click();
  await expect(row.locator('[data-row-action="detail-popup"]')).toBeFocused();
  await expect(row.locator('[data-row-action="undo"]')).toBeEnabled();
  await row.locator('[data-row-action="undo"]').click();
  await expect(page.locator("[data-changes]")).toHaveText("[]");
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]).analyze();
  expect(axe.violations.map(violation => violation.id)).toEqual([]);
});

test("column actions restore exact authored table nodes and resynchronize after disposal and rebind", async ({ page }) => {
  await act(page, "dispose");
  await page.evaluate(() => { window.interactionTable = document.querySelector<HTMLTableElement>("[data-grid]")!.outerHTML; });
  await act(page, "rebind");
  await page.locator('[data-visible-column="salary"]').uncheck();
  await act(page, "dispose");
  expect(await page.locator("[data-grid]").evaluate(table => table.outerHTML)).toBe(await page.evaluate(() => window.interactionTable));
  await expect(page.locator("[data-column-all]")).toBeDisabled();
  await act(page, "rebind");
  await expect(page.locator("[data-column-count]")).toHaveText("8 / 8");
  await expect(page.locator('[data-visible-column="salary"]')).toBeChecked();
  await expect(page.locator(mainRows)).toHaveCount(6);
});

test("Team preview, Apply and Enter, app All and None expose the exact current choice count", async ({ page }) => {
  const search = page.locator('[data-filter-search="team"]');
  await search.fill("plat");
  await expect(page.locator(mainRows)).toHaveCount(6);
  await page.locator('[data-apply-filter="team"]').click();
  await expect(page.locator(mainRows)).toHaveCount(3);
  await expect(page.locator("[data-filter-count]")).toHaveText("1 / 2");
  await expect(search).toHaveValue("plat");
  await act(page, "no-team-values");
  await expect(page.locator(mainRows)).toHaveCount(0);
  await expect(page.locator("[data-filter-count]")).toHaveText("0 / 2");
  await act(page, "all-team-values");
  await expect(search).toHaveValue("");
  await expect(page.locator(mainRows)).toHaveCount(6);
  await expect(page.locator("[data-filter-count]")).toHaveText("2 / 2");
  await search.fill("support");
  await search.press("Enter");
  await expect(page.locator(mainRows)).toHaveCount(3);
  await expect(page.locator("[data-filter-count]")).toHaveText("1 / 2");
  await expect(page.locator("[data-filter-state]")).toContainText('"Support"');
  await search.fill("   ");
  await search.press("Enter");
  await expect(search).toHaveValue("");
  await expect(page.locator(mainRows)).toHaveCount(6);
});

test("another typed column filter retains enabled selected zero-count Team choices", async ({ page }) => {
  await page.locator(mainRows).nth(5).locator('[data-field="active"]').check();
  await page.locator('[data-filter-column="active"]').selectOption("false");
  await expect(page.locator(mainRows)).toHaveCount(1);
  const support = page.locator('[data-filter-column="team"] option').filter({ hasText: "Support (0)" });
  await expect(support).toHaveCount(1);
  await expect(support).toBeEnabled();
  expect(await support.evaluate((option: HTMLOptionElement) => option.selected)).toBe(true);
  await page.locator('[data-filter-search="team"]').fill("support");
  await page.locator('[data-apply-filter="team"]').click();
  await expect(page.locator(mainRows)).toHaveCount(0);
  await expect(page.locator('[data-filter-column="team"] option:checked')).toHaveText("Support (0)");
  await page.locator('[data-clear-filter="active"]').click();
  await expect(page.locator(mainRows)).toHaveCount(3);
});

test("toggle-policy controls bind native single and multiple activation while checks stay independent", async ({ page }) => {
  await page.locator("[data-toggle-selection]").check();
  const row = page.locator(mainRows);
  await row.first().locator("[data-select-row]").focus();
  await page.keyboard.press("Space");
  expect((await identity(page)).active).toBe(1);
  await page.keyboard.press("Enter");
  expect((await identity(page)).active).toBeNull();
  await page.locator("[data-selection-mode]").selectOption("multiple");
  await row.nth(2).locator("[data-check-row]").check();
  await row.nth(0).locator("[data-select-row]").click();
  await row.nth(1).locator("[data-select-row]").click();
  await row.nth(0).locator("[data-select-row]").click();
  expect(await identity(page)).toMatchObject({ active: null, selectedIds: [2], checkedIds: [3] });
  await page.locator("[data-veto-selection]").check();
  await row.nth(3).locator("[data-select-row]").click();
  expect(await identity(page)).toMatchObject({ active: null, selectedIds: [2], checkedIds: [3] });
});

test("application selection and checks reveal the last requested ID only after the complete state commits", async ({ page }) => {
  await probe(page);
  await page.locator("[data-action-scroll]").check();
  await act(page, "select-first");
  expect(await reveals(page)).toEqual([{ id: "1", block: "center" }]);
  await page.locator(mainRows).nth(1).locator("[data-select-row]").click();
  await clearReveals(page);
  await page.locator("[data-veto-active]").check();
  await act(page, "select-first");
  expect(await reveals(page)).toEqual([]);
  expect((await identity(page)).active).toBe(2);
  await page.locator("[data-veto-active]").uncheck();
  await page.locator("[data-selection-mode]").selectOption("multiple");
  await act(page, "select-first-two");
  expect(await reveals(page)).toEqual([{ id: "2", block: "center" }]);
  await clearReveals(page);
  await act(page, "check-selected");
  expect(await reveals(page)).toEqual([{ id: "2", block: "center" }]);
  await act(page, "clear-checks");
  await clearReveals(page);
  await page.locator("[data-veto-checks]").check();
  await act(page, "check-selected");
  expect(await reveals(page)).toEqual([]);
  expect((await identity(page)).checkedIds).toEqual([]);
  await page.locator("[data-veto-checks]").uncheck();
  await page.locator("[data-sort]").selectOption("name-desc");
  expect(await page.locator(mainRows).evaluateAll(elements => elements.map(row => row.getAttribute("data-demo-before"))))
    .toEqual(["4", "3", "6", "2", "5", "1"]);
  await act(page, "check-all");
  expect(await reveals(page)).toEqual([{ id: "1", block: "center" }]);
  expect((await identity(page)).checkedIds).toEqual([1, 2, 3, 4, 5, 6]);
});

test("action-scroll opt-out and current-page guards preserve filtering and paging", async ({ page }) => {
  await probe(page);
  await act(page, "select-first");
  expect(await reveals(page)).toEqual([]);
  await page.locator("[data-action-scroll]").check();
  await page.locator("[data-size]").selectOption("2");
  await act(page, "next");
  await act(page, "select-first");
  expect(await reveals(page)).toEqual([]);
  await expect(page.locator("[data-page-state]")).toContainText("Page 2 of 3");
  await page.locator("[data-filter]").selectOption("Support");
  await act(page, "select-first");
  expect(await reveals(page)).toEqual([]);
  await expect(page.locator("[data-filter]")).toHaveValue("Support");
  await expect(page.locator("[data-size]")).toHaveValue("2");
});

test("front, indexed and end insertion use start, center and end after successful selection", async ({ page }) => {
  await probe(page);
  await page.locator("[data-action-scroll]").check();
  await act(page, "add");
  await act(page, "add-first");
  await act(page, "insert-before");
  expect(await reveals(page)).toEqual([{ id: "7", block: "end" }, { id: "8", block: "start" }, { id: "9", block: "center" }]);
  await clearReveals(page);
  await page.locator("[data-veto-active]").check();
  await act(page, "add");
  expect(await reveals(page)).toEqual([]);
  expect((await identity(page)).active).toBe(9);
  expect(JSON.parse(await page.locator("[data-changes]").innerText()).filter((row: { status: string }) => row.status === "insert")).toHaveLength(4);
});

test("append skips an empty prior store and reveals only the last newly loaded current-page row", async ({ page }) => {
  await probe(page);
  await page.locator("[data-action-scroll]").check();
  await page.locator("[data-dataset]").selectOption("0");
  await act(page, "append");
  expect(await reveals(page)).toEqual([]);
  await expect(page.locator(mainRows)).toHaveCount(2);
  await act(page, "append");
  expect(await reveals(page)).toEqual([{ id: "10", block: "end" }]);
  await clearReveals(page);
  await page.locator("[data-filter]").selectOption("Platform");
  await act(page, "append");
  expect(await reveals(page)).toEqual([{ id: "11", block: "end" }]);
  await clearReveals(page);
  await page.locator("[data-size]").selectOption("2");
  await act(page, "append");
  expect(await reveals(page)).toEqual([]);
  await expect(page.locator("[data-page-state]")).toContainText("Page 1 of 2");
  await expect(page.locator("[data-changes]")).toHaveText("[]");
});

test("last-invalid reveal follows visual page order and preserves focus with first-invalid core reveal disabled", async ({ page }) => {
  await probe(page);
  await page.locator("[data-reveal-invalid]").check();
  await page.locator("[data-last-invalid]").check();
  await page.locator("[data-validate-on]").selectOption("manual");
  await page.locator(mainRows).first().locator('[data-field="salary"]').fill("50");
  await page.locator(mainRows).nth(5).locator('[data-field="salary"]').fill("50");
  await page.locator("[data-sort]").selectOption("name-desc");
  const focused = page.locator('[data-grid] tr[data-demo-before="6"] [data-field="salary"]');
  await focused.evaluate((input: HTMLInputElement) => input.focus({ preventScroll: true }));
  await clearReveals(page);
  await act(page, "validate-all");
  expect(await reveals(page)).toEqual([{ id: "1", block: "center" }]);
  await expect(focused).toBeFocused();
  await expect(page.locator("[data-changes]")).toHaveText("[]");
  await page.locator("[data-size]").selectOption("2");
  await clearReveals(page);
  await act(page, "validate-all");
  expect(await reveals(page)).toEqual([]);
  await expect(page.locator("[data-page-state]")).toContainText("Page 1 of 3");
});

test("application end insertion uses the existing bounded viewport without affecting independent row-block stores", async ({ page }) => {
  await page.locator("[data-viewport]").check();
  await page.locator("[data-dataset]").selectOption("5000");
  await page.locator("[data-action-scroll]").check();
  const block = page.locator('[data-block-grid="two"]');
  const other = await block.innerHTML();
  await act(page, "add");
  await expect.poll(() => page.locator("[data-scroll-root]").evaluate(root => root.scrollTop)).toBeGreaterThan(100_000);
  await expect.poll(() => page.locator(mainRows).count()).toBeLessThan(30);
  const selected = page.locator('[data-grid] [data-select-row][aria-pressed="true"]');
  await expect(selected).toHaveCount(1);
  expect(await block.innerHTML()).toBe(other);
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
});
