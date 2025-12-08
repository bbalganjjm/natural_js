/**
 * Form component for Natural-JS.
 * Provides two-way data binding between data objects and form elements.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { isString, isArray, isFunction, isPlainObject, element } from '@natural-js/core';
import { Formatter, Validator, type FormatRules, type ValidationRules } from '@natural-js/data';
import { FormOptions, FormUserOptions, FormDataRow, RowStatus } from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<FormOptions> = {
  data: [],
  row: -1,
  beforeRow: -1,
  html: false,
  validate: true,
  fRules: null,
  vRules: null,
  revert: true,
  unbind: false,
  cache: true,
  dataSync: true,
};

/**
 * Form component for data binding to form elements.
 */
export class Form {
  public options: FormOptions;

  constructor(
    data: FormDataRow[] | NaturalElement | Element | string,
    optsOrContext?: FormUserOptions | NaturalElement | Element | string
  ) {
    if (!isBrowser()) {
      this.options = {} as FormOptions;
      return;
    }

    let contextEl: NaturalElement;
    let dataArray: FormDataRow[];

    // Handle different constructor signatures
    if (isArray(data)) {
      dataArray = data;
      if (optsOrContext instanceof NaturalElement) {
        contextEl = optsOrContext;
      } else if (isString(optsOrContext)) {
        contextEl = new NaturalElement(optsOrContext);
      } else if (optsOrContext instanceof Element) {
        contextEl = new NaturalElement(optsOrContext);
      } else if (isPlainObject(optsOrContext)) {
        const opts = optsOrContext as FormUserOptions;
        if (opts.context) {
          contextEl = opts.context instanceof NaturalElement ? opts.context : new NaturalElement(opts.context as string);
        } else {
          contextEl = new NaturalElement([]);
        }
      } else {
        contextEl = new NaturalElement([]);
      }
    } else {
      // data is context element
      dataArray = [];
      if (data instanceof NaturalElement) {
        contextEl = data;
      } else if (isString(data)) {
        contextEl = new NaturalElement(data);
      } else {
        contextEl = new NaturalElement(data as Element);
      }
    }

    const userOpts = isPlainObject(optsOrContext) ? (optsOrContext as FormUserOptions) : {};

    // Extract declarative format/validate rules from data-* attributes
    const inputElements = contextEl.find('input, select, textarea');
    const declarativeFRules = element.toRules(
      inputElements.get(),
      'format'
    ) as unknown as FormatRules | undefined;
    const declarativeVRules = element.toRules(
      inputElements.get(),
      'validate'
    ) as unknown as ValidationRules | undefined;

    const mergedFRules: FormatRules | null =
      (userOpts.fRules as FormatRules | undefined) ||
      (declarativeFRules && Object.keys(declarativeFRules).length > 0 ? declarativeFRules : null);

    const mergedVRules: ValidationRules | null =
      (userOpts.vRules as ValidationRules | undefined) ||
      (declarativeVRules && Object.keys(declarativeVRules).length > 0 ? declarativeVRules : null);

    // Apply vRules to dataset when provided to keep Validator element flow working
    if (mergedVRules) {
      for (const key in mergedVRules) {
        const rules = mergedVRules[key];
        if (!rules) continue;
        let el = contextEl.find(`#${key}`);
        if (el.length === 0) {
          el = contextEl.find(`[name="${key}"]`);
        }
        if (el.length === 0) {
          el = contextEl.find(`[data-bind="${key}"]`);
        }
        if (el.length > 0 && el.get(0)) {
          const target = el.get(0) as HTMLElement;
          if (!target.dataset.validate) {
            target.dataset.validate = JSON.stringify(rules);
          }
        }
      }
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      ...userOpts,
      context: contextEl,
      data: dataArray,
      row: -1,
      beforeRow: -1,
      elementCache: new Map(),
      fRules: mergedFRules,
      vRules: mergedVRules,
    } as FormOptions;

    // Add form class
    contextEl.addClass('form__');

    // Store reference
    contextEl.data('form', this);
  }

  /**
   * Returns the latest data bound to the component.
   */
  data(): FormDataRow[];
  data(selFlag: true, ...cols: string[]): FormDataRow[];
  data(selFlag: false): FormDataRow[];
  data(selFlag?: boolean | undefined, ...cols: string[]): FormDataRow[] {
    if (selFlag === undefined) {
      return this.options.data;
    }
    if (selFlag === false) {
      return this.options.data;
    }
    // selFlag === true: return current row data only (excluding internal properties)
    const currentData = this.options.data[this.options.row];
    if (!currentData) return [];

    // Create a copy without internal properties
    const cleanData: FormDataRow = {};
    for (const key in currentData) {
      if (key !== '__originalData__' && (cols.length === 0 || cols.includes(key))) {
        cleanData[key] = currentData[key];
      }
    }
    return [cleanData];
  }

  /**
   * Returns the current row index.
   */
  row(before?: 'before'): number {
    if (before === 'before') {
      return this.options.beforeRow;
    }
    return this.options.row;
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Bind data to elements within the context.
   */
  bind(row: number, data?: FormDataRow[] | FormDataRow, ...cols: string[]): this {
    const opts = this.options;

    // Update data if provided
    if (data !== undefined) {
      if (isArray(data)) {
        opts.data = data;
      } else if (isPlainObject(data)) {
        // Single row data - update or set at index
        const existing = opts.data[row];
        if (existing) {
          Object.assign(existing, data);
        } else {
          opts.data[row] = data;
        }
      }
    }

    // Validate row index
    if (row < 0 || row >= opts.data.length) {
      if (opts.data.length > 0) {
        row = 0;
      } else {
        return this;
      }
    }

    const rowData = opts.data[row];
    if (!rowData) return this;

    // Call onBeforeBind
    if (opts.onBeforeBind) {
      const result = opts.onBeforeBind(row, rowData);
      if (result === false) return this;
    }

    // Store original data for revert if enabled
    if (opts.revert && !rowData.__originalData__) {
      rowData.__originalData__ = { ...rowData };
    }

    opts.beforeRow = opts.row;
    opts.row = row;

    // Bind data to elements
    const keysToUpdate = cols.length > 0 ? cols : Object.keys(rowData);

    for (const key of keysToUpdate) {
      if (key === 'rowStatus' || key === '__originalData__') continue;

      const value = rowData[key];
      this.bindElement(key, value);
    }

    // Call onBind
    if (opts.onBind) {
      opts.onBind(row, rowData);
    }

    return this;
  }

  /**
   * Bind a single value to an element.
   */
  private bindElement(key: string, value: unknown): void {
    const opts = this.options;
    let el: NaturalElement;

    // Try to find from cache first
    if (opts.cache && opts.elementCache?.has(key)) {
      el = opts.elementCache.get(key)!;
    } else {
      // Find element by id, name, or data-bind attribute
      el = opts.context.find(`#${key}`);
      if (el.length === 0) {
        el = opts.context.find(`[name="${key}"]`);
      }
      if (el.length === 0) {
        el = opts.context.find(`[data-bind="${key}"]`);
      }

      // Cache the element
      if (opts.cache && el.length > 0) {
        opts.elementCache?.set(key, el);
      }
    }

    if (el.length === 0) return;

    const firstEl = el.get(0);
    if (!firstEl) return;

    const tagName = firstEl.tagName.toLowerCase();
    const formattedValue = this.applyFormat(key, value);
    const valueStr = formattedValue === null || formattedValue === undefined ? '' : String(formattedValue);

    if (tagName === 'input') {
      const inputEl = firstEl as HTMLInputElement;
      const type = inputEl.type.toLowerCase();

      if (type === 'checkbox') {
        inputEl.checked = value === true || value === 'Y' || value === '1' || value === inputEl.value;
      } else if (type === 'radio') {
        // Handle radio buttons - find the one with matching value
        el.each((_, radioEl) => {
          const radio = radioEl as HTMLInputElement;
          radio.checked = radio.value === valueStr;
        });
      } else {
        inputEl.value = valueStr;
      }
    } else if (tagName === 'select') {
      (firstEl as HTMLSelectElement).value = valueStr;
    } else if (tagName === 'textarea') {
      (firstEl as HTMLTextAreaElement).value = valueStr;
    } else {
      if (opts.html) {
        el.html(valueStr);
      } else {
        el.text(valueStr);
      }
    }

    // Bind change events for two-way binding
    if (!el.data('formBound')) {
      this.bindChangeEvent(el, key);
      el.data('formBound', true);
    }
  }

  /**
   * Bind change event for two-way data binding.
   */
  private bindChangeEvent(el: NaturalElement, key: string): void {
    const self = this;
    const opts = this.options;

    el.on('change.form input.form', function (this: Element) {
      const currentEl = this as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      const rowData = opts.data[opts.row];
      if (!rowData) return;

      const oldValue = rowData[key];
      let newValue: unknown;

      if (currentEl.type === 'checkbox') {
        newValue = (currentEl as HTMLInputElement).checked;
      } else {
        newValue = currentEl.value;
      }

      // Update data
      rowData[key] = newValue;

      // Mark as updated
      if (!rowData.rowStatus) {
        rowData.rowStatus = 'update';
      }

      // Call onChange callback
      if (opts.onChange) {
        opts.onChange(key, newValue, opts.row, oldValue);
      }

      // Notify DataSync
      if (opts.dataSync) {
        self.update(opts.row, key);
      }
    });
  }

  /**
   * Add a new row.
   */
  add(data?: number | FormDataRow, row?: number): this {
    const opts = this.options;

    // Handle overloaded arguments
    let insertRow: number;
    let newData: FormDataRow;

    if (typeof data === 'number') {
      insertRow = data;
      newData = this.createEmptyRow();
    } else {
      newData = data ? { ...data } : this.createEmptyRow();
      insertRow = row ?? opts.data.length;
    }

    // Mark as insert
    newData.rowStatus = 'insert';

    // Store original for revert
    if (opts.revert) {
      newData.__originalData__ = { ...newData };
    }

    // Insert at position
    if (insertRow >= opts.data.length) {
      opts.data.push(newData);
      insertRow = opts.data.length - 1;
    } else {
      opts.data.splice(insertRow, 0, newData);
    }

    // Call onAdd
    if (opts.onAdd) {
      opts.onAdd(insertRow, newData);
    }

    // Bind to new row
    this.bind(insertRow);

    return this;
  }

  /**
   * Create an empty row based on context elements.
   */
  private createEmptyRow(): FormDataRow {
    const opts = this.options;
    const row: FormDataRow = {};

    // Find all input elements with id or name
    opts.context.find('input, select, textarea').each((_, el) => {
      const element = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      const key = element.id || element.name;
      if (key) {
        if (element.type === 'checkbox') {
          row[key] = false;
        } else {
          row[key] = '';
        }
      }
    });

    // Find elements with data-bind
    opts.context.find('[data-bind]').each((_, el) => {
      const key = (el as HTMLElement).getAttribute('data-bind');
      if (key && !(key in row)) {
        row[key] = '';
      }
    });

    return row;
  }

  /**
   * Remove the current row.
   */
  remove(): this {
    const opts = this.options;
    const row = opts.row;
    const rowData = opts.data[row];

    if (!rowData) return this;

    // Call onRemove
    if (opts.onRemove) {
      opts.onRemove(row, rowData);
    }

    if (rowData.rowStatus === 'insert') {
      // Remove completely if it was inserted
      opts.data.splice(row, 1);
    } else {
      // Mark as deleted
      rowData.rowStatus = 'delete';
    }

    // Update row index
    if (opts.row >= opts.data.length) {
      opts.row = opts.data.length - 1;
    }

    // Rebind if there's data
    if (opts.row >= 0) {
      this.bind(opts.row);
    }

    return this;
  }

  /**
   * Revert to original data.
   */
  revert(): this {
    const opts = this.options;
    const rowData = opts.data[opts.row];

    if (!rowData || !rowData.__originalData__) return this;

    // Restore original data
    const original = rowData.__originalData__;
    for (const key in original) {
      if (key !== '__originalData__' && key !== 'rowStatus') {
        rowData[key] = original[key];
      }
    }

    // Reset status
    if (rowData.rowStatus === 'update') {
      rowData.rowStatus = undefined;
    }

    // Rebind
    this.bind(opts.row);

    return this;
  }

  /**
   * Validate all form fields.
   */
  validate(): boolean {
    const opts = this.options;
    const rowData = opts.data[opts.row];
    if (!rowData) return true;

    // If declarative/option rules exist, use Validator
    if (opts.vRules && Object.keys(opts.vRules).length > 0) {
      const validator = new Validator(opts.data, opts.vRules);
      const results = validator.validate(opts.row);
      return Validator.isValid(results);
    }

    // Fallback: required attribute check
    let isValid = true;
    opts.context.find('[required]').each((_, el) => {
      const elementNode = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      const key = elementNode.id || elementNode.name;
      const value = rowData[key];
      if (value === undefined || value === null || value === '') {
        isValid = false;
        new NaturalElement(elementNode).addClass('form_invalid__');
      } else {
        new NaturalElement(elementNode).removeClass('form_invalid__');
      }
    });

    return isValid;
  }

  /**
   * Get or set a value.
   */
  val(key: string): unknown;
  val(key: string, value: unknown, notify?: boolean): this;
  val(key: string, value?: unknown, notify?: boolean): unknown | this {
    const opts = this.options;
    const rowData = opts.data[opts.row];

    if (value === undefined) {
      // Getter
      return rowData?.[key];
    }

    // Setter
    if (!rowData) return this;

    const oldValue = rowData[key];
    rowData[key] = value;

    // Mark as updated
    if (!rowData.rowStatus) {
      rowData.rowStatus = 'update';
    }

    // Update element
    this.bindElement(key, value);

    // Call onChange
    if (opts.onChange) {
      opts.onChange(key, value, opts.row, oldValue);
    }

    // Notify DataSync
    if (notify !== false && opts.dataSync) {
      this.update(opts.row, key);
    }

    return this;
  }

  /**
   * Apply formatting rules to a single value if configured.
   */
  private applyFormat(key: string, value: unknown): unknown {
    const rules = this.options.fRules?.[key];
    if (!rules) return value;

    try {
      const formatter = new Formatter([{ [key]: value }], { [key]: rules } as FormatRules);
      const formatted = formatter.format(0);
      return formatted[0]?.[key];
    } catch (_e) {
      return value;
    }
  }

  /**
   * Update notification for DataSync.
   */
  update(row: number, key?: string): this {
    // This would integrate with DataSync
    // For now, just a placeholder
    return this;
  }

  /**
   * Unbind and clean up.
   */
  unbind(): void {
    const opts = this.options;

    // Remove change events
    opts.context.find('input, select, textarea, [data-bind]').each((_, el) => {
      const element = new NaturalElement(el);
      element.off('change.form input.form');
      element.removeData('formBound');
    });

    // Clear cache
    opts.elementCache?.clear();
  }

  /**
   * Destroy the form instance.
   */
  destroy(): void {
    this.unbind();

    const opts = this.options;
    opts.context.removeClass('form__');
    opts.context.removeData('form');
    opts.data = [];
    opts.row = -1;
    opts.beforeRow = -1;
  }
}

/**
 * Factory function to create a Form instance.
 */
export function createForm(
  data: FormDataRow[] | NaturalElement | Element | string,
  optsOrContext?: FormUserOptions | NaturalElement | Element | string
): Form {
  return new Form(data, optsOrContext);
}

