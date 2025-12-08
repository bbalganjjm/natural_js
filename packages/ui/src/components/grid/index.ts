/**
 * Grid component for Natural-JS.
 * Provides table-based data binding and row management.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { isString, isArray, element } from '@natural-js/core';
import { Formatter, Validator, type FormatRules, type ValidationRules } from '@natural-js/data';
import { 
  GridOptions, 
  GridUserOptions, 
  GridDataRow, 
  RowStatus,
  SortDirection,
  GridSortState,
  GridFilterState,
  FixHeaderOptions,
  FixColumnOptions,
  ResizeOptions,
  GridSortOptions,
  DataFilterOptions,
  MoreOptions
} from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<GridOptions> = {
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
  selectedClass: 'grid_selected__',
  checkedClass: 'grid_checked__',
  checkAll: false as const,
  checkAllTarget: 'input[type="checkbox"]',
  checkSingle: false as const,
  createRowDelay: 0,
  scrollPaging: false as const,
};

/**
 * Grid component for table-based data rendering.
 */
export class Grid {
  public options: GridOptions;
  private columnKeys: string[] = [];
  private filterKeys: string[] = [];
  private rowspanKeys: string[] = [];

  constructor(context: NaturalElement | Element | string, opts?: GridUserOptions) {
    if (!isBrowser()) {
      this.options = {} as GridOptions;
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

    // Get thead and tbody
    let thead = contextEl.find('thead');
    let tbody = contextEl.find('tbody');

    // Create tbody if not exists
    if (tbody.length === 0) {
      const doc = getDocument();
      if (doc) {
        const tbodyEl = doc.createElement('tbody');
        contextEl.get(0)?.appendChild(tbodyEl);
        tbody = new NaturalElement(tbodyEl);
      }
    }

    // Get template (first row of tbody as template)
    const template = tbody.find('tr').first();
    const rowTemplate = template.length > 0 ? template.clone(true) : null;
    
    // Clone thead for template
    const headTemplate = thead.length > 0 ? thead.clone(true) : null;

    // Clear template rows from tbody
    tbody.find('tr').remove();

    // Extract declarative format/validate rules from row template inputs
    const bodyInputs = contextEl.find('tbody input, tbody select, tbody textarea');
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
        let el = contextEl.find(`tbody [id="${key}"]`);
        if (el.length === 0) {
          el = contextEl.find(`tbody [name="${key}"]`);
        }
        if (el.length === 0) {
          el = contextEl.find(`tbody [data-bind="${key}"]`);
        }
        if (el.length > 0 && el.get(0)) {
          const target = el.get(0) as HTMLElement;
          if (!target.dataset.validate) {
            target.dataset.validate = JSON.stringify(rules);
          }
        }
      }
    }

    // Build column key order from row template
    if (rowTemplate) {
      rowTemplate.find('[data-bind]').each((_, el) => {
        const key = el.getAttribute('data-bind');
        if (key) {
          this.columnKeys.push(key);
        }
      });
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      ...opts,
      context: contextEl,
      thead: thead.length > 0 ? thead : null,
      tbody: tbody.length > 0 ? tbody : null,
      headTemplate,
      rowTemplate,
      row: -1,
      beforeRow: -1,
      rowElements: [],
      isBinding: false,
      fRules: mergedFRules,
      vRules: mergedVRules,
    } as GridOptions;

    // Add grid class
    contextEl.addClass('grid__');

    // Bind declarative sort/filter/rowspan headers
    if (this.options.thead) {
      this.options.thead.find('th').each((idx, el) => {
        const th = new NaturalElement(el);
        const keyFromSort = (el as HTMLElement).dataset.sort;
        const colKey = keyFromSort || this.columnKeys[idx];

        // sort
        if (keyFromSort) {
          th.addClass('sortable__');
          th.off('click.grid.sort').on('click.grid.sort', (e: Event) => {
            e.preventDefault();
            this.sort(keyFromSort);
          });
        }

        // filter
        const filterAttr = (el as HTMLElement).dataset.filter;
        if (filterAttr !== undefined && filterAttr !== 'false') {
          const key = colKey;
          if (key) {
            this.filterKeys.push(key);
            this.setupFilter(th, key);
          }
        }

        // rowspan
        const rowspanAttr = (el as HTMLElement).dataset.rowspan;
        if (rowspanAttr !== undefined && rowspanAttr !== 'false') {
          const key = colKey;
          if (key) {
            this.rowspanKeys.push(key);
          }
        }
      });
    }

    // Set height if specified (scrollable body)
    if (opts?.height) {
      this.setupScrollableBody(opts.height);
    }

    // Initial bind if data provided
    if (opts?.data && opts.data.length > 0) {
      this.bind(opts.data);
    }

    // Store reference
    contextEl.data('grid', this);
  }

  /**
   * Setup scrollable body with fixed header.
   */
  private setupScrollableBody(height: number): void {
    const opts = this.options;
    if (!opts.tbody) return;

    // Wrap tbody in scrollable container
    opts.tbody.css('display', 'block');
    opts.tbody.css('height', `${height}px`);
    opts.tbody.css('overflow-y', 'auto');

    if (opts.thead) {
      opts.thead.css('display', 'table');
      opts.thead.css('width', '100%');
      opts.thead.css('table-layout', 'fixed');
    }
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Returns the head element.
   */
  contextHead(): NaturalElement | null {
    return this.options.thead ?? null;
  }

  /**
   * Returns the body template.
   */
  contextBodyTemplate(): NaturalElement | null {
    return this.options.rowTemplate;
  }

  /**
   * Bind data to the grid.
   */
  bind(data?: GridDataRow[], callback?: () => void): this {
    const opts = this.options;
    const doc = getDocument();
    if (!doc || !opts.rowTemplate || !opts.tbody) return this;

    // Call onBeforeBind first
    if (opts.onBeforeBind) {
      const result = opts.onBeforeBind(opts.context, data ?? opts.data);
      if (result === false) return this;
    }

    if (data !== undefined) {
      opts.data = data;
    }

    opts.isBinding = true;

    // Clear existing rows
    opts.tbody.empty();
    opts.rowElements = [];

    // Render rows
    const renderCount = opts.scrollPaging ? opts.scrollPaging.size : opts.data.length;
    const endIndex = Math.min(renderCount, opts.data.length);

    for (let i = 0; i < endIndex; i++) {
      this.renderRow(i);
    }

    // Bind checkAll event
    if (opts.checkAll && opts.thead) {
      this.bindCheckAllEvent();
    }

    opts.isBinding = false;

    if (callback) {
      callback();
    }

    // Apply rowspan if configured
    this.applyRowspanForKeys();

    return this;
  }

  /**
   * Render a single row.
   */
  private renderRow(index: number): NaturalElement | null {
    const opts = this.options;
    const doc = getDocument();
    if (!doc || !opts.rowTemplate || !opts.tbody) return null;

    const rowData = opts.data[index];
    if (!rowData) return null;

    // Store original data for revert
    if (opts.revert && !rowData.__originalData__) {
      rowData.__originalData__ = { ...rowData };
    }
    rowData.__index__ = index;

    // Clone template
    const rowElement = opts.rowTemplate.clone(true);
    rowElement.addClass('grid_row__');
    rowElement.data('index', index);

    // Bind data to row
    this.bindRowData(rowElement, rowData);

    // Bind row events
    this.bindRowEvents(rowElement, index);

    // Append to tbody
    opts.tbody.append(rowElement);
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
  private bindRowData(rowElement: NaturalElement, rowData: GridDataRow): void {
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
      // Also check td with data-bind
      if (el.length === 0) {
        el = rowElement.find(`td[data-bind="${key}"]`);
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
   * Bind events to row element.
   */
  private bindRowEvents(rowElement: NaturalElement, index: number): void {
    const opts = this.options;
    const self = this;

    // Click event for selection
    if (opts.select) {
      rowElement.on('click.grid', (e: Event) => {
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
      rowElement.find(opts.checkAllTarget).on('change.grid', (e: Event) => {
        const checkbox = e.target as HTMLInputElement;
        const rowData = opts.data[index];
        if (rowData) {
          rowData.__checked__ = checkbox.checked;
          if (checkbox.checked) {
            rowElement.addClass(opts.checkedClass || 'grid_checked__');
          } else {
            rowElement.removeClass(opts.checkedClass || 'grid_checked__');
          }
          if (opts.onCheck) {
            opts.onCheck(index, checkbox.checked, rowData);
          }
        }
      });
    }

    // Input change events for two-way binding
    rowElement.find('input, select, textarea').on('change.grid', function (this: Element) {
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
    if (!opts.checkAll || !opts.thead) return;

    const self = this;
    const checkAllSelector = isString(opts.checkAll) ? opts.checkAll : '.grid_check_all__';
    
    const checkAllEl = opts.thead.find(checkAllSelector);

    checkAllEl.off('change.grid').on('change.grid', function (this: Element) {
      const checked = (this as HTMLInputElement).checked;
      self.checkAll(checked);
    });
  }

  /**
   * Get the data array.
   */
  data(): GridDataRow[];
  data(selFlag: true): GridDataRow[];
  data(selFlag: false): GridDataRow[];
  data(selFlag?: boolean): GridDataRow[] {
    const opts = this.options;

    if (selFlag === true) {
      // Return only selected/checked rows
      return opts.data.filter((row) => row.__selected__ || row.__checked__);
    }
    if (selFlag === false) {
      // Return all data without internal properties
      return opts.data.map((row) => {
        const clean: GridDataRow = {};
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
  add(data?: GridDataRow | number, row?: number): this {
    const opts = this.options;

    let insertRow: number;
    let newData: GridDataRow;

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
    if (rowElement && insertRow < (opts.rowElements?.length ?? 0) - 1) {
      // Insert at correct position
      const nextRow = opts.rowElements?.[insertRow + 1];
      if (nextRow && opts.tbody) {
        opts.tbody.get(0)?.insertBefore(rowElement.get(0)!, nextRow.get(0)!);
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
        prevRow.removeClass(opts.selectedClass || 'grid_selected__');
        prevData.__selected__ = false;
      }
    }

    // Select current row
    rowElement.addClass(opts.selectedClass || 'grid_selected__');
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

    const checkbox = rowElement.find(opts.checkAllTarget || 'input[type="checkbox"]').get(0) as HTMLInputElement | undefined;
    const isChecked = checked ?? !rowData.__checked__;

    if (checkbox) {
      checkbox.checked = isChecked;
    }
    rowData.__checked__ = isChecked;

    if (isChecked) {
      rowElement.addClass(opts.checkedClass || 'grid_checked__');
    } else {
      rowElement.removeClass(opts.checkedClass || 'grid_checked__');
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
    if (rowElement && opts.tbody) {
      opts.rowElements?.splice(fromRow, 1);
      opts.rowElements?.splice(toRow, 0, rowElement);

      const targetElement = opts.rowElements?.[toRow + (fromRow < toRow ? 1 : 0)];
      if (targetElement) {
        opts.tbody.get(0)?.insertBefore(rowElement.get(0)!, targetElement.get(0)!);
      } else {
        opts.tbody.append(rowElement);
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

    const newData: GridDataRow = {};
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

  // ==================== Advanced Features (Part 2) ====================

  /** Internal: Sort state */
  private sortState: GridSortState | null = null;

  /** Internal: Filter states */
  private filterStates: GridFilterState[] = [];

  /** Internal: Original data before filtering */
  private originalData: GridDataRow[] | null = null;

  /** Internal: More loading state */
  private moreOptions: MoreOptions | null = null;
  private morePage: number = 1;
  private moreHasMore: boolean = true;
  private moreLoading: boolean = false;

  /** Internal: Hidden columns */
  private hiddenColumns: number[] = [];

  /**
   * Fix header for scrollable grid.
   */
  fixHeader(options?: FixHeaderOptions): this {
    const opts = this.options;
    const doc = getDocument();
    if (!doc || !opts.thead || !opts.tbody) return this;

    const height = options?.height ?? opts.height ?? 300;

    // Apply styles for fixed header
    opts.context.css('display', 'block');
    opts.context.css('width', '100%');

    opts.thead.css('display', 'block');
    opts.thead.css('width', '100%');
    opts.thead.find('tr').css('display', 'table');
    opts.thead.find('tr').css('width', '100%');
    opts.thead.find('tr').css('table-layout', 'fixed');

    opts.tbody.css('display', 'block');
    opts.tbody.css('height', `${height}px`);
    opts.tbody.css('overflow-y', 'auto');
    opts.tbody.css('width', '100%');

    // Sync horizontal scroll if needed
    if (options?.scrollSync !== false) {
      opts.tbody.on('scroll.grid.fixHeader', () => {
        const scrollLeft = opts.tbody?.get(0)?.scrollLeft ?? 0;
        if (opts.thead) {
          opts.thead.get(0)!.scrollLeft = scrollLeft;
        }
      });
    }

    opts.context.addClass('grid_fixed_header__');
    return this;
  }

  /**
   * Fix columns from left.
   */
  fixColumn(options: FixColumnOptions): this {
    const opts = this.options;
    const doc = getDocument();
    if (!doc || !opts.thead || !opts.tbody) return this;

    const colCount = options.colCount;

    // Apply sticky positioning to fixed columns
    const applyFixedStyle = (row: Element, isHeader: boolean) => {
      const cells = row.querySelectorAll(isHeader ? 'th' : 'td');
      let leftOffset = 0;

      for (let i = 0; i < Math.min(colCount, cells.length); i++) {
        const cell = cells[i] as HTMLElement;
        cell.style.position = 'sticky';
        cell.style.left = `${leftOffset}px`;
        cell.style.zIndex = isHeader ? '3' : '1';
        cell.style.backgroundColor = 'inherit';
        leftOffset += cell.offsetWidth;
      }
    };

    // Apply to header
    opts.thead.find('tr').each((_, row) => {
      applyFixedStyle(row, true);
    });

    // Apply to body rows
    opts.rowElements?.forEach((rowEl) => {
      const row = rowEl.get(0);
      if (row) {
        applyFixedStyle(row, false);
      }
    });

    opts.context.addClass('grid_fixed_column__');
    return this;
  }

  /**
   * Enable column resizing.
   */
  resize(options?: ResizeOptions): this {
    const opts = this.options;
    const doc = getDocument();
    if (!doc || !opts.thead) return this;

    const minWidth = options?.minWidth ?? 50;
    const maxWidth = options?.maxWidth ?? 500;

    opts.thead.find('th').each((colIndex, th) => {
      const thEl = th as HTMLTableCellElement;
      
      // Create resize handle
      const handle = doc.createElement('div');
      handle.className = 'resize_bar__ grid_resize_handle__';
      handle.style.cssText = `
        position: absolute;
        right: 0;
        top: 0;
        width: 5px;
        height: 100%;
        cursor: col-resize;
        user-select: none;
      `;
      
      thEl.style.position = 'relative';
      thEl.appendChild(handle);

      let startX = 0;
      let startWidth = 0;

      const onMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - startX;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + diff));
        thEl.style.width = `${newWidth}px`;

        // Update body column width
        opts.rowElements?.forEach((rowEl) => {
          const td = rowEl.find('td').get(colIndex) as HTMLTableCellElement | undefined;
          if (td) {
            td.style.width = `${newWidth}px`;
          }
        });

        if (options?.onResize) {
          options.onResize(colIndex, newWidth);
        }
      };

      const onMouseUp = () => {
        doc.removeEventListener('mousemove', onMouseMove);
        doc.removeEventListener('mouseup', onMouseUp);

        if (options?.onResizeEnd) {
          options.onResizeEnd(colIndex, thEl.offsetWidth);
        }
      };

      handle.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault();
        startX = e.clientX;
        startWidth = thEl.offsetWidth;

        if (options?.onResizeStart) {
          options.onResizeStart(colIndex, startWidth);
        }

        doc.addEventListener('mousemove', onMouseMove);
        doc.addEventListener('mouseup', onMouseUp);
      });
    });

    opts.context.addClass('grid_resizable__');
    return this;
  }

  /**
   * Sort grid by column.
   */
  sort(key: string, options?: GridSortOptions): this {
    const opts = this.options;
    
    // Determine direction
    let direction: SortDirection = options?.direction ?? 'asc';
    if (this.sortState?.key === key && !options?.direction) {
      direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    }

    this.sortState = { key, direction };

    // Sort data
    const comparator = options?.comparator ?? ((a: unknown, b: unknown) => {
      if (a === b) return 0;
      if (a === null || a === undefined) return 1;
      if (b === null || b === undefined) return -1;
      
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      
      return String(a).localeCompare(String(b));
    });

    opts.data.sort((a, b) => {
      const result = comparator(a[key], b[key]);
      return direction === 'asc' ? result : -result;
    });

    // Re-render
    this.bind(opts.data);

    // Update header sort indicator
    if (opts.thead) {
      opts.thead.find('.sortable__').removeClass('asc__ desc__');
      opts.thead.find(`[data-sort="${key}"]`).addClass(`sortable__ ${direction}__`);
    }

    if (options?.onSort) {
      options.onSort(key, direction);
    }

    return this;
  }

  /**
   * Filter grid data.
   */
  dataFilter(key: string, value: string, options?: DataFilterOptions): this {
    const opts = this.options;

    // Store original data on first filter
    if (!this.originalData) {
      this.originalData = [...opts.data];
    }

    // Update filter state
    const existingIndex = this.filterStates.findIndex((f) => f.key === key);
    if (value === '') {
      // Remove filter
      if (existingIndex >= 0) {
        this.filterStates.splice(existingIndex, 1);
      }
    } else {
      const filterState: GridFilterState = {
        key,
        value,
        operator: options?.operator ?? 'contains',
      };
      if (existingIndex >= 0) {
        this.filterStates[existingIndex] = filterState;
      } else {
        this.filterStates.push(filterState);
      }
    }

    // Apply all filters
    let filteredData = [...this.originalData];
    const caseSensitive = options?.caseSensitive ?? false;

    for (const filter of this.filterStates) {
      filteredData = filteredData.filter((row) => {
        const cellValue = String(row[filter.key] ?? '');
        const filterValue = filter.value;

        const cv = caseSensitive ? cellValue : cellValue.toLowerCase();
        const fv = caseSensitive ? filterValue : filterValue.toLowerCase();

        switch (filter.operator) {
          case 'equals':
            return cv === fv;
          case 'startsWith':
            return cv.startsWith(fv);
          case 'endsWith':
            return cv.endsWith(fv);
          case 'gt':
            return Number(cellValue) > Number(filterValue);
          case 'lt':
            return Number(cellValue) < Number(filterValue);
          case 'gte':
            return Number(cellValue) >= Number(filterValue);
          case 'lte':
            return Number(cellValue) <= Number(filterValue);
          case 'contains':
          default:
            return cv.includes(fv);
        }
      });
    }

    // Re-render with filtered data
    this.bind(filteredData);

    if (options?.onFilter) {
      options.onFilter(key, value, filteredData);
    }

    return this;
  }

  /**
   * Clear all filters.
   */
  clearFilter(): this {
    if (this.originalData) {
      this.filterStates = [];
      this.bind(this.originalData);
      this.originalData = null;
    }
    return this;
  }

  /**
   * Enable infinite scroll / load more.
   */
  more(options: MoreOptions): this {
    const opts = this.options;
    if (!opts.tbody) return this;

    this.moreOptions = options;
    this.morePage = 1;
    this.moreHasMore = true;
    this.moreLoading = false;

    const threshold = options.threshold ?? 100;

    opts.tbody.on('scroll.grid.more', () => {
      if (this.moreLoading || !this.moreHasMore) return;

      const tbody = opts.tbody?.get(0);
      if (!tbody) return;

      const scrollBottom = tbody.scrollHeight - tbody.scrollTop - tbody.clientHeight;

      if (scrollBottom < threshold) {
        this.loadMore();
      }
    });

    return this;
  }

  /**
   * Load more data (internal).
   */
  private loadMore(): void {
    if (!this.moreOptions || this.moreLoading || !this.moreHasMore) return;

    this.moreLoading = true;
    this.morePage++;

    this.moreOptions.onLoad(this.morePage, (data, hasMore) => {
      this.moreLoading = false;
      this.moreHasMore = hasMore;

      // Append new data
      for (const row of data) {
        this.add(row);
      }
    });
  }

  /**
   * Show columns by indices.
   */
  show(colIndices: number | number[]): this {
    const indices = isArray(colIndices) ? colIndices : [colIndices];
    
    for (const idx of indices) {
      const hiddenIdx = this.hiddenColumns.indexOf(idx);
      if (hiddenIdx >= 0) {
        this.hiddenColumns.splice(hiddenIdx, 1);
      }
    }

    this.updateColumnVisibility();
    return this;
  }

  /**
   * Hide columns by indices.
   */
  hide(colIndices: number | number[]): this {
    const indices = isArray(colIndices) ? colIndices : [colIndices];
    
    for (const idx of indices) {
      if (!this.hiddenColumns.includes(idx)) {
        this.hiddenColumns.push(idx);
      }
    }

    this.updateColumnVisibility();
    return this;
  }

  /**
   * Setup filter input for a header cell.
   */
  private setupFilter(th: NaturalElement, key: string): void {
    const existingInput = th.find('input, select').first();
    let inputEl: NaturalElement;

    if (existingInput.length > 0) {
      inputEl = existingInput;
    } else {
      const doc = getDocument();
      if (!doc) return;
      const input = doc.createElement('input');
      input.type = 'text';
      input.className = 'grid_filter__';
      th.append(input);
      inputEl = new NaturalElement(input);
    }

    inputEl.off('input.grid.filter change.grid.filter').on('input.grid.filter change.grid.filter', () => {
      const value = (inputEl.get(0) as HTMLInputElement | HTMLSelectElement | undefined)?.value ?? '';
      this.dataFilter(key, value);
    });
  }

  /**
   * Apply rowspan for configured keys.
   */
  private applyRowspanForKeys(): void {
    if (this.rowspanKeys.length === 0) return;
    for (const key of this.rowspanKeys) {
      this.rowSpan(key);
    }
  }

  /**
   * Update column visibility (internal).
   */
  private updateColumnVisibility(): void {
    const opts = this.options;

    // Update header
    if (opts.thead) {
      opts.thead.find('th').each((idx, th) => {
        (th as HTMLElement).style.display = this.hiddenColumns.includes(idx) ? 'none' : '';
      });
    }

    // Update body rows
    opts.rowElements?.forEach((rowEl) => {
      rowEl.find('td').each((idx, td) => {
        (td as HTMLElement).style.display = this.hiddenColumns.includes(idx) ? 'none' : '';
      });
    });
  }

  /**
   * Validate grid rows using configured rules or required attributes.
   */
  validate(row?: number): boolean {
    const opts = this.options;
    const hasRules = opts.vRules && Object.keys(opts.vRules).length > 0;

    if (hasRules) {
      const validator = new Validator(opts.data, opts.vRules as ValidationRules);
      const results = validator.validate(row);
      return Validator.isValid(results);
    }

    // Fallback required check on rendered rows
    const rowsToCheck =
      row === undefined || row === null ? opts.rowElements ?? [] : [opts.rowElements?.[row]].filter(Boolean);
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
          new NaturalElement(input).addClass('grid_invalid__');
        } else {
          new NaturalElement(input).removeClass('grid_invalid__');
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
   * Merge cells vertically (row span).
   */
  rowSpan(key: string): this {
    const opts = this.options;
    if (!opts.rowElements || opts.rowElements.length === 0) return this;

    let spanStart = 0;
    let spanCount = 1;
    let lastValue: unknown = undefined;

    for (let i = 0; i < opts.data.length; i++) {
      const currentValue = opts.data[i]?.[key];

      if (i === 0) {
        lastValue = currentValue;
        spanStart = 0;
        spanCount = 1;
      } else if (currentValue === lastValue) {
        spanCount++;
        // Hide this cell
        const cell = opts.rowElements[i]?.find(`[data-bind="${key}"]`).get(0) as HTMLTableCellElement | undefined;
        if (cell) {
          cell.style.display = 'none';
        }
      } else {
        // Apply rowspan to start cell
        if (spanCount > 1) {
          const startCell = opts.rowElements[spanStart]?.find(`[data-bind="${key}"]`).get(0) as HTMLTableCellElement | undefined;
          if (startCell) {
            startCell.rowSpan = spanCount;
          }
        }
        // Reset
        lastValue = currentValue;
        spanStart = i;
        spanCount = 1;
      }
    }

    // Handle last group
    if (spanCount > 1) {
      const startCell = opts.rowElements[spanStart]?.find(`[data-bind="${key}"]`).get(0) as HTMLTableCellElement | undefined;
      if (startCell) {
        startCell.rowSpan = spanCount;
      }
    }

    return this;
  }

  /**
   * Handle paste from clipboard.
   */
  paste(startRow?: number, startCol?: number): this {
    const opts = this.options;
    const doc = getDocument();
    if (!doc) return this;

    const targetRow = startRow ?? Math.max(0, opts.row);
    const targetCol = startCol ?? 0;

    // Read clipboard
    navigator.clipboard.readText().then((text) => {
      const rows = text.split('\n').filter((r) => r.trim() !== '');
      
      // Get column keys from template
      const keys: string[] = [];
      if (opts.rowTemplate) {
        opts.rowTemplate.find('[data-bind]').each((_, el) => {
          const key = el.getAttribute('data-bind');
          if (key) keys.push(key);
        });
      }

      for (let r = 0; r < rows.length; r++) {
        const rowLine = rows[r];
        if (!rowLine) continue;
        
        const cells = rowLine.split('\t');
        const dataRow = targetRow + r;

        // Add row if needed
        if (dataRow >= opts.data.length) {
          this.add({});
        }

        for (let c = 0; c < cells.length; c++) {
          const colIdx = targetCol + c;
          const key = keys[colIdx];
          if (key && cells[c] !== undefined) {
            this.val(dataRow, key, cells[c]);
          }
        }
      }
    }).catch(() => {
      // Clipboard access denied or not available
    });

    return this;
  }

  /**
   * Get current sort state.
   */
  getSortState(): GridSortState | null {
    return this.sortState;
  }

  /**
   * Get current filter states.
   */
  getFilterStates(): GridFilterState[] {
    return [...this.filterStates];
  }

  /**
   * Destroy the grid instance.
   */
  destroy(): void {
    const opts = this.options;

    // Remove event listeners
    opts.rowElements?.forEach((el) => {
      el.off('click.grid');
      el.find('input, select, textarea').off('change.grid');
    });

    if (opts.thead) {
      opts.thead.find('input[type="checkbox"]').off('change.grid');
    }

    // Clear tbody
    opts.tbody?.empty();

    // Remove classes
    opts.context.removeClass('grid__');
    opts.context.removeData('grid');

    // Clear data
    opts.data = [];
    opts.rowElements = [];
    opts.row = -1;
    opts.beforeRow = -1;
  }
}

/**
 * Factory function to create a Grid instance.
 */
export function createGrid(
  context: NaturalElement | Element | string,
  opts?: GridUserOptions
): Grid {
  return new Grid(context, opts);
}

