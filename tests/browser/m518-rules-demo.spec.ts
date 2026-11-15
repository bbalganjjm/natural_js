// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/m5/rules.html");
  await expect(page.locator("[data-screen]")).toHaveCount(2);
  await expect(page.locator("[data-page-status]")).toHaveText("Rule screens are ready.");
});

test("two CVC layouts keep real invalid Form Grid and List values while adopting stricter rules", async ({ page }) => {
  const stack = page.locator('[data-layout="stack"]'), compact = page.locator('[data-layout="compact"]');
  const input = stack.locator('[data-editor] [data-field="name"]'), cell = stack.locator('tbody [data-field="name"]').first();
  await input.fill("abc"); await cell.fill("def"); await stack.locator("[data-validate-all]").click();
  const before = JSON.parse(await stack.locator("[data-records]").innerText()), old = await stack.locator('[data-error-for="name"]').innerText();
  await expect(input).toHaveValue("abc"); await expect(cell).toHaveValue("def");
  expect(JSON.parse(await stack.locator("[data-rule-issues]").innerText()).map((owner: { valid: boolean }) => owner.valid)).toEqual([false, false, false]);
  await stack.locator("[data-adopt]").click(); await expect(stack.locator("[data-minimum]")).toHaveText("8");
  await expect(input).toHaveValue("abc"); await expect(cell).toHaveValue("def"); await expect(stack.locator('[data-error-for="name"]')).toHaveText(old);
  expect(JSON.parse(await stack.locator("[data-records]").innerText())).toEqual(before);
  await expect(compact.locator("[data-minimum]")).toHaveText("5"); await expect(compact.locator('[data-editor] [data-field="name"]')).toHaveValue("Ada");
  await stack.locator("[data-validate-all]").click();
  const reports = JSON.parse(await stack.locator("[data-rule-issues]").innerText());
  expect(reports.map((owner: { issues: { rule: string; message: string }[] }) => owner.issues.some(issue => issue.rule === "minlength" && issue.message.includes("8")))).toEqual([true, true, true]);
  await expect(stack.locator("ul [data-field=name]").first()).toHaveText("Ada");
});

test("manual focus blur and composition preserve raw values separately from display and keep scope state independent", async ({ page }) => {
  const stack = page.locator('[data-layout="stack"]'), compact = page.locator('[data-layout="compact"]'), manual = stack.locator("[data-manual-amount]");
  await expect(manual).toHaveValue("$1,200.50"); await manual.focus(); await manual.fill("12.3"); await expect(manual).toHaveValue("$12.3");
  await expect(stack.locator("[data-manual-raw]")).toHaveText("12.3"); await expect(manual).toHaveAttribute("aria-invalid", "true");
  await stack.locator("[data-title]").click(); await expect(manual).toHaveValue("$12.30"); await manual.focus(); await expect(manual).toHaveValue("12.3");
  await manual.evaluate(input => {
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    (input as HTMLInputElement).value = "123.4";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }));
  });
  await expect(manual).toHaveValue("123.4"); await expect(stack.locator("[data-manual-raw]")).toHaveText("12.3");
  await manual.evaluate(input => input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
  await expect(manual).toHaveValue("$123.4"); await expect(manual).toHaveAttribute("aria-invalid", "false");
  await expect(stack.locator("[data-manual-raw]")).toHaveText("123.4"); await expect(compact.locator("[data-manual-raw]")).toHaveText("1200.5");
});

test("the real scalar total uses standalone formatting after row additions in only its own page", async ({ page }) => {
  const stack = page.locator('[data-layout="stack"]'), compact = page.locator('[data-layout="compact"]');
  await expect(stack.locator("[data-total]")).toHaveText("2"); await stack.locator("[data-append]").click();
  await expect(stack.locator("[data-total]")).toHaveText("3"); await expect(stack.locator("tbody tr")).toHaveCount(3);
  await expect(stack.locator("ul li")).toHaveCount(3); await expect(compact.locator("[data-total]")).toHaveText("2");
  expect(JSON.parse(await stack.locator("[data-records]").innerText())).toHaveLength(3);
});

test("closing and reopening a CVC rule screen releases native mask listeners while its sibling remains active", async ({ page }) => {
  const stack = page.locator('[data-layout="stack"]'), compact = page.locator('[data-layout="compact"]');
  const input = await stack.locator("[data-manual-amount]").elementHandle(), output = await stack.locator("[data-manual-raw]").elementHandle();
  await stack.locator("[data-close]").click(); await expect(stack).toHaveCount(0);
  await input!.evaluate(input => { (input as HTMLInputElement).value = "9"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  expect(await input!.inputValue()).toBe("9"); expect(await output!.textContent()).toBe("1200.5");
  await compact.locator("[data-manual-amount]").focus(); await compact.locator("[data-manual-amount]").fill("500"); await expect(compact.locator("[data-manual-raw]")).toHaveText("500");
  await page.locator('[data-open="stack"]').click(); await expect(stack.locator("[data-manual-amount]")).toHaveValue("$1,200.50");
  await expect(compact.locator("[data-manual-raw]")).toHaveText("500");
});

test("both authored rule layouts provide unique label and error associations with no automated accessibility violations", async ({ page }) => {
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id)); expect(new Set(ids).size).toBe(ids.length);
  const manual = page.locator('[data-layout="stack"] [data-manual-amount]');
  await manual.focus(); await expect(manual).toBeFocused();
  const description = await manual.getAttribute("aria-describedby"); expect(description).toBeTruthy();
  await expect(page.locator(`[id="${description}"]`)).toHaveAttribute("aria-live", "polite");
  const report = await new AxeBuilder({ page }).analyze(); expect(report.violations).toEqual([]);
});

test("composition completion applies once and a canceled native deletion cannot change raw on blur", async ({ page }) => {
  const input = page.locator('[data-layout="stack"] [data-manual-amount]'); await input.focus();
  const writes = await input.evaluate(input => {
    const native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!; let writes = 0;
    Object.defineProperty(input, "value", { configurable: true, get() { return native.get!.call(this); }, set(value) { writes++; native.set!.call(this, value); } });
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); native.set!.call(input, "123.4");
    input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }));
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    input.dispatchEvent(new InputEvent("beforeinput", { bubbles: true, inputType: "insertCompositionText" }));
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertCompositionText" }));
    Reflect.deleteProperty(input, "value"); return writes;
  });
  expect(writes).toBe(1); await expect(input).toHaveValue("$123.4");
  await input.evaluate(input => {
    const control = input as HTMLInputElement; control.setSelectionRange(control.value.length, control.value.length);
    input.addEventListener("beforeinput", event => event.preventDefault(), { once: true });
    input.dispatchEvent(new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType: "deleteContentBackward" }));
  });
  await page.locator('[data-layout="stack"] [data-title]').click(); await expect(input).toHaveValue("$123.40");
  await expect(page.locator('[data-layout="stack"] [data-manual-raw]')).toHaveText("123.4");
});
