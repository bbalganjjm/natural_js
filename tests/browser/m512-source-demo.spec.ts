// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";
import type { Employee } from "../../examples/vite/m10/detail.js";

test("reduced CVC details preserve unmarked source fields and the actual raw snapshot follows committed edits", async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/m10/demo.html");
  const row = page.locator("[data-grid] tbody tr[data-row-status]").first();
  await row.locator("[data-select-row]").click();
  const snapshot = page.locator("[data-snapshot]");
  const received = JSON.parse(await snapshot.innerText()) as { id: number; value: Employee };
  await page.locator("[data-detail-reduced]").check();
  await row.locator('[data-row-action="detail-inline"]').click();
  const detail = page.locator("[data-detail-inline-host] [data-detail-row]");
  await expect(detail).toHaveAttribute("data-detail-row", String(received.id));
  expect(await detail.locator("[data-field]").evaluateAll(fields => fields.map(field => field.getAttribute("data-field"))))
    .toEqual(["active", "name", "salary"]);
  await detail.locator('[data-field="name"]').fill("Source Ada");
  await detail.locator('[data-field="salary"]').fill("275");
  await detail.locator('[data-field="salary"]').blur();
  await expect(snapshot).toContainText('"salary": 275');
  expect(JSON.parse(await snapshot.innerText()).value).toEqual({ ...received.value, name: "Source Ada", salary: 275 });
  expect(JSON.parse(await page.locator("[data-original]").innerText())).toEqual(received.value);

  await row.locator('[data-field="notes"]').fill("Changed outside the reduced Form");
  await row.locator('[data-field="notes"]').blur();
  await expect(snapshot).toContainText('"notes": "Changed outside the reduced Form"');
  const committed = { ...received.value, name: "Source Ada", salary: 275, notes: "Changed outside the reduced Form" };
  expect(JSON.parse(await snapshot.innerText()).value).toEqual(committed);
  await expect(detail.locator('[data-field="name"]')).toHaveValue("Source Ada");

  const releasedInput = await detail.locator('[data-field="name"]').elementHandle();
  await detail.locator("[data-detail-close]").click();
  await expect(page.locator("[data-detail-inline-host]")).toBeEmpty();
  await releasedInput!.evaluate(input => {
    (input as HTMLInputElement).value = "Released input";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(JSON.parse(await snapshot.innerText()).value).toEqual(committed);
  expect(JSON.parse(await page.locator("[data-original]").innerText())).toEqual(received.value);
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
});
