// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import type { RuleContext } from "../src/ui/index.js";
import { assertValidateArgs, builtinMessages, builtinValidators } from "../src/ui/validate-rules.js";

const context: RuleContext = {
  field: "confirm",
  rowId: 7,
  values: { profile: { password: "same" }, confirm: "same" }
};

function run(name: string, value: string, args: readonly unknown[] = [], inContext = context): boolean | string {
  assertValidateArgs(name, args);
  return builtinValidators[name](value, args, inContext);
}

function withDigit(base: string, digit: number): string {
  return `${base}${digit}`;
}

function resident(base: string): string {
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  const sum = [...base].reduce((total, char, index) => total + Number(char) * weights[index], 0);
  return withDigit(base, (11 - sum % 11) % 10);
}

describe("retained UI validator catalog", () => {
  it("contains every M1 built-in name, including underscore combinations", () => {
    expect(Object.keys(builtinValidators).sort()).toEqual([
      "required", "alphabet", "integer", "korean", "alphabet_integer", "integer_korean",
      "alphabet_korean", "alphabet_integer_korean", "dash_integer", "commas_integer",
      "number", "decimal", "phone", "email", "url", "zipcode", "rrn", "ssn", "frn",
      "frn_rrn", "kbrn", "kcn", "date", "time", "accept", "notaccept", "match",
      "notmatch", "acceptfileext", "notacceptfileext", "equalto", "maxlength", "minlength",
      "rangelength", "maxbyte", "minbyte", "rangebyte", "maxvalue", "minvalue",
      "rangevalue", "regexp"
    ].sort());
    for (const locale of ["en_US", "ko_KR"] as const) {
      expect(Object.keys(builtinMessages[locale]).sort()).toEqual(
        ["global", ...Object.keys(builtinValidators)].sort()
      );
    }
  });

  it.each([
    ["alphabet", "abc", "123"], ["integer", "+123", "1.2"], ["korean", "가나", "abc"],
    ["alphabet_integer", "A1", "A-1"], ["integer_korean", "가1", "가A"],
    ["alphabet_korean", "A가", "A1"], ["alphabet_integer_korean", "A가1", "A-가"],
    ["dash_integer", "12-3", "12a"], ["commas_integer", "1,234", "1a"],
    ["number", "-1,234.5", "1.2.3"], ["email", "a@b.co", "a@@b"],
    ["url", "https://example.com/a", "javascript:alert(1)"],
    ["zipcode", "123-456", "12345"], ["ssn", "123-45-6789", "x123-45-6789"],
    ["phone", "02-123-4567", "02-123-456"],
    ["time", "23:59:59", "24:00"]
  ])("%s distinguishes matching and nonmatching values", (name, valid, invalid) => {
    expect(run(name, valid)).toBe(true);
    expect(run(name, invalid)).toBe(false);
  });

  it("requires nonblank text and rejects malformed pattern arguments", () => {
    expect(run("required", " Ada ")).toBe(true);
    expect(run("required", "  ")).toBe(false);
    expect(() => assertValidateArgs("regexp", ["x", "z"])).toThrow(TypeError);
    expect(() => assertValidateArgs("unknown", [])).toThrow(TypeError);
  });

  it("checks decimal bounds, leap days, and partial phone numbers", () => {
    expect(run("decimal", ".5", [1])).toBe(true);
    expect(run("decimal", "1.234", [2])).toBe(false);
    expect(run("decimal", "1", [0])).toBe(true);
    expect(run("decimal", "1.0", [0])).toBe(false);
    expect(run("date", "2024-02-29")).toBe(true);
    expect(run("date", "2023-02-29")).toBe(false);
    expect(run("date", "2024-01-00")).toBe(false);
    expect(run("date", "abcd0115")).toBe(false);
    expect(run("phone", "02-123-4", [true])).toBe(true);
    expect(run("phone", "02-123-4", ["true"])).toBe(true);
  });

  it("corrects the old registration checksum and dispatch defects", () => {
    const rrn = resident("000000100000");
    expect(run("rrn", rrn)).toBe(true);
    expect(run("rrn", rrn.slice(0, -1) + ((Number(rrn.at(-1)) + 1) % 10))).toBe(false);
    expect(run("frn_rrn", rrn)).toBe(true);

    const frnBase = "000000500000";
    let sum = 0;
    for (let index = 0; index < 12; index++) sum += Number(frnBase[index]) * (index % 8 + 2);
    const frn = withDigit(frnBase, ((11 - sum % 11) % 10 + 2) % 10);
    expect(run("frn", frn)).toBe(true);
    expect(run("frn_rrn", frn)).toBe(true);
    expect(run("frn", frn.slice(0, -1) + ((Number(frn.at(-1)) + 1) % 10))).toBe(false);

    expect(run("kbrn", "0000000015")).toBe(true);
    expect(run("kbrn", "0000000016")).toBe(false);
    expect(run("kcn", "0000000000018")).toBe(true);
    expect(run("kcn", "0000000000019")).toBe(false);
  });

  it("uses a same-row field path for equalto and rejects unsafe selectors", () => {
    expect(run("equalto", "same", ["profile.password"])).toBe(true);
    expect(run("equalto", "other", ["profile.password"])).toBe(false);
    expect(() => assertValidateArgs("equalto", ["#password"])).toThrow(TypeError);
    expect(() => assertValidateArgs("equalto", ["profile.__proto__"])).toThrow(TypeError);
  });

  it("validates pattern rules and returns a regexp-specific message", () => {
    expect(run("accept", "Y", ["Y|N"])).toBe(true);
    expect(run("notaccept", "X", ["Y|N"])).toBe(true);
    expect(run("match", "abc123", ["\\d+"])).toBe(true);
    expect(run("notmatch", "abc", ["\\d+"])).toBe(true);
    expect(run("acceptfileext", "file.PNG", ["jpg|png"])).toBe(true);
    expect(run("acceptfileext", "fileXpng", ["jpg|png"])).toBe(false);
    expect(run("notacceptfileext", "file.txt", ["jpg|png"])).toBe(true);
    expect(run("regexp", "abc", ["^\\d+$", "", "Digits only"])).toBe("Digits only");
    expect(run("regexp", "abc", ["^\\d+$", ""])).toBe(false);
  });

  it("checks character, legacy byte-width, and numeric ranges", () => {
    expect(run("maxlength", " ab ", [2])).toBe(true);
    expect(run("minlength", "a", [2])).toBe(false);
    expect(run("rangelength", "abc", [2, 4])).toBe(true);
    expect(run("maxbyte", "한", [3])).toBe(true);
    expect(run("minbyte", "한", [4])).toBe(false);
    expect(run("rangebyte", "é", [2, 2])).toBe(true);
    expect(run("maxbyte", "😀", [5])).toBe(false); // Two UTF-16 units, as in 1.x.
    expect(run("maxbyte", "한", [2, 2])).toBe(true);
    expect(run("maxvalue", "5", [5])).toBe(true);
    expect(run("minvalue", "5", [6])).toBe(false);
    expect(run("rangevalue", "5", [1, 9])).toBe(true);
    expect(run("maxvalue", "not a number", [9])).toBe(false);
  });

  it.each([
    ["required", [1]], ["decimal", [-1]], ["phone", ["yes"]], ["equalto", []],
    ["accept", []], ["match", ["["]], ["maxlength", ["NaN"]],
    ["rangelength", [4, 2]], ["rangebyte", [4, 2]], ["maxvalue", [Infinity]],
    ["rangevalue", [9, 1]], ["regexp", ["[", ""]], ["regexp", ["x"]]
  ])("rejects malformed %s arguments", (name, args) => {
    expect(() => assertValidateArgs(name, args)).toThrow();
  });
});
