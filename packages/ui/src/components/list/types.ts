/**
 * Types for the List component.
 */

import { NaturalElement, RowStatus } from '@natural-js/shared';

// Re-export for convenience
export type { RowStatus };

/**
 * Data row type for list binding.
 */
export interface ListDataRow {
  [key: string]: unknown;
  rowStatus?: RowStatus;
  __index__?: number;
  __selected__?: boolean;
  __checked__?: boolean;
  __originalData__?: Record<string, unknown>;
}

/**
 * Scroll paging options.
 */
export interface ListScrollPagingOptions {
  /** Number of items per page */
  size: number;
  /** Current starting index */
  idx: number;
}

/**
 * Options for the List component.
 */
export interface ListOptions {
  /** Context element for the list */
  context: NaturalElement;
  /** Data array to bind */
  data: ListDataRow[];
  /** Template element for each row */
  rowTemplate: NaturalElement | null;
  /** Current selected row index */
  row: number;
  /** Previously selected row index */
  beforeRow: number;
  /** Whether to enable row selection */
  select?: boolean;
  /** Whether to enable multiple selection */
  multiselect?: boolean;
  /** Height of the list container */
  height?: number;
  /** Scroll paging options */
  scrollPaging?: ListScrollPagingOptions | false;
  /** Whether to use HTML binding */
  html?: boolean;
  /** Whether to validate on blur */
  validate?: boolean;
  /** Whether to enable revert functionality */
  revert?: boolean;
  /** Whether to enable DataSync */
  dataSync?: boolean;
  /** CSS class for selected row */
  selectedClass?: string;
  /** CSS class for checked row */
  checkedClass?: string;
  /** Selector for check-all checkbox */
  checkAll?: string | false;
  /** Selector for row checkboxes */
  checkAllTarget?: string;
  /** Selector for single select checkbox */
  checkSingle?: string | false;
  /** Delay between rendering rows (ms) */
  createRowDelay?: number;
  /** Callback before binding */
  onBeforeBind?: (context: NaturalElement, data: ListDataRow[]) => boolean | void;
  /** Callback after binding a row */
  onBind?: (index: number, rowElement: NaturalElement, data: ListDataRow) => void;
  /** Callback before selecting */
  onBeforeSelect?: (row: number, rowElement: NaturalElement, data: ListDataRow, e?: Event) => boolean | void;
  /** Callback after selecting */
  onSelect?: (row: number, rowElement: NaturalElement, data: ListDataRow, e?: Event) => void;
  /** Callback when check changes */
  onCheck?: (row: number, checked: boolean, data: ListDataRow) => void;
  /** Callback when data changes */
  onChange?: (row: number, key: string, value: unknown, oldValue: unknown) => void;
  /** Callback when row is added */
  onAdd?: (row: number, data: ListDataRow) => void;
  /** Callback when row is removed */
  onRemove?: (row: number, data: ListDataRow) => void;
  /** Internal: row elements cache */
  rowElements?: NaturalElement[];
  /** Internal: is currently binding */
  isBinding?: boolean;
}

/**
 * User-provided options for List.
 */
export type ListUserOptions = Partial<
  Omit<ListOptions, 'context' | 'rowTemplate' | 'row' | 'beforeRow' | 'rowElements' | 'isBinding'>
>;
