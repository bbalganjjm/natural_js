// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import { rowOptionAvailable, rowOptions } from "../src/ui/row-options.js";

const invalid = (field: string): never => { throw new Error(field); };

describe("rowOptions", () => {
  it("keeps nested typed values and ignores incomplete choices", () => {
    const row = { profile: { choices: [
      { label: "One", value: 1 },
      { label: "Off", value: false },
      { label: "Empty", value: null },
      { label: "", value: 2 },
      { label: "Missing" }
    ] } };
    expect(rowOptions(row, ["profile", "choices"], ["label"], ["value"], invalid)).toEqual([
      { label: "One", raw: 1 }, { label: "Off", raw: false }, { label: "Empty", raw: null }
    ]);
  });

  it("treats an absent option array as empty and rejects a non-array", () => {
    expect(rowOptions({}, ["choices"], ["label"], ["value"], invalid)).toEqual([]);
    expect(() => rowOptions({ choices: {} }, ["choices"], ["label"], ["value"], invalid))
      .toThrow("choices");
  });

  it("tests single choices with Object.is instead of serialized values", () => {
    for (const value of [1, "1", false, "false", null, "", 0, -0]) {
      expect(rowOptionAvailable([value], value, false)).toBe(true);
    }
    for (const [available, value] of [
      [[1], "1"], [[false], "false"], [[null], ""], [[""], null], [[0], -0], [[-0], 0], [[], null], [[1], undefined]
    ] as const) {
      expect(rowOptionAvailable(available, value, false)).toBe(false);
    }
  });

  it("consumes multiple raw occurrences without changing either input", () => {
    const available = Object.freeze([1, 1, "1", false, null, "", 0, -0]);
    const selected = Object.freeze([1, "1", 1, false, null, "", -0, 0]);
    expect(rowOptionAvailable(available, selected, true)).toBe(true);
    expect(rowOptionAvailable([1], [1, 1], true)).toBe(false);
    expect(rowOptionAvailable([1, 1], [1, 1], true)).toBe(true);
    expect(rowOptionAvailable([0, 0], [0, -0], true)).toBe(false);
    expect(rowOptionAvailable([], [], true)).toBe(true);
    expect(rowOptionAvailable([null], null, true)).toBe(false);
    expect(available).toEqual([1, 1, "1", false, null, "", 0, -0]);
    expect(selected).toEqual([1, "1", 1, false, null, "", -0, 0]);
  });
});
