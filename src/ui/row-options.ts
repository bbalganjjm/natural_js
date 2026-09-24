// SPDX-License-Identifier: Apache-2.0
import { readPath } from "./field-path.js";

export type RowOptionValue = string | number | boolean | null;

export interface RowOption {
  readonly label: string;
  readonly raw: RowOptionValue;
}

function scalar(value: unknown): value is RowOptionValue {
  return value === null || typeof value === "string" || typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value));
}

export function rowOptions(
  row: unknown,
  options: readonly string[],
  label: readonly string[],
  value: readonly string[],
  invalid: (field: string) => never
): readonly RowOption[] {
  const source = readPath(row, options);
  if (source == null) return [];
  if (!Array.isArray(source)) return invalid(options.join("."));
  const result: RowOption[] = [];
  for (const item of source) {
    const text = readPath(item, label);
    const raw = readPath(item, value);
    if (scalar(text) && text !== null && text !== "" && scalar(raw)) {
      result.push({ label: String(text), raw });
    }
  }
  return result;
}
