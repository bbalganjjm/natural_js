/**
 * @natural-js/template - Template AOP Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NaturalElement } from '@natural-js/shared';
import { processTemplate } from './template.js';
import type { ControllerInstance, JoinPoint } from '../types.js';

describe('Template AOP', () => {
  let mockView: NaturalElement;
  let mockController: ControllerInstance;
  let mockJoinPoint: JoinPoint;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-view"></div>';
    mockView = new NaturalElement(document.getElementById('test-view'));

    mockController = {
      view: mockView,
    };

    mockJoinPoint = {
      proceed: vi.fn(),
    };
  });

  describe('processTemplate', () => {
    it('should call joinPoint.proceed', () => {
      processTemplate(mockController, mockJoinPoint);
      expect(mockJoinPoint.proceed).toHaveBeenCalled();
    });

    it('should handle controller without component properties', () => {
      expect(() => {
        processTemplate(mockController, mockJoinPoint);
      }).not.toThrow();
    });

    it('should resolve onOpenDefer if present', async () => {
      const resolveFn = vi.fn();
      mockController.onOpenDefer = { resolve: resolveFn };

      processTemplate(mockController, mockJoinPoint);

      // Wait for setTimeout
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(resolveFn).toHaveBeenCalled();
    });

    it('should process component properties starting with p.', () => {
      mockController['p.form.testForm'] = { context: '#test-form' };

      // Should not throw
      expect(() => {
        processTemplate(mockController, mockJoinPoint);
      }).not.toThrow();
    });

    it('should process event properties starting with e.', () => {
      mockController['e.button.click'] = vi.fn();

      // Should not throw
      expect(() => {
        processTemplate(mockController, mockJoinPoint);
      }).not.toThrow();
    });
  });
});

