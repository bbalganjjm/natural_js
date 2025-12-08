/**
 * Element utilities for Natural-JS framework.
 * Functions for DOM element manipulation and data extraction.
 * SSR compatible - returns safe defaults in server environment.
 */

import { isBrowser, getDocument, getWindow } from '@natural-js/shared';
import { type as getType, isArray } from '../type';

/**
 * Data store for element data (replaces jQuery.data).
 */
const elementDataStore = new WeakMap<Element, Map<string, unknown>>();

/**
 * Get data associated with an element.
 *
 * @param element - Target element
 * @param key - Data key (optional, returns all data if not provided)
 * @returns Data value or all data
 */
export function getData(element: Element, key?: string): unknown {
  const data = elementDataStore.get(element);
  if (!data) return key ? undefined : {};
  if (key === undefined) {
    return Object.fromEntries(data);
  }
  return data.get(key);
}

/**
 * Set data on an element.
 *
 * @param element - Target element
 * @param key - Data key
 * @param value - Data value
 */
export function setData(element: Element, key: string, value: unknown): void {
  let data = elementDataStore.get(element);
  if (!data) {
    data = new Map();
    elementDataStore.set(element, data);
  }
  data.set(key, value);
}

/**
 * Remove data from an element.
 *
 * @param element - Target element
 * @param key - Data key (optional, removes all if not provided)
 */
export function removeData(element: Element, key?: string): void {
  if (key === undefined) {
    elementDataStore.delete(element);
  } else {
    const data = elementDataStore.get(element);
    if (data) {
      data.delete(key);
    }
  }
}

/**
 * Get options object from element's data attribute.
 *
 * @param element - Target element
 * @returns Options object stored in 'opts' data key
 *
 * @example
 * ```typescript
 * const opts = toOpts(element);
 * // Equivalent to: getData(element, 'opts')
 * ```
 */
export function toOpts(element: Element): Record<string, unknown> | undefined {
  const stored = getData(element, 'opts') as Record<string, unknown> | undefined;
  if (stored !== undefined) {
    return stored;
  }

  const datasetValue = (element as HTMLElement).dataset?.opts;
  if (!datasetValue) return undefined;

  try {
    // Expect strict JSON in data-opts (consistent with docs)
    return JSON.parse(datasetValue) as Record<string, unknown>;
  } catch (_e) {
    // Fallback to undefined on parse error to avoid runtime breakage
    return undefined;
  }
}

/**
 * Extract validation rules from form elements.
 *
 * @param elements - Array or collection of input elements
 * @param ruleset - Data attribute name for rules (default: 'validate')
 * @returns Object mapping element IDs/names to their rules
 *
 * @example
 * ```typescript
 * const rules = toRules(formInputs, 'validate');
 * // Returns: { fieldId: ['required', 'email'], ... }
 * ```
 */
export function toRules(
  elements: Element[] | NodeList | HTMLCollection,
  ruleset: string = 'validate'
): Record<string, unknown> {
  const rules: Record<string, unknown> = {};
  const elemArray = Array.from(elements);

  for (const elem of elemArray) {
    const element = elem as HTMLElement;
    let id: string | null = null;

    // For radio/checkbox, use name attribute
    if (element instanceof HTMLInputElement) {
      if (element.type === 'radio' || element.type === 'checkbox') {
        id = element.name;
      } else {
        id = element.id;
      }
    } else {
      id = element.id;
    }

    if (id) {
      const ruleData = getData(element, ruleset) ?? element.dataset[ruleset];
      if (ruleData) {
        if (typeof ruleData === 'string') {
          try {
            rules[id] = JSON.parse(ruleData);
          } catch (_e) {
            rules[id] = ruleData;
          }
        } else {
          rules[id] = ruleData;
        }
      }
    }
  }

  return rules;
}

/**
 * Extract data object from form elements.
 *
 * @param elements - Array or collection of input elements
 * @returns Object mapping element IDs to their values
 *
 * @example
 * ```typescript
 * const data = toData(document.querySelectorAll('input, select, textarea'));
 * // Returns: { fieldId: 'value', ... }
 * ```
 */
export function toData(elements: Element[] | NodeList | HTMLCollection): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const elemArray = Array.from(elements);
  const processedNames = new Set<string>();

  for (const elem of elemArray) {
    const element = elem as HTMLElement;
    let key: string | null = null;

    if (element instanceof HTMLInputElement) {
      if (element.type === 'radio' || element.type === 'checkbox') {
        // Handle radio/checkbox groups
        const name = element.name;
        if (name && !processedNames.has(name)) {
          processedNames.add(name);
          const group = elemArray.filter(
            (e) => e instanceof HTMLInputElement && e.name === name && (e.type === 'radio' || e.type === 'checkbox')
          ) as HTMLInputElement[];

          if (group.length > 0) {
            if (group[0]?.type === 'checkbox') {
              // Checkbox - collect all checked values
              const values = group.filter((e) => e.checked).map((e) => e.value);
              data[name] = values.length === 1 ? values[0] : values;
            } else {
              // Radio - get single checked value
              const checked = group.find((e) => e.checked);
              data[name] = checked?.value ?? '';
            }
          }
        }
      } else {
        key = element.id || element.name;
        if (key) {
          data[key] = element.value;
        }
      }
    } else if (element instanceof HTMLSelectElement) {
      key = element.id || element.name;
      if (key) {
        if (element.multiple) {
          data[key] = Array.from(element.selectedOptions).map((opt) => opt.value);
        } else {
          data[key] = element.value;
        }
      }
    } else if (element instanceof HTMLTextAreaElement) {
      key = element.id || element.name;
      if (key) {
        data[key] = element.value;
      }
    } else if (element instanceof HTMLImageElement) {
      key = element.id;
      if (key) {
        data[key] = element.src;
      }
    } else {
      key = element.id;
      if (key) {
        data[key] = element.textContent ?? '';
      }
    }
  }

  return data;
}

/**
 * Apply data change effect to an element (highlight and fade).
 *
 * @param element - Target element
 * @param className - CSS class to add (default: 'data_changed__')
 */
export function dataChanged(element: Element, className: string = 'data_changed__'): void {
  if (!isBrowser()) return;

  element.classList.add(className);

  // Fade effect using CSS transitions
  const htmlElement = element as HTMLElement;
  htmlElement.style.transition = 'opacity 0.15s ease-in-out';
  htmlElement.style.opacity = '0';

  setTimeout(() => {
    htmlElement.style.opacity = '1';
    setTimeout(() => {
      htmlElement.style.transition = '';
    }, 300);
  }, 150);
}

/**
 * Get the maximum z-index of elements.
 *
 * @param elements - Elements to check (optional, defaults to common layout elements)
 * @returns Maximum z-index value
 *
 * @example
 * ```typescript
 * const maxZ = maxZindex();
 * popupElement.style.zIndex = String(maxZ + 1);
 * ```
 */
export function maxZindex(elements?: Element[] | NodeList | HTMLCollection): number {
  if (!isBrowser()) return 0;

  const doc = getDocument();
  const win = getWindow();
  if (!doc || !win) return 0;

  let elemArray: Element[];

  if (elements) {
    elemArray = Array.from(elements) as Element[];
  } else {
    elemArray = Array.from(doc.querySelectorAll('div, span, ul, p, nav, article, section'));
  }

  const MAX_ZINDEX = 2147483647;
  let maxZ = 0;

  for (const elem of elemArray) {
    const htmlElement = elem as HTMLElement;
    const computedZ = win.getComputedStyle(htmlElement).zIndex;
    let zIndex = parseInt(computedZ, 10) || 0;

    // Limit extremely high z-index values
    if (zIndex >= MAX_ZINDEX) {
      htmlElement.style.zIndex = String(MAX_ZINDEX - 999);
      htmlElement.setAttribute('data-limited-zindex', 'true');
      zIndex = MAX_ZINDEX - 999;
    }

    if (zIndex > maxZ) {
      maxZ = zIndex;
    }
  }

  return maxZ;
}

/**
 * Find the closest ancestor matching a selector.
 *
 * @param element - Starting element
 * @param selector - CSS selector
 * @returns Matching ancestor or null
 */
export function closest(element: Element, selector: string): Element | null {
  if (!isBrowser()) return null;
  return element.closest(selector);
}

/**
 * Check if element matches a selector.
 *
 * @param element - Element to check
 * @param selector - CSS selector
 * @returns True if element matches
 */
export function matches(element: Element, selector: string): boolean {
  return element.matches(selector);
}

/**
 * Get element offset relative to document.
 *
 * @param element - Target element
 * @returns Object with top and left values
 */
export function getOffset(element: HTMLElement): { top: number; left: number } {
  if (!isBrowser()) return { top: 0, left: 0 };

  const rect = element.getBoundingClientRect();
  const win = getWindow();
  const doc = getDocument();

  if (!win || !doc) return { top: 0, left: 0 };

  return {
    top: rect.top + win.scrollY,
    left: rect.left + win.scrollX,
  };
}

/**
 * Get element position relative to offset parent.
 *
 * @param element - Target element
 * @returns Object with top and left values
 */
export function getPosition(element: HTMLElement): { top: number; left: number } {
  if (!isBrowser()) return { top: 0, left: 0 };

  return {
    top: element.offsetTop,
    left: element.offsetLeft,
  };
}

/**
 * Element utilities namespace object.
 */
export const element = {
  getData,
  setData,
  removeData,
  toOpts,
  toRules,
  toData,
  dataChanged,
  maxZindex,
  closest,
  matches,
  getOffset,
  getPosition,
} as const;

export default element;

