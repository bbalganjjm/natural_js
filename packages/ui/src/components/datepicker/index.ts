/**
 * Datepicker component for Natural-JS.
 */

import { NaturalElement, isBrowser, getDocument, getWindow } from '@natural-js/shared';
import { isString, isFunction } from '@natural-js/core';
import { DatepickerOptions, DatepickerUserOptions, DatepickerText } from './types';
import { getMaxZIndex } from '../../utils';

export * from './types';

const DEFAULT_TEXT: DatepickerText = {
  months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthsShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  days: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  daysShort: ['일', '월', '화', '수', '목', '금', '토'],
  daysMin: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
  clear: '지우기',
  close: '닫기',
  prev: '이전',
  next: '다음',
};

const DEFAULT_OPTIONS: Partial<DatepickerOptions> = {
  monthOnly: false,
  yearsPanelPosition: 'left',
  yearsCount: 12,
  format: 'Y-m-d',
  locale: 'ko_KR',
  firstDayOfWeek: 0,
  showWeekNumbers: false,
  highlightToday: true,
  autoClose: true,
  showButtons: true,
  showAdjacentMonths: true,
  panelClass: 'datepicker_contents__',
  selectedClass: 'datepicker_selected__',
  todayClass: 'datepicker_today__',
  disabledClass: 'datepicker_disabled__',
  text: DEFAULT_TEXT,
};

/**
 * Datepicker component for date selection.
 */
export class Datepicker {
  public options: DatepickerOptions;
  private documentClickHandler: ((e: MouseEvent) => void) | null = null;

  constructor(context: NaturalElement | Element | string, opts?: DatepickerUserOptions) {
    if (!isBrowser()) {
      this.options = {} as DatepickerOptions;
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

    this.options = {
      ...DEFAULT_OPTIONS,
      ...opts,
      context: contextEl,
      viewDate: new Date(),
      selectedDate: null,
      panel: null,
      isOpen: false,
      text: { ...DEFAULT_TEXT, ...(opts?.text || {}) },
    } as DatepickerOptions;

    // Parse initial value from input
    const inputVal = contextEl.val() as string;
    if (inputVal) {
      const parsed = this.parseDate(inputVal);
      if (parsed) {
        this.options.selectedDate = parsed;
        this.options.viewDate = new Date(parsed);
      }
    }

    // Parse minDate/maxDate
    if (opts?.minDate) {
      this.options.minDate = this.parseDate(opts.minDate) || undefined;
    }
    if (opts?.maxDate) {
      this.options.maxDate = this.parseDate(opts.maxDate) || undefined;
    }

    this.init();
  }

  /**
   * Initialize the datepicker.
   */
  private init(): void {
    const opts = this.options;

    // Add datepicker class to input
    opts.context.addClass('datepicker_input__');

    // Bind click event to show panel
    opts.context.on('click.datepicker focus.datepicker', () => {
      if (!opts.isOpen) {
        this.show();
      }
    });

    // Store reference
    opts.context.data('datepicker', this);
  }

  /**
   * Parse a date from string or Date object.
   */
  private parseDate(value: Date | string | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    
    // Try parsing various formats
    const str = value.replace(/[^0-9]/g, '');
    
    if (str.length === 8) {
      // YYYYMMDD
      const year = parseInt(str.substring(0, 4), 10);
      const month = parseInt(str.substring(4, 6), 10) - 1;
      const day = parseInt(str.substring(6, 8), 10);
      return new Date(year, month, day);
    } else if (str.length === 6) {
      // YYYYMM
      const year = parseInt(str.substring(0, 4), 10);
      const month = parseInt(str.substring(4, 6), 10) - 1;
      return new Date(year, month, 1);
    }
    
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * Format a date to string.
   */
  private formatDate(date: Date): string {
    const opts = this.options;
    const format = opts.format || 'Y-m-d';
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    return format
      .replace(/Y/g, String(year))
      .replace(/y/g, String(year).slice(-2))
      .replace(/m/g, String(month + 1).padStart(2, '0'))
      .replace(/n/g, String(month + 1))
      .replace(/d/g, String(day).padStart(2, '0'))
      .replace(/j/g, String(day));
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Show the datepicker panel.
   */
  show(): this {
    const opts = this.options;
    const doc = getDocument();
    const win = getWindow();

    if (!isBrowser() || !doc || !win || opts.isOpen) return this;

    // Call onBeforeShow
    if (opts.onBeforeShow) {
      const result = opts.onBeforeShow(opts.context);
      if (result === false) return this;
    }

    // Create panel if not exists
    if (!opts.panel) {
      this.createPanel();
    }

    // Position panel
    this.positionPanel();

    // Show panel
    opts.panel?.show();
    opts.isOpen = true;

    // Call onShow
    if (opts.onShow && opts.panel) {
      opts.onShow(opts.panel);
    }

    // Add document click handler to close
    this.documentClickHandler = (e: MouseEvent) => {
      const target = e.target as Element;
      const panelEl = opts.panel?.get(0);
      const contextEl = opts.context.get(0);
      
      if (panelEl && contextEl && !panelEl.contains(target) && !contextEl.contains(target)) {
        this.hide();
      }
    };
    
    setTimeout(() => {
      doc.addEventListener('click', this.documentClickHandler!);
    }, 0);

    return this;
  }

  /**
   * Create the datepicker panel.
   */
  private createPanel(): void {
    const opts = this.options;
    const doc = getDocument();
    if (!doc) return;

    const panel = doc.createElement('div');
    panel.className = `${opts.panelClass} hidden__`;
    panel.style.display = 'none';
    panel.style.position = 'absolute';
    panel.style.zIndex = String(getMaxZIndex() + 1);

    opts.panel = new NaturalElement(panel);
    
    // Append to container or body
    if (opts.container) {
      opts.container.append(panel);
    } else {
      doc.body.appendChild(panel);
    }

    this.renderPanel();
  }

  /**
   * Render the datepicker panel content.
   */
  private renderPanel(): void {
    const opts = this.options;
    if (!opts.panel) return;

    const viewDate = opts.viewDate || new Date();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    let html = '<div class="datepicker_header__">';
    html += `<button type="button" class="datepicker_prev__" title="${opts.text?.prev}">&lt;</button>`;
    html += `<span class="datepicker_title__">${year}년 ${opts.text?.months?.[month]}</span>`;
    html += `<button type="button" class="datepicker_next__" title="${opts.text?.next}">&gt;</button>`;
    html += '</div>';

    if (!opts.monthOnly) {
      html += '<div class="datepicker_body__">';
      html += this.renderDaysHeader();
      html += this.renderDays(year, month);
      html += '</div>';
    } else {
      html += '<div class="datepicker_body__">';
      html += this.renderMonths(year);
      html += '</div>';
    }

    if (opts.showButtons) {
      html += '<div class="datepicker_footer__">';
      html += `<button type="button" class="datepicker_today__">${opts.text?.today}</button>`;
      html += `<button type="button" class="datepicker_clear__">${opts.text?.clear}</button>`;
      html += `<button type="button" class="datepicker_close__">${opts.text?.close}</button>`;
      html += '</div>';
    }

    opts.panel.html(html);
    this.bindPanelEvents();
  }

  /**
   * Render the days header.
   */
  private renderDaysHeader(): string {
    const opts = this.options;
    const daysMin = opts.text?.daysMin || ['일', '월', '화', '수', '목', '금', '토'];
    const firstDay = opts.firstDayOfWeek || 0;

    let html = '<div class="datepicker_day_titles__">';
    for (let i = 0; i < 7; i++) {
      const dayIndex = (firstDay + i) % 7;
      html += `<span class="datepicker_day_title__">${daysMin[dayIndex]}</span>`;
    }
    html += '</div>';
    return html;
  }

  /**
   * Render the days grid.
   */
  private renderDays(year: number, month: number): string {
    const opts = this.options;
    const firstDay = opts.firstDayOfWeek || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const startDay = firstOfMonth.getDay();
    const daysInMonth = lastOfMonth.getDate();
    
    // Calculate starting position
    let startOffset = startDay - firstDay;
    if (startOffset < 0) startOffset += 7;
    
    let html = '<div class="datepicker_days_panel__">';
    
    // Previous month days
    if (opts.showAdjacentMonths && startOffset > 0) {
      const prevMonth = new Date(year, month, 0);
      const prevDays = prevMonth.getDate();
      for (let i = startOffset - 1; i >= 0; i--) {
        const day = prevDays - i;
        html += `<span class="datepicker_prev_day_item__" data-date="${year}-${month}-${day}">${day}</span>`;
      }
    } else {
      for (let i = 0; i < startOffset; i++) {
        html += '<span class="datepicker_day_item__"></span>';
      }
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const classes = ['datepicker_day_item__'];
      
      // Check if today
      if (opts.highlightToday && date.getTime() === today.getTime()) {
        classes.push(opts.todayClass || 'datepicker_today__');
      }
      
      // Check if selected
      if (opts.selectedDate && date.getTime() === opts.selectedDate.getTime()) {
        classes.push(opts.selectedClass || 'datepicker_selected__');
      }
      
      // Check if disabled (min/max date)
      const isDisabled = this.isDateDisabled(date);
      if (isDisabled) {
        classes.push(opts.disabledClass || 'datepicker_disabled__');
      }
      
      const dateStr = `${year}-${month + 1}-${day}`;
      html += `<span class="${classes.join(' ')}" data-date="${dateStr}"${isDisabled ? ' data-disabled="true"' : ''}>${day}</span>`;
    }
    
    // Next month days
    const totalCells = startOffset + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    if (opts.showAdjacentMonths && remainingCells > 0) {
      for (let i = 1; i <= remainingCells; i++) {
        html += `<span class="datepicker_next_day_item__" data-date="${year}-${month + 2}-${i}">${i}</span>`;
      }
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Render the months grid.
   */
  private renderMonths(year: number): string {
    const opts = this.options;
    const months = opts.text?.monthsShort || DEFAULT_TEXT.monthsShort!;
    
    let html = '<div class="datepicker_months_panel__">';
    for (let i = 0; i < 12; i++) {
      const classes = ['datepicker_month_item__'];
      
      if (opts.selectedDate && opts.selectedDate.getFullYear() === year && opts.selectedDate.getMonth() === i) {
        classes.push('datepicker_month_selected__');
      }
      
      html += `<span class="${classes.join(' ')}" data-month="${i}">${months[i]}</span>`;
    }
    html += '</div>';
    return html;
  }

  /**
   * Check if a date is disabled.
   */
  private isDateDisabled(date: Date): boolean {
    const opts = this.options;
    
    if (opts.minDate && date < opts.minDate) return true;
    if (opts.maxDate && date > opts.maxDate) return true;
    
    return false;
  }

  /**
   * Bind events to the panel.
   */
  private bindPanelEvents(): void {
    const opts = this.options;
    if (!opts.panel) return;

    const self = this;

    // Previous/Next buttons
    opts.panel.find('.datepicker_prev__').on('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      self.prevMonth();
    });

    opts.panel.find('.datepicker_next__').on('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      self.nextMonth();
    });

    // Day selection
    opts.panel.find('.datepicker_day__:not(.datepicker_empty__):not(.datepicker_adjacent__)').on('click', function (this: Element, e: Event) {
      e.preventDefault();
      e.stopPropagation();
      const el = this as HTMLElement;
      if (el.dataset.disabled === 'true') return;
      
      const dateStr = el.dataset.date;
      if (dateStr) {
        const parts = dateStr.split('-').map(Number);
        const y = parts[0] ?? 1970;
        const m = parts[1] ?? 1;
        const d = parts[2] ?? 1;
        self.selectDate(new Date(y, m - 1, d));
      }
    });

    // Month selection (monthOnly mode)
    opts.panel.find('.datepicker_month__').on('click', function (this: Element, e: Event) {
      e.preventDefault();
      e.stopPropagation();
      const el = this as HTMLElement;
      const monthIndex = parseInt(el.dataset.month || '0', 10);
      const viewDate = opts.viewDate || new Date();
      self.selectDate(new Date(viewDate.getFullYear(), monthIndex, 1));
    });

    // Footer buttons
    opts.panel.find('.datepicker_today__').on('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      self.selectDate(new Date());
    });

    opts.panel.find('.datepicker_clear__').on('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      self.clear();
    });

    opts.panel.find('.datepicker_close__').on('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      self.hide();
    });
  }

  /**
   * Position the panel relative to the input.
   */
  private positionPanel(): void {
    const opts = this.options;
    const win = getWindow();
    if (!opts.panel || !win) return;

    const offset = opts.context.offset();
    const height = opts.context.outerHeight() || 0;

    if (offset) {
      opts.panel.css('top', `${offset.top + height}px`);
      opts.panel.css('left', `${offset.left}px`);
    }
  }

  /**
   * Select a date.
   */
  selectDate(date: Date): this {
    const opts = this.options;

    // Check if disabled
    if (this.isDateDisabled(date)) return this;

    opts.selectedDate = date;
    opts.viewDate = new Date(date);

    // Update input value
    const formatted = this.formatDate(date);
    opts.context.val(formatted);

    // Re-render panel
    this.renderPanel();

    // Call onSelect
    if (opts.onSelect) {
      opts.onSelect(date, formatted);
    }

    // Auto close
    if (opts.autoClose) {
      this.hide();
    }

    return this;
  }

  /**
   * Clear the selected date.
   */
  clear(): this {
    const opts = this.options;
    opts.selectedDate = null;
    opts.context.val('');
    this.renderPanel();
    return this;
  }

  /**
   * Go to the previous month.
   */
  prevMonth(): this {
    const opts = this.options;
    const viewDate = opts.viewDate || new Date();
    viewDate.setMonth(viewDate.getMonth() - 1);
    opts.viewDate = viewDate;
    
    this.renderPanel();
    
    if (opts.onChangeMonthYear) {
      opts.onChangeMonthYear(viewDate.getFullYear(), viewDate.getMonth());
    }
    
    return this;
  }

  /**
   * Go to the next month.
   */
  nextMonth(): this {
    const opts = this.options;
    const viewDate = opts.viewDate || new Date();
    viewDate.setMonth(viewDate.getMonth() + 1);
    opts.viewDate = viewDate;
    
    this.renderPanel();
    
    if (opts.onChangeMonthYear) {
      opts.onChangeMonthYear(viewDate.getFullYear(), viewDate.getMonth());
    }
    
    return this;
  }

  /**
   * Set the view date.
   */
  setViewDate(year: number, month: number): this {
    const opts = this.options;
    opts.viewDate = new Date(year, month, 1);
    this.renderPanel();
    return this;
  }

  /**
   * Get the selected date.
   */
  getDate(): Date | null {
    return this.options.selectedDate || null;
  }

  /**
   * Set the date.
   */
  setDate(date: Date | string | null): this {
    if (date === null) {
      return this.clear();
    }
    
    const parsed = this.parseDate(date);
    if (parsed) {
      this.selectDate(parsed);
    }
    return this;
  }

  /**
   * Hide the datepicker panel.
   */
  hide(): this {
    const opts = this.options;
    const doc = getDocument();

    if (!isBrowser() || !doc || !opts.isOpen) return this;

    // Call onBeforeHide
    if (opts.onBeforeHide && opts.panel) {
      const result = opts.onBeforeHide(opts.panel);
      if (result === false) return this;
    }

    opts.panel?.hide();
    opts.isOpen = false;

    // Remove document click handler
    if (this.documentClickHandler) {
      doc.removeEventListener('click', this.documentClickHandler);
      this.documentClickHandler = null;
    }

    // Call onHide
    if (opts.onHide && opts.panel) {
      opts.onHide(opts.panel);
    }

    return this;
  }

  /**
   * Destroy the datepicker.
   */
  destroy(): void {
    const opts = this.options;
    const doc = getDocument();

    if (!doc) return;

    // Remove event handlers
    opts.context.off('click.datepicker focus.datepicker');
    
    if (this.documentClickHandler) {
      doc.removeEventListener('click', this.documentClickHandler);
      this.documentClickHandler = null;
    }

    // Remove panel
    opts.panel?.remove();

    // Remove classes and data
    opts.context.removeClass('datepicker_input__');
    opts.context.removeData('datepicker');
  }
}

/**
 * Factory function to create a Datepicker instance.
 */
export function createDatepicker(
  context: NaturalElement | Element | string,
  opts?: DatepickerUserOptions
): Datepicker {
  return new Datepicker(context, opts);
}

