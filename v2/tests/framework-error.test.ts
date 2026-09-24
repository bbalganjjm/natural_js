import { describe, expect, it } from "vitest";
import { FrameworkError } from "@bbalganjjm/natural_js";

describe("FrameworkError", () => {
  it("preserves the public context and original cause", () => {
    const cause = new Error("original failure");
    const detail = { field: "profile.name" };
    const error = new FrameworkError({
      code: "FIELD_MISSING",
      api: "bindForm",
      message: "A field is missing.",
      cause,
      detail
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("A field is missing.");
    expect(error.code).toBe("FIELD_MISSING");
    expect(error.api).toBe("bindForm");
    expect(error.cause).toBe(cause);
    expect(error.detail).toEqual(detail);
  });

  it("rejects a blank error code from a JavaScript consumer", () => {
    expect(() => new FrameworkError({
      code: " ", api: "bindForm", message: "Missing field"
    })).toThrow(TypeError);
  });
});
