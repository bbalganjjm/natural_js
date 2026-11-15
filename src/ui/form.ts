// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { sameJson } from "../internal/same-json.js";
import type { RowId, RowSnapshot, RowsEvent } from "../data/index.js";
import { parsePath, readPath, writePath } from "./field-path.js";
import { createRuleRunner, sameRuleCalls } from "./rules.js";
import type { RuleCall, RuleDeclarations } from "./rules.js";
import { claimSelect, getSelect } from "./select-owner.js";
import type { SelectBinding, SelectCatalog, SelectReplacement } from "./select-owner.js";
import { compileChoiceGroup, choiceGroupChoices, choiceGroupOptions, choiceGroupRequired, mountChoiceGroup } from "./choice-group.js";
import { checkGroupValue, choiceGroupCheckpoint, claimChoiceGroup, getChoiceGroup } from "./choice-group-owner.js";
import type { ChoiceGroupBinding, ChoiceGroupDefinition, ChoiceGroupPrepare, ChoiceGroupReplacement } from "./choice-group-owner.js";
import { renderRowOptions, rowOptionAvailable, rowOptions, selectRowOptions } from "./row-options.js";
import type { RowOption, RowOptionValue } from "./row-options.js";
import { arrayField, captureCheckboxValues, control, disabled, display, displayField, fieldValue, formatCapable, interactiveContent, nativeMessage, textLengthControl } from "./native-control.js";
import { fieldRenderers, renderField } from "./field-render.js";
import { assertNativePaths, createNativeDefaults } from "./native-defaults.js";
import { createValueBinding } from "./value-binding.js";
import type { ValueProjection } from "./value-binding.js";
import type {
  FormBindContext, FormHandle, FormOptions, SourceBindContext, ValueBindContext, FormatRule, RuleContext,
  ValidateRule, ValidationIssue, ValidationResult
} from "./index.js";

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type ValuePhase = ValueBindContext["phase"];
interface Choices {
  options?: readonly string[];
  label?: readonly string[];
  value?: readonly string[];
  select?: SelectBinding;
  catalog?: SelectCatalog;
  authoredNodes: Node[];
  authoredOptions: HTMLOptionElement[];
  authored: RowOptionValue[];
  selection: boolean[];
  raw: Map<HTMLOptionElement, unknown>;
  source?: unknown;
  bound: boolean;
}

interface Field {
  element: HTMLElement;
  elements: HTMLElement[];
  kind: "single" | "radio" | "checkbox" | "multiple";
  name: string;
  path: readonly string[];
  format: readonly RuleCall<FormatRule>[];
  validate: readonly RuleCall<ValidateRule>[];
  declarations: { format: string | null; validate: string | null };
  choices?: Choices;
  group?: ChoiceGroupBinding;
  checkboxValues?: readonly [string, string];
  groupRoot?: HTMLFieldSetElement;
  groupDefinition?: ChoiceGroupDefinition;
  groupSource?: unknown;
  groupBound?: boolean;
  projection?: ValueProjection;
  nativeProjection?: { id: RowId; raw: unknown; shown: NativeState; entered: boolean };
  renderingId?: RowId;
  error?: HTMLElement;
  originals: { element: HTMLElement; describedBy: string | null; invalid: string | null; changed: string | null }[];
}

interface NativeState {
  value: unknown;
  badInput: boolean;
  selected?: { option: HTMLOptionElement; value: string; disabled: boolean; owned: boolean; raw: unknown }[];
  checked?: { input: HTMLInputElement; value: string; checked: boolean; disabled: boolean; unchecked?: string | null }[];
}

interface Candidate {
  value: unknown;
  entered?: unknown;
  parseError?: string;
  parseFailed?: boolean;
}

let nextErrorId = 0;
const boundRoots = new WeakSet<HTMLElement>();

function formError(code: string, message: string, detail?: Record<string, unknown>): FrameworkError {
  return new FrameworkError({ api: "bindForm", code, message, detail });
}

function errorId(element: HTMLElement): string {
  if (element.id) return element.id;
  let candidate: string;
  do { candidate = `natural-form-error-${++nextErrorId}`; }
  while (element.ownerDocument.getElementById(candidate));
  element.id = candidate;
  return candidate;
}

export function bindForm<T extends object = Record<string, unknown>>(
  root: HTMLElement,
  options: FormOptions<T> = {}
): FormHandle<T> {
  if (!root || root.nodeType !== 1) {
    throw formError("FORM_ROOT", "Form root must be an HTML element.");
  }
  if (boundRoots.has(root)) {
    throw formError("FORM_IN_USE", "This Form root is already bound.");
  }
  if (options.autoValidate !== undefined && typeof options.autoValidate !== "boolean") {
    throw formError("FORM_VALIDATE", "autoValidate must be boolean.");
  }
  const autoValidate = options.autoValidate ?? true;
  const { rows, rules, parse } = options;
  const { beforeBind, onBind } = options;
  const bindCallbacks = beforeBind !== undefined || onBind !== undefined;
  if (bindCallbacks && (!rows || beforeBind !== undefined && typeof beforeBind !== "function" ||
      onBind !== undefined && typeof onBind !== "function")) {
    throw formError("FORM_BIND", "Whole-row callbacks need Rows and synchronous functions.");
  }
  const { beforeBindValue, onBindValue } = options;
  const valueCallbacks = beforeBindValue !== undefined || onBindValue !== undefined;
  if (valueCallbacks && (!rows || beforeBindValue !== undefined && typeof beforeBindValue !== "function" ||
      onBindValue !== undefined && typeof onBindValue !== "function")) {
    throw formError("FORM_VALUE_OPTIONS", "Value callbacks need Rows and synchronous functions.");
  }
  const { beforeSourceBind, onSourceBind } = options;
  if (!rows && (beforeSourceBind !== undefined || onSourceBind !== undefined)) {
    throw formError("FORM_SOURCE_OPTIONS", "Source callbacks need Rows and synchronous functions.");
  }
  const values = createValueBinding<T>("bindForm", { beforeBindValue, onBindValue, beforeSourceBind, onSourceBind });
  const parsers = new Map(Object.entries(parse ?? {}));
  const runner = createRuleRunner("bindForm", rules);
  rows?.entries();
  function compileFields(view: RuleDeclarations = runner, previous?: ReadonlyMap<string, Field>, checkpoint?: () => void) {
    checkpoint?.();
    for (const element of [root, ...root.querySelectorAll<HTMLElement>("[data-options]")]) {
      if (!element.hasAttribute("data-options")) continue;
      if (!rows || !(element instanceof HTMLSelectElement || element instanceof HTMLFieldSetElement && [...element.children].some(child => child.matches("template[data-choice-template]"))) || !element.hasAttribute("data-field") ||
          !element.hasAttribute("data-option-label") || !element.hasAttribute("data-option-value")) {
        throw formError("FORM_OPTIONS", "Row-local choices need Rows and a Select with data-field, data-options, data-option-label and data-option-value.",
          { field: element.getAttribute("data-field") ?? "" });
      }
    }
    for (const element of [root, ...root.querySelectorAll<HTMLElement>("[data-unchecked-value]")]) if (element.hasAttribute("data-unchecked-value") && !element.hasAttribute("data-field")) {
      throw formError("FORM_CONTROL", "A coded checkbox needs one marked native checkbox.");
    }
    const errorRegions = new Map<string, HTMLElement>();
    for (const region of root.querySelectorAll<HTMLElement>("[data-error-for]")) {
      const name = region.getAttribute("data-error-for")!;
      if (errorRegions.has(name)) {
        throw formError("FORM_ERROR_REGION", "An error region is repeated for one field.", { field: name });
      }
      errorRegions.set(name, region);
    }

    const elements = [root, ...root.querySelectorAll<HTMLElement>("[data-field]")]
      .filter(element => element.hasAttribute("data-field"));
    const fields: Field[] = [];
    const byName = new Map<string, Field>();
    for (const element of elements) {
      const name = element.getAttribute("data-field")!;
      const group = getChoiceGroup(element);
      const generated = element instanceof HTMLFieldSetElement && [...element.children].some(child => child.matches("template[data-choice-template]"));
      let groupDefinition: ChoiceGroupDefinition | undefined;
      if (generated) {
        try { groupDefinition = group?.definition ?? compileChoiceGroup(element as HTMLFieldSetElement); }
        catch (cause) { throw new FrameworkError({ api: "bindForm", code: "FORM_CHOICE_GROUP", message: "Use a valid generated choice template.", detail: { field: name }, cause }); }
      }
      const checkboxValues = captureCheckboxValues(element, () => { throw formError("FORM_CONTROL", "A coded checkbox needs distinct explicit value and data-unchecked-value strings.", { field: name }); });
      const input = element.localName === "input" ? element as HTMLInputElement : null;
      const kind = groupDefinition?.kind ?? group?.kind ?? (input?.type === "radio" ? "radio" :
        input?.type === "checkbox" ? "checkbox" :
          element.localName === "select" && (element as HTMLSelectElement).multiple ? "multiple" : "single");
      if (input?.type === "file") {
        if (rows) throw formError("FORM_FILE_ROWS", "File inputs require a local Form; Rows store JSON values.", { field: name });
        if (input.multiple) throw formError("FORM_FILE_MULTIPLE", "Validate multiple files in application code.", { field: name });
      }
      if (!groupDefinition && !group && kind === "radio" && (!input?.form || !input.name ||
          input.form !== root && !root.contains(input.form))) {
        throw formError("FORM_RADIO_OWNER", "Radio fields need a name and a form owner inside this Form root.", { field: name });
      }
      const existing = byName.get(name);
      if (existing) {
        if (checkboxValues || existing.checkboxValues) throw formError("FORM_CONTROL", "Coded values belong to one checkbox, not a field group.", { field: name });
        if (groupDefinition || existing.groupDefinition || group || existing.group || (kind !== "radio" && kind !== "checkbox") || existing.kind !== kind) {
          throw formError("FORM_FIELD_REPEAT", "Only radio or checkbox controls may repeat a field.", { field: name });
        }
        if (kind === "radio") {
          const first = existing.element as HTMLInputElement;
          if (first.form !== input!.form || first.name !== input!.name) {
            throw formError("FORM_RADIO_OWNER", "One radio field must share a form owner and name.", { field: name });
          }
        }
        if (existing.elements.some(member => (member as HTMLInputElement).value === input!.value)) {
          throw formError("FORM_GROUP_VALUE", "Group choices need distinct values.", { field: name });
        }
        existing.elements.push(element);
        existing.originals.push({
          element, describedBy: element.getAttribute("aria-describedby"),
          invalid: element.getAttribute("aria-invalid"), changed: element.getAttribute("data-field-changed")
        });
        continue;
      }
      const members = group ? [...group.inputs] : groupDefinition ? [] : [element];
      const field: Field = {
        element: group?.inputs[0] ?? element, elements: members, kind, name, path: parsePath(name), group, groupDefinition, checkboxValues,
        groupRoot: generated ? element as HTMLFieldSetElement : undefined,
        format: [], validate: [], declarations: { format: null, validate: null }, error: errorRegions.get(name),
        originals: (group || groupDefinition ? [element, ...members] : members).map(element => ({
          element, describedBy: element.getAttribute("aria-describedby"),
          invalid: element.getAttribute("aria-invalid"), changed: element.getAttribute("data-field-changed")
        }))
      };
      const select = element instanceof HTMLSelectElement ? getSelect(element) : undefined;
      if (element instanceof HTMLSelectElement && (element.hasAttribute("data-options") || select)) {
        const authoredOptions = [...select?.catalog.options ?? element.options];
        const authored = select ? [...select.catalog.values] : authoredOptions.map(option => option.value === "" ? null : option.value);
        field.choices = {
          options: element.hasAttribute("data-options") ? parsePath(element.getAttribute("data-options")!) : undefined,
          label: element.hasAttribute("data-option-label") ? parsePath(element.getAttribute("data-option-label")!) : undefined,
          value: element.hasAttribute("data-option-value") ? parsePath(element.getAttribute("data-option-value")!) : undefined, select, catalog: select?.catalog,
          authoredNodes: [...select?.catalog.nodes ?? element.childNodes], authoredOptions, authored,
          selection: authoredOptions.map(option => option.selected),
          raw: select ? new Map(select.raw) : new Map(authoredOptions.map((option, index) => [option, authored[index]])), bound: false
        };
      }
      fields.push(field);
      byName.set(name, field);
    }
    for (const field of fields) {
      for (const attribute of ["data-format", "data-validate"] as const) {
        if (view.configured(field.name, attribute)) continue;
        const declarations = field.elements.map(element => {
          const value = element.getAttribute(attribute); checkpoint?.(); return value;
        }).filter((value): value is string => value !== null);
        if (new Set(declarations).size > 1) {
          throw formError("FORM_GROUP_RULES", "One field group needs one rule declaration.", { field: field.name });
        }
      }
      const formatElement = field.groupRoot ?? field.group?.root ?? field.elements.find(element => element.hasAttribute("data-format")) ?? field.element;
      const validateElement = field.groupRoot ?? field.group?.root ?? field.elements.find(element => element.hasAttribute("data-validate")) ?? field.element;
      field.declarations.format = formatElement.getAttribute("data-format"); checkpoint?.();
      field.declarations.validate = validateElement.getAttribute("data-validate"); checkpoint?.();
      const retained = previous?.get(field.name);
      field.format = retained && !view.configured(field.name, "data-format") && !runner.configured(field.name, "data-format") &&
        retained.declarations.format === field.declarations.format ? retained.format : view.formats(field.declarations.format, field.name, checkpoint);
      field.validate = retained && !view.configured(field.name, "data-validate") && !runner.configured(field.name, "data-validate") &&
        retained.declarations.validate === field.declarations.validate ? retained.validate : view.validators(field.declarations.validate, field.name, checkpoint);
      if (field.format.length && (field.groupDefinition || field.group || !formatCapable(field.element))) {
        throw formError("FORM_FORMAT_CONTROL", "Formatting requires a text field.", { field: field.name });
      }
      if ((field.groupDefinition || field.group) && (parsers.has(field.name) || Object.hasOwn(options.render ?? {}, field.name))) {
        throw formError("FORM_CHOICE_GROUP", "Choice groups do not accept parsers or display renderers.", { field: field.name });
      }
      if (!rows && field.format.length && !control(field.element) && (field.element.isContentEditable ||
          field.element.matches("[data-error-for]") || field.element.querySelector(`${interactiveContent}, [data-field], [data-error-for]`))) {
        throw formError("FORM_FORMAT_CONTROL", "Local formatting cannot replace editable or bound content.", { field: field.name });
      }
      if (parsers.get(field.name) && (field.choices || field.kind === "checkbox" || field.kind === "multiple")) {
        throw formError("FORM_PARSE_CONTROL", "A string parser cannot convert typed choices, boolean or array controls.", { field: field.name });
      }
    }
    return { fields, byName };
  }
  const regionState = new Map<HTMLElement, { id: string | null; live: string | null; text: string | null }>();
  let { fields, byName } = compileFields();
  function compileSourceFields(graph: readonly Field[]): Map<string, Field[]> | undefined {
    if (!values.sourceEnabled) return undefined;
    const groups = new Map<string, Field[]>();
    for (const field of graph) {
      const direct = field.path[0], dependency = field.choices?.options?.[0] ?? field.groupDefinition?.source?.options[0];
      for (const key of dependency !== undefined && dependency !== direct ? [direct, dependency] : [direct]) {
        const group = groups.get(key) ?? [];
        group.push(field); groups.set(key, group);
      }
    }
    return groups;
  }
  let sourceFields = compileSourceFields(fields);
  const renderers = fieldRenderers("bindForm", fields.map(field => ({
    name: field.name, element: field.element, formatted: field.format.length > 0
  })), options.render);
  function capture(field: Field) {
    const element = field.element;
    const files = element instanceof HTMLInputElement && element.type === "file" ? [...element.files ?? []] : undefined;
    const selection = element instanceof HTMLSelectElement
      ? [...element.options].map(option => ({ option, selected: option.selected })) : undefined;
    const selected = field.choices ? selection!.filter(item => item.selected).map(item => field.choices!.raw.get(item.option)) : undefined;
    let value = files ? files[0]?.name ?? "" : fieldValue(field);
    if (selected) value = field.kind === "multiple" ? selected : selected[0] ?? null;
    return {
      field, element,
      value,
      children: control(element) ? [] : [...element.childNodes],
      src: element.localName === "img" ? element.getAttribute("src") : undefined,
      checked: field.kind === "radio" || field.kind === "checkbox"
        ? field.elements.map(element => ({ input: element as HTMLInputElement, checked: (element as HTMLInputElement).checked })) : undefined,
      selection, files
    };
  }
  function annotation(element: HTMLElement, bindingOnly = false): string {
    return JSON.stringify([
      element.localName, element.getAttribute("data-field"),
      ...bindingOnly ? [] : [element.getAttribute("data-format"), element.getAttribute("data-validate")],
      element.getAttribute("data-options"),
      element.getAttribute("data-option-label"), element.getAttribute("data-option-value"),
      element.getAttribute("data-unchecked-value"),
      element instanceof HTMLInputElement ? element.type : null,
      element instanceof HTMLInputElement && ["radio", "checkbox"].includes(element.type) ? [element.name, element.value] : null,
      element instanceof HTMLSelectElement || element instanceof HTMLInputElement && element.type === "file" ? element.multiple : null
    ]);
  }
  let initial = fields.map(capture);
  let renderedOriginals = initial.filter(({ field, element }) => renderers.has(field.name) ||
    !rows && field.format.length && !control(element));
  let choiceFields = fields.filter(field => field.choices);
  const localRenderedValues = new Map<Field, { raw: unknown; shown: unknown; invalid: boolean }>(rows ? [] :
    initial.filter(({ field }) => renderers.has(field.name) || field.format.length)
    .map(({ field, value }) => [field, { raw: value, shown: value, invalid: false }] as const));
  let byElement = new Map(fields.flatMap(field => field.elements.map(element => [element, field] as const)));
  const releaseSelects = new Map<HTMLSelectElement, () => void>();
  const pendingSelects = new Map<HTMLSelectElement, () => void>();
  const releaseGroups = new Map<ChoiceGroupBinding, () => void>();
  const ownedGroups = new Map<ChoiceGroupBinding, () => void>();
  const pendingGroups = new Map<ChoiceGroupBinding, () => void>();
  let annotations = new Map(fields.flatMap(field => field.originals.map(({ element }) => [element, annotation(element)] as const)));
  const errorIds = new Map<Field, string>();
  const resetOwners = new Set<HTMLFormElement>();
  if (!rows) for (const field of fields) for (const { element } of field.originals) {
    const owner = nativeOwner(element);
    if (owner) resetOwners.add(owner);
  }
  const pendingResets = new Map<HTMLFormElement, Event[]>();
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  let boundId: RowId | null = null;
  let acceptedSource: RowSnapshot<T> | undefined;
  let unsubscribe: (() => void) | undefined;
  let disposed = false;
  let initialized = false;
  let scanning = false;
  let replacingGroup: { events: RowsEvent[]; reset: boolean } | undefined;
  let rescanIncomplete = false;
  let workDepth = 0;
  let automatic = true;
  let restoring = false;
  let reconciling = false;
  let pointerField: Field | undefined;
  let renderVersion = 0;
  let localRendering = false;
  let preparing = false;
  let nativeRevision = 0;
  let preview: { status: string | null; tabIndex: string | null } | undefined;
  const previewDisabled = new Map<Control, boolean>();
  const drafts = new Map<RowId, Map<Field, unknown>>();
  const issues = new Map<Field, readonly ValidationIssue[]>();
  const activeValues = new Map<Field, Set<RowId>>();
  const activeBindings = new Set<RowId>();
  function nativeEntries(states: readonly ReturnType<typeof capture>[]) { return states.filter(state => state.field.groupDefinition || state.field.group || control(state.element)).map(state => ({
    name: state.field.name, path: state.field.path, value: state.value, element: state.element,
    ...(!state.field.choices && parsers.has(state.field.name) ? { parse: parsers.get(state.field.name)! } : {})
  })); }
  const defaultEntries = nativeEntries(initial);
  const readDefaults = createNativeDefaults("bindForm", defaultEntries, active);
  function defaults() { return working(readDefaults); }
  let localRenderStarted = false;
  try {
    for (const field of fields) {
      if (field.groupDefinition && !field.group) mountFieldGroup(field, active);
      if (field.group) releaseGroups.set(field.group, acquireGroup(field));
      if (field.element instanceof HTMLSelectElement) {
        releaseSelects.set(field.element, claimSelect(field.element, "bindForm", field.choices?.select ? prepare => replaceSelectChoices(field, prepare) : undefined));
        const select = getSelect(field.element);
        if (select !== field.choices?.select || select && field.choices?.catalog !== select.catalog) {
          throw formError("FORM_OPTIONS", "The common Select catalog changed during field admission.", { field: field.name });
        }
      }
    }
    boundRoots.add(root);
    if (localRenderedValues.size) { localRenderStarted = true; renderLocal(); }
  } catch (cause) {
    boundRoots.delete(root);
    for (const release of releaseSelects.values()) release();
    for (const release of releaseGroups.values()) try { release(); } catch {}
    for (const dispose of ownedGroups.values()) try { dispose(); } catch {} ownedGroups.clear();
    if (localRenderStarted) {
      for (const [field, value] of localRenderedValues) if (control(field.element)) display(field.element, value.raw, field.checkboxValues);
      restoreRendered(true);
    }
    throw cause;
  }
  try {
    for (const field of fields) {
      const region = field.error;
      if (!region) continue;
      if (!regionState.has(region)) {
        regionState.set(region, {
          id: region.getAttribute("id"), live: region.getAttribute("aria-live"), text: region.textContent
        });
        if (!region.hasAttribute("aria-live")) region.setAttribute("aria-live", "polite");
      }
      const id = errorId(region);
      errorIds.set(field, id);
      for (const original of field.originals) {
        const tokens = new Set((original.describedBy ?? "").split(/\s+/).filter(Boolean));
        tokens.add(id);
        original.element.setAttribute("aria-describedby", [...tokens].join(" "));
      }
    }
  } catch (cause) {
    try { dispose(); } catch { /* Preserve the construction failure after releasing ownership. */ }
    throw cause;
  }

  function working<Result>(run: () => Result): Result {
    workDepth++;
    try { return run(); } finally { workDepth--; }
  }

  function active(): void {
    if (disposed) throw formError("FORM_DISPOSED", "This Form has been disposed.");
    if (scanning) throw formError("FORM_RESCAN", "This Form is reconciling its fields.");
  }

  function rowValue(id: RowId, editable = false): Record<string, unknown> {
    const row = rows?.get(id);
    if (!row || editable && row.status === "delete") {
      throw formError("ROW_MISSING", "The row ID is not available for this Form.", { id });
    }
    return row.value as Record<string, unknown>;
  }

  function acceptSource(version: number, snapshot?: RowSnapshot<T>): void {
    if (values.sourceEnabled && snapshot && !disposed && version === renderVersion &&
        boundId === snapshot.id && rows!.get(snapshot.id) === snapshot) acceptedSource = snapshot;
  }

  function localValues(): Record<string, unknown> {
    return working(() => {
      let values: Record<string, unknown> = {};
      for (const field of fields) values = writePath(values, field.path, localFieldValue(field));
      return values;
    });
  }

  function localFieldValue(field: Field): unknown {
    const retained = localRenderedValues.get(field);
    if (!retained) return field.choices ? nativeState(field).value : fieldValue(field);
    if (control(field.element) || field.element.localName === "img") {
      const entered = fieldValue(field);
      if (!Object.is(entered, retained.shown)) {
        retained.raw = retained.shown = entered;
        nativeRevision++;
        retained.invalid = false;
      }
    }
    return retained.raw;
  }

  function nativeOwner(element: HTMLElement): HTMLFormElement | null {
    return control(element) || element instanceof HTMLFieldSetElement ? element.form : element.closest<HTMLFormElement>("form");
  }

  function nativeField(field: Field): boolean {
    return field.groupDefinition !== undefined || field.group !== undefined || control(field.element) && !(field.element instanceof HTMLInputElement &&
      ["button", "submit", "reset", "image"].includes(field.element.type));
  }

  function setNativeProjection(field: Field, projection?: Field["nativeProjection"]): void {
    field.nativeProjection = projection;
    nativeRevision++;
  }

  function nativeState(field: Field): NativeState {
    const element = field.element;
    const selected = element instanceof HTMLSelectElement ? [...element.selectedOptions].map(option => ({
      option, value: option.value,
      disabled: option.disabled || option.parentElement instanceof HTMLOptGroupElement && option.parentElement.disabled,
      owned: !field.choices || field.choices.raw.has(option), raw: field.choices ? field.choices.raw.get(option) : option.value
    })) : undefined;
    const checked = field.kind === "radio" || field.kind === "checkbox" ? field.elements.map(element => {
      const input = element as HTMLInputElement;
      return { input, value: input.value, checked: input.checked, disabled: input.disabled,
        ...(field.checkboxValues ? { unchecked: input.getAttribute("data-unchecked-value") } : {}) };
    }) : undefined;
    const value = selected && field.choices ? field.kind === "multiple" ? selected.map(item => item.raw) : selected[0]?.raw ?? null : fieldValue(field);
    return { value, selected, checked, badInput: element instanceof HTMLInputElement && element.validity.badInput };
  }

  function sameNative(before: NativeState, after: NativeState): boolean {
    return before.badInput === after.badInput && sameJson(before.value, after.value) &&
      (!before.selected || !!after.selected && before.selected.length === after.selected.length && before.selected.every((item, index) => {
        const next = after.selected![index];
        return item.option === next.option && item.value === next.value && item.disabled === next.disabled &&
          item.owned === next.owned && Object.is(item.raw, next.raw);
      })) && (!before.checked || !!after.checked && before.checked.length === after.checked.length && before.checked.every((item, index) => {
        const next = after.checked![index];
        return item.input === next.input && item.value === next.value && item.checked === next.checked && item.disabled === next.disabled && item.unchecked === next.unchecked;
      }));
  }

  function rememberNative(field: Field, id: RowId, raw: unknown, entered = false, current?: () => boolean): void {
    if (!nativeField(field)) return;
    const shown = nativeState(field);
    if (!disposed && boundId === id && (!current || current())) setNativeProjection(field, { id, raw, shown, entered });
  }

  function deletedPreview(): boolean { return !!rows && boundId !== null && rows.get(boundId)?.status === "delete"; }

  function clearPendingResets(): void {
    if (pendingResets.size || resetTimer !== undefined) nativeRevision++;
    pendingResets.clear();
    if (resetTimer !== undefined) { clearTimeout(resetTimer); resetTimer = undefined; }
  }

  function syncPreview(): void {
    const id = boundId, graph = fields, version = renderVersion;
    const current = () => !disposed && boundId === id && fields === graph && renderVersion === version;
    const locked = !disposed && deletedPreview();
    const controls = new Set(locked ? fields.flatMap(field => field.elements.filter(control)) : []);
    for (const [element, original] of previewDisabled) if (!controls.has(element)) {
      element.disabled = original;
      previewDisabled.delete(element);
    }
    if (locked) {
      if (!preview) preview = { status: root.getAttribute("data-row-status"), tabIndex: root.getAttribute("tabindex") };
      const focused = root.ownerDocument.activeElement;
      for (const element of controls) {
        if (!previewDisabled.has(element)) previewDisabled.set(element, element.disabled);
        element.disabled = true;
      }
      root.setAttribute("data-row-status", "delete");
      if (!control(root) && focused instanceof HTMLElement && controls.has(focused as Control)) {
        if (!root.hasAttribute("tabindex")) root.setAttribute("tabindex", "-1");
        root.focus();
      }
    } else if (preview) {
      const original = preview; preview = undefined;
      if (original.status === null) root.removeAttribute("data-row-status"); else root.setAttribute("data-row-status", original.status);
      if (original.tabIndex === null) root.removeAttribute("tabindex"); else root.setAttribute("tabindex", original.tabIndex);
      clearPendingResets();
      for (const field of fields) setNativeProjection(field);
    }
    if (locked && !current()) return;
    if (rows) {
      const owners = new Set<HTMLFormElement>();
      if (locked) for (const field of fields) for (const { element } of field.originals) {
        const owner = nativeOwner(element); if (owner) owners.add(owner);
      }
      for (const owner of resetOwners) if (!owners.has(owner)) { owner.removeEventListener("reset", onReset); resetOwners.delete(owner); }
      for (const owner of owners) if (!resetOwners.has(owner)) { resetOwners.add(owner); owner.addEventListener("reset", onReset); }
    }
  }

  function restoreNative(field: Field, shown: NativeState): void {
    if (shown.selected) {
      const element = field.element as HTMLSelectElement;
      if (shown.selected.some(item => item.option.closest("select") !== element)) {
        throw formError("FORM_BIND", "Refresh the deleted preview before resetting its changed choices.", { field: field.name });
      }
      element.selectedIndex = -1;
      for (const selected of shown.selected) selected.option.selected = true;
    } else if (shown.checked) {
      for (const selected of shown.checked) selected.input.checked = selected.checked;
    } else display(field.element, shown.value, field.checkboxValues);
    nativeRevision++;
  }

  function groupSuffix(field: Field, source: unknown) {
    return choiceGroupOptions(field.groupDefinition!, source, key => {
      throw formError("FORM_OPTIONS", "A generated group needs string row choices.", { field: field.name, options: key, rowId: boundId });
    });
  }

  function mountFieldGroup(field: Field, checkpoint: () => void): void {
    const mounted = mountChoiceGroup(field.groupRoot!, field.groupDefinition!, { choices: [], defaults: [] }, { current: checkpoint });
    field.group = mounted.binding;
    ownedGroups.set(mounted.binding, mounted.dispose);
    field.groupBound = !field.groupDefinition!.source;
  }

  function acquireGroup(field: Field, creation?: unknown): () => void {
    const captured = initial.find(state => state.field === field);
    if (creation === undefined) creation = captured ? captured.value : fieldValue(field);
    const group = field.group!, release = claimChoiceGroup(group, (prepare: ChoiceGroupPrepare) =>
      replaceGroup(field, () => prepare(groupSuffix(field, boundId === null ? null : rowValue(boundId)))));
    let released = false;
    return () => {
      if (released) return; released = true;
      const dispose = ownedGroups.get(group); ownedGroups.delete(group);
      try {
        if (!dispose) {
          const current = choiceGroupCheckpoint(group), next = group.prepare([], current, true);
          let undo: (() => void) | undefined;
          try { undo = next.apply(); group.write(creation, () => { current(); return true; }); current(); next.finish(false); }
          catch (cause) { try { undo?.(); } catch { /* Preserve the release failure. */ } throw cause; }
        }
      } finally { release(); dispose?.(); }
    };
  }

  function refreshGroups(source: unknown, id: RowId | null, selected?: ReadonlySet<Field>): number | undefined {
    const snapshot = id === null ? undefined : rows!.get(id);
    let version = renderVersion;
    const current = () => !disposed && boundId === id && version === renderVersion && (id === null || rows!.get(id) === snapshot);
    for (const field of selected ?? fields) if (field.groupDefinition?.source && field.group) {
      if (!current()) return;
      const nextSource = readPath(source, field.groupDefinition.source.options);
      if (field.groupBound && Object.is(field.groupSource, nextSource)) continue;
      if (values.sourceRunning) throw formError("FORM_SOURCE", "A source callback cannot replace native membership inside its current source pair.", { field: field.name, rowId: id });
      if (id !== null && activeValues.get(field)?.has(id)) throw values.error(Object.freeze({ ...context(field, id, source as Record<string, unknown>), rowId: id, element: field.element, phase: "val" }),
        beforeBindValue ? "beforeBindValue" : "onBindValue", "A value callback cannot recursively bind the same field and row.");
      const suffix = groupSuffix(field, source);
      let next: ChoiceGroupReplacement | undefined, failed = false;
      try {
        publishGroup(field, () => next = field.group!.prepare(suffix, () => {
          if (disposed) throw formError("FORM_DISPOSED", "This Form has been disposed.");
          if (boundId !== id || id !== null && rows!.get(id) !== snapshot) throw formError("FORM_CHOICE_GROUP", "The source changed during group preparation.", { field: field.name });
        }));
        if (boundId !== id || id !== null && rows!.get(id) !== snapshot) return;
        version = renderVersion;
        field.groupSource = nextSource; field.groupBound = true;
      } catch (cause) { failed = true; throw cause; }
      finally { try { next?.finish(); } catch (cause) { if (!failed) throw cause; } }
      if (!current()) return;
    }
    return current() ? version : undefined;
  }

  function replaceGroup(field: Field, prepare: () => ChoiceGroupReplacement): void {
    active();
    if (!initialized || workDepth || restoring || reconciling || localRendering || rescanIncomplete || pendingResets.size) {
      throw formError("FORM_CHOICE_GROUP", "Finish current Form work before replacing its choices.", { field: field.name });
    }
    publishGroup(field, prepare);
  }

  function publishGroup(field: Field, prepare: () => ChoiceGroupReplacement): void {
    working(() => {
      const group = field.group!, id = boundId, snapshot = id === null ? undefined : rows!.get(id);
      let version = renderVersion;
      const current = () => !disposed && version === renderVersion && boundId === id &&
        (id === null || rows!.get(id) === snapshot) && !replacingGroup?.reset;
      const checkpoint = () => {
        if (!current()) throw formError("FORM_CHOICE_GROUP", "Newer Form work superseded this choice replacement.", { field: field.name });
      };
      const state = initial.find(state => state.field === field)!;
      const shown = group.read(), next = prepare();
      checkpoint();
      if (byName.get(field.name) !== field || group.root !== root && !root.contains(group.root) ||
          field.originals.some(({ element }) => annotations.get(element) !== annotation(element))) {
        throw formError("FORM_CHOICE_GROUP", "Reconcile changed Form fields before replacing choices.", { field: field.name });
      }
      const draft = id === null ? undefined : drafts.get(id);
      const raw = snapshot ? readPath(snapshot.value, field.path) : undefined, projection = field.projection;
      const applied = projection?.state === "applied" && projection.id === id && sameJson(projection.raw, raw);
      if (id !== null && !draft?.has(field) && applied && projection.callback) {
        const message = checkGroupValue({ kind: group.kind, values: next.values }, projection.value);
        if (message) throw values.error(Object.freeze({ ...context(field, id, snapshot!.value as Record<string, unknown>),
          rowId: id, element: field.element, phase: projection.phase }), projection.callback, message);
      }
      const selected = id !== null ? draft?.has(field) ? draft.get(field) :
        applied ? projection.value : projection?.state === "failed" || projection?.state === "pending" ? shown : raw :
        shown;
      const rootOriginal = field.originals.find(original => original.element === group.root)!;
      const originals = [rootOriginal, ...next.inputs.map(element => ({ element,
        describedBy: element.getAttribute("aria-describedby"), invalid: element.getAttribute("aria-invalid"),
        changed: element.getAttribute("data-field-changed") }))];
      const primary = next.inputs[0] ?? group.root;
      const nextElements = new Map(byElement), nextAnnotations = new Map(annotations);
      for (const element of field.elements) { nextElements.delete(element); nextAnnotations.delete(element); }
      for (const element of next.inputs) nextElements.set(element, field);
      for (const { element } of originals) nextAnnotations.set(element, annotation(element));
      const nextOwners = new Set<HTMLFormElement>();
      if (!rows || deletedPreview()) for (const item of fields) for (const { element } of item === field ? originals : item.originals) {
        let owner: HTMLFormElement | null;
        if (item === field && element instanceof HTMLInputElement) {
          const form = element.getAttribute("form"), target = form === null ? group.root.closest("form") :
            root.ownerDocument.getElementById(form);
          owner = target instanceof HTMLFormElement ? target : null;
        } else owner = nativeOwner(element);
        if (owner) nextOwners.add(owner);
      }
      const defaultEntry = defaultEntries.find(entry => entry.name === field.name);
      const previous = { element: field.element, elements: field.elements, originals: field.originals,
        byElement, annotations, initialElement: state.element, checked: state.checked,
        defaultElement: defaultEntry?.element, issues: issues.get(field), owners: new Set(resetOwners), native: field.nativeProjection };
      const attributes = field.originals.map(({ element }) => ({ element,
        describedBy: element.getAttribute("aria-describedby"), invalid: element.getAttribute("aria-invalid"),
        changed: element.getAttribute("data-field-changed") }));
      const writeAttributes = (original: Field["originals"][number]) => {
        if (original.describedBy === null) original.element.removeAttribute("aria-describedby");
        else original.element.setAttribute("aria-describedby", original.describedBy);
        if (original.invalid === null) original.element.removeAttribute("aria-invalid");
        else original.element.setAttribute("aria-invalid", original.invalid);
        if (rows) {
          if (original.changed === null) original.element.removeAttribute("data-field-changed");
          else original.element.setAttribute("data-field-changed", original.changed);
        }
      };
      const transaction = { events: [] as RowsEvent[], reset: false }, added: HTMLFormElement[] = [], removed: HTMLFormElement[] = [];
      let undo: (() => void) | undefined, committed = false, failed = false, failure: unknown;
      checkpoint();
      replacingGroup = transaction;
      scanning = true;
      version = ++renderVersion;
      try {
        for (const owner of nextOwners) if (!resetOwners.has(owner)) {
          added.push(owner); owner.addEventListener("reset", onReset); checkpoint();
        }
        for (const original of field.originals) if (original.element !== group.root) {
          writeAttributes(original); checkpoint();
        }
        undo = next.apply();
        checkpoint();
        field.element = primary; field.elements = [...next.inputs]; field.originals = originals;
        byElement = nextElements; annotations = nextAnnotations;
        state.element = primary;
        const captured = new Set(typeof state.value === "string" ? [state.value] : Array.isArray(state.value) ? state.value : []);
        state.checked = next.inputs.map(input => ({ input, checked: captured.has(input.value) }));
        if (defaultEntry) defaultEntry.element = primary;
        if (previous.issues) issues.set(field, previous.issues.map(issue => issue.element ? { ...issue, element: primary } : issue));
        group.write(selected, current);
        if (id !== null) rememberNative(field, id, draft?.has(field) ? draft.get(field) :
          projection?.state === "pending" || projection?.state === "failed" ? previous.native ? previous.native.raw : raw : raw, draft?.has(field) ?? false, current);
        syncPreview();
        const original = id === null ? undefined : rows!.original(id);
        const changed = original !== undefined && !sameJson(readPath(original, field.path), raw);
        for (const original of originals) {
          const tokens = new Set((original.describedBy ?? "").split(/\s+/).filter(Boolean)), error = errorIds.get(field);
          if (error) tokens.add(error);
          const describedBy = tokens.size ? [...tokens].join(" ") : original.describedBy;
          writeAttributes({ ...original, describedBy,
            invalid: previous.issues?.length ? "true" : original.invalid,
            changed: rows ? String(changed) : original.changed });
          checkpoint();
        }
        for (const owner of resetOwners) if (!nextOwners.has(owner)) {
          removed.push(owner); owner.removeEventListener("reset", onReset); checkpoint();
        }
        resetOwners.clear(); for (const owner of nextOwners) resetOwners.add(owner);
        committed = true;
      } catch (cause) {
        if (cause instanceof FrameworkError && cause.api === "bindChoiceGroup" && ["CHOICE_STALE", "CHOICE_DISPOSED"].includes(cause.code)) {
          try { checkpoint(); } catch (guard) { cause = guard; }
        }
        failed = true; failure = cause;
        if (!disposed) {
          field.element = previous.element; field.elements = previous.elements; field.originals = previous.originals;
          byElement = previous.byElement; annotations = previous.annotations;
          state.element = previous.initialElement; state.checked = previous.checked;
          setNativeProjection(field, previous.native);
          if (defaultEntry) defaultEntry.element = previous.defaultElement!;
          if (previous.issues) issues.set(field, previous.issues); else issues.delete(field);
          resetOwners.clear(); for (const owner of previous.owners) resetOwners.add(owner);
          try { undo?.(); syncPreview(); } catch { /* Preserve the original publication failure. */ }
          for (const original of attributes) try { writeAttributes(original); } catch { /* Preserve the original failure. */ }
          for (const owner of removed) try { owner.addEventListener("reset", onReset); } catch { /* Preserve the original failure. */ }
        }
      } finally {
        if (!committed) for (const owner of added) try { owner.removeEventListener("reset", onReset); } catch { /* Preserve the original failure. */ }
        scanning = false;
        replacingGroup = undefined;
        for (const event of transaction.events) try { onRows(event); } catch (cause) {
          if (!failed) { failed = true; failure = cause; }
        }
      }
      if (failed) throw failure;
    });
  }

  function replaceSelectChoices(field: Field, prepare: () => SelectReplacement): void {
    active();
    if (!initialized || workDepth || restoring || reconciling || localRendering || rescanIncomplete || pendingResets.size) {
      throw formError("FORM_OPTIONS", "Finish current Form work before replacing its choices.", { field: field.name });
    }
    working(() => {
      const element = field.element as HTMLSelectElement, choices = field.choices!, binding = choices.select!;
      const id = boundId, snapshot = id === null ? undefined : rows!.get(id);
      let version = renderVersion;
      const current = () => !disposed && version === renderVersion && boundId === id &&
        (id === null || rows!.get(id) === snapshot) && !replacingGroup?.reset;
      const checkpoint = () => {
        if (!current()) throw formError("FORM_OPTIONS", "Newer Form work superseded this choice replacement.", { field: field.name });
      };
      const selectedOptions = [...element.selectedOptions].map(option => choices.raw.get(option));
      const shown = element.multiple ? selectedOptions : selectedOptions[0] ?? null;
      const next = prepare();
      checkpoint();
      if (byName.get(field.name) !== field || !root.contains(element) && root !== element ||
          field.originals.some(({ element }) => annotations.get(element) !== annotation(element))) {
        throw formError("FORM_OPTIONS", "Reconcile changed Form fields before replacing choices.", { field: field.name });
      }
      const suffix = choiceOptions(field, snapshot?.value ?? null, id);
      const available = [...next.values, ...suffix.map(choice => choice.raw)];
      const draft = id === null ? undefined : drafts.get(id), raw = snapshot ? readPath(snapshot.value, field.path) : undefined;
      const projection = field.projection, applied = projection?.state === "applied" && projection.id === id && sameJson(projection.raw, raw);
      if (id !== null && !draft?.has(field) && applied && projection.callback && !rowOptionAvailable(available, projection.value, element.multiple)) {
        throw values.error(Object.freeze({ ...context(field, id, snapshot!.value as Record<string, unknown>),
          rowId: id, element, phase: projection.phase }), projection.callback, "Choose an available option.");
      }
      const selected = id !== null ? draft?.has(field) ? draft.get(field) : applied ? projection.value :
        projection?.state === "failed" || projection?.state === "pending" ? shown : raw : shown;
      const previous = { catalog: choices.catalog, nodes: choices.authoredNodes, options: choices.authoredOptions, authored: choices.authored,
        selection: choices.selection, raw: choices.raw, source: choices.source, bound: choices.bound, native: field.nativeProjection };
      const transaction = { events: [] as RowsEvent[], reset: false };
      let undo: (() => void) | undefined, failed = false, failure: unknown;
      checkpoint();
      replacingGroup = transaction; scanning = true; version = ++renderVersion;
      try {
        undo = next.apply(); checkpoint();
        choices.authoredNodes = [...next.nodes]; choices.authoredOptions = [...next.options]; choices.authored = [...next.values];
        choices.selection = next.options.map(option => option.selected);
        choices.raw = renderRowOptions(element, choices.authoredNodes, choices.authoredOptions, choices.authored, suffix);
        checkpoint();
        binding.raw = choices.raw;
        choices.source = choices.options ? readPath(snapshot?.value, choices.options) : undefined;
        choices.bound = id !== null;
        selectRowOptions(element, choices.raw, selected, current); checkpoint();
        if (id !== null) rememberNative(field, id, draft?.has(field) ? draft.get(field) :
          projection?.state === "pending" || projection?.state === "failed" ? previous.native ? previous.native.raw : raw : raw,
          draft?.has(field) ?? false, current);
        syncPreview(); checkpoint();
        choices.catalog = next.finish();
      } catch (cause) {
        failed = true; failure = cause;
        if (current()) {
          try { undo?.(); } catch { /* Preserve the original publication failure. */ }
          if (current()) {
            choices.catalog = previous.catalog;
            choices.authoredNodes = previous.nodes; choices.authoredOptions = previous.options; choices.authored = previous.authored;
            choices.selection = previous.selection; choices.raw = previous.raw; choices.source = previous.source; choices.bound = previous.bound;
            binding.raw = previous.raw; setNativeProjection(field, previous.native);
            try { syncPreview(); } catch { /* Preserve the original publication failure. */ }
          }
        }
      } finally {
        scanning = false; replacingGroup = undefined;
        for (const event of transaction.events) try { onRows(event); } catch (cause) {
          if (!failed) { failed = true; failure = cause; }
        }
      }
      if (failed) throw failure;
    });
  }

  function choiceOptions(field: Field, values: unknown, id: RowId | null): readonly RowOption[] {
    const choices = field.choices!;
    if (!choices.options) return [];
    return rowOptions(values, choices.options, choices.label!, choices.value!, options => {
      throw formError("FORM_OPTIONS", "A row-local Select needs an array of options.", { field: field.name, rowId: id, options });
    });
  }

  function prepareChoices(values: Record<string, unknown> | null, id: RowId | null, selected?: ReadonlySet<Field>) {
    return new Map((selected ? choiceFields.filter(field => selected.has(field)) : choiceFields).map(field => [field, {
      source: field.choices!.options ? readPath(values, field.choices!.options) : undefined, options: choiceOptions(field, values, id)
    }] as const));
  }

  function enteredValue(field: Field): unknown {
    if (!field.choices) return fieldValue(field);
    const element = field.element as HTMLSelectElement;
    const selected = [...element.selectedOptions];
    if (selected.some(option => !field.choices!.raw.has(option) || option.matches(":disabled"))) return undefined;
    const values = selected.map(option => field.choices!.raw.get(option));
    return element.multiple ? values : values[0] ?? null;
  }

  function renderLocal(preserve?: Field, blurred?: Field, selected?: ReadonlySet<Field>): number {
    return working(() => {
      if (localRendering) throw formError("FORM_RENDER", "A local Form cannot recursively refresh its display.");
      const version = ++renderVersion;
      localRendering = true;
      try {
        const values = localValues();
        for (const [field, retained] of localRenderedValues) {
          if (selected && !selected.has(field)) continue;
          const raw = readPath(values, field.path);
          const current = () => {
            if (disposed || version !== renderVersion) return false;
            for (const events of pendingResets.values()) {
              if (events.some(event => event.eventPhase === Event.NONE && !event.defaultPrevented)) return false;
            }
            if (Object.is(raw, localFieldValue(field))) return true;
            renderVersion++;
            return false;
          };
          if (!current()) return version;
          const element = field.element;
          const focused = field !== blurred && control(element) && textLengthControl(element) &&
            !element.readOnly && element === root.ownerDocument.activeElement;
          if (field === preserve || control(element) && (focused || retained.invalid)) continue;
          writeValue(field, raw, values, null, false, current);
          if (disposed || version !== renderVersion) return version;
          const shown = fieldValue(field);
          if (disposed || version !== renderVersion) return version;
          retained.shown = shown;
        }
        return version;
      } finally { localRendering = false; }
    });
  }

  function restoreRendered(rollback = false): void {
    for (const original of renderedOriginals) {
      original.element.replaceChildren(...original.children);
      if (original.src !== undefined) {
        if (!rollback) display(original.element, localFieldValue(original.field));
        else if (original.src === null) original.element.removeAttribute("src");
        else original.element.setAttribute("src", original.src);
      }
    }
  }

  function flushLocalResets(preserve?: Field, repaint = true): number {
    return working(() => {
      const completed = new Set<HTMLFormElement>();
      for (const [owner, events] of pendingResets) {
        const dispatching = events.filter(event => event.eventPhase !== Event.NONE);
        if (dispatching.length !== events.length) nativeRevision++;
        if (events.some(event => event.eventPhase === Event.NONE && !event.defaultPrevented)) completed.add(owner);
        if (dispatching.length) pendingResets.set(owner, dispatching);
        else pendingResets.delete(owner);
      }
      if (!pendingResets.size && resetTimer !== undefined) {
        clearTimeout(resetTimer);
        resetTimer = undefined;
      }
      if (!completed.size) return renderVersion;
      if (rows) {
        if (!deletedPreview()) return renderVersion;
        const id = boundId, version = renderVersion;
        for (const field of fields) {
          if (disposed || boundId !== id || version !== renderVersion || !deletedPreview()) return renderVersion;
          if (!nativeField(field) || !field.originals.some(({ element }) => {
            const owner = nativeOwner(element); return owner !== null && completed.has(owner);
          })) continue;
          const retained = field.nativeProjection;
          if (!retained || retained.id !== id) throw formError("FORM_BIND", "Refresh the deleted preview before resetting this field.", { field: field.name });
          restoreNative(field, retained.shown);
        }
        return renderVersion;
      }
      for (const field of fields) {
        if (!field.originals.some(({ element }) => {
          const owner = nativeOwner(element);
          return owner !== null && completed.has(owner);
        })) continue;
        const retained = localRenderedValues.get(field);
        if (retained) {
          if (control(field.element)) retained.raw = retained.shown = fieldValue(field);
          retained.invalid = false;
        }
        issues.delete(field);
      }
      if (repaint) {
        const rendered = renderLocal(preserve);
        showIssues(() => !disposed && rendered === renderVersion);
        return rendered;
      }
      return renderVersion;
    });
  }

  function onReset(event: Event): void {
    if (disposed || !automatic || !event.isTrusted || event.target !== event.currentTarget) return;
    if (replacingGroup) {
      event.preventDefault();
      replacingGroup.reset = true;
      return;
    }
    const owner = event.currentTarget as HTMLFormElement;
    const pending = pendingResets.get(owner) ?? [];
    pending.push(event);
    pendingResets.set(owner, pending);
    nativeRevision++;
    resetTimer ??= setTimeout(() => {
      resetTimer = undefined;
      if (!disposed) flushLocalResets();
    }, 0);
  }

  function context(field: Field, id: RowId | null, values: Record<string, unknown>): RuleContext {
    return {
      field: field.name, values, rowId: id,
      ...(id === null || id === boundId ? { element: field.element } : {})
    };
  }

  function issue(field: Field, id: RowId | null, rule: string, message: string): ValidationIssue {
    return {
      field: field.name, rowId: id, rule, message,
      ...(id === null || id === boundId ? { element: field.element } : {})
    };
  }

  function validationDisabled(element: HTMLElement, id: RowId | null): boolean {
    if (id === null || id === boundId || !control(element) || !previewDisabled.has(element)) return disabled(element, root);
    if (previewDisabled.get(element)) return true;
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      if (!(parent instanceof HTMLFieldSetElement) || !parent.disabled) continue;
      const legend = [...parent.children].find(child => child.localName === "legend");
      if (!legend?.contains(element)) return true;
    }
    return false;
  }

  function groupDisabled(group: ChoiceGroupBinding): boolean {
    if (group.templateDisabled) return true;
    for (let parent: HTMLElement | null = group.root; parent; parent = parent.parentElement) {
      if (!(parent instanceof HTMLFieldSetElement) || !parent.disabled) continue;
      const legend = [...parent.children].find(child => child.localName === "legend");
      if (parent === group.root || !legend?.contains(group.root)) return true;
    }
    return false;
  }

  function candidates(id: RowId | null, source: Record<string, unknown>,
    entered: ReadonlyMap<Field, unknown>): { values: Record<string, unknown>; parsed: Map<Field, Candidate> } {
    let values = source;
    for (const [field, value] of entered) values = writePath(values, field.path, value);
    const enteredValues = values;
    const parsed = new Map<Field, Candidate>();
    for (const [field, input] of entered) {
      let value = input;
      let parseError: string | undefined;
      let parseFailed = false;
      const parser = parsers.get(field.name);
      if (parser) {
        try { value = parser(String(input ?? ""), context(field, id, enteredValues)); }
        catch (cause) {
          parseFailed = true;
          parseError = cause instanceof Error && cause.message
            ? cause.message : "Input could not be parsed.";
        }
        if (!parseFailed && value === undefined) {
          parseFailed = true;
          parseError = "Input could not be parsed.";
        }
      }
      parsed.set(field, { value, entered: input, parseError, parseFailed });
      values = writePath(values, field.path, value);
    }
    return { values, parsed };
  }

  function check(field: Field, id: RowId | null, candidate: Candidate,
    values: Record<string, unknown>, validate: boolean, preparing = false, checkpoint?: (cause?: unknown) => void): readonly ValidationIssue[] {
    if (candidate.parseFailed) return [issue(field, id, "parse", candidate.parseError ?? "Input could not be parsed.")];
    const found: ValidationIssue[] = [];
    if (field.checkboxValues && !field.checkboxValues.some(code => code === candidate.value)) {
      found.push(issue(field, id, "choice-option", "Choose an available checkbox value."));
    }
    if (field.group) {
      const group = field.group;
      const catalog = !preparing && field.groupDefinition?.source ? choiceGroupChoices(field.groupDefinition, group.catalog, values, key => {
        throw formError("FORM_OPTIONS", "A generated group needs string row choices.", { field: field.name, options: key, rowId: id });
      }) : undefined;
      const message = checkGroupValue(catalog ? { kind: group.kind, values: catalog.map(choice => choice.value) } : group, candidate.value);
      if (message) found.push(issue(field, id, "choice-option", message));
      if (validate && !groupDisabled(group)) {
        const required = group.inputs.filter(input => input.required && !validationDisabled(input, id));
        const selected = candidate.entered === undefined ? candidate.value : candidate.entered;
        const missing = catalog && id !== null && id !== boundId ? choiceGroupRequired(field.groupDefinition!, catalog, selected) : !group.inputs.length ? group.required : group.kind === "radio"
          ? required.length > 0 && !group.inputs.some(input => typeof selected === "string" && input.value === selected)
          : required.some(input => !Array.isArray(selected) || !selected.includes(input.value));
        if (missing) found.push(issue(field, id, "html", "Select the required options."));
        const custom = (id === null || id === boundId) && group.inputs.find(input =>
          !validationDisabled(input, id) && input.validity.customError);
        if (custom) found.push(issue(field, id, "html", custom.validationMessage));
      }
    } else if (field.choices) {
      const element = field.element as HTMLSelectElement;
      const available = preparing ? [...field.choices.raw.values()] :
        [...field.choices.authored, ...choiceOptions(field, values, id).map(option => option.raw)];
      if (!rowOptionAvailable(available, candidate.value, element.multiple)) {
        found.push(issue(field, id, "select-option", "Choose an available option."));
      }
      if (validate && !validationDisabled(element, id) && (element.willValidate || id !== boundId && previewDisabled.has(element))) {
        const missing = element.required && (element.multiple ? !Array.isArray(candidate.value) || !candidate.value.length
          : candidate.value === null || candidate.value === "" || candidate.value === undefined);
        const message = (id === null || id === boundId) && element.validity.customError
          ? element.validationMessage : missing ? "Choose an option." : null;
        if (message) found.push(issue(field, id, "html", message));
      }
    } else if (field.kind === "radio" || arrayField(field) && field.kind === "checkbox") {
      const required = field.elements.some(element => (element as HTMLInputElement).required) &&
        field.elements.some(element => !validationDisabled(element, id));
      const entered = candidate.entered === undefined ? candidate.value : candidate.entered;
      const selected = field.kind === "radio" ?
        entered != null && field.elements.some(element => (element as HTMLInputElement).value === String(entered)) :
        Array.isArray(entered) && field.elements.some(element =>
          entered.some(value => String(value) === (element as HTMLInputElement).value));
      if (validate && required && !selected) found.push(issue(field, id, "html", "Select an option."));
    } else if (control(field.element)) {
      const visible = id === null || id === boundId;
      const probe = !field.checkboxValues && !preparing && visible && !valueCallbacks && !(id === null && field.format.length)
        ? field.element : field.element.cloneNode(true) as Control;
      const entered = candidate.entered ?? candidate.value;
      if (probe !== field.element) {
        probe.disabled = validationDisabled(field.element, id);
        if (preparing && probe instanceof HTMLInputElement && probe.type === "file") {
          probe.files = (field.element as HTMLInputElement).files;
        } else display(probe, entered, field.checkboxValues);
        if (visible && field.element.validity.customError) probe.setCustomValidity(field.element.validationMessage);
      }
      const message = nativeMessage(probe, entered, validate);
      if (message) found.push(issue(field, id, "html", message));
    }
    checkpoint?.();
    if (validate) found.push(...runner.validate(field.validate, candidate.value, context(field, id, values), checkpoint));
    return found;
  }

  function evaluate(id: RowId | null, source: Record<string, unknown>, entered: ReadonlyMap<Field, unknown>, validate = true) {
    return working(() => {
      const { values, parsed } = candidates(id, source, entered);
      const byField = new Map<Field, readonly ValidationIssue[]>();
      for (const field of fields) {
        const candidate = parsed.get(field) ?? { value: readPath(values, field.path) };
        byField.set(field, check(field, id, candidate, values, validate));
      }
      return { byField, parsed };
    });
  }

  function showIssues(current?: () => boolean): void {
    return working(() => {
      if (disposed) return;
      const version = renderVersion;
      const applies = current ?? (() => !disposed && version === renderVersion);
      const messages = new Map<HTMLElement, string[]>();
      for (const field of fields) {
        const fieldIssues = issues.get(field) ?? [];
        for (const original of field.originals) {
          if (!applies()) return;
          if (fieldIssues.length) original.element.setAttribute("aria-invalid", "true");
          else if (original.invalid === null) original.element.removeAttribute("aria-invalid");
          else original.element.setAttribute("aria-invalid", original.invalid);
        }
        if (field.error && fieldIssues.length) {
          const list = messages.get(field.error) ?? [];
          list.push(...fieldIssues.map(item => item.message));
          messages.set(field.error, list);
        }
      }
      for (const region of regionState.keys()) {
        if (!applies()) return;
        region.textContent = (messages.get(region) ?? []).join(" ");
      }
    });
  }

  function writeValue(field: Field, value: unknown, source: Record<string, unknown> | null,
    id: RowId | null, focused: boolean, current: () => boolean): void {
    if (!current()) return;
    const renderer = renderers.get(field.name);
    if (renderer) {
      const previous = field.renderingId;
      if (id !== null && activeBindings.has(id) && previous === id) {
        throw formError("UI_RENDER", "A field renderer cannot recursively update its own target.", { field: field.name });
      }
      field.renderingId = id ?? undefined;
      try {
        renderField("bindForm", field.element, value, context(field, id, source ?? {}), renderer, false,
          !rows || id !== null && (activeValues.get(field)?.has(id) || activeBindings.has(id)) ? current : undefined);
      } finally { field.renderingId = previous; }
    } else if (field.choices) selectRowOptions(field.element as HTMLSelectElement, field.choices.raw, value);
    else {
      const shown = source && !focused && field.format.length
        ? runner.format(field.format, value, context(field, id, source)) : value;
      if (!current()) return;
      displayField(field, shown, current);
    }
    if (id !== null && current()) rememberNative(field, id, readPath(source, field.path), false, current);
  }

  function projectValue(field: Field, raw: unknown, source: Record<string, unknown>, id: RowId,
    phase: ValuePhase, force: boolean, focused: boolean, current: () => boolean, preserveFocused = false): void {
    const active = activeValues.get(field);
    if (active?.has(id)) {
      throw values.error(Object.freeze({ ...context(field, id, source), rowId: id, element: field.element, phase }),
        beforeBindValue ? "beforeBindValue" : "onBindValue", "A value callback cannot recursively bind the same field and row.");
    }
    const previous = field.projection;
    const changed = !previous || previous.id !== id || !sameJson(previous.raw, raw);
    if (force || changed) field.projection = { id, raw, value: raw, phase, state: "pending" };
    const projection = field.projection!;
    if (projection.state === "failed") return;
    const editable = field.kind === "single" && control(field.element) && textLengthControl(field.element) && !field.element.readOnly;
    if (focused && editable) {
      if (force && !preserveFocused) writeValue(field, raw, source, id, true, current);
      return;
    }
    const valueContext: ValueBindContext = Object.freeze({ ...context(field, id, source),
      rowId: id, element: field.element, phase: projection.phase });
    const available = field.choices ? () => [
      ...field.choices!.authored, ...choiceOptions(field, valueContext.values, id).map(option => option.raw)
    ] : undefined;
    const write = (value: unknown) => writeValue(field, value, source, id, false, current);
    if (projection.state === "applied") { values.apply(field, field, raw, valueContext, write, current, available); return; }
    const running = active ?? new Set<RowId>();
    activeValues.set(field, running);
    running.add(id);
    try { values.apply(field, field, raw, valueContext, write, current, available); }
    finally {
      running.delete(id);
      if (!running.size) activeValues.delete(field);
    }
  }

  function render(phase: ValuePhase = "val", skipFocused = false, force = false,
    prepared?: ReadonlyMap<Field, { source: unknown; options: readonly RowOption[] }>, selected?: ReadonlySet<Field>,
    selectedKeys?: ReadonlySet<string>): number {
    return working(() => {
      const entry = renderVersion, admitted = refreshGroups(boundId === null ? null : rowValue(boundId), boundId, selected);
      if (admitted === undefined) return entry;
      syncPreview();
      const version = ++renderVersion, id = boundId;
      const snapshot = id === null ? undefined : rows!.get(id);
      const source = id === null ? null : rowValue(id);
      const original = id === null ? undefined : rows!.original(id);
      const currentDrafts = id === null ? undefined : drafts.get(id);
      const choices = prepared ?? (choiceFields.length ? prepareChoices(source, id, selected) : undefined);
      const current = () => !disposed && version === renderVersion && boundId === id &&
        (id === null || rows!.get(id) === snapshot);
      if (id === null && valueCallbacks) for (const field of selected ?? fields) field.projection = undefined;
      function writeFields(targets: Iterable<Field>): void {
        for (const field of targets) {
          if (!current()) return;
          if (field.choices) {
            const next = choices!.get(field)!;
            if (!field.choices.bound || !Object.is(field.choices.source, next.source)) {
              field.choices.raw = renderRowOptions(field.element as HTMLSelectElement, field.choices.authoredNodes,
                field.choices.authoredOptions, field.choices.authored, next.options);
              if (field.choices.select) field.choices.select.raw = field.choices.raw;
              field.choices.source = next.source;
              field.choices.bound = true;
            }
          }
          const changed = original !== undefined && !sameJson(readPath(original, field.path), readPath(source, field.path));
          for (const { element } of field.originals) element.setAttribute("data-field-changed", String(changed));
          const focused = field.elements.includes(root.ownerDocument.activeElement as HTMLElement);
          if (selected && focused && field.kind === "single" && control(field.element) &&
              textLengthControl(field.element) && !field.element.readOnly) {
            if (valueCallbacks && id !== null) projectValue(field, readPath(source, field.path), source!, id,
              phase, force, true, current, true);
            continue;
          }
          if (currentDrafts?.has(field)) {
            if (valueCallbacks && id !== null) {
              const raw = readPath(source, field.path), previous = field.projection;
              if (force || !previous || previous.id !== id || !sameJson(previous.raw, raw)) {
                field.projection = { id, raw, value: raw, phase, state: "pending" };
              }
            }
            if (field.choices) selectRowOptions(field.element as HTMLSelectElement, field.choices.raw, currentDrafts.get(field));
            else displayField(field, currentDrafts.get(field), current);
            if (id !== null && current()) rememberNative(field, id, currentDrafts.get(field), true, current);
            continue;
          }
          const raw = source ? readPath(source, field.path) : field.group?.kind === "checkbox" ? [] : field.choices || field.kind === "radio" ? null : "";
          if (valueCallbacks && id !== null) projectValue(field, raw, source!, id, phase, force, focused, current);
          else if (!(skipFocused && focused && field.kind === "single" && formatCapable(field.element))) {
            writeValue(field, raw, source, id, focused, current);
          }
        }
      }
      if (!values.sourceEnabled || !snapshot || !source || values.running &&
          [...activeValues].some(([field, ids]) => ids.has(snapshot.id) && (!selected || selected.has(field)))) {
        writeFields(selected ?? fields);
        return version;
      }
      const previous = acceptedSource && acceptedSource.id === id ? acceptedSource.value as Record<string, unknown> : undefined;
      const keys = Object.keys(source).filter(key => selectedKeys ? selectedKeys.has(key) :
        phase === "bind" || !previous || !Object.hasOwn(previous, key) || !sameJson(previous[key], source[key]));
      const keySet = new Set(keys), remaining = new Set(selected ?? fields);
      for (const key of keys) {
        if (!current()) return version;
        const assigned = (sourceFields!.get(key) ?? []).filter(field => remaining.has(field) &&
          (field.path[0] === key || !keySet.has(field.path[0])));
        for (const field of assigned) remaining.delete(field);
        const binding: SourceBindContext<T> = Object.freeze({ root, row: snapshot, key, phase,
          elements: Object.freeze([...new Set(assigned.flatMap(field => field.elements))]) });
        values.source(binding, () => writeFields(assigned), current);
        if (!current()) return version;
      }
      writeFields(remaining);
      return version;
    });
  }

  function bindRow(id: RowId | null, event: RowsEvent | null, force: boolean): void {
    return working(() => {
      if (bindCallbacks && id !== null && activeBindings.has(id)) {
        throw formError("FORM_BIND", "A whole-row callback cannot recursively bind an active row.", { rowId: id });
      }
      const source = id === null ? null : rowValue(id);
      const snapshot = id === null ? undefined : rows!.get(id)!;
      const prepared = choiceFields.length ? prepareChoices(source, id) : undefined;
      const version = ++renderVersion;
      const current = (generation: number) => !disposed && generation === renderVersion &&
        (id === null || rows!.get(id) === snapshot);
      const binding: FormBindContext<T> | undefined = snapshot ? Object.freeze({ root, row: snapshot, event }) : undefined;
      function invoke(callback: "beforeBind" | "onBind"): void {
        const run = callback === "beforeBind" ? beforeBind : onBind;
        if (!run || !binding) return;
        try {
          const result = run(binding);
          if (result !== null && (typeof result === "object" || typeof result === "function") &&
              typeof (result as { then?: unknown }).then === "function") {
            void Promise.resolve(result).catch(() => {});
            throw new TypeError("Whole-row callbacks must finish synchronously.");
          }
        } catch (cause) {
          throw new FrameworkError({ api: "bindForm", code: "FORM_BIND", message: "The whole-row callback failed.",
            detail: { rowId: id, callback }, cause });
        }
      }
      if (bindCallbacks && id !== null) activeBindings.add(id);
      try {
        invoke("beforeBind");
        if (!current(version)) return;
        automatic = true;
        boundId = id;
        if (acceptedSource?.id !== id) acceptedSource = undefined;
        for (const field of fields) setNativeProjection(field);
        clearPendingResets();
        syncPreview();
        issues.clear();
        const rendered = render("bind", false, force, prepared);
        if (!current(rendered) || boundId !== id) return;
        const currentDrafts = id === null ? undefined : drafts.get(id);
        if (id !== null && snapshot?.status !== "delete" && currentDrafts?.size) {
          const checked = evaluate(id, rowValue(id), currentDrafts, autoValidate);
          if (!current(rendered) || boundId !== id) return;
          for (const field of currentDrafts.keys()) issues.set(field, checked.byField.get(field) ?? []);
        }
        showIssues(() => current(rendered) && boundId === id);
        if (!current(rendered) || boundId !== id) return;
        invoke("onBind");
        acceptSource(rendered, snapshot);
      } finally {
        if (bindCallbacks && id !== null) activeBindings.delete(id);
      }
    });
  }

  function prepare(): ValidationResult & { readonly values: Record<string, unknown> | null } {
    active();
    const failure = (phase: string, message: string, field?: string, cause?: unknown) =>
      new FrameworkError({ api: "bindForm", code: "FORM_PREPARE", message, detail: { phase, ...(field ? { field } : {}) }, cause });
    if (preparing) throw failure("reentry", "A Form cannot recursively prepare its entered values.");
    if (workDepth || restoring || reconciling || localRendering || replacingGroup || rescanIncomplete) {
      throw failure("busy", "Finish current Form work before preparing its entered values.");
    }
    if (deletedPreview()) throw failure("preview", "Select a live row or release the deleted preview before preparing new data.");
    preparing = true;
    try {
      return working(() => {
        const nativeFields = fields.filter(nativeField);
        assertNativePaths(nativeFields, field => { throw failure("fields", "Native preparation needs distinct nonoverlapping paths.", field); });
        const graph = fields, id = boundId, version = renderVersion, revision = nativeRevision;
        const entries = rows?.entries({ includeDeleted: true });
        const snapshots = new Map<Field, NativeState>();
        const retained = new Map(nativeFields.map(field => [field, localRenderedValues.get(field) && { ...localRenderedValues.get(field)! }] as const));
        const resets = [...pendingResets].map(([owner, events]) => ({ owner, events: [...events], canceled: events.map(event => event.defaultPrevented) }));
        const current = () => {
          active();
          if (fields !== graph || boundId !== id || renderVersion !== version || nativeRevision !== revision ||
              rows && rows.entries({ includeDeleted: true }) !== entries) {
            throw failure("stale", "Newer Form work superseded this preparation.");
          }
        };
        const observed = (cause?: unknown) => {
          current();
          if (pendingResets.size !== resets.length || resets.some(saved => {
            const events = pendingResets.get(saved.owner);
            return !events || events.length !== saved.events.length || events.some((event, index) =>
              event !== saved.events[index] || event.defaultPrevented !== saved.canceled[index]);
          })) throw failure("stale", "Native reset state changed during preparation.");
          for (const [field, before] of snapshots) {
            const after = nativeState(field);
            current();
            if (!sameNative(before, after)) throw failure("stale", "Native input changed during preparation.", field.name);
          }
          if (cause instanceof FrameworkError && cause.api === "bindForm" &&
              ["FORM_DISPOSED", "FORM_RESCAN", "FORM_PREPARE"].includes(cause.code)) throw cause;
        };
        for (const field of nativeFields) {
          const state = nativeState(field);
          current();
          snapshots.set(field, state);
        }
        observed();
        let source: Record<string, unknown> = {};
        const entered = new Map<Field, unknown>(), invalid = new Set<Field>();
        for (const field of nativeFields) {
          const state = snapshots.get(field)!, previous = field.nativeProjection;
          const reuse = !!rows && id !== null && previous?.id === id && sameNative(previous.shown, state) && (previous.raw !== undefined || field.checkboxValues !== undefined);
          const completedReset = resets.some(({ owner, events }) => events.some(event => event.eventPhase === Event.NONE && !event.defaultPrevented) &&
            field.originals.some(({ element }) => nativeOwner(element) === owner));
          const local = retained.get(field);
          const input = reuse ? previous!.raw : !rows && !completedReset && local && sameJson(state.value, local.shown) ? local.raw : state.value;
          if (state.selected?.some(selected => !selected.owned || selected.disabled && !reuse)) invalid.add(field);
          let cloned: unknown;
          try { cloned = structuredClone(input); }
          catch (cause) { observed(cause); throw failure("clone", "Prepared native values must be cloneable.", field.name, cause); }
          current();
          source = writePath(source, field.path, cloned);
          if (!reuse || previous!.entered) entered.set(field, cloned);
        }
        const preparse = source;
        let parsed = source;
        const candidates = new Map<Field, Candidate>();
        for (const field of nativeFields) {
          let value = readPath(source, field.path), parseFailed = false, parseError: string | undefined;
          const input = entered.get(field), parser = parsers.get(field.name);
          if (entered.has(field) && parser) {
            try { value = parser(String(input ?? ""), context(field, null, preparse)); }
            catch (cause) {
              if (cause instanceof FrameworkError && cause.api === "bindForm" &&
                  ["FORM_DISPOSED", "FORM_RESCAN", "FORM_PREPARE"].includes(cause.code)) throw cause;
              parseFailed = true;
              parseError = cause instanceof Error && cause.message ? cause.message : "Input could not be parsed.";
            }
            let asynchronous = false;
            if (!parseFailed && value !== null && (typeof value === "object" || typeof value === "function")) {
              try { asynchronous = typeof (value as { then?: unknown }).then === "function"; }
              catch (cause) { observed(cause); throw failure("parse", "A preparation parser returned an invalid result.", field.name, cause); }
              if (asynchronous) void Promise.resolve(value).catch(() => {});
            }
            observed();
            if (asynchronous) throw failure("parse", "Preparation parsers must finish synchronously.", field.name);
            if (!parseFailed && value === undefined) { parseFailed = true; parseError = "Input could not be parsed."; }
          }
          candidates.set(field, { value, ...(entered.has(field) ? { entered: input } : {}), parseFailed, parseError });
          parsed = writePath(parsed, field.path, value);
        }
        const found: ValidationIssue[] = [];
        for (const field of nativeFields) {
          const candidate = candidates.get(field)!;
          let checked: readonly ValidationIssue[];
          try { checked = check(field, null, candidate, parsed, true, true, observed); }
          catch (cause) { observed(cause); throw cause; }
          const rule = field.group ? "choice-option" : "select-option";
          if (invalid.has(field) && !checked.some(issue => issue.rule === rule)) found.push(issue(field, null, rule, "Choose an available enabled option."));
          if (snapshots.get(field)!.badInput && field.element instanceof HTMLInputElement && field.element.willValidate) {
            found.push(issue(field, null, "html", field.element.validationMessage || "Use a value allowed by this input."));
            found.push(...checked.filter(issue => issue.rule !== "html"));
          } else found.push(...checked);
          observed();
        }
        if (found.length) return { valid: false, values: null, issues: found };
        let result: Record<string, unknown>;
        try { result = structuredClone(parsed); }
        catch (cause) { observed(cause); throw failure("clone", "Prepared values must be cloneable.", undefined, cause); }
        observed();
        return { valid: true, values: result, issues: [] };
      });
    } finally { preparing = false; }
  }

  function bind(id: RowId | null): void {
    active();
    if (rows) { bindRow(id, null, true); return; }
    if (id !== null) throw formError("ROW_MISSING", "This Form has no row store.", { id });
    const flushed = flushLocalResets();
    active();
    if (flushed !== renderVersion) return;
    if (localRendering) throw formError("FORM_RENDER", "A local Form cannot recursively refresh its display.");
    automatic = true;
    const rendered = renderLocal();
    if (disposed || rendered !== renderVersion) return;
    issues.clear();
    showIssues(() => !disposed && rendered === renderVersion);
  }

  function rescan(): void {
    active();
    if (workDepth || restoring || reconciling || pendingResets.size) {
      throw formError("FORM_RESCAN", "Finish current Form work before reconciling its fields.");
    }
    let version = renderVersion, committing = false, published = false;
    const retrying = rescanIncomplete, enteredId = boundId;
    const enteredRows = rows?.entries({ includeDeleted: true });
    const current = () => !disposed && version === renderVersion &&
      (committing || enteredId === boundId && (!rows || enteredRows === rows.entries({ includeDeleted: true })));
    const checkpoint = (cause?: unknown) => {
      if (!current()) throw new FrameworkError({ api: "bindForm", code: "FORM_RESCAN",
        message: "Newer Form work superseded this rule adoption.", cause });
    };
    const adopted: ReturnType<typeof capture>[] = [];
    let rescanFailed = false;
    scanning = true;
    try {
      for (const [element, declaration] of annotations) {
        const binding: unknown[] = JSON.parse(declaration);
        binding.splice(2, 2);
        if ((element.hasAttribute("data-field") || byElement.get(element)?.group) && annotation(element, true) !== JSON.stringify(binding)) {
          throw formError("FORM_RESCAN", "Release this field before changing its binding declarations.",
            { field: byElement.get(element)?.name });
        }
      }
      const declarationView = runner.candidate(checkpoint);
      const candidate = compileFields(declarationView, byName, checkpoint);
      if (!current()) return;
      fieldRenderers("bindForm", candidate.fields.map(field => ({
        name: field.name, element: field.element, formatted: field.format.length > 0
      })), Object.fromEntries([...renderers].filter(([name]) => candidate.byName.has(name))));
      const originals = new Map(fields.flatMap(field => field.originals.map(original => [original.element, original] as const)));
      const nextErrors = new Map<Field, HTMLElement | undefined>();
      const nextRules = new Map<Field, Field>();
      const nextFields = candidate.fields.map(field => {
        const previous = byName.get(field.name);
        const retained = previous && previous.group === field.group && previous.kind === field.kind && previous.elements.length === field.elements.length &&
          previous.elements.every((element, index) => element === field.elements[index]) ? previous : field;
        if (retained === field) field.originals = field.originals.map(original => originals.get(original.element) ?? original);
        nextErrors.set(retained, field.error);
        nextRules.set(retained, field);
        return retained;
      });
      const nextSet = new Set(nextFields);
      const retired = fields.filter(field => !nextSet.has(field));
      for (const field of retired) {
        for (const [rowId, pending] of drafts) if (pending.has(field)) {
          throw formError("FORM_RESCAN", "Resolve or discard the retained input before releasing this field.", { field: field.name, rowId });
        }
        if (!rows && (issues.get(field)?.length || localRenderedValues.get(field)?.invalid)) {
          throw formError("FORM_RESCAN", "Resolve or discard invalid local input before releasing this field.", { field: field.name });
        }
      }
      const captures = new Map(initial.map(state => [state.field, state] as const));
      const nextInitial = nextFields.map(field => {
        const retained = captures.get(field);
        if (retained) return retained;
        const state = capture(field);
        adopted.push(state);
        return state;
      });
      const nextRegions = new Map<HTMLElement, { id: string | null; live: string | null; text: string | null }>();
      for (const region of nextErrors.values()) if (region && !nextRegions.has(region)) {
        nextRegions.set(region, regionState.get(region) ?? {
          id: region.getAttribute("id"), live: region.getAttribute("aria-live"), text: region.textContent
        });
      }
      const nextOwners = new Set<HTMLFormElement>();
      if (!rows || deletedPreview()) for (const field of nextFields) for (const { element } of field.originals) {
        const owner = nativeOwner(element);
        if (owner) nextOwners.add(owner);
      }
      const nextAnnotations = new Map(nextFields.flatMap(field => field.originals.map(({ element }) => [element, annotation(element)] as const)));
      if (!current()) return;
      const unchanged = !rescanIncomplete && nextFields.length === fields.length && nextFields.every((field, index) => field === fields[index] &&
        nextErrors.get(field) === field.error && (!field.error || errorIds.get(field) === field.error.id)) &&
        nextOwners.size === resetOwners.size && [...nextOwners].every(owner => resetOwners.has(owner));
      const addedValues = new Map<Field, { raw: unknown; shown: unknown; invalid: boolean }>();
      if (!rows) for (const [field, policy] of nextRules) {
        if (!localRenderedValues.has(field) && (renderers.has(field.name) || policy.format.length)) {
          const raw = fieldValue(field);
          checkpoint();
          addedValues.set(field, { raw, shown: raw, invalid: Boolean(issues.get(field)?.length) });
        }
      }
      const rendered = new Set(renderedOriginals.map(state => state.field));
      const nextRendered = nextInitial.filter(({ field, element }) => rendered.has(field) || renderers.has(field.name) ||
        !rows && nextRules.get(field)!.format.length > 0 && !control(element));
      const publishRules = () => {
        runner.adopt(declarationView);
        for (const [field, policy] of nextRules) {
          if (!sameRuleCalls(field.format, policy.format)) field.format = policy.format;
          if (!sameRuleCalls(field.validate, policy.validate)) field.validate = policy.validate;
          field.declarations = policy.declarations;
        }
        for (const [field, value] of addedValues) localRenderedValues.set(field, value);
        renderedOriginals = nextRendered;
        annotations = nextAnnotations;
      };
      checkpoint();
      if (unchanged) { publishRules(); return; }
      for (const field of nextFields) if (field.element instanceof HTMLSelectElement && !releaseSelects.has(field.element)) {
        pendingSelects.set(field.element, claimSelect(field.element, "bindForm", field.choices?.select ? prepare => replaceSelectChoices(field, prepare) : undefined));
        const select = getSelect(field.element);
        if (select !== field.choices?.select || select && field.choices?.catalog !== select.catalog) {
          throw formError("FORM_OPTIONS", "The common Select catalog changed during field admission.", { field: field.name });
        }
      }
      for (const field of nextFields) if (field.groupDefinition && !field.group) {
        mountFieldGroup(field, checkpoint);
        const release = acquireGroup(field, nextInitial.find(state => state.field === field)!.value); pendingGroups.set(field.group!, release);
        checkpoint();
      }
      for (const field of nextFields) if (field.group && !releaseGroups.has(field.group) && !pendingGroups.has(field.group)) {
        pendingGroups.set(field.group, acquireGroup(field, nextInitial.find(state => state.field === field)!.value));
      }
      if (!current()) return;
      committing = true;
      version = ++renderVersion;
      rescanIncomplete = true;
      const attribute = (element: HTMLElement, name: string, value: string | null) => {
        if (!current()) return;
        if (value === null) element.removeAttribute(name);
        else element.setAttribute(name, value);
      };
      for (const field of retired) {
        for (const original of field.originals) {
          attribute(original.element, "aria-describedby", original.describedBy);
          attribute(original.element, "aria-invalid", original.invalid);
          if (rows) attribute(original.element, "data-field-changed", original.changed);
        }
        if (!current()) return;
        if (!rows && localRenderedValues.has(field) && (control(field.element) || field.element.localName === "img")) {
          const raw = localFieldValue(field);
          if (!current()) return;
          display(field.element, raw, field.checkboxValues);
        } else if (renderedOriginals.some(state => state.field === field)) {
          const state = captures.get(field)!;
          if (!current()) return;
          field.element.replaceChildren(...state.children);
        }
        if (!current()) return;
        if (field.choices) {
          (field.element as HTMLSelectElement).replaceChildren(...field.choices.authoredNodes);
          if (field.choices.select) {
            const raw = new Map(field.choices.authoredOptions.map((option, index) => [option, field.choices!.authored[index]]));
            field.choices.select.raw = raw;
            selectRowOptions(field.element as HTMLSelectElement, raw, captures.get(field)!.value, current);
          } else for (let index = 0; index < field.choices.authoredOptions.length; index++) {
            if (!current()) return;
            field.choices.authoredOptions[index].selected = field.choices.selection[index];
          }
        }
        if (!current()) return;
      }
      for (const [region, original] of regionState) if (!nextRegions.has(region)) {
        attribute(region, "id", original.id);
        attribute(region, "aria-live", original.live);
        if (!current()) return;
        region.textContent = original.text;
      }
      if (!current()) return;
      for (const field of retired) {
        localRenderedValues.delete(field);
        issues.delete(field);
        field.projection = undefined;
        setNativeProjection(field);
        field.choices?.raw.clear();
        const state = captures.get(field);
        if (state?.files) state.files.length = 0;
        if (field.element instanceof HTMLSelectElement) {
          releaseSelects.get(field.element)?.();
          releaseSelects.delete(field.element);
        }
        errorIds.delete(field);
      }
      for (const field of retired) if (field.group) {
        releaseGroups.get(field.group)?.();
        releaseGroups.delete(field.group);
      }
      for (const [element, release] of pendingSelects) releaseSelects.set(element, release);
      pendingSelects.clear();
      for (const [group, release] of pendingGroups) releaseGroups.set(group, release);
      pendingGroups.clear();
      const graphChanged = values.sourceEnabled && (nextFields.length !== fields.length ||
        nextFields.some((field, index) => field !== fields[index]));
      publishRules();
      fields = nextFields;
      sourceFields = compileSourceFields(fields);
      if (graphChanged) acceptedSource = undefined;
      byName = new Map(fields.map(field => [field.name, field]));
      byElement = new Map(fields.flatMap(field => field.elements.map(element => [element, field] as const)));
      annotations = nextAnnotations;
      initial = nextInitial;
      choiceFields = fields.filter(field => field.choices);
      defaultEntries.length = 0;
      for (const entry of nativeEntries(initial)) defaultEntries.push(entry);
      regionState.clear();
      for (const [region, original] of nextRegions) regionState.set(region, original);
      if (pointerField && !nextSet.has(pointerField)) pointerField = undefined;
      for (const field of fields) field.error = nextErrors.get(field);
      published = true;
      for (const owner of resetOwners) if (!nextOwners.has(owner)) {
        if (!current()) return;
        owner.removeEventListener("reset", onReset);
        resetOwners.delete(owner);
      }
      for (const owner of nextOwners) if (!resetOwners.has(owner) || retrying) {
        if (!current()) return;
        resetOwners.add(owner);
        try { owner.addEventListener("reset", onReset); }
        finally { if (disposed) owner.removeEventListener("reset", onReset); }
      }
      for (const field of fields) {
        if (!current()) return;
        const region = field.error;
        let id: string | undefined;
        if (region) {
          if (!region.hasAttribute("aria-live")) attribute(region, "aria-live", "polite");
          if (!current()) return;
          id = errorId(region);
          if (!current()) return;
        }
        for (const original of field.originals) {
          const tokens = new Set((original.describedBy ?? "").split(/\s+/).filter(Boolean));
          if (id) tokens.add(id);
          attribute(original.element, "aria-describedby", tokens.size ? [...tokens].join(" ") : original.describedBy);
        }
        if (!current()) return;
        if (id) errorIds.set(field, id);
        else errorIds.delete(field);
      }
      syncPreview();
      const hadIssues = issues.size > 0;
      showIssues(current);
      if (hadIssues && !issues.size && current()) showIssues(current);
      if (current()) {
        syncPreview();
        if (current()) rescanIncomplete = false;
      }
    } catch (cause) {
      rescanFailed = true;
      if (disposed) return;
      if (!committing && cause instanceof FrameworkError) throw cause;
      throw new FrameworkError({ api: "bindForm", code: "FORM_RESCAN", message: "The Form fields could not be reconciled.", cause });
    } finally {
      let failed = false, failure: unknown;
      for (const release of pendingSelects.values()) try { release(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
      pendingSelects.clear();
      for (const release of pendingGroups.values()) try { release(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
      pendingGroups.clear();
      for (const [group, dispose] of ownedGroups) if (!releaseGroups.has(group)) { ownedGroups.delete(group); try { dispose(); } catch (cause) { if (!failed) { failed = true; failure = cause; } } }
      if (!published) for (const state of adopted) if (state.files) state.files.length = 0;
      scanning = false;
      if (failed && !rescanFailed) throw failure;
    }
  }

  function unbind(): void {
    active();
    if (restoring) throw formError("FORM_UNBIND", "A Form cannot recursively restore its captured view.");
    const entry = renderVersion;
    const entered = () => !disposed && entry === renderVersion;
    const files = new Map<Field, FileList>();
    restoring = true;
    try {
      for (const state of initial) if (state.files?.length) {
        if (!entered()) return;
        try {
          const transfer = new (root.ownerDocument.defaultView?.DataTransfer ?? DataTransfer)();
          if (!entered()) return;
          for (const file of state.files) {
            transfer.items.add(file);
            if (!entered()) return;
          }
          const selected = transfer.files;
          if (selected.length !== state.files.length) throw new TypeError("The native file list is incomplete.");
          const probe = state.element.cloneNode() as HTMLInputElement;
          if (!entered()) return;
          probe.files = selected;
          if (!entered()) return;
          files.set(state.field, selected);
        } catch (cause) {
          if (!entered()) return;
          throw new FrameworkError({ api: "bindForm", code: "FORM_UNBIND", message: "The captured files could not be restored.",
            detail: { field: state.field.name }, cause });
        }
      }
      if (!entered()) return;
      let version = ++renderVersion;
      const current = () => !disposed && version === renderVersion;
      if (boundId !== null) drafts.delete(boundId);
      boundId = null;
      acceptedSource = undefined;
      const admitted = refreshGroups(null, null);
      if (admitted === undefined || disposed || boundId !== null) return;
      version = admitted;
      syncPreview();
      automatic = false;
      pointerField = undefined;
      issues.clear();
      pendingResets.clear();
      if (resetTimer !== undefined) { clearTimeout(resetTimer); resetTimer = undefined; }
      for (const field of fields) { field.projection = undefined; setNativeProjection(field); }
      for (const state of initial) {
        if (!current()) return;
        const { field, element } = state;
        const retained = localRenderedValues.get(field);
        if (retained) { retained.raw = state.value; retained.invalid = false; }
        if (field.group) field.group.write(state.value, current);
        else if (element instanceof HTMLSelectElement) {
          const choices = field.choices;
          if (choices) {
            choices.raw = new Map(choices.authoredOptions.map((option, index) => [option, choices.authored[index]]));
            if (choices.select) choices.select.raw = choices.raw;
            choices.source = undefined;
            choices.bound = false;
            element.replaceChildren(...choices.authoredNodes);
            if (!current()) return;
          }
          if (choices?.select) selectRowOptions(element, choices.raw, state.value, current);
          else {
            element.selectedIndex = -1;
            for (const selected of state.selection!) if (selected.selected && selected.option.closest("select") === element) {
              if (!current()) return;
              selected.option.selected = true;
            }
          }
        } else if (state.files) {
          const captured = files.get(field);
          if (captured) (element as HTMLInputElement).files = captured;
          else (element as HTMLInputElement).value = "";
        } else if (state.checked) {
          for (const selected of state.checked) {
            if (!current()) return;
            selected.input.checked = selected.checked;
          }
        } else if (control(element)) display(element, state.value, field.checkboxValues);
        else if (state.src !== undefined) {
          if (state.src === null) element.removeAttribute("src");
          else element.setAttribute("src", state.src);
        } else element.replaceChildren(...state.children);
        if (!current()) return;
        if (retained) {
          const shown = fieldValue(field);
          if (!current()) return;
          retained.shown = shown;
        }
        if (rows) for (const { element: member } of field.originals) {
          if (!current()) return;
          member.setAttribute("data-field-changed", "false");
        }
      }
      if (current()) showIssues(current);
    } finally { restoring = false; }
  }

  function reconcile(id: RowId, validate = true): void {
    const currentDrafts = drafts.get(id);
    if (!currentDrafts?.size || reconciling) return;
    const snapshot = rows!.get(id), version = renderVersion;
    if (snapshot?.status === "delete") return;
    const result = evaluate(id, rowValue(id, true), currentDrafts, validate);
    if (disposed || version !== renderVersion || rows!.get(id) !== snapshot) return;
    const ready = [...currentDrafts.keys()].filter(field => !result.byField.get(field)?.length);
    let failed = false;
    let failure: unknown;
    reconciling = true;
    try {
      for (const field of ready) {
        if (disposed || version !== renderVersion) return;
        const source = rowValue(id, true);
        const value = result.parsed.get(field)!.value;
        if (field.choices && !rowOptionAvailable([
          ...field.choices.authored, ...choiceOptions(field, source, id).map(option => option.raw)
        ], value, (field.element as HTMLSelectElement).multiple)) continue;
        const next = writePath(source, field.path, value);
        const key = field.path[0] as keyof T;
        const before = rows!.get(id);
        try {
          rows!.set(id, key, next[field.path[0]] as T[keyof T]);
          currentDrafts.delete(field);
        } catch (cause) {
          try {
            const after = rows!.get(id);
            const stored = after?.value as Record<string, unknown> | undefined;
            if (after !== before && JSON.stringify(stored?.[field.path[0]]) ===
                JSON.stringify(next[field.path[0]])) currentDrafts.delete(field);
          } catch { /* Keep the original Rows.set error. */ }
          throw cause;
        }
      }
    } catch (cause) {
      failed = true;
      failure = cause;
    } finally {
      reconciling = false;
    }
    if (!currentDrafts.size) drafts.delete(id);
    try {
      if (id === boundId) {
        const checked = evaluate(id, rowValue(id), currentDrafts, validate);
        for (const field of fields) issues.set(field, checked.byField.get(field) ?? []);
        const renderedRow = rows!.get(id), rendered = render("val", true);
        showIssues();
        if (!failed) acceptSource(rendered, renderedRow);
      }
    } catch (cause) {
      if (!failed) throw cause;
    }
    if (failed) throw failure;
  }
  function onInput(event: Event): void {
    return working(() => {
      if (disposed || scanning || !automatic || !event.target || !(event.target instanceof HTMLElement)) return;
      const field = byElement.get(event.target);
      if (!field || !control(field.element)) return;
      const flushed = rows ? renderVersion : flushLocalResets(field);
      if (disposed || !automatic || flushed !== renderVersion) return;
      if (disabled(event.target, root) ||
          (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && event.target.readOnly) return;
      if (rows) {
        if (boundId === null || deletedPreview()) return;
        setNativeProjection(field);
        const id = boundId, snapshot = rows.get(id), version = renderVersion;
        const entered = enteredValue(field);
        if (disposed || boundId !== id || renderVersion !== version || rows.get(id) !== snapshot || snapshot?.status === "delete") return;
        const currentDrafts = drafts.get(id) ?? new Map<Field, unknown>();
        currentDrafts.set(field, entered);
        drafts.set(id, currentDrafts);
        reconcile(id, autoValidate);
        return;
      }
      const retained = localRenderedValues.get(field);
      if (retained) {
        retained.raw = retained.shown = fieldValue(field);
        retained.invalid = false;
      }
      const version = ++renderVersion;
      const entered = new Map(fields.map(item => [item, localFieldValue(item)] as const));
      const checked = evaluate(null, localValues(), entered, autoValidate);
      if (disposed || version !== renderVersion) return;
      for (const item of fields) {
        if (item === field || issues.has(item)) {
          const found = checked.byField.get(item) ?? [];
          issues.set(item, found);
          const value = localRenderedValues.get(item);
          if (value) value.invalid = found.length > 0;
        }
      }
      showIssues(() => !disposed && version === renderVersion);
      if (disposed || version !== renderVersion) return;
      if (localRenderedValues.size) renderLocal();
    });
  }

  function onPointerDown(event: PointerEvent): void {
    if (scanning || !automatic) return;
    pointerField = event.target instanceof HTMLElement ? byElement.get(event.target) : undefined;
  }
  function onPointerEnd(): void { if (!scanning) pointerField = undefined; }

  function onFocusIn(event: FocusEvent): void {
    return working(() => {
      if (disposed || scanning || !automatic || !event.target || !(event.target instanceof HTMLElement)) return;
      const flushed = rows ? renderVersion : flushLocalResets();
      if (disposed || !automatic || flushed !== renderVersion) return;
      const field = byElement.get(event.target);
      const pointed = field !== undefined && pointerField === field;
      pointerField = undefined;
      if (!field || !field.format.length && !valueCallbacks || !control(field.element) ||
          field.kind !== "single" || !formatCapable(field.element) ||
          rows && (boundId === null || deletedPreview() || drafts.get(boundId)?.has(field))) return;
      if ((!rows || valueCallbacks) && textLengthControl(field.element) && field.element.readOnly) return;
      const element = field.element;
      const before = element.value;
      const raw = rows ? readPath(rowValue(boundId!), field.path) : localFieldValue(field);
      if (before === (raw == null ? "" : String(raw))) return;
      const selection = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
        ? { start: element.selectionStart, end: element.selectionEnd, direction: element.selectionDirection }
        : null;
      display(element, raw, field.checkboxValues);
      if (rows && boundId !== null && !disposed) rememberNative(field, boundId, raw);
      if (!rows) {
        localRenderedValues.get(field)!.shown = fieldValue(field);
        renderVersion++;
      }
      if (selection && selection.start !== null && selection.end !== null) {
        const selectAll = selection.start === 0 &&
          (selection.end === before.length || !pointed && selection.end === 0);
        const length = element.value.length;
        (element as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(
          selectAll ? 0 : Math.min(selection.start, length),
          selectAll ? length : Math.min(selection.end, length), selection.direction ?? undefined);
      }
    });
  }

  function onFocusOut(event: FocusEvent): void {
    return working(() => {
      if (disposed || scanning || !automatic || !event.target || !(event.target instanceof HTMLElement)) return;
      const flushed = rows ? renderVersion : flushLocalResets();
      if (disposed || !automatic || flushed !== renderVersion) return;
      const field = byElement.get(event.target);
      if (!field || !field.format.length && !valueCallbacks || !control(field.element) ||
          field.kind !== "single" || !formatCapable(field.element) ||
          rows && (boundId === null || deletedPreview() || drafts.get(boundId)?.has(field))) return;
      if ((!rows || valueCallbacks) && textLengthControl(field.element) && field.element.readOnly) return;
      if (!rows) { renderLocal(undefined, field); return; }
      const id = boundId!, snapshot = rows.get(id), version = renderVersion;
      const source = rowValue(id);
      const raw = readPath(source, field.path);
      const current = () => !disposed && boundId === id && version === renderVersion && rows.get(id) === snapshot;
      if (valueCallbacks) projectValue(field, raw, source, id, "val", false, false, current);
      else {
        const shown = runner.format(field.format, raw, context(field, id, source));
        if (current()) { display(field.element, shown, field.checkboxValues); if (current()) rememberNative(field, id, raw, false, current); }
      }
    });
  }

  function onRows(event: RowsEvent): void {
    if (replacingGroup) { replacingGroup.events.push(event); return; }
    if (!rows || disposed || event.type === "move" || event.type === "append" || (event.type === "set" || event.type === "setMany") && reconciling) return;
    if (event.type === "replace" || event.type === "revert" && event.id === undefined) drafts.clear();
    else if (event.type === "remove") drafts.delete(event.id);
    else if (event.type === "revert" && event.id !== undefined) drafts.delete(event.id);
    if (boundId === null || event.type === "set" && event.id !== boundId ||
        event.type === "setMany" && !event.ids.includes(boundId)) return;
    const row = rows.get(boundId);
    if (!row) {
      boundId = null;
      acceptedSource = undefined;
      for (const field of fields) setNativeProjection(field);
      syncPreview();
      issues.clear();
      if (scanning) return;
      render("bind");
      showIssues();
      return;
    }
    if (row.status === "delete") {
      drafts.delete(boundId);
      issues.clear();
      if (scanning) return;
      syncPreview();
      const rendered = render("val");
      showIssues();
      acceptSource(rendered, row);
      return;
    }
    syncPreview();
    if (scanning) {
      if (event.type === "set" || event.type === "setMany" || event.type === "replace" ||
          event.type === "revert" && (event.id === undefined || event.id === boundId)) issues.clear();
      return;
    }
    if (event.type === "revert" && (event.id === undefined || event.id === boundId)) {
      bindRow(boundId, event, false);
      return;
    }
    const reset = event.type === "replace";
    if (reset || event.type === "set" || event.type === "setMany") issues.clear();
    const rendered = render(reset ? "bind" : "val", !reset);
    showIssues();
    acceptSource(rendered, row);
  }

  try {
    root.addEventListener("input", onInput);
    root.addEventListener("change", onInput);
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointerup", onPointerEnd);
    root.addEventListener("pointercancel", onPointerEnd);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    for (const owner of resetOwners) owner.addEventListener("reset", onReset);
    unsubscribe = rows?.subscribe(onRows);
  } catch (cause) {
    try { dispose(); } catch { /* Preserve the setup failure after releasing ownership. */ }
    throw cause;
  }
  initialized = true;

  return {
    bind,
    rescan,
    defaults,
    prepare,
    unbind,
    refresh(names) {
      active();
      if (names === undefined) { bind(boundId); return; }
      if (!Array.isArray(names)) throw formError("FORM_BIND", "Refresh fields must be an array of compiled field paths.");
      const requested = new Set<string>();
      const sourceKeys = values.sourceEnabled ? new Set<string>() : undefined;
      const row = sourceKeys && boundId !== null ? rows!.get(boundId) : undefined;
      for (const name of names) {
        if (typeof name !== "string") {
          throw formError("FORM_BIND", "Refresh needs an existing compiled field path.", { field: name });
        }
        const field = byName.get(name);
        if (field) {
          requested.add(name);
          if (sourceKeys && row && Object.hasOwn(row.value, field.path[0])) sourceKeys.add(field.path[0]);
        } else if (sourceKeys && row && Object.hasOwn(row.value, name)) {
          sourceKeys.add(name);
          for (const field of sourceFields!.get(name) ?? []) requested.add(field.name);
        } else {
          throw formError("FORM_BIND", values.sourceEnabled
            ? "Refresh needs an existing field path or own source key." : "Refresh needs an existing compiled field path.", { field: name });
        }
      }
      const selected = new Set(fields.filter(field => requested.has(field.name)));
      if (!rows) {
        const flushed = flushLocalResets();
        active();
        if (flushed !== renderVersion) return;
      }
      if (!selected.size && !sourceKeys?.size) return;
      if (!rows) { renderLocal(undefined, undefined, selected); return; }
      const source = boundId === null ? null : rowValue(boundId);
      const prepared = prepareChoices(source, boundId, selected);
      render("bind", true, true, prepared, selected, sourceKeys);
    },
    read() {
      active();
      if (!rows) { flushLocalResets(); active(); }
      const source = rows ? (boundId === null ? {} : rowValue(boundId)) : localValues();
      let result: Record<string, unknown> = {};
      for (const field of fields) {
        const value = readPath(source, field.path);
        result = writePath(result, field.path,
          value && typeof value === "object" ? structuredClone(value) : value);
      }
      return result;
    },
    validate(id) {
      active();
      if (!rows) {
        const version = flushLocalResets();
        active();
        const entered = new Map(fields.map(field => [field, localFieldValue(field)] as const));
        const checked = evaluate(null, localValues(), entered);
        const found = [...checked.byField.values()].flat();
        if (!disposed && version === renderVersion) {
          for (const field of fields) {
            const fieldIssues = checked.byField.get(field) ?? [];
            issues.set(field, fieldIssues);
            const retained = localRenderedValues.get(field);
            if (retained && retained.invalid !== (fieldIssues.length > 0)) {
              retained.invalid = fieldIssues.length > 0;
              nativeRevision++;
            }
          }
          showIssues();
        }
        return { valid: found.length === 0, issues: found };
      }
      const targets = id === undefined
        ? [...new Set([...(boundId === null || deletedPreview() ? [] : [boundId]), ...drafts.keys()])]
        : [id];
      const found: ValidationIssue[] = [];
      for (const target of targets) {
        if (drafts.has(target)) reconcile(target);
        const checked = evaluate(target, rowValue(target, true), drafts.get(target) ?? new Map());
        for (const fieldIssues of checked.byField.values()) found.push(...fieldIssues);
        if (target === boundId) {
          for (const field of fields) issues.set(field, checked.byField.get(field) ?? []);
          showIssues();
        }
      }
      return { valid: found.length === 0, issues: found };
    },
    dispose
  };

  function dispose(): void {
    if (disposed) return;
    if (!rows && !scanning) flushLocalResets(undefined, false);
    disposed = true;
    let failed = false, failure: unknown;
    try {
      acceptedSource = undefined;
      syncPreview();
      renderVersion++;
      activeValues.clear();
      activeBindings.clear();
      for (const field of fields) { field.projection = undefined; setNativeProjection(field); }
      boundRoots.delete(root);
      unsubscribe?.();
      root.removeEventListener("input", onInput);
      root.removeEventListener("change", onInput);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerup", onPointerEnd);
      root.removeEventListener("pointercancel", onPointerEnd);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      for (const owner of resetOwners) owner.removeEventListener("reset", onReset);
      pendingResets.clear();
      if (resetTimer !== undefined) clearTimeout(resetTimer);
      if (!rows) for (const [field] of localRenderedValues) {
        if (control(field.element)) display(field.element, localFieldValue(field), field.checkboxValues);
      }
      for (const field of fields) {
        for (const original of field.originals) {
          if (original.describedBy === null) original.element.removeAttribute("aria-describedby");
          else original.element.setAttribute("aria-describedby", original.describedBy);
          if (original.invalid === null) original.element.removeAttribute("aria-invalid");
          else original.element.setAttribute("aria-invalid", original.invalid);
          if (rows) {
            if (original.changed === null) original.element.removeAttribute("data-field-changed");
            else original.element.setAttribute("data-field-changed", original.changed);
          }
        }
      }
      for (const [region, original] of regionState) {
        if (original.id === null) region.removeAttribute("id");
        else region.setAttribute("id", original.id);
        if (original.live === null) region.removeAttribute("aria-live");
        else region.setAttribute("aria-live", original.live);
        region.textContent = original.text;
      }
      restoreRendered();
    } catch (cause) { failed = true; failure = cause; }
    finally {
      for (const release of pendingGroups.values()) try { release(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
      pendingGroups.clear();
      for (const release of releaseGroups.values()) try { release(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
      releaseGroups.clear();
      for (const field of choiceFields) {
        const choices = field.choices!;
        try {
          const element = field.element as HTMLSelectElement;
          if (choices.select) {
            const catalog = choices.select.catalog;
            element.replaceChildren(...catalog.nodes);
            const raw = new Map(catalog.options.map((option, index) => [option, catalog.values[index]]));
            choices.select.raw = raw;
            selectRowOptions(element, raw, initial.find(state => state.field === field)!.value);
          } else {
            element.replaceChildren(...choices.authoredNodes);
            choices.authoredOptions.forEach((option, index) => { option.selected = choices.selection[index]; });
          }
          choices.raw.clear();
        } catch (cause) { if (!failed) { failed = true; failure = cause; } }
      }
      for (const release of pendingSelects.values()) try { release(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
      pendingSelects.clear();
      for (const release of releaseSelects.values()) try { release(); } catch (cause) { if (!failed) { failed = true; failure = cause; } }
      releaseSelects.clear();
    }
    for (const state of initial) if (state.files) state.files.length = 0;
    initial.length = 0;
    renderedOriginals.length = 0;
    localRenderedValues.clear();
    drafts.clear();
    issues.clear();
    if (failed) throw failure;
  }
}
