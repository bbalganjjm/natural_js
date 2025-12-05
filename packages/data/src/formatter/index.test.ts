/**
 * Tests for the Formatter module.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  Formatter,
  createFormatter,
  formatValue,
  rules,
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
  dateFormat,
  time,
  limit,
  replace,
  lpad,
  rpad,
  mask,
  generic,
  numeric,
} from './index';

describe('Formatter Rules', () => {
  describe('commas', () => {
    it('should add thousand separators', () => {
      expect(commas('1234567')).toBe('1,234,567');
      expect(commas('1234567890')).toBe('1,234,567,890');
    });

    it('should handle negative numbers', () => {
      expect(commas('-1234567')).toBe('-1,234,567');
    });

    it('should handle decimal numbers', () => {
      expect(commas('1234567.89')).toBe('1,234,567.89');
    });

    it('should return empty string for empty input', () => {
      expect(commas('')).toBe('');
      expect(commas('   ')).toBe('');
    });

    it('should remove existing commas before formatting', () => {
      expect(commas('1,234,567')).toBe('1,234,567');
    });

    it('should handle small numbers', () => {
      expect(commas('123')).toBe('123');
      expect(commas('12')).toBe('12');
      expect(commas('1')).toBe('1');
    });
  });

  describe('rrn (Resident Registration Number)', () => {
    it('should format 13-digit RRN', () => {
      expect(rrn('1234561234567')).toBe('123456-1234567');
    });

    it('should mask characters from the end', () => {
      expect(rrn('1234561234567', [6])).toBe('123456-1******');
      expect(rrn('1234561234567', [7])).toBe('123456-*******');
    });

    it('should use custom mask character', () => {
      expect(rrn('1234561234567', [6, '#'])).toBe('123456-1######');
    });

    it('should return input if not 13 digits', () => {
      expect(rrn('12345')).toBe('12345');
    });

    it('should remove non-numeric characters', () => {
      expect(rrn('123456-1234567')).toBe('123456-1234567');
    });
  });

  describe('ssn (US Social Security Number)', () => {
    it('should format 9-digit SSN', () => {
      expect(ssn('123456789')).toBe('123-45-6789');
    });

    it('should return input if not 9 digits', () => {
      expect(ssn('12345678')).toBe('12345678');
      expect(ssn('1234567890')).toBe('1234567890');
    });
  });

  describe('kbrn (Korean Business Registration Number)', () => {
    it('should format 10-digit KBRN', () => {
      expect(kbrn('1234567890')).toBe('123-45-67890');
    });

    it('should truncate if longer than 10 digits', () => {
      expect(kbrn('12345678901234')).toBe('123-45-67890');
    });

    it('should return input if less than 5 characters', () => {
      expect(kbrn('1234')).toBe('1234');
    });
  });

  describe('kcn (Korean Corporation Number)', () => {
    it('should format like RRN', () => {
      expect(kcn('1234561234567')).toBe('123456-1234567');
    });
  });

  describe('upper', () => {
    it('should convert to uppercase', () => {
      expect(upper('hello')).toBe('HELLO');
      expect(upper('Hello World')).toBe('HELLO WORLD');
    });

    it('should return empty string for empty input', () => {
      expect(upper('')).toBe('');
    });
  });

  describe('lower', () => {
    it('should convert to lowercase', () => {
      expect(lower('HELLO')).toBe('hello');
      expect(lower('Hello World')).toBe('hello world');
    });

    it('should return empty string for empty input', () => {
      expect(lower('')).toBe('');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first character', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('hello world')).toBe('Hello world');
    });

    it('should handle single character', () => {
      expect(capitalize('h')).toBe('H');
    });

    it('should return empty string for empty input', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('zipcode', () => {
    it('should format 6-digit zipcode', () => {
      expect(zipcode('123456')).toBe('123-456');
    });

    it('should return empty string for empty input', () => {
      expect(zipcode('')).toBe('');
    });
  });

  describe('phone', () => {
    it('should format mobile phone numbers', () => {
      expect(phone('01012345678')).toBe('010-1234-5678');
      expect(phone('01112345678')).toBe('011-1234-5678');
    });

    it('should format Seoul area code', () => {
      expect(phone('0212345678')).toBe('02-1234-5678');
    });

    it('should format other area codes', () => {
      expect(phone('03112345678')).toBe('031-1234-5678');
    });

    it('should return empty string for empty input', () => {
      expect(phone('')).toBe('');
    });
  });

  describe('realnum', () => {
    it('should parse float', () => {
      expect(realnum('123.45')).toBe('123.45');
      expect(realnum('123')).toBe('123');
    });

    it('should return empty for NaN', () => {
      expect(realnum('abc')).toBe('');
    });
  });

  describe('trimtoempty', () => {
    it('should trim whitespace', () => {
      expect(trimtoempty('  hello  ')).toBe('hello');
    });

    it('should return empty for null-like values', () => {
      expect(trimtoempty('')).toBe('');
    });
  });

  describe('trimtozero', () => {
    it('should return 0 for empty values', () => {
      expect(trimtozero('')).toBe('0');
      expect(trimtozero('   ')).toBe('0');
    });

    it('should return trimmed value if not empty', () => {
      expect(trimtozero('  123  ')).toBe('123');
    });
  });

  describe('trimtoval', () => {
    it('should return default value for empty input', () => {
      expect(trimtoval('', ['N/A'])).toBe('N/A');
      expect(trimtoval('   ', ['default'])).toBe('default');
    });

    it('should return trimmed value if not empty', () => {
      expect(trimtoval('hello', ['N/A'])).toBe('hello');
    });

    it('should throw error if no default value provided', () => {
      expect(() => trimtoval('')).toThrow();
    });
  });

  describe('dateFormat', () => {
    it('should format date with numeric length', () => {
      expect(dateFormat('20231225', [8])).toBe('2023-12-25');
      expect(dateFormat('202312', [6])).toBe('2023-12');
      expect(dateFormat('2023', [4])).toBe('2023');
    });

    it('should format date with custom format', () => {
      expect(dateFormat('20231225', ['Y/m/d'])).toBe('2023/12/25');
    });

    it('should format datetime', () => {
      expect(dateFormat('20231225153045', [14])).toBe('2023-12-25 15:30:45');
      expect(dateFormat('202312251530', [12])).toBe('2023-12-25 15:30');
      expect(dateFormat('2023122515', [10])).toBe('2023-12-25 15');
    });

    it('should return empty for zero values', () => {
      expect(dateFormat('0', [8])).toBe('');
      expect(dateFormat('00000000', [8])).toBe('');
    });

    it('should return input if no args', () => {
      expect(dateFormat('20231225')).toBe('20231225');
    });
  });

  describe('time', () => {
    it('should format time', () => {
      expect(time('153045', [6])).toBe('15:30:45');
      expect(time('1530', [4])).toBe('15:30');
      expect(time('15', [2])).toBe('15');
    });

    it('should default to 4-digit format', () => {
      expect(time('1530')).toBe('15:30');
    });
  });

  describe('limit', () => {
    it('should truncate long strings', () => {
      const result = limit('Hello World!', [5, '...']);
      expect(result).toBe('Hello...');
    });

    it('should not truncate short strings', () => {
      expect(limit('Hi', [10])).toBe('Hi');
    });

    it('should throw error if no max length provided', () => {
      expect(() => limit('Hello')).toThrow();
    });
  });

  describe('replace', () => {
    it('should replace strings', () => {
      expect(replace('Hello World', ['World', 'TypeScript'])).toBe('Hello TypeScript');
    });

    it('should replace all occurrences', () => {
      expect(replace('a-b-c', ['-', '_'])).toBe('a_b_c');
    });

    it('should throw error if not enough args', () => {
      expect(() => replace('Hello', ['World'])).toThrow();
    });
  });

  describe('lpad', () => {
    it('should left-pad string', () => {
      expect(lpad('5', [3, '0'])).toBe('005');
      expect(lpad('123', [5, '0'])).toBe('00123');
    });

    it('should throw error if not enough args', () => {
      expect(() => lpad('5', [3])).toThrow();
    });
  });

  describe('rpad', () => {
    it('should right-pad string', () => {
      expect(rpad('5', [3, '0'])).toBe('500');
      expect(rpad('123', [5, '0'])).toBe('12300');
    });

    it('should throw error if not enough args', () => {
      expect(() => rpad('5', [3])).toThrow();
    });
  });

  describe('mask', () => {
    describe('phone mask', () => {
      it('should mask middle digits of phone', () => {
        const result = mask('01012345678', ['phone']);
        expect(result).toBe('010-****-5678');
      });

      it('should use custom mask character', () => {
        const result = mask('01012345678', ['phone', '#']);
        expect(result).toBe('010-####-5678');
      });
    });

    describe('email mask', () => {
      it('should mask last 3 chars of local part', () => {
        const result = mask('test@email.com', ['email']);
        expect(result).toBe('t***@email.com');
      });
    });

    describe('name mask', () => {
      it('should mask middle character of Korean name', () => {
        expect(mask('홍길동', ['name'])).toBe('홍*동');
        expect(mask('김철수', ['name'])).toBe('김*수');
      });

      it('should handle compound surnames', () => {
        expect(mask('남궁민수', ['name'])).toBe('남궁*수');
      });

      it('should mask English names', () => {
        const result = mask('John Doe', ['name']);
        expect(result.substring(0, 3)).toBe('Joh');
        expect(result.indexOf('*')).toBeGreaterThan(-1);
      });
    });

    describe('rrn mask', () => {
      it('should mask last 7 digits of RRN', () => {
        expect(mask('1234561234567', ['rrn'])).toBe('123456-*******');
      });
    });

    it('should throw error if no mask type provided', () => {
      expect(() => mask('test')).toThrow();
    });
  });

  describe('generic', () => {
    it('should apply generic mask pattern', () => {
      expect(generic('1234567890', ['###-###-####'])).toBe('123-456-7890');
    });

    it('should throw error if no pattern provided', () => {
      expect(() => generic('123')).toThrow();
    });
  });

  describe('numeric', () => {
    it('should apply numeric mask pattern', () => {
      // Note: Mask pattern format is #,### for thousands with optional decimal
      expect(numeric('1234.56', ['#,###.00'])).toBe('1,234.56');
      expect(numeric('1234567', ['#,###'])).toBe('1,234,567');
    });

    it('should throw error if no pattern provided', () => {
      expect(() => numeric('123')).toThrow();
    });
  });
});

describe('Formatter Class', () => {
  describe('constructor', () => {
    it('should create formatter with data array and rules', () => {
      const data = [{ price: 1234567, name: 'test' }];
      const rules = { price: [['commas']] };
      const formatter = new Formatter(data, rules);

      expect(formatter.getRules()).toEqual(rules);
    });

    it('should create formatter with single object', () => {
      const data = { price: 1234567 };
      const rules = { price: [['commas']] };
      const formatter = new Formatter(data, rules);

      const result = formatter.format();
      expect(result[0].price).toBe('1,234,567');
    });
  });

  describe('format', () => {
    it('should format all rows', () => {
      const data = [
        { price: 1234567 },
        { price: 7654321 },
      ];
      const rules = { price: [['commas']] };
      const formatter = new Formatter(data, rules);

      const result = formatter.format();
      expect(result).toHaveLength(2);
      expect(result[0].price).toBe('1,234,567');
      expect(result[1].price).toBe('7,654,321');
    });

    it('should format specific row', () => {
      const data = [
        { price: 1234567 },
        { price: 7654321 },
      ];
      const rules = { price: [['commas']] };
      const formatter = new Formatter(data, rules);

      const result = formatter.format(1);
      expect(result).toHaveLength(1);
      expect(result[0].price).toBe('7,654,321');
    });

    it('should apply multiple rules in sequence', () => {
      const data = [{ value: '1234567' }];
      const rules = {
        value: [['commas'], ['lpad', 15, '0']],
      };
      const formatter = new Formatter(data, rules);

      const result = formatter.format();
      expect(result[0].value).toBe('0000001,234,567');
    });

    it('should throw error for out-of-range row index', () => {
      const data = [{ price: 1234567 }];
      const rules = { price: [['commas']] };
      const formatter = new Formatter(data, rules);

      expect(() => formatter.format(5)).toThrow('Row index out of range');
      expect(() => formatter.format(-1)).toThrow('Row index out of range');
    });

    it('should throw error for invalid rule', () => {
      const data = [{ price: 1234567 }];
      const rules = { price: [['invalidrule']] };
      const formatter = new Formatter(data, rules);

      expect(() => formatter.format()).toThrow('is not a valid format rule');
    });
  });

  describe('unformat', () => {
    it('should return original value', () => {
      const data = [{ price: 1234567 }];
      const rules = { price: [['commas']] };
      const formatter = new Formatter(data, rules);

      formatter.format();
      expect(formatter.unformat(0, 'price')).toBe(1234567);
    });
  });

  describe('user-defined rules', () => {
    it('should support user-defined rules via constructor', () => {
      const data = [{ value: 'hello' }];
      const rules = { value: [['reverse']] };
      const userRules = {
        reverse: (str: string) => str.split('').reverse().join(''),
      };
      const formatter = new Formatter(data, rules, userRules);

      const result = formatter.format();
      expect(result[0].value).toBe('olleh');
    });

    it('should support adding rules via addRule', () => {
      const data = [{ value: 'hello' }];
      const rules = { value: [['reverse']] };
      const formatter = new Formatter(data, rules);

      formatter.addRule('reverse', (str: string) => str.split('').reverse().join(''));

      const result = formatter.format();
      expect(result[0].value).toBe('olleh');
    });

    it('should support removing rules via removeRule', () => {
      const data = [{ value: 'hello' }];
      const rules = { value: [['reverse']] };
      const userRules = {
        reverse: (str: string) => str.split('').reverse().join(''),
      };
      const formatter = new Formatter(data, rules, userRules);

      formatter.removeRule('reverse');

      expect(() => formatter.format()).toThrow();
    });
  });

  describe('getData and getOriginalData', () => {
    it('should return formatted data', () => {
      const data = [{ price: 1234567 }];
      const rules = { price: [['commas']] };
      const formatter = new Formatter(data, rules);

      const formatted = formatter.getData();
      expect(formatted[0].price).toBe('1,234,567');
    });

    it('should return original data', () => {
      const data = [{ price: 1234567 }];
      const rules = { price: [['commas']] };
      const formatter = new Formatter(data, rules);

      const original = formatter.getOriginalData();
      expect(original[0].price).toBe(1234567);
    });
  });
});

describe('createFormatter', () => {
  it('should create a Formatter instance', () => {
    const data = [{ price: 1234567 }];
    const rules = { price: [['commas']] };
    const formatter = createFormatter(data, rules);

    expect(formatter).toBeInstanceOf(Formatter);
    expect(formatter.format()[0].price).toBe('1,234,567');
  });
});

describe('formatValue', () => {
  it('should format a single value', () => {
    expect(formatValue('1234567', 'commas')).toBe('1,234,567');
    expect(formatValue('hello', 'upper')).toBe('HELLO');
  });

  it('should accept numeric value', () => {
    expect(formatValue(1234567, 'commas')).toBe('1,234,567');
  });

  it('should accept null/undefined', () => {
    expect(formatValue(null, 'commas')).toBe('');
    expect(formatValue(undefined, 'commas')).toBe('');
  });

  it('should pass arguments to rule', () => {
    expect(formatValue('20231225', 'date', [8])).toBe('2023-12-25');
    expect(formatValue('5', 'lpad', [3, '0'])).toBe('005');
  });

  it('should support user-defined rules', () => {
    const userRules = {
      double: (str: string) => str + str,
    };
    expect(formatValue('abc', 'double', undefined, userRules)).toBe('abcabc');
  });

  it('should throw error for invalid rule', () => {
    expect(() => formatValue('test', 'invalidrule')).toThrow();
  });
});

describe('rules export', () => {
  it('should export all built-in rules', () => {
    expect(rules.commas).toBeDefined();
    expect(rules.rrn).toBeDefined();
    expect(rules.ssn).toBeDefined();
    expect(rules.kbrn).toBeDefined();
    expect(rules.kcn).toBeDefined();
    expect(rules.upper).toBeDefined();
    expect(rules.lower).toBeDefined();
    expect(rules.capitalize).toBeDefined();
    expect(rules.zipcode).toBeDefined();
    expect(rules.phone).toBeDefined();
    expect(rules.realnum).toBeDefined();
    expect(rules.trimtoempty).toBeDefined();
    expect(rules.trimtozero).toBeDefined();
    expect(rules.trimtoval).toBeDefined();
    expect(rules.date).toBeDefined();
    expect(rules.time).toBeDefined();
    expect(rules.limit).toBeDefined();
    expect(rules.replace).toBeDefined();
    expect(rules.lpad).toBeDefined();
    expect(rules.rpad).toBeDefined();
    expect(rules.mask).toBeDefined();
    expect(rules.generic).toBeDefined();
    expect(rules.numeric).toBeDefined();
  });
});

describe('Complex formatting scenarios', () => {
  it('should format multiple fields with different rules', () => {
    const data = [{
      name: 'john doe',
      price: 1234567,
      phone: '01012345678',
      date: '20231225',
      rrn: '1234561234567',
    }];

    const rules = {
      name: [['capitalize']],
      price: [['commas']],
      phone: [['phone']],
      date: [['date', 8]],
      rrn: [['rrn', 6]],
    };

    const formatter = new Formatter(data, rules);
    const result = formatter.format();

    expect(result[0].name).toBe('John doe');
    expect(result[0].price).toBe('1,234,567');
    expect(result[0].phone).toBe('010-1234-5678');
    expect(result[0].date).toBe('2023-12-25');
    expect(result[0].rrn).toBe('123456-1******');
  });

  it('should handle empty data gracefully', () => {
    const data: Record<string, unknown>[] = [];
    const rules = { price: [['commas']] };
    const formatter = new Formatter(data, rules);

    const result = formatter.format();
    expect(result).toHaveLength(0);
  });

  it('should handle missing fields', () => {
    const data = [{ name: 'test' }];
    const rules = {
      name: [['upper']],
      price: [['commas']], // price field doesn't exist
    };
    const formatter = new Formatter(data, rules);

    const result = formatter.format();
    expect(result[0].name).toBe('TEST');
    expect(result[0].price).toBe(''); // Should be empty string
  });

  it('should preserve field values not in rules', () => {
    const data = [{ name: 'test', extra: 'value' }];
    const rules = { name: [['upper']] };
    const formatter = new Formatter(data, rules);

    const result = formatter.format();
    expect(result[0].name).toBe('TEST');
    expect(result[0]).not.toHaveProperty('extra'); // Only fields in rules are included
  });
});

