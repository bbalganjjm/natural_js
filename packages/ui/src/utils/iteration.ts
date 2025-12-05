/**
 * Iteration utility for rendering rows with data binding.
 */

import { NaturalElement, isBrowser } from '@natural-js/shared';
import { IterationRenderOptions, IterationState } from './types';

const DEFAULT_OPTIONS: Partial<IterationRenderOptions> = {
  createDelay: 0,
  html: false,
  validate: false,
  revert: false,
  cache: false,
};

export function createIterator(options: IterationRenderOptions): {
  render: (startIndex?: number, limit?: number) => Promise<void>;
  clear: () => void;
  getState: () => IterationState;
  isBinding: () => boolean;
} {
  const opts = { ...DEFAULT_OPTIONS, ...options } as IterationRenderOptions;
  const state: IterationState = {
    isBinding: false,
    bindQueue: [],
  };

  const render = async (startIndex: number = 0, limit?: number): Promise<void> => {
    if (!isBrowser()) return;

    const endIndex = limit !== undefined ? Math.min(startIndex + limit, opts.data.length) : opts.data.length;
    if (startIndex >= opts.data.length) return;

    state.isBinding = true;

    for (let i = startIndex; i < endIndex; i++) {
      const rowData = opts.data[i];
      if (!rowData) continue;

      const rowElement = opts.template.clone(true);
      opts.context.append(rowElement);

      if (opts.onBeforeBind) {
        opts.onBeforeBind(i, rowElement, rowData);
      }

      bindDataToElement(rowElement, rowData, opts.html ?? false);

      if (opts.onBind) {
        opts.onBind(i, rowElement, rowData);
      }

      if (opts.createDelay && opts.createDelay > 0 && i < endIndex - 1) {
        await delay(opts.createDelay);
      }
    }

    state.isBinding = false;
  };

  const clear = (): void => {
    opts.context.empty();
    state.isBinding = false;
  };

  return {
    render,
    clear,
    getState: () => ({ ...state }),
    isBinding: () => state.isBinding,
  };
}

function bindDataToElement(
  element: NaturalElement,
  data: Record<string, unknown>,
  html: boolean
): void {
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      const valueStr = value === null || value === undefined ? '' : String(value);

      const targetById = element.find(`#${key}`);
      if (targetById.length > 0) {
        setElementValue(targetById, valueStr, html);
        continue;
      }

      const targetByBind = element.find(`[data-bind="${key}"]`);
      if (targetByBind.length > 0) {
        setElementValue(targetByBind, valueStr, html);
        continue;
      }

      const targetByName = element.find(`[name="${key}"]`);
      if (targetByName.length > 0) {
        setElementValue(targetByName, valueStr, html);
      }
    }
  }
}

function setElementValue(el: NaturalElement, value: string, html: boolean): void {
  const firstEl = el.get(0);
  if (!firstEl) return;

  const tagName = (firstEl.tagName ?? '').toLowerCase();

  if (tagName === 'input') {
    const inputEl = firstEl as HTMLInputElement;
    const type = inputEl.type.toLowerCase();

    if (type === 'checkbox' || type === 'radio') {
      inputEl.checked = value === inputEl.value || value === 'true' || value === 'Y';
    } else {
      inputEl.value = value;
    }
  } else if (tagName === 'select') {
    (firstEl as HTMLSelectElement).value = value;
  } else if (tagName === 'textarea') {
    (firstEl as HTMLTextAreaElement).value = value;
  } else {
    if (html) {
      el.html(value);
    } else {
      el.text(value);
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function queueOperation(
  state: IterationState,
  operation: () => void | Promise<void>
): void {
  state.bindQueue.push(operation);
  if (state.bindQueue.length === 1) {
    processQueue(state);
  }
}

async function processQueue(state: IterationState): Promise<void> {
  while (state.bindQueue.length > 0) {
    const operation = state.bindQueue[0];
    if (operation) {
      try {
        await operation();
      } catch (e) {
        console.error('[Iteration] Error:', e);
      }
    }
    state.bindQueue.shift();
  }
}

export const iteration = {
  create: createIterator,
  queue: queueOperation,
};
