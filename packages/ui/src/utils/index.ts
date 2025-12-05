/**
 * UI utilities module.
 */

export * from './types';
export * from './draggable';
export { draggable } from './draggable';
export * from './scroll';
export { scroll } from './scroll';
export * from './iteration';
export { iteration } from './iteration';

import { NaturalElement, isBrowser, getDocument, getWindow } from '@natural-js/shared';
import { isNaturalElement, isString } from '@natural-js/core';

function toNaturalElement(el: Element | NaturalElement): NaturalElement {
  return isNaturalElement(el) ? el : new NaturalElement(el);
}

export function getMaxZIndex(selector?: string | NaturalElement): number {
  if (!isBrowser()) return 0;

  const doc = getDocument();
  if (!doc) return 0;

  let elements: Element[];

  if (selector === undefined) {
    elements = Array.from(doc.querySelectorAll('div, span, ul, p, nav, article, section'));
  } else if (isString(selector)) {
    elements = Array.from(doc.querySelectorAll(selector));
  } else if (isNaturalElement(selector)) {
    const els = selector.get();
    elements = (Array.isArray(els) ? els : [els]).filter((e): e is Element => e !== undefined);
  } else {
    elements = [];
  }

  let maxZ = 0;
  const MAX_SAFE_Z = 2147483647;

  for (const el of elements) {
    const style = getComputedStyle(el);
    const zIndex = parseInt(style.zIndex, 10);
    if (!isNaN(zIndex)) {
      if (zIndex >= MAX_SAFE_Z) {
        (el as HTMLElement).style.zIndex = String(MAX_SAFE_Z - 999);
      }
      maxZ = Math.max(maxZ, zIndex);
    }
  }

  return maxZ;
}

export function wrapEventHandler(
  options: Record<string, unknown>,
  componentName: string,
  handlerName: string,
  globalConfig?: Record<string, unknown>
): void {
  const originalHandler = options[handlerName] as (((...args: unknown[]) => unknown) | null | undefined);

  let globalHandler: ((...args: unknown[]) => unknown) | null = null;
  if (globalConfig && globalConfig[componentName]) {
    const componentConfig = globalConfig[componentName] as Record<string, unknown>;
    if (typeof componentConfig[handlerName] === 'function') {
      globalHandler = componentConfig[handlerName] as (...args: unknown[]) => unknown;
    }
  }

  if (globalHandler && originalHandler) {
    options[handlerName] = function (this: unknown, ...args: unknown[]) {
      const globalResult = globalHandler?.apply(this, args);
      if (globalResult === false) return false;
      return originalHandler.apply(this, args);
    };
  } else if (globalHandler && !originalHandler) {
    options[handlerName] = globalHandler;
  }
}

export function centerElement(el: Element | NaturalElement, fixed: boolean = false): void {
  if (!isBrowser()) return;

  const win = getWindow();
  if (!win) return;

  const element = toNaturalElement(el);
  const width = element.outerWidth() ?? 0;
  const height = element.outerHeight() ?? 0;
  const viewportWidth = win.innerWidth;
  const viewportHeight = win.innerHeight;
  const scrollTop = fixed ? 0 : (win.scrollY || 0);
  const scrollLeft = fixed ? 0 : (win.scrollX || 0);

  const top = Math.max(0, scrollTop + (viewportHeight - height) / 2);
  const left = Math.max(0, scrollLeft + (viewportWidth - width) / 2);

  element.css('position', fixed ? 'fixed' : 'absolute');
  element.css('top', `${top}px`);
  element.css('left', `${left}px`);
}

export function createOverlay(options?: {
  className?: string;
  color?: string;
  zIndex?: number;
  fixed?: boolean;
  onClick?: (e: MouseEvent) => void;
}): NaturalElement {
  if (!isBrowser()) return new NaturalElement([]);

  const doc = getDocument();
  if (!doc) return new NaturalElement([]);

  const overlay = doc.createElement('div');
  overlay.className = `block_overlay__ ${options?.className ?? ''}`;
  overlay.style.display = 'none';
  overlay.style.position = options?.fixed ? 'fixed' : 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.cursor = 'not-allowed';
  overlay.style.padding = '0';

  if (options?.color) overlay.style.backgroundColor = options.color;
  if (options?.zIndex !== undefined) overlay.style.zIndex = String(options.zIndex);
  if (options?.onClick) overlay.addEventListener('click', options.onClick);

  return new NaturalElement(overlay);
}

export function showWithTransition(el: Element | NaturalElement, displayValue: string = 'block'): void {
  const element = toNaturalElement(el);
  element.css('display', displayValue);
  element.removeClass('hidden__').addClass('visible__');
}

export function hideWithTransition(el: Element | NaturalElement, remove: boolean = false): Promise<void> {
  return new Promise((resolve) => {
    const element = toNaturalElement(el);
    element.removeClass('visible__').addClass('hidden__');

    const firstEl = element.get(0);
    if (!firstEl) {
      if (remove) element.remove();
      resolve();
      return;
    }

    const style = getComputedStyle(firstEl);
    const duration = parseFloat(style.transitionDuration || '0') * 1000;

    setTimeout(() => {
      if (remove) {
        element.remove();
      } else {
        element.css('display', 'none');
      }
      resolve();
    }, duration || 0);
  });
}

export const utils = {
  getMaxZIndex,
  wrapEventHandler,
  centerElement,
  createOverlay,
  showWithTransition,
  hideWithTransition,
};
