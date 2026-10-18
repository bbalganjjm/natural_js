import { FrameworkError } from "@bbalganjjm/natural_js";
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import type { RowId, RowSnapshot, Rows } from "@bbalganjjm/natural_js/data";
import { createCommunicator } from "@bbalganjjm/natural_js/comm";
import type { Communicator } from "@bbalganjjm/natural_js/comm";
import { bindForm, bindGrid, bindList, bindSelect, bindPagination, openPopup, bindTabs, bindTree, bindDatePicker, bindNotify, bindDocuments } from "@bbalganjjm/natural_js/ui";
import type { FormHandle, GridColumn, GridHandle, GridIdsChange, GridRowScope, GridCheckState, GridFilterChoice, PageRequest, PageState, SelectValue, SelectChoice, PopupHandle, TabHandle, TreeHandle, DatePickerHandle, NotifyHandle, DocumentHandle } from "@bbalganjjm/natural_js/ui";

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

export function loadEmployees(comm: Communicator = createCommunicator({
  baseURL: new URL("https://example.test/api/"),
  prepare: request => request,
  after: response => response
})): Promise<Employee[]> {
  return comm.request<Employee[]>({ url: "employees", method: "GET" });
}

export function connectEditor(root: HTMLFormElement, table: HTMLTableElement, rows: Rows<Employee>) {
  const form = bindForm(root, { rows });
  const columns: readonly GridColumn[] = [{ key: "person", width: 180 }, { key: "choice", width: 120 }];
  const columnChanges: { columns: readonly GridColumn[]; event: Event | null }[] = [];
  const selectionChanges: GridIdsChange[] = [];
  const checkChanges: GridIdsChange[] = [];
  const grid: GridHandle<Employee> = bindGrid(table, {
    rows, columns, initialPage: { page: 1, size: 5 }, onSelect: ({ id }) => form.bind(id),
    multiple: true,
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
  return { form, grid, columnChanges, selectionChanges, checkChanges };
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
