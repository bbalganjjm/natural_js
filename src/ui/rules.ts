// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { builtinFormats, assertFormatArgs } from "./format-rules.js";
import { builtinValidators, builtinMessages, assertValidateArgs } from "./validate-rules.js";
import type { FormatRule, RuleContext, RuleSet, ValidateRule, ValidationIssue } from "./index.js";

export interface RuleCall<Run> {
  readonly name: string;
  readonly key: string;
  readonly args: readonly unknown[];
  readonly run: Run;
}

export interface RuleRunner {
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

function parse(element: Element, field: string, attribute: "data-format" | "data-validate",
  api: string): readonly { name: string; key: string; args: readonly unknown[] }[] {
  const source = element.getAttribute(attribute);
  if (source === null) return [];
  let declarations: unknown;
  try { declarations = JSON.parse(source); }
  catch (cause) {
    throw ruleError(api, "RULE_DECLARATION", `${attribute} must be a JSON rule list.`, field, undefined, cause);
  }
  if (!Array.isArray(declarations)) {
    throw ruleError(api, "RULE_DECLARATION", `${attribute} must be a JSON rule list.`, field);
  }
  return declarations.map((entry: unknown) => {
    if (!Array.isArray(entry) || typeof entry[0] !== "string" || !entry[0].trim()) {
      throw ruleError(api, "RULE_DECLARATION", `${attribute} contains an invalid rule.`, field);
    }
    const name = entry[0] as string;
    return { name, key: ruleKey(name), args: entry.slice(1) };
  });
}

function compile<Run>(element: Element, field: string, attribute: "data-format" | "data-validate",
  api: string, custom: Map<string, Run>, builtins: Readonly<Record<string, Run>>,
  assertArgs: (name: string, args: readonly unknown[]) => void): readonly RuleCall<Run>[] {
  return parse(element, field, attribute, api).map(({ name, key, args }) => {
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
  const messages = suppliedMessages(api, rules?.messages);
  const locale: "ko_KR" | "en_US" = rules?.locale?.toLowerCase().startsWith("ko") ? "ko_KR" : "en_US";

  function message(call: RuleCall<ValidateRule>, field: string): string {
    const template = messages.get(call.key) ??
      (Object.hasOwn(builtinMessages[locale], call.key) ? builtinMessages[locale][call.key] : undefined) ??
      `${field} failed ${call.name}.`;
    return template.replace(/\{(\d+)\}/g, (_, index: string) => String(call.args[Number(index)] ?? ""));
  }

  return {
    formats: (element, field) => compile(element, field, "data-format", api,
      formats, builtinFormats, assertFormatArgs),
    validators: (element, field) => compile(element, field, "data-validate", api,
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

function suppliedMessages(api: string, entries: Record<string, string> | undefined): Map<string, string> {
  const result = new Map<string, string>();
  for (const [name, message] of Object.entries(entries ?? {})) {
    if (typeof message !== "string" || !message.trim() || result.has(ruleKey(name))) {
      throw ruleError(api, "RULE_DECLARATION", "A rule message must have one nonempty text.");
    }
    result.set(ruleKey(name), message);
  }
  return result;
}
