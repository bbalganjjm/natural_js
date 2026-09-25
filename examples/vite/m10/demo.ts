// SPDX-License-Identifier: Apache-2.0
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindGrid } from "@bbalganjjm/natural_js/ui";
import type { GridHandle, ValidationResult } from "@bbalganjjm/natural_js/ui";

type Employee = {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly profile: { readonly team: string };
  readonly assignment: {
    readonly shifts: readonly { readonly meta: { readonly label: string }; readonly code: number }[];
    readonly chosen: number | null;
  };
  readonly active: boolean;
  readonly notes: string;
  readonly salary: number;
};

function find<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error("Grid demo needs " + selector);
  return element;
}

function employee(index: number): Employee {
  const names = ["Ada", "Grace", "Linus", "Margaret", "Alan", "Katherine"];
  const alternate = index % 2 === 1;
  return {
    name: names[index] ?? "New employee " + (index + 1),
    email: "employee" + (index + 1) + "@example.com",
    phone: "+1 555 01" + String(index + 1).padStart(2, "0"),
    profile: { team: alternate ? "Support" : "Platform" },
    assignment: {
      shifts: alternate
        ? [{ meta: { label: "Night" }, code: 3 }, { meta: { label: "Weekend" }, code: 4 }]
        : [{ meta: { label: "Morning" }, code: 1 }, { meta: { label: "Evening" }, code: 2 }],
      chosen: alternate ? 3 : 1
    },
    active: index % 3 !== 2,
    notes: alternate ? "Evening handoff" : "Morning handoff",
    salary: 150 + index * 25
  };
}

const rows = createRows<Employee>(Array.from({ length: 6 }, (_, index) => employee(index)));
const table = find<HTMLTableElement>("[data-grid]");
const sort = find<HTMLSelectElement>("[data-sort]");
const filter = find<HTMLSelectElement>("[data-filter]");
const size = find<HTMLSelectElement>("[data-size]");
const locale = find<HTMLSelectElement>("[data-locale]");
const initialPageChoice = find<HTMLSelectElement>("[data-initial-page]");
const status = find<HTMLOutputElement>("[data-status]");
const snapshot = find<HTMLElement>("[data-snapshot]");
const changes = find<HTMLElement>("[data-changes]");
const issues = find<HTMLElement>("[data-issues]");
const selection = find<HTMLOutputElement>("[data-selection]");
const pageState = find<HTMLOutputElement>("[data-page-state]");
const callback = find<HTMLOutputElement>("[data-callback]");
const eventOutput = find<HTMLOutputElement>("[data-event]");
const salaryInput = find<HTMLInputElement>("[data-new-salary]");
const nameHeader = table.tHead!.rows[0].cells[0];
const salaryHeader = table.tHead!.rows[0].cells[3];
let grid: GridHandle<Employee> | null = null;
let requestedPage = 1;
let stopRows = () => {};

function refresh(): void {
  const id = grid?.selected() ?? null;
  const row = id === null ? null : rows.get(id) ?? null;
  const page = grid?.page() ?? null;
  selection.textContent = row ? `Selected RowId ${id}: ${row.value.name}` : "No row selected";
  snapshot.textContent = row ? JSON.stringify(row, null, 2) : "Select a row.";
  changes.textContent = JSON.stringify(rows.changes(), null, 2);
  pageState.textContent = page
    ? `Page ${page.page} of ${page.pages} · ${page.total} filtered rows · size ${page.size}`
    : `${rows.entries().length} store rows · paging off`;
  for (const control of document.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>("[data-needs-grid]")) {
    control.disabled = grid === null;
  }
  find<HTMLButtonElement>('[data-action="rebind"]').disabled = grid !== null;
  find<HTMLButtonElement>('[data-action="previous"]').disabled = !page || page.page <= 1;
  find<HTMLButtonElement>('[data-action="next"]').disabled = !page || page.page >= page.pages;
}

function applySort(): void {
  if (!grid) return;
  if (sort.value === "name-asc") {
    grid.setSort((a, b) => a.name.localeCompare(b.name), { column: nameHeader, direction: "ascending" });
  } else if (sort.value === "name-desc") {
    grid.setSort((a, b) => b.name.localeCompare(a.name), { column: nameHeader, direction: "descending" });
  } else if (sort.value === "salary-desc") {
    grid.setSort((a, b) => b.salary - a.salary, { column: salaryHeader, direction: "descending" });
  } else {
    grid.setSort(null);
  }
  refresh();
}

function applyFilter(): void {
  if (!grid) return;
  const team = filter.value;
  grid.setFilter(team ? row => row.profile.team === team : null);
  refresh();
}

function applyPage(): void {
  if (!grid) return;
  const count = Number(size.value);
  grid.setPage(count ? { page: requestedPage, size: count } : null);
  requestedPage = grid.page()?.page ?? 1;
  refresh();
}

function bind(): void {
  const initialPage = initialPageChoice.value
    ? { page: initialPageChoice.value === "second" ? 2 : 1, size: 2 }
    : undefined;
  grid = bindGrid(table, {
    rows,
    initialPage,
    rules: {
      format: { displayName: value => value.toUpperCase() },
      validate: { payAtLeast: (value, args) => Number(value) >= Number(args[0]) },
      messages: { payAtLeast: "Salary must be at least {0}." },
      locale: locale.value
    },
    parse: { salary: input => input.trim() ? Number(input) : undefined },
    onSelect({ id, row, event }) {
      callback.textContent = `RowId ${id ?? "none"}, ${row?.value.name ?? "none"}, event ${event?.type ?? "programmatic"}`;
      refresh();
    }
  });
  stopRows();
  stopRows = rows.subscribe(event => {
    eventOutput.textContent = `${event.type}${"id" in event ? ` RowId ${event.id}` : ""}, changed ${event.changed}`;
    refresh();
  });
  applySort();
  applyFilter();
  if (initialPage) {
    size.value = String(initialPage.size);
    requestedPage = grid.page()?.page ?? 1;
    refresh();
  } else {
    applyPage();
  }
  status.textContent = "Grid is bound.";
}

function selectedId(): number {
  const id = grid?.selected();
  if (id === null || id === undefined) throw new Error("Select a row first.");
  return id;
}

function showValidation(result: ValidationResult): void {
  issues.textContent = result.issues.length
    ? JSON.stringify(result.issues.map(({ rowId, field, rule, message }) => ({ rowId, field, rule, message })), null, 2)
    : "No issues.";
  status.textContent = result.valid ? "Validation passed." : `${result.issues.length} validation issue(s).`;
}

function act(action: string): void {
  if (action === "rebind") { bind(); return; }
  if (action === "revert-all") { rows.revert(); status.textContent = "All Rows changes reverted."; return; }
  if (action === "replace") { rows.replace(Array.from({ length: 6 }, (_, index) => employee(index))); status.textContent = "Rows replaced with new RowIds."; return; }
  if (!grid) throw new Error("Bind the Grid before using this control.");
  switch (action) {
    case "previous": requestedPage = (grid.page()?.page ?? 1) - 1; applyPage(); return;
    case "next": requestedPage = (grid.page()?.page ?? 1) + 1; applyPage(); return;
    case "select-first": grid.select(rows.entries()[0]?.id ?? null); break;
    case "clear-selection": grid.select(null); break;
    case "validate-selected": showValidation(grid.validate(selectedId())); return;
    case "validate-all": showValidation(grid.validate()); return;
    case "add": grid.select(rows.add(employee(rows.entries().length))); break;
    case "remove": rows.remove(selectedId()); break;
    case "revert-selected": rows.revert(selectedId()); break;
    case "set-salary": {
      const value = Number(salaryInput.value);
      if (!salaryInput.value || !Number.isFinite(value)) throw new Error("Enter a valid salary first.");
      rows.set(selectedId(), "salary", value);
      break;
    }
    case "missing-choice": {
      const id = selectedId();
      const row = rows.get(id)!;
      rows.set(id, "assignment", { ...row.value.assignment, chosen: 999 });
      break;
    }
    case "clear-choice": {
      const id = selectedId();
      const row = rows.get(id)!;
      rows.set(id, "assignment", { ...row.value.assignment, chosen: null });
      break;
    }
    case "dispose": grid.dispose(); grid = null; status.textContent = "Grid disposed; Rows is still available."; break;
    default: return;
  }
  if (action !== "dispose") status.textContent = `${action} applied.`;
  refresh();
}

document.addEventListener("click", event => {
  const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-action]") : null;
  if (!button) return;
  try { act(button.dataset.action!); }
  catch (cause) { status.textContent = cause instanceof Error ? cause.message : String(cause); }
});

sort.addEventListener("change", applySort);
filter.addEventListener("change", () => { applyFilter(); requestedPage = 1; applyPage(); });
size.addEventListener("change", () => { initialPageChoice.value = ""; requestedPage = 1; applyPage(); });
initialPageChoice.addEventListener("change", () => {
  size.value = initialPageChoice.value ? "2" : "";
  requestedPage = 1;
  grid?.dispose();
  grid = null;
  bind();
  status.textContent = "Initial page changed; selection and uncommitted edits were cleared. Valid Rows changes remain.";
  refresh();
});
locale.addEventListener("change", () => {
  if (grid) { grid.dispose(); grid = null; bind(); }
  status.textContent = "Locale changed; selection and uncommitted edits were cleared. Blank Team shows the new rule message.";
  refresh();
});
window.addEventListener("pagehide", () => { grid?.dispose(); stopRows(); rows.dispose(); }, { once: true });
bind();
