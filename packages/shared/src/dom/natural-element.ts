/**
 * NaturalElement - A jQuery-like DOM abstraction layer for Natural-JS.
 * Provides chainable DOM manipulation, event handling, and traversal methods.
 * SSR-compatible: all browser APIs are accessed conditionally.
 */

import { isBrowser, getDocument, getWindow } from '../environment';
import type { Selector, NaturalEventName, Callback, JSONObject } from '../types';

/**
 * Event listener storage for proper cleanup.
 */
interface EventListenerEntry {
  type: string;
  handler: EventListener;
  options?: AddEventListenerOptions;
  namespace?: string;
}

/**
 * Data storage type for element data.
 */
type DataStore = Map<Element, Map<string, unknown>>;

/**
 * Event storage type for element events.
 */
type EventStore = Map<Element, EventListenerEntry[]>;

/**
 * Global data and event storage (WeakMap-like behavior).
 */
const dataStore: DataStore = new Map();
const eventStore: EventStore = new Map();

/**
 * NaturalElement class - jQuery replacement for DOM manipulation.
 * Supports method chaining and SSR compatibility.
 */
export class NaturalElement {
  /**
   * The underlying array of DOM elements.
   */
  readonly elements: Element[];

  /**
   * Number of elements in the collection.
   */
  get length(): number {
    return this.elements.length;
  }

  /**
   * Create a new NaturalElement instance.
   *
   * @param selector - CSS selector string, Element, Element array, NodeList, or NaturalElement
   */
  constructor(selector: Selector | NaturalElement | null | undefined) {
    if (!isBrowser()) {
      this.elements = [];
      return;
    }

    if (selector === null || selector === undefined) {
      this.elements = [];
    } else if (typeof selector === 'string') {
      const doc = getDocument();
      if (doc) {
        // Check if selector is HTML string
        if (selector.trim().startsWith('<')) {
          const template = doc.createElement('template');
          template.innerHTML = selector.trim();
          this.elements = Array.from(template.content.children);
        } else {
          this.elements = Array.from(doc.querySelectorAll(selector));
        }
      } else {
        this.elements = [];
      }
    } else if (selector instanceof NaturalElement) {
      this.elements = [...selector.elements];
    } else if (selector instanceof Element) {
      this.elements = [selector];
    } else if (selector instanceof NodeList) {
      this.elements = Array.from(selector) as Element[];
    } else if (Array.isArray(selector)) {
      this.elements = selector.filter((el): el is Element => el instanceof Element);
    } else {
      this.elements = [];
    }
  }

  // ============================================================================
  // Array-like Methods
  // ============================================================================

  /**
   * Get the element at the specified index.
   *
   * @param index - The index of the element to retrieve
   * @returns The element at the index or undefined
   */
  get(): Element[];
  get(index: number): Element | undefined;
  get(index?: number): Element | Element[] | undefined {
    if (index === undefined) {
      return [...this.elements];
    }
    const idx = index < 0 ? this.elements.length + index : index;
    return this.elements[idx];
  }

  /**
   * Get a new NaturalElement with the element at the specified index.
   *
   * @param index - The index of the element
   * @returns New NaturalElement containing only the specified element
   */
  eq(index: number): NaturalElement {
    const idx = index < 0 ? this.elements.length + index : index;
    const element = this.elements[idx];
    return new NaturalElement(element ?? null);
  }

  /**
   * Get the first element in the collection.
   *
   * @returns New NaturalElement with the first element
   */
  first(): NaturalElement {
    return this.eq(0);
  }

  /**
   * Get the last element in the collection.
   *
   * @returns New NaturalElement with the last element
   */
  last(): NaturalElement {
    return this.eq(-1);
  }

  /**
   * Iterate over each element in the collection.
   *
   * @param callback - Function to execute for each element (index, element) => void
   * @returns This NaturalElement for chaining
   */
  each(callback: (index: number, element: Element) => void | false): NaturalElement {
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i];
      if (element) {
        const result = callback.call(element, i, element);
        if (result === false) break;
      }
    }
    return this;
  }

  /**
   * Map each element to a new value.
   *
   * @param callback - Function to execute for each element
   * @returns Array of mapped values
   */
  map<T>(callback: (index: number, element: Element) => T): T[] {
    return this.elements.map((element, index) => callback.call(element, index, element));
  }

  /**
   * Convert to array.
   *
   * @returns Array of elements
   */
  toArray(): Element[] {
    return [...this.elements];
  }

  /**
   * Get the index of the specified element or selector.
   *
   * @param selector - Element or selector to find
   * @returns Index of the element or -1 if not found
   */
  index(selector?: Selector | NaturalElement): number {
    if (selector === undefined) {
      const parent = this.elements[0]?.parentElement;
      if (parent) {
        return Array.from(parent.children).indexOf(this.elements[0] as Element);
      }
      return -1;
    }

    const target =
      selector instanceof NaturalElement
        ? selector.elements[0]
        : typeof selector === 'string'
          ? getDocument()?.querySelector(selector)
          : selector instanceof Element
            ? selector
            : null;

    if (target) {
      return this.elements.indexOf(target);
    }
    return -1;
  }

  // ============================================================================
  // Element Finding and Filtering
  // ============================================================================

  /**
   * Find descendant elements matching the selector.
   *
   * @param selector - CSS selector string
   * @returns New NaturalElement with matching descendants
   */
  find(selector: string): NaturalElement {
    const found: Element[] = [];
    this.elements.forEach((element) => {
      const descendants = element.querySelectorAll(selector);
      found.push(...Array.from(descendants));
    });
    return new NaturalElement(found);
  }

  /**
   * Filter elements matching the selector.
   *
   * @param selector - CSS selector string or filter function
   * @returns New NaturalElement with matching elements
   */
  filter(selector: string | ((index: number, element: Element) => boolean)): NaturalElement {
    let filtered: Element[];

    if (typeof selector === 'string') {
      filtered = this.elements.filter((element) => element.matches(selector));
    } else {
      filtered = this.elements.filter((element, index) => selector.call(element, index, element));
    }

    return new NaturalElement(filtered);
  }

  /**
   * Get elements not matching the selector.
   *
   * @param selector - CSS selector string
   * @returns New NaturalElement with non-matching elements
   */
  not(selector: string): NaturalElement {
    const filtered = this.elements.filter((element) => !element.matches(selector));
    return new NaturalElement(filtered);
  }

  /**
   * Check if any element matches the selector.
   *
   * @param selector - CSS selector string
   * @returns True if any element matches
   */
  is(selector: string): boolean {
    // Handle jQuery-like pseudo-selectors that are not standard CSS
    if (selector === ':input') {
      return this.elements.some((element) => {
        const tagName = element.tagName.toLowerCase();
        return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || tagName === 'button';
      });
    }
    if (selector === ':visible') {
      return this.elements.some((element) => {
        if (element instanceof HTMLElement) {
          return element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0;
        }
        return false;
      });
    }
    if (selector === ':hidden') {
      return this.elements.some((element) => {
        if (element instanceof HTMLElement) {
          return element.offsetWidth === 0 && element.offsetHeight === 0 && element.getClientRects().length === 0;
        }
        return true;
      });
    }
    return this.elements.some((element) => element.matches(selector));
  }

  /**
   * Check if the collection contains the specified element.
   *
   * @param element - Element to check
   * @returns True if the collection contains the element
   */
  has(element: Element | string): NaturalElement {
    const filtered = this.elements.filter((el) => {
      if (typeof element === 'string') {
        return el.querySelector(element) !== null;
      }
      return el.contains(element);
    });
    return new NaturalElement(filtered);
  }

  // ============================================================================
  // DOM Traversal
  // ============================================================================

  /**
   * Get the parent element(s).
   *
   * @param selector - Optional CSS selector to filter parents
   * @returns New NaturalElement with parent elements
   */
  parent(selector?: string): NaturalElement {
    const parents: Element[] = [];
    this.elements.forEach((element) => {
      const parent = element.parentElement;
      if (parent && !parents.includes(parent)) {
        if (!selector || parent.matches(selector)) {
          parents.push(parent);
        }
      }
    });
    return new NaturalElement(parents);
  }

  /**
   * Get all ancestor elements.
   *
   * @param selector - Optional CSS selector to filter ancestors
   * @returns New NaturalElement with ancestor elements
   */
  parents(selector?: string): NaturalElement {
    const ancestors: Element[] = [];
    this.elements.forEach((element) => {
      let parent = element.parentElement;
      while (parent) {
        if (!ancestors.includes(parent)) {
          if (!selector || parent.matches(selector)) {
            ancestors.push(parent);
          }
        }
        parent = parent.parentElement;
      }
    });
    return new NaturalElement(ancestors);
  }

  /**
   * Get the closest ancestor matching the selector.
   *
   * @param selector - CSS selector string
   * @returns New NaturalElement with closest matching ancestors
   */
  closest(selector: string): NaturalElement {
    const closest: Element[] = [];
    this.elements.forEach((element) => {
      const found = element.closest(selector);
      if (found && !closest.includes(found)) {
        closest.push(found);
      }
    });
    return new NaturalElement(closest);
  }

  /**
   * Get all children elements.
   *
   * @param selector - Optional CSS selector to filter children
   * @returns New NaturalElement with children elements
   */
  children(selector?: string): NaturalElement {
    const children: Element[] = [];
    this.elements.forEach((element) => {
      Array.from(element.children).forEach((child) => {
        if (!selector || child.matches(selector)) {
          children.push(child);
        }
      });
    });
    return new NaturalElement(children);
  }

  /**
   * Get sibling elements.
   *
   * @param selector - Optional CSS selector to filter siblings
   * @returns New NaturalElement with sibling elements
   */
  siblings(selector?: string): NaturalElement {
    const siblings: Element[] = [];
    this.elements.forEach((element) => {
      const parent = element.parentElement;
      if (parent) {
        Array.from(parent.children).forEach((child) => {
          if (child !== element && !siblings.includes(child)) {
            if (!selector || child.matches(selector)) {
              siblings.push(child);
            }
          }
        });
      }
    });
    return new NaturalElement(siblings);
  }

  /**
   * Get the next sibling element.
   *
   * @param selector - Optional CSS selector to filter
   * @returns New NaturalElement with next sibling elements
   */
  next(selector?: string): NaturalElement {
    const next: Element[] = [];
    this.elements.forEach((element) => {
      let sibling = element.nextElementSibling;
      while (sibling) {
        if (!selector || sibling.matches(selector)) {
          next.push(sibling);
          break;
        }
        if (selector) {
          sibling = sibling.nextElementSibling;
        } else {
          break;
        }
      }
    });
    return new NaturalElement(next);
  }

  /**
   * Get the previous sibling element.
   *
   * @param selector - Optional CSS selector to filter
   * @returns New NaturalElement with previous sibling elements
   */
  prev(selector?: string): NaturalElement {
    const prev: Element[] = [];
    this.elements.forEach((element) => {
      let sibling = element.previousElementSibling;
      while (sibling) {
        if (!selector || sibling.matches(selector)) {
          prev.push(sibling);
          break;
        }
        if (selector) {
          sibling = sibling.previousElementSibling;
        } else {
          break;
        }
      }
    });
    return new NaturalElement(prev);
  }

  // ============================================================================
  // Content Manipulation
  // ============================================================================

  /**
   * Get or set the innerHTML of elements.
   *
   * @param content - Optional HTML content to set
   * @returns HTML content if getting, NaturalElement if setting
   */
  html(): string;
  html(content: string): NaturalElement;
  html(content?: string): string | NaturalElement {
    if (content === undefined) {
      return this.elements[0]?.innerHTML ?? '';
    }
    this.elements.forEach((element) => {
      element.innerHTML = content;
    });
    return this;
  }

  /**
   * Get or set the text content of elements.
   *
   * @param content - Optional text content to set
   * @returns Text content if getting, NaturalElement if setting
   */
  text(): string;
  text(content: string): NaturalElement;
  text(content?: string): string | NaturalElement {
    if (content === undefined) {
      return this.elements[0]?.textContent ?? '';
    }
    this.elements.forEach((element) => {
      element.textContent = content;
    });
    return this;
  }

  /**
   * Get or set the value of form elements.
   *
   * @param value - Optional value to set
   * @returns Value if getting, NaturalElement if setting
   */
  val(): string;
  val(value: string | number | string[]): NaturalElement;
  val(value?: string | number | string[]): string | NaturalElement {
    const element = this.elements[0];

    if (value === undefined) {
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        return element.value;
      }
      if (element instanceof HTMLSelectElement) {
        if (element.multiple) {
          return Array.from(element.selectedOptions)
            .map((opt) => opt.value)
            .join(',');
        }
        return element.value;
      }
      return '';
    }

    this.elements.forEach((el) => {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.value = String(value);
      } else if (el instanceof HTMLSelectElement) {
        if (Array.isArray(value)) {
          Array.from(el.options).forEach((opt) => {
            opt.selected = value.includes(opt.value);
          });
        } else {
          el.value = String(value);
        }
      }
    });
    return this;
  }

  /**
   * Append content to each element.
   *
   * @param content - Content to append (HTML string, Element, or NaturalElement)
   * @returns This NaturalElement for chaining
   */
  append(content: string | Element | NaturalElement): NaturalElement {
    this.elements.forEach((element) => {
      if (typeof content === 'string') {
        element.insertAdjacentHTML('beforeend', content);
      } else if (content instanceof NaturalElement) {
        content.elements.forEach((el) => element.appendChild(el));
      } else if (content instanceof Element) {
        element.appendChild(content);
      }
    });
    return this;
  }

  /**
   * Prepend content to each element.
   *
   * @param content - Content to prepend (HTML string, Element, or NaturalElement)
   * @returns This NaturalElement for chaining
   */
  prepend(content: string | Element | NaturalElement): NaturalElement {
    this.elements.forEach((element) => {
      if (typeof content === 'string') {
        element.insertAdjacentHTML('afterbegin', content);
      } else if (content instanceof NaturalElement) {
        const firstChild = element.firstChild;
        content.elements.forEach((el) => element.insertBefore(el, firstChild));
      } else if (content instanceof Element) {
        element.insertBefore(content, element.firstChild);
      }
    });
    return this;
  }

  /**
   * Insert content before each element.
   *
   * @param content - Content to insert
   * @returns This NaturalElement for chaining
   */
  before(content: string | Element | NaturalElement): NaturalElement {
    this.elements.forEach((element) => {
      const parent = element.parentElement;
      if (parent) {
        if (typeof content === 'string') {
          element.insertAdjacentHTML('beforebegin', content);
        } else if (content instanceof NaturalElement) {
          content.elements.forEach((el) => parent.insertBefore(el, element));
        } else if (content instanceof Element) {
          parent.insertBefore(content, element);
        }
      }
    });
    return this;
  }

  /**
   * Insert content after each element.
   *
   * @param content - Content to insert
   * @returns This NaturalElement for chaining
   */
  after(content: string | Element | NaturalElement): NaturalElement {
    this.elements.forEach((element) => {
      const parent = element.parentElement;
      if (parent) {
        if (typeof content === 'string') {
          element.insertAdjacentHTML('afterend', content);
        } else if (content instanceof NaturalElement) {
          let ref = element.nextSibling;
          content.elements.forEach((el) => {
            parent.insertBefore(el, ref);
            ref = el.nextSibling;
          });
        } else if (content instanceof Element) {
          parent.insertBefore(content, element.nextSibling);
        }
      }
    });
    return this;
  }

  /**
   * Remove all elements from the DOM.
   *
   * @returns This NaturalElement for chaining
   */
  remove(): NaturalElement {
    this.elements.forEach((element) => {
      // Clean up event listeners
      const listeners = eventStore.get(element);
      if (listeners) {
        listeners.forEach((entry) => {
          element.removeEventListener(entry.type, entry.handler, entry.options);
        });
        eventStore.delete(element);
      }
      // Clean up data
      dataStore.delete(element);
      // Remove from DOM
      element.remove();
    });
    return this;
  }

  /**
   * Remove all child nodes from elements.
   *
   * @returns This NaturalElement for chaining
   */
  empty(): NaturalElement {
    this.elements.forEach((element) => {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    });
    return this;
  }

  /**
   * Clone elements.
   *
   * @param deep - Whether to clone descendants (default: true)
   * @returns New NaturalElement with cloned elements
   */
  clone(deep = true): NaturalElement {
    const cloned = this.elements.map((element) => element.cloneNode(deep) as Element);
    return new NaturalElement(cloned);
  }

  /**
   * Replace each element with new content.
   *
   * @param content - Content to replace with
   * @returns New NaturalElement with replacement content
   */
  replaceWith(content: string | Element | NaturalElement): NaturalElement {
    const newElements: Element[] = [];
    this.elements.forEach((element) => {
      if (typeof content === 'string') {
        const template = getDocument()?.createElement('template');
        if (template) {
          template.innerHTML = content.trim();
          const newEl = template.content.firstElementChild;
          if (newEl) {
            element.replaceWith(newEl);
            newElements.push(newEl);
          }
        }
      } else if (content instanceof NaturalElement) {
        element.replaceWith(...content.elements);
        newElements.push(...content.elements);
      } else if (content instanceof Element) {
        element.replaceWith(content);
        newElements.push(content);
      }
    });
    return new NaturalElement(newElements);
  }

  /**
   * Wrap each element with a wrapper element.
   *
   * @param wrapper - HTML string or Element to wrap with
   * @returns This NaturalElement for chaining
   */
  wrap(wrapper: string | Element): NaturalElement {
    this.elements.forEach((element) => {
      let wrapperEl: Element | null = null;

      if (typeof wrapper === 'string') {
        const template = getDocument()?.createElement('template');
        if (template) {
          template.innerHTML = wrapper.trim();
          wrapperEl = template.content.firstElementChild?.cloneNode(true) as Element;
        }
      } else {
        wrapperEl = wrapper.cloneNode(true) as Element;
      }

      if (wrapperEl) {
        element.parentNode?.insertBefore(wrapperEl, element);
        wrapperEl.appendChild(element);
      }
    });
    return this;
  }

  /**
   * Remove the parent wrapper of each element.
   *
   * @returns This NaturalElement for chaining
   */
  unwrap(): NaturalElement {
    this.elements.forEach((element) => {
      const parent = element.parentElement;
      if (parent && parent.parentElement) {
        parent.replaceWith(...Array.from(parent.childNodes));
      }
    });
    return this;
  }

  // ============================================================================
  // Attribute and Property Manipulation
  // ============================================================================

  /**
   * Get or set attributes.
   *
   * @param name - Attribute name or object of attributes
   * @param value - Optional value to set
   * @returns Attribute value if getting, NaturalElement if setting
   */
  attr(name: string): string | null;
  attr(name: string, value: string | number | boolean | null): NaturalElement;
  attr(name: Record<string, string | number | boolean | null>): NaturalElement;
  attr(
    name: string | Record<string, string | number | boolean | null>,
    value?: string | number | boolean | null
  ): string | null | NaturalElement {
    if (typeof name === 'string') {
      if (value === undefined) {
        return this.elements[0]?.getAttribute(name) ?? null;
      }
      this.elements.forEach((element) => {
        if (value === null) {
          element.removeAttribute(name);
        } else {
          element.setAttribute(name, String(value));
        }
      });
    } else {
      Object.entries(name).forEach(([key, val]) => {
        this.attr(key, val);
      });
    }
    return this;
  }

  /**
   * Remove an attribute from elements.
   *
   * @param name - Attribute name to remove
   * @returns This NaturalElement for chaining
   */
  removeAttr(name: string): NaturalElement {
    this.elements.forEach((element) => {
      element.removeAttribute(name);
    });
    return this;
  }

  /**
   * Get or set properties.
   *
   * @param name - Property name
   * @param value - Optional value to set
   * @returns Property value if getting, NaturalElement if setting
   */
  prop(name: string): unknown;
  prop(name: string, value: unknown): NaturalElement;
  prop(name: string, value?: unknown): unknown | NaturalElement {
    if (value === undefined) {
      return (this.elements[0] as unknown as Record<string, unknown>)?.[name];
    }
    this.elements.forEach((element) => {
      (element as unknown as Record<string, unknown>)[name] = value;
    });
    return this;
  }

  /**
   * Get or set data attributes.
   *
   * @param key - Data key (without 'data-' prefix)
   * @param value - Optional value to set
   * @returns Data value if getting, NaturalElement if setting
   */
  data(key: string): unknown;
  data(key: string, value: unknown): NaturalElement;
  data(key: Record<string, unknown>): NaturalElement;
  data(): Record<string, unknown>;
  data(key?: string | Record<string, unknown>, value?: unknown): unknown | NaturalElement {
    const element = this.elements[0];

    // Get all data
    if (key === undefined) {
      if (!element) return {};
      const stored = dataStore.get(element) ?? new Map();
      const result: Record<string, unknown> = Object.fromEntries(stored);

      // Also include data-* attributes
      if (element instanceof HTMLElement) {
        Object.entries(element.dataset).forEach(([k, v]) => {
          if (!(k in result)) {
            result[k] = v;
          }
        });
      }
      return result;
    }

    // Set multiple data values
    if (typeof key === 'object') {
      Object.entries(key).forEach(([k, v]) => {
        this.data(k, v);
      });
      return this;
    }

    // Get single data value
    if (value === undefined) {
      if (!element) return undefined;
      const stored = dataStore.get(element);
      if (stored?.has(key)) {
        return stored.get(key);
      }
      // Fall back to data-* attribute
      if (element instanceof HTMLElement) {
        return element.dataset[key];
      }
      return undefined;
    }

    // Set single data value
    this.elements.forEach((el) => {
      let stored = dataStore.get(el);
      if (!stored) {
        stored = new Map();
        dataStore.set(el, stored);
      }
      stored.set(key, value);
    });
    return this;
  }

  /**
   * Remove data from elements.
   *
   * @param key - Data key to remove
   * @returns This NaturalElement for chaining
   */
  removeData(key: string): NaturalElement {
    this.elements.forEach((element) => {
      const stored = dataStore.get(element);
      if (stored) {
        stored.delete(key);
      }
      if (element instanceof HTMLElement) {
        delete element.dataset[key];
      }
    });
    return this;
  }

  // ============================================================================
  // CSS and Class Manipulation
  // ============================================================================

  /**
   * Get or set CSS styles.
   *
   * @param name - CSS property name or object of styles
   * @param value - Optional value to set
   * @returns Style value if getting, NaturalElement if setting
   */
  css(name: string): string;
  css(name: string, value: string | number): NaturalElement;
  css(name: Record<string, string | number>): NaturalElement;
  css(
    name: string | Record<string, string | number>,
    value?: string | number
  ): string | NaturalElement {
    if (typeof name === 'string') {
      if (value === undefined) {
        const element = this.elements[0];
        if (element instanceof HTMLElement) {
          return getWindow()?.getComputedStyle(element).getPropertyValue(name) ?? '';
        }
        return '';
      }

      const cssValue = typeof value === 'number' ? `${value}px` : value;
      this.elements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.setProperty(name, cssValue);
        }
      });
    } else {
      Object.entries(name).forEach(([prop, val]) => {
        this.css(prop, val);
      });
    }
    return this;
  }

  /**
   * Add one or more classes to elements.
   *
   * @param className - Class name(s) to add (space-separated)
   * @returns This NaturalElement for chaining
   */
  addClass(className: string): NaturalElement {
    const classes = className.split(/\s+/).filter(Boolean);
    this.elements.forEach((element) => {
      element.classList.add(...classes);
    });
    return this;
  }

  /**
   * Remove one or more classes from elements.
   *
   * @param className - Class name(s) to remove (space-separated)
   * @returns This NaturalElement for chaining
   */
  removeClass(className: string): NaturalElement {
    const classes = className.split(/\s+/).filter(Boolean);
    this.elements.forEach((element) => {
      element.classList.remove(...classes);
    });
    return this;
  }

  /**
   * Toggle one or more classes on elements.
   *
   * @param className - Class name(s) to toggle (space-separated)
   * @param force - Optional force add (true) or remove (false)
   * @returns This NaturalElement for chaining
   */
  toggleClass(className: string, force?: boolean): NaturalElement {
    const classes = className.split(/\s+/).filter(Boolean);
    this.elements.forEach((element) => {
      classes.forEach((cls) => {
        element.classList.toggle(cls, force);
      });
    });
    return this;
  }

  /**
   * Check if any element has the specified class.
   *
   * @param className - Class name to check
   * @returns True if any element has the class
   */
  hasClass(className: string): boolean {
    return this.elements.some((element) => element.classList.contains(className));
  }

  // ============================================================================
  // Dimensions
  // ============================================================================

  /**
   * Get the width of the first element.
   *
   * @returns Width in pixels
   */
  width(): number {
    const element = this.elements[0];
    if (element instanceof HTMLElement) {
      return element.offsetWidth;
    }
    return 0;
  }

  /**
   * Get the height of the first element.
   *
   * @returns Height in pixels
   */
  height(): number {
    const element = this.elements[0];
    if (element instanceof HTMLElement) {
      return element.offsetHeight;
    }
    return 0;
  }

  /**
   * Get the inner width (excluding borders, including padding).
   *
   * @returns Inner width in pixels
   */
  innerWidth(): number {
    const element = this.elements[0];
    if (element instanceof HTMLElement) {
      return element.clientWidth;
    }
    return 0;
  }

  /**
   * Get the inner height (excluding borders, including padding).
   *
   * @returns Inner height in pixels
   */
  innerHeight(): number {
    const element = this.elements[0];
    if (element instanceof HTMLElement) {
      return element.clientHeight;
    }
    return 0;
  }

  /**
   * Get the outer width (including borders and optionally margins).
   *
   * @param includeMargin - Whether to include margins
   * @returns Outer width in pixels
   */
  outerWidth(includeMargin = false): number {
    const element = this.elements[0];
    if (element instanceof HTMLElement) {
      let width = element.offsetWidth;
      if (includeMargin) {
        const style = getWindow()?.getComputedStyle(element);
        if (style) {
          width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        }
      }
      return width;
    }
    return 0;
  }

  /**
   * Get the outer height (including borders and optionally margins).
   *
   * @param includeMargin - Whether to include margins
   * @returns Outer height in pixels
   */
  outerHeight(includeMargin = false): number {
    const element = this.elements[0];
    if (element instanceof HTMLElement) {
      let height = element.offsetHeight;
      if (includeMargin) {
        const style = getWindow()?.getComputedStyle(element);
        if (style) {
          height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
        }
      }
      return height;
    }
    return 0;
  }

  // ============================================================================
  // Position and Offset
  // ============================================================================

  /**
   * Get the current coordinates relative to the offset parent.
   *
   * @returns Object with top and left properties
   */
  position(): { top: number; left: number } {
    const element = this.elements[0];
    if (element instanceof HTMLElement) {
      return {
        top: element.offsetTop,
        left: element.offsetLeft,
      };
    }
    return { top: 0, left: 0 };
  }

  /**
   * Get or set the current coordinates relative to the document.
   *
   * @param coordinates - Optional coordinates to set
   * @returns Object with top and left properties if getting, NaturalElement if setting
   */
  offset(): { top: number; left: number };
  offset(coordinates: { top?: number; left?: number }): NaturalElement;
  offset(coordinates?: { top?: number; left?: number }): { top: number; left: number } | NaturalElement {
    if (coordinates === undefined) {
      const element = this.elements[0];
      if (element) {
        const rect = element.getBoundingClientRect();
        const win = getWindow();
        return {
          top: rect.top + (win?.scrollY ?? 0),
          left: rect.left + (win?.scrollX ?? 0),
        };
      }
      return { top: 0, left: 0 };
    }

    // Setter mode
    const win = getWindow();
    this.elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        const style = getComputedStyle(element);
        const position = style.position;

        // If element is static, make it relative
        if (position === 'static') {
          element.style.position = 'relative';
        }

        const currentOffset = element.getBoundingClientRect();
        const scrollY = win?.scrollY ?? 0;
        const scrollX = win?.scrollX ?? 0;

        if (coordinates.top !== undefined) {
          const currentTop = parseFloat(style.top) || 0;
          const diff = coordinates.top - (currentOffset.top + scrollY);
          element.style.top = `${currentTop + diff}px`;
        }

        if (coordinates.left !== undefined) {
          const currentLeft = parseFloat(style.left) || 0;
          const diff = coordinates.left - (currentOffset.left + scrollX);
          element.style.left = `${currentLeft + diff}px`;
        }
      }
    });
    return this;
  }

  /**
   * Get or set scroll position.
   *
   * @param value - Optional scroll position to set
   * @returns Scroll position if getting, NaturalElement if setting
   */
  scrollTop(): number;
  scrollTop(value: number): NaturalElement;
  scrollTop(value?: number): number | NaturalElement {
    if (value === undefined) {
      const element = this.elements[0];
      if (element instanceof HTMLElement) {
        return element.scrollTop;
      }
      return 0;
    }
    this.elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.scrollTop = value;
      }
    });
    return this;
  }

  /**
   * Get or set horizontal scroll position.
   *
   * @param value - Optional scroll position to set
   * @returns Scroll position if getting, NaturalElement if setting
   */
  scrollLeft(): number;
  scrollLeft(value: number): NaturalElement;
  scrollLeft(value?: number): number | NaturalElement {
    if (value === undefined) {
      const element = this.elements[0];
      if (element instanceof HTMLElement) {
        return element.scrollLeft;
      }
      return 0;
    }
    this.elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.scrollLeft = value;
      }
    });
    return this;
  }

  // ============================================================================
  // Event Handling
  // ============================================================================

  /**
   * Attach an event handler.
   *
   * @param eventType - Event type (can include namespace like 'click.myns')
   * @param selector - Optional delegate selector
   * @param handler - Event handler function
   * @returns This NaturalElement for chaining
   */
  on(
    eventType: string | NaturalEventName,
    selectorOrHandler: string | EventListener,
    handler?: EventListener
  ): NaturalElement {
    const [type, namespace] = eventType.split('.');
    let actualHandler: EventListener;
    let delegateSelector: string | undefined;

    if (typeof selectorOrHandler === 'string') {
      delegateSelector = selectorOrHandler;
      actualHandler = (event: Event) => {
        const target = event.target as Element;
        if (target?.closest(delegateSelector!)) {
          handler?.call(target.closest(delegateSelector!), event);
        }
      };
    } else {
      actualHandler = selectorOrHandler;
    }

    this.elements.forEach((element) => {
      element.addEventListener(type!, actualHandler);

      // Store for cleanup
      let listeners = eventStore.get(element);
      if (!listeners) {
        listeners = [];
        eventStore.set(element, listeners);
      }
      listeners.push({
        type: type!,
        handler: actualHandler,
        namespace,
      });
    });

    return this;
  }

  /**
   * Attach an event handler that fires only once.
   *
   * @param eventType - Event type
   * @param handler - Event handler function
   * @returns This NaturalElement for chaining
   */
  one(eventType: string | NaturalEventName, handler: EventListener): NaturalElement {
    const [type] = eventType.split('.');

    this.elements.forEach((element) => {
      const oneTimeHandler: EventListener = (event) => {
        element.removeEventListener(type!, oneTimeHandler);
        handler.call(element, event);
      };
      element.addEventListener(type!, oneTimeHandler);
    });

    return this;
  }

  /**
   * Remove event handlers.
   *
   * @param eventType - Optional event type (can include namespace)
   * @param handler - Optional specific handler to remove
   * @returns This NaturalElement for chaining
   */
  off(eventType?: string, handler?: EventListener): NaturalElement {
    this.elements.forEach((element) => {
      const listeners = eventStore.get(element);
      if (!listeners) return;

      if (!eventType) {
        // Remove all listeners
        listeners.forEach((entry) => {
          element.removeEventListener(entry.type, entry.handler, entry.options);
        });
        eventStore.delete(element);
      } else {
        const [type, namespace] = eventType.split('.');

        const remaining = listeners.filter((entry) => {
          const matchType = !type || entry.type === type;
          const matchNs = !namespace || entry.namespace === namespace;
          const matchHandler = !handler || entry.handler === handler;

          if (matchType && matchNs && matchHandler) {
            element.removeEventListener(entry.type, entry.handler, entry.options);
            return false;
          }
          return true;
        });

        if (remaining.length === 0) {
          eventStore.delete(element);
        } else {
          eventStore.set(element, remaining);
        }
      }
    });

    return this;
  }

  /**
   * Trigger an event on elements.
   *
   * @param eventType - Event type to trigger
   * @param detail - Optional event detail data
   * @returns This NaturalElement for chaining
   */
  trigger(eventType: string | NaturalEventName, detail?: unknown): NaturalElement {
    const [type] = eventType.split('.');

    this.elements.forEach((element) => {
      const event = new CustomEvent(type!, {
        bubbles: true,
        cancelable: true,
        detail,
      });
      element.dispatchEvent(event);
    });

    return this;
  }

  /**
   * Shorthand for click event.
   */
  click(handler?: EventListener): NaturalElement {
    if (handler) {
      return this.on('click', handler);
    }
    return this.trigger('click');
  }

  /**
   * Shorthand for focus.
   */
  focus(): NaturalElement {
    const element = this.elements[0];
    if (element instanceof HTMLElement) {
      element.focus();
    }
    return this;
  }

  /**
   * Shorthand for blur.
   */
  blur(): NaturalElement {
    const element = this.elements[0];
    if (element instanceof HTMLElement) {
      element.blur();
    }
    return this;
  }

  // ============================================================================
  // Visibility
  // ============================================================================

  /**
   * Show elements.
   *
   * @returns This NaturalElement for chaining
   */
  show(): NaturalElement {
    this.elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.style.display = '';
        if (getWindow()?.getComputedStyle(element).display === 'none') {
          element.style.display = 'block';
        }
      }
    });
    return this;
  }

  /**
   * Hide elements.
   *
   * @returns This NaturalElement for chaining
   */
  hide(): NaturalElement {
    this.elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.style.display = 'none';
      }
    });
    return this;
  }

  /**
   * Toggle visibility of elements.
   *
   * @returns This NaturalElement for chaining
   */
  toggle(): NaturalElement {
    this.elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        if (getWindow()?.getComputedStyle(element).display === 'none') {
          element.style.display = '';
        } else {
          element.style.display = 'none';
        }
      }
    });
    return this;
  }

  // ============================================================================
  // Merge and Add
  // ============================================================================

  /**
   * Add elements to the collection.
   *
   * @param selector - Selector, Element, or NaturalElement to add
   * @returns New NaturalElement with combined elements
   */
  add(selector: Selector | NaturalElement): NaturalElement {
    const additional = new NaturalElement(selector);
    const combined = [...this.elements, ...additional.elements];
    return new NaturalElement(combined);
  }

  /**
   * Reduce the set of matched elements to those that match the selector.
   *
   * @param begin - Start index
   * @param end - Optional end index
   * @returns New NaturalElement with sliced elements
   */
  slice(begin: number, end?: number): NaturalElement {
    return new NaturalElement(this.elements.slice(begin, end));
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new NaturalElement instance.
 * Factory function for easier usage.
 *
 * @param selector - CSS selector, Element, or NaturalElement
 * @returns New NaturalElement instance
 */
export function $(selector: Selector | NaturalElement | null | undefined): NaturalElement {
  return new NaturalElement(selector);
}

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Check if an object is a NaturalElement instance.
 */
$.isNaturalElement = (obj: unknown): obj is NaturalElement => {
  return obj instanceof NaturalElement;
};

/**
 * Extend objects (shallow merge).
 */
$.extend = <T extends object, U extends object>(target: T, ...sources: U[]): T & U => {
  return Object.assign(target, ...sources) as T & U;
};

/**
 * Deep extend objects.
 */
$.deepExtend = <T extends JSONObject>(target: T, ...sources: JSONObject[]): T => {
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (
        targetValue &&
        sourceValue &&
        typeof targetValue === 'object' &&
        typeof sourceValue === 'object' &&
        !Array.isArray(targetValue) &&
        !Array.isArray(sourceValue)
      ) {
        $.deepExtend(targetValue as JSONObject, sourceValue as JSONObject);
      } else {
        (target as JSONObject)[key] = sourceValue;
      }
    });
  });
  return target;
};

/**
 * Create elements from HTML string.
 */
$.parseHTML = (html: string): Element[] => {
  const doc = getDocument();
  if (!doc) return [];

  const template = doc.createElement('template');
  template.innerHTML = html.trim();
  return Array.from(template.content.children);
};

/**
 * Check if DOM is ready.
 */
$.ready = (callback: () => void): void => {
  const doc = getDocument();
  if (!doc) {
    callback();
    return;
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

export default $;

