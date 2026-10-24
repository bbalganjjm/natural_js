// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows, RowsEvent } from "../../src/data/index.js";
import type { FormHandle, GridHandle, ListHandle } from "../../src/ui/index.js";

type Item = { key: string; rank: number; profile: { name: string; choice: number; options: { label: string; value: number }[] } };
declare global {
  interface Window {
    rowOrdering: {
      rows: Rows<Item>; grid: GridHandle<Item>; list: ListHandle<Item>; form: FormHandle<Item>;
      table: HTMLTableElement; listRoot: HTMLOListElement; formRoot: HTMLFormElement;
      formFormats: number; beforeCalls: number; veto: boolean; reenter?: () => void;
      events: { kind: string; ids: readonly number[]; previous: readonly number[]; dom: string[] }[];
    };
  }
}
const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { data: source("../../src/data/index.ts"), grid: source("../../src/ui/grid.ts"),
  list: source("../../src/ui/list.ts"), form: source("../../src/ui/form.ts"), tree: source("../../src/ui/tree.ts") };
const rowMarkup = `<th scope="row"><button type="button" data-select-row><span data-field="key"></span></button></th>
  <td><label>Name <input data-field="profile.name" required minlength="3"></label><output data-error-for="profile.name"></output></td>
  <td><label>Choice <select data-field="profile.choice" data-options="profile.options" data-option-label="label" data-option-value="value"></select></label></td>`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, rowMarkup }) => {
    const [{ createRows }, { bindGrid }, { bindList }, { bindForm }] = await Promise.all([
      import(modules.data), import(modules.grid), import(modules.list), import(modules.form)
    ]);
    const section = document.createElement("section");
    section.innerHTML = `<table data-order-grid><caption>Ordered employees</caption>
      <thead><tr><th scope="col">Key</th><th scope="col">Name</th><th scope="col">Choice</th></tr></thead>
      <tbody><tr data-row-template>${rowMarkup}</tr></tbody></table>
      <ol data-order-list><li data-row-template><button type="button" data-select-row><span data-field="key"></span></button>
      <label>Name <input data-field="profile.name" required minlength="3"></label><output data-error-for="profile.name"></output></li></ol>
      <form data-order-form><span data-field="key" data-format='[["watch"]]'></span>
      <label>Detail name <input data-field="profile.name" required minlength="3"></label><output data-error-for="profile.name"></output></form>`;
    document.body.append(section);
    const rows = createRows(["Ada", "Bo", "Grace", "Lin"].map((name, index) => ({
      key: String.fromCharCode(65 + index), rank: index + 1,
      profile: { name, choice: 1, options: [{ label: "One", value: 1 }, { label: "Two", value: 2 }] }
    })));
    const table = section.querySelector<HTMLTableElement>("table")!;
    const listRoot = section.querySelector<HTMLOListElement>("ol")!;
    const formRoot = section.querySelector<HTMLFormElement>("form")!;
    const h: Window["rowOrdering"] = { rows, table, listRoot, formRoot,
      grid: null as unknown as GridHandle<Item>, list: null as unknown as ListHandle<Item>, form: null as unknown as FormHandle<Item>,
      formFormats: 0, beforeCalls: 0, veto: false, events: [] };
    window.rowOrdering = h;
    const before = () => { h.beforeCalls++; h.reenter?.(); return !h.veto; };
    const record = (kind: string, change: { ids: readonly number[]; previous: readonly number[] }) => {
      h.events.push({ kind, ids: change.ids, previous: change.previous,
        dom: [...table.querySelectorAll<HTMLElement>('tbody [data-field="key"]')].map(node => node.textContent!) });
    };
    h.grid = bindGrid(table, { rows, multiple: true,
      beforeSelectionChange: before, beforeCheckChange: before,
      onSelectionChange: change => record("selected", change), onCheckChange: change => record("checked", change) });
    h.list = bindList(listRoot, { rows });
    h.form = bindForm(formRoot, { rows, rules: { format: { watch: value => { h.formFormats++; return value; } } } });
  }, { modules, rowMarkup });
});

test("shared row moves preserve nested drafts errors and the attached focused Grid editor", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowOrdering;
    const snapshot = h.rows.get(1);
    h.form.bind(1);
    const detail = h.formRoot.querySelector<HTMLInputElement>("input")!;
    detail.value = ""; detail.dispatchEvent(new Event("input", { bubbles: true }));
    const editor = h.table.querySelector<HTMLInputElement>("tbody input")!;
    editor.value = "g"; editor.dispatchEvent(new Event("input", { bubbles: true })); h.grid.validate(1);
    h.list.validate(2);
    const row = editor.closest("tr")!;
    const listError = h.listRoot.children[1].querySelector("output")!;
    const messages = [h.formRoot.querySelector("output")!.textContent, row.querySelector("output")!.textContent, listError.textContent];
    editor.focus(); editor.setSelectionRange(1, 1);
    editor.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "ㄱ" }));
    let blur = 0; editor.addEventListener("blur", () => blur++);
    const observer = new MutationObserver(() => {}); observer.observe(h.table.tBodies[0], { childList: true });
    const formats = h.formFormats;
    h.rows.move(2, 1); h.rows.move(1);
    const detached = observer.takeRecords().some(change => [...change.removedNodes].includes(row)); observer.disconnect();
    const after = [h.formRoot.querySelector("output")!.textContent, row.querySelector("output")!.textContent, listError.textContent];
    editor.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "ㄱ" }));
    return { messages, after, detached, blur, focus: document.activeElement === editor,
      caret: [editor.selectionStart, editor.selectionEnd], drafts: [detail.value, editor.value],
      sameSnapshot: snapshot === h.rows.get(1), stored: h.rows.get(1)!.value.profile.name,
      formats: h.formFormats - formats, order: h.rows.entries().map(row => row.id),
      invalid: [detail.getAttribute("aria-invalid"), editor.getAttribute("aria-invalid"), listError.closest("li")!.querySelector("input")!.getAttribute("aria-invalid")] };
  });
  expect(result.messages.every(Boolean)).toBe(true);
  expect(result.after).toEqual(result.messages);
  expect(result).toMatchObject({ detached: false, blur: 0, focus: true, caret: [1, 1], drafts: ["", "g"],
    sameSnapshot: true, stored: "Ada", formats: 0, order: [2, 3, 4, 1], invalid: ["true", "true", "true"] });
});

test("clean page append updates shared views without replacing Form or Grid drafts and focused nodes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowOrdering;
    h.form.bind(1); h.grid.select(1); h.grid.setSelected([1]); h.grid.setChecked([1]); h.list.select(1);
    const snapshot = h.rows.get(1);
    const detail = h.formRoot.querySelector<HTMLInputElement>("input")!;
    detail.value = "x"; detail.dispatchEvent(new Event("input", { bubbles: true }));
    const editor = h.table.querySelector<HTMLInputElement>("tbody input")!;
    editor.value = "g"; editor.dispatchEvent(new Event("input", { bubbles: true })); h.grid.validate(1); h.list.validate(2);
    const row = editor.closest("tr")!;
    const errors = [h.formRoot.querySelector("output")!, row.querySelector("output")!, h.listRoot.children[1].querySelector("output")!];
    const messages = errors.map(error => error.textContent);
    const formats = h.formFormats;
    detail.focus(); detail.setSelectionRange(1, 1);
    let blur = 0; detail.addEventListener("blur", () => blur++);
    const observer = new MutationObserver(() => {}); observer.observe(h.table.tBodies[0], { childList: true });
    const events: { event: RowsEvent; grid: string[]; list: string[] }[] = [];
    h.rows.subscribe(event => events.push({ event,
      grid: [...h.table.querySelectorAll('[data-field="key"]')].map(element => element.textContent!),
      list: [...h.listRoot.querySelectorAll('[data-field="key"]')].map(element => element.textContent!) }));
    const ids = h.rows.append(["Edith", "Frances"].map((name, index) => ({ key: index === 0 ? "E" : "F", rank: index + 5,
      profile: { name, choice: 1, options: [{ label: "One", value: 1 }] } })));
    const detached = observer.takeRecords().some(change => [...change.removedNodes].includes(row)); observer.disconnect();
    return { ids, statuses: ids.map(id => h.rows.get(id)!.status), events, sameSnapshot: h.rows.get(1) === snapshot,
      focus: document.activeElement === detail, caret: [detail.selectionStart, detail.selectionEnd], blur, detached,
      drafts: [detail.value, editor.value], messages, after: errors.map(error => error.textContent), formats: h.formFormats - formats,
      changes: h.rows.changes(), active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(), list: h.list.selected() };
  });
  expect(result.messages.every(Boolean)).toBe(true);
  expect(result.after).toEqual(result.messages);
  expect(result).toMatchObject({ ids: [5, 6], statuses: ["clean", "clean"], sameSnapshot: true, focus: true,
    caret: [1, 1], blur: 0, detached: false, drafts: ["x", "g"], formats: 0, changes: [],
    active: 1, selected: [1], checked: [1], list: 1,
    events: [{ event: { type: "append", ids: [5, 6], changed: true }, grid: ["A", "B", "C", "D", "E", "F"], list: ["A", "B", "C", "D", "E", "F"] }] });
});

test("a focused List control stays attached through moves and view sorting and recovers after filtering", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowOrdering; h.list.select(2); h.list.validate(2);
    const row = h.listRoot.children[1]; const button = row.querySelector<HTMLButtonElement>("button")!;
    const message = row.querySelector("output")!.textContent;
    button.focus(); let blur = 0; button.addEventListener("blur", () => blur++);
    const observer = new MutationObserver(() => {}); observer.observe(h.listRoot, { childList: true });
    h.rows.move(2); h.list.setSort((left, right) => right.rank - left.rank);
    const retained = { detached: observer.takeRecords().some(change => [...change.removedNodes].includes(row)),
      focus: document.activeElement === button, blur,
      message: row.querySelector("output")!.textContent, selected: h.list.selected() };
    observer.disconnect();
    h.list.setFilter(value => value.rank !== 2);
    const recovered = document.activeElement !== button && h.listRoot.contains(document.activeElement);
    return { retained, message, recovered };
  });
  expect(result.message).toBeTruthy();
  expect(result.retained).toEqual({ detached: false, focus: true, blur: 0, message: result.message, selected: 2 });
  expect(result.recovered).toBe(true);
});

test("forced order callbacks bypass vetoes and see the committed DOM while old arrays remain frozen", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowOrdering; h.grid.select(1); h.grid.setSelected([1, 3]); h.grid.setChecked([1, 3, 4]);
    const selected = h.grid.selectedIds(); const checked = h.grid.checkedIds();
    h.events.length = 0; h.beforeCalls = 0; h.veto = true;
    h.rows.move(3, 1); h.rows.move(4, 1);
    return { active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      previous: [selected, checked], frozen: Object.isFrozen(selected) && Object.isFrozen(checked),
      beforeCalls: h.beforeCalls, events: h.events };
  });
  expect(result).toEqual({ active: 1, selected: [3, 1], checked: [3, 4, 1], previous: [[1, 3], [1, 3, 4]], frozen: true, beforeCalls: 0,
    events: [
      { kind: "selected", ids: [3, 1], previous: [1, 3], dom: ["C", "A", "B", "D"] },
      { kind: "checked", ids: [3, 1, 4], previous: [1, 3, 4], dom: ["C", "A", "B", "D"] },
      { kind: "checked", ids: [3, 4, 1], previous: [3, 1, 4], dom: ["C", "D", "A", "B"] }
    ] });
});

test("row moves inside before hooks reject only the stale outer membership proposal", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowOrdering; h.grid.setSelected([1, 3]); h.events.length = 0;
    h.reenter = () => { h.reenter = undefined; h.rows.move(3, 1); };
    let code = ""; try { h.grid.setSelected([2]); } catch (cause) { code = (cause as { code: string }).code; }
    return { code, order: h.rows.entries().map(row => row.id), selected: h.grid.selectedIds(),
      events: h.events.map(event => ({ ids: event.ids, dom: event.dom })) };
  });
  expect(result).toEqual({ code: "GRID_SELECTION", order: [3, 1, 2, 4], selected: [3, 1], events: [{ ids: [3, 1], dom: ["C", "A", "B", "D"] }] });
});

test("copies publish committed nested values to every view without copying a source draft", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowOrdering; const source = h.rows.get(1)!;
    const editor = h.table.querySelector<HTMLInputElement>("tbody input")!;
    editor.value = "x"; editor.dispatchEvent(new Event("input", { bubbles: true }));
    const events: { event: RowsEvent; grid: string[]; list: string[] }[] = [];
    h.rows.subscribe(event => events.push({ event,
      grid: [...h.table.querySelectorAll<HTMLInputElement>("tbody input")].map(input => input.value),
      list: [...h.listRoot.querySelectorAll<HTMLInputElement>("input")].map(input => input.value) }));
    const id = h.rows.copy(1, 2); const copy = h.rows.get(id)!;
    const detached = copy.value.profile !== source.value.profile && copy.value.profile.options !== source.value.profile.options;
    h.rows.set(id, "profile", { ...copy.value.profile, name: "Copied", options: [{ label: "Independent", value: 1 }] });
    return { id, detached, status: copy.status, copied: copy.value.profile.name, events: events.slice(0, 1),
      source: h.rows.get(1)!.value.profile, copy: h.rows.get(id)!.value.profile, order: h.rows.entries().map(row => row.id) };
  });
  expect(result).toMatchObject({ id: 5, detached: true, status: "insert", copied: "Ada", order: [1, 5, 2, 3, 4],
    events: [{ event: { type: "add", id: 5, changed: true }, grid: ["x", "Ada", "Bo", "Grace", "Lin"], list: ["Ada", "Ada", "Bo", "Grace", "Lin"] }],
    source: { name: "Ada", options: [{ label: "One", value: 1 }, { label: "Two", value: 2 }] },
    copy: { name: "Copied", options: [{ label: "Independent", value: 1 }] } });
});

test("a Tree business-key subscriber error retains the committed copy and reaches later subscribers", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ createRows }, { bindTree }] = await Promise.all([import(modules.data), import(modules.tree)]);
    const root = document.createElement("ul"); root.setAttribute("aria-label", "Business keys");
    root.innerHTML = '<li data-row-template><span data-tree-label data-field="name"></span><ul data-tree-children></ul></li>';
    document.body.append(root);
    const rows = createRows([{ key: "business", parent: null, name: "Original" }]);
    const tree = bindTree(root, { rows, key: row => row.key, parent: row => row.parent });
    const events: RowsEvent[] = []; rows.subscribe(event => events.push(event));
    let code = ""; try { rows.copy(1); } catch (cause) { code = (cause as { code: string }).code; }
    const result = { code, ids: rows.entries().map(row => row.id), names: rows.entries().map(row => row.value.name), events,
      dom: root.querySelectorAll('[role="treeitem"]').length };
    tree.dispose(); rows.dispose(); root.remove(); return result;
  }, modules);
  expect(result).toEqual({ code: "TREE_KEY", ids: [1, 2], names: ["Original", "Original"], events: [{ type: "add", id: 2, changed: true }], dom: 1 });
});

test("viewport insertion and movement preserve the measured anchor and follow the current sorted filtered page", async ({ page }) => {
  const result = await page.evaluate(async ({ modules, rowMarkup }) => {
    const [{ createRows }, { bindGrid }] = await Promise.all([import(modules.data), import(modules.grid)]);
    const root = document.createElement("div"); root.style.cssText = "height:240px;width:650px;overflow:auto";
    const table = document.createElement("table"); table.style.cssText = "border-collapse:collapse;width:640px;font:14px/20px sans-serif";
    table.innerHTML = `<caption>Viewport order</caption><thead><tr><th>Key</th><th>Name</th><th>Choice</th></tr></thead><tbody><tr data-row-template style="height:44px">${rowMarkup}</tr></tbody>`;
    root.append(table); document.body.append(root); const original = table.outerHTML;
    const rows = createRows(Array.from({ length: 600 }, (_, index) => ({ key: `R${index + 1}`, rank: index + 1,
      profile: { name: `Employee ${index + 1}`, choice: 1, options: [{ label: "One", value: 1 }] } })));
    const grid = bindGrid(table, { rows, viewport: { root, estimate: 44, overscan: 2 } });
    const settle = () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    const mounted = () => [...table.tBodies[0].rows].filter(row => !row.hasAttribute("aria-hidden"));
    const key = (row: HTMLTableRowElement) => row.querySelector('[data-field="key"]')!.textContent;
    grid.reveal(300); await settle();
    const anchor = mounted().find(row => row.getBoundingClientRect().bottom > root.getBoundingClientRect().top + root.clientTop)!;
    const anchorId = rows.entries().find(row => row.value.key === key(anchor))!.id; const top = anchor.getBoundingClientRect().top;
    rows.add({ key: "New", rank: 601, profile: { name: "Inserted", choice: 1, options: [{ label: "One", value: 1 }] } }, anchorId);
    rows.move(600, 1); await settle();
    const preserved = anchor.isConnected && Math.abs(anchor.getBoundingClientRect().top - top) < 5;
    const bounded = mounted().length < 30;
    grid.setSort((left, right) => right.rank - left.rank); grid.setFilter(row => row.rank % 2 === 0); grid.setPage({ page: 2, size: 20 });
    const expected = [...rows.entries()].filter(row => row.value.rank % 2 === 0).sort((left, right) => right.value.rank - left.value.rank).slice(20, 40);
    grid.reveal(expected[12].id); await settle();
    const target = mounted().find(row => key(row) === expected[12].value.key)!;
    const page = { total: grid.page()!.total, rowcount: table.getAttribute("aria-rowcount"),
      target: !!target, index: target.getAttribute("aria-rowindex"), bounded: mounted().length <= 20 };
    const sorted = expected.map(row => row.id); rows.move(expected[0].id); await settle();
    const retained = mounted().every(row => expected.some(item => item.value.key === key(row)));
    grid.setSort(null); grid.setFilter(null); grid.setPage(null); grid.reveal(600); await settle();
    const moved = mounted().find(row => key(row) === "R600")!;
    const first = moved.getAttribute("aria-rowindex"); grid.dispose();
    const restored = table.outerHTML === original; rows.dispose(); root.remove();
    return { preserved, bounded, page, sorted, retained, first, restored };
  }, { modules, rowMarkup });
  expect(result).toMatchObject({ preserved: true, bounded: true, page: { total: 300, rowcount: "21", target: true, index: "14", bounded: true }, retained: true, first: "2", restored: true });
  expect(result.sorted).toHaveLength(20);
});
