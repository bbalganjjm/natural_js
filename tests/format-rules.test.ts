// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import { assertFormatArgs, builtinFormats } from "../src/ui/format-rules.js";
import type { RuleContext } from "../src/ui/index.js";

const context: RuleContext = { field: "value", values: {}, rowId: null };

function format(name: string, value: string, ...args: unknown[]): string {
  assertFormatArgs(name, args);
  return builtinFormats[name.toLowerCase()](value, args, context);
}

describe("retained Form formatter rules", () => {
  it("keeps every 1.x declarative name available without exporting a utility package", () => {
    expect(Object.keys(builtinFormats).sort()).toEqual([
      "commas", "rrn", "ssn", "kbrn", "kcn", "upper", "lower", "capitalize", "zipcode", "phone",
      "realnum", "trimtoempty", "trimtozero", "trimtoval", "date", "time", "limit", "replace",
      "lpad", "rpad", "mask", "generic", "numeric"
    ].sort());
  });

  it("formats common display values without changing their raw input", () => {
    expect(format("commas", "-1234567.125")).toBe("-1,234,567.125");
    expect(format("upper", "abc")).toBe("ABC");
    expect(format("lower", "ABC")).toBe("abc");
    expect(format("capitalize", "ada lovelace")).toBe("Ada lovelace");
    expect(format("realnum", "0100.10")).toBe("100.1");
    expect(format("trimtoempty", "  A  ")).toBe("A");
    expect(format("trimtozero", "   ")).toBe("0");
    expect(format("trimtoval", "", "N/A")).toBe("N/A");
  });

  it("formats identifiers and telephone numbers with their retained names", () => {
    expect(format("rrn", "9001011234567")).toBe("900101-1234567");
    expect(format("rrn", "9001011234567", 7, "X")).toBe("900101-XXXXXXX");
    expect(format("ssn", "123456789")).toBe("123-45-6789");
    expect(format("kbrn", "1234567890")).toBe("123-45-67890");
    expect(format("kcn", "1234567890123")).toBe("123456-7890123");
    expect(format("zipcode", "123456")).toBe("123-456");
    expect(format("phone", "0212345678")).toBe("02-1234-5678");
    expect(format("phone", "01012345678")).toBe("010-1234-5678");
  });

  it("limits, replaces, and pads with validated arguments", () => {
    expect(format("limit", "가나다라", 5, "…")).toBe("가나…");
    expect(format("limit", "abcdef", 3)).toBe("abc");
    expect(format("replace", "a-b-a", "a", "x")).toBe("x-b-x");
    expect(format("lpad", "7", 3, "0")).toBe("007");
    expect(format("rpad", "7", 3, "0")).toBe("700");
  });

  it("keeps the named mask variants inside the Form implementation", () => {
    expect(format("mask", "01012345678", "phone")).toBe("010-****-5678");
    expect(format("mask", "abcdef@example.com", "email")).toBe("abc***@example.com");
    expect(format("mask", "hong@example.com", "email", "X")).toBe("hXXX@example.com");
    expect(format("mask", "서울시 강남구 역삼동 123", "address")).toBe("서울시 강남구 **동 ***");
    expect(format("mask", "Michael", "name")).toBe("Mic****");
    expect(format("mask", "홍길동", "name")).toBe("홍*동");
    expect(format("mask", "9001011234567", "rrn", "X")).toBe("900101-XXXXXXX");
  });

  it("uses pattern masks and corrects legacy generic and numeric defects", () => {
    expect(format("generic", "01012345678", "###-####-####")).toBe("010-1234-5678");
    expect(format("generic", "s1234", "###-#")).toBe("123-4");
    expect(format("numeric", "1234.5", "#,##0.00")).toBe("1,234.50");
    expect(format("numeric", "1.999", "0.00")).toBe("2.00");
    expect(format("numeric", "1.0001", "0.00", "ceil")).toBe("1.01");
    expect(format("numeric", "-1.0001", "0.00", "floor")).toBe("-1.01");
    expect(format("numeric", "-1234.5", "(#,##0.00)")).toBe("(1,234.50)");
  });

  it("formats dates and times without attaching a calendar or changing Date.prototype", () => {
    expect(format("date", "20240315")).toBe("2024-03-15");
    expect(format("date", "20240315", 8)).toBe("2024-03-15");
    expect(format("date", "20240315", "m/d/Y")).toBe("03/15/2024");
    expect(format("date", "20240101", "W N z")).toBe("01 1 0");
    expect(format("date", "20240230", 8)).toBe("20240230");
    expect(format("time", "0005", 6)).toBe("00:05:00");
    expect(format("time", "1234")).toBe("12:34");
  });

  it("rejects malformed declarations and unsupported picker arguments early", () => {
    expect(() => assertFormatArgs("date", [8, "date"])).toThrow(TypeError);
    expect(() => assertFormatArgs("date", [5])).toThrow(RangeError);
    expect(() => assertFormatArgs("numeric", ["bad"])).toThrow(TypeError);
    expect(() => assertFormatArgs("numeric", ["0.00", "up"])).toThrow(TypeError);
    expect(() => assertFormatArgs("mask", ["unknown"])).toThrow(TypeError);
    expect(() => assertFormatArgs("limit", [])).toThrow(TypeError);
    expect(() => assertFormatArgs("replace", ["a", "b", true])).toThrow(TypeError);
    expect(() => assertFormatArgs("rrn", [-1])).toThrow(RangeError);
    expect(() => assertFormatArgs("missing", [])).toThrow(TypeError);
  });
});
