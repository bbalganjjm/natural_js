/**
 * Event utilities for Natural-JS framework.
 * Functions for event handling and keyboard/mouse utilities.
 * SSR compatible - returns safe defaults in server environment.
 */

import { isBrowser, getDocument, getWindow, getNavigator } from '@natural-js/shared';
import { trimToZero } from '../string';

/**
 * Key codes for common special keys.
 */
export const KeyCode = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  ESCAPE: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  INSERT: 45,
  DELETE: 46,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
} as const;

// Character keys for Ctrl combinations
const CTRL_CHAR_KEYS = [
  97, 65, // a, A - Select All
  99, 67, // c, C - Copy
  118, 86, // v, V - Paste
  115, 83, // s, S - Save
  112, 80, // p, P - Print
];

// Special navigation keys
const SPECIAL_KEYS: number[] = [
  KeyCode.BACKSPACE,
  KeyCode.TAB,
  KeyCode.ESCAPE,
  KeyCode.ENTER,
  KeyCode.END,
  KeyCode.HOME,
  KeyCode.LEFT,
  KeyCode.RIGHT,
  KeyCode.DELETE,
  KeyCode.INSERT,
];

/**
 * Check if a key event is related to number input.
 * Allows numbers, special keys, and Ctrl combinations.
 *
 * @param e - Keyboard event
 * @returns True if the key is allowed for number input
 *
 * @example
 * ```typescript
 * inputEl.addEventListener('keydown', (e) => {
 *   if (!isNumberRelatedKeys(e)) {
 *     e.preventDefault();
 *   }
 * });
 * ```
 */
export function isNumberRelatedKeys(e: KeyboardEvent): boolean {
  if (!isBrowser()) return true;

  const key = e.keyCode ?? e.which ?? e.charCode ?? 0;

  // Check if pressed key is a number (0-9 from numpad or keyboard)
  if ((key >= 48 && key <= 57) || (key >= 96 && key <= 105)) {
    return true;
  }

  const nav = getNavigator();
  const isFirefox = nav ? nav.userAgent.indexOf('Firefox') !== -1 : false;

  // Allow: Ctrl + char for actions (save, print, copy, etc.)
  if (e.ctrlKey && CTRL_CHAR_KEYS.includes(key)) {
    return true;
  }

  // Fix Issue: F1-F12 or Ctrl + F1-F12 in Firefox
  if (isFirefox && ((e.ctrlKey && e.keyCode && e.keyCode > 0 && key >= 112 && key <= 123) ||
      (e.keyCode && e.keyCode > 0 && key >= 112 && key <= 123))) {
    return true;
  }

  // Allow: Special navigation keys
  if (SPECIAL_KEYS.includes(key)) {
    // Fix Issue: right arrow, delete, insert in Firefox
    if (isFirefox && (key === KeyCode.RIGHT || key === KeyCode.INSERT || key === KeyCode.DELETE)) {
      return e.keyCode !== undefined && e.keyCode > 0;
    }
    // Disallow: #, $, % with Shift
    if (e.shiftKey && (key === KeyCode.END || key === KeyCode.HOME || key === KeyCode.LEFT)) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Prevent all event actions (propagation and default).
 *
 * @param e - Event to disable
 * @returns false
 *
 * @example
 * ```typescript
 * element.addEventListener('click', (e) => {
 *   if (someCondition) {
 *     return disable(e);
 *   }
 * });
 * ```
 */
export function disable(e: Event): false {
  try {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
  } catch {
    // Silently ignore errors
  }
  return false;
}

/**
 * Prevent default action only.
 *
 * @param e - Event to prevent
 * @returns false
 */
export function preventDefault(e: Event): false {
  try {
    e.preventDefault();
  } catch {
    // Silently ignore errors
  }
  return false;
}

/**
 * Stop event propagation only.
 *
 * @param e - Event to stop
 * @returns false
 */
export function stopPropagation(e: Event): false {
  try {
    e.stopPropagation();
    e.stopImmediatePropagation();
  } catch {
    // Silently ignore errors
  }
  return false;
}

/**
 * Lock window scroll when scrolling inside an element.
 *
 * @param element - Element to lock scroll for
 * @returns Cleanup function to remove the listener
 *
 * @example
 * ```typescript
 * const cleanup = windowScrollLock(modalElement);
 * // Later: cleanup();
 * ```
 */
export function windowScrollLock(element: HTMLElement): () => void {
  if (!isBrowser()) return () => {};

  const handler = (e: WheelEvent) => {
    const delta = e.deltaY;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    // Scrolling up at top
    if (delta < 0 && scrollTop <= 0) {
      e.preventDefault();
      return false;
    }

    // Scrolling down at bottom
    if (delta > 0 && scrollTop >= scrollHeight - clientHeight) {
      e.preventDefault();
      return false;
    }

    return true;
  };

  element.addEventListener('wheel', handler, { passive: false });

  return () => {
    element.removeEventListener('wheel', handler);
  };
}

/**
 * Get the maximum duration from a CSS duration property.
 *
 * @param element - Element to check
 * @param property - CSS property name (e.g., 'animation-duration', 'transition-duration')
 * @returns Maximum duration in milliseconds
 *
 * @example
 * ```typescript
 * const duration = getMaxDuration(element, 'animation-duration');
 * ```
 */
export function getMaxDuration(element: HTMLElement, property: string): number {
  if (!isBrowser()) return 0;

  const win = getWindow();
  if (!win) return 0;

  const style = win.getComputedStyle(element);
  const value = style.getPropertyValue(property);

  if (!value || value === '0s' || value.startsWith('0')) {
    return 0;
  }

  const durations = value.split(',').map((v) => {
    const trimmed = v.trim();
    if (trimmed.indexOf('ms') > -1) {
      return parseInt(trimToZero(trimmed), 10);
    } else {
      return parseFloat(trimToZero(trimmed)) * 1000;
    }
  });

  return Math.max(...durations);
}

/**
 * Animation event name mapping by browser.
 */
const ANIMATION_EVENTS: Record<string, string> = {
  animation: 'animationend',
  OAnimation: 'oAnimationEnd',
  MSAnimation: 'MSAnimationEnd',
  WebkitAnimation: 'webkitAnimationEnd',
};

/**
 * Detect the animationend event name for the current browser.
 *
 * @param element - Optional element to check animation duration
 * @returns Animation end event name or 'nothing' if not supported
 *
 * @example
 * ```typescript
 * const eventName = whichAnimationEvent(element);
 * if (eventName !== 'nothing') {
 *   element.addEventListener(eventName, callback);
 * }
 * ```
 */
export function whichAnimationEvent(element?: HTMLElement): string {
  if (!isBrowser()) return 'nothing';

  const doc = getDocument();
  if (!doc) return 'nothing';

  if (element && getMaxDuration(element, 'animation-duration') === 0) {
    return 'nothing';
  }

  const el = element ?? doc.createElement('div');

  for (const [prop, eventName] of Object.entries(ANIMATION_EVENTS)) {
    if ((el.style as unknown as Record<string, unknown>)[prop] !== undefined) {
      return eventName;
    }
  }

  return 'nothing';
}

/**
 * Transition event name mapping by browser.
 */
const TRANSITION_EVENTS: Record<string, string> = {
  transition: 'transitionend',
  OTransition: 'oTransitionEnd',
  MozTransition: 'transitionend',
  WebkitTransition: 'webkitTransitionEnd',
};

/**
 * Detect the transitionend event name for the current browser.
 *
 * @param element - Optional element to check transition duration
 * @returns Transition end event name or 'nothing' if not supported
 *
 * @example
 * ```typescript
 * const eventName = whichTransitionEvent(element);
 * if (eventName !== 'nothing') {
 *   element.addEventListener(eventName, callback);
 * }
 * ```
 */
export function whichTransitionEvent(element?: HTMLElement): string {
  if (!isBrowser()) return 'nothing';

  const doc = getDocument();
  if (!doc) return 'nothing';

  if (element && getMaxDuration(element, 'transition-duration') === 0) {
    return 'nothing';
  }

  const el = doc.createElement('div');

  for (const [prop, eventName] of Object.entries(TRANSITION_EVENTS)) {
    if ((el.style as unknown as Record<string, unknown>)[prop] !== undefined) {
      return eventName;
    }
  }

  return 'nothing';
}

/**
 * Add a one-time event listener.
 *
 * @param element - Target element
 * @param eventName - Event name
 * @param handler - Event handler
 * @param options - Event listener options
 */
export function once(
  element: HTMLElement | Window | Document,
  eventName: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): void {
  if (!isBrowser()) return;

  element.addEventListener(eventName, handler, { ...options, once: true });
}

/**
 * Create a debounced event handler.
 *
 * @param handler - Original handler
 * @param delay - Delay in milliseconds
 * @returns Debounced handler
 *
 * @example
 * ```typescript
 * window.addEventListener('resize', debounce((e) => {
 *   console.log('Resized');
 * }, 200));
 * ```
 */
export function debounce<T extends (...args: unknown[]) => void>(
  handler: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      handler.apply(this, args);
    }, delay);
  };
}

/**
 * Create a throttled event handler.
 *
 * @param handler - Original handler
 * @param limit - Minimum time between calls in milliseconds
 * @returns Throttled handler
 *
 * @example
 * ```typescript
 * window.addEventListener('scroll', throttle((e) => {
 *   console.log('Scrolled');
 * }, 100));
 * ```
 */
export function throttle<T extends (...args: unknown[]) => void>(
  handler: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (this: unknown, ...args: Parameters<T>): void {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      handler.apply(this, args);
    }
  };
}

/**
 * Event utilities namespace object.
 */
export const event = {
  KeyCode,
  isNumberRelatedKeys,
  disable,
  preventDefault,
  stopPropagation,
  windowScrollLock,
  getMaxDuration,
  whichAnimationEvent,
  whichTransitionEvent,
  once,
  debounce,
  throttle,
} as const;

export default event;

