/**
 * Array utilities for Natural-JS framework.
 * Functions for array manipulation and deduplication.
 * SSR compatible - no browser-specific APIs.
 */

import type { JSONObject } from '@natural-js/shared';

/**
 * Get the type of an object (internal helper).
 */
function getType(obj: unknown): string {
  return Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)?.[1]?.toLowerCase() ?? '';
}

/**
 * Remove duplicate items from an array.
 * For objects, can specify a key to check for duplicates.
 *
 * @param arr - The array to deduplicate
 * @param key - Optional key to use for object comparison
 * @returns New array with duplicates removed
 *
 * @example
 * ```typescript
 * // Deduplicate primitives
 * deduplicate([1, 2, 2, 3, 3, 3]); // [1, 2, 3]
 *
 * // Deduplicate objects by key
 * const arr = [{ id: 1 }, { id: 2 }, { id: 1 }];
 * deduplicate(arr, 'id'); // [{ id: 1 }, { id: 2 }]
 * ```
 */
export function deduplicate<T>(arr: T[], key?: keyof T): T[] {
  const result: T[] = [];

  for (const item of arr) {
    if (getType(item) === 'object' && key !== undefined) {
      // For objects with key, check if value at key already exists
      const existingKeys = result.map((r) => (r as Record<string, unknown>)[key as string]);
      const itemKey = (item as Record<string, unknown>)[key as string];
      if (!existingKeys.includes(itemKey)) {
        result.push(item);
      }
    } else {
      // For primitives or objects without key
      if (!result.includes(item)) {
        result.push(item);
      }
    }
  }

  return result;
}

/**
 * Remove duplicate items using a Set (faster for primitives).
 *
 * @param arr - The array to deduplicate
 * @returns New array with duplicates removed
 *
 * @example
 * ```typescript
 * uniqueArray([1, 2, 2, 3, 3, 3]); // [1, 2, 3]
 * uniqueArray(['a', 'b', 'a']); // ['a', 'b']
 * ```
 */
export function uniqueArray<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Find the intersection of two arrays.
 *
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Array containing items present in both arrays
 *
 * @example
 * ```typescript
 * intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
 * ```
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

/**
 * Find the difference between two arrays (items in arr1 not in arr2).
 *
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Array containing items in arr1 but not in arr2
 *
 * @example
 * ```typescript
 * difference([1, 2, 3], [2, 3, 4]); // [1]
 * ```
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

/**
 * Flatten a nested array to a specified depth.
 *
 * @param arr - The array to flatten
 * @param depth - Maximum depth to flatten (default: 1)
 * @returns Flattened array
 *
 * @example
 * ```typescript
 * flatten([[1, 2], [3, [4, 5]]]); // [1, 2, 3, [4, 5]]
 * flatten([[1, 2], [3, [4, 5]]], 2); // [1, 2, 3, 4, 5]
 * ```
 */
export function flatten<T>(arr: unknown[], depth: number = 1): T[] {
  return arr.flat(depth) as T[];
}

/**
 * Group array items by a key.
 *
 * @param arr - The array to group
 * @param key - Key to group by
 * @returns Object with keys as group names and values as arrays of items
 *
 * @example
 * ```typescript
 * const items = [
 *   { type: 'fruit', name: 'apple' },
 *   { type: 'fruit', name: 'banana' },
 *   { type: 'vegetable', name: 'carrot' }
 * ];
 * groupBy(items, 'type');
 * // { fruit: [{ type: 'fruit', name: 'apple' }, ...], vegetable: [...] }
 * ```
 */
export function groupBy<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T
): Record<string, T[]> {
  return arr.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Chunk an array into smaller arrays of specified size.
 *
 * @param arr - The array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 *
 * @example
 * ```typescript
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Array utilities namespace object.
 * Provides all array functions as properties for compatibility.
 */
export const array = {
  deduplicate,
  uniqueArray,
  intersection,
  difference,
  flatten,
  groupBy,
  chunk,
} as const;

export default array;

