// SPDX-License-Identifier: Apache-2.0
import type { RowId, RowSnapshot, Rows, Snapshot } from "../data/index.js";
import { FrameworkError } from "../internal/framework-error.js";
import { parsePath, readPath, writePath } from "./field-path.js";
import type { GridHandle, RuleSet, ValidationIssue, ValidationResult } from "./index.js";

interface TextField {
  index: number;
  path: readonly string[];
}

interface SelectField {
  index: number;
  field?: readonly string[];
  options?: readonly string[];
  label?: readonly string[];
  value?: readonly string[];
  authored: readonly (string | null)[];
}

interface BoundText {
  descriptor: TextField;
  element: HTMLElement;
  previous?: unknown;
  bound: boolean;
}

interface BoundSelect {
  descriptor: SelectField;
  element: HTMLSelectElement;
  authoredNodes: Node[];
  authoredOptions: HTMLOptionElement[];
  rawByOption: Map<HTMLOptionElement, unknown>;
  optionSource?: unknown;
  optionsBound: boolean;
  previous?: unknown;
  selectedBound: boolean;
}

interface RenderedRow<T> {
  element: HTMLTableRowElement;
  snapshot?: RowSnapshot<T>;
  texts: BoundText[];
  selects: BoundSelect[];
  buttons: HTMLButtonElement[];
}

function gridError(code: string, message: string, detail?: Record<string, unknown>): FrameworkError {
  return new FrameworkError({ api: "bindGrid", code, message, detail });
}

function scalar(value: unknown): value is string | number | boolean | null {
  return value === null || typeof value === "string" || typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value));
}

function optionValues(value: unknown, descriptor: SelectField, rowId: RowId): readonly { label: string; raw: string | number | boolean | null }[] {
  if (!descriptor.options) return [];
  const source = readPath(value, descriptor.options);
  if (source == null) return [];
  if (!Array.isArray(source)) {
    throw gridError("GRID_OPTIONS", "A row-local Select needs an array of options.", {
      rowId,
      field: descriptor.options.join(".")
    });
  }
  const result: { label: string; raw: string | number | boolean | null }[] = [];
  for (const item of source) {
    const label = readPath(item, descriptor.label!);
    const raw = readPath(item, descriptor.value!);
    if (!scalar(label) || label === null || label === "" || !scalar(raw)) continue;
    result.push({ label: String(label), raw });
  }
  return result;
}

function display(element: HTMLElement, value: unknown): void {
  const text = value == null ? "" : String(value);
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) element.value = text;
  else element.textContent = text;
}

export function bindGrid<T extends object>(root: HTMLTableElement, options: {
  rows: Rows<T>;
  rules?: RuleSet;
  onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void;
}): GridHandle<T> {
  if (options?.rules !== undefined) {
    throw gridError("GRID_RULES", "Grid rules are scheduled for M5 and are not available in this pilot.");
  }
  if (!root || root.tagName !== "TABLE") {
    throw gridError("GRID_ROOT", "The Grid root must be a table element.");
  }
  const templates = [...root.tBodies].flatMap(body => [...body.rows].filter(row => row.hasAttribute("data-row-template")));
  if (templates.length !== 1) {
    throw gridError("GRID_TEMPLATE", "The Grid needs one tbody row marked data-row-template.");
  }
  const template = templates[0];
  const fixedId = template.hasAttribute("id") ? template : template.querySelector<HTMLElement>("[id]");
  if (fixedId) {
    throw gridError("DUPLICATE_ID", "A repeated row template cannot contain a fixed DOM id.", { id: fixedId.id });
  }

  const textFields: TextField[] = [];
  const selectFields: SelectField[] = [];
  const buttonIndexes: number[] = [];
  const authored = [template, ...template.querySelectorAll<HTMLElement>("*")];
  for (const [index, element] of authored.entries()) {
    if (element.hasAttribute("data-select-row")) {
      if (element.tagName !== "BUTTON") {
        throw gridError("GRID_SELECT", "A row selection control must be a button.");
      }
      buttonIndexes.push(index);
    }
    const fieldName = element.getAttribute("data-field");
    const optionsName = element.getAttribute("data-options");
    if (element.tagName === "SELECT" && (fieldName !== null || optionsName !== null)) {
      const select = element as HTMLSelectElement;
      const labelName = select.getAttribute("data-option-label");
      const valueName = select.getAttribute("data-option-value");
      if (optionsName !== null && (labelName === null || valueName === null)) {
        throw gridError("GRID_OPTIONS", "A row-local Select needs data-option-label and data-option-value.");
      }
      selectFields.push({
        index,
        field: fieldName === null ? undefined : parsePath(fieldName),
        options: optionsName === null ? undefined : parsePath(optionsName),
        label: labelName === null ? undefined : parsePath(labelName),
        value: valueName === null ? undefined : parsePath(valueName),
        authored: [...select.options].map(option => option.value === "" ? null : option.value)
      });
    } else if (fieldName !== null) {
      textFields.push({ index, path: parsePath(fieldName) });
    }
  }

  const anchor = root.ownerDocument.createComment("grid rows");
  template.replaceWith(anchor);
  const records = new Map<RowId, RenderedRow<T>>();
  const rowIds = new WeakMap<HTMLTableRowElement, RowId>();
  const selects = new WeakMap<HTMLSelectElement, { id: RowId; binding: BoundSelect }>();
  let selected: RowId | null = null;
  let sort: ((a: Snapshot<T>, b: Snapshot<T>) => number) | null = null;
  let filter: ((row: Snapshot<T>) => boolean) | null = null;
  let visibleIds: RowId[] = [];
  let disposed = false;

  function active(): void {
    if (disposed) throw gridError("GRID_DISPOSED", "This Grid has been disposed.");
  }

  function createRecord(id: RowId): RenderedRow<T> {
    const element = template.cloneNode(true) as HTMLTableRowElement;
    element.removeAttribute("data-row-template");
    const nodes = [element, ...element.querySelectorAll<HTMLElement>("*")];
    const texts = textFields.map(descriptor => ({
      descriptor,
      element: nodes[descriptor.index],
      bound: false
    }));
    const rowSelects = selectFields.map(descriptor => {
      const element = nodes[descriptor.index] as HTMLSelectElement;
      const binding: BoundSelect = {
        descriptor,
        element,
        authoredNodes: [...element.childNodes],
        authoredOptions: [...element.options],
        rawByOption: new Map(),
        optionsBound: false,
        selectedBound: false
      };
      selects.set(element, { id, binding });
      return binding;
    });
    const buttons = buttonIndexes.map(index => nodes[index] as HTMLButtonElement);
    for (const button of buttons) button.setAttribute("aria-pressed", String(selected === id));
    rowIds.set(element, id);
    return { element, texts, selects: rowSelects, buttons };
  }

  function renderSelect(binding: BoundSelect, value: Snapshot<T>, id: RowId): void {
    const { descriptor, element } = binding;
    const source = descriptor.options ? readPath(value, descriptor.options) : null;
    if (!binding.optionsBound || !Object.is(binding.optionSource, source)) {
      const rawByOption = new Map<HTMLOptionElement, unknown>();
      const children = [...binding.authoredNodes];
      for (const [index, option] of binding.authoredOptions.entries()) {
        rawByOption.set(option, descriptor.authored[index]);
      }
      for (const item of optionValues(value, descriptor, id)) {
        const option = root.ownerDocument.createElement("option");
        option.value = String(item.raw ?? "");
        option.textContent = item.label;
        rawByOption.set(option, item.raw);
        children.push(option);
      }
      element.replaceChildren(...children);
      binding.rawByOption = rawByOption;
      binding.optionSource = source;
      binding.optionsBound = true;
      binding.selectedBound = false;
    }
    if (descriptor.field) {
      const current = readPath(value, descriptor.field);
      if (!binding.selectedBound || !Object.is(binding.previous, current)) {
        element.selectedIndex = [...element.options].findIndex(option =>
          Object.is(binding.rawByOption.get(option), current));
        binding.previous = current;
        binding.selectedBound = true;
      }
    }
  }

  function renderRecord(record: RenderedRow<T>, snapshot: RowSnapshot<T>): void {
    if (record.snapshot === snapshot) return;
    for (const binding of record.texts) {
      const value = readPath(snapshot.value, binding.descriptor.path);
      if (!binding.bound || !Object.is(binding.previous, value)) {
        display(binding.element, value);
        binding.previous = value;
        binding.bound = true;
      }
    }
    for (const binding of record.selects) renderSelect(binding, snapshot.value, snapshot.id);
    record.snapshot = snapshot;
  }

  function updateSelection(id: RowId | null, event: Event | null): void {
    if (id === selected) return;
    const prior = selected;
    selected = id;
    for (const rowId of [prior, id]) {
      if (rowId === null) continue;
      for (const button of records.get(rowId)?.buttons ?? []) {
        button.setAttribute("aria-pressed", String(rowId === id));
      }
    }
    options.onSelect?.({ id, row: id === null ? null : options.rows.get(id) ?? null, event });
  }

  function render(): void {
    if (disposed) return;
    const entries = options.rows.entries();
    const live = new Set(entries.map(row => row.id));
    for (const [id, record] of records) {
      if (!live.has(id)) {
        record.element.remove();
        records.delete(id);
      }
    }
    if (selected !== null && !live.has(selected)) updateSelection(null, null);
    if (disposed) return;
    const displayed = filter ? entries.filter(row => filter!(row.value)) : [...entries];
    if (sort) displayed.sort((left, right) => sort!(left.value, right.value));
    const nextIds = displayed.map(row => row.id);
    for (const snapshot of displayed) {
      let record = records.get(snapshot.id);
      if (!record) {
        record = createRecord(snapshot.id);
        records.set(snapshot.id, record);
      }
      renderRecord(record, snapshot);
    }
    if (nextIds.length !== visibleIds.length || nextIds.some((id, index) => id !== visibleIds[index])) {
      const nextSet = new Set(nextIds);
      const focused = root.ownerDocument.activeElement;
      const focusedRow = focused instanceof Element ? focused.closest("tr") : null;
      const focusedId = focusedRow && rowIds.get(focusedRow);
      const restoreFocus = focused instanceof HTMLElement && focusedId !== undefined &&
        focusedId !== null && nextSet.has(focusedId);
      const selection = restoreFocus &&
        (focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement) &&
        focused.selectionStart !== null && focused.selectionEnd !== null
        ? [focused.selectionStart, focused.selectionEnd] as const : null;
      for (const id of visibleIds) {
        if (!nextSet.has(id)) records.get(id)?.element.remove();
      }
      const fragment = root.ownerDocument.createDocumentFragment();
      for (const id of nextIds) fragment.append(records.get(id)!.element);
      anchor.before(fragment);
      if (restoreFocus && root.ownerDocument.activeElement !== focused) {
        focused.focus({ preventScroll: true });
        if (selection && (focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement)) {
          focused.setSelectionRange(...selection);
        }
      }
      visibleIds = nextIds;
    }
  }

  function onClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>("button[data-select-row]");
    const row = button?.closest<HTMLTableRowElement>("tr");
    const id = row && rowIds.get(row);
    if (id !== undefined) updateSelection(id, event);
  }

  function onChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    const entry = selects.get(target);
    if (!entry?.binding.descriptor.field) return;
    const option = target.selectedOptions[0];
    if (!option || !entry.binding.rawByOption.has(option)) return;
    const row = options.rows.get(entry.id);
    if (!row || row.status === "delete") return;
    const path = entry.binding.descriptor.field;
    const next = writePath(row.value as Readonly<Record<string, unknown>>, path,
      entry.binding.rawByOption.get(option));
    const key = path[0] as keyof T;
    options.rows.set(entry.id, key, next[path[0]] as T[keyof T]);
  }

  root.addEventListener("click", onClick);
  root.addEventListener("change", onChange);
  let unsubscribe = () => {};
  try {
    unsubscribe = options.rows.subscribe(render);
    render();
  } catch (cause) {
    unsubscribe();
    root.removeEventListener("click", onClick);
    root.removeEventListener("change", onChange);
    for (const record of records.values()) record.element.remove();
    anchor.replaceWith(template);
    throw cause;
  }

  return {
    select(id) {
      active();
      const row = id === null ? null : options.rows.get(id);
      if (id !== null && (!row || row.status === "delete")) {
        throw gridError("GRID_ROW", "The selected row is not available in this Grid.", { id });
      }
      updateSelection(id, null);
    },
    selected() {
      active();
      return selected;
    },
    setSort(compare) {
      active();
      sort = compare;
      render();
    },
    setFilter(predicate) {
      active();
      filter = predicate;
      render();
    },
    validate(id): ValidationResult {
      active();
      const target = id === undefined ? undefined : options.rows.get(id);
      if (id !== undefined && (!target || target.status === "delete")) {
        throw gridError("GRID_ROW", "The row ID is not available in this Grid.", { id });
      }
      const rows = target ? [target] : options.rows.entries();
      const issues: ValidationIssue[] = [];
      for (const row of rows) {
        for (const descriptor of selectFields) {
          if (!descriptor.field) continue;
          const current = readPath(row.value, descriptor.field);
          const available = [...descriptor.authored, ...optionValues(row.value, descriptor, row.id).map(item => item.raw)];
          if (available.some(value => Object.is(value, current))) continue;
          const binding = records.get(row.id)?.selects.find(select => select.descriptor === descriptor);
          issues.push({
            rowId: row.id,
            field: descriptor.field.join("."),
            rule: "select-option",
            message: "Choose an available option.",
            element: binding?.element.isConnected ? binding.element : undefined
          });
        }
      }
      return { valid: issues.length === 0, issues };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      unsubscribe();
      root.removeEventListener("click", onClick);
      root.removeEventListener("change", onChange);
      for (const record of records.values()) record.element.remove();
      records.clear();
      visibleIds = [];
      anchor.replaceWith(template);
    }
  };
}
