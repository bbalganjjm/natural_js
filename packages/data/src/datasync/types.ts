/**
 * Type definitions for the DataSync module.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Data row type for synced data.
 */
export type SyncableDataRow = Record<string, unknown> & {
  rowStatus?: 'insert' | 'update' | 'delete' | string;
};

/**
 * Options for a data component that can be synced.
 */
export interface SyncableComponentOptions {
  /** The data array being managed */
  data: SyncableDataRow[];
  /** Current row index (for Form components) */
  row?: number;
  /** External object for delegation (Form in Grid scenario) */
  extObj?: SyncableComponent | null;
  /** External row index */
  extRow?: number;
}

/**
 * Interface for components that can participate in data synchronization.
 * Form, Grid, List, Tree components implement this interface.
 */
export interface SyncableComponent {
  /** Component options containing data */
  options: SyncableComponentOptions;
  /** Update method called when data changes */
  update(row?: number, key?: string): void;
  /** Get current row index (for Form) */
  row?(): number;
  /** Bind data (for Form) */
  bind?(row: number, state?: string): void;
}

/**
 * Observable entry in the DataSync registry.
 */
export interface ObservableEntry {
  /** The component instance */
  component: SyncableComponent;
  /** Unique identifier for the component */
  id: string;
}

/**
 * Options for DataSync instance.
 */
export interface DataSyncOptions {
  /** The page context element */
  context?: NaturalElement | null;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Notification payload for data change events.
 */
export interface DataChangeNotification {
  /** The component that initiated the change */
  source: SyncableComponent;
  /** The row index that changed (if applicable) */
  row?: number;
  /** The key/column that changed (if applicable) */
  key?: string;
  /** The data array reference */
  data: SyncableDataRow[];
}

/**
 * Listener for data change events.
 */
export type DataChangeListener = (notification: DataChangeNotification) => void;

/**
 * Data filter condition function type.
 */
export type FilterConditionFn<T = Record<string, unknown>> = (item: T, index?: number, array?: T[]) => boolean;

/**
 * Data filter condition types.
 */
export type FilterCondition<T = Record<string, unknown>> = FilterConditionFn<T> | string;

/**
 * Sort direction.
 */
export type SortDirection = 'asc' | 'desc' | boolean;

/**
 * Comparator function type for sorting.
 */
export type ComparatorFn<T = Record<string, unknown>> = (a: T, b: T) => number;

