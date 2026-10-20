// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

declare global {
  interface Window { fieldRendering: typeof import("../../src/ui/field-render.js"); }
}
const moduleUrl = `/@fs/${fileURLToPath(new URL("../../src/ui/field-render.ts", import.meta.url)).replaceAll("\\", "/")}`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async url => { window.fieldRendering = await import(url); }, moduleUrl);
});

test("renderer declarations use only own functions, including a field named toString", async ({ page }) => {
  const result = await page.evaluate(() => {
    const f = window.fieldRendering;
    const root = document.createElement("div"); root.innerHTML = '<span data-field="summary">Initial</span><span data-field="toString">Own</span>';
    document.body.append(root);
    const targets = [...root.querySelectorAll<HTMLElement>("[data-field]")].map(element => ({ name: element.dataset.field!, element }));
    let inheritedReads = 0;
    const prototype = Object.defineProperty({}, "summary", { get() { inheritedReads++; throw new Error("Inherited renderer ran."); } });
    const render = Object.create(prototype);
    render.toString = (value: unknown) => `Own ${value}`;
    const configured = f.fieldRenderers("bindForm", targets, render);
    f.renderField("bindForm", targets[1].element, "value", { field: "toString", values: {}, rowId: null }, configured.get("toString")!);
    return { keys: [...configured.keys()], inheritedReads, text: root.textContent,
      defaultSize: f.fieldRenderers("bindGrid", targets).size };
  });
  expect(result).toEqual({ keys: ["toString"], inheritedReads: 0, text: "InitialOwn value", defaultSize: 0 });
});

test("configuration rejects ambiguous fields and owned native content before mutation or execution", async ({ page }) => {
  const result = await page.evaluate(() => {
    const f = window.fieldRendering;
    const markup = ['<input data-field="summary">', '<select data-field="summary"><option>Original</option></select>',
      '<textarea data-field="summary">Original</textarea>', '<img data-field="summary" alt="Original">',
      '<span data-field="summary" data-format="[]">Original</span>', '<span data-field="summary"><b data-field="other">Original</b></span>',
      '<span data-field="summary"><output data-error-for="other">Original</output></span>',
      '<span data-field="summary"><input aria-label="Owned control"></span>',
      '<span data-field="summary"><button type="button" data-row-action="inspect">Original</button></span>',
      '<span data-field="summary" contenteditable="true">Original</span>',
      '<span data-field="summary"><span contenteditable="true">Original</span></span>',
      '<span data-field="summary"><iframe title="Owned frame"></iframe></span>',
      '<span data-field="summary"><video controls></video></span>',
      '<span data-field="summary"><a href="#owned">Owned link</a></span>'];
    let calls = 0;
    const renderer = () => { calls++; return "Rendered"; };
    const attempts = markup.map(html => {
      const root = document.createElement("div"); root.innerHTML = html; document.body.append(root); const element = root.firstElementChild as HTMLElement;
      const before = root.innerHTML; let code = "none";
      try { f.fieldRenderers("bindGrid", [{ name: "summary", element }], { summary: renderer }); }
      catch (cause) { code = (cause as { code: string }).code; }
      return { code, unchanged: root.innerHTML === before };
    });
    const element = document.createElement("span"); element.textContent = "Original";
    const invalid = [null, [], { missing: renderer }, { summary: false }];
    for (const configuration of invalid) {
      try { f.fieldRenderers("bindGrid", [{ name: "summary", element }], configuration as never); attempts.push({ code: "none", unchanged: false }); }
      catch (cause) { attempts.push({ code: (cause as { code: string }).code, unchanged: element.textContent === "Original" }); }
    }
    try { f.fieldRenderers("bindForm", [{ name: "summary", element }, { name: "summary", element }], { summary: renderer }); attempts.push({ code: "none", unchanged: false }); }
    catch (cause) { attempts.push({ code: (cause as { code: string }).code, unchanged: element.textContent === "Original" }); }
    return { attempts, calls };
  });
  expect(result.calls).toBe(0);
  expect(result.attempts).toEqual(Array.from({ length: 19 }, () => ({ code: "UI_RENDER", unchanged: true })));
});

test("rendered strings remain text while fresh native nodes, fragments and null replace content", async ({ page }) => {
  const result = await page.evaluate(() => {
    const { renderField } = window.fieldRendering;
    const element = document.createElement("span"); element.className = "authored"; element.setAttribute("aria-label", "Summary");
    document.body.append(element);
    const value = { label: "Raw" }; const context = { field: "summary", values: { summary: value }, rowId: 3, element };
    let sameContext = false;
    renderField("bindGrid", element, value, context, (raw, provided) => {
      sameContext = raw === value && provided === context && provided.element === element;
      return '<b data-untrusted="">Literal</b>';
    });
    const text = { value: element.textContent, elements: element.children.length };
    const strong = document.createElement("strong"); strong.textContent = "Strong";
    renderField("bindGrid", element, value, context, () => strong);
    const sameNode = element.firstChild === strong;
    const fragment = document.createDocumentFragment(); const small = document.createElement("small"); small.textContent = "Small";
    fragment.append(small, document.createTextNode(" text"));
    renderField("bindGrid", element, value, context, () => fragment);
    const fragmented = { text: element.textContent, same: element.firstChild === small, consumed: fragment.childNodes.length === 0 };
    renderField("bindGrid", element, value, context, () => document.createTextNode("Text node"));
    const nativeText = element.textContent;
    renderField("bindGrid", element, value, context, () => null);
    return { sameContext, text, sameNode, fragmented, nativeText, children: element.childNodes.length,
      className: element.className, label: element.getAttribute("aria-label") };
  });
  expect(result).toEqual({ sameContext: true, text: { value: '<b data-untrusted="">Literal</b>', elements: 0 }, sameNode: true,
    fragmented: { text: "Small text", same: true, consumed: true }, nativeText: "Text node", children: 0, className: "authored", label: "Summary" });
});

test("invalid ownership and async returns preserve field content without unhandled rejections", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { renderField } = window.fieldRendering;
    const element = document.createElement("span"); element.textContent = "Initial"; document.body.append(element);
    const attached = document.createElement("b"); attached.textContent = "Owned"; document.body.append(attached);
    const parent = document.createElement("div"); const child = document.createElement("b"); parent.append(child);
    const other = document.implementation.createHTMLDocument("Other").createElement("b");
    let unhandled = 0; const onUnhandled = () => { unhandled++; }; window.addEventListener("unhandledrejection", onUnhandled);
    const invalid = [undefined, 42, {}, document.createComment("Not display content"), attached, child, other, element, document.body,
      Promise.resolve("Asynchronous"), Promise.reject(new Error("Unsupported asynchronous failure"))];
    const errors = invalid.map(output => {
      let code = "none"; let api = ""; let field = "";
      try { renderField("bindGrid", element, null, { field: "summary", values: {}, rowId: 1, element }, () => output as never); }
      catch (cause) { ({ code, api, detail: { field } } = cause as { code: string; api: string; detail: { field: string } }); }
      return { code, api, field, unchanged: element.textContent === "Initial" };
    });
    await new Promise(resolve => setTimeout(resolve, 0)); window.removeEventListener("unhandledrejection", onUnhandled);
    return { errors, unhandled, attached: attached.isConnected, retained: child.parentNode === parent };
  });
  expect(result.errors).toEqual(Array.from({ length: 11 }, () => ({ code: "UI_RENDER", api: "bindGrid", field: "summary", unchanged: true })));
  expect(result).toMatchObject({ unhandled: 0, attached: true, retained: true });
});

test("factory exceptions and same-target reentry stay structured, release their guard and allow independent targets", async ({ page }) => {
  const result = await page.evaluate(() => {
    const { renderField } = window.fieldRendering;
    const element = document.createElement("span"); element.textContent = "Initial"; document.body.append(element);
    const context = { field: "summary", values: {}, rowId: null, element };
    const failure = new Error("Factory failed"); let preserved = false;
    try { renderField("bindForm", element, null, context, () => { throw failure; }); }
    catch (cause) { preserved = (cause as Error).cause === failure && (cause as { code: string }).code === "UI_RENDER"; }
    let code = "none"; let nested = "none";
    try { renderField("bindForm", element, null, context, () => { renderField("bindForm", element, null, context, () => "Inner"); return "Outer"; }); }
    catch (cause) { code = (cause as { code: string }).code; nested = ((cause as Error).cause as { code: string }).code; }
    const unchanged = element.textContent === "Initial";
    const other = document.createElement("span"); document.body.append(other);
    renderField("bindForm", element, null, context, () => {
      renderField("bindForm", other, null, { ...context, field: "other", element: other }, () => "Other");
      return "Retry";
    });
    return { preserved, code, nested, unchanged, retry: element.textContent, other: other.textContent };
  });
  expect(result).toEqual({ preserved: true, code: "UI_RENDER", nested: "UI_RENDER", unchanged: true, retry: "Retry", other: "Other" });
});

test("local Form renders from raw values, refreshes dependent display and restores authored nodes", async ({ page }) => {
  const result = await page.evaluate(async url => {
    const { bindForm, bindSelect } = await import(url) as typeof import("../../src/ui/index.js");
    const root = document.createElement("form");
    root.innerHTML = `<input data-field="name" value="Ada" aria-label="Name"><span data-field="summary" data-validate='[["raw"]]'><b>Raw</b></span><select data-field="choice" aria-label="Choice"><option value="a">A</option></select>`;
    document.body.append(root);
    const summary = root.querySelector<HTMLElement>("[data-field=summary]")!;
    const original = summary.firstChild;
    let duplicate = "none";
    const render = (value: unknown, context: import("../../src/ui/index.js").RuleContext) => {
      try { bindForm(root); } catch (cause) { duplicate = (cause as { code: string }).code; }
      return `${value}: ${context.values.name}`;
    };
    const rules = { validate: { raw: (value: unknown) => value === "Raw" || "Expected raw value." } };
    const form = bindForm(root, { render: { summary: render }, rules });
    const initial = summary.textContent;
    const input = root.querySelector("input")!;
    input.value = "Grace"; input.dispatchEvent(new Event("input", { bubbles: true }));
    const changed = summary.textContent;
    const raw = form.read(); const valid = form.validate().valid;
    form.dispose();
    const restored = summary.firstChild === original;
    const before = root.innerHTML;
    let code = "none";
    try { bindForm(root, { rules, render: { summary: () => { throw new Error("Failed factory"); } } }); }
    catch (cause) { code = (cause as { code: string }).code; }
    const unchanged = root.innerHTML === before;
    const select = bindSelect(root.querySelector("select")!, { choices: [{ value: "b", label: "B" }] });
    const released = select.value(); select.dispose();
    const retry = bindForm(root, { rules }); retry.dispose();
    return { initial, changed, raw, valid, restored, code, unchanged, released, duplicate };
  }, moduleUrl.replace("field-render.ts", "index.ts"));
  expect(result).toEqual({ initial: "Raw: Ada", changed: "Raw: Grace", raw: { name: "Grace", summary: "Raw", choice: "a" },
    valid: true, restored: true, code: "UI_RENDER", unchanged: true, released: "a", duplicate: "FORM_IN_USE" });
});
