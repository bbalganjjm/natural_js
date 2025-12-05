/**
 * Type definitions for data utilities.
 */

/**
 * Data row type for data utilities.
 */
export type DataRow = Record<string, unknown>;

/**
 * Filter condition function type.
 */
export type FilterConditionFn<T = DataRow> = (item: T, index: number, array: T[]) => boolean;

/**
 * Filter condition as a string expression.
 * Uses property references that will be parsed.
 *
 * @example
 * 'name === "John"'
 * 'age > 18 && status === "active"'
 */
export type FilterConditionString = string;

/**
 * Filter condition type - can be a function or string.
 */
export type FilterCondition<T = DataRow> = FilterConditionFn<T> | FilterConditionString;

/**
 * Sort direction type.
 * - 'asc' or false: ascending order
 * - 'desc' or true: descending order
 */
export type SortDirection = 'asc' | 'desc' | boolean;

/**
 * Sort key type - can be a property name or a comparator function.
 */
export type SortKey<T = DataRow> = keyof T | string | ((a: T, b: T) => number);

/**
 * Options for the filter function.
 */
export interface FilterOptions {
  /** Whether to return a new array (default: true) */
  copy?: boolean;
}

/**
 * Options for the sort function.
 */
export interface SortOptions {
  /** Whether to sort in place or return a new array (default: false, sorts in place) */
  copy?: boolean;
  /** Custom locale for string comparison */
  locale?: string;
  /** Numeric sorting - if true, compares as numbers when possible */
  numeric?: boolean;
}

/**
 * Group result type.
 */
export type GroupResult<T = DataRow> = Record<string, T[]>;

/**
 * Aggregate function type.
 */
export type AggregateFn<T = DataRow, R = unknown> = (items: T[]) => R;

/**
 * Aggregate configuration.
 */
export interface AggregateConfig<T = DataRow> {
  /** The aggregation function */
  fn: AggregateFn<T>;
  /** The name for the result */
  name?: string;
}

