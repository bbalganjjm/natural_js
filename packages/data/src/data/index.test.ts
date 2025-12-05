/**
 * Tests for the data utility functions.
 */

import { describe, it, expect } from 'vitest';
import {
  filter,
  sort,
  groupBy,
  find,
  findIndex,
  some,
  every,
  sum,
  avg,
  min,
  max,
  count,
  distinct,
  pluck,
  first,
  last,
  skip,
  take,
  paginate,
  data,
} from './index';

describe('filter', () => {
  const testData = [
    { id: 1, name: 'John', age: 25, department: 'Sales' },
    { id: 2, name: 'Jane', age: 30, department: 'HR' },
    { id: 3, name: 'Bob', age: 35, department: 'Sales' },
    { id: 4, name: 'Alice', age: 28, department: 'Engineering' },
  ];

  it('should filter with function condition', () => {
    const result = filter(testData, (item) => item.age > 28);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Jane');
    expect(result[1].name).toBe('Bob');
  });

  it('should filter with string condition', () => {
    const result = filter(testData, 'age>28');
    expect(result).toHaveLength(2);
  });

  it('should handle && in string condition', () => {
    const result = filter(testData, 'age>25&&department==="Sales"');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('should handle || in string condition', () => {
    const result = filter(testData, 'department==="HR"||department==="Engineering"');
    expect(result).toHaveLength(2);
  });

  it('should return empty array for non-array input', () => {
    expect(filter(null as any, (item) => true)).toEqual([]);
  });

  it('should return original array if no condition', () => {
    const result = filter(testData, '');
    expect(result).toHaveLength(4);
  });
});

describe('sort', () => {
  const testData = [
    { id: 3, name: 'Charlie', age: 35 },
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
  ];

  it('should sort by key ascending', () => {
    const data = [...testData];
    const result = sort(data, 'name');
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('Charlie');
  });

  it('should sort by key descending', () => {
    const data = [...testData];
    const result = sort(data, 'age', 'desc');
    expect(result[0].age).toBe(35);
    expect(result[1].age).toBe(30);
    expect(result[2].age).toBe(25);
  });

  it('should sort with boolean direction (true = desc)', () => {
    const data = [...testData];
    const result = sort(data, 'id', true);
    expect(result[0].id).toBe(3);
  });

  it('should sort with custom comparator', () => {
    const data = [...testData];
    const result = sort(data, (a, b) => b.age - a.age);
    expect(result[0].age).toBe(35);
  });

  it('should handle numeric strings', () => {
    const data = [
      { id: 1, value: '100' },
      { id: 2, value: '20' },
      { id: 3, value: '3' },
    ];
    const result = sort([...data], 'value');
    expect(result[0].value).toBe('3');
    expect(result[1].value).toBe('20');
    expect(result[2].value).toBe('100');
  });

  it('should handle null values', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: null },
      { id: 3, name: 'Bob' },
    ];
    const result = sort([...data], 'name');
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe(null);
  });

  it('should return new array when copy option is true', () => {
    const original = [...testData];
    const result = sort(original, 'id', 'asc', { copy: true });
    expect(result).not.toBe(original);
  });
});

describe('groupBy', () => {
  const testData = [
    { id: 1, name: 'John', department: 'Sales' },
    { id: 2, name: 'Jane', department: 'HR' },
    { id: 3, name: 'Bob', department: 'Sales' },
  ];

  it('should group by key', () => {
    const result = groupBy(testData, 'department');
    expect(Object.keys(result)).toHaveLength(2);
    expect(result['Sales']).toHaveLength(2);
    expect(result['HR']).toHaveLength(1);
  });

  it('should handle undefined values', () => {
    const data = [
      { id: 1, category: 'A' },
      { id: 2 },
      { id: 3, category: 'A' },
    ];
    const result = groupBy(data, 'category');
    expect(result['A']).toHaveLength(2);
    expect(result['undefined']).toHaveLength(1);
  });
});

describe('find', () => {
  const testData = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Bob' },
  ];

  it('should find first matching item', () => {
    const result = find(testData, (item) => item.name.startsWith('J'));
    expect(result?.name).toBe('John');
  });

  it('should return undefined if not found', () => {
    const result = find(testData, (item) => item.name === 'Unknown');
    expect(result).toBeUndefined();
  });
});

describe('findIndex', () => {
  const testData = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Bob' },
  ];

  it('should find index of first matching item', () => {
    const result = findIndex(testData, (item) => item.name === 'Jane');
    expect(result).toBe(1);
  });

  it('should return -1 if not found', () => {
    const result = findIndex(testData, (item) => item.name === 'Unknown');
    expect(result).toBe(-1);
  });

  it('should work with string condition', () => {
    const result = findIndex(testData, 'id===2');
    expect(result).toBe(1);
  });
});

describe('some', () => {
  const testData = [
    { id: 1, active: true },
    { id: 2, active: false },
    { id: 3, active: false },
  ];

  it('should return true if any match', () => {
    expect(some(testData, (item) => item.active)).toBe(true);
  });

  it('should return false if none match', () => {
    expect(some(testData, (item) => item.id > 10)).toBe(false);
  });
});

describe('every', () => {
  const testData = [
    { id: 1, active: true },
    { id: 2, active: true },
    { id: 3, active: true },
  ];

  it('should return true if all match', () => {
    expect(every(testData, (item) => item.active)).toBe(true);
  });

  it('should return false if any does not match', () => {
    const data = [...testData, { id: 4, active: false }];
    expect(every(data, (item) => item.active)).toBe(false);
  });
});

describe('sum', () => {
  const testData = [
    { id: 1, amount: 100 },
    { id: 2, amount: 200 },
    { id: 3, amount: 300 },
  ];

  it('should sum numeric values', () => {
    expect(sum(testData, 'amount')).toBe(600);
  });

  it('should handle non-numeric values', () => {
    const data = [
      { id: 1, amount: 100 },
      { id: 2, amount: 'invalid' },
      { id: 3, amount: 300 },
    ];
    expect(sum(data, 'amount')).toBe(400);
  });

  it('should return 0 for empty array', () => {
    expect(sum([], 'amount')).toBe(0);
  });
});

describe('avg', () => {
  const testData = [
    { id: 1, score: 80 },
    { id: 2, score: 90 },
    { id: 3, score: 100 },
  ];

  it('should calculate average', () => {
    expect(avg(testData, 'score')).toBe(90);
  });

  it('should return NaN for empty array', () => {
    expect(avg([], 'score')).toBeNaN();
  });
});

describe('min', () => {
  const testData = [
    { id: 1, value: 50 },
    { id: 2, value: 30 },
    { id: 3, value: 70 },
  ];

  it('should find minimum value', () => {
    expect(min(testData, 'value')).toBe(30);
  });

  it('should return undefined for empty array', () => {
    expect(min([], 'value')).toBeUndefined();
  });
});

describe('max', () => {
  const testData = [
    { id: 1, value: 50 },
    { id: 2, value: 30 },
    { id: 3, value: 70 },
  ];

  it('should find maximum value', () => {
    expect(max(testData, 'value')).toBe(70);
  });

  it('should return undefined for empty array', () => {
    expect(max([], 'value')).toBeUndefined();
  });
});

describe('count', () => {
  const testData = [
    { id: 1, active: true },
    { id: 2, active: false },
    { id: 3, active: true },
  ];

  it('should count all items without condition', () => {
    expect(count(testData)).toBe(3);
  });

  it('should count matching items with condition', () => {
    expect(count(testData, (item) => item.active)).toBe(2);
  });
});

describe('distinct', () => {
  const testData = [
    { id: 1, category: 'A' },
    { id: 2, category: 'B' },
    { id: 3, category: 'A' },
    { id: 4, category: 'C' },
  ];

  it('should get unique values', () => {
    const result = distinct(testData, 'category');
    expect(result).toEqual(['A', 'B', 'C']);
  });
});

describe('pluck', () => {
  const testData = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Bob' },
  ];

  it('should extract values', () => {
    const result = pluck(testData, 'name');
    expect(result).toEqual(['John', 'Jane', 'Bob']);
  });
});

describe('first', () => {
  const testData = [{ id: 1 }, { id: 2 }, { id: 3 }];

  it('should get first item', () => {
    expect(first(testData)).toEqual([{ id: 1 }]);
  });

  it('should get first n items', () => {
    expect(first(testData, 2)).toEqual([{ id: 1 }, { id: 2 }]);
  });
});

describe('last', () => {
  const testData = [{ id: 1 }, { id: 2 }, { id: 3 }];

  it('should get last item', () => {
    expect(last(testData)).toEqual([{ id: 3 }]);
  });

  it('should get last n items', () => {
    expect(last(testData, 2)).toEqual([{ id: 2 }, { id: 3 }]);
  });
});

describe('skip', () => {
  const testData = [{ id: 1 }, { id: 2 }, { id: 3 }];

  it('should skip first n items', () => {
    expect(skip(testData, 1)).toEqual([{ id: 2 }, { id: 3 }]);
  });
});

describe('take', () => {
  const testData = [{ id: 1 }, { id: 2 }, { id: 3 }];

  it('should take first n items', () => {
    expect(take(testData, 2)).toEqual([{ id: 1 }, { id: 2 }]);
  });
});

describe('paginate', () => {
  const testData = [
    { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 },
    { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 },
  ];

  it('should paginate correctly', () => {
    const result = paginate(testData, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.data[0].id).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(3);
    expect(result.total).toBe(10);
    expect(result.totalPages).toBe(4);
  });

  it('should handle page 2', () => {
    const result = paginate(testData, 2, 3);
    expect(result.data[0].id).toBe(4);
    expect(result.page).toBe(2);
  });

  it('should handle last page with fewer items', () => {
    const result = paginate(testData, 4, 3);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(10);
  });

  it('should clamp invalid page numbers', () => {
    expect(paginate(testData, 0, 3).page).toBe(1);
    expect(paginate(testData, 100, 3).page).toBe(4);
  });
});

describe('data namespace', () => {
  it('should export all functions', () => {
    expect(data.filter).toBe(filter);
    expect(data.sort).toBe(sort);
    expect(data.groupBy).toBe(groupBy);
    expect(data.find).toBe(find);
    expect(data.findIndex).toBe(findIndex);
    expect(data.some).toBe(some);
    expect(data.every).toBe(every);
    expect(data.sum).toBe(sum);
    expect(data.avg).toBe(avg);
    expect(data.min).toBe(min);
    expect(data.max).toBe(max);
    expect(data.count).toBe(count);
    expect(data.distinct).toBe(distinct);
    expect(data.pluck).toBe(pluck);
    expect(data.first).toBe(first);
    expect(data.last).toBe(last);
    expect(data.skip).toBe(skip);
    expect(data.take).toBe(take);
    expect(data.paginate).toBe(paginate);
  });
});

describe('Edge cases', () => {
  it('should handle empty arrays', () => {
    expect(filter([], (item) => true)).toEqual([]);
    expect(sort([], 'id')).toEqual([]);
    expect(groupBy([], 'id')).toEqual({});
    expect(find([], (item) => true)).toBeUndefined();
    expect(findIndex([], (item) => true)).toBe(-1);
    expect(some([], (item) => true)).toBe(false);
    expect(every([], (item) => true)).toBe(true);
  });

  it('should handle non-array inputs', () => {
    expect(filter(null as any, (item) => true)).toEqual([]);
    expect(sort(undefined as any, 'id')).toEqual([]);
    expect(groupBy(123 as any, 'id')).toEqual({});
  });
});

