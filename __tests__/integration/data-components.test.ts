/**
 * Integration tests for Data components (Formatter, Validator)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { resetConfig } from '@natural-js/core';
import { Formatter, Validator, data } from '@natural-js/data';

describe('Formatter Integration', () => {
  beforeEach(() => {
    resetConfig();
  });

  describe('Number Formatting', () => {
    it('should format numbers with commas', () => {
      const inputData = [
        { amount: '1234567' },
        { amount: '9876543210' },
      ];

      const formatter = new Formatter(inputData, {
        amount: [['commas']],
      });

      const result = formatter.format();

      expect(result[0]?.amount).toBe('1,234,567');
      expect(result[1]?.amount).toBe('9,876,543,210');
    });

    it('should handle negative numbers with commas', () => {
      const inputData = [{ amount: '-1234567.89' }];

      const formatter = new Formatter(inputData, {
        amount: [['commas']],
      });

      const result = formatter.format();
      expect(result[0]?.amount).toBe('-1,234,567.89');
    });
  });

  describe('Date Formatting', () => {
    it('should format 8-digit date string', () => {
      const inputData = [{ date: '20231215' }];

      const formatter = new Formatter(inputData, {
        date: [['date', 8]], // 8자리 날짜 포맷
      });

      const result = formatter.format();
      expect(result[0]?.date).toBe('2023-12-15');
    });

    it('should format 6-digit date string (year-month)', () => {
      const inputData = [{ date: '202312' }];

      const formatter = new Formatter(inputData, {
        date: [['date', 6]], // 6자리 날짜 포맷
      });

      const result = formatter.format();
      expect(result[0]?.date).toBe('2023-12');
    });
  });

  describe('Phone Formatting', () => {
    it('should format mobile phone numbers', () => {
      const inputData = [{ phone: '01012345678' }];

      const formatter = new Formatter(inputData, {
        phone: [['phone']],
      });

      const result = formatter.format();
      expect(result[0]?.phone).toBe('010-1234-5678');
    });

    it('should format landline phone numbers', () => {
      const inputData = [{ phone: '0212345678' }];

      const formatter = new Formatter(inputData, {
        phone: [['phone']],
      });

      const result = formatter.format();
      expect(result[0]?.phone).toBe('02-1234-5678');
    });
  });

  describe('RRN Formatting', () => {
    it('should format Korean resident registration number', () => {
      const inputData = [{ rrn: '1234561234567' }];

      const formatter = new Formatter(inputData, {
        rrn: [['rrn']],
      });

      const result = formatter.format();
      expect(result[0]?.rrn).toBe('123456-1234567');
    });

    it('should mask RRN with specified count', () => {
      const inputData = [{ rrn: '1234561234567' }];

      const formatter = new Formatter(inputData, {
        rrn: [['rrn', 6]], // 마지막 6자리 마스킹
      });

      const result = formatter.format();
      expect(result[0]?.rrn).toBe('123456-1******');
    });
  });

  describe('Case Formatting', () => {
    it('should convert to uppercase', () => {
      const inputData = [{ code: 'abc123' }];

      const formatter = new Formatter(inputData, {
        code: [['upper']],
      });

      const result = formatter.format();
      expect(result[0]?.code).toBe('ABC123');
    });

    it('should convert to lowercase', () => {
      const inputData = [{ code: 'ABC123' }];

      const formatter = new Formatter(inputData, {
        code: [['lower']],
      });

      const result = formatter.format();
      expect(result[0]?.code).toBe('abc123');
    });
  });

  describe('Multiple Fields', () => {
    it('should format multiple fields at once', () => {
      const inputData = [{
        phone: '01012345678',
        amount: '1000000',
        date: '20231225',
      }];

      const formatter = new Formatter(inputData, {
        phone: [['phone']],
        amount: [['commas']],
        date: [['date', 8]],
      });

      const result = formatter.format();
      expect(result[0]?.phone).toBe('010-1234-5678');
      expect(result[0]?.amount).toBe('1,000,000');
      expect(result[0]?.date).toBe('2023-12-25');
    });
  });
});

describe('Validator Integration', () => {
  beforeEach(() => {
    resetConfig();
  });

  describe('Required Validation', () => {
    it('should fail for empty required field', () => {
      const inputData = [{ name: '' }];

      const validator = new Validator(inputData, {
        name: [['required']],
      });

      const results = validator.validate();
      // Results structure: [{ field: ValidationResult[] }]
      expect(Validator.isValid(results)).toBe(false);
    });

    it('should pass for non-empty required field', () => {
      const inputData = [{ name: 'John Doe' }];

      const validator = new Validator(inputData, {
        name: [['required']],
      });

      const results = validator.validate();
      expect(Validator.isValid(results)).toBe(true);
    });
  });

  describe('Email Validation', () => {
    it('should fail for invalid email format', () => {
      const inputData = [{ email: 'invalid-email' }];

      const validator = new Validator(inputData, {
        email: [['email']],
      });

      const results = validator.validate();
      expect(Validator.isValid(results)).toBe(false);
    });

    it('should pass for valid email format', () => {
      const inputData = [{ email: 'test@example.com' }];

      const validator = new Validator(inputData, {
        email: [['email']],
      });

      const results = validator.validate();
      expect(Validator.isValid(results)).toBe(true);
    });
  });

  describe('Integer Validation', () => {
    it('should pass for valid integer string', () => {
      const inputData = [{ age: '25' }];

      const validator = new Validator(inputData, {
        age: [['integer']],
      });

      const results = validator.validate();
      expect(Validator.isValid(results)).toBe(true);
    });

    it('should fail for non-integer string', () => {
      const inputData = [{ age: 'abc' }];

      const validator = new Validator(inputData, {
        age: [['integer']],
      });

      const results = validator.validate();
      expect(Validator.isValid(results)).toBe(false);
    });
  });

  describe('Multiple Validations', () => {
    it('should validate multiple fields', () => {
      const inputData = [{
        name: 'John',
        email: 'john@example.com',
        age: '30',
      }];

      const validator = new Validator(inputData, {
        name: [['required']],
        email: [['required'], ['email']],
        age: [['integer']],
      });

      const results = validator.validate();
      expect(Validator.isValid(results)).toBe(true);
    });

    it('should collect all errors for invalid data', () => {
      const inputData = [{
        name: '',
        email: 'invalid',
        age: 'abc',
      }];

      const validator = new Validator(inputData, {
        name: [['required']],
        email: [['email']],
        age: [['integer']],
      });

      const results = validator.validate();
      expect(Validator.isValid(results)).toBe(false);
      const errors = Validator.getErrors(results);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple Rows', () => {
    it('should validate each row independently', () => {
      const inputData = [
        { email: 'valid@test.com' },
        { email: 'invalid' },
        { email: 'another@valid.org' },
      ];

      const validator = new Validator(inputData, {
        email: [['email']],
      });

      const results = validator.validate();
      // Check individual rows
      expect(results.length).toBe(3);
    });
  });
});

describe('Data Utilities Integration', () => {
  describe('filter', () => {
    it('should filter data by predicate', () => {
      const inputData = [
        { id: 1, status: 'active' },
        { id: 2, status: 'inactive' },
        { id: 3, status: 'active' },
      ];

      const filtered = data.filter(inputData, (item) => item.status === 'active');

      expect(filtered.length).toBe(2);
      expect(filtered[0]?.id).toBe(1);
      expect(filtered[1]?.id).toBe(3);
    });
  });

  describe('sort', () => {
    it('should sort data ascending', () => {
      const inputData = [
        { name: 'Charlie' },
        { name: 'Alice' },
        { name: 'Bob' },
      ];

      const sorted = data.sort(inputData, 'name', 'asc');

      expect(sorted[0]?.name).toBe('Alice');
      expect(sorted[1]?.name).toBe('Bob');
      expect(sorted[2]?.name).toBe('Charlie');
    });

    it('should sort data descending', () => {
      const inputData = [
        { age: 25 },
        { age: 35 },
        { age: 30 },
      ];

      const sorted = data.sort(inputData, 'age', 'desc');

      expect(sorted[0]?.age).toBe(35);
      expect(sorted[1]?.age).toBe(30);
      expect(sorted[2]?.age).toBe(25);
    });
  });

  describe('groupBy', () => {
    it('should group data by key', () => {
      const inputData = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];

      const grouped = data.groupBy(inputData, 'category');

      expect(grouped['A']?.length).toBe(2);
      expect(grouped['B']?.length).toBe(1);
    });
  });

  describe('aggregation', () => {
    it('should calculate sum', () => {
      const inputData = [
        { amount: 100 },
        { amount: 200 },
        { amount: 300 },
      ];

      const total = data.sum(inputData, 'amount');
      expect(total).toBe(600);
    });

    it('should calculate average', () => {
      const inputData = [
        { score: 80 },
        { score: 90 },
        { score: 100 },
      ];

      const avg = data.avg(inputData, 'score');
      expect(avg).toBe(90);
    });

    it('should find min and max', () => {
      const inputData = [
        { value: 10 },
        { value: 5 },
        { value: 20 },
      ];

      expect(data.min(inputData, 'value')).toBe(5);
      expect(data.max(inputData, 'value')).toBe(20);
    });
  });

  describe('find', () => {
    it('should find item by predicate', () => {
      const inputData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];

      const found = data.find(inputData, (item) => item.id === 2);
      expect(found?.name).toBe('Item 2');
    });

    it('should return undefined when not found', () => {
      const inputData = [{ id: 1 }];

      const found = data.find(inputData, (item) => item.id === 999);
      expect(found).toBeUndefined();
    });
  });

  describe('distinct', () => {
    it('should get distinct values', () => {
      const inputData = [
        { category: 'A' },
        { category: 'B' },
        { category: 'A' },
        { category: 'C' },
        { category: 'B' },
      ];

      const distinct = data.distinct(inputData, 'category');
      expect(distinct).toEqual(['A', 'B', 'C']);
    });
  });

  describe('paginate', () => {
    it('should paginate data', () => {
      const inputData = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

      const page1 = data.paginate(inputData, 1, 10);
      const page2 = data.paginate(inputData, 2, 10);
      const page3 = data.paginate(inputData, 3, 10);

      expect(page1.data.length).toBe(10);
      expect(page1.data[0]?.id).toBe(1);
      expect(page2.data.length).toBe(10);
      expect(page2.data[0]?.id).toBe(11);
      expect(page3.data.length).toBe(5);
      expect(page3.data[0]?.id).toBe(21);
    });
  });
});
