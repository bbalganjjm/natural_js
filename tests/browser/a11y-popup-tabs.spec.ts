import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const textSpacing = `
  * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }
  p { margin-bottom: 2em !important; }
`;

async function idReferences(page: Page) {
  return page.evaluate(() => {
    const targets = new Map<string, Element[]>();
    for (const element of document.querySelectorAll("[id]")) {
      const matches = targets.get(element.id) ?? [];
      matches.push(element);
      targets.set(element.id, matches);
    }
    const duplicateIds = [...targets].filter(([, elements]) => elements.length > 1)
      .map(([id]) => id);
    const dangling: string[] = [];
    const attributes = [
      "aria-labelledby", "aria-describedby", "aria-errormessage", "aria-controls",
      "aria-owns", "aria-activedescendant", "aria-details", "for", "headers"
    ];
    for (const element of document.querySelectorAll(
      "[aria-labelledby], [aria-describedby], [aria-errormessage], [aria-controls], " +
      "[aria-owns], [aria-activedescendant], [aria-details], [for], [headers]"
    )) {
      const screen = element.closest('[data-screen], [data-page="employees"]');
      for (const attribute of attributes) {
        const value = element.getAttribute(attribute);
        if (!value) continue;
        for (const id of value.trim().split(/\s+/)) {
          const found = targets.get(id) ?? [];
          if (found.length !== 1 ||
              screen && found[0]?.closest('[data-screen], [data-page="employees"]') !== screen) {
            dangling.push(`${attribute}=${id}`);
          }
        }
      }
    }
    return { duplicateIds, dangling };
  });
}

async function wcagViolations(page: Page) {
  const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
  const result = await new AxeBuilder({ page }).withTags(tags).analyze();
  return result.violations.map(violation => ({
    id: violation.id,
    nodes: violation.nodes.map(node => node.target)
  }));
}

async function focusedVisible(dialog: Locator): Promise<boolean> {
  return dialog.evaluate(element => {
    const focused = element.ownerDocument.activeElement;
    if (!(focused instanceof HTMLElement) || !element.contains(focused)) return false;
    const control = focused.getBoundingClientRect();
    const bounds = element.getBoundingClientRect();
    return control.top >= Math.max(0, bounds.top) &&
      control.bottom <= Math.min(window.innerHeight, bounds.bottom);
  });
}

test("native Popup keeps keyboard focus inside and Escape restores the opener", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto("/m7/side.html");
  await page.addStyleTag({ content: textSpacing });
  expect(await page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(320);
  const screen = page.locator('[data-screen="1"]');
  const opener = screen.locator("[data-open-picker]");
  const dialog = screen.locator("[data-picker-dialog]");

  await opener.focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  await expect.poll(() => focusedVisible(dialog)).toBe(true);

  const cancel = dialog.getByRole("button", { name: "Cancel" });
  const first = dialog.getByRole("button", { name: "Choose Ada" });
  await cancel.focus();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  expect(await focusedVisible(dialog)).toBe(true);
  await first.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(cancel).toBeFocused();
  expect(await focusedVisible(dialog)).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect(screen.locator("[data-popup-output]")).toHaveText("Popup canceled");
});

test("two MDI workspaces keep unique IDs and resolvable ARIA references", async ({ page }) => {
  await page.goto("/m7/side.html");
  await page.locator("[data-add-screen]").click();
  for (const screen of ["1", "2"]) {
    await page.locator(`[data-screen="${screen}"] [data-tab="preview"]`).click();
  }
  await page.locator('[data-screen="2"] [data-open-picker]').click();
  await expect(page.locator('[data-screen="2"] [data-picker-dialog]')).toBeVisible();

  const links = await idReferences(page);
  expect(links).toEqual({ duplicateIds: [], dangling: [] });
});

test("vertical Tabs skip disabled buttons and keep manual activation", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { bindTabs, mountPage } = await import("/m7-fixture.ts");
    const root = document.createElement("section");
    root.dataset.tabs = "";
    root.innerHTML = `
      <div role="tablist" aria-label="Vertical tabs" aria-orientation="vertical">
        <button type="button" role="tab" data-tab="a">A</button>
        <button type="button" role="tab" data-tab="b" disabled>B</button>
        <button type="button" role="tab" data-tab="c">C</button>
      </div>
      <section role="tabpanel" data-panel="a" hidden></section>
      <section role="tabpanel" data-panel="b" hidden></section>
      <section role="tabpanel" data-panel="c" hidden></section>
      <p role="alert" data-tab-error hidden></p>`;
    document.body.append(root);
    const definition = { view: () => document.createElement("article"), controller: () => ({}) };
    const tabs = bindTabs(root, { initial: "a", pages: {
      a: host => mountPage(host, definition),
      b: host => mountPage(host, definition),
      c: host => mountPage(host, definition)
    } });
    await tabs.ready;
    Object.assign(window, { a11yTabs: tabs });
  });
  const root = page.locator("[data-tabs]");
  const first = root.locator('[data-tab="a"]');
  const last = root.locator('[data-tab="c"]');
  await first.focus();
  await page.keyboard.press("ArrowDown");
  await expect(last).toBeFocused();
  await expect(first).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  await expect(first).toBeFocused();
  await page.keyboard.press("End");
  await expect(last).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(last).toHaveAttribute("aria-selected", "true");
  await expect(last).toHaveAttribute("aria-controls", /.+/);
  await page.evaluate(async () => {
    const tabs = (window as unknown as { a11yTabs: { dispose(): Promise<void> } }).a11yTabs;
    await tabs.dispose();
    document.querySelector("[data-tabs]")?.remove();
  });
});

for (const layout of ["side", "stack"] as const) {
  test(`${layout} MDI and open Popup pass automated WCAG-tagged checks`, async ({ page }) => {
    await page.goto(`/m7/${layout}.html`);
    await page.locator("[data-add-screen]").click();
    for (const screen of ["1", "2"]) {
      await page.locator(`[data-screen="${screen}"] [data-tab="preview"]`).click();
    }
    expect(await wcagViolations(page)).toEqual([]);
    await page.locator('[data-screen="2"] [data-open-picker]').click();
    await expect(page.locator('[data-screen="2"] [data-picker-dialog]')).toBeVisible();
    expect(await wcagViolations(page)).toEqual([]);
  });
}


for (const layout of ["side", "stack"] as const) {
  test(`${layout} Form, Grid, List, and Pagination pass automated WCAG checks in two MDI screens`,
    async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`/m4/${layout}.html`);
      await page.locator('[data-action="open"]').click();
      const screens = page.locator('[data-page="employees"]');
      await expect(screens).toHaveCount(2);
      await expect(screens.first().locator("tbody tr")).toHaveCount(3);
      await expect(screens.nth(1).locator("tbody tr")).toHaveCount(3);
      expect(await idReferences(page)).toEqual({ duplicateIds: [], dangling: [] });
      expect(await wcagViolations(page)).toEqual([]);

      for (const screen of [screens.first(), screens.nth(1)]) {
        await screen.locator('tbody [data-select-row]').first().click();
        const email = screen.locator('[data-role="detail"] [data-field="email"]');
        await email.fill("bad");
        await screen.locator('[data-action="save"]').click();
        await expect(email).toHaveAttribute("aria-invalid", "true");
      }
      expect(await idReferences(page)).toEqual({ duplicateIds: [], dangling: [] });
      expect(await wcagViolations(page)).toEqual([]);
      expect(errors).toEqual([]);
    });

  test(`${layout} data UI remains keyboard-operable at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(`/m4/${layout}.html`);
    await page.addStyleTag({ content: textSpacing });
    const screen = page.locator('[data-page="employees"]');
    await expect(screen.locator("tbody tr")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(320);

    const search = screen.locator('[data-role="search"] [data-field="query"]');
    const submit = screen.locator('[data-role="search"] button[type="submit"]');
    await search.fill("Ada");
    await search.focus();
    await page.keyboard.press("Tab");
    await expect(submit).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(screen.locator("tbody tr")).toHaveCount(1);
    await search.fill("");
    await search.press("Enter");
    await expect(screen.locator("tbody tr")).toHaveCount(3);

    const row = screen.locator("tbody [data-select-row]").first();
    await row.focus();
    await expect(row).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(screen.locator('[data-role="selected"]')).toContainText("Ada");

    const name = screen.locator('[data-role="detail"] [data-field="name"]');
    const email = screen.locator('[data-role="detail"] [data-field="email"]');
    await name.focus();
    await page.keyboard.press("Tab");
    await expect(email).toBeFocused();

    const list = screen.locator('[data-role="list"] [data-select-row]').first();
    await list.focus();
    await page.keyboard.press("Enter");
    await expect(screen.locator('[data-role="selected"]')).toContainText("Ada");

    await screen.locator('[data-role="page-size"]').selectOption("2");
    const next = screen.locator('[data-role="pager"] [data-page-next]');
    await next.focus();
    await page.keyboard.press("Enter");
    await expect(screen.locator('[data-role="pager"] [data-page-status]')).toHaveText("Page 2 of 2");
    await expect(screen.locator("tbody tr")).toHaveCount(1);
    await expect(screen.locator('[data-role="list"] > li:not([data-empty])')).toHaveCount(1);
  });
}
