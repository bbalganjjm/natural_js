import { FrameworkError } from "@bbalganjjm/natural_js";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";
import type { Rows } from "@bbalganjjm/natural_js/data";
import type { Communicator } from "@bbalganjjm/natural_js/comm";
import type { FormHandle } from "@bbalganjjm/natural_js/ui";

interface Employee {
  name: string;
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

export function loadEmployees(comm: Communicator): Promise<Employee[]> {
  return comm.request<Employee[]>({ url: "employees", method: "GET" });
}
