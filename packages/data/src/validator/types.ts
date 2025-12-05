/**
 * Type definitions for the Validator module.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * A single validation rule definition.
 * Can be a string (rule name) or an array where the first element is the rule name
 * and subsequent elements are arguments.
 *
 * @example
 * 'required'
 * ['maxlength', 100]
 * ['rangevalue', 0, 100]
 */
export type ValidationRule = string | [string, ...unknown[]];

/**
 * Validation rules for multiple fields.
 * Keys are field names, values are arrays of validation rules.
 *
 * @example
 * {
 *   username: [['required'], ['maxlength', 50]],
 *   email: [['required'], ['email']],
 *   age: [['integer'], ['rangevalue', 0, 150]]
 * }
 */
export type ValidationRules = Record<string, ValidationRule[]>;

/**
 * Result of a single validation rule check.
 */
export interface ValidationRuleResult {
  /** The rule that was applied */
  rule: string;
  /** Whether the validation passed */
  result: boolean;
  /** Error message if validation failed */
  msg: string | null;
}

/**
 * Validation result for a single field.
 */
export type FieldValidationResult = ValidationRuleResult[];

/**
 * Validation result for a single row.
 */
export type RowValidationResult = Record<string, FieldValidationResult>;

/**
 * Data row type.
 */
export type DataRow = Record<string, unknown>;

/**
 * Arguments passed to a validation rule function.
 */
export type ValidationRuleArgs = unknown[];

/**
 * Validation rule function signature.
 *
 * @param value - The value to validate
 * @param args - Additional arguments for the rule
 * @returns Whether the validation passed
 */
export type ValidationRuleFunction = (value: string, args?: ValidationRuleArgs) => boolean;

/**
 * User-defined validation rules.
 */
export type UserValidationRules = Record<string, ValidationRuleFunction>;

/**
 * Options for the Validator class.
 */
export interface ValidatorOptions {
  /** The data to validate */
  data: DataRow[];
  /** Validation rules for each field */
  rules: ValidationRules;
  /** Whether the validator is element-based */
  isElement: boolean;
  /** Whether to create validation events on elements */
  createEvent: boolean;
  /** The context element for element-based validation */
  context: NaturalElement | null;
  /** Target elements for validation */
  targetElements: NaturalElement | null;
}

/**
 * Validation messages for different locales.
 */
export interface ValidationMessages {
  global?: string;
  required?: string;
  alphabet?: string;
  integer?: string;
  korean?: string;
  alphabet_integer?: string;
  integer_korean?: string;
  alphabet_korean?: string;
  alphabet_integer_korean?: string;
  dash_integer?: string;
  commas_integer?: string;
  number?: string;
  email?: string;
  url?: string;
  zipcode?: string;
  decimal?: string;
  decimal_?: string;
  phone?: string;
  rrn?: string;
  ssn?: string;
  frn?: string;
  frn_rrn?: string;
  kbrn?: string;
  kcn?: string;
  date?: string;
  time?: string;
  accept?: string;
  match?: string;
  acceptFileExt?: string;
  notAccept?: string;
  notMatch?: string;
  notAcceptFileExt?: string;
  equalTo?: string;
  maxlength?: string;
  minlength?: string;
  rangelength?: string;
  maxbyte?: string;
  minbyte?: string;
  rangebyte?: string;
  maxvalue?: string;
  minvalue?: string;
  rangevalue?: string;
  regexp?: string;
  [key: string]: string | undefined;
}

/**
 * Localized validation messages.
 */
export type LocalizedValidationMessages = Record<string, ValidationMessages>;

/**
 * Validation context for combined rules like alphabet+integer.
 */
export type CombinedRuleType =
  | 'alphabet_integer'
  | 'integer_korean'
  | 'alphabet_korean'
  | 'alphabet_integer_korean';

