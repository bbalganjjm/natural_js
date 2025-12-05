/**
 * Individual validation rule implementations.
 * Each rule validates a string value and returns true if valid.
 */

import { string } from '@natural-js/core';
import { ValidationRuleFunction, ValidationRuleArgs } from './types';

// ============================================================================
// Basic Type Validators
// ============================================================================

/**
 * Validates that a value is not empty.
 *
 * @param str - The value to validate
 * @returns true if the value is not empty
 *
 * @example
 * required('hello') // true
 * required('') // false
 * required('   ') // false
 */
export const required: ValidationRuleFunction = (str: string): boolean => {
  return !string.isEmpty(str);
};

/**
 * Validates that a value contains only alphabetic characters (a-z, A-Z).
 *
 * @param str - The value to validate
 * @returns true if the value contains only letters
 *
 * @example
 * alphabet('Hello') // true
 * alphabet('Hello123') // false
 */
export const alphabet: ValidationRuleFunction = (str: string): boolean => {
  return /^[a-z\s]+$/i.test(str);
};

/**
 * Validates that a value is an integer.
 *
 * @param str - The value to validate
 * @returns true if the value is an integer
 *
 * @example
 * integer('123') // true
 * integer('-456') // true
 * integer('12.34') // false
 */
export const integer: ValidationRuleFunction = (str: string): boolean => {
  return /^[+-]?\d+$/.test(str);
};

/**
 * Validates that a value contains only Korean characters.
 *
 * @param str - The value to validate
 * @returns true if the value contains only Korean characters
 *
 * @example
 * korean('안녕하세요') // true
 * korean('Hello') // false
 */
export const korean: ValidationRuleFunction = (str: string): boolean => {
  return /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣\s]+$/.test(str);
};

/**
 * Validates that a value contains only alphabetic characters and integers.
 *
 * @param str - The value to validate
 * @returns true if the value contains only letters and numbers
 *
 * @example
 * alphabet_integer('Hello123') // true
 * alphabet_integer('Hello123!') // false
 */
export const alphabet_integer: ValidationRuleFunction = (str: string): boolean => {
  return /^[a-z-?\d\s]+$/i.test(str);
};

/**
 * Validates that a value contains only integers and Korean characters.
 *
 * @param str - The value to validate
 * @returns true if the value contains only numbers and Korean
 *
 * @example
 * integer_korean('123안녕') // true
 * integer_korean('Hello123') // false
 */
export const integer_korean: ValidationRuleFunction = (str: string): boolean => {
  return /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣-?\d\s]+$/.test(str);
};

/**
 * Validates that a value contains only alphabetic and Korean characters.
 *
 * @param str - The value to validate
 * @returns true if the value contains only letters and Korean
 *
 * @example
 * alphabet_korean('Hello안녕') // true
 * alphabet_korean('Hello123') // false
 */
export const alphabet_korean: ValidationRuleFunction = (str: string): boolean => {
  return /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-z\s]+$/i.test(str);
};

/**
 * Validates that a value contains only alphabetic, integer, and Korean characters.
 *
 * @param str - The value to validate
 * @returns true if the value contains only letters, numbers, and Korean
 *
 * @example
 * alphabet_integer_korean('Hello123안녕') // true
 * alphabet_integer_korean('Hello123!') // false
 */
export const alphabet_integer_korean: ValidationRuleFunction = (str: string): boolean => {
  return /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-z-?\d\s]+$/i.test(str);
};

/**
 * Validates that a value contains only digits and dashes.
 *
 * @param str - The value to validate
 * @returns true if the value contains only digits and dashes
 *
 * @example
 * dash_integer('123-456') // true
 * dash_integer('123abc') // false
 */
export const dash_integer: ValidationRuleFunction = (str: string): boolean => {
  return /^(\d|-)+$/.test(str);
};

/**
 * Validates that a value contains only digits and commas.
 *
 * @param str - The value to validate
 * @returns true if the value contains only digits and commas
 *
 * @example
 * commas_integer('1,234,567') // true
 * commas_integer('1234.56') // false
 */
export const commas_integer: ValidationRuleFunction = (str: string): boolean => {
  return /^(\d|,)+$/.test(str);
};

/**
 * Validates that a value is a number (with optional +/- and decimal point).
 *
 * @param str - The value to validate
 * @returns true if the value is a valid number
 *
 * @example
 * number('1,234.56') // true
 * number('-123.45') // true
 * number('abc') // false
 */
export const number: ValidationRuleFunction = (str: string): boolean => {
  return /^[+-]?(\d|,|\.)+$/.test(str);
};

// ============================================================================
// Format Validators
// ============================================================================

/**
 * Validates an email address format.
 *
 * @param str - The email to validate
 * @returns true if the email format is valid
 *
 * @example
 * email('test@example.com') // true
 * email('invalid-email') // false
 */
export const email: ValidationRuleFunction = (str: string): boolean => {
  return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(
    str
  );
};

/**
 * Validates a URL format.
 *
 * @param str - The URL to validate
 * @returns true if the URL format is valid
 *
 * @example
 * url('https://example.com') // true
 * url('ftp://files.example.com/path') // true
 * url('invalid-url') // false
 */
export const url: ValidationRuleFunction = (str: string): boolean => {
  return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(
    str
  );
};

/**
 * Validates a Korean zipcode format (3-3 format).
 *
 * @param str - The zipcode to validate
 * @returns true if the zipcode format is valid
 *
 * @example
 * zipcode('123-456') // true
 * zipcode('12345') // false
 */
export const zipcode: ValidationRuleFunction = (str: string): boolean => {
  return /^\d{3}-\d{3}$/.test(str);
};

/**
 * Validates a decimal number with optional precision limit.
 *
 * @param str - The value to validate
 * @param args - [maxDecimalPlaces] - Maximum decimal places (default: 10)
 * @returns true if the value is a valid decimal
 *
 * @example
 * decimal('123.45') // true
 * decimal('123.456', [2]) // false (more than 2 decimal places)
 */
export const decimal: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  const length = args !== undefined && args[0] !== undefined ? Number(args[0]) : 10;
  return /^-?\d+$/.test(str) || new RegExp('^-?\\d*\\.\\d{0,' + String(length) + '}$').test(str);
};

/**
 * Validates a phone number format.
 *
 * @param str - The phone number to validate
 * @param args - [allowWildcard] - If 'true', allows wildcard characters
 * @returns true if the phone format is valid
 *
 * @example
 * phone('02-1234-5678') // true
 * phone('010-1234-5678') // true
 * phone('1234567890') // false
 */
export const phone: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args !== undefined && args[0] !== undefined) {
    if (String(args[0]) === 'true') {
      return /^\d{2,3}-\d{3,4}-\w+|"("")"$/.test(str);
    }
  }
  return /^\d{2,3}-\d{3,4}-\d{4}$/.test(str);
};

// ============================================================================
// ID Number Validators (Korea-specific)
// ============================================================================

/**
 * Validates a Korean Resident Registration Number (RRN).
 * Performs checksum validation.
 *
 * @param str - The RRN to validate (13 digits)
 * @returns true if the RRN is valid
 *
 * @example
 * rrn('8001011234567') // depends on checksum
 */
export const rrn: ValidationRuleFunction = (str: string): boolean => {
  str = str.replace(/[^0-9*]/g, '');
  if (string.trimToEmpty(str).length !== 13) {
    return false;
  }

  const a1 = Number(str.substring(0, 1));
  const a2 = Number(str.substring(1, 2));
  const a3 = Number(str.substring(2, 3));
  const a4 = Number(str.substring(3, 4));
  const a5 = Number(str.substring(4, 5));
  const a6 = Number(str.substring(5, 6));
  let checkdigit = a1 * 2 + a2 * 3 + a3 * 4 + a4 * 5 + a5 * 6 + a6 * 7;

  const b1 = Number(str.substring(6, 7));
  const b2 = Number(str.substring(7, 8));
  const b3 = Number(str.substring(8, 9));
  const b4 = Number(str.substring(9, 10));
  const b5 = Number(str.substring(10, 11));
  const b6 = Number(str.substring(11, 12));
  const b7 = Number(str.substring(12, 13));
  checkdigit = checkdigit + b1 * 8 + b2 * 9 + b3 * 2 + b4 * 3 + b5 * 4 + b6 * 5;

  checkdigit = checkdigit % 11;
  checkdigit = 11 - checkdigit;
  checkdigit = checkdigit % 10;

  return checkdigit === b7;
};

/**
 * Validates a US Social Security Number (SSN).
 *
 * @param str - The SSN to validate
 * @returns true if the SSN format is valid
 *
 * @example
 * ssn('123-45-6789') // true
 * ssn('123456789') // false
 */
export const ssn: ValidationRuleFunction = (str: string): boolean => {
  return /\d{3}-\d{2}-\d{4}/.test(str);
};

/**
 * Validates a Korean Foreign Registration Number (FRN).
 * Performs checksum validation.
 *
 * @param str - The FRN to validate (13 digits)
 * @returns true if the FRN is valid
 *
 * @example
 * frn('8001015123456') // depends on checksum
 */
export const frn: ValidationRuleFunction = (str: string): boolean => {
  str = str.replace(/[^0-9*]/g, '');
  if (string.trimToEmpty(str).length !== 13) {
    return false;
  }

  let sum = 0;
  const checkValue = Number(str.substring(6, 7));
  if ([5, 6, 8].indexOf(checkValue) === -1) {
    return false;
  }
  if (Number(str.substring(7, 9)) % 2 !== 0) {
    return false;
  }
  for (let i = 0; i < 12; i++) {
    sum += Number(str.substring(i, i + 1)) * ((i % 8) + 2);
  }
  return ((11 - (sum % 11)) % 10 + 2) % 10 === Number(str.substring(12, 13));
};

/**
 * Validates either a Korean RRN or FRN based on the 7th digit.
 *
 * @param str - The number to validate (13 digits)
 * @returns true if the number is a valid RRN or FRN
 */
export const frn_rrn: ValidationRuleFunction = (str: string): boolean => {
  str = str.replace(/[^0-9*]/g, '');
  if (string.trimToEmpty(str).length !== 13) {
    return false;
  }
  const seventhDigit = Number(str.charAt(6));
  if (seventhDigit >= 5 && seventhDigit <= 8) {
    return frn(str);
  } else {
    return rrn(str);
  }
};

/**
 * Validates a Korean Business Registration Number (KBRN).
 * Performs checksum validation.
 *
 * @param str - The KBRN to validate (10 digits)
 * @returns true if the KBRN is valid
 *
 * @example
 * kbrn('123-45-67890') // depends on checksum
 */
export const kbrn: ValidationRuleFunction = (str: string): boolean => {
  const bizID = str.replace(/[^0-9*]/g, '');
  if (bizID.length !== 10) {
    return false;
  }

  const checkID = [1, 3, 7, 1, 3, 7, 1, 3, 5, 1] as const;
  let chkSum = 0;

  for (let i = 0; i <= 7; i++) {
    const multiplier = checkID[i] ?? 0;
    chkSum += multiplier * Number(bizID.charAt(i));
  }

  const multiplier8 = checkID[8] ?? 0;
  let c2 = '0' + String(multiplier8 * Number(bizID.charAt(8)));
  c2 = c2.substring(c2.length - 2, c2.length);

  chkSum += Math.floor(Number(c2.charAt(0))) + Math.floor(Number(c2.charAt(1)));

  const remainder = (10 - (chkSum % 10)) % 10;

  return Math.floor(Number(bizID.charAt(9))) === remainder;
};

/**
 * Validates a Korean Corporation Number (KCN).
 * Performs checksum validation.
 *
 * @param str - The KCN to validate (13 digits)
 * @returns true if the KCN is valid
 *
 * @example
 * kcn('123456-1234567') // depends on checksum
 */
export const kcn: ValidationRuleFunction = (str: string): boolean => {
  const numStr = str.replace(/[^0-9*]/g, '');
  if (numStr.length !== 13) {
    return false;
  }

  const arrRegno = numStr.split('');
  const arrWt = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2] as const;
  let sumRegno = 0;

  for (let i = 0; i < 12; i++) {
    const digit = arrRegno[i] ?? '0';
    const weight = arrWt[i] ?? 0;
    sumRegno += parseInt(digit, 10) * weight;
  }

  let checkDigit = 10 - (sumRegno % 10);
  checkDigit = checkDigit % 10;

  const lastDigit = arrRegno[12] ?? '0';
  return checkDigit === parseInt(lastDigit, 10);
};

// ============================================================================
// Date/Time Validators
// ============================================================================

/**
 * Validates a date string (YYYYMMDD or YYYY-MM-DD format).
 *
 * @param str - The date to validate
 * @returns true if the date is valid
 *
 * @example
 * date('2023-12-25') // true
 * date('20231225') // true
 * date('2023-02-30') // false (invalid day)
 */
export const date: ValidationRuleFunction = (str: string): boolean => {
  // Check leap year
  const isLeap = (year: number): boolean => {
    let leaf = false;
    if (year % 4 === 0) {
      leaf = year % 100 !== 0;
      if (year % 400 === 0) {
        leaf = true;
      }
    }
    return leaf;
  };

  // Remove date separator
  const d = str.replace(/[-\/\.]/g, '');
  if (string.trimToEmpty(d).length !== 8) {
    return false;
  }

  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

  const year = parseInt(d.substring(0, 4), 10);
  const month = parseInt(d.substring(4, 6), 10);
  const day = parseInt(d.substring(6, 8), 10);

  if (day === 0 || month === 0 || month > 12) {
    return false;
  }

  const daysInMonth = monthDays[month - 1] ?? 31;
  let isValid = false;

  if (isLeap(year)) {
    if (month === 2) {
      if (day <= daysInMonth + 1) {
        isValid = true;
      }
    } else {
      if (day <= daysInMonth) {
        isValid = true;
      }
    }
  } else {
    if (day <= daysInMonth) {
      isValid = true;
    }
  }

  return isValid;
};

/**
 * Validates a time string (HH, HHMM, or HHMMSS format).
 *
 * @param str - The time to validate
 * @returns true if the time is valid
 *
 * @example
 * time('23:59:59') // true
 * time('235959') // true
 * time('24:00') // false
 */
export const time: ValidationRuleFunction = (str: string): boolean => {
  return /^([01]\d|2[0-3])([0-5]\d){0,2}$/.test(str.replace(/[^0-9]/g, ''));
};

// ============================================================================
// Pattern Matching Validators
// ============================================================================

/**
 * Validates that a value matches one of the accepted values.
 *
 * @param str - The value to validate
 * @param args - [acceptPattern] - Pipe-separated list of accepted values
 * @returns true if the value matches
 *
 * @example
 * accept('yes', ['yes|no']) // true
 * accept('maybe', ['yes|no']) // false
 */
export const accept: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.accept] You must input args[0] (accept string)');
  }
  return new RegExp('^(' + String(args[0]) + ')$').test(str);
};

/**
 * Validates that a value contains a pattern.
 *
 * @param str - The value to validate
 * @param args - [pattern] - Regular expression pattern to match
 * @returns true if the value matches the pattern
 *
 * @example
 * match('hello world', ['world']) // true
 * match('hello', ['world']) // false
 */
export const match: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.match] You must input args[0] (match string)');
  }
  return new RegExp(String(args[0])).test(str);
};

/**
 * Validates that a file has an accepted extension.
 *
 * @param str - The filename to validate
 * @param args - [extensions] - Pipe-separated list of accepted extensions
 * @returns true if the extension is accepted
 *
 * @example
 * acceptfileext('image.jpg', ['jpg|png|gif']) // true
 * acceptfileext('script.exe', ['jpg|png|gif']) // false
 */
export const acceptfileext: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.acceptFileExt] You must input args[0] (file extension)');
  }
  return new RegExp('.(' + String(args[0]) + ')$', 'i').test(str);
};

/**
 * Validates that a value does NOT match any of the specified values.
 *
 * @param str - The value to validate
 * @param args - [pattern] - Pipe-separated list of refused values
 * @returns true if the value does not match
 *
 * @example
 * notaccept('yes', ['no|never']) // true
 * notaccept('no', ['no|never']) // false
 */
export const notaccept: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.notAccept] You must input args[0] (refused string)');
  }
  return !new RegExp('^(' + String(args[0]) + ')$').test(str);
};

/**
 * Validates that a value does NOT contain a pattern.
 *
 * @param str - The value to validate
 * @param args - [pattern] - Pattern that should not match
 * @returns true if the value does not match the pattern
 *
 * @example
 * notmatch('hello', ['world']) // true
 * notmatch('hello world', ['world']) // false
 */
export const notmatch: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.notMatch] You must input args[0] (unmatch string)');
  }
  return !new RegExp(String(args[0])).test(str);
};

/**
 * Validates that a file does NOT have a specified extension.
 *
 * @param str - The filename to validate
 * @param args - [extensions] - Pipe-separated list of refused extensions
 * @returns true if the extension is not in the list
 *
 * @example
 * notacceptfileext('image.jpg', ['exe|bat|sh']) // true
 * notacceptfileext('script.exe', ['exe|bat|sh']) // false
 */
export const notacceptfileext: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.notAcceptFileExt] You must input args[0] (file extension)');
  }
  return !new RegExp('.(' + String(args[0]) + ')$', 'i').test(str);
};

// ============================================================================
// Comparison Validators
// ============================================================================

/**
 * Validates that a value equals another value.
 * Note: In server context, provide the compare value directly instead of selector.
 *
 * @param str - The value to validate
 * @param args - [compareValue] - Value to compare against
 * @returns true if the values are equal
 *
 * @example
 * equalTo('password123', ['password123']) // true
 * equalTo('password123', ['different']) // false
 */
export const equalTo: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.equalTo] You must input args[0] (compare value)');
  }
  // In SSR/non-browser context, compare directly with the provided value
  const compareValue = String(args[0]);
  if (string.trimToNull(compareValue) === null) {
    return true;
  }
  return str === compareValue;
};

// ============================================================================
// Length Validators
// ============================================================================

/**
 * Validates that a string is at most a certain length.
 *
 * @param str - The value to validate
 * @param args - [maxLength] - Maximum allowed length
 * @returns true if the length is within limit
 *
 * @example
 * maxlength('hello', [10]) // true
 * maxlength('hello world!', [5]) // false
 */
export const maxlength: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.maxlength] You must input args[0] (length)');
  }
  return string.trimToEmpty(str).length <= Number(string.trimToZero(String(args[0])));
};

/**
 * Validates that a string is at least a certain length.
 *
 * @param str - The value to validate
 * @param args - [minLength] - Minimum required length
 * @returns true if the length meets the requirement
 *
 * @example
 * minlength('hello', [3]) // true
 * minlength('hi', [5]) // false
 */
export const minlength: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.minlength] You must input args[0] (length)');
  }
  return Number(string.trimToZero(String(args[0]))) <= string.trimToEmpty(str).length;
};

/**
 * Validates that a string length is within a range.
 *
 * @param str - The value to validate
 * @param args - [minLength, maxLength] - Length range
 * @returns true if the length is within range
 *
 * @example
 * rangelength('hello', [3, 10]) // true
 * rangelength('hi', [5, 10]) // false
 */
export const rangelength: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args.length < 2) {
    throw new Error(
      '[Validator.rangelength] You must input args[0] (min length) and args[1] (max length)'
    );
  }
  const strLength = string.trimToEmpty(str).length;
  return (
    Number(string.trimToZero(String(args[0]))) <= strLength &&
    strLength <= Number(string.trimToEmpty(String(args[1])))
  );
};

// ============================================================================
// Byte Length Validators
// ============================================================================

/**
 * Validates that a string is at most a certain byte length.
 *
 * @param str - The value to validate
 * @param args - [maxBytes, charByteLength?] - Max bytes and multi-byte char length (default: 3)
 * @returns true if the byte length is within limit
 *
 * @example
 * maxbyte('hello', [10]) // true (5 bytes)
 * maxbyte('안녕', [3]) // false (6 bytes with default charByteLength=3)
 */
export const maxbyte: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.maxbyte] You must input args[0] (maximum byte)');
  }
  const charByteLength = args[1] !== undefined ? Number(args[1]) : 3;
  return (
    string.byteLength(string.trimToEmpty(str), charByteLength) <=
    Number(string.trimToZero(String(args[0])))
  );
};

/**
 * Validates that a string is at least a certain byte length.
 *
 * @param str - The value to validate
 * @param args - [minBytes, charByteLength?] - Min bytes and multi-byte char length (default: 3)
 * @returns true if the byte length meets the requirement
 *
 * @example
 * minbyte('hello', [3]) // true (5 bytes)
 * minbyte('hi', [5]) // false (2 bytes)
 */
export const minbyte: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.minbyte] You must input args[0] (minimum byte)');
  }
  const charByteLength = args[1] !== undefined ? Number(args[1]) : 3;
  return (
    Number(string.trimToZero(String(args[0]))) <=
    string.byteLength(string.trimToEmpty(str), charByteLength)
  );
};

/**
 * Validates that a string byte length is within a range.
 *
 * @param str - The value to validate
 * @param args - [minBytes, maxBytes, charByteLength?] - Byte range and multi-byte char length
 * @returns true if the byte length is within range
 *
 * @example
 * rangebyte('hello', [3, 10]) // true (5 bytes)
 * rangebyte('hi', [5, 10]) // false (2 bytes)
 */
export const rangebyte: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args.length < 2) {
    throw new Error(
      '[Validator.rangebyte] You must input args[0] (min byte) and args[1] (max byte)'
    );
  }
  const charByteLength = args[2] !== undefined ? Number(args[2]) : 3;
  const byteLen = string.byteLength(string.trimToEmpty(str), charByteLength);
  return (
    Number(string.trimToZero(String(args[0]))) <= byteLen &&
    byteLen <= Number(string.trimToZero(String(args[1])))
  );
};

// ============================================================================
// Value Range Validators
// ============================================================================

/**
 * Validates that a numeric value is at most a certain amount.
 *
 * @param str - The value to validate
 * @param args - [maxValue] - Maximum allowed value
 * @returns true if the value is within limit
 *
 * @example
 * maxvalue('50', [100]) // true
 * maxvalue('150', [100]) // false
 */
export const maxvalue: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.maxvalue] You must input args[0] (maximum value)');
  }
  return (
    Number(string.trimToZero(str)) <= Number(string.trimToZero(String(args[0])))
  );
};

/**
 * Validates that a numeric value is at least a certain amount.
 *
 * @param str - The value to validate
 * @param args - [minValue] - Minimum required value
 * @returns true if the value meets the requirement
 *
 * @example
 * minvalue('50', [10]) // true
 * minvalue('5', [10]) // false
 */
export const minvalue: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[Validator.minvalue] You must input args[0] (minimum value)');
  }
  return (
    Number(string.trimToZero(String(args[0]))) <= Number(string.trimToZero(str))
  );
};

/**
 * Validates that a numeric value is within a range.
 *
 * @param str - The value to validate
 * @param args - [minValue, maxValue] - Value range
 * @returns true if the value is within range
 *
 * @example
 * rangevalue('50', [0, 100]) // true
 * rangevalue('150', [0, 100]) // false
 */
export const rangevalue: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args.length < 2) {
    throw new Error(
      '[Validator.rangevalue] You must input args[0] (min value) and args[1] (max value)'
    );
  }
  const numValue = Number(string.trimToZero(str));
  return (
    Number(string.trimToZero(String(args[0]))) <= numValue &&
    numValue <= Number(string.trimToZero(String(args[1])))
  );
};

// ============================================================================
// Custom Pattern Validators
// ============================================================================

/**
 * Validates a value against a custom regular expression.
 *
 * @param str - The value to validate
 * @param args - [pattern, flags?, message?] - Regex pattern, flags, and custom error message
 * @returns true if the value matches the pattern
 *
 * @example
 * regexp('ABC123', ['^[A-Z]+\\d+$']) // true
 * regexp('abc123', ['^[A-Z]+\\d+$', 'i']) // true (case insensitive)
 */
export const regexp: ValidationRuleFunction = (
  str: string,
  args?: ValidationRuleArgs
): boolean => {
  if (args === undefined || args.length < 1) {
    throw new Error(
      '[Validator.regexp] You must input args[0] (regular expression string)'
    );
  }
  const pattern = String(args[0]);
  const flags = args[1] !== undefined ? String(args[1]) : undefined;
  const regExp = flags ? new RegExp(pattern, flags) : new RegExp(pattern);
  return regExp.test(str);
};

// ============================================================================
// Built-in Rules Export
// ============================================================================

/**
 * All built-in validation rules.
 */
export const builtInRules: Record<string, ValidationRuleFunction> = {
  required,
  alphabet,
  integer,
  korean,
  alphabet_integer,
  integer_korean,
  alphabet_korean,
  alphabet_integer_korean,
  dash_integer,
  commas_integer,
  number,
  email,
  url,
  zipcode,
  decimal,
  phone,
  rrn,
  ssn,
  frn,
  frn_rrn,
  kbrn,
  kcn,
  date,
  time,
  accept,
  match,
  acceptfileext,
  notaccept,
  notmatch,
  notacceptfileext,
  equalTo,
  maxlength,
  minlength,
  rangelength,
  maxbyte,
  minbyte,
  rangebyte,
  maxvalue,
  minvalue,
  rangevalue,
  regexp,
};

/**
 * Gets a validation rule function by name.
 *
 * @param name - The rule name (case-insensitive)
 * @param userRules - Optional user-defined rules
 * @returns The validation rule function, or undefined if not found
 */
export function getValidationRule(
  name: string,
  userRules?: Record<string, ValidationRuleFunction>
): ValidationRuleFunction | undefined {
  const ruleName = name.toLowerCase();

  // Check user rules first
  if (userRules && userRules[ruleName]) {
    return userRules[ruleName];
  }

  // Fall back to built-in rules
  return builtInRules[ruleName];
}

