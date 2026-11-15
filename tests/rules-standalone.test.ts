// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import { createRules } from "../src/ui/index.js";
import { createRuleRunner, sameRuleCalls } from "../src/ui/rules.js";
import { FrameworkError } from "../src/internal/framework-error.js";
import type { FormatRule, RuleContext, RuleSet, ValidateRule } from "../src/ui/index.js";

const context: RuleContext = { field: "amount", values: { amount: 1 }, rowId: 7 };

describe("standalone and shared rule ownership", () => {
  it("selects complete field lists once and captures custom functions with plain receivers", () => {
    const receivers: unknown[] = [];
    const rules: RuleSet = {
      format: { suffix: function(this: void, value) { receivers.push(this); return value + "!"; } },
      validate: { allowed: function(this: void) { receivers.push(this); return true; } },
      fields: { amount: { format: [["suffix"]], validate: [["allowed"]] } }
    };
    const owner = createRules(rules);
    rules.format!.suffix = () => "wrong";
    rules.validate!.allowed = () => false;
    rules.fields!.amount = { format: [["missing"]], validate: [["missing"]] };
    expect(owner.format(12, context)).toBe("12!");
    expect(owner.validate(12, context).valid).toBe(true);
    expect(receivers).toEqual([undefined, undefined]);
  });

  it("preserves deliberately bound callbacks and nested custom arguments", () => {
    const receiver = { suffix: "?" }, argument = { suffix: "!" };
    const callback: FormatRule = function(this: typeof receiver, value: string, args: readonly unknown[]) {
      return value + this.suffix + (args[0] as typeof argument).suffix;
    }.bind(receiver);
    const tuples: [string, ...unknown[]][] = [["custom", argument]];
    const owner = createRules({ format: { custom: callback }, fields: { amount: { format: tuples } } });
    tuples[0][1] = { suffix: "wrong" };
    argument.suffix = ".";
    expect(owner.format("A", context)).toBe("A?.");
    expect(tuples).toHaveLength(1);
  });

  it("reports duplicates in declaration order and preserves whole-list blank semantics", () => {
    let calls = 0, messages = 0;
    const owner = createRules({ validate: { custom: () => { calls++; return false; } },
      messages: () => { messages++; return {}; }, fields: { amount: { validate: [["custom"], ["custom"]] } } });
    const blank = owner.validate(" ", context);
    expect(blank).toEqual({ valid: true, issues: [], checks: [
      { rule: "custom", args: [], valid: true, message: null }, { rule: "custom", args: [], valid: true, message: null }
    ] });
    expect([calls, messages]).toEqual([0, 0]);
    const required = createRules({ fields: { amount: { validate: [["required"], ["minlength", 3], ["minlength", 5]] } } });
    const report = required.validate("abcd", context);
    expect(report.checks.map(check => [check.rule, check.valid])).toEqual([["required", true], ["minlength", true], ["minlength", false]]);
    expect(report.issues.map(issue => [issue.rule, issue.rowId, issue.field])).toEqual([["minlength", 7, "amount"]]);
    const requiredBlank = required.validate(" ", context);
    expect(requiredBlank.checks.map(check => [check.rule, check.valid])).toEqual([["required", false], ["minlength", false], ["minlength", false]]);
    expect(requiredBlank.issues.map(issue => issue.rule)).toEqual(["required", "minlength", "minlength"]);
    expect(required.validate(false, context).checks[0].valid).toBe(false);
    expect(createRules({ validate: { required: () => true }, fields: { amount: { validate: [["required"]] } } }).validate(false, context).valid).toBe(true);
  });

  it("returns fresh reports and argument containers without cloning nested custom state", () => {
    const nested = { limit: 1 };
    const owner = createRules({ validate: { custom: () => true }, fields: { amount: { validate: [["custom", nested]] } } });
    const first = owner.validate(1, context), second = owner.validate(1, context);
    expect(first.checks).not.toBe(second.checks);
    expect(first.checks[0].args).not.toBe(second.checks[0].args);
    expect(first.checks[0].args[0]).toBe(nested);
    (first.checks[0].args as unknown[]).push("local report change");
    expect(owner.validate(1, context).checks[0].args).toEqual([nested]);
  });

  it("uses exact specific/global fallback precedence and bypasses providers for direct text", () => {
    const events: string[] = [];
    const owner = createRules({ validate: { custom: () => false, direct: () => "  direct text  " },
      locale: () => { events.push("locale"); return "en_US"; },
      messages: () => { events.push("messages"); return { global: "custom global", required: "specific" }; },
      fields: { amount: { validate: [["required"], ["email"], ["custom"], ["direct"]] } } });
    const report = owner.validate("bad", context);
    expect(report.issues.map(issue => issue.message)).toEqual(["Enter an email address.", "custom global", "  direct text  "]);
    expect(events).toEqual(["locale", "messages", "locale", "messages"]);
    expect(createRules({ fields: { amount: { validate: [["required"]] } } }).validate("", context).issues[0].message).toBe("This field is required.");
    expect(createRules({ validate: { custom: () => "" }, fields: { amount: { validate: [["custom"]] } } }).validate(1, context).issues[0].message).toBe("Invalid value.");
  });

  it("substitutes zero false and missing arguments after message selection", () => {
    const owner = createRules({ validate: { custom: () => false }, messages: { custom: "{0}/{1}/{2}" },
      fields: { amount: { validate: [["custom", 0, false]] } } });
    expect(owner.validate(1, context).issues[0].message).toBe("0/false/");
  });

  it("resolves omitted and undefined built-in byte widths once per executed occurrence", () => {
    let reads = 0, current = 2;
    const declarations: [string, ...unknown[]][] = [["maxbyte", 1], ["minbyte", 9, undefined], ["rangebyte", 0, 1, 4]];
    const owner = createRules({ byteWidth: () => { reads++; return current; }, fields: { amount: { validate: declarations } } });
    const first = owner.validate("가", context);
    expect(reads).toBe(2);
    expect(first.checks.map(check => check.args)).toEqual([[1, 2], [9, 2], [0, 1, 4]]);
    current = 3;
    expect(owner.validate("😀", context).checks[0].args).toEqual([1, 3]);
    expect(reads).toBe(4);
    expect(declarations).toEqual([["maxbyte", 1], ["minbyte", 9, undefined], ["rangebyte", 0, 1, 4]]);
    expect(createRules({ fields: { amount: { validate: [["maxbyte", 5]] } } }).validate("😀", context).valid).toBe(false);
  });

  it("skips byte providers for blank optional explicit-width and custom override calls", () => {
    let reads = 0;
    const rules: RuleSet = { byteWidth: () => { reads++; return 3; }, fields: { amount: { validate: [["maxbyte", 1]] } } };
    expect(createRules(rules).validate("", context).checks[0].args).toEqual([1]);
    rules.fields!.amount = { validate: [["maxbyte", 5, 2]] };
    expect(createRules(rules).validate("가", context).valid).toBe(true);
    rules.validate = { maxbyte: () => true };
    rules.fields!.amount = { validate: [["maxbyte", "custom", undefined]] };
    expect(createRules(rules).validate("가", context).checks[0].args).toEqual(["custom", undefined]);
    expect(reads).toBe(0);
  });

  it("captures live policy functions and copies literal messages", () => {
    const literal = { custom: "before" };
    const rules: RuleSet = { messages: literal, validate: { custom: () => false }, fields: { amount: { validate: [["custom"]] } } };
    const owner = createRules(rules);
    literal.custom = "after";
    rules.messages = { custom: "replaced" };
    expect(owner.validate(1, context).issues[0].message).toBe("before");
    let current = "one";
    rules.messages = () => ({ custom: current });
    const live = createRules(rules);
    rules.messages = () => ({ custom: "wrong replacement" });
    current = "two";
    expect(live.validate(1, context).issues[0].message).toBe("two");
  });

  it("rejects invalid byte literals and contextual provider failures", () => {
    for (const invalid of [0, -1, 1.5, NaN, "3", null]) expect(() => createRules({ byteWidth: invalid } as unknown as RuleSet))
      .toThrowError(expect.objectContaining({ api: "createRules", code: "RULE_DECLARATION" }));
    const owner = createRules({ byteWidth: () => 0, fields: { amount: { validate: [["maxbyte", 1]] } } });
    expect(() => owner.validate("가", context)).toThrowError(expect.objectContaining({ api: "createRules", code: "RULE_FAILED", detail: { field: "amount", rule: "maxbyte" } }));
  });

  it("rejects nonprimitive rule returns and drains unsupported rejected promises", async () => {
    for (const invalid of [undefined, null, 0, {}, new Boolean(false)]) {
      const owner = createRules({ validate: { custom: (() => invalid) as unknown as ValidateRule }, fields: { amount: { validate: [["custom"]] } } });
      expect(() => owner.validate(1, context)).toThrowError(expect.objectContaining({ code: "RULE_FAILED" }));
    }
    for (const kind of ["format", "validate"] as const) {
      let calls = 0;
      const run = () => { calls++; return Promise.reject("unsupported async"); };
      const owner = createRules({ [kind]: { custom: run }, fields: { amount: { [kind]: [["custom"]] } } } as unknown as RuleSet);
      expect(() => owner[kind](1, context)).toThrowError(expect.objectContaining({ code: "RULE_FAILED" }));
      await Promise.resolve(); await Promise.resolve();
      expect(calls).toBe(1);
    }
    expect(() => createRules({ format: { custom: (() => new String("text")) as unknown as FormatRule }, fields: { amount: { format: [["custom"]] } } }).format(1, context))
      .toThrowError(expect.objectContaining({ code: "RULE_FAILED" }));
  });

  it("preserves thrown null and undefined causes", () => {
    for (const cause of [null, undefined]) for (const kind of ["format", "validate"] as const) {
      const owner = createRules({ [kind]: { custom: () => { throw cause; } }, fields: { amount: { [kind]: [["custom"]] } } } as RuleSet);
      let found: unknown;
      try { owner[kind](1, context); } catch (error) { found = error; }
      expect(found).toMatchObject({ api: "createRules", code: "RULE_FAILED" });
      expect((found as Error).cause).toBe(cause);
    }
  });

  it("keeps exact prepare guards ahead of later validators and policy calls", () => {
    for (const code of ["FORM_DISPOSED", "FORM_RESCAN", "FORM_PREPARE"]) {
      const failure = new FrameworkError({ api: "bindForm", code, message: "actual owner guard" });
      let stale = false, later = 0;
      const runner = createRuleRunner("bindForm", { validate: {
        first: () => { stale = true; throw undefined; }, later: () => { later++; return false; }
      }, messages: () => { later++; return {}; }, fields: { amount: { validate: [["first"], ["later"]] } } });
      const checkpoint = () => { if (stale) throw failure; };
      let found: unknown;
      try { runner.validate(runner.validators(null, "amount"), 1, context, checkpoint); } catch (error) { found = error; }
      expect(found).toBe(failure);
      expect(later).toBe(0);
      expect(runner.running).toBe(false);
    }
  });

  it("drains a rejected parser-like rule result before a lifetime guard exits", async () => {
    let stale = false;
    const guard = new FrameworkError({ api: "bindForm", code: "FORM_DISPOSED", message: "disposed" });
    const runner = createRuleRunner("bindForm", { validate: { custom: (() => { stale = true; return Promise.reject("late"); }) as unknown as ValidateRule },
      fields: { amount: { validate: [["custom"]] } } });
    let found: unknown;
    try { runner.validate(runner.validators(null, "amount"), 1, context, () => { if (stale) throw guard; }); } catch (error) { found = error; }
    expect(found).toBe(guard);
    await Promise.resolve(); await Promise.resolve();
  });

  it("checkpoints throwing return inspectors and locale/message providers", () => {
    for (const policy of ["validator", "locale", "messages"] as const) {
      let stale = false, later = 0;
      const guard = new FrameworkError({ api: "bindForm", code: "FORM_PREPARE", message: "stale" });
      const bad = { get then() { stale = true; throw "inspector failure"; } };
      const rules: RuleSet = { validate: { custom: policy === "validator" ? (() => bad) as unknown as ValidateRule : () => false },
        locale: policy === "locale" ? (() => { stale = true; throw "locale failure"; }) : () => "en_US",
        messages: policy === "messages" ? (() => { stale = true; throw "messages failure"; }) : () => { later++; return {}; },
        fields: { amount: { validate: [["custom"], ["required"]] } } };
      const runner = createRuleRunner("bindForm", rules);
      let found: unknown;
      try { runner.validate(runner.validators(null, "amount"), 1, context, () => { if (stale) throw guard; }); } catch (error) { found = error; }
      expect(found).toBe(guard);
      expect(later).toBe(0);
    }
    for (const phase of ["provider", "entry"] as const) {
      let stale = false, later = 0;
      const guard = new FrameworkError({ api: "bindForm", code: "FORM_PREPARE", message: "stale message owner" });
      const runner = createRuleRunner("bindForm", {
        validate: { custom: () => false },
        messages: () => {
          if (phase === "provider") stale = true;
          return {
            get custom() { if (phase === "entry") stale = true; else later++; return "custom"; },
            get later() { later++; return "later"; }
          };
        }, fields: { amount: { validate: [["custom"]] } }
      });
      let found: unknown;
      try { runner.validate(runner.validators(null, "amount"), 1, context, () => { if (stale) throw guard; }); } catch (error) { found = error; }
      expect(found).toBe(guard);
      expect(later).toBe(0);
    }
  });

  it("reports running only through actual rule execution and always clears it", () => {
    const seen: boolean[] = [];
    const runner = createRuleRunner("bindGrid", { format: { custom: () => { seen.push(runner.running); throw null; } },
      validate: { custom: () => { seen.push(runner.running); return false; } },
      locale: () => { seen.push(runner.running); return "en_US"; }, fields: { amount: { format: [["custom"]], validate: [["custom"]] } } });
    expect(runner.running).toBe(false);
    expect(() => runner.format(runner.formats(null, "amount"), 1, context)).toThrow();
    expect(runner.running).toBe(false);
    runner.validate(runner.validators(null, "amount"), 1, context);
    expect(seen).toEqual([true, true, true]);
    expect(runner.running).toBe(false);
  });

  it("stages captured typed-map mutations and supports current-owner rollback", () => {
    const fields: NonNullable<RuleSet["fields"]> = { amount: { validate: [["minlength", 2]] } };
    const rules: RuleSet = { fields }, runner = createRuleRunner("bindForm", rules);
    const original = runner.validators(null, "amount");
    fields.amount = { validate: [["minlength", 4]] };
    rules.fields = { amount: { validate: [["missing"]] } };
    const next = runner.candidate();
    expect(runner.validators(null, "amount")).toBe(original);
    expect(next.validators(null, "amount")[0].args).toEqual([4]);
    const previous = runner.adopt(next);
    expect(runner.validators(null, "amount")[0].args).toEqual([4]);
    runner.adopt(previous);
    expect(runner.validators(null, "amount")).toBe(original);
  });

  it("compiles saved offscreen text with per-kind typed precedence and no retained checkpoint", () => {
    const fields: NonNullable<RuleSet["fields"]> = { amount: { format: [], validate: [] } };
    const runner = createRuleRunner("bindGrid", { fields });
    let current = true;
    const view = runner.candidate(() => { if (!current) throw Error("old generation"); });
    expect(view.validators("malformed ignored", "amount")).toEqual([]);
    fields.amount = { format: undefined, validate: undefined };
    const fallback = runner.candidate();
    expect(fallback.validators('[["minlength",3]]', "amount")[0].args).toEqual([3]);
    expect(() => fallback.validators("malformed ignored", "amount")).toThrowError(expect.objectContaining({ code: "RULE_DECLARATION" }));
    current = false;
    runner.adopt(view);
    expect(runner.validators(null, "amount")).toEqual([]);
  });

  it("stops declaration getters before later reads and preserves accepted lists", () => {
    const fields: NonNullable<RuleSet["fields"]> = {};
    const runner = createRuleRunner("bindList", { fields });
    let current = true, later = 0;
    Object.defineProperty(fields, "amount", { enumerable: true, get() { current = false; return { validate: [] }; } });
    Object.defineProperty(fields, "later", { enumerable: true, get() { later++; return { validate: [] }; } });
    expect(() => runner.candidate(() => { if (!current) throw Error("superseded owner"); })).toThrow("superseded owner");
    expect(later).toBe(0);
    expect(runner.configured("amount", "data-validate")).toBe(false);
  });

  it("compares rule calls by original spelling function and shallow argument identity", () => {
    const shared = {}, run: ValidateRule = () => true;
    const runner = createRuleRunner("bindList", { validate: { custom: run }, fields: { amount: { validate: [["custom", shared]] } } });
    const calls = runner.validators(null, "amount");
    expect(sameRuleCalls(calls, runner.candidate().validators(null, "amount"))).toBe(true);
    expect(sameRuleCalls(calls, [{ ...calls[0], name: "CUSTOM" }])).toBe(false);
    expect(sameRuleCalls(calls, [{ ...calls[0], args: [{}] }])).toBe(false);
    expect(sameRuleCalls(calls, [{ ...calls[0], run: () => true }])).toBe(false);
  });

  it("rejects unsafe standalone field paths even without declarations", () => {
    const owner = createRules();
    for (const field of ["", "constructor.value", "array.0"]) expect(() => owner.validate(1, { ...context, field }))
      .toThrowError(expect.objectContaining({ api: "createRules", code: "RULE_DECLARATION" }));
    expect(owner.format(null, { ...context, field: "missing" })).toBe("");
  });
});
