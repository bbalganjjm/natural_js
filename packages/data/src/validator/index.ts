/**
 * Validator module for Natural-JS.
 * Provides data validation capabilities with built-in and custom rules.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { string, isPlainObject, isString, isElement, element, message } from '@natural-js/core';
import {
  ValidationRules,
  DataRow,
  ValidationRule,
  ValidatorOptions,
  ValidationRuleFunction,
  ValidationRuleArgs,
  UserValidationRules,
  ValidationRuleResult,
  FieldValidationResult,
  RowValidationResult,
  ValidationMessages,
  LocalizedValidationMessages,
} from './types';
import { builtInRules, getValidationRule } from './rules';

// Re-export types and rules
export * from './types';
export * from './rules';

/**
 * Default validation messages (Korean)
 */
const DEFAULT_MESSAGES_KO: ValidationMessages = {
  global: '필드 검증에 통과하지 못했습니다.',
  required: '필수 입력 필드입니다.',
  alphabet: '영문자만 입력할 수 있습니다.',
  integer: '숫자(정수)만 입력할 수 있습니다.',
  korean: '한글만 입력할 수 있습니다.',
  alphabet_integer: '영문자와 숫자(정수)만 입력할 수 있습니다.',
  integer_korean: '숫자(정수)와 한글만 입력할 수 있습니다.',
  alphabet_korean: '영문자와 한글만 입력할 수 있습니다.',
  alphabet_integer_korean: '영문자, 숫자(정수), 한글만 입력할 수 있습니다.',
  dash_integer: '숫자(정수), 대시(-)만 입력할 수 있습니다.',
  commas_integer: '숫자(정수), 콤마(,)만 입력할 수 있습니다.',
  number: '숫자(+-,. 포함)만 입력할 수 있습니다.',
  email: 'e-mail 형식에 맞지 않습니다.',
  url: 'URL 형식에 맞지 않습니다.',
  zipcode: '우편번호 형식에 맞지 않습니다.',
  decimal: '(유한)소수만 입력할 수 있습니다.',
  decimal_: '(유한)소수 {0}번째 자리까지 입력할 수 있습니다.',
  phone: '전화번호 형식이 아닙니다.',
  rrn: '주민등록번호 형식에 맞지 않습니다.',
  ssn: '미국 사회보장번호 형식에 맞지 않습니다.',
  frn: '외국인등록번호 형식에 맞지 않습니다.',
  frn_rrn: '주민번호나 외국인등록번호 형식에 맞지 않습니다.',
  kbrn: '사업자등록번호 형식에 맞지 않습니다.',
  kcn: '법인번호 형식에 맞지 않습니다.',
  date: '날짜 형식에 맞지 않습니다.',
  time: '시간 형식에 맞지 않습니다.',
  accept: '"{0}" 값만 입력할 수 있습니다.',
  match: '"{0}" 이(가) 포함된 값만 입력할 수 있습니다.',
  acceptFileExt: '"{0}" 이(가) 포함된 확장자만 입력할 수 있습니다.',
  notAccept: '"{0}" 값은 입력할 수 없습니다.',
  notMatch: '"{0}" 이(가) 포함된 값은 입력할 수 없습니다.',
  notAcceptFileExt: '"{0}" 이(가) 포함된 확장자는 입력할 수 없습니다.',
  equalTo: '"{1}" 의 값과 같아야 합니다.',
  maxlength: '{0} 글자 이하만 입력 가능합니다.',
  minlength: '{0} 글자 이상만 입력 가능합니다.',
  rangelength: '{0} 글자에서 {1} 글자 까지만 입력 가능합니다.',
  maxbyte:
    '{0} 바이트 이하만 입력 가능합니다.<br> - 영문, 숫자 : 1 바이트<br> - 한글, 특수문자 : {1} 바이트',
  minbyte:
    '{0} 바이트 이상만 입력 가능합니다.<br> - 영문, 숫자 : 1 바이트<br> - 한글, 특수문자 : {1} 바이트',
  rangebyte:
    '{0} 바이트에서 {1} 바이트 까지만 입력 가능합니다.<br> - 영문, 숫자 한글자 : 1 바이트<br> - 한글, 특수문자 : {2} 바이트',
  maxvalue: '{0} 이하의 값만 입력 가능합니다.',
  minvalue: '{0} 이상의 값만 입력 가능합니다.',
  rangevalue: '{0}에서 {1} 사이의 값만 입력 가능합니다.',
  regexp: '{2}',
};

/**
 * Default validation messages (English)
 */
const DEFAULT_MESSAGES_EN: ValidationMessages = {
  global: "It Can't pass the field verification.",
  required: 'It is a field to input obligatorily.',
  alphabet: 'Can enter only alphabetical characters.',
  integer: 'Can enter only number(integer).',
  korean: 'Can enter only Korean alphabet.',
  alphabet_integer: 'Can enter only alphabetical characters and number(integer).',
  integer_korean: 'Can enter only number(integer) and Korean alphabet.',
  alphabet_korean: 'Can enter only alphabetical characters and Korean alphabet.',
  alphabet_integer_korean:
    'Can enter only alphabetical characters and number(integer) and Korean alphabet.',
  dash_integer: 'Can enter only number(integer) and dash(-).',
  commas_integer: 'Can enter only number(integer) and commas(,).',
  number: 'Can enter only number and (+-,.)',
  email: "Don't conform to the format of E-mail.",
  url: "Don't conform to the format of URL.",
  zipcode: "Don't conform to the format of zip code.",
  decimal: 'Can enter only (finite)decimal',
  decimal_: 'Can enter up to {0} places of (finite)decimal.',
  phone: 'There is no format of phone number.',
  rrn: "Don't fit the format of the resident registration number.",
  ssn: "Don't fit the format of the Social Security number.",
  frn: "Don't fit the format of foreign registration number.",
  frn_rrn: "Don't fit the format of the resident registration number or foreign registration number.",
  kbrn: "Don't fit the format of registration of entrepreneur.",
  kcn: "Don't fit the format of corporation number.",
  date: "Don't fit the format of date.",
  time: "Don't fit the format of time.",
  accept: 'Can enter only "{0}" value.',
  match: 'Can enter only value that contains "{0}".',
  acceptFileExt: 'Can enter only extension that includes "{0}".',
  notAccept: 'Can\'t enter "{0}" value.',
  notMatch: 'Can\'t enter only value that contains "{0}".',
  notAcceptFileExt: 'Can\'t enter only extension that includes "{0}".',
  equalTo: 'Must be the same as "{1}" value.',
  maxlength: 'Can enter only below {0} letters.',
  minlength: 'Can enter only more than {0} letters.',
  rangelength: 'It can be entered from {0} to {1} letters.',
  maxbyte: 'Can enter only below {0} bytes.',
  minbyte: 'Can enter only more than {0} bytes.',
  rangebyte: 'It can be entered from {0} to {1} bytes.',
  maxvalue: 'Can enter only below {0} value.',
  minvalue: 'Can enter only more than {0} value.',
  rangevalue: 'Can be entered value from {0} to {1}.',
  regexp: '{2}',
};

/**
 * Default localized validation messages.
 */
const DEFAULT_MESSAGES: LocalizedValidationMessages = {
  ko_KR: DEFAULT_MESSAGES_KO,
  en_US: DEFAULT_MESSAGES_EN,
};

/**
 * Current locale for validation messages.
 */
let currentLocale = 'ko_KR';

/**
 * Custom validation messages.
 */
let customMessages: LocalizedValidationMessages = {};

/**
 * Set the current locale for validation messages.
 */
export function setValidationLocale(locale: string): void {
  currentLocale = locale;
}

/**
 * Get the current locale for validation messages.
 */
export function getValidationLocale(): string {
  return currentLocale;
}

/**
 * Set custom validation messages.
 */
export function setValidationMessages(messages: LocalizedValidationMessages): void {
  customMessages = messages;
}

/**
 * Get a validation message for a rule.
 */
function getValidationMessage(rule: string, args: unknown[], locale?: string): string {
  const loc = locale || currentLocale;
  const messages = customMessages[loc] || DEFAULT_MESSAGES[loc] || DEFAULT_MESSAGES['ko_KR'];

  if (!messages) {
    return '';
  }

  const msg = messages[rule] || messages['global'] || '';

  // Replace message variables {0}, {1}, etc.
  const strArgs = args.map((arg) => String(arg ?? ''));
  return message.replaceMsgVars(msg, strArgs);
}

/**
 * Validator class for validating data according to specified rules.
 * Equivalent to ND.validator in the original framework.
 *
 * @example
 * // With data array and rules object
 * const validator = new Validator([{ email: 'test@example.com', age: 25 }], {
 *   email: [['required'], ['email']],
 *   age: [['integer'], ['rangevalue', 0, 150]]
 * });
 * const result = validator.validate(); // [{ email: [{...}], age: [{...}] }]
 *
 * @example
 * // With DOM element
 * const validator = new Validator(data, '#myForm');
 * validator.validate(0); // Validates and updates DOM elements
 */
export class Validator {
  /** Validator options */
  private options: ValidatorOptions;
  /** User-defined validation rules */
  private userRules: UserValidationRules = {};
  /** Original data reference */
  private originalData: DataRow[];

  /**
   * Creates a new Validator instance.
   *
   * @param data - Data to validate (array of objects or NaturalElement)
   * @param rules - Validation rules object or element selector for element-based validation
   * @param userRules - Optional user-defined validation rules
   */
  constructor(
    data: DataRow[] | NaturalElement | Record<string, unknown>,
    rules: ValidationRules | string | Element | NaturalElement,
    userRules?: UserValidationRules
  ) {
    // Process data
    let processedData: DataRow[];
    if (data instanceof NaturalElement) {
      processedData = data.get() as unknown as DataRow[];
    } else if (Array.isArray(data)) {
      processedData = data;
    } else if (isPlainObject(data)) {
      processedData = [data as DataRow];
    } else {
      processedData = [];
    }

    // Store original data reference
    this.originalData = processedData;

    // Initialize options
    this.options = {
      data: processedData,
      rules: {} as ValidationRules,
      isElement: false,
      createEvent: true,
      context: null,
      targetElements: null,
    };

    // Store user rules
    if (userRules) {
      this.userRules = userRules;
    }

    // Process rules
    if (isElement(rules) || isString(rules)) {
      this.initElementBasedValidation(rules as string | Element);
    } else if (rules instanceof NaturalElement) {
      this.initElementBasedValidation(rules);
    } else {
      this.options.rules = rules as ValidationRules;
    }
  }

  /**
   * Initialize element-based validation.
   * Extracts validation rules from data-validate attributes.
   */
  private initElementBasedValidation(
    rulesElement: string | Element | NaturalElement
  ): void {
    this.options.isElement = true;

    // Create context element
    if (typeof rulesElement === 'string') {
      if (isBrowser()) {
        const doc = getDocument();
        const el = doc?.querySelector(rulesElement);
        this.options.context = el ? new NaturalElement(el) : null;
      }
    } else if (rulesElement instanceof NaturalElement) {
      this.options.context = rulesElement;
    } else if (isElement(rulesElement)) {
      this.options.context = new NaturalElement(rulesElement);
    }

    const ctx = this.options.context;
    if (!ctx) {
      return;
    }

    // Find input elements
    const isInput = ctx.is('input, select, textarea');
    let targetElements: NaturalElement;

    if (isInput) {
      targetElements = ctx;
    } else {
      targetElements = ctx.find('input, select, textarea');
    }

    // Filter elements with data-validate attribute
    const validElements: Element[] = [];
    targetElements.each((_index, el) => {
      const naturalEl = new NaturalElement(el);
      if (naturalEl.data('validate') !== undefined) {
        validElements.push(el);

        // Set up validation event if needed
        if (this.options.createEvent) {
          naturalEl.off('validate.validator');
          naturalEl.on('validate.validator', () => {
            const singleValidator = new Validator(this.originalData, naturalEl);
            singleValidator.validate();
          });
        }
      }
    });

    this.options.targetElements = new NaturalElement(validElements);

    // Extract rules from elements
    this.options.rules = element.toRules(validElements, 'validate') as ValidationRules;

    // If no data provided, extract from elements
    if (this.originalData.length === 0 && validElements.length > 0) {
      const extractedData = element.toData(validElements);
      if (extractedData) {
        this.options.data = [extractedData as DataRow];
        this.originalData = this.options.data;
      }
    }
  }

  /**
   * Validates the data according to the rules.
   *
   * @param row - Optional specific row index to validate
   * @returns Array of validation results for each row
   *
   * @example
   * const validator = new Validator(data, rules);
   * const results = validator.validate(); // Validate all rows
   * const singleRowResults = validator.validate(0); // Validate first row only
   */
  validate(row?: number): RowValidationResult[] {
    const opts = this.options;
    const retArr: RowValidationResult[] = [];
    let dataToValidate = opts.data;

    // Handle row index
    if (row !== undefined) {
      if (row < opts.data.length && row >= 0) {
        const rowData = opts.data[row];
        if (rowData) {
          dataToValidate = [rowData];
        }
      } else {
        throw new Error('[Validator.validate] Row index out of range');
      }
    } else {
      if (opts.isElement && opts.data.length > 0) {
        row = 0;
        const firstRow = opts.data[0];
        if (firstRow) {
          dataToValidate = [firstRow];
        }
      }
    }

    // Validate each row
    for (const rowData of dataToValidate) {
      const retObj: RowValidationResult = {};

      for (const key in opts.rules) {
        if (!Object.prototype.hasOwnProperty.call(opts.rules, key)) {
          continue;
        }

        const fieldResults: FieldValidationResult = [];
        let fieldPass = true;
        const rules = opts.rules[key];
        if (!rules) continue;

        // Check if 'required' rule exists for this field
        const hasRequired = rules.some((r) => {
          const ruleName = Array.isArray(r) ? String(r[0]) : String(r);
          return ruleName.toLowerCase() === 'required';
        });

        for (const rule of rules) {
          const result: ValidationRuleResult = {
            rule: Array.isArray(rule) ? rule.join(',') : String(rule),
            result: true,
            msg: null,
          };

          let ruleName = Array.isArray(rule) ? String(rule[0]) : String(rule);
          const ruleArgs: ValidationRuleArgs = Array.isArray(rule) ? rule.slice(1) : [];

          // Normalize rule name (lowercase, handle combined rules like 'alphabet+integer')
          ruleName = string.trimToEmpty(ruleName).toLowerCase();
          if (ruleName.indexOf('+') > -1) {
            ruleName = ruleName.split('+').sort().join('_');
          }

          try {
            const fieldValue = string.trimToEmpty(String(rowData[key] ?? ''));

            // Skip validation if field is empty and not required
            if (!hasRequired && ruleName !== 'required' && string.isEmpty(fieldValue)) {
              result.result = true;
            } else {
              const ruleFn = getValidationRule(ruleName, this.userRules);
              if (!ruleFn) {
                throw new Error(`"${ruleName}" is not a valid validation rule`);
              }
              result.result = ruleFn(fieldValue, ruleArgs);
            }
          } catch (e) {
            const error = e as Error;
            if (error.message.indexOf('is not a function') > -1) {
              throw new Error(
                `[Validator.validate] "${ruleName}" is invalid validation rule: ${error.message}`
              );
            } else {
              throw new Error(`[Validator.validate] ${error.message}`);
            }
          }

          // Set error message if validation failed
          if (!result.result) {
            result.msg = getValidationMessage(ruleName, ruleArgs);
            fieldPass = false;
          }

          fieldResults.push(result);
        }

        retObj[key] = fieldResults;

        // Update DOM element if element-based
        if (opts.isElement && opts.targetElements) {
          this.updateElementValidationState(key, fieldPass, fieldResults, row ?? 0);
        }
      }

      retArr.push(retObj);
    }

    return retArr;
  }

  /**
   * Updates the validation state of a DOM element.
   */
  private updateElementValidationState(
    key: string,
    passed: boolean,
    results: FieldValidationResult,
    _row: number
  ): void {
    if (!this.options.targetElements) return;

    // Find the target element
    let targetElement: NaturalElement;
    const isRadioOrCheckbox = this.options.targetElements.is('input[type="radio"], input[type="checkbox"]');

    if (isRadioOrCheckbox) {
      targetElement = this.options.targetElements.filter(`[name="${key}"].select_template__`);
    } else {
      targetElement = this.options.targetElements.filter(`#${key}`);
    }

    if (targetElement.length === 0) return;

    if (!passed) {
      // Add validation failed class
      targetElement.addClass('validate_false__');

      // Collect error messages
      const errorMessages = results
        .filter((r) => r.msg !== null)
        .map((r) => r.msg as string);

      // Store error messages on element for Alert integration
      targetElement.data('validationErrors', errorMessages);

      // Trigger custom event for Alert integration
      targetElement.trigger('validationFailed', { messages: errorMessages });
    } else {
      // Remove validation failed class
      targetElement.removeClass('validate_false__');
      targetElement.removeData('validationErrors');

      // Trigger custom event for Alert integration
      targetElement.trigger('validationPassed');
    }
  }

  /**
   * Checks if all validations passed.
   *
   * @param results - Validation results from validate()
   * @returns true if all validations passed
   */
  static isValid(results: RowValidationResult[]): boolean {
    for (const row of results) {
      for (const field in row) {
        if (Object.prototype.hasOwnProperty.call(row, field)) {
          const fieldResults = row[field];
          if (!fieldResults) continue;
          for (const result of fieldResults) {
            if (!result.result) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  /**
   * Gets all error messages from validation results.
   *
   * @param results - Validation results from validate()
   * @returns Array of error messages
   */
  static getErrors(results: RowValidationResult[]): string[] {
    const errors: string[] = [];
    for (const row of results) {
      for (const field in row) {
        if (Object.prototype.hasOwnProperty.call(row, field)) {
          const fieldResults = row[field];
          if (!fieldResults) continue;
          for (const result of fieldResults) {
            if (!result.result && result.msg) {
              errors.push(result.msg);
            }
          }
        }
      }
    }
    return errors;
  }

  /**
   * Gets the validation rules.
   */
  getRules(): ValidationRules {
    return this.options.rules;
  }

  /**
   * Gets the original data.
   */
  getData(): DataRow[] {
    return this.originalData;
  }

  /**
   * Sets whether to create validation events.
   */
  setCreateEvent(createEvent: boolean): this {
    this.options.createEvent = createEvent;
    return this;
  }

  /**
   * Adds a user-defined validation rule.
   *
   * @param name - Rule name
   * @param fn - Rule function
   * @returns this for chaining
   */
  addRule(name: string, fn: ValidationRuleFunction): this {
    this.userRules[name.toLowerCase()] = fn;
    return this;
  }

  /**
   * Removes a user-defined validation rule.
   *
   * @param name - Rule name to remove
   * @returns this for chaining
   */
  removeRule(name: string): this {
    delete this.userRules[name.toLowerCase()];
    return this;
  }
}

/**
 * Factory function to create a Validator instance.
 *
 * @param data - Data to validate
 * @param rules - Validation rules
 * @param userRules - Optional user-defined rules
 * @returns A new Validator instance
 */
export function createValidator(
  data: DataRow[] | NaturalElement | Record<string, unknown>,
  rules: ValidationRules | string | Element | NaturalElement,
  userRules?: UserValidationRules
): Validator {
  return new Validator(data, rules, userRules);
}

/**
 * Standalone validate function for simple validation without creating an instance.
 *
 * @param value - Value to validate
 * @param ruleName - Name of the validation rule
 * @param args - Optional arguments for the rule
 * @param userRules - Optional user-defined rules
 * @returns Whether the validation passed
 *
 * @example
 * validateValue('test@example.com', 'email'); // true
 * validateValue('50', 'rangevalue', [0, 100]); // true
 */
export function validateValue(
  value: string | number | null | undefined,
  ruleName: string,
  args?: ValidationRuleArgs,
  userRules?: UserValidationRules
): boolean {
  const strValue = string.trimToEmpty(String(value ?? ''));
  const ruleFn = getValidationRule(ruleName.toLowerCase(), userRules);

  if (!ruleFn) {
    throw new Error(`[validateValue] "${ruleName}" is not a valid validation rule`);
  }

  return ruleFn(strValue, args);
}

/**
 * All built-in validation rule functions for direct access.
 */
export const rules = builtInRules;

