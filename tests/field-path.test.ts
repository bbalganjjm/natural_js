// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import { parsePath, readPath, writePath } from "../src/ui/field-path.js";

describe("UI object field paths", () => {
  it("reads and replaces a nested object field without changing its source", () => {
    const source = Object.freeze({
      profile: Object.freeze({ name: "Ada", team: "Platform" }),
      options: Object.freeze([{ aa: 11, bb: 22 }])
    });
    const path = parsePath("profile.name");
    const next = writePath(source, path, "Grace");
    expect(readPath(next, path)).toBe("Grace");
    expect(source.profile.name).toBe("Ada");
    expect(next.profile).not.toBe(source.profile);
    expect(next.options).toBe(source.options);
    expect(readPath(source, parsePath("profile.missing"))).toBeUndefined();
  });

  it.each(["", "a..b", "a.0", "a[0]", "a.__proto__", "constructor.name", "a.prototype"])(
    "rejects an unsafe field path: %s",
    path => expect(() => parsePath(path)).toThrowError(expect.objectContaining({ code: "FIELD_PATH" }))
  );

  it("rejects editing through a scalar or array parent", () => {
    expect(() => writePath({ profile: null }, parsePath("profile.name"), "A")).toThrow();
    expect(() => writePath({ profile: [] }, parsePath("profile.name"), "A")).toThrow();
  });
});