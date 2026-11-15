// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Rows, RowState, RowStatus, RowsEvent } from "../../src/data/index.js";
import type { FormHandle, GridHandle, ListHandle, TreeHandle } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";
import type { createRows } from "../../src/data/index.js";
import type { createCommunicator } from "../../src/comm/index.js";
import type { bindForm } from "../../src/ui/form.js";

type Item = { employeeNo: string; parent: null; profile: { name: string; count: number } };
type GridOptions = Parameters<typeof bindGrid<Item>>[1];
type Observation = { type: string; changed: boolean; ids: readonly number[]; live: string[]; all: string[] };
declare global {
  interface Window {
    rowStates: {
      api: { createRows: typeof createRows; createCommunicator: typeof createCommunicator; bindForm: typeof bindForm };
      rows: Rows<Item>; grid: GridHandle<Item>; list: ListHandle<Item>; tree: TreeHandle;
      form: FormHandle<Item>; secondForm: FormHandle<Item>; host: HTMLElement; table: HTMLTableElement;
      listRoot: HTMLOListElement; treeRoot: HTMLUListElement; formRoot: HTMLFormElement; secondRoot: HTMLFormElement;
      scroll: HTMLElement; observations: Observation[]; originalTable: string; originalList: string; originalTree: string;
      item(key: string, name?: string): Item; state(key: string, status: RowStatus, name?: string): RowState<Item>;
      rebindGrid(extra?: Partial<GridOptions>): void; block(id: number): HTMLTableRowElement | undefined;
      field<E extends HTMLElement = HTMLInputElement>(id: number, name: string): E;
      edit(input: HTMLInputElement, value: string): void; settle(): Promise<void>; dispose(): void;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { data: source("../../src/data/index.ts"), comm: source("../../src/comm/index.ts"),
  grid: source("../../src/ui/grid.ts"), form: source("../../src/ui/form.ts"),
  list: source("../../src/ui/list.ts"), tree: source("../../src/ui/tree.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async modules => {
    const [{ createRows }, { createCommunicator }, { bindGrid }, { bindForm }, { bindList }, { bindTree }] = await Promise.all([
      import(modules.data), import(modules.comm), import(modules.grid), import(modules.form), import(modules.list), import(modules.tree)
    ]);
    const formMarkup = '<label>Employee <span data-field="employeeNo"></span></label><label>Name <input data-field="profile.name" required minlength="3"></label><output data-error-for="profile.name"></output>';
    const host = document.createElement("section");
    host.innerHTML = `<h1>Received employee state</h1><form data-first-form>${formMarkup}</form><form data-second-form>${formMarkup}</form>
      <div data-state-scroll role="region" aria-label="Received employees" tabindex="0" style="height:190px;width:760px;overflow:auto;overflow-anchor:none">
      <table><caption>Received employees</caption><thead><tr><th scope="col">Employee</th><th scope="col">Name</th><th scope="col">Count</th></tr></thead>
      <tbody><tr data-row-template><th scope="row"><button type="button" data-select-row><span data-field="employeeNo"></span></button><label>Check <input type="checkbox" data-check-row></label></th>
      <td><label>Name <input data-field="profile.name" required minlength="3"></label><output data-error-for="profile.name"></output></td>
      <td><label>Count <input data-field="profile.count" type="number"></label><button type="button" data-row-action="revert">Restore received value</button></td></tr></tbody></table></div>
      <ol data-state-list><li data-row-template><button type="button" data-select-row><span data-field="employeeNo"></span></button><span data-field="profile.name"></span></li></ol>
      <ul data-state-tree aria-label="Received employee tree"><li data-row-template><span data-tree-label data-field="profile.name"></span><ul data-tree-children></ul></li></ul>`;
    const style = document.createElement("style");
    style.textContent = '[data-state-scroll] table{width:740px;table-layout:fixed;border-collapse:collapse;font:14px/20px sans-serif}[data-state-scroll] tr{height:48px}[data-state-scroll] th,[data-state-scroll] td{padding:3px}[data-state-scroll] input:not([type=checkbox]){width:120px}[data-state-scroll] output:empty{display:none}';
    host.append(style); document.body.append(host);
    const table = host.querySelector<HTMLTableElement>("table")!, listRoot = host.querySelector<HTMLOListElement>("ol")!,
      treeRoot = host.querySelector<HTMLUListElement>("[data-state-tree]")!, formRoot = host.querySelector<HTMLFormElement>("[data-first-form]")!,
      secondRoot = host.querySelector<HTMLFormElement>("[data-second-form]")!, scroll = host.querySelector<HTMLElement>("[data-state-scroll]")!;
    let identities = new WeakMap<HTMLTableRowElement, number>();
    const rows: Rows<Item> = createRows([{ employeeNo: "A", parent: null, profile: { name: "Employee A", count: 1 } },
      { employeeNo: "B", parent: null, profile: { name: "Employee B", count: 2 } }]);
    const h: Window["rowStates"] = {
      api: { createRows, createCommunicator, bindForm }, rows, host, table, listRoot, treeRoot, formRoot, secondRoot, scroll,
      grid: null as unknown as GridHandle<Item>, list: null as unknown as ListHandle<Item>, tree: null as unknown as TreeHandle,
      form: null as unknown as FormHandle<Item>, secondForm: null as unknown as FormHandle<Item>, observations: [],
      originalTable: table.outerHTML, originalList: listRoot.outerHTML, originalTree: treeRoot.outerHTML,
      item: (key, name = `Employee ${key}`) => ({ employeeNo: key, parent: null, profile: { name, count: 1 } }),
      state: (key, status, name) => ({ value: h.item(key, name), status }),
      rebindGrid(extra = {}) {
        h.grid?.dispose(); identities = new WeakMap(); scroll.scrollTop = 0;
        h.grid = bindGrid(table, { rows, multiple: true, statusFilter: ["clean", "insert", "update", "delete"],
          parse: { "profile.count": Number }, onRowAction: ({ id }: { id: number }) => rows.revert(id), ...extra,
          onRowBind(context: { row: { id: number }; elements: readonly HTMLTableRowElement[]; own(cleanup: () => void): void }) {
            for (const element of context.elements) identities.set(element, context.row.id);
            context.own(() => { for (const element of context.elements) identities.delete(element); });
          } });
      },
      block: id => [...table.querySelectorAll<HTMLTableRowElement>("tbody tr")].find(row => identities.get(row) === id),
      field: (id, name) => h.block(id)?.querySelector(`[data-field="${name}"]`)! as never,
      edit(input, value) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); },
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
      dispose() { h.grid.dispose(); h.list.dispose(); h.tree.dispose(); h.form.dispose(); h.secondForm.dispose(); }
    };
    window.rowStates = h; h.rebindGrid(); h.list = bindList(listRoot, { rows });
    h.tree = bindTree(treeRoot, { rows, key: (row: Item) => row.employeeNo, parent: (row: Item) => row.parent });
    h.form = bindForm(formRoot, { rows }); h.secondForm = bindForm(secondRoot, { rows });
    rows.subscribe((event: RowsEvent) => h.observations.push({ type: event.type, changed: event.changed,
      ids: "ids" in event ? event.ids : "id" in event && event.id !== undefined ? [event.id] : [],
      live: rows.entries().map(row => row.value.employeeNo), all: rows.entries({ includeDeleted: true }).map(row => row.value.employeeNo) }));
  }, modules);
});

test("state replacement resets shared identities and displays received flags without business metadata", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowStates, previous = h.rows.entries();
    h.form.bind(previous[0].id); h.secondForm.bind(previous[0].id); h.grid.select(previous[0].id);
    h.grid.setChecked([previous[1].id]); h.list.select(previous[0].id); h.tree.select(previous[0].id);
    h.rows.replaceState([h.state("D", "delete"), h.state("C", "clean"), h.state("U", "update"), h.state("I", "insert")]);
    const all = h.rows.entries({ includeDeleted: true });
    return { ids: all.map(row => row.id), statuses: all.map(row => row.status), removed: previous.every(row => !h.rows.get(row.id)),
      grid: [...h.table.querySelectorAll('tbody [data-field="employeeNo"]')].map(element => element.textContent),
      list: [...h.listRoot.querySelectorAll('[data-field="employeeNo"]')].map(element => element.textContent),
      tree: [...h.treeRoot.querySelectorAll('[data-tree-label]')].map(element => element.textContent),
      formValues: [h.formRoot, h.secondRoot].map(root => root.querySelector("input")!.value),
      selected: [h.grid.selected(), h.list.selected(), h.tree.selected()], checked: h.grid.checkedIds(),
      metadata: all.every(row => Object.keys(row.value).join(",") === "employeeNo,parent,profile" && Object.isFrozen(row.value.profile)),
      events: h.observations };
  });
  expect(result).toEqual({ ids: [3, 4, 5, 6], statuses: ["delete", "clean", "update", "insert"], removed: true,
    grid: ["D", "C", "U", "I"], list: ["C", "U", "I"], tree: ["Employee C", "Employee U", "Employee I"],
    formValues: ["", ""], selected: [null, null, null], checked: [], metadata: true,
    events: [{ type: "replace", changed: true, ids: [], live: ["C", "U", "I"], all: ["D", "C", "U", "I"] }] });
});

test("state append preserves shared drafts focus snapshots membership and one frozen append event", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowStates, first = h.rows.entries()[0]; h.form.bind(first.id); h.secondForm.bind(first.id);
    h.grid.select(first.id); h.grid.setChecked([first.id]); h.list.select(first.id); h.tree.select(first.id);
    const detail = h.formRoot.querySelector("input")!, editor = h.field(first.id, "profile.name"), row = h.block(first.id);
    h.edit(detail, ""); h.edit(editor, "x"); editor.focus(); editor.setSelectionRange(1, 1);
    const messages = [h.formRoot.querySelector("output")!.textContent, row!.querySelector("output")!.textContent];
    const listNode = h.listRoot.children[0], treeNode = h.treeRoot.children[0];
    const ids = h.rows.appendState([h.state("U", "update"), h.state("I", "insert"), h.state("D", "delete")]);
    const event = h.observations.at(-1)!;
    return { ids, frozen: Object.isFrozen(ids) && Object.isFrozen(event.ids), event,
      identity: h.rows.get(first.id) === first && h.block(first.id) === row && h.listRoot.children[0] === listNode && h.treeRoot.children[0] === treeNode,
      drafts: [detail.value, editor.value], messages, after: [h.formRoot.querySelector("output")!.textContent, row!.querySelector("output")!.textContent],
      focused: document.activeElement === editor, caret: editor.selectionStart,
      selected: [h.grid.selected(), h.list.selected(), h.tree.selected()], checked: h.grid.checkedIds(),
      pending: h.rows.changes().map(change => change.status), live: h.rows.entries().length };
  });
  expect(result).toEqual({ ids: [3, 4, 5], frozen: true, event: { type: "append", changed: true, ids: [3, 4, 5],
    live: ["A", "B", "U", "I"], all: ["A", "B", "U", "I", "D"] }, identity: true,
    drafts: ["", "x"], messages: [expect.any(String), expect.any(String)], after: [expect.any(String), expect.any(String)],
    focused: true, caret: 1, selected: [1, 1, 1], checked: [1], pending: ["update", "insert", "delete"], live: 4 });
  expect(result.messages.every(Boolean)).toBe(true); expect(result.after).toEqual(result.messages);
});

test("received pending checkpoints revert values and flags while ordinary inserts remain cancellable", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowStates;
    h.rows.replaceState([h.state("U", "update"), h.state("I", "insert"), h.state("D", "delete")]);
    const [updated, inserted, deleted] = h.rows.entries({ includeDeleted: true });
    h.form.bind(updated.id); h.secondForm.bind(inserted.id);
    h.edit(h.formRoot.querySelector("input")!, "Local update"); h.edit(h.secondRoot.querySelector("input")!, "Local insert");
    h.rows.set(updated.id, "profile", updated.value.profile);
    const pendingAtBaseline = h.rows.get(updated.id)!.status === "update";
    h.rows.revert(inserted.id); h.rows.revert(deleted.id);
    const local = h.rows.add(h.item("L")); h.rows.revert(local);
    const copies = h.api.createRows<Item>(); copies.appendState([h.state("Source", "insert")]);
    const copy = copies.copy(copies.entries()[0].id); copies.revert(copy);
    const copyRemoved = copies.get(copy) === undefined; copies.dispose();
    return { pendingAtBaseline, ordinaryRemoved: h.rows.get(local) === undefined, copyRemoved,
      states: h.rows.entries({ includeDeleted: true }).map(row => [row.value.employeeNo, row.value.profile.name, row.status]),
      originalInsert: h.rows.original(inserted.id) === undefined,
      originalUpdate: h.rows.original(updated.id) === updated.value,
      formValues: [h.formRoot, h.secondRoot].map(root => root.querySelector("input")!.value),
      changes: h.rows.changes().map(change => change.status) };
  });
  expect(result).toEqual({ pendingAtBaseline: true, ordinaryRemoved: true, copyRemoved: true,
    states: [["U", "Employee U", "update"], ["I", "Employee I", "insert"], ["D", "Employee D", "delete"]],
    originalInsert: true, originalUpdate: true, formValues: ["Employee U", "Employee I"], changes: ["update", "insert", "delete"] });
});

test("received tombstones stay protected in native editors membership Forms and paste after checkpoint reversion", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowStates; h.rows.replaceState([h.state("D", "delete"), h.state("L", "clean")]);
    const deleted = h.rows.entries({ includeDeleted: true })[0], editor = h.field(deleted.id, "profile.name");
    const failures: string[] = [];
    for (const operation of [() => h.rows.set(deleted.id, "profile", { name: "Forbidden", count: 8 }),
      () => h.rows.move(deleted.id), () => h.rows.copy(deleted.id), () => h.form.bind(deleted.id),
      () => h.grid.select(deleted.id), () => h.grid.setChecked([deleted.id]),
      () => h.grid.paste("Forbidden", { id: deleted.id, field: "profile.name" })]) {
      try { operation(); } catch (cause) { failures.push((cause as { code: string }).code); }
    }
    h.edit(editor, "Synthetic edit"); h.rows.revert(deleted.id);
    const row = h.block(deleted.id)!;
    return { failures: failures.length, protected: failures.every(Boolean), snapshot: h.rows.get(deleted.id) === deleted,
      status: row.getAttribute("data-row-status"), disabled: [...row.querySelectorAll("input")].every(input => input.disabled),
      value: h.rows.get(deleted.id)!.value.profile.name, selected: h.grid.selected(), checked: h.grid.checkedIds(),
      list: h.listRoot.querySelectorAll("li").length, tree: h.treeRoot.querySelectorAll('[role="treeitem"]').length };
  });
  expect(result).toEqual({ failures: 7, protected: true, snapshot: true, status: "delete", disabled: true,
    value: "Employee D", selected: null, checked: [], list: 1, tree: 1 });
});

test("first-position add and move use retained deleted anchors and preserve their order when ordinary deletions revert", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowStates, [first, second] = h.rows.entries(); h.rows.remove(first.id); h.rows.remove(second.id);
    const head = h.rows.add(h.item("Head"), h.rows.entries({ includeDeleted: true })[0].id);
    const [pending] = h.rows.appendState([h.state("Pending", "update")]); h.rows.move(pending, first.id);
    const retained = h.rows.entries({ includeDeleted: true }).map(row => row.value.employeeNo);
    const beforeNoop = h.rows.entries({ includeDeleted: true }), events = h.observations.length;
    h.rows.move(pending, first.id); h.rows.move(head, head);
    const silent = h.rows.entries({ includeDeleted: true }) === beforeNoop && h.observations.length === events;
    h.rows.revert(first.id); h.rows.revert(second.id);
    return { retained, silent, live: h.rows.entries().map(row => row.value.employeeNo),
      statuses: h.rows.entries().map(row => row.status),
      grid: [...h.table.querySelectorAll('tbody [data-field="employeeNo"]')].map(node => node.textContent),
      list: [...h.listRoot.querySelectorAll('[data-field="employeeNo"]')].map(node => node.textContent) };
  });
  expect(result).toEqual({ retained: ["Head", "Pending", "A", "B"], silent: true, live: ["Head", "Pending", "A", "B"],
    statuses: ["insert", "update", "clean", "clean"], grid: ["Head", "Pending", "A", "B"], list: ["Head", "Pending", "A", "B"] });
});

test("invalid later state records preserve all shared DOM caches events and the next committed identity", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowStates, entries = h.rows.entries(), all = h.rows.entries({ includeDeleted: true }), changes = h.rows.changes();
    h.form.bind(entries[0].id); const editor = h.field(entries[0].id, "profile.name"); editor.focus();
    const before = [h.table.innerHTML, h.listRoot.innerHTML, h.treeRoot.innerHTML, h.formRoot.innerHTML];
    const failures: string[] = [];
    for (const operation of [
      () => h.rows.appendState([h.state("Good", "update"), { value: h.item("Bad"), status: "unknown" } as unknown as RowState<Item>]),
      () => h.rows.replaceState([h.state("Good", "insert"), { ...h.state("Bad", "clean"), id: 88 } as RowState<Item>]),
      () => h.rows.appendState([h.state("Good", "clean"), { value: { ...h.item("Bad"), profile: new Date() }, status: "clean" } as unknown as RowState<Item>])
    ]) { try { operation(); } catch (cause) { failures.push((cause as { code: string }).code); } }
    const preserved = h.rows.entries() === entries && h.rows.entries({ includeDeleted: true }) === all && h.rows.changes() === changes &&
      before.every((value, index) => value === [h.table.innerHTML, h.listRoot.innerHTML, h.treeRoot.innerHTML, h.formRoot.innerHTML][index]);
    const quiet = h.observations.length === 0, focused = document.activeElement === editor;
    const [id] = h.rows.appendState([h.state("After", "clean")]);
    return { failures: failures.length, coded: failures.every(Boolean), preserved, quiet, focused, id,
      event: h.observations.at(-1)!.type, frozen: Object.isFrozen(h.rows.get(id)!.value.profile) };
  });
  expect(result).toEqual({ failures: 3, coded: true, preserved: true, quiet: true, focused: true, id: 3, event: "append", frozen: true });
});

test("unchanged received checkpoint reversion keeps caches but clears local Form and Grid drafts", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowStates; h.rows.replaceState([h.state("U", "update")]); const row = h.rows.entries()[0];
    h.form.bind(row.id); const input = h.formRoot.querySelector("input")!, editor = h.field(row.id, "profile.name");
    h.edit(input, ""); h.edit(editor, "x");
    const entries = h.rows.entries(), all = h.rows.entries({ includeDeleted: true }), changes = h.rows.changes(); h.observations.length = 0;
    h.rows.revert(row.id);
    return { same: h.rows.get(row.id) === row && h.rows.entries() === entries && h.rows.entries({ includeDeleted: true }) === all && h.rows.changes() === changes,
      values: [input.value, editor.value], invalid: [input, editor].some(element => element.getAttribute("aria-invalid") === "true"),
      event: h.observations, status: h.rows.get(row.id)!.status };
  });
  expect(result).toEqual({ same: true, values: ["Employee U", "Employee U"], invalid: false,
    event: [{ type: "revert", changed: false, ids: [3], live: ["U"], all: ["U"] }], status: "update" });
});

test("state loading and append retain bounded viewport ownership and become quiet after all views dispose", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.rowStates; h.rebindGrid({ viewport: { root: h.scroll, estimate: 48, overscan: 2 } });
    h.rows.replaceState(Array.from({ length: 250 }, (_, index) => h.state(`E${index}`, index % 7 === 0 ? "delete" : "update")));
    const last = h.rows.entries({ includeDeleted: true }).at(-1)!; h.grid.reveal(last.id); await h.settle();
    const editor = h.field(last.id, "profile.name"); editor.focus(); h.edit(editor, "x"); editor.setSelectionRange(1, 1);
    const row = h.block(last.id), before = h.rows.get(last.id); const ids = h.rows.appendState([h.state("Added U", "update"), h.state("Added D", "delete")]);
    await h.settle();
    const bounded = h.table.querySelectorAll('tbody tr[data-row-status]').length <= 80;
    const retained = h.block(last.id) === row && h.rows.get(last.id) === before && document.activeElement === editor && editor.value === "x" && editor.selectionStart === 1;
    h.dispose(); const markup = [h.table.outerHTML, h.listRoot.outerHTML, h.treeRoot.outerHTML];
    let mutations = 0; const observer = new MutationObserver(records => mutations += records.length); observer.observe(h.host, { subtree: true, childList: true, attributes: true });
    h.rows.appendState([h.state("After disposal", "clean")]); h.scroll.dispatchEvent(new Event("scroll")); await h.settle(); observer.disconnect();
    return { bounded, retained, ids: ids.length, all: h.rows.entries({ includeDeleted: true }).length, mutations,
      restored: markup[0] === h.originalTable && markup[1] === h.originalList && markup[2] === h.originalTree };
  });
  expect(result).toEqual({ bounded: true, retained: true, ids: 2, all: 253, mutations: 0, restored: true });
});

test("independent received stores keep document-unique error IDs and unaffected native Form ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.rowStates; h.rows.replaceState([h.state("Pending", "insert")]); const id = h.rows.entries()[0].id;
    h.form.bind(id); h.secondForm.bind(id);
    const otherRows = h.api.createRows<Item>(); otherRows.appendState([h.state("Other", "update")]);
    const otherRoot = document.createElement("form"); otherRoot.innerHTML = h.formRoot.innerHTML;
    for (const element of otherRoot.querySelectorAll('[id], [aria-describedby], [aria-live]')) {
      element.removeAttribute("id"); element.removeAttribute("aria-describedby"); element.removeAttribute("aria-live");
    }
    document.body.append(otherRoot); const other = h.api.bindForm(otherRoot, { rows: otherRows }); other.bind(otherRows.entries()[0].id);
    h.edit(h.formRoot.querySelector("input")!, ""); h.edit(h.secondRoot.querySelector("input")!, "");
    const regions = [h.formRoot, h.secondRoot, otherRoot].map(root => root.querySelector("output")!);
    const unique = new Set(regions.map(region => region.id)).size === 3 && regions.every(region => document.querySelectorAll(`[id="${region.id}"]`).length === 1);
    const described = [h.formRoot, h.secondRoot, otherRoot].every((root, index) => root.querySelector("input")!.getAttribute("aria-describedby") === regions[index].id);
    h.rows.revert(id); h.form.dispose(); h.secondForm.dispose();
    const otherBefore = otherRows.get(otherRows.entries()[0].id); h.rows.appendState([h.state("Same page", "clean")]);
    const isolated = otherRows.get(otherBefore!.id) === otherBefore && otherRoot.querySelector("input")!.value === "Employee Other";
    other.dispose(); otherRows.dispose();
    return { unique, described, isolated, restored: regions.every(region => !region.hasAttribute("aria-live") && !region.hasAttribute("id")) };
  });
  expect(result).toEqual({ unique: true, described: true, isolated: true, restored: true });
});

test("application POST projections choose current or received deletion values and scalar or array bodies without RowId leakage", async ({ page }) => {
  await page.route("**/row-state-wire", async route => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ method: route.request().method(), received: route.request().postDataJSON() }) });
  });
  const result = await page.evaluate(async () => {
    const h = window.rowStates; h.rows.replaceState([h.state("A", "clean"), h.state("U", "update"), h.state("I", "insert")]);
    const id = h.rows.entries()[0].id; h.rows.set(id, "profile", { name: "Last committed edit", count: 9 }); h.rows.remove(id);
    const communicator = h.api.createCommunicator({ baseURL: new URL(location.href) });
    const project = (current: boolean) => h.rows.changes().map(change => {
      const value = current && change.status === "delete" ? h.rows.get(change.id)!.value : change.value;
      return { employeeNo: value.employeeNo, name: value.profile.name, count: value.profile.count, rowStatus: change.status };
    });
    const received = await communicator.request<{ method: string; received: ReturnType<typeof project> }>({ url: "/row-state-wire", method: "POST", json: project(false) });
    const current = await communicator.request<{ method: string; received: ReturnType<typeof project>[number] }>({ url: "/row-state-wire", method: "POST", json: project(true)[0] });
    return { received, current, keys: Object.keys(current.received), status: h.rows.get(id)!.status,
      unchanged: h.rows.changes().length === 3 && h.rows.get(id)!.value.profile.name === "Last committed edit" };
  });
  expect(result).toEqual({ received: { method: "POST", received: [
    { employeeNo: "A", name: "Employee A", count: 1, rowStatus: "delete" },
    { employeeNo: "U", name: "Employee U", count: 1, rowStatus: "update" },
    { employeeNo: "I", name: "Employee I", count: 1, rowStatus: "insert" }
  ] }, current: { method: "POST", received: { employeeNo: "A", name: "Last committed edit", count: 9, rowStatus: "delete" } },
    keys: ["employeeNo", "name", "count", "rowStatus"], status: "delete", unchanged: true });
});

test("application GET decoding explicitly maps statuses and cancellation prevents late state publication", async ({ page }) => {
  const query = { search: "A&B + # = 한글" };
  await page.route("**/row-state-receive?**", async route => {
    const url = new URL(route.request().url());
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ query: url.searchParams.get("q"), method: route.request().method(),
      rows: [{ employeeNo: "Received", name: "Received name", rowStatus: url.searchParams.has("invalid") ? "unknown" : "update" }] }) });
  });
  const result = await page.evaluate(async query => {
    const h = window.rowStates, communicator = h.api.createCommunicator();
    const url = new URL("/row-state-receive", location.href); url.searchParams.set("q", JSON.stringify(query));
    type ResponseBody = { query: string; method: string; rows: { employeeNo: string; name: string; rowStatus?: string }[] };
    const adapt = (body: ResponseBody): RowState<Item>[] => body.rows.map(({ employeeNo, name, rowStatus }) => {
      if (rowStatus !== undefined && !["clean", "insert", "update", "delete"].includes(rowStatus)) throw new Error("Unsupported application rowStatus");
      return { value: h.item(employeeNo, name), status: (rowStatus ?? "clean") as RowStatus };
    });
    const body = await communicator.request<ResponseBody>({ url, method: "GET" }); h.rows.replaceState(adapt(body));
    const received = { query: JSON.parse(body.query), method: body.method, status: h.rows.entries()[0].status, name: h.rows.entries()[0].value.profile.name };
    const before = h.rows.entries(), events = h.observations.length; const invalid = new URL(url); invalid.searchParams.set("invalid", "true");
    let rejected = false;
    try { await communicator.request({ url: invalid, method: "GET", decode: async response => adapt(await response.json()) }); }
    catch (cause) { rejected = (cause as { code: string }).code === "REQUEST_DECODE"; }
    const controller = new AbortController(); let begin!: () => void, release!: () => void;
    const decoding = new Promise<void>(resolve => begin = resolve), held = new Promise<void>(resolve => release = resolve);
    const pending = communicator.request<RowState<Item>[]>({ url, method: "GET", signal: controller.signal, decode: async response => {
      const states = adapt(await response.json()); begin(); await held; return states;
    } }).then(states => h.rows.appendState(states));
    await decoding; controller.abort(); let aborted = false;
    try { await pending; } catch (cause) { aborted = (cause as Error).name === "AbortError"; }
    release(); await Promise.resolve(); await h.settle();
    return { received, rejected, aborted, unchanged: h.rows.entries() === before && h.observations.length === events,
      keys: Object.keys(h.rows.entries()[0].value), url: url.searchParams.get("q") };
  }, query);
  expect(result).toEqual({ received: { query, method: "GET", status: "update", name: "Received name" }, rejected: true,
    aborted: true, unchanged: true, keys: ["employeeNo", "parent", "profile"], url: JSON.stringify(query) });
});

test("the Grid explorer loads and appends received states and contrasts received and current deletion payloads", async ({ page }) => {
  await page.goto("/m10/demo.html");
  await page.locator('[data-action="load-state"]').click();
  const states = page.locator('[data-grid] tbody tr[data-row-status]');
  await page.locator('[data-status-filter]').selectOption("all");
  await expect(states).toHaveCount(4);
  expect(await states.evaluateAll(rows => rows.map(row => row.getAttribute("data-row-status")))).toEqual(["delete", "clean", "update", "insert"]);
  await page.locator('[data-action="append-state"]').click();
  await expect(states).toHaveCount(6);
  expect(await states.evaluateAll(rows => rows.map(row => row.getAttribute("data-row-status")))).toEqual(["delete", "clean", "update", "insert", "update", "insert"]);
  const editable = states.nth(1), salary = editable.locator('[data-field="salary"]');
  const original = Number(await salary.inputValue());
  await salary.fill("9999"); await salary.blur();
  await editable.locator('[data-select-row]').click(); await page.locator('[data-action="remove"]').click();
  const wire = JSON.parse(await page.locator('[data-wire]').innerText()) as { receivedDeletion: { salary: number; rowStatus: string }[]; currentDeletion: { salary: number; rowStatus: string }[] };
  expect(wire.receivedDeletion.some(row => row.salary === original && row.rowStatus === "delete")).toBe(true);
  expect(wire.currentDeletion.some(row => row.salary === 9999 && row.rowStatus === "delete")).toBe(true);
  expect(wire.currentDeletion.every(row => Object.keys(row).sort().join(",") === "name,rowStatus,salary")).toBe(true);
});
