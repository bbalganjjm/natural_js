/**
 * Types for the Grid component.
 */

import { NaturalElement, RowStatus } from '@natural-js/shared';

// Re-export for convenience
export type { RowStatus };

/**
 * Data row type for grid binding.
 */
export interface GridDataRow {
  [key: string]: unknown;
  rowStatus?: RowStatus;
  __index__?: number;
  __selected__?: boolean;
  __checked__?: boolean;
  __originalData__?: Record<string, unknown>;
}

/**
 * Scroll paging options for grid.
 */
export interface GridScrollPagingOptions {
  /** Number of items per page */
  size: number;
  /** Current starting index */
  idx: number;
}

/**
 * Options for the Grid component.
 */
export interface GridOptions {
  /** Context element for the grid (table) */
  context: NaturalElement;
  /** Data array to bind */
  data: GridDataRow[];
  /** Header template element (thead) */
  headTemplate: NaturalElement | null;
  /** Body row template element (tbody tr) */
  rowTemplate: NaturalElement | null;
  /** Current selected row index */
  row: number;
  /** Previously selected row index */
  beforeRow: number;
  /** Whether to enable row selection */
  select?: boolean;
  /** Whether to enable multiple selection */
  multiselect?: boolean;
  /** Height of the grid container (enables scrollable body) */
  height?: number;
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
  /** Selector for check-all checkbox in header */
  checkAll?: string | false;
  /** Selector for row checkboxes */
  checkAllTarget?: string;
  /** Selector for single select checkbox */
  checkSingle?: string | false;
  /** Delay between rendering rows (ms) */
  createRowDelay?: number;
  /** Scroll paging options */
  scrollPaging?: GridScrollPagingOptions | false;
  /** Callback before binding */
  onBeforeBind?: (context: NaturalElement, data: GridDataRow[]) => boolean | void;
  /** Callback after binding a row */
  onBind?: (index: number, rowElement: NaturalElement, data: GridDataRow) => void;
  /** Callback before selecting */
  onBeforeSelect?: (row: number, rowElement: NaturalElement, data: GridDataRow, e?: Event) => boolean | void;
  /** Callback after selecting */
  onSelect?: (row: number, rowElement: NaturalElement, data: GridDataRow, e?: Event) => void;
  /** Callback when check changes */
  onCheck?: (row: number, checked: boolean, data: GridDataRow) => void;
  /** Callback when data changes */
  onChange?: (row: number, key: string, value: unknown, oldValue: unknown) => void;
  /** Callback when row is added */
  onAdd?: (row: number, data: GridDataRow) => void;
  /** Callback when row is removed */
  onRemove?: (row: number, data: GridDataRow) => void;
  /** Internal: tbody element */
  tbody?: NaturalElement | null;
  /** Internal: thead element */
  thead?: NaturalElement | null;
  /** Internal: row elements cache */
  rowElements?: NaturalElement[];
  /** Internal: is currently binding */
  isBinding?: boolean;
}

/**
 * Sort direction type.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort state for a column.
 */
export interface GridSortState {
  /** Column key */
  key: string;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Filter state for a column.
 */
export interface GridFilterState {
  /** Column key */
  key: string;
  /** Filter value */
  value: string;
  /** Filter operator */
  operator?: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
}

/**
 * Options for fixHeader method.
 */
export interface FixHeaderOptions {
  /** Height of scrollable area */
  height?: number;
  /** Whether header is scrollable */
  scrollSync?: boolean;
}

/**
 * Options for fixColumn method.
 */
export interface FixColumnOptions {
  /** Number of columns to fix from left */
  colCount: number;
  /** Width of fixed area */
  width?: number;
}

/**
 * Options for resize method.
 */
export interface ResizeOptions {
  /** Minimum column width */
  minWidth?: number;
  /** Maximum column width */
  maxWidth?: number;
  /** Callback when resize starts */
  onResizeStart?: (colIndex: number, width: number) => void;
  /** Callback when resizing */
  onResize?: (colIndex: number, width: number) => void;
  /** Callback when resize ends */
  onResizeEnd?: (colIndex: number, width: number) => void;
}

/**
 * Options for sort method.
 */
export interface GridSortOptions {
  /** Sort direction */
  direction?: SortDirection;
  /** Custom comparator function */
  comparator?: (a: unknown, b: unknown) => number;
  /** Callback after sorting */
  onSort?: (key: string, direction: SortDirection) => void;
}

/**
 * Options for dataFilter method.
 */
export interface DataFilterOptions {
  /** Filter operator */
  operator?: GridFilterState['operator'];
  /** Case sensitive */
  caseSensitive?: boolean;
  /** Callback after filtering */
  onFilter?: (key: string, value: string, filteredData: GridDataRow[]) => void;
}

/**
 * Options for more (infinite scroll) method.
 */
export interface MoreOptions {
  /** Number of rows to load per page */
  size: number;
  /** Callback to load more data */
  onLoad: (page: number, callback: (data: GridDataRow[], hasMore: boolean) => void) => void;
  /** Threshold in pixels before end to trigger load */
  threshold?: number;
}

/**
 * User-provided options for Grid.
 */
export type GridUserOptions = Partial<
  Omit<GridOptions, 'context' | 'headTemplate' | 'rowTemplate' | 'row' | 'beforeRow' | 'rowElements' | 'isBinding' | 'tbody' | 'thead'>
>;

