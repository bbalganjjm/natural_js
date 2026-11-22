// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { createRows, RowId, Rows } from "../../src/data/index.js";
import type { bindForm, bindGrid, bindList, ListHandle, RuleSet, SelectValue } from "../../src/ui/index.js";

type Item = {
  code: string;
  profile: { name: string; note: string; score: number; limit: number };
  picked: SelectValue;
  tags: string[];
  mode: string;
  choices: { label: string; value: SelectValue }[];
  tagChoices: { label: string; value: string }[];
};
type Options = Omit<Parameters<typeof bindList<Item>>[1], "rows">;
declare global {
  interface Window {
    editableListFixture: {
      mount(options?: Options, extraRowHtml?: string): { host: HTMLElement; root: HTMLUListElement; rows: Rows<Item>; list: ListHandle<Item>;
        ids: RowId[]; row(code: string): HTMLLIElement; enter(element: HTMLInputElement, value: string): void };
    };
  }
}

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async ({ ui, data }) => {
    const { bindList: bind }: { bindList: typeof bindList } = await import(ui);
    const { createRows: create }: { createRows: typeof createRows } = await import(data);
    window.editableListFixture = { mount(options = { editable: true }, extraRowHtml = "") {
      const host = document.createElement("section");
      host.innerHTML = `<form aria-label="Employee list">
        <ul><li data-row-template>
          <button type="button" data-select-row><span data-field="code"></span></button>
          <label>Name <input data-field="profile.name" required></label>
          <label>Score <input data-field="profile.score" inputmode="numeric"></label>
          <output data-error-for="profile.score"></output>
          <label>Choice <select data-field="picked" data-options="choices" data-option-label="label" data-option-value="value"></select></label>
          <fieldset data-field="tags" data-options="tagChoices" data-option-label="label" data-option-value="value">
            <legend>Channels</legend><template data-choice-template><label><input type="checkbox"><span data-choice-label></span></label></template>
          </fieldset>
          <fieldset><legend>Office mode</legend>
            <label><input data-field="mode" type="radio" name="mode" value="office">Office</label>
            <label><input data-field="mode" type="radio" name="mode" value="remote">Remote</label>
          </fieldset>
          ${extraRowHtml}
        </li></ul></form>`;
      document.body.append(host);
      const root = host.querySelector("ul")!;
      if (!options.editable) root.querySelectorAll('fieldset:has(input[type="radio"])').forEach(element => element.remove());
      const rows = create<Item>(["Ada", "Grace", "Lin"].map((name, index) => ({
        code: name, profile: { name, score: index + 2, note: `note-${name}`, limit: 9 },
        picked: 0, tags: ["mail"], mode: "office",
        choices: [{ label: "Zero", value: 0 }, { label: "Text zero", value: "0" }, { label: "False", value: false }],
        tagChoices: [{ label: "Mail", value: "mail" }, { label: "Chat", value: "chat" }]
      })));
      const ids = rows.entries().map(row => row.id);
      const list = bind(root, { rows, ...options });
      return { host, root, rows, list, ids,
        row(code) { return [...root.querySelectorAll<HTMLLIElement>("li")].find(node => node.querySelector("[data-field=code]")?.textContent === code)!; },
        enter(element, value) { element.value = value; element.dispatchEvent(new Event("input", { bubbles: true })); } };
    } };
  }, modules);
});

test("List edits the projected RowId and shared Form and Grid read the same nested values", async ({ page }) => {
  const actual = await page.evaluate(async ({ ui }) => {
    const { bindForm: form, bindGrid: grid }: { bindForm: typeof bindForm; bindGrid: typeof bindGrid } = await import(ui);
    const { host, rows, list, ids: [ada, grace, lin], row, enter } = window.editableListFixture.mount({
      editable: true, parse: { "profile.score": text => Number(text) }
    });
    const details = document.createElement("section"), table = document.createElement("table");
    details.innerHTML = `<label>Detail name <input data-field="profile.name"></label>`;
    table.innerHTML = `<caption>Scores</caption><thead><tr><th scope="col">Score</th></tr></thead>
      <tbody><tr data-row-template><td data-field="profile.score"></td></tr></tbody>`;
    host.append(details, table);
    const detail = form(details, { rows }), display = grid(table, { rows });
    detail.bind(grace);
    list.setSort((a, b) => b.code.localeCompare(a.code));
    list.setFilter(item => item.code !== "Ada");
    list.setPage({ page: 2, size: 1 });
    const target = row("Grace");
    enter(target.querySelector<HTMLInputElement>('[data-field="profile.name"]')!, "Grace Hopper");
    enter(target.querySelector<HTMLInputElement>('[data-field="profile.score"]')!, "42");
    const committed = list.value(grace);
    const result = { committed: committed?.profile, frozen: Object.isFrozen(committed), detail: detail.read(),
      grid: [...table.querySelectorAll("tbody td")].map(cell => cell.textContent),
      untouched: [rows.get(ada)!.value.profile.score, rows.get(lin)!.value.profile.score],
      mountedRead: list.rowForm(grace)?.read(), unmounted: list.rowForm(ada), selected: list.selected() };
    list.dispose(); display.dispose(); detail.dispose(); rows.dispose(); host.remove();
    return result;
  }, modules);
  expect(actual).toEqual({ committed: { name: "Grace Hopper", score: 42, note: "note-Grace", limit: 9 }, frozen: true,
    detail: { profile: { name: "Grace Hopper" } }, grid: ["2", "42", "4"], untouched: [2, 4],
    mountedRead: { code: "Grace", profile: { name: "Grace Hopper", score: 42 }, picked: 0, tags: ["mail"], mode: "office" },
    unmounted: null, selected: null });
});

test("List preserves typed row Select values and generated checkbox arrays across catalog changes", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const { host, rows, list, ids: [ada, grace], row } = window.editableListFixture.mount();
    const select = row("Ada").querySelector("select")!;
    const picks: SelectValue[] = [];
    for (const index of [1, 2]) {
      select.selectedIndex = index;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      picks.push(rows.get(ada)!.value.picked);
    }
    const choose = (value: string) => row("Ada").querySelector<HTMLInputElement>(`fieldset[data-field=tags] input[value="${value}"]`)!;
    choose("chat").click(); choose("mail").click();
    const tags = rows.get(ada)!.value.tags;
    rows.set(ada, "tagChoices", [{ label: "Chat only", value: "chat" }]);
    const label = choose("chat").labels?.[0]?.textContent;
    choose("chat").click();
    const result = { picks, tags, label, empty: rows.get(ada)!.value.tags,
      unchanged: [rows.get(grace)!.value.picked, rows.get(grace)!.value.tags], valid: list.validate(ada).valid };
    list.dispose(); rows.dispose(); host.remove();
    return result;
  });
  expect(actual).toEqual({ picks: ["0", false], tags: ["chat"], label: "Chat only", empty: [], unchanged: [0, ["mail"]], valid: true });
});

test("Editable List populates an option-only Select as read-only HTML", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const { host, rows, list, ids: [ada], row } = window.editableListFixture.mount({ editable: true },
      `<select data-options="choices" data-option-label="label" data-option-value="value" aria-label="Option preview">
        <option value="">Preview</option></select>`);
    const preview = (code: string) => row(code).querySelector<HTMLSelectElement>("select:not([data-field])")!;
    const labels = (select: HTMLSelectElement) => [...select.options].map(option => option.textContent);
    const adaSelect = preview("Ada"), initial = labels(adaSelect);
    adaSelect.selectedIndex = 3;
    adaSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const unchanged = rows.changes().length === 0 && list.rowForm(ada)?.read().picked === 0;
    rows.set(ada, "choices", [{ label: "Updated zero", value: 0 }]);
    const result = { initial, unchanged, disabled: adaSelect.disabled, updated: labels(adaSelect), other: labels(preview("Grace")) };
    list.dispose(); rows.dispose(); host.remove();
    return result;
  });
  expect(actual).toEqual({ initial: ["Preview", "Zero", "Text zero", "False"], unchanged: true, disabled: true,
    updated: ["Preview", "Updated zero"], other: ["Preview", "Zero", "Text zero", "False"] });
});

test("List isolates authored radio names in one surrounding native form", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const { host, root, rows, list, ids: [ada, grace], row } = window.editableListFixture.mount();
    const radios = (code: string) => [...row(code).querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    const first = radios("Ada"), second = radios("Grace");
    first[1].click();
    const result = { distinct: first[0].name !== second[0].name && first[0].name === first[1].name,
      checked: [...first, ...second].map(input => input.checked), sameForm: first[0].form === second[0].form,
      values: [rows.get(ada)!.value.mode, rows.get(grace)!.value.mode], label: first[1].labels?.[0]?.textContent,
      noFixedIds: [...root.querySelectorAll("[id]")].length === new Set([...root.querySelectorAll("[id]")].map(node => node.id)).size };
    list.dispose();
    const restored = root.querySelector<HTMLInputElement>('input[type="radio"]')?.name;
    rows.dispose(); host.remove();
    return { ...result, restored };
  });
  expect(actual).toEqual({ distinct: true, checked: [false, true, true, false], sameForm: true,
    values: ["remote", "office"], label: "Remote", noFixedIds: true, restored: "mode" });
});

test("List validates hidden drafts without writes and reveals and focuses their invalid field", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const checkedRows: (RowId | null)[] = [];
    const { host, rows, list, ids: [ada], row, enter } = window.editableListFixture.mount({ editable: true, revealInvalid: true,
      parse: { "profile.score": text => Number(text) }, rules: { fields: { "profile.score": { validate: [["scoreLimit"]] } },
        validate: { scoreLimit: (score, _args, context) => {
          checkedRows.push(context.rowId);
          return Number(score) <= (context.values.profile as Item["profile"]).limit || "Score exceeds limit";
        } } }
    });
    const input = (code: string) => row(code).querySelector<HTMLInputElement>('[data-field="profile.score"]')!;
    list.setPage({ page: 1, size: 1 });
    enter(input("Ada"), "12");
    const draft = list.rowForm(ada)?.prepare();
    const before = rows.get(ada);
    list.setPage({ page: 2, size: 1 });
    const hidden = list.rowForm(ada);
    checkedRows.length = 0;
    const errors = list.validate().issues.map(issue => [issue.rowId, issue.field, issue.message]);
    const checks = checkedRows.filter(id => id === ada).length;
    const focus = document.activeElement === input("Ada");
    const region = row("Ada").querySelector<HTMLOutputElement>('[data-error-for="profile.score"]')!;
    const invalid = { text: region.textContent, describedBy: input("Ada").getAttribute("aria-describedby")?.split(/\s+/).includes(region.id),
      marked: input("Ada").getAttribute("aria-invalid"), live: region.getAttribute("aria-live") };
    const same = rows.get(ada) === before;
    list.setFilter(item => item.code !== "Ada");
    const excluded = { reveal: list.reveal(ada), valid: list.validate(ada).valid, stillHidden: list.rowForm(ada) === null };
    rows.set(ada, "profile", { ...rows.get(ada)!.value.profile, limit: 20 });
    const ready = rows.get(ada);
    const nonwriting = { valid: list.validate(ada).valid, snapshot: rows.get(ada) === ready, stored: rows.get(ada)!.value.profile.score };
    rows.set(ada, "profile", { ...rows.get(ada)!.value.profile, limit: 9 });
    list.setFilter(null);
    const shown = list.reveal(ada);
    enter(input("Ada"), "5");
    const prepared = list.rowForm(ada)?.prepare();
    const result = { draft: draft?.valid, prepared: [prepared?.valid, (prepared?.values?.profile as Item["profile"] | undefined)?.score], hidden, errors, checks, focus, invalid, same, excluded, nonwriting, shown,
      clean: list.validate().valid, stored: rows.get(ada)!.value.profile.score };
    list.dispose(); rows.dispose(); host.remove();
    return result;
  });
  expect(actual).toEqual({ draft: false, prepared: [true, 5], hidden: null, errors: [[1, "profile.score", "Score exceeds limit"]], checks: 1, focus: true,
    invalid: { text: "Score exceeds limit", describedBy: true, marked: "true", live: "polite" }, same: true,
    excluded: { reveal: false, valid: false, stillHidden: true }, nonwriting: { valid: true, snapshot: true, stored: 2 },
    shown: true, clean: true, stored: 5 });
});

test("Editable List adopts typed rules for every row only after a successful refresh", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const fields: NonNullable<RuleSet["fields"]> = { "profile.score": { validate: [] } };
    const { host, rows, list, ids: [ada, grace, lin], row } = window.editableListFixture.mount({ editable: true, rules: { fields,
      validate: { minimumScore: (score, [minimum]) => Number(score) >= Number(minimum) || "Score is too low" } } });
    const lateField = row("Lin").querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
    list.setPage({ page: 2, size: 1 });
    fields["profile.score"] = { validate: [["minimumScore", 5]] };
    const source = list.value(ada);
    const unseen = rows.add({ ...source, code: "New", choices: [...source.choices], tags: [...source.tags], tagChoices: [...source.tagChoices] });
    const errors = () => [ada, grace, lin, unseen].map(id => list.validate(id).issues.map(issue => [issue.field, issue.message]));
    const before = errors();
    const unmounted = [ada, lin, unseen].every(id => list.rowForm(id) === null);
    lateField.setAttribute("data-validate", "invalid row rule");
    let failure: string | undefined;
    try { list.refresh(); } catch (cause) { failure = (cause as { code?: string }).code; }
    const afterFailure = errors();
    lateField.removeAttribute("data-validate");
    list.refresh();
    const after = errors();
    const revealed = [ada, unseen].map(id => list.reveal(id) && list.rowForm(id)?.validate().valid === false);
    list.dispose(); rows.dispose(); host.remove();
    return { before, unmounted, failure, afterFailure, after, revealed };
  });
  const issue = [["profile.score", "Score is too low"]];
  expect(actual).toEqual({ before: [[], [], [], []], unmounted: true, failure: "RULE_DECLARATION", afterFailure: [[], [], [], []],
    after: [issue, issue, issue, issue], revealed: [true, true] });
});

test("List publishes edit resources after Form projection and skips callbacks for a row that leaves the view", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const seen: string[] = [], hiddenPaints: string[] = [];
    const { host, rows, list, ids: [ada], row, enter } = window.editableListFixture.mount({ editable: true,
      parse: { "profile.score": Number },
      onBindValue(value, context) {
        if (context.field === "profile.score") return `${value} points`;
      },
      onSourceBind(_value, context) {
        if (context.row.value.profile.name === "Hidden") hiddenPaints.push(context.key);
      },
      onRowBind({ row, elements }) {
        if (row.value.code === "Ada") seen.push(elements[0].querySelector<HTMLInputElement>('[data-field="profile.score"]')!.value);
      }
    });
    const original = seen.slice();
    const fields = row("Ada");
    enter(fields.querySelector<HTMLInputElement>('[data-field="profile.score"]')!, "8");
    const committed = [rows.get(ada)!.value.profile.score, seen.slice()];
    list.update(); const refreshed = seen.slice();
    list.setFilter(value => value.profile.name !== "Hidden");
    enter(fields.querySelector<HTMLInputElement>('[data-field="profile.name"]')!, "Hidden");
    const result = { original, committed, refreshed, hiddenPaints, mounted: list.rowForm(ada), name: list.value(ada).profile.name };
    list.dispose(); rows.dispose(); host.remove(); return result;
  });
  expect(actual).toEqual({ original: ["2 points"], committed: [8, ["2 points", "8 points"]],
    refreshed: ["2 points", "8 points", "8 points"], hiddenPaints: [], mounted: null, name: "Hidden" });
});

test("List reverts invalid drafts even when the committed row snapshot has not changed", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const { host, rows, list, ids: [ada, grace], row, enter } = window.editableListFixture.mount({ editable: true,
      parse: { "profile.score": text => { if (!/^\d+$/.test(text)) throw new Error("Use digits"); return Number(text); } }
    });
    const score = (code: string) => row(code).querySelector<HTMLInputElement>('[data-field="profile.score"]')!;
    enter(score("Ada"), "A"); enter(score("Grace"), "G");
    const invalid = list.validate().issues.map(issue => issue.rowId);
    rows.revert(ada);
    const visible = score("Ada").value;
    list.setPage({ page: 1, size: 1 }); rows.revert(grace); list.reveal(grace);
    const result = { invalid, visible, hidden: score("Grace").value, clean: list.validate().valid, changes: rows.changes().length };
    list.dispose(); rows.dispose(); host.remove(); return result;
  });
  expect(actual).toEqual({ invalid: [1, 2], visible: "2", hidden: "3", clean: true, changes: 0 });
});

test("A parser that pages away cannot commit an edit or finish stale preparation", async ({ page }) => {
  const actual = await page.evaluate(() => {
    let leaveRow = false;
    const { host, rows, list, ids: [ada], row, enter } = window.editableListFixture.mount({ editable: true,
      parse: { "profile.score": text => {
        if (leaveRow) { leaveRow = false; list.setPage({ page: 2, size: 1 }); }
        return Number(text);
      } } });
    list.setPage({ page: 1, size: 1 });
    const input = row("Ada").querySelector<HTMLInputElement>('[data-field="profile.score"]')!;
    const before = rows.get(ada);
    leaveRow = true;
    enter(input, "8");
    const sameAfterEdit = rows.get(ada) === before && list.rowForm(ada) === null;
    list.reveal(ada);
    const draft = input.value;
    leaveRow = true;
    let stalePreparation: string | undefined;
    try { list.rowForm(ada)?.prepare(); }
    catch (cause) { stalePreparation = (cause as { code?: string }).code; }
    const sameAfterPrepare = rows.get(ada) === before && list.rowForm(ada) === null;
    list.reveal(ada);
    enter(input, "7");
    const stored = list.value(ada).profile.score;
    list.dispose(); rows.dispose(); host.remove();
    return { sameAfterEdit, draft, stalePreparation, sameAfterPrepare, stored };
  });
  expect(actual).toEqual({ sameAfterEdit: true, draft: "8", stalePreparation: "FORM_PREPARE", sameAfterPrepare: true, stored: 7 });
});

test("List refreshes a field on demand and retires detached and removed row editors", async ({ page }) => {
  const actual = await page.evaluate(() => {
    const projections: Array<[RowId, string]> = [];
    const { host, rows, list, ids: [ada, grace], row, enter } = window.editableListFixture.mount({ editable: true,
      onBindValue(_value, { field, rowId }) { projections.push([rowId, field]); } });
    const input = row("Ada").querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
    const editor = list.rowForm(ada)!;
    projections.length = 0;
    list.update(ada, ["profile.name"]);
    const targeted = [...projections];
    list.setPage({ page: 2, size: 1 });
    enter(input, "Detached");
    const afterDetach = rows.get(ada)!.value.profile.name;
    let staleRejected = false;
    try { editor.prepare(); } catch { staleRejected = true; }
    list.reveal(ada);
    rows.remove(ada);
    enter(input, "Removed");
    const afterRemove = rows.get(ada)!.value.profile.name;
    const unmounted = list.rowForm(ada);
    const survivor = rows.get(grace)!.value.profile.name;
    list.dispose(); rows.dispose(); host.remove();
    const readonly = window.editableListFixture.mount({});
    const readonlyInput = readonly.row("Ada").querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
    readonly.enter(readonlyInput, "Read-only");
    const readonlyState = { disabled: readonlyInput.disabled, value: readonly.rows.get(readonly.ids[0])!.value.profile.name };
    readonly.list.dispose(); readonly.rows.dispose(); readonly.host.remove();
    return { targeted, afterDetach, staleRejected, afterRemove, unmounted, survivor, readonlyState };
  });
  expect(actual).toEqual({ targeted: [[1, "profile.name"]], afterDetach: "Ada", staleRejected: true,
    afterRemove: "Ada", unmounted: null, survivor: "Grace", readonlyState: { disabled: true, value: "Ada" } });
});
