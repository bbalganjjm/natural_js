/**
 * Legacy API wrapper for backwards compatibility with Natural-JS 1.x
 *
 * Provides the N() function interface that mirrors the original jQuery-based API.
 * This allows existing code to work with minimal modifications.
 */

import { NaturalElement, isBrowser, getWindow } from '@natural-js/shared';
import {
  string,
  date,
  array,
  json,
  browser,
  event,
  message,
  element,
  typeUtils,
  gc,
  getConfig,
  updateConfig,
  toSelector,
} from '@natural-js/core';
import {
  Communicator,
  Controller,
  cont,
  Context,
} from '@natural-js/architecture';
import {
  Formatter,
  Validator,
  DataSync,
  data,
  type FormatRules,
  type ValidationRules,
} from '@natural-js/data';
import {
  Alert,
  Button,
  Popup,
  Tab,
  Datepicker,
  Select,
  Form,
  List,
  Grid,
  Pagination,
  Tree,
} from '@natural-js/ui';
import { Notify, Docs } from '@natural-js/ui-shell';
import { TemplateAop } from '@natural-js/template';
import { Code } from '@natural-js/code';

import type { NVersionInfo } from './types.js';

/**
 * Version information for all Natural-JS modules
 */
const version: NVersionInfo = {
  'Natural-JS': '2.0.0-alpha.0',
  'Natural-CORE': '2.0.0-alpha.0',
  'Natural-ARCHITECTURE': '2.0.0-alpha.0',
  'Natural-DATA': '2.0.0-alpha.0',
  'Natural-UI': '2.0.0-alpha.0',
  'Natural-UI.Shell': '2.0.0-alpha.0',
  'Natural-TEMPLATE': '2.0.0-alpha.0',
  'Natural-CODE': '2.0.0-alpha.0',
};

/**
 * Create a NaturalElement from selector
 */
function createNaturalElement(
  selector?: string | Element | Element[] | NodeList | NaturalElement | null,
  context?: Element | NaturalElement
): NaturalElement {
  if (selector instanceof NaturalElement) {
    return selector;
  }

  if (context) {
    const contextEl = context instanceof NaturalElement ? context : new NaturalElement(context);
    if (typeof selector === 'string') {
      return contextEl.find(selector);
    }
  }

  return new NaturalElement(selector as Element | Element[] | NodeList | string | null);
}

/**
 * Context accessor for configuration
 */
const contextAccessor = {
  attr: <T = unknown>(key: string, value?: T): T => {
    const config = getConfig();
    if (value !== undefined) {
      updateConfig({ [key]: value } as Record<string, unknown>);
      return value;
    }
    return (config as Record<string, unknown>)[key] as T;
  },
};

/**
 * Locale getter/setter
 */
function locale(newLocale?: string): string {
  const config = getConfig();
  if (newLocale !== undefined) {
    updateConfig({ core: { locale: newLocale } });
    return newLocale;
  }
  return config.core?.locale ?? 'ko_KR';
}

/**
 * Error creator
 */
function createError(msg: string, cause?: Error): Error {
  const error = new Error(msg);
  if (cause) {
    (error as Error & { cause?: Error }).cause = cause;
  }
  return error;
}

/**
 * Warning logger
 */
function warn(...args: unknown[]): void {
  console.warn('[Natural-JS]', ...args);
}

/**
 * Info logger
 */
function log(...args: unknown[]): void {
  console.log('[Natural-JS]', ...args);
}

/**
 * N() factory function - main entry point for legacy API
 *
 * @example
 * ```javascript
 * // Select elements
 * N('#myElement').addClass('active');
 *
 * // Create component
 * N([]).form({ context: '#myForm' }).bind(data);
 *
 * // Use static methods
 * N.comm({ id: 1 }, '/api/users').submit(callback);
 * ```
 */
function N(
  selector?: string | Element | Element[] | NodeList | NaturalElement | null,
  context?: Element | NaturalElement
): NaturalElement {
  return createNaturalElement(selector, context);
}

// Assign version
N.version = version;

// Core utilities
N.string = string;
N.date = date;
N.array = array;
N.json = json;
N.browser = browser;
N.event = event;
N.message = message;
N.element = element;
N.type = typeUtils;
N.gc = gc;

// Architecture - N.comm()
N.comm = function (data?: unknown, url?: string) {
  return new Communicator(data, url);
};

// Architecture - N.cont()
N.cont = cont;

// Architecture - N.context
N.context = contextAccessor;

// Data - N.formatter()
N.formatter = function (inputData: Record<string, unknown>[]) {
  return {
    format: (rules: FormatRules) => {
      const formatter = new Formatter(inputData, rules);
      return formatter.format();
    },
  };
};

// Data - N.validator()
N.validator = function (inputData: Record<string, unknown>[]) {
  return {
    validate: (rules: ValidationRules) => {
      const validator = new Validator(inputData, rules);
      const results = validator.validate();
      // Check if all rows are valid
      const isValid = results.every((r) => r.isValid);
      return {
        isValid,
        errors: results.flatMap((r) => r.errors),
      };
    },
  };
};

// Data - N.ds() - legacy wrapper
// Note: The new DataSync API requires a SyncableComponent
// This provides a simplified interface for backwards compatibility
N.ds = function (pageIdOrComponent: string | Parameters<typeof DataSync.instance>[0]) {
  if (typeof pageIdOrComponent === 'string') {
    // Legacy: pageId string - create a minimal mock component
    const mockComponent = {
      options: {
        pageId: pageIdOrComponent,
        data: [],
      },
      context: () => new NaturalElement(null),
      update: () => {},
    } as unknown as Parameters<typeof DataSync.instance>[0];
    return DataSync.instance(mockComponent);
  }
  // New: pass component directly
  return DataSync.instance(pageIdOrComponent);
};

// Data utilities
N.data = data;

// UI Components - Static constructors

// N.alert()
N.alert = function (
  context: Element | NaturalElement | string,
  options?: Record<string, unknown>
) {
  const ctx =
    typeof context === 'string' ? new NaturalElement(context) : new NaturalElement(context);
  return new Alert(ctx, options);
};

// N.button()
N.button = function (
  context: Element | NaturalElement | string,
  options?: Record<string, unknown>
) {
  const ctx =
    typeof context === 'string' ? new NaturalElement(context) : new NaturalElement(context);
  return new Button(ctx, options);
};

// N.popup()
N.popup = function (
  context: Element | NaturalElement | string,
  options?: Record<string, unknown>
) {
  const ctx =
    typeof context === 'string' ? new NaturalElement(context) : new NaturalElement(context);
  return new Popup(ctx, options);
};

// N.tab()
N.tab = function (
  context: Element | NaturalElement | string,
  options?: Record<string, unknown>
) {
  const ctx =
    typeof context === 'string' ? new NaturalElement(context) : new NaturalElement(context);
  return new Tab(ctx, options);
};

// N.datepicker()
N.datepicker = function (
  context: Element | NaturalElement | string,
  options?: Record<string, unknown>
) {
  const ctx =
    typeof context === 'string' ? new NaturalElement(context) : new NaturalElement(context);
  return new Datepicker(ctx, options);
};

// N.select() - data-first pattern
N.select = function (inputData: Record<string, unknown>[]) {
  return {
    select: (options?: Record<string, unknown>) => {
      const opts = { ...options };
      const contextValue = opts.context;
      delete opts.context;

      const ctx = contextValue
        ? typeof contextValue === 'string'
          ? new NaturalElement(contextValue)
          : new NaturalElement(contextValue as Element)
        : new NaturalElement(null);

      const select = new Select(ctx, opts);
      if (inputData.length > 0) {
        select.bind(inputData);
      }
      return select;
    },
  };
};

// N.form() - data-first pattern
N.form = function (inputData: Record<string, unknown>[]) {
  return {
    form: (options?: Record<string, unknown>) => {
      const opts = { ...options };
      const contextValue = opts.context;
      delete opts.context;

      const ctx = contextValue
        ? typeof contextValue === 'string'
          ? new NaturalElement(contextValue)
          : new NaturalElement(contextValue as Element)
        : new NaturalElement(null);

      const form = new Form(ctx, opts);
      if (inputData.length > 0) {
        // First argument is row index, second is the data
        form.bind(0, inputData[0]);
      }
      return form;
    },
  };
};

// N.list() - data-first pattern
N.list = function (inputData: Record<string, unknown>[]) {
  return {
    list: (options?: Record<string, unknown>) => {
      const opts = { ...options };
      const contextValue = opts.context;
      delete opts.context;

      const ctx = contextValue
        ? typeof contextValue === 'string'
          ? new NaturalElement(contextValue)
          : new NaturalElement(contextValue as Element)
        : new NaturalElement(null);

      const list = new List(ctx, opts);
      if (inputData.length > 0) {
        list.bind(inputData);
      }
      return list;
    },
  };
};

// N.grid() - data-first pattern
N.grid = function (inputData: Record<string, unknown>[]) {
  return {
    grid: (options?: Record<string, unknown>) => {
      const opts = { ...options };
      const contextValue = opts.context;
      delete opts.context;

      const ctx = contextValue
        ? typeof contextValue === 'string'
          ? new NaturalElement(contextValue)
          : new NaturalElement(contextValue as Element)
        : new NaturalElement(null);

      const grid = new Grid(ctx, opts);
      if (inputData.length > 0) {
        grid.bind(inputData);
      }
      return grid;
    },
  };
};

// N.pagination()
N.pagination = function (
  context: Element | NaturalElement | string,
  options?: Record<string, unknown>
) {
  const ctx =
    typeof context === 'string' ? new NaturalElement(context) : new NaturalElement(context);
  return new Pagination(ctx, options);
};

// N.tree() - data-first pattern
N.tree = function (inputData: Record<string, unknown>[]) {
  return {
    tree: (options?: Record<string, unknown>) => {
      const opts = { ...options };
      const contextValue = opts.context;
      delete opts.context;

      const ctx = contextValue
        ? typeof contextValue === 'string'
          ? new NaturalElement(contextValue)
          : new NaturalElement(contextValue as Element)
        : new NaturalElement(null);

      const tree = new Tree(ctx, opts);
      if (inputData.length > 0) {
        tree.bind(inputData);
      }
      return tree;
    },
  };
};

// UI.Shell - N.notify()
const notifyFn = function (position?: string, options?: Record<string, unknown>) {
  return new Notify(position, options);
};
notifyFn.add = Notify.add;
N.notify = notifyFn;

// UI.Shell - N.docs()
N.docs = function (
  context: Element | NaturalElement | string,
  options?: Record<string, unknown>
) {
  const ctx =
    typeof context === 'string' ? new NaturalElement(context) : new NaturalElement(context);
  return new Docs(ctx, options);
};

// Template
N.template = TemplateAop;

// Code
N.code = Code;

// Configuration
N.config = getConfig;
N.locale = locale;

// Utilities
N.error = createError;
N.warn = warn;
N.log = log;

// Additional legacy utilities
N.toSelector = toSelector;

// Export as typed function
export { N };

// Register on window for browser environments
if (isBrowser()) {
  const win = getWindow();
  if (win) {
    (win as unknown as { N: typeof N }).N = N;
  }
}

export default N;
