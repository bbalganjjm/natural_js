// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RowId, Rows } from "../../src/data/index.js";
import type { ListHandle } from "../../src/ui/index.js";
import type { bindList } from "../../src/ui/list.js";

type Item = { name: string; salary: number; chosen: string | null; choices: { label: string; value: string }[] };
type Options = Parameters<typeof bindList<Item>>[1];
type Binding = Parameters<NonNullable<Options["onRowBind"]>>[0];
const source = (relative: string) => `/@fs/${fileURLToPath(new URL(relative, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { list: source("../../src/ui/list.ts"), data: source("../../src/data/index.ts"), select: source("../../src/ui/select.ts") };
const markup = '<li data-row-template><button type="button" data-select-row><span data-field="name"></span></button>' +
  '<span data-field="salary" data-format=\'[["commas"]]\'></span><button type="button" data-inspect>Inspect</button>' +
  '<label>Choice <select data-field="chosen" data-options="choices" data-option-label="label" data-option-value="value">' +
  '<option value="">Choose</option></select></label></li><li data-empty hidden>No employees</li>';

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
});

test("List captures its row callback once and calls plainly after current values and final physical placement", async ({ page }) => {
  const result = await page.evaluate(async ({ list, data, markup }) => {
    const { bindList } = await import(list), { createRows } = await import(data), root = document.createElement("ul"), cold = document.createElement("ul"), boundRoot = document.createElement("ul");
    root.innerHTML = markup; cold.innerHTML = markup; boundRoot.innerHTML = markup; document.body.append(root, cold, boundRoot);
    const rows: Rows<Item> = createRows(["Ada", "Grace"].map(name => ({ name, salary: 1200, chosen: "a", choices: [{ label: "One", value: "a" }] })));
    let reads = 0, lateCalls = 0; const observations: unknown[] = [];
    const callback = function(this: unknown, binding: Binding) { "use strict";
      const element = binding.elements[0], select = element.querySelector("select")!;
      observations.push({ name: binding.row.value.name, plain: this === undefined, connected: element.parentElement === root,
        count: binding.elements.length, tag: element.tagName, frozen: Object.isFrozen(binding) && Object.isFrozen(binding.elements) && Object.isFrozen(binding.row.value),
        current: binding.row === rows.get(binding.row.id), shown: element.querySelector('[data-field="name"]')!.textContent,
        salary: element.querySelector('[data-field="salary"]')!.textContent, choice: select.selectedOptions[0]?.textContent, disabled: select.disabled,
        order: [...root.querySelectorAll('[data-field="name"]')].map(field => field.textContent) });
    };
    const options: Options = { rows, get onRowBind() { reads++; return callback; } };
    const handle = bindList(root, options); Object.defineProperty(options, "onRowBind", { value: () => { lateCalls++; } }); handle.refresh();
    const coldOptions: Options = { rows }, coldHandle = bindList(cold, coldOptions); coldOptions.onRowBind = () => { lateCalls++; }; coldHandle.refresh();
    const bound: string[] = [], withReceiver = function(this: { prefix: string }, binding: Binding) { "use strict"; bound.push(this.prefix + binding.row.value.name); };
    const boundHandle = bindList(boundRoot, { rows, onRowBind: withReceiver.bind({ prefix: "bound:" }) });
    handle.dispose(); coldHandle.dispose(); boundHandle.dispose(); let invalid = "none";
    try { bindList(root, { rows, onRowBind: false }); } catch (cause) { invalid = (cause as { code: string }).code; }
    rows.dispose(); root.remove(); cold.remove(); boundRoot.remove(); return { reads, lateCalls, observations, invalid, bound };
  }, { ...modules, markup });
  expect(result.reads).toBe(1); expect(result.lateCalls).toBe(0); expect(result.invalid).toBe("LIST_BIND"); expect(result.bound).toEqual(["bound:Ada", "bound:Grace"]);
  expect(result.observations).toEqual(["Ada", "Grace", "Ada", "Grace"].map(name => ({ name, plain: true, connected: true, count: 1, tag: "LI", frozen: true,
    current: true, shown: name, salary: "1,200", choice: "One", disabled: true, order: ["Ada", "Grace"] })));
});

test("row-owned native and custom events keep RowId through pure sorting and fresh equal-snapshot view reentry", async ({ page }) => {
  const result = await page.evaluate(async ({ list, data, markup }) => {
    const { bindList } = await import(list), { createRows } = await import(data), root = document.createElement("ol"); root.innerHTML = markup; document.body.append(root);
    const rows: Rows<Item> = createRows(["Ada", "Grace", "Lin"].map(name => ({ name, salary: 0, chosen: null, choices: [] })));
    const elements = new Map<RowId, HTMLLIElement>(), active = new Map<RowId, number>(), names = new Map(rows.entries().map(row => [row.id, row.value.name]));
    const binds: string[] = [], cleanup: { name: string; connected: boolean }[] = [], events: string[] = []; let generation = 0;
    const handle: ListHandle<Item> = bindList(root, { rows, onRowBind(binding: Binding) {
      const element = binding.elements[0], name = binding.row.value.name, button = element.querySelector<HTMLButtonElement>("[data-inspect]")!;
      binds.push(name); elements.set(binding.row.id, element); active.set(binding.row.id, ++generation);
      const inspect = () => { events.push(String(binding.row.id) + ":" + name); }; button.addEventListener("click", inspect); button.addEventListener("row-check", inspect);
      binding.own(() => { button.removeEventListener("click", inspect); button.removeEventListener("row-check", inspect); active.delete(binding.row.id); cleanup.push({ name, connected: element.parentElement === root }); });
    } });
    const original = new Map(elements), graceId = [...names].find(([, name]) => name === "Grace")![0], graceGeneration = active.get(graceId);
    handle.setSort((a, b) => b.name.localeCompare(a.name));
    const pureSort = { binds: binds.length, cleanup: cleanup.length, active: active.size };
    root.querySelector<HTMLButtonElement>("[data-inspect]")!.click();
    handle.setFilter(row => row.name !== "Grace"); original.get(graceId)!.querySelector("[data-inspect]")!.dispatchEvent(new Event("row-check"));
    handle.setPage({ page: 2, size: 1 }); handle.setFilter(null);
    const reentered = { sameElement: elements.get(graceId) === original.get(graceId), fresh: active.get(graceId) !== graceGeneration,
      active: active.size, name: root.querySelector('[data-field="name"]')!.textContent };
    original.get(graceId)!.querySelector("[data-inspect]")!.dispatchEvent(new Event("row-check"));
    const beforeReturn = binds.length; handle.setPage(null); const returnOrder = binds.slice(beforeReturn);
    const beforeRefresh = binds.length; handle.refresh(); const refreshOrder = binds.slice(beforeRefresh);
    const beforeRemove = cleanup.length; rows.remove(graceId); const pruned = cleanup.slice(beforeRemove);
    const retainedIdentity = [...elements].every(([id, element]) => element === original.get(id)); handle.dispose();
    const beforeOldClick = events.length; for (const element of original.values()) element.querySelector<HTMLButtonElement>("[data-inspect]")!.click();
    const released = { active: active.size, silent: events.length === beforeOldClick, template: root.querySelectorAll("[data-row-template]").length };
    const expectedEvents = [String([...names].find(([, name]) => name === "Lin")![0]) + ":Lin", String(graceId) + ":Grace"];
    rows.dispose(); root.remove(); return { pureSort, reentered, returnOrder, refreshOrder, pruned, retainedIdentity, released, events, expectedEvents };
  }, { ...modules, markup });
  expect(result.pureSort).toEqual({ binds: 3, cleanup: 0, active: 3 }); expect(result.reentered).toEqual({ sameElement: true, fresh: true, active: 1, name: "Grace" });
  expect(result.returnOrder).toEqual(["Lin", "Ada"]); expect(result.refreshOrder).toEqual(["Lin", "Grace", "Ada"]); expect(result.pruned).toEqual([{ name: "Grace", connected: true }]);
  expect(result.retainedIdentity).toBe(true); expect(result.released).toEqual({ active: 0, silent: true, template: 1 }); expect(result.events).toEqual(result.expectedEvents);
});

test("List closes prior row resources before replacement display writes and keeps the same physical row", async ({ page }) => {
  const result = await page.evaluate(async ({ list, data, markup }) => {
    const { bindList } = await import(list), { createRows } = await import(data), root = document.createElement("ul"); root.innerHTML = markup; document.body.append(root);
    const rows: Rows<Item> = createRows([{ name: "Ada", salary: 0, chosen: null, choices: [] }]), id = rows.entries()[0].id, order: string[] = [], nodes: HTMLLIElement[] = [];
    const handle = bindList(root, { rows, onRowBind(binding: Binding) {
      const element = binding.elements[0]; nodes.push(element); order.push("bind:" + element.querySelector('[data-field="name"]')!.textContent);
      binding.own(() => { order.push("cleanup:" + element.querySelector('[data-field="name"]')!.textContent); });
    } }); rows.set(id, "name", "Augusta"); const beforeDispose = [...order], same = nodes[0] === nodes[1]; handle.dispose(); rows.dispose(); root.remove(); return { beforeDispose, same, order };
  }, { ...modules, markup });
  expect(result).toEqual({ beforeDispose: ["bind:Ada", "cleanup:Ada", "bind:Augusta"], same: true, order: ["bind:Ada", "cleanup:Ada", "bind:Augusta", "cleanup:Augusta"] });
});

test("row callbacks cannot reenter view setters before their options change", async ({ page }) => {
  const result = await page.evaluate(async ({ list, data, markup }) => {
    const { bindList } = await import(list), { createRows } = await import(data), root = document.createElement("ul"); root.innerHTML = markup; document.body.append(root);
    const rows: Rows<Item> = createRows(["Ada", "Grace"].map(name => ({ name, salary: 0, chosen: null, choices: [] }))), codes: string[] = [];
    let handle!: ListHandle<Item>, armed = false, compared = 0;
    handle = bindList(root, { rows, onRowBind(binding: Binding) {
      if (!armed || binding.row.value.name !== "Ada") return;
      for (const run of [() => handle.refresh(), () => handle.setSort(() => { compared++; return -1; }), () => handle.setFilter(() => false), () => handle.setPage({ page: 2, size: 1 })]) {
        try { run(); } catch (cause) { codes.push((cause as { code: string }).code); }
      }
    } }); armed = true; handle.refresh(); const shown = [...root.querySelectorAll('[data-field="name"]')].map(element => element.textContent), currentPage = handle.page();
    armed = false; handle.dispose(); rows.dispose(); root.remove(); return { codes, shown, currentPage, compared };
  }, { ...modules, markup });
  expect(result).toEqual({ codes: Array(4).fill("LIST_BIND_REENTRANT"), shown: ["Ada", "Grace"], currentPage: null, compared: 0 });
});

for (const mode of ["uncaught", "caught"] as const) {
  test(`a ${mode} source change closes prepared row resources and permits an explicit fresh retry`, async ({ page }) => {
    const result = await page.evaluate(async ({ list, data, markup, mode }) => {
      const { bindList } = await import(list), { createRows } = await import(data), root = document.createElement("ul"); root.innerHTML = markup; document.body.append(root);
      const rows: Rows<Item> = createRows(["Ada", "Grace"].map(name => ({ name, salary: 0, chosen: null, choices: [] }))), id = rows.entries()[0].id;
      let armed = false, closed = 0, late = 0, failed!: Binding; const nested: string[] = [];
      const handle: ListHandle<Item> = bindList(root, { rows, onRowBind(binding: Binding) {
        binding.own(() => { closed++; });
        if (!armed || binding.row.id !== id) return; failed = binding;
        if (mode === "caught") { try { rows.set(id, "name", "Augusta"); } catch (cause) { nested.push((cause as { code: string }).code); } }
        else rows.set(id, "name", "Augusta");
      } });
      armed = true; let error = "none"; try { handle.refresh(); } catch (cause) { error = (cause as { code: string }).code; }
      const afterFailure = { closed, raw: rows.get(id)!.value.name }; let lateError = "none";
      try { failed.own(() => { late++; }); } catch (cause) { const error = cause as { code: string; detail: { phase: string } }; lateError = error.code + ":" + error.detail.phase; }
      armed = false; handle.refresh(); const shown = [...root.querySelectorAll('[data-field="name"]')].map(element => element.textContent); handle.dispose(); rows.dispose(); root.remove();
      return { error, nested, afterFailure, late, lateError, shown, closed };
    }, { ...modules, markup, mode });
    expect(result).toEqual({ error: mode === "caught" ? "LIST_BIND_STALE" : "LIST_BIND_REENTRANT", nested: mode === "caught" ? ["LIST_BIND_REENTRANT"] : [],
      afterFailure: { closed: 3, raw: "Augusta" }, late: 1, lateError: "LIST_BIND:own", shown: ["Augusta", "Grace"], closed: 5 });
  });
}

test("a failed initial row callback preserves its cause while restoring authored template and Select claims", async ({ page }) => {
  const result = await page.evaluate(async ({ list, data, select, markup }) => {
    const { bindList } = await import(list), { createRows } = await import(data), { bindSelect } = await import(select), root = document.createElement("ul"); root.innerHTML = markup; document.body.append(root);
    const authored = root.querySelector<HTMLLIElement>("[data-row-template]")!, snapshot = root.cloneNode(true), originalSelect = authored.querySelector("select")!;
    const rows: Rows<Item> = createRows([{ name: "Ada", salary: 0, chosen: "a", choices: [{ label: "One", value: "a" }] }]), cause = new Error("callback"), order: string[] = [];
    let failure = { code: "none", phase: "none", primary: false };
    try { bindList(root, { rows, onRowBind(binding: Binding) {
      binding.own(() => { order.push("first"); }); binding.own(() => { order.push("second"); throw null; }); throw cause;
    } }); } catch (error) { const current = error as { code: string; cause: unknown; detail: { phase: string } }; failure = { code: current.code, phase: current.detail.phase, primary: current.cause === cause }; }
    const restored = root.isEqualNode(snapshot) && root.querySelector("[data-row-template]") === authored;
    const standalone = bindSelect(originalSelect, { choices: [{ label: "One", value: "a" }], value: "a" }); standalone.dispose();
    const retry = bindList(root, { rows }); const retryCount = root.querySelectorAll('li:not([data-empty])').length; retry.dispose(); rows.dispose(); root.remove(); return { failure, restored, order, retryCount };
  }, { ...modules, markup });
  expect(result).toEqual({ failure: { code: "LIST_BIND", phase: "onRowBind", primary: true }, restored: true, order: ["second", "first"], retryCount: 1 });
});

for (const phase of ["callback", "cleanup"] as const) {
  test(`List rejects and drains asynchronous ${phase} work without leaving ownership or DOM resources`, async ({ page }) => {
    const result = await page.evaluate(async ({ list, data, markup, phase }) => {
      const { bindList } = await import(list), { createRows } = await import(data), root = document.createElement("ul"); root.innerHTML = markup; document.body.append(root);
      const snapshot = root.cloneNode(true), rows: Rows<Item> = createRows([{ name: "Ada", salary: 0, chosen: null, choices: [] }]), unhandled: string[] = [];
      const onUnhandled = (event: PromiseRejectionEvent) => { unhandled.push(String(event.reason)); }; window.addEventListener("unhandledrejection", onUnhandled);
      let handle: ListHandle<Item> | undefined, closed = 0, code = "none", errorPhase = "none";
      try {
        handle = bindList(root, { rows, onRowBind(binding: Binding) {
          binding.own(() => { closed++; });
          if (phase === "callback") return Promise.reject(new Error("invalid callback"));
          binding.own(() => Promise.reject(new Error("invalid cleanup")));
        } });
        handle!.dispose();
      } catch (cause) { const error = cause as { code: string; detail: { phase: string } }; code = error.code; errorPhase = error.detail.phase; }
      await new Promise(resolve => setTimeout(resolve, 0)); window.removeEventListener("unhandledrejection", onUnhandled);
      const restored = root.isEqualNode(snapshot); const retry = bindList(root, { rows }); retry.dispose(); rows.dispose(); root.remove(); return { code, errorPhase, closed, restored, unhandled };
    }, { ...modules, markup, phase });
    expect(result).toEqual({ code: "LIST_BIND", errorPhase: phase === "callback" ? "onRowBind" : "cleanup", closed: 1, restored: true, unhandled: [] });
  });
}

test("row cleanup is LIFO, continues after primitive failures and restores every root before reporting", async ({ page }) => {
  const result = await page.evaluate(async ({ list, data, markup }) => {
    const { bindList } = await import(list), { createRows } = await import(data), root = document.createElement("ul"); root.innerHTML = markup; document.body.append(root);
    const snapshot = root.cloneNode(true), rows: Rows<Item> = createRows(["Ada", "Grace"].map(name => ({ name, salary: 0, chosen: null, choices: [] })));
    const order: string[] = [], old: HTMLButtonElement[] = [], contexts: Binding[] = []; let clicks = 0, late = 0;
    const handle = bindList(root, { rows, onRowBind(binding: Binding) {
      contexts.push(binding); const name = binding.row.value.name, button = binding.elements[0].querySelector<HTMLButtonElement>("[data-inspect]")!; old.push(button);
      const listener = () => { clicks++; }; button.addEventListener("click", listener); binding.own(() => button.removeEventListener("click", listener));
      binding.own(() => { order.push(name + ":first"); }); binding.own(() => { order.push(name + ":second"); throw null; });
    } });
    let failure = { code: "none", phase: "none", nullCause: false };
    try { handle.dispose(); } catch (cause) { const error = cause as { code: string; cause: unknown; detail: { phase: string } }; failure = { code: error.code, phase: error.detail.phase, nullCause: error.cause === null }; }
    old.forEach(button => button.click()); let lateError = "none";
    try { contexts[0].own(() => { late++; }); } catch (cause) { const error = cause as { code: string; detail: { phase: string } }; lateError = error.code + ":" + error.detail.phase; }
    const restored = root.isEqualNode(snapshot), retry = bindList(root, { rows }); retry.dispose(); rows.dispose(); root.remove(); return { failure, order, clicks, late, lateError, restored };
  }, { ...modules, markup });
  expect(result).toEqual({ failure: { code: "LIST_BIND", phase: "cleanup", nullCause: true }, order: ["Grace:second", "Grace:first", "Ada:second", "Ada:first"], clicks: 0, late: 1, lateError: "LIST_BIND:own", restored: true });
});

test("disposal during a row callback restores that List and leaves its same-store sibling independent", async ({ page }) => {
  const result = await page.evaluate(async ({ list, data, markup }) => {
    const { bindList } = await import(list), { createRows } = await import(data), firstRoot = document.createElement("ul"), secondRoot = document.createElement("ul");
    firstRoot.innerHTML = markup; secondRoot.innerHTML = markup; document.body.append(firstRoot, secondRoot);
    const snapshot = firstRoot.cloneNode(true), rows: Rows<Item> = createRows(["Ada", "Grace"].map(name => ({ name, salary: 0, chosen: null, choices: [] }))), id = rows.entries()[0].id;
    let first!: ListHandle<Item>, armed = false, closed = 0; const calls: string[] = [];
    first = bindList(firstRoot, { rows, onRowBind(binding: Binding) {
      calls.push(binding.row.value.name); binding.own(() => { closed++; }); if (armed && binding.row.id === id) first.dispose();
    } });
    const second = bindList(secondRoot, { rows, onRowBind(binding: Binding) { binding.elements[0].dataset.row = String(binding.row.id); } });
    armed = true; let error = "none"; try { first.refresh(); } catch (cause) { error = (cause as { code: string }).code; }
    const restored = firstRoot.isEqualNode(snapshot); rows.set(id, "name", "Augusta"); const sibling = [...secondRoot.querySelectorAll('[data-field="name"]')].map(element => element.textContent);
    second.dispose(); rows.dispose(); firstRoot.remove(); secondRoot.remove(); return { error, restored, sibling, calls, closed };
  }, { ...modules, markup });
  expect(result).toEqual({ error: "LIST_DISPOSED", restored: true, sibling: ["Augusta", "Grace"], calls: ["Ada", "Grace", "Ada"], closed: 3 });
});
