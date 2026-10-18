import { describe, expect, it } from "vitest";
import { readClipboard } from "../src/ui/grid-paste.js";

describe("Grid clipboard text", () => {
  it("preserves empty fields and ragged rows without adding a final phantom row", () => {
    expect(readClipboard("a\tb\r\nc\t\r\n\r\n")).toEqual([["a", "b"], ["c", ""], [""]]);
    expect(readClipboard("")).toEqual([[""]]);
    expect(readClipboard("\t")).toEqual([["", ""]]);
    expect(readClipboard("\n")).toEqual([[""]]);
  });
  it("reads quoted tabs, newlines, CRLF and escaped quotes", () => {
    expect(readClipboard('"a\tb"\t"line 1\r\nline 2"\n"say ""hi"""\t""'))
      .toEqual([["a\tb", "line 1\nline 2"], ['say "hi"', ""]]);
  });
  it("rejects malformed quoting with a clipboard position", () => {
    for (const text of ['"open', 'a"b', '"a"x', '"a""']) {
      expect(() => readClipboard(text)).toThrow(expect.objectContaining({ code: "GRID_PASTE_TEXT" }));
    }
    expect(() => readClipboard('a\tb\n1\t"open')).toThrow(expect.objectContaining({
      detail: { row: 2, column: 2 }
    }));
  });
  it("handles a large matrix with preserved cell positions", () => {
    const text = Array.from({ length: 2000 }, (_, index) => `${index}\tvalue ${index}`).join("\n");
    const rows = readClipboard(text);
    expect(rows).toHaveLength(2000);
    expect(rows[1999]).toEqual(["1999", "value 1999"]);
  });
});
