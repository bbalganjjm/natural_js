import { FrameworkError } from "@bbalganjjm/natural_js";
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import type { Rows } from "@bbalganjjm/natural_js/data";
import { createCommunicator } from "@bbalganjjm/natural_js/comm";
import type { Communicator } from "@bbalganjjm/natural_js/comm";
import { bindForm, bindGrid, bindList, bindSelect, bindPagination } from "@bbalganjjm/natural_js/ui";
import type { FormHandle, PageRequest, PageState, SelectChoice } from "@bbalganjjm/natural_js/ui";

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
  const grid = bindGrid(table, { rows, onSelect: ({ id }) => form.bind(id) });
  return { form, grid };
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
