// SPDX-License-Identifier: Apache-2.0
import { createRows } from "@bbalganjjm/natural_js/data";
import type { Rows } from "@bbalganjjm/natural_js/data";
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageContext, PageHandle } from "@bbalganjjm/natural_js/page";
import { bindGrid } from "@bbalganjjm/natural_js/ui";
import type { GridColumn, GridHandle } from "@bbalganjjm/natural_js/ui";

type Employee = {
  name: string; email: string; phone: string; profile: { team: string };
  assignment: { shifts: { label: string; code: number }[]; chosen: number | null };
  active: boolean; notes: string; salary: number;
};

export interface ColumnScreen {
  readonly root: HTMLElement;
  readonly table: HTMLTableElement;
  readonly rows: Rows<Employee>;
  readonly grid: GridHandle<Employee> | null;
  readonly columnEvents: { columns: readonly GridColumn[]; event: string | null }[];
  disposeGrid(): void;
  rebind(): void;
}

export const columnScreens = new Map<string, ColumnScreen>();

function find<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error("Column layout needs " + selector);
  return element;
}

function group(key: string): string {
  if (key === "email" || key === "phone") return "contact";
  if (["team", "shift", "active", "notes"].includes(key)) return "assignment";
  return key;
}

function controller({ root, own, signal, input }: PageContext<{ layout: string }>) {
  const rows = createRows<Employee>(Array.from({ length: 8 }, (_, index) => ({
    name: `${input.layout === "ledger" ? "Ledger" : "Notebook"} ${String(index + 1).padStart(2, "0")}`,
    email: `employee${index + 1}@example.com`, phone: `+1 555 010${index + 1}`,
    profile: { team: index % 2 ? "Support" : "Platform" },
    assignment: { shifts: [{ label: "Morning", code: 1 }, { label: "Evening", code: 2 }], chosen: index % 2 + 1 },
    active: index % 3 !== 2, notes: "Independent " + input.layout + " draft", salary: 150 + index * 25
  })));
  own(() => rows.dispose());
  const table = find<HTMLTableElement>(root, "[data-grid]");
  const choice = find<HTMLSelectElement>(root, "[data-column-choice]");
  const width = find<HTMLInputElement>(root, "[data-column-width]");
  const hidden = find<HTMLInputElement>(root, "[data-column-hidden]");
  const state = find<HTMLElement>(root, "[data-columns-state]");
  const rowState = find<HTMLElement>(root, "[data-row-state]");
  const status = find<HTMLOutputElement>(root, "[data-column-status]");
  const callback = find<HTMLOutputElement>(root, "[data-column-callback]");
  const nameHeader = find<HTMLTableCellElement>(table, 'thead th[data-column="name"]');
  const widths: Record<string, number> = { name: 180, email: 240, phone: 160, team: 160, shift: 140, active: 100, notes: 210, salary: 140 };
  const defaults: readonly GridColumn[] = [...table.tBodies[0].rows[0].cells].map(cell => ({
    key: cell.dataset.column!, width: widths[cell.dataset.column!]
  }));
  let initial: readonly GridColumn[] = defaults;
  let grid: GridHandle<Employee> | null = null;
  let descending = false;
  let filtered = false;
  let paged = true;
  const columnEvents: ColumnScreen["columnEvents"] = [];

  function button(action: string): HTMLButtonElement {
    return find(root, `[data-column-action="${action}"]`);
  }

  function refresh(): void {
    for (const control of root.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>("[data-needs-grid]")) {
      control.disabled = grid === null;
    }
    button("rebind").disabled = grid !== null;
    const selected = grid?.selected() ?? null;
    rowState.textContent = JSON.stringify({ selected, row: selected === null ? null : rows.get(selected),
      page: grid?.page() ?? null, changes: rows.changes() }, null, 2);
    if (!grid) { state.textContent = "Grid unbound; authored table restored."; return; }
    const columns = grid.columns();
    state.textContent = JSON.stringify(columns, null, 2);
    const index = columns.findIndex(column => column.key === choice.value);
    const column = columns[index];
    width.value = column.width === undefined ? "" : String(column.width);
    hidden.checked = column.hidden === true;
    button("earlier").disabled = index === 0 || group(columns[index - 1].key) !== group(column.key);
    button("later").disabled = index === columns.length - 1 || group(columns[index + 1].key) !== group(column.key);
  }

  function disposeGrid(): void {
    grid?.dispose(); grid = null;
    status.textContent = "Grid disposed; Rows remains available.";
    refresh();
  }

  function bind(): void {
    if (grid) return;
    grid = bindGrid(table, {
      rows, columns: defaults, initialPage: paged ? { page: 1, size: 3 } : undefined,
      parse: { salary: entered => {
        const value = Number(entered);
        if (!entered.trim() || !Number.isFinite(value)) throw new Error("Enter a numeric salary.");
        return value;
      } },
      rules: { validate: { payAtLeast: (value, args) => Number(value) >= Number(args[0]) || "Salary must be at least 100." } },
      onSelect() { if (grid) refresh(); },
      onColumnsChange({ columns, event }) {
        columnEvents.push({ columns, event: event?.type ?? null });
        callback.textContent = `${columnEvents.length} change(s), ${event?.type ?? "programmatic"}, ${columns.filter(column => !column.hidden).length} visible`;
        if (grid) refresh();
      }
    });
    initial = grid.columns().map(column => ({ ...column }));
    if (descending) grid.setSort((left, right) => right.name.localeCompare(left.name), { column: nameHeader, direction: "descending" });
    if (filtered) grid.setFilter(row => row.profile.team === "Platform");
    refresh();
    status.textContent = "Grid bound with independent " + input.layout + " rows.";
  }

  function act(action: string): void {
    if (action === "rebind") { bind(); return; }
    if (!grid) throw new Error("Bind this Grid first.");
    const columns = [...grid.columns()];
    const index = columns.findIndex(column => column.key === choice.value);
    switch (action) {
      case "apply": grid.setColumns(columns.map(column => column.key === choice.value
        ? { key: column.key, ...(width.value.trim() ? { width: Number(width.value) } : {}), hidden: hidden.checked } : column)); break;
      case "earlier": case "later": {
        const next = index + (action === "earlier" ? -1 : 1);
        if (!columns[next] || group(columns[index].key) !== group(columns[next].key)) return;
        [columns[index], columns[next]] = [columns[next], columns[index]];
        grid.setColumns(columns); break;
      }
      case "swap": {
        const contact = columns.filter(column => group(column.key) === "contact");
        const assignment = columns.filter(column => group(column.key) === "assignment");
        const contactFirst = columns.indexOf(contact[0]) < columns.indexOf(assignment[0]);
        grid.setColumns([columns.find(column => column.key === "name")!,
          ...(contactFirst ? [...assignment, ...contact] : [...contact, ...assignment]),
          columns.find(column => column.key === "salary")!]); break;
      }
      case "reset": grid.setColumns(initial); break;
      case "invalid": grid.setColumns([...columns, columns[0]]); break;
      case "sort": descending = !descending; grid.setSort((left, right) => (descending ? -1 : 1) * left.name.localeCompare(right.name),
        { column: nameHeader, direction: descending ? "descending" : "ascending" }); break;
      case "filter": filtered = !filtered; grid.setFilter(filtered ? row => row.profile.team === "Platform" : null); break;
      case "page": paged = !paged; grid.setPage(paged ? { page: 2, size: 3 } : null); break;
      case "validate": {
        const result = grid.validate();
        status.textContent = result.valid ? "All rows valid." : result.issues.map(issue => `${issue.field}: ${issue.message}`).join(" · ");
        refresh(); return;
      }
      case "dispose": disposeGrid(); return;
      default: return;
    }
    status.textContent = action + " applied.";
    refresh();
  }

  root.addEventListener("click", event => {
    const control = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-column-action]") : null;
    if (!control || !root.contains(control)) return;
    try { act(control.dataset.columnAction!); }
    catch (cause) { status.textContent = cause instanceof Error ? cause.message : String(cause); }
  }, { signal });
  choice.addEventListener("change", refresh, { signal });
  own(rows.subscribe(refresh));
  own(() => { grid?.dispose(); grid = null; columnScreens.delete(input.layout); });
  bind();
  columnScreens.set(input.layout, { root, table, rows, get grid() { return grid; }, columnEvents, disposeGrid, rebind: bind });
  return {};
}

export const pages: readonly PageHandle[] = ["ledger", "notebook"].map(layout => {
  const host = find<HTMLElement>(document, `[data-column-host="${layout}"]`);
  const template = find<HTMLTemplateElement>(document, `template[data-column-screen="${layout}"]`);
  return mountPage(host, { view: () => template.content.firstElementChild!.cloneNode(true) as HTMLElement, controller }, { layout });
});
export const ready = Promise.all(pages.map(page => page.ready));
void ready.catch(cause => {
  const message = document.createElement("p");
  message.setAttribute("role", "alert");
  message.textContent = cause instanceof Error ? cause.message : String(cause);
  document.querySelector("main")!.append(message);
});
window.addEventListener("pagehide", () => { for (const page of pages) void page.dispose(); }, { once: true });
