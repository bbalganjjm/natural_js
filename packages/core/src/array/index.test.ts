import { describe, it, expect } from 'vitest';
import {
  deduplicate,
  uniqueArray,
  intersection,
  difference,
  flatten,
  groupBy,
  chunk,
  array,
} from './index';

describe('Array Utilities', () => {
  describe('deduplicate', () => {
    it('should remove duplicate primitives', () => {
      expect(deduplicate([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(deduplicate(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should remove duplicate objects by key', () => {
      const arr = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 1, name: 'John Doe' }];
      expect(deduplicate(arr, 'id')).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ]);
    });

    it('should handle empty array', () => {
      expect(deduplicate([])).toEqual([]);
    });

    it('should handle array with no duplicates', () => {
      expect(deduplicate([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should handle objects without key (reference comparison)', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      // Same reference
      expect(deduplicate([obj1, obj1, obj2])).toEqual([obj1, obj2]);
    });
  });

  describe('uniqueArray', () => {
    it('should remove duplicates using Set', () => {
      expect(uniqueArray([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(uniqueArray(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });

    it('should handle empty array', () => {
      expect(uniqueArray([])).toEqual([]);
    });

    it('should preserve order', () => {
      expect(uniqueArray([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
    });
  });

  describe('intersection', () => {
    it('should find common elements', () => {
      expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
    });

    it('should handle no common elements', () => {
      expect(intersection([1, 2], [3, 4])).toEqual([]);
    });

    it('should handle empty arrays', () => {
      expect(intersection([], [1, 2])).toEqual([]);
      expect(intersection([1, 2], [])).toEqual([]);
    });

    it('should handle identical arrays', () => {
      expect(intersection([1, 2, 3], [1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('difference', () => {
    it('should find elements in first array not in second', () => {
      expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1]);
    });

    it('should handle no difference', () => {
      expect(difference([1, 2], [1, 2, 3])).toEqual([]);
    });

    it('should handle empty arrays', () => {
      expect(difference([], [1, 2])).toEqual([]);
      expect(difference([1, 2], [])).toEqual([1, 2]);
    });

    it('should return all elements when no overlap', () => {
      expect(difference([1, 2], [3, 4])).toEqual([1, 2]);
    });
  });

  describe('flatten', () => {
    it('should flatten array by one level by default', () => {
      expect(flatten([[1, 2], [3, [4, 5]]])).toEqual([1, 2, 3, [4, 5]]);
    });

    it('should flatten array to specified depth', () => {
      expect(flatten([[1, 2], [3, [4, 5]]], 2)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle already flat array', () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should handle empty array', () => {
      expect(flatten([])).toEqual([]);
    });

    it('should handle deeply nested array', () => {
      expect(flatten([1, [2, [3, [4]]]], Infinity)).toEqual([1, 2, 3, 4]);
    });
  });

  describe('groupBy', () => {
    it('should group items by key', () => {
      const items = [
        { type: 'fruit', name: 'apple' },
        { type: 'fruit', name: 'banana' },
        { type: 'vegetable', name: 'carrot' },
      ];
      const result = groupBy(items, 'type');
      expect(result).toHaveProperty('fruit');
      expect(result).toHaveProperty('vegetable');
      expect(result['fruit']).toHaveLength(2);
      expect(result['vegetable']).toHaveLength(1);
    });

    it('should handle empty array', () => {
      expect(groupBy([], 'key')).toEqual({});
    });

    it('should handle single group', () => {
      const items = [{ type: 'fruit', name: 'apple' }, { type: 'fruit', name: 'banana' }];
      const result = groupBy(items, 'type');
      expect(Object.keys(result)).toHaveLength(1);
      expect(result['fruit']).toHaveLength(2);
    });
  });

  describe('chunk', () => {
    it('should split array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle chunk size larger than array', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    it('should handle empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });

    it('should handle chunk size of 1', () => {
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });

    it('should handle exact division', () => {
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    });
  });

  describe('array namespace object', () => {
    it('should export all functions as properties', () => {
      expect(array.deduplicate).toBe(deduplicate);
      expect(array.uniqueArray).toBe(uniqueArray);
      expect(array.intersection).toBe(intersection);
      expect(array.difference).toBe(difference);
      expect(array.flatten).toBe(flatten);
      expect(array.groupBy).toBe(groupBy);
      expect(array.chunk).toBe(chunk);
    });
  });
});

