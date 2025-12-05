/**
 * @natural-js/core
 *
 * Natural-JS Core utilities package.
 * Provides string, date, array, json, browser, event, message, mask, type, element, and gc utilities.
 */

// Re-export shared utilities
export * from '@natural-js/shared';

// String utilities
export * from './string';
export { string } from './string';

// Date utilities
export * from './date';
export { date } from './date';

// Array utilities
export * from './array';
export { array } from './array';

// JSON utilities
export * from './json';
export { json } from './json';

// Browser utilities
export * from './browser';
export { browser } from './browser';

// Event utilities
export * from './event';
export { event } from './event';

// Message utilities
export * from './message';
export { message } from './message';

// Mask utilities
export * from './mask';
export { mask, Mask } from './mask';

// Type utilities
export * from './type';
export {
  typeUtils,
  isString,
  isNumeric,
  isPlainObject,
  isEmptyObject,
  isArray,
  isArraylike,
  isNaturalElement,
  isElement,
  isFunction,
  isBoolean,
  isNullish,
  isDate,
  isRegExp,
  toSelector,
} from './type';

// Element utilities
export * from './element';
export { element } from './element';

// Garbage collection utilities
export * from './gc';
export { gc } from './gc';

// Configuration system
export * from './config';
export {
  defineConfig,
  getConfig,
  updateConfig,
  resetConfig,
  getModuleConfig,
  getMessage,
  isValidLocale,
} from './config';

// Re-export config types explicitly for dependent packages
export type {
  NaturalConfig,
  NaturalConfigOverride,
  CoreConfig,
  ArchitectureConfig,
  DataConfig,
  UIConfig,
  UIShellConfig,
  TemplateConfig,
  CodeConfig,
  CommConfig,
  ContConfig,
  FilterConfig,
  FormatterConfig,
  ValidatorConfig,
  AlertConfig,
  GridConfig,
  ConfigLocale,
  ConfigLocaleMessages,
} from './config';

// Version
export const CORE_VERSION = '2.0.0-alpha.0';

