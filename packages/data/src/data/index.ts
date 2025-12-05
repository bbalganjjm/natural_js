/**
 * Data utility functions for Natural-JS.
 * Provides filtering, sorting, grouping, and other data manipulation utilities.
 */

import { isFunction, isString, isNumeric } from '@natural-js/core';
import {
  DataRow,
  FilterCondition,
  FilterConditionFn,
  FilterOptions,
  SortDirection,
  SortOptions,
  GroupResult,
  AggregateFn,
} from './types';

// Re-export types
export * from './types';

/**
 * Filter an array based on a condition.
 *
 * @param arr - The array to filter
 * @param condition - A function or string condition
 * @param options - Filter options
 * @returns Filtered array
 *
 * @example
 * // Using a function condition
 * filter(users, (user) => user.age > 18);
 *
 * @example
 * // Using a string condition
 * filter(users, 'age > 18 && status === "active"');
 */
export function filter<T extends DataRow>(
  arr: T[],
  condition: FilterCondition<T>,
  options?: FilterOptions
): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  if (!condition) {
    return options?.copy === false ? arr : [...arr];
  }

  let filterFn: FilterConditionFn<T>;

  if (isFunction(condition)) {
    filterFn = condition as FilterConditionFn<T>;
  } else if (isString(condition)) {
    // Parse string condition
    // Replace && and || with proper item references
    // Example: 'name === "John" && age > 18' -> 'item.name === "John" && item.age > 18'
    let parsedCondition = condition
      .replace(/ /g, '')
      .replace(/\|\|/g, ' || item.')
      .replace(/&&/g, ' && item.');

    // Handle the first property reference
    if (!parsedCondition.startsWith('item.')) {
      parsedCondition = 'item.' + parsedCondition;
    }

    try {
      // Create a filter function from the string
      // Note: Using Function constructor is intentional here for dynamic condition parsing
      // This matches the original ND.data.filter behavior
      const testFn = new Function('item', 'return ' + parsedCondition) as (item: T) => boolean;
      filterFn = (item: T) => {
        try {
          return testFn(item);
        } catch {
          return false;
        }
      };
    } catch {
      console.warn('[data.filter] Invalid condition string:', condition);
      return options?.copy === false ? arr : [...arr];
    }
  } else {
    return options?.copy === false ? arr : [...arr];
  }

  return arr.filter(filterFn);
}

/**
 * Create a sort comparator function for a given key.
 *
 * @param key - The property key to sort by
 * @param reverse - Sort direction multiplier (1 for asc, -1 for desc)
 * @param options - Sort options
 * @returns A comparator function
 */
function sortBy<T extends DataRow>(
  key: string,
  reverse: number,
  options?: SortOptions
): (a: T, b: T) => number {
  return function (a: T, b: T): number {
    let aVal: unknown = a[key];
    let bVal: unknown = b[key];

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return reverse;
    if (bVal == null) return -reverse;

    // Try numeric comparison if values look like numbers
    const aNum = Number(aVal);
    const bNum = Number(bVal);

    if (options?.numeric !== false && !isNaN(aNum) && !isNaN(bNum)) {
      // Use numeric comparison
      if (aNum < bNum) {
        return reverse * -1;
      }
      if (aNum > bNum) {
        return reverse * 1;
      }
      return 0;
    }

    // Compare as strings
    const aStr = String(aVal);
    const bStr = String(bVal);
    if (aStr < bStr) {
      return reverse * -1;
    }
    if (aStr > bStr) {
      return reverse * 1;
    }
    return 0;
  };
}

/**
 * Sort an array by a key or comparator function.
 *
 * @param arr - The array to sort
 * @param key - The property key to sort by, or a comparator function
 * @param direction - Sort direction ('asc', 'desc', true for desc, false for asc)
 * @param options - Sort options
 * @returns The sorted array
 *
 * @example
 * // Sort by name ascending
 * sort(users, 'name');
 *
 * @example
 * // Sort by age descending
 * sort(users, 'age', 'desc');
 *
 * @example
 * // Sort with custom comparator
 * sort(users, (a, b) => a.name.localeCompare(b.name));
 */
export function sort<T extends DataRow>(
  arr: T[],
  key: string | ((a: T, b: T) => number),
  direction?: SortDirection,
  options?: SortOptions
): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  // Determine sort direction
  let reverse: number;
  if (direction === 'desc' || direction === true) {
    reverse = -1;
  } else {
    reverse = 1;
  }

  // Create working array
  const workArr = options?.copy ? [...arr] : arr;

  // Sort
  if (isFunction(key)) {
    workArr.sort(key as (a: T, b: T) => number);
  } else {
    workArr.sort(sortBy(key as string, reverse, options));
  }

  return workArr;
}

/**
 * Group an array by a key.
 *
 * @param arr - The array to group
 * @param key - The property key to group by
 * @returns An object with keys as group values and values as arrays of items
 *
 * @example
 * const users = [
 *   { name: 'John', department: 'Sales' },
 *   { name: 'Jane', department: 'HR' },
 *   { name: 'Bob', department: 'Sales' }
 * ];
 * groupBy(users, 'department');
 * // { Sales: [...], HR: [...] }
 */
export function groupBy<T extends DataRow>(
  arr: T[],
  key: string
): GroupResult<T> {
  if (!Array.isArray(arr)) {
    return {};
  }

  const result: GroupResult<T> = {};

  for (const item of arr) {
    const groupKey = String(item[key] ?? 'undefined');
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
  }

  return result;
}

/**
 * Find the first item matching a condition.
 *
 * @param arr - The array to search
 * @param condition - A function or string condition
 * @returns The first matching item, or undefined
 */
export function find<T extends DataRow>(
  arr: T[],
  condition: FilterCondition<T>
): T | undefined {
  const filtered = filter(arr, condition);
  return filtered[0];
}

/**
 * Find the index of the first item matching a condition.
 *
 * @param arr - The array to search
 * @param condition - A function or string condition
 * @returns The index of the first matching item, or -1
 */
export function findIndex<T extends DataRow>(
  arr: T[],
  condition: FilterCondition<T>
): number {
  if (!Array.isArray(arr)) {
    return -1;
  }

  if (isFunction(condition)) {
    return arr.findIndex(condition as FilterConditionFn<T>);
  }

  // For string conditions, we need to filter and find the index
  for (let i = 0; i < arr.length; i++) {
    const filtered = filter([arr[i] as T], condition);
    if (filtered.length > 0) {
      return i;
    }
  }
  return -1;
}

/**
 * Check if any item matches a condition.
 *
 * @param arr - The array to check
 * @param condition - A function or string condition
 * @returns true if any item matches
 */
export function some<T extends DataRow>(
  arr: T[],
  condition: FilterCondition<T>
): boolean {
  return findIndex(arr, condition) !== -1;
}

/**
 * Check if all items match a condition.
 *
 * @param arr - The array to check
 * @param condition - A function or string condition
 * @returns true if all items match
 */
export function every<T extends DataRow>(
  arr: T[],
  condition: FilterCondition<T>
): boolean {
  return filter(arr, condition).length === arr.length;
}

/**
 * Sum values of a numeric property.
 *
 * @param arr - The array
 * @param key - The property key
 * @returns The sum
 */
export function sum<T extends DataRow>(arr: T[], key: string): number {
  if (!Array.isArray(arr)) {
    return 0;
  }

  return arr.reduce((acc, item) => {
    const val = Number(item[key]);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
}

/**
 * Calculate the average of a numeric property.
 *
 * @param arr - The array
 * @param key - The property key
 * @returns The average, or NaN if no valid values
 */
export function avg<T extends DataRow>(arr: T[], key: string): number {
  if (!Array.isArray(arr) || arr.length === 0) {
    return NaN;
  }

  const total = sum(arr, key);
  return total / arr.length;
}

/**
 * Find the minimum value of a property.
 *
 * @param arr - The array
 * @param key - The property key
 * @returns The minimum value, or undefined if empty
 */
export function min<T extends DataRow>(arr: T[], key: string): number | undefined {
  if (!Array.isArray(arr) || arr.length === 0) {
    return undefined;
  }

  let minVal: number | undefined;
  for (const item of arr) {
    const val = Number(item[key]);
    if (!isNaN(val) && (minVal === undefined || val < minVal)) {
      minVal = val;
    }
  }
  return minVal;
}

/**
 * Find the maximum value of a property.
 *
 * @param arr - The array
 * @param key - The property key
 * @returns The maximum value, or undefined if empty
 */
export function max<T extends DataRow>(arr: T[], key: string): number | undefined {
  if (!Array.isArray(arr) || arr.length === 0) {
    return undefined;
  }

  let maxVal: number | undefined;
  for (const item of arr) {
    const val = Number(item[key]);
    if (!isNaN(val) && (maxVal === undefined || val > maxVal)) {
      maxVal = val;
    }
  }
  return maxVal;
}

/**
 * Count items matching a condition.
 *
 * @param arr - The array
 * @param condition - Optional condition
 * @returns The count
 */
export function count<T extends DataRow>(
  arr: T[],
  condition?: FilterCondition<T>
): number {
  if (!Array.isArray(arr)) {
    return 0;
  }

  if (!condition) {
    return arr.length;
  }

  return filter(arr, condition).length;
}

/**
 * Get unique values of a property.
 *
 * @param arr - The array
 * @param key - The property key
 * @returns Array of unique values
 */
export function distinct<T extends DataRow>(arr: T[], key: string): unknown[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  const seen = new Set<unknown>();
  const result: unknown[] = [];

  for (const item of arr) {
    const val = item[key];
    if (!seen.has(val)) {
      seen.add(val);
      result.push(val);
    }
  }

  return result;
}

/**
 * Pluck values of a property into an array.
 *
 * @param arr - The array
 * @param key - The property key
 * @returns Array of values
 */
export function pluck<T extends DataRow>(arr: T[], key: string): unknown[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.map((item) => item[key]);
}

/**
 * Get the first n items.
 *
 * @param arr - The array
 * @param n - Number of items (default: 1)
 * @returns Array of first n items
 */
export function first<T extends DataRow>(arr: T[], n: number = 1): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.slice(0, n);
}

/**
 * Get the last n items.
 *
 * @param arr - The array
 * @param n - Number of items (default: 1)
 * @returns Array of last n items
 */
export function last<T extends DataRow>(arr: T[], n: number = 1): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.slice(-n);
}

/**
 * Skip the first n items.
 *
 * @param arr - The array
 * @param n - Number of items to skip
 * @returns Array without first n items
 */
export function skip<T extends DataRow>(arr: T[], n: number): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.slice(n);
}

/**
 * Take the first n items.
 *
 * @param arr - The array
 * @param n - Number of items to take
 * @returns Array of first n items
 */
export function take<T extends DataRow>(arr: T[], n: number): T[] {
  return first(arr, n);
}

/**
 * Paginate an array.
 *
 * @param arr - The array
 * @param page - Page number (1-based)
 * @param pageSize - Items per page
 * @returns Object with paginated data and metadata
 */
export function paginate<T extends DataRow>(
  arr: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  if (!Array.isArray(arr)) {
    return { data: [], total: 0, page: 1, pageSize, totalPages: 0 };
  }

  const total = arr.length;
  const totalPages = Math.ceil(total / pageSize);
  const validPage = Math.max(1, Math.min(page, totalPages));
  const start = (validPage - 1) * pageSize;
  const data = arr.slice(start, start + pageSize);

  return {
    data,
    total,
    page: validPage,
    pageSize,
    totalPages,
  };
}

/**
 * Data utilities namespace object.
 * Provides a convenient way to access all data utility functions.
 */
export const data = {
  filter,
  sort,
  groupBy,
  find,
  findIndex,
  some,
  every,
  sum,
  avg,
  min,
  max,
  count,
  distinct,
  pluck,
  first,
  last,
  skip,
  take,
  paginate,
};

