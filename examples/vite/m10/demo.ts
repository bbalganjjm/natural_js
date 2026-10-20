// SPDX-License-Identifier: Apache-2.0
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindGrid } from "@bbalganjjm/natural_js/ui";
import type { GridColumn, GridHandle, ValidationResult } from "@bbalganjjm/natural_js/ui";

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
const scrollRoot = find<HTMLElement>("[data-scroll-root]");
const viewportChoice = find<HTMLInputElement>("[data-viewport]");
const datasetChoice = find<HTMLSelectElement>("[data-dataset]");
const revealRow = find<HTMLInputElement>("[data-reveal-row]");
const viewportState = find<HTMLOutputElement>("[data-viewport-state]");
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
const selectionMode = find<HTMLSelectElement>("[data-selection-mode]");
const disableInactive = find<HTMLInputElement>("[data-disable-inactive]");
const vetoActive = find<HTMLInputElement>("[data-veto-active]");
const vetoSelection = find<HTMLInputElement>("[data-veto-selection]");
const vetoChecks = find<HTMLInputElement>("[data-veto-checks]");
const checkScope = find<HTMLSelectElement>("[data-check-scope]");
const selectionState = find<HTMLElement>("[data-selection-state]");
const filterState = find<HTMLElement>("[data-filter-state]");
const filterSearch = find<HTMLInputElement>('[data-filter-search="team"]');
const beforeCallback = find<HTMLOutputElement>("[data-before-callback]");
const selectionCallback = find<HTMLOutputElement>("[data-selection-callback]");
const checkCallback = find<HTMLOutputElement>("[data-check-callback]");
const actionCallback = find<HTMLOutputElement>("[data-action-callback]");
const eventOutput = find<HTMLOutputElement>("[data-event]");
const salaryInput = find<HTMLInputElement>("[data-new-salary]");
const pasteText = find<HTMLTextAreaElement>("[data-paste-text]");
const pasteField = find<HTMLSelectElement>("[data-paste-field]");
const pasteStatus = find<HTMLOutputElement>("[data-paste-status]");
const columnChoice = find<HTMLSelectElement>("[data-column-choice]");
const columnWidth = find<HTMLInputElement>("[data-column-width]");
const columnHidden = find<HTMLInputElement>("[data-column-hidden]");
const columnState = find<HTMLElement>("[data-columns-state]");
const columnCallback = find<HTMLOutputElement>("[data-columns-callback]");
const nameHeader = find<HTMLTableCellElement>('thead th[data-column="name"]');
const salaryHeader = find<HTMLTableCellElement>('thead th[data-column="salary"]');
const defaultColumns: readonly GridColumn[] = [
  { key: "name", width: 180 }, { key: "email", width: 240 }, { key: "phone", width: 160 },
  { key: "team", width: 160 }, { key: "shift", width: 150 }, { key: "active", width: 100 },
  { key: "notes", width: 240 }, { key: "salary", width: 150 }
];
let initialColumns: readonly GridColumn[] = defaultColumns;
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
  for (const control of document.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[data-needs-grid]")) {
    if (grid && control.hasAttribute("data-check-all")) continue;
    control.disabled = grid === null;
  }
  find<HTMLButtonElement>('[data-action="rebind"]').disabled = grid !== null;
  find<HTMLButtonElement>('[data-action="previous"]').disabled = !page || page.page <= 1;
  find<HTMLButtonElement>('[data-action="next"]').disabled = !page || page.page >= page.pages;
  find<HTMLButtonElement>('[data-action="select-first-two"]').disabled = !grid || selectionMode.value !== "multiple";
  selectionState.textContent = grid ? JSON.stringify({
    active: id, selectedIds: grid.selectedIds(), checkedIds: grid.checkedIds(),
    visible: grid.checkState("visible"), filtered: grid.checkState("filtered"), store: grid.checkState("store")
  }, null, 2) : "Grid unbound; selection and checks cleared.";
  filterState.textContent = grid ? JSON.stringify({
    team: grid.columnFilter("team"), choices: grid.filterChoices("team", filterSearch.value)
  }, null, 2) : "Grid unbound; column filters cleared.";
  refreshViewport();
  refreshColumns();
}

function refreshViewport(): void {
  const mounted = table.querySelectorAll('tbody tr:not([data-row-template]):not([aria-hidden="true"])').length;
  viewportState.textContent = grid
    ? `${rows.entries().length.toLocaleString("en-US")} store rows · ${mounted} mounted rows · viewport ${viewportChoice.checked ? "on" : "off"}`
    : "Grid unbound.";
}

function columnGroup(key: string): string {
  if (key === "email" || key === "phone") return "contact";
  if (["team", "shift", "active", "notes"].includes(key)) return "assignment";
  return key;
}

function refreshColumns(): void {
  if (!grid) {
    columnState.textContent = "Grid unbound; authored column layout restored.";
    return;
  }
  const columns = grid.columns();
  columnState.textContent = JSON.stringify(columns, null, 2);
  const index = columns.findIndex(column => column.key === columnChoice.value);
  const column = columns[index];
  columnWidth.value = column.width === undefined ? "" : String(column.width);
  columnHidden.checked = column.hidden === true;
  find<HTMLButtonElement>('[data-action="column-left"]').disabled = index === 0 ||
    columnGroup(columns[index - 1].key) !== columnGroup(column.key);
  find<HTMLButtonElement>('[data-action="column-right"]').disabled = index === columns.length - 1 ||
    columnGroup(columns[index + 1].key) !== columnGroup(column.key);
}

function moveColumn(direction: -1 | 1): void {
  if (!grid) return;
  const columns = [...grid.columns()];
  const index = columns.findIndex(column => column.key === columnChoice.value);
  const next = index + direction;
  if (!columns[next] || columnGroup(columns[index].key) !== columnGroup(columns[next].key)) return;
  [columns[index], columns[next]] = [columns[next], columns[index]];
  grid.setColumns(columns);
}

function applySort(): void {
  if (!grid) return;
  if (sort.value === "name-asc") {
    grid.setSort((a, b) => a.name.localeCompare(b.name), { column: nameHeader, direction: "ascending" });
  } else if (sort.value === "name-desc") {
    grid.setSort((a, b) => b.name.localeCompare(a.name), { column: nameHeader, direction: "descending" });
  } else if (sort.value === "salary-desc") {
    grid.setSort((a, b) => b.salary - a.salary, { column: salaryHeader, direction: "descending" });
  } else if (sort.value === "salary-asc") {
    grid.setSort((a, b) => a.salary - b.salary, { column: salaryHeader, direction: "ascending" });
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
  find<HTMLInputElement>("[data-check-all]").disabled = false;
  grid = bindGrid(table, {
    rows,
    viewport: viewportChoice.checked ? { root: scrollRoot, estimate: 150, overscan: 3 } : undefined,
    initialPage,
    paste: true,
    onPaste(result) {
      showValidation(result);
      pasteStatus.textContent = result.valid ? "Paste accepted; all supplied writable cells applied together."
        : `Paste rejected; no pasted cells applied. ${result.issues.map(issue => `RowId ${issue.rowId}, ${issue.field}: ${issue.message}`).join(" ")}`;
      refresh();
    },
    columns: defaultColumns,
    multiple: selectionMode.value === "multiple",
    canSelect: disableInactive.checked ? row => row.value.active : undefined,
    canCheck: disableInactive.checked ? row => row.value.active : undefined,
    sorts: { name: (a, b) => a.name.localeCompare(b.name), salary: (a, b) => a.salary - b.salary },
    filters: { team: { value: row => row.profile.team } },
    rules: {
      format: { displayName: value => value.toUpperCase() },
      validate: { payAtLeast: (value, args) => Number(value) >= Number(args[0]) },
      messages: { payAtLeast: "Salary must be at least {0}." },
      locale: locale.value
    },
    parse: { salary: input => input.trim() ? Number(input) : undefined },
    beforeSelect({ id, row, event }) {
      beforeCallback.textContent = `beforeSelect RowId ${id ?? "none"}, ${row?.value.name ?? "none"}, event ${event?.type ?? "programmatic"}: ${vetoActive.checked ? "vetoed" : "allowed"}`;
      return !vetoActive.checked;
    },
    beforeSelectionChange({ ids, previous, event }) {
      beforeCallback.textContent = `beforeSelectionChange ${JSON.stringify(previous)} → ${JSON.stringify(ids)}, event ${event?.type ?? "programmatic"}: ${vetoSelection.checked ? "vetoed" : "allowed"}`;
      return !vetoSelection.checked;
    },
    beforeCheckChange({ ids, previous, event }) {
      beforeCallback.textContent = `beforeCheckChange ${JSON.stringify(previous)} → ${JSON.stringify(ids)}, event ${event?.type ?? "programmatic"}: ${vetoChecks.checked ? "vetoed" : "allowed"}`;
      return !vetoChecks.checked;
    },
    onSelect({ id, row, event }) {
      callback.textContent = `RowId ${id ?? "none"}, ${row?.value.name ?? "none"}, event ${event?.type ?? "programmatic"}`;
      refresh();
    },
    onSelectionChange({ ids, previous, event }) {
      selectionCallback.textContent = `${JSON.stringify(previous)} → ${JSON.stringify(ids)}, event ${event?.type ?? "programmatic"}`;
      refresh();
    },
    onCheckChange({ ids, previous, event }) {
      checkCallback.textContent = `${JSON.stringify(previous)} → ${JSON.stringify(ids)}, event ${event?.type ?? "programmatic"}`;
      refresh();
    },
    onRowAction({ action, id, row, element, event }) {
      actionCallback.textContent = `${action}: RowId ${id}, ${row.value.name}, control ${element.tagName.toLowerCase()}, event ${event.type}`;
      refresh();
    },
    onColumnsChange({ columns, event }) {
      columnCallback.textContent = `${columns.filter(column => !column.hidden).length} visible, event ${event?.type ?? "programmatic"}`;
      columnState.textContent = JSON.stringify(columns, null, 2);
      if (grid) refreshColumns();
    }
  });
  initialColumns = grid.columns().map(column => ({ ...column }));
  stopRows();
  stopRows = rows.subscribe(event => {
    eventOutput.textContent = `${event.type}${"id" in event ? ` RowId ${event.id}` : "ids" in event ? ` RowIds ${event.ids.join(", ")}` : ""}, changed ${event.changed}`;
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
  if (action === "revert-all") { rows.revert(); status.textContent = "Values restored and added rows removed; row order kept."; return; }
  if (action === "replace") { rows.replace(Array.from({ length: Number(datasetChoice.value) }, (_, index) => employee(index))); status.textContent = "Rows replaced with new RowIds."; return; }
  if (!grid) throw new Error("Bind the Grid before using this control.");
  switch (action) {
    case "reveal": {
      const index = Number(revealRow.value) - 1;
      const row = Number.isSafeInteger(index) ? rows.entries()[index] : undefined;
      if (!row) throw new Error("Enter a row number present in the store.");
      grid.reveal(row.id);
      status.textContent = `Revealed RowId ${row.id}; selection unchanged.`;
      requestAnimationFrame(refreshViewport);
      return;
    }
    case "paste": grid.paste(pasteText.value, { id: selectedId(), field: pasteField.value }); return;
    case "apply-columns": {
      const width = columnWidth.value.trim();
      grid.setColumns(grid.columns().map(column => column.key === columnChoice.value
        ? { key: column.key, ...(width ? { width: Number(width) } : {}), hidden: columnHidden.checked }
        : column));
      break;
    }
    case "column-left": moveColumn(-1); break;
    case "column-right": moveColumn(1); break;
    case "swap-groups": {
      const columns = grid.columns();
      const contact = columns.filter(column => columnGroup(column.key) === "contact");
      const assignment = columns.filter(column => columnGroup(column.key) === "assignment");
      const contactFirst = columns.findIndex(column => column.key === contact[0].key) <
        columns.findIndex(column => column.key === assignment[0].key);
      grid.setColumns([columns.find(column => column.key === "name")!,
        ...(contactFirst ? [...assignment, ...contact] : [...contact, ...assignment]),
        columns.find(column => column.key === "salary")!]);
      break;
    }
    case "reset-columns": grid.setColumns(initialColumns); break;
    case "invalid-columns": grid.setColumns([...grid.columns(), grid.columns()[0]]); break;
    case "empty-team-filter": grid.setColumnFilter("team", []); break;
    case "previous": requestedPage = (grid.page()?.page ?? 1) - 1; applyPage(); return;
    case "next": requestedPage = (grid.page()?.page ?? 1) + 1; applyPage(); return;
    case "select-first": grid.select(rows.entries()[0]?.id ?? null); break;
    case "clear-selection": grid.select(null); break;
    case "clear-multiple": grid.setSelected([]); break;
    case "select-first-two": grid.setSelected(rows.entries()
      .filter(row => !disableInactive.checked || row.value.active).slice(0, 2).map(row => row.id)); break;
    case "check-all": grid.checkAll(true, checkScope.value as "visible" | "filtered" | "store"); break;
    case "uncheck-all": grid.checkAll(false, checkScope.value as "visible" | "filtered" | "store"); break;
    case "check-selected": grid.setChecked(grid.selectedIds()); break;
    case "clear-checks": grid.setChecked([]); break;
    case "validate-selected": showValidation(grid.validate(selectedId())); return;
    case "validate-all": showValidation(grid.validate()); return;
    case "add": grid.select(rows.add(employee(rows.entries().length))); break;
    case "insert-before": grid.select(rows.add(employee(rows.entries().length), selectedId())); break;
    case "copy-before": grid.select(rows.copy(selectedId(), selectedId())); break;
    case "copy-end": grid.select(rows.copy(selectedId())); break;
    case "move-first": rows.move(selectedId(), rows.entries()[0]?.id); break;
    case "move-end": rows.move(selectedId()); break;
    case "move-up":
    case "move-down": {
      const id = selectedId();
      const entries = rows.entries();
      const index = entries.findIndex(row => row.id === id);
      if (action === "move-up" && index > 0) rows.move(id, entries[index - 1].id);
      if (action === "move-down" && index < entries.length - 1) rows.move(id, entries[index + 2]?.id);
      break;
    }
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
  if (!button) {
    if (event.target instanceof Element && table.contains(event.target)) {
      const header = event.target.closest<HTMLButtonElement>("button[data-sort-column]");
      if (header) {
        const direction = header.closest("th")?.getAttribute("aria-sort");
        sort.value = direction === "ascending" ? `${header.dataset.sortColumn}-asc`
          : direction === "descending" ? `${header.dataset.sortColumn}-desc` : "none";
      }
      refresh();
    }
    return;
  }
  try { act(button.dataset.action!); }
  catch (cause) { status.textContent = cause instanceof Error ? cause.message : String(cause); }
});

sort.addEventListener("change", applySort);
document.addEventListener("change", event => {
  if (event.target instanceof Element && table.contains(event.target)) refresh();
});
filterSearch.addEventListener("input", () => { queueMicrotask(refresh); });
scrollRoot.addEventListener("scroll", () => { requestAnimationFrame(refreshViewport); }, { passive: true });
for (const control of [viewportChoice, datasetChoice]) {
  control.addEventListener("change", () => {
    grid?.dispose(); grid = null;
    scrollRoot.toggleAttribute("data-viewport-enabled", viewportChoice.checked);
    if (control === datasetChoice) rows.replace(Array.from({ length: Number(datasetChoice.value) }, (_, index) => employee(index)));
    scrollRoot.scrollTop = 0;
    bind();
    status.textContent = "Viewport or dataset changed; selection, checks and uncommitted edits were cleared.";
    requestAnimationFrame(refreshViewport);
  });
}
for (const control of [selectionMode, disableInactive]) {
  control.addEventListener("change", () => {
    if (grid) { grid.dispose(); grid = null; bind(); }
    status.textContent = "Selection policy changed; selection, checks and uncommitted edits were cleared. Valid Rows changes remain.";
    refresh();
  });
}
columnChoice.addEventListener("change", refreshColumns);
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
