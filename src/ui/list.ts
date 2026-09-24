// SPDX-License-Identifier: Apache-2.0
import type { RowId, RowSnapshot, Rows, Snapshot } from "../data/index.js";
import { FrameworkError } from "../internal/framework-error.js";
import { parsePath, readPath } from "./field-path.js";
import { rowOptions } from "./row-options.js";
import { claimSelect } from "./select-owner.js";
import { createRuleRunner } from "./rules.js";
import type { RuleCall } from "./rules.js";
import type {
  FormatRule, ListHandle, PageRequest, PageState, RuleContext, RuleSet,
  ValidateRule, ValidationIssue, ValidationResult
} from "./index.js";

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
  field?: readonly string[];
  options?: readonly string[];
  label?: readonly string[];
  value?: readonly string[];
  authored: readonly (string | null)[];
  validate: readonly RuleCall<ValidateRule>[];
}

interface BoundText {
  field: TextField;
  element: HTMLElement;
  invalid: string | null;
  previous?: unknown;
  bound: boolean;
}

interface BoundSelect {
  field: SelectField;
  element: HTMLSelectElement;
  invalid: string | null;
  authoredNodes: Node[];
  authoredOptions: HTMLOptionElement[];
  rawByOption: Map<HTMLOptionElement, unknown>;
  source?: unknown;
  optionsBound: boolean;
  previous?: unknown;
  selectedBound: boolean;
}

interface RenderedRow<T> {
  element: HTMLLIElement;
  snapshot?: RowSnapshot<T>;
  texts: BoundText[];
  selects: BoundSelect[];
  buttons: HTMLButtonElement[];
  errors: Map<string, HTMLElement>;
  hasIssues: boolean;
  releaseSelects: (() => void)[];
}

let nextErrorId = 0;
const boundRoots = new WeakSet<HTMLUListElement | HTMLOListElement>();

function listError(code: string, message: string, detail?: Record<string, unknown>): FrameworkError {
  return new FrameworkError({ api: "bindList", code, message, detail });
}

function display(element: HTMLElement, value: unknown): void {
  if (element instanceof HTMLInputElement && element.type === "checkbox") {
    element.checked = value === true;
  } else {
    const text = value == null ? "" : String(value);
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) element.value = text;
    else element.textContent = text;
  }
}

export function bindList<T extends object>(root: HTMLUListElement | HTMLOListElement, options: {
  rows: Rows<T>;
  rules?: RuleSet;
  onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void;
}): ListHandle<T> {
  if (!root || (root.tagName !== "UL" && root.tagName !== "OL")) {
    throw listError("LIST_ROOT", "The List root must be a ul or ol element.");
  }
  if (boundRoots.has(root)) throw listError("LIST_IN_USE", "This List root is already bound.");
  const templates = [...root.querySelectorAll<HTMLLIElement>("li[data-row-template]")];
  if (templates.length !== 1 || templates[0].parentElement !== root) {
    throw listError("LIST_TEMPLATE", "The List needs one direct li marked data-row-template.");
  }
  const template = templates[0];
  const fixedId = template.hasAttribute("id") ? template : template.querySelector<HTMLElement>("[id]");
  if (fixedId) {
    throw listError("DUPLICATE_ID", "A repeated list item cannot contain a fixed DOM id.", { id: fixedId.id });
  }
  const empties = [...root.children].filter(element => element.matches("li[data-empty]")) as HTMLLIElement[];
  if (empties.length > 1 || empties[0] === template) {
    throw listError("LIST_EMPTY", "The List accepts at most one direct li marked data-empty.");
  }
  const empty = empties[0];
  const emptyWasHidden = empty?.hidden;
  const runner = createRuleRunner("bindList", options.rules);
  const textFields: TextField[] = [];
  const selectFields: SelectField[] = [];
  const errorFields = new Map<string, number>();
  const buttonIndexes: number[] = [];
  const authored = [template, ...template.querySelectorAll<HTMLElement>("*")];
  for (const [index, element] of authored.entries()) {
    const errorFor = element.getAttribute("data-error-for");
    if (errorFor !== null) {
      parsePath(errorFor);
      if (errorFields.has(errorFor)) {
        throw listError("LIST_ERROR_REGION", "A list field has two error regions.", { field: errorFor });
      }
      errorFields.set(errorFor, index);
    }
    if (element.hasAttribute("data-select-row")) {
      if (element.tagName !== "BUTTON") {
        throw listError("LIST_SELECT", "A list selection control must be a button.");
      }
      if ((element as HTMLButtonElement).type !== "button") {
        throw listError("LIST_SELECT", "A row selection button needs type=button to avoid form submission.");
      }
      buttonIndexes.push(index);
    }
    const name = element.getAttribute("data-field");
    const optionsName = element.getAttribute("data-options");
    if (element.tagName === "SELECT" && (name !== null || optionsName !== null)) {
      const select = element as HTMLSelectElement;
      const labelName = select.getAttribute("data-option-label");
      const valueName = select.getAttribute("data-option-value");
      if (optionsName !== null && (labelName === null || valueName === null)) {
        throw listError("LIST_OPTIONS", "A row-local Select needs data-option-label and data-option-value.");
      }
      if (select.hasAttribute("data-format")) {
        throw listError("LIST_FORMAT", "A Select cannot display a formatted scalar; format its option labels instead.",
          { field: name ?? "" });
      }
      selectFields.push({
        index, name: name ?? undefined,
        field: name === null ? undefined : parsePath(name),
        options: optionsName === null ? undefined : parsePath(optionsName),
        label: labelName === null ? undefined : parsePath(labelName),
        value: valueName === null ? undefined : parsePath(valueName),
        authored: [...select.options].map(option => option.value === "" ? null : option.value),
        validate: name === null ? [] : runner.validators(select, name)
      });
    } else if (name !== null) {
      if (element.isContentEditable) {
        throw listError("LIST_CONTROL", "A bound List field cannot be contenteditable; use Form to edit.", { field: name });
      }
      if (element instanceof HTMLInputElement) {
        const type = element.getAttribute("type")?.toLowerCase() ?? element.type;
        if (type === "file") {
          throw listError("LIST_FILE_ROWS", "File inputs cannot bind to JSON Rows.", { field: name });
        }
        if (type === "radio") {
          throw listError("LIST_CONTROL", "Radio groups need a selected-value binding; use Form.", { field: name });
        }
        if (element.hasAttribute("data-format") &&
            !["text", "search", "tel", "url", "email", "password"].includes(type)) {
          throw listError("LIST_FORMAT", "Only text-like inputs can display formatted text.", { field: name });
        }
      }
      textFields.push({ index, name, path: parsePath(name),
        format: runner.formats(element, name), validate: runner.validators(element, name) });
    }
  }
  const known = new Set([...textFields.map(field => field.name),
    ...selectFields.map(field => field.name).filter((name): name is string => name !== undefined)]);
  for (const field of errorFields.keys()) {
    if (!known.has(field)) {
      throw listError("LIST_ERROR_REGION", "An error region needs a matching data-field.", { field });
    }
  }

  const releaseTemplateSelects: (() => void)[] = [];
  try {
    for (const field of selectFields) {
      releaseTemplateSelects.push(claimSelect(authored[field.index] as HTMLSelectElement, "bindList"));
    }
  } catch (cause) {
    for (const release of releaseTemplateSelects) release();
    boundRoots.delete(root);
    throw cause;
  }

  const anchor = root.ownerDocument.createComment("list rows");
  template.replaceWith(anchor);
  boundRoots.add(root);
  const records = new Map<RowId, RenderedRow<T>>();
  const rowIds = new WeakMap<HTMLLIElement, RowId>();
  let selected: RowId | null = null;
  let sort: ((a: Snapshot<T>, b: Snapshot<T>) => number) | null = null;
  let filter: ((row: Snapshot<T>) => boolean) | null = null;
  let request: PageRequest | null = null;
  let pageState: PageState | null = null;
  let visibleIds: RowId[] = [];
  let rootFocusTabIndex = false;
  let disposed = false;

  function active(): void {
    if (disposed) throw listError("LIST_DISPOSED", "This List has been disposed.");
  }

  function createRecord(id: RowId): RenderedRow<T> {
    const element = template.cloneNode(true) as HTMLLIElement;
    element.removeAttribute("data-row-template");
    const nodes = [element, ...element.querySelectorAll<HTMLElement>("*")];
    const texts = textFields.map(field => ({
      field, element: nodes[field.index], invalid: nodes[field.index].getAttribute("aria-invalid"),
      bound: false
    }));
    const releaseSelects: (() => void)[] = [];
    let selects: BoundSelect[];
    try {
      selects = selectFields.map(field => {
        const select = nodes[field.index] as HTMLSelectElement;
        releaseSelects.push(claimSelect(select, "bindList"));
        select.disabled = true;
        return {
          field, element: select, invalid: select.getAttribute("aria-invalid"),
          authoredNodes: [...select.childNodes], authoredOptions: [...select.options],
          rawByOption: new Map<HTMLOptionElement, unknown>(), optionsBound: false, selectedBound: false
        };
      });
    } catch (cause) {
      for (const release of releaseSelects) release();
      throw cause;
    }
    for (const binding of texts) {
      if (binding.element instanceof HTMLInputElement || binding.element instanceof HTMLTextAreaElement) {
        binding.element.disabled = true;
      }
    }
    const buttons = buttonIndexes.map(index => nodes[index] as HTMLButtonElement);
    const errors = new Map([...errorFields].map(([field, index]) => [field, nodes[index]] as const));
    for (const [field, region] of errors) {
      let idCandidate: string;
      do { idCandidate = `natural-list-error-${++nextErrorId}`; }
      while (root.ownerDocument.getElementById(idCandidate));
      region.id = idCandidate;
      if (!region.hasAttribute("aria-live")) region.setAttribute("aria-live", "polite");
      region.textContent = "";
      for (const control of [
        ...texts.filter(binding => binding.field.name === field).map(binding => binding.element),
        ...selects.filter(binding => binding.field.name === field).map(binding => binding.element)
      ]) {
        const ids = new Set((control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean));
        ids.add(idCandidate);
        control.setAttribute("aria-describedby", [...ids].join(" "));
      }
    }
    for (const button of buttons) button.setAttribute("aria-pressed", String(selected === id));
    rowIds.set(element, id);
    return { element, texts, selects, buttons, errors, hasIssues: false, releaseSelects };
  }

  function invalidOptions(id: RowId): (field: string) => never {
    return field => { throw listError("LIST_OPTIONS", "A row-local Select needs an array of options.",
      { rowId: id, field }); };
  }

  function renderSelect(binding: BoundSelect, value: Snapshot<T>, id: RowId): void {
    const { field, element } = binding;
    const source = field.options ? readPath(value, field.options) : null;
    if (!binding.optionsBound || !Object.is(binding.source, source)) {
      const raw = new Map<HTMLOptionElement, unknown>();
      const children = [...binding.authoredNodes];
      for (const [index, option] of binding.authoredOptions.entries()) raw.set(option, field.authored[index]);
      if (field.options) {
        for (const choice of rowOptions(value, field.options, field.label!, field.value!, invalidOptions(id))) {
          const option = root.ownerDocument.createElement("option");
          option.value = String(choice.raw ?? "");
          option.textContent = choice.label;
          raw.set(option, choice.raw);
          children.push(option);
        }
      }
      element.replaceChildren(...children);
      binding.rawByOption = raw;
      binding.source = source;
      binding.optionsBound = true;
      binding.selectedBound = false;
    }
    if (field.field) {
      const current = readPath(value, field.field);
      if (!binding.selectedBound || !Object.is(binding.previous, current)) {
        if (element.multiple) {
          const remaining = Array.isArray(current) ? [...current] : [];
          for (const option of element.options) {
            const index = remaining.findIndex(item => Object.is(item, binding.rawByOption.get(option)));
            option.selected = index >= 0;
            if (index >= 0) remaining.splice(index, 1);
          }
        } else {
          element.selectedIndex = [...element.options].findIndex(option =>
            Object.is(binding.rawByOption.get(option), current));
        }
        binding.previous = current;
        binding.selectedBound = true;
      }
    }
  }

  function renderRecord(record: RenderedRow<T>, row: RowSnapshot<T>): void {
    if (record.snapshot === row) return;
    for (const binding of record.texts) {
      const value = readPath(row.value, binding.field.path);
      if (!binding.bound || !Object.is(binding.previous, value)) {
        if (binding.field.format.length) {
          const context: RuleContext = {
            field: binding.field.name, values: row.value as Snapshot<Record<string, unknown>>,
            rowId: row.id, element: binding.element
          };
          display(binding.element, runner.format(binding.field.format, value, context));
        } else display(binding.element, value);
        binding.previous = value;
        binding.bound = true;
      }
    }
    for (const binding of record.selects) renderSelect(binding, row.value, row.id);
    record.snapshot = row;
  }

  function validateRow(row: RowSnapshot<T>): ValidationIssue[] {
    const record = records.get(row.id);
    const values = row.value as Snapshot<Record<string, unknown>>;
    const issues: ValidationIssue[] = [];
    for (const [index, field] of textFields.entries()) {
      const binding = record?.texts[index];
      const element = binding?.element.isConnected ? binding.element : undefined;
      const value = readPath(values, field.path);
      const source = authored[field.index].cloneNode(true);
      if (source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement) {
        display(source, value);
        const textLike = source instanceof HTMLTextAreaElement ||
          ["text", "search", "tel", "url", "email", "password"].includes(source.type);
        const tooShort = textLike && source.minLength >= 0 && source.value.length > 0 &&
          source.value.length < source.minLength;
        const tooLong = textLike && source.maxLength >= 0 && source.value.length > source.maxLength;
        if (!source.validity.valid || tooShort || tooLong) {
          const message = tooShort ? `Use at least ${source.minLength} characters.` :
            tooLong ? `Use at most ${source.maxLength} characters.` :
              source.validationMessage || "Invalid input.";
          issues.push({ rowId: row.id, field: field.name, rule: "html", message,
            ...(element ? { element } : {}) });
        }
      }
      issues.push(...runner.validate(field.validate, value, {
        field: field.name, values, rowId: row.id, ...(element ? { element } : {})
      }));
    }
    for (const [index, field] of selectFields.entries()) {
      if (!field.field || !field.name) continue;
      const binding = record?.selects[index];
      const element = binding?.element.isConnected ? binding.element : undefined;
      const value = readPath(values, field.field);
      const available = [...field.authored, ...(field.options ?
        rowOptions(values, field.options, field.label!, field.value!, invalidOptions(row.id))
          .map(choice => choice.raw) : [])];
      const present = (candidate: unknown) => available.some(option => Object.is(option, candidate));
      const validOption = (authored[field.index] as HTMLSelectElement).multiple
        ? Array.isArray(value) && value.every(present)
        : present(value);
      if (!validOption) {
        issues.push({ rowId: row.id, field: field.name, rule: "select-option",
          message: "Choose an available option.", ...(element ? { element } : {}) });
      }
      const required = (authored[field.index] as HTMLSelectElement).required;
      if (required && (value == null || value === "" || (Array.isArray(value) && value.length === 0))) {
        issues.push({ rowId: row.id, field: field.name, rule: "html", message: "Choose an option.",
          ...(element ? { element } : {}) });
      }
      issues.push(...runner.validate(field.validate, value, {
        field: field.name, values, rowId: row.id, ...(element ? { element } : {})
      }));
    }
    if (record) {
      const byField = new Map<string, ValidationIssue[]>();
      for (const issue of issues) {
        const group = byField.get(issue.field) ?? [];
        group.push(issue);
        byField.set(issue.field, group);
      }
      for (const binding of [...record.texts, ...record.selects]) {
        const name = "field" in binding ? binding.field.name : undefined;
        if (!name) continue;
        if (byField.has(name)) binding.element.setAttribute("aria-invalid", "true");
        else if (binding.invalid === null) binding.element.removeAttribute("aria-invalid");
        else binding.element.setAttribute("aria-invalid", binding.invalid);
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
    for (const binding of [...record.texts, ...record.selects]) {
      if (binding.invalid === null) binding.element.removeAttribute("aria-invalid");
      else binding.element.setAttribute("aria-invalid", binding.invalid);
    }
    for (const region of record.errors.values()) region.textContent = "";
  }

  function updateSelection(id: RowId | null, event: Event | null): void {
    if (id === selected) return;
    const previous = selected;
    selected = id;
    for (const rowId of [previous, id]) {
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
        for (const release of record.releaseSelects) release();
        records.delete(id);
      }
    }
    if (selected !== null && !live.has(selected)) updateSelection(null, null);
    if (disposed) return;
    const filtered = filter ? entries.filter(row => filter!(row.value)) : [...entries];
    if (sort) filtered.sort((left, right) => sort!(left.value, right.value));
    let displayed = filtered;
    if (request) {
      const pages = Math.ceil(filtered.length / request.size);
      const page = Math.min(request.page, Math.max(1, pages));
      request = { page, size: request.size };
      pageState = Object.freeze({ ...request, total: filtered.length, pages });
      displayed = filtered.slice((page - 1) * request.size, page * request.size);
    } else pageState = null;
    const ids = displayed.map(row => row.id);
    for (const row of displayed) {
      let record = records.get(row.id);
      if (!record) {
        record = createRecord(row.id);
        records.set(row.id, record);
      }
      renderRecord(record, row);
    }
    if (ids.length !== visibleIds.length || ids.some((id, index) => id !== visibleIds[index])) {
      const next = new Set(ids);
      const focused = root.ownerDocument.activeElement;
      const focusedRow = focused instanceof Element ? focused.closest("li") : null;
      const focusedId = focusedRow && rowIds.get(focusedRow);
      const restoreFocus = focused instanceof HTMLElement && focusedId !== undefined &&
        focusedId !== null && next.has(focusedId);
      const moveFocus = focused instanceof HTMLElement && focusedId !== undefined &&
        focusedId !== null && !next.has(focusedId);
      for (const id of visibleIds) if (!next.has(id)) records.get(id)?.element.remove();
      const fragment = root.ownerDocument.createDocumentFragment();
      for (const id of ids) fragment.append(records.get(id)!.element);
      anchor.before(fragment);
      if (restoreFocus && root.ownerDocument.activeElement !== focused) focused.focus({ preventScroll: true });
      else if (moveFocus) {
        const nextControl = root.querySelector<HTMLElement>('button[data-select-row]:not(:disabled)') ?? root;
        if (nextControl === root && !root.hasAttribute("tabindex")) {
          root.tabIndex = -1;
          rootFocusTabIndex = true;
        }
        nextControl.focus({ preventScroll: true });
      }
      visibleIds = ids;
    }
    if (empty) empty.hidden = ids.length > 0;
  }

  function onClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>("button[data-select-row]");
    const row = button?.closest<HTMLLIElement>("li");
    const id = row && rowIds.get(row);
    if (id !== undefined && button && root.contains(button)) updateSelection(id, event);
  }

  root.addEventListener("click", onClick);
  let unsubscribe = () => {};
  try {
    unsubscribe = options.rows.subscribe(event => {
      if (event.type === "replace" || (event.type === "revert" && event.id === undefined)) {
        for (const record of records.values()) clearIssues(record);
      } else if ("id" in event && event.id !== undefined) {
        const record = records.get(event.id);
        if (record) clearIssues(record);
      }
      render();
    });
    render();
  } catch (cause) {
    unsubscribe();
    root.removeEventListener("click", onClick);
    for (const record of records.values()) {
      record.element.remove();
      for (const release of record.releaseSelects) release();
    }
    anchor.replaceWith(template);
    if (empty) empty.hidden = emptyWasHidden!;
    if (rootFocusTabIndex && root.getAttribute("tabindex") === "-1") root.removeAttribute("tabindex");
    for (const release of releaseTemplateSelects) release();
    throw cause;
  }

  return {
    select(id) {
      active();
      const row = id === null ? null : options.rows.get(id);
      if (id !== null && (!row || row.status === "delete")) {
        throw listError("LIST_ROW", "The selected row is not available in this List.", { id });
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
    setPage(next) {
      active();
      if (next !== null && (!Number.isSafeInteger(next.page) || next.page < 1 ||
          !Number.isSafeInteger(next.size) || next.size < 1)) {
        throw listError("LIST_PAGE", "A page request needs positive integer page and size values.");
      }
      request = next && { page: next.page, size: next.size };
      render();
    },
    page() {
      active();
      return pageState;
    },
    validate(id): ValidationResult {
      active();
      const target = id === undefined ? undefined : options.rows.get(id);
      if (id !== undefined && (!target || target.status === "delete")) {
        throw listError("LIST_ROW", "The row ID is not available in this List.", { id });
      }
      const rows = target ? [target] : options.rows.entries();
      const issues = rows.flatMap(row => validateRow(row));
      return { valid: issues.length === 0, issues };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      unsubscribe();
      root.removeEventListener("click", onClick);
      for (const record of records.values()) {
        record.element.remove();
        for (const release of record.releaseSelects) release();
      }
      records.clear();
      visibleIds = [];
      anchor.replaceWith(template);
      if (empty) empty.hidden = emptyWasHidden!;
      if (rootFocusTabIndex && root.getAttribute("tabindex") === "-1") root.removeAttribute("tabindex");
      for (const release of releaseTemplateSelects) release();
      boundRoots.delete(root);
    }
  };
}
