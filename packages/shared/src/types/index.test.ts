import { describe, expect, it, expectTypeOf } from 'vitest';
import type {
  Primitive,
  JSONValue,
  JSONObject,
  Selector,
  EventHandler,
  Callback,
  AsyncCallback,
  DeepPartial,
  DeepRequired,
  Nullable,
  Maybe,
  ObjectType,
  BrowserType,
  Locale,
  MessageResource,
  RuleDefinition,
  ValidationResult,
  ValidationError,
  MaskInstance,
  MaskProcessingMode,
  DateInfo,
  EventsObject,
  NaturalEventName,
  ComponentOptions,
  HttpMethod,
  HttpRequestOptions,
  RowStatus,
  DataRow,
} from './index';

/**
 * Type-level tests to ensure type definitions are correct.
 * These tests verify that types compile correctly and have expected shapes.
 */

describe('Type definitions', () => {
  describe('Primitive types', () => {
    it('should accept valid primitive values', () => {
      const str: Primitive = 'hello';
      const num: Primitive = 42;
      const bool: Primitive = true;
      const nul: Primitive = null;

      expect(str).toBe('hello');
      expect(num).toBe(42);
      expect(bool).toBe(true);
      expect(nul).toBeNull();
    });
  });

  describe('JSONValue and JSONObject', () => {
    it('should accept valid JSON structures', () => {
      const jsonObj: JSONObject = {
        name: 'test',
        count: 42,
        active: true,
        data: null,
        nested: {
          items: [1, 2, 3],
        },
      };

      expect(jsonObj.name).toBe('test');
      expect(jsonObj.count).toBe(42);
    });

    it('should accept arrays as JSONValue', () => {
      const arr: JSONValue = [1, 'two', true, null, { nested: 'value' }];
      expect(Array.isArray(arr)).toBe(true);
    });
  });

  describe('Selector type', () => {
    it('should accept string selectors', () => {
      const selector: Selector = '.my-class';
      expect(selector).toBe('.my-class');
    });

    it('should accept null', () => {
      const selector: Selector = null;
      expect(selector).toBeNull();
    });
  });

  describe('Function types', () => {
    it('should define EventHandler correctly', () => {
      const handler: EventHandler<MouseEvent> = (event) => {
        expect(event).toBeDefined();
      };
      expect(typeof handler).toBe('function');
    });

    it('should define Callback correctly', () => {
      const callback: Callback<number, string> = (num) => num.toString();
      expect(callback(42)).toBe('42');
    });

    it('should define AsyncCallback correctly', async () => {
      const asyncCallback: AsyncCallback<number, string> = async (num) => num.toString();
      await expect(asyncCallback(42)).resolves.toBe('42');
    });
  });

  describe('Utility types', () => {
    it('should make properties optional with DeepPartial', () => {
      interface TestObj {
        name: string;
        nested: {
          value: number;
        };
      }

      const partial: DeepPartial<TestObj> = {
        name: 'test',
      };

      expect(partial.name).toBe('test');
      expect(partial.nested).toBeUndefined();
    });

    it('should handle Nullable type', () => {
      const value: Nullable<string> = null;
      expect(value).toBeNull();
    });

    it('should handle Maybe type', () => {
      const maybeValue: Maybe<string> = undefined;
      expect(maybeValue).toBeUndefined();
    });
  });

  describe('ObjectType', () => {
    it('should include all expected types', () => {
      const types: ObjectType[] = [
        'string',
        'number',
        'boolean',
        'object',
        'array',
        'function',
        'undefined',
        'null',
        'date',
        'regexp',
        'element',
        'nodelist',
        'naturalElement',
      ];

      expect(types).toHaveLength(13);
    });
  });

  describe('BrowserType', () => {
    it('should include all expected browser types', () => {
      const browsers: BrowserType[] = [
        'chrome',
        'firefox',
        'safari',
        'edge',
        'opera',
        'ie',
        'ios',
        'android',
        'unknown',
      ];

      expect(browsers).toHaveLength(9);
    });
  });

  describe('MessageResource', () => {
    it('should structure messages by locale', () => {
      const messages: MessageResource = {
        en_US: {
          greeting: 'Hello',
          farewell: 'Goodbye',
        },
        ko_KR: {
          greeting: '안녕하세요',
          farewell: '안녕히 가세요',
        },
      };

      expect(messages['en_US']?.['greeting']).toBe('Hello');
      expect(messages['ko_KR']?.['greeting']).toBe('안녕하세요');
    });
  });

  describe('RuleDefinition', () => {
    it('should define rules with optional args', () => {
      const rule: RuleDefinition = {
        name: 'required',
      };

      const ruleWithArgs: RuleDefinition = {
        name: 'maxlength',
        args: [100],
      };

      expect(rule.name).toBe('required');
      expect(ruleWithArgs.args).toEqual([100]);
    });
  });

  describe('ValidationResult', () => {
    it('should structure validation results', () => {
      const validResult: ValidationResult = {
        valid: true,
        errors: [],
      };

      const invalidResult: ValidationResult = {
        valid: false,
        errors: [
          {
            field: 'email',
            rule: 'email',
            message: 'Invalid email format',
            value: 'invalid',
          },
        ],
      };

      expect(validResult.valid).toBe(true);
      expect(invalidResult.errors).toHaveLength(1);
    });
  });

  describe('MaskProcessingMode', () => {
    it('should accept valid processing modes', () => {
      const modes: MaskProcessingMode[] = ['round', 'ceil', 'floor'];
      expect(modes).toHaveLength(3);
    });
  });

  describe('DateInfo', () => {
    it('should contain date object and format', () => {
      const dateInfo: DateInfo = {
        obj: new Date('2024-01-01'),
        format: 'Y-m-d',
      };

      expect(dateInfo.obj).toBeInstanceOf(Date);
      expect(dateInfo.format).toBe('Y-m-d');
    });
  });

  describe('NaturalEventName', () => {
    it('should include common DOM events', () => {
      const events: NaturalEventName[] = ['click', 'keydown', 'submit', 'focus', 'blur'];
      expect(events.every((e) => typeof e === 'string')).toBe(true);
    });
  });

  describe('HttpMethod', () => {
    it('should include all HTTP methods', () => {
      const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      expect(methods).toHaveLength(7);
    });
  });

  describe('RowStatus', () => {
    it('should include all row statuses', () => {
      const statuses: RowStatus[] = ['insert', 'update', 'delete', 'normal'];
      expect(statuses).toHaveLength(4);
    });
  });

  describe('DataRow', () => {
    it('should extend JSONObject with rowStatus', () => {
      const row: DataRow = {
        id: 1,
        name: 'test',
        rowStatus: 'insert',
      };

      expect(row.id).toBe(1);
      expect(row.rowStatus).toBe('insert');
    });
  });
});

