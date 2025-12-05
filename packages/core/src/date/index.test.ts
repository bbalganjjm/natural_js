import { describe, it, expect, beforeEach } from 'vitest';
import {
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
  date,
  DATE_ATOM,
  DATE_ISO8601,
  DATE_RFC2822,
  DATE_W3C,
} from './index';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    const testDate = new Date(2024, 0, 15, 14, 30, 45); // 2024-01-15 14:30:45

    it('should format year', () => {
      expect(formatDate(testDate, 'Y')).toBe('2024');
      expect(formatDate(testDate, 'y')).toBe('24');
    });

    it('should format month', () => {
      expect(formatDate(testDate, 'm')).toBe('01');
      expect(formatDate(testDate, 'n')).toBe('1');
      expect(formatDate(testDate, 'M')).toBe('Jan');
      expect(formatDate(testDate, 'F')).toBe('January');
    });

    it('should format day', () => {
      expect(formatDate(testDate, 'd')).toBe('15');
      expect(formatDate(testDate, 'j')).toBe('15');
      expect(formatDate(testDate, 'D')).toBe('Mon');
      expect(formatDate(testDate, 'l')).toBe('Monday');
    });

    it('should format time (24-hour)', () => {
      expect(formatDate(testDate, 'H')).toBe('14');
      expect(formatDate(testDate, 'G')).toBe('14');
      expect(formatDate(testDate, 'i')).toBe('30');
      expect(formatDate(testDate, 's')).toBe('45');
    });

    it('should format time (12-hour)', () => {
      expect(formatDate(testDate, 'h')).toBe('02');
      expect(formatDate(testDate, 'g')).toBe('2');
      expect(formatDate(testDate, 'a')).toBe('pm');
      expect(formatDate(testDate, 'A')).toBe('PM');
    });

    it('should handle midnight (12-hour format)', () => {
      const midnight = new Date(2024, 0, 15, 0, 0, 0);
      expect(formatDate(midnight, 'g')).toBe('12');
      expect(formatDate(midnight, 'a')).toBe('am');
    });

    it('should format common date patterns', () => {
      expect(formatDate(testDate, 'Y-m-d')).toBe('2024-01-15');
      expect(formatDate(testDate, 'd/m/Y')).toBe('15/01/2024');
      expect(formatDate(testDate, 'Y-m-d H:i:s')).toBe('2024-01-15 14:30:45');
    });

    it('should format day of week', () => {
      expect(formatDate(testDate, 'w')).toBe('1'); // Monday = 1
      expect(formatDate(testDate, 'N')).toBe('1'); // ISO-8601: Monday = 1
    });

    it('should format day of week for Sunday', () => {
      const sunday = new Date(2024, 0, 14); // Sunday
      expect(formatDate(sunday, 'w')).toBe('0');
      expect(formatDate(sunday, 'N')).toBe('7'); // ISO-8601: Sunday = 7
    });

    it('should format ordinal suffix', () => {
      expect(formatDate(new Date(2024, 0, 1), 'S')).toBe('st');
      expect(formatDate(new Date(2024, 0, 2), 'S')).toBe('nd');
      expect(formatDate(new Date(2024, 0, 3), 'S')).toBe('rd');
      expect(formatDate(new Date(2024, 0, 4), 'S')).toBe('th');
      expect(formatDate(new Date(2024, 0, 21), 'S')).toBe('st');
      expect(formatDate(new Date(2024, 0, 22), 'S')).toBe('nd');
      expect(formatDate(new Date(2024, 0, 23), 'S')).toBe('rd');
      expect(formatDate(new Date(2024, 0, 31), 'S')).toBe('st');
    });

    it('should format leap year indicator', () => {
      expect(formatDate(new Date(2024, 0, 1), 'L')).toBe('1'); // 2024 is leap year
      expect(formatDate(new Date(2023, 0, 1), 'L')).toBe('0'); // 2023 is not leap year
    });

    it('should format days in month', () => {
      expect(formatDate(new Date(2024, 0, 1), 't')).toBe('31'); // January
      expect(formatDate(new Date(2024, 1, 1), 't')).toBe('29'); // February (leap year)
      expect(formatDate(new Date(2023, 1, 1), 't')).toBe('28'); // February (non-leap year)
      expect(formatDate(new Date(2024, 3, 1), 't')).toBe('30'); // April
    });

    it('should format Unix timestamp', () => {
      const ts = formatDate(testDate, 'U');
      expect(parseInt(ts, 10)).toBeGreaterThan(0);
    });

    it('should escape characters with %', () => {
      // % escapes the next character, making it literal
      expect(formatDate(testDate, '%Y%m%d')).toBe('Ymd');
      // Note: %- means literal '-', then following characters are processed
      expect(formatDate(testDate, 'Y%-m%-d')).toBe('2024-01-15');
    });

    it('should handle timezone offset', () => {
      const O = formatDate(testDate, 'O');
      expect(O).toMatch(/^[+-]\d{4}$/);

      const P = formatDate(testDate, 'P');
      expect(P).toMatch(/^[+-]\d{2}:\d{2}$/);
    });

    it('should format ISO 8601 date', () => {
      const c = formatDate(testDate, 'c');
      expect(c).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    });

    it('should format RFC 2822 date', () => {
      const r = formatDate(testDate, 'r');
      expect(r).toContain('Mon, 15 Jan 2024');
    });
  });

  describe('diff', () => {
    it('should calculate difference between dates', () => {
      expect(diff('20240101', '20240115')).toBe(14);
      expect(diff('20240115', '20240101')).toBe(-14);
    });

    it('should handle Date objects', () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 15);
      expect(diff(date1, date2)).toBe(14);
    });

    it('should handle mixed inputs', () => {
      const date1 = new Date(2024, 0, 1);
      expect(diff(date1, '20240115')).toBe(14);
      expect(diff('20240101', date1)).toBe(0);
    });

    it('should handle same date', () => {
      expect(diff('20240101', '20240101')).toBe(0);
    });
  });

  describe('strToDateStrArr', () => {
    it('should parse Ymd format', () => {
      expect(strToDateStrArr('20240115', 'Ymd')).toEqual([2024, 1, 15]);
    });

    it('should parse mdY format', () => {
      expect(strToDateStrArr('01152024', 'mdY')).toEqual([2024, 1, 15]);
    });

    it('should parse dmY format', () => {
      expect(strToDateStrArr('15012024', 'dmY')).toEqual([2024, 1, 15]);
    });

    it('should parse Ym format', () => {
      expect(strToDateStrArr('202401', 'Ym')).toEqual([2024, 1]);
    });

    it('should parse mY format', () => {
      expect(strToDateStrArr('012024', 'mY')).toEqual([2024, 1]);
    });

    it('should return strings when isString is true', () => {
      expect(strToDateStrArr('20240115', 'Ymd', true)).toEqual(['2024', '01', '15']);
    });

    it('should throw error for unsupported format', () => {
      expect(() => strToDateStrArr('20240115', 'xyz')).toThrow();
    });
  });

  describe('strToDate', () => {
    it('should parse 4-digit year string', () => {
      const result = strToDate('2024');
      expect(result?.obj.getFullYear()).toBe(2024);
      expect(result?.format).toBe('Y');
    });

    it('should parse 6-digit date string', () => {
      const result = strToDate('202401');
      expect(result?.obj.getFullYear()).toBe(2024);
      expect(result?.obj.getMonth()).toBe(0); // January
    });

    it('should parse 8-digit date string', () => {
      const result = strToDate('20240115');
      expect(result?.obj.getFullYear()).toBe(2024);
      expect(result?.obj.getMonth()).toBe(0);
      expect(result?.obj.getDate()).toBe(15);
    });

    it('should parse date string with separators', () => {
      const result = strToDate('2024-01-15');
      expect(result?.obj.getFullYear()).toBe(2024);
      expect(result?.obj.getMonth()).toBe(0);
      expect(result?.obj.getDate()).toBe(15);
    });

    it('should parse datetime string with hours', () => {
      const result = strToDate('2024011514');
      expect(result?.obj.getHours()).toBe(14);
    });

    it('should parse datetime string with minutes', () => {
      const result = strToDate('202401151430');
      expect(result?.obj.getHours()).toBe(14);
      expect(result?.obj.getMinutes()).toBe(30);
    });

    it('should parse full datetime string', () => {
      const result = strToDate('20240115143045');
      expect(result?.obj.getHours()).toBe(14);
      expect(result?.obj.getMinutes()).toBe(30);
      expect(result?.obj.getSeconds()).toBe(45);
    });

    it('should return null for invalid string', () => {
      expect(strToDate('')).toBeNull();
      expect(strToDate('12')).toBeNull();
    });
  });

  describe('format', () => {
    it('should format date string', () => {
      expect(format('20240115')).toBe('2024-01-15');
    });

    it('should format with custom format', () => {
      expect(format('20240115', 'd/m/Y')).toBe('15/01/2024');
    });

    it('should return original string for invalid input', () => {
      expect(format('')).toBe('');
      expect(format('invalid')).toBe('invalid');
    });
  });

  describe('dateToTs', () => {
    it('should convert date to timestamp', () => {
      const date = new Date(2024, 0, 1, 0, 0, 0);
      const ts = dateToTs(date);
      expect(typeof ts).toBe('number');
      expect(ts).toBeGreaterThan(0);
    });

    it('should use current date when no argument', () => {
      const ts = dateToTs();
      const now = Math.round(Date.now() / 1000);
      expect(Math.abs(ts - now)).toBeLessThan(2); // Within 2 seconds
    });
  });

  describe('tsToDate', () => {
    it('should convert timestamp to date', () => {
      const ts = Date.now();
      const result = tsToDate(ts);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(ts);
    });

    it('should return current date when no argument', () => {
      const before = Date.now();
      const result = tsToDate();
      const after = Date.now();
      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('dateList', () => {
    it('should return 6 weeks', () => {
      const result = dateList(2024, 1);
      expect(result.length).toBe(6);
    });

    it('should return 7 days per week', () => {
      const result = dateList(2024, 1);
      result.forEach((week) => {
        expect(week.length).toBe(7);
      });
    });

    it('should include dates from current month', () => {
      const result = dateList(2024, 1); // January 2024
      // Find if January 15 is in the list
      const hasJan15 = result.some((week) =>
        week.some((d) => d.getMonth() === 0 && d.getDate() === 15 && d.getFullYear() === 2024)
      );
      expect(hasJan15).toBe(true);
    });

    it('should include dates from previous month', () => {
      const result = dateList(2024, 1); // January 2024
      // January 2024 starts on Monday, so first week should have December dates
      const firstWeek = result[0];
      // Check if there are dates from December (month 11)
      const hasDecember = firstWeek?.some((d) => d.getMonth() === 11);
      expect(hasDecember).toBe(true);
    });

    it('should include dates from next month', () => {
      const result = dateList(2024, 1); // January 2024
      const lastWeek = result[result.length - 1];
      // Check if there are dates from February (month 1)
      const hasFebruary = lastWeek?.some((d) => d.getMonth() === 1);
      expect(hasFebruary).toBe(true);
    });

    it('should handle different months correctly', () => {
      // February 2024 (leap year)
      const feb = dateList(2024, 2);
      expect(feb.length).toBe(6);

      // June 2024
      const jun = dateList(2024, 6);
      expect(jun.length).toBe(6);
    });
  });

  describe('setDateFormatConfig / getDateFormatConfig', () => {
    beforeEach(() => {
      // Reset to default config
      setDateFormatConfig({
        Ym: () => 'Y-m',
        Ymd: () => 'Y-m-d',
        YmdH: () => 'Y-m-d H',
        YmdHi: () => 'Y-m-d H:i',
        YmdHis: () => 'Y-m-d H:i:s',
      });
    });

    it('should get default config', () => {
      const config = getDateFormatConfig();
      expect(config.Ymd()).toBe('Y-m-d');
    });

    it('should set custom config', () => {
      setDateFormatConfig({
        Ymd: () => 'd/m/Y',
      });
      const config = getDateFormatConfig();
      expect(config.Ymd()).toBe('d/m/Y');
    });
  });

  describe('date namespace object', () => {
    it('should export all functions as properties', () => {
      expect(date.formatDate).toBe(formatDate);
      expect(date.diff).toBe(diff);
      expect(date.strToDateStrArr).toBe(strToDateStrArr);
      expect(date.strToDate).toBe(strToDate);
      expect(date.format).toBe(format);
      expect(date.dateToTs).toBe(dateToTs);
      expect(date.tsToDate).toBe(tsToDate);
      expect(date.dateList).toBe(dateList);
    });
  });

  describe('Format Constants', () => {
    it('should have correct format constants', () => {
      expect(DATE_ATOM).toBe('Y-m-d%TH:i:sP');
      expect(DATE_ISO8601).toBe('Y-m-d%TH:i:sO');
      expect(DATE_RFC2822).toBe('D, d M Y H:i:s O');
      expect(DATE_W3C).toBe('Y-m-d%TH:i:sP');
    });
  });
});

