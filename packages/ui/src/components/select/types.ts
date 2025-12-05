/**
 * Types for the Select component.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Data item for Select options.
 */
export interface SelectDataItem {
  [key: string]: unknown;
}

/**
 * Options for the Select component.
 */
export interface SelectOptions {
  /** Context element (select, checkbox group, or radio group) */
  context: NaturalElement;
  /** Data array for options */
  data: SelectDataItem[];
  /** Property name for option value */
  key: string;
  /** Property name for option display text */
  val: string;
  /** Whether to append to existing options or replace */
  append?: boolean;
  /** Default selected value */
  selected?: unknown;
  /** Whether to add an empty option (for select only) */
  addEmpty?: boolean;
  /** Text for empty option */
  emptyText?: string;
  /** Value for empty option */
  emptyValue?: string;
  /** CSS class for select element */
  selectClass?: string;
  /** Callback when selection changes */
  onChange?: (value: unknown, index: number, data: SelectDataItem | undefined) => void;
  /** Callback after binding */
  onBind?: (context: NaturalElement, data: SelectDataItem[]) => void;
  /** Internal: element type */
  type?: 'select' | 'checkbox' | 'radio';
  /** Internal: name attribute for checkbox/radio */
  name?: string;
}

/**
 * User-provided options for Select.
 */
export type SelectUserOptions = Partial<
  Omit<SelectOptions, 'context' | 'type' | 'name'>
> & {
  context?: NaturalElement | Element | string;
};

