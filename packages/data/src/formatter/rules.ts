/**
 * Individual format rule implementations.
 * Each rule transforms a string value according to specific formatting logic.
 */

import { NaturalElement } from '@natural-js/shared';
import { string, date, Mask } from '@natural-js/core';
import { FormatRuleFunction, FormatRuleArgs, MaskType } from './types';

/**
 * Adds thousand separators (commas) to a number string.
 *
 * @param str - The string to format
 * @returns Formatted string with commas
 *
 * @example
 * commas('1234567') // '1,234,567'
 * commas('-1234567.89') // '-1,234,567.89'
 */
export const commas: FormatRuleFunction = (str: string): string => {
  if (string.isEmpty(str)) {
    return '';
  }
  str = str.replace(/,/g, '');
  const reg = /(^[+-]?\d+)(\d{3})/;
  str += '';
  while (reg.test(str)) {
    str = str.replace(reg, '$1' + ',' + '$2');
  }
  return str;
};

/**
 * Formats a Korean Resident Registration Number (RRN).
 *
 * @param str - The string to format (13 digits)
 * @param args - Optional [hideCount, replaceChar]
 *   - hideCount: Number of characters to hide from the end
 *   - replaceChar: Character to replace hidden characters (default: '*')
 * @returns Formatted RRN string (e.g., '123456-1234567')
 *
 * @example
 * rrn('1234561234567') // '123456-1234567'
 * rrn('1234561234567', [6]) // '123456-1******'
 * rrn('1234561234567', [6, '#']) // '123456-1######'
 */
export const rrn: FormatRuleFunction = (str: string, args?: FormatRuleArgs): string => {
  if (string.isEmpty(str)) {
    return str;
  }
  str = str.replace(/[^0-9*]/g, '');
  if (str.length === 13) {
    let strToPad = '*';
    if (args !== undefined && args[1] !== undefined) {
      strToPad = String(args[1]);
    }
    if (args !== undefined && args[0] !== undefined) {
      str = string.rpad(str.substring(0, 13 - Number(args[0])), 13, strToPad);
      str = str.substring(0, 6) + '-' + str.substring(6, 13);
    } else {
      str = str.substring(0, 6) + '-' + str.substring(6, 13);
    }
  }
  return str;
};

/**
 * Formats a US Social Security Number (SSN).
 *
 * @param str - The string to format (9 digits)
 * @returns Formatted SSN string (e.g., '123-45-6789')
 *
 * @example
 * ssn('123456789') // '123-45-6789'
 */
export const ssn: FormatRuleFunction = (str: string): string => {
  if (str.length === 9) {
    str = str.replace(/[^0-9*]/g, '');
    return str.substring(0, 3) + '-' + str.substring(3, 5) + '-' + str.substring(5, 9);
  }
  return str;
};

/**
 * Formats a Korean Business Registration Number (KBRN).
 *
 * @param str - The string to format (10 digits)
 * @returns Formatted KBRN string (e.g., '123-45-67890')
 *
 * @example
 * kbrn('1234567890') // '123-45-67890'
 */
export const kbrn: FormatRuleFunction = (str: string): string => {
  if (string.trimToEmpty(str).length < 5) {
    return str;
  }
  str = str.replace(/[^0-9*]/g, '');
  if (str.length > 10) {
    str = str.substring(0, 10);
  }
  return str.substring(0, 3) + '-' + str.substring(3, 5) + '-' + str.substring(5, 10);
};

/**
 * Formats a Korean Corporation Number (KCN).
 * Uses the same format as RRN.
 *
 * @param str - The string to format (13 digits)
 * @returns Formatted KCN string (e.g., '123456-1234567')
 *
 * @example
 * kcn('1234561234567') // '123456-1234567'
 */
export const kcn: FormatRuleFunction = (str: string, args?: FormatRuleArgs): string => {
  return rrn(str, args);
};

/**
 * Converts a string to uppercase.
 *
 * @param str - The string to format
 * @returns Uppercase string
 *
 * @example
 * upper('hello') // 'HELLO'
 */
export const upper: FormatRuleFunction = (str: string): string => {
  if (string.isEmpty(str)) {
    return str;
  }
  return str.toUpperCase();
};

/**
 * Converts a string to lowercase.
 *
 * @param str - The string to format
 * @returns Lowercase string
 *
 * @example
 * lower('HELLO') // 'hello'
 */
export const lower: FormatRuleFunction = (str: string): string => {
  if (string.isEmpty(str)) {
    return str;
  }
  return str.toLowerCase();
};

/**
 * Capitalizes the first character of a string.
 *
 * @param str - The string to format
 * @returns Capitalized string
 *
 * @example
 * capitalize('hello world') // 'Hello world'
 */
export const capitalize: FormatRuleFunction = (str: string): string => {
  if (string.isEmpty(str)) {
    return str;
  }
  let result = str.substring(0, 1).toUpperCase();
  if (str.length > 1) {
    result = result + str.substring(1);
  }
  return result;
};

/**
 * Formats a zipcode (Korean format: 3-3).
 *
 * @param str - The string to format (6 digits)
 * @returns Formatted zipcode string (e.g., '123-456')
 *
 * @example
 * zipcode('123456') // '123-456'
 */
export const zipcode: FormatRuleFunction = (str: string): string => {
  if (string.isEmpty(str)) {
    return str;
  }
  str = str.replace(/[^0-9*]/g, '');
  return str.substring(0, 3) + '-' + str.substring(3, 6);
};

/**
 * Formats a phone number (Korean format).
 *
 * @param str - The string to format
 * @returns Formatted phone number string (e.g., '010-1234-5678')
 *
 * @example
 * phone('01012345678') // '010-1234-5678'
 * phone('0212345678') // '02-1234-5678'
 */
export const phone: FormatRuleFunction = (str: string): string => {
  if (string.isEmpty(str)) {
    return str;
  }
  str = str.replace(/[^0-9*]/g, '');
  return str.replace(/(^02.{0}|^01.{1}|[0-9*]{3})([0-9*]+)([0-9*]{4})/, '$1-$2-$3');
};

/**
 * Parses a string as a real number (float).
 *
 * @param str - The string to format
 * @returns Parsed number as string, or empty string if invalid
 *
 * @example
 * realnum('123.45') // '123.45'
 * realnum('abc') // ''
 */
export const realnum: FormatRuleFunction = (str: string): string => {
  try {
    str = String(parseFloat(str));
  } catch {
    return str;
  }
  return str === 'NaN' ? str.replace('NaN', '') : str;
};

/**
 * Trims the string and returns empty string if null/undefined.
 *
 * @param str - The string to format
 * @returns Trimmed string or empty string
 *
 * @example
 * trimtoempty('  hello  ') // 'hello'
 * trimtoempty(null) // ''
 */
export const trimtoempty: FormatRuleFunction = (str: string): string => {
  return string.trimToEmpty(str);
};

/**
 * Trims the string and returns '0' if empty.
 *
 * @param str - The string to format
 * @returns Trimmed string or '0'
 *
 * @example
 * trimtozero('  123  ') // '123'
 * trimtozero('') // '0'
 */
export const trimtozero: FormatRuleFunction = (str: string): string => {
  return string.trimToZero(str);
};

/**
 * Trims the string and returns a default value if empty.
 *
 * @param str - The string to format
 * @param args - [defaultValue] - The default value to return if empty
 * @returns Trimmed string or default value
 *
 * @example
 * trimtoval('', ['N/A']) // 'N/A'
 * trimtoval('hello', ['N/A']) // 'hello'
 */
export const trimtoval: FormatRuleFunction = (str: string, args?: FormatRuleArgs): string => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[ND.formatter.trimtoval] You must input args[0] (default value)');
  }
  return string.trimToVal(str, String(args[0]));
};

/**
 * Formats a date string according to the specified format.
 *
 * @param str - The date string to format (digits only)
 * @param args - [formatLength|formatString, pickerType?, pickerOptions?]
 *   - formatLength: 4 (Y), 6 (Y-m), 8 (Y-m-d), 10 (Y-m-d H), 12 (Y-m-d H:i), 14 (Y-m-d H:i:s)
 *   - formatString: Custom date format string
 *   - pickerType: 'date' or 'month' for datepicker integration
 *   - pickerOptions: Additional datepicker options
 * @param element - Optional element for datepicker integration
 * @returns Formatted date string
 *
 * @example
 * dateFormat('20231225', [8]) // '2023-12-25'
 * dateFormat('202312', [6]) // '2023-12'
 * dateFormat('20231225153045', ['Y/m/d H:i:s']) // '2023/12/25 15:30:45'
 */
export const dateFormat: FormatRuleFunction = (
  str: string,
  args?: FormatRuleArgs,
  element?: NaturalElement | Element | null
): string => {
  if (args === undefined) {
    return str;
  }
  str = str.replace(/[^0-9]/g, '');

  // NOTE: Datepicker integration is handled at the application level
  // The formatter just formats the date string
  // Datepicker setup should be done in the UI layer

  if (args[0] !== undefined) {
    // Get date format configuration from context (default values if not available)
    const dateSepa = '-';
    const timeSepa = ':';

    let val: string;

    if (typeof args[0] === 'number') {
      const formatLength = args[0] as number;
      if (formatLength === 4) {
        val = date.format(str, 'Y');
      } else if (formatLength === 6) {
        val = date.format(str, `Y${dateSepa}m`);
      } else if (formatLength === 8) {
        val = date.format(str, `Y${dateSepa}m${dateSepa}d`);
      } else if (formatLength === 10) {
        val = date.format(str, `Y${dateSepa}m${dateSepa}d H`);
      } else if (formatLength === 12) {
        val = date.format(str, `Y${dateSepa}m${dateSepa}d H${timeSepa}i`);
      } else if (formatLength === 14) {
        val = date.format(str, `Y${dateSepa}m${dateSepa}d H${timeSepa}i${timeSepa}s`);
      } else {
        val = date.format(str, `Y${dateSepa}m${dateSepa}d`);
      }
    } else {
      val = date.format(str, String(args[0]));
    }

    return Number(str) > 0 ? val : '';
  }
  return str;
};

/**
 * Formats a time string.
 *
 * @param str - The time string to format (digits only)
 * @param args - [formatLength] - 2 (HH), 4 (HH:MM), 6 (HH:MM:SS)
 * @returns Formatted time string
 *
 * @example
 * time('153045', [6]) // '15:30:45'
 * time('1530', [4]) // '15:30'
 * time('15', [2]) // '15'
 */
export const time: FormatRuleFunction = (str: string, args?: FormatRuleArgs): string => {
  str = str.replace(/[^0-9]/g, '');
  if (string.trimToEmpty(str).length > 6) {
    str = string.rpad(str, 6, '0');
  } else {
    str = str.substring(0, 6);
  }

  const timeSepa = ':';

  if (args !== undefined && args[0] !== undefined && Number(args[0]) === 2) {
    str = str.substring(0, 2);
  } else if (args !== undefined && args[0] !== undefined && Number(args[0]) === 4) {
    str = str.substring(0, 2) + timeSepa + str.substring(2, 4);
  } else if (args !== undefined && args[0] !== undefined && Number(args[0]) === 6) {
    str = str.substring(0, 2) + timeSepa + str.substring(2, 4) + timeSepa + str.substring(4, 6);
  } else {
    str = str.substring(0, 2) + timeSepa + str.substring(2, 4);
  }

  return str;
};

/**
 * Limits a string to a certain byte length.
 *
 * @param str - The string to format
 * @param args - [maxBytes, suffix?]
 *   - maxBytes: Maximum byte length
 *   - suffix: String to append when truncated (e.g., '...')
 * @param element - Optional element to set title attribute
 * @returns Truncated string
 *
 * @example
 * limit('Hello World!', [5, '...']) // 'Hello...'
 */
export const limit: FormatRuleFunction = (
  str: string,
  args?: FormatRuleArgs,
  element?: NaturalElement | Element | null
): string => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[ND.formatter.limit] You must input args[0] (cut length)');
  }

  const suffix = args[1] !== undefined ? String(args[1]) : '';

  if (str.substring(str.length - suffix.length, str.length) !== suffix) {
    if (element !== undefined && element !== null) {
      const el = element instanceof NaturalElement ? element : new NaturalElement(element);
      el.attr('title', str);
    }
    let byteLen = 0;
    const maxBytes = Number(args[0]);
    for (let i = 0; i < str.length; i++) {
      byteLen += str.charCodeAt(i) > 128 ? 2 : 1;
      if (byteLen > maxBytes) {
        if (suffix) {
          return string.trimToEmpty(str.substring(0, i)) + suffix;
        } else {
          return str.substring(0, i);
        }
      }
    }
  }
  return str;
};

/**
 * Replaces occurrences of a string with another string.
 *
 * @param str - The string to format
 * @param args - [target, replacement, updateData?]
 *   - target: String to replace
 *   - replacement: Replacement string
 *   - updateData: Whether to update the source data (not implemented in TypeScript version)
 * @returns String with replacements
 *
 * @example
 * replace('Hello World', ['World', 'TypeScript']) // 'Hello TypeScript'
 */
export const replace: FormatRuleFunction = (str: string, args?: FormatRuleArgs): string => {
  if (args === undefined || args.length < 2) {
    throw new Error(
      '[ND.formatter.replace] You must input args[0] (target string) and args[1] (replace string)'
    );
  }
  return str.split(String(args[0])).join(String(args[1]));
};

/**
 * Left-pads a string to a specified length.
 *
 * @param str - The string to format
 * @param args - [length, padChar]
 *   - length: Target length
 *   - padChar: Character to pad with
 * @returns Left-padded string
 *
 * @example
 * lpad('5', [3, '0']) // '005'
 */
export const lpad: FormatRuleFunction = (str: string, args?: FormatRuleArgs): string => {
  if (args === undefined || args.length < 2) {
    throw new Error(
      '[ND.formatter.lpad] You must input args[0] (fill length) and args[1] (replace string)'
    );
  }
  return string.lpad(str, Number(args[0]), String(args[1]));
};

/**
 * Right-pads a string to a specified length.
 *
 * @param str - The string to format
 * @param args - [length, padChar]
 *   - length: Target length
 *   - padChar: Character to pad with
 * @returns Right-padded string
 *
 * @example
 * rpad('5', [3, '0']) // '500'
 */
export const rpad: FormatRuleFunction = (str: string, args?: FormatRuleArgs): string => {
  if (args === undefined || args.length < 2) {
    throw new Error(
      '[ND.formatter.rpad] You must input args[0] (fill length) and args[1] (replace string)'
    );
  }
  return string.rpad(str, Number(args[0]), String(args[1]));
};

/**
 * Applies masking to sensitive data based on the mask type.
 *
 * @param str - The string to mask
 * @param args - [maskType, replaceChar?]
 *   - maskType: 'phone', 'email', 'address', 'name', 'rrn'
 *   - replaceChar: Character to use for masking (default: '*')
 * @returns Masked string
 *
 * @example
 * mask('01012345678', ['phone']) // '010-****-5678'
 * mask('test@email.com', ['email']) // 'te***@email.com'
 * mask('홍길동', ['name']) // '홍*동'
 */
export const mask: FormatRuleFunction = (str: string, args?: FormatRuleArgs): string => {
  if (args === undefined || args.length < 1) {
    throw new Error('[ND.formatter.mask] You must input args[0] (masking rule)');
  }

  let replaceStr = '*';
  if (args.length >= 2 && !string.isEmpty(String(args[1]))) {
    replaceStr = String(args[1]);
  }

  const maskType = String(args[0]) as MaskType;

  if (maskType === 'phone') {
    str = string.trimToEmpty(str);
    const formattedPhone = phone(str);
    const firstDash = formattedPhone.indexOf('-');
    const lastDash = formattedPhone.lastIndexOf('-');

    if (firstDash > -1 && lastDash > -1 && firstDash !== lastDash) {
      const frontNum = formattedPhone.substring(0, firstDash + 1);
      const rearNum = formattedPhone.substring(lastDash);
      const middleNum = formattedPhone.substring(firstDash + 1, lastDash);
      return frontNum + middleNum.replace(/\d/g, replaceStr) + rearNum;
    }
    return formattedPhone;
  } else if (maskType === 'email') {
    str = string.trimToEmpty(str);
    // Simple email validation
    if (str.indexOf('@') > -1) {
      let replaceChars = '';
      for (let i = 0; i < 3; i++) {
        replaceChars += replaceStr;
      }
      const atIndex = str.indexOf('@');
      const localPart = str.substring(0, atIndex);
      const domainPart = str.substring(atIndex);
      const maskedLocal = localPart.replace(/.{1,3}$/, replaceChars);
      return maskedLocal + domainPart;
    }
    return str;
  } else if (maskType === 'address') {
    str = string.trimToEmpty(str);
    const firstCheckChars = '_경기_강원_충북_충남_전북_전남_경북_경남_제주_';
    const secondCheckChars = '_도_시_군_구_';
    const thirdCheckChars = '_읍_면_동_리_로_길_가_';

    const addrFrags = str.split(' ');
    let maskedAddr = '';

    for (const frag of addrFrags) {
      let addrFrag = string.trimToEmpty(frag);
      if (!addrFrag) continue;

      const firstChar = addrFrag.substring(0, 1);
      const lastChar = addrFrag.substring(addrFrag.length - 1, addrFrag.length);

      if (
        firstCheckChars.indexOf('_' + addrFrag + '_') < 0 &&
        secondCheckChars.indexOf('_' + lastChar + '_') < 0
      ) {
        let replaceChars = '';
        if (thirdCheckChars.indexOf('_' + lastChar + '_') > -1 && /[^0-9*]/.test(firstChar)) {
          for (let i = 0; i < addrFrag.length - 1; i++) {
            replaceChars += replaceStr;
          }
          addrFrag = replaceChars + lastChar;
        } else {
          for (let i = 0; i < addrFrag.length; i++) {
            replaceChars += replaceStr;
          }
          addrFrag = replaceChars;
        }
      }
      maskedAddr += addrFrag + ' ';
    }
    return string.trimToEmpty(maskedAddr);
  } else if (maskType === 'name') {
    str = string.trimToEmpty(str);

    // If str is alphabet and number and dot(.)
    if (/^[a-z-?\d\s.]+$/i.test(str)) {
      return str
        .split('')
        .map((char, i) => {
          if (i > 2 && i < 10 && char !== ' ') {
            return replaceStr;
          }
          return char;
        })
        .join('');
    }

    // If str is Hangul
    const firstCheckChars = '_남궁_제갈_선우_독고_황보_강전_동방_망절_사공_서문_소봉_장곡_';
    let frontIdx = 1;
    if (str.length > 1 && firstCheckChars.indexOf('_' + str.substring(0, 2) + '_') > -1) {
      frontIdx = 2;
    }

    return str.substring(0, frontIdx) + replaceStr + str.substring(frontIdx + 1, str.length);
  } else if (maskType === 'rrn') {
    str = string.trimToEmpty(str);
    let replaceChars = '';
    for (let i = 0; i < 7; i++) {
      replaceChars += replaceStr;
    }
    const maskedRrn = str.replace(/.{1,7}$/, replaceChars);
    return rrn(maskedRrn);
  }

  return str;
};

/**
 * Applies a generic mask pattern to a string.
 * Uses NC.mask.setGeneric internally.
 *
 * @param str - The string to format
 * @param args - [pattern]
 *   - pattern: Mask pattern using #(digit), @(alpha), ~(alphanum), !(any)
 * @returns Formatted string
 *
 * @example
 * generic('1234567890', ['###-###-####']) // '123-456-7890'
 */
export const generic: FormatRuleFunction = (str: string, args?: FormatRuleArgs): string => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[ND.formatter.generic] You must input args[0] (user format rule)');
  }
  const maskInstance = new Mask(String(args[0]));
  const result = maskInstance.setGeneric(String(str));
  // setGeneric returns true on error, string on success
  return result === true ? str : result;
};

/**
 * Applies a numeric mask pattern to a string.
 * Uses NC.mask.setNumeric internally.
 *
 * @param str - The string to format
 * @param args - [pattern, options?]
 *   - pattern: Numeric mask pattern
 *   - options: Additional mask options (rounding mode: 'round' | 'ceil' | 'floor')
 * @returns Formatted string
 *
 * @example
 * numeric('1234567', ['#,###']) // '1,234,567'
 */
export const numeric: FormatRuleFunction = (str: string, args?: FormatRuleArgs): string => {
  if (args === undefined || args[0] === undefined) {
    throw new Error('[ND.formatter.numeric] You must input args[0] (user format rule)');
  }
  const maskInstance = new Mask(String(args[0]));
  const precision = args[1] as 'round' | 'ceil' | 'floor' | undefined;
  const result = maskInstance.setNumeric(String(str), precision);
  // setNumeric returns true on error, string on success
  return result === true ? str : result;
};

/**
 * All built-in format rules.
 */
export const builtInRules: Record<string, FormatRuleFunction> = {
  commas,
  rrn,
  ssn,
  kbrn,
  kcn,
  upper,
  lower,
  capitalize,
  zipcode,
  phone,
  realnum,
  trimtoempty,
  trimtozero,
  trimtoval,
  date: dateFormat,
  time,
  limit,
  replace,
  lpad,
  rpad,
  mask,
  generic,
  numeric,
};

/**
 * Gets a format rule function by name.
 *
 * @param name - The rule name (case-insensitive)
 * @param userRules - Optional user-defined rules
 * @returns The format rule function, or undefined if not found
 */
export function getFormatRule(
  name: string,
  userRules?: Record<string, FormatRuleFunction>
): FormatRuleFunction | undefined {
  const ruleName = name.toLowerCase();

  // Check user rules first
  if (userRules && userRules[ruleName]) {
    return userRules[ruleName];
  }

  // Fall back to built-in rules
  return builtInRules[ruleName];
}

