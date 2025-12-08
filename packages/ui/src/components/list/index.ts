/**
 * List component for Natural-JS.
 * Provides data binding and row management for list elements.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { isString, isArray, isFunction, isPlainObject, isNumeric, element } from '@natural-js/core';
import { Formatter, Validator, type FormatRules, type ValidationRules } from '@natural-js/data';
import { ListOptions, ListUserOptions, ListDataRow, RowStatus } from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<ListOptions> = {
  data: [],
  row: -1,
  beforeRow: -1,
  select: true,
  multiselect: false,
  html: false,
  validate: true,
  fRules: null,
  vRules: null,
  revert: true,
  dataSync: true,
  selectedClass: 'list_selected__',
  checkedClass: 'list_checked__',
  checkAll: false as const,
  checkAllTarget: 'input[type="checkbox"]',
  checkSingle: false as const,
  createRowDelay: 0,
  scrollPaging: false as const,
};

/**
 * List component for data-driven list rendering.
 */
export class List {
  public options: ListOptions;

  constructor(context: NaturalElement | Element | string, opts?: ListUserOptions) {
    if (!isBrowser()) {
      this.options = {} as ListOptions;
      return;
    }

    let contextEl: NaturalElement;
    if (context instanceof NaturalElement) {
      contextEl = context;
    } else if (isString(context)) {
      contextEl = new NaturalElement(context);
    } else {
      contextEl = new NaturalElement(context);
    }

    // Get template (first child as template)
    const template = contextEl.children().first();
    const rowTemplate = template.length > 0 ? template.clone(true) : null;
    
    // Clear template from context
    if (template.length > 0) {
      template.remove();
    }

    // Extract declarative format/validate rules from data-* attributes
    const bodyInputs = contextEl.find('input, select, textarea');
    const declarativeFRules = element.toRules(
      bodyInputs.get(),
      'format'
    ) as unknown as FormatRules | undefined;
    const declarativeVRules = element.toRules(
      bodyInputs.get(),
      'validate'
    ) as unknown as ValidationRules | undefined;

    const mergedFRules: FormatRules | null =
      (opts?.fRules as FormatRules | undefined) ||
      (declarativeFRules && Object.keys(declarativeFRules).length > 0 ? declarativeFRules : null);
    const mergedVRules: ValidationRules | null =
      (opts?.vRules as ValidationRules | undefined) ||
      (declarativeVRules && Object.keys(declarativeVRules).length > 0 ? declarativeVRules : null);

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
      ...opts,
      context: contextEl,
      rowTemplate,
      row: -1,
      beforeRow: -1,
      rowElements: [],
      isBinding: false,
      fRules: mergedFRules,
      vRules: mergedVRules,
    } as ListOptions;

    // Add list class
    contextEl.addClass('list__');

    // Set height if specified
    if (opts?.height) {
      contextEl.css('height', `${opts.height}px`);
      contextEl.css('overflow-y', 'auto');
    }

    // Initial bind if data provided
    if (opts?.data && opts.data.length > 0) {
      this.bind(opts.data);
    }

    // Store reference
    contextEl.data('list', this);
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Returns the body template.
   */
  contextBodyTemplate(): NaturalElement | null {
    return this.options.rowTemplate;
  }

  /**
   * Bind data to the list.
   */
  bind(data?: ListDataRow[], callback?: () => void): this {
    const opts = this.options;
    const doc = getDocument();
    if (!doc || !opts.rowTemplate) return this;

    // Call onBeforeBind first (before modifying data)
    if (opts.onBeforeBind) {
      const result = opts.onBeforeBind(opts.context, data ?? opts.data);
      if (result === false) return this;
    }

    if (data !== undefined) {
      opts.data = data;
    }

    opts.isBinding = true;

    // Clear existing rows
    opts.context.empty();
    opts.rowElements = [];

    // Render rows
    const renderCount = opts.scrollPaging ? opts.scrollPaging.size : opts.data.length;
    const endIndex = Math.min(renderCount, opts.data.length);

    for (let i = 0; i < endIndex; i++) {
      this.renderRow(i);
    }

    // Bind checkAll event
    if (opts.checkAll) {
      this.bindCheckAllEvent();
    }

    opts.isBinding = false;

    if (callback) {
      callback();
    }

    return this;
  }

  /**
   * Render a single row.
   */
  private renderRow(index: number): NaturalElement | null {
    const opts = this.options;
    const doc = getDocument();
    if (!doc || !opts.rowTemplate) return null;

    const rowData = opts.data[index];
    if (!rowData) return null;

    // Store original data for revert
    if (opts.revert && !rowData.__originalData__) {
      rowData.__originalData__ = { ...rowData };
    }
    rowData.__index__ = index;

    // Clone template
    const rowElement = opts.rowTemplate.clone(true);
    rowElement.addClass('list_row__');
    rowElement.data('index', index);

    // Bind data to row
    this.bindRowData(rowElement, rowData);

    // Bind row events
    this.bindRowEvents(rowElement, index);

    // Append to context
    opts.context.append(rowElement);
    opts.rowElements?.push(rowElement);

    // Call onBind
    if (opts.onBind) {
      opts.onBind(index, rowElement, rowData);
    }

    return rowElement;
  }

  /**
   * Bind data to row element.
   */
  private bindRowData(rowElement: NaturalElement, rowData: ListDataRow): void {
    const opts = this.options;

    for (const key in rowData) {
      if (key.startsWith('__') || key === 'rowStatus') continue;

      const value = rowData[key];
      const formattedValue = this.applyFormat(key, value);
      const valueStr = formattedValue === null || formattedValue === undefined ? '' : String(formattedValue);

      // Find element by id, name, or data-bind
      let el = rowElement.find(`#${key}`);
      if (el.length === 0) {
        el = rowElement.find(`[name="${key}"]`);
      }
      if (el.length === 0) {
        el = rowElement.find(`[data-bind="${key}"]`);
      }

      if (el.length === 0) continue;

      const firstEl = el.get(0);
      if (!firstEl) continue;

      const tagName = firstEl.tagName.toLowerCase();

      if (tagName === 'input') {
        const inputEl = firstEl as HTMLInputElement;
        const type = inputEl.type.toLowerCase();

        if (type === 'checkbox') {
          inputEl.checked = value === true || value === 'Y' || value === '1';
        } else if (type === 'radio') {
          inputEl.checked = inputEl.value === valueStr;
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
    }
  }

  /**
   * Validate list rows using configured rules or required attributes.
   */
  validate(row?: number): boolean {
    const opts = this.options;
    const hasRules = opts.vRules && Object.keys(opts.vRules).length > 0;

    if (hasRules) {
      const validator = new Validator(opts.data, opts.vRules as ValidationRules);
      const results = validator.validate(row);
      return Validator.isValid(results);
    }

    // Fallback: required attribute check on current rows
    const rowsToCheck = row === undefined ? opts.rowElements ?? [] : [opts.rowElements?.[row]].filter(Boolean);
    let isValid = true;
    rowsToCheck.forEach((rowEl) => {
      rowEl?.find('[required]').each((_, el) => {
        const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        const key = input.id || input.name;
        const rowIndex = rowEl.data('index') as number | undefined;
        const dataRow = rowIndex !== undefined ? opts.data[rowIndex] : undefined;
        const value = dataRow ? dataRow[key] : undefined;
        if (value === undefined || value === null || value === '') {
          isValid = false;
          new NaturalElement(input).addClass('list_invalid__');
        } else {
          new NaturalElement(input).removeClass('list_invalid__');
        }
      });
    });

    return isValid;
  }

  /**
   * Apply formatting rules to a value if present.
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
   * Bind events to row element.
   */
  private bindRowEvents(rowElement: NaturalElement, index: number): void {
    const opts = this.options;
    const self = this;

    // Click event for selection
    if (opts.select) {
      rowElement.on('click.list', (e: Event) => {
        const target = e.target as Element;
        // Don't select if clicking on checkbox/input
        if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
          return;
        }
        self.select(index, e);
      });
    }

    // Checkbox events
    if (opts.checkAllTarget) {
      rowElement.find(opts.checkAllTarget).on('change.list', (e: Event) => {
        const checkbox = e.target as HTMLInputElement;
        const rowData = opts.data[index];
        if (rowData) {
          rowData.__checked__ = checkbox.checked;
          if (checkbox.checked) {
            rowElement.addClass(opts.checkedClass || 'list_checked__');
          } else {
            rowElement.removeClass(opts.checkedClass || 'list_checked__');
          }
          if (opts.onCheck) {
            opts.onCheck(index, checkbox.checked, rowData);
          }
        }
      });
    }

    // Input change events for two-way binding
    rowElement.find('input, select, textarea').on('change.list', function (this: Element, e: Event) {
      const inputEl = this as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      const key = inputEl.id || inputEl.name || inputEl.getAttribute('data-bind');
      if (!key) return;

      const rowData = opts.data[index];
      if (!rowData) return;

      const oldValue = rowData[key];
      let newValue: unknown;

      if (inputEl.type === 'checkbox') {
        newValue = (inputEl as HTMLInputElement).checked;
      } else {
        newValue = inputEl.value;
      }

      rowData[key] = newValue;

      if (!rowData.rowStatus || rowData.rowStatus === 'normal') {
        rowData.rowStatus = 'update';
      }

      if (opts.onChange) {
        opts.onChange(index, key, newValue, oldValue);
      }
    });
  }

  /**
   * Bind checkAll event.
   */
  private bindCheckAllEvent(): void {
    const opts = this.options;
    if (!opts.checkAll) return;

    const self = this;
    const checkAllSelector = isString(opts.checkAll) ? opts.checkAll : '.list_check_all__';
    
    // Find checkAll in parent or document
    let checkAllEl = opts.context.parent().find(checkAllSelector);
    if (checkAllEl.length === 0) {
      checkAllEl = new NaturalElement(checkAllSelector);
    }

    checkAllEl.off('change.list').on('change.list', function (this: Element) {
      const checked = (this as HTMLInputElement).checked;
      self.checkAll(checked);
    });
  }

  /**
   * Get the data array.
   */
  data(): ListDataRow[];
  data(selFlag: true): ListDataRow[];
  data(selFlag: false): ListDataRow[];
  data(selFlag?: boolean): ListDataRow[] {
    const opts = this.options;

    if (selFlag === true) {
      // Return only selected/checked rows
      return opts.data.filter((row) => row.__selected__ || row.__checked__);
    }
    if (selFlag === false) {
      // Return all data without internal properties
      return opts.data.map((row) => {
        const clean: ListDataRow = {};
        for (const key in row) {
          if (!key.startsWith('__') && key !== 'rowStatus') {
            clean[key] = row[key];
          }
        }
        return clean;
      });
    }
    return opts.data;
  }

  /**
   * Get current selected row index.
   */
  row(before?: 'before'): number {
    if (before === 'before') {
      return this.options.beforeRow;
    }
    return this.options.row;
  }

  /**
   * Add a new row.
   */
  add(data?: ListDataRow | number, row?: number): this {
    const opts = this.options;

    let insertRow: number;
    let newData: ListDataRow;

    if (typeof data === 'number') {
      insertRow = data;
      newData = {};
    } else {
      newData = data ? { ...data } : {};
      insertRow = row ?? opts.data.length;
    }

    newData.rowStatus = 'insert';
    if (opts.revert) {
      newData.__originalData__ = { ...newData };
    }

    // Insert into data array
    if (insertRow >= opts.data.length) {
      opts.data.push(newData);
      insertRow = opts.data.length - 1;
    } else {
      opts.data.splice(insertRow, 0, newData);
      // Update indices
      for (let i = insertRow; i < opts.data.length; i++) {
        opts.data[i]!.__index__ = i;
      }
    }

    // Render new row
    const rowElement = this.renderRow(insertRow);
    if (rowElement && insertRow < opts.rowElements!.length - 1) {
      // Insert at correct position
      const nextRow = opts.rowElements![insertRow + 1];
      if (nextRow) {
        opts.context.get(0)?.insertBefore(rowElement.get(0)!, nextRow.get(0)!);
      }
    }

    if (opts.onAdd) {
      opts.onAdd(insertRow, newData);
    }

    return this;
  }

  /**
   * Remove a row.
   */
  remove(row?: number): this {
    const opts = this.options;
    const targetRow = row ?? opts.row;

    if (targetRow < 0 || targetRow >= opts.data.length) return this;

    const rowData = opts.data[targetRow];
    if (!rowData) return this;

    if (opts.onRemove) {
      opts.onRemove(targetRow, rowData);
    }

    if (rowData.rowStatus === 'insert') {
      // Completely remove if it was inserted
      opts.data.splice(targetRow, 1);
      opts.rowElements?.[targetRow]?.remove();
      opts.rowElements?.splice(targetRow, 1);
    } else {
      // Mark as deleted
      rowData.rowStatus = 'delete';
      opts.rowElements?.[targetRow]?.hide();
    }

    // Update row index
    if (opts.row >= opts.data.length) {
      opts.row = opts.data.length - 1;
    }

    return this;
  }

  /**
   * Select a row.
   */
  select(row: number, e?: Event): this {
    const opts = this.options;

    if (row < 0 || row >= opts.data.length) return this;

    const rowElement = opts.rowElements?.[row];
    const rowData = opts.data[row];
    if (!rowElement || !rowData) return this;

    // Call onBeforeSelect
    if (opts.onBeforeSelect) {
      const result = opts.onBeforeSelect(row, rowElement, rowData, e);
      if (result === false) return this;
    }

    // Deselect previous row
    if (!opts.multiselect && opts.row >= 0 && opts.row !== row) {
      const prevRow = opts.rowElements?.[opts.row];
      const prevData = opts.data[opts.row];
      if (prevRow && prevData) {
        prevRow.removeClass(opts.selectedClass || 'list_selected__');
        prevData.__selected__ = false;
      }
    }

    // Select current row
    rowElement.addClass(opts.selectedClass || 'list_selected__');
    rowData.__selected__ = true;
    opts.beforeRow = opts.row;
    opts.row = row;

    // Call onSelect
    if (opts.onSelect) {
      opts.onSelect(row, rowElement, rowData, e);
    }

    return this;
  }

  /**
   * Check a row.
   */
  check(row: number, checked?: boolean): this {
    const opts = this.options;

    if (row < 0 || row >= opts.data.length) return this;

    const rowElement = opts.rowElements?.[row];
    const rowData = opts.data[row];
    if (!rowElement || !rowData) return this;

    const checkbox = rowElement.find(opts.checkAllTarget || ':checkbox').get(0) as HTMLInputElement | undefined;
    const isChecked = checked ?? !rowData.__checked__;

    if (checkbox) {
      checkbox.checked = isChecked;
    }
    rowData.__checked__ = isChecked;

    if (isChecked) {
      rowElement.addClass(opts.checkedClass || 'list_checked__');
    } else {
      rowElement.removeClass(opts.checkedClass || 'list_checked__');
    }

    if (opts.onCheck) {
      opts.onCheck(row, isChecked, rowData);
    }

    return this;
  }

  /**
   * Check/uncheck all rows.
   */
  checkAll(checked: boolean): this {
    const opts = this.options;

    for (let i = 0; i < opts.data.length; i++) {
      this.check(i, checked);
    }

    return this;
  }

  /**
   * Get or set a value.
   */
  val(row: number, key: string): unknown;
  val(row: number, key: string, value: unknown): this;
  val(row: number, key: string, value?: unknown): unknown | this {
    const opts = this.options;
    const rowData = opts.data[row];

    if (value === undefined) {
      return rowData?.[key];
    }

    if (!rowData) return this;

    const oldValue = rowData[key];
    rowData[key] = value;

    if (!rowData.rowStatus || rowData.rowStatus === 'normal') {
      rowData.rowStatus = 'update';
    }

    // Update element
    const rowElement = opts.rowElements?.[row];
    if (rowElement) {
      this.bindRowData(rowElement, { [key]: value });
    }

    if (opts.onChange) {
      opts.onChange(row, key, value, oldValue);
    }

    return this;
  }

  /**
   * Revert a row to original data.
   */
  revert(row?: number): this {
    const opts = this.options;
    const targetRow = row ?? opts.row;

    if (targetRow < 0 || targetRow >= opts.data.length) return this;

    const rowData = opts.data[targetRow];
    if (!rowData || !rowData.__originalData__) return this;

    const original = rowData.__originalData__;
    for (const key in original) {
      if (!key.startsWith('__') && key !== 'rowStatus') {
        rowData[key] = original[key];
      }
    }

    if (rowData.rowStatus === 'update') {
      rowData.rowStatus = undefined;
    }

    // Re-render row
    const rowElement = opts.rowElements?.[targetRow];
    if (rowElement) {
      this.bindRowData(rowElement, rowData);
    }

    return this;
  }

  /**
   * Move a row.
   */
  move(fromRow: number, toRow: number): this {
    const opts = this.options;

    if (fromRow < 0 || fromRow >= opts.data.length) return this;
    if (toRow < 0 || toRow >= opts.data.length) return this;
    if (fromRow === toRow) return this;

    // Move data
    const [item] = opts.data.splice(fromRow, 1);
    if (item) {
      opts.data.splice(toRow, 0, item);
    }

    // Move element
    const rowElement = opts.rowElements?.[fromRow];
    if (rowElement) {
      opts.rowElements?.splice(fromRow, 1);
      opts.rowElements?.splice(toRow, 0, rowElement);

      const targetElement = opts.rowElements?.[toRow + (fromRow < toRow ? 1 : 0)];
      if (targetElement) {
        opts.context.get(0)?.insertBefore(rowElement.get(0)!, targetElement.get(0)!);
      } else {
        opts.context.append(rowElement);
      }
    }

    // Update indices
    for (let i = 0; i < opts.data.length; i++) {
      opts.data[i]!.__index__ = i;
      opts.rowElements?.[i]?.data('index', i);
    }

    return this;
  }

  /**
   * Copy a row.
   */
  copy(fromRow: number, toRow?: number): this {
    const opts = this.options;

    if (fromRow < 0 || fromRow >= opts.data.length) return this;

    const sourceData = opts.data[fromRow];
    if (!sourceData) return this;

    const newData: ListDataRow = {};
    for (const key in sourceData) {
      if (!key.startsWith('__') && key !== 'rowStatus') {
        newData[key] = sourceData[key];
      }
    }

    return this.add(newData, toRow);
  }

  /**
   * Get checked rows.
   */
  checked(): number[] {
    const opts = this.options;
    const checkedRows: number[] = [];

    for (let i = 0; i < opts.data.length; i++) {
      if (opts.data[i]?.__checked__) {
        checkedRows.push(i);
      }
    }

    return checkedRows;
  }

  /**
   * Update notification for DataSync.
   */
  update(row?: number, key?: string): this {
    // This would integrate with DataSync
    return this;
  }

  /**
   * Get row count.
   */
  count(): number {
    return this.options.data.length;
  }

  /**
   * Destroy the list instance.
   */
  destroy(): void {
    const opts = this.options;

    // Remove event listeners
    opts.rowElements?.forEach((el) => {
      el.off('click.list');
      el.find('input, select, textarea').off('change.list');
    });

    // Clear context content
    opts.context.empty();

    // Remove classes
    opts.context.removeClass('list__');
    opts.context.removeData('list');

    // Clear data
    opts.data = [];
    opts.rowElements = [];
    opts.row = -1;
    opts.beforeRow = -1;
  }
}

/**
 * Factory function to create a List instance.
 */
export function createList(
  context: NaturalElement | Element | string,
  opts?: ListUserOptions
): List {
  return new List(context, opts);
}

