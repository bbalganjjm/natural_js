// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import { rowOptions } from "../src/ui/row-options.js";

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
});
