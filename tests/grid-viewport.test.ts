import { describe, expect, it } from "vitest";
import { viewportRange } from "../src/ui/grid-viewport.js";

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
});
