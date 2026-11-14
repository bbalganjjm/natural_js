// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";

test("authored choice groups bind two independent CVC records and restore captured values without source writes", async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/m5/choices.html");
  const stack = page.getByRole("region", { name: "Stacked choice screen" });
  const chips = page.getByRole("region", { name: "Chip choice screen" });
  await expect(stack.getByRole("radio", { name: "Female", exact: true })).toBeChecked();
  await expect(chips.getByRole("radio", { name: "Female", exact: true })).toBeChecked();
  await expect(stack.locator("[data-defaults]")).toContainText('"gender": "male"');
  const initial = JSON.parse(await stack.locator("[data-source]").innerText());
  await stack.getByRole("radio", { name: "Male", exact: true }).check();
  await expect(stack.locator("[data-source]")).toContainText('"gender": "male"');
  await expect(chips.getByRole("radio", { name: "Female", exact: true })).toBeChecked();
  await stack.getByRole("button", { name: "Revert received values" }).click();
  await expect(stack.getByRole("radio", { name: "Female", exact: true })).toBeChecked();
  await stack.getByRole("button", { name: "Restore captured fields" }).click();
  await expect(stack.getByRole("radio", { name: "Male", exact: true })).toBeChecked();
  await expect(stack.getByRole("checkbox", { name: "Apple", exact: true })).toBeChecked();
  expect(JSON.parse(await stack.locator("[data-source]").innerText()).value).toEqual(initial.value);
  await stack.getByRole("button", { name: "Bind record", exact: true }).click();
  await stack.getByRole("checkbox", { name: "Banana", exact: true }).uncheck();
  await stack.getByRole("button", { name: "Validate record" }).click();
  await expect(stack.locator('[data-error-for="favoriteFruit"]')).not.toBeEmpty();
  await expect(stack.getByRole("checkbox", { name: "Pear", exact: true })).toBeDisabled();
  await stack.getByRole("checkbox", { name: "Apple", exact: true }).check();
  await stack.getByRole("button", { name: "Validate record" }).click();
  await expect(stack.locator("[data-status]")).toHaveText("Record is valid.");
  const names = await page.locator("[data-screen] input[type=radio]").evaluateAll(inputs =>
    inputs.map(input => (input as HTMLInputElement).name));
  expect(new Set(names).size).toBe(2);
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  const detached = await stack.getByRole("radio", { name: "Male", exact: true }).elementHandle();
  await stack.getByRole("button", { name: "Close screen" }).click();
  await expect(stack).toHaveCount(0);
  await detached!.evaluate(input => { input.checked = true; input.dispatchEvent(new Event("change", { bubbles: true })); });
  await page.getByRole("button", { name: "Open stacked screen" }).click();
  await expect(stack.getByRole("radio", { name: "Female", exact: true })).toBeChecked();
  await expect(chips.locator("[data-source]")).toContainText('"name": "Bea"');
});

test("standalone authored choices retain array shape and surviving native defaults across replacement", async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/m5/choices.html");
  const playground = page.locator("[data-playground]");
  await expect(playground.getByRole("checkbox", { name: "Apple", exact: true })).toBeChecked();
  await playground.getByRole("combobox", { name: "Choice list", exact: true }).selectOption("one");
  await expect(playground.getByRole("checkbox")).toHaveCount(1);
  await playground.getByRole("button", { name: "Clear selection" }).click();
  await expect(playground.locator("[data-playground-value]")).toHaveText("[]");
  await playground.getByRole("button", { name: "Restore native defaults" }).click();
  await expect(playground.getByRole("checkbox", { name: "Apple", exact: true })).toBeChecked();
  await playground.getByRole("button", { name: "Read selection" }).click();
  await expect(playground.locator("[data-playground-value]")).toHaveText('["apple"]');
  await playground.getByRole("combobox", { name: "Choice list", exact: true }).selectOption("empty");
  await expect(playground.getByRole("checkbox")).toHaveCount(0);
  await expect(playground.locator("[data-playground-value]")).toHaveText("[]");
  await playground.getByRole("combobox", { name: "Choice list", exact: true }).selectOption("all");
  await playground.getByRole("button", { name: "Choose Apple" }).click();
  await expect(playground.locator("[data-playground-value]")).toHaveText('["apple"]');
});
