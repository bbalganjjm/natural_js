// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RuleSet } from "../../src/ui/index.js";

type Api = Pick<typeof import("../../src/ui/list.js"), "bindList"> & Pick<typeof import("../../src/data/index.js"), "createRows">;
declare global { interface Window { richListFixture: { api: Api; root(markup?: string): HTMLUListElement; code(run: () => unknown): string }; } }
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { list: source("../../src/ui/list.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindList }, { createRows }] = await Promise.all([import(modules.list), import(modules.data)]);
    window.richListFixture = { api: { bindList, createRows },
      root(markup = '<li data-row-template><span data-field="title">Captured title</span><div data-field="rich">Captured rich</div><img data-field="photo" alt="Employee photo"><output data-error-for="rich"></output></li>') {
        const root = document.createElement("ul"); root.innerHTML = markup; document.body.append(root); return root;
      },
      code(run) { try { run(); return ""; } catch (cause) { return (cause as { code?: string }).code ?? "unexpected"; } }
    };
  }, modules);
});

test("List renders explicit nodes text and null while preserving nested raw values authored image semantics and row identity", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.richListFixture, root = h.root(), original = root.firstElementChild;
    const image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E';
    const rows = h.api.createRows([{ title: "<em>A</em>", rich: { text: "<b>Raw A</b>" }, photo: image },
      { title: "B", rich: { text: "Raw B" }, photo: null }]);
    const before = JSON.stringify(rows.entries().map(row => row.value));
    const contexts: { id: number | null; field: string; tag: string }[] = [];
    let mode: "node" | "text" | "empty" = "node";
    const list = h.api.bindList(root, { rows, render: { rich(value, context) {
      contexts.push({ id: context.rowId, field: context.field, tag: context.element!.tagName });
      if (mode === "empty") return null;
      if (mode === "text") return "<i>Text only</i>";
      const strong = document.createElement("strong"); strong.textContent = value && typeof value === "object" && "text" in value ? String(value.text) : ""; return strong;
    } } });
    const initial = { texts: [...root.querySelectorAll("strong")].map(node => node.textContent), title: root.querySelector('[data-field="title"]')!.textContent,
      injected: root.querySelectorAll("em,b").length, photos: [...root.querySelectorAll("img")].map(img => [img.getAttribute("src"), img.alt]) };
    list.setSort((a, b) => b.title.localeCompare(a.title)); list.setPage({ page: 1, size: 1 });
    const paged = root.querySelector("strong")!.textContent;
    mode = "text"; list.refresh(); const text = { value: root.querySelector('[data-field="rich"]')!.textContent, tags: root.querySelectorAll("i").length };
    mode = "empty"; list.refresh(); const empty = root.querySelector('[data-field="rich"]')!.childNodes.length;
    const unchanged = JSON.stringify(rows.entries().map(row => row.value)) === before;
    const ids = rows.entries().map(row => row.id), states = rows.entries().map(row => row.status);
    list.dispose();
    return { initial, paged, text, empty, unchanged, states, contexts: contexts.every(ctx => ids.includes(ctx.id!) && ctx.field === "rich" && ctx.tag === "DIV"), restored: root.firstElementChild === original };
  });
  expect(result.initial).toEqual({ texts: ["<b>Raw A</b>", "Raw B"], title: "<em>A</em>", injected: 0,
    photos: [['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E', "Employee photo"], [null, "Employee photo"]] });
  expect(result.paged).toBe("Raw B"); expect(result.text).toEqual({ value: "<i>Text only</i>", tags: 0 });
  expect(result.empty).toBe(0); expect(result.unchanged).toBe(true); expect(result.states).toEqual(["clean", "clean"]);
  expect(result.contexts).toBe(true); expect(result.restored).toBe(true);
});

test("List rejects renderer ownership conflicts before replacing the authored template", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.richListFixture;
    return [
      '<input data-field="rich">',
      '<div data-field="rich" data-format=\'[["upper"]]\'></div>',
      '<div data-field="rich"><button>Action</button></div>',
      '<div data-field="rich" data-error-for="rich"></div>',
      '<div data-field="rich"></div><span data-field="rich"></span>',
      '<span data-field="title"></span>'
    ].map(markup => {
      const root = h.root('<li data-row-template>' + markup + '</li>'), template = root.firstElementChild;
      const rows = h.api.createRows([{ rich: "A", title: "A" }]);
      const code = h.code(() => h.api.bindList(root, { rows, render: { rich: value => String(value) }, rules: { format: { upper: value => String(value).toUpperCase() } } }));
      return { code, template: root.firstElementChild === template, untouched: root.children.length === 1, raw: rows.entries()[0].value.rich };
    });
  });
  expect(result).toEqual(Array.from({ length: 6 }, () => ({ code: "UI_RENDER", template: true, untouched: true, raw: "A" })));
});

test("List rule refresh rejects a new formatter on a render target and retains the accepted renderer and raw source", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.richListFixture, root = h.root(), rows = h.api.createRows([{ title: "A", rich: "Raw", photo: null }]);
    const fields: NonNullable<RuleSet["fields"]> = {}; let formats = 0, renders = 0;
    const list = h.api.bindList(root, { rows, rules: { fields, format: { upper: value => { formats++; return String(value).toUpperCase(); } } },
      render: { rich: value => { renders++; const b = document.createElement("b"); b.textContent = String(value); return b; } } });
    const node = root.querySelector("b"); fields.rich = { format: [["upper"]] };
    const code = h.code(() => list.refresh()), held = root.querySelector("b") === node, before = renders;
    fields.rich = { format: [] }; list.refresh(); const retry = root.querySelector("b")!.textContent;
    const raw = rows.entries()[0].value.rich; list.dispose(); return { code, held, before, renders, formats, retry, raw };
  });
  expect(result.code).toBe("UI_RENDER"); expect(result.held).toBe(true); expect(result.before).toBe(1);
  expect(result.formats).toBe(0); expect(result.renders).toBeGreaterThan(1); expect(result.retry).toBe("Raw"); expect(result.raw).toBe("Raw");
});

test("List renderer reentry and disposal cannot publish an older node or overwrite newer row metadata", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.richListFixture, root = h.root(), template = root.firstElementChild;
    const rows = h.api.createRows([{ title: "A", rich: "initial", photo: null }]), id = rows.entries()[0].id;
    let mode = "normal", calls = 0;
    const list = h.api.bindList(root, { rows, render: { rich(value) {
      calls++;
      if (mode === "reenter") { mode = "normal"; rows.set(id, "rich", "newer"); }
      if (mode === "dispose") list.dispose();
      const strong = document.createElement("strong"); strong.textContent = String(value); return strong;
    } } });
    mode = "reenter"; const reentry = h.code(() => rows.set(id, "rich", "older")); const shown = root.querySelector("strong")!.textContent;
    const count = calls; list.refresh(); const after = root.querySelector("strong")!.textContent, refreshed = calls > count;
    mode = "dispose"; const disposal = h.code(() => rows.set(id, "rich", "disposed")); const disposedCount = calls;
    rows.set(id, "rich", "later");
    return { shown, after, refreshed, reentry, disposal, noLate: calls === disposedCount, restored: root.firstElementChild === template, stale: root.querySelectorAll("strong").length, raw: rows.get(id)!.value.rich };
  });
  expect(result).toEqual({ shown: "newer", after: "newer", refreshed: true, reentry: "LIST_BIND_STALE", disposal: "LIST_DISPOSED", noLate: true, restored: true, stale: 0, raw: "later" });
});

test("List preserves old rendered content on invalid results and supports explicit correction without reverting committed source", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.richListFixture, results: { code: string; kept: boolean; committed: string; retry: string }[] = [];
    for (const kind of ["connected", "foreign", "promise"]) {
      const root = h.root(), rows = h.api.createRows([{ title: "A", rich: "good", photo: null }]), id = rows.entries()[0].id;
      let invalid = false;
      const list = h.api.bindList(root, { rows, render: { rich(value) {
        if (invalid) {
          const result = kind === "promise" ? Promise.reject(new Error("Rejected renderer")) : kind === "foreign"
            ? document.implementation.createHTMLDocument().createElement("span") : document.body.appendChild(document.createElement("span"));
          return result as Node;
        }
        const span = document.createElement("span"); span.textContent = String(value); return span;
      } } });
      const before = root.querySelector('[data-field="rich"]')!.firstChild; invalid = true;
      const code = h.code(() => rows.set(id, "rich", kind)), kept = root.querySelector('[data-field="rich"]')!.firstChild === before;
      const committed = rows.get(id)!.value.rich; invalid = false; list.refresh(); const retry = root.querySelector('[data-field="rich"]')!.textContent!;
      results.push({ code, kept, committed, retry }); list.dispose();
    }
    return results;
  });
  expect(result).toEqual(["connected", "foreign", "promise"].map(kind => ({ code: "UI_RENDER", kept: true, committed: kind, retry: kind })));
});

test("two Lists share raw updates with independent renderers and current source/value contexts", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.richListFixture, a = h.root(), b = h.root(), rows = h.api.createRows([{ title: "A", rich: "raw", photo: null }]);
    const id = rows.entries()[0].id, pairs: { before: unknown; after: unknown }[] = [], values: string[] = [];
    const left = h.api.bindList(a, { rows, beforeSourceBind(_value, ctx) { pairs.push({ before: ctx, after: null }); },
      onSourceBind(_value, ctx) { pairs[pairs.length - 1].after = ctx; },
      beforeBindValue(value, ctx) { if (ctx.field === "rich") { values.push(String(value)); return String(value).toUpperCase(); } },
      render: { rich(value) { const strong = document.createElement("strong"); strong.textContent = String(value); return strong; } } });
    const right = h.api.bindList(b, { rows, render: { rich: value => "Right: " + String(value) } });
    rows.set(id, "rich", "next");
    const shown = [a.querySelector("strong")!.textContent, b.querySelector('[data-field="rich"]')!.textContent];
    const same = pairs.every(pair => pair.before === pair.after && Object.isFrozen(pair.before));
    const raw = rows.get(id)!.value.rich; left.dispose(); rows.set(id, "rich", "last");
    const independent = b.querySelector('[data-field="rich"]')!.textContent; right.dispose();
    return { shown, same, raw, values, independent };
  });
  expect(result.shown).toEqual(["NEXT", "Right: next"]); expect(result.same).toBe(true); expect(result.raw).toBe("next");
  expect(result.values).toEqual(["raw", "next"]); expect(result.independent).toBe("Right: last");
});

test("an older List renderer cannot release the newer same-row hook resources", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.richListFixture, root = h.root('<li data-row-template><button type="button">Observe</button><div data-field="rich"></div></li>');
    const rows = h.api.createRows([{ rich: "initial" }]), id = rows.entries()[0].id;
    const released: string[] = [], clicked: string[] = []; let reenter = false;
    const list = h.api.bindList(root, { rows,
      onRowBind(context) {
        const value = context.row.value.rich, button = context.elements[0].querySelector("button")!;
        const listener = () => clicked.push(value); button.addEventListener("click", listener);
        context.own(() => { released.push(value); button.removeEventListener("click", listener); });
      },
      render: { rich(value) {
        if (reenter) { reenter = false; rows.set(id, "rich", "newer"); }
        const span = document.createElement("span"); span.textContent = String(value); return span;
      } }
    });
    reenter = true; const code = h.code(() => rows.set(id, "rich", "older"));
    root.querySelector("button")!.click();
    const shown = root.querySelector('[data-field="rich"]')!.textContent;
    const held = released.filter(value => value === "newer").length;
    list.dispose(); return { code, shown, clicked, held, releasedNewer: released.filter(value => value === "newer").length };
  });
  expect(result).toEqual({ code: "LIST_BIND_STALE", shown: "newer", clicked: ["newer"], held: 0, releasedNewer: 1 });
});
