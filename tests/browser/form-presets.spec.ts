// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RowId, Rows } from "../../src/data/index.js";
import type { FormBindContext, FormHandle, FormOptions, FormValueContext } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindSelect } from "../../src/ui/select.js";

type Item = { name: string; salary: number; active: boolean; note: string; profile: { label: string }; choice: number | null; choices: { label: string; value: number }[] };
type ValueCallback = NonNullable<FormOptions<Item>["beforeBindValue"]>;
type WholeCallback = NonNullable<FormOptions<Item>["beforeBind"]>;
type Failure = { code?: string; detail?: Readonly<Record<string, unknown>>; cause?: unknown };
declare global {
  interface Window {
    formPresets: {
      api: { bindForm: typeof bindForm; bindSelect: typeof bindSelect }; rows: Rows<Item>; ids: readonly RowId[];
      item(name?: string, salary?: number): Item;
      makeRows(items: readonly Item[]): Rows<Item>;
      root(html: string): HTMLFormElement;
      field<E extends HTMLElement = HTMLInputElement>(root: ParentNode, name?: string): E;
      edit(input: HTMLInputElement, value: string): void;
      error(action: () => unknown): Failure | null;
      pipeline(local?: ValueCallback, shared?: ValueCallback): ValueCallback;
      observer(local?: WholeCallback, shared?: WholeCallback): WholeCallback;
      legacyAfter(local: ValueCallback, shared: ValueCallback): ValueCallback;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm, bindSelect }, { createRows }] = await Promise.all([import(modules.ui), import(modules.data)]);
    const item = (name = "Ada", salary = 12): Item => ({ name, salary, active: false, note: "One", profile: { label: "Primary" }, choice: 1, choices: [{ label: "First", value: 1 }, { label: "Second", value: 2 }] });
    const rows: Rows<Item> = createRows([item(), item("Beatrice", 24)]);
    const thenable = (value: unknown) => value !== null && (typeof value === "object" || typeof value === "function") && typeof (value as { then?: unknown }).then === "function";
    // Application recipes: each returned function is one existing Form callback.
    window.formPresets = {
      api: { bindForm, bindSelect }, rows, ids: rows.entries().map(row => row.id), item, makeRows: createRows,
      root(html) { const root = document.createElement("form"); root.innerHTML = html; document.body.append(root); return root; },
      field: (root, name = "name") => root.querySelector(`[data-field="${name}"]`)! as never,
      edit(input, value) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); },
      error(action) { try { action(); return null; } catch (cause) { return cause as Failure; } },
      pipeline(local, shared) { return (value, context) => {
        const first = local?.(value, context); if (thenable(first)) return first;
        const last = shared?.(first === undefined ? value : first, context);
        return last === undefined ? first : last;
      }; },
      observer(local, shared) { return context => {
        const first = local?.(context); if (thenable(first) || first === false) return first;
        return shared?.(context);
      }; },
      legacyAfter(local, shared) { return (value, context) => {
        const first = local(value, context); if (thenable(first) || first === false) return first;
        return shared(value, context);
      }; }
    };
  }, modules);
});

test("frozen typed presets can be reused without mutation or shared Rows and retain application argument references", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets, argument = Object.freeze({ prefix: "Amount " }), calls: string[] = [], references: boolean[] = [];
    const callback: ValueCallback = (_value, context) => { calls.push(context.element.dataset.owner!); };
    const preset: FormOptions<Item> = Object.freeze({ beforeBindValue: callback, parse: Object.freeze({ salary: (value: string) => Number(value) }),
      rules: Object.freeze({ format: Object.freeze({ label: (value: string, args: readonly unknown[]) => { references.push(args[0] === argument); return argument.prefix + value; } }),
        fields: Object.freeze({ salary: Object.freeze({ format: Object.freeze([Object.freeze(["label", argument] as const)]) }) }) }) });
    const aRows = h.makeRows([h.item("First", 12)]), bRows = h.makeRows([h.item("Second", 24)]), a = h.root('<input data-owner="a" data-field="salary" value="3">'), b = h.root('<input data-owner="b" data-field="salary" value="4">');
    const first = h.api.bindForm(a, { ...preset, rows: aRows }), second = h.api.bindForm(b, { ...preset, rows: bRows });
    first.bind(aRows.entries()[0].id); second.bind(bRows.entries()[0].id); first.bind(aRows.entries()[0].id);
    const projected = [h.field(a, "salary").value, h.field(b, "salary").value]; first.unbind(); second.unbind();
    return { calls, references, projected, defaults: [first.defaults(), second.defaults()], raw: [aRows.entries()[0].value.salary, bRows.entries()[0].value.salary],
      originals: [aRows.original(aRows.entries()[0].id)!.salary, bRows.original(bRows.entries()[0].id)!.salary], untouched: preset.beforeBindValue === callback && Object.isFrozen(preset) && Object.isFrozen(argument) };
  });
  expect(result).toEqual({ calls: ["a", "b", "a"], references: [true, true, true], projected: ["Amount 12", "Amount 24"], defaults: [{ salary: 3 }, { salary: 4 }], raw: [12, 24], originals: [12, 24], untouched: true });
});

test("plain spreads distinguish omitted inheritance own undefined reset and explicit false", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets;
    return ["omitted", "undefined", "false"].map(mode => {
      const rows = h.makeRows([h.item()]), root = h.root('<input data-field="name" value="Capture" required>'); let calls = 0;
      const preset: FormOptions<Item> = { autoValidate: mode === "false", beforeBindValue: value => { calls++; return `shown:${value}`; } };
      const local: FormOptions<Item> = mode === "undefined" ? { autoValidate: undefined, beforeBindValue: undefined } : mode === "false" ? { autoValidate: false } : {};
      const form = h.api.bindForm(root, { ...preset, ...local, rows }); form.bind(rows.entries()[0].id); const initial = { value: h.field(root).value, calls };
      h.edit(h.field(root), "");
      return { mode, initial, source: rows.entries()[0].value.name, invalid: h.field(root).getAttribute("aria-invalid"), presetStillDefined: typeof preset.beforeBindValue === "function" };
    });
  });
  expect(result).toEqual(["omitted", "undefined", "false"].map(mode => ({ mode, initial: { value: mode === "undefined" ? "Ada" : "shown:Ada", calls: mode === "undefined" ? 0 : 1 },
    source: mode === "undefined" ? "Ada" : "", invalid: mode === "undefined" ? "true" : null, presetStillDefined: true })));
});

test("null callback overrides retain specific constructor errors before root Select or ARIA ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets;
    return ["beforeBind", "onBind", "beforeBindValue", "onBindValue"].map(name => {
      const root = h.root('<input data-field="name" aria-describedby="help"><output data-error-for="name">Hint</output><select data-field="choice"><option value="a">A</option></select>');
      const preset: FormOptions<Item> = { beforeBind: () => undefined, onBind: () => undefined, beforeBindValue: () => undefined, onBindValue: () => undefined }, before = root.innerHTML;
      const error = h.error(() => h.api.bindForm(root, { ...preset, rows: h.rows, [name]: null } as unknown as FormOptions<Item>));
      const unchanged = before === root.innerHTML, select = h.api.bindSelect(h.field<HTMLSelectElement>(root, "choice"), { choices: [] }); select.dispose();
      const retry = h.api.bindForm(root, { ...preset, rows: h.rows, [name]: undefined }); retry.bind(h.ids[0]); retry.dispose();
      return { name, code: error?.code, unchanged, released: h.field(root).getAttribute("aria-describedby") === "help" && root.querySelector("output")!.getAttribute("id") === null };
    });
  });
  expect(result).toEqual(["beforeBind", "onBind", "beforeBindValue", "onBindValue"].map(name => ({ name, code: name === "beforeBind" || name === "onBind" ? "FORM_BIND" : "FORM_VALUE_OPTIONS", unchanged: true, released: true })));
});

test("explicit nested map composition preserves both catalogs parsers renderers messages and field kinds", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets, root = h.root('<input data-field="name" value="Capture" data-format=\'[["lower"]]\'><input data-field="salary" value="007"><span data-field="note"></span><span data-field="profile.label"></span>');
    let sharedChecks = 0, localChecks = 0;
    const shared: FormOptions<Item> = { parse: { salary: value => Number(value) }, render: { note: value => `shared:${value}` }, rules: {
      format: { prefix: value => `shared:${value}` }, validate: { shared: () => { sharedChecks++; return false; } }, messages: { shared: "Shared message" },
      fields: { name: { format: [["prefix"]], validate: [["shared"]] }, salary: { validate: [["shared"]] } } } };
    const local: FormOptions<Item> = { parse: { name: value => value.toUpperCase() }, render: { "profile.label": value => `local:${value}` }, rules: {
      format: { amount: value => `local:${value}` }, validate: { local: () => { localChecks++; return false; } }, messages: { local: "Local message" },
      fields: { name: { validate: [["local"]] }, salary: { format: [["amount"]] } } } };
    const options: FormOptions<Item> = { ...shared, ...local, rows: h.rows, parse: { ...shared.parse, ...local.parse }, render: { ...shared.render, ...local.render }, rules: {
      ...shared.rules, ...local.rules, format: { ...shared.rules!.format, ...local.rules!.format }, validate: { ...shared.rules!.validate, ...local.rules!.validate }, messages: { ...shared.rules!.messages, ...local.rules!.messages },
      fields: { ...shared.rules!.fields, ...local.rules!.fields, name: { ...shared.rules!.fields!.name, ...local.rules!.fields!.name }, salary: { ...shared.rules!.fields!.salary, ...local.rules!.fields!.salary } } } };
    const before = h.rows.entries(), form = h.api.bindForm(root, options); form.bind(h.ids[0]); const checked = form.validate();
    return { defaults: form.defaults(), name: h.field(root).value, salary: h.field(root, "salary").value, note: h.field<HTMLElement>(root, "note").textContent,
      label: h.field<HTMLElement>(root, "profile.label").textContent, messages: checked.issues.map(issue => issue.message), sharedChecks, localChecks, unchanged: h.rows.entries() === before };
  });
  expect(result).toEqual({ defaults: { name: "CAPTURE", salary: 7 }, name: "shared:Ada", salary: "local:12", note: "shared:One", label: "local:Primary", messages: ["Local message", "Shared message"], sharedChecks: 1, localChecks: 1, unchanged: true });
});

test("tuple overrides replace ordered lists and empty lists clear authored kinds without an implicit deep merge", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets;
    return ["replace", "clear"].map(mode => {
      const root = h.root('<input data-field="name" value="mixed" data-format=\'[["upper"]]\' data-validate=\'[["required"]]\'>'); const calls: string[] = [];
      const preset: FormOptions<Item> = { rules: { format: { first: value => { calls.push("first"); return `first(${value})`; }, second: value => { calls.push("second"); return `second(${value})`; } },
        fields: { name: { format: [["first"], ["second"]], validate: [["required"]] } } } };
      const form = h.api.bindForm(root, { ...preset, rules: { ...preset.rules, fields: { ...preset.rules!.fields, name: { ...preset.rules!.fields!.name, format: mode === "clear" ? [] : [["second"]], validate: [] } } } });
      const initial = { value: h.field(root).value, calls: [...calls] }; h.edit(h.field(root), "");
      return { mode, initial, valid: form.validate().valid, raw: form.read(), presetLength: preset.rules!.fields!.name.format!.length };
    });
  });
  expect(result).toEqual(["replace", "clear"].map(mode => ({ mode, initial: { value: mode === "clear" ? "mixed" : "second(mixed)", calls: mode === "clear" ? [] : ["second"] }, valid: true, raw: { name: "" }, presetLength: 2 })));
});

test("captured application callbacks run as plain functions with the same frozen context and bind or val phase", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets, root = h.root('<input data-field="name">'), records: unknown[] = []; let context: FormValueContext | undefined;
    const local: ValueCallback = function(this: unknown, value, current) { "use strict"; context = current; records.push(["local", this === undefined, current.phase, current.values.name, Object.isFrozen(current)]); return `${value}:local`; };
    let shared: ValueCallback = function(this: unknown, value, current) { "use strict"; records.push(["shared", this === undefined, current === context, current.phase, value]); return `${value}:shared`; };
    const callback = h.pipeline(local, shared); shared = () => "Mutated reference";
    const form = h.api.bindForm(root, { rows: h.rows, beforeBindValue: callback }); form.bind(h.ids[0]); const bound = h.field(root).value;
    h.rows.set(h.ids[0], "name", "Grace");
    return { records, bound, updated: h.field(root).value, raw: form.read(), source: h.rows.get(h.ids[0])!.value.name };
  });
  expect(result).toEqual({ records: [["local", true, "bind", "Ada", true], ["shared", true, true, "bind", "Ada:local"], ["local", true, "val", "Grace", true], ["shared", true, true, "val", "Grace:local"]],
    bound: "Ada:local:shared", updated: "Grace:local:shared", raw: { name: "Grace" }, source: "Grace" });
});

test("value pipelines preserve local output and all undefined keeps unavailable loaded choices unprojected", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets, outputs = [
      h.pipeline(() => "Local", () => undefined), h.pipeline(() => undefined, () => "Shared"), h.pipeline(() => "Local", () => "Shared")
    ].map(callback => {
      const root = h.root('<input data-field="name">'), before = h.rows.get(h.ids[0]), form = h.api.bindForm(root, { rows: h.rows, beforeBindValue: callback }); form.bind(h.ids[0]);
      return { value: h.field(root).value, raw: form.read(), unchanged: h.rows.get(h.ids[0]) === before };
    });
    h.rows.set(h.ids[0], "choice", 9); const before = h.rows.get(h.ids[0]), root = h.root('<select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"></select>'); let calls = 0;
    const callback = h.pipeline(() => { calls++; }, () => { calls++; }), form = h.api.bindForm(root, { rows: h.rows, beforeBindValue: callback, onBindValue: callback });
    const error = h.error(() => form.bind(h.ids[0]));
    return { outputs, choice: { code: error?.code ?? null, selected: h.field<HTMLSelectElement>(root, "choice").selectedIndex, raw: form.read(), calls, issues: form.validate().issues.map(issue => issue.rule), unchanged: h.rows.get(h.ids[0]) === before } };
  });
  expect(result).toEqual({ outputs: ["Local", "Shared", "Shared"].map(value => ({ value, raw: { name: "Ada" }, unchanged: true })), choice: { code: null, selected: -1, raw: { choice: 9 }, calls: 4, issues: ["select-option"], unchanged: true } });
});

test("false null zero and empty string remain pipeline data and false does not automatically skip shared value work", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets;
    const values = [false, null, 0, ""].map(value => {
      const root = h.root('<input data-field="name">'); let sharedCalls = 0, received: unknown;
      const form = h.api.bindForm(root, { rows: h.rows, beforeBindValue: h.pipeline(() => value, current => { sharedCalls++; received = current; }) }); form.bind(h.ids[0]);
      return { value: h.field(root).value, received, sharedCalls, raw: form.read().name };
    });
    const root = h.root('<input type="checkbox" data-field="active" data-validate=\'[["required"]]\'>'); let sharedCalls = 0;
    const form = h.api.bindForm(root, { rows: h.rows, beforeBindValue: h.pipeline(() => false, () => { sharedCalls++; }) }); form.bind(h.ids[0]);
    return { values, checkbox: { checked: h.field<HTMLInputElement>(root, "active").checked, sharedCalls, valid: form.validate().valid, raw: form.read().active } };
  });
  expect(result).toEqual({ values: [false, null, 0, ""].map(received => ({ value: received == null ? "" : String(received), received, sharedCalls: 1, raw: "Ada" })), checkbox: { checked: false, sharedCalls: 1, valid: false, raw: false } });
});

test("a conditional whole observer tail can skip shared work on false without vetoing the binding", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets, root = h.root('<input data-field="name" value="Capture">'), calls: string[] = []; let context: FormBindContext<Item> | undefined, same = false;
    const form = h.api.bindForm(root, { rows: h.rows,
      beforeBind: h.observer(current => { context = current; calls.push("local-before"); return false; }, () => { calls.push("shared-before"); }),
      onBind: h.observer(current => { same = context !== undefined && current.root === context.root && current.row === context.row; calls.push("local-after"); }, () => { calls.push("shared-after"); }) });
    form.bind(h.ids[0]);
    return { calls, same, value: h.field(root).value, raw: form.read(), status: h.rows.get(h.ids[0])!.status };
  });
  expect(result).toEqual({ calls: ["local-before", "local-after", "shared-after"], same: true, value: "Ada", raw: { name: "Ada" }, status: "clean" });
});

test("the explicit legacy after recipe passes original input and can skip only its shared tail on false", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets;
    return ["replacement", "false", "undefined"].map(mode => {
      const root = h.root('<input data-field="name">'), received: unknown[] = [];
      const form = h.api.bindForm(root, { rows: h.rows, onBindValue: h.legacyAfter(() => mode === "false" ? false : mode === "replacement" ? "Local" : undefined,
        value => { received.push(value); return `Shared:${value}`; }) }); form.bind(h.ids[0]);
      return { mode, value: h.field(root).value, received, raw: form.read().name };
    });
  });
  expect(result).toEqual(["replacement", "false", "undefined"].map(mode => ({ mode, value: mode === "false" ? "false" : "Shared:Ada", received: mode === "false" ? [] : ["Ada"], raw: "Ada" })));
});

test("intermediate promises and thenables are forwarded immediately for current callback rejection draining and retry", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formPresets, unhandled: string[] = []; window.addEventListener("unhandledrejection", event => unhandled.push(String(event.reason)));
    const cases = [];
    for (const scope of ["value", "whole"]) for (const kind of ["promise", "thenable"]) {
      const root = h.root('<input data-field="name" value="Capture">'); let fail = true, shared = 0;
      const local = () => !fail ? undefined : kind === "promise" ? Promise.reject(new Error("Local async failure")) : { then(_resolve: unknown, reject: (cause: Error) => void) { reject(new Error("Local thenable failure")); } };
      const options: FormOptions<Item> = { rows: h.rows };
      if (scope === "value") options.beforeBindValue = h.pipeline(local, () => { shared++; });
      else options.beforeBind = h.observer(local, () => { shared++; });
      const form = h.api.bindForm(root, options), error = h.error(() => form.bind(h.ids[0])), blocked = { value: h.field(root).value, shared };
      fail = false; const retry = h.error(() => form.bind(h.ids[0]));
      cases.push({ scope, kind, code: error?.code, callback: error?.detail?.callback, blocked, retry: retry?.code ?? null, value: h.field(root).value, shared });
    }
    await new Promise<void>(resolve => setTimeout(resolve, 0)); return { cases, unhandled };
  });
  expect(result).toEqual({ cases: ["value", "whole"].flatMap(scope => ["promise", "thenable"].map(kind => ({ scope, kind, code: scope === "value" ? "FORM_VALUE" : "FORM_BIND", callback: scope === "value" ? "beforeBindValue" : "beforeBind",
    blocked: { value: "Capture", shared: 0 }, retry: null, value: "Ada", shared: 1 }))), unhandled: [] });
});

test("local and shared application throws retain existing callback errors and release guards for a fresh bind", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets;
    return ["value", "whole"].flatMap(scope => ["local", "shared"].map(failing => {
      const root = h.root('<input data-field="name" value="Capture">'), calls: string[] = []; let fail = true;
      const local = () => { calls.push("local"); if (fail && failing === "local") throw new Error("Local failed"); };
      const shared = () => { calls.push("shared"); if (fail && failing === "shared") throw new Error("Shared failed"); };
      const options: FormOptions<Item> = { rows: h.rows };
      if (scope === "value") options.beforeBindValue = h.pipeline(local, shared); else options.beforeBind = h.observer(local, shared);
      const form = h.api.bindForm(root, options), error = h.error(() => form.bind(h.ids[0])), blocked = { calls: [...calls], value: h.field(root).value };
      fail = false; calls.length = 0; const retry = h.error(() => form.bind(h.ids[0]));
      return { scope, failing, code: error?.code, callback: error?.detail?.callback, cause: (error?.cause as Error | undefined)?.message,
        blocked, retry: retry?.code ?? null, calls, value: h.field(root).value, raw: form.read() };
    }));
  });
  expect(result).toEqual(["value", "whole"].flatMap(scope => ["local", "shared"].map(failing => ({ scope, failing, code: scope === "value" ? "FORM_VALUE" : "FORM_BIND", callback: scope === "value" ? "beforeBindValue" : "beforeBind", cause: failing === "local" ? "Local failed" : "Shared failed",
    blocked: { calls: failing === "local" ? ["local"] : ["local", "shared"], value: "Capture" }, retry: null, calls: ["local", "shared"], value: "Ada", raw: { name: "Ada" } }))));
});

test("temporary application values can be converted before Form checks the single callback unit result", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets, temporary = { selected: true }, root = h.root('<input type="checkbox" data-field="active" required>'); let same = false;
    const form = h.api.bindForm(root, { rows: h.rows, beforeBindValue: h.pipeline(() => temporary, value => { same = value === temporary; return (value as typeof temporary).selected; }) });
    const error = h.error(() => form.bind(h.ids[0])), direct = h.root('<input type="checkbox" data-field="active">');
    const unconverted = h.api.bindForm(direct, { rows: h.rows, beforeBindValue: () => temporary });
    return { code: error?.code ?? null, same, checked: h.field<HTMLInputElement>(root, "active").checked, raw: form.read().active, valid: form.validate().valid,
      direct: h.error(() => unconverted.bind(h.ids[0]))?.code, temporaryUnchanged: temporary.selected === true };
  });
  expect(result).toEqual({ code: null, same: true, checked: true, raw: false, valid: false, direct: "FORM_VALUE", temporaryUnchanged: true });
});

test("a nested newer bind does not cancel an application shared tail but suppresses the older framework write", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formPresets, root = h.root('<input data-field="name" value="Capture">'), tails: number[] = [], after: number[] = [];
    let form: FormHandle<Item> | undefined, armed = true, calls = 0, sentinel = false;
    const callback = h.pipeline((value, context) => {
      calls++; if (calls > 4) { sentinel = true; throw new Error("Test nested preset cap"); }
      if (armed && context.rowId === h.ids[0]) { armed = false; form!.bind(h.ids[1]); return "Stale local"; } return value;
    }, (value, context) => { tails.push(context.rowId); return `${value}:shared`; });
    form = h.api.bindForm(root, { rows: h.rows, beforeBindValue: callback, onBind: context => { after.push(context.row.id); } });
    const error = h.error(() => form!.bind(h.ids[0]));
    return { code: error?.code ?? null, value: h.field(root).value, raw: form.read(), tails, after, calls, sentinel, source: h.rows.get(h.ids[0])!.value.name };
  });
  expect(result).toEqual({ code: null, value: "Beatrice:shared", raw: { name: "Beatrice" }, tails: [2, 1], after: [2], calls: 2, sentinel: false, source: "Ada" });
});

test("disposal leaves application scalar tails running while stale promise forwarding is drained without replacing a new owner", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formPresets, unhandled: string[] = []; window.addEventListener("unhandledrejection", event => unhandled.push(String(event.reason)));
    const cases = ["scalar", "promise"].map(mode => {
      const root = h.root('<input data-field="name" value="Capture">'); let form: FormHandle<Item> | undefined, replacement: FormHandle<Item> | undefined, tails = 0, calls = 0, sentinel = false;
      const callback = h.pipeline(() => {
        calls++; if (calls > 4) { sentinel = true; throw new Error("Test disposed preset cap"); }
        form!.dispose(); replacement = h.api.bindForm(root, { rows: h.rows }); replacement.bind(h.ids[1]);
        return mode === "promise" ? Promise.reject(new Error("Stale application promise")) : "Stale local";
      }, () => { tails++; return "Stale shared"; });
      form = h.api.bindForm(root, { rows: h.rows, beforeBindValue: callback }); const error = h.error(() => form!.bind(h.ids[0]));
      return { mode, code: error?.code ?? null, value: h.field(root).value, raw: replacement!.read(), closed: h.error(() => form!.read())?.code, tails, calls, sentinel };
    });
    await new Promise<void>(resolve => setTimeout(resolve, 0)); return { cases, unhandled };
  });
  expect(result).toEqual({ cases: ["scalar", "promise"].map(mode => ({ mode, code: null, value: "Beatrice", raw: { name: "Beatrice" }, closed: "FORM_DISPOSED", tails: mode === "scalar" ? 1 : 0, calls: 1, sentinel: false })), unhandled: [] });
});

test("typed configuration stays separate from native defaults captured adoption values and received Rows originals", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formPresets, preset: FormOptions<Item> = { autoValidate: false, parse: { salary: value => Number(value) }, rules: { fields: { salary: { format: [["commas"]] } } } };
    const root = h.root('<input data-field="salary" value="1000">'), input = h.field<HTMLInputElement>(root, "salary"); input.value = "1200";
    const local = h.api.bindForm(root, { ...preset }); h.edit(input, "2400");
    root.insertAdjacentHTML("beforeend", '<input data-field="name" value="Adopted">'); local.rescan(); const beforeReset = { raw: local.read(), defaults: local.defaults(), native: input.defaultValue };
    root.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0)); const reset = { value: input.value, raw: local.read(), defaults: local.defaults() }; local.unbind();
    const rowsRoot = h.root('<input data-field="salary" value="7">'), rowsForm = h.api.bindForm(rowsRoot, { ...preset, rows: h.rows }); rowsForm.bind(h.ids[0]);
    return { beforeReset, reset, restored: input.value, received: { defaults: rowsForm.defaults(), raw: rowsForm.read(), original: h.rows.original(h.ids[0])!.salary, status: h.rows.get(h.ids[0])!.status } };
  });
  expect(result).toEqual({ beforeReset: { raw: { salary: "2400", name: "Adopted" }, defaults: { salary: 1200, name: "Adopted" }, native: "1000" },
    reset: { value: "1,000", raw: { salary: "1000", name: "Adopted" }, defaults: { salary: 1200, name: "Adopted" } }, restored: "1200",
    received: { defaults: { salary: 7 }, raw: { salary: 12 }, original: 12, status: "clean" } });
});
