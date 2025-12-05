import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  isServer,
  isBrowser,
  getDocument,
  getWindow,
  getNavigator,
  getLocation,
  onBrowser,
  onServer,
} from './index.js';

describe('Environment detection utilities', () => {
  describe('isServer', () => {
    it('should return false in browser environment (jsdom)', () => {
      expect(isServer()).toBe(false);
    });
  });

  describe('isBrowser', () => {
    it('should return true in browser environment (jsdom)', () => {
      expect(isBrowser()).toBe(true);
    });
  });

  describe('getDocument', () => {
    it('should return document object in browser environment', () => {
      const doc = getDocument();
      expect(doc).toBe(document);
    });
  });

  describe('getWindow', () => {
    it('should return window object in browser environment', () => {
      const win = getWindow();
      expect(win).toBe(window);
    });
  });

  describe('getNavigator', () => {
    it('should return navigator object in browser environment', () => {
      const nav = getNavigator();
      expect(nav).toBe(navigator);
    });
  });

  describe('getLocation', () => {
    it('should return location object in browser environment', () => {
      const loc = getLocation();
      expect(loc).toBe(location);
    });
  });

  describe('onBrowser', () => {
    it('should execute callback in browser environment', () => {
      const callback = vi.fn(() => 'result');
      const result = onBrowser(callback);
      expect(callback).toHaveBeenCalled();
      expect(result).toBe('result');
    });
  });

  describe('onServer', () => {
    it('should not execute callback in browser environment', () => {
      const callback = vi.fn(() => 'result');
      const result = onServer(callback);
      expect(callback).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});

describe('Environment detection in simulated server environment', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    // Simulate server environment by removing window
    // @ts-expect-error - Intentionally removing window for testing
    delete globalThis.window;
  });

  afterEach(() => {
    // Restore window
    globalThis.window = originalWindow;
  });

  it('isServer should return true when window is undefined', () => {
    expect(isServer()).toBe(true);
  });

  it('isBrowser should return false when window is undefined', () => {
    expect(isBrowser()).toBe(false);
  });

  it('getDocument should return null in server environment', () => {
    expect(getDocument()).toBeNull();
  });

  it('getWindow should return null in server environment', () => {
    expect(getWindow()).toBeNull();
  });

  it('onServer should execute callback in server environment', () => {
    const callback = vi.fn(() => 'server-result');
    const result = onServer(callback);
    expect(callback).toHaveBeenCalled();
    expect(result).toBe('server-result');
  });

  it('onBrowser should not execute callback in server environment', () => {
    const callback = vi.fn(() => 'browser-result');
    const result = onBrowser(callback);
    expect(callback).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});

