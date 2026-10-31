// SPDX-License-Identifier: Apache-2.0
import type { RowId, Rows } from "@bbalganjjm/natural_js/data";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";
import { bindForm } from "@bbalganjjm/natural_js/ui";
import type { FormHandle, GridHandle, GridRowScope, ParseInput, RuleSet } from "@bbalganjjm/natural_js/ui";

export type Employee = {
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

type DetailInput = {
  rows: Rows<Employee>;
  grid: GridHandle<Employee>;
  id: RowId;
  scope: GridRowScope;
  rules: RuleSet;
  parse: Record<string, ParseInput>;
  viewChanges: EventTarget;
  viewChanged(): void;
  close(): void;
  dialog?: HTMLDialogElement;
};

export function employeeDetail(view: () => HTMLElement): PageDefinition<DetailInput> {
  return { view, controller({ root, input, own, signal }) {
    function find<T extends Element>(selector: string): T {
      const element = root.querySelector<T>(selector);
      if (!element) throw new Error("Employee detail HTML needs " + selector);
      return element;
    }
    const formRoot = find<HTMLFormElement>("form");
    const fields = find<HTMLFieldSetElement>("fieldset");
    const choices = root.querySelector<HTMLSelectElement>('[data-field="assignment.chosen"]');
    const scope = find<HTMLSelectElement>("[data-detail-scope]");
    const previous = find<HTMLButtonElement>("[data-detail-previous]");
    const next = find<HTMLButtonElement>("[data-detail-next]");
    const state = find<HTMLOutputElement>("[data-detail-state]");
    const error = find<HTMLOutputElement>("[data-detail-error]");
    let current: RowId | null = null;
    let form: FormHandle<Employee> | undefined;
    let options: Employee["assignment"]["shifts"] | undefined;
    const codes = new Map<string, number>();
    scope.value = input.scope;

    function ids(): readonly RowId[] {
      return input.grid.rowIds(scope.value as GridRowScope)
        .filter(id => input.rows.get(id)?.status !== "delete");
    }

    function updateChoices(id: RowId | null): void {
      if (!choices) return;
      const shifts = id === null ? undefined : input.rows.get(id)?.value.assignment.shifts;
      if (shifts === options) return;
      options = shifts;
      codes.clear();
      const prompt = new Option("Choose a shift", "");
      const items = (shifts ?? []).map(shift => {
        codes.set(String(shift.code), shift.code);
        return new Option(shift.meta.label, String(shift.code));
      });
      choices.replaceChildren(prompt, ...items);
    }

    function refresh(): void {
      if (signal.aborted) return;
      const row = current === null ? undefined : input.rows.get(current);
      if (!row || row.status === "delete") {
        current = null;
        form?.bind(null);
        updateChoices(null);
        delete root.dataset.detailRow;
        fields.disabled = true;
        previous.disabled = next.disabled = true;
        state.textContent = "No current employee. The record was removed or replaced; close and open another row.";
        return;
      }
      fields.disabled = false;
      root.dataset.detailRow = String(current);
      updateChoices(current);
      const available = ids();
      const index = available.indexOf(current!);
      previous.disabled = index <= 0;
      next.disabled = index < 0 || index >= available.length - 1;
      state.textContent = `RowId ${current}: ${row.value.name} · ${index < 0 ? "outside" : `${index + 1} of ${available.length}`} ${scope.value} scope`;
    }

    // Update native choices before Form's subscriber renders shared row changes.
    const unsubscribe = input.rows.subscribe(refresh);
    function cleanup(): void { unsubscribe(); form?.dispose(); }
    own(cleanup);
    signal.addEventListener("abort", cleanup, { once: true });
    form = bindForm(formRoot, { rows: input.rows, rules: input.rules,
      parse: { ...input.parse, ...(choices ? { "assignment.chosen": (value: string) => value === "" ? null : codes.get(value) } : {}) } });

    function showFailure(cause: unknown): void {
      error.textContent = cause instanceof Error ? cause.message : String(cause);
    }

    function bind(id: RowId): void {
      if (signal.aborted) return;
      const row = input.rows.get(id);
      if (!row || row.status === "delete") { refresh(); return; }
      updateChoices(id);
      form!.bind(id);
      if (signal.aborted) return;
      current = id;
      error.textContent = "";
      refresh();
    }

    function valid(): boolean {
      if (current === null) return true;
      if (!input.rows.get(current) || input.rows.get(current)!.status === "delete") {
        refresh();
        return true;
      }
      const result = form!.validate(current);
      if (signal.aborted) return false;
      refresh();
      error.textContent = result.valid ? "" : result.issues[0]?.message ?? "Correct the current employee.";
      if (!result.valid) result.issues.find(issue => issue.element?.isConnected)?.element?.focus();
      return result.valid;
    }

    function navigate(step: -1 | 1): void {
      try {
        if (!valid() || current === null) return;
        const available = ids();
        const index = available.indexOf(current);
        const target = index < 0 ? undefined : available[index + step];
        if (target === undefined) { refresh(); return; }
        if (scope.value === "filtered") {
          const page = input.grid.page();
          const rawIndex = input.grid.rowIds("filtered").indexOf(target);
          if (page && rawIndex >= 0) {
            input.grid.setPage({ page: Math.floor(rawIndex / page.size) + 1, size: page.size });
            input.viewChanged();
          }
        }
        bind(target);
        if (!signal.aborted && input.grid.rowIds("visible").includes(target)) {
          input.grid.reveal(target, { block: "center" });
        }
      } catch (cause) { showFailure(cause); }
    }

    function close(event?: Event): void {
      try {
        if (!valid()) { event?.preventDefault(); return; }
        if (!event) input.close();
      } catch (cause) { event?.preventDefault(); showFailure(cause); }
    }

    previous.addEventListener("click", () => navigate(-1), { signal });
    next.addEventListener("click", () => navigate(1), { signal });
    scope.addEventListener("change", refresh, { signal });
    find<HTMLButtonElement>("[data-detail-close]").addEventListener("click", () => close(), { signal });
    input.dialog?.addEventListener("cancel", close, { signal });
    root.addEventListener("detail-replace", close, { signal });
    input.viewChanges.addEventListener("change", refresh, { signal });
    formRoot.addEventListener("submit", event => event.preventDefault(), { signal });
    return { init() { bind(input.id); } };
  } };
}
