// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const source = (path: string) =>
  `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const notify = source("../../src/ui/notify.ts");
const markup = `<section data-notify aria-label="Notifications">
  <ul data-notify-list><li data-notify-template class="authored-note">
    <span data-notify-message>Authored message</span>
    <button type="button" data-notify-close aria-label="Dismiss notification"><span aria-hidden="true">×</span></button>
  </li></ul>
  <p data-notify-status role="status" aria-live="off" class="sr-only"><span>Authored status</span></p>
  <p data-notify-alert role="alert" class="sr-only"><strong>Authored alert</strong></p>
</section>`;
const hiddenStyle = '<style>.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }</style>';

test("notifications retain authored markup, announce through stable channels, and insert safe text without focus", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ notify, markup, hiddenStyle }) => {
    const { bindNotify } = await import(notify);
    document.body.innerHTML = `${hiddenStyle}<button id="opener">Save</button>${markup}`;
    const root = document.querySelector<HTMLElement>("[data-notify]")!;
    const original = root.outerHTML;
    const template = root.querySelector("[data-notify-template]");
    const status = root.querySelector("[data-notify-status]")!;
    const alert = root.querySelector("[data-notify-alert]")!;
    const originalStatus = status.firstChild;
    const originalAlert = alert.firstChild;
    const opener = document.querySelector<HTMLButtonElement>("#opener")!;
    opener.focus();
    const handle = bindNotify(root);
    const first = handle.show('<img src=x onerror="window.injected=true"> Saved');
    const repeated = handle.show("Same message");
    const previousNode = status.firstChild;
    const again = handle.show("Same message");
    const urgent = handle.show("Saving failed", { urgent: true });
    const visible = [...root.querySelectorAll<HTMLElement>("[data-notify-list] > li")];
    const links = visible.every(item => {
      const message = item.querySelector("[data-notify-message]")!;
      return item.querySelector("[data-notify-close]")?.getAttribute("aria-describedby") === message.id &&
        document.getElementById(message.id) === message;
    });
    const shown = { count: visible.length, safe: root.querySelector("img") === null && !Reflect.get(window, "injected"),
      messages: visible.map(item => item.querySelector("[data-notify-message]")!.textContent),
      retainedClass: visible.every(item => item.className === "authored-note"),
      focus: document.activeElement === opener, links,
      status: status.textContent, alert: alert.textContent,
      repeatedMutation: status.firstChild !== previousNode,
      stable: root.querySelector("[data-notify-status]") === status && root.querySelector("[data-notify-alert]") === alert,
      channels: [status.getAttribute("aria-live"), alert.getAttribute("aria-live")],
      atomic: [status.getAttribute("aria-atomic"), alert.getAttribute("aria-atomic")] };
    repeated();
    const olderDismissKeepsLatest = status.textContent === "Same message";
    again();
    const latestDismissClears = status.textContent === "";
    urgent();
    first();
    first();
    handle.dispose();
    handle.dispose();
    first();
    const restored = root.outerHTML === original && root.querySelector("[data-notify-template]") === template &&
      status.firstChild === originalStatus && alert.firstChild === originalAlert;
    return { shown, olderDismissKeepsLatest, latestDismissClears, restored };
  }, { notify, markup, hiddenStyle });
  expect(result).toEqual({ shown: { count: 4, safe: true,
    messages: ['<img src=x onerror="window.injected=true"> Saved', "Same message", "Same message", "Saving failed"],
    retainedClass: true, focus: true, links: true, status: "Same message", alert: "Saving failed",
    repeatedMutation: true, stable: true, channels: ["polite", "assertive"], atomic: ["true", "true"] },
    olderDismissKeepsLatest: true, latestDismissClears: true, restored: true });
});

test("dismissal follows native keyboard activation and keeps focused removal inside the region", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async ({ notify, markup, hiddenStyle }) => {
    const { bindNotify } = await import(notify);
    document.body.innerHTML = `${hiddenStyle}<button id="outside">Outside</button>${markup}`;
    const root = document.querySelector<HTMLElement>("[data-notify]")!;
    root.id = "focus-notifications";
    const handle = bindNotify(root);
    handle.show("First");
    handle.show("Middle");
    const last = handle.show("Last");
    Object.assign(window, { notifyHandle: handle, dismissLast: last });
  }, { notify, markup, hiddenStyle });
  const closes = page.locator("#focus-notifications [data-notify-close]");
  await closes.nth(1).focus();
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => document.activeElement?.parentElement?.querySelector("[data-notify-message]")?.textContent)).toBe("Last");
  await page.evaluate(() => Reflect.get(window, "dismissLast")());
  expect(await page.evaluate(() => document.activeElement?.parentElement?.querySelector("[data-notify-message]")?.textContent)).toBe("First");
  await page.keyboard.press("Space");
  await expect(page.locator("#focus-notifications")).toBeFocused();
  await expect(closes).toHaveCount(0);
  await page.locator("#outside").focus();
  await page.evaluate(() => {
    const handle = Reflect.get(window, "notifyHandle");
    handle.show("Added without focus");
    handle.clear();
  });
  await expect(page.locator("#outside")).toBeFocused();
  await page.evaluate(() => Reflect.get(window, "notifyHandle").show("Clear focused"));
  await closes.focus();
  await page.evaluate(() => Reflect.get(window, "notifyHandle").clear());
  await expect(page.locator("#focus-notifications")).toBeFocused();
});

test("dismissal skips unavailable close controls and clear remains scoped to one MDI region", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ notify, markup, hiddenStyle }) => {
    const { bindNotify } = await import(notify);
    document.body.innerHTML = hiddenStyle + markup + markup;
    const roots = [...document.querySelectorAll<HTMLElement>("[data-notify]")];
    const [first, second] = roots.map(root => bindNotify(root));
    const remove = first.show("First");
    first.show("Disabled");
    first.show("Last");
    second.show("Independent", { urgent: true });
    const buttons = [...roots[0].querySelectorAll<HTMLButtonElement>("[data-notify-close]")];
    buttons[1].disabled = true;
    buttons[0].focus();
    remove();
    const next = document.activeElement === buttons[2];
    first.clear();
    const independent = roots[1].querySelector("[data-notify-message]")!.textContent === "Independent" &&
      roots[1].querySelector("[data-notify-alert]")!.textContent === "Independent";
    const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
    const unique = ids.length === new Set(ids).size;
    const focus = document.activeElement === roots[0];
    first.dispose();
    second.dispose();
    return { next, independent, unique, focus };
  }, { notify, markup, hiddenStyle });
  expect(result).toEqual({ next: true, independent: true, unique: true, focus: true });
});

test("invalid notification markup and label references fail before mutation or ownership", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ notify, markup, hiddenStyle }) => {
    const { bindNotify } = await import(notify);
    const scenarios = [
      markup.replace('aria-label="Notifications"', ""),
      markup.replace('aria-label="Notifications"', 'aria-labelledby="missing-heading"'),
      markup.replace("data-notify-message", 'id="fixed-message" data-notify-message'),
      markup.replace("data-notify-message>", "data-notify-message><span>Nested</span>"),
      markup.replace("class=\"authored-note\">", 'class="authored-note"><input>'),
      markup.replace("class=\"authored-note\">", 'class="authored-note"><details><summary>Extra stop</summary></details>'),
      markup.replace('aria-label="Dismiss notification"', ""),
      markup.replace('role="status"', 'role="status" hidden'),
      markup.replace('role="status"', 'role="status" style="display:none"'),
      markup.replace('role="alert"', 'role="status"'),
      markup.replace("<ul data-notify-list>", '<div data-notify-status role="status"><ul data-notify-list>')
        .replace("</ul>", "</ul></div>").replace(/<p data-notify-status[\s\S]*?<\/p>/, ""),
      markup.replace("<ul data-notify-list>", '<ul data-notify-list aria-live="polite">')
    ];
    const failures: { code: string; unchanged: boolean; rebound: boolean }[] = [];
    for (const html of scenarios) {
      document.body.innerHTML = hiddenStyle + html;
      const root = document.querySelector<HTMLElement>("[data-notify]")!;
      const original = root.outerHTML;
      let code = "";
      try { bindNotify(root); } catch (cause) { code = (cause as { code: string }).code; }
      const unchanged = original === root.outerHTML;
      const authored = document.createElement("template");
      authored.innerHTML = markup;
      const authoredRoot = authored.content.firstElementChild!;
      for (const attribute of [...root.attributes]) root.removeAttribute(attribute.name);
      for (const attribute of [...authoredRoot.attributes]) root.setAttribute(attribute.name, attribute.value);
      root.innerHTML = authoredRoot.innerHTML;
      const handle = bindNotify(root);
      const dismiss = handle.show("Rebound");
      const rebound = root.querySelector("[data-notify-message]")?.textContent === "Rebound";
      dismiss();
      handle.dispose();
      failures.push({ code, unchanged, rebound });
    }
    document.body.innerHTML = hiddenStyle + '<h2 id="shared-heading">External</h2>' +
      markup.replace('aria-label="Notifications"', 'id="shared-heading" aria-label="Notifications"');
    const root = document.querySelector<HTMLElement>("[data-notify]")!;
    const original = root.outerHTML;
    let duplicate = "";
    try { bindNotify(root); } catch (cause) { duplicate = (cause as { code: string }).code; }
    return { failures, duplicate, duplicateAtomic: original === root.outerHTML };
  }, { notify, markup, hiddenStyle });
  expect(result).toEqual({ failures: ["NOTIFY_NAME", "NOTIFY_NAME", "DUPLICATE_ID", "NOTIFY_MARKUP", "NOTIFY_MARKUP", "NOTIFY_MARKUP",
    "NOTIFY_NAME", "NOTIFY_MARKUP", "NOTIFY_MARKUP", "NOTIFY_MARKUP", "NOTIFY_MARKUP", "NOTIFY_MARKUP"]
    .map(code => ({ code, unchanged: true, rebound: true })), duplicate: "DUPLICATE_ID", duplicateAtomic: true });
});

test("invalid show arguments remain atomic and disposal releases ownership and returned dismissals", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ notify, markup, hiddenStyle }) => {
    const { bindNotify } = await import(notify);
    document.body.innerHTML = hiddenStyle + markup;
    const root = document.querySelector<HTMLElement>("[data-notify]")!;
    const handle = bindNotify(root);
    const dismiss = handle.show("Retained");
    const stable = root.outerHTML;
    const failures: string[] = [];
    for (const [message, options] of [["", {}], ["   ", {}], [false, {}], ["Good", null], ["Good", []], ["Good", { urgent: "yes" }]]) {
      try { handle.show(message, options); } catch (cause) { failures.push((cause as { code: string }).code); }
    }
    const atomic = root.outerHTML === stable;
    let owned = "";
    try { bindNotify(root); } catch (cause) { owned = (cause as { code: string }).code; }
    handle.dispose();
    dismiss();
    handle.dispose();
    const after = root.outerHTML;
    const disposed: string[] = [];
    for (const run of [() => handle.show("Late"), () => handle.clear()]) {
      try { run(); } catch (cause) { disposed.push((cause as { code: string }).code); }
    }
    const again = bindNotify(root);
    root.querySelector<HTMLButtonElement>("[data-notify-close]")?.click();
    const rebindDismiss = again.show("Rebound");
    const rebound = root.querySelectorAll("[data-notify-list] > li").length === 1;
    rebindDismiss();
    again.dispose();
    return { failures, atomic, owned, disposed, rebound, restored: root.outerHTML === after };
  }, { notify, markup, hiddenStyle });
  expect(result).toEqual({ failures: Array(6).fill("NOTIFY_MESSAGE"), atomic: true, owned: "NOTIFY_OWNED",
    disposed: ["NOTIFY_DISPOSED", "NOTIFY_DISPOSED"], rebound: true, restored: true });
});

test("an authored notification without close controls is dismissed through its returned function", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ notify, hiddenStyle }) => {
    const { bindNotify } = await import(notify);
    document.body.innerHTML = `${hiddenStyle}<h2 id="notice-heading">Updates</h2>
      <section data-notify aria-labelledby="notice-heading"><ol data-notify-list><li data-notify-template>
      <span data-notify-message></span></li></ol><p data-notify-status role="status" class="sr-only"></p>
      <p data-notify-alert role="alert" class="sr-only"></p></section>`;
    const root = document.querySelector<HTMLElement>("[data-notify]")!;
    const handle = bindNotify(root);
    const dismiss = handle.show("Complete");
    const shown = root.querySelector("[data-notify-message]")!.textContent;
    dismiss();
    dismiss();
    const cleared = root.querySelectorAll("[data-notify-list] > li").length === 0;
    handle.dispose();
    return { shown, cleared };
  }, { notify, hiddenStyle });
  expect(result).toEqual({ shown: "Complete", cleared: true });
});

test("notification insertion and dismissal pass automated A and AA checks", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async ({ notify, markup, hiddenStyle }) => {
    const { bindNotify } = await import(notify);
    document.body.innerHTML = `<main><h1>Messages</h1>${hiddenStyle}${markup}</main>`;
    const root = document.querySelector<HTMLElement>("[data-notify]")!;
    const handle = bindNotify(root);
    Object.assign(window, { accessibleNotify: handle });
  }, { notify, markup, hiddenStyle });
  const analyze = () => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect((await analyze()).violations).toEqual([]);
  await page.evaluate(() => {
    const handle = Reflect.get(window, "accessibleNotify");
    handle.show("Saved");
    handle.show("Connection failed", { urgent: true });
  });
  expect((await analyze()).violations).toEqual([]);
  await page.locator("[data-notify-close]").first().focus();
  await page.keyboard.press("Enter");
  expect((await analyze()).violations).toEqual([]);
  await page.evaluate(() => Reflect.get(window, "accessibleNotify").dispose());
});
