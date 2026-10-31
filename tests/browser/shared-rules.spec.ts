// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows } from "../../src/data/index.js";
import type { RuleSet } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindGrid } from "../../src/ui/grid.js";
import type { bindList } from "../../src/ui/list.js";
import type { bindTree } from "../../src/ui/tree.js";

type Item = { profile: { name: string }; salary: number; choice: string | null; key: string; parent: string | null };
type Api = { bindForm: typeof bindForm; bindGrid: typeof bindGrid; bindList: typeof bindList; bindTree: typeof bindTree };
declare global {
  interface Window {
    sharedFields: {
      api: Api; rows: Rows<Item>; ids: readonly number[]; handles: { dispose(): void }[];
      add<K extends keyof HTMLElementTagNameMap>(tag: K, html: string): HTMLElementTagNameMap[K];
      form(html: string, rules?: RuleSet): { root: HTMLFormElement; handle: ReturnType<typeof bindForm<Item>> };
      grid(html: string, rules?: RuleSet): { root: HTMLTableElement; handle: ReturnType<typeof bindGrid<Item>> };
      list(html: string, rules?: RuleSet): { root: HTMLUListElement; handle: ReturnType<typeof bindList<Item>> };
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { form: source("../../src/ui/form.ts"), grid: source("../../src/ui/grid.ts"),
  list: source("../../src/ui/list.ts"), tree: source("../../src/ui/tree.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async modules => {
    const [form, grid, list, tree, { createRows }] = await Promise.all([
      import(modules.form), import(modules.grid), import(modules.list), import(modules.tree), import(modules.data)
    ]);
    const rows: Rows<Item> = createRows([
      { profile: { name: "Ada" }, salary: 1200, choice: "a", key: "ada", parent: null },
      { profile: { name: "Bea" }, salary: 2400, choice: "b", key: "bea", parent: null },
      { profile: { name: "Cy" }, salary: 3600, choice: "a", key: "cy", parent: null }
    ]);
    const h: Window["sharedFields"] = {
      api: { ...form, ...grid, ...list, ...tree }, rows, ids: rows.entries().map(row => row.id), handles: [],
      add(tag, html) { const root = document.createElement(tag); root.innerHTML = html; document.body.append(root); return root; },
      form(html, rules) {
        const root = h.add("form", html), handle = h.api.bindForm(root, { rows, rules, parse: { salary: Number } });
        h.handles.push(handle); handle.bind(h.ids[0]); return { root, handle };
      },
      grid(html, rules) {
        const root = h.add("table", `<caption>Shared fields</caption><thead><tr><th scope="col">Record</th></tr></thead><tbody><tr data-row-template><td>${html}</td></tr></tbody>`);
        const handle = h.api.bindGrid(root, { rows, rules, parse: { salary: Number } });
        h.handles.push(handle); return { root, handle };
      },
      list(html, rules) {
        const root = h.add("ul", `<li data-row-template>${html}</li>`), handle = h.api.bindList(root, { rows, rules });
        h.handles.push(handle); return { root, handle };
      }
    };
    window.sharedFields = h;
  }, modules);
});

test("one typed field bundle formats Form Grid and List without rule attributes or raw-value mutation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sharedFields;
    const rules: RuleSet = { fields: { "profile.name": { format: [["upper"]] }, salary: { format: [["commas"]] } } };
    const html = '<span data-field="profile.name"></span><span data-field="salary"></span>';
    const owners = [h.form(html, rules), h.grid(html, rules), h.list(html, rules)];
    return { displays: owners.map(({ root }) => [...root.querySelectorAll('[data-field]')].slice(0, 2).map(element => element.textContent)),
      raw: h.rows.get(h.ids[0])!.value, changed: h.rows.changes().length,
      attributes: owners.some(({ root }) => root.querySelector('[data-format], [data-validate]') !== null) };
  });
  expect(result).toEqual({ displays: [["ADA", "1,200"], ["ADA", "1,200"], ["ADA", "1,200"]],
    raw: { profile: { name: "Ada" }, salary: 1200, choice: "a", key: "ada", parent: null }, changed: 0, attributes: false });
});

test("typed kinds override ignored HTML while undefined falls back and empty lists retain native constraints", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sharedFields;
    const first = h.form('<label>Name <input data-field="profile.name" required data-format="broken" data-validate="broken"></label><output data-error-for="profile.name"></output>',
      { fields: { "profile.name": { format: [["upper"]], validate: [] } } });
    const second = h.form('<span data-field="profile.name" data-format=\'[["lower"]]\'></span>',
      { fields: { "profile.name": { format: undefined, validate: [] } } });
    const input = first.root.querySelector("input")!;
    input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true }));
    return { fallback: second.root.querySelector("span")!.textContent, raw: h.rows.get(h.ids[0])!.value.profile.name,
      html: first.handle.validate().issues.map(issue => issue.rule), invalid: input.getAttribute("aria-invalid"),
      untouched: input.getAttribute("data-format") === "broken" && input.getAttribute("data-validate") === "broken" };
  });
  expect(result).toEqual({ fallback: "ada", raw: "Ada", html: ["html"], invalid: "true", untouched: true });
});

test("explicit nested composition preserves shared formatters and local messages across full and reduced templates", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sharedFields;
    const shared: RuleSet = { locale: "ko_KR", format: { suffix: value => `${value} units` },
      validate: { limit: value => Number(value) < 100 }, messages: { limit: "Shared limit" },
      fields: { salary: { format: [["suffix"]], validate: [["limit"]] }, "profile.name": { format: [["upper"]] } } };
    const local: RuleSet = { ...shared, validate: { ...shared.validate, limit: value => Number(value) < 2000 },
      messages: { ...shared.messages, limit: "Local limit" }, fields: { ...shared.fields,
        salary: { ...shared.fields?.salary, validate: [["limit"]] } } };
    const full = h.form('<span data-field="profile.name"></span><label>Salary <input data-field="salary"></label>', local);
    const reduced = h.form('<span data-field="profile.name"></span>', local);
    const original = h.form('<label>Salary <input data-field="salary"></label>', shared);
    const input = full.root.querySelector("input")!; input.focus(); input.value = "2500";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return { reduced: reduced.root.querySelector("span")!.textContent, local: full.handle.validate().issues.map(issue => issue.message),
      shared: original.handle.validate().issues.map(issue => issue.message), raw: h.rows.get(h.ids[0])!.value.salary,
      authoredFormat: original.root.querySelector("input")!.value, unchanged: shared.messages?.limit === "Shared limit" };
  });
  expect(result).toEqual({ reduced: "ADA", local: ["Local limit"], shared: ["Shared limit"], raw: 1200,
    authoredFormat: "1200 units", unchanged: true });
});

test("rule compilation copies tuple containers and uses own field entries without serializing custom arguments", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sharedFields;
    const argument = { suffix: "!" }, call: [string, ...unknown[]] = ["append", argument];
    const inherited = { "profile.name": { format: [["missing"]] } };
    const fields = Object.assign(Object.create(inherited), { salary: { format: [call] }, unused: { validate: [["required"]] } });
    const rules: RuleSet = { fields, format: { append: (value, args) => `${value}${(args[0] as typeof argument).suffix}` } };
    const owner = h.form('<span data-field="profile.name"></span><span data-field="salary"></span>', rules);
    call[0] = "missing"; call.push("later"); fields.salary.format.push(["missing"]);
    argument.suffix = "?"; h.rows.set(h.ids[0], "salary", 1300);
    return { name: owner.root.querySelector('[data-field="profile.name"]')!.textContent,
      salary: owner.root.querySelector('[data-field="salary"]')!.textContent,
      attribute: owner.root.querySelector('[data-field="salary"]')!.getAttribute("data-format"),
      source: fields.salary.format.length };
  });
  expect(result).toEqual({ name: "Ada", salary: "1300?", attribute: null, source: 2 });
});

test("invalid unbound typed declarations fail every binder before ownership and permit corrected retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sharedFields;
    const cases: unknown[] = [ { unused: { format: [["missing"]] } }, { unused: { validate: [["minvalue", "bad"]] } },
      { "profile.__proto__.name": { format: [] } }, { unused: { format: "not a list" } } ];
    const failures: { code: string; clean: boolean; retry: boolean }[] = [];
    for (const kind of ["form", "grid", "list", "tree"] as const) for (const fields of cases) {
      const root = kind === "form" ? h.add("form", '<span data-field="profile.name"></span>') :
        kind === "grid" ? h.add("table", '<tbody><tr data-row-template><td data-field="profile.name"></td></tr></tbody>') :
          h.add("ul", kind === "tree" ? '<li data-row-template><span data-tree-label data-field="profile.name"></span><ul data-tree-children></ul></li>' : '<li data-row-template><span data-field="profile.name"></span></li>');
      if (kind === "tree") root.setAttribute("aria-label", "People");
      const original = root.outerHTML;
      const bind = (rules: RuleSet) => kind === "form" ? h.api.bindForm(root, { rows: h.rows, rules }) :
        kind === "grid" ? h.api.bindGrid(root as HTMLTableElement, { rows: h.rows, rules }) :
          kind === "list" ? h.api.bindList(root as HTMLUListElement, { rows: h.rows, rules }) :
            h.api.bindTree(root as HTMLUListElement, { rows: h.rows, rules, key: row => row.key, parent: row => row.parent });
      let code = "";
      try { bind({ fields } as RuleSet); } catch (cause) { code = (cause as { code: string }).code; }
      const clean = root.outerHTML === original, handle = bind({ fields: { unused: { validate: [["required"]] } } });
      handle.dispose(); failures.push({ code, clean, retry: root.outerHTML === original });
    }
    return failures;
  });
  expect(result).toHaveLength(16);
  expect(result.every(item => item.code !== "" && item.clean && item.retry)).toBe(true);
});

test("effective grouped declarations ignore only overridden kinds and preserve fallback conflict checks", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sharedFields, results: { kind: string; clean: boolean; rejected: boolean; valid: boolean }[] = [];
    for (const kind of ["form", "grid"] as const) {
      const html = '<label>A <input type="checkbox" data-field="choice" value="a" data-validate="broken"></label><label>B <input type="checkbox" data-field="choice" value="b" data-validate=\'[["email"]]\'></label>';
      const root = kind === "form" ? h.add("form", html) : h.add("table", `<tbody><tr data-row-template><td>${html}</td></tr></tbody>`);
      const bind = (rules: RuleSet) => kind === "form" ? h.api.bindForm(root, { rows: h.rows, rules }) : h.api.bindGrid(root as HTMLTableElement, { rows: h.rows, rules });
      const original = root.outerHTML;
      let rejected = false;
      try { bind({ fields: { choice: { format: [] } } }); } catch { rejected = true; }
      const clean = root.outerHTML === original;
      const handle = bind({ fields: { choice: { format: [], validate: [] } } });
      if (kind === "form") (handle as ReturnType<typeof bindForm<Item>>).bind(h.ids[0]);
      const valid = !handle.validate().issues.some(issue => issue.rule === "email");
      handle.dispose(); results.push({ kind, clean, rejected, valid });
    }
    return results;
  });
  expect(result).toEqual(["form", "grid"].map(kind => ({ kind, clean: true, rejected: true, valid: true })));
});

test("programmatic formatters obey native control restrictions and empty overrides clear ignored HTML", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sharedFields, outcomes: boolean[] = [];
    for (const kind of ["form", "grid", "list"] as const) for (const control of [
      '<label>Choice <select data-field="choice"><option value="a">A</option></select></label>',
      '<label>Salary <input type="number" data-field="salary"></label>'
    ]) {
      const field = control.includes("select") ? "choice" : "salary";
      const parse = field === "salary" ? { salary: Number } : undefined;
      const root = kind === "form" ? h.add("form", control) : kind === "grid" ? h.add("table", `<tbody><tr data-row-template><td>${control}</td></tr></tbody>`) : h.add("ul", `<li data-row-template>${control}</li>`);
      const bind = (rules: RuleSet) => kind === "form" ? h.api.bindForm(root, { rows: h.rows, rules, parse }) :
        kind === "grid" ? h.api.bindGrid(root as HTMLTableElement, { rows: h.rows, rules, parse }) : h.api.bindList(root as HTMLUListElement, { rows: h.rows, rules });
      const original = root.outerHTML;
      let rejected = false;
      try { bind({ fields: { [field]: { format: [["upper"]] } } }); } catch { rejected = true; }
      const clean = root.outerHTML === original;
      root.querySelector('[data-field]')!.setAttribute("data-format", "broken");
      const handle = bind({ fields: { [field]: { format: [] } } }); handle.dispose();
      outcomes.push(rejected && clean && root.querySelector('[data-field]')!.getAttribute("data-format") === "broken");
    }
    return outcomes;
  });
  expect(result).toEqual(Array(6).fill(true));
});

test("effective formatting and render ownership remain exclusive without DOM attribute mutation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sharedFields, outcomes: boolean[] = [];
    for (const kind of ["form", "grid"] as const) {
      const root = kind === "form" ? h.add("form", '<span data-field="profile.name">Authored</span>') : h.add("table", '<tbody><tr data-row-template><td><span data-field="profile.name">Authored</span></td></tr></tbody>');
      const original = root.outerHTML, render = { "profile.name": (value: unknown) => `Rendered ${value}` };
      const bind = (rules: RuleSet) => kind === "form" ? h.api.bindForm(root, { rows: h.rows, rules, render }) : h.api.bindGrid(root as HTMLTableElement, { rows: h.rows, rules, render });
      let code = "";
      try { bind({ fields: { "profile.name": { format: [["upper"]] } } }); } catch (cause) { code = (cause as { code: string }).code; }
      const clean = root.outerHTML === original;
      root.querySelector('[data-field]')!.setAttribute("data-format", "broken");
      const handle = bind({ fields: { "profile.name": { format: [] } } });
      if (kind === "form") (handle as ReturnType<typeof bindForm<Item>>).bind(h.ids[0]);
      const rendered = root.querySelector('[data-field]')!.textContent === "Rendered Ada";
      handle.dispose(); outcomes.push(code === "UI_RENDER" && clean && rendered && root.querySelector('[data-field]')!.getAttribute("data-format") === "broken");
    }
    return outcomes;
  });
  expect(result).toEqual([true, true]);
});

test("Tree uses typed display rules and rejects only nonempty effective bound validators", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sharedFields, root = h.add("ul", '<li data-row-template><span data-tree-label data-field="profile.name" data-format="broken" data-validate="broken"></span><ul data-tree-children></ul></li>');
    root.setAttribute("aria-label", "People"); const original = root.outerHTML;
    const bind = (rules: RuleSet) => h.api.bindTree(root, { rows: h.rows, rules, key: row => row.key, parent: row => row.parent });
    let code = "";
    try { bind({ fields: { "profile.name": { format: [["upper"]], validate: [["required"]] } } }); }
    catch (cause) { code = (cause as { code: string }).code; }
    const clean = root.outerHTML === original;
    const handle = bind({ fields: { "profile.name": { format: [["upper"]], validate: [] }, unused: { validate: [["required"]] } } });
    const labels = [...root.querySelectorAll('[data-tree-label]')].map(element => element.textContent);
    handle.dispose();
    return { code, clean, labels, restored: root.outerHTML === original };
  });
  expect(result).toEqual({ code: "TREE_FIELD", clean: true, labels: ["ADA", "BEA", "CY"], restored: true });
});

test("typed validators see current nested raw candidates for hidden Grid and List rows", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sharedFields, seen: { id: number | null; salary: unknown; connected: boolean }[] = [];
    const rules: RuleSet = { fields: { salary: { validate: [["limit"]] } }, validate: { limit: (value, _args, context) => {
      seen.push({ id: context.rowId, salary: context.values.salary, connected: context.element?.isConnected === true });
      return Number(value) <= 2000 || "Salary limit";
    } } };
    const grid = h.grid('<label>Salary <input data-field="salary"></label><output data-error-for="salary"></output>', rules);
    const list = h.list('<span data-field="salary"></span><output data-error-for="salary"></output>', rules);
    grid.handle.setPage({ page: 1, size: 1 }); list.handle.setPage({ page: 1, size: 1 });
    seen.length = 0;
    const gridIssues = grid.handle.validate().issues, listIssues = list.handle.validate().issues;
    return { grid: gridIssues.map(issue => [issue.rowId, issue.field, issue.element === undefined]),
      list: listIssues.map(issue => [issue.rowId, issue.field, issue.element === undefined]),
      hidden: seen.filter(item => item.id !== h.ids[0]).every(item => !item.connected),
      salaries: [...new Set(seen.map(item => item.salary))], raw: h.rows.get(h.ids[2])!.value.salary };
  });
  expect(result).toEqual({ grid: [[2, "salary", true], [3, "salary", true]], list: [[2, "salary", true], [3, "salary", true]],
    hidden: true, salaries: [1200, 2400, 3600], raw: 3600 });
});

test("typed rules keep paste atomic and independent accessible Form instances quiet after disposal", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sharedFields;
    const rules: RuleSet = { fields: { salary: { format: [["commas"]], validate: [["maxvalue", 5000]] } } };
    const html = '<label>Salary <input data-field="salary"></label><output data-error-for="salary"></output>';
    const first = h.form(html, rules), second = h.form(html, rules), grid = h.grid(html, rules);
    const errors = [first, second].map(owner => owner.root.querySelector("output")!);
    const input = first.root.querySelector("input")!; input.focus(); input.value = "6000";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const accessible = input.getAttribute("aria-describedby") === errors[0].id && input.getAttribute("aria-invalid") === "true" && errors[0].id !== errors[1].id;
    const before = h.rows.entries(), failed = grid.handle.paste("4000\n6000", { id: h.ids[0], field: "salary" });
    const atomic = !failed.valid && h.rows.entries() === before;
    const accepted = grid.handle.paste("4000\n4500", { id: h.ids[0], field: "salary" });
    const shared = second.root.querySelector("input")!.value;
    first.handle.dispose(); second.handle.dispose(); grid.handle.dispose();
    input.value = "9000"; input.dispatchEvent(new Event("input", { bubbles: true }));
    return { accessible, atomic, accepted: accepted.valid, shared, salary: h.rows.get(h.ids[0])!.value.salary,
      restored: errors.every(error => !error.hasAttribute("id") && !error.hasAttribute("aria-live")) && !input.hasAttribute("aria-invalid") && !input.hasAttribute("aria-describedby") };
  });
  expect(result).toEqual({ accessible: true, atomic: true, accepted: true, shared: "4,000", salary: 4000, restored: true });
});
