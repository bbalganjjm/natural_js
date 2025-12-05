/**
 * DataSync module for Natural-JS.
 * Provides data synchronization between multiple components sharing the same data.
 *
 * When multiple components (Form, Grid, List, etc.) bind to the same data array,
 * DataSync ensures that changes in one component are reflected in all others.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { gc } from '@natural-js/core';
import {
  SyncableComponent,
  SyncableDataRow,
  DataSyncOptions,
  DataChangeNotification,
  DataChangeListener,
  ObservableEntry,
} from './types';

// Re-export types
export * from './types';

/**
 * Global registry for DataSync instances.
 * Uses WeakMap to allow garbage collection of unused components.
 */
const globalRegistry = new Map<string, DataSync>();

/**
 * Counter for generating unique IDs.
 */
let idCounter = 0;

/**
 * Generate a unique ID for components.
 */
function generateId(): string {
  return `ds_${Date.now()}_${++idCounter}`;
}

/**
 * DataSync class manages data synchronization between components.
 * Implements the Observer pattern for reactive data updates.
 *
 * @example
 * // Register a component for synchronization
 * const ds = DataSync.instance(formComponent, true);
 *
 * // Notify other components of data changes
 * ds.notify(rowIndex, 'columnName');
 *
 * // Remove a component from synchronization
 * ds.remove();
 */
export class DataSync {
  /** The component instance being synced */
  public inst: SyncableComponent | null = null;

  /** List of observable components sharing the same data */
  public observable: SyncableComponent[] = [];

  /** The view context element */
  private viewContext: NaturalElement | null = null;

  /** Custom listeners for data changes */
  private listeners: DataChangeListener[] = [];

  /** Unique ID for this DataSync instance */
  private id: string;

  /** Debug mode flag */
  private debug: boolean = false;

  /**
   * Creates a new DataSync instance or returns an existing one for the context.
   *
   * @param inst - The component instance to sync
   * @param isReg - Whether to register the component as an observable
   * @param options - Additional options
   */
  constructor(
    inst?: SyncableComponent,
    isReg?: boolean,
    options?: DataSyncOptions
  ) {
    this.id = generateId();
    this.debug = options?.debug ?? false;

    if (!inst) {
      return;
    }

    this.inst = inst;

    // In browser environment, use a shared context element
    if (isBrowser()) {
      const doc = getDocument();
      if (doc) {
        // Try to find or create the sync temp element
        let syncTempEl = doc.getElementById('data_sync_temp__');
        if (!syncTempEl) {
          syncTempEl = doc.createElement('var');
          syncTempEl.id = 'data_sync_temp__';
          syncTempEl.style.display = 'none';
          doc.body.appendChild(syncTempEl);
        }
        this.viewContext = new NaturalElement(syncTempEl);

        // Check if there's already a DataSync instance for this context
        const existingDs = this.viewContext.data('ds') as DataSync | undefined;
        if (existingDs) {
          existingDs.inst = inst;
          if (isReg) {
            // Add to observable list if not already present
            if (!existingDs.observable.includes(inst)) {
              existingDs.observable.push(inst);
              this.logDebug(`Registered component to existing DataSync. Total: ${existingDs.observable.length}`);
            }
          }
          return existingDs;
        } else {
          // This is the first DataSync for this context
          this.observable = [];
          if (isReg) {
            this.observable.push(inst);
            this.logDebug(`Created new DataSync with first component`);
          }
          this.viewContext.data('ds', this);
        }
      }
    } else {
      // SSR mode: use the global registry
      const contextKey = options?.context?.attr('id') || 'default';
      const existingDs = globalRegistry.get(contextKey);

      if (existingDs) {
        existingDs.inst = inst;
        if (isReg && !existingDs.observable.includes(inst)) {
          existingDs.observable.push(inst);
        }
        return existingDs;
      } else {
        this.observable = [];
        if (isReg) {
          this.observable.push(inst);
        }
        globalRegistry.set(contextKey, this);
      }
    }
  }

  /**
   * Factory method to create or get a DataSync instance.
   *
   * @param inst - The component instance
   * @param isReg - Whether to register as observable
   * @param options - Additional options
   * @returns A DataSync instance
   */
  static instance(
    inst: SyncableComponent,
    isReg?: boolean,
    options?: DataSyncOptions
  ): DataSync {
    return new DataSync(inst, isReg, options);
  }

  /**
   * Remove a component from the observable list.
   * Call this when a component is destroyed to prevent memory leaks.
   *
   * @returns this for chaining
   */
  remove(): this {
    const inst = this.inst;
    const observable = this.observable;

    if (inst && observable) {
      const index = observable.indexOf(inst);
      if (index > -1) {
        observable.splice(index, 1);
        this.logDebug(`Removed component. Remaining: ${observable.length}`);
      }
    }

    return this;
  }

  /**
   * Notify all other components sharing the same data that data has changed.
   *
   * @param row - The row index that changed (optional)
   * @param key - The column/key that changed (optional)
   * @returns this for chaining
   */
  notify(row?: number, key?: string): this {
    const inst = this.inst;
    const observable = this.observable;

    if (!inst || !observable) {
      return this;
    }

    // Notify custom listeners first
    if (this.listeners.length > 0) {
      const notification: DataChangeNotification = {
        source: inst,
        row,
        key,
        data: inst.options.data,
      };
      for (const listener of this.listeners) {
        try {
          listener(notification);
        } catch (e) {
          console.error('[DataSync] Error in listener:', e);
        }
      }
    }

    // Notify other components
    for (const obs of observable) {
      // Skip the source component
      if (obs === inst) {
        continue;
      }

      // Only notify if they share the same data reference
      if (inst.options.data === obs.options.data) {
        try {
          // For Form components, only update if the row matches
          if (typeof obs.row === 'function') {
            if (row === obs.row()) {
              obs.update(row, key);
              this.logDebug(`Notified Form at row ${row}, key: ${key || 'all'}`);
            }
          } else {
            // For Grid/List components, always update
            obs.update(row, key);
            this.logDebug(`Notified component at row ${row ?? 'all'}, key: ${key || 'all'}`);
          }
        } catch (e) {
          console.error('[DataSync] Error notifying component:', e);
        }
      }
    }

    return this;
  }

  /**
   * Add a listener for data change notifications.
   *
   * @param listener - Callback function to call on data changes
   * @returns this for chaining
   */
  addListener(listener: DataChangeListener): this {
    this.listeners.push(listener);
    return this;
  }

  /**
   * Remove a listener.
   *
   * @param listener - The listener to remove
   * @returns this for chaining
   */
  removeListener(listener: DataChangeListener): this {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
    return this;
  }

  /**
   * Clear all listeners.
   *
   * @returns this for chaining
   */
  clearListeners(): this {
    this.listeners = [];
    return this;
  }

  /**
   * Get all observable components.
   *
   * @returns Array of observable components
   */
  getObservables(): SyncableComponent[] {
    return [...this.observable];
  }

  /**
   * Get the count of observable components.
   *
   * @returns Number of observables
   */
  getObservableCount(): number {
    return this.observable.length;
  }

  /**
   * Check if a component is registered.
   *
   * @param component - The component to check
   * @returns true if registered
   */
  isRegistered(component: SyncableComponent): boolean {
    return this.observable.includes(component);
  }

  /**
   * Clean up garbage instances from the observable list.
   * Removes components that no longer have valid data or contexts.
   *
   * @returns this for chaining
   */
  cleanup(): this {
    this.observable = this.observable.filter((obs) => {
      // Keep components that have valid data
      return obs && obs.options && Array.isArray(obs.options.data);
    });
    this.logDebug(`Cleanup complete. Remaining: ${this.observable.length}`);
    return this;
  }

  /**
   * Enable or disable debug mode.
   *
   * @param enabled - Whether to enable debug mode
   * @returns this for chaining
   */
  setDebug(enabled: boolean): this {
    this.debug = enabled;
    return this;
  }

  /**
   * Log debug message.
   */
  private logDebug(message: string): void {
    if (this.debug) {
      console.log(`[DataSync:${this.id}] ${message}`);
    }
  }

  /**
   * Destroy this DataSync instance.
   * Removes all observables and cleans up resources.
   */
  destroy(): void {
    this.observable = [];
    this.listeners = [];
    this.inst = null;

    if (this.viewContext) {
      this.viewContext.removeData('ds');
      this.viewContext = null;
    }

    // Remove from global registry
    for (const [key, ds] of globalRegistry.entries()) {
      if (ds === this) {
        globalRegistry.delete(key);
        break;
      }
    }

    this.logDebug('DataSync destroyed');
  }
}

/**
 * Get the global DataSync registry size.
 * Useful for debugging and testing.
 *
 * @returns Number of DataSync instances in the global registry
 */
export function getDataSyncRegistrySize(): number {
  return globalRegistry.size;
}

/**
 * Clear the global DataSync registry.
 * Useful for testing.
 */
export function clearDataSyncRegistry(): void {
  globalRegistry.clear();
}

/**
 * Create a DataSync instance for a component.
 * Convenience function.
 *
 * @param component - The component to sync
 * @param register - Whether to register as observable
 * @returns A DataSync instance
 */
export function createDataSync(
  component: SyncableComponent,
  register?: boolean
): DataSync {
  return DataSync.instance(component, register);
}

