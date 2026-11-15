// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import { createRules } from "../src/ui/index.js";
import { assertFormatArgs, builtinFormats } from "../src/ui/format-rules.js";
import { assertValidateArgs, builtinValidators } from "../src/ui/validate-rules.js";
import type { RuleContext } from "../src/ui/index.js";

const context: RuleContext = { field: "value", values: {}, rowId: null };
const format = (name: string, input: string, args: readonly unknown[] = []) => {
  assertFormatArgs(name, args);
  return builtinFormats[name](input, args, context);
};
const validate = (name: string, input: string, args: readonly unknown[] = []) => {
  assertValidateArgs(name, args);
  return builtinValidators[name](input, args, context);
};

describe("retained rule argument and value branches", () => {
  it.each([
    { label: "rrn invalid raw and default mask character", name: "rrn", input: "123", args: [], output: "123" },
    { label: "rrn default mask character", name: "rrn", input: "9001011234567", args: [7], output: "900101-*******" },
    { label: "ssn short digits", name: "ssn", input: "a12", args: [], output: "12" },
    { label: "kbrn short digits", name: "kbrn", input: "a12", args: [], output: "12" },
    { label: "kcn short digits", name: "kcn", input: "a12", args: [], output: "12" },
    { label: "zipcode short", name: "zipcode", input: "12", args: [], output: "12" },
    { label: "phone short", name: "phone", input: "a123", args: [], output: "123" },
    { label: "realnum nonnumeric", name: "realnum", input: "wrong", args: [], output: "" },
    { label: "trimtozero nonblank", name: "trimtozero", input: " x ", args: [], output: "x" },
    { label: "trimtoval nonblank", name: "trimtoval", input: " x ", args: [false], output: "x" },
    { label: "trimtoval false", name: "trimtoval", input: "", args: [false], output: "false" },
    { label: "trimtoval zero", name: "trimtoval", input: "", args: [0], output: "0" },
    { label: "limit already suffixed", name: "limit", input: "abc…", args: [1, "…"], output: "abc…" },
    { label: "limit unchanged short input", name: "limit", input: "abc", args: [5], output: "abc" },
    { label: "lpad repeat and truncate fill", name: "lpad", input: "x", args: [4, "ab"], output: "abax" },
    { label: "rpad repeat and truncate fill", name: "rpad", input: "x", args: [4, "ab"], output: "xaba" },
    { label: "lpad already long", name: "lpad", input: "abcd", args: [2, "0"], output: "abcd" },
    { label: "rpad already long", name: "rpad", input: "abcd", args: [2, "0"], output: "abcd" },
    { label: "mask malformed email raw", name: "mask", input: "bad", args: ["email"], output: "bad" },
    { label: "mask malformed phone raw", name: "mask", input: "bad", args: ["phone"], output: "bad" },
    { label: "mask malformed rrn raw", name: "mask", input: "bad", args: ["rrn"], output: "bad" },
    { label: "mask compound surname", name: "mask", input: "남궁민수", args: ["name"], output: "남궁*수" },
    { label: "mask short name", name: "mask", input: "김", args: ["name"], output: "김" },
    { label: "mask Latin spaces", name: "mask", input: "ABC DEF", args: ["name"], output: "ABC ***" },
    { label: "mask region numeric address", name: "mask", input: "경기 12-3", args: ["address"], output: "경기 ****" },
    { label: "date zero and invalid day", name: "date", input: "00000000", args: [], output: "" },
    { label: "date invalid length raw", name: "date", input: "12345", args: [], output: "12345" },
    { label: "time empty", name: "time", input: "bad", args: [], output: "" },
    { label: "time hour selection", name: "time", input: "123456", args: [2], output: "12" }
  ])("formats missing branch: $label", ({ name, input, args, output }) => expect(format(name, input, args)).toBe(output));

  it("uses every supported numeric date length and calendar/time/escape token family", () => {
    const inputs = ["2024", "202403", "2024031513", "202403151314", "20240315131415"];
    const outputs = ["2024", "2024-03", "2024-03-15 13", "2024-03-15 13:14", "2024-03-15 13:14:15"];
    expect(inputs.map(value => format("date", value))).toEqual(outputs);
    expect([4, 6, 8, 10, 12, 14].map(size => format("date", "20240315131415", [size])))
      .toEqual(["2024", "2024-03", "2024-03-15", "2024-03-15 13", "2024-03-15 13:14", "2024-03-15 13:14:15"]);
    expect(format("date", "20240315131415", ["y n F M j l D N w S z t L H G h g i s a A"]))
      .toBe("24 3 March Mar 15 Friday Fri 5 5 th 74 31 1 13 13 01 1 14 15 pm PM");
    expect(format("date", "20240315131415", ["%Y Y %"])).toBe("Y 2024 %");
    for (const [day, suffix] of [["01", "st"], ["02", "nd"], ["03", "rd"], ["11", "th"], ["12", "th"], ["13", "th"], ["21", "st"]]) {
      expect(format("date", "202403" + day, ["S"])).toBe(suffix);
    }
  });

  it("formats native timezone DST Unix Swatch and composite date tokens", () => {
    const wallTime = new Date(2024, 2, 15, 13, 14, 15);
    const minutes = -wallTime.getTimezoneOffset(), absolute = Math.abs(minutes);
    const hourOffset = String(Math.floor(absolute / 60)).padStart(2, "0"), minuteOffset = String(absolute % 60).padStart(2, "0");
    const sign = minutes < 0 ? "-" : "+", offset = sign + hourOffset + minuteOffset, colonOffset = sign + hourOffset + ":" + minuteOffset;
    expect(format("date", "20240315131415", ["O P Z U"]))
      .toBe(`${offset} ${colonOffset} ${minutes * 60} ${Math.floor(wallTime.getTime() / 1000)}`);
    expect(format("date", "20240315131415", ["c r"]))
      .toBe(`2024-03-15T13:14:15${colonOffset} Fri, 15 Mar 2024 13:14:15 ${offset}`);
    const nativeStandardOffset = Math.max(new Date(2024, 0, 1, 13, 14, 15).getTimezoneOffset(), new Date(2024, 6, 1, 13, 14, 15).getTimezoneOffset());
    expect(format("date", "20240315131415", ["I"])).toBe(wallTime.getTimezoneOffset() < nativeStandardOffset ? "1" : "0");
    const localDigits = (date: Date) => String(date.getFullYear()).padStart(4, "0") +
      [date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()].map(value => String(value).padStart(2, "0")).join("");
    // Literal Internet-time beats for midnight/noon/23:00 UTC, independent of the host's local offset.
    for (const [utc, beats] of [["2024-03-15T00:00:00.000Z", "041"], ["2024-03-15T12:00:00.000Z", "541"], ["2024-03-15T23:00:00.000Z", "000"]]) {
      expect(format("date", localDigits(new Date(utc)), ["B"])).toBe(beats);
    }
  });

  it.each([
    { name: "decimal", input: "1.1234567890", args: [], valid: true },
    { name: "decimal", input: "1.12345678901", args: [], valid: false },
    { name: "phone", input: "02-123-4", args: [false], valid: false },
    { name: "phone", input: "02-123-4", args: ["false"], valid: false },
    { name: "phone", input: "02-123-4567", args: [false], valid: true },
    { name: "url", input: "ftp://example.com", args: [], valid: true },
    { name: "url", input: "not a url", args: [], valid: false },
    { name: "date", input: "0000-01-01", args: [], valid: false },
    { name: "date", input: "2024/02/29", args: [], valid: true },
    { name: "date", input: "2024/02-29", args: [], valid: false },
    { name: "date", input: "2024-13-01", args: [], valid: false },
    { name: "date", input: "1900-02-29", args: [], valid: false },
    { name: "date", input: "2000-02-29", args: [], valid: true },
    { name: "date", input: "2024-04-31", args: [], valid: false },
    { name: "date", input: "2024-11-30", args: [], valid: true },
    { name: "time", input: "23", args: [], valid: true },
    { name: "time", input: "23:59", args: [], valid: true },
    { name: "time", input: "23:59:60", args: [], valid: false },
    { name: "accept", input: "X", args: ["Y|N"], valid: false },
    { name: "notaccept", input: "Y", args: ["Y|N"], valid: false },
    { name: "match", input: "abc", args: ["\\d+"], valid: false },
    { name: "notmatch", input: "abc1", args: ["\\d+"], valid: false },
    { name: "notacceptfileext", input: "file.PNG", args: ["png"], valid: false },
    { name: "regexp", input: "ABC", args: ["^abc$", "i"], valid: true },
    { name: "maxlength", input: "abc", args: [2], valid: false },
    { name: "minlength", input: "abc", args: [2], valid: true },
    { name: "rangelength", input: "a", args: [2, 4], valid: false },
    { name: "rangelength", input: "abcde", args: [2, 4], valid: false },
    { name: "rangebyte", input: "a", args: [2, 3], valid: false },
    { name: "rangebyte", input: "가가", args: [2, 3], valid: false },
    { name: "maxvalue", input: "6", args: [5], valid: false },
    { name: "minvalue", input: "6", args: [5], valid: true },
    { name: "rangevalue", input: "0", args: [1, 9], valid: false },
    { name: "rangevalue", input: "10", args: [1, 9], valid: false },
    { name: "frn_rrn", input: "bad", args: [], valid: false },
    { name: "frn", input: "0000001000005", args: [], valid: false }
  ])("validates missing branch: $name / $input", ({ name, input, args, valid }) => expect(validate(name, input, args)).toBe(valid));

  it.each([
    ["rrn", [14]], ["rrn", [1, "xx"]], ["trimtoval", []], ["trimtoval", [null]], ["trimtoval", [{}]],
    ["date", [undefined]], ["date", [" fmt", "picker"]], ["time", [3]], ["limit", [-1]], ["limit", [1, 2]],
    ["replace", ["", "x"]], ["replace", ["a", 1]], ["lpad", [1, ""]], ["rpad", [1.5, "x"]],
    ["mask", ["name", "xx"]], ["generic", [1]], ["numeric", [undefined]], ["numeric", ["(0"]], ["numeric", ["0,,0"]]
  ] as const)("rejects formatter argument branch: %s %j", (name, args) => expect(() => assertFormatArgs(name, args)).toThrow());

  it.each([
    ["decimal", [1.5]], ["decimal", [undefined]], ["phone", [true, false]], ["accept", [""]], ["notaccept", [1]],
    ["notmatch", ["["]], ["acceptfileext", ["["]], ["notacceptfileext", []], ["equalto", [1]],
    ["maxlength", [1.5]], ["minlength", [-1]], ["rangelength", [1]], ["minbyte", [1, 0]],
    ["maxbyte", [1, -1]], ["rangebyte", [1, 2, 0]], ["minvalue", [""]], ["rangevalue", [0, NaN]],
    ["regexp", ["x", "", 1]], ["regexp", ["x", "", "message", "extra"]]
  ] as const)("rejects validator argument branch: %s %j", (name, args) => expect(() => assertValidateArgs(name, args)).toThrow());

  it.each([
    ["integer+alphabet", "A1"], ["korean+integer", "가1"], ["KOREAN_ALPHABET", "A가"],
    ["korean+integer+alphabet", "A가1"], ["INTEGER+DASH", "1-2"], ["integer+commas", "1,2"]
  ])("normalizes retained validator alias %s", (rule, value) => {
    const owner = createRules({ fields: { value: { validate: [[rule]] } } });
    expect(owner.validate(value, context).valid).toBe(true);
    expect(owner.validate("!", context).issues[0].rule).toBe(rule);
  });

  it("uses case-normalized formatter names while retaining declaration spelling", () => {
    const owner = createRules({ fields: { value: { format: [[" CoMmAs "]], validate: [["ReQuIrEd"]] } } });
    expect(owner.format(1234, context)).toBe("1,234");
    expect(owner.validate("", context).issues[0].rule).toBe("ReQuIrEd");
  });

  it("compares a missing same-row target with empty input without optional-blank skipping", () => {
    const owner = createRules({ fields: { value: { validate: [["required"], ["equalto", "profile.missing"]] } } });
    const empty = owner.validate("", { ...context, values: { profile: {} } });
    expect(empty.checks.map(check => [check.rule, check.valid])).toEqual([["required", false], ["equalto", true]]);
    expect(empty.issues.map(issue => issue.rule)).toEqual(["required"]);
    expect(owner.validate("entered", { ...context, values: { profile: {} } }).issues.map(issue => issue.rule)).toEqual(["equalto"]);
    const nested = createRules({ fields: { value: { validate: [["equalto", "profile.code"]] } } });
    expect(nested.validate("same", { ...context, values: { profile: { code: "same" } } }).valid).toBe(true);
    expect(() => createRules({ fields: { value: { validate: [["equalto", "items[0].code"]] } } }))
      .toThrowError(expect.objectContaining({ code: "RULE_ARGUMENT" }));
  });

  it("rejects malformed identifier lengths categories and foreign parity without hiding checksum branches", () => {
    for (const name of ["rrn", "frn", "frn_rrn", "kbrn", "kcn"]) {
      expect(validate(name, "123")).toBe(false);
      expect(validate(name, "not-a-number")).toBe(false);
    }
    // These literals have the foreign checksum but fail its category or required even registration pair.
    expect(validate("frn", "0000001000005")).toBe(false);
    expect(validate("frn", "0000005010004")).toBe(false);
    // Category7 must take foreign dispatch and fail; this literal instead has a resident checksum.
    expect(validate("frn_rrn", "0000007000000")).toBe(false);
  });

  it("rejects extra arguments for every no-argument built-in declaration", () => {
    for (const name of ["commas", "ssn", "kbrn", "kcn", "upper", "lower", "capitalize", "zipcode", "phone", "realnum", "trimtoempty", "trimtozero"]) {
      expect(() => assertFormatArgs(name, [1])).toThrow();
    }
    for (const name of ["required", "alphabet", "integer", "korean", "alphabet_integer", "integer_korean", "alphabet_korean", "alphabet_integer_korean",
      "dash_integer", "commas_integer", "number", "email", "url", "zipcode", "rrn", "ssn", "frn", "frn_rrn", "kbrn", "kcn", "date", "time"]) {
      expect(() => assertValidateArgs(name, [1])).toThrow();
    }
  });
});
