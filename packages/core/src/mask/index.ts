/**
 * Mask utilities for Natural-JS framework.
 * Input masking for formatted data entry.
 * SSR compatible - no browser-specific APIs.
 *
 * @reference Mask JavaScript API (http://www.pengoworks.com/workshop/js/mask/, dswitzer@pengoworks.com)
 */

/**
 * Mask definition for a character position.
 */
interface MaskDefinition {
  chr: string;
  mask: boolean;
}

/**
 * Rounding mode for numeric masking.
 */
export type RoundingMode = 'round' | 'ceil' | 'floor';

/**
 * Mask class for formatting input values.
 *
 * @example
 * ```typescript
 * // Phone number mask
 * const phoneMask = new Mask('###-###-####');
 * phoneMask.setGeneric('1234567890'); // '123-456-7890'
 *
 * // Currency mask
 * const currencyMask = new Mask('$#,###.00');
 * currencyMask.setNumeric(1234.5); // '$1,234.50'
 * ```
 */
export class Mask {
  /** Mask format string */
  format: string;

  /** Error messages */
  error: string[];

  /** Error codes */
  errorCodes: number[];

  /** Stripped value (digits only) */
  strippedValue: string;

  /** Allow partial input matching */
  allowPartial: boolean;

  /** Next valid character regex (for partial matching) */
  nextValidChar: string | null;

  /**
   * Create a new Mask instance.
   * @param format - Mask format string
   *
   * Format characters:
   * - `#` - Numeric digit (0-9)
   * - `@` - Alphabetic character (including Korean)
   * - `~` - Alphanumeric character (including Korean)
   * - `!` - Escape next character (literal)
   */
  constructor(format: string) {
    this.format = format;
    this.error = [];
    this.errorCodes = [];
    this.strippedValue = '';
    this.allowPartial = false;
    this.nextValidChar = null;
  }

  /**
   * Add an error to the error list.
   * @param code - Error code
   * @param message - Error message
   * @param value - Original value
   * @returns Original value if string, true otherwise
   */
  private throwError(code: number, message: string, value: string): string | true {
    this.error.push(message);
    this.errorCodes.push(code);
    return value;
  }

  /**
   * Apply generic mask to a value.
   *
   * @param value - Input value
   * @param isDelete - Whether this is a delete operation
   * @returns Masked value
   *
   * @example
   * ```typescript
   * const mask = new Mask('###-####');
   * mask.setGeneric('1234567'); // '123-4567'
   *
   * const mask2 = new Mask('@@@-###');
   * mask2.setGeneric('ABC123'); // 'ABC-123'
   * ```
   */
  setGeneric(value: string, isDelete?: boolean): string | true {
    let v = value;
    const m = this.format;

    // Mask character definitions
    const r = '@#~';
    const rt: string[] = [];
    let nv = '';
    let j = 0;
    const rx: Record<string, string> = {
      '@': 'a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\\x20\\s',
      '#': '0-9\\s',
      '~': '0-9a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\\x20\\s',
    };

    // Strip out invalid characters
    v = v.replace(new RegExp('[^' + rx['~'] + ']', 'gi'), '');
    if (isDelete === true && v.length === this.strippedValue.length) {
      v = v.substring(0, v.length - 1);
    }
    this.strippedValue = v;

    // Build mask definition table
    const a: MaskDefinition[] = [];
    for (let i = 0; i < m.length; i++) {
      let x = m.charAt(i);
      // Check if current character is a mask
      const t = r.indexOf(x) > -1;

      // Handle escape character
      if (x === '!') {
        x = m.charAt(++i);
      }

      // Build regex to test against
      if ((t && !this.allowPartial) || (t && this.allowPartial && rt.length < v.length)) {
        const rxChar = rx[x];
        if (rxChar) {
          rt.push('[' + rxChar + ']');
        }
      }

      // Build mask definition table
      a.push({ chr: x, mask: t });
    }

    let hasOneValidChar = false;

    // If regex fails, return an error
    if (!this.allowPartial && !new RegExp(rt.join('')).test(v)) {
      return this.throwError(
        1,
        `The value "${value}" must be in the format ${this.format}.`,
        value
      );
    } else if ((this.allowPartial && v.length > 0) || !this.allowPartial) {
      for (let i = 0; i < a.length; i++) {
        const def = a[i];
        if (!def) continue;

        if (def.mask) {
          const rtj = rt[j];
          while (v.length > 0 && rtj && !new RegExp(rtj).test(v.charAt(j))) {
            v = v.length === 1 ? '' : v.substring(1);
          }
          if (v.length > 0) {
            nv += v.charAt(j);
            hasOneValidChar = true;
          }
          j++;
        } else {
          nv += def.chr;
        }
        if (this.allowPartial && j > v.length) {
          break;
        }
      }
    }

    if (this.allowPartial && !hasOneValidChar) {
      nv = '';
    }

    if (this.allowPartial) {
      const nextDef = a[nv.length];
      if (nv.length < a.length && nextDef) {
        this.nextValidChar = rx[nextDef.chr] ?? null;
      } else {
        this.nextValidChar = null;
      }
    }

    return nv;
  }

  /**
   * Apply numeric mask to a value.
   *
   * @param value - Input value (number or string)
   * @param precision - Rounding mode for decimal places
   * @param isDelete - Whether this is a delete operation
   * @returns Masked value
   *
   * @example
   * ```typescript
   * const mask = new Mask('#,###.00');
   * mask.setNumeric(1234.567); // '1,234.57'
   *
   * const mask2 = new Mask('$#,###.00');
   * mask2.setNumeric(1234.5); // '$1,234.50'
   *
   * const mask3 = new Mask('+#,###');
   * mask3.setNumeric(1234); // '+1,234'
   *
   * const mask4 = new Mask('(#,###)');
   * mask4.setNumeric(-1234); // '(1,234)'
   * ```
   */
  setNumeric(
    value: string | number,
    precision?: RoundingMode,
    isDelete?: boolean
  ): string | true {
    let v = String(value).replace(/[^\d.-]*/gi, '');
    const m = this.format;

    // Make sure there's only one decimal point
    v = v.replace(/\./, 'd').replace(/\./g, '').replace(/d/, '.');

    // Check for invalid mask format
    if (
      !/^[$]?((\$?[+-]?([0#]{1,3},)?[0#]*(\.[0#]*)?)|([+-]?\([+-]?([0#]{1,3},)?[0#]*(\.[0#]*)?\)))$/.test(
        m
      )
    ) {
      return this.throwError(
        1,
        'An invalid numeric user format was specified for the Numeric user format constructor.',
        String(value)
      );
    }

    if (isDelete === true && v.length === this.strippedValue.length) {
      v = v.substring(0, v.length - 1);
    }

    if (this.allowPartial && v.replace(/[^0-9]/, '').length === 0) {
      return v;
    }
    this.strippedValue = v;

    if (v.length === 0) {
      v = 'NaN';
    }
    const vn = Number(v);
    if (isNaN(vn)) {
      return this.throwError(2, 'The value entered was not a number.', String(value));
    }

    // If no mask, return value as-is
    if (m.length === 0) {
      return v;
    }

    // Get value before and after decimal point
    let vi = String(Math.abs(Number(v.indexOf('.') > -1 ? v.split('.')[0] : v)));
    let vd = v.indexOf('.') > -1 ? v.split('.')[1] ?? '' : '';
    const originalVd = vd;

    const isNegative = vn !== 0 && Math.abs(vn) * -1 === vn;

    // Check for masking operations
    const show = {
      $: /^[$]/.test(m),
      '(': isNegative && m.indexOf('(') > -1,
      '+': m.indexOf('+') !== -1 && !isNegative,
      '-': false,
    };
    show['-'] = isNegative && (!show['('] || m.indexOf('-') !== -1);

    // Replace all non-placeholders from mask
    let cleanMask = m.replace(/[^#0.,]*/gi, '');

    // Get decimal mask
    const dm = cleanMask.indexOf('.') > -1 ? cleanMask.split('.')[1] ?? '' : '';

    if (dm.length === 0) {
      // No decimal in mask
      if (precision === 'round') {
        vi = String(Math.round(Number(vi)));
      } else if (precision === 'ceil') {
        vi = String(Math.ceil(Number(vi)));
      } else {
        vi = String(Math.floor(Number(vi)));
      }
      vd = '';
    } else {
      // Find minimum decimal places
      const md = dm.lastIndexOf('0') + 1;

      if (vd.length > dm.length) {
        // Round off extra decimal places
        const basePart = vd.substring(0, dm.length);
        const nextDigit = parseInt(vd.charAt(dm.length), 10) || 0;

        const shouldRound = precision === undefined || precision === 'round';
        const shouldCeil = precision === 'ceil';
        const shouldFloor = precision === 'floor';

        if (shouldRound) {
          if (nextDigit >= 5) {
            const num = Number('0.' + basePart) + Math.pow(10, -dm.length);
            vd = num.toFixed(dm.length).split('.')[1] ?? '';
          } else {
            vd = basePart;
          }
        } else if (shouldCeil) {
          if (nextDigit > 0) {
            const num = Number('0.' + basePart) + Math.pow(10, -dm.length);
            vd = num.toFixed(dm.length).split('.')[1] ?? '';
          } else {
            vd = basePart;
          }
        } else if (shouldFloor) {
          vd = basePart;
        }
      } else {
        // Pad with zeros
        while (vd.length < md) {
          vd += '0';
        }
      }
    }

    // Pad integer with zeros if needed
    let im = cleanMask.indexOf('.') > -1 ? cleanMask.split('.')[0] ?? '' : cleanMask;
    im = im.replace(/[^0#]+/gi, '');
    let mv = im.indexOf('0') + 1;
    if (mv > 0) {
      mv = im.length - mv + 1;
      while (vi.length < mv) {
        vi = '0' + vi;
      }
    }

    // Add thousands separators
    if (/[#0]+,[#0]{3}/.test(m)) {
      const x: string[] = [];
      let i = 0;
      let n = Number(vi);
      while (n > 999) {
        x[i] = ('00' + String(n % 1000)).slice(-3);
        n = Math.floor(n / 1000);
        i++;
      }
      x[i] = String(n % 1000);
      vi = x.reverse().join(',');
    }

    // Combine the value
    if (
      (vd.length > 0 && !this.allowPartial) ||
      (dm.length > 0 && this.allowPartial && v.indexOf('.') > -1 && originalVd.length >= vd.length)
    ) {
      v = vi + '.' + vd;
    } else if (
      dm.length > 0 &&
      this.allowPartial &&
      v.indexOf('.') > -1 &&
      originalVd.length < vd.length
    ) {
      v = vi + '.' + originalVd;
    } else {
      v = vi;
    }

    // Add prefix/suffix symbols
    if (show.$) {
      v = '$' + v;
    }
    if (show['+']) {
      v = '+' + v;
    }
    if (show['-']) {
      v = '-' + v;
    }
    if (show['(']) {
      v = '(' + v + ')';
    }

    return v;
  }

  /**
   * Clear all errors.
   */
  clearErrors(): void {
    this.error = [];
    this.errorCodes = [];
  }

  /**
   * Check if there are any errors.
   */
  hasErrors(): boolean {
    return this.error.length > 0;
  }

  /**
   * Get the last error message.
   */
  getLastError(): string | undefined {
    return this.error[this.error.length - 1];
  }
}

/**
 * Create a new Mask instance.
 * Factory function for convenience.
 *
 * @param format - Mask format string
 * @returns New Mask instance
 */
export function createMask(format: string): Mask {
  return new Mask(format);
}

/**
 * Apply a generic mask to a value (one-shot).
 *
 * @param value - Input value
 * @param format - Mask format
 * @returns Masked value
 */
export function applyGenericMask(value: string, format: string): string {
  const mask = new Mask(format);
  const result = mask.setGeneric(value);
  return typeof result === 'string' ? result : value;
}

/**
 * Apply a numeric mask to a value (one-shot).
 *
 * @param value - Input value
 * @param format - Mask format
 * @param precision - Rounding mode
 * @returns Masked value
 */
export function applyNumericMask(
  value: string | number,
  format: string,
  precision?: RoundingMode
): string {
  const mask = new Mask(format);
  const result = mask.setNumeric(value, precision);
  return typeof result === 'string' ? result : String(value);
}

/**
 * Mask utilities namespace object.
 */
export const mask = {
  Mask,
  createMask,
  applyGenericMask,
  applyNumericMask,
} as const;

export default mask;

