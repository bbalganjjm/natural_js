/**
 * Types for the Form component.
 */

import { NaturalElement, RowStatus } from '@natural-js/shared';
import { type FormatRules, type ValidationRules } from '@natural-js/data';

// Re-export RowStatus for convenience
export type { RowStatus };

/**
 * Data row type for form binding.
 */
export interface FormDataRow {
  [key: string]: unknown;
  rowStatus?: RowStatus;
  __originalData__?: Record<string, unknown>;
}

/**
 * Options for the Form component.
 */
export interface FormOptions {
  /** Context element for the form */
  context: NaturalElement;
  /** Data array to bind */
  data: FormDataRow[];
  /** Current row index */
  row: number;
  /** Previous row index */
  beforeRow: number;
  /** Whether to use HTML binding */
  html?: boolean;
  /** Whether to validate on blur */
  validate?: boolean;
  /** Formatting rules (data-format fallback) */
  fRules?: FormatRules | null;
  /** Validation rules (data-validate fallback) */
  vRules?: ValidationRules | null;
  /** Whether to enable revert functionality */
  revert?: boolean;
  /** Whether to unbind events after rendering */
  unbind?: boolean;
  /** Whether to cache bindings */
  cache?: boolean;
  /** Whether to enable DataSync */
  dataSync?: boolean;
  /** Callback before binding */
  onBeforeBind?: (row: number, data: FormDataRow) => boolean | void;
  /** Callback after binding */
  onBind?: (row: number, data: FormDataRow) => void;
  /** Callback when data changes */
  onChange?: (key: string, value: unknown, row: number, oldValue: unknown) => void;
  /** Callback when row is added */
  onAdd?: (row: number, data: FormDataRow) => void;
  /** Callback when row is removed */
  onRemove?: (row: number, data: FormDataRow) => void;
  /** Internal: element cache */
  elementCache?: Map<string, NaturalElement>;
}

/**
 * User-provided options for Form.
 */
export type FormUserOptions = Partial<
  Omit<FormOptions, 'row' | 'beforeRow' | 'elementCache'>
> & {
  context?: NaturalElement | Element | string;
};

