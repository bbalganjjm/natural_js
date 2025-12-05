/**
 * @natural-js/template - Codes AOP
 *
 * Automatically binds common codes to select components.
 */

import { NaturalElement } from '@natural-js/shared';
import { getConfig } from '@natural-js/core';
import type {
  JoinPoint,
  ControllerInstance,
  SelectOptions,
  CodesAopOptions,
} from '../types.js';
import { processTemplate } from './template.js';

/**
 * Parse select property value to SelectOptions
 */
function parseSelectProperty(value: unknown): SelectOptions {
  if (Array.isArray(value) && value.length > 0) {
    if (value.length > 2) {
      return {
        comm: value[0] as string,
        key: value[1] as string,
        val: value[2] as string,
        filter: value[3] as ((data: unknown[]) => unknown[]) | undefined,
      };
    } else {
      return {
        code: value[0] as string,
        filter: value[1] as ((data: unknown[]) => unknown[]) | undefined,
      };
    }
  }
  return value as SelectOptions;
}

/**
 * Get select elements from view
 */
function getSelectElements(view: NaturalElement, id: string): NaturalElement {
  const elements = view.find(`[id='${id}']`);
  // Filter to only select, checkbox, and radio elements
  const filtered = elements.filter((_index, el) => {
    const tagName = el.tagName?.toLowerCase();
    if (tagName === 'select') return true;
    if (tagName === 'input') {
      const type = el.getAttribute('type')?.toLowerCase();
      return type === 'checkbox' || type === 'radio';
    }
    return false;
  });
  return new NaturalElement(filtered.toArray());
}

/**
 * Bind select component with data
 */
function bindSelectComponent(
  cont: ControllerInstance,
  propName: string,
  elements: NaturalElement,
  opts: SelectOptions,
  data?: unknown[]
): void {
  const result: unknown[] = [];

  elements.each((_i, el) => {
    const componentOpts: SelectOptions = { ...opts, context: el as HTMLElement };

    // Apply filter if exists
    let bindData = data ?? opts.data;
    if (opts.filter && bindData) {
      bindData = opts.filter(bindData);
    }

    // Create Select component
    // Note: This creates a placeholder - actual Select class from @natural-js/ui
    const selectInstance = {
      context: new NaturalElement(el),
      data: bindData,
      bind: function () {
        // Render options
        if (this.context.get(0)?.tagName?.toLowerCase() === 'select') {
          const selectEl = this.context.get(0) as HTMLSelectElement;
          (this.data as Record<string, unknown>[] | undefined)?.forEach(
            (item) => {
              const option = document.createElement('option');
              option.value = String(
                item[componentOpts.key ?? 'value'] ?? ''
              );
              option.textContent = String(
                item[componentOpts.val ?? 'text'] ?? ''
              );
              selectEl.appendChild(option);
            }
          );
        }
        return this;
      },
      val: function (value?: string | number) {
        if (value !== undefined) {
          const el = this.context.get(0) as HTMLSelectElement;
          if (el) el.value = String(value);
        }
        return this;
      },
    };

    const boundSelect = selectInstance.bind();
    if (opts.selected !== undefined) {
      boundSelect.val(opts.selected);
    }
    result.push(boundSelect);
  });

  cont[propName] = result;
}

/**
 * Process codes AOP - automatically binds common codes to select components
 */
export async function processCodes(
  cont: ControllerInstance,
  joinPoint: JoinPoint
): Promise<void> {
  const config = getConfig();
  const codesConfig = config.template?.aop?.codes;
  const options: CodesAopOptions = {
    codeUrl: codesConfig?.codeUrl ?? undefined,
    codeKey: codesConfig?.codeKey ?? undefined,
  };

  // Collect select properties
  const codeList: string[] = [];
  const commList: string[] = [];
  const selectList: string[] = [];

  for (const prop in cont) {
    if (typeof prop === 'string' && prop.startsWith('p.select.')) {
      const selectId = prop.split('.')[2];
      const value = cont[prop];

      // Parse array format to object
      const opts = parseSelectProperty(value);
      cont[prop] = opts;

      if ((opts as SelectOptions).code) {
        codeList.push(`${selectId}|${(opts as SelectOptions).code}`);
      } else if ((opts as SelectOptions).comm) {
        commList.push(`${selectId}|${(opts as SelectOptions).comm}`);
      } else {
        selectList.push(`${selectId}|select__`);
      }
    }
  }

  // Process direct data selects (no async needed)
  for (const selectStr of selectList) {
    const selectId = selectStr.split('|')[0];
    if (!selectId) continue;

    const propName = `p.select.${selectId}`;
    const opts = cont[propName] as SelectOptions;

    if (opts?.data) {
      const elements = getSelectElements(cont.view, selectId);
      bindSelectComponent(cont, propName, elements, opts);
    }
  }

  // Process common codes and communicator codes
  const promises: Promise<void>[] = [];

  // Common code list - fetch from codeUrl
  if (codeList.length > 0 && options.codeUrl) {
    const codeParams = codeList.map((codeInfo) => codeInfo.split('|')[1]).filter(Boolean);

    const promise = fetch(options.codeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: codeParams }),
    })
      .then((response) => response.json())
      .then((data: unknown[]) => {
        for (const codeInfo of codeList) {
          const parts = codeInfo.split('|');
          const selectId = parts[0];
          const codeKey = parts[1];
          if (!selectId) continue;

          const propName = `p.select.${selectId}`;
          const opts = cont[propName] as SelectOptions;
          const elements = getSelectElements(cont.view, selectId);

          // Filter data by code key
          const filterKey = options.codeKey ?? 'code';
          const selData = (data as Record<string, unknown>[]).filter(
            (d) => d[filterKey] === codeKey
          );

          bindSelectComponent(cont, propName, elements, opts, selData);
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch common codes:', error);
      });

    promises.push(promise);
  }

  // Data code list - call communicator methods
  for (const commStr of commList) {
    const parts = commStr.split('|');
    const selectId = parts[0];
    const commMethod = parts[1];
    if (!selectId || !commMethod) continue;

    const propName = `p.select.${selectId}`;
    const opts = cont[propName] as SelectOptions;

    const commFn = cont[commMethod];
    if (typeof commFn !== 'function') {
      console.error(`Communicator method not found: ${commMethod}`);
      continue;
    }

    const promise = new Promise<void>((resolve) => {
      // Call the communicator method which should return a Promise-like
      const commResult = (commFn as () => { submit: (cb: (data: unknown[]) => void) => void })();
      if (commResult && typeof commResult.submit === 'function') {
        commResult.submit((data: unknown[]) => {
          const elements = getSelectElements(cont.view, selectId);
          bindSelectComponent(cont, propName, elements, opts, data);
          resolve();
        });
      } else {
        resolve();
      }
    });

    promises.push(promise);
  }

  // Wait for all async operations
  if (promises.length > 0) {
    await Promise.all(promises);
  }

  // Continue to template processing
  processTemplate(cont, joinPoint);
}

export default { processCodes };

