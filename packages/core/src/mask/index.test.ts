import { describe, it, expect, beforeEach } from 'vitest';
import { Mask, createMask, applyGenericMask, applyNumericMask, mask } from './index';

describe('Mask Utilities', () => {
  describe('Mask class - setGeneric', () => {
    it('should mask phone number format', () => {
      const m = new Mask('###-###-####');
      expect(m.setGeneric('1234567890')).toBe('123-456-7890');
    });

    it('should mask SSN format', () => {
      const m = new Mask('###-##-####');
      expect(m.setGeneric('123456789')).toBe('123-45-6789');
    });

    it('should mask alphanumeric format', () => {
      const m = new Mask('@@@-###');
      expect(m.setGeneric('ABC123')).toBe('ABC-123');
    });

    it('should handle partial input when allowPartial is true', () => {
      const m = new Mask('###-####');
      m.allowPartial = true;
      expect(m.setGeneric('123')).toBe('123-');
    });

    it('should return error for invalid input', () => {
      const m = new Mask('###-####');
      const result = m.setGeneric('ABCD');
      // Should return the original value when input doesn't match
      expect(result).toBe('ABCD');
      expect(m.hasErrors()).toBe(true);
    });

    it('should handle Korean characters', () => {
      const m = new Mask('@@@');
      expect(m.setGeneric('가나다')).toBe('가나다');
    });

    it('should handle mixed alphanumeric mask', () => {
      const m = new Mask('~~-~~-~~');
      expect(m.setGeneric('A1B2C3')).toBe('A1-B2-C3');
    });

    it('should strip invalid characters', () => {
      const m = new Mask('###-####');
      expect(m.setGeneric('12!@#34567')).toBe('123-4567');
    });

    it('should track stripped value', () => {
      const m = new Mask('###-####');
      const result = m.setGeneric('1234567');
      expect(result).toBe('123-4567');
      expect(m.strippedValue).toBe('1234567');
    });
  });

  describe('Mask class - setNumeric', () => {
    it('should format number with thousands separator', () => {
      const m = new Mask('#,###');
      expect(m.setNumeric(1234567)).toBe('1,234,567');
    });

    it('should format number with decimal places', () => {
      const m = new Mask('#,###.00');
      expect(m.setNumeric(1234.5)).toBe('1,234.50');
    });

    it('should round decimal places', () => {
      const m = new Mask('#,###.00');
      expect(m.setNumeric(1234.567)).toBe('1,234.57');
    });

    it('should floor decimal places when specified', () => {
      const m = new Mask('#,###.00');
      expect(m.setNumeric(1234.567, 'floor')).toBe('1,234.56');
    });

    it('should ceil decimal places when specified', () => {
      const m = new Mask('#,###.00');
      expect(m.setNumeric(1234.561, 'ceil')).toBe('1,234.57');
    });

    it('should handle currency prefix', () => {
      const m = new Mask('$#,###.00');
      expect(m.setNumeric(1234.5)).toBe('$1,234.50');
    });

    it('should handle positive sign', () => {
      const m = new Mask('+#,###');
      expect(m.setNumeric(1234)).toBe('+1,234');
    });

    it('should handle negative sign', () => {
      const m = new Mask('#,###');
      expect(m.setNumeric(-1234)).toBe('-1,234');
    });

    it('should handle parentheses for negative', () => {
      const m = new Mask('(#,###)');
      expect(m.setNumeric(-1234)).toBe('(1,234)');
    });

    it('should pad with zeros', () => {
      const m = new Mask('0000');
      expect(m.setNumeric(12)).toBe('0012');
    });

    it('should return error for non-numeric value', () => {
      const m = new Mask('#,###');
      const result = m.setNumeric('abc');
      expect(result).toBe('abc');
      expect(m.hasErrors()).toBe(true);
    });

    it('should return error for invalid mask format', () => {
      const m = new Mask('invalid');
      const result = m.setNumeric(1234);
      expect(result).toBe('1234');
      expect(m.hasErrors()).toBe(true);
    });

    it('should handle partial input when allowPartial is true', () => {
      const m = new Mask('#,###.00');
      m.allowPartial = true;
      expect(m.setNumeric('')).toBe('');
    });
  });

  describe('Mask class - error handling', () => {
    it('should track errors', () => {
      const m = new Mask('###');
      m.setGeneric('ABCD');
      expect(m.hasErrors()).toBe(true);
      expect(m.error.length).toBeGreaterThan(0);
      expect(m.errorCodes.length).toBeGreaterThan(0);
    });

    it('should clear errors', () => {
      const m = new Mask('###');
      m.setGeneric('ABCD');
      m.clearErrors();
      expect(m.hasErrors()).toBe(false);
      expect(m.error.length).toBe(0);
    });

    it('should get last error', () => {
      const m = new Mask('###');
      m.setGeneric('ABCD');
      expect(m.getLastError()).toBeDefined();
    });
  });

  describe('createMask', () => {
    it('should create a new Mask instance', () => {
      const m = createMask('###-####');
      expect(m).toBeInstanceOf(Mask);
      expect(m.format).toBe('###-####');
    });
  });

  describe('applyGenericMask', () => {
    it('should apply generic mask in one shot', () => {
      expect(applyGenericMask('1234567890', '###-###-####')).toBe('123-456-7890');
    });

    it('should return original value on error', () => {
      expect(applyGenericMask('ABC', '###-###')).toBe('ABC');
    });
  });

  describe('applyNumericMask', () => {
    it('should apply numeric mask in one shot', () => {
      expect(applyNumericMask(1234.5, '$#,###.00')).toBe('$1,234.50');
    });

    it('should support precision option', () => {
      expect(applyNumericMask(1234.567, '#,###.00', 'floor')).toBe('1,234.56');
    });
  });

  describe('mask namespace object', () => {
    it('should export all functions and classes', () => {
      expect(mask.Mask).toBe(Mask);
      expect(mask.createMask).toBe(createMask);
      expect(mask.applyGenericMask).toBe(applyGenericMask);
      expect(mask.applyNumericMask).toBe(applyNumericMask);
    });
  });
});

