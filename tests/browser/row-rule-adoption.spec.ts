// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RowId, Rows } from "../../src/data/index.js";
import type { GridHandle, ListHandle, RuleSet } from "../../src/ui/index.js";
import type { RowBinding } from "../../src/ui/grid-hooks.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = { name: string; amount: number; mode: string; chosen: number; choices: { label: string; value: number }[] };
type Kind = "Grid" | "List";
type Binding = RowBinding<Item, HTMLElement>;
interface Owner {
  kind: Kind; root: HTMLTableElement | HTMLUListElement; host: HTMLElement; scroll: HTMLElement;
  template: HTMLElement; amountTemplate: HTMLInputElement; rows: Rows<Item>; rules: RuleSet;
  handle: GridHandle<Item> | ListHandle<Item>; mounted: Map<RowId, HTMLElement>;
  field<E extends HTMLElement = HTMLElement>(id: RowId, name?: string): E;
  settle(): Promise<void>;
}
interface Setup {
  count?: number; rules?: RuleSet; format?: string | null; validate?: string | null;
  track?: boolean; viewport?: boolean; markup?: string;
  before?: (binding: Binding) => void; after?: (binding: Binding) => void;
  source?: Parameters<typeof bindGrid<Item>>[1]["beforeSourceBind"];
  render?: Parameters<typeof bindGrid<Item>>[1]["render"];
}
declare global {
  interface Window {
    rowRuleFixture: { owners: Owner[]; open(kind: Kind, setup?: Setup): Owner; code(run: () => void): string };
  }
}
const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { data: source("../../src/data/index.ts"), grid: source("../../src/ui/grid.ts"), list: source("../../src/ui/list.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ createRows }, { bindGrid }, { bindList }] = await Promise.all([import(modules.data), import(modules.grid), import(modules.list)]);
    const h: Window["rowRuleFixture"] = {
      owners: [],
      code(run) { try { run(); return ""; } catch (cause) { return (cause as { code?: string }).code ?? "unexpected"; } },
      open(kind, setup = {}) {
        const host = document.createElement("section"); host.setAttribute("data-row-rules", "");
        host.innerHTML = '<h2>Explicit row rule adoption</h2><div role="region" aria-label="Row rule records" tabindex="0" style="height:220px;width:700px;overflow:auto"></div>';
        document.body.append(host); const scroll = host.querySelector<HTMLElement>("div")!;
        const root = document.createElement(kind === "Grid" ? "table" : "ul");
        const content = '<button type="button" data-select-row><span data-field="name"></span></button>' +
          '<label>Amount <input aria-label="Amount" data-field="amount" value="4"></label><output data-error-for="amount"></output>' +
          '<label>Choice <select data-field="chosen" data-options="choices" data-option-label="label" data-option-value="value"><option value="">Choose</option></select></label>';
        root.innerHTML = setup.markup ?? (kind === "Grid" ? '<caption>Editable amounts</caption><thead><tr><th scope="col" data-column="record">Record</th></tr></thead><tbody><tr data-row-template><td data-column="record">' + content + '</td></tr></tbody>' : '<li data-row-template>' + content + '</li>');
        scroll.append(root); const template = root.querySelector<HTMLElement>("[data-row-template]")!;
        const amountTemplate = template.querySelector<HTMLInputElement>('[data-field="amount"]')!;
        const format = setup.format === undefined ? '[["tag","html"]]' : setup.format;
        const validate = setup.validate === undefined ? '[["minimum",5]]' : setup.validate;
        if (format !== null) amountTemplate.setAttribute("data-format", format);
        if (validate !== null) amountTemplate.setAttribute("data-validate", validate);
        const rows: Rows<Item> = createRows(Array.from({ length: setup.count ?? 2 }, (_, index) => ({ name: `Record ${index + 1}`, amount: (index + 1) * 10,
          mode: "a", chosen: 1, choices: [{ label: "One", value: 1 }, { label: "Two", value: 2 }] })));
        const mounted = new Map<RowId, HTMLElement>();
        const { format: customFormats, validate: customValidators, ...policy } = setup.rules ?? {};
        const rules: RuleSet = { ...policy, format: { tag: (value, args) => `${value}:${String(args[0])}`, ...customFormats },
          validate: { minimum: (value, args) => Number(value) >= Number(args[0]) || "Too small", ...customValidators } };
        const after = (binding: Binding) => {
          const element = binding.elements[0]; mounted.set(binding.row.id, element);
          binding.own(() => { if (mounted.get(binding.row.id) === element) mounted.delete(binding.row.id); }); setup.after?.(binding);
        };
        const handle = kind === "Grid" ? bindGrid(root as HTMLTableElement, { rows, rules, paste: true,
          parse: { amount: input => { if (!/^-?\d+$/.test(input)) throw new Error("Enter an integer"); return Number(input); } },
          ...(setup.track === false ? {} : { onRowBind: after }), beforeRowBind: setup.before, beforeSourceBind: setup.source,
          render: setup.render, ...(setup.viewport ? { viewport: { root: scroll, estimate: 42, overscan: 0 } } : {}) }) :
          bindList(root as HTMLUListElement, { rows, rules, ...(setup.track === false ? {} : { onRowBind: after }), beforeSourceBind: setup.source });
        const owner: Owner = { kind, root, host, scroll, template, amountTemplate, rows, rules, handle, mounted,
          field<E extends HTMLElement = HTMLElement>(id: RowId, name = "amount"): E {
            const block = mounted.get(id); return (block ?? root).querySelector<E>(`[data-field="${name}"]`)!;
          },
          async settle() { await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
            if ("whenBound" in handle) await handle.whenBound(); }
        };
        h.owners.push(owner); return owner;
      }
    }; window.rowRuleFixture = h;
  }, modules);
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() => { for (const owner of window.rowRuleFixture?.owners ?? []) { owner.handle.dispose(); owner.rows.dispose(); owner.host.remove(); } });
});

for (const kind of ["Grid", "List"] as const) {
  test(`${kind} explicitly adopts each kind from its captured map and keeps sibling owners independent`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.rowRuleFixture, fields: NonNullable<RuleSet["fields"]> = { amount: { format: [["tag", "typed"]], validate: [["minimum", 15]] } };
      const rules: RuleSet = { fields }, first = h.open(kind, { rules }), second = h.open(kind, { rules });
      const original = first.rows.original(1), rows = first.rows.entries(), defaults = "defaults" in first.handle ? JSON.stringify(first.handle.defaults()) : null;
      const initial = [first.field<HTMLInputElement>(1).value, first.handle.validate().issues.map(issue => issue.rowId)];
      first.rules.fields = { amount: { format: [["tag", "outer replacement"]], validate: [] } };
      fields.amount = { format: [], validate: undefined };
      const before = first.field<HTMLInputElement>(1).value; first.handle.refresh(); await first.settle();
      const empty = [first.field<HTMLInputElement>(1).value, first.handle.validate().valid, second.field<HTMLInputElement>(1).value, second.handle.validate().valid];
      delete fields.amount; first.handle.refresh(); await first.settle();
      const fallback = first.field<HTMLInputElement>(1).value; second.handle.refresh(); await second.settle();
      return { initial, before, empty, fallback, sibling: second.field<HTMLInputElement>(1).value,
        quiet: first.rows.entries() === rows && first.rows.original(1) === original && first.rows.changes().length === 0,
        defaults: !("defaults" in first.handle) || JSON.stringify(first.handle.defaults()) === defaults };
    }, kind);
    expect(result).toEqual({ initial: ["10:typed", [1]], before: "10:typed", empty: ["10", true, "10:typed", false],
      fallback: "10:html", sibling: "10:html", quiet: true, defaults: true });
  });

  test(`${kind} preflights malformed fallback before adoption and preserves duplicate issue identity on retry`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.rowRuleFixture, fields: NonNullable<RuleSet["fields"]> = { amount: { validate: [] } }, owner = h.open(kind, { rules: { fields } });
      owner.amountTemplate.setAttribute("data-validate", "invalid JSON"); owner.handle.refresh(); await owner.settle();
      const snapshot = owner.rows.entries(); delete fields.amount;
      const code = h.code(() => owner.handle.refresh()), unchanged = owner.handle.validate().valid;
      owner.amountTemplate.setAttribute("data-validate", '[["minimum",15],["minimum",15]]'); owner.handle.refresh(); await owner.settle();
      const issues = owner.handle.validate(1).issues, element = owner.field(1), error = owner.mounted.get(1)!.querySelector("output")!;
      return { code, unchanged, same: owner.rows.entries() === snapshot, shown: owner.field<HTMLInputElement>(1).value,
        issues: issues.map(issue => [issue.rowId, issue.field, issue.rule, issue.message, issue.element === element]),
        distinct: issues[0] !== issues[1], text: error.textContent, invalid: element.getAttribute("aria-invalid") };
    }, kind);
    expect(result).toEqual({ code: "RULE_DECLARATION", unchanged: true, same: true, shown: "10:html",
      issues: [[1, "amount", "minimum", "Too small", true], [1, "amount", "minimum", "Too small", true]],
      distinct: true, text: "Too small Too small", invalid: "true" });
  });

  test(`${kind} retains explicit row provenance when template text converges and clears it only after a row edit`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const content = '<label>Amount <input aria-label="Amount" data-field="amount" value="4"></label>' +
        '<span data-field="name"></span><span data-field="name" data-format=\'[["tag","secondary"]]\' data-validate="[]"></span><output data-error-for="amount"></output>';
      const markup = kind === "Grid" ? '<caption>Repeated amount descriptors</caption><tbody><tr data-row-template><td>' + content + '</td></tr></tbody>' : '<li data-row-template>' + content + '</li>';
      const owner = window.rowRuleFixture.open(kind, { markup }), own = '[["minimum",50]]'; owner.field(1).setAttribute("data-validate", own);
      const secondary = () => owner.mounted.get(1)!.querySelectorAll('[data-field="name"]')[1];
      secondary().setAttribute("data-format", '[["tag","row-secondary"]]');
      owner.handle.refresh(); await owner.settle(); owner.amountTemplate.setAttribute("data-validate", own); owner.handle.refresh(); await owner.settle();
      owner.amountTemplate.setAttribute("data-validate", '[["minimum",5]]'); owner.handle.refresh(); await owner.settle();
      const retained = owner.handle.validate().issues.map(issue => issue.rowId);
      owner.handle.setPage({ page: 2, size: 1 }); await owner.settle(); owner.handle.setPage({ page: 1, size: 1 }); await owner.settle();
      const remount = [owner.field(1).getAttribute("data-validate"), owner.handle.validate(1).valid];
      owner.field(1).setAttribute("data-validate", '[["minimum",5]]'); owner.handle.refresh(); await owner.settle();
      owner.amountTemplate.setAttribute("data-validate", '[["minimum",30]]'); owner.handle.refresh(); await owner.settle();
      return { retained, remount, inherited: owner.field(1).getAttribute("data-validate"), issues: owner.handle.validate().issues.map(issue => issue.rowId),
        descriptors: [owner.field<HTMLInputElement>(1).value, secondary().textContent], raw: owner.rows.entries().map(row => [row.id, row.value.amount, row.status]) };
    }, kind);
    expect(result).toEqual({ retained: [1], remount: ['[["minimum",50]]', false], inherited: '[["minimum",30]]', issues: [1, 2],
      descriptors: ["10:html", "Record 1:row-secondary"], raw: [[1, 10, "clean"], [2, 20, "clean"]] });
  });

  test(`${kind} preflights saved offscreen row text when a typed override is removed`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.rowRuleFixture, fields: NonNullable<RuleSet["fields"]> = { amount: { validate: [] } }, owner = h.open(kind, { rules: { fields } });
      owner.field(1).setAttribute("data-validate", "saved malformed row declaration"); owner.handle.refresh(); await owner.settle();
      owner.handle.setPage({ page: 2, size: 1 }); await owner.settle(); delete fields.amount;
      const code = h.code(() => owner.handle.refresh()), previous = owner.handle.validate().valid;
      fields.amount = { validate: [["minimum", 30]] }; owner.handle.refresh(); await owner.settle();
      const all = owner.handle.validate().issues.map(issue => issue.rowId); owner.handle.setPage({ page: 1, size: 1 }); await owner.settle();
      return { code, previous, all, retained: owner.field(1).getAttribute("data-validate"), current: owner.handle.validate(1).issues.map(issue => issue.rule), clean: owner.rows.changes().length };
    }, kind);
    expect(result).toEqual({ code: "RULE_DECLARATION", previous: true, all: [1, 2], retained: "saved malformed row declaration", current: ["minimum"], clean: 0 });
  });

  test(`${kind} retains nested HTML argument references through unchanged and reentrant refresh`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.rowRuleFixture, outcomes: unknown[] = [];
      for (const origin of ["template", "row"] as const) {
        let owner: Owner, armed = false, entered = false, nested = "not called", first: unknown, same = true;
        const fields: NonNullable<RuleSet["fields"]> = {};
        owner = h.open(kind, { track: false, count: 1, format: '[["box",{"label":"template"}]]', rules: { fields, format: {
          box(value, args) {
            const argument = args[0] as { label: string; observed?: boolean };
            if (first === undefined) first = argument; else same &&= first === argument;
            argument.observed = true;
            if (armed && !entered) { entered = true; nested = h.code(() => owner.handle.refresh()); }
            return `${value}:${argument.label}:${argument.observed}`;
          }
        } } });
        if (origin === "row") { owner.field(1).setAttribute("data-format", '[["box",{"label":"row"}]]'); first = undefined;
          owner.handle.refresh(); await owner.settle(); }
        same = true; armed = true; h.code(() => owner.handle.refresh()); armed = false; owner.handle.refresh(); await owner.settle();
        outcomes.push({ origin, entered, nested, same, shown: owner.field<HTMLInputElement>(1).value });
      }
      return outcomes;
    }, kind);
    expect(result).toEqual(["template", "row"].map(origin => ({ origin, entered: true, nested: "", same: true, shown: `10:${origin}:true` })));
  });

  test(`${kind} rejects a changed declaration during an active rule and accepts it after that rule`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.rowRuleFixture, fields: NonNullable<RuleSet["fields"]> = {}, codes: string[] = []; let armed = false, owner: Owner;
      owner = h.open(kind, { rules: { fields, validate: { inspect() {
        if (armed) { armed = false; fields.amount = { validate: [["minimum", 100]] }; codes.push(h.code(() => owner.handle.refresh())); }
        return true;
      } } }, validate: '[["inspect"]]' });
      armed = true; const during = owner.handle.validate().valid; owner.handle.refresh(); await owner.settle();
      return { codes, during, after: owner.handle.validate().issues.map(issue => issue.rowId), changes: owner.rows.changes().length };
    }, kind);
    expect(result).toEqual({ codes: [`${kind.toUpperCase()}_BIND_REENTRANT`], during: true, after: [1, 2], changes: 0 });
  });

  test(`${kind} admits declaration getters before newer work and never overwrites its accepted policy`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.rowRuleFixture, fields: NonNullable<RuleSet["fields"]> = {}; let owner: Owner, armed = false, nativeCalls = 0;
      class RuleTarget extends HTMLElement {
        static get observedAttributes() { return ["data-validate"]; }
        attributeChangedCallback() {
          if (!armed || !this.isConnected) return;
          armed = false; nativeCalls++; fields.amount = { format: [["tag", "native-newer"]], validate: [["minimum", 25]] };
          fields.name = { format: [["tag", "native-name"]], validate: [] };
          owner.handle.refresh();
        }
      }
      customElements.define("rule-adoption-target", RuleTarget);
      const content = '<label>Amount <input aria-label="Amount" data-field="amount" value="4"></label><rule-adoption-target data-field="name"></rule-adoption-target>';
      const markup = kind === "Grid" ? '<caption>Native rule admission</caption><tbody><tr data-row-template><td>' + content + '</td></tr></tbody>' : '<li data-row-template>' + content + '</li>';
      owner = h.open(kind, { track: false, rules: { fields }, markup }); let entered = false;
      Object.defineProperty(fields, "amount", { configurable: true, enumerable: true, get() {
        entered = true; Object.defineProperty(fields, "amount", { configurable: true, enumerable: true, writable: true,
          value: { format: [["tag", "newer"]], validate: [["minimum", 15]] } });
        owner.handle.refresh(); return { format: [["tag", "older"]], validate: [] };
      } });
      const code = h.code(() => owner.handle.refresh()); await owner.settle();
      const getter = { entered, code, shown: owner.field<HTMLInputElement>(1).value, issues: owner.handle.validate().issues.map(issue => issue.rowId) };
      delete fields.amount; owner.amountTemplate.setAttribute("data-validate", '[["minimum",50]]');
      owner.template.querySelector("rule-adoption-target")!.setAttribute("data-validate", '[["required"]]');
      armed = true; const nativeCode = h.code(() => owner.handle.refresh()); await owner.settle();
      return { getter, native: { calls: nativeCalls, code: nativeCode, shown: owner.field<HTMLInputElement>(1).value,
        texts: [...owner.root.querySelectorAll("rule-adoption-target")].map(element => element.textContent), issues: owner.handle.validate().issues.map(issue => issue.rowId) },
        rows: owner.rows.entries().map(row => [row.id, row.status]), page: owner.handle.page() };
    }, kind);
    expect(result).toEqual({ getter: { entered: true, code: `${kind.toUpperCase()}_BIND_STALE`, shown: "10:newer", issues: [1] },
      native: { calls: 1, code: `${kind.toUpperCase()}_BIND_STALE`, shown: "10:native-newer", texts: ["Record 1:native-name", "Record 2:native-name"], issues: [1, 2] },
      rows: [[1, "clean"], [2, "clean"]], page: null });
  });

  test(`${kind} rejects Select format adoption before disturbing its native control or raw choice`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.rowRuleFixture, owner = h.open(kind), source = owner.template.querySelector("select")!, select = owner.field<HTMLSelectElement>(1, "chosen");
      const options = [...select.options]; source.setAttribute("data-format", '[["tag","forbidden"]]');
      const code = h.code(() => owner.handle.refresh()), same = select.options.length === options.length && [...select.options].every((option, index) => option === options[index]);
      source.removeAttribute("data-format"); owner.handle.refresh(); await owner.settle();
      return { code, same, chosen: owner.rows.get(1)!.value.chosen, displayed: select.selectedOptions[0]?.textContent,
        disabled: select.disabled, valid: owner.handle.validate().valid, raw: owner.rows.changes().length };
    }, kind);
    expect(result).toEqual({ code: `${kind.toUpperCase()}_FORMAT`, same: true, chosen: 1, displayed: "One", disabled: kind === "List", valid: true, raw: 0 });
  });

  test(`${kind} excludes committed removed insertions from sparse and physical rule preflight`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.rowRuleFixture, fields: NonNullable<RuleSet["fields"]> = { amount: { validate: [] } };
      let owner: Owner, armed = false, inserted = 0, nested = "not called";
      owner = h.open(kind, { rules: { fields }, source(_value, binding) {
        if (armed && binding.row.id === inserted) { armed = false; nested = h.code(() => owner.rows.remove(inserted)); }
      } });
      inserted = owner.rows.add({ name: "Inserted", amount: 30, mode: "a", chosen: 1, choices: [{ label: "One", value: 1 }] }); await owner.settle();
      owner.field(inserted).setAttribute("data-validate", "accepted malformed text shadowed by typed rules"); owner.handle.refresh(); await owner.settle();
      owner.field(inserted).setAttribute("data-validate", "new malformed text on the soon removed native row");
      armed = true; const interrupted = h.code(() => owner.rows.set(inserted, "name", "Remove during source bind"));
      delete fields.amount; const recovery = h.code(() => owner.handle.refresh()); await owner.settle();
      return { nested, interrupted, recovery, missing: owner.rows.get(inserted) === undefined,
        ids: owner.rows.entries().map(row => row.id), mounted: [...owner.mounted.keys()], valid: owner.handle.validate().valid };
    }, kind);
    expect(result).toEqual({ nested: `${kind.toUpperCase()}_BIND_REENTRANT`, interrupted: `${kind.toUpperCase()}_BIND_STALE`, recovery: "",
      missing: true, ids: [1, 2], mounted: [1, 2], valid: true });
  });
}

test("Grid refresh preserves invalid drafts and atomic paste validates every adopted duplicate rule", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const owner = window.rowRuleFixture.open("Grid", { format: null }), grid = owner.handle as GridHandle<Item>, input = owner.field<HTMLInputElement>(1);
    const defaults = JSON.stringify(grid.defaults()), rows = owner.rows.entries(); let events = 0; owner.rows.subscribe(() => events++);
    input.value = "bad"; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true }));
    owner.amountTemplate.setAttribute("data-validate", '[["minimum",50],["minimum",50]]'); grid.refresh(); await owner.settle();
    const retained = [input.value, grid.validate(1).issues.map(issue => issue.rule), owner.rows.entries() === rows];
    const rejected = grid.paste("100\n40", { id: 1, field: "amount" });
    const failed = { valid: rejected.valid, issues: rejected.issues.map(issue => [issue.rowId, issue.rule]), draft: input.value, same: owner.rows.entries() === rows, events };
    const accepted = grid.paste("100\n200", { id: 1, field: "amount" }); await owner.settle();
    return { retained, failed, accepted: accepted.valid, amounts: owner.rows.entries().map(row => row.value.amount), events,
      defaults: JSON.stringify(grid.defaults()) === defaults, original: owner.rows.original(1)!.amount };
  });
  expect(result).toEqual({ retained: ["bad", ["parse"], true], failed: { valid: false, issues: [[2, "minimum"], [2, "minimum"]], draft: "bad", same: true, events: 0 },
    accepted: true, amounts: [100, 200], events: 1, defaults: true, original: 10 });
});

test("List adopts validators while keeping native inputs read-only and committed values unchanged", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const owner = window.rowRuleFixture.open("List", { format: null }), input = owner.field<HTMLInputElement>(1), rows = owner.rows.entries();
    input.value = "999"; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true }));
    owner.amountTemplate.setAttribute("data-validate", '[["minimum",30]]'); owner.handle.refresh(); await owner.settle();
    return { disabled: input.disabled, shown: input.value, issues: owner.handle.validate().issues.map(issue => issue.rowId), same: owner.rows.entries() === rows, changes: owner.rows.changes().length };
  });
  expect(result).toEqual({ disabled: true, shown: "10", issues: [1, 2], same: true, changes: 0 });
});

test("Grid before-row declarations apply before that row and recover after a malformed hook result", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.rowRuleFixture; let malformed = false;
    const owner = h.open("Grid", { before(binding) {
      const input = binding.elements[0].querySelector('[data-field="amount"]')!;
      input.setAttribute("data-format", JSON.stringify([["tag", `row-${binding.row.id}`]]));
      input.setAttribute("data-validate", malformed && binding.row.id === 1 ? "bad hook declaration" : JSON.stringify([["minimum", binding.row.id === 1 ? 50 : 0]]));
    } });
    const first = [owner.field<HTMLInputElement>(1).value, owner.field<HTMLInputElement>(2).value, owner.handle.validate().issues.map(issue => issue.rowId)];
    const affected = owner.field<HTMLInputElement>(1), source = owner.rows.entries();
    malformed = true; const code = h.code(() => owner.handle.refresh());
    const failed = { declaration: affected.getAttribute("data-validate"), display: affected.value,
      sameSource: owner.rows.entries() === source, raw: owner.rows.entries().map(row => row.value.amount) };
    malformed = false; affected.setAttribute("data-validate", '[["minimum",50]]'); owner.handle.refresh(); await owner.settle();
    return { first, code, failed, retry: owner.field<HTMLInputElement>(1).value, issues: owner.handle.validate().issues.map(issue => issue.rowId), choices: owner.field<HTMLSelectElement>(1, "chosen").selectedOptions[0]?.textContent };
  });
  expect(result).toEqual({ first: ["10:row-1", "20:row-2", [1]], code: "RULE_DECLARATION",
    failed: { declaration: "bad hook declaration", display: "10:row-1", sameSource: true, raw: [10, 20] },
    retry: "10:row-1", issues: [1], choices: "One" });
});

test("List after-row attribute edits wait for the next explicit refresh", async ({ page }) => {
  const result = await page.evaluate(async () => {
    let edited = false; const owner = window.rowRuleFixture.open("List", { after(binding) {
      if (!edited && binding.row.id === 1) { edited = true; binding.elements[0].querySelector('[data-field="amount"]')!.setAttribute("data-validate", '[["minimum",100]]'); }
    } });
    const before = owner.handle.validate().valid; owner.rows.set(1, "name", "Changed without adoption"); const ordinary = owner.handle.validate().valid;
    owner.handle.refresh(); await owner.settle(); return { before, ordinary, after: owner.handle.validate().issues.map(issue => issue.rowId), amount: owner.rows.get(1)!.value.amount };
  });
  expect(result).toEqual({ before: true, ordinary: true, after: [1], amount: 10 });
});

test("Grid retains sparse row rules through real viewport release, loaded deletion and revival", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const owner = window.rowRuleFixture.open("Grid", { count: 80, viewport: true }), grid = owner.handle as GridHandle<Item>;
    await owner.settle(); const first = owner.field(1), own = '[["minimum",999]]'; first.setAttribute("data-validate", own); grid.refresh(); await owner.settle();
    grid.reveal(60); await owner.settle(); const departed = !first.isConnected;
    const offscreen = grid.validate().issues.map(issue => [issue.rowId, issue.rule, issue.element === undefined]);
    owner.rows.remove(1); owner.rows.revert(1); await owner.settle(); grid.reveal(1); await owner.settle();
    return { departed, offscreen, replaced: owner.field(1) !== first, source: owner.field(1).getAttribute("data-validate"),
      current: grid.validate(1).issues.map(issue => [issue.rule, issue.element === owner.field(1)]), status: owner.rows.get(1)!.status };
  });
  expect(result).toEqual({ departed: true, offscreen: [[1, "minimum", true]], replaced: true, source: '[["minimum",999]]', current: [["minimum", true]], status: "clean" });
});

test("Grid preflights group agreement and renderer conflicts while preserving typed precedence", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.rowRuleFixture, fields: NonNullable<RuleSet["fields"]> = { mode: { validate: [] } };
    const owner = h.open("Grid", { rules: { fields }, markup: '<caption>Radio policy</caption><tbody><tr data-row-template><td><input aria-label="Amount" data-field="amount" value="4"><label>A<input type="radio" name="rule-mode" data-field="mode" value="a"></label><label>B<input type="radio" name="rule-mode" data-field="mode" value="b" data-validate="invalid JSON"></label></td></tr></tbody>' });
    const members = owner.template.querySelectorAll('[data-field="mode"]');
    members[0].setAttribute("data-validate", '[["required"]]'); members[1].setAttribute("data-validate", '[["minimum",1]]');
    owner.handle.refresh(); const shadowed = owner.handle.validate().valid; delete fields.mode;
    const group = h.code(() => owner.handle.refresh()); for (const input of owner.template.querySelectorAll('[data-field="mode"]')) input.removeAttribute("data-validate");
    owner.handle.refresh(); await owner.settle(); owner.template.querySelector('[data-field="mode"]')!.setAttribute("data-format", '[["tag","bad"]]');
    const native = h.code(() => owner.handle.refresh());
    const renderer = h.open("Grid", { render: { name: value => String(value) } }); renderer.template.querySelector('[data-field="name"]')!.setAttribute("data-format", '[["tag","bad"]]');
    const render = h.code(() => renderer.handle.refresh());
    return { shadowed, group, native, render, selected: owner.field<HTMLInputElement>(1, "mode").checked, raw: owner.rows.get(1)!.value.mode, name: renderer.field(1, "name").textContent };
  });
  expect(result).toEqual({ shadowed: true, group: "GRID_CONTROL", native: "GRID_FORMAT", render: "UI_RENDER", selected: true, raw: "a", name: "Record 1" });
});

for (const kind of ["Grid", "List"] as const) {
  test(`${kind} keeps accepted row rules without scanning them on set and restore`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.rowRuleFixture;
      const normal = h.open(kind, { count: 30, format: null });
      const overridden = h.open(kind, { count: 30, format: null });
      await normal.settle(); await overridden.settle();
      for (const row of overridden.rows.entries()) overridden.field(row.id).setAttribute("data-validate", '[["minimum",1000]]');
      normal.handle.refresh(); overridden.handle.refresh();
      await normal.settle(); await overridden.settle();
      normal.handle.setPage({ page: 1, size: 1 }); overridden.handle.setPage({ page: 1, size: 1 });
      await normal.settle(); await overridden.settle();
      const normalRow = normal.rows.entries()[0], overrideRow = overridden.rows.entries()[0];
      const expectedIds = overridden.rows.entries().map(row => row.id);
      const normalGet = normal.rows.get, overrideGet = overridden.rows.get;
      let measuring = false, normalReads = 0, overrideReads = 0;
      normal.rows.get = id => { if (measuring) normalReads++; return normalGet.call(normal.rows, id); };
      overridden.rows.get = id => { if (measuring) overrideReads++; return overrideGet.call(overridden.rows, id); };
      const reads: { operation: string; normal: number; overridden: number }[] = [];
      try {
        for (const operation of ["set", "restore"] as const) {
          normalReads = 0; overrideReads = 0; measuring = true;
          if (operation === "set") {
            normal.rows.set(normalRow.id, "amount", 11); overridden.rows.set(overrideRow.id, "amount", 11);
          } else {
            normal.rows.restore(normalRow.id, { ...normalRow.value, amount: 12 });
            overridden.rows.restore(overrideRow.id, { ...overrideRow.value, amount: 12 });
          }
          await normal.settle(); await overridden.settle();
          measuring = false;
          reads.push({ operation, normal: normalReads, overridden: overrideReads });
        }
      } finally {
        measuring = false; normal.rows.get = normalGet; overridden.rows.get = overrideGet;
      }
      const normalValid = normal.handle.validate().valid, invalid = overridden.handle.validate();
      return { reads, normalValid, overridesValid: invalid.valid,
        issues: invalid.issues.map(issue => [issue.rowId, issue.rule]), expectedIds,
        raw: [normal.rows.get(normalRow.id)!.value.amount, overridden.rows.get(overrideRow.id)!.value.amount],
        shown: [normal.field<HTMLInputElement>(normalRow.id).value, overridden.field<HTMLInputElement>(overrideRow.id).value],
        pages: [normal.handle.page()?.page, overridden.handle.page()?.page] };
    }, kind);
    expect(result.normalValid).toBe(true);
    expect(result.overridesValid).toBe(false);
    expect(result.issues).toEqual(result.expectedIds.map(id => [id, "minimum"]));
    expect(result.issues).toHaveLength(30);
    expect(result.raw).toEqual([12, 12]);
    expect(result.shown).toEqual(["12", "12"]);
    expect(result.pages).toEqual([1, 1]);
    expect(result.reads.map(item => item.operation)).toEqual(["set", "restore"]);
    for (const reads of result.reads) expect(reads.overridden, `${kind} ${reads.operation} must not scan all accepted overrides`).toBe(reads.normal);
  });
}
