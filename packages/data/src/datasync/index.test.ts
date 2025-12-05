/**
 * Tests for the DataSync module.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DataSync,
  createDataSync,
  getDataSyncRegistrySize,
  clearDataSyncRegistry,
  SyncableComponent,
  SyncableDataRow,
} from './index';

// Mock component for testing
function createMockComponent(data: SyncableDataRow[]): SyncableComponent {
  return {
    options: {
      data,
      row: 0,
    },
    update: vi.fn(),
  };
}

// Mock Form component with row() method
function createMockFormComponent(data: SyncableDataRow[], row: number = 0): SyncableComponent {
  return {
    options: {
      data,
      row,
    },
    update: vi.fn(),
    row: () => row,
  };
}

// Helper to clean up DOM sync element
function cleanupDomSyncElement(): void {
  const syncEl = document.getElementById('data_sync_temp__');
  if (syncEl) {
    syncEl.remove();
  }
}

describe('DataSync', () => {
  beforeEach(() => {
    cleanupDomSyncElement();
    clearDataSyncRegistry();
  });

  afterEach(() => {
    cleanupDomSyncElement();
    clearDataSyncRegistry();
  });

  describe('constructor', () => {
    it('should create a DataSync instance', () => {
      const data = [{ id: 1, name: 'Test' }];
      const component = createMockComponent(data);
      const ds = new DataSync(component, true);

      expect(ds).toBeInstanceOf(DataSync);
      expect(ds.inst).toBe(component);
    });

    it('should register component as observable when isReg is true', () => {
      const data = [{ id: 1 }];
      const component = createMockComponent(data);
      const ds = new DataSync(component, true);

      expect(ds.observable).toContain(component);
    });

    it('should not register when isReg is false', () => {
      const data = [{ id: 1 }];
      const component = createMockComponent(data);
      const ds = new DataSync(component, false);

      // Should not be in the observable list
      expect(ds.observable.filter(c => c === component).length).toBe(0);
    });
  });

  describe('instance()', () => {
    it('should create instance via static method', () => {
      const data = [{ id: 1 }];
      const component = createMockComponent(data);
      const ds = DataSync.instance(component, true);

      expect(ds).toBeInstanceOf(DataSync);
      expect(ds.inst).toBe(component);
    });
  });

  describe('remove()', () => {
    it('should remove current component from observable list', () => {
      const data = [{ id: 1 }];
      const component1 = createMockComponent(data);
      const component2 = createMockComponent(data);

      // Register component1
      const ds = new DataSync(component1, true);
      const initialCount = ds.observable.length;
      expect(ds.observable).toContain(component1);
      
      // Register component2 (same singleton, different inst)
      const ds2 = new DataSync(component2, true);
      expect(ds2.observable.length).toBe(initialCount + 1);
      expect(ds2.observable).toContain(component2);

      // Remove component2 (current inst)
      ds2.remove();
      expect(ds2.observable.length).toBe(initialCount);
      expect(ds2.observable).toContain(component1);
      expect(ds2.observable).not.toContain(component2);
    });

    it('should return this for chaining', () => {
      const data = [{ id: 1 }];
      const component = createMockComponent(data);
      const ds = new DataSync(component, true);

      expect(ds.remove()).toBe(ds);
    });
  });

  describe('notify()', () => {
    it('should notify other components with same data', () => {
      const sharedData = [{ id: 1, name: 'Test' }];
      const component1 = createMockComponent(sharedData);
      const component2 = createMockComponent(sharedData);

      // Register both components
      new DataSync(component1, true);
      // Getting the singleton again with component2 as current inst
      const ds = new DataSync(component2, true);

      // Reset mocks before notify
      (component1.update as ReturnType<typeof vi.fn>).mockClear();
      (component2.update as ReturnType<typeof vi.fn>).mockClear();

      // ds.inst is component2, so component2 is the source
      ds.notify(0, 'name');

      // component2 should not be called (it's the source - ds.inst is component2)
      expect(component2.update).not.toHaveBeenCalled();
      // component1 should be called
      expect(component1.update).toHaveBeenCalledWith(0, 'name');
    });

    it('should not notify components with different data', () => {
      const data1 = [{ id: 1 }];
      const data2 = [{ id: 2 }];
      const component1 = createMockComponent(data1);
      const component2 = createMockComponent(data2);

      new DataSync(component1, true);
      const ds = new DataSync(component2, true);

      // Reset mocks
      (component1.update as ReturnType<typeof vi.fn>).mockClear();

      ds.notify(0);

      // component1 has different data, should not be called
      expect(component1.update).not.toHaveBeenCalled();
    });

    it('should only notify Form at matching row', () => {
      const sharedData = [{ id: 1 }, { id: 2 }];
      const gridComponent = createMockComponent(sharedData);
      const formComponent = createMockFormComponent(sharedData, 1);

      // Register both - form first, then grid
      new DataSync(formComponent, true);
      const ds = new DataSync(gridComponent, true);

      // Reset mocks
      (formComponent.update as ReturnType<typeof vi.fn>).mockClear();
      (gridComponent.update as ReturnType<typeof vi.fn>).mockClear();

      // Now ds.inst is gridComponent
      // Notify for row 0 - Form is at row 1, should not be called
      ds.notify(0);
      expect(formComponent.update).not.toHaveBeenCalled();

      // Clear and notify for row 1 - Form is at row 1, should be called
      (formComponent.update as ReturnType<typeof vi.fn>).mockClear();
      ds.notify(1);
      expect(formComponent.update).toHaveBeenCalledWith(1, undefined);
    });
  });

  describe('listeners', () => {
    it('should add and call listeners', () => {
      const data = [{ id: 1 }];
      const component = createMockComponent(data);
      const ds = new DataSync(component, true);

      const listener = vi.fn();
      ds.addListener(listener);

      ds.notify(0, 'name');

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith({
        source: component,
        row: 0,
        key: 'name',
        data: data,
      });
    });

    it('should remove listeners', () => {
      const data = [{ id: 1 }];
      const component = createMockComponent(data);
      const ds = new DataSync(component, true);

      const listener = vi.fn();
      ds.addListener(listener);
      ds.removeListener(listener);

      ds.notify(0);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should clear all listeners', () => {
      const data = [{ id: 1 }];
      const component = createMockComponent(data);
      const ds = new DataSync(component, true);

      const listener1 = vi.fn();
      const listener2 = vi.fn();
      ds.addListener(listener1);
      ds.addListener(listener2);
      ds.clearListeners();

      ds.notify(0);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('getObservables()', () => {
    it('should return a copy of observables', () => {
      const data = [{ id: 1 }];
      const component = createMockComponent(data);
      const ds = new DataSync(component, true);

      const observables = ds.getObservables();
      expect(observables).toContain(component);
      expect(observables).not.toBe(ds.observable);
    });
  });

  describe('getObservableCount()', () => {
    it('should return the count of observables', () => {
      const data = [{ id: 1 }];
      const component1 = createMockComponent(data);
      const component2 = createMockComponent(data);

      const ds1 = new DataSync(component1, true);
      const initialCount = ds1.getObservableCount();

      new DataSync(component2, true);
      expect(ds1.getObservableCount()).toBe(initialCount + 1);
    });
  });

  describe('isRegistered()', () => {
    it('should check if component is registered', () => {
      const data = [{ id: 1 }];
      const component1 = createMockComponent(data);
      const component2 = createMockComponent(data);

      const ds = new DataSync(component1, true);

      expect(ds.isRegistered(component1)).toBe(true);
      expect(ds.isRegistered(component2)).toBe(false);
    });
  });

  describe('cleanup()', () => {
    it('should remove invalid components', () => {
      const data = [{ id: 1 }];
      const validComponent = createMockComponent(data);
      const invalidComponent = { options: {}, update: vi.fn() } as unknown as SyncableComponent;

      const ds = new DataSync(validComponent, true);
      const countBeforeInvalid = ds.getObservableCount();
      ds.observable.push(invalidComponent);

      expect(ds.getObservableCount()).toBe(countBeforeInvalid + 1);

      ds.cleanup();

      // Invalid component should be removed, valid should remain
      expect(ds.isRegistered(validComponent)).toBe(true);
      expect(ds.observable.includes(invalidComponent)).toBe(false);
    });
  });

  describe('destroy()', () => {
    it('should clean up all resources', () => {
      const data = [{ id: 1 }];
      const component = createMockComponent(data);
      const ds = new DataSync(component, true);

      const listener = vi.fn();
      ds.addListener(listener);

      ds.destroy();

      expect(ds.observable).toEqual([]);
      expect(ds.inst).toBeNull();

      // Should not call listener after destroy
      ds.notify(0);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});

describe('createDataSync', () => {
  beforeEach(() => {
    cleanupDomSyncElement();
    clearDataSyncRegistry();
  });

  afterEach(() => {
    cleanupDomSyncElement();
    clearDataSyncRegistry();
  });

  it('should create DataSync instance', () => {
    const data = [{ id: 1 }];
    const component = createMockComponent(data);
    const ds = createDataSync(component, true);

    expect(ds).toBeInstanceOf(DataSync);
  });
});

describe('Registry utilities', () => {
  beforeEach(() => {
    cleanupDomSyncElement();
    clearDataSyncRegistry();
  });

  afterEach(() => {
    cleanupDomSyncElement();
    clearDataSyncRegistry();
  });

  it('getDataSyncRegistrySize should return registry size', () => {
    expect(getDataSyncRegistrySize()).toBe(0);
  });

  it('clearDataSyncRegistry should clear the registry', () => {
    clearDataSyncRegistry();
    expect(getDataSyncRegistrySize()).toBe(0);
  });
});

describe('DataSync chaining', () => {
  beforeEach(() => {
    cleanupDomSyncElement();
    clearDataSyncRegistry();
  });

  afterEach(() => {
    cleanupDomSyncElement();
    clearDataSyncRegistry();
  });

  it('should support method chaining', () => {
    const data = [{ id: 1 }];
    const component = createMockComponent(data);
    const ds = new DataSync(component, true);
    const listener = vi.fn();

    const result = ds
      .addListener(listener)
      .setDebug(true)
      .notify(0)
      .removeListener(listener)
      .cleanup()
      .remove();

    expect(result).toBe(ds);
  });
});
