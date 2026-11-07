// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { readPath, writePath } from "./field-path.js";
import type { ParseInput } from "./index.js";

interface NativeDefault {
  name: string;
  path: readonly string[];
  value: unknown;
  element: HTMLElement;
  parse?: ParseInput;
}

export function createNativeDefaults(api: "bindForm" | "bindGrid", fields: readonly NativeDefault[], active: () => void) {
  const code = api === "bindForm" ? "FORM_DEFAULTS" : "GRID_DEFAULTS";
  let reading = false;
  function error(message: string, field?: string, cause?: unknown) {
    return new FrameworkError({ api, code, message, ...(field ? { detail: { field } } : {}), cause });
  }
  return (): Record<string, unknown> => {
    active();
    if (reading) throw error("Defaults cannot recursively read the same owner.");
    reading = true;
    try {
      const names = new Set<string>();
      for (const field of fields) {
        if (names.has(field.name)) throw error("Native defaults need distinct nonoverlapping paths.", field.name);
        names.add(field.name);
      }
      for (const field of fields) for (let index = 1; index < field.path.length; index++) {
        if (names.has(field.path.slice(0, index).join("."))) {
          throw error("Native defaults need distinct nonoverlapping paths.", field.name);
        }
      }
      let values: Record<string, unknown> = {};
      for (const field of fields) {
        try { values = writePath(values, field.path, structuredClone(field.value)); }
        catch (cause) { throw error("Native defaults have conflicting paths.", field.name, cause); }
      }
      let parsed = values;
      for (const field of fields) if (Object.hasOwn(field, "parse")) {
        try {
          const parse = field.parse!;
          const value = parse(String(readPath(values, field.path) ?? ""), {
            field: field.name, values, rowId: null, element: field.element
          });
          if (value === undefined) throw new TypeError("A default parser must return a raw value.");
          if (value !== null && (typeof value === "object" || typeof value === "function") &&
              typeof (value as { then?: unknown }).then === "function") {
            void Promise.resolve(value).catch(() => {});
            throw new TypeError("Default parsers must finish synchronously.");
          }
          parsed = writePath(parsed, field.path, value);
        } catch (cause) { throw error("A native default could not be parsed.", field.name, cause); }
        active();
      }
      try { return structuredClone(parsed); }
      catch (cause) { throw error("Defaults must contain cloneable raw values.", undefined, cause); }
    } finally { reading = false; }
  };
}
