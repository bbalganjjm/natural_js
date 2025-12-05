/**
 * Tests for List component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { List, createList, ListDataRow } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('List', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <ul id="test-list">
        <li>
          <span id="name"></span>
          <span id="age"></span>
          <input type="checkbox" name="check">
        </li>
      </ul>
      <ul id="empty-list"></ul>
      <input type="checkbox" class="list_check_all__" id="checkAll">
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up any list instances
    const lists = document.querySelectorAll('.list__');
    lists.forEach((el) => {
      const listData = new NaturalElement(el).data('list');
      if (listData && typeof listData.destroy === 'function') {
        listData.destroy();
      }
    });
    document.body.removeChild(container);
  });

  // Factory function to create fresh sample data for each test
  const createSampleData = (): ListDataRow[] => [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
    { name: 'Bob', age: 35 },
  ];

  describe('constructor', () => {
    it('should create List instance with string selector', () => {
      const list = new List('#test-list');
      expect(list).toBeInstanceOf(List);
      list.destroy();
    });

    it('should create List instance with NaturalElement', () => {
      const list = new List(new NaturalElement('#test-list'));
      expect(list).toBeInstanceOf(List);
      list.destroy();
    });

    it('should create List instance with Element', () => {
      const element = document.getElementById('test-list')!;
      const list = new List(element);
      expect(list).toBeInstanceOf(List);
      list.destroy();
    });

    it('should add list__ class to context', () => {
      const list = new List('#test-list');
      expect(list.context().hasClass('list__')).toBe(true);
      list.destroy();
    });

    it('should extract template from first child', () => {
      const list = new List('#test-list');
      expect(list.contextBodyTemplate()).not.toBeNull();
      list.destroy();
    });

    it('should set height if specified', () => {
      const list = new List('#test-list', { height: 300 });
      expect(list.context().css('height')).toBe('300px');
      list.destroy();
    });

    it('should bind initial data if provided', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.count()).toBe(3);
      list.destroy();
    });
  });

  describe('bind()', () => {
    it('should bind data to list', () => {
      const list = new List('#test-list');
      list.bind(createSampleData());
      
      expect(list.count()).toBe(3);
      expect(list.context().find('.list_row__').length).toBe(3);
      list.destroy();
    });

    it('should bind data values to elements', () => {
      const list = new List('#test-list');
      list.bind(createSampleData());
      
      const firstRow = list.context().find('.list_row__').first();
      expect(firstRow.find('#name').text()).toBe('John');
      expect(firstRow.find('#age').text()).toBe('30');
      list.destroy();
    });

    it('should call onBeforeBind callback', () => {
      const onBeforeBind = vi.fn();
      const list = new List('#test-list', { onBeforeBind });
      list.bind(createSampleData());
      
      expect(onBeforeBind).toHaveBeenCalled();
      list.destroy();
    });

    it('should not bind if onBeforeBind returns false', () => {
      const onBeforeBind = vi.fn(() => false);
      const list = new List('#test-list', { onBeforeBind });
      list.bind(createSampleData());
      
      expect(list.count()).toBe(0);
      list.destroy();
    });

    it('should call onBind callback for each row', () => {
      const onBind = vi.fn();
      const list = new List('#test-list', { onBind });
      list.bind(createSampleData());
      
      expect(onBind).toHaveBeenCalledTimes(3);
      list.destroy();
    });

    it('should return this for chaining', () => {
      const list = new List('#test-list');
      expect(list.bind(createSampleData())).toBe(list);
      list.destroy();
    });
  });

  describe('data()', () => {
    it('should return all data', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.data().length).toBe(3);
      list.destroy();
    });

    it('should return selected/checked data when selFlag is true', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.select(0);
      
      const selected = list.data(true);
      expect(selected.length).toBe(1);
      expect(selected[0]?.name).toBe('John');
      list.destroy();
    });

    it('should return clean data when selFlag is false', () => {
      const list = new List('#test-list', { data: createSampleData() });
      const clean = list.data(false);
      
      expect(clean[0]).not.toHaveProperty('__index__');
      expect(clean[0]).not.toHaveProperty('__selected__');
      list.destroy();
    });
  });

  describe('row()', () => {
    it('should return current selected row index', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.select(1);
      
      expect(list.row()).toBe(1);
      list.destroy();
    });

    it('should return previous row index with "before"', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.select(0);
      list.select(1);
      
      expect(list.row('before')).toBe(0);
      list.destroy();
    });
  });

  describe('add()', () => {
    it('should add a new row', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.add({ name: 'New', age: 20 });
      
      expect(list.count()).toBe(4);
      list.destroy();
    });

    it('should mark new row as insert', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.add({ name: 'New', age: 20 });
      
      expect(list.data()[3]?.rowStatus).toBe('insert');
      list.destroy();
    });

    it('should insert at specified position', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.add({ name: 'New', age: 20 }, 1);
      
      expect(list.data()[1]?.name).toBe('New');
      list.destroy();
    });

    it('should call onAdd callback', () => {
      const onAdd = vi.fn();
      const list = new List('#test-list', { data: createSampleData(), onAdd });
      list.add({ name: 'New', age: 20 });
      
      expect(onAdd).toHaveBeenCalled();
      list.destroy();
    });

    it('should return this for chaining', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.add({ name: 'New', age: 20 })).toBe(list);
      list.destroy();
    });
  });

  describe('remove()', () => {
    it('should mark row as delete', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.select(0);
      list.remove();
      
      expect(list.data()[0]?.rowStatus).toBe('delete');
      list.destroy();
    });

    it('should completely remove inserted row', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.add({ name: 'New', age: 20 });
      list.remove(3);
      
      expect(list.count()).toBe(3);
      list.destroy();
    });

    it('should call onRemove callback', () => {
      const onRemove = vi.fn();
      const list = new List('#test-list', { data: createSampleData(), onRemove });
      list.select(0);
      list.remove();
      
      expect(onRemove).toHaveBeenCalled();
      list.destroy();
    });

    it('should return this for chaining', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.select(0);
      expect(list.remove()).toBe(list);
      list.destroy();
    });
  });

  describe('select()', () => {
    it('should select a row', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.select(1);
      
      expect(list.row()).toBe(1);
      expect(list.data()[1]?.__selected__).toBe(true);
      list.destroy();
    });

    it('should add selected class to row', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.select(0);
      
      const rows = list.context().find('.list_row__');
      expect(rows.eq(0).hasClass('list_selected__')).toBe(true);
      list.destroy();
    });

    it('should deselect previous row when multiselect is false', () => {
      const list = new List('#test-list', { data: createSampleData(), multiselect: false });
      list.select(0);
      list.select(1);
      
      expect(list.data()[0]?.__selected__).toBe(false);
      expect(list.data()[1]?.__selected__).toBe(true);
      list.destroy();
    });

    it('should call onBeforeSelect callback', () => {
      const onBeforeSelect = vi.fn();
      const list = new List('#test-list', { data: createSampleData(), onBeforeSelect });
      list.select(0);
      
      expect(onBeforeSelect).toHaveBeenCalled();
      list.destroy();
    });

    it('should not select if onBeforeSelect returns false', () => {
      const onBeforeSelect = vi.fn(() => false);
      const list = new List('#test-list', { data: createSampleData(), onBeforeSelect });
      list.select(0);
      
      expect(list.row()).toBe(-1);
      list.destroy();
    });

    it('should call onSelect callback', () => {
      const onSelect = vi.fn();
      const list = new List('#test-list', { data: createSampleData(), onSelect });
      list.select(0);
      
      expect(onSelect).toHaveBeenCalled();
      list.destroy();
    });

    it('should return this for chaining', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.select(0)).toBe(list);
      list.destroy();
    });
  });

  describe('check()', () => {
    it('should check a row', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.check(0, true);
      
      expect(list.data()[0]?.__checked__).toBe(true);
      list.destroy();
    });

    it('should toggle check state', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.check(0, true);
      list.check(0); // Toggle
      
      expect(list.data()[0]?.__checked__).toBe(false);
      list.destroy();
    });

    it('should add checked class to row', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.check(0, true);
      
      const rows = list.context().find('.list_row__');
      expect(rows.eq(0).hasClass('list_checked__')).toBe(true);
      list.destroy();
    });

    it('should call onCheck callback', () => {
      const onCheck = vi.fn();
      const list = new List('#test-list', { data: createSampleData(), onCheck });
      list.check(0, true);
      
      expect(onCheck).toHaveBeenCalledWith(0, true, expect.any(Object));
      list.destroy();
    });

    it('should return this for chaining', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.check(0, true)).toBe(list);
      list.destroy();
    });
  });

  describe('checkAll()', () => {
    it('should check all rows', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.checkAll(true);
      
      expect(list.checked().length).toBe(3);
      list.destroy();
    });

    it('should uncheck all rows', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.checkAll(true);
      list.checkAll(false);
      
      expect(list.checked().length).toBe(0);
      list.destroy();
    });

    it('should return this for chaining', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.checkAll(true)).toBe(list);
      list.destroy();
    });
  });

  describe('val()', () => {
    it('should get value', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.val(0, 'name')).toBe('John');
      list.destroy();
    });

    it('should set value', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.val(0, 'name', 'Updated');
      
      expect(list.data()[0]?.name).toBe('Updated');
      list.destroy();
    });

    it('should mark row as update', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.val(0, 'name', 'Updated');
      
      expect(list.data()[0]?.rowStatus).toBe('update');
      list.destroy();
    });

    it('should call onChange callback', () => {
      const onChange = vi.fn();
      const list = new List('#test-list', { data: createSampleData(), onChange });
      list.val(0, 'name', 'Updated');
      
      expect(onChange).toHaveBeenCalledWith(0, 'name', 'Updated', 'John');
      list.destroy();
    });

    it('should return this when setting', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.val(0, 'name', 'Updated')).toBe(list);
      list.destroy();
    });
  });

  describe('revert()', () => {
    it('should revert to original data', () => {
      const list = new List('#test-list', { data: createSampleData(), revert: true });
      list.val(0, 'name', 'Updated');
      list.revert(0);
      
      expect(list.data()[0]?.name).toBe('John');
      list.destroy();
    });

    it('should reset update status', () => {
      const list = new List('#test-list', { data: createSampleData(), revert: true });
      list.val(0, 'name', 'Updated');
      list.revert(0);
      
      expect(list.data()[0]?.rowStatus).toBeUndefined();
      list.destroy();
    });

    it('should return this for chaining', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.revert(0)).toBe(list);
      list.destroy();
    });
  });

  describe('move()', () => {
    it('should move row to different position', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.move(0, 2);
      
      expect(list.data()[2]?.name).toBe('John');
      list.destroy();
    });

    it('should return this for chaining', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.move(0, 1)).toBe(list);
      list.destroy();
    });
  });

  describe('copy()', () => {
    it('should copy row to new position', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.copy(0, 1);
      
      expect(list.count()).toBe(4);
      expect(list.data()[1]?.name).toBe('John');
      list.destroy();
    });

    it('should return this for chaining', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.copy(0)).toBe(list);
      list.destroy();
    });
  });

  describe('checked()', () => {
    it('should return array of checked row indices', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.check(0, true);
      list.check(2, true);
      
      expect(list.checked()).toEqual([0, 2]);
      list.destroy();
    });
  });

  describe('count()', () => {
    it('should return number of rows', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.count()).toBe(3);
      list.destroy();
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const list = new List('#test-list');
      expect(list.context().get(0)?.id).toBe('test-list');
      list.destroy();
    });

    it('should find within context with selector', () => {
      const list = new List('#test-list', { data: createSampleData() });
      expect(list.context('.list_row__').length).toBe(3);
      list.destroy();
    });
  });

  describe('destroy()', () => {
    it('should remove list__ class', () => {
      const list = new List('#test-list');
      list.destroy();
      
      const listEl = new NaturalElement('#test-list');
      expect(listEl.hasClass('list__')).toBe(false);
    });

    it('should clear data', () => {
      const list = new List('#test-list', { data: createSampleData() });
      list.destroy();
      
      expect(list.count()).toBe(0);
    });
  });
});

describe('createList', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <ul id="create-list">
        <li><span id="name"></span></li>
      </ul>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create List instance', () => {
    const list = createList('#create-list');
    expect(list).toBeInstanceOf(List);
    list.destroy();
  });

  it('should pass options', () => {
    const data: ListDataRow[] = [{ name: 'Test' }];
    const list = createList('#create-list', { data });
    expect(list.count()).toBe(1);
    list.destroy();
  });
});

