import { describe, it, expect } from 'vitest';
import {
  mapFromKeys,
  mergeJsonArray,
  formatJson,
  safeParse,
  deepClone,
  deepMerge,
  pick,
  omit,
  deepEqual,
  json,
} from './index';

describe('JSON Utilities', () => {
  describe('mapFromKeys', () => {
    it('should extract specified keys from object', () => {
      const obj = { id: 1, name: 'John', age: 30 };
      expect(mapFromKeys(obj, 'id', 'name')).toEqual({ id: 1, name: 'John' });
    });

    it('should extract specified keys from array of objects', () => {
      const arr = [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 },
      ];
      expect(mapFromKeys(arr, 'id', 'name')).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ]);
    });

    it('should return original object/array when no keys specified', () => {
      const obj = { id: 1, name: 'John' };
      expect(mapFromKeys(obj)).toBe(obj);
    });

    it('should handle empty array', () => {
      expect(mapFromKeys([], 'id')).toEqual([]);
    });

    it('should ignore undefined keys', () => {
      const obj = { id: 1, name: 'John' };
      expect(mapFromKeys(obj, 'id', 'nonexistent' as keyof typeof obj)).toEqual({ id: 1 });
    });
  });

  describe('mergeJsonArray', () => {
    it('should merge arrays avoiding duplicates by key', () => {
      const arr1 = [{ id: 1, name: 'John' }];
      const arr2 = [
        { id: 2, name: 'Jane' },
        { id: 1, name: 'John Doe' },
      ];
      const result = mergeJsonArray([...arr1], arr2, 'id');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, name: 'John' });
      expect(result[1]).toEqual({ id: 2, name: 'Jane' });
    });

    it('should add all items when no duplicates', () => {
      const arr1 = [{ id: 1 }];
      const arr2 = [{ id: 2 }, { id: 3 }];
      const result = mergeJsonArray([...arr1], arr2, 'id');
      expect(result).toHaveLength(3);
    });

    it('should handle empty first array', () => {
      const arr1: { id: number }[] = [];
      const arr2 = [{ id: 1 }, { id: 2 }];
      const result = mergeJsonArray(arr1, arr2, 'id');
      expect(result).toHaveLength(2);
    });

    it('should handle empty second array', () => {
      const arr1 = [{ id: 1 }];
      const arr2: { id: number }[] = [];
      const result = mergeJsonArray([...arr1], arr2, 'id');
      expect(result).toHaveLength(1);
    });
  });

  describe('formatJson', () => {
    it('should format JSON object with default indent', () => {
      const obj = { name: 'John', age: 30 };
      const result = formatJson(obj);
      expect(result).toContain('\n');
      expect(result).toContain('    '); // 4 spaces
    });

    it('should format JSON object with custom indent', () => {
      const obj = { name: 'John' };
      const result = formatJson(obj, 2);
      expect(result).toContain('  "name"');
    });

    it('should parse and format JSON string', () => {
      const jsonStr = '{"name":"John"}';
      const result = formatJson(jsonStr, 2);
      expect(result).toContain('\n');
    });

    it('should return null for empty object', () => {
      expect(formatJson({})).toBeNull();
    });

    it('should return null for null/undefined', () => {
      expect(formatJson(null as unknown as object)).toBeNull();
    });

    it('should return null for invalid JSON string', () => {
      expect(formatJson('invalid json')).toBeNull();
    });
  });

  describe('safeParse', () => {
    it('should parse valid JSON', () => {
      expect(safeParse('{"name":"John"}')).toEqual({ name: 'John' });
    });

    it('should return default value for invalid JSON', () => {
      expect(safeParse('invalid', {})).toEqual({});
    });

    it('should return undefined for invalid JSON without default', () => {
      expect(safeParse('invalid')).toBeUndefined();
    });

    it('should parse JSON arrays', () => {
      expect(safeParse('[1, 2, 3]')).toEqual([1, 2, 3]);
    });

    it('should parse primitive values', () => {
      expect(safeParse('"hello"')).toBe('hello');
      expect(safeParse('123')).toBe(123);
      expect(safeParse('true')).toBe(true);
      expect(safeParse('null')).toBeNull();
    });
  });

  describe('deepClone', () => {
    it('should create a deep copy', () => {
      const original = { nested: { value: 1 } };
      const clone = deepClone(original);
      clone.nested.value = 2;
      expect(original.nested.value).toBe(1);
    });

    it('should clone arrays', () => {
      const original = [1, [2, 3]];
      const clone = deepClone(original);
      (clone[1] as number[])[0] = 5;
      expect((original[1] as number[])[0]).toBe(2);
    });

    it('should handle null and primitives', () => {
      expect(deepClone(null)).toBeNull();
      expect(deepClone(123)).toBe(123);
      expect(deepClone('hello')).toBe('hello');
    });
  });

  describe('deepMerge', () => {
    it('should deeply merge objects', () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { b: { d: 3 }, e: 4 };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });

    it('should not modify original objects', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      const result = deepMerge(target, source);
      expect(target).toEqual({ a: 1 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should handle multiple sources', () => {
      const target = { a: 1 };
      const source1 = { b: 2 };
      const source2 = { c: 3 };
      const result = deepMerge(target, source1, source2);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should override with later sources', () => {
      const target = { a: 1 };
      const source1 = { a: 2 };
      const source2 = { a: 3 };
      const result = deepMerge(target, source1, source2);
      expect(result.a).toBe(3);
    });

    it('should handle null/undefined sources', () => {
      const target = { a: 1 };
      const result = deepMerge(target, null as unknown as Partial<typeof target>, undefined);
      expect(result).toEqual({ a: 1 });
    });
  });

  describe('pick', () => {
    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('should handle non-existent keys', () => {
      const obj = { a: 1 };
      expect(pick(obj, ['a', 'b' as keyof typeof obj])).toEqual({ a: 1 });
    });

    it('should handle empty keys array', () => {
      const obj = { a: 1 };
      expect(pick(obj, [])).toEqual({});
    });
  });

  describe('omit', () => {
    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });

    it('should handle non-existent keys', () => {
      const obj = { a: 1, b: 2 };
      expect(omit(obj, ['c' as keyof typeof obj])).toEqual({ a: 1, b: 2 });
    });

    it('should handle empty keys array', () => {
      const obj = { a: 1 };
      expect(omit(obj, [])).toEqual({ a: 1 });
    });

    it('should not modify original object', () => {
      const obj = { a: 1, b: 2 };
      omit(obj, ['b']);
      expect(obj).toEqual({ a: 1, b: 2 });
    });
  });

  describe('deepEqual', () => {
    it('should return true for equal objects', () => {
      expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    });

    it('should return false for different objects', () => {
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
    });

    it('should handle arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('should handle primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('a', 'a')).toBe(true);
      expect(deepEqual(1, 2)).toBe(false);
    });

    it('should handle null', () => {
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(null, {})).toBe(false);
    });
  });

  describe('json namespace object', () => {
    it('should export all functions as properties', () => {
      expect(json.mapFromKeys).toBe(mapFromKeys);
      expect(json.mergeJsonArray).toBe(mergeJsonArray);
      expect(json.formatJson).toBe(formatJson);
      expect(json.safeParse).toBe(safeParse);
      expect(json.deepClone).toBe(deepClone);
      expect(json.deepMerge).toBe(deepMerge);
      expect(json.pick).toBe(pick);
      expect(json.omit).toBe(omit);
      expect(json.deepEqual).toBe(deepEqual);
    });
  });
});

