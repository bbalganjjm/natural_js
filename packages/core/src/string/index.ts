/**
 * String utilities for Natural-JS framework.
 * Pure functions for string manipulation - SSR compatible.
 */

// Default character byte length for multi-byte characters
const DEFAULT_CHAR_BYTE_LENGTH = 3;

/**
 * Check if a string contains another string.
 *
 * @param context - The string to search in
 * @param str - The string to search for
 * @returns True if context contains str
 * @throws Error if context is not a string
 *
 * @example
 * ```typescript
 * contains('hello world', 'world'); // true
 * contains('hello', 'bye'); // false
 * ```
 */
export function contains(context: string, str: string): boolean {
  if (typeof context !== 'string') {
    throw new Error('[NC.string.contains] arguments[0] was not entered or is not of string type.');
  }
  return context.indexOf(str) > -1;
}

/**
 * Check if a string ends with another string.
 *
 * @param context - The string to check
 * @param str - The ending to check for
 * @returns True if context ends with str
 * @throws Error if context is not a string
 *
 * @example
 * ```typescript
 * endsWith('hello.txt', '.txt'); // true
 * endsWith('hello', 'llo'); // true
 * ```
 */
export function endsWith(context: string, str: string): boolean {
  if (typeof context !== 'string') {
    throw new Error('[NC.string.endsWith] arguments[0] was not entered or is not of string type.');
  }
  return context.indexOf(str, context.length - str.length) !== -1;
}

/**
 * Check if a string starts with another string.
 *
 * @param context - The string to check
 * @param str - The prefix to check for
 * @returns True if context starts with str
 * @throws Error if context is not a string
 *
 * @example
 * ```typescript
 * startsWith('hello world', 'hello'); // true
 * startsWith('hello', 'ello'); // false
 * ```
 */
export function startsWith(context: string, str: string): boolean {
  if (typeof context !== 'string') {
    throw new Error(
      '[NC.string.startsWith] arguments[0] was not entered or is not of string type.'
    );
  }
  return context.indexOf(str) === 0;
}

/**
 * Insert a string at a specific position.
 *
 * @param context - The original string
 * @param idx - The position to insert at
 * @param str - The string to insert
 * @returns The resulting string
 *
 * @example
 * ```typescript
 * insertAt('hello world', 5, '!!!'); // 'hello!!! world'
 * insertAt('abc', 1, 'X'); // 'aXbc'
 * ```
 */
export function insertAt(context: string, idx: number, str: string): string {
  return context.substring(0, idx) + str + context.substring(idx);
}

/**
 * Remove all whitespace from a string.
 *
 * @param str - The string to process
 * @returns String with all whitespace removed
 *
 * @example
 * ```typescript
 * removeWhitespace(' hello world '); // 'helloworld'
 * removeWhitespace('a b c'); // 'abc'
 * ```
 */
export function removeWhitespace(str: string): string {
  if (str === null || str === undefined || str === '') {
    return str ?? '';
  }
  return str.replace(/\s/g, '');
}

/**
 * Left pad a string to a specified length.
 *
 * @param str - The string to pad
 * @param length - The desired total length
 * @param padStr - The string to pad with
 * @returns The padded string
 *
 * @example
 * ```typescript
 * lpad('123', 5, '0'); // '00123'
 * lpad('abc', 6, 'X'); // 'XXXabc'
 * ```
 */
export function lpad(str: string, length: number, padStr: string): string {
  let result = str;
  while (result.length < length) {
    result = padStr + result;
  }
  return result;
}

/**
 * Right pad a string to a specified length.
 *
 * @param str - The string to pad
 * @param length - The desired total length
 * @param padStr - The string to pad with
 * @returns The padded string
 *
 * @example
 * ```typescript
 * rpad('123', 5, '0'); // '12300'
 * rpad('abc', 6, 'X'); // 'abcXXX'
 * ```
 */
export function rpad(str: string, length: number, padStr: string): string {
  let result = str;
  while (result.length < length) {
    result = result + padStr;
  }
  return result;
}

/**
 * Check if a string is empty (null, undefined, or only whitespace).
 *
 * @param str - The string to check
 * @returns True if the string is empty
 *
 * @example
 * ```typescript
 * isEmpty(''); // true
 * isEmpty('   '); // true
 * isEmpty(null); // true
 * isEmpty('hello'); // false
 * ```
 */
export function isEmpty(str: string | null | undefined): boolean {
  return trimToEmpty(str).length === 0;
}

/**
 * Calculate the byte length of a string.
 * Multi-byte characters (e.g., Korean, Chinese) use more bytes.
 *
 * @param str - The string to measure
 * @param charByteLength - Byte length for multi-byte characters (default: 3 for UTF-8)
 * @returns The byte length of the string
 *
 * @example
 * ```typescript
 * byteLength('abc', 3); // 3
 * byteLength('한글', 3); // 6
 * byteLength('한글abc', 3); // 9
 * ```
 */
export function byteLength(str: string, charByteLength: number = DEFAULT_CHAR_BYTE_LENGTH): number {
  let bytes = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    // charCode >> 11 checks if it's a character > 0x7FF (multi-byte in UTF-8)
    // charCode >> 7 checks if it's a character > 0x7F (2+ bytes in UTF-8)
    if (charCode >> 11) {
      bytes += charByteLength;
    } else if (charCode >> 7) {
      bytes += 2;
    } else {
      bytes += 1;
    }
  }
  return bytes;
}

/**
 * Trim a string and return empty string if null/undefined.
 *
 * @param str - The string to trim
 * @returns Trimmed string or empty string if null/undefined
 *
 * @example
 * ```typescript
 * trimToEmpty('  hello  '); // 'hello'
 * trimToEmpty(null); // ''
 * trimToEmpty(undefined); // ''
 * ```
 */
export function trimToEmpty(str: string | null | undefined): string {
  return str !== undefined && str !== null ? String(str).trim() : '';
}

/**
 * Convert null or undefined to empty string.
 * Does not trim the string.
 *
 * @param str - The string to convert
 * @returns The original string or empty string if null/undefined
 *
 * @example
 * ```typescript
 * nullToEmpty(null); // ''
 * nullToEmpty(undefined); // ''
 * nullToEmpty('  hello  '); // '  hello  '
 * ```
 */
export function nullToEmpty(str: string | null | undefined): string {
  return str === null || str === undefined ? '' : str;
}

/**
 * Trim a string and return null if empty.
 *
 * @param str - The string to trim
 * @returns Trimmed string or null if empty
 *
 * @example
 * ```typescript
 * trimToNull('  hello  '); // 'hello'
 * trimToNull('   '); // null
 * trimToNull(''); // null
 * ```
 */
export function trimToNull(str: string | null | undefined): string | null {
  const trimmed = trimToEmpty(str);
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Trim a string and return undefined if empty.
 *
 * @param str - The string to trim
 * @returns Trimmed string or undefined if empty
 *
 * @example
 * ```typescript
 * trimToUndefined('  hello  '); // 'hello'
 * trimToUndefined('   '); // undefined
 * trimToUndefined(''); // undefined
 * ```
 */
export function trimToUndefined(str: string | null | undefined): string | undefined {
  const trimmed = trimToEmpty(str);
  return trimmed.length === 0 ? undefined : trimmed;
}

/**
 * Trim a string and return '0' if empty.
 *
 * @param str - The string to trim
 * @returns Trimmed string or '0' if empty
 *
 * @example
 * ```typescript
 * trimToZero('  123  '); // '123'
 * trimToZero('   '); // '0'
 * trimToZero(''); // '0'
 * ```
 */
export function trimToZero(str: string | null | undefined): string {
  const trimmed = trimToEmpty(str);
  return trimmed.length === 0 ? '0' : trimmed;
}

/**
 * Trim a string and return a default value if empty.
 *
 * @param str - The string to trim
 * @param val - The default value to return if empty
 * @returns Trimmed string or the default value if empty
 *
 * @example
 * ```typescript
 * trimToVal('  hello  ', 'default'); // 'hello'
 * trimToVal('   ', 'default'); // 'default'
 * trimToVal('', 'default'); // 'default'
 * ```
 */
export function trimToVal(str: string | null | undefined, val: string): string {
  const trimmed = trimToEmpty(str);
  return trimmed.length === 0 ? val : trimmed;
}

/**
 * String utilities namespace object.
 * Provides all string functions as properties for compatibility.
 */
export const string = {
  contains,
  endsWith,
  startsWith,
  insertAt,
  removeWhitespace,
  lpad,
  rpad,
  isEmpty,
  byteLength,
  trimToEmpty,
  nullToEmpty,
  trimToNull,
  trimToUndefined,
  trimToZero,
  trimToVal,
} as const;

export default string;

