/**
 * Type definitions for the Formatter module.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * A single format rule definition.
 * Can be a string (rule name) or an array where the first element is the rule name
 * and subsequent elements are arguments.
 *
 * @example
 * 'commas'
 * ['date', 8]
 * ['mask', 'phone', '*']
 */
export type FormatRule = string | [string, ...unknown[]];

/**
 * Format rules for multiple fields.
 * Keys are field names, values are arrays of format rules.
 *
 * @example
 * {
 *   price: [['commas']],
 *   phone: [['phone']],
 *   birthDate: [['date', 8]]
 * }
 */
export type FormatRules = Record<string, FormatRule[]>;

/**
 * A single formatted result for one field.
 */
export type FormattedValue = string | number | null | undefined;

/**
 * A formatted row object.
 */
export type FormattedRow = Record<string, FormattedValue>;

/**
 * Data row type.
 */
export type DataRow = Record<string, unknown>;

/**
 * Arguments passed to a format rule function.
 */
export type FormatRuleArgs = unknown[];

/**
 * Format rule function signature.
 *
 * @param value - The value to format
 * @param args - Additional arguments for the rule
 * @param element - Optional DOM element for element-based formatting
 * @returns The formatted value
 */
export type FormatRuleFunction = (
  value: string,
  args?: FormatRuleArgs,
  element?: NaturalElement | Element | null
) => string;

/**
 * User-defined format rules.
 */
export type UserFormatRules = Record<string, FormatRuleFunction>;

/**
 * Options for the Formatter class.
 */
export interface FormatterOptions {
  /** The data to format */
  data: DataRow[];
  /** Format rules for each field */
  rules: FormatRules;
  /** Whether the formatter is element-based */
  isElement: boolean;
  /** Whether to create format/unformat events on elements */
  createEvent: boolean;
  /** The context element for element-based formatting */
  context: NaturalElement | null;
  /** Target elements for formatting */
  targetElements: NaturalElement | null;
}

/**
 * Date format configuration.
 */
export interface DateFormatConfig {
  /** Date separator (e.g., '-', '/') */
  dateSepa: string;
  /** Time separator (e.g., ':') */
  timeSepa: string;
  /** Format for Year-Month */
  Ym: () => string;
  /** Format for Year-Month-Day */
  Ymd: () => string;
  /** Format for Year-Month-Day Hour */
  YmdH: () => string;
  /** Format for Year-Month-Day Hour:Minute */
  YmdHi: () => string;
  /** Format for Year-Month-Day Hour:Minute:Second */
  YmdHis: () => string;
}

/**
 * Mask types for the mask format rule.
 */
export type MaskType = 'phone' | 'email' | 'address' | 'name' | 'rrn';

/**
 * Date picker options for date formatting.
 */
export interface DatepickerIntegrationOptions {
  /** Whether it's month-only picker */
  monthonly?: boolean;
  /** Additional datepicker options */
  [key: string]: unknown;
}

