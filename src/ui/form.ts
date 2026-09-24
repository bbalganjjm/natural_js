// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { RowId, Rows } from "../data/index.js";
import { parsePath, readPath, writePath } from "./field-path.js";
import { createRuleRunner } from "./rules.js";
import type { RuleCall } from "./rules.js";
import { claimSelect } from "./select-owner.js";
import type {
  FormHandle, FormatRule, ParseInput, RuleContext, RuleSet,
  ValidateRule, ValidationIssue, ValidationResult
} from "./index.js";

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface Field {
  element: HTMLElement;
  elements: HTMLElement[];
  kind: "single" | "radio" | "checkbox" | "multiple";
  name: string;
  path: readonly string[];
  format: readonly RuleCall<FormatRule>[];
  validate: readonly RuleCall<ValidateRule>[];
  error?: HTMLElement;
  originals: { element: HTMLElement; describedBy: string | null; invalid: string | null }[];
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

function control(element: HTMLElement): element is Control {
  return element.localName === "input" || element.localName === "select" || element.localName === "textarea";
}

function formatCapable(element: HTMLElement): boolean {
  if (element.localName === "select") return false;
  return element.localName !== "input" ||
    ["text", "search", "tel", "url", "email", "password"].includes((element as HTMLInputElement).type);
}

function textLengthControl(element: Control): element is HTMLInputElement | HTMLTextAreaElement {
  return element.localName === "textarea" || element.localName === "input" &&
    ["text", "search", "tel", "url", "email", "password"].includes((element as HTMLInputElement).type);
}

function inputValue(element: HTMLElement): unknown {
  if (!control(element)) return element.textContent ?? "";
  if (element.localName === "input") {
    const input = element as HTMLInputElement;
    if (input.type === "checkbox") return input.checked;
    if (input.type === "file") return input.files?.[0]?.name ?? "";
  }
  return element.value;
}

function fieldValue(field: Field): unknown {
  if (field.kind === "radio") {
    const selected = field.elements.find(element => (element as HTMLInputElement).checked);
    return selected ? (selected as HTMLInputElement).value : null;
  }
  if (field.kind === "checkbox" && field.elements.length > 1) {
    return field.elements.filter(element => (element as HTMLInputElement).checked)
      .map(element => (element as HTMLInputElement).value);
  }
  if (field.kind === "multiple") {
    return [...(field.element as HTMLSelectElement).selectedOptions].map(option => option.value);
  }
  return inputValue(field.element);
}

function display(element: HTMLElement, value: unknown): void {
  if (!control(element)) {
    element.textContent = value == null ? "" : String(value);
  } else if (element.localName === "input" && (element as HTMLInputElement).type === "checkbox") {
    (element as HTMLInputElement).checked = value === true;
  } else if (element.localName === "select" && (element as HTMLSelectElement).multiple) {
    const selected = new Set(Array.isArray(value) ? value.map(String) : []);
    for (const option of (element as HTMLSelectElement).options) option.selected = selected.has(option.value);
  } else {
    element.value = value == null ? "" : String(value);
  }
}

function displayField(field: Field, value: unknown): void {
  if (field.kind === "radio") {
    const selected = value == null ? null : String(value);
    for (const element of field.elements) {
      const input = element as HTMLInputElement;
      input.checked = selected !== null && input.value === selected;
    }
  } else if (field.kind === "checkbox" && field.elements.length > 1) {
    const selected = new Set(Array.isArray(value) ? value.map(String) : []);
    for (const element of field.elements) {
      const input = element as HTMLInputElement;
      input.checked = selected.has(input.value);
    }
  } else {
    display(field.element, value);
  }
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
  options: { rows?: Rows<T>; rules?: RuleSet; parse?: Record<string, ParseInput> } = {}
): FormHandle<T> {
  if (!root || root.nodeType !== 1) {
    throw formError("FORM_ROOT", "Form root must be an HTML element.");
  }
  if (boundRoots.has(root)) {
    throw formError("FORM_IN_USE", "This Form root is already bound.");
  }
  const { rows, rules, parse } = options;
  const runner = createRuleRunner("bindForm", rules);
  rows?.entries();
  const errorRegions = new Map<string, HTMLElement>();
  const regionState = new Map<HTMLElement, { id: string | null; live: string | null; text: string | null }>();
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
    const input = element.localName === "input" ? element as HTMLInputElement : null;
    const kind = input?.type === "radio" ? "radio" :
      input?.type === "checkbox" ? "checkbox" :
        element.localName === "select" && (element as HTMLSelectElement).multiple ? "multiple" : "single";
    if (input?.type === "file") {
      if (rows) throw formError("FORM_FILE_ROWS", "File inputs require a local Form; Rows store JSON values.", { field: name });
      if (input.multiple) throw formError("FORM_FILE_MULTIPLE", "Validate multiple files in application code.", { field: name });
    }
    if (kind === "radio" && (!input?.form || !input.name ||
        input.form !== root && !root.contains(input.form))) {
      throw formError("FORM_RADIO_OWNER", "Radio fields need a name and a form owner inside this Form root.", { field: name });
    }
    const existing = byName.get(name);
    if (existing) {
      if ((kind !== "radio" && kind !== "checkbox") || existing.kind !== kind) {
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
        invalid: element.getAttribute("aria-invalid")
      });
      continue;
    }
    const field: Field = {
      element, elements: [element], kind, name, path: parsePath(name),
      format: [], validate: [], error: errorRegions.get(name),
      originals: [{
        element, describedBy: element.getAttribute("aria-describedby"),
        invalid: element.getAttribute("aria-invalid")
      }]
    };
    fields.push(field);
    byName.set(name, field);
  }
  for (const field of fields) {
    for (const attribute of ["data-format", "data-validate"] as const) {
      const declarations = field.elements.map(element => element.getAttribute(attribute))
        .filter((value): value is string => value !== null);
      if (new Set(declarations).size > 1) {
        throw formError("FORM_GROUP_RULES", "One field group needs one rule declaration.", { field: field.name });
      }
    }
    const formatElement = field.elements.find(element => element.hasAttribute("data-format")) ?? field.element;
    const validateElement = field.elements.find(element => element.hasAttribute("data-validate")) ?? field.element;
    field.format = runner.formats(formatElement, field.name);
    field.validate = runner.validators(validateElement, field.name);
    if (field.format.length && !formatCapable(field.element)) {
      throw formError("FORM_FORMAT_CONTROL", "Formatting requires a text field.", { field: field.name });
    }
    if (parse?.[field.name] && (field.kind === "checkbox" || field.kind === "multiple")) {
      throw formError("FORM_PARSE_CONTROL", "A string parser cannot convert boolean or array controls.", { field: field.name });
    }
  }
  const byElement = new Map(fields.flatMap(field => field.elements.map(element => [element, field] as const)));
  const releaseSelects: (() => void)[] = [];
  try {
    for (const field of fields) {
      if (field.element instanceof HTMLSelectElement) {
        releaseSelects.push(claimSelect(field.element, "bindForm"));
      }
    }
  } catch (cause) {
    for (const release of releaseSelects) release();
    throw cause;
  }
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
    for (const original of field.originals) {
      const tokens = new Set((original.describedBy ?? "").split(/\s+/).filter(Boolean));
      tokens.add(id);
      original.element.setAttribute("aria-describedby", [...tokens].join(" "));
    }
  }

  let boundId: RowId | null = null;
  let disposed = false;
  let reconciling = false;
  let pointerField: Field | undefined;
  const drafts = new Map<RowId, Map<Field, unknown>>();
  const issues = new Map<Field, readonly ValidationIssue[]>();

  function active(): void {
    if (disposed) throw formError("FORM_DISPOSED", "This Form has been disposed.");
  }

  function rowValue(id: RowId): Record<string, unknown> {
    const row = rows?.get(id);
    if (!row || row.status === "delete") {
      throw formError("ROW_MISSING", "The row ID is not available for this Form.", { id });
    }
    return row.value as Record<string, unknown>;
  }

  function localValues(): Record<string, unknown> {
    let values: Record<string, unknown> = {};
    for (const field of fields) values = writePath(values, field.path, fieldValue(field));
    return values;
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
      const parser = parse?.[field.name];
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
    values: Record<string, unknown>): readonly ValidationIssue[] {
    if (candidate.parseFailed) return [issue(field, id, "parse", candidate.parseError ?? "Input could not be parsed.")];
    const found: ValidationIssue[] = [];
    if (field.kind === "radio" || field.kind === "checkbox" && field.elements.length > 1) {
      const required = field.elements.some(element => (element as HTMLInputElement).required);
      const entered = candidate.entered === undefined ? candidate.value : candidate.entered;
      const selected = field.kind === "radio" ?
        entered != null && field.elements.some(element => (element as HTMLInputElement).value === String(entered)) :
        Array.isArray(entered) && field.elements.some(element =>
          entered.some(value => String(value) === (element as HTMLInputElement).value));
      if (required && !selected) found.push(issue(field, id, "html", "Select an option."));
    } else if (control(field.element)) {
      const visible = id === null || id === boundId;
      const probe = visible ? field.element : field.element.cloneNode(true) as Control;
      const entered = candidate.entered ?? candidate.value;
      if (!visible) display(probe, entered);
      const text = String(entered ?? "");
      const tooShort = !visible && candidate.entered !== undefined &&
        textLengthControl(probe) && probe.minLength >= 0 &&
        text.length > 0 && text.length < probe.minLength;
      const tooLong = !visible && candidate.entered !== undefined &&
        textLengthControl(probe) && probe.maxLength >= 0 &&
        text.length > probe.maxLength;
      if (!probe.validity.valid || tooShort || tooLong) {
        const message = tooShort ? `Use at least ${probe.minLength} characters.` :
          tooLong ? `Use at most ${probe.maxLength} characters.` :
            probe.validationMessage || "Invalid input.";
        found.push(issue(field, id, "html", message));
      }
    }
    found.push(...runner.validate(field.validate, candidate.value, context(field, id, values)));
    return found;
  }

  function evaluate(id: RowId | null, source: Record<string, unknown>, entered: ReadonlyMap<Field, unknown>) {
    const { values, parsed } = candidates(id, source, entered);
    const byField = new Map<Field, readonly ValidationIssue[]>();
    for (const field of fields) {
      const candidate = parsed.get(field) ?? { value: readPath(values, field.path) };
      byField.set(field, check(field, id, candidate, values));
    }
    return { byField, parsed };
  }

  function showIssues(): void {
    const messages = new Map<HTMLElement, string[]>();
    for (const field of fields) {
      const fieldIssues = issues.get(field) ?? [];
      for (const original of field.originals) {
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
    for (const region of regionState.keys()) region.textContent = (messages.get(region) ?? []).join(" ");
  }

  function render(skipFocused = false): void {
    const source = boundId === null ? null : rowValue(boundId);
    const currentDrafts = boundId === null ? undefined : drafts.get(boundId);
    for (const field of fields) {
      const focused = field.elements.includes(root.ownerDocument.activeElement as HTMLElement);
      if (skipFocused && focused && field.kind === "single" && formatCapable(field.element)) continue;
      if (currentDrafts?.has(field)) {
        displayField(field, currentDrafts.get(field));
        continue;
      }
      const raw = source ? readPath(source, field.path) : field.kind === "radio" ? null : "";
      displayField(field, source && !focused && field.format.length
        ? runner.format(field.format, raw, context(field, boundId, source)) : raw);
    }
  }

  function reconcile(id: RowId): void {
    const currentDrafts = drafts.get(id);
    if (!currentDrafts?.size || reconciling) return;
    const result = evaluate(id, rowValue(id), currentDrafts);
    const ready = [...currentDrafts.keys()].filter(field => !result.byField.get(field)?.length);
    let failed = false;
    let failure: unknown;
    reconciling = true;
    try {
      for (const field of ready) {
        const source = rowValue(id);
        const next = writePath(source, field.path, result.parsed.get(field)!.value);
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
        const checked = evaluate(id, rowValue(id), currentDrafts);
        for (const field of fields) issues.set(field, checked.byField.get(field) ?? []);
        render(true);
        showIssues();
      }
    } catch (cause) {
      if (!failed) throw cause;
    }
    if (failed) throw failure;
  }
  function onInput(event: Event): void {
    if (disposed || !event.target || !(event.target instanceof HTMLElement)) return;
    const field = byElement.get(event.target);
    if (!field || !control(field.element)) return;
    if (rows) {
      if (boundId === null) return;
      const currentDrafts = drafts.get(boundId) ?? new Map<Field, unknown>();
      currentDrafts.set(field, fieldValue(field));
      drafts.set(boundId, currentDrafts);
      reconcile(boundId);
      return;
    }
    const entered = new Map(fields.map(item => [item, fieldValue(item)] as const));
    const checked = evaluate(null, localValues(), entered);
    for (const item of fields) {
      if (item === field || issues.has(item)) issues.set(item, checked.byField.get(item) ?? []);
    }
    showIssues();
  }

  function onPointerDown(event: PointerEvent): void {
    pointerField = event.target instanceof HTMLElement ? byElement.get(event.target) : undefined;
  }
  function onPointerEnd(): void { pointerField = undefined; }

  function onFocusIn(event: FocusEvent): void {
    if (disposed || !event.target || !(event.target instanceof HTMLElement)) return;
    const field = byElement.get(event.target);
    const pointed = field !== undefined && pointerField === field;
    pointerField = undefined;
    if (!field || !field.format.length || !control(field.element) ||
        !rows || boundId === null || drafts.get(boundId)?.has(field)) return;
    const element = field.element;
    const before = element.value;
    const raw = readPath(rowValue(boundId), field.path);
    if (before === (raw == null ? "" : String(raw))) return;
    const selection = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
      ? { start: element.selectionStart, end: element.selectionEnd, direction: element.selectionDirection }
      : null;
    display(element, raw);
    if (selection && selection.start !== null && selection.end !== null) {
      const selectAll = selection.start === 0 &&
        (selection.end === before.length || !pointed && selection.end === 0);
      const length = element.value.length;
      (element as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(
        selectAll ? 0 : Math.min(selection.start, length),
        selectAll ? length : Math.min(selection.end, length), selection.direction ?? undefined);
    }
  }

  function onFocusOut(event: FocusEvent): void {
    if (disposed || !event.target || !(event.target instanceof HTMLElement)) return;
    const field = byElement.get(event.target);
    if (!field || !field.format.length || !control(field.element) ||
        !rows || boundId === null || drafts.get(boundId)?.has(field)) return;
    const source = rowValue(boundId);
    const raw = readPath(source, field.path);
    display(field.element, runner.format(field.format, raw, context(field, boundId, source)));
  }

  root.addEventListener("input", onInput);
  root.addEventListener("change", onInput);
  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointerup", onPointerEnd);
  root.addEventListener("pointercancel", onPointerEnd);
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  const unsubscribe = rows?.subscribe(event => {
    if (disposed || event.type === "set" && reconciling) return;
    if (event.type === "replace" || event.type === "revert" && event.id === undefined) drafts.clear();
    else if (event.type === "remove") drafts.delete(event.id);
    else if (event.type === "revert" && event.id !== undefined) drafts.delete(event.id);
    if (boundId === null || event.type === "set" && event.id !== boundId) return;
    const row = rows.get(boundId);
    if (!row || row.status === "delete") {
      boundId = null;
      issues.clear();
      render();
      showIssues();
      return;
    }
    const reset = event.type === "replace" ||
      event.type === "revert" && (event.id === undefined || event.id === boundId);
    if (reset || event.type === "set") issues.clear();
    render(!reset);
    showIssues();
  });

  boundRoots.add(root);
  return {
    bind(id) {
      active();
      if (id !== null && !rows) {
        throw formError("ROW_MISSING", "This Form has no row store.", { id });
      }
      if (id !== null) rowValue(id);
      boundId = id;
      issues.clear();
      if (rows) {
        render();
        const currentDrafts = id === null ? undefined : drafts.get(id);
        if (id !== null && currentDrafts?.size) {
          const checked = evaluate(id, rowValue(id), currentDrafts);
          for (const field of currentDrafts.keys()) issues.set(field, checked.byField.get(field) ?? []);
        }
      }
      showIssues();
    },
    read() {
      active();
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
        const entered = new Map(fields.map(field => [field, fieldValue(field)] as const));
        const checked = evaluate(null, localValues(), entered);
        const found = [...checked.byField.values()].flat();
        for (const field of fields) issues.set(field, checked.byField.get(field) ?? []);
        showIssues();
        return { valid: found.length === 0, issues: found };
      }
      const targets = id === undefined
        ? [...new Set([...(boundId === null ? [] : [boundId]), ...drafts.keys()])]
        : [id];
      const found: ValidationIssue[] = [];
      for (const target of targets) {
        if (drafts.has(target)) reconcile(target);
        const checked = evaluate(target, rowValue(target), drafts.get(target) ?? new Map());
        for (const fieldIssues of checked.byField.values()) found.push(...fieldIssues);
        if (target === boundId) {
          for (const field of fields) issues.set(field, checked.byField.get(field) ?? []);
          showIssues();
        }
      }
      return { valid: found.length === 0, issues: found };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      boundRoots.delete(root);
      unsubscribe?.();
      for (const release of releaseSelects) release();
      root.removeEventListener("input", onInput);
      root.removeEventListener("change", onInput);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerup", onPointerEnd);
      root.removeEventListener("pointercancel", onPointerEnd);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      for (const field of fields) {
        for (const original of field.originals) {
          if (original.describedBy === null) original.element.removeAttribute("aria-describedby");
          else original.element.setAttribute("aria-describedby", original.describedBy);
          if (original.invalid === null) original.element.removeAttribute("aria-invalid");
          else original.element.setAttribute("aria-invalid", original.invalid);
        }
      }
      for (const [region, original] of regionState) {
        if (original.id === null) region.removeAttribute("id");
        else region.setAttribute("id", original.id);
        if (original.live === null) region.removeAttribute("aria-live");
        else region.setAttribute("aria-live", original.live);
        region.textContent = original.text;
      }
      drafts.clear();
      issues.clear();
    }
  };
}
