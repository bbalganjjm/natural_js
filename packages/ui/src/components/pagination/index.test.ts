/**
 * Tests for Pagination component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Pagination, createPagination } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('Pagination', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<div id="test-pagination"></div>';
    document.body.appendChild(container);
  });

  afterEach(() => {
    const paginations = document.querySelectorAll('.pagination__');
    paginations.forEach((el) => {
      const paginationData = new NaturalElement(el).data('pagination');
      if (paginationData && typeof paginationData.destroy === 'function') {
        paginationData.destroy();
      }
    });
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should create Pagination instance with string selector', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      expect(pagination).toBeInstanceOf(Pagination);
      pagination.destroy();
    });

    it('should create Pagination instance with NaturalElement', () => {
      const pagination = new Pagination(new NaturalElement('#test-pagination'), { totalCount: 100 });
      expect(pagination).toBeInstanceOf(Pagination);
      pagination.destroy();
    });

    it('should add pagination__ class', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      expect(pagination.context().hasClass('pagination__')).toBe(true);
      pagination.destroy();
    });

    it('should render pagination buttons', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      const buttons = pagination.context().find('button');
      expect(buttons.length).toBeGreaterThan(0);
      pagination.destroy();
    });
  });

  describe('bind()', () => {
    it('should bind with total count', () => {
      const pagination = new Pagination('#test-pagination');
      pagination.bind(50);
      
      expect(pagination.totalCount()).toBe(50);
      pagination.destroy();
    });

    it('should bind with total count and page number', () => {
      const pagination = new Pagination('#test-pagination');
      pagination.bind(100, 3);
      
      expect(pagination.totalCount()).toBe(100);
      expect(pagination.pageNo()).toBe(3);
      pagination.destroy();
    });

    it('should return this for chaining', () => {
      const pagination = new Pagination('#test-pagination');
      expect(pagination.bind(100)).toBe(pagination);
      pagination.destroy();
    });
  });

  describe('totalCount()', () => {
    it('should get total count', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 150 });
      expect(pagination.totalCount()).toBe(150);
      pagination.destroy();
    });

    it('should set total count', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      pagination.totalCount(200);
      
      expect(pagination.totalCount()).toBe(200);
      pagination.destroy();
    });

    it('should return this when setting', () => {
      const pagination = new Pagination('#test-pagination');
      expect(pagination.totalCount(100)).toBe(pagination);
      pagination.destroy();
    });
  });

  describe('pageNo()', () => {
    it('should get current page number', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100, pageNo: 3 });
      expect(pagination.pageNo()).toBe(3);
      pagination.destroy();
    });

    it('should set page number', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      pagination.pageNo(5);
      
      expect(pagination.pageNo()).toBe(5);
      pagination.destroy();
    });

    it('should not exceed total pages', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 30, countPerPage: 10 });
      pagination.pageNo(10);
      
      expect(pagination.pageNo()).toBe(3); // Only 3 pages
      pagination.destroy();
    });

    it('should not go below 1', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      pagination.pageNo(0);
      
      expect(pagination.pageNo()).toBe(1);
      pagination.destroy();
    });

    it('should call onChange callback', () => {
      const onChange = vi.fn();
      const pagination = new Pagination('#test-pagination', { totalCount: 100, onChange });
      pagination.pageNo(3);
      
      expect(onChange).toHaveBeenCalledWith(3, expect.any(Object));
      pagination.destroy();
    });

    it('should return this when setting', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      expect(pagination.pageNo(2)).toBe(pagination);
      pagination.destroy();
    });
  });

  describe('countPerPage()', () => {
    it('should get items per page', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100, countPerPage: 20 });
      expect(pagination.countPerPage()).toBe(20);
      pagination.destroy();
    });

    it('should set items per page', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      pagination.countPerPage(25);
      
      expect(pagination.countPerPage()).toBe(25);
      pagination.destroy();
    });

    it('should reset to page 1 when changing', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      pagination.pageNo(5);
      pagination.countPerPage(20);
      
      expect(pagination.pageNo()).toBe(1);
      pagination.destroy();
    });

    it('should return this when setting', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      expect(pagination.countPerPage(20)).toBe(pagination);
      pagination.destroy();
    });
  });

  describe('currPageNavInfo()', () => {
    it('should return page navigation info', () => {
      const pagination = new Pagination('#test-pagination', { 
        totalCount: 100, 
        countPerPage: 10,
        countPerPageSet: 5,
        pageNo: 3 
      });
      
      const info = pagination.currPageNavInfo();
      expect(info.pageNo).toBe(3);
      expect(info.totalPages).toBe(10);
      expect(info.totalCount).toBe(100);
      expect(info.countPerPage).toBe(10);
      expect(info.firstPage).toBe(1);
      expect(info.lastPage).toBe(5);
      expect(info.hasPrevSet).toBe(false);
      expect(info.hasNextSet).toBe(true);
      expect(info.hasPrev).toBe(true);
      expect(info.hasNext).toBe(true);
      pagination.destroy();
    });

    it('should handle first page', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100, pageNo: 1 });
      const info = pagination.currPageNavInfo();
      
      expect(info.hasPrev).toBe(false);
      pagination.destroy();
    });

    it('should handle last page', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100, countPerPage: 10, pageNo: 10 });
      const info = pagination.currPageNavInfo();
      
      expect(info.hasNext).toBe(false);
      pagination.destroy();
    });
  });

  describe('first() / last()', () => {
    it('should go to first page', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100, pageNo: 5 });
      pagination.first();
      
      expect(pagination.pageNo()).toBe(1);
      pagination.destroy();
    });

    it('should go to last page', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100, countPerPage: 10 });
      pagination.last();
      
      expect(pagination.pageNo()).toBe(10);
      pagination.destroy();
    });
  });

  describe('prev() / next()', () => {
    it('should go to previous page', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100, pageNo: 5 });
      pagination.prev();
      
      expect(pagination.pageNo()).toBe(4);
      pagination.destroy();
    });

    it('should go to next page', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100, pageNo: 5 });
      pagination.next();
      
      expect(pagination.pageNo()).toBe(6);
      pagination.destroy();
    });

    it('should not go below 1 with prev', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100, pageNo: 1 });
      pagination.prev();
      
      expect(pagination.pageNo()).toBe(1);
      pagination.destroy();
    });

    it('should not exceed total pages with next', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 30, countPerPage: 10, pageNo: 3 });
      pagination.next();
      
      expect(pagination.pageNo()).toBe(3);
      pagination.destroy();
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      expect(pagination.context().get(0)?.id).toBe('test-pagination');
      pagination.destroy();
    });

    it('should find within context with selector', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      expect(pagination.context('.pagination_nav__').length).toBe(1);
      pagination.destroy();
    });
  });

  describe('destroy()', () => {
    it('should remove pagination__ class', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      pagination.destroy();
      
      const el = new NaturalElement('#test-pagination');
      expect(el.hasClass('pagination__')).toBe(false);
    });

    it('should clear content', () => {
      const pagination = new Pagination('#test-pagination', { totalCount: 100 });
      pagination.destroy();
      
      const el = document.getElementById('test-pagination');
      expect(el?.innerHTML).toBe('');
    });
  });
});

describe('createPagination', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<div id="create-pagination"></div>';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create Pagination instance', () => {
    const pagination = createPagination('#create-pagination', { totalCount: 100 });
    expect(pagination).toBeInstanceOf(Pagination);
    pagination.destroy();
  });
});

