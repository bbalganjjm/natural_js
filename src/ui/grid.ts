// SPDX-License-Identifier: Apache-2.0
import type { RowId, RowSnapshot, Rows, RowsEvent, Snapshot } from "../data/index.js";
import { FrameworkError } from "../internal/framework-error.js";
import { parsePath, readPath, writePath } from "./field-path.js";
import { createRuleRunner } from "./rules.js";
import { rowOptions } from "./row-options.js";
import { claimSelect } from "./select-owner.js";
import { bindGridColumns } from "./grid-columns.js";
import { createGridSelection } from "./grid-selection.js";
import { createGridFilters } from "./grid-filters.js";
import { bindSelect } from "./select.js";
import { focusVisible } from "./dom-state.js";
import { readClipboard } from "./grid-paste.js";
import type { RuleCall } from "./rules.js";
import type { FormatRule, GridColumn, GridFilterChoice, GridHandle, GridIdsChange, GridRowScope, PageRequest, PageState, ParseInput, RuleContext, RuleSet, SelectHandle, SelectValue, SortIndicator, ValidateRule, ValidationIssue, ValidationResult } from "./index.js";

interface TextField {
  index: number;
  name: string;
  path: readonly string[];
  format: readonly RuleCall<FormatRule>[];
  validate: readonly RuleCall<ValidateRule>[];
  editable: boolean;
  checkbox: boolean;
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
  release: () => void;
}

interface RenderedRow<T> {
  element: HTMLTableRowElement;
  errors: Map<string, HTMLElement>;
  hasIssues: boolean;
  snapshot?: RowSnapshot<T>;
  texts: BoundText[];
  selects: BoundSelect[];
  buttons: HTMLButtonElement[];
  buttonDisabled: boolean[];
  checks: HTMLInputElement[];
  checkDisabled: boolean[];
  releaseColumns: () => void;
}

interface FieldDraft {
  entered: unknown;
  baseline: unknown;
  path: readonly string[];
}

interface Candidates {
  values: Readonly<Record<string, unknown>>;
  parsed: Map<string, unknown>;
  parseErrors: Map<string, string>;
}

let nextErrorId = 0;
const boundRoots = new WeakSet<HTMLTableElement>();

function gridError(code: string, message: string, detail?: Record<string, unknown>): FrameworkError {
  return new FrameworkError({ api: "bindGrid", code, message, detail });
}

function checkedPage(request: PageRequest | null): PageRequest | null {
  if (request === null) return null;
  if (!request || !Number.isSafeInteger(request.page) || request.page < 1 ||
      !Number.isSafeInteger(request.size) || request.size < 1) {
    throw gridError("GRID_PAGE", "Page and size must be positive integers.");
  }
  return { page: request.page, size: request.size };
}

function optionValues(value: unknown, descriptor: SelectField, rowId: RowId) {
  if (!descriptor.options) return [];
  return rowOptions(value, descriptor.options, descriptor.label!, descriptor.value!, field => {
    throw gridError("GRID_OPTIONS", "A row-local Select needs an array of options.", { rowId, field });
  });
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
  initialPage?: PageRequest;
  rules?: RuleSet;
  parse?: Record<string, ParseInput>;
  paste?: boolean;
  onPaste?: (result: ValidationResult) => void;
  onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void;
  multiple?: boolean;
  canSelect?: (row: RowSnapshot<T>) => boolean;
  canCheck?: (row: RowSnapshot<T>) => boolean;
  beforeSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => boolean | void;
  beforeSelectionChange?: (change: GridIdsChange) => boolean | void;
  onSelectionChange?: (change: GridIdsChange) => void;
  beforeCheckChange?: (change: GridIdsChange) => boolean | void;
  onCheckChange?: (change: GridIdsChange) => void;
  sorts?: Record<string, (a: Snapshot<T>, b: Snapshot<T>) => number>;
  filters?: Record<string, { value: (row: Snapshot<T>) => SelectValue; label?: (value: SelectValue) => string }>;
  onRowAction?: (action: { action: string; id: RowId; row: RowSnapshot<T>; element: HTMLButtonElement; event: Event }) => void;
  columns?: readonly GridColumn[];
  onColumnsChange?: (change: { columns: readonly GridColumn[]; event: Event | null }) => void;
}): GridHandle<T> {
  if (!root || root.tagName !== "TABLE") {
    throw gridError("GRID_ROOT", "The Grid root must be a table element.");
  }
  if (boundRoots.has(root)) throw gridError("GRID_IN_USE", "This table is already bound as a Grid.");
  const templates = [...root.tBodies].flatMap(body => [...body.rows].filter(row => row.hasAttribute("data-row-template")));
  if (templates.length !== 1) {
    throw gridError("GRID_TEMPLATE", "The Grid needs one tbody row marked data-row-template.");
  }
  const template = templates[0];
  const fixedId = template.hasAttribute("id") ? template : template.querySelector<HTMLElement>("[id]");
  if (fixedId) {
    throw gridError("DUPLICATE_ID", "A repeated row template cannot contain a fixed DOM id.", { id: fixedId.id });
  }

  const initialPage = checkedPage(options.initialPage ?? null);
  const runner = createRuleRunner("bindGrid", options.rules);
  const textFields: TextField[] = [];
  const selectFields: SelectField[] = [];
  const errorFields = new Map<string, number>();
  const buttonIndexes: number[] = [];
  const checkIndexes: number[] = [];
  if (options.onRowAction !== undefined && typeof options.onRowAction !== "function") {
    throw gridError("GRID_ACTION", "onRowAction must be a function.");
  }
  if (options.paste !== undefined && typeof options.paste !== "boolean" ||
      options.onPaste !== undefined && typeof options.onPaste !== "function") {
    throw gridError("GRID_PASTE", "paste must be boolean and onPaste must be a function.");
  }
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
      if ((element as HTMLButtonElement).type !== "button") {
        throw gridError("GRID_SELECT", "A row selection button needs type=button to avoid form submission.");
      }
      buttonIndexes.push(index);
    }
    if (element.hasAttribute("data-check-row")) {
      if (!(element instanceof HTMLInputElement) || element.type !== "checkbox" || element.hasAttribute("data-field")) {
        throw gridError("GRID_CHECK", "A row check needs a checkbox separate from data-field.");
      }
      checkIndexes.push(index);
    }
    if (element.hasAttribute("data-row-action") && (!(element instanceof HTMLButtonElement) ||
        element.type !== "button" || !element.getAttribute("data-row-action")?.trim() ||
        element.hasAttribute("data-select-row") || !options.onRowAction)) {
      throw gridError("GRID_ACTION", "A row action needs a named button, type=button and onRowAction.");
    }
    const fieldName = element.getAttribute("data-field");
    const optionsName = element.getAttribute("data-options");
    if (element.tagName === "SELECT" && (fieldName !== null || optionsName !== null)) {
      const select = element as HTMLSelectElement;
      if (select.multiple) {
        throw gridError("GRID_CONTROL", "Use Form for a multiple Select; Grid binds one selected value per row.", { field: fieldName ?? "" });
      }
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
        if (!["text", "search", "tel", "url", "email", "password", "checkbox", "number"].includes(type)) {
          throw gridError("GRID_CONTROL", "Grid edits text, checkbox, and parsed number inputs; use Form for other controls.", { field: fieldName });
        }
        if (type === "number" && typeof options.parse?.[fieldName] !== "function") {
          throw gridError("GRID_PARSE_FIELD", "A number input needs a parser to preserve its raw value type.", { field: fieldName });
        }
      }
      textFields.push({ index, name: fieldName, path: parsePath(fieldName),
        format: runner.formats(element, fieldName), validate: runner.validators(element, fieldName),
        editable: element instanceof HTMLTextAreaElement ||
          element instanceof HTMLInputElement && !["hidden", "button", "submit", "reset", "image"].includes(element.type),
        checkbox: element instanceof HTMLInputElement && element.type === "checkbox" });
    }
  }

  const knownFields = new Set([...textFields.map(field => field.name),
    ...selectFields.map(field => field.name).filter((name): name is string => name !== undefined)]);
  for (const [field, parser] of Object.entries(options.parse ?? {})) {
    const editable = textFields.filter(descriptor => descriptor.name === field);
    if (editable.length !== 1 || editable[0].checkbox || typeof parser !== "function") {
      throw gridError("GRID_PARSE_FIELD", "A Grid parser needs one non-checkbox text field.", { field });
    }
  }
  for (const field of errorFields.keys()) {
    if (!knownFields.has(field)) {
      throw gridError("GRID_ERROR_REGION", "An error region needs a matching data-field.", { field });
    }
  }
  const selection = createGridSelection(options, {
    visible: () => { active(); return visibleIds; },
    filtered: () => { active(); return filteredIds; },
    revision: () => { active(); return viewRevision; },
    changed: syncSelection
  });
  const columnFilters = createGridFilters(options, () => filter, refreshView);
  if (options.sorts !== undefined && (!options.sorts || typeof options.sorts !== "object" || Array.isArray(options.sorts))) {
    throw gridError("GRID_SORT", "sorts must be an object of column comparators.");
  }
  const sorters = new Map(Object.entries(options.sorts ?? {}));
  for (const [key, compare] of sorters) {
    if (!key.trim() || typeof compare !== "function") throw gridError("GRID_SORT", "Each column sorter needs a function.", { key });
  }
  const sortButtons = [...root.tHead?.querySelectorAll<HTMLElement>("[data-sort-column]") ?? []];
  for (const button of sortButtons) {
    if (!(button instanceof HTMLButtonElement) || button.type !== "button" ||
        !sorters.has(button.getAttribute("data-sort-column")!) || !button.closest("th")) {
      throw gridError("GRID_SORT", "A sort control needs a configured column key and type=button in a th.");
    }
  }
  const headerChecks = [...root.tHead?.querySelectorAll<HTMLInputElement>("[data-check-all]") ?? []].map(element => {
    const scope = element.getAttribute("data-check-all");
    if (!(element instanceof HTMLInputElement) || element.type !== "checkbox" || element.hasAttribute("data-field") ||
        !["visible", "filtered", "store"].includes(scope!)) {
      throw gridError("GRID_CHECK", "A check-all control needs a checkbox and an explicit row scope.");
    }
    return { element, scope: scope as GridRowScope, checked: element.checked,
      mixed: element.indeterminate, disabled: element.disabled };
  });
  const filterKeys = new Set(columnFilters.keys());
  const filterElements = [...root.tHead?.querySelectorAll<HTMLElement>("[data-filter-column]") ?? []];
  const filterSearchElements = [...root.tHead?.querySelectorAll<HTMLInputElement>("[data-filter-search]") ?? []];
  for (const element of filterElements) {
    if (!(element instanceof HTMLSelectElement) || !element.multiple ||
        !filterKeys.has(element.getAttribute("data-filter-column")!)) {
      throw gridError("GRID_FILTER", "A filter control needs a configured key and a multiple Select.");
    }
  }
  for (const element of root.tHead?.querySelectorAll<HTMLElement>("[data-filter-search], [data-clear-filter]") ?? []) {
    const search = element.getAttribute("data-filter-search");
    const key = search ?? element.getAttribute("data-clear-filter");
    if (!filterKeys.has(key!) || (search !== null
      ? !(element instanceof HTMLInputElement) || !["text", "search"].includes(element.type)
      : !(element instanceof HTMLButtonElement) || element.type !== "button")) {
      throw gridError("GRID_FILTER", "Filter search/reset controls need a configured column key and native input/button.");
    }
  }
  const filterBindings: { element: HTMLSelectElement; key: string; handle: SelectHandle<SelectValue>;
    source?: readonly GridFilterChoice[]; query?: string; shown: readonly GridFilterChoice[] }[] = [];
  let rootFocusTabIndex = false;
  const authoredHeaders = new Set(root.tHead?.querySelectorAll<HTMLTableCellElement>("th") ?? []);
  const columns = bindGridColumns(root, template, options.columns, options.onColumnsChange);
  const templateReleases: (() => void)[] = [];
  try {
    for (const field of selectFields) {
      templateReleases.push(claimSelect(authored[field.index] as HTMLSelectElement, "bindGrid"));
    }
  } catch (cause) {
    for (const release of templateReleases) release();
    columns.dispose();
    throw cause;
  }
  const anchor = root.ownerDocument.createComment("grid rows");
  template.replaceWith(anchor);
  const records = new Map<RowId, RenderedRow<T>>();
  const drafts = new Map<RowId, Map<string, FieldDraft>>();
  const issueText = new Map<RowId, Map<string, string[]>>();
  let reconciling = false;
  let pasting = false;
  let pasteCommit = false;
  let pasteNotified = false;
  const pasteFields = [
    ...textFields.map((field, text) => ({ name: field.name, path: field.path, index: field.index, text, select: -1 })),
    ...selectFields.flatMap((field, select) => field.name && field.field
      ? [{ name: field.name, path: field.field, index: field.index, text: -1, select }] : [])
  ].sort((a, b) => a.index - b.index);
  const rowIds = new WeakMap<HTMLTableRowElement, RowId>();
  const selects = new WeakMap<HTMLSelectElement, { id: RowId; binding: BoundSelect }>();
  const edits = new WeakMap<HTMLElement, { id: RowId; binding: BoundText }>();
  let sort: ((a: Snapshot<T>, b: Snapshot<T>) => number) | null = null;
  let filter: ((row: Snapshot<T>) => boolean) | null = null;
  let pageRequest: PageRequest | null = initialPage;
  let pageState: PageState | null = null;
  let sortIndicator: SortIndicator | null = null;
  const headerOriginals = new Map<HTMLTableCellElement, string | null>();
  let visibleIds: RowId[] = [];
  let filteredIds: RowId[] = [];
  let viewRevision = 0;
  let sortKey: string | null = null;
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
    for (const binding of texts) {
      if (binding.descriptor.editable) edits.set(binding.element, { id, binding });
      else if (options.paste && !binding.element.hasAttribute("tabindex") &&
          !binding.element.closest("button, a, input, select, textarea, summary, [contenteditable]")) {
        binding.element.tabIndex = 0;
      }
    }
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
        selectedBound: false,
        release: claimSelect(element, "bindGrid")
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
    const checks = checkIndexes.map(index => nodes[index] as HTMLInputElement);
    rowIds.set(element, id);
    return { element, errors, hasIssues: false, texts, selects: rowSelects, buttons,
      buttonDisabled: buttons.map(button => button.disabled), checks, checkDisabled: checks.map(check => check.disabled),
      releaseColumns: columns.attach(element) };
  }

  function releaseRecord(record: RenderedRow<T>): void {
    record.element.remove();
    record.releaseColumns();
    for (const select of record.selects) select.release();
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
      const current = draft ? draft.entered : readPath(value, descriptor.field);
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
      const draft = drafts.get(snapshot.id)?.get(binding.descriptor.name);
      const value = draft ? draft.entered : readPath(snapshot.value, binding.descriptor.path);
      if (!binding.bound || !Object.is(binding.previous, value)) {
        const field = binding.descriptor;
        if (field.format.length && !draft) {
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

  function candidateValues(row: RowSnapshot<T>, pending = drafts.get(row.id)): Candidates {
    let values = row.value as Readonly<Record<string, unknown>>;
    for (const draft of pending?.values() ?? []) values = writePath(values, draft.path, draft.entered);
    const enteredValues = values;
    const parsed = new Map<string, unknown>();
    const parseErrors = new Map<string, string>();
    for (const [field, draft] of pending ?? []) {
      let value = draft.entered;
      const parser = options.parse?.[field];
      if (parser) {
        const element = records.get(row.id)?.texts.find(binding => binding.descriptor.name === field)?.element;
        try {
          value = parser(String(draft.entered ?? ""), ruleContext(row, field, enteredValues, element));
        } catch (cause) {
          parseErrors.set(field, cause instanceof Error && cause.message ? cause.message : "Input could not be parsed.");
        }
        if (value === undefined && !parseErrors.has(field)) {
          parseErrors.set(field, "Input could not be parsed.");
        }
      }
      if (!parseErrors.has(field)) {
        parsed.set(field, value);
        values = writePath(values, draft.path, value);
      }
    }
    return { values, parsed, parseErrors };
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

  function validateRow(row: RowSnapshot<T>, candidate = candidateValues(row),
    pending = drafts.get(row.id), publish = true): ValidationIssue[] {
    const record = records.get(row.id);
    const { values, parseErrors } = candidate;
    const issues: ValidationIssue[] = [];
    for (const [index, descriptor] of textFields.entries()) {
      const bound = record?.texts[index];
      const element = bound?.element.isConnected ? bound.element : undefined;
      const value = readPath(values, descriptor.path);
      const parseError = parseErrors.get(descriptor.name);
      if (parseError) {
        issues.push({ rowId: row.id, field: descriptor.name, rule: "parse",
          message: parseError, ...(element ? { element } : {}) });
        continue;
      }
      const context = ruleContext(row, descriptor.name, values, element);
      const source = (bound?.element ?? authored[descriptor.index]).cloneNode(true);
      if (source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement) {
        display(source, pending?.get(descriptor.name)?.entered ?? value);
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
    const byField = new Map<string, string[]>();
    for (const issue of issues) {
      const messages = byField.get(issue.field) ?? [];
      messages.push(issue.message);
      byField.set(issue.field, messages);
    }
    if (publish) {
      if (issues.length) issueText.set(row.id, byField);
      else issueText.delete(row.id);
      if (record) showIssues(record, byField);
    }
    return issues;
  }

  function showIssues(record: RenderedRow<T>, byField: ReadonlyMap<string, readonly string[]>): void {
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
      region.textContent = (byField.get(field) ?? []).join(" ");
    }
    record.hasIssues = byField.size > 0;
  }

  function resetRecord(record: RenderedRow<T>): void {
    record.snapshot = undefined;
    for (const binding of record.texts) binding.bound = false;
    for (const binding of record.selects) binding.selectedBound = false;
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

    const candidate = candidateValues(row);
    const issues = validateRow(row, candidate);
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
        const next = writePath(current.value as Readonly<Record<string, unknown>>, draft.path, candidate.parsed.get(field));
        const key = draft.path[0] as keyof T;
        try {
          options.rows.set(id, key, next[draft.path[0]] as T[keyof T]);
          pending.delete(field);
        } catch (cause) {
          try {
            const stored = options.rows.get(id);
            if (stored && Object.is(readPath(stored.value, draft.path), candidate.parsed.get(field))) {
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
    const record = records.get(id);
    if (record) resetRecord(record);
    render()?.();
    const updated = options.rows.get(id);
    if (!updated || updated.status === "delete") {
      throw gridError("GRID_ROW", "The row ID is not available in this Grid.", { id });
    }
    return validateRow(updated);
  }

  function onRows(event: RowsEvent): void {
    if (pasteCommit) pasteNotified = true;
    if (event.type === "replace" || (event.type === "revert" && event.id === undefined)) {
      drafts.clear();
      issueText.clear();
      for (const record of records.values()) {
        resetRecord(record);
        clearIssues(record);
      }
    } else if (event.type === "remove" || event.type === "revert") {
      if (event.id !== undefined) {
        drafts.delete(event.id);
        issueText.delete(event.id);
        const record = records.get(event.id);
        if (record) {
          resetRecord(record);
          clearIssues(record);
        }
      }
    } else if (event.type === "set" || event.type === "setMany") {
      for (const id of event.type === "setMany" ? event.ids : [event.id]) {
        const pending = drafts.get(id);
        const row = pending ? options.rows.get(id) : undefined;
        if (pending && row && !reconciling) {
          for (const [field, draft] of pending) {
            if (!Object.is(readPath(row.value, draft.path), draft.baseline)) pending.delete(field);
          }
          if (!pending.size) drafts.delete(id);
        }
        const record = records.get(id);
        if (!reconciling) issueText.delete(id);
        if (record) {
          if (pending) resetRecord(record);
          if (!reconciling) clearIssues(record);
        }
      }
    }
    if (!pasteCommit) render()?.();
  }
  function syncSelection(): void {
    if (!buttonIndexes.length && !checkIndexes.length && !headerChecks.length) return;
    const selectedIds = new Set(selection.selectedIds());
    const checkedIds = new Set(selection.checkedIds());
    for (const [id, record] of records) {
      const selectable = selection.eligible(id, "selection");
      for (const [index, button] of record.buttons.entries()) {
        button.disabled = record.buttonDisabled[index] || !selectable;
        button.setAttribute("aria-pressed", String(options.multiple ? selectedIds.has(id) : selection.selected() === id));
        if (options.multiple) {
          if (selection.selected() === id) button.setAttribute("aria-current", "true");
          else button.removeAttribute("aria-current");
        }
      }
      const checkable = record.checks.length ? selection.eligible(id, "check") : false;
      for (const [index, check] of record.checks.entries()) {
        check.checked = checkedIds.has(id);
        check.disabled = record.checkDisabled[index] || !checkable;
      }
    }
    for (const header of headerChecks) {
      const state = selection.checkState(header.scope);
      header.element.checked = state.checked;
      header.element.indeterminate = state.indeterminate;
      header.element.disabled = header.disabled || state.total === 0;
    }
  }

  function refreshFilters(): void {
    for (const binding of filterBindings) {
      const source = columnFilters.filterChoices(binding.key);
      const search = filterSearchElements
        .find(input => input.getAttribute("data-filter-search") === binding.key)?.value ?? "";
      if (binding.source !== source || binding.query !== search) {
        binding.shown = search ? columnFilters.filterChoices(binding.key, search) : source;
        binding.handle.setChoices(binding.shown.map(choice => ({ value: choice.value, label: `${choice.label} (${choice.count})` })));
        binding.source = source;
        binding.query = search;
      }
      binding.handle.setValue(columnFilters.columnFilter(binding.key) ?? source.map(choice => choice.value));
    }
  }

  function refreshView(): (() => void) | undefined {
    const previousRequest = pageRequest;
    const previousState = pageState;
    const previousFiltered = filteredIds;
    const previousIds = new Set(visibleIds);
    try { return render(); }
    catch (cause) {
      pageRequest = previousRequest;
      pageState = previousState;
      filteredIds = previousFiltered;
      for (const [id, record] of records) {
        if (previousIds.has(id)) continue;
        releaseRecord(record);
        records.delete(id);
      }
      throw cause;
    }
  }

  function applySort(compare: ((a: Snapshot<T>, b: Snapshot<T>) => number) | null,
    indicator?: SortIndicator, key: string | null = null): void {
    if (compare !== null && typeof compare !== "function") {
      throw gridError("GRID_SORT", "A sort comparator must be a function or null.");
    }
    if (indicator && (compare === null || !(indicator.column instanceof HTMLTableCellElement) ||
        indicator.column.tagName !== "TH" || !authoredHeaders.has(indicator.column) ||
        !["ascending", "descending"].includes(indicator.direction))) {
      throw gridError("GRID_SORT", "A sort indicator needs a table header and ascending or descending direction.");
    }
    const previous = sort;
    sort = compare;
    let notify: (() => void) | undefined;
    try { notify = refreshView(); }
    catch (cause) { sort = previous; throw cause; }
    if (sortIndicator) {
      const original = headerOriginals.get(sortIndicator.column) ?? null;
      if (original === null) sortIndicator.column.removeAttribute("aria-sort");
      else sortIndicator.column.setAttribute("aria-sort", original);
    }
    sortIndicator = indicator ?? null;
    sortKey = key;
    if (sortIndicator) {
      const column = sortIndicator.column;
      if (!headerOriginals.has(column)) headerOriginals.set(column, column.getAttribute("aria-sort"));
      column.setAttribute("aria-sort", sortIndicator.direction);
    }
    notify?.();
  }

  function restoreHeader(): void {
    for (const binding of filterBindings) binding.handle.dispose();
    filterBindings.length = 0;
    for (const header of headerChecks) {
      header.element.checked = header.checked;
      header.element.indeterminate = header.mixed;
      header.element.disabled = header.disabled;
    }
  }

  function render(): (() => void) | undefined {
    if (disposed) return;
    viewRevision++;
    const focused = root.ownerDocument.activeElement;
    const focusedRow = focused instanceof Element ? focused.closest("tr") : null;
    const focusedId = focusedRow && rowIds.get(focusedRow);
    const notify = selection.prune();
    if (disposed) return;
    const entries = options.rows.entries();
    const filtered = entries.filter(row => (!filter || filter(row.value)) && columnFilters.matches(row.value));
    if (sort) filtered.sort((left, right) => sort!(left.value, right.value));
    // Evaluate application filter callbacks before changing row DOM.
    for (const binding of filterBindings) columnFilters.filterChoices(binding.key);
    const pages = pageRequest ? Math.ceil(filtered.length / pageRequest.size) : 0;
    const page = pageRequest ? Math.min(pageRequest.page, Math.max(1, pages)) : 0;
    if (pageRequest && page !== pageRequest.page) pageRequest = { page, size: pageRequest.size };
    pageState = pageRequest ? Object.freeze({ page, size: pageRequest.size, total: filtered.length, pages }) : null;
    const displayed = pageRequest ? filtered.slice((page - 1) * pageRequest.size, page * pageRequest.size) : filtered;
    const nextIds = displayed.map(row => row.id);
    for (const snapshot of displayed) {
      let record = records.get(snapshot.id);
      if (!record) {
        record = createRecord(snapshot.id);
        records.set(snapshot.id, record);
        renderRecord(record, snapshot);
        const issues = issueText.get(snapshot.id);
        if (issues) showIssues(record, issues);
      } else {
        renderRecord(record, snapshot);
      }
    }
    if (nextIds.length !== visibleIds.length || nextIds.some((id, index) => id !== visibleIds[index])) {
      const nextSet = new Set(nextIds);
      const restoreFocus = focused instanceof HTMLElement && focusedId !== undefined &&
        focusedId !== null && nextSet.has(focusedId);
      const moveFocus = focused instanceof HTMLElement && focusedId !== undefined &&
        focusedId !== null && !nextSet.has(focusedId);
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
      } else if (moveFocus) {
        const candidates = [...root.querySelectorAll<HTMLElement>(
          'tbody button[data-select-row]:not(:disabled), tbody input:not(:disabled), tbody textarea:not(:disabled), tbody select:not(:disabled)'
        ), ...root.querySelectorAll<HTMLElement>('thead button:not(:disabled)')];
        if (!candidates.some(focusVisible)) {
          if (!root.hasAttribute("tabindex")) {
            root.tabIndex = -1;
            rootFocusTabIndex = true;
          }
          focusVisible(root);
        }
      }
      visibleIds = nextIds;
      for (const [id, record] of records) {
        if (nextSet.has(id)) continue;
        releaseRecord(record);
        records.delete(id);
      }
    }
    filteredIds = filtered.map(row => row.id);
    syncSelection();
    refreshFilters();
    return notify;
  }

  function onClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("table") !== root) return;
    const sortButton = target.closest<HTMLButtonElement>("button[data-sort-column]");
    if (sortButton && sortButtons.includes(sortButton) && !sortButton.matches(":disabled")) {
      const key = sortButton.getAttribute("data-sort-column")!;
      const direction = sortKey !== key ? "ascending" : sortIndicator?.direction === "ascending" ? "descending" : null;
      const compare = sorters.get(key)!;
      applySort(direction === null ? null : direction === "ascending" ? compare : (a, b) => -compare(a, b),
        direction === null ? undefined : { column: sortButton.closest("th")!, direction }, direction === null ? null : key);
      return;
    }
    const reset = target.closest<HTMLButtonElement>("button[data-clear-filter]");
    if (reset && root.tHead?.contains(reset) && !reset.matches(":disabled")) {
      columnFilters.setColumnFilter(reset.getAttribute("data-clear-filter")!, null);
      return;
    }
    const action = target.closest<HTMLButtonElement>("button[data-row-action]");
    if (action && !action.matches(":disabled")) {
      const id = rowIds.get(action.closest("tr")!);
      const row = id === undefined ? undefined : options.rows.get(id);
      if (row && row.status !== "delete") options.onRowAction?.({ action: action.getAttribute("data-row-action")!, id: row.id, row, element: action, event });
      return;
    }
    const button = target.closest<HTMLButtonElement>("button[data-select-row]");
    const row = button?.closest<HTMLTableRowElement>("tr");
    const id = row ? rowIds.get(row) : undefined;
    if (button && id !== undefined && !button.matches(":disabled")) selection.choose(id, event);
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (!options.multiple || !(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>("button[data-select-row]");
    if (!button || button.closest("table") !== root || button.matches(":disabled")) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
      selection.setSelected(visibleIds.filter(id => selection.eligible(id, "selection")), event);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      selection.setSelected([], event);
      return;
    }
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const buttons = visibleIds.flatMap(id => selection.eligible(id, "selection")
      ? (records.get(id)?.buttons ?? []).filter(button => !button.matches(":disabled") &&
        !button.closest("[hidden], [inert]") && button.getClientRects().length > 0) : []);
    const index = buttons.indexOf(button);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
      : index + (event.key === "ArrowDown" ? 1 : -1);
    const target = buttons[Math.max(0, Math.min(buttons.length - 1, next))];
    if (!target) return;
    event.preventDefault();
    const id = rowIds.get(target.closest("tr")!)!;
    const origin = rowIds.get(button.closest("tr")!);
    if (!event.shiftKey || selection.choose(id, event, origin)) focusVisible(target);
  }

  function draft(id: RowId, field: string, path: readonly string[], entered: unknown, commit: boolean): void {
    const row = options.rows.get(id);
    if (!row || row.status === "delete") return;
    const pending = drafts.get(id) ?? new Map<string, FieldDraft>();
    const baseline = pending.get(field)?.baseline ?? readPath(row.value, path);
    pending.set(field, { entered, baseline, path });
    drafts.set(id, pending);
    if (commit) reconcile(id);
    else validateRow(row);
  }

  function onInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement && root.tHead?.contains(target) && target.hasAttribute("data-filter-search")) {
      refreshFilters();
      return;
    }
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) ||
        target instanceof HTMLInputElement && target.type === "checkbox") return;
    const entry = edits.get(target);
    if (!entry) return;
    draft(entry.id, entry.binding.descriptor.name, entry.binding.descriptor.path, target.value, false);
  }

  function onChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement && !target.matches(":disabled")) {
      const header = headerChecks.find(header => header.element === target);
      if (header) {
        try { selection.checkAll(target.checked, header.scope, event); }
        finally { syncSelection(); }
        return;
      }
      if (target.hasAttribute("data-check-row")) {
        const id = rowIds.get(target.closest("tr")!);
        if (id === undefined) return;
        const next = new Set(selection.checkedIds());
        if (target.checked) next.add(id); else next.delete(id);
        try { selection.setChecked([...next], event); }
        finally { syncSelection(); }
        return;
      }
    }
    if (target instanceof HTMLSelectElement) {
      const entry = selects.get(target);
      const path = entry?.binding.descriptor.field;
      const field = entry?.binding.descriptor.name;
      if (!entry || !path || !field) return;
      const option = target.selectedOptions[0];
      if (!option) return;
      const value = entry.binding.rawByOption.has(option) ? entry.binding.rawByOption.get(option) : option.value;
      draft(entry.id, field, path, value, true);
      return;
    }
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    const entry = edits.get(target);
    if (!entry) return;
    const entered = target instanceof HTMLInputElement && target.type === "checkbox"
      ? target.checked : target.value;
    draft(entry.id, entry.binding.descriptor.name, entry.binding.descriptor.path, entered, true);
  }

  function paste(text: string, start: { readonly id: RowId; readonly field: string }): ValidationResult {
    active();
    if (pasting) throw gridError("GRID_PASTE_BUSY", "A paste is already being prepared.");
    if (typeof text !== "string") throw gridError("GRID_PASTE_TEXT", "Paste needs clipboard text.");
    const rowIndex = visibleIds.indexOf(start?.id);
    const first = records.get(start?.id);
    if (rowIndex < 0 || !first) throw gridError("GRID_PASTE_TARGET", "Paste needs a visible row.", { id: start?.id });
    const binding = (record: RenderedRow<T>, field: typeof pasteFields[number]) =>
      field.text >= 0 ? record.texts[field.text] : record.selects[field.select];
    const fields = pasteFields.filter(field => {
      const element = binding(first, field).element;
      return element.isConnected && !element.closest("[hidden]");
    }).sort((a, b) => {
      const left = binding(first, a).element;
      const right = binding(first, b).element;
      return left === right ? 0 : left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    const fieldIndex = fields.findIndex(field => field.name === start.field);
    if (fieldIndex < 0 || new Set(fields.map(field => field.name)).size !== fields.length) {
      throw gridError("GRID_PASTE_TARGET", "Paste needs unique visible field names.", { field: start.field });
    }
    const entries = options.rows.entries();
    const revision = viewRevision;
    const layout = columns.columns();
    const pendingBefore = new Map([...drafts].map(([id, pending]) => [id, new Map(pending)]));
    const issuesBefore = new Map(issueText);
    function current(): void {
      active();
      const sameDrafts = drafts.size === pendingBefore.size && [...pendingBefore].every(([id, pending]) => {
        const actual = drafts.get(id);
        return actual?.size === pending.size && [...pending].every(([field, draft]) => actual.get(field) === draft);
      });
      if (options.rows.entries() !== entries || viewRevision !== revision || columns.columns() !== layout || !sameDrafts) {
        throw gridError("GRID_PASTE_STALE", "The Grid changed while paste was being prepared. Retry with its current view.");
      }
    }
    const issues: ValidationIssue[] = [];
    function issue(id: RowId, field: string, message: string): void {
      const record = records.get(id);
      const descriptor = fields.find(item => item.name === field);
      const element = record && descriptor ? binding(record, descriptor).element : undefined;
      issues.push({ rowId: id, field, rule: "paste", message, ...(element?.isConnected ? { element } : {}) });
    }
    const staged = new Map<RowId, { pending: Map<string, FieldDraft>; pasted: Set<string>; row: RowSnapshot<T> }>();
    const updates: { id: RowId; values: Partial<T> }[] = [];
    pasting = true;
    try {
      let matrix: string[][] = [];
      try { matrix = readClipboard(text); }
      catch (cause) {
        if (!(cause instanceof FrameworkError) || cause.code !== "GRID_PASTE_TEXT") throw cause;
        issue(start.id, start.field, `${cause.message} Clipboard row ${cause.detail?.row}, column ${cause.detail?.column}.`);
      }
      if (rowIndex + matrix.length > visibleIds.length || matrix.some(row => fieldIndex + row.length > fields.length)) {
        issue(start.id, start.field, "Clipboard data exceeds the visible rows or fields. No values were pasted.");
      }
      if (!issues.length) for (const [offset, cells] of matrix.entries()) {
        const id = visibleIds[rowIndex + offset];
        const row = options.rows.get(id)!;
        const record = records.get(id)!;
        const pending = new Map(drafts.get(id));
        const pasted = new Set<string>();
        for (const [column, text] of cells.entries()) {
          const field = fields[fieldIndex + column];
          const bound = binding(record, field);
          const element = bound.element;
          if (element.matches(":disabled") || element.closest('[hidden], [inert], [aria-readonly="true"]') ||
              (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) && element.readOnly) continue;
          let entered: unknown = text;
          if (field.select >= 0) {
            const select = record.selects[field.select];
            const values = [...select.element.options]
              .filter(option => select.rawByOption.has(option) && !option.matches(":disabled") &&
                String(select.rawByOption.get(option) ?? "") === text)
              .map(option => select.rawByOption.get(option));
            if (!values.length || values.some(value => !Object.is(value, values[0]))) {
              issue(id, field.name, "Clipboard text must identify one enabled raw option value.");
              continue;
            }
            entered = values[0];
          } else if (record.texts[field.text].descriptor.checkbox) {
            if (text !== "true" && text !== "false") {
              issue(id, field.name, "Paste true or false into a checkbox.");
              continue;
            }
            entered = text === "true";
          }
          pending.set(field.name, { entered, baseline: readPath(row.value, field.path), path: field.path });
          pasted.add(field.name);
        }
        if (pasted.size) staged.set(id, { row, pending, pasted });
      }
      if (!issues.length) for (const [id, prepared] of staged) {
        const candidate = candidateValues(prepared.row, prepared.pending);
        issues.push(...validateRow(prepared.row, candidate, prepared.pending, false));
        let values = prepared.row.value as Readonly<Record<string, unknown>>;
        const patch: Record<string, unknown> = {};
        for (const field of prepared.pasted) {
          const path = prepared.pending.get(field)!.path;
          if (candidate.parseErrors.has(field)) continue;
          values = writePath(values, path, candidate.parsed.get(field));
          patch[path[0]] = values[path[0]];
        }
        updates.push({ id, values: patch as Partial<T> });
      }
      current();
      if (issues.length) {
        for (const found of issues) {
          if (found.rowId === null) continue;
          const messages = new Map(issueText.get(found.rowId));
          messages.set(found.field, [...new Set([...(messages.get(found.field) ?? []), found.message])]);
          issueText.set(found.rowId, messages);
          const record = records.get(found.rowId);
          if (record) showIssues(record, messages);
        }
      } else {
        function clearPasted(): void {
          for (const [id, prepared] of staged) {
            const pending = drafts.get(id);
            for (const field of prepared.pasted) {
              if (pending?.get(field) === pendingBefore.get(id)?.get(field)) pending?.delete(field);
            }
            if (!pending?.size) drafts.delete(id);
            if (issueText.get(id) === issuesBefore.get(id)) issueText.delete(id);
            const record = records.get(id);
            if (record) {
              resetRecord(record);
              const messages = issueText.get(id);
              if (messages) showIssues(record, messages);
              else clearIssues(record);
            }
          }
        }
        pasteCommit = true;
        pasteNotified = false;
        try {
          options.rows.setMany(updates);
          clearPasted();
        } catch (cause) {
          pasteCommit = false;
          let committed = pasteNotified;
          try { committed ||= options.rows.entries() !== entries; }
          catch { committed = true; }
          if (committed) {
            clearPasted();
            try { if (!disposed) render()?.(); } catch { /* Preserve the committed batch's first error. */ }
          }
          throw cause;
        } finally { pasteCommit = false; }
        if (!disposed && staged.size) render()?.();
      }
    } finally { pasting = false; }
    const result = { valid: issues.length === 0, issues };
    options.onPaste?.(result);
    return result;
  }

  function onPaste(event: ClipboardEvent): void {
    if (!options.paste || event.defaultPrevented || !event.clipboardData?.types.includes("text/plain") ||
        !(event.target instanceof HTMLElement)) return;
    const target = event.target.closest<HTMLElement>("[data-field]") ??
      (event.target.querySelectorAll("[data-field]").length === 1 ? event.target.querySelector<HTMLElement>("[data-field]") : null);
    const row = target?.closest<HTMLTableRowElement>("tr");
    const id = row && rowIds.get(row);
    if (id === undefined || id === null || !target || !root.contains(target)) return;
    event.preventDefault();
    paste(event.clipboardData.getData("text/plain"), { id, field: target.getAttribute("data-field")! });
  }

  root.addEventListener("click", onClick);
  root.addEventListener("input", onInput);
  root.addEventListener("change", onChange);
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("paste", onPaste);
  let unsubscribe = () => {};
  try {
    for (const element of filterElements) {
      const select = element as HTMLSelectElement;
      const key = select.getAttribute("data-filter-column")!;
      let binding: typeof filterBindings[number];
      const handle = bindSelect<SelectValue>(select, { choices: [], onChange(values) {
        if (!Array.isArray(values)) return;
        const next = new Set(columnFilters.columnFilter(key) ?? columnFilters.filterChoices(key).map(choice => choice.value));
        for (const choice of binding.shown) next.delete(choice.value);
        for (const value of values) next.add(value);
        try { columnFilters.setColumnFilter(key, [...next]); }
        catch (cause) { refreshFilters(); throw cause; }
      } });
      binding = { element: select, key, handle, shown: [] };
      filterBindings.push(binding);
    }
    unsubscribe = options.rows.subscribe(onRows);
    render()?.();
    boundRoots.add(root);
  } catch (cause) {
    unsubscribe();
    root.removeEventListener("click", onClick);
    root.removeEventListener("input", onInput);
    root.removeEventListener("change", onChange);
    root.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("paste", onPaste);
    restoreHeader();
    for (const record of records.values()) {
      releaseRecord(record);
    }
    for (const release of templateReleases) release();
    columns.dispose();
    anchor.replaceWith(template);
    throw cause;
  }

  return {
    paste,
    columns() {
      active();
      return columns.columns();
    },
    setColumns(state) {
      active();
      columns.setColumns(state);
    },
    select(id) {
      active();
      selection.select(id);
    },
    selected() {
      active();
      return selection.selected();
    },
    selectedIds() { active(); return selection.selectedIds(); },
    setSelected(ids) { active(); selection.setSelected(ids); },
    checkedIds() { active(); return selection.checkedIds(); },
    setChecked(ids) { active(); selection.setChecked(ids); },
    checkAll(checked, scope) { active(); selection.checkAll(checked, scope); },
    checkState(scope) { active(); return selection.checkState(scope); },
    columnFilter(key) { active(); return columnFilters.columnFilter(key); },
    setColumnFilter(key, values) { active(); columnFilters.setColumnFilter(key, values); },
    filterChoices(key, search) { active(); return columnFilters.filterChoices(key, search); },
    setSort(compare, indicator) {
      active();
      applySort(compare, indicator);
    },
    setFilter(predicate) {
      active();
      if (predicate !== null && typeof predicate !== "function") {
        throw gridError("GRID_FILTER", "A row filter must be a function or null.");
      }
      const previous = filter;
      filter = predicate;
      let notify: (() => void) | undefined;
      try { notify = refreshView(); }
      catch (cause) { filter = previous; throw cause; }
      notify?.();
    },
    setPage(request) {
      active();
      const next = checkedPage(request);
      const previousRequest = pageRequest;
      pageRequest = next;
      let notify: (() => void) | undefined;
      try {
        notify = refreshView();
      } catch (cause) {
        pageRequest = previousRequest;
        throw cause;
      }
      notify?.();
    },
    page() {
      active();
      return pageState;
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
      root.removeEventListener("input", onInput);
      root.removeEventListener("change", onChange);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("paste", onPaste);
      restoreHeader();
      for (const record of records.values()) {
        releaseRecord(record);
      }
      for (const release of templateReleases) release();
      records.clear();
      drafts.clear();
      issueText.clear();
      visibleIds = [];
      filteredIds = [];
      for (const [column, original] of headerOriginals) {
        if (original === null) column.removeAttribute("aria-sort");
        else column.setAttribute("aria-sort", original);
      }
      headerOriginals.clear();
      authoredHeaders.clear();
      columns.dispose();
      if (rootFocusTabIndex && root.getAttribute("tabindex") === "-1") root.removeAttribute("tabindex");
      boundRoots.delete(root);
      anchor.replaceWith(template);
    }
  };
}
