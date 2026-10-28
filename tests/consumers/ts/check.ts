import { FrameworkError } from "@bbalganjjm/natural_js";
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import type { RowId, RowSnapshot, Rows, RowStatus, RowsEvent, Snapshot } from "@bbalganjjm/natural_js/data";
import { createCommunicator } from "@bbalganjjm/natural_js/comm";
import type { Communicator } from "@bbalganjjm/natural_js/comm";
import { bindForm, bindGrid, bindList, bindSelect, bindPagination, openPopup, bindTabs, bindTree, bindDatePicker, bindNotify, bindDocuments } from "@bbalganjjm/natural_js/ui";
import type { FormHandle, GridColumn, GridHandle, GridBindResult, GridIdsChange, GridRowScope, GridCheckState, GridFilterChoice, PageRequest, PageState, SelectValue, SelectChoice, PopupHandle, TabHandle, TreeHandle, DatePickerHandle, NotifyHandle, DocumentHandle, ValidationResult } from "@bbalganjjm/natural_js/ui";

interface Employee {
  name: string;
  options?: { value: string }[];
}

export const definition = {
  view: new URL("./employee.html", import.meta.url),
  controller({ input, output }) {
    return {
      init() {
        output(input.name);
      }
    };
  }
} satisfies PageDefinition<Employee, string>;

export function mountEmployees(host: HTMLElement) {
  const page = mountPage(host, definition, { name: "Kim" });
  page.onOutput(value => value.toUpperCase());
  return page;
}

export function editEmployees(): Rows<Employee> {
  const rows = createRows<Employee>([{ name: "Kim", options: [{ value: "A" }] }]);
  const id = rows.entries()[0].id;
  rows.set(id, "options", [{ value: "B" }]);
  const applied: void = rows.setMany([{ id, values: { name: "Lee", options: [{ value: "C" }] } }]);
  void applied;
  return rows;
}

export function namesOfValidRows(rows: Rows<Employee>, form: FormHandle<Employee>): string[] {
  const names: string[] = [];
  for (const row of rows.entries()) {
    const result = form.validate(row.id);
    if (!result.valid) {
      throw new FrameworkError({
        code: "INVALID_EMPLOYEE",
        api: "namesOfValidRows",
        message: "The employee form is invalid.",
        detail: { id: row.id }
      });
    }
    names.push(row.value.name);
  }
  return names;
}

export function orderEmployees(rows: Rows<Employee>, source: RowId, before?: RowId): RowId {
  const inserted: RowId = rows.add({ name: "Inserted" }, before);
  const moved: void = rows.move(source, inserted);
  const copied: RowId = rows.copy(source, before);
  void moved;
  return copied;
}

export function loadEmployees(comm: Communicator = createCommunicator({
  baseURL: new URL("https://example.test/api/"),
  prepare: request => request,
  after: response => response
})): Promise<Employee[]> {
  return comm.request<Employee[]>({ url: "employees", method: "GET" });
}

export function connectEditor(root: HTMLFormElement, table: HTMLTableElement, rows: Rows<Employee>, scrollRoot?: HTMLElement) {
  const form = bindForm(root, { rows });
  const columns: readonly GridColumn[] = [{ key: "person", width: 180 }, { key: "choice", width: 120 }];
  const columnChanges: { columns: readonly GridColumn[]; event: Event | null }[] = [];
  const selectionChanges: GridIdsChange[] = [];
  const checkChanges: GridIdsChange[] = [];
  const pastes: ValidationResult[] = [];
  const grid: GridHandle<Employee> = bindGrid(table, {
    rows, columns, initialPage: { page: 1, size: 5 }, onSelect: ({ id }) => form.bind(id),
    viewport: scrollRoot ? { root: scrollRoot, estimate: 48, overscan: 3 } : undefined,
    paste: true, onPaste: result => pastes.push(result),
    multiple: true, toggleSelection: true, selectOnRowClick: true,
    canSelect: row => row.status !== "delete",
    canCheck: row => row.status !== "delete",
    beforeSelect: ({ id, row, event }) => {
      const selected: RowId | null = id;
      const snapshot: RowSnapshot<Employee> | null = row;
      const source: Event | null = event;
      void source;
      return selected === null || snapshot !== null;
    },
    beforeSelectionChange: change => { const input: GridIdsChange = change; return input.ids.length <= rows.entries().length; },
    onSelectionChange: change => { selectionChanges.push(change); },
    beforeCheckChange: change => { const input: GridIdsChange = change; return input.ids.length <= rows.entries().length; },
    onCheckChange: change => { checkChanges.push(change); },
    sorts: { person: (a, b) => a.name.localeCompare(b.name) },
    filters: { name: { value: row => row.name, label: value => String(value ?? "") } },
    onRowAction: ({ action, id, row, element, event }) => {
      const context: [string, RowId, RowSnapshot<Employee>, HTMLButtonElement, Event] =
        [action, id, row, element, event];
      void context;
    },
    onColumnsChange: change => columnChanges.push(change)
  });
  return { form, grid, columnChanges, selectionChanges, checkChanges, pastes };
}

export function connectNativeControls(root: HTMLFormElement, table: HTMLTableElement, scrollRoot: HTMLElement) {
  const rows = createRows<{
    assignment: { mode: string | null; tags: string[]; selected: SelectValue[];
      options: { label: string; code: SelectValue }[] };
    summary: string;
  }>([{ assignment: { mode: "office", tags: ["alpha"], selected: [11],
    options: [{ label: "Eleven", code: 11 }, { label: "False", code: false }, { label: "Empty", code: null }] }, summary: "Assignment" }]);
  const form = bindForm(root, { rows, render: { summary(value, context) {
    const id: RowId | null = context.rowId;
    void id;
    return context.element!.ownerDocument.createTextNode(String(value ?? ""));
  } } });
  const grid = bindGrid(table, { rows, checkMode: "single", validateOn: "manual", revealInvalid: true,
    viewport: { root: scrollRoot, estimate: 88 }, paste: true,
    render: { summary: value => value === null ? null : String(value) } });
  const id = rows.entries()[0].id;
  const result: ValidationResult = grid.paste('remote\t"[""alpha""]"\t[11,false,null]', { id, field: "assignment.mode" });
  const checkedWrite: void = grid.setChecked([id]);
  const selected: readonly SelectValue[] = rows.get(id)!.value.assignment.selected;
  void checkedWrite;
  return { rows, form, grid, result, selected };
}

export function connectRowLifecycle(table: HTMLTableElement, rows: Rows<Employee>) {
  const first = rows.entries()[0];
  const original: Snapshot<Employee> | undefined = first && rows.original(first.id);
  void original;
  const bindings: { event: RowsEvent | null; counts: readonly number[] }[] = [];
  const grid = bindGrid(table, {
    rows, statusFilter: ["clean", "insert", "update", "delete"],
    beforeRowBind(context) {
      const row: RowSnapshot<Employee> = context.row;
      const elements: readonly HTMLTableRowElement[] = context.elements;
      for (const element of elements) element.dataset.consumerRow = String(row.id);
      context.own(() => { for (const element of elements) delete element.dataset.consumerRow; });
    },
    onRowBind(context) {
      const element = context.elements[0];
      const onClick = () => { element.dataset.consumerStatus = context.row.status; };
      element.addEventListener("click", onClick);
      context.own(() => element.removeEventListener("click", onClick));
    },
    onBind(result) {
      bindings.push({ event: result.event, counts: [result.total, result.filtered, result.visible, result.mounted] });
    }
  });
  const all: readonly RowSnapshot<Employee>[] = rows.entries({ includeDeleted: true });
  const statuses: readonly RowStatus[] = grid.statusFilter();
  grid.setStatusFilter(["insert", "update", "delete"]);
  const defaults: Record<string, unknown> = grid.defaults();
  const employee: Employee = { name: typeof defaults.name === "string" ? defaults.name : "New employee" };
  const inserted: RowId = rows.add(employee);
  const loaded: readonly RowId[] = rows.append([{ name: "Loaded employee" }]);
  const refreshed: void = grid.refresh();
  void refreshed;
  return { grid, all, statuses, defaults, inserted, loaded, bindings };
}

export function pasteEmployees(grid: GridHandle<Employee>, id: RowId, text: string): ValidationResult {
  return grid.paste(text, { id, field: "name" });
}

export function revealEmployee(grid: GridHandle<Employee>, id: RowId): void {
  const applied: void = grid.reveal(id);
  const centered: void = grid.reveal(id, { block: "center" });
  const visible: readonly RowId[] = grid.rowIds("visible");
  const filtered: readonly RowId[] = grid.rowIds("filtered");
  const store: readonly RowId[] = grid.rowIds("store");
  void [applied, centered, visible, filtered, store];
}

export function connectGridGeometry(table: HTMLTableElement, root: HTMLElement,
  handle: HTMLButtonElement, rows: Rows<Employee>): GridHandle<Employee> {
  return bindGrid(table, { rows, viewport: { root, estimate: 48 },
    heightResize: { root, handle, min: 160, max: 800 } });
}

export function configureColumns(grid: GridHandle<Employee>, columns: readonly GridColumn[]): readonly GridColumn[] {
  const applied: void = grid.setColumns(columns);
  void applied;
  return grid.columns();
}

export function configureGridState(grid: GridHandle<Employee>, ids: readonly RowId[], scope: GridRowScope) {
  const selectedWrite: void = grid.setSelected(ids);
  const selected: readonly RowId[] = grid.selectedIds();
  const checkedWrite: void = grid.setChecked(ids);
  const checked: readonly RowId[] = grid.checkedIds();
  const allWrite: void = grid.checkAll(true, scope);
  const checkState: GridCheckState = grid.checkState(scope);
  const visible: GridCheckState = grid.checkState("visible");
  const filtered: GridCheckState = grid.checkState("filtered");
  const store: GridCheckState = grid.checkState("store");
  const filterWrite: void = grid.setColumnFilter("name", ["Kim", 1, false, null]);
  const values: readonly SelectValue[] | null = grid.columnFilter("name");
  const choices: readonly GridFilterChoice[] = grid.filterChoices("name");
  const matching: readonly GridFilterChoice[] = grid.filterChoices("name", "kim");
  const clearFilter: void = grid.setColumnFilter("name", null);
  void [selectedWrite, checkedWrite, allWrite, filterWrite, clearFilter];
  return { selected, checked, checkState, visible, filtered, store, values, choices, matching };
}

export function connectDataUI(listRoot: HTMLUListElement, sizeRoot: HTMLSelectElement,
  pageRoot: HTMLElement, rows: Rows<Employee>) {
  const list = bindList(listRoot, { rows });
  const choices: SelectChoice<number>[] = [{ label: "Five", value: 5 }];
  const size = bindSelect(sizeRoot, { choices, value: 5 });
  const pagination = bindPagination(pageRoot, {
    state: { page: 1, size: 5, total: rows.entries().length },
    onPage(request: PageRequest) {
      list.setPage(request);
      const state: PageState = list.page()!;
      pagination.set(state);
    }
  });
  return { list, size, pagination };
}

export function openEmployeePicker(dialog: HTMLDialogElement): PopupHandle<string> {
  return openPopup(dialog, definition, { name: "Kim" });
}

export function connectTabs(root: HTMLElement): TabHandle {
  return bindTabs(root, {
    initial: "employees",
    pages: {
      employees: host => mountPage(host, definition, { name: "Kim" })
    }
  });
}


export function connectHierarchy(root: HTMLUListElement,
  rows: Rows<{ key: string; parent: string | null; label: string }>): TreeHandle {
  return bindTree(root, { rows, key: row => row.key, parent: row => row.parent });
}

export function connectCalendar(root: HTMLElement): DatePickerHandle {
  const picker = bindDatePicker(root, { value: "2026-10-05", min: "2026-01-01", max: "2026-12-31" });
  picker.setValue(null);
  return picker;
}

export function connectShell(notifyRoot: HTMLElement, documentRoot: HTMLElement): {
  notifications: NotifyHandle; documents: DocumentHandle;
} {
  const notifications = bindNotify(notifyRoot);
  const documents = bindDocuments(documentRoot, { beforeClose: async key => key !== "locked" });
  void documents.open("employee", {
    title: "Employee", page: host => mountPage(host, definition, { name: "Kim" })
  });
  const dismiss = notifications.show("Opened employee.");
  dismiss();
  return { notifications, documents };
}

export function connectProgressive(table: HTMLTableElement, rows: Rows<Employee>) {
  const grid = bindGrid(table, { rows, progressive: { size: 100, delay: 0 },
    onBind(result) { const bound: GridBindResult = result; void bound.available; } });
  const pending: Promise<GridBindResult> = grid.whenBound();
  const continued: Promise<GridBindResult> = grid.renderMore();
  const stopped: GridBindResult = grid.cancelBinding();
  void [pending, continued, stopped.first, stopped.last];
  return grid;
}
