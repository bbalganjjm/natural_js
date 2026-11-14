// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows, RowsEvent } from "../../src/data/index.js";
import type { FormBindContext } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";

type Item = { name: string; amount: number; active: boolean; profile: { label: string; roles: string[] }; hidden: { token: string } };
declare global {
  interface Window {
    formSource: {
      bind: typeof bindForm;
      rows(values?: readonly Item[]): Rows<Item>;
      item(name?: string): Item;
      root(html: string): HTMLFormElement;
      input(root: ParentNode, field?: string): HTMLInputElement;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { form: source("../../src/ui/form.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm }, { createRows }] = await Promise.all([import(modules.form), import(modules.data)]);
    const item = (name = "Ada"): Item => ({ name, amount: 1200, active: true, profile: { label: "Primary", roles: ["read", "write"] }, hidden: { token: "received" } });
    window.formSource = {
      bind: bindForm, item, rows: (values = [item()]) => createRows(values),
      root(html) { const root = document.createElement("form"); root.innerHTML = html; document.body.append(root); return root; },
      input: (root, field = "name") => root.querySelector<HTMLInputElement>(`input[data-field="${field}"]`)!
    };
  }, modules);
});

test("whole source observations enumerate own keys and nested hidden values while Form read stays marked", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formSource, rows = h.rows(), id = rows.entries()[0].id;
    const root = h.root('<label>Name <input data-field="name"></label><span data-field="profile.label"></span>');
    const observations: unknown[] = [];
    const observe = (phase: string, context: FormBindContext<Item>) => observations.push({ phase,
      entries: Object.entries(context.row.value), own: Object.keys(context.row.value),
      frozen: Object.isFrozen(context.row.value) && Object.isFrozen(context.row.value.profile.roles) && Object.isFrozen(context.row.value.hidden),
      protected: !Reflect.set(context.row.value.hidden, "token", "mutated") });
    const form = h.bind(root, { rows, beforeBind: context => { observe("before", context); }, onBind: context => { observe("after", context); } });
    form.bind(id); const read = form.read(); rows.set(id, "hidden", { token: "changed" });
    const original = rows.original(id), current = rows.get(id)!.value;
    form.dispose(); rows.dispose(); return { observations, read, original, current };
  });
  const original = { name: "Ada", amount: 1200, active: true, profile: { label: "Primary", roles: ["read", "write"] }, hidden: { token: "received" } };
  expect(result).toEqual({ observations: ["before", "after"].map(phase => ({ phase, entries: Object.entries(original), own: Object.keys(original), frozen: true, protected: true })),
    read: { name: "Ada", profile: { label: "Primary" } }, original, current: { ...original, hidden: { token: "changed" } } });
});

test("source enumeration surrounds the whole field pass rather than interleaving unbound keys", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formSource, rows = h.rows(), id = rows.entries()[0].id, calls: string[] = [];
    const root = h.root('<span data-field="name"></span><span data-field="amount"></span>');
    const form = h.bind(root, { rows,
      beforeBind({ row }) { for (const [key] of Object.entries(row.value)) calls.push(`source-before:${key}`); },
      beforeBindValue(value, context) { calls.push(`field-before:${context.field}`); if (context.field === "name") return String(value).toUpperCase(); },
      onBindValue(_value, context) { calls.push(`field-after:${context.field}`); },
      onBind({ row }) { for (const [key] of Object.entries(row.value)) calls.push(`source-after:${key}`); }
    });
    const construction = [...calls]; form.bind(id);
    const shown = [...root.querySelectorAll("span")].map(element => element.textContent), raw = rows.get(id)!.value.name;
    form.dispose(); rows.dispose(); return { construction, calls, shown, raw };
  });
  const keys = ["name", "amount", "active", "profile", "hidden"];
  expect(result).toEqual({ construction: [], calls: [...keys.map(key => `source-before:${key}`), "field-before:name", "field-after:name", "field-before:amount", "field-after:amount", ...keys.map(key => `source-after:${key}`)], shown: ["ADA", "1200"], raw: "Ada" });
});

test("full refresh and revert observe source while selected refresh reads validation and equal writes keep their boundaries", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formSource, rows = h.rows(), id = rows.entries()[0].id, whole: unknown[] = [], events: RowsEvent[] = [];
    const root = h.root('<label>Name <input data-field="name"></label>');
    const observe = (phase: string, context: FormBindContext<Item>) => { whole.push([phase, context.event?.type ?? "explicit", context.event?.changed ?? null, context.row.value.hidden.token]); };
    const form = h.bind(root, { rows, beforeBind: context => { observe("before", context); }, onBind: context => { observe("after", context); } });
    form.bind(id); whole.length = 0; const stop = rows.subscribe(event => events.push(event));
    form.refresh(["name"]); form.read(); form.validate(); rows.set(id, "name", "Ada");
    const quiet = { whole: whole.length, events: events.length };
    rows.set(id, "hidden", { token: "changed" }); const keyed = { whole: whole.length, events: events.length };
    form.refresh(); rows.revert(id); rows.revert(id);
    stop(); form.dispose(); rows.dispose(); return { quiet, keyed, whole, events };
  });
  expect(result).toEqual({ quiet: { whole: 0, events: 0 }, keyed: { whole: 0, events: 1 },
    whole: [["before", "explicit", null, "changed"], ["after", "explicit", null, "changed"], ["before", "revert", true, "received"], ["after", "revert", true, "received"], ["before", "revert", false, "received"], ["after", "revert", false, "received"]],
    events: [{ type: "set", id: 1, changed: true }, { type: "revert", id: 1, changed: true }, { type: "revert", id: 1, changed: false }] });
});

test("hidden sets and coherent batches notify full committed source without replaying unchanged field projections", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formSource, rows = h.rows([h.item(), h.item("Grace")]), ids = rows.entries().map(row => row.id), root = h.root('<span data-field="name"></span>');
    let values = 0; const observed: unknown[] = [];
    const form = h.bind(root, { rows, beforeBindValue() { values++; } }); form.bind(ids[0]); values = 0;
    const stop = rows.subscribe(event => observed.push({ event, source: rows.entries().map(row => [row.id, row.value.hidden.token, row.value.amount]), frozen: Object.isFrozen(event) && (event.type !== "setMany" || Object.isFrozen(event.ids)) }));
    rows.set(ids[0], "hidden", { token: "single" });
    rows.setMany([{ id: ids[0], values: { hidden: { token: "first batch" }, amount: 1300 } }, { id: ids[1], values: { hidden: { token: "second batch" } } }]);
    const read = form.read(), shown = root.textContent, originals = ids.map(id => rows.original(id)!.hidden.token), changed = rows.changes().length;
    stop(); form.dispose(); rows.dispose(); return { observed, values, read, shown, originals, changed };
  });
  expect(result).toEqual({ observed: [
    { event: { type: "set", id: 1, changed: true }, source: [[1, "single", 1200], [2, "received", 1200]], frozen: true },
    { event: { type: "setMany", ids: [1, 2], changed: true }, source: [[1, "first batch", 1300], [2, "second batch", 1200]], frozen: true }
  ], values: 0, read: { name: "Ada" }, shown: "Ada", originals: ["received", "received"], changed: 2 });
});

test("committed subscriptions do not promise completed focused display and also observe native edits", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formSource, rows = h.rows(), id = rows.entries()[0].id;
    const root = h.root('<label>Amount <input data-field="amount" data-format=\'[["commas"]]\'></label>');
    const form = h.bind(root, { rows, parse: { amount: value => Number(value.replaceAll(",", "")) } }); form.bind(id);
    const input = h.input(root, "amount"), observed: { raw: number; shown: string; focused: boolean }[] = [];
    const stop = rows.subscribe(event => { if (event.type === "set") observed.push({ raw: rows.get(id)!.value.amount, shown: input.value, focused: document.activeElement === input }); });
    input.focus(); rows.set(id, "amount", 2400); const committed = observed[0];
    input.blur(); const afterBlur = input.value;
    input.focus(); input.value = "3600"; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); input.blur();
    const native = { raw: rows.get(id)!.value.amount, shown: input.value, observed: observed.map(item => item.raw) };
    stop(); form.dispose(); rows.dispose(); return { committed, afterBlur, native };
  });
  expect(result).toEqual({ committed: { raw: 2400, shown: "1200", focused: true }, afterBlur: "2,400", native: { raw: 3600, shown: "3,600", observed: [2400, 3600] } });
});

test("shared Forms and application subscriptions retain independent cleanup and separate store identity", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formSource, rows = h.rows([h.item("Shared")]), otherRows = h.rows([h.item("Other")]), id = rows.entries()[0].id;
    const firstRoot = h.root('<input data-field="name">'), secondRoot = h.root('<input data-field="name">'), otherRoot = h.root('<input data-field="name">');
    const first = h.bind(firstRoot, { rows }), second = h.bind(secondRoot, { rows }), other = h.bind(otherRoot, { rows: otherRows });
    first.bind(id); second.bind(id); other.bind(otherRows.entries()[0].id);
    const observations = { first: 0, second: 0, other: 0 };
    const stopFirst = rows.subscribe(() => { observations.first++; }), stopSecond = rows.subscribe(() => { observations.second++; }), stopOther = otherRows.subscribe(() => { observations.other++; });
    rows.set(id, "name", "First change"); first.dispose(); stopFirst(); rows.set(id, "name", "Second change");
    const retained = [h.input(firstRoot).value, h.input(secondRoot).value, h.input(otherRoot).value];
    second.dispose(); stopSecond(); rows.set(id, "name", "After cleanup");
    const committed = rows.get(id)!.value.name, original = rows.original(id)!.name;
    other.dispose(); stopOther(); rows.dispose(); otherRows.dispose(); return { observations, retained, committed, original };
  });
  expect(result).toEqual({ observations: { first: 1, second: 2, other: 0 }, retained: ["First change", "Second change", "Other"], committed: "After cleanup", original: "Shared" });
});

test("application receive normalization precedes create replace and append without changing wire data", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formSource;
    const wire = [" Ada ", " Grace ", " Lin "].map((name, index) => ({ name, amount: String(1200 * (index + 1)), active: index === 1 ? "N" : "Y", profile: { label: " Primary ", roles: [" read "] }, hidden: { token: ` token ${index} ` } }));
    const originalWire = JSON.stringify(wire);
    const receive = (row: typeof wire[number]): Item => ({ name: row.name.trim(), amount: Number(row.amount), active: row.active === "Y", profile: { label: row.profile.label.trim(), roles: row.profile.roles.map(role => role.trim()) }, hidden: { token: row.hidden.token.trim() } });
    const rows = h.rows([receive(wire[0])]), root = h.root('<input data-field="name"><input data-field="amount" data-format=\'[["commas"]]\'><input type="checkbox" data-field="active">');
    const form = h.bind(root, { rows, beforeBindValue(value, context) { if (context.field === "name") return String(value).toUpperCase(); } });
    form.bind(rows.entries()[0].id);
    const initial = { raw: rows.get(rows.entries()[0].id)!.value, display: h.input(root).value, amount: h.input(root, "amount").value };
    rows.replace([receive(wire[1])]); const replaced = rows.entries()[0].id; form.bind(replaced);
    const appended = rows.append([receive(wire[2])])[0];
    const loaded = rows.entries().map(row => ({ value: row.value, original: rows.original(row.id), status: row.status }));
    const read = form.read(), unchangedWire = JSON.stringify(wire) === originalWire, clean = rows.changes().length === 0, independent = appended !== replaced;
    form.dispose(); rows.dispose(); return { initial, loaded, read, unchangedWire, clean, independent };
  });
  const received = (name: string, amount: number, active: boolean, token: number) => ({ name, amount, active, profile: { label: "Primary", roles: ["read"] }, hidden: { token: `token ${token}` } });
  expect(result).toEqual({ initial: { raw: received("Ada", 1200, true, 0), display: "ADA", amount: "1,200" },
    loaded: [received("Grace", 2400, false, 1), received("Lin", 3600, true, 2)].map(value => ({ value, original: value, status: "clean" })),
    read: { name: "Grace", amount: 2400, active: false }, unchangedWire: true, clean: true, independent: true });
});

test("a failing source subscriber preserves committed hidden data and does not prevent later Form or observer work", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formSource, rows = h.rows(), id = rows.entries()[0].id, root = h.root('<span data-field="name"></span>');
    const failure = new Error("Source observer failed"), stopFailure = rows.subscribe(() => { throw failure; });
    const form = h.bind(root, { rows }); form.bind(id); const observed: unknown[] = [];
    const stop = rows.subscribe(event => observed.push({ event: event.type, name: rows.get(id)!.value.name, hidden: rows.get(id)!.value.hidden.token, shown: root.textContent }));
    let sameFailure = false;
    try { rows.setMany([{ id, values: { name: "Committed", hidden: { token: "committed" } } }]); } catch (cause) { sameFailure = cause === failure; }
    const raw = rows.get(id)!.value, original = rows.original(id), changes = rows.changes().length;
    stopFailure(); stop(); form.dispose(); rows.set(id, "hidden", { token: "after cleanup" });
    const cleaned = rows.get(id)!.value.hidden.token; rows.dispose(); return { sameFailure, observed, raw, original, changes, cleaned };
  });
  expect(result).toEqual({ sameFailure: true, observed: [{ event: "setMany", name: "Committed", hidden: "committed", shown: "Committed" }],
    raw: { name: "Committed", amount: 1200, active: true, profile: { label: "Primary", roles: ["read", "write"] }, hidden: { token: "committed" } },
    original: { name: "Ada", amount: 1200, active: true, profile: { label: "Primary", roles: ["read", "write"] }, hidden: { token: "received" } }, changes: 1, cleaned: "after cleanup" });
});
