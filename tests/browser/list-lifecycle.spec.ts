// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { createRows, RowId, Rows } from "../../src/data/index.js";
import type { bindChoiceGroup, bindList, bindSelect, GridBindResult, ListHandle, SelectValue } from "../../src/ui/index.js";

type Item = {
  code: string;
  profile: { name: string; score: number };
  flags: { coded: "Y" | "N"; badges: string[]; native: string };
  mode: string;
  picked: SelectValue;
  tags: string[];
};
type Options = Omit<Parameters<typeof bindList<Item>>[1], "rows">;
type Fixture = {
  root: HTMLUListElement;
  template: HTMLLIElement;
  rows: Rows<Item>;
  ids: RowId[];
  make(code: string): Item;
  bind(options?: Options): ListHandle<Item>;
  row(code: string): HTMLLIElement;
  names(): string[];
};

declare global {
  interface Window {
    listLifecycle: {
      setup(extra?: string): Fixture;
      select: typeof bindSelect;
      group: typeof bindChoiceGroup;
    };
    listActionLog: unknown[][];
    listActionControl: HTMLButtonElement;
    listActionView: ListHandle<Item>;
  }
}

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ ui, data }) => {
    const { bindList: bind, bindSelect: select, bindChoiceGroup: group }: typeof import("../../src/ui/index.js") = await import(ui);
    const { createRows: create }: { createRows: typeof createRows } = await import(data);
    window.listLifecycle = { select, group, setup(extra = "") {
      const host = document.createElement("form");
      host.dataset.listLifecycle = "";
      host.innerHTML = `<ul><li data-row-template>
        <span data-field="code">Authored display</span>
        <label>Name <input data-field="profile.name" value="Authored name"></label>
        <label>Score <input data-field="profile.score" value="07"></label>
        <button type="button" data-select-row>Activate</button>
        <label>Check row <input type="checkbox" data-check-row></label>${extra}
        </li><li data-empty hidden>No rows</li></ul>`;
      document.body.append(host);
      const root = host.querySelector("ul")!, template = root.querySelector("li")!;
      const make = (code: string): Item => ({ code, profile: { name: code, score: 2 },
        flags: { coded: "N", badges: ["b"], native: "1" }, mode: "remote", picked: "0", tags: ["chat"] });
      const rows = create([make("Ada"), make("Grace"), make("Lin")]);
      const ids = rows.entries().map(row => row.id);
      return { root, template, rows, ids, make, bind: (options = {}) => bind(root, { rows, ...options }),
        row: code => [...root.querySelectorAll<HTMLLIElement>("li")].find(row => row.querySelector('[data-field="code"]')?.textContent === code)!,
        names: () => [...root.querySelectorAll('[data-field="code"]')].map(node => node.textContent!) };
    } };
  }, modules);
});

test("List defaults capture independent authored native values without binding or writing Rows", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const s = window.listLifecycle.setup(`<label>Mode <input type="radio" name="mode" data-field="mode" value="office" checked>Office</label>
      <label><input type="radio" name="mode" data-field="mode" value="remote">Remote</label>
      <label>Choice <select data-field="picked"></select></label>
      <label>Native choice <select data-field="flags.native"><option value="0">Zero</option><option value="1">One</option></select></label>
      <label><input type="checkbox" data-field="flags.coded" value="Y" data-unchecked-value="N" checked>Coded</label>
      <label><input type="checkbox" data-field="flags.badges" value="a" checked>Badge A</label>
      <label><input type="checkbox" data-field="flags.badges" value="b">Badge B</label>
      <fieldset data-field="tags"><legend>Tags</legend><template data-choice-template><label><input type="checkbox"><span data-choice-label></span></label></template></fieldset>`);
    const name = s.template.querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
    name.value = "Live capture";
    const select = window.listLifecycle.select<SelectValue>(s.template.querySelector('select[data-field="picked"]')!, {
      choices: [{ label: "Number zero", value: 0 }, { label: "Text zero", value: "0" }], value: 0
    });
    const group = window.listLifecycle.group(s.template.querySelector("fieldset")!, {
      choices: [{ label: "Mail", value: "mail" }, { label: "Chat", value: "chat" }], value: ["mail"]
    });
    const parseCalls: unknown[][] = [];
    let rowHooks = 0, rowEvents = 0;
    const list = s.bind({ editable: true, onRowBind() { rowHooks++; }, parse: {
      "profile.score": (input, context) => {
        parseCalls.push([input, context.field, context.rowId]);
        return Number(input);
      }
    } });
    const before = s.rows.entries(), hooksBefore = rowHooks;
    s.rows.subscribe(() => { rowEvents++; });
    parseCalls.length = 0;
    const first = list.defaults();
    (first.profile as { name: string }).name = "Mutated result";
    (first.tags as string[]).push("Mutation");
    name.value = "Later author edit";
    const second = list.defaults();
    const unchanged = before === s.rows.entries() && hooksBefore === rowHooks && rowEvents === 0;
    const visibleName = s.row("Ada").querySelector<HTMLInputElement>('[data-field="profile.name"]')!.value;
    list.dispose(); group.dispose(); select.dispose();
    return { second, unchanged, parseCalls, visibleName };
  });
  expect(actual).toEqual({ second: { profile: { name: "Live capture", score: 7 }, flags: { native: "0", coded: "Y", badges: ["a"] },
    mode: "office", picked: 0, tags: ["mail"] },
    unchanged: true, parseCalls: [["07", "profile.score", null], ["07", "profile.score", null]], visibleName: "Ada" });
});

test("Empty editable List preserves native default types and skips incompatible parsers", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const s = window.listLifecycle.setup(`<label><input type="checkbox" data-field="flags.agreed" checked>Agree</label>
      <label><input type="checkbox" data-field="flags.coded" value="Y" data-unchecked-value="N">Coded</label>
      <label><input type="checkbox" data-field="flags.badges" value="0" checked>Badge zero</label>
      <label><input type="checkbox" data-field="flags.badges" value="1">Badge one</label>
      <label>Options <select multiple data-field="flags.choices"><option value="0" selected>Zero</option>
        <option value="false" selected>False</option><option value="1">One</option></select></label>`);
    s.rows.replace([]);
    let incompatible = 0, rowHooks = 0, writes = 0;
    s.rows.subscribe(() => { writes++; });
    const incompatibleParser = () => { incompatible++; throw new Error("Native checkbox and multiple Select defaults already have raw types"); };
    const list = s.bind({ editable: true, onRowBind() { rowHooks++; }, parse: { "profile.score": Number,
      "flags.agreed": incompatibleParser, "flags.coded": incompatibleParser,
      "flags.badges": incompatibleParser, "flags.choices": incompatibleParser } });
    const defaults = list.defaults();
    list.dispose();
    return { defaults, incompatible, rowHooks, writes, empty: s.rows.entries().length === 0 };
  });
  expect(actual).toEqual({ defaults: { profile: { name: "Authored name", score: 7 },
    flags: { agreed: true, coded: "N", badges: ["0"], choices: ["0", "false"] } },
  incompatible: 0, rowHooks: 0, writes: 0, empty: true });
});

test("List add uses head or explicit RowId placement and selects the inserted row after its hooks", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const s = window.listLifecycle.setup(), [ada, grace, lin] = s.ids;
    const phases: unknown[][] = [];
    const list = s.bind({ multiple: true, addSelect: true,
      onRowBind: ({ row }) => { if (row.status === "insert") phases.push(["row", row.value.code, s.names()]); },
      onSelect: ({ row, event }) => { if (row?.status === "insert") phases.push(["active", row.value.code, event]); },
      onSelectionChange: ({ ids, event }) => { if (ids.length === 1) phases.push(["membership", ids[0], event]); }
    });
    list.select(ada); list.setSelected([ada, grace]); list.setChecked([lin]);
    const head = list.add(s.make("Head"));
    const anchored = list.add(s.make("Anchored"), grace);
    const tail = list.add(s.make("Tail"), null);
    const bottom = window.listLifecycle.setup();
    const other = bottom.bind({ addTop: false });
    const appended = other.add(bottom.make("Default tail"));
    return { head, anchored, tail, lin, phases, names: s.names(), bottom: bottom.names(),
      active: list.selected(), selected: list.selectedIds(), checked: list.checkedIds(),
      inserts: s.rows.changes().map(row => row.status), noImplicitSelection: other.selected(), appended: bottom.rows.get(appended)!.status };
  });
  expect(actual.names).toEqual(["Head", "Ada", "Anchored", "Grace", "Lin", "Tail"]);
  expect(actual.bottom).toEqual(["Ada", "Grace", "Lin", "Default tail"]);
  expect([actual.active, actual.selected, actual.checked, actual.noImplicitSelection, actual.appended])
    .toEqual([actual.tail, [actual.tail], [actual.lin], null, "insert"]);
  expect(actual.inserts).toEqual(["insert", "insert", "insert"]);
  expect(actual.phases).toEqual([
    ["row", "Head", ["Head", "Ada", "Grace", "Lin"]], ["active", "Head", null], ["membership", actual.head, null],
    ["row", "Anchored", ["Head", "Ada", "Anchored", "Grace", "Lin"]], ["active", "Anchored", null], ["membership", actual.anchored, null],
    ["row", "Tail", actual.names], ["active", "Tail", null], ["membership", actual.tail, null]
  ]);
});

test("List addSelect keeps membership on veto or ineligibility and leaves filtered insertions hidden", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const s = window.listLifecycle.setup(), [ada, grace, lin] = s.ids;
    let veto = false;
    const list = s.bind({ multiple: true, addSelect: true, canSelect: row => row.value.code !== "Locked",
      beforeSelectionChange: () => !veto });
    list.select(ada); list.setSelected([ada, grace]); list.setChecked([lin]);
    veto = true;
    const denied = list.add(s.make("Denied"), null);
    veto = false;
    const locked = list.add(s.make("Locked"), null);
    const preserved = [list.selected(), list.selectedIds(), list.checkedIds()];
    list.setFilter(row => row.code !== "Hidden"); list.setPage({ page: 2, size: 1 });
    const before = [list.page(), [...list.rowIds("visible")]];
    const hidden = list.add(s.make("Hidden"));
    return { ada, grace, lin, hidden, preserved, after: [list.page(), [...list.rowIds("visible")]], before,
      selected: [list.selected(), list.selectedIds(), list.checkedIds()], status: [denied, locked, hidden].map(id => s.rows.get(id)!.status) };
  });
  expect(actual.preserved).toEqual([actual.ada, [actual.ada, actual.grace], [actual.lin]]);
  expect(actual.after).toEqual(actual.before);
  expect(actual.selected).toEqual([actual.hidden, [actual.hidden], [actual.lin]]);
  expect(actual.status).toEqual(["insert", "insert", "insert"]);
});

test("List onBind completes only full operations after final placement and keeps clean append incumbents", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const s = window.listLifecycle.setup(), events: Array<{ type: string | null; names: string[]; result: GridBindResult; frozen: boolean }> = [];
    const added: string[] = [], released: string[] = [];
    const list = s.bind({ editable: true,
      onRowBind: ({ row, own }) => { const { code } = row.value; added.push(code); own(() => { released.push(code); }); },
      onBind(result) { events.push({ type: result.event?.type ?? null, names: s.names(), result, frozen: Object.isFrozen(result) }); }
    });
    const adaNode = s.row("Ada");
    const appended = s.rows.append([s.make("New A"), s.make("New B")]);
    s.rows.append([]);
    const clean = appended.map(id => s.rows.get(id)!.status);
    const appendHooks = { added: [...added], released: [...released], sameNode: adaNode === s.row("Ada"), bothBound: events[1].names.includes("New B") };
    list.setSort((a, b) => b.code.localeCompare(a.code));
    list.setFilter(row => row.code !== "New B");
    list.setPage({ page: 1, size: 1 });
    list.reveal(s.ids[0]);
    list.update(); list.update(s.ids[0], ["profile.name"]);
    s.rows.set(s.ids[0], "profile", { name: "Updated", score: 5 });
    list.refresh();
    s.rows.replace([]);
    const emptyVisible = !s.root.querySelector<HTMLLIElement>("[data-empty]")!.hidden;
    list.dispose();
    return { clean, appendHooks, events, emptyVisible };
  });
  expect(actual.clean).toEqual(["clean", "clean"]);
  expect(actual.appendHooks).toEqual({ added: ["Ada", "Grace", "Lin", "New A", "New B"], released: [], sameNode: true, bothBound: true });
  expect(actual.events.map(event => event.type)).toEqual([null, "append", null, null, null, null, "replace"]);
  expect(actual.events.every(({ frozen, result, names }) => frozen && result.visible === names.length &&
    result.visible === result.available && result.mounted === result.visible && result.first && result.last)).toBe(true);
  expect(actual.events[1].result).toMatchObject({ total: 5, filtered: 5, visible: 5 });
  expect(actual.events[4].result).toMatchObject({ total: 5, filtered: 4, visible: 1 });
  expect(actual.events.at(-1)?.result).toMatchObject({ total: 0, filtered: 0, visible: 0 });
  expect(actual.emptyVisible).toBe(true);
});

test("List publishes only the newer bind when forced selection pruning changes the replacement view", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const s = window.listLifecycle.setup(), [ada, grace] = s.ids;
    const phases: unknown[][] = [];
    const list = s.bind({ multiple: true,
      onSelect({ id, event }) {
        if (id !== null) return;
        phases.push(["prune", event]);
        list.setFilter(row => row.code === "Shown");
      },
      onBind(result) {
        phases.push(["complete", result.event?.type ?? null, result.total, result.filtered, result.visible, s.names()]);
      }
    });
    list.select(ada); list.setSelected([ada]); list.setChecked([grace]); phases.length = 0;
    s.rows.replace([s.make("Shown"), s.make("Excluded")]);
    const state = [list.selected(), list.selectedIds(), list.checkedIds()];
    list.dispose();
    return { phases, state, stored: s.rows.entries().map(row => row.value.code) };
  });
  expect(actual).toEqual({ phases: [["prune", null], ["complete", null, 2, 1, 1, ["Shown"]]],
    state: [null, [], []], stored: ["Shown", "Excluded"] });
});

test("List before and after hooks own one binding and release it before revert or removal", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const s = window.listLifecycle.setup(), [ada] = s.ids;
    const log: unknown[][] = [];
    const list = s.bind({
      beforeRowBind({ row, elements: [element], own }) {
        if (row.id !== ada) return;
        log.push(["before", row.value.profile.name, element.parentElement === s.root,
          element.querySelector<HTMLInputElement>('[data-field="profile.name"]')!.value]);
        own(() => { log.push(["before release", row.value.profile.name, element.parentElement === s.root]); });
      },
      onRowBind({ row, elements: [element], own }) {
        if (row.id !== ada) return;
        log.push(["after", row.value.profile.name, element.parentElement === s.root,
          element.querySelector<HTMLInputElement>('[data-field="profile.name"]')!.value]);
        own(() => { log.push(["after release", row.value.profile.name, element.parentElement === s.root]); });
      }
    });
    const original = s.row("Ada");
    s.rows.move(ada);
    const moved = s.row("Ada") === original && s.names().at(-1) === "Ada";
    s.rows.set(ada, "profile", { name: "Edited", score: 4 });
    s.rows.revert(ada); s.rows.remove(ada);
    list.dispose();
    return { log, moved, removed: !original.isConnected, status: s.rows.get(ada)!.status };
  });
  expect(actual).toEqual({ moved: true, removed: true, status: "delete", log: [
    ["before", "Ada", true, "Authored name"], ["after", "Ada", true, "Ada"],
    ["after release", "Ada", true], ["before release", "Ada", true],
    ["before", "Edited", true, "Ada"], ["after", "Edited", true, "Edited"],
    ["after release", "Edited", true], ["before release", "Edited", true],
    ["before", "Ada", true, "Edited"], ["after", "Ada", true, "Ada"],
    ["after release", "Ada", true], ["before release", "Ada", true]
  ] });
});

test("List row actions use current attached identity and keep keyboard actions independent of selection", async ({ page }) => {
  const ids = await page.evaluate(() => {
    const s = window.listLifecycle.setup(`<button type="button" data-row-action="inspect"><span>Inspect</span></button>`);
    const [ada, grace] = s.ids;
    window.listActionLog = [];
    const list = s.bind({ selectOnRowClick: true, onRowAction: ({ action, id, row, element, event }) => {
      window.listActionLog.push([action, id, row.value.profile.name, element.tagName, event.type]);
    } });
    list.select(grace); list.setChecked([grace]);
    s.rows.set(ada, "profile", { name: "Fresh Ada", score: 3 });
    s.rows.move(ada);
    window.listActionControl = s.row("Ada").querySelector<HTMLButtonElement>("[data-row-action]")!;
    window.listActionControl.dataset.targetAction = "";
    window.listActionView = list;
    return { ada, grace };
  });
  const button = page.locator("[data-target-action]");
  await button.focus();
  await page.keyboard.press("Enter");
  const actual = await page.evaluate(() => {
    const list = window.listActionView, button = window.listActionControl, prior = list.selected(), checked = list.checkedIds();
    const nested = document.createElement("ul");
    nested.innerHTML = `<li><button type="button" data-row-action="inspect">Nested action</button></li>`;
    button.closest("li")!.append(nested);
    nested.querySelector("button")!.click();
    button.disabled = true; button.click(); button.disabled = false;
    list.setFilter(row => row.code !== "Ada"); button.click();
    list.dispose(); button.click();
    const authored = window.listLifecycle.setup(`<button type="button" data-row-action>Application action</button>`);
    const unowned = authored.bind({ selectOnRowClick: true });
    let applicationClicks = 0;
    const ownButton = authored.row("Ada").querySelector<HTMLButtonElement>("[data-row-action]")!;
    ownButton.addEventListener("click", () => { applicationClicks++; });
    ownButton.click();
    return { prior, checked, log: window.listActionLog, applicationClicks, applicationSelection: unowned.selected() };
  });
  expect([actual.prior, actual.checked]).toEqual([ids.grace, [ids.grace]]);
  expect(actual.log).toEqual([["inspect", ids.ada, "Fresh Ada", "BUTTON", "click"]]);
  expect([actual.applicationClicks, actual.applicationSelection]).toEqual([1, null]);
});

test("List identity keeps focus and hidden drafts across moves while copied Rows stay independent", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const s = window.listLifecycle.setup(), [ada, grace] = s.ids;
    const list = s.bind({ editable: true, multiple: true, parse: { "profile.score": text => {
      if (!/^\d+$/.test(text)) throw new Error("Enter digits");
      return Number(text);
    } } });
    list.select(ada); list.setSelected([ada]); list.setChecked([grace]);
    const node = s.row("Ada"), score = node.querySelector<HTMLInputElement>('[data-field="profile.score"]')!;
    score.focus(); score.value = "Invalid draft"; score.dispatchEvent(new Event("input", { bubbles: true }));
    s.rows.move(ada);
    const retained = s.row("Ada") === node && document.activeElement === score && score.value === "Invalid draft";
    const copy = s.rows.copy(ada, grace);
    s.rows.set(copy, "profile", { name: "Changed copy", score: 4 });
    const distinct = copy !== ada && list.value(ada).profile.name === "Ada" && list.value(copy).profile.name === "Changed copy";
    list.setFilter(row => row.code !== "Ada");
    const hidden = list.rowForm(ada) === null && !list.validate(ada).valid;
    list.setFilter(null);
    const draft = score.value;
    s.rows.remove(copy); s.rows.remove(ada); s.rows.revert(ada);
    const final = [!s.rows.get(copy), s.rows.get(ada)!.status, list.value(ada).profile.score,
      list.selected(), list.selectedIds(), list.checkedIds(), s.row("Ada") !== node];
    list.dispose();
    return { retained, distinct, hidden, draft, grace, final };
  });
  expect(actual).toEqual({ retained: true, distinct: true, hidden: true, draft: "Invalid draft", grace: actual.grace,
    final: [true, "clean", 2, null, [], [actual.grace], true] });
});

test("List binding failure preserves committed writes and leaves row cleanup retryable", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const s = window.listLifecycle.setup();
    const cleanup: string[] = [];
    let block = true, failCompletion = true;
    const list = s.bind({ addSelect: true,
      beforeRowBind({ row, own }) {
        if (row.value.code !== "Block") return;
        own(() => { cleanup.push("Block"); });
        if (block) throw new Error("Row binding blocked");
      },
      onBind(result) { if (result.event?.type === "append" && failCompletion) throw new Error("Completion failure"); }
    });
    list.select(s.ids[0]);
    const failure = (run: () => void) => { try { run(); } catch (cause) { return (cause as { code: string }).code; } };
    const rowFailure = failure(() => { list.add(s.make("Block")); });
    const afterFailure = [s.rows.entries()[0].value.code, list.selected() === s.ids[0], cleanup.length];
    block = false;
    list.refresh();
    const completeFailure = failure(() => { s.rows.append([s.make("New")]); });
    const written = [...s.names()], stored = s.rows.entries().at(-1)!.status;
    failCompletion = false;
    list.refresh(); list.dispose();
    return { rowFailure, afterFailure, completeFailure, written, stored, cleaned: cleanup.length };
  });
  expect(actual).toEqual({ rowFailure: "LIST_BIND", afterFailure: ["Block", true, 1], completeFailure: "LIST_BIND",
    written: ["Block", "Ada", "Grace", "Lin", "New"], stored: "clean", cleaned: 3 });
});
