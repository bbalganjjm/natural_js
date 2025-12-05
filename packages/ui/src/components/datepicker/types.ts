/**
 * Types for the Datepicker component.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Options for the Datepicker component.
 */
export interface DatepickerOptions {
  /** Context element (input element) */
  context: NaturalElement;
  /** Container for the datepicker panel */
  container?: NaturalElement;
  /** Minimum selectable date */
  minDate?: Date | string;
  /** Maximum selectable date */
  maxDate?: Date | string;
  /** Whether to show only year and month (no day selection) */
  monthOnly?: boolean;
  /** Position of the years panel ('left', 'right', 'center') */
  yearsPanelPosition?: 'left' | 'right' | 'center';
  /** Number of years to show in the years panel */
  yearsCount?: number;
  /** Date format for input/output */
  format?: string;
  /** Locale for month/day names */
  locale?: string;
  /** First day of the week (0 = Sunday, 1 = Monday, etc.) */
  firstDayOfWeek?: number;
  /** Whether to show week numbers */
  showWeekNumbers?: boolean;
  /** Whether to highlight today */
  highlightToday?: boolean;
  /** Whether to close on date selection */
  autoClose?: boolean;
  /** Whether to show buttons (today, clear, close) */
  showButtons?: boolean;
  /** Whether to show adjacent month dates */
  showAdjacentMonths?: boolean;
  /** Callback when date is selected */
  onSelect?: (date: Date, formattedDate: string) => void;
  /** Callback before panel opens */
  onBeforeShow?: (input: NaturalElement) => boolean | void;
  /** Callback after panel opens */
  onShow?: (panel: NaturalElement) => void;
  /** Callback before panel closes */
  onBeforeHide?: (panel: NaturalElement) => boolean | void;
  /** Callback after panel closes */
  onHide?: (panel: NaturalElement) => void;
  /** Callback when month/year changes */
  onChangeMonthYear?: (year: number, month: number) => void;
  /** CSS class for the datepicker panel */
  panelClass?: string;
  /** CSS class for selected date */
  selectedClass?: string;
  /** CSS class for today */
  todayClass?: string;
  /** CSS class for disabled dates */
  disabledClass?: string;
  /** Localized text */
  text?: DatepickerText;
  /** Internal: currently displayed date */
  viewDate?: Date;
  /** Internal: selected date */
  selectedDate?: Date | null;
  /** Internal: datepicker panel element */
  panel?: NaturalElement | null;
  /** Internal: is panel visible */
  isOpen?: boolean;
}

/**
 * Localized text for the datepicker.
 */
export interface DatepickerText {
  /** Month names */
  months?: string[];
  /** Short month names */
  monthsShort?: string[];
  /** Day names */
  days?: string[];
  /** Short day names */
  daysShort?: string[];
  /** Minimum day names */
  daysMin?: string[];
  /** Today button text */
  today?: string;
  /** Clear button text */
  clear?: string;
  /** Close button text */
  close?: string;
  /** Previous button title */
  prev?: string;
  /** Next button title */
  next?: string;
}

/**
 * User-provided options for Datepicker.
 */
export type DatepickerUserOptions = Partial<
  Omit<DatepickerOptions, 'context' | 'viewDate' | 'selectedDate' | 'panel' | 'isOpen'>
>;

