// SPDX-License-Identifier: Apache-2.0
import type { RowId, RowSnapshot, Rows, Snapshot } from "../data/index.js";
import { FrameworkError } from "../internal/framework-error.js";
import { sameJson } from "../internal/same-json.js";
import { createValueBinding } from "./value-binding.js";
import { createRowHooks } from "./grid-hooks.js";
import type { RowBinding } from "./grid-hooks.js";
import type { ValueProjection } from "./value-binding.js";
import { parsePath, readPath } from "./field-path.js";
import { renderRowOptions, rowOptionAvailable, rowOptions, selectRowOptions } from "./row-options.js";
import { claimSelect } from "./select-owner.js";
import { createRuleRunner } from "./rules.js";
import { disabled, display, nativeMessage } from "./native-control.js";
import type { RuleCall } from "./rules.js";
import type {
  FormatRule, ListHandle, PageRequest, PageState, RuleContext, RuleSet,
  ValidateRule, ValidationIssue, ValidationResult, ValueBindContext
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
  projection?: ValueProjection;
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
  projection?: ValueProjection;
}

interface RenderedRow<T> {
  id: RowId;
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

export function bindList<T extends object>(root: HTMLUListElement | HTMLOListElement, options: {
  rows: Rows<T>;
  rules?: RuleSet;
  onRowBind?: (context: RowBinding<T, HTMLLIElement>) => void;
  beforeBindValue?: (value: unknown, context: ValueBindContext) => unknown;
  onBindValue?: (value: unknown, context: ValueBindContext) => unknown;
  onSelect?: (selection: { id: RowId | null; row: RowSnapshot<T> | null; event: Event | null }) => void;
}): ListHandle<T> {
  if (!root || (root.tagName !== "UL" && root.tagName !== "OL")) {
    throw listError("LIST_ROOT", "The List root must be a ul or ol element.");
  }
  if (boundRoots.has(root)) throw listError("LIST_IN_USE", "This List root is already bound.");
  const sourceRows = options.rows;
  const values = createValueBinding("bindList", options);
  const cleanupErrors: unknown[] = [];
  const { onRowBind } = options;
  const hooks = createRowHooks("bindList", { onRowBind }, cause => cleanupErrors.push(cause));
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
      if (runner.formats(select, name ?? "").length) {
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
      const format = runner.formats(element, name);
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
        if (format.length &&
            !["text", "search", "tel", "url", "email", "password"].includes(type)) {
          throw listError("LIST_FORMAT", "Only text-like inputs can display formatted text.", { field: name });
        }
      }
      textFields.push({ index, name, path: parsePath(name),
        format, validate: runner.validators(element, name) });
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
  let renderVersion = 0;

  function active(): void {
    if (disposed) throw listError("LIST_DISPOSED", "This List has been disposed.");
  }

  function bindable(): void {
    active();
    if (hooks.running || values.running) throw listError("LIST_BIND_REENTRANT", "A row callback cannot reenter binding.");
  }

  function cleanupFailure(): void {
    if (!cleanupErrors.length) return;
    const cause = cleanupErrors[0];
    cleanupErrors.length = 0;
    throw cause;
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
    return { id, element, texts, selects, buttons, errors, hasIssues: false, releaseSelects };
  }

  function invalidOptions(id: RowId): (field: string) => never {
    return field => { throw listError("LIST_OPTIONS", "A row-local Select needs an array of options.",
      { rowId: id, field }); };
  }

  function projection(binding: { projection?: ValueProjection }, raw: unknown, id: RowId): void {
    const previous = binding.projection;
    if (!previous || previous.id !== id || !sameJson(previous.raw, raw)) {
      binding.projection = { id, raw, value: raw, phase: previous?.id === id ? "val" : "bind", state: "pending" };
    }
  }

  function resetProjection(record: RenderedRow<T>): void {
    record.snapshot = undefined;
    for (const binding of record.texts) { binding.projection = undefined; binding.bound = false; }
    for (const binding of record.selects) { binding.projection = undefined; binding.selectedBound = false; }
  }

  function renderSelect(binding: BoundSelect, sourceValue: Snapshot<T>, id: RowId, current?: () => boolean): void {
    const { field, element } = binding;
    const source = field.options ? readPath(sourceValue, field.options) : null;
    if (!binding.optionsBound || !Object.is(binding.source, source)) {
      binding.rawByOption = renderRowOptions(element, binding.authoredNodes, binding.authoredOptions, field.authored,
        field.options ? rowOptions(sourceValue, field.options, field.label!, field.value!, invalidOptions(id)) : []);
      binding.source = source;
      binding.optionsBound = true;
      binding.selectedBound = false;
    }
    if (field.field) {
      const raw = readPath(sourceValue, field.field);
      if (values.enabled && current) {
        projection(binding, raw, id);
        const context: ValueBindContext = Object.freeze({ field: field.name!,
          values: sourceValue as Snapshot<Record<string, unknown>>, rowId: id, element, phase: binding.projection!.phase });
        values.apply(binding, { element, elements: [element], kind: element.multiple ? "multiple" : "single" }, raw, context,
          shown => field.options ? selectRowOptions(element, binding.rawByOption, shown) : display(element, shown),
          current, field.options ? () => [...binding.rawByOption.values()] : undefined);
        if (!current()) return;
        binding.previous = raw;
        binding.selectedBound = true;
      } else if (!binding.selectedBound || !Object.is(binding.previous, raw)) {
        selectRowOptions(element, binding.rawByOption, raw);
        binding.previous = raw;
        binding.selectedBound = true;
      }
    }
  }

  function writeText(binding: BoundText, row: RowSnapshot<T>, value: unknown, current?: () => boolean): void {
    if (binding.field.format.length) {
      const context: RuleContext = { field: binding.field.name, values: row.value as Snapshot<Record<string, unknown>>,
        rowId: row.id, element: binding.element };
      const shown = runner.format(binding.field.format, value, context);
      if (!current || current()) display(binding.element, shown);
    } else if (!current || current()) display(binding.element, value);
  }

  function renderRecord(record: RenderedRow<T>, row: RowSnapshot<T>, current?: () => boolean): void {
    if (record.snapshot === row) return;
    for (const binding of record.texts) {
      if (current && !current()) return;
      const raw = readPath(row.value, binding.field.path);
      if (values.enabled && current) {
        projection(binding, raw, row.id);
        if (binding.bound && Object.is(binding.previous, raw) && binding.projection!.state !== "pending") continue;
        const element = binding.element;
        const context: ValueBindContext = Object.freeze({ field: binding.field.name,
          values: row.value as Snapshot<Record<string, unknown>>, rowId: row.id, element, phase: binding.projection!.phase });
        values.apply(binding, { element, elements: [element],
          kind: element instanceof HTMLInputElement && element.type === "checkbox" ? "checkbox" : "single" }, raw, context,
          value => writeText(binding, row, value, current), current);
        if (!current()) return;
      } else {
        if (binding.bound && Object.is(binding.previous, raw)) continue;
        writeText(binding, row, raw);
      }
      binding.previous = raw;
      binding.bound = true;
    }
    for (const binding of record.selects) {
      if (current && !current()) return;
      renderSelect(binding, row.value, row.id, current);
    }
    if (!current || current()) record.snapshot = row;
  }

  function validateRow(row: RowSnapshot<T>): ValidationIssue[] {
    const record = records.get(row.id);
    const values = row.value as Snapshot<Record<string, unknown>>;
    const issues: ValidationIssue[] = [];
    for (const [index, field] of textFields.entries()) {
      const binding = record?.texts[index];
      const element = binding?.element.isConnected ? binding.element : undefined;
      const value = readPath(values, field.path);
      const original = authored[field.index];
      const source = original.cloneNode(true);
      if (source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement) {
        source.disabled = disabled(original, root);
        display(source, value);
        const message = nativeMessage(source, value);
        if (message) {
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
      if (!rowOptionAvailable(available, value, (authored[field.index] as HTMLSelectElement).multiple)) {
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
    options.onSelect?.({ id, row: id === null ? null : sourceRows.get(id) ?? null, event });
  }

  function render(force = false): void {
    if (disposed) return;
    bindable();
    const tracked = hooks.enabled || values.enabled;
    const version = tracked ? ++renderVersion : 0;
    const entries = sourceRows.entries();
    const current = tracked ? () => !disposed && version === renderVersion && entries === sourceRows.entries() : undefined;
    const check = (id?: RowId) => {
      active();
      if (current && !current()) throw listError("LIST_BIND_STALE", "The rows or view changed during a row callback.", { rowId: id });
    };
    const created: RenderedRow<T>[] = [];
    const rebound: RenderedRow<T>[] = [];
    try {
      const live = new Set(entries.map(row => row.id));
      for (const [id, record] of records) {
        if (!live.has(id)) {
          hooks.release(id);
          if (current) check(id);
          record.element.remove();
          if (current) check(id);
          for (const release of record.releaseSelects) release();
          records.delete(id);
        }
      }
      if (selected !== null && !live.has(selected)) updateSelection(null, null);
      if (disposed || current && !current()) return;
      const filtered = filter ? entries.filter(row => filter!(row.value)) : [...entries];
      if (sort) filtered.sort((left, right) => sort!(left.value, right.value));
      if (current) check();
      let displayed = filtered;
      if (request) {
        const pages = Math.ceil(filtered.length / request.size);
        const page = Math.min(request.page, Math.max(1, pages));
        request = { page, size: request.size };
        pageState = Object.freeze({ ...request, total: filtered.length, pages });
        displayed = filtered.slice((page - 1) * request.size, page * request.size);
      } else pageState = null;
      const ids = displayed.map(row => row.id);
      const changed = ids.length !== visibleIds.length || ids.some((id, index) => id !== visibleIds[index]);
      const next = hooks.enabled || changed ? new Set(ids) : undefined;
      const mounted = tracked ? new Set(visibleIds) : undefined;
      if (hooks.enabled) for (const id of visibleIds) if (!next!.has(id)) {
        hooks.release(id); check(id);
      }
      for (const row of displayed) {
        let record = records.get(row.id);
        if (!record) {
          record = createRecord(row.id);
          records.set(row.id, record);
          if (hooks.enabled) created.push(record);
        }
        if (hooks.enabled && (force || !mounted!.has(row.id) || record.snapshot !== row)) {
          hooks.before(row, [record.element], () => check(row.id));
          rebound.push(record);
        }
        if (force || tracked && !mounted!.has(row.id)) resetProjection(record);
        renderRecord(record, row, current);
        if (current) check(row.id);
      }
      if (changed) {
        const focused = root.ownerDocument.activeElement;
        const focusedRow = focused instanceof Element ? focused.closest("li") : null;
        const focusedId = focusedRow && rowIds.get(focusedRow);
        const restoreFocus = focused instanceof HTMLElement && focusedId !== undefined &&
          focusedId !== null && next!.has(focusedId);
        const moveFocus = focused instanceof HTMLElement && focusedId !== undefined &&
          focusedId !== null && !next!.has(focusedId);
        for (const id of visibleIds) if (!next!.has(id)) {
          if (current) check(id);
          records.get(id)?.element.remove();
        }
        if (current) check();
        let cursor: Node = anchor;
        for (let index = ids.length - 1; index >= 0; index--) {
          const element = records.get(ids[index])!.element;
          if (current) check(ids[index]);
          if (element !== focusedRow && element.nextSibling !== cursor) root.insertBefore(element, cursor);
          if (current) check(ids[index]);
          cursor = element;
        }
        if (restoreFocus && root.ownerDocument.activeElement !== focused) focused.focus({ preventScroll: true });
        else if (moveFocus) {
          const nextControl = root.querySelector<HTMLElement>('button[data-select-row]:not(:disabled)') ?? root;
          if (nextControl === root && !root.hasAttribute("tabindex")) {
            root.tabIndex = -1;
            rootFocusTabIndex = true;
          }
          nextControl.focus({ preventScroll: true });
        }
        if (current) check();
        visibleIds = ids;
      }
      if (current) check();
      if (empty) empty.hidden = ids.length > 0;
      for (const record of rebound) hooks.after(record.id, () => check(record.id));
      cleanupFailure();
    } catch (cause) {
      for (const record of rebound) { hooks.release(record.id); resetProjection(record); }
      for (const record of created) if (records.get(record.id) === record) {
        record.element.remove();
        for (const release of record.releaseSelects) release();
        records.delete(record.id);
      }
      if (hooks.enabled) visibleIds = visibleIds.filter(id => records.get(id)?.element.parentElement === root);
      cleanupErrors.length = 0;
      throw cause;
    }
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
  function dispose(): void {
    if (disposed) return;
    disposed = true;
    if (hooks.enabled || values.enabled) renderVersion++;
    unsubscribe();
    root.removeEventListener("click", onClick);
    hooks.dispose();
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
    cleanupFailure();
  }
  try {
    unsubscribe = sourceRows.subscribe(event => {
      if (event.type === "replace" || (event.type === "revert" && event.id === undefined)) {
        for (const record of records.values()) clearIssues(record);
      } else if (event.type === "setMany") {
        for (const id of event.ids) {
          const record = records.get(id);
          if (record) clearIssues(record);
        }
      } else if (event.type !== "move" && "id" in event && event.id !== undefined) {
        const record = records.get(event.id);
        if (record) clearIssues(record);
      }
      render();
    });
    render();
  } catch (cause) {
    try { dispose(); } catch { /* The setup failure remains primary. */ }
    throw cause;
  }

  return {
    refresh() { bindable(); render(true); },
    select(id) {
      active();
      const row = id === null ? null : sourceRows.get(id);
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
      bindable();
      sort = compare;
      render();
    },
    setFilter(predicate) {
      bindable();
      filter = predicate;
      render();
    },
    setPage(next) {
      bindable();
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
      const target = id === undefined ? undefined : sourceRows.get(id);
      if (id !== undefined && (!target || target.status === "delete")) {
        throw listError("LIST_ROW", "The row ID is not available in this List.", { id });
      }
      const rows = target ? [target] : sourceRows.entries();
      const issues = rows.flatMap(row => validateRow(row));
      return { valid: issues.length === 0, issues };
    },
    dispose
  };
}
