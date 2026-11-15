// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RowId, Rows, RowsEvent } from "../../src/data/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindGrid } from "../../src/ui/grid.js";
import type { bindList } from "../../src/ui/list.js";

type Item = { name: string; flag?: unknown; hidden: { keep: number } };
type Kind = "Form" | "Grid" | "List";
declare global {
  interface Window {
    codedCheckbox: {
      api: { bindForm: typeof bindForm; bindGrid: typeof bindGrid; bindList: typeof bindList };
      rows: (values: readonly Item[]) => Rows<Item>;
      root: (kind: Kind, control?: string) => HTMLElement;
      field: (root: ParentNode) => HTMLInputElement;
      error: (run: () => void) => { code: string; detail?: Readonly<Record<string, unknown>> } | null;
    };
  }
}
const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { data: source("../../src/data/index.ts"), form: source("../../src/ui/form.ts"),
  grid: source("../../src/ui/grid.ts"), list: source("../../src/ui/list.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async modules => {
    const [{ createRows }, { bindForm }, { bindGrid }, { bindList }] = await Promise.all([
      import(modules.data), import(modules.form), import(modules.grid), import(modules.list)
    ]);
    window.codedCheckbox = {
      api: { bindForm, bindGrid, bindList }, rows: values => createRows(values),
      root(kind, control = '<input type="checkbox" data-field="flag" value="Y" data-unchecked-value="N">') {
        const root = document.createElement(kind === "Form" ? "form" : kind === "Grid" ? "table" : "ul");
        const content = `<span data-field="name"></span><label>Flag ${control}</label><output data-error-for="flag"></output>`;
        root.innerHTML = kind === "Grid" ? `<caption>Coded flags</caption><tbody><tr data-row-template><td>${content}</td></tr></tbody>` :
          kind === "List" ? `<li data-row-template>${content}</li>` : content;
        document.body.append(root); return root;
      },
      field: root => root.querySelector<HTMLInputElement>('input[data-field="flag"]')!,
      error(run) { try { run(); return null; } catch (cause) { return cause as { code: string; detail?: Readonly<Record<string, unknown>> }; } }
    };
  }, modules);
});

test("Form writes captured string codes once and synchronizes a sibling without changing checked value or originals", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.codedCheckbox, rows = h.rows([{ name: "Ada", flag: "N", hidden: { keep: 7 } }]), id = rows.entries()[0].id;
    const first = h.root("Form"), second = h.root("Form"), a = h.api.bindForm(first, { rows }), b = h.api.bindForm(second, { rows });
    a.bind(id); b.bind(id); const original = rows.original(id), events: RowsEvent[] = [];
    const stop = rows.subscribe(event => events.push(event)); const input = h.field(first); input.checked = true;
    input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true }));
    const checked = { value: rows.get(id)!.value, original: rows.original(id), sameOriginal: original === rows.original(id),
      status: rows.get(id)!.status, read: a.read(), sibling: h.field(second).checked, events: [...events],
      nativeValue: input.value, valueAttribute: input.getAttribute("value"), unchecked: input.getAttribute("data-unchecked-value") };
    input.checked = false; input.dispatchEvent(new Event("change", { bubbles: true }));
    const unchecked = { raw: rows.get(id)!.value.flag, status: rows.get(id)!.status, sibling: h.field(second).checked, events: [...events] };
    stop(); a.dispose(); b.dispose(); rows.dispose(); first.remove(); second.remove(); return { checked, unchecked };
  });
  expect(result.checked).toEqual({ value: { name: "Ada", flag: "Y", hidden: { keep: 7 } },
    original: { name: "Ada", flag: "N", hidden: { keep: 7 } }, sameOriginal: true, status: "update", read: { name: "Ada", flag: "Y" },
    sibling: true, events: [{ type: "set", id: 1, changed: true }], nativeValue: "Y", valueAttribute: "Y", unchecked: "N" });
  expect(result.unchecked).toEqual({ raw: "N", status: "clean", sibling: false,
    events: [{ type: "set", id: 1, changed: true }, { type: "set", id: 1, changed: true }] });
});

test("local Form retains string defaults and trusted reset while unmarked checkbox remains boolean", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.codedCheckbox, root = h.root("Form", '<input type="checkbox" data-field="flag" value="1" data-unchecked-value="0" checked>');
    root.insertAdjacentHTML("beforeend", '<input type="checkbox" data-field="plain" checked>');
    const input = h.field(root), plain = root.querySelector<HTMLInputElement>('[data-field="plain"]')!, form = h.api.bindForm(root);
    const defaults = form.defaults(), before = form.prepare(); input.checked = false; plain.checked = false;
    input.dispatchEvent(new Event("change", { bubbles: true })); const entered = { read: form.read(), prepared: form.prepare() };
    (root as HTMLFormElement).reset(); const reset = form.prepare(), readAfterReset = form.read();
    const cancel = (event: Event) => event.preventDefault(); root.addEventListener("reset", cancel);
    input.checked = false; (root as HTMLFormElement).reset(); const canceled = form.prepare(); root.removeEventListener("reset", cancel);
    const flags = { value: input.value, defaultChecked: input.defaultChecked, checked: input.checked, plain: plain.checked };
    form.unbind(); const unbound = form.read(); form.dispose(); root.remove(); return { defaults, before, entered, reset, readAfterReset, canceled, flags, unbound };
  });
  expect(result.defaults).toEqual({ flag: "1", plain: true });
  expect(result.before).toEqual({ valid: true, values: { flag: "1", plain: true }, issues: [] });
  expect(result.entered).toEqual({ read: { name: "", flag: "0", plain: false }, prepared: { valid: true, values: { flag: "0", plain: false }, issues: [] } });
  expect(result.reset).toEqual({ valid: true, values: { flag: "1", plain: true }, issues: [] });
  expect(result.readAfterReset).toEqual({ name: "", flag: "1", plain: true });
  expect(result.canceled).toEqual({ valid: true, values: { flag: "0", plain: true }, issues: [] });
  expect(result.flags).toEqual({ value: "1", defaultChecked: true, checked: false, plain: true });
  expect(result.unbound).toEqual({ name: "", flag: "1", plain: true });
});

for (const pair of [["Y", "N"], ["1", "0"], ["on", "off"], ["", "off"]]) {
  test(`coded values are exact strings including ${JSON.stringify(pair)}`, async ({ page }) => {
    const result = await page.evaluate(pair => {
      const h = window.codedCheckbox, root = h.root("Form"); const input = h.field(root);
      input.setAttribute("value", pair[0]); input.setAttribute("data-unchecked-value", pair[1]);
      const form = h.api.bindForm(root), defaults = form.defaults(); input.checked = true;
      const checked = form.prepare(); input.checked = false; const unchecked = form.prepare();
      form.dispose(); root.remove(); return { defaults, checked, unchecked };
    }, pair);
    expect(result).toEqual({ defaults: { flag: pair[1] }, checked: { valid: true, values: { flag: pair[0] }, issues: [] },
      unchecked: { valid: true, values: { flag: pair[1] }, issues: [] } });
  });
}

for (const raw of [null, "other", true, 0, "missing"] as const) {
  test(`unavailable source ${JSON.stringify(raw)} stays raw until a native edit commits a code`, async ({ page }) => {
    const result = await page.evaluate(raw => {
      const h = window.codedCheckbox, value: Item = { name: "Ada", hidden: { keep: 9 } };
      if (raw !== "missing") value.flag = raw;
      const rows = h.rows([value]), id = rows.entries()[0].id, before = rows.get(id), original = rows.original(id), root = h.root("Form");
      const form = h.api.bindForm(root, { rows }); form.bind(id); const input = h.field(root), events: RowsEvent[] = [];
      const stop = rows.subscribe(event => events.push(event)), prepared = form.prepare();
      const rejected = { checked: input.checked, raw: rows.get(id)!.value.flag, own: Object.hasOwn(rows.get(id)!.value, "flag"),
        read: form.read().flag, valid: prepared.valid, values: prepared.values, rules: prepared.issues.map(issue => issue.rule),
        same: rows.get(id) === before && rows.original(id) === original, events: events.length };
      input.checked = true; const changed = form.prepare();
      const pure = rows.get(id) === before && events.length === 0;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      const committed = { raw: rows.get(id)!.value.flag, hidden: rows.get(id)!.value.hidden, events: [...events], original: rows.original(id) };
      stop(); form.dispose(); rows.dispose(); root.remove(); return { rejected, changed, pure, committed };
    }, raw);
    expect(result.rejected).toEqual({ checked: false, raw: raw === "missing" ? undefined : raw, own: raw !== "missing", read: raw === "missing" ? undefined : raw,
      valid: false, values: null, rules: ["choice-option"], same: true, events: 0 });
    expect(result.changed).toEqual({ valid: true, values: { flag: "Y" }, issues: [] }); expect(result.pure).toBe(true);
    expect(result.committed).toEqual({ raw: "Y", hidden: { keep: 9 }, events: [{ type: "set", id: 1, changed: true }],
      original: { name: "Ada", ...(raw === "missing" ? {} : { flag: raw }), hidden: { keep: 9 } } });
  });
}

test("required uses stored raw code rather than a callback's display projection and prepare preserves raw", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.codedCheckbox, rows = h.rows([{ name: "Ada", flag: "N", hidden: { keep: 1 } }, { name: "Grace", flag: "Y", hidden: { keep: 2 } }]);
    const root = h.root("Form", '<input type="checkbox" data-field="flag" value="Y" data-unchecked-value="N" required>');
    const calls: unknown[] = [], form = h.api.bindForm(root, { rows, beforeBindValue(value, context) {
      if (context.field !== "flag") return; calls.push([value, context.phase]); return value === "N" ? "Y" : "N";
    } });
    form.bind(1); const absent = { shown: h.field(root).checked, raw: form.read().flag, rules: form.validate(1).issues.map(issue => issue.rule), prepared: form.prepare() };
    form.bind(2); const present = { shown: h.field(root).checked, raw: form.read().flag, result: form.validate(2), prepared: form.prepare() };
    const unchanged = rows.changes().length === 0; form.dispose(); rows.dispose(); root.remove(); return { absent, present, unchanged, calls };
  });
  expect(result.absent.shown).toBe(true); expect(result.absent.raw).toBe("N"); expect(result.absent.rules).toEqual(["html"]);
  expect(result.absent.prepared.valid).toBe(false); expect(result.absent.prepared.values).toBeNull();
  expect(result.present).toEqual({ shown: false, raw: "Y", result: { valid: true, issues: [] }, prepared: { valid: true, values: { flag: "Y" }, issues: [] } });
  expect(result.unchanged).toBe(true); expect(result.calls).toEqual([["N", "bind"], ["Y", "bind"]]);
});

for (const kind of ["Form", "Grid", "List"] as const) {
  test(`${kind} rejects invalid coded replacements and releases field ownership for retry`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.codedCheckbox, root = h.root(kind), rows = h.rows([{ name: "Ada", flag: "Y", hidden: { keep: 1 } }]), original = root.innerHTML;
      const options = { rows, beforeBindValue(value: unknown, context: { field: string }) { return context.field === "flag" ? true : undefined; } };
      let handle: { dispose(): void } | undefined, unbind: (() => void) | undefined;
      const failure = h.error(() => {
        if (kind === "Form") { const form = h.api.bindForm(root, options); handle = form; unbind = () => form.unbind(); form.bind(1); }
        else handle = kind === "Grid" ? h.api.bindGrid(root as HTMLTableElement, options) : h.api.bindList(root as HTMLUListElement, options);
      });
      unbind?.(); handle?.dispose(); const restored = root.innerHTML === original;
      const next = kind === "Form" ? h.api.bindForm(root, { rows }) : kind === "Grid" ? h.api.bindGrid(root as HTMLTableElement, { rows }) : h.api.bindList(root as HTMLUListElement, { rows });
      if (kind === "Form") (next as ReturnType<typeof bindForm<Item>>).bind(1);
      if (kind === "Grid") await (next as ReturnType<typeof bindGrid<Item>>).whenBound();
      const retry = h.field(root).checked; next.dispose(); rows.dispose(); root.remove(); return { code: failure?.code, restored, retry };
    }, kind);
    expect(result).toEqual({ code: `${kind.toUpperCase()}_VALUE`, restored: true, retry: true });
  });

  test(`${kind} admits only one checkbox with two explicit distinct strings`, async ({ page }) => {
    const result = await page.evaluate(kind => {
      const h = window.codedCheckbox, rows = h.rows([{ name: "Ada", flag: "Y", hidden: { keep: 1 } }]);
      const invalid = [
        '<input type="checkbox" data-field="flag" data-unchecked-value="N">',
        '<input type="checkbox" data-field="flag" value="Y" data-unchecked-value="Y">',
        '<input data-field="flag" value="Y" data-unchecked-value="N">',
        '<input type="checkbox" value="Y" data-unchecked-value="N">',
        '<input type="checkbox" data-field="flag" value="Y" data-unchecked-value="N"><input type="checkbox" data-field="flag" value="Z">'
      ];
      const codes = invalid.map(control => {
        const root = h.root(kind, control), original = root.innerHTML;
        const failure = h.error(() => { if (kind === "Form") h.api.bindForm(root, { rows }); else if (kind === "Grid") h.api.bindGrid(root as HTMLTableElement, { rows }); else h.api.bindList(root as HTMLUListElement, { rows }); });
        const unchanged = original === root.innerHTML; root.remove(); return [failure?.code, unchanged];
      }); rows.dispose(); return codes;
    }, kind);
    expect(result).toEqual(Array.from({ length: 5 }, () => [`${kind.toUpperCase()}_CONTROL`, true]));
  });
}

test("captured checkbox declarations reject structural rescan and native changes during pure prepare", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.codedCheckbox, root = h.root("Form"), rows = h.rows([{ name: "Ada", flag: "Y", hidden: { keep: 1 } }]);
    let mutate = false;
    const form = h.api.bindForm(root, { rows, rules: { fields: { flag: { validate: [["observe"]] } }, validate: {
      observe: () => { if (mutate) h.field(root).setAttribute("data-unchecked-value", "X"); return true; }
    } } }); form.bind(1); const input = h.field(root), original = rows.get(1);
    input.setAttribute("data-unchecked-value", "X"); const rescan = h.error(() => form.rescan());
    input.setAttribute("data-unchecked-value", "N"); form.rescan(); mutate = true;
    const prepare = h.error(() => form.prepare()); mutate = false; input.setAttribute("data-unchecked-value", "N");
    const retry = form.prepare(), unchanged = rows.get(1) === original; form.dispose(); rows.dispose(); root.remove();
    return { rescan: rescan?.code, prepare: prepare?.code, phase: prepare?.detail?.phase, retry, unchanged };
  });
  expect(result).toEqual({ rescan: "FORM_RESCAN", prepare: "FORM_PREPARE", phase: "stale", retry: { valid: true, values: { flag: "Y" }, issues: [] }, unchanged: true });
});

test("coded display callbacks keep one frozen source pair and cannot write an older row after a newer bind", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.codedCheckbox, root = h.root("Form"), rows = h.rows([{ name: "Ada", flag: "Y", hidden: { keep: 1 } }, { name: "Grace", flag: "N", hidden: { keep: 2 } }]);
    const input = h.field(root), trace: unknown[] = [], contexts: unknown[] = []; let rebind = false;
    const form = h.api.bindForm(root, { rows,
      beforeSourceBind(value, context) { if (context.key === "flag") { contexts.push(context); trace.push(["before", value, context.row.id, context.elements[0] === input]); } },
      onSourceBind(value, context) { if (context.key === "flag") { trace.push(["after", value, context.row.id, context === contexts.at(-1), input.checked]); } },
      beforeBindValue(value, context) {
        if (context.field === "flag" && context.rowId === 1 && rebind) { rebind = false; form.bind(2); return "Y"; }
      }
    });
    form.bind(1); const initial = [...trace]; trace.length = 0; rebind = true; form.bind(1);
    const current = { checked: input.checked, read: form.read(), traces: trace, unchanged: rows.changes().length === 0,
      frozen: contexts.every(context => Object.isFrozen(context) && Object.isFrozen((context as { elements: unknown }).elements)) };
    form.dispose(); rows.dispose(); root.remove(); return { initial, current };
  });
  expect(result.initial).toEqual([["before", "Y", 1, true], ["after", "Y", 1, true, true]]);
  expect(result.current).toEqual({ checked: false, read: { name: "Grace", flag: "N" },
    traces: [["before", "Y", 1, true], ["before", "N", 2, true], ["after", "N", 2, true, false]], unchanged: true, frozen: true });
});

test("Grid defaults retain authored checked code separately from the rendered row", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.codedCheckbox, root = h.root("Grid", '<input type="checkbox" data-field="flag" value="Y" data-unchecked-value="N" checked>');
    const rows = h.rows([{ name: "Ada", flag: "N", hidden: { keep: 1 } }]), input = root.querySelector<HTMLInputElement>('input[data-field="flag"]')!;
    const grid = h.api.bindGrid(root as HTMLTableElement, { rows }); await grid.whenBound();
    const first = { defaults: grid.defaults(), shown: h.field(root).checked, raw: rows.get(1)!.value.flag, originalChecked: input.defaultChecked };
    grid.dispose(); const restored = { checked: input.checked, defaultChecked: input.defaultChecked, value: input.value };
    root.remove(); rows.dispose(); return { first, restored };
  });
  expect(result).toEqual({ first: { defaults: { flag: "Y" }, shown: false, raw: "N", originalChecked: true }, restored: { checked: true, defaultChecked: true, value: "Y" } });
});

test("Grid retains string drafts by RowId and pastes only configured codes atomically", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.codedCheckbox, root = h.root("Grid"), rows = h.rows([{ name: "Ada", flag: "N", hidden: { keep: 1 } }, { name: "Grace", flag: "Y", hidden: { keep: 2 } }]);
    const physical = new Map<RowId, HTMLElement>(), grid = h.api.bindGrid(root as HTMLTableElement, { rows, paste: true, validateOn: "manual", onRowBind(binding) { physical.set(binding.row.id, binding.elements[0]); } });
    await grid.whenBound(); const events: RowsEvent[] = [], stop = rows.subscribe(event => events.push(event));
    const first = h.field(physical.get(1)!); first.checked = true; first.dispatchEvent(new Event("change", { bubbles: true }));
    const draft = { raw: rows.get(1)!.value.flag, checked: first.checked, events: events.length };
    grid.setSort((a, b) => b.name.localeCompare(a.name)); await grid.whenBound();
    const retained = { raw: rows.get(1)!.value.flag, checked: h.field(physical.get(1)!).checked, first: root.querySelector('[data-field="name"]')!.textContent };
    const validate = grid.validate(1), committed = rows.get(1)!.value.flag;
    const before = rows.entries(), invalid = grid.paste("N\nno", { id: 2, field: "flag" });
    const rejected = { valid: invalid.valid, rules: invalid.issues.map(issue => issue.rule), same: before === rows.entries() };
    const pasted = grid.paste("N\nY", { id: 2, field: "flag" });
    const raw = rows.entries().map(row => [row.id, row.value.flag, row.value.hidden.keep]), count = events.length;
    stop(); grid.dispose(); rows.dispose(); root.remove(); return { draft, retained, validate, committed, rejected, pasted, raw, count };
  });
  expect(result.draft).toEqual({ raw: "N", checked: true, events: 0 });
  expect(result.retained).toEqual({ raw: "N", checked: true, first: "Grace" });
  expect(result.validate).toEqual({ valid: true, issues: [] }); expect(result.committed).toBe("Y");
  expect(result.rejected).toEqual({ valid: false, rules: ["paste"], same: true });
  expect(result.pasted).toEqual({ valid: true, issues: [] }); expect(result.raw).toEqual([[1, "Y", 1], [2, "N", 2]]); expect(result.count).toBe(2);
});

for (const kind of ["Grid", "List"] as const) {
  test(`${kind} validates offscreen stored codes and raw required checkedness independently of projected display`, async ({ page }) => {
    const result = await page.evaluate(async kind => {
      const h = window.codedCheckbox, root = h.root(kind, '<input type="checkbox" data-field="flag" value="Y" data-unchecked-value="N" required>');
      const rows = h.rows([{ name: "Ada", flag: "Y", hidden: { keep: 1 } }, { name: "Grace", flag: "N", hidden: { keep: 2 } }, { name: "Lin", flag: null, hidden: { keep: 3 } }]);
      const options = { rows, beforeBindValue(value: unknown, context: { field: string }) { return context.field === "flag" ? value === "Y" ? "N" : "Y" : undefined; } };
      const owner = kind === "Grid" ? h.api.bindGrid(root as HTMLTableElement, options) : h.api.bindList(root as HTMLUListElement, options);
      if (kind === "Grid") await (owner as ReturnType<typeof bindGrid<Item>>).whenBound();
      const displayed = [...root.querySelectorAll<HTMLInputElement>('input[data-field="flag"]')].map(input => [input.checked, input.disabled]);
      owner.setPage({ page: 1, size: 1 }); if (kind === "Grid") await (owner as ReturnType<typeof bindGrid<Item>>).whenBound();
      const checked = owner.validate(), issues = checked.issues.map(issue => [issue.rowId, issue.rule, !!issue.element]);
      const unchanged = rows.changes().length === 0; owner.dispose(); rows.dispose(); root.remove(); return { displayed, valid: checked.valid, issues, unchanged };
    }, kind);
    expect(result.displayed).toEqual([[false, kind === "List"], [true, kind === "List"], [true, kind === "List"]]);
    expect(result.valid).toBe(false); expect(result.issues).toEqual([[2, "html", false], [3, "choice-option", false], [3, "html", false]]); expect(result.unchanged).toBe(true);
  });
}

test("deleted Form preview retains committed code and locks across native reset, then received revert restores editing", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.codedCheckbox, root = h.root("Form", '<input type="checkbox" data-field="flag" value="Y" data-unchecked-value="N">');
    const rows = h.rows([{ name: "Ada", flag: "Y", hidden: { keep: 1 } }]), form = h.api.bindForm(root, { rows }); form.bind(1);
    rows.remove(1); const input = h.field(root), entries = rows.entries({ includeDeleted: true });
    (root as HTMLFormElement).reset(); const prepared = h.error(() => form.prepare());
    await new Promise<void>(resolve => setTimeout(resolve, 0)); const read = form.read();
    const preview = { checked: input.checked, locked: input.disabled, marker: root.getAttribute("data-row-status"), read,
      code: prepared?.code, phase: prepared?.detail?.phase, same: entries === rows.entries({ includeDeleted: true }) };
    rows.revert(1); const revived = { checked: input.checked, locked: input.disabled, raw: rows.get(1)!.value.flag, prepared: form.prepare() };
    form.dispose(); rows.dispose(); root.remove(); return { preview, revived };
  });
  expect(result.preview).toEqual({ checked: true, locked: true, marker: "delete", read: { name: "Ada", flag: "Y" }, code: "FORM_PREPARE", phase: "preview", same: true });
  expect(result.revived).toEqual({ checked: true, locked: false, raw: "Y", prepared: { valid: true, values: { flag: "Y" }, issues: [] } });
});
