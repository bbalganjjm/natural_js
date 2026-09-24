// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { RowId, Rows } from "../data/index.js";
import { parsePath, readPath, writePath } from "./field-path.js";
import type {
  FormHandle, FormatRule, ParseInput, RuleContext, RuleSet,
  ValidateRule, ValidationIssue, ValidationResult
} from "./index.js";

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type RuleCall<Run> = { name: string; args: readonly unknown[]; run: Run };

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

let nextErrorId = 0;
const boundRoots = new WeakSet<HTMLElement>();

function formError(code: string, message: string, detail?: Record<string, unknown>, cause?: unknown): FrameworkError {
  return new FrameworkError({ api: "bindForm", code, message, detail, cause });
}

function control(element: HTMLElement): element is Control {
  return element.localName === "input" || element.localName === "select" || element.localName === "textarea";
}

function inputValue(element: HTMLElement): unknown {
  if (!control(element)) return element.textContent ?? "";
  if (element.localName === "input" && (element as HTMLInputElement).type === "checkbox") {
    return (element as HTMLInputElement).checked;
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

function ruleCalls<Run>(
  element: HTMLElement, field: string, attribute: "data-format" | "data-validate",
  available: Record<string, Run> | undefined
): readonly RuleCall<Run>[] {
  const source = element.getAttribute(attribute);
  if (source === null) return [];
  let declarations: unknown;
  try { declarations = JSON.parse(source); } catch (cause) {
    throw formError("RULE_DECLARATION", `${attribute} must be a JSON rule list.`, { field }, cause);
  }
  if (!Array.isArray(declarations)) {
    throw formError("RULE_DECLARATION", `${attribute} must be a JSON rule list.`, { field });
  }
  return declarations.map((entry: unknown): RuleCall<Run> => {
    if (!Array.isArray(entry) || typeof entry[0] !== "string" || !entry[0].trim()) {
      throw formError("RULE_DECLARATION", `${attribute} contains an invalid rule.`, { field });
    }
    const name = entry[0];
    const key = Object.keys(available ?? {}).find(candidate => candidate.toLowerCase() === name.toLowerCase());
    const run = key === undefined ? undefined : available?.[key];
    if (typeof run !== "function") {
      throw formError("RULE_UNKNOWN", `Rule ${name} is not available for ${field}.`, { field, rule: name });
    }
    return { name, args: entry.slice(1), run };
  });
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
    const path = parsePath(name);
    const error = errorRegions.get(name);
    return {
      element, name, path,
      format: ruleCalls(element, name, "data-format", rules?.format),
      validate: ruleCalls(element, name, "data-validate", rules?.validate),
      error,
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
  const drafts = new Map<Field, unknown>();
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
    let result: Record<string, unknown> = {};
    for (const field of fields) {
      result = writePath(result, field.path, inputValue(field.element));
    }
    return result;
  }

  function context(field: Field, id: RowId | null, candidate: unknown, source: Record<string, unknown>): RuleContext {
    return {
      field: field.name,
      values: writePath(source, field.path, candidate),
      rowId: id,
      ...(id === null || id === boundId ? { element: field.element } : {})
    };
  }

  function issue(field: Field, id: RowId | null, rule: string, message: string): ValidationIssue {
    return {
      field: field.name, rowId: id, rule, message,
      ...(id === null || id === boundId ? { element: field.element } : {})
    };
  }

  function check(
    field: Field, id: RowId | null, entered: unknown,
    source: Record<string, unknown>, fromInput: boolean
  ): { value: unknown; issues: readonly ValidationIssue[] } {
    let value = entered;
    const parser = parse?.[field.name];
    if (parser && fromInput) {
      try { value = parser(String(entered ?? ""), context(field, id, entered, source)); }
      catch (cause) {
        const message = cause instanceof Error ? cause.message : "Input could not be parsed.";
        return { value: entered, issues: [issue(field, id, "parse", message)] };
      }
    }
    const found: ValidationIssue[] = [];
    if (control(field.element)) {
      const current = id === null || id === boundId;
      const probe = current && fromInput ? field.element : field.element.cloneNode(true) as Control;
      if (probe !== field.element) display(probe, value);
      if (!probe.validity.valid) {
        found.push(issue(field, id, "html", probe.validationMessage || "Invalid input."));
      }
    }
    const ruleContext = context(field, id, value, source);
    for (const { name, args, run } of field.validate) {
      let result: boolean | string;
      try { result = run(String(value ?? ""), args, ruleContext); }
      catch (cause) {
        throw formError("RULE_FAILED", `Validator ${name} failed for ${field.name}.`,
          { field: field.name, rule: name }, cause);
      }
      if (result !== true) {
        const message = typeof result === "string" ? result :
          rules?.messages?.[name] ?? `${field.name} failed ${name}.`;
        found.push(issue(field, id, name, message));
      }
    }
    return { value, issues: found };
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
    for (const region of regionState.keys()) {
      region.textContent = (messages.get(region) ?? []).join(" ");
    }
  }

  function formatted(field: Field, value: unknown, source: Record<string, unknown>): unknown {
    if (!field.format.length || value == null) return value;
    let text = String(value);
    const ruleContext = context(field, boundId, value, source);
    for (const { name, args, run } of field.format) {
      try { text = run(text, args, ruleContext); }
      catch (cause) {
        throw formError("RULE_FAILED", `Formatter ${name} failed for ${field.name}.`,
          { field: field.name, rule: name }, cause);
      }
    }
    return text;
  }

  function render(skipFocused = false): void {
    const source = boundId === null ? null : rowValue(boundId);
    for (const field of fields) {
      if (skipFocused && field.element === root.ownerDocument.activeElement) continue;
      if (drafts.has(field)) continue;
      const raw = source ? readPath(source, field.path) : "";
      display(field.element, source ? formatted(field, raw, source) : "");
    }
  }

  function onInput(event: Event): void {
    if (disposed || !event.target || !(event.target instanceof HTMLElement)) return;
    const field = byElement.get(event.target);
    if (!field || !control(field.element)) return;
    if (rows && boundId === null) return;
    const id = boundId;
    const source = rows ? rowValue(id!) : localValues();
    const entered = inputValue(field.element);
    const result = check(field, id, entered, source, true);
    if (result.issues.length) drafts.set(field, entered);
    else {
      drafts.delete(field);
      if (rows) {
        const next = writePath(source, field.path, result.value);
        const key = field.path[0] as keyof T;
        rows.set(id!, key, next[field.path[0]] as T[keyof T]);
      }
    }
    issues.set(field, result.issues);
    showIssues();
  }

  function onFocusIn(event: FocusEvent): void {
    if (disposed || !event.target || !(event.target instanceof HTMLElement)) return;
    const field = byElement.get(event.target);
    if (!field || !control(field.element) || drafts.has(field) || !rows || boundId === null) return;
    display(field.element, readPath(rowValue(boundId), field.path));
  }

  function onFocusOut(event: FocusEvent): void {
    if (disposed || !event.target || !(event.target instanceof HTMLElement)) return;
    const field = byElement.get(event.target);
    if (!field || !control(field.element) || drafts.has(field) || !rows || boundId === null) return;
    const source = rowValue(boundId);
    display(field.element, formatted(field, readPath(source, field.path), source));
  }

  root.addEventListener("input", onInput);
  root.addEventListener("change", onInput);
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  const unsubscribe = rows?.subscribe(() => {
    if (disposed || boundId === null) return;
    const row = rows.get(boundId);
    if (!row || row.status === "delete") {
      boundId = null;
      drafts.clear();
      issues.clear();
      render();
      showIssues();
      return;
    }
    render(true);
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
      drafts.clear();
      issues.clear();
      if (rows) render();
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
      const target = id ?? boundId;
      if (rows && target === null) return { valid: true, issues: [] };
      const source = rows ? rowValue(target!) : localValues();
      const found: ValidationIssue[] = [];
      for (const field of fields) {
        const useInput = !rows || target === boundId && drafts.has(field);
        const entered = useInput ? inputValue(field.element) : readPath(source, field.path);
        const result = check(field, target, entered, source, useInput);
        found.push(...result.issues);
        if (!rows || target === boundId) issues.set(field, result.issues);
      }
      if (!rows || target === boundId) showIssues();
      return { valid: found.length === 0, issues: found };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      boundRoots.delete(root);
      unsubscribe?.();
      root.removeEventListener("input", onInput);
      root.removeEventListener("change", onInput);
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
