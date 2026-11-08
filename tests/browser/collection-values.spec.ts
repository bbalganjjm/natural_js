// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RowId, Rows } from "../../src/data/index.js";
import type { GridHandle, ListHandle, RuleSet, SelectValue, ValueBindContext } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindGrid } from "../../src/ui/grid.js";
import type { bindList } from "../../src/ui/list.js";
import type { bindSelect } from "../../src/ui/select.js";

type Kind = "grid" | "list";
type Item = {
  name: string; salary: number; active: boolean; note: string; tail: string; profile: { label: string };
  choice: SelectValue; tags: readonly SelectValue[]; choices: readonly { label: string; value: SelectValue }[];
  mode: string | null; flags: readonly string[];
};
type Callback = (value: unknown, context: ValueBindContext) => unknown;
type Options = { beforeBindValue?: Callback; onBindValue?: Callback; rules?: RuleSet };
type Owner = { root: HTMLTableElement | HTMLUListElement; handle: GridHandle<Item> | ListHandle<Item>; rows: Rows<Item> };
type Failure = { api?: string; code?: string; cause?: unknown; detail?: Readonly<Record<string, unknown>> };

declare global {
  interface Window {
    collectionValues: {
      api: { bindForm: typeof bindForm; bindGrid: typeof bindGrid; bindList: typeof bindList; bindSelect: typeof bindSelect };
      item(name?: string): Item;
      rows(items: readonly Item[]): Rows<Item>;
      table(html: string): HTMLTableElement;
      list(html: string): HTMLUListElement;
      make(kind: Kind, html: string, options?: Options, items?: readonly Item[]): Owner;
      field<E extends HTMLElement = HTMLElement>(root: ParentNode, name?: string, index?: number): E;
      error(action: () => unknown): Failure | null;
      edit(input: HTMLInputElement, value: string): void;
    };
  }
}

const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };
const kinds = ["grid", "list"] as const;
const singleChoice = '<label>Choice <select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"><option value="">Choose</option></select></label>';
const multipleChoice = '<label>Tags <select multiple data-field="tags" data-options="choices" data-option-label="label" data-option-value="value"></select></label>';

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [api, { createRows }] = await Promise.all([import(modules.ui), import(modules.data)]);
    const item = (name = "Ada"): Item => ({ name, salary: 120, active: false, note: "One", tail: "Tail", profile: { label: "Primary" },
      choice: 1, tags: [1], choices: [{ label: "Number", value: 1 }, { label: "String", value: "1" }, { label: "Second", value: 2 }, { label: "Duplicate", value: 1 }], mode: "a", flags: ["a"] });
    const h: Window["collectionValues"] = {
      api, item, rows: createRows,
      table(html) { const root = document.createElement("table"); root.dataset.kind = "grid"; root.innerHTML = `<caption>Value binding</caption><thead><tr><th scope="col">Values</th></tr></thead><tbody data-row-template><tr><td>${html}</td></tr></tbody>`; document.body.append(root); return root; },
      list(html) { const root = document.createElement("ul"); root.dataset.kind = "list"; root.innerHTML = `<li data-row-template>${html}</li><li data-empty hidden>Empty</li>`; document.body.append(root); return root; },
      make(kind, html, options = {}, items = [item()]) {
        const rows = createRows(items);
        if (kind === "grid") { const root = h.table(html); return { root, rows, handle: api.bindGrid(root, { rows, ...options }) }; }
        const root = h.list(html); return { root, rows, handle: api.bindList(root, { rows, ...options }) };
      },
      field: (root, name = "name", index = 0) => root.querySelectorAll<HTMLElement>(`[data-field="${name}"]`)[index] as never,
      error(action) { try { action(); return null; } catch (cause) { return cause as Failure; } },
      edit(input, value) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); }
    }; window.collectionValues = h;
  }, modules);
});

for (const kind of kinds) {
  test(`${kind} value hooks preserve scalar replacements raw context and ordinary formatting`, async ({ page }) => {
    const result = await page.evaluate(kind => {
      const h = window.collectionValues, calls: unknown[][] = [], contexts = new Map<string, ValueBindContext>();
      const first: Record<string, unknown> = { name: false, salary: 0, active: null, note: "" };
      const last: Record<string, unknown> = { name: 0, salary: null, active: false };
      const owner = h.make(kind, '<span data-field="name" data-format=\'[["upper"]]\'></span><span data-field="salary"></span><span data-field="active"></span><span data-field="note"></span><span data-field="profile.label"></span>', {
        beforeBindValue: function (this: void, value, context) { "use strict";
          contexts.set(context.field, context); calls.push(["before", context.field, value, context.phase, this === undefined]); return first[context.field];
        },
        onBindValue: function (this: void, value, context) { "use strict";
          calls.push(["after", context.field, value, context.element.textContent, context === contexts.get(context.field), Object.isFrozen(context), Object.isFrozen(context.values), this === undefined]); return last[context.field];
        }
      });
      const id = owner.rows.entries()[0].id;
      return { calls, shown: [...owner.root.querySelectorAll("[data-field]")].map(element => element.textContent), raw: owner.rows.get(id)!.value,
        original: owner.rows.original(id), changes: owner.rows.changes().length,
        contexts: [...contexts.values()].every(context => context.rowId === id && context.values.name === "Ada" && context.element.dataset.field === context.field) };
    }, kind);
    expect(result.calls.filter(call => call[0] === "before").map(call => call.slice(1))).toEqual([
      ["name", "Ada", "bind", true], ["salary", 120, "bind", true], ["active", false, "bind", true], ["note", "One", "bind", true], ["profile.label", "Primary", "bind", true]
    ]);
    expect(result.calls.filter(call => call[0] === "after").map(call => call.slice(1))).toEqual([
      ["name", false, "FALSE", true, true, true, true], ["salary", 0, "0", true, true, true, true],
      ["active", null, "", true, true, true, true], ["note", "", "", true, true, true, true], ["profile.label", "Primary", "Primary", true, true, true, true]
    ]);
    expect(result.shown).toEqual(["0", "", "false", "", "Primary"]); expect(result.raw).toEqual(result.original); expect(result.changes).toBe(0); expect(result.contexts).toBe(true);
  });

  test(`${kind} caches successful values and distinguishes committed updates from deliberate refresh`, async ({ page }) => {
    const result = await page.evaluate(kind => {
      const h = window.collectionValues, calls: unknown[][] = [];
      const owner = h.make(kind, '<span data-field="name"></span><span data-field="note"></span>', { beforeBindValue(value, context) { calls.push([context.field, value, context.phase]); return `view:${value}`; } });
      const id = owner.rows.entries()[0].id, initial = [...calls]; calls.length = 0;
      owner.handle.setSort(null); owner.handle.setFilter(null); owner.handle.setPage(null); const unchanged = [...calls];
      owner.rows.set(id, "note", "Two"); const changed = [...calls]; calls.length = 0;
      owner.rows.set(id, "tail", "Unbound"); const unbound = [...calls]; owner.handle.refresh();
      return { initial, unchanged, changed, unbound, refreshed: calls, shown: [h.field(owner.root).textContent, h.field(owner.root, "note").textContent], raw: owner.rows.get(id)!.value.name };
    }, kind);
    expect(result).toEqual({ initial: [["name", "Ada", "bind"], ["note", "One", "bind"]], unchanged: [], changed: [["note", "Two", "val"]], unbound: [],
      refreshed: [["name", "Ada", "bind"], ["note", "Two", "bind"]], shown: ["view:Ada", "view:Two"], raw: "Ada" });
  });

  test(`${kind} captured callbacks can read live application policy without sharing Rows`, async ({ page }) => {
    const result = await page.evaluate(kind => {
      const h = window.collectionValues, policy = { prefix: "First:" }, calls: string[] = [];
      const callback: Callback = (value, context) => { calls.push(context.values.name as string); return policy.prefix + value; };
      const options: Options = { beforeBindValue: callback };
      const first = h.make(kind, '<span data-field="name"></span>', options), second = h.make(kind, '<span data-field="name"></span>', options, [h.item("Beatrice")]);
      options.beforeBindValue = () => { throw new Error("Options were read again"); }; policy.prefix = "Next:";
      first.handle.refresh(); second.handle.refresh(); const shown = [h.field(first.root).textContent, h.field(second.root).textContent];
      const id = first.rows.entries()[0].id; first.rows.set(id, "name", "Changed"); first.handle.dispose();
      policy.prefix = "Last:"; second.handle.refresh();
      return { shown, calls, separate: first.rows !== second.rows, first: first.rows.get(id)!.value.name, second: second.rows.entries()[0].value.name,
        remaining: h.field(second.root).textContent, originals: [first.rows.original(id)!.name, second.rows.original(second.rows.entries()[0].id)!.name] };
    }, kind);
    expect(result).toEqual({ shown: ["Next:Ada", "Next:Beatrice"], calls: ["Ada", "Beatrice", "Ada", "Beatrice", "Changed", "Beatrice"], separate: true,
      first: "Changed", second: "Beatrice", remaining: "Last:Beatrice", originals: ["Ada", "Beatrice"] });
  });

  test(`${kind} preserves typed occurrences and unmarked native choice coercion without rewriting raw selections`, async ({ page }) => {
    const result = await page.evaluate(({ kind, singleChoice, multipleChoice }) => {
      const h = window.collectionValues, observed: unknown[][] = [];
      const owner = h.make(kind, singleChoice + multipleChoice + '<label>Salary <select data-field="salary"><option value="120">One twenty</option><option value="240">Two forty</option></select></label><label>Flags <select multiple data-field="flags"><option value="a">A</option><option value="1">One</option><option value="2">Two</option></select></label>', {
        beforeBindValue(_value, context) { return context.field === "choice" ? "1" : context.field === "tags" ? [1, 1] : context.field === "salary" ? 240 : [1, 2]; },
        onBindValue(value, context) { observed.push([context.field, value, [...(context.element as HTMLSelectElement).selectedOptions].map(option => option.textContent)]); return context.field === "choice" ? 2 : context.field === "tags" ? [1, "1"] : undefined; }
      });
      const selected = (name: string) => [...h.field<HTMLSelectElement>(owner.root, name).selectedOptions].map(option => option.textContent);
      const raw = owner.rows.entries()[0].value;
      return { observed, selected: [selected("choice"), selected("tags"), selected("salary"), selected("flags")], raw: [raw.choice, raw.tags, raw.salary, raw.flags],
        native: [h.field<HTMLSelectElement>(owner.root, "salary").value, [...h.field<HTMLSelectElement>(owner.root, "flags").selectedOptions].map(option => option.value)], original: owner.rows.original(owner.rows.entries()[0].id), changes: owner.rows.changes().length,
        disabled: [...owner.root.querySelectorAll("select")].every(element => element.disabled === (kind === "list")) };
    }, { kind, singleChoice, multipleChoice });
    expect(result.observed).toEqual([["choice", "1", ["String"]], ["tags", [1, 1], ["Number", "Duplicate"]], ["salary", 240, ["Two forty"]], ["flags", [1, 2], ["One", "Two"]]]);
    expect(result.selected).toEqual([["Second"], ["Number", "String"], ["Two forty"], ["One", "Two"]]); expect(result.raw).toEqual([1, [1], 120, ["a"]]); expect(result.native).toEqual(["240", ["1", "2"]]);
    expect(result.original?.choice).toBe(1); expect(result.changes).toBe(0); expect(result.disabled).toBe(true);
  });

  test(`${kind} rechecks cached choice availability after option source changes and validates raw values`, async ({ page }) => {
    const result = await page.evaluate(({ kind, singleChoice }) => {
      const h = window.collectionValues; let calls = 0;
      const owner = h.make(kind, singleChoice, { beforeBindValue() { calls++; return 2; } }), id = owner.rows.entries()[0].id;
      const failure = h.error(() => owner.rows.set(id, "choices", [{ label: "Number", value: 1 }]));
      const failedCalls = calls, validRaw = owner.handle.validate().valid;
      owner.rows.set(id, "choices", [{ label: "Number", value: 1 }, { label: "Second", value: 2 }]); owner.handle.refresh();
      return { code: failure?.code, api: failure?.api, field: failure?.detail?.field, failedCalls, calls, validRaw,
        shown: h.field<HTMLSelectElement>(owner.root, "choice").selectedOptions[0]?.textContent, raw: owner.rows.get(id)!.value.choice, original: owner.rows.original(id)!.choice };
    }, { kind, singleChoice });
    expect(result).toEqual({ code: `${kind.toUpperCase()}_VALUE`, api: kind === "grid" ? "bindGrid" : "bindList", field: "choice", failedCalls: 1, calls: 2, validRaw: true, shown: "Second", raw: 1, original: 1 });
  });

  test(`${kind} rejects invalid value callbacks before taking template Select or error ownership`, async ({ page }) => {
    const result = await page.evaluate(kind => {
      const h = window.collectionValues;
      return ["beforeBindValue", "onBindValue"].flatMap(callback => [null, 1].map(value => {
        const html = '<label>Name <input data-field="name" aria-describedby="help"></label><output data-error-for="name">Hint</output><label>Choice <select data-field="choice"><option value="">Choose</option></select></label>';
        const root = kind === "grid" ? h.table(html) : h.list(html), rows = h.rows([h.item()]), before = root.innerHTML;
        const options = { rows, [callback]: value } as unknown as Options & { rows: Rows<Item> };
        const error = h.error(() => kind === "grid" ? h.api.bindGrid(root as HTMLTableElement, options) : h.api.bindList(root as HTMLUListElement, options));
        const unchanged = root.innerHTML === before;
        const select = h.api.bindSelect(h.field<HTMLSelectElement>(root, "choice"), { choices: [] }); select.dispose();
        const handle = kind === "grid" ? h.api.bindGrid(root as HTMLTableElement, { rows }) : h.api.bindList(root as HTMLUListElement, { rows }); handle.dispose();
        return { callback, code: error?.code, api: error?.api, unchanged, restored: root.innerHTML === before };
      }));
    }, kind);
    expect(result).toEqual(["beforeBindValue", "onBindValue"].flatMap(callback => [null, 1].map(() => ({ callback, code: `${kind.toUpperCase()}_VALUE_OPTIONS`, api: kind === "grid" ? "bindGrid" : "bindList", unchanged: true, restored: true }))));
  });

  test(`${kind} preserves thrown callback causes and retries failed projections only on explicit work`, async ({ page }) => {
    const result = await page.evaluate(kind => {
      const h = window.collectionValues;
      return ["beforeBindValue", "onBindValue"].map(callback => {
        const marker = new Error("Application value failure"); let failing = false, calls = 0;
        const fresh = kind === "grid" ? h.table('<span data-field="name">Authored</span>') : h.list('<span data-field="name">Authored</span>'), freshRows = h.rows([h.item()]), markup = fresh.innerHTML;
        const broken: Callback = () => { throw marker; };
        const construction = h.error(() => kind === "grid" ? h.api.bindGrid(fresh as HTMLTableElement, { rows: freshRows, [callback]: broken }) : h.api.bindList(fresh as HTMLUListElement, { rows: freshRows, [callback]: broken }));
        const initialRestored = fresh.innerHTML === markup;
        const freshRetry = kind === "grid" ? h.api.bindGrid(fresh as HTMLTableElement, { rows: freshRows }) : h.api.bindList(fresh as HTMLUListElement, { rows: freshRows }); freshRetry.dispose();
        const run: Callback = value => { calls++; if (failing) throw marker; return `view:${value}`; };
        const owner = h.make(kind, '<span data-field="name"></span>', { [callback]: run }), id = owner.rows.entries()[0].id;
        failing = true; const failure = h.error(() => owner.rows.set(id, "name", "Next")), failedCalls = calls;
        owner.rows.set(id, "tail", "Unbound"); const cachedCalls = calls;
        const retry = h.error(() => owner.handle.refresh()); failing = false; owner.handle.refresh();
        return { callback, construction: [construction?.code, construction?.cause === marker, initialRestored, fresh.innerHTML === markup], code: failure?.code, cause: failure?.cause === marker, field: failure?.detail?.field, row: failure?.detail?.rowId === id, phase: failure?.detail?.phase,
          callbackDetail: failure?.detail?.callback, failedCalls, cachedCalls, retry: retry?.code, calls, shown: h.field(owner.root).textContent, raw: owner.rows.get(id)!.value.name };
      });
    }, kind);
    expect(result).toEqual(["beforeBindValue", "onBindValue"].map(callback => ({ callback, construction: [`${kind.toUpperCase()}_VALUE`, true, true, true], code: `${kind.toUpperCase()}_VALUE`, cause: true, field: "name", row: true, phase: "val", callbackDetail: callback,
      failedCalls: 2, cachedCalls: 2, retry: `${kind.toUpperCase()}_VALUE`, calls: 4, shown: "view:Next", raw: "Next" })));
  });

  test(`${kind} rejects and drains asynchronous value results and releases failed construction`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.collectionValues, unhandled: unknown[] = [], failures: unknown[] = [];
      const listener = (event: PromiseRejectionEvent) => { unhandled.push(String(event.reason)); event.preventDefault(); }; window.addEventListener("unhandledrejection", listener);
      for (const callback of ["beforeBindValue", "onBindValue"]) {
        const root = kind === "grid" ? h.table('<span data-field="name">Authored</span>') : h.list('<span data-field="name">Authored</span>');
        const before = root.innerHTML, rows = h.rows([h.item()]);
        const run: Callback = () => Promise.reject(new Error("Expected rejection"));
        const error = h.error(() => kind === "grid" ? h.api.bindGrid(root as HTMLTableElement, { rows, [callback]: run }) : h.api.bindList(root as HTMLUListElement, { rows, [callback]: run }));
        const restored = root.innerHTML === before;
        const retry = kind === "grid" ? h.api.bindGrid(root as HTMLTableElement, { rows }) : h.api.bindList(root as HTMLUListElement, { rows }); retry.dispose();
        failures.push([callback, error?.code, error?.detail?.callback, error?.detail?.phase, restored, root.innerHTML === before, rows.changes().length]);
      }
      await new Promise(resolve => setTimeout(resolve, 20)); window.removeEventListener("unhandledrejection", listener); return { failures, unhandled };
    }, kind);
    expect(result).toEqual({ failures: ["beforeBindValue", "onBindValue"].map(callback => [callback, `${kind.toUpperCase()}_VALUE`, callback, "bind", true, true, 0]), unhandled: [] });
  });

  test(`${kind} stops stale projection after nested source changes and disposal`, async ({ page }) => {
    const result = await page.evaluate(kind => {
      const h = window.collectionValues; let nested = false, disposing = false, owner: Owner; const after: string[] = [];
      owner = h.make(kind, '<span data-field="name">Authored</span>', {
        beforeBindValue(value, context) {
          if (nested) { nested = false; owner.rows.set(context.rowId, "name", "Nested"); return "STALE"; }
          if (disposing) { owner.handle.dispose(); return "DISPOSED"; }
          return `view:${value}`;
        },
        onBindValue(_value, context) { after.push(context.values.name as string); }
      });
      after.length = 0; nested = true; h.error(() => owner.handle.refresh()); const oldAfter = after.includes("Ada"); owner.handle.refresh();
      const id = owner.rows.entries()[0].id, shown = h.field(owner.root).textContent, raw = owner.rows.get(id)!.value.name;
      after.length = 0; disposing = true; h.error(() => owner.handle.refresh()); const restored = owner.root.innerHTML, disposedAfter = [...after];
      owner.rows.set(id, "name", "Late");
      return { oldAfter, shown, raw, disposedAfter, quiet: owner.root.innerHTML === restored, authored: owner.root.textContent?.includes("Authored"), stale: owner.root.textContent?.includes("DISPOSED") };
    }, kind);
    expect(result).toEqual({ oldAfter: false, shown: "view:Nested", raw: "Nested", disposedAfter: [], quiet: true, authored: true, stale: false });
  });

  test(`${kind} observes mounted fields only and treats retained row reappearance as binding`, async ({ page }) => {
    const result = await page.evaluate(kind => {
      const h = window.collectionValues, calls: unknown[][] = [];
      const owner = h.make(kind, '<span data-field="name"></span><select data-options="choices" data-option-label="label" data-option-value="value"></select>', {
        beforeBindValue(value, context) { calls.push([context.rowId, context.field, value, context.phase]); return `view:${value}`; }
      }, [h.item(), h.item("Beatrice"), h.item("Cy")]);
      const ids = owner.rows.entries().map(row => row.id); owner.handle.select(ids[1]); owner.handle.setPage({ page: 1, size: 1 }); calls.length = 0;
      owner.rows.set(ids[1], "name", "Offscreen"); owner.handle.validate(ids[1]); const offscreen = [...calls];
      owner.handle.setPage({ page: 2, size: 1 }); const remount = [...calls]; calls.length = 0;
      owner.handle.setFilter(() => false); owner.handle.refresh(); const empty = [...calls]; owner.handle.setFilter(null); calls.length = 0; owner.handle.setPage({ page: 2, size: 1 }); const restored = [...calls]; calls.length = 0;
      owner.handle.refresh(); return { offscreen, remount, empty, restored, refresh: calls, selected: owner.handle.selected(), id: ids[1], shown: h.field(owner.root).textContent,
        raw: owner.rows.get(ids[1])!.value.name, onlyNamed: [...remount, ...restored, ...calls].every(call => call[1] === "name"), disabled: kind !== "list" || [...owner.root.querySelectorAll("select")].every(select => select.disabled) };
    }, kind);
    expect(result.offscreen).toEqual([]); expect(result.empty).toEqual([]);
    for (const calls of [result.remount, result.restored, result.refresh]) expect(calls).toEqual([[result.id, "name", "Offscreen", "bind"]]);
    expect(result.selected).toBe(result.id); expect(result.shown).toBe("view:Offscreen"); expect(result.raw).toBe("Offscreen"); expect(result.onlyNamed).toBe(true); expect(result.disabled).toBe(true);
  });

  test(`${kind} stops old placement after a focus handler replaces the shared source`, async ({ page }) => {
    const result = await page.evaluate(kind => {
      const h = window.collectionValues, projected: string[] = []; let replaced = false, inner: Failure | null = null;
      const owner = h.make(kind, '<button type="button" data-select-row>Open</button><span data-field="name"></span>', {
        beforeBindValue(value, context) { if (replaced) projected.push(context.values.name as string); return `view:${value}`; }
      }, [h.item(), h.item("Beatrice")]);
      const buttons = [...owner.root.querySelectorAll<HTMLButtonElement>("button[data-select-row]")]; buttons[0].focus();
      buttons[1].addEventListener("focusin", () => {
        if (replaced) return; replaced = true; inner = h.error(() => owner.rows.replace([h.item("Latest")]));
      });
      const outer = h.error(() => owner.handle.setFilter(value => value.name !== "Ada"));
      const latest = owner.rows.entries()[0], immediate = [...owner.root.querySelectorAll('[data-field="name"]')].map(element => element.textContent);
      const visible = kind === "grid" ? [...(owner.handle as GridHandle<Item>).rowIds("visible")] : null;
      owner.handle.select(latest.id); const selected = owner.root.querySelector("button")?.getAttribute("aria-pressed"); owner.handle.refresh();
      return { replaced, inner: inner?.code ?? null, outer: outer?.code ?? null, immediate, visible, id: latest.id, selected,
        shown: [...owner.root.querySelectorAll('[data-field="name"]')].map(element => element.textContent), raw: latest.value.name, projected };
    }, kind);
    expect(result.replaced).toBe(true); expect(result.immediate).toEqual(["view:Latest"]); expect(result.shown).toEqual(["view:Latest"]); expect(result.raw).toBe("Latest"); expect(result.selected).toBe("true");
    if (kind === "grid") expect(result.visible).toEqual([result.id]);
    for (const code of [result.inner, result.outer]) expect([null, `${kind.toUpperCase()}_BIND_STALE`, `${kind.toUpperCase()}_BIND_REENTRANT`]).toContain(code);
    expect(result.projected.length).toBeGreaterThan(0); expect(result.projected.every(value => value === "Latest")).toBe(true);
  });
}

test("Grid value replacements preserve native grouped controls and reject invalid shapes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.collectionValues, observed: unknown[][] = []; let invalid = "";
    const owner = h.make("grid", '<label>Active <input type="checkbox" data-field="active"></label><label><input type="radio" name="mode" data-field="mode" value="a">A</label><label><input type="radio" name="mode" data-field="mode" value="b">B</label><label><input type="checkbox" data-field="flags" value="a">Flag A</label><label><input type="checkbox" data-field="flags" value="b">Flag B</label>', {
      beforeBindValue(_value, context) { if (context.field === invalid) return context.field === "active" ? "yes" : [{}]; return context.field === "active" ? true : context.field === "mode" ? "b" : ["b"]; },
      onBindValue(value, context) { observed.push([context.field, value, [...context.element.closest("td")!.querySelectorAll<HTMLInputElement>(`input[data-field="${context.field}"]`)].map(input => input.checked)]); return context.field === "active" ? false : context.field === "mode" ? "a" : ["a", "b"]; }
    });
    const checked = (field: string) => [...owner.root.querySelectorAll<HTMLInputElement>(`input[data-field="${field}"]`)].map(input => input.checked);
    const shown = [checked("active"), checked("mode"), checked("flags")]; invalid = "active"; const scalar = h.error(() => owner.handle.refresh()); invalid = "flags"; const array = h.error(() => owner.handle.refresh());
    return { observed: observed.slice(0, 3), shown, scalar: [scalar?.code, scalar?.detail?.field], array: [array?.code, array?.detail?.field], raw: owner.rows.entries()[0].value, changes: owner.rows.changes().length };
  });
  expect(result.observed).toEqual([["active", true, [true]], ["mode", "b", [false, true]], ["flags", ["b"], [false, true]]]);
  expect(result.shown).toEqual([[false], [true, false], [true, true]]); expect(result.scalar).toEqual(["GRID_VALUE", "active"]); expect(result.array).toEqual(["GRID_VALUE", "flags"]);
  expect([result.raw.active, result.raw.mode, result.raw.flags, result.changes]).toEqual([false, "a", ["a"], 0]);
});

test("Grid editing exposes raw focus preserves invalid drafts and projects parsed committed values on blur", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.collectionValues, calls: unknown[][] = [], validations: unknown[][] = [], rows = h.rows([h.item()]);
    const root = h.table('<label>Name <input data-field="name" required minlength="3" data-format=\'[["upper"]]\' data-validate=\'[["raw"]]\'></label><output data-error-for="name"></output><label>Salary <input data-field="salary" data-format=\'[["commas"]]\'></label>');
    const grid = h.api.bindGrid(root, { rows, parse: { salary: value => Number(value) }, rules: { validate: { raw(value, _args, context) { validations.push([value, context.values.name]); return true; } } },
      beforeBindValue(value, context) { calls.push([context.field, value, context.phase]); return context.field === "name" ? `display:${value}` : Number(value) + 1000; } });
    const id = rows.entries()[0].id, name = h.field<HTMLInputElement>(root), salary = h.field<HTMLInputElement>(root, "salary"), initial = [name.value, salary.value];
    name.focus(); const focused = name.value; h.edit(name, "x"); name.dispatchEvent(new Event("change", { bubbles: true })); name.blur(); const draft = { value: name.value, raw: rows.get(id)!.value.name, valid: grid.validate().valid, invalid: name.getAttribute("aria-invalid") };
    name.focus(); h.edit(name, "Beatrice"); name.dispatchEvent(new Event("change", { bubbles: true })); name.blur(); salary.focus(); const salaryRaw = salary.value; h.edit(salary, "007"); salary.dispatchEvent(new Event("change", { bubbles: true })); salary.blur();
    return { initial, focused, draft, salaryRaw, shown: [name.value, salary.value], raw: [rows.get(id)!.value.name, rows.get(id)!.value.salary], originals: [rows.original(id)!.name, rows.original(id)!.salary],
      calls, validationRaw: validations.every(([value, raw]) => value === raw && typeof value === "string" && !value.startsWith("display:")) };
  });
  expect(result.initial).toEqual(["DISPLAY:ADA", "1,120"]); expect(result.focused).toBe("Ada"); expect(result.draft).toEqual({ value: "x", raw: "Ada", valid: false, invalid: "true" });
  expect(result.salaryRaw).toBe("120"); expect(result.shown).toEqual(["DISPLAY:BEATRICE", "1,007"]); expect(result.raw).toEqual(["Beatrice", 7]); expect(result.originals).toEqual(["Ada", 120]);
  expect(result.calls).toContainEqual(["name", "Beatrice", "val"]); expect(result.calls).toContainEqual(["salary", 7, "val"]); expect(result.calls.some(call => call[1] === "x")).toBe(false); expect(result.validationRaw).toBe(true);
});

test("Grid viewport and progressive binding project mounted rows only and stop after disposal", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.collectionValues, results: unknown[] = [];
    for (const mode of ["viewport", "progressive"]) {
      const root = h.table('<span data-field="name"></span>'), host = document.createElement("div"); host.style.cssText = "height:90px;overflow:auto"; root.before(host); host.append(root);
      const rows = h.rows(Array.from({ length: 40 }, (_, index) => h.item(`Row ${index}`))), ids = rows.entries().map(row => row.id), calls: RowId[] = [];
      const grid = h.api.bindGrid(root, { rows, ...(mode === "viewport" ? { viewport: { root: host, estimate: 22, overscan: 1 } } : { progressive: { size: 2, delay: 5 } }),
        beforeBindValue(value, context) { calls.push(context.rowId); return `view:${value}`; } });
      await grid.whenBound(); const initial = new Set(calls).size; calls.length = 0;
      if (mode === "viewport") { grid.reveal(ids.at(-1)!); await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); }
      else await grid.renderMore();
      const advanced = calls.length > 0; calls.length = 0; const offscreen = mode === "viewport" ? ids[0] : ids.at(-1)!;
      rows.set(offscreen, "name", "Offscreen"); grid.validate(offscreen); const hidden = calls.includes(offscreen); grid.dispose(); const restored = root.innerHTML; calls.length = 0;
      rows.set(ids[0], "name", "Late"); await new Promise(resolve => setTimeout(resolve, 20));
      results.push({ mode, initial, advanced, hidden, quiet: root.innerHTML === restored && !calls.includes(ids[0]), source: rows.get(offscreen)!.value.name });
    }
    return results;
  });
  for (const value of result as { mode: string; initial: number; advanced: boolean; hidden: boolean; quiet: boolean; source: string }[]) {
    expect(value.initial).toBeGreaterThan(0); expect(value.initial).toBeLessThan(40); expect(value.advanced).toBe(true); expect(value.hidden).toBe(false); expect(value.quiet).toBe(true); expect(value.source).toBe(value.mode === "viewport" ? "Late" : "Offscreen");
  }
});

test("one application policy serves Form Grid and List while lifecycle and source owners stay separate", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.collectionValues, item = { ...h.item(), active: true }, rows = h.rows([item]), id = rows.entries()[0].id;
    const policy = { prefix: "" }, log: string[] = [], callback: Callback = (value, context) => { log.push(`value:${context.element.closest("[data-kind]")!.getAttribute("data-kind")}`); return policy.prefix + (value ? "Active" : "Inactive"); };
    const shared = Object.freeze({ beforeBindValue: callback });
    const formRoot = document.createElement("form"); formRoot.dataset.kind = "form"; formRoot.innerHTML = '<span data-field="active"></span>'; document.body.append(formRoot);
    const form = h.api.bindForm(formRoot, { rows, ...shared, beforeBind() { log.push("form:before"); }, onBind() { log.push("form:after"); } }); form.bind(id);
    const table = h.table('<span data-field="active"></span>'), grid = h.api.bindGrid(table, { rows, ...shared, beforeRowBind() { log.push("grid:before"); }, onRowBind() { log.push("grid:after"); }, onBind() { log.push("grid:complete"); } });
    const listRoot = h.list('<button type="button" data-select-row>Select</button><span data-kind="list" data-field="active"></span>'), list = h.api.bindList(listRoot, { rows, ...shared }); list.select(id);
    const initial = [...log], original = rows.original(id); policy.prefix = "Now "; form.refresh(); grid.refresh(); list.refresh();
    const shown = [formRoot, table, listRoot].map(root => h.field(root, "active").textContent), selected = list.selected(); rows.set(id, "active", false);
    const updated = [formRoot, table, listRoot].map(root => h.field(root, "active").textContent), raw = rows.get(id)!.value.active;
    form.dispose(); grid.dispose(); policy.prefix = "Last "; list.refresh(); const surviving = h.field(listRoot, "active").textContent;
    list.dispose(); const restored = listRoot.innerHTML; rows.set(id, "active", true);
    return { initial, shown, selected: selected === id, updated, raw, original: original!.active, sameOriginal: rows.original(id) === original, surviving, quiet: listRoot.innerHTML === restored };
  });
  expect(result.initial).toEqual(["form:before", "value:form", "form:after", "grid:before", "value:grid", "grid:after", "grid:complete", "value:list"]);
  expect(result.shown).toEqual(["Now Active", "Now Active", "Now Active"]); expect(result.updated).toEqual(["Now Inactive", "Now Inactive", "Now Inactive"]);
  expect(result.selected).toBe(true); expect(result.raw).toBe(false); expect(result.original).toBe(true); expect(result.sameOriginal).toBe(true); expect(result.surviving).toBe("Last Inactive"); expect(result.quiet).toBe(true);
});
