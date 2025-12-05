/**
 * Tests for the Validator module.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  Validator,
  createValidator,
  validateValue,
  rules,
  required,
  alphabet,
  integer,
  korean,
  alphabet_integer,
  integer_korean,
  alphabet_korean,
  alphabet_integer_korean,
  dash_integer,
  commas_integer,
  number,
  email,
  url,
  zipcode,
  decimal,
  phone,
  rrn,
  ssn,
  frn,
  frn_rrn,
  kbrn,
  kcn,
  date,
  time,
  accept,
  match,
  acceptfileext,
  notaccept,
  notmatch,
  notacceptfileext,
  equalTo,
  maxlength,
  minlength,
  rangelength,
  maxbyte,
  minbyte,
  rangebyte,
  maxvalue,
  minvalue,
  rangevalue,
  regexp,
  setValidationLocale,
  getValidationLocale,
} from './index';

describe('Validation Rules', () => {
  describe('required', () => {
    it('should pass for non-empty values', () => {
      expect(required('hello')).toBe(true);
      expect(required('0')).toBe(true);
    });

    it('should fail for empty values', () => {
      expect(required('')).toBe(false);
      expect(required('   ')).toBe(false);
    });
  });

  describe('alphabet', () => {
    it('should pass for alphabetic strings', () => {
      expect(alphabet('Hello')).toBe(true);
      expect(alphabet('hello world')).toBe(true);
    });

    it('should fail for non-alphabetic strings', () => {
      expect(alphabet('Hello123')).toBe(false);
      expect(alphabet('123')).toBe(false);
    });
  });

  describe('integer', () => {
    it('should pass for integers', () => {
      expect(integer('123')).toBe(true);
      expect(integer('-456')).toBe(true);
      expect(integer('+789')).toBe(true);
    });

    it('should fail for non-integers', () => {
      expect(integer('12.34')).toBe(false);
      expect(integer('abc')).toBe(false);
    });
  });

  describe('korean', () => {
    it('should pass for Korean characters', () => {
      expect(korean('안녕하세요')).toBe(true);
      expect(korean('한글 테스트')).toBe(true);
    });

    it('should fail for non-Korean characters', () => {
      expect(korean('Hello')).toBe(false);
      expect(korean('한글123')).toBe(false);
    });
  });

  describe('alphabet_integer', () => {
    it('should pass for alphanumeric strings', () => {
      expect(alphabet_integer('Hello123')).toBe(true);
      expect(alphabet_integer('abc')).toBe(true);
      expect(alphabet_integer('123')).toBe(true);
    });

    it('should fail for strings with special characters', () => {
      expect(alphabet_integer('Hello!')).toBe(false);
      expect(alphabet_integer('한글')).toBe(false);
    });
  });

  describe('integer_korean', () => {
    it('should pass for Korean and numbers', () => {
      expect(integer_korean('안녕123')).toBe(true);
      expect(integer_korean('한글')).toBe(true);
    });

    it('should fail for English', () => {
      expect(integer_korean('Hello')).toBe(false);
    });
  });

  describe('alphabet_korean', () => {
    it('should pass for Korean and English', () => {
      expect(alphabet_korean('Hello안녕')).toBe(true);
    });

    it('should fail for numbers', () => {
      expect(alphabet_korean('Hello123')).toBe(false);
    });
  });

  describe('alphabet_integer_korean', () => {
    it('should pass for Korean, English, and numbers', () => {
      expect(alphabet_integer_korean('Hello123안녕')).toBe(true);
    });

    it('should fail for special characters', () => {
      expect(alphabet_integer_korean('Hello!')).toBe(false);
    });
  });

  describe('dash_integer', () => {
    it('should pass for digits and dashes', () => {
      expect(dash_integer('123-456')).toBe(true);
      expect(dash_integer('123')).toBe(true);
    });

    it('should fail for other characters', () => {
      expect(dash_integer('123abc')).toBe(false);
    });
  });

  describe('commas_integer', () => {
    it('should pass for digits and commas', () => {
      expect(commas_integer('1,234,567')).toBe(true);
    });

    it('should fail for other characters', () => {
      expect(commas_integer('1234.56')).toBe(false);
    });
  });

  describe('number', () => {
    it('should pass for valid numbers', () => {
      expect(number('1,234.56')).toBe(true);
      expect(number('-123.45')).toBe(true);
      expect(number('+123')).toBe(true);
    });

    it('should fail for non-numbers', () => {
      expect(number('abc')).toBe(false);
    });
  });

  describe('email', () => {
    it('should pass for valid emails', () => {
      expect(email('test@example.com')).toBe(true);
      expect(email('user.name@domain.co.kr')).toBe(true);
    });

    it('should fail for invalid emails', () => {
      expect(email('invalid-email')).toBe(false);
      expect(email('test@')).toBe(false);
      expect(email('@example.com')).toBe(false);
    });
  });

  describe('url', () => {
    it('should pass for valid URLs', () => {
      expect(url('https://example.com')).toBe(true);
      expect(url('http://example.com/path?query=1')).toBe(true);
      expect(url('ftp://files.example.com')).toBe(true);
    });

    it('should fail for invalid URLs', () => {
      expect(url('invalid-url')).toBe(false);
      expect(url('example.com')).toBe(false);
    });
  });

  describe('zipcode', () => {
    it('should pass for valid zipcodes', () => {
      expect(zipcode('123-456')).toBe(true);
    });

    it('should fail for invalid zipcodes', () => {
      expect(zipcode('12345')).toBe(false);
      expect(zipcode('1234-567')).toBe(false);
    });
  });

  describe('decimal', () => {
    it('should pass for valid decimals', () => {
      expect(decimal('123.45')).toBe(true);
      expect(decimal('123')).toBe(true);
      expect(decimal('-123.45')).toBe(true);
    });

    it('should respect precision limit', () => {
      expect(decimal('123.456', [2])).toBe(false);
      expect(decimal('123.45', [2])).toBe(true);
    });
  });

  describe('phone', () => {
    it('should pass for valid phone numbers', () => {
      expect(phone('02-1234-5678')).toBe(true);
      expect(phone('010-1234-5678')).toBe(true);
    });

    it('should fail for invalid phone numbers', () => {
      expect(phone('1234567890')).toBe(false);
    });
  });

  describe('date', () => {
    it('should pass for valid dates', () => {
      expect(date('2023-12-25')).toBe(true);
      expect(date('20231225')).toBe(true);
    });

    it('should fail for invalid dates', () => {
      expect(date('2023-02-30')).toBe(false); // Invalid day
      expect(date('2023-13-01')).toBe(false); // Invalid month
    });

    it('should handle leap years', () => {
      expect(date('2024-02-29')).toBe(true); // Leap year
      expect(date('2023-02-29')).toBe(false); // Not leap year
    });
  });

  describe('time', () => {
    it('should pass for valid times', () => {
      expect(time('23:59:59')).toBe(true);
      expect(time('235959')).toBe(true);
      expect(time('00:00')).toBe(true);
    });

    it('should fail for invalid times', () => {
      expect(time('24:00')).toBe(false);
      expect(time('12:60')).toBe(false);
    });
  });

  describe('ssn', () => {
    it('should pass for valid SSN format', () => {
      expect(ssn('123-45-6789')).toBe(true);
    });

    it('should fail for invalid SSN format', () => {
      expect(ssn('123456789')).toBe(false);
    });
  });

  describe('accept', () => {
    it('should pass for accepted values', () => {
      expect(accept('yes', ['yes|no'])).toBe(true);
      expect(accept('no', ['yes|no'])).toBe(true);
    });

    it('should fail for non-accepted values', () => {
      expect(accept('maybe', ['yes|no'])).toBe(false);
    });

    it('should throw error if no args', () => {
      expect(() => accept('test')).toThrow();
    });
  });

  describe('match', () => {
    it('should pass if pattern matches', () => {
      expect(match('hello world', ['world'])).toBe(true);
    });

    it('should fail if pattern does not match', () => {
      expect(match('hello', ['world'])).toBe(false);
    });
  });

  describe('acceptfileext', () => {
    it('should pass for accepted extensions', () => {
      expect(acceptfileext('image.jpg', ['jpg|png|gif'])).toBe(true);
    });

    it('should fail for non-accepted extensions', () => {
      expect(acceptfileext('script.exe', ['jpg|png|gif'])).toBe(false);
    });
  });

  describe('notaccept', () => {
    it('should pass if value is not in list', () => {
      expect(notaccept('yes', ['no|never'])).toBe(true);
    });

    it('should fail if value is in list', () => {
      expect(notaccept('no', ['no|never'])).toBe(false);
    });
  });

  describe('notmatch', () => {
    it('should pass if pattern does not match', () => {
      expect(notmatch('hello', ['world'])).toBe(true);
    });

    it('should fail if pattern matches', () => {
      expect(notmatch('hello world', ['world'])).toBe(false);
    });
  });

  describe('notacceptfileext', () => {
    it('should pass for non-blocked extensions', () => {
      expect(notacceptfileext('image.jpg', ['exe|bat|sh'])).toBe(true);
    });

    it('should fail for blocked extensions', () => {
      expect(notacceptfileext('script.exe', ['exe|bat|sh'])).toBe(false);
    });
  });

  describe('equalTo', () => {
    it('should pass for equal values', () => {
      expect(equalTo('password123', ['password123'])).toBe(true);
    });

    it('should fail for different values', () => {
      expect(equalTo('password123', ['different'])).toBe(false);
    });
  });

  describe('maxlength', () => {
    it('should pass if length is within limit', () => {
      expect(maxlength('hello', [10])).toBe(true);
    });

    it('should fail if length exceeds limit', () => {
      expect(maxlength('hello world!', [5])).toBe(false);
    });
  });

  describe('minlength', () => {
    it('should pass if length meets minimum', () => {
      expect(minlength('hello', [3])).toBe(true);
    });

    it('should fail if length is below minimum', () => {
      expect(minlength('hi', [5])).toBe(false);
    });
  });

  describe('rangelength', () => {
    it('should pass if length is within range', () => {
      expect(rangelength('hello', [3, 10])).toBe(true);
    });

    it('should fail if length is outside range', () => {
      expect(rangelength('hi', [5, 10])).toBe(false);
      expect(rangelength('hello world!', [3, 5])).toBe(false);
    });
  });

  describe('maxbyte', () => {
    it('should pass if byte length is within limit', () => {
      expect(maxbyte('hello', [10])).toBe(true);
    });

    it('should fail if byte length exceeds limit', () => {
      expect(maxbyte('안녕', [3])).toBe(false); // 6 bytes with charByteLength=3
    });
  });

  describe('minbyte', () => {
    it('should pass if byte length meets minimum', () => {
      expect(minbyte('hello', [3])).toBe(true);
    });

    it('should fail if byte length is below minimum', () => {
      expect(minbyte('hi', [5])).toBe(false);
    });
  });

  describe('rangebyte', () => {
    it('should pass if byte length is within range', () => {
      expect(rangebyte('hello', [3, 10])).toBe(true);
    });

    it('should fail if byte length is outside range', () => {
      expect(rangebyte('hi', [5, 10])).toBe(false);
    });
  });

  describe('maxvalue', () => {
    it('should pass if value is within limit', () => {
      expect(maxvalue('50', [100])).toBe(true);
    });

    it('should fail if value exceeds limit', () => {
      expect(maxvalue('150', [100])).toBe(false);
    });
  });

  describe('minvalue', () => {
    it('should pass if value meets minimum', () => {
      expect(minvalue('50', [10])).toBe(true);
    });

    it('should fail if value is below minimum', () => {
      expect(minvalue('5', [10])).toBe(false);
    });
  });

  describe('rangevalue', () => {
    it('should pass if value is within range', () => {
      expect(rangevalue('50', [0, 100])).toBe(true);
    });

    it('should fail if value is outside range', () => {
      expect(rangevalue('150', [0, 100])).toBe(false);
    });
  });

  describe('regexp', () => {
    it('should pass if pattern matches', () => {
      expect(regexp('ABC123', ['^[A-Z]+\\d+$'])).toBe(true);
    });

    it('should support flags', () => {
      expect(regexp('abc123', ['^[A-Z]+\\d+$', 'i'])).toBe(true);
    });

    it('should fail if pattern does not match', () => {
      expect(regexp('abc', ['^[A-Z]+\\d+$'])).toBe(false);
    });
  });
});

describe('Validator Class', () => {
  describe('constructor', () => {
    it('should create validator with data array and rules', () => {
      const data = [{ email: 'test@example.com' }];
      const rules = { email: [['required'], ['email']] };
      const validator = new Validator(data, rules);

      expect(validator.getRules()).toEqual(rules);
    });

    it('should create validator with single object', () => {
      const data = { email: 'test@example.com' };
      const rules = { email: [['required'], ['email']] };
      const validator = new Validator(data, rules);

      const results = validator.validate();
      expect(results).toHaveLength(1);
    });
  });

  describe('validate', () => {
    it('should validate all rows', () => {
      const data = [
        { email: 'test@example.com' },
        { email: 'invalid-email' },
      ];
      const rules = { email: [['email']] };
      const validator = new Validator(data, rules);

      const results = validator.validate();
      expect(results).toHaveLength(2);
      expect(results[0].email[0].result).toBe(true);
      expect(results[1].email[0].result).toBe(false);
    });

    it('should validate specific row', () => {
      const data = [
        { email: 'test@example.com' },
        { email: 'invalid-email' },
      ];
      const rules = { email: [['email']] };
      const validator = new Validator(data, rules);

      const results = validator.validate(1);
      expect(results).toHaveLength(1);
      expect(results[0].email[0].result).toBe(false);
    });

    it('should apply multiple rules in sequence', () => {
      const data = [{ password: 'ab' }];
      const rules = {
        password: [['required'], ['minlength', 6]],
      };
      const validator = new Validator(data, rules);

      const results = validator.validate();
      expect(results[0].password[0].result).toBe(true); // required passes
      expect(results[0].password[1].result).toBe(false); // minlength fails
    });

    it('should skip validation for empty values if not required', () => {
      const data = [{ email: '' }];
      const rules = { email: [['email']] }; // No 'required' rule
      const validator = new Validator(data, rules);

      const results = validator.validate();
      expect(results[0].email[0].result).toBe(true); // Skipped because empty and not required
    });

    it('should validate empty values if required', () => {
      const data = [{ email: '' }];
      const rules = { email: [['required'], ['email']] };
      const validator = new Validator(data, rules);

      const results = validator.validate();
      expect(results[0].email[0].result).toBe(false); // required fails
    });

    it('should throw error for out-of-range row index', () => {
      const data = [{ email: 'test@example.com' }];
      const rules = { email: [['email']] };
      const validator = new Validator(data, rules);

      expect(() => validator.validate(5)).toThrow('Row index out of range');
    });

    it('should throw error for invalid rule', () => {
      const data = [{ email: 'test@example.com' }];
      const rules = { email: [['invalidrule']] };
      const validator = new Validator(data, rules);

      expect(() => validator.validate()).toThrow('is not a valid validation rule');
    });
  });

  describe('isValid', () => {
    it('should return true if all validations passed', () => {
      const data = [{ email: 'test@example.com' }];
      const rules = { email: [['email']] };
      const validator = new Validator(data, rules);

      const results = validator.validate();
      expect(Validator.isValid(results)).toBe(true);
    });

    it('should return false if any validation failed', () => {
      const data = [{ email: 'invalid-email' }];
      const rules = { email: [['email']] };
      const validator = new Validator(data, rules);

      const results = validator.validate();
      expect(Validator.isValid(results)).toBe(false);
    });
  });

  describe('getErrors', () => {
    it('should return empty array if no errors', () => {
      const data = [{ email: 'test@example.com' }];
      const rules = { email: [['email']] };
      const validator = new Validator(data, rules);

      const results = validator.validate();
      expect(Validator.getErrors(results)).toHaveLength(0);
    });

    it('should return error messages', () => {
      const data = [{ email: 'invalid-email' }];
      const rules = { email: [['required'], ['email']] };
      const validator = new Validator(data, rules);

      const results = validator.validate();
      const errors = Validator.getErrors(results);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('user-defined rules', () => {
    it('should support user-defined rules via constructor', () => {
      const data = [{ value: 'abc' }];
      const rules = { value: [['isAbc']] };
      const userRules = {
        isabc: (str: string) => str === 'abc',
      };
      const validator = new Validator(data, rules, userRules);

      const results = validator.validate();
      expect(results[0].value[0].result).toBe(true);
    });

    it('should support adding rules via addRule', () => {
      const data = [{ value: 'abc' }];
      const rules = { value: [['isAbc']] };
      const validator = new Validator(data, rules);

      validator.addRule('isAbc', (str: string) => str === 'abc');

      const results = validator.validate();
      expect(results[0].value[0].result).toBe(true);
    });
  });

  describe('combined rules', () => {
    it('should handle combined rules with + syntax', () => {
      const data = [{ value: 'Hello123' }];
      const rules = { value: [['alphabet+integer']] };
      const validator = new Validator(data, rules);

      const results = validator.validate();
      expect(results[0].value[0].result).toBe(true);
    });
  });
});

describe('createValidator', () => {
  it('should create a Validator instance', () => {
    const data = [{ email: 'test@example.com' }];
    const rules = { email: [['email']] };
    const validator = createValidator(data, rules);

    expect(validator).toBeInstanceOf(Validator);
  });
});

describe('validateValue', () => {
  it('should validate a single value', () => {
    expect(validateValue('test@example.com', 'email')).toBe(true);
    expect(validateValue('invalid-email', 'email')).toBe(false);
  });

  it('should accept numeric value', () => {
    expect(validateValue(123, 'integer')).toBe(true);
  });

  it('should accept null/undefined', () => {
    expect(validateValue(null, 'required')).toBe(false);
    expect(validateValue(undefined, 'required')).toBe(false);
  });

  it('should pass arguments to rule', () => {
    expect(validateValue('50', 'rangevalue', [0, 100])).toBe(true);
    expect(validateValue('150', 'rangevalue', [0, 100])).toBe(false);
  });

  it('should support user-defined rules', () => {
    const userRules = {
      iseven: (str: string) => parseInt(str, 10) % 2 === 0,
    };
    expect(validateValue('4', 'iseven', undefined, userRules)).toBe(true);
    expect(validateValue('3', 'iseven', undefined, userRules)).toBe(false);
  });

  it('should throw error for invalid rule', () => {
    expect(() => validateValue('test', 'invalidrule')).toThrow();
  });
});

describe('Validation messages', () => {
  it('should set and get locale', () => {
    setValidationLocale('en_US');
    expect(getValidationLocale()).toBe('en_US');
    setValidationLocale('ko_KR');
    expect(getValidationLocale()).toBe('ko_KR');
  });

  it('should return validation messages on failure', () => {
    const data = [{ email: 'invalid' }];
    const rules = { email: [['email']] };
    const validator = new Validator(data, rules);

    const results = validator.validate();
    expect(results[0].email[0].msg).toBeTruthy();
  });
});

describe('rules export', () => {
  it('should export all built-in rules', () => {
    expect(rules.required).toBeDefined();
    expect(rules.alphabet).toBeDefined();
    expect(rules.integer).toBeDefined();
    expect(rules.korean).toBeDefined();
    expect(rules.alphabet_integer).toBeDefined();
    expect(rules.integer_korean).toBeDefined();
    expect(rules.alphabet_korean).toBeDefined();
    expect(rules.alphabet_integer_korean).toBeDefined();
    expect(rules.dash_integer).toBeDefined();
    expect(rules.commas_integer).toBeDefined();
    expect(rules.number).toBeDefined();
    expect(rules.email).toBeDefined();
    expect(rules.url).toBeDefined();
    expect(rules.zipcode).toBeDefined();
    expect(rules.decimal).toBeDefined();
    expect(rules.phone).toBeDefined();
    expect(rules.rrn).toBeDefined();
    expect(rules.ssn).toBeDefined();
    expect(rules.frn).toBeDefined();
    expect(rules.frn_rrn).toBeDefined();
    expect(rules.kbrn).toBeDefined();
    expect(rules.kcn).toBeDefined();
    expect(rules.date).toBeDefined();
    expect(rules.time).toBeDefined();
    expect(rules.accept).toBeDefined();
    expect(rules.match).toBeDefined();
    expect(rules.acceptfileext).toBeDefined();
    expect(rules.notaccept).toBeDefined();
    expect(rules.notmatch).toBeDefined();
    expect(rules.notacceptfileext).toBeDefined();
    expect(rules.equalTo).toBeDefined();
    expect(rules.maxlength).toBeDefined();
    expect(rules.minlength).toBeDefined();
    expect(rules.rangelength).toBeDefined();
    expect(rules.maxbyte).toBeDefined();
    expect(rules.minbyte).toBeDefined();
    expect(rules.rangebyte).toBeDefined();
    expect(rules.maxvalue).toBeDefined();
    expect(rules.minvalue).toBeDefined();
    expect(rules.rangevalue).toBeDefined();
    expect(rules.regexp).toBeDefined();
  });
});

describe('Complex validation scenarios', () => {
  it('should validate multiple fields with different rules', () => {
    const data = [{
      username: 'john123',
      email: 'john@example.com',
      password: 'password123',
      age: '25',
    }];

    const rules = {
      username: [['required'], ['alphabet_integer'], ['rangelength', 3, 20]],
      email: [['required'], ['email']],
      password: [['required'], ['minlength', 8]],
      age: [['integer'], ['rangevalue', 0, 150]],
    };

    const validator = new Validator(data, rules);
    const results = validator.validate();

    expect(Validator.isValid(results)).toBe(true);
  });

  it('should handle empty data gracefully', () => {
    const data: Record<string, unknown>[] = [];
    const rules = { email: [['email']] };
    const validator = new Validator(data, rules);

    const results = validator.validate();
    expect(results).toHaveLength(0);
  });

  it('should handle missing fields', () => {
    const data = [{ name: 'test' }];
    const rules = {
      name: [['required']],
      email: [['required'], ['email']], // email field doesn't exist
    };
    const validator = new Validator(data, rules);

    const results = validator.validate();
    expect(results[0].name[0].result).toBe(true);
    expect(results[0].email[0].result).toBe(false); // fails required
  });
});

