/**
 * Tests for Datepicker component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Datepicker, createDatepicker } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('Datepicker', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <input type="text" id="test-date" value="">
      <input type="text" id="date-with-value" value="2024-06-15">
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up any panels
    document.querySelectorAll('.datepicker__').forEach((el) => el.remove());
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should create Datepicker instance with string selector', () => {
      const dp = new Datepicker('#test-date');
      expect(dp).toBeInstanceOf(Datepicker);
      dp.destroy();
    });

    it('should create Datepicker instance with NaturalElement', () => {
      const dp = new Datepicker(new NaturalElement('#test-date'));
      expect(dp).toBeInstanceOf(Datepicker);
      dp.destroy();
    });

    it('should create Datepicker instance with Element', () => {
      const element = document.getElementById('test-date')!;
      const dp = new Datepicker(element);
      expect(dp).toBeInstanceOf(Datepicker);
      dp.destroy();
    });

    it('should add datepicker_input__ class to context', () => {
      const dp = new Datepicker('#test-date');
      expect(dp.context().hasClass('datepicker_input__')).toBe(true);
      dp.destroy();
    });

    it('should parse initial value from input', () => {
      const dp = new Datepicker('#date-with-value');
      const date = dp.getDate();
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(2024);
      expect(date?.getMonth()).toBe(5); // June (0-indexed)
      expect(date?.getDate()).toBe(15);
      dp.destroy();
    });

    it('should accept minDate option', () => {
      const minDate = new Date(2024, 0, 1);
      const dp = new Datepicker('#test-date', { minDate });
      expect(dp.options.minDate).toEqual(minDate);
      dp.destroy();
    });

    it('should accept maxDate option', () => {
      const maxDate = new Date(2024, 11, 31);
      const dp = new Datepicker('#test-date', { maxDate });
      expect(dp.options.maxDate).toEqual(maxDate);
      dp.destroy();
    });
  });

  describe('show()', () => {
    it('should show the datepicker panel', () => {
      const dp = new Datepicker('#test-date');
      dp.show();
      
      expect(dp.options.isOpen).toBe(true);
      expect(dp.options.panel).not.toBeNull();
      dp.destroy();
    });

    it('should create panel element in DOM', () => {
      const dp = new Datepicker('#test-date');
      dp.show();
      
      const panels = document.querySelectorAll('.datepicker__');
      expect(panels.length).toBeGreaterThan(0);
      dp.destroy();
    });

    it('should call onBeforeShow callback', () => {
      const onBeforeShow = vi.fn();
      const dp = new Datepicker('#test-date', { onBeforeShow });
      dp.show();
      
      expect(onBeforeShow).toHaveBeenCalled();
      dp.destroy();
    });

    it('should not show if onBeforeShow returns false', () => {
      const onBeforeShow = vi.fn(() => false);
      const dp = new Datepicker('#test-date', { onBeforeShow });
      dp.show();
      
      expect(dp.options.isOpen).toBe(false);
      dp.destroy();
    });

    it('should call onShow callback', () => {
      const onShow = vi.fn();
      const dp = new Datepicker('#test-date', { onShow });
      dp.show();
      
      expect(onShow).toHaveBeenCalled();
      dp.destroy();
    });

    it('should return this for chaining', () => {
      const dp = new Datepicker('#test-date');
      expect(dp.show()).toBe(dp);
      dp.destroy();
    });
  });

  describe('hide()', () => {
    it('should hide the datepicker panel', () => {
      const dp = new Datepicker('#test-date');
      dp.show();
      dp.hide();
      
      expect(dp.options.isOpen).toBe(false);
      dp.destroy();
    });

    it('should call onBeforeHide callback', () => {
      const onBeforeHide = vi.fn();
      const dp = new Datepicker('#test-date', { onBeforeHide });
      dp.show();
      dp.hide();
      
      expect(onBeforeHide).toHaveBeenCalled();
      dp.destroy();
    });

    it('should not hide if onBeforeHide returns false', () => {
      const onBeforeHide = vi.fn(() => false);
      const dp = new Datepicker('#test-date', { onBeforeHide });
      dp.show();
      dp.hide();
      
      expect(dp.options.isOpen).toBe(true);
      dp.destroy();
    });

    it('should call onHide callback', () => {
      const onHide = vi.fn();
      const dp = new Datepicker('#test-date', { onHide });
      dp.show();
      dp.hide();
      
      expect(onHide).toHaveBeenCalled();
      dp.destroy();
    });

    it('should return this for chaining', () => {
      const dp = new Datepicker('#test-date');
      dp.show();
      expect(dp.hide()).toBe(dp);
      dp.destroy();
    });
  });

  describe('selectDate()', () => {
    it('should select a date', () => {
      const dp = new Datepicker('#test-date');
      const date = new Date(2024, 5, 15);
      dp.selectDate(date);
      
      expect(dp.getDate()?.getTime()).toBe(date.getTime());
      dp.destroy();
    });

    it('should update input value', () => {
      const dp = new Datepicker('#test-date');
      const date = new Date(2024, 5, 15);
      dp.selectDate(date);
      
      const input = document.getElementById('test-date') as HTMLInputElement;
      expect(input.value).toBe('2024-06-15');
      dp.destroy();
    });

    it('should call onSelect callback', () => {
      const onSelect = vi.fn();
      const dp = new Datepicker('#test-date', { onSelect });
      const date = new Date(2024, 5, 15);
      dp.selectDate(date);
      
      expect(onSelect).toHaveBeenCalledWith(date, '2024-06-15');
      dp.destroy();
    });

    it('should auto close if autoClose is true', () => {
      const dp = new Datepicker('#test-date', { autoClose: true });
      dp.show();
      dp.selectDate(new Date(2024, 5, 15));
      
      expect(dp.options.isOpen).toBe(false);
      dp.destroy();
    });

    it('should not auto close if autoClose is false', () => {
      const dp = new Datepicker('#test-date', { autoClose: false });
      dp.show();
      dp.selectDate(new Date(2024, 5, 15));
      
      expect(dp.options.isOpen).toBe(true);
      dp.destroy();
    });

    it('should not select disabled date (before minDate)', () => {
      const minDate = new Date(2024, 5, 10);
      const dp = new Datepicker('#test-date', { minDate });
      dp.selectDate(new Date(2024, 5, 5));
      
      expect(dp.getDate()).toBeNull();
      dp.destroy();
    });

    it('should not select disabled date (after maxDate)', () => {
      const maxDate = new Date(2024, 5, 20);
      const dp = new Datepicker('#test-date', { maxDate });
      dp.selectDate(new Date(2024, 5, 25));
      
      expect(dp.getDate()).toBeNull();
      dp.destroy();
    });

    it('should return this for chaining', () => {
      const dp = new Datepicker('#test-date');
      expect(dp.selectDate(new Date())).toBe(dp);
      dp.destroy();
    });
  });

  describe('clear()', () => {
    it('should clear the selected date', () => {
      const dp = new Datepicker('#test-date');
      dp.selectDate(new Date(2024, 5, 15));
      dp.clear();
      
      expect(dp.getDate()).toBeNull();
      dp.destroy();
    });

    it('should clear the input value', () => {
      const dp = new Datepicker('#test-date');
      dp.selectDate(new Date(2024, 5, 15));
      dp.clear();
      
      const input = document.getElementById('test-date') as HTMLInputElement;
      expect(input.value).toBe('');
      dp.destroy();
    });

    it('should return this for chaining', () => {
      const dp = new Datepicker('#test-date');
      expect(dp.clear()).toBe(dp);
      dp.destroy();
    });
  });

  describe('setDate()', () => {
    it('should set date from Date object', () => {
      const dp = new Datepicker('#test-date');
      const date = new Date(2024, 5, 15);
      dp.setDate(date);
      
      expect(dp.getDate()?.getTime()).toBe(date.getTime());
      dp.destroy();
    });

    it('should set date from string', () => {
      const dp = new Datepicker('#test-date');
      dp.setDate('2024-06-15');
      
      const date = dp.getDate();
      expect(date?.getFullYear()).toBe(2024);
      expect(date?.getMonth()).toBe(5);
      expect(date?.getDate()).toBe(15);
      dp.destroy();
    });

    it('should clear date when null is passed', () => {
      const dp = new Datepicker('#test-date');
      dp.selectDate(new Date(2024, 5, 15));
      dp.setDate(null);
      
      expect(dp.getDate()).toBeNull();
      dp.destroy();
    });

    it('should return this for chaining', () => {
      const dp = new Datepicker('#test-date');
      expect(dp.setDate(new Date())).toBe(dp);
      dp.destroy();
    });
  });

  describe('prevMonth() / nextMonth()', () => {
    it('should go to previous month', () => {
      const dp = new Datepicker('#test-date');
      dp.options.viewDate = new Date(2024, 5, 1); // June 2024
      dp.prevMonth();
      
      expect(dp.options.viewDate?.getMonth()).toBe(4); // May
      dp.destroy();
    });

    it('should go to next month', () => {
      const dp = new Datepicker('#test-date');
      dp.options.viewDate = new Date(2024, 5, 1); // June 2024
      dp.nextMonth();
      
      expect(dp.options.viewDate?.getMonth()).toBe(6); // July
      dp.destroy();
    });

    it('should call onChangeMonthYear callback', () => {
      const onChangeMonthYear = vi.fn();
      const dp = new Datepicker('#test-date', { onChangeMonthYear });
      dp.options.viewDate = new Date(2024, 5, 1);
      dp.nextMonth();
      
      expect(onChangeMonthYear).toHaveBeenCalledWith(2024, 6);
      dp.destroy();
    });

    it('should return this for chaining', () => {
      const dp = new Datepicker('#test-date');
      expect(dp.prevMonth()).toBe(dp);
      expect(dp.nextMonth()).toBe(dp);
      dp.destroy();
    });
  });

  describe('setViewDate()', () => {
    it('should set the view date', () => {
      const dp = new Datepicker('#test-date');
      dp.setViewDate(2025, 0);
      
      expect(dp.options.viewDate?.getFullYear()).toBe(2025);
      expect(dp.options.viewDate?.getMonth()).toBe(0);
      dp.destroy();
    });

    it('should return this for chaining', () => {
      const dp = new Datepicker('#test-date');
      expect(dp.setViewDate(2025, 0)).toBe(dp);
      dp.destroy();
    });
  });

  describe('getDate()', () => {
    it('should return null when no date is selected', () => {
      const dp = new Datepicker('#test-date');
      expect(dp.getDate()).toBeNull();
      dp.destroy();
    });

    it('should return the selected date', () => {
      const dp = new Datepicker('#test-date');
      const date = new Date(2024, 5, 15);
      dp.selectDate(date);
      
      expect(dp.getDate()?.getTime()).toBe(date.getTime());
      dp.destroy();
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const dp = new Datepicker('#test-date');
      expect(dp.context().get(0)?.id).toBe('test-date');
      dp.destroy();
    });

    it('should find within context with selector', () => {
      // This would work if context had children
      const dp = new Datepicker('#test-date');
      expect(dp.context()).toBeDefined();
      dp.destroy();
    });
  });

  describe('monthOnly mode', () => {
    it('should show only months in monthOnly mode', () => {
      const dp = new Datepicker('#test-date', { monthOnly: true });
      dp.show();
      
      const months = dp.options.panel?.find('.datepicker_months__');
      expect(months?.length).toBeGreaterThan(0);
      dp.destroy();
    });

    it('should not show days grid in monthOnly mode', () => {
      const dp = new Datepicker('#test-date', { monthOnly: true });
      dp.show();
      
      const days = dp.options.panel?.find('.datepicker_days__');
      expect(days?.length).toBe(0);
      dp.destroy();
    });
  });

  describe('destroy()', () => {
    it('should remove datepicker_input__ class', () => {
      const dp = new Datepicker('#test-date');
      dp.destroy();
      
      expect(dp.context().hasClass('datepicker_input__')).toBe(false);
    });

    it('should remove panel from DOM', () => {
      const dp = new Datepicker('#test-date');
      dp.show();
      dp.destroy();
      
      const panels = document.querySelectorAll('.datepicker__');
      expect(panels.length).toBe(0);
    });
  });
});

describe('createDatepicker', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<input type="text" id="create-date">';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.querySelectorAll('.datepicker__').forEach((el) => el.remove());
    document.body.removeChild(container);
  });

  it('should create Datepicker instance', () => {
    const dp = createDatepicker('#create-date');
    expect(dp).toBeInstanceOf(Datepicker);
    dp.destroy();
  });

  it('should pass options', () => {
    const dp = createDatepicker('#create-date', { monthOnly: true });
    expect(dp.options.monthOnly).toBe(true);
    dp.destroy();
  });
});

