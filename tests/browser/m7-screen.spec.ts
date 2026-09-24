import { expect, test } from "@playwright/test";

for (const layout of ["side", "stack"] as const) {
  test(`${layout} shares one page definition across main, Tab, and Popup`, async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", error => errors.push(error));
    await page.goto(`/m7/${layout}.html`);
    const screen = page.locator('[data-screen="1"]');
    const main = screen.locator("[data-main-host] [data-picker-page]");
    const people = screen.locator('[data-panel="people"] [data-picker-page]');
    const peopleTab = screen.locator('[data-tab="people"]');
    const helpTab = screen.locator('[data-tab="help"]');
    const previewTab = screen.locator('[data-tab="preview"]');
    const preview = screen.locator('[data-panel="preview"] [data-picker-page]');
    const dialog = screen.locator("[data-picker-dialog]");

    await expect(main).toHaveAttribute("data-lifecycle", "active");
    await expect(people).toHaveAttribute("data-lifecycle", "active");
    expect(await main.getAttribute("data-controller")).not.toBe(await people.getAttribute("data-controller"));
    const firstTabController = await people.getAttribute("data-controller");
    await main.locator('[data-person="Ada"]').click();
    await expect(screen.locator("[data-main-output]")).toHaveText("Main chose Ada");
    await expect(main.locator("[data-shared-choice]")).toHaveText("Shared selection: Ada");
    await expect(people.locator("[data-shared-choice]")).toHaveText("Shared selection: Ada");
    await people.locator('[data-person="Lin"]').click();
    await expect(screen.locator("[data-tab-output]")).toHaveText("Tab chose Lin");
    await expect(main.locator("[data-shared-choice]")).toHaveText("Shared selection: Lin");
    await expect(people.locator("[data-shared-choice]")).toHaveText("Shared selection: Lin");

    await peopleTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(helpTab).toBeFocused();
    await expect(peopleTab).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(helpTab).toHaveAttribute("aria-selected", "true");
    await expect(people).toHaveAttribute("data-lifecycle", "inactive");
    await expect(screen.locator("[data-inline-help]")).toHaveAttribute("data-lifecycle", "active");
    await screen.locator("[data-help-action]").click();
    await expect(screen.locator("[data-tab-output]")).toHaveText("Help used");
    await helpTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(previewTab).toBeFocused();
    await expect(helpTab).toHaveAttribute("aria-selected", "true");
    await expect(preview).toHaveCount(0);
    await page.keyboard.press("Space");
    await expect(previewTab).toHaveAttribute("aria-selected", "true");
    await expect(preview).toHaveAttribute("data-lifecycle", "active");
    expect(await preview.getAttribute("data-controller")).not.toBe(firstTabController);
    await preview.locator('[data-person="Ada"]').click();
    await expect(screen.locator("[data-preview-output]")).toHaveText("Preview chose Ada");
    await expect(main.locator("[data-shared-choice]")).toHaveText("Shared selection: Ada");

    const previewNested = preview.locator("[data-open-nested]");
    await previewNested.click();
    await expect(dialog).toBeVisible();
    await dialog.locator('[data-person="Lin"]').click();
    await expect(dialog).not.toBeVisible();
    await expect(screen.locator("[data-preview-output]")).toHaveText("Preview chose Lin");
    await expect(screen.locator("[data-popup-output]")).toHaveText("Popup chose Lin");
    await expect(previewNested).toBeFocused();

    await previewTab.focus();
    await page.keyboard.press("Home");
    await expect(peopleTab).toBeFocused();
    await expect(previewTab).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(peopleTab).toHaveAttribute("aria-selected", "true");
    await expect(preview).toHaveAttribute("data-lifecycle", "inactive");
    await expect(people).toHaveAttribute("data-lifecycle", "active");
    expect(await people.getAttribute("data-controller")).toBe(firstTabController);

    const nested = people.locator("[data-open-nested]");
    await nested.click();
    await expect(dialog).toBeVisible();
    const popupPage = dialog.locator("[data-picker-page]");
    await expect(popupPage).toHaveAttribute("data-lifecycle", "active");
    expect(await popupPage.getAttribute("data-controller")).not.toBe(firstTabController);
    await popupPage.locator('[data-person="Ada"]').click();
    await expect(dialog).not.toBeVisible();
    await expect(screen.locator("[data-popup-output]")).toHaveText("Popup chose Ada");
    await expect(nested).toBeFocused();

    const opener = screen.locator("[data-open-picker]");
    await opener.click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(screen.locator("[data-popup-output]")).toHaveText("Popup canceled");
    await expect(opener).toBeFocused();

    const plainOpener = screen.locator("[data-open-plain]");
    await plainOpener.click();
    const plain = screen.locator("[data-plain-dialog]");
    await expect(plain).toBeVisible();
    await plain.getByRole("button", { name: "Close" }).click();
    await expect(plain).not.toBeVisible();
    await expect(plainOpener).toBeFocused();

    const accessibility = await page.locator("body").evaluate(body => {
      const ids = [...body.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
      const tabs = [...body.querySelectorAll<HTMLElement>('[role="tab"][aria-controls]')];
      return {
        duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
        linked: tabs.every(tab => {
          const panel = body.ownerDocument.getElementById(tab.getAttribute("aria-controls")!);
          return panel?.getAttribute("aria-labelledby") === tab.id;
        })
      };
    });
    expect(accessibility).toEqual({ duplicateIds: [], linked: true });
    expect(errors).toEqual([]);
  });

  test(`${layout} keeps two MDI workspaces and Popup results separate`, async ({ page }) => {
    await page.goto(`/m7/${layout}.html`);
    await page.locator("[data-add-screen]").click();
    const first = page.locator('[data-screen="1"]');
    const second = page.locator('[data-screen="2"]');
    await expect(second.locator("[data-main-host] [data-picker-page]")).toBeVisible();
    await expect(second.locator('[data-panel="people"] [data-picker-page]')).toBeVisible();
    await first.locator('[data-tab="preview"]').click();
    await second.locator('[data-tab="preview"]').click();
    const firstPreview = first.locator('[data-panel="preview"] [data-picker-page]');
    const secondPreview = second.locator('[data-panel="preview"] [data-picker-page]');
    await expect(firstPreview).toHaveAttribute("data-lifecycle", "active");
    await expect(secondPreview).toHaveAttribute("data-lifecycle", "active");
    const controllers = await page.locator("[data-screen] [data-picker-page]").evaluateAll(elements =>
      elements.map(element => element.getAttribute("data-controller"))
    );
    expect(controllers).toHaveLength(6);
    expect(controllers).not.toContain(null);
    expect(new Set(controllers).size).toBe(6);
    await secondPreview.locator("[data-open-nested]").click();
    await second.locator('[data-picker-dialog] [data-person="Lin"]').click();
    await expect(second.locator("[data-popup-output]")).toHaveText("Popup chose Lin");
    await expect(second.locator("[data-preview-output]")).toHaveText("Preview chose Lin");
    await expect(first.locator("[data-popup-output]")).toBeEmpty();
    await expect(first.locator("[data-preview-output]")).toBeEmpty();
    await expect(first.locator("[data-picker-page] [data-shared-choice]")).toHaveText([
      "Shared selection: Lin", "Shared selection: Lin", "Shared selection: Lin"
    ]);
    await expect(second.locator("[data-picker-page] [data-shared-choice]")).toHaveText([
      "Shared selection: Lin", "Shared selection: Lin", "Shared selection: Lin"
    ]);
    await second.locator('[data-main-host] [data-person="Ada"]').click();
    await expect(second.locator("[data-main-output]")).toHaveText("Main chose Ada");
    await expect(first.locator("[data-main-output]")).toBeEmpty();
    await expect(first.locator("[data-picker-page] [data-shared-choice]")).toHaveText([
      "Shared selection: Ada", "Shared selection: Ada", "Shared selection: Ada"
    ]);
    await expect(second.locator("[data-picker-page] [data-shared-choice]")).toHaveText([
      "Shared selection: Ada", "Shared selection: Ada", "Shared selection: Ada"
    ]);
    const duplicateIds = await page.locator("[id]").evaluateAll(elements => {
      const ids = elements.map(element => element.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicateIds).toEqual([]);
    await first.locator("[data-remove-screen]").focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveCount(0);
    const addScreen = page.locator("[data-add-screen]");
    await expect(addScreen).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-screen="3"]')).toHaveCount(1);
    await second.locator("[data-open-picker]").click();
    await second.locator('[data-picker-dialog] [data-person="Ada"]').click();
    await expect(second.locator("[data-popup-output]")).toHaveText("Popup chose Ada");
  });
}

test("immediate workspace removal treats page readiness cancellation as normal", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", error => errors.push(error));
  await page.goto("/m7/side.html");
  await page.evaluate(() => {
    document.querySelector<HTMLButtonElement>("[data-add-screen]")!.click();
    document.querySelector<HTMLButtonElement>('[data-screen="2"] [data-remove-screen]')!.click();
  });
  await expect(page.locator('[data-screen="2"]')).toHaveCount(0);
  await expect(page.locator("[data-history] > li")).toHaveText(["Screen 2: removed"]);
  await expect(page.locator("[data-add-screen]")).toBeFocused();
  expect(errors).toEqual([]);
});

test("slow Popup close and parent removal settle once and release the page", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", error => errors.push(error));
  await page.goto("/m7/side.html");
  const first = page.locator('[data-screen="1"]');
  const dialog = first.locator("[data-picker-dialog]");

  await first.locator("[data-open-slow-picker]").click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(first.locator("[data-popup-output]")).toHaveText("Popup canceled");
  await expect(dialog).not.toBeVisible();
  await expect(dialog.locator("[data-page-host]")).toBeEmpty();
  await first.locator("[data-open-picker]").click();
  await dialog.locator('[data-person="Ada"]').click();
  await expect(first.locator("[data-popup-output]")).toHaveText("Popup chose Ada");

  await first.locator("[data-open-slow-picker]").click();
  await dialog.evaluate(element => element.remove());
  await expect(page.locator("[data-history]")).toContainText("Screen 1: AbortError");
  await first.locator('[data-main-host] [data-person="Lin"]').click();
  await expect(first.locator("[data-main-output]")).toHaveText("Main chose Lin");

  await page.locator("[data-add-screen]").click();
  const second = page.locator('[data-screen="2"]');
  await second.locator("[data-open-slow-picker]").click();
  await second.locator("[data-remove-screen]").evaluate(button => (button as HTMLButtonElement).click());
  await expect(second).toHaveCount(0);
  await expect(page.locator("[data-history]")).toContainText("Screen 2: AbortError");
  expect(errors).toEqual([]);
});
