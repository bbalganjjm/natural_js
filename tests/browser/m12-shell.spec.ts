import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const layout of ["side", "stack"] as const) {
  test(`${layout} shares one editor definition and Rows while retaining and guarding documents`, async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", error => errors.push(error));
    await page.goto(`/m12/${layout}.html`);
    const first = page.locator('[data-screen="1"]');
    const second = page.locator('[data-screen="2"]');
    await expect(first).toHaveAttribute("data-lifecycle", "active");
    await expect(second).toHaveAttribute("data-lifecycle", "active");
    await expect(first.locator("[data-document-empty]")).toBeVisible();
    await first.locator('[data-open-document="ada"]').first().click();
    const ada = first.locator('[data-document-panels] [data-editor][data-key="ada"]');
    await expect(ada).toHaveAttribute("data-lifecycle", "active");
    const original = await ada.getAttribute("data-controller");
    await first.locator('[data-open-document="lin"]').click();
    const lin = first.locator('[data-document-panels] [data-editor][data-key="lin"]');
    await expect(lin).toHaveAttribute("data-lifecycle", "active");
    await expect(ada).toHaveAttribute("data-lifecycle", "inactive");
    const adaTab = first.getByRole("tab", { name: "Ada", exact: true });
    const linTab = first.getByRole("tab", { name: "Lin", exact: true });
    await linTab.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(adaTab).toBeFocused();
    await expect(linTab).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(ada).toHaveAttribute("data-lifecycle", "active");
    await expect(ada).toHaveAttribute("data-controller", original!);
    await first.locator('[data-open-document="ada"]').first().click();
    await expect(ada).toHaveAttribute("data-controller", original!);
    await expect(first.locator("[data-history] > li").filter({ hasText: /^ada document #\d+: init$/ })).toHaveCount(1);

    await ada.locator('input[data-field="profile.name"]').fill("Ada Edited");
    const mainName = first.locator('[data-main-host] input[data-field="profile.name"]');
    await expect(mainName).toHaveValue("Ada Edited");
    await expect(second.locator('[data-main-host] input[data-field="profile.name"]')).toHaveValue("Ada");
    const opener = first.locator("[data-open-popup]");
    await opener.click();
    const dialog = first.locator("[data-editor-dialog]");
    await expect(dialog.locator('[data-editor][data-place="popup"]')).toHaveAttribute("data-lifecycle", "active");
    await expect(dialog.locator('input[data-field="profile.name"]')).toHaveValue("Ada Edited");
    await dialog.locator('input[data-field="profile.name"]').fill("Popup Ada");
    await dialog.getByRole("button", { name: "Use this person" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();
    await expect(first.locator("[data-popup-result]")).toHaveText("Popup used Popup Ada");
    await expect(mainName).toHaveValue("Popup Ada");
    await expect(ada.locator('input[data-field="profile.name"]')).toHaveValue("Popup Ada");
    await ada.getByRole("button", { name: "Validate changes" }).click();
    await expect(ada.locator("[data-validation]")).toHaveText("Valid changes ready for an application save");
    await expect(first.locator("[data-notify-message]")).toHaveText("Valid changes ready for an application save");

    page.once("dialog", dialog => { void dialog.dismiss(); });
    await adaTab.focus();
    await page.keyboard.press("Delete");
    await expect(first.locator("[data-history]")).toContainText("ada: close refused");
    await expect(ada).toHaveAttribute("data-controller", original!);
    await first.locator("[data-reload-document]").click();
    await expect(ada).toHaveAttribute("data-lifecycle", "active");
    await expect.poll(() => ada.getAttribute("data-controller")).not.toBe(original);
    await expect(ada.locator('input[data-field="profile.name"]')).toHaveValue("Popup Ada");
    page.once("dialog", dialog => { void dialog.accept(); });
    await adaTab.focus();
    await page.keyboard.press("Delete");
    await expect(adaTab).toHaveCount(0);
    await expect(linTab).toHaveAttribute("aria-selected", "true");
    await expect(linTab).toBeFocused();
    await page.keyboard.press("Delete");
    await expect(linTab).toHaveCount(0);
    await expect(first.locator("[data-document-empty] button")).toBeFocused();
    await expect(mainName).toHaveValue("Popup Ada");
    await expect(first.locator("[data-changes]")).toContainText('"name": "Popup Ada"');
    await first.locator("[data-revert]").click();
    await expect(mainName).toHaveValue("Ada");
    await expect(first.locator("[data-changes]")).toHaveText("[]");
    await first.locator('[data-open-document="ada"]').first().click();
    await first.locator('[data-open-document="lin"]').click();
    await first.locator("[data-close-documents]").click();
    await expect(first.getByRole("tab")).toHaveCount(0);
    await expect(first.locator("[data-document-empty]")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test(`${layout} retries failure, cancels pending pages, and releases an independent shell`, async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", error => errors.push(error));
    await page.goto(`/m12/${layout}.html`);
    const first = page.locator('[data-screen="1"]');
    const second = page.locator('[data-screen="2"]');
    await expect(second).toHaveAttribute("data-lifecycle", "active");
    const normal = first.locator("[data-notify-normal]");
    await normal.focus();
    await normal.press("Enter");
    await expect(normal).toBeFocused();
    await expect(first.locator("[data-notify-status]")).toHaveText("Workspace notice remains until dismissed");
    await first.locator("[data-notify-urgent]").click();
    await expect(first.locator("[data-notify-alert]")).toHaveText("Important workspace notice");
    await expect(second.locator("[data-notify-message]")).toHaveCount(0);
    await first.locator("[data-notify-close]").first().focus();
    await first.locator("[data-notify-close]").first().press("Enter");
    await expect(first.locator("[data-notify-close]")).toBeFocused();
    await first.locator("[data-notify-clear]").click();
    await expect(first.locator("[data-notify-message]")).toHaveCount(0);

    await first.locator('[data-open-document="retry"]').click();
    await expect(first.locator("[data-document-error]")).toBeVisible();
    await expect(first.locator("[data-history]")).toContainText("retry document");
    await expect(first.locator('[data-document-panels] [data-editor]')).toHaveCount(0);
    await first.locator('[data-open-document="retry"]').click();
    const retry = first.locator('[data-document-panels] [data-editor][data-key="retry"]');
    await expect(retry).toHaveAttribute("data-lifecycle", "active");
    await expect(first.locator("[data-document-error]")).not.toBeVisible();
    const retried = await retry.getAttribute("data-controller");
    await first.locator('[data-open-document="retry"]').click();
    await expect(retry).toHaveAttribute("data-controller", retried!);
    await first.locator('[data-open-document="slow"]').click();
    const pending = first.locator('[data-document-panels] [data-editor][data-key="slow"]');
    await expect(pending).toHaveAttribute("data-lifecycle", "initializing");
    const pendingTab = first.getByRole("tab", { name: "Pending", exact: true });
    await pendingTab.focus();
    await page.keyboard.press("Delete");
    await expect(pendingTab).toHaveCount(0);
    await expect(retry).toHaveAttribute("data-lifecycle", "active");
    await expect(first.locator("[data-history] > li").filter({ hasText: /^slow document #\d+: disposed$/ })).toHaveCount(1);
    await second.locator('[data-open-document="ada"]').first().click();
    await expect(second.locator('[data-document-panels] [data-editor]')).toHaveAttribute("data-lifecycle", "active");
    await first.locator('[data-open-document="slow"]').click();
    await expect(pending).toHaveAttribute("data-lifecycle", "initializing");
    await first.locator("[data-remove-shell]").click();
    await expect(first).toHaveCount(0);
    await expect(page.locator("[data-add-shell]")).toBeFocused();
    await expect(second.locator('[data-document-panels] [data-editor]')).toHaveAttribute("data-lifecycle", "active");
    await page.locator("[data-add-shell]").click();
    const third = page.locator('[data-screen="3"]');
    await expect(third).toHaveAttribute("data-lifecycle", "active");
    await third.locator("[data-open-popup]").click();
    await expect(third.locator("[data-editor-dialog]")).toBeVisible();
    await third.locator("[data-remove-shell]").evaluate(button => (button as HTMLButtonElement).click());
    await expect(third).toHaveCount(0);
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test(`${layout} preserves accessible authored empty and populated shell states at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(`/m12/${layout}.html`);
    await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }" });
    const first = page.locator('[data-screen="1"]');
    const second = page.locator('[data-screen="2"]');
    await expect(second).toHaveAttribute("data-lifecycle", "active");
    const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
    const empty = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(empty.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => node.target) }))).toEqual([]);
    await first.locator('[data-open-document="ada"]').first().click();
    await first.locator('[data-open-document="lin"]').click();
    await first.locator("[data-notify-normal]").click();
    await second.locator('[data-open-document="ada"]').first().click();
    const populated = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(populated.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => node.target) }))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await first.locator("[data-open-popup]").click();
    await expect(first.locator('[data-editor-dialog] [data-editor]')).toHaveAttribute("data-lifecycle", "active");
    const modal = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(modal.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => node.target) }))).toEqual([]);
    const references = await page.evaluate(() => {
      const targets = new Map<string, Element[]>();
      for (const element of document.querySelectorAll("[id]")) targets.set(element.id, [...targets.get(element.id) ?? [], element]);
      const duplicates = [...targets].filter(([, elements]) => elements.length !== 1).map(([id]) => id);
      const dangling: string[] = [];
      for (const element of document.querySelectorAll("[aria-labelledby], [aria-describedby], [aria-controls], [aria-owns]")) {
        for (const attribute of ["aria-labelledby", "aria-describedby", "aria-controls", "aria-owns"]) {
          for (const id of (element.getAttribute(attribute) ?? "").split(/\s+/).filter(Boolean)) {
            const target = targets.get(id);
            if (target?.length !== 1 || target[0].closest("[data-screen]") !== element.closest("[data-screen]")) dangling.push(id);
          }
        }
      }
      return { duplicates, dangling };
    });
    expect(references).toEqual({ duplicates: [], dangling: [] });
    await page.keyboard.press("Escape");
    await expect(first.locator("[data-open-popup]")).toBeFocused();
  });
}
