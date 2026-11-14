// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { data: source("../../src/data/index.ts"), form: source("../../src/ui/form.ts"),
  grid: source("../../src/ui/grid.ts"), list: source("../../src/ui/list.ts"), comm: source("../../src/comm/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
});

test("application normalization and explicit writes preserve rich domain ownership across shared consumers and equal-data stores", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ createRows }, { bindForm }, { bindGrid }, { bindList }] = await Promise.all([
      import(modules.data), import(modules.form), import(modules.grid), import(modules.list)
    ]);
    type Domain = { id: string; name: string; salary: number; active: boolean; note: null; tenant: string;
      updatedAt: Date | null; payroll: bigint; profile: { team: string; department?: string };
      choices: { code: number; label: string }[]; manager?: Domain; calculate(): bigint };
    const prototype = { get tenant() { return "Inherited tenant"; }, calculate(this: Domain) { return this.payroll + 1n; } };
    const make = (id: string, name: string, updatedAt: Date | null): Domain => {
      const value: Domain = Object.assign(Object.create(prototype), { id, name, salary: 0, active: false, note: null,
        updatedAt, payroll: 9007199254740993n, profile: { team: "Core" }, choices: [{ code: 0, label: "Zero" }] });
      value.manager = value; return value;
    };
    const receive = (value: Domain) => {
      if (!Number.isFinite(value.salary)) throw new Error("Salary must be finite.");
      const department = value.profile.department;
      return { id: value.id, name: value.name, salary: value.salary, active: value.active, note: value.note,
        tenant: value.tenant, updatedAt: value.updatedAt?.toISOString() ?? null, payroll: value.payroll.toString(), managerId: value.manager?.id ?? null,
        profile: { team: value.profile.team, ...(department === undefined ? {} : { department }) },
        choices: value.choices.map(({ code, label }) => ({ code, label })) };
    };
    const domain = make("server-a", "Ada", new Date("2020-01-02T03:04:05.000Z")), rows = createRows([receive(domain)]), otherRows = createRows([receive(domain)]);
    const host = document.createElement("article"); host.innerHTML = '<form data-detail><label>Name <input data-field="name" data-field-changed="authored"></label><label>Salary <input type="number" data-field="salary"></label></form>' +
      '<table data-changed="authored"><caption>Shared employees</caption><thead><tr><th scope="col">Name</th><th scope="col">Salary</th></tr></thead><tbody><tr data-row-template><td><span data-field="name"></span></td><td><span data-field="salary"></span></td></tr></tbody></table>' +
      '<ul><li data-row-template><span data-field="name"></span></li><li data-empty hidden>Empty</li></ul><form data-other><label>Independent name <input data-field="name"></label></form>';
    document.body.append(host);
    const detailRoot = host.querySelector<HTMLFormElement>("[data-detail]")!, otherRoot = host.querySelector<HTMLFormElement>("[data-other]")!,
      table = host.querySelector<HTMLTableElement>("table")!, listRoot = host.querySelector<HTMLUListElement>("ul")!,
      tableBefore = table.cloneNode(true), listBefore = listRoot.cloneNode(true);
    const detail = bindForm(detailRoot, { rows, parse: { salary: (value: string) => Number(value) } }), grid = bindGrid(table, { rows }), list = bindList(listRoot, { rows }), other = bindForm(otherRoot, { rows: otherRows });
    const id = rows.entries()[0].id; detail.bind(id); other.bind(otherRows.entries()[0].id);
    const field = detailRoot.querySelector<HTMLInputElement>('[data-field="name"]')!, independent = otherRoot.querySelector<HTMLInputElement>("input")!;
    const read = detail.read(), first = rows.get(id).value;
    const initial = { raw: first, frozen: Object.isFrozen(first.profile) && Object.isFrozen(first.choices[0]),
      missingDepartment: !Object.hasOwn(first.profile, "department"), distinct: first !== otherRows.entries()[0].value, read };
    const observed: string[] = [], stop = rows.subscribe(() => { observed.push(rows.get(id).value.name); });
    field.value = "Native edit"; field.dispatchEvent(new Event("input", { bubbles: true }));
    const shared = { raw: rows.get(id).value.name, grid: table.querySelector('[data-field="name"]')!.textContent,
      list: listRoot.querySelector('[data-field="name"]')!.textContent, other: independent.value,
      fieldChanged: field.getAttribute("data-field-changed"), gridChanged: table.getAttribute("data-changed") };
    domain.name = "External edit"; const beforeWrite = rows.get(id).value.name; rows.set(id, "name", domain.name);
    detail.dispose(); stop(); rows.set(id, "name", "After Form disposal");
    const disposed = { form: field.value, fieldChanged: field.getAttribute("data-field-changed"),
      grid: table.querySelector('[data-field="name"]')!.textContent, list: listRoot.querySelector('[data-field="name"]')!.textContent, other: independent.value, observed };
    rows.revert(id); const reverted = { raw: rows.get(id).value.name, grid: table.querySelector('[data-field="name"]')!.textContent,
      list: listRoot.querySelector('[data-field="name"]')!.textContent, gridChanged: table.getAttribute("data-changed"), form: field.value };
    grid.dispose(); list.dispose(); other.dispose();
    const restored = table.isEqualNode(tableBefore) && listRoot.isEqualNode(listBefore);
    rows.replace([receive(make("server-b", "Grace", null))]); const replaced = rows.entries()[0].id;
    const appended = rows.append([receive(make("server-c", "Lin", null))])[0];
    const loaded = rows.entries().map((row: { id: number; status: string; value: unknown }) => ({ status: row.status, value: row.value, original: rows.original(row.id) === row.value }));
    const domainIntact = { name: domain.name, method: domain.calculate().toString(), cycle: domain.manager === domain,
      date: domain.updatedAt!.toISOString(), mutable: !Object.isFrozen(domain.profile) };
    rows.dispose(); otherRows.dispose(); host.remove();
    return { initial, shared, beforeWrite, disposed, reverted, restored, loaded, freshIds: replaced > id && appended > replaced, domainIntact };
  }, modules);
  const value = (id: string, name: string, updatedAt: string | null) => ({ id, name, salary: 0, active: false, note: null,
    tenant: "Inherited tenant", updatedAt, payroll: "9007199254740993", managerId: id, profile: { team: "Core" }, choices: [{ code: 0, label: "Zero" }] });
  expect(result).toEqual({ initial: { raw: value("server-a", "Ada", "2020-01-02T03:04:05.000Z"), frozen: true, missingDepartment: true, distinct: true, read: { name: "Ada", salary: 0 } },
    shared: { raw: "Native edit", grid: "Native edit", list: "Native edit", other: "Ada", fieldChanged: "true", gridChanged: "true" },
    beforeWrite: "Native edit", disposed: { form: "External edit", fieldChanged: "authored", grid: "After Form disposal", list: "After Form disposal", other: "Ada", observed: ["Native edit", "External edit"] },
    reverted: { raw: "Ada", grid: "Ada", list: "Ada", gridChanged: "false", form: "External edit" }, restored: true,
    loaded: [value("server-b", "Grace", null), value("server-c", "Lin", null)].map(value => ({ status: "clean", value, original: true })), freshIds: true,
    domainIntact: { name: "External edit", method: "9007199254740994", cycle: true, date: "2020-01-02T03:04:05.000Z", mutable: true } });
});

test("configured application columns preserve business content and independent selection view and checkpoint wire scopes", async ({ page }) => {
  const result = await page.evaluate(async modules => {
    const [{ createRows }, { bindGrid }, { createCommunicator }] = await Promise.all([import(modules.data), import(modules.grid), import(modules.comm)]);
    const values = ["One", "Two", "Three", "Four"].map((name, index) => ({ id: "server-" + (index + 1), name, count: index + 1,
      active: false, note: null, nested: [{ zero: 0, enabled: false, empty: null }], tenant: "Tenant", status: "approved", value: { amount: 0 }, rowStatus: "domain", "literal.key": "literal", later: "Live extra" }));
    const rows = createRows(values), table = document.createElement("table"); table.innerHTML = '<caption>Projected employees</caption><thead><tr><th scope="col">Employee</th></tr></thead><tbody><tr data-row-template><td><button type="button" data-select-row><span data-field="name"></span></button><label>Check <input type="checkbox" data-check-row></label></td></tr></tbody>';
    document.body.append(table); const grid = bindGrid(table, { rows, multiple: true });
    const requested = ["id", "name", "count", "active", "note", "nested", "status", "value", "rowStatus", "literal.key", "missing"], extras = ["tenant"], columns = Object.freeze([...requested, ...extras]);
    const projectValue = (value: object, keys: readonly string[]) => Object.fromEntries(keys.flatMap(key => {
      const item: unknown = Reflect.get(value, key); return item === undefined ? [] : [[key, item]];
    }));
    const project = (ids: readonly number[], scope?: readonly number[], keys: readonly string[] = columns) => ids.flatMap(id => {
      const row = rows.get(id); return row && row.status !== "delete" && (!scope || scope.includes(id)) ? [projectValue(row.value, keys)] : [];
    });
    extras.push("later"); grid.select(3); grid.setSelected([4, 1]); grid.setChecked([2, 4]); rows.set(4, "name", "Current Four");
    grid.setFilter((row: { count: number }) => row.count <= 4); grid.setSort((a: { count: number }, b: { count: number }) => b.count - a.count); grid.setPage({ page: 1, size: 2 });
    const scopes = { active: project([grid.selected()]), batch: project(grid.selectedIds()), checked: project(grid.checkedIds()),
      visibleBatch: project(grid.selectedIds(), grid.rowIds("visible")), filteredChecks: project(grid.checkedIds(), grid.rowIds("filtered")), visible: grid.rowIds("visible") };
    const policy = { capturedHasLater: Object.hasOwn(scopes.batch[0], "later"), liveLater: project([1], undefined, [...requested, ...extras])[0].later,
      missing: Object.hasOwn(scopes.batch[0], "missing"), columnsIntact: columns.length === requested.length + 1 && Object.isFrozen(columns) };
    rows.set(1, "name", "Off-page One"); rows.remove(4);
    const payload = rows.changes().map((change: { status: string; value: object }) => ({ ...projectValue(change.value, columns), operation: change.status }));
    let wire: unknown;
    const comm = createCommunicator({ send: async (request: Request) => { wire = await request.json(); return new Response(null, { status: 204 }); } });
    await comm.request({ url: new URL("https://example.test/employees/save"), method: "POST", json: payload, decode: () => undefined });
    const currentDeleted = rows.get(4).value.name, storeChanged = rows.changes().map((change: { value: { id: string } }) => change.value.id);
    grid.dispose(); rows.dispose(); table.remove(); return { scopes, policy, wire, currentDeleted, storeChanged };
  }, modules);
  const value = (id: number, name: string) => ({ id: "server-" + id, name, count: id, active: false, note: null,
    nested: [{ zero: 0, enabled: false, empty: null }], status: "approved", value: { amount: 0 }, rowStatus: "domain", "literal.key": "literal", tenant: "Tenant" });
  expect(result).toEqual({ scopes: { active: [value(3, "Three")], batch: [value(1, "One"), value(4, "Current Four")], checked: [value(2, "Two"), value(4, "Current Four")],
    visibleBatch: [value(4, "Current Four")], filteredChecks: [value(2, "Two"), value(4, "Current Four")], visible: [4, 3] },
    policy: { capturedHasLater: false, liveLater: "Live extra", missing: false, columnsIntact: true },
    wire: [{ ...value(1, "Off-page One"), operation: "update" }, { ...value(4, "Four"), operation: "delete" }],
    currentDeleted: "Current Four", storeChanged: ["server-1", "server-4"] });
});
