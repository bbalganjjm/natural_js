/**
 * @natural-js/code - Inspection Module Tests
 */

import { describe, it, expect } from 'vitest';
import { test, Inspection, rules } from './index.js';

describe('Inspection Module', () => {
  describe('test function', () => {
    it('should return false for code without script', () => {
      const codes = '<html><body></body></html>';
      const result = test(codes);

      expect(result).toBe(false);
    });

    it('should return array for code with script', () => {
      const codes = '<html><script>const x = 1;</script></html>';
      const result = test(codes);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should run all rules by default', () => {
      const codes = `
        <html>
        <script>
          N("#el").val("test");
        </script>
        </html>
      `;
      const result = test(codes);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should run specific rules when provided', () => {
      const codes = `
        <html>
        <script>
          N("#el").val("test");
        </script>
        </html>
      `;
      const result = test(codes, ['UseTheComponentsValMethod']);

      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.some((r) => r.message.includes('val()'))).toBe(true);
      }
    });

    it('should handle unknown rule names gracefully', () => {
      const codes = '<html><script>const x = 1;</script></html>';

      expect(() => {
        test(codes, ['NonExistentRule']);
      }).not.toThrow();
    });
  });

  describe('Inspection class', () => {
    it('should have test method', () => {
      expect(typeof Inspection.test).toBe('function');
    });

    it('should have rules property', () => {
      expect(Inspection.rules).toBeDefined();
    });

    it('should have report property', () => {
      expect(Inspection.report).toBeDefined();
      expect(typeof Inspection.report.console).toBe('function');
      expect(typeof Inspection.report.html).toBe('function');
      expect(typeof Inspection.report.json).toBe('function');
      expect(typeof Inspection.report.popup).toBe('function');
    });
  });

  describe('rules object', () => {
    it('should have NoContextSpecifiedInSelector rule', () => {
      expect(rules.NoContextSpecifiedInSelector).toBeDefined();
      expect(typeof rules.NoContextSpecifiedInSelector).toBe('function');
    });

    it('should have UseTheComponentsValMethod rule', () => {
      expect(rules.UseTheComponentsValMethod).toBeDefined();
      expect(typeof rules.UseTheComponentsValMethod).toBe('function');
    });
  });
});

