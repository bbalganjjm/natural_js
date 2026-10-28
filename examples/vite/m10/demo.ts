// SPDX-License-Identifier: Apache-2.0
import { createRows } from "@bbalganjjm/natural_js/data";
import type { RowId, RowStatus } from "@bbalganjjm/natural_js/data";
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageHandle } from "@bbalganjjm/natural_js/page";
import { bindGrid, openPopup } from "@bbalganjjm/natural_js/ui";
import type { GridBindResult, GridColumn, GridHandle, GridRowScope, PopupHandle, RuleSet, ValidationResult } from "@bbalganjjm/natural_js/ui";
import { employeeDetail } from "./detail.js";
import type { Employee } from "./detail.js";

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

function employeeFromDefaults(defaults: Record<string, unknown>, index: number): Employee {
  const value = employee(index);
  const profile = defaults.profile;
  const team = profile && typeof profile === "object" && "team" in profile ? profile.team : undefined;
  const assignment = defaults.assignment;
  const chosen = assignment && typeof assignment === "object" && "chosen" in assignment ? assignment.chosen : undefined;
  return {
    ...value,
    email: typeof defaults.email === "string" ? defaults.email : value.email,
    phone: typeof defaults.phone === "string" ? defaults.phone : value.phone,
    profile: { team: typeof team === "string" ? team : value.profile.team },
    assignment: { shifts: value.assignment.shifts,
      chosen: typeof chosen === "number" && value.assignment.shifts.some(shift => shift.code === chosen) ? chosen : value.assignment.chosen },
    active: typeof defaults.active === "boolean" ? defaults.active : value.active,
    notes: typeof defaults.notes === "string" ? defaults.notes : value.notes,
    salary: typeof defaults.salary === "number" && Number.isFinite(defaults.salary) ? defaults.salary : value.salary
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
const statusFilter = find<HTMLSelectElement>("[data-status-filter]");
const statusViews: Record<string, readonly RowStatus[]> = {
  live: ["clean", "insert", "update"], modified: ["insert", "update", "delete"],
  deleted: ["delete"], all: ["clean", "insert", "update", "delete"], empty: []
};
const size = find<HTMLSelectElement>("[data-size]");
const locale = find<HTMLSelectElement>("[data-locale]");
const initialPageChoice = find<HTMLSelectElement>("[data-initial-page]");
const revealBlock = find<HTMLSelectElement>("[data-reveal-block]");
const status = find<HTMLOutputElement>("[data-status]");
const snapshot = find<HTMLElement>("[data-snapshot]");
const originalOutput = find<HTMLElement>("[data-original]");
const changes = find<HTMLElement>("[data-changes]");
const defaultsOutput = find<HTMLElement>("[data-defaults]");
const bindState = find<HTMLOutputElement>("[data-bind-state]");
const renderingMode = find<HTMLSelectElement>("[data-render-mode]");
const renderingSize = find<HTMLInputElement>("[data-render-size]");
const renderingDelay = find<HTMLInputElement>("[data-render-delay]");
const renderingControls = find<HTMLElement>("[data-render-controls]");
const renderingNotice = find<HTMLOutputElement>("[data-render-notice]");
const renderingHistory = find<HTMLElement>("[data-render-history]");
const renderingCurrent = find<HTMLElement>("[data-render-current]");
const renderingPing = find<HTMLOutputElement>("[data-render-ping]");
const renderingFail = find<HTMLInputElement>("[data-render-fail]");
const rowResources = find<HTMLInputElement>("[data-row-resources]");
const rowResourcesState = find<HTMLElement>("[data-row-resources-state]");
const issues = find<HTMLElement>("[data-issues]");
const selection = find<HTMLOutputElement>("[data-selection]");
const pageState = find<HTMLOutputElement>("[data-page-state]");
const callback = find<HTMLOutputElement>("[data-callback]");
const selectionMode = find<HTMLSelectElement>("[data-selection-mode]");
const toggleSelection = find<HTMLInputElement>("[data-toggle-selection]");
const selectOnRowClick = find<HTMLInputElement>("[data-select-on-row-click]");
const actionScroll = find<HTMLInputElement>("[data-action-scroll]");
const lastInvalid = find<HTMLInputElement>("[data-last-invalid]");
const checkMode = find<HTMLSelectElement>("[data-check-mode]");
const validateOn = find<HTMLSelectElement>("[data-validate-on]");
const revealInvalid = find<HTMLInputElement>("[data-reveal-invalid]");
const disableInactive = find<HTMLInputElement>("[data-disable-inactive]");
const vetoActive = find<HTMLInputElement>("[data-veto-active]");
const vetoSelection = find<HTMLInputElement>("[data-veto-selection]");
const vetoChecks = find<HTMLInputElement>("[data-veto-checks]");
const checkScope = find<HTMLSelectElement>("[data-check-scope]");
const selectionState = find<HTMLElement>("[data-selection-state]");
const filterState = find<HTMLElement>("[data-filter-state]");
const filterSearch = find<HTMLInputElement>('[data-filter-search="team"]');
const filterCount = find<HTMLOutputElement>("[data-filter-count]");
const beforeCallback = find<HTMLOutputElement>("[data-before-callback]");
const selectionCallback = find<HTMLOutputElement>("[data-selection-callback]");
const checkCallback = find<HTMLOutputElement>("[data-check-callback]");
const actionCallback = find<HTMLOutputElement>("[data-action-callback]");
const postEdit = find<HTMLOutputElement>("[data-post-edit]");
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
const columnChooser = find<HTMLDetailsElement>("[data-column-chooser]");
const columnAll = find<HTMLInputElement>("[data-column-all]");
const columnCount = find<HTMLOutputElement>("[data-column-count]");
const columnChoices = [...columnChooser.querySelectorAll<HTMLInputElement>("[data-visible-column]")];
const nameHeader = find<HTMLTableCellElement>('thead th[data-column="name"]');
const salaryHeader = find<HTMLTableCellElement>('thead th[data-column="salary"]');
const defaultColumns: readonly GridColumn[] = [
  { key: "name", width: 180 }, { key: "email", width: 240 }, { key: "phone", width: 160 },
  { key: "team", width: 160 }, { key: "shift", width: 150 }, { key: "active", width: 100 },
  { key: "notes", width: 240 }, { key: "salary", width: 150 }, { key: "actions", width: 180 }
];
let initialColumns: readonly GridColumn[] = defaultColumns;
let grid: GridHandle<Employee> | null = null;
let inspectedId: RowId | null = null;
let requestedPage = 1;
let stopRows = () => {};
let stopGridEvents = () => {};
const eventRows = new WeakMap<HTMLTableRowElement, RowId>();
let bindCalls = 0;
let renderingGeneration = 0;
let renderingOperation = 0;
let renderingBusy = false;
let renderingPaused = false;
let lastBinding: GridBindResult | null = null;
let completionHistory: object[] = [];
let pingCount = 0;
let beforeRows = 0;
let boundRows = 0;
let activeRowBindings = 0;
let rowClicks = 0;
const detailChanges = new EventTarget();
const detailDialog = find<HTMLDialogElement>("[data-detail-dialog]");
const detailHost = find<HTMLElement>("[data-detail-inline-host]");
const detailTemplate = find<HTMLTemplateElement>("[data-detail-template]");
const detailPage = employeeDetail(() => detailTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement);
let inlineDetail: PageHandle | null = null;
let popupDetail: PopupHandle<unknown> | null = null;
const employeeParsers = { salary: (value: string) => value.trim() ? Number(value) : undefined };

function employeeRules(): RuleSet {
  return {
    format: { displayName: value => value.toUpperCase() },
    validate: { payAtLeast: (value, args) => Number(value) >= Number(args[0]) },
    messages: { payAtLeast: "Salary must be at least {0}." }, locale: locale.value
  };
}

function reportDetail(cause: unknown): void {
  if (cause instanceof Error && cause.name === "AbortError") return;
  status.textContent = cause instanceof Error ? cause.message : String(cause);
}

function restoreDetailFocus(opener: HTMLButtonElement): void {
  if (document.querySelector("dialog[open]")) return;
  if (opener.isConnected && !opener.disabled) opener.focus({ preventScroll: true });
  else scrollRoot.focus({ preventScroll: true });
}

function stopDetails(): void {
  const page = inlineDetail;
  inlineDetail = null;
  void page?.dispose().catch(reportDetail);
  void popupDetail?.dispose().catch(reportDetail);
}

function disposeGrid(): void {
  renderingGeneration++;
  renderingOperation++;
  renderingBusy = false;
  renderingPaused = false;
  lastBinding = null;
  stopDetails();
  stopGridEvents();
  const current = grid;
  grid = null;
  current?.dispose();
  inspectedId = null;
}

function openDetail(id: number, place: "inline" | "popup", opener: HTMLButtonElement): void {
  if (!grid || rows.get(id)?.status === "delete") return;
  opener.focus({ preventScroll: true });
  const input = {
    rows, grid, id, scope: "filtered" as GridRowScope,
    rules: employeeRules(), parse: employeeParsers, viewChanges: detailChanges,
    viewChanged() { requestedPage = grid?.page()?.page ?? 1; refresh(); }
  };
  try {
    if (place === "inline") {
      const previous = inlineDetail;
      if (previous) {
        if (previous.root && !previous.root.dispatchEvent(new Event("detail-replace", { cancelable: true }))) return;
        if (inlineDetail !== previous) return;
        void previous.dispose().then(() => {
          if (inlineDetail === previous) { inlineDetail = null; openDetail(id, place, opener); }
        }).catch(reportDetail);
        return;
      }
      let page: PageHandle;
      page = mountPage(detailHost, detailPage, { ...input, close() {
        if (inlineDetail === page) inlineDetail = null;
        void page.dispose().then(() => restoreDetailFocus(opener), reportDetail);
      } });
      inlineDetail = page;
      void page.ready.catch(reportDetail);
      return;
    }
    if (popupDetail) return;
    const opened = openPopup(detailDialog, detailPage, { ...input, dialog: detailDialog,
      close() { void opened.close().catch(reportDetail); } });
    popupDetail = opened;
    void opened.ready.catch(reportDetail);
    void opened.result.catch(reportDetail).finally(() => {
      if (popupDetail === opened) popupDetail = null;
      restoreDetailFocus(opener);
    });
  } catch (cause) { reportDetail(cause); }
}

function refreshRowResources(): void {
  rowResourcesState.textContent = JSON.stringify({ before: beforeRows, bound: boundRows, active: activeRowBindings, clicks: rowClicks }, null, 2);
}

function refresh(): void {
  const id = grid?.selected() ?? null;
  const row = id === null ? null : rows.get(id) ?? null;
  if (inspectedId !== null && !rows.get(inspectedId)) inspectedId = null;
  const snapshotId = inspectedId ?? id;
  const inspected = snapshotId === null ? null : rows.get(snapshotId) ?? null;
  const page = grid?.page() ?? null;
  selection.textContent = row ? `Selected RowId ${id}: ${row.value.name}` : "No row selected";
  snapshot.textContent = inspected ? JSON.stringify(inspected, null, 2) : "Select a row.";
  originalOutput.textContent = snapshotId === null ? "Select or inspect a loaded row." : JSON.stringify(rows.original(snapshotId) ?? null, null, 2);
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
  refreshFilterState();
  refreshViewport();
  refreshColumns();
  detailChanges.dispatchEvent(new Event("change"));
  refreshRendering();
  if (grid && !renderingBusy && !renderingPaused) void continueBinding(grid, false, renderingMode.value === "all");
}

function refreshFilterState(): void {
  filterState.textContent = grid ? JSON.stringify({
    team: grid.columnFilter("team"), active: grid.columnFilter("active"), choices: grid.filterChoices("team", filterSearch.value)
  }, null, 2) : "Grid unbound; column filters cleared.";
  const choices = grid?.filterChoices("team") ?? [];
  const picked = grid?.columnFilter("team") ?? null;
  filterCount.value = `${picked === null ? choices.length : choices.filter(choice => picked.includes(choice.value)).length} / ${choices.length}`;
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
    columnCount.value = "Grid unbound";
    return;
  }
  const columns = grid.columns();
  columnState.textContent = JSON.stringify(columns, null, 2);
  for (const input of columnChoices) input.checked = !columns.find(column => column.key === input.dataset.visibleColumn)!.hidden;
  const shown = columnChoices.filter(input => input.checked).length;
  columnAll.checked = shown === columnChoices.length;
  columnAll.indeterminate = shown > 0 && shown < columnChoices.length;
  columnCount.value = `${shown} / ${columnChoices.length}`;
  const index = columns.findIndex(column => column.key === columnChoice.value);
  const column = columns[index];
  columnWidth.value = column.width === undefined ? "" : String(column.width);
  columnHidden.checked = column.hidden === true;
  columnHidden.disabled = column.key === "actions";
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

function refreshRendering(): void {
  if (lastBinding) {
    const { event, ...values } = lastBinding;
    renderingCurrent.textContent = JSON.stringify({ ...values, event: event?.type ?? null }, null, 2);
  } else renderingCurrent.textContent = grid ? "Awaiting the current chunk." : "Grid unbound.";
  const unfinished = lastBinding?.last === false;
  for (const action of ["next", "resume"]) {
    const button = find<HTMLButtonElement>('[data-render-action="' + action + '"]');
    const unavailable = !unfinished || (action === "resume" ? !renderingPaused : renderingPaused);
    button.disabled = !grid || !renderingBusy && unavailable;
    button.setAttribute("aria-disabled", String(button.disabled || renderingBusy));
  }
  find<HTMLButtonElement>('[data-render-action="cancel"]').disabled = !grid || !renderingBusy;
}

async function continueBinding(current: GridHandle<Employee>, more: boolean, automatic: boolean): Promise<void> {
  if (current !== grid || renderingBusy) return;
  const generation = renderingGeneration, operation = ++renderingOperation;
  const live = () => current === grid && generation === renderingGeneration && operation === renderingOperation;
  renderingBusy = true;
  renderingPaused = false;
  renderingNotice.value = "Binding a loaded prefix. Ping and Cancel remain available.";
  refreshRendering();
  let pending: Promise<GridBindResult> | undefined;
  try {
    pending = more ? current.renderMore() : current.whenBound();
    let result = await pending;
    while (live()) {
      lastBinding = result;
      if (!automatic || result.last) break;
      pending = current.renderMore();
      result = await pending;
    }
    if (!live()) return;
    renderingNotice.value = result.last
      ? "Full logical page available: " + result.available + " records, " + result.mounted + " mounted widgets."
      : "Available prefix " + result.available + " of " + result.visible + "; " + result.mounted + " mounted widgets. Next continues loaded data.";
  } catch (cause) {
    if (!live()) return;
    if (cause instanceof Error && cause.name === "AbortError" && current.whenBound() !== pending) {
      renderingBusy = false;
      void continueBinding(current, false, automatic);
      return;
    }
    lastBinding = current.cancelBinding();
    renderingPaused = !lastBinding.last;
    renderingNotice.value = cause instanceof Error && cause.name === "AbortError"
      ? "Binding canceled; the admitted prefix is retained."
      : "Binding failed: " + (cause instanceof Error ? cause.message : String(cause)) + ". Resume retries unfinished work.";
  } finally {
    if (live()) { renderingBusy = false; refreshRendering(); refreshViewport(); }
  }
}

function bind(): void {
  const generation = ++renderingGeneration;
  renderingOperation++;
  renderingBusy = false;
  renderingPaused = false;
  lastBinding = null;
  completionHistory = [];
  renderingHistory.textContent = "[]";
  bindState.textContent = "No completed chunk for the current binding.";
  const initialPage = initialPageChoice.value
    ? { page: initialPageChoice.value === "second" ? 2 : 1, size: 2 }
    : undefined;
  find<HTMLInputElement>("[data-check-all]").disabled = false;
  grid = bindGrid(table, {
    rows,
    statusFilter: statusViews[statusFilter.value],
    progressive: renderingMode.value === "immediate" ? undefined
      : { size: Number(renderingSize.value), delay: Number(renderingDelay.value) },
    beforeRowBind: rowResources.checked ? context => {
      beforeRows++;
      for (const element of context.elements) element.dataset.demoBefore = String(context.row.id);
      context.own(() => { for (const element of context.elements) delete element.dataset.demoBefore; });
      refreshRowResources();
    } : undefined,
    onRowBind(context) {
      for (const element of context.elements) eventRows.set(element, context.row.id);
      context.own(() => { for (const element of context.elements) eventRows.delete(element); });
      if (renderingMode.value !== "immediate" && renderingFail.checked) {
        renderingFail.checked = false;
        throw new Error("The authored demo failed one row binding; Resume retries it.");
      }
      const changedFields = new Set(context.elements.flatMap(element =>
        [...element.querySelectorAll<HTMLElement>('[data-field][data-field-changed="true"]')]
          .map(field => field.getAttribute("data-field")!)));
      for (const element of context.elements) {
        const label = element.querySelector<HTMLElement>("[data-demo-row-status]");
        if (label) label.textContent = `Status: ${context.row.status}`;
        const changed = element.querySelector<HTMLElement>("[data-demo-changed-fields]");
        if (changed) changed.textContent = changedFields.size ? `Changed fields: ${[...changedFields].join(", ")}` : "No changed loaded fields.";
        const undo = element.querySelector<HTMLButtonElement>('[data-row-action="undo"]');
        if (undo) undo.disabled = context.row.status === "clean";
        for (const action of element.querySelectorAll<HTMLButtonElement>('[data-row-action^="detail-"]')) {
          action.disabled = context.row.status === "delete";
        }
      }
      if (!rowResources.checked) return;
      boundRows++; activeRowBindings++;
      const onClick = () => { rowClicks++; refreshRowResources(); };
      for (const element of context.elements) element.addEventListener("click", onClick);
      context.own(() => {
        for (const element of context.elements) element.removeEventListener("click", onClick);
        activeRowBindings--; refreshRowResources();
      });
      refreshRowResources();
    },
    onBind(result) {
      if (generation !== renderingGeneration) return;
      lastBinding = result;
      const snapshot = { calls: ++bindCalls, event: result.event?.type ?? null,
        total: result.total, filtered: result.filtered, visible: result.visible, mounted: result.mounted,
        available: result.available, first: result.first, last: result.last };
      bindState.textContent = JSON.stringify(snapshot);
      completionHistory = [...completionHistory.slice(-11), snapshot];
      renderingHistory.textContent = JSON.stringify(completionHistory, null, 2);
      queueMicrotask(() => {
        if (generation !== renderingGeneration) return;
        refreshFilterState(); refreshRendering(); refreshViewport();
      });
    },
    viewport: viewportChoice.checked ? { root: scrollRoot, estimate: 150, overscan: 3 } : undefined,
    heightResize: { root: scrollRoot, handle: find<HTMLButtonElement>("[data-resize-height]"), min: 160, max: 800 },
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
    toggleSelection: toggleSelection.checked,
    selectOnRowClick: selectOnRowClick.checked,
    checkMode: checkMode.value as "multiple" | "single",
    validateOn: validateOn.value as "change" | "blur" | "manual",
    revealInvalid: revealInvalid.checked && !lastInvalid.checked,
    canSelect: disableInactive.checked ? row => row.value.active : undefined,
    canCheck: disableInactive.checked ? row => row.value.active : undefined,
    sorts: { name: (a, b) => a.name.localeCompare(b.name), salary: (a, b) => a.salary - b.salary },
    filters: { team: { value: row => row.profile.team },
      active: { value: row => row.active, label: value => value === true ? "Active" : "Inactive" } },
    rules: employeeRules(),
    parse: employeeParsers,
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
      inspectedId = null;
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
      if (action === "detail-inline" || action === "detail-popup") {
        openDetail(id, action === "detail-inline" ? "inline" : "popup", element);
        return;
      }
      if (action === "undo") rows.revert(id);
      if (action === "inspect") inspectedId = id;
      actionCallback.textContent = `${action}: RowId ${id}, ${row.value.name}, control ${element.tagName.toLowerCase()}, event ${event.type}`;
      refresh();
    },
    onColumnsChange({ columns, event }) {
      columnCallback.textContent = `${columns.filter(column => !column.hidden).length} visible, event ${event?.type ?? "programmatic"}`;
      columnState.textContent = JSON.stringify(columns, null, 2);
      if (grid) refreshColumns();
    }
  });
  const events = new AbortController();
  stopGridEvents = () => events.abort();
  const observe = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest("table") !== table) return;
    const element = target.closest("tr");
    const id = element ? eventRows.get(element) : undefined;
    const row = id === undefined ? undefined : rows.get(id);
    if (row) postEdit.textContent = JSON.stringify({ event: event.type, id: row.id,
      field: target.getAttribute("data-field"), status: row.status, value: row.value });
  };
  table.addEventListener("input", observe, { signal: events.signal });
  table.addEventListener("change", observe, { signal: events.signal });
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
  scrollRoot.removeEventListener("scroll", onScroll);
  scrollRoot.addEventListener("scroll", onScroll, { passive: true });
  void continueBinding(grid, false, renderingMode.value === "all");
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
  if (lastInvalid.checked && grid && !result.valid) {
    const invalid = new Set(result.issues.map(issue => issue.rowId));
    revealOnPage(grid.rowIds("visible").filter(id => invalid.has(id)).at(-1), "center");
  }
}

function revealOnPage(id: RowId | undefined, block: ScrollLogicalPosition): void {
  if (id !== undefined && grid?.rowIds("visible").includes(id)) {
    grid.reveal(id, { block });
    requestAnimationFrame(refreshViewport);
  }
}

function identities(handle: GridHandle<Employee>) {
  return { active: handle.selected(), selected: handle.selectedIds(), checked: handle.checkedIds() };
}

function sameIds(left: readonly RowId[], right: readonly RowId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function revealCommitted(id: RowId | undefined,
  expected: { active: RowId | null; selected: readonly RowId[]; checked: readonly RowId[] },
  block: ScrollLogicalPosition = "center"): void {
  if (actionScroll.checked && grid && grid.selected() === expected.active &&
      sameIds(grid.selectedIds(), expected.selected) && sameIds(grid.checkedIds(), expected.checked)) revealOnPage(id, block);
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
      grid.reveal(row.id, { block: revealBlock.value as ScrollLogicalPosition });
      status.textContent = `Revealed RowId ${row.id}; selection unchanged.`;
      requestAnimationFrame(refreshViewport);
      return;
    }
    case "paste": grid.paste(pasteText.value, { id: selectedId(), field: pasteField.value }); return;
    case "show-columns": columnChooser.open = true; columnChooser.querySelector("summary")!.focus(); return;
    case "apply-columns": {
      const width = columnWidth.value.trim();
      grid.setColumns(grid.columns().map(column => column.key === columnChoice.value
        ? { key: column.key, ...(width ? { width: Number(width) } : {}), hidden: column.key === "actions" ? false : columnHidden.checked }
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
        columns.find(column => column.key === "salary")!, columns.find(column => column.key === "actions")!]);
      break;
    }
    case "reset-columns": grid.setColumns(initialColumns); break;
    case "invalid-columns": grid.setColumns([...grid.columns(), grid.columns()[0]]); break;
    case "empty-team-filter":
    case "no-team-values": grid.setColumnFilter("team", []); break;
    case "all-team-values":
      grid.setColumnFilter("team", null);
      filterSearch.value = ""; filterSearch.dispatchEvent(new Event("input", { bubbles: true }));
      break;
    case "previous": requestedPage = (grid.page()?.page ?? 1) - 1; applyPage(); return;
    case "next": requestedPage = (grid.page()?.page ?? 1) + 1; applyPage(); return;
    case "select-first": {
      const before = identities(grid), id = rows.entries()[0]?.id;
      grid.select(id ?? null);
      revealCommitted(id, { ...before, active: id ?? null });
      break;
    }
    case "clear-selection": grid.select(null); break;
    case "clear-multiple": grid.setSelected([]); break;
    case "select-first-two": {
      const before = identities(grid);
      const ids = rows.entries().filter(row => !disableInactive.checked || row.value.active).slice(0, 2).map(row => row.id);
      grid.setSelected(ids);
      revealCommitted(ids.at(-1), { ...before, selected: ids });
      break;
    }
    case "check-all":
    case "uncheck-all": {
      const before = identities(grid), scope = checkScope.value as GridRowScope;
      const ids = grid.rowIds(scope).filter(id => {
        const row = rows.get(id)!;
        return row.status !== "delete" && (!disableInactive.checked || row.value.active);
      });
      const checked = action === "check-all";
      const next = new Set(before.checked);
      if (checked && checkMode.value === "single" && ids.length) next.clear();
      for (const id of ids) { if (checked) next.add(id); else next.delete(id); }
      const expected = rows.entries().filter(row => next.has(row.id)).map(row => row.id);
      grid.checkAll(checked, scope);
      revealCommitted(ids.at(-1), { ...before, checked: expected });
      break;
    }
    case "check-selected": {
      const before = identities(grid);
      grid.setChecked(before.selected);
      revealCommitted(before.selected.at(-1), { ...before, checked: before.selected });
      break;
    }
    case "clear-checks": grid.setChecked([]); break;
    case "validate-selected": showValidation(grid.validate(selectedId())); return;
    case "validate-all": showValidation(grid.validate()); return;
    case "defaults": defaultsOutput.textContent = JSON.stringify(grid.defaults(), null, 2); break;
    case "create-defaults":
    case "add":
    case "add-first":
    case "insert-before": {
      const before = identities(grid);
      const target = action === "insert-before" ? selectedId() : action === "add-first" ? rows.entries()[0]?.id : undefined;
      let value = employee(rows.entries().length);
      if (action === "create-defaults") {
        const defaults = grid.defaults();
        defaultsOutput.textContent = JSON.stringify(defaults, null, 2);
        value = employeeFromDefaults(defaults, rows.entries({ includeDeleted: true }).length);
      }
      const id = rows.add(value, target);
      grid.select(id);
      revealCommitted(id, { ...before, active: id }, action === "insert-before" ? "center" : action === "add-first" ? "start" : "end");
      break;
    }
    case "append": {
      const prior = rows.entries({ includeDeleted: true }).length;
      const ids = rows.append([employee(prior), employee(prior + 1)]);
      if (actionScroll.checked && prior > 0) {
        const visible = grid.rowIds("visible");
        revealOnPage(ids.filter(id => visible.includes(id)).at(-1), "end");
      }
      break;
    }
    case "refresh": grid.refresh(); break;
    case "copy-before":
    case "copy-end": {
      const before = identities(grid), source = selectedId();
      const id = rows.copy(source, action === "copy-before" ? source : undefined);
      grid.select(id);
      revealCommitted(id, { ...before, active: id }, action === "copy-before" ? "center" : "end");
      break;
    }
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
    case "dispose": disposeGrid(); status.textContent = "Grid disposed; Rows is still available."; break;
    default: return;
  }
  if (action !== "dispose") status.textContent = `${action} applied.`;
  refresh();
}

document.addEventListener("click", event => {
  const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-action]") : null;
  if (!button) {
    if (event.target instanceof Element && table.contains(event.target)) {
      if (event.target.closest("[data-select-row]")) inspectedId = null;
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
function onScroll(): void {
  requestAnimationFrame(() => {
    refreshViewport();
    if (renderingMode.value !== "immediate" && grid && !renderingBusy && !renderingPaused) {
      void continueBinding(grid, false, renderingMode.value === "all");
    }
  });
  if (renderingMode.value !== "prefix" || !grid || renderingBusy || renderingPaused || lastBinding?.last !== false) return;
  if (scrollRoot.clientHeight > 0 && scrollRoot.scrollHeight > scrollRoot.clientHeight &&
      scrollRoot.scrollTop + scrollRoot.clientHeight >= scrollRoot.scrollHeight - 2) {
    void continueBinding(grid, true, false);
  }
}
renderingControls.addEventListener("click", event => {
  const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-render-action]") : null;
  if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;
  if (button.dataset.renderAction === "ping") { renderingPing.value = String(++pingCount); return; }
  if (!grid) return;
  if (button.dataset.renderAction === "cancel") {
    renderingOperation++;
    lastBinding = grid.cancelBinding();
    renderingBusy = false;
    renderingPaused = !lastBinding.last;
    renderingNotice.value = "Canceled at prefix " + lastBinding.available + "; completion last=" + lastBinding.last + ". Resume retains Rows and drafts.";
    refreshRendering(); refreshViewport();
    return;
  }
  void continueBinding(grid, true, renderingMode.value === "all");
});
for (const control of [renderingMode, renderingSize, renderingDelay]) {
  control.addEventListener("change", () => {
    try { disposeGrid(); bind(); refresh(); }
    catch (cause) { status.textContent = cause instanceof Error ? cause.message : String(cause); refreshRendering(); }
  });
}
for (const control of [viewportChoice, datasetChoice]) {
  control.addEventListener("change", () => {
    disposeGrid();
    scrollRoot.toggleAttribute("data-viewport-enabled", viewportChoice.checked);
    if (control === datasetChoice) rows.replace(Array.from({ length: Number(datasetChoice.value) }, (_, index) => employee(index)));
    scrollRoot.scrollTop = 0;
    bind();
    status.textContent = "Viewport or dataset changed; selection, checks and uncommitted edits were cleared.";
    requestAnimationFrame(refreshViewport);
  });
}
for (const control of [selectionMode, toggleSelection, selectOnRowClick, disableInactive]) {
  control.addEventListener("change", () => {
    if (grid) { disposeGrid(); bind(); }
    status.textContent = "Selection policy changed; selection, checks and uncommitted edits were cleared. Valid Rows changes remain.";
    refresh();
  });
}
for (const control of [checkMode, validateOn, revealInvalid, lastInvalid]) {
  control.addEventListener("change", () => {
    if (grid) { disposeGrid(); bind(); }
    status.textContent = "Check or validation policy changed; selection, checks and uncommitted edits were cleared. Valid Rows changes remain.";
    refresh();
  });
}
columnChoice.addEventListener("change", refreshColumns);
columnChooser.addEventListener("change", event => {
  const input = event.target;
  if (!grid || !(input instanceof HTMLInputElement) || input.disabled ||
      !input.matches("[data-visible-column], [data-column-all]")) return;
  const key = input.dataset.visibleColumn;
  try {
    grid.setColumns(grid.columns().map(column => column.key === "actions" ? { ...column, hidden: false }
      : key === undefined || column.key === key ? { ...column, hidden: !input.checked } : column));
    status.textContent = "Column visibility applied; Actions remains available.";
  } catch (cause) { status.textContent = cause instanceof Error ? cause.message : String(cause); }
  finally { refreshColumns(); }
});
filter.addEventListener("change", () => { applyFilter(); requestedPage = 1; applyPage(); });
statusFilter.addEventListener("change", () => {
  grid?.setStatusFilter(statusViews[statusFilter.value]);
  refresh();
});
rowResources.addEventListener("change", () => {
  if (grid) { disposeGrid(); bind(); }
  status.textContent = "Row resource tracking changed; selection, checks and drafts were cleared.";
  refreshRowResources();
  refresh();
});
size.addEventListener("change", () => { initialPageChoice.value = ""; requestedPage = 1; applyPage(); });
initialPageChoice.addEventListener("change", () => {
  size.value = initialPageChoice.value ? "2" : "";
  requestedPage = 1;
  disposeGrid();
  bind();
  status.textContent = "Initial page changed; selection and uncommitted edits were cleared. Valid Rows changes remain.";
  refresh();
});
locale.addEventListener("change", () => {
  if (grid) { disposeGrid(); bind(); }
  status.textContent = "Locale changed; selection and uncommitted edits were cleared. Blank Team shows the new rule message.";
  refresh();
});
type BlockRecord = {
  readonly code: string;
  readonly department: string;
  readonly team: string;
  readonly name: string;
  readonly notes: string;
  readonly assignment: Employee["assignment"] & { readonly selected: readonly number[] };
  readonly mode: string | null;
  readonly channels: readonly string[];
  readonly date: string;
  readonly hours: number;
  readonly avatar: string;
};

const avatar = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#dce9f7"/><circle cx="16" cy="11" r="5" fill="#315f91"/><path d="M6 29v-4a10 10 0 0 1 20 0v4" fill="#315f91"/></svg>');
const blockValues: readonly BlockRecord[] = Array.from({ length: 4 }, (_, index) => {
  const value = employee(index);
  return { code: `R${index + 1}`, department: index < 3 ? "Engineering" : "Operations",
    team: index === 2 ? "Support" : "Platform", name: value.name, notes: value.notes,
    assignment: { ...value.assignment, selected: value.assignment.chosen === null ? [] : [value.assignment.chosen] },
    mode: index % 2 ? "office" : "remote", channels: ["email"], date: "2026-10-20", hours: 8, avatar };
});
const blockRows = createRows(blockValues);
const blockRoot = find<HTMLElement>("[data-block-demo]");
const blockStatus = find<HTMLOutputElement>("[data-block-status]");
const blockState = find<HTMLElement>("[data-block-state]");
const blockDepartment = find<HTMLInputElement>("[data-block-department]");
const blockTeam = find<HTMLInputElement>("[data-block-team]");
let blockId: number | null = null;

function refreshBlocks(): void {
  const record = blockId === null ? undefined : blockRows.get(blockId);
  for (const control of blockRoot.querySelectorAll<HTMLButtonElement | HTMLInputElement>("[data-block-needs-selection]")) {
    control.disabled = !record;
  }
  if (record) { blockDepartment.value = record.value.department; blockTeam.value = record.value.team; }
  blockState.textContent = JSON.stringify({ selected: blockId, records: blockRows.entries() }, null, 2);
}

const blockGrids = [...blockRoot.querySelectorAll<HTMLTableElement>("[data-block-grid]")].map(element => bindGrid(element, {
  rows: blockRows,
  paste: true,
  parse: { hours: Number },
  render: {
    team(value) {
      const label = document.createElement("strong");
      label.textContent = String(value ?? "");
      return label;
    }
  },
  onSelect({ id, row }) {
    blockId = id;
    blockStatus.textContent = row ? `Selected RowId ${id}: ${row.value.name}. Store actions update both layouts.`
      : "Select a record in either layout.";
    refreshBlocks();
  },
  onRowAction({ id, row }) { blockStatus.textContent = `Inspect RowId ${id}: ${row.value.name}, ${row.value.notes}`; }
}));
const stopBlocks = blockRows.subscribe(event => {
  blockStatus.textContent = `${event.type} updated both layouts.`;
  refreshBlocks();
});

blockRoot.addEventListener("click", event => {
  const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("[data-block-action]") : null;
  if (!button) return;
  try {
    if (button.dataset.blockAction === "reset") { blockId = null; blockRows.replace(blockValues); return; }
    if (blockId === null) throw new Error("Select a record in either layout first.");
    switch (button.dataset.blockAction) {
      case "keys": blockRows.setMany([{ id: blockId, values: { department: blockDepartment.value, team: blockTeam.value } }]); break;
      case "first": blockRows.move(blockId, blockRows.entries()[0]?.id); break;
      case "last": blockRows.move(blockId); break;
      case "copy": {
        const id = blockRows.copy(blockId);
        blockRows.set(id, "code", `R${id}`);
        blockGrids[0].select(id);
        break;
      }
    }
  } catch (cause) { blockStatus.textContent = cause instanceof Error ? cause.message : String(cause); }
});
refreshBlocks();

window.addEventListener("pagehide", () => {
  disposeGrid(); stopRows(); rows.dispose();
  for (const handle of blockGrids) handle.dispose();
  stopBlocks(); blockRows.dispose();
}, { once: true });
bind();
