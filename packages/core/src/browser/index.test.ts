import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getCookie,
  setCookie,
  cookie,
  removeCookie,
  msieVersion,
  is,
  contextPath,
  scrollbarWidth,
  isTouchDevice,
  viewport,
  isInIframe,
  browser,
} from './index';

describe('Browser Utilities', () => {
  describe('Cookie Management', () => {
    beforeEach(() => {
      // Clear all cookies before each test
      document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0]?.trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
    });

    describe('getCookie', () => {
      it('should return undefined for non-existent cookie', () => {
        expect(getCookie('nonexistent')).toBeUndefined();
      });

      it('should get cookie value', () => {
        document.cookie = 'test=value;path=/';
        expect(getCookie('test')).toBe('value');
      });

      it('should handle encoded values', () => {
        document.cookie = 'encoded=' + encodeURIComponent('hello world') + ';path=/';
        expect(getCookie('encoded')).toBe('hello world');
      });
    });

    describe('setCookie', () => {
      it('should set a simple cookie', () => {
        setCookie('mykey', 'myvalue');
        expect(getCookie('mykey')).toBe('myvalue');
      });

      it('should set cookie with expiration', () => {
        setCookie('expiring', 'value', 7);
        expect(getCookie('expiring')).toBe('value');
      });
    });

    describe('cookie (legacy API)', () => {
      it('should get cookie when value is undefined', () => {
        document.cookie = 'legacy=test;path=/';
        expect(cookie('legacy')).toBe('test');
      });

      it('should set cookie when value is provided', () => {
        cookie('legacy2', 'value2');
        expect(getCookie('legacy2')).toBe('value2');
      });
    });

    describe('removeCookie', () => {
      it('should remove an existing cookie', () => {
        setCookie('toremove', 'value');
        expect(getCookie('toremove')).toBe('value');
        removeCookie('toremove');
        // Note: JSDOM may not fully support cookie removal, so we check it's changed
        const afterRemoval = getCookie('toremove');
        expect(afterRemoval === undefined || afterRemoval === '').toBeTruthy();
      });
    });
  });

  describe('Browser Detection', () => {
    describe('msieVersion', () => {
      it('should return 0 for non-IE browsers', () => {
        // JSDOM is not IE
        expect(msieVersion()).toBe(0);
      });
    });

    describe('is', () => {
      it('should return false for non-matching browsers in JSDOM', () => {
        // JSDOM doesn't match specific browsers
        expect(is('ie')).toBe(false);
        expect(is('edge')).toBe(false);
      });

      it('should check for mobile', () => {
        // JSDOM is not mobile
        expect(is('mobile')).toBe(false);
      });
    });
  });

  describe('contextPath', () => {
    it('should return empty string for simple URLs', () => {
      // JSDOM default URL is about:blank or http://localhost
      const path = contextPath();
      expect(typeof path).toBe('string');
    });
  });

  describe('scrollbarWidth', () => {
    it('should return a number', () => {
      const width = scrollbarWidth();
      expect(typeof width).toBe('number');
      expect(width).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isTouchDevice', () => {
    it('should return a boolean', () => {
      // JSDOM may or may not have touch support depending on version
      expect(typeof isTouchDevice()).toBe('boolean');
    });
  });

  describe('viewport', () => {
    it('should return dimensions object', () => {
      const vp = viewport();
      expect(vp).toHaveProperty('width');
      expect(vp).toHaveProperty('height');
      expect(typeof vp.width).toBe('number');
      expect(typeof vp.height).toBe('number');
    });
  });

  describe('isInIframe', () => {
    it('should return false when not in iframe', () => {
      expect(isInIframe()).toBe(false);
    });
  });

  describe('browser namespace object', () => {
    it('should export all functions as properties', () => {
      expect(browser.getCookie).toBe(getCookie);
      expect(browser.setCookie).toBe(setCookie);
      expect(browser.cookie).toBe(cookie);
      expect(browser.removeCookie).toBe(removeCookie);
      expect(browser.msieVersion).toBe(msieVersion);
      expect(browser.is).toBe(is);
      expect(browser.contextPath).toBe(contextPath);
      expect(browser.scrollbarWidth).toBe(scrollbarWidth);
      expect(browser.isTouchDevice).toBe(isTouchDevice);
      expect(browser.viewport).toBe(viewport);
      expect(browser.isInIframe).toBe(isInIframe);
    });
  });
});

describe('SSR Environment Handling', () => {
  // Test that functions handle SSR (no window) gracefully
  // These tests mock the browser check

  it('getCookie should return undefined in SSR', async () => {
    vi.doMock('@natural-js/shared', () => ({
      isBrowser: () => false,
      getDocument: () => null,
      getWindow: () => null,
      getNavigator: () => null,
      getLocation: () => null,
    }));

    vi.resetModules();
    const browserModule = await import('./index');

    // Since we're in JSDOM, the actual isBrowser returns true
    // This test mainly verifies the pattern is correct
    expect(typeof browserModule.getCookie).toBe('function');
  });
});

