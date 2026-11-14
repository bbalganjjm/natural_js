// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows } from "../../src/data/index.js";
import type { GridBindResult } from "../../src/ui/index.js";
import type { RowBinding } from "../../src/ui/grid-hooks.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = { name: string };
type Options = Parameters<typeof bindGrid<Item>>[1];
type GridBinding = RowBinding<Item, HTMLTableRowElement>;
declare global {
  interface Window {
    gridCallbacks: {
      bind: typeof bindGrid;
      rows(values?: readonly Item[]): Rows<Item>;
      table(): HTMLTableElement;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindGrid }, { createRows }] = await Promise.all([import(modules.grid), import(modules.data)]);
    window.gridCallbacks = {
      bind: bindGrid,
      rows: (values = [{ name: "Ada" }]) => createRows(values),
      table() {
        const table = document.createElement("table");
        table.innerHTML = '<caption>Captured binding callbacks</caption><thead><tr><th scope="col">Name</th></tr></thead><tbody data-row-template><tr><td><label>Name <input data-field="name" value="Template"></label><output data-policy></output></td></tr></tbody>';
        document.body.append(table); return table;
      }
    };
  }, modules);
});

test("binding callbacks read their getters once and invoke captured functions without a receiver", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridCallbacks, rows = h.rows(), table = h.table();
    const reads = { before: 0, after: 0, complete: 0 }, calls: string[] = [], receivers: boolean[] = [], frozen: boolean[] = [];
    const before = function (this: unknown, context: GridBinding) { "use strict";
      receivers.push(this === undefined); frozen.push(Object.isFrozen(context)); calls.push(`before:${context.row.value.name}`);
    };
    const after = function (this: unknown, context: GridBinding) { "use strict";
      receivers.push(this === undefined); frozen.push(Object.isFrozen(context)); calls.push(`after:${context.row.value.name}`);
    };
    const complete = function (this: unknown, context: GridBindResult) { "use strict";
      receivers.push(this === undefined); frozen.push(Object.isFrozen(context)); calls.push(`complete:${context.mounted}`);
    };
    const options: Options = { rows,
      get beforeRowBind() { reads.before++; return before; },
      get onRowBind() { reads.after++; return after; },
      get onBind() { reads.complete++; return complete; }
    };
    const grid = h.bind(table, options); rows.set(rows.entries()[0].id, "name", "Changed"); grid.refresh();
    grid.dispose(); rows.dispose(); return { reads, calls, receivers, frozen };
  });
  expect(result.reads).toEqual({ before: 1, after: 1, complete: 1 });
  expect(result.calls).toEqual(["before:Ada", "after:Ada", "complete:1", "before:Changed", "after:Changed", "before:Changed", "after:Changed", "complete:1"]);
  expect(result.receivers).toEqual(Array(8).fill(true)); expect(result.frozen).toEqual(Array(8).fill(true));
});

test("replacing deleting or invalidating original callback properties preserves the captured handlers", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridCallbacks, rows = h.rows(), table = h.table(), calls: string[] = []; let replacement = 0;
    const options: Options = { rows, beforeRowBind() { calls.push("before"); }, onRowBind() { calls.push("after"); }, onBind() { calls.push("complete"); } };
    const grid = h.bind(table, options); calls.length = 0;
    Object.assign(options, { beforeRowBind: 7, onRowBind: null, onBind: () => replacement++ }); grid.refresh();
    delete options.beforeRowBind; delete options.onRowBind; delete options.onBind;
    rows.set(rows.entries()[0].id, "name", "Changed"); grid.refresh();
    const shown = table.querySelector("input")!.value; grid.dispose(); rows.dispose(); return { calls, replacement, shown };
  });
  expect(result).toEqual({ calls: ["before", "after", "complete", "before", "after", "before", "after", "complete"], replacement: 0, shown: "Changed" });
});

test("callbacks absent at construction cannot be installed through later option mutation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridCallbacks;
    return ["none", "before", "after"].map(initial => {
      const rows = h.rows(), table = h.table(); let called = 0, captured = 0;
      const options: Options = { rows,
        ...(initial === "before" ? { beforeRowBind: () => { captured++; } } : {}),
        ...(initial === "after" ? { onRowBind: () => { captured++; } } : {})
      };
      const grid = h.bind(table, options); captured = 0;
      options.beforeRowBind = options.onRowBind = options.onBind = () => { called++; };
      grid.refresh(); rows.set(rows.entries()[0].id, "name", "Changed"); grid.refresh();
      const shown = table.querySelector("input")!.value; grid.dispose(); rows.dispose(); return { called, captured, shown };
    });
  });
  expect(result).toEqual([0, 3, 3].map(captured => ({ called: 0, captured, shown: "Changed" })));
});

test("deleting the original before hook during its first row preserves later attached pre-bind rows", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridCallbacks, rows = h.rows([{ name: "Ada" }, { name: "Grace" }, { name: "Lin" }]), table = h.table();
    const original = table.outerHTML, calls: { name: string; attached: boolean; value: string }[] = [];
    const options: Options = { rows, beforeRowBind(context) {
      calls.push({ name: context.row.value.name, attached: context.elements.every(element => element.isConnected), value: context.elements[0].querySelector("input")!.value });
      delete options.beforeRowBind;
    } };
    const grid = h.bind(table, options), shown = [...table.querySelectorAll("input")].map(input => input.value);
    grid.dispose(); rows.dispose(); return { calls, shown, restored: table.outerHTML === original };
  });
  expect(result).toEqual({ calls: ["Ada", "Grace", "Lin"].map(name => ({ name, attached: true, value: "Template" })), shown: ["Ada", "Grace", "Lin"], restored: true });
});

test("mutating after and completion options inside the first before hook cannot replace this binding", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridCallbacks, rows = h.rows([{ name: "Ada" }, { name: "Grace" }]), table = h.table(), calls: string[] = []; let replacement = 0;
    const options: Options = { rows,
      beforeRowBind(context) {
        calls.push(`before:${context.row.value.name}`); options.onRowBind = () => replacement++; options.onBind = () => replacement++;
      },
      onRowBind(context) { calls.push(`after:${context.elements[0].querySelector("input")!.value}`); },
      onBind(context) { calls.push(`complete:${context.mounted}`); }
    };
    const grid = h.bind(table, options); grid.dispose(); rows.dispose(); return { calls, replacement };
  });
  expect(result).toEqual({ calls: ["before:Ada", "before:Grace", "after:Ada", "after:Grace", "complete:2"], replacement: 0 });
});

test("frozen shared callbacks and frozen instance options keep two Rows and resource owners independent", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridCallbacks, firstRows = h.rows([{ name: "First" }]), secondRows = h.rows([{ name: "Second" }]);
    const firstTable = h.table(), secondTable = h.table(), original = firstTable.outerHTML, calls: string[] = [], cleaned: string[] = [];
    const shared = Object.freeze({
      beforeRowBind(context: GridBinding) { const name = context.row.value.name; calls.push(`before:${name}`); context.own(() => cleaned.push(name)); },
      onRowBind(context: GridBinding) { calls.push(`after:${context.row.value.name}`); },
      onBind(context: GridBindResult) { calls.push(`complete:${context.mounted}`); }
    });
    const firstOptions = Object.freeze({ ...shared, rows: firstRows }), secondOptions = Object.freeze({ ...shared, rows: secondRows });
    const first = h.bind(firstTable, firstOptions), second = h.bind(secondTable, secondOptions); calls.length = 0;
    first.dispose(); firstRows.set(firstRows.entries()[0].id, "name", "First changed"); second.refresh();
    secondRows.set(secondRows.entries()[0].id, "name", "Second changed");
    const shown = secondTable.querySelector("input")!.value, firstRestored = firstTable.outerHTML === original;
    second.dispose(); firstRows.dispose(); secondRows.dispose();
    return { calls, cleaned, shown, firstRestored, frozen: [shared, firstOptions, secondOptions].every(Object.isFrozen) };
  });
  expect(result).toEqual({ calls: ["before:Second", "after:Second", "complete:1", "before:Second changed", "after:Second changed"], cleaned: ["First", "Second", "Second", "Second changed"], shown: "Second changed", firstRestored: true, frozen: true });
});

test("stable application forwarding callbacks read current policy on explicit refresh", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridCallbacks, rows = h.rows(), table = h.table(), calls: string[] = [];
    const policy = (label: string) => ({
      before(context: GridBinding) { calls.push(`before:${label}`); context.elements[0].dataset.policy = label; },
      after(context: GridBinding) { calls.push(`after:${label}`); context.elements[0].querySelector("output")!.textContent = `${label}:${context.row.value.name}`; },
      complete() { calls.push(`complete:${label}`); }
    });
    let current = policy("Initial");
    const options: Options = { rows, beforeRowBind: context => current.before(context), onRowBind: context => current.after(context), onBind: () => current.complete() };
    const grid = h.bind(table, options); current = policy("Updated");
    const beforeRefresh = table.querySelector("output")!.textContent; grid.refresh();
    const afterRefresh = table.querySelector("output")!.textContent, marker = table.querySelector("tbody tr")!.getAttribute("data-policy");
    grid.dispose(); rows.dispose(); return { calls, beforeRefresh, afterRefresh, marker };
  });
  expect(result).toEqual({ calls: ["before:Initial", "after:Initial", "complete:Initial", "before:Updated", "after:Updated", "complete:Updated"], beforeRefresh: "Initial:Ada", afterRefresh: "Updated:Ada", marker: "Updated" });
});

test("progressive chunks keep captured callbacks while explicit policy changes reach later chunks", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridCallbacks, rows = h.rows([{ name: "Ada" }, { name: "Grace" }, { name: "Lin" }]), table = h.table(), calls: string[] = []; let policy = "Initial";
    const options: Options = { rows, progressive: { size: 1, delay: 0 },
      beforeRowBind(context) { calls.push(`before:${policy}:${context.row.value.name}:${context.elements.every(element => element.isConnected)}`); },
      onRowBind(context) { calls.push(`after:${policy}:${context.elements[0].querySelector("input")!.value}`); },
      onBind(context) { calls.push(`complete:${policy}:${context.available}:${context.first}:${context.last}`); }
    };
    const grid = h.bind(table, options); await grid.whenBound();
    const unexpected = () => { throw new Error("A later callback property must not be installed."); };
    options.beforeRowBind = options.onRowBind = options.onBind = unexpected; policy = "Second"; await grid.renderMore();
    delete options.beforeRowBind; delete options.onRowBind; delete options.onBind; policy = "Third"; const complete = await grid.renderMore();
    const shown = [...table.querySelectorAll("input")].map(input => input.value); grid.dispose(); rows.dispose(); return { calls, shown, available: complete.available, last: complete.last };
  });
  expect(result).toEqual({ calls: ["before:Initial:Ada:true", "after:Initial:Ada", "complete:Initial:1:true:false", "before:Second:Grace:true", "after:Second:Grace", "complete:Second:2:false:false", "before:Third:Lin:true", "after:Third:Lin", "complete:Third:3:false:true"], shown: ["Ada", "Grace", "Lin"], available: 3, last: true });
});
