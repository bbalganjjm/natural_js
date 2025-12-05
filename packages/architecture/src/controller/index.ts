/**
 * Controller class implementation for Natural-JS framework.
 * Provides N.cont() functionality for MVC pattern.
 */

import { isBrowser, getDocument, NaturalElement } from '@natural-js/core';
import type { Request } from '../request';
import type { ControllerDefinition, ControllerInstance } from './types';
import { wrapWithAOP } from './aop';

// Re-export types and AOP utilities
export * from './types';
export * from './aop';

/**
 * Generate page ID from selector string.
 */
function generatePageId(selector: string): string {
  return selector.replace(/\.|\#|\[|\]|\'|\:|\(|\)|\>| |\-/g, '');
}

/**
 * Controller class - manages view binding and lifecycle.
 * Equivalent to N.cont() in the original framework.
 *
 * @example
 * ```typescript
 * // Create controller
 * const ctrl = new Controller(
 *   document.querySelector('#myView'),
 *   {
 *     init(view, request) {
 *       console.log('Initialized!');
 *     },
 *     sayHello() {
 *       console.log('Hello!');
 *     }
 *   }
 * );
 *
 * // Access view
 * ctrl.view; // The bound element
 *
 * // Call controller methods
 * ctrl.sayHello();
 * ```
 */
export class Controller implements ControllerInstance {
  /** The view element bound to this controller */
  view: NaturalElement;

  /** Request object from Communicator */
  request?: Request;

  /** Controller definition with user-defined methods */
  [key: string]: unknown;

  constructor(element: Element | NaturalElement | string, definition: ControllerDefinition) {
    // Resolve element
    let el: Element | null = null;

    if (typeof element === 'string') {
      if (isBrowser()) {
        const doc = getDocument();
        el = doc?.querySelector(element) ?? null;
      }
    } else if (element instanceof NaturalElement) {
      const elements = element.get();
      if (Array.isArray(elements)) {
        el = elements[0] ?? null;
      } else {
        el = elements ?? null;
      }
    } else {
      el = element;
    }

    if (!el && isBrowser()) {
      throw new Error('[Controller] Element not found');
    }

    // Create NaturalElement wrapper
    this.view = el ? new NaturalElement(el) : new NaturalElement([]);

    // Handle duplicate IDs - select element without data-pageid
    if (isBrowser() && el) {
      const id = el.getAttribute('id');
      if (id) {
        const doc = getDocument();
        const duplicates = doc?.querySelectorAll(`[id='${id}']`);
        if (duplicates && duplicates.length > 1) {
          // Find element without data-pageid
          for (const dup of duplicates) {
            if (!dup.hasAttribute('data-pageid')) {
              el = dup;
              this.view = new NaturalElement(el);
              break;
            }
          }
        }
      }
    }

    // Set data-pageid attribute
    if (el) {
      const id = el.getAttribute('id');
      let pageId: string;
      if (id) {
        pageId = id;
      } else if (typeof element === 'string') {
        pageId = generatePageId(element);
      } else {
        pageId = generatePageId('anonymous_' + Date.now());
      }
      el.setAttribute('data-pageid', pageId);
      el.classList.add('view_context__');
    }

    // Copy definition properties to controller
    for (const [key, value] of Object.entries(definition)) {
      this[key] = value;
    }

    // Store controller instance on element
    if (el) {
      (el as Element & { __controller?: Controller }).__controller = this;
    }
  }

  /**
   * Trigger controller initialization.
   * Called by Communicator after page load.
   */
  triggerInit(request?: Request): void {
    this.request = request;

    // Apply AOP wrapping
    wrapWithAOP(this);

    // Call init method if defined
    if (typeof this.init === 'function') {
      this.init(this.view, request);
    }
  }

  /**
   * Find elements within the controller's view scope.
   * Equivalent to view.find() in the original framework.
   */
  find(selector: string): NaturalElement {
    return this.view.find(selector);
  }

  /**
   * Get element by index from view.
   */
  get(index?: number): Element | Element[] | undefined {
    const elements = this.view.get();
    if (index !== undefined) {
      if (Array.isArray(elements)) {
        return elements[index];
      }
      return index === 0 ? elements : undefined;
    }
    if (Array.isArray(elements)) {
      return elements;
    }
    return elements ? [elements] : [];
  }

  /**
   * Get the controller's page ID.
   */
  getPageId(): string | null {
    const elements = this.view.get();
    const el = Array.isArray(elements) ? elements[0] : elements;
    return el?.getAttribute('data-pageid') ?? null;
  }

  /**
   * Get or set attribute on the view element.
   */
  attr(name: string): string | null;
  attr(name: string, value: string): this;
  attr(name: string, value?: string): string | null | this {
    if (value === undefined) {
      return this.view.attr(name);
    }
    this.view.attr(name, value);
    return this;
  }
}

/**
 * Create a new controller instance.
 * Equivalent to N.cont() function.
 *
 * @param element - Target element (selector, Element, or NaturalElement)
 * @param definition - Controller definition with methods
 * @returns Controller instance
 */
export function cont(
  element: Element | NaturalElement | string,
  definition: ControllerDefinition
): Controller {
  return new Controller(element, definition);
}

/**
 * Trigger init on a controller.
 * Called by Communicator after HTML page load.
 */
export function triggerInit(controller: Controller | ControllerInstance, request?: Request): void {
  if (controller instanceof Controller) {
    controller.triggerInit(request);
  } else {
    // Handle plain controller instance
    (controller as ControllerInstance).request = request;
    wrapWithAOP(controller as ControllerInstance);
    if (typeof controller.init === 'function') {
      controller.init(controller.view, request);
    }
  }
}

/**
 * Get controller instance from element.
 */
export function getController(element: Element): Controller | undefined {
  return (element as Element & { __controller?: Controller }).__controller;
}

export default Controller;

