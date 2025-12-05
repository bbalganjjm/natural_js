/**
 * @natural-js/template - Events AOP
 *
 * Automatically binds event handlers based on controller properties.
 */

import { NaturalElement, isBrowser } from '@natural-js/shared';
import type { ControllerInstance, EventOptions } from '../types.js';

/**
 * Check if element is a button-like element
 */
function isButtonElement(el: Element): boolean {
  const tagName = el.tagName?.toLowerCase();
  if (tagName === 'a' || tagName === 'button') return true;
  if (tagName === 'input') {
    const type = el.getAttribute('type')?.toLowerCase();
    return type === 'button' || type === 'submit';
  }
  return false;
}

/**
 * Check if element is a checkbox or radio
 */
function isCheckOrRadio(el: Element): boolean {
  if (el.tagName?.toLowerCase() !== 'input') return false;
  const type = el.getAttribute('type')?.toLowerCase();
  return type === 'checkbox' || type === 'radio';
}

/**
 * Get list/grid component instance from element
 */
function getListGridInstance(
  el: NaturalElement
): { type: 'list' | 'grid'; element: NaturalElement; instance: unknown } | null {
  const listEl = el.closest('.list__');
  if (listEl.length > 0) {
    return {
      type: 'list',
      element: listEl,
      instance: listEl.data('instance'),
    };
  }

  const gridEl = el.closest('.grid__');
  if (gridEl.length > 0) {
    return {
      type: 'grid',
      element: gridEl,
      instance: gridEl.data('instance'),
    };
  }

  return null;
}

/**
 * Process event binding
 */
export function processEvents(cont: ControllerInstance, prop: string): void {
  if (!isBrowser()) return;

  const props = prop.split('.');

  if (props.length <= 2) {
    console.error(`Invalid event property format: ${prop}`);
    return;
  }

  const eventName = props[2];
  let targetProp: string;
  let handler: ((event: Event, ...args: unknown[]) => void) | undefined;
  let idSelector = '';

  if (!eventName) {
    console.error(`Invalid event property format: ${prop}`);
    return;
  }

  const propValue = cont[prop];

  // Parse property value
  if (typeof propValue === 'function') {
    targetProp = props[1] ?? '';
    handler = propValue as (event: Event, ...args: unknown[]) => void;
    idSelector = '#';
  } else if (propValue && typeof propValue === 'object') {
    const eventOpts = propValue as EventOptions;
    targetProp = eventOpts.target ?? props[1] ?? '';
    handler = eventOpts.handler;
  } else {
    console.error(`Invalid event handler for: ${prop}`);
    return;
  }

  if (!handler || !targetProp) {
    console.error(`No handler or target found for: ${prop}`);
    return;
  }

  // Find target element
  let targetEl = cont.view.find(`${idSelector}${targetProp}`);

  if (targetEl.length === 0) return;

  // Check if inside list/grid component
  const listGridInfo = getListGridInstance(targetEl);
  const isInHeader = targetEl.closest('header').length > 0;

  if (listGridInfo && !isInHeader) {
    // Get template row element from component
    const compInstance = listGridInfo.instance as {
      tempRowEle?: NaturalElement;
    } | null;

    if (compInstance?.tempRowEle) {
      const tempRow = compInstance.tempRowEle;
      targetEl = tempRow.find(`${idSelector}${targetProp}`);

      // If checkbox/radio, use name selector
      const firstEl = targetEl.get(0);
      if (firstEl && isCheckOrRadio(firstEl)) {
        const byName = tempRow.find(`[name='${targetProp}']`);
        if (byName.length > 1) {
          targetEl = byName;
        }
      }
    }
  } else {
    // If checkbox/radio, use name selector
    const firstEl = targetEl.get(0);
    if (firstEl && isCheckOrRadio(firstEl)) {
      const byName = cont.view.find(`[name='${targetProp}']`);
      if (byName.length > 1) {
        targetEl = byName;
      }
    }
  }

  // Apply button component for button-like elements
  const firstEl = targetEl.get(0);
  if (firstEl && isButtonElement(firstEl)) {
    // Button styling is handled by CSS class
    targetEl.addClass('button__');
  } else {
    // Add pointer cursor for click events
    if (eventName.includes('click')) {
      targetEl.css('cursor', 'pointer');
    }
  }

  // Get page ID for event namespace
  const pageId = cont.view.data('pageid') as string;
  const eventNamespace = `${eventName}.${pageId}`;

  // Bind event
  if (listGridInfo && !isInHeader) {
    // Delegate event for list/grid rows
    const compEl = listGridInfo.element;
    let delegateSelector: string;

    const firstTarget = targetEl.get(0);
    if (
      firstTarget &&
      (firstTarget.matches('input[type="radio"]') ||
        (firstTarget.matches('input[type="checkbox"]') && targetEl.length > 1))
    ) {
      delegateSelector = `>.form__ [name='${targetProp}']:not([type='hidden'])`;
    } else {
      delegateSelector = `>.form__ ${idSelector}${targetProp}`;
    }

    compEl.on(eventNamespace, delegateSelector, function (this: HTMLElement, e: Event) {
      const rowEl = new NaturalElement(this).closest('.form__');
      const allRows = compEl.find('>.form__');
      const rowIndex = allRows.toArray().indexOf(rowEl.get(0) as Element);
      handler!.call(this, e, rowIndex);
    });

    cont[prop] = compEl;
  } else {
    // Direct event binding
    targetEl.on(eventNamespace, function (this: HTMLElement, e: Event) {
      handler!.call(this, e);
    });

    cont[prop] = targetEl;
  }
}

export default { processEvents };

