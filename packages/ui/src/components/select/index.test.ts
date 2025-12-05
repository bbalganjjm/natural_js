/**
 * Tests for Select component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Select, createSelect, SelectDataItem } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('Select', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <select id="test-select"></select>
      <select id="select-with-options">
        <option value="">선택</option>
        <option value="1">옵션1</option>
        <option value="2">옵션2</option>
      </select>
      <div id="checkbox-group">
        <label><input type="checkbox" name="check" value="a"> A</label>
        <label><input type="checkbox" name="check" value="b"> B</label>
      </div>
      <div id="radio-group">
        <label><input type="radio" name="radio" value="x"> X</label>
        <label><input type="radio" name="radio" value="y"> Y</label>
      </div>
      <div id="empty-container"></div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const sampleData: SelectDataItem[] = [
    { code: '1', name: '항목1' },
    { code: '2', name: '항목2' },
    { code: '3', name: '항목3' },
  ];

  describe('constructor', () => {
    it('should create Select instance with string selector', () => {
      const sel = new Select('#test-select');
      expect(sel).toBeInstanceOf(Select);
      sel.destroy();
    });

    it('should create Select instance with NaturalElement', () => {
      const sel = new Select(new NaturalElement('#test-select'));
      expect(sel).toBeInstanceOf(Select);
      sel.destroy();
    });

    it('should create Select instance with Element', () => {
      const element = document.getElementById('test-select')!;
      const sel = new Select(element);
      expect(sel).toBeInstanceOf(Select);
      sel.destroy();
    });

    it('should detect select element type', () => {
      const sel = new Select('#test-select');
      expect(sel.options.type).toBe('select');
      sel.destroy();
    });

    it('should detect checkbox element type', () => {
      const sel = new Select('#checkbox-group');
      expect(sel.options.type).toBe('checkbox');
      sel.destroy();
    });

    it('should detect radio element type', () => {
      const sel = new Select('#radio-group');
      expect(sel.options.type).toBe('radio');
      sel.destroy();
    });

    it('should add select__ class to select element', () => {
      const sel = new Select('#test-select');
      expect(sel.context().hasClass('select__')).toBe(true);
      sel.destroy();
    });

    it('should bind initial data if provided', () => {
      const sel = new Select('#test-select', { data: sampleData, key: 'code', val: 'name' });
      const selectEl = document.getElementById('test-select') as HTMLSelectElement;
      // Empty option + 3 data options
      expect(selectEl.options.length).toBe(4);
      sel.destroy();
    });
  });

  describe('bind()', () => {
    it('should bind data to select element', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name' });
      sel.bind(sampleData);
      
      const selectEl = document.getElementById('test-select') as HTMLSelectElement;
      expect(selectEl.options.length).toBe(4); // empty + 3 items
      expect(selectEl.options[1]?.value).toBe('1');
      expect(selectEl.options[1]?.textContent).toBe('항목1');
      sel.destroy();
    });

    it('should bind data to checkbox elements', () => {
      const sel = new Select('#empty-container', { key: 'code', val: 'name', addEmpty: false });
      sel.options.type = 'checkbox';
      sel.options.name = 'items';
      sel.bind(sampleData);
      
      const inputs = sel.context().find('input');
      expect(inputs.length).toBe(3);
      sel.destroy();
    });

    it('should bind data to radio elements', () => {
      const sel = new Select('#empty-container', { key: 'code', val: 'name', addEmpty: false });
      sel.options.type = 'radio';
      sel.options.name = 'items';
      sel.bind(sampleData);
      
      const inputs = sel.context().find('input');
      expect(inputs.length).toBe(3);
      sel.destroy();
    });

    it('should add empty option when addEmpty is true', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name', addEmpty: true });
      sel.bind(sampleData);
      
      const selectEl = document.getElementById('test-select') as HTMLSelectElement;
      expect(selectEl.options[0]?.value).toBe('');
      sel.destroy();
    });

    it('should not add empty option when addEmpty is false', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name', addEmpty: false });
      sel.bind(sampleData);
      
      const selectEl = document.getElementById('test-select') as HTMLSelectElement;
      expect(selectEl.options[0]?.value).toBe('1');
      sel.destroy();
    });

    it('should call onBind callback', () => {
      const onBind = vi.fn();
      const sel = new Select('#test-select', { key: 'code', val: 'name', onBind });
      sel.bind(sampleData);
      
      expect(onBind).toHaveBeenCalledWith(
        expect.any(NaturalElement),
        sampleData
      );
      sel.destroy();
    });

    it('should return this for chaining', () => {
      const sel = new Select('#test-select');
      expect(sel.bind(sampleData)).toBe(sel);
      sel.destroy();
    });
  });

  describe('val()', () => {
    it('should get selected value for select', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name', addEmpty: false });
      sel.bind(sampleData);
      
      const selectEl = document.getElementById('test-select') as HTMLSelectElement;
      selectEl.value = '2';
      
      expect(sel.val()).toBe('2');
      sel.destroy();
    });

    it('should set selected value for select', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name', addEmpty: false });
      sel.bind(sampleData);
      sel.val('3');
      
      const selectEl = document.getElementById('test-select') as HTMLSelectElement;
      expect(selectEl.value).toBe('3');
      sel.destroy();
    });

    it('should get checked values for checkbox', () => {
      const sel = new Select('#checkbox-group');
      
      const inputs = document.querySelectorAll('#checkbox-group input');
      (inputs[0] as HTMLInputElement).checked = true;
      (inputs[1] as HTMLInputElement).checked = true;
      
      expect(sel.val()).toEqual(['a', 'b']);
      sel.destroy();
    });

    it('should set checked values for checkbox', () => {
      const sel = new Select('#checkbox-group');
      sel.val(['a']);
      
      const inputs = document.querySelectorAll('#checkbox-group input');
      expect((inputs[0] as HTMLInputElement).checked).toBe(true);
      expect((inputs[1] as HTMLInputElement).checked).toBe(false);
      sel.destroy();
    });

    it('should get checked value for radio', () => {
      const sel = new Select('#radio-group');
      
      const inputs = document.querySelectorAll('#radio-group input');
      (inputs[1] as HTMLInputElement).checked = true;
      
      expect(sel.val()).toBe('y');
      sel.destroy();
    });

    it('should set checked value for radio', () => {
      const sel = new Select('#radio-group');
      sel.val('x');
      
      const inputs = document.querySelectorAll('#radio-group input');
      expect((inputs[0] as HTMLInputElement).checked).toBe(true);
      expect((inputs[1] as HTMLInputElement).checked).toBe(false);
      sel.destroy();
    });

    it('should return this when setting value', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name' });
      sel.bind(sampleData);
      expect(sel.val('2')).toBe(sel);
      sel.destroy();
    });
  });

  describe('index()', () => {
    it('should get selected index for select', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name', addEmpty: false });
      sel.bind(sampleData);
      sel.val('2');
      
      expect(sel.index()).toBe(1); // 0-indexed, '2' is second item
      sel.destroy();
    });

    it('should set selected index for select', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name', addEmpty: false });
      sel.bind(sampleData);
      sel.index(2);
      
      expect(sel.val()).toBe('3');
      sel.destroy();
    });

    it('should return this when setting index', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name' });
      sel.bind(sampleData);
      expect(sel.index(1)).toBe(sel);
      sel.destroy();
    });
  });

  describe('remove()', () => {
    it('should remove option by value', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name', addEmpty: false });
      sel.bind(sampleData);
      sel.remove('2');
      
      const selectEl = document.getElementById('test-select') as HTMLSelectElement;
      expect(selectEl.options.length).toBe(2);
      expect(sel.data().length).toBe(2);
      sel.destroy();
    });

    it('should return this for chaining', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name' });
      sel.bind(sampleData);
      expect(sel.remove('1')).toBe(sel);
      sel.destroy();
    });
  });

  describe('reset()', () => {
    it('should reset select to first option', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name' });
      sel.bind(sampleData);
      sel.val('3');
      sel.reset();
      
      const selectEl = document.getElementById('test-select') as HTMLSelectElement;
      expect(selectEl.selectedIndex).toBe(0);
      sel.destroy();
    });

    it('should uncheck all checkboxes', () => {
      const sel = new Select('#checkbox-group');
      sel.val(['a', 'b']);
      sel.reset();
      
      const inputs = document.querySelectorAll('#checkbox-group input');
      expect((inputs[0] as HTMLInputElement).checked).toBe(false);
      expect((inputs[1] as HTMLInputElement).checked).toBe(false);
      sel.destroy();
    });

    it('should return this for chaining', () => {
      const sel = new Select('#test-select');
      expect(sel.reset()).toBe(sel);
      sel.destroy();
    });
  });

  describe('data()', () => {
    it('should return all data', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name' });
      sel.bind(sampleData);
      
      expect(sel.data()).toBe(sampleData);
      sel.destroy();
    });

    it('should return data at index', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name' });
      sel.bind(sampleData);
      
      expect(sel.data(1)).toBe(sampleData[1]);
      sel.destroy();
    });
  });

  describe('selectedData()', () => {
    it('should return selected data for select', () => {
      const sel = new Select('#test-select', { key: 'code', val: 'name', addEmpty: false });
      sel.bind(sampleData);
      sel.val('2');
      
      expect(sel.selectedData()).toEqual(sampleData[1]);
      sel.destroy();
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const sel = new Select('#test-select');
      expect(sel.context().get(0)?.id).toBe('test-select');
      sel.destroy();
    });

    it('should find within context with selector', () => {
      const sel = new Select('#checkbox-group');
      expect(sel.context('input').length).toBe(2);
      sel.destroy();
    });
  });

  describe('onChange callback', () => {
    it('should call onChange when select value changes', () => {
      const onChange = vi.fn();
      
      // Create a fresh select element to avoid test isolation issues
      const freshSelect = document.createElement('select');
      freshSelect.id = 'onChange-test-select';
      container.appendChild(freshSelect);
      
      // Create without data first, then bind
      const sel = new Select(freshSelect, { 
        key: 'code', 
        val: 'name', 
        onChange, 
        addEmpty: false
      });
      
      // Explicitly bind data
      const testData: SelectDataItem[] = [
        { code: '1', name: '항목1' },
        { code: '2', name: '항목2' },
        { code: '3', name: '항목3' },
      ];
      sel.bind(testData);
      
      // Verify options were created
      expect(freshSelect.options.length).toBe(3);
      
      // Select the second option and trigger change
      freshSelect.selectedIndex = 1;
      freshSelect.dispatchEvent(new Event('change', { bubbles: true }));
      
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls[0]?.[0]).toBe('2');
      expect(onChange.mock.calls[0]?.[1]).toBe(1);
      sel.destroy();
    });
  });

  describe('destroy()', () => {
    it('should remove select__ class', () => {
      const sel = new Select('#test-select');
      sel.destroy();
      
      const selectEl = new NaturalElement('#test-select');
      expect(selectEl.hasClass('select__')).toBe(false);
    });

    it('should remove data reference', () => {
      const sel = new Select('#test-select');
      sel.destroy();
      
      const selectEl = new NaturalElement('#test-select');
      expect(selectEl.data('select')).toBeUndefined();
    });
  });
});

describe('createSelect', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<select id="create-select"></select>';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create Select instance', () => {
    const sel = createSelect('#create-select');
    expect(sel).toBeInstanceOf(Select);
    sel.destroy();
  });

  it('should pass options', () => {
    const data = [{ code: '1', name: 'Test' }];
    const sel = createSelect('#create-select', { data, key: 'code', val: 'name' });
    
    const selectEl = document.getElementById('create-select') as HTMLSelectElement;
    expect(selectEl.options.length).toBe(2); // empty + 1
    sel.destroy();
  });
});

