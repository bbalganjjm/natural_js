/**
 * Garbage Collection utilities for Natural-JS framework.
 * Functions for cleaning up event listeners and resources.
 * SSR compatible - returns safe defaults in server environment.
 */

import { isBrowser, getDocument, getWindow } from '@natural-js/shared';

/**
 * Event namespace registry.
 * Tracks registered event handlers for cleanup.
 */
const eventRegistry = new Map<string, Set<{ target: EventTarget; handler: EventListener }>>();

/**
 * Register an event handler for later cleanup.
 *
 * @param namespace - Event namespace (e.g., 'datepicker', 'alert')
 * @param target - Event target (window, document, element)
 * @param eventType - Event type (e.g., 'resize', 'click')
 * @param handler - Event handler function
 */
export function registerEvent(
  namespace: string,
  target: EventTarget,
  eventType: string,
  handler: EventListener
): void {
  const key = `${eventType}.${namespace}`;
  let handlers = eventRegistry.get(key);
  if (!handlers) {
    handlers = new Set();
    eventRegistry.set(key, handlers);
  }
  handlers.add({ target, handler });
  target.addEventListener(eventType, handler);
}

/**
 * Unregister and remove event handlers by namespace.
 *
 * @param namespace - Event namespace to clean up
 * @param eventType - Optional event type filter
 */
export function unregisterEvents(namespace: string, eventType?: string): void {
  const keysToRemove: string[] = [];

  eventRegistry.forEach((handlers, key) => {
    const keyParts = key.split('.');
    const keyNamespace = keyParts[1];
    const keyEventType = keyParts[0];

    if (keyNamespace === namespace && (!eventType || keyEventType === eventType)) {
      handlers.forEach(({ target, handler }) => {
        target.removeEventListener(keyEventType ?? '', handler);
      });
      keysToRemove.push(key);
    }
  });

  keysToRemove.forEach((key) => eventRegistry.delete(key));
}

/**
 * Event namespaces used by Natural-JS components.
 */
export const EventNamespaces = {
  DATEPICKER: 'datepicker',
  ALERT: 'alert',
  GRID: 'grid',
  GRID_RESIZE: 'grid.resize',
  GRID_VRESIZE: 'grid.vResize',
  GRID_DATAFILTER: 'grid.dataFilter',
  GRID_MORE: 'grid.more',
  POPUP: 'popup',
  TAB: 'tab',
  UI: 'ui',
} as const;

/**
 * Minimum garbage collection.
 * Removes commonly re-created event handlers.
 *
 * @returns true
 *
 * @example
 * ```typescript
 * // Call before creating new datepicker/alert instances
 * minimum();
 * ```
 */
export function minimum(): true {
  if (!isBrowser()) return true;

  const win = getWindow();
  const doc = getDocument();
  if (!win || !doc) return true;

  // Clean up window resize handlers
  unregisterEvents(EventNamespaces.DATEPICKER, 'resize');
  unregisterEvents(EventNamespaces.ALERT, 'resize');

  // Clean up document click/keyup handlers
  unregisterEvents(EventNamespaces.DATEPICKER, 'click');
  unregisterEvents(EventNamespaces.ALERT, 'keyup');
  unregisterEvents(EventNamespaces.GRID_DATAFILTER, 'click');
  unregisterEvents(EventNamespaces.GRID_MORE, 'click');
  unregisterEvents(EventNamespaces.GRID_MORE, 'touchstart');

  return true;
}

/**
 * Full garbage collection.
 * Removes all component-related event handlers.
 *
 * @returns true
 *
 * @example
 * ```typescript
 * // Call when navigating away from page or closing major components
 * full();
 * ```
 */
export function full(): true {
  if (!isBrowser()) return true;

  // Run minimum collection first
  minimum();

  // Additional cleanup for drag/resize handlers
  const doc = getDocument();
  if (!doc) return true;

  // Alert drag handlers
  unregisterEvents(EventNamespaces.ALERT, 'dragstart');
  unregisterEvents(EventNamespaces.ALERT, 'selectstart');
  unregisterEvents(EventNamespaces.ALERT, 'mousemove');
  unregisterEvents(EventNamespaces.ALERT, 'touchmove');
  unregisterEvents(EventNamespaces.ALERT, 'mouseup');
  unregisterEvents(EventNamespaces.ALERT, 'touchend');

  // Grid resize handlers
  unregisterEvents(EventNamespaces.GRID_VRESIZE, 'dragstart');
  unregisterEvents(EventNamespaces.GRID_VRESIZE, 'selectstart');
  unregisterEvents(EventNamespaces.GRID_VRESIZE, 'mousemove');
  unregisterEvents(EventNamespaces.GRID_VRESIZE, 'touchmove');
  unregisterEvents(EventNamespaces.GRID_VRESIZE, 'mouseup');
  unregisterEvents(EventNamespaces.GRID_VRESIZE, 'touchend');

  unregisterEvents(EventNamespaces.GRID_RESIZE, 'dragstart');
  unregisterEvents(EventNamespaces.GRID_RESIZE, 'selectstart');
  unregisterEvents(EventNamespaces.GRID_RESIZE, 'mousemove');
  unregisterEvents(EventNamespaces.GRID_RESIZE, 'touchmove');
  unregisterEvents(EventNamespaces.GRID_RESIZE, 'mouseup');
  unregisterEvents(EventNamespaces.GRID_RESIZE, 'touchend');

  return true;
}

/**
 * Clear all registered event handlers.
 * Use with caution - this removes ALL tracked handlers.
 *
 * @returns true
 */
export function clearAll(): true {
  if (!isBrowser()) return true;

  eventRegistry.forEach((handlers, key) => {
    const eventType = key.split('.')[0] ?? '';
    handlers.forEach(({ target, handler }) => {
      target.removeEventListener(eventType, handler);
    });
  });

  eventRegistry.clear();
  return true;
}

/**
 * Get count of registered event handlers.
 * Useful for debugging memory leaks.
 *
 * @returns Number of registered handlers
 */
export function getEventCount(): number {
  let count = 0;
  eventRegistry.forEach((handlers) => {
    count += handlers.size;
  });
  return count;
}

/**
 * Get list of registered event namespaces.
 * Useful for debugging.
 *
 * @returns Array of registered namespace keys
 */
export function getRegisteredNamespaces(): string[] {
  return Array.from(eventRegistry.keys());
}

/**
 * Garbage collection utilities namespace object.
 */
export const gc = {
  registerEvent,
  unregisterEvents,
  minimum,
  full,
  clearAll,
  getEventCount,
  getRegisteredNamespaces,
  EventNamespaces,
} as const;

export default gc;

