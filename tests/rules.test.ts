// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import { createRuleRunner } from "../src/ui/rules.js";
import type { RuleContext } from "../src/ui/index.js";

const context: RuleContext = {
  field: "email", values: { email: "" }, rowId: 7
};

function marked(attribute: string, declaration: string): Element {
  return {
    getAttribute(name: string) { return name === attribute ? declaration : null; }
  } as Element;
}

describe("private UI rule contract", () => {
  it("resolves retained aliases and keeps overrides local to one component", () => {
    const element = marked("data-validate", '[["integer+dash"]]');
    const builtIn = createRuleRunner("bindForm").validators(element, "email");
    expect(createRuleRunner("bindForm").validate(builtIn, "12-3", context)).toEqual([]);
    expect(createRuleRunner("bindForm").validate(builtIn, "abc", context)[0].rule).toBe("integer+dash");

    const custom = createRuleRunner("bindForm", {
      validate: { integer_dash: value => value === "custom" }
    });
    const override = custom.validators(element, "email");
    expect(custom.validate(override, "custom", context)).toEqual([]);
    expect(custom.validate(override, "12-3", context)[0].field).toBe("email");
  });

  it("skips blank optional input and gives required input a nonempty localized issue", () => {
    const optional = createRuleRunner("bindForm");
    const email = optional.validators(marked("data-validate", '[["email"]]'), "email");
    expect(optional.validate(email, "   ", context)).toEqual([]);

    const korean = createRuleRunner("bindForm", { locale: "ko_KR" });
    const required = korean.validators(marked("data-validate", '[["required"]]'), "email");
    const issue = korean.validate(required, "   ", context)[0];
    expect(issue.rowId).toBe(7);
    expect(issue.message.trim()).not.toBe("");
    expect(korean.validate(required, false, context)[0].rule).toBe("required");
    const overridden = createRuleRunner("bindForm", { validate: { required: () => true } });
    const customRequired = overridden.validators(marked("data-validate", '[["required"]]'), "email");
    expect(overridden.validate(customRequired, false, context)).toEqual([]);
  });

  it("never emits an empty error message and rejects an empty message override", () => {
    const runner = createRuleRunner("bindGrid", { validate: { custom: () => "" } });
    const calls = runner.validators(marked("data-validate", '[["custom"]]'), "email");
    expect(runner.validate(calls, "bad", context)[0].message).toBe("email failed custom.");
    expect(() => createRuleRunner("bindForm", { messages: { email: "" } }))
      .toThrowError(/rule message/u);
  });

  it("reports unknown names and malformed built-in arguments at binding", () => {
    const runner = createRuleRunner("bindForm");
    expect(() => runner.validators(marked("data-validate", '[["missing"]]'), "email"))
      .toThrowError(/missing.*email/u);
    expect(() => runner.validators(marked("data-validate", '[["toString"]]'), "email"))
      .toThrowError(/toString.*email/u);
    expect(() => runner.validators(marked("data-validate", '[["minvalue","bad"]]'), "email"))
      .toThrowError(/invalid arguments/u);
  });
});
