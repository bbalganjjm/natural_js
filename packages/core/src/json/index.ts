/**
 * JSON utilities for Natural-JS framework.
 * Functions for JSON manipulation and formatting.
 * SSR compatible - no browser-specific APIs.
 */

import type { JSONObject, JSONValue } from '@natural-js/shared';

/**
 * Get the type of an object (internal helper).
 */
function getType(obj: unknown): string {
  return Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)?.[1]?.toLowerCase() ?? '';
}

/**
 * Check if an object is empty.
 */
function isEmptyObject(obj: unknown): boolean {
  if (obj === null || obj === undefined) return true;
  if (typeof obj !== 'object') return false;
  return Object.keys(obj as object).length === 0;
}

/**
 * Create a new object or array containing only the specified keys.
 *
 * @param obj - Source object or array of objects
 * @param keys - Keys to include in the result
 * @returns New object/array with only specified keys
 *
 * @example
 * ```typescript
 * // Single object
 * mapFromKeys({ id: 1, name: 'John', age: 30 }, 'id', 'name');
 * // { id: 1, name: 'John' }
 *
 * // Array of objects
 * mapFromKeys([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }], 'id');
 * // [{ id: 1 }, { id: 2 }]
 * ```
 */
export function mapFromKeys<T extends JSONObject>(
  obj: T | T[],
  ...keys: string[]
): Partial<T> | Partial<T>[] {
  if (keys.length === 0) {
    return obj as Partial<T> | Partial<T>[];
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return obj;
    }
    return obj.map((item) => {
      const result: Partial<T> = {};
      for (const key of keys) {
        if (key !== undefined && item[key] !== undefined) {
          (result as Record<string, unknown>)[key] = item[key];
        }
      }
      return result;
    });
  } else {
    const result: Partial<T> = {};
    for (const key of keys) {
      if (key !== undefined && obj[key] !== undefined) {
        (result as Record<string, unknown>)[key] = obj[key];
      }
    }
    return result;
  }
}

/**
 * Merge two JSON arrays by a key, avoiding duplicates.
 * Items from arr2 are added to arr1 only if their key value doesn't exist in arr1.
 *
 * @param arr1 - First array (will be modified)
 * @param arr2 - Second array to merge from
 * @param key - Key to check for duplicates
 * @returns The merged arr1
 *
 * @example
 * ```typescript
 * const arr1 = [{ id: 1, name: 'John' }];
 * const arr2 = [{ id: 2, name: 'Jane' }, { id: 1, name: 'John Doe' }];
 * mergeJsonArray(arr1, arr2, 'id');
 * // arr1 is now [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
 * ```
 */
export function mergeJsonArray<T extends JSONObject>(arr1: T[], arr2: T[], key: keyof T): T[] {
  const keySet = new Set(arr1.map((item) => String(item[key])));

  for (const item of arr2) {
    const itemKey = String(item[key]);
    if (!keySet.has(itemKey)) {
      arr1.push(item);
      keySet.add(itemKey);
    }
  }

  return arr1;
}

/**
 * Format JSON data as a pretty-printed string.
 *
 * @param data - JSON data (object, array, or JSON string)
 * @param indent - Number of spaces for indentation (default: 4)
 * @returns Formatted JSON string or null if data is empty
 *
 * @example
 * ```typescript
 * formatJson({ name: 'John', age: 30 });
 * // '{\n    "name": "John",\n    "age": 30\n}'
 *
 * formatJson('{"name":"John"}', 2);
 * // '{\n  "name": "John"\n}'
 * ```
 */
export function formatJson(data: JSONObject | JSONObject[] | string, indent: number = 4): string | null {
  if (isEmptyObject(data)) {
    return null;
  }

  let parsed: unknown = data;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch {
      return null;
    }
  }

  return JSON.stringify(parsed, undefined, indent);
}

/**
 * Safely parse a JSON string.
 *
 * @param jsonString - JSON string to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed JSON or default value
 *
 * @example
 * ```typescript
 * safeParse('{"name":"John"}'); // { name: 'John' }
 * safeParse('invalid json', {}); // {}
 * ```
 */
export function safeParse<T = JSONValue>(jsonString: string, defaultValue?: T): T | undefined {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Deep clone a JSON-compatible object.
 *
 * @param obj - Object to clone
 * @returns Deep clone of the object
 *
 * @example
 * ```typescript
 * const original = { nested: { value: 1 } };
 * const clone = deepClone(original);
 * clone.nested.value = 2;
 * // original.nested.value is still 1
 * ```
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep merge multiple objects.
 *
 * @param target - Target object
 * @param sources - Source objects to merge
 * @returns Merged object
 *
 * @example
 * ```typescript
 * const result = deepMerge(
 *   { a: 1, b: { c: 2 } },
 *   { b: { d: 3 } }
 * );
 * // { a: 1, b: { c: 2, d: 3 } }
 * ```
 */
export function deepMerge<T extends JSONObject>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target };

  for (const source of sources) {
    if (source === null || source === undefined) continue;

    for (const key of Object.keys(source)) {
      const sourceValue = source[key as keyof T];
      const targetValue = result[key as keyof T];

      if (
        targetValue &&
        sourceValue &&
        getType(targetValue) === 'object' &&
        getType(sourceValue) === 'object' &&
        !Array.isArray(targetValue) &&
        !Array.isArray(sourceValue)
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          targetValue as JSONObject,
          sourceValue as JSONObject
        );
      } else {
        (result as Record<string, unknown>)[key] = sourceValue;
      }
    }
  }

  return result;
}

/**
 * Pick specific keys from an object.
 *
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns New object with only specified keys
 *
 * @example
 * ```typescript
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
 * ```
 */
export function pick<T extends JSONObject, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific keys from an object.
 *
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns New object without specified keys
 *
 * @example
 * ```typescript
 * omit({ a: 1, b: 2, c: 3 }, ['b']); // { a: 1, c: 3 }
 * ```
 */
export function omit<T extends JSONObject, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Check if two objects are deeply equal.
 *
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns True if objects are deeply equal
 *
 * @example
 * ```typescript
 * deepEqual({ a: 1 }, { a: 1 }); // true
 * deepEqual({ a: 1 }, { a: 2 }); // false
 * deepEqual({ a: { b: 1 } }, { a: { b: 1 } }); // true
 * ```
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * JSON utilities namespace object.
 * Provides all JSON functions as properties for compatibility.
 */
export const json = {
  mapFromKeys,
  mergeJsonArray,
  formatJson,
  safeParse,
  deepClone,
  deepMerge,
  pick,
  omit,
  deepEqual,
} as const;

export default json;

