// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";

const SEGMENT = /^[\p{L}_$][\p{L}\p{N}_$-]*$/u;
const UNSAFE = new Set(["__proto__", "prototype", "constructor"]);

function pathError(path: string, message: string): FrameworkError {
  return new FrameworkError({
    api: "fieldPath",
    code: "FIELD_PATH",
    message,
    detail: { path }
  });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parsePath(path: string): readonly string[] {
  if (!path || !path.trim()) {
    throw pathError(path, "A field path must name a property.");
  }
  const segments = path.split(".");
  if (segments.some((segment) => !SEGMENT.test(segment) || UNSAFE.has(segment))) {
    throw pathError(path, "A field path must contain safe object property names without array indices.");
  }
  return Object.freeze(segments);
}

export function readPath(value: unknown, path: readonly string[]): unknown {
  let current = value;
  for (const segment of path) {
    if (!isRecord(current) || !Object.hasOwn(current, segment)) return undefined;
    current = current[segment];
  }
  return current;
}

export function writePath(
  source: Readonly<Record<string, unknown>>,
  path: readonly string[],
  value: unknown
): Record<string, unknown> {
  if (!path.length) throw pathError("", "A field path must name a property.");

  function copyAt(object: Readonly<Record<string, unknown>>, index: number): Record<string, unknown> {
    const key = path[index];
    if (index === path.length - 1) return { ...object, [key]: value };
    const next = object[key];
    if (next !== undefined && !isRecord(next)) {
      throw pathError(path.join("."), "A nested field requires an object at each parent property.");
    }
    return { ...object, [key]: copyAt(next ?? {}, index + 1) };
  }

  return copyAt(source, 0);
}