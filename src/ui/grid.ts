// SPDX-License-Identifier: Apache-2.0
import type { RowId, RowSnapshot, RowStatus, Rows, RowsEvent, Snapshot } from "../data/index.js";
import { FrameworkError } from "../internal/framework-error.js";
import { sameJson } from "../internal/same-json.js";
import { parsePath, readPath, writePath } from "./field-path.js";
import { createRuleRunner } from "./rules.js";
import { rowOptions } from "./row-options.js";
import { claimSelect } from "./select-owner.js";
import { bindGridColumns } from "./grid-columns.js";
import { createGridSelection } from "./grid-selection.js";
import { createGridFilters } from "./grid-filters.js";
import { bindSelect } from "./select.js";
import { focusVisible, restoreAttributes } from "./dom-state.js";
import { readClipboard } from "./grid-paste.js";
import { createGridViewport, validateGridViewport } from "./grid-viewport.js";
import { compileGridBody } from "./grid-row-blocks.js";
import { display, displayField, fieldValue, nativeMessage, interactiveContent, disabled as controlDisabled } from "./native-control.js";
import { fieldRenderers, renderField } from "./field-render.js";
import { createGridHooks } from "./grid-hooks.js";
import { bindGridHeight, validateGridHeight } from "./grid-height.js";
import type { GridRowBinding } from "./grid-hooks.js";
import type { GridHeightOptions } from "./grid-height.js";
import type { RuleCall } from "./rules.js";
import type { FormatRule, GridBindResult, GridColumn, GridFilterChoice, GridHandle, GridIdsChange, GridRowScope, PageRequest, PageState, ParseInput, RuleContext, RuleSet, SelectHandle, SelectValue, SortIndicator, ValidateRule, ValidationIssue, ValidationResult } from "./index.js";

const negativeZero = Symbol();

interface TextField {
  index: number;
  indexes: number[];
  kind: "single" | "radio" | "checkbox";
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
  multiple: boolean;
}

interface BoundText {
  descriptor: TextField;
  element: HTMLElement;
  elements: HTMLElement[];
  invalids: (string | null)[];
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
  id: RowId;
  elements: HTMLTableRowElement[];
  mergeCells: HTMLTableCellElement[];
  errors: Map<string, HTMLElement>;
  hasIssues: boolean;
  snapshot?: RowSnapshot<T>;
  texts: BoundText[];
  selects: BoundSelect[];
  buttons: HTMLButtonElement[];
  buttonDisabled: boolean[];
  checks: HTMLInputElement[];
  checkDisabled: boolean[];
  controls: (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];
  deletedDisabled?: boolean[];
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
let nextRadioName = 0;
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

const rowStatuses: readonly RowStatus[] = ["clean", "insert", "update", "delete"];
function checkedStatuses(values: readonly RowStatus[]): readonly RowStatus[] {
  if (!Array.isArray(values) || values.some(value => !rowStatuses.includes(value))) {
    throw gridError("GRID_STATUS", "Status filters need an array of clean, insert, update or delete.");
  }
  return Object.freeze(rowStatuses.filter(status => values.includes(status)));
}

function optionValues(value: unknown, descriptor: SelectField, rowId: RowId) {
  if (!descriptor.options) return [];
  return rowOptions(value, descriptor.options, descriptor.label!, descriptor.value!, field => {
    throw gridError("GRID_OPTIONS", "A row-local Select needs an array of options.", { rowId, field });
  });
}

export function bindGrid<T extends object>(root: HTMLTableElement, options: {
  rows: Rows<T>;
  statusFilter?: readonly RowStatus[];
  beforeRowBind?: (context: GridRowBinding<T>) => void;
  onRowBind?: (context: GridRowBinding<T>) => void;
  onBind?: (result: GridBindResult) => void;
  progressive?: { size: number; delay?: number };
  initialPage?: PageRequest;
  viewport?: { root: HTMLElement; estimate: number; overscan?: number };
  heightResize?: GridHeightOptions;
  rules?: RuleSet;
  parse?: Record<string, ParseInput>;
  paste?: boolean;
  onPaste?: (result: ValidationResult) => void;
  onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void;
  multiple?: boolean;
  toggleSelection?: boolean;
  selectOnRowClick?: boolean;
  checkMode?: "multiple" | "single";
  validateOn?: "change" | "blur" | "manual";
  revealInvalid?: boolean;
  render?: Record<string, (value: unknown, context: RuleContext) => Node | string | null>;
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
  const body = compileGridBody(root);
  const { templates, authored } = body;
  const controlIndexes = authored.flatMap((element, index) =>
    element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement ? [index] : []);
  let statuses = checkedStatuses(options.statusFilter === undefined ? ["clean", "insert", "update"] : options.statusFilter);
  if (options.onBind !== undefined && typeof options.onBind !== "function") {
    throw gridError("GRID_BIND", "onBind must be a synchronous function.");
  }
  const progressive = options.progressive;
  if (progressive !== undefined && (!progressive || typeof progressive !== "object" || Array.isArray(progressive) ||
      !Number.isSafeInteger(progressive.size) || progressive.size <= 0 ||
      progressive.delay !== undefined && (typeof progressive.delay !== "number" || !Number.isFinite(progressive.delay) ||
        progressive.delay < 0 || progressive.delay > 2147483647))) {
    throw gridError("GRID_PROGRESSIVE", "progressive needs a positive safe-integer size and a delay from 0 to 2147483647.");
  }
  const bindingWindow = root.ownerDocument.defaultView!;
  const restoreBusyAttribute = restoreAttributes(root, ["aria-busy"]);
  const cleanupErrors: unknown[] = [];
  const failedPrunes: (() => void)[] = [];
  const hooks = createGridHooks(options, cause => cleanupErrors.push(cause));
  const emptyMarkers = [...root.querySelectorAll<HTMLElement>("[data-empty]")]
    .filter(element => element.closest("table") === root);
  if (emptyMarkers.length > 1 || emptyMarkers.some(element =>
    !["TR", "TBODY"].includes(element.tagName) || templates.some(template => template.contains(element) || element.contains(template)))) {
    throw gridError("GRID_EMPTY", "Use one static tr or tbody marked data-empty outside the record template.");
  }
  const empty = emptyMarkers[0];
  const restoreEmpty = empty && restoreAttributes(empty, ["hidden"]);
  if (options.viewport !== undefined) validateGridViewport(root, templates, options.viewport);
  if (options.heightResize !== undefined) validateGridHeight(root, options.heightResize, options.viewport?.root);
  body.validate();
  const validateOn = options.validateOn ?? "change";
  if (!["change", "blur", "manual"].includes(validateOn) ||
      options.revealInvalid !== undefined && typeof options.revealInvalid !== "boolean") {
    throw gridError("GRID_VALIDATE", "Use change, blur or manual validation and a boolean revealInvalid.");
  }
  const parsers = new Map(Object.entries(options.parse ?? {}));

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
        authored: [...select.options].map(option => option.value === "" ? null : option.value),
        multiple: select.multiple
      });
    } else if (fieldName !== null) {
      if (element instanceof HTMLInputElement) {
        const type = element.getAttribute("type")?.toLowerCase() ?? element.type;
        if (type === "file") {
          throw gridError("GRID_FILE_ROWS", "File inputs cannot bind to JSON Rows.", { field: fieldName });
        }
        if (element.hasAttribute("data-format") &&
            !["text", "search", "tel", "url", "email", "password"].includes(type)) {
          throw gridError("GRID_FORMAT", "Only text-like inputs can display formatted text.", { field: fieldName });
        }
        if (!["text", "search", "tel", "url", "email", "password", "checkbox", "radio", "number", "range", "date", "time", "datetime-local", "month", "week", "color", "hidden"].includes(type)) {
          throw gridError("GRID_CONTROL", "Use a native value input; buttons and file inputs cannot edit JSON Rows.", { field: fieldName });
        }
        if (["number", "range"].includes(type) && typeof parsers.get(fieldName) !== "function") {
          throw gridError("GRID_PARSE_FIELD", "A number or range input needs a parser to preserve its raw value type.", { field: fieldName });
        }
      }
      const kind = element instanceof HTMLInputElement && ["radio", "checkbox"].includes(element.type)
        ? element.type as "radio" | "checkbox" : "single";
      const existing = textFields.find(field => field.name === fieldName && field.kind !== "single");
      if (existing) {
        if (kind !== existing.kind) throw gridError("GRID_CONTROL", "One field group needs matching native controls.", { field: fieldName });
        if (kind === "radio" && (authored[existing.index] as HTMLInputElement).form !== (element as HTMLInputElement).form) {
          throw gridError("GRID_CONTROL", "One radio field needs the same native form owner.", { field: fieldName });
        }
        if (existing.indexes.some(member => (authored[member] as HTMLInputElement).value === (element as HTMLInputElement).value)) {
          throw gridError("GRID_CONTROL", "Group choices need distinct values.", { field: fieldName });
        }
        existing.indexes.push(index);
        continue;
      }
      textFields.push({ index, indexes: [index], kind, name: fieldName, path: parsePath(fieldName),
        format: runner.formats(element, fieldName), validate: runner.validators(element, fieldName),
        editable: element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement,
        checkbox: element instanceof HTMLInputElement && element.type === "checkbox" });
    }
  }

  if (options.selectOnRowClick !== undefined && typeof options.selectOnRowClick !== "boolean" ||
      options.selectOnRowClick && !buttonIndexes.length) {
    throw gridError("GRID_SELECT", "selectOnRowClick needs a boolean and an authored row selection button when enabled.");
  }

  for (const field of textFields) if (field.kind !== "single") {
    if (textFields.some(other => other !== field && other.name === field.name) || selectFields.some(other => other.name === field.name)) {
      throw gridError("GRID_CONTROL", "A group field cannot also bind another control.", { field: field.name });
    }
    for (const attribute of ["data-format", "data-validate"] as const) {
      const values = field.indexes.map(index => authored[index].getAttribute(attribute)).filter(value => value !== null);
      if (new Set(values).size > 1) throw gridError("GRID_CONTROL", "One group needs one rule declaration.", { field: field.name });
    }
    if (field.indexes.some(index => authored[index].hasAttribute("data-format"))) {
      throw gridError("GRID_FORMAT", "A choice group cannot display formatted text.", { field: field.name });
    }
    const validate = field.indexes.find(index => authored[index].hasAttribute("data-validate")) ?? field.index;
    field.validate = runner.validators(authored[validate], field.name);
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
  const authoredDefaults: { name: string; path: readonly string[]; value: unknown }[] = [];
  for (const field of textFields) if (field.editable) {
    authoredDefaults.push({ name: field.name, path: field.path, value: fieldValue({
      element: authored[field.index], elements: field.indexes.map(index => authored[index]), kind: field.kind
    }) });
  }
  for (const field of selectFields) if (field.name && field.field) {
    const select = authored[field.index] as HTMLSelectElement;
    const selected = [...select.selectedOptions].map(option => field.authored[option.index]);
    authoredDefaults.push({ name: field.name, path: field.field, value: field.multiple ? selected : selected[0] ?? null });
  }
  const renderers = fieldRenderers("bindGrid", [
    ...textFields.map(field => ({ name: field.name, element: authored[field.index] })),
    ...selectFields.flatMap(field => field.name ? [{ name: field.name, element: authored[field.index] }] : [])
  ], options.render);
  const selection = createGridSelection(options, {
    visible: () => { active(); return visibleIds; },
    filtered: () => { active(); return filteredIds; },
    revision: () => { active(); return viewRevision; },
    changed: syncSelection
  });
  const columnFilters = createGridFilters(options, () => filter, refreshView, statusEntries);
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
  const filterApplyBindings = [...root.tHead?.querySelectorAll<HTMLElement>("[data-apply-filter]") ?? []].map(element => {
    const key = element.getAttribute("data-apply-filter")!;
    const inputs = filterSearchElements.filter(input => input.getAttribute("data-filter-search") === key);
    if (!(element instanceof HTMLButtonElement) || element.type !== "button" || !filterKeys.has(key) || inputs.length !== 1) {
      throw gridError("GRID_FILTER", "An Apply button needs a configured key and exactly one matching filter search input.");
    }
    return { element, key, input: inputs[0] };
  });
  const filterBindings: { element: HTMLSelectElement; key: string; handle: SelectHandle<SelectValue>;
    source?: readonly GridFilterChoice[]; query?: string; shown: readonly GridFilterChoice[] }[] = [];
  let rootFocusTabIndex = false;
  const authoredHeaders = new Set(root.tHead?.querySelectorAll<HTMLTableCellElement>("th") ?? []);
  let viewport: ReturnType<typeof createGridViewport> | undefined;
  let height: ReturnType<typeof bindGridHeight> | undefined;
  if (options.onColumnsChange !== undefined && typeof options.onColumnsChange !== "function") {
    throw gridError("GRID_COLUMNS", "onColumnsChange must be a function.");
  }
  const columns = bindGridColumns(root, templates, options.columns, change => {
    cancelOperation();
    mergeRows();
    viewport?.invalidate();
    options.onColumnsChange?.(change);
  });
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
  const staticRows = [...root.rows].filter(row => !templates.includes(row));
  const staticRowIndexes = staticRows.map(row => row.rowIndex);
  const templatePosition = templates[0].rowIndex;
  const restoreAria = restoreAttributes(root, ["aria-rowcount"]);
  const restoreChanged = restoreAttributes(root, ["data-changed"]);
  const restoreStaticAria = staticRows.map(row => restoreAttributes(row, ["aria-rowindex"]));
  const anchor = body.mount();
  const records = new Map<RowId, RenderedRow<T>>();
  const drafts = new Map<RowId, Map<string, FieldDraft>>();
  const issueText = new Map<RowId, Map<string, string[]>>();
  const validationControls = new Map<number, HTMLInputElement | HTMLTextAreaElement>();
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
  let visibleIds: readonly RowId[] = Object.freeze([]);
  let visibleIndexes = new Map<RowId, number>();
  let mergeKeys = new Map<RowId, readonly unknown[]>();
  let mountedIds: readonly RowId[] = [];
  let filteredIds: readonly RowId[] = Object.freeze([]);
  let viewRevision = 0;
  let sortKey: string | null = null;
  let disposed = false;
  let available = 0;
  type BindingGoal = { start: number; target: number; event: RowsEvent | null; emit?: boolean };
  type BindingOperation = BindingGoal & {
    promise: Promise<GridBindResult>; resolve: (result: GridBindResult) => void; reject: (cause: unknown) => void;
    timer?: number; completed: boolean; cancelled: boolean; started: boolean; notify?: () => void; ids: readonly RowId[]; cursor: number;
    revision: number; rows: readonly RowSnapshot<T>[]; layout: readonly GridColumn[];
  };
  let operation: BindingOperation | undefined;
  let unfinished: BindingGoal | undefined;
  let bindingPromise: Promise<GridBindResult> | undefined;
  let lastBinding: GridBindResult | undefined;
  let cachedStatusSource: readonly RowSnapshot<T>[] | undefined;
  let cachedStatusFilter: readonly RowStatus[] | undefined;
  let cachedStatusEntries: readonly RowSnapshot<T>[] = [];

  function statusEntries(): readonly RowSnapshot<T>[] {
    const source = options.rows.entries({ includeDeleted: statuses.includes("delete") });
    if (statuses.length === 3 && !statuses.includes("delete")) return source;
    if (source !== cachedStatusSource || statuses !== cachedStatusFilter) {
      cachedStatusEntries = Object.freeze(source.filter(row => statuses.includes(row.status)));
      cachedStatusSource = source;
      cachedStatusFilter = statuses;
    }
    return cachedStatusEntries;
  }

  function bindable(): void {
    active();
    if (hooks.running) throw gridError("GRID_BIND_REENTRANT", "A row callback cannot reenter binding.");
  }

  function cleanupFailure(): void {
    if (!cleanupErrors.length) return;
    const cause = cleanupErrors[0];
    cleanupErrors.length = 0;
    throw cause;
  }

  function failBinding(cause: unknown): never {
    const pending = failedPrunes.splice(0);
    for (const notify of pending) {
      if (disposed) break;
      try { notify(); } catch { /* The failed binding remains the primary error. */ }
    }
    throw cause;
  }

  function defaults(): Record<string, unknown> {
    active();
    let values: Record<string, unknown> = {};
    const names = new Set<string>();
    for (const field of authoredDefaults) {
      if (names.has(field.name)) throw gridError("GRID_DEFAULTS", "Defaults need unique native field paths.", { field: field.name });
      names.add(field.name);
      try { values = writePath(values, field.path, structuredClone(field.value)); }
      catch (cause) { throw new FrameworkError({ api: "bindGrid", code: "GRID_DEFAULTS", message: "Native defaults have conflicting paths.", detail: { field: field.name }, cause }); }
    }
    let parsed = values;
    for (const field of textFields) if (field.editable && parsers.has(field.name)) {
      try {
        const value = parsers.get(field.name)!(String(readPath(values, field.path) ?? ""), {
          field: field.name, values, rowId: null, element: authored[field.index]
        });
        if (value === undefined) throw new TypeError("A default parser must return a raw value.");
        if (value !== null && (typeof value === "object" || typeof value === "function") &&
            typeof (value as { then?: unknown }).then === "function") {
          void Promise.resolve(value).catch(() => {});
          throw new TypeError("Default parsers must finish synchronously.");
        }
        parsed = writePath(parsed, field.path, value);
      } catch (cause) {
        throw new FrameworkError({ api: "bindGrid", code: "GRID_DEFAULTS", message: "A native default could not be parsed.", detail: { field: field.name }, cause });
      }
      active();
    }
    try { return structuredClone(parsed); }
    catch (cause) { throw new FrameworkError({ api: "bindGrid", code: "GRID_DEFAULTS", message: "Defaults must contain cloneable raw values.", cause }); }
  }

  function active(): void {
    if (disposed) throw gridError("GRID_DISPOSED", "This Grid has been disposed.");
  }

  function disabled(element: HTMLElement): boolean {
    return controlDisabled(element, root);
  }

  function createRecord(id: RowId): RenderedRow<T> {
    const { elements, nodes, mergeCells } = body.clone();
    const texts = textFields.map(descriptor => ({
      descriptor,
      element: nodes[descriptor.index],
      elements: descriptor.indexes.map(index => nodes[index]),
      invalids: descriptor.indexes.map(index => nodes[index].getAttribute("aria-invalid")),
      bound: false
    }));
    for (const binding of texts) {
      if (binding.descriptor.kind === "radio") {
        let name: string;
        do { name = `natural-grid-radio-${++nextRadioName}`; } while (root.ownerDocument.getElementsByName(name).length);
        for (const element of binding.elements) (element as HTMLInputElement).name = name;
      }
      if (binding.descriptor.editable) {
        for (const element of binding.elements) edits.set(element, { id, binding });
      }
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
        ...texts.filter(binding => binding.descriptor.name === field).flatMap(binding => binding.elements),
        ...rowSelects.filter(binding => binding.descriptor.name === field).map(binding => binding.element)
      ];
      for (const control of controls) {
        const ids = new Set((control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean));
        ids.add(candidate);
        control.setAttribute("aria-describedby", [...ids].join(" "));
      }
    }
    const checks = checkIndexes.map(index => nodes[index] as HTMLInputElement);
    for (const element of elements) rowIds.set(element, id);
    return { id, elements, mergeCells, errors, hasIssues: false, texts, selects: rowSelects, buttons,
      controls: controlIndexes.map(index => nodes[index] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement),
      buttonDisabled: buttons.map(button => button.disabled), checks, checkDisabled: checks.map(check => check.disabled),
      releaseColumns: columns.attach(elements) };
  }

  function releaseRecord(record: RenderedRow<T>): void {
    hooks.release(record.id);
    for (const element of record.elements) element.remove();
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
        if (descriptor.multiple) {
          const selected = Array.isArray(current) ? current : [];
          for (const option of element.options) option.selected = selected.some(value => Object.is(binding.rawByOption.get(option), value));
        } else element.selectedIndex = [...element.options].findIndex(option =>
          Object.is(binding.rawByOption.get(option), current));
        binding.previous = current;
        binding.selectedBound = true;
      }
    }
  }

  function renderStatus(record: RenderedRow<T>, snapshot: RowSnapshot<T>): void {
    for (const element of record.elements) element.setAttribute("data-row-status", snapshot.status);
    if (snapshot.status === "delete") {
      record.deletedDisabled ??= record.controls.map(control => control.disabled);
      for (const control of record.controls) control.disabled = true;
    } else if (record.deletedDisabled) {
      record.controls.forEach((control, index) => { control.disabled = record.deletedDisabled![index]; });
      record.deletedDisabled = undefined;
    }
  }

  function renderRecord(record: RenderedRow<T>, snapshot: RowSnapshot<T>): void {
    if (record.snapshot === snapshot) return;
    const original = snapshot.status === "update" || snapshot.status === "delete"
      ? options.rows.original(snapshot.id) : undefined;
    for (const binding of record.texts) {
      const changed = original !== undefined && !sameJson(
        readPath(original, binding.descriptor.path), readPath(snapshot.value, binding.descriptor.path));
      for (const element of binding.elements) element.setAttribute("data-field-changed", String(changed));
      const draft = drafts.get(snapshot.id)?.get(binding.descriptor.name);
      const value = draft ? draft.entered : readPath(snapshot.value, binding.descriptor.path);
      if (!binding.bound || !Object.is(binding.previous, value)) {
        const field = binding.descriptor;
        const renderer = renderers.get(field.name);
        if ((renderer || field.format.length) && !draft) {
          const context: RuleContext = {
            field: field.name, values: snapshot.value as Snapshot<Record<string, unknown>>,
            rowId: snapshot.id, element: binding.element
          };
          if (renderer) renderField("bindGrid", binding.element, value, context, renderer, !!binding.element.closest("[data-merge]"));
          else display(binding.element, runner.format(field.format, value, context));
        } else {
          if (field.kind === "single") display(binding.element, value);
          else displayField({ element: binding.element, elements: binding.elements, kind: field.kind }, value);
        }
        binding.previous = value;
        binding.bound = true;
      }
    }
    for (const binding of record.selects) {
      if (binding.descriptor.field) binding.element.setAttribute("data-field-changed", String(original !== undefined &&
        !sameJson(readPath(original, binding.descriptor.field), readPath(snapshot.value, binding.descriptor.field))));
      renderSelect(binding, snapshot.value, snapshot.id);
    }
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
      const parser = parsers.get(field);
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
      const original = bound?.element ?? authored[descriptor.index];
      if (descriptor.kind === "radio" || descriptor.checkbox && descriptor.indexes.length > 1) {
        const members = bound?.elements ?? descriptor.indexes.map(index => authored[index]);
        const draft = pending?.get(descriptor.name);
        const entered = draft ? draft.entered : value;
        const selected = descriptor.kind === "radio" ? entered == null ? [] : [String(entered)] : Array.isArray(entered) ? entered : [];
        const available = members.map(member => (member as HTMLInputElement).value);
        const required = members.some(member => (member as HTMLInputElement).required) && members.some(member => !disabled(member));
        if (selected.some(item => !available.includes(String(item))) || descriptor.kind === "checkbox" && !Array.isArray(entered) && entered != null) {
          issues.push({ rowId: row.id, field: descriptor.name, rule: "select-option", message: "Choose available group values.", ...(element ? { element } : {}) });
        }
        if (required && !selected.length) issues.push({ rowId: row.id, field: descriptor.name, rule: "html", message: "Select an option.", ...(element ? { element } : {}) });
      } else if (original instanceof HTMLInputElement || original instanceof HTMLTextAreaElement) {
        let source = bound ? original.cloneNode(true) as HTMLInputElement | HTMLTextAreaElement
          : validationControls.get(descriptor.index);
        if (!source) {
          source = original.cloneNode(true) as HTMLInputElement | HTMLTextAreaElement;
          validationControls.set(descriptor.index, source);
        }
        source.disabled = disabled(original);
        display(source, pending?.get(descriptor.name)?.entered ?? value);
        const message = nativeMessage(source, pending?.get(descriptor.name)?.entered ?? value);
        if (message) {
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
      const selected = descriptor.multiple ? Array.isArray(value) ? value : [] : [value];
      if (descriptor.multiple && !Array.isArray(value) || selected.some(item => !available.some(option => Object.is(option, item)))) {
        issues.push({
          rowId: row.id, field: descriptor.name, rule: "select-option",
          message: "Choose an available option.", ...(element ? { element } : {})
        });
      }
      if (!disabled(bound?.element ?? authored[descriptor.index]) && (authored[descriptor.index] as HTMLSelectElement).required &&
          (descriptor.multiple ? !selected.length : value === null || value === "" || value === undefined)) {
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
      for (const [index, element] of bound.elements.entries()) {
        if (invalid) element.setAttribute("aria-invalid", "true");
        else if (bound.invalids[index] === null) element.removeAttribute("aria-invalid");
        else element.setAttribute("aria-invalid", bound.invalids[index]!);
      }
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
    showIssues(record, new Map());
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
    bindRows();
    const updated = options.rows.get(id);
    if (!updated || updated.status === "delete") {
      throw gridError("GRID_ROW", "The row ID is not available in this Grid.", { id });
    }
    return validateRow(updated);
  }

  function onRows(event: RowsEvent): void {
    bindable();
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
    if (!pasteCommit) bindRows(event.type === "replace" || event.type === "append" ? event : false);
  }
  const membershipSets = new WeakMap<readonly RowId[], ReadonlySet<RowId>>();
  function membership(ids: readonly RowId[]): ReadonlySet<RowId> {
    let result = membershipSets.get(ids);
    if (!result) { result = new Set(ids); membershipSets.set(ids, result); }
    return result;
  }

  function syncRecordSelection(id: RowId, record: RenderedRow<T>,
    selectedIds: ReadonlySet<RowId> = membership(selection.selectedIds()),
    checkedIds: ReadonlySet<RowId> = membership(selection.checkedIds())): void {
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

  function syncSelection(): void {
    if (!buttonIndexes.length && !checkIndexes.length && !headerChecks.length) return;
    const selectedIds = membership(selection.selectedIds());
    const checkedIds = membership(selection.checkedIds());
    for (const [id, record] of records) syncRecordSelection(id, record, selectedIds, checkedIds);
    for (const header of headerChecks) {
      const state = selection.checkState(header.scope);
      header.element.checked = state.checked;
      header.element.indeterminate = state.indeterminate;
        header.element.disabled = header.disabled || state.total === 0 || options.checkMode === "single" && state.total > 1;
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

  function applyFilter(binding: typeof filterApplyBindings[number]): void {
    const query = binding.input.value;
    const blank = !query.trim();
    setColumnFilter(binding.key, blank ? null : columnFilters.filterChoices(binding.key, query).map(choice => choice.value));
    if (disposed) return;
    if (blank && binding.input.value === query) binding.input.value = "";
    refreshFilters();
  }

  function refreshView(): (() => void) | undefined {
    const previousRequest = pageRequest;
    const previousState = pageState;
    const previousFiltered = filteredIds;
    const previousIds = new Set(records.keys());
    const previousVisible = visibleIds;
    const previousIndexes = visibleIndexes;
    const previousMergeKeys = mergeKeys;
    const previousScroll = options.viewport?.root.scrollTop;
    const previousAvailable = available;
    const previousGoal = unfinished;
    const restoreEmptyView = empty && restoreAttributes(empty, ["hidden"]);
    try { return render(null); }
    catch (cause) {
      if (disposed) throw cause;
      pageRequest = previousRequest;
      pageState = previousState;
      filteredIds = previousFiltered;
      visibleIds = previousVisible;
      visibleIndexes = previousIndexes;
      mergeKeys = previousMergeKeys;
      available = previousAvailable;
      unfinished = previousGoal;
      viewport?.set(progressive ? previousVisible.slice(0, available) : previousVisible, false);
      if (previousScroll !== undefined) options.viewport!.root.scrollTop = previousScroll;
      restoreEmptyView?.();
      syncRowIndexes();
      for (const [id, record] of records) {
        if (previousIds.has(id)) continue;
        releaseRecord(record);
        records.delete(id);
      }
      mergeRows();
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
    catch (cause) { sort = previous; failBinding(cause); }
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

  function restoreBusy(): void {
    if (progressive) restoreBusyAttribute();
  }

  function bindingResult(event: RowsEvent | null = lastBinding?.event ?? null,
    first = lastBinding?.first ?? true, complete = !unfinished && !operation): GridBindResult {
    return Object.freeze({ total: options.rows.entries({ includeDeleted: true }).length,
      filtered: filteredIds.length, visible: visibleIds.length, mounted: records.size, event,
      available: progressive ? available : visibleIds.length, first: progressive ? first : true,
      last: !progressive || complete && available === visibleIds.length });
  }

  function windowIds(): readonly RowId[] {
    if (!viewport) return progressive ? visibleIds.slice(0, available) : visibleIds;
    const focused = root.ownerDocument.activeElement;
    const id = focused instanceof Element ? rowIds.get(focused.closest("tr")!) : undefined;
    return viewport.window(id ?? null);
  }

  function cancelOperation(): void {
    const current = operation;
    if (!current) return;
    operation = undefined;
    current.cancelled = true;
    if (current.timer !== undefined) bindingWindow.clearTimeout(current.timer);
    if (progressive && !current.completed) unfinished = { start: current.start, target: current.target, event: current.event, emit: current.emit };
    if (current.notify) { failedPrunes.push(current.notify); current.notify = undefined; }
    restoreBusy();
    current.reject(new DOMException("Grid binding aborted", "AbortError"));
  }

  function newOperation(goal: BindingGoal, notify?: () => void): BindingOperation {
    let resolve!: (result: GridBindResult) => void;
    let reject!: (cause: unknown) => void;
    const promise = new Promise<GridBindResult>((accept, fail) => { resolve = accept; reject = fail; });
    void promise.catch(() => {});
    const current: BindingOperation = { ...goal, promise, resolve, reject, completed: false, cancelled: false, started: false,
      notify, ids: [], cursor: 0, revision: viewRevision,
      rows: options.rows.entries({ includeDeleted: true }), layout: columns.columns() };
    operation = current;
    bindingPromise = promise;
    return current;
  }

  function checkOperation(current: BindingOperation): void {
    if (operation !== current || disposed) throw new DOMException("Grid binding aborted", "AbortError");
    if (current.revision !== viewRevision || current.rows !== options.rows.entries({ includeDeleted: true }) ||
        current.layout !== columns.columns()) {
      throw gridError("GRID_BIND_STALE", "The rows or view changed during progressive binding.");
    }
  }

  function notifyPrunes(current: BindingOperation): void {
    const pending = failedPrunes.splice(0);
    if (current.notify) { pending.push(current.notify); current.notify = undefined; }
    for (const notify of pending) {
      if (disposed) break;
      notify();
    }
  }

  function completeOperation(current: BindingOperation, emit: boolean, completeGoal = true): void {
    if (operation !== current || disposed) return;
    current.completed = true;
    if (completeGoal) unfinished = undefined;
    restoreBusy();
    notifyPrunes(current);
    if (operation !== current || disposed) return;
    const result = bindingResult(current.event, current.start === 0, !unfinished);
    if (emit && options.onBind) {
      try {
        const returned: unknown = options.onBind(result);
        if (returned !== null && (typeof returned === "object" || typeof returned === "function") &&
            typeof (returned as { then?: unknown }).then === "function") {
          void Promise.resolve(returned).catch(() => {});
          throw new TypeError("onBind must finish synchronously.");
        }
      } catch (cause) {
        if (cause instanceof FrameworkError && cause.api === "bindGrid") throw cause;
        throw new FrameworkError({ api: "bindGrid", code: "GRID_BIND", message: "The bind completion callback failed.",
          detail: { phase: "onBind" }, cause });
      }
    }
    if (operation !== current || disposed) return;
    operation = undefined;
    lastBinding = result;
    current.resolve(result);
  }

  function failOperation(current: BindingOperation, cause: unknown, deferPrunes = false): void {
    if (operation !== current) return;
    if (current.timer !== undefined) bindingWindow.clearTimeout(current.timer);
    if (progressive && !current.completed) unfinished = { start: current.start, target: current.target, event: current.event, emit: current.emit };
    operation = undefined;
    restoreBusy();
    cleanupErrors.length = 0;
    if (deferPrunes) {
      if (current.notify) { failedPrunes.push(current.notify); current.notify = undefined; }
    } else {
      try { notifyPrunes(current); } catch { /* Keep the binding failure primary. */ }
    }
    current.reject(cause);
  }

  function scheduleOperation(current: BindingOperation, delay: number): void {
    if (operation !== current || disposed) return;
    root.setAttribute("aria-busy", "true");
    current.timer = bindingWindow.setTimeout(() => {
      current.timer = undefined;
      continueOperation(current, false);
    }, delay);
  }

  function continueOperation(current: BindingOperation, initial: boolean): (() => void) | undefined {
    if (operation !== current || disposed) return;
    try {
      checkOperation(current);
      if (!current.started) {
        current.started = true;
        renderWindow(false, current.ids.filter(id => records.has(id)), true, false);
        checkOperation(current);
      }
      while (current.cursor < current.ids.length) {
        const id = current.ids[current.cursor++];
        const snapshot = options.rows.get(id);
        const changed = snapshot !== records.get(id)?.snapshot;
        if (changed && snapshot) {
          const existed = records.has(id);
          try {
            renderWindow(false, [id], false);
            checkOperation(current);
          } catch (cause) {
            if (operation === current) {
              const record = records.get(id);
              if (record) {
                if (!existed) { releaseRecord(record); records.delete(id); }
                else { hooks.release(id); resetRecord(record); }
              }
            }
            throw cause;
          }
        }
        if (!viewport) available = Math.max(available, (visibleIndexes.get(id) ?? -1) + 1);
        if (changed && current.cursor < current.ids.length && (initial || (progressive?.delay ?? 0) > 0)) {
          scheduleOperation(current, progressive?.delay ?? 0);
          return;
        }
      }
      checkOperation(current);
      if (viewport) {
        const needed = windowIds();
        if (needed.some(id => records.get(id)?.snapshot !== options.rows.get(id))) {
          current.ids = needed;
          current.cursor = 0;
          scheduleOperation(current, progressive?.delay ?? 0);
          return;
        }
      }
      available = current.target;
      renderWindow(false, windowIds(), true, false);
      checkOperation(current);
      const complete = () => {
        try { completeOperation(current, current.emit !== false); }
        catch (cause) { failOperation(current, cause); throw cause; }
      };
      if (initial) return complete;
      complete();
    } catch (cause) {
      if (operation === current) {
        try { renderWindow(false, windowIds().filter(id => records.has(id)), true, false); }
        catch { /* Preserve the original preparation or completion failure. */ }
        failOperation(current, cause, initial);
      }
      if (initial && !(cause instanceof DOMException && cause.name === "AbortError")) throw cause;
    }
  }

  function startProgressive(goal: BindingGoal, notify?: () => void, initial = true) {
    unfinished = goal;
    const current = newOperation(goal, notify);
    if (viewport) {
      available = goal.target;
      viewport.set(visibleIds.slice(0, available));
      current.ids = windowIds();
    } else current.ids = visibleIds.slice(0, goal.target);
    if (!initial) scheduleOperation(current, 0);
    return { current, complete: initial ? continueOperation(current, true) : undefined };
  }

  function renderMore(): Promise<GridBindResult> {
    bindable();
    if (operation && !operation.completed) return operation.promise;
    if (!progressive || !unfinished && available >= visibleIds.length) {
      return bindingPromise ?? Promise.resolve(bindingResult(null, true, true));
    }
    cancelOperation();
    const goal = unfinished ?? { start: available, target: Math.min(visibleIds.length, available + progressive.size), event: null };
    goal.target = Math.min(visibleIds.length, Math.max(goal.target, available));
    return startProgressive(goal, undefined, false).current.promise;
  }

  function updateWindow(): void {
    if (!progressive) { renderWindow(); return; }
    try {
      if (operation && !operation.completed) {
        checkOperation(operation);
        operation.ids = windowIds();
        operation.cursor = 0;
        renderWindow(false, operation.ids.filter(id => records.has(id)), true, false);
      } else renderWindow();
    } catch (cause) {
      if (operation) failOperation(operation, cause);
      else {
        const failed = newOperation({ start: available, target: available, event: null, emit: false });
        failOperation(failed, cause);
      }
    }
  }

  function render(bindingEvent: RowsEvent | null | false = false): (() => void) | undefined {
    if (disposed) return;
    bindable();
    cancelOperation();
    viewRevision++;
    const previousAvailable = available;
    const priorFocus = root.ownerDocument.activeElement;
    let notify: (() => void) | undefined;
    let current: BindingOperation | undefined;
    try {
      notify = selection.prune();
      if (disposed) return;
      const entries = statusEntries();
      const filtered = entries.filter(row => (!filter || filter(row.value)) && columnFilters.matches(row.value));
      if (sort) filtered.sort((left, right) => sort!(left.value, right.value));
      for (const binding of filterBindings) columnFilters.filterChoices(binding.key);
      const pages = pageRequest ? Math.ceil(filtered.length / pageRequest.size) : 0;
      const page = pageRequest ? Math.min(pageRequest.page, Math.max(1, pages)) : 0;
      if (pageRequest && page !== pageRequest.page) pageRequest = { page, size: pageRequest.size };
      pageState = pageRequest ? Object.freeze({ page, size: pageRequest.size, total: filtered.length, pages }) : null;
      const displayed = pageRequest ? filtered.slice((page - 1) * pageRequest.size, page * pageRequest.size) : filtered;
      const nextMergeKeys = body.merged ? new Map(displayed.map(row => [row.id, body.keys(row.value)])) : mergeKeys;
      visibleIds = Object.freeze(displayed.map(row => row.id));
      if (viewport || progressive || body.merged || options.revealInvalid) visibleIndexes = new Map(visibleIds.map((id, index) => [id, index]));
      mergeKeys = nextMergeKeys;
      filteredIds = Object.freeze(filtered.map(row => row.id));
      root.setAttribute("data-changed", String(options.rows.changes().length > 0));
      const emptyFocus = empty?.contains(root.ownerDocument.activeElement) && visibleIds.length > 0;
      if (empty) empty.hidden = visibleIds.length > 0;
      const focusedRow = priorFocus instanceof Element ? rowIds.get(priorFocus.closest("tr")!) : undefined;
      const focusCount = focusedRow === undefined ? 0 : (visibleIndexes.get(focusedRow) ?? -1) + 1;
      const ordinary = bindingEvent === false;
      const append = bindingEvent !== null && bindingEvent !== false && bindingEvent.type === "append";
      if (progressive) {
        if (ordinary || append) available = Math.min(visibleIds.length, Math.max(previousAvailable, focusCount));
        else { available = 0; unfinished = undefined; }
      } else available = visibleIds.length;
      if (progressive && !ordinary) {
        const pending = append && unfinished;
        const target = Math.min(visibleIds.length, Math.max(focusCount,
          pending ? pending.target : append ? available + progressive.size : progressive.size));
        const start = pending ? pending.start : append ? available : 0;
        const pruned = notify;
        notify = undefined;
        const started = startProgressive({ start, target, event: bindingEvent }, pruned);
        if (disposed || started.current.cancelled || bindingPromise !== started.current.promise || started.current.revision !== viewRevision) return;
        syncRowIndexes();
        focusAfterDisable(priorFocus);
        refreshFilters();
        if (emptyFocus) focusContent();
        return started.complete;
      }
      viewport?.set(progressive ? visibleIds.slice(0, available) : visibleIds);
      current = newOperation({ start: progressive ? unfinished?.start ?? 0 : 0, target: available,
        event: bindingEvent === false ? null : bindingEvent }, notify);
      notify = undefined;
      const afterRows = renderWindow(true);
      focusAfterDisable(priorFocus);
      refreshFilters();
      if (emptyFocus) focusContent();
      const completed = current;
      return () => {
        try {
          afterRows?.();
          completeOperation(completed, bindingEvent !== false, !progressive || !unfinished);
        } catch (cause) { failOperation(completed, cause); throw cause; }
      };
    } catch (cause) {
      if (current) failOperation(current, cause, true);
      else if (!disposed && notify) { failedPrunes.push(notify); notify = undefined; }
      if (!operation && !current) {
        bindingPromise = Promise.reject(cause);
        void bindingPromise.catch(() => {});
      }
      throw cause;
    }
  }

  function bindRows(event: RowsEvent | null | false = false): void {
    let notify: (() => void) | undefined;
    try { notify = render(event); }
    catch (cause) { failBinding(cause); }
    notify?.();
  }

  function setColumnFilter(key: string, values: readonly SelectValue[] | null): void {
    active();
    try { columnFilters.setColumnFilter(key, values); }
    catch (cause) { failBinding(cause); }
  }

  function renderWindow(deferHooks = false, requested?: readonly RowId[], place = true, prepare = true): (() => void) | undefined {
    if (disposed) return;
    bindable();
    if (place) body.resetMerges();
    const focused = root.ownerDocument.activeElement;
    const focusedRow = focused instanceof Element ? focused.closest("tr") : null;
    const focusedId = focusedRow && rowIds.get(focusedRow);
    const nextIds = requested ?? windowIds();
    const existing = new Set(nextIds.filter(id => records.has(id)));
    const rebound: RenderedRow<T>[] = [];
    let pinLayoutChanged = false;
    const revision = viewRevision;
    const source = hooks.enabled ? options.rows.entries({ includeDeleted: true }) : undefined;
    const layout = hooks.enabled ? columns.columns() : undefined;
    const check = (id?: RowId) => {
      active();
      if (source !== options.rows.entries({ includeDeleted: true }) || revision !== viewRevision || layout !== columns.columns()) {
        throw gridError("GRID_BIND_STALE", "The rows or view changed during a row callback.", { id });
      }
    };
    try {
      for (const id of prepare ? nextIds : []) {
        const snapshot = options.rows.get(id);
        if (!snapshot) continue;
        let record = records.get(id);
        if (!record) {
          record = createRecord(id);
          records.set(id, record);
          if (options.beforeRowBind || !place) for (const element of record.elements) anchor.parentNode!.insertBefore(element, anchor);
        }
        if (record.snapshot !== snapshot) {
          pinLayoutChanged = true;
          renderStatus(record, snapshot);
          if (hooks.enabled) {
            hooks.before(snapshot, record.elements, () => check(id));
            rebound.push(record);
          }
          if (snapshot.status === "delete") for (const control of record.controls) control.disabled = true;
        }
        renderRecord(record, snapshot);
        const issues = issueText.get(id);
        if (issues) showIssues(record, issues);
        if (!place) {
          syncRecordSelection(id, record);
          if (progressive || viewport) for (const [physical, element] of record.elements.entries()) {
            element.setAttribute("aria-rowindex", String(templatePosition + visibleIndexes.get(id)! * templates.length + physical + 1));
          }
        }
      }
    } catch (cause) {
      for (const record of rebound) { hooks.release(record.id); resetRecord(record); }
      for (const id of nextIds) if (!existing.has(id)) {
        const record = records.get(id);
        if (record) releaseRecord(record);
        records.delete(id);
      }
      throw cause;
    }
    if (pinLayoutChanged) columns.invalidatePinned();
    if (place && (viewport || nextIds.length !== mountedIds.length || nextIds.some((id, index) => id !== mountedIds[index]))) {
      const nextSet = new Set(nextIds);
      const restoreFocus = focused instanceof HTMLElement && focusedId !== undefined &&
        focusedId !== null && nextSet.has(focusedId);
      const moveFocus = focused instanceof HTMLElement && focusedId !== undefined &&
        focusedId !== null && !nextSet.has(focusedId);
      const selection = restoreFocus &&
        (focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement) &&
        focused.selectionStart !== null && focused.selectionEnd !== null
        ? [focused.selectionStart, focused.selectionEnd] as const : null;
      if (viewport) viewport.place(new Map(nextIds.flatMap(id => {
        const record = records.get(id);
        return record ? [[id, record.elements] as const] : [];
      })), columns.columns().filter(column => !column.hidden).length || body.columnCount);
      else {
        for (const id of mountedIds) if (!nextSet.has(id)) {
          for (const element of records.get(id)?.elements ?? []) element.remove();
        }
        let cursor: Node = anchor;
        for (let index = nextIds.length - 1; index >= 0; index--) {
          const elements = records.get(nextIds[index])!.elements;
          for (let physical = elements.length - 1; physical >= 0; physical--) {
            const element = elements[physical];
            if (element !== focusedRow && element.nextSibling !== cursor) anchor.parentNode!.insertBefore(element, cursor);
            cursor = element;
          }
        }
      }
      if (restoreFocus && root.ownerDocument.activeElement !== focused) {
        focused.focus({ preventScroll: true });
        if (selection && (focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement)) {
          focused.setSelectionRange(...selection);
        }
      } else if (moveFocus) {
        focusContent();
      }
      mountedIds = nextIds;
      for (const [id, record] of records) {
        if (nextSet.has(id)) continue;
        releaseRecord(record);
        records.delete(id);
      }
    }
    if (place) { mergeRows(); syncRowIndexes(); syncSelection(); if (!rebound.length) columns.measurePinned(); }
    focusAfterDisable(focused);
    if (!rebound.length && !cleanupErrors.length) return;
    const complete = () => {
      const priorFocus = root.ownerDocument.activeElement;
      try {
        for (const record of rebound) {
          hooks.after(record.id, () => check(record.id));
          if (options.rows.get(record.id)?.status === "delete") for (const control of record.controls) control.disabled = true;
          if (!place) syncRecordSelection(record.id, record);
        }
        if (hooks.enabled) check();
        if (rebound.length) columns.invalidatePinned();
        if (place && rebound.length) { mergeRows(); syncSelection(); viewport?.invalidate(); columns.measurePinned(); }
        focusAfterDisable(priorFocus);
        cleanupFailure();
      } catch (cause) {
        for (const record of rebound) { hooks.release(record.id); resetRecord(record); }
        cleanupErrors.length = 0;
        throw cause;
      }
    };
    if (deferHooks) return complete;
    complete();
  }

  function focusContent(): void {
    const candidates = [...root.querySelectorAll<HTMLElement>(
      'tbody button:not(:disabled), tbody input:not(:disabled), tbody textarea:not(:disabled), tbody select:not(:disabled)'
    ), ...root.querySelectorAll<HTMLElement>('thead button:not(:disabled)')];
    if (candidates.some(focusVisible)) return;
    if (!root.hasAttribute("tabindex")) { root.tabIndex = -1; rootFocusTabIndex = true; }
    focusVisible(root);
  }

  function focusAfterDisable(focused: Element | null): void {
    if (!(focused instanceof HTMLElement) || !focused.matches(":disabled")) return;
    const row = focused.closest<HTMLTableRowElement>("tr");
    const active = root.ownerDocument.activeElement;
    if (row && rowIds.has(row) && (active === focused || active === root.ownerDocument.body)) focusContent();
  }

  function mergeRows(): void {
    if (!body.merged) return;
    body.merge(mountedIds.flatMap(id => {
      const record = records.get(id);
      return record ? [{ elements: record.elements, mergeCells: record.mergeCells,
        keys: mergeKeys.get(id)!, index: visibleIndexes.get(id)!, status: options.rows.get(id)?.status }] : [];
    }), root.ownerDocument.activeElement);
  }

  function syncRowIndexes(): void {
    if (!viewport && !progressive) return;
    root.setAttribute("aria-rowcount", String(staticRows.length + visibleIds.length * templates.length));
    for (const [index, row] of staticRows.entries()) {
      const original = staticRowIndexes[index];
      row.setAttribute("aria-rowindex", String(original + 1 + (original > templatePosition ? (visibleIds.length - 1) * templates.length : 0)));
    }
    for (const [id, record] of records) {
      const index = visibleIndexes.get(id);
      if (index !== undefined) for (const [physical, element] of record.elements.entries()) {
        element.setAttribute("aria-rowindex", String(templatePosition + index * templates.length + physical + 1));
      }
    }
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
    const apply = target.closest<HTMLButtonElement>("button[data-apply-filter]");
    const filterApply = filterApplyBindings.find(binding => binding.element === apply);
    if (filterApply && !filterApply.element.matches(":disabled") && !disabled(filterApply.input)) {
      event.preventDefault();
      applyFilter(filterApply);
      return;
    }
    const reset = target.closest<HTMLButtonElement>("button[data-clear-filter]");
    if (reset && root.tHead?.contains(reset) && !reset.matches(":disabled")) {
      setColumnFilter(reset.getAttribute("data-clear-filter")!, null);
      return;
    }
    const action = target.closest<HTMLButtonElement>("button[data-row-action]");
    if (action && !action.matches(":disabled")) {
      const id = rowIds.get(action.closest("tr")!);
      const row = id === undefined ? undefined : options.rows.get(id);
      if (row) options.onRowAction?.({ action: action.getAttribute("data-row-action")!, id: row.id, row, element: action, event });
      return;
    }
    const button = target.closest<HTMLButtonElement>("button[data-select-row]");
    const row = button?.closest<HTMLTableRowElement>("tr");
    const id = row ? rowIds.get(row) : undefined;
    if (button) {
      if (id !== undefined && !button.matches(":disabled")) selection.choose(id, event);
      return;
    }
    if (!options.selectOnRowClick || event.defaultPrevented || target.closest("[hidden], [inert]")) return;
    const record = target.closest<HTMLTableRowElement>("tr");
    const interactive = target.closest(`${interactiveContent}, label, [role="button"], [role="link"]`);
    if (interactive && record?.contains(interactive)) return;
    const recordId = record ? rowIds.get(record) : undefined;
    if (recordId !== undefined && records.get(recordId)?.buttons.some(button => button.tabIndex >= 0 && !button.matches(":disabled") &&
        !button.closest("[hidden], [inert]") && button.getClientRects().length > 0 &&
        bindingWindow.getComputedStyle(button).visibility === "visible")) selection.choose(recordId, event);
  }

  function reveal(id: RowId, request?: { block?: ScrollLogicalPosition }): void {
    active();
    if (request !== undefined && (!request || typeof request !== "object" || Array.isArray(request))) {
      throw gridError("GRID_VIEWPORT_ALIGN", "Reveal options need a block of nearest, start, center or end.");
    }
    const requested = request?.block;
    const block = requested === undefined ? "nearest" : requested;
    active();
    if (!["nearest", "start", "center", "end"].includes(block)) {
      throw gridError("GRID_VIEWPORT_ALIGN", "Reveal options need a block of nearest, start, center or end.");
    }
    const row = options.rows.get(id);
    if (!row || !visibleIds.includes(id)) {
      throw gridError("GRID_VIEWPORT_ROW", "Reveal needs a row in the current logical page.", { id });
    }
    if (progressive && visibleIndexes.get(id)! >= available) {
      const start = unfinished?.start ?? available;
      const target = Math.min(visibleIds.length, Math.max(unfinished?.target ?? available, visibleIndexes.get(id)! + 1));
      cancelOperation();
      available = target;
      unfinished = undefined;
      viewport?.set(visibleIds.slice(0, available));
      const demand = newOperation({ start, target, event: null });
      try {
        renderWindow();
        completeOperation(demand, true);
      } catch (cause) { failOperation(demand, cause); throw cause; }
      if (disposed || demand.cancelled || demand.revision !== viewRevision || operation) return;
    } else if (progressive && operation) {
      cancelOperation();
      renderWindow();
    }
    if (viewport) {
      const previousScroll = options.viewport!.root.scrollTop;
      try { viewport.reveal(id, block); renderWindow(); }
      catch (cause) {
        if (disposed) throw cause;
        viewport.set(progressive ? visibleIds.slice(0, available) : visibleIds, false);
        options.viewport!.root.scrollTop = previousScroll;
        throw cause;
      }
    }
    else records.get(id)?.elements.find(element => element.getClientRects().length)?.scrollIntoView({ block, inline: "nearest" });
  }

  function rowControls(record: RenderedRow<T>): HTMLElement[] {
    return record.elements.flatMap(row => [...row.querySelectorAll<HTMLElement>(
      'button, input, textarea, select, a[href], [tabindex], [contenteditable="true"]'
    )]).filter(element => element.tabIndex >= 0 && !element.matches(":disabled") &&
      !element.closest("[hidden], [inert]") && element.getClientRects().length > 0 &&
      root.ownerDocument.defaultView!.getComputedStyle(element).visibility === "visible");
  }

  function validationResult(issues: readonly ValidationIssue[]): ValidationResult {
    if (!options.revealInvalid || !issues.length) return { valid: issues.length === 0, issues };
    const first = issues.find(issue => issue.rowId !== null && visibleIndexes.has(issue.rowId));
    if (!first || first.rowId === null) return { valid: false, issues };
    const revision = viewRevision;
    reveal(first.rowId);
    if (disposed || revision !== viewRevision) return { valid: false, issues: issues.map(issue => ({ ...issue, element: undefined })) };
    const fields = (id: RowId | null, field: string) => {
      const record = id === null ? undefined : records.get(id);
      return [
        ...record?.texts.filter(binding => binding.descriptor.name === field).flatMap(binding => binding.elements) ?? [],
        ...record?.selects.filter(binding => binding.descriptor.name === field).map(binding => binding.element) ?? []
      ];
    };
    fields(first.rowId, first.field).some(focusVisible);
    return { valid: false, issues: issues.map(issue => ({ ...issue,
      element: fields(issue.rowId, issue.field).find(element => element.isConnected) })) };
  }

  let focusCleanup = false;
  function onFocusOut(event: FocusEvent): void {
    if (validateOn === "blur" && event.target instanceof HTMLElement) {
      const entry = edits.get(event.target);
      const next = event.relatedTarget;
      if (entry && !(next instanceof HTMLElement && entry.binding.elements.includes(next)) && drafts.get(entry.id)?.has(entry.binding.descriptor.name)) {
        reconcile(entry.id);
      }
    }
    if (!viewport || focusCleanup) return;
    focusCleanup = true;
    queueMicrotask(() => {
      focusCleanup = false;
      if (!disposed) updateWindow();
    });
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (!(event.target instanceof Element)) return;
    if (event.key === "Enter" && !event.isComposing && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      const binding = filterApplyBindings.find(binding => binding.input === event.target && !binding.element.matches(":disabled"));
      if (binding && !disabled(binding.input)) {
        event.preventDefault();
        applyFilter(binding);
        return;
      }
    }
    if (event.key === "Enter" && !event.isComposing && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey &&
        validateOn !== "manual" && event.target instanceof HTMLInputElement &&
        ["text", "search", "tel", "url", "email", "password", "number"].includes(event.target.type)) {
      const entry = edits.get(event.target);
      if (entry && !disabled(event.target) && !event.target.readOnly) {
        event.preventDefault();
        draft(entry.id, entry.binding.descriptor.name, entry.binding.descriptor.path, event.target.value, true);
        return;
      }
    }
    if (viewport && event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const id = rowIds.get(event.target.closest("tr")!);
      const record = id === undefined ? undefined : records.get(id);
      if (id !== undefined && record) {
        const controls = rowControls(record);
        if (event.target === (event.shiftKey ? controls[0] : controls.at(-1))) {
          const step = event.shiftKey ? -1 : 1;
          for (let index = visibleIds.indexOf(id) + step; index >= 0 && index < visibleIds.length; index += step) {
            const targetId = visibleIds[index];
            const revision = viewRevision;
            reveal(targetId);
            if (disposed || revision !== viewRevision) return;
            const nextRecord = records.get(targetId);
            if (!nextRecord) return;
            const candidates = rowControls(nextRecord);
            const target = event.shiftKey ? candidates.at(-1) : candidates[0];
            if (!target) continue;
            event.preventDefault();
            focusVisible(target);
            return;
          }
        }
      }
      return;
    }
    if (!options.multiple) return;
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
    if (viewport) {
      const ids = visibleIds.filter(id => selection.eligible(id, "selection"));
      const origin = rowIds.get(button.closest("tr")!);
      const index = origin === undefined ? -1 : ids.indexOf(origin);
      const next = event.key === "Home" ? 0 : event.key === "End" ? ids.length - 1
        : index + (event.key === "ArrowDown" ? 1 : -1);
      const id = ids[Math.max(0, Math.min(ids.length - 1, next))];
      if (id === undefined) return;
      event.preventDefault();
      if (event.shiftKey && !selection.choose(id, event, origin)) return;
      if (disposed || !visibleIds.includes(id)) return;
      const revision = viewRevision;
      reveal(id);
      if (disposed || revision !== viewRevision) return;
      const target = records.get(id)?.buttons.find(button => !button.matches(":disabled") && !button.closest("[hidden], [inert]"));
      if (target) focusVisible(target);
      return;
    }
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
    else if (validateOn === "change") validateRow(row);
  }

  function onInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement && root.tHead?.contains(target) && target.hasAttribute("data-filter-search")) {
      refreshFilters();
      return;
    }
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.readOnly || disabled(target) || target instanceof HTMLInputElement && ["checkbox", "radio"].includes(target.type)) return;
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
        const next = new Set(options.checkMode === "single" && target.checked ? [] : selection.checkedIds());
        if (target.checked) next.add(id); else next.delete(id);
        try { selection.setChecked([...next], event); }
        finally { syncSelection(); }
        return;
      }
    }
    if (target instanceof HTMLSelectElement) {
      if (disabled(target)) return;
      const entry = selects.get(target);
      const path = entry?.binding.descriptor.field;
      const field = entry?.binding.descriptor.name;
      if (!entry || !path || !field) return;
      const selected = [...target.selectedOptions].map(option =>
        entry.binding.rawByOption.has(option) ? entry.binding.rawByOption.get(option) : option.value);
      const value = entry.binding.descriptor.multiple ? selected : selected[0] ?? null;
      draft(entry.id, field, path, value, validateOn !== "manual");
      return;
    }
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (disabled(target) || target.readOnly) return;
    const entry = edits.get(target);
    if (!entry) return;
    const descriptor = entry.binding.descriptor;
    const entered = fieldValue({ element: entry.binding.element, elements: entry.binding.elements, kind: descriptor.kind });
    draft(entry.id, descriptor.name, descriptor.path, entered,
      validateOn === "change" || validateOn === "blur" && descriptor.kind !== "single");
  }

  function paste(text: string, start: { readonly id: RowId; readonly field: string }): ValidationResult {
    active();
    if (pasting) throw gridError("GRID_PASTE_BUSY", "A paste is already being prepared.");
    if (typeof text !== "string") throw gridError("GRID_PASTE_TEXT", "Paste needs clipboard text.");
    const rowIndex = visibleIds.indexOf(start?.id);
    const first = records.get(start?.id);
    const offscreen = Boolean(viewport || progressive);
    if (rowIndex < 0 || options.rows.get(start?.id)?.status === "delete" || !first && !offscreen) throw gridError("GRID_PASTE_TARGET", "Paste needs a visible editable row.", { id: start?.id });
    const binding = (record: RenderedRow<T>, field: typeof pasteFields[number]) =>
      field.text >= 0 ? record.texts[field.text] : record.selects[field.select];
    const layout = columns.columns();
    const source = (field: typeof pasteFields[number]) => authored[field.index];
    const columnKeys = (element: HTMLElement) => {
      const cell = element.closest("td, th");
      return (cell?.getAttribute("data-column") ?? cell?.getAttribute("data-columns") ?? "").trim().split(/\s+/);
    };
    const hidden = (element: HTMLElement) => root.closest("[hidden]") || element.closest("[hidden]") || offscreen && layout.length > 0 &&
      !layout.some(column => columnKeys(element).includes(column.key) && !column.hidden);
    const positions = new Map(pasteFields.flatMap(field => {
      const elements = field.text >= 0
        ? offscreen ? textFields[field.text].indexes.map(index => authored[index]) : first!.texts[field.text].elements
        : [offscreen ? source(field) : binding(first!, field).element];
      const element = elements.find(element => {
        if (element instanceof HTMLInputElement && element.type === "hidden" || hidden(element)) return false;
        return offscreen || element.isConnected;
      });
      return element ? [[field, element] as const] : [];
    }));
    const fields = [...positions.keys()].sort((a, b) => {
      if (offscreen) {
        const physical = (field: typeof pasteFields[number]) => templates.indexOf(positions.get(field)!.closest("tr")!);
        const column = (field: typeof pasteFields[number]) => {
          const keys = columnKeys(positions.get(field)!);
          return layout.findIndex(item => keys.includes(item.key) && !item.hidden);
        };
        return physical(a) - physical(b) || column(a) - column(b) || a.index - b.index;
      }
      const left = positions.get(a)!;
      const right = positions.get(b)!;
      return left === right ? 0 : left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    const fieldIndex = fields.findIndex(field => field.name === start.field);
    if (fieldIndex < 0 || new Set(fields.map(field => field.name)).size !== fields.length) {
      throw gridError("GRID_PASTE_TARGET", "Paste needs unique visible field names.", { field: start.field });
    }
    const entries = options.rows.entries();
    const revision = viewRevision;
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
        if (row.status === "delete") continue;
        const record = records.get(id);
        const pending = new Map(drafts.get(id));
        const pasted = new Set<string>();
        for (const [column, text] of cells.entries()) {
          const field = fields[fieldIndex + column];
          const element = record ? binding(record, field).element : source(field);
          const members = field.text >= 0 ? record?.texts[field.text].elements ?? textFields[field.text].indexes.map(index => authored[index]) : [element];
          if (members.some(member => disabled(member) || hidden(member) || member.closest('[inert], [aria-readonly="true"]') ||
              (member instanceof HTMLInputElement || member instanceof HTMLTextAreaElement) && member.readOnly) ||
              !record && root.closest('[inert], [aria-readonly="true"]') ||
              (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) && element.readOnly) continue;
          let entered: unknown = text;
          const array = field.select >= 0 ? selectFields[field.select].multiple : textFields[field.text].kind === "checkbox" && members.length > 1;
          let requested: unknown[] = [];
          if (array) {
            try {
              const value: unknown = JSON.parse(text);
              if (!Array.isArray(value) || value.some(item => item !== null && !["string", "number", "boolean"].includes(typeof item)) ||
                  new Set(value.map(item => Object.is(item, -0) ? negativeZero : item)).size !== value.length) throw Error();
              requested = value;
            } catch {
              issue(id, field.name, "Paste a JSON array of distinct option values into this field.");
              continue;
            }
          }
          if (field.select >= 0) {
            const select = record?.selects[field.select];
            const descriptor = selectFields[field.select];
            const available = select ? [...select.element.options]
              .filter(option => select.rawByOption.has(option) && !option.matches(":disabled"))
              .map(option => select.rawByOption.get(option))
              : [...[...(source(field) as HTMLSelectElement).options]
                .flatMap((option, index) => option.matches(":disabled") ? [] : [descriptor.authored[index]]),
                ...optionValues(row.value, descriptor, id).map(option => option.raw)];
            const values = array ? requested : available.filter(value => String(value ?? "") === text);
            if (array ? values.some(value => !available.some(option => Object.is(option, value))) :
                !values.length || values.some(value => !Object.is(value, values[0]))) {
              issue(id, field.name, "Clipboard text must identify one enabled raw option value.");
              continue;
            }
            entered = array ? values : values[0];
          } else if (textFields[field.text].kind === "radio" || array) {
            const values = members.map(member => (member as HTMLInputElement).value);
            if (array ? requested.some(value => typeof value !== "string" || !values.includes(value)) : text !== "" && !values.includes(text)) {
              issue(id, field.name, "Choose available group values.");
              continue;
            }
            entered = array ? requested : text || null;
          } else if (textFields[field.text].checkbox) {
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
            try { if (!disposed) bindRows(); } catch { /* Preserve the committed batch's first error. */ }
          }
          throw cause;
        } finally { pasteCommit = false; }
        if (!disposed && staged.size) bindRows();
      }
    } finally { pasting = false; }
    const result = validationResult(issues);
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
  root.addEventListener("focusout", onFocusOut);
  let unsubscribe = () => {};
  boundRoots.add(root);
  try {
    if (options.viewport) viewport = createGridViewport(root, anchor.parentElement as HTMLTableSectionElement,
      anchor, options.viewport, updateWindow);
    if (options.heightResize) height = bindGridHeight(root, options.heightResize);
    for (const element of filterElements) {
      const select = element as HTMLSelectElement;
      const key = select.getAttribute("data-filter-column")!;
      let binding: typeof filterBindings[number];
      const handle = bindSelect<SelectValue>(select, { choices: [], onChange(values) {
        if (!Array.isArray(values)) return;
        const next = new Set(columnFilters.columnFilter(key) ?? columnFilters.filterChoices(key).map(choice => choice.value));
        for (const choice of binding.shown) next.delete(choice.value);
        for (const value of values) next.add(value);
        try { setColumnFilter(key, [...next]); }
        catch (cause) { refreshFilters(); throw cause; }
      } });
      binding = { element: select, key, handle, shown: [] };
      filterBindings.push(binding);
    }
    unsubscribe = options.rows.subscribe(onRows);
    render(null)?.();
  } catch (cause) {
    boundRoots.delete(root);
    cancelOperation();
    unsubscribe();
    failedPrunes.length = 0;
    hooks.dispose();
    root.removeEventListener("click", onClick);
    root.removeEventListener("input", onInput);
    root.removeEventListener("change", onChange);
    root.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("paste", onPaste);
    root.removeEventListener("focusout", onFocusOut);
    height?.dispose();
    viewport?.dispose();
    if (options.viewport || progressive) {
      restoreAria();
      for (const restore of restoreStaticAria) restore();
    }
    restoreHeader();
    for (const record of records.values()) {
      releaseRecord(record);
    }
    for (const release of templateReleases) release();
    columns.dispose();
    restoreBusy();
    restoreChanged();
    restoreEmpty?.();
    body.restore();
    throw cause;
  }

  return {
    rowIds(scope) {
      active();
      if (scope === "visible") return visibleIds;
      if (scope === "filtered") return filteredIds;
      if (scope === "store") return Object.freeze(options.rows.entries().map(row => row.id));
      throw gridError("GRID_SCOPE", "A Grid row scope must be visible, filtered or store.");
    },
    defaults,
    refresh() {
      bindable();
      for (const record of records.values()) resetRecord(record);
      let notify: (() => void) | undefined;
      try { notify = refreshView(); }
      catch (cause) { failBinding(cause); }
      notify?.();
    },
    whenBound() { active(); return bindingPromise ?? Promise.resolve(bindingResult(null, true, true)); },
    renderMore,
    cancelBinding() {
      bindable();
      const cancelled = operation;
      const first = cancelled ? cancelled.start === 0 : unfinished ? unfinished.start === 0 : lastBinding?.first ?? true;
      cancelOperation();
      if (progressive) renderWindow(false, windowIds().filter(id => records.has(id)), true, false);
      const result = bindingResult(lastBinding?.event ?? null, first);
      lastBinding = result;
      if (cancelled) notifyPrunes(cancelled);
      return result;
    },
    statusFilter() { active(); return statuses; },
    setStatusFilter(values) {
      bindable();
      const next = checkedStatuses(values);
      if (next.length === statuses.length && next.every((status, index) => status === statuses[index])) return;
      const previous = statuses;
      statuses = next;
      let notify: (() => void) | undefined;
      try { notify = refreshView(); }
      catch (cause) { statuses = previous; failBinding(cause); }
      notify?.();
    },
    paste,
    reveal,
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
    setColumnFilter,
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
      catch (cause) { filter = previous; failBinding(cause); }
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
        failBinding(cause);
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
      return validationResult(issues);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelOperation();
      unsubscribe();
      failedPrunes.length = 0;
      hooks.dispose();
      root.removeEventListener("click", onClick);
      root.removeEventListener("input", onInput);
      root.removeEventListener("change", onChange);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("paste", onPaste);
      root.removeEventListener("focusout", onFocusOut);
      height?.dispose();
      viewport?.dispose();
      if (options.viewport || progressive) {
        restoreAria();
        for (const restore of restoreStaticAria) restore();
      }
      restoreHeader();
      for (const record of records.values()) {
        releaseRecord(record);
      }
      for (const release of templateReleases) release();
      records.clear();
      drafts.clear();
      issueText.clear();
      validationControls.clear();
      visibleIds = [];
      visibleIndexes.clear();
      mergeKeys.clear();
      filteredIds = [];
      for (const [column, original] of headerOriginals) {
        if (original === null) column.removeAttribute("aria-sort");
        else column.setAttribute("aria-sort", original);
      }
      headerOriginals.clear();
      authoredHeaders.clear();
      columns.dispose();
      restoreBusy();
      restoreChanged();
      restoreEmpty?.();
      if (rootFocusTabIndex && root.getAttribute("tabindex") === "-1") root.removeAttribute("tabindex");
      boundRoots.delete(root);
      body.restore();
      cleanupFailure();
    }
  };
}
