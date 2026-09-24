// SPDX-License-Identifier: Apache-2.0
import type { RowId, RowSnapshot, Rows, RowsEvent, Snapshot } from "../data/index.js";
import { FrameworkError } from "../internal/framework-error.js";
import { parsePath, readPath, writePath } from "./field-path.js";
import { createRuleRunner } from "./rules.js";
import type { RuleCall } from "./rules.js";
import type { FormatRule, GridHandle, RuleContext, RuleSet, ValidateRule, ValidationIssue, ValidationResult } from "./index.js";

interface TextField {
  index: number;
  name: string;
  path: readonly string[];
  format: readonly RuleCall<FormatRule>[];
  validate: readonly RuleCall<ValidateRule>[];
}

interface SelectField {
  index: number;
  name?: string;
  validate: readonly RuleCall<ValidateRule>[];
  field?: readonly string[];
  options?: readonly string[];
  label?: readonly string[];
  value?: readonly string[];
  authored: readonly (string | null)[];
}

interface BoundText {
  descriptor: TextField;
  element: HTMLElement;
  invalid: string | null;
  previous?: unknown;
  bound: boolean;
}

interface BoundSelect {
  descriptor: SelectField;
  element: HTMLSelectElement;
  invalid: string | null;
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
  errors: Map<string, HTMLElement>;
  hasIssues: boolean;
  snapshot?: RowSnapshot<T>;
  texts: BoundText[];
  selects: BoundSelect[];
  buttons: HTMLButtonElement[];
}

interface SelectDraft {
  value: unknown;
  baseline: unknown;
  path: readonly string[];
}

let nextErrorId = 0;

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
  if (element instanceof HTMLInputElement && element.type === "checkbox") {
    element.checked = value === true;
    return;
  }
  const text = value == null ? "" : String(value);
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) element.value = text;
  else element.textContent = text;
}

export function bindGrid<T extends object>(root: HTMLTableElement, options: {
  rows: Rows<T>;
  rules?: RuleSet;
  onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void;
}): GridHandle<T> {
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

  const runner = createRuleRunner("bindGrid", options.rules);
  const textFields: TextField[] = [];
  const selectFields: SelectField[] = [];
  const errorFields = new Map<string, number>();
  const buttonIndexes: number[] = [];
  const authored = [template, ...template.querySelectorAll<HTMLElement>("*")];
  for (const [index, element] of authored.entries()) {
    const errorFor = element.getAttribute("data-error-for");
    if (errorFor !== null) {
      parsePath(errorFor);
      if (errorFields.has(errorFor)) throw gridError("GRID_ERROR_REGION", "A row field has two error regions.", { field: errorFor });
      errorFields.set(errorFor, index);
    }
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
      if (select.hasAttribute("data-format")) {
        throw gridError("GRID_FORMAT", "A Select cannot display a formatted scalar; format its option labels instead.", { field: fieldName ?? "" });
      }
      selectFields.push({
        index,
        name: fieldName ?? undefined,
        validate: fieldName === null ? [] : runner.validators(select, fieldName),
        field: fieldName === null ? undefined : parsePath(fieldName),
        options: optionsName === null ? undefined : parsePath(optionsName),
        label: labelName === null ? undefined : parsePath(labelName),
        value: valueName === null ? undefined : parsePath(valueName),
        authored: [...select.options].map(option => option.value === "" ? null : option.value)
      });
    } else if (fieldName !== null) {
      if (element instanceof HTMLInputElement) {
        const type = element.getAttribute("type")?.toLowerCase() ?? element.type;
        if (type === "file") {
          throw gridError("GRID_FILE_ROWS", "File inputs cannot bind to JSON Rows.", { field: fieldName });
        }
        if (type === "radio") {
          throw gridError("GRID_CONTROL", "Radio groups need a selected-value binding; Grid does not bind them yet.", { field: fieldName });
        }
        if (element.hasAttribute("data-format") &&
            !["text", "search", "tel", "url", "email", "password"].includes(type)) {
          throw gridError("GRID_FORMAT", "Only text-like inputs can display formatted text.", { field: fieldName });
        }
      }
      textFields.push({ index, name: fieldName, path: parsePath(fieldName),
        format: runner.formats(element, fieldName), validate: runner.validators(element, fieldName) });
    }
  }

  const knownFields = new Set([...textFields.map(field => field.name),
    ...selectFields.map(field => field.name).filter((name): name is string => name !== undefined)]);
  for (const field of errorFields.keys()) {
    if (!knownFields.has(field)) {
      throw gridError("GRID_ERROR_REGION", "An error region needs a matching data-field.", { field });
    }
  }
  const anchor = root.ownerDocument.createComment("grid rows");
  template.replaceWith(anchor);
  const records = new Map<RowId, RenderedRow<T>>();
  const drafts = new Map<RowId, Map<string, SelectDraft>>();
  let reconciling = false;
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
      invalid: nodes[descriptor.index].getAttribute("aria-invalid"),
      bound: false
    }));
    const rowSelects = selectFields.map(descriptor => {
      const element = nodes[descriptor.index] as HTMLSelectElement;
      const binding: BoundSelect = {
        descriptor,
        element,
        invalid: element.getAttribute("aria-invalid"),
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
    const errors = new Map([...errorFields].map(([field, index]) =>
      [field, nodes[index]] as const));
    for (const [field, region] of errors) {
      let candidate: string;
      do { candidate = `natural-grid-error-${++nextErrorId}`; }
      while (root.ownerDocument.getElementById(candidate));
      region.id = candidate;
      if (!region.hasAttribute("aria-live")) region.setAttribute("aria-live", "polite");
      region.textContent = "";
      const controls = [
        ...texts.filter(binding => binding.descriptor.name === field).map(binding => binding.element),
        ...rowSelects.filter(binding => binding.descriptor.name === field).map(binding => binding.element)
      ];
      for (const control of controls) {
        const ids = new Set((control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean));
        ids.add(candidate);
        control.setAttribute("aria-describedby", [...ids].join(" "));
      }
    }
    for (const button of buttons) button.setAttribute("aria-pressed", String(selected === id));
    rowIds.set(element, id);
    return { element, errors, hasIssues: false, texts, selects: rowSelects, buttons };
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
      const draft = descriptor.name ? drafts.get(id)?.get(descriptor.name) : undefined;
      const current = draft ? draft.value : readPath(value, descriptor.field);
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
        const field = binding.descriptor;
        if (field.format.length) {
          const context: RuleContext = {
            field: field.name, values: snapshot.value as Snapshot<Record<string, unknown>>,
            rowId: snapshot.id, element: binding.element
          };
          display(binding.element, runner.format(field.format, value, context));
        } else {
          display(binding.element, value);
        }
        binding.previous = value;
        binding.bound = true;
      }
    }
    for (const binding of record.selects) renderSelect(binding, snapshot.value, snapshot.id);
    record.snapshot = snapshot;
  }

  function candidateValues(row: RowSnapshot<T>): Readonly<Record<string, unknown>> {
    let values = row.value as Readonly<Record<string, unknown>>;
    for (const draft of drafts.get(row.id)?.values() ?? []) {
      values = writePath(values, draft.path, draft.value);
    }
    return values;
  }

  function ruleContext(
    row: RowSnapshot<T>, field: string, values: Readonly<Record<string, unknown>>,
    element?: HTMLElement
  ): RuleContext {
    return {
      field, values: values as Snapshot<Record<string, unknown>>, rowId: row.id,
      ...(element?.isConnected ? { element } : {})
    };
  }

  function validateRow(row: RowSnapshot<T>): ValidationIssue[] {
    const record = records.get(row.id);
    const values = candidateValues(row);
    const issues: ValidationIssue[] = [];
    for (const [index, descriptor] of textFields.entries()) {
      const bound = record?.texts[index];
      const element = bound?.element.isConnected ? bound.element : undefined;
      const value = readPath(values, descriptor.path);
      const context = ruleContext(row, descriptor.name, values, element);
      const source = (bound?.element ?? authored[descriptor.index]).cloneNode(true);
      if (source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement) {
        display(source, value);
        const textLength = source instanceof HTMLTextAreaElement ||
          ["text", "search", "tel", "url", "email", "password"].includes(source.type);
        const tooShort = textLength && source.minLength >= 0 &&
          source.value.length > 0 && source.value.length < source.minLength;
        const tooLong = textLength && source.maxLength >= 0 &&
          source.value.length > source.maxLength;
        if (!source.validity.valid || tooShort || tooLong) {
          const message = tooShort ? `Use at least ${source.minLength} characters.` :
            tooLong ? `Use at most ${source.maxLength} characters.` :
              source.validationMessage || "Invalid input.";
          issues.push({
            rowId: row.id, field: descriptor.name, rule: "html",
            message, ...(element ? { element } : {})
          });
        }
      }
      issues.push(...runner.validate(descriptor.validate, value, context));
    }
    for (const [index, descriptor] of selectFields.entries()) {
      if (!descriptor.field || !descriptor.name) continue;
      const bound = record?.selects[index];
      const element = bound?.element.isConnected ? bound.element : undefined;
      const value = readPath(values, descriptor.field);
      const available = [...descriptor.authored, ...optionValues(values, descriptor, row.id).map(item => item.raw)];
      if (!available.some(option => Object.is(option, value))) {
        issues.push({
          rowId: row.id, field: descriptor.name, rule: "select-option",
          message: "Choose an available option.", ...(element ? { element } : {})
        });
      }
      if ((authored[descriptor.index] as HTMLSelectElement).required && (value === null || value === "" || value === undefined)) {
        issues.push({
          rowId: row.id, field: descriptor.name, rule: "html",
          message: "Choose an option.", ...(element ? { element } : {})
        });
      }
      issues.push(...runner.validate(descriptor.validate, value,
        ruleContext(row, descriptor.name, values, element)));
    }
    if (record) {
      const byField = new Map<string, ValidationIssue[]>();
      for (const issue of issues) {
        const group = byField.get(issue.field) ?? [];
        group.push(issue);
        byField.set(issue.field, group);
      }
      for (const bound of record.texts) {
        const invalid = byField.has(bound.descriptor.name);
        if (invalid) bound.element.setAttribute("aria-invalid", "true");
        else if (bound.invalid === null) bound.element.removeAttribute("aria-invalid");
        else bound.element.setAttribute("aria-invalid", bound.invalid);
      }
      for (const bound of record.selects) {
        if (!bound.descriptor.name) continue;
        const invalid = byField.has(bound.descriptor.name);
        if (invalid) bound.element.setAttribute("aria-invalid", "true");
        else if (bound.invalid === null) bound.element.removeAttribute("aria-invalid");
        else bound.element.setAttribute("aria-invalid", bound.invalid);
      }
      for (const [field, region] of record.errors) {
        region.textContent = (byField.get(field) ?? []).map(issue => issue.message).join(" ");
      }
      record.hasIssues = issues.length > 0;
    }
    return issues;
  }

  function clearIssues(record: RenderedRow<T>): void {
    if (!record.hasIssues) return;
    record.hasIssues = false;
    for (const bound of [...record.texts, ...record.selects]) {
      if (bound.invalid === null) bound.element.removeAttribute("aria-invalid");
      else bound.element.setAttribute("aria-invalid", bound.invalid);
    }
    for (const region of record.errors.values()) region.textContent = "";
  }

  function reconcile(id: RowId): ValidationIssue[] {
    const row = options.rows.get(id);
    if (!row || row.status === "delete") {
      throw gridError("GRID_ROW", "The row ID is not available in this Grid.", { id });
    }
    const pending = drafts.get(id);
    if (!pending?.size || reconciling) return validateRow(row);

    const issues = validateRow(row);
    const failed = new Set(issues.map(issue => issue.field));
    const ready = [...pending.keys()].filter(field => !failed.has(field));
    if (!ready.length) return issues;

    reconciling = true;
    try {
      for (const field of ready) {
        const draft = pending.get(field);
        if (!draft) continue;
        const current = options.rows.get(id);
        if (!current || current.status === "delete") {
          throw gridError("GRID_ROW", "The row ID is not available in this Grid.", { id });
        }
        const next = writePath(current.value as Readonly<Record<string, unknown>>, draft.path, draft.value);
        const key = draft.path[0] as keyof T;
        try {
          options.rows.set(id, key, next[draft.path[0]] as T[keyof T]);
          pending.delete(field);
        } catch (cause) {
          try {
            const stored = options.rows.get(id);
            if (stored && Object.is(readPath(stored.value, draft.path), draft.value)) {
              pending.delete(field);
            }
          } catch { /* Keep the original Rows.set error. */ }
          throw cause;
        }
      }
    } finally {
      reconciling = false;
      if (!pending.size) drafts.delete(id);
    }
    const updated = options.rows.get(id);
    if (!updated || updated.status === "delete") {
      throw gridError("GRID_ROW", "The row ID is not available in this Grid.", { id });
    }
    return validateRow(updated);
  }

  function onRows(event: RowsEvent): void {
    if (event.type === "replace" || (event.type === "revert" && event.id === undefined)) {
      drafts.clear();
      for (const record of records.values()) {
        record.snapshot = undefined;
        clearIssues(record);
      }
    } else if (event.type === "remove" || event.type === "revert") {
      if (event.id !== undefined) {
        drafts.delete(event.id);
        const record = records.get(event.id);
        if (record) {
          record.snapshot = undefined;
          clearIssues(record);
        }
      }
    } else if (event.type === "set") {
      const pending = drafts.get(event.id);
      const row = pending ? options.rows.get(event.id) : undefined;
      if (pending && row && !reconciling) {
        for (const [field, draft] of pending) {
          if (!Object.is(readPath(row.value, draft.path), draft.baseline)) pending.delete(field);
        }
        if (!pending.size) drafts.delete(event.id);
      }
      const record = records.get(event.id);
      if (record) {
        if (pending) record.snapshot = undefined;
        if (!reconciling) clearIssues(record);
      }
    }
    render();
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
    const path = entry?.binding.descriptor.field;
    const field = entry?.binding.descriptor.name;
    if (!entry || !path || !field) return;
    const option = target.selectedOptions[0];
    if (!option) return;
    const row = options.rows.get(entry.id);
    if (!row || row.status === "delete") return;
    const value = entry.binding.rawByOption.has(option) ? entry.binding.rawByOption.get(option) : option.value;
    const pending = drafts.get(entry.id) ?? new Map<string, SelectDraft>();
    pending.set(field, { value, baseline: readPath(row.value, path), path });
    drafts.set(entry.id, pending);
    reconcile(entry.id);
  }

  root.addEventListener("click", onClick);
  root.addEventListener("change", onChange);
  let unsubscribe = () => {};
  try {
    unsubscribe = options.rows.subscribe(onRows);
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
      const ids = target ? [target.id] : options.rows.entries().map(row => row.id);
      const issues = ids.flatMap(rowId => reconcile(rowId));
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
      drafts.clear();
      visibleIds = [];
      anchor.replaceWith(template);
    }
  };
}
