// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";
import type { Locator, Page } from "@playwright/test";

const records = '[data-grid] tbody tr:not([data-row-template]):not([aria-hidden="true"])';
const boundaryModule = `/@fs/${fileURLToPath(new URL("../../examples/vite/m10/scroll-boundary.ts", import.meta.url)).replaceAll("\\", "/")}`;
const pageErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = []; pageErrors.set(page, errors);
  page.on("pageerror", error => errors.push(error.message));
});
test.afterEach(({ page }) => { expect(pageErrors.get(page)).toEqual([]); });

async function settle(page: Page): Promise<void> {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)))));
}

async function pinnedPositions(screen: Locator, page: Page) {
  const scroll = screen.locator(".grid-scroll, [data-scroll-root]").first();
  const cells = screen.locator("[data-grid] tbody tr").first().locator('[data-pinned-column="true"]');
  const read = () => cells.evaluateAll(elements => elements.map(element => ({ key: element.getAttribute("data-column"),
    left: element.getBoundingClientRect().left, width: element.getBoundingClientRect().width, position: getComputedStyle(element).position })));
  await scroll.evaluate(element => { (element as HTMLElement).style.width = "620px"; element.scrollLeft = 0; }); await settle(page);
  const before = await read();
  await scroll.evaluate(element => { element.scrollLeft = 220; }); await settle(page);
  return { before, after: await read(), scrolled: await scroll.evaluate(element => element.scrollLeft) };
}

async function wheelFixture(page: Page, policy: "contain" | "auto"): Promise<void> {
  await page.route("**/__wheel-fixture", route => route.fulfill({ contentType: "text/html", body:
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Owned scroll boundaries</title><style>
      body{margin:0}main{padding:20px}.outer{width:320px;height:280px;overflow:auto;border:2px solid black}
      .inner{margin-left:180px;width:160px;height:120px;overflow:auto;border:2px solid blue}.spacer{width:900px;height:180px}
      .after{width:900px;height:600px}.content{width:700px;height:600px;background:linear-gradient(white,gray)}
      </style></head><body><main><section class="outer" data-policy="${policy}"><div class="spacer"></div><div class="inner" style="overscroll-behavior:${policy}"><div class="content"></div></div><div class="after"></div></section></main></body></html>` }));
  await page.goto("/__wheel-fixture");
  await page.unroute("**/__wheel-fixture");
}

for (const layout of ["ledger", "notebook"]) {
  test(`${layout} pinned controls retain actual positions through hide and group reorder without changing data`, async ({ page }) => {
    await page.goto("/m10/columns.html");
    const screen = page.locator(`[data-column-layout="${layout}"]`);
    const other = page.locator(`[data-column-layout="${layout === "ledger" ? "notebook" : "ledger"}"]`);
    await expect(screen.locator("[data-pinned-count]")).toHaveText("0 / 8");
    await expect(other.locator("[data-pinned-count]")).toHaveText("0 / 8");
    await screen.locator("[data-column-pins]").fill("2");
    await screen.locator('[data-column-action="pin"]').click();
    await expect(screen.locator("[data-pinned-count]")).toHaveText("2 / 8");
    const first = screen.locator("tbody tr").first();
    await first.locator("[data-select-row]").click();
    await first.locator('[data-field="email"]').fill("Uncommitted invalid email");
    await first.locator('[data-field="email"]').blur();
    const state = JSON.parse(await screen.locator("[data-row-state]").innerText());
    const initial = await pinnedPositions(screen, page);
    expect(initial.before.map(cell => cell.key)).toEqual(layout === "ledger" ? ["name", "email"] : ["name", "team"]);
    expect(initial.scrolled).toBeGreaterThan(0);
    for (let index = 0; index < 2; index++) {
      expect(initial.after[index].position).toBe("sticky");
      expect(Math.abs(initial.after[index].left - initial.before[index].left)).toBeLessThan(1);
    }
    await screen.locator("[data-column-choice]").selectOption("name");
    await screen.locator("[data-column-hidden]").check();
    await screen.locator('[data-column-action="apply"]').click();
    await expect(screen.locator("[data-pinned-count]")).toHaveText("2 / 7");
    if (layout === "ledger") await expect(screen.locator('thead th[data-columns="email phone"]')).toHaveAttribute("data-pinned-column", "true");
    await screen.locator('[data-column-action="swap"]').click();
    const moved = await pinnedPositions(screen, page);
    expect(moved.before.map(cell => cell.key)).toEqual(layout === "ledger" ? ["team", "shift"] : ["email", "phone"]);
    expect(moved.scrolled).toBeGreaterThan(0);
    for (let index = 0; index < 2; index++) expect(Math.abs(moved.after[index].left - moved.before[index].left)).toBeLessThan(1);
    await expect(first.locator('[data-field="email"]')).toHaveValue("Uncommitted invalid email");
    expect(JSON.parse(await screen.locator("[data-row-state]").innerText())).toEqual(state);
    await expect(other.locator("[data-pinned-count]")).toHaveText("0 / 8");
    await screen.locator('[data-column-action="dispose"]').click();
    await screen.locator('[data-column-action="rebind"]').click();
    await expect(screen.locator("[data-pinned-count]")).toHaveText("0 / 8");
    await expect(first.locator('[data-field="email"]')).not.toHaveValue("Uncommitted invalid email");
  });
}

test("authored pointer resize preview updates the next pinned column and Escape restores its position", async ({ page }) => {
  await page.goto("/m10/columns.html");
  const screen = page.locator('[data-column-layout="ledger"]');
  await screen.locator("[data-column-pins]").fill("2"); await screen.locator('[data-column-action="pin"]').click();
  await pinnedPositions(screen, page);
  const header = screen.locator('thead th[data-column="name"]');
  const next = screen.locator('tbody tr').first().locator('[data-column="email"]');
  const originalWidth = await header.evaluate(element => element.getBoundingClientRect().width);
  const originalLeft = await next.evaluate(element => element.getBoundingClientRect().left);
  const state = await screen.locator("[data-columns-state]").innerText();
  const handle = header.locator("[data-resize-column]"); await handle.scrollIntoViewIfNeeded();
  const box = (await handle.boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 40, y, { steps: 4 });
  await expect.poll(() => header.evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThan(originalWidth + 25);
  await expect.poll(() => next.evaluate(element => element.getBoundingClientRect().left)).toBeGreaterThan(originalLeft + 25);
  await expect(screen.locator("[data-columns-state]")).toHaveText(state);
  await page.keyboard.press("Escape"); await page.mouse.up();
  await expect.poll(async () => Math.abs(await header.evaluate(element => element.getBoundingClientRect().width) - originalWidth)).toBeLessThan(1);
  await expect.poll(async () => Math.abs(await next.evaluate(element => element.getBoundingClientRect().left) - originalLeft)).toBeLessThan(1);
  await expect(screen.locator("[data-columns-state]")).toHaveText(state);
});

test("main explorer applies current visible pin counts and restores its authored default on rebind", async ({ page }) => {
  await page.goto("/m10/demo.html");
  await expect(page.locator("[data-pinned-count]")).toHaveText("1 / 9");
  await page.locator("[data-column-pins]").fill("3");
  await page.locator('[data-action="pin-columns"]').click();
  await expect(page.locator("[data-pinned-count]")).toHaveText("3 / 9");
  const scroll = page.locator("[data-scroll-root]");
  const row = page.locator(records).first();
  const keys = await row.locator('[data-pinned-column="true"]').evaluateAll(cells => cells.map(cell => cell.getAttribute("data-column")));
  expect(keys).toEqual(["name", "email", "phone"]);
  await scroll.evaluate(element => { element.scrollLeft = 220; }); await settle(page);
  const positions = await row.locator('[data-pinned-column="true"]').evaluateAll(cells => cells.map(cell => cell.getBoundingClientRect().left));
  await scroll.evaluate(element => { element.scrollLeft = 300; }); await settle(page);
  const later = await row.locator('[data-pinned-column="true"]').evaluateAll(cells => cells.map(cell => cell.getBoundingClientRect().left));
  expect(later.every((left, index) => Math.abs(left - positions[index]) < 1)).toBe(true);
  await page.locator('[data-visible-column="phone"]').uncheck();
  await expect(page.locator("[data-pinned-count]")).toHaveText("3 / 8");
  await page.locator('[data-action="dispose"]').click();
  await page.locator('[data-action="rebind"]').click();
  await expect(page.locator("[data-pinned-count]")).toHaveText("1 / 9");
  await expect(row.locator('[data-pinned-column="true"]')).toHaveCount(1);
  await expect(page.locator("[data-changes]")).toHaveText("[]");
});

test("full and reduced details share edits while omitted fields stay intact across popup reopen", async ({ page }) => {
  await page.goto("/m10/demo.html");
  const row = page.locator(records).first();
  await row.locator('[data-row-action="detail-inline"]').click();
  const inline = page.locator("[data-detail-inline-host] [data-detail-row]");
  await expect(inline).toHaveAttribute("data-detail-row", "1");
  await expect(inline.locator("[data-field]")).toHaveCount(8);
  const omitted = await inline.locator('[data-field]:not([data-field="name"]):not([data-field="salary"])').evaluateAll(fields => fields.map(field => ({
    field: field.getAttribute("data-field"), value: (field as HTMLInputElement).value,
    checked: field instanceof HTMLInputElement && field.type === "checkbox" ? field.checked : null
  })));
  await page.locator("[data-detail-reduced]").check();
  await expect(inline.locator('[data-field="email"]')).toHaveCount(1);
  const opener = row.locator('[data-row-action="detail-popup"]'); await opener.click();
  const dialog = page.locator("[data-detail-dialog]");
  await expect(dialog.locator('[aria-label="Reduced employee details"]')).toBeVisible();
  await expect(dialog.locator("[data-detail-row]")).toHaveAttribute("data-detail-row", "1");
  await expect(dialog.locator("[data-field]")).toHaveCount(3);
  await expect(dialog.locator('[data-field="active"]')).toHaveText(omitted.find(field => field.field === "active")!.checked ? "Active" : "Inactive");
  await dialog.locator('[data-field="name"]').fill("Reduced Ada");
  await dialog.locator('[data-field="salary"]').fill("275");
  await dialog.locator("[data-detail-close]").click();
  await expect(opener).toBeFocused();
  await expect(inline.locator('[data-field="name"]')).toHaveValue("Reduced Ada");
  await expect(inline.locator('[data-field="salary"]')).toHaveValue("275");
  const after = await inline.locator('[data-field]:not([data-field="name"]):not([data-field="salary"])').evaluateAll(fields => fields.map(field => ({
    field: field.getAttribute("data-field"), value: (field as HTMLInputElement).value,
    checked: field instanceof HTMLInputElement && field.type === "checkbox" ? field.checked : null
  })));
  expect(after).toEqual(omitted);
  await opener.click();
  await expect(dialog.locator('[data-field="salary"]')).toHaveValue("275");
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  await dialog.locator("[data-detail-close]").click();
  await page.locator("[data-detail-reduced]").uncheck();
  await opener.click();
  await expect(dialog.locator("[data-field]")).toHaveCount(8);
  await expect(dialog.locator('[data-field="assignment.chosen"]')).toHaveValue(String(omitted.find(field => field.field === "assignment.chosen")!.value));
  await dialog.locator("[data-detail-close]").click();
  await inline.locator("[data-detail-close]").click();
  await expect(page.locator("[data-detail-inline-host]")).toBeEmpty();
});

test("reduced details retain validation and visible filtered store navigation contracts", async ({ page }) => {
  await page.goto("/m10/demo.html");
  await page.locator("[data-detail-reduced]").check();
  await page.locator("[data-size]").selectOption("2");
  await page.locator(records).first().locator('[data-row-action="detail-popup"]').click();
  const dialog = page.locator("[data-detail-dialog]");
  const current = dialog.locator("[data-detail-row]");
  await dialog.locator('[data-field="salary"]').fill("50");
  await dialog.locator("[data-detail-next]").click();
  await expect(current).toHaveAttribute("data-detail-row", "1");
  await expect(dialog.locator("[data-detail-error]")).toContainText("Salary must be at least 100.");
  await page.keyboard.press("Escape"); await expect(dialog).toBeVisible();
  await dialog.locator('[data-field="salary"]').fill("180");
  await dialog.locator("[data-detail-next]").click();
  await expect(current).toHaveAttribute("data-detail-row", "2");
  await dialog.locator("[data-detail-next]").click();
  await expect(current).toHaveAttribute("data-detail-row", "3");
  await expect(page.locator("[data-page-state]")).toContainText("Page 2 of 3");
  await dialog.locator("[data-detail-scope]").selectOption("visible");
  await expect(dialog.locator("[data-detail-previous]")).toBeDisabled();
  await dialog.locator("[data-detail-next]").click();
  await expect(current).toHaveAttribute("data-detail-row", "4");
  await expect(dialog.locator("[data-detail-next]")).toBeDisabled();
  await dialog.locator("[data-detail-scope]").selectOption("store");
  await dialog.locator("[data-detail-next]").click();
  await expect(current).toHaveAttribute("data-detail-row", "5");
  await expect(page.locator("[data-page-state]")).toContainText("Page 2 of 3");
  await dialog.locator("[data-detail-close]").click();
  await expect(page.locator("[data-scroll-root]")).toBeFocused();
});

for (const axis of ["x", "y"] as const) for (const boundary of ["start", "end"] as const) {
  test(`native ${axis} wheel containment stops ${boundary} chaining while auto permits the positive control`, async ({ page }) => {
    for (const policy of ["contain", "auto"] as const) {
      await wheelFixture(page, policy);
      const outer = page.locator(`[data-policy="${policy}"]`), inner = outer.locator(".inner");
      await outer.evaluate(async (element, { axis, boundary, policy, boundaryModule }) => {
        element.scrollTop = element.scrollLeft = 120;
        const target = element.querySelector<HTMLElement>(".inner")!;
        if (policy === "contain") {
          const { containWheel } = await import(boundaryModule);
          containWheel(target, new AbortController().signal);
        }
        target.scrollTop = axis === "y" && boundary === "end" ? target.scrollHeight - target.clientHeight : 0;
        target.scrollLeft = axis === "x" && boundary === "end" ? target.scrollWidth - target.clientWidth : 0;
        document.documentElement.dataset.wheel = "none";
        document.documentElement.dataset.wheelDelta = "none";
        // Native compositor scrolling can move the inner element before passive wheel delivery.
        document.addEventListener("wheel", event => {
          document.documentElement.dataset.wheel = String(event.isTrusted);
          document.documentElement.dataset.wheelDelta = `${event.deltaX},${event.deltaY}`;
        }, { passive: true, capture: true, once: true });
      }, { axis, boundary, policy, boundaryModule });
      await settle(page);
      const point = await inner.evaluate(element => {
        const box = element.getBoundingClientRect();
        const parent = element.parentElement!.getBoundingClientRect();
        const x = (Math.max(box.left + element.clientLeft, parent.left + 2) + Math.min(box.right - 18, parent.right - 18)) / 2;
        const y = (Math.max(box.top + element.clientTop, parent.top + 2) + Math.min(box.bottom - 18, parent.bottom - 18)) / 2;
        return { x, y, inside: element.contains(document.elementFromPoint(x, y)) };
      });
      expect(point.inside).toBe(true);
      await page.mouse.move(point.x, point.y);
      const delta = boundary === "start" ? -300 : 300;
      await page.mouse.wheel(axis === "x" ? delta : 0, axis === "y" ? delta : 0);
      await expect(page.locator("html")).toHaveAttribute("data-wheel", "true");
      await expect(page.locator("html")).toHaveAttribute("data-wheel-delta", `${axis === "x" ? delta : 0},${axis === "y" ? delta : 0}`);
      if (policy === "auto") {
        if (boundary === "start") await expect.poll(() => outer.evaluate((element, axis) => axis === "x" ? element.scrollLeft : element.scrollTop, axis)).toBeLessThan(120);
        else await expect.poll(() => outer.evaluate((element, axis) => axis === "x" ? element.scrollLeft : element.scrollTop, axis)).toBeGreaterThan(120);
      } else {
        await page.waitForTimeout(150);
        expect(await outer.evaluate((element, axis) => axis === "x" ? element.scrollLeft : element.scrollTop, axis)).toBe(120);
      }
      expect(await inner.evaluate((element, { axis, boundary }) => {
        const position = axis === "x" ? element.scrollLeft : element.scrollTop;
        const maximum = axis === "x" ? element.scrollWidth - element.clientWidth : element.scrollHeight - element.clientHeight;
        return Math.abs(position - (boundary === "start" ? 0 : maximum));
      }, { axis, boundary })).toBeLessThan(1);
    }
  });
}

test("owned wheel boundary handling preserves Ctrl interior nested scrolling and releases an aborted listener", async ({ page }) => {
  await wheelFixture(page, "auto");
  const result = await page.evaluate(async boundaryModule => {
    const { containWheel } = await import(boundaryModule);
    const root = document.querySelector<HTMLElement>(".inner")!;
    const child = document.createElement("div");
    child.style.cssText = "width:60px;height:40px;overflow:auto";
    child.innerHTML = '<div style="width:300px;height:200px">Nested scrolling</div>';
    root.querySelector(".content")!.append(child);
    const lifetime = new AbortController(); containWheel(root, lifetime.signal);
    const wheel = (target: Element, deltaY: number, ctrlKey = false) => {
      const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY, ctrlKey });
      target.dispatchEvent(event); return event.defaultPrevented;
    };
    root.scrollTop = 50;
    const interior = wheel(root, 30);
    root.scrollTop = root.scrollHeight - root.clientHeight;
    const blocked = wheel(root, 30), ctrl = wheel(root, 30, true);
    child.scrollTop = 0;
    const nestedInterior = wheel(child, 30);
    child.scrollTop = child.scrollHeight - child.clientHeight;
    const nestedBoundary = wheel(child, 30);
    lifetime.abort();
    const aborted = wheel(root, 30);
    return { interior, blocked, ctrl, nestedInterior, nestedBoundary, aborted };
  }, boundaryModule);
  expect(result).toEqual({ interior: false, blocked: true, ctrl: false, nestedInterior: false, nestedBoundary: true, aborted: false });
});
