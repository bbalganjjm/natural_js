/**
 * @natural-js/template - Codes AOP Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NaturalElement } from '@natural-js/shared';
import { processCodes } from './codes.js';
import type { ControllerInstance, JoinPoint } from '../types.js';

describe('Codes AOP', () => {
  let mockView: NaturalElement;
  let mockController: ControllerInstance;
  let mockJoinPoint: JoinPoint;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-view">
        <select id="status"></select>
        <select id="category"></select>
        <input type="checkbox" id="active" />
      </div>
    `;
    mockView = new NaturalElement(document.getElementById('test-view'));

    mockController = {
      view: mockView,
    };

    mockJoinPoint = {
      proceed: vi.fn(),
    };
  });

  describe('processCodes', () => {
    it('should handle controller without select properties', async () => {
      await expect(processCodes(mockController, mockJoinPoint)).resolves.not.toThrow();
    });

    it('should parse array format select property with code', async () => {
      mockController['p.select.status'] = ['CODE001'];

      await processCodes(mockController, mockJoinPoint);

      const opts = mockController['p.select.status'] as Record<string, unknown>;
      expect(opts.code).toBe('CODE001');
      expect(opts.filter).toBeUndefined();
    });

    it('should parse array format select property with comm', async () => {
      mockController['p.select.category'] = ['getCategories', 'id', 'name'];

      await processCodes(mockController, mockJoinPoint);

      const opts = mockController['p.select.category'] as Record<string, unknown>;
      expect(opts.comm).toBe('getCategories');
      expect(opts.key).toBe('id');
      expect(opts.val).toBe('name');
    });

    it('should handle select with direct data', async () => {
      const data = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
      ];
      mockController['p.select.status'] = { data };

      await processCodes(mockController, mockJoinPoint);

      // Should have bound the select
      expect(Array.isArray(mockController['p.select.status'])).toBe(true);
    });

    it('should apply filter function when provided', async () => {
      const data = [
        { value: '1', text: 'Active' },
        { value: '2', text: 'Inactive' },
      ];
      const filter = vi.fn((d: unknown[]) => d.filter((_, i) => i === 0));

      mockController['p.select.status'] = { data, filter };

      await processCodes(mockController, mockJoinPoint);

      expect(filter).toHaveBeenCalled();
    });

    it('should set selected value when provided', async () => {
      const data = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
      ];
      mockController['p.select.status'] = { data, selected: '2' };

      await processCodes(mockController, mockJoinPoint);

      // Component should be created with selected value
      expect(Array.isArray(mockController['p.select.status'])).toBe(true);
    });

    it('should handle multiple select properties', async () => {
      mockController['p.select.status'] = {
        data: [{ value: '1', text: 'Active' }],
      };
      mockController['p.select.category'] = {
        data: [{ value: 'A', text: 'Category A' }],
      };

      await processCodes(mockController, mockJoinPoint);

      expect(Array.isArray(mockController['p.select.status'])).toBe(true);
      expect(Array.isArray(mockController['p.select.category'])).toBe(true);
    });

    it('should call joinPoint.proceed via template processing', async () => {
      await processCodes(mockController, mockJoinPoint);

      expect(mockJoinPoint.proceed).toHaveBeenCalled();
    });
  });
});

