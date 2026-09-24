import { FrameworkError } from "@bbalganjjm/natural_js";
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import type { Rows } from "@bbalganjjm/natural_js/data";
import { createCommunicator } from "@bbalganjjm/natural_js/comm";
import type { Communicator } from "@bbalganjjm/natural_js/comm";
import type { FormHandle } from "@bbalganjjm/natural_js/ui";

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
