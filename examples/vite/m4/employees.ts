// SPDX-License-Identifier: Apache-2.0
import { createCommunicator } from "@bbalganjjm/natural_js/comm";
import type { RequestOptions } from "@bbalganjjm/natural_js/comm";
import { createRows } from "@bbalganjjm/natural_js/data";
import type { PageContext } from "@bbalganjjm/natural_js/page";
import { bindForm, bindGrid, bindList, bindPagination, bindSelect } from "@bbalganjjm/natural_js/ui";
import type { FormOptions, ListHandle, PageRequest, ValidationIssue } from "@bbalganjjm/natural_js/ui";

type Employee = {
  id: string;
  name: string;
  email: string;
  salary: number;
  profile: { team: string; department?: string };
  a: { aa?: number; bb?: number }[];
  chosen: number | null;
};

function find<ElementType extends Element>(root: ParentNode, selector: string): ElementType {
  const element = root.querySelector<ElementType>(selector);
  if (!element) throw new Error("Employee HTML needs " + selector);
  return element;
}

const sharedFormOptions: FormOptions<Employee> = {
  rules: {
    validate: {
      companyEmail: value => value.endsWith("@example.com") || "Use a company email."
    }
  },
  parse: {
    salary: value => {
      const parsed = Number(value.replaceAll(",", ""));
      if (!value.trim() || !Number.isFinite(parsed)) throw new Error("Enter a number.");
      return parsed;
    }
  }
};

export function createEmployees({ root, signal, own, input }: PageContext<{ close(): void }>) {
  const session = crypto.randomUUID();
  const endpoint = (name: string) => "employees/" + name + "?session=" + encodeURIComponent(session);
  const comm = createCommunicator({ baseURL: new URL("/api/", document.baseURI) });
  let pendingRequests = 0;
  let busyBefore: string | null | undefined;
  function restoreRequestBusy(): void {
    const before = busyBefore;
    busyBefore = undefined;
    if (before === undefined) return;
    if (before === null) root.removeAttribute("aria-busy");
    else root.setAttribute("aria-busy", before);
  }
  own(restoreRequestBusy);

  async function request<Result>(options: RequestOptions<Result>): Promise<Result> {
    const first = pendingRequests++ === 0;
    try {
      signal.throwIfAborted();
      if (first) {
        busyBefore = root.getAttribute("aria-busy");
        root.setAttribute("aria-busy", "true");
      }
      const { signal: callerSignal, ...prepared } = options;
      return await comm.request<Result>({
        ...prepared,
        signal: callerSignal ? AbortSignal.any([signal, callerSignal]) : signal
      });
    } finally {
      pendingRequests--;
      if (pendingRequests === 0 && !signal.aborted) restoreRequestBusy();
    }
  }
  const rows = createRows<Employee>();
  own(() => rows.dispose());

  const searchRoot = find<HTMLFormElement>(root, '[data-role="search"]');
  const detailRoot = find<HTMLFormElement>(root, '[data-role="detail"]');
  const table = find<HTMLTableElement>(root, '[data-role="grid"]');
  const listRoot = find<HTMLUListElement>(root, '[data-role="list"]');
  const pagerRoot = find<HTMLElement>(root, '[data-role="pager"]');
  const pageSizeRoot = find<HTMLSelectElement>(root, '[data-role="page-size"]');
  const filterInput = find<HTMLInputElement>(root, '[data-role="filter"]');
  const status = find<HTMLOutputElement>(root, '[data-role="status"]');
  const error = find<HTMLOutputElement>(root, '[data-role="error"]');
  const selected = find<HTMLOutputElement>(root, '[data-role="selected"]');
  const sortHeader = find<HTMLTableCellElement>(root, 'th[aria-sort]');

  const search = bindForm(searchRoot);
  own(() => search.dispose());
  find<HTMLButtonElement>(searchRoot, '[data-action="restore-search"]').addEventListener("click", () => {
    search.unbind();
    search.refresh();
  }, { signal });
  const detail = bindForm(detailRoot, {
    ...sharedFormOptions,
    rows,
    onBind({ row }) {
      selected.textContent = "Selected: " + row.value.name;
    }
  });
  own(() => detail.dispose());
  const departmentFields = find<HTMLElement>(detailRoot, '[data-role="department-fields"]');
  const departmentHost = departmentFields.parentElement!;
  const departmentNext = departmentFields.nextSibling;
  const departmentToggle = find<HTMLButtonElement>(detailRoot, '[data-action="toggle-department"]');
  departmentToggle.addEventListener("click", () => {
    const visible = departmentHost.contains(departmentFields);
    if (visible) departmentFields.remove();
    else departmentHost.insertBefore(departmentFields, departmentNext);
    detail.rescan();
    if (!visible) detail.refresh(["profile.department"]);
    departmentToggle.setAttribute("aria-expanded", String(!visible));
    departmentToggle.textContent = visible ? "Show department" : "Hide department";
  }, { signal });
  let list: ListHandle<Employee>;
  const grid = bindGrid(table, {
    rows,
    onSelect({ id }) {
      list?.select(id);
      detail.bind(id);
      if (id === null) selected.textContent = "No employee selected";
    }
  });
  own(() => grid.dispose());
  list = bindList(listRoot, {
    rows,
    onSelect({ id }) { grid.select(id); }
  });
  own(() => list.dispose());

  let pageRequest: PageRequest = { page: 1, size: 5 };
  const pageSize = bindSelect(pageSizeRoot, {
    choices: [{ label: "2", value: 2 }, { label: "5", value: 5 }],
    value: 5,
    onChange(value) {
      if (typeof value === "number") applyPage({ page: 1, size: value });
    }
  });
  own(() => pageSize.dispose());
  const pagination = bindPagination(pagerRoot, {
    state: { page: 1, size: 5, total: 0 },
    onPage(request) { applyPage(request); }
  });
  own(() => pagination.dispose());

  function applyPage(request: PageRequest): void {
    grid.setPage(request);
    list.setPage(request);
    const state = grid.page()!;
    pageRequest = { page: state.page, size: state.size };
    pagination.set(state);
  }

  function showRow(id: number): void {
    filterInput.value = "";
    grid.setFilter(null);
    list.setFilter(null);
    const ordered = [...rows.entries()];
    if (sortDirection) ordered.sort((a, b) =>
      sortDirection * a.value.name.localeCompare(b.value.name));
    const index = ordered.findIndex(row => row.id === id);
    if (index >= 0) applyPage({ page: Math.floor(index / pageRequest.size) + 1, size: pageRequest.size });
    grid.select(id);
  }

  const unsubscribePage = rows.subscribe(() => applyPage(pageRequest));
  own(unsubscribePage);
  applyPage(pageRequest);

  const lockTargets = [searchRoot, detailRoot, table, listRoot, pagerRoot, pageSizeRoot, filterInput,
    ...root.querySelectorAll<HTMLElement>('[data-action="add"], [data-action="delete"], [data-action="revert"], [data-action="save"]')];
  const initialInert = lockTargets.map(element => element.inert);
  let focusBeforeLock: HTMLElement | null = null;
  function lockEditing(locked: boolean): void {
    if (locked) {
      const focused = root.ownerDocument.activeElement;
      focusBeforeLock = focused instanceof HTMLElement &&
        lockTargets.some(element => element === focused || element.contains(focused)) ? focused : null;
    }
    lockTargets.forEach((element, index) => { element.inert = locked || initialInert[index]; });
    if (!locked) {
      const target = focusBeforeLock;
      focusBeforeLock = null;
      if (!signal.aborted && target?.isConnected) target.focus({ preventScroll: true });
    }
  }

  let searchController: AbortController | undefined;
  let saving = false;
  let sortDirection = 0;
  let nextNew = 1;

  function showFailure(cause: unknown): void {
    if (signal.aborted || cause instanceof Error && cause.name === "AbortError") return;
    error.textContent = cause instanceof Error ? cause.message : String(cause);
  }

  async function load(): Promise<boolean> {
    searchController?.abort();
    const current = new AbortController();
    searchController = current;
    status.textContent = "Loading…";
    error.textContent = "";
    try {
      const values = await request<Employee[]>({
        url: endpoint("search"),
        method: "POST",
        json: search.read(),
        signal: current.signal
      });
      if (signal.aborted || current.signal.aborted) return false;
      pageRequest = { page: 1, size: pageRequest.size };
      rows.replace(values);
      grid.select(null);
      detail.bind(null);
      status.textContent = values.length + " employees";
      return true;
    } catch (cause) {
      if (signal.aborted || current.signal.aborted) return false;
      status.textContent = "Search failed";
      showFailure(cause);
      return false;
    }
  }

  function reportIssue(issue: ValidationIssue): void {
    let target = issue.element;
    if (issue.rowId !== null) {
      showRow(issue.rowId);
      const updated = issue.rule === "select-option"
        ? grid.validate(issue.rowId).issues
        : detail.validate(issue.rowId).issues;
      target = updated.find(item => item.field === issue.field && item.rule === issue.rule)?.element ?? target;
    }
    error.textContent = issue.message;
    if (target?.isConnected) target.focus();
  }

  async function save(): Promise<void> {
    if (saving) return;
    const detailResult = detail.validate();
    if (!detailResult.valid) return reportIssue(detailResult.issues[0]);
    const gridResult = grid.validate();
    if (!gridResult.valid) return reportIssue(gridResult.issues[0]);
    const changes = rows.changes();
    if (!changes.length) {
      status.textContent = "No changes";
      return;
    }
    for (const change of changes) {
      if (change.status === "delete") continue;
      const validation = detail.validate(change.id);
      if (!validation.valid) return reportIssue(validation.issues[0]);
      const choice = grid.validate(change.id);
      if (!choice.valid) return reportIssue(choice.issues[0]);
    }

    saving = true;
    searchController?.abort();
    lockEditing(true);
    error.textContent = "";
    status.textContent = "Saving…";
    try {
      await request<void>({
        url: endpoint("save"),
        method: "POST",
        json: changes.map(({ status, value }) => ({ status, value })),
        decode: () => undefined
      });
      if (signal.aborted) return;
      if (await load()) status.textContent = "Saved";
      else if (!signal.aborted) {
        rows.replace(rows.entries().map(row => structuredClone(row.value) as Employee));
        grid.select(null);
        detail.bind(null);
        status.textContent = "Saved; refresh failed";
      }
    } catch (cause) {
      if (!signal.aborted) {
        status.textContent = "Save failed";
        showFailure(cause);
      }
    } finally {
      saving = false;
      lockEditing(false);
    }
  }

  searchRoot.addEventListener("submit", event => {
    event.preventDefault();
    if (!saving) void load();
  }, { signal });
  filterInput.addEventListener("input", () => {
    const query = filterInput.value.trim().toLowerCase();
    grid.setFilter(query ? row => row.name.toLowerCase().includes(query) : null);
    list.setFilter(query ? row => row.name.toLowerCase().includes(query) : null);
    applyPage({ page: 1, size: pageRequest.size });
  }, { signal });
  find<HTMLButtonElement>(root, '[data-action="sort-name"]').addEventListener("click", () => {
    sortDirection = sortDirection === 1 ? -1 : 1;
    const compare = (left: { readonly name: string }, right: { readonly name: string }) =>
      sortDirection * left.name.localeCompare(right.name);
    grid.setSort(compare, { column: sortHeader, direction: sortDirection === 1 ? "ascending" : "descending" });
    list.setSort(compare);
    applyPage({ page: 1, size: pageRequest.size });
  }, { signal });
  find<HTMLButtonElement>(root, '[data-action="add"]').addEventListener("click", () => {
    const id = rows.add({
      id: "NEW-" + nextNew++, name: "", email: "", salary: 0,
      profile: { team: "", department: "" }, a: [], chosen: null
    });
    showRow(id);
    find<HTMLInputElement>(detailRoot, '[data-field="name"]').focus();
    status.textContent = "New employee";
  }, { signal });
  find<HTMLButtonElement>(root, '[data-action="delete"]').addEventListener("click", () => {
    const id = grid.selected();
    if (id === null) return;
    rows.remove(id);
    status.textContent = "Employee marked for deletion";
  }, { signal });
  find<HTMLButtonElement>(root, '[data-action="revert"]').addEventListener("click", () => {
    rows.revert();
    detail.bind(grid.selected());
    error.textContent = "";
    status.textContent = "Changes reverted";
  }, { signal });
  find<HTMLButtonElement>(root, '[data-action="save"]').addEventListener("click", () => {
    void save();
  }, { signal });
  find<HTMLButtonElement>(root, '[data-action="close"]').addEventListener("click", () => input.close(), { signal });

  return { init: async () => { await load(); } };
}
