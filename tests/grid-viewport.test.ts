import { describe, expect, it } from "vitest";
import { validateGridViewport, viewportRange } from "../src/ui/grid-viewport.js";

function markup(spans: readonly (readonly number[])[]) {
  class Element {}
  const document = { defaultView: { HTMLElement: Element } };
  return {
    table: { ownerDocument: document } as unknown as HTMLTableElement,
    root: Object.assign(new Element(), { ownerDocument: document, contains: () => true }) as unknown as HTMLElement,
    rows: spans.map(cells => ({ cells: cells.map(rowSpan => ({ rowSpan })) })) as unknown as HTMLTableRowElement[]
  };
}

describe("Grid viewport geometry", () => {
  const offsets = [0, 20, 60, 90, 170, 190, 220];
  it("finds the measured intersection and omits the row beginning at the bottom edge", () => {
    expect(viewportRange(offsets, 20, 70, 0)).toEqual([1, 3]);
    expect(viewportRange(offsets, 21, 70, 0)).toEqual([1, 4]);
    expect(viewportRange(offsets, 80, 15, 0)).toEqual([2, 4]);
  });
  it("bounds overscan, an oversized row, header space and scroll overflow", () => {
    expect(viewportRange(offsets, 100, 20, 1)).toEqual([2, 5]);
    expect(viewportRange(offsets, -40, 60, 2)).toEqual([0, 3]);
    expect(viewportRange(offsets, 500, 200, 3)).toEqual([2, 6]);
    expect(viewportRange(offsets, 0, 500, 10)).toEqual([0, 6]);
  });
  it("handles empty and one-row projections without inventing rows", () => {
    expect(viewportRange([0], 0, 400, 3)).toEqual([0, 0]);
    expect(viewportRange([0, 300], 100, 50, 0)).toEqual([0, 1]);
  });
  it("accepts spans contained by an authored group without changing its zero-span markup", () => {
    const { table, root, rows } = markup([[0, 2], [1]]);
    expect(() => validateGridViewport(table, rows, { root, estimate: 80 })).not.toThrow();
    expect(rows[0].cells[0].rowSpan).toBe(0);
  });
  it("rejects spans crossing a logical RowId before acquiring viewport resources", () => {
    for (const spans of [[[2]], [[1], [2]], [[3], [1]]]) {
      const { table, root, rows } = markup(spans);
      expect(() => validateGridViewport(table, rows, { root, estimate: 80 })).toThrow("multiple logical rows");
    }
  });
});
