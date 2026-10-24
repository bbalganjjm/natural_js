// SPDX-License-Identifier: Apache-2.0
export function sameJson(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
  if (Array.isArray(left)) {
    return Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => sameJson(item, right[index]));
  }
  if (Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length &&
    keys.every((key) => Object.hasOwn(right, key) &&
      sameJson((left as Readonly<Record<string, unknown>>)[key], (right as Readonly<Record<string, unknown>>)[key]));
}
