// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { builtinFormats, assertFormatArgs } from "./format-rules.js";
import { builtinValidators, builtinMessages, assertValidateArgs } from "./validate-rules.js";
import { parsePath } from "./field-path.js";
import type { FormatRule, RuleContext, RuleSet, ValidateRule, ValidationIssue } from "./index.js";

export interface RuleCall<Run> {
  readonly name: string;
  readonly key: string;
  readonly args: readonly unknown[];
  readonly run: Run;
}

export interface RuleRunner {
  configured(field: string, attribute: "data-format" | "data-validate"): boolean;
  formats(element: Element, field: string): readonly RuleCall<FormatRule>[];
  validators(element: Element, field: string): readonly RuleCall<ValidateRule>[];
  format(calls: readonly RuleCall<FormatRule>[], value: unknown, context: RuleContext): string;
  validate(calls: readonly RuleCall<ValidateRule>[], value: unknown, context: RuleContext): ValidationIssue[];
}

const combined = new Set(["alphabet", "integer", "korean", "dash", "commas"]);

function ruleKey(name: string): string {
  const value = name.trim().toLowerCase();
  const parts = value.split(/[+_]/).map(part => part.trim());
  return parts.length > 1 && parts.every(part => combined.has(part))
    ? parts.sort().join("_") : value;
}

function ruleError(api: string, code: string, message: string,
  field?: string, rule?: string, cause?: unknown): FrameworkError {
  return new FrameworkError({
    api, code, message, cause,
    detail: field === undefined ? undefined : { field, ...(rule === undefined ? {} : { rule }) }
  });
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

function html(element: Element, field: string, attribute: "data-format" | "data-validate",
  api: string): unknown {
  const source = element.getAttribute(attribute);
  if (source === null) return [];
  try { return JSON.parse(source); }
  catch (cause) {
    throw ruleError(api, "RULE_DECLARATION", `${attribute} must be a JSON rule list.`, field, undefined, cause);
  }
}

function parse(declarations: unknown, field: string, attribute: "data-format" | "data-validate",
  api: string): readonly { name: string; key: string; args: readonly unknown[] }[] {
  if (!Array.isArray(declarations)) {
    throw ruleError(api, "RULE_DECLARATION", `${attribute} must be a rule list.`, field);
  }
  return Array.from(declarations, (entry: unknown) => {
    if (!Array.isArray(entry) || typeof entry[0] !== "string" || !entry[0].trim()) {
      throw ruleError(api, "RULE_DECLARATION", `${attribute} contains an invalid rule.`, field);
    }
    const name = entry[0] as string;
    return { name, key: ruleKey(name), args: entry.slice(1) };
  });
}

function compile<Run>(declarations: unknown, field: string, attribute: "data-format" | "data-validate",
  api: string, custom: Map<string, Run>, builtins: Readonly<Record<string, Run>>,
  assertArgs: (name: string, args: readonly unknown[]) => void): readonly RuleCall<Run>[] {
  return parse(declarations, field, attribute, api).map(({ name, key, args }) => {
    const override = custom.get(key);
    const run = override ?? (Object.hasOwn(builtins, key) ? builtins[key] : undefined);
    if (typeof run !== "function") {
      throw ruleError(api, "RULE_UNKNOWN", `Rule ${name} is not available for ${field}.`, field, name);
    }
    if (!override) {
      try { assertArgs(key, args); }
      catch (cause) {
        throw ruleError(api, "RULE_ARGUMENT", `Rule ${name} has invalid arguments for ${field}.`, field, name, cause);
      }
    }
    return { name, key, args, run };
  });
}

export function createRuleRunner(api: string, rules?: RuleSet): RuleRunner {
  const formats = supplied(api, rules?.format);
  const validators = supplied(api, rules?.validate);
  const { messages: messagePolicy, locale: localePolicy } = rules ?? {};
  if (localePolicy !== undefined && typeof localePolicy !== "string" && typeof localePolicy !== "function") {
    throw ruleError(api, "RULE_DECLARATION", "locale must be text or a function.");
  }
  const messages = typeof messagePolicy === "function" ? new Map<string, string>() : suppliedMessages(api, messagePolicy);
  const locale: "ko_KR" | "en_US" = typeof localePolicy !== "function" && localePolicy?.toLowerCase().startsWith("ko") ? "ko_KR" : "en_US";
  const fields = new Map<string, { format?: readonly RuleCall<FormatRule>[]; validate?: readonly RuleCall<ValidateRule>[] }>();
  if (rules?.fields !== undefined) {
    if (!rules.fields || typeof rules.fields !== "object" || Array.isArray(rules.fields)) {
      throw ruleError(api, "RULE_DECLARATION", "fields must be a field-to-rule object.");
    }
    for (const [field, value] of Object.entries(rules.fields)) {
      try { parsePath(field); }
      catch (cause) { throw ruleError(api, "RULE_DECLARATION", "Field rules need a safe data-field path.", field, undefined, cause); }
      if (!value || typeof value !== "object" || Array.isArray(value) ||
          Object.keys(value).some(key => key !== "format" && key !== "validate")) {
        throw ruleError(api, "RULE_DECLARATION", "A field rule entry accepts format and validate lists.", field);
      }
      fields.set(field, {
        ...(Object.hasOwn(value, "format") && value.format !== undefined
          ? { format: compile(value.format, field, "data-format", api, formats, builtinFormats, assertFormatArgs) } : {}),
        ...(Object.hasOwn(value, "validate") && value.validate !== undefined
          ? { validate: compile(value.validate, field, "data-validate", api, validators, builtinValidators, assertValidateArgs) } : {})
      });
    }
  }

  function message(call: RuleCall<ValidateRule>, field: string): string {
    let currentLocale = locale, currentMessages = messages;
    try {
      if (typeof localePolicy === "function") {
        const value = localePolicy();
        if (typeof value !== "string") {
          if (value !== null && (typeof value === "object" || typeof value === "function") &&
              typeof (value as { then?: unknown }).then === "function") void Promise.resolve(value).catch(() => {});
          throw new TypeError("A locale provider must return text.");
        }
        currentLocale = value.toLowerCase().startsWith("ko") ? "ko_KR" : "en_US";
      }
      if (typeof messagePolicy === "function") {
        const value = messagePolicy();
        if (value === undefined) throw new TypeError("A message provider must return a message object.");
        currentMessages = suppliedMessages(api, value);
      }
    } catch (cause) {
      throw ruleError(api, "RULE_FAILED", "Rule message policy failed for " + field + ".", field, call.name, cause);
    }
    const template = currentMessages.get(call.key) ??
      (Object.hasOwn(builtinMessages[currentLocale], call.key) ? builtinMessages[currentLocale][call.key] : undefined) ??
      `${field} failed ${call.name}.`;
    return template.replace(/\{(\d+)\}/g, (_, index: string) => String(call.args[Number(index)] ?? ""));
  }

  return {
    configured: (field, attribute) => fields.get(field)?.[attribute === "data-format" ? "format" : "validate"] !== undefined,
    formats: (element, field) => fields.get(field)?.format ?? compile(html(element, field, "data-format", api), field, "data-format", api,
      formats, builtinFormats, assertFormatArgs),
    validators: (element, field) => fields.get(field)?.validate ?? compile(html(element, field, "data-validate", api), field, "data-validate", api,
      validators, builtinValidators, assertValidateArgs),
    format(calls, value, context) {
      let text = String(value ?? "");
      for (const call of calls) {
        try { text = call.run(text, call.args, context); }
        catch (cause) {
          throw ruleError(api, "RULE_FAILED", `Formatter ${call.name} failed for ${context.field}.`,
            context.field, call.name, cause);
        }
        if (typeof text !== "string") {
          throw ruleError(api, "RULE_FAILED", `Formatter ${call.name} did not return text.`,
            context.field, call.name);
        }
      }
      return text;
    },
    validate(calls, value, context) {
      if (String(value ?? "").trim() === "" &&
          !calls.some(call => call.key === "required")) return [];
      const issues: ValidationIssue[] = [];
      for (const call of calls) {
        let result: boolean | string;
        try {
          result = call.key === "required" && call.run === builtinValidators.required && value === false
            ? false : call.run(String(value ?? ""), call.args, context);
        }
        catch (cause) {
          throw ruleError(api, "RULE_FAILED", `Validator ${call.name} failed for ${context.field}.`,
            context.field, call.name, cause);
        }
        if (result !== true) {
          issues.push({ rowId: context.rowId, field: context.field, rule: call.name,
            message: typeof result === "string" && result.trim() ? result : message(call, context.field),
            ...(context.element ? { element: context.element } : {}) });
        }
      }
      return issues;
    }
  };
}

function suppliedMessages(api: string, entries: unknown): Map<string, string> {
  const result = new Map<string, string>();
  if (entries !== undefined && (entries === null || typeof entries !== "object" || Array.isArray(entries) ||
      typeof (entries as { then?: unknown }).then === "function")) {
    if (entries !== null && (typeof entries === "object" || typeof entries === "function") &&
      typeof (entries as { then?: unknown }).then === "function") void Promise.resolve(entries).catch(() => {});
    throw ruleError(api, "RULE_DECLARATION", "messages must be a synchronous message object.");
  }
  for (const [name, message] of Object.entries(entries ?? {})) {
    if (typeof message !== "string" || !message.trim() || result.has(ruleKey(name))) {
      throw ruleError(api, "RULE_DECLARATION", "A rule message must have one nonempty text.");
    }
    result.set(ruleKey(name), message);
  }
  return result;
}
