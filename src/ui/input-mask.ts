// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { genericInput, genericPattern, numericInput, numericPattern, projectGeneric, projectNumeric } from "./format-rules.js";

function maskError(code: string, message: string): FrameworkError {
  return new FrameworkError({ api: "createInputMask", code, message });
}

function issue(code: 1 | 2, phase: "pattern" | "value", message: string) {
  return { code, phase, message } as const;
}

function result(value: string, stripped: string, complete: boolean, next: "#" | "@" | "~" | null,
  issues: readonly ReturnType<typeof issue>[] = []) {
  return { value, stripped, complete, next, issues } as const;
}

export function createInputMask(options:
  | { readonly kind: "generic"; readonly pattern: string; readonly partial?: boolean }
  | { readonly kind: "numeric"; readonly pattern: string; readonly partial?: boolean;
      readonly rounding?: "round" | "ceil" | "floor" }
) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw maskError("MASK_DECLARATION", "A mask needs an options object.");
  }
  const { kind, pattern, partial: partialOption } = options;
  const roundingOption = (options as { readonly rounding?: unknown }).rounding;
  if (kind !== "generic" && kind !== "numeric" || typeof pattern !== "string" ||
      partialOption !== undefined && typeof partialOption !== "boolean" ||
      kind === "generic" && roundingOption !== undefined ||
      roundingOption !== undefined && roundingOption !== "round" && roundingOption !== "ceil" && roundingOption !== "floor") {
    throw maskError("MASK_DECLARATION", "Use a generic or numeric string pattern, boolean partial and numeric round, ceil or floor.");
  }
  const partial = partialOption ?? false;
  const rounding = roundingOption === "ceil" || roundingOption === "floor" ? roundingOption : "round";
  const generic = kind === "generic" ? genericPattern(pattern) : undefined;
  let numeric: ReturnType<typeof numericPattern> = null, patternIssue: ReturnType<typeof issue> | undefined;
  if (kind === "numeric") {
    try { numeric = numericPattern(pattern); }
    catch { patternIssue = issue(1, "pattern", "The numeric pattern is invalid."); }
  }
  let previous = "";
  return {
    apply(input: string, options?: { readonly deleting?: boolean }) {
      if (typeof input !== "string") throw maskError("MASK_VALUE", "A mask input must be text.");
      if (options !== undefined && (!options || typeof options !== "object" || Array.isArray(options))) {
        throw maskError("MASK_VALUE", "Mask apply options need an object.");
      }
      const deleting = options?.deleting;
      if (deleting !== undefined && typeof deleting !== "boolean") {
        throw maskError("MASK_VALUE", "deleting must be boolean.");
      }
      let stripped = generic ? genericInput(input) : numericInput(input, numeric);
      if (deleting && stripped === previous) stripped = Array.from(stripped).slice(0, -1).join("");
      previous = stripped;
      if (generic) {
        const projected = projectGeneric(stripped, generic, partial);
        return !partial && !projected.complete
          ? result(input, stripped, false, projected.next, [issue(1, "value", "Input does not match the generic pattern.")])
          : result(projected.value, stripped, projected.complete, projected.next);
      }
      if (patternIssue) return result(input, stripped, false, null, [{ ...patternIssue }]);
      if (partial && (stripped === "" || stripped === "-" || stripped === "." || stripped === "-.")) {
        return result(stripped, stripped, false, null);
      }
      const value = projectNumeric(stripped, numeric, rounding, partial);
      return value === null
        ? result(input, stripped, false, null, [issue(2, "value", "Input must contain a valid number.")])
        : result(value, stripped, !partial || !stripped.endsWith("."), null);
    }
  };
}
