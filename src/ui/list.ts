// SPDX-License-Identifier: Apache-2.0
import type { RowId, RowSnapshot, Rows, RowsEvent, Snapshot } from "../data/index.js";
import { FrameworkError } from "../internal/framework-error.js";
import { sameJson } from "../internal/same-json.js";
import { createValueBinding } from "./value-binding.js";
import { createRowHooks } from "./grid-hooks.js";
import type { RowBinding } from "./grid-hooks.js";
import { createRowSelection } from "./grid-selection.js";
import type { RowSelectionOptions } from "./grid-selection.js";
import type { ValueProjection } from "./value-binding.js";
import { parsePath, readPath } from "./field-path.js";
import { renderRowOptions, rowOptionAvailable, rowOptions, selectRowOptions } from "./row-options.js";
import { claimSelect, getSelect, publishSelect, registerSelect } from "./select-owner.js";
import type { SelectBinding, SelectCatalog } from "./select-owner.js";
import type { RowOptionValue } from "./row-options.js";
import { captureChoiceGroup, choiceGroupChoices, choiceGroupOptions, choiceGroupRequired, mountChoiceGroup } from "./choice-group.js";
import { checkGroupValue, claimChoiceGroup } from "./choice-group-owner.js";
import type { ChoiceGroupBinding } from "./choice-group-owner.js";
import { createRuleRunner } from "./rules.js";
import { fieldRenderers, renderField } from "./field-render.js";
import { createRowRules } from "./row-rules.js";
import type { RowRuleSource } from "./row-rules.js";
import { captureCheckboxValues, disabled, display, displayField, interactiveContent, nativeMessage } from "./native-control.js";
import { bindRowForm } from "./form.js";
import { focusVisible, uniqueId } from "./dom-state.js";
import type { RuleCall } from "./rules.js";
import type {
  FormatRule, GridRowScope, ListHandle, PageRequest, PageState, ParseInput, RuleContext, RuleSet,
  SourceBindContext, ValidateRule, ValidationIssue, ValidationResult, ValueBindContext
} from "./index.js";

interface TextField {
  group?: ReturnType<typeof captureChoiceGroup>;
  index: number;
  name: string;
  path: readonly string[];
  format: readonly RuleCall<FormatRule>[];
  validate: readonly RuleCall<ValidateRule>[];
  checkboxValues?: readonly [string, string];
}

interface SelectField {
  index: number;
  name?: string;
  field?: readonly string[];
  options?: readonly string[];
  label?: readonly string[];
  value?: readonly string[];
  authored: readonly RowOptionValue[];
  typed: boolean;
  catalog?: SelectCatalog;
  validate: readonly RuleCall<ValidateRule>[];
}

interface BoundText {
  group?: ChoiceGroupBinding;
  elements: HTMLElement[];
  groupInvalids?: Map<HTMLElement, string | null>;
  releaseGroup?: () => void;
  groupSource?: unknown;
  groupBound?: boolean;
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

interface RenderedRow<T extends object> {
  id: RowId;
  element: HTMLLIElement;
  snapshot?: RowSnapshot<T>;
  acceptedSource?: RowSnapshot<T>;
  sourceVersion?: number;
  ruleSources: readonly RowRuleSource[];
  texts: BoundText[];
  selects: BoundSelect[];
  buttons: HTMLButtonElement[];
  checks: HTMLInputElement[];
  errors: Map<string, HTMLElement>;
  hasIssues: boolean;
  releaseSelects: (() => void)[];
  editor?: ReturnType<typeof bindRowForm<T>>;
  pendingHook?: RowSnapshot<T>;
}

let nextErrorId = 0;
const boundRoots = new WeakSet<HTMLUListElement | HTMLOListElement>();
const ownedMasters = new WeakSet<HTMLInputElement>();

function listError(code: string, message: string, detail?: Record<string, unknown>): FrameworkError {
  return new FrameworkError({ api: "bindList", code, message, detail });
}

export function bindList<T extends object>(root: HTMLUListElement | HTMLOListElement, options: {
  rows: Rows<T>;
  editable?: boolean;
  parse?: Record<string, ParseInput>;
  autoValidate?: boolean;
  revealInvalid?: boolean;
  rules?: RuleSet;
  render?: Record<string, (value: unknown, context: RuleContext) => Node | string | null>;
  onRowBind?: (context: RowBinding<T, HTMLLIElement>) => void;
  beforeBindValue?: (value: unknown, context: ValueBindContext) => unknown;
  onBindValue?: (value: unknown, context: ValueBindContext) => unknown;
  beforeSourceBind?: (value: unknown, context: SourceBindContext<T>) => unknown;
  onSourceBind?: (value: unknown, context: SourceBindContext<T>) => unknown;
  selectOnRowClick?: boolean;
  hover?: boolean;
  checkAllControls?: readonly HTMLInputElement[];
} & RowSelectionOptions<T>): ListHandle<T> {
  if (!root || (root.tagName !== "UL" && root.tagName !== "OL")) {
    throw listError("LIST_ROOT", "The List root must be a ul or ol element.");
  }
  if (boundRoots.has(root)) throw listError("LIST_IN_USE", "This List root is already bound.");
  const sourceRows = options.rows;
  const { editable = false, parse, autoValidate, revealInvalid = false, rules, render: renderersOption } = options;
  if (typeof editable !== "boolean" || typeof revealInvalid !== "boolean" || autoValidate !== undefined && typeof autoValidate !== "boolean" ||
      !editable && (parse !== undefined || autoValidate !== undefined || revealInvalid)) {
    throw listError("LIST_EDIT", "Enable editable List rows before configuring parsers, automatic validation or invalid reveal.");
  }
  const editorOptions = { rows: sourceRows, parse: parse && { ...parse }, autoValidate, render: renderersOption };
  const editorCallbacks = editable ? { beforeBindValue: options.beforeBindValue, onBindValue: options.onBindValue,
    beforeSourceBind: options.beforeSourceBind, onSourceBind: options.onSourceBind } : undefined;
  const values = createValueBinding<T>("bindList", editorCallbacks ?? options);
  const cleanupErrors: unknown[] = [];
  const { onRowBind, onSelect, beforeSelect, beforeSelectionChange, onSelectionChange, beforeCheckChange, onCheckChange,
    multiple, toggleSelection, checkMode, canSelect, canCheck, selectOnRowClick, hover, checkAllControls } = options;
  if (onSelect !== undefined && typeof onSelect !== "function") {
    throw listError("LIST_SELECT", "onSelect must be a function.");
  }
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
  if (hover !== undefined && typeof hover !== "boolean" ||
      selectOnRowClick !== undefined && typeof selectOnRowClick !== "boolean") {
    throw listError("LIST_SELECT", "hover and selectOnRowClick must be booleans.");
  }
  if (checkAllControls !== undefined && !Array.isArray(checkAllControls)) {
    throw listError("LIST_CHECK", "checkAllControls must be an array of checkboxes.");
  }
  const masters = (checkAllControls ?? []).map(element => {
    const scope = element instanceof HTMLInputElement ? element.getAttribute("data-check-all") : null;
    if (!(element instanceof HTMLInputElement) || element.type !== "checkbox" || element.ownerDocument !== root.ownerDocument ||
        element.hasAttribute("data-field") || element.hasAttribute("data-check-row") || template.contains(element) ||
        (scope !== "visible" && scope !== "filtered" && scope !== "store") || ownedMasters.has(element)) {
      throw listError("LIST_CHECK", "Each All control needs an available checkbox outside the template and an explicit row scope.");
    }
    return { element, scope: scope as GridRowScope, checked: element.checked, mixed: element.indeterminate, disabled: element.disabled };
  });
  if (new Set(masters.map(master => master.element)).size !== masters.length) {
    throw listError("LIST_CHECK", "An All checkbox cannot be bound more than once.");
  }
  const empties = [...root.children].filter(element => element.matches("li[data-empty]")) as HTMLLIElement[];
  if (empties.length > 1 || empties[0] === template) {
    throw listError("LIST_EMPTY", "The List accepts at most one direct li marked data-empty.");
  }
  const empty = empties[0];
  const emptyWasHidden = empty?.hidden;
  const runner = createRuleRunner("bindList", rules);
  const textFields: TextField[] = [];
  const selectFields: SelectField[] = [];
  const errorFields = new Map<string, number>();
  const buttonIndexes: number[] = [];
  const checkIndexes: number[] = [];
  const authored = [template, ...template.querySelectorAll<HTMLElement>("*")];
  const releaseTemplateGroups: (() => void)[] = [];
  try {
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
    if (element.hasAttribute("data-check-row")) {
      if (!(element instanceof HTMLInputElement) || element.type !== "checkbox" || element.hasAttribute("data-field")) {
        throw listError("LIST_CHECK", "A row check needs a checkbox separate from data-field.");
      }
      checkIndexes.push(index);
    }
    const name = element.getAttribute("data-field");
    const checkboxValues = element instanceof HTMLFieldSetElement && [...element.children].some(child => child.matches("template[data-choice-template]")) ? undefined : captureCheckboxValues(element, () => { throw listError("LIST_CONTROL", "A coded checkbox needs one marked checkbox and distinct explicit value/data-unchecked-value strings.", { field: name ?? "" }); });
    const optionsName = element.getAttribute("data-options");
    if (element.tagName === "SELECT" && (name !== null || optionsName !== null)) {
      const select = element as HTMLSelectElement;
      const catalog = getSelect(select)?.catalog;
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
        authored: [...catalog?.values ?? [...select.options].map(option => option.value === "" ? null : option.value)],
        typed: catalog !== undefined || optionsName !== null, catalog,
        validate: name === null ? [] : runner.validators(select, name)
      });
    } else if (name !== null) {
      const generated = element instanceof HTMLFieldSetElement && [...element.children].some(child => child.matches("template[data-choice-template]"));
      const group = generated ? captureChoiceGroup(element as HTMLFieldSetElement) : undefined;
      if (group) releaseTemplateGroups.push(group.release);
      const format = runner.formats(element, name);
      if (group && (format.length || Object.hasOwn(renderersOption ?? {}, name))) throw listError("LIST_CONTROL", "A generated group cannot own formatting or a renderer.", { field: name });
      if (element.isContentEditable) {
        throw listError("LIST_CONTROL", "A bound List field cannot be contenteditable; use Form to edit.", { field: name });
      }
      if (element instanceof HTMLInputElement) {
        const type = element.getAttribute("type")?.toLowerCase() ?? element.type;
        if (type === "file") {
          throw listError("LIST_FILE_ROWS", "File inputs cannot bind to JSON Rows.", { field: name });
        }
        if (type === "radio" && !editable) {
          throw listError("LIST_CONTROL", "Radio groups need a selected-value binding; use Form.", { field: name });
        }
        if (format.length &&
            !["text", "search", "tel", "url", "email", "password"].includes(type)) {
          throw listError("LIST_FORMAT", "Only text-like inputs can display formatted text.", { field: name });
        }
      }
      textFields.push({ index, name, path: parsePath(name), group, checkboxValues,
        format, validate: runner.validators(element, name) });
    }
  }
  if (selectOnRowClick && !buttonIndexes.length) {
    throw listError("LIST_SELECT", "Row click needs an authored selection button for keyboard access.");
  }
  for (const field of textFields) if (field.checkboxValues && textFields.some(other => other !== field && other.name === field.name &&
      authored[other.index] instanceof HTMLInputElement && (authored[other.index] as HTMLInputElement).type === "checkbox")) {
    throw listError("LIST_CONTROL", "Coded values belong to one checkbox, not a field group.", { field: field.name });
  }
  const known = new Set([...textFields.map(field => field.name),
    ...selectFields.map(field => field.name).filter((name): name is string => name !== undefined)]);
  for (const field of errorFields.keys()) {
    if (!known.has(field)) {
      throw listError("LIST_ERROR_REGION", "An error region needs a matching data-field.", { field });
    }
  }
  const renderers = fieldRenderers("bindList", [
    ...textFields.map(field => ({ name: field.name, element: authored[field.index], formatted: field.format.length > 0 })),
    ...selectFields.flatMap(field => field.name ? [{ name: field.name, element: authored[field.index] }] : [])
  ], renderersOption);
  const rowRules = createRowRules<RenderedRow<T>>(runner, [
    ...textFields.map(target => ({ target, elements: [authored[target.index]] })),
    ...selectFields.map(target => ({ target, elements: [authored[target.index]] }))
  ], (record, position) => [position < textFields.length ? record.texts[position].group?.root ?? record.texts[position].element :
    record.selects[position - textFields.length].element], (position, calls) => {
    if (position >= textFields.length) {
      if (calls.format.length) throw listError("LIST_FORMAT", "A Select cannot display a formatted scalar; format its option labels instead.", { field: selectFields[position - textFields.length].name ?? "" });
      return;
    }
    const field = textFields[position], element = authored[field.index];
    if (field.group && calls.format.length) throw listError("LIST_FORMAT", "A generated group cannot own formatting.", { field: field.name });
    if (calls.format.length && renderers.has(field.name)) throw listError("UI_RENDER", "A render target cannot also format its value.", { field: field.name });
    if (calls.format.length && element instanceof HTMLInputElement && !["text", "search", "tel", "url", "email", "password"].includes(element.type)) {
      throw listError("LIST_FORMAT", "Only text-like inputs can display formatted text.", { field: field.name });
    }
  }, () => { throw listError("LIST_BIND_REENTRANT", "Finish the current rule before changing its declaration."); });

  const generatedGroups = textFields.some(field => field.group);
  const guarded = editable || values.sourceEnabled || renderers.size > 0 || generatedGroups;
  const sourceFields = values.sourceEnabled ? [
    ...textFields.map((field, index) => ({ key: field.path[0], dependency: field.group?.definition.source?.options[0], index, select: false })),
    ...selectFields.map((field, index) => ({ key: field.field?.[0], dependency: field.options?.[0], index, select: true }))
  ] : undefined;
  const releaseTemplateSelects: (() => void)[] = [];
  let visibleIds: readonly RowId[] = Object.freeze([]);
  let filteredIds = visibleIds;
  const selection = createRowSelection("bindList", sourceRows, {
    multiple, toggleSelection: toggleSelection ?? multiple, checkMode, canSelect, canCheck,
    beforeSelect, onSelect, beforeSelectionChange, onSelectionChange, beforeCheckChange, onCheckChange
  }, {
    visible: () => { active(); return visibleIds; },
    filtered: () => { active(); return filteredIds; },
    revision: () => { active(); return renderVersion; },
    changed: syncSelection
  });
  try {
    for (const field of selectFields) {
      releaseTemplateSelects.push(claimSelect(authored[field.index] as HTMLSelectElement, "bindList"));
      if (getSelect(authored[field.index] as HTMLSelectElement)?.catalog !== field.catalog) {
        throw listError("LIST_OPTIONS", "The common Select catalog changed during template capture.", { field: field.name ?? "" });
      }
    }
  } catch (cause) {
    for (const release of releaseTemplateSelects) try { release(); } catch {}
    for (const release of releaseTemplateGroups) try { release(); } catch {}
    boundRoots.delete(root);
    throw cause;
  }

  const anchor = root.ownerDocument.createComment("list rows");
  template.replaceWith(anchor);
  boundRoots.add(root);
  const records = new Map<RowId, RenderedRow<T>>();
  const rowIds = new WeakMap<HTMLLIElement, RowId>();
  let sort: ((a: Snapshot<T>, b: Snapshot<T>) => number) | null = null;
  let filter: ((row: Snapshot<T>) => boolean) | null = null;
  let request: PageRequest | null = null;
  let pageState: PageState | null = null;
  let projected: readonly RowSnapshot<T>[] = [];
  let editingRender = false;
  let rootFocusTabIndex = false;
  let disposed = false;
  let renderVersion = 0;
  let projectingSelection = false;
  const originalHover = root.getAttribute("data-list-hover");
  const authoredButtonDisabled = buttonIndexes.map(index => (authored[index] as HTMLButtonElement).disabled);
  const authoredCheckDisabled = checkIndexes.map(index => (authored[index] as HTMLInputElement).disabled);

  function active(): void {
    if (disposed) throw listError("LIST_DISPOSED", "This List has been disposed.");
  }

  function bindable(): void {
    active();
    if (projectingSelection || editingRender || hooks.running || values.running || values.sourceRunning) throw listError("LIST_BIND_REENTRANT", "A row callback cannot reenter binding.");
  }

  function cleanupFailure(): void {
    if (!cleanupErrors.length) return;
    const cause = cleanupErrors[0];
    cleanupErrors.length = 0;
    throw cause;
  }

  function createRecord(id: RowId, checkpoint: () => void, probe = false): RenderedRow<T> {
    const element = template.cloneNode(true) as HTMLLIElement;
    element.removeAttribute("data-row-template");
    const nodes = [element, ...element.querySelectorAll<HTMLElement>("*")];
    const buttons = buttonIndexes.map(index => nodes[index] as HTMLButtonElement);
    const checks = checkIndexes.map(index => nodes[index] as HTMLInputElement);
    for (const button of buttons) button.setAttribute("aria-pressed", String(multiple ? selection.selectedIds().includes(id) : selection.selected() === id));
    const releaseSelects: (() => void)[] = [];
    const readonlySelect = (field: SelectField): BoundSelect => {
      const select = nodes[field.index] as HTMLSelectElement;
      releaseSelects.push(claimSelect(select, "bindList"));
      select.disabled = true;
      return { field, element: select, invalid: select.getAttribute("aria-invalid"),
        authoredNodes: [...select.childNodes], authoredOptions: [...select.options],
        rawByOption: new Map(), optionsBound: false, selectedBound: false };
    };
    if (editable) {
      try {
        const radioNames = new Map<string, string>();
        for (const field of textFields) {
          const node = nodes[field.index];
          if (field.group) {
            const { definition, catalog, capturedLabels, value } = field.group;
            const mounted = mountChoiceGroup(node as HTMLFieldSetElement, definition, catalog, { capturedLabels, value, current: checkpoint });
            releaseSelects.push(mounted.dispose);
          } else if (node instanceof HTMLInputElement && node.type === "radio") {
            let name = radioNames.get(field.name);
            if (name === undefined) {
              do { name = uniqueId(root.ownerDocument, "natural-list-radio"); } while (root.ownerDocument.getElementsByName(name).length);
              radioNames.set(field.name, name);
            }
            node.name = name;
          }
        }
        const selects = selectFields.filter(field => !field.field).map(readonlySelect);
        for (const field of selectFields) if (field.field && field.catalog) {
          const select = nodes[field.index] as HTMLSelectElement;
          const options = [...select.options];
          const binding: SelectBinding = { root: select, catalog: { nodes: [...select.childNodes], options, values: field.authored },
            raw: new Map(options.map((option, index) => [option, field.authored[index]])), restoreNested() {} };
          releaseSelects.push(registerSelect(binding)); publishSelect(binding);
        }
        const editor = bindRowForm(element, probe ? editorOptions : { ...editorOptions, ...editorCallbacks }, {
          root, rules: runner, mounted: () => {
            const row = sourceRows.get(id);
            return !disposed && element.parentElement === root && records.get(id)?.element === element && !!row && row.status !== "delete";
          },
          afterEdit(painted) {
            const record = records.get(id);
            if (!record || record.element !== element || !record.pendingHook) return;
            const expected = record.pendingHook;
            record.pendingHook = undefined;
            const current = () => mounted(record) && sourceRows.get(id) === expected;
            if (painted && current()) hooks.after(id, () => {
              if (!current()) throw listError("LIST_BIND_STALE", "The rows or view changed during a row callback.", { rowId: id });
            });
            else hooks.release(id);
            cleanupFailure();
          }
        });
        releaseSelects.unshift(editor.form.dispose);
        checkpoint();
        if (!probe) rowIds.set(element, id);
        return { id, element, texts: [], selects, buttons, checks, errors: new Map(), hasIssues: false, releaseSelects, ruleSources: [], editor };
      } catch (cause) { for (const release of releaseSelects) try { release(); } catch {} throw cause; }
    }
    const texts: BoundText[] = textFields.map(field => ({
      field, element: nodes[field.index], elements: [nodes[field.index]], invalid: nodes[field.index].getAttribute("aria-invalid"),
      bound: false
    }));
    let selects: BoundSelect[];
    try {
      for (const binding of texts) if (binding.field.group) {
        const captured = binding.field.group, snapshot = sourceRows.get(id)!;
        const suffix = choiceGroupOptions(captured.definition, snapshot.value, invalidOptions(id)); checkpoint();
        const mounted = mountChoiceGroup(binding.element as HTMLFieldSetElement, captured.definition, captured.catalog,
          { suffix, capturedLabels: captured.capturedLabels, current: checkpoint });
        let release: (() => void) | undefined;
        try { release = claimChoiceGroup(mounted.binding); checkpoint(); }
        catch (cause) { release?.(); mounted.dispose(); throw cause; }
        binding.group = mounted.binding; binding.elements = [...mounted.binding.inputs];
        binding.element = mounted.binding.inputs[0] ?? mounted.binding.root;
        binding.groupInvalids = new Map([mounted.binding.root, ...mounted.binding.inputs].map(element => [element, element.getAttribute("aria-invalid")]));
        binding.groupSource = captured.definition.source ? readPath(snapshot.value, captured.definition.source.options) : undefined;
        binding.groupBound = true;
        binding.releaseGroup = () => { release!(); mounted.dispose(); };
      }
      selects = selectFields.map(readonlySelect);

    for (const binding of texts) for (const element of binding.elements) {
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) element.disabled = true;
    }
    const errors = new Map([...errorFields].map(([field, index]) => [field, nodes[index]] as const));
    for (const [field, region] of errors) {
      let idCandidate: string;
      do { idCandidate = `natural-list-error-${++nextErrorId}`; }
      while (root.ownerDocument.getElementById(idCandidate));
      region.id = idCandidate;
      if (!region.hasAttribute("aria-live")) region.setAttribute("aria-live", "polite");
      region.textContent = "";
      for (const control of [
        ...texts.filter(binding => binding.field.name === field).flatMap(binding => binding.group ? [binding.group.root, ...binding.elements] : binding.elements),
        ...selects.filter(binding => binding.field.name === field).map(binding => binding.element)
      ]) {
        const ids = new Set((control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean));
        ids.add(idCandidate);
        control.setAttribute("aria-describedby", [...ids].join(" "));
      }
    }
    rowIds.set(element, id);
    return { id, element, texts, selects, buttons, checks, errors, hasIssues: false, releaseSelects, ruleSources: rowRules.sources(id) };
    } catch (cause) { for (const release of releaseSelects) try { release(); } catch {} for (const binding of texts) try { binding.releaseGroup?.(); } catch {} throw cause; }
  }

  function liveRow(id: RowId): RowSnapshot<T> {
    const row = sourceRows.get(id);
    if (!row || row.status === "delete") throw listError("LIST_ROW", "The row ID is not available in this List.", { id });
    return row;
  }

  function mounted(record: RenderedRow<T>): boolean {
    return !disposed && records.get(record.id) === record && record.element.parentElement === root;
  }

  function requireMounted(record: RenderedRow<T>): void {
    active(); liveRow(record.id);
    if (!mounted(record)) throw listError("LIST_ROW", "Reveal the row before using its Form.", { id: record.id });
  }

  function affects(event: RowsEvent, id: RowId): boolean {
    return event.type === "replace" || event.type === "revert" && (event.id === undefined || event.id === id) ||
      event.type === "set" && event.id === id || event.type === "setMany" && event.ids.includes(id);
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
    if (values.sourceEnabled) record.acceptedSource = undefined;
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
          shown => field.typed ? selectRowOptions(element, binding.rawByOption, shown, current) : display(element, shown),
          current, field.typed ? () => [...binding.rawByOption.values()] : undefined);
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
    const format = rowRules.formats(row.id, binding.field), renderer = renderers.get(binding.field.name);
    if (renderer || format.length) {
      const context: RuleContext = { field: binding.field.name, values: row.value as Snapshot<Record<string, unknown>>,
        rowId: row.id, element: binding.element };
      if (renderer) {
        const version = renderVersion, entries = sourceRows.entries();
        renderField("bindList", binding.element, value, context, renderer, false,
          () => !disposed && version === renderVersion && entries === sourceRows.entries());
      }
      else {
        const shown = runner.format(format, value, context);
        if (!current || current()) display(binding.element, shown);
      }
    } else if (!current || current()) {
      if (binding.group) displayField({ element: binding.element, elements: binding.elements, kind: binding.group.kind, group: binding.group }, value, current);
      else display(binding.element, value, binding.field.checkboxValues);
    }
  }

  function renderText(binding: BoundText, row: RowSnapshot<T>, current?: () => boolean): void {
    const raw = readPath(row.value, binding.field.path);
    if (values.enabled && current) {
      projection(binding, raw, row.id);
      if (binding.bound && Object.is(binding.previous, raw) && binding.projection!.state !== "pending") return;
      const element = binding.element;
      const context: ValueBindContext = Object.freeze({ field: binding.field.name,
        values: row.value as Snapshot<Record<string, unknown>>, rowId: row.id, element, phase: binding.projection!.phase });
      values.apply(binding, { element, elements: binding.elements, group: binding.group,
        kind: binding.group?.kind ?? (element instanceof HTMLInputElement && element.type === "checkbox" ? "checkbox" : "single"), checkboxValues: binding.field.checkboxValues }, raw, context,
        value => writeText(binding, row, value, current), current);
      if (!current()) return;
    } else {
      if (binding.bound && Object.is(binding.previous, raw)) return;
      writeText(binding, row, raw, guarded ? current : undefined);
    }
    if (guarded && current && !current()) return;
    binding.previous = raw;
    binding.bound = true;
  }

  function publishGroups(record: RenderedRow<T>, row: RowSnapshot<T>, current?: () => boolean): void {
    const checkpoint = () => { if (current && !current()) throw listError("LIST_BIND_STALE", "Newer List work superseded group publication.", { rowId: row.id }); };
    for (const binding of record.texts) if (binding.group && binding.field.group) {
      const captured = binding.field.group, source = captured.definition.source ? readPath(row.value, captured.definition.source.options) : undefined;
      if (binding.groupBound && Object.is(binding.groupSource, source)) continue;
      const suffix = choiceGroupOptions(captured.definition, row.value, invalidOptions(row.id)); checkpoint();
      const next = binding.group.prepare(suffix, checkpoint), raw = readPath(row.value, binding.field.path), projection = binding.projection;
      if (projection?.state === "applied" && projection.id === row.id && sameJson(projection.raw, raw) && projection.callback) {
        const message = checkGroupValue({ kind: binding.group.kind, values: next.values }, projection.value);
        if (message) throw values.error(Object.freeze({ field: binding.field.name, values: row.value as Snapshot<Record<string, unknown>>, rowId: row.id, element: binding.element, phase: projection.phase }), projection.callback, message);
      }
      const previous = { element: binding.element, elements: binding.elements, invalids: binding.groupInvalids, source: binding.groupSource, bound: binding.bound }, version = record.sourceVersion;
      let undo: (() => void) | undefined, failed = false;
      try {
        undo = next.apply(); checkpoint();
        binding.elements = [...next.inputs]; binding.element = next.inputs[0] ?? binding.group.root;
        binding.groupInvalids = new Map<HTMLElement, string | null>([[binding.group.root, previous.invalids?.get(binding.group.root) ?? null], ...next.inputs.map(input => [input, input.getAttribute("aria-invalid")] as const)]);
        const region = record.errors.get(binding.field.name);
        for (const element of [binding.group.root, ...next.inputs]) {
          if (region) { const ids = new Set((element.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean)); ids.add(region.id); element.setAttribute("aria-describedby", [...ids].join(" ")); checkpoint(); }
          if (element instanceof HTMLInputElement) { element.disabled = true; checkpoint(); }
          if (record.hasIssues && region?.textContent) element.setAttribute("aria-invalid", "true");
        }
        binding.groupSource = source; binding.groupBound = true; binding.bound = false;
      } catch (cause) {
        failed = true;
        if (records.get(record.id) === record && record.sourceVersion === version) { binding.element = previous.element; binding.elements = previous.elements; binding.groupInvalids = previous.invalids; binding.groupSource = previous.source; binding.bound = previous.bound; try { undo?.(); } catch {} }
        throw cause;
      } finally { try { next.finish(); } catch (cause) { if (!failed) throw cause; } }
    }
  }

  function renderRecord(record: RenderedRow<T>, row: RowSnapshot<T>, current?: () => boolean, fullSource = false): void {
    if (record.snapshot === row && (!values.sourceEnabled || !fullSource && record.acceptedSource === row)) return;
    publishGroups(record, row, current);
    if (current && !current()) return;
    if (sourceFields && current) {
      const scheduled = sourceFields, previous = record.acceptedSource;
      const keys = Object.keys(row.value).filter(key => fullSource || !previous ||
        !Object.hasOwn(previous.value, key) || !sameJson(Reflect.get(previous.value, key), Reflect.get(row.value, key)));
      const selected = new Set(keys);
      const assigned = new Map<string, typeof scheduled>();
      const remaining: typeof scheduled = [];
      for (const field of scheduled) {
        const key = field.key !== undefined && selected.has(field.key) ? field.key :
          field.dependency !== undefined && selected.has(field.dependency) ? field.dependency : undefined;
        if (key === undefined) remaining.push(field);
        else { const fields = assigned.get(key) ?? []; fields.push(field); assigned.set(key, fields); }
      }
      const write = (field: (typeof scheduled)[number]) => field.select
        ? renderSelect(record.selects[field.index], row.value, row.id, current)
        : renderText(record.texts[field.index], row, current);
      for (const key of keys) {
        if (!current()) return;
        const fields = assigned.get(key) ?? [];
        const elements = Object.freeze([...new Set(fields.flatMap(field => field.select
          ? [record.selects[field.index].element] : record.texts[field.index].elements))]);
        const context: SourceBindContext<T> = Object.freeze({ root, row, key, elements, phase: fullSource || !previous ? "bind" : "val" });
        values.source(context, () => { for (const field of fields) { if (!current()) return; write(field); } }, current);
      }
      for (const field of remaining) { if (!current()) return; write(field); }
    } else {
      for (const binding of record.texts) {
        if (current && !current()) return;
        renderText(binding, row, current);
      }
      for (const binding of record.selects) {
        if (current && !current()) return;
        renderSelect(binding, row.value, row.id, current);
      }
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
      if (field.checkboxValues && !field.checkboxValues.some(code => code === value)) {
        issues.push({ rowId: row.id, field: field.name, rule: "choice-option", message: "Choose an available checkbox value.", ...(element ? { element } : {}) });
      }
      if (field.group) {
        const catalog = choiceGroupChoices(field.group.definition, field.group.catalog, values, invalidOptions(row.id));
        const message = checkGroupValue({ kind: field.group.definition.kind, values: catalog.map(choice => choice.value) }, value);
        if (message) issues.push({ rowId: row.id, field: field.name, rule: "choice-option", message, ...(element ? { element } : {}) });
        if (!disabled(binding?.group?.root ?? original, root) && choiceGroupRequired(field.group.definition, catalog, value)) issues.push({ rowId: row.id, field: field.name, rule: "html", message: "Choose an option.", ...(element ? { element } : {}) });
      }
      const source = field.group ? null : original.cloneNode(true);
      if (source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement) {
        source.disabled = disabled(original, root);
        display(source, value, field.checkboxValues);
        const message = nativeMessage(source, value);
        if (message) {
          issues.push({ rowId: row.id, field: field.name, rule: "html", message,
            ...(element ? { element } : {}) });
        }
      }
      issues.push(...runner.validate(rowRules.validators(row.id, field), value, {
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
      issues.push(...runner.validate(rowRules.validators(row.id, field), value, {
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
        invalidBinding(binding, byField.has(name));
      }
      for (const [field, region] of record.errors) {
        region.textContent = (byField.get(field) ?? []).map(issue => issue.message).join(" ");
      }
      record.hasIssues = issues.length > 0;
    }
    return issues;
  }

  function invalidBinding(binding: BoundText | BoundSelect, invalid: boolean): void {
    if (!("group" in binding) || !binding.group) {
      if (invalid) binding.element.setAttribute("aria-invalid", "true");
      else if (binding.invalid === null) binding.element.removeAttribute("aria-invalid");
      else binding.element.setAttribute("aria-invalid", binding.invalid);
      return;
    }
    const targets = binding.groupInvalids!;
    for (const [element, original] of targets) {
      if (invalid) element.setAttribute("aria-invalid", "true");
      else if (original === null) element.removeAttribute("aria-invalid");
      else element.setAttribute("aria-invalid", original);
    }
  }

  function clearIssues(record: RenderedRow<T>): void {
    if (!record.hasIssues) return;
    record.hasIssues = false;
    for (const binding of [...record.texts, ...record.selects]) {
      invalidBinding(binding, false);
    }
    for (const region of record.errors.values()) region.textContent = "";
  }

  function selectionWritable(): void {
    active();
    if (projectingSelection) throw listError("LIST_BIND_REENTRANT", "Finish projecting the row controls before changing their state.");
  }

  function syncSelection(): void {
    selectionWritable();
    const entries = sourceRows.entries(), current = () => {
      active();
      if (entries !== sourceRows.entries()) throw listError("LIST_BIND_STALE", "The rows changed while projecting row controls.");
    };
    const selected = selection.selected(), selectedIds = new Set(selection.selectedIds()), checkedIds = new Set(selection.checkedIds());
    projectingSelection = true;
    try {
      for (const id of visibleIds) {
        const record = records.get(id);
        if (!record || !mounted(record)) continue;
        const pressed = multiple ? selectedIds.has(id) : selected === id;
        const checked = checkedIds.has(id);
        let selectable = true, checkable = true;
        if (canSelect && record.buttons.length) { selectable = selection.eligible(id, "selection"); current(); }
        if (canCheck && record.checks.length) { checkable = selection.eligible(id, "check"); current(); }
        record.element.toggleAttribute("data-row-active", selected === id);
        record.element.toggleAttribute("data-row-selected", pressed);
        record.element.toggleAttribute("data-row-checked", checked);
        for (const [index, button] of record.buttons.entries()) {
          button.disabled = authoredButtonDisabled[index] || !selectable;
          if (button.getAttribute("aria-pressed") !== String(pressed)) button.setAttribute("aria-pressed", String(pressed));
          if (multiple) {
            if (selected === id) button.setAttribute("aria-current", "true");
            else button.removeAttribute("aria-current");
          }
        }
        for (const [index, input] of record.checks.entries()) {
          input.checked = checked;
          input.disabled = authoredCheckDisabled[index] || !checkable;
        }
      }
      for (const { element, scope, disabled: originallyDisabled } of masters) {
        const state = selection.checkState(scope);
        current();
        element.checked = state.checked;
        element.indeterminate = state.indeterminate;
        element.disabled = originallyDisabled || !state.total || checkMode === "single" && state.total > 1;
      }
    } finally { projectingSelection = false; }
  }

  function render(force = false, event?: RowsEvent, validated?: ReadonlyMap<RowId, readonly ValidationIssue[]>): void {
    if (disposed) return;
    bindable();
    const tracked = hooks.enabled || values.enabled || guarded;
    const version = ++renderVersion;
    const entries = sourceRows.entries();
    const priorFocus = root.ownerDocument.activeElement, priorFiltered = filteredIds;
    const priorRow = priorFocus?.closest("li"), priorFocusId = priorRow ? rowIds.get(priorRow) : undefined;
    const current = tracked ? () => {
      const live = !disposed && version === renderVersion && entries === sourceRows.entries();
      if (guarded && !live) { active(); throw listError("LIST_BIND_STALE", "The rows or view changed during a row callback."); }
      return live;
    } : undefined;
    const check = (id?: RowId) => {
      active();
      if (version !== renderVersion || entries !== sourceRows.entries() || current && !current()) throw listError("LIST_BIND_STALE", "The rows or view changed during a row callback.", { rowId: id });
    };
    const created: RenderedRow<T>[] = [];
    const rebound: RenderedRow<T>[] = [];
    let notifySelection: (() => void) | undefined;
    let failed = false;
    const sourcePending = !editable && values.sourceEnabled ? new Map<RenderedRow<T>, RowSnapshot<T>>() : undefined;
    const mounted = tracked ? new Set(visibleIds) : undefined;
    editingRender = editable;
    try {
      notifySelection = selection.prune();
      const live = new Set(entries.map(row => row.id));
      for (const [id, record] of records) {
        if (!live.has(id)) {
          hooks.release(id);
          if (current) check(id);
          record.element.remove();
          if (current) check(id);
          for (const release of record.releaseSelects) try { release(); } catch (cause) { cleanupErrors.push(cause); }
          for (const binding of record.texts) binding.releaseGroup?.();
          records.delete(id);
        }
      }
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
      const next = editable || hooks.enabled || values.sourceEnabled || changed ? new Set(ids) : undefined;
      if (editable && event && (event.type === "replace" || event.type === "revert")) {
        if (event.type === "revert" && event.id !== undefined) {
          if (!next!.has(event.id)) records.get(event.id)?.editor?.changed(event, false);
        } else for (const record of records.values()) if (!next!.has(record.id)) record.editor?.changed(event, false);
      }
      if (hooks.enabled) for (const id of visibleIds) if (!next!.has(id)) {
        const record = records.get(id);
        if (record) record.pendingHook = undefined;
        hooks.release(id); check(id);
      }
      for (const row of displayed) {
        let record = records.get(row.id);
        if (!record) {
          record = createRecord(row.id, () => check(row.id));
          records.set(row.id, record);
          if (hooks.enabled || guarded) created.push(record);
          if (!record.editor) rowRules.attach(record, () => check(row.id));
        }
        if (guarded) record.sourceVersion = version;
        if (editable || values.sourceEnabled) {
          if (record.element.parentElement !== root) root.insertBefore(record.element, anchor);
          check(row.id);
        }
        if (hooks.enabled && (force || !mounted!.has(row.id) || record.snapshot !== row)) {
          hooks.before(row, [record.element], () => check(row.id));
          rebound.push(record);
        }
        if (record.editor) {
          for (const binding of record.selects) { renderSelect(binding, row.value, row.id, current); check(row.id); }
          if (!record.snapshot || force || !mounted!.has(row.id)) {
            if (event && record.snapshot) record.editor.changed(event, false);
            record.editor.bind(row.id, validated?.get(row.id));
          } else if (event && affects(event, row.id)) record.editor.changed(event, true);
          else if (record.snapshot !== row) record.editor.form.refresh();
          check(row.id);
          record.snapshot = row;
        } else {
          if (force || tracked && !mounted!.has(row.id)) resetProjection(record);
          renderRecord(record, row, current, force || !mounted?.has(row.id));
        }
        if (current) check(row.id);
        sourcePending?.set(record, row);
      }
      const activeElement = root.ownerDocument.activeElement;
      const focused = activeElement === root.ownerDocument.body && priorFocusId !== undefined ? priorFocus : activeElement;
      const focusedRow = focused instanceof Element ? focused.closest("li") : null;
      const focusedId = focusedRow ? rowIds.get(focusedRow) : undefined;
      if (changed) {
        for (const id of visibleIds) if (!next!.has(id)) {
          if (current) check(id);
          const record = records.get(id);
          if (record) {
            record.element.remove();
            if (values.sourceEnabled) record.acceptedSource = undefined;
          }
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
        visibleIds = Object.freeze(ids);
      }
      filteredIds = displayed === filtered ? visibleIds : Object.freeze(filtered.map(row => row.id));
      if (notifySelection || changed || canSelect || canCheck || masters.length) syncSelection();
      if (focused instanceof HTMLElement && focusedId !== undefined) {
        const retained = !changed || next!.has(focusedId);
        const disabledControl = focused.matches("button[data-select-row], input[data-check-row]") && !available(focused);
        const after = root.ownerDocument.activeElement;
        if (retained && !disabledControl) {
          if (changed && after !== focused) focused.focus({ preventScroll: true });
        } else if ((after === focused || after === root.ownerDocument.body) &&
            !visibleIds.some(id => records.get(id)?.buttons.some(focusVisible)) && !disposed) {
          if (!root.hasAttribute("tabindex")) { root.tabIndex = -1; rootFocusTabIndex = true; }
          root.focus({ preventScroll: true });
        }
      }
      if (current) check();
      if (empty) empty.hidden = ids.length > 0;
      for (const record of rebound) {
        if (record.editor?.committing) record.pendingHook = record.snapshot;
        else { record.pendingHook = undefined; hooks.after(record.id, () => check(record.id)); }
      }
      cleanupFailure();
      projected = filtered;
      if (sourcePending) {
        check();
        for (const [record, row] of sourcePending) if (records.get(row.id) === record && record.snapshot === row) record.acceptedSource = row;
      }
    } catch (cause) {
      failed = true;
      for (const record of rebound) if (!guarded || record.sourceVersion === version) {
        record.pendingHook = undefined;
        hooks.release(record.id);
        if (!guarded || record.sourceVersion === version) resetProjection(record);
      }
      for (const record of created) if (records.get(record.id) === record && (!guarded || record.sourceVersion === version)) {
        try { record.element.remove(); } catch {}
        if (guarded && record.sourceVersion !== version) continue;
        for (const release of record.releaseSelects) try { release(); } catch {}
        for (const binding of record.texts) try { binding.releaseGroup?.(); } catch {}
        if (!guarded || records.get(record.id) === record) records.delete(record.id);
      }
      if (guarded) for (const record of records.values()) if (record.sourceVersion === version && !mounted!.has(record.id) && record.element.parentElement === root) {
        record.element.remove();
        if (record.sourceVersion === version) resetProjection(record);
      }
      if (!guarded || version === renderVersion) {
        visibleIds = Object.freeze(visibleIds.filter(id => records.get(id)?.element.parentElement === root));
        cleanupErrors.length = 0;
      }
      if (version === renderVersion) {
        filteredIds = Object.freeze(priorFiltered.filter(id => {
          const row = sourceRows.get(id);
          return row && row.status !== "delete";
        }));
      }
      throw cause;
    } finally {
      editingRender = false;
      if (notifySelection && !disposed) {
        if (failed) {
          try { syncSelection(); } catch { /* Keep the binding failure primary. */ }
          try { notifySelection(); } catch { /* Keep the binding failure primary. */ }
        } else notifySelection();
      }
    }
  }

  function eventRecord(target: Element): RenderedRow<T> | undefined {
    const element = target.closest("li");
    if (!element || element.parentElement !== root || target.closest("ul, ol") !== root) return;
    const id = rowIds.get(element);
    return id === undefined ? undefined : records.get(id);
  }

  function available(control: HTMLElement): boolean {
    return !control.matches(":disabled") && !control.closest('[hidden], [inert], [aria-disabled="true"]');
  }

  function keyboardButton(button: HTMLButtonElement): boolean {
    return button.tabIndex >= 0 && available(button) && button.getClientRects().length > 0 &&
      button.ownerDocument.defaultView?.getComputedStyle(button).visibility === "visible";
  }

  function onClick(event: Event): void {
    if (!(event instanceof MouseEvent) || event.defaultPrevented || !(event.target instanceof Element)) return;
    const target = event.target, record = eventRecord(target);
    if (!record || target.closest('[hidden], [inert], [aria-disabled="true"]')) return;
    const button = target.closest<HTMLButtonElement>("button[data-select-row]");
    if (button) {
      if (record.buttons.includes(button) && available(button)) { selectionWritable(); selection.choose(record.id, event); }
      return;
    }
    if (!selectOnRowClick) return;
    const interactive = target.closest(`${interactiveContent}, label, [role="button"], [role="link"]`);
    if (interactive && record.element.contains(interactive)) return;
    if (record.buttons.some(keyboardButton)) { selectionWritable(); selection.choose(record.id, event); }
  }

  function onKeyDown(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.defaultPrevented || !(event.target instanceof HTMLButtonElement)) return;
    const button = event.target, record = eventRecord(button);
    if (!record?.buttons.includes(button) || !available(button)) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      event.preventDefault(); selectionWritable();
      selection.setSelected(visibleIds.filter(id => selection.eligible(id, "selection")), event);
    } else if (event.key === "Escape") {
      event.preventDefault(); selectionWritable(); selection.setSelected([], event);
    } else if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      const enabled = visibleIds.flatMap(id => {
        const target = records.get(id)?.buttons.find(keyboardButton);
        return target ? [{ id, target }] : [];
      });
      const index = enabled.findIndex(({ id }) => id === record.id);
      if (index < 0) return;
      const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1
        : index + (event.key === "ArrowDown" ? 1 : -1);
      const { id, target } = enabled[Math.max(0, Math.min(enabled.length - 1, next))];
      event.preventDefault(); selectionWritable();
      if ((!event.shiftKey || selection.choose(id, event, record.id)) && !disposed && eventRecord(target)?.id === id) focusVisible(target);
    }
  }

  function onCheck(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const input = event.target, master = masters.find(control => control.element === input);
    if (master && event.currentTarget !== input) return;
    const record = master ? undefined : eventRecord(input);
    if (!master && !record?.checks.includes(input)) return;
    selectionWritable();
    try {
      if (!available(input)) return;
      if (master) selection.checkAll(input.checked, master.scope, event);
      else {
        const ids = new Set(checkMode === "single" && input.checked ? [] : selection.checkedIds());
        if (input.checked) ids.add(record!.id); else ids.delete(record!.id);
        selection.setChecked([...ids], event);
      }
    } finally { if (!disposed) syncSelection(); }
  }

  let unsubscribe = () => {};
  function dispose(): void {
    if (disposed) return;
    disposed = true; renderVersion++;
    let failed = false, failure: unknown;
    try {
      rowRules.dispose(); unsubscribe();
      root.removeEventListener("click", onClick); root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("change", onCheck); hooks.dispose();
    }
    catch (cause) { failed = true; failure = cause; }
    for (const master of masters) {
      ownedMasters.delete(master.element);
      const { element, checked, mixed, disabled: originallyDisabled } = master;
      element.removeEventListener("change", onCheck);
      element.checked = checked; element.indeterminate = mixed; element.disabled = originallyDisabled;
    }
    if (hover !== undefined) {
      if (originalHover === null) root.removeAttribute("data-list-hover");
      else root.setAttribute("data-list-hover", originalHover);
    }
    for (const record of records.values()) {
      try { record.element.remove(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
      for (const release of record.releaseSelects) try { release(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
      for (const binding of record.texts) try { binding.releaseGroup?.(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
    }
    records.clear(); visibleIds = []; filteredIds = []; projected = [];
    try { anchor.replaceWith(template); if (empty) empty.hidden = emptyWasHidden!; if (rootFocusTabIndex && root.getAttribute("tabindex") === "-1") root.removeAttribute("tabindex"); }
    catch (cause) { if (!failed) { failed = true; failure = cause; } }
    for (const release of releaseTemplateSelects) try { release(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
    for (const release of releaseTemplateGroups) try { release(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
    boundRoots.delete(root);
    try { cleanupFailure(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
    if (failed) throw failure;
  }
  try {
    if (hover !== undefined) root.toggleAttribute("data-list-hover", hover);
    root.addEventListener("click", onClick);
    if (multiple) root.addEventListener("keydown", onKeyDown);
    if (checkIndexes.length) root.addEventListener("change", onCheck);
    for (const master of masters) { ownedMasters.add(master.element); master.element.addEventListener("change", onCheck); }
    unsubscribe = sourceRows.subscribe(event => {
      if (editable) { render(false, event); return; }
      rowRules.prune(event, id => sourceRows.get(id) !== undefined);
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

  function reveal(id: RowId, validated?: ReadonlyMap<RowId, readonly ValidationIssue[]>): boolean {
    bindable();
    const index = projected.findIndex(row => row.id === id);
    const row = sourceRows.get(id);
    if (index < 0 || !row || row.status === "delete") return false;
    if (request) {
      const page = Math.floor(index / request.size) + 1;
      if (page !== request.page) { request = { page, size: request.size }; render(false, undefined, validated); }
    }
    const record = records.get(id);
    if (!record || !mounted(record)) return false;
    if (record.element.isConnected) record.element.scrollIntoView({ block: "nearest", inline: "nearest" });
    return true;
  }

  function validateEditable(rows: readonly RowSnapshot<T>[], show = revealInvalid): ValidationResult {
    bindable();
    const entries = sourceRows.entries(), version = renderVersion;
    const check = () => {
      active();
      if (version !== renderVersion || entries !== sourceRows.entries()) throw listError("LIST_BIND_STALE", "The rows or view changed during validation.");
    };
    const issues: ValidationIssue[] = [];
    const validated = new Map<RowId, readonly ValidationIssue[]>();
    let probe: RenderedRow<T> | undefined;
    editingRender = true;
    try {
      for (const row of rows) {
        const record = records.get(row.id) ?? (probe ??= createRecord(row.id, check, true));
        const result = record.editor!.validate(row.id, mounted(record));
        validated.set(row.id, result.issues);
        issues.push(...result.issues);
        check();
      }
    } finally {
      try { for (const release of probe?.releaseSelects ?? []) release(); }
      finally { editingRender = false; }
    }
    check();
    if (!show || !issues.length) return { valid: issues.length === 0, issues };
    const eligible = new Set(projected.map(row => row.id));
    const first = issues.find(issue => issue.rowId !== null && eligible.has(issue.rowId));
    if (first?.rowId == null || !reveal(first.rowId, validated)) return { valid: false, issues };
    const record = records.get(first.rowId)!;
    record.editor!.controls(first.field).some(focusVisible);
    return { valid: false, issues: issues.map(({ element: _element, ...issue }) => {
      const record = issue.rowId === null ? undefined : records.get(issue.rowId);
      const element = record && mounted(record) ? record.editor!.controls(issue.field).find(control => control.isConnected) : undefined;
      return element ? { ...issue, element } : issue;
    }) };
  }

  const handle: ListHandle<T> = {
    refresh() {
      bindable();
      const version = renderVersion, source = sourceRows.entries({ includeDeleted: true });
      const check = (cause?: unknown) => {
        active();
        if (version !== renderVersion || source !== sourceRows.entries({ includeDeleted: true })) throw listError("LIST_BIND_STALE", "The rows or view changed while preparing rules.");
        if (cause instanceof FrameworkError && cause.api === "bindList") throw cause;
      };
      const retained = Array.from(records.values()).filter(record => sourceRows.get(record.id) !== undefined);
      if (editable) {
        if (runner.running) throw listError("LIST_BIND_REENTRANT", "Finish the current rule before changing its declaration.");
        editingRender = true;
        try {
          rowRules.refresh([], check, (candidate, current) => {
            for (const record of retained) record.editor!.checkRules(candidate, current);
          });
          for (const record of retained) { record.editor!.form.rescan(); check(); }
        } finally { editingRender = false; }
      } else rowRules.refresh(retained, check);
      render(true);
    },
    rowForm(id) {
      active();
      const record = records.get(id);
      if (!record?.editor || !mounted(record) || sourceRows.get(id)?.status === "delete") return null;
      const { form } = record.editor;
      return {
        read() { requireMounted(record); return form.read(); },
        prepare() { requireMounted(record); return form.prepare(); },
        validate() { requireMounted(record); return validateEditable([liveRow(id)], false); }
      };
    },
    value(id) { active(); return liveRow(id).value; },
    update(id, fields) {
      bindable();
      if (id === undefined && fields === undefined) { handle.refresh(); return; }
      if (!editable) throw listError("LIST_EDIT", "Enable List editing before updating a row Form.");
      const record = id === undefined ? undefined : records.get(id);
      if (!record?.editor) throw listError("LIST_ROW", "Reveal the row before updating its Form.", { id });
      requireMounted(record);
      editingRender = true;
      try { record.editor.form.refresh(fields); }
      finally { editingRender = false; }
    },
    reveal(id) { return reveal(id); },
    select(id) { selectionWritable(); selection.select(id); },
    selected() { active(); return selection.selected(); },
    rowIds(scope: GridRowScope) { active(); return selection.rowIds(scope); },
    selectedIds() { active(); return selection.selectedIds(); },
    setSelected(ids) { selectionWritable(); selection.setSelected(ids); },
    checkedIds() { active(); return selection.checkedIds(); },
    setChecked(ids) { selectionWritable(); selection.setChecked(ids); },
    checkAll(checked, scope) { selectionWritable(); selection.checkAll(checked, scope); },
    checkState(scope) { active(); return selection.checkState(scope); },
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
      if (editable) return validateEditable(rows);
      const issues = rows.flatMap(row => validateRow(row));
      return { valid: issues.length === 0, issues };
    },
    dispose
  };
  return handle;
  } catch (cause) { for (const release of releaseTemplateGroups) try { release(); } catch {} throw cause; }
}
