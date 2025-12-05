/**
 * Type checking utilities for Natural-JS framework.
 * Functions for runtime type detection and validation.
 * SSR compatible - no browser-specific APIs.
 */

import { isBrowser, getDocument, NaturalElement } from '@natural-js/shared';

/**
 * Type names returned by the type() function.
 */
export type TypeName =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'function'
  | 'asyncfunction'
  | 'generatorfunction'
  | 'date'
  | 'regexp'
  | 'error'
  | 'null'
  | 'undefined'
  | 'symbol'
  | 'bigint'
  | 'map'
  | 'set'
  | 'weakmap'
  | 'weakset'
  | 'promise'
  | 'window'
  | 'htmlelement'
  | 'nodelist';

/**
 * Get the type of an object as a lowercase string.
 *
 * @param obj - Object to check
 * @returns Type name in lowercase
 *
 * @example
 * ```typescript
 * type('hello'); // 'string'
 * type(123); // 'number'
 * type([]); // 'array'
 * type({}); // 'object'
 * type(null); // 'null'
 * type(undefined); // 'undefined'
 * type(new Date()); // 'date'
 * type(/regex/); // 'regexp'
 * type(() => {}); // 'function'
 * type(async () => {}); // 'asyncfunction'
 * ```
 */
export function type(obj: unknown): TypeName | string {
  const match = {}.toString.call(obj).match(/\s([a-zA-Z]+)/);
  return match ? match[1]?.toLowerCase() ?? 'unknown' : 'unknown';
}

/**
 * Check if value is a string.
 *
 * @param obj - Value to check
 * @returns True if value is a string
 */
export function isString(obj: unknown): obj is string {
  return type(obj) === 'string';
}

/**
 * Check if value is numeric (can be parsed as a number).
 *
 * @param obj - Value to check
 * @returns True if value is numeric
 *
 * @example
 * ```typescript
 * isNumeric(123); // true
 * isNumeric('123'); // true
 * isNumeric('12.34'); // true
 * isNumeric('abc'); // false
 * isNumeric(NaN); // false
 * ```
 */
export function isNumeric(obj: unknown): boolean {
  return (typeof obj === 'number' || typeof obj === 'string') && !isNaN(Number(obj) - parseFloat(String(obj)));
}

/**
 * Check if value is a plain object (created by {} or new Object()).
 *
 * @param obj - Value to check
 * @returns True if value is a plain object
 */
export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  if (obj === null || obj === undefined) {
    return false;
  }
  if (typeof obj !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(obj);
  return proto === null || proto === Object.prototype;
}

/**
 * Check if value is an empty object or array.
 *
 * @param obj - Value to check
 * @returns True if value is empty
 */
export function isEmptyObject(obj: unknown): boolean {
  if (obj === null || obj === undefined) {
    return true;
  }
  if (Array.isArray(obj)) {
    return obj.length === 0;
  }
  if (typeof obj === 'object') {
    return Object.keys(obj as object).length === 0;
  }
  return false;
}

/**
 * Check if value is an array.
 *
 * @param obj - Value to check
 * @returns True if value is an array
 */
export function isArray(obj: unknown): obj is unknown[] {
  return Array.isArray(obj);
}

/**
 * Check if value is array-like (has numeric indices and length property).
 *
 * @param obj - Value to check
 * @returns True if value is array-like
 *
 * @example
 * ```typescript
 * isArraylike([1, 2, 3]); // true
 * isArraylike(document.querySelectorAll('div')); // true
 * isArraylike({ 0: 'a', 1: 'b', length: 2 }); // true
 * isArraylike('string'); // false (string has length but is not array-like in this context)
 * ```
 */
export function isArraylike(obj: unknown): boolean {
  if (typeof obj === 'undefined' || obj === null) {
    return false;
  }

  const objWithLength = obj as { length?: unknown; window?: unknown; nodeType?: number };

  if (objWithLength.length === undefined) {
    return false;
  }

  const t = type(obj);
  const length = objWithLength.length;

  // Exclude non-array-like types
  if (
    t === 'function' ||
    t === 'asyncfunction' ||
    t === 'string' ||
    t === 'number' ||
    t === 'date' ||
    t === 'boolean'
  ) {
    return false;
  }

  // Check for window object
  if (isBrowser() && objWithLength === objWithLength.window) {
    return false;
  }

  // Node with length
  if (objWithLength.nodeType === 1 && typeof length === 'number' && length > 0) {
    return true;
  }

  return (
    t === 'array' ||
    (typeof length === 'number' && length === 0) ||
    (typeof length === 'number' && length > 0 && length - 1 in (obj as Record<number, unknown>))
  );
}

/**
 * Check if value is a NaturalElement wrapped set.
 * This replaces the jQuery isWrappedSet check.
 *
 * @param obj - Value to check
 * @returns True if value is a NaturalElement
 */
export function isNaturalElement(obj: unknown): obj is NaturalElement {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  // Check for NaturalElement instance marker or jQuery marker
  const objWithMarker = obj as { _isNaturalElement?: boolean; jquery?: string; length?: number };
  // Must have length property and either marker
  if (objWithMarker.length === undefined) {
    return false;
  }
  return !!(objWithMarker._isNaturalElement || objWithMarker.jquery);
}

/**
 * Check if value is a DOM element.
 *
 * @param obj - Value to check
 * @returns True if value is a DOM element
 */
export function isElement(obj: unknown): obj is Element {
  if (!obj) return false;

  // Handle NaturalElement/jQuery wrapped objects
  if (isNaturalElement(obj)) {
    const wrapped = obj as { get?: (index: number) => Element };
    if (wrapped.get) {
      obj = wrapped.get(0);
    }
  }

  const doc = isBrowser() ? getDocument() : null;
  const el = obj as { getElementsByTagName?: unknown };

  return !!(el && el !== doc && typeof el.getElementsByTagName === 'function');
}

/**
 * Check if value is a function.
 *
 * @param obj - Value to check
 * @returns True if value is a function
 */
export function isFunction(obj: unknown): obj is (...args: unknown[]) => unknown {
  const t = type(obj);
  return t === 'function' || t === 'asyncfunction' || t === 'generatorfunction';
}

/**
 * Check if value is a boolean.
 *
 * @param obj - Value to check
 * @returns True if value is a boolean
 */
export function isBoolean(obj: unknown): obj is boolean {
  return type(obj) === 'boolean';
}

/**
 * Check if value is null or undefined.
 *
 * @param obj - Value to check
 * @returns True if value is null or undefined
 */
export function isNullish(obj: unknown): obj is null | undefined {
  return obj === null || obj === undefined;
}

/**
 * Check if value is a Date object.
 *
 * @param obj - Value to check
 * @returns True if value is a Date
 */
export function isDate(obj: unknown): obj is Date {
  return type(obj) === 'date';
}

/**
 * Check if value is a RegExp.
 *
 * @param obj - Value to check
 * @returns True if value is a RegExp
 */
export function isRegExp(obj: unknown): obj is RegExp {
  return type(obj) === 'regexp';
}

/**
 * Convert an element or array to a selector string representation.
 *
 * @param el - Element, wrapped set, or array to convert
 * @returns Selector string representation
 *
 * @example
 * ```typescript
 * toSelector(document.getElementById('myId')); // 'div#myId.class1.class2'
 * toSelector([1, 2, 3]); // '...[number](3)'
 * ```
 */
export function toSelector(el: unknown): string {
  if (typeof el === 'string') {
    return el;
  }

  // Handle NaturalElement/jQuery wrapped objects
  if (isNaturalElement(el)) {
    const wrapped = el as { get?: (index: number) => Element };
    if (wrapped.get) {
      el = wrapped.get(0);
    }
  }

  // Handle DOM element
  if (isElement(el)) {
    const element = el as Element;
    let selector = element.tagName.toLowerCase();
    if (element.id) {
      selector += '#' + element.id;
    }
    if (element.classList && element.classList.length > 0) {
      selector += '.' + Array.from(element.classList).join('.');
    }
    return selector;
  }

  // Handle arrays
  if (Array.isArray(el)) {
    if (el.length > 0) {
      const lastItem = el[el.length - 1];
      let itemType = type(lastItem);
      if (itemType.startsWith('[')) {
        itemType = itemType.replace(/[[\]]/g, '');
      } else if (itemType === 'string') {
        itemType = `"${itemType}"`;
      }
      return `...[${itemType}](${el.length})`;
    } else {
      return '...[](0)';
    }
  }

  return String(el);
}

/**
 * Type checking utilities namespace object.
 */
export const typeUtils = {
  type,
  isString,
  isNumeric,
  isPlainObject,
  isEmptyObject,
  isArray,
  isArraylike,
  isNaturalElement,
  isElement,
  isFunction,
  isBoolean,
  isNullish,
  isDate,
  isRegExp,
  toSelector,
} as const;

export default typeUtils;

