import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
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
  typeUtils,
} from './index';

describe('Type Utilities', () => {
  describe('type', () => {
    it('should return "string" for strings', () => {
      expect(type('hello')).toBe('string');
      expect(type('')).toBe('string');
    });

    it('should return "number" for numbers', () => {
      expect(type(123)).toBe('number');
      expect(type(0)).toBe('number');
      expect(type(-123.45)).toBe('number');
      expect(type(NaN)).toBe('number');
      expect(type(Infinity)).toBe('number');
    });

    it('should return "boolean" for booleans', () => {
      expect(type(true)).toBe('boolean');
      expect(type(false)).toBe('boolean');
    });

    it('should return "array" for arrays', () => {
      expect(type([])).toBe('array');
      expect(type([1, 2, 3])).toBe('array');
    });

    it('should return "object" for plain objects', () => {
      expect(type({})).toBe('object');
      expect(type({ a: 1 })).toBe('object');
    });

    it('should return "function" for functions', () => {
      expect(type(() => {})).toBe('function');
      expect(type(function () {})).toBe('function');
    });

    it('should return "asyncfunction" for async functions', () => {
      expect(type(async () => {})).toBe('asyncfunction');
    });

    it('should return "date" for dates', () => {
      expect(type(new Date())).toBe('date');
    });

    it('should return "regexp" for regular expressions', () => {
      expect(type(/test/)).toBe('regexp');
      expect(type(new RegExp('test'))).toBe('regexp');
    });

    it('should return "null" for null', () => {
      expect(type(null)).toBe('null');
    });

    it('should return "undefined" for undefined', () => {
      expect(type(undefined)).toBe('undefined');
    });
  });

  describe('isString', () => {
    it('should return true for strings', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString(String('test'))).toBe(true);
    });

    it('should return false for non-strings', () => {
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString([])).toBe(false);
    });
  });

  describe('isNumeric', () => {
    it('should return true for numbers', () => {
      expect(isNumeric(123)).toBe(true);
      expect(isNumeric(0)).toBe(true);
      expect(isNumeric(-123.45)).toBe(true);
    });

    it('should return true for numeric strings', () => {
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('12.34')).toBe(true);
      expect(isNumeric('-123')).toBe(true);
    });

    it('should return false for non-numeric values', () => {
      expect(isNumeric('abc')).toBe(false);
      expect(isNumeric(NaN)).toBe(false);
      expect(isNumeric(null)).toBe(false);
      expect(isNumeric(undefined)).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
      expect(isPlainObject(Object.create(null))).toBe(true);
    });

    it('should return false for non-plain objects', () => {
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject('string')).toBe(false);
    });
  });

  describe('isEmptyObject', () => {
    it('should return true for empty objects', () => {
      expect(isEmptyObject({})).toBe(true);
      expect(isEmptyObject([])).toBe(true);
    });

    it('should return false for non-empty objects', () => {
      expect(isEmptyObject({ a: 1 })).toBe(false);
      expect(isEmptyObject([1, 2])).toBe(false);
    });

    it('should return true for null/undefined', () => {
      expect(isEmptyObject(null)).toBe(true);
      expect(isEmptyObject(undefined)).toBe(true);
    });
  });

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(isArray({})).toBe(false);
      expect(isArray('string')).toBe(false);
      expect(isArray(null)).toBe(false);
    });
  });

  describe('isArraylike', () => {
    it('should return true for arrays', () => {
      expect(isArraylike([1, 2, 3])).toBe(true);
    });

    it('should return true for array-like objects', () => {
      expect(isArraylike({ 0: 'a', 1: 'b', length: 2 })).toBe(true);
    });

    it('should return true for NodeList', () => {
      const nodeList = document.querySelectorAll('body');
      expect(isArraylike(nodeList)).toBe(true);
    });

    it('should return false for strings', () => {
      expect(isArraylike('string')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isArraylike(null)).toBe(false);
      expect(isArraylike(undefined)).toBe(false);
    });

    it('should return false for functions', () => {
      expect(isArraylike(() => {})).toBe(false);
    });
  });

  describe('isNaturalElement', () => {
    it('should return false for regular arrays', () => {
      expect(isNaturalElement([])).toBe(false);
    });

    it('should return true for objects with _isNaturalElement marker', () => {
      const fakeNaturalElement = { length: 1, _isNaturalElement: true };
      expect(isNaturalElement(fakeNaturalElement)).toBe(true);
    });

    it('should return true for objects with jquery marker (backwards compat)', () => {
      const fakeJQuerySet = { length: 1, jquery: '3.0.0' };
      expect(isNaturalElement(fakeJQuerySet)).toBe(true);
    });
  });

  describe('isElement', () => {
    it('should return true for DOM elements', () => {
      const div = document.createElement('div');
      expect(isElement(div)).toBe(true);
    });

    it('should return false for non-elements', () => {
      expect(isElement(null)).toBe(false);
      expect(isElement({})).toBe(false);
      expect(isElement('div')).toBe(false);
    });
  });

  describe('isFunction', () => {
    it('should return true for functions', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function () {})).toBe(true);
    });

    it('should return true for async functions', () => {
      expect(isFunction(async () => {})).toBe(true);
    });

    it('should return false for non-functions', () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction('string')).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('should return true for booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    it('should return false for non-booleans', () => {
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean('')).toBe(false);
    });
  });

  describe('isNullish', () => {
    it('should return true for null/undefined', () => {
      expect(isNullish(null)).toBe(true);
      expect(isNullish(undefined)).toBe(true);
    });

    it('should return false for other falsy values', () => {
      expect(isNullish(0)).toBe(false);
      expect(isNullish('')).toBe(false);
      expect(isNullish(false)).toBe(false);
    });
  });

  describe('isDate', () => {
    it('should return true for Date objects', () => {
      expect(isDate(new Date())).toBe(true);
    });

    it('should return false for non-dates', () => {
      expect(isDate('2024-01-01')).toBe(false);
      expect(isDate(Date.now())).toBe(false);
    });
  });

  describe('isRegExp', () => {
    it('should return true for RegExp objects', () => {
      expect(isRegExp(/test/)).toBe(true);
      expect(isRegExp(new RegExp('test'))).toBe(true);
    });

    it('should return false for non-regexes', () => {
      expect(isRegExp('test')).toBe(false);
    });
  });

  describe('toSelector', () => {
    it('should return string as-is', () => {
      expect(toSelector('#myId')).toBe('#myId');
    });

    it('should convert element to selector string', () => {
      const div = document.createElement('div');
      div.id = 'testId';
      div.className = 'class1 class2';
      expect(toSelector(div)).toBe('div#testId.class1.class2');
    });

    it('should handle arrays', () => {
      expect(toSelector([1, 2, 3])).toBe('...[number](3)');
      expect(toSelector([])).toBe('...[](0)');
    });

    it('should convert other values to string', () => {
      expect(toSelector(123)).toBe('123');
      expect(toSelector(null)).toBe('null');
    });
  });

  describe('typeUtils namespace object', () => {
    it('should export all functions', () => {
      expect(typeUtils.type).toBe(type);
      expect(typeUtils.isString).toBe(isString);
      expect(typeUtils.isNumeric).toBe(isNumeric);
      expect(typeUtils.isPlainObject).toBe(isPlainObject);
      expect(typeUtils.isEmptyObject).toBe(isEmptyObject);
      expect(typeUtils.isArray).toBe(isArray);
      expect(typeUtils.isArraylike).toBe(isArraylike);
      expect(typeUtils.isNaturalElement).toBe(isNaturalElement);
      expect(typeUtils.isElement).toBe(isElement);
      expect(typeUtils.isFunction).toBe(isFunction);
      expect(typeUtils.isBoolean).toBe(isBoolean);
      expect(typeUtils.isNullish).toBe(isNullish);
      expect(typeUtils.isDate).toBe(isDate);
      expect(typeUtils.isRegExp).toBe(isRegExp);
      expect(typeUtils.toSelector).toBe(toSelector);
    });
  });
});

