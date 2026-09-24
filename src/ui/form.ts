// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { RowId, Rows } from "../data/index.js";
import { parsePath, readPath, writePath } from "./field-path.js";
import { createRuleRunner } from "./rules.js";
import type { RuleCall } from "./rules.js";
import type {
  FormHandle, FormatRule, ParseInput, RuleContext, RuleSet,
  ValidateRule, ValidationIssue, ValidationResult
} from "./index.js";

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface Field {
  element: HTMLElement;
  name: string;
  path: readonly string[];
  format: readonly RuleCall<FormatRule>[];
  validate: readonly RuleCall<ValidateRule>[];
  error?: HTMLElement;
  describedBy: string | null;
  invalid: string | null;
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

function display(element: HTMLElement, value: unknown): void {
  if (!control(element)) {
    element.textContent = value == null ? "" : String(value);
  } else if (element.localName === "input" && (element as HTMLInputElement).type === "checkbox") {
    (element as HTMLInputElement).checked = value === true;
  } else {
    element.value = value == null ? "" : String(value);
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
  const fields: Field[] = elements.map(element => {
    const name = element.getAttribute("data-field")!;
    const input = element.localName === "input" ? element as HTMLInputElement : null;
    if (input?.type === "file") {
      if (rows) throw formError("FORM_FILE_ROWS", "File inputs require a local Form; Rows store JSON values.", { field: name });
      if (input.multiple) throw formError("FORM_FILE_MULTIPLE", "Validate multiple files in application code.", { field: name });
    }
    const format = runner.formats(element, name);
    if (format.length && !formatCapable(element)) {
      throw formError("FORM_FORMAT_CONTROL", "Formatting requires a text field.", { field: name });
    }
    return {
      element, name, path: parsePath(name),
      format,
      validate: runner.validators(element, name),
      error: errorRegions.get(name),
      describedBy: element.getAttribute("aria-describedby"),
      invalid: element.getAttribute("aria-invalid")
    };
  });
  const byElement = new Map(fields.map(field => [field.element, field]));
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
    const tokens = new Set((field.describedBy ?? "").split(/\s+/).filter(Boolean));
    tokens.add(id);
    field.element.setAttribute("aria-describedby", [...tokens].join(" "));
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
    for (const field of fields) values = writePath(values, field.path, inputValue(field.element));
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
    const parsed = new Map<Field, Candidate>();
    for (const [field, input] of entered) {
      let value = input;
      let parseError: string | undefined;
      let parseFailed = false;
      const parser = parse?.[field.name];
      if (parser) {
        try { value = parser(String(input ?? ""), context(field, id, values)); }
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
    if (control(field.element)) {
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
      if (fieldIssues.length) field.element.setAttribute("aria-invalid", "true");
      else if (field.invalid === null) field.element.removeAttribute("aria-invalid");
      else field.element.setAttribute("aria-invalid", field.invalid);
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
      const focused = field.element === root.ownerDocument.activeElement;
      if (skipFocused && focused) continue;
      if (currentDrafts?.has(field)) {
        display(field.element, currentDrafts.get(field));
        continue;
      }
      const raw = source ? readPath(source, field.path) : "";
      display(field.element, source && !focused && field.format.length
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
      currentDrafts.set(field, inputValue(field.element));
      drafts.set(boundId, currentDrafts);
      reconcile(boundId);
      return;
    }
    const entered = new Map(fields.map(item => [item, inputValue(item.element)] as const));
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
    if (!field || !control(field.element) || !rows || boundId === null || drafts.get(boundId)?.has(field)) return;
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
    if (!field || !control(field.element) || !rows || boundId === null || drafts.get(boundId)?.has(field)) return;
    const source = rowValue(boundId);
    const raw = readPath(source, field.path);
    display(field.element, !field.format.length
      ? raw : runner.format(field.format, raw, context(field, boundId, source)));
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
        const entered = new Map(fields.map(field => [field, inputValue(field.element)] as const));
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
      root.removeEventListener("input", onInput);
      root.removeEventListener("change", onInput);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerup", onPointerEnd);
      root.removeEventListener("pointercancel", onPointerEnd);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      for (const field of fields) {
        if (field.describedBy === null) field.element.removeAttribute("aria-describedby");
        else field.element.setAttribute("aria-describedby", field.describedBy);
        if (field.invalid === null) field.element.removeAttribute("aria-invalid");
        else field.element.setAttribute("aria-invalid", field.invalid);
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
