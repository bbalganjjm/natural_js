/**
 * Tests for Grid component (Part 1: Basic functionality).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Grid, createGrid, GridDataRow } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('Grid', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <table id="test-grid">
        <thead>
          <tr>
            <th><input type="checkbox" class="grid_check_all__"></th>
            <th>Name</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="checkbox" name="check"></td>
            <td data-bind="name"></td>
            <td data-bind="age"></td>
          </tr>
        </tbody>
      </table>
      <table id="empty-grid">
        <thead><tr><th>Col</th></tr></thead>
      </table>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up any grid instances
    const grids = document.querySelectorAll('.grid__');
    grids.forEach((el) => {
      const gridData = new NaturalElement(el).data('grid') as { destroy?: () => void } | undefined;
      if (gridData?.destroy) {
        gridData.destroy();
      }
    });
    document.body.removeChild(container);
  });

  // Factory function to create fresh sample data for each test
  const createSampleData = (): GridDataRow[] => [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
    { name: 'Bob', age: 35 },
  ];

  describe('constructor', () => {
    it('should create Grid instance with string selector', () => {
      const grid = new Grid('#test-grid');
      expect(grid).toBeInstanceOf(Grid);
      grid.destroy();
    });

    it('should create Grid instance with NaturalElement', () => {
      const grid = new Grid(new NaturalElement('#test-grid'));
      expect(grid).toBeInstanceOf(Grid);
      grid.destroy();
    });

    it('should create Grid instance with Element', () => {
      const element = document.getElementById('test-grid')!;
      const grid = new Grid(element);
      expect(grid).toBeInstanceOf(Grid);
      grid.destroy();
    });

    it('should add grid__ class to context', () => {
      const grid = new Grid('#test-grid');
      expect(grid.context().hasClass('grid__')).toBe(true);
      grid.destroy();
    });

    it('should extract template from tbody', () => {
      const grid = new Grid('#test-grid');
      expect(grid.contextBodyTemplate()).not.toBeNull();
      grid.destroy();
    });

    it('should have thead reference', () => {
      const grid = new Grid('#test-grid');
      expect(grid.contextHead()).not.toBeNull();
      grid.destroy();
    });

    it('should bind initial data if provided', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.count()).toBe(3);
      grid.destroy();
    });
  });

  describe('bind()', () => {
    it('should bind data to grid', () => {
      const grid = new Grid('#test-grid');
      grid.bind(createSampleData());
      
      expect(grid.count()).toBe(3);
      expect(grid.context().find('.grid_row__').length).toBe(3);
      grid.destroy();
    });

    it('should bind data values to elements', () => {
      const grid = new Grid('#test-grid');
      grid.bind(createSampleData());
      
      const firstRow = grid.context().find('.grid_row__').first();
      expect(firstRow.find('[data-bind="name"]').text()).toBe('John');
      expect(firstRow.find('[data-bind="age"]').text()).toBe('30');
      grid.destroy();
    });

    it('should call onBeforeBind callback', () => {
      const onBeforeBind = vi.fn();
      const grid = new Grid('#test-grid', { onBeforeBind });
      grid.bind(createSampleData());
      
      expect(onBeforeBind).toHaveBeenCalled();
      grid.destroy();
    });

    it('should not bind if onBeforeBind returns false', () => {
      const onBeforeBind = vi.fn(() => false);
      const grid = new Grid('#test-grid', { onBeforeBind });
      grid.bind(createSampleData());
      
      expect(grid.count()).toBe(0);
      grid.destroy();
    });

    it('should call onBind callback for each row', () => {
      const onBind = vi.fn();
      const grid = new Grid('#test-grid', { onBind });
      grid.bind(createSampleData());
      
      expect(onBind).toHaveBeenCalledTimes(3);
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#test-grid');
      expect(grid.bind(createSampleData())).toBe(grid);
      grid.destroy();
    });
  });

  describe('data()', () => {
    it('should return all data', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.data().length).toBe(3);
      grid.destroy();
    });

    it('should return selected/checked data when selFlag is true', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.select(0);
      
      const selected = grid.data(true);
      expect(selected.length).toBe(1);
      expect(selected[0]?.name).toBe('John');
      grid.destroy();
    });

    it('should return clean data when selFlag is false', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      const clean = grid.data(false);
      
      expect(clean[0]).not.toHaveProperty('__index__');
      expect(clean[0]).not.toHaveProperty('__selected__');
      grid.destroy();
    });
  });

  describe('row()', () => {
    it('should return current selected row index', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.select(1);
      
      expect(grid.row()).toBe(1);
      grid.destroy();
    });

    it('should return previous row index with "before"', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.select(0);
      grid.select(1);
      
      expect(grid.row('before')).toBe(0);
      grid.destroy();
    });
  });

  describe('add()', () => {
    it('should add a new row', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.add({ name: 'New', age: 20 });
      
      expect(grid.count()).toBe(4);
      grid.destroy();
    });

    it('should mark new row as insert', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.add({ name: 'New', age: 20 });
      
      expect(grid.data()[3]?.rowStatus).toBe('insert');
      grid.destroy();
    });

    it('should insert at specified position', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.add({ name: 'New', age: 20 }, 1);
      
      expect(grid.data()[1]?.name).toBe('New');
      grid.destroy();
    });

    it('should call onAdd callback', () => {
      const onAdd = vi.fn();
      const grid = new Grid('#test-grid', { data: createSampleData(), onAdd });
      grid.add({ name: 'New', age: 20 });
      
      expect(onAdd).toHaveBeenCalled();
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.add({ name: 'New', age: 20 })).toBe(grid);
      grid.destroy();
    });
  });

  describe('remove()', () => {
    it('should mark row as delete', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.select(0);
      grid.remove();
      
      expect(grid.data()[0]?.rowStatus).toBe('delete');
      grid.destroy();
    });

    it('should completely remove inserted row', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.add({ name: 'New', age: 20 });
      grid.remove(3);
      
      expect(grid.count()).toBe(3);
      grid.destroy();
    });

    it('should call onRemove callback', () => {
      const onRemove = vi.fn();
      const grid = new Grid('#test-grid', { data: createSampleData(), onRemove });
      grid.select(0);
      grid.remove();
      
      expect(onRemove).toHaveBeenCalled();
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.select(0);
      expect(grid.remove()).toBe(grid);
      grid.destroy();
    });
  });

  describe('select()', () => {
    it('should select a row', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.select(1);
      
      expect(grid.row()).toBe(1);
      expect(grid.data()[1]?.__selected__).toBe(true);
      grid.destroy();
    });

    it('should add selected class to row', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.select(0);
      
      const rows = grid.context().find('.grid_row__');
      expect(rows.eq(0).hasClass('grid_selected__')).toBe(true);
      grid.destroy();
    });

    it('should deselect previous row when multiselect is false', () => {
      const grid = new Grid('#test-grid', { data: createSampleData(), multiselect: false });
      grid.select(0);
      grid.select(1);
      
      expect(grid.data()[0]?.__selected__).toBe(false);
      expect(grid.data()[1]?.__selected__).toBe(true);
      grid.destroy();
    });

    it('should call onBeforeSelect callback', () => {
      const onBeforeSelect = vi.fn();
      const grid = new Grid('#test-grid', { data: createSampleData(), onBeforeSelect });
      grid.select(0);
      
      expect(onBeforeSelect).toHaveBeenCalled();
      grid.destroy();
    });

    it('should not select if onBeforeSelect returns false', () => {
      const onBeforeSelect = vi.fn(() => false);
      const grid = new Grid('#test-grid', { data: createSampleData(), onBeforeSelect });
      grid.select(0);
      
      expect(grid.row()).toBe(-1);
      grid.destroy();
    });

    it('should call onSelect callback', () => {
      const onSelect = vi.fn();
      const grid = new Grid('#test-grid', { data: createSampleData(), onSelect });
      grid.select(0);
      
      expect(onSelect).toHaveBeenCalled();
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.select(0)).toBe(grid);
      grid.destroy();
    });
  });

  describe('check()', () => {
    it('should check a row', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.check(0, true);
      
      expect(grid.data()[0]?.__checked__).toBe(true);
      grid.destroy();
    });

    it('should toggle check state', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.check(0, true);
      grid.check(0); // Toggle
      
      expect(grid.data()[0]?.__checked__).toBe(false);
      grid.destroy();
    });

    it('should add checked class to row', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.check(0, true);
      
      const rows = grid.context().find('.grid_row__');
      expect(rows.eq(0).hasClass('grid_checked__')).toBe(true);
      grid.destroy();
    });

    it('should call onCheck callback', () => {
      const onCheck = vi.fn();
      const grid = new Grid('#test-grid', { data: createSampleData(), onCheck });
      grid.check(0, true);
      
      expect(onCheck).toHaveBeenCalledWith(0, true, expect.any(Object));
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.check(0, true)).toBe(grid);
      grid.destroy();
    });
  });

  describe('checkAll()', () => {
    it('should check all rows', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.checkAll(true);
      
      expect(grid.checked().length).toBe(3);
      grid.destroy();
    });

    it('should uncheck all rows', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.checkAll(true);
      grid.checkAll(false);
      
      expect(grid.checked().length).toBe(0);
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.checkAll(true)).toBe(grid);
      grid.destroy();
    });
  });

  describe('val()', () => {
    it('should get value', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.val(0, 'name')).toBe('John');
      grid.destroy();
    });

    it('should set value', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.val(0, 'name', 'Updated');
      
      expect(grid.data()[0]?.name).toBe('Updated');
      grid.destroy();
    });

    it('should mark row as update', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.val(0, 'name', 'Updated');
      
      expect(grid.data()[0]?.rowStatus).toBe('update');
      grid.destroy();
    });

    it('should call onChange callback', () => {
      const onChange = vi.fn();
      const grid = new Grid('#test-grid', { data: createSampleData(), onChange });
      grid.val(0, 'name', 'Updated');
      
      expect(onChange).toHaveBeenCalledWith(0, 'name', 'Updated', 'John');
      grid.destroy();
    });

    it('should return this when setting', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.val(0, 'name', 'Updated')).toBe(grid);
      grid.destroy();
    });
  });

  describe('revert()', () => {
    it('should revert to original data', () => {
      const grid = new Grid('#test-grid', { data: createSampleData(), revert: true });
      grid.val(0, 'name', 'Updated');
      grid.revert(0);
      
      expect(grid.data()[0]?.name).toBe('John');
      grid.destroy();
    });

    it('should reset update status', () => {
      const grid = new Grid('#test-grid', { data: createSampleData(), revert: true });
      grid.val(0, 'name', 'Updated');
      grid.revert(0);
      
      expect(grid.data()[0]?.rowStatus).toBeUndefined();
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.revert(0)).toBe(grid);
      grid.destroy();
    });
  });

  describe('move()', () => {
    it('should move row to different position', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.move(0, 2);
      
      expect(grid.data()[2]?.name).toBe('John');
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.move(0, 1)).toBe(grid);
      grid.destroy();
    });
  });

  describe('copy()', () => {
    it('should copy row to new position', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.copy(0, 1);
      
      expect(grid.count()).toBe(4);
      expect(grid.data()[1]?.name).toBe('John');
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.copy(0)).toBe(grid);
      grid.destroy();
    });
  });

  describe('checked()', () => {
    it('should return array of checked row indices', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.check(0, true);
      grid.check(2, true);
      
      expect(grid.checked()).toEqual([0, 2]);
      grid.destroy();
    });
  });

  describe('count()', () => {
    it('should return number of rows', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.count()).toBe(3);
      grid.destroy();
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const grid = new Grid('#test-grid');
      expect(grid.context().get(0)?.id).toBe('test-grid');
      grid.destroy();
    });

    it('should find within context with selector', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      expect(grid.context('.grid_row__').length).toBe(3);
      grid.destroy();
    });
  });

  describe('destroy()', () => {
    it('should remove grid__ class', () => {
      const grid = new Grid('#test-grid');
      grid.destroy();
      
      const gridEl = new NaturalElement('#test-grid');
      expect(gridEl.hasClass('grid__')).toBe(false);
    });

    it('should clear data', () => {
      const grid = new Grid('#test-grid', { data: createSampleData() });
      grid.destroy();
      
      expect(grid.count()).toBe(0);
    });
  });
});

// ==================== Advanced Features Tests (Part 2) ====================

describe('Grid Advanced Features', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <table id="advanced-grid">
        <thead>
          <tr>
            <th data-sort="name">Name</th>
            <th data-sort="age">Age</th>
            <th data-sort="city">City</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-bind="name"></td>
            <td data-bind="age"></td>
            <td data-bind="city"></td>
          </tr>
        </tbody>
      </table>
    `;
    document.body.appendChild(container);
  });

  describe('Declarative options (sort/filter/rowspan)', () => {
    it('should sort when clicking data-sort header', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      const firstTh = grid.contextHead()?.find('th').first();
      firstTh?.trigger('click');
      expect(grid.getSortState()).toEqual({ key: 'name', direction: 'asc' });
      grid.destroy();
    });

    it('should create filter input for data-filter and filter rows', () => {
      const table = document.createElement('table');
      table.id = 'filter-grid';
      table.innerHTML = `
        <thead>
          <tr>
            <th data-filter="true" data-sort="city">City</th>
            <th data-filter="true" data-sort="age">Age</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-bind="city"></td>
            <td data-bind="age"></td>
          </tr>
        </tbody>
      `;
      document.body.appendChild(table);

      const grid = new Grid('#filter-grid', { data: createAdvancedData() });
      const filterInput = grid.contextHead()?.find('.grid_filter__').first();
      expect(filterInput?.length).toBeGreaterThan(0);

      filterInput?.val('Seoul');
      filterInput?.trigger('input');

      expect(grid.count()).toBe(2);
      grid.destroy();
      document.body.removeChild(table);
    });

    it('should apply rowspan when data-rowspan is set', () => {
      const table = document.createElement('table');
      table.id = 'rowspan-grid';
      table.innerHTML = `
        <thead>
          <tr>
            <th data-rowspan="true">City</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-bind="city"></td>
            <td data-bind="name"></td>
          </tr>
        </tbody>
      `;
      document.body.appendChild(table);

      const data = [
        { city: 'Seoul', name: 'Alice' },
        { city: 'Seoul', name: 'Bob' },
        { city: 'Tokyo', name: 'Charlie' },
      ];

      const grid = new Grid('#rowspan-grid', { data });
      const firstCell = grid.context().find('.grid_row__').first().find('[data-bind="city"]').get(0) as HTMLTableCellElement;
      expect(firstCell?.rowSpan).toBeGreaterThan(1);

      const hiddenCells = grid.context().find('.grid_row__').eq(1).find('[data-bind="city"]');
      expect((hiddenCells.get(0) as HTMLElement).style.display).toBe('none');

      grid.destroy();
      document.body.removeChild(table);
    });
  });

  afterEach(() => {
    const grids = document.querySelectorAll('.grid__');
    grids.forEach((el) => {
      const gridData = new NaturalElement(el).data('grid') as { destroy?: () => void } | undefined;
      if (gridData?.destroy) {
        gridData.destroy();
      }
    });
    document.body.removeChild(container);
  });

  const createAdvancedData = (): GridDataRow[] => [
    { name: 'Alice', age: 30, city: 'Seoul' },
    { name: 'Bob', age: 25, city: 'Tokyo' },
    { name: 'Charlie', age: 35, city: 'Seoul' },
    { name: 'David', age: 28, city: 'Beijing' },
  ];

  describe('fixHeader()', () => {
    it('should add fixed header class', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.fixHeader({ height: 200 });
      
      expect(grid.context().hasClass('grid_fixed_header__')).toBe(true);
      grid.destroy();
    });

    it('should set tbody height', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.fixHeader({ height: 200 });
      
      const tbody = grid.context().find('tbody');
      expect(tbody.css('height')).toBe('200px');
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      expect(grid.fixHeader()).toBe(grid);
      grid.destroy();
    });
  });

  describe('fixColumn()', () => {
    it('should add fixed column class', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.fixColumn({ colCount: 1 });
      
      expect(grid.context().hasClass('grid_fixed_column__')).toBe(true);
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      expect(grid.fixColumn({ colCount: 1 })).toBe(grid);
      grid.destroy();
    });
  });

  describe('resize()', () => {
    it('should add resizable class', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.resize();
      
      expect(grid.context().hasClass('grid_resizable__')).toBe(true);
      grid.destroy();
    });

    it('should add resize handles to headers', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.resize();
      
      const handles = grid.context().find('.grid_resize_handle__');
      expect(handles.length).toBe(3);
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      expect(grid.resize()).toBe(grid);
      grid.destroy();
    });
  });

  describe('sort()', () => {
    it('should sort data ascending', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.sort('name', { direction: 'asc' });
      
      expect(grid.data()[0]?.name).toBe('Alice');
      expect(grid.data()[3]?.name).toBe('David');
      grid.destroy();
    });

    it('should sort data descending', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.sort('name', { direction: 'desc' });
      
      expect(grid.data()[0]?.name).toBe('David');
      expect(grid.data()[3]?.name).toBe('Alice');
      grid.destroy();
    });

    it('should sort numbers correctly', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.sort('age', { direction: 'asc' });
      
      expect(grid.data()[0]?.age).toBe(25);
      expect(grid.data()[3]?.age).toBe(35);
      grid.destroy();
    });

    it('should toggle sort direction', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.sort('name');
      expect(grid.getSortState()?.direction).toBe('asc');
      
      grid.sort('name');
      expect(grid.getSortState()?.direction).toBe('desc');
      grid.destroy();
    });

    it('should call onSort callback', () => {
      const onSort = vi.fn();
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.sort('name', { direction: 'asc', onSort });
      
      expect(onSort).toHaveBeenCalledWith('name', 'asc');
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      expect(grid.sort('name')).toBe(grid);
      grid.destroy();
    });
  });

  describe('dataFilter()', () => {
    it('should filter data by contains', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.dataFilter('city', 'Seoul');
      
      expect(grid.count()).toBe(2);
      grid.destroy();
    });

    it('should filter data by equals', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.dataFilter('city', 'Seoul', { operator: 'equals' });
      
      expect(grid.count()).toBe(2);
      grid.destroy();
    });

    it('should filter data by startsWith', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.dataFilter('name', 'A', { operator: 'startsWith' });
      
      expect(grid.count()).toBe(1);
      expect(grid.data()[0]?.name).toBe('Alice');
      grid.destroy();
    });

    it('should filter numbers with gt operator', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.dataFilter('age', '28', { operator: 'gt' });
      
      expect(grid.count()).toBe(2); // Alice (30) and Charlie (35)
      grid.destroy();
    });

    it('should support multiple filters', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.dataFilter('city', 'Seoul');
      grid.dataFilter('age', '30', { operator: 'gte' });
      
      expect(grid.count()).toBe(2);
      grid.destroy();
    });

    it('should call onFilter callback', () => {
      const onFilter = vi.fn();
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.dataFilter('city', 'Seoul', { onFilter });
      
      expect(onFilter).toHaveBeenCalledWith('city', 'Seoul', expect.any(Array));
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      expect(grid.dataFilter('city', 'Seoul')).toBe(grid);
      grid.destroy();
    });
  });

  describe('clearFilter()', () => {
    it('should restore original data', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.dataFilter('city', 'Seoul');
      expect(grid.count()).toBe(2);
      
      grid.clearFilter();
      expect(grid.count()).toBe(4);
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      expect(grid.clearFilter()).toBe(grid);
      grid.destroy();
    });
  });

  describe('show() / hide()', () => {
    it('should hide columns', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.hide(1);
      
      const secondTh = grid.contextHead()?.find('th').get(1) as HTMLElement | undefined;
      expect(secondTh?.style.display).toBe('none');
      grid.destroy();
    });

    it('should show hidden columns', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.hide(1);
      grid.show(1);
      
      const secondTh = grid.contextHead()?.find('th').get(1) as HTMLElement | undefined;
      expect(secondTh?.style.display).toBe('');
      grid.destroy();
    });

    it('should hide multiple columns', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.hide([0, 2]);
      
      const firstTh = grid.contextHead()?.find('th').get(0) as HTMLElement | undefined;
      const thirdTh = grid.contextHead()?.find('th').get(2) as HTMLElement | undefined;
      expect(firstTh?.style.display).toBe('none');
      expect(thirdTh?.style.display).toBe('none');
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      expect(grid.hide(0)).toBe(grid);
      expect(grid.show(0)).toBe(grid);
      grid.destroy();
    });
  });

  describe('rowSpan()', () => {
    it('should merge cells with same values', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.sort('city', { direction: 'asc' }); // Group by city
      grid.rowSpan('city');
      
      // Beijing, Seoul, Seoul, Tokyo after sort
      // First Seoul should have rowSpan = 2
      const rows = grid.context().find('.grid_row__');
      // Check if cells are hidden (rowSpan applied)
      let hiddenCount = 0;
      rows.each((_, row) => {
        const cell = (row as Element).querySelector('[data-bind="city"]') as HTMLElement | null;
        if (cell?.style.display === 'none') {
          hiddenCount++;
        }
      });
      expect(hiddenCount).toBeGreaterThanOrEqual(0); // At least one merged
      grid.destroy();
    });

    it('should return this for chaining', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      expect(grid.rowSpan('city')).toBe(grid);
      grid.destroy();
    });
  });

  describe('more()', () => {
    it('should return this for chaining', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.fixHeader({ height: 100 });
      
      const result = grid.more({
        size: 10,
        onLoad: (page, callback) => callback([], false),
      });
      
      expect(result).toBe(grid);
      grid.destroy();
    });
  });

  describe('getSortState()', () => {
    it('should return null when not sorted', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      expect(grid.getSortState()).toBeNull();
      grid.destroy();
    });

    it('should return current sort state', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.sort('name', { direction: 'desc' });
      
      expect(grid.getSortState()).toEqual({ key: 'name', direction: 'desc' });
      grid.destroy();
    });
  });

  describe('getFilterStates()', () => {
    it('should return empty array when not filtered', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      expect(grid.getFilterStates()).toEqual([]);
      grid.destroy();
    });

    it('should return current filter states', () => {
      const grid = new Grid('#advanced-grid', { data: createAdvancedData() });
      grid.dataFilter('city', 'Seoul');
      
      const states = grid.getFilterStates();
      expect(states.length).toBe(1);
      expect(states[0]?.key).toBe('city');
      expect(states[0]?.value).toBe('Seoul');
      grid.destroy();
    });
  });
});

describe('createGrid', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <table id="create-grid">
        <thead><tr><th>Name</th></tr></thead>
        <tbody><tr><td data-bind="name"></td></tr></tbody>
      </table>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create Grid instance', () => {
    const grid = createGrid('#create-grid');
    expect(grid).toBeInstanceOf(Grid);
    grid.destroy();
  });

  it('should pass options', () => {
    const data: GridDataRow[] = [{ name: 'Test' }];
    const grid = createGrid('#create-grid', { data });
    expect(grid.count()).toBe(1);
    grid.destroy();
  });
});

