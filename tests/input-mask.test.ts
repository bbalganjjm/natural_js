// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import { createInputMask } from "../src/ui/input-mask.js";
import { assertFormatArgs, builtinFormats } from "../src/ui/format-rules.js";

describe("manual input masks", () => {
  it.each([
    { pattern: "##-##", input: "1234", value: "12-34", stripped: "1234", complete: true, next: null },
    { pattern: "##", input: "a12b", value: "12", stripped: "a12b", complete: true, next: null },
    { pattern: "##", input: "123", value: "12", stripped: "123", complete: true, next: null },
    { pattern: "##", input: "1a2", value: "1a2", stripped: "1a2", complete: false, next: "#" },
    { pattern: "!#-##", input: "12", value: "#-12", stripped: "12", complete: true, next: null },
    { pattern: "##", input: "s1s2", value: "s1s2", stripped: "s1s2", complete: false, next: "#" },
    { pattern: "@~", input: "가9", value: "가9", stripped: "가9", complete: true, next: null },
    { pattern: "@~", input: "9 가!", value: " 가", stripped: "9 가", complete: true, next: null },
    { pattern: "AB!", input: "12", value: "AB!", stripped: "12", complete: true, next: null },
    { pattern: "", input: "12", value: "", stripped: "12", complete: true, next: null }
  ])("projects the first complete generic run: $pattern / $input", expected => {
    const mask = createInputMask({ kind: "generic", pattern: expected.pattern });
    const result = mask.apply(expected.input);
    expect(result).toMatchObject({ value: expected.value, stripped: expected.stripped,
      complete: expected.complete, next: expected.next });
    expect(result.issues).toHaveLength(expected.complete ? 0 : 1);
    if (!expected.complete) expect(result.issues[0]).toMatchObject({ code: 1, phase: "value", message: expect.stringMatching(/\S/) });
  });

  it("keeps partial next slots, escaped/literal-only output and failure-to-success independent", () => {
    const mask = createInputMask({ kind: "generic", pattern: "##-##", partial: true });
    expect(["1", "12", "123", "1234"].map(input => mask.apply(input))).toEqual([
      { value: "1", stripped: "1", complete: false, next: "#", issues: [] },
      { value: "12-", stripped: "12", complete: false, next: "#", issues: [] },
      { value: "12-3", stripped: "123", complete: false, next: "#", issues: [] },
      { value: "12-34", stripped: "1234", complete: true, next: null, issues: [] }
    ]);
    expect(mask.apply("x")).toEqual({ value: "", stripped: "x", complete: false, next: "#", issues: [] });
    const pending = createInputMask({ kind: "generic", pattern: "##", partial: true });
    expect(["", "x", "12"].map(input => pending.apply(input)))
      .toEqual([
        { value: "", stripped: "", complete: false, next: "#", issues: [] },
        { value: "", stripped: "x", complete: false, next: "#", issues: [] },
        { value: "12", stripped: "12", complete: true, next: null, issues: [] }
      ]);
    expect(createInputMask({ kind: "generic", pattern: "AB!", partial: true }).apply("12"))
      .toEqual({ value: "", stripped: "12", complete: true, next: null, issues: [] });
    expect(createInputMask({ kind: "generic", pattern: "", partial: true }).apply("12").value).toBe("");
    const full = createInputMask({ kind: "generic", pattern: "##" });
    const failed = full.apply("1a2");
    expect(failed.issues).toHaveLength(1);
    expect(full.apply("12").issues).toEqual([]);
    expect(failed.issues).toHaveLength(1);
  });

  it("removes only an unchanged end-literal attempt and stores failed attempt history", () => {
    const make = () => createInputMask({ kind: "generic", pattern: "##-##", partial: true });
    const literal = make(); literal.apply("12");
    expect(literal.apply("12", { deleting: true })).toMatchObject({ value: "1", stripped: "1" });
    const shortened = make(); shortened.apply("123");
    expect(shortened.apply("12", { deleting: true })).toMatchObject({ value: "12-", stripped: "12" });
    const replacement = make(); replacement.apply("12");
    expect(replacement.apply("13", { deleting: true })).toMatchObject({ value: "13-", stripped: "13" });
    const failed = createInputMask({ kind: "generic", pattern: "##" });
    failed.apply("1a2");
    expect(failed.apply("1a2", { deleting: true })).toMatchObject({ value: "1a2", stripped: "1a", complete: false });
    expect(failed.apply("12")).toMatchObject({ value: "12", issues: [] });
    expect(make().apply("12", { deleting: true }).stripped).toBe("12");
  });

  it.each([
    { pattern: "", input: "$-001,234.50", value: "-001234.50", stripped: "-001234.50" },
    { pattern: "#,##0.00", input: "1.999", value: "2.00", stripped: "1.999" },
    { pattern: "0.00", input: "-1.001", rounding: "ceil" as const, value: "-1.00", stripped: "-1.001" },
    { pattern: "0.00", input: "-1.001", rounding: "floor" as const, value: "-1.01", stripped: "-1.001" },
    { pattern: "0##", input: "7", value: "007", stripped: "7" },
    { pattern: "0.#0#", input: "1.2", value: "1.20", stripped: "1.2" },
    { pattern: "(-#,###)", input: "-5", value: "(-5)", stripped: "-5" },
    { pattern: "$#,##0.00", input: "-1234.5", value: "-$1,234.50", stripped: "-1234.5" },
    { pattern: "$+#,##0.00", input: "1234.5", value: "+$1,234.50", stripped: "1234.5" },
    { pattern: "$(#,##0.00)", input: "-1234.5", value: "($1,234.50)", stripped: "-1234.5" },
    { pattern: "$(-#,##0.00)", input: "-1234.5", value: "(-$1,234.50)", stripped: "-1234.5" },
    { pattern: "0.00", input: "9007199254740993.995", value: "9007199254740994.00", stripped: "9007199254740993.995" },
    { pattern: "0.00", input: "$12.3.4x", value: "12.34", stripped: "12.34" }
  ])("uses the shared precise numeric projection: $pattern / $input", expected => {
    const result = createInputMask({ kind: "numeric", pattern: expected.pattern, rounding: expected.rounding }).apply(expected.input);
    expect(result).toEqual({ value: expected.value, stripped: expected.stripped, complete: true, next: null, issues: [] });
    assertFormatArgs("numeric", [expected.pattern, expected.rounding ?? "round"]);
    expect(builtinFormats.numeric(expected.input, [expected.pattern, expected.rounding ?? "round"],
      { field: "amount", values: {}, rowId: null })).toBe(result.value);
  });

  it("recognizes its own negative sign shells before cleaning", () => {
    for (const pattern of ["$#,##0.00", "$(#,##0.00)", "$(-#,##0.00)", "(-#,##0.00)"]) {
      const mask = createInputMask({ kind: "numeric", pattern });
      const first = mask.apply("-1234.5");
      expect(mask.apply(first.value)).toEqual({ ...first, stripped: "-1234.50" });
    }
    const plain = createInputMask({ kind: "numeric", pattern: "0.00" });
    expect(plain.apply("(12)").value).toBe("12.00");
  });

  it("preserves numeric pending text and unpadded entered fractions in partial mode", () => {
    const mask = createInputMask({ kind: "numeric", pattern: "#,##0.00", partial: true });
    for (const input of ["", "-", ".", "-."]) {
      expect(mask.apply(input)).toEqual({ value: input, stripped: input, complete: false, next: null, issues: [] });
    }
    expect(mask.apply("1.")).toMatchObject({ value: "1.", complete: false, issues: [] });
    expect(mask.apply("1.2")).toMatchObject({ value: "1.2", complete: true, issues: [] });
    expect(mask.apply("1.20")).toMatchObject({ value: "1.20", complete: true });
    expect(mask.apply("1.239")).toMatchObject({ value: "1.24", complete: true });
    expect(mask.apply("-0.")).toMatchObject({ value: "-0.", complete: false });
    expect(mask.apply("-0.", { deleting: true })).toMatchObject({ value: "-0", stripped: "-0", complete: true });
    expect(createInputMask({ kind: "numeric", pattern: "0", partial: true }).apply("1."))
      .toMatchObject({ value: "1.", complete: false });
    expect(createInputMask({ kind: "numeric", pattern: "", partial: true }).apply("001.2").value).toBe("001.2");
  });

  it("returns current diagnostic codes without losing input or sharing history", () => {
    const badPattern = createInputMask({ kind: "numeric", pattern: "bad" });
    expect(badPattern.apply("$12")).toMatchObject({ value: "$12", stripped: "12", complete: false,
      issues: [{ code: 1, phase: "pattern", message: expect.stringMatching(/\S/) }] });
    const mask = createInputMask({ kind: "numeric", pattern: "0.00" });
    for (const input of ["", "--1", "x"]) expect(mask.apply(input)).toMatchObject({ value: input, complete: false,
      issues: [{ code: 2, phase: "value", message: expect.stringMatching(/\S/) }] });
    expect(mask.apply("12").issues).toEqual([]);
    expect(createInputMask({ kind: "numeric", pattern: "0.00" }).apply("12", { deleting: true }).stripped).toBe("12");
  });

  it("captures option getters once and validates JavaScript inputs with the actual API", () => {
    const reads: string[] = [];
    const options = {
      get kind() { reads.push("kind"); return "numeric" as const; },
      get pattern() { reads.push("pattern"); return "0.00"; },
      get partial() { reads.push("partial"); return false; },
      get rounding() { reads.push("rounding"); return "floor" as const; }
    };
    const mask = createInputMask(options);
    expect(reads).toEqual(["kind", "pattern", "partial", "rounding"]);
    mask.apply("1.999"); mask.apply("2.999");
    expect(reads).toHaveLength(4);
    const declaration = { api: "createInputMask", code: "MASK_DECLARATION" };
    const value = { api: "createInputMask", code: "MASK_VALUE" };
    for (const invalid of [null, [], {}, { kind: "other", pattern: "0" }, { kind: "numeric", pattern: 0 },
      { kind: "numeric", pattern: "0", partial: null }, { kind: "numeric", pattern: "0", rounding: "up" },
      { kind: "generic", pattern: "#", rounding: "ceil" }]) {
      expect(() => createInputMask(invalid as never)).toThrowError(expect.objectContaining(declaration));
    }
    expect(() => mask.apply(1 as never)).toThrowError(expect.objectContaining(value));
    expect(() => mask.apply("1", null as never)).toThrowError(expect.objectContaining(value));
    expect(() => mask.apply("1", { deleting: "true" } as never)).toThrowError(expect.objectContaining(value));
  });
});
