import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  registerEvent,
  unregisterEvents,
  minimum,
  full,
  clearAll,
  getEventCount,
  getRegisteredNamespaces,
  EventNamespaces,
  gc,
} from './index';

describe('GC (Garbage Collection) Utilities', () => {
  beforeEach(() => {
    // Clear all events before each test
    clearAll();
  });

  afterEach(() => {
    // Clean up after each test
    clearAll();
  });

  describe('registerEvent / unregisterEvents', () => {
    it('should register and track events', () => {
      const handler = vi.fn();
      registerEvent('test', window, 'resize', handler);
      expect(getEventCount()).toBe(1);
      expect(getRegisteredNamespaces()).toContain('resize.test');
    });

    it('should unregister events by namespace', () => {
      const handler = vi.fn();
      registerEvent('test', window, 'resize', handler);
      registerEvent('test', window, 'scroll', handler);
      expect(getEventCount()).toBe(2);

      unregisterEvents('test');
      expect(getEventCount()).toBe(0);
    });

    it('should unregister events by namespace and event type', () => {
      const handler = vi.fn();
      registerEvent('test', window, 'resize', handler);
      registerEvent('test', window, 'scroll', handler);
      expect(getEventCount()).toBe(2);

      unregisterEvents('test', 'resize');
      expect(getEventCount()).toBe(1);
      expect(getRegisteredNamespaces()).toContain('scroll.test');
    });

    it('should actually remove event listeners', () => {
      const handler = vi.fn();
      registerEvent('test', window, 'resize', handler);

      // Trigger event - handler should be called
      window.dispatchEvent(new Event('resize'));
      expect(handler).toHaveBeenCalledTimes(1);

      // Unregister and trigger again - handler should not be called
      unregisterEvents('test');
      window.dispatchEvent(new Event('resize'));
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });

  describe('minimum', () => {
    it('should return true', () => {
      expect(minimum()).toBe(true);
    });

    it('should clean up datepicker and alert events', () => {
      const handler = vi.fn();
      registerEvent(EventNamespaces.DATEPICKER, window, 'resize', handler);
      registerEvent(EventNamespaces.ALERT, document, 'keyup', handler);

      expect(getEventCount()).toBe(2);
      minimum();
      expect(getEventCount()).toBe(0);
    });
  });

  describe('full', () => {
    it('should return true', () => {
      expect(full()).toBe(true);
    });

    it('should clean up all registered UI events', () => {
      const handler = vi.fn();
      // Register events that full() actually cleans up
      registerEvent(EventNamespaces.DATEPICKER, window, 'resize', handler);
      registerEvent(EventNamespaces.ALERT, window, 'resize', handler);

      expect(getEventCount()).toBe(2);
      full();
      expect(getEventCount()).toBe(0);
    });

    it('should clean up alert events', () => {
      const handler = vi.fn();
      registerEvent(EventNamespaces.ALERT, document, 'dragstart', handler);
      registerEvent(EventNamespaces.ALERT, document, 'touchend', handler);

      expect(getEventCount()).toBe(2);
      full();
      expect(getEventCount()).toBe(0);
    });
  });

  describe('clearAll', () => {
    it('should return true', () => {
      expect(clearAll()).toBe(true);
    });

    it('should clear all registered events', () => {
      const handler = vi.fn();
      registerEvent('custom1', window, 'resize', handler);
      registerEvent('custom2', document, 'click', handler);
      registerEvent('custom3', document, 'scroll', handler);

      expect(getEventCount()).toBe(3);
      clearAll();
      expect(getEventCount()).toBe(0);
      expect(getRegisteredNamespaces()).toEqual([]);
    });
  });

  describe('getEventCount', () => {
    it('should return 0 when no events registered', () => {
      expect(getEventCount()).toBe(0);
    });

    it('should return correct count', () => {
      const handler = vi.fn();
      registerEvent('ns1', window, 'resize', handler);
      registerEvent('ns1', document, 'click', handler);
      registerEvent('ns2', window, 'scroll', handler);
      expect(getEventCount()).toBe(3);
    });
  });

  describe('getRegisteredNamespaces', () => {
    it('should return empty array when no events', () => {
      expect(getRegisteredNamespaces()).toEqual([]);
    });

    it('should return list of registered namespaces', () => {
      const handler = vi.fn();
      registerEvent('ns1', window, 'resize', handler);
      registerEvent('ns2', document, 'click', handler);
      const namespaces = getRegisteredNamespaces();
      expect(namespaces).toContain('resize.ns1');
      expect(namespaces).toContain('click.ns2');
    });
  });

  describe('EventNamespaces', () => {
    it('should have all predefined namespaces', () => {
      expect(EventNamespaces.DATEPICKER).toBe('datepicker');
      expect(EventNamespaces.ALERT).toBe('alert');
      expect(EventNamespaces.GRID).toBe('grid');
      expect(EventNamespaces.GRID_RESIZE).toBe('grid.resize');
      expect(EventNamespaces.GRID_VRESIZE).toBe('grid.vResize');
      expect(EventNamespaces.GRID_DATAFILTER).toBe('grid.dataFilter');
      expect(EventNamespaces.GRID_MORE).toBe('grid.more');
      expect(EventNamespaces.POPUP).toBe('popup');
      expect(EventNamespaces.TAB).toBe('tab');
      expect(EventNamespaces.UI).toBe('ui');
    });
  });

  describe('gc namespace object', () => {
    it('should export all functions', () => {
      expect(gc.registerEvent).toBe(registerEvent);
      expect(gc.unregisterEvents).toBe(unregisterEvents);
      expect(gc.minimum).toBe(minimum);
      expect(gc.full).toBe(full);
      expect(gc.clearAll).toBe(clearAll);
      expect(gc.getEventCount).toBe(getEventCount);
      expect(gc.getRegisteredNamespaces).toBe(getRegisteredNamespaces);
      expect(gc.EventNamespaces).toBe(EventNamespaces);
    });
  });
});

