/**
 * Legacy API types for backwards compatibility with Natural-JS 1.x
 */

import type { NaturalElement } from '@natural-js/shared';

/**
 * N() function signature - creates a NaturalElement wrapper
 */
export interface NFunction {
  (selector?: string | Element | Element[] | NodeList | NaturalElement | null): NaturalElement;
  (selector: string, context: Element | NaturalElement): NaturalElement;

  // Static properties
  version: NVersionInfo;

  // Core utilities
  string: typeof import('@natural-js/core').string;
  date: typeof import('@natural-js/core').date;
  array: typeof import('@natural-js/core').array;
  json: typeof import('@natural-js/core').json;
  browser: typeof import('@natural-js/core').browser;
  event: typeof import('@natural-js/core').event;
  message: typeof import('@natural-js/core').message;
  element: typeof import('@natural-js/core').element;
  type: typeof import('@natural-js/core').type;
  gc: typeof import('@natural-js/core').gc;

  // Architecture
  comm: NCommFunction;
  cont: typeof import('@natural-js/architecture').cont;
  context: NContextAccess;

  // Data
  formatter: NFormatterFunction;
  validator: NValidatorFunction;
  ds: NDataSyncFunction;

  // UI Components (static constructors)
  alert: NAlertFunction;
  button: NButtonFunction;
  popup: NPopupFunction;
  tab: NTabFunction;
  datepicker: NDatepickerFunction;
  select: NSelectFunction;
  form: NFormFunction;
  list: NListFunction;
  grid: NGridFunction;
  pagination: NPaginationFunction;
  tree: NTreeFunction;

  // UI.Shell
  notify: NNotifyFunction;
  docs: NDocsFunction;

  // Template
  template: typeof import('@natural-js/template').TemplateAop;

  // Code
  code: typeof import('@natural-js/code').Code;

  // Configuration
  config: typeof import('@natural-js/core').getConfig;
  locale: (locale?: string) => string;

  // Utility methods
  error: (message: string, cause?: Error) => Error;
  warn: (...args: unknown[]) => void;
  log: (...args: unknown[]) => void;
}

/**
 * Version information
 */
export interface NVersionInfo {
  'Natural-JS': string;
  'Natural-CORE': string;
  'Natural-ARCHITECTURE': string;
  'Natural-DATA': string;
  'Natural-UI': string;
  'Natural-UI.Shell': string;
  'Natural-TEMPLATE': string;
  'Natural-CODE': string;
}

/**
 * N.comm() function type
 */
export interface NCommFunction {
  (data?: unknown, url?: string): import('@natural-js/architecture').Communicator;
}

/**
 * N.context accessor type
 */
export interface NContextAccess {
  attr: <T = unknown>(key: string, value?: T) => T;
}

/**
 * N.formatter() function type
 */
export interface NFormatterFunction {
  (data: unknown[]): { format: (rules: unknown) => unknown[] };
}

/**
 * N.validator() function type
 */
export interface NValidatorFunction {
  (data: unknown[]): { validate: (rules: unknown) => import('@natural-js/shared').ValidationResult };
}

/**
 * N.ds() function type
 */
export interface NDataSyncFunction {
  (pageId: string): import('@natural-js/data').DataSync;
}

/**
 * N.alert() function type
 */
export interface NAlertFunction {
  (context: Element | NaturalElement | string, options?: unknown): import('@natural-js/ui').Alert;
}

/**
 * N.button() function type
 */
export interface NButtonFunction {
  (context: Element | NaturalElement | string, options?: unknown): import('@natural-js/ui').Button;
}

/**
 * N.popup() function type
 */
export interface NPopupFunction {
  (context: Element | NaturalElement | string, options?: unknown): import('@natural-js/ui').Popup;
}

/**
 * N.tab() function type
 */
export interface NTabFunction {
  (context: Element | NaturalElement | string, options?: unknown): import('@natural-js/ui').Tab;
}

/**
 * N.datepicker() function type
 */
export interface NDatepickerFunction {
  (context: Element | NaturalElement | string, options?: unknown): import('@natural-js/ui').Datepicker;
}

/**
 * N.select() function type
 */
export interface NSelectFunction {
  (data: unknown[]): { select: (options?: unknown) => import('@natural-js/ui').Select };
}

/**
 * N.form() function type
 */
export interface NFormFunction {
  (data: unknown[]): { form: (options?: unknown) => import('@natural-js/ui').Form };
}

/**
 * N.list() function type
 */
export interface NListFunction {
  (data: unknown[]): { list: (options?: unknown) => import('@natural-js/ui').List };
}

/**
 * N.grid() function type
 */
export interface NGridFunction {
  (data: unknown[]): { grid: (options?: unknown) => import('@natural-js/ui').Grid };
}

/**
 * N.pagination() function type
 */
export interface NPaginationFunction {
  (context: Element | NaturalElement | string, options?: unknown): import('@natural-js/ui').Pagination;
}

/**
 * N.tree() function type
 */
export interface NTreeFunction {
  (data: unknown[]): { tree: (options?: unknown) => import('@natural-js/ui').Tree };
}

/**
 * N.notify() function type
 */
export interface NNotifyFunction {
  (position?: string, options?: unknown): import('@natural-js/ui-shell').Notify;
  add: (message: string, type?: string) => void;
}

/**
 * N.docs() function type
 */
export interface NDocsFunction {
  (context: Element | NaturalElement | string, options?: unknown): import('@natural-js/ui-shell').Docs;
}

