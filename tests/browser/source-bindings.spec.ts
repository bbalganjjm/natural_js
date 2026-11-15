// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RowId, Rows } from "../../src/data/index.js";
import type { FormHandle, GridHandle, ListHandle, SourceBindContext, ValueBindContext } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindGrid } from "../../src/ui/grid.js";
import type { bindList } from "../../src/ui/list.js";
import type { bindSelect } from "../../src/ui/select.js";
import type { bindChoiceGroup } from "../../src/ui/choice-group.js";
import type { createRows } from "../../src/data/index.js";

type Row = Record<string, unknown>;
type Kind = "Form" | "Grid" | "List";
type Context = SourceBindContext<Row>;
type Failure = { code: string; key: string | null; callback: string | null; phase: string | null; cause: unknown };
type Owner = { root: HTMLElement; rows: Rows<Row>; id: RowId; handle: { refresh(): unknown; dispose(): void };
  form?: FormHandle<Row>; grid?: GridHandle<Row>; list?: ListHandle<Row>; settle(): Promise<unknown>; destroy(): void };
declare global {
  interface Window {
    sourceFixture: {
      api: { bindForm: typeof bindForm; bindGrid: typeof bindGrid; bindList: typeof bindList; bindSelect: typeof bindSelect;
        bindChoiceGroup: typeof bindChoiceGroup; createRows: typeof createRows };
      native: { observeSourceAttachments(next?: (element: HTMLElement, phase: "connected" | "disconnected") => void): void };
      markup(kind: Kind): string;
      root(kind: Kind, html?: string, attached?: boolean): HTMLElement;
      open(kind: Kind, data: readonly Row[], options?: Record<string, unknown>, html?: string, attached?: boolean): Owner;
      field<E extends HTMLElement = HTMLElement>(root: ParentNode, field: string): E;
      shown(element: HTMLElement): string;
      failure(run: () => unknown): Failure | null;
      row(): Row;
    };
  }
}
const source = (relative: string) => "/@fs/" + fileURLToPath(new URL(relative, import.meta.url)).replaceAll("\\", "/");
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts"), native: source("./fixtures/source-hook-target.ts") };
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm, bindGrid, bindList, bindSelect, bindChoiceGroup }, { createRows }, native] = await Promise.all([import(modules.ui), import(modules.data), import(modules.native)]);
    const select = '<select aria-label="Choice" data-field="chosen" data-options="choices" data-option-label="label" data-option-value="code"><option value="">Choose</option></select>';
    const h: Window["sourceFixture"] = {
      api: { bindForm, bindGrid, bindList, bindSelect, bindChoiceGroup, createRows }, native,
      markup(kind) {
        if (kind === "Form") return '<label>Missing <input data-field="missing" value="Authored missing"></label><label>Choice ' + select + '</label><label>Name <input data-field="profile.name" value="Authored name"></label>';
        if (kind === "Grid") return '<caption>Source records</caption><thead><tr><th scope="col">Missing</th><th scope="col">Choice</th><th scope="col">Name</th></tr></thead><tbody><tr data-row-template><td data-field="missing">Authored missing</td><td>' + select + '</td><td data-field="profile.name">Authored name</td></tr></tbody>';
        return '<li data-row-template><span data-field="missing">Authored missing</span>' + select + '<span data-field="profile.name">Authored name</span><button type="button" data-select-row>Select</button></li>';
      },
      root(kind, html = h.markup(kind), attached = true) { const root = document.createElement(kind === "Form" ? "form" : kind === "Grid" ? "table" : "ul"); root.setAttribute("aria-label", "Source " + kind); root.innerHTML = html; if (attached) document.body.append(root); return root; },
      open(kind, data, options = {}, html, attached) {
        const root = h.root(kind, html, attached), rows = createRows<Row>(data), id = rows.entries()[0]?.id ?? 1;
        const configuration: Record<string, unknown> = Object.create(options); Object.defineProperty(configuration, "rows", { value: rows, enumerable: true });
        let form: FormHandle<Row> | undefined, grid: GridHandle<Row> | undefined, list: ListHandle<Row> | undefined;
        if (kind === "Form") { form = bindForm<Row>(root, configuration); if (data.length) form.bind(id); }
        else if (kind === "Grid") grid = bindGrid<Row>(root as HTMLTableElement, configuration as Parameters<typeof bindGrid<Row>>[1]);
        else list = bindList<Row>(root as HTMLUListElement, configuration as Parameters<typeof bindList<Row>>[1]);
        const handle = form ?? grid ?? list!;
        return { root, rows, id, handle, form, grid, list, settle: () => grid?.whenBound() ?? Promise.resolve(), destroy() { handle.dispose(); rows.dispose(); root.remove(); } };
      },
      field(root, field) { return root.querySelector('[data-field="' + field + '"]')! as never; },
      shown(element) { return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement ? element.value : element.textContent ?? ""; },
      failure(run) { try { run(); return null; } catch (cause) { const error = cause as { code?: string; detail?: { key?: string; callback?: string; phase?: string }; cause?: unknown };
        return { code: error?.code ?? "primitive", key: error?.detail?.key ?? null, callback: error?.detail?.callback ?? null, phase: error?.detail?.phase ?? null,
          cause: error?.cause instanceof Error ? error.cause.message : error?.cause ?? cause }; } },
      row() { return Object.fromEntries([["2", "second"], ["0", "zero"], ["choices", [{ code: 1, label: "Number" }, { code: "1", label: "String" }]],
        ["profile", { name: "Ada", note: "Unmarked" }], ["chosen", 1], ["secret", { token: "hidden" }], ["profile.name", "Literal metadata"], ["toString", "Own value"], ["__proto__", { safe: true }]]); }
    }; window.sourceFixture = h;
  }, modules);
});

for (const kind of ["Form", "Grid", "List"] as const) {
  test(kind + " source pairs follow own raw key order and share frozen full context around one assigned native pass", async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.sourceFixture, input = h.row(), calls: string[] = [], observations: unknown[] = [], contexts = new Map<string, Context>(); let plain = true;
      const returns: unknown[] = [false, null, 0, "", {}, undefined]; let index = 0;
      const owner = h.open(kind, [input], {
        beforeSourceBind: function(this: unknown, raw: unknown, context: Context) { "use strict";
          plain &&= this === undefined; calls.push("before:" + context.key); contexts.set(context.key, context);
          observations.push({ key: context.key, raw: raw === context.row.value[context.key], full: Object.keys(context.row.value), phase: context.phase,
            frozen: Object.isFrozen(context) && Object.isFrozen(context.elements) && Object.isFrozen(context.row) && Object.isFrozen(context.row.value),
            unique: new Set(context.elements).size === context.elements.length, targets: context.elements.map(element => element.getAttribute("data-field")) });
          return returns[index++ % returns.length];
        },
        onSourceBind: function(this: unknown, _raw: unknown, context: Context) { "use strict"; plain &&= this === undefined; calls.push("after:" + context.key); if (contexts.get(context.key) !== context) throw new Error("Different pair context"); return false; },
        beforeBindValue(_value: unknown, context: ValueBindContext) { calls.push("value:" + context.field); }
      }); await owner.settle();
      const keys = Object.keys(input), sourceTrace = calls.filter(call => !call.startsWith("value:"));
      const values = calls.filter(call => call.startsWith("value:")), order = calls.indexOf("value:profile.name") > calls.indexOf("before:profile") && calls.indexOf("value:profile.name") < calls.indexOf("after:profile") &&
        calls.indexOf("value:chosen") > calls.indexOf("before:chosen") && calls.indexOf("value:chosen") < calls.indexOf("after:chosen") && calls.indexOf("value:missing") > calls.indexOf("after:__proto__");
      const select = h.field<HTMLSelectElement>(owner.root, "chosen"), output = { keys, sourceTrace, values, order, observations, plain,
        name: h.shown(h.field(owner.root, "profile.name")), missing: h.shown(h.field(owner.root, "missing")), choice: select.selectedOptions[0].textContent,
        source: owner.rows.get(owner.id)!.value, unchanged: owner.rows.changes().length === 0, ids: new Set([...document.querySelectorAll("[id]")].map(element => element.id)).size === document.querySelectorAll("[id]").length };
      owner.destroy();
      const bare: string[] = [], bareHtml = kind === "Grid" ? '<caption>Unmarked records</caption><thead><tr><th scope="col">Content</th></tr></thead><tbody><tr data-row-template><td>Authored content</td></tr></tbody>' : kind === "List" ? '<li data-row-template>Authored content</li>' : '<p>Authored content</p>';
      const unmarked = h.open(kind, [{ flag: false, zero: 0 }], { beforeSourceBind(_raw: unknown, context: Context) { if (context.elements.length) throw new Error("Fabricated target"); bare.push("before:" + context.key); }, onSourceBind(_raw: unknown, context: Context) { bare.push("after:" + context.key); } }, bareHtml);
      await unmarked.settle(); unmarked.destroy(); return { ...output, bare };
    }, kind);
    const keys = ["0", "2", "choices", "profile", "chosen", "secret", "profile.name", "toString", "__proto__"];
    expect(result.keys).toEqual(keys); expect(result.sourceTrace).toEqual(keys.flatMap(key => ["before:" + key, "after:" + key]));
    expect(result.values).toEqual(["value:profile.name", "value:chosen", "value:missing"]); expect(result.order).toBe(true);
    expect(result.observations).toEqual(keys.map(key => ({ key, raw: true, full: keys, phase: "bind", frozen: true, unique: true,
      targets: key === "profile" ? ["profile.name"] : key === "chosen" ? ["chosen"] : [] })));
    expect(result).toMatchObject({ plain: true, name: "Ada", missing: "", choice: "Number", unchanged: true, ids: true });
    expect(result.bare).toEqual(["before:flag", "after:flag", "before:zero", "after:zero"]);
    expect(result.source.secret).toEqual({ token: "hidden" }); expect(result.source["profile.name"]).toBe("Literal metadata");
  });

  test(kind + " assigns catalog-only work once and clears absent fields without inventing source pairs", async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.sourceFixture, scenarios: unknown[] = [];
      for (const chosenFirst of [false, true]) {
        const data = chosenFirst ? { chosen: 1, choices: [{ code: 1, label: "First" }], profile: { name: "Ada" }, missing: "Present" }
          : { choices: [{ code: 1, label: "First" }], chosen: 1, profile: { name: "Ada" }, missing: "Present" };
        const trace: { key: string; fields: (string | null)[]; phase: string }[] = []; let valueCalls = 0;
        const owner = h.open(kind, [data], { onSourceBind(_raw: unknown, context: Context) { trace.push({ key: context.key, fields: context.elements.map(e => e.getAttribute("data-field")), phase: context.phase }); },
          beforeBindValue(_raw: unknown, context: ValueBindContext) { if (context.field === "chosen") valueCalls++; } }); await owner.settle();
        const full = [...trace], initialValueCalls = valueCalls; trace.length = 0;
        owner.rows.set(owner.id, "choices", [{ code: 1, label: "Renamed" }, { code: "1", label: "String" }]); await owner.settle();
        const catalog = [...trace], catalogValueCalls = valueCalls - initialValueCalls, renamed = h.field<HTMLSelectElement>(owner.root, "chosen").selectedOptions[0].textContent; trace.length = 0;
        owner.rows.setMany([{ id: owner.id, values: { choices: [{ code: 1, label: "Number" }, { code: "1", label: "String" }], chosen: "1" } }]); await owner.settle();
        const both = [...trace], selected = h.field<HTMLSelectElement>(owner.root, "chosen").selectedOptions[0].textContent; trace.length = 0;
        const { missing: _missing, ...complete } = owner.rows.get(owner.id)!.value; owner.rows.restore(owner.id, complete); await owner.settle();
        const removed = { trace: [...trace], shown: h.shown(h.field(owner.root, "missing")) }; trace.length = 0;
        const absent = h.failure(() => owner.rows.restore(owner.id, { profile: { name: "Broken" }, chosen: 1 })); await owner.settle();
        const empty = h.field<HTMLSelectElement>(owner.root, "chosen"), missingCatalog = { code: absent?.code ?? null,
          present: Object.hasOwn(owner.rows.get(owner.id)!.value, "choices"), raw: owner.rows.get(owner.id)!.value.chosen,
          selected: empty.selectedIndex, labels: [...empty.options].map(option => option.textContent),
          unavailable: (owner.form ?? owner.grid ?? owner.list!).validate().issues.some(issue => issue.field === "chosen" && issue.rule === "select-option") };
        const failure = h.failure(() => owner.rows.restore(owner.id, { profile: { name: "Broken" }, chosen: 1, choices: {} }));
        scenarios.push({ chosenFirst, full, catalog, catalogValueCalls, renamed, both, selected, removed, missingCatalog, malformedCatalog: failure?.code }); owner.destroy();
      }
      return scenarios;
    }, kind);
    for (const scenario of result) {
      expect(scenario.full.filter(item => item.fields.includes("chosen"))).toEqual([{ key: "chosen", fields: ["chosen"], phase: "bind" }]);
      expect(scenario.catalog).toEqual([{ key: "choices", fields: ["chosen"], phase: "val" }]); expect(scenario.catalogValueCalls).toBe(0); expect(scenario.renamed).toBe("Renamed");
      expect(scenario.both.filter(item => item.fields.includes("chosen"))).toEqual([{ key: "chosen", fields: ["chosen"], phase: "val" }]); expect(scenario.selected).toBe("String");
      expect(scenario.removed).toEqual({ trace: [], shown: "" });
      expect(scenario.missingCatalog).toEqual({ code: null, present: false, raw: 1, selected: -1, labels: ["Choose"], unavailable: true });
      expect(scenario.malformedCatalog).toMatch(/OPTIONS/);
    }
  });

  test(kind + " captures inherited source getters once including absence and preserves plain bound and live forwarding receivers", async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.sourceFixture; let beforeReads = 0, afterReads = 0, absentReads = 0, late = 0, plain = true, count = 0;
      const before = function(this: unknown) { "use strict"; plain &&= this === undefined; count++; };
      const proto = Object.defineProperties({}, { beforeSourceBind: { configurable: true, get() { beforeReads++; return before; } }, onSourceBind: { configurable: true, get() { afterReads++; return undefined; } } });
      const options: Record<string, unknown> = Object.create(proto), owner = h.open(kind, [{ profile: { name: "Ada" }, choices: [], chosen: null }], options); await owner.settle();
      const initial = count; Object.defineProperty(proto, "beforeSourceBind", { value: () => late++ }); Object.defineProperty(proto, "onSourceBind", { value: () => late++ }); owner.handle.refresh(); await owner.settle();
      Reflect.deleteProperty(proto, "beforeSourceBind"); owner.handle.refresh(); await owner.settle();
      const coldOptions = Object.defineProperty({}, "beforeSourceBind", { configurable: true, get() { absentReads++; return undefined; } });
      const cold = h.open(kind, [{ profile: { name: "Cold" }, choices: [], chosen: null }], coldOptions); Object.defineProperty(coldOptions, "beforeSourceBind", { value: () => late++ }); cold.handle.refresh(); await cold.settle();
      let onlyAfter = 0; const afterOnlyOptions = Object.defineProperty({ onSourceBind() { onlyAfter++; } }, "beforeSourceBind", { configurable: true, value: undefined });
      const afterOnly = h.open(kind, [{ profile: { name: "After" }, choices: [], chosen: null }], afterOnlyOptions); Object.defineProperty(afterOnlyOptions, "beforeSourceBind", { value: () => late++ }); afterOnly.handle.refresh(); await afterOnly.settle(); afterOnly.destroy();
      const bound: string[] = []; const callback = function(this: { prefix: string }, _raw: unknown, context: Context) { "use strict"; bound.push(this.prefix + context.key); };
      const boundOwner = h.open(kind, [{ profile: { name: "Bound" }, choices: [], chosen: null }], { beforeSourceBind: callback.bind({ prefix: "bound:" }) }); await boundOwner.settle();
      const forwarded: string[] = []; let policy = (_raw: unknown, context: Context) => { forwarded.push("first:" + context.key); };
      const live = h.open(kind, [{ profile: { name: "Live" }, choices: [], chosen: null }], { beforeSourceBind: (raw: unknown, context: Context) => policy(raw, context) }); await live.settle();
      policy = (_raw, context) => { forwarded.push("second:" + context.key); }; live.handle.refresh(); await live.settle();
      owner.destroy(); cold.destroy(); boundOwner.destroy(); live.destroy(); const invalidRoot = h.root(kind), rows = h.api.createRows([{ secret: 1 }]); let invalid: Failure | null;
      const invalidOptions = { rows }; Reflect.set(invalidOptions, "beforeSourceBind", false);
      invalid = h.failure(() => kind === "Form" ? h.api.bindForm(invalidRoot, invalidOptions) : kind === "Grid" ? h.api.bindGrid(invalidRoot as HTMLTableElement, invalidOptions) : h.api.bindList(invalidRoot as HTMLUListElement, invalidOptions));
      rows.dispose(); invalidRoot.remove(); let local: string | null = null;
      if (kind === "Form") { const localRoot = h.root("Form", '<label>Local <input data-field="name"></label>'); local = h.failure(() => h.api.bindForm(localRoot, { onSourceBind() {} }))?.code ?? null; const ordinary = h.api.bindForm(localRoot); ordinary.dispose(); localRoot.remove(); }
      return { beforeReads, afterReads, absentReads, late, plain, initial, total: count, onlyAfter, bound, forwarded, invalid: invalid?.code, local };
    }, kind);
    expect(result).toMatchObject({ beforeReads: 1, afterReads: 1, absentReads: 1, late: 0, plain: true, initial: 3, total: 9, onlyAfter: 6, invalid: kind.toUpperCase() + "_SOURCE_OPTIONS" });
    expect(result.bound).toEqual(["bound:profile", "bound:choices", "bound:chosen"]); expect(result.forwarded).toEqual(["first:profile", "first:choices", "first:chosen", "second:profile", "second:choices", "second:chosen"]);
    expect(result.local).toBe(kind === "Form" ? "FORM_SOURCE_OPTIONS" : null);
  });

  test(kind + " changed passes compare accepted own values without false nested cycles equal writes or movement work", async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.sourceFixture, trace: unknown[] = [], owner = h.open(kind, [{ profile: { name: "Ada" }, choices: [], chosen: null, secret: { nested: [1] }, count: 1 }, { profile: { name: "Grace" }, choices: [], chosen: null, secret: { nested: [2] }, count: 9 }], {
        onSourceBind(raw: unknown, context: Context) { trace.push([context.key, context.phase, raw === context.row.value[context.key], context.row.status]); }
      }); await owner.settle(); trace.length = 0;
      owner.rows.set(owner.id, "count", 1); owner.form?.read(); owner.rows.move(owner.id); await owner.settle(); const quiet = [...trace];
      owner.rows.set(owner.id, "count", 2); await owner.settle(); const changed = [...trace]; trace.length = 0;
      owner.rows.set(owner.id, "secret", { nested: [1] }); await owner.settle(); const equalNested = [...trace];
      owner.rows.remove(owner.id); await owner.settle(); const status = [...trace]; owner.destroy(); return { quiet, changed, equalNested, status };
    }, kind);
    expect(result).toEqual({ quiet: [], changed: [["count", "val", true, "update"]], equalNested: [], status: [] });
  });

  test(kind + " callback failure async results and reentry stop stale tails drain rejected work and allow explicit retry", async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.sourceFixture, results: unknown[] = []; let unhandled = 0;
      const rejection = (event: PromiseRejectionEvent) => { unhandled++; event.preventDefault(); }; window.addEventListener("unhandledrejection", rejection);
      for (const mode of ["throw", "async", "after-throw", "after-async", "reentry", "dispose-async"]) {
        const trace: string[] = []; let armed = false; let owner: Owner;
        owner = h.open(kind, [{ profile: { name: "Ada" }, choices: [], chosen: null, secret: 1 }], {
          beforeSourceBind(_raw: unknown, context: Context) {
            trace.push("before:" + context.key); if (!armed || mode.startsWith("after-")) return; armed = false;
            if (mode === "throw") throw 0;
            if (mode === "reentry") return owner.handle.refresh();
            if (mode === "dispose-async") owner.handle.dispose();
            return Promise.reject(new Error("Rejected source observer"));
          }, onSourceBind(_raw: unknown, context: Context) { trace.push("after:" + context.key); if (armed && mode.startsWith("after-")) { armed = false; if (mode === "after-throw") throw 0; return Promise.reject(new Error("Rejected after-source observer")); } }
        }); await owner.settle(); trace.length = 0; armed = true;
        let failure = h.failure(() => owner.handle.refresh()); if (owner.grid) try { await owner.grid.whenBound(); } catch (cause) { if (!failure) failure = h.failure(() => { throw cause; }); }
        const stopped = [...trace]; await Promise.resolve(); await new Promise<void>(resolve => setTimeout(resolve, 0));
        let recovered = false; if (mode !== "dispose-async") { trace.length = 0; owner.handle.refresh(); await owner.settle(); recovered = trace.includes("after:secret"); }
        results.push({ mode, failure: failure?.code ?? null, key: failure?.key ?? null, callback: failure?.callback ?? null, stopped, recovered }); owner.destroy();
      }
      window.removeEventListener("unhandledrejection", rejection); return { results, unhandled };
    }, kind);
    expect(result.unhandled).toBe(0);
    for (const value of result.results as { mode: string; failure: string | null; key: string | null; callback: string | null; stopped: string[]; recovered: boolean }[]) {
      expect(value.stopped).toEqual(value.mode.startsWith("after-") ? ["before:profile", "after:profile"] : ["before:profile"]); expect(value.recovered).toBe(value.mode !== "dispose-async");
      if (["throw", "async", "after-throw", "after-async"].includes(value.mode)) { expect(value.failure).toBe(kind.toUpperCase() + "_SOURCE"); expect(value.key).toBe("profile"); expect(value.callback).toBe(value.mode.startsWith("after-") ? "onSourceBind" : "beforeSourceBind"); }
      if (value.mode === "reentry") expect(value.failure).toBe(kind === "Form" ? "FORM_SOURCE" : kind.toUpperCase() + "_BIND_REENTRANT");
      if (value.mode === "dispose-async") expect(value.failure).not.toBe(kind.toUpperCase() + "_SOURCE");
    }
  });

  test(kind + " without source hooks preserves compiled field order and typed native output", async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.sourceFixture, fields: string[] = [], owner = h.open(kind, [h.row()], { beforeBindValue(_raw: unknown, context: ValueBindContext) { fields.push(context.field); } }); await owner.settle();
      const output = { fields, name: h.shown(h.field(owner.root, "profile.name")), choice: h.field<HTMLSelectElement>(owner.root, "chosen").selectedOptions[0].textContent, changes: owner.rows.changes().length };
      owner.destroy(); return output;
    }, kind);
    expect(result).toEqual({ fields: kind === "Form" ? ["missing", "chosen", "profile.name"] : ["missing", "profile.name", "chosen"], name: "Ada", choice: "Number", changes: 0 });
  });
}

test("Form selected refresh distinguishes compiled paths from literal source keys and never accepts a partial row", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sourceFixture, seen: { key: string; phase: string; fields: (string | null)[] }[] = [];
    let fail = false;
    const owner = h.open("Form", [{ profile: { name: "Ada" }, choices: [{ code: 1, label: "One" }], chosen: 1, hidden: "old", "profile.name": "Literal" }], {
      beforeSourceBind(_raw: unknown, context: Context) { seen.push({ key: context.key, phase: context.phase, fields: context.elements.map(e => e.getAttribute("data-field")) });
        if (fail && context.key === "chosen") throw new Error("Stop after profile"); }
    });
    seen.length = 0; owner.form!.refresh(["hidden", "profile.name", "hidden"]);
    const selected = [...seen]; seen.length = 0;
    const unknown = h.failure(() => owner.form!.refresh(["absent"]));
    fail = true;
    const failed = h.failure(() => owner.rows.setMany([{ id: owner.id, values: { profile: { name: "Grace" }, chosen: null, hidden: "new" } }]));
    fail = false; seen.length = 0; owner.form!.refresh(["profile.name"]);
    const partial = [...seen]; seen.length = 0; owner.rows.set(owner.id, "extra", 1);
    const retry = [...seen], name = h.shown(h.field(owner.root, "profile.name")); owner.destroy();
    return { selected, unknown: unknown?.code, failed: failed?.code, partial, retry, name };
  });
  expect(result.selected).toEqual([{ key: "profile", phase: "bind", fields: ["profile.name"] }, { key: "hidden", phase: "bind", fields: [] }]);
  expect(result.unknown).toBe("FORM_BIND"); expect(result.failed).toBe("FORM_SOURCE");
  expect(result.partial).toEqual([{ key: "profile", phase: "bind", fields: ["profile.name"] }]);
  expect(result.retry.map(item => item.key)).toEqual(["profile", "chosen", "hidden", "extra"]); expect(result.retry.every(item => item.phase === "val")).toBe(true); expect(result.name).toBe("Grace");
});

test("Form preserves same-row source recursion errors and lets a newer association finish independently", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.sourceFixture, trace: string[] = []; let action: "none" | "same" | "other" = "none", owner: Owner;
    owner = h.open("Form", [{ profile: { name: "Ada" }, choices: [], chosen: null }, { profile: { name: "Grace" }, choices: [], chosen: null }], {
      beforeSourceBind(_raw: unknown, context: Context) { trace.push("before:" + context.row.id + ":" + context.key);
        if (context.key === "profile" && action !== "none") { const next = action; action = "none"; if (next === "same") owner.form!.refresh(); else owner.form!.bind(2); } },
      onSourceBind(_raw: unknown, context: Context) { trace.push("after:" + context.row.id + ":" + context.key); }
    });
    trace.length = 0; action = "same"; const same = h.failure(() => owner.form!.refresh());
    trace.length = 0; action = "other"; const other = h.failure(() => owner.form!.refresh());
    const redirected = [...trace], name = h.shown(h.field(owner.root, "profile.name")); trace.length = 0;
    owner.rows.set(2, "hidden", "new"); const accepted = [...trace]; owner.destroy(); return { same: same?.code, other: other?.code ?? null, redirected, name, accepted };
  });
  expect(result.same).toBe("FORM_SOURCE"); expect(result.other).toBeNull(); expect(result.name).toBe("Grace");
  expect(result.redirected).not.toContain("after:1:profile"); expect(result.redirected).toContain("after:2:chosen");
  expect(result.accepted).toEqual(["before:2:hidden", "after:2:hidden"]);
});

test("Form source observers stay quiet for preparation defaults catalog publication and preview reset while value deletion retains its guard", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.sourceFixture, root = h.root("Form", '<label>Name <input data-field="name" value="Authored"></label><fieldset data-field="roles"><legend>Roles</legend><template data-choice-template><label><input type="checkbox"><span data-choice-label></span></label></template></fieldset>');
    const group = h.api.bindChoiceGroup(root.querySelector("fieldset")!, { choices: [{ value: "a", label: "A" }], value: ["a"] });
    const rows = h.api.createRows([{ name: "Ada", roles: ["a"], hidden: 1 }]), id = rows.entries()[0].id, trace: string[] = [];
    const form = h.api.bindForm(root, { rows, onSourceBind(_raw, context) { trace.push(context.key); } }); form.bind(id); trace.length = 0;
    const input = h.field<HTMLInputElement>(root, "name"); input.value = "Direct draft";
    const before = { value: rows.get(id)!.value, changes: rows.changes(), markup: root.innerHTML, focus: document.activeElement };
    const prepared = form.prepare(); form.read(); form.defaults(); group.setChoices([]); const unavailable = form.prepare(); group.setChoices([{ value: "a", label: "A" }]);
    const available = form.prepare(), quiet = trace.length === 0, unchanged = rows.get(id)!.value === before.value && rows.changes().length === before.changes.length && input.value === "Direct draft";
    rows.remove(id); trace.length = 0; (root as HTMLFormElement).reset(); await new Promise<void>(resolve => setTimeout(resolve, 0)); form.read();
    const preview = { quiet: trace.length === 0, disabled: input.disabled, value: input.value, status: rows.get(id)!.status, original: rows.original(id), roles: group.value() };
    form.dispose(); group.dispose(); rows.dispose(); root.remove();
    const observed: unknown[] = []; let observe = false;
    const focused = h.open("Form", [{ name: "Ada" }], { onSourceBind(raw: unknown, context: Context) { if (observe) observed.push([raw, h.shown(context.elements[0])]); } }, '<label>Focused name <input data-field="name"></label>');
    const focusedInput = h.field<HTMLInputElement>(focused.root, "name"); focusedInput.focus(); observe = true; focused.rows.set(focused.id, "name", "Grace");
    const focusedValues = focused.form!.prepare().values, focusedRow = focused.rows.get(focused.id)!.value; focused.destroy();
    let deleting = false; const removal = h.open("Form", [{ name: "Ada", audit: 1 }], {
      beforeSourceBind() {}, beforeBindValue(_raw: unknown, context: ValueBindContext) { if (deleting && context.field === "name") removal.rows.remove(removal.id); }
    }, '<label>Name <input data-field="name"></label>');
    deleting = true; const failure = h.failure(() => removal.rows.set(removal.id, "name", "Grace"));
    const locked = h.field<HTMLInputElement>(removal.root, "name").disabled, status = removal.rows.get(removal.id)!.status;
    const retry = h.failure(() => removal.form!.refresh()); const final = h.shown(h.field(removal.root, "name")); removal.destroy();
    return { prepared: prepared.values, valid: prepared.valid, unavailable: unavailable.valid, available: available.valid, quiet, unchanged, preview, focused: { observed, values: focusedValues, row: focusedRow },
      removal: { code: failure?.code, locked, status, retry: retry?.code ?? null, final } };
  });
  expect(result.prepared).toEqual({ name: "Direct draft", roles: ["a"] }); expect(result).toMatchObject({ valid: true, unavailable: false, available: true, quiet: true, unchanged: true });
  expect(result.preview).toEqual({ quiet: true, disabled: true, value: "Ada", status: "delete", original: { name: "Ada", roles: ["a"], hidden: 1 }, roles: ["a"] });
  expect(result.focused).toEqual({ observed: [["Grace", "Ada"]], values: { name: "Ada" }, row: { name: "Grace" } });
  expect(result.removal).toEqual({ code: "FORM_VALUE", locked: true, status: "delete", retry: null, final: "Grace" });
});

test("List accepts source snapshots only after row callbacks and later-row cleanup succeed", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.sourceFixture, results = [];
    for (const mode of ["row", "cleanup"] as const) {
      let armed = false, released = 0; const seen: string[] = [];
      const owner = h.open("List", [{ name: "Ada", hidden: "old" }, { name: "Grace", hidden: "old" }], {
        onSourceBind(_raw: unknown, context: Context) { seen.push(context.row.id + ":" + context.key); },
        onRowBind(context: { row: { id: number }; own(cleanup: () => void): void }) {
          context.own(() => { released++; if (armed && mode === "cleanup") { armed = false; throw new Error("Cleanup tail"); } });
          if (armed && mode === "row" && context.row.id === 2) { armed = false; throw new Error("Later row tail"); }
        }
      }, '<li data-row-template><span data-field="name"></span></li>');
      armed = true; const failure = h.failure(() => owner.rows.setMany([{ id: 1, values: { hidden: "new" } }, { id: 2, values: { hidden: "new" } }]));
      seen.length = 0; owner.rows.setMany([{ id: 1, values: { name: "A" } }, { id: 2, values: { name: "G" } }]); await owner.settle();
      results.push({ mode, code: failure?.code, seen: [...seen], released, shown: [...owner.root.querySelectorAll('[data-field="name"]')].map(e => e.textContent) }); owner.destroy();
    }
    return results;
  });
  for (const entry of result) { expect(entry.code).toBe("LIST_BIND"); expect(entry.seen).toContain("1:hidden"); expect(entry.seen).toContain("2:hidden"); expect(entry.shown).toEqual(["A", "G"]); expect(entry.released).toBeGreaterThan(0); }
});

test("Grid accepts source snapshots after the completion tail rather than an early native snapshot", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.sourceFixture, seen: string[] = []; let armed = false;
    const owner = h.open("Grid", [{ name: "Ada", hidden: "old" }, { name: "Grace", hidden: "old" }], {
      onSourceBind(_raw: unknown, context: Context) { seen.push(context.row.id + ":" + context.key); }, onBind() { if (armed) { armed = false; throw new Error("Completion tail"); } }
    }, '<caption>Tail records</caption><thead><tr><th scope="col">Name</th></tr></thead><tbody><tr data-row-template><td data-field="name"></td></tr></tbody>'); await owner.settle();
    owner.rows.setMany([{ id: 1, values: { hidden: "new" } }, { id: 2, values: { hidden: "new" } }]); await owner.settle();
    armed = true; const failure = h.failure(() => owner.grid!.refresh());
    await owner.grid!.whenBound().catch(() => {}); seen.length = 0;
    owner.rows.setMany([{ id: 1, values: { name: "A" } }, { id: 2, values: { name: "G" } }]); await owner.settle();
    const output = { code: failure?.code, seen, text: [...owner.root.querySelectorAll('[data-field="name"]')].map(e => e.textContent) }; owner.destroy(); return output;
  });
  expect(result.code).toBe("GRID_BIND"); expect(result.seen).toEqual(["1:name", "1:hidden", "2:name", "2:hidden"]); expect(result.text).toEqual(["A", "G"]);
});

test("Grid progressive cancellation does not publish incomplete source acceptance and retry retains independent owners", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.sourceFixture, seen: string[] = []; let cancel = false;
    const html = '<caption>Progressive sources</caption><thead><tr><th scope="col">Name</th></tr></thead><tbody><tr data-row-template><td data-field="name"></td></tr></tbody>';
    const owner = h.open("Grid", [{ name: "Ada", hidden: "a" }, { name: "Grace", hidden: "b" }, { name: "Linus", hidden: "c" }], {
      progressive: { size: 1, delay: 0 }, onSourceBind(_raw: unknown, context: Context) { seen.push(context.row.id + ":" + context.key); },
      onBind() { if (cancel) { cancel = false; owner.grid!.cancelBinding(); } }
    }, html); await owner.settle(); const sibling = h.open("Grid", [{ name: "Independent", hidden: 1 }], { beforeSourceBind() {} }, html); await sibling.settle();
    cancel = true; const canceled = await owner.grid!.renderMore().then(() => "resolved", error => error.name);
    seen.length = 0; owner.rows.set(2, "name", "Grace 2"); await owner.settle(); const retry = [...seen];
    owner.handle.refresh(); await owner.settle(); const first = await owner.grid!.whenBound(); while (!(await owner.grid!.whenBound()).last) await owner.grid!.renderMore();
    const all = owner.grid!.rowIds("visible"), siblingText = h.shown(h.field(sibling.root, "name")); owner.destroy();
    sibling.rows.set(sibling.id, "name", "Survives"); await sibling.settle(); const survives = h.shown(h.field(sibling.root, "name")); sibling.destroy();
    return { canceled, retry, first: first.available, all, siblingText, survives };
  });
  expect(result.canceled).toBe("AbortError"); expect(result.retry).toContain("2:hidden"); expect(result.first).toBeGreaterThan(0); expect(result.all).toEqual([1, 2, 3]); expect(result).toMatchObject({ siblingText: "Independent", survives: "Survives" });
});

test("Grid source ownership preserves newer policies and rolls back only the failed generation", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.sourceFixture, outcomes = [];
    const html = '<caption>Policy ownership</caption><thead><tr><th scope="col" data-column="name">Name</th><th scope="col" data-column="optional">Optional</th></tr></thead><tbody><tr data-row-template><td data-column="name" data-field="name"></td><td data-column="optional" data-field="optional" data-format=\'[["tail"]]\'></td></tr></tbody>';
    for (const mode of ["cancel", "new-filter", "new-sort", "same-filter", "pre-filter", "pre-sort", "column"] as const) {
      let armed = false; let owner: Owner;
      owner = h.open("Grid", [{ name: "Ada", optional: "x", audit: 1 }, { name: "Grace", optional: "y", audit: 1 }], {
        beforeSourceBind() {}, filters: { name: { value: (row: Row) => { if (armed && mode === "column") { armed = false; throw new Error("Same-generation column failure"); } return row.name; } } }, rules: { format: { tail(value: unknown) {
          if (armed) { armed = false; if (mode === "cancel") owner.grid!.cancelBinding(); else if (mode === "new-filter") owner.grid!.setFilter(row => row.name === "Grace");
            else if (mode === "new-sort") owner.grid!.setSort((a, b) => String(b.name).localeCompare(String(a.name))); else throw new Error("Same-generation formatter failure"); }
          return String(value ?? ""); } } }
      }, html); await owner.settle(); let failure: Failure | null = null;
      if (mode === "pre-filter") { let once = true; failure = h.failure(() => owner.grid!.setFilter(() => { if (once) { once = false; owner.grid!.setFilter(row => row.name === "Grace"); } return true; })); }
      else if (mode === "pre-sort") { let once = true; failure = h.failure(() => owner.grid!.setSort(() => { if (once) { once = false; owner.grid!.setSort((a, b) => String(b.name).localeCompare(String(a.name))); } return 0; })); }
      else if (mode === "same-filter" || mode === "column") {
        armed = true;
        failure = h.failure(() => mode === "column" ? owner.grid!.setColumnFilter("name", ["Ada"]) : owner.grid!.setFilter(() => { armed = false; throw new Error("Same-generation filter failure"); }));
      } else {
        const { optional: _optional, ...raw } = owner.rows.get(1)!.value; armed = true; failure = h.failure(() => owner.rows.restore(1, { ...raw, audit: 2 }));
      }
      await owner.grid!.whenBound().catch(() => {});
      const after = { ids: [...owner.grid!.rowIds("visible")], column: owner.grid!.columnFilter("name"), optional: [...owner.root.querySelectorAll('[data-field="optional"]')].map(e => e.textContent) };
      if (mode === "same-filter" || mode === "column" || mode === "cancel") { owner.grid!.refresh(); await owner.settle(); }
      const recovered = { ids: [...owner.grid!.rowIds("visible")], column: owner.grid!.columnFilter("name"), count: owner.root.querySelectorAll("tbody tr").length, optional: [...owner.root.querySelectorAll('[data-field="optional"]')].map(e => e.textContent) };
      outcomes.push({ mode, code: failure?.code ?? null, after, recovered }); owner.destroy();
    }
    return outcomes;
  });
  for (const output of result) {
    if (output.mode === "new-filter" || output.mode === "pre-filter") expect(output.after.ids).toEqual([2]);
    if (output.mode === "new-sort" || output.mode === "pre-sort") expect(output.after.ids).toEqual([2, 1]);
    if (output.mode === "same-filter" || output.mode === "column") { expect(output.code).toBeTruthy(); expect(output.recovered).toMatchObject({ ids: [1, 2], column: null, count: 2 }); }
    if (output.mode === "cancel") { expect(output.code).toBe("GRID_BIND_STALE"); expect(output.after.optional).toEqual(["x", "y"]); expect(output.recovered.optional).toEqual(["", "y"]); }
  }
});

test("Grid source-only observers see a complete multi-row physical record before native binding even under a detached root", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.sourceFixture, results = [];
    const html = '<caption>Physical records</caption><thead><tr><th scope="col">Name</th><th scope="col">Detail</th></tr></thead><tbody data-row-template><tr><th scope="row" data-field="name"></th><td><source-hook-target></source-hook-target></td></tr><tr><td colspan="2" data-field="detail"></td></tr></tbody>';
    for (const attached of [false, true]) {
      const observed: unknown[] = [], owner = h.open("Grid", [{ audit: 1, name: "Ada", detail: "Complete" }], {
        beforeSourceBind(_raw: unknown, context: Context) { if (context.key === "audit") observed.push({ zero: context.elements.length, rows: context.root.querySelectorAll("tbody tr").length,
          target: context.root.querySelector("source-hook-target")!.parentElement?.parentElement?.parentElement?.tagName, connected: context.root.isConnected }); }
      }, html, attached); await owner.settle(); results.push({ attached, observed, name: h.shown(h.field(owner.root, "name")), detail: h.shown(h.field(owner.root, "detail")) }); owner.destroy();
    }
    return results;
  });
  expect(result).toEqual([false, true].map(attached => ({ attached, observed: [{ zero: 0, rows: 2, target: "TBODY", connected: attached }], name: "Ada", detail: "Complete" })));
});

test("List source-only attachment and catch cleanup cannot release a newer cached record's Select ownership", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.sourceFixture, results = [], html = '<li data-row-template><source-hook-target></source-hook-target><span data-field="name"></span><select aria-label="Choice" data-field="chosen" data-options="choices" data-option-label="label" data-option-value="code"></select></li>';
    for (const mode of ["connected", "disconnected"] as const) {
      let armed = false, once = false, fail = false; const seen: string[] = [];
      const owner = h.open("List", [{ audit: 1, name: "Ada", choices: [{ code: "a", label: "A" }], chosen: "a" }], {
        beforeSourceBind(_raw: unknown, context: Context) { seen.push(context.key); if (fail && context.key === "audit") { fail = false; throw new Error("Trigger catch cleanup"); } }
      }, html);
      owner.list!.setFilter(() => false);
      h.native.observeSourceAttachments((_element, phase) => { if (armed && !once && phase === mode) { once = true; owner.list!.setFilter(null); } });
      armed = true; fail = mode === "disconnected"; const failure = h.failure(() => owner.list!.setFilter(null));
      h.native.observeSourceAttachments();
      const select = h.field<HTMLSelectElement>(owner.root, "chosen"), live = !!select?.isConnected;
      const claim = select ? h.failure(() => h.api.bindSelect(select, { choices: [] }))?.code : "missing";
      const name = owner.root.querySelector('[data-field="name"]')?.textContent, selected = select?.selectedOptions[0]?.textContent;
      owner.handle.dispose(); const released = select ? h.failure(() => { const standalone = h.api.bindSelect(select, { choices: [] }); standalone.dispose(); })?.code ?? null : "missing";
      owner.rows.dispose(); owner.root.remove(); results.push({ mode, once, failure: failure?.code, live, claim, name, selected, released });
    }
    return results;
  });
  for (const output of result) { expect(output.once).toBe(true); expect(output.live).toBe(true); expect(output.claim).toMatch(/SELECT/); expect(output).toMatchObject({ name: "Ada", selected: "A", released: null }); }
});
