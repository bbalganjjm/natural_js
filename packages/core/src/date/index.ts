/**
 * Date utilities for Natural-JS framework.
 * Functions for date manipulation, formatting, and conversion.
 * SSR compatible - no browser-specific APIs.
 */

import { trimToEmpty, startsWith } from '../string';

// ============================================================================
// Types
// ============================================================================

/**
 * Date information object returned by parsing functions.
 */
export interface ParsedDateInfo {
  obj: Date;
  format: string;
}

/**
 * Date format configuration.
 */
export interface DateFormatConfig {
  Ym: () => string;
  Ymd: () => string;
  YmdH: () => string;
  YmdHi: () => string;
  YmdHis: () => string;
}

/**
 * Week array type (7 days).
 */
export type WeekArray = [Date, Date, Date, Date, Date, Date, Date];

// ============================================================================
// Default Format Configuration
// ============================================================================

const defaultDateFormat: DateFormatConfig = {
  Ym: () => 'Y-m',
  Ymd: () => 'Y-m-d',
  YmdH: () => 'Y-m-d H',
  YmdHi: () => 'Y-m-d H:i',
  YmdHis: () => 'Y-m-d H:i:s',
};

// Global format config (can be overridden)
let dateFormatConfig: DateFormatConfig = defaultDateFormat;

/**
 * Set the date format configuration.
 * @param config - Date format configuration object
 */
export function setDateFormatConfig(config: Partial<DateFormatConfig>): void {
  dateFormatConfig = { ...dateFormatConfig, ...config };
}

/**
 * Get the current date format configuration.
 * @returns Current date format configuration
 */
export function getDateFormatConfig(): DateFormatConfig {
  return dateFormatConfig;
}

// ============================================================================
// Constants for formatDate
// ============================================================================

const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// ============================================================================
// Date Formatting Functions
// ============================================================================

/**
 * Format a date using PHP date() style format string.
 * Referenced from http://www.svendtofte.com/javascript/javascript-date-string-formatting/
 *
 * Format characters:
 * - Y: 4-digit year (e.g., 2024)
 * - y: 2-digit year (e.g., 24)
 * - m: Month with leading zeros (01-12)
 * - n: Month without leading zeros (1-12)
 * - d: Day with leading zeros (01-31)
 * - j: Day without leading zeros (1-31)
 * - H: 24-hour format with leading zeros (00-23)
 * - G: 24-hour format without leading zeros (0-23)
 * - h: 12-hour format with leading zeros (01-12)
 * - g: 12-hour format without leading zeros (1-12)
 * - i: Minutes with leading zeros (00-59)
 * - s: Seconds with leading zeros (00-59)
 * - a: Lowercase am/pm
 * - A: Uppercase AM/PM
 * - D: Short day name (Mon, Tue, etc.)
 * - l: Full day name (Monday, Tuesday, etc.)
 * - M: Short month name (Jan, Feb, etc.)
 * - F: Full month name (January, February, etc.)
 * - w: Day of the week (0-6, Sunday=0)
 * - N: ISO-8601 day of the week (1-7, Monday=1)
 * - W: ISO-8601 week number
 * - z: Day of the year (0-365)
 * - t: Days in the month (28-31)
 * - L: Leap year (1 or 0)
 * - S: English ordinal suffix (st, nd, rd, th)
 * - O: Timezone offset (+0000)
 * - P: Timezone offset with colon (+00:00)
 * - c: ISO 8601 date
 * - r: RFC 2822 date
 * - U: Unix timestamp
 * - %: Escape character (use %Y for literal Y)
 *
 * @param date - The date to format
 * @param formatString - Format string
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatDate(new Date(2024, 0, 15), 'Y-m-d'); // '2024-01-15'
 * formatDate(new Date(2024, 0, 15, 14, 30), 'Y-m-d H:i'); // '2024-01-15 14:30'
 * ```
 */
export function formatDate(date: Date, formatString: string): string {
  // Helper functions for reuse
  const getYear = (): number => date.getFullYear();
  const getMonth = (): string => String(date.getMonth() + 1).padStart(2, '0');
  const getDay = (): string => String(date.getDate()).padStart(2, '0');
  const getHours24 = (): string => String(date.getHours()).padStart(2, '0');
  const getMinutes = (): string => String(date.getMinutes()).padStart(2, '0');
  const getSeconds = (): string => String(date.getSeconds()).padStart(2, '0');

  const getTimezoneOffset = (): string => {
    const os = Math.abs(date.getTimezoneOffset());
    const h = String(Math.floor(os / 60)).padStart(2, '0');
    const m = String(os % 60).padStart(2, '0');
    return date.getTimezoneOffset() < 0 ? `+${h}${m}` : `-${h}${m}`;
  };

  const getTimezoneOffsetColon = (): string => {
    const O = getTimezoneOffset();
    return `${O.substring(0, 3)}:${O.substring(3, 5)}`;
  };

  const isLeapYear = (): number => {
    const year = date.getFullYear();
    return (year % 4 === 0 && year % 100 !== 0) || (year % 4 === 0 && year % 100 === 0 && year % 400 === 0) ? 1 : 0;
  };

  const getDayOfWeekISO = (): number => {
    const w = date.getDay();
    return w === 0 ? 7 : w;
  };

  const getDayOfYear = (): number => {
    const s = `January 1 ${date.getFullYear()} 00:00:00 GMT${getTimezoneOffset()}`;
    const t = new Date(s);
    const diff = date.getTime() - t.getTime();
    return Math.floor(diff / 1000 / 60 / 60 / 24);
  };

  const get12Hour = (): number => {
    const hours = date.getHours();
    if (hours === 0) return 12;
    return hours > 12 ? hours - 12 : hours;
  };

  const switches: Record<string, () => string | number> = {
    // Lowercase Ante meridiem and Post meridiem
    a: () => (date.getHours() > 11 ? 'pm' : 'am'),

    // Uppercase Ante meridiem and Post meridiem
    A: () => (date.getHours() > 11 ? 'PM' : 'AM'),

    // Swatch internet time
    B: () => {
      const off = (date.getTimezoneOffset() + 60) * 60;
      const theSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + off;
      let beat = Math.floor(theSeconds / 86.4);
      if (beat > 1000) beat -= 1000;
      if (beat < 0) beat += 1000;
      return String(beat).padStart(3, '0');
    },

    // ISO 8601 date
    c: () => `${getYear()}-${getMonth()}-${getDay()}T${getHours24()}:${getMinutes()}:${getSeconds()}${getTimezoneOffsetColon()}`,

    // Day of the month, 2 digits with leading zeros
    d: () => getDay(),

    // A textual representation of a day, three letters
    D: () => DAYS_SHORT[date.getDay()] ?? '',

    // A full textual representation of a month
    F: () => MONTHS_LONG[date.getMonth()] ?? '',

    // 12-hour format of an hour without leading zeros
    g: () => get12Hour(),

    // 24-hour format of an hour without leading zeros
    G: () => date.getHours(),

    // 12-hour format of an hour with leading zeros
    h: () => String(get12Hour()).padStart(2, '0'),

    // 24-hour format of an hour with leading zeros
    H: () => getHours24(),

    // Minutes with leading zeros
    i: () => getMinutes(),

    // Whether or not the date is in daylight saving time
    I: () => {
      const noDST = new Date(`January 1 ${getYear()} 00:00:00`);
      return noDST.getTimezoneOffset() === date.getTimezoneOffset() ? 0 : 1;
    },

    // Day of the month without leading zeros
    j: () => date.getDate(),

    // A full textual representation of the day of the week
    l: () => DAYS_LONG[date.getDay()] ?? '',

    // Leap year or not
    L: () => isLeapYear(),

    // Numeric representation of a month, with leading zeros
    m: () => getMonth(),

    // A short textual representation of a month
    M: () => MONTHS_SHORT[date.getMonth()] ?? '',

    // Numeric representation of a month, without leading zeros
    n: () => date.getMonth() + 1,

    // ISO-8601 numeric representation of the day of the week
    N: () => getDayOfWeekISO(),

    // Difference to Greenwich time (GMT) in hours
    O: () => getTimezoneOffset(),

    // Difference to GMT, with colon between hours and minutes
    P: () => getTimezoneOffsetColon(),

    // RFC 2822 formatted date
    r: () => `${DAYS_SHORT[date.getDay()] ?? ''}, ${getDay()} ${MONTHS_SHORT[date.getMonth()] ?? ''} ${getYear()} ${getHours24()}:${getMinutes()}:${getSeconds()} ${getTimezoneOffset()}`,

    // Seconds, with leading zeros
    s: () => getSeconds(),

    // English ordinal suffix for the day of the month
    S: () => {
      const day = date.getDate();
      if (day === 1 || day === 21 || day === 31) return 'st';
      if (day === 2 || day === 22) return 'nd';
      if (day === 3 || day === 23) return 'rd';
      return 'th';
    },

    // Number of days in the given month
    t: () => {
      const daysInMonths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const month = date.getMonth() + 1;
      if (isLeapYear() === 1 && month === 2) return 29;
      return daysInMonths[month] ?? 0;
    },

    // Seconds since the Unix Epoch
    U: () => Math.round(date.getTime() / 1000),

    // Numeric representation of the day of the week
    w: () => date.getDay(),

    // ISO-8601 week number
    W: () => {
      const DoW = getDayOfWeekISO();
      const DoY = getDayOfYear();
      const daysToNY = 364 + isLeapYear() - DoY;

      if (daysToNY <= 2 && DoW <= 3 - daysToNY) {
        return 1;
      }

      if (DoY <= 2 && DoW >= 5) {
        return formatDate(new Date(date.getFullYear() - 1, 11, 31), 'W');
      }

      let nyDoW = new Date(date.getFullYear(), 0, 1).getDay();
      nyDoW = nyDoW !== 0 ? nyDoW - 1 : 6;

      if (nyDoW <= 3) {
        return 1 + Math.floor((DoY + nyDoW) / 7);
      } else {
        return 1 + Math.floor((DoY - (7 - nyDoW)) / 7);
      }
    },

    // A two-digit representation of a year
    y: () => String(date.getFullYear()).slice(-2),

    // A full numeric representation of a year, 4 digits
    Y: () => getYear(),

    // The day of the year (0-indexed)
    z: () => getDayOfYear(),

    // Timezone offset in seconds
    Z: () => date.getTimezoneOffset() * -60,
  };

  const chars = formatString.split('');
  let i = 0;
  const result: string[] = [];

  while (i < chars.length) {
    const char = chars[i];
    if (char === '%') {
      // Escape character - skip and use next char literally
      i++;
      if (i < chars.length) {
        result.push(chars[i] ?? '');
      }
    } else if (char && switches[char]) {
      const fn = switches[char];
      if (fn) {
        result.push(String(fn()));
      }
    } else {
      result.push(char ?? '');
    }
    i++;
  }

  return result.join('');
}

// ============================================================================
// Date Utility Functions
// ============================================================================

/**
 * Calculate the difference in days between two dates.
 *
 * @param refDate - Reference date (string or Date)
 * @param targetDate - Target date (string or Date)
 * @returns Difference in days (positive if target is after ref)
 *
 * @example
 * ```typescript
 * diff('20240101', '20240115'); // 14
 * diff(new Date(2024, 0, 1), new Date(2024, 0, 15)); // 14
 * ```
 */
export function diff(refDate: string | Date, targetDate: string | Date): number {
  let refDateObj: Date;
  let targetDateObj: Date;

  if (typeof refDate === 'string') {
    const parsed = strToDate(refDate);
    refDateObj = parsed?.obj ?? new Date();
  } else {
    refDateObj = refDate;
  }

  if (typeof targetDate === 'string') {
    const parsed = strToDate(targetDate);
    targetDateObj = parsed?.obj ?? new Date();
  } else {
    targetDateObj = targetDate;
  }

  return Math.ceil((targetDateObj.getTime() - refDateObj.getTime()) / 1000 / 24 / 60 / 60);
}

/**
 * Parse a date string into an array of date components.
 *
 * @param str - Date string (digits only)
 * @param format - Format string (e.g., 'Ymd', 'mdY', 'dmY')
 * @param isString - If true, returns strings instead of numbers
 * @returns Array of [year, month, day] or string equivalents
 *
 * @example
 * ```typescript
 * strToDateStrArr('20240115', 'Ymd'); // [2024, 1, 15]
 * strToDateStrArr('01152024', 'mdY'); // [2024, 1, 15]
 * ```
 */
export function strToDateStrArr(
  str: string,
  format: string,
  isString?: boolean
): (string | number)[] {
  const dateStrArr: (string | number)[] = [];
  let fixNum = 0;

  // Handle 3-digit year or 1-digit month formats
  if ((format.length === 3 && str.length === 7) || (format.length === 2 && str.length === 5)) {
    fixNum = -1;
  }

  if (startsWith(format, 'Ymd')) {
    dateStrArr.push(str.substring(0, 4 + fixNum)); // year
    dateStrArr.push(str.substring(4 + fixNum, 6 + fixNum)); // month
    dateStrArr.push(str.substring(6 + fixNum, 8 + fixNum)); // day
  } else if (startsWith(format, 'mdY')) {
    dateStrArr.push(str.substring(4, 8 + fixNum)); // year
    dateStrArr.push(str.substring(0, 2)); // month
    dateStrArr.push(str.substring(2, 4)); // day
  } else if (startsWith(format, 'dmY')) {
    dateStrArr.push(str.substring(4, 8 + fixNum)); // year
    dateStrArr.push(str.substring(2, 4)); // month
    dateStrArr.push(str.substring(0, 2)); // day
  } else if (startsWith(format, 'Ym')) {
    dateStrArr.push(str.substring(0, 4 + fixNum)); // year
    dateStrArr.push(str.substring(4 + fixNum, 6 + fixNum)); // month
  } else if (startsWith(format, 'mY')) {
    dateStrArr.push(str.substring(2, 6 + fixNum)); // year
    dateStrArr.push(str.substring(0, 2)); // month
  } else {
    throw new Error(
      `[NC.date.strToDateStrArr] "${format}" date format is not supported. Please use Ymd, mdY, dmY, Ym, or mY formats.`
    );
  }

  if (isString === undefined || isString === false) {
    return dateStrArr.map((v) => parseInt(String(v), 10));
  }

  return dateStrArr;
}

/**
 * Convert a date string to a Date object.
 *
 * @param str - Date string (can contain separators)
 * @param format - Optional format string
 * @returns DateInfo object with Date and format, or null if invalid
 *
 * @example
 * ```typescript
 * strToDate('20240115'); // { obj: Date, format: 'Y-m-d' }
 * strToDate('2024-01-15'); // { obj: Date, format: 'Y-m-d' }
 * strToDate('20240115143000'); // { obj: Date, format: 'Y-m-d H:i:s' }
 * ```
 */
export function strToDate(str: string, format?: string): ParsedDateInfo | null {
  const cleanStr = trimToEmpty(str).replace(/[^0-9]/g, '');
  let dateInfo: ParsedDateInfo | null = null;
  let dateStrArr: (string | number)[];

  if (cleanStr.length > 2 && cleanStr.length <= 4) {
    // Year only
    dateInfo = {
      obj: new Date(parseInt(cleanStr, 10), 0, 1, 0, 0, 0),
      format: 'Y',
    };
  } else if (cleanStr.length === 6) {
    // Year and month
    const fmt = format ?? dateFormatConfig.Ym();
    dateStrArr = strToDateStrArr(cleanStr, fmt.replace(/[^YmdHis]/g, ''));
    dateInfo = {
      obj: new Date(Number(dateStrArr[0]), Number(dateStrArr[1]) - 1, 1, 0, 0, 0),
      format: fmt,
    };
  } else if (cleanStr.length === 8) {
    // Year, month, and day
    const fmt = format ?? dateFormatConfig.Ymd();
    dateStrArr = strToDateStrArr(cleanStr, fmt.replace(/[^YmdHis]/g, ''));
    dateInfo = {
      obj: new Date(Number(dateStrArr[0]), Number(dateStrArr[1]) - 1, Number(dateStrArr[2]), 0, 0, 0),
      format: fmt,
    };
  } else if (cleanStr.length === 10) {
    // With hours
    const fmt = format ?? dateFormatConfig.YmdH();
    dateStrArr = strToDateStrArr(cleanStr, fmt.replace(/[^YmdHis]/g, ''));
    dateInfo = {
      obj: new Date(
        Number(dateStrArr[0]),
        Number(dateStrArr[1]) - 1,
        Number(dateStrArr[2]),
        parseInt(cleanStr.substring(8, 10), 10),
        0,
        0
      ),
      format: fmt,
    };
  } else if (cleanStr.length === 12) {
    // With hours and minutes
    const fmt = format ?? dateFormatConfig.YmdHi();
    dateStrArr = strToDateStrArr(cleanStr, fmt.replace(/[^YmdHis]/g, ''));
    dateInfo = {
      obj: new Date(
        Number(dateStrArr[0]),
        Number(dateStrArr[1]) - 1,
        Number(dateStrArr[2]),
        parseInt(cleanStr.substring(8, 10), 10),
        parseInt(cleanStr.substring(10, 12), 10),
        0
      ),
      format: fmt,
    };
  } else if (cleanStr.length >= 14) {
    // Full datetime
    const fmt = format ?? dateFormatConfig.YmdHis();
    dateStrArr = strToDateStrArr(cleanStr, fmt.replace(/[^YmdHis]/g, ''));
    dateInfo = {
      obj: new Date(
        Number(dateStrArr[0]),
        Number(dateStrArr[1]) - 1,
        Number(dateStrArr[2]),
        parseInt(cleanStr.substring(8, 10), 10),
        parseInt(cleanStr.substring(10, 12), 10),
        parseInt(cleanStr.substring(12, 14), 10)
      ),
      format: fmt,
    };
  }

  return dateInfo;
}

/**
 * Format a date string to another format.
 *
 * @param str - Date string to format
 * @param format - Optional target format (defaults to detected format)
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * format('20240115'); // '2024-01-15'
 * format('20240115', 'd/m/Y'); // '15/01/2024'
 * ```
 */
export function format(str: string, targetFormat?: string): string {
  const dateInfo = strToDate(str);
  if (dateInfo === null) return str;
  return formatDate(dateInfo.obj, targetFormat ?? dateInfo.format);
}

/**
 * Convert a Date object to Unix timestamp (seconds).
 *
 * @param dateObj - Date object (defaults to current date)
 * @returns Unix timestamp in seconds
 *
 * @example
 * ```typescript
 * dateToTs(new Date(2024, 0, 1)); // 1704067200 (example)
 * dateToTs(); // Current timestamp
 * ```
 */
export function dateToTs(dateObj?: Date): number {
  const d = dateObj ?? new Date();
  return Math.round(d.getTime() / 1000);
}

/**
 * Convert Unix timestamp to Date object.
 *
 * @param tsNum - Unix timestamp in milliseconds (defaults to current time)
 * @returns Date object
 *
 * @example
 * ```typescript
 * tsToDate(1704067200000); // Date object for 2024-01-01
 * tsToDate(); // Current date
 * ```
 */
export function tsToDate(tsNum?: number): Date {
  if (tsNum === undefined) {
    return new Date();
  }
  return new Date(tsNum);
}

/**
 * Generate a calendar grid for a specific month.
 * Returns an array of weeks, where each week is an array of 7 dates.
 * Includes dates from previous/next months to fill the grid.
 *
 * @param year - Year (4 digits)
 * @param month - Month (1-12)
 * @returns Array of week arrays (6 weeks, 7 days each)
 *
 * @example
 * ```typescript
 * const calendar = dateList(2024, 1); // January 2024
 * // Returns array of 6 weeks, each with 7 Date objects
 * ```
 */
export function dateList(year: number, month: number): WeekArray[] {
  const weekArr: WeekArray[] = [];
  const prevDate = new Date(year, month - 1, 0);
  const currDate = new Date(year, month, 0);
  const nextDate = new Date(year, month + 1, 0);

  const lastDate = currDate.getDate();
  const prevLastDate = prevDate.getDate();
  const prevLastDay = prevDate.getDay();
  let daysOfWeek: Date[] = [];

  // Add days from previous month
  if (prevLastDay !== 6) {
    for (let i = prevLastDate - prevLastDay; i <= prevLastDate; i++) {
      prevDate.setDate(i);
      daysOfWeek.push(new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate(), 0));
    }
  }

  // Add days from current month
  for (let i = 1; i <= lastDate; i++) {
    currDate.setDate(i);
    daysOfWeek.push(new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 0));
    if (i > 0 && daysOfWeek.length === 7) {
      weekArr.push(daysOfWeek as WeekArray);
      daysOfWeek = [];
    }
  }

  // Add remaining days to last week
  if (daysOfWeek.length > 0) {
    weekArr.push(daysOfWeek as WeekArray);
  }

  // Fill last week with next month dates
  let daysOfLastWeek = weekArr[weekArr.length - 1];
  let lastDayOfCalendar = 0;

  if (daysOfLastWeek) {
    for (let i = 1, length = daysOfLastWeek.length; i <= 7 - length; i++) {
      nextDate.setDate(i);
      (daysOfLastWeek as Date[]).push(
        new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(), 0)
      );
      lastDayOfCalendar = i;
    }
  }

  // Add 6th week if needed (to ensure consistent 6-week grid)
  if (weekArr.length === 5) {
    daysOfLastWeek = [] as unknown as WeekArray;
    for (let i = lastDayOfCalendar + 1; i <= lastDayOfCalendar + 7; i++) {
      nextDate.setDate(i);
      (daysOfLastWeek as Date[]).push(
        new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(), 0)
      );
    }
    weekArr.push(daysOfLastWeek);
  }

  return weekArr;
}

// ============================================================================
// Date Namespace Object
// ============================================================================

/**
 * Date utilities namespace object.
 * Provides all date functions as properties for compatibility.
 */
export const date = {
  formatDate,
  diff,
  strToDateStrArr,
  strToDate,
  format,
  dateToTs,
  tsToDate,
  dateList,
  setDateFormatConfig,
  getDateFormatConfig,
} as const;

// ============================================================================
// Predefined Format Constants
// ============================================================================

/**
 * Atom format: "2005-08-15T15:52:01+00:00"
 */
export const DATE_ATOM = 'Y-m-d%TH:i:sP';

/**
 * ISO-8601 format: "2005-08-15T15:52:01+0000"
 */
export const DATE_ISO8601 = 'Y-m-d%TH:i:sO';

/**
 * RFC 2822 format: "Mon, 15 Aug 2005 15:52:01 +0000"
 */
export const DATE_RFC2822 = 'D, d M Y H:i:s O';

/**
 * W3C format: "2005-08-15T15:52:01+00:00"
 */
export const DATE_W3C = 'Y-m-d%TH:i:sP';

export default date;

