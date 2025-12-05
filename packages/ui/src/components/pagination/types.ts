/**
 * Types for the Pagination component.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Page navigation info.
 */
export interface PageNavInfo {
  /** Current page number (1-based) */
  pageNo: number;
  /** Total number of pages */
  totalPages: number;
  /** Total count of items */
  totalCount: number;
  /** Items per page */
  countPerPage: number;
  /** First page number in current page set */
  firstPage: number;
  /** Last page number in current page set */
  lastPage: number;
  /** Whether previous page set exists */
  hasPrevSet: boolean;
  /** Whether next page set exists */
  hasNextSet: boolean;
  /** Whether previous page exists */
  hasPrev: boolean;
  /** Whether next page exists */
  hasNext: boolean;
}

/**
 * Options for the Pagination component.
 */
export interface PaginationOptions {
  /** Context element for pagination */
  context: NaturalElement;
  /** Total count of items */
  totalCount: number;
  /** Current page number (1-based) */
  pageNo: number;
  /** Items per page */
  countPerPage: number;
  /** Pages per page set (navigation group) */
  countPerPageSet: number;
  /** Whether to show first/last buttons */
  showFirstLast?: boolean;
  /** Whether to show prev/next set buttons */
  showPrevNextSet?: boolean;
  /** Text for first button */
  firstText?: string;
  /** Text for last button */
  lastText?: string;
  /** Text for prev button */
  prevText?: string;
  /** Text for next button */
  nextText?: string;
  /** Text for prev set button */
  prevSetText?: string;
  /** Text for next set button */
  nextSetText?: string;
  /** CSS class for active page */
  activeClass?: string;
  /** CSS class for disabled button */
  disabledClass?: string;
  /** Callback when page changes */
  onChange?: (pageNo: number, pageNavInfo: PageNavInfo) => void;
}

/**
 * User-provided options for Pagination.
 */
export type PaginationUserOptions = Partial<Omit<PaginationOptions, 'context'>>;

