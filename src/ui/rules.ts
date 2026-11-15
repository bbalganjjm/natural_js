// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { builtinFormats, assertFormatArgs } from "./format-rules.js";
import { builtinValidators, builtinMessages, assertValidateArgs } from "./validate-rules.js";
import { parsePath } from "./field-path.js";
import type { FormatRule, RuleContext, RuleSet, ValidateRule, ValidationIssue, ValidationResult } from "./index.js";

export interface RuleCall<Run> {
  readonly name: string;
  readonly key: string;
  readonly args: readonly unknown[];
  readonly run: Run;
}

type Checkpoint = (cause?: unknown) => void;
type Attribute = "data-format" | "data-validate";
type RuleCheck = { readonly rule: string; readonly args: readonly unknown[]; readonly valid: boolean; readonly message: string | null };

export interface RuleDeclarations {
  configured(field: string, attribute: Attribute): boolean;
  formats(source: Element | string | null, field: string, checkpoint?: Checkpoint): readonly RuleCall<FormatRule>[];
  validators(source: Element | string | null, field: string, checkpoint?: Checkpoint): readonly RuleCall<ValidateRule>[];
}

export interface RuleRunner extends RuleDeclarations {
  readonly running: boolean;
  candidate(checkpoint?: Checkpoint): RuleDeclarations;
  adopt(candidate: RuleDeclarations): RuleDeclarations;
  format(calls: readonly RuleCall<FormatRule>[], value: unknown, context: RuleContext): string;
  validate(calls: readonly RuleCall<ValidateRule>[], value: unknown, context: RuleContext,
    checkpoint?: Checkpoint, checks?: RuleCheck[]): ValidationIssue[];
}

export function sameRuleCalls<Run>(left: readonly RuleCall<Run>[], right: readonly RuleCall<Run>[]): boolean {
  return left.length === right.length && left.every((call, index) => {
    const other = right[index];
    return call.name === other.name && call.key === other.key && call.run === other.run &&
      call.args.length === other.args.length && call.args.every((value, argument) => Object.is(value, other.args[argument]));
  });
}

const combined = new Set(["alphabet", "integer", "korean", "dash", "commas"]);
const byteRules = new Set(["maxbyte", "minbyte", "rangebyte"]);

function ruleKey(name: string): string {
  const value = name.trim().toLowerCase();
  const parts = value.split(/[+_]/).map(part => part.trim());
  return parts.length > 1 && parts.every(part => combined.has(part)) ? parts.sort().join("_") : value;
}

function ruleError(api: string, code: string, message: string,
  field?: string, rule?: string, cause?: unknown): FrameworkError {
  return new FrameworkError({ api, code, message, cause,
    detail: field === undefined ? undefined : { field, ...(rule === undefined ? {} : { rule }) } });
}

function observed<T>(read: () => T, checkpoint?: Checkpoint): T {
  checkpoint?.();
  let value: T;
  try { value = read(); }
  catch (cause) { checkpoint?.(cause); throw cause; }
  checkpoint?.();
  return value;
}

function supplied<Run>(api: string, entries: Record<string, Run> | undefined): Map<string, Run> {
  const result = new Map<string, Run>();
  for (const [name, run] of Object.entries(entries ?? {})) {
    const key = ruleKey(name);
    if (!key || typeof run !== "function" || result.has(key)) {
      throw ruleError(api, "RULE_DECLARATION", `Rule ${name} must have one function.`, undefined, name);
    }
    result.set(key, run);
  }
  return result;
}

function html(source: Element | string | null, field: string, attribute: Attribute,
  api: string, checkpoint?: Checkpoint): unknown {
  const text = observed(() => typeof source === "string" || source === null ? source : source.getAttribute(attribute), checkpoint);
  if (text === null) return [];
  try { return JSON.parse(text); }
  catch (cause) { throw ruleError(api, "RULE_DECLARATION", `${attribute} must be a JSON rule list.`, field, undefined, cause); }
}

function compile<Run>(declarations: unknown, field: string, attribute: Attribute, api: string,
  custom: Map<string, Run>, builtins: Readonly<Record<string, Run>>,
  assertArgs: (name: string, args: readonly unknown[]) => void, checkpoint?: Checkpoint): readonly RuleCall<Run>[] {
  if (!Array.isArray(declarations)) throw ruleError(api, "RULE_DECLARATION", `${attribute} must be a rule list.`, field);
  const result: RuleCall<Run>[] = [];
  const length = observed(() => declarations.length, checkpoint);
  for (let index = 0; index < length; index++) {
    const entry: unknown = observed(() => declarations[index], checkpoint);
    if (!Array.isArray(entry)) throw ruleError(api, "RULE_DECLARATION", `${attribute} contains an invalid rule.`, field);
    const name: unknown = observed(() => entry[0], checkpoint);
    if (typeof name !== "string" || !name.trim()) throw ruleError(api, "RULE_DECLARATION", `${attribute} contains an invalid rule.`, field);
    const args: unknown[] = [], size = observed(() => entry.length, checkpoint);
    for (let argument = 1; argument < size; argument++) args.push(observed(() => entry[argument], checkpoint));
    const key = ruleKey(name), override = custom.get(key);
    const run = override ?? (Object.hasOwn(builtins, key) ? builtins[key] : undefined);
    if (typeof run !== "function") throw ruleError(api, "RULE_UNKNOWN", `Rule ${name} is not available for ${field}.`, field, name);
    if (!override) {
      try { assertArgs(key, args); }
      catch (cause) { throw ruleError(api, "RULE_ARGUMENT", `Rule ${name} has invalid arguments for ${field}.`, field, name, cause); }
    }
    result.push({ name, key, args, run });
  }
  return result;
}

function drain(value: unknown): void {
  if (value !== null && (typeof value === "object" || typeof value === "function") &&
      typeof (value as { then?: unknown }).then === "function") void Promise.resolve(value).catch(() => {});
}

function suppliedMessages(api: string, entries: unknown, checkpoint?: Checkpoint): Map<string, string> {
  const result = new Map<string, string>();
  if (entries !== undefined && (entries === null || typeof entries !== "object" || Array.isArray(entries) ||
      typeof (entries as { then?: unknown }).then === "function")) {
    drain(entries);
    throw ruleError(api, "RULE_DECLARATION", "messages must be a synchronous message object.");
  }
  checkpoint?.();
  for (const name of observed(() => Object.keys(entries ?? {}), checkpoint)) {
    const message = observed(() => (entries as Record<string, unknown>)[name], checkpoint);
    if (typeof message !== "string" || !message.trim() || result.has(ruleKey(name))) {
      throw ruleError(api, "RULE_DECLARATION", "A rule message must have one nonempty text.");
    }
    result.set(ruleKey(name), message);
  }
  return result;
}

function width(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) throw new TypeError("byteWidth must be a positive integer.");
  return value;
}

export function createRuleRunner(api: string, rules?: RuleSet): RuleRunner {
  const formats = supplied(api, rules?.format), validators = supplied(api, rules?.validate);
  const { fields: fieldSource, messages: messagePolicy, locale: localePolicy, byteWidth: bytePolicy = 3 } = rules ?? {};
  if (localePolicy !== undefined && typeof localePolicy !== "string" && typeof localePolicy !== "function") {
    throw ruleError(api, "RULE_DECLARATION", "locale must be text or a function.");
  }
  if (typeof bytePolicy !== "function") {
    try { width(bytePolicy); }
    catch (cause) { throw ruleError(api, "RULE_DECLARATION", "byteWidth must be a positive integer or a function.", undefined, undefined, cause); }
  }
  const messages = typeof messagePolicy === "function" ? new Map<string, string>() : suppliedMessages(api, messagePolicy);
  const locale = typeof localePolicy !== "function" && localePolicy?.toLowerCase().startsWith("ko") ? "ko_KR" : "en_US";

  function candidate(checkpoint?: Checkpoint): RuleDeclarations {
    checkpoint?.();
    const fields = new Map<string, { format?: readonly RuleCall<FormatRule>[]; validate?: readonly RuleCall<ValidateRule>[] }>();
    if (fieldSource !== undefined) {
      if (!fieldSource || typeof fieldSource !== "object" || Array.isArray(fieldSource)) {
        throw ruleError(api, "RULE_DECLARATION", "fields must be a field-to-rule object.");
      }
      for (const field of observed(() => Object.keys(fieldSource), checkpoint)) {
        try { parsePath(field); }
        catch (cause) { throw ruleError(api, "RULE_DECLARATION", "Field rules need a safe data-field path.", field, undefined, cause); }
        const value: unknown = observed(() => fieldSource[field], checkpoint);
        if (!value || typeof value !== "object" || Array.isArray(value) ||
            observed(() => Object.keys(value), checkpoint).some(key => key !== "format" && key !== "validate")) {
          throw ruleError(api, "RULE_DECLARATION", "A field rule entry accepts format and validate lists.", field);
        }
        const format = observed(() => Object.hasOwn(value, "format") ? (value as { format?: unknown }).format : undefined, checkpoint);
        const validate = observed(() => Object.hasOwn(value, "validate") ? (value as { validate?: unknown }).validate : undefined, checkpoint);
        fields.set(field, {
          ...(format === undefined ? {} : { format: compile(format, field, "data-format", api, formats, builtinFormats, assertFormatArgs, checkpoint) }),
          ...(validate === undefined ? {} : { validate: compile(validate, field, "data-validate", api, validators, builtinValidators, assertValidateArgs, checkpoint) })
        });
      }
    }
    checkpoint?.();
    return {
      configured: (field, attribute) => fields.get(field)?.[attribute === "data-format" ? "format" : "validate"] !== undefined,
      formats: (source, field, current) => fields.get(field)?.format ?? compile(html(source, field, "data-format", api, current), field,
        "data-format", api, formats, builtinFormats, assertFormatArgs, current),
      validators: (source, field, current) => fields.get(field)?.validate ?? compile(html(source, field, "data-validate", api, current), field,
        "data-validate", api, validators, builtinValidators, assertValidateArgs, current)
    };
  }

  let accepted = candidate(), depth = 0;

  function message(call: RuleCall<ValidateRule>, args: readonly unknown[], field: string, checkpoint?: Checkpoint): string {
    let currentLocale: "ko_KR" | "en_US" = locale, currentMessages = messages;
    if (typeof localePolicy === "function") {
      checkpoint?.();
      try {
        const value = localePolicy();
        if (typeof value !== "string") { drain(value); throw new TypeError("A locale provider must return text."); }
        currentLocale = value.toLowerCase().startsWith("ko") ? "ko_KR" : "en_US";
      } catch (cause) {
        checkpoint?.(cause);
        throw ruleError(api, "RULE_FAILED", "Rule message policy failed for " + field + ".", field, call.name, cause);
      }
      checkpoint?.();
    }
    if (typeof messagePolicy === "function") {
      checkpoint?.();
      try {
        const value = messagePolicy();
        if (value === undefined) throw new TypeError("A message provider must return a message object.");
        currentMessages = suppliedMessages(api, value, checkpoint);
      } catch (cause) {
        checkpoint?.(cause);
        throw ruleError(api, "RULE_FAILED", "Rule message policy failed for " + field + ".", field, call.name, cause);
      }
      checkpoint?.();
    }
    const builtin = builtinMessages[currentLocale];
    const template = currentMessages.get(call.key) ?? (Object.hasOwn(builtin, call.key) ? builtin[call.key] : undefined) ??
      currentMessages.get("global") ?? builtin.global ?? `${field} failed ${call.name}.`;
    try { return template.replace(/\{(\d+)\}/g, (_, index: string) => String(args[Number(index)] ?? "")); }
    catch (cause) {
      checkpoint?.(cause);
      throw ruleError(api, "RULE_FAILED", "Rule message policy failed for " + field + ".", field, call.name, cause);
    }
  }

  return {
    get running() { return depth > 0; },
    candidate,
    adopt(view) { const previous = accepted; accepted = view; return previous; },
    configured: (field, attribute) => accepted.configured(field, attribute),
    formats: (source, field, checkpoint) => accepted.formats(source, field, checkpoint),
    validators: (source, field, checkpoint) => accepted.validators(source, field, checkpoint),
    format(calls, value, context) {
      depth++;
      try {
        let text = String(value ?? "");
        for (const { name, args, run } of calls) {
          try {
            const result = run(text, args, context);
            if (typeof result !== "string") { drain(result); throw new TypeError("A formatter must return text."); }
            text = result;
          } catch (cause) {
            throw ruleError(api, "RULE_FAILED", `Formatter ${name} failed for ${context.field}.`, context.field, name, cause);
          }
        }
        return text;
      } finally { depth--; }
    },
    validate(calls, value, context, checkpoint, checks) {
      depth++;
      try {
        checkpoint?.();
        let empty: boolean;
        try { empty = String(value ?? "").trim() === ""; }
        catch (cause) { checkpoint?.(cause); throw ruleError(api, "RULE_FAILED", "Validation input could not be read.", context.field, undefined, cause); }
        checkpoint?.();
        if (empty && !calls.some(call => call.key === "required")) {
          if (checks) for (const call of calls) checks.push({ rule: call.name, args: [...call.args], valid: true, message: null });
          return [];
        }
        const issues: ValidationIssue[] = [];
        for (const call of calls) {
          const { name, key, run } = call;
          let args = call.args, result: boolean | string;
          checkpoint?.();
          try {
            if (byteRules.has(key) && run === builtinValidators[key]) {
              const index = key === "rangebyte" ? 2 : 1;
              if (args[index] === undefined) {
                const size = typeof bytePolicy === "function" ? bytePolicy() : bytePolicy;
                if (typeof size !== "number") drain(size);
                args = [...args.slice(0, index), width(size)];
              }
            }
          } catch (cause) {
            checkpoint?.(cause);
            throw ruleError(api, "RULE_FAILED", "Rule byte policy failed for " + context.field + ".", context.field, name, cause);
          }
          checkpoint?.();
          let input: string;
          try { input = String(value ?? ""); }
          catch (cause) {
            checkpoint?.(cause);
            throw ruleError(api, "RULE_FAILED", `Validator ${name} failed for ${context.field}.`, context.field, name, cause);
          }
          checkpoint?.();
          try {
            result = key === "required" && run === builtinValidators.required && value === false ? false : run(input, args, context);
            if (typeof result !== "boolean" && typeof result !== "string") { drain(result); throw new TypeError("A validator must return boolean or text."); }
          } catch (cause) {
            checkpoint?.(cause);
            throw ruleError(api, "RULE_FAILED", `Validator ${name} failed for ${context.field}.`, context.field, name, cause);
          }
          checkpoint?.();
          const valid = result === true;
          const text = valid ? null : typeof result === "string" && result.trim() ? result : message(call, args, context.field, checkpoint);
          checkpoint?.();
          if (checks) checks.push({ rule: name, args: [...args], valid, message: text });
          if (!valid) issues.push({ rowId: context.rowId, field: context.field, rule: name, message: text!,
            ...(context.element ? { element: context.element } : {}) });
        }
        return issues;
      } finally { depth--; }
    }
  };
}

export function createRules(rules?: RuleSet): {
  format(value: unknown, context: RuleContext): string;
  validate(value: unknown, context: RuleContext): ValidationResult & {
    readonly checks: readonly { readonly rule: string; readonly args: readonly unknown[]; readonly valid: boolean; readonly message: string | null }[];
  };
} {
  const runner = createRuleRunner("createRules", rules);
  function field(context: RuleContext): string {
    const name = context.field;
    try { parsePath(name); }
    catch (cause) { throw ruleError("createRules", "RULE_DECLARATION", "Rules need a safe context.field path.", name, undefined, cause); }
    return name;
  }
  return {
    format: (value, context) => runner.format(runner.formats(null, field(context)), value, context),
    validate(value, context) {
      const checks: RuleCheck[] = [];
      const issues = runner.validate(runner.validators(null, field(context)), value, context, undefined, checks);
      return { valid: issues.length === 0, issues, checks };
    }
  };
}
