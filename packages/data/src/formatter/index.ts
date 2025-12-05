/**
 * Formatter module for Natural-JS.
 * Provides data formatting capabilities with built-in and custom rules.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { string, isPlainObject, isString, isElement, element } from '@natural-js/core';
import {
  FormatRules,
  FormattedRow,
  DataRow,
  FormatRule,
  FormatterOptions,
  FormatRuleFunction,
  FormatRuleArgs,
  UserFormatRules,
} from './types';
import { builtInRules, getFormatRule } from './rules';

// Re-export types and rules
export * from './types';
export * from './rules';

/**
 * Formatter class for formatting data according to specified rules.
 * Equivalent to ND.formatter in the original framework.
 *
 * @example
 * // With data array and rules object
 * const formatter = new Formatter([{ price: 1234567, date: '20231225' }], {
 *   price: [['commas']],
 *   date: [['date', 8]]
 * });
 * const result = formatter.format(); // [{ price: '1,234,567', date: '2023-12-25' }]
 *
 * @example
 * // With DOM element
 * const formatter = new Formatter(data, '#myForm');
 * formatter.format(0); // Formats and updates DOM elements
 */
export class Formatter {
  /** Formatter options */
  private options: FormatterOptions;
  /** User-defined format rules */
  private userRules: UserFormatRules = {};
  /** Original data reference for unformat */
  private originalData: DataRow[];

  /**
   * Creates a new Formatter instance.
   *
   * @param data - Data to format (array of objects or NaturalElement)
   * @param rules - Format rules object or element selector for element-based formatting
   * @param userRules - Optional user-defined format rules
   */
  constructor(
    data: DataRow[] | NaturalElement | Record<string, unknown>,
    rules: FormatRules | string | Element | NaturalElement,
    userRules?: UserFormatRules
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
      rules: {} as FormatRules,
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
      this.initElementBasedFormatting(rules as string | Element);
    } else if (rules instanceof NaturalElement) {
      this.initElementBasedFormatting(rules);
    } else {
      this.options.rules = rules as FormatRules;
    }
  }

  /**
   * Initialize element-based formatting.
   * Extracts format rules from data-format attributes.
   */
  private initElementBasedFormatting(
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

    const opts = this.options;
    const data = opts.data;
    const firstRow = data[0];

    if (data.length > 0 && firstRow) {
      const contextId = ctx.attr('id');

      // Find target elements
      const targetElements: Element[] = [];

      if (contextId && firstRow[contextId] !== undefined) {
        // Context itself is a target element
        const contextEl = ctx.get(0) as Element | undefined;
        if (contextEl) {
          targetElements.push(contextEl);
        }
      } else {
        // Find elements by data keys
        for (const key in firstRow) {
          if (Object.prototype.hasOwnProperty.call(firstRow, key)) {
            const found = ctx.find(`#${key}`);
            const el = found.get(0) as Element | undefined;
            if (el) {
              targetElements.push(el);
            }
          }
        }
      }

      opts.targetElements = new NaturalElement(targetElements);

      // Extract rules from elements
      opts.rules = element.toRules(targetElements, 'format') as FormatRules;
    }
  }

  /**
   * Formats the data according to the rules.
   *
   * @param row - Optional specific row index to format
   * @returns Array of formatted row objects
   *
   * @example
   * const formatter = new Formatter(data, rules);
   * const formatted = formatter.format(); // Format all rows
   * const singleRow = formatter.format(0); // Format first row only
   */
  format(row?: number): FormattedRow[] {
    const opts = this.options;
    const retArr: FormattedRow[] = [];
    let dataToFormat = opts.data;

    // Handle row index
    if (row !== undefined) {
      if (row < opts.data.length && row >= 0) {
        const rowData = opts.data[row];
        if (rowData) {
          dataToFormat = [rowData];
        }
      } else {
        throw new Error('[Formatter.format] Row index out of range');
      }
    } else {
      if (opts.isElement && opts.data.length > 0) {
        row = 0;
        const firstRow = opts.data[0];
        if (firstRow) {
          dataToFormat = [firstRow];
        }
      }
    }

    // Format each row
    for (const rowData of dataToFormat) {
      const retObj: FormattedRow = {};

      for (const key in opts.rules) {
        if (!Object.prototype.hasOwnProperty.call(opts.rules, key)) {
          continue;
        }

        let tempValue = string.trimToEmpty(String(rowData[key] ?? ''));
        let targetElement: NaturalElement | null = null;

        // Get target element for element-based formatting
        if (opts.isElement && opts.targetElements) {
          const filtered = opts.targetElements.filter(`#${key}`);
          if (filtered.length > 0) {
            targetElement = filtered;

            // Check for updated format rules in data attribute
            const dataFormat = targetElement.data('format');
            if (dataFormat !== undefined && opts.rules) {
              opts.rules[key] = dataFormat as FormatRule[];
            }
          }
        }

        // Apply each rule
        const rules = opts.rules[key];
        if (!rules) continue;
        for (const rule of rules) {
          try {
            const ruleName = Array.isArray(rule) ? String(rule[0]) : String(rule);
            const ruleArgs: FormatRuleArgs = Array.isArray(rule) ? rule.slice(1) : [];

            const ruleFn = getFormatRule(ruleName.toLowerCase(), this.userRules);
            if (!ruleFn) {
              throw new Error(`"${ruleName}" is not a valid format rule`);
            }

            tempValue = ruleFn(
              tempValue,
              ruleArgs,
              (targetElement?.get(0) as Element | undefined) || null
            );
          } catch (e) {
            const error = e as Error;
            if (error.message.indexOf('is not a function') > -1) {
              throw new Error(
                `[Formatter.format] "${Array.isArray(rule) ? rule[0] : rule}" is invalid format rule: ${error.message}`
              );
            } else {
              throw new Error(`[Formatter.format] ${error.message}`);
            }
          }
        }

        retObj[key] = tempValue;

        // Update DOM element if element-based
        if (opts.isElement && targetElement) {
          this.updateElement(targetElement, tempValue, row ?? 0, key);
        }
      }

      retArr.push(retObj);
    }

    return retArr;
  }

  /**
   * Updates a DOM element with the formatted value.
   */
  private updateElement(
    element: NaturalElement,
    value: string,
    row: number,
    key: string
  ): void {
    const el = element.get(0) as Element | undefined;
    if (!el) return;

    const tagName = el.tagName.toLowerCase();
    const inputType = el.getAttribute('type')?.toLowerCase();

    // Check if it's a text input or textarea
    if (
      (tagName === 'input' && (inputType === 'text' || inputType === 'tel')) ||
      tagName === 'textarea'
    ) {
      element.val(value);

      // Set up format/unformat events if needed
      if (this.options.createEvent) {
        this.setupFormatEvents(element, row, key);
      }
    } else if (tagName !== 'input' && tagName !== 'select' && tagName !== 'button') {
      // For non-input elements, set text content
      element.text(value);
    }
  }

  /**
   * Sets up format and unformat events on an element.
   */
  private setupFormatEvents(element: NaturalElement, row: number, key: string): void {
    const self = this;
    const opts = this.options;

    // Remove existing event handlers
    element.off('format.formatter');
    element.off('unformat.formatter');

    // Format event - reformat the value
    element.on('format.formatter', () => {
      const formattedValues = self.format();
      const actualRow = formattedValues.length === 1 ? 0 : row;
      const formatted = formattedValues[actualRow];
      if (formatted && formatted[key] !== undefined) {
        element.val(String(formatted[key]));
      }
    });

    // Unformat event - restore original value
    element.on('unformat.formatter', () => {
      const actualRow = opts.data.length === 1 ? 0 : row;
      const original = self.unformat(actualRow, key);
      element.val(String(original ?? ''));
    });
  }

  /**
   * Returns the original (unformatted) value from the data.
   *
   * @param row - The row index
   * @param key - The field key
   * @returns The original value
   *
   * @example
   * const formatter = new Formatter([{ price: 1234567 }], { price: [['commas']] });
   * formatter.format();
   * formatter.unformat(0, 'price'); // 1234567
   */
  unformat(row: number, key: string): unknown {
    return this.originalData[row]?.[key];
  }

  /**
   * Gets the formatted data.
   */
  getData(): FormattedRow[] {
    return this.format();
  }

  /**
   * Gets the original data.
   */
  getOriginalData(): DataRow[] {
    return this.originalData;
  }

  /**
   * Gets the format rules.
   */
  getRules(): FormatRules {
    return this.options.rules;
  }

  /**
   * Sets whether to create format/unformat events.
   */
  setCreateEvent(createEvent: boolean): this {
    this.options.createEvent = createEvent;
    return this;
  }

  /**
   * Adds a user-defined format rule.
   *
   * @param name - Rule name
   * @param fn - Rule function
   * @returns this for chaining
   */
  addRule(name: string, fn: FormatRuleFunction): this {
    this.userRules[name.toLowerCase()] = fn;
    return this;
  }

  /**
   * Removes a user-defined format rule.
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
 * Factory function to create a Formatter instance.
 *
 * @param data - Data to format
 * @param rules - Format rules
 * @param userRules - Optional user-defined rules
 * @returns A new Formatter instance
 */
export function createFormatter(
  data: DataRow[] | NaturalElement | Record<string, unknown>,
  rules: FormatRules | string | Element | NaturalElement,
  userRules?: UserFormatRules
): Formatter {
  return new Formatter(data, rules, userRules);
}

/**
 * Standalone format function for simple formatting without creating an instance.
 *
 * @param value - Value to format
 * @param ruleName - Name of the format rule
 * @param args - Optional arguments for the rule
 * @param userRules - Optional user-defined rules
 * @returns Formatted value
 *
 * @example
 * formatValue('1234567', 'commas'); // '1,234,567'
 * formatValue('20231225', 'date', [8]); // '2023-12-25'
 */
export function formatValue(
  value: string | number | null | undefined,
  ruleName: string,
  args?: FormatRuleArgs,
  userRules?: UserFormatRules
): string {
  const strValue = string.trimToEmpty(String(value ?? ''));
  const ruleFn = getFormatRule(ruleName.toLowerCase(), userRules);

  if (!ruleFn) {
    throw new Error(`[formatValue] "${ruleName}" is not a valid format rule`);
  }

  return ruleFn(strValue, args);
}

/**
 * All built-in format rule functions for direct access.
 */
export const rules = builtInRules;

