/**
 * @natural-js/code - Utils Tests
 */

import { describe, it, expect } from 'vitest';
import { addSourceURL, extractScripts, hasScript, getLineNumber } from './utils.js';

describe('Code Utils', () => {
  describe('addSourceURL', () => {
    it('should add sourceURL comment before closing script tag', () => {
      const codes = '<html><script>const x = 1;\n</script></html>';
      const result = addSourceURL(codes, '/test/page.js');

      expect(result).toContain('//# sourceURL=/test/page.js');
    });

    it('should handle tab before closing script tag', () => {
      const codes = '<html><script>const x = 1;\t</script></html>';
      const result = addSourceURL(codes, '/test/page.js');

      expect(result).toContain('//# sourceURL=/test/page.js');
    });

    it('should handle space before closing script tag', () => {
      const codes = '<html><script>const x = 1; </script></html>';
      const result = addSourceURL(codes, '/test/page.js');

      expect(result).toContain('//# sourceURL=/test/page.js');
    });

    it('should return unchanged code without script', () => {
      const codes = '<html><body>No script here</body></html>';
      const result = addSourceURL(codes, '/test/page.js');

      expect(result).toBe(codes);
    });

    it('should add sourceURL before the last script closing tag', () => {
      const codes = `
        <html>
        <script>
          const x = 1;
        </script>
        </html>
      `;
      const result = addSourceURL(codes, '/test/page.js');

      expect(result).toContain('//# sourceURL=/test/page.js');
      expect(result.indexOf('//# sourceURL')).toBeLessThan(result.lastIndexOf('</script>'));
    });
  });

  describe('extractScripts', () => {
    it('should extract single script content', () => {
      const codes = '<html><script>const x = 1;</script></html>';
      const scripts = extractScripts(codes);

      expect(scripts).toHaveLength(1);
      expect(scripts[0]).toBe('const x = 1;');
    });

    it('should extract multiple script contents', () => {
      const codes = `
        <html>
        <script>const a = 1;</script>
        <script>const b = 2;</script>
        </html>
      `;
      const scripts = extractScripts(codes);

      expect(scripts).toHaveLength(2);
      expect(scripts[0]).toBe('const a = 1;');
      expect(scripts[1]).toBe('const b = 2;');
    });

    it('should return empty array for code without script', () => {
      const codes = '<html><body></body></html>';
      const scripts = extractScripts(codes);

      expect(scripts).toHaveLength(0);
    });

    it('should handle script with attributes', () => {
      const codes = '<html><script type="text/javascript">const x = 1;</script></html>';
      const scripts = extractScripts(codes);

      expect(scripts).toHaveLength(1);
      expect(scripts[0]).toBe('const x = 1;');
    });

    it('should trim script content', () => {
      const codes = '<html><script>\n  const x = 1;\n  </script></html>';
      const scripts = extractScripts(codes);

      expect(scripts).toHaveLength(1);
      expect(scripts[0]).toBe('const x = 1;');
    });

    it('should handle empty script', () => {
      const codes = '<html><script></script></html>';
      const scripts = extractScripts(codes);

      expect(scripts).toHaveLength(0);
    });
  });

  describe('hasScript', () => {
    it('should return true for code with script', () => {
      const codes = '<html><script>const x = 1;</script></html>';
      expect(hasScript(codes)).toBe(true);
    });

    it('should return false for code without script', () => {
      const codes = '<html><body></body></html>';
      expect(hasScript(codes)).toBe(false);
    });

    it('should return true for partial script tag', () => {
      const codes = '<script';
      expect(hasScript(codes)).toBe(true);
    });
  });

  describe('getLineNumber', () => {
    it('should return correct line number', () => {
      const codes = 'line1\nline2\nline3';

      expect(getLineNumber(codes, 0)).toBe(1);
      expect(getLineNumber(codes, 6)).toBe(2);
      expect(getLineNumber(codes, 12)).toBe(3);
    });

    it('should handle single line', () => {
      const codes = 'single line';
      expect(getLineNumber(codes, 5)).toBe(1);
    });

    it('should handle empty string', () => {
      const codes = '';
      expect(getLineNumber(codes, 0)).toBe(1);
    });

    it('should handle position at newline', () => {
      const codes = 'line1\nline2';
      expect(getLineNumber(codes, 5)).toBe(1);
      expect(getLineNumber(codes, 6)).toBe(2);
    });
  });
});

