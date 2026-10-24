// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { RowSnapshot, Rows, RowsEvent } from "../../src/data/index.js";
import type { GridBindResult, GridHandle, RuleContext } from "../../src/ui/index.js";
import type { bindGrid } from "../../src/ui/grid.js";

type Item = { key: number; team: string; profile: { name: string; notes: string }; active: boolean; count: number; choice: string | null };
type Options = Parameters<typeof bindGrid<Item>>[1];
type RowBinding = { row: RowSnapshot<Item>; elements: readonly HTMLTableRowElement[]; own(dispose: () => void): void };
type Bound = GridBindResult;
declare global {
  interface Window {
    gridLifecycle: {
      grid: GridHandle<Item>; rows: Rows<Item>; table: HTMLTableElement; root: HTMLElement; host: HTMLElement;
      original: string; layout: string; options: Options; events: RowsEvent[];
      hooks: { phase: string; id: number; version: number; connected: boolean; name: string }[];
      cleaned: { phase: string; id: number; version: number }[];
      binds: { total: number; filtered: number; visible: number; mounted: number; available: number; first: boolean; last: boolean; event: string | null }[];
      reset(count?: number, extra?: Partial<Options>): void;
      block(id: number): HTMLTableRowElement[];
      field<E extends HTMLElement = HTMLElement>(id: number, name: string): E;
      mounted(): number; settle(): Promise<void>;
      cleanupSecondary?: () => boolean;
    };
  }
}
const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { grid: source("../../src/ui/grid.ts"), data: source("../../src/data/index.ts"), select: source("../../src/ui/select.ts") };
const layout = `<caption>Record lifecycle</caption><thead><tr>
  <th scope="col" data-column="record">Record</th><th scope="col" data-column="team">Team</th>
  <th scope="col" data-column="name">Name and notes</th><th scope="col" data-column="extra">Settings</th>
  </tr></thead><tbody data-row-template><tr data-lifecycle-main data-row-status="authored">
    <th scope="row" data-column="record" rowspan="2"><span data-field="key"></span>
      <button type="button" data-select-row>Open record</button><label>Check record <input type="checkbox" data-check-row></label>
      <output data-status-label></output></th>
    <td data-column="team" data-merge="team" rowspan="2"><span data-field="team">Template team</span></td>
    <td data-column="name"><label>Name <input data-field="profile.name" value="Template name" required></label>
      <output data-error-for="profile.name"></output></td>
    <td data-column="extra"><label>Active <input type="checkbox" data-field="active" checked disabled></label>
      <button type="button" data-row-action="undo">Undo record</button></td></tr>
    <tr data-lifecycle-detail><td data-column="name"><label>Notes <textarea data-field="profile.notes">Template notes</textarea></label></td>
      <td data-column="extra"><label>Count <input type="number" data-field="count" value="7" readonly></label>
        <label>Choice <select data-field="choice"><option value="">Choose</option><option value="a" selected>A</option><option value="b">B</option></select></label></td></tr>
  </tbody><tbody data-empty hidden><tr><td data-columns="record team name extra" colspan="4">
    <p>No matching records</p><button type="button">Load records</button></td></tr></tbody>`;

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ modules, layout }) => {
    const [{ bindGrid }, { createRows }] = await Promise.all([import(modules.grid), import(modules.data)]);
    const host = document.createElement("main"); host.setAttribute("data-lifecycle-host", "");
    host.innerHTML = '<h1>Grid lifecycle</h1><div data-lifecycle-root role="region" aria-label="Record grid" tabindex="0" style="height:180px;width:850px;overflow:auto"><table data-lifecycle-table data-changed="authored"></table></div>';
    const style = document.createElement("style");
    style.textContent = '[data-lifecycle-table]{width:820px;table-layout:fixed;border-collapse:collapse;font:14px/20px sans-serif}[data-lifecycle-table] th,[data-lifecycle-table] td{padding:3px;vertical-align:top}[data-lifecycle-table] label{display:block}[data-lifecycle-table] input:not([type=checkbox]),[data-lifecycle-table] select,[data-lifecycle-table] textarea{max-width:160px}[data-lifecycle-table] output:empty{display:none}';
    host.append(style); document.body.append(host);
    const root = host.querySelector<HTMLElement>("[data-lifecycle-root]")!;
    const table = host.querySelector<HTMLTableElement>("table")!;
    const h: Window["gridLifecycle"] = {
      grid: null as unknown as GridHandle<Item>, rows: null as unknown as Rows<Item>, root, table, host, layout,
      original: "", options: null as unknown as Options, events: [], hooks: [], cleaned: [], binds: [],
      block(id) {
        const key = h.rows.get(id)?.value.key;
        const first = [...table.querySelectorAll<HTMLTableRowElement>("[data-lifecycle-main]")]
          .find(row => row.querySelector('[data-field="key"]')?.textContent === String(key));
        return first ? [first, first.nextElementSibling as HTMLTableRowElement] : [];
      },
      field<E extends HTMLElement = HTMLElement>(id: number, name: string): E {
        return h.block(id).flatMap(row => [...row.querySelectorAll<E>(`[data-field="${name}"]`)])[0];
      },
      mounted: () => table.querySelectorAll("[data-lifecycle-main]").length,
      settle: () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))),
      reset(count = 4, extra: Partial<Options> = {}) {
        h.grid?.dispose(); h.rows?.dispose(); root.scrollTop = 0;
        table.innerHTML = layout; table.setAttribute("data-changed", "authored"); h.original = table.outerHTML;
        h.events = []; h.hooks = []; h.cleaned = []; h.binds = [];
        h.rows = createRows(Array.from({ length: count }, (_, index) => ({ key: index + 1, team: "Shared",
          profile: { name: `Record ${index + 1}`, notes: `Notes ${index + 1}` }, active: true, count: index + 1, choice: "a" })));
        const versions = new Map<number, number>();
        h.options = { rows: h.rows, paste: true, multiple: true, parse: { count: input => Number(input) }, onRowAction() {},
          beforeRowBind(context: RowBinding) {
            const id = context.row.id, version = (versions.get(id) ?? 0) + 1; versions.set(id, version);
            const input = context.elements[0].querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
            h.hooks.push({ phase: "before", id, version, connected: context.elements.every(row => row.isConnected), name: input.value });
            context.own(() => h.cleaned.push({ phase: "before", id, version }));
          },
          onRowBind(context: RowBinding) {
            const id = context.row.id, version = versions.get(id)!;
            const input = context.elements[0].querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
            context.elements[0].querySelector<HTMLOutputElement>("[data-status-label]")!.textContent = context.row.status;
            h.hooks.push({ phase: "after", id, version, connected: context.elements.every(row => row.isConnected), name: input.value });
            context.own(() => h.cleaned.push({ phase: "after", id, version }));
          },
          onBind(context: Bound) { h.binds.push({ ...context, event: context.event?.type ?? null }); }, ...extra };
        h.grid = bindGrid(table, h.options); h.rows.subscribe((event: RowsEvent) => h.events.push(event));
      }
    };
    window.gridLifecycle = h; h.reset();
  }, { modules, layout });
});

test("every physical row reflects status and table dirty state without owning visual design", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle;
    const initial = h.block(1).map(row => row.dataset.rowStatus);
    const clean = h.table.dataset.changed;
    h.rows.set(1, "profile", { name: "Changed record", notes: "Notes 1" });
    const updated = h.block(1).map(row => row.dataset.rowStatus), dirty = h.table.dataset.changed;
    h.rows.revert(1);
    const reverted = h.block(1).map(row => row.dataset.rowStatus), cleanAgain = h.table.dataset.changed;
    const id = h.rows.add({ ...h.rows.get(1)!.value, key: 99 });
    const inserted = h.block(id).map(row => row.dataset.rowStatus);
    h.rows.remove(id);
    const removedInsert = h.rows.get(id) === undefined && h.block(id).length === 0;
    h.rows.remove(2);
    const hiddenDelete = h.block(2).length === 0, deleteDirty = h.table.dataset.changed;
    h.grid.dispose();
    return { initial, clean, updated, dirty, reverted, cleanAgain, inserted, removedInsert, hiddenDelete, deleteDirty,
      restored: h.table.outerHTML === h.original };
  });
  expect(result).toEqual({ initial: ["clean", "clean"], clean: "false", updated: ["update", "update"], dirty: "true",
    reverted: ["clean", "clean"], cleanAgain: "false", inserted: ["insert", "insert"], removedInsert: true,
    hiddenDelete: true, deleteDirty: "true", restored: true });
});

test("status filters are canonical detached state and invalid proposals preserve the current view", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle;
    const defaults = h.grid.statusFilter(), frozen = Object.isFrozen(defaults);
    h.grid.setStatusFilter(["delete", "update", "delete", "clean"]);
    const canonical = h.grid.statusFilter();
    const editor = h.field<HTMLInputElement>(1, "profile.name"); editor.focus(); editor.setSelectionRange(2, 2);
    const bindings = h.hooks.length, completions = h.binds.length;
    h.grid.setStatusFilter(["update", "delete", "clean", "clean"]);
    const noOp = h.grid.statusFilter() === canonical && editor === h.field(1, "profile.name") &&
      document.activeElement === editor && editor.selectionStart === 2 && h.hooks.length === bindings && h.binds.length === completions;
    const supplied: ("clean" | "delete")[] = ["clean"];
    h.grid.setStatusFilter(supplied); supplied.push("delete");
    const detached = h.grid.statusFilter();
    const before = h.table.outerHTML, previous = h.grid.statusFilter();
    const invalid = [["unknown"], null, "clean", ["clean", 1]];
    const codes = invalid.map(value => { try { h.grid.setStatusFilter(value as never); return "none"; } catch (cause) { return (cause as { code: string }).code; } });
    const unchanged = before === h.table.outerHTML && h.grid.statusFilter() === previous;
    h.grid.setStatusFilter([]);
    return { defaults, frozen, canonical, noOp, detached, codes, unchanged, empty: h.mounted() === 0,
      emptyShown: !h.table.querySelector<HTMLElement>("[data-empty]")!.hidden };
  });
  expect(result).toEqual({ defaults: ["clean", "insert", "update"], frozen: true, canonical: ["clean", "update", "delete"], noOp: true,
    detached: ["clean"], codes: ["GRID_STATUS", "GRID_STATUS", "GRID_STATUS", "GRID_STATUS"], unchanged: true, empty: true, emptyShown: true });
});

test("retained deleted rows stay noneditable and ineligible while authored Undo actions retain identity", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; const actions: { id: number; status: string }[] = [];
    h.reset(4, { statusFilter: ["clean", "insert", "update", "delete"],
      onRowAction: ({ id, row }) => actions.push({ id, status: row.status }) });
    h.grid.select(2); h.grid.setSelected([1, 2]); h.grid.setChecked([2]);
    h.rows.set(2, "profile", { name: "Edited before delete", notes: "Changed" });
    h.rows.remove(2);
    const input = h.field<HTMLInputElement>(2, "profile.name"), count = h.field<HTMLInputElement>(2, "count");
    const readonly = input.disabled && count.disabled && count.readOnly;
    const displayedValue = input.value;
    const original = h.rows.original(2)!.profile.name;
    const deletionPayload = h.rows.changes().find(row => row.id === 2)!.value.profile.name;
    input.value = "Unwanted write"; input.dispatchEvent(new Event("change", { bubbles: true }));
    const stored = h.rows.get(2)!.value.profile.name;
    const codes = [() => h.grid.select(2), () => h.grid.setChecked([2]), () => h.grid.validate(2),
      () => h.grid.paste("Unwanted paste", { id: 2, field: "profile.name" })]
      .map(run => { try { run(); return "none"; } catch (cause) { return (cause as { code: string }).code; } });
    const buttons = h.block(2)[0];
    const disabled = buttons.querySelector<HTMLButtonElement>("[data-select-row]")!.disabled && buttons.querySelector<HTMLInputElement>("[data-check-row]")!.disabled;
    buttons.querySelector<HTMLButtonElement>("[data-row-action=undo]")!.click();
    const pruned = { active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds() };
    h.rows.revert(2);
    return { readonly, displayedValue, original, deletionPayload, stored, codes, disabled, actions, pruned,
      restored: !h.field<HTMLInputElement>(2, "profile.name").disabled && !h.field<HTMLInputElement>(2, "count").disabled && h.field<HTMLInputElement>(2, "count").readOnly,
      authoredDisabled: h.field<HTMLInputElement>(2, "active").disabled, status: h.block(2).map(row => row.dataset.rowStatus) };
  });
  expect(result).toEqual({ readonly: true, displayedValue: "Edited before delete", original: "Record 2", deletionPayload: "Record 2", stored: "Edited before delete", codes: ["GRID_ROW", "GRID_ROW", "GRID_ROW", "GRID_PASTE_TARGET"],
    disabled: true, actions: [{ id: 2, status: "delete" }], pruned: { active: null, selected: [1], checked: [] },
    restored: true, authoredDisabled: true, status: ["clean", "clean"] });
});

test("deleted rows consume protected paste lines in mounted and offscreen records", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridLifecycle, outcomes = [];
    for (const viewport of [false, true]) {
      h.reset(100, { statusFilter: ["clean", "insert", "update", "delete"], ...(viewport ? { viewport: { root: h.root, estimate: 90, overscan: 1 } } : {}) });
      const first = viewport ? 70 : 1, deleted = first + 1, last = first + 2;
      h.rows.remove(deleted); h.events.length = 0;
      const result = h.grid.paste("First edited\nProtected delete\nLast edited", { id: first, field: "profile.name" });
      await h.settle();
      outcomes.push({ valid: result.valid, first: h.rows.get(first)!.value.profile.name, deleted: h.rows.get(deleted)!.value.profile.name,
        last: h.rows.get(last)!.value.profile.name, status: h.rows.get(deleted)!.status,
        event: h.events, bounded: !viewport || h.mounted() < 40 });
    }
    return outcomes;
  });
  for (const [index, row] of result.entries()) {
    const first = index ? 70 : 1;
    expect(row).toEqual({ valid: true, first: "First edited", deleted: `Record ${first + 1}`, last: "Last edited", status: "delete",
      event: [{ type: "setMany", ids: [first, first + 2], changed: true }], bounded: true });
  }
});

test("native merge runs split at status boundaries and recompute after revert", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; h.grid.setStatusFilter(["clean", "insert", "update", "delete"]);
    const editor = h.field(1, "profile.name");
    h.rows.set(3, "profile", { name: "Updated third", notes: "Notes 3" }); h.rows.remove(4);
    const cells = [1, 2, 3, 4].map(id => h.block(id)[0].querySelector<HTMLTableCellElement>("[data-merge]")!);
    const split = cells.map(cell => ({ span: cell.rowSpan, hidden: cell.style.display === "none" }));
    h.rows.revert(3);
    return { split, reverted: [cells[0].rowSpan, cells[2].style.display === "none", cells[3].rowSpan], sameEditor: editor === h.field(1, "profile.name") };
  });
  expect(result).toEqual({ split: [{ span: 4, hidden: false }, { span: 2, hidden: true }, { span: 2, hidden: false }, { span: 2, hidden: false }],
    reverted: [6, true, 2], sameEditor: true });
});

test("committed pruning still notifies once when a deleted-row hook fails", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; let fail = false;
    const notices: { kind: string; value: number | null | readonly number[] }[] = [];
    h.reset(4, { statusFilter: ["clean", "insert", "update", "delete"],
      beforeRowBind(context: RowBinding) { if (fail && context.row.status === "delete") throw new Error("Deleted hook failed"); }, onRowBind() {},
      onSelect: change => notices.push({ kind: "active", value: change.id }),
      onSelectionChange: change => notices.push({ kind: "selected", value: change.ids }),
      onCheckChange: change => notices.push({ kind: "checked", value: change.ids }) });
    h.grid.select(1); h.grid.setSelected([1]); h.grid.setChecked([1]); notices.length = 0;
    fail = true; let code = "none";
    try { h.rows.remove(1); } catch (cause) { code = (cause as { code: string }).code; }
    const during = notices.slice();
    const state = { active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(), status: h.rows.get(1)!.status };
    fail = false; h.grid.refresh();
    return { code, during, state, after: notices, recovered: h.block(1).every(row => row.dataset.rowStatus === "delete") && h.field<HTMLInputElement>(1, "profile.name").disabled };
  });
  const notices = [{ kind: "active", value: null }, { kind: "selected", value: [] }, { kind: "checked", value: [] }];
  expect(result).toEqual({ code: "GRID_BIND", during: notices, state: { active: null, selected: [], checked: [], status: "delete" },
    after: notices, recovered: true });
});

test("failed page binding finishes rollback before prune callbacks append new clean rows", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; let eligible = true, fail = false, appends = 0;
    const failure = new Error("Page binding failed");
    const notices: { kind: string; value: number | null | readonly number[] }[] = [];
    h.reset(2, { initialPage: { page: 1, size: 1 }, canSelect: row => row.id !== 1 || eligible,
      beforeRowBind(context: RowBinding) { if (fail && context.row.id === 2) { fail = false; throw failure; } }, onRowBind() {},
      onSelect(change) {
        notices.push({ kind: "active", value: change.id });
        if (change.id === null) {
          appends++; h.rows.append([{ ...h.rows.get(1)!.value, key: 3, profile: { name: "Third", notes: "Third notes" } }]);
        }
      }, onSelectionChange: change => notices.push({ kind: "selected", value: change.ids }),
      onCheckChange: change => notices.push({ kind: "checked", value: change.ids }) });
    h.grid.select(1); h.grid.setSelected([1]); h.grid.setChecked([1]); notices.length = 0;
    eligible = false; fail = true; let code = "none", sameCause = false;
    try { h.grid.setPage({ page: 2, size: 1 }); } catch (cause) { code = (cause as { code: string }).code; sameCause = (cause as Error).cause === failure; }
    const during = { notices: notices.slice(), page: h.grid.page(), count: h.rows.entries().length,
      mounted: h.mounted(), key: h.table.querySelector('[data-lifecycle-main] [data-field="key"]')?.textContent };
    h.grid.refresh();
    return { code, sameCause, during, notices, appends, page: h.grid.page(), active: h.grid.selected(), selected: h.grid.selectedIds(), checked: h.grid.checkedIds(),
      appendedClean: h.rows.get(3)!.status, changes: h.rows.changes() };
  });
  const notices = [{ kind: "active", value: null }, { kind: "selected", value: [] }];
  expect(result).toEqual({ code: "GRID_BIND", sameCause: true,
    during: { notices, page: { page: 1, size: 1, total: 3, pages: 3 }, count: 3, mounted: 1, key: "1" },
    notices, appends: 1, page: { page: 1, size: 1, total: 3, pages: 3 }, active: null, selected: [], checked: [1], appendedClean: "clean", changes: [] });
});

test("failed refresh cannot merge clean and deleted rows after binding caches are reset", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; let fail = false;
    h.reset(2, { statusFilter: ["clean", "insert", "update", "delete"],
      beforeRowBind(context: RowBinding) { if (fail && context.row.id === 1) throw new Error("Refresh hook failed"); }, onRowBind() {} });
    h.rows.remove(2);
    const cells = [1, 2].map(id => h.block(id)[0].querySelector<HTMLTableCellElement>("[data-merge]")!);
    const before = cells.map(cell => ({ span: cell.rowSpan, hidden: cell.style.display === "none" }));
    fail = true; let code = "none";
    try { h.grid.refresh(); } catch (cause) { code = (cause as { code: string }).code; }
    const after = cells.map(cell => ({ span: cell.rowSpan, hidden: cell.style.display === "none", connected: cell.isConnected }));
    fail = false; h.grid.refresh();
    return { code, before, after, statuses: [1, 2].map(id => h.block(id).map(row => row.dataset.rowStatus)) };
  });
  expect(result).toEqual({ code: "GRID_BIND", before: [{ span: 2, hidden: false }, { span: 2, hidden: false }],
    after: [{ span: 2, hidden: false, connected: true }, { span: 2, hidden: false, connected: true }],
    statuses: [["clean", "clean"], ["delete", "delete"]] });
});

test("deleting a shown row moves focused native editors and selection buttons to an enabled visible control", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridLifecycle, outcomes = [];
    for (const kind of ["input", "selection"]) {
      h.reset(1, { statusFilter: ["clean", "insert", "update", "delete"] });
      const target = kind === "input" ? h.field<HTMLInputElement>(1, "profile.name") : h.block(1)[0].querySelector<HTMLButtonElement>("[data-select-row]")!;
      target.focus(); const focusedBefore = document.activeElement === target;
      h.rows.remove(1); await h.settle();
      const active = document.activeElement as HTMLElement;
      outcomes.push({ kind, focusedBefore, disabled: target.disabled, body: active === document.body,
        visible: active.isConnected && active.getClientRects().length > 0 && !active.closest("[hidden], [inert]") && getComputedStyle(active).visibility === "visible",
        enabled: !active.matches(":disabled"), inGrid: h.table.contains(active) || active === h.root });
    }
    return outcomes;
  });
  expect(result).toEqual(["input", "selection"].map(kind => ({ kind, focusedBefore: true, disabled: true, body: false,
    visible: true, enabled: true, inGrid: true })));
});

test("a before-row hook can apply deleted-state disabling without preserving it after revert or refresh", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle, attempted: boolean[] = [];
    h.reset(1, { statusFilter: ["clean", "insert", "update", "delete"],
      beforeRowBind(context: RowBinding) {
        context.elements[0].querySelector<HTMLInputElement>('[data-field="profile.name"]')!.disabled = context.row.status === "delete";
      }, onRowBind(context: RowBinding) {
        const input = context.elements[0].querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
        input.disabled = false;
        if (context.row.status === "delete") attempted.push(!input.disabled);
      } });
    const initial = h.field<HTMLInputElement>(1, "profile.name").disabled;
    h.rows.remove(1); const deleted = h.field<HTMLInputElement>(1, "profile.name").disabled;
    h.rows.revert(1); const reverted = h.field<HTMLInputElement>(1, "profile.name").disabled;
    h.grid.refresh(); const refreshed = h.field<HTMLInputElement>(1, "profile.name").disabled;
    h.grid.dispose(); return { initial, deleted, reverted, refreshed, attempted, restored: h.table.outerHTML === h.original };
  });
  expect(result).toEqual({ initial: false, deleted: true, reverted: false, refreshed: false, attempted: [true], restored: true });
});

test("status projection precedes text filters and paging while check scopes retain live eligibility", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; h.reset(4, { filters: { team: { value: row => row.team } } }); h.grid.setStatusFilter(["clean", "update", "delete"]);
    h.rows.remove(2); h.rows.set(3, "profile", { name: "Updated third", notes: "Notes 3" });
    h.grid.setFilter(row => row.key !== 4); h.grid.setPage({ page: 1, size: 2 });
    h.grid.checkAll(true, "visible");
    const state = { page: h.grid.page(), ids: h.grid.checkedIds(), visible: h.grid.checkState("visible").total,
      filtered: h.grid.checkState("filtered").total, store: h.grid.checkState("store").total, choices: h.grid.filterChoices("team").map(choice => choice.count) };
    h.grid.setStatusFilter(["delete"]);
    return { state, deletedOnly: { page: h.grid.page(), mounted: h.mounted(), eligible: h.grid.checkState("visible").total,
      choices: h.grid.filterChoices("team").map(choice => choice.count) } };
  });
  expect(result).toEqual({ state: { page: { page: 1, size: 2, total: 3, pages: 2 }, ids: [1], visible: 1, filtered: 2, store: 3, choices: [3] },
    deletedOnly: { page: { page: 1, size: 2, total: 1, pages: 1 }, mounted: 1, eligible: 0, choices: [1] } });
});

test("defaults preserve captured native groups and own parsers without claiming business fields", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid);
    const h = window.gridLifecycle; h.reset(0); h.grid.dispose();
    const cell = h.table.querySelector('td[data-column="extra"]')!;
    cell.insertAdjacentHTML("beforeend", '<label><input type="radio" data-field="assignment.mode" value="office" checked>Office</label><label><input type="radio" data-field="assignment.mode" value="remote">Remote</label><label><input type="checkbox" data-field="assignment.tags" value="alpha" checked>Alpha</label><label><input type="checkbox" data-field="assignment.tags" value="beta">Beta</label><label>Shifts <select multiple data-field="assignment.selected"><option value="a">A</option><option value="b" selected>B</option></select></label><input type="hidden" data-field="token" value="authored"><input data-field="toString" value="own"><span data-field="summary">Display only</span><img data-field="avatar" src="/portrait.png" alt="Portrait">');
    let inherited = 0;
    const parse = Object.create(Object.defineProperty({}, "profile.name", { get() { inherited++; throw new Error("Inherited parser ran"); } }));
    const contexts: unknown[] = [];
    parse.count = (input: string, context: RuleContext) => { contexts.push([context.field, context.values.count, context.values.toString]); return Number(input); };
    parse.toString = (input: string, context: RuleContext) => { contexts.push([context.field, context.values.count, context.values.toString]); return input.toUpperCase(); };
    const name = h.table.querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
    const grid = bindGrid(h.table, { rows: h.rows, parse, onRowAction() {} });
    const before = h.rows.entries();
    const first = grid.defaults();
    (first.profile as { name: string }).name = "Mutated output";
    (first.assignment as { tags: string[] }).tags.push("Mutated output");
    name.value = "Changed source after binding";
    contexts.length = 0;
    const second = grid.defaults();
    const unchanged = h.rows.entries() === before;
    grid.dispose(); return { second, inherited, unchanged, contexts };
  }, modules);
  expect(result).toEqual({ second: { profile: { name: "Template name", notes: "Template notes" }, active: true, count: 7, choice: "a",
    assignment: { mode: "office", tags: ["alpha"], selected: ["b"] }, token: "authored", toString: "OWN" }, inherited: 0, unchanged: true,
    contexts: [["toString", "7", "own"], ["count", "7", "own"]] });
});

test("default parser failures and ambiguous native fields never write Rows or source markup", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid);
    const h = window.gridLifecycle; h.reset(0); h.grid.dispose();
    const outputs = [];
    for (const mode of ["parser", "duplicate", "parent"]) {
      h.table.innerHTML = h.layout;
      if (mode !== "parser") h.table.querySelector('td[data-column="extra"]')!.insertAdjacentHTML("beforeend", `<input data-field="${mode === "duplicate" ? "profile.name" : "profile"}" value="Conflicting default">`);
      const failure = new Error("Default parser failed");
      const grid = bindGrid(h.table, { rows: h.rows, parse: { count: mode === "parser" ? () => { throw failure; } : Number }, onRowAction() {} });
      const before = h.table.outerHTML, snapshot = h.rows.entries(); let code = "none";
      try { grid.defaults(); } catch (cause) { code = (cause as { code: string }).code; }
      outputs.push({ code, unchanged: h.rows.entries() === snapshot && h.table.outerHTML === before }); grid.dispose();
    }
    return outputs;
  }, modules);
  expect(result).toEqual(Array.from({ length: 3 }, () => ({ code: "GRID_DEFAULTS", unchanged: true })));
});

test("default parser promises are consumed and fail without changing data", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid), h = window.gridLifecycle;
    h.reset(0); h.grid.dispose(); let unhandled = 0;
    const rejected = () => { unhandled++; }; window.addEventListener("unhandledrejection", rejected);
    const grid = bindGrid(h.table, { rows: h.rows, parse: { count: () => Promise.reject(new Error("Async default")) }, onRowAction() {} });
    const before = h.rows.entries(); let code = "none";
    try { grid.defaults(); } catch (cause) { code = (cause as { code: string }).code; }
    await new Promise(resolve => setTimeout(resolve, 0)); window.removeEventListener("unhandledrejection", rejected);
    const unchanged = h.rows.entries() === before; grid.dispose(); return { code, unhandled, unchanged };
  }, modules);
  expect(result).toEqual({ code: "GRID_DEFAULTS", unhandled: 0, unchanged: true });
});

test("row hooks see connected blocks before and after values and clean resources in reverse order", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; h.reset(1);
    const initial = h.hooks.slice();
    h.rows.move(1); const unchangedMove = h.hooks.length === 2;
    h.rows.set(1, "profile", { name: "Changed once", notes: "Notes 1" });
    h.grid.refresh(); h.grid.dispose(); h.grid.dispose();
    return { initial, unchangedMove, cleaned: h.cleaned, phases: h.hooks.map(hook => hook.phase), restored: h.table.outerHTML === h.original };
  });
  expect(result).toEqual({ initial: [{ phase: "before", id: 1, version: 1, connected: true, name: "Template name" },
    { phase: "after", id: 1, version: 1, connected: true, name: "Record 1" }], unchangedMove: true,
    cleaned: [1, 2, 3].flatMap(version => [{ phase: "after", id: 1, version }, { phase: "before", id: 1, version }]),
    phases: ["before", "after", "before", "after", "before", "after"], restored: true });
});

test("the table is already claimed when the first application hook runs", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.gridLifecycle; let code = "none";
    h.reset(1, { beforeRowBind() {
      try { bindGrid(h.table, { rows: h.rows, parse: { count: Number }, onRowAction() {} }); }
      catch (cause) { code = (cause as { code: string }).code; }
    }, onRowBind() {} });
    return { code, rows: h.mounted(), value: h.field<HTMLInputElement>(1, "profile.name").value };
  }, modules);
  expect(result).toEqual({ code: "GRID_IN_USE", rows: 1, value: "Record 1" });
});

test("owned widget listeners do not duplicate on rebind and are removed on release and disposal", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; let clicks = 0, bindings = 0, released = 0;
    h.reset(1, { onRowBind(context: RowBinding) {
      bindings++; const button = context.elements[0].querySelector<HTMLButtonElement>("[data-row-action=undo]")!;
      const click = () => { clicks++; }; button.addEventListener("click", click);
      context.own(() => { released++; button.removeEventListener("click", click); });
    } });
    const button = () => h.block(1)[0].querySelector<HTMLButtonElement>("[data-row-action=undo]")!;
    button().click(); h.grid.refresh(); button().click();
    h.rows.set(1, "profile", { name: "Rebound", notes: "Notes 1" }); button().click();
    const old = button(); h.grid.setFilter(() => false); old.click(); h.grid.setFilter(null); button().click();
    const last = button(); h.grid.dispose(); last.click();
    return { clicks, bindings, released, restored: h.table.outerHTML === h.original };
  });
  expect(result).toEqual({ clicks: 4, bindings: 4, released: 4, restored: true });
});

test("failed initial before/after hooks restore authored nodes and release Select and table ownership", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ bindGrid }, { bindSelect }] = await Promise.all([import(modules.grid), import(modules.select)]);
    const h = window.gridLifecycle; h.grid.dispose(); const original = h.table.outerHTML;
    return ["before", "after"].map(phase => {
      const cleaned: string[] = [], failure = new Error(`Failed ${phase}`); let code = "none", sameCause = false, rowId = 0;
      try { bindGrid(h.table, { rows: h.rows, parse: { count: Number }, onRowAction() {},
        beforeRowBind(context: RowBinding) { context.own(() => cleaned.push(`before:${context.row.id}`)); if (phase === "before" && context.row.id === 2) throw failure; },
        onRowBind(context: RowBinding) { context.own(() => cleaned.push(`after:${context.row.id}`)); if (phase === "after" && context.row.id === 2) throw failure; }
      }); } catch (cause) {
        const error = cause as Error & { code: string; detail: { id?: number } }; code = error.code; sameCause = error.cause === failure; rowId = error.detail?.id ?? 0;
      }
      const unchanged = h.table.outerHTML === original;
      let released = false;
      const select = bindSelect(h.table.querySelector("select")!, { choices: [] }); select.dispose(); released = true;
      const retry = bindGrid(h.table, { rows: h.rows, parse: { count: Number }, onRowAction() {} }); retry.dispose();
      return { phase, code, sameCause, rowId, unchanged, released, cleaned: cleaned.sort(), restored: h.table.outerHTML === original };
    });
  }, modules);
  expect(result).toEqual([{ phase: "before", code: "GRID_BIND", sameCause: true, rowId: 2, unchanged: true, released: true,
    cleaned: ["before:1", "before:2"], restored: true },
  { phase: "after", code: "GRID_BIND", sameCause: true, rowId: 2, unchanged: true, released: true,
    cleaned: ["after:1", "after:2", "before:1", "before:2", "before:3", "before:4"], restored: true }]);
});

test("asynchronous row and completion callbacks reject without unhandled promises or stranded ownership", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.gridLifecycle; h.reset(1); h.grid.dispose();
    const original = h.table.outerHTML; let unhandled = 0; const rejected = () => { unhandled++; };
    window.addEventListener("unhandledrejection", rejected);
    const outcomes = ["beforeRowBind", "onRowBind", "onBind"].map(name => {
      let code = "none";
      try { bindGrid(h.table, { rows: h.rows, parse: { count: Number }, onRowAction() {}, [name]: () => Promise.reject(new Error("Async callback")) }); }
      catch (cause) { code = (cause as { code: string }).code; }
      const unchanged = h.table.outerHTML === original;
      const retry = bindGrid(h.table, { rows: h.rows, parse: { count: Number }, onRowAction() {} }); retry.dispose();
      return { code, unchanged };
    });
    await new Promise(resolve => setTimeout(resolve, 0)); window.removeEventListener("unhandledrejection", rejected);
    return { outcomes, unhandled };
  }, modules);
  expect(result).toEqual({ outcomes: Array.from({ length: 3 }, () => ({ code: "GRID_BIND", unchanged: true })), unhandled: 0 });
});

test("row-hook data mutations reject stale work while retaining the already committed inner write", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.gridLifecycle; h.reset(1); h.grid.dispose();
    const original = h.table.outerHTML; let changed = false, code = "none";
    try { bindGrid(h.table, { rows: h.rows, parse: { count: Number }, onRowAction() {}, onRowBind() {
      if (changed) return; changed = true;
      try { h.rows.set(1, "profile", { name: "Inner committed", notes: "Notes 1" }); } catch { /* The outer checkpoint must still reject stale work. */ }
    } }); } catch (cause) { code = (cause as { code: string }).code; }
    const restored = h.table.outerHTML === original, stored = h.rows.get(1)!.value.profile.name;
    const retry = bindGrid(h.table, { rows: h.rows, parse: { count: Number }, onRowAction() {} });
    const rebound = h.table.querySelector<HTMLInputElement>('[data-field="profile.name"]')!.value; retry.dispose();
    return { code, restored, stored, rebound };
  }, modules);
  expect(result).toEqual({ code: "GRID_BIND_STALE", restored: true, stored: "Inner committed", rebound: "Inner committed" });
});

test("direct recursive refresh rejects before a second binding and later refresh can recover", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; let recursive = false;
    h.reset(1, { onRowBind() { if (recursive) h.grid.refresh(); } });
    const stored = h.rows.entries(); recursive = true; let code = "none";
    try { h.grid.refresh(); } catch (cause) { code = (cause as { code: string }).code; }
    recursive = false; h.grid.refresh();
    return { code, unchanged: stored === h.rows.entries(), value: h.field<HTMLInputElement>(1, "profile.name").value,
      records: h.mounted(), issues: h.grid.validate().issues.length };
  });
  expect(result).toEqual({ code: "GRID_BIND_REENTRANT", unchanged: true, value: "Record 1", records: 1, issues: 0 });
});

test("disposal inside a viewport row hook leaves exact authored markup and no late rollback mutations", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.gridLifecycle; let dispose = false;
    h.reset(4, { viewport: { root: h.root, estimate: 90, overscan: 1 },
      beforeRowBind() { if (dispose) h.grid.dispose(); }, onRowBind() {} });
    await h.settle(); dispose = true; let code = "none";
    try { h.grid.refresh(); } catch (cause) { code = (cause as { code: string }).code; }
    const restored = h.table.outerHTML === h.original;
    const mutations: MutationRecord[] = []; const observer = new MutationObserver(records => mutations.push(...records));
    observer.observe(h.table, { childList: true, attributes: true, subtree: true }); await h.settle(); observer.disconnect();
    const retry = bindGrid(h.table, { rows: h.rows, parse: { count: Number }, onRowAction() {}, viewport: { root: h.root, estimate: 90, overscan: 1 } });
    retry.dispose();
    return { code, restored, lateMutations: mutations.length, retryRestored: h.table.outerHTML === h.original };
  }, modules);
  expect(result).toEqual({ code: "GRID_DISPOSED", restored: true, lateMutations: 0, retryRestored: true });
});

test("cleanup failures do not prevent later resources, framework disposal or correct rebinding", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.gridLifecycle;
    const cleaned: string[] = [], failure = new Error("Cleanup failed");
    h.reset(2, { onRowBind(context: RowBinding) {
      const id = context.row.id;
      context.own(() => cleaned.push(`first:${id}`));
      context.own(() => { cleaned.push(`second:${id}`); if (id === 1) throw failure; });
      context.own(() => cleaned.push(`third:${id}`));
    } });
    let code = "none", sameCause = false;
    try { h.grid.dispose(); } catch (cause) { code = (cause as { code: string }).code; sameCause = (cause as Error).cause === failure; }
    h.grid.dispose();
    let disposed = "none"; try { h.grid.refresh(); } catch (cause) { disposed = (cause as { code: string }).code; }
    const restored = h.table.outerHTML === h.original;
    const retry = bindGrid(h.table, { rows: h.rows, parse: { count: Number }, onRowAction() {} }); retry.dispose();
    return { code, sameCause, disposed, restored, cleaned: [1, 2].map(id => cleaned.filter(value => value.endsWith(`:${id}`))) };
  }, modules);
  expect(result).toEqual({ code: "GRID_BIND", sameCause: true, disposed: "GRID_DISPOSED", restored: true,
    cleaned: [["third:1", "second:1", "first:1"], ["third:2", "second:2", "first:2"]] });
});

test("own stays valid for an active binding and immediately releases resources registered after closure", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; let own: RowBinding["own"] = () => {}; let cleaned = 0;
    h.reset(1, { onRowBind(context: RowBinding) { own = context.own; } });
    const old = own; own(() => { cleaned++; }); const active = cleaned;
    h.grid.refresh(); const rebound = cleaned; let code = "none";
    try { old(() => { cleaned++; }); } catch (cause) { code = (cause as { code: string }).code; }
    return { active, rebound, code, cleaned };
  });
  expect(result).toEqual({ active: 0, rebound: 1, code: "GRID_BIND", cleaned: 2 });
});

test("onBind distinguishes whole binding from ordinary shared changes and reports retained totals", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; h.reset(4, { initialPage: { page: 1, size: 2 } });
    h.rows.set(1, "profile", { name: "Changed", notes: "Notes 1" });
    h.rows.setMany([{ id: 3, values: { profile: { name: "Third changed", notes: "Notes 3" } } }]);
    const inserted = h.rows.add({ ...h.rows.get(1)!.value, key: 99 }); h.rows.remove(inserted);
    h.rows.remove(2); h.rows.revert(1); h.rows.move(4, 1);
    const beforeAppend = h.binds.slice();
    const appended = h.rows.append([{ ...h.rows.get(1)!.value, key: 10 }, { ...h.rows.get(1)!.value, key: 11 }]);
    const afterAppend = h.binds.slice();
    h.grid.setSort((left, right) => left.key - right.key); h.grid.setFilter(null);
    h.grid.setPage({ page: 2, size: 2 }); h.grid.setStatusFilter(["clean", "update", "delete"]); h.grid.refresh();
    return { beforeAppend, afterAppend, appendClean: appended.every(id => h.rows.get(id)!.status === "clean"),
      types: h.binds.map(result => result.event), final: h.binds.at(-1) };
  });
  expect(result.beforeAppend).toEqual([{ total: 4, filtered: 4, visible: 2, mounted: 2, available: 2, first: true, last: true, event: null }]);
  expect(result.afterAppend).toEqual([{ total: 4, filtered: 4, visible: 2, mounted: 2, available: 2, first: true, last: true, event: null },
    { total: 6, filtered: 5, visible: 2, mounted: 2, available: 2, first: true, last: true, event: "append" }]);
  expect(result.appendClean).toBe(true);
  expect(result.types).toEqual([null, "append", null, null, null, null, null]);
  expect(result.final).toEqual({ total: 6, filtered: 6, visible: 2, mounted: 2, available: 2, first: true, last: true, event: null });
});

test("post-bind failures propagate after clean append without undoing data or blocking other subscribers", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.gridLifecycle; let fail = false, observed = 0;
    h.reset(1, { onBind() { if (fail) throw new Error("Post-bind failed"); } });
    h.rows.subscribe(event => { if (event.type === "append") observed++; }); fail = true;
    let code = "none";
    try { h.rows.append([{ ...h.rows.get(1)!.value, key: 2 }]); } catch (cause) { code = (cause as { code: string }).code; }
    const committed = h.rows.entries().length === 2 && h.rows.entries().every(row => row.status === "clean");
    const shown = h.mounted(); fail = false; h.grid.refresh();
    return { code, observed, committed, shown, retry: h.mounted(), changes: h.rows.changes() };
  });
  expect(result).toEqual({ code: "GRID_BIND", observed: 1, committed: true, shown: 2, retry: 2, changes: [] });
});

test("viewport release cleans row resources while clean append preserves a focused invalid draft and bounded DOM", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridLifecycle; h.reset(120, { viewport: { root: h.root, estimate: 90, overscan: 1 } }); await h.settle();
    const initialBinds = h.binds.length;
    h.grid.reveal(90); await h.settle();
    const released = h.cleaned.some(cleanup => cleanup.id === 1), scrolledBinds = h.binds.length;
    const input = h.field<HTMLInputElement>(90, "profile.name"); input.focus(); input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true })); const scroll = h.root.scrollTop;
    const old = h.rows.get(90); const appended = h.rows.append([{ ...h.rows.get(1)!.value, key: 121 }]); await h.settle();
    return { initialBinds, scrolledBinds, released, same: input === h.field(90, "profile.name"), focused: document.activeElement === input,
      draft: input.value, unchangedRow: old === h.rows.get(90), clean: h.rows.get(appended[0])!.status,
      anchored: Math.abs(h.root.scrollTop - scroll) < 2, bounded: h.mounted() < 40, final: h.binds.at(-1) };
  });
  expect(result).toMatchObject({ initialBinds: 1, scrolledBinds: 1, released: true, same: true, focused: true, draft: "", unchangedRow: true,
    clean: "clean", anchored: true, bounded: true, final: { total: 121, filtered: 121, visible: 121, event: "append" } });
  expect(result.final!.mounted).toBeLessThan(40);
});

test("authored empty markup follows the logical view, column spans, focus and exact teardown", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.gridLifecycle; h.reset(0);
    const empty = h.table.querySelector<HTMLTableSectionElement>("[data-empty]")!;
    const cell = empty.querySelector<HTMLTableCellElement>("td")!;
    const initiallyShown = !empty.hidden; empty.querySelector<HTMLButtonElement>("button")!.focus();
    h.rows.append([{ key: 1, team: "Shared", profile: { name: "Loaded", notes: "Notes" }, active: true, count: 1, choice: "a" }]);
    const hidden = empty.hidden, movedFocus = document.activeElement?.isConnected === true && !empty.contains(document.activeElement);
    h.field<HTMLInputElement>(1, "profile.name").focus(); h.grid.setFilter(() => false);
    h.grid.setColumns(h.grid.columns().map(column => ({ ...column, ...(column.key === "team" ? { hidden: true } : {}) })));
    const filtered = !empty.hidden && h.mounted() === 0, span = cell.colSpan;
    h.grid.dispose(); const restored = h.table.outerHTML === h.original;
    const mutations: MutationRecord[] = []; const observer = new MutationObserver(records => mutations.push(...records));
    observer.observe(h.table, { childList: true, attributes: true, subtree: true });
    h.rows.append([{ key: 2, team: "Shared", profile: { name: "Late", notes: "Notes" }, active: true, count: 2, choice: "a" }]);
    await h.settle(); observer.disconnect();
    return { initiallyShown, hidden, movedFocus, filtered, span, restored, lateMutations: mutations.length };
  });
  expect(result).toEqual({ initiallyShown: true, hidden: true, movedFocus: true, filtered: true, span: 3, restored: true, lateMutations: 0 });
});

test("ambiguous or invalid empty markers fail before modifying authored markup or claiming the table", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.gridLifecycle; h.grid.dispose();
    return ["repeated", "template", "cell"].map(mode => {
      h.table.innerHTML = h.layout;
      const empty = h.table.querySelector<HTMLElement>("[data-empty]")!;
      if (mode === "repeated") empty.querySelector("tr")!.setAttribute("data-empty", "");
      else {
        empty.removeAttribute("data-empty");
        h.table.querySelector(mode === "template" ? "[data-lifecycle-main]" : "tbody:last-child td")!.setAttribute("data-empty", "");
      }
      const before = h.table.outerHTML; let code = "none";
      try { bindGrid(h.table, { rows: h.rows, parse: { count: Number }, onRowAction() {} }); }
      catch (cause) { code = (cause as { code: string }).code; }
      const unchanged = h.table.outerHTML === before;
      h.table.innerHTML = h.layout;
      const retry = bindGrid(h.table, { rows: h.rows, parse: { count: Number }, onRowAction() {} }); retry.dispose();
      return { code, unchanged };
    });
  }, modules);
  expect(result).toEqual(Array.from({ length: 3 }, () => ({ code: "GRID_EMPTY", unchanged: true })));
});

test("two authored status views share Rows without sharing view state and remain accessible", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const { bindGrid } = await import(modules.grid); const h = window.gridLifecycle;
    const second = document.createElement("table"); second.innerHTML = h.layout; h.root.append(second);
    const original = second.outerHTML;
    const other = bindGrid(second, { ...h.options, statusFilter: ["delete"] });
    h.cleanupSecondary = () => { other.dispose(); const restored = second.outerHTML === original; second.remove(); return restored; };
    h.rows.remove(2);
    const primary = h.mounted(), deleted = second.querySelectorAll("[data-lifecycle-main]").length;
    const otherState = other.statusFilter(); h.grid.setStatusFilter(["update"]);
    const independent = JSON.stringify(other.statusFilter()) === JSON.stringify(otherState);
    const ids = [...h.host.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
    const unique = ids.length === new Set(ids).size;
    return { primary, deleted, independent, unique, dirty: [h.table.dataset.changed, second.dataset.changed] };
  }, modules);
  expect(result).toMatchObject({ primary: 3, deleted: 1, independent: true, unique: true, dirty: ["true", "true"] });
  const audit = await new AxeBuilder({ page }).include("[data-lifecycle-host]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(audit.violations).toEqual([]);
  expect(await page.evaluate(() => window.gridLifecycle.cleanupSecondary!())).toBe(true);
});
