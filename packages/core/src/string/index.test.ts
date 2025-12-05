import { describe, it, expect } from 'vitest';
import {
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
  string,
} from './index';

describe('String Utilities', () => {
  describe('contains', () => {
    it('should return true when string contains substring', () => {
      expect(contains('hello world', 'world')).toBe(true);
      expect(contains('hello world', 'hello')).toBe(true);
      expect(contains('hello world', 'o w')).toBe(true);
    });

    it('should return false when string does not contain substring', () => {
      expect(contains('hello world', 'bye')).toBe(false);
      expect(contains('hello', 'World')).toBe(false); // case sensitive
    });

    it('should return true for empty substring', () => {
      expect(contains('hello', '')).toBe(true);
    });

    it('should throw error for non-string context', () => {
      expect(() => contains(null as unknown as string, 'test')).toThrow();
      expect(() => contains(undefined as unknown as string, 'test')).toThrow();
      expect(() => contains(123 as unknown as string, 'test')).toThrow();
    });
  });

  describe('endsWith', () => {
    it('should return true when string ends with substring', () => {
      expect(endsWith('hello.txt', '.txt')).toBe(true);
      expect(endsWith('hello', 'llo')).toBe(true);
      expect(endsWith('hello', 'hello')).toBe(true);
    });

    it('should return false when string does not end with substring', () => {
      expect(endsWith('hello.txt', '.jpg')).toBe(false);
      expect(endsWith('hello', 'hel')).toBe(false);
    });

    it('should return true for empty substring', () => {
      expect(endsWith('hello', '')).toBe(true);
    });

    it('should throw error for non-string context', () => {
      expect(() => endsWith(null as unknown as string, 'test')).toThrow();
      expect(() => endsWith(undefined as unknown as string, 'test')).toThrow();
    });
  });

  describe('startsWith', () => {
    it('should return true when string starts with substring', () => {
      expect(startsWith('hello world', 'hello')).toBe(true);
      expect(startsWith('hello', 'hel')).toBe(true);
      expect(startsWith('hello', 'hello')).toBe(true);
    });

    it('should return false when string does not start with substring', () => {
      expect(startsWith('hello world', 'world')).toBe(false);
      expect(startsWith('hello', 'ello')).toBe(false);
    });

    it('should return true for empty substring', () => {
      expect(startsWith('hello', '')).toBe(true);
    });

    it('should throw error for non-string context', () => {
      expect(() => startsWith(null as unknown as string, 'test')).toThrow();
      expect(() => startsWith(undefined as unknown as string, 'test')).toThrow();
    });
  });

  describe('insertAt', () => {
    it('should insert string at specified position', () => {
      expect(insertAt('hello world', 5, '!!!')).toBe('hello!!! world');
      expect(insertAt('abc', 1, 'X')).toBe('aXbc');
      expect(insertAt('hello', 0, 'X')).toBe('Xhello');
      expect(insertAt('hello', 5, 'X')).toBe('helloX');
    });

    it('should handle empty strings', () => {
      expect(insertAt('', 0, 'X')).toBe('X');
      expect(insertAt('hello', 2, '')).toBe('hello');
    });
  });

  describe('removeWhitespace', () => {
    it('should remove all whitespace', () => {
      expect(removeWhitespace(' hello world ')).toBe('helloworld');
      expect(removeWhitespace('a b c')).toBe('abc');
      expect(removeWhitespace('  hello  ')).toBe('hello');
    });

    it('should handle various whitespace characters', () => {
      expect(removeWhitespace('a\tb\nc')).toBe('abc');
      expect(removeWhitespace('a\r\nb')).toBe('ab');
    });

    it('should return empty string for empty input', () => {
      expect(removeWhitespace('')).toBe('');
      expect(removeWhitespace('   ')).toBe('');
    });
  });

  describe('lpad', () => {
    it('should left pad string to specified length', () => {
      expect(lpad('123', 5, '0')).toBe('00123');
      expect(lpad('abc', 6, 'X')).toBe('XXXabc');
      expect(lpad('1', 3, '0')).toBe('001');
    });

    it('should not pad if string is already long enough', () => {
      expect(lpad('12345', 5, '0')).toBe('12345');
      expect(lpad('123456', 5, '0')).toBe('123456');
    });

    it('should handle empty string', () => {
      expect(lpad('', 3, '0')).toBe('000');
    });

    it('should handle multi-character pad string', () => {
      expect(lpad('x', 5, 'ab')).toBe('ababx');
    });
  });

  describe('rpad', () => {
    it('should right pad string to specified length', () => {
      expect(rpad('123', 5, '0')).toBe('12300');
      expect(rpad('abc', 6, 'X')).toBe('abcXXX');
      expect(rpad('1', 3, '0')).toBe('100');
    });

    it('should not pad if string is already long enough', () => {
      expect(rpad('12345', 5, '0')).toBe('12345');
      expect(rpad('123456', 5, '0')).toBe('123456');
    });

    it('should handle empty string', () => {
      expect(rpad('', 3, '0')).toBe('000');
    });

    it('should handle multi-character pad string', () => {
      expect(rpad('x', 5, 'ab')).toBe('xabab');
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty strings', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty('\t\n')).toBe(true);
    });

    it('should return true for null and undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty(' hello ')).toBe(false);
      expect(isEmpty('0')).toBe(false);
    });
  });

  describe('byteLength', () => {
    it('should calculate byte length for ASCII characters', () => {
      expect(byteLength('abc', 3)).toBe(3);
      expect(byteLength('hello', 3)).toBe(5);
    });

    it('should calculate byte length for multi-byte characters', () => {
      // Korean characters (UTF-8: 3 bytes each)
      expect(byteLength('한글', 3)).toBe(6);
      expect(byteLength('가나다', 3)).toBe(9);
    });

    it('should handle mixed characters', () => {
      expect(byteLength('한글abc', 3)).toBe(9);
      expect(byteLength('a한b', 3)).toBe(5);
    });

    it('should use default byte length if not specified', () => {
      expect(byteLength('한')).toBe(3);
    });

    it('should handle empty string', () => {
      expect(byteLength('', 3)).toBe(0);
    });

    it('should handle different charByteLength values', () => {
      expect(byteLength('한', 2)).toBe(2);
      expect(byteLength('한', 4)).toBe(4);
    });
  });

  describe('trimToEmpty', () => {
    it('should trim whitespace and return string', () => {
      expect(trimToEmpty('  hello  ')).toBe('hello');
      expect(trimToEmpty('hello')).toBe('hello');
    });

    it('should return empty string for null/undefined', () => {
      expect(trimToEmpty(null)).toBe('');
      expect(trimToEmpty(undefined)).toBe('');
    });

    it('should return empty string for whitespace-only input', () => {
      expect(trimToEmpty('   ')).toBe('');
      expect(trimToEmpty('\t\n')).toBe('');
    });

    it('should convert non-string to string', () => {
      expect(trimToEmpty(123 as unknown as string)).toBe('123');
    });
  });

  describe('nullToEmpty', () => {
    it('should return empty string for null/undefined', () => {
      expect(nullToEmpty(null)).toBe('');
      expect(nullToEmpty(undefined)).toBe('');
    });

    it('should return original string without trimming', () => {
      expect(nullToEmpty('  hello  ')).toBe('  hello  ');
      expect(nullToEmpty('hello')).toBe('hello');
    });

    it('should preserve whitespace', () => {
      expect(nullToEmpty('   ')).toBe('   ');
    });
  });

  describe('trimToNull', () => {
    it('should trim and return string if not empty', () => {
      expect(trimToNull('  hello  ')).toBe('hello');
      expect(trimToNull('hello')).toBe('hello');
    });

    it('should return null for empty strings', () => {
      expect(trimToNull('')).toBeNull();
      expect(trimToNull('   ')).toBeNull();
      expect(trimToNull('\t\n')).toBeNull();
    });

    it('should return null for null/undefined', () => {
      expect(trimToNull(null)).toBeNull();
      expect(trimToNull(undefined)).toBeNull();
    });
  });

  describe('trimToUndefined', () => {
    it('should trim and return string if not empty', () => {
      expect(trimToUndefined('  hello  ')).toBe('hello');
      expect(trimToUndefined('hello')).toBe('hello');
    });

    it('should return undefined for empty strings', () => {
      expect(trimToUndefined('')).toBeUndefined();
      expect(trimToUndefined('   ')).toBeUndefined();
      expect(trimToUndefined('\t\n')).toBeUndefined();
    });

    it('should return undefined for null/undefined', () => {
      expect(trimToUndefined(null)).toBeUndefined();
      expect(trimToUndefined(undefined)).toBeUndefined();
    });
  });

  describe('trimToZero', () => {
    it('should trim and return string if not empty', () => {
      expect(trimToZero('  123  ')).toBe('123');
      expect(trimToZero('hello')).toBe('hello');
    });

    it('should return "0" for empty strings', () => {
      expect(trimToZero('')).toBe('0');
      expect(trimToZero('   ')).toBe('0');
      expect(trimToZero('\t\n')).toBe('0');
    });

    it('should return "0" for null/undefined', () => {
      expect(trimToZero(null)).toBe('0');
      expect(trimToZero(undefined)).toBe('0');
    });
  });

  describe('trimToVal', () => {
    it('should trim and return string if not empty', () => {
      expect(trimToVal('  hello  ', 'default')).toBe('hello');
      expect(trimToVal('hello', 'default')).toBe('hello');
    });

    it('should return default value for empty strings', () => {
      expect(trimToVal('', 'default')).toBe('default');
      expect(trimToVal('   ', 'default')).toBe('default');
      expect(trimToVal('\t\n', 'N/A')).toBe('N/A');
    });

    it('should return default value for null/undefined', () => {
      expect(trimToVal(null, 'default')).toBe('default');
      expect(trimToVal(undefined, 'default')).toBe('default');
    });
  });

  describe('string namespace object', () => {
    it('should export all functions as properties', () => {
      expect(string.contains).toBe(contains);
      expect(string.endsWith).toBe(endsWith);
      expect(string.startsWith).toBe(startsWith);
      expect(string.insertAt).toBe(insertAt);
      expect(string.removeWhitespace).toBe(removeWhitespace);
      expect(string.lpad).toBe(lpad);
      expect(string.rpad).toBe(rpad);
      expect(string.isEmpty).toBe(isEmpty);
      expect(string.byteLength).toBe(byteLength);
      expect(string.trimToEmpty).toBe(trimToEmpty);
      expect(string.nullToEmpty).toBe(nullToEmpty);
      expect(string.trimToNull).toBe(trimToNull);
      expect(string.trimToUndefined).toBe(trimToUndefined);
      expect(string.trimToZero).toBe(trimToZero);
      expect(string.trimToVal).toBe(trimToVal);
    });

    it('should work when called via namespace', () => {
      expect(string.contains('hello', 'ell')).toBe(true);
      expect(string.trimToEmpty('  test  ')).toBe('test');
    });
  });
});

